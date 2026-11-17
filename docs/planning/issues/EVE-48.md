<!-- linear:generated:start -->
# EVE-48: P1.9 Build inbound MCP from the action inventory

[Live Linear source](https://linear.app/resnovas/issue/EVE-48/p19-build-inbound-mcp-from-the-action-inventory) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:56:05.371Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Audit needed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-165](EVE-165.md) |
| Related to | [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-64](EVE-64.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-68](EVE-68.md), [EVE-71](EVE-71.md), [EVE-80](EVE-80.md), [EVE-104](EVE-104.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Any MCP client (Claude, ChatGPT, editors) can use Eventiva's actions as tools with the user's permissions and approvals.

## Context

* Phase-1 step 9 of the S2 capability map. Upstream reference at 6b5cf68: `mcp/` (server.ts, build-server.ts, fetch-handler.ts: streamable HTTP, OAuth, approvals, MCP Apps; stdio bridge). S2 found upstream lacks MCP cancellation (`notifications/cancelled`).

## Scope

1. An Effect service wrapping the official MCP server SDK in one integration module, building tools from the inventory (P1.1) with the provider-safe JSON Schema.
2. Streamable HTTP transport with OAuth resolving to a principal (P1.4); native stdio server for local use.
3. Approvals surfaced through MCP elicitation where the client supports it, otherwise the call returns "approval pending" with a link.
4. Cancellation mapped to fiber interruption.
5. Resources for the change feed (P1.6) so clients can read what changed.

## Acceptance criteria

* Conformance tests with the SDK client over HTTP and stdio: list tools equals the inventory, a call runs, a denied call fails, a cancel interrupts.
* Upstream's MCP spec files are used as the checklist; each mapped test is listed here.

## Constraints

Effect-TS v3; SDK version chosen at build time (S2 noted 2.4.0) and approved here as a dependency; ship to main with check results.

## Done signal

Merged with the conformance tests green.

## Linear comments (1)

### Comment 91000a04-3e8d-459d-8a88-111ab064a7c8

Author: GitHub. Created: 2026-10-31T22:31:36.929Z; updated: 2026-10-31T22:31:36.904Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-48/p19-build-inbound-mcp-from-the-action-inventory) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/815). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
