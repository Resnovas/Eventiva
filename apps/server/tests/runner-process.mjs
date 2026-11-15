/**
 * @file apps/server/tests/runner-process.mjs
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

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NodeRuntime } from '@effect/platform-node';
import { Sharding } from '@effect/cluster/Sharding';
import { Cause, Effect, FiberSet, Layer, Schema } from 'effect';
import { ClusterStatus } from '../dist/cluster.js';
import { ClusterActions, ClusterInvocation } from '../dist/cluster-actions.js';
import { deploymentProfile } from '../dist/cluster-profile.js';

// Test-only process entry. Phase B supplies the real SQL + registered ActionHost
// dependencies. This file never creates a memory storage or integrity substitute.
const bootstrap = process.argv[2];
if (!bootstrap) throw new Error('Phase B SQL/action bootstrap module is required.');
const { makeBackend, commands: extraCommands } = await import(pathToFileURL(resolve(bootstrap)).href);

const program = Effect.gen(function* () {
    const profile = yield* deploymentProfile;
    const context = yield* Layer.build(makeBackend(profile));
    const status = yield* ClusterStatus.pipe(Effect.provide(context));
    const actions = yield* ClusterActions.pipe(Effect.provide(context));
    const sharding = yield* Sharding.pipe(Effect.provide(context));
    const commands = yield* FiberSet.make();
    const runFork = yield* FiberSet.runtime(commands)();
    const respond = (message) => {
        const operation =
            message?.command === 'status'
                ? status.snapshot
                : message?.command === 'execute'
                  ? Schema.decodeUnknown(ClusterInvocation)(message.request).pipe(Effect.flatMap(actions.execute))
                  : message?.command === 'shard'
                    ? Effect.succeed(sharding.getShardId(message.entityId, 'eventiva-actions').id)
                    : extraCommands?.[message?.command]
                      ? extraCommands[message.command](message.request ?? message.executionId).pipe(
                            Effect.provide(context)
                        )
                      : Effect.fail(new Error('Unknown harness command'));
        runFork(
            operation.pipe(
                Effect.matchCause({
                    onFailure: (cause) => {
                        process.send?.({ id: message.id, error: Cause.pretty(cause) });
                    },
                    onSuccess: (value) => process.send?.({ id: message.id, value }),
                })
            )
        );
    };
    yield* Effect.acquireRelease(
        Effect.sync(() => process.on('message', respond)),
        () => Effect.sync(() => process.off('message', respond))
    );
    process.send?.({ ready: true, pid: process.pid, port: profile.port });
    yield* Effect.never;
});

NodeRuntime.runMain(program.pipe(Effect.scoped));
