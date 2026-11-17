<!-- linear:generated:start -->
# EVE-62: F3 Tasks: task lists, assignments, dependencies and checklists per event

[Live Linear source](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:48.082Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | None recorded |
| Children | [EVE-64](EVE-64.md), [EVE-70](EVE-70.md), [EVE-72](EVE-72.md), [EVE-84](EVE-84.md), [EVE-86](EVE-86.md), [EVE-89](EVE-89.md), [EVE-93](EVE-93.md), [EVE-109](EVE-109.md), [EVE-110](EVE-110.md), [EVE-235](EVE-235.md) |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-13](EVE-13.md), [EVE-16](EVE-16.md), [EVE-17](EVE-17.md), [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-26](EVE-26.md), [EVE-27](EVE-27.md), [EVE-33](EVE-33.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-45](EVE-45.md), [EVE-46](EVE-46.md), [EVE-48](EVE-48.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-147](EVE-147.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Approved (2026-11-08). Jonathan chose "Approve, add a rule builder": decisions 1 to 6 as recommended, decision 7 option B (rule builder in F3, <issue id="cbcfb707-a7d4-4089-8e84-d9e2a2bd4d94" label="EVE-235" href="https://linear.app/resnovas/issue/EVE-235/f310-build-the-task-rule-builder-when-x-then-y-on-a-generic-rule" />). Planning only; no implementation until Jonathan asks. Follows the [Feature set spec template](<https://linear.app/resnovas/document/feature-set-spec-template-and-list-26b9f78cf17a>). F1 (Events and production planning, <issue id="fbcff205-decd-464a-b8ab-a1278e71fbe4" label="EVE-73" href="https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show" /> section 5) owns Event, Phase, Department, Segment (of a RunOfShow), ItineraryItem and TeamMember; this set references them by id and does not redefine them. F1's readiness checks read open tasks per Department.

## 1. Goal

Everyone working on an event, people and agents alike, knows what has to be done, by whom, by when and in what order, and can tick it off on site with no signal.

## 2. Users and jobs

| User | Jobs |
| -- | -- |
| Organiser / producer | Plan the work for an event from a template, assign it, see what is late or blocked, reschedule everything when the event date moves |
| Department head (lighting, sound, rigging, staging) | Own a task list for a discipline, break work into subtasks, set dependencies on other departments |
| Crew | See "my tasks" across events and shifts, claim open tasks, run on-site checklists (load-in, safety, show-ready, load-out) offline, attach photo evidence |
| Vendor / freelancer (external) | See and complete only the tasks assigned to them, without seeing the rest of the event |
| Finance / admin | Track admin tasks (contracts, deposits, insurance) tied to the event timeline |
| Agent (first-party or external) | Draft task plans from a brief, chase overdue work, answer "what is blocking load-in", apply templates, keep dates in step with the event, all through the same actions |

## 3. Market check

Names stay internal; customer-facing copy is whitelabel.

| Tool | What it does | Eventiva |
| -- | -- | -- |
| Asana | Tasks, subtasks, "waiting on" dependencies drawn on a timeline, rules, and AI Teammates that act on projects ([dependencies](<https://asana.com/inside-asana/dependencies>), [Winter 2026 release](<https://asana.com/inside-asana/winter-release-2026>)) | Match: subtasks, finish-to-start dependencies, agent that acts. Differ: the agent uses the same actions as the UI ([EVE-13](<https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and>) parity), and tasks hang off the event record instead of a free-floating project |
| ClickUp | Tasks with dependency types, Brain and Super Agents for dependency tracking and prioritisation ([AI task manager](<https://clickup.com/features/ai-task-manager>), [dependency agent](<https://clickup.com/p/ai-agents/dependency-management>)) | Match: agent prioritisation and dependency alerts. Differ: offline-first on mobile, which general work tools treat as secondary |
| Aisle Planner / Planning Pod (event-specific) | Checklist templates with due dates relative to the event date that move when the event is rescheduled ([template due dates](<https://integration-tag-api.aisleplanner.com/blog/feature-spotlight/introducing-checklist-due-dates-template-level>), [rescheduling](<https://aisleplanner.com/blog/work-life/rescheduling-made-easy-aisle-planner>), [Planning Pod checklists](<https://planningpod.com/checklists-and-task-management>)) | Match: event-relative templates and cascade on reschedule. Differ: anchors can be any F1 date (Phase start, Segment), not only the event day, and on-site checklists carry sign-off and evidence |

Gap none of them fill well: crew checklists that work offline at a venue and sync with evidence, with the same tasks visible to an agent.

## 4. Capabilities as actions

Every operation is an inventory action (<issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />): Effect Schema input and output, typed errors, one permission check (<issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />), receipt, change record with undo where it mutates. Side-effect class in brackets.

| Action | Input | Output | Permission | Approval |
| -- | -- | -- | -- | -- |
| `taskList.create` \[write\] | name, scope (Event, Phase or tenant), owner | TaskList | `tasks:manage` on scope | none |
| `taskList.update` / `taskList.archive` \[write\] | id, fields | TaskList | `tasks:manage` | none |
| `task.create` \[write\] | listId, title, description?, assignees?, due?, priority?, parentId?, links? | Task | `tasks:write` on list | none |
| `task.update` \[write\] | id, patch of fields | Task | `tasks:write`, or assignee for status and checklist | none |
| `task.assign` / `task.unassign` \[write\] | id, principalIds | Task | `tasks:assign` | confirm when an agent assigns someone other than the requester |
| `task.claim` \[write\] | id | Task | `tasks:claim` (crew on the event) | none |
| `task.setStatus` \[write\] | id, status | Task | `tasks:write` or assignee | none |
| `task.complete` / `task.reopen` \[write\] | id, note? | Task | `tasks:write` or assignee | none |
| `task.move` \[write\] | id, listId, position | Task | `tasks:write` on both lists | none |
| `task.delete` \[write\] | id | receipt with undo | `tasks:manage` | confirm for agents; always when deleting more than 10 |
| `task.bulkUpdate` \[write\] | ids, patch | Task\[\] | per task | confirm when more than 10 tasks |
| `task.get` / `task.list` / `task.search` \[read\] | id or filters (assignee, status, due range, Event, Phase, label) | Task / page | `tasks:read` | none |
| `task.myTasks` \[read\] | range, include shifts? | Task page | self | none |
| `task.link` / `task.unlink` \[write\] | id, resource ref (Event, Phase, Segment, Shift, kit item, vehicle, map pin) | Task | `tasks:write` and read on target | none |
| `dependency.add` / `dependency.remove` \[write\] | fromTaskId, toTaskId, lag? | Dependency | `tasks:write` on both | none |
| `dependency.blockers` \[read\] | taskId or Event | blocking chain | `tasks:read` | none |
| `checklist.addItem` / `checklist.updateItem` / `checklist.reorder` / `checklist.removeItem` \[write\] | taskId, item | Checklist | `tasks:write` | none |
| `checklist.toggleItem` \[write\] | itemId, done, evidence? | ChecklistItem | assignee or `tasks:write` | none |
| `checklist.signOff` \[write\] | taskId, signature note | SignOff | role named on the checklist (for example safety lead) | always (a person signs; an agent cannot) |
| `template.create` / `template.update` / `template.archive` \[write\] | name, tasks with relative offsets and anchors | TaskTemplate | `tasks:templates` | none |
| `template.apply` \[write\] | templateId, Event (and Phase map) | TaskList with tasks | `tasks:manage` on Event | confirm when it creates more than 25 tasks |
| `task.reschedule` \[write\] | Event or anchor change, mode (cascade or preview) | change set | `tasks:manage` | confirm for cascade |
| `reminder.set` / `reminder.clear` \[write\] | taskId, when (absolute or before due) | Reminder | assignee or `tasks:write` | none |
| `recurrence.set` / `recurrence.clear` \[write\] | taskId, rule | Recurrence | `tasks:manage` | none |
| `task.watch` / `task.unwatch` \[write\] | id | Watch | `tasks:read` | none |
| `guest.inviteToTask` \[external\] | taskId, contact | invite | `tasks:assign` and `guests:invite` | confirm |

Comments and mentions use <issue id="b7f17f15-c893-46e9-9b3b-2aefae473802" label="EVE-27" href="https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource" /> (`comment.*`), attachments <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" />, navigation <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" /> (`nav.open` with a Task id).

## 5. Data model

All tables tenant-scoped (<issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> tenant guard), soft delete with undo, attributed edits.

* **TaskList**: id, tenantId, scope (Event id, or tenant-level), optional Phase id and Department id, name, owner, archivedAt.
* **Task**: id, tenantId, listId, parentId (subtask, max depth 3), title, optional Phase, Department and Segment refs (F1), description (Yjs document embedded in the record per [EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>)), status (category: todo, in_progress, blocked, done, cancelled; tenant-renameable label), priority (none, low, medium, high, urgent), due (absolute instant or relative: anchor ref plus offset), start (same shape), estimateMinutes, labels, position (fractional index), completedAt, completedBy, createdBy (person or agent on behalf of person).
* **TaskAssignee**: taskId, principalId (member or guest), assignedBy, assignedAt. Many per task.
* **TaskDependency**: fromTaskId, toTaskId, type (finish-to-start), lagMinutes. Cycles rejected.
* **ChecklistItem**: id, taskId, text, position, done, doneBy, doneAt, evidence (attachment refs, [EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>)), required.
* **SignOff**: taskId, role, principalId, at, note. Immutable once written; a reopen adds a new row.
* **TaskTemplate** and **TemplateTask**: tasks, checklists, dependencies and assignee roles (mapped to F1 TeamMember roles and Departments on apply) with offsets relative to an anchor (Event start or end, Phase start or end, Segment time, ItineraryItem).
* **Reminder**, **Recurrence** (rule from [EVE-33](<https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters>)), **TaskWatch**, **TaskLink** (task to any resource ref).

Offline sync and conflict rules per field (S4 engine, <issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" />):

| Field | Syncs offline | Conflict rule |
| -- | -- | -- |
| title, priority, due, start, labels, estimate | yes | last writer wins per field, both values kept in the change log |
| description | yes | Yjs merge |
| status | yes | completion wins: a `done` from any client beats a concurrent non-done change; only an explicit `task.reopen` after it undoes it |
| assignees | yes | set merge (add and remove as separate ops); a remove beats a concurrent add of the same person only if later |
| checklist items | yes | per item: done is monotonic until untoggled by a later op; order uses fractional index |
| sign-off | yes, queued | append-only; never overwritten |
| dependencies | yes | add-wins set; a cycle created by two offline adds is rejected at sync and flagged to both editors |
| relative due recalculation | computed on server and device | server result wins on reconnect; device shows a "dates updated" notice |

Authorization at sync: a guest's device only receives tasks assigned to them; revocation removes them on next sync (<issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />).

## 6. Screens

All components from Rambo-UI; every control binds to an action id; each screen declares a screen-context projection (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />).

| Screen | Platforms | Rambo-UI parts | Projection | Controls to actions |
| -- | -- | -- | -- | -- |
| My tasks | all | list, group header, checkbox, chip, filter bar | visible tasks (ids, titles, status, due), filters, selection | tick: `task.complete`; claim: `task.claim`; open: `nav.open` |
| Event tasks (list and board) | all; board on wide screens | list, board columns, drag handle, avatar stack | Event id, grouping (Phase or status), visible tasks, selection | drag: `task.move` / `task.setStatus`; add: `task.create`; apply template: `template.apply` |
| Task detail (sheet) | all | sheet, rich text editor, date picker, assignee picker, checklist, comment thread | the task, its checklist, blockers, focus field | each field: `task.update`; assign: `task.assign`; add blocker: `dependency.add` |
| Checklist run (on site) | mobile first | large checkbox rows, camera button, sign-off panel, offline badge | task, items, which are done, pending sync count | tick: `checklist.toggleItem`; sign: `checklist.signOff` |
| Dependencies and timeline | web and desktop; mobile shows a blockers list | timeline, connector lines | visible range, tasks, links | draw link: `dependency.add`; drag dates: `task.update` |
| Templates library and editor | all; editor best on wide screens | list, editor, offset picker | template, its tasks | `template.*` |

Accessibility: WCAG 2.2 AA; drag has a keyboard and menu alternative (move to column action); offline and sync state announced to screen readers.

## 7. Agent behaviour

When asked: break a brief into a task plan for an Event (preview, then `template.apply`-style creation with confirm over 25 tasks); answer "what is blocking X" from `dependency.blockers`; reassign a person's tasks when they drop out (confirm); reschedule after an Event date change (preview then confirm); fill a checklist from a document (<issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" /> import).

Proactive (behind the flag, opt-in per user): a daily digest of the user's overdue and due-soon tasks; a warning when a dependency chain makes a due date impossible; a nudge when an on-site checklist is incomplete at its Segment anchor. Proactive work only reads and suggests; any write it proposes waits for the user.

Approvals: as in section 4. An agent never signs off a checklist, never deletes another person's task without confirm, and never assigns a third party without confirm. Offline, the device agent can use local task actions; anything needing a remote model says it is offline.

## 8. Integrations

None required for phase 1. Each later integration sits behind a neutral port:

* Calendar feed of my tasks (ICS out, then Google and Microsoft through the <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" /> calendar providers).
* Import from CSV and from other task tools (port `TaskImport`; vendors later, each approved on its issue).
* Notifications through <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> channels (push, email, chat platforms).

## 9. Permissions and roles

| Role | See | Change |
| -- | -- | -- |
| Tenant admin | all task lists | everything, templates |
| Event manager | tasks on their Events | `tasks:manage`, `tasks:assign`, templates apply |
| Department lead | lists they own plus read on the Event's other lists | `tasks:write` on own lists, assign within their team |
| Crew member | tasks on Events they are rostered for (F2) | own tasks, claim open tasks, toggle checklists, sign off where their role is named |
| Guest (vendor, freelancer) | only tasks assigned to them, with the Event name and the relevant date | status, checklist, comments on those tasks |
| Attendee | nothing in F3 | nothing |
| Agent | exactly what the person it acts for can see and do (<issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />) | same, plus the approvals above |

## 10. Telemetry and flags

* Flags (PostHog, safe in-code default off): `tasks` (the set), `tasks-dependencies`, `tasks-templates`, `tasks-agent-proactive`, `tasks-guests`, `tasks-rules`.
* Events: `task created`, `task completed`, `task reopened`, `task assigned`, `template applied`, `checklist signed off`, `dependency added`, `tasks rescheduled`, `task created offline` (with sync delay), each with source (ui, agent, api, mcp) and no task text.
* Spans on every action from <issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" />; metric for sync conflict count per field.
* Success metric: share of Event tasks completed by their due date, and share of task writes made by agents that the user keeps (not undone within 24 hours).

## 11. Compliance

* Personal data: assignees, comments and evidence photos are personal data (UK GDPR). Export and erase per person through the tenant's data subject actions; erased people show as "former member".
* Retention: sign-offs and evidence on safety checklists are kept for the tenant's configured retention (default 6 years) and cannot be edited, only superseded. Eventiva records the evidence; it does not claim the checklist meets any specific safety regulation.
* Guest access: guests accept terms on invite; their data is limited to their tasks.

## 12. Acceptance

* Every operation in section 4 is in the inventory and the parity check passes; the agent can do each one through MCP and the UI with the same result.
* A crew member completes a checklist with a photo on a phone in airplane mode, restarts the app, reconnects, and the organiser sees it complete with the evidence.
* Two people change the same task offline (one completes, one renames), and after reconnect it is complete with the new name.
* Moving an Event start date by 7 days moves every relative task by 7 days in preview, and on confirm, with absolute-date tasks untouched.
* A dependency cycle is rejected online and flagged when created by two offline edits.
* A guest sees only their tasks; revoking them removes the tasks from their device on next sync.
* An agent acting for a crew member cannot assign someone else or sign off.

## 13. Out of scope

Time tracking and timesheets (F12), shift rosters (F2), rules over non-task triggers and actions (F14 extends the <issue id="cbcfb707-a7d4-4089-8e84-d9e2a2bd4d94" label="EVE-235" href="https://linear.app/resnovas/issue/EVE-235/f310-build-the-task-rule-builder-when-x-then-y-on-a-generic-rule" /> engine), portfolio and resource-levelling views across tenants, Gantt baselines, dependency types other than finish-to-start, public task boards for attendees.

## 14. Dependencies

* Phase 1: [EVE-40](<https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema>) (actions), [EVE-42](<https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state>) (storage, state machines, tenant guard), [EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>) (permissions, approvals, guests), [EVE-44](<https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor>) (telemetry), [EVE-45](<https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change>) (change feed), [EVE-46](<https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action>) (HTTP), [EVE-48](<https://linear.app/resnovas/issue/EVE-48/p19-build-inbound-mcp-from-the-action-inventory>) (MCP), [EVE-50](<https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen>) (screen awareness), [EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>) (sync and Yjs), [EVE-52](<https://linear.app/resnovas/issue/EVE-52/p18a-build-the-agent-turn-loop-with-actions-as-tools>) and [EVE-54](<https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow>) (agent loop and durable runs). Spikes: [EVE-16](<https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web>), [EVE-17](<https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and>).
* Port later: [EVE-24](<https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email>) (notifications), [EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>) (attachments), [EVE-26](<https://linear.app/resnovas/issue/EVE-26/port-search-and-embeddings-across-every-resource>) (search), [EVE-27](<https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource>) (comments), [EVE-33](<https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters>) (recurrence and calendars).
* Feature sets: F1 (Event, Phase, Segment, ItineraryItem as anchors), F2 (Shift links and who is on the Event), F4 (guests as contacts), F6, F7 and F10 (link targets), F14 (custom fields, custom views, and extending the F3 rule engine to other sets).
* Rambo-UI has no components yet; the screens need its list, board, sheet, checkbox, date picker and rich text editor.

## 15. Decisions for Jonathan

Decided 2026-11-08 on one card: 1A, 2A, 3A, 4A, 5A, 6A, 7B.

1. **Offline status conflicts.** A: completion wins until an explicit reopen (recommended: a ticked safety check must not be silently un-ticked). B: last writer wins.
2. **Dependency types.** A: finish-to-start with lag only (recommended: covers event work; the others add UI weight with little use). B: all four types now.
3. **Statuses.** A: five fixed categories with tenant-renameable labels; custom workflows come with F14 (recommended). B: fully custom workflows in F3.
4. **Task description.** A: Yjs rich text embedded in the record (recommended: same model as other documents, co-editable). B: plain text field.
5. **External assignees.** A: guests in F3, limited to their own tasks (recommended: vendors and freelancers are a large share of event work). B: wait for F4 and F5.
6. **Agent writes.** A: agent creates and edits for the requester freely (undoable), confirm for assigning others, bulk over 10 or 25 for templates, never signs off (recommended). B: confirm every agent write.
7. **Automation rules.** A: no rule builder in F3; F3 emits events and the agent plus F14 rules act on them (was recommended). B: build a "when X then Y" rule builder in F3. **Chosen: B.** Built as a domain-agnostic rule engine that F14 extends, so there is still only one engine (<issue id="cbcfb707-a7d4-4089-8e84-d9e2a2bd4d94" label="EVE-235" href="https://linear.app/resnovas/issue/EVE-235/f310-build-the-task-rule-builder-when-x-then-y-on-a-generic-rule" />).

## 16. Child issues

In build order. F3.2, F3.3, F3.6, F3.7 and F3.8 can run in parallel once F3.1 lands.

 1. <issue id="d63643eb-423b-4502-b0a5-e4b99c887f54" label="EVE-64" href="https://linear.app/resnovas/issue/EVE-64/f31-build-task-lists-and-tasks-as-synced-records-with-actions" /> F3.1 Task lists and tasks as synced records
 2. <issue id="f941b8f6-0309-45e0-9d56-60feddd2f985" label="EVE-70" href="https://linear.app/resnovas/issue/EVE-70/f32-build-checklists-with-photo-evidence-and-sign-off-that-work" /> F3.2 Checklists, evidence and sign-off
 3. <issue id="b092122b-6aea-4fec-b8c4-e1baf084c342" label="EVE-72" href="https://linear.app/resnovas/issue/EVE-72/f33-build-subtasks-and-finish-to-start-dependencies-with-blocker" /> F3.3 Subtasks and dependencies
 4. <issue id="5a6f845d-5c7a-450c-8e8d-cef1b7ddbc80" label="EVE-84" href="https://linear.app/resnovas/issue/EVE-84/f34-build-event-relative-due-dates-task-templates-and-reschedule" /> F3.4 Event-relative dates, templates and rescheduling
 5. <issue id="1bd1df6b-b667-44f0-a5c5-5c560cec94e4" label="EVE-86" href="https://linear.app/resnovas/issue/EVE-86/f35-build-the-task-screens-with-screen-projections-on-web-and-mobile" /> F3.5 Task screens
 6. <issue id="d838fcc2-59de-47d6-a932-ab003b58cbab" label="EVE-89" href="https://linear.app/resnovas/issue/EVE-89/f36-build-task-reminders-watchers-and-notifications" /> F3.6 Reminders, watchers and notifications
 7. <issue id="f473bd5a-7c18-4d18-9c69-ef2e48648a7d" label="EVE-93" href="https://linear.app/resnovas/issue/EVE-93/f37-build-recurring-tasks-on-the-shared-scheduling-rules" /> F3.7 Recurring tasks
 8. <issue id="a4c6a5ee-ff88-4b6c-b564-dee9d8c82f59" label="EVE-109" href="https://linear.app/resnovas/issue/EVE-109/f38-build-guest-assignees-so-vendors-and-freelancers-see-only-their" /> F3.8 Guest assignees
 9. <issue id="ce4d47c5-899a-4972-b02e-c6297c0c3a40" label="EVE-110" href="https://linear.app/resnovas/issue/EVE-110/f39-build-agent-behaviour-for-tasks-planning-blockers-digests-and" /> F3.9 Agent behaviour for tasks
10. <issue id="cbcfb707-a7d4-4089-8e84-d9e2a2bd4d94" label="EVE-235" href="https://linear.app/resnovas/issue/EVE-235/f310-build-the-task-rule-builder-when-x-then-y-on-a-generic-rule" /> F3.10 Rule builder (after F3.1 and F3.3; can run alongside F3.4 to F3.9)

## Linear comments (5)

### Comment a08e9429-48f2-44a2-ab38-47d45f081e42

Author: GitHub. Created: 2026-11-01T13:05:33.754Z; updated: 2026-11-01T13:05:33.714Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/829). All replies are displayed in both locations.


### Comment 19700bfd-4017-4333-a804-af412c2bf840

Author: jonathan@resnovas.com. Created: 2026-11-13T20:13:02.804Z; updated: 2026-11-13T20:13:02.786Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event) (comment ID above). Parent: None. Resolved: Not recorded.

Cross-feature requirement from Eventiva live-operations design (Jonathan, 2026-11-13; canonical discussion on EVE-71): Event-relative task templates are needed for repeatable production jobs on tours/multi-venue events. Example: "Rig sound system in Space X" for Crew A, repeated across tour stops with per-venue assignments, locations and dates. Tasks scheduled ahead of time remain in **Scheduled/Upcoming**, then become eligible for the active CAD dispatch board near their planned start; active dispatch and completed history remain distinct. Preserve the association between the Task/template/event milestone and its operational assignment/status/log; don't duplicate separate task execution logic inside F7. Rescheduling an event should recompute future relative deadlines, flag conflicts, and preserve in-progress/completed history. Exact release/activation semantics (automatic vs controller confirmation) remain open for Jonathan's decision. This comment clarifies product requirements only, not implementation approval.


### Comment 9dd1bd87-d4e8-46d0-9d08-658789a0d8b7

Author: jonathan@resnovas.com. Created: 2026-11-13T20:16:00.222Z; updated: 2026-11-13T20:16:00.178Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event) (comment ID above). Parent: None. Resolved: Not recorded.

## Live-operations scheduling and dependency decision — Jonathan, 13 Nov 2026

**User-approved design direction:** Support both release modes for pre-scheduled production tasks: **automatic is the preferred default**, and **controller approval before dispatch** is configurable for an organisation/event/task according to its policy. Crew can be assigned to their planned tasks in advance, so work is visible and prepared without requiring controllers to manually dispatch every routine job. An already assigned/scheduled item is **not necessarily active or safe to start**.

**Hard dependency gate:** A scheduled task may activate only when (a) its planned start/release condition is satisfied, (b) **every required predecessor dependency is completed and any required sign-off is valid**, and (c) any configured controller release/approval has occurred. For example **Install power → Install lighting rig**: even when the lighting task's scheduled start time arrives, it must remain blocked if power installation is incomplete. Neither a timer nor an agent may bypass this gate. When prerequisites clear after the scheduled start, auto-release the eligible task in automatic mode; in manual mode place it in the controller's ready-for-release queue. Detect cycles and do not silently ignore broken references, revoked sign-offs or failed completion validation. For work already active when a predecessor is later reopened or invalidated, surface a safety/blocker alert and require a documented operational decision rather than silently rewinding its history.

**CAD/MDT presentation:** Distinguish Upcoming/Scheduled, Blocked/Waiting, Ready-to-release, Active/In progress, Complete and Cancelled in views/status projections, without replacing F3's canonical Task status categories or F7's separate Incident statuses. A task behind schedule with unmet dependencies remains **blocked and late**, not active; display its scheduled time, elapsed delay, precise blocker(s), responsible crew and downstream jobs at risk. Surface this in both the controller's CAD board and the assigned crew's MDT. Use colour + text/icon (not colour alone), with accessible high-contrast and screen-reader status. Make upcoming and blocked tasks visible to assignees but prevent 'start', operational dispatch and unsafe next-step actions until unblocked. Show critical downstream consequences, and consider configurable notifications/escalation while avoiding alert floods.

**Technical boundaries:** Use the F3 canonical TaskTemplate/TaskDependency model, Event/Phase relative dates and F7 operations action inventory, with one auditable workflow rather than duplicating separate task engines. Repeated tour dates instantiate independent task schedules and dependencies with per-venue substitutions. Offline state may show last-known readiness but must not fabricate a verified dependency completion or initiate privileged dispatch without current authorization. Agent proposals remain subject to the same dependency and approval gates; live incident dispatch still requires controller approval. Clarify state-vs-eligibility and exact notification thresholds during implementation planning.

This records UX/functional policy, not approval for code changes or dependencies; do not interrupt the four currently researching foundation orbs.

**F3 scope:** Own dependency truth, relative start timing, blocked-state derivation, wait reasons, audit receipts, and task projections. Avoid separate scheduler flags that drift from task completion, status and sign-off.


### Comment 6ac23009-f0ee-44d4-967b-651ccdf69549

Author: jonathan@resnovas.com. Created: 2026-11-13T20:23:20.022Z; updated: 2026-11-13T20:23:20.012Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event) (comment ID above). Parent: None. Resolved: Not recorded.

Decision from Jonathan (13 November 2026): **Automatically and continuously recalculate the working/forecast schedule of dependency-linked tasks as their predecessors run late. Preserve the original planned schedule unchanged for comparison and audit.** This supersedes the earlier proposal for human confirmation of each automatic cascade, but does not grant any agent authority to bypass execution approvals or safety-critical sign-offs.

Required model and behaviour:
- Persist an immutable original/baseline scheduled start and finish (or original duration/offset); retain subsequent plan revisions and the reasons/actor/time for changes, rather than overwriting history. Distinguish this baseline from the current forecast/effective planned times and actual start/finish.
- Forecast dependent tasks against predecessor completion/forecast completion, duration, any finish-to-start lag, task's earliest permitted start, and relevant constraints. Recompute downstream critical paths on fresh status/estimate changes; propagate delays through the dependency graph. Don't assume a precise new time when predecessor ETA is unknown: indicate uncertainty/awaiting estimate.
- **Delay = working/forecast start minus original baseline start**, displayed explicitly as a duration, alongside original time, current forecast time, blocking predecessor(s), and affected downstream tasks. Keep an accessible CAD and crew MDT presentation with conspicuous textual/icon overdue/blocked and knock-on indicators; use colour as supplement.
- Keep dependency gating separate from timetable forecasting: scheduled tasks may be preassigned and visible but must not become active before prerequisites/sign-off and applicable release approval. Recalculation must not silently shift actual/historical completions, override a manually locked commitment or erase the original schedule.
- Repeated tour/event templates instantiate per-event baselines. Preserve cross-event visibility without silently modifying a different show's locked commitments.

Example: power work originally due to complete 10:00; lighting originally scheduled to begin 10:00, forecast power completion changes to 10:45 -> lighting forecast start becomes 10:45 or later according to other prerequisites, displayed +45 min versus its original 10:00 baseline. If power ETA changes, update the lighting forecast and downstream impacts accordingly.

This is a product-spec decision, not an instruction to implement now or approve dependencies; foundation AMP orbs remain on their existing tasks.

F3 owns persisted baseline/revision history, dependencies, and forecast computation exposed through a single task projection to other surfaces.


### Comment d7caf802-c15c-4a1d-9398-5e01083cad0c

Author: jonathan@resnovas.com. Created: 2026-11-13T20:25:23.091Z; updated: 2026-11-13T20:25:23.062Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event) (comment ID above). Parent: None. Resolved: Not recorded.

**Product decision, 13 Nov 2026 (Jonathan): delay tolerance for automated dependency rescheduling.** Set default tolerance to **10 minutes** (correcting initial verbal suggestion of five). It must be configurable as **any numeric minute value from 5 to 60 inclusive**, with range validation; do not limit to preset options such as 5/10/15-minute increments. Expose an editable tolerance in the appropriate authorised scheduling configuration, inherited as the default for new schedules/events, with effective value visible in the UI.

**Semantics:** Continuously calculate and display actual/estimated lateness, original baseline, current projected times and knock-on effects, even below the tolerance. The configured threshold controls when a newly predicted delay should **trigger an automatic rescheduling cascade / revision of the working schedule and corresponding notifications**, not whether users can see the delay. At or above the tolerance, apply the automatic cascade; do not overwrite the immutable original baseline or actual historical times. Required finish-to-start dependencies and any safety/approval gates remain strictly enforced **regardless of tolerance**: a 9-minute delay under a 10-minute tolerance never authorises an otherwise blocked dependent task to start. If a prerequisite is not done, display it as blocked even if no cascade has yet been triggered. Avoid repeatedly duplicating schedule revisions while a delay remains unchanged; use idempotent updates and clearly show a live forecast distinct from the last committed working schedule when relevant.

Avoid making per-person terminology/preferences override tenant operational governance; decide the exact configuration scope as part of the UI/policy design. This is a requirements decision, not permission to change code, introduce packages or interrupt the foundation orbs.
F3 owns the tolerance setting, forecast computation, automatic cascade trigger, revision history and validation.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
