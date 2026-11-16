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
its paired `outbox`; use its exact `storage` for durable Integrity. The authenticated
tenant must match the requested resource tenant. Both SQL adapters share one private
root and actual connection identity, so rollback and replay cover the resource,
immutable history, receipt and staged fact together. Independently created roots
remain foreign even on the same client. See [Resource composition](resources.md#share-a-resource-and-hook-transaction)
and its compiling `writeAndStage` example. This does not supply production release,
principal, approval, sink or lifecycle provenance policy, and enables no flag.

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
  active-worker quotas, polling supervision, authorized redrive/retention and lifecycle
  publication are integration work, not provided management services.
- Database credentials and the raw SQL client remain trusted host capabilities,
  never plugin capabilities. Tenant isolation here is enforced by the captured
  tenant and pin predicates, not a new database RLS/provider policy. Production
  composition must bound database lock/I/O waits and verify its least-privilege
  database policy; this checkpoint does not provision either.

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
