<!-- linear:generated:start -->
# EVE-34: Agent runs restart from scratch when their shard moves

[Live Linear source](https://linear.app/resnovas/issue/EVE-34/agent-runs-restart-from-scratch-when-their-shard-moves) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-17T12:33:32.212Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Code, Decision: Audit needed, Delivery: Implementation pending, Fix |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-18](EVE-18.md), [EVE-21](EVE-21.md), [EVE-22](EVE-22.md), [EVE-35](EVE-35.md), [EVE-36](EVE-36.md), [EVE-37](EVE-37.md), [EVE-38](EVE-38.md), [EVE-39](EVE-39.md), [EVE-42](EVE-42.md), [EVE-45](EVE-45.md), [EVE-47](EVE-47.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-142](EVE-142.md), [EVE-252](EVE-252.md), [EVE-261](EVE-261.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

An agent run (long-lived, multi-step, streaming) survives a shard move or runner loss by resuming from its last completed step, never by re-running finished steps.

## Context

* Found in <issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" />. Evidence: `/mnt/project-files/eve-18/` (scenario folders `drain` and `killnorestart`, `analysis.txt`, "long jobs" section).
* A persisted 25s entity RPC (`Long`) stood in for an agent run. With @effect/cluster 0.56.4:
  * SIGTERM of the owning runner: the runner waits up to `entityTerminationTimeout` (15s default) for the handler. When the run had more than 15s left it was interrupted (`long-interrupted`) and the new owner started it again from the beginning (first drain run: interrupted at +15s, restarted on the other runner, finished 25s later).
  * SIGKILL: the run restarted from the beginning on the surviving runner 36s later (killnorestart: start 22:21:51, restart 22:22:39, done 22:23:04).
* The caller still got one reply, so the reply is at-least-once-executed, exactly-once-replied. Any side effects inside the run (LLM spend, tool calls, emails, DMX output) would happen twice.
* <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> D3: sharding takes priority over agent convenience, so the fix belongs in how agent runs are modelled, not in pinning entities.

## Work

1. Model an agent run as an `@effect/workflow` workflow driven by `ClusterWorkflowEngine` (already in `@effect/cluster` 0.56.4; `@effect/workflow` is already a dependency of `packages/platforms/postgresql`). Each model call and each tool call is an `Activity` with an idempotency key of `runId:stepIndex`.
2. The run entity only starts, signals and queries the workflow; it never awaits the whole run inside a handler.
3. Add an Effect test with `@effect/vitest` and `TestRunner` (or two SQL runners against a test Postgres) that kills the owning runner between step 2 and step 3 and asserts steps 1 and 2 ran once and step 3 ran once after recovery.

## Acceptance

* The kill test passes; activity execution counts are asserted, not logged.
* A short doc in `ai-docs/src` explains "agent run = workflow; activity = one model or tool call; idempotency key = runId:step".

## Out of scope

Choosing the model provider, the streaming transport (see the streaming issue), Kubernetes.

## Done signal

Test green in `node --run check`; comment on this issue with the test name and its output.

## Linear comments (3)

### Comment 8353a937-8688-4b53-87e7-edabeb9aece4

Author: GitHub. Created: 2026-10-31T22:29:48.459Z; updated: 2026-10-31T22:29:48.410Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-34/agent-runs-restart-from-scratch-when-their-shard-moves) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/801). All replies are displayed in both locations.


### Comment 01bffbbf-3f7b-433e-9397-e964b555037c

Author: jonathan@resnovas.com. Created: 2026-11-17T12:03:57.708Z; updated: 2026-11-17T12:03:57.576Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-34/agent-runs-restart-from-scratch-when-their-shard-moves) (comment ID above). Parent: None. Resolved: Not recorded.

## Readiness evidence and proposed implementation packet - 2026-11-17

Agent-authored analysis by Amp. No files changed, implementation started, reservations acquired, issue statuses/relations changed, or tests executed. This is a proposed bounded packet, not owner approval or acceptance evidence.

### Goal

Deliver the server-local durable run/step foundation shared by EVE-34 and EVE-54, with an execution-count proof that completed model/tool Activities are not re-executed when a runner dies between steps 2 and 3. Do not close a legacy agent bug by adding only another synthetic Workflow fixture.

### Context and verified source

Analysis base: Eventiva checkout HEAD 22c13a08a76ffc0efc2077c0404a37ab90950fc4. Read the linked readiness analysis, current EVE-34/54/47/35/36 descriptions and all their comment pages (terminal, one existing comment each), EVE-18 owner decision/comments, EVE-252 description and all six comments, and relevant EVE-37/38/39/42/52 bodies. Source inspections:

- apps/server/src/backend.ts:44-81 accepts registerWorkflows, constructs the authorized host inside authenticated TenantRouter routing, and exposes the Cluster path only.
- apps/server/src/cluster.ts registers ClusterWorkflowEngine with the SQL-backed transport and gates runner registration/assignment until registrations complete. Reuse that gate and eventiva-actions group; no second engine or background detached entity fiber.
- apps/server/tests/sql-fixture.mjs:124-135 and 274-291 define FixtureRecovery with exactly ONE Activity, commit-business-action. The after barrier is inside that Activity, after ActionHost business commit but before Activity reply.
- apps/server/tests/two-runners.mjs:189-210 and 264-292 assert one domain/history/outbox/dedup/receipt result across SIGTERM/SIGKILL and automatic recovery. They do NOT assert model/tool Activity entry counts or a three-step checkpoint. Business dedup can conceal a repeated Activity body.
- Scoped search for AgentRun or AgentSession in active apps/packages source found no matches. main is an inventory diagnostic, not a running application ingress. Production agent loop is EVE-52, currently Backlog; its model SDK dependency approval is separate.
- Pinned server dependencies are Cluster 0.60.5 and Workflow 0.19.1, not the legacy paths/versions named here. Installed source confirms Workflow.execute(payload, {discard:true}) returns an execution id; Activity RPCs are persisted and keyed by activity name/attempt within the execution. Activity.idempotencyKey hashes execution/name; it is NOT literally the requested business runId:step key.

### Reconciliation and sequence

1. EVE-34 owns the first durable run/step checkpoint, as a prerequisite portion of EVE-54, not a competing run manager. EVE-54 retains the full queued/running/approval/completed/failed/cancelled lifecycle, cancellation from HTTP/MCP/ACP, stale-run reaping, schedule/event starts, mid-write replay safety and persisted kernel composition/provider/schema pins plus owner fencing. Its EVE-18 dependency is Done; the usable EVE-42 SQL seam and EVE-252 Phase B are already delivered checkpoints, not whole-issue completion.
2. EVE-47 remains the aggregate: a real user request, approved authorized write, kill/resume and one agent-for-user audit entry requires the EVE-52 loop and other agent subissues. A scripted step executor validates the durable core, not that end-to-end acceptance.
3. EVE-35 explicitly consumes AgentRun from this issue. EVE-34's run handle must start/discard, query and signal/interrupt without waiting for the run lifetime. EVE-35 then adds AgentSession/conversation routing and the measured under-1-second cancel-while-busy contract. Do not independently build two run abstractions or count a short Start reply as EVE-35 completion.
4. EVE-36 explicitly consumes Activities from this issue. Preserve stable run/step identity and typed results so its later output log can use tenant/run/offset and coordinate result/event commits. Durable output storage, gap/duplicate cursor tests and notification/transport are NOT supplied by this packet. EVE-35 and EVE-36 are downstream, not parallel independent starts against an unsettled run model.
5. EVE-18's 2026-10-31 owner sequence was platform gaps 37/38/39 before 34/35/36. The later binding EVE-252 reset decision explicitly re-scopes those legacy tickets and stages feature runs over the new backend. Use its current registration, typed configuration and A1 action dedup; do not resurrect archived compose paths or copy EVE-39's business-key-as-RPC-primaryKey proposal, which the current docs reject for replay security. Preserve EVE-38's unaccepted latency/SLA work separately; this kill test asserts correctness within a bounded convergence deadline, not a new production SLA.

### Smallest implementation scope

- One server-local reusable AgentRun workflow/handle registration, backed only by the existing ClusterWorkflowEngine and its persisted messages. One lightweight control entity per tenant-namespaced run; long work belongs in the Workflow. Register both before the existing readiness gate opens. The existing registerWorkflows seam is the first choice, not a root bootstrap rewrite.
- Typed Effect step execution with one Activity per model call or tool/action call. A required injected model-call port permits deterministic tests without adopting a provider/AI SDK. Tool writes use ClusterActions -> the existing authorized ActionHost and tenant Storage, never fixture SQL as the business executor. The future EVE-52 loop uses this same path; no second implementation in tests.
- Persist the immutable accepted run input/definition identity needed for replay, including caller/tenant and stable ordered step identities. Bind a logical tenant/run id to that accepted input; duplicate start of the same input returns the same run, while changed input under the same run id is a typed conflict, not a second hidden workflow or cached success. Reuse existing tenant-routed Storage/Integrity primitives; no new generic store, dependency, shared contract package or migration framework.
- Document a fixed step-number convention (recommend 1-based), stable Activity names within the workflow execution, and the separate business/provider key runId:stepIndex, scoped by tenant. Retries/runner placement must not change it or incorporate attempt/runner ids. Intentional later calls allocate new step indices. Only pure/replay-safe orchestration sits outside Activities.
- Keep live identity/permission/approval/deadline/state checks at effect boundaries; completed step results are internal recovery data, not permission to return cached confidential results to a newly unauthorized caller. Run control/status operations must recheck access too. Mandatory production services are injected or fail closed.
- EVE-54's selected module/provider/schema generation and distributed lease/fence requirements are NOT discharged by passing opaque pins or using local Kernel.workflow counters. This packet can prove fixed-definition scripted run recovery without touching kernel mutation owners. Do not enable module-bound production runs until exact persisted pin resolution/fencing is wired and tested. No silent latest-generation fallback.

### Exact proposed path reservation

Request these paths from the coordinator before implementation; this comment does not acquire them:

- NEW apps/server/src/agent-run.ts (run/step schemas, typed services, Workflow and short run-handle entity/registration; keep the cohesive first slice in one file).
- NEW apps/server/tests/agent-run.spec.ts (@effect/vitest public-contract tests and exact typed schemas/services).
- EXISTING apps/server/tests/sql-fixture.mjs (compose the real run source; durable raw execution counters and a test checkpoint barrier).
- EXISTING apps/server/tests/two-runners.mjs (between-step kill/count assertions and restart controls).
- EXISTING apps/server/tests/runner-process.mjs (only if the existing extraCommands seam cannot carry required typed run-control commands; otherwise unchanged).
- EXISTING docs/cluster.md and ai-docs/src/14_cluster/index.md (run/workflow/Activity/key semantics, commands, limits and EVE-34/54 split).

apps/server/src/backend.ts and cluster.ts are READ/REUSE dependencies, not preemptively reserved edits: the registration callback already exists. If actual composition requires an edit, obtain a specific extension first. No apps/server project/package/tsconfig changes are expected: existing test discovery and uncached cluster-conformance already cover these paths.

Do not touch packages/contracts/src (T-767bce45), root/Nx/CI, documentation checker/ratchet/planning generators, kernel mutation-owner source/tests (T-66e90dd6), LLMS.md, graphify-out, or shared debt/planning outputs. The coordinator owns later canonical planning mirror updates, docgen/Graphify and combined delivery. This analysis leaves the repository mirror intentionally unchanged under the explicit no-file-change instruction; the new Linear comment is newer evidence pending that coordinated mirror refresh.

### Validation / done signal for this bounded checkpoint

Proposed decisive test name: agent-run resumes after SIGKILL between completed steps 2 and 3 without re-executing completed Activities.

1. Start two distinct Node runner PIDs using the existing isolated PostgreSQL fixture, require complete disjoint shard ownership and registered run/workflow handlers. Execute three sequential, asymmetric steps through the NEW reusable run source, not a separate fixture-only workflow.
2. Count every raw model/tool executor entry durably, before any business dedup check, keyed by tenant/run/step and retaining PID/order. Use append-only entries or an increment, NOT a unique row/upsert-do-nothing which would hide duplicates. These counters are test instrumentation, independent of business transaction rollback.
3. Gate after the step-2 Activity result has been durably acknowledged and yielded back to orchestration, before step 3 is dispatched/entered. An in-Activity after-business-commit barrier is not this checkpoint. Verify persisted completion, counts [1,1,0], and the owning runner PID before sending external SIGKILL. Keep test synchronization in fixture instrumentation, not a production environment-variable switch or a fixed timing sleep.
4. Do not restart the victim, call Workflow.resume, or submit Start again to cause recovery. Observe survivor takeover and automatic progress. Release the checkpoint safely for recovered work. Require final counts [1,1,1], step 3 on a different PID after takeover, correct ordered data-dependent output, and one business/history/outbox/dedup/success-receipt set for each writing step. A no-fault control must return the same output. Changing Activity naming or restarting from step 1 must fail the count assertions.
5. Repeat the between-step case for graceful drain, and verify completion/counts survive a total process restart into Community mode. Keep the existing after-write/before-Activity-reply case separate: an unfinished Activity may execute again, while its authorized A1 business write still commits once. Never generalize completed-step counts into exactly-once external model spend/email/device output.
6. Focused typed tests reject changed-input duplicate starts, cross-tenant run access, invalid step data and missing execution services; revoke identity/permission or make approval newly required between steps and require the next protected effect to be denied without an extra business write. No cached result/control path bypasses live access checks.

Planned commands (NOT run in this analysis): pnpm nx run @eventiva/server:cluster-conformance; pnpm nx run @eventiva/server:test; pnpm nx run-many -t lint typecheck build -p @eventiva/server; node --run documentation; node --run check; coordinator runs combined node --run verify. Root check currently runs guards/docs, not the server kill test: it must not be reported as kill-test evidence by itself, and this lane must not edit the reserved root gate. Record actual test name/count output, target/fixture, commit and limitations on EVE-34; keep EVE-54/47 open.

### Prerequisites, out of scope and escalation

Ready to assign as a bounded foundation implementation after coordinator path clearance and explicit checkpoint/acceptance handoff; not a claim that production AgentRun integration or all of EVE-34/54/47 is complete. No new product choice or question only Jonathan can answer blocks this packet. Routine file allocation, naming and test barriers belong to engineering, not the owner.

Before executing SQL tests, provide the already approved disposable loopback eventiva_test PostgreSQL fixture, current built server/dependencies and free fixture ports; do not use Neon/production. The EVE-42 image exception expires 2026-11-22 UTC or earlier on its stated trigger. Renewal or a different unapproved dependency/image requires Jonathan only if needed then. Model/provider SDK adoption, real EVE-52 turn orchestration, EVE-54 module pin/fence integration, AgentSession latency, durable streams, HTTP/MCP/ACP cancellation, reaping/schedules, native work, provisioning, production activation and external-effect exactly-once guarantees stay out of this checkpoint.

Escalate to the coordinator if a shared schema/export/migration/root/kernel change becomes necessary, or production integration cannot fail closed without the missing pin/fence adapter. If the requested deliverable is instead complete production-agent acceptance now, EVE-52 and EVE-54's durable pin/fence integration are genuine prerequisites; do not disguise a scripted checkpoint as that outcome. No owner override or dependency approval is requested for the proposed no-new-dependency foundation.

Tools/limits: local Graphify query returned not set up; no setup/hooks/files were installed for this analysis. Graphify Cloud memory and gateway tools were unavailable; direct connected Linear MCP, current local source and exact installed vendor source were used. No runtime or acceptance tests were rerun. Read-only git status was clean. Readiness source: https://ampcode.com/artifacts/parallel-issue-readiness-16db0d8a-418b-41c1-a47d-fe661bff7fb0 . Analysis thread: https://ampcode.com/threads/T-afee3f44-ff49-4609-8aec-3a890dc3344b .


### Comment b52be1a7-b8d8-426f-877a-296deb20d658

Author: Amp. Created: 2026-11-17T12:30:44.927Z; updated: 2026-11-17T12:30:44.889Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-34/agent-runs-restart-from-scratch-when-their-shard-moves) (comment ID above). Parent: None. Resolved: Not recorded.

## Bounded AgentRun checkpoint evidence - 2026-11-17

Agent-authored by Amp. Source-only implementation and verification on immutable base `12dff4c8ba8001ed2071b2f543456f75b1aacb84` (uncommitted). This is the packet's fixed-definition EVE-54 prerequisite checkpoint, not whole EVE-34/EVE-54/EVE-47 acceptance. Status remains Backlog; no Done transition requested.

### Implemented source

Six paths only: new apps/server/src/agent-run.ts and tests/agent-run.spec.ts; existing sql-fixture.mjs, two-runners.mjs, docs/cluster.md and ai-docs/src/14_cluster/index.md. runner-process.mjs, backend.ts and cluster.ts unchanged.

One EventivaAgentRun-v1 Workflow on the existing ClusterWorkflowEngine; one short serialized per-tenant/run control entity. Start persists immutable caller/definition/ordered steps through tenant-routed Storage then discards execution; Status and Interrupt reauthorize. Stable 1-based Activity names and separate literal tenant-scoped runId:step keys. Required injected model/access ports fail closed; tools use ClusterActions -> ActionHost/A1. No SDK/provider/dependency, second engine, public ingress or production enablement. Module-bound definitions reject rather than use latest-generation fallback.

### Executed evidence

- pnpm nx run @eventiva/server:cluster-conformance: PASS on a fresh disposable fixture.
- pnpm nx run @eventiva/server:test: PASS, including an independent repeat of uncached SQL conformance plus 3 test files / 15 tests.
- pnpm nx run-many -t lint typecheck build -p @eventiva/server: PASS.
- node --run documentation: PASS; 84 fixture tests, offline mirror/planning consistency, documentation ratchet 0 violations. The existing 3 unresolved planning decision sources remain unresolved; this is not exhaustive decision-review acceptance.
- Prettier for all six files and git diff --check: PASS.
- node --run check: BLOCKED at stale LLMS.md, intentionally reserved to coordinator. No generated outputs changed; combined verify remains coordinator-owned.

Final positive run: SIGKILL checkpoint owner PID 67899 -> automatic survivor 67881; SIGTERM owner 68063 -> survivor 67881. Both counts [1,1,0] -> [1,1,1], persisted successful step-2 Activity reply checked before stopping the owner, step 3 on the survivor without Start/resume/victim restart. Ordered data-dependent output equals no-fault control: seed 11 -> action value 34 -> answer 172. Each writing step has one domain/history/outbox/dedup/success-receipt set. Total process restart into Community PID 69837 recovers an in-flight checkpoint and preserves completed counts, duplicate identity and changed-input conflict.

Negative control: changed ONLY step 1's Activity name in disposable generated JS to include process.pid. Recovery failed the raw-entry assertion with actual [2,1,0], expected [1,1,0], exit 1. Restored stable naming before the passing full server:test. Counters are append-only raw executor entries independent of business rollback/dedup, not unique/upsert rows. No mutant source is in the patch.

Security cases passed: changed-input duplicate, forged/foreign tenant, invalid steps/definitions/non-JSON, missing model/access ports; identity/permission revoked or approval newly required between steps denies the next protected effect with no tool entry/write. Cached Status/Start/Interrupt deny after revocation. Existing after-business-commit/before-Activity-reply SIGTERM/SIGKILL recovery remains separate and passing.

Interrupt test proves the short handle submits the engine's persisted signal while execution is gated. It does NOT promise immediate cancellation completion: the pinned engine may continue until a suspension boundary. An initial extra immediate-cancellation expectation timed out; source/docs now state the actual signal contract rather than claim EVE-35 latency/lifecycle acceptance.

### Fixture, limitations and handoff

Only disposable loopback eventiva_test PostgreSQL, exact approved postgres:17.12-bookworm@sha256:40865bc877a289da75963d97d72b59633f639fc5af7a4e856bfa3714cae5b536, existing expiry before 2026-11-22 UTC/earlier trigger, 2 CPU / 1 GiB / 256 PIDs / 256 MiB tmpfs / no-new-privileges. Generated credentials, isolated databases, no production URL/external ingestion; unconditional runner/database/container/network teardown completed. No exception renewal or scan claim.

Source patch SHA256: 7897d548d29e5a52e04ad3d7a382f2a3a4652214899a7009cc7ac4f1edad730e. Coordinator owns integration, planning mirror/timeline, LLMS/Graphify, combined verification and delivery. No commit or push from this lane. Graphify local query unavailable (not set up); Graphify Cloud/gateway unavailable; used direct connected Linear/Context7 and pinned installed source. No production SLA, exactly-once external spend/output, module/provider/schema pin resolution/fencing, agent loop, streams, scheduling/reaping or cross-transport cancellation acceptance.

Source/evidence thread: https://ampcode.com/threads/T-5a85c8b5-cf76-429d-b85e-30bc35c680a4
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
