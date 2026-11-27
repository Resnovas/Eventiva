/**
 * @file tests/contracts/src/hook.spec.ts
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

import { expect, it } from '@effect/vitest';
import {
    HookDeclaration,
    HookEvent,
    HookModuleIdentity,
    HookObservation,
    HookOutbox,
    HookOutboxUnavailable,
    HookReleasePolicy,
    HookReleaseDeny,
    hookReleaseRequirements,
} from '@eventiva/contracts/hook';
import { SecurityProfile } from '@eventiva/contracts/security';
import { Effect, Schema } from 'effect';

const uuid = '019b0000-0000-7000-8000-000000000001';
const identity = { module: 'fixture', version: '1.2.3', generation: 4 };
const declaration = {
    format: 1,
    pin: { tenant: uuid, owner: identity, hook: 'fixture.observe', revision: 1 },
    delivery: 'post-commit',
    target: 'declarative',
    capability: { kind: 'observation' },
    observations: ['domain.change'],
    profiles: ['baseline', 'sensitive', 'restricted', 'vault'],
    maxAttempts: 3,
    retryDelayMs: 10,
    timeoutMs: 100,
    concurrency: 2,
    capacity: 10,
};
const event = {
    format: 1,
    id: uuid,
    tenant: uuid,
    commit: uuid,
    resource: 'fixture.record',
    resourceId: uuid,
    purpose: 'fixture.notify',
    profile: 'restricted',
    operation: 'protected',
    sequence: 1,
    projection: { kind: 'domain.change', identity, change: 'updated', revision: 1 },
};
/**
 * Test unknown wire input against a hook schema without throwing or coercing the validation outcome.
 *
 * @template A - The schema's decoded type.
 * @template I - The schema's encoded type.
 * @template Input - The type of the wire value under test.
 * @param schema - The hook schema to decode with.
 * @param value - The wire value under test.
 * @returns Whether the value decodes successfully.
 */
const valid = <A, I, Input>(schema: Schema.Schema<A, I>, value: Input) =>
    Schema.decodeUnknownEither(schema)(value)._tag === 'Right';

it.effect(
    'fails closed without a durable outbox or an authorized release policy',
    /**
     * Isolate unavailable persistence and deny-all release layers from real hook delivery infrastructure.
     *
     * @returns The Effect that runs these assertions.
     */
    () =>
        Effect.gen(
            /** Verify every outbox operation fails unavailable and release authorization independently denies the event. */ function* () {
                // A valid declaration and event ensure failures reflect missing capabilities rather than malformed fixtures.
                const outbox = yield* HookOutbox;
                const policy = yield* HookReleasePolicy;
                const observer = Schema.decodeUnknownSync(HookDeclaration)(declaration);
                const fact = Schema.decodeUnknownSync(HookEvent)(event);
                const claim = {
                    lease: uuid,
                    idempotencyKey: uuid,
                    pin: observer.pin,
                    event: fact,
                    attempt: 1,
                };
                for (const operation of [
                    outbox.stage(fact, [observer]),
                    outbox.claim(observer, 1000),
                    outbox.settle(claim, { state: 'delivered' }),
                ]) {
                    const failure = yield* Effect.flip(operation);
                    expect(failure).toMatchObject({ _tag: 'HookOutboxFailure', reason: 'unavailable' });
                }
                // Persistence unavailability does not replace the separate fail-closed release policy boundary.
                const denied = yield* Effect.flip(policy.authorize(observer, fact, hookReleaseRequirements(fact)));
                expect(denied).toMatchObject({ _tag: 'HookDenied', reason: 'policy-denied' });
            }
        ).pipe(Effect.provide([HookOutboxUnavailable, HookReleaseDeny]))
);

it('seals profiles and declarations, rejects before/mutating hooks and ambiguous pins', /** Verify declarations permit only bounded post-commit capabilities with exact owner pins. */ () => {
    // Mutations vary one declaration property so forbidden execution authority cannot hide in an otherwise valid pin.
    expect(SecurityProfile.literals).toEqual(['baseline', 'sensitive', 'restricted', 'vault']);
    expect(valid(HookDeclaration, declaration)).toBe(true);
    for (const patch of [
        { format: 2 },
        { delivery: 'before' },
        { veto: true },
        { mutate: true },
        { authorization: 'override' },
        { profiles: ['regulated'] },
        { profiles: [] },
        { maxAttempts: 0 },
        { concurrency: 33 },
        { capacity: 0 },
        { timeoutMs: Infinity },
        { target: 'executable', capability: { kind: 'additive', action: 'fixture.write', version: 1 } },
        { capability: { kind: 'observation', action: 'fixture.write' } },
        { pin: { ...declaration.pin, owner: { ...identity, version: '^1.2.3' } } },
        { pin: { ...declaration.pin, owner: { ...identity, version: '1.2.3-beta' } } },
        { pin: { ...declaration.pin, owner: { ...identity, generation: 0 } } },
    ])
        expect(valid(HookDeclaration, { ...declaration, ...patch })).toBe(false);
    expect(
        valid(HookDeclaration, {
            ...declaration,
            capability: { kind: 'additive', action: 'fixture.write', version: 1 },
        })
    ).toBe(true);
});

it('uses the frozen kernel lifecycle and all execution/step phases without payload slots', /** Verify lifecycle vocabulary and execution phase metadata without implying transition validation or payload access. */ () => {
    expect(valid(HookModuleIdentity, { ...identity, generation: 0 })).toBe(true);
    expect(valid(HookModuleIdentity, { ...identity, generation: -1 })).toBe(false);
    expect(
        valid(HookObservation, {
            kind: 'module.lifecycle',
            operation: 'register',
            identity: { ...identity, generation: 0 },
            from: null,
            to: 'registered',
        })
    ).toBe(true);
    // Kernel snapshots may skip numbers; hooks carry the given snapshot, not a local sequence generator.
    expect(
        valid(HookObservation, {
            kind: 'module.lifecycle',
            operation: 'install',
            identity: { ...identity, generation: 7 },
            from: 'validated',
            to: 'installed',
        })
    ).toBe(true);
    for (const operation of [
        'register',
        'validate',
        'install',
        'activate',
        'ready',
        'deactivate',
        'unregister',
        'retire',
        'update',
        'recover',
    ]) {
        expect(
            valid(HookObservation, {
                kind: 'module.lifecycle',
                operation,
                identity,
                from: 'active',
                to: operation === 'unregister' ? null : 'inactive',
            })
        ).toBe(true);
    }
    for (const to of ['registered', 'validated', 'installed', 'active', 'ready', 'inactive', 'failed', 'retired'])
        expect(
            valid(HookObservation, { kind: 'module.lifecycle', operation: 'recover', identity, from: 'failed', to })
        ).toBe(true);
    expect(
        valid(HookObservation, {
            kind: 'module.lifecycle',
            operation: 'before-activate',
            identity,
            from: 'installed',
            to: 'activating',
        })
    ).toBe(false);
    expect(valid(HookObservation, { kind: 'platform.ready', runtimeId: uuid, generation: 2 })).toBe(true);
    // Execution observations have no step identifier; step observations require one and neither accepts payload input.
    for (const phase of ['start', 'finish', 'fail', 'retry', 'cancel', 'pause', 'resume']) {
        for (const kind of ['execution', 'step']) {
            const observation = { kind, phase, identity, execution: uuid, step: kind === 'step' ? 'verify' : null };
            expect(valid(HookObservation, observation)).toBe(true);
            expect(valid(HookObservation, { ...observation, input: { secret: 'private' } })).toBe(false);
            expect(valid(HookObservation, { ...observation, step: kind === 'step' ? null : 'verify' })).toBe(false);
        }
    }
});

it('releases only typed metadata for Restricted/Vault; rejects plaintext and secret-bearing shapes', /** Verify profile-specific release requirements never grant decryption or admit secret-bearing event fields. */ () => {
    // Check envelope and projection independently because either could otherwise become a secret release channel.
    for (const profile of SecurityProfile.literals) {
        const source = { ...event, profile };
        const decoded = Schema.decodeUnknownSync(HookEvent)(source);
        expect(Schema.decodeUnknownSync(Schema.parseJson(HookEvent))(JSON.stringify(decoded))).toEqual(source);
        expect(hookReleaseRequirements(decoded)).toMatchObject({
            tenantCapability: 'hooks.release',
            resourcePurposePolicy: true,
            projection: 'metadata-only.v1',
            profile,
            brokerEvidence: profile !== 'baseline',
            grantsDecryption: false,
            attestation:
                profile === 'restricted'
                    ? 'confidential-workload'
                    : profile === 'vault'
                      ? 'client-authorized-release'
                      : profile === 'sensitive'
                        ? 'workload'
                        : 'none',
        });
        for (const key of ['plaintext', 'secrets', 'input', 'output', 'error', 'keyHandle', 'authorization']) {
            expect(valid(HookEvent, { ...source, [key]: 'NEVER-RELEASE' })).toBe(false);
            expect(valid(HookEvent, { ...source, projection: { ...source.projection, [key]: 'NEVER-RELEASE' } })).toBe(
                false
            );
        }
    }
});
