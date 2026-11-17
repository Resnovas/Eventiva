<!-- linear:generated:start -->
# EVE-91: F4.2 Link contacts to events with roles and to each other with relationships

[Live Linear source](https://linear.app/resnovas/issue/EVE-91/f42-link-contacts-to-events-with-roles-and-to-each-other-with) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:13.747Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Outstanding, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-65](EVE-65.md) |
| Children | None recorded |
| Blocked by | [EVE-43](EVE-43.md), [EVE-68](EVE-68.md) |
| Blocks | [EVE-137](EVE-137.md) |
| Related to | [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-73](EVE-73.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Every event shows who the client, venue contact, vendors and artists are, crew can reach them from their phone offline, and people can be linked to each other (assistant of, agent for).

## Context

* Parent [EVE-65](<https://linear.app/resnovas/issue/EVE-65/f4-contacts-and-crm-people-organisations-relationships-and-history>) sections 5 (EventRole, Relationship), 6 (Event contacts tab, Mobile event contact sheet) and 9 (event scoped access).
* Event is an F1 entity; this issue references it by id and does not redefine it. The tab mounts inside the F1 event screen through the module registration in [EVE-50](<https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen>) (federated modules register on activation).
* Crew assignment to shifts stays in F2; EventRole is the business contact role only.
* F1 names are fixed in <issue id="fbcff205-decd-464a-b8ab-a1278e71fbe4" label="EVE-73" href="https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show" /> section 5. The primary client is `Event.client_ref` (F1 owns it); the tab shows it first, read from F1, and EventRole has no client role. F1 TeamMember `contact_ref` (internal event team) and Rider performer `contact_ref` (artist) point to Party ids; keep them stable and register them as reference owners for merge (F4.4).

## Scope

1. Tables `event_role` (event id, party id, role enum without client, notes, on-site flag) and `relationship` (from, to, type, label).
2. Actions `crm.eventRole.assign` / `unassign` / `list`, `crm.relationship.add` / `remove` / `list`, with undo.
3. Authorization rule: read on an Event grants read of the business fields (name, role, organisation, work email, work phone) of parties holding an EventRole on it; personal contact points stay masked.
4. Sync scope rule for [EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>): a device syncs EventRoles and business fields for events the member is on within the next 30 days.
5. Screens: Event contacts tab, Person and Organisation detail Events tab, Mobile event contact sheet with call and message buttons bound to actions (`crm.interaction.log` is called after a call when F4.3 exists; until then the button only dials).

## Acceptance criteria

* Tests: a crew member with event read and no `crm:read` sees the venue contact's work phone and not their personal phone; removing the member from the event removes access on next sync.
* Android offline: the contact sheet for tomorrow's event opens in airplane mode with the venue contact listed.
* The agent answers "who is the venue contact for this event" on the event screen and assigns a vendor role by action.
* `node --run check` green.

## Constraints

Effect-TS v3; WCAG 2.2 AA; no new dependency without approval here; ship to main with check results pasted here.

## Done signal

Merged with the tests green and the offline Android check recorded.

## Blockers

<issue id="d71c315c-52d0-4e04-b37a-88b4e1db7827" label="EVE-68" href="https://linear.app/resnovas/issue/EVE-68/f41-build-people-organisations-and-contact-points-as-crm-actions" /> (F4.1), <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />, <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" /> for the offline part, F1 Event entity for the tab.

## Linear comments (1)

### Comment 562570be-3b4d-4d58-9816-8a200bb0d6f1

Author: GitHub. Created: 2026-11-01T13:07:14.905Z; updated: 2026-11-01T13:07:14.881Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-91/f42-link-contacts-to-events-with-roles-and-to-each-other-with) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/858). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
