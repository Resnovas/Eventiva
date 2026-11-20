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

/** Readiness is owned by bootstrap, not copied into component state. Fatal initialization never exposes product content. */
export type StartupState = 'loading' | 'ready' | 'failed';

/** React's external-store callback has no payload: readers obtain the current immutable snapshot. */
type Listener = () => void;

/** Own one root's readiness and provider lifetime; each test or application creates an independent instance. */
export const createBootstrap = () => {
    let state: StartupState = 'loading';
    const listeners = new Set<Listener>();
    /** Publish a transition before notifying subscribers so concurrent readers see one consistent snapshot. */
    const publish = (next: StartupState) =>
        Effect.sync(
            /** Listener callbacks only announce that readers should obtain the new snapshot. */ () => {
                // Commit state first: React may read synchronously from inside a notification.
                state = next;
                for (const listener of listeners) listener();
            }
        );
    return {
        /** Return the stable primitive snapshot consumed by React's external-store protocol. */
        snapshot: (): StartupState => state,
        /** Subscribe to readiness transitions; React owns this synchronous listener registration and its removal. */
        subscribe: (listener: Listener): Listener => {
            listeners.add(listener);
            return /** Remove only this reader when React unsubscribes; bootstrap still owns the provider. */ () => {
                listeners.delete(listener);
            };
        },
        /** Register the shell synchronously before starting asynchronous flags; interrupt the returned fiber at root disposal. */
        start: <E>(register: Effect.Effect<void>, flags: Layer.Layer<Flags, E>) =>
            Effect.gen(
                /** Native hosts require a registered root before requesting their first render. */ function* () {
                    yield* register;
                    // Fork only after registration: network/provider readiness must never delay native root availability.
                    return yield* Effect.forkDaemon(
                        Effect.zipRight(publish('ready'), Effect.never).pipe(
                            Effect.provide(flags),
                            Effect.catchAllCause(
                                /** Keep a bounded failure state visible; do not expose provider causes or render partial product content. */ () =>
                                    Effect.zipRight(publish('failed'), Effect.never)
                            ),
                            Effect.ensuring(publish('loading'))
                        )
                    );
                }
            ),
    };
};

/** One application entry owns this store; importing the renderer does not acquire flag providers. */
export const startup = createBootstrap();
