/**
 * @file ai-docs/src/29_http/03_batch.ts
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

/** @title Preserve caller-owned keys and ordered wire inputs for explicit non-atomic batch recovery */
import { JsonValue } from '@eventiva/contracts/storage';
import { Schema } from 'effect';

const Call = Schema.Struct({
    action: Schema.String,
    input: JsonValue,
    idempotencyKey: Schema.String.pipe(Schema.pattern(/^[A-Za-z0-9._:-]{1,128}$/)),
});
const Envelope = Schema.Struct({ calls: Schema.Array(Call).pipe(Schema.minItems(1), Schema.maxItems(10)) });

/** Pure synthetic payload validation only; neither possession of this envelope nor a specification grants authority. */
export const batchExample = Schema.decodeUnknown(Envelope)(
    {
        calls: [
            { action: 'batch.write', input: { value: 9 }, idempotencyKey: 'ordered-9' },
            { action: 'batch.write', input: { value: 2 }, idempotencyKey: 'ordered-2' },
            { action: 'batch.write', input: { value: 7 }, idempotencyKey: 'ordered-7' },
        ],
    },
    { onExcessProperty: 'error' }
);

// Keep this same decoded envelope for recovery. The server independently preflights current visibility, then reauthorizes each invocation.
// After failure the committed prefix stays committed. A replay has fresh attempt receipt IDs and must not be mistaken for an atomic rollback.
