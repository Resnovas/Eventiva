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
import { Effect, Option, Schema } from 'effect';
import {
    ApplyImportRow,
    importActions,
    previewStockImport,
    StageImport,
    stockImportFlag,
    type ProductReference,
    type StockImportRow,
} from '@eventiva/contracts/catalogue';

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

it.effect(
    'requires complete reviewed metadata and stable identities without accepting writable SKU or quantities',
    /** These are public transport contracts, not defaults inferred from a matched model or supplier quantity. */ () =>
        Effect.gen(
            /** Reject each absent mapping independently, plus legacy direct-CSV intake and untrusted extra metadata. */ function* () {
                // Asymmetric IDs and row position distinguish an explicit mapping from order-based identity guessing.
                const plan = '019b0000-0000-7000-8000-000000000001';
                const row = '019b0000-0000-7000-8000-000000000002';
                const product = '019b0000-0000-7000-8000-000000000003';
                const review = {
                    row: 2,
                    id: row,
                    product,
                    name: 'Reviewed spare',
                    category: 'leads',
                    tracking: 'bulk',
                    unit: 'each',
                };
                const input = {
                    id: plan,
                    source: reference.id,
                    references: [reference],
                    reviews: [review],
                    acknowledgement: 'metadata-only-no-stock',
                };
                expect(yield* Schema.decodeUnknown(StageImport.input)(input)).toEqual(input);
                for (const field of ['name', 'category', 'tracking', 'unit', 'id', 'product', 'row']) {
                    const incomplete: Record<string, unknown> = { ...review };
                    delete incomplete[field];
                    expect(
                        (yield* Effect.either(
                            Schema.decodeUnknown(StageImport.input)({ ...input, reviews: [incomplete] })
                        ))._tag
                    ).toBe('Left');
                }
                for (const changed of [
                    { ...input, reviews: [{ ...review, sku: 'OVERRIDE' }] },
                    { ...input, reviews: [{ ...review, quantity: 9 }] },
                    { ...input, csv: 'private', consent: true },
                    { ...input, acknowledgement: 'yes' },
                    { ...input, reviews: [] },
                    { ...input, reviews: [{ ...review, row: 1001 }] },
                    { ...input, reviews: [{ ...review, name: 'x'.repeat(201) }] },
                ])
                    expect((yield* Effect.either(Schema.decodeUnknown(StageImport.input)(changed)))._tag).toBe('Left');
                expect(
                    (yield* Effect.either(
                        Schema.decodeUnknown(ApplyImportRow.input)({
                            id: plan,
                            revision: 0,
                            row,
                            rowRevision: 1,
                            acknowledgement: 'metadata-only-no-stock',
                        })
                    ))._tag
                ).toBe('Left');
                expect(stockImportFlag.safeDefault).toBe(false);
                expect(
                    importActions.map(/** Compare the exact portable action identity set. */ (action) => action.name)
                ).toEqual([
                    'inventory.import.stage',
                    'inventory.import.get',
                    'inventory.import.cancel',
                    'inventory.import.apply-row',
                ]);
                for (const action of importActions) {
                    expect(action.sensitive).toBe(true);
                    expect(action.offline).toBe('online-only');
                    expect(action.flag).toEqual(Option.some('inventory.import.enabled'));
                }
            }
        )
);

it.effect(
    'preserves an independent mixed-outcome oracle across bounded permutations and perturbations',
    /** Row and reference order may change positions, but must never choose winners or detach private stock. */ () =>
        Effect.gen(
            /** Exercise fixed synthetic outcomes without reimplementing matching, SKU counting or schema validation. */ function* () {
                /** A handwritten disposition is independent of the implementation's keys and matching algorithm. */
                type Fixture = {
                    readonly input: StockImportRow;
                    readonly result:
                        | { readonly state: 'matched'; readonly reference: string }
                        | { readonly state: 'invalid' | 'duplicate-sku' | 'unmatched' | 'ambiguous' };
                };
                const second = { ...reference, id: '22222222-2222-4222-8222-222222222222', model: 'B 20' };
                const variant = { ...second, id: '33333333-3333-4333-8333-333333333333', variant: 'mk2' };
                const ambiguous = { ...reference, id: '44444444-4444-4444-8444-444444444444', model: 'C-30' };
                const references = [
                    reference,
                    second,
                    variant,
                    ambiguous,
                    { ...ambiguous, id: '55555555-5555-4555-8555-555555555555' },
                ].map(
                    /** Freeze flat public identities so mutation cannot hide behind a later retry. */ (entry) =>
                        Object.freeze({ ...entry })
                );
                // Expected dispositions are reviewed fixture facts, not derived from reference lookup or SKU normalization.
                const fixtures: readonly Fixture[] = [
                    {
                        input: { ...stock, supplierSku: 'Unique-zero', quantity: 0 },
                        result: { state: 'matched', reference: reference.id },
                    },
                    {
                        input: { ...stock, supplierSku: 'Null-variant', model: 'b 20', quantity: 17 },
                        result: { state: 'matched', reference: second.id },
                    },
                    {
                        input: {
                            ...stock,
                            supplierSku: 'Explicit-variant',
                            model: 'B 20',
                            variant: 'MK2',
                            quantity: 31,
                        },
                        result: { state: 'matched', reference: variant.id },
                    },
                    {
                        input: { ...stock, supplierSku: 'Punctuation', model: 'A10', quantity: 11 },
                        result: { state: 'unmatched' },
                    },
                    {
                        input: { ...stock, supplierSku: 'Internal-space', model: 'B  20', quantity: 23 },
                        result: { state: 'unmatched' },
                    },
                    {
                        input: { ...stock, supplierSku: 'Ambiguous', model: 'c-30', quantity: 29 },
                        result: { state: 'ambiguous' },
                    },
                    { input: { ...stock, supplierSku: 'Duplicate', quantity: 2 }, result: { state: 'duplicate-sku' } },
                    { input: { ...stock, supplierSku: 'duplicate', quantity: 7 }, result: { state: 'duplicate-sku' } },
                    { input: { ...stock, supplierSku: 'DUPLICATE', quantity: 43 }, result: { state: 'duplicate-sku' } },
                    { input: { ...stock, supplierSku: 'UNIQUE-ZERO', quantity: -9 }, result: { state: 'invalid' } },
                ];
                /** Rotate in both directions to move every fixture through every position without factorial growth. */
                const orders = <A>(values: readonly A[]): readonly (readonly A[])[] =>
                    values.flatMap(
                        /** Reverse each rotation to expose different neighbors and first/last candidates. */ (
                            _,
                            offset
                        ) => {
                            // Fresh arrays keep reversal from changing the fixture order used by subsequent rotations.
                            const rotated = [...values.slice(offset), ...values.slice(0, offset)];
                            return [rotated, rotated.toReversed()];
                        }
                    );
                /** Attach only the current input position and exact private stock to the literal fixture verdict. */
                const oracle = (rows: readonly Fixture[]) =>
                    rows.map(
                        /** Nonmatches deliberately have no reference, stock or private quantity fields. */ (
                            entry,
                            index
                        ) =>
                            entry.result.state === 'matched'
                                ? { row: index + 1, ...entry.result, stock: entry.input }
                                : { row: index + 1, ...entry.result }
                    );
                /** Check full public results twice and reject mutation of either frozen input domain. */
                const check = (rows: readonly Fixture[], publicRows: readonly ProductReference[], label: string) =>
                    Effect.gen(
                        /** Preserve a pre-call snapshot so deterministic retries cannot conceal input mutation. */ function* () {
                            const inputs = Object.freeze(
                                rows.map(
                                    /** Each row is flat, so freezing its fields covers all writable input. */ (
                                        entry
                                    ) => Object.freeze({ ...entry.input })
                                )
                            );
                            const catalogue = Object.freeze([...publicRows]);
                            const before = JSON.stringify({ inputs, catalogue });
                            const expected = oracle(rows);
                            // Complete object equality catches detached quantities and private diagnostic fields before testing retries.
                            expect(yield* previewStockImport(inputs, catalogue), label).toEqual(expected);
                            expect(yield* previewStockImport(inputs, catalogue), `${label}: repeat`).toEqual(expected);
                            expect(JSON.stringify({ inputs, catalogue }), `${label}: unchanged`).toBe(before);
                        }
                    );
                const rowOrders = orders(fixtures);
                const referenceOrders = orders(references);
                expect(rowOrders.length * referenceOrders.length).toBe(200);
                for (const [rowIndex, rows] of rowOrders.entries())
                    for (const [referenceIndex, publicRows] of referenceOrders.entries())
                        yield* check(rows, publicRows, `rows=${rowIndex}, references=${referenceIndex}`);

                // Extensions and removals change only explicitly named fixture outcomes, never a rematched expected result.
                yield* check(
                    fixtures,
                    [
                        ...references,
                        Object.freeze({
                            ...reference,
                            id: '66666666-6666-4666-8666-666666666666',
                            manufacturer: 'Unrelated Fixture',
                        }),
                    ],
                    'unrelated public identity'
                );
                yield* check(
                    [
                        {
                            input: { ...stock, supplierSku: 'Unrelated-invalid', quantity: 1.25 },
                            result: { state: 'invalid' },
                        },
                        ...fixtures.toReversed(),
                    ],
                    references,
                    'unrelated invalid row shifts positions only'
                );
                yield* check(
                    fixtures.map(
                        /** Increase private quantities without changing any matching identity or verdict. */ (
                            entry
                        ) =>
                            entry.result.state === 'matched'
                                ? { ...entry, input: { ...entry.input, quantity: entry.input.quantity + 97 } }
                                : entry
                    ),
                    references,
                    'asymmetric private quantities'
                );
                yield* check(
                    fixtures.map(
                        /** Only the zero-stock fixture becomes ambiguous when its second public candidate appears. */ (
                            entry,
                            index
                        ): Fixture => (index === 0 ? { input: entry.input, result: { state: 'ambiguous' } } : entry)
                    ),
                    [...references, Object.freeze({ ...reference, id: '77777777-7777-4777-8777-777777777777' })],
                    'second candidate cannot select by order'
                );
                yield* check(
                    fixtures.map(
                        /** Removing the null-variant identity must not let the explicit variant substitute for it. */ (
                            entry,
                            index
                        ): Fixture => (index === 1 ? { input: entry.input, result: { state: 'unmatched' } } : entry)
                    ),
                    references.filter(
                        /** Remove exactly the handwritten null-variant control, not an identity inferred by the matcher. */ (
                            entry
                        ) => entry.id !== second.id
                    ),
                    'null and explicit variant remain distinct'
                );
            }
        )
);
