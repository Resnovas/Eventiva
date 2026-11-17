/**
 * @file packages/runtime/src/marketplace.ts
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

import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Flags } from '@eventiva/contracts/flags';
import {
    ExchangeIntent,
    type ExchangeScope,
    MarketplaceAuthority,
    MarketplaceFailure,
    MarketplaceStore,
    type MarketplaceTransaction,
    ParticipantGrant,
    ReadSnapshot,
    type ReadSnapshotRequest,
    SnapshotReference,
    StageExchange,
    type StageExchangeRequest,
    marketplaceFlag,
} from '@eventiva/contracts/marketplace';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { Clock, Effect, Schema } from 'effect';
import { IdentityResolver } from './invocation.ts';

/** Construct a bounded marketplace rejection without retaining provider errors or private snapshot content. */
const fail = (reason: MarketplaceFailure['reason']) => new MarketplaceFailure({ reason });
/** Validate requests and stored metadata strictly, mapping decoder details to the fixed invalid reason. */
const decode = <A, I>(schema: Schema.Schema<A, I>, input: NoInfer<A>) =>
    Schema.decodeUnknown(schema)(input, { onExcessProperty: 'error' }).pipe(
        Effect.mapError(/** Do not expose schema diagnostics across the marketplace boundary. */ () => fail('invalid'))
    );
/** Compare the entire exchange/tenant/resource/purpose binding rather than accepting a shared exchange id alone. */
const sameScope = (a: ExchangeScope, b: ExchangeScope) =>
    a.exchange === b.exchange &&
    a.ownerTenant === b.ownerTenant &&
    a.recipientTenant === b.recipientTenant &&
    a.resource === b.resource &&
    a.purpose === b.purpose;
/** Require the same immutable metadata reference, source version and classification when recognizing an intent retry. */
const sameSnapshot = (a: SnapshotReference, b: SnapshotReference) =>
    a.id === b.id &&
    sameScope(a.scope, b.scope) &&
    a.sourceRecord === b.sourceRecord &&
    a.sourceVersion === b.sourceVersion &&
    a.classification === b.classification;
/** Detect identical command retries only when grant, authority and immutable snapshot binding all match. */
const sameIntent = (a: ExchangeIntent, b: ExchangeIntent) =>
    a.command === b.command &&
    a.grant === b.grant &&
    a.tenant === b.tenant &&
    a.subject === b.subject &&
    a.onBehalfOf === b.onBehalfOf &&
    sameSnapshot(a.snapshot, b.snapshot);

/** Resolve session/delegation anew inside every serialized store transaction, including identical retries. */
const authorize = (tx: MarketplaceTransaction, request: typeof ReadSnapshot.Type, action: 'read' | 'stage') =>
    Effect.gen(
        /** Refresh identity and verify live participant grant/snapshot binding within the caller's serialized tenant transaction. */ function* () {
            const tenant = yield* CurrentTenant;
            const presented = yield* Caller;
            const resolver = yield* IdentityResolver;
            const caller = yield* resolver
                .resolve(presented)
                .pipe(
                    Effect.mapError(
                        /** Hide identity-provider diagnostics behind a marketplace denial. */ () => fail('denied')
                    )
                );
            yield* decode(CallerIdentity, caller);
            // Refreshing authority cannot switch the presented principal/session or cross the current tenant route.
            if (
                caller.tenant !== tenant.id ||
                caller.subject !== presented.subject ||
                caller.session !== presented.session ||
                caller.kind !== presented.kind ||
                caller.onBehalfOf !== presented.onBehalfOf ||
                presented.tenant !== tenant.id ||
                (tenant.id !== request.scope.ownerTenant && tenant.id !== request.scope.recipientTenant)
            )
                return yield* fail('denied');
            const rawGrant = yield* tx.grant(request.grant);
            if (rawGrant === undefined) return yield* fail('denied');
            const grant = yield* decode(ParticipantGrant, rawGrant);
            const now = yield* Clock.currentTimeMillis;
            if (
                grant.id !== request.grant ||
                grant.revoked ||
                grant.expiresAt <= now ||
                grant.participantTenant !== tenant.id ||
                grant.subject !== caller.subject ||
                grant.action !== action ||
                !sameScope(grant.scope, request.scope)
            )
                return yield* fail('denied');
            const rawSnapshot = yield* tx.snapshot(request.snapshot);
            if (rawSnapshot === undefined) return yield* fail('denied');
            const snapshot = yield* decode(SnapshotReference, rawSnapshot);
            if (snapshot.id !== request.snapshot || !sameScope(snapshot.scope, request.scope))
                return yield* fail('denied');
            const authority = yield* MarketplaceAuthority;
            yield* authority.authorize(caller, snapshot, action);
            // External authority checks may take time; a grant that expired while awaiting them cannot authorize this transaction.
            if (grant.expiresAt <= (yield* Clock.currentTimeMillis)) return yield* fail('denied');
            return { caller, tenant: tenant.id, snapshot };
        }
    );

const enabled = Effect.gen(
    /** Deny marketplace metadata operations until the trusted feature evaluation enables the declared gate. */ function* () {
        // Resolve the flag service on execution so retained operations do not preserve an earlier enablement decision.
        const flags = yield* Flags;
        if (!(yield* flags.evaluate(marketplaceFlag)).value) return yield* fail('disabled');
    }
);

/** Internal metadata read, not an exposed ActionHost action, transport or private-record release. */
export const readSnapshot = (input: ReadSnapshotRequest) =>
    Effect.gen(
        /** Decode metadata read intent and resolve permission inside the same transaction that reads its referenced records. */ function* () {
            // Read and stage share the same rollout gate; metadata access does not bypass live participant authorization.
            yield* enabled;
            const request = yield* decode(ReadSnapshot, input);
            const store = yield* MarketplaceStore;
            return yield* store.transaction(
                /** Keep authorization and metadata lookup in one serialized store view. */ (tx) =>
                    authorize(tx, request, 'read').pipe(
                        Effect.map(
                            /** Release the authorized metadata reference only, not private source-record contents. */ (
                                a
                            ) => a.snapshot
                        )
                    )
            );
        }
    );

/** Stage exactly one immutable local intent and matching outbox item, or neither. No remote side effects. */
export const stageExchange = (input: StageExchangeRequest) =>
    Effect.gen(
        /** Validate staging intent before entering the tenant store's atomic deduplication/outbox boundary. */ function* () {
            // The store transaction owns publication: this orchestration must not invoke a remote exchange provider.
            yield* enabled;
            const request = yield* decode(StageExchange, input);
            const store = yield* MarketplaceStore;
            return yield* store.transaction(
                /** Stage or replay against one serialized grant/snapshot/command view. */ (tx) =>
                    Effect.gen(
                        /** Reauthorize identical retries and atomically persist a new intent with its matching local outbox command. */ function* () {
                            // Authorization precedes replay lookup, so a saved command is not reusable authority after grant revocation.
                            const { caller, tenant, snapshot } = yield* authorize(tx, request, 'stage');
                            if (snapshot.sourceVersion !== request.expectedVersion) return yield* fail('conflict');
                            const intent: ExchangeIntent = {
                                command: request.command,
                                grant: request.grant,
                                tenant,
                                subject: caller.subject,
                                onBehalfOf: caller.onBehalfOf ?? null,
                                snapshot,
                                state: 'pending',
                            };
                            const existing = yield* tx.intent(request.command);
                            if (existing !== undefined) {
                                const checked = yield* decode(ExchangeIntent, existing);
                                if (!sameIntent(checked, intent)) return yield* fail('conflict');
                                return checked;
                            }
                            yield* tx.insertIntent(intent);
                            yield* tx.enqueue(intent);
                            return intent;
                        }
                    )
            );
        }
    );

/** EVE-251: no trust provider, algorithm, attestation verifier or key custody is selected or bypassable. */
export const privateExchangeUnavailable: Effect.Effect<never, MarketplaceFailure> = Effect.fail(
    new MarketplaceFailure({ reason: 'trust-unapproved' })
);
