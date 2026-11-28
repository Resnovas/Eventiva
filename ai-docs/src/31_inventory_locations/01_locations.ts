/**
 * @file ai-docs/src/31_inventory_locations/01_locations.ts
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

/**
 * Exercise location metadata under a routed caller; a location record says nothing about on-hand stock.
 *
 * @title Invoke metadata without asserting stock
 */
import { ActionHost } from '@eventiva/runtime/host';
import { Effect } from 'effect';

/**
 * Run on a fresh synthetic authenticated host; stable keys represent each intentional mutation, not automatic retries.
 *
 * @since 0.0.0
 * @example
 * const walkthrough = locationLifecycle.pipe(Effect.provide(authenticatedFixture));
 */
export const locationLifecycle = Effect.gen(
    /** Preserve root/null semantics and immutable kinds while demonstrating revisioned explicit detachment. */ function* () {
        const host = yield* ActionHost;
        const warehouse = '019b0000-0000-7000-8000-000000000001';
        const bin = '019b0000-0000-7000-8000-000000000002';
        yield* host.invoke(
            'inventory.location.create',
            {
                id: warehouse,
                kind: 'warehouse',
                name: 'Synthetic warehouse',
            },
            { idempotencyKey: 'location-example-warehouse' }
        );
        yield* host.invoke(
            'inventory.location.create',
            {
                id: bin,
                kind: 'bin',
                name: 'Synthetic bin',
                parent: warehouse,
            },
            { idempotencyKey: 'location-example-bin' }
        );
        const detached = yield* host.invoke(
            'inventory.location.update',
            {
                id: bin,
                expectedRevision: 1,
                name: 'Detached bin',
                parent: null,
            },
            { idempotencyKey: 'location-example-detach' }
        );
        const current = yield* host.invoke('inventory.location.get', { id: bin });
        const roots = yield* host.invoke('inventory.location.list', { parent: null, limit: 25 });
        return { detached, current, roots };
    }
);
