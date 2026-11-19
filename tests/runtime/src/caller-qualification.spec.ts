/**
 * @file tests/runtime/src/caller-qualification.spec.ts
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

import { define } from '@eventiva/contracts/action';
import { Authorizer, Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { ExecutionPolicy } from '@eventiva/runtime/invocation';
import { makeTestOnlyHarness } from '@eventiva/runtime/testing';
import { describe, expect, it } from '@effect/vitest';
import { Context, Effect, Exit, Layer, Option, Ref, Schema } from 'effect';

/** Allocate distinct valid identity fields so accidental registration capture cannot resemble invocation authority. */
const person = (suffix: string): CallerIdentity => ({
    subject: SubjectId.make(`0193a4f0-0000-7000-8000-0000000000${suffix}`),
    session: SessionId.make(`0193a4f0-0000-7000-8001-0000000000${suffix}`),
    tenant: TenantId.make(`0193a4f0-0000-7000-8002-0000000000${suffix}`),
    kind: 'human',
});
const registration = person('01');
const presented = person('02');
const resolved: CallerIdentity = {
    ...person('03'),
    kind: 'external-agent',
    onBehalfOf: person('04').subject,
};

/** Build only public host services; the volatile ledger proves identity selection, not SQL durability or trusted ingress. */
const fixture = (sideEffect: 'read' | 'write', initial: CallerIdentity) =>
    Effect.gen(
        /** Record independent policy and handler observations without supplying Caller through a module-specific bridge. */ function* () {
            // A readable test digest and volatile transaction isolate this acceptance question from production adapters.
            const harness = yield* makeTestOnlyHarness(initial);
            const observations = yield* Ref.make<ReadonlyArray<CallerIdentity>>([]);
            const entries = yield* Ref.make(0);
            const action = define(`qualification.caller-${sideEffect}`, {
                version: 1,
                description: 'Observe invocation Caller without a feature-owned canonicalization bridge.',
                input: Schema.Struct({}),
                output: Schema.Struct({ caller: Schema.NullOr(CallerIdentity) }),
                permission: 'qualification.caller',
                sideEffect,
                offline: 'local',
            });
            /** Keep full identity values so a correct subject cannot conceal a wrong tenant, session or delegation. */
            const observe = (caller: CallerIdentity) =>
                Ref.update(
                    observations,
                    /** Append one live authority observation in encounter order. */ (all) => [...all, caller]
                );
            const context = yield* Layer.build(
                ActionHostLive.pipe(
                    Layer.provide(
                        Layer.mergeAll(
                            Layer.succeed(Authorizer, {
                                /** Record coarse authority independently of handler environment. */
                                canInvoke: (caller) => observe(caller),
                                /** Record decoded-target authority independently of coarse admission. */
                                check: (caller) => observe(caller),
                            }),
                            Layer.succeed(ExecutionPolicy, {
                                /** Permit routine delegated work explicitly so missing approval cannot mask propagation behavior. */
                                inspect: (caller) =>
                                    observe(caller).pipe(
                                        Effect.as({
                                            approval: 'none' as const,
                                            routinePreauthorized: true,
                                            stepUp: false,
                                            bounds: {},
                                            dependenciesReady: true,
                                            capacityAvailable: true,
                                        })
                                    ),
                            })
                        )
                    ),
                    Layer.provide(harness.TestOnly),
                    Layer.provide(FlagsSafeDefaults)
                )
            );
            const host = Context.get(context, ActionHost);
            yield* host
                .register({
                    manifest: {
                        format: 1,
                        id: 'caller-qualification',
                        version: '1.0.0',
                        description: 'Synthetic Caller acceptance fixture.',
                        actions: [action.name],
                        flags: [],
                    },
                    actions: [
                        implement(
                            action,
                            /** Observe ambient Caller without declaring a module-owned Caller dependency or capturing registration identity. */ () =>
                                Effect.gen(
                                    /** Count actual work and stage its identity observations under the same test Integrity owner. */ function* () {
                                        // Optional service lookup is the public Effect mechanism already used by settings' handler boundary.
                                        const caller = Option.getOrNull(yield* Effect.serviceOption(Caller));
                                        yield* Ref.update(
                                            entries,
                                            /** Count real executions, excluding deduplicated replies. */ (n) => n + 1
                                        );
                                        if (sideEffect === 'write') {
                                            yield* harness.ledger.stage('domain', { caller });
                                            yield* harness.ledger.stage('history', { caller });
                                            yield* harness.ledger.stage('outbox', { caller });
                                        }
                                        return { caller };
                                    }
                                )
                        ),
                    ],
                })
                .pipe(Effect.provideService(Caller, registration));
            /** Execute the same logical key with a separately supplied ambient identity; only mutation results deduplicate. */
            const execute = (caller: CallerIdentity = presented) =>
                host
                    .execute(action.name, {}, { idempotencyKey: 'same-key' })
                    .pipe(Effect.provideService(Caller, caller));
            return { harness, observations, entries, execute, action };
        }
    );

describe('Caller public-path qualification', /** Separate production-compatible controls from synthetic identity substitution. */ () => {
    // Cross reads/mutations with equal/substituted resolution: otherwise skipped handlers or a replay-only path could hide the split.
    for (const sideEffect of ['read', 'write'] as const) {
        for (const substitution of [false, true]) {
            it.scoped(
                `${sideEffect}: ${substitution ? 'characterizes synthetic presented/resolved split' : 'uses invocation identity rather than registration identity'}`,
                /** Compare successful handler output, policy and persisted evidence through the real executor. */ () =>
                    Effect.gen(
                        /** Require successful positive controls so a denial or missing service cannot masquerade as identity propagation. */ function* () {
                            // Current production resolution preserves identity fields; only the substitution branch deliberately violates that equality.
                            const canonical = substitution ? resolved : presented;
                            const f = yield* fixture(sideEffect, canonical);
                            const first = yield* f.execute();
                            expect(first.result).toEqual(Exit.succeed({ caller: presented }));
                            expect(first.receipt.caller).toEqual(canonical);
                            expect(first.receipt.outcome).toBe('succeeded');
                            expect(first.replayed).toBe(false);
                            const again = yield* f.execute();
                            expect(again.result).toEqual(first.result);
                            expect(again.receipt.caller).toEqual(canonical);
                            expect(again.receipt.id).not.toBe(first.receipt.id);
                            expect(again.replayed).toBe(sideEffect === 'write');
                            expect(yield* Ref.get(f.entries)).toBe(sideEffect === 'write' ? 1 : 2);
                            const seen = yield* Ref.get(f.observations);
                            expect(seen.length).toBeGreaterThan(0);
                            for (const caller of seen) expect(caller).toEqual(canonical);
                            const state = yield* Ref.get(f.harness.state);
                            expect(state.receipts).toEqual([first.receipt, again.receipt]);
                            if (sideEffect === 'write') {
                                expect(state.domain).toEqual([{ caller: presented }]);
                                expect(state.history).toEqual(state.domain);
                                expect(state.outbox).toEqual(state.domain);
                                expect([...state.dedup.keys()]).toEqual([
                                    JSON.stringify([canonical.tenant, canonical.subject, f.action.name, 1, 'same-key']),
                                ]);
                                // Vary tenant and principal independently: changing both would not detect a key omitting either one.
                                for (const other of [
                                    { ...canonical, tenant: person('05').tenant },
                                    { ...canonical, subject: person('05').subject },
                                ]) {
                                    yield* Ref.set(f.harness.identity, other);
                                    const separate = yield* f.execute(other);
                                    expect(separate.result).toEqual(Exit.succeed({ caller: other }));
                                    expect(separate.receipt.caller).toEqual(other);
                                    expect(separate.replayed).toBe(false);
                                }
                                expect(yield* Ref.get(f.entries)).toBe(3);
                                expect((yield* Ref.get(f.harness.state)).dedup.size).toBe(3);
                            }
                        }
                    )
            );
        }
    }

    it.scoped(
        'preserves an already-canonical delegated caller through handler execution and replay',
        /** Supply matching presented/resolved agent identity as the production-compatible delegation control. */ () =>
            Effect.gen(
                /** Require successful delegated work rather than treating approval rejection as propagation proof. */ function* () {
                    // The explicit trusted policy permits this routine agent; it is not a production grant or approval-store test.
                    const f = yield* fixture('write', resolved);
                    const first = yield* f.execute(resolved);
                    const replay = yield* f.execute(resolved);
                    expect(first.result).toEqual(Exit.succeed({ caller: resolved }));
                    expect(replay.result).toEqual(first.result);
                    expect(first.receipt.caller).toEqual(resolved);
                    expect(replay.receipt.caller).toEqual(resolved);
                    expect(replay.replayed).toBe(true);
                    expect(yield* Ref.get(f.entries)).toBe(1);
                    expect((yield* Ref.get(f.harness.state)).domain).toEqual([{ caller: resolved }]);
                }
            )
    );

    for (const field of ['subject', 'tenant', 'session', 'kind', 'onBehalfOf'] as const) {
        it.scoped(
            `denies ${field} substitution after Integrity admission wait`,
            /** Change one resolved identity field only after successful preflight, with the handler still unentered. */ () =>
                Effect.gen(
                    /** Require the established identity tuple to stay stable across lock waits without silently rerouting work. */ function* () {
                        const f = yield* fixture('write', presented);
                        // This deterministic adapter barrier runs after preflight; the normal successful cases above validate the same fixture.
                        const changed: CallerIdentity = { ...presented, [field]: resolved[field] };
                        yield* Ref.set(f.harness.beforeIntegrity, Ref.set(f.harness.identity, changed));
                        const result = yield* f.execute();
                        expect(result.result).toMatchObject({
                            _tag: 'Failure',
                            cause: { error: { _tag: 'InvocationDenied', reason: 'identity-changed' } },
                        });
                        expect(result.receipt.caller).toEqual(presented);
                        expect(result.receipt.outcome).toBe('denied');
                        expect(yield* Ref.get(f.entries)).toBe(0);
                        const state = yield* Ref.get(f.harness.state);
                        expect(state.domain).toEqual([]);
                        expect(state.history).toEqual([]);
                        expect(state.outbox).toEqual([]);
                        expect(state.dedup.size).toBe(0);
                        expect(state.receipts).toEqual([result.receipt]);
                    }
                )
        );
    }
});
