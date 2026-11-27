/**
 * @file tests/contracts/src/inventory-product.spec.ts
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

import { expect, it } from '@effect/vitest';
import { Permission } from '@eventiva/contracts/action';
import { FlagDefinition } from '@eventiva/contracts/flags';
import {
    canonicalSku,
    CreateProduct,
    inventoryFlag,
    ListProducts,
    ProductFields,
    productActions,
    UpdateProduct,
} from '@eventiva/contracts/inventory-product';
import { Effect, Option, Schema } from 'effect';

const product = { name: 'Synthetic lead', sku: 'AV-1', category: 'cable', tracking: 'bulk', unit: 'each' };
const id = '019b0000-0000-7000-8000-000000000001';

it.effect(
    'keeps products distinct from stock, tenant authority and public-reference publication',
    /**
     * Reject unknown ownership, valuation and quantity fields instead of silently importing them into private metadata.
     *
     * @returns The Effect that runs these assertions.
     */
    () =>
        Effect.gen(
            /** Assert all tracking modes and independently reject malformed metadata and untrusted authority. */ function* () {
                // Case equivalence must not erase punctuation or turn private metadata into authority or stock.
                for (const tracking of ['serialised', 'bulk', 'consumable']) {
                    expect(yield* Schema.decodeUnknown(ProductFields)({ ...product, tracking })).toEqual({
                        ...product,
                        tracking,
                    });
                }
                for (const input of [
                    { ...product, quantity: 3 },
                    { ...product, price: 'private' },
                    { ...product, tenant: id },
                    { ...product, reference: id },
                    { ...product, sku: ' AV-1' },
                    { ...product, tracking: 'kit' },
                    { ...product, name: 'x'.repeat(201) },
                ])
                    expect((yield* Effect.either(Schema.decodeUnknown(ProductFields)(input)))._tag).toBe('Left');
                expect(
                    yield* Schema.decodeUnknown(ProductFields)({ ...product, name: 'x'.repeat(200) })
                ).toHaveProperty('name', 'x'.repeat(200));
                expect(
                    (yield* Effect.either(Schema.decodeUnknown(CreateProduct.input)({ id, product, tenant: id })))._tag
                ).toBe('Left');
                expect(
                    (yield* Effect.either(Schema.decodeUnknown(UpdateProduct.input)({ id, revision: 0, product })))._tag
                ).toBe('Left');
                expect(
                    yield* Schema.decodeUnknown(UpdateProduct.input)({ id, revision: 2147483646, product })
                ).toHaveProperty('revision', 2147483646);
                expect(
                    (yield* Effect.either(
                        Schema.decodeUnknown(UpdateProduct.input)({ id, revision: 2147483647, product })
                    ))._tag
                ).toBe('Left');
                for (const limit of [0, 101])
                    expect(
                        (yield* Effect.either(
                            Schema.decodeUnknown(ListProducts.input)({ limit, includeArchived: false })
                        ))._tag
                    ).toBe('Left');
                expect(
                    yield* Schema.decodeUnknown(ListProducts.input)({ limit: 100, includeArchived: false })
                ).toHaveProperty('limit', 100);
                expect(canonicalSku('AV-1')).toBe(canonicalSku('av-1'));
                expect(canonicalSku('AV-1')).not.toBe(canonicalSku('AV1'));
                expect(canonicalSku('AV 1')).not.toBe(canonicalSku('AV1'));
            }
        )
);

it.effect(
    'declares five private online-only actions with canonical permissions and one default-off gate',
    /**
     * A legacy issue label must not silently change the shared permission or flag grammar.
     *
     * @returns The Effect that runs these assertions.
     */
    () =>
        Effect.gen(
            /** Reconcile exact action names and verify discoverability metadata independently of a handler implementation. */ function* () {
                // Explicit expected names and permissions catch accidental additions as well as missing actions.
                expect(
                    productActions
                        .map(
                            /**
                             * Observe only the canonical inventory identity.
                             *
                             * @param action - One declared product action.
                             * @returns The action's canonical name.
                             */
                            (action) => action.name
                        )
                        .sort()
                ).toEqual([
                    'inventory.product.archive',
                    'inventory.product.create',
                    'inventory.product.get',
                    'inventory.product.list',
                    'inventory.product.update',
                ]);
                expect(yield* Schema.decodeUnknown(FlagDefinition)(inventoryFlag)).toMatchObject({
                    key: 'inventory.f6-inventory',
                    safeDefault: false,
                });
                for (const action of productActions) {
                    expect(action.offline).toBe('online-only');
                    expect(action.sensitive).toBe(true);
                    expect(Option.getOrNull(action.flag)).toBe(inventoryFlag.key);
                    expect(yield* Schema.decodeUnknown(Permission)(action.permission)).toBe(
                        action.sideEffect === 'read' ? 'inventory.catalogue.read' : 'inventory.catalogue.write'
                    );
                }
            }
        )
);
