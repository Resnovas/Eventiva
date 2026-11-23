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

describe('RFC 8785 canonicalization', /** Register byte-level canonicalization vectors separately from cryptographic provider behavior. */ () => {
    // These vectors pin signed bytes independently of signatures that could otherwise share the same serializer bug.
    it.effect(
        'sorts properties by UTF-16 code units (RFC 8785 section 3.2.3 example)',
        /**
         * Check that it sorts properties by UTF-16 code units (RFC 8785 section 3.2.3 example).
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
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
        /**
         * Check that it serializes numbers with ECMAScript rules and nests without whitespace.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Pin exponent thresholds, negative zero and legal Unicode without whitespace normalization. */ function* () {
                    // Exact text distinguishes ECMAScript number spelling from numerically equivalent but differently signed bytes.
                    expect(yield* canonicalize({ b: [1e21, 0.000001, 1e-7, -0, 4.5], a: { z: null, y: true } })).toBe(
                        '{"a":{"y":true,"z":null},"b":[1e+21,0.000001,1e-7,0,4.5]}'
                    );
                    expect(yield* canonicalize('\u2028')).toBe('"\u2028"');
                }
            )
    );

    /**
     * A function has no JSON form and must be refused.
     *
     * @returns A number, never reached because the function itself is the fixture.
     */
    const refusedFunction = () => 1;
    it.effect.each([
        ['NaN', Number.NaN],
        ['Infinity', [Number.POSITIVE_INFINITY]],
        ['lone surrogate value', { a: '\ud800' }],
        ['lone surrogate key', { '\udc00': 1 }],
        ['undefined member', { a: undefined }],
        ['class instance', new Date(0)],
        ['function', refusedFunction],
        ['bigint', 1n],
    ])(
        'refuses %s',
        /**
         * Expect each unsupported value to fail canonicalization as invalid.
         *
         * @param entry - One case: its label and the value that must be refused.
         * @returns The Effect that runs these assertions.
         */
        (entry) =>
            Effect.gen(
                /** Run the scenario steps in order inside the provided layer. */ function* () {
                    expect(yield* Effect.flip(canonicalize(entry[1] as never))).toEqual(
                        new CryptoFailure({ reason: 'invalid' })
                    );
                }
            )
    );

    it('domain-separates signing input', /** Prevent the same canonical object from sharing request and evidence signing bytes. */ () => {
        // Use identical canonical content so only the domain prefix can distinguish the two signatures.
        expect(signingInput('eventiva.m2.v1', '{}')).toBe('eventiva.m2.v1\n{}');
        expect(signingInput('eventiva.evidence.v1', '{}')).not.toBe(signingInput('eventiva.m2.v1', '{}'));
    });
});

describe('eventiva.trust.v1 timing', /** Register profile timing and algorithm pins without relying on wall-clock time or provider implementations. */ () => {
    // Fixed instants make policy drift visible without clock jitter or cryptographic transport dependencies.
    it('derives per-gate freshness floors from the approved maximum ages', /** Pin distinct evidence-age floors and the early-epoch clamp. */ () => {
        // Distinct broker/workload ages catch accidental reuse of the identity gate's bound.
        expect(trustPolicyAt(1_000_000, 'A4')).toEqual({
            now: 1_000_000,
            freshAfter: { identity: 700_000, resource: 700_000, workload: 100_000, broker: 940_000 },
            minimumAssurance: 'A4',
        });
        expect(trustPolicyAt(10, 'A2').freshAfter.workload).toBe(0);
    });

    it('bounds request lifetime at five minutes and tolerates thirty seconds of skew', /** Exercise lifetime and clock-skew boundaries with independent one-millisecond controls. */ () => {
        // Probe equality and the next millisecond separately; expiry plus skew has an exclusive upper bound.
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

describe('envelope schema and safe defaults', /** Register wire-format admission and unprovisioned-port denial without claiming live KMS conformance. */ () => {
    // A schema-valid envelope is only structural evidence; absent crypto services must still refuse operations.
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
    it('accepts exact base64url lengths and refuses vault, padding and other algorithms', /** Isolate protection, encoding-length and algorithm rejection from an otherwise valid envelope. */ () => {
        // Start with an accepted control so universal rejection cannot satisfy the malformed-envelope assertions.
        const is = Schema.is(EncryptedRecord);
        expect(is(base)).toBe(true);
        expect(is({ ...base, binding: { ...base.binding, profile: 'vault' } })).toBe(false);
        expect(is({ ...base, iv: `${'A'.repeat(14)}==` })).toBe(false);
        expect(is({ ...base, tag: 'A'.repeat(21) })).toBe(false);
        expect(is({ ...base, enc: 'A128GCM' })).toBe(false);
    });

    it.effect(
        'fails every crypto port closed when nothing is provisioned',
        /**
         * Check that it fails every crypto port closed when nothing is provisioned.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Require typed unavailable failures from every unprovisioned crypto port, not fabricated key material. */ function* () {
                    // Exercise each port independently; one unavailable service must not conceal an accepting fallback in another.
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
