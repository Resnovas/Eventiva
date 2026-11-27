/**
 * @file apps/client/src/bootstrap.ts
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

import { Flags } from '@eventiva/contracts/flags';
import { Effect, Layer } from 'effect';

/**
 * Readiness is owned by bootstrap, not copied into component state. Fatal initialization never exposes product content.
 *
 * @since 0.0.1
 * @example
 * const state: StartupState = startup.snapshot();
 */
export type StartupState = 'loading' | 'ready' | 'failed';

/** React's external-store callback has no payload: readers obtain the current immutable snapshot. */
type Listener = () => void;

/**
 * Own one root's readiness and provider lifetime; each test or application creates an independent instance.
 *
 * @since 0.0.1
 * @returns The readiness store: a snapshot reader, a subscription for React, and the start Effect.
 * @example
 * const bootstrap = createBootstrap();
 * const fiber = Effect.runSync(bootstrap.start(registerRoot, FlagsLive));
 */
export const createBootstrap = () => {
    let state: StartupState = 'loading';
    const listeners = new Set<Listener>();
    /**
     * Publish a transition before notifying subscribers so concurrent readers see one consistent snapshot.
     *
     * @param next - The state to move to.
     * @returns An Effect that commits the state and then notifies every listener.
     */
    const publish = (next: StartupState) =>
        Effect.sync(
            /** Commit state first, because React may read synchronously from inside a notification; listeners only announce that readers should obtain the new snapshot. */ () => {
                state = next;
                for (const listener of listeners) listener();
            }
        );
    return {
        /**
         * Return the stable primitive snapshot consumed by React's external-store protocol.
         *
         * @returns The current startup state.
         */
        snapshot: (): StartupState => state,
        /**
         * Subscribe to readiness transitions; React owns this synchronous listener registration and its removal.
         *
         * @param listener - Called after each state change.
         * @returns A function that removes this listener.
         */
        subscribe: (listener: Listener): Listener => {
            listeners.add(listener);
            return /** Remove only this reader when React unsubscribes; bootstrap still owns the provider. */ () => {
                listeners.delete(listener);
            };
        },
        /**
         * Register the shell synchronously before starting asynchronous flags; interrupt the returned fiber at root
         * disposal. The provider fiber is forked only after registration, so network or provider readiness never
         * delays native root availability.
         *
         * @template E - The flag layer's construction error, which becomes the `failed` state.
         * @param register - The Effect that registers the native root component.
         * @param flags - The flag layer to acquire for the application's lifetime.
         * @returns An Effect yielding the daemon fiber that owns the flag providers.
         */
        start: <E>(register: Effect.Effect<void>, flags: Layer.Layer<Flags, E>) =>
            Effect.gen(
                /** Native hosts require a registered root before requesting their first render. */ function* () {
                    yield* register;
                    return yield* Effect.forkDaemon(
                        Effect.zipRight(publish('ready'), Effect.never).pipe(
                            Effect.provide(flags),
                            Effect.catchAllCause(
                                /**
                                 * Keep a bounded failure state visible; do not expose provider causes or render partial product content.
                                 *
                                 * @returns An Effect that publishes `failed` and then waits for interruption.
                                 */
                                () => Effect.zipRight(publish('failed'), Effect.never)
                            ),
                            Effect.ensuring(publish('loading'))
                        )
                    );
                }
            ),
    };
};

/**
 * The application's readiness store. One application entry owns it; importing the renderer does not acquire flag
 * providers.
 *
 * @since 0.0.1
 * @example
 * const state = useSyncExternalStore(startup.subscribe, startup.snapshot, startup.snapshot);
 */
export const startup = createBootstrap();
