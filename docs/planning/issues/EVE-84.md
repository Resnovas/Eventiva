<!-- linear:generated:start -->
# EVE-84: F3.4 Build event-relative due dates, task templates and reschedule cascade

[Live Linear source](https://linear.app/resnovas/issue/EVE-84/f34-build-event-relative-due-dates-task-templates-and-reschedule) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:19.638Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-62](EVE-62.md) |
| Children | None recorded |
| Blocked by | [EVE-64](EVE-64.md), [EVE-72](EVE-72.md) |
| Blocks | [EVE-110](EVE-110.md) |
| Related to | [EVE-33](EVE-33.md), [EVE-73](EVE-73.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Approved (2026-11-08, <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> decisions). Planning only until Jonathan asks for implementation.

## Goal

An organiser applies a template to an Event and gets every task, checklist and dependency with dates relative to that Event; when the Event moves, the tasks move with it.

## Context

* Parent spec: [EVE-62](<https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event>) sections 4 (`template.*`, `task.reschedule`), 5 (relative due shape, TaskTemplate), 3 (event tools move checklist dates when the event is rescheduled).
* Anchors are F1 dates referenced by name: Event starts_at and ends_at, Phase start and end, Segment time (of a RunOfShow), ItineraryItem time (<issue id="fbcff205-decd-464a-b8ab-a1278e71fbe4" label="EVE-73" href="https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show" /> section 5). F3 reads them; F1 owns them.

## Scope

1. Relative date type: `{ anchor: AnchorRef, offsetMinutes, businessDaysOnly? }`, resolved against the anchor in the Event's time zone, DST-safe (reuse [EVE-33](<https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters>) helpers where they exist).
2. TaskTemplate and TemplateTask tables holding tasks, subtasks, checklists, dependencies and assignee roles mapped on apply to F1 TeamMember roles and Departments (for example "lighting lead"), with relative dates.
3. Actions `template.create`, `template.update`, `template.archive`, `template.apply` (maps template roles to people and template Phases to the Event's Phases; confirm above 25 tasks), and `template.fromList` to save an existing list as a template.
4. `task.reschedule`: on an F1 anchor change event, compute the change set for every relative task; preview mode returns the diff; cascade mode applies it (confirm). Absolute-date tasks are never moved. Completed tasks are not moved.
5. Offline: devices resolve relative dates locally; on reconnect the server result wins and the device shows a "dates updated" notice.
6. Flag `tasks-templates`, default off.

## Acceptance criteria

* Apply a 30-task template to an Event: preview lists 30 tasks with resolved dates; confirm creates them with dependencies and checklists intact.
* Move the Event start by 7 days: preview shows every relative open task moved by 7 days, absolute and completed tasks unchanged; confirm applies it in one undoable change.
* A task anchored to a Segment moves when only that Segment moves.
* DST: a task anchored "2 days before 09:00 Event start" keeps 09:00 local across a clock change.
* The agent applies a template and reschedules through the same actions, with the same confirms.

## Constraints

Effect-TS v3; pure date resolution stays plain TypeScript; no new dependency without approval here; ships to main with `node --run check` results pasted here.

## Done signal

Merged to main with the apply, reschedule and DST tests green.

## Blockers

[EVE-64](<https://linear.app/resnovas/issue/EVE-64/f31-build-task-lists-and-tasks-as-synced-records-with-actions>) (F3.1), [EVE-72](<https://linear.app/resnovas/issue/EVE-72/f33-build-subtasks-and-finish-to-start-dependencies-with-blocker>) (F3.3); F1 anchor change events (<issue id="fbcff205-decd-464a-b8ab-a1278e71fbe4" label="EVE-73" href="https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show" />); [EVE-33](<https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters>) date helpers if available, otherwise local helpers moved there later.

## Linear comments (1)

### Comment ef284a62-955b-4003-985a-a61e4c581299

Author: GitHub. Created: 2026-11-01T13:07:08.932Z; updated: 2026-11-01T13:07:08.901Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-84/f34-build-event-relative-due-dates-task-templates-and-reschedule) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/851). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
