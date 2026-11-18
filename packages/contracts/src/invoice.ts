/**
 * @file packages/contracts/src/invoice.ts
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

import { type Cause, Context, Data, type Effect, Schema } from 'effect';

const strict = { parseOptions: { onExcessProperty: 'error' } } as const;
const amount = Schema.String.pipe(Schema.pattern(/^(0|[1-9][0-9]{0,29})$/));
const text = Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(200));

/** A revision's tax-inclusive total uses exact minor-unit integers; tax calculation belongs to accounting. */
export const InvoiceRevision = Schema.Struct({
    invoice: Schema.UUID,
    revision: Schema.Int.pipe(Schema.between(1, Number.MAX_SAFE_INTEGER)),
    supplier: Schema.UUID,
    customer: Schema.UUID,
    currency: Schema.String.pipe(Schema.pattern(/^[A-Z]{3}$/)),
    lines: Schema.Array(
        Schema.Struct({
            description: text,
            quantity: Schema.Int.pipe(Schema.between(1, 1_000_000)),
            unitNetMinor: amount,
            taxMinor: amount,
        }).annotations(strict)
    ).pipe(Schema.minItems(1), Schema.maxItems(1000)),
    totalMinor: amount,
    commissionMinor: amount,
})
    .annotations(strict)
    .pipe(
        Schema.filter(
            /** Reject inconsistent snapshots rather than correcting a monetary amount behind the approver's back. */
            (value) =>
                value.totalMinor ===
                    value.lines
                        .reduce(
                            /** Tax is the complete line tax, not a per-unit rate; never round through a JavaScript number. */
                            (total, line) =>
                                total + BigInt(line.quantity) * BigInt(line.unitNetMinor) + BigInt(line.taxMinor),
                            0n
                        )
                        .toString() && BigInt(value.commissionMinor) <= BigInt(value.totalMinor)
        )
    );
export type InvoiceRevision = typeof InvoiceRevision.Type;

/** A provider reference maps back to a canonical invoice/revision; it never becomes the invoice's identity. */
export const InvoiceMapping = Schema.Struct({
    connection: Schema.UUID,
    invoice: Schema.UUID,
    revision: Schema.Int.pipe(Schema.between(1, Number.MAX_SAFE_INTEGER)),
    reference: text,
}).annotations(strict);
export type InvoiceMapping = typeof InvoiceMapping.Type;

/** Read-back projection; no credentials, customer contact fields or provider SDK objects cross this port. */
export interface ProviderInvoice {
    readonly mapping: InvoiceMapping;
    readonly state: 'open' | 'paid' | 'partially-refunded' | 'refunded';
    readonly totalMinor: string;
    readonly refundedMinor: string;
    readonly commissionMinor: string;
    readonly refundedCommissionMinor: string;
}

/** Bounded diagnostic only; provider responses and rejected financial inputs must not enter error telemetry. */
interface InvoiceProviderFailureFields {
    readonly reason: 'invalid' | 'unsupported' | 'unavailable' | 'not-found' | 'conflict';
}
/** Keep the exact public error constructor free of vendor open generics. */
const failureBase: new (fields: InvoiceProviderFailureFields) => Cause.YieldableError &
    InvoiceProviderFailureFields & {
        readonly _tag: 'InvoiceProviderFailure';
    } = Data.TaggedError('InvoiceProviderFailure');
/** A failed capability, state or availability check never implies that money moved. */
export class InvoiceProviderFailure extends failureBase {}

/** Canonical provider commands; fresh authorization, approval and online gating belong to the common action runtime. */
export const InvoiceCommand = Schema.Union(
    Schema.Struct({
        operation: Schema.Literal('issue'),
        connection: Schema.UUID,
        key: Schema.UUID,
        method: Schema.Literal('card', 'bank-transfer'),
        invoice: InvoiceRevision,
    }).annotations(strict),
    Schema.Struct({ operation: Schema.Literal('read'), mapping: InvoiceMapping }).annotations(strict),
    Schema.Struct({
        operation: Schema.Literal('refund'),
        mapping: InvoiceMapping,
        key: Schema.UUID,
        amountMinor: amount,
    }).annotations(strict)
);
export type InvoiceCommand = typeof InvoiceCommand.Type;

/** Provider-neutral invoice boundary; implementation must validate commands and preserve historical mappings. */
export class InvoiceProvider extends Context.Tag('@eventiva/contracts/InvoiceProvider')<
    InvoiceProvider,
    {
        /** Issue, read back or refund without accepting payment credentials; failures are bounded and explicit. */
        readonly execute: (command: InvoiceCommand) => Effect.Effect<ProviderInvoice, InvoiceProviderFailure>;
    }
>() {}
