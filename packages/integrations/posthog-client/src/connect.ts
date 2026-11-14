/**
 * @file packages/integrations/posthog-client/src/connect.ts
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

import { PostHog } from 'posthog-react-native';
import type { PostHogFlagClient } from './flags.ts';

/**
 * Creates the device PostHog client for flags only. Nothing is captured:
 * analytics are opted out, app lifecycle events, GeoIP and flag-called events
 * are off. The caller passes a key only when one is configured.
 */
export const connect = (apiKey: string, host: string): PostHogFlagClient => {
    const client = new PostHog(apiKey, {
        host,
        defaultOptIn: false,
        captureAppLifecycleEvents: false,
        disableGeoip: true,
        sendFeatureFlagEvent: false,
    });
    return {
        getFeatureFlag: (key) => client.getFeatureFlag(key),
        onFeatureFlags: (callback) => client.onFeatureFlags(callback),
    };
};
