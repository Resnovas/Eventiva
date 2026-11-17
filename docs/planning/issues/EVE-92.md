<!-- linear:generated:start -->
# EVE-92: F12.6 Build freelancer self-billing and worker status records

[Live Linear source](https://linear.app/resnovas/issue/EVE-92/f126-build-freelancer-self-billing-and-worker-status-records) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:12.682Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Outstanding, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-61](EVE-61.md) |
| Children | None recorded |
| Blocked by | [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-43](EVE-43.md), [EVE-87](EVE-87.md) |
| Blocks | [EVE-96](EVE-96.md) |
| Related to | [EVE-80](EVE-80.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Freelancers and agencies are paid from the same approved hours as employees, through self-billed invoices, with their engagement status and self-billing agreement on record before the first payment.

## Context

* Parent: <issue id="335d2890-1b10-44eb-89f0-b9a032afacfa" label="EVE-61" href="https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets" />, sections 2, 4, 11 and decision D3 (self-billing recommended).
* Freelancers trading as companies are F4 Organisations; their people are F13 Workers. Agreements and invoices are files (<issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" />); "invoice issued" notifications use <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" />.
* Off-payroll working rules (IR35): Eventiva records the determination, it does not decide it.

## Scope

1. Read engagement type and offPayrollStatus from F13's Engagement (<issue id="253839bc-c987-416b-92ea-206c9e9e8d2e" label="EVE-80" href="https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave" />); F12 keeps no separate status record. A freelancer whose Engagement has no offPayrollStatus is a pay run exception.
2. SelfBillingAgreement record: freelancer, start, end, signed file ref; required before `payroll.selfBill.issue` succeeds.
3. `payroll.selfBill.issue` (approval always): one invoice per freelancer per run, sequential numbering per org, VAT treatment from the freelancer's profile, PDF stored as a file, freelancer notified.
4. Freelancer view: their invoices and payment status, read-only.
5. Freelancer lines are excluded from the PayrollProvider submission and included in the payment file (F12.7) and journals.

## Acceptance criteria

* Issuing a self-bill for a freelancer without a current agreement fails with a typed error naming the missing agreement.
* Invoice numbers are gap-free and unique per org under concurrent issue, in a test.
* A freelancer cannot see another freelancer's invoices on any interface.
* A run with 10 employees and 5 freelancers sends 10 to the provider and 5 to self-billing.

## Constraints

Effect-TS v3; no zod; behind the `payroll` flag; invoice text whitelabel and ASCII; no new dependency (PDF rendering uses whatever <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" /> provides, or ask on this issue); ships to main with `node --run check` results pasted here.

## Done signal

Tests green on main; sample invoice PDF attached here.

## Linear comments (1)

### Comment 216fc17b-76ba-4701-9915-5183497e4ed5

Author: GitHub. Created: 2026-11-01T13:07:15.119Z; updated: 2026-11-01T13:07:15.090Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-92/f126-build-freelancer-self-billing-and-worker-status-records) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/859). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
