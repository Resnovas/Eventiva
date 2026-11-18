/**
 * @file tests/contracts/src/invoice-draft.spec.ts
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
import {
    InvoiceRevision,
    invoiceDraft,
    invoiceUpdate,
    invoiceList,
    invoiceDraftActions,
    invoiceDraftFlag,
} from '@eventiva/contracts/invoice';
import { validateDefinitions } from '@eventiva/contracts/inventory';
import { Effect, Option, Schema } from 'effect';

const snapshot = {
    invoice: '019b0000-0000-7000-8000-000000000001',
    revision: 1,
    supplier: '019b0000-0000-7000-8000-000000000002',
    customer: '019b0000-0000-7000-8000-000000000003',
    currency: 'GBP',
    lines: [
        { description: 'Synthetic large line', quantity: 3, unitNetMinor: '9007199254740993', taxMinor: '7' },
        { description: 'Asymmetric second line', quantity: 2, unitNetMinor: '11', taxMinor: '5' },
    ],
    totalMinor: '27021597764223013',
    commissionMinor: '9007199254740994',
};

it.effect(
    'draft specifications reuse exact canonical snapshots and strict financial fields',
    /** Independently calculated decimal strings distinguish exact arithmetic from Number rounding or per-unit tax. */ () =>
        Effect.gen(
            /** Refuse financial corrections, coercions and state injection at the public contract boundary. */ function* () {
                // Expected total: 3*9007199254740993 + 7 + 2*11 + 5 = 27021597764223013.
                expect(yield* Schema.decodeUnknown(invoiceDraft.input)({ snapshot })).toEqual({ snapshot });
                for (const patch of [
                    { totalMinor: '27021597764223012' },
                    { commissionMinor: '27021597764223014' },
                    // Deliberately reproduce a caller's rounded Number conversion; canonical amounts must remain decimal strings.
                    { totalMinor: Number('27021597764223013') },
                    { totalMinor: '01' },
                    { totalMinor: '-1' },
                    { totalMinor: '1.0' },
                    { totalMinor: '1e3' },
                    { revision: 0 },
                    { state: 'issued' },
                    { number: 'INV-1' },
                    { payment: 'paid' },
                    { currency: 'gbp' },
                ])
                    expect(
                        (yield* Effect.either(
                            Schema.decodeUnknown(invoiceDraft.input)({ snapshot: { ...snapshot, ...patch } })
                        ))._tag
                    ).toBe('Left');
                expect(
                    (yield* Effect.either(Schema.decodeUnknown(invoiceUpdate.input)({ snapshot, expectedRevision: 0 })))
                        ._tag
                ).toBe('Left');
                expect(
                    (yield* Effect.either(
                        Schema.decodeUnknown(invoiceDraft.input)({ snapshot, tenant: snapshot.invoice })
                    ))._tag
                ).toBe('Left');
                for (const limit of [1, 100])
                    expect(yield* Schema.decodeUnknown(invoiceList.input)({ limit })).toEqual({ limit });
                for (const limit of [0, 101, 1.5])
                    expect((yield* Effect.either(Schema.decodeUnknown(invoiceList.input)({ limit })))._tag).toBe(
                        'Left'
                    );
                // The durable pilot's UUIDv7 limit must not narrow the pre-existing provider wire schema.
                expect(
                    yield* Schema.decodeUnknown(InvoiceRevision)({
                        ...snapshot,
                        invoice: '00000000-0000-4000-8000-000000000001',
                    })
                ).toHaveProperty('revision', 1);
            }
        )
);

it.effect(
    'draft actions are default-off sensitive online-only preparation, not provider execution',
    /** Check exact public inventory names and permission mapping without claiming full provider-schema parity. */ () =>
        Effect.gen(
            /** Validate definitions independently from runtime registration and preserve the safe rollout default. */ function* () {
                // Dotted permissions map issue colon labels; none of these actions issues a statutory invoice.
                yield* validateDefinitions(invoiceDraftActions);
                expect(
                    invoiceDraftActions.map(/** Preserve the canonical declaration order for callers. */ (a) => a.name)
                ).toEqual([
                    'accounting.invoice.draft',
                    'accounting.invoice.update',
                    'accounting.invoice.get',
                    'accounting.invoice.list',
                ]);
                expect(invoiceDraftFlag.safeDefault).toBe(false);
                for (const action of invoiceDraftActions) {
                    expect(action.sensitive).toBe(true);
                    expect(action.offline).toBe('online-only');
                    expect(action.approval).toBe('none');
                    expect(Option.getOrNull(action.flag)).toBe('accounting.f11-accounting');
                    expect(action.permission).toBe(
                        action.sideEffect === 'write' ? 'accounting.invoice.write' : 'accounting.read'
                    );
                }
            }
        )
);
