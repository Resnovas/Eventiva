/**
 * @file packages/runtime/src/payment-sandbox.ts
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
    InvoiceCommand,
    type InvoiceMapping,
    InvoiceProvider,
    InvoiceProviderFailure,
    type ProviderInvoice,
} from '@eventiva/contracts/invoice';
import { Context, Effect, Layer, Schema } from 'effect';

/** Test controls are deliberately separate from the neutral port and must never be registered as business actions. */
export class PaymentSandbox extends Context.Tag('@eventiva/runtime/PaymentSandbox')<
    PaymentSandbox,
    {
        /** Simulate provider-confirmed payment, without a card, credential, network request or real money. */
        readonly settle: (mapping: InvoiceMapping) => Effect.Effect<ProviderInvoice, InvoiceProviderFailure>;
        /** Inject an outage into issue/read/refund/settle; recovery preserves previously observed state. */
        readonly availability: (available: boolean) => Effect.Effect<void>;
    }
>() {}

/**
 * Create one isolated, volatile fake merchant connection. Both card and bank-transfer are simulations only.
 * Issue/refund keys are connection-scoped; changed-input replay refuses and successful replay returns its original result.
 * No persistence, webhook signature proof, accounting event or application registration is provided.
 */
export const fakeInvoiceProviderLayer = (merchant: { readonly connection: string; readonly supplier: string }) =>
    Layer.effectContext(
        Effect.sync(
            /** Own private records and idempotency snapshots for this Layer acquisition only. */
            () => {
                // Each acquired fake isolates merchant records and replay results; no state survives a new layer acquisition.
                const connection = merchant.connection;
                const supplier = merchant.supplier;
                const records = new Map<
                    string,
                    {
                        readonly invoice: Extract<InvoiceCommand, { operation: 'issue' }>['invoice'];
                        readonly value: ProviderInvoice;
                    }
                >();
                const commands = new Map<string, { readonly input: string; readonly result: ProviderInvoice }>();
                let available = true;
                /** Return detached scalar state so callers cannot rewrite retained mapping or refund totals. */
                const copy = (value: ProviderInvoice): ProviderInvoice => ({ ...value, mapping: { ...value.mapping } });
                /** Inspect only this merchant's exact historical mapping, refusing stale revisions and forged references. */
                const lookup = (mapping: InvoiceMapping) => {
                    const record = records.get(mapping.invoice);
                    return mapping.connection === connection &&
                        record?.value.mapping.revision === mapping.revision &&
                        record.value.mapping.reference === mapping.reference
                        ? record
                        : undefined;
                };
                /** Simulate one validated command atomically; no Effect suspension occurs between checking and publishing state. */
                const apply = (command: InvoiceCommand): Effect.Effect<ProviderInvoice, InvoiceProviderFailure> =>
                    Effect.suspend(
                        /** Keep read-back, replay and transition checks in the same synchronous critical section. */
                        () => {
                            if (!available) return Effect.fail(new InvoiceProviderFailure({ reason: 'unavailable' }));
                            const scopedConnection =
                                command.operation === 'issue' ? command.connection : command.mapping.connection;
                            if (scopedConnection !== connection)
                                return Effect.fail(new InvoiceProviderFailure({ reason: 'not-found' }));
                            if (command.operation === 'read') {
                                const record = lookup(command.mapping);
                                return record
                                    ? Effect.succeed(copy(record.value))
                                    : Effect.fail(new InvoiceProviderFailure({ reason: 'not-found' }));
                            }
                            // Decoding canonicalizes property order before fingerprinting; keys bind the operation and complete payload.
                            const input = JSON.stringify(command);
                            const previous = commands.get(command.key);
                            if (previous)
                                return previous.input === input
                                    ? Effect.succeed(copy(previous.result))
                                    : Effect.fail(new InvoiceProviderFailure({ reason: 'conflict' }));
                            let value: ProviderInvoice;
                            if (command.operation === 'issue') {
                                if (command.invoice.supplier !== supplier)
                                    return Effect.fail(new InvoiceProviderFailure({ reason: 'unsupported' }));
                                if (records.has(command.invoice.invoice))
                                    return Effect.fail(new InvoiceProviderFailure({ reason: 'conflict' }));
                                if (command.invoice.totalMinor === '0')
                                    return Effect.fail(new InvoiceProviderFailure({ reason: 'unsupported' }));
                                value = {
                                    mapping: {
                                        connection,
                                        invoice: command.invoice.invoice,
                                        revision: command.invoice.revision,
                                        reference: `sandbox-${command.invoice.invoice}`,
                                    },
                                    state: 'open',
                                    totalMinor: command.invoice.totalMinor,
                                    refundedMinor: '0',
                                    commissionMinor: command.invoice.commissionMinor,
                                    refundedCommissionMinor: '0',
                                };
                                records.set(command.invoice.invoice, { invoice: command.invoice, value });
                            } else {
                                const record = lookup(command.mapping);
                                if (!record) return Effect.fail(new InvoiceProviderFailure({ reason: 'not-found' }));
                                const refunded = BigInt(record.value.refundedMinor) + BigInt(command.amountMinor);
                                const total = BigInt(record.value.totalMinor);
                                if (
                                    (record.value.state !== 'paid' && record.value.state !== 'partially-refunded') ||
                                    command.amountMinor === '0' ||
                                    refunded > total
                                )
                                    return Effect.fail(new InvoiceProviderFailure({ reason: 'conflict' }));
                                // Cumulative integer allocation makes split refunds converge; the final refund returns the exact full fee.
                                value = {
                                    ...record.value,
                                    state: refunded === total ? 'refunded' : 'partially-refunded',
                                    refundedMinor: refunded.toString(),
                                    refundedCommissionMinor: (
                                        (BigInt(record.value.commissionMinor) * refunded) /
                                        total
                                    ).toString(),
                                };
                                records.set(command.mapping.invoice, { ...record, value });
                            }
                            commands.set(command.key, { input, result: value });
                            return Effect.succeed(copy(value));
                        }
                    );
                return Context.make(InvoiceProvider, {
                    /** Decode a detached snapshot and sanitize schema failures before touching private provider state. */
                    execute: (command) =>
                        Schema.decodeUnknown(InvoiceCommand)(command).pipe(
                            Effect.mapError(
                                /** Never expose submitted invoice contents through parser diagnostics. */ () =>
                                    new InvoiceProviderFailure({ reason: 'invalid' })
                            ),
                            Effect.flatMap(apply)
                        ),
                }).pipe(
                    Context.add(PaymentSandbox, {
                        /** Repeated confirmations converge and cannot reverse an already refunded payment. */
                        settle: (mapping) =>
                            Effect.suspend(
                                /** A fake confirmation changes only one exact stored mapping, never the issue snapshot. */
                                () => {
                                    // Only open invoices advance to paid; repeated confirmation must preserve refunded state.
                                    if (!available)
                                        return Effect.fail(new InvoiceProviderFailure({ reason: 'unavailable' }));
                                    const record = lookup(mapping);
                                    if (!record)
                                        return Effect.fail(new InvoiceProviderFailure({ reason: 'not-found' }));
                                    const value: ProviderInvoice =
                                        record.value.state === 'open'
                                            ? { ...record.value, state: 'paid' }
                                            : record.value;
                                    records.set(mapping.invoice, { ...record, value });
                                    return Effect.succeed(copy(value));
                                }
                            ),
                        /** Change only the isolated fixture's availability; this is not a runtime rollout toggle. */
                        availability: (value) =>
                            Effect.sync(
                                /** Preserve retained records and replay results across a simulated outage. */ () => {
                                    available = value;
                                }
                            ),
                    })
                );
            }
        )
    );
