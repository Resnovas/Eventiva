# Provider-neutral payment preparation (EVE-246)

## Authority and delivered boundary

[EVE-246](https://linear.app/resnovas/issue/EVE-246) owns the non-custodial connected-account direction. Jonathan resumed the named EVE-246/247/248 work on 2026-11-18 in [the owner message](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a#M-034zciY2mZuppwjcEvwc6g). That is permission to build, not evidence of provider agreements, sandbox execution, production release or new dependencies.

The first bounded slice exports `@eventiva/contracts/payment`: a local advisory assessment for one obligation or milestone. It does not issue invoices, hold funds, send provider commands, determine supplier maturity or bypass the common authorized action path. It cannot establish provider support by itself. Supplier-owned direct-charge invoices, canonical records and existing EVE-174/215/222/237/126 ownership remain unchanged.

## Assess fulfilment

1. Obtain authoritative evidence for one obligation. Do not accept caller-selected maturity, dispute state or provider capability as authorization.
2. Call `assessFulfilment` inside Effect. It validates the versioned input and reads the Effect clock.
3. Treat `blocked` as a refusal, `pending` as a future local date, and `eligible` as advisory eligibility only. Before any later online release, reauthorize, reread disputes/capabilities and ask the provider. No payment executes offline.

The complete executable example is [the fake-clock contract test](../tests/contracts/src/payment.spec.ts). It supplies policy version 1, one obligation UUID, maturity `new`, a contracted completion timestamp, supplier fulfilment and buyer confirmation timestamps, reminder evidence, dispute state and provider hold capability. With completion at day 1, fulfilment one millisecond later and confirmation another millisecond later, a New supplier is pending until day 15 plus two milliseconds, inclusive.

| Required field           | Meaning / default                                                   |
| ------------------------ | ------------------------------------------------------------------- |
| `policyVersion`          | Exactly `1`; no implicit upgrade or default                         |
| `obligation`             | UUID identifying this single obligation, not the whole event        |
| `maturity`               | `new`, `established` or `proven`; no default or automatic promotion |
| `contractedCompletionAt` | Integer UTC epoch milliseconds; no default                          |
| `fulfilledAt`            | Supplier fulfilment timestamp or `null`; no default                 |
| `confirmedAt`            | Buyer acceptance timestamp or `null`; cannot precede fulfilment     |
| `remindersSent`          | Required boolean evidence; no-response path requires `true`         |
| `openDispute`            | Required boolean; `true` blocks advisory release                    |
| `providerHoldSupported`  | Required boolean; `false` refuses unsupported holds                 |

Version 1 fixes the issue's initial calibration at 14 days for New, seven for Established, and 72 hours for Proven, after fulfilment eligibility. The exact seven-day Established value is a reversible implementation calibration from the issue's "about seven days", not a separately quoted owner selection. With no buyer response, eligibility is the later of actual fulfilment and 14 days after contracted completion, after reminders. A New unanswered obligation therefore normally needs 28 days from contracted completion, not 14. Late fulfilment is never backdated. An event occurring without supplier fulfilment is insufficient. A dispute or unsupported hold blocks even after all local dates have elapsed.

## Errors and remaining gates

Contradictory timestamps, unknown versions, noninteger dates and unknown fields produce a typed Schema parse failure. Parse failures can contain input context; never export them to telemetry or agents as raw diagnostics. There is no network, storage, key, provider credential, retry or mutable configuration in this slice. The portable library is not activated in an application, so no runtime rollout flag is introduced; future action registration needs the existing safe-default-off feature mechanism.

The local invoice sandbox below now supplies canonical revision contracts and a fake provider; authorized online actions and real provider capability/conformance remain separate. Stripe sandbox evidence, real card and bank methods, merchant/application-fee liability, signed webhook convergence, durable accounting exactly-once behavior, tenant/agent negatives and UI parity remain unrun and keep EVE-246 open. This slice neither proves that a particular provider can delay settlement nor describes Eventiva as escrow.

## Canonical invoice and local fake-provider sandbox - slice 2

The 2026-11-18 continuation in [the coordinating thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a) explicitly requests canonical invoices and a fake-provider sandbox without real money or live credentials. `@eventiva/contracts/invoice` defines `InvoiceRevision`, `InvoiceMapping`, `InvoiceCommand`, `InvoiceProvider` and bounded `InvoiceProviderFailure`. `@eventiva/runtime/payment-sandbox` exports an isolated `fakeInvoiceProviderLayer` and separate `PaymentSandbox` test controls. Nothing is registered in the server, a UI or an agent; there is no new application behavior to activate or rollout flag. Do not use test controls as business actions.

Every revision requires canonical invoice UUID, positive revision integer, supplier/customer UUIDs, uppercase three-letter currency syntax, one to 1,000 lines, exact total and explicit commission. Each line requires a 1-200-character trimmed description, integer quantity 1-1,000,000, unit net minor amount and whole-line tax minor amount. Monetary values are canonical nonnegative integer strings of at most 30 digits, never floating-point numbers. Total must equal the sum of quantity times unit net plus whole-line tax; commission cannot exceed total. Currency syntax is not an ISO capability registry. Tax rates, legal party snapshots, gapless legal numbering, credit notes, statutory PDFs and persistence remain EVE-126/accounting work, not fake-provider acceptance. Limits are reversible engineering bounds under the cited build approval, not owner-selected business limits. Fields have no implicit defaults.

Run the complete executable sandbox example with `pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/payment-sandbox.spec.ts --coverage.enabled=false`. It seeds a synthetic merchant connection and supplies `InvoiceProvider` through the fake Layer. For each simulated card/bank method, it issues a seven-minor-unit invoice with two units of commission, confirms fake payment through `PaymentSandbox.settle`, refunds 2, 2 and 3 units, then reads back the authoritative fake state. Cumulative returned commission is 0, 1 and 2 units. Rounding down the cumulative proportion avoids losing the entire fee across small split refunds; the final refund returns the full commission. This is a chosen deterministic sandbox policy, not a real provider's fee agreement.

Issue/refund keys are UUIDs scoped to the seeded connection. An identical successful replay returns its original response, not current read-back state; changed input with the same key conflicts. A new key cannot overwrite an already issued revision. Read-back uses exact connection/invoice/revision/provider-reference mappings. Foreign suppliers, forged mappings, unpaid/zero/over refunds and outages refuse explicitly. Caller mutations cannot rewrite retained projections or issue inputs. The seed and control service are trusted fixture composition, not proof of tenant authorization or human approval. The synthetic merchant supports only simulated card and bank-transfer; zero-value payment issue is unsupported even though a zero-value canonical document can exist.

This is volatile in-process simulation, not Stripe test mode, external webhook verification, durable retry/reconciliation or accounting events. The next real-provider step needs an authorized Stripe test account/platform, a test connected merchant, test-only API access injected securely, webhook signing secret and a test webhook endpoint. Never send credentials in this thread. No such account or credential has been acquired or used. Continue catalogue/import work independently while that external adapter gate remains open.

## Durable preparation-only invoice drafts - EVE-126 / EVE-246

The revision-11 [packet](https://ampcode.com/artifacts/next-implementation-packets-cd16f2fd-d187-4163-9463-9270422c87b0)
and [dispatch](https://ampcode.com/threads/T-01a1ee61-3b8d-76e1-acd9-cd77319ec06c)
select an internal online storage pilot, not financial activation. Verified open
tracker pairs are [EVE-126](https://linear.app/resnovas/issue/EVE-126) /
[#893](https://github.com/Resnovas/Eventiva/issues/893) and
[EVE-246](https://linear.app/resnovas/issue/EVE-246) /
[#1016](https://github.com/Resnovas/Eventiva/issues/1016). Both broader issues
remain open. This slice does not issue, send, approve, number, post or pay an
invoice. It has no provider, sandbox, outbox, ledger or PDF call, legal snapshot,
merchant-authority check or statutory-invoice claim. The existing canonical
provider commands, fake-provider contract and sandbox controls above are unchanged.

### Compose and prepare

1. Route an authenticated tenant to its existing private Resources provider.
   Include `invoiceDraftResources` from `@eventiva/runtime/invoice-draft` and
   the existing paired `organisationResources` declarations in its privileged
   declaration migration. Do not introduce feature SQL or a second journal.
2. Supply `invoiceDraftModule` with that same Resources service, CurrentTenant,
   live IdentityResolver, Authorizer and Flags. Configure the host's durable
   Integrity with the **exact same provider Storage owner**. This is a trusted
   composition requirement, not a new permissive policy or startup registration.
3. Provision action/resource access separately. The four sensitive actions are
   online-only under `accounting.f11-accounting`, whose safe default is false.
   Draft/update require `accounting.invoice.write`; get/list require
   `accounting.read`. These dotted names map the issue's colon labels. Preparation
   approval is none and cannot confer future issue/send/payment approval.
4. Create accessible active Organisation Parties through CRM first. Supply their
   existing IDs as supplier/customer; neither a missing half, Person, archived
   pair, foreign tenant nor denied reference is accepted. A reference does not
   prove supplier account ownership, merchant verification or legal particulars.
5. Invoke the portable contracts from `@eventiva/contracts/invoice` with a
   client-generated lowercase UUIDv7 invoice identity and complete `InvoiceRevision`
   at revision 1. Supply an original idempotency key. Update with the current
   `expectedRevision` and a complete canonical snapshot at exactly the next
   revision. Neither supplier nor customer can be reassigned; create a distinct
   draft to change parties. No field is rounded, inferred or corrected.
6. Reconcile an ambiguous/lost acknowledgement with the **same key and original
   input**, not a new number, new key or assumed payment success. Identical
   successful replay returns original content even after later revisions;
   changed input conflicts. The original SQL committed result/receipt is stable;
   per-attempt wire audit receipts are not a promise of identical receipt IDs.

The [compiling example](../ai-docs/src/32_invoice_drafts/01_drafts.ts) shows
deferred registration and a full two-line snapshot. It intentionally uses
synthetic IDs and amounts above Number.MAX_SAFE_INTEGER:
`3 * 9007199254740993 + 7 + 2 * 11 + 5 = 27021597764223013` minor units. Tax is the whole-line tax,
not a per-unit amount. Explicit commission is 9007199254740994. The example
does not run, register services or activate the flag on import.

### Stored shape and limits

One `accounting.invoice-draft` Resource stores scalar `snapshot`, `state`,
`createdBy` and `owner`; state is always draft. Creator and owner come from this
invocation's canonical Caller, with delegation owner `onBehalfOf` where present.
No caller is captured at module construction. Each complete replacement advances
canonical/resource revision atomically and Resources retains original immutable
history. History is available only through independently authorized Resources,
not an unbounded draft-history action. A future provider mapping must pin the
specific canonical revision; it must never silently follow the current draft.

`snapshot` uses a fixed private version-1 JSON codec `{format:1,snapshot:...}` in
the existing text field. This is not a general JSON resource kind, extra SQL
migration or competing canonical DTO. The entire encoded codec, including its
wrapper, is limited to **1,048,576 actual UTF-8 bytes**, inclusive, on write/read.
Strict decoding validates every read; corrupt/oversized data fails closed, never
truncates. Canonical line/amount limits above remain unchanged. Durable resource
revisions are 1..2147483647 and update expectations 1..2147483646; these are
existing adapter engineering ceilings, not newly selected financial limits.
Only durable invoice record keys require UUIDv7; the broader provider-neutral
InvoiceRevision UUID schema remains unchanged.

| Action | Required input / defaults | Result |
| --- | --- | --- |
| `accounting.invoice.draft` | Complete `snapshot`, revision 1; no defaults | Strict draft projection with original creator/owner |
| `accounting.invoice.update` | Complete `snapshot`, next revision; `expectedRevision`; no defaults | New projection, immutable prior history |
| `accounting.invoice.get` | `id`; no defaults | Currently accessible stored draft, even after later Party archival |
| `accounting.invoice.list` | Optional exclusive `after` ID; `limit` integer 1..100, default 50 | ID-ordered `items`, last row `after`; continue until empty |

Missing records report `not-found`; inactive/missing references `reference`;
wrong durable identity or canonical progression `invalid`; stale/duplicate IDs,
reassigned parties or storage CAS `conflict`; oversized codec `limit`; absent or
mismatched local authority `denied`; other parser/storage and upstream
identity/policy failures `unavailable`. Host input/flag/identity/audit failures keep their existing safe
platform categories. Errors and telemetry do not include amounts, descriptions,
Party contents or raw SQL/parser causes. A list page fails closed on denied or
corrupt content rather than returning fabricated partial rows.

### Recovery, authority and remaining acceptance

The local adapter detaches each invocation input and frozen scalar identity,
gives policy observers disposable decoded targets and rechecks live identity,
action policy and flag inside the transaction and after SQL CAS contention.
Resources independently checks current resource access. Canonical Caller mismatch
refuses rather than redirecting the captured tenant provider. This is a bounded
module adaptation of the protected execution seam, **not a global host fix**.
The common successful replay path still skips handler execution/Resource rereads;
it retains current host identity/action/flag admission semantics. Do not claim
that this slice adds Resource-policy revalidation to all shared replays.

Focused public-host tests use real SQLite and PostgreSQL, synthetic paired
organisations and the shared Storage owner. They cover exact money, persisted
reopen/history/receipts, same-key recovery, changed-input refusal, races, actual
post-write failure/interruption rollback, private policy/flag/identity controls,
byte boundaries and nonvacuous telemetry canaries. Independent synchronous SQLite
pools may busy-refuse; no universal multiprocess-success or crash/power-loss
acceptance is inferred. Provider discovery, UI/offline/device sync and statutory
accounting remain separate, unrun acceptance. No application registration, paid
work, production migration/activation or EVE-248 work is included.
