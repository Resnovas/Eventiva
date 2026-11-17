# Actual resource operation spans

Read [Resource telemetry](../../../docs/resource-telemetry.md). The existing
`resourceRuntime` instruments the complete public `Resources.get`, `query`,
`create`, `update`, `history` and `transaction` Effects. Fixed names are
`resource.get`, `resource.query`, `resource.create`, `resource.update`,
`resource.history` and `resource.transaction`. Stack capture is disabled and no
attributes are attached. Do not add identifiers, payloads, fields, queries,
revisions, failure messages or causes to the tracing options.

Compose the existing `telemetryLayer` around the resource consumer, using only
trusted static message-catalog entries for these names. Reuse its bounded queue,
opt-out and Exit sanitization. The public spans alone do not sanitize a foreign
tracer. Features must not acquire exporters or `TelemetrySink`.

`tests/resources/src/resource.spec.ts` is the executable composition example:
real providers and public resource calls run under central telemetry on SQLite
and PostgreSQL. It asserts transaction ancestry, redaction, successes, denied and
invalid reads, conflicting updates, rollback, interruption, optional exporter
failure and opt-out, together with the resulting records/history/outbox.
Do not substitute hand-authored resource-named spans around unrelated effects.

Preserve authorization, exact error/environment generics, input decoding,
transaction ownership and durable atomicity. A nested write's successful span
does not certify the outer commit. Public transaction spans include admission
and complete storage settlement; vendor SQL spans may appear between them and
nested resource operations. Tests must follow ancestry, not hard-code vendor
parent shape. Diagnostic flush may fail while committed business work succeeds.

This increment adds no dependency, runtime toggle, service, sink, production
exporter or persisted trace handoff. It is not restart trace continuity or
completion of EVE-44/EVE-261.
