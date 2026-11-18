/**
 * @file tests/contracts/src/catalogue.spec.ts
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
import { Effect } from 'effect';
import { previewStockImport } from '@eventiva/contracts/catalogue';

const reference = {
    id: '11111111-1111-4111-8111-111111111111',
    manufacturer: 'Fixture Audio',
    model: 'A-10',
    variant: null,
};
const stock = { manufacturer: 'fixture audio', model: 'a-10', variant: null, supplierSku: 'S-01', quantity: 3 };

it.effect(
    'preserves model punctuation and variants while matching case and zero stock',
    /** Prevent optimistic fuzzy matching from conflating different physical models. */ () =>
        Effect.gen(
            /** Compare exact, punctuation-different, variant and manufacturer-different stock rows. */ function* () {
                // Vary model punctuation and variant separately so case normalization cannot accidentally become fuzzy matching.
                const rows = [
                    { ...stock, quantity: 0 },
                    { ...stock, supplierSku: 'S-02', model: 'A10' },
                    { ...stock, supplierSku: 'S-03', variant: 'mk2' },
                    { ...stock, supplierSku: 'S-04', manufacturer: 'Other Audio' },
                ];
                expect(yield* previewStockImport(rows, [reference])).toEqual([
                    { row: 1, state: 'matched', reference: reference.id, stock: rows[0] },
                    { row: 2, state: 'unmatched' },
                    { row: 3, state: 'unmatched' },
                    { row: 4, state: 'unmatched' },
                ]);
                expect(
                    yield* previewStockImport([{ ...stock, variant: 'MK2' }], [{ ...reference, variant: 'mk2' }])
                ).toEqual([{ row: 1, state: 'matched', reference: reference.id, stock: { ...stock, variant: 'MK2' } }]);
                expect(yield* previewStockImport([stock], [{ ...reference, variant: 'mk2' }])).toEqual([
                    { row: 1, state: 'unmatched' },
                ]);
            }
        )
);

it.effect(
    'rejects every colliding SKU and never chooses an ambiguous public reference',
    /** Input order must not choose a duplicate stock winner or a technical model. */ () =>
        Effect.gen(
            /** Keep invalid rows in place and ensure valid neighboring rows remain independently previewable. */ function* () {
                // Both colliding rows lose, while the independent SKU still matches; input order must not select a winner.
                expect(
                    yield* previewStockImport(
                        [stock, { ...stock, supplierSku: 's-01' }, { ...stock, supplierSku: 'S-02' }],
                        [reference]
                    )
                ).toEqual([
                    { row: 1, state: 'duplicate-sku' },
                    { row: 2, state: 'duplicate-sku' },
                    { row: 3, state: 'matched', reference: reference.id, stock: { ...stock, supplierSku: 'S-02' } },
                ]);
                expect(
                    yield* previewStockImport(
                        [stock],
                        [reference, { ...reference, id: '22222222-2222-4222-8222-222222222222' }]
                    )
                ).toEqual([{ row: 1, state: 'ambiguous' }]);
                expect(yield* previewStockImport([], [])).toEqual([]);
            }
        )
);

it.effect(
    'reports invalid rows without echoing rejected private values',
    /** Unknown columns, unsafe quantities and incomplete identities cannot reach staged stock. */ () =>
        Effect.gen(
            /** Validate each row separately without losing its original one-based position. */ function* () {
                // Retain a valid final control so rejecting the entire batch cannot masquerade as safe row-level validation.
                const rows = [
                    null,
                    { ...stock, quantity: -1 },
                    { ...stock, quantity: 1.5 },
                    { ...stock, quantity: Number.MAX_SAFE_INTEGER + 1 },
                    { ...stock, supplierSku: '   ' },
                    { ...stock, price: 'private' },
                    stock,
                ];
                expect(yield* previewStockImport(rows, [reference])).toEqual([
                    { row: 1, state: 'invalid' },
                    { row: 2, state: 'invalid' },
                    { row: 3, state: 'invalid' },
                    { row: 4, state: 'invalid' },
                    { row: 5, state: 'invalid' },
                    { row: 6, state: 'invalid' },
                    { row: 7, state: 'matched', reference: reference.id, stock },
                ]);
            }
        )
);

it.effect(
    'bounds whole previews and rejects private fields in public references',
    /** Caller-supplied catalogue rows are not permission to mix tenant stock with public model identity. */ () =>
        Effect.gen(
            /** Check both sides of batch limits and preserve the original inputs across deterministic retries. */ function* () {
                // Exact limits must pass before overflow/private-field failures; retries must not mutate either input domain.
                expect((yield* previewStockImport(Array(1000).fill(stock), [reference])).length).toBe(1000);
                expect(yield* previewStockImport([], Array(10000).fill(reference))).toEqual([]);
                for (const [rows, references] of [
                    [Array(1001).fill(stock), []],
                    [[], Array(10001).fill(reference)],
                    [[stock], [{ ...reference, quantity: 1 }]],
                    ['csv-text-is-not-mapped-input', []],
                ] as const)
                    expect((yield* Effect.either(previewStockImport(rows, references)))._tag).toBe('Left');
                const before = JSON.stringify({ stock, reference });
                expect(yield* previewStockImport([stock], [reference])).toEqual(
                    yield* previewStockImport([stock], [reference])
                );
                expect(JSON.stringify({ stock, reference })).toBe(before);
            }
        )
);
