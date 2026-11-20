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

Finalization is a separate unproven boundary: the installed `@effect/sql` implementation in `src/internal/client.ts` wraps commit and rollback errors in `Effect.orDie`. This capability does not normalize those defects, and tests do not inject commit/rollback failure or lost commit acknowledgement. A lost acknowledgement can mean the page already committed; a failed rollback cannot promise restored state. Trusted lifecycle composition must keep defect causes private and qualify finalization/recovery before activation. No exactly-once acknowledgement, zero-commit inference, replacement transaction/reconciliation protocol or reversal of committed cleanup is established here.

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

No C production migration or activation is authorized. Forced SQL finalization faults remain unqualified as described above; whole EVE-275/Core stays open. Graphify Cloud memory and the gateway are not connected; local source/graph and the existing direct tracker connections supply evidence instead, with no claimed memory read or live planning sync.
