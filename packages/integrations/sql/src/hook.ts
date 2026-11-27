/**
 * @file packages/integrations/sql/src/hook.ts
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

import { SqlClient } from '@effect/sql';
import type { SqlError } from '@effect/sql/SqlError';
import {
    HookChangeFeed,
    HookClaim,
    HookDeclaration,
    HookDeadLetter,
    HookEvent,
    HookOperatorPolicy,
    HookOutbox,
    HookOutboxFailure,
    HookRecovery,
    HookSettlement,
    type HookPin,
} from '@eventiva/contracts/hook';
import { CurrentTenant, Storage } from '@eventiva/contracts/storage';
import { Context, Effect, Layer, Option, Schema } from 'effect';
import type { Dialect } from './migrations.ts';
import { transactionScope, type TransactionScope } from './transaction.ts';
import { uuidV7 } from './values.ts';

const Integer = Schema.Union(Schema.Number, Schema.NumberFromString).pipe(
    Schema.filter(
        /**
         * Accept exact nonnegative counters and milliseconds after either numeric driver representation is decoded.
         *
         * @param n - The decoded numeric value.
         * @returns Whether the value is a safe nonnegative integer.
         */
        (n) => Number.isSafeInteger(n) && n >= 0
    )
);
const Row = Schema.Struct({
    idempotency_key: Schema.UUID,
    event_id: Schema.UUID,
    resource: Schema.String,
    sequence: Integer,
    event: Schema.String,
    state: Schema.Literal('pending', 'running', 'retry', 'delivered', 'dead-letter'),
    attempt: Integer,
    lease: Schema.NullOr(Schema.UUID),
    lease_until: Integer,
    settlement: Schema.NullOr(Schema.String),
});
/**
 * Decode untrusted caller or driver values without retaining their contents in schema diagnostics.
 *
 * @template A - The decoded value.
 * @template I - The encoded form the schema accepts.
 * @template Input - The static type of the supplied value, which is still decoded as unknown.
 * @param schema - The schema the value must satisfy.
 * @param input - The caller or driver value to decode.
 * @returns The decoded value.
 * @fails {HookOutboxFailure} With `invalid` when the value does not decode.
 */
const decode = <A, I, Input>(schema: Schema.Schema<A, I>, input: Input) =>
    Schema.decodeUnknown(schema)(input).pipe(
        Effect.mapError(
            /**
             * Return a closed invalid reason instead of arbitrary schema diagnostics.
             *
             * @returns A HookOutboxFailure with the `invalid` reason.
             */
            () => new HookOutboxFailure({ reason: 'invalid' })
        )
    );
/**
 * Encode every observer identity component into one unambiguous tenant/version/generation-bound database key.
 *
 * @param pin - The observer pin naming tenant, owner module, version, generation, hook and revision.
 * @returns A JSON array string that identifies exactly that observer pin.
 */
const keyOf = (pin: HookPin) =>
    JSON.stringify([pin.tenant, pin.owner.module, pin.owner.version, pin.owner.generation, pin.hook, pin.revision]);

/**
 * Provide BOTH Storage and HookOutbox on the same captured client and authenticated tenant.
 * Stage only inside this Storage.transaction/commit; claim/settle reject every ambient SQL transaction.
 * No callback, release policy or observer is executed by this adapter.
 *
 * @param dialect - The SQL engine of the tenant client.
 * @returns A scoped layer providing Storage, HookOutbox, HookChangeFeed and HookRecovery on one transaction owner.
 * @fails {StorageFailure} When the paired storage layer cannot be built.
 * @fails {HookOutboxFailure} With `transaction-required` when the owner's client is not the ambient SQL client.
 * @since 0.0.1
 * @example
 * const program = Effect.provide(publishLifecycle, hookStorage('postgres'));
 */
export const hookStorage = (dialect: Dialect) =>
    Layer.scopedContext(
        Effect.gen(
            /** Acquire one transaction owner and compose hook capabilities over that exact storage owner. */ function* () {
                // The paired storage and outbox must share a private root, not merely the same SQL connection.
                const owner = yield* transactionScope(dialect, 'hook-foreign-transaction');
                return yield* hookContext(dialect, owner);
            }
        )
    );

/**
 * Trusted SQL composition only; not an independent transaction root or plugin capability.
 *
 * @internal
 * @param dialect - The SQL engine of the tenant client, which selects the database clock query.
 * @param owner - The transaction scope whose storage and client this context shares.
 * @returns The Storage, HookOutbox, HookChangeFeed and HookRecovery services bound to the owner and current tenant.
 * @fails {HookOutboxFailure} With `transaction-required` when the owner's client is not the ambient SQL client.
 * @since 0.0.1
 * @example
 * const outbox = Context.get(yield* hookContext('postgres', owner), HookOutbox);
 */
export const hookContext = (dialect: Dialect, owner: TransactionScope) =>
    Effect.gen(
        /** Capture one tenant/client pair and return storage, delivery, recovery and feed capabilities sharing it. */ function* () {
            const sql = yield* SqlClient.SqlClient;
            const tenant = (yield* CurrentTenant).id;
            if (owner.client !== sql) return yield* new HookOutboxFailure({ reason: 'transaction-required' });
            const noTransaction = Effect.gen(
                /** Reject ambient transactions so worker and committed-feed operations cannot borrow uncommitted state. */ function* () {
                    if (Option.isSome(yield* Effect.serviceOption(SqlClient.TransactionConnection)))
                        return yield* new HookOutboxFailure({ reason: 'transaction-active' });
                }
            );
            /**
             * Start an adapter-owned transaction only outside every ambient SQL transaction and sanitize driver failures.
             *
             * @template A - The work's success value.
             * @param effect - The worker work to run in its own SQL transaction.
             * @returns The work's result once the transaction commits.
             * @fails {HookOutboxFailure} With `transaction-active` inside an ambient transaction, `unavailable` when SQL fails, or the work's own outbox failure.
             */
            const outside = <A>(effect: Effect.Effect<A, HookOutboxFailure | SqlError>) =>
                Effect.gen(
                    /** Check transaction isolation before acquiring the worker's independent transaction. */ function* () {
                        yield* noTransaction;
                        return yield* sql.withTransaction(effect);
                    }
                ).pipe(
                    Effect.catchTag(
                        'SqlError',
                        /**
                         * Preserve outbox domain failures while hiding SQL diagnostics.
                         *
                         * @returns A failure with the `unavailable` reason.
                         */
                        () => Effect.fail(new HookOutboxFailure({ reason: 'unavailable' }))
                    )
                );
            /**
             * Validate the complete observer declaration and bind it to the tenant captured by this adapter.
             *
             * @param input - The observer declaration; its pin must belong to the captured tenant.
             * @returns The decoded declaration.
             * @fails {HookOutboxFailure} With `invalid` when it is malformed or names another tenant.
             */
            const declaration = (input: HookDeclaration) =>
                Effect.gen(
                    /** Reject malformed or cross-tenant pins before they can identify a subscription row. */ function* () {
                        // Even typed declarations cross an adapter boundary; validate before using their tenant or key.
                        const d = yield* decode(HookDeclaration, input);
                        if (d.pin.tenant !== tenant) return yield* new HookOutboxFailure({ reason: 'invalid' });
                        return d;
                    }
                );
            // Serializes admission and settlement per exact observer pin, never across observers/tenants.
            // Sorted multi-pin staging prevents lock-order cycles; SQLite uses the client's BEGIN IMMEDIATE.
            /**
             * Lock an existing exact subscription and reject declaration changes under an already admitted observer pin.
             *
             * @param d - The validated observer declaration whose subscription row is locked.
             * @returns True when the subscription exists and was locked, false when it does not exist yet.
             * @fails {HookOutboxFailure} With `conflict` when the stored declaration differs from the supplied one.
             */
            const lock = (d: HookDeclaration) =>
                Effect.gen(
                    /** Distinguish absent subscriptions from conflicting declarations while retaining the transaction's row lock. */ function* () {
                        const pin = keyOf(d.pin);
                        const [row] = yield* sql<{
                            declaration: string;
                        }>`UPDATE hook_subscription SET declaration = declaration WHERE pin = ${pin} AND tenant = ${tenant} RETURNING declaration`;
                        if (row === undefined) return false;
                        // The immutable pin must keep the admitted policy, not merely match its tenant and hook name.
                        if (row.declaration !== JSON.stringify(d))
                            return yield* new HookOutboxFailure({ reason: 'conflict' });
                        return true;
                    }
                );
            const freshId = uuidV7.pipe(
                Effect.mapError(
                    /**
                     * Hide identifier-generation failures behind the outbox's closed availability reason.
                     *
                     * @returns A HookOutboxFailure with the `unavailable` reason.
                     */
                    () => new HookOutboxFailure({ reason: 'unavailable' })
                )
            );
            // One database clock governs all workers; caller timestamps and process clock skew grant no lease.
            const time = Effect.gen(
                /** Read validated epoch milliseconds from the database rather than the caller or worker clock. */ function* () {
                    // Both dialects must return the same millisecond unit before lease comparisons use this value.
                    const [row] =
                        dialect === 'postgres'
                            ? yield* sql<{
                                  now: string | number;
                              }>`SELECT CAST(EXTRACT(EPOCH FROM clock_timestamp()) * 1000 AS bigint) AS now`
                            : yield* sql<{
                                  now: string | number;
                              }>`SELECT CAST((julianday('now') - 2440587.5) * 86400000 AS integer) AS now`;
                    if (row === undefined) return yield* new HookOutboxFailure({ reason: 'invalid' });
                    return yield* decode(Integer, row.now);
                }
            );
            const outbox = HookOutbox.of({
                /**
                 * Stage a committed-fact event and bounded observer deliveries only within this owner's storage mutation.
                 *
                 * @param source - The committed-fact event to publish on the tenant feed.
                 * @param observers - The observer declarations that each receive one pending delivery.
                 * @returns An effect that completes once the event and every delivery are staged in the owner's transaction.
                 * @fails {HookOutboxFailure} With `transaction-required` outside the owner's transaction, `invalid` for a malformed or foreign event or declaration, `conflict` when an id was staged with different content or a later sequence exists, `capacity` when an observer is full, or `unavailable` when SQL fails.
                 */
                stage: (source, observers) =>
                    Effect.gen(
                        /** Validate transaction provenance and tenant binding before atomically staging any observer delivery. */ function* () {
                            yield* owner.required.pipe(
                                Effect.mapError(
                                    /**
                                     * Reject staging outside the captured mutation owner without exposing transaction diagnostics.
                                     *
                                     * @returns A HookOutboxFailure with the `transaction-required` reason.
                                     */
                                    () => new HookOutboxFailure({ reason: 'transaction-required' })
                                )
                            );
                            const event = yield* decode(HookEvent, source);
                            if (event.tenant !== tenant) return yield* new HookOutboxFailure({ reason: 'invalid' });
                            const declarations = yield* Effect.forEach(observers, declaration);
                            // Savepoint makes staging all-or-nothing even when a caller handles a capacity/conflict failure.
                            yield* sql.withTransaction(
                                Effect.gen(
                                    /** Serialize feed publication with the originating commit and admit all observer deliveries together. */ function* () {
                                        // Hold the tenant head lock THROUGH the originating commit. A database sequence
                                        // alone could publish cursor 2 before 1 commits, permanently skipping 1 on resume.
                                        yield* sql`INSERT INTO hook_feed_head (tenant, cursor) VALUES (${tenant}, 0) ON CONFLICT (tenant) DO NOTHING`;
                                        yield* sql`UPDATE hook_feed_head SET cursor = cursor WHERE tenant = ${tenant}`;
                                        const [existing] = yield* sql<{
                                            event: string;
                                        }>`SELECT event FROM hook_event WHERE tenant = ${tenant} AND event_id = ${event.id}`;
                                        if (existing !== undefined) {
                                            if (existing.event !== JSON.stringify(event))
                                                return yield* new HookOutboxFailure({ reason: 'conflict' });
                                        } else {
                                            const [head] = yield* sql<{
                                                cursor: string | number;
                                            }>`UPDATE hook_feed_head SET cursor = cursor + 1 WHERE tenant = ${tenant} RETURNING cursor`;
                                            if (head === undefined)
                                                return yield* new HookOutboxFailure({ reason: 'invalid' });
                                            const cursor = yield* decode(Integer, head.cursor);
                                            yield* sql`INSERT INTO hook_event (tenant, cursor, event_id, event) VALUES (${tenant}, ${cursor}, ${event.id}, ${JSON.stringify(event)})`;
                                        }
                                        for (const d of [...declarations].sort(
                                            /**
                                             * Acquire multiple subscription locks in a stable pin order to avoid staging lock cycles.
                                             *
                                             * @param a - The first declaration to order.
                                             * @param b - The second declaration to order.
                                             * @returns A negative, zero or positive number ordering the two by pin key.
                                             */
                                            (a, b) => keyOf(a.pin).localeCompare(keyOf(b.pin))
                                        )) {
                                            if (
                                                !d.observations.includes(event.projection.kind) ||
                                                !d.profiles.includes(event.profile)
                                            )
                                                return yield* new HookOutboxFailure({ reason: 'invalid' });
                                            const pin = keyOf(d.pin);
                                            yield* sql`INSERT INTO hook_subscription (pin, tenant, declaration) VALUES (${pin}, ${tenant}, ${JSON.stringify(d)}) ON CONFLICT (pin) DO NOTHING`;
                                            yield* lock(d);
                                            const [prior] = yield* sql<{
                                                event: string;
                                            }>`SELECT event FROM hook_delivery WHERE subscription = ${pin} AND event_id = ${event.id}`;
                                            if (prior !== undefined) {
                                                if (prior.event !== JSON.stringify(event))
                                                    return yield* new HookOutboxFailure({ reason: 'conflict' });
                                                continue;
                                            }
                                            const [count] = yield* sql<{
                                                total: string | number;
                                            }>`SELECT COUNT(*) AS total FROM hook_delivery WHERE subscription = ${pin} AND state NOT IN ('delivered', 'dead-letter')`;
                                            if (count === undefined)
                                                return yield* new HookOutboxFailure({ reason: 'invalid' });
                                            if ((yield* decode(Integer, count.total)) >= d.capacity)
                                                return yield* new HookOutboxFailure({ reason: 'capacity' });
                                            const earlier =
                                                yield* sql`SELECT event_id FROM hook_delivery WHERE subscription = ${pin} AND resource = ${event.resource} AND sequence >= ${event.sequence} LIMIT 1`;
                                            if (earlier.length !== 0)
                                                return yield* new HookOutboxFailure({ reason: 'conflict' });
                                            const id = yield* freshId;
                                            yield* sql`INSERT INTO hook_delivery (idempotency_key, subscription, event_id, resource, sequence, event, state) VALUES (${id}, ${pin}, ${event.id}, ${event.resource}, ${event.sequence}, ${JSON.stringify(event)}, 'pending')`;
                                        }
                                    }
                                )
                            );
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /**
                             * Preserve admission/capacity failures while hiding driver details.
                             *
                             * @returns A failure with the `unavailable` reason.
                             */
                            () => Effect.fail(new HookOutboxFailure({ reason: 'unavailable' }))
                        )
                    ),
                /**
                 * Lease the earliest eligible per-resource delivery using database time and a bounded attempt budget.
                 *
                 * @param input - The observer declaration; its pin must belong to the captured tenant.
                 * @param requestedAt - The caller's timestamp, validated but never used as the lease clock.
                 * @returns The leased claim, or undefined when the subscription is absent, nothing is due or the due delivery was dead-lettered for exhausted attempts.
                 * @fails {HookOutboxFailure} With `transaction-active` inside an ambient transaction, `invalid` for malformed input or inconsistent stored rows, `conflict` when the declaration changed, or `unavailable` when SQL fails.
                 */
                claim: (input, requestedAt) =>
                    outside(
                        Effect.gen(
                            /** Lock the exact observer, validate persisted event identity and fence the next attempt with a fresh lease. */ function* () {
                                yield* decode(Integer, requestedAt);
                                const d = yield* declaration(input);
                                if (!(yield* lock(d))) return undefined;
                                const pin = keyOf(d.pin);
                                // Read the clock AFTER obtaining the pin lock, never trust a pre-lock caller timestamp.
                                const now = yield* time;
                                const [raw] = yield* sql<
                                    typeof Row.Encoded
                                >`SELECT d.idempotency_key, d.event_id, d.resource, d.sequence, d.event, d.state, d.attempt, d.lease, d.lease_until, d.settlement FROM hook_delivery d WHERE d.subscription = ${pin} AND ((d.state IN ('pending', 'retry') AND d.due <= ${now}) OR (d.state = 'running' AND d.lease_until <= ${now})) AND NOT EXISTS (SELECT 1 FROM hook_delivery earlier WHERE earlier.subscription = d.subscription AND earlier.resource = d.resource AND earlier.sequence < d.sequence AND earlier.state NOT IN ('delivered', 'dead-letter')) ORDER BY d.sequence, d.idempotency_key LIMIT 1`;
                                if (raw === undefined) return undefined;
                                const row = yield* decode(Row, raw);
                                const event = yield* decode(Schema.parseJson(HookEvent), row.event);
                                if (
                                    event.tenant !== tenant ||
                                    event.id !== row.event_id ||
                                    event.resource !== row.resource ||
                                    event.sequence !== row.sequence ||
                                    !d.observations.includes(event.projection.kind) ||
                                    !d.profiles.includes(event.profile)
                                )
                                    return yield* new HookOutboxFailure({ reason: 'invalid' });
                                if (row.attempt >= d.maxAttempts) {
                                    yield* sql`UPDATE hook_delivery SET state = 'dead-letter', lease = NULL, settlement = ${JSON.stringify({ state: 'dead-letter', reason: 'exhausted' })} WHERE idempotency_key = ${row.idempotency_key}`;
                                    return undefined;
                                }
                                const lease = yield* freshId;
                                const until = yield* decode(Integer, now + 2 * d.timeoutMs + 1000);
                                const claim = yield* decode(HookClaim, {
                                    lease,
                                    idempotencyKey: row.idempotency_key,
                                    pin: d.pin,
                                    event,
                                    attempt: row.attempt + 1,
                                });
                                yield* sql`UPDATE hook_delivery SET state = 'running', attempt = ${claim.attempt}, lease = ${lease}, lease_until = ${until}, settlement = NULL WHERE idempotency_key = ${row.idempotency_key}`;
                                return claim;
                            }
                        )
                    ),
                /**
                 * Require a live lease for first settlement; exact repeats remain idempotent after expiry, but replaced attempts fail.
                 *
                 * @param input - The claim returned when the delivery was leased.
                 * @param value - The settlement to record: delivered, retry or dead-letter.
                 * @returns An effect that completes once the settlement is recorded, or immediately for an exact repeat.
                 * @fails {HookOutboxFailure} With `lease-lost` when the lease expired, was replaced or the delivery was settled differently, `invalid` for malformed input, `transaction-active` inside an ambient transaction, or `unavailable` when SQL fails.
                 */
                settle: (input, value) =>
                    outside(
                        Effect.gen(
                            /** Verify claim identity and retained settlement under the subscription lock before advancing delivery state. */ function* () {
                                const claim = yield* decode(HookClaim, input);
                                const settlement = yield* decode(HookSettlement, value);
                                if (claim.pin.tenant !== tenant)
                                    return yield* new HookOutboxFailure({ reason: 'invalid' });
                                const pin = keyOf(claim.pin);
                                // Same pin lock as stage/claim; never permit a stale worker to settle a replacement lease.
                                yield* sql`UPDATE hook_subscription SET declaration = declaration WHERE pin = ${pin} AND tenant = ${tenant}`;
                                const [raw] = yield* sql<
                                    typeof Row.Encoded
                                >`SELECT idempotency_key, event_id, resource, sequence, event, state, attempt, lease, lease_until, settlement FROM hook_delivery WHERE idempotency_key = ${claim.idempotencyKey} AND subscription = ${pin} AND event_id = ${claim.event.id}`;
                                if (raw === undefined) return yield* new HookOutboxFailure({ reason: 'lease-lost' });
                                const row = yield* decode(Row, raw);
                                if (
                                    row.lease !== claim.lease ||
                                    row.attempt !== claim.attempt ||
                                    row.resource !== claim.event.resource ||
                                    row.sequence !== claim.event.sequence ||
                                    row.event !== JSON.stringify(claim.event)
                                )
                                    return yield* new HookOutboxFailure({ reason: 'lease-lost' });
                                const body = JSON.stringify(settlement);
                                if (row.state !== 'running') {
                                    if (row.settlement === body) return;
                                    return yield* new HookOutboxFailure({ reason: 'lease-lost' });
                                }
                                const now = yield* time;
                                if (row.lease_until <= now)
                                    return yield* new HookOutboxFailure({ reason: 'lease-lost' });
                                const due = settlement.state === 'retry' ? settlement.availableAt : 0;
                                const updated =
                                    yield* sql`UPDATE hook_delivery SET state = ${settlement.state}, due = ${due}, settlement = ${body} WHERE idempotency_key = ${claim.idempotencyKey} AND lease = ${claim.lease} AND attempt = ${claim.attempt} AND state = 'running' RETURNING idempotency_key`;
                                if (updated.length !== 1) return yield* new HookOutboxFailure({ reason: 'lease-lost' });
                            }
                        )
                    ),
            });
            const recovery = HookRecovery.of({
                /**
                 * Return an authorized, cursor-bounded page of terminal failure metadata, never full event payloads.
                 *
                 * @param input - The observer declaration; its pin must belong to the captured tenant.
                 * @param after - The exclusive idempotency-key cursor, or null for the first page.
                 * @param limit - The page size, from 1 to 100.
                 * @returns Up to `limit` dead-letter summaries, each with its key, event id, attempt and reason.
                 * @fails {HookOutboxFailure} With `transaction-active` inside an ambient transaction, `invalid` for malformed input or stored rows, `conflict` when the declaration changed, or `unavailable` when SQL fails.
                 * @fails {HookDenied} When the operator policy refuses inspection.
                 */
                deadLetters: (input, after, limit) =>
                    Effect.gen(
                        /** Validate inspection bounds and operator authority before acquiring a subscription lock. */ function* () {
                            yield* noTransaction;
                            const d = yield* declaration(input);
                            yield* decode(Schema.NullOr(Schema.UUID), after);
                            yield* decode(Schema.Int.pipe(Schema.between(1, 100)), limit);
                            // Unauthorized inspection must not acquire a worker transaction or expose retained terminal metadata.
                            yield* (yield* HookOperatorPolicy).authorize(d.pin, 'inspect');
                            return yield* outside(
                                Effect.gen(
                                    /** Read only the locked observer's dead-letter page and validate each terminal summary. */ function* () {
                                        if (!(yield* lock(d))) return [];
                                        // Keyset pagination stays within this exact observer; the projection deliberately omits event contents.
                                        const rows = yield* sql<{
                                            idempotency_key: string;
                                            event_id: string;
                                            attempt: string | number;
                                            settlement: string;
                                        }>`SELECT idempotency_key, event_id, attempt, settlement FROM hook_delivery WHERE subscription = ${keyOf(d.pin)} AND state = 'dead-letter' AND idempotency_key > ${after ?? ''} ORDER BY idempotency_key LIMIT ${limit}`;
                                        return yield* Effect.forEach(
                                            rows,
                                            /**
                                             * Decode one stored terminal result into bounded recovery metadata.
                                             *
                                             * @param row - One dead-letter row from the page query.
                                             * @returns The decoded dead-letter summary.
                                             */
                                            (row) =>
                                                Effect.gen(
                                                    /** Reject inconsistent settlement state before returning a dead-letter reason and attempt. */ function* () {
                                                        const settlement = yield* decode(
                                                            Schema.parseJson(HookSettlement),
                                                            row.settlement
                                                        );
                                                        // A dead-letter row cannot borrow a retry/delivered settlement's different fields.
                                                        if (settlement.state !== 'dead-letter')
                                                            return yield* new HookOutboxFailure({ reason: 'invalid' });
                                                        return yield* decode(HookDeadLetter, {
                                                            idempotencyKey: row.idempotency_key,
                                                            eventId: row.event_id,
                                                            attempt: yield* decode(Integer, row.attempt),
                                                            reason: settlement.reason,
                                                        });
                                                    }
                                                )
                                        );
                                    }
                                )
                            );
                        }
                    ),
                /**
                 * Authorize one idempotent redrive request; retain the sink key while granting a fresh bounded attempt budget.
                 *
                 * @param input - The observer declaration; its pin must belong to the captured tenant.
                 * @param idempotencyKey - The dead-lettered delivery's stable sink key.
                 * @param requestId - The caller's redrive request id, which makes the replay idempotent.
                 * @returns True when the delivery was reset to pending, false when this request id was already accepted for the same delivery.
                 * @fails {HookOutboxFailure} With `invalid` for malformed input or an unknown subscription or delivery, `conflict` when the delivery is not dead-lettered, a lease is running or the request id was used for another delivery, `capacity` when the observer is full, `transaction-active` inside an ambient transaction, or `unavailable` when SQL fails.
                 * @fails {HookDenied} When the operator policy refuses replay.
                 */
                replay: (input, idempotencyKey, requestId) =>
                    Effect.gen(
                        /** Validate replay keys and operator authority before opening the independent recovery transaction. */ function* () {
                            yield* noTransaction;
                            const d = yield* declaration(input);
                            yield* decode(Schema.UUID, idempotencyKey);
                            yield* decode(Schema.UUID, requestId);
                            // Replays are privileged recovery operations, not an alternate path around the subscription's policy.
                            yield* (yield* HookOperatorPolicy).authorize(d.pin, 'replay');
                            return yield* outside(
                                Effect.gen(
                                    /** Serialize redrive admission, terminal-state validation and lease fencing with the exact observer. */ function* () {
                                        const pin = keyOf(d.pin);
                                        if (!(yield* lock(d)))
                                            return yield* new HookOutboxFailure({ reason: 'invalid' });
                                        const [prior] = yield* sql<{
                                            subscription: string;
                                            idempotency_key: string;
                                        }>`SELECT subscription, idempotency_key FROM hook_redrive WHERE tenant = ${tenant} AND request_id = ${requestId}`;
                                        if (prior !== undefined) {
                                            if (prior.subscription !== pin || prior.idempotency_key !== idempotencyKey)
                                                return yield* new HookOutboxFailure({ reason: 'conflict' });
                                            return false;
                                        }
                                        const [raw] = yield* sql<
                                            typeof Row.Encoded
                                        >`SELECT idempotency_key, event_id, resource, sequence, event, state, attempt, lease, lease_until, settlement FROM hook_delivery WHERE subscription = ${pin} AND idempotency_key = ${idempotencyKey}`;
                                        if (raw === undefined)
                                            return yield* new HookOutboxFailure({ reason: 'invalid' });
                                        const row = yield* decode(Row, raw);
                                        if (row.state !== 'dead-letter' || row.settlement === null)
                                            return yield* new HookOutboxFailure({ reason: 'conflict' });
                                        const settlement = yield* decode(
                                            Schema.parseJson(HookSettlement),
                                            row.settlement
                                        );
                                        if (settlement.state !== 'dead-letter')
                                            return yield* new HookOutboxFailure({ reason: 'invalid' });
                                        const active =
                                            yield* sql`SELECT idempotency_key FROM hook_delivery WHERE subscription = ${pin} AND resource = ${row.resource} AND state = 'running' LIMIT 1`;
                                        if (active.length !== 0)
                                            return yield* new HookOutboxFailure({ reason: 'conflict' });
                                        const [count] = yield* sql<{
                                            total: string | number;
                                        }>`SELECT COUNT(*) AS total FROM hook_delivery WHERE subscription = ${pin} AND state NOT IN ('delivered', 'dead-letter')`;
                                        if (count === undefined)
                                            return yield* new HookOutboxFailure({ reason: 'invalid' });
                                        if ((yield* decode(Integer, count.total)) >= d.capacity)
                                            return yield* new HookOutboxFailure({ reason: 'capacity' });
                                        // Record the old terminal attempt before granting a fresh bounded retry budget.
                                        // The stable sink key never changes, and clearing the lease fences every old worker.
                                        // Different pins hold different locks: arbitrate their shared request UUID in SQL.
                                        const accepted =
                                            yield* sql`INSERT INTO hook_redrive (tenant, request_id, subscription, idempotency_key, attempt, reason, occurred_at) VALUES (${tenant}, ${requestId}, ${pin}, ${idempotencyKey}, ${row.attempt}, ${settlement.reason}, ${yield* time}) ON CONFLICT (tenant, request_id) DO NOTHING RETURNING request_id`;
                                        if (accepted.length === 0)
                                            return yield* new HookOutboxFailure({ reason: 'conflict' });
                                        yield* sql`UPDATE hook_delivery SET state = 'pending', attempt = 0, due = 0, lease = NULL, lease_until = 0, settlement = NULL WHERE idempotency_key = ${idempotencyKey} AND subscription = ${pin}`;
                                        return true;
                                    }
                                )
                            );
                        }
                    ),
            });
            const feed = HookChangeFeed.of({
                /**
                 * Read a bounded committed tenant feed page after the cursor without taking a writer transaction.
                 *
                 * @param after - The exclusive feed cursor; zero reads from the start.
                 * @param limit - The page size, from 1 to 100.
                 * @returns The committed events after the cursor, in cursor order, and the cursor to resume from.
                 * @fails {HookOutboxFailure} With `transaction-active` inside an ambient transaction, `invalid` for malformed input or feed rows, or `unavailable` when SQL fails.
                 */
                read: (after, limit) =>
                    Effect.gen(
                        /** Reject ambient transactions and validate persisted event provenance before publishing a cursor. */ function* () {
                            // A plain committed SELECT must not acquire SQLite's BEGIN IMMEDIATE writer lock.
                            // An ambient transaction could expose the caller's uncommitted facts, so reject it.
                            if (Option.isSome(yield* Effect.serviceOption(SqlClient.TransactionConnection)))
                                return yield* new HookOutboxFailure({ reason: 'transaction-active' });
                            yield* decode(Integer, after);
                            yield* decode(Schema.Int.pipe(Schema.between(1, 100)), limit);
                            const rows = yield* sql<{
                                cursor: string | number;
                                event_id: string;
                                event: string;
                            }>`SELECT cursor, event_id, event FROM hook_event WHERE tenant = ${tenant} AND cursor > ${after} ORDER BY cursor LIMIT ${limit}`;
                            const events = yield* Effect.forEach(
                                rows,
                                /**
                                 * Convert one persisted feed row into a validated cursor/event pair.
                                 *
                                 * @param row - One row from the feed page query.
                                 * @returns The validated cursor and event pair.
                                 */
                                (row) =>
                                    Effect.gen(
                                        /** Cross-check the decoded event against both the tenant boundary and indexed event ID. */ function* () {
                                            const cursor = yield* decode(Integer, row.cursor);
                                            const event = yield* decode(Schema.parseJson(HookEvent), row.event);
                                            // A schema-valid JSON body alone does not establish that it belongs to this feed row.
                                            if (event.tenant !== tenant || event.id !== row.event_id)
                                                return yield* new HookOutboxFailure({ reason: 'invalid' });
                                            return { cursor, event };
                                        }
                                    )
                            );
                            return { cursor: events.at(-1)?.cursor ?? after, events };
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /**
                             * Keep malformed feed evidence distinguishable from sanitized SQL unavailability.
                             *
                             * @returns A failure with the `unavailable` reason.
                             */
                            () => Effect.fail(new HookOutboxFailure({ reason: 'unavailable' }))
                        )
                    ),
            });
            return Context.make(Storage, owner.storage).pipe(
                Context.add(HookOutbox, outbox),
                Context.add(HookChangeFeed, feed),
                Context.add(HookRecovery, recovery)
            );
        }
    );
