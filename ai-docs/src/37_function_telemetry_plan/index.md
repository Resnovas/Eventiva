# Structural function telemetry: binding direction and START

Refs: EVE-44. Refs: Resnovas/Eventiva#811. Whole acceptance stays open.

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
