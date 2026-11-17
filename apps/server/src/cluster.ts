/**
 * @file apps/server/src/cluster.ts
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

import * as RunnerHealth from '@effect/cluster/RunnerHealth';
import * as ClusterWorkflowEngine from '@effect/cluster/ClusterWorkflowEngine';
import { RunnerStorage } from '@effect/cluster/RunnerStorage';
import * as Runners from '@effect/cluster/Runners';
import { Sharding } from '@effect/cluster/Sharding';
import * as ShardId from '@effect/cluster/ShardId';
import * as ShardingConfig from '@effect/cluster/ShardingConfig';
import * as SocketRunner from '@effect/cluster/SocketRunner';
import * as SqlMessageStorage from '@effect/cluster/SqlMessageStorage';
import * as SqlRunnerStorage from '@effect/cluster/SqlRunnerStorage';
import { NodeClusterSocket } from '@effect/platform-node';
import * as RpcSerialization from '@effect/rpc/RpcSerialization';
import { Context, Deferred, Effect, Layer, Scope } from 'effect';
import type { WorkflowEngine } from '@effect/workflow/WorkflowEngine';
import { ClusterActionsLive } from './cluster-actions.ts';
import { type DeploymentProfile, shardingConfig } from './cluster-profile.ts';

/** Observe this runner and its compute group without exposing runner storage mutations. */
export class ClusterStatus extends Context.Tag('@eventiva/server/ClusterStatus')<
    ClusterStatus,
    { readonly snapshot: Effect.Effect<ClusterSnapshot> }
>() {}

/** Point-in-time local ownership and group health; unavailable distinguishes storage failure from zero healthy peers. */
export interface ClusterSnapshot {
    readonly status: 'healthy' | 'degraded' | 'draining' | 'unavailable';
    readonly expectedRunners: number;
    readonly healthyRunners: number;
    readonly registeredRunners: number;
    readonly ownedShards: ReadonlyArray<number>;
    readonly activeEntities: number;
    readonly mailboxCapacity: number;
    readonly shardWeight: number;
}

/** Storage failure is unavailable, not an empty-but-healthy cluster. */
export const clusterStatus = (profile: DeploymentProfile) =>
    Layer.effect(
        ClusterStatus,
        Effect.gen(
            /** Capture storage, transport health and local shard ownership services for repeated snapshots. */ function* () {
                const storage = yield* RunnerStorage;
                const health = yield* RunnerHealth.RunnerHealth;
                const sharding = yield* Sharding;
                return {
                    snapshot: Effect.gen(
                        /** Sample local state, then bound peer health checks; convert storage failures to unavailable status. */ function* () {
                            // Preserve local ownership data even if shared membership storage cannot be queried.
                            const draining = yield* sharding.isShutdown;
                            const ownedShards = Array.from(
                                { length: profile.shards },
                                /** Cluster shard identifiers start at one. */ (_, i) => i + 1
                            ).filter(
                                /** Restrict ownership to the configured action group on this runner. */ (id) =>
                                    sharding.hasShardId(ShardId.make('eventiva-actions', id))
                            );
                            const activeEntities = yield* sharding.activeEntityCount;
                            const base = {
                                expectedRunners: profile.expectedRunners,
                                ownedShards,
                                activeEntities,
                                mailboxCapacity: profile.mailboxCapacity,
                                shardWeight: profile.weight,
                            };
                            return yield* Effect.gen(
                                /** Probe only action-group members marked healthy in storage, with bounded concurrency. */ function* () {
                                    // Membership alone is not liveness; storage health and a live transport probe must both succeed.
                                    const registered = (yield* storage.getRunners).filter(
                                        /** Other shard groups do not contribute to action capacity. */ ([runner]) =>
                                            runner.groups.includes('eventiva-actions')
                                    );
                                    const alive = yield* Effect.forEach(
                                        registered,
                                        /** Avoid probing runners already declared unhealthy by shared membership storage. */ ([
                                            runner,
                                            healthy
                                        ]) => (healthy ? health.isAlive(runner.address) : Effect.succeed(false)),
                                        { concurrency: 8 }
                                    );
                                    const healthyRunners = alive.filter(Boolean).length;
                                    return {
                                        ...base,
                                        registeredRunners: registered.length,
                                        healthyRunners,
                                        status: draining
                                            ? ('draining' as const)
                                            : healthyRunners >= profile.expectedRunners && ownedShards.length > 0
                                              ? ('healthy' as const)
                                              : ('degraded' as const),
                                    };
                                }
                            ).pipe(
                                Effect.catchAll(
                                    /** Fail status closed while retaining the separately sampled local metrics. */ () =>
                                        Effect.succeed({
                                            ...base,
                                            status: 'unavailable' as const,
                                            registeredRunners: 0,
                                            healthyRunners: 0,
                                        })
                                )
                            );
                        }
                    ).pipe(Effect.withSpan('cluster.status')),
                };
            }
        )
    );

/**
 * Common Node transport for EVERY edition. Requires an external SQL client;
 * there is deliberately no memory/noop fallback. All settings are validated
 * before this layer is built. Lease rows avoid session advisory ownership.
 */
export const clusterRunner = <E = never, R = never>(
    profile: DeploymentProfile,
    registerWorkflows: Effect.Effect<void, E, R | WorkflowEngine | Scope.Scope> = Effect.void
) =>
    Layer.unwrapEffect(
        Effect.gen(
            /** Compose SQL-backed transport and gate runner advertisement on handler registration. */ function* () {
                const ready = yield* Deferred.make<void>();
                const config = ShardingConfig.layer(shardingConfig(profile));
                const protocol = NodeClusterSocket.layerClientProtocol.pipe(Layer.provide(config));
                const health = RunnerHealth.layerPing.pipe(Layer.provide(Runners.layerRpc), Layer.provide(protocol));
                // Sharding starts its background loops during acquisition. Do not advertise
                // or acquire work until both action and workflow handlers are registered.
                const runners = Layer.effect(
                    RunnerStorage,
                    Effect.map(
                        RunnerStorage,
                        /** Delay membership operations until action and workflow registration completes. */ (
                            storage
                        ) => ({
                            ...storage,
                            /** Prevent this runner from advertising capacity before its handlers exist. */
                            register: (runner, healthy) =>
                                Deferred.await(ready).pipe(Effect.zipRight(storage.register(runner, healthy))),
                            getRunners: Deferred.await(ready).pipe(Effect.zipRight(storage.getRunners)),
                        })
                    )
                ).pipe(Layer.provide(SqlRunnerStorage.layer));
                const storage = Layer.mergeAll(runners, SqlMessageStorage.layer).pipe(Layer.provide(config));
                const transport = SocketRunner.layer.pipe(
                    Layer.provide(NodeClusterSocket.layerSocketServer),
                    Layer.provideMerge(health),
                    Layer.provide(protocol),
                    Layer.provideMerge(storage),
                    Layer.provide(config),
                    Layer.provide(RpcSerialization.layerNdjson)
                );
                const services = ClusterActionsLive.pipe(
                    Layer.provideMerge(
                        Layer.mergeAll(clusterStatus(profile), ClusterWorkflowEngine.layer).pipe(
                            Layer.provideMerge(transport)
                        )
                    )
                );
                return Layer.scopedContext(
                    Effect.gen(
                        /** Acquire handlers and workflow registrations before releasing the runner readiness barrier. */ function* () {
                            // A registration failure must leave readiness closed, so background sharding cannot acquire work.
                            const context = yield* Layer.build(services);
                            yield* registerWorkflows.pipe(Effect.provide(context));
                            yield* Deferred.succeed(ready, undefined);
                            return context;
                        }
                    )
                );
            }
        )
    );
