<!-- linear:generated:start -->
# EVE-43: P1.4 Build identity and access: orgs, authorization, user profiles and audit

[Live Linear source](https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-17T07:22:23.543Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | In Progress (started) |
| Priority | 1: Urgent |
| Labels | Code, Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-81](EVE-81.md), [EVE-82](EVE-82.md), [EVE-87](EVE-87.md), [EVE-91](EVE-91.md), [EVE-92](EVE-92.md), [EVE-94](EVE-94.md), [EVE-96](EVE-96.md), [EVE-97](EVE-97.md), [EVE-98](EVE-98.md), [EVE-105](EVE-105.md), [EVE-109](EVE-109.md), [EVE-112](EVE-112.md), [EVE-116](EVE-116.md), [EVE-119](EVE-119.md), [EVE-121](EVE-121.md), [EVE-122](EVE-122.md), [EVE-127](EVE-127.md), [EVE-128](EVE-128.md), [EVE-131](EVE-131.md), [EVE-132](EVE-132.md), [EVE-133](EVE-133.md), [EVE-138](EVE-138.md), [EVE-140](EVE-140.md), [EVE-141](EVE-141.md), [EVE-146](EVE-146.md), [EVE-147](EVE-147.md), [EVE-152](EVE-152.md), [EVE-153](EVE-153.md), [EVE-155](EVE-155.md), [EVE-158](EVE-158.md), [EVE-162](EVE-162.md), [EVE-166](EVE-166.md), [EVE-167](EVE-167.md), [EVE-170](EVE-170.md), [EVE-171](EVE-171.md), [EVE-174](EVE-174.md), [EVE-176](EVE-176.md), [EVE-179](EVE-179.md), [EVE-181](EVE-181.md), [EVE-185](EVE-185.md), [EVE-191](EVE-191.md), [EVE-200](EVE-200.md), [EVE-204](EVE-204.md), [EVE-206](EVE-206.md), [EVE-215](EVE-215.md), [EVE-223](EVE-223.md), [EVE-231](EVE-231.md), [EVE-235](EVE-235.md), [EVE-261](EVE-261.md) |
| Related to | [EVE-16](EVE-16.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-45](EVE-45.md), [EVE-46](EVE-46.md), [EVE-61](EVE-61.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-113](EVE-113.md), [EVE-169](EVE-169.md), [EVE-250](EVE-250.md), [EVE-251](EVE-251.md), [EVE-252](EVE-252.md), [EVE-253](EVE-253.md), [EVE-257](EVE-257.md), [EVE-258](EVE-258.md), [EVE-262](EVE-262.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Authoritative approval reconciliation - 2026-11-16

The owner's comment 5d66b4b8-811a-4b50-908b-878fa09c90da is authoritative over older hold/proposal wording. Keycloak 26.8.2 remains selected. One consolidated SBOM-reviewed batch of exact image digest and necessary pinned OIDC dependencies is approved for validation and subsequent use within that reviewed boundary. This does not approve unspecified packages, mutable tags, upgrades or unresolved material security findings. Enumerate identities/integrity/provenance/licences/SBOM/vulnerabilities before use; preserve the security gates and escalate materially different components or findings. No production provisioning, paid infrastructure or weakened security policy is authorized. Older comments remain intact as historical evidence.

## BINDING OWNER DECISION — Keycloak as the Eventiva identity provider (2026-11-15)

Jonathan explicitly chose **Keycloak** as Eventiva's primary identity and SSO platform and authorized starting <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" /> implementation. **Pin the implementation/proof target to candidate Keycloak 26.8.2**, subject to verifying the exact container manifest, supply chain, protocol behavior and compatibility before using it; do not silently upgrade/change its version. ZITADEL is no longer a co-equal selection candidate, though standard provider-neutral interfaces and documented exit/migration paths remain mandatory.

**Architecture and operating models**

* Keycloak operates as Eventiva's central authentication/identity service: interactive login, credentials, sessions, MFA/passkeys and SSO. It must be usable in self-hosted Community without Eventiva Cloud as well as in Cloud/Production (independent resilience/HA topology).
* Keycloak must act **outbound** as an OpenID Connect provider/OAuth 2 authorization server and SAML 2.0 IdP for authorized first-party and external application clients, and **inbound** as identity broker for enterprise OIDC/SAML IdPs, social logins, and LDAP/Active Directory/Kerberos where available.
* Test enterprise federation, realm/organization selection, user account linking, SCIM user/group provisioning/deprovisioning where supported, passkeys/WebAuthn MFA and step-up, logout, rotation/revocation, client/service credentials, tokens/audiences/scopes, and correct degraded operation when upstream IdPs fail.
* Document **non-universal** coverage of legacy SSO/SSO-like protocols and variants (e.g. WS-Federation, CAS, SAML 1.x), and separately scope any extensions/bridges. No unsupported claim that *all* possible SAML or OAuth implementations are compatible.
* Eventiva itself owns canonical identity-to-tenant membership mapping, resource-level RBAC/ABAC/capability policies, agent delegation, human approval gates, tenant database routing and durable audit; Keycloak-issued token claims are not an authorization bypass. A user can belong to multiple tenants, potentially with different federated enterprise IdPs.
* Enforce the same delegated-authorized Effect action pathway for human UI, API, agents and all protocols. No direct client DB/API access or automatic identity claims granting rights in other tenant databases. Prevent implicit self-approval, unsafe token exchange impersonation, and tenant cross-link collisions.
* Keep vendor adapters in backend integration packages: portable contracts, portable schema and authorized core runtime must not directly depend on Keycloak SDK APIs. Supports standards-based OIDC/SAML independent interface and a documented replacement path.

**Implementation authorization and dependency gate**
Owner authorization covers choosing Keycloak and progressing <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" /> implementation, including code and tests that use already-approved dependencies and nonconflicting paths, with signed, checked conventional direct-to-main delivery under Eventiva's exception. It does **not** automatically approve unlisted npm dependencies, image versions/digests, new paid infrastructure, external accounts, paid services, changing Neon/production settings, or lowering security gates. Verify the exact version/security/SBOM and submit any new package/version and container digest for explicit approval in a consolidated batch. Synthetic, local-only proof planning and implementation scaffolding need no new provider provisioning. If executable Keycloak container proof needs an unapproved image, ask for its digest acceptance before pulling/running.

* Prioritize <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" /> after completed <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />, <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> and <issue id="55c2d64a-d779-41d9-b74e-dcc7d062b86b" label="EVE-252" href="https://linear.app/resnovas/issue/EVE-252/implement-effect-cluster-sharding-and-multi-runner-recovery-in-the" /> SQL foundation. Initial implementation slices: portable identity/subject/federation models and stable IDs; Eventiva-owned org/member/role/user-profile actions with SQL-authoritative membership, authorized action binding and audit; standards-focused token issuer/audience and scope validation seam with mock/test provider; first-party/third-party SSO, SCIM, enterprise federation and step-up conformance matrix, then Keycloak concrete adapter and executable integration tests once exact components are approved.
* Keep schema, tenant routing, gateway and runner boundaries consistent with <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" />/<issue id="55c2d64a-d779-41d9-b74e-dcc7d062b86b" label="EVE-252" href="https://linear.app/resnovas/issue/EVE-252/implement-effect-cluster-sharding-and-multi-runner-recovery-in-the" />; do not overwrite dirty work of any concurrent orb. No PRs.

Previous <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" /> text that says the auth provider is undecided is superseded by this explicit owner choice; remaining work is exact version/dependency/security validation and implementation, not provider selection.

## Goal

One permission check that people and agents both pass through, with every call audited and tenants fully isolated.

## Context

* Phase-1 step 4 of the S2 capability map. Upstream reference at 6b5cf68: `org/` (orgs, teams, SCIM on better-auth), `authorization/`, `user-profile/`, `audit/`.
* Decided D2: Eventiva owns auth. Keycloak 26.8.2 is selected; the 2026-11-16 owner comment governs the reviewed exact image/OIDC dependency batch. Provider-neutral tenant membership, authorization and audit remain Eventiva-owned.

## Scope

1. Tenants, members, teams and roles as Eventiva tables (P1.3) with actions for membership changes.
2. An authorization service evaluated once per action call (P1.1) for any principal: user, agent acting for a user, service, or external agent; the agent never gets more than the user it acts for.
3. Approvals: actions marked confirm or always pause and wait for the user, on screen and through every protocol surface.
4. Audit log of every action call from the receipt, with redaction of secret-marked fields and read scopes for tenant admins.
5. User profile actions.

## Acceptance criteria

* A test matrix proves: cross-tenant read denied; agent acting for a viewer cannot write; an approval-required action does not run until approved; every call writes one audit row.
* Verify the selected Keycloak 26.8.2 integration against its reviewed exact image/dependency batch and protocol/security matrix; report unexecuted lanes and unresolved security findings without claiming production readiness.

## Constraints

Effect-TS v3; no vendor lock-in to an auth SaaS without the decision; no new dependency without approval here; ship to main with check results.

## Done signal

Merged with the matrix green and the audit table queryable by a tenant admin action.

## Modular lifecycle/resource/hook audit boundary (2026-11-15)

Spec [https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c](<https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c>); <issue id="b025ea11-9298-48b2-9bd4-d44decabcab4" label="EVE-261" href="https://linear.app/resnovas/issue/EVE-261/integrate-the-modular-platform-and-prove-every-owner-required" /> integration gate. Preserve approved Keycloak direction/version/supply-chain gates and all existing identity scope; no new provider selection here. KernelAuthority uses existing Caller; Resources checks tenant/principal/authorization per operation; hook release checks current scoped grant/revocation every attempt. Tamper-evident mandatory audit is separate from optional telemetry and cannot be disabled by telemetry opt-out. Atomic write/outbox/history/audit uses same Storage.transaction; sensitive/privileged operations fail closed when required durable evidence cannot persist. Tests include self-approval, tenant switching, revoked subscription/credential, secret/Cause serialization, audit sink outage vs telemetry outage and replay. Four independent protected-release gates and assurance floors remain <issue id="4f5ecaa3-aedf-446d-8993-0c07c98d4bb4" label="EVE-251" href="https://linear.app/resnovas/issue/EVE-251/decide-marketplace-service-attestation-and-cryptographic-trust" />/13 constraints. No cryptographic algorithm/dependency/provisioning approved by this addition. AI-authored planning addition.

## Session identifier versus authentication proof — acceptance requirement (2026-11-17)

A `SessionId` UUID is a non-secret correlation identifier, never a credential or bearer capability. Knowing or supplying a session UUID must grant no access. Every externally reachable caller must prove possession of a separately protected credential (for example a verified short-lived token, signed service assertion or equivalent approved mechanism); trusted identity resolution then maps that proof to the subject and session before Eventiva authorization runs.

The fixed `shellCaller` / `ShellIdentity` UUID in `apps/server/src/access.ts` is permitted only inside the current non-networked registration diagnostic. Replace or isolate that exact-value resolver before any HTTP, RPC, agent or other untrusted transport can invoke it. Acceptance tests must prove that a copied/guessed SessionId without valid credential proof is denied, expired/revoked proof is denied, and authenticated identity still receives only Eventiva-owned tenant membership and action permissions. Session IDs may appear in source, traces or logs only under the normal correlation/redaction policy; credentials, tokens and proof material must never do so.

## Linear comments (9)

### Comment 0f398f15-e58b-4436-a856-4fd8049cca54

Author: GitHub. Created: 2026-10-31T22:31:29.860Z; updated: 2026-10-31T22:31:29.834Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/810). All replies are displayed in both locations.


### Comment a49505fd-7f92-42d4-96ee-0e6c3d0f2833

Author: jonathan@resnovas.com. Created: 2026-11-14T23:11:18.596Z; updated: 2026-11-14T23:11:18.539Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and) (comment ID above). Parent: None. Resolved: Not recorded.

## PROPOSAL — marketplace service trust architecture

Created EVE-251 (https://linear.app/resnovas/issue/EVE-251/decide-marketplace-service-attestation-and-cryptographic-trust) to define tenant/shared-service mutual identity, attestation, encrypted transport, signing, key separation/lifecycle, replay protection and request-scoped authorization. No implementation or cryptographic specifics are approved. The search found only the archived master-key/workspace-key at-rest design in `Examples/eventiva-before-amp/.cursor/plans/completed/notes.md` §§2.1.2–2.1.4, not the owner's stated Eventiva root/subordinate service key hierarchy.


### Comment 74d9c741-14f3-492b-936b-5199ba81f55e

Author: jonathan@resnovas.com. Created: 2026-11-15T01:45:07.906Z; updated: 2026-11-15T01:45:07.805Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and) (comment ID above). Parent: None. Resolved: Not recorded.

## Approved foundation policy reference

Jonathan approved A2–A4 and S2–S4 on 2026-11-15. Approval cannot be self-issued or weakened; guarded offline/scheduled work uses explicit state/version/idempotency/deadline and online revalidation; protected audit fails closed; scarce resources use ledgers/reservations/CAS; device records use typed raw tables/migrations; migrations are forward-only expand/contract; canonical IDs/time/decimals follow S4. See [EVE-40](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema), [EVE-42](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) and the [decision sheet](https://ampcode.com/artifacts/eventiva-architecture-decisions-3169b540-652d-4795-ae9c-7ad78a534f17). No dependencies or implementation are approved by this cross-reference.


### Comment 99c9d573-22dd-4091-8d0b-9fe1b53d36e2

Author: jonathan@resnovas.com. Created: 2026-11-15T14:50:06.558Z; updated: 2026-11-15T14:50:06.518Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and) (comment ID above). Parent: None. Resolved: Not recorded.

## EVE-43 enterprise identity and federation acceptance requirements — 2026-11-15

Owner clarified that Eventiva needs an identity platform capable of **both central user/login management and acting as an external-facing SSO/OAuth/OIDC identity provider**, **while also brokering/federating external enterprise identities**. The provider must be evaluated in BOTH directions; simply supporting login *to* Eventiva does not satisfy the requirement.

**Required protocol/capability matrix for the bounded provider comparison and test plan:**
- **Outbound provider role:** Eventiva authentication authority must act as OIDC OpenID Provider / OAuth 2 authorization server for first-party clients and permitted third-party applications, and as SAML 2.0 Identity Provider for SAML service providers; confirm scopes, clients, credentials, refresh/revocation, logout, signing, metadata/discovery and SSO.
- **Inbound broker role:** consume enterprise SAML 2.0 Identity Providers and OIDC (and compatible OAuth 2 where identity attributes can be safely resolved), plus social IdPs; map external subject identity into stable Eventiva identities with explicit account linking and collision prevention.
- **Federated directories:** LDAP/Active Directory/Kerberos where supported, including local-account fallback, MFA/passkey/step-up, enterprise conditional policies and secure authentication-context propagation.
- **Provisioning:** SCIM 2.0 inbound create/update/deprovision for users and groups where supported; explicitly distinguish outbound SCIM client/synchronization and unsupported optional SCIM capabilities. Keycloak 26.8.2 documentation confirms supported SCIM Realm API, enabled at server level by default but still configured per realm; test access boundaries and org group semantics.
- **Multi-organization account model:** one stable human identity may belong to multiple Eventiva tenant organizations; individual customer organizations may bring distinct external SAML/OIDC providers, and membership/delegation must not imply cross-tenant operational DB access. Evaluate Keycloak Organizations and realm organization mapping, self-hosted Community deployment, migrations and account lifecycle.
- **Agents:** OAuth2 service identity, user-delegated authority, consent, token audience and scoped permissions; do not rely on preview/legacy token-exchange impersonation to bypass Eventiva's own authorized Effect action path, fresh human approvals or audit. Eventiva remains authoritative over tenant/resource/action permission grants.
- **Legacy/edge standards:** identify unsupported protocols/profile variants (e.g., SAML v1, WS-Federation, CAS, nonstandard enterprise SAML claims, proprietary SSO APIs) instead of asserting universal compatibility; document vetted bridges/adapters, certificates, logout/rotation and compliance limitations.
- **Security acceptance tests:** SAML both directions, OIDC both directions, cross-tenant account linking, role and membership revocation, SCIM deprovision, logout/back-channel logout, passkeys/MFA/step-up with authn context, issuer/audience validation, failure/availability and IdP outage.

**Research status:** Keycloak 26.8.2 is the current recommended candidate; ZITADEL 4.20.3 is an alternative. Keycloak provider selection, new dependencies, container execution, identity database provisioning and production rollout remain separately approval-gated. This comment defines evaluation scope rather than authorizing deployment.

Official references:
- https://www.keycloak.org/docs/26.8.0/server_admin/
- https://www.keycloak.org/docs/26.8.2/upgrading/
- https://www.keycloak.org/securing-apps/token-exchange
- https://www.keycloak.org/2026/07/keycloak-2670-released



### Comment 9568315f-3e37-430c-9b0c-dbf743d98695

Author: jonathan@resnovas.com. Created: 2026-11-15T16:02:40.318Z; updated: 2026-11-15T16:02:39.587Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and) (comment ID above). Parent: None. Resolved: Not recorded.

## Provider-neutral foundation delivered - 2026-11-15

Agent report by Amp GPT-6.1 Sol. AI level: autonomous. Implemented personally in the Eventiva checkout, without another thread, a PR, new dependencies or CI/settings changes.

Signed conventional commits pushed directly to main:
- [a50987a - identity foundation](https://github.com/Resnovas/Eventiva/commit/a50987a9843689244ce3004460f1395bf2615a97)
- [58f05d5 - clean-archive code graph](https://github.com/Resnovas/Eventiva/commit/58f05d5d8eee26f1987cb733ecb27abf84482fb1)

Both commits carry Jonathan's authorized author/sign-off and AI credit. GitHub reports both SSH signatures verified/valid. The worktree is clean.

Delivered portable principal/federated-subject/organization/membership/team/role/profile contracts; stable exact issuer/subject links with collision rejection; live SQL-authoritative tenant/resource authorization; agent authority intersected with live human and bounded delegation grants; and 11 identity administration/profile/audit actions through the existing Effect ActionHost. Additive PostgreSQL/SQLite 0002 migrations and the SQL identity adapter share EVE-42's captured client/transaction seam. Existing EVE-42/EVE-252 implementations were not changed. The existing migration test now selects its next scratch filename instead of colliding with the real 0002 migration. Runtime and portable contracts contain no provider SDK or vendor types.

### Executed evidence

- node --run verify: exit 0; check plus 68 successful lint/typecheck/test/build/parity tasks, then smoke for 3 projects (server, web browser smoke and Android Hermes export included).
- pnpm nx run-many -t test --projects=@eventiva/contracts-tests,@eventiva/runtime-tests,@eventiva/storage-tests --outputStyle=static: exit 0; 215 tests passed (62 contracts, 117 runtime, 36 storage), including 14 new grouped identity cases. Cache reused unchanged contracts/runtime results; storage reran successfully.
- Unchanged 90% coverage gates passed. Contracts: 100% all metrics. Runtime: 96.67% statements, 96.75% branches, 92.43% functions, 96.66% lines. SQL integration: 95.8% statements, 93.04% branches, 94.31% functions, 96.65% lines.
- node --run check: exit 0 again immediately before push, including 55 migration guard tests.
- sh tools/graphify/graphify check: graph.json matches committed code. Graph regenerated from clean git archive after detecting local extraction drift.
- Exact-head [CI](https://github.com/Resnovas/Eventiva/actions/runs/43732949566): verify, smoke and application check SUCCESS. [smartcloud](https://github.com/Resnovas/Eventiva/actions/runs/43732949591): house check and smartcloud SUCCESS. Exact-head rollup completed with no failures; CodeQL, workflow lint, Scorecard and graph refresh also succeeded. Release execution was skipped; no deployment/release was triggered manually.

Negative cases cover physical DB isolation; cross-tenant caller/store/routing/audit mismatches; forged kind/session/subject/onBehalfOf; viewer-agent and resource denials; expired/revoked human sessions/delegations/membership/grants; human confirmation before authorized agent writes; token issuer/audience/scope/time/mapping failures with synthetic verifier claims; link collisions; CAS races; replay revocation; corrupt records; unavailable schema/guard; audit outage rollback; receipt counts and profile privacy. PostgreSQL concurrency test observes the actual database lock wait before committing revocation. Only the already-approved disposable loopback PostgreSQL fixture was used; container/network removed, daemon stopped and fixture secret deleted. No production/Neon data or replication.

### Still blocked / not claimed

EVE-43 stays In Progress. Identity administration defaults OFF behind identity.foundation-enabled; the server shell remains fail-closed. StandardsTokenVerifier is an unimplemented backend seam, mocked in tests, not production crypto or working SSO. Trusted provisioning, session/link/delegation issuance and human-consent/approval adapters remain to implement and prove.

Keycloak 26.8.2 remains selected but its exact image batch is ON HOLD. The [read-only vetting](https://ampcode.com/artifacts/eve-43-keycloak-vetting-c328b8bc-d295-4781-88c1-f4fd7968cf99) reports 7 high/44 medium/17 low occurrences per architecture, incomplete digest-bound SBOM/unverified container signature and licence/vendor-triage gaps. It was never pulled/run/adopted here. oauth4webapi@3.8.8 remains unapproved and was not adopted. All Keycloak integration claims remain UNEXECUTED. Concrete standards adapters and outbound/inbound OIDC/SAML, SCIM direction/capabilities, federation/directories, account lifecycle/logout/rotation, MFA/step-up/consent, outages and independent Community/HA topology need separately approved components and executable proof. See docs/identity.md and ai-docs/src/15_identity.

Tool limitations: Graphify Cloud memory was not connected, so local graph/source evidence was used. The Amp-app Linear comment endpoint reported that its app is not installed; after verifying no duplicate comment, this explicitly attributed update uses the connected Linear API instead. No integration settings were changed.


### Comment 5d66b4b8-811a-4b50-908b-878fa09c90da

Author: jonathan@resnovas.com. Created: 2026-11-16T18:51:49.841Z; updated: 2026-11-16T18:51:49.798Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and) (comment ID above). Parent: None. Resolved: Not recorded.

## Binding owner decision — 2026-11-16

Approved: **one consolidated, SBOM-reviewed dependency approval batch** for the already selected **Keycloak 26.8.2** integration, including its **exact immutable container image digest** and the **necessary OIDC validation/integration dependencies**.

Implementation team: enumerate exact package names, versions, integrity/provenance, licenses, vulnerability/SBOM findings and immutable Keycloak image digest; validate and document the batch before use. This decision approves the reviewed batch approach, **not unspecified packages, mutable image tags, version upgrades, paid infrastructure, production provisioning or weakened security gates**. Continue provider-neutral Eventiva-owned identity, membership, authorization and audit implementation, then executable Keycloak/OIDC integration using the reviewed pinned components. Preserve existing provider-neutral contracts, self-hosted operation and approved Keycloak version. Escalate materially different dependencies or security findings for review.


### Comment efd5a3a9-1bbf-4fdf-afe9-ee48a6657840

Author: jonathan@resnovas.com. Created: 2026-11-16T19:02:54.415Z; updated: 2026-11-16T19:02:54.382Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and) (comment ID above). Parent: None. Resolved: Not recorded.

EVE-43 component-gate revalidation, 2026-11-16. AI level: autonomous. AI tool: Amp (the current model identifier is not exposed in this session). This is an agent report, not an owner risk acceptance.

Coordinator cleared exact source/test/docs reservations, with implementation conditional on clearing the consolidated component gate. No source edits, package installs, image-layer downloads, container execution, commits or pushes were made. EVE-43 remains incomplete.

Baseline: clean local HEAD = remote main = 52424de633827bbfbfbe9a33d96de5299597ca32. Revalidated at 19:01 UTC. curl metadata fetches plus sha256sum exactly reproduce Keycloak index c68e286cacd87b942ac1939a0a1481461109d6acd3a57dc496969a319a76bbf0 and amd64 4da21f9a53bcbac1026a0d654b740a81e98e5de4c45457076acc74b4d94b1551 / arm64 923a431c08971d49727a857e64870d8d63b5bf294a730e5dde729b5138c26c9e manifests.

Both fresh Quay scans: status=scanned; 526 features; 68 occurrences / 37 advisory IDs; 7 High, 44 Medium, 17 Low; five occurrences with scanner fix versions. cmp of sorted package/version/advisory/severity/fixedBy tuples exits 0. Guava 33.6.0-jre / GHSA-xxph-c9ww-hj94 still reported, fixed 33.7.2, and fresh OSV record is not withdrawn. Four MariaDB JDBC 3.5.10 findings report fixed 3.5.11. Keycloak range and RPM/vendor backport discrepancies remain unresolved. Complete digest-bound SBOM/licence review and verified producer authenticity are still not established. General reviewed-batch approval does not dispose of these material findings.

oauth4webapi@3.8.8 metadata matches prior exact integrity, MIT and zero declared runtime/peer/optional dependencies; fresh OSV/npm bulk queries both return {}. Full prior package provenance-verification gap remains open; no package code was downloaded or evaluated here. No fallback, substitute image/dependency, upgrade, EVE-251 crypto, production/settings/billing/infrastructure change or app activation.

Exact evidence, source URLs, commands/results, cleared paths, proposed integration-local session binding and central shared-wiring requirements: https://ampcode.com/artifacts/eve-43-component-gate-57f77ad8-ff26-4db4-88b1-e3896ff1dcdb . Raw JSON evidence bundle transferred to the coordinator; SHA-256 64ea382572bd9014a0ce084124d4cc88ba182f36c2af920e14d95446fe1f0866. No source diff/commit exists to integrate. Tests/types/integration/CI were not run for nonexistent new code.

Next action: resolve SBOM/authenticity/licence evidence and obtain explicit material-finding dispositions, or authorize a newly reviewed exact batch. Do not implement with held components. Amp-app Linear comment route is unavailable (app not installed); verified no duplicate before posting through connected Linear API. Graphify query reported not set up; Cloud memory/gateway discovery unavailable, so direct source/public registry evidence was used without modifying shared tooling.


### Comment edf6f796-b86a-4865-b40a-73bf8a4e1cf1

Author: jonathan@resnovas.com. Created: 2026-11-17T00:42:42.974Z; updated: 2026-11-17T00:42:42.905Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and) (comment ID above). Parent: None. Resolved: Not recorded.

Technical component gate revalidation - 2026-11-17. AI level: autonomous. Tool: Amp with two read-only research subagents; current model identifier is not exposed in this session. This is an agent technical finding, not owner risk acceptance.

Consolidated batch remains UNCLEARED; no adapter implementation, dependency installation/import, container execution, source edit, commit or push. Exact image remains quay.io/keycloak/keycloak@sha256:c68e286cacd87b942ac1939a0a1481461109d6acd3a57dc496969a319a76bbf0 with the prior amd64/arm64 manifests. Paths were re-coordinated with the central Eventiva thread; shared files and delivery remain central-owned. Local clean source is 52424de633827bbfbfbe9a33d96de5299597ca32; fetched and re-read remote main is b951a5abf445d957251214e4f14630867b20ef53, not imported here.

Material progress:
- oauth4webapi@3.8.8 exact tarball SHA512 + npm ECDSA registry signature pass. Existing gh attestation verify exits 0 against TUF-fetched roots, pinned source 916b97952dbf431d8b72f369840de54f5a286e4d, tag v3.8.8 and source-confirmed reusable signer panva/.github/.github/workflows/npm-release.yml@bd045b0d7d15f7827910cdedd3e7f0570bc5bf58, denying self-hosted runners. Packed MIT text, six-file inventory and no runtime/peer/optional dependencies confirmed; OSV/npm queries {}. Prior package provenance gap resolved, without separate adoption permission or vulnerability-absence claim.
- All eight image-layer size/digest checks pass. Official distribution SHA256 dd124787283918bc597628887168333465ee2a811a389e0003569e52be7e487f passes GPG signature verification (exit 0, VALIDSIG official fingerprint 861AB50E8CC6611FB6BC01A6B8F12EA26FD6EEBA). All 502 regular /opt/keycloak files on each platform match signed archive in both directions. This proves application correspondence, not full OCI/base/OS provenance. Official successful publishing job logs corroborate exact digests; signed OCI bundle remains unavailable in checked locations.
- Per platform, full 68-occurrence/37-ID register now dispositions 25 occurrences/12 IDs fixed, 8 occurrences/4 IDs not affected, 35 occurrences/21 IDs unresolved. All six PCRE2 High occurrences clear via exact Red Hat backport tuples; both Keycloak matches clear via primary ranges/tagged source. RPM dispositions remain conditional on scanned installed-build identity, not completed RPM signature authentication. Main combined validation checks all 37 rows/counts and exact PCRE2 tuples.

Narrow remaining technical blockers: Guava33.6 plus four MariaDB3.5.10 affected-version occurrences lack complete exact-artifact fixed/not-reachable proof; 30 RPM occurrences retain individual build/code applicability gaps (21 glibc, 3 libgcc, 6 other). Complete image SBOM/licence lineage and whole-image/OS provenance remain incomplete. File hashes/embedded POMs are not mislabelled a complete SBOM; independently generated complete inventory could close it, with no supplier-only requirement invented. Corrected licence simplifications: Nashorn includes Classpath exception; actual MySQL9.7 LICENSE includes extra permissions/FOSS exception while supplier notice embeds9.6 text. No blanket GPL incompatibility claim or legal clearance.

All three currently listed 26.8.2 respins were checked; older two retain same Guava/MariaDB affected versions on both platforms, no newer respin listed. No technically clear alternative exact batch was established; no upgrade, derived image, unrelated provider or EVE-251 crypto selected. Next input is exact-artifact technical dispositions plus full inventory/provenance, or a newly reviewed 26.8.2 supplier candidate, not an owner waiver.

Updated per-ID evidence/report: https://ampcode.com/artifacts/eve-43-component-gate-57f77ad8-ff26-4db4-88b1-e3896ff1dcdb (revision2). Transferable evidence archive delivered to coordinator .amp/in/orb-backup/eve43-component-evidence-20261117.tar.xz, 2,343,084 bytes, SHA256 4a87893216ae13f53bacc896251630739f262ba0f00f0044389995bdcb747bd5. Raw image/source archives are retained locally, excluded from transfer; manifests and hash receipts enable re-fetch. Existing metadata evidence checksum checks exit0. No application test/type/integration/CI success claimed because no adapter code was implemented. No production/settings/billing/infrastructure changes. Missing scanner/RPM tools and Graphify Cloud/gateway memory are recorded; existing verifier and primary evidence were used without installing substitutes.


### Comment f95261be-6166-4781-8e5d-f8cbe2a9ec96

Author: jonathan@resnovas.com. Created: 2026-11-17T07:22:23.589Z; updated: 2026-11-17T07:22:23.543Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and) (comment ID above). Parent: None. Resolved: Not recorded.

AI-authored EVE-43 exact-component gate update, 2026-11-17. Gate remains technically BLOCKED; no risk acceptance or architecture change.

Consolidated evidence: https://ampcode.com/artifacts/eve-43-component-gate-57f77ad8-ff26-4db4-88b1-e3896ff1dcdb (revision 3). Central coordinator owns repository plan/timeline mirrors and all shared wiring. This lane made no source/shared edits, installation, held-component execution, commit, push or deployment.

Exact reviewed candidate: Keycloak 26.8.2 index sha256:c68e286cacd87b942ac1939a0a1481461109d6acd3a57dc496969a319a76bbf0; amd64 sha256:4da21f9a53bcbac1026a0d654b740a81e98e5de4c45457076acc74b4d94b1551; arm64 sha256:923a431c08971d49727a857e64870d8d63b5bf294a730e5dde729b5138c26c9e. Sole proposed npm package remains oauth4webapi@3.8.8, MIT, no runtime/peer/optional dependencies; exact integrity, registry signature and pinned-source provenance verify. Consolidated batch is not cleared by that individual result.

Round-2 advisory results per platform: original 68 occurrences / 37 IDs now 48 fixed, 14 not affected at qualified scope, six unresolved for clearance. Previous 30 unresolved RPM occurrences resolve to 23 fixed, six not affected and one unresolved sed. Exact Red Hat signatures verify all 78 binary RPM and six SRPM headers; installed file authentication covers 3,394 amd64 / 3,392 arm64 package-file paths and every surviving regular JVM file. Two N dispositions (libgcc Rust demangler / SQLite zipfile) rely on authenticated supplier source/build/package evidence with binary corroboration, not independent exhaustive binary proof.

Remaining six: Guava 33.6.0-jre GHSA-xxph-c9ww-hj94 (all three deserialization capacity hooks unpatched); MariaDB 3.5.10 GHSA-4jq2-8v3c-97w8, GHSA-fhx5-2xqw-2cgm, GHSA-grfq-r75j-rw9x and GHSA-h599-m3w5-9m7x (actual affected implementations, including conditional XA/migration and ordinary selected-driver protocol paths); sed 4.8-10.el9 CVE-2026-5958 (exact authenticated source retains reported mechanism). Hostile live input/compromised servers were not demonstrated; absence of that demonstration is not a not-affected disposition. Named datasources default XA=true; intended PostgreSQL alone does not remove shipped vulnerable bytes.

All 502 application files/platform match signed Keycloak distribution; inherited UBI base signature verifies. Final OCI assembly/configuration is still not authenticated by verified producer provenance; unsigned BuildKit and publication logs do not supply that. Inventory covers 483 JARs / 97,990 internal entries, with 478 canonical-byte matches and all 480 coordinate-bearing JAR licence declarations resolved. Remaining mappings include Quarkus generated outputs, relocated JCTools, Swagger lock/source-map discrepancies, no-map/native/JVM source pedigree and per-file licence obligations. No supplier-only SBOM or independent-reproducible-build policy was invented.

No clear exact published 26.8.2 alternative was found among four active names/three known indexes. Safest next input: authenticated supplier-maintained patched 26.8.2 rebuild/new digest with remaining security, inventory/licence and producer evidence closed. Otherwise explicit approval is required for a self-maintained derived source build and its exact component batch. Guava 33.7.2-jre and MariaDB 3.5.11 are inspected fixed comparators, not approved replacements; zero lost previously resolvable static references does not prove runtime compatibility. Keycloak's exact docs do not support arbitrary built-in DB-driver overrides; no duplicate/shadow-JAR workaround is proposed.

Verification: sha256sum -c SHA256SUMS from each evidence directory exited 0 for 1,824 RPM + 1,460 inventory + 75 library records = 3,359 checks. Independent integration checks reconcile signature records, signed-file matches, inventory counts, exact index digest and 48F/14N/6U arithmetic. No adapter/full-suite/typecheck/integration/CI execution is claimed because implementation remains held. Local source clean at 52424de633827bbfbfbe9a33d96de5299597ca32; remote HEAD observed 05e07b6dee66cddb594c089959df45bbd9a4c0aa.

SessionId remains a non-secret correlation ID, never authentication proof. Future adapter must independently verify external credentials, fail closed without server-owned provider-session binding, deny copied/guessed IDs and expired/revoked proof, and leave tenant membership/action authorization/audit Eventiva-owned. Conditional five-file reservation remains untouched; EVE-251 is not implemented. Graphify Cloud/gateway memory and dedicated scanner/cosign/rpm/javap tools were unavailable; existing GPG/GitHub CLI and inert classfile/ELF readers supplied qualified evidence.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
