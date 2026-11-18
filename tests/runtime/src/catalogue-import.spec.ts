/**
 * @file tests/runtime/src/catalogue-import.spec.ts
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
import { StockImportFailure, type StockImportSource, StockImportSources } from '@eventiva/contracts/catalogue';
import { SubjectId, TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant, type JsonValue } from '@eventiva/contracts/storage';
import { prepareStockImport } from '@eventiva/runtime/catalogue-import';
import { Effect, TestClock } from 'effect';

/** Stable synthetic identities make source/evidence/tenant swaps distinguishable without customer data. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const tenant = TenantId.make(id(1));
const day = 86_400_000;
const header = 'supplierSku,manufacturer,model,variant,quantity';
const csv = `${header}\nS-1,Fixture Audio,A-10,,3`;
const reference = { id: id(9), manufacturer: 'Fixture Audio', model: 'A-10', variant: null };
const source: StockImportSource = {
    id: id(2),
    tenant,
    csv,
    evidence: {
        id: id(3),
        artifact: id(4),
        reviewer: SubjectId.make(id(5)),
        basis: 'synthetic',
        purpose: 'private-stock-import',
        reviewedAt: 0,
        validUntil: 60 * day,
        revoked: false,
    },
};

/** Compose the real preparation with a private synthetic source authority, not a request-supplied permission boolean. */
const prepare = (value: StockImportSource = source, references: JsonValue = [reference], sourceId = source.id) =>
    prepareStockImport(sourceId, references).pipe(
        Effect.provideService(CurrentTenant, { id: tenant }),
        Effect.provideService(StockImportSources, {
            /** Model inaccessible source IDs as denied; source identity is checked independently by the runtime. */
            load: (requestedTenant, requestedSource) =>
                requestedTenant === tenant && requestedSource === sourceId
                    ? Effect.succeed(value)
                    : Effect.fail(new StockImportFailure({ reason: 'denied' })),
        })
    );

it.effect(
    'prepares literal quoted CSV and repeats without mutating source or disclosing the raw file',
    /** Commas, quotes, BOM, CRLF and embedded newlines must preserve exact technical identity. */ () =>
        Effect.gen(
            /** Check independently specified output, including a zero quantity and an explicit variant. */ function* () {
                const loaded = {
                    ...source,
                    csv: `\uFEFF${header}\r\n"S,1","Fixture ""Audio""","A\n10",mk2,0\r\n`,
                };
                const references = [{ ...reference, manufacturer: 'Fixture "Audio"', model: 'A\n10', variant: 'mk2' }];
                const before = JSON.stringify(loaded);
                const result = yield* prepare(loaded, references);
                expect(result).toEqual({
                    source: source.id,
                    evidence: source.evidence,
                    state: 'reviewable',
                    rows: [
                        {
                            row: 1,
                            state: 'matched',
                            reference: reference.id,
                            stock: {
                                supplierSku: 'S,1',
                                manufacturer: 'Fixture "Audio"',
                                model: 'A\n10',
                                variant: 'mk2',
                                quantity: 0,
                            },
                        },
                    ],
                });
                Object.assign(result.evidence, { revoked: true });
                expect((yield* prepare(loaded, references)).evidence.revoked).toBe(false);
                expect(JSON.stringify(loaded)).toBe(before);
                expect(yield* prepare()).toEqual(yield* prepare());
            }
        )
);

it.effect(
    'keeps correction positions and refuses numeric coercion and duplicate stock winners',
    /** A preparation is not reviewable unless every row has exactly one model match and a valid unique SKU. */ () =>
        Effect.gen(
            /** Bad quantities must not shift following records or be silently rounded into an accepted stock quantity. */ function* () {
                const result = yield* prepare({
                    ...source,
                    csv: `${header}\nS-1,Fixture Audio,A-10,,3\nS-2,Fixture Audio,A10,,1\nS-3,Fixture Audio,A-10,,01\nS-4,Fixture Audio,A-10,,1e3\nS-5,Fixture Audio,A-10,,9007199254740992\nS-6,Fixture Audio,A-10,,1.0\nS-7,Fixture Audio,A-10,,-1\nS-8,Fixture Audio,A-10,,`,
                });
                expect(result.state).toBe('corrections-required');
                expect(
                    result.rows.map(
                        /** Observe dispositions without conflating accepted private stock with invalid rejected fields. */
                        ({ row, state }) => ({ row, state })
                    )
                ).toEqual([
                    { row: 1, state: 'matched' },
                    { row: 2, state: 'unmatched' },
                    { row: 3, state: 'invalid' },
                    { row: 4, state: 'invalid' },
                    { row: 5, state: 'invalid' },
                    { row: 6, state: 'invalid' },
                    { row: 7, state: 'invalid' },
                    { row: 8, state: 'invalid' },
                ]);
                expect((yield* prepare({ ...source, csv: `${csv}\ns-1,Fixture Audio,A-10,,4` })).rows).toEqual([
                    { row: 1, state: 'duplicate-sku' },
                    { row: 2, state: 'duplicate-sku' },
                ]);
                expect((yield* prepare(source, [reference, { ...reference, id: id(10) }])).rows).toEqual([
                    { row: 1, state: 'ambiguous' },
                ]);
            }
        )
);

it.effect(
    'denies swapped tenant/source, revoked evidence and future reviews before exposing private row outcomes',
    /** A malicious or stale authority result must not grant cross-tenant access or turn a caller flag into permission. */ () =>
        Effect.gen(
            /** Retain a valid control and exercise each independent binding and time invariant. */ function* () {
                expect((yield* prepare()).state).toBe('reviewable');
                for (const value of [
                    { ...source, id: id(99) },
                    { ...source, tenant: TenantId.make(id(99)) },
                    { ...source, evidence: { ...source.evidence, revoked: true } },
                    { ...source, evidence: { ...source.evidence, reviewedAt: 1 } },
                    { ...source, evidence: { ...source.evidence, validUntil: 0 } },
                ]) {
                    const error = yield* Effect.flip(prepare(value));
                    expect(error.reason).toBe('denied');
                    expect(JSON.stringify(error)).not.toContain('Fixture Audio');
                }
                const revocable = { ...source, evidence: { ...source.evidence } };
                expect((yield* prepare(revocable)).state).toBe('reviewable');
                Object.assign(revocable.evidence, { revoked: true });
                expect((yield* Effect.flip(prepare(revocable))).reason).toBe('denied');
                const malformed = { ...source, privateNote: 'private-authority-diagnostic' };
                const malformedError = yield* Effect.flip(prepare(malformed));
                expect(malformedError.reason).toBe('invalid');
                expect(JSON.stringify(malformedError)).not.toContain('private-authority-diagnostic');
                const denied = yield* Effect.flip(
                    prepareStockImport(source.id, [reference]).pipe(
                        Effect.provideService(CurrentTenant, { id: tenant }),
                        Effect.provideService(StockImportSources, {
                            /** A missing current grant is an explicit refusal, never an empty successful import. */
                            load: () => Effect.fail(new StockImportFailure({ reason: 'unavailable' })),
                        })
                    )
                );
                expect(denied.reason).toBe('unavailable');
            }
        )
);

it.effect(
    'rechecks exact expiry and maximum review age on every preparation with the Effect clock',
    /** An earlier review projection is not a reusable consent or import token. */ () =>
        Effect.gen(
            /** Both exclusive boundaries must refuse even when the source's nominal expiry is still later. */ function* () {
                const expiring = { ...source, evidence: { ...source.evidence, validUntil: 10 } };
                yield* TestClock.setTime(9);
                expect((yield* prepare(expiring)).state).toBe('reviewable');
                yield* TestClock.setTime(10);
                expect((yield* Effect.flip(prepare(expiring))).reason).toBe('denied');
                yield* TestClock.setTime(30 * day - 1);
                expect((yield* prepare()).state).toBe('reviewable');
                yield* TestClock.setTime(30 * day);
                expect((yield* Effect.flip(prepare())).reason).toBe('denied');
            }
        )
);

it.effect(
    'refuses malformed or oversized CSV without guessing headers, repairing quoting or echoing private contents',
    /** Whole-file structural errors cannot silently skip rows or change field alignment. */ () =>
        Effect.gen(
            /** Cover both terminal-record forms and both sides of the 1000-row bound, not just input rejection. */ function* () {
                const row = 'S-1,Fixture Audio,A-10,,3';
                expect(
                    (yield* prepare({ ...source, csv: `${header}\n${Array(1000).fill(row).join('\n')}` })).rows.length
                ).toBe(1000);
                const suffix = ',Fixture Audio,A-10,,3';
                const atLimit = `${header}\n${'S'.repeat(1_000_000 - header.length - 1 - suffix.length)}${suffix}`;
                expect((yield* prepare({ ...source, csv: atLimit })).rows).toEqual([{ row: 1, state: 'invalid' }]);
                for (const body of [
                    '',
                    header,
                    `${header}\n`,
                    `${header}\n\n`,
                    `sku,manufacturer,model,variant,quantity\n${row}`,
                    `${header},extra\n${row},private`,
                    `${header}\n${row},private`,
                    `${header}\nS-1,Fixture Audio,A-10,3`,
                    `${header}\n"private,Fixture Audio,A-10,,3`,
                    `${header}\nS"private,Fixture Audio,A-10,,3`,
                    `${header}\n"private"x,Fixture Audio,A-10,,3`,
                    `${header}\r${row}`,
                    `${header}\n${Array(1001).fill(row).join('\n')}`,
                    `${header}\n${Array(1001).fill(row).join('\n')}\n`,
                    `${atLimit}\n`,
                    'private'.repeat(142858),
                ]) {
                    const error = yield* Effect.flip(prepare({ ...source, csv: body }));
                    expect(error.reason).toBe('invalid-csv');
                    expect(JSON.stringify(error)).not.toContain('private');
                }
                expect((yield* Effect.flip(prepare(source, [{ ...reference, price: 'private' }]))).reason).toBe(
                    'invalid'
                );
                expect((yield* Effect.flip(prepare(source, [reference], 'private-invalid-id'))).reason).toBe('invalid');
            }
        )
);
