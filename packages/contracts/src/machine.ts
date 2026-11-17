/**
 * @file packages/contracts/src/machine.ts
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

import { Effect } from 'effect';
import { Conflict } from './storage.ts';

/** Literal state names and edges remain typed; persistence performs CAS under the same transaction. */
export const define = <const M extends Readonly<Record<string, ReadonlyArray<string>>>>(
    edges: M & { readonly [K in keyof M]: ReadonlyArray<keyof M & string> }
) => edges;
/** Validate a declared edge without mutating state; storage must still enforce the transition atomically. */
export const transition = <const M extends Readonly<Record<string, ReadonlyArray<string>>>>(
    machine: M,
    id: string,
    from: NoInfer<keyof M & string>,
    to: NoInfer<keyof M & string>
) =>
    machine[from]?.includes(to) ? Effect.succeed(to) : Effect.fail(new Conflict({ id, reason: 'illegal-transition' }));
