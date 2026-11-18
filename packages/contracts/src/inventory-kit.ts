/**
 * @file packages/contracts/src/inventory-kit.ts
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

import { Schema } from 'effect';
import { define } from './action.ts';
import { inventoryFlag } from './inventory-product.ts';
import { UuidV7 } from './storage.ts';

const strict = { parseOptions: { onExcessProperty: 'error' } } as const;

/** Ordered composition metadata: counted units only, without substitution, rounding or implied stock. */
export const KitComponent = Schema.Struct({
    product: UuidV7,
    quantity: Schema.Int.pipe(Schema.between(1, 1000000)),
    optional: Schema.Boolean,
}).annotations(strict);
export type KitComponent = typeof KitComponent.Type;

/** Empty explicitly defines a leaf kit; omission is never an implicit empty replacement. */
export const KitComponents = Schema.Array(KitComponent).pipe(Schema.maxItems(100));

/** The product keeps its identity; this independent positive revision belongs only to its composition. */
export const Kit = Schema.Struct({
    id: UuidV7,
    revision: Schema.Int.pipe(Schema.between(1, 2147483647)),
    components: KitComponents,
}).annotations(strict);
export type Kit = typeof Kit.Type;

/** Fixed errors omit private conflicting rows, product metadata and storage diagnostics. */
export const KitFailure = Schema.Union(
    Schema.TaggedStruct('KitCycle', {}),
    Schema.TaggedStruct('DuplicateComponent', {}),
    Schema.TaggedStruct('KitNotFound', {}),
    Schema.TaggedStruct('ProductNotFound', {}),
    Schema.TaggedStruct('ProductArchived', {}),
    Schema.TaggedStruct('UnsupportedKitUnit', {}),
    Schema.TaggedStruct('RevisionConflict', {}),
    Schema.TaggedStruct('KitLimit', {}),
    Schema.TaggedStruct('KitUnavailable', {})
);
export type KitFailure = typeof KitFailure.Type;

const shared = {
    version: 1,
    sensitive: true,
    offline: 'online-only',
    flag: inventoryFlag.key,
    error: KitFailure,
} as const;

/** Replace the entire list at a composition revision; zero creates, positive revisions compare-and-set. */
export const DefineKit = define('inventory.kit.define', {
    ...shared,
    description: 'Replace an existing private product kit composition without changing stock.',
    permission: 'inventory.catalogue.write',
    sideEffect: 'write',
    input: Schema.Struct({
        id: UuidV7,
        revision: Schema.Int.pipe(Schema.between(0, 2147483646)),
        components: KitComponents,
    }).annotations(strict),
    output: Kit,
});

/** Read the recorded composition even after product archival; the result makes no fulfilment claim. */
export const GetKit = define('inventory.kit.get', {
    ...shared,
    description: 'Read a recorded tenant-private kit composition, not available stock.',
    permission: 'inventory.catalogue.read',
    sideEffect: 'read',
    input: Schema.Struct({ id: UuidV7 }).annotations(strict),
    output: Kit,
});
