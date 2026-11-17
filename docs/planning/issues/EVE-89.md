<!-- linear:generated:start -->
# EVE-89: F3.6 Build task reminders, watchers and notifications

[Live Linear source](https://linear.app/resnovas/issue/EVE-89/f36-build-task-reminders-watchers-and-notifications) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:14.915Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-62](EVE-62.md) |
| Children | None recorded |
| Blocked by | [EVE-24](EVE-24.md), [EVE-45](EVE-45.md), [EVE-54](EVE-54.md), [EVE-64](EVE-64.md) |
| Blocks | None recorded |
| Related to | [EVE-18](EVE-18.md), [EVE-235](EVE-235.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Approved (2026-11-08, <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> decisions). Planning only until Jonathan asks for implementation.

## Goal

People hear about the tasks that matter to them (assigned, due soon, overdue, unblocked, commented) on the channel they choose, without duplicates.

## Context

* Parent spec: <issue id="4e19a499-139f-4016-88c4-264d3a0f7c33" label="EVE-62" href="https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event" /> sections 4 (`reminder.*`, `task.watch`), 8 (notifications through <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" />).
* Task events come from <issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" />; durable timers from <issue id="a626308a-598f-41ba-accd-4004cbbd9932" label="EVE-54" href="https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow" /> (Effect Cluster and Workflow).

## Scope

1. Tables Reminder and TaskWatch; assignees and creators watch by default.
2. Actions `reminder.set`, `reminder.clear`, `task.watch`, `task.unwatch`.
3. A durable reminder scheduler on Effect Cluster that fires once per reminder, survives runner loss (<issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" /> behaviour) and re-arms when a due date changes.
4. Notification rules: assigned to you, due in 24 hours (default, user-changeable), overdue, unblocked, mentioned, completed (for watchers). Sent through <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> with a per-user channel and quiet hours setting.
5. Offline devices raise local reminders for synced tasks and suppress the server push when the local one already fired (dedupe key per reminder).
6. Flag: part of `tasks`.

## Acceptance criteria

* A reminder fires once when the runner holding it is killed before the fire time.
* Changing a due date re-arms its relative reminder; clearing it cancels it.
* A phone offline at fire time shows the local reminder and gets no duplicate push on reconnect.
* Watchers get one notification per completed task; quiet hours delay non-urgent sends.

## Constraints

Effect-TS v3; channels behind <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> ports, no vendor coupling; no new dependency without approval here; ships to main with `node --run check` results pasted here.

## Done signal

Merged to main with the runner-kill and dedupe tests green.

## Blockers

<issue id="d63643eb-423b-4502-b0a5-e4b99c887f54" label="EVE-64" href="https://linear.app/resnovas/issue/EVE-64/f31-build-task-lists-and-tasks-as-synced-records-with-actions" /> (F3.1), <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" />, <issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" />, <issue id="a626308a-598f-41ba-accd-4004cbbd9932" label="EVE-54" href="https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow" />.

## Linear comments (1)

### Comment 71d25889-ace4-44fd-a03e-12e7186b4f3f

Author: GitHub. Created: 2026-11-01T13:07:13.937Z; updated: 2026-11-01T13:07:13.912Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-89/f36-build-task-reminders-watchers-and-notifications) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/856). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
