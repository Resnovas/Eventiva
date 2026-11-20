# Exact-resource approval cancellation

EVE-275 / Resnovas/Eventiva#1063 reconciles the resource permission source selected
by Jonathan on 2026-11-19, recorded in `docs/core-qualification/resource-cancellation.md`.
This is a security-policy correction, not a new optional behavior toggle, approval
schema, retention producer or activated endpoint. Preserve the existing default-off
`identity.approval-consent-enabled` lifecycle capability and all mandatory authority
checks. The binding session-renewal policy and trusted-activity classification
are outside this cancellation correction.

Published evidence (reconciled 2026-11-20): the
`Current published state - Packet I, 2026-11-20` capsule in
`docs/core-qualification/resource-cancellation.md`
maps source `009dc422`, head `3ff2251b` and exact-head application run
`44638123407` to the clauses below, preserving original failures and fixture approval.
The same dated capsule in `docs/core-qualification/session-policy.md` records
delivered permanent coverage and policy-backed SQL issuance; neither capsule
certifies rolling renewal, production activation or whole EVE-275/Core acceptance.

Use registered `ActionHost.prepareApproval` to derive the review. After codec,
target authorization and live policy, trusted `ApprovalEvents.resolve(binding,
canonicalWireInput)` returns an optional `{ event, resource }`. `resource` is the
exact reference used by the identity grant's `resources` list. Persist this
trusted scope with the approval; never accept a replacement event/resource from
cancellation input. The registered cancellation input remains `{ id }` only.

`cancelApproval(id)` resolves a live same-tenant direct human and joins the routed
identity/proof transaction. The consenting human may cancel their own pending
consent without a cancel grant or association service. For others, a live grant
with `permission: 'approvals.cancel'` and exact `tenant:<routed tenant id>` keeps
its existing tenant-wide meaning. Otherwise require an exact captured resource
entry and a successful `ApprovalEvents.canCancel(caller, binding, scope)` live
association check. Keep this existing method name/port shape: it verifies that
the trusted target still belongs to the captured tenant/event; it must not infer
lead roles or grant cancellation authority. The runtime owns permission checking.

Example grant for a trusted captured resource `registered-target-17`:

```json
{
    "permission": "approvals.cancel",
    "resources": ["registered-target-17"]
}
```

This does not grant cancellation of `registered-target-18` even when both targets
belong to the same event. An `event:<id>` grant, wildcard or role display name is
not a substitute for this exact resource reference. No string-prefix/hierarchy
expansion or default accepting association is added. Missing service, unavailable
target or changed association denies this scoped path without disabling own or
explicit tenant-wide cancellation. Permission/role/team/session/membership loss
is observed live, including repeated cancellation. A repeated authorized cancel
does not advance revision or append another decision; used and expired pending
proofs remain noncancellable.

The original approver never changes. A successful cancellation atomically records
the current cancelling actor in its decision and retains the existing
`approvalRetentionEnd(revokedAt, retention)` producer rule. Audit failure rolls the
proof update back. Retention cleanup and real event-domain provisioning are
separate capabilities, not consequences of these checks.

Compiling executable examples and regression controls are in
`tests/storage/src/approval.spec.ts`. Both SQLite and disposable loopback
PostgreSQL use real identity/proof/audit persistence. The feature association
adapter is explicitly synthetic; it does not provision event tables or attest a
production event provider. Run normal storage/runtime tests and full `verify`
using the fixture in `AGENT-SETUP.md`. For focused diagnosis only:

```sh
pnpm exec vitest run --config tests/storage/vitest.config.mts tests/storage/src/approval.spec.ts --coverage.enabled=false
```

An unexpected denial should be diagnosed through live identity/grant state and the
trusted association adapter, not by accepting an event-shaped permission,
caller-supplied scope, implicit lead role or permissive missing-service fallback.
Focused coverage-disabled diagnostics do not replace unchanged normal coverage,
root/boundary/full gates or exact-head hosted CI. Whole EVE-275/Core and production
activation remain separate acceptance.
