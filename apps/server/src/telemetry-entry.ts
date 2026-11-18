/**
 * @file apps/server/src/telemetry-entry.ts
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

import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import { NodeRuntime } from '@effect/platform-node';
import { TelemetrySinkFailure } from '@eventiva/contracts/observability';
import { Cause, Console, Effect, Exit } from 'effect';
import { localOidcTelemetryProgram } from './telemetry-local.ts';

const program = localOidcTelemetryProgram.pipe(
    Effect.provide(NodeFileSystem.layer),
    Effect.tap(
        /** Output contains only the command, environment, consent revision/deadline or random trace ID and bounded health. */ (
            result
        ) => Console.log(JSON.stringify(result))
    ),
    Effect.flatMap(
        /** A drained worker is not successful delivery when either diagnostic record failed or was dropped. */ (
            result
        ) =>
            'health' in result &&
            result.health &&
            (result.health.completed !== 2 || result.health.failed !== 0 || result.health.dropped !== 0)
                ? Effect.fail(new TelemetrySinkFailure({ reason: 'write' }))
                : Effect.void
    ),
    Effect.catchAllCause(
        /** Never print a rejected token, subject, path, Config error or vendor Cause. */ (cause) =>
            Cause.isInterruptedOnly(cause)
                ? Effect.interrupt
                : Console.error(
                      'Telemetry command denied or unavailable; consult the private configuration guide.'
                  ).pipe(Effect.zipRight(Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' }))))
    )
);

NodeRuntime.runMain(program, {
    disableErrorReporting: true,
    disablePrettyLogger: true,
    /** Drain failed scoped roots naturally, avoiding the pinned Node forced-exit worker deadlock. */
    teardown: (exit, onExit) => {
        // Preserve failure status without forcing exit while scoped database workers are still draining.
        if (Exit.isFailure(exit) && !Cause.isInterruptedOnly(exit.cause)) process.exitCode = 1;
        else onExit(0);
    },
});
