/**
 * @file packages/contracts/src/marketplace-policy.ts
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

import { Schema } from 'effect';

/**
 * Concrete EVE-250 marketplace freshness, retention, recovery, compensation and
 * reconciliation parameters `eventiva.marketplace.v1`, approved by Jonathan on
 * 2026-11-18 (docs/planning/decisions.md, "Concrete trust and marketplace
 * parameters"). These are sealed floors: a tenant may shorten a freshness window
 * or lengthen a legally required retention period, never the reverse.
 * Region placement, lawful bases and staff access to private records stay open.
 */

const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;

/** Saga steps that rely on a supplier's own availability, stock or price assertion. */
export const FreshnessStep = Schema.Literal('quote-send', 'award', 'contract-acceptance', 'payment');
export type FreshnessStep = typeof FreshnessStep.Type;

/** Maximum assertion age per step, and whether the step must recheck the supplier synchronously first. */
export const freshnessPolicy: Readonly<
    Record<FreshnessStep, { readonly maxAgeMs: number; readonly synchronousRecheck: boolean }>
> = {
    'quote-send': { maxAgeMs: 24 * hour, synchronousRecheck: false },
    award: { maxAgeMs: 15 * minute, synchronousRecheck: true },
    'contract-acceptance': { maxAgeMs: minute, synchronousRecheck: true },
    payment: { maxAgeMs: minute, synchronousRecheck: true },
};

/** Quote validity when the supplier states none, and the longest validity a supplier may state. */
export const quoteValidity = { defaultMs: 14 * day, maximumMs: 90 * day } as const;

/** A supplier-owned assertion about availability, stock or price, as the marketplace last received it. */
export interface FreshnessAssertion {
    readonly asOf: number;
    readonly expiresAt: number;
}
export type Freshness = 'verified' | 'stale' | 'unknown';

/**
 * Classify an assertion for a step. Missing or future-dated assertions are unknown, never verified;
 * expired or over-age assertions are stale. A step that requires a synchronous recheck must still
 * perform it: `verified` here means only that the cached assertion may be shown, not that it may commit.
 */
export const assessFreshness = (
    assertion: FreshnessAssertion | undefined,
    step: FreshnessStep,
    now: number
): Freshness => {
    if (assertion === undefined || assertion.asOf > now) return 'unknown';
    if (assertion.expiresAt <= now || now - assertion.asOf > freshnessPolicy[step].maxAgeMs) return 'stale';
    return 'verified';
};

/** Record classes with independent retention schedules. */
export const RetentionClass = Schema.Literal(
    'message',
    'unawarded-quote',
    'contract-evidence',
    'payment-evidence',
    'audit',
    'replay-nonce',
    'public-tombstone',
    'offline-cache'
);
export type RetentionClass = typeof RetentionClass.Type;

/**
 * Default retention after the record's closing event (thread closed, award decided, contract ended,
 * payment settled, event recorded). Seven years covers the six-year UK limitation and HMRC record
 * periods with margin; jurisdictions that require longer (for example ten-year invoice keeping) extend
 * it. Personal data that is separable from evidence is erased or anonymized at the shorter class limit.
 */
export const retentionPolicy: Readonly<Record<RetentionClass, number>> = {
    message: 2 * 365 * day,
    'unawarded-quote': 2 * 365 * day,
    'contract-evidence': 7 * 365 * day,
    'payment-evidence': 7 * 365 * day,
    audit: 7 * 365 * day,
    'replay-nonce': 7 * day,
    'public-tombstone': 30 * day,
    'offline-cache': 15 * minute,
};

/** Inputs that decide whether a record may be deleted or crypto-shredded now. */
export interface RetentionState {
    readonly recordClass: RetentionClass;
    readonly closedAt: number;
    /** Longer jurisdiction-specific minimum, if one applies; shorter values are ignored. */
    readonly jurisdictionMinimumMs?: number;
    readonly legalHold: boolean;
    /** Every participant's independently held retention obligation must also have ended. */
    readonly participantObligationsEndAt: number;
}

/** Earliest time the record may be destroyed, or `undefined` while a legal hold applies. */
export const destructionDueAt = (state: RetentionState): number | undefined => {
    if (state.legalHold) return undefined;
    // A jurisdiction may only lengthen the sealed default, never shorten it.
    const period = Math.max(retentionPolicy[state.recordClass], state.jurisdictionMinimumMs ?? 0);
    return Math.max(state.closedAt + period, state.participantObligationsEndAt);
};

/** Retry schedule for transient saga failures before a step is handed to manual recovery. */
export const retryPolicy = { baseDelayMs: 1_000, factor: 2, maxDelayMs: 5 * minute, maxAttempts: 8 } as const;

/** Per-supplier saga steps in order. Each supplier leg of a mixed award runs independently. */
export const SagaStep = Schema.Literal('hold-stock', 'create-contract', 'schedule-payment', 'collect-payment');
export type SagaStep = typeof SagaStep.Type;
/** How a step failed: transient may retry, permanent will not succeed, ambiguous may already have taken effect. */
export type SagaFailure = 'transient' | 'permanent' | 'ambiguous';
/** Undo actions, each idempotent and recorded as a new event; evidence is voided, never deleted. */
export type Compensation = 'release-stock-hold' | 'void-contract-snapshot' | 'cancel-payment-schedule';

export type RecoveryAction =
    | { readonly kind: 'retry'; readonly delayMs: number }
    | { readonly kind: 'reconcile' }
    | { readonly kind: 'compensate'; readonly undo: ReadonlyArray<Compensation> }
    | { readonly kind: 'manual-recovery' };

/** Compensation for every completed step before `step`, in reverse order. */
const undoBefore = (step: SagaStep): ReadonlyArray<Compensation> => {
    const undo: Record<SagaStep, Compensation | undefined> = {
        'hold-stock': 'release-stock-hold',
        'create-contract': 'void-contract-snapshot',
        'schedule-payment': 'cancel-payment-schedule',
        'collect-payment': undefined,
    };
    const done = SagaStep.literals.slice(0, SagaStep.literals.indexOf(step));
    return done
        .map(/** Map each completed step to its undo action. */ (completed) => undo[completed])
        .filter(/** Drop steps with no undo. */ (action): action is Compensation => action !== undefined)
        .reverse();
};

/**
 * Decide the next action for one supplier leg after `attempt` failed attempts (1-based).
 * Ambiguous outcomes always reconcile by idempotency key against the authoritative status first.
 * Collected payments are never compensated automatically: refunds go through manual recovery and
 * the provider. A failing leg never rolls back another supplier's leg.
 */
export const recoveryAction = (step: SagaStep, failure: SagaFailure, attempt: number): RecoveryAction => {
    if (failure === 'ambiguous') return { kind: 'reconcile' };
    if (failure === 'transient' && attempt < retryPolicy.maxAttempts) {
        const delayMs = Math.min(retryPolicy.maxDelayMs, retryPolicy.baseDelayMs * retryPolicy.factor ** (attempt - 1));
        return { kind: 'retry', delayMs };
    }
    // Once money may have moved, a person decides; otherwise undo the completed earlier steps.
    if (step === 'collect-payment') return { kind: 'manual-recovery' };
    return { kind: 'compensate', undo: undoBefore(step) };
};

/** Line sources compared during invoice reconciliation. */
export type InvoiceSource = 'contract-schedule' | 'provider-invoice' | 'supplier-accounting';
/** One line amount in minor units for a contract schedule line. */
export interface ReconciliationLine {
    readonly line: string;
    readonly amountMinor: number;
}
export type ReconciliationResult =
    { readonly state: 'matched' } | { readonly state: 'discrepancy'; readonly lines: ReadonlyArray<string> };

/**
 * Compare provider and supplier lines against the immutable Eventiva contract schedule, which is the
 * baseline. Any missing, extra or different line is a discrepancy for manual review; nothing is adjusted.
 */
export const reconcileInvoice = (
    schedule: ReadonlyArray<ReconciliationLine>,
    others: Readonly<Partial<Record<Exclude<InvoiceSource, 'contract-schedule'>, ReadonlyArray<ReconciliationLine>>>>
): ReconciliationResult => {
    const expected = new Map(schedule.map(/** Index baseline lines. */ (l) => [l.line, l.amountMinor]));
    const bad = new Set<string>();
    for (const lines of Object.values(others)) {
        const seen = new Map<string, number>();
        for (const { line, amountMinor } of lines) {
            // A repeated line would otherwise hide a double charge behind one matching entry.
            if (seen.has(line)) bad.add(line);
            seen.set(line, amountMinor);
        }
        for (const [line, amount] of expected) if (seen.get(line) !== amount) bad.add(line);
        for (const line of seen.keys()) if (!expected.has(line)) bad.add(line);
    }
    return bad.size === 0 ? { state: 'matched' } : { state: 'discrepancy', lines: [...bad].sort() };
};
