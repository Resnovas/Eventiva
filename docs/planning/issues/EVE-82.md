<!-- linear:generated:start -->
# EVE-82: F12.1 Build pay rules, rate cards and pay profiles

[Live Linear source](https://linear.app/resnovas/issue/EVE-82/f121-build-pay-rules-rate-cards-and-pay-profiles) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:21.773Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Outstanding, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-61](EVE-61.md) |
| Children | None recorded |
| Blocked by | [EVE-23](EVE-23.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md) |
| Blocks | [EVE-87](EVE-87.md), [EVE-138](EVE-138.md) |
| Related to | [EVE-50](EVE-50.md), [EVE-80](EVE-80.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

A payroll administrator defines how every worker is paid (hourly, day rate, fixed fee, overtime, allowances, holiday accrual) once, versioned by effective date, and the same rules drive every later pay run.

## Context

* Parent: [EVE-61](<https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets>) (F12 Payroll), sections 4 and 5.
* Workers and their Engagement (type, payBasis, individual rate, contractedHours, offPayrollStatus) are F13's (<issue id="253839bc-c987-416b-92ea-206c9e9e8d2e" label="EVE-80" href="https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave" />); an Engagement rate overrides the rate card for that worker. PayProfile holds only pay schedule, rate card and provider worker ref. events and phases are F1's Event and Phase. Do not redefine them; reference by id.
* Actions follow [EVE-40](<https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema>); storage and tenant guards follow [EVE-42](<https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state>); roles follow [EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>).

## Scope

1. A `payroll` extension package with Effect Schema definitions through the shared schema package (<issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />) for PayRule, RateCard and PayProfile (fields as in <issue id="335d2890-1b10-44eb-89f0-b9a032afacfa" label="EVE-61" href="https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets" /> section 5). Money as integer minor units plus ISO currency.
2. A pure rule evaluator (plain TypeScript, no IO): given a rule, a rate card and a list of worked intervals, return pay lines with quantity, rate and amount. Kinds: hourly, day rate (with a threshold for half day), fixed fee per engagement, overtime (after N hours per day or per week, multiplier), allowance (flat or per unit), deduction (flat), holiday accrual (percentage or hours-based; values supplied as parameters).
3. Versioning: a rule or rate card used by a locked run is never edited in place; an upsert creates a new version with an effective-from date.
4. Actions `payroll.payRule.upsert`, `payroll.rateCard.upsert`, `payroll.rateCard.list`, `payroll.worker.setPayProfile` with permissions and approval policies from <issue id="335d2890-1b10-44eb-89f0-b9a032afacfa" label="EVE-61" href="https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets" /> section 4.
5. Screen "Pay rules and rate cards" from Rambo-UI with its screen-context projection and every control bound to an action (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" /> contract; stub the registry if <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" /> is not yet merged and note it here).

## Acceptance criteria

* Property tests for the evaluator: overtime never double counts; day-rate threshold boundary cases; zero-length and overnight intervals across a DST change.
* A fixture of 10 rules gives pay lines matching a hand-checked table to the minor unit.
* Editing a rule used by a locked run creates a version and leaves the old one unchanged, in a test.
* Permission tests: a worker cannot read rate cards; a payroll admin can, on HTTP and MCP.

## Constraints

Effect-TS v3 house rules (`Data.TaggedError`, `Context.Tag`, Schema, `@effect/vitest`); no zod; no floats for money; new behaviour behind the `payroll` flag (default off); no new dependency without Jonathan approving it on this issue; ships to main per the AGENTS.md delivery exception with `node --run check` results pasted here.

## Done signal

Package on main, tests green, a comment listing the public actions and the evaluator API.

## Linear comments (1)

### Comment b82d72b5-6b0b-4fd4-81fb-b4445385cfc8

Author: GitHub. Created: 2026-11-01T13:07:05.394Z; updated: 2026-11-01T13:07:05.366Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-82/f121-build-pay-rules-rate-cards-and-pay-profiles) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/849). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
