<!-- linear:generated:start -->
# EVE-74: F11.1 Build the ledger port, chart of accounts, journals and periods

[Live Linear source](https://linear.app/resnovas/issue/EVE-74/f111-build-the-ledger-port-chart-of-accounts-journals-and-periods) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:30.982Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-69](EVE-69.md) |
| Children | None recorded |
| Blocked by | [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md) |
| Blocks | [EVE-90](EVE-90.md), [EVE-125](EVE-125.md), [EVE-126](EVE-126.md), [EVE-127](EVE-127.md), [EVE-157](EVE-157.md), [EVE-158](EVE-158.md), [EVE-159](EVE-159.md), [EVE-160](EVE-160.md) |
| Related to | None recorded |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Eventiva has a double-entry ledger that rejects any unbalanced or back-dated posting, behind a neutral `LedgerPort`, so every later F11 slice posts the same way.

## Context

* Parent <issue id="158ba369-976e-47ea-9f86-a8df608cb4d0" label="EVE-69" href="https://linear.app/resnovas/issue/EVE-69/f11-accounting-ledgers-invoices-bills-event-budgets-and-tax" /> sections 4, 5 and 8. House reference `.agents/skills/coding-preferences/references/accounting.md`: local role defaults to Blnk, online role to a hosted finance platform; durable money data stays 100 percent compatible with the online target.
* Ledger engine choice is decision D1 on <issue id="158ba369-976e-47ea-9f86-a8df608cb4d0" label="EVE-69" href="https://linear.app/resnovas/issue/EVE-69/f11-accounting-ledgers-invoices-bills-event-budgets-and-tax" />, decided 2026-11-08 by Jonathan: option (b), Eventiva's own ledger in Postgres through Drizzle, behind `LedgerPort`. This overrides the house default of Blnk for the local role; the house migration-compatibility rule still applies, so balance, transaction and reference shapes follow the online finance platform's contract.

## Scope

1. Package `accounting` (extension) plus `accounting-ledger-postgres` (the ledger adapter, tables through the <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> storage layer). Effect Schema types: `Money` (bigint minor units, ISO-4217 currency, precision), `Account`, `Journal`, `JournalLine`, `Period`.
2. `LedgerPort` as a `Context.Tag`: create ledger, create balance, post transaction set (atomic, all lines or none), reverse, read balance at date, list transactions, export history. Typed errors: `UnbalancedJournal`, `PeriodLocked`, `CurrencyMismatch`, `LedgerUnavailable`.
3. Postgres ledger adapter: append-only transactions table, balances updated in the same database transaction as postings, row locking or optimistic versioning on balances so concurrent postings never lose an update, and inflight holds (reserve, commit, void). Plus an in-memory adapter for tests; both pass one shared conformance suite. The ledger is server-only and never syncs to SQLite on devices.
4. Actions: `accounting.account.*`, `accounting.journal.draft` / `post` / `reverse`, `accounting.period.*` (open and lock only; close is F11.9), `accounting.fx.rate.get` / `set` with manual rates.
5. A default UK chart of accounts seeded on tenant setup, editable.
6. Screens: Chart of accounts and Journals, each with its screen-context projection and every control bound to an action.

## Acceptance criteria

* Conformance suite green on both adapters: unbalanced journal rejected; posting into a locked period rejected; reversal nets to zero; balance at date correct across 1,000 random postings (property test).
* Posted journals are not editable through UI, HTTP, MCP or ACP (test per surface through the inventory).
* Amounts round-trip through the adapter with no precision loss for GBP, JPY (0 decimals) and BHD (3 decimals).
* Concurrency: 10,000 postings to the same balance from two runners give the exact expected balance (no lost update).
* Parity check and unbound-control check pass for the new actions and screens.

## Constraints

Effect-TS v3; no zod; any FX rate vendor is a new dependency and needs Jonathan's approval on this issue first; feature flag `f11-accounting` default off; telemetry never records amounts or names; ship to main per the AGENTS.md delivery exception with `node --run check` results pasted here.

## Done signal

Merged to main with the conformance suite green on both adapters, and a comment here listing the public API and the ledger table schema.

## Linear comments (1)

### Comment a2441ddf-1c13-41dd-ae60-faed7ceea05e

Author: GitHub. Created: 2026-11-01T13:06:49.180Z; updated: 2026-11-01T13:06:48.860Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-74/f111-build-the-ledger-port-chart-of-accounts-journals-and-periods) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/841). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
