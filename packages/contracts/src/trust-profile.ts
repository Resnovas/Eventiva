/**
 * @file packages/contracts/src/trust-profile.ts
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

import { type Cause, Context, Data, Effect, Layer, Schema } from 'effect';
import { TenantId } from './ids.ts';
import { SecurityProfile } from './security.ts';
import { type Assurance, TrustEvidence, type TrustPolicy } from './trust.ts';

/**
 * Concrete EVE-251 trust profile `eventiva.trust.v1`, approved by Jonathan on
 * 2026-11-18 (see docs/planning/decisions.md, "Concrete trust and marketplace
 * parameters"). Every value here is a sealed core choice: modules and tenants may
 * shorten windows or raise floors in their own policy, never relax them.
 */
export const trustProfile = {
    version: 'eventiva.trust.v1',
    /** RFC 8032 pure Ed25519 for service requests and verifier evidence. */
    signature: 'Ed25519',
    /** RFC 8785 JSON Canonicalization Scheme for every signed document. */
    canonicalization: 'RFC8785-JCS',
    digest: 'SHA-256',
    /** AES-256-GCM content encryption with a unique DEK per record version. */
    content: 'A256GCM',
    dekBytes: 32,
    ivBytes: 12,
    tagBytes: 16,
    /** Maximum signed-request lifetime and tolerated clock skew. */
    requestLifetimeMs: 300_000,
    clockSkewMs: 30_000,
    /** Oldest acceptable live verification per independent gate. */
    evidenceMaxAgeMs: { identity: 300_000, resource: 300_000, workload: 900_000, broker: 60_000 },
    /** Service-side permission/key-handle caches must observe revocation within this bound. */
    revocationPropagationMs: 60_000,
    /** Offline devices may show cached grants this long; they never authorize new staging offline. */
    offlineGrantCacheMs: 900_000,
    rotation: { signingKeyDays: 90, signingOverlapDays: 7, kekDays: 90, intermediateDays: 365, rootYears: 5 },
    custody: {
        rootQuorum: 3,
        rootCustodians: 5,
        kekAdministrationApprovals: 2,
        kekProtection: 'hsm-backed-kms-fips-140-3-level-3-non-exportable',
    },
} as const;

const strict = { parseOptions: { onExcessProperty: 'error' as const } };
const Time = Schema.Int.pipe(Schema.between(0, Number.MAX_SAFE_INTEGER));
const Version = Schema.Int.pipe(Schema.between(1, Number.MAX_SAFE_INTEGER));
const Name = Schema.String.pipe(Schema.pattern(/^[a-z][a-z0-9-]*(\.[a-z0-9-]+)*$/), Schema.maxLength(128));
/** Unpadded base64url of an exact byte length, so truncated or padded encodings are refused before crypto runs. */
const Bytes = (length: number) =>
    Schema.String.pipe(Schema.pattern(new RegExp(`^[A-Za-z0-9_-]{${Math.ceil((length * 4) / 3)}}$`)));
const Base64Url = Schema.String.pipe(Schema.pattern(/^[A-Za-z0-9_-]*$/), Schema.maxLength(16_777_216));

/** Versioned reference to a KMS-held key-encryption key. The key itself never leaves the KMS. */
export const KekReference = Schema.Struct({ kek: Schema.UUID, kekVersion: Version }).annotations(strict);
export type KekReference = typeof KekReference.Type;

/** Record identity bound into AES-GCM additional data and the KMS encryption context. Vault stays client-side. */
export const RecordBinding = Schema.Struct({
    tenant: TenantId,
    resource: Name,
    recordId: Schema.UUID,
    recordVersion: Version,
    profile: SecurityProfile.pipe(
        Schema.filter(
            /** Refuse vault records: zero-knowledge data must never become server-decryptable. */ (profile) =>
                profile !== 'vault'
        )
    ),
}).annotations(strict);
export type RecordBinding = typeof RecordBinding.Type;

/** One sealed record version. The header is authenticated; only the ciphertext is confidential. */
export const EncryptedRecord = Schema.Struct({
    version: Schema.Literal('eventiva.envelope.v1'),
    enc: Schema.Literal('A256GCM'),
    binding: RecordBinding,
    kek: KekReference,
    dek: Schema.UUID,
    wrappedDek: Base64Url,
    iv: Bytes(12),
    tag: Bytes(16),
    ciphertext: Base64Url,
}).annotations(strict);
export type EncryptedRecord = typeof EncryptedRecord.Type;

/** The signed M2 request header. `payloadDigest` is SHA-256 of the exact envelope bytes sent. */
export const SignedRequestClaims = Schema.Struct({
    version: Schema.Literal('eventiva.m2.v1'),
    alg: Schema.Literal('Ed25519'),
    keyId: Schema.UUID,
    keyVersion: Version,
    sender: Name,
    audience: Name,
    tenant: TenantId,
    scope: Schema.UUID,
    action: Name,
    idempotencyKey: Schema.UUID,
    nonce: Schema.UUID,
    issuedAt: Time,
    expiresAt: Time,
    payloadDigest: Bytes(32),
}).annotations(strict);
export type SignedRequestClaims = typeof SignedRequestClaims.Type;
export const SignedRequest = Schema.Struct({ claims: SignedRequestClaims, signature: Bytes(64) }).annotations(strict);
export type SignedRequest = typeof SignedRequest.Type;

/** Verifier evidence with a detached Ed25519 signature by the gate's own evidence key. */
export const SignedEvidence = Schema.Struct({
    evidence: TrustEvidence,
    keyId: Schema.UUID,
    keyVersion: Version,
    signature: Bytes(64),
}).annotations(strict);
export type SignedEvidence = typeof SignedEvidence.Type;

/** Each signing key has exactly one purpose, so a request key cannot vouch for evidence and vice versa. */
export const KeyPurpose = Schema.Literal(
    'request',
    'evidence-identity',
    'evidence-resource',
    'evidence-workload',
    'evidence-broker'
);
export type KeyPurpose = typeof KeyPurpose.Type;
/** Public verification metadata from the region's trust directory; never private key material. */
export const DirectoryKey = Schema.Struct({
    keyId: Schema.UUID,
    keyVersion: Version,
    service: Name,
    purpose: KeyPurpose,
    publicKey: Bytes(32),
    notBefore: Time,
    notAfter: Time,
    revoked: Schema.Boolean,
}).annotations(strict);
export type DirectoryKey = typeof DirectoryKey.Type;

/** Closed failure vocabulary for crypto boundaries; carries no key bytes, plaintext or vendor causes. */
interface CryptoFailureFields {
    readonly reason: 'invalid' | 'unavailable' | 'signature' | 'stale' | 'revoked' | 'binding' | 'decrypt' | 'vault';
}
/** Construct an exact yieldable crypto error without leaking the vendor's generic constructor type. */
const CryptoFailureBase: new (
    fields: CryptoFailureFields
) => Cause.YieldableError & CryptoFailureFields & { readonly _tag: 'CryptoFailure' } =
    Data.TaggedError('CryptoFailure');
/** Safe signing, verification, wrapping or decryption refusal. */
export class CryptoFailure extends CryptoFailureBase {}

/** A fresh data key: plaintext for one seal operation, plus its KMS-wrapped form for storage. */
export interface DataKey {
    readonly plaintext: Uint8Array;
    readonly wrapped: Uint8Array;
}
/** KMS-held KEKs. Implementations must bind `context` as the KMS encryption context and never export the KEK. */
export class KeyManagement extends Context.Tag('@eventiva/contracts/KeyManagement')<
    KeyManagement,
    {
        /** Generate a new 256-bit DEK under the exact KEK version, bound to the record context. */
        readonly generateDataKey: (kek: KekReference, context: string) => Effect.Effect<DataKey, CryptoFailure>;
        /** Unwrap a stored DEK only when KEK version and context match what wrapped it. */
        readonly unwrapDataKey: (
            kek: KekReference,
            wrapped: Uint8Array,
            context: string
        ) => Effect.Effect<Uint8Array, CryptoFailure>;
    }
>() {}
/** KMS-held non-exportable Ed25519 signing keys addressed by id and version. */
export class SigningKeys extends Context.Tag('@eventiva/contracts/SigningKeys')<
    SigningKeys,
    {
        /** Sign exact message bytes with the named key; the private key never leaves the KMS. */
        readonly sign: (
            keyId: string,
            keyVersion: number,
            message: Uint8Array
        ) => Effect.Effect<Uint8Array, CryptoFailure>;
    }
>() {}
/** Regional trust directory of public keys and revocation state, refreshed within the propagation bound. */
export class TrustDirectory extends Context.Tag('@eventiva/contracts/TrustDirectory')<
    TrustDirectory,
    {
        /** Return current public metadata for one key version; unknown keys fail rather than default. */
        readonly key: (keyId: string, keyVersion: number) => Effect.Effect<DirectoryKey, CryptoFailure>;
    }
>() {}
/** Safe default: no KMS, signer or directory is composed, so every crypto operation fails closed. */
export const CryptoUnavailable = Layer.mergeAll(
    Layer.succeed(KeyManagement, {
        /** Refuse to mint data keys without a provisioned KMS. */
        generateDataKey: () => Effect.fail(new CryptoFailure({ reason: 'unavailable' })),
        /** Refuse to unwrap data keys without a provisioned KMS. */
        unwrapDataKey: () => Effect.fail(new CryptoFailure({ reason: 'unavailable' })),
    }),
    Layer.succeed(SigningKeys, {
        /** Refuse to sign without a KMS-held key. */
        sign: () => Effect.fail(new CryptoFailure({ reason: 'unavailable' })),
    }),
    Layer.succeed(TrustDirectory, {
        /** Treat a missing directory as unknown keys. */
        key: () => Effect.fail(new CryptoFailure({ reason: 'unavailable' })),
    })
);

/** JSON values admitted for canonical signing: I-JSON with finite numbers only. */
export type CanonicalValue =
    string | number | boolean | null | ReadonlyArray<CanonicalValue> | { readonly [key: string]: CanonicalValue };

/** Reject lone surrogates, which RFC 8785 (I-JSON) forbids and which would serialize ambiguously. */
const wellFormed = (value: string): boolean =>
    !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(value);

/** RFC 8785 serialization, or undefined for any value outside the admitted subset. */
const jcs = (value: CanonicalValue): string | undefined => {
    if (value === null || typeof value === 'boolean') return JSON.stringify(value);
    // ECMAScript number serialization is exactly what RFC 8785 specifies; non-finite values have no JSON form.
    if (typeof value === 'number') return Number.isFinite(value) ? JSON.stringify(value) : undefined;
    if (typeof value === 'string') return wellFormed(value) ? JSON.stringify(value) : undefined;
    if (Array.isArray(value)) {
        const items = value.map(jcs);
        return items.every(
            /** Propagate any unsupported member as a whole-document refusal. */ (item) => item !== undefined
        )
            ? `[${items.join(',')}]`
            : undefined;
    }
    if (typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) return undefined;
    // RFC 8785 orders properties by UTF-16 code units, which is JavaScript string comparison.
    const parts: Array<string> = [];
    const entries = Object.entries(value).sort(
        /** Order by UTF-16 code units; keys are unique, so equality never occurs. */ ([a], [b]) => (a < b ? -1 : 1)
    );
    for (const [key, item] of entries) {
        const member = jcs(item);
        if (member === undefined || !wellFormed(key)) return undefined;
        parts.push(`${JSON.stringify(key)}:${member}`);
    }
    return `{${parts.join(',')}}`;
};

/** Canonicalize a document with RFC 8785, failing `invalid` for non-plain objects, lone surrogates or non-finite numbers. */
export const canonicalize = (value: CanonicalValue): Effect.Effect<string, CryptoFailure> =>
    Effect.suspend(
        /** Defer serialization so each evaluation canonicalizes the value as it is now. */ () => {
            // Invalid canonical input is a typed failure, never a signature over a substituted or partial representation.
            const text = jcs(value);
            return text === undefined ? Effect.fail(new CryptoFailure({ reason: 'invalid' })) : Effect.succeed(text);
        }
    );

/** Domain-separated signing text: a fixed label and newline, then the canonical document. Sign its UTF-8 bytes. */
export const signingInput = (domain: 'eventiva.m2.v1' | 'eventiva.evidence.v1', canonical: string): string =>
    `${domain}\n${canonical}`;

/** Build the approved trust policy at `now`: each gate's freshness floor is `now` minus its maximum evidence age. */
export const trustPolicyAt = (now: number, minimumAssurance: Assurance): TrustPolicy => {
    // All independent gates share one evaluation instant but retain their own evidence-age limits.
    /** Clamp at the epoch so early clocks never produce a negative, schema-invalid bound. */
    const floor = (gate: keyof typeof trustProfile.evidenceMaxAgeMs) =>
        Math.max(0, now - trustProfile.evidenceMaxAgeMs[gate]);
    return {
        now,
        freshAfter: {
            identity: floor('identity'),
            resource: floor('resource'),
            workload: floor('workload'),
            broker: floor('broker'),
        },
        minimumAssurance,
    };
};

/** Check a signed request's validity window: bounded lifetime, not issued in the future, not yet expired (both with skew). */
export const requestWindowValid = (claims: Pick<SignedRequestClaims, 'issuedAt' | 'expiresAt'>, now: number): boolean =>
    claims.expiresAt > claims.issuedAt &&
    claims.expiresAt - claims.issuedAt <= trustProfile.requestLifetimeMs &&
    claims.issuedAt <= now + trustProfile.clockSkewMs &&
    now < claims.expiresAt + trustProfile.clockSkewMs;
