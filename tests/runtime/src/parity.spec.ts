/**
 * @file tests/runtime/src/parity.spec.ts
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

import { describe, expect, it } from '@effect/vitest';
import { define } from '@eventiva/contracts/action';
import { Authorizer, Caller } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import { Flags, FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { ActionInventory, validateInventory, validateParity } from '@eventiva/contracts/inventory';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { makeTestOnlyHarness } from '@eventiva/runtime/testing';
import { SessionId, SubjectId } from '@eventiva/contracts/ids';
import { Deferred, Effect, Exit, Fiber, Layer, Option, Ref, Schema, Scope } from 'effect';

const shellCaller = {
    subject: SubjectId.make('0193a4f0-0000-7000-8000-000000000001'),
    kind: 'service' as const,
    session: SessionId.make('0193a4f0-0000-7000-8000-000000000002'),
};
const Status = define('parity.read', {
    version: 1,
    description: 'Read the parity fixture.',
    input: Schema.Struct({}),
    output: Schema.Struct({ ok: Schema.Boolean }),
    permission: 'parity.read',
    sideEffect: 'read',
    offline: 'local',
});

describe('action parity', /** Register inventory, dispatch and live discovery conformance scenarios. */ () => {
    it.scoped('a registered surface reaches the canonical inventory and its authorized dispatch', /** Install the test-only identity and invocation harness. */ () =>
        Effect.gen(/** Compare one registered action's discovery metadata with its actual dispatch. */ function* () {
            const fixture = yield* makeTestOnlyHarness(shellCaller);
            yield* Effect.gen(/** Verify discovery and invocation share the canonical registration. */ function* () {
                // Validate the advertised surface before dispatch so discoverability alone cannot satisfy parity.
                const host = yield* ActionHost;
                const inventory = yield* ActionInventory;
                const module = {
                    manifest: {
                        format: 1,
                        id: 'parity',
                        version: '1.0.0',
                        description: 'Parity fixture.',
                        actions: [Status.name],
                        flags: [],
                    },
                    actions: [implement(Status, /** Return a deterministic successful read result. */ () => Effect.succeed({ ok: true }))],
                };
                yield* host.register(module);
                const listed = yield* inventory.list(shellCaller);
                expect(listed.map(/** Compare public inventory identifiers without handler internals. */ (action) => action.id)).toEqual([Status.name]);
                yield* validateParity(
                    listed,
                    {
                        server: module.actions.map(/** Advertise only portable parity metadata for each server action. */ ({ spec }) => ({
                            id: spec.name,
                            version: spec.version,
                            permission: spec.permission,
                        })),
                    },
                    ['server']
                );
                expect(yield* host.invoke(Status.name, {})).toEqual({ ok: true });
                expect(Option.isSome(yield* inventory.find(shellCaller, Status.name))).toBe(true);
                expect(Option.isNone(yield* inventory.find(shellCaller, 'platform.missing'))).toBe(true);
            }).pipe(
                Effect.provide(ActionHostLive.pipe(Layer.provide(FlagsSafeDefaults), Layer.provide(fixture.TestOnly))),
                Effect.provideService(Caller, shellCaller)
            );
        })
    );

    it.scoped('never executes a disposed registration after waiting for Integrity', /** Pause invocation at Integrity while its registration is disposed. */ () =>
        Effect.gen(/** Establish deterministic disposal ordering without timers. */ function* () {
            // Hold execution before Integrity releases admission, allowing registration disposal to win the race.
            const fixture = yield* makeTestOnlyHarness(shellCaller);
            const waiting = yield* Deferred.make<void>();
            const resume = yield* Deferred.make<void>();
            yield* Ref.set(
                fixture.beforeIntegrity,
                Deferred.succeed(waiting, undefined).pipe(Effect.zipRight(Deferred.await(resume)))
            );
            yield* Effect.gen(/** Verify resumed execution rechecks registration before staging a write. */ function* () {
                // Keep registration in a separate scope so closing it does not itself interrupt the pending invocation.
                const host = yield* ActionHost;
                const registration = yield* Scope.make();
                const Write = define('parity.write', {
                    version: 1,
                    description: 'Write the parity fixture.',
                    input: Status.input,
                    output: Status.output,
                    permission: 'parity.write',
                    sideEffect: 'write',
                    offline: 'queued',
                });
                yield* host
                    .register({
                        manifest: {
                            format: 1,
                            id: 'parity',
                            version: '1.0.0',
                            description: 'Disposed fixture.',
                            actions: [Write.name],
                            flags: [],
                        },
                        actions: [
                            implement(Write, /** Stage a visible ledger effect if stale dispatch incorrectly reaches the handler. */ () =>
                                fixture.ledger.stage('domain', 'stale').pipe(Effect.as({ ok: true }))
                            ),
                        ],
                    })
                    .pipe(Scope.extend(registration));
                const pending = yield* host.execute(Write.name, {}, { idempotencyKey: 'disposed' }).pipe(Effect.fork);
                yield* Deferred.await(waiting);
                yield* Scope.close(registration, Exit.void);
                yield* Deferred.succeed(resume, undefined);
                const completed = yield* Fiber.join(pending);
                expect((yield* Effect.flip(completed.result))._tag).toBe('UnknownAction');
                expect((yield* Ref.get(fixture.state)).domain).toEqual([]);
            }).pipe(
                Effect.provide(ActionHostLive.pipe(Layer.provide(FlagsSafeDefaults), Layer.provide(fixture.TestOnly))),
                Effect.provideService(Caller, shellCaller)
            );
        })
    );

    it.scoped('discovery uses live authorization and flags and follows scoped module disposal', /** Exercise independent live discovery gates and registration lifetime. */ () =>
        Effect.gen(/** Build independently mutable policy and flag controls for inventory queries. */ function* () {
            // Independent controls detect discovery implementations that consult only one gate or cache their first answer.
            const fixture = yield* makeTestOnlyHarness(shellCaller);
            const allowed = yield* Ref.make(true);
            const enabled = yield* Ref.make(true);
            const Optional = define('parity.optional', {
                version: 1,
                description: 'An optional read capability.',
                input: Schema.Struct({}),
                output: Schema.Struct({}),
                permission: 'parity.optional',
                sideEffect: 'read',
                offline: 'local',
                flag: 'parity.enabled',
            });
            const authorizer = Layer.succeed(Authorizer, {
                /** Re-evaluate mutable authorization for every inventory lookup. */
                canInvoke: (_caller, spec) =>
                    Ref.get(allowed).pipe(
                        Effect.flatMap(/** Deny with the requested action when permission has been revoked. */ (yes) =>
                            yes ? Effect.void : Effect.fail(new Forbidden({ action: spec.name, reason: 'revoked' }))
                        )
                    ),
                /** Leave unrelated resource checks open in this discovery fixture. */
                check: () => Effect.void,
            });
            const flags = Layer.succeed(Flags, {
                /** Resolve the requested flag from the current fixture switch. */
                evaluate: (flag) =>
                    Ref.get(enabled).pipe(
                        Effect.map(/** Preserve flag identity while reporting a live nonfallback result. */ (value) => ({ flag: flag.key, value, reason: 'TEST', fallback: false }))
                    ),
            });
            yield* Effect.gen(/** Verify disposal and identity revocation remain visible outside registration scope. */ function* () {
                // Query after registration scope exit to distinguish disposed metadata from temporarily hidden actions.
                const host = yield* ActionHost;
                const inventory = yield* ActionInventory;
                yield* Effect.scoped(
                    Effect.gen(/** Toggle authorization and flag independently while the optional action remains registered. */ function* () {
                        // Restore authorization before disabling the flag so each empty result has exactly one cause.
                        yield* host.register({
                            manifest: {
                                format: 1,
                                id: 'parity',
                                version: '1.0.0',
                                description: 'Parity.',
                                actions: [Optional.name],
                                flags: [
                                    {
                                        key: 'parity.enabled',
                                        description: 'Gate.',
                                        owner: 'parity',
                                        safeDefault: false,
                                    },
                                ],
                            },
                            actions: [implement(Optional, /** Supply the optional read's empty successful result. */ () => Effect.succeed({}))],
                        });
                        expect((yield* inventory.list(shellCaller)).map(/** Inspect discoverable identifiers only. */ (item) => item.id)).toEqual([Optional.name]);
                        yield* Ref.set(allowed, false);
                        expect(yield* inventory.list(shellCaller)).toEqual([]);
                        yield* Ref.set(allowed, true);
                        yield* Ref.set(enabled, false);
                        expect(yield* inventory.list(shellCaller)).toEqual([]);
                        yield* Ref.set(enabled, true);
                        expect(Option.isSome(yield* inventory.find(shellCaller, Optional.name))).toBe(true);
                    })
                );
                expect(yield* inventory.list(shellCaller)).toEqual([]);
                yield* Ref.set(fixture.identityActive, false);
                expect((yield* Effect.flip(inventory.list(shellCaller)))._tag).toBe('Forbidden');
            }).pipe(
                Effect.provide(
                    ActionHostLive.pipe(
                        Layer.provide(flags),
                        Layer.provide(authorizer),
                        Layer.provide(fixture.TestOnly)
                    )
                )
            );
        })
    );

    it.effect('rejects incompatible metadata and every missing registered surface', /** Compare missing and version-incompatible advertised surfaces. */ () =>
        Effect.gen(/** Verify parity validation rejects absence and mismatched versions independently. */ function* () {
            const inventory = yield* validateInventory([Status]);
            const missing = yield* Effect.flip(validateParity(inventory, {}, ['server']));
            expect(missing._tag).toBe('InventoryParityError');
            const incompatible = yield* Effect.flip(
                validateParity(
                    inventory,
                    { server: [{ id: Status.name, version: Status.version + 1, permission: Status.permission }] },
                    ['server']
                )
            );
            expect(incompatible._tag).toBe('InventoryParityError');
        })
    );
});
