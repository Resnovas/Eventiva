/**
 * @file ai-docs/src/13_storage/02_hook_producer.ts
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

import { HookDenied, HookProducer, HookProducerDeny, type HookProducerTarget } from '@eventiva/contracts/hook';
import { hookProducer } from '@eventiva/integrations.sql/hook-producer';
import { Effect } from 'effect';

/**
 * Bind the producer journal to the tenant SQLite client after migration 0008.
 *
 * @since 0.0.0
 * @example
 * const commit = commitTransition(requestId, target, mutate).pipe(Effect.provide(journal));
 */
export const journal = hookProducer('sqlite', 'platform.primary');

/**
 * Invoke the mutation only for a fresh attempt. Reconcile a lost acknowledgement rather than repeating an external write.
 *
 * @param request - Stable request UUID retained across recovery.
 * @param target - Policy binding supplied by the trusted mutation owner.
 * @param commit - Mutation that uses the journal's attempt identifier as its idempotency key.
 * @returns An Effect yielding the mutation result only after the journal confirms the attempt.
 * @since 0.0.0
 * @example
 * const operation = commitTransition(requestId, policyTarget, writeOnce);
 */
export const commitTransition = <A, E, R>(
    request: string,
    target: HookProducerTarget,
    /** Perform the trusted mutation using the retained attempt UUID for idempotent reconciliation. */
    commit: (idempotencyKey: string) => Effect.Effect<A, E, R>
) =>
    Effect.gen(
        /** Persist intent before the mutation and publish confirmation only after its success. */ function* () {
            const producer = yield* HookProducer;
            const attempt = yield* producer.begin(request, target);
            if (!attempt.fresh) return yield* new HookDenied({ reason: 'unavailable' });
            const value = yield* commit(attempt.attempt.id);
            yield* producer.confirm(request);
            return value;
        }
    );

/**
 * Inspect the retained request without reinvoking the mutation. The example supplies a denying status authority.
 *
 * @param request - Original request UUID, including after a process restart.
 * @returns A reconciliation Effect that denies access rather than guessing whether the mutation committed.
 * @since 0.0.0
 * @example
 * const status = reconcile(originalRequestId);
 */
export const reconcile = (request: string) =>
    Effect.gen(
        /** Ask the configured status authority to resolve the retained request without repeating the mutation. */ function* () {
            const producer = yield* HookProducer;
            return yield* producer.reconcile(request);
        }
    ).pipe(Effect.provide(HookProducerDeny));
