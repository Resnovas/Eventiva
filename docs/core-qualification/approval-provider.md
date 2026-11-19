# Trusted approval provider implementation

## Integrated A amendment - 2026-11-19

The [current wiring report](approval-wiring.md#current-implementation-checkpoint---2026-11-19) supersedes this retained standalone checkpoint's implementation/approval holds, not its historical test outcomes. A reconciles the provider into the registered consent host and same-client routed backend on published B base `129069e001a175b924072f29965123fccfb26768`. The checked ingress to `issueApproval` is the existing storage `JsonValue`, not erased `unknown`; registered completion also supplies the exact reviewed expiry. `Approvals.get(id, target)`, accepting `use` and `transaction` are mandatory. Mutation use follows post-handler live revalidation inside Integrity; approved reads pair use and mandatory audit atomically, without read-result caching. Replay refreshes authority without creating another use decision.

The record's exact producer invariant is now `retainUntil = approvalRetentionEnd(usedAt ?? revokedAt ?? expiresAt, retention)`. First use/cancel replaces the provisional expiry anchor; replay never renews it. Schema and SQL CAS validate that same transition. Cleanup enforcement remains separate C work, not an implemented purge or whole-database erasure guarantee. Jonathan's explicit approval of BOTH setup-only synthetic-history corrections is recorded in the [resumption checkpoint](https://linear.app/resnovas/issue/EVE-275#comment-05fd0efd-e0fa-4e05-9096-515baa9b5c09); each correction requires its own signed commit with every assertion unchanged. Final combined normal coverage, delivery and hosted CI belong to the current wiring lifecycle, not the older-base results below. The [later binding policy amendment](approval-wiring.md#binding-policy-amendment---2026-11-19) selects one-hour rolling trusted server authentication policy and explicit resource-scoped cancellation grants, superseding the unselected-policy wording in this historical report. Rolling renewal and resource-permission reconciliation remain follow-up implementation, not acceptance or activation. No step-up, spend or activation is selected.

## START - 2026-11-19T09:28:43Z

Jonathan's binding product decisions and implementation authorization were relayed by
the [coordinator](https://ampcode.com/threads/T-d57222d4-a392-4a67-bcea-43f0bda5323a).
This lane starts from published main
`23baec94dc9f7dbdf5df70bccf92862bcff2eb09`, not the coordinator's unpublished
Caller repair. The original signed proof checkpoint and branch remain preserved.
Verified pair: [EVE-275](https://linear.app/resnovas/issue/EVE-275) and OPEN
[Resnovas/Eventiva#1063](https://github.com/Resnovas/Eventiva/issues/1063), with
independently read linkback comment 6988293684. Whole issue/Core remain open.

Reserved writes: new contracts/runtime/SQL approval sources, new runtime/storage
approval specs, this report, PostgreSQL/SQLite migration 0012 and narrow approval
subpath exports. Coordinator owns execution/host, Caller tests/report, actions
guides, timeline, LLMS, Graphify and combined acceptance. Existing migrations and
other source are read/run only. Recheck migration allocation before delivery.

Bounded November 19 candidate: after the normal suites demonstrated a collision,
the coordinator released only the synthetic-history insertion/local preparation
in `tests/runtime/src/run-fencing.spec.ts`. Its hard-coded future `0012.sql` was
already present as this lane's real migration. The fixture now derives a future
name from the current persisted migration head before inserting incompatible
history. The subsequent claim-denial, unchanged epoch and fence-denial assertions
are unchanged. No other fencing source or migration allocation was amended. This
is permission for isolated local editing/testing only: the exact AI-11 maintainer
decision remains pending. Jonathan's separate Caller fixture acceptance at
`3c54a0f5` does not accept this candidate. Keep its eventual local commit separate
from provider source and do not publish it before that exact acceptance.
Recorded on
[Linear](https://linear.app/resnovas/issue/EVE-275#comment-e37a6400-1379-4c72-bcc6-19c96d2062f4)
and independently read back on
[GitHub](https://github.com/Resnovas/Eventiva/issues/1063#issuecomment-7005765812).
The later approval-boundary clarification is recorded on
[Linear](https://linear.app/resnovas/issue/EVE-275#comment-412799c4-a21d-45db-83bd-672a229901bc)
and independently read back on
[GitHub](https://github.com/Resnovas/Eventiva/issues/1063#issuecomment-7005967592).

Approved: tenant SQL evidence, own pending cancellation; scope-limited independently
grantable cancellation for event leads/security administrators; tenant lifetime
from five minutes to configured session lifetime, capped by actual session expiry;
fresh live authority on execution/replay; changed input/new write key require new
consent; six-month minimal evidence retention, configurable 90 days to two years.
Long-running exact-known work may be consented at start, without bypassing expiry
or live execution checks. No inferred step-up, new dependencies or spend.

Current source search has found no trusted event-lead mapping or configured session
maximum. Neither an event role nor a one-hour default is assumed. Runtime/provider
work continues independently; missing integration seams will be reported precisely.

## Implementation checkpoint

The START above was recorded before source edits. The implementation now consists
of three new approval modules, two new specs, two migration 0012 files and narrow
`./approval` exports in the contracts/runtime/SQL package manifests. No dependency,
production route, service activation, host/execution change or shared generated
output is included. The original signed proof checkpoint remains separate.

START evidence was posted as Amp on
[Linear](https://linear.app/resnovas/issue/EVE-275#comment-514bdca6-fea6-45e9-b76f-35dfdcfbca7b)
and independently read back on
[GitHub](https://github.com/Resnovas/Eventiva/issues/1063#issuecomment-7005178087).

Approved A2 bindings remain grounded in
[EVE-40 A2](https://linear.app/resnovas/issue/EVE-40#comment-ed996139-45e9-4c0d-ab14-2a5f0f19afdc),
with A1 live authorization and transaction semantics in
[EVE-40 A1](https://linear.app/resnovas/issue/EVE-40#comment-a412365e-b4df-4172-a316-606b06a7e763).
The November 19 product decisions were relayed by the coordinator; this report
does not infer a broader approval protocol or production activation authorization.

## Contract and integration requirements

Import the portable schemas and trusted persistence port from
`@eventiva/contracts/approval`, runtime operations from `@eventiva/runtime/approval`
and the routed SQL layer from `@eventiva/integrations.sql/approval`.

- `issueApproval(action: ActionBinding, input: unknown, principal: CallerIdentity,
writeKey: string, settings: typeof ApprovalSettings.Encoded)` returns the persisted
  `ApprovalRecord`. Only trusted explicit-human-consent completion may call it;
  possession of an authenticated session alone is not evidence that a human
  consented. No transport mint endpoint or consent UI adapter is implemented.
- `lookupApproval(id, action, input, writeKey)` refreshes accepting authority and
  returns a fresh record. Pass the current registered binding and original encoded
  wire input, not caller-carried hashes or a second action registry. Preparation
  uses the existing codec, canonical encoded input and decoded target policy;
  it never executes the handler.
- `useApproval(id, action, input, writeKey)` repeats live lookup and marks first
  successful use. Call it inside the same authoritative Integrity SQL transaction
  as mutation, output acceptance and receipt. Initial admission must not consume
  consent. Repeated lookup/use for the same exact write key may succeed for replay
  only while all live gates still pass.
- `cancelApproval(id)` resolves current human/session/membership/team roles.
  The consenting human can cancel pending consent even after losing the target
  action permission. Another human requires `approvals.cancel` with exact resource
  `tenant:<tenant-id>`; that permission is independently grantable. Used/expired
  consent cannot be cancelled; repeated authorized cancellation is idempotent.
- All operations return Effect values with closed `ApprovalFailure` categories.
  The store exposes `tenant`, `nextId`, `transaction`, `get`, `save`; `save` is a
  trusted internal persistence capability, never an externally exposed mint API.

The generated declarations confirm `Effect<ApprovalRecord, ApprovalFailure, R>`
for all four operations. Issuance requires `ApprovalStore | IdentityResolver |
IdentityStore | Caller | Authorizer | ExecutionPolicy | InputDigest`; lookup/use
have the same environment without direct `IdentityStore`; cancellation requires
`ApprovalStore | IdentityResolver | IdentityStore | Caller`. The SQL provider is
`Layer<ApprovalStore, never, CurrentTenant | SqlClient>`; building that layer alone
does not establish database readiness or authorize issuance.

Build `approvalStore`, `identityStore`, `Storage` and `durable` using the same routed
tenant SQL client. Nested `ApprovalStore.transaction` inherits the fiber's SQL
transaction and locks the existing `identity_guard` before reading live authority.
The SQL provider decodes exact versioned JSON, row ID/revision and tenant ownership
on every read. Updates compare revisions, preserve immutable decision bindings and
append decision evidence in the same transaction; no volatile/spooled fallback is
added. Both migrations are additive new tables with indexed decision foreign keys
and immutable decision triggers. No production migration was applied.
Successful-use audit records the executing principal/session; the proof's immutable
`approver` remains the consenting human. Issuance/cancellation require a human actor;
use requires the actor to match the bound executing principal. A real SQLite
assertion caught the initial candidate incorrectly naming the human as delegated
use actor; the same assertion passed after that local provider correction. Both
dialect specs now check this separation. This was a pre-publication candidate
defect, not an observed production failure.

The coordinator still owns the smallest host/invocation/execution/backend/router
amendment: supply exact binding/input/key at admission, commit and replay; provide
the route-local store; mark use only within accepting mutation. The existing
`Approvals.get(id)` shape and backend's outer injected service do not themselves
supply this context. The host test's explicit fixed-invocation adapter is a fixture,
not evidence that these production seams are wired.

## Clause-level evidence and remaining limits

| Clause                                   | Source and executed evidence                                                                                                                                                                                                                                                  | Qualification limit                                                                                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trusted origin and opaque lookup         | Runtime `issueApproval` resolves the consenting human and executing principal against live identity; SQL creates an opaque UUID proof and atomically records issuance. Both SQL dialects pass issuance/lookup controls.                                                       | Trusted explicit-consent completion adapter is still required; no authenticated request may directly mint proof.                                     |
| Exact binding                            | Contract `ApprovalBinding` stores tenant, principal, action, version, canonical input hash and write key. Runtime derives live limits from decoded policy. Tests distinguish changed key/input/array order/principal, not merely malformed input.                             | Production registry/context wiring remains coordinator-owned.                                                                                        |
| Human, delegation and step-up provenance | Runtime refreshes both parties; SQL identity fixtures remove delegation grants and human-session activity after a successful control. `stepUp: false` is the only issued evidence; a live step-up requirement denies.                                                         | Existing OIDC normalized claims do not prove explicit consent or stronger authentication assurance.                                                  |
| Lifetime                                 | `ApprovalSettings` requires trusted configured session maximum and approval window >= five minutes; window <= session maximum. Issuance caps expiry by actual human SQL session. Tests use two-hour configured policy and a shorter actual session, plus exact expiry denial. | No configured production session maximum exists in the searched source. One hour is not adopted.                                                     |
| Cancellation                             | Own pending and independently granted exact tenant permission are exercised with live roles/teams; misleading event scope and another tenant's scope fail. Target permission removal does not prevent own cancellation.                                                       | No trusted event-lead/action-to-event association exists, so event-specific cancellation remains denied rather than fabricated.                      |
| Unavailable/malformed/revoked evidence   | Missing proof, malformed persisted step-up provenance, cancellation, expired proof and failed SQL decision writes deny. Conflicting audit insertion proves rollback after staged proof UPDATE, not just preflight rejection.                                                  | These are first-party provider tests, not external custody/crypto qualification.                                                                     |
| Live execution/replay                    | Public-host fixture uses real provider/identity/Storage and durable Integrity. Success executes once; same-key replay returns cached output only with live proof; human-session revocation denies replay.                                                                     | Fixed fixture adapter is not production backend acceptance.                                                                                          |
| SQL rollback and ordering                | Handler fixture stages domain write, use marker and outbox, then fails: domain/outbox remain empty and proof remains pending. Competing proof use/cancellation serialize on the authority guard; cancel-first blocks use.                                                     | Local transactional evidence only; no power-loss or distributed/external reversal claim.                                                             |
| Retention                                | Default is six calendar months, not 180 days; configurable 90..730 days or calendar two years. Independent leap-day/month-end tests validate retained-until calculation.                                                                                                      | Retention metadata is implemented; no purge job/retention deletion permission is activated. Current immutable evidence must not be silently deleted. |

Session evidence: `packages/integrations/oidc/src/session.ts` explicitly receives
server-owned `expiresAt`, rather than setting a duration. The one-hour value in
`apps/server/tests/keycloak.conformance.ts` is a fixture. Searches across current
identity/runtime/contract/server/OIDC source found no trusted event-lead authority
or configurable application session maximum. Exact production session policy and
trusted event association remain concrete integration prerequisites, not missing
external credentials.

## External effects

Existing `Storage.enqueue`/`command_outbox` stage a local command in the SQL
transaction; idempotency receipts deduplicate the exact local invocation. They do
not establish remote provider idempotency, an outbox delivery worker, compensation
or reconciliation policy. SQL rollback can remove staged SQL writes but cannot
undo an external call already accepted by another system. This lane makes no
external calls, introduces no reversal protocol and authorizes no external effect
activation. Long-running work needs exact input/key consent and fresh execution
and replay authority; approving early does not freeze a live permission snapshot.

## Executed checks

- Production TypeScript build and storage test typecheck passed.
- `pnpm exec nx run-many -t lint typecheck build -p @eventiva/contracts
@eventiva/runtime @eventiva/integrations.sql @eventiva/runtime-tests
@eventiva/storage-tests --outputStyle=static`: passed all targets for five
  projects and three dependencies, with lint warnings but no errors.
- Disposable non-superuser PostgreSQL 17.12 and actual SQLite:
  `bash .amp/in/orb-backup/approval-postgres.sh pnpm exec vitest run --config
tests/storage/vitest.config.mts tests/storage/src/approval.spec.ts
--coverage.enabled=false`: 12/12 passed before additional boundary assertions.
  This focused run does not replace normal coverage gates.
- `node tools/documentation/check.mjs`: 287 editable TypeScript files, zero
  findings after useful internal rationale comments were added. The earlier root
  check exposed 11 missing-rationale findings; they were fixed without exclusions.
- `node --run check`: passed, including 104 documentation-tool tests, planning
  consistency, documentation ratchet and final strict scan (287 files, zero
  findings). This is local/offline consistency, not a live mirror freshness claim.
- Concurrent normal affected test suites failed: contracts 568/575, storage
  263/266, runtime 655/663. Existing inventory/telemetry fixtures timed out under
  the concurrent run; runtime/storage also encountered the deterministic synthetic
  0012 collision described above. No approval test assertion failed. Serial
  normal suites with unchanged thresholds/timeouts are running after the bounded
  fixture repair. Contention is a hypothesis until the repeat establishes it.
  No all-gates or combined acceptance claim is made yet.
- The first serial runtime repeat passed all 663 tests, including both fencing
  dialects with the isolated candidate, but normal branch coverage was 88.77%,
  below the unchanged 90% gate. An additional runtime-project public lifecycle
  test uses actual SQLite proof/identity persistence and the existing
  `identity.profile.set` target grammar. It checks live-limit increase, unavailable
  step-up, cancellation, successful use, same-key repeat and post-use permission
  removal. Focused runtime repeat now passes 4/4; final normal coverage rerun is
  still required. No synthetic proof map/permissive target authorizer was added.
- Serial storage passed 266/266, with statements 94.38%, branches 92.07%, functions
  93.56% and lines 95.47%. Serial contracts passed 575/575, with statements 96.09%,
  branches 93.73%, functions 94.28% and lines 96.39%. These runs include the isolated
  fixture candidate, not its maintainer acceptance. After correcting delegated-use
  audit attribution, final normal runtime/storage reruns are in progress; the
  subsequent focused PostgreSQL/SQLite provider run passed 12/12.

### Final retained-tree repeat

These results supersede the in-progress state above, without hiding the earlier
failed executions. They apply to this lane's changes over base
`23baec94dc9f7dbdf5df70bccf92862bcff2eb09`, including the isolated, unaccepted
synthetic-history candidate. They are not combined acceptance of published Caller.

- `bash .amp/in/orb-backup/approval-postgres.sh pnpm exec nx run-many -t test -p
@eventiva/runtime-tests @eventiva/storage-tests --parallel=1 --outputStyle=stream`:
  exit 0 in 11m25s. Runtime 34 files, 664/664 tests; storage 18 files, 266/266 tests.
  Both real dialects execute. Runtime coverage: statements 95.21%, branches 92%,
  functions 94.64%, lines 96.41%. Storage: statements 94.38%, branches 92.1%,
  functions 93.56%, lines 95.47%. Existing thresholds and timeouts are unchanged.
- `pnpm exec nx run-many -t lint typecheck build -p @eventiva/contracts
@eventiva/runtime @eventiva/integrations.sql @eventiva/runtime-tests
@eventiva/storage-tests --outputStyle=static`: final repeat exit 0; five projects
  and dependencies succeeded. Warnings remain nonfatal; no gate was weakened.
- `node --run check`: final repeat exit 0, including 104/104 documentation-tool
  fixtures, 287 editable TypeScript files and zero strict findings. Mirror/planning
  checks remain offline consistency, not a live tracker freshness claim.
- `git fetch --quiet origin main` and migration allocation readback: published
  head remains `b5e16e8ac59ba628b7b240550844496421a1109e`; each published dialect
  ends at 0011, so this lane's real 0012 is still unallocated on that head.

Retain two separately signed local commits: provider/report/exports/migrations,
then only the synthetic-history candidate. The latter changes no incompatibility
assertion and remains subject to its exact AI-11 maintainer decision. No push,
pull request, production migration or service activation occurred. Retention is
conservative metadata anchored at expiry and never shortened on early use/cancel;
it does not enforce exact deletion six months after an earlier terminal event.
Explicit consent provenance, production session configuration, trusted event
association, actual retention enforcement and coordinated host/backend wiring
remain concrete prerequisites, not silently implemented guarantees.

Graphify Cloud memory and the gateway are not connected; no memory read/write is
claimed. Shared guides, agent docs, timeline, LLMS and Graphify are unchanged in
this retained local checkpoint. The coordinator subsequently published Caller on
`b5e16e8ac59ba628b7b240550844496421a1109e` and released its shared-output reservation.
Before any final publication, ordinarily reconcile the latest published main and
regenerate affected documentation/graph from that actual tree, preserving the
canonical Caller section. These earlier provider tests remain evidence against
`23baec94dc9f7dbdf5df70bccf92862bcff2eb09`, not combined acceptance of the newer tree.
Execution/host approval seams still require coordinated implementation; this lane
does not create a parallel patch. The isolated fixture candidate's AI-11 acceptance
remains pending. This standalone checkpoint does not claim whole EVE-275/Core Done.

Refs: EVE-275
Refs: Resnovas/Eventiva#1063
