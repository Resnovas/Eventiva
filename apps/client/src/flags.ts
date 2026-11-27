/**
 * @file apps/client/src/flags.ts
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

import type { Flag } from '@eventiva/contracts/flags';
import { layer, staticValues } from '@eventiva/integrations.openfeature.client/flags';
import { PostHogClientProvider } from '@eventiva/integrations.posthog.client/flags';
import { connect } from '@eventiva/integrations.posthog.client/connect';
import { postHog } from './config.ts';

/**
 * The OpenFeature domain the client binds; React hooks read the same domain.
 *
 * @since 0.0.1
 * @example
 * <OpenFeatureProvider domain={domain}>{children}</OpenFeatureProvider>
 */
export const domain = 'eventiva';

/**
 * Shows the offline-first banner in the shell. Optional, so it defaults off.
 *
 * @since 0.0.1
 * @example
 * const showBanner = useBooleanFlagValue(offlineBanner.key, offlineBanner.safeDefault);
 */
export const offlineBanner: Flag = {
    key: 'client.shell.offline-banner',
    description: 'Show the offline-first notice on the client shell.',
    owner: 'platform',
    safeDefault: false,
};

/**
 * The client's `Flags` layer: the Git-managed baseline, then PostHog when a key was configured at build time.
 *
 * @since 0.0.1
 * @example
 * startup.start(registerRoot, FlagsLive);
 */
export const FlagsLive = layer(
    [
        { source: 'git-baseline', provider: staticValues({}) },
        ...(postHog.apiKey === undefined
            ? []
            : [
                  {
                      source: 'remote' as const,
                      provider: new PostHogClientProvider(connect(postHog.apiKey, postHog.host)),
                  },
              ]),
    ],
    { domain }
);
