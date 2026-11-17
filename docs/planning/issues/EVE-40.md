<!-- linear:generated:start -->
# EVE-40: P1.1 Build the action contract and inventory in Effect Schema

[Live Linear source](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:41.008Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Done (completed) |
| Priority | 0: No priority |
| Labels | None recorded |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | [EVE-14](EVE-14.md), [EVE-23](EVE-23.md) |
| Blocks | [EVE-52](EVE-52.md), [EVE-56](EVE-56.md), [EVE-64](EVE-64.md), [EVE-68](EVE-68.md), [EVE-74](EVE-74.md), [EVE-75](EVE-75.md), [EVE-81](EVE-81.md), [EVE-82](EVE-82.md), [EVE-88](EVE-88.md), [EVE-94](EVE-94.md), [EVE-96](EVE-96.md), [EVE-97](EVE-97.md), [EVE-98](EVE-98.md), [EVE-100](EVE-100.md), [EVE-101](EVE-101.md), [EVE-106](EVE-106.md), [EVE-112](EVE-112.md), [EVE-114](EVE-114.md), [EVE-128](EVE-128.md), [EVE-129](EVE-129.md), [EVE-130](EVE-130.md), [EVE-133](EVE-133.md), [EVE-138](EVE-138.md), [EVE-143](EVE-143.md), [EVE-145](EVE-145.md), [EVE-146](EVE-146.md), [EVE-147](EVE-147.md), [EVE-166](EVE-166.md), [EVE-170](EVE-170.md), [EVE-172](EVE-172.md), [EVE-173](EVE-173.md), [EVE-177](EVE-177.md), [EVE-181](EVE-181.md), [EVE-184](EVE-184.md), [EVE-204](EVE-204.md), [EVE-235](EVE-235.md), [EVE-252](EVE-252.md), [EVE-257](EVE-257.md), [EVE-258](EVE-258.md), [EVE-259](EVE-259.md) |
| Related to | [EVE-17](EVE-17.md), [EVE-39](EVE-39.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-61](EVE-61.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-144](EVE-144.md), [EVE-167](EVE-167.md), [EVE-169](EVE-169.md), [EVE-171](EVE-171.md), [EVE-191](EVE-191.md), [EVE-244](EVE-244.md), [EVE-250](EVE-250.md), [EVE-251](EVE-251.md), [EVE-253](EVE-253.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Binding action-boundary approval — 2026-11-14

Jonathan approved this architecture on 2026-11-14 after the <issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />, <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />, <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> and <issue id="57425d1f-fae5-49c9-af1e-51cd26f64d20" label="EVE-244" href="https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation" /> research review. This is architecture approval only: it does not start implementation, approve unlisted dependencies, provision services, change spending limits, or re-enable paid AI gates.

The action contract belongs in `@eventiva/contracts`, separate from Effect handlers. Portable specifications contain stable IDs, Effect Schema inputs/outputs, typed errors, descriptions, permissions, approvals and side-effect classes. Feature-owned handlers register one-to-one against those specifications and execute through `@eventiva/runtime`.

UI, mobile MDT, desktop/web, built-in/external agents and HTTP/MCP/ACP/other adapters are thin interfaces over the same authorized runtime invocation. The runtime resolves current identity and delegation for every call, enforces permissions/approvals, applies idempotency, emits audit/receipts and never exposes a privileged agent path. Capability parity means every supported operation is discoverable across interfaces under the caller's actual permissions.

Registration is scoped and all-or-nothing with typed duplicate/compatibility errors. Dynamic modules can register and unregister actions and manifests safely; disposal removes registrations and resources without changing core. Provider wire names may adapt stable canonical IDs without changing their meaning.

This supersedes any text that puts action definitions in the schema package, embeds backend handlers in client-imported specifications, or duplicates UI/agent logic.

## Goal

Every capability in Eventiva is one action, defined once in Effect Schema, listed in one inventory used by every supported surface (UI, HTTP, MCP, ACP, Effect AI Toolkit adapters and CLI).

## Context

* Phase-1 step 1 of the [S2 capability map](<https://linear.app/resnovas/document/s2-agent-native-capability-map-and-protocol-conformance-matrix-9a000bdd8953>). Upstream reference: BuilderIO/agent-native `@agent-native/core@0.222.2` (6b5cf68), root files of `packages/core/src` (defineAction, caller, invocation, receipts, input coercion, output contract, action-ui, framework tools), `shared/`, `json-schema/`.
* <issue id="07c58289-6f1c-488e-a130-5f718b473fce" label="EVE-14" href="https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory" /> (S1) proves the shape on one action; this issue builds the real package from its result.
* <issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" /> creates the portable contracts, shared schema and backend runtime boundaries. Action specifications live in `@eventiva/contracts`; handlers and invocation live in `@eventiva/runtime`.

## Scope

1. `defineAction` taking an Effect Schema input and output, a typed error union (`Data.TaggedError`), required permissions, approval policy (none, confirm, always), side-effect class (read, write, external) and a description written for the agent.
2. An inventory service (`Context.Tag`) listing every action with its metadata; registration fails at startup on duplicate names.
3. Provider-safe JSON Schema derived from the Effect Schema, carrying upstream's quirks from `json-schema/` (no unions at the root, flattened composed schemas, string formats the providers accept).
4. Action receipts: every call returns a receipt (who, what, input hash, outcome, duration) consumed by audit (P1.4) and the agent (P1.8).
5. A parity check (`nx` target) that fails when an action has no description, no permission, or is not reachable from every registered surface.

## Acceptance criteria

* Three sample actions (one read, one write, one external) defined and listed; JSON Schema output for each matches a committed snapshot accepted by Anthropic, OpenAI and Google tool schemas (snapshot test per provider rule).
* Duplicate registration and a missing description each fail with a typed error in a test.
* The parity target runs in `verify` and is required through CI's `application check`; root `node --run check` remains dependency-free for the Smartcloud house job.

## Constraints

Effect-TS v3 house rules; no zod; no new dependency without Jonathan approving it on this issue; ships to main per the AGENTS.md delivery exception with `node --run check` results pasted here.

## Done signal

Package merged to main, sample actions green in CI, and a comment here listing the public API.

## Linear comments (9)

### Comment a85de3fc-abd8-44bd-8efa-ab8e8093184a

Author: GitHub. Created: 2026-10-31T22:31:24.198Z; updated: 2026-10-31T22:31:24.178Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/807). All replies are displayed in both locations.


### Comment fa3a5b15-87a8-4b1d-a41b-ea89e9beb12a

Author: jonathan@resnovas.com. Created: 2026-11-14T22:01:56.117Z; updated: 2026-11-14T22:01:56.070Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema) (comment ID above). Parent: None. Resolved: Not recorded.

## PROPOSAL - product decision cards (not approved)

These cards preserve the approved three-package architecture and the single authorized action path. They do not authorize implementation, dependencies or spending.

### Settled requirements - do not reopen

- Portable Effect action specifications are separate from feature-owned handlers; every UI, MDT, agent and protocol adapter uses the same runtime invocation.
- Identity and delegation resolve on every call; authorization is coarse-before-decode and resource-specific-after-decode.
- Approval policy can raise but never lower an action's floor. Only an interactive human can approve; an agent cannot approve its own call.
- Every mutating action has an idempotency key. The authoritative mutation and idempotency result are persisted together. Replays cannot double-apply.
- Every outcome has a receipt/audit record. PowerSync/Yjs does not create a bypass around the server Effect action.

### A1 - Integrity transaction boundary (most consequential)

**Recommend:** one authoritative transaction commits the domain mutation, idempotency record, state transition/history, outbox event and successful receipt together. Authorization and approval are rechecked before returning a replayed result. Keep financial, payment, ticket, stock and dispatch idempotency records for the business record's lifetime; lower-risk records may expire only after the compatibility/audit window.

**Alternatives:** separate stores or a short universal TTL.

**Consequences:** retries, runner failover, webhooks and offline MDT uploads cannot duplicate charges, allocations, stock deltas or dispatch transitions. Separate stores are simpler initially but permit partial success and ambiguous retries.

### A2 - Human and AI approval policy

**Recommend:** direct human low-risk reversible actions need no second confirmation; agent writes default to `confirm`; irreversible, financial, permission, payment/refund, ticket-capacity, stock-commitment and live-production actions use `always` with fresh human approval/step-up. Bind approval to principal, tenant, action version, canonical input hash, maximum amount/quantity and expiry. A planned batch may use one approval only when the exact item set and aggregate limits are bound.

**Alternatives:** confirm every write, or let each tenant lower defaults.

**Consequences:** agents remain useful for routine work while money, scarce capacity and live operations cannot be silently committed. Tenants may raise policy, never lower the action floor.

### A3 - Offline MDT, dispatch and scheduled execution

**Recommend:** ordinary reversible edits may queue offline. Guarded stock, tickets, assignments and lifecycle changes queue only an intent carrying expected version/state plus idempotency key; the server revalidates and conflicts become an explicit user task, never silent last-write-wins. Payments and live show/dispatch control are online-only. A dispatch request may queue only with an action-specific deadline and must never execute after expiry. Scheduled work stores `notBefore`, deadline, dependency state and approved bounds; execution rechecks permission, approval validity, capacity and state.

**Alternatives:** auto-apply queued guarded changes, or forbid all offline writes.

**Consequences:** MDT users can keep working without falsely promising tickets, stock, payment or live-control success. Production dependencies fail closed instead of executing stale instructions.

### A4 - Audit availability

**Recommend:** writes and privileged/sensitive reads fail closed when their durable receipt cannot be recorded. Low-risk reads may proceed only through a bounded local audit spool with a visible degraded-health signal and eventual persistence; exhausting the spool fails closed.

**Alternatives:** fail every call closed, or treat audit as best effort.

**Consequences:** integrity operations remain provable without turning a temporary audit outage into a total read outage. Best-effort audit would contradict EVE-43.

**Owner decisions requested:** approve/amend A1-A4. The auth-provider choice remains a separate EVE-43 card.


### Comment aba96798-42e6-4502-b8c0-7f18b6ca6b35

Author: jonathan@resnovas.com. Created: 2026-11-14T22:07:19.773Z; updated: 2026-11-14T22:07:19.750Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema) (comment ID above). Parent: None. Resolved: Not recorded.

## APPROVED - three offline execution categories (2026-11-14)

Jonathan approved this policy as the Eventiva default. This approval is limited to the three categories below; A1, A2, A4 and every S-card remain proposals unless separately approved.

1. **Routine work:** crew task/status updates, checklists and notes may queue durably offline and synchronize with visible conflicts.
2. **Authoritative operations:** dispatch allocation, stock reservations, ticket capacity and payment/financial commitments require an authoritative service. Offline preparation is allowed, but an unconfirmed allocation or commitment must never be shown as successful.
3. **Safety-sensitive operations:** show control and safety-critical output follow explicitly approved procedures, current authorization, and validated local-execution/degraded-mode requirements. Offline access never relaxes safety policy.

Tenants may configure policy where safe. Mandatory safeguards are immutable and cannot be weakened by tenant configuration, feature flags, agents or offline mode.

This aligns with [EVE-71](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) and [EVE-147](https://linear.app/resnovas/issue/EVE-147/f77-build-the-incident-control-log-and-dispatch-for-live-events): crew status/log work may queue, while dispatch assignment remains authoritative and online-only; safety-critical control needs a separate validated safety case.


### Comment a412365e-b4df-4172-a316-606b06a7e763

Author: jonathan@resnovas.com. Created: 2026-11-14T22:35:34.990Z; updated: 2026-11-14T22:35:34.955Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema) (comment ID above). Parent: None. Resolved: Not recorded.

## APPROVED - A1 integrity transaction boundary (2026-11-14)

Jonathan approved A1 as recommended.

For each successful authoritative mutation, one transaction atomically commits:

- the domain change;
- the deduplication/idempotency result;
- the state transition and append-only history;
- the outbox event; and
- the receipt/audit record.

Retries and replays revalidate current authorization and any required approval before a stored result is returned. Idempotency evidence for payments, ticketing, stock and dispatch is retained for the lifetime of the business record.

This decision binds the action runtime to [EVE-39](https://linear.app/resnovas/issue/EVE-39/make-every-entity-action-idempotent-and-persisted-by-default) and the transactional storage work in [EVE-42](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state). It preserves the separately approved three offline execution categories: a queued intent is not an authoritative success.

A2, A4 and S1-S4 remain PROPOSAL unless separately approved. This is a product decision, not implementation authorization.


### Comment 072035e4-79b2-4f1e-a6f2-9e73ec239e1f

Author: jonathan@resnovas.com. Created: 2026-11-15T01:06:41.345Z; updated: 2026-11-15T01:06:41.331Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema) (comment ID above). Parent: None. Resolved: Not recorded.

## Durable architecture diagrams and batched decisions

The editable decision sheet and Mermaid sources are here: [Eventiva architecture decisions](https://ampcode.com/artifacts/eventiva-architecture-decisions-3169b540-652d-4795-ae9c-7ad78a534f17).

Rendered diagrams:
- [Platform topology](https://ampcode.com/artifacts/visuals/eventiva-platform-topology-642e7f6c-7f4c-4a0a-9b8a-a3238de5488d)
- [Regional marketplace cells](https://ampcode.com/artifacts/visuals/regional-marketplace-cells-53e16fa9-4142-491a-a36a-b190ce591e90)
- [Marketplace decryption gates](https://ampcode.com/artifacts/visuals/marketplace-decryption-gates-ee91fc95-83c9-4a15-8662-80b11dabb75d)
- [Marketplace award sequence](https://ampcode.com/artifacts/visuals/marketplace-award-sequence-e6c99855-c5e6-41d0-8587-00bfb92a289d)

Approved and proposed elements are labelled separately. This documentation does not authorize implementation, dependencies, algorithms, infrastructure or spending.


### Comment 27ba8b10-2a34-41e6-be67-1e2eaa9e0061

Author: jonathan@resnovas.com. Created: 2026-11-15T01:16:20.836Z; updated: 2026-11-15T01:16:20.807Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema) (comment ID above). Parent: None. Resolved: Not recorded.

## Implementation-readiness audit — 2026-11-15

EVE-40 is not ready to implement yet. EVE-23 must finish, and A2, A3 and A4 remain proposal-only. EVE-40 requires **no new dependency**: provider JSON Schema checks can use Effect's schema output and a structural subset check; AJV remains optional and unapproved.

Safe work after EVE-23: inventory, JSON Schema generation and all-or-nothing registration. Approval fields/gate await A2; command/deadline semantics await A3; receipt failure/spool semantics await A4. Action parity belongs in `verify`/the required `application check`, not root `node --run check`, because the house check installs no application dependencies.

Current batched decisions and corrections: [Eventiva architecture decisions](https://ampcode.com/artifacts/eventiva-architecture-decisions-3169b540-652d-4795-ae9c-7ad78a534f17). No implementation or dependency approval is created by this comment.


### Comment ed996139-45e9-4c0d-ab14-2a5f0f19afdc

Author: jonathan@resnovas.com. Created: 2026-11-15T01:44:33.600Z; updated: 2026-11-15T01:44:33.583Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema) (comment ID above). Parent: None. Resolved: Not recorded.

## APPROVED — A2, A3 and A4 foundation policy (2026-11-15)

Jonathan approved all three together.

### A2 — Human and AI approvals
Direct human low-risk reversible writes need no extra confirmation. Agents may execute only preauthorized bounded routine work under the caller's live scopes; other agent writes default to `confirm`. Irreversible, financial, payment/refund, permission, ticket-capacity, stock-commitment and live-production actions require `always` with fresh human approval/step-up as applicable. Approval binds principal, tenant, action/version, canonical input/hash, amount/quantity limits and expiry; batches bind exact items and aggregate limits. Tenants may raise but never weaken the floor. Agents cannot self-approve.

### A3 — Offline, MDT and scheduled execution
Routine reversible edits durably queue as pending. Guarded assignments, stock, tickets and lifecycle work queue explicit intents with expected state/version, idempotency key and deadline, then receive online authoritative revalidation and visible conflicts—never silent LWW. Payments and live dispatch/show control are online-only unless a separately validated safety-specific local profile governs its own behavior. Expired dispatch instructions never execute. Scheduled jobs recheck `notBefore`, deadline, dependencies, permissions, capacity, state and approval validity, and preserve immutable baseline versus live forecast.

### A4 — Audit outage
Mutations and privileged/sensitive reads fail closed if their durable receipt cannot be recorded. Low-risk reads may use only a capacity-bounded durable local audit spool with visible degradation and eventual persistence; exhaustion fails closed. Protected audit is never best effort.

### Acceptance tests
- Agent self-approval, stale approval, wrong principal/tenant/action/version/input, expired approval and bound-limit overflow are denied.
- A batch changed after approval is denied; tenants can raise but cannot lower the floor.
- Guarded offline intents reject stale state visibly; expired dispatch never runs; scheduled work rechecks every gate at execution.
- Mutations and sensitive reads fail when receipt persistence fails; low-risk reads spool durably until capacity and then fail closed; recovery drains exactly once.

Architecture approval only: no new dependency, provider, infrastructure, spending or security exception is approved. [Decision sheet](https://ampcode.com/artifacts/eventiva-architecture-decisions-3169b540-652d-4795-ae9c-7ad78a534f17).


### Comment 113741bc-14bd-483f-ae51-af9ae630366c

Author: jonathan@resnovas.com. Created: 2026-11-15T04:00:56.705Z; updated: 2026-11-15T04:00:56.653Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema) (comment ID above). Parent: None. Resolved: Not recorded.

Delivery report by Amp (GPT-6.1 Sol), AI level autonomous. Code is pushed directly to main under Eventiva's standing delivery exception; both commits are signed/signed-off and GitHub reports verification reason valid.

- Feature: https://github.com/Resnovas/Eventiva/commit/6c94cdb10b42873aac172e5111ffa1f4a6fde63a
- Separate Graphify refresh / remote-verified main head: https://github.com/Resnovas/Eventiva/commit/1eb9715203f5a9d9887488d2d5276f1445c3c5e1

Public API:
- @eventiva/contracts/action: ApprovalPolicy, Risk, approval/risk/sensitive defaults; specifications remain separate from handlers.
- @eventiva/contracts/inventory: ActionInventory, metadata, validateDefinitions/validateInventory/validateParity and typed errors.
- @eventiva/contracts/json-schema: Provider, make, UnsupportedSchema; structural profiles for three providers with read/write/external snapshots. Unsupported transformations fail explicitly, not silently widened; no live-provider certification claimed.
- @eventiva/contracts/receipt: portable Receipt schema/type.
- @eventiva/runtime/host: execute returns result/receipt/replayed/audit; invoke projects the same authorized engine.
- @eventiva/runtime/invocation: IdentityResolver, InputDigest, ExecutionPolicy, Approvals, Integrity, Audit, invocation intent/results/errors and FailClosed. /testing exposes clearly volatile TestOnly fixtures only.

Executed evidence:
- node --run verify: passed; 20 projects and 60 lint/typecheck/test/build/parity tasks, then smoke for 3 projects plus 10 dependency tasks (server, Android Hermes export, browser smoke).
- Contracts: 59 tests passed, three snapshots, 100% statements/branches/functions/lines.
- Runtime: 109 tests passed; coverage statements 95.09%, branches 96%, functions 90.43%, lines 96.01%; all thresholds pass. Includes A1-A4 negatives, replay races/rollback and a disposal-during-integrity-wait regression that failed before its fix.
- node --run check: passed; pinned toolchain, surfaces, all 74 source headers and LLMS current.
- pnpm nx sync:check; node tools/dev/surfaces.mjs check; node tools/ai-docs/docgen.mjs --check; git diff --check: passed.
- Real test-source typechecks passed for both tests/contracts/tsconfig.json and tests/runtime/tsconfig.json: pnpm exec tsc -p <project> --noEmit --rootDir . --rewriteRelativeImportExtensions false --pretty false. This supplements the pre-existing disabled Nx noEmit test targets (separately suggested for follow-up).
- sh tools/graphify/graphify update --force; sh tools/graphify/graphify check: passed; graph matches committed code.
- Rebase on latest origin/main (7df42178), remote ref verification, both commit signature checks and clean-worktree check passed.

A1 mutations return their exact Integrity-committed receipt; replays revalidate live gates and receive a fresh audit receipt. Integrity/Audit remain provider-neutral; their exact API and landed commits were handed to EVE-42. Server remains fail-closed until separately integrated durable storage. No application dependencies/lockfile, storage/guard files, provider selection, feed delivery, budgets or security policy changed. Canonical docs are docs/actions.md and ai-docs/src/12_actions/index.md.

Disclosed deviation: initial Graphify setup installed its local Python tooling outside the repository despite the no-install instruction; no application dependencies were installed and no further installation occurred. Graphify Cloud/gateway were unavailable; local graph/source and direct Context7 were used. The Amp Linear-app comment route was unavailable, so this explicitly attributed report uses the connected Linear tool. Generic commit trailers were corrected locally without shared setting changes.

CI for exact head 1eb9715203f5a9d9887488d2d5276f1445c3c5e1 is subscribed (69cd4432-fff2-4b74-9215-9b9921721e4a). Status is In Review pending CI, not Done yet. Full evidence/storage API: https://ampcode.com/artifacts/eve-40-delivery-evidence-d4bfe0ff-5979-40ff-9ca5-ef1069c35bfb


### Comment 012a2492-86d7-44a8-af3a-6e1c85905294

Author: jonathan@resnovas.com. Created: 2026-11-15T04:02:45.423Z; updated: 2026-11-15T04:02:45.371Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema) (comment ID above). Parent: None. Resolved: Not recorded.

Amp (GPT-6.1 Sol), autonomous: final CI confirmation for pushed head 1eb9715203f5a9d9887488d2d5276f1445c3c5e1. All required checks passed, including application check, verify, smoke, house check, smartcloud, workflow lint and CodeQL. The default-branch Graphify check and unconfigured release jobs were skipped; Graphify refresh passed. No failed checks and no corrective change required.

CI: https://github.com/Resnovas/Eventiva/actions/runs/43674717915
House: https://github.com/Resnovas/Eventiva/actions/runs/43674717798

The issue's done signal is now met: delivered to main, sample/provider/security tests green in CI, and public API documented in the earlier delivery comment. Moving EVE-40 to Done. Production durable Integrity/Audit wiring remains separately owned by EVE-42, with server invocation fail-closed until integrated. No deployment or provisioning performed.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
