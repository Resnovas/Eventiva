/**
 * @file packages/contracts/src/inventory-product.ts
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
import { UuidV7 } from './storage.ts';

const text = Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(200));
const revision = Schema.Int.pipe(Schema.between(1, 2147483646));
const strict = { parseOptions: { onExcessProperty: 'error' } } as const;

/** A private product describes a kind of equipment, never ownership, opening quantity or availability. */
export const ProductFields = Schema.Struct({
    name: text,
    sku: text,
    category: text,
    tracking: Schema.Literal('serialised', 'bulk', 'consumable'),
    unit: text,
}).annotations(strict);
export type ProductFields = typeof ProductFields.Type;

/** Product identity and revision are tenant-private and separate from public manufacturer/model reference identities. */
export const Product = Schema.Struct({
    id: UuidV7,
    revision: Schema.Int.pipe(Schema.between(1, 2147483647)),
    ...ProductFields.fields,
    archived: Schema.Boolean,
}).annotations(strict);
export type Product = typeof Product.Type;

/** Match import duplicate handling exactly: ignore case, retaining punctuation and internal spaces. */
export const canonicalSku = (sku: string): string => sku.toLowerCase();

/** Map the legacy issue label f6-inventory to a valid dotted key without changing the shared flag grammar. */
export const inventoryFlag = {
    key: 'inventory.f6-inventory',
    description: 'Tenant-private product catalogue; issue label f6-inventory. Keep off until separately enabled.',
    owner: 'inventory',
    safeDefault: false,
};

/** Fixed public failures never disclose a competing product, private SKU or database diagnostic. */
export const ProductFailure = Schema.Union(
    Schema.TaggedStruct('DuplicateSku', {}),
    Schema.TaggedStruct('ProductNotFound', {}),
    Schema.TaggedStruct('ProductArchived', {}),
    Schema.TaggedStruct('RevisionConflict', {}),
    Schema.TaggedStruct('ProductUnavailable', {})
);
export type ProductFailure = typeof ProductFailure.Type;

const shared = {
    version: 1,
    error: ProductFailure,
    offline: 'online-only',
    sensitive: true,
    flag: inventoryFlag.key,
} as const;

/** Create identity is client-generated UUIDv7; the action host owns mutation approval, authorization and durable replay. */
export const CreateProduct = define('inventory.product.create', {
    ...shared,
    description: 'Create a tenant-private product without adding stock.',
    permission: 'inventory.catalogue.write',
    sideEffect: 'write',
    input: Schema.Struct({ id: UuidV7, product: ProductFields }).annotations(strict),
    output: Product,
});

/** Replace editable product metadata only at the expected revision; archive and identity are not editable fields. */
export const UpdateProduct = define('inventory.product.update', {
    ...shared,
    description: 'Update tenant-private product metadata at the expected revision.',
    permission: 'inventory.catalogue.write',
    sideEffect: 'write',
    input: Schema.Struct({ id: UuidV7, revision, product: ProductFields }).annotations(strict),
    output: Product,
});

/** Archive preserves product identity and reserves its SKU; it never deletes stock or permits hidden SKU reuse. */
export const ArchiveProduct = define('inventory.product.archive', {
    ...shared,
    description: 'Archive a tenant-private product while retaining its identity and SKU.',
    permission: 'inventory.catalogue.write',
    sideEffect: 'write',
    input: Schema.Struct({ id: UuidV7, revision }).annotations(strict),
    output: Product,
});

/** Get may return an archived product for authorized historical inspection, but never looks across tenants. */
export const GetProduct = define('inventory.product.get', {
    ...shared,
    description: 'Get a tenant-private product, including its archive state.',
    permission: 'inventory.catalogue.read',
    sideEffect: 'read',
    input: Schema.Struct({ id: UuidV7 }).annotations(strict),
    output: Product,
});

/** Page through authorized products; archive filtering may yield an empty page with a continuation cursor. */
export const ListProducts = define('inventory.product.list', {
    ...shared,
    description: 'List tenant-private products by optional exact category and archive visibility.',
    permission: 'inventory.catalogue.read',
    sideEffect: 'read',
    input: Schema.Struct({
        category: Schema.optional(text),
        after: Schema.optional(UuidV7),
        limit: Schema.Int.pipe(Schema.between(1, 100)),
        includeArchived: Schema.Boolean,
    }).annotations(strict),
    output: Schema.Struct({ products: Schema.Array(Product), next: Schema.NullOr(UuidV7) }).annotations(strict),
});

/** One canonical specification list drives module registration and action-inventory parity. No kit or stock action is registered. */
export const productActions = [CreateProduct, UpdateProduct, ArchiveProduct, ListProducts, GetProduct] as const;
