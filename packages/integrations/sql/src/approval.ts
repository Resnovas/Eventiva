/**
 * @file packages/integrations/sql/src/approval.ts
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
import { ApprovalFailure, ApprovalRecord, ApprovalStore } from '@eventiva/contracts/approval';
import { CallerIdentity } from '@eventiva/contracts/caller';
import { CurrentTenant, UuidV7, Version } from '@eventiva/contracts/storage';
import { Effect, Layer, Schema } from 'effect';
import { uuidV7 } from './values.ts';

/**
 * Bind dedicated proof persistence to the same tenant client as identity, Storage and Integrity; never the compute client.
 *
 * @since 0.0.1
 * @example
 * const program = Effect.provide(issueApproval, approvalStore);
 */
export const approvalStore = Layer.effect(
    ApprovalStore,
    Effect.gen(
        /** Capture tenant ownership once; transaction-local connection state remains fiber-scoped in the SQL driver. */
        function* () {
            // Physical routing is authoritative; proof bodies cannot select or switch their own database client.
            const tenant = yield* CurrentTenant;
            const sql = yield* SqlClient.SqlClient;
            /**
             * Redact driver and malformed persisted-data details at the authorization storage boundary.
             *
             * @returns An ApprovalFailure with the `unavailable` reason and no driver or row detail.
             */
            const unavailable = () => new ApprovalFailure({ reason: 'unavailable' });
            /**
             * Enforce exact persisted/input schemas rather than trusting TypeScript or coercing arbitrary row fields.
             *
             * @template A - The decoded value.
             * @template I - The encoded input accepted by the schema.
             * @param schema - The exact schema the value must satisfy, with no excess properties.
             * @param value - The persisted or caller-supplied value to decode.
             * @returns The decoded value.
             * @fails {ApprovalFailure} With `invalid` when the value does not decode.
             */
            const decode = <A, I>(schema: Schema.Schema<A, I>, value: NoInfer<I>) =>
                Schema.decode(schema)(value, { onExcessProperty: 'error' }).pipe(
                    Effect.mapError(
                        /**
                         * Rejected proof content never appears in a public error.
                         *
                         * @returns An ApprovalFailure with the `invalid` reason.
                         */
                        () => new ApprovalFailure({ reason: 'invalid' })
                    )
                );
            /**
             * Share the identity guard and its lock order, so live authority and proof changes serialize together.
             *
             * @template A - The body's success value.
             * @template E - The body's typed failure.
             * @template R - The body's required services.
             * @param effect - The proof work to run while the identity guard row is locked.
             * @returns The body's result once the SQL transaction commits.
             * @fails {ApprovalFailure} With `unavailable` when the guard row is missing or SQL fails; the body's own failures pass through.
             */
            const transaction: ApprovalStore['Type']['transaction'] = (effect) =>
                sql
                    .withTransaction(
                        Effect.gen(
                            /** Hold the established authority guard through nested Integrity commit; never acknowledge an empty lock. */
                            function* () {
                                // The guard exists in both SQL dialects; updating it avoids SQLite's deferred-read upgrade race.
                                const rows =
                                    yield* sql`UPDATE identity_guard SET version = version WHERE id = 1 RETURNING id`;
                                if (rows.length !== 1) return yield* unavailable();
                                return yield* effect;
                            }
                        )
                    )
                    .pipe(Effect.catchTag('SqlError', unavailable));
            /**
             * Read row identity/version and body as one exact record; corruption is denial, never absence.
             *
             * @param id - The approval proof id, decoded as a UUIDv7 before use.
             * @returns The stored record, or undefined when no row exists.
             * @fails {ApprovalFailure} With `invalid` when the id, body or revision is malformed or the body names another record, revision or tenant, or `unavailable` when SQL fails.
             */
            const get: ApprovalStore['Type']['get'] = (id) =>
                Effect.gen(
                    /** Cross-check the embedded route and optimistic revision against SQL metadata. */
                    function* () {
                        const key = yield* decode(UuidV7, id);
                        const [row] = yield* sql<{
                            id: string;
                            revision: number | string;
                            body: string;
                        }>`SELECT id, revision, body FROM approval_proof WHERE id = ${key}`;
                        if (!row) return undefined;
                        const record = yield* decode(Schema.parseJson(ApprovalRecord), row.body);
                        const revision = yield* decode(Version, Number(row.revision));
                        // A copied body cannot authorize another record, database tenant or revision.
                        if (record.id !== row.id || record.revision !== revision || record.binding.tenant !== tenant.id)
                            return yield* new ApprovalFailure({ reason: 'invalid' });
                        return record;
                    }
                ).pipe(Effect.catchTag('SqlError', unavailable));
            return ApprovalStore.of({
                tenant: tenant.id,
                nextId: uuidV7.pipe(Effect.mapError(unavailable)),
                transaction,
                get,
                /**
                 * Persist immutable binding plus monotonic lifecycle and an append-only decision in one SQL transaction.
                 *
                 * @param record - The full proof record to persist; only lifecycle fields may differ from the stored revision.
                 * @param actor - The caller recorded on the decision; issue and cancel need a human, use needs the bound principal.
                 * @param kind - The decision being recorded: `issued`, `used` or `cancelled`.
                 * @returns An effect that completes once the proof and its decision row are written together.
                 * @fails {ApprovalFailure} With `denied` for a foreign tenant or ineligible actor, `conflict` for a stale or illegal transition, `invalid` for malformed input, or `unavailable` when SQL fails.
                 */
                save: (record, actor, kind) =>
                    transaction(
                        Effect.gen(
                            /** Reject stale updates and evidence replacement before performing the optimistic write. */
                            function* () {
                                const value = yield* decode(Schema.typeSchema(ApprovalRecord), record);
                                const recordedActor = yield* decode(CallerIdentity, actor);
                                if (
                                    value.binding.tenant !== tenant.id ||
                                    recordedActor.tenant !== tenant.id ||
                                    (kind !== 'used' && recordedActor.kind !== 'human') ||
                                    (kind === 'used' && recordedActor.subject !== value.binding.principal)
                                )
                                    return yield* new ApprovalFailure({ reason: 'denied' });
                                const previous = yield* get(value.id);
                                if (previous) {
                                    // Only lifecycle metadata may advance; neither cancellation nor use can replace the consented intent.
                                    const immutable = {
                                        ...value,
                                        revision: previous.revision,
                                        usedAt: previous.usedAt,
                                        revokedAt: previous.revokedAt,
                                        retainUntil: previous.retainUntil,
                                    };
                                    if (
                                        kind === 'issued' ||
                                        previous.revokedAt !== null ||
                                        value.revision !== previous.revision + 1 ||
                                        JSON.stringify(immutable) !== JSON.stringify(previous) ||
                                        // First use/cancel replaces the provisional expiry anchor with the actual terminal event.
                                        // No later update may move that deadline; replay never writes a second use revision.
                                        previous.usedAt !== null ||
                                        (kind === 'used' &&
                                            (previous.usedAt !== null ||
                                                value.usedAt === null ||
                                                value.revokedAt !== null)) ||
                                        (kind === 'cancelled' && (previous.usedAt !== null || value.revokedAt === null))
                                    )
                                        return yield* new ApprovalFailure({ reason: 'conflict' });
                                } else if (
                                    kind !== 'issued' ||
                                    value.revision !== 0 ||
                                    value.usedAt !== null ||
                                    value.revokedAt !== null
                                )
                                    return yield* new ApprovalFailure({ reason: 'conflict' });
                                const body = yield* Schema.encode(Schema.parseJson(ApprovalRecord))(value).pipe(
                                    Effect.mapError(unavailable)
                                );
                                const rows = previous
                                    ? yield* sql`UPDATE approval_proof SET revision = ${value.revision}, body = ${body} WHERE id = ${value.id} AND revision = ${previous.revision} RETURNING id`
                                    : yield* sql`INSERT INTO approval_proof (id, revision, body) VALUES (${value.id}, ${value.revision}, ${body}) ON CONFLICT (id) DO NOTHING RETURNING id`;
                                if (rows.length !== 1) return yield* new ApprovalFailure({ reason: 'conflict' });
                                // A decision write failure rolls the proof write back; no best-effort or volatile audit fallback exists.
                                const decision = JSON.stringify({
                                    kind,
                                    actor: recordedActor,
                                    issuedAt: value.issuedAt,
                                    usedAt: value.usedAt,
                                    revokedAt: value.revokedAt,
                                    retainUntil: value.retainUntil,
                                });
                                yield* sql`INSERT INTO approval_decision (proof_id, revision, body) VALUES (${value.id}, ${value.revision}, ${decision})`;
                            }
                        ).pipe(Effect.catchTag('SqlError', unavailable))
                    ),
            });
        }
    )
);
