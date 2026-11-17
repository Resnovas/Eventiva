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
    /** Enable the requested flag without changing its other safe-default metadata. */ evaluate: (flag) =>
        Effect.succeed({ ...safeDefault(flag), value: true }),
});
const allow = Layer.succeed(TelemetryExportAuthority, {
    /** Model a currently valid export grant independently of transport. */ authorize: () => Effect.void,
});
/** Substitute an independent transport to verify projection without coupling runtime to a vendor. */
const provider = (records: Array<TelemetryRecord>) =>
    Layer.succeed(TelemetryExportProvider, {
        /** Retain exactly what crosses the provider boundary for privacy assertions. */
        write: (_binding, value) =>
            Effect.sync(
                /** Capture delivery at execution time rather than effect construction. */ () => {
                    records.push(value);
                }
            ),
        /** Complete a transport flush without adding records or accessing a network. */
        flush: () => Effect.void,
    });

describe('governed telemetry export', /** Register vendor-independent export authorization and privacy regressions. */ () => {
    for (const adapter of ['control', 'authority', 'provider'] as const) {
        for (const operation of ['write', 'flush'] as const) {
            it.effect(
                `preserves admitted export scope after ${adapter} mutation during ${operation}`,
                /** Adapter-owned views cannot widen later records or replace the original baseline scope. */ () =>
                    Effect.gen(
                        /** Compare asymmetric profiles and all delivered bindings through the public sink. */ function* () {
                            const records: TelemetryRecord[] = [];
                            const observed: TelemetryExportBinding[] = [];
                            let changed = false;
                            /** Mutate the first selected adapter view, never the fixture's trusted input. */
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
                                                /** Observe the exact current scope before attempting adapter corruption. */
                                                authorize: (scope, phase) =>
                                                    Effect.sync(
                                                        /** Flush and record authorization expose separate disposable views. */ () =>
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
                                                /** Capture only the minimized record while corrupting the received binding. */
                                                write: (scope, projected) =>
                                                    Effect.sync(
                                                        /** The mutation happens after the first release, not during setup. */ () => {
                                                            records.push(projected);
                                                            inspect(scope, 'provider', 'write');
                                                        }
                                                    ),
                                                /** A payload-free flush must not change subsequent release scope either. */
                                                flush: (scope) =>
                                                    Effect.sync(
                                                        /** Exercise flush through the same adapter boundary as transport. */ () =>
                                                            inspect(scope, 'provider', 'flush')
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
        /** Exercise the same safe projection for logs and spans. */ () =>
            Effect.gen(
                /** Verify only catalog text and correlation survive delivery to an arbitrary provider. */ function* () {
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
        /** Exercise independent flag and authority denials. */ () =>
            Effect.gen(
                /** Verify enabling one gate cannot bypass the other's safe default. */ function* () {
                    for (const dependencies of [
                        Layer.merge(FlagsSafeDefaults, allow),
                        Layer.merge(enabled, TelemetryExportDeny),
                    ]) {
                        const records: Array<TelemetryRecord> = [];
                        yield* Effect.gen(
                            /** Attempt both release paths while one required gate remains denied. */ function* () {
                                const sink = yield* TelemetrySink;
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
        /** Exercise classification downgrade resistance. */ () =>
            Effect.gen(
                /** Bind protected contexts while submitting a baseline record that must not escape. */ function* () {
                    const denied: ReadonlyArray<TelemetryExportBinding> = [
                        ...(['restricted', 'vault'] as const).map(
                            /** Vary the bound protection profile without changing the record. */ (profile) => ({
                                ...binding,
                                profile,
                            })
                        ),
                        ...(['protected', 'financial', 'emergency', 'decrypting'] as const).map(
                            /** Vary the bound operation independently of caller-supplied record classification. */ (
                                operation
                            ) => ({
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
        /** Exercise record validation before transport access. */ () =>
            Effect.gen(
                /** Keep a recording provider available to detect accidental release of rejected records. */ function* () {
                    const records: Array<TelemetryRecord> = [];
                    yield* Effect.gen(
                        /** Submit an unknown code, mismatched profile and malformed correlation identifier. */ function* () {
                            const sink = yield* TelemetrySink;
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
        /** Exercise revocation on an already acquired sink. */ () =>
            Effect.gen(
                /** Revoke each live gate after one permitted delivery without rebuilding the sink. */ function* () {
                    let authorized = true;
                    let flagEnabled = true;
                    const records: Array<TelemetryRecord> = [];
                    const authority = Layer.succeed(TelemetryExportAuthority, {
                        /** Check the full static binding on every authorization request. */
                        authorize: (current) =>
                            Effect.suspend(
                                /** Read mutable permission at operation time to expose stale authorization caching. */ () => {
                                    expect(current).toEqual(binding);
                                    return authorized
                                        ? Effect.void
                                        : Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' }));
                                }
                            ),
                    });
                    const flags = Layer.succeed(Flags, {
                        /** Reevaluate the flag for an existing sink rather than only at acquisition. */
                        evaluate: (flag) =>
                            Effect.sync(
                                /** Observe the latest test-controlled flag value. */ () => ({
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
        /** Exercise disposal fencing on retained sink references. */ () =>
            Effect.gen(
                /** Acquire a sink in a completed scope before attempting either release path. */ function* () {
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
        /** Exercise revocation between enqueue and worker delivery. */ () =>
            Effect.gen(
                /** Hold the first write in flight while a second queued record loses authorization. */ function* () {
                    const started = yield* Deferred.make<void>();
                    const finish = yield* Deferred.make<void>();
                    let authorized = true;
                    const records: Array<TelemetryRecord> = [];
                    const remote = Layer.succeed(TelemetryExportProvider, {
                        /** Hold an already authorized delivery so later queued work can be revoked deterministically. */
                        write: (_binding, value) =>
                            Effect.gen(
                                /** Signal provider entry and wait for the test to permit completion. */ function* () {
                                    yield* Deferred.succeed(started, undefined);
                                    yield* Deferred.await(finish);
                                    records.push(value);
                                }
                            ),
                        /** Avoid adding transport-side behavior to the worker authorization scenario. */
                        flush: () => Effect.void,
                    });
                    const authority = Layer.succeed(TelemetryExportAuthority, {
                        /** Evaluate permission when the worker attempts release, not when logging enqueues a record. */
                        authorize: () =>
                            Effect.suspend(
                                /** Return the permission state observed at this delivery boundary. */ () =>
                                    authorized ? Effect.void : new TelemetrySinkFailure({ reason: 'unavailable' })
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
        /** Exercise acquisition-time validation of trusted export configuration. */ () =>
            Effect.gen(
                /** Reject malformed bindings and unsafe catalog text before a sink can be used. */ function* () {
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
        /** Exercise disposal racing with authorization completion. */ () =>
            Effect.gen(
                /** Close the owner while authorization is suspended, then verify late approval cannot release data. */ function* () {
                    const entered = yield* Deferred.make<void>();
                    const finish = yield* Deferred.make<void>();
                    const records: Array<TelemetryRecord> = [];
                    const authority = Layer.succeed(TelemetryExportAuthority, {
                        /** Pause permission completion until the sink's owner has closed. */
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
