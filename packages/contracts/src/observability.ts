/**
 * @file packages/contracts/src/observability.ts
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

import { type Cause, Context, Data, Effect, Schema } from 'effect';

/** Versioned local wire boundary; never an audit receipt or an OTLP envelope. */
export const TelemetryRecord = Schema.Struct({
    version: Schema.Literal(1),
    signal: Schema.Literal('log', 'span'),
    timestamp: Schema.String.pipe(Schema.pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)),
    level: Schema.Literal('ALL', 'FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE', 'OFF'),
    code: Schema.String.pipe(Schema.maxLength(96), Schema.pattern(/^[a-z][a-z0-9._-]*$/)),
    text: Schema.String.pipe(
        Schema.maxLength(8192),
        Schema.filter((text) =>
            Array.from(text).every((character) => {
                const code = character.codePointAt(0) ?? 0;
                return (
                    code === 10 ||
                    (code >= 32 &&
                        !(code >= 127 && code <= 159) &&
                        !(code >= 0x2028 && code <= 0x202e) &&
                        !(code >= 0x2066 && code <= 0x2069))
                );
            })
        )
    ),
    profile: Schema.Literal('baseline', 'sensitive', 'restricted', 'vault'),
    traceId: Schema.String.pipe(Schema.pattern(/^(?:|[a-f0-9]{32})$/)),
    spanId: Schema.String.pipe(Schema.pattern(/^(?:|[a-f0-9]{16})$/)),
    parentSpanId: Schema.String.pipe(Schema.pattern(/^(?:|[a-f0-9]{16})$/)),
    attributes: Schema.Record({
        key: Schema.String.pipe(Schema.maxLength(96), Schema.pattern(/^[a-z][a-z0-9._-]*$/)),
        value: Schema.String.pipe(Schema.maxLength(96), Schema.pattern(/^[a-zA-Z0-9._-]*$/)),
    }).pipe(Schema.filter((attributes) => Object.keys(attributes).length <= 16)),
    durationMs: Schema.Number.pipe(Schema.between(0, Number.MAX_SAFE_INTEGER)),
    outcome: Schema.Literal('none', 'succeeded', 'failed'),
});
export type TelemetryRecord = typeof TelemetryRecord.Type;

interface TelemetrySinkFailureFields {
    readonly reason: 'configuration' | 'unavailable' | 'write' | 'flush' | 'timeout' | 'invalid-record';
}

// An exact constructor boundary keeps Data.TaggedError's open vendor generic out of emitted public declarations.
const failureBase: new (
    fields: TelemetrySinkFailureFields
) => Cause.YieldableError & TelemetrySinkFailureFields & { readonly _tag: 'TelemetrySinkFailure' } = Data.TaggedError(
    'TelemetrySinkFailure'
)<TelemetrySinkFailureFields>;

/** Deliberately excludes filesystem paths, driver errors and arbitrary causes. */
export class TelemetrySinkFailure extends failureBase {}

/**
 * Composition-only asynchronous exporter port. Implementations must be scoped,
 * interruptible and bounded. Features use Effect.log/withSpan, not this port.
 */
export class TelemetrySink extends Context.Tag('@eventiva/contracts/TelemetrySink/v1')<
    TelemetrySink,
    {
        readonly write: (record: TelemetryRecord) => Effect.Effect<void, TelemetrySinkFailure>;
        readonly flush: Effect.Effect<void, TelemetrySinkFailure>;
    }
>() {}
