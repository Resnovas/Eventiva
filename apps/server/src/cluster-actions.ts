/**
 * @file apps/server/src/cluster-actions.ts
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

import * as Entity from '@effect/cluster/Entity';
import { Persisted, ShardGroup } from '@effect/cluster/ClusterSchema';
import * as Rpc from '@effect/rpc/Rpc';
import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Receipt } from '@eventiva/contracts/receipt';
import { JsonValue } from '@eventiva/contracts/storage';
import type { ActionHost } from '@eventiva/runtime/host';
import { IdentityResolver } from '@eventiva/runtime/invocation';
import { Context, Data, Effect, Layer, Schema } from 'effect';

const Intent = Schema.Struct({
    idempotencyKey: Schema.NonEmptyString,
    approvalId: Schema.optional(Schema.String),
    mode: Schema.optional(Schema.Literal('online', 'offline-intent', 'scheduled')),
    notBefore: Schema.optional(Schema.Number),
    deadline: Schema.optional(Schema.Number),
    expectedVersion: Schema.optional(Schema.String),
    expectedState: Schema.optional(Schema.String),
});

export const ClusterInvocation = Schema.Struct({
    caller: CallerIdentity,
    entityKey: Schema.NonEmptyString,
    action: Schema.NonEmptyString,
    input: JsonValue,
    intent: Intent,
});
export type ClusterInvocation = typeof ClusterInvocation.Type;

/** Public-safe Cluster rejection; underlying identity, audit and invocation errors do not cross transport. */
export class ClusterActionDenied extends Data.TaggedError('ClusterActionDenied')<{
    readonly reason: string;
}> {}
const Denied = Schema.Struct({ _tag: Schema.Literal('ClusterActionDenied'), reason: Schema.String });

/** Backend routing boundary. Every implementation delegates to ActionHost.execute. */
export class ClusterActionExecutor extends Context.Tag('@eventiva/server/ClusterActionExecutor')<
    ClusterActionExecutor,
    { readonly execute: ActionHost['Type']['execute'] }
>() {}

/** This identity namespaces compute ordering only. It is never a database selector. */
export const entityId = (caller: CallerIdentity, key: string): string => JSON.stringify([caller.tenant ?? null, key]);

const ActionEntity = Entity.make('EventivaAction', [
    Rpc.make('Execute', {
        payload: ClusterInvocation,
        success: Schema.Struct({
            output: JsonValue,
            receipt: Receipt,
            replayed: Schema.Boolean,
            audit: Schema.Literal('durable', 'spooled'),
        }),
        error: Denied,
    }).annotate(Persisted, true),
]).annotate(
    ShardGroup,
    /** Keep action entities in the runner's explicitly configured shard group. */ () => 'eventiva-actions'
);

/** Re-resolve identity on the receiving runner before entering the SAME authorized ActionHost. */
export const receive = (address: string, request: ClusterInvocation) =>
    Effect.gen(
        /** Reauthenticate the payload and expose a result only after routed host execution succeeds. */ function* () {
            // Persisted transport identity is a claim, not authority; validate it again on the receiving runner.
            const resolver = yield* IdentityResolver;
            const caller = yield* resolver
                .resolve(request.caller)
                .pipe(
                    Effect.mapError(
                        /** Hide resolver internals from the transport client. */ () =>
                            new ClusterActionDenied({ reason: 'identity-unavailable' })
                    )
                );
            if (caller.tenant !== request.caller.tenant || entityId(caller, request.entityKey) !== address)
                return yield* new ClusterActionDenied({ reason: 'tenant-route-mismatch' });
            const host = yield* ClusterActionExecutor;
            const result = yield* host.execute(request.action, request.input, request.intent).pipe(
                Effect.provideService(Caller, caller),
                Effect.mapError(
                    /** Reject host setup or audit failure without leaking backend diagnostics. */ () =>
                        new ClusterActionDenied({ reason: 'audit-unavailable' })
                )
            );
            const output = yield* result.result.pipe(
                Effect.mapError(
                    /** Convert a failed action result to the bounded wire rejection. */ () =>
                        new ClusterActionDenied({ reason: 'invocation-denied' })
                )
            );
            return { output, receipt: result.receipt, replayed: result.replayed, audit: result.audit };
        }
    ).pipe(Effect.withSpan('cluster.action.receive'));

/** Common composition always includes this registration; readiness still needs real-stack validation. */
export const ActionEntityLive = ActionEntity.toLayer(
    Effect.gen(
        /** Capture this entity's address and receiver dependencies for serialized requests. */ function* () {
            const address = yield* Entity.CurrentAddress;
            const context = yield* Effect.context<ClusterActionExecutor | IdentityResolver>();
            return {
                /** Use the actual entity address, not an address supplied in the request payload. */ Execute: ({
                    payload
                }) => receive(address.entityId, payload).pipe(Effect.provide(context))
            };
        }
    ),
    { concurrency: 1 }
);

const makeClusterActions = Effect.gen(
    /** Capture the Cluster client and identity resolver once for the sender service. */ function* () {
        const client = yield* ActionEntity.client;
        const resolver = yield* IdentityResolver;
        return {
            /** Resolve the caller before selecting its compute mailbox; the receiver independently authenticates again. */
            execute: (request: ClusterInvocation) =>
                Effect.gen(
                    /** Send only a tenant-consistent canonical identity to the persisted entity RPC. */ function* () {
                        // Refuse tenant changes during resolution before deriving the compute-ordering key.
                        const caller = yield* resolver.resolve(request.caller);
                        if (caller.tenant !== request.caller.tenant)
                            return yield* new ClusterActionDenied({ reason: 'tenant-route-mismatch' });
                        return yield* client(entityId(caller, request.entityKey)).Execute({ ...request, caller });
                    }
                ).pipe(Effect.withSpan('cluster.action.send')),
        };
    }
);

/** Sender-facing service for authenticated persisted Cluster action dispatch, not direct local execution. */
export class ClusterActions extends Context.Tag('@eventiva/server/ClusterActions')<
    ClusterActions,
    Effect.Effect.Success<typeof makeClusterActions>
>() {}

export const ClusterActionsLive = Layer.effect(ClusterActions, makeClusterActions).pipe(
    Layer.provideMerge(ActionEntityLive)
);
