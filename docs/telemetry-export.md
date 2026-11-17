# Governed diagnostic export and extension audit

The extension substrate exists, but the complete extension-platform acceptance gate is not closed. Local logging/tracing is provider-neutral already; the existing PostHog integration supplied feature flags only. This increment adds a replaceable diagnostic export provider with an independently authorized, tenant-bound release boundary. It does not install a kernel extension, activate ingestion or implement native PostHog Logs/OTLP export.

Audit baseline: `05e07b6dee66cddb594c089959df45bbd9a4c0aa`, inspected on 2026-11-17. Track acceptance on [EVE-257](https://linear.app/resnovas/issue/EVE-257), [EVE-262](https://linear.app/resnovas/issue/EVE-262), [EVE-261](https://linear.app/resnovas/issue/EVE-261), and telemetry on [EVE-44](https://linear.app/resnovas/issue/EVE-44). Historical issue/thread checkpoints and some existing documentation predate combined integration; current source takes precedence for what is present. Approval and acceptance requirements remain on the issues.

## Govern pseudonymous request correlation (EVE-60)

This later checkpoint adds a separate pseudonymous channel; it does not relax
`TelemetryRecord` or its attribute minimizer. The existing synthetic app wrapper
is unchanged. The issuer, consent and key providers below are non-production
fixtures, not authenticated ingress. Keep production denied.

Jonathan selected per-request opt-in, current user consent and exclusion of
protected profiles at 2026-11-17T13:16:16.737Z. His dedicated correlation-key
choice at 13:18:55.545Z requires server-only secret-store/KMS custody, separated
per tenant, destination and purpose. At 15:27:19.582Z he confirmed one-hour
rotation conditional on automatic client renewal without disrupted actions;
the 15:27:26.780Z Puck relay specifies UTC-aligned epochs. See the decision
records on [EVE-60](https://linear.app/resnovas/issue/EVE-60#comment-c07d8ede-14b4-49b1-bb83-0088bae5cd6e)
and [EVE-19](https://linear.app/resnovas/issue/EVE-19#comment-f9740a5b-d126-4a55-8000-12bf9971a349).
These select policy and the fixture checkpoint, not provisioning or deployment.

### Keep identifiers and keys server-local

Inject dedicated non-production fixture keys into
`@eventiva/integrations.telemetry.server/pseudonym`. The adapter uses local
Node HMAC-SHA-256 with 32-byte keys and canonical UTF-8 JSON arrays containing
version, environment, tenant, destination, purpose, UTC epoch, person/session
domain, subject namespace, subject and (for session only) session identifier.
Opaque strings are neither trimmed nor normalized. Full 64-hex outputs avoid
truncation and delimiter ambiguity. This is the bounded implementation design,
not a universal owner-selected crypto standard.

`FixtureCorrelationKeys.get(scope)` must supply matching scope/epoch metadata
and redacted material; unavailable, mismatched or wrong-size keys deny without
fallback. Raw preimages never go to a remote HMAC service. Keys remain in the
server integration and are absent from shared contracts, client tokens, records
and headers. Only owned temporary key copies are cleared; JavaScript cannot
guarantee complete memory zeroization. Do not generate production keys, reuse
authentication/encryption/vendor keys or treat pseudonymization as anonymity.

`fixtureCorrelationLayer(binding, identity, keys, consent)` provides
`CorrelationIssuer` and `CorrelationAuthority`. Its Config `NODE_ENV` must be
explicitly `test` or `development`; missing, `production` or other values deny
at acquisition. This is a fixture safety floor, not a release toggle. Consent is
an injected live Effect returning the current grant expiry, or failing closed;
its trusted closure must bind the current user/session, purpose/destination,
protection and release policy. A request-carried consent boolean is not policy.
The real identity/issuer/consent/key-store implementations remain absent.

### Compose one optional pipeline per request

Use `CorrelationIssuer.issue(true)` only for explicit opt-in. Present the token
to the same trusted identity's `CorrelationAuthority`; possession alone cannot
authorize it. Match every export-binding field and recheck current consent,
session, protection, key and epoch after key preparation and before release.
Restricted/Vault and every nonordinary operation always deny. An unknown profile
fails schema validation rather than becoming Baseline. Sensitive requires its
own applicable current consent/release policy.

`governedCorrelationSinkLayer(binding, policy, { optIn, correlation })` captures
an immutable request lease outside the identity-free central telemetry queue.
The new `telemetry.correlation.pseudonymous.enabled` flag defaults false; existing
`telemetry.export.enabled` and `telemetry.enabled` remain independent. Neither
flag grants consent. Each delivered record and flush rechecks current authority;
the explicit `CorrelationProvider.write(binding, record, correlation, release)`
must run `release` after asynchronous preparation immediately before dispatch.
Old providers cannot silently ignore this new channel. Closed request scopes,
expired tokens and revoked policy fail closed with bounded errors.

The existing `otlpTelemetryLayer` supplies both provider ports through the same
serializer and bounded transport. Its correlated port emits only `$session_id`
and `posthog.distinct_id` span attributes from the validated pair, then reruns
the release check and epoch/scope fence immediately before HTTP dispatch. It
explicitly rejects correlated logs: this is OTLP Traces, not OTLP Logs. Its
identity-free port keeps empty span attributes. Configured `traceparent`,
`tracestate`, `baggage` and raw `X-POSTHOG-SESSION-ID`/`X-POSTHOG-DISTINCT-ID`
headers reject case-insensitively; inbound SDK headers are never copied.

```typescript
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { CorrelationDeny, TelemetryExportDeny } from '@eventiva/contracts/telemetry-export';
import { governedCorrelationSinkLayer } from '@eventiva/runtime/telemetry-correlation';
import { Layer } from 'effect';

// binding, policy, optIn and correlation are trusted harness inputs.
// localProvider is an explicitly injected CorrelationProvider, never a production sink.
const OptionalCorrelation = governedCorrelationSinkLayer(binding, policy, { optIn, correlation }).pipe(
    Layer.provide(localProvider),
    Layer.provide(CorrelationDeny),
    Layer.provide(TelemetryExportDeny),
    Layer.provide(FlagsSafeDefaults)
);
```

Keep this layer optional to business execution. A denied acquisition, failed
write or unsuccessful flush must not fail or replay a business action. The
existing central worker already bounds and counts lossy telemetry failures.
There is no accepting production composition or public mint endpoint here.

### Refresh without interrupting active work

`correlationSession` is a portable Effect model, not installed web/native SDK
wiring. It owns a scoped background refresh fiber and in-memory pseudonym cache.
It issues initially and renews at token expiry (at or before the UTC boundary).
`current(optIn)` reads without network waiting: false/missing opt-in, expired
tokens, closed scope and issuer failure return no correlation. It never sends
raw SDK headers, stores keys on clients, prompts or retries a business request.
Renewal times out after 1000 ms and retries only optional issuance after 1000 ms;
these fixed bounds are not user-configurable rollout switches.

Token expiry is the earliest epoch end, trusted session expiry and current
consent expiry; request disposal independently revokes delivery. At exactly
expiry the old token denies. New requests use the new pair; an in-flight request
finishes its action once but drops old telemetry rather than relabelling it.
No stale-key grace, old/new alias, dual write, backlog or identity merge is added.
Already-dispatched bytes cannot be recalled after consent revocation.

Run `pnpm exec vitest run --config tests/telemetry/vitest.config.mts` for normal
coverage. The correlation suite checks independent HMAC outputs, scope/framing,
live consent/key preparation and dispatch races, token misuse, protected/off
paths, interleaved central spans/error logs, four automatic epochs, an in-flight
boundary action, issuer outage/recovery, safe canaries and closed handles.
The loopback collector test uses real sockets and the actual OTLP serializer
and FetchHttpClient, checks the exact two attributes in two epochs, and proves
late/malformed tokens and raw SDK header configuration send no additional bytes.
Local logs and failed spans do not prove captured exception events, OTLP Logs,
AI/replay association, real authenticated ingress or native-device lifecycle.
EVE-58 is unnecessary for this local proof; actual destination provisioning and
real issuer/consent services still require separate authorization.

## Findings and implementation order

| Area                                   | Present in current source                                                                                                                                                          | Remaining gate                                                                                                                                                                                                                                                               |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contracts and composition, EVE-257/263 | Strict exact manifests, explicit named provider selection, schema-checked callable providers, dependency/provider cycle rejection, whole-graph preflight, scoped Layer composition | Complete versioned distribution envelope spanning target support, provenance, resources, actions, UI, flags and localization; integration evidence beyond local schema/Layer composition                                                                                     |
| Lifecycle, EVE-257/45                  | Authorized lifecycle, generation readiness, lease-aware busy refusal, candidate rollback, cleanup and correlated diagnostics                                                       | Durable authoritative transition producer, runtime incarnation, uncertain callback-attempt reconciliation and outbox binding; central coordinator owns this prerequisite                                                                                                     |
| Discovery/loading                      | Explicit admitted definitions and metadata resolution; declarative UI registry supports permission-filtered tenant discovery                                                       | No installed-package discovery/download/executable loader is evidenced by the kernel. Do not add arbitrary executable loading as a substitute for the approved declarative-first design or claim manifest trust is isolation                                                 |
| Permissions, EVE-43/251/262            | Required injected authorities, fail-closed defaults, tenant-scoped persistence and protected event denials                                                                         | Production principal/release/attestation/broker policies and separately approved concrete security composition. Registration, a signature or a provider handle grants no decrypt right                                                                                       |
| Durable observations, EVE-45/262       | SQL outbox, tenant change feed, fenced claims/settlements, retry/recovery/process fixtures, dispatcher quotas and scoped registrations                                             | Complete authoritative lifecycle/execution/step producer integration and distributed acceptance; optional diagnostic spans are not committed transition facts                                                                                                                |
| Logging/tracing, EVE-44                | Neutral `TelemetryRecord`/`TelemetrySink`, central Effect logger/tracer, bounded worker, console and rotating private files, kernel/resource/hook instrumentation                  | This increment adds governed replaceable export and a PostHog diagnostic-event adapter. Native Logs, OTLP, metrics, production ingestion and kernel-installed exporter integration remain unproved                                                                           |
| UI extensions, EVE-259/50              | Strict data-only definitions, approved-renderer injection, authorized action inventory, masked viewer projections, tenant-bound handles and scoped screen context                  | Approved external component release/catalogue, actual host/masking/route/kernel integration, navigation/error correlation, rendered accessibility and target-specific native proof                                                                                           |
| Reference extension, EVE-260           | Historical word-art sources and local sink preservation fixtures                                                                                                                   | First clean installed extension proving ready-gated exact artwork, durable consumer deduplication, Resources/action/UI contribution, update/uninstall and no host/feature edits                                                                                              |
| Tests and documentation, EVE-261       | Focused kernel/hooks/storage/UI/telemetry suites and static type/cycle guards                                                                                                      | One integrated acceptance fixture across the above boundaries. Source-alias checks cannot close real export-map/build, multi-process/native or security-review gates. Reconcile historical checkpoint wording in canonical specification/timeline during central integration |

Highest-priority sequence: integrate the durable producer/reconciliation prerequisite and this default-off governed exporter; connect authoritative lifecycle mutation owners to the journal; prove the clean EVE-260 reference extension; finish approved renderer and real principal/release integration; run the full EVE-261 acceptance matrix. The journal now supplies durable incarnations and reconciliation, but it does not automatically observe kernel mutations. Feature development must not use a green unit suite as a substitute for those gates.

Source evidence: `packages/contracts/src/module-manifest.ts` and `packages/runtime/src/kernel-runtime.ts` own manifests/composition/lifecycle; `packages/contracts/src/hook.ts`, `packages/runtime/src/hook.ts` and `packages/integrations/sql/src/hook.ts` own observation contracts/dispatch/persistence. `packages/contracts/src/observability.ts`, `packages/runtime/src/telemetry.ts` and `packages/integrations/telemetry.server/src/logger.ts` own current local logging/tracing. `packages/integrations/posthog-server/src/flags.ts` is the pre-existing PostHog adapter. `packages/ui-modules/src/declarative-registry.ts`, `DeclarativeModule.tsx` and `screen-context.ts` supply the declarative UI substrate. The three new exporter source files and two corresponding test files supply this increment's evidence, not the remaining integrated gates.

## Keep host provenance authoritative

`TelemetryExportBinding` contains `tenantId`, exact `moduleId`/`moduleVersion`, nonnegative safe-integer `generation`, static `profile`, existing hook `operation`, `purpose` and `destinationId`. All are required with no defaults; extra fields reject. The destination is a host-approved opaque UUID pseudonym for export, not the raw tenant/principal identifier. This module neither generates it nor selects a cryptographic algorithm.

Build one pipeline per trusted tenant/security scope. Never attach one tenant binding to a mixed global logger. A record has no authority to select a tenant, profile or operation. Restricted/Vault and every non-ordinary operation (protected, financial, emergency, decrypting) fail closed, even if a record falsely declares Baseline and an injected authority allows it. Baseline/Sensitive records must exactly match the host profile. Event existence and timing still need authorization.

`TelemetryExportAuthority.authorize(binding, operation)` must verify the current grant for the exact tenant, purpose, module version/generation, classification and destination. Its operation is `log`, `span` or `flush`. It must apply relevant consent/assurance and secret-free security audit requirements before allowing release. There is no accepting production authority in this increment. `TelemetryExportDeny` rejects everything.

The existing `Flags` service evaluates `telemetry.export.enabled` before every release and flush. Its safe default is `false`. The flag grants no authority and does not replace the existing local telemetry opt-out. Local diagnostics, mandatory audit and app composition are unchanged. This increment does not create a remote flag, configure credentials, provision a project or enable a service.

The governed sink decodes input against the existing `TelemetryRecord`, requires a static registered catalog code, substitutes reviewed catalog text and drops every input attribute. `TelemetryExportPolicy.messages` has the same code/text schemas and 128-entry bound as the existing local catalog. It must contain reviewed source constants, never user or remote text. Authorize when the worker delivers each record, not when it queues it. Revocation rejects queued work and rejects flush; a flush cannot release an old protected payload. An already authorized in-flight network request cannot be recalled after its bytes have left the process.

## Select providers without changing instrumentation

Features continue using `Effect.logInfo` and `Effect.withSpan`. They never acquire `TelemetryExportProvider`, the SDK, credentials or the composition-only sink. The new contract is lower-level than both runtime and integration; neither implementation imports the other.

The exported package subpaths support this deliberately denied optional pipeline. Supply already-approved settings from the existing redacted Config boundary, not a literal secret:

```typescript
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { TelemetryExportDeny } from '@eventiva/contracts/telemetry-export';
import { postHogTelemetryLayer } from '@eventiva/integrations.posthog.server/telemetry';
import { governedTelemetrySinkLayer } from '@eventiva/runtime/telemetry-export';
import { Layer } from 'effect';

// binding, policy and settings are validated trusted composition inputs.
const OptionalRemoteSink = governedTelemetrySinkLayer(binding, policy).pipe(
    Layer.provide(postHogTelemetryLayer(settings, binding)),
    Layer.provide(TelemetryExportDeny),
    Layer.provide(FlagsSafeDefaults)
);
```

`governedTelemetrySinkLayer(binding, policy)` returns `Layer<TelemetrySink, TelemetrySinkFailure, Flags | TelemetryExportAuthority | TelemetryExportProvider>`. `postHogTelemetryLayer(settings, binding)` returns `Layer<TelemetryExportProvider, TelemetrySinkFailure>`. A replacement provider implements `write(binding, record)` and `flush(binding)` with the same exact errors. It must own a Scope, validate the binding and retain no payload queue or retries. Do not silently fan out to a remote sink, replace existing local routing or inject an arbitrary plugin into a transaction. Kernel registration/lease-aware hot replacement remains a separate integration gate; scoped provider disposal is not that proof.

## Understand the adapter's delivery limits

The adapter uses already-approved `posthog-node` 5.63.1. Settings reuse the existing `PostHogOptions`: required redacted project key and required host. The adapter accepts an HTTPS origin only, without userinfo/query/path; it does not select a host, project or credential. No new dependency/version is introduced.

The SDK receives `eventiva.telemetry.log` or `eventiva.telemetry.span` as diagnostic events with code, level, static profile, trace/span/parent IDs, duration and outcome. It does not receive record text, attributes, tenant/module identity or purpose. Only the approved destination pseudonym is the distinct ID. Person-profile processing, GeoIP, flag-called events, local flag polling, automatic exception capture and AI capture are not enabled. Correlation fields do not make this native Logs or OTLP ingestion.

Each write uses `captureImmediate`; automatic retries are zero and automatic batch intervals are disabled. One request is admitted at a time; contention rejects rather than queueing an already authorized payload. The existing telemetry worker supplies bounded buffering and deadlines. Flush is a payload-free completion barrier, not SDK batch flush. Shutdown invokes bounded SDK cleanup without a retained event queue. Unexpected shutdown rejection fails disposal with a bounded tagged error, not the vendor cause.

The pinned SDK reports immediate HTTP/network failures through its error event while resolving its promise. The adapter observes that signal and returns `TelemetrySinkFailure` with `write`; it does not misreport successful delivery. Interruption aborts the private transport. Ownership of an interrupted capture remains until SDK preparation settles, preventing a later capture from lending its live signal to the old payload. Offline or failed delivery is intentionally lossy: no durable spool, retry, delivery receipt, physical exactly-once output or audit guarantee is claimed.

## Validate and troubleshoot

Run the regular telemetry and PostHog server test projects through the wired export maps, dependency edges and project references. The two new files are `tests/telemetry/src/export.spec.ts` and `tests/integrations/posthog-server/src/telemetry.spec.ts`. Isolated source aliases are retained in the earlier lane evidence only; they are not production resolution.

The suite exercises static protected-operation denial, record downgrade, default-off/default-deny, live grant/flag revocation, queue-to-worker revocation, closed handles, scope closure during authorization, per-binding mismatch, decoded real-SDK gzip payloads, HTTP failure, no retries/replay on flush/shutdown and cancellation before and after SDK transport starts. SDK fault injection tests also reject raw vendor error retention.

An `unavailable` error can mean disabled flag, denied grant, excluded scope, expired handle, conflicting binding or contention; it never identifies another tenant. `configuration` means invalid binding/catalog/host/key or SDK acquisition. `invalid-record` means the existing wire schema rejected a record. `write` means unsuccessful immediate delivery. Inspect only bounded health/status, never print the rejected record, credential or vendor Cause. Leave production release denied until the real policy and destination are separately approved.

## Delivery timeline

- Completed before this increment: current kernel/provider/lifecycle substrate, durable hook storage/change feed and local telemetry instrumentation on the audited baseline.
- Current integrated increment: provider-neutral governed exporter contract/runtime, approved-SDK diagnostic adapter, actual package exports/references, focused tests and people/agent documentation. The independent producer journal prerequisite exists without automatic kernel wiring.
- Upcoming: durable lifecycle mutation-owner integration and acceptance, installed reference-extension proof, approved UI target proof and remaining EVE-261 security/distributed gates. Aggregate and exact-head CI evidence is recorded separately; this timeline claims no production activation.

The delivering lane must mirror the delivered status and evidence into the canonical architecture/timeline and linked Linear issues. This audit does not supersede owner decisions or mark a broader issue Done.
