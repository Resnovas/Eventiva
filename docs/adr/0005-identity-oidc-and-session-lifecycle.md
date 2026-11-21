# ADR-0005: Identity Resolution, OIDC Federation, and Session Lifecycle

- Status: Accepted
- Date: 2026-11-21
- Owners: Identity & Security

## Context

Eventiva authenticates human users via OIDC-backed server sessions and allows humans to delegate bounded authority to agents. Revocation, session idle policies, external IdP subject casing, and concurrent session renewal must fail closed without allowing mixed-snapshot reads, silent principal creation, or unbounded session extension.

## Decision

1. **Atomic identity snapshot under `IdentityStore.lock`**: Live identity resolution (`packages/runtime/src/identity.ts`) reads principal, membership, session, role, and delegation records inside one store transaction/lock so concurrent revocations cannot be bypassed through mixed snapshots.
2. **Delegation intersection narrowing**: Effective delegated permissions are strictly the intersection of the human delegator's live grants and the delegated scope. Delegation can only narrow authority and never grants an agent permissions the delegator lacks.
3. **Strict OIDC federation without JIT provisioning**:
   - `openOidcSession` refuses unlinked or non-human subjects and never creates principals or identity links just-in-time (`ai-docs/src/15_identity/02_oidc.ts`).
   - `FederatedSubject` preserves external IdP issuer and subject strings verbatim without case or syntax normalization so distinct case-sensitive subjects are never aliased (`tests/contracts/src/identity.spec.ts`).
   - Canonical `CallerIdentity` subjects remain UUIDv4-compatible for external identity mappings, while durable resource primary keys require UUIDv7 (`tests/resources/src/crm-organisation.spec.ts`).
4. **Separate OIDC token lifetime and server session lifetime**:
   - OIDC token verification proves token provenance only; live identity resolution binds the verified token to an active server session owned by the same subject so revoking the session immediately invalidates unexpired tokens (`packages/runtime/src/identity.ts`).
   - Server session expiration is governed by server policy rather than trusting the external token `exp` claim or conflating session lifetime with telemetry consent duration (`apps/server/src/telemetry-local.ts`).
   - Short-lived OIDC access tokens expiring before the server session are valid while unexpired; token and session bounds are checked independently (`tests/runtime/src/identity.spec.ts`).
5. **Sliding idle window plus immutable 8-hour absolute anchor**:
   - Human sessions combine a configurable sliding idle timeout with an immutable 8-hour absolute sign-in anchor (`apps/server/src/approval-consent.ts`, `apps/server/src/session-renewal.ts`).
   - Re-login and token refresh do not silently extend activity, and tightened idle policies apply before admitting new activity.
   - `IdentitySessionPolicy` validates current policy, tenant ownership, session liveness, and safe integer deadline addition before capping with `Math.min` so an earlier session expiry never masks malformed policy or overflow (`apps/server/src/identity-session-policy.ts`).
6. **Serialized lock-before-clock session renewal and minimized audit receipts**:
   - Session renewal acquires `IdentityStore.lock` as the first statement inside `storage.transaction` before sampling `Clock.currentTimeMillis`, preventing lock wait time from masking concurrent logout or expiry crossing (`apps/server/src/session-renewal.ts`).
   - Session renewal receipts digest only server-classified route, canonical session ID, and renewal timestamps, never persisting bearer tokens or external OIDC subject claims.

## Consequences

- Concurrent logout, role revocation, and idle policy tightening take effect deterministically without race windows.
- External IdP claims cannot bypass server-owned session bounds or trigger implicit account creation.

## References

- `packages/runtime/src/identity.ts`
- `apps/server/src/identity-session-policy.ts`
- `apps/server/src/session-renewal.ts`
- `apps/server/src/approval-consent.ts`
- `apps/server/src/telemetry-local.ts`
- `ai-docs/src/15_identity/02_oidc.ts`
- `tests/contracts/src/identity.spec.ts`
- `tests/runtime/src/identity.spec.ts`
