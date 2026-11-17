<!-- linear:generated:start -->
# EVE-52: P1.8a Build the agent turn loop with actions as tools

[Live Linear source](https://linear.app/resnovas/issue/EVE-52/p18a-build-the-agent-turn-loop-with-actions-as-tools) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:56:12.901Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Audit needed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-47](EVE-47.md) |
| Children | None recorded |
| Blocked by | [EVE-40](EVE-40.md), [EVE-43](EVE-43.md) |
| Blocks | [EVE-104](EVE-104.md), [EVE-110](EVE-110.md), [EVE-127](EVE-127.md), [EVE-142](EVE-142.md), [EVE-144](EVE-144.md), [EVE-165](EVE-165.md), [EVE-186](EVE-186.md), [EVE-196](EVE-196.md), [EVE-197](EVE-197.md), [EVE-198](EVE-198.md), [EVE-212](EVE-212.md), [EVE-215](EVE-215.md), [EVE-220](EVE-220.md), [EVE-224](EVE-224.md), [EVE-227](EVE-227.md), [EVE-230](EVE-230.md) |
| Related to | [EVE-13](EVE-13.md), [EVE-61](EVE-61.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-253](EVE-253.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

One agent turn: read screen context, choose tools from the action inventory, ask for approval when required, call actions as the user, and stream the result.

## Context

Upstream reference at 6b5cf68, `packages/core/src/agent/`: `production-agent.ts` (about 17k lines, the loop), `tool-search.ts`, `tool-index.ts`, `tool-approval-store.ts`, `write-receipts.ts`, `processors.ts`, `follow-up-suggestions.ts`, `tool-error-redaction.ts`, `runtime-context.ts`, `loop-settings.ts`, plus `progress/`.

## Scope

1. A turn as an Effect program using AI SDK `streamText` with tools built from P1.1 (provider-safe JSON Schema); Effect AI where it covers the same call.
2. Tool search for large inventories (upstream `tool-search`, `tool-index`): only relevant tools are sent to the model.
3. Approval pause and resume through P1.4, with the approval shown on screen.
4. Tool errors redacted before reaching the model; secrets never in prompts.
5. Screen context (P1.11) and recent changes (P1.6) injected into the system context.
6. Progress events for long tool calls.

## Acceptance criteria

* With a scripted model (AI SDK mock provider): a read, a write needing approval, a denied write and a tool error each behave as specified in tests.
* Tool search returns the expected subset for a 200-action fixture.

## Constraints

Effect-TS v3; AI SDK version is the current major (S2: upstream pins ^6, latest 7); dependencies need approval here; ship to main with check results.

## Done signal

Merged with the scripted-model tests green.

## Linear comments (1)

### Comment 79b4451f-3979-4946-b1a9-ea19025e8b38

Author: GitHub. Created: 2026-10-31T22:32:21.702Z; updated: 2026-10-31T22:32:21.639Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-52/p18a-build-the-agent-turn-loop-with-actions-as-tools) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/819). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
