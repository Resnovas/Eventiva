/**
 * @file apps/server/tests/core-bootstrap-qualification.spec.ts
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

import { describe, expect, it } from '@effect/vitest';
import { Flags, type Flag } from '@eventiva/contracts/flags';
import { layer, staticValues } from '@eventiva/integrations.openfeature.server/flags';
import { options } from '@eventiva/integrations.posthog.server/flags';
import { Cause, ConfigError, ConfigProvider, Context, Effect, Exit, Layer, Option, Redacted, Scope } from 'effect';
import { deploymentProfile } from '../src/cluster-profile.ts';

/** Build a complete public flag declaration with an explicit contrasting fallback for each observation. */
const flag = (key: string, safeDefault: boolean): Flag => ({
    key,
    description: 'Core provider isolation control.',
    owner: 'core-qualification',
    safeDefault,
});

describe('Core deployment configuration boundary', /** Qualify the exported loader itself, not only main's outer catch boundary. */ () => {
    it.effect(
        'conceals invalid values and provider failures in typed errors, rendered Cause and serialized Exit',
        /** Invalid discriminants expose raw decoder details that a canary in an unrelated valid field would miss. */ () =>
            Effect.gen(
                /** Exercise JSON syntax, schema semantics and the Config provider failure channel with independent canaries. */ function* () {
                    // Edition first preserves the original leak as the red control instead of stopping on a newly introduced error tag.
                    const candidates = [
                        ['CORE_EDITION_SECRET_1101', '{"edition":"CORE_EDITION_SECRET_1101"}'],
                        ['CORE_JSON_SECRET_1102', '{CORE_JSON_SECRET_1102'],
                        ['CORE_STORAGE_SECRET_1103', '{"edition":"community","storage":"CORE_STORAGE_SECRET_1103"}'],
                    ] as const;
                    for (const [canary, value] of candidates) {
                        const result = yield* deploymentProfile.pipe(
                            Effect.withConfigProvider(
                                ConfigProvider.fromMap(new Map([['EVENTIVA_CLUSTER_PROFILE', value]]))
                            ),
                            Effect.exit
                        );
                        expect(Exit.isFailure(result)).toBe(true);
                        expect(JSON.stringify(result)).not.toContain(canary);
                        if (Exit.isFailure(result)) {
                            expect(Cause.pretty(result.cause)).not.toContain(canary);
                            const failure = Cause.failureOption(result.cause);
                            expect(failure).toMatchObject({
                                _tag: 'Some',
                                value: { _tag: 'DeploymentProfileFailure', reason: 'configuration' },
                            });
                            if (Option.isSome(failure)) expect(failure.value).not.toHaveProperty('cause');
                        }
                    }
                    const unavailable = ConfigProvider.make({
                        /** Inject a real typed provider failure whose private diagnostic must not become the helper's error. */
                        load: () =>
                            Effect.fail(
                                ConfigError.InvalidData(['EVENTIVA_CLUSTER_PROFILE'], 'CORE_PROVIDER_SECRET_1104')
                            ),
                        flattened: ConfigProvider.fromMap(new Map()).flattened,
                    });
                    const result = yield* deploymentProfile.pipe(Effect.withConfigProvider(unavailable), Effect.exit);
                    expect(Exit.isFailure(result)).toBe(true);
                    expect(JSON.stringify(result)).not.toContain('CORE_PROVIDER_SECRET_1104');
                    if (Exit.isFailure(result)) {
                        expect(Cause.pretty(result.cause)).not.toContain('CORE_PROVIDER_SECRET_1104');
                        expect(Cause.failureOption(result.cause)).toMatchObject({
                            _tag: 'Some',
                            value: { _tag: 'DeploymentProfileFailure', reason: 'configuration' },
                        });
                    }
                }
            )
    );

    it.effect(
        'preserves absent configuration defaults and valid asymmetric community and cloud profiles',
        /** Success controls prevent sanitization from becoming blanket rejection or a fallback over invalid input. */ () =>
            Effect.gen(
                /** Compare actual decoded values without bypassing the public Config-backed loader. */ function* () {
                    // Keep omitted configuration separate from explicit profiles so default and caller-supplied settings both remain observable.
                    const defaults = yield* deploymentProfile.pipe(
                        Effect.withConfigProvider(ConfigProvider.fromMap(new Map()))
                    );
                    expect(defaults).toMatchObject({
                        edition: 'community',
                        expectedRunners: 1,
                        port: 34431,
                        storage: 'sql',
                    });
                    for (const profile of [
                        { edition: 'community', expectedRunners: 1, port: 17771, shards: 17, host: '127.0.0.2' },
                        { edition: 'cloud', expectedRunners: 3, port: 19992, shards: 31, host: '127.0.0.3' },
                    ]) {
                        const actual = yield* deploymentProfile.pipe(
                            Effect.withConfigProvider(
                                ConfigProvider.fromMap(new Map([['EVENTIVA_CLUSTER_PROFILE', JSON.stringify(profile)]]))
                            )
                        );
                        expect(actual).toMatchObject({
                            ...profile,
                            storage: 'sql',
                            lockRefreshMs: 10000,
                            lockExpiryMs: 35000,
                        });
                    }
                }
            )
    );
});

describe('Core provider qualification', /** Qualify public configuration and named-domain ownership without remote evaluation. */ () => {
    it.effect(
        'keeps concurrent provider credentials and endpoints in their own configuration scopes',
        /** Distinct asymmetric settings detect shared or ambient configuration across simultaneous reads. */ () =>
            Effect.gen(
                /** Inspect authorized values explicitly while ordinary serialization keeps credentials private. */ function* () {
                    // The same public options descriptor must resolve separately in each fiber, not cache its first caller.
                    const configurations = [
                        new Map([
                            ['POSTHOG_API_KEY', 'CORE_KEY_ALPHA_771'],
                            ['POSTHOG_HOST', 'http://127.0.0.1:17771'],
                        ]),
                        new Map([
                            ['POSTHOG_API_KEY', 'CORE_KEY_BETA_992'],
                            ['POSTHOG_HOST', 'http://127.0.0.1:19992'],
                        ]),
                    ];
                    const resolved = yield* Effect.forEach(
                        configurations,
                        /** Give each provider read a private ConfigProvider without changing global process state. */ (
                            values
                        ) => options.pipe(Effect.withConfigProvider(ConfigProvider.fromMap(values))),
                        { concurrency: 'unbounded' }
                    );
                    const alpha = Option.getOrThrow(resolved[0] ?? Option.none());
                    const beta = Option.getOrThrow(resolved[1] ?? Option.none());
                    expect(Redacted.value(alpha.apiKey)).toBe('CORE_KEY_ALPHA_771');
                    expect(Redacted.value(beta.apiKey)).toBe('CORE_KEY_BETA_992');
                    expect(alpha.host).toBe('http://127.0.0.1:17771');
                    expect(beta.host).toBe('http://127.0.0.1:19992');
                    expect(JSON.stringify(resolved)).not.toMatch(/CORE_KEY_ALPHA_771|CORE_KEY_BETA_992/);
                    const absent = yield* options.pipe(Effect.withConfigProvider(ConfigProvider.fromMap(new Map())));
                    expect(Option.isNone(absent)).toBe(true);
                }
            )
    );

    it.scoped(
        'closing one named provider leaves the other live and permits independent reacquisition',
        /** Observe real Flags services from two production provider layers through separate owning scopes. */ () =>
            Effect.gen(
                /** Keep both domains live before closing one so accidental global unbinding is observable. */ function* () {
                    // Opposite values and defaults distinguish a real binding from fallback and cross-domain contamination.
                    const aScope = yield* Scope.make();
                    yield* Effect.addFinalizer(
                        /** Close the first owner even when an assertion fails before explicit disposal. */ () =>
                            Scope.close(aScope, Exit.void)
                    );
                    const a = Context.get(
                        yield* Layer.buildWithScope(
                            layer([{ source: 'git-baseline', provider: staticValues({ 'core.isolated': true }) }], {
                                domain: 'core-qualification-alpha',
                            }),
                            aScope
                        ),
                        Flags
                    );
                    const b = Context.get(
                        yield* Layer.build(
                            layer([{ source: 'git-baseline', provider: staticValues({ 'core.isolated': false }) }], {
                                domain: 'core-qualification-beta',
                            })
                        ),
                        Flags
                    );
                    expect((yield* a.evaluate(flag('core.isolated', false))).value).toBe(true);
                    expect((yield* b.evaluate(flag('core.isolated', true))).value).toBe(false);
                    yield* Scope.close(aScope, Exit.void);
                    expect((yield* b.evaluate(flag('core.isolated', true))).value).toBe(false);
                    const replacement = Context.get(
                        yield* Layer.build(
                            layer([{ source: 'git-baseline', provider: staticValues({ 'core.isolated': true }) }], {
                                domain: 'core-qualification-alpha',
                            })
                        ),
                        Flags
                    );
                    expect((yield* replacement.evaluate(flag('core.isolated', false))).value).toBe(true);
                    expect((yield* b.evaluate(flag('core.isolated', true))).value).toBe(false);
                }
            )
    );
});
