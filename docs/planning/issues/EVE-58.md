<!-- linear:generated:start -->
# EVE-58: Telemetry F2: Smoke test PostHog OTLP endpoints and auth for logs, traces, metrics and AI spans

[Live Linear source](https://linear.app/resnovas/issue/EVE-58/telemetry-f2-smoke-test-posthog-otlp-endpoints-and-auth-for-logs) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:30:54.087Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Outstanding, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-19](EVE-19.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Confirm the exact URLs and auth header PostHog accepts for each OTLP signal, so the Effect `Otlp.layer` config in the accepted contract is correct.

## Context

* Decided contract: <issue id="a5a3ce16-9f4f-484c-9a58-4562bfc9e5b3" label="EVE-19" href="https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend" /> comment "S6 findings" (accepted 2026-10-31).
* Documented endpoints: `POST /i/v1/logs` (Bearer project token or `?token=`, confirmed in posthog `rust/capture-logs/README.md`), `POST /i/v1/traces`, `POST /i/v1/metrics` (project token, header form not confirmed), `POST /i/v0/ai/otel` (keeps only `gen_ai.*` / `ai.*` spans).
* House: one dedicated PostHog project per product; never reuse an existing project.

## Blocked by

A dedicated Eventiva PostHog project (dev) that Jonathan has authorised. Do not create it without his go-ahead. Set Handoff = Blocked until then.

## Work

1. Write a small Effect script (Node, `@effect/vitest` style or a `scripts/` entrypoint) that provides `Otlp.layer({ baseUrl: "https://<region>.i.posthog.com/i", headers: { Authorization: "Bearer <token from secret store>" } })` and emits one span, one log line and one counter.
2. Run once with the Bearer header and once with `?token=`; record which works per signal.
3. Send one span with `gen_ai.*` attributes to `/i/v0/ai/otel` with a second exporter; confirm it appears in LLM analytics and that a plain span sent there is dropped.
4. Query `logs`, `posthog.trace_spans` and `posthog.metrics` with HogQL to confirm arrival.
5. Never put the token in the repo, the issue or chat; read it from the project secret store.

## Acceptance

Comment with a table: signal, URL, auth form that worked, HogQL row count. Update the <issue id="a5a3ce16-9f4f-484c-9a58-4562bfc9e5b3" label="EVE-19" href="https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend" /> matrix comment if anything differs.

## Done signal

Comment posted and the config values for `telemetry.otlp` are final.

## Linear comments (1)

### Comment 9a68f7b2-48af-48a2-a3bd-0bdf94774011

Author: GitHub. Created: 2026-10-31T22:45:46.157Z; updated: 2026-10-31T22:45:46.050Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-58/telemetry-f2-smoke-test-posthog-otlp-endpoints-and-auth-for-logs) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/825). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
