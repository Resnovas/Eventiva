/**
 * @file apps/server/tests/telemetry-live.spec.ts
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { gunzipSync } from 'node:zlib';
import { afterEach, vi } from 'vitest';
import { describe, expect, it } from '@effect/vitest';
import { CallerIdentity } from '@eventiva/contracts/caller';
import { Flags, safeDefault } from '@eventiva/contracts/flags';
import { TelemetrySink, type TelemetryRecord } from '@eventiva/contracts/observability';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { type TelemetryExportBinding } from '@eventiva/contracts/telemetry-export';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { memory } from '@eventiva/integrations.sql/sqlite';
import { telemetryConsentStore } from '@eventiva/integrations.sql/telemetry-consent';
import { ConfigProvider, Context, Effect, Exit, Layer, Schema } from 'effect';
import {
    requestTelemetryLayer,
    updateTelemetryConsent,
    telemetryTenants,
    type TelemetrySession,
} from '../src/telemetry-live.ts';
import { fileURLToPath } from 'node:url';

const caller = Schema.decodeSync(CallerIdentity)({
    subject: '019a95c0-0000-7000-8000-000000000021',
    session: '019a95c0-0000-7000-8000-000000000031',
    tenant: telemetryTenants.development.tenantId,
    kind: 'human',
});
const session: TelemetrySession = {
    caller,
    issuer: 'https://issuer.example.test',
    sessionExpiresAt: 8_000_000_000_000,
};
const binding: TelemetryExportBinding = {
    ...telemetryTenants.development,
    moduleId: 'platform.telemetry',
    moduleVersion: '1.0.0',
    generation: 1,
    profile: 'baseline',
    operation: 'ordinary',
    purpose: 'diagnostics',
};
const policy = { messages: { 'telemetry.probe': 'Telemetry connectivity probe.' } };
const record: TelemetryRecord = {
    version: 1,
    signal: 'span',
    timestamp: '2026-11-18T08:00:00.000Z',
    level: 'INFO',
    code: 'telemetry.probe',
    text: 'PRIVATE-CANARY',
    profile: 'baseline',
    traceId: '1234567890abcdef1234567890abcdef',
    spanId: '1234567890abcdef',
    parentSpanId: '',
    attributes: { private: 'PRIVATE-CANARY' },
    durationMs: 17,
    outcome: 'succeeded',
};
const defaults = {
    EVENTIVA_ENVIRONMENT: 'development',
    POSTHOG_API_KEY: 'phc_public_test_only',
    TELEMETRY_CORRELATION_ROOT_KEY: '01'.repeat(32),
};
/** Explicit test settings never inherit credentials or deployment state from the executing orb. */
const configured = (values: Record<string, string> = defaults) =>
    Effect.withConfigProvider(ConfigProvider.fromMap(new Map(Object.entries(values)), { pathDelim: '_' }));
/** Build the actual migrated consent store rather than an always-accepting consent fixture. */
const storage = Layer.unwrapEffect(
    load(fileURLToPath(new URL('../../../storage/migrations/sqlite', import.meta.url))).pipe(
        Effect.flatMap(
            /** Apply the reviewed migration history before exposing an authoritative consent service. */ (
                migrations
            ) => migrate('sqlite', migrations)
        ),
        Effect.as(telemetryConsentStore)
    )
).pipe(Layer.provideMerge(memory()), Layer.provide(Layer.succeed(CurrentTenant, { id: binding.tenantId })));

afterEach(
    /** Transport stubs are test-only and must never hide network use in another suite. */ () => vi.unstubAllGlobals()
);

describe('non-production request export composition', /** Exercise real SQL consent plus both actual serializers without contacting a vendor using fixture credentials. */ () => {
    it.scoped(
        'caps an explicit consent grant at session expiry and rejects expired, stale and unauthenticated changes',
        /** Read actual SQL results so an unconditional accepting consent callback cannot satisfy the contract. */ () =>
            Effect.gen(
                /** Independently chosen short deadline differs from the command hour cap. */ function* () {
                    const short = Effect.succeed({ ...session, sessionExpiresAt: 5000 });
                    expect(yield* updateTelemetryConsent(binding, short, true, null)).toEqual({
                        expiresAt: 5000,
                        version: 0,
                    });
                    expect(yield* updateTelemetryConsent(binding, short, false, 0)).toEqual({
                        expiresAt: 0,
                        version: 1,
                    });
                    expect(Exit.isFailure(yield* Effect.exit(updateTelemetryConsent(binding, short, true, 0)))).toBe(
                        true
                    );
                    expect(
                        Exit.isFailure(
                            yield* Effect.exit(
                                updateTelemetryConsent(
                                    binding,
                                    Effect.succeed({ ...session, sessionExpiresAt: 0 }),
                                    true,
                                    1
                                )
                            )
                        )
                    ).toBe(true);
                    const denied = yield* Effect.flip(
                        updateTelemetryConsent(binding, Effect.fail('PRIVATE-ISSUER-CANARY'), true, 1)
                    );
                    expect(String(denied)).not.toContain('PRIVATE-ISSUER-CANARY');
                }
            ).pipe(Effect.provide(storage), configured())
    );

    it.scopedLive(
        'denies missing consent, exports minimized events/traces, then blocks the same sink after durable revocation',
        /** Assert serialized output rather than assuming adapter acquisition means ingestion. */ () =>
            Effect.gen(
                /** The controlled identity seam represents verified OIDC output; production authentication is a separate entrypoint requirement. */ function* () {
                    const bodies: Array<{ url: string; body: string }> = [];
                    vi.stubGlobal(
                        'fetch',
                        vi.fn<typeof fetch>(
                            /** Capture compressed SDK and ordinary OTLP requests, with no external network path. */ async (
                                url,
                                options
                            ) => {
                                const bytes = Buffer.from(await new Response(options?.body).arrayBuffer());
                                bodies.push({
                                    url: String(url),
                                    body: (bytes[0] === 31 && bytes[1] === 139 ? gunzipSync(bytes) : bytes).toString(
                                        'utf8'
                                    ),
                                });
                                return new Response('{}', { status: 200 });
                            }
                        )
                    );
                    const layer = requestTelemetryLayer(binding, Effect.succeed(session), true, policy);
                    expect(Exit.isFailure(yield* Effect.exit(Layer.build(layer)))).toBe(true);
                    expect(bodies).toHaveLength(0);
                    const granted = yield* updateTelemetryConsent(binding, Effect.succeed(session), true, null);
                    expect(granted?.version).toBe(0);
                    expect(granted?.expiresAt).toBeLessThanOrEqual(Date.now() + 3_600_000);
                    const sink = Context.get(yield* Layer.build(layer), TelemetrySink);
                    yield* sink.write(record);
                    yield* sink.write({ ...record, signal: 'log' });
                    yield* sink.flush;
                    expect(bodies).toHaveLength(3);
                    expect(
                        bodies.filter(
                            /** Separate OTLP spans from diagnostic events by the actual endpoint. */ (item) =>
                                item.url === 'https://eu.i.posthog.com/i/v1/traces'
                        )
                    ).toHaveLength(1);
                    const wire = bodies
                        .map(/** Inspect sanitized payloads only, never authorization headers. */ (item) => item.body)
                        .join('\n');
                    expect(wire).toContain('eventiva.telemetry.span');
                    expect(wire).toContain('eventiva.telemetry.log');
                    expect(wire).toContain('posthog.distinct_id');
                    expect(wire).toContain('$session_id');
                    for (const raw of ['PRIVATE-CANARY', caller.subject, caller.session, session.issuer])
                        expect(wire).not.toContain(raw);
                    expect(yield* updateTelemetryConsent(binding, Effect.succeed(session), false, 0)).toEqual({
                        version: 1,
                        expiresAt: 0,
                    });
                    expect(Exit.isFailure(yield* Effect.exit(sink.write(record)))).toBe(true);
                    expect(Exit.isFailure(yield* Effect.exit(sink.flush))).toBe(true);
                    expect(bodies).toHaveLength(3);
                }
            ).pipe(
                Effect.provide(
                    Layer.merge(
                        storage,
                        Layer.succeed(Flags, {
                            /** Only the two remotely representable telemetry aliases may match this host-owned dev target. */ evaluate:
                                (flag, context) => {
                                    expect(flag.key).toMatch(/^eventiva-telemetry-/);
                                    expect(context).toEqual({
                                        targetingKey: binding.destinationId,
                                        attributes: { eventiva_environment: 'development' },
                                    });
                                    return Effect.succeed({ ...safeDefault(flag), value: true, fallback: false });
                                },
                        })
                    )
                ),
                configured()
            )
    );

    it.scopedLive(
        'keeps every independent local, environment, classification, identity, remote and credential gate closed',
        /** An outbound trap makes accidental network access fail rather than count as a successful denial. */ () =>
            Effect.gen(
                /** Test gates with all other accepting dependencies present wherever the path reaches them. */ function* () {
                    const requests: string[] = [];
                    vi.stubGlobal(
                        'fetch',
                        vi.fn<typeof fetch>(
                            /** Do not send fixture credentials to the public internet, even for a regression. */ (
                                url
                            ) => {
                                requests.push(String(url));
                                return Promise.reject(new Error('unexpected network'));
                            }
                        )
                    );
                    const enabled = Flags.of({
                        /** Explicit policy only for this composition test, never wired into a local executable. */ evaluate:
                            (flag) => Effect.succeed({ ...safeDefault(flag), value: true }),
                    });
                    yield* updateTelemetryConsent(binding, Effect.succeed(session), true, null);
                    for (const scenario of [
                        { values: { ...defaults, telemetry_enabled: 'false' } },
                        { values: { ...defaults, telemetry_enabled: 'invalid' } },
                        { values: { ...defaults, EVENTIVA_ENVIRONMENT: 'production' } },
                        { values: { ...defaults, EVENTIVA_ENVIRONMENT: '' } },
                        { optIn: false },
                        { scope: { ...binding, destinationId: '019a95c0-0000-7000-8000-000000000012' } },
                        { scope: { ...binding, profile: 'vault' as const } },
                        { scope: { ...binding, operation: 'financial' as const } },
                        { who: { ...session, caller: { ...caller, tenant: telemetryTenants.staging.tenantId } } },
                        { who: { ...session, caller: { ...caller, kind: 'service' as const } } },
                        { values: { ...defaults, TELEMETRY_CORRELATION_ROOT_KEY: '' } },
                        { values: { ...defaults, POSTHOG_API_KEY: '' } },
                        { values: { ...defaults, POSTHOG_HOST: 'https://other.invalid' } },
                        { remote: false },
                    ]) {
                        const effect = Layer.build(
                            requestTelemetryLayer(
                                scenario.scope ?? binding,
                                Effect.succeed(scenario.who ?? session),
                                scenario.optIn ?? true,
                                policy
                            )
                        ).pipe(
                            Effect.provideService(
                                Flags,
                                scenario.remote === false
                                    ? {
                                          /** Remote denial must remain independent of local configuration and stored consent. */ evaluate:
                                              (flag) => Effect.succeed(safeDefault(flag)),
                                      }
                                    : enabled
                            )
                        );
                        expect(
                            Exit.isFailure(yield* Effect.exit(effect.pipe(configured(scenario.values ?? defaults))))
                        ).toBe(true);
                    }
                    expect(requests).toHaveLength(0);
                }
            ).pipe(Effect.provide(storage), configured())
    );
});
