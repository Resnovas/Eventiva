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

Next slices must add canonical invoice/revision contracts, authorized online actions, provider capability services and fake-adapter conformance before provider sandbox composition. Stripe sandbox evidence, a card and bank method, merchant/application-fee identity, webhook convergence, commission/refund/accounting exactly-once behavior, tenant/agent negatives, UI parity and provider replacement remain unrun and keep EVE-246 open. This slice neither proves that a particular provider can delay settlement nor describes Eventiva as escrow.
