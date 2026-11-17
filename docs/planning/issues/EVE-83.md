<!-- linear:generated:start -->
# EVE-83: F12.2 Build time capture: clock in and out and time entries, offline

[Live Linear source](https://linear.app/resnovas/issue/EVE-83/f122-build-time-capture-clock-in-and-out-and-time-entries-offline) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:17.081Z. Generated source mirror; edit Linear and refresh, not this region.

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

Crew clock in and out on site from a phone, including with no signal, and every worked interval is recorded once against the right shift, event and phase.

## Context

* Parent: <issue id="335d2890-1b10-44eb-89f0-b9a032afacfa" label="EVE-61" href="https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets" />, sections 4, 5, 6 and 11.
* Shifts come from F2 (Shift, Roster assignment on <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" />); events and phases from F1. A time entry without a shift is allowed (walk-on crew) but needs an Event.
* Offline record sync is <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" /> with the engine chosen in <issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" /> (S4).

## Scope

1. TimeEntry entity (<issue id="335d2890-1b10-44eb-89f0-b9a032afacfa" label="EVE-61" href="https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets" /> section 5) and append-only ClockEvent (in, out, break start, break end) with device time, server receive time and source (clock, manual, roster draft, agent).
2. TimeEntry is derived from ClockEvents, so two devices clocking the same worker never overwrite each other; duplicates with the same idempotency key collapse.
3. Actions `time.clock.in`, `time.clock.out`, `time.entry.upsert` with the permissions in <issue id="335d2890-1b10-44eb-89f0-b9a032afacfa" label="EVE-61" href="https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets" /> section 4.
4. Optional location at clock in and out only, behind the `payroll-clock-location` flag and the org setting (decision D5); no tracking between.
5. "My shift" mobile screen: shift card, clock button, break toggle, offline badge showing queued writes; screen-context projection and action bindings (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />).
6. Device clock skew: store both times; flag entries where skew exceeds 5 minutes for the approver.

## Acceptance criteria

* On a real Android device in airplane mode: clock in, break, clock out, restart the app, reconnect; exactly one TimeEntry appears on the server with the right duration.
* Two devices clock the same worker out at different times while offline; on reconnect both events are kept, the entry uses the later, and the conflict is flagged.
* The agent clocks a worker in through MCP and the same audit record appears as for the UI.
* No location is stored when the flag or org setting is off, in a test.

## Constraints

Effect-TS v3 house rules; no zod; behind the `payroll` flag; location is personal data (<issue id="335d2890-1b10-44eb-89f0-b9a032afacfa" label="EVE-61" href="https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets" /> section 11): stored only at the two moments, retention as configured; no new dependency without approval on this issue; ships to main with `node --run check` results pasted here.

## Done signal

Device run recorded with commands and evidence in a comment, tests green on main.

## Linear comments (1)

### Comment 709afc24-3a3d-462a-bf61-41ee40d9e58a

Author: GitHub. Created: 2026-11-01T13:07:07.456Z; updated: 2026-11-01T13:07:07.407Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-83/f122-build-time-capture-clock-in-and-out-and-time-entries-offline) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/850). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
