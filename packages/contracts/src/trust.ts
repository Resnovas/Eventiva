/**
 * @file packages/contracts/src/trust.ts
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
import { SubjectId, TenantId } from './ids.ts';
import { SecurityProfile } from './security.ts';

const strict = { parseOptions: { onExcessProperty: 'error' as const } };
const Time = Schema.Int.pipe(Schema.between(0, Number.MAX_SAFE_INTEGER));
const Version = Schema.Int.pipe(Schema.between(1, Number.MAX_SAFE_INTEGER));
const Name = Schema.String.pipe(Schema.pattern(/^[a-z][a-z0-9-]*(\.[a-z0-9-]+)*$/), Schema.maxLength(128));

export const Assurance = Schema.Literal('A1', 'A2', 'A3', 'A4', 'A5');
export type Assurance = typeof Assurance.Type;
export const TrustGate = Schema.Literal('identity', 'resource', 'workload', 'broker', 'replay', 'preflight');
export type TrustGate = typeof TrustGate.Type;

/** Exact single-tenant target. No cross-tenant or hook-decryption operation exists here. */
export const TrustScope = Schema.Struct({
    tenant: TenantId,
    subject: SubjectId,
    audience: Name,
    resource: Name,
    resourceId: Schema.UUID,
    purpose: Name,
    profile: SecurityProfile,
    operation: Schema.Literal('metadata', 'server-decrypt'),
}).annotations(strict);
export type TrustScope = typeof TrustScope.Type;

/** Algorithm-agnostic immutable rotation identity; counters are not rotation schedules.
 * Root is deployment-owned and non-universal. References name metadata, never key material.
 * Signing and encryption authority must remain distinct. KEK is scoped by the enclosing
 * request's tenant/resource; DEK is scoped by its exact record. Providers verify that binding.
 */
export const TrustKeyVersion = Schema.Struct({
    root: Schema.UUID,
    signingAuthority: Schema.UUID,
    encryptionAuthority: Schema.UUID,
    kek: Schema.UUID,
    kekVersion: Version,
    dek: Schema.UUID,
    dekVersion: Version,
})
    .annotations(strict)
    .pipe(Schema.filter((v) => v.signingAuthority !== v.encryptionAuthority));
export type TrustKeyVersion = typeof TrustKeyVersion.Type;

export const TrustRequest = Schema.Struct({
    scope: TrustScope,
    nonce: Schema.UUID,
    keys: TrustKeyVersion,
}).annotations(strict);
export type TrustRequest = typeof TrustRequest.Type;

/** Opaque, access-controlled evidence reference, NOT a signature or cryptographic proof.
 * Only live trusted verifier ports may produce this metadata after verifying their own
 * independent gate, exact binding, authority, signature/attestation and current revocation.
 */
export const TrustEvidence = Schema.Struct({
    gate: Schema.Literal('identity', 'resource', 'workload', 'broker'),
    request: TrustRequest,
    reference: Schema.UUID,
    issuedAt: Time,
    expiresAt: Time,
    revocationCheckedAt: Time,
    assurance: Assurance,
}).annotations(strict);
export type TrustEvidence = typeof TrustEvidence.Type;

/** Trusted composition input, never caller-selected. Milliseconds since Unix epoch.
 * Each lower time bound is explicit; no max-age, skew or rotation default is selected.
 */
export const TrustPolicy = Schema.Struct({
    now: Time,
    freshAfter: Schema.Struct({ identity: Time, resource: Time, workload: Time, broker: Time }).annotations(strict),
    minimumAssurance: Assurance,
}).annotations(strict);
export type TrustPolicy = typeof TrustPolicy.Type;

interface TrustFailureFields {
    readonly gate: TrustGate;
    readonly reason:
        'invalid' | 'unavailable' | 'denied' | 'binding' | 'stale' | 'revoked' | 'replay' | 'assurance' | 'vault';
}
const TrustFailureBase: new (fields: TrustFailureFields) => Cause.YieldableError &
    TrustFailureFields & {
        readonly _tag: 'TrustFailure';
    } = Data.TaggedError('TrustFailure');
export class TrustFailure extends TrustFailureBase {}

/** Success is a live verified observation, not acceptance of caller-presented booleans.
 * Implementations must return their own gate label and sanitize all failures to TrustFailure.
 * Identity verifies delegation; resource verifies exact purpose permission; workload verifies
 * measured assurance; broker verifies current custody/key policy. No port releases a key.
 */
export interface TrustVerifier {
    readonly verify: (request: TrustRequest, policy: TrustPolicy) => Effect.Effect<TrustEvidence, TrustFailure>;
}
export class IdentityGate extends Context.Tag('@eventiva/contracts/IdentityGate')<IdentityGate, TrustVerifier>() {}
export class ResourceGate extends Context.Tag('@eventiva/contracts/ResourceGate')<ResourceGate, TrustVerifier>() {}
export class WorkloadGate extends Context.Tag('@eventiva/contracts/WorkloadGate')<WorkloadGate, TrustVerifier>() {}
export class BrokerGate extends Context.Tag('@eventiva/contracts/BrokerGate')<BrokerGate, TrustVerifier>() {}

/** Atomically consume a nonce once for the exact request, after all checks. Return only an
 * opaque audit receipt. Providers define approved persistence/retention and fail closed on
 * replay, revoked versions or unavailable storage; retries need a fresh authorized request.
 */
export class TrustReplay extends Context.Tag('@eventiva/contracts/TrustReplay')<
    TrustReplay,
    { readonly consume: (request: TrustRequest, policy: TrustPolicy) => Effect.Effect<string, TrustFailure> }
>() {}

/** Metadata only: there is deliberately no key, plaintext, handle, or usable release grant. */
export const TrustPreflight = Schema.Struct({
    decision: Schema.Literal('metadata-preflight-only'),
    release: Schema.Literal('denied'),
    audit: Schema.Struct({
        identity: Schema.UUID,
        resource: Schema.UUID,
        workload: Schema.UUID,
        broker: Schema.UUID,
        replay: Schema.UUID,
    }).annotations(strict),
}).annotations(strict);
export type TrustPreflight = typeof TrustPreflight.Type;

/** Safe wiring placeholder, not a production verifier. Missing ports also fail unavailable. */
export const TrustUnavailable = Layer.mergeAll(
    Layer.succeed(IdentityGate, {
        verify: () => Effect.fail(new TrustFailure({ gate: 'identity', reason: 'unavailable' })),
    }),
    Layer.succeed(ResourceGate, {
        verify: () => Effect.fail(new TrustFailure({ gate: 'resource', reason: 'unavailable' })),
    }),
    Layer.succeed(WorkloadGate, {
        verify: () => Effect.fail(new TrustFailure({ gate: 'workload', reason: 'unavailable' })),
    }),
    Layer.succeed(BrokerGate, {
        verify: () => Effect.fail(new TrustFailure({ gate: 'broker', reason: 'unavailable' })),
    }),
    Layer.succeed(TrustReplay, {
        consume: () => Effect.fail(new TrustFailure({ gate: 'replay', reason: 'unavailable' })),
    })
);
