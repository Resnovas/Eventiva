/**
 * @file packages/integrations/sql/src/approval-retention.ts
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
import { ApprovalRecord, approvalRetentionEnd } from '@eventiva/contracts/approval';
import {
    ApprovalRetentionFailure,
    ApprovalRetentionMaintenance,
    ApprovalRetentionRequest,
} from '@eventiva/contracts/approval-retention';
import { CallerIdentity } from '@eventiva/contracts/caller';
import { CurrentTenant, EpochMillis, Version } from '@eventiva/contracts/storage';
import { Cause, Clock, Effect, Layer, Schema } from 'effect';

/** Decode integer driver representations without coercing malformed SQLite text into revision zero. */
const Revision = Schema.Union(
    Version,
    Schema.String.pipe(
        Schema.pattern(/^(0|[1-9][0-9]*)$/),
        Schema.compose(Schema.NumberFromString),
        Schema.compose(Version)
    )
);

/** Published decision projection; validation never treats a malformed audit row as disposable history. */
const Decision = Schema.Struct({
    kind: Schema.Literal('issued', 'used', 'cancelled'),
    actor: CallerIdentity,
    issuedAt: EpochMillis,
    usedAt: Schema.NullOr(EpochMillis),
    revokedAt: Schema.NullOr(EpochMillis),
    retainUntil: EpochMillis,
});

/**
 * Build an unactivated maintenance capability for the routed tenant SQL client, not a transport or business handler.
 *
 * @since 0.0.1
 * @example
 * const program = Effect.provide(runRetention, approvalRetentionMaintenance);
 */
export const approvalRetentionMaintenance = Layer.effect(
    ApprovalRetentionMaintenance,
    Effect.gen(
        /** Capture physical routing, while every invocation re-reads authoritative proof/decision state under its guard. */
        function* () {
            const tenant = yield* CurrentTenant;
            const sql = yield* SqlClient.SqlClient;
            /**
             * Sanitize rejected requests, malformed persistence and clock values at this public service boundary.
             *
             * @template A - The decoded value.
             * @template I - The encoded input accepted by the schema.
             * @param schema - The exact schema the value must satisfy, with no excess properties.
             * @param value - The request, persisted row field or clock reading to decode.
             * @returns The decoded value.
             * @fails {ApprovalRetentionFailure} With `invalid` when the value does not decode.
             */
            const decode = <A, I>(schema: Schema.Schema<A, I>, value: NoInfer<I>) =>
                Schema.decode(schema)(value, { onExcessProperty: 'error' }).pipe(
                    Effect.mapError(
                        /**
                         * Do not attach rejected proof content or parser causes to maintenance failures.
                         *
                         * @returns An ApprovalRetentionFailure with the `invalid` reason.
                         */
                        () => new ApprovalRetentionFailure({ reason: 'invalid' })
                    )
                );
            return ApprovalRetentionMaintenance.of({
                tenant: tenant.id,
                /**
                 * Explicitly inspect a bounded page; raw SQL permits exist only while this transaction holds the identity guard.
                 *
                 * @param request - The maintenance request naming the tenant, an optional `after` cursor and the page limit.
                 * @returns How many proofs were scanned and how many decisions and proofs were deleted, plus `next` when more rows remain.
                 * @fails {ApprovalRetentionFailure} With `denied` for another tenant, `invalid` for a malformed request or corrupt proof or decision, or `unavailable` when the guard row is missing or SQL fails.
                 */
                run: (request) =>
                    Effect.gen(
                        /** Validate routing before touching SQL and sample the trusted clock after acquiring the serialization guard. */
                        function* () {
                            // A tenant supplied in a maintenance request cannot select or override physical routing.
                            const value = yield* decode(ApprovalRetentionRequest, request);
                            if (value.tenant !== tenant.id)
                                return yield* new ApprovalRetentionFailure({ reason: 'denied' });
                            return yield* sql.withTransaction(
                                Effect.gen(
                                    /** Use the same first lock as issuance/use/cancel; no business handler runs in this suffix. */
                                    function* () {
                                        // A write lock also avoids SQLite's deferred-read upgrade race.
                                        const guard =
                                            yield* sql`UPDATE identity_guard SET version = version WHERE id = 1 RETURNING id`;
                                        if (guard.length !== 1)
                                            return yield* new ApprovalRetentionFailure({ reason: 'unavailable' });
                                        const now = yield* decode(EpochMillis, yield* Clock.currentTimeMillis);
                                        const rows = yield* sql<{
                                            id: string;
                                            revision: string | number;
                                            body: string;
                                        }>`SELECT id, revision, body FROM approval_proof WHERE id > ${value.after ?? ''} ORDER BY id LIMIT ${value.limit + 1}`;
                                        let deletedDecisions = 0;
                                        let deletedProofs = 0;
                                        const page = rows.slice(0, value.limit);
                                        for (const row of page) {
                                            const proof = yield* decode(Schema.parseJson(ApprovalRecord), row.body);
                                            const revision = yield* decode(Revision, row.revision);
                                            if (
                                                proof.id !== row.id ||
                                                proof.revision !== revision ||
                                                proof.revision !==
                                                    (proof.usedAt !== null || proof.revokedAt !== null ? 1 : 0) ||
                                                proof.binding.tenant !== tenant.id
                                            )
                                                return yield* new ApprovalRetentionFailure({ reason: 'invalid' });
                                            // Recompute the producer contract; an elapsed provisional issue deadline is not terminal authority.
                                            const until = approvalRetentionEnd(
                                                proof.usedAt ?? proof.revokedAt ?? proof.expiresAt,
                                                proof.retention
                                            );
                                            if (until > now) continue;
                                            const decisions = yield* sql<{
                                                revision: string | number;
                                                body: string;
                                            }>`SELECT revision, body FROM approval_decision WHERE proof_id = ${proof.id} ORDER BY revision LIMIT 3`;
                                            // The producer admits issuance plus one terminal revision only; corruption cannot make a page unbounded.
                                            if (
                                                decisions.length > 2 ||
                                                (decisions.length !== proof.revision + 1 &&
                                                    !(
                                                        decisions.length === 0 &&
                                                        proof.revision === 1 &&
                                                        proof.expiresAt > until
                                                    ))
                                            )
                                                return yield* new ApprovalRetentionFailure({ reason: 'invalid' });
                                            for (const [index, row] of decisions.entries()) {
                                                const decision = yield* decode(Schema.parseJson(Decision), row.body);
                                                const version = yield* decode(Revision, row.revision);
                                                if (
                                                    version !== index ||
                                                    decision.kind !==
                                                        (index === 0
                                                            ? 'issued'
                                                            : proof.usedAt !== null
                                                              ? 'used'
                                                              : 'cancelled') ||
                                                    decision.usedAt !== (index === 0 ? null : proof.usedAt) ||
                                                    decision.revokedAt !== (index === 0 ? null : proof.revokedAt) ||
                                                    decision.actor.tenant !== tenant.id ||
                                                    decision.issuedAt !== proof.issuedAt ||
                                                    decision.retainUntil !==
                                                        approvalRetentionEnd(
                                                            decision.usedAt ?? decision.revokedAt ?? proof.expiresAt,
                                                            proof.retention
                                                        )
                                                )
                                                    return yield* new ApprovalRetentionFailure({ reason: 'invalid' });
                                            }
                                            // This exact body/revision permit cannot authorize another proof or a later CAS state.
                                            yield* sql`INSERT INTO approval_retention_permit (proof_id, revision, body, cutoff) VALUES (${proof.id}, ${revision}, ${row.body}, ${now})`;
                                            const removed =
                                                yield* sql`DELETE FROM approval_decision WHERE proof_id = ${proof.id} RETURNING revision`;
                                            deletedDecisions += removed.length;
                                            // Used/cancelled proofs can have an expiry later than their terminal retention deadline.
                                            if (proof.expiresAt <= now) {
                                                const removed =
                                                    yield* sql`DELETE FROM approval_proof WHERE id = ${proof.id} RETURNING id`;
                                                deletedProofs += removed.length;
                                            }
                                            yield* sql`DELETE FROM approval_retention_permit WHERE proof_id = ${proof.id}`;
                                        }
                                        const last = page.at(-1);
                                        return {
                                            scanned: page.length,
                                            deletedDecisions,
                                            deletedProofs,
                                            ...(rows.length > value.limit && last ? { next: last.id } : {}),
                                        };
                                    }
                                )
                            );
                        }
                    ).pipe(
                        Effect.catchAllCause(
                            /**
                             * Bound driver failures, including finalization orDie, without discarding other cause leaves.
                             *
                             * @param cause - The full failure cause of the maintenance run.
                             * @returns A failure with the same cause structure, with SQL failures and SQL defects replaced by `unavailable`.
                             */
                            (cause) =>
                                Effect.failCause(
                                    Cause.match(cause, {
                                        onEmpty: Cause.empty,
                                        /**
                                         * Preserve typed validation/authority failures; SQL never carries diagnostics out.
                                         *
                                         * @param error - A typed failure leaf from the cause.
                                         * @returns A failure leaf carrying the original error, or `unavailable` for an SQL error.
                                         */
                                        onFail: (error) =>
                                            Cause.fail(
                                                error instanceof SqlError
                                                    ? new ApprovalRetentionFailure({ reason: 'unavailable' })
                                                    : error
                                            ),
                                        /**
                                         * An unavailable acknowledgement says nothing about commit or rollback outcome.
                                         *
                                         * @param defect - A defect leaf from the cause.
                                         * @returns A typed `unavailable` failure for an SQL defect, otherwise the original defect.
                                         */
                                        onDie: (defect) =>
                                            defect instanceof SqlError
                                                ? Cause.fail(new ApprovalRetentionFailure({ reason: 'unavailable' }))
                                                : Cause.die(defect),
                                        onInterrupt: Cause.interrupt,
                                        onSequential: Cause.sequential,
                                        onParallel: Cause.parallel,
                                    })
                                )
                        )
                    ),
            });
        }
    )
);
