/**
 * @file tests/contracts/src/inventory-kit.spec.ts
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
import { DefineKit, GetKit, Kit } from '@eventiva/contracts/inventory-kit';
import { validateDefinitions, validateInventory } from '@eventiva/contracts/inventory';
import { inventoryFlag } from '@eventiva/contracts/inventory-product';
import { Effect, Option, Schema } from 'effect';

const id = '019b0000-0000-7000-8000-000000000001';
const edge = { product: id, quantity: 7, optional: false };

it.effect(
    'kit contracts are strict counted composition, not ownership or stock',
    /** Use asymmetric positive values and both sides of every scalar/container boundary. */ () =>
        Effect.gen(
            /** Decode complete replacements and refuse coercion, defaulting and unknown authority fields. */ function* () {
                // Schema checks deliberately do not implement graph-dependent duplicate or cycle validation.
                for (const quantity of [1, 1000000])
                    expect(
                        yield* Schema.decodeUnknown(DefineKit.input)({
                            id,
                            revision: 0,
                            components: [{ ...edge, quantity }],
                        })
                    ).toMatchObject({ components: [{ quantity }] });
                for (const quantity of [0, -1, 1.5, 1000001, Number.MAX_SAFE_INTEGER + 1, '7'])
                    expect(
                        (yield* Effect.either(
                            Schema.decodeUnknown(DefineKit.input)({
                                id,
                                revision: 0,
                                components: [{ ...edge, quantity }],
                            })
                        ))._tag
                    ).toBe('Left');
                for (const components of [
                    [],
                    Array.from(
                        { length: 100 },
                        /** Boundary duplicates are legal structurally but rejected by the runtime graph contract. */ () =>
                            edge
                    ),
                ])
                    expect(
                        (yield* Schema.decodeUnknown(DefineKit.input)({ id, revision: 0, components })).components
                    ).toHaveLength(components.length);
                for (const input of [
                    { id, revision: -1, components: [] },
                    { id, revision: 2147483647, components: [] },
                    {
                        id,
                        revision: 0,
                        components: Array.from(
                            { length: 101 },
                            /** Exceed the container bound without changing individual component validity. */ () => edge
                        ),
                    },
                    { id, revision: 0, components: [{ product: id, quantity: 7 }] },
                    { id, revision: 0, components: [{ ...edge, optional: 0 }] },
                    { id, revision: 0, components: [{ ...edge, stock: 3 }] },
                    { id, revision: 0, components: [{ ...edge, product: 'foreign-sku' }] },
                    { id, revision: 0, components: [], tenant: id },
                ])
                    expect((yield* Effect.either(Schema.decodeUnknown(DefineKit.input)(input)))._tag).toBe('Left');
                expect(
                    yield* Schema.decodeUnknown(DefineKit.input)({ id, revision: 2147483646, components: [] })
                ).toHaveProperty('revision', 2147483646);
                expect(
                    (yield* Effect.either(Schema.decodeUnknown(Kit)({ id, revision: 0, components: [] })))._tag
                ).toBe('Left');
                expect(
                    yield* Schema.decodeUnknown(Kit)({ id, revision: 2147483647, components: [edge] })
                ).toHaveProperty('revision', 2147483647);
                expect((yield* Effect.either(Schema.decodeUnknown(GetKit.input)({ id, tenant: id })))._tag).toBe(
                    'Left'
                );
            }
        )
);

it.effect(
    'kit definitions retain canonical metadata and fail closed for unsupported discovery',
    /** Registration validity is distinct from the deliberately conservative cross-provider schema projection. */ () =>
        Effect.gen(
            /** Keep the public metadata exact without widening the shared compiler or asserting Google parity. */ function* () {
                // A successful runtime schema does not imply every provider can describe it faithfully.
                const actions = [DefineKit, GetKit];
                yield* validateDefinitions(actions);
                expect(
                    actions.map(
                        /** Compare exact portable names independently of runtime registration. */ (action) =>
                            action.name
                    )
                ).toEqual(['inventory.kit.define', 'inventory.kit.get']);
                expect(inventoryFlag.safeDefault).toBe(false);
                for (const action of actions) {
                    expect(action.offline).toBe('online-only');
                    expect(action.sensitive).toBe(true);
                    expect(Option.getOrNull(action.flag)).toBe('inventory.f6-inventory');
                    expect(action.permission).toBe(
                        action === GetKit ? 'inventory.catalogue.read' : 'inventory.catalogue.write'
                    );
                    expect((yield* Effect.flip(validateInventory([action])))._tag).toBe('UnsupportedSchema');
                }
            }
        )
);
