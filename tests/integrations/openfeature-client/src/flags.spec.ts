/**
 * @file tests/integrations/openfeature-client/src/flags.spec.ts
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

import { Flags } from '@eventiva/contracts/flags';
import { layer, staticValues } from '@eventiva/integrations.openfeature.client/flags';
import { PostHogClientProvider } from '@eventiva/integrations.posthog.client/flags';
import { describe, expect, it } from '@effect/vitest';
import { ErrorCode, OpenFeature, type Provider } from '@openfeature/web-sdk';
import { Effect, Layer, Logger } from 'effect';
import { vi } from 'vitest';

const flag = (key: string, safeDefault: boolean) => ({ key, description: 'Test.', owner: 'test', safeDefault });

// What PostHog has cached on the device.
const cached: Record<string, boolean | string> = { 'a.baseline': true, 'a.remote': 'variant-b' };
const postHog = new PostHogClientProvider({
    getFeatureFlag: (key) => cached[key],
    onFeatureFlags: () => () => undefined,
});

describe('OpenFeature client flags', () => {
    it.effect('keeps vendor secrets out of public startup diagnostics and preserves defaults', () => {
        const secret = 'flag-client-secret-canary';
        const messages: string[] = [];
        const bind = vi
            .spyOn(OpenFeature, 'setProviderAndWait')
            .mockRejectedValueOnce(Object.assign(new Error(secret), { secret }));
        return Effect.gen(function* () {
            expect(yield* (yield* Flags).evaluate(flag('a.secret', true))).toMatchObject({
                value: true,
                fallback: true,
            });
        }).pipe(
            Effect.provide(
                layer([], { domain: 'client-secret' }).pipe(
                    Layer.provideMerge(
                        Logger.replace(
                            Logger.defaultLogger,
                            Logger.make(({ message }) => messages.push(JSON.stringify(message)))
                        )
                    )
                )
            ),
            Effect.tap(() =>
                Effect.sync(() => {
                    const diagnostics = messages.join('\n');
                    expect(diagnostics).toContain('FlagProviderError');
                    expect(diagnostics).toContain('initialize');
                    expect(diagnostics).not.toContain(secret);
                    expect(diagnostics).not.toContain('cause');
                })
            ),
            Effect.ensuring(Effect.sync(() => bind.mockRestore()))
        );
    });

    it.effect('combines the Git baseline and PostHog in precedence order', () =>
        Effect.gen(function* () {
            const flags = yield* Flags;
            // The baseline outranks remote rollout, so its false wins over PostHog's true.
            expect((yield* flags.evaluate(flag('a.baseline', true))).value).toBe(false);
            // Only PostHog knows this one; a served variant means on.
            expect(yield* flags.evaluate(flag('a.remote', false))).toMatchObject({ value: true, fallback: false });
            // Nobody knows this one, offline or not.
            expect(yield* flags.evaluate(flag('a.unknown', true))).toMatchObject({ value: true, fallback: true });
        }).pipe(
            Effect.provide(
                layer(
                    [
                        { source: 'remote', provider: postHog },
                        { source: 'git-baseline', provider: staticValues({ 'a.baseline': false }) },
                    ],
                    { domain: 'client-precedence', context: { targetingKey: 'device-1' } }
                )
            )
        )
    );

    // OpenFeature keeps a provider that failed to start bound (its ERROR state is
    // recoverable), so it still answers for the flags it knows and the rest fall back.
    it.effect('answers with safe defaults when a provider fails to start', () => {
        const failing: Provider = {
            metadata: { name: 'failing' },
            runsOn: 'client',
            initialize: () => Promise.reject(new Error('no network')),
            resolveBooleanEvaluation: (_key, value) => ({
                value: !value,
                reason: 'ERROR',
                errorCode: ErrorCode.FLAG_NOT_FOUND,
            }),
            resolveStringEvaluation: (_key, value) => ({ value }),
            resolveNumberEvaluation: (_key, value) => ({ value }),
            resolveObjectEvaluation: (_key, value) => ({ value }),
        };
        return Effect.gen(function* () {
            const flags = yield* Flags;
            expect(yield* flags.evaluate(flag('a.flag', false))).toMatchObject({ value: false, fallback: true });
        }).pipe(Effect.provide(layer([{ source: 'remote', provider: failing }], { domain: 'client-start' })));
    });

    it.effect('reports UNKNOWN when a provider gives no reason', () => {
        const terse: Provider = {
            metadata: { name: 'terse' },
            runsOn: 'client',
            resolveBooleanEvaluation: () => ({ value: true }),
            resolveStringEvaluation: (_key, value) => ({ value }),
            resolveNumberEvaluation: (_key, value) => ({ value }),
            resolveObjectEvaluation: (_key, value) => ({ value }),
        };
        return Effect.gen(function* () {
            expect(yield* (yield* Flags).evaluate(flag('a.flag', false))).toMatchObject({
                value: true,
                reason: 'UNKNOWN',
            });
        }).pipe(Effect.provide(layer([{ source: 'remote', provider: terse }], { domain: 'client-terse' })));
    });

    it.effect('unbinds its providers when the layer closes', () =>
        Effect.gen(function* () {
            yield* Effect.scoped(
                Effect.gen(function* () {
                    expect((yield* (yield* Flags).evaluate(flag('a.on', false))).value).toBe(true);
                }).pipe(
                    Effect.provide(
                        layer([{ source: 'git-baseline', provider: staticValues({ 'a.on': true }) }], {
                            domain: 'client-close',
                        })
                    )
                )
            );
            expect(OpenFeature.getClient('client-close').getBooleanValue('a.on', false)).toBe(false);
        })
    );
});
