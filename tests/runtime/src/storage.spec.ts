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
const fixture = (overrides: Partial<Storage['Type']> = {}): Storage['Type'] =>
    Storage.of({
        capabilities: { transactions: true, compareAndSet: true, appendOnlyLedger: true, device: false },
        ready: Effect.void,
        transaction: (effect) => effect,
        commit: (_request, execute) => Effect.map(execute, (result) => ({ ...result, replayed: false })),
        audit: () => Effect.void,
        create: () => unavailable,
        get: () => unavailable,
        compareAndSet: () => unavailable,
        stock: () => unavailable,
        available: () => unavailable,
        reserve: () => unavailable,
        settle: () => unavailable,
        expire: unavailable,
        reconcile: () => unavailable,
        enqueue: () => unavailable,
        ...overrides,
    });
const run = <A, E>(effect: Effect.Effect<A, E, Audit | Integrity>, storage = fixture()) =>
    effect.pipe(
        Effect.provide(durable),
        Effect.provideService(Storage, storage),
        Effect.provideService(CurrentTenant, { id: caller.tenant! })
    );

it.effect('durable bridge validates successful evidence and JSON output without a driver', () =>
    run(
        Effect.gen(function* () {
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

it.effect('durable bridge preserves handler errors and translates storage failures without a spool fallback', () =>
    Effect.gen(function* () {
        const request = { key: 'key', inputHash: 'hash', caller, action: receipt.action, version: 1 };
        const invoke = Effect.flatMap(Integrity, (i) => i.commit(request, Effect.succeed({ output: null, receipt })));
        expect(yield* Effect.either(run(invoke, fixture({ commit: () => unavailable })))).toMatchObject({
            left: { _tag: 'AuditUnavailable' },
        });
        expect(
            yield* Effect.either(
                run(
                    invoke,
                    fixture({ commit: () => Effect.fail(new Conflict({ id: 'key', reason: 'input-changed' })) })
                )
            )
        ).toMatchObject({ left: { _tag: 'InvocationDenied', reason: 'input-changed' } });
        const handlerError = { _tag: 'StorageConflict', detail: 'not a storage exception' };
        expect(
            yield* Effect.either(run(Effect.flatMap(Integrity, (i) => i.commit(request, Effect.fail(handlerError)))))
        ).toMatchObject({ _tag: 'Left', left: handlerError });
        expect(
            yield* Effect.either(
                run(
                    Effect.flatMap(Audit, (a) => a.ready('test.write')),
                    fixture({ ready: unavailable })
                )
            )
        ).toMatchObject({ left: { _tag: 'AuditUnavailable' } });
        expect(
            yield* Effect.either(
                run(
                    Effect.flatMap(Audit, (a) => a.record(receipt, true)),
                    fixture({ audit: () => unavailable })
                )
            )
        ).toMatchObject({ left: { _tag: 'AuditUnavailable' } });
    })
);
