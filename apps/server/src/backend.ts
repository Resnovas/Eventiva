/**
 * @file apps/server/src/backend.ts
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

import { Authorizer, Caller } from '@eventiva/contracts/caller';
import { ApprovalStore } from '@eventiva/contracts/approval';
import { IdentityStore } from '@eventiva/contracts/identity';
import { Flags } from '@eventiva/contracts/flags';
import { CurrentRunFence, CurrentTenant, Storage } from '@eventiva/contracts/storage';
import { TenantSqlRouter } from '@eventiva/integrations.sql/router';
import { approvalServices } from '@eventiva/runtime/approval';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { identitySecurity } from '@eventiva/runtime/identity';
import {
    Approvals,
    AuditUnavailable,
    ExecutionPolicy,
    IdentityResolver,
    InvocationDenied,
    InputDigest,
    canonicalJson,
} from '@eventiva/runtime/invocation';
import { durable } from '@eventiva/runtime/storage';
import type { SocketServer } from '@effect/platform/SocketServer';
import type { WorkflowEngine } from '@effect/workflow/WorkflowEngine';
import { SqlClient } from '@effect/sql';
import { Context, Effect, Layer, Option, Schema, Scope } from 'effect';
import { clusterRunner } from './cluster.ts';
import { ClusterActionExecutor } from './cluster-actions.ts';
import type { DeploymentProfile } from './cluster-profile.ts';
import { AgentRunInput } from './agent-run.ts';
import { ModuleRunCatalog, registerRunArtifact } from './module-run.ts';
import { approvalConsentAuthorizer, registerApprovalConsent } from './approval-consent.ts';
import { IdentitySessionPolicy, SessionPolicyFailure, identitySessionPolicy } from './identity-session-policy.ts';

/**
 * Compute membership is independent of authenticated tenant database routing.
 * Supply a shared compute SQL client and a trusted TenantRouter. Each call
 * builds its host INSIDE the route, binding module writes and Integrity to
 * the same Storage and transaction. No per-tenant process or driver is required.
 * Identity/policy are built inside each route from an explicit trusted layer;
 * approvals and durable acceptance share that route's tenant SQL client.
 * The returned backend exposes only Cluster services, never a local executor.
 */
export const backend = <E, WE = never, WR = never>(
    profile: DeploymentProfile,
    /** Register tenant-bound handlers in the routed storage scope before dispatching each invocation. */
    initialize: (host: ActionHost['Type']) => Effect.Effect<void, E, Storage | CurrentTenant | Scope.Scope>,
    registerWorkflows: Effect.Effect<void, WE, WR | WorkflowEngine | Scope.Scope> = Effect.void,
    /** Module-owned target policy must be constructed in the routed identity scope, not captured as global tenant authority. */
    security: Layer.Layer<
        Authorizer | IdentityResolver | ExecutionPolicy,
        InvocationDenied,
        IdentityStore | CurrentTenant
    > = identitySecurity,
    /** Trusted routed policy only; the absent source denies consent without selecting a duration or configuration authority. */
    sessionPolicy: Layer.Layer<IdentitySessionPolicy, never, CurrentTenant> = identitySessionPolicy(
        Effect.fail(new SessionPolicyFailure({ reason: 'unavailable' }))
    ),
    /** Trusted composition may retain an open listener across address discovery and runner registration. */
    preboundSocket?: SocketServer['Type']
) =>
    Layer.scopedContext(
        Effect.gen(
            /** Capture shared policy services and install the routed executor in the Cluster runner layer. */ function* () {
                // Never retain a tenant, caller or transaction from the layer's acquisition context across requests.
                const dependencies = (yield* Effect.context<Flags | InputDigest>()).pipe(
                    Context.omit(
                        Caller,
                        Storage,
                        CurrentTenant,
                        Scope.Scope,
                        SqlClient.SqlClient,
                        SqlClient.TransactionConnection,
                        IdentityStore,
                        ApprovalStore,
                        Authorizer,
                        IdentityResolver,
                        ExecutionPolicy,
                        Approvals
                    )
                );
                const routing = yield* TenantSqlRouter;
                const catalog = yield* Effect.serviceOption(ModuleRunCatalog);
                const routedIdentity = Layer.succeed(IdentityResolver, {
                    /** Both Cluster sender and receiver refresh identity on its explicitly resolved tenant client, never compute SQL. */
                    resolve: (caller) => {
                        // Persisted RPC identity is only a claim; route and refresh it before exposing any cached result.
                        // Without a tenant no durable audit route exists; preserve the public backend denial even at this earlier gate.
                        if (caller.tenant === undefined)
                            return Effect.fail(
                                new InvocationDenied({ action: '<cluster>', reason: 'audit-unavailable' })
                            );
                        return routing
                            .run(
                                caller.tenant,
                                Effect.flatMap(
                                    IdentityResolver,
                                    /** Resolve through the route-built identity policy before any persisted RPC result can be disclosed. */
                                    (resolver) => resolver.resolve(caller)
                                ).pipe(Effect.provide(security))
                            )
                            .pipe(
                                Effect.provideService(Caller, caller),
                                Effect.mapInputContext(
                                    /** Discard bootstrap capabilities while preserving no additional service requirement on identity resolution. */
                                    (environment: Context.Context<never>) =>
                                        environment.pipe(
                                            Context.omit(
                                                CurrentTenant,
                                                Storage,
                                                IdentityStore,
                                                ApprovalStore,
                                                SqlClient.SqlClient,
                                                SqlClient.TransactionConnection
                                            )
                                        )
                                ),
                                Effect.mapError(
                                    /** Routing and identity details remain behind a fixed transport admission denial. */
                                    () => new InvocationDenied({ action: '<cluster>', reason: 'identity-unavailable' })
                                )
                            );
                    },
                });
                /** Require an authenticated tenant, rebuild its host inside routing, and fail closed on execution setup errors. */
                const execute: ClusterActionExecutor['Type']['execute'] = (action, input, intent) =>
                    Effect.gen(
                        /** Isolate each invocation's storage scope from the caller's ambient storage services. */ function* () {
                            // The tenant comes from resolved identity, never a compute entity key or inherited connection.
                            const caller = yield* Caller;
                            if (caller.tenant === undefined) return yield* new AuditUnavailable({ action });
                            return yield* routing
                                .run(
                                    caller.tenant,
                                    Effect.gen(
                                        /** Bind host integrity and module initialization to the router-selected storage. */ function* () {
                                            // Constructing inside the route keeps writes and host integrity on the same tenant service.
                                            const basePolicies = (yield* Layer.build(security)).pipe(
                                                Context.pick(Authorizer, IdentityResolver, ExecutionPolicy)
                                            );
                                            const policies = basePolicies.pipe(
                                                Context.add(
                                                    Authorizer,
                                                    approvalConsentAuthorizer(Context.get(basePolicies, Authorizer))
                                                )
                                            );
                                            const approvals = approvalServices.pipe(
                                                Layer.provide(Layer.succeedContext(policies))
                                            );
                                            const hostContext = yield* Layer.build(
                                                ActionHostLive.pipe(
                                                    Layer.provide(durable),
                                                    Layer.provide(approvals),
                                                    Layer.provide(Layer.succeedContext(policies))
                                                )
                                            );
                                            const host = Context.get(hostContext, ActionHost);
                                            yield* registerApprovalConsent(host).pipe(
                                                Effect.provide(policies),
                                                Effect.provide(sessionPolicy)
                                            );
                                            const attempt = yield* Effect.serviceOption(CurrentRunFence);
                                            if (Option.isNone(attempt)) yield* initialize(host);
                                            else {
                                                // A transported token grants no tenant or principal authority and chooses no executable.
                                                const fence = attempt.value;
                                                if (fence.tenant !== caller.tenant || Option.isNone(catalog))
                                                    return yield* new AuditUnavailable({ action });
                                                const storage = yield* Storage;
                                                const stored = yield* storage.getRun(fence.tenant, fence.runId);
                                                if (stored === undefined)
                                                    return yield* new AuditUnavailable({ action });
                                                const accepted = yield* Schema.decodeUnknown(AgentRunInput)(
                                                    stored.input
                                                );
                                                if (
                                                    accepted.definition !== 'module-v1' ||
                                                    (yield* canonicalJson(accepted.caller)) !==
                                                        (yield* canonicalJson(caller))
                                                )
                                                    return yield* new AuditUnavailable({ action });
                                                const step = accepted.steps.find(
                                                    /** Bind the attempt to a recorded action and its stable logical step key, not arbitrary transport work. */
                                                    (step, index) =>
                                                        step._tag === 'Action' &&
                                                        step.action === action &&
                                                        intent?.idempotencyKey === `${fence.runId}:${index + 1}`
                                                );
                                                if (!step) return yield* new AuditUnavailable({ action });
                                                yield* storage.fence(fence, Effect.void);
                                                yield* registerRunArtifact(host, stored.snapshot).pipe(
                                                    Effect.provideService(ModuleRunCatalog, catalog.value)
                                                );
                                            }
                                            return yield* host.execute(action, input, intent);
                                        }
                                    )
                                )
                                .pipe(
                                    Effect.scoped,
                                    Effect.provide(dependencies),
                                    Effect.mapError(
                                        /** Conceal routing/setup details behind the host's audit-unavailable boundary. */ () =>
                                            new AuditUnavailable({ action })
                                    )
                                );
                        }
                    ).pipe(
                        Effect.mapInputContext(
                            Context.omit(
                                Storage,
                                CurrentTenant,
                                IdentityStore,
                                ApprovalStore,
                                SqlClient.SqlClient,
                                SqlClient.TransactionConnection
                            )
                        )
                    );
                return yield* Layer.build(
                    clusterRunner(profile, registerWorkflows, preboundSocket).pipe(
                        Layer.provide(Layer.succeed(ClusterActionExecutor, { execute })),
                        Layer.provide(routedIdentity)
                    )
                );
            }
        )
    );
