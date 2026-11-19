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
import { ExecutionPolicy, Integrity } from '@eventiva/runtime/invocation';
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

/** Distinguish captured module services from conflicting ambient invocation services. */
class ModuleMarker extends Context.Tag('qualification/CallerModuleMarker')<ModuleMarker, string>() {}

/** Distinguish ambient context from its replacement service scoped to the Integrity callback. */
class TransactionMarker extends Context.Tag('qualification/CallerTransactionMarker')<TransactionMarker, string>() {}

/** Build only public host services; the volatile ledger proves identity selection, not SQL durability or trusted ingress. */
const fixture = (
    sideEffect: 'read' | 'write',
    initial: CallerIdentity,
    moduleMode: 'none' | 'benign' | 'conflicting' = 'none'
) =>
    Effect.gen(
        /** Record independent policy and handler observations without supplying Caller through a module-specific bridge. */ function* () {
            // A readable test digest and volatile transaction isolate this acceptance question from production adapters.
            const harness = yield* makeTestOnlyHarness(initial);
            const observations = yield* Ref.make<ReadonlyArray<CallerIdentity>>([]);
            const entries = yield* Ref.make(0);
            const moduleBuilds = yield* Ref.make(0);
            const afterHandler = yield* Ref.make<Effect.Effect<void>>(Effect.void);
            const originalIntegrity = Context.get(yield* Layer.build(harness.TestOnly), Integrity);
            const moduleLayer = Layer.effect(
                ModuleMarker,
                Ref.update(
                    moduleBuilds,
                    /** Count actual Layer acquisition so per-invocation rebuilding cannot hide registration capture. */ (
                        n
                    ) => n + 1
                ).pipe(Effect.as('module-service'))
            );
            const action = define(`qualification.caller-${sideEffect}`, {
                version: 1,
                description: 'Observe invocation Caller without a feature-owned canonicalization bridge.',
                input: Schema.Struct({}),
                output: Schema.Struct({
                    caller: Schema.NullOr(CallerIdentity),
                    module: Schema.optional(Schema.NullOr(Schema.String)),
                    transaction: Schema.optional(Schema.NullOr(Schema.String)),
                }),
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
                    Layer.provide(
                        Layer.succeed(Integrity, {
                            /** Preserve the existing transaction while injecting a callback-only context service. */
                            commit: (request, execute) =>
                                originalIntegrity.commit(
                                    request,
                                    execute.pipe(Effect.provideService(TransactionMarker, 'integrity-transaction'))
                                ),
                        })
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
                    ...(moduleMode === 'none'
                        ? {}
                        : {
                              layer:
                                  moduleMode === 'conflicting'
                                      ? Layer.merge(moduleLayer, Layer.succeed(Caller, registration))
                                      : moduleLayer,
                          }),
                    actions: [
                        implement(
                            action,
                            /** Observe ambient Caller without declaring a module-owned Caller dependency or capturing registration identity. */ () =>
                                Effect.gen(
                                    /** Count actual work and stage its identity observations under the same test Integrity owner. */ function* () {
                                        // Optional service lookup is the public Effect mechanism already used by settings' handler boundary.
                                        const caller = Option.getOrNull(yield* Effect.serviceOption(Caller));
                                        const module = Option.getOrNull(yield* Effect.serviceOption(ModuleMarker));
                                        const transaction = Option.getOrNull(
                                            yield* Effect.serviceOption(TransactionMarker)
                                        );
                                        const output = {
                                            caller,
                                            ...(moduleMode === 'none' ? {} : { module, transaction }),
                                        };
                                        yield* Ref.update(
                                            entries,
                                            /** Count real executions, excluding deduplicated replies. */ (n) => n + 1
                                        );
                                        if (sideEffect === 'write') {
                                            yield* harness.ledger.stage('domain', output);
                                            yield* harness.ledger.stage('history', output);
                                            yield* harness.ledger.stage('outbox', output);
                                        }
                                        yield* Ref.get(afterHandler).pipe(Effect.flatten);
                                        return output;
                                    }
                                )
                        ),
                    ],
                })
                .pipe(Effect.provideService(Caller, registration));
            /** Execute the same logical key with a separately supplied ambient identity; only mutation results deduplicate. */
            const execute = (caller: CallerIdentity = presented, key = 'same-key') =>
                host
                    .execute(action.name, {}, { idempotencyKey: key })
                    .pipe(
                        Effect.provideService(Caller, caller),
                        Effect.provideService(ModuleMarker, 'ambient-decoy'),
                        Effect.provideService(TransactionMarker, 'ambient-transaction')
                    );
            return { harness, observations, entries, execute, action, moduleBuilds, afterHandler };
        }
    );

describe('Caller public-path qualification', /** Separate production-compatible controls from synthetic identity substitution. */ () => {
    // Cross reads/mutations with equal/substituted resolution: otherwise skipped handlers or a replay-only path could hide the split.
    for (const sideEffect of ['read', 'write'] as const) {
        for (const substitution of [false, true]) {
            it.scoped(
                `${sideEffect}: ${substitution ? 'uses resolved canonical identity rather than presented identity' : 'uses invocation identity rather than registration identity'}`,
                /** Compare successful handler output, policy and persisted evidence through the real executor. */ () =>
                    Effect.gen(
                        /** Require successful positive controls so a denial or missing service cannot masquerade as identity propagation. */ function* () {
                            // Current production resolution preserves identity fields; only the substitution branch deliberately violates that equality.
                            const canonical = substitution ? resolved : presented;
                            const f = yield* fixture(sideEffect, canonical);
                            const first = yield* f.execute();
                            expect(first.result).toEqual(Exit.succeed({ caller: canonical }));
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
                                expect(state.domain).toEqual([{ caller: canonical }]);
                                expect(state.history).toEqual(state.domain);
                                expect(state.outbox).toEqual(state.domain);
                                expect([...state.dedup.keys()]).toEqual([
                                    JSON.stringify([canonical.tenant, canonical.subject, f.action.name, 1, 'same-key']),
                                ]);
                                // Replay returns historical output, but its new receipt must use the fresh admitted session.
                                const refreshed = { ...canonical, session: person('08').session };
                                yield* Ref.set(f.harness.identity, refreshed);
                                const refreshedReplay = yield* f.execute(refreshed);
                                expect(refreshedReplay.result).toEqual(first.result);
                                expect(refreshedReplay.receipt.caller).toEqual(refreshed);
                                expect(refreshedReplay.replayed).toBe(true);
                                expect(yield* Ref.get(f.entries)).toBe(1);
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

    for (const sideEffect of ['read', 'write'] as const) {
        for (const moduleMode of ['benign', 'conflicting'] as const) {
            it.scoped(
                `${sideEffect}: canonical Caller wins with ${moduleMode} once-built module services`,
                /** Cross module precedence with both executor branches and independent invocation identities. */ () =>
                    Effect.gen(
                        /** Preserve captured non-Caller services and transaction-local context without rebuilding the module. */ function* () {
                            const f = yield* fixture(sideEffect, resolved, moduleMode);
                            const expected = [];
                            // Distinct new requests must see fresh canonical identity rather than the first invocation's closure.
                            for (const canonical of [resolved, person('06')]) {
                                yield* Ref.set(f.harness.identity, canonical);
                                const key = canonical.session;
                                const output = {
                                    caller: canonical,
                                    module: 'module-service',
                                    transaction:
                                        sideEffect === 'write' ? 'integrity-transaction' : 'ambient-transaction',
                                };
                                const result = yield* f.execute(presented, key);
                                expect(result.result).toEqual(Exit.succeed(output));
                                expect(result.receipt.caller).toEqual(canonical);
                                expect(result.replayed).toBe(false);
                                const repeat = yield* f.execute(presented, key);
                                expect(repeat.result).toEqual(result.result);
                                expect(repeat.replayed).toBe(sideEffect === 'write');
                                expected.push(output);
                            }
                            expect(yield* Ref.get(f.moduleBuilds)).toBe(1);
                            expect(yield* Ref.get(f.entries)).toBe(sideEffect === 'write' ? 2 : 4);
                            const state = yield* Ref.get(f.harness.state);
                            expect(state.domain).toEqual(sideEffect === 'write' ? expected : []);
                            expect(state.history).toEqual(state.domain);
                            expect(state.outbox).toEqual(state.domain);
                        }
                    )
            );
        }
    }

    it.scoped(
        'rolls back canonical module-backed writes when identity changes after the handler',
        /** Contrast denied post-handler authority with recovery and once-only replay on the same public key. */ () =>
            Effect.gen(
                /** Keep staged domain/history/outbox and successful dedup evidence absent after commit denial. */ function* () {
                    const f = yield* fixture('write', resolved, 'conflicting');
                    // Delay the session change until after staging: a preflight denial would not prove transaction rollback.
                    yield* Ref.set(
                        f.afterHandler,
                        Ref.set(f.harness.identity, { ...resolved, session: person('07').session })
                    );
                    const denied = yield* f.execute();
                    expect(denied.result).toMatchObject({
                        _tag: 'Failure',
                        cause: { error: { _tag: 'InvocationDenied', reason: 'identity-changed' } },
                    });
                    const rolledBack = yield* Ref.get(f.harness.state);
                    expect(rolledBack.domain).toEqual([]);
                    expect(rolledBack.history).toEqual([]);
                    expect(rolledBack.outbox).toEqual([]);
                    expect(rolledBack.dedup.size).toBe(0);
                    expect(rolledBack.receipts).toEqual([denied.receipt]);
                    yield* Ref.set(f.afterHandler, Effect.void);
                    yield* Ref.set(f.harness.identity, resolved);
                    const recovered = yield* f.execute();
                    const replay = yield* f.execute();
                    expect(recovered.result).toEqual(
                        Exit.succeed({
                            caller: resolved,
                            module: 'module-service',
                            transaction: 'integrity-transaction',
                        })
                    );
                    expect(replay.result).toEqual(recovered.result);
                    expect(replay.replayed).toBe(true);
                    expect(yield* Ref.get(f.entries)).toBe(2);
                    expect(yield* Ref.get(f.moduleBuilds)).toBe(1);
                    const state = yield* Ref.get(f.harness.state);
                    expect(state.domain).toHaveLength(1);
                    expect(state.history).toEqual(state.domain);
                    expect(state.outbox).toEqual(state.domain);
                    expect(state.dedup.size).toBe(1);
                }
            )
    );

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
