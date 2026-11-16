/**
 * @file apps/server/src/main.ts
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

import { createHash } from 'node:crypto';
import { NodeRuntime } from '@effect/platform-node';
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import { canonicalLocale } from '@eventiva/contracts/i18n';
import { ActionInventory, validateInventory, validateParity } from '@eventiva/contracts/inventory';
import { TelemetrySinkFailure } from '@eventiva/contracts/observability';
import { layer as i18n } from '@eventiva/integrations.formatjs/i18n';
import { layer as flags, staticValues, type SourcedProvider } from '@eventiva/integrations.openfeature.server/flags';
import { fromConfig as postHog } from '@eventiva/integrations.posthog.server/flags';
import {
    consoleLoggerLayer,
    serverLoggerConfig,
    serverLoggerLayer,
} from '@eventiva/integrations.telemetry.server/logger';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { FailClosed, InputDigest } from '@eventiva/runtime/invocation';
import { bootstrapTelemetryLayer, telemetryLayer, type TelemetryPolicy } from '@eventiva/runtime/telemetry';
import { Cause, Config, Effect, Fiber, Layer, Option } from 'effect';
import { ShellCaller, ShellIdentity, shellCaller, staticGrants } from './access.ts';
import { deploymentProfile } from './cluster-profile.ts';
import { platformModule, Status } from './status.ts';

/**
 * The backend composition root: the only place that names providers and
 * platform layers. Flags come from the Git baseline, then PostHog when a key
 * is configured; without one, nothing leaves the process. HTTP and agent
 * transports arrive with their own issues (EVE-46 onwards). This executable
 * is a registration diagnostic, not an authenticated business runner.
 * Every executable deployment must compose clusterRunner; there is no direct
 * ActionHost invocation fallback in this shell.
 */

const diagnosticPolicy: TelemetryPolicy = {
    messages: {
        'diagnostic.startup': 'Diagnostic registration scope completed; this is not platform readiness.',
        'diagnostic.unavailable':
            'Diagnostic only: compose backend with trusted identity, tenant routing and SQL services to execute actions.',
        'diagnostic.registered': 'Eventiva modules registered',
    },
    attributes: {},
};

// Bootstrap has no dependency on main configuration, flags, filesystem or services.
const Bootstrap = bootstrapTelemetryLayer().pipe(Layer.provide(consoleLoggerLayer()));
const SinkLive = Layer.unwrapScoped(
    Config.option(serverLoggerConfig).pipe(
        Effect.mapError(() => new TelemetrySinkFailure({ reason: 'configuration' })),
        Effect.map(
            Option.match({
                onNone: () => consoleLoggerLayer(),
                onSome: (options) =>
                    serverLoggerLayer(Config.succeed(options)).pipe(Layer.provide(NodeFileSystem.layer)),
            })
        )
    )
);
const MainTelemetry = telemetryLayer(diagnosticPolicy).pipe(Layer.provide(SinkLive));

const FlagsLive = Layer.unwrapScoped(
    Effect.map(postHog, (remote) =>
        flags([
            { source: 'git-baseline', provider: staticValues({}) },
            ...Option.match(remote, {
                onNone: () => [],
                onSome: (provider): ReadonlyArray<SourcedProvider> => [{ source: 'remote', provider }],
            }),
        ])
    )
);

const program = Effect.gen(function* () {
    yield* deploymentProfile;
    const host = yield* ActionHost;
    const inventory = yield* ActionInventory;
    const module = platformModule(host.actions);
    yield* host.register(module);
    const listed = yield* inventory.list(shellCaller);
    yield* validateParity(
        yield* validateInventory(module.actions.map(({ spec }) => spec)),
        { server: listed.map(({ id, version, permission }) => ({ id, version, permission })) },
        ['server']
    );
    yield* Effect.logWarning('diagnostic.unavailable');
    yield* Effect.logInfo('diagnostic.registered');
}).pipe(Effect.scoped);

const MainLive = ActionHostLive.pipe(
    Layer.provide(FlagsLive),
    Layer.provide(staticGrants(new Map([[shellCaller.subject, [Status.permission]]]))),
    Layer.provide(
        Layer.succeed(InputDigest, {
            digest: (canonical) => Effect.sync(() => createHash('sha256').update(canonical).digest('hex')),
        })
    ),
    Layer.provide(ShellIdentity),
    Layer.provide(FailClosed),
    Layer.merge(ShellCaller),
    Layer.merge(i18n({ locale: canonicalLocale, catalogue: {} }))
);

const diagnostic: Effect.Effect<void, TelemetrySinkFailure> = program.pipe(
    Effect.provide(MainLive),
    Effect.withSpan('diagnostic.startup'),
    Effect.provide(MainTelemetry),
    // Await, not join: do not inherit the child's closed logger/tracer FiberRefs.
    Effect.fork,
    Effect.flatMap(Fiber.await),
    Effect.flatten,
    Effect.catchAllCause((cause) =>
        Cause.isInterruptedOnly(cause)
            ? Effect.interrupt
            : Effect.logError('bootstrap.failure').pipe(
                  Effect.zipRight(Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' })))
              )
    ),
    Effect.provide(Bootstrap)
);

// The default reporter runs after logger scopes close and would print a raw Cause.
NodeRuntime.runMain(diagnostic, { disableErrorReporting: true, disablePrettyLogger: true });
