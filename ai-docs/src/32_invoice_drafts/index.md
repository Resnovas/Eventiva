# Canonical invoice draft preparation

EVE-126 / GitHub #893 and EVE-246 / GitHub #1016 remain open. This bounded
pilot exposes sensitive online-only accounting.invoice.draft/update/get/list,
default-off accounting.f11-accounting; no import activates an application.
Use @eventiva/contracts/invoice declarations and the existing InvoiceRevision,
not another financial wire model. @eventiva/runtime/invoice-draft exports
invoiceDraftResources and invoiceDraftModule; compose them with existing paired
Organisation resources and the exact Resources/Storage/Integrity transaction owner.
See docs/payments.md for complete fields, defaults, bounds, setup and errors.

Create with a client-generated lowercase UUIDv7, canonical revision 1, complete
explicit amounts/lines/currency/commission and existing active accessible tenant
Organisation supplier/customer IDs. Update is a full replacement with current
expectedRevision and exactly next canonical revision; supplier/customer identity
cannot change. Creator/owner derive from canonical Caller. The provider's broader
UUID schema and all provider/sandbox contracts remain unchanged and unused.

The fixed version-1 canonical JSON codec in scalar Resource text is bounded to
1 MiB actual UTF-8, including wrapper; no general JSON kind, feature SQL or second
journal. Every read strictly decodes and aligns canonical/resource revision;
existing Resources retains immutable original history. Resource revision ceiling
is 2147483647, maximum update expectation 2147483646. List uses exclusive ID
after, limit 1..100/default50 and last returned ID as continuation until empty.
These are bounded engineering/storage limits, not financial approval or tax rules.

Keep identities and invocation inputs detached; policy gets disposable views,
with live reauthorization before/after SQL contention. Refuse canonical identity
mismatch instead of switching captured tenant providers. The protected execution
seam is unchanged; this is not a global host/caller/replay fix. Successful shared
replays still use existing host admission without rerunning handler Resource
checks. Recover lost acknowledgement using original key/input; changed retries
conflict, stable stored receipts are distinct from fresh attempt audit receipts.

No statutory issue/send/approval/number/PDF/legal snapshot/hold, provider or sandbox
command, ledger, payment/outbox, authority/merchant verification, money movement,
UI or sync. Draft preparation does not confer financial authority of any amount.
Get preserves stored snapshots after Party archival; future writes revalidate both
references. Broad acceptance, provider discovery and release remain open. Execute
the new contracts/resources specs plus unchanged payment-sandbox/CRM suites on real
SQL, strict-zero docs, root/full gates, reviewed planning, Nx sync and clean-source
Graphify before signed delivery. EVE-248 remains deferred to January 2027.
