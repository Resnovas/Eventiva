<!-- linear:generated:start -->
# EVE-57: Telemetry F1: Spike Effect OTLP export of traces and metrics from Expo on Hermes

[Live Linear source](https://linear.app/resnovas/issue/EVE-57/telemetry-f1-spike-effect-otlp-export-of-traces-and-metrics-from-expo) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:52.105Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-19](EVE-19.md), [EVE-244](EVE-244.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Prove that `@effect/opentelemetry` `Otlp.layer` can export traces and metrics from the Expo / React Native app on Hermes, because PostHog's React Native SDK has no tracing or metrics API (<issue id="a5a3ce16-9f4f-484c-9a58-4562bfc9e5b3" label="EVE-19" href="https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend" /> matrix).

## Context

* Decided contract: <issue id="a5a3ce16-9f4f-484c-9a58-4562bfc9e5b3" label="EVE-19" href="https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend" /> comment "S6 findings" (accepted by Jonathan 2026-10-31): traces, logs and metrics are vendor-neutral by OTLP config; no collector.
* `Otlp.layer({ baseUrl, headers, resource })` appends `/v1/traces`, `/v1/metrics`, `/v1/logs` to `baseUrl` and runs on Effect `HttpClient` (`@effect/opentelemetry@0.61.0`, `dist/esm/Otlp.js`). PostHog base URL: `https://<region>.i.posthog.com/i`.
* House rules: Effect-TS, `@effect/vitest`, spikes on `spike/*` branches only (Eventiva AGENTS.md house:local).

## Work

1. On a `spike/eve-telemetry-hermes` branch, create a minimal Expo app (or use the existing app if one exists by then) that provides `Otlp.layer` with `FetchHttpClient.layer`.
2. Emit one `Effect.withSpan` span with a child span and one `Metric.counter` and one `Metric.histogram`.
3. Point `baseUrl` at a local OTLP receiver (an OTel Collector in Docker with the `debug` exporter, or any OTLP HTTP sink), not PostHog. No PostHog project is authorised for this spike.
4. Run on iOS simulator and Android emulator in a Hermes release build. Try JSON and protobuf serialisation (`layerJson`, `layerProtobuf`).
5. Test: app backgrounded mid-batch, airplane mode then reconnect, app killed with a pending batch. Record what is lost.
6. Record bundle size added by the exporter.

## Acceptance

* A comment on this issue with: works / does not work per platform and serialisation, payload received at the sink (pasted), the loss behaviour from step 5, the bundle size delta.
* If it does not work: the fallback is native metrics sent as PostHog events behind the same Effect `Metric` API, and native spans dropped or sent from the server only. State which and why.

## Out of scope

PostHog provisioning, code on main, offline queue design (only measure behaviour).

## Done signal

Comment with results and one recommendation: use Effect OTLP on native, or use the fallback.

## Linear comments (1)

### Comment 2bd5d8c6-dd2c-425f-bddc-66963092d38b

Author: GitHub. Created: 2026-10-31T22:45:44.718Z; updated: 2026-10-31T22:45:44.692Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-57/telemetry-f1-spike-effect-otlp-export-of-traces-and-metrics-from-expo) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/824). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
