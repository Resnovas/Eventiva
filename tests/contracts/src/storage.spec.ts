/**
 * @file tests/contracts/src/storage.spec.ts
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

import { define, transition } from '@eventiva/contracts/machine';
import {
    EpochMillis,
    ExactDecimal,
    GuardedCommand,
    IntentOutcome,
    Json,
    MinorUnits,
    Quantity,
    UuidV7,
    Version,
} from '@eventiva/contracts/storage';
import { expect, it } from '@effect/vitest';
import { Effect, Schema } from 'effect';

it.effect('portable value codecs reject precision loss and non-v7 IDs without driver imports', () =>
    Effect.gen(function* () {
        const uuid = '019b0000-0000-7000-8000-000000000001';
        expect(Schema.is(UuidV7)(uuid)).toBe(true);
        expect(Schema.is(UuidV7)('019b0000-0000-4000-8000-000000000001')).toBe(false);
        for (const value of ['-9007199254740993.1200', '0.000000000000000001'])
            expect(yield* Schema.decodeUnknown(ExactDecimal)(value)).toBe(value);
        for (const value of ['1e10', '01.1', 'NaN', 0.1]) expect(Schema.is(ExactDecimal)(value)).toBe(false);
        expect(Schema.is(MinorUnits)('9223372036854775807')).toBe(true);
        expect(Schema.is(MinorUnits)('1.5')).toBe(false);
        for (const value of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) expect(Schema.is(Quantity)(value)).toBe(false);
        expect(Schema.is(Version)(0)).toBe(true);
        for (const value of [-62135596800000, 253402300799999, 1794700000123])
            expect(yield* Schema.decodeUnknown(EpochMillis)(value)).toBe(value);
        expect(Schema.is(EpochMillis)(253402300800000)).toBe(false);
        const value = { amount: '-9007199254740993.1200', nested: [true, null, { id: uuid }] };
        expect(yield* Schema.decodeUnknown(Json)(yield* Schema.encode(Json)(value))).toEqual(value);
        expect(yield* Effect.either(Schema.encode(Json)({ invalid: Infinity }))).toMatchObject({ _tag: 'Left' });
        expect(Schema.is(IntentOutcome)('pending')).toBe(true);
        expect(
            Schema.is(GuardedCommand)({
                id: uuid,
                expectedVersion: 0,
                expectedState: 'pending',
                idempotencyKey: 'key',
                clientMutationId: uuid,
                deadline: 1,
            })
        ).toBe(true);
        expect(Schema.is(GuardedCommand)({ id: uuid, expectedVersion: 0 })).toBe(false);
    })
);

it.effect('typed machine edges reject illegal transitions', () =>
    Effect.gen(function* () {
        const machine = define({ pending: ['confirmed', 'expired'], confirmed: [], expired: [] });
        expect(yield* transition(machine, 'reservation', 'pending', 'confirmed')).toBe('confirmed');
        expect(yield* Effect.either(transition(machine, 'reservation', 'expired', 'confirmed'))).toMatchObject({
            left: { reason: 'illegal-transition' },
        });
        const typeProof = () => {
            // @ts-expect-error State names are the literal machine vocabulary.
            transition(machine, 'reservation', 'missing', 'confirmed');
        };
        expect(typeProof).toBeTypeOf('function');
    })
);
