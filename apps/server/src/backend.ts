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
import { Flags } from '@eventiva/contracts/flags';
import { CurrentRunFence, CurrentTenant, Storage, TenantRouter } from '@eventiva/contracts/storage';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import {
    Approvals,
    AuditUnavailable,
    ExecutionPolicy,
    IdentityResolver,
    InputDigest,
    canonicalJson,
} from '@eventiva/runtime/invocation';
import { durable } from '@eventiva/runtime/storage';
import type { WorkflowEngine } from '@effect/workflow/WorkflowEngine';
import { SqlClient } from '@effect/sql';
import { Context, Effect, Layer, Option, Schema, Scope } from 'effect';
import { clusterRunner } from './cluster.ts';
import { ClusterActionExecutor } from './cluster-actions.ts';
import type { DeploymentProfile } from './cluster-profile.ts';
import { AgentRunInput } from './agent-run.ts';
import { ModuleRunCatalog, registerRunArtifact } from './module-run.ts';

/**
 * Compute membership is independent of authenticated tenant database routing.
 * Supply a shared compute SQL client and a trusted TenantRouter. Each call
 * builds its host INSIDE the route, binding module writes and Integrity to
 * the same Storage and transaction. No per-tenant process or driver is required.
 * Identity, policy, approvals and flags remain mandatory injected services.
 * The returned backend exposes only Cluster services, never a local executor.
 */
export const backend = <E, WE = never, WR = never>(
    profile: DeploymentProfile,
    /** Register tenant-bound handlers in the routed storage scope before dispatching each invocation. */
    initialize: (host: ActionHost['Type']) => Effect.Effect<void, E, Storage | CurrentTenant | Scope.Scope>,
    registerWorkflows: Effect.Effect<void, WE, WR | WorkflowEngine | Scope.Scope> = Effect.void
) =>
    Layer.scopedContext(
        Effect.gen(
            /** Capture shared policy services and install the routed executor in the Cluster runner layer. */ function* () {
                // Never retain a tenant, caller or transaction from the layer's acquisition context across requests.
                const dependencies = (yield* Effect.context<
                    Flags | Authorizer | IdentityResolver | InputDigest | ExecutionPolicy | Approvals
                >()).pipe(Context.omit(Caller, Storage, CurrentTenant, Scope.Scope, SqlClient.TransactionConnection));
                const routing = yield* TenantRouter;
                const catalog = yield* Effect.serviceOption(ModuleRunCatalog);
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
                                            const hostContext = yield* Layer.build(
                                                ActionHostLive.pipe(Layer.provide(durable))
                                            );
                                            const host = Context.get(hostContext, ActionHost);
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
                        Effect.mapInputContext(Context.omit(Storage, CurrentTenant, SqlClient.TransactionConnection))
                    );
                return yield* Layer.build(
                    clusterRunner(profile, registerWorkflows).pipe(
                        Layer.provide(Layer.succeed(ClusterActionExecutor, { execute }))
                    )
                );
            }
        )
    );
