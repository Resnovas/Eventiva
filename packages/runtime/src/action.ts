/**
 * @file packages/runtime/src/action.ts
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

import type { ActionSpec, Failure, Input, Output } from '@eventiva/contracts/action';
import type { Effect } from 'effect';

/**
 * Handlers for portable action specifications. A feature module's backend
 * package implements each specification once; the only way to run a handler
 * is `ActionHost.invoke`, so every surface shares the same path.
 */

/** A handler bound to the specification it implements. */
export interface Implementation<S extends ActionSpec = ActionSpec, R = never> {
    readonly _tag: 'Implementation';
    readonly spec: S;
    readonly handler: (input: Input<S>) => Effect.Effect<Output<S>, Failure<S>, R>;
}

/**
 * Implements a specification. A module provides the handler's services before
 * it registers the implementation, so registered handlers need nothing.
 */
export const implement = <S extends ActionSpec, R = never>(
    spec: S,
    handler: (input: Input<S>) => Effect.Effect<Output<S>, Failure<S>, R>
): Implementation<S, R> => ({ _tag: 'Implementation', spec, handler });
