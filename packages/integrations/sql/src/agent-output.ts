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
import { CurrentRunFence, CurrentTenant } from '@eventiva/contracts/storage';
import { Context, Effect, Layer, Option, Schema } from 'effect';
import { checkRunFence } from './storage.ts';

const Stored = Schema.Struct({
    event_id: Schema.String,
    offset: Schema.Union(Schema.String, Schema.Number),
    payload: Schema.String,
});
/**
 * Strip driver/parser details before errors can reach logs, RPC replies or telemetry.
 *
 * @returns An AgentOutputFailure with the `unavailable` reason and no driver detail.
 */
const unavailable = () => new AgentOutputFailure({ reason: 'unavailable' });
/**
 * Validate even typed callers, rejecting excess fields rather than silently persisting protected data.
 *
 * @template A - The decoded value.
 * @template I - The encoded form the schema accepts.
 * @template Input - The static type of the supplied value, which is still decoded as unknown.
 * @param schema - The exact schema the value must satisfy, with no excess properties.
 * @param value - The caller input or persisted row to decode.
 * @returns The decoded value.
 * @fails {AgentOutputFailure} With `invalid` when the value does not decode.
 */
const decode = <A, I, Input>(schema: Schema.Schema<A, I>, value: Input) =>
    Schema.decodeUnknown(schema)(value, { onExcessProperty: 'error' }).pipe(
        Effect.mapError(
            /**
             * Never attach the rejected value to a public failure.
             *
             * @returns An AgentOutputFailure with the `invalid` reason.
             */
            () => new AgentOutputFailure({ reason: 'invalid' })
        )
    );
/**
 * Canonicalize only the closed payload union so property insertion order cannot create retry conflicts.
 *
 * @param payload - The decoded output payload, either text or a completed step.
 * @returns The payload as JSON with a fixed property order.
 */
const payloadJson = (payload: typeof OutputPayload.Type) =>
    JSON.stringify(
        payload._tag === 'Text'
            ? { _tag: 'Text', text: payload.text }
            : { _tag: 'StepCompleted', stepIndex: payload.stepIndex }
    );

/**
 * Resolve tenant clients from trusted composition only; no database URL or tenant selector is accepted in event input.
 *
 * @param resolve - Trusted composition's lookup from tenant id to that tenant's SQL client.
 * @returns A layer providing the agent output log for routed tenants.
 * @since 0.0.1
 * @example
 * const layer = agentOutputLog(() => Effect.succeed(sql));
 */
export const agentOutputLog = (
    /** Supply only the routed tenant capability; unknown tenants fail closed without provisioning. */
    resolve: (tenant: TenantId) => Effect.Effect<SqlClient.SqlClient, AgentOutputFailure>
) =>
    Layer.succeed(
        AgentOutputLog,
        AgentOutputLog.of({
            /**
             * Serialize each tenant/run allocator, deduplicate before incrementing and commit event/counter together.
             *
             * @param input - The append request naming the run, the caller's event id and the payload.
             * @returns The stored event with its tenant and allocated offset; a matching retry returns the original offset.
             * @fails {AgentOutputFailure} With `invalid` for malformed input, `conflict` when the event id was stored with a different payload, or `unavailable` for a stale run fence, an unfenced pinned module run, an exhausted offset counter or an SQL failure.
             */
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
                                    // Output deliberately owns an independent transaction: the fence must be checked HERE, not in its caller.
                                    const fence = yield* Effect.serviceOption(CurrentRunFence);
                                    if (Option.isSome(fence)) {
                                        if (fence.value.tenant !== tenant.id || fence.value.runId !== value.runId)
                                            return yield* unavailable();
                                        yield* checkRunFence(sql, fence.value).pipe(Effect.mapError(unavailable));
                                    } else {
                                        const pinned =
                                            yield* sql`SELECT run_id FROM module_run_snapshot WHERE tenant_id = ${tenant.id} AND run_id = ${value.runId}`;
                                        // Scripted output remains compatible; omitting the token can never downgrade a recorded module run.
                                        if (pinned.length !== 0) return yield* unavailable();
                                    }
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
                        /**
                         * Strip the shared SQL transaction tag while retaining the authenticated route.
                         *
                         * @param context - The caller's context, carrying the authenticated tenant.
                         * @returns The same context without any inherited SQL transaction connection.
                         */
                        (context: Context.Context<CurrentTenant>) =>
                            Context.omit(SqlClient.TransactionConnection)(context)
                    ),
                    Effect.catchTag('SqlError', unavailable)
                ),
            /**
             * Use the primary-key range scan, with no volatile RPC result or unbounded backfill.
             *
             * @param input - The read request naming the run, the exclusive `after` offset and the page limit.
             * @returns Up to `limit` events after the given offset, in offset order.
             * @fails {AgentOutputFailure} With `invalid` for malformed input or corrupt stored rows, or `unavailable` when SQL fails.
             */
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
                            /**
                             * Decode persisted rows without disclosing corruption or raw driver diagnostics.
                             *
                             * @param raw - One row returned by the page query.
                             * @returns The decoded output event for the routed tenant.
                             */
                            (raw): Effect.Effect<OutputEvent, AgentOutputFailure> =>
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
                        /**
                         * Reads observe committed output, never a transaction inherited from another client.
                         *
                         * @param context - The caller's context, carrying the authenticated tenant.
                         * @returns The same context without any inherited SQL transaction connection.
                         */
                        (context: Context.Context<CurrentTenant>) =>
                            Context.omit(SqlClient.TransactionConnection)(context)
                    ),
                    Effect.catchTag('SqlError', unavailable)
                ),
        })
    );
