<!-- linear:generated:start -->
# EVE-64: F3.1 Build task lists and tasks as synced records with actions

[Live Linear source](https://linear.app/resnovas/issue/EVE-64/f31-build-task-lists-and-tasks-as-synced-records-with-actions) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:45.293Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-62](EVE-62.md) |
| Children | None recorded |
| Blocked by | [EVE-17](EVE-17.md), [EVE-23](EVE-23.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-45](EVE-45.md), [EVE-51](EVE-51.md) |
| Blocks | [EVE-70](EVE-70.md), [EVE-72](EVE-72.md), [EVE-84](EVE-84.md), [EVE-86](EVE-86.md), [EVE-89](EVE-89.md), [EVE-93](EVE-93.md), [EVE-109](EVE-109.md), [EVE-110](EVE-110.md), [EVE-235](EVE-235.md) |
| Related to | [EVE-26](EVE-26.md), [EVE-46](EVE-46.md), [EVE-48](EVE-48.md), [EVE-73](EVE-73.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Approved (2026-11-08, <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> decisions). Planning only until Jonathan asks for implementation.

## Goal

People and agents create, assign, update and complete tasks on any Event, offline or online, through one set of actions.

## Context

* Parent spec: [EVE-62](<https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event>) sections 4 (actions), 5 (data model and conflict rules), 9 (permissions). Decisions 1, 3 and 4 there set the status rule, status categories and description model.
* F1 (<issue id="fbcff205-decd-464a-b8ab-a1278e71fbe4" label="EVE-73" href="https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show" /> section 5) owns Event, Phase, Department and Segment; a TaskList scopes to an Event (optionally a Phase and Department) or to the tenant, and a Task may carry Phase, Department and Segment refs. Reference them by id only. F1 readiness checks read open tasks per Department, so `task.list` must filter by Department.
* Record sync and Yjs come from [EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>) on the engine [EVE-17](<https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and>) picks; tenant guards and state machines from [EVE-42](<https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state>); actions from [EVE-40](<https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema>).

## Scope

1. A `tasks` extension package (Nx `type:extension`), schemas in the shared schema package (<issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />), no driver imports.
2. Tables: TaskList, Task, TaskAssignee, TaskLink, on Postgres and SQLite through Drizzle, tenant-scoped, soft delete.
3. Task status as an <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> state machine over the five categories (todo, in_progress, blocked, done, cancelled) with tenant-renameable labels.
4. Actions: `taskList.create`, `taskList.update`, `taskList.archive`, `task.create`, `task.update`, `task.assign`, `task.unassign`, `task.claim`, `task.setStatus`, `task.complete`, `task.reopen`, `task.move`, `task.delete`, `task.bulkUpdate`, `task.get`, `task.list`, `task.search` (filter-based; full text arrives with <issue id="2cd1c920-450c-487e-b4c8-e860a382a6b0" label="EVE-26" href="https://linear.app/resnovas/issue/EVE-26/port-search-and-embeddings-across-every-resource" />), `task.myTasks`, `task.link`, `task.unlink`, with the permissions and approval policies in <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> section 4.
5. Description as a Yjs document embedded in the Task record (<issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" /> embedded-document rules).
6. Field conflict rules from <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> section 5, including "completion wins until explicit reopen".
7. Domain events (`task.created`, `task.updated`, `task.completed`, `task.assigned`) through <issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" />.
8. Feature flag `tasks`, default off.

## Acceptance criteria

* Every action is in the inventory and the parity check passes; each is callable through HTTP (<issue id="0ab161c4-ed9c-4581-86fe-91fa1f4216aa" label="EVE-46" href="https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action" />) and MCP (<issue id="37c126a9-64e0-4235-88f0-494533c8e3a2" label="EVE-48" href="https://linear.app/resnovas/issue/EVE-48/p19-build-inbound-mcp-from-the-action-inventory" />) with identical results to the UI path in a test.
* Offline test: client A completes a task while client B renames it, both offline; after reconnect the task is done with B's title.
* Assignee set merge: A adds X and B adds Y offline; both are assigned after sync.
* Permission matrix test: crew can complete own task, cannot delete; an agent acting for a crew member cannot assign others; cross-tenant read denied.
* Undo of `task.delete` restores the task with its assignees and links.

## Constraints

Effect-TS v3 house rules (`Data.TaggedError`, `Context.Tag` services, Schema, `@effect/vitest`); no zod; no new dependency without Jonathan approving it on this issue; docs for people and agents; graph refreshed; ships to main per the AGENTS.md delivery exception with `node --run check` results pasted here.

## Done signal

Merged to main with the offline, merge and permission tests green, and a comment here listing the actions and their JSON Schema snapshots.

## Blockers

[EVE-40](<https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema>), [EVE-42](<https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state>), [EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>), [EVE-45](<https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change>), [EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>), [EVE-17](<https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and>), [EVE-23](<https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared>); F1 Event, Phase and Department records (<issue id="fbcff205-decd-464a-b8ab-a1278e71fbe4" label="EVE-73" href="https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show" />).

## Linear comments (1)

### Comment 4afbe055-ee20-440f-8c5d-ae98038339b7

Author: GitHub. Created: 2026-11-01T13:05:53.709Z; updated: 2026-11-01T13:05:53.582Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-64/f31-build-task-lists-and-tasks-as-synced-records-with-actions) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/831). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
