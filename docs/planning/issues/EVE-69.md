<!-- linear:generated:start -->
# EVE-69: F11 Accounting: ledgers, invoices, bills, event budgets and tax

[Live Linear source](https://linear.app/resnovas/issue/EVE-69/f11-accounting-ledgers-invoices-bills-event-budgets-and-tax) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:56:49.053Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 3: Medium |
| Labels | Decision: Audit needed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | None recorded |
| Children | [EVE-74](EVE-74.md), [EVE-90](EVE-90.md), [EVE-125](EVE-125.md), [EVE-126](EVE-126.md), [EVE-127](EVE-127.md), [EVE-157](EVE-157.md), [EVE-158](EVE-158.md), [EVE-159](EVE-159.md), [EVE-160](EVE-160.md) |
| Blocked by | None recorded |
| Blocks | [EVE-187](EVE-187.md), [EVE-190](EVE-190.md) |
| Related to | [EVE-17](EVE-17.md), [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-26](EVE-26.md), [EVE-27](EVE-27.md), [EVE-28](EVE-28.md), [EVE-30](EVE-30.md), [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-45](EVE-45.md), [EVE-46](EVE-46.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-52](EVE-52.md), [EVE-53](EVE-53.md), [EVE-61](EVE-61.md), [EVE-63](EVE-63.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-73](EVE-73.md), [EVE-96](EVE-96.md), [EVE-99](EVE-99.md), [EVE-105](EVE-105.md), [EVE-107](EVE-107.md), [EVE-170](EVE-170.md), [EVE-222](EVE-222.md), [EVE-225](EVE-225.md), [EVE-237](EVE-237.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Proposed (2026-11-01). Planning only; no code, dependency or vendor sign-up until Jonathan approves the decisions in section 15. Follows the [Feature set spec template](<https://linear.app/resnovas/document/feature-set-spec-template-and-list-26b9f78cf17a>).

## 1. Goal

An event business keeps its books in Eventiva: every sale, purchase, payment, wage and stock movement lands in one double-entry ledger, tagged to the event it belongs to, so the owner sees real profit per event and files tax without a second accounting package.

## 2. Users and jobs

| User | Jobs |
| -- | -- |
| Owner or director | See profit per event and for the business; approve budgets; sign off tax returns |
| Finance admin or bookkeeper | Keep the chart of accounts; issue invoices; enter and approve bills; reconcile the bank; close periods; prepare VAT returns |
| Event manager (F1 owner) | Set and watch the budget for their events; see actuals against budget by F1 Phase; raise purchase requests |
| Budget holder or approver | Approve bills and expense claims inside their limit |
| Crew and staff | Submit expense claims with receipts from the phone, offline; see claim status |
| External accountant | Read the books, run reports, export for year-end, post adjusting journals when granted |
| Customer (client, promoter, venue hirer) | Receive, view and pay invoices; download statements |
| Supplier or vendor (F5) | Receive remittance advice for bills paid (portal access is out of scope here) |
| Agent | Code transactions, match bank lines, draft invoices from F1 and F9 records, chase overdue invoices, flag budget overruns, prepare returns for approval |

## 3. Market check

Names stay out of customer-facing copy.

| Tool | What it does well | Where Eventiva matches or differs |
| -- | -- | -- |
| Xero | Bank feeds with suggested matches and bank rules; invoices and bills with online payment; UK MTD VAT filing; per-event reporting only through tracking categories (two active categories) or the separate Projects add-on | Match: bank feeds, rules, suggested matches, MTD. Differ: the F1 Event is a first-class dimension on every journal line, not a limited tag, and budgets attach to F1 Phases |
| QuickBooks Online | Bank rules, receipt capture, Projects for job profitability, classes and locations as dimensions on higher tiers | Match: receipt capture, job costing. Differ: dimensions on every plan, offline drafts on mobile, agent does the coding and matching under approval |
| Odoo Accounting | Full ledger integrated with sales, purchase and inventory; analytic accounts and analytic distribution; budgets; reconciliation models; bill OCR | Match: one ledger fed by every module (the Odoo reference doc in `docs/learnings/odoo-extensions-reference.md` asks for this depth). Differ: one Party model (F4, <issue id="ad791a38-f528-4aec-9433-c36977bbe8e2" label="EVE-65" href="https://linear.app/resnovas/issue/EVE-65/f4-contacts-and-crm-people-organisations-relationships-and-history" />) instead of duplicated partner models; typed Effect actions; agent parity |
| Event and rental tools (Current RMS, Rentman) | Quote and invoice jobs, then push invoices to Xero or QuickBooks | Differ: Eventiva keeps the ledger itself, and offers export to an external package as a port, not as the only path |

Market sources were checked on 2026-11-01 from vendor docs and product-idea forums; tier details change often and are re-checked when each slice starts.

## 4. Capabilities as actions

Every operation is an inventory action (<issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />) with Effect Schema input and output, typed errors, one permission check (<issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />) and an audit row. Permission names use colons. Approval: none, confirm (the person confirms on screen) or always (a second person with the approve permission).

| Action | Input | Output | Permission | Approval |
| -- | -- | -- | -- | -- |
| `accounting.account.list` | filters | accounts | `accounting:read` | none |
| `accounting.account.create` / `update` / `archive` | account code, name, type, tax default | account | `accounting:coa:manage` | confirm |
| `accounting.journal.draft` | date, lines (account, dimensions, debit or credit in minor units, currency), memo | draft journal | `accounting:journal:write` | none |
| `accounting.journal.post` | draft id | posted journal, ledger transaction ids | `accounting:journal:post` | confirm; always when an agent posts |
| `accounting.journal.reverse` | posted id, date, reason | reversing journal | `accounting:journal:post` | always |
| `accounting.dimension.list` / `create` | dimension (event, phase, department, custom) | dimension | `accounting:coa:manage` | none |
| `accounting.budget.draft` / `update` | F1 Event id, F1 Phase ids, lines per account | budget | `accounting:budget:write` | none |
| `accounting.budget.approve` | budget id, version | approved budget | `accounting:budget:approve` | always |
| `accounting.budget.variance` | event id, as-of date | budget vs actual vs committed | `accounting:budget:read` | none |
| `accounting.invoice.draft` / `update` | customer (F4 Party), lines, tax codes, due terms, source refs (F1 Event, F9 Order) | draft invoice | `accounting:invoice:write` | none |
| `accounting.invoice.issue` | draft id | issued invoice with final number, PDF file id | `accounting:invoice:issue` | confirm |
| `accounting.invoice.send` | invoice id, channel | delivery receipt | `accounting:invoice:issue` | confirm |
| `accounting.invoice.void` / `creditNote.issue` | invoice id, lines, reason | credit note | `accounting:invoice:issue` | always |
| `accounting.invoice.remind` | invoice id, template | reminder sent | `accounting:invoice:issue` | confirm (agent: always unless a standing rule exists) |
| `accounting.bill.draft` / `update` | supplier, lines, attachment ids | draft bill | `accounting:bill:write` | none |
| `accounting.bill.extract` | attachment id | proposed bill fields with confidence | `accounting:bill:write` | none (read-only proposal) |
| `accounting.bill.approve` | bill id | approved bill | `accounting:bill:approve` (limit by amount) | always |
| `accounting.expense.submit` | receipt attachment, amount, category, event | expense claim | `accounting:expense:submit` (own) | none |
| `accounting.expense.approve` / `reject` | claim id, reason | claim | `accounting:expense:approve` | always |
| `accounting.payment.record` | document ids, amount, date, bank account | payment, allocations | `accounting:payment:write` | confirm |
| `accounting.payment.batch.prepare` | bill ids | payment batch file (for upload to the bank) | `accounting:payment:write` | always |
| `accounting.bank.connect` / `disconnect` | bank account, provider consent | feed connection | `accounting:bank:manage` | always |
| `accounting.bank.import` | statement file (CSV, OFX, CAMT.053) | statement lines | `accounting:bank:write` | none |
| `accounting.bank.match.suggest` | statement line ids | ranked matches with reasons | `accounting:bank:read` | none |
| `accounting.bank.match.accept` / `reject` | line id, match | reconciliation | `accounting:bank:write` | confirm (agent: always unless rule) |
| `accounting.bank.rule.create` / `update` | conditions, account, dimensions, tax | rule | `accounting:bank:write` | confirm |
| `accounting.tax.code.list` / `create` | rate, scheme, effective dates | tax code | `accounting:tax:manage` | confirm |
| `accounting.tax.return.prepare` | period | draft return with box values and drill-down | `accounting:tax:read` | none |
| `accounting.tax.return.submit` | return id, declaration | submission receipt | `accounting:tax:submit` | always, by a person only (agents cannot hold this permission) |
| `accounting.period.close` / `reopen` | period, lock date | period state | `accounting:period:manage` | always |
| `accounting.fx.rate.get` / `set` | currency pair, date | rate | `accounting:read` / `accounting:coa:manage` | none / confirm |
| `accounting.report.run` | report kind (trial balance, P and L, balance sheet, cash flow, aged receivables, aged payables, event P and L, VAT detail), filters | report rows | `accounting:report:read` | none |
| `accounting.export.run` | format (CSV journal, accountant pack, ledger replay file) | file id | `accounting:export` | confirm |
| `accounting.postingRule.list` / `update` | source type (F8, F9, F6, F12), mapping to accounts | rule | `accounting:coa:manage` | always |

Navigation actions for each screen come from <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" /> (`nav.open` with the screen id) and are not repeated here.

## 5. Data model

Tenant scope: every table carries the tenant id and passes the <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> guard. Money is always an integer amount in minor units plus an ISO-4217 currency and precision, so it round-trips with the ledger port without loss (house accounting rule).

| Entity | Key fields and relations | Offline | Conflict rule |
| -- | -- | -- | -- |
| Account | code, name, type (asset, liability, equity, income, expense), parent, default tax code, ledger ref | read cached | server wins; edits online only |
| Dimension and DimensionValue | kind (event, event series, phase, department, custom), value refs F1 Event, EventSeries, Phase and Department by id | read cached | server wins |
| Journal and JournalLine | date, status (draft, posted, reversed), source ref, lines with account, dimension values, debit, credit, currency, FX rate, base amount | drafts sync; posting online | drafts: field last-writer-wins, lines keyed by line id; posted journals immutable, changed only by reversal |
| LedgerTransaction | external ledger ref (1:1 with the ledger port), journal line id, balance ids | server only | append only |
| Budget and BudgetLine | F1 Event id, version, status, lines per account and F1 Phase, amount | full offline edit | lines field last-writer-wins; approval is a server state transition ([EVE-42](<https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state>) state machine); approved versions immutable |
| Invoice, CreditNote, DocumentLine | F4 Party as customer, number (assigned on issue), status (draft, issued, part paid, paid, void), lines, tax lines, source refs (F1 Event, F8 order, F9 Order), PDF file id | drafts offline; issue online | drafts field LWW; number and status set only by the server |
| Bill, ExpenseClaim | F4 Party as supplier or F13 staff member as claimant, attachment ids ([EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>)), lines, approval trail | drafts and claims offline with photo | same as invoices; approval server-side |
| Payment and Allocation | amount, date, bank account, allocations to documents | online | server only |
| BankAccount, BankFeedConnection, StatementLine, Reconciliation, BankRule | feed provider ref (secret in [EVE-41](<https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials>) credentials), line amount, description, match | read cached | server only |
| TaxCode, TaxReturn, Submission | rate, scheme, effective from and to; return boxes; submission receipt and correlation id | read cached | server only; submissions immutable |
| Period | start, end, state (open, closed, locked) | read cached | server only |
| PostingRule | source type, conditions, accounts, dimensions | read cached | server only; versioned |

Documents embedded in records (<issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />): an invoice or bill can carry a rich-text note (Yjs text) that syncs with the record and is locked when the document is issued or approved. No canvas documents in F11.

F11 does not redefine F1 entities (names fixed in [EVE-73](<https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show>) section 5). It references F1 Event (anchor), EventSeries, Phase and Department by id as dimension values, F1 EquipmentRequirement for committed equipment cost alongside F6 purchase orders, and F4 Party for customers and suppliers.

## 6. Screens

Every control binds to an action above; every screen declares an Effect Schema screen-context projection (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />) filtered by the viewer's permissions. Components come from Rambo-UI.

| Screen | Rambo-UI components | Screen-context projection | Actions behind controls |
| -- | -- | -- | -- |
| Finance home | stat tiles, list, chart | cash per bank account, overdue receivables total, bills to approve, unreconciled line count | `report.run`, `nav.open` |
| Event finance tab (inside the F1 Event screen) | table, progress bar, chart | budget, actual, committed and variance per F1 Phase; selected line | `budget.variance`, `budget.update`, `invoice.draft` |
| Budget editor | editable grid | budget version, lines, selection, unsaved changes | `budget.draft`, `budget.update`, `budget.approve` |
| Invoices list and invoice editor | table, form, line editor, PDF preview | filter, selected invoice, its lines, status | `invoice.*`, `creditNote.issue`, `payment.record` |
| Bills list and bill editor | table, form, file viewer | selected bill, extracted fields with confidence | `bill.*`, `bill.extract` |
| Expense capture (mobile first) | camera, form, list | draft claim, receipt thumbnail, sync state | `expense.submit` |
| Approvals inbox | list, detail, approve and reject buttons | pending items for the viewer with limits | `bill.approve`, `expense.approve`, `budget.approve` |
| Bank reconciliation | split view of statement lines and matches | selected line, suggested matches with reasons | `bank.match.*`, `bank.rule.create`, `bank.import` |
| Chart of accounts | tree table | accounts, selection | `account.*` |
| Journals | table, journal form | selected journal and lines | `journal.*` |
| Tax returns | form with box drill-down | return boxes, period, status | `tax.return.prepare`, `tax.return.submit` |
| Reports | report viewer, filters, export button | report kind, filters, visible rows | `report.run`, `export.run` |
| Settings: periods, tax codes, posting rules, bank connections | forms | current settings | `period.*`, `tax.code.*`, `postingRule.*`, `bank.connect` |
| Customer invoice view (external link) | document view, pay button | the one invoice the link grants | `invoice.view` (token scoped), F9 payment action |

## 7. Agent behaviour

* Proactive, as suggestions in the finance home and approvals inbox: suggest bank matches and rules; draft bills from emailed or uploaded receipts (`bill.extract`); flag an F1 Event whose committed plus actual cost passes a set share of budget; list invoices due for reminders; flag journals that break the period lock or post to unusual accounts.
* When asked: draft invoices from an F1 Event or F9 orders, explain any report figure by drilling to journal lines, prepare the VAT return and explain each box, compare events.
* Always needs approval: posting, reversing, approving bills and claims, payments and payment batches, period close, posting rule changes, bank connect. Reminders and match acceptance need approval unless the finance admin sets a standing rule with limits (amount, customer, confidence).
* Never: submit a tax return (person only), change tax codes without confirm, see bank credentials. Offline, the agent can draft and code locally but cannot post, issue numbers, match against fresh bank data or submit; it says so instead of pretending.

## 8. Integrations (each behind a neutral port)

| Port | Purpose | Candidate (house rule: role split, not brand lock) |
| -- | -- | -- |
| `LedgerPort` | Balances, double-entry transactions, inflight holds, history replay | Local role: Eventiva's own ledger in Postgres through Drizzle (D1 decided 2026-11-08). Online role: the hosted finance platform the house names, Airwallex, or Blnk Cloud, evaluated later. Durable shapes follow the online target contract (house migration rule) |
| `BankFeedPort` | Read statement lines from a connected bank account | Open banking aggregator chosen in F11.6 (<issue id="2c2a9287-a031-45ab-9b4c-b32a11def2b5" label="EVE-157" href="https://linear.app/resnovas/issue/EVE-157/f116-build-bank-import-feeds-matching-and-reconciliation" />) with approval; file import (CSV, OFX, CAMT.053) needs no vendor |
| `TaxFilingPort` | Submit VAT returns and fetch obligations | UK HMRC MTD VAT API first (decision D2) |
| `FxRatePort` | Daily exchange rates | Chosen in F11.1 with approval; manual rates work without a vendor |
| `DocumentExtractPort` | Read fields from receipts and bills | The Eventiva agent on the user's model engine ([EVE-53](<https://linear.app/resnovas/issue/EVE-53/p18b-build-model-engines-model-selection-and-user-owned-subscriptions>)); no separate OCR vendor |
| `AccountingExportPort` | Export to or sync with an external accounting package | CSV and accountant pack first; package sync adapters later on demand |
| Files, email, PDFs | Attachments, sending invoices | [EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>) (files), [EVE-24](<https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email>) (email) |
| Payments | Card and online payments for invoices | Owned by F9; F11 consumes F9 payment events |

## 9. Permissions and roles

Default role bundles (tenant admins can edit them):

* Finance admin: all `accounting:*` except `accounting:tax:submit`, which is granted by name to a person.
* Bookkeeper: read, journal write, invoice write and issue, bill write, bank write, payment write; no approve, no period manage.
* Approver: `accounting:bill:approve` and `accounting:expense:approve` with an amount limit; read of their cost centres.
* Event manager: `accounting:budget:read` and `budget:write` for the F1 Events they manage; read their event P and L; no ledger-wide read.
* Crew and staff: `accounting:expense:submit` for their own claims only.
* External accountant: read, report, export; journal post when granted; time-limited membership.
* Customer: token link to one invoice or a statement for their F4 Party; no app membership required.
* Agent: never more than the person it acts for ([EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>)); `accounting:tax:submit` cannot be delegated to an agent.

Segregation of duties: the same principal cannot draft and approve the same bill or claim; enforced in the action, not the UI.

## 10. Telemetry and flags

* Feature flag `f11-accounting` (default off in code), plus `f11-bank-feeds` and `f11-mtd-submit` for the vendor-backed slices.
* PostHog events: `invoice issued`, `invoice paid`, `bill approved`, `expense submitted`, `bank match accepted` (property: suggested by agent, rule or person), `period closed`, `vat return submitted`, `budget overrun flagged`.
* Spans on every action (<issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" />); amounts, names and bank descriptions are never span attributes.
* Success metric: share of bank lines reconciled without manual coding (target 70 percent after 3 months of use); secondary: days from period end to close.

## 11. Compliance

* UK VAT: invoice content rules, VAT records kept for 6 years, MTD for VAT digital records and digital links (no copy-paste between systems), submission only through recognised software. MTD for Income Tax (from April 2026 for sole traders and landlords over the threshold) is out of scope for this set and noted as a later jurisdiction slice.
* Immutability: posted journals and issued invoices are never edited or deleted; corrections by reversal or credit note; full audit trail ([EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>)).
* Gapless invoice numbering per sequence, assigned by the server on issue.
* Personal data (UK GDPR): invoices and claims hold names and addresses; F11 declares a legal hold on the F4 Party ids its records reference, so F4 erasure (<issue id="4b6f8805-b1b2-40f7-99e9-089c9adb8002" label="EVE-105" href="https://linear.app/resnovas/issue/EVE-105/f48-record-consent-and-fulfil-privacy-requests-for-contacts" />) keeps them as tombstones for the retention period; the retention rule wins over erasure and the person is told. F11 registers as a PartyReferenceOwner (<issue id="7692d04c-3444-4989-b2aa-b73a1a69ab02" label="EVE-99" href="https://linear.app/resnovas/issue/EVE-99/f44-find-and-merge-duplicate-contacts-and-import-and-export-them" />) so F4 merges rewrite invoice, bill and claim references.
* Bank data: open banking consent and re-consent handled by the provider; credentials stored only in [EVE-41](<https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials>) secrets.
* No card data in F11 (F9 holds payment flows through its provider).
* Watch list: UK e-invoicing consultation and the EU ViDA e-invoicing rules; the invoice model keeps the fields needed for structured e-invoices.

## 12. Acceptance (set as a whole)

* A sample tenant runs one F1 Event end to end: budget approved, tickets (F8) and orders (F9) post revenue, a supplier bill and a crew expense post costs, the bank statement reconciles, and the event P and L shows budget vs actual by F1 Phase.
* The trial balance always balances; a test proves an unbalanced journal is rejected with a typed error.
* Posted journals cannot be updated through any surface (UI, HTTP, MCP, ACP); only reversal works.
* A VAT return for the sample period matches a hand-computed figure and submits to the HMRC sandbox.
* Every F11 action passes the parity check ([EVE-40](<https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema>)) and every F11 screen passes the unbound-control check ([EVE-50](<https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen>)).
* Offline: a crew member submits a claim with a photo on a phone in airplane mode; it syncs and enters the approvals inbox after reconnect.
* A ledger replay export from the local ledger imports into an empty ledger with identical balances (migration rule).

## 13. Out of scope

Payroll calculation (F12 posts a payroll journal into F11); payment collection flows and the storefront (F9); stock valuation methods beyond posting the values F6 sends; fixed asset depreciation schedules, consolidation of several companies, and multi-jurisdiction tax beyond UK VAT (each a later slice once asked for); MTD for Income Tax; lending, wallets for end customers and money transmission.

## 14. Dependencies

* Phase 1: [EVE-40](<https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema>) (actions), [EVE-41](<https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials>) (secrets for bank and tax credentials), [EVE-42](<https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state>) (storage, state machines, tenant guard), [EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>) (permissions, approvals, audit), [EVE-44](<https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor>) (telemetry), [EVE-45](<https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change>) (domain events that F8, F9, F6 and F12 emit for posting), [EVE-46](<https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action>) (HTTP for the customer invoice link), [EVE-50](<https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen>) (screen awareness), [EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>) (record sync and rich text), [EVE-52](<https://linear.app/resnovas/issue/EVE-52/p18a-build-the-agent-turn-loop-with-actions-as-tools>) and [EVE-53](<https://linear.app/resnovas/issue/EVE-53/p18b-build-model-engines-model-selection-and-user-owned-subscriptions>) (agent for extraction and suggestions), [EVE-17](<https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and>) (sync engine choice).
* Port later: [EVE-24](<https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email>) (email for invoices and reminders), [EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>) (files and PDFs), [EVE-26](<https://linear.app/resnovas/issue/EVE-26/port-search-and-embeddings-across-every-resource>) (search), [EVE-27](<https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource>) (comments on documents), [EVE-28](<https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent>) (currency and date formatting), [EVE-30](<https://linear.app/resnovas/issue/EVE-30/port-data-widgets-saved-dashboards-and-brand-kits>) (dashboards for finance home).
* Feature sets: F1 (Event, EventSeries, Phase, Department as dimensions; <issue id="fbcff205-decd-464a-b8ab-a1278e71fbe4" label="EVE-73" href="https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show" />), F4 (Contact for customers and suppliers), F6 (stock movements), F8 and F9 (sales and payments), F12 (payroll journals), F13 (staff for expense claims), F14 (custom fields on accounting documents).

## 15. Decisions for Jonathan

Each is pick-one with a recommendation. D1 is on the decision card in the Spec accounting thread; D2 to D4 take the recommendation unless Jonathan flips them.

* D1 Ledger engine: DECIDED 2026-11-08 by Jonathan (decision card): (b) build the double-entry ledger directly in Eventiva's Postgres tables behind the same `LedgerPort`, with shapes compatible with the online target for later migration. This overrides, for Eventiva, the house accounting default that the local role is Blnk; the house migration-compatibility rule still applies. Blnk is not a dependency.
* D2 First tax jurisdiction: (a) UK VAT with MTD submission (recommended); (b) UK VAT returns prepared but filed elsewhere; (c) no tax filing, exports only.
* D3 Bank data: (a) statement file import first, open banking feeds in a later flagged slice (recommended, no vendor needed to start); (b) open banking feeds from the start.
* D4 Receipt and bill extraction: (a) the Eventiva agent on the user's model engine (recommended, no new vendor); (b) a dedicated OCR vendor.

## 16. Child issues (build order)

1. <issue id="f12d2c25-0d77-425f-b610-f66d2ad99b32" label="EVE-74" href="https://linear.app/resnovas/issue/EVE-74/f111-build-the-ledger-port-chart-of-accounts-journals-and-periods" /> F11.1 Ledger port, chart of accounts, journals and periods
2. <issue id="0a4ea4c5-5ab9-4f19-acf4-0b5e66767a62" label="EVE-90" href="https://linear.app/resnovas/issue/EVE-90/f112-build-posting-rules-that-turn-sales-stock-and-payroll-events-into" /> F11.2 Posting rules that turn F8, F9, F6 and F12 events into journals
3. <issue id="bb0fc1e6-2d90-42eb-82f3-c4cfd19fa8d2" label="EVE-125" href="https://linear.app/resnovas/issue/EVE-125/f113-build-event-dimensions-budgets-and-budget-vs-actual" /> F11.3 Event dimensions, budgets and budget vs actual
4. <issue id="2ef1ed05-1c6a-4b1b-9b1c-04331398cac8" label="EVE-126" href="https://linear.app/resnovas/issue/EVE-126/f114-build-sales-invoices-credit-notes-and-receivables" /> F11.4 Sales invoices, credit notes and receivables
5. <issue id="f54c7eef-282e-4d45-9947-c4ce159e0066" label="EVE-127" href="https://linear.app/resnovas/issue/EVE-127/f115-build-bills-expense-claims-approvals-and-payables" /> F11.5 Bills, expense claims, approvals and payables
6. <issue id="2c2a9287-a031-45ab-9b4c-b32a11def2b5" label="EVE-157" href="https://linear.app/resnovas/issue/EVE-157/f116-build-bank-import-feeds-matching-and-reconciliation" /> F11.6 Bank import, feeds, matching and reconciliation
7. <issue id="2dd28829-f5f7-4a45-bbf6-42592282e675" label="EVE-158" href="https://linear.app/resnovas/issue/EVE-158/f117-build-vat-codes-vat-returns-and-mtd-submission" /> F11.7 VAT codes, VAT returns and MTD submission
8. <issue id="9426469b-33b4-4ad1-b1f2-dab65b0d137f" label="EVE-159" href="https://linear.app/resnovas/issue/EVE-159/f118-build-financial-reports-event-p-and-l-and-exports" /> F11.8 Financial reports, event P and L and exports
9. <issue id="e3f6ee9b-8c42-4175-a018-a8e8255ed353" label="EVE-160" href="https://linear.app/resnovas/issue/EVE-160/f119-build-period-close-year-end-and-ledger-migration-export" /> F11.9 Period close, year end and ledger migration export

Cross-set contracts agreed 2026-11-01: F9 emits sales:order_paid, sales:refund_completed, sales:payment_fee_recorded, sales:payout_settled and sales:register_session_closed, and hands pay-on-account orders over with sales.order.invoiceOnAccount (F11 replies with accounting:invoice_settled). F6 (<issue id="928dc098-5cc9-4586-88bb-50abbe03071a" label="EVE-63" href="https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing" />) emits inventory:goods_received per receipt and inventory:valuation_exported per period, and owns POs, receipts and depreciation. F11 owns tax codes for every set.

## Linear comments (1)

### Comment 3e8f4abc-739b-4e23-84df-24d1d0c6803c

Author: GitHub. Created: 2026-11-01T13:06:17.838Z; updated: 2026-11-01T13:06:17.812Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-69/f11-accounting-ledgers-invoices-bills-event-budgets-and-tax) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/836). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
