/**
 * @file apps/server/tests/cluster.spec.ts
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

import { describe, expect, it } from '@effect/vitest';
import * as TestRunner from '@effect/cluster/TestRunner';
import { PersistenceError } from '@effect/cluster/ClusterError';
import { Runner } from '@effect/cluster/Runner';
import { RunnerAddress } from '@effect/cluster/RunnerAddress';
import * as RunnerHealth from '@effect/cluster/RunnerHealth';
import * as RunnerStorage from '@effect/cluster/RunnerStorage';
import { Sharding } from '@effect/cluster/Sharding';
import * as ShardingLayer from '@effect/cluster/Sharding';
import * as ShardingConfig from '@effect/cluster/ShardingConfig';
import * as MessageStorage from '@effect/cluster/MessageStorage';
import * as Runners from '@effect/cluster/Runners';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import { define } from '@eventiva/contracts/action';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { IdentityResolver } from '@eventiva/runtime/invocation';
import { makeTestOnlyHarness } from '@eventiva/runtime/testing';
import { implement } from '@eventiva/runtime/action';
import { ConfigProvider, Context, Effect, Either, Layer, Ref, Schema } from 'effect';
import {
    ClusterActionExecutor,
    ClusterActions,
    ClusterActionsLive,
    ClusterInvocation,
    entityId,
    receive,
} from '../src/cluster-actions.ts';
import { DeploymentProfile, deploymentProfile, shardingConfig } from '../src/cluster-profile.ts';
import { ClusterStatus, clusterRunner, clusterStatus } from '../src/cluster.ts';

const caller = {
    subject: SubjectId.make('0193a4f0-0000-7000-8000-000000000001'),
    session: SessionId.make('0193a4f0-0000-7000-8000-000000000002'),
    tenant: TenantId.make('0193a4f0-0000-7000-8000-000000000003'),
    kind: 'human' as const,
};
const request: ClusterInvocation = {
    caller,
    entityKey: 'order:7',
    action: 'fixture.change',
    input: { value: 7 },
    intent: { idempotencyKey: 'business-key' },
};

describe('deployment profiles', () => {
    it.effect('defaults to one SQL-backed community runner and two cloud runners', () =>
        Effect.gen(function* () {
            const community = yield* deploymentProfile.pipe(
                Effect.withConfigProvider(ConfigProvider.fromMap(new Map()))
            );
            const cloud = yield* Schema.decodeUnknown(DeploymentProfile)({ edition: 'cloud' });
            expect(community.expectedRunners).toBe(1);
            expect(cloud.expectedRunners).toBe(2);
            expect(community.storage).toBe('sql');
            expect(cloud.storage).toBe('sql');
            expect(Layer.isLayer(clusterRunner(community))).toBe(true);
            expect(Layer.isLayer(clusterRunner(cloud))).toBe(true);
        })
    );

    it('rejects unsafe topology, storage, ports, lease bounds and insufficient shards', () => {
        for (const invalid of [
            { edition: 'local' },
            { edition: 'cloud', expectedRunners: 1 },
            { edition: 'community', expectedRunners: 0 },
            { edition: 'community', port: 65536 },
            { edition: 'community', port: 0 },
            { edition: 'community', shards: 1.5 },
            { edition: 'community', storage: 'local' },
            { edition: 'community', weight: 0 },
            { edition: 'community', disableCluster: true },
            { edition: 'community', lockRefreshMs: 10000, lockExpiryMs: 30000 },
            { edition: 'cloud', expectedRunners: 3, shards: 2 },
        ])
            expect(Either.isLeft(Schema.decodeUnknownEither(DeploymentProfile)(invalid))).toBe(true);
    });

    it.effect('accepts explicit self-hosted scale and maps every supported setting without env overrides', () =>
        Effect.gen(function* () {
            const profile = yield* Schema.decodeUnknown(DeploymentProfile)({
                edition: 'community',
                expectedRunners: 3,
                host: 'runner-a',
                listenHost: '0.0.0.0',
                port: 34432,
                shards: 24,
                weight: 2,
                mailboxCapacity: 123,
                lockRefreshMs: 100,
                lockExpiryMs: 301,
                assignmentRefreshMs: 200,
                healthCheckMs: 400,
                drainMs: 500,
                messagePollMs: 60,
                replyPollMs: 70,
            });
            expect(shardingConfig(profile)).toMatchObject({
                runnerAddress: { _tag: 'Some', value: { host: 'runner-a', port: 34432 } },
                runnerListenAddress: { _tag: 'Some', value: { host: '0.0.0.0', port: 34432 } },
                shardsPerGroup: 24,
                runnerShardWeight: 2,
                entityMailboxCapacity: 123,
                shardLockRefreshInterval: 100,
                shardLockExpiration: 301,
                refreshAssignmentsInterval: 200,
                runnerHealthCheckInterval: 400,
                entityTerminationTimeout: 500,
                entityMessagePollInterval: 60,
                entityReplyPollInterval: 70,
                shardLockDisableAdvisory: true,
                assignedShardGroups: ['eventiva-actions'],
                availableShardGroups: ['eventiva-actions'],
            });
        })
    );

    it.effect('fails configuration instead of silently selecting local execution', () =>
        Effect.gen(function* () {
            for (const value of ['{', '{"edition":"cloud","expectedRunners":1}']) {
                const result = yield* deploymentProfile.pipe(
                    Effect.withConfigProvider(ConfigProvider.fromMap(new Map([['EVENTIVA_CLUSTER_PROFILE', value]]))),
                    Effect.either
                );
                expect(Either.isLeft(result)).toBe(true);
            }
        })
    );
});

// These use the explicitly volatile runtime conformance fixture. They prove
// dispatch policy only, NEVER independent-runner ownership or durable recovery.
const fixture = Effect.gen(function* () {
    const h = yield* makeTestOnlyHarness(caller);
    const hostContext = yield* Layer.build(
        ActionHostLive.pipe(Layer.provide(h.TestOnly), Layer.provide(FlagsSafeDefaults))
    );
    const host = Context.get(hostContext, ActionHost);
    const context = Context.add(hostContext, ClusterActionExecutor, { execute: host.execute });
    const action = define('fixture.change', {
        version: 1,
        description: 'Cluster dispatch conformance.',
        input: Schema.Struct({ value: Schema.Number }),
        output: Schema.Number,
        permission: 'fixture.change',
        sideEffect: 'write',
        offline: 'queued',
    });
    yield* host.register({
        manifest: {
            format: 1,
            id: 'fixture',
            version: '1.0.0',
            description: 'Fixture.',
            actions: [action.name],
            flags: [],
        },
        actions: [implement(action, ({ value }) => h.ledger.stage('domain', value).pipe(Effect.as(value)))],
    });
    const invoke = (value = request, address = entityId(value.caller, value.entityKey)) =>
        receive(address, value).pipe(Effect.provide(context), Effect.provide(h.TestOnly));
    return { h, invoke, context };
});

describe('one authorized dispatch boundary', () => {
    it('namespaces entity identities by tenant without delimiter collisions', () => {
        expect(entityId(caller, 'a:b')).not.toBe(
            entityId({ ...caller, tenant: TenantId.make('0193a4f0-0000-7000-8000-000000000004') }, 'a:b')
        );
        expect(entityId({ ...caller, tenant: undefined }, 'a:b')).not.toBe(entityId(caller, 'a:b'));
        expect(Either.isLeft(Schema.decodeUnknownEither(ClusterInvocation)({ ...request, intent: {} }))).toBe(true);
    });

    it.scoped('preserves host receipts and A1 business dedup while rechecking every new invocation', () =>
        Effect.gen(function* () {
            const { h, invoke } = yield* fixture;
            const first = yield* invoke();
            const replay = yield* invoke();
            expect(first.output).toBe(7);
            expect(first.replayed).toBe(false);
            expect(replay.replayed).toBe(true);
            expect(replay.receipt.caller).toEqual(caller);
            expect(first.audit).toBe('durable');
            expect((yield* Ref.get(h.state)).domain).toEqual([7]);
            const conflict = yield* invoke({ ...request, input: { value: 8 } }).pipe(Effect.either);
            expect(conflict).toMatchObject({ _tag: 'Left', left: { reason: 'invocation-denied' } });
            yield* Ref.set(h.identityActive, false);
            expect(yield* invoke().pipe(Effect.either)).toMatchObject({
                _tag: 'Left',
                left: { reason: 'identity-unavailable' },
            });
        })
    );

    it.scoped('rejects cross-tenant addresses and refreshed tenant changes before handler execution', () =>
        Effect.gen(function* () {
            const { h, invoke } = yield* fixture;
            expect(yield* invoke(request, '["another-tenant","order:7"]').pipe(Effect.either)).toMatchObject({
                _tag: 'Left',
                left: { reason: 'tenant-route-mismatch' },
            });
            const changed = receive(entityId(caller, request.entityKey), request).pipe(
                Effect.provideService(IdentityResolver, {
                    resolve: () => Effect.succeed({ ...caller, tenant: undefined }),
                }),
                Effect.provideService(ClusterActionExecutor, {
                    execute: Context.get(
                        yield* Layer.build(
                            ActionHostLive.pipe(Layer.provide(h.TestOnly), Layer.provide(FlagsSafeDefaults))
                        ),
                        ActionHost
                    ).execute,
                }),
                Effect.either
            );
            expect(yield* changed).toMatchObject({ _tag: 'Left', left: { reason: 'tenant-route-mismatch' } });
            expect((yield* Ref.get(h.state)).domain).toEqual([]);
        })
    );

    it.scoped('fails closed on unavailable audit and on live permission revocation', () =>
        Effect.gen(function* () {
            const { h, invoke } = yield* fixture;
            yield* Ref.set(h.auditOnline, false);
            expect(yield* invoke().pipe(Effect.either)).toMatchObject({
                _tag: 'Left',
                left: { reason: 'audit-unavailable' },
            });
            expect((yield* Ref.get(h.state)).domain).toEqual([]);
            yield* Ref.set(h.auditOnline, true);
            yield* Ref.set(h.authorization, { invoke: false, input: true });
            expect(yield* invoke().pipe(Effect.either)).toMatchObject({
                _tag: 'Left',
                left: { reason: 'invocation-denied' },
            });
            expect((yield* Ref.get(h.state)).domain).toEqual([]);
        })
    );

    it.scopedLive('exercises the persisted entity protocol without confusing TestRunner with a process cluster', () =>
        Effect.gen(function* () {
            const { h, context } = yield* fixture;
            const profile = yield* Schema.decodeUnknown(DeploymentProfile)({
                edition: 'community',
                assignmentRefreshMs: 10,
            });
            const testRunner = ShardingLayer.layer.pipe(
                Layer.provideMerge(Runners.layerNoop),
                Layer.provideMerge(MessageStorage.layerMemory),
                Layer.provide(RunnerStorage.layerMemory),
                Layer.provide(RunnerHealth.layerNoop),
                Layer.provide(ShardingConfig.layer(shardingConfig(profile)))
            );
            const services = yield* Layer.build(
                ClusterActionsLive.pipe(
                    Layer.provide(testRunner),
                    Layer.provide(h.TestOnly),
                    Layer.provide(Layer.succeedContext(context))
                )
            );
            const actions = Context.get(services, ClusterActions);
            const first = yield* actions.execute(request);
            expect(first.output).toBe(7);
            const replay = yield* actions.execute(request);
            expect(replay.replayed).toBe(true);
            expect(replay.receipt.id).not.toBe(first.receipt.id);
            const conflict = yield* actions.execute({ ...request, input: { value: 99 } }).pipe(Effect.either);
            expect(conflict).toMatchObject({ _tag: 'Left', left: { reason: 'invocation-denied' } });
            yield* Ref.update(h.policy, (policy) => ({ ...policy, approval: 'confirm' as const }));
            expect(yield* actions.execute(request).pipe(Effect.either)).toMatchObject({
                _tag: 'Left',
                left: { reason: 'invocation-denied' },
            });
            yield* Ref.update(h.policy, (policy) => ({ ...policy, approval: 'none' as const }));
            yield* Ref.set(h.authorization, { invoke: false, input: true });
            expect(yield* actions.execute(request).pipe(Effect.either)).toMatchObject({
                _tag: 'Left',
                left: { reason: 'invocation-denied' },
            });
            yield* Ref.set(h.authorization, { invoke: true, input: true });
            yield* Ref.set(h.identity, { ...caller, tenant: undefined });
            expect(yield* actions.execute(request).pipe(Effect.either)).toMatchObject({
                _tag: 'Left',
                left: { reason: 'tenant-route-mismatch' },
            });
            expect((yield* Ref.get(h.state)).domain).toEqual([7]);
        })
    );
});

describe('health observations, not availability promises', () => {
    it.scoped('reports actual counts, owned shards, degradation, drain and storage outage', () =>
        Effect.gen(function* () {
            const context = yield* Layer.build(TestRunner.layer);
            const real = Context.get(context, Sharding);
            const memory = yield* RunnerStorage.makeMemory;
            const registered = yield* Ref.make<Array<readonly [Runner, boolean]>>([
                [
                    new Runner({
                        address: RunnerAddress.make({ host: 'a', port: 1 }),
                        groups: ['eventiva-actions'],
                        weight: 1,
                    }),
                    true,
                ],
                [
                    new Runner({
                        address: RunnerAddress.make({ host: 'b', port: 2 }),
                        groups: ['eventiva-actions'],
                        weight: 2,
                    }),
                    true,
                ],
                [new Runner({ address: RunnerAddress.make({ host: 'empty', port: 3 }), groups: [], weight: 1 }), true],
            ]);
            const unavailable = yield* Ref.make(false);
            const alive = yield* Ref.make(true);
            const draining = yield* Ref.make(false);
            const owns = yield* Ref.make(true);
            const snapshot = (edition: 'cloud' | 'community') =>
                Effect.gen(function* () {
                    const owned = yield* Ref.get(owns);
                    const layer = clusterStatus(
                        yield* Schema.decodeUnknown(DeploymentProfile)({ edition, shards: 4 })
                    ).pipe(
                        Layer.provide(
                            Layer.succeed(Sharding, {
                                ...real,
                                hasShardId: (shard) => owned && shard.id === 3,
                                isShutdown: Ref.get(draining),
                                activeEntityCount: Effect.succeed(9),
                            })
                        ),
                        Layer.provide(
                            Layer.succeed(RunnerHealth.RunnerHealth, {
                                isAlive: (address) => (address.host === 'a' ? Effect.succeed(true) : Ref.get(alive)),
                            })
                        ),
                        Layer.provide(
                            Layer.succeed(RunnerStorage.RunnerStorage, {
                                ...memory,
                                getRunners: Effect.gen(function* () {
                                    if (yield* Ref.get(unavailable))
                                        return yield* new PersistenceError({ cause: 'test-outage' });
                                    return yield* Ref.get(registered);
                                }),
                            })
                        )
                    );
                    return yield* ClusterStatus.pipe(
                        Effect.flatMap((s) => s.snapshot),
                        Effect.provide(layer)
                    );
                });
            expect(yield* snapshot('cloud')).toMatchObject({
                status: 'healthy',
                registeredRunners: 2,
                healthyRunners: 2,
                ownedShards: [3],
                activeEntities: 9,
                mailboxCapacity: 4096,
                shardWeight: 1,
            });
            yield* Ref.set(alive, false);
            expect(yield* snapshot('cloud')).toMatchObject({ status: 'degraded', healthyRunners: 1 });
            expect(yield* snapshot('community')).toMatchObject({ status: 'healthy', healthyRunners: 1 });
            yield* Ref.update(registered, (runners) => runners.map(([runner]) => [runner, false] as const));
            expect(yield* snapshot('community')).toMatchObject({ status: 'degraded', healthyRunners: 0 });
            yield* Ref.set(owns, false);
            yield* Ref.set(draining, true);
            expect(yield* snapshot('cloud')).toMatchObject({ status: 'draining', ownedShards: [] });
            yield* Ref.set(unavailable, true);
            expect(yield* snapshot('cloud')).toMatchObject({ status: 'unavailable', healthyRunners: 0 });
        })
    );
});
