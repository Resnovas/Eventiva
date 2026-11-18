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

`TrustFailure` has an exact Data.TaggedError constructor exposing only finite `gate` and `reason`; `TrustFailureReason` is the shared reason schema. Runtime sanitizes verifier/replay defects, synchronous throws and malformed reasons to the expected gate's `unavailable`; pure interruption stays interruption. Later gates never run after refusal. Signing/encryption UUID inequality is case-insensitive and does not establish physical independence. No `any`, public `unknown`, type suppression or unchecked cast is authored. Adapters must sanitize failure channels and keep protected evidence/audit lookup access controlled. Do not serialize whole requests or raw Schema parse failures into telemetry. Schema checks do not make all valid UUIDs safe public data.

Tests live in `tests/runtime/src/trust.spec.ts` and use `@effect/vitest`. They cover every missing/denied/unavailable/revoked gate, all binding fields on all four evidence gates, timing, A1-A5/profile/operation combinations, stricter policy, atomic in-process nonce races, rotations and secret-canary errors/audit serialization. These fixtures are not cryptographic, provider, SQL or crash proofs. See [the people guide](../../../docs/trust.md) for setup, every input and limitations. Each lane regenerates affected LLMS/Graphify outputs and runs aggregate validation before independent delivery; do not add aliases to bypass a missing public subpath.

The separate `@eventiva/integrations.sql/trust` subpath supplies unactivated
`trustReplay` over the captured SqlClient. Migration 0007 stores nonce, exact
request metadata, explicit consumption time and opaque audit reference. Nonce
uniqueness is case-insensitive within one physical database; changed bindings
cannot reuse it. Every ambient transaction is refused to avoid acknowledging
a savepoint as a durable commit. No cleanup or retention policy is selected.
See `docs/trust-replay.md` and the compiling example below. Storage conformance
tests cover both dialects; the separate trust-process fixture kills before and
after commit and reopens a fresh process.

The default `node tests/storage/fixtures/trust-process.mjs proof sqlite` and
`proof postgres` invocations also assert two four-process consume-once races:
identical requests and mixed-case equivalent UUIDs containing hexadecimal letters.
Build `@eventiva/integrations.sql` first; PostgreSQL requires only the approved
disposable loopback fixture in `docs/storage.md#run-conformance`.
Each contender establishes its own client before the IPC ready/go barrier.
Exactly one receipt must match the retained request, consumption time and audit;
losers must be `TrustFailure` at gate `replay`, reason `replay` or `unavailable`
from actual storage contention, with no raw provider error or second receipt.
No automatic same-nonce retries occur. After all contenders exit successfully,
fresh processes retry both spellings and must return `replay` deterministically.
A distinct-nonce positive control must retain a distinct matching receipt.
Exact whole-table comparisons preserve the original recovery row and detect extra
or modified rows. Scenario nonces are disjoint; the existing stdout/parser retains
original-scenario `retained: 1` and the subprocess timeout remains 60 seconds.
These assertions run in the existing storage test gate without new target wiring.
These are bounded persistence proofs, not actual verifier, custody, live revocation,
power-loss/replication, replay-retention policy or release conformance. No concrete
crypto, policy or production composition is selected by this test-only slice.

## Concrete trust profile `eventiva.trust.v1`

Supersedes earlier statements in this section that no concrete crypto, custody, timing, retention or freshness choice is selected; region, lawful-basis, staff-access and vendor-provisioning limits still stand.

Jonathan approved these standard choices on 2026-11-18 (relayed through the Puck coordination thread T-01a1e940-37a3-7691-a5c0-e935b711c99a). They are sealed floors: callers may tighten, never relax. People guide: `docs/trust-profile.md`.

- `@eventiva/contracts/trust-profile` (portable): `trustProfile` constants; schemas `KekReference`, `RecordBinding` (vault refused), `EncryptedRecord` (`eventiva.envelope.v1`, `A256GCM`), `SignedRequestClaims`/`SignedRequest` (`eventiva.m2.v1`, `Ed25519`), `SignedEvidence`, `KeyPurpose`, `DirectoryKey`; `CryptoFailure` with reasons `invalid | unavailable | signature | stale | revoked | binding | decrypt | vault`; ports `KeyManagement`, `SigningKeys`, `TrustDirectory`; `CryptoUnavailable` safe default; `canonicalize(value): Effect<string, CryptoFailure>` (RFC 8785; refuses non-plain objects, lone surrogates, non-finite numbers); `signingInput(domain, canonical): string`; `trustPolicyAt(now, minimumAssurance): TrustPolicy`; `requestWindowValid(claims, now): boolean`.
- `@eventiva/integrations.trust.server/crypto` (Node only, `node:crypto`, no new dependency): `sealRecord(binding, kek, plaintext)` and `openRecord(record)` need `KeyManagement`; `signRequest(claims)` and `signEvidence(evidence, keyId, keyVersion)` need `SigningKeys`; `verifyRequest(signed, payload, { audience, now })` and `signedEvidenceGate(gate, service, source)` need `TrustDirectory`; `payloadDigest(bytes)` is pure.

Values: Ed25519 signatures; RFC 8785 canonical JSON with `eventiva.m2.v1\n` / `eventiva.evidence.v1\n` domain prefixes; SHA-256 payload digest; AES-256-GCM with a fresh KMS-generated 256-bit DEK per seal, 12-byte random IV, 16-byte tag, canonical header as AAD and as the KMS encryption context. Request lifetime 300000 ms, skew 30000 ms. Evidence max age: identity and resource 300000 ms, workload 900000 ms, broker 60000 ms. Revocation propagation 60000 ms; offline grant display 900000 ms and never authorizes staging. Root 3-of-5 offline HSM, 5 years; intermediates 1 year; signing keys 90 days with 7 days overlap; KEKs FIPS 140-3 level 3 non-exportable, 90 days, two approvals for administration.

Rules agents must keep:

- `openRecord` is the release. Call it only after `trustPreflight` succeeds and the release policy allows it; `privateExchangeUnavailable` still refuses marketplace release because no real KMS, directory or verifier is provisioned.
- `verifyRequest` checks lifetime, skew, audience, payload digest, key purpose `request`, key service equals sender, revocation and the key window at `issuedAt`. It does not consume the nonce; call `TrustReplay.consume` next.
- Give each gate a different verifier `service` in `signedEvidenceGate`. Evidence keys have exactly one purpose (`evidence-<gate>`), so cross-gate or request keys are refused with `binding`.
- Never log envelopes, DEKs or payloads. Failures carry only the closed reason.

Tests: `tests/integrations/trust-server/src/crypto.spec.ts` (tamper, swap, vault, KMS-size, every request binding, four signed gates through `trustPreflight`) and `tests/contracts/src/trust-profile.spec.ts` (RFC 8785 vectors, timing boundaries). Region mapping, lawful bases, staff access and KMS/HSM/attestation vendor provisioning remain open.
