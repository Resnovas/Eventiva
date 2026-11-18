# Concrete trust profile and marketplace parameters

`eventiva.trust.v1` and `eventiva.marketplace.v1` are the concrete cryptography, custody, freshness, retention, recovery, compensation and reconciliation choices for the marketplace trust work in [EVE-251](https://linear.app/resnovas/issue/EVE-251) and [EVE-250](https://linear.app/resnovas/issue/EVE-250). Jonathan approved choosing well-established standard options on 2026-11-18. The approval was relayed through the [Puck coordination thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a), and each choice and its reasons are recorded in the [decision index](planning/decisions.md#concrete-trust-and-marketplace-parameters---2026-11-18).

These values are sealed floors. A tenant or module may shorten a freshness window, raise an assurance floor or lengthen a legally required retention period. It may never do the reverse.

This guide does not authorize provisioning a KMS, HSM or attestation vendor, spending money, or activating production release. `privateExchangeUnavailable` still refuses private marketplace release until a real KMS, signer, trust directory and four live verifiers are composed.

## What is in the code

| Module                                       | Contents                                                                                                                                                                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@eventiva/contracts/trust-profile`          | `trustProfile` constants, envelope and signed-request schemas, the `KeyManagement`, `SigningKeys` and `TrustDirectory` ports, `CryptoUnavailable`, `canonicalize`, `trustPolicyAt`, `requestWindowValid`. Portable, no Node APIs. |
| `@eventiva/contracts/marketplace-policy`     | `freshnessPolicy`, `assessFreshness`, `quoteValidity`, `retentionPolicy`, `destructionDueAt`, `retryPolicy`, `recoveryAction`, `reconcileInvoice`. Pure functions.                                                                |
| `@eventiva/integrations.trust.server/crypto` | Node `node:crypto` implementation: `sealRecord`, `openRecord`, `signRequest`, `verifyRequest`, `payloadDigest`, `signEvidence`, `signedEvidenceGate`. No new dependency.                                                          |

## Cryptography

| Choice             | Value                                                                         | Why                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Signatures         | Ed25519 (RFC 8032), 64-byte signatures, 32-byte public keys                   | Deterministic, no nonce misuse, fast, small, supported by Node, cloud KMS and HSMs.                        |
| Canonical form     | RFC 8785 JSON Canonicalization Scheme                                         | A published standard that removes key-order and number-format ambiguity before signing.                    |
| Domain separation  | `eventiva.m2.v1\n` or `eventiva.evidence.v1\n` before the canonical document  | A request signature can never be replayed as evidence, or the reverse.                                     |
| Payload digest     | SHA-256, unpadded base64url                                                   | Binds the signed header to the exact envelope bytes sent.                                                  |
| Content encryption | AES-256-GCM, 12-byte random IV, 16-byte tag                                   | NIST-approved AEAD with hardware acceleration everywhere.                                                  |
| Data keys          | Fresh 256-bit DEK per record version, generated and wrapped by the KMS        | A new key for every seal keeps GCM well inside its random-IV limit and allows per-record crypto-shredding. |
| Additional data    | RFC 8785 form of version, algorithm, record binding, KEK reference and DEK id | Moving ciphertext to another tenant, record, version or profile fails authentication.                      |
| Vault              | Refused by schema                                                             | Zero-knowledge records stay client-side and never become server-decryptable.                               |

## Timing

| Parameter                                                | Value                                                |
| -------------------------------------------------------- | ---------------------------------------------------- |
| Signed request lifetime                                  | 5 minutes                                            |
| Clock skew tolerance                                     | 30 seconds                                           |
| Identity and resource evidence max age                   | 5 minutes                                            |
| Workload attestation evidence max age                    | 15 minutes                                           |
| Broker (key custody) evidence max age                    | 60 seconds                                           |
| Revocation propagation to service caches and key handles | 60 seconds                                           |
| Offline cached grant display                             | 15 minutes; offline devices never stage new exchange |
| Replay nonce retention                                   | 7 days                                               |

## Custody and rotation

| Parameter                                   | Value                                                                                                    |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Root key                                    | Offline, HSM-backed, 3-of-5 custodian quorum, 5-year validity                                            |
| Intermediate signing/encryption authorities | 1-year validity                                                                                          |
| Service signing keys                        | Rotate every 90 days with 7 days of overlap                                                              |
| Marketplace KEKs                            | HSM-backed KMS, FIPS 140-3 level 3, non-exportable, rotate every 90 days; old versions stay decrypt-only |
| KEK administration                          | Two approvals for any destroy, disable or policy change                                                  |

## Marketplace freshness

| Step                | Maximum supplier assertion age | Synchronous supplier recheck |
| ------------------- | ------------------------------ | ---------------------------- |
| Quote send          | 24 hours                       | No                           |
| Award               | 15 minutes                     | Yes                          |
| Contract acceptance | 1 minute                       | Yes                          |
| Payment             | 1 minute                       | Yes                          |

Quotes without a stated validity are valid for 14 days; the longest validity a supplier may state is 90 days. `assessFreshness` returns `unknown` for a missing or future-dated assertion and `stale` for an expired or over-age one. `verified` only means the cached assertion may be shown: a step that requires a recheck must still perform it.

## Retention

| Record class                               | Kept after its closing event |
| ------------------------------------------ | ---------------------------- |
| Messages, unawarded quotes                 | 2 years                      |
| Contract evidence, payment evidence, audit | 7 years                      |
| Replay nonces                              | 7 days                       |
| Public listing tombstones                  | 30 days                      |
| Offline caches                             | 15 minutes                   |

Seven years covers the six-year UK limitation and HMRC record periods with margin. A jurisdiction may lengthen a period, for example to ten years for invoices; it can never shorten one. `destructionDueAt` returns `undefined` under legal hold, and never returns a time before every participant's own obligation ends. Separable personal data is erased or anonymized at the shorter class limit.

## Recovery and compensation

- Transient failures retry with exponential backoff: 1 second, doubling, capped at 5 minutes, at most 8 attempts.
- An ambiguous outcome, such as a timed-out provider call, always reconciles by idempotency key against the authoritative status before anything else.
- A permanent failure, or exhausted retries, compensates the earlier completed steps in reverse: cancel the payment schedule, void the contract snapshot, release the stock hold. Voiding appends a record; evidence is never deleted.
- Once payment collection has started, nothing is compensated automatically. The leg moves to manual recovery, and any refund goes through the provider.
- Each supplier leg of a mixed award recovers on its own. One failing supplier never rolls back another supplier's contract.

## Invoice reconciliation

The immutable Eventiva contract schedule is the baseline. `reconcileInvoice` compares provider invoice lines and supplier accounting lines against it and reports every changed, missing, extra or duplicated line as a discrepancy for manual review. It never adjusts amounts.

## Example

```ts
import type { KekReference, RecordBinding } from '@eventiva/contracts/trust-profile';
import { openRecord, sealRecord } from '@eventiva/integrations.trust.server/crypto';
import { Effect } from 'effect';

export const roundTrip = (binding: RecordBinding, kek: KekReference, body: Uint8Array) =>
    Effect.gen(function* () {
        const sealed = yield* sealRecord(binding, kek, body);
        // Run trustPreflight and the release policy before this line in real code.
        return yield* openRecord(sealed);
    });
// Provide a real KeyManagement layer; CryptoUnavailable makes both calls fail with `unavailable`.
```

## Common problems

- **Every call fails with `unavailable`.** No KMS, signer or directory is composed. `CryptoUnavailable` is the default.
- **`openRecord` fails with `decrypt`.** The envelope was moved to another record, version, tenant or profile, or its bytes changed. The KMS also refuses to unwrap the DEK under a different context.
- **`verifyRequest` fails with `binding`.** Check the audience, the payload bytes, and that the key's purpose is `request` and its service is the claimed sender.
- **`verifyRequest` fails with `stale`.** The request is older than 5 minutes plus skew, was issued more than 30 seconds in the future, has a lifetime over 5 minutes, or was issued outside the key's validity window.
- **Preflight fails with `stale` at the broker gate.** Broker evidence must be at most 60 seconds old.

## What stays open

Region placement and jurisdiction mapping, lawful bases per jurisdiction, platform staff access to private exchange records, anti-fraud thresholds (M3), the A2 approval policy, and the choice and provisioning of a concrete KMS, HSM or attestation vendor.
