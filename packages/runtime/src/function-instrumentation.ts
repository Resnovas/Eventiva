/**
 * @file packages/runtime/src/function-instrumentation.ts
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

import { Flags, type Flag } from '@eventiva/contracts/flags';
import {
    Array as ArrayOps,
    BigInt as BigIntOps,
    Boolean as BooleanOps,
    type Cause,
    Clock,
    Context,
    Data,
    Duration,
    Effect,
    FiberRef,
    Function,
    HashMap,
    Layer,
    Metric,
    MetricKey,
    Option,
    Schema,
    Scope,
    Struct,
    Tuple,
} from 'effect';

/** Static declarations; operation identity is not an argument/result-derived attribute. */
export const functionSignalFlags = {
    counters: {
        key: 'telemetry.function.counters',
        owner: 'platform',
        description: 'Collect local function counters.',
        safeDefault: true,
    },
    metrics: {
        key: 'telemetry.function.metrics',
        owner: 'platform',
        description: 'Collect local function execution metrics.',
        safeDefault: true,
    },
    traces: {
        key: 'telemetry.function.traces',
        owner: 'platform',
        description: 'Enable local function tracing.',
        safeDefault: true,
    },
    spans: {
        key: 'telemetry.function.spans',
        owner: 'platform',
        description: 'Enable local function spans.',
        safeDefault: true,
    },
    attributes: {
        key: 'telemetry.function.attributes',
        owner: 'platform',
        description: 'Attach static function attributes.',
        safeDefault: true,
    },
    timer: {
        key: 'telemetry.function.timer',
        owner: 'platform',
        description: 'Profile function execution in tests only.',
        safeDefault: false,
    },
} as const satisfies Readonly<Record<string, Flag>>;

/** Explicit test composition capability; absence is production behavior, with no additional timer reads. */
export class FunctionTelemetryTest extends Context.Tag('@eventiva/runtime/FunctionTelemetryTest')<
    FunctionTelemetryTest,
    void
>() {}

/** Install only in tests: timing is then mandatory even when ordinary local signals are disabled. */
export const functionTelemetryTestLayer = Layer.succeed(FunctionTelemetryTest, undefined);

/** Closed rejection categories contain neither an operation supplied by a caller nor a decoding Cause. */
interface FunctionInstrumentationFailureFields {
    readonly reason: 'catalog' | 'operation' | 'timer-required';
}

/** Keep the vendor error constructor's open generic out of public declarations. */
const failureBase: new (
    fields: FunctionInstrumentationFailureFields
) => Cause.YieldableError & FunctionInstrumentationFailureFields & { readonly _tag: 'FunctionInstrumentationFailure' } =
    Data.TaggedError('FunctionInstrumentationFailure')<FunctionInstrumentationFailureFields>;

/** Admission failures occur before the supplied business Effect executes. */
export class FunctionInstrumentationFailure extends failureBase {}

const catalogBrand: unique symbol = Symbol('FunctionCatalog');

/** Opaque immutable admission handle; the actual operation set is never exposed to callers. */
export interface FunctionCatalog {
    readonly [catalogBrand]: true;
}

const catalogs = new WeakMap<FunctionCatalog, ReadonlySet<string>>();
const operationName = Schema.String.pipe(
    Schema.minLength(1),
    Schema.maxLength(96),
    Schema.pattern(/^[a-z][a-z0-9._-]*$/)
);
const catalogInput = Schema.Array(operationName).pipe(Schema.maxItems(8190));
const helperNames = ['telemetry.function.catalog', 'telemetry.function.prepare'] as const;
const admittedNames = new Set<string>(helperNames);
const failedObservation = Metric.counter('eventiva.function.observer_failed');
const durationMetric = Metric.timer('eventiva.function.duration_ms');

/** One execution's admitted flag snapshot, supplied before any native named span starts. */
class Signals extends Context.Tag('@eventiva/runtime/FunctionSignals')<
    Signals,
    {
        readonly counters: boolean;
        readonly metrics: boolean;
        readonly traces: boolean;
        readonly spans: boolean;
        readonly attributes: boolean;
        readonly timer: boolean;
    }
>() {}

/** Private scope is only for restoring fiber locals; resource finalizers retain the caller's original scope. */
class CallerScope extends Context.Tag('@eventiva/runtime/FunctionCallerScope')<CallerScope, Scope.Scope>() {}

/** Each execution receives its own profiling start; production has no additional clock acquisition. */
class Started extends Context.Tag('@eventiva/runtime/FunctionStarted')<Started, bigint>() {}

const evaluate = Effect.serviceFunctions(Flags).evaluate;
const unavailable = Metric.increment(failedObservation).pipe(
    Effect.locally(FiberRef.currentMetricLabels, []),
    Effect.as(true)
);
const counters = evaluate(functionSignalFlags.counters).pipe(
    Effect.map(Struct.get('value')),
    Effect.catchAllDefect(Function.constant(unavailable))
);
const metrics = evaluate(functionSignalFlags.metrics).pipe(
    Effect.map(Struct.get('value')),
    Effect.catchAllDefect(Function.constant(unavailable))
);
const traces = evaluate(functionSignalFlags.traces).pipe(
    Effect.map(Struct.get('value')),
    Effect.catchAllDefect(Function.constant(unavailable))
);
const spans = evaluate(functionSignalFlags.spans).pipe(
    Effect.map(Struct.get('value')),
    Effect.catchAllDefect(Function.constant(unavailable))
);
const attributes = evaluate(functionSignalFlags.attributes).pipe(
    Effect.map(Struct.get('value')),
    Effect.catchAllDefect(Function.constant(unavailable))
);
const timer = Effect.if(Effect.serviceOption(FunctionTelemetryTest).pipe(Effect.map(Option.isSome)), {
    onTrue: Function.constant(
        evaluate({ ...functionSignalFlags.timer, safeDefault: true }).pipe(
            Effect.map(Struct.get('value')),
            Effect.catchAllDefect(Function.constant(unavailable)),
            Effect.filterOrFail(
                Function.identity,
                Function.constant(new FunctionInstrumentationFailure({ reason: 'timer-required' }))
            )
        )
    ),
    onFalse: Function.constant(
        evaluate(functionSignalFlags.timer).pipe(
            Effect.as(false),
            Effect.catchAllDefect(Function.constant(Effect.succeed(false)))
        )
    ),
});
const signalValues = Effect.all({ counters, metrics, traces, spans, attributes, timer });
const tracerEnabled = Effect.all([
    FiberRef.get(FiberRef.currentTracerEnabled),
    Signals.pipe(Effect.map(Struct.get('traces'))),
    Signals.pipe(Effect.map(Struct.get('spans'))),
]).pipe(Effect.map(BooleanOps.every));
const tracingSetup = Effect.all(
    [
        Effect.locallyScoped(FiberRef.currentTracerEnabled, false).pipe(
            Effect.whenEffect(tracerEnabled.pipe(Effect.map(BooleanOps.not)))
        ),
        Effect.if(Signals.pipe(Effect.map(Struct.get('attributes'))), {
            onTrue: Function.constant(
                Effect.locallyScoped(
                    FiberRef.currentTracerSpanAnnotations,
                    HashMap.make(['eventiva.function.source', 'generator'])
                )
            ),
            onFalse: Function.constant(Effect.locallyScoped(FiberRef.currentTracerSpanAnnotations, HashMap.empty())),
        }),
    ],
    { discard: true }
);
const startTime = Effect.if(Signals.pipe(Effect.map(Struct.get('timer'))), {
    onTrue: Function.constant(Clock.currentTimeNanos),
    onFalse: Function.constant(Effect.succeed(0n)),
});

/** Sequence native setup without allocating/restoring an unused service Context; retain all business type channels. */
const retainEffect: <A, E, R>(
    value: Effect.Effect<A, E, R>
) => /** Run void setup before exposing the original business Effect to native flatten. */ (
    setup: Effect.Effect<void, never, Scope.Scope | Signals>
) => Effect.Effect<Effect.Effect<A, E, R>, never, Scope.Scope | Signals> = Effect.as;

const control = Function.flow(
    Effect.provideServiceEffect(Scope.Scope, CallerScope),
    Effect.provideServiceEffect(Started, startTime),
    retainEffect,
    Function.apply(tracingSetup),
    Effect.flatten,
    Effect.scoped,
    Effect.provideServiceEffect(CallerScope, Effect.scope),
    Effect.provideServiceEffect(Signals, signalValues)
);

const helperStart = Effect.if(Signals.pipe(Effect.map(Struct.get('counters'))), {
    onTrue: Function.constant(Metric.increment(Metric.counter('eventiva.function.started'))),
    onFalse: Function.constant(Effect.void),
});
const helperFinish = Effect.all(
    [
        Effect.if(Signals.pipe(Effect.map(Struct.get('counters'))), {
            onTrue: Function.constant(Metric.increment(Metric.counter('eventiva.function.completed'))),
            onFalse: Function.constant(Effect.void),
        }),
        Effect.if(Signals.pipe(Effect.map(Struct.get('metrics'))), {
            onTrue: Function.constant(Metric.increment(Metric.counter('eventiva.function.executions'))),
            onFalse: Function.constant(Effect.void),
        }),
        Effect.if(Signals.pipe(Effect.map(Struct.get('timer'))), {
            onTrue: Function.constant(
                Effect.zipWith(Clock.currentTimeNanos, Started, BigIntOps.subtract).pipe(
                    Effect.map(Duration.nanos),
                    durationMetric,
                    Effect.asVoid
                )
            ),
            onFalse: Function.constant(Effect.void),
        }),
    ],
    { discard: true }
).pipe(Effect.catchAllCause(Function.constant(Effect.asVoid(unavailable))));

const catalogSignals = Function.flow(
    Effect.ensuring(
        helperFinish.pipe(
            Effect.tagMetrics('operation', 'telemetry.function.catalog'),
            Effect.locally(FiberRef.currentMetricLabels, [])
        )
    ),
    retainEffect,
    Function.apply(
        helperStart.pipe(
            Effect.tagMetrics('operation', 'telemetry.function.catalog'),
            Effect.locally(FiberRef.currentMetricLabels, [])
        )
    ),
    Effect.flatten
);

/**
 * Admit static names before preparing operations. Two helper names plus user names must total at most 8192.
 * Purity marks only native generator definition, allowing unused declarations to match the Vite baseline.
 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/architecture/function-telemetry.md#primitive-measurements
 */
const catalogOperation = /* @__PURE__ */ Effect.fn('telemetry.function.catalog', { captureStackTrace: false })(
    /**
     * Atomically admit a target-wide bounded union without exposing invalid supplied text in failures.
     * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/architecture/function-telemetry.md#primitive-measurements
     */
    function* (input: ReadonlyArray<string>) {
        const names = yield* Schema.decodeUnknown(catalogInput)(input).pipe(
            Effect.mapError(Function.constant(new FunctionInstrumentationFailure({ reason: 'catalog' })))
        );
        const registered = new Set<string>(helperNames);
        for (const name of names) {
            if (registered.has(name)) return yield* new FunctionInstrumentationFailure({ reason: 'catalog' });
            registered.add(name);
        }
        const union = new Set(admittedNames);
        for (const name of registered) union.add(name);
        if (union.size > 8192) return yield* new FunctionInstrumentationFailure({ reason: 'catalog' });
        for (const name of registered) admittedNames.add(name);
        const handle: FunctionCatalog = Object.freeze({ [catalogBrand]: true as const });
        catalogs.set(handle, registered);
        return handle;
    },
    catalogSignals
);

/**
 * Admit operation names through a lazy named generator, with Flags acquired outside that generator's span.
 * The outer native flow introduces no authored helper body; preserve the generator's argument count explicitly.
 */
export const functionCatalog = Object.defineProperty(Function.flow(catalogOperation, control), 'length', {
    value: catalogOperation.length,
    configurable: true,
});

const preparationSignals = Function.flow(
    Effect.ensuring(
        helperFinish.pipe(
            Effect.tagMetrics('operation', 'telemetry.function.prepare'),
            Effect.locally(FiberRef.currentMetricLabels, [])
        )
    ),
    retainEffect,
    Function.apply(
        helperStart.pipe(
            Effect.tagMetrics('operation', 'telemetry.function.prepare'),
            Effect.locally(FiberRef.currentMetricLabels, [])
        )
    ),
    Effect.flatten
);

/**
 * Prepare an observation pipeable for the returned Effect, not for Effect.fn's definition-time pipeable list.
 * Preparation is an explicit Effect, not business execution. Reexecuting its result acquires fresh Flags/start state.
 * Prepare counter/metric operators once, choosing between them from six fresh evaluations on each execution.
 * Direct fiber-local wrappers sanitize and restore tracing without transferring business resources to a new scope.
 * Purity marks only native generator definition, allowing unused declarations to match the Vite baseline.
 * @agent-optimization reviewed=2026-11-27; result=best-found; evidence=docs/architecture/function-telemetry.md#matched-5x-budget---2026-11-27
 */
const prepareOperation = /* @__PURE__ */ Effect.fn('telemetry.function.prepare', { captureStackTrace: false })(
    /**
     * Build immutable metric operators only after catalog admission; acquire mutable timing and Flags at execution.
     * Suspend pretagged metric writes with explicit empty additional labels; ambient labels must never reach these keys.
     * @agent-optimization reviewed=2026-11-27; result=best-found; evidence=docs/architecture/function-telemetry.md#matched-5x-budget---2026-11-27
     */
    function* (catalog: FunctionCatalog, operation: string) {
        if (!catalogs.get(catalog)?.has(operation))
            return yield* new FunctionInstrumentationFailure({ reason: 'operation' });
        const started = Metric.fromMetricKey(
            MetricKey.counter('eventiva.function.started').pipe(MetricKey.tagged('operation', operation))
        );
        const completed = Metric.fromMetricKey(
            MetricKey.counter('eventiva.function.completed').pipe(MetricKey.tagged('operation', operation))
        );
        const executions = Metric.fromMetricKey(
            MetricKey.counter('eventiva.function.executions').pipe(MetricKey.tagged('operation', operation))
        );
        const duration = Metric.fromMetricKey(
            MetricKey.histogram('eventiva.function.duration_ms', durationMetric.keyType.boundaries).pipe(
                MetricKey.tagged('operation', operation),
                MetricKey.tagged('time_unit', 'milliseconds')
            )
        ).pipe(Metric.mapInput(Duration.toMillis));
        /** A prepared signal wrapper cannot add requirements or change a business value or failure. */
        type Operator = <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
        type Choice = Effect.Effect<Operator, FunctionInstrumentationFailure, Flags>;
        /** Preserve the particular business channels across the vendor's higher-order application. */
        const apply: <A, E, R>(
            work: Effect.Effect<A, E, R>
        ) => /** Apply the wrapper chosen for this execution. */ (
            /** Observe this exact work without erasing channels. */ operator: (
                work: Effect.Effect<A, E, R>
            ) => Effect.Effect<A, E, R>
        ) => Effect.Effect<A, E, R> = Function.apply;
        /** Distinguish a pure ambient read from flag admission, which can reject an execution. */
        type Select<E2, R2> = <A, E, R>(
            /** Apply an admitted operator to the caller's work. */ use: (operator: Operator) => Effect.Effect<A, E, R>
        ) => /** Propagate selection failures before entering business work. */ (
            choice: Effect.Effect<Operator, E2, R2>
        ) => Effect.Effect<A, E | E2, R | R2>;
        const bindSignals: Select<FunctionInstrumentationFailure, Flags | Scope.Scope> = Effect.flatMap;
        /** Keep sanitation outside metric observation and business execution. */
        const compose: (inner: Operator, outer: Operator) => Operator = Function.compose;
        const surround = Function.untupled(Function.flow(Tuple.swap<Operator, Operator>, Function.tupled(compose)));
        const begin = Effect.sync(started.unsafeUpdate.bind(started, 1, []));
        const complete = Effect.sync(completed.unsafeUpdate.bind(completed, 1, []));
        const measureExecution = Effect.sync(executions.unsafeUpdate.bind(executions, 1, []));
        const updateDuration = Function.flow(
            Duration.nanos,
            Tuple.make<[Duration.Duration]>,
            Tuple.appendElement([]),
            Function.tupled(duration.unsafeUpdate)
        );
        /** Subtract the execution-local start from the finalizer's clock reading. */
        type Elapsed = (end: bigint) => bigint;
        /** Bind a fresh start without installing and restoring a context service. */
        const elapsedSince: (start: bigint) => Elapsed = BigIntOps.subtract;
        /** Read the final clock only when the all-exit metric executes. */
        const mapClock: (
            elapsed: Elapsed
        ) => /** Apply the elapsed-time calculation to the current clock. */ (
            clock: Effect.Effect<bigint>
        ) => Effect.Effect<bigint> = Effect.map;
        const readEnd = Function.flow(mapClock, Function.apply(Clock.currentTimeNanos));
        const recordSince = Function.flow(elapsedSince, readEnd, Effect.map(updateDuration));
        const tracingOff = Effect.locally(FiberRef.currentTracerEnabled, false);
        const sanitized = Effect.locally(
            FiberRef.currentTracerSpanAnnotations,
            HashMap.make(['eventiva.function.source', 'generator'])
        );
        const empty = Effect.locally(FiberRef.currentTracerSpanAnnotations, HashMap.empty<string, string>());
        const trace = Effect.zipWith(traces, spans, BooleanOps.and);
        let choices: Choice[] = [];
        for (const count of [false, true])
            for (const measure of [false, true]) {
                const end = Effect.zipRight(count ? complete : Effect.void, measure ? measureExecution : Effect.void);
                const plain = Effect.ensuring(
                    end.pipe(Effect.catchAllCause(Function.constant(Effect.asVoid(unavailable))))
                );
                /** Count an admitted start immediately before running the guarded business effect. */
                const following: <A, E, R>(
                    value: Effect.Effect<A, E, R>
                ) => /** Keep the business result instead of the counter's void result. */ (
                    first: Effect.Effect<void>
                ) => Effect.Effect<A, E, R> = Effect.zipRight;
                const start: Operator = count ? Function.flow(following, Function.apply(begin)) : Function.identity;
                /** Complete the admitted counters before recording the profiled duration. */
                const afterCounters: (record: Effect.Effect<void>) => Effect.Effect<void> = Function.flow(
                    following,
                    Function.apply(end)
                );
                /** Preserve all business channels when attaching the prepared completion observer. */
                const finalize: (effect: Effect.Effect<void>) => Operator = Effect.ensuring;
                const withStart = surround.bind(undefined, start);
                const profiled = Clock.currentTimeNanos.pipe(
                    Effect.map(
                        Function.flow(
                            recordSince,
                            afterCounters,
                            Effect.catchAllCause(Function.constant(Effect.asVoid(unavailable))),
                            finalize,
                            withStart
                        )
                    )
                );
                const bindTimed: Select<never, never> = Effect.flatMap;
                const timed: Operator = Function.flow(apply, bindTimed, Function.apply(profiled));
                for (const enabled of [false, true])
                    for (const annotate of [empty, sanitized])
                        for (const finish of [compose(plain, start), timed]) {
                            const local = compose(finish, annotate);
                            const disabled = Effect.succeed(compose(local, tracingOff));
                            choices.push(
                                enabled
                                    ? Effect.if(FiberRef.currentTracerEnabled, {
                                          onTrue: Function.constant(Effect.succeed(local)),
                                          onFalse: Function.constant(disabled),
                                      })
                                    : disabled
                            );
                        }
            }
        for (const flag of [timer, attributes, trace, metrics, counters]) {
            const parents: Choice[] = [];
            for (let i = 0; i < choices.length; i += 2)
                parents.push(
                    Effect.if(flag, {
                        onFalse: Function.constant(ArrayOps.unsafeGet(choices, i)),
                        onTrue: Function.constant(ArrayOps.unsafeGet(choices, i + 1)),
                    })
                );
            choices = parents;
        }
        const select = Effect.zipLeft(ArrayOps.unsafeGet(choices, 0), Effect.scope);
        return Function.flow(apply, bindSignals, Function.apply(select));
    },
    preparationSignals
);

/** Prepare the native operator with Flags outside the preparation helper's own named generator span. */
export const functionObservation = Object.defineProperty(Function.flow(prepareOperation, control), 'length', {
    value: prepareOperation.length,
    configurable: true,
});
