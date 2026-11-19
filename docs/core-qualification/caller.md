# Canonical Caller qualification

## START - 2026-11-19

Bounded authorized acceptance investigation for [EVE-275](https://linear.app/resnovas/issue/EVE-275)
and [Resnovas/Eventiva#1063](https://github.com/Resnovas/Eventiva/issues/1063).
Fetched baseline: `9fb0bda2167be0499a4a3ed729c5fa033f23dd7a`; HEAD and
origin/main match. GitHub issue 1063 is OPEN and its normal
[linkback 6988293684](https://github.com/Resnovas/Eventiva/issues/1063#issuecomment-6988293684)
points to EVE-275. Live Linear description and terminal 16-comment page read.
The latest START reserves only this report and
`tests/runtime/src/caller-qualification.spec.ts` for this lane.

Production and existing tests are read/run only. The investigation will map
registration, presented and trusted resolved identity across public host
handlers, authorization, policy, audit, receipts, deduplication and replay,
including tenant/delegation controls. Synthetic resolver differences do not
establish production reachability or an exploit. No regression is claimed
without a failing competing implementation. No publication, shared generated
output, timeline, issue status or whole-Core acceptance is authorized here.

State at START: source mapping and existing-test qualification pending. Tests
had not yet run. Protected-source mismatches would be reported without edits.

## Finding - generic propagation is not established

On unchanged production baseline, a successful handler reads the **presented**
ambient `Caller`, while coarse authorization, decoded-target authorization,
execution policy, receipt attribution and host deduplication use the **resolved**
identity. Registration identity is not retained by the service-free handler.
The read and mutation cases both expose the split when a trusted fixture
resolver deliberately returns different identifiers. Mutation replay returns
the original handler output without another handler entry, while recording a
new receipt attributed to the currently resolved caller.

This is a reproduced generic host-boundary mismatch, **not a demonstrated
production exploit, historical regression or whole-EVE-275 acceptance**. The
current production resolver preserves canonical identity fields while checking
live authority. The retained tests characterize observed behavior; their green
result is explicitly not a green canonical-propagation acceptance verdict.

### Executed distinguishing probe

The test-only acceptance probe changes the first handler-output expectation in
`caller-qualification.spec.ts` from `{ caller: presented }` to
`{ caller: canonical }`; all production bytes remain unchanged. Run:

```sh
pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/caller-qualification.spec.ts --coverage.enabled=false
```

Observed: exit 1; **2 failed, 8 passed**. Only synthetic read/write substitution
cases fail. Both return successful output with human subject/session/tenant
suffix `02`, rather than the expected external-agent identity suffix `03` and
delegating human suffix `04`. The equal-identity read/write controls, successful
already-canonical delegated mutation/replay, and five post-wait identity-change
denials pass. Private complete diagnostic:
`.amp/in/orb-backup/caller-qualification/canonical-probe.log`.
The one-line probe was restored to the factual characterization before normal
gates. No source candidate was patched, no regression repair is claimed, and no
existing test expectation was changed.

## Requirement and coverage map

All source references below refer to baseline
`9fb0bda2167be0499a4a3ed729c5fa033f23dd7a`.

| Clause                                           | Existing source / coverage                                                                                                                                                                                                                            | Added evidence and limit                                                                                                                                                                                                                                                                                |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Per-invocation rather than registration identity | `host.spec.ts`, `reads the caller on every call`, checks coarse permission with distinct subjects. `Caller` contract is in `packages/contracts/src/caller.ts:37-46`.                                                                                  | Successful read and write handlers return the full invocation identity; registration subject/session/tenant differ. No new layer or feature-owned bridge supplies Caller.                                                                                                                               |
| Resolved versus presented identity               | `execution.ts:216-235` sends resolved caller to authorization and policy; `execution.spec.ts:903-920` checks refreshed delegated denial/receipt, not successful handler identity.                                                                     | Synthetic substitution succeeds but returns presented identity; full authorization/policy observations and receipts equal resolved identity. The stronger canonical handler-output probe fails twice.                                                                                                   |
| Successful mutation evidence and replay          | `execution.ts:281-350` runs prepared work, passes resolved caller to Integrity, and audits replays separately. Existing A1 tests cover once-only writes and exact input conflict; A2 covers identity/permission/target/approval revocation on replay. | One handler entry for new work plus same-key replay; domain/history/outbox identity observations stay presented, committed and replay audit receipts resolved, with distinct receipt ids. Volatile harness only, not SQL crash proof.                                                                   |
| Tenant/principal deduplication                   | Host key at `execution.ts:288-294`; durable secondary key at `storage.ts:83-90`.                                                                                                                                                                      | Same key with only tenant changed and only principal changed each executes fresh work. Changes are independent, so a key omitting either dimension cannot pass. Harness does not model durable delegation keying.                                                                                       |
| Delegation                                       | `identity.spec.ts:384-490` tests live own/human/delegation grant intersections, expiry, revoked human session and forged delegation.                                                                                                                  | Successful already-canonical external-agent handler and replay retain `onBehalfOf`; synthetic substituted delegation remains absent in handler while present in receipts/policy. Routine agent preauthorization is explicit fixture policy, not production approval evidence.                           |
| Identity stability during waits                  | `execution.ts:255-280` compares subject/session/tenant/kind/onBehalfOf; existing A3 covers post-wait new/replay denial and current authority.                                                                                                         | Each of five tuple fields is changed independently after preflight at the Integrity barrier. All five deny `identity-changed`, with no handler entry/domain/history/outbox/dedup and one initial-caller denial receipt. These new five cases exercise new work; existing replay cases remain unchanged. |
| Durable evidence binding                         | `storage.ts:48-50,78-90,105-118`; `tests/runtime/src/storage.spec.ts` rejects mismatched receipt identity and tenant.                                                                                                                                 | Read/run existing cases, no new SQL/storage tests. Durable adapter includes delegation in its key and validates all five receipt fields. The in-memory harness does not prove these production adapter properties.                                                                                      |

## Real ingress and production reachability

1. `identity.ts:95-144,198-209`: `identitySecurity` decodes presented identity,
   requires its tenant to equal the routed tenant, locks the trusted store,
   checks active principal/membership/session, matches session subject and
   principal kind, and validates agent delegation and the delegating human's
   live session. It returns the validated `caller`, not a different subject,
   tenant, kind, session or `onBehalfOf`. Revocation changes permission to act,
   not identifiers carried by `CallerIdentity`; grants are not identity fields.
2. `identity.ts:286-330`: `authenticateTokenSession` verifies configured token
   provenance/claims, resolves the issuer/subject link and stored session, builds
   canonical identifiers from trusted records, then invokes the resolver.
3. `apps/server/src/http-actions.ts:100-129,138-169`: HTTP derives identity from
   that authentication, not the submitted envelope or tenant header. Dispatch
   goes through `ClusterActions`; input cannot name another Caller. This source
   path is supported by the existing real HTTP/SQL suite, not a new endpoint.
4. `apps/server/src/cluster-actions.ts:77-105,126-143`: sender resolves before
   constructing the persisted request; receiver independently resolves and
   rejects tenant-route mismatch, then explicitly provides the resolved Caller
   to the backend. `backend.ts:52-92` omits captured Caller/storage/transaction
   from shared dependencies, routes by received tenant and builds the host
   inside that route. No Cluster source or test was changed here.
5. `apps/server/src/access.ts:55-65`: shell resolution accepts only its exact
   process-owned nondelegated service tuple; it cannot synthesize the differing
   fixture tuple either. `FailClosed` in `invocation.ts` denies unresolved
   composition rather than trusting claims.

Consequently the deliberately all-different fixture tuple cannot be produced
by these inspected identity-preserving resolvers. A change or custom resolver
that substitutes identifiers is necessary to make the generic split visible
through those compositions. Current live policy/delegation/session revocation
still must succeed; identifier equality is not cached authority. This is a
source/control conclusion, not proof that every possible deployment or future
custom resolver preserves identifiers.

### Module environment boundary

`host.ts:440-467` binds module-owned Layers to `prepared.run` at registration;
`ServerModule<R>` requires declared handler dependencies to be supplied by that
Layer. The probe uses `Effect.serviceOption(Caller)`, the same optional ambient
lookup pattern used by existing feature handlers, without falsifying an Effect
requirement or declaring a module-owned Caller service. Explicitly installing
a different Caller inside trusted module code is a different composition and
was not tested as an untrusted caller exploit.

`settings.ts:41-88` already has an explicitly feature-local canonical Caller
bridge through `prepared.authorize`. `catalogue-import.ts:409-504` similarly
consumes per-preparation canonical authority for its run. Those bridges must
not be mistaken for a host-wide guarantee. CRM's generic `run` in
`crm-organisation.ts:69-82` reads ambient Caller and validates routed tenant;
its contact refresh separately refuses identity tuple changes. No synthetic
CRM exploit, feature expansion or bridge removal was attempted.

## Protected-source escalation and proposed scope

Reported promptly to the coordinator after the first executed reproduction.
The narrow source location is `packages/runtime/src/execution.ts:284`:
`const run = prepared.run`. A possible amendment would provide the already
resolved Caller to handler execution before both the read and mutation paths.
That is a proposal only: an outer provision alone must not be assumed to
override an explicitly module-owned inner Caller Layer, and feature-local
admission bridges/transaction contexts must remain intact. Any authorized
amendment needs an unchanged-source failing canonical-output regression plus
equal-identity, delegated, module-layer, replay and durable transaction controls.
No production edit, permission request to bypass ownership, architecture
adoption, dependency or policy change is included in this investigation.

Generic canonical propagation remains unqualified. Whether current
identity-preserving ingress plus feature bridges satisfies a narrower
acceptance wording is an explicit coordinator/owner decision, not silently
selected here. EVE-275 and Core remain open.

## Verification and retained state

Initial focused run (before adding the delegated positive control): four files,
147 tests passed. Final expanded focused run: four files, **148 tests passed**.

```sh
NX_DAEMON=false pnpm nx run-many -t lint typecheck --projects=@eventiva/runtime-tests,@eventiva/runtime --parallel=1
pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/caller-qualification.spec.ts tests/runtime/src/host.spec.ts tests/runtime/src/execution.spec.ts tests/runtime/src/identity.spec.ts --coverage.enabled=false
pnpm exec vitest run --config apps/server/vitest.config.mts apps/server/tests/cluster.spec.ts --coverage.enabled=false
pnpm exec vitest run --config apps/server/vitest.config.mts apps/server/tests/http-actions.spec.ts apps/server/tests/backend.spec.ts --coverage.enabled=false
NX_DAEMON=false pnpm nx run @eventiva/runtime-tests:parity --skip-nx-cache
```

Passed: lint/typecheck for both projects and seven dependency tasks; 11
successful tasks, zero cache hits. Focused host/execution/identity plus new
qualification: 148 tests in four files. Existing Cluster protocol: 11 tests
in one file. Actual HTTP/backend: two tests in two files, with the documented
pinned disposable PostgreSQL fixture, not a production target. Explicit parity
target: four tests in one file, uncached. `node tools/documentation/check.mjs`
reports 276 editable TypeScript
files and zero findings. Useful contracts and phase/security rationale were
reviewed; no type erasure, private imports or source exceptions were added.
An initial scanner finding on the parameterized suite body was resolved by
explaining why read/write and equal/substituted observations are crossed.

The first fixture-backed normal runtime test/coverage gate passed 653 tests in
30 files, with unchanged 90% thresholds: statements 95.69%, branches 92.67%,
functions 94.96%, lines 96.81%. Root `node --run check` also completed all its
gates, including 104 documentation fixtures, zero ratchet violations and zero
strict findings. The enclosing first helper nevertheless exited 127: editing
the running shell helper to support a second fixture caused Bash to resume at
a changed file offset and read a command fragment after the child command had
completed. That is a validation-helper error, not a passing top-level command
or a source/test failure. The complete repeat below exited **0**, with the
helper unchanged throughout execution and the same 653 passing tests and
coverage percentages. Root check repeated successfully: 55 storage guard
fixtures, 12 reference fixtures, 104 documentation fixtures, 276 TypeScript
files / zero findings, ratchet zero violations. Captured offline planning
remains 258 issues / 692 edges / zero unresolved sources / zero stale outputs;
that is not current live snapshot freshness or whole-Core acceptance.

```sh
NX_DAEMON=false bash .amp/in/orb-backup/caller-qualification/with-postgres.sh bash -c 'pnpm nx run @eventiva/runtime-tests:test --skip-nx-cache && node --run check'
```

Final repeat log: `.amp/in/orb-backup/caller-qualification/final-gates.log`.
The HTTP/backend run used the same documented image with independent per-run
credentials on a second loopback port; both fixtures/networks were removed.
No whole-workspace `verify` or hosted CI was run for this unpublished slice;
affected runtime lint/typecheck/build/test/parity and root check are the gates
executed here. Coordinator integration must regenerate reserved shared
documentation/graph outputs before any separately authorized publication.

Complete logs are private under `.amp/in/orb-backup/caller-qualification/`;
the helper generates fresh per-run credentials and tears down its own
disposable loopback fixture. No credential values are embedded in tracked
files, the helper or this report, or printed by the fixture setup.

Graphify setup/query supplied source orientation. Graphify Cloud memory and
the MCP gateway are unavailable; direct connected Linear reads and
authenticated GitHub API reads verified the pair. Existing repository API
usage supplied all implementation patterns; no new vendor API was assumed.
Shared timeline, agent guide, LLMS, Graphify outputs and tracker status remain
coordinator-owned and unchanged. Local signed retention only; no push, PR,
deployment, production activation, paid call or EVE-248 work.
