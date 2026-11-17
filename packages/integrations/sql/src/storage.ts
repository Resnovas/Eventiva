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
/** Driver row before schema validation; PostgreSQL and SQLite differ in integer and timestamp representations. */
interface Row {
    id: string;
    state: string;
    version: string | number;
    payload: string;
    lease_until: Date | number | null;
}
/** Validate boundary data with a caller-selected schema and discard rejected values/diagnostics on failure. */
const decode = <A, I>(schema: Schema.Schema<A, I>, value: NoInfer<I>) =>
    Schema.decode(schema)(value).pipe(
        Effect.mapError(
            /** Sanitize schema failures before they cross the storage port. */ () =>
                new StorageFailure({ operation: 'codec', reason: 'invalid-data' })
        )
    );
/** Serialize only schema-valid JSON values for parameterized SQL persistence. */
const encode = (value: JsonValue) =>
    Schema.encode(Json)(value).pipe(
        Effect.mapError(
            /** Hide serialization diagnostics and rejected payload content. */ () =>
                new StorageFailure({ operation: 'encode', reason: 'invalid-data' })
        )
    );

/** SQL methods close over one client; Effect SQL propagates its connection through the current fiber transaction. */
export const storage = (dialect: Dialect) =>
    Layer.effect(
        Storage,
        Effect.gen(
            /** Bind operational storage to the supplied client and dialect; tenant admission belongs to composition/router. */ function* () {
                // These tables have no tenant predicate: the injected client must already select the tenant database.
                const sql = yield* SqlClient.SqlClient;
                /** Match PostgreSQL timestamp parameters or SQLite integer milliseconds without changing the instant. */
                const time = (millis: number) => (dialect === 'postgres' ? new Date(millis).toISOString() : millis);
                /** Hide driver SQL and connection details behind a bounded database failure. */
                const failure = () => new StorageFailure({ operation: 'sql', reason: 'database' });
                /** Use the client's fiber-local transaction/savepoint and translate only SQL failures, retaining domain errors. */
                const transaction = <A, E, R>(
                    effect: Effect.Effect<A, E | SqlError, R>
                ): Effect.Effect<A, E | StorageFailure, R> =>
                    sql
                        .withTransaction(effect)
                        .pipe(
                            Effect.mapError(
                                /** Preserve typed business failures while sanitizing driver errors. */ (cause) =>
                                    (cause instanceof SqlError ? failure() : cause)
                            )
                        );
                /** Decode stored JSON and normalize driver primitives before validating the public record shape. */
                const record = (row: Row) =>
                    Effect.gen(
                        /** Reject corrupted retained records instead of returning unchecked driver data. */ function* () {
                            // The JSON codec and record codec enforce separate boundaries: valid JSON need not be a valid stored record.
                            const payload = yield* decode(Json, row.payload);
                            return yield* decode(StoredRecord, {
                                id: row.id,
                                state: row.state,
                                version: Number(row.version),
                                payload,
                                leaseUntil:
                                    row.lease_until instanceof Date ? row.lease_until.getTime() : row.lease_until,
                            });
                        }
                    );
                /** Return a validated tenant-local record or absence; database failures are sanitized. */
                const get = (id: string) =>
                    Effect.gen(
                        /** Look up a single identifier on the already-routed connection, decoding only an existing row. */ function* () {
                            const rows = yield* sql<Row>`SELECT * FROM operational_record WHERE id = ${id}`;
                            return rows[0] ? yield* record(rows[0]) : undefined;
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /** Discard query diagnostics at the storage boundary. */ () => Effect.fail(failure())
                        )
                    );
                /** Retain one encoded receipt per identifier; byte-different replay fails rather than overwriting history. */
                const audit: Storage['Type']['audit'] = (id, receipt) =>
                    Effect.gen(
                        /** Compare the retained receipt after insert-or-ignore so identifier reuse cannot replace evidence. */ function* () {
                            // Compare encoded text, not structural JSON equality: the original receipt remains authoritative.
                            const body = yield* encode(receipt);
                            yield* sql`INSERT INTO action_receipt (id, receipt) VALUES (${id}, ${body}) ON CONFLICT (id) DO NOTHING`;
                            const [stored] = yield* sql<{
                                receipt: string;
                            }>`SELECT receipt FROM action_receipt WHERE id = ${id}`;
                            if (stored?.receipt !== body)
                                return yield* new StorageFailure({ operation: 'receipt-id-reused' });
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /** Keep receipt persistence failures free of raw SQL details. */ () =>
                                Effect.fail(failure())
                        )
                    );
                const expire = transaction(
                    Effect.gen(
                        /** Reclaim only newly expired pending reservations and append compensating quantity entries atomically. */ function* () {
                            // UPDATE RETURNING identifies the winning state changes, preventing repeated stock restoration.
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
                        }
                    )
                ).pipe(
                    Effect.catchTag(
                        'SqlError',
                        /** Sanitize any SQL failure escaping expiry reclamation. */ () => Effect.fail(failure())
                    )
                );
                return Storage.of({
                    capabilities: { transactions: true, compareAndSet: true, appendOnlyLedger: true, device: false },
                    ready: sql`SELECT id FROM action_receipt LIMIT 0`.pipe(Effect.asVoid, Effect.mapError(failure)),
                    transaction,
                    get,
                    audit,
                    expire,
                    /** Serialize one scoped key, reject changed input and replay the retained result without rerunning execute. */
                    commit: (request, execute) =>
                        transaction(
                            Effect.gen(
                                /** Persist mutation result and receipt in the same transaction as the supplied execution effect. */ function* () {
                                    // Lock the idempotency row before executing so concurrent requests cannot both mutate.
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
                                }
                            )
                        ),
                    /** Validate and insert a new record without overwriting an existing identifier. */
                    create: (value) =>
                        transaction(
                            Effect.gen(
                                /** Encode the validated payload and report duplicate identity as a domain conflict. */ function* () {
                                    // Conflict-ignore plus RETURNING distinguishes a new insert without replacing existing state.
                                    const input = yield* decode(StoredRecord, value);
                                    const body = yield* encode(input.payload);
                                    const rows =
                                        yield* sql`INSERT INTO operational_record (id, state, version, payload, lease_until) VALUES (${input.id}, ${input.state}, ${input.version}, ${body}, ${input.leaseUntil === null ? null : time(input.leaseUntil)}) ON CONFLICT (id) DO NOTHING RETURNING id`;
                                    if (rows.length !== 1)
                                        return yield* new Conflict({ id: input.id, reason: 'duplicate' });
                                }
                            )
                        ),
                    /** Apply an allowed version/state transition after deadline and lease checks, recording history atomically. */
                    compareAndSet: (input, next, payload, machine, leaseUntil) =>
                        transaction(
                            Effect.gen(
                                /** Serialize the current record, validate its transition and return the decoded updated version. */ function* () {
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
                                }
                            )
                        ),
                    /** Initialize positive integer stock with its opening ledger delta; duplicate inserts are database failures. */
                    stock: (id, capacity) =>
                        transaction(
                            Effect.gen(
                                /** Validate stock identity/quantity before atomically establishing balance and opening evidence. */ function* () {
                                    // The opening balance and its ledger entry must roll back together on either insert failure.
                                    yield* decode(UuidV7, id);
                                    yield* decode(Quantity, capacity);
                                    const now = yield* Clock.currentTimeMillis;
                                    yield* sql`INSERT INTO stock (id, available) VALUES (${id}, ${capacity})`;
                                    yield* sql`INSERT INTO quantity_ledger (id, resource, delta, occurred_at) VALUES (${id + ':initial'}, ${id}, ${capacity}, ${time(now)})`;
                                }
                            )
                        ),
                    /** Observe recorded available stock without implicitly reclaiming expired reservations; missing stock fails. */
                    available: (id) =>
                        Effect.gen(
                            /** Normalize the driver's stock integer or report that no stock row exists. */ function* () {
                                // Expiry is explicit: observing a balance must not release holds or append ledger entries.
                                const [entry] = yield* sql<{
                                    available: string | number;
                                }>`SELECT available FROM stock WHERE id = ${id}`;
                                if (!entry) return yield* new StorageFailure({ operation: 'missing-stock' });
                                return Number(entry.available);
                            }
                        ).pipe(
                            Effect.catchTag(
                                'SqlError',
                                /** Hide stock-query diagnostics from callers. */ () => Effect.fail(failure())
                            )
                        ),
                    /** Reclaim expiry, then atomically debit sufficient stock and retain a unique pending reservation and ledger delta. */
                    reserve: (id, resource, quantity, expiresAt) =>
                        transaction(
                            Effect.gen(
                                /** Validate reservation fields and reject unavailable, duplicate or already-expired holds without partial debit. */ function* () {
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
                                }
                            )
                        ),
                    /** Confirm or release a pending unexpired reservation; only release restores stock and appends a delta. */
                    settle: (id, outcome) =>
                        transaction(
                            Effect.gen(
                                /** Serialize reservation settlement and reject stale or expired entries before updating its outcome. */ function* () {
                                    // Decide expiry after acquiring the reservation lock; a lock wait cannot extend the hold.
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
                                            entry.expires_at instanceof Date
                                                ? entry.expires_at.getTime()
                                                : entry.expires_at
                                        ) <= now
                                    )
                                        return yield* new Conflict({ id, reason: 'expired' });
                                    yield* sql`UPDATE reservation SET state = ${outcome} WHERE id = ${id}`;
                                    if (outcome === 'released') {
                                        yield* sql`UPDATE stock SET available = available + ${Number(entry.quantity)} WHERE id = ${entry.resource}`;
                                        yield* sql`INSERT INTO quantity_ledger (id, resource, delta, occurred_at) VALUES (${id + ':release'}, ${entry.resource}, ${Number(entry.quantity)}, ${time(now)})`;
                                    }
                                }
                            )
                        ),
                    /** Retain exact integer payment units once per event; changed payment/currency/amount conflicts on replay. */
                    reconcile: (event, payment, currency, minorUnits) =>
                        transaction(
                            Effect.gen(
                                /** Validate amount spelling and currency before comparing insert-or-ignore data with the retained event. */ function* () {
                                    // Amounts remain strings so deduplication never rounds integer payment units through Number.
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
                                }
                            )
                        ),
                    /** Persist an encoded command intent only; delivery/external execution is not performed here. */
                    enqueue: (id, command) =>
                        Effect.gen(
                            /** Encode JSON before inserting an outbox row on the current transaction connection. */ function* () {
                                const body = yield* encode(command);
                                yield* sql`INSERT INTO command_outbox (id, command) VALUES (${id}, ${body})`;
                            }
                        ).pipe(
                            Effect.catchTag(
                                'SqlError',
                                /** Suppress SQL diagnostics from command persistence errors. */ () =>
                                    Effect.fail(failure())
                            )
                        ),
                });
            }
        )
    );
