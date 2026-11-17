# Bounded hook worker spans

Read [the worker telemetry guide](../../../docs/hook-worker-telemetry.md).
`HookDispatcherLive` instruments actual dispatch operations; do not simulate
worker evidence by manually wrapping unrelated effects in hook-named spans.

The fixed catalog is `hook.dispatch`, `hook.claim`, `hook.release`, `hook.deliver`
and `hook.settle`. Each invocation emits at most five worker spans, independent
of tenant, event, observer name or attempt count. Children share the current
dispatch parent. Dispatch includes concurrency-permit wait; release and delivery
include the existing per-operation timeout. Nothing persists trace context.

Allow-list only `eventiva.hook.outcome` with these static strings in the existing
central telemetry policy:

```text
unloaded disabled empty delivered retry dead-letter
succeeded failed interrupted timeout claimed settled
```

Use `telemetryLayer` and `TelemetryControl.flush` exactly as exercised by
`tests/runtime/src/hook-telemetry.spec.ts`. That executable example composes the
real dispatcher and central collector, not a new telemetry sink implementation
for production. Keep central telemetry's opt-out, bounded queue and Exit
sanitization. Without a catalog entry the central layer sanitizes span names;
without an attribute allow-list it drops outcome attributes. Restricted/vault
telemetry suppresses attributes. No worker configuration or flag is introduced;
the existing hook flag remains default-off.

Never add event projections, raw causes, failure messages, tenant/resource/module
identifiers, lease keys or idempotency keys to spans. Do not pass whole claims,
events or declarations as tracing options. Disable stack capture for worker spans.

Preserve the uninterruptible lease/settlement boundary and the precise restore,
timeoutOption and exit ordering around release and delivery. Interruption must
still settle before propagating; release interruption dead-letters denied and
delivery interruption retries or exhausts. Keep failed settlement as a failed
dispatch. A `retry` or `dead-letter` dispatch can have a successful Effect exit;
use the safe outcome attribute rather than equating span success with delivery.

This increment supplies no producer handoff, restart continuity, production
exporter, envelope/provenance change, new service or dependency. Keep those
broader EVE-44/EVE-261 requirements open.
