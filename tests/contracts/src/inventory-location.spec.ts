/**
 * @file tests/contracts/src/inventory-location.spec.ts
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

import { describe, expect, it } from '@effect/vitest';
import { Effect, Either, Schema } from 'effect';
import {
    locationActions,
    locationCreate,
    locationUpdate,
    locationList,
    locationResources,
} from '@eventiva/contracts/inventory-location';
import { inventoryFlag } from '@eventiva/contracts/inventory-product';
import { validateDefinitions, validateInventory } from '@eventiva/contracts/inventory';

const id = '019b0000-0000-7000-8000-000000000001';
describe('physical location contracts', /** Preserve strict local codecs independently of incomplete provider discovery. */ () => {
    it.effect(
        'declares only four sensitive online metadata actions and two resources',
        /**
         * Importing metadata grants no host or resource authority.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Verify canonical permissions and discovery refusal rather than weakening schemas to obtain provider parity. */ function* () {
                    // Definitions are registrable even while optional discovery rejects unsupported composed bounds.
                    yield* validateDefinitions(locationActions);
                    expect(
                        locationActions.map(
                            /**
                             * Compare public names, not helper identities.
                             *
                             * @param spec - One declared location action.
                             * @returns The action's public name.
                             */
                            (spec) => spec.name
                        )
                    ).toEqual([
                        'inventory.location.create',
                        'inventory.location.update',
                        'inventory.location.get',
                        'inventory.location.list',
                    ]);
                    expect(inventoryFlag.safeDefault).toBe(false);
                    for (const spec of locationActions) {
                        expect(spec.sensitive).toBe(true);
                        expect(spec.offline).toBe('online-only');
                        expect(spec.flag).toMatchObject({ _tag: 'Some', value: 'inventory.f6-inventory' });
                        expect(spec.permission).toBe(
                            spec.sideEffect === 'read' ? 'inventory.location.read' : 'inventory.location.write'
                        );
                    }
                    const definitions = yield* locationResources;
                    expect([definitions.locations.id, definitions.guard.id]).toEqual([
                        'inventory.location',
                        'inventory.location-guard',
                    ]);
                    expect(definitions.locations.fields.parent).toEqual({ type: 'text', optional: false });
                    expect(yield* Effect.either(validateInventory(locationActions))).toMatchObject({
                        left: { _tag: 'UnsupportedSchema' },
                    });
                }
            )
    );
    it('distinguishes omission/null and rejects authority, taxonomy and stock injection', /** Boundary inputs expose silent stripping, trimming, kind mutation and nullable sentinel mistakes. */ () => {
        // Public null is legal but an internal empty-string root or explicit undefined must never pass the boundary.
        const input = { id, name: 'Synthetic', kind: 'warehouse' };
        for (const parent of [{}, { parent: null }, { parent: id }])
            expect(Either.isRight(Schema.decodeUnknownEither(locationCreate.input)({ ...input, ...parent }))).toBe(
                true
            );
        for (const invalid of [
            { parent: '' },
            { parent: undefined },
            { parent: 'corrupt' },
            { kind: 'vehicle' },
            { name: '' },
            { name: ' padded ' },
            { name: 'x'.repeat(201) },
            { tenant: id },
            { quantity: 0 },
            { archived: false },
            { id: '00000000-0000-4000-8000-000000000001' },
        ])
            expect(Either.isLeft(Schema.decodeUnknownEither(locationCreate.input)({ ...input, ...invalid }))).toBe(
                true
            );
        const update = { id, expectedRevision: 1 };
        for (const invalid of [
            { kind: 'bin' },
            { parent: undefined },
            { expectedRevision: 0 },
            { expectedRevision: 2147483647 },
        ])
            expect(Either.isLeft(Schema.decodeUnknownEither(locationUpdate.input)({ ...update, ...invalid }))).toBe(
                true
            );
        for (const valid of [{}, { parent: null }, { parent: id }, { name: 'Renamed' }])
            expect(Either.isRight(Schema.decodeUnknownEither(locationUpdate.input)({ ...update, ...valid }))).toBe(
                true
            );
        for (const limit of [0, 101, 1.5])
            expect(Either.isLeft(Schema.decodeUnknownEither(locationList.input)({ limit }))).toBe(true);
        for (const limit of [1, 100])
            expect(Either.isRight(Schema.decodeUnknownEither(locationList.input)({ limit }))).toBe(true);
        expect(Either.isRight(Schema.decodeUnknownEither(locationList.input)({}))).toBe(true);
    });
});
