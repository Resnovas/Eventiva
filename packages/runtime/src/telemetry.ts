/**
 * @file packages/runtime/src/telemetry.ts
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

import { TelemetryRecord, TelemetrySink, TelemetrySinkFailure } from '@eventiva/contracts/observability';
import {
    Cause,
    Config,
    Context,
    Deferred,
    Effect,
    Exit,
    Fiber,
    FiberRef,
    FiberRefs,
    HashMap,
    HashSet,
    Layer,
    Logger,
    Option,
    Queue,
    Schema,
    Tracer,
} from 'effect';

/** Trusted static deployment declarations, not user text or remotely supplied templates. */
export const TelemetryPolicy = Schema.Struct({
    messages: Schema.Record({ key: TelemetryRecord.fields.code, value: TelemetryRecord.fields.text }).pipe(
        Schema.filter((messages) => Object.keys(messages).length <= 128)
    ),
    attributes: Schema.Record({
        key: TelemetryRecord.fields.code,
        value: Schema.Array(Schema.String.pipe(Schema.maxLength(96), Schema.pattern(/^[a-zA-Z0-9._-]*$/))).pipe(
            Schema.maxItems(32)
        ),
    }).pipe(Schema.filter((attributes) => Object.keys(attributes).length <= 16)),
});
export type TelemetryPolicy = typeof TelemetryPolicy.Type;

export const telemetryConfig = Config.all({
    enabled: Config.boolean('enabled').pipe(Config.withDefault(true)),
    capacity: Config.integer('capacity').pipe(
        Config.withDefault(256),
        Config.validate({ message: 'invalid capacity', validation: (n) => n >= 1 && n <= 4096 })
    ),
    timeoutMs: Config.integer('timeoutMs').pipe(
        Config.withDefault(1000),
        Config.validate({ message: 'invalid timeout', validation: (n) => n >= 1 && n <= 10000 })
    ),
}).pipe(Config.nested('telemetry'));

export interface TelemetryHealth {
    readonly accepted: number;
    readonly completed: number;
    readonly dropped: number;
    readonly failed: number;
    readonly closed: boolean;
    readonly shutdownFailed: boolean;
}

export class TelemetryControl extends Context.Tag('@eventiva/runtime/TelemetryControl/v1')<
    TelemetryControl,
    {
        readonly flush: Effect.Effect<void, TelemetrySinkFailure>;
        readonly health: Effect.Effect<TelemetryHealth>;
    }
>() {}

const bootstrapPolicy: TelemetryPolicy = {
    messages: {
        'bootstrap.failure': 'Bootstrap failed; configuration or required service acquisition was rejected.',
        'bootstrap.config-rejected': 'Bootstrap configuration was rejected.',
        'bootstrap.service-failed': 'A required bootstrap service failed acquisition.',
        'bootstrap.activation-failed': 'Required module activation failed; readiness was not published.',
    },
    attributes: {},
};

/** Private wrapper identity prevents nested installations from chaining exporters. */
class CentralTracer implements Tracer.Tracer {
    readonly [Tracer.TracerTypeId]: Tracer.TracerTypeId = Tracer.TracerTypeId;
    readonly context: Tracer.Tracer['context'] = (f) => f();
    readonly original: Tracer.Tracer;
    readonly span: Tracer.Tracer['span'];
    constructor(original: Tracer.Tracer, span: Tracer.Tracer['span']) {
        this.original = original;
        this.span = span;
    }
}

/**
 * Only these private callbacks see Effect's opaque vendor messages/annotations.
 * It never inspects objects, calls toString, or traverses Cause/config/errors.
 */
export const telemetryLayer = (
    policy: TelemetryPolicy,
    configuration: Config.Config<{
        readonly enabled: boolean;
        readonly capacity: number;
        readonly timeoutMs: number;
    }> = telemetryConfig
): Layer.Layer<TelemetryControl, TelemetrySinkFailure, TelemetrySink> =>
    Layer.unwrapScoped(
        Effect.gen(function* () {
            const decoded = yield* Schema.decode(TelemetryPolicy)(policy).pipe(
                Effect.mapError(() => new TelemetrySinkFailure({ reason: 'configuration' }))
            );
            const config = yield* configuration.pipe(
                Effect.mapError(() => new TelemetrySinkFailure({ reason: 'configuration' }))
            );
            // Also validate injected Config values, not only the environment descriptor.
            if (
                !Number.isInteger(config.capacity) ||
                config.capacity < 1 ||
                config.capacity > 4096 ||
                !Number.isInteger(config.timeoutMs) ||
                config.timeoutMs < 1 ||
                config.timeoutMs > 10000
            )
                return yield* new TelemetrySinkFailure({ reason: 'configuration' });
            const sink = yield* TelemetrySink;
            const queue = yield* Queue.dropping<TelemetryRecord>(config.capacity);
            let health: TelemetryHealth = {
                accepted: 0,
                completed: 0,
                dropped: 0,
                failed: 0,
                closed: false,
                shutdownFailed: false,
            };
            let changed = yield* Deferred.make<void>();
            const offer = (record: TelemetryRecord): void => {
                if (!config.enabled || health.closed) return;
                if (queue.unsafeOffer(record)) health = { ...health, accepted: health.accepted + 1 };
                else health = { ...health, dropped: health.dropped + 1 };
            };
            const worker = yield* Effect.forever(
                Effect.gen(function* () {
                    const record = yield* Queue.take(queue);
                    const result = yield* sink.write(record).pipe(
                        Effect.timeoutFail({
                            duration: config.timeoutMs,
                            onTimeout: () => new TelemetrySinkFailure({ reason: 'timeout' }),
                        }),
                        Effect.exit
                    );
                    health = {
                        ...health,
                        completed: health.completed + 1,
                        failed: health.failed + (Exit.isFailure(result) ? 1 : 0),
                    };
                    const previous = changed;
                    changed = yield* Deferred.make<void>();
                    yield* Deferred.succeed(previous, undefined);
                })
            ).pipe(Effect.interruptible, Effect.forkScoped);
            const waitFor = (target: number): Effect.Effect<void> =>
                Effect.suspend(() =>
                    health.completed >= target
                        ? Effect.void
                        : Deferred.await(changed).pipe(Effect.zipRight(waitFor(target)))
                );
            const flush = Effect.suspend(() =>
                waitFor(health.accepted).pipe(
                    Effect.zipRight(sink.flush),
                    Effect.zipRight(
                        Effect.suspend(() =>
                            health.failed > 0 ? Effect.fail(new TelemetrySinkFailure({ reason: 'write' })) : Effect.void
                        )
                    ),
                    Effect.interruptible,
                    Effect.timeoutFail({
                        duration: config.timeoutMs,
                        onTimeout: () => new TelemetrySinkFailure({ reason: 'timeout' }),
                    }),
                    Effect.catchAllCause(() => Effect.fail(new TelemetrySinkFailure({ reason: 'flush' })))
                )
            );
            yield* Effect.addFinalizer(() =>
                Effect.gen(function* () {
                    health = { ...health, closed: true };
                    const result = yield* Effect.exit(flush);
                    health = { ...health, shutdownFailed: Exit.isFailure(result) };
                    yield* Fiber.interrupt(worker);
                    yield* Queue.shutdown(queue);
                })
            );
            const attributes = (entries: Iterable<readonly [string, string]>): Readonly<Record<string, string>> => {
                const safe: Record<string, string> = {};
                for (const [key, value] of entries) {
                    if (
                        typeof value === 'string' &&
                        Object.hasOwn(decoded.attributes, key) &&
                        decoded.attributes[key]?.includes(value)
                    )
                        safe[key] = value;
                }
                return safe;
            };
            const text = (code: string): string =>
                Object.hasOwn(decoded.messages, code) ? (decoded.messages[code] ?? '[redacted]') : '[redacted]';
            const safeCode = (code: string): string => (Object.hasOwn(decoded.messages, code) ? code : 'redacted');
            const id = (value: string, size: number): string =>
                new RegExp(`^[a-f0-9]{${size}}$`).test(value) ? value : '';
            const logger = Logger.make((options) => {
                const rawCode = Schema.is(Schema.Tuple(TelemetryRecord.fields.code))(options.message)
                    ? options.message[0]
                    : '';
                const context = FiberRefs.getOrDefault(options.context, FiberRef.currentContext);
                const span = Context.getOption(context, Tracer.ParentSpan);
                const profileValue = HashMap.get(options.annotations, 'eventiva.profile');
                const profile = Option.isSome(profileValue)
                    ? Schema.is(TelemetryRecord.fields.profile)(profileValue.value)
                        ? profileValue.value
                        : 'vault'
                    : 'baseline';
                const approved: Array<readonly [string, string]> = [];
                if (profile === 'baseline' || profile === 'sensitive') {
                    for (const key of Object.keys(decoded.attributes)) {
                        const value = HashMap.get(options.annotations, key);
                        if (Option.isSome(value) && typeof value.value === 'string') approved.push([key, value.value]);
                    }
                }
                offer({
                    version: 1,
                    signal: 'log',
                    timestamp: options.date.toISOString(),
                    level: options.logLevel.label,
                    code: safeCode(rawCode),
                    text: text(rawCode),
                    profile,
                    traceId: Option.isSome(span) ? id(span.value.traceId, 32) : '',
                    spanId: Option.isSome(span) ? id(span.value.spanId, 16) : '',
                    parentSpanId: '',
                    attributes: attributes(approved),
                    durationMs: 0,
                    outcome: Cause.isEmpty(options.cause) ? 'none' : 'failed',
                });
            });
            const installed = yield* Effect.tracer;
            const native = installed instanceof CentralTracer ? installed.original : installed;
            const tracer = new CentralTracer(native, (name, parent, _context, _links, start, kind, options) => {
                // Only minimized identifiers may reach an ambient vendor tracer, never a parent
                // object (attributes/status/Exit) or a caller-supplied Context carrying secrets.
                const safeParent = Option.map(parent, (parent) =>
                    Tracer.externalSpan({ traceId: id(parent.traceId, 32), spanId: id(parent.spanId, 16) })
                );
                const span = native.span(safeCode(name), safeParent, Context.empty(), [], start, kind, {
                    captureStackTrace: false,
                });
                let ended = false;
                let profile: TelemetryRecord['profile'] = 'baseline';
                const approved = new Map<string, string>();
                // Vendor callback values are narrowed here, never exposed on the service boundary.
                const attribute: Tracer.Span['attribute'] = (key, value) => {
                    if (key === 'eventiva.profile')
                        profile = Schema.is(TelemetryRecord.fields.profile)(value) ? value : 'vault';
                    else if (
                        typeof value === 'string' &&
                        Object.hasOwn(decoded.attributes, key) &&
                        decoded.attributes[key]?.includes(value)
                    )
                        approved.set(key, value);
                };
                if (options?.attributes !== undefined) {
                    attribute('eventiva.profile', options.attributes['eventiva.profile'] ?? 'baseline');
                    for (const key of Object.keys(decoded.attributes)) attribute(key, options.attributes[key]);
                }
                return {
                    ...span,
                    get status() {
                        return span.status;
                    },
                    // No untrusted attributes/events/links or Exit payload reach the underlying tracer/exporter.
                    attribute,
                    event: () => undefined,
                    addLinks: () => undefined,
                    end: (end, exit) => {
                        if (ended) return;
                        ended = true;
                        span.end(end, Exit.void);
                        offer({
                            version: 1,
                            signal: 'span',
                            timestamp: new Date(Number(end / 1000000n)).toISOString(),
                            level: 'INFO',
                            code: safeCode(name),
                            text: text(name),
                            profile,
                            traceId: id(span.traceId, 32),
                            spanId: id(span.spanId, 16),
                            parentSpanId: Option.isSome(parent) ? id(parent.value.spanId, 16) : '',
                            attributes: profile === 'baseline' || profile === 'sensitive' ? attributes(approved) : {},
                            durationMs: Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Number(end - start) / 1000000)),
                            outcome: Exit.isSuccess(exit) ? 'succeeded' : 'failed',
                        });
                    },
                };
            });
            return Layer.mergeAll(
                Layer.scopedDiscard(
                    Effect.gen(function* () {
                        yield* Effect.withTracerScoped(tracer);
                        yield* Effect.locallyScoped(FiberRef.currentLoggers, HashSet.make(logger));
                    })
                ),
                Layer.succeed(TelemetryControl, { flush, health: Effect.sync(() => ({ ...health })) })
            );
        })
    );

/** Install around acquisition of the main Config/Layer, not alongside it. Needs no application Config. */
export const bootstrapTelemetryLayer = (): Layer.Layer<TelemetryControl, TelemetrySinkFailure, TelemetrySink> =>
    telemetryLayer(bootstrapPolicy, Config.succeed({ enabled: true, capacity: 32, timeoutMs: 1000 }));
