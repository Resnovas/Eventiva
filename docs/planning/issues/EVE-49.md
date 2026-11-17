<!-- linear:generated:start -->
# EVE-49: P1.10 Build inbound ACP so editors can drive Eventiva's agent

[Live Linear source](https://linear.app/resnovas/issue/EVE-49/p110-build-inbound-acp-so-editors-can-drive-eventivas-agent) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:56:07.239Z. Generated source mirror; edit Linear and refresh, not this region.

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
| Blocks | None recorded |
| Related to | [EVE-56](EVE-56.md), [EVE-80](EVE-80.md), [EVE-104](EVE-104.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

An editor that speaks the Agent Client Protocol (Zed, JetBrains, others) can use Eventiva's agent as its agent, with Eventiva's tools and permissions.

## Context

* Phase-1 step 10 of the S2 capability map. Upstream has no inbound ACP (S2 searched; not found), so this is new. D10: ACP both directions.
* S2 found `@agentclientprotocol/sdk` 2.2.0 exports `agent()` for the agent side over stdio, with HTTP and WebSocket transports still experimental.

## Scope

1. An integration module wrapping the SDK `agent()` side behind one Effect boundary.
2. Session lifecycle: initialize, new and load session (resume from the durable run in P1.8), prompt, `session/cancel` mapped to fiber interruption.
3. Permission requests (`session/request_permission`) driven by the approval policy (P1.4).
4. A small CLI entry (`eventiva acp`) that authenticates the user and starts the stdio agent.

## Acceptance criteria

* A transport-level test drives the agent with the SDK `client()` side: prompt, tool call with permission request, cancel, load session.
* Manual check in one ACP editor recorded here with version.

## Constraints

Effect-TS v3; the SDK is a new dependency and needs Jonathan's approval here; experimental transports stay off until stable; ship to main with check results.

## Done signal

Merged with the transport test green and the editor check recorded.

## Linear comments (1)

### Comment 235edae8-42c3-44e4-bf70-2c2708c3ce0b

Author: GitHub. Created: 2026-10-31T22:31:38.136Z; updated: 2026-10-31T22:31:38.111Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-49/p110-build-inbound-acp-so-editors-can-drive-eventivas-agent) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/816). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
