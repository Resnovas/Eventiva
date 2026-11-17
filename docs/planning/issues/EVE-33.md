<!-- linear:generated:start -->
# EVE-33: Port scheduling primitives for availability, bookings and rosters

[Live Linear source](https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:34.946Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Code, Decision: Audit needed, Delivery: Implementation pending, Enhancement |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-93](EVE-93.md), [EVE-100](EVE-100.md), [EVE-123](EVE-123.md), [EVE-124](EVE-124.md), [EVE-128](EVE-128.md), [EVE-129](EVE-129.md), [EVE-130](EVE-130.md), [EVE-138](EVE-138.md), [EVE-154](EVE-154.md), [EVE-161](EVE-161.md), [EVE-171](EVE-171.md), [EVE-179](EVE-179.md), [EVE-218](EVE-218.md) |
| Related to | [EVE-14](EVE-14.md), [EVE-15](EVE-15.md), [EVE-17](EVE-17.md), [EVE-18](EVE-18.md), [EVE-23](EVE-23.md), [EVE-61](EVE-61.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-80](EVE-80.md), [EVE-84](EVE-84.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-131](EVE-131.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

A shared scheduling engine for everything time-based in Eventiva: staff availability and rosters, equipment and venue bookings, recurring tasks and appointment slots.

## Upstream reference (pinned tag from <issue id="cc5eba91-a4f7-4542-b332-10d3e1d70ed8" label="EVE-15" href="https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol" />)

* `packages/scheduling` (10k lines): Drizzle schemas for event types, schedules, availability rules, bookings, teams, workflows, routing forms; pure helpers for DST-safe slot computation, availability evaluation, round-robin assignment, recurring expansion; booking service; pluggable calendar and video providers; actions; headless React hooks.

## Eventiva form

* `scheduling` extension: pure helpers stay plain TypeScript (no IO); services in Effect; schemas through the shared schema package (<issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />).
* Resources are generic (person, vehicle, kit item, room) so staff planning, dispatch and stock booking reuse it.
* Actions `availability.set`, `slots.find`, `bookings.create`, `bookings.cancel`, `roster.assign` with conflict detection; works offline with conflicts resolved by the S4 policy and flagged for a person.
* Calendar sync (Google, Microsoft) as integration packages.
* Heavy computations (rostering large crews) run as sharded Effect Cluster entities.

## Acceptance

Book a crew member and a van for overlapping shifts and get a conflict; DST changes do not shift bookings; two offline schedulers double-book and the conflict is surfaced on reconnect; the agent finds a free slot for a crew of five.

## Depends on

<issue id="07c58289-6f1c-488e-a130-5f718b473fce" label="EVE-14" href="https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory" />, <issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" />, <issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" />, <issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />.

## Out of scope

Payroll and time sheets.

## Linear comments (1)

### Comment 3a1f58a1-02e2-45a4-8779-207056c5e8c4

Author: GitHub. Created: 2026-10-31T21:59:15.735Z; updated: 2026-10-31T21:59:15.696Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/800). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
