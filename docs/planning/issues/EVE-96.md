<!-- linear:generated:start -->
# EVE-96: F12.7 Build the payments file and the pay run events for accounting

[Live Linear source](https://linear.app/resnovas/issue/EVE-96/f127-build-the-payments-file-and-the-pay-run-events-for-accounting) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:10.198Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Outstanding, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-61](EVE-61.md) |
| Children | None recorded |
| Blocked by | [EVE-40](EVE-40.md), [EVE-43](EVE-43.md), [EVE-45](EVE-45.md), [EVE-88](EVE-88.md), [EVE-92](EVE-92.md) |
| Blocks | [EVE-104](EVE-104.md) |
| Related to | [EVE-50](EVE-50.md), [EVE-69](EVE-69.md), [EVE-80](EVE-80.md), [EVE-90](EVE-90.md), [EVE-116](EVE-116.md), [EVE-157](EVE-157.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

After a run is submitted, finance downloads one payment file for every net payment, and accounting receives one event per run with every cost on its event, phase and department.

## Context

* Parent: [EVE-61](<https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets>), sections 4 and 8. Net figures come from F12.5 results; freelancer amounts from F12.6.
* Boundary agreed with F11 (<issue id="158ba369-976e-47ea-9f86-a8df608cb4d0" label="EVE-69" href="https://linear.app/resnovas/issue/EVE-69/f11-accounting-ledgers-invoices-bills-event-budgets-and-tax" />) on 2026-11-01: F12 does not post journals. It emits change-feed events (<issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" />); F11 maps them to accounts (<issue id="0a4ea4c5-5ab9-4f19-acf4-0b5e66767a62" label="EVE-90" href="https://linear.app/resnovas/issue/EVE-90/f112-build-posting-rules-that-turn-sales-stock-and-payroll-events-into" />) and reconciles the net wages payment (<issue id="2c2a9287-a031-45ab-9b4c-b32a11def2b5" label="EVE-157" href="https://linear.app/resnovas/issue/EVE-157/f116-build-bank-import-feeds-matching-and-reconciliation" />).

## Scope

1. `PaymentRail` neutral port with a file adapter only in this issue: UK Bacs Standard 18 layout (verify the current specification at build time), plus a generic CSV. No payment provider API.
2. `payroll.payment.prepare` (approval always): build a PaymentBatch from a completed run; bank details are read from F13's encrypted SensitiveProfile (<issue id="636f7592-553b-41f2-adb0-9a336d0188e3" label="EVE-116" href="https://linear.app/resnovas/issue/EVE-116/f132-build-the-sensitive-profile-with-field-masking-reveal-audit-and" />) only at file generation and never stored in F12.
3. Emit `payroll:run_approved` once per run when it reaches completed (net results imported): pay run id, pay date, period, and per cost dimension (F1 Event, Phase, Department where known) gross pay, employer NI, employer pension, employee deductions (PAYE, employee NI, pension, student loan, other) and net pay, plus freelancer self-bill totals separately; integer minor units with currency. Idempotency key = run id.
4. Emit `payroll:run_reversed` with the correcting amounts in the same shape when a run is reversed. Account mapping lives in F11 ([EVE-90](<https://linear.app/resnovas/issue/EVE-90/f112-build-posting-rules-that-turn-sales-stock-and-payroll-events-into>)), not here.
5. Steps added to the pay run stepper with projections and bindings ([EVE-50](<https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen>)).

## Acceptance criteria

* Payment file for the fixture matches a committed snapshot and totals to net pay.
* The event's per-dimension gross sums to the run gross and its net to the payment file total.
* Replaying the change feed delivers the event for a run once per consumer (same idempotency key), in a test.
* Bank details are absent from storage after the file is generated (test).

## Constraints

Effect-TS v3; no zod; behind the `payroll` flag; no new dependency without approval on this issue; ships to main with `node --run check` results pasted here.

## Done signal

Tests green on main; comment with the event schema, shared with the F11 posting issue (<issue id="0a4ea4c5-5ab9-4f19-acf4-0b5e66767a62" label="EVE-90" href="https://linear.app/resnovas/issue/EVE-90/f112-build-posting-rules-that-turn-sales-stock-and-payroll-events-into" />).

## Linear comments (1)

### Comment 6dcfc1c9-fa41-4618-bcf0-f0a61c1ab6ef

Author: GitHub. Created: 2026-11-01T13:07:18.288Z; updated: 2026-11-01T13:07:18.249Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-96/f127-build-the-payments-file-and-the-pay-run-events-for-accounting) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/863). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
