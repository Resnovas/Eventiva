/**
 * @file tests/contracts/src/payment.spec.ts
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
import { Effect, Schema, TestClock } from 'effect';
import { InvoiceRevision } from '@eventiva/contracts/invoice';
import { assessFulfilment, type FulfilmentAssessment } from '@eventiva/contracts/payment';

const day = 86_400_000;
const evidence: FulfilmentAssessment = {
    policyVersion: 1,
    obligation: '11111111-1111-4111-8111-111111111111',
    maturity: 'new',
    contractedCompletionAt: day,
    fulfilledAt: day + 1,
    confirmedAt: day + 2,
    remindersSent: false,
    openDispute: false,
    providerHoldSupported: true,
};

it.effect(
    'applies each versioned delay and the exact inclusive boundary with the fake clock',
    /** Distinguish 14, 7 and 3 days from confirmation rather than the contract date. */ () =>
        Effect.gen(
            /** Assert one millisecond before and exactly at each independent expected release time. */ function* () {
                // Asymmetric event times expose implementations anchored to the wrong contractual timestamp.
                for (const [maturity, eligibleAt] of [
                    ['new', 15 * day + 2],
                    ['established', 8 * day + 2],
                    ['proven', 4 * day + 2],
                ] as const) {
                    yield* TestClock.setTime(eligibleAt - 1);
                    expect(yield* assessFulfilment({ ...evidence, maturity })).toEqual({
                        state: 'pending',
                        eligibleAt,
                    });
                    yield* TestClock.adjust(1);
                    expect(yield* assessFulfilment({ ...evidence, maturity })).toEqual({
                        state: 'eligible',
                        eligibleAt,
                    });
                }
            }
        )
);

it.effect(
    'requires reminders before no-response eligibility and never backdates late fulfilment',
    /** Separate the fourteen-day buyer-response window from the supplier maturity delay. */ () =>
        Effect.gen(
            /** Exercise unanswered and late obligations without granting eligibility to another milestone. */ function* () {
                // Late fulfilment starts a new delay rather than borrowing the older no-response deadline.
                yield* TestClock.setTime(40 * day);
                const unanswered = { ...evidence, confirmedAt: null };
                expect(yield* assessFulfilment(unanswered)).toEqual({ state: 'blocked', reason: 'reminders-required' });
                expect(yield* assessFulfilment({ ...unanswered, remindersSent: true })).toEqual({
                    state: 'eligible',
                    eligibleAt: 29 * day,
                });
                expect(yield* assessFulfilment({ ...unanswered, remindersSent: true, fulfilledAt: 35 * day })).toEqual({
                    state: 'pending',
                    eligibleAt: 49 * day,
                });
                expect(yield* assessFulfilment({ ...unanswered, fulfilledAt: null })).toEqual({
                    state: 'blocked',
                    reason: 'unfulfilled',
                });
                expect(yield* assessFulfilment({ ...unanswered, fulfilledAt: 41 * day })).toEqual({
                    state: 'blocked',
                    reason: 'unfulfilled',
                });
            }
        )
);

it.effect(
    'validates exact canonical invoice revisions without rounding or accepting inconsistent totals',
    /** Separate invoice identity and supplier/customer identity from all later provider mappings. */ () =>
        Effect.gen(
            /** Use amounts beyond safe floating-point precision and independently derived tax-inclusive totals. */ function* () {
                // A one-unit total mismatch must survive decoding even where Number arithmetic would erase the difference.
                const revision = {
                    invoice: evidence.obligation,
                    revision: 1,
                    supplier: evidence.obligation,
                    customer: '22222222-2222-4222-8222-222222222222',
                    currency: 'GBP',
                    lines: [{ description: 'Synthetic', quantity: 2, unitNetMinor: '9007199254740993', taxMinor: '3' }],
                    totalMinor: '18014398509481989',
                    commissionMinor: '2',
                };
                expect(yield* Schema.decodeUnknown(InvoiceRevision)(revision)).toEqual(revision);
                for (const input of [
                    { ...revision, totalMinor: '18014398509481988' },
                    { ...revision, commissionMinor: '18014398509481990' },
                    { ...revision, revision: 0 },
                    { ...revision, currency: 'gbp' },
                    { ...revision, lines: [] },
                    { ...revision, cardNumber: 'forbidden' },
                    {
                        ...revision,
                        lines: [{ description: 'Synthetic', quantity: 1.5, unitNetMinor: '1', taxMinor: '0' }],
                    },
                    {
                        ...revision,
                        lines: [{ description: 'Synthetic', quantity: 1, unitNetMinor: '-1', taxMinor: '0' }],
                    },
                    {
                        ...revision,
                        lines: [{ description: 'Synthetic', quantity: 1, unitNetMinor: '01', taxMinor: '0' }],
                    },
                ])
                    expect((yield* Effect.either(Schema.decodeUnknown(InvoiceRevision)(input)))._tag).toBe('Left');
            }
        )
);

it.effect(
    'blocks disputes and unsupported holds even after the delay elapses',
    /** Capability failure cannot silently become a local escrow or override a dispute. */ () =>
        Effect.gen(
            /** Reevaluate the same accepted milestone after a dispute or capability change. */ function* () {
                // Establish elapsed-time eligibility first so the negative controls isolate dispute and provider-hold gates.
                yield* TestClock.setTime(40 * day);
                expect(yield* assessFulfilment(evidence)).toEqual({ state: 'eligible', eligibleAt: 15 * day + 2 });
                expect(yield* assessFulfilment({ ...evidence, openDispute: true })).toEqual({
                    state: 'blocked',
                    reason: 'disputed',
                });
                expect(yield* assessFulfilment({ ...evidence, providerHoldSupported: false })).toEqual({
                    state: 'blocked',
                    reason: 'unsupported-hold',
                });
            }
        )
);

it.effect(
    'rejects invalid evidence instead of manufacturing financial eligibility',
    /** Check contradictory confirmation, missing fulfilment, unknown policy and excess private fields. */ () =>
        Effect.gen(
            /** Invalid schemas fail before policy evaluation; future confirmation remains pending. */ function* () {
                // Distinguish structurally invalid evidence from valid evidence whose confirmation time has not arrived.
                for (const input of [
                    { ...evidence, confirmedAt: day },
                    { ...evidence, fulfilledAt: null },
                    { ...evidence, policyVersion: 2 },
                    { ...evidence, contractedCompletionAt: Infinity },
                    { ...evidence, cardNumber: 'not-allowed' },
                ])
                    expect((yield* Effect.either(assessFulfilment(input)))._tag).toBe('Left');
                yield* TestClock.setTime(2 * day);
                expect(yield* assessFulfilment({ ...evidence, confirmedAt: 3 * day })).toEqual({
                    state: 'pending',
                    eligibleAt: 17 * day,
                });
            }
        )
);
