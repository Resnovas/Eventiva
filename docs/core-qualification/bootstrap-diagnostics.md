# Core bootstrap and local diagnostics qualification

## Amendment START - 2026-11-19T00:31:32Z

Jonathan approved the exact bounded source amendment, relayed by Puck through
the [coordinator](https://ampcode.com/threads/T-d57222d4-a392-4a67-bcea-43f0bda5323a).
Resume the same lane as the fifth Core worker; no replacement occupies it.
Fetched `origin/main` remains `9fb0bda2167be0499a4a3ed729c5fa033f23dd7a`.
The signed local qualification checkpoint `1b3e87271ebe5be8ff62d9193ba34dea93a71288`
and its transferred bundle remain preserved and unintegrated. This START is
recorded before any source edit; the live issue and full six-comment page were
reread. The verified pair remains EVE-277 / Resnovas/Eventiva#1065.

The additive production reservation is **only**
`apps/server/src/cluster-profile.ts`: bound the helper's typed configuration
failure without raw input or underlying cause. Existing schemas, defaults,
topology, dependencies and settings remain unchanged. The two reserved new
qualification specs/report remain this lane's write surfaces. Add public-loader
malformed JSON, invalid edition/unsupported provider and valid controls, show
the leak red on unchanged source, then rerun actual-main controls, affected
normal targets and root check. Full verify and future EVE-276 combination remain
separate. No EVE-276/291 adoption, publication, shared timeline/generated-output
or tracker-status writes are authorized. Earlier blocked findings below are a
historical checkpoint, not the amendment's eventual result.

## Amendment result - 2026-11-19T00:37Z

The authorized helper-only correction resolves the reproduced disclosure
locally. `deploymentProfile` now replaces Config and Schema failures with
`DeploymentProfileFailure`, whose only diagnostic field is the closed reason
`configuration`. It retains neither rejected input nor the original error or
cause. The schema, defaults and successful decoded profiles are unchanged.
The initial blocker and earlier failed attempts below remain historical
evidence, not current failures. This is bounded local qualification, not
whole-issue Done, publication or combined-tree acceptance.

Before editing production source, the new regression ran against the unchanged
helper at checkpoint `1b3e87271ebe5be8ff62d9193ba34dea93a71288`:

```sh
pnpm exec vitest run --config apps/server/vitest.config.mts apps/server/tests/core-bootstrap-qualification.spec.ts
```

It exited 1: one failed and three passed. The decisive assertion was
`expected ... not to contain 'CORE_EDITION_SECRET_1101'`; serialized Exit
contained the invalid edition inside ParseError. `git diff --exit-code HEAD --
apps/server/src/cluster-profile.ts` was clean immediately before this red run.
The direct read-only probe below was also rerun against the untouched root
checkout at published `9fb0bda2167be0499a4a3ed729c5fa033f23dd7a` and confirmed
`jsonLeak:true,prettyLeak:true` for the invalid edition. A surplus closing
parenthesis in the report's displayed probe was corrected after a post-fix
copy failed to parse; both corrected baseline and amended probes then ran.
The amended helper returns `failed:true,jsonLeak:false,prettyLeak:false` for
both inputs, preserving rejection rather than replacing invalid configuration
with defaults.

New public-loader controls cover malformed JSON, invalid edition, unsupported
storage-provider value, and an injected typed ConfigProvider failure containing
an independent canary. Each fails with the closed error tag/reason and has no
canary in JSON Exit or human Cause. Valid absent/default, asymmetric community
and cloud inputs succeed with their original settings. Actual-main controls
now additionally reject the edition and storage-provider canaries, persist one
schema-valid failed span after sink acquisition, publish no registration,
release the lock, and successfully reacquire the same directory on a valid
launch. Existing provider-isolation and host atomic-registration/partial-layer
cleanup evidence remains applicable; none was narrowed or replaced.

All commands below ran on the local checkpoint plus this exact four-path
amendment, with existing discovery/configuration and unchanged 90% thresholds:

| Exact command                                                                                                                                                                                                | Decisive amendment result                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec vitest run --config apps/server/vitest.config.mts apps/server/tests/cluster.spec.ts apps/server/tests/core-bootstrap-qualification.spec.ts --coverage.include=apps/server/src/cluster-profile.ts` | 15 tests/2 files passed; loader statements, branches, functions and lines all 100%. Focused loader coverage only.                                                                               |
| `pnpm exec vitest run --config tests/telemetry/vitest.config.mts`                                                                                                                                            | 87 tests/8 files passed; statements 96.2%, branches 95.61%, functions 91.76%, lines 96.5%. Includes actual-main cleanup and privacy controls.                                                   |
| `NX_NO_CLOUD=true NX_DAEMON=false timeout 20m pnpm nx run @eventiva/server:test --skip-nx-cache`                                                                                                             | Normal target plus 12 dependencies passed, including real two-runner SQL conformance and 44 tests/12 files. Statements 98.01%, branches 94.55%, functions 96.59%, lines 98.55%.                 |
| `NX_NO_CLOUD=true NX_DAEMON=false pnpm nx run-many -t lint typecheck build -p @eventiva/server @eventiva/telemetry-tests --parallel=1`                                                                       | All 25 tasks passed; five affected tasks executed and 20 dependency tasks used valid local cache.                                                                                               |
| `node --run check`                                                                                                                                                                                           | Passed; 104 documentation fixtures, offline mirror/planning consistency, ratchet and strict scanner: 277 editable TypeScript files, zero findings/violations. No live snapshot refresh claimed. |

The normal server target used the same approved pinned, synthetic-only,
loopback PostgreSQL fixture described below, with generated non-superuser
credentials and bounded container resources. Container/network teardown
completed and the supervised daemon stopped; credentials were not retained.
No external exporter, ingestion, credential or service was used.

Only the four reserved paths differ from published main: the helper, both new
qualification specs, and this report. Semantic review checks the closed error
construction, placement after both Config and Schema, unchanged success path,
independent canaries, actual-main cleanup/success controls, attached contracts
and meaningful rationale. No existing test, threshold, schema, default,
topology, dependency or setting changed. Local signed retention must carry
both non-closing task references; no push, PR or deployment is authorized.

Full `node --run verify` remains **unrun** on this lane's amended tree.
Coordinator integration must preserve the checkpoint plus amendment, update
the canonical timeline and mirrored evidence, add any required agent-guide
note for the loader's new closed error contract, and regenerate affected
Graphify/LLMS through their owned sources. Shared outputs were intentionally
not touched; unavailable Graphify setup/gateway/Cloud remain as recorded below.
Future combined EVE-276 integration still requires complete fixture-backed
verify, normal server process conformance, runtime/resources/storage and
declaration/boundary gates, telemetry/named-provider controls and these loader
regressions against the changed public composition. No EVE-276/291 unpublished
work was adopted, and these results do not certify that future tree.

## START - 2026-11-19T00:17:52Z

This independently owned bounded qualification starts from fetched published
`origin/main` revision `9fb0bda2167be0499a4a3ed729c5fa033f23dd7a`.
The live [EVE-277](https://linear.app/resnovas/issue/EVE-277) description and
complete two-comment page were read, including the authorized dispatch START.
The actual [GitHub issue 1065](https://github.com/Resnovas/Eventiva/issues/1065)
was independently read as OPEN, with the verified
[Linear linkback](https://github.com/Resnovas/Eventiva/issues/1065#issuecomment-6988296651)
and mirrored dispatch START. This is not whole-issue acceptance.

Owner: [qualification thread](https://ampcode.com/threads/T-1fa09960-d530-4bbc-ad78-45950e5f7336).
Coordinator: [dispatch thread](https://ampcode.com/threads/T-d57222d4-a392-4a67-bcea-43f0bda5323a).
AI level: autonomous. AI tool: Amp (OpenAI GPT-6.1 Sol).

Only this report and the reserved new server/telemetry qualification specs may
be retained. Production, existing tests, configurations, manifests, shared
planning and generated outputs remain read-only. EVE-276 unpublished work is
excluded. All evidence is local; no push, PR, deployment, external exporter,
credential acquisition or source fix is authorized.

Qualification begins by mapping and running existing tests before deciding
whether any genuinely missing public behavior needs permanent coverage.
Required clauses are typed configuration before publication, named provider
isolation, failed-bootstrap cleanup/no partial registration, and safe structured
diagnostics/Cause/serialization with secret canaries and success controls.

## Evidence status

At START, execution evidence is pending. Graphify query was attempted but the
local wrapper reports it is not set up. Graphify Cloud and the MCP gateway are
not connected; direct connected Linear and authenticated GitHub reads verified
the pair. No API is implemented from memory.

## Production composition and acceptance map

All paths below describe the published source revision above, not EVE-276's
unpublished work. Test-only local capture is not production ingestion authority.

| Clause                                                      | Actual production path                                                                                                                                                                                                                                      | Observable controls and limits                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typed configuration before publication                      | `apps/server/src/main.ts` validates `deploymentProfile` before `host.register`; `cluster-profile.ts` applies Config then JSON/DeploymentProfile Schema. `packages/runtime/src/telemetry.ts` validates policy and Config before creating its worker/control. | Existing `apps/server/tests/cluster.spec.ts` rejects unsupported topology, semantic limits and malformed JSON. Existing telemetry server subprocess cases reject invalid profiles and invalid telemetry capacity without registered/ready output. New real-main case covers invalid numeric Config, malformed JSON and valid JSON with port 0, each followed by valid registration in the same directory. This diagnostic executable is not the SQL backend or readiness publication.                                                                                                                                                                                                       |
| Independent provider configuration                          | `packages/integrations/posthog-server/src/flags.ts` exports Config-backed `options` with a redacted key and explicit host; OpenFeature's server `layer` takes an explicit domain. Main uses one domain with baseline/optional remote precedence.            | Existing OpenFeature tests cover precedence, safe defaults, targeting, initialization failure and scope unbinding; PostHog tests cover opt-out/redacted Config/scoped construction. New server spec reads two asymmetric key/endpoint sets in concurrent private Config scopes and verifies missing-key control; two named real OpenFeature domains retain opposite values across one owner's disposal/reacquisition. This is not a multi-credential remote protocol test or a claim that main runs multiple remote providers.                                                                                                                                                              |
| Failed acquisition cleanup and no partial registration      | `packages/runtime/src/host.ts` admits modules atomically and owns module layers by scope. Main nests service/telemetry scopes under an independent bootstrap sink; local server logger owns a scoped directory lock.                                        | Existing `tests/runtime/src/host.spec.ts` has exact cases `registers all of a module or none of it`, `releases what a failed layer acquired and registers nothing`, `never starts the layer of an invalid module`, and removal before dependency finalization. Existing bootstrap diagnostics checks real process release ordering. New real-main case requires failed-start file-lock removal, schema-valid failed span, no registration diagnostic and successful same-directory reuse. Failed-span persistence proves actual partial acquisition for Schema failures; the invalid telemetry Config case has no file records and is not independently asserted to have acquired a worker. |
| Secret-safe structured diagnostics, Cause and serialization | Main discards the underlying Cause and returns closed `TelemetrySinkFailure`; runtime telemetry projects allowlisted records without traversing raw errors/Cause; logger decodes records and sanitizes failures.                                            | Existing telemetry canary case injects raw logs, Error, Redacted, Cause, annotations and span events across four profiles, with allowed metadata success controls. New spec checks malformed telemetry Config's typed error, `Cause.pretty` and serialized Exit, plus successful acquisition. Real-main stdout/stderr and parsed local JSONL exclude canaries. **The exported deployment profile loader itself does not sanitize invalid Schema values: see blocker below.**                                                                                                                                                                                                                |

## Concrete blocker - exported deployment profile Cause

Observed 2026-11-19 on unchanged published source:
`apps/server/src/cluster-profile.ts` exports `deploymentProfile` as Config
followed directly by `Schema.decodeUnknown(Schema.parseJson(DeploymentProfile))`.
An invalid edition string survives in its ParseError's human and JSON forms.
The following read-only probe reproduces it without credentials:

```sh
node --conditions=@eventiva/source --input-type=module -e '
import { deploymentProfile } from "./apps/server/src/cluster-profile.ts";
import { Cause, ConfigProvider, Effect, Exit } from "effect";
const canary = "CORE_CONFIG_PROBE_881";
for (const value of [canary, JSON.stringify({ edition: canary })]) {
  const result = await Effect.runPromise(Effect.exit(deploymentProfile.pipe(
    Effect.withConfigProvider(ConfigProvider.fromMap(new Map([
      ["EVENTIVA_CLUSTER_PROFILE", value]
    ])))
  )));
  console.log(JSON.stringify({
    failed: Exit.isFailure(result),
    jsonLeak: JSON.stringify(result).includes(canary),
    prettyLeak: Exit.isFailure(result) && Cause.pretty(result.cause).includes(canary)
  }));
}'
```

Decisive output, in input order:

```text
{"failed":true,"jsonLeak":false,"prettyLeak":false}
{"failed":true,"jsonLeak":true,"prettyLeak":true}
```

A separate control with edition community, port 0 and canary only in valid host
also returns `failed:true,jsonLeak:false,prettyLeak:false`. This matters: a
canary in an unrelated valid field does not expose the actual invalid-value
diagnostic path. Existing executable invalid-profile tests pass because main
catches and replaces that internal failure. They do not establish safety of
the exported loader's failure channel.

The issue's Cause/serialization clause is not silently narrowed to console
output. No source fix is authorized under the initial reservation. Coordinator
was promptly notified and the
[blockage comment](https://linear.app/resnovas/issue/EVE-277#comment-06e51f97-5221-4011-b29f-e8de96c82b47)
was posted under the verified mirror sync thread. A coordinated amendment or
an explicit boundary decision is needed; this lane does not invent one.

## Executed evidence before retained additions

Commands run from the isolated task worktree at the published revision:

| Command                                                                                                                           | Actual result                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile --offline --ignore-scripts`                                                                       | Failed: TypeScript tarball absent from offline store. No dependency/version changes.                                                                                               |
| `pnpm install --frozen-lockfile --ignore-scripts`                                                                                 | Passed, pinned lockfile unchanged.                                                                                                                                                 |
| `pnpm exec vitest run --config tests/telemetry/vitest.config.mts`                                                                 | Passed: 7 files, 85 tests; statements 96.2%, branches 95.61%, functions 91.76%, lines 96.5%. Includes existing bootstrap observer and real-server suites.                          |
| `pnpm exec vitest run --config tests/integrations/openfeature-server/vitest.config.mts`                                           | Passed: 1 file, 8 tests; statements 95.65%, branches 90.9%, functions 93.33%, lines 95.45%.                                                                                        |
| `pnpm exec vitest run --config tests/integrations/posthog-server/vitest.config.mts`                                               | Passed: 2 files, 11 tests; statements 96.92%, branches 92.85%, functions 93.93%, lines 96.82%.                                                                                     |
| `pnpm exec vitest run --config apps/server/vitest.config.mts apps/server/tests/cluster.spec.ts apps/server/tests/backend.spec.ts` | 11 tests passed; SQL backend failed `ECONNREFUSED` before local fixture existed. Not a passing suite. The shell tail returned 0, but Vitest's failure is retained here explicitly. |

Only four missing behavior cases were added: concurrent provider Config
isolation, cross-domain lifetime independence, actual-main failed-sink cleanup
and same-directory reuse, and safe rendered Config Cause. Existing tests were
not edited or duplicated to manufacture broader acceptance. Every new callable
has attached contract documentation and nontrivial phases have rationale.

## Final local gate evidence

The complete telemetry run with additions passes: 8 files, 87 tests,
same statements/branches/functions/lines coverage as the original run, and
unchanged 90% thresholds. Normal server, affected project gates and root check
also pass. None of these green suites tests or resolves the raw-loader
disclosure reproduced above.

| Exact command                                                                                                                                                                                                                                                                                   | Decisive result                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec vitest run --config tests/telemetry/vitest.config.mts`                                                                                                                                                                                                                               | 8 files, 87 tests passed; statements 96.2%, branches 95.61%, functions 91.76%, lines 96.5%; thresholds unchanged.                                                                                                                                                                                                       |
| `NX_NO_CLOUD=true NX_DAEMON=false timeout 20m pnpm nx run @eventiva/server:test --skip-nx-cache`                                                                                                                                                                                                | Passed normal target and 12 dependency tasks, including actual two-runner SQL Cluster conformance, then 12 Vitest files/42 tests. Statements 98%, branches 94.55%, functions 96.57%, lines 98.55%. Uses the documented pinned PostgreSQL 17.12 Alpine disposable fixture with a generated non-superuser CREATEDB login. |
| `NX_NO_CLOUD=true NX_DAEMON=false pnpm nx run-many -t lint typecheck build -p @eventiva/server @eventiva/telemetry-tests --parallel=1`                                                                                                                                                          | All 25 tasks passed, including affected server/telemetry tests lint/typecheck and dependency builds/typechecks.                                                                                                                                                                                                         |
| `node --run check`                                                                                                                                                                                                                                                                              | Passed; 104 documentation fixtures, mirror 258 issues/593 comments with no stale pages, planning 258 issues/692 edges with zero unresolved/stale outputs, ratchet and strict scanner 277 editable TypeScript files/zero findings or violations. This is offline consistency, not full live snapshot freshness.          |
| `pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/host.spec.ts --coverage.include=packages/runtime/src/host.ts`                                                                                                                                                  | All 24 behavior tests passed; command failed unchanged 90% coverage thresholds: statements 86.18%, branches 88.05%, functions 79.36%, lines 85.54%. Not a passing coverage gate.                                                                                                                                        |
| `pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/host.spec.ts tests/runtime/src/execution.spec.ts tests/runtime/src/identity.spec.ts tests/runtime/src/kernel-runtime.spec.ts tests/runtime/src/parity.spec.ts --coverage.include=packages/runtime/src/host.ts` | 5 files, 191 tests passed; host statements 97.23%, branches 97.01%, functions 93.65%, lines 96.98%. Focused host conformance, not a whole-runtime coverage claim.                                                                                                                                                       |

An attempted full-server baseline with the approved pinned disposable
PostgreSQL fixture was invalidated by this lane accidentally running a second
Vitest server invocation against the same coverage directory. Vitest reported
removed `.tmp/coverage-5.json`. That is a test orchestration error, not a source
failure or passing server proof; the subsequent normal server target passed
without a second server Vitest. The first draft provider case also failed on
an incorrect test import of a nonexported `flag` helper; it now uses a complete
public Flag declaration. No production source, existing test or gate changed.

## Retained state and combined integration requirements

Retained paths are only:

- `apps/server/tests/core-bootstrap-qualification.spec.ts`: two public provider
  behavior cases, discovered by the existing server Vitest configuration.
- `tests/telemetry/src/core-diagnostics-qualification.spec.ts`: two local
  diagnostic/cleanup cases, discovered by existing telemetry and runtime suites.
- `docs/core-qualification/bootstrap-diagnostics.md`: this bounded report.

No new configuration/discovery mechanism, dependency, production edit or
existing test change is needed for these additions. Source/test semantic review
checked asymmetric configuration/fallback values, explicit independent scopes,
successful acquisition controls, actual failed-span persistence, same-directory
reuse, bounded isolated child environments and schema-decoded local JSONL.
No raw production value is printed. The disposable database/container/network
are torn down after the normal server target; no fixture credentials are retained.

Qualification remains **blocked**, not accepted: exported deployment-profile
error rendering still retains invalid values, and source changes require an
explicit coordinated amendment. Whole-issue status, descriptions and relations
were not changed by this lane. Full `node --run verify` is unrun on this lane's
tree; affected normal gates are listed separately above. No push, PR, remote CI
subscription, deployment or external ingestion was performed.

Coordinator must integrate the signed local checkpoint, update the canonical
timeline and task evidence, regenerate affected Graphify (and LLMS only if its
sources change), and recheck the verified tracker pair. Graphify wrapper setup
was unavailable here; reserved generated paths were not touched. Gateway and
Graphify Cloud were unavailable; local source and connected Linear/GitHub were
used, without claiming memory reads or API implementation from memory.

EVE-276's unpublished backend/agent-run/Cluster action, invocation/execution,
storage, SQL fencing and configuration changes were neither read as baseline
nor adopted. On a future authorized combined tree, rerun root `check`, complete
fixture-backed `node --run verify` (including normal server two-runner process
conformance, runtime/resources/storage suites and declarations/boundaries),
telemetry and named-provider qualification, plus any raw-loader fix regression.
Reverify no partial host publication, cleanup and safe Cause at the changed
public composition boundaries. This lane's published-main results do not
establish those combined checks or authorize production activation.
