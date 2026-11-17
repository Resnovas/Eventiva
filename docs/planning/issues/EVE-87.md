<!-- linear:generated:start -->
# EVE-87: F12.4 Build pay run calculation on durable runs

[Live Linear source](https://linear.app/resnovas/issue/EVE-87/f124-build-pay-run-calculation-on-durable-runs) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:16.768Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Outstanding, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-61](EVE-61.md) |
| Children | None recorded |
| Blocked by | [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-54](EVE-54.md), [EVE-82](EVE-82.md) |
| Blocks | [EVE-88](EVE-88.md), [EVE-92](EVE-92.md), [EVE-101](EVE-101.md) |
| Related to | [EVE-18](EVE-18.md), [EVE-50](EVE-50.md), [EVE-138](EVE-138.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

A payroll administrator opens a pay period, calculates gross pay for every worker from approved timesheets, reviews exceptions, and locks the run so it can never change silently.

## Context

* Parent: [EVE-61](<https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets>), sections 4, 5, 6 and 12. Uses the F12.1 evaluator and approved, locked timesheets from F2's `timesheet.export` (<issue id="522cf0df-8126-444d-8833-1e31bf21345e" label="EVE-138" href="https://linear.app/resnovas/issue/EVE-138/f29-build-time-capture-and-timesheets" />, a versioned idempotent batch per period). F2 owns time capture and timesheets.
* Durable execution on Effect Cluster per [EVE-54](<https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow>) and the sharding decisions in [EVE-18](<https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and>); audit from [EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>).

## Scope

1. PayPeriod and PayRun entities with states draft, locked, submitted, completed, reversed; PayLine with cost centre (F1 Event and Phase) and source refs to rules, rates and time entries.
2. `payroll.period.open`, `payroll.run.calculate` (idempotent; recalculating a draft replaces its lines), `payroll.run.lock` (approval always; locks the included timesheets through F2's action), `payroll.run.reverse` (creates correcting lines in the next open run, leaves the locked run unchanged).
3. Calculation runs as a durable workflow sharded by org; a run of 2,000 workers survives a runner restart mid-run without duplicate lines.
4. Exceptions list: unapproved timesheets in the period, workers without a pay profile, effective hourly pay below the configured statutory minimum, working-time limit breaches, variance above threshold; each exception links to the action that resolves it.
5. `payroll.run.explainLine`: returns rule, rate, version and source entries for any line, used identically by the UI drawer and the agent.
6. Optional two-person approval as an org setting (decision D4): the person who calculated cannot lock.
7. "Pay run" stepper screen plus `payroll.allowance.add` (meal, travel, late finish; approval confirm, permission `time:approve`) for allowances against a worker and event with projection and bindings ([EVE-50](<https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen>)).

## Acceptance criteria

* The 50-worker fixture in <issue id="335d2890-1b10-44eb-89f0-b9a032afacfa" label="EVE-61" href="https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets" /> section 12 matches to the minor unit.
* Killing a runner during a 2,000-worker calculation and restarting gives the same totals and no duplicate lines.
* A lock attempt by the agent without human approval fails with a typed error and an audit entry.
* Reverse plus next run nets to the corrected amount, with the original run byte-for-byte unchanged.

## Constraints

Effect-TS v3 house rules; no zod; integer money; behind the `payroll` flag; OTel spans per run and per worker batch with no amounts or names in attributes; no new dependency without approval on this issue; ships to main with `node --run check` results pasted here.

## Done signal

Tests and the runner-loss scenario recorded in a comment; on main.

## Linear comments (1)

### Comment 8ad18f06-3576-44d1-894f-2e6612507244

Author: GitHub. Created: 2026-11-01T13:07:11.533Z; updated: 2026-11-01T13:07:11.509Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-87/f124-build-pay-run-calculation-on-durable-runs) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/854). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
