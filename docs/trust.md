# Protected-release metadata preflight

EVE-251 implements an unwired provider-neutral library for metadata preflight, not private key release or decryption. It invokes verifier and replay ports but activates no application path and adds no security-bypass flag. A successful result always contains `decision: 'metadata-preflight-only'` and `release: 'denied'`. Do not treat it as a reusable authorization grant. No production verifier, cryptography, signature format, custody provider or infrastructure is selected.

The concrete algorithms, timing windows and custody quorum approved on 2026-11-18, and the Node implementation of Ed25519 request and evidence signatures and AES-256-GCM envelopes, are described in the [trust profile](trust-profile.md). Use `trustPolicyAt` to build `TrustPolicy` from them.

## Keep four gates independent

Provide these trusted Effect services at composition, not from a plugin or caller:

| Service        | Required live verification                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `IdentityGate` | Authenticate the exact subject and tenant; validate any delegation and its current revocation.                                   |
| `ResourceGate` | Authorize the exact tenant, subject, audience, resource type, record, purpose, operation and current security profile.           |
| `WorkloadGate` | Verify workload attestation and measured assurance against approved policy.                                                      |
| `BrokerGate`   | Verify current HSM/key-broker authorization and the exact root, authority, KEK and DEK versions and scope. Do not release a key. |

A key-encryption key (KEK) protects data-encryption keys (DEKs). A KEK belongs to the tenant/resource scope; a versioned DEK belongs to the exact record. `TrustKeyVersion` carries only identifiers and positive versions. The enclosing request supplies the tenant/resource/record binding. Signing and encryption authorities must have different identifiers. This structural check does not establish that the actual authorities or custody are independent.

The confirmed deployment model uses a deployment-owned offline/HSM root, never a universal decrypt key, and separate signing and encryption authority. Any future usable handle must be non-exportable, short-lived and exactly scoped. This increment issues no handle and cannot prove physical custody, non-exportability or deployment isolation.

Each port must perform actual verification, including current revocation, on every invocation. Return `TrustEvidence` only after that verification. Its UUID reference names protected evidence storage; it contains no signature bytes and proves nothing by itself. Schema validation checks metadata shape, never a signature or attestation. Independent tag names do not prove independent providers; approved composition must supply that independence.

## Run preflight

1. Obtain an exact `TrustRequest` from an authorized boundary. Do not include credentials, ciphertext, plaintext, signatures or arbitrary payloads.
2. Supply `TrustPolicy` from trusted deployment/tenant policy. Use Unix-epoch milliseconds for `now`, each gate's inclusive `freshAfter`, and evidence timestamps. Select no timing value from caller input.
3. Provide all four live verifier services and `TrustReplay` using Effect layers. Missing services and `TrustUnavailable` fail with `unavailable`; no permissive layer exists.
4. Call `trustPreflight`. It validates exact evidence binding, timestamps and assurance. Only then does it call `TrustReplay.consume` once.
5. Keep the returned opaque audit references access-controlled. Never interpret this result as permission to invoke a key-release endpoint.

For example, this complete safe-default invocation demonstrates refusal without installing a verifier:

```ts
import { Effect, Schema } from 'effect';
import { TrustPolicy, TrustRequest, TrustUnavailable } from '@eventiva/contracts/trust';
import { trustPreflight } from '@eventiva/runtime/trust';

export const deniedPreflight = (requestJson: string, policyJson: string) =>
    Effect.gen(function* () {
        const request = yield* Schema.decodeUnknown(Schema.parseJson(TrustRequest))(requestJson);
        const policy = yield* Schema.decodeUnknown(Schema.parseJson(TrustPolicy))(policyJson);
        return yield* trustPreflight(request, policy).pipe(Effect.provide(TrustUnavailable));
    });
```

The policy JSON in this example must come from trusted composition, never a request body. Its parse failures remain local to that trusted boundary; expose only sanitized domain failures to callers.

## Inputs and defaults

Every field is required. There are no timing, rotation, provider, assurance-policy or replay-retention defaults.

| Input         | Fields and constraints                                                                                                                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Request scope | Branded UUID `tenant` and `subject`; bounded symbolic `audience`, `resource`, `purpose`; UUID `resourceId`; existing `profile`; `operation` is `metadata` or `server-decrypt`. No cross-tenant or hook operation.                   |
| Request nonce | UUID `nonce`, consumed atomically after successful checks.                                                                                                                                                                          |
| Key versions  | UUID `root`, `signingAuthority`, `encryptionAuthority`, `kek`, `dek`; positive safe integer `kekVersion`, `dekVersion`. No algorithms or schedules.                                                                                 |
| Policy        | Nonnegative safe integer `now`; independent `freshAfter.identity`, `.resource`, `.workload`, `.broker` no later than `now`; explicit `minimumAssurance` from A1 through A5.                                                         |
| Evidence      | Exact request; own `gate`; opaque UUID `reference`; `issuedAt`, `expiresAt`, `revocationCheckedAt`; `assurance`. Workload evidence supplies the measured assurance used for the floor. Other gates' assurance values grant nothing. |

Evidence issuance and revocation checks must be at or after the gate's freshness bound and no later than `now`. Revocation checks cannot precede issuance. Expiry is exclusive: `expiresAt <= now` is stale. These comparisons do not establish live revocation by themselves; verifier success promises a live revocation check.

The trusted policy can tighten, never lower, mandatory floors. Sensitive access requires at least A2; the cumulative A2 floor also applies to Restricted and Vault metadata. Raising a security profile never weakens protection. Restricted server-decrypt preflight requires at least A4. Vault server decryption is rejected before verification at every assurance level. Vault metadata requires at least A2 and receives no decryption grant. Baseline has no extra floor beyond the explicit policy and A1 classification. All results still deny actual release. Existing hook decryption denial is unchanged.

## Replay and rotation limitations

`TrustReplay.consume(request, policy)` must atomically refuse a previously consumed nonce and return a UUID audit receipt. It must validate approved persistence, nonce namespace/retention, revocation and version policy. A check followed by an unrelated write is not atomic consumption. Do not silently retry with the same nonce or reset replay storage on restart. Checks failing before consumption leave the nonce untouched. Once consumption is invoked, an unavailable service or invalid receipt can leave consumption completed even though preflight fails; reconcile that state rather than blindly retrying. Successful preflight consumes the nonce although it never releases a key. A later release protocol must define a separate approved atomic custody/replay transaction rather than reuse this metadata result.

Version numbers support algorithm-independent rotation references, not rollover activation, monotonic allocation, rewrapping, rollback authorization or old-version acceptance policy. Those checks belong to approved live broker policy. No maximum age, rotation schedule, quorum or replay lifetime is invented here.

## Diagnose refusal

`TrustFailure` contains only a closed `gate` and `reason`. Reasons are `invalid`, `unavailable`, `denied`, `binding`, `stale`, `revoked`, `replay`, `assurance`, and `vault`. Errors contain no request, target identifiers, raw provider cause or payload. Evidence and audit schemas reject extra fields. UUID references are still sensitive lookup references: do not publish them into ordinary telemetry or permit lookup without authorization.

The preflight boundary also sanitizes verifier/replay defects, synchronous throws and malformed failure reasons to the current gate's `unavailable` failure. Later gates are not invoked. Interruption remains interruption, not an outage receipt; cancellation never returns successful preflight. Signing and encryption authority UUIDs must identify different authorities regardless of letter casing. This metadata inequality does not prove physical custody independence.

- For `unavailable`, supply approved live services and durable replay storage; do not substitute booleans or enable a bypass.
- For `binding`, check all exact target, nonce and key-version fields. Do not broaden matching to tenant-only or resource-type-only.
- For `stale` or `revoked`, obtain newly verified live evidence under the current trusted policy. Do not extend timestamps or ignore revocation locally.
- For `assurance` or `vault`, preserve the floor. Administrator or plugin trust cannot lower it.

## Validate the bounded slice

Use the public `./trust` subpaths and run:

```sh
pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/trust.spec.ts --coverage.enabled=false
pnpm exec eslint packages/contracts/src/trust.ts packages/runtime/src/trust.ts tests/runtime/src/trust.spec.ts
pnpm exec prettier --check packages/contracts/src/trust.ts packages/runtime/src/trust.ts tests/runtime/src/trust.spec.ts docs/trust.md ai-docs/src/24_trust/index.md
```

The Effect fixtures exercise missing/denied/unavailable/revoked gates, exact binding, timing, A1-A5 floors, Vault refusal, nonce races, algorithm-neutral versions and secret-canary serialization. They use in-memory `Ref` state: they prove neither SQL/process-crash replay protection nor cryptographic/provider conformance. Production release remains blocked on separately approved concrete verification, custody/client-release policy, durable audit/replay transactions and actual provider tests.

## Prove independent-process nonce consumption

Prepare the approved disposable loopback database using [storage conformance](storage.md#run-conformance), then build the public SQL package and run both dialects:

```sh
pnpm nx run @eventiva/integrations.sql:build
node tests/storage/fixtures/trust-process.mjs proof sqlite
node tests/storage/fixtures/trust-process.mjs proof postgres
pnpm nx run @eventiva/storage-tests:test --skip-nx-cache
```

Each default fixture invocation keeps the original SIGKILL-before-commit and lost-acknowledgement recovery assertions. It then runs two four-worker races through the public durable replay port: identical requests, followed by equivalent lower/upper-case UUID nonces containing hexadecimal letters. Each worker has a distinct PID and its own connected SQL client before the parent releases the barrier. No contender automatically retries its nonce.

Every race asserts exactly one receipt and exactly one matching retained request/time/audit row. Losers must return a sanitized typed replay-gate failure, either `replay` or `unavailable` from the real storage path under contention; raw provider errors and second receipts fail the fixture. After all racing workers close, separate fresh processes retry both UUID spellings and must deterministically return `replay`, without changing any retained row. A distinct nonce must succeed with a distinct receipt and matching row, ruling out an always-deny implementation. Scenario nonces are disjoint from the original recovery nonce; exact whole-table comparisons detect extra rows or changed evidence.

Assertions run inside the existing storage gate and preserve its 60-second subprocess bound and exact original stdout JSON, including original-scenario `retained: 1`. Additional scenario rows are not reported as original recovery rows. Failure exits nonzero rather than printing a passing boolean. A connection failure before the barrier is a fixture failure, not an accepted contention result. SQLite uses a disposable disk file and PostgreSQL a unique disposable database; follow the storage guide's teardown even on failure.

This EVE-251 slice proves only metadata nonce uniqueness within one database across independent processes/connections. It neither runs the four real verifiers nor selects concrete trust policy, cryptography, custody, replay retention or release composition. It returns no key, plaintext, handle or release grant, and does not prove power-loss or replicated-database durability.
