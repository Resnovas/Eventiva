/**
 * @file packages/integrations/trust.server/src/crypto.ts
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
    createCipheriv,
    createDecipheriv,
    createHash,
    createPublicKey,
    randomBytes,
    randomUUID,
    verify,
} from 'node:crypto';
import {
    TrustEvidence,
    TrustFailure,
    type TrustGate,
    type TrustPolicy,
    type TrustRequest,
    type TrustVerifier,
} from '@eventiva/contracts/trust';
import {
    CryptoFailure,
    type DirectoryKey,
    EncryptedRecord,
    type KekReference,
    KeyManagement,
    type KeyPurpose,
    type RecordBinding,
    SignedEvidence,
    SignedRequest,
    type SignedRequestClaims,
    SigningKeys,
    TrustDirectory,
    canonicalize,
    requestWindowValid,
    signingInput,
    trustProfile,
} from '@eventiva/contracts/trust-profile';
import { Effect, Schema } from 'effect';

/**
 * Construct a closed crypto refusal.
 *
 * @param reason - The closed refusal reason.
 * @returns The refusal, carrying nothing but the reason.
 */
const fail = (reason: CryptoFailure['reason']) => new CryptoFailure({ reason });
/**
 * Encode bytes as unpadded base64url, the envelope's only binary encoding.
 *
 * @param bytes - The raw bytes.
 * @returns Their unpadded base64url text.
 */
const b64 = (bytes: Uint8Array): string => Buffer.from(bytes).toString('base64url');
/**
 * Decode unpadded base64url previously checked by a schema pattern.
 *
 * @param text - Schema-checked base64url text.
 * @returns The decoded bytes.
 */
const bytes = (text: string): Uint8Array => Buffer.from(text, 'base64url');
/**
 * UTF-8 bytes of a domain-separated signing text.
 *
 * @param text - The signing text.
 * @returns Its UTF-8 encoding.
 */
const utf8 = (text: string): Uint8Array => Buffer.from(text, 'utf8');
/**
 * Strictly decode untrusted input, hiding schema diagnostics behind `invalid`.
 *
 * @template A - The decoded type.
 * @template I - The encoded type.
 * @param schema - The schema to decode with; excess properties are rejected.
 * @param input - The untrusted value.
 * @returns An Effect yielding the decoded value, or failing with the `invalid` refusal.
 */
const decode = <A, I>(schema: Schema.Schema<A, I>, input: NoInfer<A>) =>
    Schema.decodeUnknown(schema)(input, { onExcessProperty: 'error' }).pipe(
        Effect.mapError(
            /**
             * Do not leak parse details across the trust boundary.
             *
             * @returns The `invalid` refusal.
             */
            () => fail('invalid')
        )
    );

/**
 * SHA-256 of the exact payload bytes, base64url-encoded, for `SignedRequestClaims.payloadDigest`.
 *
 * @since 0.0.1
 * @param payload - The exact request payload bytes.
 * @returns The digest as unpadded base64url.
 * @example
 * const digest = payloadDigest(new TextEncoder().encode(body));
 */
export const payloadDigest = (payload: Uint8Array): string => b64(createHash('sha256').update(payload).digest());

/**
 * Header fields authenticated as AES-GCM additional data and, with the DEK id, as the KMS encryption context.
 *
 * @param binding - The tenant, record, version and profile the ciphertext belongs to.
 * @param kek - The key-encryption key reference.
 * @param dek - The data key identifier.
 * @returns An Effect yielding the RFC 8785 canonical header text.
 */
const header = (binding: RecordBinding, kek: KekReference, dek: string) =>
    canonicalize({ version: 'eventiva.envelope.v1', enc: 'A256GCM', binding: { ...binding }, kek: { ...kek }, dek });

/**
 * Seal one record version under a fresh KMS-generated 256-bit DEK with AES-256-GCM.
 * The header is bound as additional data, so moving ciphertext to another tenant, record,
 * version or profile fails authentication. Vault bindings are refused by schema. Each seal uses a fresh DEK id, so
 * re-encrypting a record version never reuses a data key, and the local DEK copies are zeroed whatever the outcome.
 *
 * @since 0.0.1
 * @param binding - The tenant, record, version and profile to bind the ciphertext to.
 * @param kek - The key-encryption key that wraps the data key.
 * @param plaintext - The record bytes to encrypt.
 * @returns An Effect yielding the encrypted record envelope.
 * @fails {CryptoFailure} With `invalid` for a bad binding or data key, or `unavailable` when encryption fails.
 * @example
 * const record = yield* sealRecord(binding, kek, new TextEncoder().encode(json));
 */
export const sealRecord = (binding: RecordBinding, kek: KekReference, plaintext: Uint8Array) =>
    Effect.gen(
        /** Decode the binding, obtain a context-bound DEK, encrypt, then drop the local DEK copy. */ function* () {
            const checked = yield* decode(EncryptedRecord.fields.binding, binding);
            const kekRef = yield* decode(EncryptedRecord.fields.kek, kek);
            // A fresh DEK id per seal: re-encrypting a record version never reuses a data key.
            const dek = randomUUID();
            const context = yield* header(checked, kekRef, dek);
            const kms = yield* KeyManagement;
            const key = yield* kms.generateDataKey(kekRef, context);
            if (key.plaintext.length !== trustProfile.dekBytes) return yield* fail('invalid');
            const iv = randomBytes(trustProfile.ivBytes);
            const sealed = yield* Effect.try({
                /**
                 * Encrypt with a local DEK copy that is zeroed whatever the outcome.
                 *
                 * @returns The ciphertext and its authentication tag.
                 */
                // effect-boundary: Node's AES-GCM primitive throws on invalid key or IV state.
                try: () => {
                    const owned = Buffer.from(key.plaintext);
                    // effect-boundary: Release the DEK copies even when the cipher throws.
                    try {
                        const cipher = createCipheriv('aes-256-gcm', owned, iv, {
                            authTagLength: trustProfile.tagBytes,
                        });
                        cipher.setAAD(utf8(context));
                        const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
                        return { ciphertext, tag: cipher.getAuthTag() };
                    } finally {
                        // Clear our copies; the KMS-returned buffer belongs to the caller of this adapter.
                        owned.fill(0);
                        key.plaintext.fill(0);
                    }
                },
                /**
                 * Never retain the vendor error, which may describe key state.
                 *
                 * @returns The `unavailable` refusal.
                 */
                catch: () => fail('unavailable'),
            });
            return yield* decode(EncryptedRecord, {
                version: 'eventiva.envelope.v1',
                enc: 'A256GCM',
                binding: checked,
                kek: kekRef,
                dek,
                wrappedDek: b64(key.wrapped),
                iv: b64(iv),
                tag: b64(sealed.tag),
                ciphertext: b64(sealed.ciphertext),
            });
        }
    );

/**
 * Open a sealed record. The KMS unwraps the DEK only for the exact KEK version and header context;
 * any header, IV, tag or ciphertext change fails `decrypt`. Callers must run the four EVE-13 release
 * gates before calling this: opening is the release, not its authorization.
 *
 * @since 0.0.1
 * @param input - The encrypted record envelope.
 * @returns An Effect yielding the decrypted record bytes.
 * @fails {CryptoFailure} With `invalid` for a malformed envelope, or `decrypt` for tampering or a wrong key.
 * @example
 * const plaintext = yield* openRecord(record);
 */
export const openRecord = (input: EncryptedRecord) =>
    Effect.gen(
        /** Validate the envelope, unwrap its DEK under the bound context, then authenticate and decrypt. */ function* () {
            const record = yield* decode(EncryptedRecord, input);
            const context = yield* header(record.binding, record.kek, record.dek);
            const kms = yield* KeyManagement;
            const dek = yield* kms.unwrapDataKey(record.kek, bytes(record.wrappedDek), context);
            if (dek.length !== trustProfile.dekBytes) return yield* fail('decrypt');
            return yield* Effect.try({
                /**
                 * Authenticate and decrypt with a local DEK copy that is zeroed whatever the outcome.
                 *
                 * @returns The decrypted record bytes.
                 */
                // effect-boundary: Node's AES-GCM final() throws when the authentication tag does not verify.
                try: () => {
                    const owned = Buffer.from(dek);
                    // effect-boundary: Release the DEK copies even when tag verification throws.
                    try {
                        const decipher = createDecipheriv('aes-256-gcm', owned, bytes(record.iv), {
                            authTagLength: trustProfile.tagBytes,
                        });
                        decipher.setAAD(utf8(context));
                        decipher.setAuthTag(bytes(record.tag));
                        return new Uint8Array(
                            Buffer.concat([decipher.update(bytes(record.ciphertext)), decipher.final()])
                        );
                    } finally {
                        owned.fill(0);
                        dek.fill(0);
                    }
                },
                /**
                 * Report tampering or a wrong key identically, without the vendor message.
                 *
                 * @returns The `decrypt` refusal.
                 */
                catch: () => fail('decrypt'),
            });
        }
    );

/**
 * Verify a raw Ed25519 signature against a 32-byte public key from the trust directory.
 *
 * @param publicKey - The directory's base64url public key.
 * @param message - The domain-separated signed bytes.
 * @param signature - The base64url signature.
 * @returns An Effect that succeeds only for a valid signature.
 * @fails {CryptoFailure} With `signature` for a malformed key or a rejected signature.
 */
const ed25519 = (publicKey: string, message: Uint8Array, signature: string) =>
    Effect.try({
        /**
         * Import the directory key and run Node's Ed25519 verification.
         *
         * @returns Whether the signature verifies.
         */
        // effect-boundary: Node's key import throws on a malformed public key.
        try: () =>
            verify(
                null,
                message,
                createPublicKey({ key: { kty: 'OKP', crv: 'Ed25519', x: publicKey }, format: 'jwk' }),
                bytes(signature)
            ),
        /**
         * A malformed directory key is a signature failure, never an acceptance.
         *
         * @returns The `signature` refusal.
         */
        catch: () => fail('signature'),
    }).pipe(
        Effect.filterOrFail(
            /**
             * Accept only a verified signature.
             *
             * @param ok - Whether verification succeeded.
             * @returns The same value, so only `true` passes.
             */
            (ok) => ok,
            /**
             * Report a rejected signature with the closed signature reason.
             *
             * @returns The `signature` refusal.
             */
            () => fail('signature')
        )
    );

/**
 * Resolve a directory key and check it was valid for this purpose and service when the document was issued.
 *
 * @param keyId - The key identifier from the signed document.
 * @param keyVersion - The key version from the signed document.
 * @param purpose - The purpose the key must have.
 * @param service - The service that must own the key.
 * @param issuedAt - When the document was issued, in epoch milliseconds.
 * @returns An Effect yielding the directory key.
 * @fails {CryptoFailure} With `binding`, `revoked` or `stale`.
 */
const usableKey = (keyId: string, keyVersion: number, purpose: KeyPurpose, service: string, issuedAt: number) =>
    Effect.gen(
        /** Look up public metadata and refuse revoked, out-of-window or cross-purpose keys. */ function* () {
            // A directory hit alone is insufficient: identity, purpose, service and issuance-time validity must all bind.
            const directory = yield* TrustDirectory;
            const key: DirectoryKey = yield* directory.key(keyId, keyVersion);
            if (key.keyId.toLowerCase() !== keyId.toLowerCase() || key.keyVersion !== keyVersion)
                return yield* fail('binding');
            if (key.revoked) return yield* fail('revoked');
            if (key.purpose !== purpose || key.service !== service) return yield* fail('binding');
            if (issuedAt < key.notBefore || issuedAt >= key.notAfter) return yield* fail('stale');
            return key;
        }
    );

/**
 * Sign M2 request claims with the sender's KMS-held Ed25519 request key over their RFC 8785 form, in the request
 * signing domain so evidence signatures cannot be substituted.
 *
 * @since 0.0.1
 * @param claims - The request claims to sign.
 * @returns An Effect yielding the signed request.
 * @fails {CryptoFailure} With `invalid` when the claims do not decode.
 * @example
 * const signed = yield* signRequest({ ...claims, payloadDigest: payloadDigest(body) });
 */
export const signRequest = (claims: SignedRequestClaims) =>
    Effect.gen(
        /** Validate claims, canonicalize them and obtain a KMS signature. */ function* () {
            // Sign the validated canonical claims with the request domain so evidence signatures cannot be substituted.
            const checked = yield* decode(SignedRequest.fields.claims, claims);
            const canonical = yield* canonicalize({ ...checked });
            const signer = yield* SigningKeys;
            const signature = yield* signer.sign(
                checked.keyId,
                checked.keyVersion,
                utf8(signingInput('eventiva.m2.v1', canonical))
            );
            return yield* decode(SignedRequest, { claims: checked, signature: b64(signature) });
        }
    );

/**
 * Verify an M2 request for this service: lifetime and skew window, exact audience, payload digest
 * and an unrevoked request key owned by the claimed sender. Nonce consumption is the caller's next
 * step through the existing `TrustReplay` store; this function never marks a request as used. Stale or misbound
 * requests are refused before any directory lookup or signature work.
 *
 * @since 0.0.1
 * @param input - The signed request.
 * @param payload - The exact payload bytes received with it.
 * @param expected - This service's audience and the current time in epoch milliseconds.
 * @param expected.audience - This service's audience identifier.
 * @param expected.now - The current time in epoch milliseconds.
 * @returns An Effect yielding the verified claims.
 * @fails {CryptoFailure} With `invalid`, `stale`, `binding`, `revoked` or `signature`.
 * @example
 * const claims = yield* verifyRequest(signed, body, { audience: 'eventiva.api', now: Date.now() });
 */
export const verifyRequest = (input: SignedRequest, payload: Uint8Array, expected: { audience: string; now: number }) =>
    Effect.gen(
        /** Check cheap structural bindings before the directory lookup and signature verification. */ function* () {
            // Refuse stale or misbound requests before cryptographic work; replay consumption remains the dispatcher's job.
            const request = yield* decode(SignedRequest, input);
            const { claims } = request;
            if (!requestWindowValid(claims, expected.now)) return yield* fail('stale');
            if (claims.audience !== expected.audience || claims.payloadDigest !== payloadDigest(payload))
                return yield* fail('binding');
            const key = yield* usableKey(claims.keyId, claims.keyVersion, 'request', claims.sender, claims.issuedAt);
            const canonical = yield* canonicalize({ ...claims });
            yield* ed25519(key.publicKey, utf8(signingInput('eventiva.m2.v1', canonical)), request.signature);
            return claims;
        }
    );

/**
 * Sign one gate's evidence with that verifier's own evidence key, in the evidence signing domain so the bytes cannot
 * be confused with transport-request claims.
 *
 * @since 0.0.1
 * @param evidence - The gate's evidence.
 * @param keyId - The verifier's evidence key identifier.
 * @param keyVersion - Which rotation of that key signs; the directory must still list it as unrevoked.
 * @returns An Effect yielding the signed evidence.
 * @fails {CryptoFailure} With `invalid` when the evidence does not decode.
 * @example
 * const signed = yield* signEvidence(evidence, 'verifier-a', 1);
 */
export const signEvidence = (evidence: TrustEvidence, keyId: string, keyVersion: number) =>
    Effect.gen(
        /** Validate evidence, canonicalize it and obtain a KMS signature. */ function* () {
            // The evidence domain separates these signed bytes from otherwise similar transport-request claims.
            const checked = yield* decode(TrustEvidence, evidence);
            const canonical = yield* canonicalize(checked);
            const signer = yield* SigningKeys;
            const signature = yield* signer.sign(
                keyId,
                keyVersion,
                utf8(signingInput('eventiva.evidence.v1', canonical))
            );
            return yield* decode(SignedEvidence, { evidence: checked, keyId, keyVersion, signature: b64(signature) });
        }
    );

/**
 * Map crypto refusals onto the closed trust-failure vocabulary; a bad signature is invalid evidence.
 *
 * @param gate - The trust gate the refusal belongs to.
 * @param failure - The crypto refusal.
 * @returns The trust failure for that gate.
 */
const asTrust = (gate: TrustGate, failure: CryptoFailure) =>
    new TrustFailure({
        gate,
        reason: failure.reason === 'signature' || failure.reason === 'decrypt' ? 'invalid' : failure.reason,
    });

/**
 * Adapt a verifier service's signed evidence into a `TrustVerifier` for one gate. Evidence counts only
 * when signed by an unrevoked `evidence-<gate>` key of exactly `service`, valid at issuance. Compose a
 * different service per gate so one compromised verifier cannot satisfy two gates. Binding, freshness
 * and assurance checks stay in `trustPreflight`.
 *
 * @since 0.0.1
 * @param gate - The gate this verifier speaks for.
 * @param service - The only service whose evidence key may sign for this gate.
 * @param source - Fetches this gate's signed evidence for a request from the remote verifier.
 * @returns An Effect yielding the gate's verifier, with the trust directory captured.
 * @example
 * const approval = yield* signedEvidenceGate('approval', 'approvals.verifier', fetchApproval);
 */
export const signedEvidenceGate = (
    gate: TrustEvidence['gate'],
    service: string,
    /** Obtain this gate's signed evidence for the exact request from the remote verifier. */
    source: (request: TrustRequest, policy: TrustPolicy) => Effect.Effect<SignedEvidence, TrustFailure>
): Effect.Effect<TrustVerifier, never, TrustDirectory> =>
    Effect.map(
        TrustDirectory,
        /**
         * Capture the directory so the verifier has no outstanding requirements.
         *
         * @param directory - The trust directory.
         * @returns The verifier.
         */
        (directory): TrustVerifier => ({
            /**
             * Fetch, authenticate and return evidence; preflight then checks binding and freshness.
             *
             * @param request - The request being authorized.
             * @param policy - The trust policy in force.
             * @returns An Effect yielding the authenticated evidence.
             */
            verify: (request, policy) =>
                Effect.gen(
                    /** Refuse unsigned, cross-gate or foreign-service evidence before preflight sees it. */ function* () {
                        // Authenticate this gate's evidence here; the separate preflight still owns freshness and request binding.
                        const signed = yield* source(request, policy);
                        const checked = yield* decode(SignedEvidence, signed);
                        if (checked.evidence.gate !== gate) return yield* fail('binding');
                        const key = yield* usableKey(
                            checked.keyId,
                            checked.keyVersion,
                            `evidence-${gate}`,
                            service,
                            checked.evidence.issuedAt
                        );
                        const canonical = yield* canonicalize(checked.evidence);
                        yield* ed25519(
                            key.publicKey,
                            utf8(signingInput('eventiva.evidence.v1', canonical)),
                            checked.signature
                        );
                        return checked.evidence;
                    }
                ).pipe(
                    Effect.provideService(TrustDirectory, directory),
                    Effect.mapError(
                        /**
                         * Keep source TrustFailures as-is and translate crypto refusals for this gate.
                         *
                         * @param error - The source's trust failure or a crypto refusal.
                         * @returns The trust failure for this gate.
                         */
                        (error) => (error instanceof CryptoFailure ? asTrust(gate, error) : error)
                    )
                ),
        })
    );
