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

/** Build a portable flag fixture with an explicit caller-selected fallback. */
const flag = (key: string, safeDefault: boolean) => ({ key, description: 'Test.', owner: 'test', safeDefault });

// What PostHog has cached on the device.
const cached: Record<string, boolean | string> = { 'a.baseline': true, 'a.remote': 'variant-b' };
const postHog = new PostHogClientProvider({
    /** Expose only the device's cached values, leaving unknown flags absent. */
    getFeatureFlag: (key) => cached[key],
    /** Supply an inert subscription because this fixture never refreshes its cache. */
    onFeatureFlags: () => /** No listener was installed, so disposal has nothing to release. */ () => undefined,
});

describe('OpenFeature client flags', /** Register browser flag fallback, precedence and lifecycle regressions. */ () => {
    it.effect(
        'keeps vendor secrets out of public startup diagnostics and preserves defaults',
        /** Inject a canary-bearing initialization rejection and inspect sanitized diagnostics. */ () => {
            // Capture the logger at layer acquisition, where provider startup errors are converted to safe defaults.
            const secret = 'flag-client-secret-canary';
            const messages: string[] = [];
            const bind = vi
                .spyOn(OpenFeature, 'setProviderAndWait')
                .mockRejectedValueOnce(Object.assign(new Error(secret), { secret }));
            return Effect.gen(
                /** Verify failed startup still serves the declared safe default. */ function* () {
                    expect(yield* (yield* Flags).evaluate(flag('a.secret', true))).toMatchObject({
                        value: true,
                        fallback: true,
                    });
                }
            ).pipe(
                Effect.provide(
                    layer([], { domain: 'client-secret' }).pipe(
                        Layer.provideMerge(
                            Logger.replace(
                                Logger.defaultLogger,
                                Logger.make(
                                    /** Retain public log payloads for canary and raw-cause checks. */ ({ message }) =>
                                        messages.push(JSON.stringify(message))
                                )
                            )
                        )
                    )
                ),
                Effect.tap(
                    /** Inspect acquisition diagnostics after the fallback assertion succeeds. */ () =>
                        Effect.sync(
                            /** Require bounded error metadata without vendor exception contents. */ () => {
                                // A public error tag alone cannot prove redaction of the serialized private message or raw cause.
                                const diagnostics = messages.join('\n');
                                expect(diagnostics).toContain('FlagProviderError');
                                expect(diagnostics).toContain('initialize');
                                expect(diagnostics).not.toContain(secret);
                                expect(diagnostics).not.toContain('cause');
                            }
                        )
                ),
                Effect.ensuring(
                    Effect.sync(
                        /** Restore the global provider binder even if an assertion fails. */ () => bind.mockRestore()
                    )
                )
            );
        }
    );

    it.effect(
        'combines the Git baseline and PostHog in precedence order',
        /** Provide competing baseline and cached remote values in reverse priority order. */ () =>
            Effect.gen(
                /** Verify baseline priority, remote variants and unknown-key fallback independently. */ function* () {
                    const flags = yield* Flags;
                    // The baseline outranks remote rollout, so its false wins over PostHog's true.
                    expect((yield* flags.evaluate(flag('a.baseline', true))).value).toBe(false);
                    // Only PostHog knows this one; a served variant means on.
                    expect(yield* flags.evaluate(flag('a.remote', false))).toMatchObject({
                        value: true,
                        fallback: false
                    });
                    // Nobody knows this one, offline or not.
                    expect(yield* flags.evaluate(flag('a.unknown', true))).toMatchObject({
                        value: true,
                        fallback: true
                    });
                }
            ).pipe(
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
    it.effect(
        'answers with safe defaults when a provider fails to start',
        /** Bind a recoverably failed provider that also returns an evaluation error. */ () => {
            // An inverted value makes accidentally trusting an error resolution visible instead of matching the fallback.
            const failing: Provider = {
                metadata: { name: 'failing' },
                runsOn: 'client',
                /** Simulate failed remote initialization without performing network IO. */
                initialize: () => Promise.reject(new Error('no network')),
                /** Return an erroneous opposite value to expose unsafe fallback handling. */
                resolveBooleanEvaluation: (_key, value) => ({
                    value: !value,
                    reason: 'ERROR',
                    errorCode: ErrorCode.FLAG_NOT_FOUND,
                }),
                /** Preserve string defaults for the unused provider capability. */
                resolveStringEvaluation: (_key, value) => ({ value }),
                /** Preserve numeric defaults for the unused provider capability. */
                resolveNumberEvaluation: (_key, value) => ({ value }),
                /** Preserve object defaults for the unused provider capability. */
                resolveObjectEvaluation: (_key, value) => ({ value }),
            };
            return Effect.gen(
                /** Verify an error resolution cannot override the declared false default. */ function* () {
                    // The provider's erroneous true answer opposes the safe default, making error-value leakage observable.
                    const flags = yield* Flags;
                    expect(yield* flags.evaluate(flag('a.flag', false))).toMatchObject({
                        value: false,
                        fallback: true
                    });
                }
            ).pipe(Effect.provide(layer([{ source: 'remote', provider: failing }], { domain: 'client-start' })));
        }
    );

    it.effect(
        'reports UNKNOWN when a provider gives no reason',
        /** Bind a successful but reasonless provider to exercise reason normalization. */ () => {
            // Absence of reason metadata must not turn a successful value into an evaluation failure.
            const terse: Provider = {
                metadata: { name: 'terse' },
                runsOn: 'client',
                /** Supply a successful boolean resolution with deliberately absent reason metadata. */
                resolveBooleanEvaluation: () => ({ value: true }),
                /** Preserve string defaults without adding reason metadata. */
                resolveStringEvaluation: (_key, value) => ({ value }),
                /** Preserve numeric defaults without adding reason metadata. */
                resolveNumberEvaluation: (_key, value) => ({ value }),
                /** Preserve object defaults without adding reason metadata. */
                resolveObjectEvaluation: (_key, value) => ({ value }),
            };
            return Effect.gen(
                /** Verify missing reason metadata becomes UNKNOWN without discarding the resolved value. */ function* () {
                    expect(yield* (yield* Flags).evaluate(flag('a.flag', false))).toMatchObject({
                        value: true,
                        reason: 'UNKNOWN',
                    });
                }
            ).pipe(Effect.provide(layer([{ source: 'remote', provider: terse }], { domain: 'client-terse' })));
        }
    );

    it.effect(
        'unbinds its providers when the layer closes',
        /** Exercise a domain before and after its provider scope ends. */ () =>
            Effect.gen(
                /** Verify disposed domain access falls back rather than retaining its static provider. */ function* () {
                    // Exit the inner scope before consulting the SDK directly so the second read tests finalization.
                    yield* Effect.scoped(
                        Effect.gen(
                            /** Establish that the live provider overrides the false fallback before disposal. */ function* () {
                                expect((yield* (yield* Flags).evaluate(flag('a.on', false))).value).toBe(true);
                            }
                        ).pipe(
                            Effect.provide(
                                layer([{ source: 'git-baseline', provider: staticValues({ 'a.on': true }) }], {
                                    domain: 'client-close',
                                })
                            )
                        )
                    );
                    expect(OpenFeature.getClient('client-close').getBooleanValue('a.on', false)).toBe(false);
                }
            )
    );
});
