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
    {
        /** Append JSON-compatible test data to the current fiber's staged transaction; writes outside it are defects. */ readonly stage: <
            Value
        >(
            part: keyof Staged,
            value: Value
        ) => Effect.Effect<void>
    }
>() {}

/** Not a cryptographic digest. Injective canonical text is useful ONLY in deterministic tests. */
export const testOnlyDigest = (canonical: string): string => `TEST-ONLY:${canonical}`;

/**
 * TEST ONLY. All state, receipts and spool entries disappear on process exit.
 * The returned TestOnly layer is explicitly not a durable platform implementation.
 * Refs are intentionally exposed for revocation, outage and live-policy tests.
 */
export const makeTestOnlyHarness = (initialIdentity: CallerIdentity) =>
    Effect.gen(
        /** Build an isolated volatile authority/audit/integrity fixture with externally controllable revocation and outage state. */ function* () {
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
            /** Model durable-audit readiness using the test's explicit outage switch, not actual persistence. */
            const ready = (action: string) =>
                Ref.get(auditOnline).pipe(
                    Effect.flatMap(
                        /** Deny readiness during simulated audit outage before the protected handler runs. */ (
                            online
                        ) => (online ? Effect.void : Effect.fail(new AuditUnavailable({ action })))
                    )
                );
            /** Model deduplicated receipt recording with an explicitly allowed capacity-bounded volatile spool. */
            const record = (receipt: Receipt, allowSpool: boolean) =>
                Effect.gen(
                    /** Snapshot simulated readiness/capacity and atomically choose receipt storage, spool or rejection. */ function* () {
                        // This is a deterministic conformance model, not process-crash durability or a production audit fallback.
                        const online = yield* Ref.get(auditOnline);
                        const capacity = yield* Ref.get(spoolCapacity);
                        return yield* Ref.modify(
                            state,
                            /** Deduplicate by receipt id before applying outage/capacity rules, leaving state unchanged on failure. */
                            (
                                current
                            ): readonly [
                                Effect.Effect<'durable' | 'spooled', AuditUnavailable>,
                                TestOnlyLedgerState
                            ] => {
                                // Identical retries retain their original storage class; they do not consume spool capacity twice.
                                if (
                                    current.receipts.some(
                                        /** Recognize an already recorded invocation id without appending duplicate evidence. */ (
                                            entry
                                        ) => entry.id === receipt.id
                                    )
                                )
                                    return [Effect.succeed('durable'), current];
                                if (
                                    current.spool.some(
                                        /** Recognize a previously spooled receipt even while the simulated sink remains unavailable. */ (
                                            entry
                                        ) => entry.id === receipt.id
                                    )
                                )
                                    return [Effect.succeed('spooled'), current];
                                if (online)
                                    return [
                                        Effect.succeed('durable'),
                                        { ...current, receipts: [...current.receipts, receipt] },
                                    ];
                                if (allowSpool && current.spool.length < capacity)
                                    return [
                                        Effect.succeed('spooled'),
                                        { ...current, spool: [...current.spool, receipt] }
                                    ];
                                return [Effect.fail(new AuditUnavailable({ action: receipt.action })), current];
                            }
                        ).pipe(Effect.flatten);
                    }
                );
            const ledger = TestOnlyLedger.of({
                /** Stage a canonical JSON value in the current test transaction without publishing it to shared ledger state. */
                stage: (part, value) =>
                    Effect.gen(
                        /** Reject writes outside Integrity execution and isolate successful writes until the atomic test commit point. */ function* () {
                            // Fiber-local staging disappears on failed execution, so failed mutations cannot leak domain/history/outbox writes.
                            const staged = yield* FiberRef.get(transaction);
                            if (staged === undefined)
                                return yield* Effect.dieMessage('TestOnlyLedger write outside Integrity transaction');
                            const decoded = yield* canonicalJson(value).pipe(
                                Effect.flatMap(Schema.decode(Json)),
                                Effect.orDie
                            );
                            yield* Ref.update(
                                staged,
                                /** Append only to this transaction's selected ledger partition. */ (current) => ({
                                    ...current,
                                    [part]: [...current[part], decoded]
                                })
                            );
                        }
                    ),
            });
            const integrity = Integrity.of({
                /** Serialize test mutations, reject changed-input retries and atomically publish staged writes with receipt/dedup evidence. */
                commit: (request, execute) =>
                    lock.withPermits(1)(
                        Effect.gen(
                            /** Resolve retries under the test lock or run a new mutation in private fiber-local staging. */ function* () {
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
                                    Effect.mapError(
                                        /** Refuse test commit output that cannot cross the same canonical JSON boundary as durable output. */ () =>
                                            new AuditUnavailable({ action: request.action })
                                    )
                                );
                                yield* ready(request.action);
                                const writes = yield* Ref.get(staged);
                                const saved = { ...completed, output, inputHash: request.inputHash, replayed: false };
                                // One Ref update is the test commit point: nothing staged becomes visible before it.
                                yield* Ref.update(
                                    state,
                                    /** Publish all staged partitions and success evidence together, preserving concurrent unrelated ledger entries. */ (
                                        current
                                    ) => ({
                                        ...current,
                                        domain: [...current.domain, ...writes.domain],
                                        history: [...current.history, ...writes.history],
                                        outbox: [...current.outbox, ...writes.outbox],
                                        receipts: [...current.receipts, completed.receipt],
                                        dedup: new Map([...current.dedup, [request.key, saved]]),
                                    })
                                );
                                return saved;
                            }
                        )
                    ),
            });
            /** Resolve the volatile map afresh for both lookup and accepting use; this fixture is not durable consent storage. */
            const testApproval: Approvals['Type']['get'] = (id) =>
                Ref.get(approvals).pipe(
                    Effect.flatMap(
                        /** Removing evidence models revocation rather than preserving an earlier successful observation. */
                        (all) => {
                            // No absent id can inherit another fixture approval, including during accepting use.
                            const approval = all.get(id);
                            return approval === undefined
                                ? Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'approval-revoked' }))
                                : Effect.succeed(approval);
                        }
                    )
                );
            const TestOnly = Layer.mergeAll(
                Layer.succeed(IdentityResolver, {
                    /** Resolve the test-controlled current identity on every call, recording successful refreshes for assertions. */
                    resolve: () =>
                        Effect.gen(
                            /** Simulate identity revocation before returning or recording the refreshed caller. */ function* () {
                                // Presented claims do not override the fixture's live identity state, matching the host's trusted-resolver contract.
                                if (!(yield* Ref.get(identityActive)))
                                    return yield* new InvocationDenied({
                                        action: '<identity>',
                                        reason: 'identity-revoked'
                                    });
                                const current = yield* Ref.get(identity);
                                yield* Ref.update(
                                    resolved,
                                    /** Retain each successful refresh so tests can distinguish live revalidation from cached authority. */ (
                                        all
                                    ) => [...all, current]
                                );
                                return current;
                            }
                        ),
                }),
                Layer.succeed(InputDigest, {
                    /** Supply deterministic injective test text, explicitly not production cryptography. */
                    digest: (
                        canonical
                    ) => Effect.succeed(testOnlyDigest(canonical))
                }),
                Layer.succeed(Approvals, {
                    /** Resolve only currently present test approvals; deleting an id simulates immediate revocation. */
                    get: testApproval,
                    /** Recheck volatile evidence at acceptance; SQL tests separately prove durable use and rollback. */
                    use: (id, target) => testApproval(id, target).pipe(Effect.asVoid),
                    /** This explicit test-only adapter provides no SQL or durable approved-read transaction claim. */
                    transaction: (effect) => effect,
                }),
                Layer.succeed(ExecutionPolicy, {
                    /** Read the test-controlled policy afresh so lock-wait and replay checks observe changes. */
                    inspect: () => Ref.get(policy)
                }),
                Layer.succeed(Authorizer, {
                    /** Model pre-decode permission revocation independently of decoded-target authorization. */
                    canInvoke: (_caller, action) =>
                        Ref.get(authorization).pipe(
                            Effect.flatMap(
                                /** Allow only the current discovery/invocation permission bit. */ (live) =>
                                    live.invoke
                                        ? Effect.void
                                        : Effect.fail(
                                              new Forbidden({ action: action.name, reason: 'permission-revoked' })
                                          )
                            )
                        ),
                    /** Model decoded-target revocation independently of permission discovery. */
                    check: (_caller, action) =>
                        Ref.get(authorization).pipe(
                            Effect.flatMap(
                                /** Reject when the fixture's current target policy has been revoked. */ (live) =>
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
                Effect.gen(
                    /** Drain the volatile test spool only when simulated audit readiness has recovered, under the mutation lock. */ function* () {
                        // Recovery shares serialization with mutation commits so receipt deduplication cannot overwrite a newly committed receipt.
                        yield* ready('<recovery>');
                        yield* Ref.update(
                            state,
                            /** Merge recorded and spooled evidence by invocation id before clearing the test spool. */ (
                                current
                            ) => {
                                // Deduplicate by receipt id rather than appending, matching retry-safe durable draining semantics.
                                const receipts = new Map(
                                    current.receipts.map(
                                        /** Index existing evidence so recovery preserves one receipt per invocation. */ (
                                            receipt
                                        ) => [receipt.id, receipt]
                                    )
                                );
                                for (const receipt of current.spool) receipts.set(receipt.id, receipt);
                                return { ...current, receipts: [...receipts.values()], spool: [] };
                            }
                        );
                    }
                )
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
        }
    );
