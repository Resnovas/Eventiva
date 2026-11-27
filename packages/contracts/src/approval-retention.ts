/**
 * @file packages/contracts/src/approval-retention.ts
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

import { Context, type Effect, Schema } from 'effect';
import { TenantId } from './ids.ts';
import { UuidV7 } from './storage.ts';

/** Explicit bounded traversal of one physically routed tenant; a cursor is not authorization. */
export const ApprovalRetentionRequest = Schema.Struct({
    tenant: TenantId,
    limit: Schema.Number.pipe(Schema.int(), Schema.between(1, 100)),
    after: Schema.optional(UuidV7),
}).annotations({ parseOptions: { onExcessProperty: 'error' } });
export type ApprovalRetentionRequest = typeof ApprovalRetentionRequest.Type;

/** Successful page counts; an enclosing SQL owner must commit before acknowledging them. Next also passes retained proofs. */
export interface ApprovalRetentionResult {
    readonly scanned: number;
    readonly deletedDecisions: number;
    readonly deletedProofs: number;
    readonly next?: string;
}

/** Closed maintenance failures omit proof content, SQL diagnostics and the rejected request. */
export class ApprovalRetentionFailure extends Schema.TaggedError<ApprovalRetentionFailure>()(
    'ApprovalRetentionFailure',
    {
        reason: Schema.Literal('invalid', 'denied', 'unavailable'),
    }
) {}

/** Trusted lifecycle capability only: constructing or exporting it creates no endpoint, schedule or consent. */
export class ApprovalRetentionMaintenance extends Context.Tag('@eventiva/contracts/ApprovalRetentionMaintenance')<
    ApprovalRetentionMaintenance,
    {
        readonly tenant: TenantId;
        /** Inspect at most limit proofs; typed pre-commit failures roll back the page when SQL finalization succeeds. */
        readonly run: (
            request: ApprovalRetentionRequest
        ) => Effect.Effect<ApprovalRetentionResult, ApprovalRetentionFailure>;
    }
>() {}
