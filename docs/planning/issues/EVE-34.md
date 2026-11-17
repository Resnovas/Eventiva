<!-- linear:generated:start -->
# EVE-34: Agent runs restart from scratch when their shard moves

[Live Linear source](https://linear.app/resnovas/issue/EVE-34/agent-runs-restart-from-scratch-when-their-shard-moves) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:36.313Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Code, Decision: Audit needed, Delivery: Implementation pending, Fix |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-18](EVE-18.md), [EVE-142](EVE-142.md), [EVE-252](EVE-252.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

An agent run (long-lived, multi-step, streaming) survives a shard move or runner loss by resuming from its last completed step, never by re-running finished steps.

## Context

* Found in <issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" />. Evidence: `/mnt/project-files/eve-18/` (scenario folders `drain` and `killnorestart`, `analysis.txt`, "long jobs" section).
* A persisted 25s entity RPC (`Long`) stood in for an agent run. With @effect/cluster 0.56.4:
  * SIGTERM of the owning runner: the runner waits up to `entityTerminationTimeout` (15s default) for the handler. When the run had more than 15s left it was interrupted (`long-interrupted`) and the new owner started it again from the beginning (first drain run: interrupted at +15s, restarted on the other runner, finished 25s later).
  * SIGKILL: the run restarted from the beginning on the surviving runner 36s later (killnorestart: start 22:21:51, restart 22:22:39, done 22:23:04).
* The caller still got one reply, so the reply is at-least-once-executed, exactly-once-replied. Any side effects inside the run (LLM spend, tool calls, emails, DMX output) would happen twice.
* <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> D3: sharding takes priority over agent convenience, so the fix belongs in how agent runs are modelled, not in pinning entities.

## Work

1. Model an agent run as an `@effect/workflow` workflow driven by `ClusterWorkflowEngine` (already in `@effect/cluster` 0.56.4; `@effect/workflow` is already a dependency of `packages/platforms/postgresql`). Each model call and each tool call is an `Activity` with an idempotency key of `runId:stepIndex`.
2. The run entity only starts, signals and queries the workflow; it never awaits the whole run inside a handler.
3. Add an Effect test with `@effect/vitest` and `TestRunner` (or two SQL runners against a test Postgres) that kills the owning runner between step 2 and step 3 and asserts steps 1 and 2 ran once and step 3 ran once after recovery.

## Acceptance

* The kill test passes; activity execution counts are asserted, not logged.
* A short doc in `ai-docs/src` explains "agent run = workflow; activity = one model or tool call; idempotency key = runId:step".

## Out of scope

Choosing the model provider, the streaming transport (see the streaming issue), Kubernetes.

## Done signal

Test green in `node --run check`; comment on this issue with the test name and its output.

## Linear comments (1)

### Comment 8353a937-8688-4b53-87e7-edabeb9aece4

Author: GitHub. Created: 2026-10-31T22:29:48.459Z; updated: 2026-10-31T22:29:48.410Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-34/agent-runs-restart-from-scratch-when-their-shard-moves) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/801). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
