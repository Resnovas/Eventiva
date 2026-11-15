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
import { Context, Effect, Layer } from 'effect';
import { ClusterActionsLive } from './cluster-actions.ts';
import { type DeploymentProfile, shardingConfig } from './cluster-profile.ts';

export class ClusterStatus extends Context.Tag('@eventiva/server/ClusterStatus')<
    ClusterStatus,
    { readonly snapshot: Effect.Effect<ClusterSnapshot> }
>() {}

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
        Effect.gen(function* () {
            const storage = yield* RunnerStorage;
            const health = yield* RunnerHealth.RunnerHealth;
            const sharding = yield* Sharding;
            return {
                snapshot: Effect.gen(function* () {
                    const draining = yield* sharding.isShutdown;
                    const ownedShards = Array.from({ length: profile.shards }, (_, i) => i + 1).filter((id) =>
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
                    return yield* Effect.gen(function* () {
                        const registered = (yield* storage.getRunners).filter(([runner]) =>
                            runner.groups.includes('eventiva-actions')
                        );
                        const alive = yield* Effect.forEach(
                            registered,
                            ([runner, healthy]) => (healthy ? health.isAlive(runner.address) : Effect.succeed(false)),
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
                    }).pipe(
                        Effect.catchAll(() =>
                            Effect.succeed({
                                ...base,
                                status: 'unavailable' as const,
                                registeredRunners: 0,
                                healthyRunners: 0,
                            })
                        )
                    );
                }).pipe(Effect.withSpan('cluster.status')),
            };
        })
    );

/**
 * Common Node transport for EVERY edition. Requires an external SQL client;
 * there is deliberately no memory/noop fallback. All settings are validated
 * before this layer is built. Lease rows avoid session advisory ownership.
 */
export const clusterRunner = (profile: DeploymentProfile) => {
    const config = ShardingConfig.layer(shardingConfig(profile));
    const protocol = NodeClusterSocket.layerClientProtocol.pipe(Layer.provide(config));
    const health = RunnerHealth.layerPing.pipe(Layer.provide(Runners.layerRpc), Layer.provide(protocol));
    const storage = Layer.mergeAll(SqlRunnerStorage.layer, SqlMessageStorage.layer).pipe(Layer.provide(config));
    const transport = SocketRunner.layer.pipe(
        Layer.provide(NodeClusterSocket.layerSocketServer),
        Layer.provideMerge(health),
        Layer.provide(protocol),
        Layer.provideMerge(storage),
        Layer.provide(config),
        Layer.provide(RpcSerialization.layerNdjson)
    );
    return ClusterActionsLive.pipe(Layer.provideMerge(clusterStatus(profile).pipe(Layer.provideMerge(transport))));
};
