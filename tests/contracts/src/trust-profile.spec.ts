/**
 * @file tests/contracts/src/trust-profile.spec.ts
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
    CryptoFailure,
    CryptoUnavailable,
    EncryptedRecord,
    KeyManagement,
    SigningKeys,
    TrustDirectory,
    canonicalize,
    requestWindowValid,
    signingInput,
    trustPolicyAt,
    trustProfile,
} from '@eventiva/contracts/trust-profile';
import { Effect, Schema } from 'effect';

describe('RFC 8785 canonicalization', /** Group the RFC 8785 canonicalization cases. */ () => {
    it.effect(
        'sorts properties by UTF-16 code units (RFC 8785 section 3.2.3 example)',
        /** Check that it sorts properties by UTF-16 code units (RFC 8785 section 3.2.3 example). */ () =>
            Effect.gen(
                /** Run the scenario steps in order inside the provided layer. */ function* () {
                    const input = {
                        '\u20ac': 'Euro Sign',
                        '\r': 'Carriage Return',
                        '\ufb33': 'Hebrew Letter Dalet With Dagesh',
                        '1': 'One',
                        '\ud83d\ude00': 'Emoji: Grinning Face',
                        '\u0080': 'Control',
                        '\u00f6': 'Latin Small Letter O With Diaeresis',
                    };
                    // Integer-like keys must not be hoisted: JCS orders '\r' (U+000D) before '1' (U+0031).
                    expect(yield* canonicalize(input)).toBe(
                        '{"\\r":"Carriage Return","1":"One","\u0080":"Control","\u00f6":"Latin Small Letter O With Diaeresis",' +
                            '"\u20ac":"Euro Sign","\ud83d\ude00":"Emoji: Grinning Face","\ufb33":"Hebrew Letter Dalet With Dagesh"}'
                    );
                }
            )
    );

    it.effect(
        'serializes numbers with ECMAScript rules and nests without whitespace',
        /** Check that it serializes numbers with ECMAScript rules and nests without whitespace. */ () =>
            Effect.gen(
                /** Run the scenario steps in order inside the provided layer. */ function* () {
                    expect(yield* canonicalize({ b: [1e21, 0.000001, 1e-7, -0, 4.5], a: { z: null, y: true } })).toBe(
                        '{"a":{"y":true,"z":null},"b":[1e+21,0.000001,1e-7,0,4.5]}'
                    );
                    expect(yield* canonicalize('\u2028')).toBe('"\u2028"');
                }
            )
    );

    it.effect.each([
        ['NaN', Number.NaN],
        ['Infinity', [Number.POSITIVE_INFINITY]],
        ['lone surrogate value', { a: '\ud800' }],
        ['lone surrogate key', { '\udc00': 1 }],
        ['undefined member', { a: undefined }],
        ['class instance', new Date(0)],
        ['function', /** A function has no JSON form and must be refused. */ () => 1],
        ['bigint', 1n],
    ])(
        'refuses %s',
        /** Expect each unsupported value to fail canonicalization as invalid. */ ([, value]) =>
            Effect.gen(
                /** Run the scenario steps in order inside the provided layer. */ function* () {
                    expect(yield* Effect.flip(canonicalize(value as never))).toEqual(
                        new CryptoFailure({ reason: 'invalid' })
                    );
                }
            )
    );

    it('domain-separates signing input', /** Check that it domain-separates signing input. */ () => {
        expect(signingInput('eventiva.m2.v1', '{}')).toBe('eventiva.m2.v1\n{}');
        expect(signingInput('eventiva.evidence.v1', '{}')).not.toBe(signingInput('eventiva.m2.v1', '{}'));
    });
});

describe('eventiva.trust.v1 timing', /** Group the eventiva.trust.v1 timing cases. */ () => {
    it('derives per-gate freshness floors from the approved maximum ages', /** Check that it derives per-gate freshness floors from the approved maximum ages. */ () => {
        expect(trustPolicyAt(1_000_000, 'A4')).toEqual({
            now: 1_000_000,
            freshAfter: { identity: 700_000, resource: 700_000, workload: 100_000, broker: 940_000 },
            minimumAssurance: 'A4',
        });
        expect(trustPolicyAt(10, 'A2').freshAfter.workload).toBe(0);
    });

    it('bounds request lifetime at five minutes and tolerates thirty seconds of skew', /** Check that it bounds request lifetime at five minutes and tolerates thirty seconds of skew. */ () => {
        const t = 1_000_000;
        expect(requestWindowValid({ issuedAt: t, expiresAt: t + 300_000 }, t)).toBe(true);
        expect(requestWindowValid({ issuedAt: t, expiresAt: t + 300_001 }, t)).toBe(false);
        expect(requestWindowValid({ issuedAt: t, expiresAt: t }, t)).toBe(false);
        expect(requestWindowValid({ issuedAt: t + 30_000, expiresAt: t + 60_000 }, t)).toBe(true);
        expect(requestWindowValid({ issuedAt: t + 30_001, expiresAt: t + 60_000 }, t)).toBe(false);
        expect(requestWindowValid({ issuedAt: t, expiresAt: t + 1_000 }, t + 30_999)).toBe(true);
        expect(requestWindowValid({ issuedAt: t, expiresAt: t + 1_000 }, t + 31_000)).toBe(false);
    });

    it('pins the approved algorithms and custody quorum', /** Check that it pins the approved algorithms and custody quorum. */ () => {
        expect(trustProfile).toMatchObject({
            signature: 'Ed25519',
            canonicalization: 'RFC8785-JCS',
            content: 'A256GCM',
            dekBytes: 32,
            ivBytes: 12,
            tagBytes: 16,
            custody: { rootQuorum: 3, rootCustodians: 5, kekAdministrationApprovals: 2 },
        });
    });
});

describe('envelope schema and safe defaults', /** Group the envelope schema and safe defaults cases. */ () => {
    const base = {
        version: 'eventiva.envelope.v1',
        enc: 'A256GCM',
        binding: {
            tenant: '019b0000-0000-7000-8000-000000000001',
            resource: 'marketplace.quote',
            recordId: '019b0000-0000-7000-8000-000000000002',
            recordVersion: 1,
            profile: 'restricted',
        },
        kek: { kek: '019b0000-0000-7000-8000-000000000003', kekVersion: 1 },
        dek: '019b0000-0000-7000-8000-000000000004',
        wrappedDek: 'AAAA',
        iv: 'A'.repeat(16),
        tag: 'A'.repeat(22),
        ciphertext: '',
    };
    it('accepts exact base64url lengths and refuses vault, padding and other algorithms', /** Check that it accepts exact base64url lengths and refuses vault, padding and other algorithms. */ () => {
        const is = Schema.is(EncryptedRecord);
        expect(is(base)).toBe(true);
        expect(is({ ...base, binding: { ...base.binding, profile: 'vault' } })).toBe(false);
        expect(is({ ...base, iv: `${'A'.repeat(14)}==` })).toBe(false);
        expect(is({ ...base, tag: 'A'.repeat(21) })).toBe(false);
        expect(is({ ...base, enc: 'A128GCM' })).toBe(false);
    });

    it.effect(
        'fails every crypto port closed when nothing is provisioned',
        /** Check that it fails every crypto port closed when nothing is provisioned. */ () =>
            Effect.gen(
                /** Run the scenario steps in order inside the provided layer. */ function* () {
                    const kms = yield* KeyManagement;
                    const signer = yield* SigningKeys;
                    const directory = yield* TrustDirectory;
                    const kek = { kek: base.kek.kek, kekVersion: 1 };
                    const attempts: ReadonlyArray<Effect.Effect<unknown, CryptoFailure>> = [
                        kms.generateDataKey(kek, '{}'),
                        kms.unwrapDataKey(kek, new Uint8Array(1), '{}'),
                        signer.sign(kek.kek, 1, new Uint8Array(1)),
                        directory.key(kek.kek, 1),
                    ];
                    for (const attempt of attempts) {
                        expect(yield* Effect.flip(attempt)).toEqual(new CryptoFailure({ reason: 'unavailable' }));
                    }
                }
            ).pipe(Effect.provide(CryptoUnavailable))
    );
});
