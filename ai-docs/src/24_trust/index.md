# Provider-neutral trust preflight

Use `@eventiva/contracts/trust` for `Assurance`, `TrustGate`, `TrustScope`, `TrustKeyVersion`, `TrustRequest`, `TrustEvidence`, `TrustPolicy`, `TrustPreflight`, `TrustFailure`, `TrustVerifier`, the four gate tags, `TrustReplay` and `TrustUnavailable`. Use `@eventiva/runtime/trust` for `trustPreflight`.

```ts
import type { TrustPolicy, TrustRequest } from '@eventiva/contracts/trust';
import { TrustUnavailable } from '@eventiva/contracts/trust';
import { trustPreflight } from '@eventiva/runtime/trust';
import { Effect } from 'effect';

export const safePreflight = (request: TrustRequest, policy: TrustPolicy) =>
    trustPreflight(request, policy).pipe(Effect.provide(TrustUnavailable));
```

Signature: `trustPreflight(input: TrustRequest, trustedPolicy: TrustPolicy): Effect.Effect<TrustPreflight, TrustFailure>`. Required services are resolved with `Effect.serviceOption`; missing services return a typed `unavailable`, not a missing-service defect. Safe defaults are unavailable. This is an unwired provider-neutral library that invokes verifier/replay ports, not a pure function or host release feature. It activates no application path and adds no security-bypass flag.

Ports `IdentityGate`, `ResourceGate`, `WorkloadGate`, `BrokerGate` independently implement `verify(request, policy): Effect.Effect<TrustEvidence, TrustFailure>`. `TrustReplay.consume(request, policy): Effect.Effect<string, TrustFailure>` atomically consumes the nonce and returns an opaque UUID receipt, schema-validated by runtime. Inputs/outputs are strict schemas. Do not supply caller-presented booleans or infer proof from successful decoding.

Each live verifier must actually validate its independent authority, exact binding, signature/attestation where applicable and current revocation. Identity includes delegation; resource includes exact purpose authorization and current profile; workload supplies achieved measured assurance; broker checks the versioned hierarchy and custody authorization without key release. References are opaque protected evidence IDs, not signed bytes or cryptographic proofs. Tag separation alone is not evidence of implementation independence.

The request binds tenant, subject, audience, resource type, exact record, purpose, profile, operation, nonce and all key-version/authority references. Root is deployment-owned offline/HSM and non-universal; signing/encryption authority references must differ. KEK is tenant/resource-scoped and DEK record-scoped through the enclosing exact request. Actual provider binding, physical custody and independence remain external conformance obligations. No key bytes, secret payload or non-exportable handle are issued.

`TrustPolicy` is trusted composition input with required `now`, four independent `freshAfter` values and `minimumAssurance`. Times are nonnegative safe Unix-epoch milliseconds; versions are positive safe integers. No defaults or schedules exist. Runtime rejects future policy bounds, stale/future issuance/revocation checks, revocation checks before issuance and `expiresAt <= now`. Successful verifier calls must still perform current revocation; timestamps are not a revocation oracle.

Workload evidence must meet the explicit policy plus mandatory floors: Sensitive A2, cumulative Restricted and Vault metadata A2, Restricted server-decrypt A4. Raising a security profile never weakens protection. Vault server decrypt is always denied, including A5. Vault metadata requires at least A2 and is not server decryption. Hook decryption remains denied in the existing hook path; this API is not hooked into it.

All checks precede atomic replay consumption. All successful results remain `{ decision: 'metadata-preflight-only', release: 'denied', audit: { identity, resource, workload, broker, replay } }`, with UUID references only. Never pass the result to a real release endpoint as authority. Concrete custody/client-release policy, atomic replay-plus-release, handle lifetime/scope, algorithms, formats, providers and production audit remain approval-gated.

`TrustFailure` has an exact Data.TaggedError constructor exposing only finite `gate` and `reason`; no arbitrary causes, identifiers or payload. No `any`, public `unknown`, type suppression or unchecked cast is authored. Adapters must sanitize failure channels and keep protected evidence/audit lookup access controlled. Do not serialize whole requests or raw Schema parse failures into telemetry. Schema checks do not make all valid UUIDs safe public data.

Tests live in `tests/runtime/src/trust.spec.ts` and use `@effect/vitest`. They cover every missing/denied/unavailable/revoked gate, all binding fields on all four evidence gates, timing, A1-A5/profile/operation combinations, stricter policy, atomic in-process nonce races, rotations and secret-canary errors/audit serialization. These fixtures are not cryptographic, provider, SQL or crash proofs. See [the people guide](../../../docs/trust.md) for setup, every input and limitations. The coordinator owns public export wiring, LLMS generation, Graphify and aggregate validation; do not add aliases to bypass a missing public subpath.
