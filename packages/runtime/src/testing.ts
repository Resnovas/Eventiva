/**
 * @file packages/runtime/src/testing.ts
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

import { Authorizer, type CallerIdentity } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import { Json, JsonValue } from '@eventiva/contracts/storage';
import { Context, Effect, FiberRef, Layer, Ref, Schema } from 'effect';
import {
    type Approval,
    Approvals,
    Audit,
    AuditUnavailable,
    type Committed,
    ExecutionPolicy,
    type ExecutionRequirements,
    IdentityResolver,
    InputDigest,
    Integrity,
    InvocationDenied,
    type Receipt,
    canonicalJson,
} from './invocation.ts';

/** TEST ONLY. This ledger is volatile and MUST NOT be used as a storage adapter. */
export interface TestOnlyLedgerState {
    readonly domain: ReadonlyArray<JsonValue>;
    readonly history: ReadonlyArray<JsonValue>;
    readonly outbox: ReadonlyArray<JsonValue>;
    readonly receipts: ReadonlyArray<Receipt>;
    readonly dedup: ReadonlyMap<string, Committed & { readonly inputHash: string }>;
    readonly spool: ReadonlyArray<Receipt>;
}

type Staged = Pick<TestOnlyLedgerState, 'domain' | 'history' | 'outbox'>;

/** Handler writes participate in the test transaction through a fiber-local staging area. */
export class TestOnlyLedger extends Context.Tag('@eventiva/runtime/TestOnlyLedger')<
    TestOnlyLedger,
    { readonly stage: <Value>(part: keyof Staged, value: Value) => Effect.Effect<void> }
>() {}

/** Not a cryptographic digest. Injective canonical text is useful ONLY in deterministic tests. */
export const testOnlyDigest = (canonical: string): string => `TEST-ONLY:${canonical}`;

/**
 * TEST ONLY. All state, receipts and spool entries disappear on process exit.
 * The returned TestOnly layer is explicitly not a durable platform implementation.
 * Refs are intentionally exposed for revocation, outage and live-policy tests.
 */
export const makeTestOnlyHarness = (initialIdentity: CallerIdentity) =>
    Effect.gen(function* () {
        const identity = yield* Ref.make<CallerIdentity>(initialIdentity);
        const identityActive = yield* Ref.make(true);
        const authorization = yield* Ref.make({ invoke: true, input: true });
        const resolved = yield* Ref.make<ReadonlyArray<CallerIdentity>>([]);
        const approvals = yield* Ref.make<ReadonlyMap<string, Approval>>(new Map());
        const policy = yield* Ref.make<ExecutionRequirements>({
            approval: 'none',
            routinePreauthorized: false,
            stepUp: false,
            bounds: {},
            currentVersion: '1',
            currentState: 'open',
            dependenciesReady: true,
            capacityAvailable: true,
        });
        const auditOnline = yield* Ref.make(true);
        const spoolCapacity = yield* Ref.make(2);
        // A deterministic pause at the adapter boundary, after host preflight and before lock-protected lookup/run.
        const beforeIntegrity = yield* Ref.make<Effect.Effect<void>>(Effect.void);
        const state = yield* Ref.make<TestOnlyLedgerState>({
            domain: [],
            history: [],
            outbox: [],
            receipts: [],
            dedup: new Map(),
            spool: [],
        });
        const transaction = yield* FiberRef.make<Ref.Ref<Staged> | undefined>(undefined);
        // Global serialization is stricter than per-key serialization, but models identical-key races correctly.
        const lock = yield* Effect.makeSemaphore(1);
        const ready = (action: string) =>
            Ref.get(auditOnline).pipe(
                Effect.flatMap((online) => (online ? Effect.void : Effect.fail(new AuditUnavailable({ action }))))
            );
        const record = (receipt: Receipt, allowSpool: boolean) =>
            Effect.gen(function* () {
                const online = yield* Ref.get(auditOnline);
                const capacity = yield* Ref.get(spoolCapacity);
                return yield* Ref.modify(
                    state,
                    (
                        current
                    ): readonly [Effect.Effect<'durable' | 'spooled', AuditUnavailable>, TestOnlyLedgerState] => {
                        if (current.receipts.some((entry) => entry.id === receipt.id))
                            return [Effect.succeed('durable'), current];
                        if (current.spool.some((entry) => entry.id === receipt.id))
                            return [Effect.succeed('spooled'), current];
                        if (online)
                            return [
                                Effect.succeed('durable'),
                                { ...current, receipts: [...current.receipts, receipt] },
                            ];
                        if (allowSpool && current.spool.length < capacity)
                            return [Effect.succeed('spooled'), { ...current, spool: [...current.spool, receipt] }];
                        return [Effect.fail(new AuditUnavailable({ action: receipt.action })), current];
                    }
                ).pipe(Effect.flatten);
            });
        const ledger = TestOnlyLedger.of({
            stage: (part, value) =>
                Effect.gen(function* () {
                    const staged = yield* FiberRef.get(transaction);
                    if (staged === undefined)
                        return yield* Effect.dieMessage('TestOnlyLedger write outside Integrity transaction');
                    const decoded = yield* canonicalJson(value).pipe(Effect.flatMap(Schema.decode(Json)), Effect.orDie);
                    yield* Ref.update(staged, (current) => ({ ...current, [part]: [...current[part], decoded] }));
                }),
        });
        const integrity = Integrity.of({
            commit: (request, execute) =>
                lock.withPermits(1)(
                    Effect.gen(function* () {
                        yield* Ref.get(beforeIntegrity).pipe(Effect.flatten);
                        const existing = (yield* Ref.get(state)).dedup.get(request.key);
                        if (existing !== undefined) {
                            if (existing.inputHash !== request.inputHash)
                                return yield* new InvocationDenied({
                                    action: request.action,
                                    reason: 'idempotency-conflict',
                                });
                            return { ...existing, replayed: true };
                        }
                        const staged = yield* Ref.make<Staged>({ domain: [], history: [], outbox: [] });
                        const completed = yield* execute.pipe(Effect.locally(transaction, staged));
                        const output = yield* canonicalJson(completed.output).pipe(
                            Effect.flatMap(Schema.decode(Json)),
                            Effect.mapError(() => new AuditUnavailable({ action: request.action }))
                        );
                        yield* ready(request.action);
                        const writes = yield* Ref.get(staged);
                        const saved = { ...completed, output, inputHash: request.inputHash, replayed: false };
                        // One Ref update is the test commit point: nothing staged becomes visible before it.
                        yield* Ref.update(state, (current) => ({
                            ...current,
                            domain: [...current.domain, ...writes.domain],
                            history: [...current.history, ...writes.history],
                            outbox: [...current.outbox, ...writes.outbox],
                            receipts: [...current.receipts, completed.receipt],
                            dedup: new Map([...current.dedup, [request.key, saved]]),
                        }));
                        return saved;
                    })
                ),
        });
        const TestOnly = Layer.mergeAll(
            Layer.succeed(IdentityResolver, {
                resolve: () =>
                    Effect.gen(function* () {
                        if (!(yield* Ref.get(identityActive)))
                            return yield* new InvocationDenied({ action: '<identity>', reason: 'identity-revoked' });
                        const current = yield* Ref.get(identity);
                        yield* Ref.update(resolved, (all) => [...all, current]);
                        return current;
                    }),
            }),
            Layer.succeed(InputDigest, { digest: (canonical) => Effect.succeed(testOnlyDigest(canonical)) }),
            Layer.succeed(Approvals, {
                get: (id) =>
                    Ref.get(approvals).pipe(
                        Effect.flatMap((all) => {
                            const approval = all.get(id);
                            return approval === undefined
                                ? Effect.fail(
                                      new InvocationDenied({ action: '<approval>', reason: 'approval-revoked' })
                                  )
                                : Effect.succeed(approval);
                        })
                    ),
            }),
            Layer.succeed(ExecutionPolicy, { inspect: () => Ref.get(policy) }),
            Layer.succeed(Authorizer, {
                canInvoke: (_caller, action) =>
                    Ref.get(authorization).pipe(
                        Effect.flatMap((live) =>
                            live.invoke
                                ? Effect.void
                                : Effect.fail(new Forbidden({ action: action.name, reason: 'permission-revoked' }))
                        )
                    ),
                check: (_caller, action) =>
                    Ref.get(authorization).pipe(
                        Effect.flatMap((live) =>
                            live.input
                                ? Effect.void
                                : Effect.fail(new Forbidden({ action: action.name, reason: 'target-revoked' }))
                        )
                    ),
            }),
            Layer.succeed(Audit, { ready, record }),
            Layer.succeed(Integrity, integrity),
            Layer.succeed(TestOnlyLedger, ledger)
        );
        const recover = lock.withPermits(1)(
            Effect.gen(function* () {
                yield* ready('<recovery>');
                yield* Ref.update(state, (current) => {
                    const receipts = new Map(current.receipts.map((receipt) => [receipt.id, receipt]));
                    for (const receipt of current.spool) receipts.set(receipt.id, receipt);
                    return { ...current, receipts: [...receipts.values()], spool: [] };
                });
            })
        );
        return {
            TestOnly,
            identity,
            identityActive,
            authorization,
            resolved,
            approvals,
            policy,
            auditOnline,
            spoolCapacity,
            beforeIntegrity,
            state,
            recover,
            ledger,
        };
    });
