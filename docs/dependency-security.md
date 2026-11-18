# Dependency security remediation (EVE-265)

[EVE-265](https://linear.app/resnovas/issue/EVE-265/remediate-dependabotaudit-security-alerts-on-main)
tracks dependency remediation approved by Jonathan on 2026-11-18, relayed through
[the requesting thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a).
Necessary major upgrades are included; production deployment is not authorized.

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
