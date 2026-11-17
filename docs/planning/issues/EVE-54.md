<!-- linear:generated:start -->
# EVE-54: P1.8c Build durable agent runs on Effect Cluster and Workflow

[Live Linear source](https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:29:06.654Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-47](EVE-47.md) |
| Children | None recorded |
| Blocked by | [EVE-18](EVE-18.md), [EVE-42](EVE-42.md) |
| Blocks | [EVE-87](EVE-87.md), [EVE-89](EVE-89.md), [EVE-90](EVE-90.md), [EVE-99](EVE-99.md), [EVE-104](EVE-104.md), [EVE-105](EVE-105.md), [EVE-110](EVE-110.md), [EVE-114](EVE-114.md), [EVE-124](EVE-124.md), [EVE-139](EVE-139.md), [EVE-142](EVE-142.md), [EVE-143](EVE-143.md), [EVE-145](EVE-145.md), [EVE-147](EVE-147.md), [EVE-153](EVE-153.md), [EVE-156](EVE-156.md), [EVE-165](EVE-165.md), [EVE-177](EVE-177.md), [EVE-181](EVE-181.md), [EVE-186](EVE-186.md), [EVE-191](EVE-191.md), [EVE-196](EVE-196.md), [EVE-198](EVE-198.md), [EVE-199](EVE-199.md), [EVE-212](EVE-212.md), [EVE-220](EVE-220.md), [EVE-224](EVE-224.md), [EVE-233](EVE-233.md), [EVE-235](EVE-235.md), [EVE-239](EVE-239.md), [EVE-261](EVE-261.md) |
| Related to | [EVE-13](EVE-13.md), [EVE-14](EVE-14.md), [EVE-61](EVE-61.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-65](EVE-65.md), [EVE-67](EVE-67.md), [EVE-71](EVE-71.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-116](EVE-116.md), [EVE-144](EVE-144.md), [EVE-146](EVE-146.md), [EVE-172](EVE-172.md), [EVE-185](EVE-185.md), [EVE-194](EVE-194.md), [EVE-222](EVE-222.md), [EVE-237](EVE-237.md), [EVE-252](EVE-252.md), [EVE-253](EVE-253.md), [EVE-257](EVE-257.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

An agent run survives a crash, a deploy or a runner loss and resumes exactly where it stopped, without repeating a write.

## Context

Upstream reference at 6b5cf68, `agent/`: `run-store.ts` (6k lines), `run-manager.ts` (4k), `run-loop-with-resume.ts`, `durable-background.ts`, `auto-continue.ts`, `execution-fence.ts`, `tool-call-journal.ts`, `reaped-run-thread.ts`, `run-terminal-tracking.ts`, `abort-reasons.ts`, `turn-resume-context.ts`. D3: Effect Cluster and Workflow, sharding first. <issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" /> (S5) proves two runners.
S2 flagged that `effect` latest is 4.x while `@effect/cluster` 0.60 and `@effect/workflow` 0.19 are on the v3 line; <issue id="07c58289-6f1c-488e-a130-5f718b473fce" label="EVE-14" href="https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory" /> must confirm 3.19 works first.

## Scope

1. One Cluster entity per run, with run state as a P1.3 state machine (queued, running, waiting for approval, completed, failed, cancelled).
2. Each tool call is a Workflow activity journaled before and after, so replay never re-runs a completed write (upstream `tool-call-journal`, `execution-fence`).
3. Cancel from any surface maps to interruption; stale runs reaped and resumed.
4. Background runs (started by schedules or events) use the same path.

## Acceptance criteria

* Kill the runner mid-turn after a write: on resume the write is not repeated and the turn completes (test on two runners from S5).
* Cancel from HTTP, MCP and ACP each end the run as cancelled.

## Constraints

Effect-TS v3; ship to main with check results.

## Done signal

Merged with the kill-and-resume test green on two runners.

## Safe module updates with durable runs (2026-11-15)

Spec [https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c](<https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c>). Preserve this issue's durable agent-run/workflow intent; coordinate <issue id="55c2d64a-d779-41d9-b74e-dcc7d062b86b" label="EVE-252" href="https://linear.app/resnovas/issue/EVE-252/implement-effect-cluster-sharding-and-multi-runner-recovery-in-the" /> and <issue id="ceb453e5-ab8e-4566-bf54-47d742b0f425" label="EVE-257" href="https://linear.app/resnovas/issue/EVE-257/implement-the-composable-module-kernel-and-safe-lifecycleprovider" /> rather than implement another execution engine. Kernel.workflow returns scoped {module,version,generation}; local mutation rejects workflow-active before preflight. Workflow engine may checkpoint/suspend safely, release and retry, but may not cancel/repin/force-migrate active work merely to accept an update. Persist selected composition/provider/schema epoch and owner fencing, stable effect idempotency and approval bounds. Resume rechecks grants/revocation/deadline/state; exact predecessor compatibleWith and additive schema proof required for hot update. Staged/restart returns no-mutation restart-required; incompatible code/data recovery repairs forward. Evidence: long-lived workflow survives rejected update, safely resumes/releases then replacement succeeds; runner crash at every checkpoint preserves one applied business effect and audit; absent persisted adapter remains fail-closed. AI-authored planning addition.

## Linear comments (1)

### Comment 0468d91c-790b-4cb9-b3c3-ba2b66454896

Author: GitHub. Created: 2026-10-31T22:32:25.878Z; updated: 2026-10-31T22:32:25.843Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/821). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
