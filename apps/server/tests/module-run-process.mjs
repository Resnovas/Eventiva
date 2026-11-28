/**
 * @file apps/server/tests/module-run-process.mjs
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

import { NodeRuntime } from '@effect/platform-node';
import * as NodeSocketServer from '@effect/platform-node/NodeSocketServer';
import { Cause, Context, Effect, ExecutionStrategy, Exit, FiberSet, Layer, Scope } from 'effect';
import { ClusterStatus } from '../dist/cluster.js';
import { deploymentProfile } from '../dist/cluster-profile.js';
import { makeBackend, commands } from './module-run-fixture.mjs';

NodeRuntime.runMain(
    Effect.scoped(
        Effect.gen(function* () {
            const profile = yield* deploymentProfile;
            const requested = Number(process.argv[2]);
            const avoided = Number(process.argv[3]);
            const probe = yield* Scope.fork(yield* Effect.scope, ExecutionStrategy.sequential);
            const first = yield* NodeSocketServer.make({ host: profile.listenHost, port: requested }).pipe(
                Scope.extend(probe)
            );
            const socket =
                requested === 0 && first.address.port === avoided
                    ? yield* NodeSocketServer.make({ host: profile.listenHost, port: 0 }).pipe(
                          Effect.tap(() => Scope.close(probe, Exit.void))
                      )
                    : first;
            const context = yield* Layer.build(makeBackend(profile, socket));
            const status = Context.get(context, ClusterStatus);
            const fibers = yield* FiberSet.make();
            const fork = yield* FiberSet.runtime(fibers)();
            const respond = (message) => {
                const effect =
                    message.command === 'status'
                        ? status.snapshot
                        : (commands[message.command]?.(message.request) ??
                          Effect.fail(new Error('Unknown module-run command')));
                fork(
                    effect.pipe(
                        Effect.provide(context),
                        Effect.matchCause({
                            onSuccess: (value) => process.send?.({ id: message.id, value }),
                            onFailure: (cause) =>
                                process.send?.({
                                    id: message.id,
                                    error: `${Cause.pretty(cause)} ${JSON.stringify(Cause.failureOption(cause))}`,
                                }),
                        })
                    )
                );
            };
            yield* Effect.acquireRelease(
                Effect.sync(() => process.on('message', respond)),
                () => Effect.sync(() => process.off('message', respond))
            );
            process.send?.({ ready: true, pid: process.pid, port: socket.address.port });
            yield* Effect.never;
        })
    )
);
