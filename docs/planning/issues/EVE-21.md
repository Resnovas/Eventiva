<!-- linear:generated:start -->
# EVE-21: Remove Sentry from core and make telemetry export vendor-neutral

[Live Linear source](https://linear.app/resnovas/issue/EVE-21/remove-sentry-from-core-and-make-telemetry-export-vendor-neutral) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:30:56.786Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Code, Decision: Audit needed, Delivery: Implementation pending, Removal |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-44](EVE-44.md) |
| Related to | [EVE-19](EVE-19.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Core has no vendor dependency for telemetry: it emits OpenTelemetry through `@effect/opentelemetry`, and any vendor is composed in from an integration package.

## Context

* Decision D4 on <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> (2026-10-31): remove Sentry, vendor-neutral, easy to switch, PostHog default per house.
* `packages/core/src/observability/tracing.ts` imports `@sentry/node` and `@sentry/opentelemetry` and inits Sentry when `SENTRY_DSN` is set; `packages/core/package.json` lists both.
* Follow `AGENTS.md` (Effect rules, docs twice, tests, graph refresh) and `.agents/skills/coding-preferences/references/telemetry.md`.

## Work

1. Remove the Sentry imports, init and span processor; remove both packages from `packages/core/package.json` and the lockfile.
2. Keep a configurable OTLP exporter Layer in core driven by `Config` (endpoint, headers, enabled), with a no-op Layer when `telemetry: false`.
3. Search the repo (`rg -i sentry`) and remove or replace every remaining reference, including docs and env examples.
4. Update `docs/` and `ai-docs/src` for the new configuration; regenerate `LLMS.md`.
5. Add tests with `@effect/vitest`: exporter Layer enabled and disabled; no Sentry module resolvable from core.

## Acceptance

`rg -i sentry packages` returns nothing; `pnpm exec nx run-many -t lint,typecheck,test --projects=core` passes (paste output); a sample span reaches a local OTLP collector or an in-memory exporter in tests.

## Out of scope

The PostHog integration package itself (follows S6 / <issue id="a5a3ce16-9f4f-484c-9a58-4562bfc9e5b3" label="EVE-19" href="https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend" />).

## Done signal

Commit landed per the repository's delivery rule (see <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> item 12), comment with commands and output.

## Linear comments (1)

### Comment 0d826030-8813-4fdf-b904-f29d68ad5312

Author: GitHub. Created: 2026-10-31T21:49:35.682Z; updated: 2026-10-31T21:49:35.659Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-21/remove-sentry-from-core-and-make-telemetry-export-vendor-neutral) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/788). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
