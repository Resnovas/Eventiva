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

/** Supply authenticated CurrentTenant and SqlClient after migration 0008; build once per restart. */
export const journal = hookProducer('sqlite', 'platform.primary');

/** Only the trusted mutation owner supplies this callback and its authoritative policy binding.
 * The callback must use the retained request UUID for idempotency/status reconciliation.
 * An error leaves the attempt unresolved: failure is not proof of no external effect.
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
            // An existing attempt may already have changed external state; retry status, never the callback.
            if (!attempt.fresh) return yield* new HookDenied({ reason: 'unavailable' });
            const value = yield* commit(attempt.attempt.id);
            yield* producer.confirm(request);
            return value;
        }
    );

/** Inspect/reconcile instead of reinvoking after a crash or lost confirmation acknowledgement.
 * This example is deliberately denied until a core status authority is supplied.
 */
export const reconcile = (request: string) =>
    Effect.gen(
        /** Ask the configured status authority to resolve the retained request without repeating the mutation. */ function* () {
            const producer = yield* HookProducer;
            return yield* producer.reconcile(request);
        }
    ).pipe(Effect.provide(HookProducerDeny));
