/**
 * @file tests/integrations/trust-server/src/crypto.spec.ts
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
    BrokerGate,
    IdentityGate,
    ResourceGate,
    type TrustEvidence,
    TrustFailure,
    TrustReplay,
    type TrustRequest,
    WorkloadGate,
} from '@eventiva/contracts/trust';
import {
    CryptoFailure,
    CryptoUnavailable,
    type DirectoryKey,
    type EncryptedRecord,
    KeyManagement,
    type KeyPurpose,
    type RecordBinding,
    type SignedRequest,
    type SignedRequestClaims,
    SigningKeys,
    TrustDirectory,
    trustPolicyAt,
} from '@eventiva/contracts/trust-profile';
import {
    openRecord,
    payloadDigest,
    sealRecord,
    signEvidence,
    signRequest,
    signedEvidenceGate,
    verifyRequest,
} from '@eventiva/integrations.trust.server/crypto';
import { trustPreflight } from '@eventiva/runtime/trust';
import { Effect, Layer } from 'effect';
import {
    type KeyObject,
    createCipheriv,
    createDecipheriv,
    generateKeyPairSync,
    randomBytes,
    sign as edSign,
} from 'node:crypto';

/** Stable distinct UUIDs for fixtures. */
const uuid = (n: number): string => `019b0000-0000-7000-8000-${n.toString().padStart(12, '0')}`;
const NOW = 1_800_000_000_000;

/** FIXTURE KMS ONLY: AES-256-GCM key wrap with the encryption context as additional data. */
const fixtureKms = (keks: ReadonlyMap<string, Buffer>) =>
    KeyManagement.of({
        /** Wrap a random DEK under the named KEK version and context. */
        generateDataKey: (kek, context) =>
            Effect.gen(
                /** Wrap a fresh random DEK, failing unavailable for unknown KEK versions. */ function* () {
                    // Bind wrapped key material to the supplied context so record substitution fails even under the same KEK.
                    const wrapping = keks.get(`${kek.kek}:${kek.kekVersion}`);
                    if (wrapping === undefined) return yield* Effect.fail(new CryptoFailure({ reason: 'unavailable' }));
                    const dek = randomBytes(32);
                    const iv = randomBytes(12);
                    const cipher = createCipheriv('aes-256-gcm', wrapping, iv).setAAD(Buffer.from(context));
                    const wrapped = Buffer.concat([iv, cipher.update(dek), cipher.final(), cipher.getAuthTag()]);
                    return { plaintext: new Uint8Array(dek), wrapped: new Uint8Array(wrapped) };
                }
            ),
        /** Unwrap only under the same KEK version and context. */
        unwrapDataKey: (kek, wrapped, context) =>
            Effect.try({
                /** Unwrap with the stored IV and tag; any context or KEK mismatch throws. */ try: () => {
                    // Authenticate the context and retained tag before returning plaintext DEK bytes to the caller.
                    const wrapping = keks.get(`${kek.kek}:${kek.kekVersion}`);
                    if (wrapping === undefined) throw new Error('unknown');
                    const raw = Buffer.from(wrapped);
                    const decipher = createDecipheriv('aes-256-gcm', wrapping, raw.subarray(0, 12)).setAAD(
                        Buffer.from(context)
                    );
                    decipher.setAuthTag(raw.subarray(raw.length - 16));
                    return new Uint8Array(
                        Buffer.concat([decipher.update(raw.subarray(12, raw.length - 16)), decipher.final()])
                    );
                },
                /** Collapse every fixture unwrap failure into decrypt. */ catch: () =>
                    new CryptoFailure({ reason: 'decrypt' }),
            }),
    });

/** Fixture Ed25519 key: the private key for the signer and its public directory entry. */
interface FixtureKey {
    readonly id: string;
    readonly privateKey: KeyObject;
    readonly entry: DirectoryKey;
}
/** Generate an Ed25519 key with its public directory entry. */
const edKey = (n: number, service: string, purpose: KeyPurpose, overrides: Partial<DirectoryKey> = {}): FixtureKey => {
    // Override directory metadata without replacing signing material so tests can isolate revocation, purpose and validity checks.
    const { privateKey, publicKey } = generateKeyPairSync('ed25519');
    const x = publicKey.export({ format: 'jwk' }).x ?? '';
    return {
        id: uuid(n),
        privateKey,
        entry: {
            keyId: uuid(n),
            keyVersion: 1,
            service,
            purpose,
            publicKey: x,
            notBefore: NOW - 86_400_000,
            notAfter: NOW + 86_400_000,
            revoked: false,
            ...overrides,
        },
    };
};

/** Compose fixture KMS, signer and directory over the supplied keys. */
const layer = (keys: ReadonlyArray<FixtureKey>, keks = new Map([[`${uuid(50)}:1`, randomBytes(32)]])) =>
    Layer.mergeAll(
        Layer.succeed(KeyManagement, fixtureKms(keks)),
        Layer.succeed(SigningKeys, {
            /** Sign with the fixture private key named by keyId. */ sign: (keyId, _version, message) =>
                Effect.sync(
                    /** Fixture keys are fixed, so a missing key is a test defect. */ () => {
                        // An unknown fixture signer must fail loudly rather than accidentally sign with another service's key.
                        const key = keys.find(/** Select the fixture key by id. */ (k) => k.id === keyId);
                        if (key === undefined) throw new Error('missing fixture key');
                        return new Uint8Array(edSign(null, message, key.privateKey));
                    }
                ),
        }),
        Layer.succeed(TrustDirectory, {
            /** Return the directory entry for an exact key version or fail unavailable. */ key: (keyId, version) => {
                // Key version participates in lookup so stale-version tests cannot borrow the current public key.
                const key = keys.find(
                    /** Match both key id and version. */ (k) =>
                        k.entry.keyId === keyId && k.entry.keyVersion === version
                );
                return key ? Effect.succeed(key.entry) : Effect.fail(new CryptoFailure({ reason: 'unavailable' }));
            },
        })
    );

const binding: RecordBinding = {
    tenant: uuid(1) as RecordBinding['tenant'],
    resource: 'marketplace.quote',
    recordId: uuid(2),
    recordVersion: 3,
    profile: 'restricted',
};
const kek = { kek: uuid(50), kekVersion: 1 };
const secret = new TextEncoder().encode('Quote total 12,345.00 GBP for line A');

describe('AES-256-GCM envelope', /** Group the AES-256-GCM envelope cases. */ () => {
    it.effect(
        'round-trips with a unique DEK and IV per seal and no plaintext in the envelope',
        /** Check that it round-trips with a unique DEK and IV per seal and no plaintext in the envelope. */ () =>
            Effect.gen(
                /** Compare repeated seals and independent plaintext read-back under the same binding. */ function* () {
                    // Identical plaintext must still use fresh DEK/IV material; read-back also rules out meaningless random envelopes.
                    const a = yield* sealRecord(binding, kek, secret);
                    const b = yield* sealRecord(binding, kek, secret);
                    expect(a.dek).not.toBe(b.dek);
                    expect(a.iv).not.toBe(b.iv);
                    expect(a.ciphertext).not.toBe(b.ciphertext);
                    expect(JSON.stringify(a)).not.toContain('12,345');
                    expect(Buffer.from(a.ciphertext, 'base64url').length).toBe(secret.length);
                    expect(new TextDecoder().decode(yield* openRecord(a))).toBe('Quote total 12,345.00 GBP for line A');
                }
            ).pipe(Effect.provide(layer([])))
    );

    /** Each mutation moves the envelope to another record, version, tenant or alters authenticated bytes. */
    const tamper: ReadonlyArray<
        [string, /** Mutation applied to a sealed envelope before reopening. */ (r: EncryptedRecord) => EncryptedRecord]
    > = [
        [
            'tenant',
            /** Move the envelope to another tenant. */ (r) => ({
                ...r,
                binding: { ...r.binding, tenant: uuid(9) as RecordBinding['tenant'] },
            }),
        ],
        [
            'record version',
            /** Claim a newer record version. */ (r) => ({ ...r, binding: { ...r.binding, recordVersion: 4 } }),
        ],
        [
            'profile downgrade',
            /** Downgrade the classification. */ (r) => ({ ...r, binding: { ...r.binding, profile: 'sensitive' } }),
        ],
        ['dek id', /** Point at another DEK id. */ (r) => ({ ...r, dek: uuid(8) })],
        [
            'ciphertext',
            /** Flip one ciphertext bit. */ (r) => {
                // Preserve valid encoding and length so authentication, not schema rejection, detects the mutation.
                const c = Buffer.from(r.ciphertext, 'base64url');
                c[0] = (c[0] ?? 0) ^ 1;
                return { ...r, ciphertext: c.toString('base64url') };
            },
        ],
        ['tag', /** Replace the authentication tag. */ (r) => ({ ...r, tag: Buffer.alloc(16).toString('base64url') })],
        ['iv', /** Replace the IV. */ (r) => ({ ...r, iv: Buffer.alloc(12).toString('base64url') })],
    ];
    it.effect.each(tamper)(
        'refuses a changed %s with decrypt',
        /** Seal, apply one mutation and expect decrypt. */ ([, change]) =>
            Effect.gen(
                /** Mutate a genuine seal once and require the bounded decrypt failure. */ function* () {
                    // Sealing first makes each mutation a tamper test against valid cryptographic state, not arbitrary invalid input.
                    const sealed = yield* sealRecord(binding, kek, secret);
                    const failure = yield* Effect.flip(openRecord(change(sealed)));
                    expect(failure).toEqual(new CryptoFailure({ reason: 'decrypt' }));
                }
            ).pipe(Effect.provide(layer([])))
    );

    it.effect(
        'swapping the DEK of another record fails even within the same tenant and KEK',
        /** Check that it swapping the DEK of another record fails even within the same tenant and KEK. */ () =>
            Effect.gen(
                /** Isolate record binding by swapping wrapped DEKs under a shared tenant and KEK. */ function* () {
                    // Only record identity changes, so tenant or KEK separation cannot explain the required rejection.
                    const a = yield* sealRecord(binding, kek, secret);
                    const b = yield* sealRecord({ ...binding, recordId: uuid(3) }, kek, secret);
                    const failure = yield* Effect.flip(openRecord({ ...a, wrappedDek: b.wrappedDek }));
                    expect(failure.reason).toBe('decrypt');
                }
            ).pipe(Effect.provide(layer([])))
    );

    it.effect(
        'refuses vault bindings, malformed envelopes and unprovisioned KMS',
        /** Check that it refuses vault bindings, malformed envelopes and unprovisioned KMS. */ () =>
            Effect.gen(
                /** Run the scenario steps in order inside the provided layer. */ function* () {
                    // Types already exclude vault; the cast simulates an untyped caller to prove the runtime refusal.
                    const vault = { ...binding, profile: 'vault' } as unknown as RecordBinding;
                    expect((yield* Effect.flip(sealRecord(vault, kek, secret))).reason).toBe('invalid');
                    const sealed = yield* sealRecord(binding, kek, secret);
                    expect((yield* Effect.flip(openRecord({ ...sealed, iv: 'AAAA' }))).reason).toBe('invalid');
                    expect(
                        (yield* Effect.flip(sealRecord(binding, kek, secret).pipe(Effect.provide(CryptoUnavailable))))
                            .reason
                    ).toBe('unavailable');
                    expect(
                        (yield* Effect.flip(openRecord(sealed).pipe(Effect.provide(CryptoUnavailable)))).reason
                    ).toBe('unavailable');
                }
            ).pipe(Effect.provide(layer([])))
    );

    it.effect(
        'refuses a KMS that returns a wrong-sized data key',
        /** Check that it refuses a KMS that returns a wrong-sized data key. */ () =>
            Effect.gen(
                /** Probe wrong key sizes separately on seal and on opening an otherwise valid envelope. */ function* () {
                    // Build the read control with a correct KMS; a bad initial seal must not conceal missing unwrap validation.
                    const short = Layer.succeed(KeyManagement, {
                        /** Return a 128-bit key where the profile requires 256 bits. */ generateDataKey: () =>
                            Effect.succeed({ plaintext: new Uint8Array(16), wrapped: new Uint8Array(1) }),
                        /** Unwrap to a 128-bit key where the profile requires 256 bits. */ unwrapDataKey: () =>
                            Effect.succeed(new Uint8Array(16)),
                    });
                    expect(
                        (yield* Effect.flip(sealRecord(binding, kek, secret).pipe(Effect.provide(short)))).reason
                    ).toBe('invalid');
                    const sealed = yield* sealRecord(binding, kek, secret).pipe(Effect.provide(layer([])));
                    expect((yield* Effect.flip(openRecord(sealed).pipe(Effect.provide(short)))).reason).toBe('decrypt');
                }
            )
    );
});

describe('Ed25519 M2 signed requests', /** Group the Ed25519 M2 signed requests cases. */ () => {
    const sender = edKey(20, 'tenant.gateway', 'request');
    const other = edKey(21, 'other.gateway', 'request');
    const revoked = edKey(22, 'tenant.gateway', 'request', { revoked: true });
    const evidenceKey = edKey(23, 'tenant.gateway', 'evidence-identity');
    const future = edKey(24, 'tenant.gateway', 'request', { notBefore: NOW + 1 });
    const payload = new TextEncoder().encode('{"enc":"sealed rfp"}');
    /** Claims for one request from `key`, issued at NOW. */
    const claims = (key: FixtureKey, overrides: Partial<SignedRequestClaims> = {}): SignedRequestClaims => ({
        version: 'eventiva.m2.v1',
        alg: 'Ed25519',
        keyId: key.id,
        keyVersion: 1,
        sender: 'tenant.gateway',
        audience: 'marketplace.cell',
        tenant: uuid(1) as SignedRequestClaims['tenant'],
        scope: uuid(30),
        action: 'rfp.send',
        idempotencyKey: uuid(31),
        nonce: uuid(32),
        issuedAt: NOW,
        expiresAt: NOW + 300_000,
        payloadDigest: payloadDigest(payload),
        ...overrides,
    });
    const keys = layer([sender, other, revoked, evidenceKey, future]);
    const expected = { audience: 'marketplace.cell', now: NOW + 1_000 };

    it.effect(
        'accepts an exact signed request and returns its claims',
        /** Check that it accepts an exact signed request and returns its claims. */ () =>
            Effect.gen(
                /** Check Ed25519 signature size and exact claims returned by request authentication. */ function* () {
                    // Exact claim equality ensures successful verification does not rewrite the signed authorization context.
                    const signed = yield* signRequest(claims(sender));
                    expect(Buffer.from(signed.signature, 'base64url').length).toBe(64);
                    expect(yield* verifyRequest(signed, payload, expected)).toEqual(claims(sender));
                }
            ).pipe(Effect.provide(keys))
    );

    /** One request mutation: who signs, what is claimed, what is checked and what is altered after signing. */
    interface Case {
        readonly key?: FixtureKey;
        readonly claims?: Partial<SignedRequestClaims>;
        readonly expected?: Partial<typeof expected>;
        readonly body?: Uint8Array;
        readonly after?: 'action' | 'foreign-signature' | 'key-version' | 'malformed';
    }
    /** Each case breaks exactly one binding and names the reason the verifier must report. */
    const cases: ReadonlyArray<[string, CryptoFailure['reason'], Case]> = [
        ['altered action after signing', 'signature', { after: 'action' }],
        ['signature from another service key', 'signature', { after: 'foreign-signature' }],
        ['wrong audience', 'binding', { expected: { audience: 'x.y' } }],
        ['changed payload', 'binding', { body: new TextEncoder().encode('{}') }],
        ['expired', 'stale', { expected: { now: NOW + 330_000 } }],
        ['lifetime above five minutes', 'stale', { claims: { expiresAt: NOW + 300_001 } }],
        ['issued beyond clock skew', 'stale', { claims: { issuedAt: NOW + 40_000, expiresAt: NOW + 100_000 } }],
        ['revoked key', 'revoked', { key: revoked }],
        ['key owned by another service', 'binding', { key: other }],
        ['evidence key used for a request', 'binding', { key: evidenceKey }],
        ['issued before the key was valid', 'stale', { key: future }],
        ['unknown key version', 'unavailable', { after: 'key-version' }],
        ['malformed envelope', 'invalid', { after: 'malformed' }],
    ];
    it.effect.each(cases)(
        'refuses %s with %s',
        /** Sign as the case says, apply its post-signing change, and expect exactly its refusal reason. */ ([
            ,
            reason,
            c,
        ]) =>
            Effect.gen(
                /** Build the presented request, then verify it against the case's expectations. */ function* () {
                    const signed = yield* signRequest(claims(c.key ?? sender, c.claims));
                    const foreign = yield* signRequest(claims(other, { sender: 'other.gateway' }));
                    // Post-signing changes model an attacker who can edit bytes but not re-sign them.
                    const presented: unknown =
                        c.after === 'action'
                            ? { ...signed, claims: { ...signed.claims, action: 'rfp.cancel' } }
                            : c.after === 'foreign-signature'
                              ? { ...signed, signature: foreign.signature }
                              : c.after === 'key-version'
                                ? { ...signed, claims: { ...signed.claims, keyVersion: 2 } }
                                : c.after === 'malformed'
                                  ? { claims: {} }
                                  : signed;
                    const failure = yield* Effect.flip(
                        verifyRequest(presented as SignedRequest, c.body ?? payload, { ...expected, ...c.expected })
                    );
                    expect(failure).toEqual(new CryptoFailure({ reason }));
                }
            ).pipe(Effect.provide(keys))
    );
});

describe('signed evidence gates with trustPreflight', /** Register independent gate-signature checks composed with metadata-only trust preflight. */ () => {
    // Distinct service keys make a valid signature from the wrong gate distinguishable from approved evidence.
    const gates = ['identity', 'resource', 'workload', 'broker'] as const;
    const verifiers = gates.map(
        /** Give each gate its own verifier service and evidence key. */ (gate, i) =>
            edKey(40 + i, `verifier.${gate}`, `evidence-${gate}`)
    );
    const request: TrustRequest = {
        scope: {
            tenant: uuid(1) as TrustRequest['scope']['tenant'],
            subject: uuid(2) as TrustRequest['scope']['subject'],
            audience: 'marketplace.cell',
            resource: 'marketplace.quote',
            resourceId: uuid(3),
            purpose: 'quote.compare',
            profile: 'restricted',
            operation: 'server-decrypt',
        },
        nonce: uuid(4),
        keys: {
            root: uuid(5),
            signingAuthority: uuid(6),
            encryptionAuthority: uuid(7),
            kek: uuid(50),
            kekVersion: 1,
            dek: uuid(51),
            dekVersion: 1,
        },
    };
    const policy = trustPolicyAt(NOW, 'A4');
    /** Evidence for one gate issued `age` ms before NOW. */
    const evidence = (gate: TrustEvidence['gate'], age = 1_000): TrustEvidence => ({
        gate,
        request,
        reference: uuid(60 + gates.indexOf(gate)),
        issuedAt: NOW - age,
        expiresAt: NOW + 60_000,
        revocationCheckedAt: NOW - age,
        assurance: 'A4',
    });
    /** Fake remote verifier returning signed evidence for one gate. */
    type Remote = (gate: TrustEvidence['gate']) => Effect.Effect<unknown, never, SigningKeys>;
    /** Compose the four signed gates from a fake remote verifier plus an atomic replay fixture. */
    const compose = (remote: Remote) =>
        Effect.gen(
            /** Build the four signed gate layers plus a replay fixture. */ function* () {
                // Capture signing dependencies while retaining each gate's expected service identity in its verification port.
                const signing = yield* SigningKeys;
                const ports = yield* Effect.all(
                    gates.map(
                        /** Adapt each gate with its expected verifier service. */ (gate) =>
                            signedEvidenceGate(
                                gate,
                                `verifier.${gate}`,
                                /** Fetch this gate's evidence from the fake remote verifier. */ () =>
                                    remote(gate).pipe(Effect.provideService(SigningKeys, signing)) as never
                            )
                    )
                );
                const [identity, resource, workload, broker] = ports as [never, never, never, never];
                return Layer.mergeAll(
                    Layer.succeed(IdentityGate, identity),
                    Layer.succeed(ResourceGate, resource),
                    Layer.succeed(WorkloadGate, workload),
                    Layer.succeed(BrokerGate, broker),
                    Layer.succeed(TrustReplay, {
                        /** Accept the nonce once; replay storage is covered elsewhere. */ consume: () =>
                            Effect.succeed(uuid(70)),
                    })
                );
            }
        );
    /** Sign evidence for `gate` with the key of `signer`. */
    const signed = (gate: TrustEvidence['gate'], signer = gate, age?: number) =>
        signEvidence(evidence(gate, age), verifiers[gates.indexOf(signer)]!.id, 1).pipe(Effect.orDie);
    const keys = layer(verifiers);

    it.effect(
        'accepts four independently signed, fresh A4 gates as metadata preflight only',
        /** Check that it accepts four independently signed, fresh A4 gates as metadata preflight only. */ () =>
            Effect.gen(
                /** Require independently valid evidence without turning metadata preflight into decryption authorization. */ function* () {
                    // All four gates may pass while release remains denied; authentication alone grants no key custody.
                    const ports = yield* compose(
                        /** Every gate returns its own correctly signed evidence. */ (gate) => signed(gate)
                    );
                    const result = yield* trustPreflight(request, policy).pipe(Effect.provide(ports));
                    expect(result.release).toBe('denied');
                    expect(result.audit.identity).toBe(uuid(60));
                }
            ).pipe(Effect.provide(keys))
    );

    it.effect(
        'refuses evidence signed by another gate service, tampered evidence and stale broker evidence',
        /** Check that it refuses evidence signed by another gate service, tampered evidence and stale broker evidence. */ () =>
            Effect.gen(
                /** Run the scenario steps in order inside the provided layer. */ function* () {
                    const crossGate = yield* compose(
                        /** Identity evidence is signed by the workload verifier. */ (gate) =>
                            gate === 'identity' ? signed('identity', 'workload') : signed(gate)
                    );
                    expect(yield* Effect.flip(trustPreflight(request, policy).pipe(Effect.provide(crossGate)))).toEqual(
                        new TrustFailure({ gate: 'identity', reason: 'binding' })
                    );
                    const tampered = yield* compose(
                        /** Workload evidence is edited after signing. */ (gate) =>
                            gate === 'workload'
                                ? signed('workload').pipe(
                                      Effect.map(
                                          /** Raise the assurance claim without re-signing. */ (s) => ({
                                              ...s,
                                              evidence: { ...s.evidence, assurance: 'A5' },
                                          })
                                      )
                                  )
                                : signed(gate)
                    );
                    expect(yield* Effect.flip(trustPreflight(request, policy).pipe(Effect.provide(tampered)))).toEqual(
                        new TrustFailure({ gate: 'workload', reason: 'invalid' })
                    );
                    // Broker evidence may be at most 60 seconds old under eventiva.trust.v1.
                    const stale = yield* compose(
                        /** Broker evidence is just over its 60-second maximum age. */ (gate) =>
                            gate === 'broker' ? signed('broker', 'broker', 61_000) : signed(gate)
                    );
                    expect(yield* Effect.flip(trustPreflight(request, policy).pipe(Effect.provide(stale)))).toEqual(
                        new TrustFailure({ gate: 'broker', reason: 'stale' })
                    );
                    const relabelled = yield* compose(
                        /** Resource gate is handed identity evidence. */ (gate) =>
                            gate === 'resource' ? signed('identity', 'identity') : signed(gate)
                    );
                    expect(
                        yield* Effect.flip(trustPreflight(request, policy).pipe(Effect.provide(relabelled)))
                    ).toEqual(new TrustFailure({ gate: 'resource', reason: 'binding' }));
                }
            ).pipe(Effect.provide(keys))
    );
});
