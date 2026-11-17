# Current hook release authorization after restart

This EVE-262/EVE-45 acceptance slice extends the default
`tests/storage/fixtures/hook-process.mjs` invocation, not production policy.
Read [the people guide](../../../docs/hooks.md#verify-current-release-permission-after-restart)
and [storage fixture restrictions](../../../docs/storage.md#run-conformance).

## Execute the proof

Build package exports with `pnpm nx run-many -t build --parallel=1`, then run:

```sh
node tests/storage/fixtures/hook-process.mjs proof sqlite
node tests/storage/fixtures/hook-process.mjs proof postgres
```

`proof` and the dialect are required, with no defaults. PostgreSQL uses only the
existing approved disposable loopback fixture via `STORAGE_TEST_POSTGRES_URL`.
The normal storage Nx test gate invokes the same default proof under its existing
60-second subprocess bound. Do not add a second mode or change its JSON parser.

## Preserve the evidence boundary

- A permitted synthetic metadata fact and originating receipt commit once through
  paired Storage/HookOutbox. A worker pauses after durable claim, not inside SQL.
- The parent revokes the persisted fixture permission on an independent connection
  before SIGKILL. Restart waits for actual database-clock lease expiry; no caller
  timestamp or fixture rewrite advances a lease.
- A new worker uses HookDispatcherLive with a policy that rereads SQL on every
  attempt. Reclaim retains `dead-letter` / `denied` at attempt two, and the old
  claim returns `lease-lost`. No sink invocation or application exists for it.
- HookRecovery.replay receives explicit synthetic HookOperatorPolicy authority.
  That grants redrive only. A further fresh dispatcher worker checks the still
  revoked policy and retains `dead-letter` / `denied` at fresh attempt one.
  Retained hook_redrive evidence keeps the earlier denied attempt/reason; repeating
  the same operator request returns false without changing history or delivery.
- Exact hook_event, action_commit and origin rows remain equal across recovery.
  Public HookChangeFeed.read returns the original event/projection once. Existing
  synthetic consumer cursor/application rows are unchanged by this scenario.
- An independent permitted control records two current allow checks and two sink
  attempts after acknowledgement loss, but one applied row under its stable key.
  The revoked scenario records two current denials and zero sink attempts.

Assertions execute before the unchanged success report, so an incorrect result
fails the existing wrapper even though its parser knows no new report fields.
Do not infer full acceptance from the historical report's original counts.

The injected flag and SQL policy are fixture-only. HookReleaseDeny, production
default-off behavior and protected-event restrictions are unchanged. This does
not supply a production grant store, cancel an already-running sink, prove
distributed drain/native execution or establish arbitrary exactly-once effects.
Keep both broad issues open and retain separate authorization for production.
