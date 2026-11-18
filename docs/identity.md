# Provider-neutral identity foundation (EVE-43)

Eventiva owns canonical principals, tenant membership, teams, roles, resource grants, profiles and action audit. The selected login, SSO and federation provider is Keycloak 26.8.2, pinned by digest and adopted on 2026-11-18. OIDC access-token verification and session provisioning live in `@eventiva/integrations.oidc`; read [the OIDC guide](identity-oidc.md). Nothing here adds accounts, paid services, deployment, production writes or replication.

## Boundaries and setup

1. Apply the forward-only `storage/migrations/<dialect>/0002.sql` through EVE-42's existing migration loader, after `0001.sql`. Do not edit applied migrations. Both PostgreSQL and Node SQLite are covered; SQLite here is a backend test database, not device authentication storage.
2. Resolve the authenticated tenant through trusted control-plane routing and authorization, using the existing `TenantRouter`. A requested tenant, token realm, email domain or role claim never chooses a database. Build a separate ActionHost per tenant route. Do not reuse a tenant host, captured module, IdentityStore or SQL client in another route.
3. Share the **same captured tenant SQL client** between `storage(dialect)` and `identityStore` from `@eventiva/integrations.sql/identity`. Provide `CurrentTenant` to the identity store. The router deliberately does not expose a raw SQL client; its trusted composition root must retain the authorized client. Never take a database URL from a transport. Cluster transport storage remains separate.
4. Provide `identitySecurity` from `@eventiva/runtime/identity` and the existing `durable` layer to `ActionHostLive`. Register the result of `identityModule` inside that tenant's lifetime. Provide trusted `Approvals`, a cryptographic `InputDigest`, and the existing `Flags` service. Missing services are not replaced with permissive defaults. The server shell remains fail-closed and is not automatically wired to this increment.
5. Bootstrap principals, sessions, initial roles/memberships and explicit federated links through the trusted backend `IdentityStore` port only. This is not an HTTP API and performs no authentication of its caller. A future provisioning/consent adapter must authorize and audit these operations; do not expose raw store methods to users, agents or SCIM clients.
6. Explicitly enable module flag `identity.foundation-enabled` through the existing flag evaluation mechanism only after those adapters are accepted. Its safe default is `false`; this change creates no remote flag or ingestion service. The flag gates administration actions, never the mandatory authorization checks.

Portable contracts live at `@eventiva/contracts/identity`. Runtime policy and handlers have no provider SDK, Node crypto, SQL client or vendor types. SQL identity integration imports contracts only, not runtime. No dependencies or versions changed.

## Identity and authorization rules

- `SubjectId` is the canonical stable Eventiva identifier, not an email address or provider user ID. The issuer and external subject form an exact, case-sensitive composite link within each tenant database. Repeating an identical link is idempotent; changing its canonical subject is rejected. Another issuer may use the same external subject. Another database inherits neither the mapping nor membership. Provision the same canonical ID into multiple tenants only after an explicit authorized cross-organization identity-link decision. There is no email-based linking, automatic signup, relink, token-exchange impersonation or global user directory in this increment.
- Every call refreshes the principal, session and active membership from SQL. The presented subject, kind, session, tenant and optional `onBehalfOf` must match live state. Security, token authentication and module construction reject a store captured for another tenant. Logout/deprovision adapters must revoke the SQL session, principal or membership; no provider notification consumer is implemented yet.
- Permissions are exact dotted names, not wildcard role claims. Each grant names opaque resource IDs or explicit `*` for all resources **inside the current database only**. Membership roles and team roles combine, but an inactive membership disables both. Identity's target policy denies unknown actions; other modules need their own explicit target-policy composition rather than a permissive fallback.
- An agent requires its own active principal/membership/session plus a server-stored delegation bound to a distinct active human and that human's active, unexpired nondelegated session. Authority is the intersection of agent grants, current human grants and delegation grants, down to the resource. Delegation expires no later than the agent session; human-session expiry also stops it. No chained delegation or implicit self-delegation is allowed. Services cannot attach `onBehalfOf` to acquire human rights.
- An identity guard row serializes refresh with identity writes. Inside `Storage.commit`, the lock lasts through host revalidation, handler and receipt commit, preventing a concurrent revocation from being ignored after waiting. Writes take the same guard before CAS. The guard is tenant-local and intentionally conservative; it is not a cross-tenant lock or a scalable global directory. Reads linearize their authorization before the handler, not against an indefinite future revocation.

## Actions and defaults

All actions are version 1, sensitive and online-only. Reads return `null` for an absent permitted record, otherwise `{ value, version }`. Writes require `expectedVersion: null` for create-only or the current nonnegative version for CAS update, and return JSON `null`. There are no unconditional upserts or delete actions. No action accepts a tenant selector.

| Actions                              | Permission suffix              | Target         | Approval                              |
| ------------------------------------ | ------------------------------ | -------------- | ------------------------------------- |
| `identity.organization.get` / `.set` | `organization.read` / `.write` | `organization` | Set: always, step-up                  |
| `identity.membership.get` / `.set`   | `membership.read` / `.write`   | Subject UUID   | Set: always, step-up                  |
| `identity.role.get` / `.set`         | `role.read` / `.write`         | Role UUID      | Set: always, step-up                  |
| `identity.team.get` / `.set`         | `team.read` / `.write`         | Team UUID      | Set: always, step-up                  |
| `identity.profile.get` / `.set`      | `profile.read` / `.write`      | Subject UUID   | Set: explicit confirmation for agents |
| `identity.audit.list`                | `audit.read`                   | `audit`        | None                                  |

Every permission is prefixed `identity.`. New teams and membership grants must reference existing records. Only grant role/team/membership administration to trusted tenant administrators: those permissions intentionally permit changing tenant authority, always under explicit approval. `profile.get` takes `{ subject }`; the membership/role/team reads take `{ id }`; organization read takes `{}`. Writes take `{ value, expectedVersion }`. Organization's fixed ID is `organization`. Profiles contain only `id` and `displayName`; no credentials, tokens, email-based identity or provider metadata. The bounded audit read takes required integer `limit` from 1 to 100, without a default. It returns a deterministic ID-descending page, not guaranteed chronological order or full-history pagination.

ActionHost requires an idempotency key on every write and an opaque approval ID when needed. It binds approvals to principal, tenant, action/version, input digest, time, limits, human approver and step-up; submitting a boolean or approval object is not proof. This increment does not issue approval proofs or provision consent/delegation. A trusted human-consent adapter is still required. There is no automatic approval or lower-risk path for agents.

For example, after the trusted composition root registers a tenant's module, an administrator invokes:

```ts
import { ActionHost } from '@eventiva/runtime/host';
import { Effect } from 'effect';

export const renameOrganization = (approvalId: string) =>
    Effect.gen(function* () {
        const host = yield* ActionHost;
        return yield* host.execute(
            'identity.organization.set',
            {
                value: { id: 'organization', name: 'Festival Operations' },
                expectedVersion: 0,
            },
            {
                idempotencyKey: 'organization-rename-1',
                approvalId,
            }
        );
    });
```

The caller must be provided from trusted authentication, not copied from the request. Fetch the current organization/version and obtain a bound human approval before this update. A stale version or changed input under the same idempotency key fails; do not retry as an unconditional create. See the compiling composition example in `ai-docs/src/15_identity/01_host.ts`.

## SQL and audit

The additive migration creates Eventiva-owned principal, session, organization, membership, role, team and profile tables with CAS versions and schema-validated JSON bodies, plus the guard and issuer/subject link table. These are a bounded backend foundation, not normalized provisioning/directory tables or the deferred typed device-record implementation. Team evaluation currently scans tenant team bodies; large-directory indexing is not claimed. Primary keys and the federation subject foreign key are indexed. Membership/profile foreign keys reference principals. There are no tenant predicates that could substitute for database isolation and no schema grants, runtime DDL or destructive migration steps.

The established SQL transaction carries identity mutations, idempotent result and successful receipt together. Failed handlers or receipt writes roll back the mutation. Replays reauthorize and add their own invocation receipt. Denials and reads add exactly one receipt per executed host call when audit is available. Audit outage fails closed, not best-effort. A route denial before a tenant host is entered belongs to the control-plane authorization/audit callback, not a write into an untrusted tenant database. The audit reader rejects receipts bearing another tenant.

Receipts contain identifiers, outcome, timing and a cryptographic input digest, not raw profile input, secrets, credentials, error details or output. The idempotent result table is distinct from the tenant-admin receipt API and needs restricted backend access. No in-memory production audit or spool is provided.

## Token seam and remaining provider proof

`StandardsTokenVerifier.verify` accepts a redacted token and must return normalized claims **only after** a maintained standards implementation verifies signature, allowed algorithms, key provenance/rotation, token type and protocol-specific requirements. `oidcStandardsVerifier` in `apps/server/src/identity-oidc.ts` supplies it from the oauth4webapi-based adapter; there is no homegrown crypto. Runtime unit tests still inject synthetic claims; the live Keycloak lane in the OIDC guide proves real tokens.

Return `typeof VerifiedTokenClaims.Encoded` on the Effect success channel and `InvocationDenied` on failure. The normalized object requires string `issuer`, `subject` and `session`, string-array `audiences` and `scopes`, and numeric `expiresAt` and `notBefore` in epoch milliseconds. The verifier integration must normalize its provider payload to this concrete shape; it cannot return an arbitrary payload. `authenticateToken` still decodes `VerifiedTokenClaims` at runtime, rejecting malformed session identifiers, empty claim strings and invalid epoch values before policy checks. A typed success value is not a substitute for verification or validation.

`authenticateTokenSession` then requires a trusted nonempty exact issuer, audience and nonempty required scope list, validates audience/scope inclusion, `notBefore` and expiry in epoch milliseconds (no clock-skew allowance), resolves the tenant-local issuer/subject mapping, and requires a live SQL session whose subject matches the link. The session may outlive one short-lived token. It returns `{ caller, issuer, sessionExpiresAt }`; `authenticateToken` returns the caller only. Neither is a database route or a role grant. Token roles and organizations never create SQL membership. Inbound authentication and routing still require a trusted composition root; this seam cannot bootstrap a tenant from untrusted claims.

| Proof area                        | Current status / remaining blocker                                                                                                                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keycloak 26.8.2                   | Adopted 2026-11-18 by exact digest. Trivy scan, SBOM and dispositions in [the register](supply-chain/eve-43-keycloak-findings.md); residual Guava finding accepted with controls. Final OCI assembly has no supplier signature. |
| OIDC/OAuth outbound and inbound   | Access-token verification, session open/close and revocation proved against live Keycloak. Still open: PKCE browser flow, third-party clients, service credentials, inbound federation.                                         |
| SAML 2.0 outbound and inbound     | Not implemented/tested. Prove metadata, signatures, assertion conditions, audience/recipient, replay rejection, rollover and logout in each direction.                                                                          |
| SCIM users/groups and directories | Not implemented/tested. Verify exact supported SCIM direction/operations and organization semantics; prove LDAP/AD/Kerberos, deprovision and revocation delivery. No universal support claim.                                   |
| Passkeys/MFA/step-up and consent  | No provider auth-context propagation or production approval issuance. Prove fresh authorized human decisions; synthetic approval fixtures are not a consent service.                                                            |
| Sessions, refresh and logout      | SQL revocation enforced locally. Provider logout/back-channel logout, refresh rotation, key rotation/revocation and failure/outage behavior remain unproved.                                                                    |
| Community and production topology | No provider provisioning, resilience/HA proof or rollout. Self-hosted Community must remain independently operable.                                                                                                             |
| Legacy protocols                  | WS-Federation, CAS, SAML 1.x and nonstandard variants are not covered; separately approve any bridge/extension.                                                                                                                 |

To replace the provider, keep canonical SubjectIds, SQL grants and tenant routes, add an authorized explicit issuer/subject link, and implement the verifier/provisioning adapters in backend integrations. Never bulk-relink by email or import vendor types into portable contracts/runtime.

The earlier [read-only vetting evidence](https://ampcode.com/artifacts/eve-43-keycloak-vetting-c328b8bc-d295-4781-88c1-f4fd7968cf99) is historical. `oauth4webapi@3.8.8` and the image digest are now adopted. Every row above except Keycloak and OIDC access tokens remains unexecuted.

## Validate and troubleshoot

Run `pnpm nx run @eventiva/runtime-tests:test`, `pnpm nx run @eventiva/contracts-tests:test`, and `pnpm nx run @eventiva/storage-tests:test`, then `node --run verify`. For storage tests use only the approved disposable loopback PostgreSQL fixture and teardown procedure in `docs/storage.md`; never point the suite at Neon or production. PostgreSQL and SQLite tests exercise physical-database separation, link collisions, approvals, viewer/agent denial, CAS races, replay revocation, transactional rollback and durable receipt counts. The unit token seam tests cover issuer, audience, scope, time and mapping failures with no provider account.

- `identity-denied`: check the trusted route, exact principal/kind/session binding, active membership, human session and delegation expiry. Do not trust token roles to repair it.
- `identity-policy-denied`: check exact permission and resource grants on all three delegation participants. Empty grants deny; an unknown module needs an explicit target policy.
- `approval-required` or `step-up-required`: obtain a fresh bound proof through the trusted consent seam. Never auto-generate one in the action handler.
- `IdentityFailure/unavailable`: inspect secure backend storage diagnostics for stale versions, missing schema or SQL failures. The public error deliberately hides database details; do not force an update.
- Audit failure or a missing guard: stop protected actions and restore the durable service/schema. Never fall back to memory.
