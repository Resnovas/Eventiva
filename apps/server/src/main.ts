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
import { channel } from 'node:diagnostics_channel';
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
import { Cause, Config, Effect, Exit, Fiber, Layer, Option } from 'effect';
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
        Effect.mapError(
            /** Hide invalid configuration contents from bootstrap output. */ () =>
                new TelemetrySinkFailure({ reason: 'configuration' })
        ),
        Effect.map(
            Option.match({
                /** Use console-only telemetry when no file sink was configured. */
                onNone: () => consoleLoggerLayer(),
                /** Give the configured file sink scoped filesystem ownership. */
                onSome: (options) =>
                    serverLoggerLayer(Config.succeed(options)).pipe(Layer.provide(NodeFileSystem.layer)),
            })
        )
    )
);
const MainTelemetry = telemetryLayer(diagnosticPolicy).pipe(Layer.provide(SinkLive));

// Test observers receive phase names only, never a Cause, configuration or telemetry payload.
const lifecycle = channel('eventiva.bootstrap.lifecycle');

/** Publish a closed lifecycle phase only when an observer was installed before entry evaluation. */
const phase = (name: 'root-start' | 'bootstrap-failure-logged'): Effect.Effect<void> =>
    lifecycle.hasSubscribers
        ? Effect.sync(/** Send no business data across the observational channel. */ () => lifecycle.publish(name))
        : Effect.void;

/** Observe an existing effect boundary without changing its Exit, scope or child-fiber ownership. */
const observeExit =
    <A, E, R>(
        name:
            'main-use-exit' | 'main-services-released' | 'main-telemetry-released' | 'bootstrap-use-exit' | 'root-exit'
    ) =>
    /** Return the original effect unchanged when diagnostics have no subscriber. */
    (effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
        lifecycle.hasSubscribers
            ? Effect.onExit(
                  effect,
                  /** Classify completion without publishing the error or inheriting another fiber's references. */
                  (exit) =>
                      Effect.sync(
                          /** Report only the closed outcome after this boundary settles. */ () => {
                              // An observed Exit identifies a boundary, not the runtime observer's subsequent teardown.
                              const outcome = Exit.isSuccess(exit)
                                  ? 'success'
                                  : Cause.isInterruptedOnly(exit.cause)
                                    ? 'interrupted'
                                    : 'failure';
                              lifecycle.publish(`${name}:${outcome}`);
                          }
                      )
              )
            : effect;

const FlagsLive = Layer.unwrapScoped(
    Effect.map(
        postHog,
        /** Compose the baseline before an optional remote flag provider. */ (remote) =>
            flags([
                { source: 'git-baseline', provider: staticValues({}) },
                ...Option.match(remote, {
                    /** Keep startup local when remote credentials are absent. */
                    onNone: () => [],
                    /** Preserve source attribution for the configured remote provider. */
                    onSome: (provider): ReadonlyArray<SourcedProvider> => [{ source: 'remote', provider }],
                }),
            ])
    )
);

const program = Effect.gen(
    /** Validate and register the diagnostic shell without claiming readiness or executing business actions. */ function* () {
        // Validate deployment before registration so invalid profiles cannot advertise usable modules.
        yield* deploymentProfile;
        const host = yield* ActionHost;
        const inventory = yield* ActionInventory;
        const module = platformModule(host.actions);
        yield* host.register(module);
        const listed = yield* inventory.list(shellCaller);
        yield* validateParity(
            yield* validateInventory(
                module.actions.map(/** Extract portable specs without registered handlers. */ ({ spec }) => spec)
            ),
            {
                server: listed.map(
                    /** Compare public identity and permission rather than runtime handler details. */ ({
                        id,
                        version,
                        permission,
                    }) => ({ id, version, permission })
                ),
            },
            ['server']
        );
        yield* Effect.logWarning('diagnostic.unavailable');
        yield* Effect.logInfo('diagnostic.registered');
    }
).pipe(Effect.scoped);

const MainLive = ActionHostLive.pipe(
    Layer.provide(FlagsLive),
    Layer.provide(staticGrants(new Map([[shellCaller.subject, [Status.permission]]]))),
    Layer.provide(
        Layer.succeed(InputDigest, {
            /** Hash already-canonical invocation input for the audit contract. */
            digest: (canonical) =>
                Effect.sync(
                    /** Encode the digest without retaining input in telemetry. */ () =>
                        createHash('sha256').update(canonical).digest('hex')
                ),
        })
    ),
    Layer.provide(ShellIdentity),
    Layer.provide(FailClosed),
    Layer.merge(ShellCaller),
    Layer.merge(i18n({ locale: canonicalLocale, catalogue: {} }))
);

const diagnostic: Effect.Effect<void, TelemetrySinkFailure> = program.pipe(
    observeExit('main-use-exit'),
    Effect.provide(MainLive),
    observeExit('main-services-released'),
    Effect.withSpan('diagnostic.startup'),
    Effect.provide(MainTelemetry),
    observeExit('main-telemetry-released'),
    // Await, not join: do not inherit the child's closed logger/tracer FiberRefs.
    Effect.fork,
    Effect.flatMap(Fiber.await),
    Effect.flatten,
    Effect.catchAllCause(
        /** Preserve interruption and report other failures only through the independent sanitized bootstrap sink. */ (
            cause
        ) => {
            if (Cause.isInterruptedOnly(cause)) return Effect.interrupt;
            // Keep the unobserved logging effect unchanged; an observer must not become a new failure prerequisite.
            const log = Effect.logError('bootstrap.failure');
            return (lifecycle.hasSubscribers ? log.pipe(Effect.zipRight(phase('bootstrap-failure-logged'))) : log).pipe(
                Effect.zipRight(Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' })))
            );
        }
    ),
    observeExit('bootstrap-use-exit'),
    Effect.provide(Bootstrap),
    observeExit('root-exit')
);

// The default reporter runs after logger scopes close and would print a raw Cause.
NodeRuntime.runMain(lifecycle.hasSubscribers ? Effect.zipRight(phase('root-start'), diagnostic) : diagnostic, {
    disableErrorReporting: true,
    disablePrettyLogger: true,
    /** Preserve the default outcome codes but drain failed roots without Node's forced native worker join. */
    teardown: (exit, onExit) => {
        // All application scopes are closed. process.exit() can deadlock V8 workers awaiting main-thread GC
        // on pinned Node 24 (nodejs/node#64274); natural drain keeps that main thread available.
        if (Exit.isFailure(exit) && !Cause.isInterruptedOnly(exit.cause)) {
            process.exitCode = 1;
            return;
        }
        // Retain runMain's original success and signal/interruption behavior, including its signal callback.
        onExit(0);
    },
});
