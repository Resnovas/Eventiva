# AGENT-SETUP

Machine-only. People: [README.md](README.md). Repository rules: [AGENTS.md](AGENTS.md).

## State

EVE-242 retires the manual application and tooling. No application, Nx project, test runner, coverage tool, docs server or publishing workflow is active. EVE-243 owns house enrollment; EVE-244 owns the fresh application and testing foundation. Do not run archived commands to fill this gap.

## Needs

- Node from `.node-version` (22.23.4) and pnpm from `packageManager` in `package.json` (9.14.2).
- No application dependencies, secrets, environment file, services or private repository access.
- Network only when provisioning the pinned toolchain: `nodejs.org` for Node, `registry.npmjs.org` for pnpm, Debian mirrors for missing download prerequisites.

## Setup and validation

On a machine with the pinned toolchain, run `sh scripts/agent-setup`. It runs:

```sh
pnpm install --frozen-lockfile
node --run setup
node --run check
```

Success ends with `agent-setup: ok`. Setup installs existing house-generated agent files and the commit hook. Check verifies their drift and hook presence only; it does not claim build, lint, test or coverage success.

Amp orbs run `.agents/setup` to provision the pinned toolchain and run the same script. `.agents/resume` checks versions and house-file drift without installing anything. Both leave private submodules unpopulated and start no services. Re-run `.agents/setup` after changing dependency manifests or the lockfile. The installer targets disposable Debian orbs with passwordless sudo, not a personal machine.

Run `pnpm list -r --depth -1 --json` to verify discovery lists only the root private manifest. The root-only `pnpm-workspace.yaml` prevents recursive commands discovering either archive. Do not infer application readiness from that successful discovery.

## Problems

- Missing commit hook: run `node --run setup`.
- Stale generated agent files: run `node tools/dev/surfaces.mjs sync`, then `node --run check`.
- Stale orb toolchain: run `.agents/setup`.
- Missing Nx, tests, build or dev commands: expected until EVE-244; do not install historical tooling or substitute a passing placeholder.
- Generic house editor actions mentioning absent tests or a graph viewer remain for EVE-243 enrollment; they are not supported application commands.

The original setup instructions and private tests gitlink are preserved under `Examples/eventiva-before-amp`. Its `.gitmodules` is historical; the current root `.gitmodules` disables automatic updates of that gitlink. No default command fetches it.
