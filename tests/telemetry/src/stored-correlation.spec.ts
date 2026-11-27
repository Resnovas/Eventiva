/**
 * @file tests/telemetry/src/stored-correlation.spec.ts
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
import { TelemetrySinkFailure } from '@eventiva/contracts/observability';
import {
    CorrelationAuthority,
    CorrelationIssuer,
    TelemetryConsent,
    TelemetryExportAuthority,
    correlationEpochMs,
    type CorrelationIdentity,
    type TelemetryExportBinding,
} from '@eventiva/contracts/telemetry-export';
import { rootCorrelationKeys, storedCorrelationLayer } from '@eventiva/integrations.telemetry.server/pseudonym';
import { ConfigProvider, Context, Effect, Exit, Layer, Redacted, Ref, Scope, TestClock } from 'effect';

const binding: TelemetryExportBinding = {
    tenantId: TenantId.make('019a95c0-0000-7000-8000-000000000001'),
    destinationId: '019a95c0-0000-7000-8000-000000000011',
    moduleId: 'platform.telemetry',
    moduleVersion: '1.0.0',
    generation: 1,
    profile: 'baseline',
    operation: 'ordinary',
    purpose: 'diagnostics',
};
const identity: CorrelationIdentity = {
    namespace: Redacted.make('https://issuer.test'),
    subject: Redacted.make('canonical-subject'),
    session: Redacted.make('canonical-session'),
    expiresAt: 2 * correlationEpochMs,
};
// Public vector bytes, not a deployment root; Python hashlib/hmac RFC 5869 expansion independently supplied the oracle.
const vector = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
/**
 * Install explicit deployment settings without inheriting the orb's secret environment.
 *
 * @param environment - Deployment environment name; defaults to development.
 * @param root - Hex-encoded correlation root key; defaults to the public HKDF test vector.
 * @returns A config provider holding only these two settings.
 */
const config = (environment = 'development', root = vector) =>
    ConfigProvider.fromMap(
        new Map([
            ['EVENTIVA_ENVIRONMENT', environment],
            ['TELEMETRY_CORRELATION_ROOT_KEY', root],
        ])
    );
const scope = {
    environment: 'development' as const,
    tenantId: binding.tenantId,
    destinationId: binding.destinationId,
    purpose: binding.purpose,
    epoch: 0,
};

describe('root-derived persistent-policy correlation', /** Test custody and release contracts independently of network or PostHog availability. */ () => {
    it.effect(
        'matches independent HKDF vector and separates every custody dimension at the UTC boundary',
        /**
         * Derive via the public key port; never assert an oracle obtained from the implementation.
         *
         * @returns The scenario that checks the HKDF vector, scope separation and epoch rollover.
         */
        () =>
            Effect.gen(
                /** A stable root yields stable runner output only for the same exact current scope. */ function* () {
                    // A fixed independent vector catches shared derivation bugs; one-dimension changes test separation and epoch rollover.
                    const a = yield* rootCorrelationKeys;
                    const b = yield* rootCorrelationKeys;
                    const expected = 'db601d61517e8bf69c2b0e5ed74ecf5c66534c2899148c55ed006277965962ed';
                    expect(Buffer.from(Redacted.value((yield* a.get(scope)).material)).toString('hex')).toBe(expected);
                    expect(Redacted.value((yield* b.get(scope)).material)).toEqual(
                        Redacted.value((yield* a.get(scope)).material)
                    );
                    for (const other of [
                        { ...scope, environment: 'staging' as const },
                        { ...scope, tenantId: TenantId.make('019a95c0-0000-7000-8000-000000000002') },
                        { ...scope, destinationId: '019a95c0-0000-7000-8000-000000000012' },
                        { ...scope, purpose: 'analytics' },
                    ])
                        expect(Buffer.from(Redacted.value((yield* a.get(other)).material)).toString('hex')).not.toBe(
                            expected
                        );
                    expect(Exit.isFailure(yield* Effect.exit(a.get({ ...scope, environment: 'test' })))).toBe(true);
                    expect(Exit.isFailure(yield* Effect.exit(a.get({ ...scope, epoch: 1 })))).toBe(true);
                    yield* TestClock.adjust(correlationEpochMs - 1);
                    yield* a.get(scope);
                    yield* TestClock.adjust(1);
                    expect(Exit.isFailure(yield* Effect.exit(a.get(scope)))).toBe(true);
                    expect(
                        Buffer.from(Redacted.value((yield* a.get({ ...scope, epoch: 1 })).material)).toString('hex')
                    ).not.toBe(expected);
                }
            ).pipe(Effect.withConfigProvider(config()))
    );

    it.effect(
        'fails closed for missing, short, malformed and unrelated roots',
        /**
         * Configuration failures expose only a bounded safe reason, never a root or decoder cause.
         *
         * @returns The scenario that tries each malformed root and inspects the safe failure.
         */
        () =>
            Effect.gen(
                /** Malformed material must not silently produce a weaker or empty HMAC key. */ function* () {
                    // Inspect safe failure text as well as denial so malformed root material cannot leak through decoder diagnostics.
                    for (const root of ['', '0'.repeat(63), 'g'.repeat(64), 'x-secret-canary']) {
                        const failure = yield* Effect.flip(
                            rootCorrelationKeys.pipe(Effect.withConfigProvider(config('staging', root)))
                        );
                        expect(failure.reason).toBe('configuration');
                        expect(String(failure)).not.toContain(root || 'TELEMETRY');
                    }
                    expect(
                        (yield* Effect.flip(
                            rootCorrelationKeys.pipe(Effect.withConfigProvider(ConfigProvider.fromMap(new Map())))
                        )).reason
                    ).toBe('configuration');
                }
            )
    );

    it.scoped(
        'requires live consent and identity on every issue and release, including expiry during SQL suspension',
        /**
         * The production store is covered by both-dialect storage tests; this controlled port makes the suspension boundary deterministic.
         *
         * @returns The scenario that changes one policy input at a time and checks every release path.
         */
        () =>
            Effect.gen(
                /** Change one authoritative input at a time and preserve the same already-issued request token. */ function* () {
                    // Retain issued handles while changing policy to catch cached grants and expiry crossed during an awaited store read.
                    const state = yield* Ref.make({
                        grant: true,
                        expiresAt: identity.expiresAt,
                        subject: identity.subject,
                        session: identity.session,
                        namespace: identity.namespace,
                        failed: false,
                        suspend: false,
                    });
                    const current = Ref.get(state).pipe(
                        Effect.flatMap(
                            /**
                             * Model fresh authenticateTokenSession results, not a caller-carried identifier assertion.
                             *
                             * @param value - Current controlled session state from the test Ref.
                             * @returns An effect yielding the live identity, or failing with an unavailable sink when the state is marked failed.
                             */
                            (value) =>
                                value.failed
                                    ? Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' }))
                                    : Effect.succeed({
                                          namespace: value.namespace,
                                          subject: value.subject,
                                          session: value.session,
                                          expiresAt: value.expiresAt,
                                      })
                        )
                    );
                    const store = TelemetryConsent.of({
                        /**
                         * Simulate a policy read crossing a clock boundary while retaining its prior deadline.
                         *
                         * @returns An effect yielding the current grant, or nothing when consent is withdrawn.
                         */
                        get: () =>
                            Effect.gen(
                                /** A grant read is fresh, explicit and never synthesized for an absent consent row. */ function* () {
                                    // Advance time after capturing state to model a valid read that returns only after session expiry.
                                    const value = yield* Ref.get(state);
                                    if (value.suspend) yield* TestClock.adjust(identity.expiresAt);
                                    return value.grant ? { version: 0, expiresAt: 3 * correlationEpochMs } : undefined;
                                }
                            ),
                        /**
                         * Test policy mutation uses Ref above, not an accepting persistence implementation.
                         *
                         * @returns An effect that always fails as unavailable.
                         */
                        put: () => Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' })),
                    });
                    const lifetime = yield* Scope.make();
                    const authority = yield* Layer.buildWithScope(
                        storedCorrelationLayer(binding, identity, yield* rootCorrelationKeys, current),
                        lifetime
                    ).pipe(Effect.provideService(TelemetryConsent, store));
                    const issuer = Context.get(authority, CorrelationIssuer);
                    const general = Context.get(authority, TelemetryExportAuthority);
                    const correlated = Context.get(authority, CorrelationAuthority);
                    const token = yield* issuer.issue(true);
                    yield* general.authorize(binding, 'log');
                    yield* correlated.authorize(binding, token);
                    expect(Exit.isFailure(yield* Effect.exit(issuer.issue(false)))).toBe(true);
                    expect(
                        Exit.isFailure(yield* Effect.exit(general.authorize({ ...binding, generation: 2 }, 'flush')))
                    ).toBe(true);
                    for (const changed of [
                        { grant: false },
                        { subject: Redacted.make('another') },
                        { session: Redacted.make('another') },
                        { namespace: Redacted.make('https://another.test') },
                        { expiresAt: 0 },
                        { failed: true },
                    ]) {
                        const before = yield* Ref.get(state);
                        yield* Ref.set(state, { ...before, ...changed });
                        expect(Exit.isFailure(yield* Effect.exit(issuer.issue(true)))).toBe(true);
                        expect(Exit.isFailure(yield* Effect.exit(general.authorize(binding, 'log')))).toBe(true);
                        expect(Exit.isFailure(yield* Effect.exit(correlated.authorize(binding, token)))).toBe(true);
                        yield* Ref.set(state, before);
                    }
                    yield* Ref.update(
                        state,
                        /**
                         * Only the store suspends; the initial session check still sees a live deadline.
                         *
                         * @param value - Session state before the update.
                         * @returns A copy of the state with store suspension switched on.
                         */
                        (value) => ({ ...value, suspend: true })
                    );
                    expect(Exit.isFailure(yield* Effect.exit(general.authorize(binding, 'log')))).toBe(true);
                    yield* TestClock.setTime(0);
                    yield* Ref.update(
                        state,
                        /**
                         * Restore a genuine grant so closure, not missing policy, explains the final denial.
                         *
                         * @param value - Session state before the update.
                         * @returns A copy of the state with store suspension switched off.
                         */
                        (value) => ({ ...value, suspend: false })
                    );
                    yield* Scope.close(lifetime, Exit.void);
                    expect(Exit.isFailure(yield* Effect.exit(issuer.issue(true)))).toBe(true);
                    expect(Exit.isFailure(yield* Effect.exit(general.authorize(binding, 'flush')))).toBe(true);
                }
            ).pipe(Effect.withConfigProvider(config()))
    );

    it.effect(
        'has no accepting production issuer even with a root and explicit stored grant',
        /**
         * The new composition cannot bypass the existing production hold.
         *
         * @returns The scenario that builds the layer under production settings and expects failure.
         */
        () =>
            Effect.gen(
                /** No permissive input can install the real issuer under a production environment. */ function* () {
                    // Supply valid root and consent controls so production policy, not missing prerequisites, explains construction failure.
                    const keys = yield* rootCorrelationKeys;
                    const result = yield* Effect.exit(
                        Effect.scoped(
                            Layer.build(storedCorrelationLayer(binding, identity, keys, Effect.succeed(identity))).pipe(
                                Effect.provideService(TelemetryConsent, {
                                    /**
                                     * Explicit test grant isolates deployment denial from absent consent.
                                     *
                                     * @returns An effect yielding a grant that lasts as long as the identity.
                                     */
                                    get: () => Effect.succeed({ version: 0, expiresAt: identity.expiresAt }),
                                    /**
                                     * No test path mutates durable policy.
                                     *
                                     * @returns An effect that succeeds without storing anything.
                                     */
                                    put: () => Effect.void,
                                })
                            )
                        )
                    );
                    expect(Exit.isFailure(result)).toBe(true);
                }
            ).pipe(Effect.withConfigProvider(config('production')))
    );
});
