<!-- linear:generated:start -->
# EVE-55: P1.8d Build chat threads and message projections

[Live Linear source](https://linear.app/resnovas/issue/EVE-55/p18d-build-chat-threads-and-message-projections) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:56:17.612Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Audit needed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-47](EVE-47.md) |
| Children | None recorded |
| Blocked by | [EVE-42](EVE-42.md), [EVE-45](EVE-45.md) |
| Blocks | [EVE-186](EVE-186.md), [EVE-212](EVE-212.md) |
| Related to | [EVE-13](EVE-13.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

People see and continue agent conversations on any device, and every surface (chat UI, HTTP, MCP, ACP) reads the same thread.

## Context

Upstream reference at 6b5cf68: `chat-threads/` (thread store and change emitter), `agent/thread-data-builder.ts` (5k lines), `thread-message-projection.ts`, `run-thread-projector.ts`, `persist-agent-turn.ts`, `tool-result-images.ts`.

## Scope

1. Threads and messages as tenant-scoped tables (P1.3) with actions to list, open, rename, archive and share.
2. Messages stored in the AI SDK UI message format; a projection builds model input from a thread (trimming, tool results, images).
3. Thread changes emitted on the change feed (P1.6) so other devices update live.
4. Offline: threads readable on device through the sync engine (S4).

## Acceptance criteria

* A turn persisted from a stream is read back identically through HTTP and the projection test.
* Projection respects a context-size limit in a test with a long thread.

## Constraints

Effect-TS v3; ship to main with check results.

## Done signal

Merged with the round-trip and projection tests green.

## Linear comments (1)

### Comment db457d40-a1e7-4f4a-b1bd-19e12ff90514

Author: GitHub. Created: 2026-10-31T22:32:27.148Z; updated: 2026-10-31T22:32:27.125Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-55/p18d-build-chat-threads-and-message-projections) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/822). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
