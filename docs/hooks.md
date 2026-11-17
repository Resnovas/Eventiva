# Post-commit hook foundation

Hooks observe committed metadata or request separately authorized additive actions.
They cannot veto operations, replace inputs or results, authorize transactions,
or act as lifecycle guards. Mandatory synchronous policy checks remain internal.

This checkpoint is not enabled in production. Shared exports, host transaction
wiring, trusted lifecycle identity provenance, live release authorization and a
durable accepting sink require coordinated integration and owner review.

## Wire the transaction before dispatch

1. Apply the additive `0003.sql` migration through the existing migration runner.
   Never edit an applied `0001.sql` or `0002.sql`. Both dialects add only
   `hook_subscription`, `hook_delivery` and their indexes. Stop producers and
   dispatchers to roll back application wiring; retain tables and data. There is
   no destructive down migration.
2. Provide `hookStorage(dialect)` with the authenticated `CurrentTenant` and the
   existing captured `SqlClient`. Use the **Storage returned by that same layer**.
   An unrelated Storage layer or a bare SQL transaction cannot authorize staging.
   All returned Storage operations reject foreign/unowned ambient transactions;
   nesting another paired layer cannot relabel the connection. Same-layer nesting
   remains supported.
3. Run mandatory policy checks and the originating write, then `HookOutbox.stage`
   inside that paired `Storage.transaction` or `Storage.commit`. Stage only typed,
   minimized metadata from trusted producers, with the exact approved observer pins.
4. After commit, dispatch through `HookDispatcher`. Claim and settlement refuse
   every ambient SQL transaction. Never execute observers in the originating write.
5. Keep `HookReleaseDeny`, `HookSinkUnavailable` and the flag's safe default until
   trusted production implementations and their approvals are available.

The reserved subpaths are `@eventiva/contracts/hook`, `@eventiva/runtime/hook` and
`@eventiva/integrations.sql/hook`. The coordinator adds their shared export entries;
this checkpoint does not modify manifests or generated documentation.

```ts
import { HookOutbox, HookReleaseDeny, type HookDeclaration, type HookEvent } from '@eventiva/contracts/hook';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { Storage } from '@eventiva/contracts/storage';
import { hookStorage } from '@eventiva/integrations.sql/hook';
import { HookDispatcherLive, HookSinkUnavailable } from '@eventiva/runtime/hook';
import { Effect, Layer } from 'effect';

// Supply the application's existing client and authenticated tenant at composition.
const hooks = hookStorage('sqlite');
const dispatch = HookDispatcherLive.pipe(
    Layer.provide(hooks),
    Layer.provide(HookReleaseDeny),
    Layer.provide(HookSinkUnavailable),
    Layer.provide(FlagsSafeDefaults)
);

const stageMetadata = (event: HookEvent, observers: ReadonlyArray<HookDeclaration>) =>
    Effect.gen(function* () {
        const store = yield* Storage;
        const outbox = yield* HookOutbox;
        // Include the real domain write in this transaction before staging.
        yield* store.transaction(outbox.stage(event, observers));
    });
```

See the compiling counterpart in `ai-docs/src/18_hooks/composition.ts`. This
example deliberately supplies neither a production release policy nor a sink.

For a resource write plus observation, use `resourceHookProvider(dialect, tenant,
identity, definitions)` from `@eventiva/integrations.sql/resource` instead of
nesting independent resource/hook roots. It returns the resource provider with
its paired `outbox` and committed `feed`; use its exact `storage` for durable Integrity. The authenticated
tenant must match the requested resource tenant. Both SQL adapters share one private
root and actual connection identity, so rollback and replay cover the resource,
immutable history, receipt and staged fact together. Independently created roots
remain foreign even on the same client. See [Resource composition](resources.md#share-a-resource-and-hook-transaction)
and its compiling `writeAndStage` example. This does not supply production release,
principal, approval, sink or lifecycle provenance policy, and enables no flag.

## Resume a committed tenant change feed

Apply additive `0004.sql` before deploying the new producer. It adds `hook_feed_head`
and `hook_event` without changing existing deliveries, receipts or migration checksums.
Open new application clients after migration; reopen a SQLite client that queried
the missing feed table before migration, because its driver caches failed prepares.
Quiesce old producers before enabling feed consumers: old binaries can still write
deliveries but cannot populate the new feed. There is no historical backfill because
the previous delivery table cannot establish cross-subscription commit order. Cursor
zero starts the facts admitted by the new producer, not the tenant's entire history.
Rolling application code back retains both new tables; suspend feed consumers until
all producers support the feed again. No down migration or production migration is run
by this increment.

Obtain `HookChangeFeed` from the same authenticated `hookStorage(dialect)` context,
or use `resourceHookProvider(...).feed`. `HookOutbox.stage` now stores one minimized
fact per tenant/event ID even with an empty observer array. Repeating identical
content does not add a cursor; changed content conflicts across all observer pins.
Fact admission and every observer delivery share the originating transaction and
savepoint, so failed admission or rollback publishes neither a fact nor a cursor.

```ts
import { HookChangeFeed } from '@eventiva/contracts/hook';
import { Effect } from 'effect';

const resume = (savedCursor: number) =>
    Effect.gen(function* () {
        const feed = yield* HookChangeFeed;
        const page = yield* feed.read(savedCursor, 50);
        // Apply live release policy before exposing even event existence to a caller.
        // Persist page.cursor only after the consumer durably accepts the page.
        return page;
    });
```

`read(after, limit)` requires both arguments. `after` is a nonnegative safe integer
(use `0` initially); `limit` is an integer from `1` through `100`, with no default.
It returns `{ cursor, events: [{ cursor, event }] }` in increasing tenant-local
commit order, strictly after `after`. An empty page retains `after`. Cursors are
not source sequence numbers, timestamps or delivery acknowledgements. A tenant
head lock lasts through commit, preventing a later committed cursor from hiding an
earlier uncommitted one. This serializes concurrent fact writers within a tenant;
keep originating transactions short and do not perform network IO inside them.
Independent tenants retain independent heads.

Read outside SQL transactions. A plain committed SELECT does not acquire SQLite's
writer lock; ambient transactions are rejected with `transaction-active` to prevent
uncommitted reads. Reopening a client resumes from the saved cursor, independently
of observer retries or acknowledgements. Retention/redrive remain separately authorized
operations; this API cannot update or delete facts.

This is a **trusted host capability**, not a public transport or subscription grant.
The captured authenticated tenant bounds every query, but metadata can itself be
protected. Apply fresh resource/purpose/profile release policy before releasing
facts or their existence to UI, agents, sync or third parties. No endpoint or consumer
is wired here; the existing hook flag remains default-off, release remains default-deny,
and production readiness is not claimed. Missing migration/database returns a bounded
`unavailable` failure; malformed or inconsistent persisted data returns `invalid`,
without attaching SQL, parser details or rejected content.

## Declare observations

Declarations and events use strict Effect Schemas with `format: 1`; extra fields
are rejected, including nested plaintext, inputs, outputs, errors and key handles.
Observations cover the frozen lifecycle operations/states, platform readiness,
execution/step start, finish, fail, retry, cancel, pause and resume, and domain
create/update/delete metadata. There is no extensible before-hook API.

Every declaration field is required; there are no implicit declaration defaults:

| Field          | Contract                                                                        |
| -------------- | ------------------------------------------------------------------------------- |
| `format`       | Exactly `1`                                                                     |
| `pin`          | Tenant, owner `{module, version, generation}`, hook name and positive revision  |
| `delivery`     | Exactly `post-commit`                                                           |
| `target`       | `declarative` or `executable`; executable requires an isolated/trusted callback |
| `capability`   | `observation`, or declarative `additive` with action name/version               |
| `observations` | 1-5 observation kinds                                                           |
| `profiles`     | 1-4 existing sealed security profiles                                           |
| `maxAttempts`  | 1-20, including the first attempt and abandoned leases                          |
| `retryDelayMs` | 1-86,400,000 milliseconds                                                       |
| `timeoutMs`    | 1-300,000 milliseconds per release/delivery call                                |
| `concurrency`  | 1-32 in-flight dispatches per process-local registration                        |
| `capacity`     | 1-10,000 nonterminal deliveries per exact durable pin                           |

`hooks.foundation-enabled` defaults to false. Registration and positive generation
numbers grant neither authority nor readiness. The current kernel snapshot has no
generation field: obtain an actual trusted receipt/lease or a future lifecycle
envelope, never synthesize a generation. Lifecycle observation generation may be
zero; serving pins require verified active/ready provenance. Stage `platform.ready`
only from durable ReadyReceipt evidence, not process-local scope completion.

## Preserve security boundaries

Reuse exactly Baseline (`baseline`), Sensitive (`sensitive`), Restricted/regulated
(`restricted`) and Vault/zero-knowledge (`vault`). Registration grants no decryption.
The internal release policy must revalidate tenant capability, resource and resource
ID, purpose, profile, exact pin and typed minimized projection on every attempt.
Attestation and broker evidence are provider-neutral requirements only; no signing,
attestation or decryption provider is selected here.

All releases default deny. Restricted/Vault and other protected operations reject
executable callbacks. Decrypting and emergency events never enter policy, hook code
or the sink. Financial additive commands are denied. Other additive requests must
go through the canonical ActionHost as a scoped service principal, with fresh
authorization and every normal human approval. A commit or idempotency key never
substitutes for deliberate emergency authorization.

## Delivery and recovery limits

- Admission deduplicates event plus exact pin; changed event/declaration content
  conflicts. All pins stage atomically, including when a caller handles a failure.
  Capacity admission is serialized, so concurrent writers cannot overbook it.
- Streams are `(exact pin, resource name)`, not individual resource IDs. New
  event sequence numbers must increase within that stream; retries block later
  sequences there but not independent streams or observer pins.
- Claims serialize per pin, use the database clock after acquiring its lock, and
  replace expired leases with a fresh fence. Caller timestamps never grant leases.
  Lease lifetime is `2 * timeoutMs + 1000` milliseconds (release plus delivery);
  it is not renewable. A sink
  that outlives its lease can finish externally, but cannot settle the expired lease.
- Settlement validates the full claim, checks the current fence and attempt, rejects
  expiry/stale workers, and accepts identical acknowledged settlement replay. After
  max attempts, expired work becomes a retained dead letter and loses lease authority.
- This is **at-least-once**, not exactly-once delivery. The sink must durably
  deduplicate by the stable idempotency key, including crash after external success
  but before settlement. No callback or external service participates in SQL commit.
- Unload/drain and registration concurrency are process-local. Pending work and
  pins survive worker loss; database claims fence cross-process ownership. Fleet-wide
  active-worker quotas, polling supervision, retention and lifecycle
  publication are integration work, not provided management services.
- Database credentials and the raw SQL client remain trusted host capabilities,
  never plugin capabilities. Tenant isolation here is enforced by the captured
  tenant and pin predicates, not a new database RLS/provider policy. Production
  composition must bound database lock/I/O waits and verify its least-privilege
  database policy; this checkpoint does not provision either.

## Inspect and replay a dead letter

Apply additive `0005.sql` before using operator replay. It adds `hook_redrive` and
indexes, retaining previous terminal attempt/reason and the operator's request UUID.
It changes no existing migration, event, receipt or delivery key. Old dispatchers
remain compatible, but pause dispatchers while an authorized operator redrives a
stream. Application rollback retains this table and history; do not delete facts or
reset the database. No production migration or management endpoint is supplied.

Obtain `HookRecovery` from `hookStorage` or `resourceHookProvider(...).recovery`.
Both operations require an explicit `HookOperatorPolicy` in their Effect environment.
Use `HookOperatorDeny` until the host supplies fresh operator identity/tenant/pin
authorization and its mandatory audit boundary. This capability is not exposed to
plugins, transports or arbitrary subscribers. Inspecting event existence is itself
a metadata release; operator permission is separate from delivery release policy.

```ts
import { HookOperatorDeny, HookRecovery, type HookDeclaration } from '@eventiva/contracts/hook';
import { Effect } from 'effect';

const inspectDeadLetters = (declaration: HookDeclaration) =>
    Effect.gen(function* () {
        const recovery = yield* HookRecovery;
        return yield* recovery.deadLetters(declaration, null, 25);
    }).pipe(Effect.provide(HookOperatorDeny)); // Deliberately denies until authorized composition exists.
```

`deadLetters(declaration, after, limit)` requires the exact immutable declaration,
a previous delivery-key UUID or `null`, and an integer limit from 1 through 100.
There are no argument defaults. It returns terminal rows ordered strictly after
the key, with only `idempotencyKey`, `eventId`, `attempt` and the sealed reason
`denied`, `invalid` or `exhausted`. No fact, raw exception or payload is returned.
Use the final key to page; an empty result ends that inspection, not a durable
change-feed checkpoint.

`replay(declaration, idempotencyKey, requestId)` requires a fresh UUID for each
deliberate operator redrive. Repeat the same request UUID after an ambiguous reply:
the first accepted call returns `true`; subsequent identical calls return `false`
without resetting an active worker or another attempt budget. Reusing a request
for a different pin/key conflicts. Authorization is rechecked even for retries.
Only a dead letter can be redriven; nonterminal or delivered rows conflict.
Request UUIDs are unique per tenant, not per subscription. Concurrent requests
against different pins are arbitrated by the retained history's unique key: one
can commit and the other reports `conflict`, not a storage outage. The losing
delivery stays dead-lettered and receives no new retry budget.

Replay atomically reserves normal pin capacity, retains the terminal attempt/reason
in history, resets the bounded attempt budget and clears the old lease. Event,
observer generation, revision and sink idempotency key never change. Any running
delivery in that pin/resource-name stream prevents redrive until it is quiescent;
already delivered later events are not undone. Redrive deliberately revisits an old
event, so consumers must not interpret it as new chronological domain state.
Repeated delivery still requires durable sink deduplication. Dispatch rechecks the
existing default-off flag and live release policy; operator permission cannot bypass
revocation, protected-data denial or separately authorized additive actions.

Keep database ownership/migration roles separate. The operator adapter inserts
history but supplies no history-update/delete API; grant runtime INSERT/SELECT only
on `hook_redrive`. This is not a tamper-evident audit or protection against the SQL
owner. Inspect/replay reject ambient SQL transactions and sanitize storage errors.

## Persist producer attempts before callbacks

The approved producer protocol creates a fresh durable runtime-incarnation UUID
on each restart, linked to the stable logical runtime name. An invocation attempt
is not a lifecycle fact. Callback success followed by a crash before confirmation
remains unresolved until an authoritative status query establishes what committed;
never infer failure or rerun the callback from the missing acknowledgement.

Apply additive migration `0008.sql` for the selected dialect before building
`hookProducer(dialect, logicalRuntime)` from `@eventiva/integrations.sql/hook-producer`.
Supply the already authenticated `CurrentTenant` and captured `SqlClient`.
Both arguments are required: dialect is `postgres` or `sqlite`; logicalRuntime is
a lower-case dotted/hyphenated name up to 128 characters, with no default. Build
one layer per running incarnation, not per operation. A fresh build always creates
a new persisted UUID; it does not resume ownership or fence another incarnation.
Retain the additive tables on application rollback; disable the opting-in producer,
not the existing feed or its history. No migration is run against production here.

Use the trusted-host `HookProducer` capability in this order:

1. Supply `HookProducerPolicy`. Its `bind(tenant, runtime, incarnation, target)`
   establishes the intended module/version/generation, purpose, security profile
   and transition from authoritative core state, never caller fields or snapshots.
   The tenant is captured by the adapter, not accepted from the request. The
   default `HookProducerDeny` rejects every operation.
2. Call `begin(requestUuid, target)` before the callback. The target is either
   `{ kind: 'module.lifecycle', module, operation }` or
   `{ kind: 'platform.ready', generation }`; generation must be a positive safe
   integer. Retain the UUID as the callback's idempotency/status key. Only
   `fresh: true` permits the first invocation. A duplicate returns `fresh: false`
   and the original attempt/status, including after a restart; conflicting
   content fails. Never invoke again merely because status is unresolved.
3. Let the actual mutation owner call `confirm(requestUuid)` only after the bound
   transition commits. Successful return from an arbitrary public method is not
   that evidence. Confirmation on a predecessor's incarnation is refused.
4. On any ambiguous result, call `inspect(requestUuid)` and then
   `reconcile(requestUuid)`. The latter asks policy for authoritative status using
   the persisted attempt/key, outside SQL transactions. `unresolved` retains the
   attempt without publication. `abandoned` is terminal, publishes nothing and
   requires positive evidence that the intended transition did not commit.
   `committed` confirms the original immutable binding. Terminal retries are
   idempotent; contradictory resolutions conflict. Reconciliation never invokes
   the original callback.

Confirmation stages a metadata-only fact in the existing `HookOutbox` and commits
its status and sequence atomically. Feed failure rolls them all back, leaving the
attempt unresolved. Confirmation acknowledgement loss can be retried without a
second fact. Platform-ready facts are unique per incarnation/generation, not per
logical runtime name. Every fact uses the original attempt UUID as event/commit ID,
the incarnation as resource ID and the `kernel.lifecycle` stream. Purpose, profile
and operation classification all remain policy-bound, including protected/emergency
classes; confirmation cannot downgrade them. This API does not publish business execution events.
The producer persists observer-independent facts with no subscriptions; it does not
automatically enroll observers. Existing default-off dispatch and default-deny
release policy still apply, including before releasing protected metadata.

All operations reject ambient SQL transactions. Policy authorization is rechecked
on inspection, confirmation and reconciliation. Missing and out-of-scope attempts
return policy denial without disclosing another tenant/runtime's request existence.
Keep the policy, producer and raw
feed capability inside the trusted host, never client/plugin context. Policy and
SQL defects become bounded typed failures, with no supplied error text projected.
See the compiling example in `ai-docs/src/13_storage/02_hook_producer.ts`.

`KernelLive` now captures an optional trusted `KernelProducer` at construction.
Its actual mutation owners admit intent before callbacks and confirm at state
publication, including dependent cascades, readiness invalidation and disposal.
`KernelMutation` supplies the immutable projection and callback request key; each
callback namespaces its external idempotency/status by slot. Mandatory disposal
runs finalizers even if admission fails, exposes recovery-required and emits no
unadmitted fact. Ordinary requests fail closed without replay. See the
[kernel composition and recovery contract](kernel.md#opt-into-durable-lifecycle-production)
and compiling `ai-docs/src/21_kernel/03_producer.ts` example.

The kernel retains process-local generations and its named `ReadyReceipt.runtimeId`;
durable platform-ready uses the producer's persisted incarnation. `ActionHost`
still lacks authoritative generation/classification binding and is not wired by
this integration. Real-kernel SQL acceptance complements the distinct-process
journal fixture; neither proves native/UI consumers, production release, full
distributed fencing or complete EVE-45/EVE-261 acceptance.

## Diagnose failures

`transaction-required` means staging used an unpaired transaction, tenant layer or
connection. `transaction-active` means dispatch/settlement ran inside SQL scope.
Storage failure `hook-foreign-transaction` means a returned Storage operation was
called inside another layer's or an unowned SQL transaction; use the paired layer
as the outer transaction owner instead.
`capacity` requires draining/backpressure, not bypassing admission. `conflict`
means immutable pin/event content or sequence was reused inconsistently.
`lease-lost` requires abandoning the stale result, not rerunning the originating
operation. `invalid` fails closed on malformed or inconsistent data. The dispatcher
does not settle an undecoded adapter claim; operators must investigate corrupt rows
through a separately authorized recovery path. `unavailable` retains a typed
failure rather than claiming durable acceptance.

SQLite and disposable loopback PostgreSQL tests cover rollback, replay, independent
retries, capacity races, exact pins, tenants, stale/expired fences, connection loss
and post-commit observer failure. Separate local SIGKILL probes verify real process
loss after sink acceptance with no finalizers, followed by expiry/reclaim and
deduplicated acceptance. None enables a production service.

The same `tests/storage/fixtures/hook-process.mjs` proof also runs a trusted
synthetic feed consumer in distinct processes. It reads committed facts outside
SQL transactions, then atomically persists tenant-scoped metadata application
markers and its cursor in a local sink transaction. SIGKILL after that commit
loses the acknowledgement; reopen resumes without reapplying the accepted fact.
A kill before the next sink commit rolls back both its marker and cursor, so the
next process retries it. This is local consumer crash/reopen evidence only. The
fixture supplies no public endpoint, native execution, release authorization,
concurrent-consumer protocol or general exactly-once external-effect guarantee.

### Verify current release permission after restart

Run the existing default process proof after building the workspace:

```sh
pnpm nx run-many -t build --parallel=1
node tests/storage/fixtures/hook-process.mjs proof sqlite
node tests/storage/fixtures/hook-process.mjs proof postgres
```

Both arguments are required: `proof` selects the self-asserting scenario and the
dialect is `sqlite` or `postgres`; neither has a default. PostgreSQL requires the
approved disposable loopback fixture and `STORAGE_TEST_POSTGRES_URL` described in
[storage conformance](storage.md#run-conformance). Never target a real database.
The unchanged storage test target also runs these assertions; no extra mode,
flag, dependency or production policy implementation is introduced.

The fixture commits one permitted metadata fact and its origin receipt, pauses a
worker after its durable claim, then revokes permission through an independent
connection before killing that worker with SIGKILL. After actual database-clock
lease expiry, a fresh process uses the real dispatcher: current release denial
retains a `dead-letter` settlement with reason `denied`, without invoking the
synthetic sink. The pre-crash claim cannot settle the reclaimed delivery.

An explicitly authorized synthetic operator then replays that dead letter. A
further fresh worker checks the still-revoked policy again and retains another
denied terminal delivery. Replay history preserves the previous denied attempt;
retrying the operator request changes neither history nor terminal state. The
fixture compares exact origin, receipt and fact rows across both denials and
verifies the unchanged event/projection through the public tenant feed.

The independent allowed control still reaches the sink twice after a lost
acknowledgement, using one stable idempotency key and leaving exactly one durable
application. Persisted policy-check rows distinguish these two allowed checks
from the two denied checks. A failed assertion exits nonzero before the existing
JSON success report; that report and its original scenario counts are unchanged.

This is local independent-process SQL evidence with fixture-persisted synthetic
policy, not a production grant store or revocation service. It proves a fresh
check before delivery after reclaim/redrive, not cancellation of a sink already
executing when permission changes. It does not authorize protected payloads,
native release, distributed drain, general exactly-once effects or complete
EVE-262/EVE-45 acceptance. If denial is expected, inspect retained delivery and
operator history; do not bypass policy, change a lease or rerun the origin.

## Inspect worker telemetry

The real dispatcher emits fixed spans for dispatch, claim, release, delivery and
settlement. Follow [Hook worker telemetry](hook-worker-telemetry.md) to allow-list
the bounded names/outcomes in the existing central collector and interpret
timeouts, retries and denied release. No event content or identifiers are attached.
These spans inherit only current process context; durable producer trace handoff
and restart continuity remain separate requirements.
