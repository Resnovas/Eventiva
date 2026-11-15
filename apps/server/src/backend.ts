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
import { CurrentTenant, Storage, TenantRouter } from '@eventiva/contracts/storage';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import {
    Approvals,
    AuditUnavailable,
    ExecutionPolicy,
    IdentityResolver,
    InputDigest,
} from '@eventiva/runtime/invocation';
import { durable } from '@eventiva/runtime/storage';
import type { WorkflowEngine } from '@effect/workflow/WorkflowEngine';
import { SqlClient } from '@effect/sql';
import { Context, Effect, Layer, Scope } from 'effect';
import { clusterRunner } from './cluster.ts';
import { ClusterActionExecutor } from './cluster-actions.ts';
import type { DeploymentProfile } from './cluster-profile.ts';

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
    initialize: (host: ActionHost['Type']) => Effect.Effect<void, E, Storage | CurrentTenant | Scope.Scope>,
    registerWorkflows: Effect.Effect<void, WE, WR | WorkflowEngine | Scope.Scope> = Effect.void
) =>
    Layer.scopedContext(
        Effect.gen(function* () {
            const dependencies = (yield* Effect.context<
                Flags | Authorizer | IdentityResolver | InputDigest | ExecutionPolicy | Approvals
            >()).pipe(Context.omit(Caller, Storage, CurrentTenant, Scope.Scope, SqlClient.TransactionConnection));
            const routing = yield* TenantRouter;
            const execute: ClusterActionExecutor['Type']['execute'] = (action, input, intent) =>
                Effect.gen(function* () {
                    const caller = yield* Caller;
                    if (caller.tenant === undefined) return yield* new AuditUnavailable({ action });
                    return yield* routing
                        .run(
                            caller.tenant,
                            Effect.gen(function* () {
                                const hostContext = yield* Layer.build(ActionHostLive.pipe(Layer.provide(durable)));
                                const host = Context.get(hostContext, ActionHost);
                                yield* initialize(host);
                                return yield* host.execute(action, input, intent);
                            })
                        )
                        .pipe(
                            Effect.scoped,
                            Effect.provide(dependencies),
                            Effect.mapError(() => new AuditUnavailable({ action }))
                        );
                }).pipe(Effect.mapInputContext(Context.omit(Storage, CurrentTenant, SqlClient.TransactionConnection)));
            return yield* Layer.build(
                clusterRunner(profile, registerWorkflows).pipe(
                    Layer.provide(Layer.succeed(ClusterActionExecutor, { execute }))
                )
            );
        })
    );
