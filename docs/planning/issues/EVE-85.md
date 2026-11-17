<!-- linear:generated:start -->
# EVE-85: F12.3 Build timesheets: draft from roster, submit and approve

[Live Linear source](https://linear.app/resnovas/issue/EVE-85/f123-build-timesheets-draft-from-roster-submit-and-approve) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:15.748Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Duplicate (duplicate) |
| Priority | 0: No priority |
| Labels | None recorded |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-61](EVE-61.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | None recorded |
| Duplicate of | [EVE-138](EVE-138.md) |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Each worker's hours for a period are gathered into one timesheet, drafted from their roster, checked against what they actually clocked, and approved by the right person before anything is paid.

## Context

* Parent: <issue id="335d2890-1b10-44eb-89f0-b9a032afacfa" label="EVE-61" href="https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets" />, sections 4 to 6 and 9. Builds on F12.2 time entries and F12.1 pay profiles (pay frequency sets the period).
* Rosters and shifts are F2's (<issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" />). State machines come from <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" />; scoped roles (crew chief per event or team) from <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />; change notifications use <issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" /> and, once ported, <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" />.

## Scope

1. Timesheet entity with a state machine: draft, submitted, approved, rejected, locked. Only a run lock (F12.4) moves it to locked.
2. `time.timesheet.draftFromRoster`: build draft entries from rostered shifts for a worker or team and period, marked source = roster draft, merged with clocked entries (clocked wins, roster kept as the expected value).
3. Variance per entry and per timesheet: clocked versus rostered, with an org threshold (default 15 minutes) that marks it for review.
4. `time.timesheet.submit`, `time.timesheet.approve`, `time.timesheet.reject` (reason required), `payroll.allowance.add`; approver scope is the event or team the entries belong to; a timesheet spanning two events needs each event's approver for its entries.
5. Offline: draft and submit work offline; an approval queued offline against a timesheet that changed since is rejected on sync and shown to the approver.
6. Screens "My timesheet" and "Team approvals" (grouped by event and team, diff against roster, bulk approve) with projections and action bindings (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />).

## Acceptance criteria

* A roster of 5 shifts drafts 5 entries; a 30-minute late finish shows as a variance; the crew chief approves it and adds a late-finish allowance.
* A crew chief for event A cannot approve entries for event B, on UI, HTTP and MCP.
* The offline stale-approval case is rejected and flagged, in a test.
* Bulk approve of 50 timesheets is one action call per timesheet with one audit receipt each.

## Constraints

Effect-TS v3 house rules; no zod; behind the `payroll` flag; no new dependency without approval on this issue; ships to main with `node --run check` results pasted here.

## Done signal

Tests green on main; a comment with the state diagram and the action list.

## Linear comments (1)

### Comment 650c6db0-937b-4d6b-8725-10cdb693cb79

Author: GitHub. Created: 2026-11-01T13:07:08.993Z; updated: 2026-11-01T13:07:08.972Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-85/f123-build-timesheets-draft-from-roster-submit-and-approve) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/852). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
