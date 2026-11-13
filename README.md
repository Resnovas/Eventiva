# Eventiva

Eventiva is an open-source platform for event planning and production logistics. **The production workspace is intentionally empty following the full reset in [EVE-242](https://linear.app/resnovas/issue/EVE-242).** There is currently no application, Nx workspace, build, test suite or coverage gate. House governance, security and synchronization workflows are enrolled under [EVE-243](https://linear.app/resnovas/issue/EVE-243); release workflows remain inert without a release configuration.

The sections from here to [Rebuild order](#rebuild-order) restore the project introduction and mission from the [historical README](Examples/eventiva-before-amp/README.adoc). They describe what Eventiva sets out to become. **None of the features they name is implemented in this repository today.**

## What Eventiva is

Eventiva aims to bring two things together:

- **A directory** that indexes, markets and connects event specialists: vendors, venues and professionals.
- **Event production planning tools** connected to that directory, covering scheduling, itineraries, task management, contact management, warehousing, ticket sales, interactive site maps, online and in-person sales, accounting, payroll and human resources.

These are product ambitions, not a list of shipped features. The rebuild starts from the foundation in EVE-244 and the architectural direction in [EVE-13](https://linear.app/resnovas/issue/EVE-13); each capability needs its own accepted issue before it exists.

## Why Eventiva exists

Event teams plan and run productions with tools built for something else. The historical README reported an industry survey with these results:

- Over 55% of events had no management tool of any kind.
- The remaining 40% used tools designed for office work, such as Flock and Excel, which barely cover what managers need during pre-production.
- 80% of the people surveyed believed schedulers, task lists and other management tools would help their ongoing operations.

**Treat these figures as unverified historical claims.** The archive records no survey source, date, sample size or method, and this repository holds no later verification. Do not quote them as current or verified data.

## Why open source

Eventiva's tools are designed and marketed for event planning, but organisations planning any kind of project can use them. Keeping the tools open source lets the project work with a community of developers who contribute in ways a single team cannot foresee.

## Eventiva Gaming origins

Eventiva Gaming grew out of the same aim: to build the best tools for the events industry. Gaming is an unusual route, but role-play communities suit it well. Their teams coordinate, manage and plan digital events with the same requirements as physical events, so working with them is a way to test, develop and improve the tools for everyone.

According to the historical README, the Eventiva Gaming team built the first version of a Fleet Management module to manage the distribution, maintenance and deployment of vehicles in emergency-service role play. The same features were then said to be used for vehicles in the events industry. **That module is not in this repository or its archives**, and its current state is not recorded here.

## What the historical prototypes contain

The archived snapshots described under [Historical reference](#historical-reference) hold earlier platform experiments: a core library, database backends, cluster and messaging demos, and a contact extension. They do not implement the directory or the event-planning features listed above, and they are not the baseline for the rebuild.

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
