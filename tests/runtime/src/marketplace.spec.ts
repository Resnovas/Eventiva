/**
 * @file tests/runtime/src/marketplace.spec.ts
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
import { Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { Flags, FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import {
    type ExchangeIntent,
    MarketplaceAuthority,
    MarketplaceAuthorityDeny,
    MarketplaceFailure,
    MarketplaceStore,
    MarketplaceStoreUnavailable,
    type MarketplaceTransaction,
    type ParticipantGrant,
    SnapshotReference,
} from '@eventiva/contracts/marketplace';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { IdentityResolver, InvocationDenied } from '@eventiva/runtime/invocation';
import { privateExchangeUnavailable, readSnapshot, stageExchange } from '@eventiva/runtime/marketplace';
import { Deferred, Effect, Exit, Fiber, Layer, Schema, TestClock } from 'effect';

const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const owner = TenantId.make(id(1));
const recipient = TenantId.make(id(2));
const outsider = TenantId.make(id(3));
const caller: CallerIdentity = {
    tenant: owner,
    subject: SubjectId.make(id(4)),
    session: SessionId.make(id(5)),
    kind: 'human',
};
const snapshot: SnapshotReference = {
    id: id(6),
    scope: {
        exchange: id(7),
        ownerTenant: owner,
        recipientTenant: recipient,
        resource: id(8),
        purpose: 'quote-review',
    },
    sourceRecord: id(9),
    sourceVersion: 3,
    classification: 'restricted',
};
const grant: ParticipantGrant = {
    id: id(10),
    scope: snapshot.scope,
    participantTenant: owner,
    subject: caller.subject,
    action: 'stage',
    expiresAt: 2000,
    revoked: false,
};
const request = { grant: grant.id, snapshot: snapshot.id, scope: snapshot.scope };
const command = { ...request, command: id(11), expectedVersion: 3 };
const denied = () => new MarketplaceFailure({ reason: 'denied' });
const unavailable = () => new MarketplaceFailure({ reason: 'unavailable' });
type Fault = 'none' | 'before-insert' | 'after-insert' | 'after-enqueue' | 'defect' | 'interrupt';

/** Volatile transactional conformance fixture. Not a SQL adapter or a process-crash durability proof. */
const fixture = Effect.gen(function* () {
    yield* TestClock.setTime(1000);
    const mutex = yield* Effect.makeSemaphore(1);
    const entered = yield* Deferred.make<void>();
    const state = {
        grant: { ...grant },
        snapshot: { ...snapshot },
        intents: new Map<string, ExchangeIntent>(),
        outbox: new Map<string, ExchangeIntent>(),
        fault: 'none' as Fault,
        identityActive: true,
        policyAllows: true,
    };
    const store = MarketplaceStore.of({
        transaction: (use) =>
            mutex.withPermits(1)(
                Effect.gen(function* () {
                    const intents = new Map(state.intents);
                    const outbox = new Map(state.outbox);
                    const tx: MarketplaceTransaction = {
                        grant: (key) => Effect.sync(() => (key === state.grant.id ? state.grant : undefined)),
                        snapshot: (key) => Effect.sync(() => (key === state.snapshot.id ? state.snapshot : undefined)),
                        intent: (key) => Effect.sync(() => intents.get(key)),
                        insertIntent: (value) =>
                            Effect.gen(function* () {
                                if (state.fault === 'before-insert') return yield* unavailable();
                                if (intents.has(value.command))
                                    return yield* new MarketplaceFailure({ reason: 'conflict' });
                                intents.set(value.command, value);
                                if (state.fault === 'after-insert') return yield* unavailable();
                            }),
                        enqueue: (value) =>
                            Effect.gen(function* () {
                                outbox.set(value.command, value);
                                if (state.fault === 'after-enqueue') return yield* unavailable();
                                if (state.fault === 'defect') return yield* Effect.dieMessage('injected-store-defect');
                                if (state.fault === 'interrupt') {
                                    yield* Deferred.succeed(entered, undefined);
                                    return yield* Effect.never;
                                }
                            }),
                    };
                    const result = yield* use(tx);
                    // Only successful callbacks publish either map. No partial transaction escapes.
                    state.intents = intents;
                    state.outbox = outbox;
                    return result;
                })
            ),
    });
    const dependencies = Layer.mergeAll(
        Layer.succeed(MarketplaceStore, store),
        Layer.succeed(Caller, caller),
        Layer.succeed(CurrentTenant, { id: owner }),
        Layer.succeed(IdentityResolver, {
            resolve: (value) =>
                state.identityActive
                    ? Effect.succeed(value)
                    : Effect.fail(new InvocationDenied({ action: '<test>', reason: 'revoked' })),
        }),
        Layer.succeed(MarketplaceAuthority, {
            authorize: () => (state.policyAllows ? Effect.void : Effect.fail(denied())),
        }),
        Layer.succeed(Flags, {
            evaluate: (flag) => Effect.succeed({ flag: flag.key, value: true, fallback: false, reason: 'TEST' }),
        })
    );
    const run = <A, E, R>(effect: Effect.Effect<A, E, R>) => effect.pipe(Effect.provide(dependencies));
    const revoke = mutex.withPermits(1)(
        Effect.sync(() => {
            state.grant = { ...state.grant, revoked: true };
        })
    );
    return { state, run, revoke, entered };
});

it.effect('reads only exact authorized references and stages one pending intent/outbox across concurrent retries', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        f.state.grant.action = 'read';
        expect(yield* f.run(readSnapshot(request))).toEqual(snapshot);
        f.state.grant.action = 'stage';
        const results = yield* Effect.all([f.run(stageExchange(command)), f.run(stageExchange(command))], {
            concurrency: 'unbounded',
        });
        expect(results).toEqual([
            {
                command: command.command,
                grant: grant.id,
                tenant: owner,
                subject: caller.subject,
                onBehalfOf: null,
                snapshot,
                state: 'pending',
            },
            results[0],
        ]);
        expect([...f.state.intents.keys()]).toEqual([command.command]);
        expect([...f.state.outbox.values()]).toEqual([results[0]]);
        // A new effect invocation after a lost response finds committed state, not a process-local result cache.
        expect(yield* f.run(stageExchange(command))).toEqual(results[0]);
    })
);

for (const [field, value] of [
    ['exchange', id(70)],
    ['ownerTenant', outsider],
    ['recipientTenant', outsider],
    ['resource', id(80)],
    ['purpose', 'different-purpose'],
] as const) {
    it.effect(`denies a mismatched ${field} without leaking a reference or staging`, () =>
        Effect.gen(function* () {
            const f = yield* fixture;
            const result = yield* f
                .run(stageExchange({ ...command, scope: { ...command.scope, [field]: value } }))
                .pipe(Effect.flip);
            expect(result).toEqual(denied());
            expect(f.state.intents.size).toBe(0);
            expect(f.state.outbox.size).toBe(0);
        })
    );
}

for (const kind of ['human', 'service', 'first-party-agent', 'external-agent'] as const) {
    it.effect(`requires both participant grant and independent policy for ${kind}`, () =>
        Effect.gen(function* () {
            const f = yield* fixture;
            const identity: CallerIdentity = {
                ...caller,
                kind,
                ...(kind.endsWith('agent') ? { onBehalfOf: SubjectId.make(id(40)) } : {}),
            };
            const invoke = stageExchange(command).pipe(Effect.provideService(Caller, identity));
            expect((yield* f.run(invoke)).subject).toBe(caller.subject);
            f.state.policyAllows = false;
            expect(yield* f.run(invoke).pipe(Effect.flip)).toEqual(denied());
            expect(f.state.outbox.size).toBe(1);
        })
    );
}

it.effect('revokes reads, new commands and identical replay while preserving already committed evidence', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        const saved = yield* f.run(stageExchange(command));
        yield* f.revoke;
        for (const input of [command, { ...command, command: id(12) }])
            expect(yield* f.run(stageExchange(input)).pipe(Effect.flip)).toEqual(denied());
        f.state.grant.action = 'read';
        expect(yield* f.run(readSnapshot(request)).pipe(Effect.flip)).toEqual(denied());
        expect([...f.state.intents.values()]).toEqual([saved]);
        expect([...f.state.outbox.values()]).toEqual([saved]);
    })
);

it.effect('allows the exact recipient grant but denies a reference from a sibling exchange or participant', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        f.state.grant.participantTenant = recipient;
        const invoke = stageExchange(command).pipe(
            Effect.provideService(Caller, { ...caller, tenant: recipient }),
            Effect.provideService(CurrentTenant, { id: recipient })
        );
        expect((yield* f.run(invoke)).tenant).toBe(recipient);
        for (const scope of [
            { ...snapshot.scope, exchange: id(70) },
            { ...snapshot.scope, recipientTenant: outsider },
        ]) {
            f.state.snapshot = { ...snapshot, scope };
            expect(yield* f.run(invoke).pipe(Effect.flip)).toEqual(denied());
        }
        expect(f.state.outbox.size).toBe(1);
    })
);

it.effect('authorizes the stored classified metadata, not a requester-selected weaker profile', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        const invoke = stageExchange(command).pipe(
            Effect.provideService(MarketplaceAuthority, {
                authorize: (actualCaller, reference, action) =>
                    actualCaller.subject === caller.subject &&
                    reference.classification === 'sensitive' &&
                    reference.scope.resource === snapshot.scope.resource &&
                    reference.scope.purpose === snapshot.scope.purpose &&
                    action === 'stage'
                        ? Effect.void
                        : Effect.fail(denied()),
            })
        );
        expect(yield* f.run(invoke).pipe(Effect.flip)).toEqual(denied());
        expect(f.state.outbox.size).toBe(0);
        f.state.snapshot = { ...snapshot, classification: 'sensitive' };
        expect((yield* f.run(invoke)).snapshot.classification).toBe('sensitive');
    })
);

it.effect('checks exact expiry, live identity and live metadata policy even on replay', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        yield* f.run(stageExchange(command));
        yield* TestClock.setTime(1999);
        yield* f.run(stageExchange(command));
        yield* TestClock.setTime(2000);
        expect(yield* f.run(stageExchange(command)).pipe(Effect.flip)).toEqual(denied());
        yield* TestClock.setTime(1000);
        f.state.identityActive = false;
        expect(yield* f.run(stageExchange(command)).pipe(Effect.flip)).toEqual(denied());
        f.state.identityActive = true;
        f.state.policyAllows = false;
        expect(yield* f.run(stageExchange(command)).pipe(Effect.flip)).toEqual(denied());
        expect(f.state.outbox.size).toBe(1);
    })
);

it.effect('denies a grant that expires while the independent metadata gate is running', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        const result = yield* f
            .run(
                stageExchange(command).pipe(
                    Effect.provideService(MarketplaceAuthority, {
                        authorize: () => TestClock.setTime(2000),
                    })
                )
            )
            .pipe(Effect.flip);
        expect(result).toEqual(denied());
        expect(f.state.intents.size).toBe(0);
        expect(f.state.outbox.size).toBe(0);
    })
);

it.effect('denies unrelated tenants, substituted principals, wrong action and wrong participant', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        const deniedEffects: ReadonlyArray<
            Effect.Effect<
                unknown,
                MarketplaceFailure,
                Caller | CurrentTenant | IdentityResolver | MarketplaceAuthority | MarketplaceStore | Flags
            >
        > = [
            stageExchange(command).pipe(
                Effect.provideService(Caller, { ...caller, tenant: outsider }),
                Effect.provideService(CurrentTenant, { id: outsider })
            ),
            stageExchange(command).pipe(
                Effect.provideService(Caller, { ...caller, tenant: recipient }),
                Effect.provideService(CurrentTenant, { id: recipient })
            ),
            stageExchange(command).pipe(Effect.provideService(Caller, { ...caller, subject: SubjectId.make(id(44)) })),
            stageExchange(command).pipe(Effect.provideService(CurrentTenant, { id: recipient })),
            readSnapshot(request),
            stageExchange(command).pipe(
                Effect.provideService(IdentityResolver, {
                    resolve: () => Effect.succeed({ ...caller, session: SessionId.make(id(50)) }),
                })
            ),
            stageExchange(command).pipe(
                Effect.provideService(IdentityResolver, {
                    resolve: () => Effect.succeed({ ...caller, onBehalfOf: SubjectId.make(id(50)) }),
                })
            ),
        ];
        for (const effect of deniedEffects) expect(yield* f.run(effect).pipe(Effect.flip)).toEqual(denied());
        expect(f.state.intents.size).toBe(0);
    })
);

it.effect('rejects changed expected version and command reuse with another authorized snapshot or grant', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        const saved = yield* f.run(stageExchange(command));
        expect(yield* f.run(stageExchange({ ...command, expectedVersion: 2 })).pipe(Effect.flip)).toEqual(
            new MarketplaceFailure({ reason: 'conflict' })
        );
        // Even a buggy store returning a different reference at the same key cannot overwrite an intent.
        f.state.snapshot = { ...snapshot, sourceRecord: id(99) };
        expect(yield* f.run(stageExchange(command)).pipe(Effect.flip)).toEqual(
            new MarketplaceFailure({ reason: 'conflict' })
        );
        f.state.snapshot = snapshot;
        f.state.grant = { ...grant, id: id(88) };
        expect(yield* f.run(stageExchange({ ...command, grant: id(88) })).pipe(Effect.flip)).toEqual(
            new MarketplaceFailure({ reason: 'conflict' })
        );
        expect([...f.state.intents.values()]).toEqual([saved]);
        expect(f.state.outbox.size).toBe(1);
    })
);

for (const fault of ['before-insert', 'after-insert', 'after-enqueue', 'defect'] as const) {
    it.effect(`rolls back ${fault} and retries without duplicate or orphan outbox`, () =>
        Effect.gen(function* () {
            const f = yield* fixture;
            f.state.fault = fault;
            expect(Exit.isFailure(yield* f.run(stageExchange(command)).pipe(Effect.exit))).toBe(true);
            expect(f.state.intents.size).toBe(0);
            expect(f.state.outbox.size).toBe(0);
            f.state.fault = 'none';
            yield* f.run(stageExchange(command));
            yield* f.run(stageExchange(command));
            expect(f.state.intents.size).toBe(1);
            expect(f.state.outbox.size).toBe(1);
        })
    );
}

it.effect('interruption before local commit exposes no partial state and does not block revocation', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        f.state.fault = 'interrupt';
        const fiber = yield* f.run(stageExchange(command)).pipe(Effect.fork);
        yield* Deferred.await(f.entered);
        yield* Fiber.interrupt(fiber);
        yield* f.revoke;
        expect(f.state.intents.size).toBe(0);
        expect(f.state.outbox.size).toBe(0);
        f.state.fault = 'none';
        expect(yield* f.run(stageExchange(command)).pipe(Effect.flip)).toEqual(denied());
    })
);

it.effect('rejects private fields, weakened classification and malformed or cross-party scope', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        for (const input of [
            { ...command, privatePrice: 300 },
            { ...command, scope: { ...command.scope, internalBudget: 1 } },
            { ...command, scope: { ...command.scope, recipientTenant: owner } },
            { ...command, expectedVersion: -1 },
        ])
            expect((yield* f.run(stageExchange(input)).pipe(Effect.flip)).reason).toBe('invalid');
        for (const classification of ['baseline', 'vault'])
            expect(Schema.decodeUnknownEither(SnapshotReference)({ ...snapshot, classification })._tag).toBe('Left');
        // Runtime validates persistence output too; a store cannot smuggle private fields in metadata.
        const polluted = { ...snapshot, privatePrice: 100 };
        f.state.snapshot = polluted;
        expect((yield* f.run(stageExchange(command)).pipe(Effect.flip)).reason).toBe('invalid');
    })
);

it.effect('defaults off, denies without trusted authority/store, and never releases private payloads', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        expect(
            (yield* f.run(stageExchange(command).pipe(Effect.provide(FlagsSafeDefaults))).pipe(Effect.flip)).reason
        ).toBe('disabled');
        expect(
            (yield* f.run(stageExchange(command).pipe(Effect.provide(MarketplaceAuthorityDeny))).pipe(Effect.flip))
                .reason
        ).toBe('denied');
        expect(
            (yield* f.run(stageExchange(command).pipe(Effect.provide(MarketplaceStoreUnavailable))).pipe(Effect.flip))
                .reason
        ).toBe('unavailable');
        expect((yield* privateExchangeUnavailable.pipe(Effect.flip)).reason).toBe('trust-unapproved');
        expect(f.state.intents.size).toBe(0);
    })
);
