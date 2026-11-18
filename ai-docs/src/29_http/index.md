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
mandatory composition above. No production deployment, streaming, batch,
machine issuance, native client or offline queue is accepted by this slice.
