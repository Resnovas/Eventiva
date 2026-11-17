<!-- linear:generated:start -->
# EVE-47: P1.8 Build the agent: loop, engines, durable runs, threads and harness

[Live Linear source](https://linear.app/resnovas/issue/EVE-47/p18-build-the-agent-loop-engines-durable-runs-threads-and-harness) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:56:03.490Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Audit needed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | [EVE-52](EVE-52.md), [EVE-53](EVE-53.md), [EVE-54](EVE-54.md), [EVE-55](EVE-55.md), [EVE-56](EVE-56.md) |
| Blocked by | [EVE-14](EVE-14.md) |
| Blocks | None recorded |
| Related to | [EVE-111](EVE-111.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Eventiva's own agent runs on Effect, calls actions as tools exactly like a user would, survives restarts, and works with Eventiva-funded or user-owned models.

## Context

* Phase-1 step 8 of the S2 capability map. Upstream `agent/` is about 66k lines at 6b5cf68, so it is split into the sub-issues below; each is executable on its own once its blockers clear.
* Decided: AI SDK alongside Effect AI for models (D2 framework note); durable runs on Effect Cluster and Workflow (D3); ACP both directions (D10).
* Also in this step: upstream `progress/` (run progress shown on screen) and `chat-threads/`, which are folded into the sub-issues.

## Sub-issues

Loop, engines and model selection, durable runs, threads and projections, harness with ACP outbound and agent memory.

## Acceptance criteria

All sub-issues done, plus one end-to-end test: a user asks the agent to change a record, the agent calls the write action with approval, the run is killed and resumed, and the audit log shows one call made by the agent for that user.

## Done signal

End-to-end test green on main and noted here.

## Linear comments (1)

### Comment f0a3693c-938f-496e-b240-a1ba5b80265c

Author: GitHub. Created: 2026-10-31T22:31:35.682Z; updated: 2026-10-31T22:31:35.661Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-47/p18-build-the-agent-loop-engines-durable-runs-threads-and-harness) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/814). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
