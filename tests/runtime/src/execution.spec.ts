/**
 * @file tests/runtime/src/execution.spec.ts
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

import { type ActionSpec, define, type Risk, type SideEffect } from '@eventiva/contracts/action';
import { Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { type Approval, canonicalJson, type InvocationResult, type InvokeOptions } from '@eventiva/runtime/invocation';
import { makeTestOnlyHarness, testOnlyDigest } from '@eventiva/runtime/testing';
import { describe, expect, it } from '@effect/vitest';
import {
    Cause,
    Clock,
    Context,
    Deferred,
    Effect,
    Either,
    Exit,
    Fiber,
    Layer,
    Option,
    Ref,
    Schema,
    TestClock,
} from 'effect';

const person = (id: string): CallerIdentity => ({
    subject: SubjectId.make(`0193a4f0-0000-7000-8000-${id.padStart(12, '0')}`),
    kind: 'human',
    tenant: TenantId.make('0193a4f0-0000-7000-8000-0000000000aa'),
    session: SessionId.make('0193a4f0-0000-7000-8000-0000000000bb'),
});
const human = person('1');
const approver = person('2');
const agent: CallerIdentity = { ...person('3'), kind: 'external-agent', onBehalfOf: human.subject };

class Rejected extends Schema.TaggedError<Rejected>()('Rejected', { reason: Schema.String }) {}

const Input = Schema.Struct({
    items: Schema.Array(Schema.String),
    amount: Schema.Number,
    behavior: Schema.optional(Schema.Literal('fail', 'defect', 'interrupt', 'outage', 'wait')),
});
const input = { items: ['ticket-a', 'ticket-b'], amount: 20 };
const spec = (
    sideEffect: SideEffect,
    extra: Partial<Pick<ActionSpec, 'risk' | 'approval' | 'sensitive' | 'offline'>> = {}
) =>
    define(`fixture.${sideEffect}`, {
        version: 2,
        description: `Representative ${sideEffect} fixture.`,
        input: Input,
        output: Schema.Struct({ count: Schema.Number }),
        error: Rejected,
        permission: `fixture.${sideEffect}`,
        sideEffect,
        offline: 'queued',
        ...extra,
    });

type Harness = Effect.Effect.Success<ReturnType<typeof makeTestOnlyHarness>>;
type FixtureSpec = ReturnType<typeof spec>;

const setup = (specs: ReadonlyArray<FixtureSpec> = [spec('read'), spec('write'), spec('external')]) =>
    Effect.gen(function* () {
        const h = yield* makeTestOnlyHarness(human);
        const calls = yield* Ref.make(0);
        const entered = yield* Deferred.make<void>();
        const release = yield* Deferred.make<void>();
        const context = yield* Layer.build(
            ActionHostLive.pipe(Layer.provide(h.TestOnly), Layer.provide(FlagsSafeDefaults))
        );
        const host = Context.get(context, ActionHost);
        yield* host.register({
            manifest: {
                format: 1,
                id: 'fixtures',
                version: '1.0.0',
                description: 'Test fixtures.',
                actions: specs.map((action) => action.name),
                flags: [],
            },
            actions: specs.map((action) =>
                implement(action, (decoded) =>
                    Effect.gen(function* () {
                        yield* Ref.update(calls, (n) => n + 1);
                        if (action.sideEffect !== 'read') {
                            yield* h.ledger.stage('domain', decoded);
                            yield* h.ledger.stage('history', { action: action.name, transition: 'committed' });
                            if (action.sideEffect === 'external') yield* h.ledger.stage('outbox', { command: decoded });
                        }
                        if (decoded.behavior === 'wait') {
                            yield* Deferred.succeed(entered, undefined);
                            yield* Deferred.await(release);
                        }
                        if (decoded.behavior === 'fail') return yield* new Rejected({ reason: 'fixture-failure' });
                        if (decoded.behavior === 'defect') return yield* Effect.dieMessage('fixture-defect');
                        if (decoded.behavior === 'interrupt') return yield* Effect.interrupt;
                        if (decoded.behavior === 'outage') yield* Ref.set(h.auditOnline, false);
                        return { count: decoded.items.length };
                    })
                )
            ),
        });
        const execute = (action: string, value: unknown = input, options: InvokeOptions = { idempotencyKey: 'key' }) =>
            host.execute(action, value, options).pipe(Effect.provideService(Caller, human));
        const invoke = (action: string, value: unknown = input, options: InvokeOptions = { idempotencyKey: 'key' }) =>
            host.invoke(action, value, options).pipe(Effect.provideService(Caller, human));
        return { h, calls, entered, release, execute, invoke };
    });

const approve = (h: Harness, action = 'fixture.write', value: unknown = input, patch: Partial<Approval> = {}) =>
    Effect.gen(function* () {
        const now = yield* Clock.currentTimeMillis;
        const caller = yield* Ref.get(h.identity);
        const canonical = canonicalJson(value);
        expect(Either.isRight(canonical)).toBe(true);
        const approval: Approval = {
            principal: caller.subject,
            tenant: caller.tenant,
            action,
            version: 2,
            inputHash: testOnlyDigest(Either.getOrElse(canonical, () => '<invalid-fixture>')),
            limits: { amount: 20, count: 2 },
            approver,
            issuedAt: now,
            expiresAt: now + 10_000,
            stepUp: true,
            ...patch,
        };
        yield* Ref.set(h.approvals, new Map([['approval', approval]]));
    });

const failure = (result: InvocationResult) =>
    Exit.isFailure(result.result) ? Option.getOrUndefined(Cause.failureOption(result.result.cause)) : undefined;
const denied = (result: InvocationResult, reason: string) => {
    expect(result.receipt.outcome).toBe('denied');
    expect(failure(result)).toMatchObject({ reason });
};

describe('A1: transaction integrity through ActionHost', () => {
    for (const sideEffect of ['write', 'external'] as const) {
        it.scoped(`commits ${sideEffect} state/history/outbox/receipt/dedup once under concurrent replay`, () =>
            Effect.gen(function* () {
                const t = yield* setup();
                const results = yield* Effect.all(
                    Array.from({ length: 12 }, () => t.execute(`fixture.${sideEffect}`)),
                    { concurrency: 'unbounded' }
                );
                expect(results.every((result) => Exit.isSuccess(result.result))).toBe(true);
                expect(results.filter((result) => !result.replayed)).toHaveLength(1);
                expect(yield* Ref.get(t.calls)).toBe(1);
                const state = yield* Ref.get(t.h.state);
                expect(state.domain).toEqual([input]);
                expect(state.history).toHaveLength(1);
                expect(state.outbox).toHaveLength(sideEffect === 'external' ? 1 : 0);
                expect(state.dedup.size).toBe(1);
                expect(state.receipts).toHaveLength(12);
                expect(new Set(state.receipts.map((receipt) => receipt.id)).size).toBe(12);
                for (const result of results) expect(state.receipts).toContainEqual(result.receipt);
            })
        );

        for (const behavior of ['fail', 'defect', 'interrupt'] as const) {
            it.scoped(`rolls back ${sideEffect} staged writes and dedup on handler ${behavior}`, () =>
                Effect.gen(function* () {
                    const t = yield* setup();
                    const result = yield* t.execute(`fixture.${sideEffect}`, { ...input, behavior });
                    expect(result.receipt.outcome).toBe(
                        behavior === 'fail' ? 'failed' : behavior === 'interrupt' ? 'interrupted' : 'defect'
                    );
                    const state = yield* Ref.get(t.h.state);
                    expect(state.domain).toEqual([]);
                    expect(state.history).toEqual([]);
                    expect(state.outbox).toEqual([]);
                    expect(state.dedup.size).toBe(0);
                    expect(state.receipts).toEqual([result.receipt]);
                    // A failed key was not consumed, so a corrected attempt may succeed.
                    expect(Exit.isSuccess((yield* t.execute(`fixture.${sideEffect}`)).result)).toBe(true);
                })
            );
        }
    }

    it.scoped('keeps staged writes invisible until commit, including an external outbox command', () =>
        Effect.gen(function* () {
            const t = yield* setup();
            const pending = yield* t.execute('fixture.external', { ...input, behavior: 'wait' }).pipe(Effect.fork);
            yield* Deferred.await(t.entered);
            expect(yield* Ref.get(t.h.state)).toMatchObject({ domain: [], history: [], outbox: [], receipts: [] });
            yield* Deferred.succeed(t.release, undefined);
            expect(Exit.isSuccess((yield* Fiber.join(pending)).result)).toBe(true);
            expect((yield* Ref.get(t.h.state)).outbox).toHaveLength(1);
        })
    );

    it.scoped('rolls back an interrupted in-flight transaction and releases the key lock', () =>
        Effect.gen(function* () {
            const t = yield* setup();
            const pending = yield* t.execute('fixture.external', { ...input, behavior: 'wait' }).pipe(Effect.fork);
            yield* Deferred.await(t.entered);
            yield* Fiber.interrupt(pending);
            const state = yield* Ref.get(t.h.state);
            expect(state.domain).toEqual([]);
            expect(state.history).toEqual([]);
            expect(state.outbox).toEqual([]);
            expect(state.dedup.size).toBe(0);
            expect(state.receipts.map((receipt) => receipt.outcome)).toEqual(['interrupted']);
            expect(Exit.isSuccess((yield* t.execute('fixture.external')).result)).toBe(true);
        })
    );

    it.scoped('rejects changed input under a committed key without rerunning the handler', () =>
        Effect.gen(function* () {
            const t = yield* setup();
            yield* t.execute('fixture.write');
            denied(yield* t.execute('fixture.write', { ...input, items: ['ticket-c'] }), 'idempotency-conflict');
            expect(yield* Ref.get(t.calls)).toBe(1);
            expect((yield* Ref.get(t.h.state)).domain).toEqual([input]);
        })
    );

    it.scoped('requires a mutation key but not a read key, and invoke projects execute results', () =>
        Effect.gen(function* () {
            const t = yield* setup();
            denied(yield* t.execute('fixture.write', input, {}), 'idempotency-key-required');
            expect(yield* t.invoke('fixture.read', input, {})).toEqual({ count: 2 });
            expect(yield* t.invoke('fixture.write')).toEqual({ count: 2 });
            expect((yield* Ref.get(t.h.state)).receipts).toHaveLength(3);
        })
    );
});

describe('A2: live authority and exact human approval', () => {
    const invalidApprovals: ReadonlyArray<readonly [string, Partial<Approval>, string]> = [
        ['agent self approval', { approver: agent }, 'human-approval-required'],
        ['human sharing the agent subject', { approver: { ...agent, kind: 'human' } }, 'human-approval-required'],
        ['wrong principal', { principal: human.subject }, 'approval-binding'],
        ['wrong tenant', { tenant: 'other-tenant' }, 'approval-binding'],
        [
            'wrong approver tenant',
            { approver: { ...approver, tenant: TenantId.make('0193a4f0-0000-7000-8000-0000000000cc') } },
            'approval-binding',
        ],
        ['wrong action', { action: 'fixture.external' }, 'approval-binding'],
        ['stale action version', { version: 1 }, 'approval-binding'],
        ['wrong hash', { inputHash: 'not-the-input' }, 'approval-binding'],
        ['expired', { expiresAt: 0 }, 'approval-expired'],
        ['future issuance', { issuedAt: 10_000 }, 'approval-expired'],
        ['invalid lifetime', { issuedAt: 0, expiresAt: 0 }, 'approval-expired'],
        ['nonfinite expiry', { expiresAt: Infinity }, 'approval-expired'],
        ['nonfinite issuance', { issuedAt: NaN }, 'approval-expired'],
    ];
    for (const [name, patch, reason] of invalidApprovals) {
        it.scoped(`denies ${name} before handler execution`, () =>
            Effect.gen(function* () {
                const t = yield* setup();
                yield* Ref.set(t.h.identity, agent);
                yield* approve(t.h, 'fixture.write', input, patch);
                denied(
                    yield* t.execute('fixture.write', input, { idempotencyKey: 'key', approvalId: 'approval' }),
                    reason
                );
                expect(yield* Ref.get(t.calls)).toBe(0);
                expect((yield* Ref.get(t.h.state)).receipts).toHaveLength(1);
            })
        );
    }

    it.scoped('binds the exact batch, not just equal count and aggregate amount', () =>
        Effect.gen(function* () {
            const t = yield* setup();
            yield* Ref.set(t.h.identity, agent);
            yield* approve(t.h);
            denied(
                yield* t.execute(
                    'fixture.write',
                    { ...input, items: ['ticket-a', 'ticket-c'] },
                    { idempotencyKey: 'key', approvalId: 'approval' }
                ),
                'approval-binding'
            );
            expect(yield* Ref.get(t.calls)).toBe(0);
        })
    );

    for (const bounds of [
        { amount: 21 },
        { count: 3 },
        { missing: 1 },
        { amount: -1 },
        { amount: Infinity },
        { amount: NaN },
    ]) {
        it.scoped(`rejects invalid or exceeded live approval bounds ${JSON.stringify(bounds)}`, () =>
            Effect.gen(function* () {
                const t = yield* setup();
                yield* Ref.set(t.h.identity, agent);
                yield* Ref.update(t.h.policy, (p) => ({ ...p, bounds }));
                yield* approve(t.h);
                denied(
                    yield* t.execute('fixture.write', input, { idempotencyKey: 'key', approvalId: 'approval' }),
                    'approval-limit'
                );
                expect(yield* Ref.get(t.calls)).toBe(0);
            })
        );
    }

    it.scoped('permits routine human writes and a bounded preauthorized agent but not an unapproved agent', () =>
        Effect.gen(function* () {
            const t = yield* setup();
            expect(Exit.isSuccess((yield* t.execute('fixture.write')).result)).toBe(true);
            yield* Ref.set(t.h.identity, agent);
            denied(yield* t.execute('fixture.write'), 'approval-required');
            yield* Ref.update(t.h.policy, (p) => ({
                ...p,
                routinePreauthorized: true,
                bounds: { amount: 20, count: 2 },
            }));
            expect(Exit.isSuccess((yield* t.execute('fixture.write')).result)).toBe(true);
            yield* Ref.update(t.h.policy, (p) => ({ ...p, routinePreauthorized: false }));
            yield* approve(t.h);
            expect(
                Exit.isSuccess(
                    (yield* t.execute('fixture.write', input, { idempotencyKey: 'approved', approvalId: 'approval' }))
                        .result
                )
            ).toBe(true);
        })
    );

    for (const risk of [
        'irreversible',
        'financial',
        'permission',
        'capacity',
        'stock',
        'live-production',
    ] as const satisfies ReadonlyArray<Risk>) {
        it.scoped(`never lowers the ${risk} approval floor for a preauthorized agent`, () =>
            Effect.gen(function* () {
                const t = yield* setup([spec('write', { risk })]);
                yield* Ref.set(t.h.identity, agent);
                yield* Ref.update(t.h.policy, (p) => ({ ...p, routinePreauthorized: true }));
                const options = { idempotencyKey: 'key', deadline: 10_000 };
                denied(yield* t.execute('fixture.write', input, options), 'approval-required');
                yield* approve(t.h);
                expect(
                    Exit.isSuccess(
                        (yield* t.execute('fixture.write', input, { ...options, approvalId: 'approval' })).result
                    )
                ).toBe(true);
            })
        );
    }

    for (const approval of ['confirm', 'always'] as const) {
        it.scoped(`honors specification approval ${approval} even for a routine human action`, () =>
            Effect.gen(function* () {
                const t = yield* setup([spec('write', { approval })]);
                denied(yield* t.execute('fixture.write'), 'approval-required');
                yield* approve(t.h);
                expect(
                    Exit.isSuccess(
                        (yield* t.execute('fixture.write', input, { idempotencyKey: 'key', approvalId: 'approval' }))
                            .result
                    )
                ).toBe(true);
            })
        );
    }

    it.scoped('raises tenant policy and step-up requirements on replay', () =>
        Effect.gen(function* () {
            const t = yield* setup();
            yield* t.execute('fixture.write');
            yield* Ref.update(t.h.policy, (p) => ({ ...p, approval: 'always' as const, stepUp: true }));
            denied(yield* t.execute('fixture.write'), 'approval-required');
            yield* approve(t.h, 'fixture.write', input, { stepUp: false });
            denied(
                yield* t.execute('fixture.write', input, { idempotencyKey: 'key', approvalId: 'approval' }),
                'step-up-required'
            );
            yield* approve(t.h);
            expect(
                (yield* t.execute('fixture.write', input, { idempotencyKey: 'key', approvalId: 'approval' })).replayed
            ).toBe(true);
            expect(yield* Ref.get(t.calls)).toBe(1);
        })
    );

    it.scoped('expires an approval on replay at the exact expiry boundary', () =>
        Effect.gen(function* () {
            const t = yield* setup();
            yield* Ref.set(t.h.identity, agent);
            yield* approve(t.h);
            const options = { idempotencyKey: 'key', approvalId: 'approval' };
            expect(Exit.isSuccess((yield* t.execute('fixture.write', input, options)).result)).toBe(true);
            yield* TestClock.adjust(10_000);
            denied(yield* t.execute('fixture.write', input, options), 'approval-expired');
            expect(yield* Ref.get(t.calls)).toBe(1);
        })
    );

    it.scoped('applies the same routine mutation approval control to a first-party agent', () =>
        Effect.gen(function* () {
            const t = yield* setup();
            yield* Ref.set(t.h.identity, { ...agent, kind: 'first-party-agent' as const });
            denied(yield* t.execute('fixture.external'), 'approval-required');
            yield* approve(t.h, 'fixture.external');
            expect(
                Exit.isSuccess(
                    (yield* t.execute('fixture.external', input, { idempotencyKey: 'key', approvalId: 'approval' }))
                        .result
                )
            ).toBe(true);
        })
    );

    for (const revoked of ['identity', 'permission', 'target', 'approval'] as const) {
        it.scoped(`denies committed replays after ${revoked} revocation`, () =>
            Effect.gen(function* () {
                const t = yield* setup();
                yield* Ref.set(t.h.identity, agent);
                yield* approve(t.h);
                const options = { idempotencyKey: 'key', approvalId: 'approval' };
                yield* t.execute('fixture.write', input, options);
                if (revoked === 'identity') yield* Ref.set(t.h.identityActive, false);
                if (revoked === 'permission') yield* Ref.set(t.h.authorization, { invoke: false, input: true });
                if (revoked === 'target') yield* Ref.set(t.h.authorization, { invoke: true, input: false });
                if (revoked === 'approval') yield* Ref.set(t.h.approvals, new Map());
                const result = yield* t.execute('fixture.write', input, options);
                expect(result.receipt.outcome).toBe('denied');
                expect(result.replayed).toBe(false);
                expect(yield* Ref.get(t.calls)).toBe(1);
                expect((yield* Ref.get(t.h.state)).receipts).toHaveLength(2);
            })
        );
    }

    it.scoped('uses refreshed identity and delegation rather than the presented session claims', () =>
        Effect.gen(function* () {
            const t = yield* setup();
            yield* t.execute('fixture.write');
            expect(yield* Ref.get(t.h.resolved)).toContainEqual(human);
            yield* Ref.set(t.h.resolved, []);
            yield* Ref.set(t.h.identity, agent);
            const result = yield* t.execute('fixture.write');
            denied(result, 'approval-required');
            expect(result.receipt.caller).toEqual(agent);
            expect(yield* Ref.get(t.h.resolved)).toEqual([agent]);
            expect(yield* Ref.get(t.calls)).toBe(1);
        })
    );
});

describe('A3: delayed and guarded intent revalidation', () => {
    for (const replay of [false, true]) {
        for (const change of [
            'identity',
            'permission',
            'approval',
            'deadline',
            'state',
            'dependency',
            'capacity',
        ] as const) {
            it.scoped(`revalidates ${change} after an Integrity wait on ${replay ? 'replay' : 'new work'}`, () =>
                Effect.gen(function* () {
                    const t = yield* setup();
                    yield* Ref.update(t.h.policy, (p) => ({ ...p, approval: 'always' as const }));
                    yield* approve(t.h);
                    const options: InvokeOptions = {
                        idempotencyKey: 'key',
                        approvalId: 'approval',
                        deadline: 100,
                        expectedState: 'open',
                    };
                    if (replay)
                        expect(Exit.isSuccess((yield* t.execute('fixture.write', input, options)).result)).toBe(true);
                    yield* Ref.set(
                        t.h.beforeIntegrity,
                        Deferred.succeed(t.entered, undefined).pipe(Effect.zipRight(Deferred.await(t.release)))
                    );
                    const pending = yield* t.execute('fixture.write', input, options).pipe(Effect.fork);
                    yield* Deferred.await(t.entered);
                    if (change === 'identity') yield* Ref.set(t.h.identity, approver);
                    if (change === 'permission') yield* Ref.set(t.h.authorization, { invoke: false, input: true });
                    if (change === 'approval') yield* Ref.set(t.h.approvals, new Map());
                    if (change === 'deadline') yield* TestClock.adjust(100);
                    if (change === 'state') yield* Ref.update(t.h.policy, (p) => ({ ...p, currentState: 'closed' }));
                    if (change === 'dependency')
                        yield* Ref.update(t.h.policy, (p) => ({ ...p, dependenciesReady: false }));
                    if (change === 'capacity')
                        yield* Ref.update(t.h.policy, (p) => ({ ...p, capacityAvailable: false }));
                    yield* Deferred.succeed(t.release, undefined);
                    const reasons = {
                        identity: 'identity-changed',
                        permission: 'permission-revoked',
                        approval: 'approval-revoked',
                        deadline: 'expired',
                        state: 'state-conflict',
                        dependency: 'dependency-conflict',
                        capacity: 'capacity-conflict',
                    };
                    denied(yield* Fiber.join(pending), reasons[change]);
                    expect(yield* Ref.get(t.calls)).toBe(replay ? 1 : 0);
                    const state = yield* Ref.get(t.h.state);
                    expect(state.domain).toHaveLength(replay ? 1 : 0);
                    expect(state.history).toHaveLength(replay ? 1 : 0);
                    expect(state.dedup.size).toBe(replay ? 1 : 0);
                    expect(state.receipts).toHaveLength(replay ? 2 : 1);
                })
            );
        }
    }

    const cases: ReadonlyArray<readonly [string, InvokeOptions, string]> = [
        ['future schedule', { mode: 'scheduled', notBefore: 1, deadline: 100 }, 'not-before'],
        ['missing schedule window', { mode: 'scheduled' }, 'schedule-window-required'],
        ['missing schedule deadline', { mode: 'scheduled', notBefore: 0 }, 'schedule-window-required'],
        ['expired deadline', { deadline: 0 }, 'expired'],
        ['version conflict', { expectedVersion: 'old' }, 'version-conflict'],
        ['state conflict', { expectedState: 'closed' }, 'state-conflict'],
        ['malformed intent', { deadline: NaN }, 'invalid-intent'],
    ];
    for (const [name, options, reason] of cases) {
        it.scoped(`rejects ${name}, including a previously committed key`, () =>
            Effect.gen(function* () {
                const t = yield* setup();
                yield* t.execute('fixture.write');
                denied(yield* t.execute('fixture.write', input, { idempotencyKey: 'key', ...options }), reason);
                expect(yield* Ref.get(t.calls)).toBe(1);
            })
        );
    }

    for (const gate of ['dependenciesReady', 'capacityAvailable'] as const) {
        it.scoped(`rechecks live ${gate} on replay and recovery`, () =>
            Effect.gen(function* () {
                const t = yield* setup();
                yield* t.execute('fixture.external');
                yield* Ref.update(t.h.policy, (p) => ({ ...p, [gate]: false }));
                denied(
                    yield* t.execute('fixture.external'),
                    gate === 'dependenciesReady' ? 'dependency-conflict' : 'capacity-conflict'
                );
                expect(yield* Ref.get(t.calls)).toBe(1);
                yield* Ref.update(t.h.policy, (p) => ({ ...p, [gate]: true }));
                expect((yield* t.execute('fixture.external')).replayed).toBe(true);
            })
        );
    }

    it.scoped('accepts an open scheduled window with current state and version', () =>
        Effect.gen(function* () {
            const t = yield* setup();
            expect(
                Exit.isSuccess(
                    (yield* t.execute('fixture.write', input, {
                        idempotencyKey: 'scheduled',
                        mode: 'scheduled',
                        notBefore: 0,
                        deadline: 100,
                        expectedVersion: '1',
                        expectedState: 'open',
                    })).result
                )
            ).toBe(true);
        })
    );

    it.scoped('revalidates scheduled state, version and deadline after initial success', () =>
        Effect.gen(function* () {
            const t = yield* setup();
            const options: InvokeOptions = {
                idempotencyKey: 'scheduled',
                mode: 'scheduled',
                notBefore: 0,
                deadline: 100,
                expectedVersion: '1',
                expectedState: 'open',
            };
            expect(Exit.isSuccess((yield* t.execute('fixture.write', input, options)).result)).toBe(true);
            yield* Ref.update(t.h.policy, (p) => ({ ...p, currentVersion: '2' }));
            denied(yield* t.execute('fixture.write', input, options), 'version-conflict');
            yield* Ref.update(t.h.policy, (p) => ({ ...p, currentVersion: '1', currentState: 'closed' }));
            denied(yield* t.execute('fixture.write', input, options), 'state-conflict');
            yield* Ref.update(t.h.policy, (p) => ({ ...p, currentState: 'open' }));
            yield* TestClock.adjust(100);
            denied(yield* t.execute('fixture.write', input, options), 'expired');
            expect(yield* Ref.get(t.calls)).toBe(1);
        })
    );

    it.scoped('requires guarded offline intent for risky work and a deadline for live production', () =>
        Effect.gen(function* () {
            const t = yield* setup([spec('write', { risk: 'stock' }), spec('external', { risk: 'live-production' })]);
            denied(
                yield* t.execute('fixture.write', input, { idempotencyKey: 'key', mode: 'offline-intent' }),
                'guarded-intent-required'
            );
            denied(yield* t.execute('fixture.external'), 'deadline-required');
            yield* approve(t.h);
            expect(
                Exit.isSuccess(
                    (yield* t.execute('fixture.write', input, {
                        idempotencyKey: 'key',
                        approvalId: 'approval',
                        mode: 'offline-intent',
                        deadline: 100,
                        expectedVersion: '1',
                        expectedState: 'open',
                    })).result
                )
            ).toBe(true);
        })
    );

    it.scoped('rejects offline execution for an online-only action', () =>
        Effect.gen(function* () {
            const t = yield* setup([spec('external', { offline: 'online-only' })]);
            denied(
                yield* t.execute('fixture.external', input, { idempotencyKey: 'key', mode: 'offline-intent' }),
                'online-only'
            );
            expect(yield* Ref.get(t.calls)).toBe(0);
        })
    );

    for (const risk of ['financial', 'live-production'] as const) {
        it.scoped(`never relaxes the ${risk} online-only floor through queued metadata`, () =>
            Effect.gen(function* () {
                const t = yield* setup([spec('write', { risk, offline: 'queued' })]);
                yield* approve(t.h);
                denied(
                    yield* t.execute('fixture.write', input, {
                        idempotencyKey: 'key',
                        approvalId: 'approval',
                        mode: 'offline-intent',
                        deadline: 100,
                        expectedVersion: '1',
                        expectedState: 'open',
                    }),
                    'online-only'
                );
                expect(yield* Ref.get(t.calls)).toBe(0);
            })
        );
    }
});

describe('A4: receipts, fail-closed audit and bounded recovery', () => {
    for (const sideEffect of ['write', 'external', 'read'] as const) {
        it.scoped(`fails closed during audit outage for ${sideEffect === 'read' ? 'sensitive read' : sideEffect}`, () =>
            Effect.gen(function* () {
                const t = yield* setup([spec(sideEffect, { sensitive: sideEffect === 'read' })]);
                yield* Ref.set(t.h.auditOnline, false);
                const error = yield* Effect.flip(t.execute(`fixture.${sideEffect}`));
                expect(error._tag).toBe('AuditUnavailable');
                expect(yield* Ref.get(t.calls)).toBe(0);
                expect((yield* Ref.get(t.h.state)).domain).toEqual([]);
                expect((yield* Ref.get(t.h.state)).spool).toEqual([]);
            })
        );
    }

    it.scoped('rolls back staged mutation if audit fails after preflight', () =>
        Effect.gen(function* () {
            const t = yield* setup();
            expect((yield* Effect.flip(t.execute('fixture.external', { ...input, behavior: 'outage' })))._tag).toBe(
                'AuditUnavailable'
            );
            const state = yield* Ref.get(t.h.state);
            expect(state.domain).toEqual([]);
            expect(state.history).toEqual([]);
            expect(state.outbox).toEqual([]);
            expect(state.dedup.size).toBe(0);
        })
    );

    it.scoped('spools routine reads only within capacity and recovers each receipt exactly once', () =>
        Effect.gen(function* () {
            const t = yield* setup();
            yield* Ref.set(t.h.auditOnline, false);
            yield* Ref.set(t.h.spoolCapacity, 2);
            const a = yield* t.execute('fixture.read');
            const b = yield* t.execute('fixture.read');
            expect(a.audit).toBe('spooled');
            expect(b.audit).toBe('spooled');
            expect((yield* Ref.get(t.h.state)).spool).toEqual([a.receipt, b.receipt]);
            expect((yield* Effect.flip(t.execute('fixture.read')))._tag).toBe('AuditUnavailable');
            expect((yield* Ref.get(t.h.state)).spool).toHaveLength(2);
            expect((yield* Effect.flip(t.h.recover))._tag).toBe('AuditUnavailable');
            yield* Ref.set(t.h.auditOnline, true);
            yield* Effect.all([t.h.recover, t.h.recover], { concurrency: 'unbounded' });
            yield* t.h.recover;
            const recovered = yield* Ref.get(t.h.state);
            expect(recovered.spool).toEqual([]);
            expect(recovered.receipts).toEqual([a.receipt, b.receipt]);
            const c = yield* t.execute('fixture.read');
            expect(c.audit).toBe('durable');
            expect((yield* Ref.get(t.h.state)).receipts).toHaveLength(3);
        })
    );

    it.scoped('records unknown, invalid, forbidden, declared failure, defect and successful outcomes', () =>
        Effect.gen(function* () {
            const t = yield* setup();
            const results = [
                yield* t.execute('fixture.missing'),
                yield* t.execute('fixture.read', { amount: 'invalid' }),
                yield* t.execute('fixture.read', { ...input, behavior: 'fail' }),
                yield* t.execute('fixture.read', { ...input, behavior: 'defect' }),
                yield* t.execute('fixture.read'),
            ] as const;
            yield* Ref.set(t.h.authorization, { invoke: false, input: true });
            const all = [...results, yield* t.execute('fixture.read')];
            expect(all.map((result) => result.receipt.outcome)).toEqual([
                'denied',
                'denied',
                'failed',
                'defect',
                'succeeded',
                'denied',
            ]);
            expect(failure(results[0])).toMatchObject({ _tag: 'UnknownAction' });
            expect(failure(results[1])).toMatchObject({ _tag: 'InvalidInput' });
            expect(failure(results[2])).toMatchObject({
                _tag: 'ActionFailed',
                error: { _tag: 'Rejected', reason: 'fixture-failure' },
            });
            const receipts = (yield* Ref.get(t.h.state)).receipts;
            for (const result of all) {
                expect(receipts).toContainEqual(result.receipt);
                expect(result.receipt.durationMs).toBeGreaterThanOrEqual(0);
                expect(result.receipt.inputHash).toMatch(/^TEST-ONLY:/);
                expect(result.receipt.caller).toEqual(human);
            }
            expect(receipts).toHaveLength(6);
            expect(yield* Ref.get(t.calls)).toBe(3);
        })
    );
});
