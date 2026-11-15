/**
 * @file packages/integrations/sql/src/storage.ts
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
import { SqlError } from '@effect/sql/SqlError';
import {
    Conflict,
    EpochMillis,
    GuardedCommand,
    Json,
    JsonValue,
    MinorUnits,
    Quantity,
    Storage,
    StorageFailure,
    UuidV7,
    Version,
} from '@eventiva/contracts/storage';
import { Clock, Effect, Layer, Schema } from 'effect';
import type { Dialect } from './migrations.ts';

const StoredRecord = Schema.Struct({
    id: UuidV7,
    state: Schema.NonEmptyString,
    version: Version,
    payload: JsonValue,
    leaseUntil: Schema.NullOr(EpochMillis),
});
const StoredResult = Schema.Struct({ output: JsonValue, receipt: JsonValue });
interface Row {
    id: string;
    state: string;
    version: string | number;
    payload: string;
    lease_until: Date | number | null;
}
const decode = <A, I>(schema: Schema.Schema<A, I>, value: unknown) =>
    Schema.decodeUnknown(schema)(value).pipe(
        Effect.mapError((cause) => new StorageFailure({ operation: 'codec', cause }))
    );
const encode = (value: JsonValue) =>
    Schema.encode(Json)(value).pipe(Effect.mapError((cause) => new StorageFailure({ operation: 'encode', cause })));

/** SQL methods close over one client; Effect SQL propagates its connection through the current fiber transaction. */
export const storage = (dialect: Dialect) =>
    Layer.effect(
        Storage,
        Effect.gen(function* () {
            const sql = yield* SqlClient.SqlClient;
            const time = (millis: number) => (dialect === 'postgres' ? new Date(millis).toISOString() : millis);
            const failure = (cause: unknown) => new StorageFailure({ operation: 'sql', cause });
            const transaction = <A, E, R>(
                effect: Effect.Effect<A, E | SqlError, R>
            ): Effect.Effect<A, E | StorageFailure, R> =>
                sql
                    .withTransaction(effect)
                    .pipe(Effect.mapError((cause) => (cause instanceof SqlError ? failure(cause) : cause)));
            const record = (row: Row) =>
                Effect.gen(function* () {
                    const payload = yield* decode(Json, row.payload);
                    return yield* decode(StoredRecord, {
                        id: row.id,
                        state: row.state,
                        version: Number(row.version),
                        payload,
                        leaseUntil: row.lease_until instanceof Date ? row.lease_until.getTime() : row.lease_until,
                    });
                });
            const get = (id: string) =>
                Effect.gen(function* () {
                    const rows = yield* sql<Row>`SELECT * FROM operational_record WHERE id = ${id}`;
                    return rows[0] ? yield* record(rows[0]) : undefined;
                }).pipe(Effect.catchTag('SqlError', (cause) => Effect.fail(failure(cause))));
            const audit: Storage['Type']['audit'] = (id, receipt) =>
                Effect.gen(function* () {
                    const body = yield* encode(receipt);
                    yield* sql`INSERT INTO action_receipt (id, receipt) VALUES (${id}, ${body}) ON CONFLICT (id) DO NOTHING`;
                    const [stored] = yield* sql<{
                        receipt: string;
                    }>`SELECT receipt FROM action_receipt WHERE id = ${id}`;
                    if (stored?.receipt !== body) return yield* new StorageFailure({ operation: 'receipt-id-reused' });
                }).pipe(Effect.catchTag('SqlError', (cause) => Effect.fail(failure(cause))));
            const expire = transaction(
                Effect.gen(function* () {
                    const now = yield* Clock.currentTimeMillis;
                    const rows = yield* sql<{
                        id: string;
                        resource: string;
                        quantity: string | number;
                    }>`UPDATE reservation SET state = 'expired' WHERE state = 'pending' AND expires_at <= ${time(now)} RETURNING id, resource, quantity`;
                    for (const entry of rows) {
                        yield* sql`UPDATE stock SET available = available + ${Number(entry.quantity)} WHERE id = ${entry.resource}`;
                        yield* sql`INSERT INTO quantity_ledger (id, resource, delta, occurred_at) VALUES (${entry.id + ':expired'}, ${entry.resource}, ${Number(entry.quantity)}, ${time(now)})`;
                    }
                })
            ).pipe(Effect.catchTag('SqlError', (cause) => Effect.fail(failure(cause))));
            return Storage.of({
                capabilities: { transactions: true, compareAndSet: true, appendOnlyLedger: true, device: false },
                ready: sql`SELECT id FROM action_receipt LIMIT 0`.pipe(Effect.asVoid, Effect.mapError(failure)),
                transaction,
                get,
                audit,
                expire,
                commit: (request, execute) =>
                    transaction(
                        Effect.gen(function* () {
                            yield* sql`INSERT INTO action_commit (key, input_hash) VALUES (${request.key}, ${request.inputHash}) ON CONFLICT (key) DO NOTHING`;
                            const [stored] = yield* sql<{
                                input_hash: string;
                                result: string | null;
                            }>`SELECT input_hash, result FROM action_commit WHERE key = ${request.key} ${dialect === 'postgres' ? sql.literal('FOR UPDATE') : sql.literal('')}`;
                            if (!stored || stored.input_hash !== request.inputHash)
                                return yield* new Conflict({ id: request.key, reason: 'input-changed' });
                            if (stored.result !== null) {
                                const result = yield* decode(Schema.parseJson(StoredResult), stored.result);
                                return { ...result, replayed: true };
                            }
                            const result = yield* execute;
                            const validated = yield* decode(StoredResult, result);
                            const body = yield* encode(validated);
                            yield* audit(request.key, validated.receipt);
                            yield* sql`UPDATE action_commit SET result = ${body} WHERE key = ${request.key}`;
                            return { ...validated, replayed: false };
                        })
                    ),
                create: (value) =>
                    transaction(
                        Effect.gen(function* () {
                            const input = yield* decode(StoredRecord, value);
                            const body = yield* encode(input.payload);
                            const rows =
                                yield* sql`INSERT INTO operational_record (id, state, version, payload, lease_until) VALUES (${input.id}, ${input.state}, ${input.version}, ${body}, ${input.leaseUntil === null ? null : time(input.leaseUntil)}) ON CONFLICT (id) DO NOTHING RETURNING id`;
                            if (rows.length !== 1) return yield* new Conflict({ id: input.id, reason: 'duplicate' });
                        })
                    ),
                compareAndSet: (input, next, payload, machine, leaseUntil) =>
                    transaction(
                        Effect.gen(function* () {
                            const command = yield* decode(GuardedCommand, input);
                            // Take the record lock before reading the clock: expiry is decided after a lock wait.
                            const [current] =
                                yield* sql<Row>`SELECT * FROM operational_record WHERE id = ${command.id} ${dialect === 'postgres' ? sql.literal('FOR UPDATE') : sql.literal('')}`;
                            const now = yield* Clock.currentTimeMillis;
                            if (
                                command.deadline <= now ||
                                (current?.lease_until !== null &&
                                    current?.lease_until !== undefined &&
                                    Number(
                                        current.lease_until instanceof Date
                                            ? current.lease_until.getTime()
                                            : current.lease_until
                                    ) <= now)
                            )
                                return yield* new Conflict({ id: command.id, reason: 'expired' });
                            if (
                                !current ||
                                Number(current.version) !== command.expectedVersion ||
                                current.state !== command.expectedState
                            )
                                return yield* new Conflict({ id: command.id, reason: 'stale' });
                            if (!machine[current.state]?.includes(next))
                                return yield* new Conflict({ id: command.id, reason: 'illegal-transition' });
                            if (leaseUntil !== undefined) {
                                yield* decode(EpochMillis, leaseUntil);
                                if (leaseUntil <= now)
                                    return yield* new Conflict({ id: command.id, reason: 'expired' });
                            }
                            const body = yield* encode(payload);
                            const rows =
                                yield* sql<Row>`UPDATE operational_record SET state = ${next}, version = version + 1, payload = ${body}, lease_until = ${leaseUntil === undefined ? null : time(leaseUntil)} WHERE id = ${command.id} AND version = ${command.expectedVersion} AND state = ${command.expectedState} RETURNING *`;
                            const updated = rows[0];
                            if (!updated) return yield* new Conflict({ id: command.id, reason: 'stale' });
                            yield* sql`INSERT INTO transition_history (command_id, record_id, previous_state, next_state, version, occurred_at) VALUES (${command.clientMutationId}, ${command.id}, ${command.expectedState}, ${next}, ${command.expectedVersion + 1}, ${time(now)})`;
                            return yield* record(updated);
                        })
                    ),
                stock: (id, capacity) =>
                    transaction(
                        Effect.gen(function* () {
                            yield* decode(UuidV7, id);
                            yield* decode(Quantity, capacity);
                            const now = yield* Clock.currentTimeMillis;
                            yield* sql`INSERT INTO stock (id, available) VALUES (${id}, ${capacity})`;
                            yield* sql`INSERT INTO quantity_ledger (id, resource, delta, occurred_at) VALUES (${id + ':initial'}, ${id}, ${capacity}, ${time(now)})`;
                        })
                    ),
                available: (id) =>
                    Effect.gen(function* () {
                        const [entry] = yield* sql<{
                            available: string | number;
                        }>`SELECT available FROM stock WHERE id = ${id}`;
                        if (!entry) return yield* new StorageFailure({ operation: 'missing-stock' });
                        return Number(entry.available);
                    }).pipe(Effect.catchTag('SqlError', (cause) => Effect.fail(failure(cause)))),
                reserve: (id, resource, quantity, expiresAt) =>
                    transaction(
                        Effect.gen(function* () {
                            yield* decode(UuidV7, id);
                            yield* decode(UuidV7, resource);
                            yield* decode(Quantity, quantity);
                            yield* decode(EpochMillis, expiresAt);
                            yield* expire;
                            // Serialize stock decisions first, then validate deadline after lock acquisition.
                            yield* sql`UPDATE stock SET available = available WHERE id = ${resource}`;
                            const now = yield* Clock.currentTimeMillis;
                            if (expiresAt <= now) return yield* new Conflict({ id, reason: 'expired' });
                            const rows =
                                yield* sql`UPDATE stock SET available = available - ${quantity} WHERE id = ${resource} AND available >= ${quantity} RETURNING id`;
                            if (rows.length !== 1) return yield* new Conflict({ id, reason: 'unavailable' });
                            const inserted =
                                yield* sql`INSERT INTO reservation (id, resource, quantity, state, expires_at) VALUES (${id}, ${resource}, ${quantity}, 'pending', ${time(expiresAt)}) ON CONFLICT (id) DO NOTHING RETURNING id`;
                            if (inserted.length !== 1) return yield* new Conflict({ id, reason: 'duplicate' });
                            yield* sql`INSERT INTO quantity_ledger (id, resource, delta, occurred_at) VALUES (${id + ':reserve'}, ${resource}, ${-quantity}, ${time(now)})`;
                        })
                    ),
                settle: (id, outcome) =>
                    transaction(
                        Effect.gen(function* () {
                            const [entry] = yield* sql<{
                                resource: string;
                                quantity: number | string;
                                state: string;
                                expires_at: Date | number;
                            }>`SELECT * FROM reservation WHERE id = ${id} ${dialect === 'postgres' ? sql.literal('FOR UPDATE') : sql.literal('')}`;
                            const now = yield* Clock.currentTimeMillis;
                            if (!entry || entry.state !== 'pending')
                                return yield* new Conflict({ id, reason: 'stale' });
                            if (
                                Number(
                                    entry.expires_at instanceof Date ? entry.expires_at.getTime() : entry.expires_at
                                ) <= now
                            )
                                return yield* new Conflict({ id, reason: 'expired' });
                            yield* sql`UPDATE reservation SET state = ${outcome} WHERE id = ${id}`;
                            if (outcome === 'released') {
                                yield* sql`UPDATE stock SET available = available + ${Number(entry.quantity)} WHERE id = ${entry.resource}`;
                                yield* sql`INSERT INTO quantity_ledger (id, resource, delta, occurred_at) VALUES (${id + ':release'}, ${entry.resource}, ${Number(entry.quantity)}, ${time(now)})`;
                            }
                        })
                    ),
                reconcile: (event, payment, currency, minorUnits) =>
                    transaction(
                        Effect.gen(function* () {
                            yield* decode(MinorUnits, minorUnits);
                            yield* decode(Schema.String.pipe(Schema.pattern(/^[A-Z]{3}$/)), currency);
                            const inserted =
                                yield* sql`INSERT INTO payment_ledger (event, payment, currency, minor_units) VALUES (${event}, ${payment}, ${currency}, ${minorUnits}) ON CONFLICT (event) DO NOTHING RETURNING event`;
                            const [entry] = yield* sql<{
                                payment: string;
                                currency: string;
                                minor_units: string;
                            }>`SELECT payment, currency, minor_units FROM payment_ledger WHERE event = ${event}`;
                            if (
                                entry?.payment !== payment ||
                                entry.currency !== currency ||
                                entry.minor_units !== minorUnits
                            )
                                return yield* new Conflict({ id: event, reason: 'input-changed' });
                            return inserted.length ? ('applied' as const) : ('replayed' as const);
                        })
                    ),
                enqueue: (id, command) =>
                    Effect.gen(function* () {
                        const body = yield* encode(command);
                        yield* sql`INSERT INTO command_outbox (id, command) VALUES (${id}, ${body})`;
                    }).pipe(Effect.catchTag('SqlError', (cause) => Effect.fail(failure(cause)))),
            });
        })
    );
