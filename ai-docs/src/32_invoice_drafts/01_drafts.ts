/**
 * @file ai-docs/src/32_invoice_drafts/01_drafts.ts
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

import {
    invoiceDraft,
    invoiceUpdate,
    invoiceGet,
    invoiceList,
    type InvoiceRevision,
} from '@eventiva/contracts/invoice';
import { ActionHost } from '@eventiva/runtime/host';
import { invoiceDraftModule, invoiceDraftResources } from '@eventiva/runtime/invoice-draft';
import { Effect } from 'effect';

/** Unactivated example: trusted composition supplies migrated Organisation/Resources and matching durable tenant host services. */
export const example = Effect.gen(
    /** Return deferred operations, never prepare invoices, register services or enable flags merely by importing documentation. */ function* () {
        // These synthetic references must already exist as accessible active Organisation Parties before use.
        const snapshot: InvoiceRevision = {
            invoice: '019b0000-0000-7000-8000-000000000010',
            revision: 1,
            supplier: '019b0000-0000-7000-8000-000000000001',
            customer: '019b0000-0000-7000-8000-000000000002',
            currency: 'GBP',
            lines: [
                { description: 'Synthetic equipment', quantity: 3, unitNetMinor: '9007199254740993', taxMinor: '7' },
                { description: 'Synthetic service', quantity: 2, unitNetMinor: '11', taxMinor: '5' },
            ],
            totalMinor: '27021597764223013',
            commissionMinor: '9007199254740994',
        };
        const resource = yield* invoiceDraftResources;
        const register = Effect.gen(
            /** Defer until a trusted host and the exact tenant Resources/Storage owner have been composed. */ function* () {
                // Neither this resource declaration nor a module registration grants accounting or reference access.
                const host = yield* ActionHost;
                yield* host.register(yield* invoiceDraftModule);
            }
        );
        const use = Effect.gen(
            /** Full explicit replacement is preparation only; no provider, issue number or payment result exists. */ function* () {
                // Reuse original key/input only to reconcile this first write, never to submit the changed revision.
                const host = yield* ActionHost;
                const original = yield* host.invoke(
                    invoiceDraft.name,
                    { snapshot },
                    { idempotencyKey: 'synthetic-draft-v1' }
                );
                const revised = yield* host.invoke(
                    invoiceUpdate.name,
                    { expectedRevision: 1, snapshot: { ...snapshot, revision: 2, commissionMinor: '9' } },
                    { idempotencyKey: 'synthetic-draft-v2' }
                );
                const current = yield* host.invoke(invoiceGet.name, { id: snapshot.invoice });
                const page = yield* host.invoke(invoiceList.name, { limit: 25 });
                return { original, revised, current, page };
            }
        );
        return { resource, register, use };
    }
);
