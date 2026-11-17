<!-- linear:generated:start -->
# EVE-60: Telemetry F4: Propagate session and person context from clients into server spans, logs, errors and AI spans

[Live Linear source](https://linear.app/resnovas/issue/EVE-60/telemetry-f4-propagate-session-and-person-context-from-clients-into) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:30:54.803Z. Generated source mirror; edit Linear and refresh, not this region.

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
| Related to | [EVE-19](EVE-19.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Every server-side span, log line, captured error and AI span carries the caller's PostHog session id and distinct id, so logs link to Session Replay and Person and AI Observability links to replay and errors (house telemetry must-haves).

## Context

* Decided contract: [EVE-19](<https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend>) comment "S6 findings" (accepted 2026-10-31).
* posthog-js has a `tracingHeaders` extension that adds session id and distinct id headers to fetch/XHR (`lib/src/extensions/tracing-headers.d.ts`, posthog-js 1.444.0). posthog-react-native 4.85.1 has the same option, `addTracingHeaders` (adds `X-POSTHOG-DISTINCT-ID` and `X-POSTHOG-SESSION-ID` to matching fetch requests; corrected 2026-10-31, see <issue id="a5a3ce16-9f4f-484c-9a58-4562bfc9e5b3" label="EVE-19" href="https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend" /> recheck comment).
* posthog-node has no log API, so server logs go out as OTLP via Effect and need these attributes to link.

## Work

1. Read posthog-js `tracing-headers` to get the exact header names. Record them in a comment.
2. Clients: enable `addTracingHeaders` (native) and the web equivalent for Eventiva's API hostnames only, and confirm Effect `FetchHttpClient` requests go through the patched global fetch. If they do not, add the two headers in the app's `HttpClient` layer instead.
3. Server: one Effect middleware for the HTTP and RPC entrypoints that reads the headers through `Schema`, validates them, and puts them on a `FiberRef` / span attributes (`posthog.distinct_id`, `$session_id`) and `Effect.annotateLogs`, so every span and log below inherits them.
4. `ErrorReports.report` and AI span creation read the same context; AI spans set the attributes PostHog uses to link generations to sessions (confirm names from `@posthog/ai` source).
5. Agents calling actions without a browser session: use the agent run id as the session-like id and the delegating user as the distinct id; document it.
6. Respect `telemetry: false`: no headers sent, no attributes set.
7. Tests with `@effect/vitest` for header parsing, inheritance into child spans and logs, and the telemetry-off path.

## Acceptance

A request from web and from native produces a server span, a log line and an error event that all show the same session and person in PostHog (verify once F2's dev project exists; until then, verify with an OTLP debug sink).

## Done signal

Merged to main with tests and docs (people docs and ai-docs).

## Linear comments (1)

### Comment 7f7ecc12-701e-425c-86c4-d949875c97eb

Author: GitHub. Created: 2026-10-31T22:45:49.160Z; updated: 2026-10-31T22:45:49.130Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-60/telemetry-f4-propagate-session-and-person-context-from-clients-into) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/827). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
