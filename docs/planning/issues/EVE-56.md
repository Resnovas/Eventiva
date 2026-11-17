<!-- linear:generated:start -->
# EVE-56: P1.8e Build the agent harness: outbound ACP, agent memory and context inspection

[Live Linear source](https://linear.app/resnovas/issue/EVE-56/p18e-build-the-agent-harness-outbound-acp-agent-memory-and-context) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:56:18.974Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Audit needed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-47](EVE-47.md) |
| Children | None recorded |
| Blocked by | [EVE-40](EVE-40.md) |
| Blocks | [EVE-116](EVE-116.md) |
| Related to | [EVE-13](EVE-13.md), [EVE-49](EVE-49.md), [EVE-66](EVE-66.md), [EVE-80](EVE-80.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Eventiva's agent can hand work to external agents over ACP, remembers what it learns per user and tenant, and lets people see exactly what context it used.

## Context

Upstream reference at 6b5cf68, `agent/`: `harness/` (8k lines: acp-adapter, acp-builtin, AI SDK harness), `observational-memory/` (1k), `context-xray/` (1.7k), plus `resources/` for memory files. D10: ACP both directions. S2: upstream uses the deprecated `@zed-industries/agent-client-protocol`; use `@agentclientprotocol/sdk` `client()`.

## Scope

1. Outbound ACP: start or connect to an ACP agent, map its permission requests to P1.4 approvals, stream its output into the thread (P1.8d), resume with `loadSession`.
2. Agent memory: notes saved per user and tenant as resources, read into context, editable and deletable by the user through actions.
3. Context inspection: an action that returns the exact context sent for a turn (screen projection, memory, tools offered), with secrets redacted.

## Acceptance criteria

* Transport-level test with the SDK `agent()` side as a fake external agent: prompt, permission, cancel, resume.
* A memory saved in one turn is used in the next and removed when the user deletes it.

## Constraints

Effect-TS v3; the SDK is a new dependency and needs approval here (shared with P1.10); ship to main with check results.

## Done signal

Merged with the ACP and memory tests green.

## Linear comments (1)

### Comment 731b1a10-8469-4537-83e3-1a9421f6a6c3

Author: GitHub. Created: 2026-10-31T22:32:28.849Z; updated: 2026-10-31T22:32:28.823Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-56/p18e-build-the-agent-harness-outbound-acp-agent-memory-and-context) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/823). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
