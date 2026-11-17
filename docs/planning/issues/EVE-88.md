<!-- linear:generated:start -->
# EVE-88: F12.5 Build the payroll provider port and the first adapter

[Live Linear source](https://linear.app/resnovas/issue/EVE-88/f125-build-the-payroll-provider-port-and-the-first-adapter) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:15.808Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Outstanding, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-61](EVE-61.md) |
| Children | None recorded |
| Blocked by | [EVE-25](EVE-25.md), [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-87](EVE-87.md) |
| Blocks | [EVE-96](EVE-96.md) |
| Related to | [EVE-80](EVE-80.md), [EVE-116](EVE-116.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

A locked pay run is sent to a recognised payroll provider that calculates net pay, files tax and returns payslips, without Eventiva holding tax codes or bank details, and the provider can be switched by composition alone.

## Context

* Parent: <issue id="335d2890-1b10-44eb-89f0-b9a032afacfa" label="EVE-61" href="https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets" />, sections 8, 11 and decision D1. This issue assumes D1 option A (provider calculates net and files). If Jonathan picks B or C, this issue is rewritten before work starts.
* Credentials and secrets via <issue id="9d08c369-bac9-4eb7-b8a7-329b5ec9bff0" label="EVE-41" href="https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials" />; payslip documents stored with <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" />.
* UK filing (PAYE RTI) requires HMRC PAYE recognition: [https://www.gov.uk/guidance/paye-recognition-for-payroll-software-developers](<https://www.gov.uk/guidance/paye-recognition-for-payroll-software-developers>)

## Scope

1. A neutral `PayrollProvider` Effect service (`Context.Tag`) in its own integration contract: `syncWorkers`, `submitRun` (gross lines per worker, pensionable pay, period), `getSubmission`, `fetchPayslips`; typed errors for rejected worker, rejected run, provider unavailable, auth expired.
2. A file adapter first (CSV in the provider-neutral shape, versioned), so payroll works with any provider by import before any API adapter exists.
3. One API adapter for the provider Jonathan approves on this issue (candidate: an HMRC-recognised payroll API such as Staffology; no sign-up until approved), in its own integration package.
4. Actions `payroll.run.submitToProvider` (approval always) and `payroll.run.importResults`; submissions carry an idempotency key and request hash so a retry never double submits.
5. Tax and NI ids and bank details come from F13's encrypted SensitiveProfile (<issue id="636f7592-553b-41f2-adb0-9a336d0188e3" label="EVE-116" href="https://linear.app/resnovas/issue/EVE-116/f132-build-the-sensitive-profile-with-field-masking-reveal-audit-and" />) at submission time and are sent to the provider; F12 tables keep only provider references.

## Acceptance criteria

* The file adapter output for the 50-worker fixture matches a committed snapshot.
* A contract test suite runs against the file adapter and a fake API adapter; the real adapter passes it in a sandbox account once approved.
* A retried submit after a timeout produces one submission, in a test.
* No tax code, NI number or bank detail appears in F12 tables, telemetry or agent prompts (grep test over schemas and a telemetry capture).

## Constraints

Effect-TS v3; vendor code only in the integration package with `// effect-boundary:` on the one wrapping call; no vendor sign-up and no new dependency until Jonathan approves on this issue; behind the `payroll` flag; ships to main with `node --run check` results pasted here.

## Done signal

Port and file adapter on main; provider choice recorded here; API adapter merged after approval.

## Linear comments (1)

### Comment 2f777093-9a6a-4f1a-a739-d28e36f708ce

Author: GitHub. Created: 2026-11-01T13:07:13.311Z; updated: 2026-11-01T13:07:13.280Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-88/f125-build-the-payroll-provider-port-and-the-first-adapter) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/855). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
