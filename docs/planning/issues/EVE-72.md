<!-- linear:generated:start -->
# EVE-72: F3.3 Build subtasks and finish-to-start dependencies with blocker queries

[Live Linear source](https://linear.app/resnovas/issue/EVE-72/f33-build-subtasks-and-finish-to-start-dependencies-with-blocker) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:32.185Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-62](EVE-62.md) |
| Children | None recorded |
| Blocked by | [EVE-64](EVE-64.md) |
| Blocks | [EVE-84](EVE-84.md), [EVE-86](EVE-86.md), [EVE-110](EVE-110.md), [EVE-235](EVE-235.md) |
| Related to | [EVE-45](EVE-45.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Approved (2026-11-08, <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> decisions). Planning only until Jonathan asks for implementation.

## Goal

Work is broken into subtasks and ordered by dependencies, so anyone (or the agent) can ask what is blocking a task and get a correct chain.

## Context

* Parent spec: <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> sections 4 (`dependency.*`), 5 (TaskDependency, parentId, conflict rules), decision 2 (finish-to-start with lag only).
* Market check: Asana "waiting on" dependencies, ClickUp dependency agents (<issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> section 3).

## Scope

1. Subtasks through `Task.parentId`, max depth 3; parent shows rolled-up progress (done children over total). Completing a parent with open children asks to complete or leave them (confirm), never silently.
2. TaskDependency table: fromTaskId, toTaskId, type finish-to-start, lagMinutes; tasks in different lists of the same Event may depend on each other; cross-Event dependencies are rejected.
3. Actions `dependency.add`, `dependency.remove`, `dependency.blockers` (returns the chain of open predecessors to a task or across an Event, with the earliest feasible start for each).
4. Cycle detection on add (typed `DependencyCycle` error) and at sync for two offline adds that together form a cycle: the later op is rejected and both editors get a flagged conflict.
5. A task whose predecessor is open shows as blocked (derived, not a stored status); completing the predecessor emits `task.unblocked` through <issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" />.
6. Flag `tasks-dependencies`, default off.

## Acceptance criteria

* A to B to C chain: `dependency.blockers(C)` returns B then A; completing A emits `task.unblocked` for B only.
* Adding C to A is rejected with `DependencyCycle`; two offline clients adding A to B and B to A produce one accepted link and one flagged conflict after sync.
* Lag: B with 2-day lag after A due on day 5 reports earliest start day 7.
* Pure graph helpers (cycle check, chain, feasible start) are plain TypeScript with unit tests; the services and actions are Effect.

## Constraints

Effect-TS v3 for IO; pure helpers stay plain TypeScript; no new dependency without approval here; ships to main with `node --run check` results pasted here.

## Done signal

Merged to main with chain, cycle and lag tests green.

## Blockers

<issue id="d63643eb-423b-4502-b0a5-e4b99c887f54" label="EVE-64" href="https://linear.app/resnovas/issue/EVE-64/f31-build-task-lists-and-tasks-as-synced-records-with-actions" /> (F3.1).

## Linear comments (1)

### Comment 3e2d89ec-4b70-4fd9-a2aa-0fba470010f8

Author: GitHub. Created: 2026-11-01T13:06:23.165Z; updated: 2026-11-01T13:06:23.113Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-72/f33-build-subtasks-and-finish-to-start-dependencies-with-blocker) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/839). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
