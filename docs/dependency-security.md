# Dependency security remediation (EVE-265)

[EVE-265](https://linear.app/resnovas/issue/EVE-265/remediate-dependabotaudit-security-alerts-on-main)
tracks dependency remediation approved by Jonathan on 2026-11-18, relayed through
[the requesting thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a).
Necessary major upgrades are included; production deployment is not authorized.

## JSDoc licence prerequisite (EVE-299)

Jonathan approved package-wide licence exceptions for exactly `parse-statements`, `spdx-exceptions` and `uri-js`, relayed through [Puck](https://ampcode.com/threads/T-01a1f613-a4ae-7780-b85a-74cc4a1c1727) on 2026-11-20. The original human-selection time is unknown. [House PR #57](https://github.com/Resnovas/.github/pull/57) originally applied those exceptions only to the house repository. The synced policy now supplies the same three exceptions to Eventiva.

The PR/merge-group dependency-review workflow reads `.github/dependency-review-config.yml`. Its shared licence list excludes CC-BY-3.0, which the resolved `spdx-exceptions@2.5.0` package declares. Local metadata for `parse-statements@1.0.11` and `uri-js@4.4.1` declares MIT and BSD-2-Clause respectively; this does not establish what GitHub's dependency graph reports. A direct push does not run dependency review, so passing push CI alone cannot certify that PR-specific result.

The managed block supplies this list. Do not repeat the YAML key below `house:local`: dependency review rejects duplicate keys before it evaluates dependencies.

```yaml
allow-dependencies-licenses:
  - pkg:npm/spdx-exceptions
  - pkg:npm/uri-js
  - pkg:npm/parse-statements
```

The versionless package URLs cover all versions of those packages only. They do not allow CC-BY-3.0 generally, suppress an advisory or waive the seven-day release cooldown. Any fourth package still needs owner approval. For a review failure, inspect the reported package and dependency-graph licence rather than broadening the allowlist. The [EVE-299 prerequisite record](https://linear.app/resnovas/issue/EVE-299#comment-c72ad25f-85ea-4c0d-8c52-f7bda0f0a21c) and [explicit GitHub mirror](https://github.com/Resnovas/Eventiva/issues/1092#issuecomment-7038687715) distinguish this policy-only delivery from the preserved, uncommitted JSDoc/socket/reference candidate. No dependency version changes in this prerequisite.

## Reproduce the inventory

Run `pnpm audit --json` at the repository root. Do not use
`--ignore-unfixable`: an unavailable patch is still a finding. GitHub's Dependabot
endpoint returned HTTP 403 during this capture, so these are npm audit findings,
not verified GitHub alert counts. Reconcile the two inventories when access arrives.

For an archived lockfile, copy only its `pnpm-lock.yaml` into a separate scratch
directory with a minimal private `package.json`, then run `pnpm --dir <directory>
audit --json`. Running inside a nested historical package can select its parent
workspace instead. No historical install, build or application check is needed.

Baseline at main `a204700e`, 2026-11-18:

| Lockfile | Critical | High | Moderate | Low | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| `pnpm-lock.yaml` | 0 | 2 | 2 | 0 | 4 |
| `examples/eventiva-before-amp/pnpm-lock.yaml` | 11 | 166 | 175 | 27 | 379 |
| `examples/eventiva-before-amp/packages/databases/pg/pnpm-lock.yaml` | 0 | 2 | 0 | 0 | 2 |
| `examples/packages-old/core/pnpm-lock.yaml` | 0 | 14 | 21 | 5 | 40 |
| `examples/packages-old/databases/pg/pnpm-lock.yaml` | 0 | 2 | 0 | 0 | 2 |
| `examples/packages-old/extensions/contact/pnpm-lock.yaml` | 0 | 1 | 2 | 0 | 3 |
| `examples/packages-old/extensions/hello-world/pnpm-lock.yaml` | 0 | 1 | 2 | 0 | 3 |

Counts overlap across lockfiles and cannot be equated to unique advisories or
Dependabot's roughly 399 alerts. Historical snapshots are excluded from the live
workspace. EVE-244 and EVE-264 preserve their bytes: upgrading or deleting them
requires an explicit owner override of historical preservation, not just general
dependency-upgrade approval. They remain findings, not suppressed or fixed alerts.

Vendored upstream references are also excluded from the active workspace. Their
lockfiles are not repaired by a root override. The following inventory is separate
from both the runtime audit and the historical snapshots:

| Vendored lockfile | Critical | High | Moderate | Low |
| --- | ---: | ---: | ---: | ---: |
| `externals/upstream/effect-main/pnpm-lock.yaml` | 0 | 16 | 19 | 3 |
| `externals/upstream/effect-stable/pnpm-lock.yaml` | 9 | 115 | 73 | 17 |
| `externals/upstream/react-intl/packages/react-intl/tests/react18-typecheck/pnpm-lock.yaml` | 0 | 0 | 0 | 0 |
| `externals/upstream/eslint-config-prettier/yarn.lock` | 2 | 49 | 33 | 9 |
| `externals/upstream/node-postgres/yarn.lock` | 11 | 106 | 81 | 25 |
| `externals/upstream/node-postgres/docs/yarn.lock` | 3 | 39 | 46 | 12 |

PNPM rows use isolated `pnpm audit --json`. Yarn rows use the installed Yarn-v1
parser or YAML parser for Berry, then submit the exact locked registry package
names/versions to npm's bulk advisory endpoint, counting unique advisory IDs per
lockfile. These counts are not PNPM path counts. Vite's two `lockfile-hash`
`yarn-lock/yarn.lock` and `yarn-state/yarn.lock` fixtures contain only a synthetic
`foo@1.0.0` key without a resolved version: there is no installed package to audit,
not evidence that Vite itself has zero findings. No other tracked dependency
lockfile was found in this capture. Vendored files retain upstream provenance;
repair requires a reviewed subtree refresh rather than a silent local patch.

## Batch 1: Expo development-tool schema validation

The consumer-scoped `@expo/cli>zod: 4.6.7` override removes Zod 3.25.76 for
[GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).
Expo 56.1.27 uses Zod only for its development-plugin and MCP command schemas;
their object, enum, union, strict-key and safe-parse APIs remain available in v4.
Do not broaden this override to unrelated consumers or import Zod into platform
source, which continues to use Effect Schema.

The release was published on 2026-10-12 and satisfies the unchanged seven-day
cooldown. No feature flag is added for a mandatory security dependency fix.
Observed audit inventory after resolution: 0 critical, 1 high, 2 moderate, 0 low.
Delivery and exact verification evidence are recorded on EVE-265.

## Batch 2: filesystem matcher majors

Version-range overrides upgrade only affected glob generations (`>=9.0.0 <14.0.2`)
to 14.0.4 and minimatch generations (`>=7.0.0 <11.0.1`) to 11.0.7. These fix
[glob GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4)
and [minimatch GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
Unaffected legacy glob 8.1.0 and minimatch 5.1.9 retain their original APIs.
The chosen releases were published on 2026-11-06 and 2026-11-10, respectively,
and satisfy the unchanged seven-day cooldown; newer ineligible releases are
not exempted. Node 24 remains within both packages' supported engine ranges.

Scratch compatibility probes run unchanged before and after the upgrade cover
synchronous/asynchronous file discovery, dotfiles, brace expansion, extglobs,
ignore patterns, no-match results, case sensitivity, escapes and negation.
These are dependency API probes, not an upstream security proof or permanent
application contract tests. Full workspace checks cover their actual consumers.
After resolution the root audit reports 0 critical, 1 high, 0 moderate, 0 low:
only picomatch remains. Exact gate results and signed delivery are on EVE-265.

## Residual work

- **High, picomatch:** [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)
  affects installed 2.3.2 and 4.0.7. The registry reports no patched range and
  latest 4.0.7 remains affected. Do not replace the package with an unrelated
  matcher, suppress the advisory or claim upgrading to latest fixes it.
- **Historical lockfiles:** the inventory above remains blocked by EVE-244 /
  EVE-264 preservation. Jonathan instead approved scanning exclusions on
  2026-11-18, without changing these files. Excluding/dismissing is not patching.
- **Vendored reference lockfiles:** the inventory above needs reviewed upstream
  or subtree refreshes, not local patches to provenance-preserved source.

### Picomatch dependency paths and reachability

The [full captured `pnpm why picomatch` tree and parent-version inventory](https://ampcode.com/artifacts/picomatch-exposure-05e2b2d3-6376-49ac-9cb0-45d073182216)
contain every dependency path, rather than a deduplicated list of names. Reproduce
with `pnpm why picomatch --json` and `pnpm why picomatch`. Every occurrence is
transitive: active manifests and application source do not directly depend on or
import picomatch. Nx, ESLint, Jest, Rollup, Vite/Vitest, Expo and Metro use it for
development, test, bundling or file-watching work. Expo's runtime-declared package
graph does not make every nested build tool part of the deployed application.

One runtime-declared server branch is `@eventiva/server -> @effect/platform-node
-> @effect/platform-node-shared -> @parcel/watcher -> picomatch`. Parcel is the
optional watcher backend; current server composition uses default NodeFileSystem,
not its WatchBackend layer. No active application API accepting untrusted glob
patterns was found. Metro does pass dependency `package.json` sideEffects patterns
to matcher construction during builds, so build-time pattern exposure is real.
This is not a claim that vulnerable code is absent or universally unreachable.

The [advisory](https://github.com/advisories/GHSA-fc5q-39xc-vjpf), updated 2026-11-17,
affects **all versions <=4.0.7**, with **no patched version**. Registry latest was
4.0.7 during the 2026-11-18 check. Older 2.x and 3.x releases are affected too;
there is no safe semver-compatible downgrade. All 20 checked latest immediate
parents still depend on picomatch, including the checked Expo/Nx/Vitest upgrades.
Replacing a direct dependency is therefore not applicable; replacing transitive
picomatch with Node's matchesGlob would break its factory, makeRe/parse and options
contracts. The linked upstream PR 194 is not a published general fix.

Bounded child-process probes on installed 2.3.2 and 4.0.7 reproduce the advisory
pattern `+(*a)`: about 0.4 ms at length 12 versus 203-211 ms at length 22. Each
child has a two-second/128 MiB bound. This confirms vulnerable matcher behavior,
not an attacker-controlled production route. Keep the finding open pending a
reviewed upstream fix; do not use an advisory-ignore or pretend a downgrade fixes it.

## Batch 3: exclude preserved reference directories from supported scans

Jonathan approved ignoring all directories named `examples` or `externals`,
at any depth and with every ASCII case spelling, on 2026-11-18 through
[the requesting thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a).
The [dated Linear relay](https://linear.app/resnovas/issue/EVE-265#comment-5b68387c-8fd2-4841-ba02-a293a3041e54)
records that scope. Their contents remain unchanged; active source scans and
secret scanning remain enabled. This does not authorize historical upgrades.

| Mechanism | Repository policy | Limitation |
| --- | --- | --- |
| Dependabot version updates | Both ecosystem entries use `exclude-paths` with recursive, paired-case bracket globs. | GitHub documents this as version-updates-only. It does not remove graph entries or vulnerability alerts. |
| House synchronization | Local `sync.exclude` in `.github/smartcloud.yml` protects the repository-owned `.github/dependabot.yml`. | This file no longer receives house updates automatically; retain the weekly schedule, seven-day cooldown and security-update groups when maintaining it. |
| Advanced House CodeQL | `.github/codeql/codeql-config.yml` enumerates all 768 literal case variants under `paths-ignore`, with recursive prefixes/suffixes. | CodeQL treats brackets, question marks and several other pattern characters literally. A short bracket-case glob here would silently miss directories. |
| Dependency graph / Dependabot alerts | No repository-side path-exclusion option is documented. | Built-in vendor matching covers `[Ee]xternals`, not every spelling or `examples`. Use owner-side manifest triage below; do not disable the graph for active source. |
| Automatic GitHub Code Quality | Separate from House CodeQL; no local change made. | Its current configuration docs describe languages/runners, not path exclusions or reading this advanced-security config. Exclusion from that separate service remains unverified. EVE-248 stays deferred; no global disable or budget change. |

The existing root reference test command, `node --test tools/references/check.test.mjs`,
checks every case variant at root and nested depths, active-source and similar-name
negative controls, supported CodeQL pattern characters, preserved update groups,
cooldown and the house override. This validates repository policy, not execution
inside GitHub's hosted scanners. Full gates and both SQL dialects still run for
this batch; source and exact signed delivery evidence belong on EVE-265.

## Batch 4: fix the actual Scorecard / OSV scan

Jonathan's later 2026-11-18 excerpt, `Vulnerabilities score is 0: 481 existing
vulnerabilities detected`, is reproduced exactly in the
[House Scorecard job](https://github.com/Resnovas/Eventiva/actions/runs/44287585365/job/134744139427)
at main `6d63016a`. The producer chain is `.github/workflows/house-scorecard.yml`
-> the house reusable `scorecard.yml` -> `ossf/scorecard-action` v2.4.4
(`2d1146689b8cda280b9bc96326124645441f03bc`) -> Scorecard v5.5.0
(`c395761df6afe1a69e476bc60a013a94bcbc153f`) -> OSV-Scanner v2.3.2.
The job succeeds while emitting a high-severity supply-chain finding.
`github/codeql-action/upload-sarif` uploads its SARIF; it does not perform that
dependency scan. CodeQL analysis, automatic Code Quality and Dependabot hosted
alerts are separate services. CodeQL `paths-ignore` does not configure OSV.

The action has no arbitrary path-exclusion or TOML-config input. Its embedded
OSV version defaults to honoring `.gitignore`; `osv-scanner.toml` has no path
exclusion field. The narrow supported configuration is therefore these root
`.gitignore` directory patterns, not advisory-ID or package suppressions:

```gitignore
**/[Ee][Xx][Aa][Mm][Pp][Ll][Ee][Ss]/
**/[Ee][Xx][Tt][Ee][Rr][Nn][Aa][Ll][Ss]/
```

Trailing slashes match directory segments, not similar names such as
`notexamples`, `externals-copy` or `examples.ts`. Bracket classes cover all 768
ASCII case spellings, and `**/` covers root and nested directories. Existing
tracked archive/vendor bytes remain tracked and unchanged. New reference imports
need explicit `git add -f`; do not untrack or delete preserved snapshots.
The root `.gitignore` is repository-owned, not a managed house template.

Exclusions alone are insufficient: v2.4.4's embedded parser reads only the first
YAML document in this repository's PNPM lockfile, containing 15 package-manager
bootstrap packages. It misses the application document. With exclusions alone,
old Scorecard incorrectly reports zero findings. The local workflow therefore
pins Action v2.5.0 at `fa7117db83c52d787ae5a89f350999701505d78e`, released
2026-10-12. It embeds Scorecard v5.6.0, OSV-Scanner v2.5.1 and OSV-SCALIBR v0.5.3;
that extractor reads every PNPM YAML document. A standalone older OSV binary's
module versions need not equal the versions resolved inside the action.

The documented `sync.exclude` mechanism protects the repository-owned Scorecard
workflow as well as Dependabot configuration. This local workflow retains the
house events, default-branch condition, check name, timeout, least-privilege reads,
SARIF upload/category and all Scorecard checks. The observed old job reported
`Publication enabled: false`, so the local job explicitly keeps publication off
and does not request an OIDC write token. No external publishing, shared house
source change, CodeQL gate change, AI budget change or EVE-248 investigation is
introduced. Review future house fixes manually for both excluded configuration files.

### Executed scope and active-finding proof

Verified release binaries and SHA-256 release checksums reproduce the scan on a
complete Git archive of `6d63016a`, read-only at `/scan` in a disposable validation
container. No install or application check runs against historical source.
The validation container trusts the orb's CA bundle; TLS verification stays on.
The equivalent Scorecard CLI invocation is:

```sh
scorecard --local=/scan --checks=Vulnerabilities --format=json --show-details
```

Use verified v5.5.0 and v5.6.0 release binaries to compare. The local CLI runs
the real Vulnerabilities check, not the other hosted checks or SARIF publication.
For a manifest inventory, OSV v2.3.2 was also run with `scan source -r`, the same
Python extractor selection as the old action, `--all-packages --format json`.
Never add `--no-ignore`: it defeats this directory policy. An archive beneath an
ignored ancestor can falsely appear empty; isolate it at a clean filesystem path.

| Executed scenario | Result |
| --- | --- |
| Old Scorecard, original archive | Score 0; exactly 481 distinct vulnerability IDs, matching the quoted hosted output. |
| New Scorecard, original archive | Score 0; exactly 481 distinct IDs. |
| Old Scorecard, directory exclusions only | Score 10; zero IDs, exposing its preexisting second-document blind spot. Not accepted as the fix. |
| New Scorecard, directory exclusions | Score 9; one ID: `GHSA-fc5q-39xc-vjpf` (picomatch). Active application finding retained. |
| OSV old-version manifest inventory | 17 package-bearing manifest sources before, one root lockfile after; 16 excluded sources are beneath preserved directories. Two are NuGet `packages.config`, beyond the earlier 15-lockfile inventory. |
| Actual OSV all-case/depth fixture | 1,540 manifests before -> four after: root, nested active, `notexamples`, and `externals-copy`. Every retained source still reports the same picomatch advisory that was present in the excluded sources. |
| New Scorecard on retained-control fixture | Score 9; picomatch remains visible. |
| New Scorecard with distinct reference-only controls | All 1,536 reference paths additionally contain vulnerable lodash 4.17.20; four retained controls contain only picomatch. Five advisory IDs before -> one after, retaining picomatch but removing the four reference-only IDs. Advisory deduplication cannot make a failed filter appear successful. |
| Active `pnpm audit --json` | One high picomatch finding before and after; zero critical/moderate/low. |

The direct OSV JSON contains 482 distinct IDs before exclusions; Scorecard's
evaluation reports 481. Keep those tool-specific counts separate rather than
equating them with each other or GitHub's hosted Dependabot alerts. The permanent
reference suite verifies all 1,536 excluded root/nested paths, active/similar-name
controls, the reviewed scanner pin, house override and preserved SARIF policy.
It fails before the gitignore rules and passes with them. Full repository gates
and uncached PostgreSQL/SQLite tests are recorded with signed delivery on EVE-265.
No pasted GHSA ID is ignored; existing `osv-scanner.toml` files inside preserved
source are neither edited nor copied into active configuration.

Pinned sources: [old action inputs](https://github.com/ossf/scorecard-action/blob/2d1146689b8cda280b9bc96326124645441f03bc/action.yaml),
[Scorecard's OSV invocation](https://github.com/ossf/scorecard/blob/c395761df6afe1a69e476bc60a013a94bcbc153f/clients/osv.go),
[OSV gitignore behavior](https://github.com/google/osv-scanner/blob/e2a5d93abd9c85d068755973f014d28d6cec02c1/docs/scan-source.md#ignored-files),
[new action module versions](https://github.com/ossf/scorecard-action/blob/fa7117db83c52d787ae5a89f350999701505d78e/go.mod),
[upstream multi-document fix](https://github.com/google/osv-scalibr/commit/87a1418f14c561f33139c98fbd562f3b72831a6f),
[OSV configuration](https://github.com/google/osv-scanner/blob/c84fa4568f2526d0333e9a914ea8a0a5f74ad68b/docs/configuration.md).

### Apply the remaining GitHub-side alert policy

These steps follow GitHub's official docs checked on 2026-11-18. Repository
administration/security-alert access is required; private/internal repositories
need GitHub Code Security for custom auto-triage. This lane's alert API returns
HTTP 403, so owner execution and the resulting count remain pending.

1. Open `Resnovas/Eventiva` on GitHub and select **Settings**.
2. Under **Security and quality**, select **Advanced Security**.
3. In **Dependabot**, open **Configure Dependabot rules** beside **Dependabot rules**.
4. Select **New rule**. Enter a name such as `Preserved examples and upstream references`,
   and set **State** to **Enabled**.
5. Under **Target alerts**, select **Manifest path**. Target only the exact affected
   manifest paths GitHub lists whose directory segments equal `examples` or
   `externals` case-insensitively. Start with the historical lockfiles in the
   inventory above and include any vendor manifests actually reported by GitHub.
   Never select the root `pnpm-lock.yaml` or active `apps`/`packages` manifests.
   Repeat rules as needed for the paths the UI supports. GitHub's docs do not
   specify this filter's wildcard/case semantics: do not assume the Dependabot or
   CodeQL globs work in this separate UI. Exact selections cover those manifests;
   new manifests or spellings need review unless GitHub confirms a suitable
   documented filter. The preview documents a ten-rule limit per repository.
6. Under **Rules**, select **Dismiss alerts**, choose indefinite dismissal, then
   select **Create rule**. These rules apply to existing and future matching
   alerts. Do not disable Dependabot security updates for the active workspace.
7. If custom rules are unavailable, open the repository's **Security and quality**
   tab, then **Dependabot > Vulnerabilities** under **Findings**. Filter by the
   exact manifest, select its open alerts, then use **Dismiss alerts** and select
   an accurate reason. Individual alerts also allow a dismissal comment; record
   Jonathan's 2026-11-18 EVE-265 reference-only decision. Bulk dismissal handles
   existing alerts only; it does not establish a future auto-triage rule.
8. In that alert list, open its settings menu and select **Refresh Dependabot alerts**.
   GitHub permits this once per hour per repository. Wait until the displayed
   dependency-graph rebuild timestamp advances, then record open/dismissed counts
   and severity totals separately on EVE-265. Dismissed findings are not fixed.

After batch 2, GitHub's push banner reported 401 open vulnerabilities (13 critical,
188 high, 170 moderate, 30 low). That banner is an observation at push time, not
a verified post-reprocessing count or a per-manifest reconciliation. The active
root audit remains one high finding before/after these scanning exclusions.

Sources: [Dependabot options](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference#exclude-paths),
[Dependabot glob implementation](https://github.com/dependabot/dependabot-core/blob/main/common/lib/dependabot/file_filtering.rb),
[CodeQL paths](https://docs.github.com/en/code-security/reference/code-scanning/workflow-configuration-options#specifying-directories-to-scan),
[house local overrides](https://github.com/Resnovas/.github/blob/main/docs/sync.md#exclude),
[auto-triage steps and availability](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/auto-triage-dependabot-alerts),
[view/dismiss alerts](https://docs.github.com/en/code-security/how-tos/manage-security-alerts/manage-dependabot-alerts/view-dependabot-alerts),
[graph exclusions and refresh](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/troubleshoot-dependency-security/troubleshooting-the-dependency-graph),
[separate Code Quality settings](https://docs.github.com/en/code-security/how-tos/maintain-quality-code/enable-code-quality).

Keep
`minimumReleaseAge: 10080`, lifecycle-script restrictions and every existing gate.
For each batch, regenerate agent surfaces and LLMS, run `node --run check`,
the uncached storage suite with the approved disposable PostgreSQL fixture (the
suite covers both PostgreSQL and Node SQLite), and `node --run verify` before
signed direct-main delivery. Follow [storage conformance](storage.md#run-conformance)
for fixture credentials, isolation and teardown. On a push race, rebase, regenerate
and repeat verification; never force-push main.
