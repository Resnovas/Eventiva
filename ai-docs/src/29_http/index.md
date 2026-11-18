# Authenticated local action HTTP (EVE-46)

Read `docs/http-actions.md` for the complete contract and local conformance setup.
`apps/server/src/http-entry.ts` exports scoped `serveLocalHttp(TokenPolicy)`;
`http-actions.ts` exports `httpActions(TokenPolicy)` and default-off
`httpActionsFlag` (`http.actions.enabled`). No import opens a listener. The entry
allows only development/staging/test, binds IPv4 loopback and defaults HTTP_PORT
to 34446 (zero is ephemeral). Do not use ShellIdentity, a SessionId credential,
token-selected routing or an accepting identity/audit fixture.

Compose the real OIDC verifier adapter, exact trusted CurrentTenant/SQL
IdentityStore/identitySecurity, the same registered ActionInventory initializer
used by backend, and that backend's ClusterActions. Authenticate every request
with authenticateTokenSession; discovery and execution must refresh live
identity, permissions and flags. The HTTP adapter dispatches only through
ClusterActions, never ActionHost.execute locally. Module-owned decoded resource
policy remains mandatory. The compiled socket/SQL/runner fixture is
`apps/server/tests/http-actions.spec.ts`; run
`pnpm nx run @eventiva/server:http-conformance` with the approved disposable
PostgreSQL fixture configured as documented in `docs/storage.md`.

Routes: authenticated GET `/tenants/<trusted-tenant>/openapi.json` and POST
`/tenants/<trusted-tenant>/actions/<action-name>`. Both derive from the same live
non-sensitive inventory projection. Sensitive, unauthorized and flag-disabled
actions have neither a route nor metadata. Input/output JSON schemas come from
ActionMetadata's existing structural profile, not reflection or an alternate
compiler. Preserve constraints and fail closed if inventory compilation fails.
Metadata version is descriptive, not an expected-action-version pin.

The POST envelope is exactly `{ input, idempotencyKey }`. Require JSON, reject
excess envelope keys, query strings and bodies over 65536 bytes; authorization
is bounded to 8192 characters and URL to 512. Idempotency keys are 1..128 ASCII
letters/digits/`._:-`. Success is `{ output, receiptId }`; do not expose the full
receipt/caller/input hash. The unchanged host validates domain inputs, resource
permissions, approvals, audit and replay. Errors are closed 400/401/404/503
codes, never decoder/vendor messages. No automatic retries; a 10-second timeout
is not evidence that a persisted mutation did not run. Keep the same key/input.

The example below is server-only proof-to-discovery inspection, not a listener,
flag activation or wire identity response. Actual HTTP uses the entry and
mandatory composition above. No production deployment, streaming,
machine issuance, native client or offline queue is accepted by this slice.

## Bounded local sequential batch sub-slice

Revision 6 adds optional POST `/tenants/<trusted-tenant>/actions:batch` only when
both `http.actions.enabled` and `http.action-batch.enabled` are true. The new
flag is safe-default false and uses the existing Flags service; it creates no
new mandatory context service. Both flags are rechecked between calls. Flag-off
preserves the original single-action route/OpenAPI equality and exposes no batch
metadata. Keep the original HTTP entry and conformance spec unchanged.

Envelope: exactly `{ calls: [{ action, input, idempotencyKey }, ...] }`, 1..10,
65536 total bytes, the same supplied key grammar as single calls. Decode all
items and preflight all current non-sensitive action visibility before any
dispatch. This does not prevalidate domain/resource policy. Invoke sequentially
through ClusterActions; canonical identity/resource/flag/audit/replay gates
remain freshly enforced per item. First failure stops the suffix with the
existing fixed safe error; earlier commits remain. Never add automatic mutation
retry, parallelism, atomic rollback or cross-tenant semantics.

Success is ordered `{ results: [{ output, receiptId }, ...] }`. A wire receipt
identifies a fresh attempt; replay preserves the original committed SQL receipt
and output, not the attempt ID. A timeout/disconnect stops new dispatch but an
accepted durable action may finish. Recover explicitly with the original
keys/inputs and current authority, not newly generated keys. OpenAPI derives
exact alternatives from the same visible schemas, never a static registry or
hidden-schema union; preserve the literal-colon route without wildcard aliases.

`03_batch.ts` compiles a pure synthetic wire example, not a listener, client,
flag activation or authority grant. Run
`pnpm nx run @eventiva/server:http-batch-conformance` against the disposable
local SQL fixture and retain original HTTP conformance plus full gates. See
`docs/http-actions.md#sequential-non-atomic-batches` for recovery and proof limits.
