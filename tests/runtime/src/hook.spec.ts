/**
 * @file tests/runtime/src/hook.spec.ts
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
import { Caller } from '@eventiva/contracts/caller';
import { define } from '@eventiva/contracts/action';
import { Flags, FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { TenantId, SubjectId, SessionId } from '@eventiva/contracts/ids';
import {
    HookDeclaration,
    HookEvent,
    HookDenied,
    HookObserverFailure,
    HookOutbox,
    HookOutboxFailure,
    HookOutboxUnavailable,
    HookReleaseDeny,
    HookReleasePolicy,
    type HookClaim,
    type HookSettlement,
} from '@eventiva/contracts/hook';
import { HookDispatcher, HookDispatcherLive, HookSink, HookSinkUnavailable } from '@eventiva/runtime/hook';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { implement } from '@eventiva/runtime/action';
import { makeTestOnlyHarness } from '@eventiva/runtime/testing';
import { Clock, Context, Deferred, Effect, Exit, Fiber, Layer, Ref, Schema, Scope, TestClock } from 'effect';

const uuid = (n: number) => `019b0000-0000-7000-8000-${n.toString().padStart(12, '0')}`;
const tenant = TenantId.make(uuid(1));
const owner = { module: 'fixture', version: '1.0.0', generation: 1 };
const declaration = (hook = 'fixture.observe', patch: Partial<HookDeclaration> = {}) =>
    Schema.decodeUnknownSync(HookDeclaration)({
        format: 1,
        pin: { tenant, owner, hook, revision: 1 },
        delivery: 'post-commit',
        target: 'declarative',
        capability: { kind: 'observation' },
        observations: ['domain.change'],
        profiles: ['baseline', 'sensitive', 'restricted', 'vault'],
        maxAttempts: 2,
        retryDelayMs: 10,
        timeoutMs: 100,
        concurrency: 1,
        capacity: 4,
        ...patch,
    });
const event = (n = 1, patch: Partial<HookEvent> = {}) =>
    Schema.decodeUnknownSync(HookEvent)({
        format: 1,
        id: uuid(n + 10),
        tenant,
        commit: uuid(n + 20),
        resource: 'fixture.record',
        resourceId: uuid(5),
        purpose: 'fixture.notify',
        profile: 'baseline',
        operation: 'ordinary',
        sequence: n,
        projection: { kind: 'domain.change', identity: owner, change: 'updated', revision: n },
        ...patch,
    });
const samePin = (a: HookDeclaration['pin'], b: HookDeclaration['pin']) => JSON.stringify(a) === JSON.stringify(b);
type Row = {
    claim: HookClaim;
    declaration: HookDeclaration;
    state: 'pending' | 'running' | HookSettlement['state'];
    due: number;
};

/** VOLATILE TEST MODEL ONLY. Exercises dispatch protocol; NOT proof of a durable production binding. */
const setup = (
    options: {
        readonly deliver?: Context.Tag.Service<typeof HookSink>['deliver'];
        readonly authorize?: Context.Tag.Service<typeof HookReleasePolicy>['authorize'];
        readonly enabled?: boolean;
        readonly corruptClaim?: (claim: HookClaim) => void;
        readonly settleFailure?: boolean;
    } = {}
) =>
    Effect.gen(function* () {
        const rows = yield* Ref.make<ReadonlyArray<Row>>([]);
        const calls = yield* Ref.make<ReadonlyArray<{ event: HookEvent; key: string }>>([]);
        const policyCalls = yield* Ref.make(0);
        const outbox = HookOutbox.of({
            stage: (source, observers) =>
                Ref.modify(rows, (all): readonly [Effect.Effect<void, HookOutboxFailure>, ReadonlyArray<Row>] => {
                    const added: Array<Row> = [];
                    for (const d of observers) {
                        const prior = all.find((r) => samePin(r.claim.pin, d.pin) && r.claim.event.id === source.id);
                        if (prior !== undefined) {
                            if (JSON.stringify(prior.claim.event) !== JSON.stringify(source))
                                return [Effect.fail(new HookOutboxFailure({ reason: 'conflict' })), all];
                            continue;
                        }
                        if (
                            all.filter(
                                (r) => samePin(r.claim.pin, d.pin) && !['delivered', 'dead-letter'].includes(r.state)
                            ).length >= d.capacity
                        )
                            return [Effect.fail(new HookOutboxFailure({ reason: 'capacity' })), all];
                        added.push({
                            declaration: d,
                            state: 'pending',
                            due: 0,
                            claim: {
                                pin: d.pin,
                                event: source,
                                attempt: 0,
                                lease: uuid(100 + all.length + added.length),
                                idempotencyKey: uuid(200 + all.length + added.length),
                            },
                        });
                    }
                    return [Effect.void, [...all, ...added]];
                }).pipe(Effect.flatten),
            claim: (d, now) =>
                Ref.modify(rows, (all) => {
                    const candidate = all.find(
                        (r) =>
                            samePin(r.claim.pin, d.pin) &&
                            (r.state === 'pending' || r.state === 'retry') &&
                            r.due <= now &&
                            !all.some(
                                (earlier) =>
                                    samePin(earlier.claim.pin, d.pin) &&
                                    earlier.claim.event.resource === r.claim.event.resource &&
                                    earlier.claim.event.sequence < r.claim.event.sequence &&
                                    !['delivered', 'dead-letter'].includes(earlier.state)
                            )
                    );
                    if (candidate === undefined) return [undefined, all];
                    const claim = {
                        ...candidate.claim,
                        attempt: candidate.claim.attempt + 1,
                    };
                    // Deliberately corrupt only the specified fields at the adapter boundary.
                    options.corruptClaim?.(claim);
                    return [claim, all.map((r) => (r === candidate ? { ...r, claim, state: 'running' as const } : r))];
                }),
            settle: (claim, settlement) =>
                Ref.modify(rows, (all): readonly [Effect.Effect<void, HookOutboxFailure>, ReadonlyArray<Row>] => {
                    if (options.settleFailure)
                        return [Effect.fail(new HookOutboxFailure({ reason: 'unavailable' })), all];
                    const row = all.find((r) => r.claim.lease === claim.lease && r.claim.attempt === claim.attempt);
                    if (row === undefined) return [Effect.fail(new HookOutboxFailure({ reason: 'lease-lost' })), all];
                    return [
                        Effect.void,
                        all.map((r) =>
                            r !== row
                                ? r
                                : {
                                      ...r,
                                      state: settlement.state,
                                      due: settlement.state === 'retry' ? settlement.availableAt : 0,
                                  }
                        ),
                    ];
                }).pipe(Effect.flatten),
        });
        const layer = HookDispatcherLive.pipe(
            Layer.provide(
                Layer.mergeAll(
                    Layer.succeed(HookOutbox, outbox),
                    Layer.succeed(HookSink, {
                        deliver: (d, e, key) =>
                            Ref.update(calls, (all) => [...all, { event: e, key }]).pipe(
                                Effect.zipRight(options.deliver?.(d, e, key) ?? Effect.void)
                            ),
                    }),
                    Layer.succeed(HookReleasePolicy, {
                        authorize: (d, e, requirements) =>
                            Ref.update(policyCalls, (n) => n + 1).pipe(
                                Effect.zipRight(options.authorize?.(d, e, requirements) ?? Effect.void)
                            ),
                    }),
                    Layer.succeed(Flags, {
                        evaluate: (flag) =>
                            Effect.succeed({
                                flag: flag.key,
                                value: options.enabled ?? true,
                                reason: 'TEST',
                                fallback: false,
                            }),
                    })
                )
            )
        );
        const dispatcher = Context.get(yield* Layer.build(layer), HookDispatcher);
        return { dispatcher, outbox, rows, calls, policyCalls };
    });

it.scoped('retries observers independently with stable keys and ordered stream heads, then dead-letters', () =>
    Effect.gen(function* () {
        const t = yield* setup({
            deliver: (d) => (d.pin.hook === 'fixture.bad' ? Effect.fail(new HookObserverFailure()) : Effect.void),
        });
        const bad = declaration('fixture.bad');
        const good = declaration('fixture.good');
        yield* t.outbox.stage(event(), [bad, good]);
        yield* t.outbox.stage(event(2), [bad, good]);
        const a = yield* t.dispatcher.register(bad);
        const b = yield* t.dispatcher.register(good);
        expect(yield* a.dispatch).toBe('retry');
        expect(yield* b.dispatch).toBe('delivered');
        expect(yield* b.dispatch).toBe('delivered');
        expect(yield* a.dispatch).toBe('empty');
        yield* TestClock.adjust(10);
        expect(yield* a.dispatch).toBe('dead-letter');
        expect(yield* a.dispatch).toBe('retry');
        const calls = yield* Ref.get(t.calls);
        expect(calls.map((c) => c.event.sequence)).toEqual([1, 1, 2, 1, 2]);
        expect(calls[0]?.key).toBe(calls[3]?.key);
        expect((yield* Ref.get(t.rows)).map((r) => r.state)).toEqual([
            'dead-letter',
            'delivered',
            'retry',
            'delivered',
        ]);
    })
);

it.scoped('bounds pending capacity, deduplicates staging and rejects changed event content', () =>
    Effect.gen(function* () {
        const t = yield* setup();
        const d = declaration('fixture.observe', { capacity: 1 });
        yield* t.outbox.stage(event(), [d]);
        yield* t.outbox.stage(event(), [d]);
        expect((yield* Effect.flip(t.outbox.stage(event(2), [d]))).reason).toBe('capacity');
        expect((yield* Effect.flip(t.outbox.stage(event(1, { purpose: 'different' }), [d]))).reason).toBe('conflict');
        const h = yield* t.dispatcher.register(d);
        expect(yield* h.dispatch).toBe('delivered');
        yield* t.outbox.stage(event(2), [d]);
        expect(yield* h.dispatch).toBe('delivered');
        expect(yield* Ref.get(t.calls)).toHaveLength(2);
    })
);

it.scoped('runs authorized additive commands and ordinary executable observations without operation authority', () =>
    Effect.gen(function* () {
        const t = yield* setup();
        const code = yield* Ref.make<ReadonlyArray<string>>([]);
        const d = declaration('fixture.add', {
            capability: { kind: 'additive', action: 'notification.enqueue', version: 2 },
        });
        yield* t.outbox.stage(event(), [d]);
        expect(yield* (yield* t.dispatcher.register(d)).dispatch).toBe('delivered');
        const executable = declaration('fixture.code', { target: 'executable' });
        yield* t.outbox.stage(event(2), [executable]);
        const h = yield* t.dispatcher.register(executable, (e, key) =>
            Effect.gen(function* () {
                expect(Reflect.set(e, 'profile', 'vault')).toBe(false);
                expect(Reflect.set(e.projection, 'secret', 'FORBIDDEN')).toBe(false);
                if ('identity' in e.projection)
                    expect(Reflect.set(e.projection.identity, 'generation', 99)).toBe(false);
                yield* Ref.update(code, (all) => [...all, `${e.id}:${key}`]);
            })
        );
        expect(yield* h.dispatch).toBe('delivered');
        expect(yield* Ref.get(code)).toHaveLength(1);
        expect((yield* Ref.get(t.calls))[0]?.event).toEqual(event());
    })
);

it.scoped(
    'validates registration and snapshots declaration/pin data rather than retaining mutable caller objects',
    () =>
        Effect.gen(function* () {
            const t = yield* setup();
            const d = declaration();
            yield* t.outbox.stage(event(), [declaration()]);
            const malformed = declaration();
            Reflect.set(malformed, 'delivery', 'before');
            expect((yield* Effect.flip(t.dispatcher.register(malformed))).reason).toBe('invalid');
            expect((yield* Effect.flip(t.dispatcher.register(d, () => Effect.void))).reason).toBe('invalid');
            expect(
                (yield* Effect.flip(t.dispatcher.register(declaration('fixture.code', { target: 'executable' }))))
                    .reason
            ).toBe('invalid');
            const h = yield* t.dispatcher.register(d);
            Reflect.set(d.pin.owner, 'generation', 999);
            Reflect.set(d, 'target', 'executable');
            expect(yield* h.dispatch).toBe('delivered');
        })
);

for (const [name, claimPatch] of [
    ['null lease', { lease: null }],
    ['secret payload', { event: { ...event(), plaintext: 'PRIVATE' } }],
    ['nested secret', { event: { ...event(), projection: { ...event().projection, secret: 'PRIVATE' } } }],
    ['wrong tenant', { event: event(1, { tenant: TenantId.make(uuid(9)) }) }],
    ['wrong pin', { pin: { ...declaration().pin, revision: 9 } }],
    [
        'unsubscribed kind',
        { event: event(1, { projection: { kind: 'platform.ready', runtimeId: uuid(3), generation: 1 } }) },
    ],
    ['unsubscribed profile', { event: event(1, { profile: 'sensitive' }) }],
    ['exhausted claim', { attempt: 3 }],
] as const) {
    it.scoped(`quarantines ${name} without invoking release policy or observer`, () =>
        Effect.gen(function* () {
            const t = yield* setup({ corruptClaim: (claim) => Object.assign(claim, claimPatch) });
            const d = declaration('fixture.observe', { profiles: ['baseline'] });
            yield* t.outbox.stage(event(), [d]);
            const handle = yield* t.dispatcher.register(d);
            if (name === 'null lease' || name === 'secret payload' || name === 'nested secret') {
                expect((yield* Effect.flip(handle.dispatch)).reason).toBe('invalid');
                expect((yield* Ref.get(t.rows))[0]?.state).toBe('running');
            } else expect(yield* handle.dispatch).toBe('dead-letter');
            expect(yield* Ref.get(t.policyCalls)).toBe(0);
            expect(yield* Ref.get(t.calls)).toEqual([]);
        })
    );
}

it.scoped('rejects an adapter null envelope without invoking settlement, policy or sink', () =>
    Effect.gen(function* () {
        const t = yield* setup();
        const settlements = yield* Ref.make(0);
        // Simulate an untrusted adapter violating its contract without an unsafe type assertion.
        Reflect.set(t.outbox, 'claim', () => Effect.succeed(null));
        Reflect.set(t.outbox, 'settle', () => Ref.update(settlements, (n) => n + 1));
        const h = yield* t.dispatcher.register(declaration());
        expect((yield* Effect.flip(h.dispatch)).reason).toBe('invalid');
        expect(yield* Ref.get(settlements)).toBe(0);
        expect(yield* Ref.get(t.policyCalls)).toBe(0);
        expect(yield* Ref.get(t.calls)).toEqual([]);
    })
);

it.scoped('surfaces lost durable settlement rather than declaring successful delivery', () =>
    Effect.gen(function* () {
        const t = yield* setup({ settleFailure: true });
        const d = declaration();
        yield* t.outbox.stage(event(), [d]);
        const h = yield* t.dispatcher.register(d);
        expect((yield* Effect.flip(h.dispatch)).reason).toBe('unavailable');
        expect((yield* Ref.get(t.rows))[0]?.state).toBe('running');
    })
);

for (const profile of ['restricted', 'vault'] as const) {
    it.scoped(
        `denies executable ${profile} observers before policy/callback and only releases authorized metadata`,
        () =>
            Effect.gen(function* () {
                const t = yield* setup();
                const d = declaration('fixture.code', { target: 'executable' });
                const codeCalls = yield* Ref.make(0);
                const h = yield* t.dispatcher.register(d, () => Ref.update(codeCalls, (n) => n + 1));
                yield* t.outbox.stage(event(1, { profile }), [d]);
                expect(yield* h.dispatch).toBe('dead-letter');
                expect(yield* Ref.get(codeCalls)).toBe(0);
                expect(yield* Ref.get(t.policyCalls)).toBe(0);
                const declarative = declaration();
                yield* t.outbox.stage(event(2, { profile }), [declarative]);
                const authorized = yield* t.dispatcher.register(declarative);
                expect(yield* authorized.dispatch).toBe('delivered');
                const released = JSON.stringify(yield* Ref.get(t.calls));
                for (const secret of ['plaintext', 'secret', 'keyHandle', 'authorization', 'input', 'output'])
                    expect(released).not.toContain(secret);
            })
    );
}

for (const operation of ['emergency', 'decrypting'] as const) {
    it.scoped(`never enters policy, sink or hook code for ${operation} paths`, () =>
        Effect.gen(function* () {
            const t = yield* setup();
            const codeCalls = yield* Ref.make(0);
            for (const target of ['declarative', 'executable'] as const) {
                const d = declaration(`fixture.${target}`, { target, capability: { kind: 'observation' } });
                const h = yield* t.dispatcher.register(
                    d,
                    target === 'executable' ? () => Ref.update(codeCalls, (n) => n + 1) : undefined
                );
                yield* t.outbox.stage(event(1, { profile: 'vault', operation }), [d]);
                expect(yield* h.dispatch).toBe('dead-letter');
            }
            expect(yield* Ref.get(t.policyCalls)).toBe(0);
            expect(yield* Ref.get(codeCalls)).toBe(0);
            expect(yield* Ref.get(t.calls)).toEqual([]);
        })
    );
}

it.scoped('denies financial additive commands and rechecks live tenant/resource/purpose release on retry', () =>
    Effect.gen(function* () {
        const allowed = yield* Ref.make(true);
        const t = yield* setup({
            authorize: (d, e, req) =>
                Effect.gen(function* () {
                    expect(d.pin.tenant).toBe(e.tenant);
                    expect(e.resource).toBe('fixture.record');
                    expect(e.purpose).toBe('fixture.notify');
                    expect(req.grantsDecryption).toBe(false);
                    if (!(yield* Ref.get(allowed))) return yield* new HookDenied({ reason: 'policy-denied' });
                }),
            deliver: () => Effect.fail(new HookObserverFailure()),
        });
        const financial = declaration('fixture.money', {
            capability: { kind: 'additive', action: 'payment.send', version: 1 },
        });
        const financialObserver = yield* t.dispatcher.register(financial);
        for (const profile of ['baseline', 'restricted', 'vault'] as const) {
            yield* t.outbox.stage(
                event(profile === 'baseline' ? 1 : profile === 'restricted' ? 2 : 3, {
                    operation: 'financial',
                    profile,
                }),
                [financial]
            );
            expect(yield* financialObserver.dispatch).toBe('dead-letter');
        }
        expect(yield* Ref.get(t.calls)).toEqual([]);
        const d = declaration();
        yield* t.outbox.stage(event(2), [d]);
        const h = yield* t.dispatcher.register(d);
        expect(yield* h.dispatch).toBe('retry');
        yield* Ref.set(allowed, false);
        yield* TestClock.adjust(10);
        expect(yield* h.dispatch).toBe('dead-letter');
        expect(yield* Ref.get(t.calls)).toHaveLength(1);
    })
);

it.scoped('drains admission and in-flight delivery, retaining pending exact-generation work for reload', () =>
    Effect.gen(function* () {
        const entered = yield* Deferred.make<void>();
        const release = yield* Deferred.make<void>();
        const t = yield* setup({
            deliver: () => Deferred.succeed(entered, undefined).pipe(Effect.zipRight(Deferred.await(release))),
        });
        const d = declaration();
        yield* t.outbox.stage(event(), [d]);
        yield* t.outbox.stage(event(2), [d]);
        const h = yield* t.dispatcher.register(d);
        expect((yield* Effect.flip(t.dispatcher.register(d))).reason).toBe('duplicate');
        const pending = yield* h.dispatch.pipe(Effect.fork);
        yield* Deferred.await(entered);
        const drained = yield* Ref.make(false);
        const draining = yield* h.drain.pipe(Effect.zipRight(Ref.set(drained, true)), Effect.fork);
        yield* Effect.yieldNow();
        expect(yield* Ref.get(drained)).toBe(false);
        yield* Deferred.succeed(release, undefined);
        expect(yield* Fiber.join(pending)).toBe('delivered');
        yield* Fiber.join(draining);
        expect(yield* h.dispatch).toBe('unloaded');
        const newer = declaration('fixture.observe', { pin: { ...d.pin, owner: { ...owner, generation: 2 } } });
        expect(yield* (yield* t.dispatcher.register(newer)).dispatch).toBe('empty');
        const reloaded = yield* t.dispatcher.register(d);
        expect(yield* reloaded.dispatch).toBe('delivered');
    })
);

it.scoped('scope closure drains once, prevents stale handles and supports the same exact pin after unloading', () =>
    Effect.gen(function* () {
        const t = yield* setup();
        const d = declaration();
        const scope = yield* Scope.make();
        const h = yield* t.dispatcher.register(d).pipe(Scope.extend(scope));
        yield* Scope.close(scope, Exit.void);
        expect(yield* h.dispatch).toBe('unloaded');
        const reloaded = yield* t.dispatcher.register(d);
        yield* h.drain;
        expect((yield* Effect.flip(t.dispatcher.register(d))).reason).toBe('duplicate');
        yield* t.outbox.stage(event(), [d]);
        expect(yield* reloaded.dispatch).toBe('delivered');
    })
);

for (const behavior of ['failure', 'defect', 'interrupt', 'timeout'] as const) {
    it.scoped(`contains observer ${behavior} in independent retry state`, () =>
        Effect.gen(function* () {
            const t = yield* setup({
                deliver: () =>
                    behavior === 'failure'
                        ? Effect.fail(new HookObserverFailure())
                        : behavior === 'defect'
                          ? Effect.dieMessage('SECRET-ERROR')
                          : behavior === 'interrupt'
                            ? Effect.interrupt
                            : Effect.never,
            });
            const d = declaration();
            yield* t.outbox.stage(event(), [d]);
            const h = yield* t.dispatcher.register(d);
            const run = yield* h.dispatch.pipe(Effect.fork);
            if (behavior === 'timeout') yield* TestClock.adjust(100);
            const result = yield* Fiber.await(run);
            // A self-interruption is propagated, but the durable lease is still settled for retry.
            if (behavior !== 'interrupt') expect(result).toEqual(Exit.succeed('retry'));
            expect((yield* Ref.get(t.rows))[0]?.state).toBe('retry');
            expect(JSON.stringify(yield* Ref.get(t.rows))).not.toContain('SECRET-ERROR');
        })
    );
}

it.scoped('defaults deny without production bindings; disabled flag leaves pending work untouched', () =>
    Effect.gen(function* () {
        const t = yield* setup({ enabled: false });
        const d = declaration();
        yield* t.outbox.stage(event(), [d]);
        expect(yield* (yield* t.dispatcher.register(d)).dispatch).toBe('disabled');
        expect((yield* Ref.get(t.rows))[0]?.state).toBe('pending');
        const failClosed = HookDispatcherLive.pipe(
            Layer.provide(
                Layer.mergeAll(HookOutboxUnavailable, HookReleaseDeny, HookSinkUnavailable, FlagsSafeDefaults)
            )
        );
        const closed = Context.get(yield* Layer.build(failClosed), HookDispatcher);
        expect(yield* (yield* closed.register(d)).dispatch).toBe('disabled');
        const deny = Context.get(yield* Layer.build(HookReleaseDeny), HookReleasePolicy);
        expect(
            (yield* Effect.flip(
                deny.authorize(d, event(), {
                    tenantCapability: 'hooks.release',
                    resourcePurposePolicy: true,
                    projection: 'metadata-only.v1',
                    profile: 'baseline',
                    attestation: 'none',
                    brokerEvidence: false,
                    grantsDecryption: false,
                })
            )).reason
        ).toBe('policy-denied');
        const unavailable = Context.get(yield* Layer.build(HookOutboxUnavailable), HookOutbox);
        expect((yield* Effect.flip(unavailable.stage(event(), [d]))).reason).toBe('unavailable');
        expect((yield* Effect.flip(unavailable.claim(d, 0))).reason).toBe('unavailable');
        expect(
            (yield* Effect.flip(
                unavailable.settle(
                    { event: event(), pin: d.pin, attempt: 1, lease: uuid(40), idempotencyKey: uuid(41) },
                    { state: 'delivered' }
                )
            )).reason
        ).toBe('unavailable');
        const sink = Context.get(yield* Layer.build(HookSinkUnavailable), HookSink);
        expect((yield* Effect.flip(sink.deliver(d, event(), uuid(41))))._tag).toBe('HookObserverFailure');
    })
);

it.scoped(
    'observer failure cannot replay or undo a committed ActionHost operation; emergency still needs deliberate human approval',
    () =>
        Effect.gen(function* () {
            const caller = {
                subject: SubjectId.make(uuid(2)),
                session: SessionId.make(uuid(3)),
                tenant,
                kind: 'human' as const,
            };
            const ledger = yield* makeTestOnlyHarness(caller);
            const operations = yield* Ref.make(0);
            const makeAction = (name: string, emergency: boolean) =>
                define(name, {
                    version: 1,
                    description: 'Test protected operation.',
                    input: Schema.Struct({}),
                    output: Schema.Null,
                    permission: name,
                    sideEffect: 'write',
                    offline: 'online-only',
                    approval: emergency ? 'always' : 'none',
                    risk: emergency ? 'live-production' : 'routine',
                });
            const ordinary = makeAction('fixture.write', false);
            const emergency = makeAction('fixture.emergency', true);
            const host = Context.get(
                yield* Layer.build(
                    ActionHostLive.pipe(Layer.provide(ledger.TestOnly), Layer.provide(FlagsSafeDefaults))
                ),
                ActionHost
            );
            yield* host.register({
                manifest: {
                    format: 1,
                    id: 'fixtures',
                    version: '1.0.0',
                    description: 'Hook integration fixture.',
                    actions: [ordinary.name, emergency.name],
                    flags: [],
                },
                actions: [ordinary, emergency].map((spec) =>
                    implement(spec, () =>
                        Ref.update(operations, (n) => n + 1).pipe(
                            Effect.zipRight(ledger.ledger.stage('domain', { committed: true })),
                            Effect.as(null)
                        )
                    )
                ),
            });
            const execute = (name: string, approvalId?: string) =>
                host
                    .execute(
                        name,
                        {},
                        {
                            idempotencyKey: name,
                            deadline: 10_000,
                            ...(approvalId === undefined ? {} : { approvalId }),
                        }
                    )
                    .pipe(Effect.provideService(Caller, caller));
            const committed = yield* execute(ordinary.name);
            expect(Exit.isSuccess(committed.result)).toBe(true);
            const t = yield* setup({ deliver: () => Effect.fail(new HookObserverFailure()) });
            const d = declaration();
            // Explicit post-commit handoff only: the production SAME-transaction stage binding is integration work.
            yield* t.outbox.stage(event(), [d]);
            const observer = yield* t.dispatcher.register(d);
            expect(yield* observer.dispatch).toBe('retry');
            yield* TestClock.adjust(10);
            expect(yield* observer.dispatch).toBe('dead-letter');
            expect(yield* Ref.get(operations)).toBe(1);
            expect((yield* Ref.get(ledger.state)).domain).toEqual([{ committed: true }]);
            expect((yield* execute(emergency.name)).receipt.outcome).toBe('denied');
            const now = yield* Clock.currentTimeMillis;
            yield* Ref.set(
                ledger.approvals,
                new Map([
                    [
                        'human',
                        {
                            principal: caller.subject,
                            tenant,
                            action: emergency.name,
                            version: 1,
                            inputHash: 'TEST-ONLY:{}',
                            limits: {},
                            approver: { ...caller, subject: SubjectId.make(uuid(4)) },
                            issuedAt: now,
                            expiresAt: now + 1000,
                            stepUp: true,
                        },
                    ],
                ])
            );
            expect(Exit.isSuccess((yield* execute(emergency.name, 'human')).result)).toBe(true);
            expect(yield* Ref.get(operations)).toBe(2);
        })
);
