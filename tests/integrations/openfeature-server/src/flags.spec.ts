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

/** Build a portable flag fixture with an explicit caller-selected fallback. */
const flag = (key: string, safeDefault: boolean) => ({ key, description: 'Test.', owner: 'test', safeDefault });

// A provider that rejects every evaluation, as a broken remote would.
const broken: Provider = {
    metadata: { name: 'broken' },
    runsOn: 'server',
    /** Reject boolean evaluation to model an unavailable remote. */
    resolveBooleanEvaluation: () => Promise.reject(new Error('down')),
    /** Reject string evaluation to keep the fixture consistently unavailable. */
    resolveStringEvaluation: () => Promise.reject(new Error('down')),
    /** Reject numeric evaluation to keep the fixture consistently unavailable. */
    resolveNumberEvaluation: () => Promise.reject(new Error('down')),
    /** Reject object evaluation to keep the fixture consistently unavailable. */
    resolveObjectEvaluation: () => Promise.reject(new Error('down')),
};

describe('OpenFeature server flags', /** Register server evaluation, targeting and scoped provider regressions. */ () => {
    it.effect(
        'keeps vendor secrets out of public startup diagnostics and preserves defaults',
        /** Inject a canary-bearing initialization rejection and inspect sanitized diagnostics. */ () => {
            // Capture acquisition logging as well as evaluation so startup failures cannot leak vendor secrets.
            const secret = 'flag-server-secret-canary';
            const messages: string[] = [];
            const bind = vi
                .spyOn(OpenFeature, 'setProviderAndWait')
                .mockRejectedValueOnce(Object.assign(new Error(secret), { secret }));
            return Effect.gen(
                /** Verify initialization failure preserves the declared safe default. */ function* () {
                    expect(yield* (yield* Flags).evaluate(flag('a.secret', true))).toMatchObject({
                        value: true,
                        fallback: true,
                    });
                }
            ).pipe(
                Effect.provide(
                    layer([], { domain: 'test-secret' }).pipe(
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
                        /** Restore the global provider binder even on assertion failure. */ () => bind.mockRestore()
                    )
                )
            );
        }
    );

    it.effect(
        'lets a higher source win whatever order providers are given in',
        /** Supply lower-priority remote values before the emergency policy. */ () =>
            Effect.gen(
                /** Verify priority overrides array order without discarding remote-only keys. */ function* () {
                    // Opposing values detect order-based selection; the remote-only key checks fall-through separately.
                    const flags = yield* Flags;
                    const result = yield* flags.evaluate(flag('a.flag', true));
                    expect(result).toMatchObject({ value: false, fallback: false });
                    const remoteOnly = yield* flags.evaluate(flag('a.remote-only', false));
                    expect(remoteOnly).toMatchObject({ value: true, fallback: false });
                }
            ).pipe(
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

    it.effect(
        'returns the safe default for a flag no provider knows',
        /** Bind an empty static provider to force unknown-key fallback. */ () =>
            Effect.gen(
                /** Verify fallback retains the requested key and is not mislabeled as a static match. */ function* () {
                    // A default answer is not a provider match, even when the returned boolean is usable.
                    const flags = yield* Flags;
                    const result = yield* flags.evaluate(flag('a.unknown', true));
                    expect(result).toMatchObject({ flag: 'a.unknown', value: true, fallback: true });
                    expect(result.reason).not.toBe('STATIC');
                }
            ).pipe(
                Effect.provide(
                    layer([{ source: 'git-baseline', provider: staticValues({}) }], { domain: 'test-unknown' })
                )
            )
    );

    it.effect(
        'passes the targeting key and attributes to providers',
        /** Bind a context-sensitive provider that requires both identity and tier. */ () =>
            Effect.gen(
                /** Verify identity and attribute controls each affect the provider's targeting result. */ function* () {
                    // Vary each required field independently so forwarding only identity or only attributes cannot pass.
                    const flags = yield* Flags;
                    const gold = flag('a.gold', false);
                    expect(
                        (yield* flags.evaluate(gold, { targetingKey: 'u1', attributes: { tier: 'gold' } })).value
                    ).toBe(true);
                    expect(
                        (yield* flags.evaluate(gold, { targetingKey: 'u2', attributes: { tier: 'gold' } })).value
                    ).toBe(false);
                    expect(
                        (yield* flags.evaluate(gold, { targetingKey: 'u1', attributes: { tier: 'free' } })).value
                    ).toBe(false);
                    expect((yield* flags.evaluate(gold)).value).toBe(false);
                }
            ).pipe(
                Effect.provide(
                    layer(
                        [
                            {
                                source: 'targeting',
                                provider: {
                                    ...broken,
                                    /** Match only the designated identity with the gold-tier attribute. */
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

    it.effect(
        'reports UNKNOWN when a provider gives no reason',
        /** Bind a reasonless successful resolution for normalization coverage. */ () =>
            Effect.gen(
                /** Verify a missing reason becomes UNKNOWN while preserving the resolved boolean. */ function* () {
                    // True opposes the declared false default, separating missing metadata from failed evaluation.
                    const flags = yield* Flags;
                    expect(yield* flags.evaluate(flag('a.flag', false))).toMatchObject({
                        value: true,
                        reason: 'UNKNOWN'
                    });
                }
            ).pipe(
                Effect.provide(
                    layer(
                        [
                            {
                                source: 'remote',
                                provider: {
                                    ...broken,
                                    /** Resolve successfully without optional reason metadata. */ resolveBooleanEvaluation:
                                        () => Promise.resolve({ value: true })
                                },
                            },
                        ],
                        {
                            domain: 'test-terse',
                        }
                    )
                )
            )
    );

    it.effect(
        'falls back to the safe default when a provider fails',
        /** Bind the rejecting remote fixture to exercise evaluation failure. */ () =>
            Effect.gen(
                /** Verify a rejected evaluation is represented as safe-default fallback. */ function* () {
                    // Evaluation rejection is an answerable default condition, not an escaping vendor exception.
                    const flags = yield* Flags;
                    const result = yield* flags.evaluate(flag('a.flag', false));
                    expect(result).toMatchObject({ value: false, fallback: true });
                }
            ).pipe(Effect.provide(layer([{ source: 'remote', provider: broken }], { domain: 'test-broken' })))
    );

    it.effect(
        'answers with safe defaults when a provider fails to start',
        /** Bind a provider with rejected initialization and evaluation. */ () =>
            Effect.gen(
                /** Verify failed startup cannot prevent a safe-default answer. */ function* () {
                    // A true default also catches an adapter that hard-codes false on initialization failure.
                    const flags = yield* Flags;
                    expect(yield* flags.evaluate(flag('a.flag', true))).toMatchObject({ value: true, fallback: true });
                }
            ).pipe(
                Effect.provide(
                    layer(
                        [
                            {
                                source: 'remote',
                                provider: {
                                    ...broken,
                                    /** Simulate unavailable startup without network IO. */ initialize: () =>
                                        Promise.reject(new Error('no network'))
                                },
                            },
                        ],
                        {
                            domain: 'test-start',
                        }
                    )
                )
            )
    );

    it.effect(
        'unbinds its providers when the layer closes',
        /** Exercise a server domain before and after provider scope disposal. */ () =>
            Effect.gen(
                /** Verify SDK access after disposal no longer sees the formerly bound static value. */ function* () {
                    // Direct SDK evaluation after scope exit distinguishes unbinding from Effect-service unavailability.
                    yield* Effect.scoped(
                        Effect.gen(
                            /** Establish that the live domain serves its static true value before cleanup. */ function* () {
                                // This positive control proves later fallback comes from disposal, not a never-bound provider.
                                const flags = yield* Flags;
                                expect((yield* flags.evaluate(flag('a.flag', false))).value).toBe(true);
                            }
                        ).pipe(
                            Effect.provide(
                                layer([{ source: 'git-baseline', provider: staticValues({ 'a.flag': true }) }], {
                                    domain: 'test-close',
                                })
                            )
                        )
                    );
                    const after = OpenFeature.getClient('test-close');
                    expect(
                        yield* Effect.promise(
                            /** Query the disposed domain with a contrasting false default. */ () =>
                                after.getBooleanValue('a.flag', false)
                        )
                    ).toBe(false);
                }
            )
    );
});
