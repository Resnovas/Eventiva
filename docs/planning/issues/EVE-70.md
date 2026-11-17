<!-- linear:generated:start -->
# EVE-70: F3.2 Build checklists with photo evidence and sign-off that work offline on site

[Live Linear source](https://linear.app/resnovas/issue/EVE-70/f32-build-checklists-with-photo-evidence-and-sign-off-that-work) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:33.084Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-62](EVE-62.md) |
| Children | None recorded |
| Blocked by | [EVE-25](EVE-25.md), [EVE-43](EVE-43.md), [EVE-64](EVE-64.md) |
| Blocks | [EVE-86](EVE-86.md) |
| Related to | None recorded |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Approved (2026-11-08, <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> decisions). Planning only until Jonathan asks for implementation.

## Goal

Crew run load-in, safety, show-ready and load-out checklists on a phone with no signal, attach photos, and a named role signs off; the record syncs intact.

## Context

* Parent spec: <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> sections 4 (`checklist.*`), 5 (ChecklistItem, SignOff, conflict rules), 11 (retention).
* Market gap from <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> section 3: event tools have checklists but not offline on-site runs with evidence.
* Attachments and private files come from <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" />; approvals from <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />.

## Scope

1. Tables ChecklistItem and SignOff in the `tasks` package; SignOff append-only.
2. Actions `checklist.addItem`, `checklist.updateItem`, `checklist.reorder`, `checklist.removeItem`, `checklist.toggleItem` (with optional evidence refs), `checklist.signOff`.
3. Items can be marked required; `task.complete` on a task with unticked required items fails with a typed error naming them.
4. Sign-off: the checklist names a role (for example safety lead); `checklist.signOff` has approval policy always and rejects agent principals, so only a person signs.
5. Evidence photos captured offline are stored locally and queued for upload through <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" />; the item shows "evidence pending upload" until it lands.
6. Retention: sign-offs and evidence are immutable and kept for the tenant retention setting (default 6 years); reopening adds a new sign-off cycle.
7. Flag: part of `tasks`.

## Acceptance criteria

* Airplane-mode test on Android: tick 5 items, attach 2 photos, sign off, kill and restart the app, reconnect; the organiser sees all ticks, both photos and the sign-off with correct times and people.
* Completing a task with an unticked required item fails with the typed error, through UI and MCP alike.
* An agent call to `checklist.signOff` is rejected with a permission error.
* Two crew tick different items offline; both ticks survive sync; reorder from two clients converges.

## Constraints

Effect-TS v3; WCAG 2.2 AA for any UI; no new dependency without approval here; docs for people and agents; ships to main with `node --run check` results pasted here.

## Done signal

Merged to main with the airplane-mode device run recorded (device, OS, commands) and the tests green.

## Blockers

<issue id="d63643eb-423b-4502-b0a5-e4b99c887f54" label="EVE-64" href="https://linear.app/resnovas/issue/EVE-64/f31-build-task-lists-and-tasks-as-synced-records-with-actions" /> (F3.1), <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" />, <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />.

## Linear comments (1)

### Comment 213679e0-0e88-4dc3-b27f-494db9f6bd62

Author: GitHub. Created: 2026-11-01T13:06:21.312Z; updated: 2026-11-01T13:06:21.247Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-70/f32-build-checklists-with-photo-evidence-and-sign-off-that-work) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/837). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
