/**
 * @file apps/client/src/config.ts
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

/**
 * Build-time settings. Expo inlines `EXPO_PUBLIC_*` variables when it
 * bundles, so this is the one place the client reads them. `process` is
 * declared here rather than taken from Node's types, which the client never loads.
 */

declare const process: { readonly env: Readonly<Record<string, string | undefined>> };

/** PostHog for remote flag rollout, only when a project key was set at build time. */
export const postHog = {
    apiKey: process.env['EXPO_PUBLIC_POSTHOG_KEY'],
    host: process.env['EXPO_PUBLIC_POSTHOG_HOST'] ?? 'https://eu.i.posthog.com',
};
