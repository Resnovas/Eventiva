# Bootstrap timeout investigation

Both historical failures hit the 5000 ms whole-test deadline. Their slow phase
is not recoverable from the preserved logs. Jonathan subsequently confirmed
that both child and aggregate performance are required contracts, authorizing
the budgeted, timed harness and enforcement below without increasing limits.

## Mandatory phase evidence

On 2026-11-20, [Puck](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a)
relayed Jonathan's binding correction after the exact renewal-tree diagnostic:
ordinary bootstrap probes must retain root and finalizer phases, not only outer
process timing. Exact human-selection time is unknown. The coordinator cleared
the four telemetry harness/spec paths and this isolated documentation slice on
published `d40a76b7`. [EVE-261 START](https://linear.app/resnovas/issue/EVE-261#comment-77d21146-ce70-4759-ab3f-53258432f492)
owns the fix, separately from renewal qualification and PR59/step2 adoption.

Core qualification previously passed `journal=false` and omitted the preload.
Outer timing already existed; module/root/finalizer evidence did not. Its ten
launches now use the existing `--import ./tests/telemetry/fixtures/bootstrap-diagnostics.mjs`
and assert root/release evidence. Every 2300ms child budget, the 30000ms test
limit and all business assertions remain unchanged. The prior failed child's
unobserved phase cannot be recovered retroactively.

Observer parity still needs its no-preload arm, and missing-descriptor coverage
still needs fd3 absent. Both now assert outer `spawn-request`, `spawned`, `exit`
and `close`. `spawned` means OS process creation, not application readiness;
output readiness is recorded separately only when observed. The harness emits
explicit `close` before the existing `total`, even without fd3 or after
cancellation. `journal=false` controls fd3 only; the test timing flag remains
mandatory ON. No payload enters these numeric, closed-phase records.

Regression checks first failed on unchanged source for the missing core journal
and explicit close. After correction all 14 affected core/harness/observer tests
passed in 30.57s; `node --run verify:static` then passed before documentation.
The focused command below disables coverage for regression diagnosis only:

```sh
pnpm exec vitest run --config tests/telemetry/vitest.config.mts tests/telemetry/src/core-diagnostics-qualification.spec.ts tests/telemetry/src/child-process.spec.ts tests/telemetry/src/bootstrap-diagnostics.spec.ts --coverage.enabled=false
```

The touched launch/close callbacks reuse the existing observer and timing writer,
not another loader/process owner. No performance optimization is implemented or
speedup claimed; the [preceding diagnostic](https://ampcode.com/artifacts/renewal-bootstrap-diagnosis-3ff1fb68-04f0-41b2-a59c-504e10dbc0b4)
retains scheduling-sensitive measurements, not causal CPU-cost evidence.
JSDoc now explains ordinary observation and mandatory close without fd3.
Normal installed-hook qualification within1200s, the approved pinned disposable
PostgreSQL fixture and separate clean graph delivery remain required. Only
after separately qualified publication may renewal's owner run one fresh measured
attempt. No main/renewal source, managed core, scheduling or verification
implementation changes belong to this fix; EVE-261 remains open.

### Source hook passed; final integrated delivery remains separate

The actual installed source/docs pre-commit passed at
2026-11-20T12:22:40.996461Z, 1172.466983s after entry at
12:03:08.529459Z. Fixture/commit/cleanup wall time was 1179.44s, within 1200s.
All 38 aggregate tasks passed in rounded 13m27s (27 cache hits); all 3 smoke
projects/17 tasks passed in 1m51s (12 hits), preserving web-before-Android.
Serial feature manifest `1958c84e-89fa-41f6-8169-11bd3a82ebd4` passed telemetry
92/92 with featureConcurrency 1/NxParallel 1. The staged tree stayed
`9e9ea0602b7080ac0c412d6ffb557e90107daaf9`; no failed gate or retry occurred.
This is measured cache-aware execution, not a cold-run guarantee.

During delivery, fetched main advanced only policy/docs/graph for the separate
licence prerequisite to `d9efa5cf51f4ab1aafecfaabba245ea5a961e9b1`. Rebase
preserved both additive timeline sections and left the executable candidate
unchanged; source is now `e0fc57a5a565800abb03dc1ccf2242eeb891622c`.
Regenerate the clean graph and reverify the integrated staged tree through its
own normal hook before publication. Final graph-hook, remote and exact-head
CI results belong on the same non-closing lifecycle pair, not inferred here.
The disposable fixture/container/network/daemon were stopped after the source
hook; originals, raw logs, Trace2 and feature manifest remain retained.

## H follow-up: avoid unrelated bootstrap imports - 2026-11-20

This newer failure is a measured **2300 ms child timeout**, not either historical
5000 ms aggregate timeout below. The [replacement owner](https://ampcode.com/threads/T-5dcbf3b4-41e4-4df0-906d-93629eebe199)
read [H's preserved hook evidence](https://ampcode.com/threads/T-191ac145-222c-496f-bac9-a3b9e52e2e1b)
and started from fetched published `a959f9ea2042fb6d850d06f953e6bf7abda70a20`,
with its original frozen dependencies, not unpublished renewal or dependency
reconciliation. [EVE-261 diagnosis checkpoint](https://linear.app/resnovas/issue/EVE-261#comment-edcd0e8f-56a8-4d60-bc09-ca843f514141)
records the non-closing ownership and measurements. Puck assigned diagnosis;
the coordinator subsequently cleared exactly the `NodeRuntime` import line in
`apps/server/src/main.ts`. No lifecycle body, harness, budget, assertion, test,
configuration, dependency or instrumentation implementation changes.

### Exact failing phase and responsible import

H's `bootstrap-diagnostics.spec.ts:80` failure is the observed half of the
`telemetry_enabled: false` output/exit noninterference pair. Correlation key
`startedAtMs=1795157635014`, child 2, distinguishes it from the intentional
10000 ms timeout and native-pressure controls:

| Phase | Milliseconds after parent launch |
| --- | ---: |
| Child observer / entry source available | 38 / 40 |
| Module 256 / Effect source / module 1024 available | 359 / 1607 / 1983 |
| Root starts after imports/evaluation | 2123 |
| Main use / services / telemetry released successfully | 2231 / 2240 / 2249 |
| Bootstrap use / root complete successfully | 2250 / 2255 |
| Deadline / OS exit / pipe close | 2303 / 2320 / 2320 |

The unobserved original closed at 1773 ms. Most observed time precedes root
execution; the scopes completed, but natural process exit was not observed
before termination. Exit and pipe close coincide, so the record does not show
an inherited-pipe drain hang. It does not identify the final pre-exit wait or
prove recurrence of the earlier V8 forced-exit deadlock. Module-source hooks
are availability milestones, not individual evaluation profiles.

`@effect/platform-node` eagerly exports HTTP, cluster, socket, worker and other
adapters. Its published index exports the identical `NodeRuntime` namespace
from `./NodeRuntime.js`; importing that public subpath directly preserves
`runMain` and avoids unrelated work. A diagnostic load-hook intervention changed
only this import while leaving actual entry source and dependency versions
otherwise intact. Completed idle controls counted 1229 modules / 121 platform
modules / 110 Undici modules before, versus 770 / 13 / 0 after; Effect remained
362. CPU user/system samples were 1520.677/252.080 ms versus 989.688/71.834 ms;
reported maximum RSS was 259932 versus 160300 KiB. Idle wall times 1451/832 ms
are one observation, not a statistical speedup or cold-cache claim.

### Controlled red and green, with the same limits

The orb exposes two CPUs and Node 24.22.3, PNPM 12.18.0 and Vitest 4.1.12.
Two finite Node loops used `performance.now()` and arithmetic for at most 45 s;
the parent terminated and awaited them after each diagnostic. This is a stated
load envelope, not reconstructed evidence of H's contemporaneous CPU pressure.
No OS/compiler cache flushing, compile cache, retry-until-green or Nx scheduling
change was used.

The unchanged actual Vitest false-setting control failed with both children
timing out: original close 2448 ms; observed root 2209 ms, deadline 2306 ms,
close 2434 ms. A fixed baseline/candidate/candidate/baseline/baseline/candidate
load comparison then produced three baseline deadlines at 2339/2335/2438 ms
and three candidate natural exit-0 closes at 1546/1481/1780 ms. The diagnostic
loader added measurement overhead to both arms. Timeout-censored baseline
durations cannot support a percentage speedup.

After the literal one-line source correction, the **same actual Vitest command**
under the same two-process load passed: original close 2222 ms; observed root
1280 ms, successful root/natural exit 1547 ms, OS exit/close 1575 ms. Both retain
2300 ms child and 5000 ms enclosing limits. Assertions are unchanged. The
acceptance execution uses no diagnostic load hook or source override:

```sh
pnpm exec vitest run --config tests/telemetry/vitest.config.mts tests/telemetry/src/bootstrap-diagnostics.spec.ts --coverage.enabled=false -t 'preserves server output and exit with settings telemetry_enabled$'
```

That selector is red/green diagnosis, not package coverage: six unselected cases
are reported as filtered. Full `pnpm nx test @eventiva/telemetry-tests --skip-nx-cache`
then passed all 92 tests in 59.28 s, without coverage overrides: statements
96.2%, branches 95.61%, functions 91.76%, lines 96.5%. The existing real-process
regressions cover output/exit parity, all opt-outs, scope release, bounded
capture, native pressure, the real timeout and cancellation; no private-import
snapshot test was added. `node --run verify:static` passed first: 15 builds,
83 lint/typecheck/dependency tasks, source 296 files/1450 edges and emitted
100 files/502 edges, zero violations/cycles. Raw before/candidate/after logs,
module counts and bounded measurement scripts are retained in this owner's
`bootstrap-load` backup. No throughput, universal host determinism or full-hook
acceptance is inferred from focused measurements.

### Why H reached 19m39s before smoke/features

Git Trace2 records the outer installed pre-commit from
`2026-11-20T06:47:36.672865Z` through `07:07:16.191135Z`: 1179.518258 s,
natural exit 1, not the surrounding 1200 s timeout. The first post-static
`write-tree` is at `06:49:09.290109Z`, 92.617244 s after hook entry, including
boundary graphs, launch and snapshot overhead. The hook runs `verify:static`,
then `verify`, whose first command is **another `verify:static`**. Recorded Nx
lint/typecheck bodies were 70 s and 75 s; build bodies were 211 ms and 105 ms.
Boundary source/declaration graphs ran twice too. Four later Node fixture
groups took 5.404/2.386/9.966/29.835 s; root/tool/graph/launch costs add overhead.

The main Nx aggregate alone reports a rounded **15m18s**, with 37 successful
tasks and 15 cache hits, and continued other targets after telemetry failed.
Subtracting that rounded duration leaves approximately 261.5 s before the
aggregate, not another telemetry wait. Beyond the first 92.617 s, exact internal
stage start timestamps are unavailable; do not invent precise residual splits
or sum overlapping task durations. Smoke and serial feature evidence are later
`&&` stages and were never reached. The funnel owner received this breakdown;
this patch does not remove duplicate static verification or change parallel 2,
Android-after-web, hooks, registry or feature serialization.

### Actual corrected-tree hook: aggregate passes, outer deadline blocks delivery

The real signed-commit attempt started at `2026-11-20T07:33:31.385922Z` on
the same published base and original frozen dependencies, using the unchanged
installed hook (`node --run verify:static`, then `node --run verify`). Puck
authorized exactly H's existing pinned, local-only disposable PostgreSQL
fixture: PostgreSQL 17.12 Alpine 3.24, SCRAM, non-superuser `CREATEDB` role,
loopback-only connection, two CPUs/1 GiB/256 PIDs and 256 MiB temporary data.
No new image version, fixture policy, dependency or service configuration.

The surrounding **`timeout 1200` exited 124**, terminating the attempt during
smoke. This is not a successful installed hook or a new telemetry child failure:

| Gate reached | Actual outcome |
| --- | --- |
| First and repeated static | Both pass: 15 builds each; 83 lint/typecheck/dependency tasks each, 78 s/72 s lint/type bodies, zero source/declaration boundary violations/cycles. |
| Root and Node fixture checks | Pass; normal hook and staged-tree guards remain installed and unchanged. |
| Main Nx test/build/parity aggregate | All 38 tasks pass in rounded 14m45s, with 15 cache hits, including telemetry, runtime, contracts and storage. |
| Smoke | Entered; server smoke passes. Remaining client/web smoke interrupted by the outer bound, not claimed passed. |
| Serial affected-feature proof | Never reached; not inferred from aggregate or earlier focused coverage. |
| Commit, publication, exact-head CI | None. HEAD remains `a959f9ea2042fb6d850d06f953e6bf7abda70a20`; the authored patch is retained locally. |

The first post-static snapshot is at `07:35:11.189392Z`, 99.754107 s after
hook entry. Exact other stage start times are not reconstructed from buffered
Nx output. The 885 s rounded aggregate plus duplicate static/root/tool/smoke
cost exceeded the unchanged total bound despite passing aggregate targets.
This exposes a separate full-funnel duration blocker, not permission to raise
the bound, rerun unchanged code for cache-dependent green, alter parallelism or
adopt unrelated unpublished source. Coordinator and Puck subsequently authorized
one bounded integrated snapshot: only this cleared import correction and the
approved static-dedup source/docs, owned, qualified and delivered by the
[funnel owner](https://ampcode.com/threads/T-b650d323-f82a-46fb-bedc-70c527baa29f)
under EVE-261/#1035 and EVE-299/#1092. This owner transfers exact patch sections
and evidence, preserving originals; generated LLMS/graph outputs are not
overwritten by transfer. Every gate, the 1200 s bound, parallel 2 and serial
feature contract remain unchanged. If the combined attempt still overruns,
hold and report stages rather than retry blindly. No larger orb/spend or
independent competing delivery is authorized.

The approved wrapper ran its container/network cleanup; an independent
`docker ps` reported no remaining containers, and the supervised Docker daemon
was stopped afterward. Raw command log, Git
Trace2, staged patch and clean-source graph are retained in the owner's
`eve261-step2` backup. EVE-261/#1035 records the paired blocker and delivery
state. H stays held: focused and aggregate proof do not clear its retry.
The separately reported #1052 compiler/storage deadlines, the funnel owner's
unpatched telemetry/runtime timeouts and PR59 Windows ownership blocker are
not accepted or erased by this correction. Step2 still awaits
human-managed-core acceptance/merge/sync; whole EVE-261/Core remains open.

## START and ownership - 2026-11-20

Jonathan assigned this bounded investigation through the
[coordinator](https://ampcode.com/threads/T-d57222d4-a392-4a67-bcea-43f0bda5323a)
to the [existing owner](https://ampcode.com/threads/T-01a1f129-c14c-7069-b343-1563380b020c).
No replacement thread, model, dependency or paid service was started. Read-only
archive/source inspection preceded the tracker START at 2026-11-20T00:05:51Z;
the exact earlier investigation start time was not retained.

The fresh isolated task branch starts at fetched `origin/main`
`3ff2251b8702be0f5061bff05bb18a3f2ce5228b`. The verified owning pair is
[EVE-261](https://linear.app/resnovas/issue/EVE-261), In Progress, and
[Resnovas/Eventiva#1035](https://github.com/Resnovas/Eventiva/issues/1035), OPEN.
The attachment and normal [Linear linkback](https://github.com/Resnovas/Eventiva/issues/1035#issuecomment-6901726475)
were independently read. The source history of
[`bc2cc102`](https://github.com/Resnovas/Eventiva/commit/bc2cc1024b87973018b59355d26af89469db2eb7) and
[`193eb328`](https://github.com/Resnovas/Eventiva/commit/193eb3284e92661ec44512fd38beb7a98a25c991) also
references EVE-261; EVE-275 carried the reported symptom, not this task's ownership.
[Tracker START](https://linear.app/resnovas/issue/EVE-261#comment-bdca1ff3-838c-409c-ae08-fc9ce92936ea)
records the evidence and limited reservation. Its automatic GitHub counterpart
was absent on independent reads, so the [explicit START mirror](https://github.com/Resnovas/Eventiva/issues/1035#issuecomment-7025908760)
was posted and read back. This is manual evidence synchronization, not a claim
of automatic sync. References are non-closing.

The initial documentation-only scope was superseded by Jonathan's binding
direction relayed through Puck in this thread. Step 1 authors the three telemetry
probe specs, `tests/telemetry/src/child-process.ts` and its public contract spec,
the actual scoped ESLint restriction, `tools/test-process/check.test.mjs`, minimal
root-check wiring and these people/agent/lifecycle notes. LLMS and clean-source
Graphify regeneration are mechanical. Production entrypoints, preload behavior,
identity/session/SQL, renewal and retention remain untouched. Earlier signed
qualification and cancellation work remains preserved.

The [superseding tracker checkpoint](https://linear.app/resnovas/issue/EVE-261#comment-57c1772f-5827-4972-8569-4ec880c9bce9)
and independently verified [explicit GitHub mirror](https://github.com/Resnovas/Eventiva/issues/1035#issuecomment-7026336333)
record the amended scope and mandatory test-default-ON flag. Automatic comment
synchronization remains unproven; this mirror is explicit.

## Result: failing limit established, historical slow phase unknown

Both preserved failures explicitly hit **Vitest's 5000 ms aggregate test limit**:

| Preserved log                           | Test                                                   | Reported duration and result                                                                                                                                                            |
| --------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `full-attempt1-timeout.log`             | Observer parity with `EVENTIVA_CLUSTER_PROFILE`        | 5652 ms; `Test timed out in 5000ms`; telemetry 86 passed / 1 failed. The enclosing full run later reached its separate 20-minute bound, reportedly exit 124; contracts was interrupted. |
| `normal-attempt1-contracts-timeout.log` | Optional opt-out retains bootstrap failure diagnostics | 7851 ms; the same 5000 ms error; contracts 574 passed / 1 failed. Runtime previously passed 675/675.                                                                                    |

Each test executes two real children sequentially inside one default-timeout
`it.effect`. Each child has its own 10000 ms `spawnSync` bound. The whole-test
deadline and child lifetime are independent limits; the latter is not a promise
that two launches complete inside the former. No recorded child `ETIMEDOUT`,
signal, per-child timing or failing lifecycle journal identifies a slow phase
in either historical test. A report above 5000 ms does not itself mean the
child exceeded 10000 ms or hung during teardown.

Pinned Vitest 4.1.12's `withTimeout` checks elapsed time again on successful
resolution and rejects when elapsed is at least the timeout. Its source
explicitly covers work that prevents timer dispatch. `@effect/vitest` 0.30.1
forwards absent per-test options; `vitest.shared.ts` does not set a custom test
timeout. Synchronous children block the parent event loop, so a timeout may be
reported only after they return. This explains an observable timeout mechanism,
not the cause of historical server-launch latency or proof that those two
historical tests completed all assertions.

The contracts project intentionally includes the telemetry specs. The second
failure is not evidence of accidental discovery or a contracts-source defect.

## Preserved evidence and controlled falsification

The supplied immutable archive `renewal-telemetry-evidence-20261119.tgz` is
40083 bytes, SHA256
`38af69bda4695d07a2eaabb4209c87260f1fbde31452199ec81c303918b1a034`.
The renewal tracked patch/new-file tar were inspected as evidence only and
were never applied. Historical unchanged telemetry retry 87/87 is retained as
a retry, not a repair or causal explanation.

The coordinator's supplied real-child comparison retained these pair totals:
candidate-before 2311/2415/2275 ms, unchanged-main 3493/2373/2464 ms,
candidate-after 3265/2507/2332 ms. Each had the expected 0/1 exits without
errors, signals or stderr. These observations neither reproduce the slow run
nor establish contention, causation by renewal, or production reachability of
a new defect.

A diagnostic-only scratch experiment ran with the pinned runner and Effect
test wrapper, unchanged default 5000 ms and child 10000 ms bounds. It used
synthetic Node timers, not the application, and three controls:

| Control                              | Observed result                                                                                                                                      | What it distinguishes                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Two synchronous 2750 ms children     | Both exited 0 without errors; body completed at 5570 ms, a 50 ms parent timer had not fired; Vitest rejected at 5614 ms with the same 5000 ms error. | Completed children plus blocked timer dispatch can produce this error without a child hang. |
| Two asynchronous 2750 ms children    | Vitest rejected at 5012 ms with the same 5000 ms error.                                                                                              | Async alone does not make serial work above the total budget pass.                          |
| One bounded synchronous 100 ms child | Passed.                                                                                                                                              | A synchronous subprocess is not intrinsically an invalid test.                              |

Exact diagnostic command:

```sh
pnpm exec vitest run --config .amp/in/orb-backup/telemetry-timeout/mechanism.config.mjs
```

It deliberately exited 1: two expected timeouts, one passing control. This is
not a normal verification gate, a production reproduction or fail-before /
pass-after evidence of an application correction. Scratch config, spec and
raw log are retained in the task's `.amp/in/orb-backup/telemetry-timeout/`.

## Code-to-check-to-guidance decision

Jonathan settled the formerly ambiguous intent: each section must use the
fastest correct implementation within a measured, justified child budget,
and every complete test must meet its existing aggregate limit. Two 10000 ms
allowances inside a 5000 ms test are inconsistent even when a retry happens to
finish quickly. Neither increasing limits nor replacing real composition with
a mock is authorized. Serial controls and their business assertions remain.

Three telemetry helpers originally used synchronous real children: `server.spec.ts`,
`bootstrap-diagnostics.spec.ts` and `core-diagnostics-qualification.spec.ts`.
The third intentionally tests five failure/reacquisition pairs with an explicit
30000 ms bound. The nearby `tests/boundaries/src/boundaries.spec.ts` uses
`execFileSync` to validate actual Hermes bytecode. These are structurally
similar calls, not four proven recurrences of a forbidden pattern. The existing
intentional stuck-child and native-pressure tests retain their explicit 15000 ms
enclosing bounds and 10000 ms child limits.

The correction funnel uses existing ESLint `no-restricted-imports` plus
`no-restricted-syntax` for dynamic-import/require spellings. Probe specs must
use the timed harness rather than directly importing `child_process`. No custom
call-graph rule or dependency was added. The required root check executes proof
fixtures against the actual ESLint configuration. Existing Nx lint/typecheck/test
gates exercise the migrated source and runtime budget validation.

`childTests` passes the same test limit to registration and runtime validation;
the declared vector supplies each child deadline. The sum of serial deadlines
plus 100 ms SIGTERM-to-SIGKILL grace per child must be strictly below that limit.
Undeclared launches and unused declared positive controls fail. Node spawn and
stream events remain asynchronous so the runner watchdog can execute; this is
not a claim that async alone speeds child startup. Cancellation waits for actual
pipe close. Stream collection remains bounded and preserves output/exit checks.

The existing Flags port evaluates `telemetry.bootstrap.child-timing`. Its
declaration has `safeDefault: false`; the test harness supplies ON by default
and rejects a false/missing evaluation before spawning. Tests cannot silently
opt out. Negative flag-rejection coverage is not permission to run untimed work.
Records contain only closed phases and numeric timing/budget data, never raw
command/environment/output. Existing fd3 lifecycle phases distinguish source
loading, bootstrap, finalizers, failure logging, exit and drain.

Ordinary main probes use measured 2300 ms child budgets: the
supplied individual maximum was 2250 ms. Two such deadlines plus 200 ms cleanup
leave 200 ms aggregate headroom below the unchanged 5000 ms limit. This narrow
margin needs measured candidate validation, not an assertion that every host
can meet it. Native pressure and deliberate timeout controls retain 10000/15000
ms; the ten-child qualification retains its 30000 ms aggregate bound.

No AGENTS prose duplicates this new harness rule, so none is retired. Managed
downstream guidance is untouched. Jonathan authorized a normal draft PR in
`Resnovas/.github`; that proposal is not merged, synced or adopted. The check enforces budget consistency and timing;
humans must still judge whether the measured task budget is reasonable and
whether its implementation is the fastest correct one.

The earlier native-shutdown correction proved a different forced-exit
deadlock using finite allocation pressure and native stacks. Current failed
roots use natural drain. The present logs do not establish recurrence of that
deadlock; missing phase evidence must not be converted into that conclusion.

## Next evidence, not an inferred repair

Retain the original red logs. For new measured runs, correlate safe
parent launch timestamps/durations, closed lifecycle phase timestamps and exit
status for **each** launch, plus overlapping task/resource measurements. The
existing `launchFailureContext` validates bounded closed journal values for
spawn assertion failures, but these aggregate runner timeouts retained none of
that context. An absent assertion message is not proof of successful children.
Do not print arbitrary configuration, Cause, child payloads, credentials or
raw environment to fill the gap. The authorized harness preserves this
noninterference/privacy contract; no production instrumentation is activated.

The owner confirmed the aggregate performance contract. Diagnose any measured
overrun before optimizing; absence of a recurrence cannot recover a missing
historical phase. Host contention, a product performance regression and another
teardown problem remain hypotheses, not established causes.

## Queued repository-wide migration

Step 1 is sequencing, not an exemption. C explicitly released storage at
2026-11-20T00:28:24Z after signed main `a5abfb9a`; that exact main was fetched
and integrated without adopting unpublished renewal. The coordinator then
issued the separately reserved step-2 START for the same harness/restriction.
Step-2 writes follow the verified step-1 checkpoint, not a hosted-C-CI wait.
Read-only inventory includes four storage specs (`trust-process`,
`resource-process`, `hook-process`, `marketplace-process`), their five nested
fork fixtures (including `hook-producer-process`), the Hermes boundaries spec,
server `two-runners.mjs`/`module-run-handover.mjs`, and Node tool suites
`documentation/ratchet.test.mjs`, `references/check.test.mjs` and
`storage/guard.test.mjs`. Valid 60000/65000 ms and other justified bounds remain.
Plain Node callers cannot import the Vitest registration boundary. The approved
extraction uses dependency-free `tools/test-process/process.mjs` as the single
process owner, `child-process.ts` for Eventiva Effect/Flags/budget admission and
`vitest.ts` for registration only. The generic house runner must not acquire
Eventiva dependencies. `tools/typecheck/tests.ts` is managed house source:
downstream edits are blocked until the authorized canonical PR merges and syncs.
No blocked occurrence is baselined or
excluded, and no storage/step-2 path is edited in this step.

## Verification and delivery

The original documentation-only full verification completed exit 0: 105 Nx
tasks and smoke passed. It began before instrumentation edits and is not final
candidate evidence. Required final verification will run on the settled tree.
The initial migrated telemetry suite passed 92/92 with unchanged coverage
thresholds (96.5% lines, 95.61% branches). Its console emission did not retain
timing records, so emission was corrected before claiming phase evidence.
The isolated five-case harness run passed its cases but correctly failed full
package coverage; no threshold was weakened. Actual ESLint rejection/acceptance
proofs passed 2/2.

The corrected mandatory-output run passed 92/92 in 51.92 seconds, with 96.5%
lines, 95.61% branches, 91.76% functions and 96.2% statements. Ordinary main
children took 844-1097 ms; observed root-start phases took 753-988 ms. Source
loading/startup dominates these successful children, not a measured post-log
hang. Native pressure reached root at 1546 ms, diagnostic output at 1627 ms
and close at 2490 ms within its retained 10000 ms bound. The deliberately stuck
control emitted diagnostic output at 31 ms, hit its deadline at 10005 ms and
closed at 10008 ms with expected ETIMEDOUT/SIGTERM. Cancellation and mandatory
flag/privacy/plan rejection controls also passed. The raw log and numeric
summary are retained privately under `.amp/in/orb-backup/telemetry-timeout/`.

This is new measured evidence, not reproduction of the historical overrun or
proof of a fastest possible implementation. No measured production slow-case
cause has been established, so no production optimization is manufactured.
Correcting budget consistency and parent watchdog starvation does not prove a
child startup speedup. Final whole-tree verification/clean graph and delivery
remain pending.
No full renewal, EVE-261, Core or production acceptance is claimed. EVE-248
remains January 2027; production settings and aggregate test limits are unchanged.

The settled fixture-backed full run subsequently reached the unchanged
20-minute limit, exit 124. Its Nx aggregate took 18m34s: 62 successful tasks,
one interrupted `@eventiva/contracts-tests:test` and 42 not yet run, with
16/62 cache hits and a 5m4s critical path. Build took 26.9s and the boundary/type
proof suite 16.705s. These passed portions are partial evidence, not a full
green gate. The original complete log remains `step1-final-verify.log`.

The identified contracts target then passed 580/580 in 217.95s with the
required disposable PostgreSQL fixture (95.92% lines, 91.97% branches).
An earlier narrow invocation without that fixture failed 31 cases with
ECONNREFUSED; it is retained as a setup error, not a source regression.
The next full invocation stopped at the licence-header gate because an owned
ignored clean-graph snapshot remained as loose source: the existing managed
scanner's git listing exceeded its default buffer and its fallback walked the
snapshot. The snapshot was compressed and the loose copy removed; no checker,
buffer, exclusion or gate was changed. The correctly configured same-limit run
also exited 124. All 105 main Nx tasks passed in 18m22s (49 cache hits; 5m24s
critical path). Source/declaration boundaries reported zero violations. Smoke
then ran 28.1s before `@eventiva/client:export-web` was interrupted; Android
export and all three smoke targets were unrun. Its complete log remains
`step1-completion-clean-scratch.log`. This is not full verification.

Jonathan's later direction now pulls structural optimization before delivery;
there is no repeated unchanged full retry. The coordinator-cleared candidate
removes `--parallel=1` from build and main validation and sets the existing Nx
task budget to two. Every ordered gate, dependency edge, assertion, coverage
threshold and the 20-minute bound remains. Initially smoke stayed serial pending
qualification of its shared Expo cache; the subsequent bounded qualification is
recorded below. No fixture or configuration outside the reserved root/Nx/proof
paths changes. Installed Nx 24.0.5 source and schema
confirm the existing `parallel` option; Context7 was unavailable due to quota.
The orb reports two available CPUs and 3.84 GiB memory. Shared fixture SQL
uses unique database names; real ports and cancellation remain verification
risks, not assumed safe because names differ.

The retained Nx task history measures runtime tests at 292.8s, storage at
317.8s, resources at 150.8s and telemetry at 54.2s in the serial baseline.
`tools/verification/pipeline.test.mjs` checks that all seven ordered gate
stages remain and independent build/validation work cannot silently return to
the known serial command. The first two-task candidate completed all main and
serial-smoke gates in 1024.72 seconds (17m04.72s), exit 0, with peak descendant
RSS 976684 KiB. Its main critical path was 6m28s and serial-smoke critical path
51.0s. This is a full local pass, not delivery or a controlled ratio against the
49-cache-hit baseline.

## Comparable parallelism and independent smoke - 2026-11-20

Jonathan requested higher parallelism rather than assuming two was optimal.
On this host, two tasks already means one per available CPU core. Both measured
settings used Node 24.22.3, Nx 24.0.5, the same candidate on signed base
`4e227d94baba9bddfa84daa5c0954f0d6865b1ed`, disposable PostgreSQL fixture and
unchanged 20-minute wrapper. `NX_DAEMON=false` and `NX_SKIP_NX_CACHE=true` applied
to both; every Nx stage reports skipped cache. This means cold Nx cache, not a
flushed OS page cache, absent TypeScript incremental state or a fresh machine.
No competing heavy work was started during either measurement. The source and
pipeline proof were unchanged between settings; retained SHA256 fingerprints
confirm this. Single runs do not establish statistical optimality.

The scratch `measure-all-stages.sh` reads the seven commands from the actual
`verify` manifest and supplies only the measured Nx `--parallel=2` or `4`.
It records each stage's start, end and exit. Unlike production's unchanged
fail-fast chaining, this diagnostic wrapper continues after a failed stage so
both settings measure smoke, then returns failure if any stage failed. The
existing fixture wrapper still bounds the complete measurement at 20 minutes.
No assertion, coverage gate, dependency or deadline is removed or increased.

Each command was measured with GNU time's identical
`elapsed=%e user=%U system=%S maxrssKiB=%M exit=%x` format around the same
fixture wrapper and measurement script. Raw logs, clocks, generated actual Nx
task graphs, per-task history and `comparable-summary.json` are retained in
`.amp/in/orb-backup/telemetry-timeout/`. The fixture wrapper remains private;
neither credentials nor its environment are published here.

| Nx task budget | Total wall          | Main longest dependency chain | Smoke longest dependency chain | Peak RSS, KiB | Result                                                                          |
| -------------- | ------------------- | ----------------------------- | ------------------------------ | ------------- | ------------------------------------------------------------------------------- |
| 2, one per CPU | 924.58s / 15m24.58s | 359.529s / 5m59.529s          | 82.231s / 1m22.231s            | 1011844       | Exit 0; all 105 main tasks and all 17 smoke/dependency tasks pass.              |
| 4              | 935.82s / 15m35.82s | 617.244s / 10m17.244s         | 90.273s / 1m30.273s            | 785824        | Exit 1; 100/105 main tasks pass, five fail; all 17 smoke/dependency tasks pass. |

Longest paths sum actual task durations along the generated dependency DAG,
independently recalculated from Nx task history. They are not whole-run wall
time or a promise about unlimited hardware. Main Nx wall times were 12m46s
at two and 12m42s at four; smoke Nx wall times were 1m22s and 1m30s. GNU time's
RSS is the maximum reported descendant-process resident set, not the summed
process-tree or host-memory peak. User/system CPU times were 1179.21/126.74s
at two and 1234.77/145.54s at four.

At four, telemetry, resources, contracts, runtime and storage test targets
failed. Their overlapping suites reported 37 failing test executions, not 37
distinct defects: ordinary 2300 ms child deadlines, the retained 15000 ms
compiler-edge deadline, native-pressure control and retained 60000 ms inventory
ancestry deadline were implicated. Assertions can stop later controls inside
a failed case, so failed-run duration is not a passing speedup. An earlier
normal fail-fast four-task attempt exited 1 in 855.59s with four failed main
targets and unrun declaration/smoke stages; it is retained separately and not
substituted for this complete comparison. The two-task setup initially exited
125 before any gate because the preceding auto-remove container name had not
yet disappeared. Its log is retained as `two-fixture-collision.*`; disappearance
was independently checked before the corrected-setup run. No fixture/config
source or cleanup policy was changed to obtain the result.

The coordinator approved only the additive root target-default dependency
`export-android -> export-web`. Both existing Expo exports use `--clear` and
installed Expo's shared temporary Metro cache, while writing distinct output
directories. The actual Nx graph retains every prior edge, makes Android wait
for web, leaves browser smoke dependent on web output and keeps server/i18n
work independent. Task history supplies executed resource-isolation evidence:

| Setting | Web end -> Android start gap | Server smoke overlap with web | Browser smoke overlap with Android | i18n overlap with web |
| ------- | ---------------------------- | ----------------------------- | ---------------------------------- | --------------------- |
| 2       | 5 ms                         | 1249 ms                       | 4909 ms                            | 377 ms                |
| 4       | 5 ms                         | 1013 ms                       | 6027 ms                            | 414 ms                |

Thus the two `--clear` export processes did not overlap, while real independent
smoke work did. This is not a textual `dependsOn` assertion alone or evidence
that arbitrary future smoke targets are safe to parallelize. The public
manifest proof remains a guard alongside, not a substitute for, this execution.
Retain `parallel: 2` and parallel independent smoke as the fastest passing
setting measured here. Four is rejected without weakening its failing tests.
All 75 ordinary children in the passing telemetry/runtime/contracts target
logs completed within 836-1699 ms under their unchanged 2300 ms budgets.

## Read-only root-start profile

After both measurements finished, the unchanged real source entrypoint ran
with an isolated environment and the same 2300 ms child bound. Unobserved,
existing-preload and V8-sampled controls all exited 0 with empty stderr and
`diagnostic.startup`: wall times were 1.00s, 1.03s and 1.20s respectively.
These are single diagnostic observations, not an observer-overhead benchmark
or acceptance latency from an instrumented CPU profile.

The existing-preload journal reached root at 868 ms, root exit at 939 ms and
Node exit at 982 ms relative to child-start. The sampled journal reached those
phases at 956/1050/1115 ms. Whole-child sample self time included 162.799 ms
in Node `compileSourceTextModule`, 133.348 ms garbage collection, 72.752 ms
package-json `get`, 54.195 ms `internalModuleStat` and 32.835 ms
`getPackageScopeConfig`. The profile supports investigating import/source work
rather than inventing a post-log hang; it neither assigns every sample to a
precise lifecycle phase nor recovers the historical failing phase. No production
entrypoint, import closure, export source or fixture was modified. A source-level
startup optimization requires its own coordinated candidate and causal control,
not a timeout increase or a claim that this profile proves the fastest possible
implementation.

## House proposal and retained delivery state

[House PR 59](https://github.com/Resnovas/.github/pull/59) remains open/draft at
`ed465c31e77be2c962f04d5fd51e47579f6930b1`. Normal six-platform/Node matrix jobs,
aggregate CI, CodeQL and current required checks pass. `linear-code[bot]`, not a
human readiness decision, marked it ready at 01:19:06Z and 01:52:00Z. This agent
restored draft using the authorized account at 01:20:57Z and 01:52:55Z. The
readiness rerun passed at 01:54:36Z; normal smartcloud rerun passed at 01:57:41Z.
No readiness attestation, settings or protection was changed. Normal human
acceptance/merge/sync remains required before downstream managed adoption.

The passing local two-task tree is not Eventiva publication, full EVE-261/Core
acceptance or completed repository-wide migration. Final documentation/graph
and signed retained state are recorded separately; no main push, new PR or
deployment is authorized by these measurements.

### Subsequent publication instruction and integration boundary

Puck subsequently accepted two tasks for this two-CPU orb and relayed Jonathan's
standing instruction to publish verified step 1 after clean graph, signed commits
and the tracker mirror, then observe exact-head CI. This instruction supplies
publication authority; the measurements alone do not. House PR 59 still waits
for human merge. The [measured tracker checkpoint](https://linear.app/resnovas/issue/EVE-261#comment-9f0cd84c-342b-42de-96ff-f93f41772ab7)
was explicitly [mirrored and independently read back](https://github.com/Resnovas/Eventiva/issues/1035#issuecomment-7028765056).

The delivery fetch found `origin/main` at
`5ca8059d15d582bdc0165b975db52fa0a17eeb86`. Its earlier
`9e379bf6` adds EVE-299/#1092's static-first feature funnel, changing the root
verification contract after measured base `4e227d94`. The historical seven-stage
comparison does not qualify that integrated manifest. Preserve the funnel's
static-first ordering, all gates and explicitly serial feature-evidence runner;
do not replace them with the older measured manifest. Puck identified the
[funnel owner](https://ampcode.com/threads/T-b650d323-f82a-46fb-bedc-70c527baa29f)
and requested an explicit overlap decision. The owner then cleared two-task
non-feature root execution and the export edge, confirming that inherited
`--parallel=1` there was not a proven correctness constraint. The separate
feature-evidence serialization contract remains required and unchanged. The
owner retains its registry wording corrections; no runner or registry semantics
are changed here. All upstream stages and ordering are preserved, including
static analysis before documentation and the final affected-feature gate.

The integrated `node --run verify:static` passes: 15 builds and 83 lint/typecheck
tasks, with 15/83 cache hits in the latter 1m44s stage. Source and declaration
graphs report zero violations/cycles. The telemetry lint override preserves
the newly introduced React lifecycle restriction instead of replacing it.
The integrated fixture-backed command was
`node --run verify && node tools/verification/run.mjs --base 5ca8059d15d582bdc0165b975db52fa0a17eeb86`,
inside the unchanged 20-minute wrapper. It passed in 983.71 seconds (16m23.71s),
exit 0, user/system 1183.28/129.81s and peak descendant RSS 1001780 KiB.
Static lint/typecheck passed 83 tasks (64 cache hits); main test/build/parity
passed 38 tasks (15 cache hits) in 11m31s; all three smoke projects and their
14 dependencies passed in 1m21s (11 cache hits). Explicit base-bound affected
proof passed telemetry 92/92, funnel policy 33/33 and funnel runner 8/8, with
serial feature/prerequisite scheduling retained. The default local-changes
feature invocation correctly found no affected interface for the then-dirty
foundation documentation; the explicit trusted-base invocation, not that empty
selection, qualifies the committed step-1 source. Raw `integrated-full.log`,
`.time` and manifests are retained. This is a separate integrated pass, not a
cache-controlled speed ratio against the earlier seven-stage comparison.

### Function optimization review

Every changed executable occurrence in the eight touched TypeScript/JavaScript
files was reviewed, including anonymous callbacks and configuration mappers.
Each has its own attached agent-facing record linked here; a parent record does
not cover its child. Existing installed `inspectOptimizationChange` provides a
read-only attachment/format proof, not a new global enforcement rollout or a
certificate that the review is truthful. The final documentation-only review
edit preserves executable AST structure, ignoring comments, redundant
parentheses and trailing-comma formatting; raw token equality initially rejected
formatter-only syntax, so it is not claimed as the successful equivalence check.

| Occurrences | Review and retained result |
| --- | --- |
| New admission, flag/service adapters and registration | No previous helper implementation exists for a microbenchmark. Plans are small (at most ten children in current callers); retaining explicit validation plus a serial sum makes invalid-input and cleanup headroom contracts obvious. No alternative optimization candidate was selected, and no isolated function speedup is claimed. |
| Process owner and every stream/timer/exit/cancellation callback | Constant work per bounded observation, first-phase deduplication, finite retained streams and one close-owned completion avoid unbounded retained diagnostics or competing process owners. Ordinary children measured 836-1699ms in the passing comparison. This is whole-child evidence, not per-callback p95 or proof that startup is optimal. No candidate was selected beyond the already qualified asynchronous ownership correction; preserve all timeout, privacy and cancellation controls. |
| Existing launch adapters and enclosing migrated scenarios | Remove duplicated synchronous launch ownership in favor of the one admitted asynchronous path. Keep all business assertions, positive controls and existing enclosing limits. Over-budget sync and async controls establish budget rejection, not a latency speedup. No further candidate was selected. |
| New contract/restriction/manifest test callbacks and finite ESLint mappers | Retain direct, bounded assertions against actual configuration and real children; no alternate algorithm was identified that preserves these controls with a demonstrated benefit. These are new tests, so no previous test implementation is invented. Existing portable/runtime mappers retain their behavior; their attached review records distinguish shifted anonymous identities from unreviewed new work. |
| Root orchestration candidate | Two versus four was benchmarked before adoption; two is the fastest passing setting measured. The integrated static-first funnel has its separate 983.71s passing run above. This does not establish a per-function or per-step p95 speedup. |

`best-found` means the current reviewed implementation was retained without a
selected additional candidate, not a claim of globally fastest execution.
Structural every-function instrumentation and per-step p95 proof remain the
separate EVE-44 mechanism/coverage obligation; missing samples are unknown,
never zero regression or an exemption. Read-only root profiling suggests import
work for a future coordinated candidate; no protected startup source was changed.
Publication, final pre-commit and exact-head CI are recorded separately.

The first normal verification attempt exited 1 before application tests: the
licence-header gate also scans untracked scratch JavaScript and rejected the
two diagnostic files. The existing header fixer was applied only to those
files; no gate or exclusion changed. The startup-rejection log is preserved
separately from the corrected-setup run. Graphify Cloud/gateway memory tools
were unavailable; local graph/source, installed vendor source, connected Linear
and authenticated GitHub supplied the available evidence. No memory read/write
or whole-tracker live refresh is claimed.

### Installed-hook delivery blocker

After rebasing the registry-only publication, the real staged source commit
attempt installed the normal EVE-299 pre-commit hook and ran inside the unchanged
disposable fixture/20-minute wrapper. It exited 1 in 150.67s, before application
tests: seven documentation-ratchet temporary-history cases could not find their
relative `tools/verification/pre-commit.mjs`. Unlike a direct verification run,
verification spawned from a Git hook inherits outer Git repository-local
environment. Those fixtures set `cwd` but not an isolated environment, so their
`git add` also replaced this task's outer index: 34988 apparent deletions, with
the original HEAD and working files intact. The failure is not a telemetry
timeout, application regression or the separately owned HTTP fixed-port clash.

The corrupted index was retained privately, then only this task's exact owned
staging was restored from HEAD plus its reviewed working files. No hook was
removed, skipped or weakened; no commit or push resulted. Logs and timing are
`final-source-commit.log` and `.time`. The funnel owner and Puck received the
failure and proposed narrow boundary: preserve the hook's own staged-tree
snapshot environment, but isolate Git-local environment in spawned verification
so nested temporary histories cannot target the outer index. A real
installed-hook/nested-history control must prove that amendment. Runner/fixture
sources remain with their owner. Clean graph work can continue, but the normal
staged-tree gate and signed delivery are blocked until that correction is
coordinated and verified; the earlier 983.71s direct-run success does not prove
this hook path.

The owner subsequently published the isolated-child-environment correction and
real installed-hook linked-worktree regression in
[`8b3e4b90`](https://github.com/Resnovas/Eventiva/commit/8b3e4b90c27c9fa2e53f536708bed04064906904).
Its child verification environment removes `git rev-parse --local-env-vars`,
while its own staged snapshots retain the original environment. Nested commits,
exact outer tree, unchanged primary HEAD and mutation rejection are separate
controls, not a missing-runner early return. The listener isolation correction
is also on the rebased main. This task preserves both upstream corrections and
the new chapter-11 installed-hook paragraph alongside its concurrency wording;
no runner or fixture correction is reauthored here. Normal staged verification
and signed delivery resume on that integrated base, with exact outcomes on
[EVE-261](https://linear.app/resnovas/issue/EVE-261) and its independently verified
[GitHub mirror](https://github.com/Resnovas/Eventiva/issues/1035). The failure
above remains historical evidence, not a claim that the corrected hook fails.

### Corrected installed-hook acceptance

The real signed source commit then passed the unchanged installed pre-commit
hook under the same disposable fixture/20-minute wrapper: exit 0 in 1023.26s
(17m03.26s), user/system 1261.25/138.87s and peak descendant RSS 948764 KiB.
The hook executed `node --run verify:static` and `node --run verify`; its
nested-history/index-guard regression passed, and staged tree
`1d5ab20006edb6e4c9bb6bffaca0e0ab549868ef` stayed unchanged until commit.
First static lint/typecheck passed 83 tasks (62 cache hits); the repeated static
stage passed with 65 cache hits. Main passed all 38 tasks (15 cache hits) in
10m56s; all three smoke projects/17 tasks passed (12 cache hits) in 1m14s.
Selected telemetry 92/92, funnel-policy 33/33 and funnel-runner 9/9 passed,
including the new installed-hook regression. Manifest
`8dbf621b-b635-4b6c-85c3-ff63c477f6c1` retains the exact staged changes and serial
feature/prerequisite execution. Logs and timing are
`isolated-hook-source-commit.log` and `.time`.

The subsequent delivery fetch found only the owner's graph/documentation
follow-through; the source was rebased onto `fef2b55f` without changing the
executable candidate. Final clean-source graph/evidence commit runs the normal
hook again. Signed publication and exact-head hosted CI are separate outcomes
on the owning tracker pair, not inferred from these local passes. Shared-house
promotion, repository-wide process migration and full Core acceptance remain
outside this step-1 checkpoint; PR59 is not merged by this task.
