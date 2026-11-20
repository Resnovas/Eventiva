/**
 * @file apps/client/src/bootstrap.spec.ts
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

import { Flags, FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { describe, expect, it } from '@effect/vitest';
import { Deferred, Effect, Fiber, Layer } from 'effect';
import { createBootstrap, type StartupState } from './bootstrap.ts';

describe('client bootstrap', /** Verify registration observes readiness and retains provider ownership until shutdown. */ () => {
    it.effect(
        'registers synchronously before flags resolve, then publishes readiness and releases exactly once',
        /** Use a real scope and readiness barrier rather than timing-dependent sleeps. */ () =>
            Effect.gen(
                /** Separate shell registration from product readiness with an unresolved acquisition barrier. */ function* () {
                    // The barrier distinguishes native registration from provider readiness without a timing assumption.
                    const controller = createBootstrap();
                    const ready = yield* Deferred.make<void>();
                    const acquiring = yield* Deferred.make<void>();
                    const announced = yield* Deferred.make<void>();
                    let registered = false;
                    const transitions: StartupState[] = [];
                    const unsubscribe = controller.subscribe(
                        /** Observe the same subscription protocol used by the root renderer. */ () => {
                            // Recording before releasing the barrier lets the test observe the exact published transition.
                            transitions.push(controller.snapshot());
                            Effect.runSync(Deferred.succeed(announced, undefined));
                        }
                    );
                    let released = 0;
                    const flags = Layer.scoped(
                        Flags,
                        Effect.acquireRelease(
                            Effect.zipRight(Deferred.succeed(acquiring, undefined), Deferred.await(ready)).pipe(
                                Effect.zipRight(Effect.provide(Flags, FlagsSafeDefaults))
                            ),
                            /** Count actual finalization so returning immediately after registration fails this scenario. */ () =>
                                Effect.sync(
                                    /** Observe scope disposal without replacing its release behavior. */ () => {
                                        released += 1;
                                    }
                                )
                        )
                    );
                    const fiber = Effect.runSync(
                        controller.start(
                            Effect.sync(
                                /** A native host can request the registered shell before any asynchronous provider completes. */ () => {
                                    registered = true;
                                }
                            ),
                            flags
                        )
                    );
                    expect(registered).toBe(true);
                    yield* Deferred.await(acquiring);
                    expect(controller.snapshot()).toBe('loading');
                    expect(transitions).toEqual([]);
                    yield* Deferred.succeed(ready, undefined);
                    yield* Deferred.await(announced);
                    expect(controller.snapshot()).toBe('ready');
                    expect(released).toBe(0);
                    unsubscribe();
                    yield* Fiber.interrupt(fiber);
                    yield* Fiber.interrupt(fiber);
                    expect(controller.snapshot()).toBe('loading');
                    expect(transitions).toEqual(['ready']);
                    expect(released).toBe(1);
                }
            )
    );

    it.effect(
        'keeps the shell available on fatal acquisition failure without exposing product content',
        /** A failed flag layer must not expose a partially initialized application. */ () =>
            Effect.gen(
                /** Distinguish fail-closed startup from successful registration followed by an error. */ function* () {
                    // A failure after acquiring a dependency must close that dependency before showing the bounded failure state.
                    const controller = createBootstrap();
                    const announced = yield* Deferred.make<void>();
                    const unsubscribe = controller.subscribe(
                        /** Await a real state notification instead of sleeping until failure is likely. */ () => {
                            Effect.runSync(Deferred.succeed(announced, undefined));
                        }
                    );
                    let registered = false;
                    let released = false;
                    const flags = Layer.scoped(
                        Flags,
                        Effect.gen(
                            /** Acquire a dependency before simulating a fatal initialization failure. */ function* () {
                                // Partial acquisition is intentional: the regression concerns release on failed startup.
                                yield* Effect.acquireRelease(
                                    Effect.void,
                                    /** Dispose even when initialization does not yield a service. */ () =>
                                        Effect.sync(
                                            /** Observe dependency release on failed acquisition. */ () => {
                                                released = true;
                                            }
                                        )
                                );
                                return yield* Effect.fail('synthetic-startup-failure');
                            }
                        )
                    );
                    const fiber = yield* controller.start(
                        Effect.sync(
                            /** The failure shell remains registered even though product readiness will fail. */ () => {
                                registered = true;
                            }
                        ),
                        flags
                    );
                    yield* Deferred.await(announced);
                    expect(controller.snapshot()).toBe('failed');
                    expect(registered).toBe(true);
                    expect(released).toBe(true);
                    unsubscribe();
                    yield* Fiber.interrupt(fiber);
                }
            )
    );
});
