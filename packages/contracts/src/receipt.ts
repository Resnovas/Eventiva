/**
 * @file packages/contracts/src/receipt.ts
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

import { Schema } from 'effect';
import { CallerIdentity } from './caller.ts';

/** Portable audit evidence, consumable without importing the backend runtime. */
export const Receipt = Schema.Struct({
    id: Schema.NonEmptyString,
    caller: CallerIdentity,
    // Unknown/invalid action names also receive receipts, so this is not ActionName.
    action: Schema.String,
    version: Schema.NullOr(Schema.Int.pipe(Schema.positive())),
    inputHash: Schema.NonEmptyString,
    outcome: Schema.Literal('succeeded', 'failed', 'denied', 'defect', 'interrupted'),
    startedAt: Schema.NonNegative.pipe(Schema.finite()),
    durationMs: Schema.NonNegative.pipe(Schema.finite()),
});
export type Receipt = typeof Receipt.Type;
