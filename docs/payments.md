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
