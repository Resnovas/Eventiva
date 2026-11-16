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
    Schema.filter((n) => Number.isSafeInteger(n) && n >= 0)
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
const decode = <A, I, Input>(schema: Schema.Schema<A, I>, input: Input) =>
    Schema.decodeUnknown(schema)(input).pipe(Effect.mapError(() => new HookOutboxFailure({ reason: 'invalid' })));
const keyOf = (pin: HookPin) =>
    JSON.stringify([pin.tenant, pin.owner.module, pin.owner.version, pin.owner.generation, pin.hook, pin.revision]);

/** Provide BOTH Storage and HookOutbox on the same captured client and authenticated tenant.
 * Stage only inside this Storage.transaction/commit; claim/settle reject every ambient SQL transaction.
 * No callback, release policy or observer is executed by this adapter.
 */
export const hookStorage = (dialect: Dialect) =>
    Layer.scopedContext(
        Effect.gen(function* () {
            const owner = yield* transactionScope(dialect, 'hook-foreign-transaction');
            return yield* hookContext(dialect, owner);
        })
    );

/** @internal Trusted SQL composition only; not an independent transaction root or plugin capability. */
export const hookContext = (dialect: Dialect, owner: TransactionScope) =>
    Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        const tenant = (yield* CurrentTenant).id;
        if (owner.client !== sql) return yield* new HookOutboxFailure({ reason: 'transaction-required' });
        const noTransaction = Effect.gen(function* () {
            if (Option.isSome(yield* Effect.serviceOption(SqlClient.TransactionConnection)))
                return yield* new HookOutboxFailure({ reason: 'transaction-active' });
        });
        const outside = <A>(effect: Effect.Effect<A, HookOutboxFailure | SqlError>) =>
            Effect.gen(function* () {
                yield* noTransaction;
                return yield* sql.withTransaction(effect);
            }).pipe(Effect.catchTag('SqlError', () => Effect.fail(new HookOutboxFailure({ reason: 'unavailable' }))));
        const declaration = (input: HookDeclaration) =>
            Effect.gen(function* () {
                const d = yield* decode(HookDeclaration, input);
                if (d.pin.tenant !== tenant) return yield* new HookOutboxFailure({ reason: 'invalid' });
                return d;
            });
        // Serializes admission and settlement per exact observer pin, never across observers/tenants.
        // Sorted multi-pin staging prevents lock-order cycles; SQLite uses the client's BEGIN IMMEDIATE.
        const lock = (d: HookDeclaration) =>
            Effect.gen(function* () {
                const pin = keyOf(d.pin);
                const [row] = yield* sql<{
                    declaration: string;
                }>`UPDATE hook_subscription SET declaration = declaration WHERE pin = ${pin} AND tenant = ${tenant} RETURNING declaration`;
                if (row === undefined) return false;
                if (row.declaration !== JSON.stringify(d)) return yield* new HookOutboxFailure({ reason: 'conflict' });
                return true;
            });
        const freshId = uuidV7.pipe(Effect.mapError(() => new HookOutboxFailure({ reason: 'unavailable' })));
        // One database clock governs all workers; caller timestamps and process clock skew grant no lease.
        const time = Effect.gen(function* () {
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
        });
        const outbox = HookOutbox.of({
            stage: (source, observers) =>
                Effect.gen(function* () {
                    yield* owner.required.pipe(
                        Effect.mapError(() => new HookOutboxFailure({ reason: 'transaction-required' }))
                    );
                    const event = yield* decode(HookEvent, source);
                    if (event.tenant !== tenant) return yield* new HookOutboxFailure({ reason: 'invalid' });
                    const declarations = yield* Effect.forEach(observers, declaration);
                    // Savepoint makes staging all-or-nothing even when a caller handles a capacity/conflict failure.
                    yield* sql.withTransaction(
                        Effect.gen(function* () {
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
                                if (head === undefined) return yield* new HookOutboxFailure({ reason: 'invalid' });
                                const cursor = yield* decode(Integer, head.cursor);
                                yield* sql`INSERT INTO hook_event (tenant, cursor, event_id, event) VALUES (${tenant}, ${cursor}, ${event.id}, ${JSON.stringify(event)})`;
                            }
                            for (const d of [...declarations].sort((a, b) =>
                                keyOf(a.pin).localeCompare(keyOf(b.pin))
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
                                if (count === undefined) return yield* new HookOutboxFailure({ reason: 'invalid' });
                                if ((yield* decode(Integer, count.total)) >= d.capacity)
                                    return yield* new HookOutboxFailure({ reason: 'capacity' });
                                const earlier =
                                    yield* sql`SELECT event_id FROM hook_delivery WHERE subscription = ${pin} AND resource = ${event.resource} AND sequence >= ${event.sequence} LIMIT 1`;
                                if (earlier.length !== 0) return yield* new HookOutboxFailure({ reason: 'conflict' });
                                const id = yield* freshId;
                                yield* sql`INSERT INTO hook_delivery (idempotency_key, subscription, event_id, resource, sequence, event, state) VALUES (${id}, ${pin}, ${event.id}, ${event.resource}, ${event.sequence}, ${JSON.stringify(event)}, 'pending')`;
                            }
                        })
                    );
                }).pipe(
                    Effect.catchTag('SqlError', () => Effect.fail(new HookOutboxFailure({ reason: 'unavailable' })))
                ),
            claim: (input, requestedAt) =>
                outside(
                    Effect.gen(function* () {
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
                    })
                ),
            settle: (input, value) =>
                outside(
                    Effect.gen(function* () {
                        const claim = yield* decode(HookClaim, input);
                        const settlement = yield* decode(HookSettlement, value);
                        if (claim.pin.tenant !== tenant) return yield* new HookOutboxFailure({ reason: 'invalid' });
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
                        if (row.lease_until <= now) return yield* new HookOutboxFailure({ reason: 'lease-lost' });
                        const due = settlement.state === 'retry' ? settlement.availableAt : 0;
                        const updated =
                            yield* sql`UPDATE hook_delivery SET state = ${settlement.state}, due = ${due}, settlement = ${body} WHERE idempotency_key = ${claim.idempotencyKey} AND lease = ${claim.lease} AND attempt = ${claim.attempt} AND state = 'running' RETURNING idempotency_key`;
                        if (updated.length !== 1) return yield* new HookOutboxFailure({ reason: 'lease-lost' });
                    })
                ),
        });
        const recovery = HookRecovery.of({
            deadLetters: (input, after, limit) =>
                Effect.gen(function* () {
                    yield* noTransaction;
                    const d = yield* declaration(input);
                    yield* decode(Schema.NullOr(Schema.UUID), after);
                    yield* decode(Schema.Int.pipe(Schema.between(1, 100)), limit);
                    yield* (yield* HookOperatorPolicy).authorize(d.pin, 'inspect');
                    return yield* outside(
                        Effect.gen(function* () {
                            if (!(yield* lock(d))) return [];
                            const rows = yield* sql<{
                                idempotency_key: string;
                                event_id: string;
                                attempt: string | number;
                                settlement: string;
                            }>`SELECT idempotency_key, event_id, attempt, settlement FROM hook_delivery WHERE subscription = ${keyOf(d.pin)} AND state = 'dead-letter' AND idempotency_key > ${after ?? ''} ORDER BY idempotency_key LIMIT ${limit}`;
                            return yield* Effect.forEach(rows, (row) =>
                                Effect.gen(function* () {
                                    const settlement = yield* decode(Schema.parseJson(HookSettlement), row.settlement);
                                    if (settlement.state !== 'dead-letter')
                                        return yield* new HookOutboxFailure({ reason: 'invalid' });
                                    return yield* decode(HookDeadLetter, {
                                        idempotencyKey: row.idempotency_key,
                                        eventId: row.event_id,
                                        attempt: yield* decode(Integer, row.attempt),
                                        reason: settlement.reason,
                                    });
                                })
                            );
                        })
                    );
                }),
            replay: (input, idempotencyKey, requestId) =>
                Effect.gen(function* () {
                    yield* noTransaction;
                    const d = yield* declaration(input);
                    yield* decode(Schema.UUID, idempotencyKey);
                    yield* decode(Schema.UUID, requestId);
                    yield* (yield* HookOperatorPolicy).authorize(d.pin, 'replay');
                    return yield* outside(
                        Effect.gen(function* () {
                            const pin = keyOf(d.pin);
                            if (!(yield* lock(d))) return yield* new HookOutboxFailure({ reason: 'invalid' });
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
                            if (raw === undefined) return yield* new HookOutboxFailure({ reason: 'invalid' });
                            const row = yield* decode(Row, raw);
                            if (row.state !== 'dead-letter' || row.settlement === null)
                                return yield* new HookOutboxFailure({ reason: 'conflict' });
                            const settlement = yield* decode(Schema.parseJson(HookSettlement), row.settlement);
                            if (settlement.state !== 'dead-letter')
                                return yield* new HookOutboxFailure({ reason: 'invalid' });
                            const active =
                                yield* sql`SELECT idempotency_key FROM hook_delivery WHERE subscription = ${pin} AND resource = ${row.resource} AND state = 'running' LIMIT 1`;
                            if (active.length !== 0) return yield* new HookOutboxFailure({ reason: 'conflict' });
                            const [count] = yield* sql<{
                                total: string | number;
                            }>`SELECT COUNT(*) AS total FROM hook_delivery WHERE subscription = ${pin} AND state NOT IN ('delivered', 'dead-letter')`;
                            if (count === undefined) return yield* new HookOutboxFailure({ reason: 'invalid' });
                            if ((yield* decode(Integer, count.total)) >= d.capacity)
                                return yield* new HookOutboxFailure({ reason: 'capacity' });
                            // Record the old terminal attempt before granting a fresh bounded retry budget.
                            // The stable sink key never changes, and clearing the lease fences every old worker.
                            // Different pins hold different locks: arbitrate their shared request UUID in SQL.
                            const accepted =
                                yield* sql`INSERT INTO hook_redrive (tenant, request_id, subscription, idempotency_key, attempt, reason, occurred_at) VALUES (${tenant}, ${requestId}, ${pin}, ${idempotencyKey}, ${row.attempt}, ${settlement.reason}, ${yield* time}) ON CONFLICT (tenant, request_id) DO NOTHING RETURNING request_id`;
                            if (accepted.length === 0) return yield* new HookOutboxFailure({ reason: 'conflict' });
                            yield* sql`UPDATE hook_delivery SET state = 'pending', attempt = 0, due = 0, lease = NULL, lease_until = 0, settlement = NULL WHERE idempotency_key = ${idempotencyKey} AND subscription = ${pin}`;
                            return true;
                        })
                    );
                }),
        });
        const feed = HookChangeFeed.of({
            read: (after, limit) =>
                Effect.gen(function* () {
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
                    const events = yield* Effect.forEach(rows, (row) =>
                        Effect.gen(function* () {
                            const cursor = yield* decode(Integer, row.cursor);
                            const event = yield* decode(Schema.parseJson(HookEvent), row.event);
                            if (event.tenant !== tenant || event.id !== row.event_id)
                                return yield* new HookOutboxFailure({ reason: 'invalid' });
                            return { cursor, event };
                        })
                    );
                    return { cursor: events.at(-1)?.cursor ?? after, events };
                }).pipe(
                    Effect.catchTag('SqlError', () => Effect.fail(new HookOutboxFailure({ reason: 'unavailable' })))
                ),
        });
        return Context.make(Storage, owner.storage).pipe(
            Context.add(HookOutbox, outbox),
            Context.add(HookChangeFeed, feed),
            Context.add(HookRecovery, recovery)
        );
    });
