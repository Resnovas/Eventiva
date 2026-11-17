# Governed telemetry export

The existing `TelemetrySink` remains the composition-only log/span port. `TelemetryExportProvider` is a replaceable, no-payload-queue transport below a separate runtime release boundary. The PostHog implementation sends minimized correlated diagnostic events, not native Logs or OTLP. See [the audit and runbook](../../../docs/telemetry-export.md) and [EVE-44](https://linear.app/resnovas/issue/EVE-44), [EVE-262](https://linear.app/resnovas/issue/EVE-262), [EVE-261](https://linear.app/resnovas/issue/EVE-261).

## Frozen public API

- `@eventiva/contracts/telemetry-export`: `TelemetryExportBinding`, `TelemetryExportPolicy`, `TelemetryExportOperation`, `TelemetryExportAuthority`, `TelemetryExportDeny`, `TelemetryExportProvider`.
- Binding: `{ tenantId: TenantId, moduleId: ModuleId, moduleVersion: ModuleVersion, generation: number, profile: TelemetryRecord['profile'], operation: HookEvent['operation'], purpose: ModuleId, destinationId: string }`. Schema enforces nonnegative safe generation and UUID destination pseudonym, with exact required fields.
- Policy: `{ messages: Readonly<Record<string,string>> }`, reusing existing record code/text constraints and at most 128 entries.
- `TelemetryExportOperation = 'log' | 'span' | 'flush'`.
- `TelemetryExportAuthority.authorize(binding, operation): Effect<void, TelemetrySinkFailure>`. No accepting default; check fresh complete grant and secret-free audit at delivery.
- `TelemetryExportProvider.write(binding, record): Effect<void, TelemetrySinkFailure>`; `flush(binding): Effect<void, TelemetrySinkFailure>`. No extra environment, public erased types, retained vendor Cause or payload backlog.
- `@eventiva/runtime/telemetry-export`: `telemetryExportFlag` and `governedTelemetrySinkLayer(binding, policy): Layer<TelemetrySink, TelemetrySinkFailure, Flags | TelemetryExportAuthority | TelemetryExportProvider>`.
- `@eventiva/integrations.posthog.server/telemetry`: `postHogTelemetryLayer(settings: PostHogOptions, binding): Layer<TelemetryExportProvider, TelemetrySinkFailure>`.

Keep the dependency direction runtime -> contracts <- integration. The only hook schema dependency reuses its existing operation taxonomy; it adds no hook engine. The sample composition in the people guide stays denied with `FlagsSafeDefaults` and `TelemetryExportDeny`. Exact API imports and Layer composition execute in the test files, including the existing bounded telemetry worker. The three package subpaths and workspace references are wired; verify their real built declarations, not isolated aliases.

## Security and lifecycle invariants

Use only authenticated host bindings, one per tenant/security scope. Never classify a mixed global stream with one tenant binding. Deny Restricted/Vault and all protected/financial/emergency/decrypting operation scopes independently of record claims and injected policy. Record profile must match static host profile. The flag is `telemetry.export.enabled`, default false, checked on every write and flush. Neither flags nor admission grant decryption or release authority.

Require catalog membership, replace text, drop all attributes and reauthorize when the worker delivers. The provider rechecks the complete binding. Remote output contains neither tenant identity nor free text; the host must approve a separate opaque destination pseudonym. Do not route directly from feature code to a provider, console, file or SDK. No host, kernel or app composition changes are part of this increment.

SDK delivery is immediate, zero-retry and bounded by a 1000 ms request deadline. It accepts one capture at a time, rejecting contention. Flush carries no event; shutdown has no queued payload to replay. Retain cancellation ownership until the SDK promise settles so late preparation cannot borrow a new request's signal. HTTP failure uses the SDK error event and returns a safe typed failure. Unexpected shutdown rejection becomes a bounded finalizer defect; raw vendor errors are discarded.

This is scoped transport proof, not kernel-installed extension lifecycle, native ingestion, distributed delivery or a mandatory audit implementation. Existing local logging/configuration remain unchanged. Do not enable a remote destination or flag, add dependencies, choose crypto providers or claim the EVE-260 reference fixture without the remaining integration/approval gates.

## Integrated verification

Run the regular telemetry and PostHog server test projects with their actual package exports. Their coverage includes the new contract, governed sink and adapter. The coordinator records aggregate verification, graph and exact-head CI separately from isolated transport proof. Context7 was quota-blocked during implementation; installed pinned SDK source/declarations supplied the vendor contract. Graphify Cloud memory/gateway were unavailable; local graph/source and connected Linear issue reads supplied the audit evidence.
