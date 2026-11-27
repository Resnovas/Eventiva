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
import { RunSnapshot } from '@eventiva/contracts/module-manifest';
import {
    Conflict,
    EpochMillis,
    GuardedCommand,
    Json,
    JsonValue,
    MinorUnits,
    Quantity,
    RunFence,
    Storage,
    StorageFailure,
    type StoredRun,
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
/**
 * Validate boundary data with a caller-selected schema and discard rejected values/diagnostics on failure.
 *
 * @template A - Decoded output type.
 * @template I - Encoded input type.
 * @param schema - Effect schema used to decode the value.
 * @param value - Unchecked input value to decode.
 * @returns An Effect producing the decoded value.
 * @fails StorageFailure when schema validation rejects the input.
 */
const decode = <A, I>(schema: Schema.Schema<A, I>, value: NoInfer<I>) =>
    Schema.decode(schema)(value).pipe(
        Effect.mapError(
            /**
             * Sanitize schema failures before they cross the storage port.
             *
             * @returns A bounded codec storage failure.
             */
            () => new StorageFailure({ operation: 'codec', reason: 'invalid-data' })
        )
    );
/**
 * Serialize only schema-valid JSON values for parameterized SQL persistence.
 *
 * @param value - JSON value to serialize.
 * @returns An Effect producing the encoded JSON string.
 * @fails StorageFailure when JSON encoding fails.
 */
const encode = (value: JsonValue) =>
    Schema.encode(Json)(value).pipe(
        Effect.mapError(
            /**
             * Hide serialization diagnostics and rejected payload content.
             *
             * @returns A bounded encode storage failure.
             */
            () => new StorageFailure({ operation: 'encode', reason: 'invalid-data' })
        )
    );

/**
 * Require the exact retained schema, not merely a migration name or a newer compatible-looking default.
 *
 * @param snapshot - Recorded run snapshot containing the expected migration history.
 * @returns An Effect succeeding when the database migration history matches the snapshot exactly.
 * @fails StorageFailure when the applied migration history differs from the snapshot.
 */
const checkRunSchema = (snapshot: RunSnapshot) =>
    Effect.gen(
        /** Compare the full applied history while the caller holds the run transaction lock. */ function* () {
            // Additional migrations are not assumed compatible: recovery has permission to execute only the recorded schema.
            const sql = yield* SqlClient.SqlClient;
            const rows = yield* sql<{
                name: string;
                checksum: string;
            }>`SELECT name, checksum FROM storage_migration ORDER BY name`;
            if (
                rows.length !== snapshot.schema.length ||
                rows.some(
                    /**
                     * Every byte checksum belongs to the recorded history; no omitted or additional migration is inferred safe.
                     *
                     * @param row - Applied migration row from the database.
                     * @param index - Zero-based position in the ordered migration list.
                     * @returns True when the applied migration differs from the snapshot entry.
                     */
                    (row, index) =>
                        row.name !== snapshot.schema[index]?.name || row.checksum !== snapshot.schema[index]?.checksum
                )
            )
                return yield* new StorageFailure({ operation: 'run-recovery-required' });
        }
    );

/**
 * Integration-private fence primitive: call INSIDE the accepting SQL transaction, including independent output transactions.
 *
 * @since 0.0.1
 * @param sql - Active SQL client bound to the enclosing transaction.
 * @param input - Run fence credentials asserting tenant, run, owner, and epoch.
 * @returns An Effect succeeding once ownership and recorded schema are verified.
 * @fails Conflict when the fence owner or epoch is stale.
 * @fails StorageFailure when the snapshot is missing or its schema differs.
 * @example
 * ```ts
 * import { Effect } from 'effect';
 * import { SqlClient } from '@effect/sql';
 * import { checkRunFence } from '@eventiva/sql';
 *
 * const guarded = (fence: Parameters<typeof checkRunFence>[1]) =>
 *     Effect.gen(function* () {
 *         const sql = yield* SqlClient.SqlClient;
 *         yield* checkRunFence(sql, fence);
 *     });
 * ```
 */
export const checkRunFence = (sql: SqlClient.SqlClient, input: RunFence) =>
    Effect.gen(
        /** A conditional no-op UPDATE locks the authoritative row on both engines until commit or rollback. */ function* () {
            // Takeover uses this same row, establishing a total commit order without depending on Cluster lease timing.
            const fence = yield* decode(RunFence, input);
            const locked =
                yield* sql`UPDATE module_run_owner SET epoch = epoch WHERE tenant_id = ${fence.tenant} AND run_id = ${fence.runId} AND owner = ${fence.owner} AND epoch = ${fence.epoch} RETURNING run_id`;
            if (locked.length !== 1) return yield* new Conflict({ id: fence.runId, reason: 'stale' });
            const [row] = yield* sql<{
                snapshot: string;
            }>`SELECT snapshot FROM module_run_snapshot WHERE tenant_id = ${fence.tenant} AND run_id = ${fence.runId}`;
            if (!row) return yield* new StorageFailure({ operation: 'run-recovery-required' });
            yield* checkRunSchema(yield* decode(Schema.parseJson(RunSnapshot), row.snapshot)).pipe(
                Effect.provideService(SqlClient.SqlClient, sql)
            );
        }
    );

/**
 * SQL methods close over one client; Effect SQL propagates its connection through the current fiber transaction.
 *
 * @since 0.0.1
 * @param dialect - Target SQL dialect controlling timestamp formatting and row locking clauses.
 * @returns A Layer providing the Storage service backed by SqlClient.
 * @example
 * ```ts
 * import { storage } from '@eventiva/sql';
 *
 * const sqliteStorage = storage('sqlite');
 * ```
 */
export const storage = (dialect: Dialect) =>
    Layer.effect(
        Storage,
        Effect.gen(
            /** Bind operational storage to the supplied client and dialect; tenant admission belongs to composition/router. */ function* () {
                // These tables have no tenant predicate: the injected client must already select the tenant database.
                const sql = yield* SqlClient.SqlClient;
                /**
                 * Match PostgreSQL timestamp parameters or SQLite integer milliseconds without changing the instant.
                 *
                 * @param millis - Unix timestamp in milliseconds.
                 * @returns An ISO timestamp string for PostgreSQL or raw milliseconds for SQLite.
                 */
                const time = (millis: number) => (dialect === 'postgres' ? new Date(millis).toISOString() : millis);
                /**
                 * Hide driver SQL and connection details behind a bounded database failure.
                 *
                 * @returns A sanitized SQL storage failure.
                 */
                const failure = () => new StorageFailure({ operation: 'sql', reason: 'database' });
                /**
                 * Use the client's fiber-local transaction/savepoint and translate only SQL failures, retaining domain errors.
                 *
                 * @template A - Effect success type.
                 * @template E - Effect domain error type.
                 * @template R - Effect environment requirements.
                 * @param effect - Effect executed inside the SQL transaction.
                 * @returns The transactional Effect with SqlError translated to StorageFailure.
                 */
                const transaction = <A, E, R>(
                    effect: Effect.Effect<A, E | SqlError, R>
                ): Effect.Effect<A, E | StorageFailure, R> =>
                    sql.withTransaction(effect).pipe(
                        Effect.mapError(
                            /**
                             * Preserve typed business failures while sanitizing driver errors.
                             *
                             * @param cause - Error emitted by the transactional effect.
                             * @returns Either the original domain error or a sanitized StorageFailure.
                             */
                            (cause) => (cause instanceof SqlError ? failure() : cause)
                        )
                    );
                /**
                 * Decode stored JSON and normalize driver primitives before validating the public record shape.
                 *
                 * @param row - Raw database row from operational_record.
                 * @returns An Effect yielding the validated stored record.
                 * @fails StorageFailure when payload JSON or record fields fail validation.
                 */
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
                /**
                 * Return a validated tenant-local record or absence; database failures are sanitized.
                 *
                 * @param id - Operational record identifier.
                 * @returns An Effect yielding the stored record or undefined when absent.
                 * @fails StorageFailure when query execution or decoding fails.
                 */
                const get = (id: string) =>
                    Effect.gen(
                        /** Look up a single identifier on the already-routed connection, decoding only an existing row. */ function* () {
                            const rows = yield* sql<Row>`SELECT * FROM operational_record WHERE id = ${id}`;
                            return rows[0] ? yield* record(rows[0]) : undefined;
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /**
                             * Discard query diagnostics at the storage boundary.
                             *
                             * @returns A failed Effect carrying a sanitized StorageFailure.
                             */
                            () => Effect.fail(failure())
                        )
                    );
                /**
                 * Retain one encoded receipt per identifier; byte-different replay fails rather than overwriting history.
                 *
                 * @param id - Unique receipt identifier.
                 * @param receipt - JSON receipt payload to persist.
                 * @returns An Effect completing once the exact receipt bytes are retained.
                 * @fails StorageFailure when an existing receipt differs or persistence fails.
                 */
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
                            /**
                             * Keep receipt persistence failures free of raw SQL details.
                             *
                             * @returns A failed Effect carrying a sanitized StorageFailure.
                             */
                            () => Effect.fail(failure())
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
                        /**
                         * Sanitize any SQL failure escaping expiry reclamation.
                         *
                         * @returns A failed Effect carrying a sanitized StorageFailure.
                         */
                        () => Effect.fail(failure())
                    )
                );
                /**
                 * Decode retained acceptance and ownership without resolving any executable default.
                 *
                 * @param tenant - Tenant identifier owning the run.
                 * @param id - Run identifier.
                 * @returns An Effect yielding the stored run record or undefined when absent.
                 * @fails StorageFailure when query execution or decoding fails.
                 */
                const getRun: Storage['Type']['getRun'] = (tenant, id) =>
                    Effect.gen(
                        /** Tenant and run together identify a record even when a trusted fixture shares a physical database. */ function* () {
                            // Ownership is mutable, but the joined acceptance never resolves any process-local default.
                            const [row] = yield* sql<{
                                input: string;
                                snapshot: string;
                                owner: string | null;
                                epoch: string | number;
                            }>`SELECT s.input, s.snapshot, o.owner, o.epoch FROM module_run_snapshot s JOIN module_run_owner o ON s.tenant_id = o.tenant_id AND s.run_id = o.run_id WHERE s.tenant_id = ${tenant} AND s.run_id = ${id}`;
                            if (!row) return undefined;
                            return {
                                input: yield* decode(Json, row.input),
                                snapshot: yield* decode(Schema.parseJson(RunSnapshot), row.snapshot),
                                owner: row.owner,
                                epoch: yield* decode(Version, Number(row.epoch)),
                            } satisfies StoredRun;
                        }
                    ).pipe(Effect.catchTag('SqlError', failure));
                return Storage.of({
                    capabilities: { transactions: true, compareAndSet: true, appendOnlyLedger: true, device: false },
                    ready: sql`SELECT id FROM action_receipt LIMIT 0`.pipe(Effect.asVoid, Effect.mapError(failure)),
                    transaction,
                    getRun,
                    /**
                     * Compare accepted bytes after insert-ignore; immutable snapshots can never be repinned by a retry.
                     *
                     * @param tenant - Tenant identifier owning the run.
                     * @param id - Run identifier.
                     * @param input - Accepted JSON input payload for the run.
                     * @param snapshot - Pinned module run snapshot.
                     * @returns An Effect yielding the accepted stored run.
                     * @fails Conflict when an existing run was accepted with different input or snapshot bytes.
                     * @fails StorageFailure when validation or persistence fails.
                     */
                    acceptRun: (tenant, id, input, snapshot) =>
                        transaction(
                            Effect.gen(
                                /** Create the snapshot and its initial owner row atomically, preserving existing acceptance on conflict. */ function* () {
                                    // Insert-ignore may win or lose a race; compare the retained bytes before acknowledging either case.
                                    yield* decode(UuidV7, id);
                                    const pinned = yield* decode(RunSnapshot, snapshot);
                                    yield* checkRunSchema(pinned).pipe(Effect.provideService(SqlClient.SqlClient, sql));
                                    const body = yield* encode(input);
                                    const encoded = yield* Schema.encode(Schema.parseJson(RunSnapshot))(pinned).pipe(
                                        Effect.mapError(failure)
                                    );
                                    yield* sql`INSERT INTO module_run_snapshot (tenant_id, run_id, input, snapshot) VALUES (${tenant}, ${id}, ${body}, ${encoded}) ON CONFLICT (tenant_id, run_id) DO NOTHING`;
                                    yield* sql`INSERT INTO module_run_owner (tenant_id, run_id, owner, epoch) VALUES (${tenant}, ${id}, NULL, 0) ON CONFLICT (tenant_id, run_id) DO NOTHING`;
                                    const [stored] = yield* sql<{
                                        input: string;
                                        snapshot: string;
                                    }>`SELECT input, snapshot FROM module_run_snapshot WHERE tenant_id = ${tenant} AND run_id = ${id}`;
                                    if (stored?.input !== body || stored.snapshot !== encoded)
                                        return yield* new Conflict({ id, reason: 'input-changed' });
                                    const accepted = yield* getRun(tenant, id);
                                    if (!accepted) return yield* failure();
                                    return accepted;
                                }
                            )
                        ),
                    /**
                     * Explicit expected-epoch transfer cannot overwrite a concurrent acquisition or wrap the monotonic counter.
                     *
                     * @param tenant - Tenant identifier owning the run.
                     * @param id - Run identifier.
                     * @param expectedEpoch - Ownership epoch required for the transfer.
                     * @param owner - New run owner identifier.
                     * @returns An Effect yielding the newly acquired run fence.
                     * @fails Conflict when the stored epoch does not match expectedEpoch.
                     * @fails StorageFailure when schema verification or persistence fails.
                     */
                    claimRun: (tenant, id, expectedEpoch, owner) =>
                        transaction(
                            Effect.gen(
                                /** Compare-and-increment takes the same row lock as every fenced acceptance. */ function* () {
                                    // Validate the recorded schema before this transaction commits; a failed check rolls the increment back.
                                    yield* decode(Version, expectedEpoch);
                                    yield* decode(Schema.NonEmptyString, owner);
                                    const rows =
                                        yield* sql`UPDATE module_run_owner SET owner = ${owner}, epoch = epoch + 1 WHERE tenant_id = ${tenant} AND run_id = ${id} AND epoch = ${expectedEpoch} AND epoch < 9007199254740991 RETURNING epoch`;
                                    if (rows.length !== 1) return yield* new Conflict({ id, reason: 'stale' });
                                    const fence = { tenant, runId: id, owner, epoch: expectedEpoch + 1 };
                                    yield* checkRunFence(sql, fence);
                                    return fence;
                                }
                            )
                        ),
                    /**
                     * Retain the checked fence lock for the entire effect and its transaction commit.
                     *
                     * @param fence - Run fence asserted for the transaction.
                     * @param effect - Effect executed while holding the fence lock.
                     * @returns The transactional fenced Effect.
                     */
                    fence: (fence, effect) => transaction(checkRunFence(sql, fence).pipe(Effect.zipRight(effect))),
                    get,
                    audit,
                    expire,
                    /**
                     * Serialize one scoped key, reject changed input and replay the retained result without rerunning execute.
                     *
                     * @param request - Idempotency key, input hash, and optional run fence.
                     * @param execute - Effect computing the action output and receipt on first execution.
                     * @returns An Effect yielding the validated result with a replay indicator.
                     * @fails Conflict when the key was already committed with a different input hash or stale fence.
                     * @fails StorageFailure when validation or persistence fails.
                     */
                    commit: (request, execute) =>
                        transaction(
                            Effect.gen(
                                /** Persist mutation result and receipt in the same transaction as the supplied execution effect. */ function* () {
                                    // Lock ownership BEFORE dedup lookup: stale owners cannot replay a previously successful result either.
                                    if (request.fence !== undefined) yield* checkRunFence(sql, request.fence);
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
                    /**
                     * Validate and insert a new record without overwriting an existing identifier.
                     *
                     * @param value - Record fields to validate and insert.
                     * @returns An Effect completing once the record is persisted.
                     * @fails Conflict when a record with the same identifier already exists.
                     * @fails StorageFailure when validation or persistence fails.
                     */
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
                    /**
                     * Apply an allowed version/state transition after deadline and lease checks, recording history atomically.
                     *
                     * @param input - Guarded command containing record identity, expected version/state, and deadline.
                     * @param next - Target state to transition into.
                     * @param payload - Replacement JSON payload for the updated record.
                     * @param machine - State machine transition map allowing state-to-next edges.
                     * @param leaseUntil - Optional Unix millisecond lease expiry for the updated record.
                     * @returns An Effect yielding the decoded updated stored record.
                     * @fails Conflict when the command or lease is expired, the record is stale, or the transition is disallowed.
                     * @fails StorageFailure when validation or persistence fails.
                     */
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
                                    // Validate the retained bytes before UPDATE can erase corruption; preserve expired/stale precedence.
                                    yield* record(current);
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
                    /**
                     * Initialize positive integer stock with its opening ledger delta; duplicate inserts are database failures.
                     *
                     * @param id - Stock resource UUIDv7 identifier.
                     * @param capacity - Opening positive integer quantity.
                     * @returns An Effect completing once stock balance and opening ledger delta are inserted.
                     * @fails StorageFailure when validation or persistence fails.
                     */
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
                    /**
                     * Observe recorded available stock without implicitly reclaiming expired reservations; missing stock fails.
                     *
                     * @param id - Stock resource identifier.
                     * @returns An Effect yielding the currently available stock quantity.
                     * @fails StorageFailure when the stock row does not exist or the query fails.
                     */
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
                                /**
                                 * Hide stock-query diagnostics from callers.
                                 *
                                 * @returns A failed Effect carrying a sanitized StorageFailure.
                                 */
                                () => Effect.fail(failure())
                            )
                        ),
                    /**
                     * Reclaim expiry, then atomically debit sufficient stock and retain a unique pending reservation and ledger delta.
                     *
                     * @param id - Reservation UUIDv7 identifier.
                     * @param resource - Stock resource UUIDv7 identifier to debit.
                     * @param quantity - Positive integer quantity to hold.
                     * @param expiresAt - Unix millisecond timestamp when the hold expires.
                     * @returns An Effect completing once stock is debited and the reservation is persisted.
                     * @fails Conflict when the deadline has passed, stock is insufficient, or the reservation id already exists.
                     * @fails StorageFailure when validation or persistence fails.
                     */
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
                    /**
                     * Confirm or release a pending unexpired reservation; only release restores stock and appends a delta.
                     *
                     * @param id - Reservation identifier to settle.
                     * @param outcome - Target settlement state (`confirmed` or `released`).
                     * @returns An Effect completing once the reservation state and optional stock restoration are committed.
                     * @fails Conflict when the reservation is missing, not pending, or already expired.
                     * @fails StorageFailure when persistence fails.
                     */
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
                    /**
                     * Retain exact integer payment units once per event; changed payment/currency/amount conflicts on replay.
                     *
                     * @param event - Unique payment ledger event identifier.
                     * @param payment - Payment identifier associated with the event.
                     * @param currency - Three-letter uppercase ISO currency code.
                     * @param minorUnits - Exact integer payment amount encoded as a decimal string.
                     * @returns An Effect yielding `'applied'` on first insert or `'replayed'` on identical replay.
                     * @fails Conflict when an existing event disagrees on payment, currency, or minor units.
                     * @fails StorageFailure when validation or persistence fails.
                     */
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
                    /**
                     * Persist an encoded command intent only; delivery/external execution is not performed here.
                     *
                     * @param id - Outbox command identifier.
                     * @param command - JSON command payload to persist.
                     * @returns An Effect completing once the outbox row is written.
                     * @fails StorageFailure when encoding or persistence fails.
                     */
                    enqueue: (id, command) =>
                        Effect.gen(
                            /** Encode JSON before inserting an outbox row on the current transaction connection. */ function* () {
                                const body = yield* encode(command);
                                yield* sql`INSERT INTO command_outbox (id, command) VALUES (${id}, ${body})`;
                            }
                        ).pipe(
                            Effect.catchTag(
                                'SqlError',
                                /**
                                 * Suppress SQL diagnostics from command persistence errors.
                                 *
                                 * @returns A failed Effect carrying a sanitized StorageFailure.
                                 */
                                () => Effect.fail(failure())
                            )
                        ),
                });
            }
        )
    );
