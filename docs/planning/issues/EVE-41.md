<!-- linear:generated:start -->
# EVE-41: P1.2 Build app config, settings, secrets and credentials

[Live Linear source](https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-17T01:11:16.700Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | In Progress (started) |
| Priority | 0: No priority |
| Labels | Code, Decision: Audit needed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-53](EVE-53.md), [EVE-74](EVE-74.md), [EVE-88](EVE-88.md), [EVE-116](EVE-116.md), [EVE-117](EVE-117.md), [EVE-130](EVE-130.md), [EVE-139](EVE-139.md), [EVE-151](EVE-151.md), [EVE-157](EVE-157.md), [EVE-158](EVE-158.md), [EVE-174](EVE-174.md), [EVE-183](EVE-183.md), [EVE-184](EVE-184.md), [EVE-192](EVE-192.md), [EVE-209](EVE-209.md), [EVE-213](EVE-213.md), [EVE-226](EVE-226.md), [EVE-231](EVE-231.md), [EVE-259](EVE-259.md), [EVE-261](EVE-261.md) |
| Related to | [EVE-20](EVE-20.md), [EVE-61](EVE-61.md), [EVE-63](EVE-63.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-99](EVE-99.md), [EVE-103](EVE-103.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-119](EVE-119.md), [EVE-146](EVE-146.md), [EVE-172](EVE-172.md), [EVE-187](EVE-187.md), [EVE-189](EVE-189.md), [EVE-190](EVE-190.md), [EVE-193](EVE-193.md), [EVE-251](EVE-251.md), [EVE-257](EVE-257.md), [EVE-260](EVE-260.md), [EVE-262](EVE-262.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

One place for configuration, per-user and per-tenant settings, and secrets and credentials that agents can use without ever seeing them.

## Context

* Phase-1 step 2 of the S2 capability map. Upstream reference at 6b5cf68: `app-config/`, `settings/`, `secrets/`, `credentials/` in `packages/core/src`.
* Credentials are what user-owned AI subscriptions (<issue id="a904aa60-b3c7-4bfa-8d2d-995d1e679389" label="EVE-20" href="https://linear.app/resnovas/issue/EVE-20/s7-find-which-ai-providers-allow-users-to-bring-their-own-subscription" />) and external connections hang off.

## Scope

1. App config resolved through Effect `Config` and validated by Effect Schema; no environment-variable feature switches (house feature-flags rule).
2. Settings store with scopes user, tenant and app, each setting declared with a schema and exposed as read and write actions (P1.1).
3. Secrets store: encrypted at rest with a key from config, write-only to the UI, never returned in action output, prompts, logs or telemetry (a redaction test proves this).
4. Credentials: a secret bound to an endpoint, owner and scope, with expiry and revocation; agent tools receive a handle, not the value, and the HTTP client resolves it at call time.

## Acceptance criteria

* A test sets a secret, uses it through a credential handle in an outbound call against a stub server, and asserts the value appears in no log, span, action output or agent message.
* Revoking a credential makes the next call fail with a typed `CredentialRevoked` error.
* Settings read and write actions appear in the inventory and pass the parity check.

## Constraints

Effect-TS v3; no vendor secret manager coupling (a port with an in-database default); no new dependency without approval here; ship to main with check results.

## Done signal

Merged to main with the redaction test green, and a comment listing the setting and credential actions.

## Modular-platform implementation increment (2026-11-15)

Canonical spec: [https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c](<https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c>). Preserve the full settings/credential scope above; this adds the required kernel bootstrap seam. Decode versioned external manifests/composition with Schema; load deployment/provider config through Config and layer-local ConfigProvider, never raw env reads in features. ModuleDefinition.validate is typed Effect, uses redacted failures and performs no feature mutation. Instance Config is namespaced by {module,instance}; no mutable global provider choice. Secrets use Config.redacted/Redacted or opaque credential handles and cannot appear in Schema errors, JSON/string/inspect/Cause trees, prompts, telemetry, projections or events. Invalid required config fails before any module registration/layer publication; valid config composes two independent provider instances.

Acceptance evidence: valid and invalid bootstrap/config matrices, unknown/missing fields, revoked/expired credential handles, secret canary negative serialization at every named surface, no partial registration and no provider-instance contamination. Config settings are not feature flags or authorization. Pure portable schemas/ports in contracts; any secret provider in integrations, wiring in app composition. Reserve concrete new paths with coordinator before coding; shared manifests/generated docs stay held. <issue id="ceb453e5-ab8e-4566-bf54-47d742b0f425" label="EVE-257" href="https://linear.app/resnovas/issue/EVE-257/implement-the-composable-module-kernel-and-safe-lifecycleprovider" /> can checkpoint its validate seam before full credential-store delivery, but full <issue id="b025ea11-9298-48b2-9bd4-d44decabcab4" label="EVE-261" href="https://linear.app/resnovas/issue/EVE-261/integrate-the-modular-platform-and-prove-every-owner-required" /> acceptance remains blocked on this evidence. AI-authored planning addition; no package/crypto/provisioning approval implied.

## Modular extensions: configuration, capability and secret boundary (2026-11-15)

Extensions declare typed, versioned, namespace-scoped config defaults and overrides; validation occurs before activation and on hot update, with audit, safe rollback, feature-flag gate and no raw env/secret access. Tenant/user settings use authorized actions. Subscriptions to <issue id="afb95d96-359d-4c0f-a462-a7ce41e2c988" label="EVE-262" href="https://linear.app/resnovas/issue/EVE-262/implement-governed-observation-only-execution-and-lifecycle-hooks-with" /> events never grant decryption, credentials or keys. Restricted/Vault event projection is a separate policy-mediated, minimally disclosed service; credentials are resolved only by approved adapters and revoked before any subsequent side-effect delivery. Test malicious config, logs/spans/console leakage, revoked grants, failure to validate, isolated module instances and pre-telemetry bootstrap redaction. Align <issue id="4f5ecaa3-aedf-446d-8993-0c07c98d4bb4" label="EVE-251" href="https://linear.app/resnovas/issue/EVE-251/decide-marketplace-service-attestation-and-cryptographic-trust" /> and <issue id="ceb453e5-ab8e-4566-bf54-47d742b0f425" label="EVE-257" href="https://linear.app/resnovas/issue/EVE-257/implement-the-composable-module-kernel-and-safe-lifecycleprovider" />. No provider/dependency authorization implied.

## Linear comments (2)

### Comment de378562-4733-405f-9f5e-92a112f8a431

Author: GitHub. Created: 2026-10-31T22:31:26.230Z; updated: 2026-10-31T22:31:26.153Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/808). All replies are displayed in both locations.


### Comment 20e7a385-0f7b-4803-ba15-8e5eccc6f097

Author: Amp. Created: 2026-11-17T01:11:53.215Z; updated: 2026-11-17T01:11:53.194Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials) (comment ID above). Parent: None. Resolved: Not recorded.

Agent delivery evidence, 2026-11-17 01:12 UTC. 8ed84b95 preflights all private composition candidates before publication/acquisition. New dependent A-valid/B-invalid test failed before fix; kernel39/39 passes including retries/interruption/redacted defects. This does not complete credential storage/actions/rotation or wider configuration product scope.

Delivered directly to main under the owner's standing authorization. Exact independently confirmed remote head: https://github.com/Resnovas/Eventiva/commit/7aeaa8dcb1cab1b63a6bab5421fe7e3ef56ebbc0 . All five signatures read G. Central combined command (approved disposable loopback PostgreSQL17.12 fixture): bash .amp/in/orb-backup/run-storage.sh bash -c 'pnpm exec vitest run --config tests/storage/vitest.config.mts && node --run verify' exited0: storage155/155, unchanged coverage96.45% lines/92.85% branches/93.15% functions;85 Nx lint/typecheck/test/build/parity tasks and smoke passed. Exact committed clean clone node --run check and clean-source sh tools/graphify/graphify check passed. A working-tree root rerun correctly reported next-lane LLMS drift; it was not suppressed or included in the pushed snapshot. Exact-head CI subscription is active, remote CI pending. No production migration/deployment, component/dependency adoption or external release occurred.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
