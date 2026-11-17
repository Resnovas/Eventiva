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

/** Generate reproducible UUID-shaped values for event, lease and generation-isolation assertions. */
const uuid = (n: number) => `019b0000-0000-7000-8000-${n.toString().padStart(12, '0')}`;
const tenant = TenantId.make(uuid(1));
const owner = { module: 'fixture', version: '1.0.0', generation: 1 };
/** Decode bounded observer declarations, allowing tests to vary capability, profile and exact pin. */
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
/** Decode ordered metadata-only events with stable identifiers and explicit security-boundary overrides. */
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
/** Compare fixture pins structurally, including owner generation; fixture key ordering is intentionally stable. */
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
        /** Mutate the adapter-returned lease only, to exercise dispatcher validation of untrusted claims. */
        readonly corruptClaim?: (claim: HookClaim) => void;
        readonly settleFailure?: boolean;
    } = {}
) =>
    Effect.gen(
        /** Build a volatile outbox protocol model with observable delivery and release-policy entry. */ function* () {
            // This Ref-backed model checks dispatcher protocol only; it supplies no durable transaction guarantee.
            const rows = yield* Ref.make<ReadonlyArray<Row>>([]);
            const calls = yield* Ref.make<ReadonlyArray<{ event: HookEvent; key: string }>>([]);
            const policyCalls = yield* Ref.make(0);
            const outbox = HookOutbox.of({
                /** Stage per-observer rows atomically in the volatile model, enforcing capacity and content identity. */
                stage: (source, observers) =>
                    Ref.modify(
                        rows,
                        /** Retain the original row set on conflict or capacity rejection. */ (
                            all
                        ): readonly [Effect.Effect<void, HookOutboxFailure>, ReadonlyArray<Row>] => {
                            // Accumulate candidates separately so a later observer failure cannot publish a partial batch.
                            const added: Array<Row> = [];
                            for (const d of observers) {
                                const prior = all.find(
                                    /** Identify an existing exact-pin/event pair before accepting duplicate staging. */ (
                                        r
                                    ) => samePin(r.claim.pin, d.pin) && r.claim.event.id === source.id
                                );
                                if (prior !== undefined) {
                                    if (JSON.stringify(prior.claim.event) !== JSON.stringify(source))
                                        return [Effect.fail(new HookOutboxFailure({ reason: 'conflict' })), all];
                                    continue;
                                }
                                if (
                                    all.filter(
                                        /** Count only unsettled work against this observer's pending capacity. */ (
                                            r
                                        ) =>
                                            samePin(r.claim.pin, d.pin) &&
                                            !['delivered', 'dead-letter'].includes(r.state)
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
                        }
                    ).pipe(Effect.flatten),
                /** Lease the earliest eligible stream head for the exact observer pin. */
                claim: (d, now) =>
                    Ref.modify(
                        rows,
                        /** Mark the chosen row running while preserving its stable idempotency key. */ (all) => {
                            const candidate = all.find(
                                /** Require a due pending/retry row with no unfinished earlier event in its resource stream. */ (
                                    r
                                ) =>
                                    samePin(r.claim.pin, d.pin) &&
                                    (r.state === 'pending' || r.state === 'retry') &&
                                    r.due <= now &&
                                    !all.some(
                                        /** Block this stream head behind earlier unfinished work for the same exact pin. */ (
                                            earlier
                                        ) =>
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
                            return [
                                claim,
                                all.map(
                                    /** Replace only the leased row; other observers retain independent progress. */ (
                                        r
                                    ) => (r === candidate ? { ...r, claim, state: 'running' as const } : r)
                                )
                            ];
                        }
                    ),
                /** Settle only the currently owned lease attempt, optionally simulating durable acknowledgement loss. */
                settle: (claim, settlement) =>
                    Ref.modify(
                        rows,
                        /** Preserve running state when acknowledgement fails or lease ownership is lost. */ (
                            all
                        ): readonly [Effect.Effect<void, HookOutboxFailure>, ReadonlyArray<Row>] => {
                            // Match both lease and attempt so a stale worker cannot settle a newer delivery attempt.
                            if (options.settleFailure)
                                return [Effect.fail(new HookOutboxFailure({ reason: 'unavailable' })), all];
                            const row = all.find(
                                /** Locate the exact leased attempt rather than merely matching event identity. */ (
                                    r
                                ) => r.claim.lease === claim.lease && r.claim.attempt === claim.attempt
                            );
                            if (row === undefined)
                                return [Effect.fail(new HookOutboxFailure({ reason: 'lease-lost' })), all];
                            return [
                                Effect.void,
                                all.map(
                                    /** Update only the owned row, retaining retry availability for future claims. */ (
                                        r
                                    ) =>
                                        r !== row
                                            ? r
                                            : {
                                                  ...r,
                                                  state: settlement.state,
                                                  due: settlement.state === 'retry' ? settlement.availableAt : 0,
                                              }
                                ),
                            ];
                        }
                    ).pipe(Effect.flatten),
            });
            const layer = HookDispatcherLive.pipe(
                Layer.provide(
                    Layer.mergeAll(
                        Layer.succeed(HookOutbox, outbox),
                        Layer.succeed(HookSink, {
                            /** Record actual observer entry before delegating to injected behavior. */
                            deliver: (d, e, key) =>
                                Ref.update(
                                    calls,
                                    /** Preserve released event/key pairs in delivery order. */ (all) => [
                                        ...all,
                                        { event: e, key }
                                    ]
                                ).pipe(Effect.zipRight(options.deliver?.(d, e, key) ?? Effect.void)),
                        }),
                        Layer.succeed(HookReleasePolicy, {
                            /** Count release checks before applying injected live policy. */
                            authorize: (d, e, requirements) =>
                                Ref.update(
                                    policyCalls,
                                    /** Count policy entry even when injected authorization later denies. */ (n) =>
                                        n + 1
                                ).pipe(Effect.zipRight(options.authorize?.(d, e, requirements) ?? Effect.void)),
                        }),
                        Layer.succeed(Flags, {
                            /** Enable dispatch by default in the fixture, with an explicit disabled control. */
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
        }
    );

it.scoped(
    'retries observers independently with stable keys and ordered stream heads, then dead-letters',
    /** Run two observers over the same ordered event stream. */ () =>
        Effect.gen(
            /** Require failed observers to retry independently without blocking healthy observers or rekeying work. */ function* () {
                // One observer always fails; the other must advance while the failed stream retains its head ordering.
                const t = yield* setup({
                    /** Fail only the designated observer so isolation is visible in the shared event stream. */
                    deliver: (d) =>
                        (d.pin.hook === 'fixture.bad' ? Effect.fail(new HookObserverFailure()) : Effect.void),
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
                expect(
                    calls.map(
                        /** Compare cross-observer delivery order without coupling to UUID formatting. */ (c) =>
                            c.event.sequence
                    )
                ).toEqual([1, 1, 2, 1, 2]);
                expect(calls[0]?.key).toBe(calls[3]?.key);
                expect(
                    (yield* Ref.get(t.rows)).map(
                        /** Compare each observer row's independent terminal or retry state. */ (r) => r.state
                    )
                ).toEqual([
                    'dead-letter',
                    'delivered',
                    'retry',
                    'delivered',
                ]);
            }
        )
);

it.scoped(
    'bounds pending capacity, deduplicates staging and rejects changed event content',
    /** Exercise one-slot admission and exact duplicate staging. */ () =>
        Effect.gen(
            /** Require duplicate idempotence, changed-content rejection and capacity recovery after delivery. */ function* () {
                const t = yield* setup();
                const d = declaration('fixture.observe', { capacity: 1 });
                yield* t.outbox.stage(event(), [d]);
                yield* t.outbox.stage(event(), [d]);
                expect((yield* Effect.flip(t.outbox.stage(event(2), [d]))).reason).toBe('capacity');
                expect((yield* Effect.flip(t.outbox.stage(event(1, { purpose: 'different' }), [d]))).reason).toBe(
                    'conflict'
                );
                const h = yield* t.dispatcher.register(d);
                expect(yield* h.dispatch).toBe('delivered');
                yield* t.outbox.stage(event(2), [d]);
                expect(yield* h.dispatch).toBe('delivered');
                expect(yield* Ref.get(t.calls)).toHaveLength(2);
            }
        )
);

it.scoped(
    'runs authorized additive commands and ordinary executable observations without operation authority',
    /** Exercise allowed declarative and executable observer forms. */ () =>
        Effect.gen(
            /** Require executable callbacks to receive immutable metadata rather than mutation authority. */ function* () {
                const t = yield* setup();
                const code = yield* Ref.make<ReadonlyArray<string>>([]);
                const d = declaration('fixture.add', {
                    capability: { kind: 'additive', action: 'notification.enqueue', version: 2 },
                });
                yield* t.outbox.stage(event(), [d]);
                expect(yield* (yield* t.dispatcher.register(d)).dispatch).toBe('delivered');
                const executable = declaration('fixture.code', { target: 'executable' });
                yield* t.outbox.stage(event(2), [executable]);
                const h = yield* t.dispatcher.register(
                    executable,
                    /** Inspect released metadata and record its stable delivery key. */ (e, key) =>
                        Effect.gen(
                            /** Attempt nested metadata mutation to prove callback snapshots are deeply immutable. */ function* () {
                                // Reflect.set observes frozen objects without relying on strict-mode mutation exceptions.
                                expect(Reflect.set(e, 'profile', 'vault')).toBe(false);
                                expect(Reflect.set(e.projection, 'secret', 'FORBIDDEN')).toBe(false);
                                if ('identity' in e.projection)
                                    expect(Reflect.set(e.projection.identity, 'generation', 99)).toBe(false);
                                yield* Ref.update(
                                    code,
                                    /** Retain callback event/key pairs only after immutability assertions pass. */ (
                                        all
                                    ) => [...all, `${e.id}:${key}`]
                                );
                            }
                        )
                );
                expect(yield* h.dispatch).toBe('delivered');
                expect(yield* Ref.get(code)).toHaveLength(1);
                expect((yield* Ref.get(t.calls))[0]?.event).toEqual(event());
            }
        )
);

it.scoped(
    'validates registration and snapshots declaration/pin data rather than retaining mutable caller objects',
    /** Validate declarations before testing ownership of their mutable caller objects. */ () =>
        Effect.gen(
            /** Require registration validation and immutable snapshots to prevent post-registration privilege changes. */ function* () {
                // Mutate the original declaration only after registering, separating validation from snapshot ownership.
                const t = yield* setup();
                const d = declaration();
                yield* t.outbox.stage(event(), [declaration()]);
                const malformed = declaration();
                Reflect.set(malformed, 'delivery', 'before');
                expect((yield* Effect.flip(t.dispatcher.register(malformed))).reason).toBe('invalid');
                expect(
                    (yield* Effect.flip(
                        t.dispatcher.register(
                            d,
                            /** Supply an executable callback to a declarative pin as a deliberately invalid registration. */ () =>
                                Effect.void
                        )
                    )).reason
                ).toBe('invalid');
                expect(
                    (yield* Effect.flip(t.dispatcher.register(declaration('fixture.code', { target: 'executable' }))))
                        .reason
                ).toBe('invalid');
                const h = yield* t.dispatcher.register(d);
                Reflect.set(d.pin.owner, 'generation', 999);
                Reflect.set(d, 'target', 'executable');
                expect(yield* h.dispatch).toBe('delivered');
            }
        )
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
    it.scoped(
        `quarantines ${name} without invoking release policy or observer`,
        /** Corrupt one adapter claim before dispatcher validation. */ () =>
            Effect.gen(
                /** Require invalid envelopes to stop before policy or observer entry, with safe quarantine where possible. */ function* () {
                    // Some malformed claims cannot be safely settled; their running row must not imply successful quarantine.
                    const t = yield* setup({
                        /** Inject only this case's untrusted adapter fields. */ corruptClaim: (claim) =>
                            Object.assign(claim, claimPatch)
                    });
                    const d = declaration('fixture.observe', { profiles: ['baseline'] });
                    yield* t.outbox.stage(event(), [d]);
                    const handle = yield* t.dispatcher.register(d);
                    if (name === 'null lease' || name === 'secret payload' || name === 'nested secret') {
                        expect((yield* Effect.flip(handle.dispatch)).reason).toBe('invalid');
                        expect((yield* Ref.get(t.rows))[0]?.state).toBe('running');
                    } else expect(yield* handle.dispatch).toBe('dead-letter');
                    expect(yield* Ref.get(t.policyCalls)).toBe(0);
                    expect(yield* Ref.get(t.calls)).toEqual([]);
                }
            )
    );
}

it.scoped(
    'rejects an adapter null envelope without invoking settlement, policy or sink',
    /** Replace adapter entry points with observable malformed behavior. */ () =>
        Effect.gen(
            /** Require a null claim to fail before any lease settlement or private-data release. */ function* () {
                const t = yield* setup();
                const settlements = yield* Ref.make(0);
                // Simulate an untrusted adapter violating its contract without an unsafe type assertion.
                Reflect.set(
                    t.outbox,
                    'claim',
                    /** Violate the adapter envelope contract without bypassing static types. */ () =>
                        Effect.succeed(null)
                );
                Reflect.set(
                    t.outbox,
                    'settle',
                    /** Count forbidden settlement attempts for the malformed envelope. */ () =>
                        Ref.update(settlements, /** Preserve the number of attempted settlements. */ (n) => n + 1)
                );
                const h = yield* t.dispatcher.register(declaration());
                expect((yield* Effect.flip(h.dispatch)).reason).toBe('invalid');
                expect(yield* Ref.get(settlements)).toBe(0);
                expect(yield* Ref.get(t.policyCalls)).toBe(0);
                expect(yield* Ref.get(t.calls)).toEqual([]);
            }
        )
);

it.scoped(
    'surfaces lost durable settlement rather than declaring successful delivery',
    /** Inject a settlement acknowledgement failure after observer delivery. */ () =>
        Effect.gen(
            /** Require failed settlement to remain visible rather than reporting a delivered row. */ function* () {
                const t = yield* setup({ settleFailure: true });
                const d = declaration();
                yield* t.outbox.stage(event(), [d]);
                const h = yield* t.dispatcher.register(d);
                expect((yield* Effect.flip(h.dispatch)).reason).toBe('unavailable');
                expect((yield* Ref.get(t.rows))[0]?.state).toBe('running');
            }
        )
);

for (const profile of ['restricted', 'vault'] as const) {
    it.scoped(
        `denies executable ${profile} observers before policy/callback and only releases authorized metadata`,
        /** Contrast forbidden executable release with permitted declarative metadata release for this profile. */ () =>
            Effect.gen(
                /** Require restricted profiles to bypass executable callbacks before policy entry. */ function* () {
                    // A declarative control proves the profile is not globally disabled; only executable release is barred.
                    const t = yield* setup();
                    const d = declaration('fixture.code', { target: 'executable' });
                    const codeCalls = yield* Ref.make(0);
                    const h = yield* t.dispatcher.register(
                        d,
                        /** Count any forbidden executable callback entry. */ () =>
                            Ref.update(
                                codeCalls,
                                /** Record each callback invocation without influencing its outcome. */ (n) => n + 1
                            )
                    );
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
                }
            )
    );
}

for (const operation of ['emergency', 'decrypting'] as const) {
    it.scoped(
        `never enters policy, sink or hook code for ${operation} paths`,
        /** Try both observer targets on an operation with mandatory hook exclusion. */ () =>
            Effect.gen(
                /** Require protected operation paths to dead-letter without policy, sink or callback entry. */ function* () {
                    // Both target forms must stop before release; a policy grant cannot override this operation floor.
                    const t = yield* setup();
                    const codeCalls = yield* Ref.make(0);
                    for (const target of ['declarative', 'executable'] as const) {
                        const d = declaration(`fixture.${target}`, { target, capability: { kind: 'observation' } });
                        const h = yield* t.dispatcher.register(
                            d,
                            target === 'executable'
                                ? /** Detect executable entry that the operation floor must prevent. */ () =>
                                      Ref.update(codeCalls, /** Count forbidden callback invocations. */ (n) => n + 1)
                                : undefined
                        );
                        yield* t.outbox.stage(event(1, { profile: 'vault', operation }), [d]);
                        expect(yield* h.dispatch).toBe('dead-letter');
                    }
                    expect(yield* Ref.get(t.policyCalls)).toBe(0);
                    expect(yield* Ref.get(codeCalls)).toBe(0);
                    expect(yield* Ref.get(t.calls)).toEqual([]);
                }
            )
    );
}

it.scoped(
    'denies financial additive commands and rechecks live tenant/resource/purpose release on retry',
    /** Compare mandatory operation exclusions with revocable live release authorization. */ () =>
        Effect.gen(
            /** Require financial additive rejection and fresh tenant/resource/purpose policy on each retry. */ function* () {
                // Revoke release after one failed delivery; retry must not reuse the earlier grant.
                const allowed = yield* Ref.make(true);
                const t = yield* setup({
                    /** Verify metadata-only release requirements before consulting the mutable policy grant. */
                    authorize: (d, e, req) =>
                        Effect.gen(
                            /** Assert tenant/resource/purpose binding and deny after live grant revocation. */ function* () {
                                // Observation release never confers decryption authority, even for sensitive profiles.
                                expect(d.pin.tenant).toBe(e.tenant);
                                expect(e.resource).toBe('fixture.record');
                                expect(e.purpose).toBe('fixture.notify');
                                expect(req.grantsDecryption).toBe(false);
                                if (!(yield* Ref.get(allowed)))
                                    return yield* new HookDenied({ reason: 'policy-denied' });
                            }
                        ),
                    /** Force a retry so the next attempt must reauthorize release. */
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
            }
        )
);

it.scoped(
    'drains admission and in-flight delivery, retaining pending exact-generation work for reload',
    /** Hold delivery open while draining its observer generation. */ () =>
        Effect.gen(
            /** Require drain to await in-flight work and preserve pending rows only for the matching reload pin. */ function* () {
                // The barriers distinguish draining admitted work from abandoning pending exact-generation work.
                const entered = yield* Deferred.make<void>();
                const release = yield* Deferred.make<void>();
                const t = yield* setup({
                    /** Signal observer entry and block completion until the drain assertions have observed it. */
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
            }
        )
);

it.scoped(
    'scope closure drains once, prevents stale handles and supports the same exact pin after unloading',
    /** Close a registration scope before reloading its exact pin. */ () =>
        Effect.gen(
            /** Require old handles to remain unloaded and unable to drain or replace the new registration. */ function* () {
                // Invoke the stale drain after reload to detect cleanup that accidentally targets a newer registration.
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
            }
        )
);

for (const behavior of ['failure', 'defect', 'interrupt', 'timeout'] as const) {
    it.scoped(
        `contains observer ${behavior} in independent retry state`,
        /** Inject one observer failure channel into a leased dispatch. */ () =>
            Effect.gen(
                /** Require retry settlement and private-cause containment even when dispatch is interrupted. */ function* () {
                    const t = yield* setup({
                        /** Produce the selected observer failure without changing claim or policy behavior. */
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
                }
            )
    );
}

it.scoped(
    'defaults deny without production bindings; disabled flag leaves pending work untouched',
    /** Exercise safe-default dispatch and unavailable production seams. */ () =>
        Effect.gen(
            /** Require disabled admission to preserve pending rows and fallback bindings to deny explicitly. */ function* () {
                // Test both the fixture-disabled path and default production seams; neither may silently claim work.
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
            }
        )
);

it.scoped(
    'observer failure cannot replay or undo a committed ActionHost operation; emergency still needs deliberate human approval',
    /** Compare post-commit observer failure with the independent emergency-action approval boundary. */ () =>
        Effect.gen(
            /** Require observer retries to leave committed actions intact and unable to authorize emergency work. */ function* () {
                const caller = {
                    subject: SubjectId.make(uuid(2)),
                    session: SessionId.make(uuid(3)),
                    tenant,
                    kind: 'human' as const,
                };
                const ledger = yield* makeTestOnlyHarness(caller);
                const operations = yield* Ref.make(0);
                /** Define ordinary or emergency write policy without granting any authority to hook delivery. */
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
                    actions: [ordinary, emergency].map(
                        /** Use the same staged handler to isolate each action's approval policy. */ (spec) =>
                            implement(
                                spec,
                                /** Count execution and stage a domain marker inside the host transaction. */ () =>
                                    Ref.update(
                                        operations,
                                        /** Count real domain operations rather than observer retry attempts. */ (n) =>
                                            n + 1
                                    ).pipe(
                                        Effect.zipRight(ledger.ledger.stage('domain', { committed: true })),
                                        Effect.as(null)
                                    )
                            )
                    ),
                });
                /** Invoke keyed intent with a fixed caller, bounded deadline and optional human confirmation. */
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
                const t = yield* setup({
                    /** Fail every observation without touching the committed action's ledger. */ deliver: () =>
                        Effect.fail(new HookObserverFailure())
                });
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
            }
        )
);
