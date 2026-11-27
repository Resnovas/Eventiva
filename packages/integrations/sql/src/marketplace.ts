/**
 * @file packages/integrations/sql/src/marketplace.ts
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
import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import {
    ClaimExchange,
    type ExchangeClaim,
    MarketplaceAdministration,
    MarketplaceAuditEvent,
    MarketplaceAuditQuery,
    MarketplaceOperatorPolicy,
    MarketplaceOutbox,
    ProvisionExchange,
    RevokeParticipant,
    SettleExchange,
} from '@eventiva/contracts/marketplace-durable';
import {
    ExchangeIntent,
    ExchangeScope,
    MarketplaceAuthority,
    MarketplaceFailure,
    MarketplaceStore,
    type MarketplaceTransaction,
    ParticipantGrant,
    SnapshotReference,
} from '@eventiva/contracts/marketplace';
import { CurrentTenant, EpochMillis } from '@eventiva/contracts/storage';
import { type Cause, Context, Data, Effect, Either, Layer, Option, Schema } from 'effect';
import type { Dialect } from './migrations.ts';
import { uuidV7 } from './values.ts';

/**
 * Construct only the closed marketplace reason; never retain database or caller payloads in public failures.
 *
 * @param reason - The closed marketplace failure reason.
 * @returns A MarketplaceFailure carrying only that reason.
 */
const failure = (reason: MarketplaceFailure['reason']) => new MarketplaceFailure({ reason });
/**
 * Validate exact caller or persisted values and replace schema details with a closed invalid failure.
 *
 * @template A - The decoded value.
 * @template I - The encoded input accepted by the schema.
 * @param schema - The exact schema the value must satisfy, with no excess properties.
 * @param input - The caller or persisted value to decode.
 * @returns The decoded value.
 * @fails {MarketplaceFailure} With `invalid` when the value does not decode.
 */
const decode = <A, I>(schema: Schema.Schema<A, I>, input: NoInfer<I>) =>
    Schema.decode(schema)(input, { onExcessProperty: 'error' }).pipe(
        Effect.mapError(
            /**
             * Omit rejected input and decoder diagnostics from the failure.
             *
             * @returns A MarketplaceFailure with the `invalid` reason.
             */
            () => failure('invalid')
        )
    );
/**
 * Encode validated domain values as schema-controlled JSON for exact persisted comparisons.
 *
 * @template A - The domain value.
 * @template I - The schema's encoded form.
 * @param schema - The schema whose JSON encoding is produced.
 * @param input - The validated domain value to encode.
 * @returns The schema-controlled JSON text for the value.
 * @fails {MarketplaceFailure} With `invalid` when the value cannot be encoded.
 */
const encode = <A, I>(schema: Schema.Schema<A, I>, input: NoInfer<A>) =>
    Schema.encode(Schema.parseJson(schema))(input).pipe(
        Effect.mapError(
            /**
             * Hide encoder details instead of retaining the rejected marketplace value.
             *
             * @returns A MarketplaceFailure with the `invalid` reason.
             */
            () => failure('invalid')
        )
    );
/**
 * Sanitize SQL failures and defects at adapter-owned boundaries without replacing explicit marketplace reasons.
 *
 * @template A - The work's success value.
 * @template R - The work's required services.
 * @param effect - The adapter work whose SQL errors and defects are sanitized.
 * @returns The work's result.
 * @fails {MarketplaceFailure} With `unavailable` when SQL fails or the work dies; explicit marketplace reasons pass through.
 */
const safe = <A, R>(effect: Effect.Effect<A, MarketplaceFailure | SqlError, R>) =>
    effect.pipe(
        Effect.catchTag(
            'SqlError',
            /**
             * Never expose queries, bindings or driver errors to marketplace consumers.
             *
             * @returns A failure with the `unavailable` reason.
             */
            () => Effect.fail(failure('unavailable'))
        ),
        Effect.catchAllDefect(
            /**
             * Convert adapter defects without serializing arbitrary exception data.
             *
             * @returns A failure with the `unavailable` reason.
             */
            () => Effect.fail(failure('unavailable'))
        )
    );
/**
 * Require exact agreement on exchange, both tenants, resource and purpose; matching an exchange ID alone is insufficient.
 *
 * @param a - The first exchange scope.
 * @param b - The second exchange scope.
 * @returns Whether both scopes name the same exchange, tenants, resource and purpose.
 */
const sameScope = (a: ExchangeScope, b: ExchangeScope) =>
    a.exchange === b.exchange &&
    a.ownerTenant === b.ownerTenant &&
    a.recipientTenant === b.recipientTenant &&
    a.resource === b.resource &&
    a.purpose === b.purpose;

/** Private callback capability binds transaction methods to one invocation, not merely a reusable SQL connection. */
class Origin extends Context.Tag('@eventiva/integrations.sql/marketplace/Origin')<Origin, symbol>() {}

/**
 * Capture one trusted marketplace database, never a caller-selected tenant client.
 * Global guard serializes grant revocation, staging and local outbox transitions in this database only.
 *
 * @param dialect - The SQL engine of the marketplace database, which selects the database clock query.
 * @returns A layer providing the marketplace store, administration and local outbox on one client.
 * @since 0.0.1
 * @example
 * const program = Effect.provide(stageExchange, marketplace('postgres'));
 */
export const marketplace = (
    dialect: Dialect
): Layer.Layer<MarketplaceStore | MarketplaceAdministration | MarketplaceOutbox, never, SqlClient.SqlClient> =>
    Layer.unwrapEffect(
        Effect.gen(
            /** Capture the trusted marketplace client and compose administration, staging and local delivery capabilities. */ function* () {
                // Every local capability closes over this trusted database; requests cannot substitute a tenant-selected client.
                const sql = yield* SqlClient.SqlClient;
                const now = safe(
                    Effect.gen(
                        /** Read database epoch milliseconds so grant expiration and worker fences do not trust process time. */ function* () {
                            // Normalize driver numeric representations only after selecting the same millisecond unit on both dialects.
                            const [row] = yield* dialect === 'postgres'
                                ? sql<{
                                      now: string | number;
                                  }>`SELECT CAST(EXTRACT(EPOCH FROM clock_timestamp()) * 1000 AS bigint) AS now`
                                : sql<{
                                      now: string | number;
                                  }>`SELECT CAST((julianday('now') - 2440587.5) * 86400000 AS integer) AS now`;
                            return yield* decode(EpochMillis, Number(row?.now));
                        }
                    )
                );
                /**
                 * Run one guarded, nonambient transaction while preserving the callback's original typed failure or cause.
                 *
                 * @template A - The callback's success value.
                 * @template E - The callback's typed failure.
                 * @template R - The callback's required services.
                 * @param use - The callback to run while the singleton marketplace guard row is locked.
                 * @returns The callback's result once the transaction commits; the callback's own failure, interruption or defect is restored unchanged.
                 * @fails {MarketplaceFailure} With `unavailable` inside an ambient transaction, when the guard row is missing, or when SQL fails or the adapter dies.
                 */
                const atomic = <A, E, R>(use: Effect.Effect<A, E, R>): Effect.Effect<A, E | MarketplaceFailure, R> => {
                    /** Carry a callback cause across SQL cleanup without misclassifying it as an adapter failure. */
                    class CallbackFailure extends Data.TaggedError('MarketplaceCallbackFailure')<{
                        readonly original: Cause.Cause<E>;
                    }> {}
                    // Wrap callback failures so only adapter-owned errors are sanitized before the original cause is restored.
                    return Effect.gen(
                        /** Reject inherited connections and hold the singleton marketplace guard through the callback. */ function* () {
                            if (Option.isSome(yield* Effect.serviceOption(SqlClient.TransactionConnection)))
                                return yield* failure('unavailable');
                            // A new transaction is required; a savepoint in a foreign transaction would not own the commit boundary.
                            return yield* sql.withTransaction(
                                Effect.gen(
                                    /** Verify that the global guard exists before running any transaction callback work. */ function* () {
                                        const guard =
                                            yield* sql`UPDATE marketplace_guard SET version = version WHERE id = 1 RETURNING id`;
                                        if (guard.length !== 1) return yield* failure('unavailable');
                                        // Retain the full callback cause privately so rollback cannot convert domain failures into SQL errors.
                                        return yield* use.pipe(
                                            Effect.catchAllCause(
                                                /**
                                                 * Mark the callback's original cause for restoration after adapter error handling.
                                                 *
                                                 * @param original - The callback's full failure cause.
                                                 * @returns A private wrapped failure carrying that cause.
                                                 */
                                                (original) => Effect.fail(new CallbackFailure({ original }))
                                            )
                                        );
                                    }
                                )
                            );
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /**
                             * Hide failures owned by the SQL transaction machinery.
                             *
                             * @returns A failure with the `unavailable` reason.
                             */
                            () => Effect.fail(failure('unavailable'))
                        ),
                        Effect.catchAllDefect(
                            /**
                             * Sanitize adapter defects before restoring any explicitly wrapped callback cause.
                             *
                             * @returns A failure with the `unavailable` reason.
                             */
                            () => Effect.fail(failure('unavailable'))
                        ),
                        Effect.catchTag(
                            'MarketplaceCallbackFailure',
                            /**
                             * Restore the callback's exact failure channel, interruption or defect after rollback.
                             *
                             * @param error - The private wrapper around the callback's cause.
                             * @returns A failure with the callback's original cause.
                             */
                            (error) => Effect.failCause(error.original)
                        )
                    );
                };
                /**
                 * Load a closed-table JSON record and verify its embedded identifier against the queried key.
                 *
                 * @template A - The stored record type, identified by `id` or `command`.
                 * @template I - The encoded form the schema accepts.
                 * @param table - The closed marketplace table to read.
                 * @param schema - The schema the stored JSON body must satisfy.
                 * @param key - The row key, which must equal the body's own identifier.
                 * @returns The decoded record, or undefined when no row exists.
                 * @fails {MarketplaceFailure} With `invalid` for a malformed body or a key mismatch, or `unavailable` when SQL fails.
                 */
                const read = <A extends { readonly id: string } | { readonly command: string }, I>(
                    table: 'marketplace_snapshot' | 'marketplace_grant' | 'marketplace_intent',
                    schema: Schema.Schema<A, I>,
                    key: string
                ) =>
                    Effect.gen(
                        /** Distinguish missing marketplace records from schema-valid bodies stored under the wrong key. */ function* () {
                            const [row] = yield* sql<{
                                body: string;
                            }>`SELECT body FROM ${sql(table)} WHERE id = ${key}`;
                            if (row === undefined) return undefined;
                            const value = yield* decode(Schema.parseJson(schema), row.body);
                            // A valid JSON body is not sufficient evidence that it belongs to the requested database key.
                            if (('id' in value ? value.id : value.command) !== key) return yield* failure('invalid');
                            return value;
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /**
                             * Retain invalid-data failures but redact driver lookup diagnostics.
                             *
                             * @returns A failure with the `unavailable` reason.
                             */
                            () => Effect.fail(failure('unavailable'))
                        )
                    );
                /**
                 * Read validated grant metadata with its current revocation column instead of trusting the original JSON flag.
                 *
                 * @param key - The grant id.
                 * @returns The grant with its live `revoked` flag, or undefined when no grant exists.
                 * @fails {MarketplaceFailure} With `invalid` for a malformed body, or `unavailable` when SQL fails.
                 */
                const grant = (key: string) =>
                    safe(
                        Effect.gen(
                            /** Overlay live revocation state on the immutable grant body within the guarded caller transaction. */ function* () {
                                const value = yield* read('marketplace_grant', ParticipantGrant, key);
                                if (value === undefined) return undefined;
                                // Revocation changes a dedicated column; the original provisioned JSON is intentionally not rewritten.
                                const [row] = yield* sql<{
                                    revoked: number;
                                }>`SELECT revoked FROM marketplace_grant WHERE id = ${key}`;
                                return { ...value, revoked: Number(row?.revoked) === 1 };
                            }
                        )
                    );
                /**
                 * Append schema-checked audit metadata using the enclosing mutation's transaction and exact encoded scope.
                 *
                 * @param event - The audit event to append; its scope is encoded as the searchable key.
                 * @returns An effect that completes once the audit row is inserted.
                 * @fails {MarketplaceFailure} With `invalid` when the event cannot be encoded.
                 */
                const audit = (event: MarketplaceAuditEvent) =>
                    Effect.gen(
                        /** Encode both event and scope before inserting their searchable audit representation. */ function* () {
                            // The indexed scope must be derived from the same checked event, not a separate caller-supplied key.
                            const body = yield* encode(MarketplaceAuditEvent, event);
                            const scope = yield* encode(ExchangeScope, event.scope);
                            yield* sql`INSERT INTO marketplace_audit (id, scope_key, body) VALUES (${event.id}, ${scope}, ${body})`;
                        }
                    );
                /**
                 * Require a current participating-tenant caller and live operator policy; owner-only administration stays restricted.
                 *
                 * @param scope - The exchange scope the operation acts on.
                 * @param operation - The administrative or processing operation; provision and revoke are owner-only.
                 * @returns The decoded caller identity.
                 * @fails {MarketplaceFailure} With `denied` for a caller from another tenant, a non-participant tenant or a non-owner provisioning or revoking, `invalid` for a malformed caller, or the policy's own failure.
                 */
                const operator = (scope: ExchangeScope, operation: 'provision' | 'revoke' | 'audit' | 'process') =>
                    Effect.gen(
                        /** Bind the decoded caller to the authenticated tenant before consulting operator policy. */ function* () {
                            const caller = yield* decode(CallerIdentity, yield* Caller);
                            const tenant = yield* CurrentTenant;
                            // An allowing policy cannot override the caller/tenant binding or owner-only provisioning and revocation.
                            if (
                                caller.tenant !== tenant.id ||
                                (tenant.id !== scope.ownerTenant && tenant.id !== scope.recipientTenant) ||
                                ((operation === 'provision' || operation === 'revoke') &&
                                    tenant.id !== scope.ownerTenant)
                            )
                                return yield* failure('denied');
                            yield* (yield* MarketplaceOperatorPolicy).authorize(caller, operation, scope);
                            return caller;
                        }
                    );
                const administration = MarketplaceAdministration.of({
                    /**
                     * Idempotently provision matching snapshot/grant metadata under owner authority and a guarded audit write.
                     *
                     * @param input - The provisioning request with its snapshot, grant and request id.
                     * @returns An effect that completes once the snapshot, grant, request and audit rows are written, or at once for an exact repeat.
                     * @fails {MarketplaceFailure} With `denied` when the caller lacks owner authority, `invalid` for mismatched scopes, a revoked or expired grant or a foreign participant, `conflict` when the request id, snapshot or grant was already used differently, or `unavailable`.
                     */
                    provision: (input) =>
                        safe(
                            atomic(
                                Effect.gen(
                                    /** Validate current owner authority and grant admission before checking or recording the exact request. */ function* () {
                                        const request = yield* decode(ProvisionExchange, input);
                                        const { snapshot, grant: value } = request;
                                        const caller = yield* operator(snapshot.scope, 'provision');
                                        if (
                                            !sameScope(snapshot.scope, value.scope) ||
                                            value.revoked ||
                                            (value.participantTenant !== snapshot.scope.ownerTenant &&
                                                value.participantTenant !== snapshot.scope.recipientTenant) ||
                                            value.expiresAt <= (yield* now)
                                        )
                                            return yield* failure('invalid');
                                        // Repeated request IDs still require current authority; persisted request evidence grants no new access.
                                        const body = yield* encode(ProvisionExchange, request);
                                        const actor = yield* encode(CallerIdentity, caller);
                                        const [previous] = yield* sql<{
                                            body: string;
                                            actor: string;
                                        }>`SELECT body, actor FROM marketplace_request WHERE id = ${request.request}`;
                                        if (previous !== undefined) {
                                            if (previous.body !== body || previous.actor !== actor)
                                                return yield* failure('conflict');
                                            return;
                                        }
                                        const snapshotBody = yield* encode(SnapshotReference, snapshot);
                                        const existingSnapshot = yield* read(
                                            'marketplace_snapshot',
                                            SnapshotReference,
                                            snapshot.id
                                        );
                                        if (
                                            existingSnapshot !== undefined &&
                                            (yield* encode(SnapshotReference, existingSnapshot)) !== snapshotBody
                                        )
                                            return yield* failure('conflict');
                                        if ((yield* grant(value.id)) !== undefined) return yield* failure('conflict');
                                        yield* sql`INSERT INTO marketplace_snapshot (id, body) VALUES (${snapshot.id}, ${snapshotBody}) ON CONFLICT (id) DO NOTHING`;
                                        const grantBody = yield* encode(ParticipantGrant, value);
                                        yield* sql`INSERT INTO marketplace_grant (id, body, revoked) VALUES (${value.id}, ${grantBody}, 0)`;
                                        yield* sql`INSERT INTO marketplace_request (id, body, actor) VALUES (${request.request}, ${body}, ${actor})`;
                                        yield* audit({
                                            id: `request:${request.request}`,
                                            scope: snapshot.scope,
                                            actor: caller.subject,
                                            at: yield* now,
                                            operation: 'provision',
                                            reference: value.id,
                                        });
                                    }
                                )
                            )
                        ),
                    /**
                     * Revoke a matching grant under current owner authority and bind the idempotent request to its actor.
                     *
                     * @param input - The revocation request naming the grant, its scope and a request id.
                     * @returns An effect that completes once the grant is revoked and the request and audit rows are written, or at once for an exact repeat.
                     * @fails {MarketplaceFailure} With `denied` when the caller lacks owner authority or the grant is absent or out of scope, `conflict` when the request id was used differently, `invalid`, or `unavailable`.
                     */
                    revoke: (input) =>
                        safe(
                            atomic(
                                Effect.gen(
                                    /** Authorize revocation before recognizing an exact repeat or atomically recording the new request. */ function* () {
                                        const request = yield* decode(RevokeParticipant, input);
                                        const caller = yield* operator(request.scope, 'revoke');
                                        const value = yield* grant(request.grant);
                                        if (value === undefined || !sameScope(value.scope, request.scope))
                                            return yield* failure('denied');
                                        // Bind replay recognition to the exact request and caller, not merely the grant's revoked bit.
                                        const body = yield* encode(RevokeParticipant, request);
                                        const actor = yield* encode(CallerIdentity, caller);
                                        const [previous] = yield* sql<{
                                            body: string;
                                            actor: string;
                                        }>`SELECT body, actor FROM marketplace_request WHERE id = ${request.request}`;
                                        if (previous !== undefined) {
                                            if (previous.body !== body || previous.actor !== actor)
                                                return yield* failure('conflict');
                                            return;
                                        }
                                        yield* sql`UPDATE marketplace_grant SET revoked = 1 WHERE id = ${value.id}`;
                                        yield* sql`INSERT INTO marketplace_request (id, body, actor) VALUES (${request.request}, ${body}, ${actor})`;
                                        yield* audit({
                                            id: `request:${request.request}`,
                                            scope: request.scope,
                                            actor: caller.subject,
                                            at: yield* now,
                                            operation: 'revoke',
                                            reference: value.id,
                                        });
                                    }
                                )
                            )
                        ),
                    /**
                     * Return a schema-validated bounded audit page only for the currently authorized exact exchange scope.
                     *
                     * @param input - The audit query naming the exact exchange scope and page limit.
                     * @returns Up to `limit` audit events for that scope in id order.
                     * @fails {MarketplaceFailure} With `denied` when the caller is not an authorized participant, `invalid` for malformed input or stored events, or `unavailable`.
                     */
                    audit: (input) =>
                        safe(
                            atomic(
                                Effect.gen(
                                    /** Check operator authority before reading scope-indexed audit records. */ function* () {
                                        const request = yield* decode(MarketplaceAuditQuery, input);
                                        yield* operator(request.scope, 'audit');
                                        // Scope equality is encoded consistently with append; no cross-scope record scan is exposed.
                                        const key = yield* encode(ExchangeScope, request.scope);
                                        const rows = yield* sql<{
                                            body: string;
                                        }>`SELECT body FROM marketplace_audit WHERE scope_key = ${key} ORDER BY id LIMIT ${request.limit}`;
                                        return yield* Effect.forEach(
                                            rows,
                                            /**
                                             * Validate persisted audit evidence rather than trusting the SQL result generic.
                                             *
                                             * @param row - One stored audit row.
                                             * @returns The decoded audit event.
                                             */
                                            (row) => decode(Schema.parseJson(MarketplaceAuditEvent), row.body)
                                        );
                                    }
                                )
                            )
                        ),
                });
                const store = MarketplaceStore.of({
                    /**
                     * Expose callback-scoped metadata methods and require every inserted intent to be enqueued before commit.
                     *
                     * @template A - The callback's success value.
                     * @template E - The callback's typed failure.
                     * @template R - The callback's required services.
                     * @param use - The callback, given transaction methods valid only for its own lifetime and connection.
                     * @returns The callback's result once the transaction commits.
                     * @fails {MarketplaceFailure} With `unavailable` inside an ambient transaction, when the guard is missing, when SQL fails or when an inserted intent was never enqueued; the callback's own failures pass through.
                     */
                    transaction: (use) =>
                        atomic(
                            Effect.gen(
                                /** Bind transaction methods to one live callback, connection and private origin capability. */ function* () {
                                    const connection = yield* Effect.serviceOption(SqlClient.TransactionConnection);
                                    if (Option.isNone(connection)) return yield* failure('unavailable');
                                    const token = Symbol();
                                    let active = true;
                                    const pending = new Set<string>();
                                    // Capturing a transaction object must not let a caller use it after callback completion or in another root.
                                    const required = Effect.gen(
                                        /** Reject escaped, expired or foreign-connection use of this callback's transaction methods. */ function* () {
                                            const current = yield* Effect.serviceOption(
                                                SqlClient.TransactionConnection
                                            );
                                            const origin = yield* Effect.serviceOption(Origin);
                                            // Connection identity alone is reusable; the private origin and active lifetime fence this specific callback.
                                            if (
                                                !active ||
                                                Option.isNone(current) ||
                                                current.value[0] !== connection.value[0] ||
                                                Option.isNone(origin) ||
                                                origin.value !== token
                                            )
                                                return yield* failure('unavailable');
                                        }
                                    );
                                    /**
                                     * Recheck callback ownership at execution time before running each captured SQL operation.
                                     *
                                     * @template A - The operation's success value.
                                     * @template E - The operation's typed failure.
                                     * @template R - The operation's required services.
                                     * @param effect - The captured transaction operation.
                                     * @returns The operation's result.
                                     * @fails {MarketplaceFailure} With `unavailable` when the method escaped its callback, outlived it or runs on another connection.
                                     */
                                    const checked = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
                                        required.pipe(Effect.zipRight(effect));
                                    const tx: MarketplaceTransaction = {
                                        /**
                                         * Read current revocation state only through this callback's live transaction capability.
                                         *
                                         * @param id - The identifier of the grant to read.
                                         * @returns The grant with its live revocation flag, or undefined when absent.
                                         * @fails {MarketplaceFailure} With `unavailable` outside the live callback, or `invalid` for a malformed body.
                                         */
                                        grant: (id) => checked(grant(id)),
                                        /**
                                         * Read snapshot metadata without granting access to any private source payload.
                                         *
                                         * @param id - The identifier of the snapshot reference to read.
                                         * @returns The snapshot reference, or undefined when absent.
                                         * @fails {MarketplaceFailure} With `unavailable` outside the live callback, or `invalid` for a malformed body.
                                         */
                                        snapshot: (id) => checked(read('marketplace_snapshot', SnapshotReference, id)),
                                        /**
                                         * Read the exact stored command intent through the current callback's connection.
                                         *
                                         * @param id - The intent command id.
                                         * @returns The stored intent, or undefined when absent.
                                         * @fails {MarketplaceFailure} With `unavailable` outside the live callback, or `invalid` for a malformed body.
                                         */
                                        intent: (id) => checked(read('marketplace_intent', ExchangeIntent, id)),
                                        /**
                                         * Insert a validated intent and mark it pending until the same callback enqueues it.
                                         *
                                         * @param input - The exchange intent to insert.
                                         * @returns An effect that completes once the intent is inserted and marked pending.
                                         * @fails {MarketplaceFailure} With `invalid` for a malformed intent, or `unavailable` outside the live callback or when SQL fails.
                                         */
                                        insertIntent: (input) =>
                                            checked(
                                                Effect.gen(
                                                    /** Encode and insert intent metadata before tracking its required delivery staging. */ function* () {
                                                        const value = yield* decode(ExchangeIntent, input);
                                                        const body = yield* encode(ExchangeIntent, value);
                                                        yield* sql`INSERT INTO marketplace_intent (id, grant_id, snapshot_id, body) VALUES (${value.command}, ${value.grant}, ${value.snapshot.id}, ${body})`;
                                                        // The callback cannot commit this insertion without subsequently staging its matching delivery.
                                                        pending.add(value.command);
                                                    }
                                                )
                                            ).pipe(
                                                Effect.catchTag(
                                                    'SqlError',
                                                    /**
                                                     * Hide insert diagnostics without swallowing explicit validation failures.
                                                     *
                                                     * @returns A failure with the `unavailable` reason.
                                                     */
                                                    () => Effect.fail(failure('unavailable'))
                                                )
                                            ),
                                        /**
                                         * Stage delivery and audit evidence only for an exactly matching persisted intent.
                                         *
                                         * @param input - The exchange intent to stage; it must equal the stored intent exactly.
                                         * @returns An effect that completes once the delivery and audit rows are inserted.
                                         * @fails {MarketplaceFailure} With `conflict` when no identical intent is stored, `invalid`, or `unavailable` outside the live callback or when SQL fails.
                                         */
                                        enqueue: (input) =>
                                            checked(
                                                Effect.gen(
                                                    /** Cross-check intent contents before atomically inserting delivery and clearing its pending marker. */ function* () {
                                                        const value = yield* decode(ExchangeIntent, input);
                                                        const stored = yield* read(
                                                            'marketplace_intent',
                                                            ExchangeIntent,
                                                            value.command
                                                        );
                                                        if (
                                                            stored === undefined ||
                                                            (yield* encode(ExchangeIntent, stored)) !==
                                                                (yield* encode(ExchangeIntent, value))
                                                        )
                                                            return yield* failure('conflict');
                                                        // Only an exact persisted intent can satisfy the callback's insert-and-enqueue invariant.
                                                        yield* sql`INSERT INTO marketplace_delivery (command, state, attempt, available_at) VALUES (${value.command}, 'pending', 0, 0)`;
                                                        yield* audit({
                                                            id: `intent:${value.command}`,
                                                            scope: value.snapshot.scope,
                                                            actor: value.subject,
                                                            at: yield* now,
                                                            operation: 'stage',
                                                            reference: value.command,
                                                        });
                                                        pending.delete(value.command);
                                                    }
                                                )
                                            ).pipe(
                                                Effect.catchTag(
                                                    'SqlError',
                                                    /**
                                                     * Redact delivery insertion diagnostics while retaining explicit conflicts.
                                                     *
                                                     * @returns A failure with the `unavailable` reason.
                                                     */
                                                    () => Effect.fail(failure('unavailable'))
                                                )
                                            ),
                                    };
                                    return yield* use(tx).pipe(
                                        Effect.provideService(Origin, token),
                                        Effect.tap(
                                            /**
                                             * Reject successful callbacks that would leave an inserted intent without a delivery row.
                                             *
                                             * @returns Success when every inserted intent was enqueued, otherwise an `unavailable` failure.
                                             */
                                            () =>
                                                pending.size === 0 ? Effect.void : Effect.fail(failure('unavailable'))
                                        ),
                                        Effect.ensuring(
                                            Effect.sync(
                                                /** Invalidate every captured transaction method on success, failure or interruption. */ () => {
                                                    active = false;
                                                }
                                            )
                                        )
                                    );
                                }
                            )
                        ),
                });
                /**
                 * Revalidate snapshot, current grant, exact caller binding and staging authority before processing staged intent.
                 *
                 * @param value - The staged intent to revalidate.
                 * @returns An effect that succeeds when the snapshot, grant, caller and staging authority are all still valid.
                 * @fails {MarketplaceFailure} With `invalid` when the snapshot reference changed, `denied` when the grant is revoked, expired, mismatched or the caller differs, or the authority's own failure.
                 */
                const live = (value: ExchangeIntent) =>
                    Effect.gen(
                        /** Verify immutable reference agreement and current staging authority, including expiration after policy evaluation. */ function* () {
                            const current = yield* grant(value.grant);
                            const reference = yield* read('marketplace_snapshot', SnapshotReference, value.snapshot.id);
                            if (
                                reference === undefined ||
                                (yield* encode(SnapshotReference, reference)) !==
                                    (yield* encode(SnapshotReference, value.snapshot))
                            )
                                return yield* failure('invalid');
                            const caller = yield* Caller;
                            if (
                                current === undefined ||
                                current.revoked ||
                                current.expiresAt <= (yield* now) ||
                                current.action !== 'stage' ||
                                current.participantTenant !== value.tenant ||
                                current.subject !== value.subject ||
                                !sameScope(current.scope, value.snapshot.scope) ||
                                caller.tenant !== value.tenant ||
                                caller.subject !== value.subject ||
                                (caller.onBehalfOf ?? null) !== value.onBehalfOf
                            )
                                return yield* failure('denied');
                            // A policy check can suspend; grant validity must still hold when it returns before new evidence is recorded.
                            yield* (yield* MarketplaceAuthority).authorize(caller, value.snapshot, 'stage');
                            if (current.expiresAt <= (yield* now)) return yield* failure('denied');
                        }
                    );
                /**
                 * Load an intent only for the authorized processing operator who exactly matches its original staged caller.
                 *
                 * @param command - The intent command id.
                 * @returns The stored intent.
                 * @fails {MarketplaceFailure} With `denied` when the intent is absent or the caller is not its original staging caller, or the operator policy's failure.
                 */
                const processing = (command: string) =>
                    Effect.gen(
                        /** Resolve the stored command and reject a different tenant, subject or represented human. */ function* () {
                            const value = yield* read('marketplace_intent', ExchangeIntent, command);
                            if (value === undefined) return yield* failure('denied');
                            const caller = yield* operator(value.snapshot.scope, 'process');
                            // Generic process permission does not permit adopting another caller's staged command.
                            if (
                                caller.tenant !== value.tenant ||
                                caller.subject !== value.subject ||
                                (caller.onBehalfOf ?? null) !== value.onBehalfOf
                            )
                                return yield* failure('denied');
                            return value;
                        }
                    );
                /**
                 * Record a terminal local delivery state and audit metadata in the enclosing guarded transaction.
                 *
                 * @param value - The intent whose delivery stops progressing.
                 * @param operation - The terminal state: `blocked` for lost authority, `exhausted` for spent attempts.
                 * @param key - The unique suffix of the audit event id.
                 * @returns An effect that completes once the delivery state and audit row are written.
                 * @fails {MarketplaceFailure} With `invalid` when the audit event cannot be encoded.
                 */
                const block = (value: ExchangeIntent, operation: 'blocked' | 'exhausted', key: string) =>
                    Effect.gen(
                        /** Clear the worker lease together with evidence explaining why this intent no longer progresses. */ function* () {
                            // Persist the terminal transition and its audit event under the same atomic owner.
                            yield* sql`UPDATE marketplace_delivery SET state = ${operation}, lease = NULL, lease_until = NULL WHERE command = ${value.command}`;
                            yield* audit({
                                id: `block:${key}`,
                                scope: value.snapshot.scope,
                                actor: value.subject,
                                at: yield* now,
                                operation,
                                reference: value.command,
                            });
                        }
                    );
                const outbox = MarketplaceOutbox.of({
                    /**
                     * Claim an eligible command with live authority and a bounded retry lease; denial may persist a blocked state.
                     *
                     * @param input - The claim request naming the command, the lease length and the attempt budget.
                     * @returns The new claim, or undefined when nothing is eligible or the attempts were exhausted.
                     * @fails {MarketplaceFailure} With `denied` after recording a blocked state when live authority is lost, `conflict` when the attempt budget changed, `invalid`, or `unavailable`.
                     */
                    claim: (input) =>
                        safe(
                            atomic(
                                Effect.gen(
                                    /** Serialize live authorization, terminal-state admission and fresh lease allocation for one delivery. */ function* () {
                                        const request = yield* decode(ClaimExchange, input);
                                        const value = yield* processing(request.command);
                                        const [row] = yield* sql<{
                                            state: string;
                                            attempt: number | string;
                                            max_attempts: number | string | null;
                                            lease_until: number | string | null;
                                            available_at: number | string;
                                        }>`SELECT state, attempt, max_attempts, lease_until, available_at FROM marketplace_delivery WHERE command = ${request.command}`;
                                        if (row === undefined) return yield* failure('unavailable');
                                        const authorization = yield* live(value).pipe(Effect.either);
                                        // Return denial as data until commit so a blocking transition is retained rather than rolled back.
                                        if (Either.isLeft(authorization)) {
                                            if (authorization.left.reason !== 'denied')
                                                return yield* authorization.left;
                                            if (!['recorded', 'blocked', 'exhausted'].includes(row.state)) {
                                                const key = yield* uuidV7.pipe(
                                                    Effect.mapError(
                                                        /**
                                                         * Sanitize identifier generation before recording the blocked transition.
                                                         *
                                                         * @returns A MarketplaceFailure with the `unavailable` reason.
                                                         */
                                                        () => failure('unavailable')
                                                    )
                                                );
                                                yield* block(value, 'blocked', key);
                                            }
                                            return authorization;
                                        }
                                        if (
                                            row.max_attempts !== null &&
                                            Number(row.max_attempts) !== request.maxAttempts
                                        )
                                            return yield* failure('conflict');
                                        const time = yield* now;
                                        const attempt = Number(row.attempt);
                                        if (
                                            ['recorded', 'blocked', 'exhausted'].includes(row.state) ||
                                            Number(row.available_at) > time ||
                                            (row.state === 'running' && Number(row.lease_until) > time)
                                        )
                                            return Either.right(undefined);
                                        const token = yield* uuidV7.pipe(
                                            Effect.mapError(
                                                /**
                                                 * Keep lease generation failures within the closed availability channel.
                                                 *
                                                 * @returns A MarketplaceFailure with the `unavailable` reason.
                                                 */
                                                () => failure('unavailable')
                                            )
                                        );
                                        if (attempt >= request.maxAttempts) {
                                            yield* block(value, 'exhausted', token);
                                            return Either.right(undefined);
                                        }
                                        const until = yield* decode(EpochMillis, time + request.leaseMs);
                                        const claim: ExchangeClaim = {
                                            command: request.command,
                                            lease: token,
                                            attempt: attempt + 1,
                                        };
                                        yield* sql`UPDATE marketplace_delivery SET state = 'running', lease = ${token}, lease_until = ${until}, attempt = ${claim.attempt}, max_attempts = ${request.maxAttempts} WHERE command = ${request.command}`;
                                        yield* audit({
                                            id: `claim:${token}`,
                                            scope: value.snapshot.scope,
                                            actor: value.subject,
                                            at: time,
                                            operation: 'claim',
                                            reference: value.command,
                                        });
                                        return Either.right(claim);
                                    }
                                )
                            )
                        ).pipe(
                            Effect.flatMap(
                                /**
                                 * Restore a persisted denial only after its atomic blocking transition has committed.
                                 *
                                 * @param result - The committed claim outcome, a denial or a claim.
                                 * @returns An effect that fails with the committed denial or succeeds with the claim.
                                 */
                                (result) => result
                            )
                        ),
                    /**
                     * Settle an exact live lease or recognize an exact authorized repeat; recheck expiration after policy waits.
                     *
                     * @param input - The settlement naming the claim and its outcome.
                     * @returns An effect that completes once the outcome is recorded, or at once for an exact repeat.
                     * @fails {MarketplaceFailure} With `conflict` when the lease is stale, expired or settled differently, `denied` after recording a blocked state when live authority is lost, `invalid`, or `unavailable`.
                     */
                    settle: (input) =>
                        safe(
                            atomic(
                                Effect.gen(
                                    /** Verify caller, prior evidence and current lease before committing an outcome and audit event together. */ function* () {
                                        const request = yield* decode(SettleExchange, input);
                                        const value = yield* processing(request.claim.command);
                                        const body = yield* encode(SettleExchange, request);
                                        const [previous] = yield* sql<{
                                            body: string;
                                        }>`SELECT body FROM marketplace_settlement WHERE lease = ${request.claim.lease}`;
                                        if (previous !== undefined) {
                                            yield* live(value);
                                            if (previous.body !== body) return yield* failure('conflict');
                                            return Either.right(undefined);
                                        }
                                        const [row] = yield* sql<{
                                            state: string;
                                            lease: string | null;
                                            lease_until: string | number | null;
                                            attempt: string | number;
                                            max_attempts: string | number;
                                        }>`SELECT state, lease, lease_until, attempt, max_attempts FROM marketplace_delivery WHERE command = ${request.claim.command}`;
                                        if (
                                            row === undefined ||
                                            row.state !== 'running' ||
                                            row.lease !== request.claim.lease ||
                                            Number(row.attempt) !== request.claim.attempt ||
                                            Number(row.lease_until) <= (yield* now)
                                        )
                                            return yield* failure('conflict');
                                        const authorization = yield* live(value).pipe(Effect.either);
                                        if (Either.isLeft(authorization)) {
                                            if (authorization.left.reason !== 'denied')
                                                return yield* authorization.left;
                                            yield* block(value, 'blocked', `settle:${request.claim.lease}`);
                                            return authorization;
                                        }
                                        // Live policy may take time; an expired fence cannot record new evidence.
                                        if (Number(row.lease_until) <= (yield* now)) return yield* failure('conflict');
                                        const state =
                                            request.outcome.state === 'retry' &&
                                            Number(row.attempt) >= Number(row.max_attempts)
                                                ? 'exhausted'
                                                : request.outcome.state;
                                        yield* sql`UPDATE marketplace_delivery SET state = ${state}, available_at = ${request.outcome.state === 'retry' ? request.outcome.availableAt : 0}, lease = NULL, lease_until = NULL WHERE command = ${request.claim.command}`;
                                        yield* sql`INSERT INTO marketplace_settlement (lease, command, body) VALUES (${request.claim.lease}, ${request.claim.command}, ${body})`;
                                        yield* audit({
                                            id: `settle:${request.claim.lease}`,
                                            scope: value.snapshot.scope,
                                            actor: value.subject,
                                            at: yield* now,
                                            operation: state,
                                            reference: value.command,
                                        });
                                        return Either.right(undefined);
                                    }
                                )
                            )
                        ).pipe(
                            Effect.flatMap(
                                /**
                                 * Surface live-policy denial after committing any required blocked-state audit evidence.
                                 *
                                 * @param result - The committed settlement outcome, a denial or success.
                                 * @returns An effect that fails with the committed denial or succeeds.
                                 */
                                (result) => result
                            )
                        ),
                });
                return Layer.mergeAll(
                    Layer.succeed(MarketplaceStore, store),
                    Layer.succeed(MarketplaceAdministration, administration),
                    Layer.succeed(MarketplaceOutbox, outbox)
                );
            }
        )
    );
