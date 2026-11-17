<!-- linear:generated:start -->
# EVE-86: F3.5 Build the task screens with screen projections on web and mobile

[Live Linear source](https://linear.app/resnovas/issue/EVE-86/f35-build-the-task-screens-with-screen-projections-on-web-and-mobile) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:17.912Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-62](EVE-62.md) |
| Children | None recorded |
| Blocked by | [EVE-16](EVE-16.md), [EVE-27](EVE-27.md), [EVE-50](EVE-50.md), [EVE-64](EVE-64.md), [EVE-70](EVE-70.md), [EVE-72](EVE-72.md) |
| Blocks | [EVE-110](EVE-110.md) |
| Related to | [EVE-13](EVE-13.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Approved (2026-11-08, <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> decisions). Planning only until Jonathan asks for implementation.

## Goal

People see and work their tasks on any device, and the agent sees exactly what they see and can press every button they can.

## Context

* Parent spec: <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> section 6 (screens, Rambo-UI parts, projections, control-to-action map) and section 9 (what each role sees).
* Screen awareness contract from <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> and <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />: every control binds an action id, every screen declares an Effect Schema projection, navigation is an action.
* UI from Rambo-UI only; Rambo-UI has no components yet, so the needed parts (list, board, sheet, checkbox, date picker, assignee picker, rich text editor, timeline) are requested there.

## Scope

1. Screens: My tasks, Event tasks (list and board), Task detail sheet, Checklist run (mobile first, large targets, offline badge, pending-sync count), Dependencies and timeline (wide screens; blockers list on mobile), Templates library and editor.
2. A screen-context projection per screen as listed in <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> section 6, filtered by the viewer's permissions.
3. Every control bound to its action; the unbound-element check (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />) passes.
4. Navigation actions: `nav.open` for a Task, a TaskList and My tasks.
5. Comments and mentions on the Task detail through <issue id="b7f17f15-c893-46e9-9b3b-2aefae473802" label="EVE-27" href="https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource" />.
6. Accessibility: WCAG 2.2 AA; every drag has a menu and keyboard alternative; sync and offline state announced.
7. The task screens ship as a federated module per <issue id="a7a66a5c-e747-4245-bc84-3232ef65a16c" label="EVE-16" href="https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web" /> with a bundled fallback.

## Acceptance criteria

* On web and Android: the agent answers "what tasks am I looking at" from the projection and completes a visible task by action id with the same result as a tap.
* The unbound-element check fails on a fixture button and passes on the real screens.
* axe (web) shows no serious or critical issues on each screen; keyboard-only move of a card between board columns works.
* Checklist run works in airplane mode with the offline badge and pending count correct.
* A guest sees only the My tasks screen with their tasks.

## Constraints

Effect-TS v3 for IO; Rambo-UI components only, no local component library; whitelabel ASCII copy; no new dependency without approval here; ships to main with `node --run check` results pasted here.

## Done signal

Merged to main with the web and Android checks recorded and axe results attached.

## Blockers

<issue id="d63643eb-423b-4502-b0a5-e4b99c887f54" label="EVE-64" href="https://linear.app/resnovas/issue/EVE-64/f31-build-task-lists-and-tasks-as-synced-records-with-actions" />, <issue id="f941b8f6-0309-45e0-9d56-60feddd2f985" label="EVE-70" href="https://linear.app/resnovas/issue/EVE-70/f32-build-checklists-with-photo-evidence-and-sign-off-that-work" />, <issue id="b092122b-6aea-4fec-b8c4-e1baf084c342" label="EVE-72" href="https://linear.app/resnovas/issue/EVE-72/f33-build-subtasks-and-finish-to-start-dependencies-with-blocker" /> (F3.1 to F3.3), <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />, <issue id="a7a66a5c-e747-4245-bc84-3232ef65a16c" label="EVE-16" href="https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web" />, <issue id="b7f17f15-c893-46e9-9b3b-2aefae473802" label="EVE-27" href="https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource" />; Rambo-UI components listed above.

## Linear comments (1)

### Comment 89a75570-ad3e-4e79-862f-31c74297e921

Author: GitHub. Created: 2026-11-01T13:07:11.180Z; updated: 2026-11-01T13:07:11.146Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-86/f35-build-the-task-screens-with-screen-projections-on-web-and-mobile) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/853). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
