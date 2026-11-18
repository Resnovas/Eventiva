/**
 * @file packages/integrations/sql/src/agent-output.ts
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
import {
    AgentOutputFailure,
    AgentOutputLog,
    OutputAppend,
    OutputPayload,
    OutputRead,
    OutputOffset,
    type OutputEvent,
} from '@eventiva/contracts/agent-output';
import type { TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { Context, Effect, Layer, Schema } from 'effect';

const Stored = Schema.Struct({
    event_id: Schema.String,
    offset: Schema.Union(Schema.String, Schema.Number),
    payload: Schema.String,
});
/** Strip driver/parser details before errors can reach logs, RPC replies or telemetry. */
const unavailable = () => new AgentOutputFailure({ reason: 'unavailable' });
/** Validate even typed callers, rejecting excess fields rather than silently persisting protected data. */
const decode = <A, I, Input>(schema: Schema.Schema<A, I>, value: Input) =>
    Schema.decodeUnknown(schema)(value, { onExcessProperty: 'error' }).pipe(
        Effect.mapError(
            /** Never attach the rejected value to a public failure. */ () =>
                new AgentOutputFailure({ reason: 'invalid' })
        )
    );
/** Canonicalize only the closed payload union so property insertion order cannot create retry conflicts. */
const payloadJson = (payload: typeof OutputPayload.Type) =>
    JSON.stringify(
        payload._tag === 'Text'
            ? { _tag: 'Text', text: payload.text }
            : { _tag: 'StepCompleted', stepIndex: payload.stepIndex }
    );

/** Resolve tenant clients from trusted composition only; no database URL or tenant selector is accepted in event input. */
export const agentOutputLog = (
    /** Supply only the routed tenant capability; unknown tenants fail closed without provisioning. */
    resolve: (tenant: TenantId) => Effect.Effect<SqlClient.SqlClient, AgentOutputFailure>
) =>
    Layer.succeed(
        AgentOutputLog,
        AgentOutputLog.of({
            /** Serialize each tenant/run allocator, deduplicate before incrementing and commit event/counter together. */
            append: (input) =>
                Effect.gen(
                    /** Never inherit a business transaction: return only after this independent output transaction commits. */ function* () {
                        // Resolve only the trusted tenant capability; canonical payload equality determines whether a logical retry conflicts.
                        const value = yield* decode(OutputAppend, input);
                        const tenant = yield* CurrentTenant;
                        const sql = yield* resolve(tenant.id);
                        const payload = payloadJson(value.payload);
                        return yield* sql.withTransaction(
                            Effect.gen(
                                /** The no-op UPSERT takes a row write lock on PostgreSQL and a writer lock on SQLite. */ function* () {
                                    yield* sql`INSERT INTO agent_output_run (tenant_id, run_id, next_offset) VALUES (${tenant.id}, ${value.runId}, 0)
                        ON CONFLICT (tenant_id, run_id) DO UPDATE SET next_offset = agent_output_run.next_offset`;
                                    const [prior] =
                                        yield* sql`SELECT event_id, "offset", payload FROM agent_output_event
                        WHERE tenant_id = ${tenant.id} AND run_id = ${value.runId} AND event_id = ${value.eventId}`;
                                    if (prior !== undefined) {
                                        const row = yield* decode(Stored, prior);
                                        if (row.payload !== payload)
                                            return yield* new AgentOutputFailure({ reason: 'conflict' });
                                        return {
                                            ...value,
                                            tenant: tenant.id,
                                            offset: yield* decode(OutputOffset, Number(row.offset)),
                                        };
                                    }
                                    // Allocation and insert share the transaction; a failed insert cannot leave a cursor gap.
                                    const [allocation] = yield* sql<{
                                        offset: number | string;
                                    }>`UPDATE agent_output_run SET next_offset = next_offset + 1
                        WHERE tenant_id = ${tenant.id} AND run_id = ${value.runId} AND next_offset < 9007199254740991
                        RETURNING next_offset - 1 AS "offset"`;
                                    if (allocation === undefined) return yield* unavailable();
                                    const offset = yield* decode(OutputOffset, Number(allocation.offset));
                                    yield* sql`INSERT INTO agent_output_event (tenant_id, run_id, "offset", event_id, payload)
                        VALUES (${tenant.id}, ${value.runId}, ${offset}, ${value.eventId}, ${payload})`;
                                    return { ...value, tenant: tenant.id, offset };
                                }
                            )
                        );
                    }
                ).pipe(
                    Effect.mapInputContext(
                        /** Strip the shared SQL transaction tag while retaining the authenticated route. */ (
                            context: Context.Context<CurrentTenant>
                        ) => Context.omit(SqlClient.TransactionConnection)(context)
                    ),
                    Effect.catchTag('SqlError', unavailable)
                ),
            /** Use the primary-key range scan, with no volatile RPC result or unbounded backfill. */
            read: (input) =>
                Effect.gen(
                    /** Tenant predicates remain mandatory even if multiple trusted tenants share one physical database. */ function* () {
                        // The last consumed offset is exclusive; ordered bounded pages must not replay it on reconnect.
                        const value = yield* decode(OutputRead, input);
                        const tenant = yield* CurrentTenant;
                        const sql = yield* resolve(tenant.id);
                        const rows = yield* sql`SELECT event_id, "offset", payload FROM agent_output_event
                WHERE tenant_id = ${tenant.id} AND run_id = ${value.runId} AND "offset" > ${value.after}
                ORDER BY "offset" LIMIT ${value.limit}`;
                        return yield* Effect.forEach(
                            rows,
                            /** Decode persisted rows without disclosing corruption or raw driver diagnostics. */ (
                                raw
                            ): Effect.Effect<OutputEvent, AgentOutputFailure> =>
                                Effect.gen(
                                    /** Stored text is parsed through the same closed payload schema as append. */ function* () {
                                        // Persistence is not a trust bypass: corrupt offsets or payloads fail the page instead of leaking raw rows.
                                        const row = yield* decode(Stored, raw);
                                        return {
                                            runId: value.runId,
                                            eventId: row.event_id,
                                            tenant: tenant.id,
                                            offset: yield* decode(OutputOffset, Number(row.offset)),
                                            payload: yield* decode(Schema.parseJson(OutputPayload), row.payload),
                                        };
                                    }
                                )
                        );
                    }
                ).pipe(
                    Effect.mapInputContext(
                        /** Reads observe committed output, never a transaction inherited from another client. */ (
                            context: Context.Context<CurrentTenant>
                        ) => Context.omit(SqlClient.TransactionConnection)(context)
                    ),
                    Effect.catchTag('SqlError', unavailable)
                ),
        })
    );
