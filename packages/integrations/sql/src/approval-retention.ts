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
import { ApprovalRecord, approvalRetentionEnd } from '@eventiva/contracts/approval';
import {
    ApprovalRetentionFailure,
    ApprovalRetentionMaintenance,
    ApprovalRetentionRequest,
} from '@eventiva/contracts/approval-retention';
import { CallerIdentity } from '@eventiva/contracts/caller';
import { CurrentTenant, EpochMillis, Version } from '@eventiva/contracts/storage';
import { Clock, Effect, Layer, Schema } from 'effect';

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

/** Build an unactivated maintenance capability for the routed tenant SQL client, not a transport or business handler. */
export const approvalRetentionMaintenance = Layer.effect(
    ApprovalRetentionMaintenance,
    Effect.gen(
        /** Capture physical routing, while every invocation re-reads authoritative proof/decision state under its guard. */
        function* () {
            const tenant = yield* CurrentTenant;
            const sql = yield* SqlClient.SqlClient;
            /** Sanitize rejected requests, malformed persistence and clock values at this public service boundary. */
            const decode = <A, I>(schema: Schema.Schema<A, I>, value: NoInfer<I>) =>
                Schema.decode(schema)(value, { onExcessProperty: 'error' }).pipe(
                    Effect.mapError(
                        /** Do not attach rejected proof content or parser causes to maintenance failures. */
                        () => new ApprovalRetentionFailure({ reason: 'invalid' })
                    )
                );
            return ApprovalRetentionMaintenance.of({
                tenant: tenant.id,
                /** Explicitly inspect a bounded page; raw SQL permits exist only while this transaction holds the identity guard. */
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
                        Effect.catchTag(
                            'SqlError',
                            /** Failure is visible and retryable; never report partial committed counts after SQL rollback. */
                            () => new ApprovalRetentionFailure({ reason: 'unavailable' })
                        )
                    ),
            });
        }
    )
);
