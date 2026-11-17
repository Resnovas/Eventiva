/**
 * @file tests/integrations/posthog-server/src/telemetry.spec.ts
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

import { describe, expect, it } from '@effect/vitest';
import { TenantId } from '@eventiva/contracts/ids';
import type { TelemetryRecord } from '@eventiva/contracts/observability';
import { TelemetryExportProvider, type TelemetryExportBinding } from '@eventiva/contracts/telemetry-export';
import { postHogTelemetryLayer } from '@eventiva/integrations.posthog.server/telemetry';
import { Deferred, Effect, Fiber, Redacted, Schema } from 'effect';
import { afterEach, vi } from 'vitest';
import { gunzipSync } from 'node:zlib';
import { PostHog } from 'posthog-node';

const binding: TelemetryExportBinding = {
    tenantId: Schema.decodeSync(TenantId)('11111111-1111-4111-8111-111111111111'),
    moduleId: 'example.logger',
    moduleVersion: '1.0.0',
    generation: 3,
    profile: 'baseline',
    operation: 'ordinary',
    purpose: 'diagnostics',
    destinationId: '99999999-9999-4999-8999-999999999999',
};
const settings = { apiKey: Redacted.make('phc_local_fixture'), host: 'https://telemetry.invalid' };
const record: TelemetryRecord = {
    version: 1,
    signal: 'span',
    timestamp: '2026-11-17T01:02:03.004Z',
    level: 'INFO',
    code: 'sample.completed',
    text: 'private-canary',
    profile: 'baseline',
    traceId: 'a'.repeat(32),
    spanId: 'b'.repeat(16),
    parentSpanId: 'c'.repeat(16),
    attributes: { secret: 'private-canary' },
    durationMs: 47,
    outcome: 'succeeded',
};

afterEach(
    /** Restore global transport and SDK spies so one scenario cannot affect another's network behavior. */ () => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    }
);

describe('PostHog telemetry provider', /** Register real-SDK transport, privacy and lifecycle regressions. */ () => {
    it.effect(
        'sends correlated minimal events through the real SDK without user identity, text or attributes',
        /** Exercise the actual SDK's serialized export projection. */ () =>
            Effect.gen(
                /** Inspect outbound request bodies rather than only the SDK capture arguments. */ function* () {
                    const bodies: Array<string> = [];
                    vi.stubGlobal(
                        'fetch',
                        vi.fn<typeof fetch>(
                            /** Decode SDK compression locally while preventing external network access. */ async (
                                _url,
                                options
                            ) => {
                                const bytes = Buffer.from(await new Response(options?.body).arrayBuffer());
                                bodies.push(
                                    (bytes[0] === 31 && bytes[1] === 139 ? gunzipSync(bytes) : bytes).toString('utf8')
                                );
                                return new Response('{}', { status: 200 });
                            }
                        )
                    );
                    yield* Effect.gen(
                        /** Deliver both supported signals through one scoped provider. */ function* () {
                            const remote = yield* TelemetryExportProvider;
                            yield* remote.write(binding, record);
                            yield* remote.write(binding, { ...record, signal: 'log' });
                            yield* remote.flush(binding);
                        }
                    ).pipe(Effect.provide(postHogTelemetryLayer(settings, binding)));
                    expect(bodies).toHaveLength(2);
                    const wire = Schema.parseJson(
                        Schema.Struct({
                            batch: Schema.Array(
                                Schema.Struct({
                                    event: Schema.String,
                                    distinct_id: Schema.String,
                                    properties: Schema.Record({
                                        key: Schema.String,
                                        value: Schema.Union(Schema.String, Schema.Number, Schema.Boolean),
                                    }),
                                })
                            ),
                        })
                    );
                    expect(
                        bodies.map(
                            /** Validate the wire envelope before comparing projected event properties. */ (body) =>
                                Schema.decodeUnknownSync(wire)(body).batch
                        )
                    ).toEqual([
                        [
                            expect.objectContaining({
                                event: 'eventiva.telemetry.span',
                                distinct_id: binding.destinationId,
                                properties: expect.objectContaining({
                                    code: 'sample.completed',
                                    trace_id: 'a'.repeat(32),
                                    span_id: 'b'.repeat(16),
                                    parent_span_id: 'c'.repeat(16),
                                    duration_ms: 47,
                                    outcome: 'succeeded',
                                    $process_person_profile: false,
                                    $geoip_disable: true,
                                }),
                            }),
                        ],
                        [
                            expect.objectContaining({
                                event: 'eventiva.telemetry.log',
                                distinct_id: binding.destinationId,
                            }),
                        ],
                    ]);
                    expect(bodies.join('')).not.toContain('private-canary');
                    expect(bodies.join('')).not.toContain(binding.tenantId);
                    expect(bodies.join('')).not.toContain(binding.moduleId);
                }
            )
    );

    it.effect(
        'rejects mismatched tenant, module, version, generation, purpose, profile and destination',
        /** Exercise exact binding checks before SDK delivery. */ () =>
            Effect.gen(
                /** Alter each authority dimension independently and verify no request is emitted. */ function* () {
                    const transport = vi.fn<typeof fetch>(
                        /** Supply a harmless response if an unexpected request escapes validation. */ async () =>
                            new Response('{}', { status: 200 })
                    );
                    vi.stubGlobal('fetch', transport);
                    yield* Effect.gen(
                        /** Attempt writes and flushes under substituted bindings, then malformed records. */ function* () {
                            const remote = yield* TelemetryExportProvider;
                            for (const candidate of [
                                {
                                    ...binding,
                                    tenantId: Schema.decodeSync(TenantId)('22222222-2222-4222-8222-222222222222'),
                                },
                                { ...binding, moduleId: 'other' },
                                { ...binding, moduleVersion: '2.0.0' },
                                { ...binding, generation: 4 },
                                { ...binding, purpose: 'other' },
                                { ...binding, profile: 'sensitive' as const },
                                { ...binding, operation: 'protected' as const },
                                { ...binding, destinationId: '88888888-8888-4888-8888-888888888888' },
                            ]) {
                                expect((yield* Effect.flip(remote.write(candidate, record))).reason).toBe(
                                    'unavailable'
                                );
                                expect((yield* Effect.flip(remote.flush(candidate))).reason).toBe('unavailable');
                            }
                            expect(
                                (yield* Effect.flip(remote.write(binding, { ...record, profile: 'vault' }))).reason
                            ).toBe('unavailable');
                            expect(
                                (yield* Effect.flip(remote.write(binding, { ...record, traceId: 'secret' }))).reason
                            ).toBe('invalid-record');
                            expect((yield* Effect.flip(remote.flush({ ...binding, generation: -1 }))).reason).toBe(
                                'configuration'
                            );
                        }
                    ).pipe(Effect.provide(postHogTelemetryLayer(settings, binding)));
                    expect(transport).not.toHaveBeenCalled();
                }
            )
    );

    it.effect(
        'reports SDK-swallowed HTTP failure and never retries or flushes a failed payload on shutdown',
        /** Exercise bounded failure reporting without retrying revoked or failed payloads. */ () =>
            Effect.gen(
                /** Simulate an HTTP failure whose private response must not escape in the public error. */ function* () {
                    const transport = vi.fn<typeof fetch>(
                        /** Return a canary-bearing failure to detect raw response leakage. */ async () =>
                            new Response('private-server-canary', { status: 503 })
                    );
                    vi.stubGlobal('fetch', transport);
                    yield* Effect.gen(
                        /** Attempt delivery and flush before scope cleanup to expose SDK retries or retained payloads. */ function* () {
                            const remote = yield* TelemetryExportProvider;
                            const error = yield* Effect.flip(remote.write(binding, record));
                            expect(error.reason).toBe('write');
                            expect(JSON.stringify(error)).not.toContain('private-server-canary');
                            yield* remote.flush(binding);
                        }
                    ).pipe(Effect.provide(postHogTelemetryLayer(settings, binding)));
                    expect(transport).toHaveBeenCalledTimes(1);
                }
            )
    );

    it.effect(
        'rejects invalid configuration without making a request',
        /** Exercise secure provider acquisition defaults. */ () =>
            Effect.gen(
                /** Reject insecure endpoints, protected bindings and malformed credentials before SDK use. */ function* () {
                    const transport = vi.fn<typeof fetch>();
                    vi.stubGlobal('fetch', transport);
                    for (const [options, current] of [
                        [{ ...settings, host: 'http://telemetry.invalid' }, binding],
                        [settings, { ...binding, profile: 'vault' }],
                        [settings, { ...binding, profile: 'restricted' }],
                        [settings, { ...binding, operation: 'decrypting' }],
                        [{ ...settings, apiKey: Redacted.make('') }, binding],
                        [settings, { ...binding, generation: -1 }],
                    ] as const) {
                        expect(
                            (yield* Effect.flip(
                                TelemetryExportProvider.pipe(Effect.provide(postHogTelemetryLayer(options, current)))
                            )).reason
                        ).toBe('configuration');
                    }
                    expect(transport).not.toHaveBeenCalled();
                }
            )
    );

    it.effect(
        'interrupts network IO and rejects contending writes rather than queueing authorized payloads',
        /** Exercise transport cancellation and single-flight admission. */ () =>
            Effect.gen(
                /** Keep one network request pending so contention and interruption are deterministic. */ function* () {
                    const started = yield* Deferred.make<void>();
                    let aborted = false;
                    const transport = vi.fn<typeof fetch>(
                        /** Model a pending request that settles only when its abort signal fires. */ (_url, options) =>
                            new Promise(
                                /** Notify the test of network entry and attach cancellation handling. */ (
                                    _resolve,
                                    reject
                                ) => {
                                    Effect.runSync(Deferred.succeed(started, undefined));
                                    options?.signal?.addEventListener(
                                        'abort',
                                        /** Record cancellation and reject with a private transport cause. */ () => {
                                            aborted = true;
                                            reject(new Error('private-network-canary'));
                                        }
                                    );
                                }
                            )
                    );
                    vi.stubGlobal('fetch', transport);
                    yield* Effect.gen(
                        /** Reject a contending write, then interrupt the sole admitted request. */ function* () {
                            const remote = yield* TelemetryExportProvider;
                            const fiber = yield* remote.write(binding, record).pipe(Effect.fork);
                            yield* Deferred.await(started);
                            expect((yield* Effect.flip(remote.write(binding, record))).reason).toBe('unavailable');
                            yield* Fiber.interrupt(fiber);
                            yield* remote.flush(binding);
                        }
                    ).pipe(Effect.provide(postHogTelemetryLayer(settings, binding)));
                    expect(aborted).toBe(true);
                    expect(transport).toHaveBeenCalledTimes(1);
                }
            )
    );

    it.effect(
        'closes handles on disposal and acquires independent providers on replacement',
        /** Exercise provider ownership across replacement. */ () =>
            Effect.gen(
                /** Retain an expired handle and compare it with a newly scoped provider. */ function* () {
                    const transport = vi.fn<typeof fetch>(
                        /** Accept only the live provider's expected request without real network IO. */ async () =>
                            new Response('{}', { status: 200 })
                    );
                    vi.stubGlobal('fetch', transport);
                    const old = yield* TelemetryExportProvider.pipe(
                        Effect.provide(postHogTelemetryLayer(settings, binding))
                    );
                    expect((yield* Effect.flip(old.write(binding, record))).reason).toBe('unavailable');
                    expect((yield* Effect.flip(old.flush(binding))).reason).toBe('unavailable');
                    yield* Effect.gen(
                        /** Demonstrate that replacement acquisition does not revive the disposed handle. */ function* () {
                            const next = yield* TelemetryExportProvider;
                            yield* next.write(binding, record);
                        }
                    ).pipe(Effect.provide(postHogTelemetryLayer(settings, binding)));
                    expect(transport).toHaveBeenCalledTimes(1);
                }
            )
    );

    it.effect(
        'retains cancellation through delayed SDK preparation and refuses replacement work until settlement',
        /** Exercise interruption before the SDK has entered its network transport. */ () =>
            Effect.gen(
                /** Delay SDK preparation to verify cancellation survives until the eventual fetch. */ function* () {
                    /** Release SDK preparation once the pending capture has been interrupted. */
                    let release: () => void =
                        /** Provide an inert initial release until the promise executor installs the resolver. */ () =>
                            undefined;
                    const gate = new Promise<void>(
                        /** Retain the preparation resolver for deterministic interruption ordering. */ (resolve) => {
                            release = resolve;
                        }
                    );
                    const prepared = yield* Deferred.make<void>();
                    const capture = PostHog.prototype.captureImmediate;
                    vi.spyOn(PostHog.prototype, 'captureImmediate').mockImplementation(
                        /** Pause before delegating to real SDK delivery, preserving its receiver and payload. */ async function (
                            this: PostHog,
                            props
                        ) {
                            Effect.runSync(Deferred.succeed(prepared, undefined));
                            await gate;
                            return capture.call(this, props);
                        }
                    );
                    let delivered = 0;
                    vi.stubGlobal(
                        'fetch',
                        vi.fn<typeof fetch>(
                            /** Reject a request carrying the retained abort signal before counting delivery. */ async (
                                _url,
                                options
                            ) => {
                                if (options?.signal?.aborted) throw new Error('aborted-local-fixture');
                                delivered++;
                                return new Response('{}', { status: 200 });
                            }
                        )
                    );
                    yield* Effect.gen(
                        /** Interrupt during preparation and reject replacement work until the original capture settles. */ function* () {
                            const remote = yield* TelemetryExportProvider;
                            const fiber = yield* remote.write(binding, record).pipe(Effect.fork);
                            yield* Deferred.await(prepared);
                            yield* Fiber.interrupt(fiber);
                            expect((yield* Effect.flip(remote.write(binding, record))).reason).toBe('unavailable');
                            // Resume only after interruption so a lost abort signal would produce an observable delivery.
                            release();
                        }
                    ).pipe(Effect.provide(postHogTelemetryLayer(settings, binding)));
                    expect(delivered).toBe(0);
                }
            )
    );

    it.effect(
        'maps rejected SDK delivery and cleanup to bounded failures without retaining raw causes',
        /** Exercise private-cause redaction for delivery and finalization failures. */ () =>
            Effect.gen(
                /** Inject separate SDK rejections so neither public error path can retain raw exception text. */ function* () {
                    const capture = vi
                        .spyOn(PostHog.prototype, 'captureImmediate')
                        .mockRejectedValue(new Error('private-sdk-canary'));
                    yield* Effect.gen(
                        /** Inspect the typed delivery failure while the scoped provider is still available. */ function* () {
                            const remote = yield* TelemetryExportProvider;
                            const failure = yield* Effect.flip(remote.write(binding, record));
                            expect(failure.reason).toBe('write');
                            expect(JSON.stringify(failure)).not.toContain('private-sdk-canary');
                        }
                    ).pipe(Effect.provide(postHogTelemetryLayer(settings, binding)));
                    capture.mockRestore();
                    vi.spyOn(PostHog.prototype, 'shutdown').mockRejectedValue(new Error('private-shutdown-canary'));
                    const result = yield* TelemetryExportProvider.pipe(
                        Effect.provide(postHogTelemetryLayer(settings, binding)),
                        Effect.exit
                    );
                    expect(result._tag).toBe('Failure');
                    expect(JSON.stringify(result)).not.toContain('private-shutdown-canary');
                }
            )
    );
});
