/**
 * @file apps/server/src/cluster-profile.ts
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

import { Config, Effect, Option, Schema } from 'effect';
import { RunnerAddress } from '@effect/cluster/RunnerAddress';
import { defaults, type ShardingConfig } from '@effect/cluster/ShardingConfig';

const positiveInt = Schema.Int.pipe(Schema.between(1, 2147483647));
/** Supply a schema-validated setting when omitted; explicit invalid values still fail decoding. */
const defaulted = <A, I>(schema: Schema.Schema<A, I>, value: A) =>
    Schema.optionalWith(schema, { /** Reuse the configured fallback only for missing input. */ default: () => value });

const settings = {
    host: defaulted(Schema.NonEmptyTrimmedString, '127.0.0.1'),
    port: defaulted(Schema.Int.pipe(Schema.between(1, 65535)), 34431),
    listenHost: defaulted(Schema.NonEmptyTrimmedString, '127.0.0.1'),
    shards: defaulted(Schema.Int.pipe(Schema.between(1, 10000)), 300),
    weight: defaulted(positiveInt, 1),
    mailboxCapacity: defaulted(positiveInt, 4096),
    lockRefreshMs: defaulted(positiveInt, 10000),
    lockExpiryMs: defaulted(positiveInt, 35000),
    assignmentRefreshMs: defaulted(positiveInt, 3000),
    healthCheckMs: defaulted(positiveInt, 5000),
    drainMs: defaulted(positiveInt, 15000),
    messagePollMs: defaulted(positiveInt, 1000),
    replyPollMs: defaulted(positiveInt, 200),
    // Only lease-row ownership is supported here. No session-advisory route
    // is implicitly selected for a transaction-pooled SQL connection.
    storage: defaulted(Schema.Literal('sql'), 'sql'),
};

/** Deployment size changes, not execution semantics. No local/noop storage profile. */
export const DeploymentProfile = Schema.Union(
    Schema.Struct({
        edition: Schema.Literal('community'),
        expectedRunners: defaulted(positiveInt, 1),
        ...settings,
    }).annotations({ parseOptions: { onExcessProperty: 'error' } }),
    Schema.Struct({
        edition: Schema.Literal('cloud'),
        expectedRunners: defaulted(Schema.Int.pipe(Schema.between(2, 2147483647)), 2),
        ...settings,
    }).annotations({ parseOptions: { onExcessProperty: 'error' } })
).pipe(
    Schema.filter(
        /** Leave lease-refresh headroom and at least one shard per expected runner. */ (profile) =>
            profile.lockExpiryMs > profile.lockRefreshMs * 3 && profile.shards >= profile.expectedRunners
                ? true
                : 'Require lockExpiryMs > 3 * lockRefreshMs and shards >= expectedRunners'
    )
);
export type DeploymentProfile = typeof DeploymentProfile.Type;

/** One validated configuration boundary. Configuration never disables Cluster. */
export const deploymentProfile = Config.string('EVENTIVA_CLUSTER_PROFILE').pipe(
    Config.withDefault('{"edition":"community"}'),
    Effect.flatMap(Schema.decodeUnknown(Schema.parseJson(DeploymentProfile)))
);

/** Full config, not partial env overrides, so unvalidated upstream env cannot alter topology. */
export const shardingConfig = (profile: DeploymentProfile): ShardingConfig['Type'] => ({
    ...defaults,
    runnerAddress: Option.some(RunnerAddress.make({ host: profile.host, port: profile.port })),
    runnerListenAddress: Option.some(RunnerAddress.make({ host: profile.listenHost, port: profile.port })),
    availableShardGroups: ['eventiva-actions'],
    assignedShardGroups: ['eventiva-actions'],
    shardsPerGroup: profile.shards,
    runnerShardWeight: profile.weight,
    shardLockDisableAdvisory: true,
    shardLockRefreshInterval: profile.lockRefreshMs,
    shardLockExpiration: profile.lockExpiryMs,
    refreshAssignmentsInterval: profile.assignmentRefreshMs,
    runnerHealthCheckInterval: profile.healthCheckMs,
    entityTerminationTimeout: profile.drainMs,
    entityMailboxCapacity: profile.mailboxCapacity,
    entityMessagePollInterval: profile.messagePollMs,
    entityReplyPollInterval: profile.replyPollMs,
});
