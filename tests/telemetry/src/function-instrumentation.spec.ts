/**
 * @file tests/telemetry/src/function-instrumentation.spec.ts
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

import { describe, expect, expectTypeOf, it } from '@effect/vitest';
import { Flags, FlagsSafeDefaults, safeDefault, type Flag } from '@eventiva/contracts/flags';
import { TelemetryRecord, TelemetrySink, TelemetrySinkFailure } from '@eventiva/contracts/observability';
import {
    functionCatalog,
    functionObservation,
    functionSignalFlags,
    functionTelemetryTestLayer,
    FunctionInstrumentationFailure,
} from '@eventiva/runtime/function-instrumentation';
import { telemetryLayer, TelemetryControl } from '@eventiva/runtime/telemetry';
import {
    Cause,
    Config,
    Context,
    Deferred,
    Effect,
    Exit,
    Fiber,
    FiberRef,
    Layer,
    Metric,
    MetricState,
    Option,
    Ref,
    Scope,
    TestClock,
} from 'effect';

/** Query public registry snapshots, not a newly allocated timer's distinct bucket descriptor. */
const durations = Effect.fn('spec.durations')(
    /**
     * Aggregate independent registry samples for exactly one admitted operation.
     *
     * @param operation - The admitted operation whose histogram is queried.
     * @returns The total sample count and duration sum across matching histograms.
     */ function* (operation: string) {
        let count = 0;
        let sum = 0;
        for (const entry of yield* Metric.snapshot) {
            if (
                entry.metricKey.name === 'eventiva.function.duration_ms' &&
                entry.metricKey.tags.some(
                    /**
                     * Select the static operation label, never payload-dependent tags.
                     *
                     * @param label - A label attached to the metric key.
                     * @returns Whether this label selects the requested operation.
                     */ (label) => label.key === 'operation' && label.value === operation
                ) &&
                MetricState.isHistogramState(entry.metricState)
            ) {
                count += entry.metricState.count;
                sum += entry.metricState.sum;
            }
        }
        return { count, sum };
    }
);

/** Capture the existing sanitized local projection, not a primitive-owned exporter or its internal state. */
const capture = Effect.fn('spec.capture')(
    /**
     * Retain immutable snapshots of records already sanitized by the central projection.
     *
     * @yields A reference allocated for this capture only.
     * @returns The writable sink layer and its ordered record reference.
     */ function* () {
        const records = yield* Ref.make<ReadonlyArray<TelemetryRecord>>([]);
        const sink = Layer.succeed(TelemetrySink, {
            /** Retain only the already public telemetry record. */
            write: Effect.fn('spec.sink.write')(
                /**
                 * Append one public record without inspecting an opaque span or Exit.
                 *
                 * @param record - A record already sanitized by the central projection.
                 * @yields The append to the capture reference.
                 */ function* (record: TelemetryRecord) {
                    yield* Ref.update(
                        records,
                        /**
                         * Preserve previous capture snapshots.
                         *
                         * @param previous - The previously captured records in append order.
                         * @returns A new snapshot with the record appended.
                         */ (previous) => [...previous, record]
                    );
                }
            ),
            flush: Effect.void,
        });
        return { records, sink };
    }
);

describe('named generator function instrumentation public contract', /** Register portable execution, privacy and capacity contracts without global migration claims. */ () => {
    it.effect(
        'contains provider/exporter faults and saturation without disabling independent required audit',
        /**
         * Separate business results from optional collector health and required audit failure.
         *
         * @returns The scoped producer, exporter and audit isolation check.
         */ () =>
            Effect.scoped(
                Effect.gen(
                    /** Exercise provider defects, failed export, bounded pressure and independent audit in one admitted operation. */ function* () {
                        const catalog = yield* functionCatalog(['spec.boundaries']);
                        const observation = yield* functionObservation(catalog, 'spec.boundaries');
                        const operation = Effect.fn('spec.boundaries')(
                            /**
                             * Supply an asymmetric constant business result independent of collector state.
                             *
                             * @yields The successful business effect.
                             * @returns The business value 91.
                             */ function* () {
                                return yield* Effect.succeed(91);
                            }
                        );
                        const providerHealth = Metric.counter('eventiva.function.observer_failed');
                        const before = (yield* Metric.value(providerHealth)).count;
                        const badFlags = Layer.succeed(Flags, {
                            /** A provider defect violates the Flags service guarantee but must have safe local fallback and visible health. */
                            evaluate: Effect.fn('spec.fault.flags')(
                                /**
                                 * Inject a private provider defect to exercise the service-contract violation fallback.
                                 *
                                 * @yields The deliberate provider defect.
                                 * @returns Never returns a flag evaluation.
                                 */ function* () {
                                    return yield* Effect.die(new Error('PRIVATE_PROVIDER_CANARY'));
                                }
                            ),
                        });
                        expect(yield* operation().pipe(observation, Effect.provide(badFlags))).toBe(91);
                        expect((yield* Metric.value(providerHealth)).count - before).toBe(5);
                        for (const failure of [
                            Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' })),
                            Effect.die(new Error('PRIVATE_SINK_CANARY')),
                        ]) {
                            const sink = Layer.succeed(TelemetrySink, {
                                /** Return the selected sink failure without consuming a business value or raw Cause. */
                                write: Effect.fn('spec.fault.write')(
                                    /**
                                     * Fail only the sink boundary using the selected typed or defective exit.
                                     *
                                     * @yields The configured typed failure or defect.
                                     * @returns Never completes a successful write.
                                     */ function* () {
                                        return yield* failure;
                                    }
                                ),
                                flush: Effect.void,
                            });
                            yield* Effect.gen(
                                /** Assert usable business execution while explicit drain reports sanitized sink failure. */ function* () {
                                    expect(yield* operation().pipe(observation)).toBe(91);
                                    const control = yield* TelemetryControl;
                                    const flush = yield* Effect.exit(control.flush);
                                    expect(Exit.isFailure(flush)).toBe(true);
                                    expect(yield* control.health).toMatchObject({
                                        accepted: 1,
                                        completed: 1,
                                        failed: 1,
                                    });
                                    expect(JSON.stringify(flush)).not.toContain('PRIVATE_SINK_CANARY');
                                }
                            ).pipe(
                                Effect.provide(
                                    telemetryLayer({
                                        messages: { 'spec.boundaries': 'Boundary.' },
                                        attributes: {},
                                    }).pipe(Layer.provide(sink))
                                )
                            );
                        }
                        const entered = yield* Deferred.make<void>();
                        const release = yield* Deferred.make<void>();
                        const blocked = Layer.succeed(TelemetrySink, {
                            /** Hold exactly one sink record until producer completion and queue bounds are observed. */
                            write: Effect.fn('spec.blocked.write')(
                                /**
                                 * Publish worker entry before holding delivery until the test releases pressure.
                                 *
                                 * @yields The entry signal followed by the release barrier.
                                 */ function* () {
                                    yield* Deferred.succeed(entered, undefined);
                                    yield* Deferred.await(release);
                                }
                            ),
                            flush: Effect.void,
                        });
                        yield* Effect.gen(
                            /** Fill the bounded queue after worker entry and verify producers still return their results. */ function* () {
                                expect(yield* operation().pipe(observation)).toBe(91);
                                yield* Deferred.await(entered);
                                for (let index = 0; index < 8; index++)
                                    expect(yield* operation().pipe(observation)).toBe(91);
                                const control = yield* TelemetryControl;
                                expect(yield* control.health).toMatchObject({ accepted: 2, completed: 0, dropped: 7 });
                                yield* Deferred.succeed(release, undefined);
                                yield* control.flush;
                            }
                        ).pipe(
                            Effect.provide(
                                telemetryLayer(
                                    { messages: { 'spec.boundaries': 'Boundary.' }, attributes: {} },
                                    Config.succeed({ enabled: true, capacity: 1, timeoutMs: 1000 })
                                ).pipe(Layer.provide(blocked))
                            )
                        );
                        /** Model a required business dependency that optional telemetry cannot satisfy or bypass. */
                        class Audit extends Context.Tag('spec.RequiredAudit')<
                            Audit,
                            { readonly persist: Effect.Effect<void, 'audit-unavailable'> }
                        >() {}
                        const audited = Effect.fn('spec.boundaries')(
                            /**
                             * Require audit persistence before returning any business success value.
                             *
                             * @yields The audit service and its required persistence effect.
                             * @returns The business value only after required persistence succeeds.
                             */ function* () {
                                yield* (yield* Audit).persist;
                                return 91;
                            }
                        );
                        for (const enabled of [false, true]) {
                            const flags = Layer.succeed(Flags, {
                                /** Toggle optional local signals, never the independently required audit. */
                                evaluate: Effect.fn('spec.audit.flags')(
                                    /**
                                     * Set optional signals together without altering the required audit service.
                                     *
                                     * @param flag - The local signal declaration being evaluated.
                                     * @yields The local override of the flag evaluation.
                                     * @returns A local evaluation reflecting the test switch.
                                     */ function* (flag: Flag) {
                                        return yield* Effect.succeed({ ...safeDefault(flag), value: enabled });
                                    }
                                ),
                            });
                            const result = yield* audited().pipe(
                                observation,
                                Effect.provide(flags),
                                Effect.provideService(Audit, { persist: Effect.fail('audit-unavailable' as const) }),
                                Effect.exit
                            );
                            expect(
                                Exit.isFailure(result) && Option.getOrUndefined(Cause.failureOption(result.cause))
                            ).toBe('audit-unavailable');
                        }
                    }
                ).pipe(Effect.provide(FlagsSafeDefaults))
            )
    );

    it.effect(
        'honors each signal independently, leaves production profiling off and requires test timing',
        /**
         * Compare observable counter, metric, span and attribute deltas for each independent switch.
         *
         * @returns The test effect that changes one signal at a time.
         */ () =>
            Effect.gen(
                /** Vary one flag at a time and separately probe ambient tracing and mandatory test timing. */ function* () {
                    const collected = yield* capture();
                    let disabled = '';
                    const flags = Layer.succeed(Flags, {
                        /** Force only one independent switch off; production timer true must still have no profiling samples. */
                        evaluate: Effect.fn('spec.signals.flags')(
                            /**
                             * Override exactly the selected flag while enabling all other declared signals.
                             *
                             * @param flag - The local signal declaration being evaluated.
                             * @yields The per-key flag evaluation.
                             * @returns A local evaluation with only the selected signal disabled.
                             */ function* (flag: Flag) {
                                return yield* Effect.succeed({ ...safeDefault(flag), value: flag.key !== disabled });
                            }
                        ),
                    });
                    yield* Effect.scoped(
                        Effect.gen(
                            /** Compare per-execution observations without resetting Effect's shared metric registry. */ function* () {
                                const catalog = yield* functionCatalog(['spec.signals']);
                                const observation = yield* functionObservation(catalog, 'spec.signals');
                                const operation = Effect.fn('spec.signals')(
                                    /**
                                     * Return a stable value so a signal toggle cannot change the business oracle.
                                     *
                                     * @yields The constant success effect.
                                     * @returns The business value 72 independently of signal selection.
                                     */ function* () {
                                        return yield* Effect.succeed(72);
                                    }
                                );
                                for (const off of [
                                    '',
                                    ...Object.values(functionSignalFlags).map(
                                        /**
                                         * Enumerate the public declaration keys without inventing extra toggle storage.
                                         *
                                         * @param flag - The local signal declaration being evaluated.
                                         * @returns The canonical key for the next switch to disable.
                                         */ (flag) => flag.key
                                    ),
                                ]) {
                                    disabled = off;
                                    const before = yield* Effect.all({
                                        started: Metric.value(
                                            Metric.counter('eventiva.function.started').pipe(
                                                Metric.tagged('operation', 'spec.signals')
                                            )
                                        ),
                                        executions: Metric.value(
                                            Metric.counter('eventiva.function.executions').pipe(
                                                Metric.tagged('operation', 'spec.signals')
                                            )
                                        ),
                                        records: Ref.get(collected.records),
                                    });
                                    expect(yield* operation().pipe(observation)).toBe(72);
                                    yield* (yield* TelemetryControl).flush;
                                    expect(
                                        (yield* Metric.value(
                                            Metric.counter('eventiva.function.started').pipe(
                                                Metric.tagged('operation', 'spec.signals')
                                            )
                                        )).count - before.started.count
                                    ).toBe(off === functionSignalFlags.counters.key ? 0 : 1);
                                    expect(
                                        (yield* Metric.value(
                                            Metric.counter('eventiva.function.executions').pipe(
                                                Metric.tagged('operation', 'spec.signals')
                                            )
                                        )).count - before.executions.count
                                    ).toBe(off === functionSignalFlags.metrics.key ? 0 : 1);
                                    const spans = (yield* Ref.get(collected.records))
                                        .slice(before.records.length)
                                        .filter(
                                            /**
                                             * Select this operation's projected span independently of the provider's own spans.
                                             *
                                             * @param entry - A candidate telemetry record.
                                             * @returns Whether the record belongs to the controlled business span.
                                             */ (entry) => entry.code === 'spec.signals'
                                        );
                                    expect(spans).toHaveLength(
                                        off === functionSignalFlags.spans.key || off === functionSignalFlags.traces.key
                                            ? 0
                                            : 1
                                    );
                                    if (spans.length > 0)
                                        expect(spans[0]?.attributes).toEqual(
                                            off === functionSignalFlags.attributes.key
                                                ? {}
                                                : { 'eventiva.function.source': 'generator' }
                                        );
                                }
                                expect((yield* durations('spec.signals')).count).toBe(0);
                                disabled = '';
                                const beforeAmbient = (yield* Ref.get(collected.records)).length;
                                yield* operation().pipe(observation, Effect.withTracerEnabled(false));
                                expect(
                                    yield* FiberRef.set(FiberRef.currentTracerEnabled, true).pipe(
                                        observation,
                                        Effect.zipRight(FiberRef.get(FiberRef.currentTracerEnabled)),
                                        Effect.withTracerEnabled(false)
                                    )
                                ).toBe(false);
                                yield* (yield* TelemetryControl).flush;
                                expect(
                                    (yield* Ref.get(collected.records)).slice(beforeAmbient).filter(
                                        /**
                                         * Inspect only the controlled business operation after ambient tracing disablement.
                                         *
                                         * @param entry - A candidate telemetry record.
                                         * @returns Whether the record identifies the disabled subject.
                                         */ (entry) => entry.code === 'spec.signals'
                                    )
                                ).toHaveLength(0);
                                disabled = functionSignalFlags.timer.key;
                                const refused = yield* operation().pipe(
                                    observation,
                                    Effect.provide(functionTelemetryTestLayer),
                                    Effect.exit
                                );
                                expect(
                                    Exit.isFailure(refused) &&
                                        Cause.originalError(Option.getOrUndefined(Cause.failureOption(refused.cause)))
                                            ?.reason
                                ).toBe('timer-required');
                                disabled = functionSignalFlags.counters.key;
                                yield* operation().pipe(observation, Effect.provide(functionTelemetryTestLayer));
                                expect((yield* durations('spec.signals')).count).toBe(1);
                            }
                        ).pipe(
                            Effect.provide(
                                Layer.mergeAll(
                                    flags,
                                    telemetryLayer({
                                        messages: { 'spec.signals': 'Signals.' },
                                        attributes: { 'eventiva.function.source': ['generator'] },
                                    }).pipe(Layer.provide(collected.sink))
                                )
                            )
                        )
                    );
                }
            )
    );

    it.effect(
        'observes both helpers finitely on success and failure without multiplying timer descriptors',
        /**
         * Assert exact terminal helper counts and bounded histogram identity under repeated preparation.
         *
         * @returns The scoped helper count and descriptor-identity check.
         */ () =>
            Effect.scoped(
                Effect.gen(
                    /** Count admitted and rejected helper executions using public metrics rather than internal state. */ function* () {
                        const before = yield* Effect.all({
                            catalog: Metric.value(
                                Metric.counter('eventiva.function.completed').pipe(
                                    Metric.tagged('operation', 'telemetry.function.catalog')
                                )
                            ),
                            prepare: Metric.value(
                                Metric.counter('eventiva.function.completed').pipe(
                                    Metric.tagged('operation', 'telemetry.function.prepare')
                                )
                            ),
                        });
                        const catalog = yield* functionCatalog(['spec.helpers']);
                        yield* Effect.exit(functionCatalog(['spec.helpers', 'spec.helpers']));
                        const observations = [];
                        for (let index = 0; index < 10; index++)
                            observations.push(yield* functionObservation(catalog, 'spec.helpers'));
                        yield* Effect.exit(functionObservation(catalog, 'spec.unknown'));
                        const operation = Effect.fn('spec.helpers')(
                            /**
                             * Supply a live operation to exercise every separately prepared native operator.
                             *
                             * @yields The constant success effect.
                             * @returns The business value 19 for each execution.
                             */ function* () {
                                return yield* Effect.succeed(19);
                            }
                        );
                        for (const observation of observations) expect(yield* operation().pipe(observation)).toBe(19);
                        expect(
                            (yield* Metric.value(
                                Metric.counter('eventiva.function.completed').pipe(
                                    Metric.tagged('operation', 'telemetry.function.catalog')
                                )
                            )).count - before.catalog.count
                        ).toBe(2);
                        expect(
                            (yield* Metric.value(
                                Metric.counter('eventiva.function.completed').pipe(
                                    Metric.tagged('operation', 'telemetry.function.prepare')
                                )
                            )).count - before.prepare.count
                        ).toBe(11);
                        expect((yield* durations('spec.helpers')).count).toBe(10);
                        const descriptors = (yield* Metric.snapshot).filter(
                            /**
                             * Restrict registry identity checks to the operation whose ten preparations were exercised.
                             *
                             * @param entry - A snapshot of a registry metric.
                             * @returns Whether the histogram belongs to the repeatedly prepared subject.
                             */ (entry) =>
                                entry.metricKey.name === 'eventiva.function.duration_ms' &&
                                entry.metricKey.tags.some(
                                    /**
                                     * Match the static operation dimension independently of timer bucket descriptor identity.
                                     *
                                     * @param label - A label attached to the metric key.
                                     * @returns Whether the label identifies the helper fixture.
                                     */ (label) => label.key === 'operation' && label.value === 'spec.helpers'
                                )
                        );
                        expect(descriptors).toHaveLength(1);
                    }
                ).pipe(Effect.provide(Layer.mergeAll(FlagsSafeDefaults, functionTelemetryTestLayer)))
            )
    );

    it.effect(
        'checks fresh Flags outside business and helper spans, including repeated execution',
        /**
         * Exercise OFF and ON controls for all three named subject spans.
         *
         * @returns The test effect that reexecutes one operation across flag changes.
         */ () =>
            Effect.gen(
                /** Reuse one constructed Effect across flag changes to distinguish execution-time from construction-time gating. */ function* () {
                    const collected = yield* capture();
                    let enabled = false;
                    const flags = Layer.succeed(Flags, {
                        /** Keep timer/default signal policy while independently toggling the outer span gate. */
                        evaluate: Effect.fn('spec.flags.evaluate')(
                            /**
                             * Resolve the current mutable span switch only when the evaluator Effect executes.
                             *
                             * @param flag - The local signal declaration being evaluated.
                             * @yields An evaluation from the current switch value.
                             * @returns The current span gate or the declared default for other flags.
                             */ function* (flag) {
                                return yield* Effect.succeed({
                                    ...safeDefault(flag),
                                    value: flag.key === 'telemetry.function.spans' ? enabled : flag.safeDefault,
                                });
                            }
                        ),
                    });
                    yield* Effect.scoped(
                        Effect.gen(
                            /** Assert no subject spans while disabled and exactly one enabled control per subject. */ function* () {
                                const catalog = yield* functionCatalog(['spec.outer']);
                                const observation = yield* functionObservation(catalog, 'spec.outer');
                                const operation = Effect.fn('spec.outer')(
                                    /**
                                     * Keep the subject computation independent of span enablement.
                                     *
                                     * @yields The constant success effect.
                                     * @returns The unchanged business value 41.
                                     */ function* () {
                                        return yield* Effect.succeed(41);
                                    }
                                );
                                const repeated = operation().pipe(observation);
                                expect(yield* repeated).toBe(41);
                                yield* (yield* TelemetryControl).flush;
                                expect(
                                    (yield* Ref.get(collected.records)).filter(
                                        /**
                                         * Exclude provider-only redacted names, retaining every declared subject span.
                                         *
                                         * @param entry - A candidate telemetry record.
                                         * @returns Whether the record represents a non-redacted subject span.
                                         */ (entry) => entry.signal === 'span' && entry.code !== 'redacted'
                                    )
                                ).toHaveLength(0);
                                enabled = true;
                                yield* functionCatalog(['spec.enabled-control']);
                                yield* functionObservation(catalog, 'spec.outer');
                                expect(yield* repeated).toBe(41);
                                yield* (yield* TelemetryControl).flush;
                            }
                        ).pipe(
                            Effect.provide(
                                Layer.mergeAll(
                                    flags,
                                    functionTelemetryTestLayer,
                                    telemetryLayer({
                                        messages: {
                                            'spec.outer': 'Outer control.',
                                            'telemetry.function.catalog': 'Catalog.',
                                            'telemetry.function.prepare': 'Preparation.',
                                        },
                                        attributes: {},
                                    }).pipe(Layer.provide(collected.sink))
                                )
                            )
                        )
                    );
                    const spans = (yield* Ref.get(collected.records)).filter(
                        /**
                         * Select declared subjects after both execution phases have drained.
                         *
                         * @param entry - A candidate telemetry record.
                         * @returns Whether the record identifies a declared subject span.
                         */ (entry) => entry.signal === 'span' && entry.code !== 'redacted'
                    );
                    expect(
                        spans
                            .map(
                                /**
                                 * Compare static subject identities without depending on concurrent provider ordering.
                                 *
                                 * @param entry - A candidate telemetry record.
                                 * @returns The static subject code used for the order-independent comparison.
                                 */ (entry) => entry.code
                            )
                            .sort()
                    ).toEqual(['spec.outer', 'telemetry.function.catalog', 'telemetry.function.prepare']);
                }
            )
    );

    it.effect(
        'is inert at definition and construction, and profiles every repeated execution freshly',
        /**
         * Separate definition, Effect construction and repeated execution observations.
         *
         * @returns The inertness, repeatability and timing check.
         */ () =>
            Effect.scoped(
                Effect.gen(
                    /** Assert zero eager work and independently summed asymmetric execution durations. */ function* () {
                        const catalog = yield* functionCatalog(['spec.repeat']);
                        const observation = yield* functionObservation(catalog, 'spec.repeat');
                        const started = Metric.counter('eventiva.function.started').pipe(
                            Metric.tagged('operation', 'spec.repeat')
                        );
                        const completed = Metric.counter('eventiva.function.completed').pipe(
                            Metric.tagged('operation', 'spec.repeat')
                        );
                        const beforeStarts = (yield* Metric.value(started)).count;
                        const beforeDuration = yield* durations('spec.repeat');
                        let executions = 0;
                        const calculate = Effect.fn('spec.repeat', { captureStackTrace: false })(
                            /**
                             * Advance unequal durations on each execution so a shared start timestamp produces the wrong sum.
                             *
                             * @param left - The operand weighted by ten.
                             * @param right - The unweighted operand.
                             * @yields The test-clock adjustment for this execution.
                             * @returns Ten times the first argument plus the second.
                             */ function* (left: number, right: number) {
                                executions++;
                                yield* TestClock.adjust(`${3 + executions * 5} millis`);
                                return left * 10 + right;
                            }
                        );
                        const onceConstructed = calculate(4, 1).pipe(observation);
                        expectTypeOf(onceConstructed).toExtend<
                            Effect.Effect<number, FunctionInstrumentationFailure, Flags | Scope.Scope>
                        >();
                        expect(calculate.length).toBe(2);
                        expect(executions).toBe(0);
                        expect((yield* Metric.value(started)).count).toBe(beforeStarts);
                        expect((yield* durations('spec.repeat')).count).toBe(beforeDuration.count);
                        expect(yield* onceConstructed).toBe(41);
                        expect(yield* onceConstructed).toBe(41);
                        expect(executions).toBe(2);
                        expect((yield* Metric.value(started)).count - beforeStarts).toBe(2);
                        expect((yield* Metric.value(completed)).count).toBe(2);
                        const after = yield* durations('spec.repeat');
                        expect(after.count - beforeDuration.count).toBe(2);
                        expect(after.sum - beforeDuration.sum).toBe(21);
                    }
                ).pipe(Effect.provide(Layer.mergeAll(FlagsSafeDefaults, functionTelemetryTestLayer)))
            )
    );

    it.effect(
        'bounds synchronous interpreter work against the same named generator in both modes',
        /**
         * Compare dispatcher work without using CI elapsed time as a performance oracle.
         *
         * @returns The two-mode test with no wall-clock assertion.
         */ () =>
            Effect.scoped(
                Effect.gen(
                    /**
                     * Prepare one operator and run the same check with and without profiling.
                     */
                    function* () {
                        const catalog = yield* functionCatalog(['spec.repeat']);
                        const observe = yield* functionObservation(catalog, 'spec.repeat');
                        const native = Effect.fn('spec.repeat', { captureStackTrace: false })(
                            /**
                             * Supply the same native arithmetic for both arms.
                             *
                             * @param a - The operand weighted by ten.
                             * @param b - The unweighted operand.
                             * @yields The arithmetic result as a successful effect.
                             * @returns Ten times the first argument plus the second.
                             */
                            function* (a: number, b: number) {
                                return yield* Effect.succeed(a * 10 + b);
                            }
                        );
                        const ops = Effect.withFiberRuntime<number>(
                            /**
                             * Read interpreter work on the current synchronous fiber.
                             *
                             * @param fiber - The running fiber shared by both arms.
                             * @returns An effect yielding the number of operations since the last yield.
                             */ (fiber) => Effect.succeed(fiber.currentOpCount)
                        );
                        const compare = Effect.gen(
                            /**
                             * Measure adjacent native and observed executions without a scheduler yield.
                             */
                            function* () {
                                const from = yield* ops;
                                expect(yield* native(4, 1)).toBe(41);
                                const middle = yield* ops;
                                expect(yield* native(4, 1).pipe(observe)).toBe(41);
                                const to = yield* ops;
                                expect(middle - from).toBeGreaterThan(0);
                                expect(to - middle).toBeGreaterThan(0);
                                expect(to - middle).toBeLessThanOrEqual((middle - from) * 4.5);
                            }
                        ).pipe(Effect.withMaxOpsBeforeYield(100000));
                        yield* compare;
                        yield* compare.pipe(Effect.provide(functionTelemetryTestLayer));
                    }
                ).pipe(Effect.provide(FlagsSafeDefaults))
            )
    );

    it.effect(
        'preserves values, exact original failures and defects, and interruption with all-exit completion',
        /**
         * Verify every business exit and its finalizer through the owner-selected native recovery oracles.
         *
         * @returns The test comparing observed exits with native business exits.
         */ () =>
            Effect.scoped(
                Effect.gen(
                    /** Compare distinct typed and defective originals with native controls before deterministic interruption. */ function* () {
                        const catalog = yield* functionCatalog(['spec.exits']);
                        const observation = yield* functionObservation(catalog, 'spec.exits');
                        const entered = yield* Deferred.make<void>();
                        const finalized = yield* Ref.make(0);
                        const failure = { _tag: 'BusinessFailure', private: 'PRIVATE_FAILURE_CANARY' } as const;
                        const nativeFailure = { _tag: 'BusinessFailure', private: 'DISTINCT_NATIVE_CANARY' } as const;
                        const defect = new Error('PRIVATE_DEFECT_CANARY');
                        const nativeDefect = new Error('DISTINCT_NATIVE_DEFECT_CANARY');
                        const operation = Effect.fn('spec.exits')(
                            /**
                             * Produce one selected business exit and signal entry only for the interruptible branch.
                             *
                             * @param mode - The business exit selected for this execution.
                             * @yields The selected failure, defect or interruptible wait.
                             * @returns The value 73 on the success path only.
                             */
                            function* (mode: 'success' | 'failure' | 'defect' | 'interrupt') {
                                if (mode === 'failure') return yield* Effect.fail(failure);
                                if (mode === 'defect') return yield* Effect.die(defect);
                                if (mode === 'interrupt') {
                                    yield* Deferred.succeed(entered, undefined);
                                    return yield* Effect.never;
                                }
                                return 73;
                            },
                            Effect.ensuring(
                                Ref.update(
                                    finalized,
                                    /**
                                     * Count business finalizers independently of observer completion metrics.
                                     *
                                     * @param value - The prior business finalizer count.
                                     * @returns The incremented business finalizer count.
                                     */ (value) => value + 1
                                )
                            )
                        );
                        const native = Effect.fn('spec.native-exits')(
                            /**
                             * Exercise native annotation behavior without any primitive operator.
                             *
                             * @param mode - The business exit selected for this execution.
                             * @yields The native failure or defect used as a comparison.
                             * @returns Never completes successfully in either failure mode.
                             */ function* (mode: 'failure' | 'defect') {
                                return yield* mode === 'failure'
                                    ? Effect.fail(nativeFailure)
                                    : Effect.die(nativeDefect);
                            }
                        );
                        expect(yield* operation('success').pipe(observation)).toBe(73);
                        const failed = yield* Effect.exit(operation('failure').pipe(observation));
                        const nativeFailed = yield* Effect.exit(native('failure'));
                        expect(
                            Exit.isFailure(failed) &&
                                Cause.originalError(Option.getOrUndefined(Cause.failureOption(failed.cause)))
                        ).toBe(failure);
                        expect(
                            Exit.isFailure(nativeFailed) &&
                                Cause.originalError(Option.getOrUndefined(Cause.failureOption(nativeFailed.cause)))
                        ).toBe(nativeFailure);
                        expect(failure).not.toBe(nativeFailure);
                        const died = yield* Effect.exit(operation('defect').pipe(observation));
                        const nativeDied = yield* Effect.exit(native('defect'));
                        expect(
                            Exit.isFailure(died) &&
                                Cause.originalError(Option.getOrUndefined(Cause.dieOption(died.cause)))
                        ).toBe(defect);
                        expect(
                            Exit.isFailure(nativeDied) &&
                                Cause.originalError(Option.getOrUndefined(Cause.dieOption(nativeDied.cause)))
                        ).toBe(nativeDefect);
                        expect(defect).not.toBe(nativeDefect);
                        const fiber = yield* Effect.fork(operation('interrupt').pipe(observation));
                        yield* Deferred.await(entered);
                        const interrupted = yield* Fiber.interrupt(fiber);
                        expect(Exit.isFailure(interrupted) && Cause.isInterrupted(interrupted.cause)).toBe(true);
                        expect(yield* Ref.get(finalized)).toBe(4);
                        for (const name of ['started', 'completed', 'executions']) {
                            expect(
                                (yield* Metric.value(
                                    Metric.counter(`eventiva.function.${name}`).pipe(
                                        Metric.tagged('operation', 'spec.exits')
                                    )
                                )).count
                            ).toBe(4);
                        }
                        expect((yield* durations('spec.exits')).count).toBe(4);
                    }
                ).pipe(Effect.provide(Layer.mergeAll(FlagsSafeDefaults, functionTelemetryTestLayer)))
            )
    );

    it.effect(
        'retains the caller resource scope and the exact environment and receiver values',
        /**
         * Verify scope finalizers outlive observer restoration and receiver arguments remain asymmetric.
         *
         * @returns The scoped acquisition, receiver and service propagation check.
         */ () =>
            Effect.gen(
                /** Observe resource release outside the caller's scope rather than inside the observer's private scope. */ function* () {
                    /** Supply an explicit typed environment value separate from receiver and arguments. */
                    class Input extends Context.Tag('spec/Input')<Input, number>() {}
                    const released = yield* Ref.make(0);
                    yield* Effect.scoped(
                        Effect.gen(
                            /** Hold the caller scope open while checking the acquired business resource remains live. */ function* () {
                                const catalog = yield* functionCatalog(['spec.receiver']);
                                const observation = yield* functionObservation(catalog, 'spec.receiver');
                                const method = Effect.fn('spec.receiver')(
                                    /**
                                     * Acquire a caller-owned resource and combine distinct receiver, positional and environment values.
                                     *
                                     * @param this - The receiver supplied by the test.
                                     * @param this.base - The receiver contribution to the result.
                                     * @param left - The operand weighted by ten.
                                     * @param right - The unweighted operand.
                                     * @yields Caller-scoped acquisition and the typed input service.
                                     * @returns The receiver offset plus the weighted arguments and input service.
                                     */ function* (this: { readonly base: number }, left: number, right: number) {
                                        yield* Effect.acquireRelease(
                                            Effect.void,
                                            /**
                                             * Record actual scope release without changing the method result.
                                             *
                                             * @returns The release-count update performed on scope closure.
                                             */ () =>
                                                Ref.update(
                                                    released,
                                                    /**
                                                     * Count each independent resource finalizer once.
                                                     *
                                                     * @param count - The previous number of resource releases.
                                                     * @returns The incremented release count.
                                                     */ (count) => count + 1
                                                )
                                        );
                                        return this.base + left * 10 + right + (yield* Input);
                                    }
                                );
                                expect(method.length).toBe(2);
                                expect(
                                    yield* method
                                        .call({ base: 100 }, 7, 2)
                                        .pipe(observation, Effect.provideService(Input, 5))
                                ).toBe(177);
                                expect(yield* Ref.get(released)).toBe(0);
                            }
                        ).pipe(Effect.provide(FlagsSafeDefaults))
                    );
                    expect(yield* Ref.get(released)).toBe(1);
                }
            )
    );

    it.effect(
        'keeps concurrent descendants beneath their own parent and contains private payloads at projection',
        /**
         * Prove sibling interleaving cannot mix parentage or export private arguments.
         *
         * @returns The concurrent ancestry and projection privacy check.
         */ () =>
            Effect.gen(
                /** Inspect the existing sanitized local projection after both concurrent parent operations drain. */ function* () {
                    const collected = yield* capture();
                    yield* Effect.scoped(
                        Effect.gen(
                            /** Execute two independently observed parent-child trees with an explicit interleaving point. */ function* () {
                                const catalog = yield* functionCatalog(['spec.parent', 'spec.child']);
                                const childObservation = yield* functionObservation(catalog, 'spec.child');
                                const parentObservation = yield* functionObservation(catalog, 'spec.parent');
                                const child = Effect.fn('spec.child')(
                                    /**
                                     * Return a private value unchanged after yielding to the concurrent sibling.
                                     *
                                     * @param input - The private value that must not appear in telemetry.
                                     * @yields A scheduler yield to allow sibling interleaving.
                                     * @returns The original input, without recording it as telemetry.
                                     */ function* (input: string) {
                                        yield* Effect.yieldNow();
                                        return input;
                                    }
                                );
                                const parent = Effect.fn('spec.parent')(
                                    /**
                                     * Consume the child's observed Effect in the same fiber ancestry.
                                     *
                                     * @param input - The private value that must not appear in telemetry.
                                     * @yields The observed child computation.
                                     * @returns The unchanged child result.
                                     */ function* (input: string) {
                                        return yield* child(input).pipe(childObservation);
                                    }
                                );
                                expect(
                                    yield* Effect.all(
                                        [
                                            parent('PRIVATE_ARGUMENT_CANARY').pipe(parentObservation),
                                            parent('second').pipe(parentObservation),
                                        ],
                                        { concurrency: 'unbounded' }
                                    )
                                ).toEqual(['PRIVATE_ARGUMENT_CANARY', 'second']);
                                yield* (yield* TelemetryControl).flush;
                            }
                        ).pipe(
                            Effect.provide(
                                Layer.mergeAll(
                                    FlagsSafeDefaults,
                                    functionTelemetryTestLayer,
                                    telemetryLayer({
                                        messages: { 'spec.parent': 'Parent.', 'spec.child': 'Child.' },
                                        attributes: {},
                                    }).pipe(Layer.provide(collected.sink))
                                )
                            )
                        )
                    );
                    const records = yield* Ref.get(collected.records);
                    expect(JSON.stringify(records)).not.toContain('PRIVATE_ARGUMENT_CANARY');
                    const children = records.filter(
                        /**
                         * Select only child subject spans from the projected record set.
                         *
                         * @param entry - A candidate telemetry record.
                         * @returns Whether the record is a child subject span.
                         */ (entry) => entry.signal === 'span' && entry.code === 'spec.child'
                    );
                    const parents = records.filter(
                        /**
                         * Select parent subject spans without relying on their completion order.
                         *
                         * @param entry - A candidate telemetry record.
                         * @returns Whether the record is a parent subject span.
                         */ (entry) => entry.signal === 'span' && entry.code === 'spec.parent'
                    );
                    expect(children).toHaveLength(2);
                    expect(parents).toHaveLength(2);
                    expect(
                        new Set(
                            children.map(
                                /**
                                 * Distinct parent identifiers must survive sibling interleaving.
                                 *
                                 * @param entry - A candidate telemetry record.
                                 * @returns The identifier of the observed parent.
                                 */ (entry) => entry.parentSpanId
                            )
                        ).size
                    ).toBe(2);
                    expect(
                        children.every(
                            /**
                             * Require every child to share both the span ancestry and trace of an observed parent.
                             *
                             * @param entry - A candidate telemetry record.
                             * @returns Whether an observed parent matches the child ancestry.
                             */ (entry) =>
                                parents.some(
                                    /**
                                     * Match identifier relationships rather than an incidental array position.
                                     *
                                     * @param parent - A projected parent span.
                                     * @returns Whether both the parent identifier and trace match the child.
                                     */ (parent) =>
                                        parent.spanId === entry.parentSpanId && parent.traceId === entry.traceId
                                )
                        )
                    ).toBe(true);
                }
            )
    );

    it.effect(
        'enforces the bounded operation catalog before execution without collisions or private errors',
        /**
         * Exercise the exact target-wide final slot, rejected overflow and atomic readmission across handles.
         *
         * @returns The bounded admission and atomic rejection check.
         */ () =>
            Effect.scoped(
                Effect.gen(
                    /** Fill the remaining static target catalog while preserving names used by other public cases. */ function* () {
                        const publicCases = [
                            'spec.boundaries',
                            'spec.signals',
                            'spec.helpers',
                            'spec.outer',
                            'spec.enabled-control',
                            'spec.repeat',
                            'spec.exits',
                            'spec.receiver',
                            'spec.parent',
                            'spec.child',
                        ];
                        const full = [
                            ...publicCases,
                            ...Array.from(
                                { length: 8190 - publicCases.length },
                                /**
                                 * Produce deterministic static capacity names with no request-derived label content.
                                 *
                                 * @param _ - The unused array element.
                                 * @param index - The zero-based catalog slot.
                                 * @returns A distinct static operation name for the capacity fixture.
                                 */ (_, index) => `spec.capacity-${index}`
                            ),
                        ];
                        const catalog = yield* functionCatalog(full);
                        expect(
                            Exit.isSuccess(yield* Effect.exit(functionObservation(catalog, 'spec.capacity-8179')))
                        ).toBe(true);
                        expect(
                            Exit.isFailure(yield* Effect.exit(functionCatalog(['spec.cross-handle-overflow'])))
                        ).toBe(true);
                        expect(Exit.isSuccess(yield* Effect.exit(functionCatalog(['spec.repeat'])))).toBe(true);
                        for (const invalid of [
                            [...full, 'spec.overflow'],
                            ['spec.same', 'spec.same'],
                            ['telemetry.function.prepare'],
                            ['PRIVATE_CANARY'],
                        ]) {
                            const exit = yield* Effect.exit(functionCatalog(invalid));
                            expect(
                                Exit.isFailure(exit) && Option.getOrUndefined(Cause.failureOption(exit.cause))?.reason
                            ).toBe('catalog');
                        }
                        const unknown = yield* Effect.exit(functionObservation(catalog, 'spec.not-admitted'));
                        expect(
                            Exit.isFailure(unknown) && Option.getOrUndefined(Cause.failureOption(unknown.cause))?.reason
                        ).toBe('operation');
                    }
                ).pipe(Effect.provide(FlagsSafeDefaults))
            )
    );
});
