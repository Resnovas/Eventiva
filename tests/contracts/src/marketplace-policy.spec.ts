/**
 * @file tests/contracts/src/marketplace-policy.spec.ts
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

import { describe, expect, it } from '@effect/vitest';
import {
    assessFreshness,
    destructionDueAt,
    freshnessPolicy,
    quoteValidity,
    reconcileInvoice,
    recoveryAction,
    retentionPolicy,
} from '@eventiva/contracts/marketplace-policy';

const minute = 60_000;
const day = 86_400_000;
const now = 1_800_000_000_000;

describe('freshness', /** Group the freshness cases. */ () => {
    it('classifies each step on both sides of its maximum age', /** Distinguish inclusive freshness limits from the next stale millisecond for each workflow stage. */ () => {
        // Keep expiry in the future so only assertion age, not expiration, explains the change in classification.
        /**
         * Build an assertion `age` ms old that has not yet expired.
         *
         * @param age - How many milliseconds before `now` the assertion was made.
         * @returns Assertion timestamps that expire a day after `now`.
         */
        const at = (age: number) => ({
            asOf: now - age,
            expiresAt: now + day,
        });
        expect(assessFreshness(at(24 * 60 * minute), 'quote-send', now)).toBe('verified');
        expect(assessFreshness(at(24 * 60 * minute + 1), 'quote-send', now)).toBe('stale');
        expect(assessFreshness(at(15 * minute), 'award', now)).toBe('verified');
        expect(assessFreshness(at(15 * minute + 1), 'award', now)).toBe('stale');
        expect(assessFreshness(at(minute), 'payment', now)).toBe('verified');
        expect(assessFreshness(at(minute + 1), 'contract-acceptance', now)).toBe('stale');
    });

    it('treats missing and future assertions as unknown and expired ones as stale', /** Distinguish untrustworthy observation times from trustworthy but expired evidence. */ () => {
        // A future observation is unknown even with a future expiry; expiration itself is already stale at equality.
        expect(assessFreshness(undefined, 'award', now)).toBe('unknown');
        expect(assessFreshness({ asOf: now + 1, expiresAt: now + day }, 'award', now)).toBe('unknown');
        expect(assessFreshness({ asOf: now - 1, expiresAt: now }, 'quote-send', now)).toBe('stale');
    });

    it('requires a synchronous supplier recheck from award onwards and bounds quote validity', /** Pin the escalation from informational quote freshness to commitment-time supplier checks. */ () => {
        // Quote lifetime is independent of the synchronous commitment gates and must not inherit their shorter age limits.
        expect(freshnessPolicy['quote-send'].synchronousRecheck).toBe(false);
        expect(freshnessPolicy.award.synchronousRecheck).toBe(true);
        expect(freshnessPolicy['contract-acceptance'].synchronousRecheck).toBe(true);
        expect(freshnessPolicy.payment.synchronousRecheck).toBe(true);
        expect(quoteValidity).toEqual({ defaultMs: 14 * day, maximumMs: 90 * day });
    });
});

describe('retention', /** Group the retention cases. */ () => {
    const base = { closedAt: now, legalHold: false, participantObligationsEndAt: 0 } as const;
    it('keeps contract evidence seven years and lets jurisdictions only lengthen it', /** Preserve the policy floor when jurisdiction minima are either shorter or longer. */ () => {
        // Probe both directions: choosing the jurisdiction unconditionally would shorten message retention.
        expect(retentionPolicy['contract-evidence']).toBe(7 * 365 * day);
        expect(destructionDueAt({ ...base, recordClass: 'contract-evidence' })).toBe(now + 7 * 365 * day);
        expect(
            destructionDueAt({ ...base, recordClass: 'payment-evidence', jurisdictionMinimumMs: 10 * 365 * day })
        ).toBe(now + 10 * 365 * day);
        expect(destructionDueAt({ ...base, recordClass: 'message', jurisdictionMinimumMs: day })).toBe(
            now + 2 * 365 * day
        );
    });

    it('waits for every participant obligation and never destroys under legal hold', /** Keep later participant obligations and legal holds stronger than class retention deadlines. */ () => {
        // A legal hold has no destruction date, rather than merely extending the ordinary deadline.
        expect(
            destructionDueAt({ ...base, recordClass: 'audit', participantObligationsEndAt: now + 9 * 365 * day })
        ).toBe(now + 9 * 365 * day);
        expect(destructionDueAt({ ...base, recordClass: 'replay-nonce', legalHold: true })).toBeUndefined();
    });
});

describe('recovery and compensation', /** Group the recovery and compensation cases. */ () => {
    it('backs off exponentially, capped at five minutes, for seven retries', /** Pin early and final retry delays and the first exhausted attempt's compensation. */ () => {
        // The eighth attempt must leave retry policy; earlier failures must not prematurely unwind completed work.
        expect(recoveryAction('hold-stock', 'transient', 1)).toEqual({ kind: 'retry', delayMs: 1_000 });
        expect(recoveryAction('hold-stock', 'transient', 4)).toEqual({ kind: 'retry', delayMs: 8_000 });
        expect(recoveryAction('hold-stock', 'transient', 7)).toEqual({ kind: 'retry', delayMs: 64_000 });
        expect(recoveryAction('create-contract', 'transient', 8)).toEqual({
            kind: 'compensate',
            undo: ['release-stock-hold'],
        });
    });

    it('compensates completed steps in reverse and never auto-refunds a collected payment', /** Distinguish reversible predecessors from payment failures requiring manual recovery. */ () => {
        // No predecessor exists at the first step; later compensation order must not be confused with forward execution.
        expect(recoveryAction('hold-stock', 'permanent', 1)).toEqual({ kind: 'compensate', undo: [] });
        expect(recoveryAction('schedule-payment', 'permanent', 1)).toEqual({
            kind: 'compensate',
            undo: ['void-contract-snapshot', 'release-stock-hold'],
        });
        expect(recoveryAction('collect-payment', 'permanent', 1)).toEqual({ kind: 'manual-recovery' });
        expect(recoveryAction('collect-payment', 'transient', 8)).toEqual({ kind: 'manual-recovery' });
    });

    it('reconciles ambiguous outcomes before any retry or compensation', /** Require reconciliation despite either payment risk or exhausted retry budget. */ () => {
        // Ambiguity takes precedence over both ordinary retries and exhausted-attempt compensation.
        expect(recoveryAction('collect-payment', 'ambiguous', 1)).toEqual({ kind: 'reconcile' });
        expect(recoveryAction('hold-stock', 'ambiguous', 8)).toEqual({ kind: 'reconcile' });
    });
});

describe('invoice reconciliation', /** Group the invoice reconciliation cases. */ () => {
    const schedule = [
        { line: 'deposit', amountMinor: 50_000 },
        { line: 'balance', amountMinor: 150_000 },
    ];
    it('matches when every source equals the immutable contract schedule', /** Check that it matches when every source equals the immutable contract schedule. */ () => {
        expect(reconcileInvoice(schedule, { 'provider-invoice': [...schedule].reverse() })).toEqual({
            state: 'matched',
        });
    });

    it('reports changed, missing, extra and duplicated lines without adjusting anything', /** Check that it reports changed, missing, extra and duplicated lines without adjusting anything. */ () => {
        expect(
            reconcileInvoice(schedule, {
                'provider-invoice': [
                    { line: 'deposit', amountMinor: 50_001 },
                    { line: 'balance', amountMinor: 150_000 },
                    { line: 'fee', amountMinor: 1 },
                ],
                'supplier-accounting': [
                    { line: 'deposit', amountMinor: 50_000 },
                    { line: 'deposit', amountMinor: 50_000 },
                ],
            })
        ).toEqual({ state: 'discrepancy', lines: ['balance', 'deposit', 'fee'] });
    });
});
