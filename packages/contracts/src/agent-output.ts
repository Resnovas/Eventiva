/**
 * @file packages/contracts/src/agent-output.ts
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
import { CurrentTenant, UuidV7 } from './storage.ts';
import type { TenantId } from './ids.ts';

/** Only explicitly released text or completion metadata enters the log, never implicit prompts/tool results. */
export const OutputPayload = Schema.Union(
    Schema.Struct({ _tag: Schema.Literal('Text'), text: Schema.String.pipe(Schema.maxLength(4096)) }),
    Schema.Struct({
        _tag: Schema.Literal('StepCompleted'),
        stepIndex: Schema.Number.pipe(Schema.int(), Schema.positive()),
    })
);
export type OutputPayload = typeof OutputPayload.Type;
/** Safe integer offsets start at zero; -1 is reserved for the initial exclusive read cursor. */
export const OutputOffset = Schema.Number.pipe(Schema.int(), Schema.between(0, Number.MAX_SAFE_INTEGER - 1));
/** Identity belongs to the logical producer, not its process, attempt or transport request. */
export const OutputAppend = Schema.Struct({
    runId: UuidV7,
    eventId: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(128)),
    payload: OutputPayload,
});
export type OutputAppend = typeof OutputAppend.Type;
/** Pages are ordered, bounded and strictly after the supplied last-consumed offset. */
export const OutputRead = Schema.Struct({
    runId: UuidV7,
    after: Schema.Number.pipe(Schema.int(), Schema.between(-1, Number.MAX_SAFE_INTEGER - 1)),
    limit: Schema.Number.pipe(Schema.int(), Schema.between(1, 100)),
});
export type OutputRead = typeof OutputRead.Type;
/** An immutable committed event carries its exact tenant/run identity and allocation offset. */
export interface OutputEvent extends OutputAppend {
    readonly tenant: TenantId;
    readonly offset: number;
}
/** Bounded diagnostics omit prompt, payload, event identity and driver failures. */
interface OutputFailureFields {
    readonly reason: 'invalid' | 'conflict' | 'unavailable';
}
/** Keep the public constructor exact rather than exposing the vendor's open generic. */
const failureBase: new (fields: OutputFailureFields) => Cause.YieldableError &
    OutputFailureFields & {
        readonly _tag: 'AgentOutputFailure';
    } = Data.TaggedError('AgentOutputFailure');
/** Changed logical-event content conflicts; ambiguous database outcomes are safe to retry with the same identity. */
export class AgentOutputFailure extends failureBase {}

/** Privileged persistence port, not public authorization. The run boundary must supply a trusted tenant route. */
export class AgentOutputLog extends Context.Tag('@eventiva/contracts/AgentOutputLog')<
    AgentOutputLog,
    {
        /** Commit before returning; a retry of identical logical content returns the original event without allocating again. */
        readonly append: (input: OutputAppend) => Effect.Effect<OutputEvent, AgentOutputFailure, CurrentTenant>;
        /** Return committed events only; callers may poll at 200 ms and resume from their last consumed offset. */
        readonly read: (
            input: OutputRead
        ) => Effect.Effect<ReadonlyArray<OutputEvent>, AgentOutputFailure, CurrentTenant>;
    }
>() {}
