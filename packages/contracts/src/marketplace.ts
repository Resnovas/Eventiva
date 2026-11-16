/**
 * @file packages/contracts/src/marketplace.ts
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

import { type Cause, Context, Data, Effect, Layer, Schema } from 'effect';
import type { CallerIdentity } from './caller.ts';
import { SubjectId, TenantId } from './ids.ts';
import { SecurityProfile } from './security.ts';
import { EpochMillis, Version } from './storage.ts';

const strict = { parseOptions: { onExcessProperty: 'error' } } as const;
/** Opaque identifiers only. No arbitrary metadata, messages, pricing or operational values. */
export const ExchangeScope = Schema.Struct({
    exchange: Schema.UUID,
    ownerTenant: TenantId,
    recipientTenant: TenantId,
    resource: Schema.UUID,
    purpose: Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(100)),
})
    .annotations(strict)
    .pipe(Schema.filter((scope) => scope.ownerTenant !== scope.recipientTenant));
export type ExchangeScope = typeof ExchangeScope.Type;
export const ExchangeAction = Schema.Literal('read', 'stage');
export type ExchangeAction = typeof ExchangeAction.Type;
export const ParticipantGrant = Schema.Struct({
    id: Schema.UUID,
    scope: ExchangeScope,
    participantTenant: TenantId,
    subject: SubjectId,
    action: ExchangeAction,
    expiresAt: EpochMillis,
    revoked: Schema.Boolean,
}).annotations(strict);
export type ParticipantGrant = typeof ParticipantGrant.Type;
/** Still classified: a reference is not a public listing or permission to fetch the source record. */
export const SnapshotReference = Schema.Struct({
    id: Schema.UUID,
    scope: ExchangeScope,
    sourceRecord: Schema.UUID,
    sourceVersion: Version,
    classification: SecurityProfile.pipe(
        Schema.filter((profile) => profile === 'sensitive' || profile === 'restricted')
    ),
}).annotations(strict);
export type SnapshotReference = typeof SnapshotReference.Type;
export const ReadSnapshot = Schema.Struct({
    grant: Schema.UUID,
    snapshot: Schema.UUID,
    scope: ExchangeScope,
}).annotations(strict);
export type ReadSnapshotRequest = typeof ReadSnapshot.Type;
export const StageExchange = Schema.Struct({
    ...ReadSnapshot.fields,
    command: Schema.UUID,
    expectedVersion: Version,
}).annotations(strict);
export type StageExchangeRequest = typeof StageExchange.Type;
/** Pending local intent only, never proof of a remote commitment, invoice, payment or stock hold. */
export const ExchangeIntent = Schema.Struct({
    command: Schema.UUID,
    grant: Schema.UUID,
    tenant: TenantId,
    subject: SubjectId,
    onBehalfOf: Schema.NullOr(SubjectId),
    snapshot: SnapshotReference,
    state: Schema.Literal('pending'),
}).annotations(strict);
export type ExchangeIntent = typeof ExchangeIntent.Type;

interface MarketplaceFailureFields {
    readonly reason: 'invalid' | 'denied' | 'conflict' | 'unavailable' | 'disabled' | 'trust-unapproved';
}
const FailureBase: new (
    fields: MarketplaceFailureFields
) => Cause.YieldableError & MarketplaceFailureFields & { readonly _tag: 'MarketplaceFailure' } =
    Data.TaggedError('MarketplaceFailure');
/** Safe closed reasons only. Never include classified identifiers, rejected values or vendor errors. */
export class MarketplaceFailure extends FailureBase {}

export const marketplaceFlag = {
    key: 'marketplace.foundation-enabled',
    owner: 'marketplace',
    description: 'Enable classified marketplace reference authorization and local intent staging.',
    safeDefault: false,
};

/** Trusted independent resource/purpose/profile release gate, NOT caller-supplied claims or crypto authority.
 * Refresh live permissions and required workload/broker assurance for classified METADATA on every call.
 * Use the existing sealed security profiles; restricted metadata is not downgraded to public identifiers.
 * No implementation or provider selection is supplied. Success never permits private payload processing.
 */
export class MarketplaceAuthority extends Context.Tag('@eventiva/contracts/MarketplaceAuthority')<
    MarketplaceAuthority,
    {
        readonly authorize: (
            caller: CallerIdentity,
            snapshot: SnapshotReference,
            action: ExchangeAction
        ) => Effect.Effect<void, MarketplaceFailure>;
    }
>() {}
export const MarketplaceAuthorityDeny = Layer.succeed(MarketplaceAuthority, {
    authorize: () => Effect.fail(new MarketplaceFailure({ reason: 'denied' })),
});

/** Backend-only transaction capability. No raw tenant SQL or canonical-record fetch/write capability. */
export interface MarketplaceTransaction {
    readonly grant: (id: string) => Effect.Effect<ParticipantGrant | undefined, MarketplaceFailure>;
    readonly snapshot: (id: string) => Effect.Effect<SnapshotReference | undefined, MarketplaceFailure>;
    readonly intent: (command: string) => Effect.Effect<ExchangeIntent | undefined, MarketplaceFailure>;
    readonly insertIntent: (intent: ExchangeIntent) => Effect.Effect<void, MarketplaceFailure>;
    readonly enqueue: (intent: ExchangeIntent) => Effect.Effect<void, MarketplaceFailure>;
}
/** Must serialize live grant checks with revocations and deduplication, committing intent + outbox atomically.
 * Roll back on typed failure, defect or interruption. Never acknowledge before durable commit. No external IO
 * in callbacks except trusted live policy checks. Snapshot references are immutable, including classification.
 * Grant/snapshot creation and grant revocation belong to an independently authorized control plane.
 */
export class MarketplaceStore extends Context.Tag('@eventiva/contracts/MarketplaceStore')<
    MarketplaceStore,
    {
        readonly transaction: <A, E, R>(
            use: (transaction: MarketplaceTransaction) => Effect.Effect<A, E, R>
        ) => Effect.Effect<A, E | MarketplaceFailure, R>;
    }
>() {}
export const MarketplaceStoreUnavailable = Layer.succeed(MarketplaceStore, {
    transaction: () => Effect.fail(new MarketplaceFailure({ reason: 'unavailable' })),
});
