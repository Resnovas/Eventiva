# Eventiva

Eventiva is an event planning and production logistics project. **The production workspace is intentionally empty following the full reset in [EVE-242](https://linear.app/resnovas/issue/EVE-242).** There is currently no application, Nx workspace, build, test suite or coverage gate. House governance, security and synchronization workflows are enrolled under [EVE-243](https://linear.app/resnovas/issue/EVE-243); release workflows remain inert without a release configuration.

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

`setup` installs the house commit hook and registers available editor actions. `check` verifies generated agent files, licence headers outside the historical archive, and `LLMS.md`; locally it also checks that the commit hook is installed. The `house check` CI job runs the same command. It is **not** a build, application test or coverage result. The old checks were retired by the explicit full-reset decision, not made green by ignoring failures. `scripts/agent-setup` runs the three commands above on a machine with the pinned toolchain. No secrets, services or private repository access are required for local setup.

`pnpm-workspace.yaml` selects only the root manifest and explicitly excludes `Examples/**`; without this isolation guard, recursive pnpm commands can discover archived manifests. Verify with `pnpm list -r --depth -1 --json`, which must list only the root repository.

Amp orbs use [`.agents/setup`](.agents/setup) to provision the pinned toolchain and run repository setup, and [`.agents/resume`](.agents/resume) for a fast readiness check. There is no development server or docs server to start. Old `pnpm dev`, `platform:*`, cluster, test and declaration-doc commands are unavailable until replacement work defines them.

If `check` reports stale generated files, run `node tools/dev/surfaces.mjs sync` and `node tools/ai-docs/docgen.mjs`, then repeat the check. Missing Nx or application targets are expected during this reset; do not install or activate the historical workspace to repair them. The generic house Test action has no application target until EVE-244. To open the graph viewer, first generate it with `sh tools/graphify/graphify update`.

## House synchronization and delivery

The canonical configuration is [`.github/smartcloud.yml`](.github/smartcloud.yml), extending the current Resnovas house preset. House automation checks policies, synchronizes templates and repository settings, and runs security and workflow checks. Read [the enrollment record](docs/smartcloud-enrollment.md) for the dry-run effects, supported CLI commands, credential requirements and outstanding external administration steps. Enrollment is not fully verified until those steps succeed.

The Markdown governance files and `LICENSE` are canonical. Root AsciiDoc policy files are compatibility links, not independent policies; historical originals remain in the archive. Ownership and funding configuration now live only in `.github/CODEOWNERS` and `.github/FUNDING.yml`.

**Coding agents still commit and push directly to `main` under [the owner's documented exception](AGENTS.md#delivery-exception-ship-straight-to-main).** It takes precedence over the generic house PR delivery path. The preset retains an always-bypass for repository administrators. Standard house sync and Graphify bot PRs do not change that exception.

## Historical reference

- [`Examples/eventiva-before-amp`](Examples/eventiva-before-amp/README.md) preserves the manual workspace, packages, tests reference, tooling, documentation and CI configuration from main at `ae54174aa209be4c21f00226eebae8a01ed04df6`.
- [`Examples/packages-old`](Examples/packages-old) is a separate, older snapshot. It has not been merged with or overwritten by the new archive.

Inspect both for behaviour and lessons, not as code to copy into the new implementation. Neither is an active workspace or production dependency. The archived private tests gitlink is preserved at its original revision and disabled for automatic submodule updates; no private test source was fetched or deleted.

Read current [AGENTS.md](AGENTS.md) before working. Historical instructions, commands and configuration inside the archives do not govern the rebuild. The fresh application workspace remains EVE-244's responsibility.
