# EVE-278 Core exact types and public boundaries

## START - 2026-11-19

This independent bounded qualification starts from fetched `origin/main`
`9fb0bda2167be0499a4a3ed729c5fa033f23dd7a`, identical to the clean initial HEAD.
The live [EVE-278](https://linear.app/resnovas/issue/EVE-278) description and
terminal two-comment page were read. The actual
[GitHub issue 1066](https://github.com/Resnovas/Eventiva/issues/1066) is OPEN;
[normal linkback 6988298020](https://github.com/Resnovas/Eventiva/issues/1066#issuecomment-6988298020)
points to EVE-278. The coordinator START independently appears on GitHub as
[6995592049](https://github.com/Resnovas/Eventiva/issues/1066#issuecomment-6995592049).
Live EVE-278 is In Progress, not accepted or Done.

Scope is existing source/declaration/runtime graph enforcement and exact
action input/output/error/environment/schema contracts. Only missing meaningful
test cases may be retained in the reserved boundary tests or action-type test.
Production, gate/configuration sources, EVE-276's unpublished work and shared
planning/LLMS/Graphify outputs remain untouched. No publication is authorized.
Future-platform EVE-263 and whole-Core acceptance remain separate.

Qualification evidence and any exact amendment request follow below after
execution. No gate result is claimed at START.

## Qualification result

### Approved SQL amendment START - 2026-11-19

Before editing either gate file, the coordinator relayed Jonathan's Puck
approval in this qualification thread: extend only
`tools/resources/boundaries.mjs` and `tools/resources/boundaries.test.mjs` for
existing feature SQL traversal over exported declarations, including resolved
import-type/path-alias closure and paired negatives/legal controls. Source
baseline remains `9fb0bda2167be0499a4a3ed729c5fa033f23dd7a`.
This is SQL traversal approval only. Gap B's reachable internal any/unknown
type-escape wiring remains PENDING clarification and will not be implemented.
No new rule, dependency, threshold, production/config path or publication is
authorized. Shared timeline/generated outputs/tracker status stay coordinator-owned.

Approval source: [Linear SQL amendment](https://linear.app/resnovas/issue/EVE-278#comment-38bb8587-39fc-48fe-9b7a-591aeb3057dc),
independently verified as [GitHub 6995860759](https://github.com/Resnovas/Eventiva/issues/1066#issuecomment-6995860759).

### Approved first-party type-closure amendment START - 2026-11-19

Before further gate edits, Jonathan's additional approval was relayed here with
his exact limit: 'as long as we dont go trying to control node packages and
dependencies. Just handle files and code we actually control'. The same two
gate paths are authorized to apply existing type-escape checks to reachable
first-party repository-owned declarations. Third-party node_modules and
external dependency declarations are not recursively type-audited or modified.
First-party bridges/re-exports gain no exception. SQL import detection remains
independent of ownership and must still reject forbidden third-party SQL imports.
No threshold/dependency change or publication is authorized. The earlier pending
disposition is historical and superseded only within this explicit ownership limit.

Approval source: [Linear ownership-limited amendment](https://linear.app/resnovas/issue/EVE-278#comment-ae187ba8-fd3a-4490-b2c1-7ab6465d6295),
independently verified as [GitHub 6995915568](https://github.com/Resnovas/Eventiva/issues/1066#issuecomment-6995915568).
Both relay comments are dated 2026-11-19; the exact human-selection times are unknown.

**Both approved declaration-enforcement amendments are implemented locally.**
The SQL policy now traverses exported feature declarations and the type audit
follows reachable first-party declarations. Ownership is canonical filesystem
location inside this repository, excluding node_modules, reference-only
externals and locations outside the repository. Workspace symlinks into owned
files remain owned. No dependency file is changed or recursively type-policed;
forbidden SQL imports still fail before dependency traversal is skipped.
No current production SQL leak, cycle or erased public type is alleged. The
reproductions exposed future-regression detection gaps, not a deployed exploit.
This is this lane's tree, not final combined-tree qualification or release approval.

The live prerequisite descriptions were independently read: EVE-40, EVE-244
and EVE-23 are Done. EVE-263 is Backlog and explicitly preserves future
extension/security/reference acceptance. None of those statuses is substituted
for this task's executed evidence.

## Existing enforcement and clause map

All paths and results use immutable source
`9fb0bda2167be0499a4a3ed729c5fa033f23dd7a` plus this lane's reserved action-type
test, two approved gate files and this report. No EVE-276 unpublished patch is present.

| Required clause                                         | Existing evidence and decisive controls                                                                                                                                                                                                                                                                                                                                                                     | Qualification                                                                                                                                                                                                            |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Direct/type-only/import-type/re-export SQL              | `tools/resources/boundaries.mjs` parses import, export, import-type, require and dynamic-import AST nodes. Existing `boundaries.test.mjs` cases reject SQL driver imports, privileged resource ports/namespaces and nonliteral loading. Named Resources/declareResource and pure-helper controls pass.                                                                                                      | Existing 116-case tool run passes; current source feature audit: 3 files, 0 findings.                                                                                                                                    |
| Indirect/alias/relative SQL                             | Existing `follows aliases, relative re-exports and type queries transitively` reaches pg over four chain entries; relative SQL directory and renamed privileged port fixtures reject.                                                                                                                                                                                                                       | Existing fixtures reused, not copied into another suite.                                                                                                                                                                 |
| Source direct/indirect/type-only/alias/re-export cycles | Existing resource/workspace fixtures reject a self edge, transitive alias/re-export cycle, disconnected type-only cycle and manifest-only cycle. Shared-contract diamond and closed-cycle witness controls distinguish sharing from cycles.                                                                                                                                                                 | Current workspace: 265 files, 1198 source edges, 34 packages, 0 source findings or package cycles.                                                                                                                       |
| Public emitted direct/transitive/package cycles         | Existing emitted fixtures start with clean source, reject two-/three-node type-only/re-export cycles, choose types over the active source condition, reject missing declarations and source fallback, and allow the alias/re-export diamond.                                                                                                                                                                | Current emitted graph: 95 files, 448 declaration edges, 0 findings/cycles. This proves cycle traversal, not emitted SQL/type-escape traversal.                                                                           |
| Nx directions and frontend/backend portability          | `tests/boundaries/src/boundaries.spec.ts` F1/F2/F5/F6/F7/F9/F11 use actual tagged paths and rules; F7 requires explicit circular-dependency diagnostics. F3/F4 cover Node/vendor restrictions, F8 explicit exports.                                                                                                                                                                                         | Normal boundary project target results are recorded below; no root lint rule/config changed.                                                                                                                             |
| Public subpath/bundle closure                           | Existing manifest inventory/hygiene cases enforce explicit subpaths, no root barrel, shared Effect peer and archive isolation. F12/F13/F14 retain namespaces, inspect browser closure and ids-only tree shaking, and compile real Hermes bytecode.                                                                                                                                                          | Existing normal suite retained; not native-device qualification.                                                                                                                                                         |
| Runtime manifest dependency cycles                      | `tests/runtime/src/kernel-runtime.spec.ts` rejects two-node, three-node and prefixed cycles with exact closed witnesses before acquisition; checks empty snapshot and no acquisition events. Dependency-version/missing/migration refusals remain distinct.                                                                                                                                                 | Existing runtime tests, not static-graph inference.                                                                                                                                                                      |
| Runtime capability/provider cycles and lawful sharing   | Same suite rejects self/two-/three-node explicit provider-binding rings before acquisition. Shared-base diamond starts top-first yet installs base/left/right/top once and reaches ready states.                                                                                                                                                                                                            | Existing tests reused; no new runtime lifecycle scope or adoption of EVE-276 work.                                                                                                                                       |
| Exact action input/output/error                         | Existing action compiler negatives reject wrong decoded handler input/output, undeclared/tag/field failures, invalid Input/Output/Failure aliases and lost brands. New bidirectional assertions additionally pin decoded input, Effect success/error and both encoded sides.                                                                                                                                | 19 ordinary compiler diagnostics, one per negative line; no positive/config diagnostics. Not merely a nonzero compiler exit.                                                                                             |
| Exact environment and provider substitution             | Existing positives register the same binding with Store value 3 and 9, plus empty registration. Existing negatives reject missing/wrong layer and handler result assigned to an environment-free Effect. New equality assertion requires exactly Store.                                                                                                                                                     | Independent lost-environment declaration overlay fails the environment equality with TS2344 and no dependency diagnostics.                                                                                               |
| Schema-negative contracts                               | New cases independently reject a Store-dependent schema in input, output and error, plus an AST/Context-only lookalike missing real Schema members. A matching options object with service-free String schemas compiles. Transforming NumberFromString and branded constructors remain legal. Existing tool fixtures reject erased Effect schema aliases/re-exports and preserve unrelated lexical shadows. | Each new case gets exactly TS2322 on its own line; diagnostics identify Context Store versus never, or missing Type/Encoded/annotations/TypeId/pipe.                                                                     |
| Emitted SQL, including type-only/alias/re-export chains | Approved amendment keeps source checks and additionally roots SQL traversal at exported feature declarations under --declarations. It selects types rather than the source condition and follows resolved relative/import-type/alias/package bridges.                                                                                                                                                       | Gap A closed locally: five unchanged-gate SQL false negatives become five rejections; all five legal controls pass. Resolved third-party pg declarations do not suppress SQL findings.                                   |
| Erased types in transitive public declarations          | Approved amendment queues reachable first-party declarations once and applies the unchanged syntax audit; dependency internals are not queued.                                                                                                                                                                                                                                                              | Gap B closed locally: owned relative/import-type/alias any/unknown negatives reject at the hidden declaration; dependency any/unknown controls pass. The graph still rejects reference-only upstream imports separately. |

## Retained type-test change and adversarial proof

The type-test change is confined to `tests/runtime/src/action-types.spec.ts`. Six exact-type assertions
and four genuinely missing schema negatives extend its existing compiler
fixture. The existing fifteen negatives and legal swapped-provider, transformed
wire/decoded and brand controls remain unchanged. No tests/boundaries fixture
was added because the requested source/cycle cases already exist; the approved
declaration regressions extend the existing gate's own .mjs fixture suite.

Scratch compiler-host overlays substitute the actual built runtime action
declaration for its source module, without writing any production file. The
unchanged declaration control has no positive or dependency diagnostics.
Changing just the exposed handler input to include string, success to include
string, failure to include string, or environment R to never independently
produces TS2344 at the corresponding new equality assertion. Every candidate
has zero dependency diagnostics. This isolates consumer contract sensitivity
from a broken implementation body. It is not a production implementation patch
or proof of arbitrary inferred-type exactness throughout the platform.

The four schema cases use an otherwise valid `portableOptions` object, avoiding
an unrelated flag/error Option mismatch. The positive options control compiles;
the three contextual schemas fail specifically on Context and the AST-only
lookalike fails on missing Schema members. Initial fixture-construction errors
were corrected before the passing evidence; they are not accepted negatives.

## Reproduced baseline gaps and approved correction

Create a disposable tagged extension package with a clean `src/api.ts`, explicit
`./api` export mapping source to that file and types to `dist/api.d.ts`, and a
NodeNext tsconfig. Run the actual gate components against that fixture:

- Gap A: let api.d.ts re-export SqlClient from @effect/sql/SqlClient, use an
  import-type query, or re-export through bridge.d.ts via a relative path or TS
  path alias. At the baseline all four had zero default source-SQL, emitted workspace-graph and
  emitted type-audit findings. Explicitly passing api.d.ts to the existing
  checkResourceBoundaries rejects each with the correct two-/three-entry chain.
  The legal string declaration control passes both paths.
- Gap B: let api.d.ts re-export Safe from bridge.d.ts, with bridge defining Safe
  as unknown or any. At the baseline both reachable erased public aliases had zero emitted
  workspace-graph/type-audit findings. Explicitly passing bridge.d.ts to existing
  checkTypeEscapes rejects each with `Erased any/unknown type`. The entry-only
  audit does not recursively apply that check to the graph's reachable files.

These are independent examples with clean source, not cycles disguised as SQL
or compiler failures elsewhere. The scratch fixture explicitly owns tsconfig.json
so a parent checkout's tsconfig cannot accidentally control alias resolution.

The retained existing fixture suite now reproduces the correction with:

```sh
node --test --test-name-pattern='emitted feature SQL|emitted type closure|reference-only dependency declarations' tools/resources/boundaries.test.mjs
```

Run against an untouched copy of the baseline gate, the final paired SQL
fixtures fail all five SQL negatives and pass all five legal controls. Before
the type amendment, the two owned type-closure cases fail and the two dependency
controls pass. These are missed expected findings, not compiler setup failures.
After correction the full tool suites pass 132/132 with no skipped cases.
The workspace-package symlink control also rejects an owned hidden declaration
that has no independent manifest types entry; a node_modules link is not an
exemption for first-party code.

A separate scratch CLI probe copies the real baseline/amended executable gate
into a complete synthetic workspace. Baseline exits 0 for legal, resolved
third-party SQL, owned-transitive-unknown and dependency-any cases. Amended
exits are respectively 0, 1, 1, 0, with the precise SQL/bridge finding asserted.
Thus an API-only passing fixture is not being substituted for CLI wiring proof.

The two separately approved gate paths are exactly
`tools/resources/boundaries.mjs` and `tools/resources/boundaries.test.mjs`.
No new gate, dependency, rule, threshold, production path or config is introduced.
The source-only pinned reflection approval is unchanged. See the original factual
[Linear gap comment](https://linear.app/resnovas/issue/EVE-278#comment-f6332a46-f3b2-4fb3-80d8-7924d751a0ca)
and independently read
[GitHub mirror](https://github.com/Resnovas/Eventiva/issues/1066#issuecomment-6995755993).
The coordinator received both STARTs and the scoped red/green results.

## Executed commands and limits

Use pinned Node 24.22.3, PNPM 12.18.0 and the frozen workspace lockfile. A fresh
worktree needed an online frozen install after offline install reported its
TypeScript tarball absent; no package/version or lockfile changed. Root setup
installed no new application dependency. All command outcomes below are local,
not hosted CI or publication evidence.

| Command                                                                                                                                                                                                                                                            | Result                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NX_DAEMON=false pnpm nx run-many -t build --parallel=1`                                                                                                                                                                                                           | PASS: all 15 build projects, no cache hits.                                                                                                                                                                                                                                           |
| `node tools/resources/boundaries.mjs`                                                                                                                                                                                                                              | PASS: 119 source type files/0 violations; feature and graph counts above.                                                                                                                                                                                                             |
| `node --test tools/resources/boundaries.test.mjs tools/resources/types.test.mjs`                                                                                                                                                                                   | PASS baseline: 116/116; amended final: 132/132, 0 failures/skips, including all owned/dependency/SQL paired controls.                                                                                                                                                                 |
| `node tools/resources/boundaries.mjs --declarations`                                                                                                                                                                                                               | PASS amended: 95 reachable owned type declarations/0 violations (baseline audited 93 entries); 3 feature declarations/0 SQL violations; emitted graph 95 files/448 edges/0 violations/cycles.                                                                                         |
| `pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/action-types.spec.ts --coverage.enabled=false`                                                                                                                                    | PASS: 1 compiler-fixture test, 19 attributed negative lines plus clean positives. Focused execution only; normal coverage-enabled project is separate.                                                                                                                                |
| `node --run check`                                                                                                                                                                                                                                                 | PASS: 104 documentation fixtures; historical mirror 258 issues/593 comments/0 stale pages; planning 692 edges/0 unresolved/stale outputs; 275 TypeScript files/0 documentation findings/ratchet violations. Offline mirror consistency is not live freshness.                         |
| Initial normal boundary/schema/contracts project run without PostgreSQL                                                                                                                                                                                            | FAIL: contracts aggregate 31 connection failures, 542 passing tests. Boundary/schema targets passed, but this invocation is not a passing aggregate.                                                                                                                                  |
| `NX_DAEMON=false pnpm nx run-many -t lint typecheck test build --projects=@eventiva/boundaries-tests,@eventiva/schema-tests,@eventiva/contracts-tests,@eventiva/runtime-tests,@eventiva/contracts,@eventiva/schema,@eventiva/runtime --parallel=1 --skip-nx-cache` | PASS: normal coverage-enabled targets for 7 projects plus dependency tasks, cache skipped, 9m15s. PostgreSQL fixture supplied by the scratch harness. Nx also reports contracts-tests:test as flaky after the earlier no-PostgreSQL failure; the warning is retained, not suppressed. |

The final post-amendment repeat used the same seven-project command without
`--skip-nx-cache`: PASS, 25 successful tasks, 7/25 cache hits, 9m03s. All normal
coverage settings remained enabled. The prior Nx flaky-task warning remained.

The initial root-check attempt encountered header-less scratch sources because
the header check enumerated those worktree-local files. Scratch probes were
moved outside the qualification worktree, still under the orb-backup directory;
the unchanged root check then passed. No header/checker exclusion was added.

Local scratch reproduction is retained outside this worktree as
`eve278-type-probes.mjs`, `eve278-declaration-sql-probe.mjs`, `eve278-cli-probe.mjs` and
`eve278-run-core.sh` under the host checkout's `.amp/in/orb-backup/`.
They contain no persisted secret values. The database harness generates random
credentials in process environment, uses the approved digest-pinned PostgreSQL
17.12 Alpine image and non-superuser CREATEDB fixture role, then removes its
container/network. No external database or production resource is used.

Graphify was queried locally before discovery. Graphify Cloud memory and the
MCP gateway were not connected; connected Linear MCP and authenticated GitHub
CLI supplied live pair evidence. No SDK API was implemented from memory.
Shared timeline, generated docs and Graphify are coordinator-owned and unchanged.
Full verify/smoke, EVE-276 combined qualification, hosted CI, issue Done and
publication are not claimed by this bounded report.

## Retained state and remaining integration

Only four task-owned paths are retained: this report,
`tests/runtime/src/action-types.spec.ts`, `tools/resources/boundaries.mjs` and
`tools/resources/boundaries.test.mjs`. No tests/boundaries source changes were
needed. The task commit is signed locally on `qualification/eve-278`, with
non-closing EVE-278 and Resnovas/Eventiva#1066 references; there is no push/PR.
The coordinator must integrate shared generated documentation/Graphify and
timeline/tracker transitions, then execute final combined-tree verification.
Neither this lane's successful checks nor either amendment accepts broad
EVE-263, EVE-276's unpublished tree, whole Core or production adoption.
