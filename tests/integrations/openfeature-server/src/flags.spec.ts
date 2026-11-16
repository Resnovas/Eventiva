/**
 * @file tests/integrations/openfeature-server/src/flags.spec.ts
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
import { layer, staticValues } from '@eventiva/integrations.openfeature.server/flags';
import { describe, expect, it } from '@effect/vitest';
import { OpenFeature, type Provider } from '@openfeature/server-sdk';
import { Effect, Layer, Logger } from 'effect';
import { vi } from 'vitest';

const flag = (key: string, safeDefault: boolean) => ({ key, description: 'Test.', owner: 'test', safeDefault });

// A provider that rejects every evaluation, as a broken remote would.
const broken: Provider = {
    metadata: { name: 'broken' },
    runsOn: 'server',
    resolveBooleanEvaluation: () => Promise.reject(new Error('down')),
    resolveStringEvaluation: () => Promise.reject(new Error('down')),
    resolveNumberEvaluation: () => Promise.reject(new Error('down')),
    resolveObjectEvaluation: () => Promise.reject(new Error('down')),
};

describe('OpenFeature server flags', () => {
    it.effect('keeps vendor secrets out of public startup diagnostics and preserves defaults', () => {
        const secret = 'flag-server-secret-canary';
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
                layer([], { domain: 'test-secret' }).pipe(
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

    it.effect('lets a higher source win whatever order providers are given in', () =>
        Effect.gen(function* () {
            const flags = yield* Flags;
            const result = yield* flags.evaluate(flag('a.flag', true));
            expect(result).toMatchObject({ value: false, fallback: false });
            const remoteOnly = yield* flags.evaluate(flag('a.remote-only', false));
            expect(remoteOnly).toMatchObject({ value: true, fallback: false });
        }).pipe(
            Effect.provide(
                layer(
                    [
                        { source: 'remote', provider: staticValues({ 'a.flag': true, 'a.remote-only': true }) },
                        { source: 'emergency-policy', provider: staticValues({ 'a.flag': false }) },
                    ],
                    { domain: 'test-precedence' }
                )
            )
        )
    );

    it.effect('returns the safe default for a flag no provider knows', () =>
        Effect.gen(function* () {
            const flags = yield* Flags;
            const result = yield* flags.evaluate(flag('a.unknown', true));
            expect(result).toMatchObject({ flag: 'a.unknown', value: true, fallback: true });
            expect(result.reason).not.toBe('STATIC');
        }).pipe(
            Effect.provide(layer([{ source: 'git-baseline', provider: staticValues({}) }], { domain: 'test-unknown' }))
        )
    );

    it.effect('passes the targeting key and attributes to providers', () =>
        Effect.gen(function* () {
            const flags = yield* Flags;
            const gold = flag('a.gold', false);
            expect((yield* flags.evaluate(gold, { targetingKey: 'u1', attributes: { tier: 'gold' } })).value).toBe(
                true
            );
            expect((yield* flags.evaluate(gold, { targetingKey: 'u2', attributes: { tier: 'gold' } })).value).toBe(
                false
            );
            expect((yield* flags.evaluate(gold, { targetingKey: 'u1', attributes: { tier: 'free' } })).value).toBe(
                false
            );
            expect((yield* flags.evaluate(gold)).value).toBe(false);
        }).pipe(
            Effect.provide(
                layer(
                    [
                        {
                            source: 'targeting',
                            provider: {
                                ...broken,
                                resolveBooleanEvaluation: (_key, _value, context) =>
                                    Promise.resolve({
                                        value: context.targetingKey === 'u1' && context['tier'] === 'gold',
                                        reason: 'TARGETING_MATCH',
                                    }),
                            },
                        },
                    ],
                    { domain: 'test-targeting' }
                )
            )
        )
    );

    it.effect('reports UNKNOWN when a provider gives no reason', () =>
        Effect.gen(function* () {
            const flags = yield* Flags;
            expect(yield* flags.evaluate(flag('a.flag', false))).toMatchObject({ value: true, reason: 'UNKNOWN' });
        }).pipe(
            Effect.provide(
                layer(
                    [
                        {
                            source: 'remote',
                            provider: { ...broken, resolveBooleanEvaluation: () => Promise.resolve({ value: true }) },
                        },
                    ],
                    {
                        domain: 'test-terse',
                    }
                )
            )
        )
    );

    it.effect('falls back to the safe default when a provider fails', () =>
        Effect.gen(function* () {
            const flags = yield* Flags;
            const result = yield* flags.evaluate(flag('a.flag', false));
            expect(result).toMatchObject({ value: false, fallback: true });
        }).pipe(Effect.provide(layer([{ source: 'remote', provider: broken }], { domain: 'test-broken' })))
    );

    it.effect('answers with safe defaults when a provider fails to start', () =>
        Effect.gen(function* () {
            const flags = yield* Flags;
            expect(yield* flags.evaluate(flag('a.flag', true))).toMatchObject({ value: true, fallback: true });
        }).pipe(
            Effect.provide(
                layer(
                    [
                        {
                            source: 'remote',
                            provider: { ...broken, initialize: () => Promise.reject(new Error('no network')) },
                        },
                    ],
                    {
                        domain: 'test-start',
                    }
                )
            )
        )
    );

    it.effect('unbinds its providers when the layer closes', () =>
        Effect.gen(function* () {
            yield* Effect.scoped(
                Effect.gen(function* () {
                    const flags = yield* Flags;
                    expect((yield* flags.evaluate(flag('a.flag', false))).value).toBe(true);
                }).pipe(
                    Effect.provide(
                        layer([{ source: 'git-baseline', provider: staticValues({ 'a.flag': true }) }], {
                            domain: 'test-close',
                        })
                    )
                )
            );
            const after = OpenFeature.getClient('test-close');
            expect(yield* Effect.promise(() => after.getBooleanValue('a.flag', false))).toBe(false);
        })
    );
});
