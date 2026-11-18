/**
 * @file ai-docs/src/27_commerce/04_import.ts
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

import { ApplyImportRow, StageImport } from '@eventiva/contracts/catalogue';
import { ActionHost } from '@eventiva/runtime/host';
import { stockImportModule } from '@eventiva/runtime/catalogue-import';
import { Effect } from 'effect';

/**
 * Register after importResources/productResources migration on the same tenant provider and durable host.
 * Supply StockImportSources, Resources, InputDigest, Flags, Authorizer, IdentityResolver and CurrentTenant.
 * Keep inventory.import.enabled and inventory.f6-inventory default-off; no application installation occurs here.
 */
export const registerMetadataImport = Effect.gen(
    /** Capture the actual common host so nested product invocation joins its same-owner SQL savepoints. */ function* () {
        const host = yield* ActionHost;
        return yield* host.register(yield* stockImportModule);
    }
);

/**
 * Demonstrate an explicitly reviewed synthetic one-row source with stable plan/row/product UUIDv7 identities.
 * Call only after registration and trusted routing with a canonical Caller. Reconcile an ambiguous apply reply
 * with this exact input and row idempotency key; never generate replacement identities or apply quantity.
 */
export const reviewedMetadataExample = Effect.gen(
    /** A matched public model supplies provenance only; all product fields absent from CSV are explicitly reviewed here. */ function* () {
        // This example assumes the trusted synthetic source has exactly one matching data row, not arbitrary caller CSV.
        const host = yield* ActionHost;
        const plan = '019b0000-0000-7000-8000-000000000100';
        const row = '019b0000-0000-7000-8000-000000000101';
        yield* host.invoke(
            StageImport.name,
            {
                id: plan,
                source: '019b0000-0000-7000-8000-000000000002',
                references: [
                    {
                        id: '019b0000-0000-7000-8000-000000000009',
                        manufacturer: 'Fixture Audio',
                        model: 'A-10',
                        variant: null,
                    },
                ],
                reviews: [
                    {
                        row: 1,
                        id: row,
                        product: '019b0000-0000-7000-8000-000000000103',
                        name: 'Reviewed lead',
                        category: 'cables',
                        tracking: 'bulk',
                        unit: 'each',
                    },
                ],
                acknowledgement: 'metadata-only-no-stock',
            },
            { idempotencyKey: plan }
        );
        return yield* host.invoke(
            ApplyImportRow.name,
            {
                id: plan,
                revision: 1,
                row,
                rowRevision: 1,
                acknowledgement: 'metadata-only-no-stock',
            },
            { idempotencyKey: row }
        );
    }
);
