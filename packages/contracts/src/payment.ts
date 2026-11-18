/**
 * @file packages/contracts/src/payment.ts
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

import { Clock, Effect, Schema } from 'effect';
import { EpochMillis, type JsonValue } from './storage.ts';

const day = 86_400_000;
const strict = { parseOptions: { onExcessProperty: 'error' } } as const;

/** Version-one calibration only; qualifying for a level requires a separate verified maturity assessment. */
export const FulfilmentAssessment = Schema.Struct({
    policyVersion: Schema.Literal(1),
    obligation: Schema.UUID,
    maturity: Schema.Literal('new', 'established', 'proven'),
    contractedCompletionAt: EpochMillis,
    fulfilledAt: Schema.NullOr(EpochMillis),
    confirmedAt: Schema.NullOr(EpochMillis),
    remindersSent: Schema.Boolean,
    openDispute: Schema.Boolean,
    providerHoldSupported: Schema.Boolean,
})
    .annotations(strict)
    .pipe(
        Schema.filter(
            /** Buyer acceptance cannot precede the supplier's fulfilment evidence for this obligation. */
            (value) =>
                value.confirmedAt === null || (value.fulfilledAt !== null && value.confirmedAt >= value.fulfilledAt)
        )
    );
export type FulfilmentAssessment = typeof FulfilmentAssessment.Type;

/** Advisory local result, never a provider release instruction or proof that funds moved. */
export type FulfilmentDecision =
    | {
          readonly state: 'blocked';
          readonly reason: 'unsupported-hold' | 'disputed' | 'unfulfilled' | 'reminders-required';
      }
    | { readonly state: 'pending' | 'eligible'; readonly eligibleAt: number };

/**
 * Assess one obligation using the Effect clock and policy v1 (14/7/3 days).
 * Input is trusted evidence supplied by a future authorized action, not buyer-editable policy.
 * Provider capabilities, authorization and disputes must be checked again before any online release.
 */
export const assessFulfilment = (input: JsonValue) =>
    Effect.gen(
        /** Decode evidence before computing a clock-relative advisory result; no external command is emitted. */ function* () {
            const assessment = yield* Schema.decodeUnknown(FulfilmentAssessment)(input);
            const now = yield* Clock.currentTimeMillis;
            // Never substitute a local timer for a missing provider hold or override a contractual dispute.
            if (!assessment.providerHoldSupported) return { state: 'blocked', reason: 'unsupported-hold' } as const;
            if (assessment.openDispute) return { state: 'blocked', reason: 'disputed' } as const;
            if (assessment.fulfilledAt === null || assessment.fulfilledAt > now)
                return { state: 'blocked', reason: 'unfulfilled' } as const;
            if (assessment.confirmedAt === null && !assessment.remindersSent)
                return { state: 'blocked', reason: 'reminders-required' } as const;

            // A late supplier declaration cannot make the no-response route mature before actual fulfilment.
            const eligibility =
                assessment.confirmedAt ??
                Math.max(assessment.contractedCompletionAt + 14 * day, assessment.fulfilledAt);
            const delay = assessment.maturity === 'new' ? 14 : assessment.maturity === 'established' ? 7 : 3;
            const eligibleAt = eligibility + delay * day;
            return { state: now >= eligibleAt ? 'eligible' : 'pending', eligibleAt } as const;
        }
    );
