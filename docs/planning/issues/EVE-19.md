<!-- linear:generated:start -->
# EVE-19: S6: Map PostHog and OpenTelemetry support across web, native and backend

[Live Linear source](https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:59.126Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Done (completed) |
| Priority | 0: No priority |
| Labels | Discussion, Product |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-44](EVE-44.md) |
| Related to | [EVE-21](EVE-21.md), [EVE-29](EVE-29.md), [EVE-57](EVE-57.md), [EVE-58](EVE-58.md), [EVE-59](EVE-59.md), [EVE-60](EVE-60.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

A verified capability matrix of which PostHog tools and which OpenTelemetry signals work on each Eventiva runtime, and the vendor-neutral telemetry contract that lets vendors be swapped.

## Context

* Spec: <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> OpenTelemetry and PostHog; D4 (remove Sentry, vendor-neutral, PostHog default).
* House: `.agents/skills/coding-preferences/references/telemetry.md` and the `feature-flags` skill (full required inventory, dedicated project per product, `telemetry: false`).
* Repo: `packages/core/src/observability/` uses `@effect/opentelemetry` and Sentry.
* No PostHog project creation or production change is authorized.

## Work

1. From current PostHog docs and SDK source (posthog-js, posthog-react-native, posthog-node), fill a matrix: rows = every house-required tool (analytics, identity and groups, tracing, logs linked to replay and person, error tracking with source maps, flags with Early Access, metrics, experiments, session replay with Replay Vision, heatmaps, toolbar, AI Observability, prompts with A/B, Skills, Datasets, Semantics); columns = web, iOS, Android, Node backend. Cells: supported, partial, not supported, with doc link and SDK version.
2. For OTel traces, metrics and logs: can PostHog ingest OTLP directly for each signal? If not, state the smallest collector or exporter path, without picking another vendor.
3. Draft the neutral contract: Effect services for events, flags, errors and LLM traces, with PostHog as one Layer and a no-op Layer for `telemetry: false`. Show how a second vendor would plug in.

## Acceptance

Every cell cites a source; gaps have a proposed follow-up.

## Out of scope

Provisioning, code on main.

## Done signal

Comment with the matrix and contract sketch, and one action decision: accept the contract and any collector path proposed.

## Escalation

If a required signal has no PostHog path, bring the export choice back to <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> as a decision.

## Linear comments (4)

### Comment b91fd779-1d52-4694-b137-900c607ad36c

Author: GitHub. Created: 2026-10-31T21:49:02.131Z; updated: 2026-10-31T21:49:02.101Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/786). All replies are displayed in both locations.


### Comment 051ce0d2-313f-49ab-bfc8-fd27fbcb53fe

Author: jonathan@resnovas.com. Created: 2026-10-31T21:55:24.140Z; updated: 2026-10-31T21:55:24.108Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend) (comment ID above). Parent: None. Resolved: Not recorded.

## S6 findings: PostHog and OpenTelemetry capability matrix

Checked 2026-10-31 against the published SDK packages (unpacked and read: `posthog-js@1.444.0`, `posthog-react-native@4.85.1`, `posthog-react-native-session-replay@1.6.0`, `posthog-node@5.61.1`, `@posthog/core` latest, `@posthog/ai@8.17.2`, `@effect/opentelemetry@0.61.0` as pinned in `packages/core`) and the PostHog docs and monorepo READMEs via Context7. Nothing was provisioned. iOS and Android mean the Expo / React Native app (one app, per EVE-13); desktop uses the web SDK, so it inherits the web column.

Legend: Yes = supported in the SDK, Partial = works with a stated workaround, No = not supported, n/a = not meaningful on that runtime.

### 1. PostHog tools by runtime

| House-required tool | Web (posthog-js 1.444.0) | iOS + Android (posthog-react-native 4.85.1) | Node backend (posthog-node 5.61.1) |
| --- | --- | --- | --- |
| Analytics (capture) | Yes | Yes | Yes |
| Identity and groups | Yes: `identify`, `group` | Yes: `identify`, `group` | Yes: `identify`, `groupIdentify` |
| Tracing | Partial: `tracingHeaders` extension only adds session and distinct id headers to fetch/XHR; spans go through OTLP (section 2) | Partial: no SDK tracing; spans via OTLP from Effect, unverified on Hermes (F1) | Yes: SDK traces pipeline (`withSpan`, `traces` option, built on `@posthog/core` PostHogTraces) plus OTLP |
| Logs linked to replay and person | Yes: `logs` extension, `captureLog`, posts to `/i/v1/logs` with session id | Yes: `captureLog`, `posthog.logger.*`, `flushLogs` (min 4.44.0, docs: posthog.com/docs/libraries/react-native) | Partial: no SDK log API; Effect logs go out as OTLP, person and session link needs `posthog.distinct_id` and `$session_id` attributes carried from the request (F4) |
| Error tracking with source maps | Yes: exception autocapture, source maps via PostHog CLI | Yes: JS `captureException`, `PostHogErrorBoundary`; native crashes with `@posthog/react-native-plugin` (`nativeCrashes`, `androidNdkCrashes` from 4.78.0), symbols uploaded at build | Yes: `captureException` (docs: posthog.com/docs/libraries/node), source maps via CLI |
| Feature flags | Yes | Yes (`bootstrap` for cold start) | Yes, including local evaluation |
| Early Access | Yes: `getEarlyAccessFeatures`, `updateEarlyAccessFeatureEnrollment` | Partial: no SDK API; enrol by sending the enrollment event and person property through capture (F3) | Partial: same as native |
| Metrics | Yes: `posthog.metrics.count/gauge/histogram` to `/i/v1/metrics` | Partial: no SDK metrics; OTLP from Effect, unverified on Hermes (F1) | Yes (alpha): `client.metrics` plus OTLP |
| Experiments | Yes, including no-code web experiments | Yes, through flags plus capture | Yes, through flags plus capture |
| Session replay | Yes | Yes: `posthog-react-native-session-replay` 1.6.0 on iOS and Android; not on web or macOS targets of RN | n/a |
| Replay Vision | Yes: server-side scanners over recordings (PostHog `products/replay_vision`) | Yes: same, runs on whatever replay records | n/a |
| Heatmaps | Yes: `heatmaps` extension | No: no heatmap module in the RN SDK (F5) | n/a |
| Toolbar | Yes | No: web-only by design (F5) | n/a |
| AI Observability | n/a: Eventiva runs model calls on the server (EVE-13) | n/a: same | Yes: `@posthog/ai` with `vercel` (AI SDK) and `otel` subpaths; OTLP AI spans to `/i/v0/ai/otel` |
| Prompts with A/B | n/a | n/a | Yes: `@posthog/ai` `Prompts` (`get`, `getAll`, `compile`), A/B by pairing with a flag |
| Skills | n/a | n/a | Partial: PostHog LLM skills store is a project API (`/api/projects/:team/llm_skills`), currently behind PostHog's own `skills-store-in-sandbox` flag (F6) |
| Datasets | n/a | n/a | Yes: `@posthog/ai` `Datasets` |
| Semantics | n/a | n/a | Partial: PostHog semantic layer is a warehouse feature (canonical metrics in `system.information_schema.metrics`), not an SDK; no runtime code needed, adopt when the warehouse is wired (F6) |

Linking AI traces to replay and errors: the web SDK's `tracingHeaders` forwards the session id to our API, the server puts `$session_id` and the distinct id on the AI span and on any captured exception. That is the same propagation F4 needs for logs, so it is one piece of work.

### 2. OpenTelemetry signals: direct OTLP ingestion

PostHog ingests all three signals directly, so no collector is required:

| Signal | PostHog endpoint | Source |
| --- | --- | --- |
| Logs | `POST /i/v1/logs` (also `/v1/logs`), protobuf, JSON or JSONL, project token as `Authorization: Bearer` or `?token=` | posthog `rust/capture-logs/README.md` |
| Traces | `POST /i/v1/traces`, HTTP, project token; stored in `posthog.trace_spans` | posthog `docs/internal/wizard-runs.md`, posthog.com/docs/distributed-tracing |
| Metrics | `POST /i/v1/metrics` (also Prometheus remote-write `/i/v1/prometheus/write`); stored in `posthog.metrics` with exemplar `trace_id` | posthog `rust/capture-apm-metrics/README.md` |
| AI spans | `POST /i/v0/ai/otel`; keeps only spans with `gen_ai.*`, `ai.*` and similar conventions, drops the rest | posthog `products/ingestion/.../fixing-ai-endpoint-rejections.md` |

The smallest exporter path is the one we already depend on: `@effect/opentelemetry` `Otlp.layer({ baseUrl, headers, resource })` appends `/v1/logs`, `/v1/metrics` and `/v1/traces` to `baseUrl` (`dist/esm/Otlp.js`), so `baseUrl = https://<region>.i.posthog.com/i` hits all three. It is built on Effect `HttpClient`, not the Node OTel SDK, which is why it is the candidate for the native app too (F1). AI SDK spans carry `ai.*` attributes, so a second OTLP trace exporter pointed at `/i/v0/ai/otel` gives AI Observability with no PostHog-specific code. Auth for `/i/v1/traces` and `/i/v1/metrics` is documented as the project token; the exact header form is confirmed only for logs and is checked in F2.

A collector becomes useful only for fan-out to two vendors at once, central redaction or tail sampling. Proposed: none now; `baseUrl` can point at a collector later without code changes.

### 3. Vendor-neutral contract (sketch, Effect v3)

Two layers of neutrality:

1. **Traces, logs, metrics: neutral by protocol.** Code uses only Effect's own `Effect.withSpan`, `Effect.log*` and `Metric`. Export is one `OtlpExport` layer built from config. Switching vendor = changing `telemetry.otlp.baseUrl` and headers. No vendor import in any module.
2. **Product telemetry: neutral by service.** Four `Context.Tag` services in core, vendors as Layers in `packages/integrations/*`:

```ts
// packages/core/src/telemetry/ (plain sketch, not committed)
export class ProductEvents extends Context.Tag("eventiva/ProductEvents")<ProductEvents, {
  readonly capture: (e: ProductEvent) => Effect.Effect<void>            // never fails the caller
  readonly identify: (id: ActorId, traits?: Traits) => Effect.Effect<void>
  readonly group: (kind: GroupKind, id: string, traits?: Traits) => Effect.Effect<void>  // tenant = group
}>() {}

export class Flags extends Context.Tag("eventiva/Flags")<Flags, {
  readonly evaluate: <A>(flag: FlagDef<A>) => Effect.Effect<A>          // FlagDef carries the safe default
  readonly enrolEarlyAccess: (flag: FlagKey, on: boolean) => Effect.Effect<void>
}>() {}

export class ErrorReports extends Context.Tag("eventiva/ErrorReports")<ErrorReports, {
  readonly report: (cause: Cause.Cause<unknown>, ctx: ErrorContext) => Effect.Effect<void>  // redacted ctx
}>() {}

export class LlmTelemetry extends Context.Tag("eventiva/LlmTelemetry")<LlmTelemetry, {
  readonly prompt: (key: PromptKey) => Effect.Effect<CompiledPrompt, PromptUnavailable>  // falls back to in-repo prompt
  readonly dataset: (key: DatasetKey) => Effect.Effect<Dataset, DatasetUnavailable>
}>() {}
// LLM generations themselves are OTel gen_ai spans, so they need no service.

// Config schema, not env switches (house feature-flags rule)
telemetry: { enabled: boolean /* telemetry: false */, otlp: { baseUrl, headers, aiTracesUrl? }, product: "posthog" | "none" }

// Composition
const TelemetryLive = Config.telemetry.pipe(Layer.unwrapEffect(cfg =>
  !cfg.enabled ? TelemetryNoop                                  // all four services no-op, no OTLP export
  : Layer.mergeAll(OtlpExport(cfg.otlp), productLayer(cfg.product))))
// productLayer("posthog") = PostHogWeb | PostHogNative | PostHogNode, picked per runtime entrypoint
```

**How a second vendor plugs in:** for traces, logs and metrics, point `otlp.baseUrl` at the new backend or at a collector. For events, flags, errors and prompts, add `packages/integrations/<vendor>` with Layers for the same four Tags and add its name to the `product` enum. Nothing above the integration package changes. Contract tests in `@effect/vitest` run against `TelemetryNoop`, the PostHog Layers and an in-memory test Layer, so a new vendor passes the same suite.

Redaction sits in core, before any Layer: `ErrorContext` and log annotations go through one Schema-based redactor, so every vendor receives the same redacted data.

### 4. Gaps and proposed follow-ups

- **F1** Spike: `@effect/opentelemetry` Otlp exporters on Expo / Hermes (fetch transport, JSON vs protobuf, background flush, offline queue) sending traces and metrics. Fallback if it fails: metrics as PostHog events on native only, behind the same `Metric` API.
- **F2** Smoke test the three OTLP endpoints and auth header against a dev PostHog project. Blocked until a dedicated Eventiva PostHog project is authorised (house: one project per product).
- **F3** Early Access on native and server: implement `Flags.enrolEarlyAccess` with the enrollment event and person property; listing features through the PostHog API from the server.
- **F4** Context propagation: session id and distinct id from clients (web `tracingHeaders`, native equivalent) into server spans, logs, errors and AI spans.
- **F5** Heatmaps and Toolbar are web-only upstream. Accept as a recorded gap for native; no workaround proposed.
- **F6** Skills and Semantics: track upstream; adopt Skills when PostHog's store leaves its flag, Semantics when the warehouse work starts. No runtime code.
- **F7** Version note: `packages/core` pins `@effect/opentelemetry@0.61.0` (Effect 3); npm latest is 4.1.1 (Effect 4). The contract is written for Effect 3; the Effect 4 move is its own decision, not part of this spike.
- Sentry removal stays in EVE-21; this contract is what replaces `SentrySpanProcessor` in `packages/core/src/observability/tracing.ts`.

No required signal lacks a PostHog path, so there is no export-choice escalation to EVE-13.

### Decision requested

Accept the contract above with direct OTLP to PostHog and no collector, and file F1 to F4 as child issues of EVE-13.

---
Recorded by Claude (agent) for Jonathan.


### Comment 506c10de-16dd-4ad9-a934-76638463a4ac

Author: jonathan@resnovas.com. Created: 2026-10-31T22:46:01.133Z; updated: 2026-10-31T22:46:01.088Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend) (comment ID above). Parent: None. Resolved: Not recorded.

Accepted by Jonathan 2026-10-31: direct OTLP to PostHog, no collector, contract as above. Follow-ups: EVE-57, EVE-58, EVE-59, EVE-60. Decision recorded on EVE-13.

Recorded by Claude (agent) for Jonathan.


### Comment f4163e14-2d1e-4ec3-b419-03748de66f00

Author: jonathan@resnovas.com. Created: 2026-10-31T22:47:47.144Z; updated: 2026-10-31T22:47:47.104Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend) (comment ID above). Parent: None. Resolved: Not recorded.

## Recheck 2026-10-31 (asked by Jonathan): native gaps

Rechecked the full `posthog-react-native@4.85.1` build (all JS, not only type files), `@posthog/core` and the PostHog docs pages.

**Correction:** React Native does have `addTracingHeaders` (`dist/posthog-rn.js` calls `patchFetchForTracingHeaders` from `@posthog/core`; docs: posthog.com/docs/libraries/react-native). It adds `X-POSTHOG-DISTINCT-ID` and `X-POSTHOG-SESSION-ID` to matching `fetch` requests, the same as web. So the Tracing cell for iOS + Android is "Partial: tracing headers yes, no SDK spans" and F4 (EVE-60) needs no native header work.

**Confirmed, still gaps in the RN SDK:**
* Spans and metrics: `@posthog/core` now ships `PostHogTraces` and `PostHogMetrics` (used by posthog-node), but the RN SDK does not wire either; no reference to `/i/v1/traces` or `/i/v1/metrics` anywhere in its build. The distributed tracing docs list only Node.js and Python installs plus "any OpenTelemetry-compatible client". The PostHog server accepts OTLP from any client, so the Effect OTLP path (EVE-57) remains the route.
* Early Access: no `getEarlyAccessFeatures` or enrollment code in the RN build; the RN docs page does not mention it. Route stays EVE-59.
* Heatmaps and Toolbar: no code in the RN build; the RN docs page describes neither. Both are posthog-js browser extensions.

Summary: the PostHog server side supports every signal; the gaps are in what the React Native SDK sends, and each has a route through OTLP or capture.

Recorded by Claude (agent) for Jonathan.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
