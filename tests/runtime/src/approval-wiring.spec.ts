/**
 * @file tests/runtime/src/approval-wiring.spec.ts
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
import { define } from '@eventiva/contracts/action';
import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Flags, FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { Approvals, ExecutionPolicy, InvocationDenied } from '@eventiva/runtime/invocation';
import { makeTestOnlyHarness, TestOnlyLedger, testOnlyDigest } from '@eventiva/runtime/testing';
import { Context, Deferred, Effect, ExecutionStrategy, Exit, Fiber, Layer, Ref, Schema, Scope } from 'effect';

const human = Schema.decodeUnknownSync(CallerIdentity)({
    subject: '019b0000-0000-7000-8000-000000000001',
    session: '019b0000-0000-7000-8000-000000000002',
    tenant: '019b0000-0000-7000-8000-000000000003',
    kind: 'human',
});
const action = define('fixture.review', {
    version: 3,
    description: 'Prepare synthetic transformed input without invoking its mutation.',
    permission: 'fixture.review',
    sideEffect: 'write',
    offline: 'online-only',
    approval: 'confirm',
    flag: 'fixture.review-enabled',
    input: Schema.Struct({ amount: Schema.NumberFromString }),
    output: Schema.Number,
});

/** Isolate registered preparation mechanics; these volatile services are not SQL/production consent evidence. */
const fixture = Effect.gen(
    /** Own the module scope separately so removal/replacement can be observed through the public host. */
    function* () {
        // Keep policy suspension and module lifetime independent so replacement races do not rely on timing.
        const harness = yield* makeTestOnlyHarness(human);
        const enabled = yield* Ref.make(true);
        const executions = yield* Ref.make(0);
        const beforePolicy = yield* Ref.make<Effect.Effect<void>>(Effect.void);
        yield* Ref.update(
            harness.policy,
            /** Distinct nonempty bounds make missing policy inspection and shared return references observable. */
            (policy) => ({ ...policy, bounds: { amount: 17, items: 4 } })
        );
        const context = yield* Layer.build(
            ActionHostLive.pipe(
                Layer.provide(
                    Layer.merge(
                        harness.TestOnly,
                        Layer.succeed(ExecutionPolicy, {
                            /** Suspend target-policy inspection only at an explicit fixture barrier, then read current bounds. */
                            inspect: () =>
                                Ref.get(beforePolicy).pipe(Effect.flatten, Effect.zipRight(Ref.get(harness.policy))),
                        })
                    )
                ),
                Layer.provide(
                    Layer.succeed(Flags, {
                        /** Recheck the same live flag on preparation and after policy/codec waits. */
                        evaluate: (flag) =>
                            Ref.get(enabled).pipe(
                                Effect.map(
                                    /** Keep flag metadata intact while varying only the test's live enablement. */
                                    (value) => ({ flag: flag.key, value, reason: 'STATIC' as const, fallback: false })
                                )
                            ),
                    })
                )
            )
        );
        const host = Context.get(context, ActionHost);
        const module = {
            manifest: {
                format: 1,
                id: 'fixture',
                version: '1.0.0',
                description: 'Registered review test.',
                actions: [action.name],
                flags: [
                    {
                        key: 'fixture.review-enabled',
                        description: 'Review gate.',
                        owner: 'fixture',
                        safeDefault: false,
                    },
                ],
            },
            actions: [
                implement(
                    action,
                    /** A preparation must never execute even this local mutation. */
                    ({ amount }) =>
                        Ref.update(executions, /** Count actual target executions only. */ (n) => n + 1).pipe(
                            Effect.as(amount)
                        )
                ),
            ],
        };
        const scope = yield* Scope.fork(yield* Effect.scope, ExecutionStrategy.sequential);
        yield* host.register(module).pipe(Effect.provideService(Scope.Scope, scope));
        return { host, module, scope, harness, enabled, executions, beforePolicy };
    }
);

describe('registered approval preparation', /** Review uses the execution registry without creating proof or invoking handlers. */ () => {
    // Distinguishing identities and transformed wire input prevent a cached caller or decoded-object hash from passing.
    it.scoped(
        'binds transformed input, live principal, version, limits and the exact target write key without running',
        /** A presented identity and a different refreshed identity distinguish canonical authority from caller claims. */ () =>
            Effect.gen(
                /** Compare exact bounded review data while proving neither handler execution nor consent creation occurs. */
                function* () {
                    const f = yield* fixture;
                    const presented = Schema.decodeUnknownSync(CallerIdentity)({ ...human, subject: human.session });
                    const review = yield* f.host
                        .prepareApproval(action.name, { amount: '17' }, 'target-19', 3)
                        .pipe(Effect.provideService(Caller, presented));
                    expect(review).toEqual({
                        binding: {
                            tenant: human.tenant,
                            principal: human.subject,
                            action: action.name,
                            version: 3,
                            inputHash: 'TEST-ONLY:{"amount":"17"}',
                            writeKey: 'target-19',
                        },
                        limits: { amount: 17, items: 4 },
                    });
                    expect(yield* Ref.get(f.executions)).toBe(0);
                    expect((yield* Ref.get(f.harness.approvals)).size).toBe(0);
                    // Mutating a trusted policy's retained map cannot change review data already returned to a human.
                    Object.assign((yield* Ref.get(f.harness.policy)).bounds, { amount: 99 });
                    expect(review.limits).toEqual({ amount: 17, items: 4 });
                    expect(
                        yield* f.host
                            .prepareApproval(action.name, { amount: '18' }, 'target-20', 3)
                            .pipe(Effect.provideService(Caller, human))
                    ).toMatchObject({ binding: { inputHash: 'TEST-ONLY:{"amount":"18"}', writeKey: 'target-20' } });
                    expect(yield* Ref.get(f.executions)).toBe(0);
                }
            )
    );

    it.scoped(
        'rejects wrong registered version, flags, missing registration and replacement drift without handler entry',
        /** Same-name actions and inventory metadata cannot substitute for the host's captured live registration. */ () =>
            Effect.gen(
                /** Keep every denial independent of codec/policy failures and confirm re-registration is newly resolved. */
                function* () {
                    // Restore each live gate before the next control so an earlier denial cannot mask a missing check.
                    const f = yield* fixture;
                    expect(
                        yield* Effect.flip(f.host.prepareApproval(action.name, { amount: '17' }, 'key', 2))
                    ).toMatchObject({
                        _tag: 'Forbidden',
                        reason: 'action-version-conflict',
                    });
                    yield* Ref.set(f.enabled, false);
                    expect(
                        yield* Effect.flip(f.host.prepareApproval(action.name, { amount: '17' }, 'key', 3))
                    ).toMatchObject({
                        _tag: 'Unavailable',
                        reason: 'flag-off',
                    });
                    yield* Ref.set(f.enabled, true);
                    yield* Scope.close(f.scope, Exit.void);
                    expect(
                        yield* Effect.flip(f.host.prepareApproval(action.name, { amount: '17' }, 'key', 3))
                    ).toMatchObject({
                        _tag: 'UnknownAction',
                    });
                    yield* f.host.register(f.module);
                    expect(yield* f.host.prepareApproval(action.name, { amount: '17' }, 'key', 3)).toMatchObject({
                        binding: { action: action.name, version: 3 },
                    });
                    expect(yield* Ref.get(f.executions)).toBe(0);
                }
            ).pipe(Effect.provideService(Caller, human))
    );

    it.scoped(
        'refuses a captured registration removed or gated off while live target policy is waiting',
        /** Both controls fail when preparation checks availability only before entering the codec/policy path. */ () =>
            Effect.gen(
                /** Replace or disable a real registered action between deterministic public preparation checkpoints. */
                function* () {
                    // Wait for policy entry before changing availability; a preflight-only implementation would succeed.
                    for (const change of ['replace', 'flag'] as const) {
                        const f = yield* fixture;
                        const entered = yield* Deferred.make<void>();
                        const release = yield* Deferred.make<void>();
                        yield* Ref.set(
                            f.beforePolicy,
                            Deferred.succeed(entered, undefined).pipe(Effect.zipRight(Deferred.await(release)))
                        );
                        const pending = yield* Effect.fork(
                            Effect.either(f.host.prepareApproval(action.name, { amount: '17' }, 'key', 3))
                        );
                        yield* Deferred.await(entered);
                        if (change === 'replace') {
                            yield* Scope.close(f.scope, Exit.void);
                            yield* f.host.register(f.module);
                        } else yield* Ref.set(f.enabled, false);
                        yield* Deferred.succeed(release, undefined);
                        expect(yield* Fiber.join(pending)).toMatchObject({
                            _tag: 'Left',
                            left: { _tag: change === 'replace' ? 'UnknownAction' : 'Unavailable' },
                        });
                        expect(yield* Ref.get(f.executions)).toBe(0);
                    }
                }
            ).pipe(Effect.provideService(Caller, human))
    );

    it.scoped(
        'refreshes identity, decoded target authorization and policy, refusing unsupported step-up and invalid keys',
        /** Preparation cannot mint review evidence using stale permission, malformed input or caller-selected bounds. */ () =>
            Effect.gen(
                /** Alter one authority at a time so each denial would fail if its live gate were omitted. */
                function* () {
                    // Restore target permission before malformed-input controls to keep their denial source distinct.
                    const f = yield* fixture;
                    yield* Ref.set(f.harness.authorization, { invoke: true, input: false });
                    expect(
                        yield* Effect.flip(f.host.prepareApproval(action.name, { amount: '17' }, 'key', 3))
                    ).toMatchObject({ reason: 'denied' });
                    yield* Ref.set(f.harness.authorization, { invoke: true, input: true });
                    expect(
                        yield* Effect.flip(f.host.prepareApproval(action.name, { amount: 'invalid' }, 'key', 3))
                    ).toMatchObject({ reason: 'denied' });
                    expect(
                        yield* Effect.flip(f.host.prepareApproval(action.name, { amount: '17' }, ' ', 3))
                    ).toMatchObject({ reason: 'invalid' });
                    yield* Ref.update(
                        f.harness.policy,
                        /** Invalid live bounds cannot be published as review evidence or deferred until persistence. */
                        (policy) => ({ ...policy, bounds: { amount: Number.NaN } })
                    );
                    expect(
                        yield* Effect.flip(f.host.prepareApproval(action.name, { amount: '17' }, 'key', 3))
                    ).toMatchObject({ reason: 'invalid' });
                    yield* Ref.update(
                        f.harness.policy,
                        /** Require assurance that the platform cannot fabricate. */ (policy) => ({
                            ...policy,
                            bounds: {},
                            stepUp: true,
                        })
                    );
                    expect(
                        yield* Effect.flip(f.host.prepareApproval(action.name, { amount: '17' }, 'key', 3))
                    ).toMatchObject({ reason: 'step-up' });
                    yield* Ref.set(f.harness.identityActive, false);
                    expect(
                        yield* Effect.flip(f.host.prepareApproval(action.name, { amount: '17' }, 'key', 3))
                    ).toMatchObject({ _tag: 'InvocationDenied' });
                    expect(yield* Ref.get(f.executions)).toBe(0);
                }
            ).pipe(Effect.provideService(Caller, human))
    );

    for (const sideEffect of ['write', 'read'] as const) {
        it.scoped(
            `binds ${sideEffect} proof lookup and successful use to live invocation input/key without consuming on replay or refusal`,
            /** Distinguish accepting lifecycle from admission, approved reads from replay and transactional writes from failures. */ () =>
                Effect.gen(
                    /** Exercise only volatile adapter mechanics; the SQL suites own durable rollback and same-client evidence. */
                    function* () {
                        // Approval use stages a ledger write for mutations, so calling it outside Integrity cannot pass.
                        const h = yield* makeTestOnlyHarness(human);
                        const ledger = yield* TestOnlyLedger.pipe(Effect.provide(h.TestOnly));
                        const uses = yield* Ref.make(0);
                        const inReadTransaction = yield* Ref.make(false);
                        const failUse = yield* Ref.make(false);
                        const spec = define(`fixture.accept-${sideEffect}`, {
                            version: 4,
                            description: 'Exercise registered accepting approval lifecycle.',
                            permission: 'fixture.accept',
                            sideEffect,
                            offline: 'online-only',
                            approval: 'confirm',
                            input: Schema.Struct({ amount: Schema.NumberFromString }),
                            output: Schema.Number,
                        });
                        const proof = {
                            principal: human.subject,
                            tenant: human.tenant,
                            action: spec.name,
                            version: 4,
                            inputHash: testOnlyDigest('{"amount":"17"}'),
                            approver: human,
                            issuedAt: 0,
                            expiresAt: 60_000,
                            stepUp: false,
                            limits: {},
                        };
                        const approvals = Layer.succeed(Approvals, {
                            /** Deny a changed canonical target or key even when the opaque approval id remains unchanged. */
                            get: (id, target) =>
                                Effect.gen(
                                    /** The context must come from the registered executor, never a fixture-captured binding. */
                                    function* () {
                                        // Unequal wire/decoded input detects forwarding a mutated or decoded target instead of canonical wire bytes.
                                        const caller = yield* Caller;
                                        if (
                                            id !== 'proof' ||
                                            target.action.spec.name !== spec.name ||
                                            target.action.spec.version !== 4 ||
                                            JSON.stringify(target.input) !== '{"amount":"17"}' ||
                                            !['target-19', 'target-fail'].includes(target.writeKey) ||
                                            caller.subject !== human.subject
                                        )
                                            return yield* new InvocationDenied({
                                                action: spec.name,
                                                reason: 'binding',
                                            });
                                        return proof;
                                    }
                                ),
                            /** Refusal before publication leaves no staged accepting mutation in the volatile ledger. */
                            use: () =>
                                Effect.gen(
                                    /** Require the correct accepting transaction instead of treating a successful lookup as consumption. */
                                    function* () {
                                        // A read must use its lifecycle transaction; mutations must already be inside Integrity.
                                        if (yield* Ref.get(failUse))
                                            return yield* new InvocationDenied({
                                                action: spec.name,
                                                reason: 'use-denied',
                                            });
                                        if (sideEffect === 'read') expect(yield* Ref.get(inReadTransaction)).toBe(true);
                                        else yield* ledger.stage('outbox', { proof: 'used' });
                                        yield* Ref.update(
                                            uses,
                                            /** Count accepting uses, not admission/replay lookups. */ (n) => n + 1
                                        );
                                    }
                                ),
                            /** Mark the approved-read lifecycle scope; no durable or SQL claim is made by this fixture. */
                            transaction: (effect) =>
                                Effect.acquireUseRelease(
                                    Ref.getAndSet(inReadTransaction, true),
                                    /** Preserve the callback's own error and service requirements. */ () => effect,
                                    /** Restore nesting state after success, refusal or interruption. */ (previous) =>
                                        Ref.set(inReadTransaction, previous)
                                ),
                        });
                        const host = Context.get(
                            yield* Layer.build(
                                ActionHostLive.pipe(
                                    Layer.provide(approvals),
                                    Layer.provide(h.TestOnly),
                                    Layer.provide(FlagsSafeDefaults)
                                )
                            ),
                            ActionHost
                        );
                        yield* host.register({
                            manifest: {
                                format: 1,
                                id: 'fixture',
                                version: '1.0.0',
                                description: 'Accepting lifecycle fixture.',
                                actions: [spec.name],
                                flags: [],
                            },
                            actions: [
                                implement(
                                    spec,
                                    /** Stage only mutation effects; an approved read still needs successful use and durable audit. */
                                    ({ amount }) =>
                                        (sideEffect === 'write'
                                            ? ledger.stage('domain', { amount })
                                            : Effect.void
                                        ).pipe(Effect.as(amount))
                                ),
                            ],
                        });
                        const options = { approvalId: 'proof', idempotencyKey: 'target-19' };
                        const first = yield* host.execute(spec.name, { amount: '17' }, options);
                        expect(first.result).toEqual(Exit.succeed(17));
                        expect(first.audit).toBe('durable');
                        const repeated = yield* host.execute(spec.name, { amount: '17' }, options);
                        expect(repeated.result).toEqual(Exit.succeed(17));
                        expect(repeated.replayed).toBe(sideEffect === 'write');
                        expect(yield* Ref.get(uses)).toBe(sideEffect === 'write' ? 1 : 2);
                        const wrongKey = yield* host.execute(
                            spec.name,
                            { amount: '17' },
                            {
                                ...options,
                                idempotencyKey: 'target-20',
                            }
                        );
                        expect(Exit.isFailure(wrongKey.result)).toBe(true);
                        const changed = yield* host.execute(spec.name, { amount: '18' }, options);
                        expect(Exit.isFailure(changed.result)).toBe(true);
                        yield* Ref.set(failUse, true);
                        const refused = yield* host.execute(
                            spec.name,
                            { amount: '17' },
                            {
                                ...options,
                                idempotencyKey: 'target-fail',
                            }
                        );
                        expect(Exit.isFailure(refused.result)).toBe(true);
                        const state = yield* Ref.get(h.state);
                        expect(state.domain).toHaveLength(sideEffect === 'write' ? 1 : 0);
                        expect(state.outbox).toHaveLength(sideEffect === 'write' ? 1 : 0);
                        expect(
                            state.receipts.filter(
                                /** Count only successful receipts, never durable denials. */ (r) =>
                                    r.outcome === 'succeeded'
                            )
                        ).toHaveLength(2);
                    }
                ).pipe(Effect.provideService(Caller, human))
        );
    }
});
