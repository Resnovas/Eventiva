<!-- linear:generated:start -->
# EVE-35: Keep a long agent run from blocking its entity's other messages

[Live Linear source](https://linear.app/resnovas/issue/EVE-35/keep-a-long-agent-run-from-blocking-its-entitys-other-messages) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:37.643Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Code, Decision: Audit needed, Delivery: Implementation pending, Enhancement |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-142](EVE-142.md) |
| Related to | [EVE-18](EVE-18.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

A long-running agent step never blocks other messages to the same entity (cancel, status, user input, approvals).

## Context

* Found in <issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" />. Evidence: `/mnt/project-files/eve-18/killnorestart/analysis.txt`, "per-entity outage" section.
* Cluster entity mailboxes process one message at a time by default. While `Long` (25s) ran on entities e-000..e-003, every `Deliver` to those entities waited behind it. Worst case e-003: 73s with no deliveries (36s failover plus a re-run of the 25s job plus queueing). Other entities saw at most 36s.
* For agents this means a "stop" or "approve" button would wait until the current step finishes.

## Work

1. Split the agent surface into two entity types: `AgentRun` (the workflow handle from the restart issue, one per run) and `AgentSession` (one per conversation, short handlers only: start run, cancel run, read status, post user input).
2. Handlers on `AgentSession` must return in under 1s; enforce with a test that sends `Cancel` while a run is mid-step and asserts the cancel reply arrives in under 1s.
3. If a handler legitimately needs concurrency, use `Entity.toLayer(..., { concurrency })` and document why.

## Acceptance

Cancel-while-busy test passes with the latency assertion.

## Out of scope

UI for cancel and approve.

## Done signal

Test green in `node --run check`; comment with the measured cancel latency.

## Linear comments (1)

### Comment fc3bc9de-bfd8-47f5-9a44-c1c8244880b5

Author: GitHub. Created: 2026-10-31T22:29:49.738Z; updated: 2026-10-31T22:29:49.706Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-35/keep-a-long-agent-run-from-blocking-its-entitys-other-messages) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/802). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
