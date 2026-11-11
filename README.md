# Eventiva

Eventiva is an event planning and production logistics project. **The production workspace is intentionally empty following the full reset in [EVE-242](https://linear.app/resnovas/issue/EVE-242).** There is currently no application, Nx workspace, build, test suite, coverage gate or publishing workflow configured at the repository root.

## Rebuild order

1. Accept the EVE-242 archive and clean repository.
2. Complete [EVE-243](https://linear.app/resnovas/issue/EVE-243): full Smartcloud enrollment and current house-generated governance, guidance, workflows and repository configuration.
3. Complete [EVE-244](https://linear.app/resnovas/issue/EVE-244): fresh Nx/PNPM/Expo/React Native/Effect workspace and testing foundation.
4. Resume implementation issues, including EVE-23, against that accepted foundation and [EVE-13](https://linear.app/resnovas/issue/EVE-13).

## Set up the repository

Use Node at the version in [`.node-version`](.node-version) and pnpm at the `packageManager` version in [`package.json`](package.json). The root manifest has no application or development dependencies.

```sh
pnpm install --frozen-lockfile
node --run setup
node --run check
```

`setup` installs the existing house commit hook and registers available editor actions. `check` checks only the existing house-generated agent files for drift. It is **not** a build, lint, application test or coverage result. The old checks were retired by the explicit full-reset decision, not made green by ignoring failures. `scripts/agent-setup` runs the three commands above on a machine with the pinned toolchain. No secrets, services or private repository access are required.

`pnpm-workspace.yaml` selects only the root manifest and explicitly excludes `Examples/**`; without this isolation guard, recursive pnpm commands can discover archived manifests. Verify with `pnpm list -r --depth -1 --json`, which must list only the root repository.

Amp orbs use [`.agents/setup`](.agents/setup) to provision the pinned toolchain and run repository setup, and [`.agents/resume`](.agents/resume) for a fast readiness check. There is no development server or docs server to start. Old `pnpm dev`, `platform:*`, cluster, test and declaration-doc commands are unavailable until replacement work defines them.

If `check` reports stale generated files, run `node tools/dev/surfaces.mjs sync` and repeat the check. Missing Nx or application targets are expected during this reset; do not install or activate the historical workspace to repair them.

## Historical reference

- [`Examples/eventiva-before-amp`](Examples/eventiva-before-amp/README.md) preserves the manual workspace, packages, tests reference, tooling, documentation and CI configuration from main at `ae54174aa209be4c21f00226eebae8a01ed04df6`.
- [`Examples/packages-old`](Examples/packages-old) is a separate, older snapshot. It has not been merged with or overwritten by the new archive.

Inspect both for behaviour and lessons, not as code to copy into the new implementation. Neither is an active workspace or production dependency. The archived private tests gitlink is preserved at its original revision and disabled for automatic submodule updates; no private test source was fetched or deleted.

Read current [AGENTS.md](AGENTS.md) before working. Historical instructions, commands and configuration inside the archives do not govern the rebuild. House enrollment and the fresh workspace belong to EVE-243 and EVE-244, not this reset.
