/**
 * @file packages/contracts/src/catalogue.ts
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

import { type Cause, Context, Data, Effect, Schema } from 'effect';
import { SubjectId, TenantId } from './ids.ts';
import { JsonValue } from './storage.ts';

const strict = { parseOptions: { onExcessProperty: 'error' } } as const;
const name = Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(200));

/** Public model identity only; supplier SKUs, quantities, prices and serials must never enter this reference. */
export const ProductReference = Schema.Struct({
    id: Schema.UUID,
    manufacturer: name,
    model: name,
    variant: Schema.NullOr(name),
}).annotations(strict);
export type ProductReference = typeof ProductReference.Type;

/** Tenant-private mapped bulk row; serialized assets and kits require their own later import contracts. */
export const StockImportRow = Schema.Struct({
    supplierSku: name,
    manufacturer: name,
    model: name,
    variant: Schema.NullOr(name),
    quantity: Schema.Number.pipe(Schema.int(), Schema.between(0, Number.MAX_SAFE_INTEGER)),
}).annotations(strict);
export type StockImportRow = typeof StockImportRow.Type;

const timestamp = Schema.Int.pipe(Schema.between(0, Number.MAX_SAFE_INTEGER));

/** Reviewed rights for one private-stock source; an artifact reference is not itself proof of a licence or consent. */
export const StockImportEvidence = Schema.Struct({
    id: Schema.UUID,
    artifact: Schema.UUID,
    reviewer: SubjectId,
    basis: Schema.Literal('synthetic', 'supplier-permission', 'licence'),
    purpose: Schema.Literal('private-stock-import'),
    reviewedAt: timestamp,
    validUntil: timestamp,
    revoked: Schema.Boolean,
}).annotations(strict);
export type StockImportEvidence = typeof StockImportEvidence.Type;

/** Immutable source lookup result: the trusted loader must bind these exact CSV contents to the reviewed evidence. */
export const StockImportSource = Schema.Struct({
    id: Schema.UUID,
    tenant: TenantId,
    csv: Schema.String,
    evidence: StockImportEvidence,
}).annotations(strict);
export type StockImportSource = typeof StockImportSource.Type;

/** Bounded diagnostics never include private source contents, grant documents or schema parser context. */
interface StockImportFailureFields {
    readonly reason: 'invalid' | 'denied' | 'unavailable' | 'invalid-csv';
}
/** Preserve an exact public constructor without exposing vendor open generic error fields. */
const failureBase: new (fields: StockImportFailureFields) => Cause.YieldableError &
    StockImportFailureFields & {
        readonly _tag: 'StockImportFailure';
    } = Data.TaggedError('StockImportFailure');
/** An unsuccessful preparation never grants permission to write, publish or train on supplier data. */
export class StockImportFailure extends failureBase {}

/** Server-owned source authority; clients cannot submit a consent flag beside arbitrary CSV contents. */
export class StockImportSources extends Context.Tag('@eventiva/contracts/StockImportSources')<
    StockImportSources,
    {
        /** Reauthorize the trusted tenant and load current rights plus their exact source together, refusing inaccessible IDs. */
        readonly load: (tenant: TenantId, source: string) => Effect.Effect<StockImportSource, StockImportFailure>;
    }
>() {}

/** One-based input row position and bounded disposition; no row is persisted or silently fuzzy-matched. */
export type StockImportPreview =
    | { readonly row: number; readonly state: 'invalid' | 'duplicate-sku' | 'unmatched' | 'ambiguous' }
    | { readonly row: number; readonly state: 'matched'; readonly reference: string; readonly stock: StockImportRow };

/** Compare catalog identities case-insensitively, but never discard punctuation, variants or model revision suffixes. */
const key = (value: string): string => value.toLowerCase();

/**
 * Preview at most 1,000 mapped bulk-stock rows against at most 10,000 authorized public references.
 * Exact manufacturer/model/variant identity is required; duplicate supplier SKUs reject every colliding row.
 * Invalid rows remain in the preview for correction. Nothing mutates inventory or publishes private supplier data.
 */
export const previewStockImport = (rows: JsonValue, references: JsonValue) =>
    Effect.gen(
        /** Validate bounded containers before deriving row-local correction outcomes without writes. */ function* () {
            const input = yield* Schema.decodeUnknown(Schema.Array(JsonValue).pipe(Schema.maxItems(1000)))(rows);
            const catalogue = yield* Schema.decodeUnknown(Schema.Array(ProductReference).pipe(Schema.maxItems(10000)))(
                references
            );
            const decoded = input.map(
                /** Decode only the row value; Array.map's index is not a parser-options argument. */
                (row) => Schema.decodeUnknownEither(StockImportRow)(row)
            );
            const counts = new Map<string, number>();
            // Count the entire valid batch first: neither the first nor last duplicate may win by input order.
            for (const entry of decoded) {
                if (entry._tag === 'Right') {
                    const sku = key(entry.right.supplierSku);
                    counts.set(sku, (counts.get(sku) ?? 0) + 1);
                }
            }
            return decoded.map(
                /** Emit correction-only outcomes before considering a match; ambiguity never selects an arbitrary reference. */
                (entry, index): StockImportPreview => {
                    // Reject invalid or repeated supplier rows before matching; neither may inherit a catalogue reference.
                    const row = index + 1;
                    if (entry._tag === 'Left') return { row, state: 'invalid' };
                    const stock = entry.right;
                    if ((counts.get(key(stock.supplierSku)) ?? 0) > 1) return { row, state: 'duplicate-sku' };
                    const matches = catalogue.filter(
                        /** Keep variant-null distinct from an explicit revision even when manufacturer and model agree. */
                        (reference) =>
                            key(reference.manufacturer) === key(stock.manufacturer) &&
                            key(reference.model) === key(stock.model) &&
                            (reference.variant === null
                                ? stock.variant === null
                                : stock.variant !== null && key(reference.variant) === key(stock.variant))
                    );
                    const match = matches[0];
                    if (matches.length > 1) return { row, state: 'ambiguous' };
                    if (!match) return { row, state: 'unmatched' };
                    return { row, state: 'matched', reference: match.id, stock };
                }
            );
        }
    );
