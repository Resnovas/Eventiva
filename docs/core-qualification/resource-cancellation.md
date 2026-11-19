# Exact-resource approval cancellation

## START - 2026-11-19T21:28:36Z

Refs: [EVE-275](https://linear.app/resnovas/issue/EVE-275) and
[Resnovas/Eventiva#1063](https://github.com/Resnovas/Eventiva/issues/1063), both
non-closing. Actual source investigation began before this report; no production
or test edits precede this START.

Fetched `origin/main` and fresh task HEAD are
`e0efc5e49392a5d1a629ed321c76131b93d271ad`, including A source
`29317cb320a967b29c805bd15dd458a295a4cbc7`. This isolated task uses branch
`agents/eve275-resource-cancellation`. The earlier Caller qualification checkout,
signed ref and Git bundle remain preserved and unadopted by this task. A's
reported full verification is prior evidence; its exact-head hosted CI is still
pending at dispatch, not independently accepted green here.

## Binding policy and reservation

Jonathan's decision, relayed by Puck on 2026-11-19 with exact human-selection time
unknown, selects explicitly granted resource-scoped `approvals.cancel`
permissions, not inferred lead roles. Permission for one resource must not
authorize another resource in the same event. Trusted registered preparation
captures the resource/event association; cancellation input cannot supply it.
Provenance: [Linear decision](https://linear.app/resnovas/issue/EVE-275#comment-4f74873f-8a81-4b4a-9b81-7810b246c3e5),
independently read [GitHub mirror](https://github.com/Resnovas/Eventiva/issues/1063#issuecomment-7021527992),
and [canonical wiring record](approval-wiring.md#binding-policy-amendment---2026-11-19).
GitHub #1063 was independently read OPEN with its normal
[EVE-275 linkback](https://github.com/Resnovas/Eventiva/issues/1063#issuecomment-6988293684).

Exclusive handwritten scope: runtime `approval.ts` cancellation permission and
association handling; contract `approval.ts` ApprovalEvents documentation and
association semantics only; storage `approval.spec.ts` cancellation coverage and
only separately approved existing-fixture amendments; this report; new agent
chapter `35_approval_cancellation`; append-only cancellation notes in the action
people/agent guides. Mechanical LLMS/clean-source Graphify regeneration is
authorized for this lane. C owns retention capability/SQL/tests/report/chapter34,
additive migrations, narrow export entries and the global timeline; those are
read-only here. Coordinator ownership handshake has been sent.

Preserve every shared data schema/export/record/retention/CAS shape, live human,
session, membership, role/team and expiry checks, dedicated tenant-wide grants,
own-pending cancellation, immutable approver provenance and atomic audit. No
host/execution/invocation/router/backend/SQL producer/manifest/config/migration
or session-policy edits. The selected real-activity-only one-hour idle/eight-hour
absolute session policy remains verbatim and unimplemented by this lane; its
qualifying-activity/trusted-ingress question remains Jonathan's. No event-domain
table, implicit lead role, new dependency, paid work, production activation,
retention cleanup or whole-Core acceptance. EVE-248 stays January 2027;
budgets/settings remain unchanged.

## Completed, current and upcoming

| State     | Actual evidence / next step                                                                                                                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Completed | Policy/pair verified; bounded permission correction and approved separate fixture commit retained; all nine original assertions and shared guide prefixes preserved; focused two-engine controls and unchanged full verification pass. |
| Current   | Fresh origin/main still equals the START base; no reconciliation conflict. Preparing signed source and clean-source graph delivery, with exact-head hosted follow-up still pending.                                                    |
| Upcoming  | Publish only the verified signed commits directly to main, subscribe to exact-head CI and report its actual result on the owning pair. Whole EVE-275/Core and production authorization remain separate.                                |

No new test result, repaired-source acceptance, commit or publication is claimed
by this START. Graphify Cloud/gateway memory tools are not connected; this lane
uses the local graph, direct source, connected Linear and authenticated GitHub
reads without claiming a memory lookup.

## Distinguishing evidence and fixture hold

[Linear START](https://linear.app/resnovas/issue/EVE-275#comment-29afe56d-564d-4594-bcac-4a8dc6fd057b)
has an independently read [explicit GitHub mirror](https://github.com/Resnovas/Eventiva/issues/1063#issuecomment-7022808999).
Complete GitHub comment enumeration found no matching automatic START mirror
before explicit creation. Coordinator confirms no competing writer for the
ApprovalEvents documentation-only slice; C's existing shared schemas are read-only.
The [blockage reply](https://linear.app/resnovas/issue/EVE-275#comment-7b7f57b5-4042-4b8d-908a-a6d9c8f181bb)
also has an independently read matching [automatic GitHub mirror](https://github.com/Resnovas/Eventiva/issues/1063#issuecomment-7022928138).

The unchanged producer already stores `{ event, resource }` derived from canonical
registered preparation. The runtime amendment changes only the other's scoped
cancellation permission comparison from `event:<event>` to the exact captured
`resource`; dedicated tenant-wide and consenting-human paths remain intact.
`canCancel` retains its existing signature and now documents continued trusted
tenant/event association, not implicit lead authority. A printed TypeScript AST
comparison with comments removed proves the entire approval contract's executable
syntax unchanged. SQL producer, terminal-retention formula, CAS, schemas, exports,
host and session policy remain untouched.

Executed focused command, from this worktree through the existing immutable
pinned PostgreSQL 17.12/SCRAM/non-superuser helper:

```sh
CALLER_FIXTURE_NAME=eventiva-resource-cancellation bash /home/user/workspace/repo/.amp/in/orb-backup/caller-qualification/with-postgres.sh pnpm exec vitest run --config tests/storage/vitest.config.mts tests/storage/src/approval.spec.ts -t 'cancels only explicitly|requires captured event' --coverage.enabled=false
```

- Unchanged production: exit 1, new tests fail 2, original cases pass 2, 14
  unselected. The new trusted adapter checks association only; an event-shaped
  grant incorrectly cancels without the selected exact-resource permission.
- Reserved runtime correction: exit 1, new tests pass 2, unchanged original
  event/lead cases fail 2 with `ApprovalFailure: denied` at the final successful
  cancellation (baseline line 508). These cases still grant only `event:event-a`.
- Logs are retained privately as
  `.amp/in/orb-backup/resource-cancellation/{baseline-red,unchanged-fixture-conflict}.log`.
  Focused selection/coverage disablement is diagnostic only, never a substitute
  for final unchanged normal/full gates.

The exact existing-fixture amendment was sent to coordinator/Puck before editing:
replace wrong/valid event grants with wrong/exact resource references, and replace
the implicit `lead` check/toggle with current `associationAvailable`. Preserve
every denial, reassignment/lookup-binding check, success, own-cancel and retention
assertion. Coordinator relayed it for explicit Puck/Jonathan decision and has NOT
approved an AI-11 override. A direct byte comparison confirms the entire original
case remained unchanged at that blocked checkpoint. Earlier synthetic-history
approvals did not apply. The known red case prevented acceptance/publication
until the exact subsequent decision below.

New permanent coverage uses the public registered host review to capture two
different resources in one event and compares persisted scopes with those
reviews. It covers exact-resource success, different-resource and event-shaped
grant denial, misleading role name, association absence/unavailability/change,
live team/grant/membership/session/tenant loss, authorized repeats, immutable
approver and atomic cancelling-actor decision. Additional audit-failure rollback
and exclusive expiry controls passed on both engines in the final focused run:
two passed, sixteen diagnostically unselected, exit 0. The feature association adapter
is synthetic; both identity/proof/audit engines are real SQL. No production
event-domain provider or exploit reachability is claimed.

| Executed command                                                                                                                       | Decisive result                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec nx run-many -t build -p @eventiva/contracts @eventiva/runtime @eventiva/integrations.sql --parallel=1 --outputStyle=static` | Exit 0, four builds, no cache hits.                                                                                                                                                                                                |
| `pnpm exec nx run-many -t lint typecheck -p @eventiva/runtime @eventiva/storage-tests --parallel=1 --outputStyle=static`               | Exit 0, ten tasks; zero errors, 23 test-only non-null warnings. Repeat after final additive audit/expiry controls also exited 0, five cache hits.                                                                                  |
| `node --run check`                                                                                                                     | Exit 0: 104 documentation fixtures, 292 editable TypeScript files, zero strict findings/ratchet violations; 258 captured issues/692 edges and zero stale outputs. Offline snapshot consistency is not full live freshness.         |
| `pnpm exec nx run @eventiva/runtime-tests:test --outputStyle=static`                                                                   | Exit 0, 35 files/675 tests; normal coverage: statements 93.74%, branches 90.39%, functions 93%, lines 94.79%. No cache hit.                                                                                                        |
| `pnpm exec nx run @eventiva/boundaries-tests:test --outputStyle=static`                                                                | Exit 0, one file/31 tests. No cache hit.                                                                                                                                                                                           |
| `pnpm exec nx run @eventiva/storage-tests:test --outputStyle=static`                                                                   | Exit 1: 17 files pass, one fails; 270 tests pass and exactly the two unchanged event/lead cases fail with denied. Both migration process-recovery prerequisites pass. No case excluded and no storage coverage acceptance claimed. |

The standalone documentation scan initially reported one missing own-body
rationale on the new association resolver. An accurate registered-wire trust
boundary comment resolved it; no checker/threshold/exception changed. No signed
task commit, publication or hosted success is claimed at this checkpoint.

## Retained blocked checkpoint before fixture approval

The policy change and additive controls are uncommitted on
`agents/eve275-resource-cancellation` at the exact START base. The old signed
Caller qualification remains preserved and unadopted. Owned tracked changes and
new documentation also have recovery copies in the original checkout's ignored
`.amp/in/orb-backup/` directory; no secret is included. Root check was repeated
after the final additive controls and report update, exiting 0. Full `verify`,
clean-source graph regeneration, signing, rebase/delivery and exact-head CI remain
pending the fixture decision and subsequent complete green gates. This is a
blocked implementation checkpoint, not shipped work or whole EVE-275 acceptance.

The [complete gate checkpoint](https://linear.app/resnovas/issue/EVE-275#comment-02761b0b-6696-4983-82b0-a727053615f1)
has an independently read matching [GitHub mirror](https://github.com/Resnovas/Eventiva/issues/1063#issuecomment-7023134392).

## Exact fixture approval and resumption

Jonathan explicitly approved the exact isolated amendment with "Yes please",
relayed by Puck through the coordinator on 2026-11-19; the human decision's exact
time is unknown. This authorizes only the original storage cancellation case:
wrong/valid event grants become `registered-target-18`/`registered-target-17`,
`lead` becomes `associationAvailable` in its Ref/check/toggles, and the description
and corresponding rationale describe association rather than lead authority.
Every denial, binding, reassignment, success, own-cancel and retention assertion
is preserved. This is not a broad AI-11 waiver. The fixture amendment is retained
as its own signed commit, separate from runtime behavior and additive coverage.

Actual resumption fetched `origin/main` at the unchanged START base. C's retained
paths and the coordinator's session-renewal/ingress implementation stay outside
this reservation. No session/SQL identity source or selected session-policy text
is changed. Earlier red logs and the blocked normal storage result remain
evidence, not deleted or relabeled as green. Full verification follows the
approved amendment before delivery.

The [resumption record](https://linear.app/resnovas/issue/EVE-275#comment-74025e25-de37-49d5-9491-bd58f85e4633)
has an independently read matching [GitHub mirror](https://github.com/Resnovas/Eventiva/issues/1063#issuecomment-7023244995).
The isolated fixture commit is
`84e4ac9745dfc18f0b886a1343fc86ed0ff60b6b`, with a verified good signature,
Jonathan's author/sign-off, AI attribution and both non-closing references.
TypeScript AST extraction compared all nine original expectation chains in the
baseline, staged and working case; all are identical after whitespace
normalization. Both action guides retain their complete original content,
including session policy, byte-for-byte before cancellation-only appendices.

Approved focused green command:

```sh
pnpm exec vitest run --config tests/storage/vitest.config.mts tests/storage/src/approval.spec.ts -t 'cancels only explicitly|requires captured resource' --coverage.enabled=false
```

With the disposable PostgreSQL fixture, exit 0: four tests passed across SQLite
and PostgreSQL, fourteen diagnostically unselected. This includes the amended
original case and new distinguishing coverage; it does not replace the running
unchanged full gate. The green log is retained alongside the earlier red logs.

## Interrupted gate and actual resumed verification

The first full `node --run verify` did not complete. Its retained log records 102
successful tasks and a stopped storage test; storage lint/typecheck were not run
in that attempt. After the reported limit reset, PID 382770 was no longer tracked
and the log ended in `Terminated`, not a successful aggregate. No cause beyond
that observed interruption or full-green result is inferred.

The first resumed fixture attempt exited 125 because the interrupted run's owned
disposable database still occupied loopback port 5432. Inspection found that
orphaned test container; stopping it and removing its disposable network cleared
the conflict. A fresh fixture then started the same unchanged full command.
The interrupted log is retained as
`.amp/in/orb-backup/resource-cancellation-verify-interrupted.log` in the original
checkout. Neither a focused selection nor an interrupted subset substitutes for
the final complete gate.

## Full local verification - 2026-11-19

The resumed unchanged `node --run verify`, inside the disposable PostgreSQL
fixture, exited 0. It ran root check, all 15 build projects, source boundary
fixtures, all 105 lint/typecheck/test/build/parity tasks (78 valid cache hits),
emitted boundaries and all three smoke projects with fourteen prerequisites
(17 tasks, eleven cache hits). The normal storage target and both migration
process-recovery prerequisites passed without excluding any existing case or
changing coverage settings. Prior normal runtime evidence remains 675 tests
with thresholds intact. The final full log is retained as
`.amp/in/orb-backup/resource-cancellation-verify-resumed.log` in the original
checkout.

Decisive boundary output: 287 source files/1,405 edges/34 packages and 98 emitted
files/499 edges, zero violations and zero package cycles. Full verification
included web/Android exports and browser/server smoke; it does not claim a real
Android device test or production activation. An immediate fresh fetch still
resolved `origin/main` to the exact START base, so the verified source required
no cross-lane reconciliation. Clean-source graph and final root checks follow
before publication; exact published head/hosted CI are recorded on the pair and
in the reporting thread, not inferred from this local success.
