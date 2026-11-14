# AGENT-SETUP

Machine-only. People: [README.md](README.md) and [docs/foundation.md](docs/foundation.md). Repository rules: [AGENTS.md](AGENTS.md).

## State

EVE-244 foundation: PNPM 12 and Nx 24 workspace, `apps/server` (Effect, Node), `apps/client` (Expo 56, React Native 0.85, Hermes, web), `apps/client-e2e` (Playwright web smoke), `packages/{contracts,schema,runtime}`, `packages/integrations/*` (FormatJS, OpenFeature, PostHog), and Vitest test projects under `tests/`. No product features, deployment, EAS, Nx Cloud or PostHog ingestion. Release workflows skip without `release.config.json`.

## Needs

- Node from `.node-version` (24.22.3; `.nvmrc`, `.tool-versions` and `engines.node` must agree) and pnpm from `packageManager` in `package.json` (12.18.0, via `corepack enable pnpm`).
- Chromium for the web smoke: `pnpm exec playwright install --with-deps chromium`.
- No secrets, environment file, services or private repository access. `POSTHOG_API_KEY` and `EXPO_PUBLIC_POSTHOG_KEY` stay unset; unset means no PostHog connection.
- Network for provisioning: `nodejs.org`, `registry.npmjs.org`, the Playwright CDN, Debian mirrors.

## Setup and validation

On a machine with the pinned toolchain, run `sh scripts/agent-setup`. It runs:

```sh
pnpm install --frozen-lockfile
node --run setup
node --run check
```

Success ends with `agent-setup: ok`. Then run the full gate:

```sh
export NX_NO_CLOUD=true NX_DAEMON=false
pnpm nx sync:check
pnpm nx run-many -t lint typecheck test build --outputStyle=static
pnpm nx run-many -t smoke --outputStyle=static
```

`node --run verify` runs `check` and both Nx lines. CI: `house check` runs `node --run check`; `.github/workflows/ci.yml` runs `verify` and `smoke` jobs aggregated by the required `application check` job.

Amp orbs run `.agents/setup` (Node, corepack pnpm, `scripts/agent-setup`, Chromium). `.agents/resume` checks versions, `node_modules` and `node --run check` without installing. Re-run `.agents/setup` after changing manifests or the lockfile. The installer targets disposable Debian orbs with passwordless sudo, not a personal machine.

## Problems

- Missing commit hook: run `node --run setup`.
- Stale generated agent files or agent docs: run `node tools/dev/surfaces.mjs sync` and `node tools/ai-docs/docgen.mjs`, then `node --run check`.
- `toolchain:` errors: align `.node-version`, `.nvmrc`, `.tool-versions` and `engines.node`.
- Nx says the workspace is out of sync: run `pnpm nx sync` and commit the tsconfig references.
- Stale `lang/en-GB.json`: rerun `formatjs extract` in `apps/client` (see docs/foundation.md).
- New dependency or version: only those approved in the EVE-244 matrix; ask the owner before adding any other.
- Generate the graph viewer with `sh tools/graphify/graphify update` before using Graph: open viewer; delete `dist`, `.expo` and `test-output` first.
- Smartcloud administration or app-token failures: follow `docs/smartcloud-enrollment.md`; local setup cannot grant GitHub permissions. Never add secrets to tracked files.

The original setup instructions and private tests gitlink are preserved under `Examples/eventiva-before-amp`. Its `.gitmodules` is historical; the current root `.gitmodules` disables automatic updates of that gitlink. No default command fetches it.
