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

## Residual work

- **High, picomatch:** [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)
  affects installed 2.3.2 and 4.0.7. The registry reports no patched range and
  latest 4.0.7 remains affected. Do not replace the package with an unrelated
  matcher, suppress the advisory or claim upgrading to latest fixes it.
- **Moderate, glob:** [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4)
  requires 14.0.2 or later; active consumers currently resolve 10.5.0 and 13.0.7.
- **Moderate, minimatch:** [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)
  requires 11.0.1 or later; active consumers resolve 9.0.9, 10.2.5 and 10.2.6.

Group the glob/minimatch major upgrades in the next compatibility batch. Keep
`minimumReleaseAge: 10080`, lifecycle-script restrictions and every existing gate.
For each batch, regenerate agent surfaces and LLMS, run `node --run check`,
the uncached storage suite with the approved disposable PostgreSQL fixture (the
suite covers both PostgreSQL and Node SQLite), and `node --run verify` before
signed direct-main delivery. Follow [storage conformance](storage.md#run-conformance)
for fixture credentials, isolation and teardown. On a push race, rebase, regenerate
and repeat verification; never force-push main.
