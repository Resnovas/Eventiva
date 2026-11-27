/**
 * @file tests/telemetry/src/export.spec.ts
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
import { Flags, FlagsSafeDefaults, safeDefault } from '@eventiva/contracts/flags';
import { TenantId } from '@eventiva/contracts/ids';
import { TelemetryRecord, TelemetrySink, TelemetrySinkFailure } from '@eventiva/contracts/observability';
import {
    TelemetryExportAuthority,
    TelemetryExportBinding,
    TelemetryExportDeny,
    TelemetryExportPolicy,
    TelemetryExportProvider,
} from '@eventiva/contracts/telemetry-export';
import { governedTelemetrySinkLayer } from '@eventiva/runtime/telemetry-export';
import { telemetryLayer, TelemetryControl } from '@eventiva/runtime/telemetry';
import { Config, Context, Deferred, Effect, Exit, Fiber, Layer, Schema, Scope } from 'effect';

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
const policy: TelemetryExportPolicy = { messages: { 'sample.completed': 'Completed.' } };
const record: TelemetryRecord = {
    version: 1,
    signal: 'log',
    timestamp: '2026-11-17T01:02:03.004Z',
    level: 'INFO',
    code: 'sample.completed',
    text: 'private-canary',
    profile: 'baseline',
    traceId: 'a'.repeat(32),
    spanId: 'b'.repeat(16),
    parentSpanId: '',
    attributes: { secret: 'private-canary' },
    durationMs: 0,
    outcome: 'none',
};
const enabled = Layer.succeed(Flags, {
    /**
     * Enable the requested flag without changing its other safe-default metadata.
     *
     * @param flag - Flag definition the sink asks about.
     * @returns An effect yielding the safe-default evaluation with its value switched on.
     */
    evaluate: (flag) => Effect.succeed({ ...safeDefault(flag), value: true }),
});
const allow = Layer.succeed(TelemetryExportAuthority, {
    /**
     * Model a currently valid export grant independently of transport.
     *
     * @returns An effect that grants every export request.
     */
    authorize: () => Effect.void,
});
/**
 * Substitute an independent transport to verify projection without coupling runtime to a vendor.
 *
 * @param records - Array that receives every record the provider is asked to write.
 * @returns A provider layer that records writes and flushes without a network.
 */
const provider = (records: Array<TelemetryRecord>) =>
    Layer.succeed(TelemetryExportProvider, {
        /**
         * Retain exactly what crosses the provider boundary for privacy assertions.
         *
         * @param _binding - Export scope of the write, unused by this provider.
         * @param value - Projected record that crossed the provider boundary.
         * @returns An effect that appends the record when it runs.
         */
        write: (_binding, value) =>
            Effect.sync(
                /** Capture delivery at execution time rather than effect construction. */ () => {
                    records.push(value);
                }
            ),
        /**
         * Complete a transport flush without adding records or accessing a network.
         *
         * @returns An effect that completes immediately.
         */
        flush: () => Effect.void,
    });

describe('governed telemetry export', /** Register vendor-independent export authorization and privacy regressions. */ () => {
    // Cross both adapter boundaries with both operations; the untouched control prevents vacuous universal denial.
    for (const adapter of ['control', 'authority', 'provider'] as const) {
        for (const operation of ['write', 'flush'] as const) {
            it.effect(
                `preserves admitted export scope after ${adapter} mutation during ${operation}`,
                /**
                 * Adapter-owned views cannot widen later records or replace the original baseline scope.
                 *
                 * @returns The scenario that corrupts one adapter view and checks every later release.
                 */
                () =>
                    Effect.gen(
                        /** Compare asymmetric profiles and all delivered bindings through the public sink. */ function* () {
                            // Collect outside the sink scope so shutdown cannot conceal a late widened release.
                            const records: TelemetryRecord[] = [];
                            const observed: TelemetryExportBinding[] = [];
                            let changed = false;
                            /**
                             * Mutate the first selected adapter view, never the fixture's trusted input.
                             *
                             * @param scope - Binding view the adapter received, which may be corrupted in place.
                             * @param source - Adapter boundary that produced the view: control, authority or provider.
                             * @param phase - Operation the view belongs to: write or flush.
                             */
                            const inspect = (scope: TelemetryExportBinding, source: string, phase: string) => {
                                // Snapshot before corruption so the expectation cannot alias the adapter's later writes.
                                observed.push({ ...scope });
                                if (!changed && source === adapter && phase === operation) {
                                    Object.assign(scope, { profile: 'sensitive', purpose: 'changed', generation: 99 });
                                    changed = true;
                                }
                            };
                            yield* Effect.gen(
                                /** Mutation must neither admit sensitive records nor disable baseline delivery. */ function* () {
                                    const sink = yield* TelemetrySink;
                                    // First establish a valid release; the defect concerns reuse, not invalid acquisition.
                                    if (operation === 'flush') yield* sink.flush;
                                    else yield* sink.write(record);
                                    expect(
                                        (yield* Effect.flip(sink.write({ ...record, profile: 'sensitive' }))).reason
                                    ).toBe('unavailable');
                                    yield* sink.write(record);
                                    yield* sink.flush;
                                }
                            ).pipe(
                                Effect.provide(
                                    governedTelemetrySinkLayer(binding, policy).pipe(
                                        Layer.provide(enabled),
                                        Layer.provide(
                                            Layer.succeed(TelemetryExportAuthority, {
                                                /**
                                                 * Observe the exact current scope before attempting adapter corruption.
                                                 *
                                                 * @param scope - Binding view passed to the authority.
                                                 * @param phase - Release phase being authorized.
                                                 * @returns An effect that inspects the view and grants the request.
                                                 */
                                                authorize: (scope, phase) =>
                                                    Effect.sync(
                                                        /**
                                                         * Flush and record authorization expose separate disposable views.
                                                         *
                                                         * @returns Nothing; the view is recorded and possibly corrupted.
                                                         */
                                                        () =>
                                                            inspect(
                                                                scope,
                                                                'authority',
                                                                phase === 'flush' ? 'flush' : 'write'
                                                            )
                                                    ),
                                            })
                                        ),
                                        Layer.provide(
                                            Layer.succeed(TelemetryExportProvider, {
                                                /**
                                                 * Capture only the minimized record while corrupting the received binding.
                                                 *
                                                 * @param scope - Binding view passed to the provider.
                                                 * @param projected - Minimized record being delivered.
                                                 * @returns An effect that records the delivery and inspects the view.
                                                 */
                                                write: (scope, projected) =>
                                                    Effect.sync(
                                                        /** The mutation happens after the first release, not during setup. */ () => {
                                                            // Record before mutating the adapter view to distinguish release from subsequent reuse.
                                                            records.push(projected);
                                                            inspect(scope, 'provider', 'write');
                                                        }
                                                    ),
                                                /**
                                                 * A payload-free flush must not change subsequent release scope either.
                                                 *
                                                 * @param scope - Binding view passed to the provider flush.
                                                 * @returns An effect that inspects the view.
                                                 */
                                                flush: (scope) =>
                                                    Effect.sync(
                                                        /**
                                                         * Exercise flush through the same adapter boundary as transport.
                                                         *
                                                         * @returns Nothing; the view is recorded and possibly corrupted.
                                                         */
                                                        () => inspect(scope, 'provider', 'flush')
                                                    ),
                                            })
                                        )
                                    )
                                )
                            );
                            expect(records).toEqual(
                                Array(operation === 'write' ? 2 : 1).fill({
                                    ...record,
                                    text: 'Completed.',
                                    attributes: {},
                                })
                            );
                            expect(observed.length).toBeGreaterThan(0);
                            for (const scope of observed) expect(scope).toEqual(binding);
                            expect(changed).toBe(adapter !== 'control');
                        }
                    )
            );
        }
    }

    it.effect(
        'projects catalog text, drops every input attribute and preserves correlation with interchangeable providers',
        /**
         * Exercise the same safe projection for logs and spans.
         *
         * @returns The scenario that writes a log and a span carrying private data and checks the delivered projection.
         */
        () =>
            Effect.gen(
                /** Verify only catalog text and correlation survive delivery to an arbitrary provider. */ function* () {
                    // Both signals carry the same private canary, exposing signal-specific projection bypasses.
                    for (const signal of ['log', 'span'] as const) {
                        const records: Array<TelemetryRecord> = [];
                        yield* Effect.gen(
                            /** Write through the governed sink so assertions inspect the actual provider boundary. */ function* () {
                                const sink = yield* TelemetrySink;
                                yield* sink.write({ ...record, signal });
                                yield* sink.flush;
                            }
                        ).pipe(
                            Effect.provide(
                                governedTelemetrySinkLayer(binding, policy).pipe(
                                    Layer.provide(provider(records)),
                                    Layer.provide(allow),
                                    Layer.provide(enabled)
                                )
                            )
                        );
                        expect(records).toEqual([{ ...record, signal, text: 'Completed.', attributes: {} }]);
                        expect(JSON.stringify(records)).not.toContain('private-canary');
                    }
                }
            )
    );

    it.effect(
        'defaults off and supplies an explicit default-deny authority',
        /**
         * Exercise independent flag and authority denials.
         *
         * @returns The scenario that denies the flag and the authority in turn and expects no delivery.
         */
        () =>
            Effect.gen(
                /** Verify enabling one gate cannot bypass the other's safe default. */ function* () {
                    // Enable the other prerequisite in each case so an unrelated denial cannot mask this gate.
                    for (const dependencies of [
                        Layer.merge(FlagsSafeDefaults, allow),
                        Layer.merge(enabled, TelemetryExportDeny),
                    ]) {
                        const records: Array<TelemetryRecord> = [];
                        yield* Effect.gen(
                            /** Attempt both release paths while one required gate remains denied. */ function* () {
                                const sink = yield* TelemetrySink;
                                // Flush is independently authorized even when no write has been admitted.
                                expect((yield* Effect.flip(sink.write(record))).reason).toBe('unavailable');
                                expect((yield* Effect.flip(sink.flush)).reason).toBe('unavailable');
                            }
                        ).pipe(
                            Effect.provide(
                                governedTelemetrySinkLayer(binding, policy).pipe(
                                    Layer.provide(provider(records)),
                                    Layer.provide(dependencies)
                                )
                            )
                        );
                        expect(records).toEqual([]);
                    }
                }
            )
    );

    it.effect(
        'never lets downgraded record classification override a protected static binding',
        /**
         * Exercise classification downgrade resistance.
         *
         * @returns The scenario that binds each protected profile and operation and expects denial.
         */
        () =>
            Effect.gen(
                /** Bind protected contexts while submitting a baseline record that must not escape. */ function* () {
                    // Keep the caller's record ordinary; only the immutable binding supplies the protected floor.
                    const denied: ReadonlyArray<TelemetryExportBinding> = [
                        ...(['restricted', 'vault'] as const).map(
                            /**
                             * Vary the bound protection profile without changing the record.
                             *
                             * @param profile - Protected profile to bind.
                             * @returns A copy of the binding with that profile.
                             */
                            (profile) => ({
                                ...binding,
                                profile,
                            })
                        ),
                        ...(['protected', 'financial', 'emergency', 'decrypting'] as const).map(
                            /**
                             * Vary the bound operation independently of caller-supplied record classification.
                             *
                             * @param operation - Protected operation to bind.
                             * @returns A copy of the binding with that operation.
                             */
                            (operation) => ({
                                ...binding,
                                operation,
                            })
                        ),
                    ];
                    for (const current of denied) {
                        const records: Array<TelemetryRecord> = [];
                        yield* Effect.gen(
                            /** Confirm neither write nor flush can release this protected binding. */ function* () {
                                const sink = yield* TelemetrySink;
                                // A blocked record must not leave a usable flush path on the same protected handle.
                                expect((yield* Effect.flip(sink.write(record))).reason).toBe('unavailable');
                                expect((yield* Effect.flip(sink.flush)).reason).toBe('unavailable');
                            }
                        ).pipe(
                            Effect.provide(
                                governedTelemetrySinkLayer(current, policy).pipe(
                                    Layer.provide(provider(records)),
                                    Layer.provide(allow),
                                    Layer.provide(enabled)
                                )
                            )
                        );
                        expect(records).toEqual([]);
                    }
                }
            )
    );

    it.effect(
        'rejects unregistered codes, malformed records and record classification mismatch',
        /**
         * Exercise record validation before transport access.
         *
         * @returns The scenario that submits invalid records and expects no delivery.
         */
        () =>
            Effect.gen(
                /** Keep a recording provider available to detect accidental release of rejected records. */ function* () {
                    // Observe outside the sink's scope so disposal cannot hide a late or partial delivery.
                    const records: Array<TelemetryRecord> = [];
                    yield* Effect.gen(
                        /** Submit an unknown code, mismatched profile and malformed correlation identifier. */ function* () {
                            const sink = yield* TelemetrySink;
                            // Valid wire shape can still be unavailable by policy; malformed identity has a distinct failure.
                            expect((yield* Effect.flip(sink.write({ ...record, code: 'unregistered' }))).reason).toBe(
                                'unavailable'
                            );
                            expect((yield* Effect.flip(sink.write({ ...record, profile: 'sensitive' }))).reason).toBe(
                                'unavailable'
                            );
                            expect((yield* Effect.flip(sink.write({ ...record, traceId: 'invalid' }))).reason).toBe(
                                'invalid-record'
                            );
                        }
                    ).pipe(
                        Effect.provide(
                            governedTelemetrySinkLayer(binding, policy).pipe(
                                Layer.provide(provider(records)),
                                Layer.provide(allow),
                                Layer.provide(enabled)
                            )
                        )
                    );
                    expect(records).toEqual([]);
                }
            )
    );

    it.effect(
        'checks exact tenant, purpose and generation live and denies flush after grant or flag revocation',
        /**
         * Exercise revocation on an already acquired sink.
         *
         * @returns The scenario that revokes the authority and the flag on a live sink.
         */
        () =>
            Effect.gen(
                /** Revoke each live gate after one permitted delivery without rebuilding the sink. */ function* () {
                    // Mutable fixture decisions expose acquisition-time caching while the binding and handle stay fixed.
                    let authorized = true;
                    let flagEnabled = true;
                    const records: Array<TelemetryRecord> = [];
                    const authority = Layer.succeed(TelemetryExportAuthority, {
                        /**
                         * Check the full static binding on every authorization request.
                         *
                         * @param current - Binding the sink presents for authorization.
                         * @returns An effect that checks the binding and grants or denies the request.
                         */
                        authorize: (current) =>
                            Effect.suspend(
                                /**
                                 * Read mutable permission at operation time to expose stale authorization caching.
                                 *
                                 * @returns An effect that succeeds while authorized and fails as unavailable otherwise.
                                 */
                                () => {
                                    // A permissive boolean is insufficient if the sink substitutes another tenant or generation.
                                    expect(current).toEqual(binding);
                                    return authorized
                                        ? Effect.void
                                        : Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' }));
                                }
                            ),
                    });
                    const flags = Layer.succeed(Flags, {
                        /**
                         * Reevaluate the flag for an existing sink rather than only at acquisition.
                         *
                         * @param flag - Flag definition the sink asks about.
                         * @returns An effect yielding the evaluation with the current test-controlled value.
                         */
                        evaluate: (flag) =>
                            Effect.sync(
                                /**
                                 * Observe the latest test-controlled flag value.
                                 *
                                 * @returns The safe-default evaluation carrying the current test-controlled value.
                                 */
                                () => ({
                                    ...safeDefault(flag),
                                    value: flagEnabled,
                                })
                            ),
                    });
                    yield* Effect.gen(
                        /** Establish permitted delivery, then test write and flush under both revocation causes. */ function* () {
                            const sink = yield* TelemetrySink;
                            yield* sink.write(record);
                            // Reuse the same handle so acquisition-time permission cannot conceal revocation bugs.
                            authorized = false;
                            expect((yield* Effect.flip(sink.write(record))).reason).toBe('unavailable');
                            expect((yield* Effect.flip(sink.flush)).reason).toBe('unavailable');
                            authorized = true;
                            flagEnabled = false;
                            expect((yield* Effect.flip(sink.write(record))).reason).toBe('unavailable');
                            expect((yield* Effect.flip(sink.flush)).reason).toBe('unavailable');
                        }
                    ).pipe(
                        Effect.provide(
                            governedTelemetrySinkLayer(binding, policy).pipe(
                                Layer.provide(provider(records)),
                                Layer.provide(authority),
                                Layer.provide(flags)
                            )
                        )
                    );
                    expect(records).toHaveLength(1);
                }
            )
    );

    it.effect(
        'rejects escaped sink handles after scope closure',
        /**
         * Exercise disposal fencing on retained sink references.
         *
         * @returns The scenario that uses a sink after its scope has closed and expects refusal.
         */
        () =>
            Effect.gen(
                /** Acquire a sink in a completed scope before attempting either release path. */ function* () {
                    // Effect.provide closes the layer before returning; the retained reference is deliberately escaped.
                    const records: Array<TelemetryRecord> = [];
                    const sink = yield* TelemetrySink.pipe(
                        Effect.provide(
                            governedTelemetrySinkLayer(binding, policy).pipe(
                                Layer.provide(provider(records)),
                                Layer.provide(allow),
                                Layer.provide(enabled)
                            )
                        )
                    );
                    expect((yield* Effect.flip(sink.write(record))).reason).toBe('unavailable');
                    expect((yield* Effect.flip(sink.flush)).reason).toBe('unavailable');
                    expect(records).toEqual([]);
                }
            )
    );

    it.effect(
        'authorizes queued records at worker delivery, never releasing them on revoked shutdown flush',
        /**
         * Exercise revocation between enqueue and worker delivery.
         *
         * @returns The scenario that revokes authorization while a write is in flight.
         */
        () =>
            Effect.gen(
                /** Hold the first write in flight while a second queued record loses authorization. */ function* () {
                    const started = yield* Deferred.make<void>();
                    const finish = yield* Deferred.make<void>();
                    let authorized = true;
                    const records: Array<TelemetryRecord> = [];
                    const remote = Layer.succeed(TelemetryExportProvider, {
                        /**
                         * Hold an already authorized delivery so later queued work can be revoked deterministically.
                         *
                         * @param _binding - Export scope of the write, unused by this provider.
                         * @param value - Projected record being delivered.
                         * @returns An effect that signals entry, waits for release and records the delivery.
                         */
                        write: (_binding, value) =>
                            Effect.gen(
                                /** Signal provider entry and wait for the test to permit completion. */ function* () {
                                    // Admission precedes suspension, separating this in-flight write from later queued work.
                                    yield* Deferred.succeed(started, undefined);
                                    yield* Deferred.await(finish);
                                    records.push(value);
                                }
                            ),
                        /**
                         * Avoid adding transport-side behavior to the worker authorization scenario.
                         *
                         * @returns An effect that completes immediately.
                         */
                        flush: () => Effect.void,
                    });
                    const authority = Layer.succeed(TelemetryExportAuthority, {
                        /**
                         * Evaluate permission when the worker attempts release, not when logging enqueues a record.
                         *
                         * @returns An effect that grants or denies according to the current permission state.
                         */
                        authorize: () =>
                            Effect.suspend(
                                /**
                                 * Return the permission state observed at this delivery boundary.
                                 *
                                 * @returns An effect that succeeds while authorized, or an unavailable failure otherwise.
                                 */
                                () => (authorized ? Effect.void : new TelemetrySinkFailure({ reason: 'unavailable' }))
                            ),
                    });
                    const pipeline = telemetryLayer(
                        { ...policy, attributes: {} },
                        Config.succeed({ enabled: true, capacity: 4, timeoutMs: 1000 })
                    ).pipe(
                        Layer.provide(governedTelemetrySinkLayer(binding, policy)),
                        Layer.provide(remote),
                        Layer.provide(authority),
                        Layer.provide(enabled)
                    );
                    yield* Effect.gen(
                        /** Queue behind an in-flight delivery, revoke the grant, then await the worker's failure. */ function* () {
                            yield* Effect.logInfo('sample.completed');
                            yield* Deferred.await(started);
                            // The second record is accepted locally but must face the revoked grant at dispatch.
                            yield* Effect.logInfo('sample.completed');
                            authorized = false;
                            yield* Deferred.succeed(finish, undefined);
                            const control = yield* TelemetryControl;
                            expect((yield* Effect.flip(control.flush)).reason).toBe('flush');
                            expect((yield* control.health).failed).toBe(1);
                        }
                    ).pipe(Effect.provide(pipeline));
                    // The first request was already authorized/in flight. The queued second request never reaches the provider.
                    expect(records).toHaveLength(1);
                }
            )
    );

    it.effect(
        'rejects invalid static bindings and policy before export',
        /**
         * Exercise acquisition-time validation of trusted export configuration.
         *
         * @returns The scenario that acquires sinks with malformed bindings and unsafe catalog text and expects failure.
         */
        () =>
            Effect.gen(
                /** Reject malformed bindings and unsafe catalog text before a sink can be used. */ function* () {
                    // All release gates are enabled below, isolating trusted-configuration validation from policy denial.
                    for (const [current, catalog] of [
                        [{ ...binding, generation: -1 }, policy],
                        [binding, { messages: { 'sample.completed': '\u001bsecret' } }],
                    ] as const) {
                        const failure = yield* Effect.flip(
                            TelemetrySink.pipe(
                                Effect.provide(
                                    governedTelemetrySinkLayer(current, catalog).pipe(
                                        Layer.provide(provider([])),
                                        Layer.provide(allow),
                                        Layer.provide(enabled)
                                    )
                                )
                            )
                        );
                        expect(failure.reason).toBe('configuration');
                    }
                    expect(Schema.is(TelemetryExportBinding)({ ...binding, tenant: 'forged' })).toBe(false);
                }
            )
    );

    it.effect(
        'refuses release when its scope closes during a pending authorization',
        /**
         * Exercise disposal racing with authorization completion.
         *
         * @returns The scenario that closes the owner during authorization and checks that nothing is released.
         */
        () =>
            Effect.gen(
                /** Close the owner while authorization is suspended, then verify late approval cannot release data. */ function* () {
                    const entered = yield* Deferred.make<void>();
                    const finish = yield* Deferred.make<void>();
                    const records: Array<TelemetryRecord> = [];
                    const authority = Layer.succeed(TelemetryExportAuthority, {
                        /**
                         * Pause permission completion until the sink's owner has closed.
                         *
                         * @returns An effect that signals entry and waits until the test releases it.
                         */
                        authorize: () =>
                            Deferred.succeed(entered, undefined).pipe(Effect.zipRight(Deferred.await(finish))),
                    });
                    const scope = yield* Scope.make();
                    const context = yield* Layer.build(
                        governedTelemetrySinkLayer(binding, policy).pipe(
                            Layer.provide(provider(records)),
                            Layer.provide(authority),
                            Layer.provide(enabled)
                        )
                    ).pipe(Effect.provideService(Scope.Scope, scope));
                    const sink = Context.get(context, TelemetrySink);
                    const write = yield* sink.write(record).pipe(Effect.flip, Effect.fork);
                    yield* Deferred.await(entered);
                    // Late authorization must not resurrect a sink whose ownership scope has already ended.
                    yield* Scope.close(scope, Exit.void);
                    yield* Deferred.succeed(finish, undefined);
                    expect((yield* Fiber.join(write)).reason).toBe('unavailable');
                    expect(records).toEqual([]);
                }
            )
    );
});
