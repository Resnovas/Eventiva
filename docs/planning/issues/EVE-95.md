<!-- linear:generated:start -->
# EVE-95: F4.3 Build the activity timeline: interactions, notes and history from other sets

[Live Linear source](https://linear.app/resnovas/issue/EVE-95/f43-build-the-activity-timeline-interactions-notes-and-history-from) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:11.093Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Outstanding, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-65](EVE-65.md) |
| Children | None recorded |
| Blocked by | [EVE-45](EVE-45.md), [EVE-51](EVE-51.md), [EVE-68](EVE-68.md) |
| Blocks | [EVE-137](EVE-137.md), [EVE-139](EVE-139.md), [EVE-144](EVE-144.md) |
| Related to | [EVE-31](EVE-31.md), [EVE-107](EVE-107.md), [EVE-222](EVE-222.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Opening a person or organisation shows everything that has happened with them, in time order, from calls and notes to orders and invoices, and the agent can read and add to it.

## Context

* Parent <issue id="ad791a38-f528-4aec-9433-c36977bbe8e2" label="EVE-65" href="https://linear.app/resnovas/issue/EVE-65/f4-contacts-and-crm-people-organisations-relationships-and-history" /> sections 5 (Interaction, Note, timeline projection) and 7 (agent behaviour).
* Other sets publish domain events on the change feed (<issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" />) that name a party; the timeline subscribes, it does not own those records.
* Notes are Yjs documents embedded in the Party record (<issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />).

## Scope

1. Table `interaction` (kinds call, meeting, email, message, visit, note; direction; occurred at; duration; summary; source; external message id; links to Event (F1), Opportunity, Task (F3)) with many-to-many `interaction_party`.
2. Actions `crm.interaction.log` / `update` / `delete`, `crm.note.create` / `update`, `crm.timeline.get` (filter by kind, source, date; cursor paging).
3. A timeline projection service that merges local rows with change feed entries registered by other sets through a `TimelineContributor` contract (kind, party ids, title, link action). F4 ships contributors for its own entities; other sets add theirs.
4. `lastInteractionAt` per party, maintained from the projection, used by F4.10 suggestions.
5. Screens: Timeline component on Person and Organisation detail; Log interaction dialog; Note editor (Rambo-UI RichTextEditor on Yjs).
6. Voice: when <issue id="7bd596ca-10db-4e11-bced-7aa22fc64269" label="EVE-31" href="https://linear.app/resnovas/issue/EVE-31/port-voice-input-and-transcription-for-the-agent" /> exists, the log dialog accepts dictation; until then text only.

## Acceptance criteria

* Tests: log, edit and delete with undo; timeline paging stable under concurrent inserts; a fake contributor's event appears for the right party and not for others; a member without read on the source record does not see that entry.
* Two devices edit the same note offline and converge after reconnect (<issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" /> harness).
* The agent answers "when did we last speak to this client and about what" with the interaction cited.
* `node --run check` green.

## Constraints

Effect-TS v3; no note text in telemetry or logs; WCAG 2.2 AA; no new dependency without approval here; ship to main with check results.

## Done signal

Merged with tests green, the contributor contract documented in ai-docs for other feature sets, and the offline note check recorded.

## Blockers

<issue id="d71c315c-52d0-4e04-b37a-88b4e1db7827" label="EVE-68" href="https://linear.app/resnovas/issue/EVE-68/f41-build-people-organisations-and-contact-points-as-crm-actions" /> (F4.1), <issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" />, <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />.

## Linear comments (1)

### Comment 630ec286-ac1a-4cb9-99cb-ef39840fe9e1

Author: GitHub. Created: 2026-11-01T13:07:16.766Z; updated: 2026-11-01T13:07:16.730Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-95/f43-build-the-activity-timeline-interactions-notes-and-history-from) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/862). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
