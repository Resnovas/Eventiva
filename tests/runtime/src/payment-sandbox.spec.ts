/**
 * @file tests/runtime/src/payment-sandbox.spec.ts
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
import { InvoiceProvider, type InvoiceRevision } from '@eventiva/contracts/invoice';
import { fakeInvoiceProviderLayer, PaymentSandbox } from '@eventiva/runtime/payment-sandbox';
import { Effect } from 'effect';

/** Produce deterministic independent canonical fixture identities, not provider-issued identifiers. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const merchant = { connection: id(1), supplier: id(2) };
const invoice: InvoiceRevision = {
    invoice: id(3),
    revision: 1,
    supplier: id(2),
    customer: id(4),
    currency: 'GBP',
    lines: [{ description: 'Synthetic hire', quantity: 2, unitNetMinor: '3', taxMinor: '1' }],
    totalMinor: '7',
    commissionMinor: '2',
};
const issue = { operation: 'issue', connection: merchant.connection, key: id(5), method: 'card', invoice } as const;

it.effect(
    'simulates card and bank issue/payment/refund/read-back with cumulative exact commission',
    /** Exercise both simulated methods through the same neutral port; no real payment rail is contacted. */ () =>
        Effect.gen(
            /** Independent expected totals expose per-refund rounding and duplicate-confirmation mistakes. */ function* () {
                const provider = yield* InvoiceProvider;
                const sandbox = yield* PaymentSandbox;
                for (const [index, method] of (['card', 'bank-transfer'] as const).entries()) {
                    const draft = {
                        ...issue,
                        method,
                        key: id(10 + index),
                        invoice: { ...invoice, invoice: id(20 + index) },
                    };
                    const opened = yield* provider.execute(draft);
                    expect(opened).toMatchObject({
                        state: 'open',
                        totalMinor: '7',
                        commissionMinor: '2',
                        refundedMinor: '0',
                    });
                    expect((yield* sandbox.settle(opened.mapping)).state).toBe('paid');
                    const first = {
                        operation: 'refund',
                        mapping: opened.mapping,
                        key: id(30 + index),
                        amountMinor: '2',
                    } as const;
                    const partial = yield* provider.execute(first);
                    expect(partial).toMatchObject({
                        state: 'partially-refunded',
                        refundedMinor: '2',
                        refundedCommissionMinor: '0',
                    });
                    expect(yield* provider.execute(first)).toEqual(partial);
                    const second = yield* provider.execute({ ...first, key: id(40 + index), amountMinor: '2' });
                    expect(second.refundedCommissionMinor).toBe('1');
                    const final = yield* provider.execute({ ...first, key: id(50 + index), amountMinor: '3' });
                    expect(final).toMatchObject({
                        state: 'refunded',
                        refundedMinor: '7',
                        refundedCommissionMinor: '2',
                    });
                    expect(yield* sandbox.settle(opened.mapping)).toEqual(final);
                    expect(yield* provider.execute({ operation: 'read', mapping: opened.mapping })).toEqual(final);
                    expect(yield* provider.execute(draft)).toEqual(opened);
                }
            }
        ).pipe(Effect.provide(fakeInvoiceProviderLayer(merchant)))
);

it.effect(
    'binds idempotency to exact revision and merchant and rejects over-refund or unpaid refund',
    /** Neither cross-connection lookup nor an issue-key collision may select a different invoice snapshot. */ () =>
        Effect.gen(
            /** Exercise both valid controls and refusal paths through the public provider interface. */ function* () {
                const provider = yield* InvoiceProvider;
                const sandbox = yield* PaymentSandbox;
                const opened = yield* provider.execute(issue);
                const refund = { operation: 'refund', mapping: opened.mapping, key: id(7), amountMinor: '1' } as const;
                for (const command of [
                    refund,
                    { ...issue, invoice: { ...invoice, revision: 2 } },
                    { ...issue, key: id(8) },
                ])
                    expect((yield* Effect.flip(provider.execute(command))).reason).toBe('conflict');
                for (const mapping of [
                    { ...opened.mapping, connection: id(9) },
                    { ...opened.mapping, invoice: id(9) },
                    { ...opened.mapping, revision: 2 },
                    { ...opened.mapping, reference: 'forged' },
                ]) {
                    expect((yield* Effect.flip(provider.execute({ operation: 'read', mapping }))).reason).toBe(
                        'not-found'
                    );
                    expect((yield* Effect.flip(sandbox.settle(mapping))).reason).toBe('not-found');
                }
                expect((yield* Effect.flip(provider.execute({ ...issue, connection: id(9) }))).reason).toBe(
                    'not-found'
                );
                expect(
                    (yield* Effect.flip(
                        provider.execute({
                            ...issue,
                            key: id(9),
                            invoice: { ...invoice, invoice: id(9), supplier: id(9) },
                        })
                    )).reason
                ).toBe('unsupported');
                yield* sandbox.settle(opened.mapping);
                for (const amountMinor of ['0', '8'])
                    expect((yield* Effect.flip(provider.execute({ ...refund, amountMinor }))).reason).toBe('conflict');
                yield* provider.execute(refund);
                expect((yield* Effect.flip(provider.execute({ ...refund, amountMinor: '2' }))).reason).toBe('conflict');
                expect(
                    (yield* Effect.flip(
                        provider.execute({
                            ...refund,
                            key: id(90),
                            mapping: { ...opened.mapping, reference: 'forged' },
                        })
                    )).reason
                ).toBe('not-found');
            }
        ).pipe(Effect.provide(fakeInvoiceProviderLayer(merchant)))
);

it.effect(
    'keeps outage failures explicit and retained provider state detached from callers',
    /** A lost response or mutated read projection must never manufacture payment or change a retained amount. */ () =>
        Effect.gen(
            /** Recover by authoritative read-back rather than inferring success from the original command. */ function* () {
                const provider = yield* InvoiceProvider;
                const sandbox = yield* PaymentSandbox;
                const command = {
                    ...issue,
                    invoice: { ...invoice, lines: [{ ...invoice.lines[0]!, description: 'Original' }] },
                };
                const opened = yield* provider.execute(command);
                Object.assign(opened.mapping, { reference: 'rewritten' });
                Object.assign(opened, { totalMinor: '999' });
                Object.assign(command.invoice.lines[0]!, { description: 'Changed' });
                const mapping = {
                    connection: merchant.connection,
                    invoice: invoice.invoice,
                    revision: 1,
                    reference: `sandbox-${invoice.invoice}`,
                };
                expect((yield* provider.execute({ operation: 'read', mapping })).totalMinor).toBe('7');
                yield* sandbox.availability(false);
                expect((yield* Effect.flip(provider.execute({ operation: 'read', mapping }))).reason).toBe(
                    'unavailable'
                );
                expect((yield* Effect.flip(sandbox.settle(mapping))).reason).toBe('unavailable');
                yield* sandbox.availability(true);
                expect((yield* provider.execute({ operation: 'read', mapping })).state).toBe('open');
                expect(
                    (yield* Effect.flip(provider.execute({ ...issue, invoice: { ...invoice, totalMinor: '8' } })))
                        .reason
                ).toBe('invalid');
                const zero = {
                    ...invoice,
                    invoice: id(99),
                    lines: [{ description: 'Free', quantity: 1, unitNetMinor: '0', taxMinor: '0' }],
                    totalMinor: '0',
                    commissionMinor: '0',
                };
                expect((yield* Effect.flip(provider.execute({ ...issue, key: id(99), invoice: zero }))).reason).toBe(
                    'unsupported'
                );
            }
        ).pipe(Effect.provide(fakeInvoiceProviderLayer(merchant)))
);
