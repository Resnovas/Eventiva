<!-- linear:generated:start -->
# EVE-45: P1.6 Build the change flow: domain events and a durable resource change feed

[Live Linear source](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-17T07:01:07.416Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | In Progress (started) |
| Priority | 0: No priority |
| Labels | Code, Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-55](EVE-55.md), [EVE-64](EVE-64.md), [EVE-79](EVE-79.md), [EVE-89](EVE-89.md), [EVE-90](EVE-90.md), [EVE-95](EVE-95.md), [EVE-96](EVE-96.md), [EVE-100](EVE-100.md), [EVE-103](EVE-103.md), [EVE-114](EVE-114.md), [EVE-117](EVE-117.md), [EVE-119](EVE-119.md), [EVE-129](EVE-129.md), [EVE-131](EVE-131.md), [EVE-138](EVE-138.md), [EVE-145](EVE-145.md), [EVE-147](EVE-147.md), [EVE-152](EVE-152.md), [EVE-154](EVE-154.md), [EVE-155](EVE-155.md), [EVE-166](EVE-166.md), [EVE-169](EVE-169.md), [EVE-172](EVE-172.md), [EVE-174](EVE-174.md), [EVE-191](EVE-191.md), [EVE-198](EVE-198.md), [EVE-222](EVE-222.md), [EVE-229](EVE-229.md), [EVE-235](EVE-235.md), [EVE-260](EVE-260.md), [EVE-261](EVE-261.md) |
| Related to | [EVE-43](EVE-43.md), [EVE-61](EVE-61.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-72](EVE-72.md), [EVE-73](EVE-73.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-161](EVE-161.md), [EVE-195](EVE-195.md), [EVE-219](EVE-219.md), [EVE-243](EVE-243.md), [EVE-250](EVE-250.md), [EVE-253](EVE-253.md), [EVE-257](EVE-257.md), [EVE-258](EVE-258.md), [EVE-262](EVE-262.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Binding <issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" /> producer decisions — 2026-11-17

Jonathan approved all three producer semantics:

1. **Runtime restart identity:** every runtime restart creates a fresh durable runtime-incarnation UUID linked to a stable logical runtime identity. Never reuse an unfenced incarnation/session identity.
2. **Callback crash ambiguity:** callback success followed by a crash before durable result confirmation is recorded as unresolved and reconciled through an idempotency key and authoritative status/reconciliation path. Never replay blindly.
3. **Event meaning and provenance:** lifecycle events represent committed state transitions. Invocation attempts/outcomes are separate observations. Trusted producer binding comes from authoritative tenant, purpose, security profile, module version and generation; never infer identity or provenance from snapshots.

These decisions authorize implementation and tests within the existing safety, security and delivery gates.

## Goal

Anything that changes emits a typed event that the UI, the agent, sync, schedules and webhooks can all subscribe to, without losing events on restart.

## Context

* Phase-1 step 6 of the S2 capability map. Upstream reference at 6b5cf68: `event-bus/` (registerEvent with standard-schema), `resource-changes/` (durable change feed via a SQL function).

## Scope

1. Event definitions in Effect Schema, registered in an inventory like actions (P1.1).
2. In-process delivery on Effect `PubSub`; durable delivery through a transactional outbox table written in the same transaction as the change (P1.3).
3. A resource change feed per tenant with a cursor, so a client or agent can ask "what changed since X".
4. Write actions emit their event automatically from the receipt.

## Acceptance criteria

* A test kills the process between commit and delivery and proves at-least-once delivery after restart with one applied observer effect per event/subscription id through durable idempotency; delivery itself is not claimed exactly once.
* A cursor read returns exactly the changes after the cursor, scoped to the tenant.

## Constraints

Effect-TS v3; works on Postgres and SQLite; no new dependency without approval here; ship to main with check results.

## Done signal

Merged with the restart test green.

## Modular-platform observation-only hooks (2026-11-15)

Canonical spec [https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c](<https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c>). This issue owns durable domain/resource/module/platform lifecycle observations; do not create another hook/event engine. Hooks are after-commit observations and additive side effects, NEVER authorization, blocking guard/veto, transaction control or trigger input/result mutation. Failures/retries do not rerun or change the originating action. Event envelope carries stable event id/version, tenant-safe reference, correlation/causation, module/version/generation; no secrets/plaintext protected data. Actual event/Hook public names follow the active lane handoff.

Owned active paths: packages/contracts/src/hook.ts, packages/runtime/src/hook.ts, tests/contracts/src/hook.spec.ts, tests/runtime/src/hook.spec.ts. Shared export-map hold for @eventiva/contracts/hook and @eventiva/runtime/hook. Production outbox dispatcher/store/app wiring requires a separate coordinated checkpoint; an in-memory PubSub or callback is not durable proof.

Observer/subscription lifecycle must explicitly register/validate/activate/pause-or-drain/deactivate/unregister with Scope cleanup and no duplicate registration; retries have independent idempotency, bounded backpressure, per-resource ordering, dead-letter/quarantine and operator replay. Pinned module/version/generation persists across retry; revocation is rechecked at delivery. platform.ready is produced once per runtime generation durably and repeated ready returns emitted:false; observer delivery may repeat, durable consumer dedup proves one applied banner effect. Keep registration of observers before ready; word-art work starts only after verified ready.

Security: registration grants no decrypt access. Protected profiles/assurance floors from <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" />/251 apply. Sensitive metadata is minimized; Restricted/Vault arbitrary third-party subscriptions default deny, never raw payload/reference enabling unauthorized reads. No untrusted callbacks inside decrypting transaction or emergency/live-control path. <issue id="5beffe53-7de1-44a4-9d23-3166327dc2b1" label="EVE-253" href="https://linear.app/resnovas/issue/EVE-253/build-shared-guided-sop-procedures-and-governed-step-execution" /> forbids autonomous incident/alarm actuation of dispatch/audio/lights/PA/emergency; observer may notify/propose only, separately approved human action is required.

Acceptance: crash after commit/before delivery, crash after side effect/before ack, multi-runner claim/fence/replay and backpressure/revocation tests prove at-least-once delivery plus idempotent effects, tenant cursor isolation and no source rerun; lifecycle removal drains safely; redaction tests cover hook/outbox/error/dead-letter/log/projection. Durable outbox binding and authorized production release fail closed until supplied. <issue id="b025ea11-9298-48b2-9bd4-d44decabcab4" label="EVE-261" href="https://linear.app/resnovas/issue/EVE-261/integrate-the-modular-platform-and-prove-every-owner-required" /> remains open until these run. AI-authored planning addition; no package/provisioning approval.

## Explicit hook-delivery dependency and protected event gate (2026-11-15)

<issue id="afb95d96-359d-4c0f-a462-a7ce41e2c988" label="EVE-262" href="https://linear.app/resnovas/issue/EVE-262/implement-governed-observation-only-execution-and-lifecycle-hooks-with" /> owns typed observation-only hook enrollment/dispatch policy; this issue owns atomic domain-state/outbox commit, durable event/version record, per-tenant cursors, subscription-specific idempotent worker retries, bounded queue/backpressure, poison-message dead letter, safe checkpoint/cancel/replay and multi-runner lease/fencing integration. Subscriber execution always after authoritative commit, never blocking original transaction, and failed observer never re-executes original operation. Check latest grant/revocation and data-classified redaction at delivery; event metadata itself may be protected. Test crash before/after enqueue, duplicate delivery, loss/recovery, disabled subscription, worker redeploy, critical emergency timing and protected-data non-disclosure. Process-local PubSub delivery alone does NOT pass readiness.

## Nonduplicating hook issue split and written API

Coordinator created <issue id="afb95d96-359d-4c0f-a462-a7ce41e2c988" label="EVE-262" href="https://linear.app/resnovas/issue/EVE-262/implement-governed-observation-only-execution-and-lifecycle-hooks-with" /> for governed subscription/dispatcher/protected gateway implementation; this issue retains durable producer/outbox/change-feed storage and recovery. One shared engine, no duplicate registry. <issue id="afb95d96-359d-4c0f-a462-a7ce41e2c988" label="EVE-262" href="https://linear.app/resnovas/issue/EVE-262/implement-governed-observation-only-execution-and-lifecycle-hooks-with" /> tentative HookDefinition/HookSubscription prose maps to actual HookDeclaration/HookPin/HookEvent contracts; do not create duplicate API names. The active hook lane paths are implemented under that increment; durable SQL adapter still belongs this issue's coordinated integration.

Written API: HookPin/HookObservation/HookEvent/HookDeclaration/HookClaim/HookSettlement; HookModuleIdentity/HookCapability/HookDeliveryState; HookDenied/HookOutboxFailure/HookObserverFailure; HookReleasePolicy.authorize, HookOutbox.stage/claim/settle, fail-closed HookReleaseDeny/HookOutboxUnavailable, hookReleaseRequirements/hookFlag default false. Runtime HookSink.deliver, HookSinkUnavailable, HookDispatcher.register scoped -> dispatch/drain, HookDispatcherLive. Pin {tenant,owner:{module,version,generation},hook,revision}; nonnegative observation generation uses actual kernel snapshot (register normally advances first module from0 to1), never blanket preactivation0. Serving/workflow pins need verified ready generation. Production durable stage/fencing/reclaim/capacity/dedup/CAS/dead-letter remain adapter obligations, not volatile model proof.

## Linear comments (10)

### Comment c6ad40a3-c6aa-4eb5-9b58-8ddf9c3ce87e

Author: GitHub. Created: 2026-10-31T22:31:33.093Z; updated: 2026-10-31T22:31:33.052Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/812). All replies are displayed in both locations.


### Comment 140f657f-2f59-4d8c-a16d-ff92551b8b4c

Author: jonathan@resnovas.com. Created: 2026-11-16T10:41:00.050Z; updated: 2026-11-16T10:41:00.005Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change) (comment ID above). Parent: None. Resolved: Not recorded.

Amp (OpenAI GPT-6.1 Sol), autonomous implementation checkpoint. Remote main read-back is 8334eaba15e687d8756e232de4a952182622790b after the owner-prioritized source-reference prerequisite. Live roadmap read-back confirms EVE-243/244 Done; EVE-261 and EVE-260 remain acceptance-blocked. This unblocked EVE-45 slice adds tenant-local committed change-feed cursors to the existing paired SQL outbox, independently of subscriptions, with additive migration 0004 for PostgreSQL/SQLite. Verification will cover commit visibility/order, rollback, dedup, tenant isolation, reconnect and malformed reads. No production release policy, sink, credentials, flag enablement, deployment or remote migration is included. Broader durable lifecycle publication and EVE-261 acceptance remain open.


### Comment dd3713c0-548e-4ad6-8353-ee6caf6da2e0

Author: jonathan@resnovas.com. Created: 2026-11-16T10:56:26.399Z; updated: 2026-11-16T10:56:26.335Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change) (comment ID above). Parent: None. Resolved: Not recorded.

Amp (OpenAI GPT-6.1 Sol), autonomous verified EVE-45 checkpoint, ready for authorized direct-main push.

Signed local commits: 73d081298204d4e1ffb33b8db6ebd4e6993f6805 (tenant committed change-feed cursors) and 382de8523ad786cdaf602b5503d2c852177b1e43 (clean-archive graph refresh). Both signatures read back G. No production deployment, migration, release policy/sink, flag enablement, dependency, billing or settings change.

Verification on this candidate: timeout 20m node --run verify exited 0; 85 Nx lint/typecheck/test/build/parity tasks passed (62 cache hits), source/declaration boundaries had 0 violations/cycles, smoke succeeded for server and web plus Android export. pnpm exec vitest run --config tests/storage/vitest.config.mts passed 96/96 across 4 files; coverage 96.41% lines / 93.17% branches / 93.29% functions. Both dialects passed real post-commit SIGKILL then fresh-process exact cursor/event reads. node --run check, pnpm nx sync:check, changed-file Prettier and git diff --check passed. sh tools/graphify/graphify check reports graph.json matches committed code. Approved disposable PostgreSQL fixture and generated credentials were removed.

Scope: observer-independent facts in the paired transaction/savepoint, tenant commit-ordered cursor allocation, strict committed bounded reads and resourceHookProvider.feed; additive migrations 0004 preserve existing deliveries. SQLite reader locking was corrected; upgrade uses migration-first/fresh-client rollout because the pinned SQLite driver caches failed pre-DDL prepares. No historical order/backfill is invented. Bounded review found no concrete blocker, with explicit proof limits.

EVE-45 remains open for automatic receipt/lifecycle producers and authorized consumer/release/sink integration; EVE-260/261 remain acceptance-blocked. No design decision blocks this isolated slice. Full evidence and review limits: https://ampcode.com/artifacts/durable-change-feed-delivery-8219b3a6-b1d3-4f5b-b221-9aba60bae596 . Remote SHA and CI follow-up will be appended after push.


### Comment 63302120-c578-4578-9e51-f9e9abe881d3

Author: jonathan@resnovas.com. Created: 2026-11-16T10:59:54.485Z; updated: 2026-11-16T10:59:54.354Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change) (comment ID above). Parent: None. Resolved: Not recorded.

Amp agent delivery update: pushed signed code https://github.com/Resnovas/Eventiva/commit/73d081298204d4e1ffb33b8db6ebd4e6993f6805 and separate graph https://github.com/Resnovas/Eventiva/commit/382de8523ad786cdaf602b5503d2c852177b1e43 directly to main under standing authorization. Independent git ls-remote matched exact head 382de8523ad786cdaf602b5503d2c852177b1e43; clean worktree.

Observer-independent minimized facts and commit-ordered tenant cursors are atomic with the existing SQL outbox. Added committed bounded feed reads and additive SQLite/PostgreSQL 0004 migrations. No production migration/consumer/endpoint/release activation occurred. Migration-first, reopened clients and old-producer quiescence precede consumer enablement; no historical order is invented.

pnpm exec vitest run --config tests/storage/vitest.config.mts: 96/96, 96.41% line coverage. timeout 20m node --run verify: exit 0, 85 Nx tasks, zero boundary violations/cycles, server/web/Android-export smoke. Both dialects passed post-commit SIGKILL/fresh-process exact-event probes. node --run check, Prettier, diff check, Nx sync check and graph check passed. Native Android execution not claimed; disposable fixture removed.

Remote smoke and house CodeQL passed; application verify remains running at read-back: https://github.com/Resnovas/Eventiva/actions/runs/43853323824 . Exact-head monitoring enabled. Full evidence/review limits: https://ampcode.com/artifacts/durable-change-feed-delivery-8219b3a6-b1d3-4f5b-b221-9aba60bae596 . EVE-45 remains open for automatic receipt/lifecycle producers, release/consumer/sink policy and broader proofs; no design decision blocked this slice.


### Comment 67bfd22d-8bec-4df3-8b51-11b2f586637d

Author: jonathan@resnovas.com. Created: 2026-11-16T13:53:53.258Z; updated: 2026-11-16T13:53:53.202Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change) (comment ID above). Parent: None. Resolved: Not recorded.

Amp agent (OpenAI GPT-6.1 Sol), 2026-11-16: delivered the safe unblocked EVE-45 recovery checkpoint directly to main under the owner's standing authorization.

Commits:
- a61e29d053e00ad2652dc244d96de3eb2acfe0b6: https://github.com/Resnovas/Eventiva/commit/a61e29d053e00ad2652dc244d96de3eb2acfe0b6 - authorized minimized dead-letter inspection and atomic operator replay in the existing outbox.
- 52424de633827bbfbfbe9a33d96de5299597ca32: https://github.com/Resnovas/Eventiva/commit/52424de633827bbfbfbe9a33d96de5299597ca32 - clean-source graph refresh.
Both signatures verified G. Independent git ls-remote confirms remote main at 52424de633827bbfbfbe9a33d96de5299597ca32, with a clean worktree.

Coverage: replay preserves event/pinned generation/stable sink key, fences old workers, retains terminal attempt/reason, uses idempotent request UUIDs, reserves existing bounded capacity and requires stream quiescence. Fresh operator authorization is separate from live delivery release; both default denial and post-replay delivery revocation are tested. Additive 0005 migrations only; no production migration or activation.

Executed verification:
- node --run check: pass.
- timeout 20m node --run verify: exit 0; 85 successful lint/typecheck/test/build/parity tasks across 28 projects plus dependency, zero boundary violations/cycles, server/web smoke and Android export pass. Export is not native execution.
- pnpm exec vitest run --config tests/storage/vitest.config.mts: 102/102, five files, SQLite and PostgreSQL; 96.37% lines / 91.90% branches / 93.61% functions, unchanged thresholds.
- Targeted hook tests 39/39; affected Nx build/lint/typecheck 12 tasks pass; formatting/diff/committed-graph checks pass.
- Committed real-process proof races independent workers, SIGKILLs after claim commit and after synthetic sink commit/before acknowledgement, waits for real database-clock expiry, reclaims with fresh fences, rejects stale settlements, and asserts one applied synthetic sink effect / stable key / one origin execution. It proves at-least-once delivery plus sink-implemented durable idempotency, not exactly-once delivery or production sink acceptance.
- Bounded skeptical review found no concrete replay security/concurrency/migration blocker. Cross-process operator-request races and injected mid-redrive crashes are not independently exercised.
- Disposable approved loopback PostgreSQL fixture/network/credential file removed.

Remote CI currently running: https://github.com/Resnovas/Eventiva/actions/runs/43879973536 (application); https://github.com/Resnovas/Eventiva/actions/runs/43879973753 (house CodeQL). Exact-head CI subscription enabled; remote green not yet claimed. Earlier tenant-feed head 382de852 subsequently passed all reported checks.

Remaining acceptance / owner decision: do not close EVE-45 or EVE-261. Automatic receipt producers lack authoritative module/version/generation/classification binding. Durable lifecycle/platform.ready cannot honestly be derived from local ready receipts or snapshot differences. Decide (1) fresh persisted runtime incarnation per restart versus resuming a durably fenced identity/generation; (2) idempotent/reconcilable callbacks versus explicit unresolved-operation handling after callback success/crash before journal commit; and (3) actual transition observations including cascades/disposal versus successful invocation observations, with trusted tenant/resource/purpose/profile assignment. No guessed identity, blind callback replay or synthetic automatic-producer claim was added.

No native/UI ready consumer execution, production release/sink acceptance, Keycloak package/image decision, EVE-250/251 architecture, deployment/billing/settings/dependency change. Graphify Cloud/gateway unavailable; local graph, repository and pinned vendor sources used.

Full evidence and review limitations: https://ampcode.com/artifacts/durable-change-feed-delivery-8219b3a6-b1d3-4f5b-b221-9aba60bae596


### Comment 16dcbe3e-6920-4f40-9804-51f986e03494

Author: jonathan@resnovas.com. Created: 2026-11-16T13:57:22.582Z; updated: 2026-11-16T13:57:22.555Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change) (comment ID above). Parent: 67bfd22d-8bec-4df3-8b51-11b2f586637d. Resolved: Not recorded.

Amp CI follow-up for exact main head 52424de633827bbfbfbe9a33d96de5299597ca32: application CI completed successfully (verify, smoke, application check), https://github.com/Resnovas/Eventiva/actions/runs/43879973536 ; gh run watch --exit-status exited 0. House CodeQL also passed: https://github.com/Resnovas/Eventiva/actions/runs/43879973753 . Smartcloud, Graphify, workflow lint, Scorecard and release configuration completed successfully. The separate Code Quality workflow remains running: https://github.com/Resnovas/Eventiva/actions/runs/43879972511 . Exact-head monitoring continues; not claiming every remote workflow green yet. Independent final git ls-remote still matches the signed graph head; worktree clean. Producer/ready/native/production blockers from the parent comment remain unchanged.


### Comment d5a6ad7f-1dca-4314-9223-f29180efbb7a

Author: jonathan@resnovas.com. Created: 2026-11-16T14:08:29.611Z; updated: 2026-11-16T14:08:29.553Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change) (comment ID above). Parent: 67bfd22d-8bec-4df3-8b51-11b2f586637d. Resolved: Not recorded.

Amp final CI update: GitHub's final exact-head event for 52424de633827bbfbfbe9a33d96de5299597ca32 confirms all executed checks passed. Previously pending Code Quality analysis succeeded at 2026-11-16T14:07:19Z: https://github.com/Resnovas/Eventiva/actions/runs/43879972511 . Application verify/smoke/aggregate, house CodeQL, Smartcloud and remaining executed house checks all succeeded; only normally inactive release/branch-specific jobs were skipped. No failure or corrective code change is needed. EVE-45/EVE-261 remain open for the previously recorded automatic-producer/lifecycle contracts and native/production evidence; CI success does not resolve them. Evidence ledger updated: https://ampcode.com/artifacts/durable-change-feed-delivery-8219b3a6-b1d3-4f5b-b221-9aba60bae596


### Comment 87a83e28-c28e-4cf3-b685-00a1d4ce419c

Author: jonathan@resnovas.com. Created: 2026-11-16T19:29:52.490Z; updated: 2026-11-16T19:29:52.435Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change) (comment ID above). Parent: None. Resolved: Not recorded.

Amp (OpenAI GPT-6.1 Sol), autonomous implementation evidence - 2026-11-16.

Prioritized the shared durable engine before dependent producer/demo work. Reproduced simultaneous tenant/request UUID reuse under independently locked PostgreSQL subscriptions: the losing replay incorrectly returned unavailable. The SQL unique-key arbitration now returns conflict before touching delivery reset; SQLite/PostgreSQL regression and injected reset-failure rollback pass. No migration.

Fresh central execution: `bash .amp/in/orb-backup/run-storage.sh bash -c 'node tests/storage/fixtures/hook-process.mjs proof sqlite && node tests/storage/fixtures/hook-process.mjs proof postgres'` exited 0. Both emitted hook-process-recovery-passed with attempts=3, applied=1, originRuns=1, operatorReplay={acknowledgementLost:true,retryAccepted:false,historyRecords:1,terminalAttempts:4,preservedAttempt:2}. Real distinct processes and SIGKILL after replay commit/before acknowledgement preserve one history record and a fresh attempt-2 lease/deadline. Stable sink keys and stale fences hold; arbitrary external sinks are NOT exactly-once. Runtime incarnation/resumption, interrupted nontransactional callbacks and authoritative transition/producer-observation binding remain unresolved. EVE-45 stays open.

Central verification on this exact source tree: `bash .amp/in/orb-backup/run-storage.sh node --run verify` exited 0. Nx: `Successfully ran targets lint, typecheck, test, build, parity for 28 projects and 1 task they depend on`; smoke succeeded for 3 projects plus 12 dependency tasks (server, web, Android export, not native execution). Source graph: 143 files/480 edges/28 packages, zero violations/cycles; declaration boundaries: 57 files/zero violations. Root check, changed-file Prettier, Nx sync:check, diff checks and clean-source Graphify check passed. No thresholds or authorization guards were weakened.

Signed commits: [replay arbitration aa2c34ea](https://github.com/Resnovas/Eventiva/commit/aa2c34ea0c116100aa7058ac530651e9e1617f71), [exchange/trust foundations 804a0cec](https://github.com/Resnovas/Eventiva/commit/804a0cec7a4460072fe7834eedb3c0a04d735c31), [graph b951a5ab](https://github.com/Resnovas/Eventiva/commit/b951a5abf445d957251214e4f14630867b20ef53). One authorized direct-main push succeeded; independent ls-remote exactly matched b951a5abf445d957251214e4f14630867b20ef53 and worktree was clean. [Exact-head application CI](https://github.com/Resnovas/Eventiva/actions/runs/43939734542) and [Code Quality](https://github.com/Resnovas/Eventiva/actions/runs/43939733486) are running, NOT yet claimed green. Exact-head rollup subscription a845e5f9-bbc9-4afe-b3d7-15e3f9030220 is active.

No new dependency/image use, deployment, production migration/consumer activation, billing or settings change. EVE-43 component validation remains blocked, not provider selection. Concrete cryptographic composition and durable producer semantics remain gated. Detailed central ledger: https://ampcode.com/artifacts/durable-change-feed-delivery-8219b3a6-b1d3-4f5b-b221-9aba60bae596 .


### Comment f5134f37-6be2-4b6e-82a6-6d564e205b4b

Author: jonathan@resnovas.com. Created: 2026-11-16T19:33:43.918Z; updated: 2026-11-16T19:33:43.898Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change) (comment ID above). Parent: 87a83e28-c28e-4cf3-b685-00a1d4ce419c. Resolved: Not recorded.

Amp (OpenAI GPT-6.1 Sol), exact-head CI follow-up: [application CI](https://github.com/Resnovas/Eventiva/actions/runs/43939734542) completed successfully for [b951a5ab](https://github.com/Resnovas/Eventiva/commit/b951a5abf445d957251214e4f14630867b20ef53), including verify, smoke and application check; gh run watch --exit-status exited 0. House CodeQL, Smartcloud, Graphify, workflow lint, Scorecard and release configuration also completed successfully. The separate [Code Quality scan](https://github.com/Resnovas/Eventiva/actions/runs/43939733486) remains in progress, NOT yet green; exact-head subscription a845e5f9-bbc9-4afe-b3d7-15e3f9030220 remains active. Independent ls-remote still matches the signed head and the worktree is clean. No workflow rerun, deployment, setting or production action was triggered.


### Comment 2beb8288-c096-488d-80cd-a87f132bb8d5

Author: Amp. Created: 2026-11-17T01:11:54.570Z; updated: 2026-11-17T01:11:54.497Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change) (comment ID above). Parent: None. Resolved: Not recorded.

Agent delivery evidence, 2026-11-17 01:12 UTC. 9cf1ebde proves a trusted synthetic consumer atomically commits metadata sink markers and cursor, loses an acknowledgement after SIGKILL, resumes without duplicates, and rolls back both before commit. Both dialects finish cursor2/applied2/duplicates0 across three processes. Does not establish native consumer acceptance, automatic producer semantics, arbitrary exactly-once or production release. Three producer decisions remain open.

Delivered directly to main under the owner's standing authorization. Exact independently confirmed remote head: https://github.com/Resnovas/Eventiva/commit/7aeaa8dcb1cab1b63a6bab5421fe7e3ef56ebbc0 . All five signatures read G. Central combined command (approved disposable loopback PostgreSQL17.12 fixture): bash .amp/in/orb-backup/run-storage.sh bash -c 'pnpm exec vitest run --config tests/storage/vitest.config.mts && node --run verify' exited0: storage155/155, unchanged coverage96.45% lines/92.85% branches/93.15% functions;85 Nx lint/typecheck/test/build/parity tasks and smoke passed. Exact committed clean clone node --run check and clean-source sh tools/graphify/graphify check passed. A working-tree root rerun correctly reported next-lane LLMS drift; it was not suppressed or included in the pushed snapshot. Exact-head CI subscription is active, remote CI pending. No production migration/deployment, component/dependency adoption or external release occurred.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.

2026-11-17 EVE-262/EVE-45 slice 2 adds fixture-only current release policy after
restart and authorized redrive. Original state/receipt/fact content remains
committed once; denied work reaches no sink, while an independent allowed control
retains durable key deduplication. See [the hook guide](../../hooks.md#verify-current-release-permission-after-restart)
and [timeline checkpoint](../timeline.md#hook-release-reauthorization-slice-2---2026-11-17)
for execution evidence and remaining limits. EVE-45 remains In Progress;
production release and broader governed-consumer acceptance remain separate.
