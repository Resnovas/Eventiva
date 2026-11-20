# Trusted approval-retention maintenance

Refs: EVE-275
Refs: Resnovas/Eventiva#1063

## START - 2026-11-19T21:20:48Z

Packet C starts in isolated worktree `repo-approval-retention`, branch `agents/eve275-approval-retention`, from freshly fetched `origin/main` at `e0efc5e49392a5d1a629ed321c76131b93d271ad`. The checkout is clean before this report. Published A supplies the record/producer/CAS contract; its reported local verification is not independently rerun C evidence or hosted acceptance.

The exclusive authored allocation is `packages/contracts/src/approval-retention.ts`, `packages/integrations/sql/src/approval-retention.ts`, `tests/storage/src/approval-retention.spec.ts`, this report, `ai-docs/src/34_approval_retention/index.md`, the next additive PostgreSQL/SQLite migrations (currently `0013.sql`), only the two package `./approval-retention` exports, and narrow C timeline amendments. Mechanical LLMS/Graphify regeneration accompanies verified delivery. Existing approval source/specs and A's shared seams remain read-only. All original proof/provider/fixture refs, bundles and the retained B checkout remain untouched.

The approved retention anchor is exactly `approvalRetentionEnd(usedAt ?? revokedAt ?? expiresAt, retention)`. First terminal use/cancel replaces the provisional expiry anchor; replay does not renew it. The implementation must expose explicit trusted, bounded, tenant-local maintenance, serialize with the existing identity guard and SQL transaction ordering, preserve immutable updates and premature-delete denial, and retain operational proof until both expiry and retention elapse. It must not call business handlers, activate a scheduler, extend approvals or delete action-commit receipts, business history/deduplication or outbox records.

At START no C implementation, migration, executed acceptance or production activation is claimed. Real-dialect tests, normal coverage and full unchanged verification remain pending. Backup/replica erasure and whole EVE-275/Core completion are not implied by operational cleanup. The live EVE-275 issue and OPEN GitHub #1063/linkback were independently read before START; lifecycle mirror links will be added after readback.

START lifecycle: [Linear](https://linear.app/resnovas/issue/EVE-275#comment-9f12d2fd-3761-4cd3-bfda-c9d16fcc79c2) and [independently read explicit GitHub mirror](https://github.com/Resnovas/Eventiva/issues/1063#issuecomment-7022745290). The automatic mirror was absent on readback, so the explicit mirror preserves the non-closing lifecycle without claiming automatic synchronization.

## Contract and trusted invocation

Maintenance is an injected service capability, not an ActionHost action or public purge endpoint. Possession belongs only to trusted tenant lifecycle composition. Nothing imports it into the running server, registers a scheduler, chooses a cadence, supplies a release grant or activates production cleanup. Existing SQL credentials and the existing dedicated tenant client are prerequisites; no new credentials or services are required for local qualification.

1. Apply the normal forward-only migration loader to the tenant database, including the new `0013.sql`. Never modify the bytes of an applied migration. This source delivery does not authorize applying it in production.
2. Provide that physical client's `SqlClient.SqlClient` and its trusted `CurrentTenant` to the `approvalRetentionMaintenance` layer. Do not obtain either from request-body tenant claims or use a compute/global client.
3. Invoke `ApprovalRetentionMaintenance.run` from the trusted lifecycle owner with `{tenant, limit, after?}`. `tenant` must match the captured route. `limit` is required, an integer from 1 through 100, with no default. `after` is an optional exclusive UUIDv7 cursor, with no default other than starting at the beginning.
4. Continue with `next` only after a successful page. If absent, this traversal is complete. Start a later full pass without `after`: a previously retained proof can become eligible after its cursor position was passed. The owner must persist progress or restart explicitly; this library schedules nothing.

Complete composition example (the trusted owner supplies `tenantId` and the existing routed SQL client):

```ts
import { SqlClient } from '@effect/sql';
import { ApprovalRetentionMaintenance } from '@eventiva/contracts/approval-retention';
import type { TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { approvalRetentionMaintenance } from '@eventiva/integrations.sql/approval-retention';
import { Effect } from 'effect';

/** Run one explicitly bounded page; this does not register a transport or scheduler. */
export const cleanupPage = (tenantId: TenantId, sql: SqlClient.SqlClient) =>
    Effect.gen(function* () {
        const maintenance = yield* ApprovalRetentionMaintenance;
        return yield* maintenance.run({ tenant: tenantId, limit: 20 });
    }).pipe(
        Effect.provide(approvalRetentionMaintenance),
        Effect.provideService(CurrentTenant, { id: tenantId }),
        Effect.provideService(SqlClient.SqlClient, sql)
    );
```

The result contains successful-page `scanned`, `deletedDecisions` and `deletedProofs` counts plus optional `next`. Standalone invocation commits before returning. If trusted lifecycle code encloses maintenance in another SQL transaction, these counts and cursor are provisional until that owner commits; never acknowledge them externally before the enclosing commit. One page fetches at most `limit + 1` proofs, inspects at most `limit`, and returns at most one cursor. A still-retained proof advances the cursor, preventing starvation of later eligible proofs. The producer accepts issuance revision zero and at most one terminal use/cancel revision; replay adds no revision. Decision inspection fetches at most three rows per eligible proof and rejects a third row as corruption before deletion. Therefore at most two valid decisions per inspected proof can be removed. This is a record-count bound, not a new byte-size limit on existing evidence.

## Transaction and database protections

Each invocation checks the request schema and tenant match before SQL. It acquires the established `identity_guard` write lock as the first statement in one SQL transaction, then samples one trusted clock value. Use/cancel and maintenance therefore share ordering with the published producer. There is no business-handler callback under the guard. The current `ApprovalRecord`, SQL ID/revision and tenant are decoded fresh; malformed state fails the page rather than being treated as absence or discarded.

Eligibility is the current canonical terminal deadline, recomputed with shared `ApprovalRetention`/`approvalRetentionEnd`, not an older decision snapshot's provisional deadline. Original snapshots retain their original anchors without extending or replacing policy. At exact `retainUntil`, decision history is eligible. The operational proof is additionally retained until `expiresAt` has elapsed; even a used/cancelled proof with an unusually long synthetic expiry can remain after its minimal history is removed. Use/revocation replay never renews retention or recreates history.

Migration `0013.sql` retains unconditional decision UPDATE denial and the decision-to-proof foreign key. It replaces blanket DELETE denial with database triggers requiring an exact proof-ID/revision/body permit and an elapsed canonical `retainUntil`; proof deletion additionally requires elapsed `expiresAt`. The provider creates the per-proof permit inside its guarded transaction and removes it before commit. It never flips a global evidence-protection switch. Missing, different-proof, stale-revision, changed-body and premature permits cannot authorize deletion. Permits have no foreign key because that would itself prevent the guarded parent deletion; their lifetime is this transaction, not a second proof store.

The SQL role is still trusted infrastructure: an administrator who can rewrite proofs, seed arbitrary permits or drop triggers is outside these application-level guarantees. These checks do not introduce database-role isolation, cryptographic evidence or a replacement authorization policy.

## Failures, retry and preservation limits

`ApprovalRetentionFailure` exposes only `invalid`, `denied` or `unavailable`. It contains no SQL cause, rejected proof body, session or grant details. A malformed request/body or inconsistent row fails closed; a foreign tenant is denied; typed statement/guard failure is unavailable. No partial counts are returned after failure. Typed pre-commit failures restore earlier page deletions and permits when SQL rollback succeeds, so the owner can retry explicitly after repairing the cause. Do not advance on a failure or silently convert it to an empty page.

The installed `@effect/sql` implementation in `src/internal/client.ts` wraps commit and rollback SQL errors in `Effect.orDie`. Packet F below qualifies these paths and normalizes only `SqlError` leaves, whether typed failures or defects, to the existing bounded `unavailable` failure. Other typed failures, unrelated defects, interruption and sequential/parallel cause structure are preserved. No failed Exit supplies successful counts or a cursor. This is privacy normalization, not recovery: a lost acknowledgement can mean the page already committed; a failed rollback cannot promise restored state. Do not advance the original cursor after either failure. The trusted owner must establish a usable, settled SQL connection before explicitly retrying against existing state. No automatic retry, exactly-once acknowledgement, zero-commit inference, replacement transaction/reconciliation protocol or reversal of committed cleanup is established here.

Only `approval_decision`, eligible `approval_proof` rows and transient permits are deleted. Existing `action_commit`, receipts, operational business records/history, deduplication and command outbox remain unchanged. The cleanup does not reverse external effects. Deletion from the primary operational tables is not complete erasure: replicas, snapshots, WAL/journals, backups, exported audit copies and external processors have independent retention/restore obligations. No backup destruction, secure file wiping, replica policy, scheduler provisioning or operational release is included. Rollback before commit preserves evidence; restoring already committed deletions requires an authorized backup/restore process, not a down migration.

## Clause-level executed evidence

The public maintenance service is exercised by `tests/storage/src/approval-retention.spec.ts` against actual migrated SQLite and disposable pinned PostgreSQL 17.12. The corrected focused run passes 45/45 tests. The SQL producer, identity store, permission checks, use/cancel lifecycle, triggers and transactions are real; the fixed target action/digest and deliberately long session/expiry values are synthetic controls, not production session policy. Concurrent fibers exercise the actual driver/guard ordering, not separate-process C deployment or operational scheduling.

| Clause | Owning source and observed evidence | Limit |
| --- | --- | --- |
| Trusted tenant-local invocation | New contracts/SQL `approval-retention.ts`: required explicit limit, validated cursor, route match before SQL; two independent physical stores and foreign bodies deny without cross-store deletion. | Possession is granted by trusted composition, not exposed through HTTP or an action registry. |
| Canonical current retention | Existing `contracts/approval.ts` schema/helper plus new SQL provider: exact current record anchor, revision agreement and original decision snapshot validation. Use and cancel retain first terminal values across replay. | No producer, consent or policy redesign; issuance snapshots can keep their longer provisional deadlines. |
| Bounded history and traversal | Ordered limit+1 lookahead, at most limit inspected proofs and at most three history rows read. Excess/missing/inconsistent history fails; retained rows still advance the cursor. | At most two valid decisions per proof; no new bound on existing evidence byte size. A later traversal must restart to revisit newly elapsed rows. |
| Temporal boundaries | Literal UTC expected values exercise 90 days, 730 days, six-month end-of-month clipping, leap February and calendar two years, each at deadline minus one millisecond and exact deadline. | Uses the approved shared contract rather than replacing calendar periods with a fixed number of days. |
| Immutable and premature-delete denial | Both `0013.sql` migrations retain UPDATE protection/FK and require exact ID/revision/body permits. Real SQL rejects direct, premature, wrong-proof, stale-revision and changed-body deletion attempts. | Trusted SQL administrators can rewrite data/permits/triggers; this is not database-role isolation or cryptographic custody. |
| Proof expiry as an additional floor | A first terminal event can make history eligible while the operational proof has a later expiry. Tests remove history, preserve the proof/replay state and delete proof only at expiry. | Primary operational evidence only; no backup/replica erasure claim. |
| Atomic failure and explicit retry | Malformed later rows and a rejecting fixture trigger fail after earlier deletion work; both engines restore all page history/proofs, leave no permits, sanitize errors and permit an explicit successful retry. Missing guard fails unavailable. SQLite whitespace-text revisions and PostgreSQL negative revisions deny rather than being coerced into valid history. | No partial success counts or automatic retry/scheduler; the lifecycle owner repairs the cause and retries the cursor. |
| Use/cancel races | Both lifecycle-first and maintenance-first orders use real public lifecycle operations and the shared identity guard. Advancing time while contended distinguishes sampling after guard acquisition. | No business handler runs in the maintenance suffix; no rolling-session or resource-cancellation permission change. |
| Unrelated durable state | Action commits sharing the deleted proof's write key, receipts/outbox sharing its ID, operational records and transition history remain present after bounded drainage on both engines. | SQL rollback does not reverse external calls; deletion/backup restore is not a business reversal protocol. |

## Validation history and remaining gates

The initial focused real SQLite/PostgreSQL run passed 25 of 27 cases. Two new fixture controls required correction: PostgreSQL business-history IDs/timestamps must use their actual dialect types, and the SQLite table-rename failure fixture did not recover as expected. The replacement failure control adds a temporary rejecting fixture trigger alongside all production triggers, then removes only that fixture trigger to prove rollback/retry. Production source/gates and existing tests were not weakened.

Executed against base `e0efc5e49392a5d1a629ed321c76131b93d271ad` plus this C tree:

| Command | Decisive result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Existing lockfile/dependency set installs without modification. |
| `NX_DAEMON=false NX_NO_CLOUD=true pnpm nx run-many -t build -p @eventiva/contracts,@eventiva/integrations.sql,@eventiva/runtime --parallel=1` | Four tasks pass. |
| `bash .amp/in/orb-backup/approval-retention-postgres.sh pnpm exec vitest run --config tests/storage/vitest.config.mts tests/storage/src/approval-retention.spec.ts --coverage.enabled=false` | 41/41 pass, 11.61 seconds; focused validation, not normal coverage acceptance. |
| `node --run check` | 104 documentation fixtures; 295 TypeScript files, zero findings; captured mirror 258 issues/593 comments, zero stale. |
| `node tools/documentation/planning.mjs --check --require-reviewed` | Captured planning snapshot: 258 issues/692 dependency edges, zero unresolved decisions and zero stale review digests; not a live freshness claim. |

The first unchanged fixture-backed `NX_DAEMON=false NX_NO_CLOUD=true bash .amp/in/orb-backup/approval-retention-postgres.sh node --run verify` exits 124 at the existing 20-minute limit. Its aggregate completes 64 successful tasks (19 cache hits), including normal runtime/storage tests, then stops contracts tests; remaining targets and smoke are not accepted. The normal storage report includes the new SQL provider at 46/46 statements, 55/55 conditionals and 7/7 methods. No timeout, assertion, threshold, exclusion, parallelism or source gate is changed. The retained log is `.amp/in/orb-backup/approval-retention-verify-first.log`; the final unchanged repeat follows cache-qualified normal targets. An additional literal calendar-two-year case explicitly distinguishes March 2029 from the 730-day February boundary; final acceptance must execute that strengthened tree.

The first final-normal runtime/contracts command was interrupted after five minutes: its log reports runtime stopped, contracts not run and `Terminated`, not a test assertion or green result. On resumption at 2026-11-19T23:11:42Z, PID 755813 is no longer tracked or running and the fixture container is absent; the owned Docker service is healthy. The interrupted log is preserved. The same normal Nx test rerun exits zero: runtime 675/675 (statements 93.77%, branches 90.39%, functions 93%, lines 94.82%) and contracts 575/575 (95.53%, 91.97%, 93.61%, 95.92%), with zero of two cache hits. The separately owned renewal option B decision is recorded only in the C-owned timeline; no renewal source is adopted.

The second unchanged full verification, PID 773274, exits zero inside the unchanged 20-minute limit: all 105 aggregate tasks (21 cache hits), zero source/declaration boundary violations and all three smoke projects (17 tasks, 12 cache hits). Its 43-case C tree includes the independent calendar-two-year case; SQL provider coverage is 46/46 statements, 55/55 conditionals and 7/7 methods. This is pre-correction evidence, not acceptance of the subsequent strengthened tree.

Final review reproduces an owned-C coercion defect through public maintenance: SQLite permits whitespace text in the composite decision revision key, and `Number(' ')` incorrectly admitted it as zero, deleting one decision/proof. The added red regression fails for SQLite while PostgreSQL's negative-integer control denies. The correction decodes only valid numeric or canonical unsigned integer-string revisions with Schema before lifecycle checks. All 45 focused cases then pass in 8.61 seconds. No published producer/CAS, existing spec or protection is changed. Preservation controls now share the deleted proof's key/ID, ruling out accidental associated-receipt/outbox cleanup rather than testing only unrelated keys.

Fresh-main reconciliation fetches published D fixture `84e4ac9745dfc18f0b886a1343fc86ed0ff60b6b`, source `009dc4228e841eff9f440f0d2929ca133299bc3f` and head `3ff2251b8702be0f5061bff05bb18a3f2ce5228b`; all three signatures independently verify G. C rebases ordinarily onto that head; only generated LLMS overlaps and is regenerated from both chapters. No unpublished renewal source is adopted.

The first post-reconcile prequalification command accidentally omitted the disposable PostgreSQL wrapper: 45 runtime and 31 contracts tests fail with `ECONNREFUSED 127.0.0.1:5432`; full verification does not start. This is failed fixture setup, not accepted coverage. Its log is retained as `approval-retention-normal-missing-fixture.log`. The unchanged two normal test targets are rerun inside the existing pinned disposable fixture before the full verification chain, without source, threshold or timeout changes.

## Corrected latest-main acceptance - 2026-11-20

The fixture-backed normal runtime/contracts repeat exits zero in 9m23s, with zero of two cache hits. The subsequent unchanged fixture-backed `node --run verify` exits zero inside its separate existing 20-minute limit on D head `3ff2251b` plus corrected C behavior: all 15 builds cached; all 105 aggregate tasks pass (21 cache hits, 16m14s); source graph 290 files/1428 edges/34 packages and emitted graph 100 files/502 edges both have zero violations/cycles; all three smoke projects pass (17 tasks, 12 cache hits, 1m50s). Normal storage coverage for the corrected new SQL provider is 47/47 statements, 55/55 conditionals and 7/7 methods. Root check includes 104 documentation fixtures, 295 TypeScript files with zero findings, and the unchanged captured mirror with zero stale pages. Logs preserve all failed, interrupted, pre-correction and final runs separately.

The immutable full run precedes only evidence updates and a JSDoc clarification of the existing finalization limit; no production/test behavior changes afterward. Final root/strict planning and affected build checks validate those documentation edits before signed delivery. The source and clean-source graph are separate signed commits with both non-closing references. Exact delivered revisions and hosted CI results belong to the paired lifecycle comments, not an inference from local success. C storage reservations release at that verified delivery checkpoint; subsequent storage-harness work requires its own exact-path START. Renewal remains preserved/unpublished and diagnosis-held as independently read in [its explicit mirror](https://github.com/Resnovas/Eventiva/issues/1063#issuecomment-7025774667); C does not adopt it.

No C production migration or activation is authorized. At C delivery forced SQL finalization faults remained unqualified; the later F checkpoint below supersedes that bounded evidence limit, not broader recovery or activation prerequisites. Whole EVE-275/Core stays open. Graphify Cloud memory and the gateway are not connected; local source/graph and the existing direct tracker connections supply evidence instead, with no claimed memory read or live planning sync.

## Approval finalization qualification F - 2026-11-20

START at 05:24:12Z uses freshly fetched `origin/main` `69f9866e4701a1f2ea8ddbe3f326eb75eb235dd0` in isolated `eventiva-finalization-f` / `agents/approval-finalization-f`. [Linear START](https://linear.app/resnovas/issue/EVE-275#comment-913b839c-b55a-4584-8bbf-1ad9554afa3b) and the [independently read explicit GitHub mirror](https://github.com/Resnovas/Eventiva/issues/1063#issuecomment-7031300107) precede source edits. Packet revision116 authorizes only this provider, new `tests/storage/src/approval-finalization.spec.ts`, this guide/chapter34, the isolated F timeline and mechanical LLMS/clean-source graph. No unpublished renewal, G storage fix, process/instrumentation work, public contract, migration or dependency is adopted.

On unchanged production source the real two-dialect regression fails six cases and passes eight controls: each pre-COMMIT rejection, applied COMMIT/lost acknowledgement and ROLLBACK rejection exposes SQL, connection and proof canaries in serialized `Die(SqlError)`. [Red evidence](https://linear.app/resnovas/issue/EVE-275#comment-15cc7936-b349-4a44-9ef8-d0abe8ae1fff), independently [mirrored on GitHub](https://github.com/Resnovas/Eventiva/issues/1063#issuecomment-7031377534), records the exact command. This is a trusted-capability privacy defect, not a demonstrated hostile-ingress exploit.

The tests migrate actual file-backed SQLite and a uniquely owned database on the approved pinned PostgreSQL17.12 fixture. A separately opened physical client reads full committed rows before and after each attempt. Only the actual connection's `executeUnprepared` finalization seam is temporarily wrapped and restored; the installed SQL transaction implementation, BEGIN, body statements, guard and production triggers remain real. The lost-ack wrapper executes the real COMMIT before injecting its error. No replacement transaction result or assumed durable state is used.

| Scenario on both engines | Independently observed state and public outcome |
| --- | --- |
| Ordinary successful page | One proof/decision deleted, successful counts and lookahead cursor acknowledged; explicit original-cursor retry removes only the remaining eligible proof. |
| Typed body corruption after earlier deletion, ordinary rollback | Original committed proof/decision bytes restored, no permit survives, bounded `invalid` failure. |
| Rejected COMMIT before application | Earlier committed snapshot remains visible to the observer; failed Exit is bounded `unavailable`, without counts/cursor or any canary. The writer transaction is still unsettled; visibility alone does not prove rollback. |
| Real COMMIT applied, acknowledgement lost | Observer sees the first deletion committed while the public operation fails `unavailable`. Original-cursor retry deletes only the remaining eligible proof, never fabricates the missing acknowledgement or repeats a missing row. |
| Rejected ROLLBACK after typed body error | Observer sees the prior committed snapshot, but the writer remains unsettled. The finalization failure is `unavailable`, not `invalid` or a promise of restoration. |
| Unrelated defect, interruption and mixed cause tree | They remain failed Exits in their original channels; mixed sequential/parallel causes retain the unrelated defect while both SQL leaves become bounded failures. No blanket unavailable/success conversion. |

For the deliberately unresolved pre-COMMIT/ROLLBACK fixtures only, tests explicitly issue ROLLBACK on the original physical writer before retry, then independently verify restoration. This is test recovery, not provider behavior or qualification of automatic production pool repair. The original cursor is reused after settlement and corruption repair. Associated action commits, receipts, outbox, operational records/history and permits are byte-compared through retry. Existing retention tests run unchanged to preserve temporal, immutable-trigger and lifecycle-race protections. External calls remain outside SQL rollback.

| Executed F command on base69f9866e plus F tree | Result |
| --- | --- |
| `NX_DAEMON=false NX_NO_CLOUD=true bash .amp/in/orb-backup/f-postgres.sh pnpm exec vitest run --config tests/storage/vitest.config.mts tests/storage/src/approval-finalization.spec.ts --coverage.enabled=false` before correction | EXIT1: 6 failures/8 passes of14, 4.28s; all three canaries present in failed Exit. |
| Same fixture, focused finalization and unchanged retention specs after correction | EXIT0: 61/61, 16.42s; includes two additional mixed-cause controls and full retry-state preservation. |
| `NX_DAEMON=false NX_NO_CLOUD=true node --run verify:static` | EXIT0: 15 builds, 83 lint/typecheck/dependency tasks; source296files/1450edges and emitted100files/502edges, zero violations/cycles. |
| Same pinned fixture, `pnpm nx run @eventiva/storage-tests:test` with normal coverage | EXIT0: 20 files/333 tests, 270.63s; statements93.89%, branches92.79%, functions92.45%, lines94.97%. Retention provider50/50 statements,59/59 branches,9/9 functions. |
| `node --run check` and `node tools/documentation/planning.mjs --check --require-reviewed` | EXIT0: 104 documentation fixtures,301 editable TypeScript files/zero findings; historical258issues/692edges/zero unresolved or stale entries. This is offline consistency, not live snapshot freshness. |

Unchanged installed-hook full verification, final documentation/clean-source graph, signed delivery and exact-head CI remain pending at this checkpoint. An initial Docker launch lacked root privileges; the supervised local daemon was corrected before database execution. Context7 refused the lookup at its quota; installed Effect/SQL source supplied API and failure semantics instead, with no API invented from memory. Graphify Cloud/gateway are unavailable; local graph/source and direct connected tracker tools are used. No production operation, schedule, activation, new architecture or whole EVE-275/Core acceptance follows.
