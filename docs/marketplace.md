# Controlled marketplace foundation

EVE-250's confirmed architecture keeps canonical operational records in each
tenant's database. A controlled marketplace may hold participant-scoped exchanged
snapshots and workflow state, never writable mirrors of private inventory,
requirements, purchasing, sales, staff, finance or personal records.

This increment implements only classified snapshot-reference authorization and
local atomic intent staging. It does not register actions, expose a transport,
install a database adapter, apply a migration or start a consumer. Import the
public `./marketplace` subpaths from the contracts and runtime packages.

## Authorization and classified references

Supply trusted `Caller`, `CurrentTenant`, the existing `IdentityResolver`,
`MarketplaceAuthority`, `MarketplaceStore` and `Flags` services in backend
composition. Do not provide these capabilities from request bodies or plugins.
`MarketplaceAuthorityDeny` and `MarketplaceStoreUnavailable` are closed default
layers; no permissive production authority or volatile production store is supplied.
Missing services cannot authorize an operation; Effect requires them in its
context. The default layers fail with typed `denied` or `unavailable` reasons.

`marketplace.foundation-enabled` is owned by `marketplace` and defaults to `false`.
Evaluate it through the existing Flags service. Do not enable a remote flag or add
an environment-variable switch for this increment. A true flag grants no access.

Every read and stage operation, including identical command replay:

1. Rejects malformed input and excess fields, including nested scope fields.
2. Resolves current identity, session and delegation through `IdentityResolver`.
3. Matches the resolved caller to the presented caller and routed tenant.
4. Requires that tenant to be the exact owner or recipient of the exchange.
5. Reads a live participant grant for the exact subject, tenant, action, exchange,
   owner, recipient, resource and purpose. A grant expires at `expiresAt`, with
   no grace period. Expiry is checked again after the independent policy gate.
6. Requires an immutable stored snapshot reference matching the requested scope.
7. Requires fresh independent authorization of the reference's actual security
   profile, resource and purpose through `MarketplaceAuthority`.

These rules apply equally to humans, services and agents. Agent delegation is
resolved by the existing identity service, not inferred from `onBehalfOf` input.
Membership, platform support/moderator status, a cached grant or a signature alone
does not supply a participant grant or classified-metadata release authority.

References contain opaque IDs, a purpose code, source version and the existing
`sensitive` or `restricted` security profile. Treat the entire reference and intent
as classified, including queues, caches, logs and offline copies. IDs are not
automatically public. The authority must enforce the existing independent
identity/resource-purpose/workload/broker gates for classified metadata; restricted
data is not downgraded because it contains only references. This increment supplies
no concrete assurance verifier. Never use arbitrary values or personal data as
purpose codes, and never fetch a canonical record using a returned reference.

## Operation inputs and results

`readSnapshot(input)` accepts `grant`, `snapshot` and `scope` and returns the
authorized `SnapshotReference`. It does not read or decrypt a private payload.
`stageExchange(input)` additionally requires `command` and `expectedVersion` and
returns an immutable `ExchangeIntent` with state `pending`.

Use this complete stage input only with previously authorized, provisioned IDs:

```json
{
    "grant": "019b0000-0000-7000-8000-00000000000a",
    "snapshot": "019b0000-0000-7000-8000-000000000006",
    "scope": {
        "exchange": "019b0000-0000-7000-8000-000000000007",
        "ownerTenant": "019b0000-0000-7000-8000-000000000001",
        "recipientTenant": "019b0000-0000-7000-8000-000000000002",
        "resource": "019b0000-0000-7000-8000-000000000008",
        "purpose": "quote-review"
    },
    "command": "019b0000-0000-7000-8000-00000000000b",
    "expectedVersion": 3
}
```

All fields are required; none have defaults. Owner and recipient must differ.
IDs are UUIDs. Purpose is a nonempty trimmed code of at most 100 characters.
`expectedVersion` is a nonnegative safe integer and must equal `sourceVersion`.
This version check is not a stock, pricing or quote-freshness policy.
Grant expiration is an explicit epoch-millisecond instant supplied by authorized
policy, not a duration chosen here. `revoked` is explicit; there is no inferred
retention, residency or freshness setting.

A snapshot reference additionally contains its `id`, `sourceRecord`,
`sourceVersion` and `classification`. It has no values, private prices, attachments,
message text or arbitrary metadata. An intent binds the command and grant IDs,
acting tenant, subject, nullable delegating human and exact snapshot reference.
It is not a tenant contract, invoice, payment, stock hold or delivery receipt.

## Local atomicity and retries

Implement `MarketplaceStore.transaction` in one marketplace database. Serialize
participant-grant checks with grant revocation and competing command insertion.
Retain immutable references and stable command identity. Commit the intent and
matching outbox item in the same local transaction, or roll both back on failure,
defect or interruption. Acknowledge only after durable commit. Do not pass raw
tenant database capabilities through this port. A transaction callback must not
dispatch an external command.

The runtime checks live authority before looking up a prior command. An identical
retry returns the stored intent without another enqueue. A changed grant, tenant,
subject, delegating human or snapshot for that command conflicts; a changed expected
version conflicts too. Retry after losing a response uses the same command ID.
There is no process-local success cache. Revocation blocks new ordinary access
and retries, but does not delete existing evidence. Lawful retained evidence needs
its own independently approved access and retention policy, not a bypass here.

Identity and marketplace databases remain independent. A live identity refresh is
not a cross-database transaction or a global atomic revocation guarantee. Future
composition must preserve identity's own authorization semantics and marketplace
grant serialization. A future dispatcher must reauthorize release on every retry,
use durable inbox deduplication at each destination, expose partial outcomes, and
use approved compensation/manual-recovery rules. This increment does none of that
and makes no exactly-once external-effect claim.

## Private exchange and remaining delivery

EVE-251 architecture is confirmed and provider-neutral implementation is permitted.
Concrete algorithms, vendors and custody remain unapproved. This increment does
not choose them or adopt the separately developed trust implementation.
`privateExchangeUnavailable` always fails with `MarketplaceFailure` reason
`trust-unapproved`, even after reference authorization succeeds. No flag, grant,
synthetic policy success or signed request enables private release.

Before enabling production, complete approved concrete assurance/envelope
composition; persistent adapter and migration allocation; actual process-kill and
reopen testing; authorized grant administration and audit integration; external
saga/inbox/outbox processing; and the remaining EVE-250 publication, mixed-award,
payment, legal-basis, retention/erasure and residency acceptance. No dependency,
production activation, billing, settings or infrastructure change is included.

## Validate and troubleshoot

`tests/runtime/src/marketplace.spec.ts` uses an explicitly volatile transactional
fixture. It checks isolation, exact scopes, grant expiry/revocation, current
identity and policy on replay, concurrent deduplication, changed-input conflicts,
rollback at local write boundaries, defects and interruption. These checks prove
runtime/store-port conformance, not SQL persistence or process-crash durability.

Run the normal runtime test/typecheck/lint targets and `node --run verify` for
the full combined verification gate. Use the public package exports, not scratch
aliases that bypass package resolution.

### Revoke unsettled work across process loss (EVE-250)

The durable SQL adapter's process fixture additionally exercises pending and
running metadata work, not payment settlement. Build the public packages, prepare
only the approved disposable loopback database described in
[storage conformance](storage.md#run-conformance), then run:

```sh
node tests/storage/fixtures/marketplace-process.mjs proof sqlite
node tests/storage/fixtures/marketplace-process.mjs proof postgres
pnpm nx run @eventiva/storage-tests:test --skip-nx-cache
```

Both default fixture invocations self-assert the following, without additional
flags or a change to the parent test's JSON contract or 60-second child timeout:

- A staged pending intent survives SIGKILL. Another process revokes its grant;
  restarted claim attempts are denied and retain one blocked-transition audit.
- A worker pauses after durable claim and is killed. Another connection revokes
  the grant. After actual database-clock lease expiry, the old claim conflicts
  without writing; reclaim is denied and durably blocks the delivery.
- A separate killed worker's still-live 30-second fixture lease reaches current
  authorization: settlement is denied and durably blocks, rather than being
  misreported as an expiry conflict. Subsequent old-claim settlements conflict.
- Fresh processes compare exact snapshot, grant, revocation request, intent,
  delivery, audit and settlement rows. Repeated claim/revocation attempts add no
  duplicate blocked evidence or settlement. An independent authorized grant
  stages, claims and records local settlement without changing earlier evidence.

The original six-worker rollback, acknowledgement-loss, stale-fence and
post-settlement revocation proof remains intact. Its reported `pids`, `intents: 1`
and `settlements: 1` describe that original scenario only; additional isolated
scenario namespaces run before the same success report. All worker PIDs are
distinct from each other and the parent, and every worker is stopped. IPC waits
remain bounded at 15 seconds; database expiry waits at 10 seconds. The original
and expired-running fixture leases are 2 seconds, with maxAttempts 3; these are
synthetic test inputs, not marketplace retry or freshness policy.

This proves local metadata authorization and evidence durability through process
loss on Node SQLite and disposable PostgreSQL, not power-loss durability,
cross-database atomicity, real identity/crypto/custody integration, payment,
compensation, retention/residency policy or private release. EVE-250 remains
In Progress; concrete policy and production authorization are separate gates.

Failure reasons contain no classified IDs or input values:

- `disabled`: leave the default off until composition and acceptance are approved.
- `invalid`: use the exact schemas; reject rather than strip private extra fields.
- `denied`: refresh live identity, exact grant and independent metadata assurance.
- `conflict`: do not overwrite evidence or change input under an existing command.
- `unavailable`: retain the intent ID and retry after the approved store recovers.
- `trust-unapproved`: private release is deliberately unavailable in this slice.
