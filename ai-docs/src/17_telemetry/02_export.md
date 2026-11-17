# Governed telemetry export

## Pseudonymous correlation checkpoint (EVE-60)

Keep the synthetic app wrapper and `TelemetryRecord` v1 unchanged. The explicit
`CorrelationProvider` channel carries only a strict `TelemetryCorrelation`:
`{ version: 1, session: string, person: string, epoch: number, expiresAt: number }`.
Both pseudonyms are full 64-hex HMACs. Reject extra fields. Tokens are not
credentials or consent; never enable raw SDK tracing headers.

Use `CorrelationDeny` by default. `CorrelationIssuer.issue(optIn)` requires true
on every issuance. `CorrelationAuthority.authorize(binding, token)` binds the
pair to the trusted subject/session, exact tenant/module/version/generation,
destination/purpose, current consent, current protection and hourly lease.
`CorrelationProvider.write(binding, record, token, release)` must execute the
fresh `release` Effect after preparation immediately before dispatch, without a
queue/retry. `governedCorrelationSinkLayer` in `@eventiva/runtime/telemetry-correlation`
reuses the existing minimizer and independently requires the default-off
`telemetry.correlation.pseudonymous.enabled` plus ordinary export permission.
Never use a flag or business RBAC as user consent. No accepting production layer
is composed. The original non-correlated provider remains unchanged.

`otlpTelemetryLayer` additionally provides `CorrelationProvider` with the same
serializer/transport. Correlated spans contain exactly `$session_id` and
`posthog.distinct_id`; ordinary spans retain empty attributes. Recheck release,
scope closure and epoch after serialization immediately before HTTP. Correlated
logs fail explicitly; no OTLP Logs support is implied. Configuration rejects
`traceparent`, `tracestate`, `baggage`, `X-POSTHOG-SESSION-ID` and
`X-POSTHOG-DISTINCT-ID` case-insensitively. Never copy inbound SDK headers.

The server-only `fixtureCorrelationLayer` in
`@eventiva/integrations.telemetry.server/pseudonym` accepts trusted redacted
fixture identity, exact-scope injected 32-byte fixture keys and a fresh consent
Effect returning expiry. `NODE_ENV` Config must be test/development; default
production denies. Mismatched key metadata, protected/nonordinary work, invalid
binding, expired session/consent and closed ownership deny. HMAC uses canonical
UTF-8 JSON arrays, distinct person/session domains and environment/tenant/
destination/purpose/epoch separation. Recheck after asynchronous key access.
Keep raw HMAC preimages local, never remote-KMS MAC inputs. Do not provision,
generate deployment secrets, reuse keys or add a dependency.

Jonathan's 2026-11-17T15:27:19.582Z confirmation and separate 15:27:26.780Z
Puck relay select one-hour UTC-aligned epochs with automatic trusted-issuer
refresh. [EVE-60's record](https://linear.app/resnovas/issue/EVE-60#comment-c07d8ede-14b4-49b1-bb83-0088bae5cd6e)
and [EVE-19's record](https://linear.app/resnovas/issue/EVE-19#comment-f9740a5b-d126-4a55-8000-12bf9971a349)
supersede the older lifetime-pending proposal only. `correlationSession` is the
portable scoped refresh model: immediate background issue, renewal at token
expiry, 1000 ms issuance timeout/retry delay, and nonblocking
`current(optIn): Effect<Option<TelemetryCorrelation>>`. Dispose on logout. No
token at a boundary means optional linkage loss, never prompts, failed/retried
business requests or dropped actions. Old in-flight telemetry drops; it is not
rehashed/replayed. Expiry is the minimum epoch/session/consent deadline;
request-scope closure separately revokes final dispatch.

The complete composition example is in the
[people guide](../../../docs/telemetry-export.md#compose-one-optional-pipeline-per-request);
`tests/telemetry/src/correlation-export.spec.ts` typechecks and executes issuer,
request sink and central worker compositions using the actual package exports.
Run the normal telemetry suite without coverage overrides. Tests include a
four-epoch session, an in-flight boundary action finishing once, issuer outage,
revocation, misuse and two interleaved spans/error-log pipelines. This is not
just serializer inspection: a real loopback HTTP collector checks two epochs'
exact correlation attributes and zero extra requests for late/invalid tokens
and raw SDK header settings. This still does not prove
real web/native/authenticated-ingress execution, captured errors, replay/AI
association, production key custody or release. Report aggregate checks and
exact-head CI separately; keep EVE-60 open.

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

Keep decoded bindings and request tokens private to the runtime. Each authority
and provider invocation receives a fresh scalar view, including export flush
and correlation's final release callback. Copies cover all binding/token fields;
no contract, new dependency or rollout option is added. Retained adapter writes
cannot alter a later profile comparison, grant binding, pair or hourly expiry.
This isolates references, not arbitrary executable adapter behavior.

For example, changing a provider's Baseline binding view to Sensitive still
leaves Sensitive records denied `unavailable` and Baseline records exporting
under the original binding. Changing a released token's person/session leaves
the next write's pair unchanged; advancing epoch/expiresAt cannot extend the
request beyond the original UTC-hour boundary. Expired writes and flush deny.
`export.spec.ts` and `correlation-export.spec.ts` retain untouched controls and
red-first authority/provider regressions. Run the normal telemetry suite above;
keep existing opt-in, protected-floor, both flag, disposal, minimization and
automatic refresh tests. EVE-60/EVE-44 remain open; this fixture proof is not
ingestion, real-key custody or production authorization.

Use only authenticated host bindings, one per tenant/security scope. Never classify a mixed global stream with one tenant binding. Deny Restricted/Vault and all protected/financial/emergency/decrypting operation scopes independently of record claims and injected policy. Record profile must match static host profile. The flag is `telemetry.export.enabled`, default false, checked on every write and flush. Neither flags nor admission grant decryption or release authority.

Require catalog membership, replace text, drop all attributes and reauthorize when the worker delivers. The provider rechecks the complete binding. Remote output contains neither tenant identity nor free text; the host must approve a separate opaque destination pseudonym. Do not route directly from feature code to a provider, console, file or SDK. No host, kernel or app composition changes are part of this increment.

SDK delivery is immediate, zero-retry and bounded by a 1000 ms request deadline. It accepts one capture at a time, rejecting contention. Flush carries no event; shutdown has no queued payload to replay. Retain cancellation ownership until the SDK promise settles so late preparation cannot borrow a new request's signal. HTTP failure uses the SDK error event and returns a safe typed failure. Unexpected shutdown rejection becomes a bounded finalizer defect; raw vendor errors are discarded.

This is scoped transport proof, not kernel-installed extension lifecycle, native ingestion, distributed delivery or a mandatory audit implementation. Existing local logging/configuration remain unchanged. Do not enable a remote destination or flag, add dependencies, choose crypto providers or claim the EVE-260 reference fixture without the remaining integration/approval gates.

## Integrated verification

Run the regular telemetry and PostHog server test projects with their actual package exports. Their coverage includes the new contract, governed sink and adapter. The delivering lane records aggregate verification, graph and exact-head CI separately from isolated transport proof. Context7 was quota-blocked during the original export implementation; installed pinned SDK source/declarations supplied that vendor contract. Graphify Cloud memory/gateway were unavailable; local graph/source and connected Linear issue reads supplied the audit evidence.
