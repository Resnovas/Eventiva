/**
 * @file packages/contracts/src/approval.ts
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
import { ActionName } from './action.ts';
import { CallerIdentity } from './caller.ts';
import { SubjectId, TenantId } from './ids.ts';
import { EpochMillis, type JsonValue, UuidV7, Version } from './storage.ts';

/** A configured duration in days, or a calendar period; six months is not silently rounded to 180 days. */
export const ApprovalRetention = Schema.Union(
    Schema.Literal('six-months', 'two-years'),
    Schema.Number.pipe(Schema.int(), Schema.between(90, 730))
);
export type ApprovalRetention = typeof ApprovalRetention.Type;

/** Compute calendar retention with end-of-month clamping; fixed tenant day windows use exact UTC days. */
export const approvalRetentionEnd = (at: number, retention: ApprovalRetention): number => {
    // Preserve time of day and clamp August 31 plus six months to February's final day, not March.
    if (typeof retention === 'number') return at + retention * 86_400_000;
    const date = new Date(at);
    const day = date.getUTCDate();
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + (retention === 'six-months' ? 6 : 24));
    const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    date.setUTCDate(Math.min(day, last));
    return date.getTime();
};

/** Trusted tenant policy: no session maximum is inferred from the one-hour OIDC test fixture. */
export const ApprovalSettings = Schema.Struct({
    sessionLifetimeMs: Schema.Number.pipe(Schema.int(), Schema.between(300_000, Number.MAX_SAFE_INTEGER)),
    lifetimeMs: Schema.Number.pipe(Schema.int(), Schema.between(300_000, Number.MAX_SAFE_INTEGER)),
    retention: Schema.optionalWith(ApprovalRetention, {
        /** Use the approved calendar default only when the tenant has not configured another accepted window. */
        default: () => 'six-months' as const,
    }),
}).pipe(
    Schema.filter(
        /** Tenant consent cannot outlive the configured authentication policy, even before actual-session capping. */
        (value) => value.lifetimeMs <= value.sessionLifetimeMs
    )
);
export type ApprovalSettings = typeof ApprovalSettings.Type;

/** Exact invocation identity; a new write key or changed canonical input always needs another consent. */
export const ApprovalBinding = Schema.Struct({
    tenant: TenantId,
    principal: SubjectId,
    action: ActionName,
    version: Schema.Number.pipe(Schema.int(), Schema.positive()),
    inputHash: Schema.NonEmptyString,
    writeKey: Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(512)),
});
export type ApprovalBinding = typeof ApprovalBinding.Type;

/** Trusted event association plus its stable target reference; neither value is accepted from a cancellation request. */
export const ApprovalEventScope = Schema.Struct({
    event: Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(512)),
    resource: Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(512)),
});
export type ApprovalEventScope = typeof ApprovalEventScope.Type;

/** A review projection derived from a registered codec and live policy; it carries no handler, raw input or grant. */
export const ApprovalPreparation = Schema.Struct({
    binding: ApprovalBinding,
    eventScope: Schema.optional(ApprovalEventScope),
    limits: Schema.Record({
        key: Schema.NonEmptyString,
        value: Schema.Number.pipe(Schema.finite(), Schema.nonNegative()),
    }),
});
export type ApprovalPreparation = typeof ApprovalPreparation.Type;

/** Minimal first-party decision evidence. No token, raw input, inferred assurance or mutable role snapshot is stored. */
export const ApprovalRecord = Schema.Struct({
    schemaVersion: Schema.Literal(1),
    id: UuidV7,
    revision: Version,
    binding: ApprovalBinding,
    eventScope: Schema.optional(ApprovalEventScope),
    approver: CallerIdentity,
    issuedAt: EpochMillis,
    expiresAt: EpochMillis,
    limits: Schema.Record({
        key: Schema.NonEmptyString,
        value: Schema.Number.pipe(Schema.finite(), Schema.nonNegative()),
    }),
    stepUp: Schema.Literal(false),
    retention: ApprovalRetention,
    retainUntil: EpochMillis,
    usedAt: Schema.NullOr(EpochMillis),
    revokedAt: Schema.NullOr(EpochMillis),
}).pipe(
    Schema.filter(
        /** Reject persisted contradictory human provenance and impossible lifecycle timestamps, not merely malformed JSON. */
        (value) =>
            value.approver.kind === 'human' &&
            value.approver.onBehalfOf === undefined &&
            value.approver.tenant === value.binding.tenant &&
            value.expiresAt > value.issuedAt &&
            value.retainUntil ===
                approvalRetentionEnd(value.usedAt ?? value.revokedAt ?? value.expiresAt, value.retention) &&
            (value.usedAt === null || (value.usedAt >= value.issuedAt && value.usedAt < value.expiresAt)) &&
            (value.revokedAt === null ||
                (value.usedAt === null && value.revokedAt >= value.issuedAt && value.revokedAt < value.expiresAt))
    )
);
export type ApprovalRecord = typeof ApprovalRecord.Type;

/** Closed public failure vocabulary; no SQL diagnostics, rejected payloads or private grant details escape. */
export class ApprovalFailure extends Schema.TaggedError<ApprovalFailure>()('ApprovalFailure', {
    reason: Schema.Literal(
        'unavailable',
        'invalid',
        'missing',
        'conflict',
        'denied',
        'expired',
        'revoked',
        'binding',
        'step-up'
    ),
}) {}

/** Feature-owned trusted association seam; absence denies resource cancellation without disabling own/tenant cancellation. */
export class ApprovalEvents extends Context.Tag('@eventiva/contracts/ApprovalEvents')<
    ApprovalEvents,
    {
        /** Resolve the live event and exact grant resource reference after registered canonical input/target validation; never accept cancellation-request association. */
        readonly resolve: (
            binding: ApprovalBinding,
            input: JsonValue
        ) => Effect.Effect<ApprovalEventScope | undefined, ApprovalFailure>;
        /** Recheck the captured resource's continued tenant-local event association, denying changed/unavailable targets; runtime checks exact approvals.cancel grants independently, never inferred lead roles. */
        readonly canCancel: (
            caller: CallerIdentity,
            binding: ApprovalBinding,
            scope: ApprovalEventScope
        ) => Effect.Effect<void, ApprovalFailure>;
    }
>() {}

/** Trusted persistence capability, not a transport API; all services must share the routed tenant SQL client. */
export class ApprovalStore extends Context.Tag('@eventiva/contracts/ApprovalStore')<
    ApprovalStore,
    {
        readonly tenant: TenantId;
        readonly nextId: Effect.Effect<string, ApprovalFailure>;
        /** Serialize identity, proof and audit work in the SAME transaction as authoritative mutation when nested. */
        readonly transaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E | ApprovalFailure, R>;
        /** Decode fresh authoritative state on every lookup; missing evidence never grants permission. */
        readonly get: (id: string) => Effect.Effect<ApprovalRecord | undefined, ApprovalFailure>;
        /** Create or advance one revision with atomic audit: human actor for issue/cancel, bound executing principal for use; never reinstate consent. */
        readonly save: (
            record: ApprovalRecord,
            actor: CallerIdentity,
            kind: 'issued' | 'used' | 'cancelled'
        ) => Effect.Effect<void, ApprovalFailure>;
    }
>() {}

/** Independent permission; tenant scope is explicitly framed and never inferred from a role's display name. */
export const cancelApprovalsPermission = 'approvals.cancel';
