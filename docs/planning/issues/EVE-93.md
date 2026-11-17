<!-- linear:generated:start -->
# EVE-93: F3.7 Build recurring tasks on the shared scheduling rules

[Live Linear source](https://linear.app/resnovas/issue/EVE-93/f37-build-recurring-tasks-on-the-shared-scheduling-rules) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:11.829Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-62](EVE-62.md) |
| Children | None recorded |
| Blocked by | [EVE-33](EVE-33.md), [EVE-64](EVE-64.md) |
| Blocks | None recorded |
| Related to | None recorded |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Approved (2026-11-08, <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> decisions). Planning only until Jonathan asks for implementation.

## Goal

Repeating work (weekly kit checks, monthly vehicle inspections, daily show-ready checks during a run) creates itself on schedule without anyone remembering.

## Context

* Parent spec: <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> sections 4 (`recurrence.*`) and 5 (Recurrence).
* Recurrence rules and DST-safe expansion come from <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" />; F3 does not build its own.

## Scope

1. Recurrence table linking a template Task to an <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" /> rule (daily, weekly, monthly, every show day of an Event, until a date or count).
2. Actions `recurrence.set`, `recurrence.clear`, plus `recurrence.preview` (next 10 occurrences).
3. Generation: the next occurrence is created when the previous one is completed or at a lead time before its due date (default 7 days), never more than one open occurrence ahead; generation is a durable job, idempotent per occurrence key.
4. Editing the series changes future occurrences only; editing one occurrence detaches it.
5. "Every show day" resolves against the F1 Event's show days.
6. Flag: part of `tasks`.

## Acceptance criteria

* A weekly task completed early creates exactly one next occurrence on the right date.
* Running the generator twice creates no duplicate.
* A daily show-ready check on a 3-day run creates 3 occurrences and stops.
* DST does not move a 09:00 local recurrence.

## Constraints

Effect-TS v3; reuse <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" /> rules, no second recurrence engine; no new dependency without approval here; ships to main with `node --run check` results pasted here.

## Done signal

Merged to main with the occurrence, idempotency and DST tests green.

## Blockers

<issue id="d63643eb-423b-4502-b0a5-e4b99c887f54" label="EVE-64" href="https://linear.app/resnovas/issue/EVE-64/f31-build-task-lists-and-tasks-as-synced-records-with-actions" /> (F3.1), <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" />.

## Linear comments (1)

### Comment ed59fce6-07ad-47c5-8967-bf3eb466a3b3

Author: GitHub. Created: 2026-11-01T13:07:15.591Z; updated: 2026-11-01T13:07:15.569Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-93/f37-build-recurring-tasks-on-the-shared-scheduling-rules) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/860). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
