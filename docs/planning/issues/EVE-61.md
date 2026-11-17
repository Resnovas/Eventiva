<!-- linear:generated:start -->
# EVE-61: F12 Payroll: pay staff and crew from rosters and approved timesheets

[Live Linear source](https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:50.271Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Outstanding, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | None recorded |
| Children | [EVE-82](EVE-82.md), [EVE-83](EVE-83.md), [EVE-85](EVE-85.md), [EVE-87](EVE-87.md), [EVE-88](EVE-88.md), [EVE-92](EVE-92.md), [EVE-96](EVE-96.md), [EVE-101](EVE-101.md), [EVE-104](EVE-104.md) |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-13](EVE-13.md), [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-28](EVE-28.md), [EVE-33](EVE-33.md), [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-45](EVE-45.md), [EVE-46](EVE-46.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-67](EVE-67.md), [EVE-69](EVE-69.md), [EVE-73](EVE-73.md), [EVE-80](EVE-80.md), [EVE-90](EVE-90.md), [EVE-116](EVE-116.md), [EVE-138](EVE-138.md), [EVE-153](EVE-153.md), [EVE-157](EVE-157.md), [EVE-179](EVE-179.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Proposed (2026-11-01). Feature set F12 from the [Feature set spec template and list](<https://linear.app/resnovas/document/feature-set-spec-template-and-list-26b9f78cf17a>). Planning only: no code, no new dependency, no vendor sign-up until Jonathan approves the decisions below.

## 1. Goal

An organiser pays every person who worked an event correctly and on time, from the shifts they were rostered for and the hours they actually worked, with each cost landing on the right event and the right ledger account.

## 2. Users and jobs

| User | Jobs |
| -- | -- |
| Organiser or production manager | Approve timesheets for their event, see labour cost against budget per event and phase |
| Payroll administrator (finance) | Set pay rules and rate cards, run and lock a pay period, resolve exceptions, send to the payroll provider, post to accounts |
| Crew member or staff (employee) | Clock in and out on site (offline too), check and submit a timesheet, see payslips and pay history |
| Freelancer or contractor | Confirm hours, receive a self-billed invoice or submit their own, see payment status |
| Crew chief or department head | Approve hours for their team on the day, add allowances (meal, travel, late finish) |
| Accountant (external, read-only) | Download pay run reports and journals |
| Agent | Draft timesheets from rosters, flag anomalies, prepare the pay run, explain any line of pay; never submits or pays without approval |

## 3. Market check

Checked 2026-11-01. Names stay out of customer-facing copy.

* **Workforce tools with timesheets (Deputy, Rotaready, [workforce.com](<http://workforce.com>))**: rostering, clock-in with geofencing, timesheet approval, then an export or connector into a separate payroll product. They do not file tax themselves. Eventiva matches this shape for time capture and goes further by tying hours to event, phase and budget.
* **Payroll engines (Xero Payroll, Sage, BrightPay, PayFit)**: gross-to-net, payslips, statutory pay, pensions auto-enrolment and real-time filing to the tax authority. In the UK, software that files PAYE RTI must hold HMRC PAYE recognition ([gov.uk guidance](<https://www.gov.uk/guidance/paye-recognition-for-payroll-software-developers>)), and the recognition is re-tested every tax year.
* **Payroll APIs (Staffology Payroll API)**: an HMRC-recognised engine exposed as an API so another product can embed payroll ([staffology.co.uk](<https://staffology.co.uk/?p=20>)).

Where Eventiva differs: the event is the unit of cost; freelancers and employees are paid from one approved-time source; the agent can do every step a person can. Where Eventiva does not compete: filing tax returns itself (see decision D1).

## 4. Capabilities as actions

Every operation is an inventory action ([EVE-40](<https://linear.app/resnovas/issue/EVE-40>)) with Effect Schema input and output, typed errors, one permission check, audit receipt and change record with undo where it mutates. Approval policy follows <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" /> (none, confirm, always).

| Action | Input | Output | Permission | Approval |
| -- | -- | -- | -- | -- |
| `payroll.payRule.upsert` | rule id?, name, kind (hourly, day rate, fixed fee, overtime, allowance, deduction, holiday accrual), formula params, effective from | PayRule | `payroll:rules:write` | confirm |
| `payroll.rateCard.upsert` | role, grade, event? or org default, rates, currency, effective dates | RateCard | `payroll:rules:write` | confirm |
| `payroll.rateCard.list` | filters | RateCard\[\] | `payroll:rules:read` | none |
| `payroll.worker.setPayProfile` | worker ref and Engagement ref (F13), pay schedule, rate card, provider worker ref | PayProfile | `payroll:profiles:write` | confirm |
| (consumed) `timesheet.export` | F2 action ([EVE-138](<https://linear.app/resnovas/issue/EVE-138/f29-build-time-capture-and-timesheets>)): approved, locked timesheets per period as a versioned, idempotent batch | lines with worker, engagement type, Event, Phase, Department, hours, source refs | owned by F2 | owned by F2 |
| `payroll.allowance.add` | worker, event, kind, amount or quantity, reason | PayLine | `time:approve` | confirm |
| `payroll.period.open` | pay schedule, start, end | PayPeriod | `payroll:run` | confirm |
| `payroll.run.calculate` | period id | PayRun (draft) with lines and exceptions | `payroll:run` | none |
| `payroll.run.explainLine` | pay line id | Explanation (rule, rate, source entries) | `payroll:read` or own line | none |
| `payroll.run.lock` | run id | PayRun (locked) | `payroll:run` | always |
| `payroll.run.submitToProvider` | run id | ProviderSubmission | `payroll:submit` | always |
| `payroll.run.importResults` | submission id | PayRun (net figures, payslip refs) | `payroll:submit` | none |
| `payroll.selfBill.issue` | run id, freelancer ids | SelfBillInvoice\[\] | `payroll:run` | always |
| `payroll.payment.prepare` | run id | PaymentBatch (bank file or payment-port request) | `payroll:pay` | always |
| (event) `payroll:run_approved` | emitted on the change feed ([EVE-45](<https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change>)) when a run reaches completed (net results imported) | per cost dimension (Event, Phase, Department): gross, employer NI, employer pension, employee deductions (PAYE, employee NI, pension, student loan, other), net; freelancer self-bill totals separately; integer minor units plus currency | n/a | n/a (follows the always-approved lock and submit) |
| (event) `payroll:run_reversed` | emitted when a run is reversed | the correcting amounts in the same shape | n/a | n/a |
| `payroll.run.reverse` | run id, reason | PayRun (reversed) + correcting entries | `payroll:run` | always |
| `payroll.payslip.list` / `payroll.payslip.get` | worker? period? | Payslip\[\] / Payslip | own, or `payroll:read` | none |
| `payroll.report.labourCost` | event?, phase?, period?, group by | LabourCostReport | `payroll:read` or event budget read | none |

## 5. Data model

Tenant scope: every row carries `org_id`; tenant guards from [EVE-42](<https://linear.app/resnovas/issue/EVE-42>).

Referenced, not redefined: **Event**, **Phase**, **Department**, **TeamMember** (the person's role on an event), **RunOfShow** and **Itinerary** (F1, names fixed in [EVE-73](<https://linear.app/resnovas/issue/EVE-73>) section 5); **Shift**, **Assignment**, **Availability**, **TimeEntry** and **Timesheet** (F2, [EVE-67](<https://linear.app/resnovas/issue/EVE-67/f2-scheduling-and-rosters-crew-availability-shifts-offers-call-sheets>); F2 owns time capture and timesheet approval via [EVE-138](<https://linear.app/resnovas/issue/EVE-138/f29-build-time-capture-and-timesheets>) and records engagement type on each Assignment; scheduling base [EVE-33](<https://linear.app/resnovas/issue/EVE-33>)); **Worker**, **Engagement** (type, payBasis, individual rate, contractedHours, offPayrollStatus, versioned), **SensitiveProfile** (bank details, tax and NI ids, encrypted, <issue id="636f7592-553b-41f2-adb0-9a336d0188e3" label="EVE-116" href="https://linear.app/resnovas/issue/EVE-116/f132-build-the-sensitive-profile-with-field-masking-reveal-audit-and" />), the leave ledger and approved absence (<issue id="5ca54321-0f0a-461c-ade1-89cf3197dc48" label="EVE-179" href="https://linear.app/resnovas/issue/EVE-179/f137-build-leave-policies-the-leave-ledger-requests-and-absence" />) and the final-pay flag at offboarding (<issue id="576185f3-f438-43c7-b694-e5afff0605e7" label="EVE-153" href="https://linear.app/resnovas/issue/EVE-153/f134-build-onboarding-and-offboarding-runs" />), all F13 (<issue id="253839bc-c987-416b-92ea-206c9e9e8d2e" label="EVE-80" href="https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave" />). Rate precedence: an individual Engagement rate overrides the F12 rate card for that worker; the rate card supplies role and event rates, overtime and allowances. F12 calculates holiday pay from F13's approved leave, and a final-pay flag becomes a pay run exception; **Contact** and **Organisation** (F4, for agencies and freelancers trading as companies); **Account**, **Journal** and **Budget line** (F11).

Owned by F12:

| Entity | Key fields | Relations | Offline | Conflict rule |
| -- | -- | -- | -- | -- |
| PayRule | kind, params, effective range, version | used by RateCard | read-only offline | server wins; versioned, never edited in place once used |
| RateCard | role, grade, rates, currency, effective range | org or Event | read-only offline | server wins |
| PayProfile | pay schedule, rate card, provider worker ref (engagement type and status read from F13 Engagement) | Worker, Engagement | read-only offline | server wins |
| PayPeriod | schedule, start, end, status | PayRun | no | server only |
| PayRun | status (draft, locked, submitted, completed, reversed), totals, exceptions | PayLine\[\], ProviderSubmission | no (read cache only) | server only; locked runs are immutable, corrections are new lines in a later run |
| PayLine | kind, quantity, rate, amount, cost centre (Event, Phase, Department), source refs | PayRun, Worker, TeamMember? | read cache | server only |
| SelfBillInvoice | number, lines, tax treatment | PayRun, Worker, Organisation? | read cache | server only |
| Payslip | period, gross, deductions, net, document ref | Worker, PayRun | read cache, encrypted at rest on device | server only |
| ProviderSubmission | provider, request hash, status, response refs | PayRun | no | server only |

Money is integer minor units plus ISO currency; no floats. Embedded documents: payslip PDFs and self-bill invoices are files ([EVE-25](<https://linear.app/resnovas/issue/EVE-25>)); no collaborative text or canvas in this set.

## 6. Screens

All components from Rambo-UI. Every screen declares a screen-context projection and binds every control to an action ([EVE-50](<https://linear.app/resnovas/issue/EVE-50>)). Pay figures are masked in projections for viewers without `payroll:read`.

| Screen | Components | Projection | Controls to actions |
| -- | -- | -- | -- |
| Clock in and timesheets | owned by F2 (<issue id="522cf0df-8126-444d-8833-1e31bf21345e" label="EVE-138" href="https://linear.app/resnovas/issue/EVE-138/f29-build-time-capture-and-timesheets" />) | n/a | n/a |
| My pay | payslip list, payslip viewer | own payslips (no other workers) | `payroll.payslip.*` |
| Allowances | list and form on the pay run | allowances per worker and event | `payroll.allowance.add` |
| Pay rules and rate cards | form, versioned history | rules, effective dates | `payroll.payRule.upsert`, `payroll.rateCard.upsert` |
| Pay run | stepper (open, calculate, review exceptions, lock, submit, pay, post), exception list, line explainer drawer | run status, totals, exceptions, selected line | one action per step, `payroll.run.explainLine` |
| Labour cost | chart and table by event and phase against budget | report rows | `payroll.report.labourCost` |

## 7. Agent behaviour

* On request: draft timesheets from the roster, explain a pay line in plain words, prepare a pay run and summarise exceptions, answer "what did the load-out cost in crew pay".
* Proactively (behind the flag, as suggestions, never applied): flag a timesheet whose hours differ from the roster by more than a threshold, a missing clock-out, a worker past a working-time limit, a rate below the statutory minimum, a freelancer with no engagement status recorded, a run that differs from the last comparable run by more than a threshold.
* Always needs a human: locking a run, submitting to the provider, issuing self-bills, preparing payments, posting journals, reversing a run, changing a pay rule or rate card. Approval is the action policy `always`, not an agent prompt.
* The agent works under the invoking user's permissions only; an agent acting for a crew member sees that member's pay and nobody else's.

## 8. Integrations

Each behind a neutral Effect port in its own integration package; switching vendor changes composition only.

* `PayrollProvider` port: send approved gross inputs per worker, receive net pay, deductions, payslip documents and filing status. First adapter is decision D1.
* `PaymentRail` port: produce a bank payment file (UK Bacs Standard 18 or similar) or call a payment provider. Phase 1 is file export only.
* Accounting: F12 does not post journals. It emits `payroll:run_approved` and `payroll:run_reversed` on the change feed; F11 ([EVE-69](<https://linear.app/resnovas/issue/EVE-69>), posting rules [EVE-90](<https://linear.app/resnovas/issue/EVE-90>)) maps them to wages expense and control accounts and reconciles the net wages payment ([EVE-157](<https://linear.app/resnovas/issue/EVE-157>)). Agreed with the F11 spec 2026-11-01.
* Calendar and location: none new; clock-in location uses the device location permission only when the org turns it on.

## 9. Permissions and roles

| Role | Sees | Changes |
| -- | -- | -- |
| Worker | own time, timesheets, payslips, self-bills | own draft entries, submit |
| Crew chief | team time for their events | approve or reject, allowances |
| Organiser | labour cost for their events, timesheets for their events, no individual net pay or deductions | approve timesheets for their events |
| Payroll admin | everything in payroll for the org | rules, profiles, runs |
| Finance approver | runs, reports | lock, submit, pay, post (separate from the person who calculated when the org enables two-person approval) |
| Accountant (external) | reports and journals | nothing |
| Agency (external org) | its own workers' approved hours | nothing |

Bank details and tax or NI ids live only in F13's encrypted SensitiveProfile (<issue id="636f7592-553b-41f2-adb0-9a336d0188e3" label="EVE-116" href="https://linear.app/resnovas/issue/EVE-116/f132-build-the-sensitive-profile-with-field-masking-reveal-audit-and" />). F12 reads them when it builds a provider submission or a payment file and never stores them; they never appear in action payloads, telemetry or prompts.

## 10. Telemetry and flags

* Flag: `payroll` (default off), plus `payroll-agent-suggestions` (default off) and `payroll-clock-location` (default off).
* Events (time and timesheet events are F2's): `pay_run_calculated`, `pay_run_locked`, `pay_run_submitted`, `pay_run_exception_resolved`, `agent_payroll_suggestion_accepted`. No amounts, names or identifiers beyond pseudonymous ids.
* Success metric: median time from period end to submitted run, and share of runs with zero post-lock corrections (target 95 percent after three months of use).

## 11. Compliance

To validate per jurisdiction before launch; the UK is the first target market (assumed from Resnovas being UK-based).

* Tax filing: PAYE RTI is filed only by HMRC-recognised software (D1). Eventiva keeps the audit trail of inputs it sends.
* Worker status: off-payroll working rules (IR35) for freelancers; Eventiva records the status determination and who made it, it does not decide it.
* Minimum wage and working time: check effective hourly pay against the statutory minimum for the worker's age band, and working-time limits and rest breaks; warn, never block silently.
* Holiday pay for irregular-hours and part-year workers: accrual rule as a PayRule kind; the rule values come from current guidance at build time, not from this spec.
* Pensions auto-enrolment: handled by the provider in D1 option A; Eventiva passes pensionable pay.
* Record keeping: pay records kept at least 3 years after the tax year (UK), configurable longer; locked runs immutable.
* Personal data: payroll data is special handling under UK GDPR; least-privilege access, encryption at rest, retention schedule, masking in screen projections and replay.
* Self-billing: needs a written self-billing agreement per freelancer stored as a file before the first self-bill.

## 12. Acceptance

* Approved timesheets from F2's `timesheet.export` (offline clock-ins included) are paid once: re-importing the same batch version adds no lines.
* A 30-minute late finish approved in F2 gets a late-finish allowance in F12 and shows on the pay line explanation.
* A pay run for 50 workers across two events calculates gross pay matching a hand-checked fixture to the penny, with overtime, a day rate, a fixed fee and an allowance.
* Every pay line explains itself back to the rule, rate and time entries it came from, through the UI and through the agent with the same answer.
* Locking, submitting and paying each need an explicit human approval; the agent's attempt without one fails with a typed error and an audit entry.
* Labour cost per event and phase reconciles to the run total, and one `payroll:run_approved` event per run carries the same totals to F11.
* An organiser cannot read an individual's net pay; a worker cannot read another worker's payslip, on every interface (UI, HTTP, MCP, ACP).
* Reversing a locked run creates correcting lines in the next run and leaves the locked run unchanged.

## 13. Out of scope

Filing tax returns directly with HMRC or another authority (unless D1 changes); payroll outside the UK in the first release (the model is currency and jurisdiction aware so others plug in later); expenses and reimbursement claims (F11); recruitment, contracts and leave requests (F13); benefits administration; tips and tronc schemes; on-demand or early wage access.

## 14. Dependencies

* Phase 1: [EVE-40](<https://linear.app/resnovas/issue/EVE-40>) actions, [EVE-41](<https://linear.app/resnovas/issue/EVE-41>) config and secrets (provider credentials), [EVE-42](<https://linear.app/resnovas/issue/EVE-42>) storage, state machines and tenant guards, [EVE-43](<https://linear.app/resnovas/issue/EVE-43>) identity, roles and audit, [EVE-44](<https://linear.app/resnovas/issue/EVE-44>) telemetry and flags, [EVE-45](<https://linear.app/resnovas/issue/EVE-45>) change feed, [EVE-46](<https://linear.app/resnovas/issue/EVE-46>) HTTP API, [EVE-50](<https://linear.app/resnovas/issue/EVE-50>) screen awareness, [EVE-51](<https://linear.app/resnovas/issue/EVE-51>) record sync, [EVE-52](<https://linear.app/resnovas/issue/EVE-52>) and [EVE-54](<https://linear.app/resnovas/issue/EVE-54>) agent loop and durable runs.
* Port later: [EVE-24](<https://linear.app/resnovas/issue/EVE-24>) notifications (payslip ready, timesheet reminders), [EVE-25](<https://linear.app/resnovas/issue/EVE-25>) files (payslips, self-bills, agreements), [EVE-28](<https://linear.app/resnovas/issue/EVE-28>) localisation, [EVE-33](<https://linear.app/resnovas/issue/EVE-33>) scheduling.
* Feature sets: F1 events ([EVE-73](<https://linear.app/resnovas/issue/EVE-73>): cost centres Event, Phase and Department; TeamMember role drives the rate card), F2 rosters (shifts), F11 accounting (journals, budgets), F13 HR (worker records, leave, right to work), F4 contacts (agencies).

## 15. Decisions for Jonathan

Each has a recommendation; the first is on the decision card in the payroll thread, the rest are proposed defaults that stand unless he flips them.

* **D1 Who calculates net pay and files tax.** A: Eventiva calculates gross, a recognised payroll provider calculates net and files, behind the `PayrollProvider` port (recommended). B: build an HMRC-recognised engine in Eventiva. C: export only, no provider connection.
* **D2 First jurisdiction.** UK only (recommended), with currency and jurisdiction fields from day one; or UK plus one more.
* **D3 Freelancer pay.** Self-billed invoices generated by Eventiva (recommended); or freelancers upload their own invoices only.
* **D4 Two-person approval.** Off by default and an org setting (recommended); or always on.
* **D5 Clock-in location.** Org opt-in, captured only at clock in and out, never tracked between (recommended); or no location at all.

## 16. Child issues (build order)

1. [EVE-82](<https://linear.app/resnovas/issue/EVE-82/f121-build-pay-rules-rate-cards-and-pay-profiles>) F12.1 Pay rules, rate cards and pay profiles
2. <issue id="e08704c6-b901-4fc2-8753-73aaf09f694f" label="EVE-83" href="https://linear.app/resnovas/issue/EVE-83/f122-build-time-capture-clock-in-and-out-and-time-entries-offline" /> and <issue id="6d951ef7-861e-43b3-aaa8-3f2ba0d53f56" label="EVE-85" href="https://linear.app/resnovas/issue/EVE-85/f123-build-timesheets-draft-from-roster-submit-and-approve" /> (old F12.2 time capture and F12.3 timesheets) closed as duplicates of F2's <issue id="522cf0df-8126-444d-8833-1e31bf21345e" label="EVE-138" href="https://linear.app/resnovas/issue/EVE-138/f29-build-time-capture-and-timesheets" />, which owns time capture and timesheets; payroll needs listed there.
3. [EVE-87](<https://linear.app/resnovas/issue/EVE-87/f124-build-pay-run-calculation-on-durable-runs>) F12.4 Pay run calculation and allowances (after F12.1 and [EVE-138](<https://linear.app/resnovas/issue/EVE-138/f29-build-time-capture-and-timesheets>))
4. [EVE-88](<https://linear.app/resnovas/issue/EVE-88/f125-build-the-payroll-provider-port-and-the-first-adapter>) F12.5 Payroll provider port and first adapter (after F12.4)
5. [EVE-92](<https://linear.app/resnovas/issue/EVE-92/f126-build-freelancer-self-billing-and-worker-status-records>) F12.6 Freelancer self-billing and worker status records (after F12.4)
6. [EVE-96](<https://linear.app/resnovas/issue/EVE-96/f127-build-the-payments-file-and-journal-posting-to-accounting>) F12.7 Payments file and pay run events for accounting (after F12.5, F12.6)
7. [EVE-101](<https://linear.app/resnovas/issue/EVE-101/f128-build-labour-cost-reporting-per-event-and-phase>) F12.8 Labour cost reporting per event and phase (after F12.4)
8. [EVE-104](<https://linear.app/resnovas/issue/EVE-104/f129-build-the-payroll-agent-explanations-anomaly-suggestions-and>) F12.9 Payroll agent: explanations, anomaly suggestions and approval gates (after F12.7, F12.8)

## Linear comments (1)

### Comment 520911f5-3094-45c2-a3ac-05a788700a2d

Author: GitHub. Created: 2026-11-01T13:05:29.504Z; updated: 2026-11-01T13:05:29.467Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/828). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
