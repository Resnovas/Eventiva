/**
 * @file apps/server/tests/identity-session-policy.spec.ts
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
import { TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant, type JsonValue } from '@eventiva/contracts/storage';
import { ConfigProvider, Context, Effect, Layer, Ref, TestClock } from 'effect';
import {
    IdentitySessionPolicy,
    identitySessionPolicy,
    SessionPolicyFailure,
    sessionPolicyFromConfig,
} from '../src/identity-session-policy.ts';

const tenant = TenantId.make('019b0000-0000-7000-8000-000000000001');
const otherTenant = TenantId.make('019b0000-0000-7000-8000-000000000002');
const explicit = { tenant, sessionLifetimeMs: 7_200_000, approvalWindowMs: 900_000 };

/** Build one tenant-bound service without substituting policy validation or calculating expectations through production helpers. */
const build = (source: Effect.Effect<JsonValue | undefined, SessionPolicyFailure>, expectedTenant = tenant) =>
    Layer.build(
        identitySessionPolicy(source).pipe(Layer.provide(Layer.succeed(CurrentTenant, { id: expectedTenant })))
    ).pipe(
        Effect.map(
            /** Keep the same service instance across repeated uses to detect accidental layer-time policy capture. */
            (context) => Context.get(context, IdentitySessionPolicy)
        )
    );

describe('required trusted tenant session policy', /** Deadlines express policy only; these tests do not authenticate sessions or activate a provider. */ () => {
    it.scoped(
        'uses asymmetric explicit limits and caps consent by the actual earlier session expiry',
        /** A one-hour fallback, reversed minimum or ignored actual expiry produces different exact values. */ () =>
            Effect.gen(
                /** Exercise the same service at two clock instants so cached absolute deadlines cannot pass. */
                function* () {
                    // Different session/window magnitudes expose a reversed cap or an invented one-hour value.
                    yield* TestClock.setTime(1_000_000);
                    const policy = yield* build(Effect.succeed(explicit));
                    expect(yield* policy.current).toEqual(explicit);
                    expect(yield* policy.sessionExpiresAt).toBe(8_200_000);
                    expect(yield* policy.approvalExpiresAt({ tenant, expiresAt: 9_000_000 })).toBe(1_900_000);
                    expect(yield* policy.approvalExpiresAt({ tenant, expiresAt: 1_123_456 })).toBe(1_123_456);
                    yield* TestClock.setTime(1_000_017);
                    expect(yield* policy.sessionExpiresAt).toBe(8_200_017);
                }
            )
    );

    it.scoped(
        'accepts exactly five minutes and a shorter remaining live session, but denies the exact expired boundary',
        /** Five minutes constrains the configured window, not the remaining life of an already authenticated session. */ () =>
            Effect.gen(
                /** Do not silently reject usable near-expiry sessions or accept one at its expiry instant. */
                function* () {
                    // A five-millisecond remaining session distinguishes the configured minimum from actual-session capping.
                    yield* TestClock.setTime(1_000);
                    const policy = yield* build(
                        Effect.succeed({ tenant, sessionLifetimeMs: 300_000, approvalWindowMs: 300_000 })
                    );
                    expect(yield* policy.sessionExpiresAt).toBe(301_000);
                    expect(yield* policy.approvalExpiresAt({ tenant, expiresAt: 999_999 })).toBe(301_000);
                    expect(yield* policy.approvalExpiresAt({ tenant, expiresAt: 1_005 })).toBe(1_005);
                    yield* TestClock.setTime(1_005);
                    for (const expiresAt of [1_004, 1_005])
                        expect(yield* Effect.flip(policy.approvalExpiresAt({ tenant, expiresAt }))).toMatchObject({
                            _tag: 'SessionPolicyFailure',
                            reason: 'expired',
                        });
                }
            )
    );

    it.scoped(
        'denies absent and malformed policy, both duration boundaries and unavailable trusted sources',
        /** Test rejected trusted-source values without choosing any production policy default. */ () =>
            Effect.gen(
                /** Invalid values must not be coerced, rounded, capped into validity or replaced by one hour. */
                function* () {
                    // Each numeric case is invalid independently for either duration, even when the other is valid.
                    const invalidDurations = [299_999, 300_000.5, Number.NaN, Infinity, Number.MAX_SAFE_INTEGER + 1];
                    const invalid = [
                        undefined,
                        null,
                        {},
                        { ...explicit, tenant: 'not-a-tenant' },
                        { ...explicit, approvalWindowMs: 7_200_001 },
                        { ...explicit, sessionLifetimeMs: '7200000' },
                        { ...explicit, preference: 'must-not-be-policy' },
                        ...invalidDurations.flatMap(
                            /** Distinguish validation of the maximum from validation of only the tenant window. */
                            (value) => [
                                { ...explicit, sessionLifetimeMs: value },
                                { ...explicit, approvalWindowMs: value },
                            ]
                        ),
                    ];
                    for (const value of invalid) {
                        const policy = yield* build(Effect.succeed(value));
                        expect(yield* Effect.flip(policy.current)).toMatchObject({
                            _tag: 'SessionPolicyFailure',
                            reason: 'invalid',
                        });
                    }
                    const unavailable = yield* build(Effect.fail(new SessionPolicyFailure({ reason: 'unavailable' })));
                    expect(yield* Effect.flip(unavailable.current)).toMatchObject({ reason: 'unavailable' });
                    expect(yield* Effect.flip(unavailable.sessionExpiresAt)).toMatchObject({ reason: 'unavailable' });
                    expect(
                        yield* Effect.flip(unavailable.approvalExpiresAt({ tenant, expiresAt: 9_000_000 }))
                    ).toMatchObject({ reason: 'unavailable' });
                }
            )
    );

    it.scoped(
        'binds both policy and supplied live deadline to the routed tenant',
        /** Neither a valid foreign policy nor an earlier foreign session expiry confers authority. */ () =>
            Effect.gen(
                /** Two separately built routes make tenant identity observable without importing any unpublished provider. */
                function* () {
                    // The foreign expiry is earlier, so applying Math.min before checking tenant ownership would appear usable.
                    yield* TestClock.setTime(1_000_000);
                    const policy = yield* build(Effect.succeed(explicit));
                    const wrongRoute = yield* build(Effect.succeed(explicit), otherTenant);
                    expect(yield* Effect.flip(wrongRoute.current)).toMatchObject({ reason: 'tenant' });
                    expect(
                        yield* Effect.flip(policy.approvalExpiresAt({ tenant: otherTenant, expiresAt: 1_000_001 }))
                    ).toMatchObject({ reason: 'tenant' });
                    const other = yield* build(Effect.succeed({ ...explicit, tenant: otherTenant }), otherTenant);
                    expect(yield* other.approvalExpiresAt({ tenant: otherTenant, expiresAt: 1_000_003 })).toBe(
                        1_000_003
                    );
                }
            )
    );

    it.scoped(
        'rereads changed trusted policy on the same service and refuses later foreign or absent policy',
        /** A policy snapshot captured during layer construction or initial approval must fail this scenario. */ () =>
            Effect.gen(
                /** Change the source without rebuilding its layer and prove every public operation observes it. */
                function* () {
                    // Reusing the built capability is essential: rebuilding would conceal stale layer-time policy capture.
                    yield* TestClock.setTime(1_000_000);
                    const source = yield* Ref.make<JsonValue | undefined>(explicit);
                    const policy = yield* build(Ref.get(source));
                    const previous = yield* policy.current;
                    expect(yield* policy.sessionExpiresAt).toBe(8_200_000);
                    yield* Ref.set(source, { tenant, sessionLifetimeMs: 1_800_000, approvalWindowMs: 300_000 });
                    expect((yield* policy.current).approvalWindowMs).toBe(300_000);
                    expect(yield* policy.sessionExpiresAt).toBe(2_800_000);
                    expect(yield* policy.approvalExpiresAt({ tenant, expiresAt: 9_000_000 })).toBe(1_300_000);
                    expect(previous).toEqual(explicit);
                    yield* Ref.set(source, { ...explicit, tenant: otherTenant });
                    expect(yield* Effect.flip(policy.current)).toMatchObject({ reason: 'tenant' });
                    yield* Ref.set(source, undefined);
                    expect(yield* Effect.flip(policy.sessionExpiresAt)).toMatchObject({ reason: 'invalid' });
                }
            )
    );

    it.scoped(
        'rejects unsafe absolute deadlines and overflow rather than relying on an earlier cap to conceal them',
        /** Independent extreme values distinguish safe-integer checks from merely finite or positive checks. */ () =>
            Effect.gen(
                /** The source is valid first, so failures specifically exercise deadline and arithmetic validation. */
                function* () {
                    // A finite integer can still be unsafe, and an earlier cap must not legitimize overflowing arithmetic.
                    yield* TestClock.setTime(1_000_000);
                    const policy = yield* build(Effect.succeed(explicit));
                    for (const expiresAt of [Number.NaN, Infinity, -1, 1_000_001.5, Number.MAX_SAFE_INTEGER + 1])
                        expect(yield* Effect.flip(policy.approvalExpiresAt({ tenant, expiresAt }))).toMatchObject({
                            reason: 'invalid',
                        });
                    const extreme = yield* build(
                        Effect.succeed({ ...explicit, sessionLifetimeMs: Number.MAX_SAFE_INTEGER })
                    );
                    expect(yield* Effect.flip(extreme.sessionExpiresAt)).toMatchObject({ reason: 'invalid' });
                    yield* TestClock.setTime(Number.MAX_SAFE_INTEGER - 5);
                    expect(
                        yield* Effect.flip(policy.approvalExpiresAt({ tenant, expiresAt: Number.MAX_SAFE_INTEGER }))
                    ).toMatchObject({ reason: 'invalid' });
                    yield* TestClock.setTime(-1);
                    expect(yield* Effect.flip(policy.sessionExpiresAt)).toMatchObject({ reason: 'invalid' });
                }
            )
    );

    it.effect(
        'requires every explicit Config field and sanitizes unparseable or invalid settings without a fallback',
        /** Config keys are an unactivated adapter contract, not the selection of production configuration authority. */ () =>
            Effect.gen(
                /** Load independently controlled providers rather than reading the orb environment. */
                function* () {
                    // Replace the entire provider so the orb environment cannot fill a deliberately missing field.
                    const values = new Map([
                        ['IDENTITY_SESSION_POLICY_TENANT', tenant],
                        ['IDENTITY_SESSION_MAXIMUM_MS', '7200000'],
                        ['IDENTITY_APPROVAL_WINDOW_MS', '300000'],
                    ]);
                    expect(
                        yield* sessionPolicyFromConfig.pipe(Effect.withConfigProvider(ConfigProvider.fromMap(values)))
                    ).toEqual({ tenant, sessionLifetimeMs: 7_200_000, approvalWindowMs: 300_000 });
                    for (const key of values.keys()) {
                        const missing = new Map(values);
                        missing.delete(key);
                        const error = yield* Effect.flip(
                            sessionPolicyFromConfig.pipe(Effect.withConfigProvider(ConfigProvider.fromMap(missing)))
                        );
                        expect(error).toBeInstanceOf(SessionPolicyFailure);
                        expect(error.reason).toBe('unavailable');
                    }
                    const secret = 'synthetic-private-configuration-canary';
                    for (const value of [secret, '299999']) {
                        const invalid = new Map(values).set('IDENTITY_SESSION_MAXIMUM_MS', value);
                        const error = yield* Effect.flip(
                            sessionPolicyFromConfig.pipe(Effect.withConfigProvider(ConfigProvider.fromMap(invalid)))
                        );
                        expect(error).toBeInstanceOf(SessionPolicyFailure);
                        expect(JSON.stringify(error)).not.toContain(secret);
                        expect(error).not.toHaveProperty('cause');
                    }
                }
            )
    );
});
