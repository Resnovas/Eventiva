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
        Schema.filter(
            /** Bound the number of static code-to-message declarations rather than accepting an unbounded lookup policy. */ (
                messages
            ) => Object.keys(messages).length <= 128
        )
    ),
    attributes: Schema.Record({
        key: TelemetryRecord.fields.code,
        value: Schema.Array(Schema.String.pipe(Schema.maxLength(96), Schema.pattern(/^[a-zA-Z0-9._-]*$/))).pipe(
            Schema.maxItems(32)
        ),
    }).pipe(
        Schema.filter(
            /** Limit approved attribute dimensions independently of each dimension's allowed values. */ (attributes) =>
                Object.keys(attributes).length <= 16
        )
    ),
});
export type TelemetryPolicy = typeof TelemetryPolicy.Type;

export const telemetryConfig = Config.all({
    enabled: Config.boolean('enabled').pipe(Config.withDefault(true)),
    capacity: Config.integer('capacity').pipe(
        Config.withDefault(256),
        Config.validate({
            message: 'invalid capacity',
            /** Bound queued minimized records to the supported memory budget. */
            validation: (n) => n >= 1 && n <= 4096
        })
    ),
    timeoutMs: Config.integer('timeoutMs').pipe(
        Config.withDefault(1000),
        Config.validate({
            message: 'invalid timeout',
            /** Bound sink waits so telemetry cannot indefinitely delay lifecycle cleanup. */
            validation: (n) => n >= 1 && n <= 10000
        })
    ),
}).pipe(Config.nested('telemetry'));

/** Layer-local delivery counters; completion includes failed writes and shutdown failure is reported separately. */
export interface TelemetryHealth {
    readonly accepted: number;
    readonly completed: number;
    readonly dropped: number;
    readonly failed: number;
    readonly closed: boolean;
    readonly shutdownFailed: boolean;
}

/** Flush accepted records and observe bounded delivery health without exposing queued payloads or the raw exporter. */
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
    /** Execute in the current context without adding a vendor-specific ambient context manager. */
    readonly context: Tracer.Tracer['context'] = (f) => f();
    readonly original: Tracer.Tracer;
    readonly span: Tracer.Tracer['span'];
    /** Retain the original native tracer and the minimizing span factory so nested installations unwrap instead of chaining exporters. */
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
        Effect.gen(
            /** Install a bounded worker, minimizing logger/tracer and scoped shutdown around the supplied sink. */ function* () {
                const decoded = yield* Schema.decode(TelemetryPolicy)(policy).pipe(
                    Effect.mapError(
                        /** Reject policy shape without retaining the rejected static text in diagnostics. */ () =>
                            new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                const config = yield* configuration.pipe(
                    Effect.mapError(
                        /** Keep configuration parse details and environment contents out of telemetry errors. */ () =>
                            new TelemetrySinkFailure({ reason: 'configuration' })
                    )
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
                /** Enqueue an already minimized record synchronously, dropping on capacity rather than blocking application logging. */
                const offer = (record: TelemetryRecord): void => {
                    // Logger/tracer callbacks cannot await backpressure; overflow is a counted drop, not a second unbounded buffer.
                    if (!config.enabled || health.closed) return;
                    if (queue.unsafeOffer(record)) health = { ...health, accepted: health.accepted + 1 };
                    else health = { ...health, dropped: health.dropped + 1 };
                };
                const worker = yield* Effect.forever(
                    Effect.gen(
                        /** Deliver one minimized record with a bounded wait and notify flush waiters even when the write fails. */ function* () {
                            const record = yield* Queue.take(queue);
                            const result = yield* sink.write(record).pipe(
                                Effect.timeoutFail({
                                    duration: config.timeoutMs,
                                    /** Report a fixed timeout reason without retaining sink details. */
                                    onTimeout: () =>
                                            new TelemetrySinkFailure({ reason: 'timeout' }),
                                }),
                                Effect.exit
                            );
                            // Failed writes still complete their queue position so flush can finish with a failure rather than wait forever.
                            health = {
                                ...health,
                                completed: health.completed + 1,
                                failed: health.failed + (Exit.isFailure(result) ? 1 : 0),
                            };
                            const previous = changed;
                            changed = yield* Deferred.make<void>();
                            yield* Deferred.succeed(previous, undefined);
                        }
                    )
                ).pipe(Effect.interruptible, Effect.forkScoped);
                /** Wait for completion of an accepted-record count snapshot, not for an ever-moving empty-queue condition. */
                const waitFor = (target: number): Effect.Effect<void> =>
                    Effect.suspend(
                        /** Reobserve the current completion signal after each worker notification to avoid capturing an obsolete Deferred. */ () =>
                            health.completed >= target
                                ? Effect.void
                                : Deferred.await(changed).pipe(Effect.zipRight(waitFor(target)))
                    );
                const flush = Effect.suspend(
                    /** Drain the accepted-count snapshot and sink, failing if writes failed or the bounded flush is interrupted. */ () =>
                        waitFor(health.accepted).pipe(
                            Effect.zipRight(sink.flush),
                            Effect.zipRight(
                                Effect.suspend(
                                    /** Report accumulated write failure after sink flushing rather than silently acknowledging dropped delivery attempts. */ () =>
                                        health.failed > 0
                                            ? Effect.fail(new TelemetrySinkFailure({ reason: 'write' }))
                                            : Effect.void
                                )
                            ),
                            Effect.interruptible,
                            Effect.timeoutFail({
                                duration: config.timeoutMs,
                                /** Bound flush completion independently of the worker's per-write timeout. */
                                onTimeout: () =>
                                        new TelemetrySinkFailure({ reason: 'timeout' }),
                            }),
                            Effect.catchAllCause(
                                /** Collapse interruption, defects and typed sink errors to the closed flush-failure reason. */ () =>
                                    Effect.fail(new TelemetrySinkFailure({ reason: 'flush' }))
                            )
                        )
                );
                yield* Effect.addFinalizer(
                    /** Close admission before flushing and stopping this layer's worker/queue. */ () =>
                        Effect.gen(
                            /** Record final flush failure without preventing worker interruption and queue shutdown. */ function* () {
                                // Stop accepting records first; teardown must drain a fixed set instead of racing new application logs.
                                health = { ...health, closed: true };
                                const result = yield* Effect.exit(flush);
                                health = { ...health, shutdownFailed: Exit.isFailure(result) };
                                yield* Fiber.interrupt(worker);
                                yield* Queue.shutdown(queue);
                            }
                        )
                );
                /** Copy only statically allowlisted string key/value pairs; arbitrary annotations never become exporter attributes. */
                const attributes = (entries: Iterable<readonly [string, string]>): Readonly<Record<string, string>> => {
                    // Validate both dimension and value; checking a key alone would leak user-controlled annotation strings.
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
                /** Resolve trusted static display text only; unrecognized codes never become fallback message text. */
                const text = (code: string): string =>
                    Object.hasOwn(decoded.messages, code) ? (decoded.messages[code] ?? '[redacted]') : '[redacted]';
                /** Emit only declared message codes or the fixed redaction marker, never an arbitrary log/span name. */
                const safeCode = (code: string): string => (Object.hasOwn(decoded.messages, code) ? code : 'redacted');
                /** Retain only exact-length lowercase hexadecimal trace identifiers; invalid identifiers become empty. */
                const id = (value: string, size: number): string =>
                    new RegExp(`^[a-f0-9]{${size}}$`).test(value) ? value : '';
                const logger = Logger.make(
                    /** Minimize opaque Effect logging input into a closed record without stringifying arbitrary messages or causes. */ (
                        options
                    ) => {
                        // A recognized single code selects static text; neither user message objects nor Cause payloads are traversed.
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
                                if (Option.isSome(value) && typeof value.value === 'string')
                                    approved.push([key, value.value]);
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
                    }
                );
                const installed = yield* Effect.tracer;
                const native = installed instanceof CentralTracer ? installed.original : installed;
                const tracer = new CentralTracer(
                    native,
                    /** Wrap native spans with minimized identifiers, bounded attributes and payload-free completion. */ (
                        name,
                        parent,
                        _context,
                        _links,
                        start,
                        kind,
                        options
                    ) => {
                        // Only minimized identifiers may reach an ambient vendor tracer, never a parent
                        // object (attributes/status/Exit) or a caller-supplied Context carrying secrets.
                        const safeParent = Option.map(
                            parent,
                            /** Rebuild an external parent from validated identifiers, not its potentially sensitive status/attributes. */ (
                                parent
                            ) => Tracer.externalSpan({ traceId: id(parent.traceId, 32), spanId: id(parent.spanId, 16) })
                        );
                        const span = native.span(safeCode(name), safeParent, Context.empty(), [], start, kind, {
                            captureStackTrace: false,
                        });
                        let ended = false;
                        let profile: TelemetryRecord['profile'] = 'baseline';
                        const approved = new Map<string, string>();
                        // Vendor callback values are narrowed here, never exposed on the service boundary.
                        /** Retain only allowlisted strings and a validated profile; invalid profile evidence selects the most restrictive mode. */
                        const attribute: Tracer.Span['attribute'] = (key, value) => {
                            // Profile is control metadata, not an exportable free-text attribute; arbitrary vendor values remain private.
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
                            /** Reflect the native span's status without accepting caller-controlled status mutation. */
                            get status() {
                                return span.status;
                            },
                            // No untrusted attributes/events/links or Exit payload reach the underlying tracer/exporter.
                            attribute,
                            /** Discard caller events so opaque event payloads never reach the native tracer. */
                            event: () => undefined,
                            /** Discard caller links rather than forward arbitrary linked span context. */
                            addLinks: () => undefined,
                            /** End once using a payload-free native Exit, then emit only minimized timing, identifiers and outcome. */
                            end: (end, exit) => {
                                if (ended) return;
                                // Native end must never inspect the action's Exit value/cause; only its success bit enters our record.
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
                                    attributes:
                                        profile === 'baseline' || profile === 'sensitive' ? attributes(approved) : {},
                                    durationMs: Math.max(
                                        0,
                                        Math.min(Number.MAX_SAFE_INTEGER, Number(end - start) / 1000000)
                                    ),
                                    outcome: Exit.isSuccess(exit) ? 'succeeded' : 'failed',
                                });
                            },
                        };
                    }
                );
                return Layer.mergeAll(
                    Layer.scopedDiscard(
                        Effect.gen(
                            /** Replace scoped tracer/logger together so all signals in this scope pass the same minimizing policy. */ function* () {
                                // Both FiberRefs share this scope; restoring only one would leave a different policy on another signal path.
                                yield* Effect.withTracerScoped(tracer);
                                yield* Effect.locallyScoped(FiberRef.currentLoggers, HashSet.make(logger));
                            }
                        )
                    ),
                    Layer.succeed(TelemetryControl, {
                        flush,
                        health: Effect.sync(
                            /** Return a detached counter snapshot rather than the mutable internal health object. */ () => ({
                                ...health
                            })
                        )
                    })
                );
            }
        )
    );

/** Install around acquisition of the main Config/Layer, not alongside it. Needs no application Config. */
export const bootstrapTelemetryLayer = (): Layer.Layer<TelemetryControl, TelemetrySinkFailure, TelemetrySink> =>
    telemetryLayer(bootstrapPolicy, Config.succeed({ enabled: true, capacity: 32, timeoutMs: 1000 }));
