# Marketplace reference and local intent contract

Read `docs/marketplace.md`. EVE-250 architecture is confirmed. Canonical operational
records stay tenant-owned. This isolated increment adds only contracts/schemas,
internal runtime functions and tests for classified references and pending local
intents. The contracts and runtime packages export the `./marketplace` subpaths.
No transport, ActionHost registration, SQL adapter or consumer exists.

Import `readSnapshot`, `stageExchange`, `privateExchangeUnavailable` from
`@eventiva/runtime/marketplace`; schemas/services come from
`@eventiva/contracts/marketplace`. Every input and stored row is strictly decoded;
extra fields, including nested fields, fail rather than silently becoming a
private operational-data projection. Reuse canonical TenantId/SubjectId, the
existing sealed SecurityProfile and IdentityResolver. Do not add vendor crypto,
trust booleans, weaker security profiles or alternate caller assertions.

Both runtime operations require Caller, CurrentTenant, IdentityResolver, Flags,
MarketplaceStore and MarketplaceAuthority. Evaluate the default-false
marketplace.foundation-enabled flag first. Refresh identity inside every local
transaction and enforce exact tenant/subject/session/kind/delegation binding;
owner-or-recipient membership alone is insufficient. Match the live grant's full
scope/action/subject/participant and expiry, then the immutable snapshot scope,
then independent classified-metadata resource/purpose/workload/broker authorization.
Recheck grant expiry after policy. No successful path skips these checks on replay.
No automatic moderator, support, service or agent privilege exists.

Keep the decoded stored snapshot and refreshed caller private to the runtime.
MarketplaceAuthority receives detached caller/reference copies, including scope;
its rewrites cannot change read results, expected-version checks, staged purpose
or subject, or replay comparison. Stored version 3 plus expectedVersion 2 remains
conflict with no writes even if the authority rewrites its reference to version 2.
Do not cache live policy decisions as part of this isolation.

MarketplaceAuthorityDeny and MarketplaceStoreUnavailable are the supplied closed
layers. Production must replace them with approved independently enforced live
policy and durable persistence, not tests' synthetic successes or volatile maps.
Classified IDs must not escape through logs, queues, errors or cached public
metadata. An authority's successful metadata check cannot grant private processing.

MarketplaceStore.transaction passes a backend-only MarketplaceTransaction with
grant/snapshot/intent reads and insertIntent/enqueue writes. Serialize grant
revocation and competing command writes; immutable references cannot change
source/version/profile. Commit intent/outbox together, acknowledge after commit,
roll back on all exits other than success. Do not call remote systems inside it.
This is not Storage for another tenant and grants no SQL escape hatch. A later
adapter must be allocated separately, proven with process crashes, and integrated
with existing identity/assurance/audit seams without pretending independent
databases share ACID. Read-only live identity refresh is not globally atomic with
marketplace commit.

Pass independent intent/snapshot/scope objects to insertIntent and enqueue, not
the canonical returned intent or each other's argument. Adapter input mutation
must not contaminate the other write or identical retry binding. This does not
certify an adapter's own persisted rows: serialization, atomicity and rollback
remain store obligations. No public contract or concrete policy is changed.

An intent binds stable command ID, grant ID, tenant, subject, delegating human and
the full classified snapshot. expectedVersion must equal the immutable source
version; it is not quote freshness. An identical retry returns persisted state
only after fresh authorization. Changed binding conflicts; revocation denies even
identical retry without erasing committed evidence. The only state is pending:
no contract/payment success, compensation default or external exactly-once claim.

EVE-251 provider-neutral architecture is confirmed; concrete algorithms, vendors
and custody are still unapproved. This slice supplies no private release, even if
another trust implementation is integrated later. The following fail-closed
example has no service requirements and does not select cryptography:

```ts
import { privateExchangeUnavailable } from '@eventiva/runtime/marketplace';
import { Effect } from 'effect';

export const privateReleaseResult = privateExchangeUnavailable.pipe(Effect.either);
// Always Left(MarketplaceFailure { reason: 'trust-unapproved' }).
```

Retain tests for exact tenant/recipient/resource/purpose/exchange scope, identity
refresh, expiry boundaries, policy denial on replay, concurrent duplicates,
changed input and rollback/interruption. The volatile conformance fixture is NOT
durable SQL or process-crash evidence. Full EVE-250 remains implementation pending
until publication/tombstones, private exchanges, mixed supplier awards, destination
deduplication/sagas, financial records and legal policy receive their own proofs.
Do not activate production, select retention/residency/freshness defaults, run
migrations, modify billing/settings/infrastructure or enable consumers here.

## Marketplace parameters `eventiva.marketplace.v1`

Supersedes earlier statements in this section that no concrete crypto, custody, timing, retention or freshness choice is selected; region, lawful-basis, staff-access and vendor-provisioning limits still stand.

Pure functions in `@eventiva/contracts/marketplace-policy`, approved by Jonathan on 2026-11-18 (relayed through the Puck coordination thread). People guide: `docs/trust-profile.md`.

- `freshnessPolicy`: quote-send 24 h, no synchronous recheck; award 15 min, contract-acceptance 1 min and payment 1 min, each with a synchronous supplier recheck. `assessFreshness(assertion | undefined, step, now)` returns `unknown` for missing or future-dated, `stale` for expired or over-age, else `verified` (display only; rechecks still run). `quoteValidity`: default 14 days, maximum 90 days.
- `retentionPolicy` (ms after the closing event): message and unawarded-quote 2 years; contract-evidence, payment-evidence and audit 7 years; replay-nonce 7 days; public-tombstone 30 days; offline-cache 15 min. `destructionDueAt(state)` returns `undefined` under legal hold, otherwise the later of the period (jurisdiction can only lengthen) and every participant's obligation end.
- `retryPolicy`: 1 s base, factor 2, cap 5 min, 8 attempts. `recoveryAction(step, failure, attempt)`: `ambiguous` always `reconcile`; `transient` retries until attempt 8; then, or for `permanent`, `compensate` earlier completed steps in reverse (`cancel-payment-schedule`, `void-contract-snapshot`, `release-stock-hold`), except `collect-payment`, which is always `manual-recovery`. Legs of a mixed award recover independently.
- `reconcileInvoice(schedule, { 'provider-invoice'?, 'supplier-accounting'? })`: the immutable contract schedule is the baseline; changed, missing, extra or duplicated lines are a `discrepancy` for manual review. Nothing is adjusted.

Tests: `tests/contracts/src/marketplace-policy.spec.ts` covers both sides of every boundary.
