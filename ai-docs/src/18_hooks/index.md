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
checksums. Do not supply destructive rollback, retention, redrive, provider selection
or remote database writes as part of integration.
