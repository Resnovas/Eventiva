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

import { NodeRuntime } from '@effect/platform-node';
import { canonicalLocale } from '@eventiva/contracts/i18n';
import { layer as i18n } from '@eventiva/integrations.formatjs/i18n';
import { layer as flags, staticValues } from '@eventiva/integrations.openfeature.server/flags';
import { fromConfig as postHog } from '@eventiva/integrations.posthog.server/flags';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { Effect, Layer, Option } from 'effect';
import { platformModule } from './status.ts';

/**
 * The backend composition root: the only place that names providers and
 * platform layers. Flags come from the Git baseline, then PostHog when a key
 * is configured; without one, nothing leaves the process. HTTP and agent
 * transports arrive with their own issues (EVE-46 onwards); until then the
 * shell registers its modules, checks the action path once and exits.
 */

const FlagsLive = Layer.unwrapScoped(
    Effect.map(postHog, (remote) =>
        flags([
            { source: 'git-baseline', provider: staticValues({}) },
            ...Option.match(remote, { onNone: () => [], onSome: (provider) => [{ source: 'remote' as const, provider }] }),
        ])
    )
);

const program = Effect.gen(function* () {
    const host = yield* ActionHost;
    yield* host.register(platformModule(host.actions));
    const status = yield* host.invoke('platform.status', {});
    yield* Effect.logInfo('Eventiva runtime ready', status);
}).pipe(Effect.scoped);

const MainLive = ActionHostLive.pipe(
    Layer.provide(FlagsLive),
    Layer.merge(i18n({ locale: canonicalLocale, catalogue: {} }))
);

NodeRuntime.runMain(program.pipe(Effect.provide(MainLive)));
