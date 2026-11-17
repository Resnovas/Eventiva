# Durable marketplace metadata

The controlled marketplace keeps canonical records in their owning tenant. This adapter persists only scoped classified snapshot references, revocable participant grants, pending intents, audit records and local outbox evidence in one trusted marketplace database. It has no capability to fetch or write another tenant's canonical records.

The EVE-251 provider-neutral architecture is confirmed. Concrete algorithms, vendors and custody are not selected here. Private exchange remains unavailable through `privateExchangeUnavailable`; neither an outbox claim nor a `recorded` settlement authorizes payload release.

## Compose the adapter

1. Have the integration owner review and install forward migration 0006 for the selected dialect through the existing migration runner. Never modify an applied migration or run schema push. The migration only adds marketplace tables, indexes and evidence-protection triggers. It does not read or copy tenant records.
2. Build `marketplace('sqlite')` or `marketplace('postgres')` from `@eventiva/integrations.sql/marketplace` with the trusted marketplace `SqlClient` at composition time. Do not route this client through a caller-selected tenant router or expose it as raw SQL.
3. Supply `Caller` and `CurrentTenant` for each invocation. Supply a trusted live `MarketplaceOperatorPolicy` for administration and processing. It must resolve the presented identity/session/delegation, authorize the operation and the full exchange scope, and enforce the assurance and classified-metadata requirements of that scope. `MarketplaceOperatorPolicyDeny` denies every operation. No accepting production policy is included.
4. For staging, keep the existing `IdentityResolver`, `MarketplaceAuthority` and default-off `marketplace.foundation-enabled` feature flag. For outbox claims and settlement, supply the same live independent `MarketplaceAuthority`; it gates classified references, not private records. Missing policy/services fail closed. Do not enable production consumers as part of wiring.

The layer provides `MarketplaceStore`, `MarketplaceAdministration` and `MarketplaceOutbox`. All requests are decoded strictly, including nested objects. Administration/outbox SQL errors and live-policy defects become the established safe `MarketplaceFailure` reason `unavailable`, never raw causes or stored metadata; interruption remains interruption. Trusted store transaction callbacks separately retain their exact error and environment types.

## Provision, stage and revoke

An authorized owner calls `MarketplaceAdministration.provision({ request, snapshot, grant })`. `request` is a UUID idempotency key. The grant must match the complete snapshot scope, name either participant tenant and have an explicit future expiry. No expiry or freshness default is supplied. Snapshot references and grant bindings are immutable. A snapshot ID cannot be rebound to another source version, classification or record. A grant can only become revoked, never active again; renewed authority requires a new grant ID and an independently authorized provisioning request.

Call the existing `stageExchange({ command, grant, snapshot, scope, expectedVersion })` to stage a local intent. It re-resolves identity and verifies live grants and metadata policy inside the adapter's serialized transaction, including identical command retries. Exactly one intent, local delivery row and stage audit commit together. A changed command binding conflicts. Callback failure, defect, interruption or audit failure rolls everything back; no acknowledgement precedes commit.

An authorized owner calls `revoke({ request, scope, grant })`. The monotonic revocation and audit append commit together under the same guard used by staging and processing. Identical administration retries still run the live operator check. A provisioning retry after revocation may acknowledge the original request but cannot restore the grant. `audit({ scope, limit })` requires a participant tenant plus independent live operator authority; `limit` is required and is between 1 and 100. There is no public audit listing or unrestricted metadata scan.

## Record local processing evidence

This is a durable local outbox state machine, not an external saga dispatcher. A worker must run in the originating participant's live subject/delegation context. No service-principal substitution, remote effects, cross-database transaction, payment, stock hold or remote acknowledgement is implied.

For example, after authorized staging, claim and record local evidence for the exact command:

```ts
import { MarketplaceOutbox, type ClaimExchange } from '@eventiva/contracts/marketplace-durable';
import { marketplace } from '@eventiva/integrations.sql/marketplace';
import type { Dialect } from '@eventiva/integrations.sql/migrations';
import { Effect } from 'effect';

export const recordLocalMetadata = (dialect: Dialect, input: ClaimExchange) =>
    Effect.gen(function* () {
        const outbox = yield* MarketplaceOutbox;
        const claim = yield* outbox.claim(input);
        if (claim !== undefined) yield* outbox.settle({ claim, outcome: { state: 'recorded' } });
    }).pipe(Effect.provide(marketplace(dialect)));
```

This unexecuted Effect still requires the trusted marketplace SQL client and per-call services above. Its `input` supplies the command and explicit approved `leaseMs` and `maxAttempts`; the foundation selects neither. The same example is compiled in `ai-docs/src/23_marketplace/02_durable.ts`.

- `command`: the already staged command UUID, which remains stable across claims and retries.
- `leaseMs`: required positive safe integer. Lease deadlines use the database clock; callers cannot supply a forged current timestamp. No default.
- `maxAttempts`: required positive safe integer, pinned by the first successful claim. A later changed budget conflicts. No default or operator redrive is included.
- `claim`: the returned command, lease UUID and attempt number. Only the current unexpired fence can perform a new settlement.
- `outcome.state`: required `recorded` or `retry`. `recorded` means local processing evidence only, not delivered private data or a remote commitment.
- `outcome.availableAt`: required absolute epoch milliseconds for `retry`. The existing timestamp schema applies; the SQL queue accepts nonnegative deadlines. No retry-delay/backoff policy is invented.

Claims and settlements recheck live participant authority, the complete grant scope, revocation, expiry and classified-metadata authorization. A denied grant/metadata check on an eligible item persists `blocked` plus audit before returning `denied`; unavailable policy or SQL errors roll back instead. Denied operator identity never mutates queue state. `blocked` and exhausted items have no automatic reactivation. A claim whose worker crashed is reclaimable only after database-clock lease expiry; the replacement gets a new fence and increments the durable attempt count. Attempt exhaustion is durable and observable in the scoped audit.

Settlement requests are durably deduplicated by lease and their entire strict request body. An identical retry after a lost acknowledgement reauthorizes and returns without changing the current state, attempt budget or audit. A changed outcome conflicts. A stale old claim cannot settle a newer lease. A new settlement rechecks the database-clock lease after live authorization, so policy latency cannot extend an expired fence. Accepted settlement history remains immutable.

## Failures and recovery

- `disabled`: staging is not enabled by its existing feature flag. Leave it off until an approved composition exists.
- `denied`: caller, grant or metadata authority no longer permits the operation. Reauthorize rather than restoring a revoked grant or changing SQL rows.
- `conflict`: a key was reused with different bindings, the retry budget changed or a settlement fence is stale. Preserve the original command and inspect its scoped audit.
- `invalid`: a strict schema, scope, expiry or timing input is invalid. Correct the authorized request rather than relaxing decoding.
- `unavailable`: the migration/guard, database or trusted transaction capability is unavailable. Restore the database/composition and retry the identical operation. Ambient transactions are rejected before any SQL can be borrowed, including transactions from another client. Escaped transaction methods also fail closed.
- `trust-unapproved`: private payload release lacks an approved concrete EVE-251 composition. Local metadata evidence does not remove this boundary.

Audit insertion failure rolls back provisioning, revocation, staging and local delivery changes. Database triggers reject changes/deletions to snapshot references, intents, administration idempotency records, settlement history and audit, and prevent grant reactivation. These are application evidence protections, not a defense against a database administrator who can disable triggers. Classified marketplace tables must be reachable only through the trusted adapter and policies; no per-caller SQL credentials or RLS identity mechanism are introduced.

Migration rollback is application rollback: stop composing the adapter/consumer and leave its additive tables and immutable evidence intact. There is no down migration, delete/reset operation or cleanup/retention policy. This work chooses no jurisdiction, residency, retention, cryptographic provider or production activation.

## Validate locally

Run the normal workspace build before storage tests so process fixtures resolve real emitted public package subpaths. Run the marketplace storage and process specifications through the existing storage test project. PostgreSQL tests require the existing authorized disposable loopback `eventiva_test` fixture; they refuse a non-loopback administration target, create isolated `marketplace_*` databases and drop those databases on cleanup. Never point them at production.

The process proof uses six actual Node workers and a file-backed SQLite database or isolated PostgreSQL database. It SIGKILLs workers after intent/outbox/audit writes but before commit, after staging commit before acknowledgement, while a committed claim is leased, and after settlement commit before acknowledgement. Replacement processes reopen the same database. Assertions inspect rollback, immutable deduplication, competing claim exclusion, database-clock expiry, stale fencing and persistent revocation. No synthetic accepting sink or remote invocation is involved.
