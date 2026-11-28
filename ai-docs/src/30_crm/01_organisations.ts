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
 * Use an already composed authenticated host; UUID identity and revision remain stable across edits and archive state.
 *
 * @title Invoke the bounded organisation lifecycle
 */
import { Caller } from '@eventiva/contracts/caller';
import { ActionHost } from '@eventiva/runtime/host';
import { Effect } from 'effect';

/**
 * Exercise the organisation lifecycle on a fresh tenant fixture. Each distinct mutation keeps its own retry key.
 *
 * @since 0.0.0
 * @example
 * const walkthrough = organisationLifecycle.pipe(Effect.provide(authenticatedFixture));
 */
export const organisationLifecycle = Effect.gen(
    /** Demonstrate revisions one through four in a fresh sequential fixture; concurrent clients must reread conflicts. */ function* () {
        const host = yield* ActionHost;
        const caller = yield* Caller;
        const id = '019b0000-0000-7000-8000-000000000001';
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
        return { created, updated, archived, hidden, visibleArchive, restored, page, tenant: caller.tenant };
    }
);

/**
 * Exercise work contacts on an active organisation using fresh IDs and keys. Keep the historical private results with the caller.
 *
 * @since 0.0.0
 * @example
 * const contacts = organisationWorkContacts.pipe(Effect.provide(authenticatedFixture));
 */
export const organisationWorkContacts = Effect.gen(
    /** Demonstrate exact canonical action names, expected revisions and explicit original-key recovery without logging contact values. */ function* () {
        const host = yield* ActionHost;
        const organisationId = '019b0000-0000-7000-8000-000000000001';
        const id = '019b0000-0000-7000-8000-000000000011';
        const input = { id, organisationId, kind: 'email', label: 'work', value: 'Sales.Team+demo@Example.test' };
        const added = yield* host.invoke('crm.contact-point.add', input, { idempotencyKey: 'crm-contact-add' });
        const recovered = yield* host.invoke('crm.contact-point.add', input, { idempotencyKey: 'crm-contact-add' });
        const updated = yield* host.invoke(
            'crm.contact-point.update',
            { id, organisationId, expectedRevision: 1, value: 'Sales.New@example.test' },
            { idempotencyKey: 'crm-contact-update' }
        );
        const primary = yield* host.invoke(
            'crm.contact-point.set-primary',
            { id, organisationId, expectedRevision: 2 },
            { idempotencyKey: 'crm-contact-primary' }
        );
        const current = yield* host.invoke('crm.contact-point.get', { id, organisationId });
        const page = yield* host.invoke('crm.contact-point.list', { organisationId, limit: 50 });
        const removed = yield* host.invoke(
            'crm.contact-point.remove',
            { id, organisationId, expectedRevision: 3 },
            { idempotencyKey: 'crm-contact-remove' }
        );
        return { added, recovered, updated, primary, current, page, removed };
    }
);
