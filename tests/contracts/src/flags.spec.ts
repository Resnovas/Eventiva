/**
 * @file tests/contracts/src/flags.spec.ts
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
    FlagDefinition,
    FlagKey,
    Flags,
    FlagsSafeDefaults,
    byPrecedence,
    safeDefault,
} from '@eventiva/contracts/flags';
import { describe, expect, it } from '@effect/vitest';
import { Effect, Schema } from 'effect';

/**
 * Build a flag fixture whose key and fallback value vary independently of fixed ownership metadata.
 *
 * @param key - The flag key to validate.
 * @param value - The safe default the fixture declares.
 * @returns A flag definition with fixed description and owner.
 */
const flag = (key: string, value: boolean) => ({
    key,
    description: 'Test flag.',
    owner: 'platform',
    safeDefault: value,
});

describe('flag keys and definitions', /** Cover portable flag naming and lifecycle metadata validation. */ () => {
    it('accepts dotted lower-case keys and rejects the rest', /** Verify dotted lowercase keys allow hyphenated segments but reject incomplete or uppercase names. */ () => {
        // A hyphen is legal within a segment; missing separators and empty segments are different errors.
        const valid = Schema.is(FlagKey);
        expect(valid('client.shell.offline-banner')).toBe(true);
        expect(valid('client')).toBe(false);
        expect(valid('Client.shell')).toBe(false);
        expect(valid('client.')).toBe(false);
    });

    it('requires an ISO date for expiry', /** Reject non-ISO expiry text and blank descriptions on otherwise valid flag definitions. */ () => {
        // Keep key, ownership and fallback valid so expiry and description failures cannot mask one another.
        const decode = Schema.decodeUnknownEither(FlagDefinition);
        expect(decode({ ...flag('a.b', false), expires: '2027-01-31' })._tag).toBe('Right');
        expect(decode({ ...flag('a.b', false), expires: '31/01/2027' })._tag).toBe('Left');
        expect(decode({ ...flag('a.b', false), description: '  ' })._tag).toBe('Left');
    });
});

describe('byPrecedence', /** Cover policy source ordering independently of flag evaluation. */ () => {
    it('puts higher sources first and keeps the given order within a source', /** Verify source priority preserves the original order of equally ranked emergency policies. */ () => {
        // Interleaved priorities expose input-order sorting; two emergency entries also expose reversed ties.
        const ordered = byPrecedence([
            { source: 'targeting', id: 1 },
            { source: 'remote', id: 2 },
            { source: 'emergency-policy', id: 3 },
            { source: 'git-baseline', id: 4 },
            { source: 'emergency-policy', id: 5 },
            { source: 'core-invariant', id: 6 },
        ] as const);
        expect(
            ordered.map(
                /**
                 * Expose fixture identities without obscuring the resulting precedence order.
                 *
                 * @param entry - One ordered fixture.
                 * @returns The fixture's numeric identifier.
                 */
                (entry) => entry.id
            )
        ).toEqual([6, 3, 5, 4, 2, 1]);
    });
});

describe('FlagsSafeDefaults', /** Cover the offline-safe fallback layer without a remote flag provider. */ () => {
    it.effect(
        'answers every flag with its own safe default and marks it a fallback',
        /**
         * Provide only the safe-default layer to exercise fallback evaluation in isolation.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Verify fallback values come from each definition and preserve an explicit failure reason. */ function* () {
                    // Both boolean defaults matter: fallback must not become a blanket disable policy.
                    const flags = yield* Flags;
                    const on = yield* flags.evaluate(flag('a.on', true));
                    const off = yield* flags.evaluate(flag('a.off', false));
                    expect(on).toEqual({ flag: 'a.on', value: true, reason: 'SAFE_DEFAULT', fallback: true });
                    expect(off.value).toBe(false);
                    expect(safeDefault(flag('a.off', false), 'ERROR').reason).toBe('ERROR');
                }
            ).pipe(Effect.provide(FlagsSafeDefaults))
    );
});
