# Source-wrapper function telemetry

Refs: EVE-44. Refs: Resnovas/Eventiva#811. Whole acceptance stays open.

## Matched native overhead checkpoint - 2026-11-27

Run `node tests/telemetry/benchmark/check.mjs` for the strict release gate: median paired p50 ratio below 3x for each of production and profiling. Exactly 3x fails. Local full verification and hosted CI run five prespecified trials per mode, outside parallel or cached Nx work. The deterministic interpreter-step test is independent. Add `--target-2x` to check the ongoing optimization goal; it has not been achieved. Preserve fresh Flags, ambient restoration, sanitized attributes, caller scope and all-exit metrics. See `docs/architecture/function-telemetry.md` for p50/p95/mean, repeats, negative controls and the compiler-directive policy.

## Optimization and purity correction - 2026-11-20

Jonathan's [binding decisions](https://linear.app/resnovas/issue/EVE-44#comment-3aeb878a-e135-4277-9d1e-7c747b59bd84),
relayed by Puck on November20 with original decision times unknown, require
overhead optimization and unused-native-declaration elimination before publication.
Neither the approximately11x cost nor195KB unused declaration is accepted.
Native Effect.fn, outer Flags, all assertions/privacy/exits and finite helper
accounting stay strict. No numeric target, hook/commit/push authority follows.

The [canonical profile and matched measurements](../../../docs/architecture/function-telemetry.md#overhead-optimization-and-declaration-elimination---2026-11-20)
preserve before-source/CPU profile and non-additive scratch ablations. Scoped
tracing/context restoration dominates; Flags-only adds about12us over its
native control. Static attributes and histogram descriptors were already reused.
Adopted source changes: skip a redundant enabled-tracer scoped write, pretag
per-operation MetricKeys to use Effect's cached untagged registry hook, and
sequence setup via native as/apply/flatten instead of dummy service Contexts.
No new authored helper body, cached mutable flag/start value, cast or exemption.
The public spec is unchanged; every execution still reacquires Flags/timer state.

Same installed Vite browser build and7200samples per original benchmark variant:
production observed p50/p95 119.01/205.58us before,89.51/146.54us after;
test-timer131.04/216.13before,92.89/181.94after. p50 reductions24.79%/29.11%.
After/native p50 ratios remain8.13x/9.46x, not an approved target. Separate
native-floor p50 controls: direct0.324us, generator2.807us, withSpan15.102us,
native fn13.466us. Native call Error/span/clock/parent/Exit work remains by
contract; the much larger current wrapper remainder is not proven irreducible.
Jonathan's final target still needs selection. No global p95 claim.

Source annotation fixes the supported unused local declaration: annotate the
OUTERMOST Effect.fn(...)(generator) call. Same installed Vite build gives26479B
versus26482B baseline, exact JavaScript equality except generated filename comment.
Unannotated195436B and inner-only195448B retain the negative canary.
Used195444B/195465B outputs are identical except filename/21-byte annotation;
both execute to41. Existing sideEffects:false alone was insufficient. The two
owned native generator definitions now carry the outer annotation. No dependency,
upstream Effect change, package metadata amendment or build rewriting was needed.

Purity lint/autofix is a separate later packet assigned to this worker AFTER
primitive publication, not started now. Only a new rule/tests in existing lint
tooling and funnel-cleared minimal root registration are contemplated. Resolve
symbols/static safe arguments and supported pipeables; unsafe/unresolved forms
need diagnostics, never an unsafe fix. tools/function-telemetry stays inventory-only.
No global enforcement or migration is claimed by the current source annotation.

After optimization: patched runtime build/telemetry tsc pass; normal telemetry
101tests/10files pass unchanged90% gates,96.58/95.68/91.86/96.84 coverage;
primitive56/56statements,2/2authored bodies,6/6branches. verify:static passes
with zero source/declaration violations/cycles. The older runtime689/contracts589
hook is only evidence for its older tree. No fixture/new hook/full-suite rerun,
commit/separate graph/push/exact-head CI or publication has occurred here.
Publication stays held for final overhead target and remaining qualification;
CodeQL dismissals remain Jonathan's separate decision. Both trackers stay open.

## Patched-toolchain qualification and current publication hold

Historical pre-optimization checkpoint; its tested tree does not cover the new
source changes above. Retain all failed outputs and delivery boundaries.

The [current canonical checkpoint](../../../docs/architecture/function-telemetry.md#patched-toolchain-hook-qualification---2026-11-20)
supersedes earlier unresolved compiler/fixture/hook-integration status below,
not failed outputs or the publication hold. Published base515a62ff, tested
staged tree42b273dabb372e641f47944228ca3fcdc93d49b8. These subsequent evidence
docs are separate from that tested tree, not implicitly hook-qualified.
[EVE-44](https://linear.app/resnovas/issue/EVE-44#comment-b62cfd38-5e0d-41ef-a579-9aae8f9c9599)
and [explicit #811 mirror](https://github.com/Resnovas/Eventiva/issues/811#issuecomment-7045755856)
remain open; no commit/push exists.

Puck-authorized exact renewal supervised daemon/pinned non-superuser PostgreSQL
fixture passes resource/loopback/SCRAM/role checks. Candidate compiler hardlinks
become real copies before existing prepare; vendorcheck confirms both patched
0.87.5, shared originals unchanged. Old diagnostic miss reproduces without
primitive on clean541b18ac and disappears in isolated patched controls; historical
missing-patch lifecycle cause stays unknown. First new hook fails static on six
chained provides; retained failure precedes Puck's exact six-expression spec-only
single-provide correction. Same services/assertions, no suppressions/config edits.
Patched telemetry tsc and normal101-test telemetry pass.

Fresh authorized installed hook WITHOUT git commit exits0,17:01:28-17:08:21UTC
on November20: static,22affected tasks (13cache hits),323tooling. Runtime689tests
and contracts589tests execute fresh; normal statements/branches/functions/lines
are93.86/90.43/93.02/94.88 and95.53/91.97/93.61/95.92 respectively. Telemetry
remains101tests,96.57/95.68/91.86/96.83. Unchanged90% gates/isolation/assertions/
1200s bound. Final17:09audit: zero containers, fixture network absent, daemon
stopped; no services/processes/5432listener/container directories. No fixture left.

Publication STILL HOLD: Jonathan's measured overhead/unused-native-declaration
decisions, source/separate clean graph delivery and exact-head candidate CI.
No standalone aggregate/smoke/feature/global acceptance from this hook. No later
checker/migration/root/held-source or SQL transaction packet authority follows.

## Retained normal-hook failure and delivery hold

Installed source-hook attempt106600 exits1 without creating a commit. Static,
root/documentation and143 Node fixtures pass; aggregate fails six targets.
Resource tests31fail/37pass, runtime46fail/643pass, contracts31fail/558pass.
PostgreSQL cases report local5432 ECONNREFUSED. Independently, unchanged
runtime action-types expects patched Effect diagnostic codes `[1, 1, 1]` but
receives `[]`, despite its standard TypeScript diagnostic assertion passing.
That separate compiler/environment failure remains unresolved, not attributed
to SQL or this primitive. Smoke/features are not reached. The focused101-test
telemetry pass does not erase these failures.

The [canonical retained attempt](../../../docs/architecture/function-telemetry.md#retained-source-hook-failure-and-delivery-hold---2026-11-20)
records exact patch/output hashes. Source/spec/docs remain local, uncommitted
and unpublished; separate clean graph delivery and exact-head CI are pending.
Coordinator relays Jonathan's hook correction verified15:16:33UTC: static plus
affected tests only, funnel-owned. No unpublished root adoption, further old-hook
attempt/tuning, provisioning, weakened coverage/assertions/isolation or retry.
Puck's broader push-main/seven-day interpretation is not a Jonathan quote.

## Candidate public API and measurements

Use `@eventiva/runtime/function-instrumentation`: yield* functionCatalog with
static names, yield* functionObservation with its opaque handle and one member,
then yield* namedGenerator(args).pipe(observe). The native returned Effect's
outer composition is essential; putting observe inside Effect.fn's definition
pipeables is not equivalent. Scope/Flags and admission failures are explicit
inferred requirements. Reuse prepared operators. The [canonical complete example
and evidence](../../../docs/architecture/function-telemetry.md#primitive-api-and-bounded-evidence)
owns exact options, defaults, fixed errors and constraints; the new public spec
is compiled by telemetry/runtime/contracts consumers without source exclusions.

The target-wide8192 union includes both authored generator helpers and persists
across handles. Histogram descriptor identity is reused. Two catalog and eleven
prepare completions match that finite self-observation case's exact executions;
native terminal metric programs never invoke either helper. No authored
recursion guard or skipped helper is used. Default-on signals are independent;
both span flags and ambient enablement must permit tracing. Production extra
timer remains OFF even with flag TRUE; explicit test capability makes timing
mandatory. The private restoration scope reprovides the caller's Scope for
business resources. Only fixed admitted labels/static generator metadata enter
observations; central sanitized projection and existing remote opt-in policy
remain required. This is not an arbitrary external-tracer privacy guarantee.

Normal telemetry suite exits0:101tests/10files, unchanged90% thresholds;
96.57% statements/95.68% branches/91.86% functions/96.83% lines. Coverage JSON
includes primitive55/55statements,2/2authored bodies,6/6branches. Nine public
cases include all exits/exact-original recovery, independent signals, timer,
helper/cross-handle bounds, repeated execution, concurrent ancestry, resource
lifetime, private canaries, provider/sink faults, saturated queue and independent
required-audit failure. That audit is a test port, not production tamper evidence.

Measured7200calls per variant after warmup in the Linux orb: native vs observed
production p50 10.81us vs120.19us, p95 20.48us vs220.35us. Test-timer p50
9.85us vs124.30us, p95 17.08us vs191.71us. No speedup or tolerance inferred;
the whole-call single-step probe is not global per-step/p95 acceptance.
Unminified installed Vite browser builds remove the unused primitive subpath
(26485bytes, canary absent; baseline26480bytes). Used primitive552076bytes;
native fn-only195418bytes. An unused local native Effect.fn declaration remains
retained195435bytes: explicit BLOCKED wrapped-declaration elimination for later
qualified checker/migration work, not hidden by a purity annotation. See the
[measurement scope](../../../docs/architecture/function-telemetry.md#primitive-measurements)
for warmup/order/gzip/control details. Hooks/full combined gates/publication
remain unexecuted; this evidence supersedes only earlier incomplete local cases.

## Superseding recovery contract and outer gate - 2026-11-20

Jonathan selected exact original-object recovery through Cause.originalError for
typed failures and subsequently defects, retaining native generator Effect.fn.
The [typed selection](https://linear.app/resnovas/issue/EVE-44#comment-13e6efa4-28e0-4085-9137-313b53e5ec9f)
and [subsequent defect record](https://linear.app/resnovas/issue/EVE-44#comment-c644ce53-2b0d-41a6-a372-6dc1875f04c3)
supersede raw proxy identity, not values/interruption/finalizers/audit or other
gates. Puck relayed both on November20; original human-decision times unknown.
[Explicit #811 mirror](https://github.com/Resnovas/Eventiva/issues/811#issuecomment-7042897976).
Assert distinct supplied originals and native controls, not matching text/type.
Preserve the old failed raw-identity checks and independent control evidence.

Current diagnostic focused spec: six pass. Runtime build and verify:static
exit0 with no source/declaration boundary violations or package cycles.
The corrected operator surrounds the returned Effect, not Effect.fn's inner
pipeable list. Explicit OFF/ON controls prove business/catalog/preparation
span gating and fresh repeated execution. The Flags provider's separate native
spans are outside these subjects; no helper exclusion or global claim follows.
Independent Metric.snapshot proves repeated8ms/13ms durations; the selected
originalError assertions reach interruption and four business finalizers.

Publication remains HOLD: default/explicit full signals, ambient tracing,
test-only mandatory timing, finite helpers, failures/overload/audit, overhead,
tree shaking and normal source/separate clean graph hooks remain unqualified.
All edits remain local/uncommitted/unpublished. Earlier checkpoint below is
historical, not the current error oracle. No root/checker/migration expansion.

## Unqualified native candidate and publication hold - 2026-11-20

Historical failed checkpoint: the local primitive/spec and exactly two cleared export/coverage hunks are
uncommitted and unpublished. Runtime build passes; focused public-contract run
has three passing cases and two retained failures. Full static verification
exits1 on two unused spec imports. No normal source/graph hooks or CI are claimed.
See the [candidate checkpoint](../../../docs/architecture/function-telemetry.md#effect-native-candidate-qualification---2026-11-20)
for exact commands, evidence and unexecuted obligations.

Confirmed composition blocker: installed Effect.fn applies its pipeables before
adding its own outer withSpan. A tracing-disable pipeable does not suppress that
span; an outer gate does. Flags must therefore surround native execution, not
be installed as this candidate's inner pipeable. Qualify a corrected outer
composition, including both authored generator helpers, without exemptions,
sync runners, casts or unobserved callbacks before publishing anything.

Do not infer a timer defect from the first spec failure: independent
Metric.snapshot has a sample while a newly constructed Metric.timer queries a
distinct zero-count histogram with the same displayed name/tags. Snapshot-based
observation and descriptor reuse/capacity need qualification. The second
failure compares raw object identity; native uninstrumented Effect.fn also
annotates/proxies that failure, while Cause.originalError retains identity.
Use a correct native baseline; later defect/interruption assertions did not run.

Scope/receiver/environment, concurrent sanitized ancestry and catalog boundary
cases pass, not all-exit/full Flags/finite-self-observation/overload/audit proof.
No overhead or emitted tree-shaking measurements exist for this candidate.
Preserve the failures; do not claim best-found optimization, global coverage,
production activation, completed primitive or finished EVE44/#811.

## Binding A selection and queued lint packet - 2026-11-20

Jonathan selected A: EVERY first-party helper, including pure total sync
helpers, becomes named generator Effect.fn and callers yield* it. Sources:
[binding selection](https://linear.app/resnovas/issue/EVE-44#comment-ddad7ad8-abb8-4d63-9c78-28795816f0f9)
and [explicit mirror](https://github.com/Resnovas/Eventiva/issues/811#issuecomment-7041886325).
Puck relayed this on November 20; original human-decision time is unknown.
This supersedes the mixed-wrapper plan/options hold below, not prior evidence.
No instrument() sync wrapper, try/finally, runSync/cast/suppression bridge or
root/opacity clearance. Use Exit/finalizers/Metric; Flags outside spans; additional
profiling timer only in tests. Native span timestamps remain distinct.

Primitive/public-contract proof comes first. The queued later checker packet
reuses tools/function-telemetry inventory and installed TypeScript/ESLint,
resolves true symbols/static catalog/generator bodies/caller execution and
rejects fake/eager wrappers or dropped/nested Effects. Working --fix propagates
lazy Effect types through resolved closed caller graphs; second pass zero diff
requires type/receiver/argument/recursion/overload/runtime proof. Constructors,
accessors/framework callbacks/dynamic/public external contracts remain exact
BLOCKED until redesigned, never exempted. Account for generator implementations
and introduced helpers; finite self-observation remains a proof obligation.
Future checker owner has only tools/function-telemetry/** after dispatch;
root ESLint/package/Nx/verification stay funnel-owned. This primitive assignment
does not implement that packet or migration. Source presence, executed evidence
and publication are reported separately; EVE44/#811 remain open.

## Current owner ruling and options gate - 2026-11-20

Historical options-before-implementation checkpoint, superseded by A above.

Jonathan ruled NO to the rule 3 try/finally exception for instrument(), relayed
by Puck on November 20; original human-decision time is unknown. Sources:
[binding Linear ruling](https://linear.app/resnovas/issue/EVE-44#comment-3026bf41-1f35-4315-bae9-f5cd6aa7f1c0)
and independently read [GitHub mirror](https://github.com/Resnovas/Eventiva/issues/811#issuecomment-7041759687).
No runtime Proxy/try-finally, hook suppression, integration relabeling or
vendor-opacity bridge is authorized. Use Effect facilities; lift real vendor
async work at its existing boundary. Plain sync helpers must be total, so raw
throw-identity preservation is not an applicable compliant-helper requirement.

Puck requires OPTIONS BEFORE implementation. The canonical architecture's
[helper redesign comparison](../../../docs/architecture/function-telemetry.md#effect-native-helper-redesign---owner-review-required)
is a proposal, not a selected API or migration:

- A, recommended for ordinary helpers: named generator Effect.fn returns an
  Effect instead of the original value. Callers yield* it; helper body execution
  is lazy and repeated Effect execution is fresh. Sync-only callback/framework
  APIs require individual redesign or remain BLOCKED. No Promise is needed.
- B: keep the total sync helper and observe its invocation from a named Effect
  step using deferred Effect.sync. This changes callers, not the helper API.
  Bare calls/internal helper calls escape; it cannot replace every-definition
  enforcement without an explicit owner policy change and full call-edge proof.
- C: a total-thunk lift returning Effect has A's return/laziness impact plus a
  wrapper/callback and retention edge. It is not a transparent sync alternative.
  Do not introduce another wrapper name without a demonstrated reused need.

Named Effect.fn adds generator/interpreter/span and definition/call Error
allocation costs; captureStackTrace:false does not eliminate all allocation.
Optional timer cost is separate from intrinsic span timestamps. No overhead
tolerance, speedup or tree-shaking acceptance has been measured. Preserve
sideEffects:false truth, modular imports and lazy bounded catalogs; prove real
used/unused consumers, do not add unproved purity annotations or a global
registry that retains otherwise unused functions. B can keep pure modules free
of Effect imports, but cannot meet universal definition coverage by itself.

All-exit observation uses Exit/finalizers/Metric, without exporting Exit/Cause,
raw errors, arguments or results. onExit finalizer defects can change the business
Exit; fault containment/visible health remains a proof obligation. Finite helper
self-observation still needs bounded accounting terminating in vendor facilities,
not an unobserved first-party callback or a reentrancy exemption. Existing Flags,
production timer OFF/test ON mandatory, remote opt-in OFF and8192 remain binding.

Executed option models: node .amp/in/orb-backup/effect-native-options.mjs exits0,
four PASS controls on published541b18ac/Effect3.22.4. A is lazy/repeatable with
fresh spans/two metric increments and composes41/72 with ancestry. B's observed
step retains ancestry but bare calls emit nothing. Nested runSync loses parent
and ignores outer tracing-disable context even for a total body, so it is not
the proposed sync bridge. This is not production primitive/spec/Flags/timer/
finite-helper/performance/emitted-consumer acceptance. No primitive, root hunk,
commit or publication follows before the owner selects the API/call-site form.

## Current selected mechanism - 2026-11-20

The earlier source-wrapper selection below is qualified by the later NO ruling
and current options gate above; it does not authorize transparent sync wrapping
or an implicit value-to-Effect conversion. Jonathan selected generator-form named Effect.fn for every Effect-returning
function and one-line instrument("op", originalFunction) definitions for all
other first-party functions. No exemptions, decorators or build-time rewriting.
The lint rule's working --fix adds missing wrappers to actual source; emitted
and directly loaded source must run that same implementation. Preserve private
visibility and behavior rather than exporting formerly private helpers.

Spans, timer starts and metric measurement state are fresh per call/execution,
never definition-time observations. Effect3.22.4 Effect.ts28923-29064 sends native
generator bodies through core.fromIterator, whose internal/core.ts implementation
uses suspend. Non-generator bodies and Effect.fn pipeline callbacks execute
while constructing the returned Effect. Require generator form and put deferred
observation inside the generator or Effect.suspend; syntax alone is insufficient.
Test no observation at definition/construction and distinct spans/samples when
executing the same returned Effect twice, concurrent ancestry and all exits.
Effect.fn supplies a span, not automatic counters/histograms. Source inspection
does not substitute for primitive behavior proof or working lint enforcement.

Staging is primitive first, then symbol-aware lint with executed --fix and
idempotence/behavior/fake-wrapper/eager-state fixtures, then coordinated source
migration. Puck assigned the freed CodeQL slot to primitive execution thread
T-f8067a59-6f0f-4ced-9708-e13b3317ffdd, isolated agents/eve44-primitive from
published541b18ac. It owns only new function-instrumentation.ts/spec and
canonical EVE44 sections, with no nested threads. tools/function-telemetry
is the later checker stage, not an extra implementation here. Funnel reconfirmed
only the additive runtime subpath and telemetry coverage include; existing
runtime/contracts configs also discover the telemetry spec. Root wiring and
existing telemetry/bootstrap/process fixtures remain read-only.
No transform proof is scheduled. Unsupported constructors/async/generator/
framework semantics and finite collector self-observation remain BLOCKED,
not exemptions or permission to apply behavior-changing fixes.

Earlier signal/privacy/8192/optimization/tree-shaking requirements remain.
Counters/metrics/traces/spans/attributes default ON through existing Flags;
timers default OFF in production and ON/mandatory in tests; remote export is
opt-in/OFF. No new dependency, provider, production activation or spend.
Five-lane cap and separate normal hooks within1200s remain. Measure real CPU/
memory over a full hook before considering an upgrade, report sustained70-80%+
use; a paid upgrade still requires an explicit amount. EVE-248 January2027.

The selected source mechanism supersedes the historical pending/decorator/
transform discussion below. See the canonical architecture's current selection
and EVE-44 comment2d3ca630-e4d5-40a9-ae1d-f9cd58fd8f06.

## Primitive qualification hold - 2026-11-20

Historical pre-ruling checkpoint only. The requested rule 3 exception below
was rejected; no further exception is pending. The current gate is owner review
of the Effect-native helper options, not permission for the diagnostic Proxy.

Both retained input hashes match. Selected prose is reconciled, never the old
timeline/decision history or generated LLMS wholesale. Diagnostic probe
node .amp/in/orb-backup/primitive-qualification.mjs exits0 on published541b18ac:
zero generator observations at definition/construction, fresh spans/counter
increments on repeated execution, construction-eager negative controls,
four-exit business/finalizer/audit preservation and concurrent ancestry.
These controls are not production primitive/public-contract acceptance.

Disabling tracing inside the generator leaves Effect.fn's outer span enabled;
Flags need outer deferred control. Effect.runSync normalizes synchronous thrown
identity; a diagnostic Proxy+try/finally preserves the tested synchronous
receiver/arguments/arity/value/throw contract. At that checkpoint production use
awaited a scoped rule3 ruling; the subsequent NO rejects that path. No override
or hook suppression is inferred.
Typed synchronous context, finite helper observation and full flag/timer/
privacy/catalog/overload/async qualification remain unproved, not exemptions.
No production primitive/spec/export/coverage change or publication is claimed.
Context7 is quota-blocked; installed Effect3.22.4 source supplied the evidence.

## Historical bounded inventory and superseded proposals

Read `docs/architecture/function-telemetry.md` for Jonathan's seven binding
selections and the structural mechanism proposal/START. No manual per-call
withSpan migration. Existing Flags/Flag defaults TRUE for production-local
counters/metrics/traces/spans/attributes. Timer defaults FALSE in production,
TRUE/mandatory in tests. Remote export always opt-in/OFF. Attribute content
is counters/pre-approved static strings only, never PII/secrets/raw errors.
Operation-name capacity is8192. No first-party exemptions: tiny/internal
helpers included; generated bodies are covered through their generator.
Unsupported forms are BLOCKED, not suppressed or baselined. Existing vendor/
third-party/immutable-history source policy remains, not an exemption list.

Review p95 time PER STEP and the slowest5% for improvement. On every touched
function review optimization, benchmark any candidate against current before
commit, and attach one precise agent-facing JSDoc optimization evidence line.
The proposed @agent-optimization syntax/check and per-step report are not yet
required-root enforcement; no new numeric performance tolerance is approved.

S1 STARTED in the existing owner lane: tools/function-telemetry/structure.mjs
and structure.test.mjs plus canonical plan/chapter37/isolated planning notes.
One installed-TypeScript structural transform is proposed across emit/source
targets. Effect.fn handles Effect execution, not arbitrary synchronous pure
APIs; service proxies cannot observe private helpers. Prove all exits, receiver,
arguments, closure, lazy execution and emitted coverage before global adoption.
Collector self-observation/async/framework semantics remain explicit proof
obligations, not internal-helper exemptions. Do not claim native metric export
from current trace-only integration or use success-only trackDuration alone.

D exclusively owns current timing/process-runner and pipeline/root
package.json/nx.json/tools/verification work. If the next correctly configured
unchanged20m run times out, the later Puck amendment moves measured pipeline
work before step1 delivery instead of repeating; preserve all gates/bounds.
This owner makes no competing
root/Nx/ESLint or D guide/chapter17/source edits. Renewal/SQL remain separate.
Later production primitive and target adapters need exact path release before
writing; refresh occupancy at START and keep total at or below five. No new
dependency, paid amount, provisioning or activation. EVE-248 January2027;
budgets/settings unchanged. Preserve archived examples byte-for-byte.

S1 initial proof: node --test tools/function-telemetry/structure.test.mjs passes
five contracts. inspectStructure(source, file='source.ts') inventories bodies,
including nested/private/pure/generated, with every instrumentation occurrence
still BLOCKED. inspectOptimizationChange(before, after, file) checks attached
records on changed functions; it performs no filesystem/Git IO. Parse failures
block comparisons; fake wrapper names never grant coverage. Self-inventory12
bodies/zero missing optimization records is not instrumentation acceptance.
The per-file8192 overflow warning does not prove whole-target catalog capacity.
Semantic transform/collector/target proof and required-root wiring remain
unfinished, not waived; the canonical S1 evidence section records exact limits.

Later binding additions: optimization is opportunistic AGENT work when slower
nearby code is noticed, not a build optimizer. Benchmark current/candidate before
commit and record the same one-line JSDoc evidence; coordinate active paths.
Tree-shakeability/dead-source removal are first-class. Existing noUnusedLocals/
noUnusedParameters and sideEffects=false are not unused-export/bundle proof.
After the mechanism decision/root release, required installed-TypeScript entry/
alias/registration analysis, real used-versus-unused emitted-consumer controls
and joined runtime operation metrics feed one verification report. Zero runtime
observations without complete instrumentation/flags/window/target coverage are
NOT proof of deadness. Public external consumers/dynamic roots need evidence;
unresolved edges BLOCK, never suppress. Remove proven dead first-party source
at its owner/generator and rerun live/rare-path controls. No deletion yet.

Puck is asking Jonathan about build-time instrumentation. Keep this mechanism
PROOF-ONLY pending his answer; no production transform/loader/wiring adoption.
The canonical plan records the selected-policy versus mechanism-decision split.

Later interim signal, NOT a final mechanism decision: Jonathan leans toward
decorators. Do not extend compiler-transform proof; only shared inventory and
semantic work continues. Proposed method decorator/Effect.fn/sync-definition
instrument forms do not create a tiny/internal-helper exemption. Installed
TS6.0.3 accepts the standard method decorator under unchanged strict root
options, but direct Node24.22.3 TS loading rejects its token. Existing target
lowering/source routes still need qualification, not config weakening. A bounded
concurrent-fiber getter probe retains distinct parent names, not a qualified
typed primitive; vendor opacity, nested restoration, async/native behavior,
per-step profiling and collector self-observation remain unresolved. Ordinary
non-generator Effect.fn bodies execute at construction: verify actual execution
coverage rather than accepting a wrapper name. No production adoption yet.
