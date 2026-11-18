/**
 * @file apps/server/src/telemetry-live.ts
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

import * as FetchHttpClient from '@effect/platform/FetchHttpClient';
import type { CallerIdentity } from '@eventiva/contracts/caller';
import { Flags } from '@eventiva/contracts/flags';
import { TenantId } from '@eventiva/contracts/ids';
import { TelemetrySink, TelemetrySinkFailure } from '@eventiva/contracts/observability';
import {
    CorrelationIssuer,
    TelemetryExportBinding,
    type CorrelationIdentity,
    type TelemetryExportPolicy,
    TelemetryConsent,
} from '@eventiva/contracts/telemetry-export';
import { options as postHogOptions, telemetryFlagKeys } from '@eventiva/integrations.posthog.server/flags';
import { postHogTelemetryLayer } from '@eventiva/integrations.posthog.server/telemetry';
import { otlpTelemetryLayer } from '@eventiva/integrations.telemetry.server/otlp';
import { rootCorrelationKeys, storedCorrelationLayer } from '@eventiva/integrations.telemetry.server/pseudonym';
import { telemetryConfig } from '@eventiva/runtime/telemetry';
import { governedCorrelationSinkLayer, pseudonymousCorrelationFlag } from '@eventiva/runtime/telemetry-correlation';
import { governedTelemetrySinkLayer, telemetryExportFlag } from '@eventiva/runtime/telemetry-export';
import { Clock, Config, Context, Effect, Layer, Option, Redacted, Schema } from 'effect';

/** Verified output seam for authenticateTokenSession; raw OIDC sub/headers are deliberately absent. */
export interface TelemetrySession {
    readonly caller: CallerIdentity;
    readonly issuer: string;
    readonly sessionExpiresAt: number;
}

/** Explicit local/staging tenant catalogue. Neither tenant is a production route or an implicit consent grant. */
export const telemetryTenants = {
    development: {
        tenantId: TenantId.make('019a95c0-0000-7000-8000-000000000001'),
        destinationId: '019a95c0-0000-7000-8000-000000000011',
    },
    staging: {
        tenantId: TenantId.make('019a95c0-0000-7000-8000-000000000002'),
        destinationId: '019a95c0-0000-7000-8000-000000000012',
    },
} as const;

/** Validate trusted deployment routing and immutable protection floors for both consent management and export. */
const admittedBinding = (hostBinding: TelemetryExportBinding) =>
    Effect.gen(
        /** Neither a raw request tenant nor an unknown/production environment may select the consent database. */ function* () {
            const environment = yield* Config.literal(
                'development',
                'staging'
            )('EVENTIVA_ENVIRONMENT').pipe(
                Effect.mapError(
                    /** Keep provider diagnostics and rejected values outside optional telemetry errors. */ () =>
                        new TelemetrySinkFailure({ reason: 'configuration' })
                )
            );
            const binding = yield* Schema.decode(TelemetryExportBinding)(hostBinding).pipe(
                Effect.mapError(
                    /** Reject malformed provenance without retaining caller data. */ () =>
                        new TelemetrySinkFailure({ reason: 'configuration' })
                )
            );
            const destination = telemetryTenants[environment];
            if (
                binding.tenantId !== destination.tenantId ||
                binding.destinationId !== destination.destinationId ||
                binding.operation !== 'ordinary' ||
                binding.profile === 'restricted' ||
                binding.profile === 'vault'
            )
                return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
            return { environment, destination, binding };
        }
    );

/** Convert verified canonical identity only; this is not token verification or a client-facing credential parser. */
const principalFor = (
    binding: TelemetryExportBinding,
    session: TelemetrySession
): Effect.Effect<CorrelationIdentity, TelemetrySinkFailure> => {
    if (
        session.caller.tenant !== binding.tenantId ||
        session.caller.kind !== 'human' ||
        session.caller.onBehalfOf !== undefined
    )
        return Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' }));
    return Effect.succeed({
        namespace: Redacted.make(session.issuer),
        subject: Redacted.make(session.caller.subject),
        session: Redacted.make(session.caller.session),
        expiresAt: session.sessionExpiresAt,
    });
};

/**
 * Trusted local consent command, not an HTTP action. Authenticate the subject again and compare the displayed revision.
 * Grants last at most one hour or the live session deadline. Revoke retains the row revision and needs no ingest key.
 */
export const updateTelemetryConsent = <E, R>(
    hostBinding: TelemetryExportBinding,
    currentSession: Effect.Effect<TelemetrySession, E, R>,
    grant: boolean,
    expectedVersion: number | null
) =>
    Effect.gen(
        /** Only the authenticated session may manage its own exact binding; no caller-supplied subject is accepted. */ function* () {
            const { binding } = yield* admittedBinding(hostBinding);
            const session = yield* currentSession.pipe(
                Effect.mapError(
                    /** Avoid emitting raw OIDC/SQL failure details through operator output. */ () =>
                        new TelemetrySinkFailure({ reason: 'unavailable' })
                )
            );
            const identity = yield* principalFor(binding, session);
            const now = yield* Clock.currentTimeMillis;
            if (identity.expiresAt <= now) return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
            const store = yield* TelemetryConsent;
            yield* store.put(
                binding,
                identity,
                grant === true ? Math.min(now + 3_600_000, identity.expiresAt) : 0,
                expectedVersion
            );
            return yield* store.get(binding, identity);
        }
    );

/**
 * Request-scoped non-production export below central telemetryLayer. Never attach this to a mixed global logger.
 * Supply SQL TelemetryConsent and the normal remote Flags service. currentSession must authenticate again on each
 * evaluation using trusted tenant routing, live SQL session/membership and the server-configured OIDC expectations.
 * Optional acquisition failure must omit telemetry, not retry/replay the business effect.
 */
export const requestTelemetryLayer = <E, R>(
    hostBinding: TelemetryExportBinding,
    currentSession: Effect.Effect<TelemetrySession, E, R>,
    optIn: boolean,
    policy: TelemetryExportPolicy
): Layer.Layer<TelemetrySink, TelemetrySinkFailure, R | TelemetryConsent | Flags> =>
    Layer.scoped(
        TelemetrySink,
        Effect.gen(
            /** Keep raw identity resolution and credentials private to one request-owned scope. */ function* () {
                if (optIn !== true) return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                const local = yield* telemetryConfig.pipe(
                    Effect.mapError(
                        /** Invalid local opt-out configuration must not contact any remote provider. */ () =>
                            new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                if (!local.enabled) return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                const { binding, environment, destination } = yield* admittedBinding(hostBinding);
                const flags = yield* Flags;
                const targeted = Flags.of({
                    /** Host-owned deployment targeting cannot be replaced by a client-supplied flag context. */
                    evaluate: (flag) =>
                        flags.evaluate(
                            { ...flag, key: telemetryFlagKeys[flag.key] ?? flag.key },
                            {
                                targetingKey: destination.destinationId,
                                attributes: { eventiva_environment: environment },
                            }
                        ),
                });
                if (
                    !(yield* targeted.evaluate(telemetryExportFlag)).value ||
                    !(yield* targeted.evaluate(pseudonymousCorrelationFlag)).value
                )
                    return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                const identity = currentSession.pipe(
                    Effect.mapError(
                        /** OIDC and SQL causes never cross the optional telemetry boundary. */ () =>
                            new TelemetrySinkFailure({ reason: 'unavailable' })
                    ),
                    Effect.flatMap(
                        /** Bind canonical Eventiva IDs, not raw sub, email, token sid or untrusted tenant claims. */ (
                            session
                        ) => principalFor(binding, session)
                    )
                );
                const principal = yield* identity;
                const keys = yield* rootCorrelationKeys;
                const authority = yield* Layer.build(storedCorrelationLayer(binding, principal, keys, identity));
                const token = yield* Context.get(authority, CorrelationIssuer).issue(true);
                const settings = yield* postHogOptions.pipe(
                    Effect.mapError(
                        /** Discard invalid credential/host configuration rather than exposing Config diagnostics. */ () =>
                            new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                if (
                    Option.isNone(settings) ||
                    settings.value.host !== 'https://eu.i.posthog.com' ||
                    !Redacted.value(settings.value.apiKey).trim()
                )
                    return yield* new TelemetrySinkFailure({ reason: 'configuration' });
                const events = Context.get(
                    yield* Layer.build(
                        governedTelemetrySinkLayer(binding, policy).pipe(
                            Layer.provide(postHogTelemetryLayer(settings.value, binding))
                        )
                    ).pipe(Effect.provide(authority), Effect.provideService(Flags, targeted)),
                    TelemetrySink
                );
                const traces = Context.get(
                    yield* Layer.build(
                        governedCorrelationSinkLayer(binding, policy, { optIn, correlation: token }).pipe(
                            Layer.provide(
                                otlpTelemetryLayer(
                                    binding,
                                    Config.succeed({
                                        enabled: true,
                                        endpoint: Redacted.make(`${settings.value.host}/i/v1/traces`),
                                        headers: Redacted.make(
                                            JSON.stringify({
                                                Authorization: `Bearer ${Redacted.value(settings.value.apiKey)}`,
                                            })
                                        ),
                                        timeoutMs: 1000,
                                    })
                                ).pipe(Layer.provide(FetchHttpClient.layer))
                            )
                        )
                    ).pipe(Effect.provide(authority), Effect.provideService(Flags, targeted)),
                    TelemetrySink
                );
                return TelemetrySink.of({
                    /** Reuse the existing minimizers and live release gates separately for diagnostic events and OTLP spans. */
                    write: (record) =>
                        events.write(record).pipe(
                            Effect.zipRight(record.signal === 'span' ? traces.write(record) : Effect.void),
                            // Export authorization performs SQL IO; tracing it would recursively enqueue exporter-internal spans.
                            Effect.withTracerEnabled(false)
                        ),
                    /** Flush is a fresh authorization barrier, not a business span or replay backlog. */
                    flush: events.flush.pipe(Effect.zipRight(traces.flush), Effect.withTracerEnabled(false)),
                });
            }
        )
    );
