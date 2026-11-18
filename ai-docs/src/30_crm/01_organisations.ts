/**
 * @file ai-docs/src/30_crm/01_organisations.ts
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
 * @title Invoke the bounded organisation lifecycle
 * Use an already composed authenticated host; UUID identity and revision remain stable across edits and archive state.
 */
import { Caller } from '@eventiva/contracts/caller';
import { ActionHost } from '@eventiva/runtime/host';
import { Effect } from 'effect';

/** Exercise all six public actions under the caller supplied by the authenticated route, without installing policy or activating a module. */
export const organisationLifecycle = Effect.gen(
    /** Demonstrate revisions one through four in a fresh sequential fixture; concurrent clients must reread conflicts. */ function* () {
        const host = yield* ActionHost;
        const caller = yield* Caller;
        const id = '019b0000-0000-7000-8000-000000000001';
        // Each intentional mutation has its own stable retry key; this demonstration must use a fresh fixture database.
        const created = yield* host.invoke(
            'crm.organisation.create',
            {
                id,
                displayName: 'Synthetic customer',
                legalName: 'Synthetic Customer Ltd',
            },
            { idempotencyKey: 'crm-example-create' }
        );
        const updated = yield* host.invoke(
            'crm.organisation.update',
            {
                id,
                expectedRevision: 1,
                displayName: 'Renamed customer',
                legalName: 'Synthetic Customer Ltd',
            },
            { idempotencyKey: 'crm-example-update' }
        );
        const archived = yield* host.invoke(
            'crm.organisation.archive',
            { id, expectedRevision: 2 },
            { idempotencyKey: 'crm-example-archive' }
        );
        const hidden = yield* Effect.either(host.invoke('crm.organisation.get', { id }));
        const visibleArchive = yield* host.invoke('crm.organisation.get', { id, includeArchived: true });
        const restored = yield* host.invoke(
            'crm.organisation.restore',
            { id, expectedRevision: 3 },
            { idempotencyKey: 'crm-example-restore' }
        );
        const page = yield* host.invoke('crm.organisation.list', { limit: 2 });
        // Return private results to the authorised caller only; do not annotate spans or logs with these values.
        return { created, updated, archived, hidden, visibleArchive, restored, page, tenant: caller.tenant };
    }
);
