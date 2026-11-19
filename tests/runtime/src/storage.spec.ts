/**
 * @file tests/runtime/src/storage.spec.ts
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

import { CallerIdentity } from '@eventiva/contracts/caller';
import type { Receipt } from '@eventiva/contracts/receipt';
import { Conflict, CurrentTenant, Storage, StorageFailure } from '@eventiva/contracts/storage';
import { Audit, Integrity } from '@eventiva/runtime/invocation';
import { durable } from '@eventiva/runtime/storage';
import { expect, it } from '@effect/vitest';
import { Effect, Schema } from 'effect';

const caller = Schema.decodeUnknownSync(CallerIdentity)({
    subject: '019b0000-0000-7000-8000-000000000001',
    kind: 'human',
    tenant: '019b0000-0000-7000-8000-000000000002',
    session: '019b0000-0000-7000-8000-000000000003',
});
const receipt: Receipt = {
    id: 'receipt',
    caller,
    action: 'test.write',
    version: 1,
    inputHash: 'hash',
    outcome: 'succeeded',
    startedAt: 1,
    durationMs: 0,
};
const unavailable = Effect.fail(new StorageFailure({ operation: 'unavailable' }));
/** Provide only commit/audit behavior; unrelated driver operations deliberately fail closed. */
const fixture = (overrides: Partial<Storage['Type']> = {}): Storage['Type'] =>
    Storage.of({
        capabilities: { transactions: true, compareAndSet: true, appendOnlyLedger: true, device: false },
        ready: Effect.void,
        /** Run persistence is outside this non-SQL fixture. */
        acceptRun: () => unavailable,
        /** Never fabricate retained module identity. */
        getRun: () => unavailable,
        /** Never fabricate distributed ownership. */
        claimRun: () => unavailable,
        /** A volatile adapter cannot certify fenced writes. */
        fence: () => unavailable,
        /** Preserve the supplied effect without simulating driver atomicity. */
        transaction: (effect) => effect,
        /** Execute once and mark evidence as newly committed, not replayed. */
        commit: (_request, execute) => Effect.map(execute, /** Preserve handler output and receipt while adding commit status. */ (result) => ({ ...result, replayed: false })),
        /** Accept audit persistence unless the scenario overrides this port. */
        audit: () => Effect.void,
        /** Refuse entity creation outside this bridge fixture's scope. */
        create: () => unavailable,
        /** Refuse entity lookup without a driver. */
        get: () => unavailable,
        /** Refuse entity mutation without a driver. */
        compareAndSet: () => unavailable,
        /** Refuse stock writes without a driver. */
        stock: () => unavailable,
        /** Refuse inventory queries without a driver. */
        available: () => unavailable,
        /** Refuse reservation writes without a driver. */
        reserve: () => unavailable,
        /** Refuse reservation settlement without a driver. */
        settle: () => unavailable,
        expire: unavailable,
        /** Refuse reconciliation without a driver. */
        reconcile: () => unavailable,
        /** Refuse outbox writes without a driver. */
        enqueue: () => unavailable,
        ...overrides,
    });
/** Install the durable bridge with the fixture tenant and selected storage behavior. */
const run = <A, E>(effect: Effect.Effect<A, E, Audit | Integrity>, storage = fixture()) =>
    effect.pipe(
        Effect.provide(durable),
        Effect.provideService(Storage, storage),
        Effect.provideService(CurrentTenant, { id: caller.tenant! })
    );

it.effect('durable bridge validates successful evidence and JSON output without a driver', /** Exercise bridge validation independently of persistence implementation. */ () =>
    run(
        Effect.gen(/** Reject substituted receipt bindings and non-JSON results while accepting valid evidence. */ function* () {
            // Start with valid evidence, then vary each binding independently so rejection cannot hide an unchecked field.
            const integrity = yield* Integrity;
            const audit = yield* Audit;
            const request = { key: 'key', inputHash: 'hash', caller, action: receipt.action, version: 1 };
            expect(yield* integrity.commit(request, Effect.succeed({ output: { amount: '1' }, receipt }))).toEqual({
                output: { amount: '1' },
                receipt,
                replayed: false,
            });
            for (const invalid of [
                { ...receipt, outcome: 'failed' as const },
                { ...receipt, action: 'other' },
                { ...receipt, version: 2 },
                { ...receipt, inputHash: 'changed' },
                { ...receipt, caller: { ...caller, kind: 'service' as const } },
                {
                    ...receipt,
                    caller: Schema.decodeUnknownSync(CallerIdentity)({ ...caller, session: caller.subject }),
                },
                { ...receipt, caller: { ...caller, onBehalfOf: caller.subject } },
                {
                    ...receipt,
                    caller: {
                        ...caller,
                        subject: Schema.decodeUnknownSync(CallerIdentity)({
                            ...caller,
                            subject: '019b0000-0000-7000-8000-000000000004',
                        }).subject,
                    },
                },
            ])
                expect(
                    yield* Effect.either(integrity.commit(request, Effect.succeed({ output: null, receipt: invalid })))
                ).toMatchObject({ left: { _tag: 'AuditUnavailable' } });
            for (const output of [undefined, new Date(0), { nested: undefined }])
                expect(
                    yield* Effect.either(integrity.commit(request, Effect.succeed({ output, receipt })))
                ).toMatchObject({ left: { _tag: 'AuditUnavailable' } });
            expect(
                yield* Effect.either(
                    integrity.commit(request, Effect.succeed({ output: null, receipt: { ...receipt, durationMs: -1 } }))
                )
            ).toMatchObject({ left: { _tag: 'AuditUnavailable' } });
            yield* audit.ready('test.write');
            expect(yield* audit.record(receipt, false)).toBe('durable');
            expect(
                yield* Effect.either(audit.record({ ...receipt, caller: { ...caller, tenant: undefined } }, true))
            ).toMatchObject({ left: { _tag: 'AuditUnavailable' } });
            expect(yield* Effect.either(audit.record({ ...receipt, durationMs: -1 }, true))).toMatchObject({
                left: { _tag: 'AuditUnavailable' },
            });
        })
    )
);

it.effect('durable bridge preserves handler errors and translates storage failures without a spool fallback', /** Exercise driver failures separately from handler failures. */ () =>
    Effect.gen(/** Verify storage error translation does not reinterpret a handler's similarly named error. */ function* () {
        // Inject each failure at its owning port to distinguish storage translation from handler error preservation.
        const request = { key: 'key', inputHash: 'hash', caller, action: receipt.action, version: 1 };
        const invoke = Effect.flatMap(Integrity, /** Commit valid evidence so only the injected storage behavior can fail. */ (i) => i.commit(request, Effect.succeed({ output: null, receipt })));
        expect(yield* Effect.either(run(invoke, fixture({ /** Model unavailable persistence before any successful commit. */ commit: () => unavailable })))).toMatchObject({
            left: { _tag: 'AuditUnavailable' },
        });
        expect(
            yield* Effect.either(
                run(
                    invoke,
                    fixture({ /** Model storage idempotency conflict rather than a handler error. */ commit: () => Effect.fail(new Conflict({ id: 'key', reason: 'input-changed' })) })
                )
            )
        ).toMatchObject({ left: { _tag: 'InvocationDenied', reason: 'input-changed' } });
        const handlerError = { _tag: 'StorageConflict', detail: 'not a storage exception' };
        expect(
            yield* Effect.either(run(Effect.flatMap(Integrity, /** Fail inside the handler before evidence can commit. */ (i) => i.commit(request, Effect.fail(handlerError)))))
        ).toMatchObject({ _tag: 'Left', left: handlerError });
        expect(
            yield* Effect.either(
                run(
                    Effect.flatMap(Audit, /** Probe mandatory audit readiness through the durable bridge. */ (a) => a.ready('test.write')),
                    fixture({ ready: unavailable })
                )
            )
        ).toMatchObject({ left: { _tag: 'AuditUnavailable' } });
        expect(
            yield* Effect.either(
                run(
                    Effect.flatMap(Audit, /** Attempt durable audit persistence with valid evidence. */ (a) => a.record(receipt, true)),
                    fixture({ /** Reject audit persistence independently of readiness. */ audit: () => unavailable })
                )
            )
        ).toMatchObject({ left: { _tag: 'AuditUnavailable' } });
    })
);
