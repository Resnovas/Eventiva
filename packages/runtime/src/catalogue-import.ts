/**
 * @file packages/runtime/src/catalogue-import.ts
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
    previewStockImport,
    ProductReference,
    type StockImportEvidence,
    StockImportFailure,
    type StockImportPreview,
    StockImportSource,
    StockImportSources,
} from '@eventiva/contracts/catalogue';
import { CurrentTenant, type JsonValue } from '@eventiva/contracts/storage';
import { Clock, Effect, Schema } from 'effect';

/** Private review projection only; readiness is neither a durable import token nor authorization for later writes. */
export interface StockImportPreparation {
    readonly source: string;
    readonly evidence: StockImportEvidence;
    readonly state: 'reviewable' | 'corrections-required';
    readonly rows: ReadonlyArray<StockImportPreview>;
}

const header = ['supplierSku', 'manufacturer', 'model', 'variant', 'quantity'];

/** Decode the bounded canonical template, preserving quoted commas, escaped quotes and embedded newlines without evaluation. */
const parseCsv = (
    input: string
): Effect.Effect<ReadonlyArray<readonly [string, string, string, string, string]>, StockImportFailure> =>
    Effect.suspend(
        /** Parse one complete source or refuse it; never guess column alignment after malformed quoting. */ () => {
            if (input.length > 1_000_000) return Effect.fail(new StockImportFailure({ reason: 'invalid-csv' }));
            const csv = input.startsWith('\uFEFF') ? input.slice(1) : input;
            const rows: Array<Array<string>> = [];
            let fields: Array<string> = [];
            let field = '';
            let quoted = false;
            let closed = false;
            // Delimiters are structural only outside quotes; fields remain literal private data, never spreadsheet formulas.
            for (let index = 0; index < csv.length; index++) {
                const character = csv.charAt(index);
                if (quoted) {
                    if (character === '"') {
                        if (csv[index + 1] === '"') {
                            field += '"';
                            index++;
                        } else {
                            quoted = false;
                            closed = true;
                        }
                    } else field += character;
                } else if (character === ',' || character === '\n' || character === '\r') {
                    fields.push(field);
                    field = '';
                    closed = false;
                    if (character !== ',') {
                        if (character === '\r') {
                            if (csv[index + 1] !== '\n')
                                return Effect.fail(new StockImportFailure({ reason: 'invalid-csv' }));
                            index++;
                        }
                        rows.push(fields);
                        fields = [];
                        if (rows.length > 1001) return Effect.fail(new StockImportFailure({ reason: 'invalid-csv' }));
                    }
                } else if (character === '"' && field === '' && !closed) quoted = true;
                else {
                    if (character === '"' || closed)
                        return Effect.fail(new StockImportFailure({ reason: 'invalid-csv' }));
                    field += character;
                }
            }
            if (quoted) return Effect.fail(new StockImportFailure({ reason: 'invalid-csv' }));
            if (fields.length > 0 || field !== '' || closed) rows.push([...fields, field]);
            if (
                rows.length < 2 ||
                rows.length > 1001 ||
                rows[0]?.length !== header.length ||
                !header.every(
                    /** Header spelling and order are explicit; an unknown supplier export requires mapping, not a guess. */
                    (column, index) => rows[0]?.[index] === column
                )
            )
                return Effect.fail(new StockImportFailure({ reason: 'invalid-csv' }));
            // Validate fixed field counts into tuples rather than asserting array indexes are present downstream.
            return Schema.decodeUnknown(
                Schema.Array(Schema.Tuple(Schema.String, Schema.String, Schema.String, Schema.String, Schema.String))
            )(rows.slice(1), { onExcessProperty: 'error' }).pipe(
                Effect.mapError(
                    /** Ragged records are whole-file failures; private cell values never leave in parser diagnostics. */ () =>
                        new StockImportFailure({ reason: 'invalid-csv' })
                )
            );
        }
    );

/**
 * Prepare a private bulk-stock CSV for review using router-owned CurrentTenant and a trusted source authority.
 * Rights must be current, unrevoked and reviewed within 30 days. No source, evidence or tenant is accepted beside caller CSV.
 * This performs no stock write; a later commit must reauthorize/reload current rights and use the existing Resources path.
 */
export const prepareStockImport = (
    sourceId: string,
    references: JsonValue
): Effect.Effect<StockImportPreparation, StockImportFailure, CurrentTenant | StockImportSources> =>
    Effect.gen(
        /** Snapshot public inputs before the authority lookup can suspend, then validate its tenant-bound source response. */ function* () {
            const id = yield* Schema.decodeUnknown(Schema.UUID)(sourceId).pipe(
                Effect.mapError(
                    /** Discard parser context; public error channels must never echo submitted values. */ () =>
                        new StockImportFailure({ reason: 'invalid' })
                )
            );
            const catalogue = yield* Schema.decodeUnknown(Schema.Array(ProductReference).pipe(Schema.maxItems(10000)))(
                references
            ).pipe(
                Effect.mapError(
                    /** Even a mistaken private field in the reference container must not leak in diagnostics. */ () =>
                        new StockImportFailure({ reason: 'invalid' })
                )
            );
            const tenant = (yield* CurrentTenant).id;
            const authority = yield* StockImportSources;
            const loaded = yield* authority.load(tenant, id);
            const source = yield* Schema.decodeUnknown(StockImportSource)(loaded).pipe(
                Effect.mapError(
                    /** The source service is privileged, but its malformed output still fails closed without a raw dump. */ () =>
                        new StockImportFailure({ reason: 'invalid' })
                )
            );
            const now = yield* Clock.currentTimeMillis;
            const evidence = source.evidence;
            // A past preview is not lasting consent. Unknown, stale, revoked or misrouted authority cannot disclose row outcomes.
            if (
                source.id !== id ||
                source.tenant !== tenant ||
                evidence.revoked ||
                evidence.reviewedAt > now ||
                evidence.validUntil <= now ||
                now - evidence.reviewedAt >= 30 * 86_400_000
            )
                return yield* Effect.fail(new StockImportFailure({ reason: 'denied' }));
            const records = yield* parseCsv(source.csv);
            const rows = yield* previewStockImport(
                records.map(
                    /** Blank variant means no variant; strict integer text rejects exponent, decimal and leading-zero coercion. */
                    (record) => ({
                        supplierSku: record[0],
                        manufacturer: record[1],
                        model: record[2],
                        variant: record[3] === '' ? null : record[3],
                        quantity: /^(0|[1-9][0-9]*)$/.test(record[4]) ? Number(record[4]) : -1,
                    })
                ),
                catalogue
            ).pipe(
                Effect.mapError(
                    /** Container/ref failures are bounded here; invalid individual rows retain the existing correction states. */ () =>
                        new StockImportFailure({ reason: 'invalid' })
                )
            );
            return {
                source: id,
                evidence,
                state: rows.every(
                    /** Only an exact match for every row may proceed to human review, never directly to an inventory write. */
                    (row) => row.state === 'matched'
                )
                    ? 'reviewable'
                    : 'corrections-required',
                rows,
            };
        }
    );
