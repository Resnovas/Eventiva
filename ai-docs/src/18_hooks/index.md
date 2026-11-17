# Hook integration contract

Read `docs/hooks.md` before composing the hook services. The isolated checkpoint
reserves contracts/runtime/SQL `./hook` subpaths but does not add shared exports.
`composition.ts` is a compiling fail-closed wiring example, not a production host.

Shared schemas live only in `packages/contracts/src/hook.ts`. Runtime imports them
one way; publishers do not import runtime hook implementations. The SQL adapter
implements the same contract and imports no dispatcher. Do not add inverse imports,
type-only cycles, root barrels, unknown placeholders or unchecked envelope casts.

Pair `Storage` and `HookOutbox` from one `hookStorage(dialect)` layer and captured
authenticated tenant/client. Stage facts inside that Storage transaction/commit;
claim/settle outside all SQL transactions. Multi-pin staging uses a savepoint.
Every returned Storage operation checks provenance before entering its base method;
foreign nested transaction/commit entry cannot relabel an ambient connection.
Only same-pair nesting is supported.
For resources and hook staging together, resourceHookProvider from integrations.sql/resource
constructs the shared trusted root and returns ResourceProvider plus outbox. Supply its exact
storage to durable Integrity, its outbox to HookOutbox, and the provider to resourceRuntime.
Do not build a second hookStorage layer or relax provenance guards. CurrentTenant must match
the requested tenant. Neither transaction ownership nor a staged fact grants release/sink,
principal, approval or kernel-generation authority; the hook flag remains default-off.
Exact event/pin deduplication, per-resource-name sequence ordering, admission
capacity, fenced leases, database-clock expiry and idempotent settlement are durable
SQL state. Registration, drain, semaphores and flag evaluation are process-local.
No operation callback is retained or reexecuted during delivery.

Keep the four sealed profiles unchanged. Keep release default-deny and reject
executable protected observers, every decrypting/emergency delivery and financial
additive delivery. Production composition must supply trusted live release policy,
a durable deduplicating sink and ActionHost authorization. No hook grants decryption,
human approval, transaction authority or lifecycle publication authority. Identity
must come from an actual trusted receipt/lease or future lifecycle envelope, not a
nonexistent kernel snapshot generation property or a positive integer alone.

Migration 0003 is forward-only and additive in both dialects. Preserve 0001/0002
checksums. Do not supply destructive rollback, retention, provider selection
or remote database writes as part of integration.

Migration 0004 adds hook_feed_head and hook_event. HookOutbox.stage persists a
tenant/event-ID-deduplicated minimized fact even without observers, in the same
transaction/savepoint as all deliveries. HookChangeFeed from hookStorage, or feed
from resourceHookProvider, reads committed tenant-local cursors independently of
subscription/delivery lifetime. read(after, limit) requires a nonnegative safe-integer
cursor and integer limit 1-100; start at 0. Returns cursor plus ordered {cursor,event}
entries strictly after the input, retaining that cursor on an empty page. Never use
source sequence/time as a cursor. The tenant head lock lasts through originating
commit; this deliberately serializes same-tenant fact writers. Reads use committed
SELECT without a write transaction and reject every ambient SQL transaction.

Apply 0004 before new producers, quiesce old binaries before enabling consumers,
and retain tables/data on application rollback while suspending consumers. There
is no inferred historical backfill: old deliveries cannot prove commit order.
Open clients after migration; reopen SQLite clients after a missing-table prepare
failure because the driver's statement cache retains failures.
This trusted host capability is NOT a transport or release grant; apply fresh
resource/purpose/profile policy before exposing metadata or even its existence.
No feed transport/consumer, production policy/sink or new flag enablement is supplied.
The existing hook flag stays default-off. Keep EVE-45/260/261 broader acceptance open.

Migration 0005 adds hook_redrive plus indexed foreign keys, retaining each accepted
operator request UUID, exact pin/key and previous terminal attempt/reason. Existing
facts/deliveries/receipts/checksums are unchanged. Apply before replay; retain tables
on rollback. No migration is run remotely by this increment.
HookRecovery is returned by hookStorage and resourceHookProvider.recovery. Its
deadLetters(declaration, after, limit) and replay(declaration, idempotencyKey, requestId)
effects explicitly require HookOperatorPolicy, with HookOperatorDeny as the safe
composition. Fresh host authorization applies to inspection and every replay retry.
Do not export the capability to plugins or treat it as HookReleasePolicy authority.
deadLetters returns only stable delivery/event IDs, attempt and sealed reason, paged
by strictly increasing UUID key; after is null or a UUID, limit is 1-100, no defaults.
replay returns true on accepted redrive, false for the identical retained request;
changed pin/key conflicts, including simultaneous requests on separately locked
pins. The tenant/request UUID unique constraint arbitrates that race without
resetting the losing delivery or translating a conflict into unavailability.
Only dead letters qualify. Capacity and stream-running
checks run under the existing pin lock. Preserve key/event/generation, clear the old
fence, grant a fresh bounded attempt budget and retain history atomically. New
deliveries still pass current flag/release checks. Previously delivered later events
are not rewound; consumers must handle historical redelivery idempotently. No history
update/delete API is exposed; grant only INSERT/SELECT to runtime, not owner rights.
This history is not the platform's mandatory tamper-evident audit.

Do not synthesize automatic receipt/lifecycle events from snapshots: the action
host has no trusted generation/classification binding, and local Kernel ReadyReceipt
uses a named runtime while hook readiness requires durable UUID provenance. Owner
incarnation/recovery and interrupted-callback reconciliation contracts are pending.
No native/UI consumer, production sink/release policy or exactly-once lifecycle
publication is claimed by operator recovery or a synthetic process fixture.

The committed hook-process fixture separately proves a trusted synthetic feed
consumer can atomically store local metadata application markers plus its cursor,
lose the acknowledgement after commit and reopen without duplicate application.
A SIGKILL before sink commit preserves the old cursor and retries the fact.
Public feed.read remains outside the sink transaction. Do not generalize this
sequential fixture to concurrent consumers, native targets, release policy or
arbitrary external effects; none is activated by the fixture.
