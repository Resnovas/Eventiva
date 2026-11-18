/**
 * @file tests/integrations/posthog-server/src/flags.spec.ts
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

import { fromConfig, options, provider } from '@eventiva/integrations.posthog.server/flags';
import { describe, expect, it } from '@effect/vitest';
import { PostHogServerProvider } from '@posthog/openfeature-node-provider';
import { ConfigProvider, Effect, Option, Redacted } from 'effect';

/** Replace ambient configuration with deterministic fixture values for one test effect. */
const withConfig = (values: Record<string, string>) =>
    Effect.withConfigProvider(ConfigProvider.fromMap(new Map(Object.entries(values))));

describe('PostHog server provider', /** Register optional configuration, redaction and scoped construction regressions. */ () => {
    it.effect(
        'stays off without a project key',
        /** Supply no configuration so acquisition remains optional. */ () =>
            Effect.gen(
                /** Verify absent credentials disable both parsed options and provider acquisition. */ function* () {
                    // Check acquisition as well as parsing so an empty configuration cannot instantiate an unintended client.
                    expect(Option.isNone(yield* options)).toBe(true);
                    expect(Option.isNone(yield* Effect.scoped(fromConfig))).toBe(true);
                }
            ).pipe(withConfig({}))
    );

    it.effect(
        'reads the key as a secret and defaults to the EU host',
        /** Supply only a fixture key to exercise redaction and the default endpoint. */ () =>
            Effect.gen(
                /** Verify explicit secret access works while ordinary rendering conceals the key. */ function* () {
                    // Explicit unwrapping is permitted; ordinary string conversion must not expose the same secret.
                    const settings = Option.getOrThrow(yield* options);
                    expect(Redacted.value(settings.apiKey)).toBe('phc_test');
                    expect(String(settings.apiKey)).not.toContain('phc_test');
                    expect(settings.host).toBe('https://eu.i.posthog.com');
                }
            ).pipe(withConfig({ POSTHOG_API_KEY: 'phc_test' }))
    );

    it.effect(
        'builds an OpenFeature provider whose client lives as long as the scope',
        /** Compare explicit and configuration-driven scoped provider acquisition. */ () =>
            Effect.gen(
                /** Verify both construction routes acquire a provider and complete their scopes. */ function* () {
                    // Close each acquisition without evaluating flags; this checks construction rather than remote delivery.
                    const built = yield* Effect.scoped(
                        provider({ apiKey: Redacted.make('phc_test'), host: 'http://127.0.0.1:9' })
                    );
                    expect(built).toBeInstanceOf(PostHogServerProvider);
                    const configured = yield* Effect.scoped(fromConfig);
                    expect(Option.isSome(configured)).toBe(true);
                }
            ).pipe(withConfig({ POSTHOG_API_KEY: 'phc_test', POSTHOG_HOST: 'http://127.0.0.1:9' }))
    );
});
