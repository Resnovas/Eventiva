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
