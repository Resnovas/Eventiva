/**
 * @file packages/contracts/src/marketplace-durable.ts
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

import { Caller, type CallerIdentity } from './caller.ts';
import { SubjectId } from './ids.ts';
import {
    ExchangeScope,
    MarketplaceAuthority,
    MarketplaceFailure,
    ParticipantGrant,
    SnapshotReference,
} from './marketplace.ts';
import { CurrentTenant, EpochMillis } from './storage.ts';
import { Context, Effect, Layer, Schema } from 'effect';

const strict = { parseOptions: { onExcessProperty: 'error' } } as const;
export const ProvisionExchange = Schema.Struct({
    request: Schema.UUID,
    snapshot: SnapshotReference,
    grant: ParticipantGrant,
}).annotations(strict);
export type ProvisionExchange = typeof ProvisionExchange.Type;
export const RevokeParticipant = Schema.Struct({
    request: Schema.UUID,
    scope: ExchangeScope,
    grant: Schema.UUID,
}).annotations(strict);
export type RevokeParticipant = typeof RevokeParticipant.Type;
export const MarketplaceAuditQuery = Schema.Struct({
    scope: ExchangeScope,
    limit: Schema.Int.pipe(Schema.between(1, 100)),
}).annotations(strict);
export type MarketplaceAuditQuery = typeof MarketplaceAuditQuery.Type;
export const MarketplaceAuditEvent = Schema.Struct({
    id: Schema.String,
    scope: ExchangeScope,
    actor: SubjectId,
    at: EpochMillis,
    operation: Schema.Literal('provision', 'revoke', 'stage', 'claim', 'retry', 'recorded', 'blocked', 'exhausted'),
    reference: Schema.UUID,
}).annotations(strict);
export type MarketplaceAuditEvent = typeof MarketplaceAuditEvent.Type;

/** Independent live identity/operator gate, including delegated human and workload assurance.
 * Called inside the serialized transaction even on identical replay. No accepting production layer.
 */
export class MarketplaceOperatorPolicy extends Context.Tag('@eventiva/contracts/MarketplaceOperatorPolicy')<
    MarketplaceOperatorPolicy,
    {
        /** Recheck this caller's operator authority for the exact exchange scope, including identical retries. */
        readonly authorize: (
            caller: CallerIdentity,
            operation: 'provision' | 'revoke' | 'audit' | 'process',
            scope: ExchangeScope
        ) => Effect.Effect<void, MarketplaceFailure>;
    }
>() {}
export const MarketplaceOperatorPolicyDeny = Layer.succeed(MarketplaceOperatorPolicy, {
    /** Refuse operator operations until a trusted live policy is composed. */
    authorize: () => Effect.fail(new MarketplaceFailure({ reason: 'denied' })),
});

type OperatorContext = Caller | CurrentTenant | MarketplaceOperatorPolicy;
/** Tenant-routed control plane for classified references and grants, independent of participant read/stage authority. */
export class MarketplaceAdministration extends Context.Tag('@eventiva/contracts/MarketplaceAdministration')<
    MarketplaceAdministration,
    {
        /** Atomically provision an immutable reference and grant under a retry-safe request and live operator checks. */
        readonly provision: (input: ProvisionExchange) => Effect.Effect<void, MarketplaceFailure, OperatorContext>;
        /** Revoke the scoped participant grant with request deduplication and fresh operator authorization. */
        readonly revoke: (input: RevokeParticipant) => Effect.Effect<void, MarketplaceFailure, OperatorContext>;
        /** Release only bounded classified audit metadata for an authorized exchange scope. */
        readonly audit: (
            input: MarketplaceAuditQuery
        ) => Effect.Effect<ReadonlyArray<MarketplaceAuditEvent>, MarketplaceFailure, OperatorContext>;
    }
>() {}

export const ClaimExchange = Schema.Struct({
    command: Schema.UUID,
    leaseMs: Schema.Int.pipe(Schema.positive(), Schema.lessThanOrEqualTo(Number.MAX_SAFE_INTEGER)),
    maxAttempts: Schema.Int.pipe(Schema.positive(), Schema.lessThanOrEqualTo(Number.MAX_SAFE_INTEGER)),
}).annotations(strict);
export type ClaimExchange = typeof ClaimExchange.Type;
/** A fence for local metadata processing only. Not a token to release private records. */
export const ExchangeClaim = Schema.Struct({
    command: Schema.UUID,
    lease: Schema.UUID,
    attempt: Schema.Int.pipe(Schema.positive()),
}).annotations(strict);
export type ExchangeClaim = typeof ExchangeClaim.Type;
export const SettleExchange = Schema.Struct({
    claim: ExchangeClaim,
    outcome: Schema.Union(
        Schema.Struct({ state: Schema.Literal('recorded') }).annotations(strict),
        Schema.Struct({
            state: Schema.Literal('retry'),
            availableAt: EpochMillis.pipe(Schema.nonNegative()),
        }).annotations(strict)
    ),
}).annotations(strict);
export type SettleExchange = typeof SettleExchange.Type;
/** SQL-backed local delivery evidence. No remote invocation, saga effects or private payloads. */
export class MarketplaceOutbox extends Context.Tag('@eventiva/contracts/MarketplaceOutbox')<
    MarketplaceOutbox,
    {
        /** Lease due local intent with a fresh fence after operator and classified-reference authorization; absence is not delivery. */
        readonly claim: (
            input: ClaimExchange
        ) => Effect.Effect<ExchangeClaim | undefined, MarketplaceFailure, OperatorContext | MarketplaceAuthority>;
        /** Record local completion or retry against the exact lease fence, reauthorizing completed retries as well. */
        readonly settle: (
            input: SettleExchange
        ) => Effect.Effect<void, MarketplaceFailure, OperatorContext | MarketplaceAuthority>;
    }
>() {}
