# Hook worker telemetry

Use worker spans to distinguish dispatch admission, lease claim, release policy,
observer delivery and durable settlement. A span measures one running operation;
it does not grant authority or replace the durable delivery record.

## Observe a dispatch

1. Compose `HookDispatcherLive` with the existing outbox, release policy, sink and
   flags services described in [Hooks](hooks.md).
2. Install the existing `telemetryLayer` around the effect that runs dispatch.
   Add the fixed names and allowed outcome values below to its trusted static
   policy. No new sink, service or worker-specific configuration is required.
3. Register an observer, run its `dispatch` effect and flush `TelemetryControl`
   when you need a completed diagnostic snapshot.
4. Find the `hook.dispatch` span and inspect its children. A completed dispatch
   has at most four worker child spans. Disabled and unloaded dispatches have none.

| Span            | Operation                                                  | Successful outcome values                                            |
| --------------- | ---------------------------------------------------------- | -------------------------------------------------------------------- |
| `hook.dispatch` | One dispatch, including waiting for its concurrency permit | `unloaded`, `disabled`, `empty`, `delivered`, `retry`, `dead-letter` |
| `hook.claim`    | Outbox lease claim                                         | `claimed`, `empty`                                                   |
| `hook.release`  | Current release authorization, including its timeout       | `succeeded`, `timeout`                                               |
| `hook.deliver`  | Actual sink or executable callback, including its timeout  | `succeeded`, `timeout`                                               |
| `hook.settle`   | Final outbox settlement                                    | `settled`                                                            |

All spans annotate only `eventiva.hook.outcome`. Failures use `failed` and
interruptions use `interrupted`; no error or cause is added as an attribute.
Names and outcomes are fixed, not derived from declarations or events. No event
payload, tenant, resource, module, lease, idempotency key or secret is attached.
Use the central telemetry layer to sanitize span exits before any exporter sees
them; arbitrary third-party tracers are not a substitute for that boundary.

## Preserve delivery behavior

Do not interpret a successful span exit as successful delivery. For example, a
delivery timeout is captured by the dispatcher and normally produces a retry;
`hook.dispatch` then records `retry`, not `delivered`. An exhausted retry budget
produces `dead-letter`. Release denial or timeout dead-letters without delivery.
External interruption still propagates after the existing protected settlement:
delivery interruption settles retry (or exhausted dead-letter), and release
interruption settles denied dead-letter. Settlement failure remains an outbox
failure, not a successful dispatch.

The hook flag remains default-off. Telemetry uses the existing global opt-out and
bounded exporter queue; these spans do not enable hooks or change timeout,
retry-delay, concurrency, lease, drain or settlement settings. They emit no new
logs, events or metrics.

## Troubleshoot missing details

- If span codes appear as redacted, add the five fixed names to the trusted
  telemetry message catalog. Unknown codes are intentionally sanitized.
- If outcome attributes are absent, allow-list `eventiva.hook.outcome` and the
  fixed values above in the telemetry policy. Restricted and vault telemetry
  records intentionally suppress attributes.
- If no record appears, check the existing telemetry opt-out and exporter health.
  A full bounded queue can drop records without blocking business work.
- If no release or delivery child appears, inspect the dispatch result. Disabled,
  unloaded and empty work never reaches delivery. An invalid or forbidden claim
  may settle directly without release.

These spans are process-local. They inherit only the current Effect tracing
context; no producer trace is persisted in the outbox, and no producer-to-worker
continuity after restart is claimed. Delivery remains at-least-once, with durable
idempotency and fresh release authorization independent of telemetry.

Run the regression suite from the repository root:

```sh
pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/hook-telemetry.spec.ts tests/runtime/src/hook.spec.ts --coverage.enabled=false
```

The tests drive the real dispatcher with an in-memory protocol fixture and the
central telemetry collector. They check span parentage, timeout duration, safe
outcomes, redaction and exact settlement without claiming durable SQL or restart
trace continuity.
