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
import { canonicalLocale } from '@eventiva/contracts/i18n';
import { ActionInventory, validateInventory, validateParity } from '@eventiva/contracts/inventory';
import { layer as i18n } from '@eventiva/integrations.formatjs/i18n';
import { layer as flags, staticValues } from '@eventiva/integrations.openfeature.server/flags';
import { fromConfig as postHog } from '@eventiva/integrations.posthog.server/flags';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { FailClosed, InputDigest } from '@eventiva/runtime/invocation';
import { Effect, Layer, Option } from 'effect';
import { ShellCaller, ShellIdentity, shellCaller, staticGrants } from './access.ts';
import { deploymentProfile } from './cluster-profile.ts';
import { platformModule, Status } from './status.ts';

/**
 * The backend composition root: the only place that names providers and
 * platform layers. Flags come from the Git baseline, then PostHog when a key
 * is configured; without one, nothing leaves the process. HTTP and agent
 * transports arrive with their own issues (EVE-46 onwards). Until EVE-42's SQL
 * adapter lands, this is a registration diagnostic, not a business runner.
 * Every executable deployment must compose clusterRunner; there is no direct
 * ActionHost invocation fallback in this shell.
 */

const FlagsLive = Layer.unwrapScoped(
    Effect.map(postHog, (remote) =>
        flags([
            { source: 'git-baseline', provider: staticValues({}) },
            ...Option.match(remote, {
                onNone: () => [],
                onSome: (provider) => [{ source: 'remote' as const, provider }],
            }),
        ])
    )
);

const program = Effect.gen(function* () {
    const profile = yield* deploymentProfile;
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
    yield* Effect.logWarning(
        'Cluster execution unavailable: SQL runner and durable action adapters are not composed.',
        {
            edition: profile.edition,
            expectedRunners: profile.expectedRunners,
            healthyRunners: 0,
            status: 'unavailable',
        }
    );
    yield* Effect.logInfo('Eventiva modules registered', {
        actions: listed.map((action) => action.id),
    });
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

NodeRuntime.runMain(program.pipe(Effect.provide(MainLive)));
