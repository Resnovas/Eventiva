# Resource operation telemetry

Use resource spans to inspect real reads, writes and transaction boundaries
without exporting record contents. Spans are optional diagnostics, not immutable
resource evidence or permission to access data.

## Observe resource work

1. Compose the existing resource provider and `resourceRuntime` as described in
   [Resources](resources.md). Keep live authorization and tenant binding enabled.
2. Install the existing `telemetryLayer` around the consuming effect. Add the six
   fixed names below to its trusted static message catalog.
3. Call the public `Resources` methods. They inherit the current Effect tracing
   context; a resource transaction contains its nested resource operations.
4. Flush `TelemetryControl` when a completed local diagnostic snapshot is needed.
   Inspect exporter health separately from the resource result.

| Span                   | Includes                                                                        |
| ---------------------- | ------------------------------------------------------------------------------- |
| `resource.get`         | Authorization, declaration and identifier validation, read and decode           |
| `resource.query`       | Authorization, filter validation, query and record decoding                     |
| `resource.create`      | Authorization, input validation and the atomic create boundary                  |
| `resource.update`      | Authorization, patch/revision validation and the atomic update boundary         |
| `resource.history`     | Authorization, identifier validation and revision history read                  |
| `resource.transaction` | Transaction authorization, nested work and the outer storage commit or rollback |

For example, execute this effect using the existing authenticated resource
composition and telemetry layer. The public transaction surrounds both writes:

```typescript
const work = api.transaction(
    Effect.gen(function* () {
        const created = yield* api.create(resource, recordId, initialValue);
        return yield* api.update(resource, recordId, created.revision, patch);
    })
);
```

The executable example in `tests/resources/src/resource.spec.ts` also checks
queries, history, denial, invalid identifiers, revision conflicts, rollback,
interruption, exporter failure and opt-out on both supported SQL dialects.

## Preserve the privacy boundary

Resource spans have static names, disable stack capture and attach no attributes.
They do not contain caller, tenant, resource or record identifiers, field names,
values, queries, patches, raw errors or secrets. Use the existing central
telemetry layer to sanitize span exits before a sink sees them. An arbitrary
third-party tracer does not inherit that sanitization guarantee.

The existing telemetry options remain unchanged: `telemetry.enabled` defaults to
`true`, `telemetry.capacity` to `256` and `telemetry.timeoutMs` to `1000`. No new
resource setting, exporter or flag is introduced. See [Telemetry](telemetry.md)
for accepted bounds and composition details. Disabling telemetry does not change
resource authorization, transactions or mandatory evidence.

## Interpret results and missing records

- A successful nested create span can still belong to an outer transaction that
  later rolls back. Inspect the outer transaction result and persisted resource
  history, not only the nested span.
- SQL tracing may introduce intermediate spans between a public resource
  transaction and nested operations. Follow ancestry rather than assuming direct
  parentage.
- A `failed` span does not expose the underlying cause. Handle the typed resource
  failure through the caller's existing error path.
- A `redacted` code means the trusted telemetry catalog does not recognize that
  name. Add only the fixed names above, never runtime-derived labels.
- Missing records can result from opt-out, bounded-queue drops or sink failure.
  Optional exporter failure cannot undo a committed write or authorize a denied
  operation. A failed diagnostic flush is not a failed resource transaction.

These spans are process-local. They do not persist trace context, prove
producer-to-worker continuity after a restart, activate an application, or clear
the broader production, security or native acceptance gates.
