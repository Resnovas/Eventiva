<!-- linear:generated:start -->
# EVE-97: F7.2 Build driver eligibility checks from staff qualifications

[Live Linear source](https://linear.app/resnovas/issue/EVE-97/f72-build-driver-eligibility-checks-from-staff-qualifications) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:57:42.622Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Audit needed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-71](EVE-71.md) |
| Children | None recorded |
| Blocked by | [EVE-40](EVE-40.md), [EVE-43](EVE-43.md), [EVE-154](EVE-154.md) |
| Blocks | None recorded |
| Related to | [EVE-80](EVE-80.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Before a person is allocated to drive a vehicle, Eventiva says whether they are eligible on that date and why not, using the licence and qualification records held once in staff records.

## Context

* Parent: [EVE-71](<https://linear.app/resnovas/issue/EVE-71>), action `fleet.driver.checkEligibility`, decision D5 (recommended: F13 owns licences as Qualifications; F7 only reads).
* VehicleType from F7.1 carries the licence categories it needs (for example UK B, C1, D1) and optional extra qualifications (for example forklift, 4x4 training).
* F13 (<issue id="253839bc-c987-416b-92ea-206c9e9e8d2e" label="EVE-80" href="https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave" />) Worker and Qualification of a QualificationType are referenced, not redefined. The `QualificationReader` port is built by F13 in <issue id="9f305527-7de1-436f-89bd-27341f70624e" label="EVE-154" href="https://linear.app/resnovas/issue/EVE-154/f135-build-qualifications-requirements-and-the-eligibility-check" /> and shared with F2: per person and date it returns qualifications (type key, category, validFrom, expiresAt, restrictions as codes plus text, verified), age band and contract type. UK licence categories B, C1, C, D1, D and extras such as 4x4 and forklift are seeded as qualification types. Until <issue id="9f305527-7de1-436f-89bd-27341f70624e" label="EVE-154" href="https://linear.app/resnovas/issue/EVE-154/f135-build-qualifications-requirements-and-the-eligibility-check" /> lands, use an in-memory test layer of that port.

## Scope

1. Consume the <issue id="9f305527-7de1-436f-89bd-27341f70624e" label="EVE-154" href="https://linear.app/resnovas/issue/EVE-154/f135-build-qualifications-requirements-and-the-eligibility-check" /> `QualificationReader` port (do not define a second one); provide an in-memory test layer with fixtures.
2. Action `fleet.driver.checkEligibility(worker, vehicleOrType, date)` returning `{ eligible, reasons[] }` with reasons: MissingCategory, Expired, ExpiresBeforeBookingEnds, MissingExtraQualification, Restricted, Unverified, WorkerInactive (status left or failed right to work).
3. Eligibility shown wherever a driver is picked (F7.3 booking, F7.6 unit form) as a badge with reasons.
4. If D5 is answered (b) instead, this issue adds a DriverLicence entity in F7 with the same check; the action contract does not change.

## Acceptance criteria

* Table tests cover each reason, including a licence expiring mid-booking.
* The check is a read action reachable from every surface; the agent can explain why a driver is not eligible.
* No licence numbers or dates appear in telemetry or logs.

## Constraints

Effect-TS v3 house rules; no zod; behind `eventiva-fleet`; personal data stays in F13 (UK GDPR minimisation); no new dependency without Jonathan approving it on this issue; tests with `@effect/vitest`; docs; ships to main per the AGENTS.md delivery exception with `node --run check` results pasted here.

## Done signal

Merged to main, reason table tests green, comment here with the action schema.

## Blockers

[EVE-40](<https://linear.app/resnovas/issue/EVE-40>), [EVE-43](<https://linear.app/resnovas/issue/EVE-43>); F7.1 (vehicle types); <issue id="9f305527-7de1-436f-89bd-27341f70624e" label="EVE-154" href="https://linear.app/resnovas/issue/EVE-154/f135-build-qualifications-requirements-and-the-eligibility-check" /> QualificationReader (or the test layer above).

## Linear comments (1)

### Comment c4ebd021-cbaf-4960-bdc4-b0ef265c614b

Author: GitHub. Created: 2026-11-01T13:07:18.416Z; updated: 2026-11-01T13:07:18.326Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-97/f72-build-driver-eligibility-checks-from-staff-qualifications) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/864). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
