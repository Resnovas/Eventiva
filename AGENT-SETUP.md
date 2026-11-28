# AGENT-SETUP

Machine-only. People: [README.md](README.md) and [docs/foundation.md](docs/foundation.md). Repository rules: [AGENTS.md](AGENTS.md).

## State

EVE-244 foundation: PNPM 12 and Nx 24 workspace, `apps/server` (Effect, Node), `apps/client` (Expo 56, React Native 0.85, Hermes, web), `apps/client-e2e` (Playwright web smoke), `packages/{contracts,schema,runtime}`, `packages/integrations/*` (FormatJS, OpenFeature, PostHog), and Vitest test projects under `tests/`. No product features, deployment, EAS, Nx Cloud or PostHog ingestion. Release workflows skip without `release.config.json`.

## Needs

- Node from `.node-version` (24.22.3; `.nvmrc`, `.tool-versions` and `engines.node` must agree) and pnpm from `packageManager` in `package.json` (12.18.0, via `corepack enable pnpm`).
- Chromium for the web smoke: `pnpm exec playwright install --with-deps chromium`.
- `uv` for local Graphify setup. CI setup never generates a repository graph; local setup uses parsers only, without downloading models.
- Root `check` needs no services, secrets, environment file or private repository access. Full `verify` additionally requires the disposable loopback PostgreSQL 17 fixture in [docs/storage.md](docs/storage.md#run-conformance); never use Neon for that destructive fixture harness.
- `POSTHOG_API_KEY` and `EXPO_PUBLIC_POSTHOG_KEY` stay unset; unset means no PostHog connection. Live Neon tests require separately authorized synthetic resources and privately injected credentials; they are not part of the default local gate.
- Network for provisioning: `nodejs.org`, `registry.npmjs.org`, the Playwright CDN, Debian mirrors.

## Setup and validation

On a machine with the pinned toolchain, run `sh scripts/agent-setup`. It runs:

```sh
pnpm install --frozen-lockfile
node --run setup
node --run check
```

Outside CI, setup then runs `sh tools/graphify/graphify setup`, composing post-event hooks and refreshing ignored navigation. Success ends with `agent-setup: ok`. Start the pinned disposable PostgreSQL fixture documented in `docs/storage.md`, then run the full gate. Setup and resume do not provision or start database services:

```sh
export NX_NO_CLOUD=true NX_DAEMON=false
pnpm nx sync:check
node --run verify
```

`node --run verify` runs `check`, builds declared outputs before source-graph resolution, runs source/type/package/manifest boundary checks and negative fixtures, runs every Nx lint/typecheck/test/build/parity target serially, audits public declarations, then runs smoke serially. Do not substitute only the Nx lines: they omit the boundary gates. CI: `house check` runs `node --run check`; `.github/workflows/ci.yml` runs `verify` and `smoke` jobs aggregated by the required `application check` job. Always remove the disposable fixture after validation, including on failure, using the teardown in `docs/storage.md`.

Amp orbs run `.agents/setup` (Node, corepack pnpm, `scripts/agent-setup`, Chromium). `.agents/resume` checks versions, `node_modules` and `node --run check`, then refreshes local navigation without installing. Re-run `.agents/setup` after changing manifests or the lockfile. The installer targets disposable Debian orbs with passwordless sudo, not a personal machine.

## Problems

- Missing commit hook: run `node --run setup`.
- Stale generated agent files or agent docs: run `node tools/dev/surfaces.mjs sync` and `node tools/ai-docs/docgen.mjs`, then `node --run check`.
- `toolchain:` errors: align `.node-version`, `.nvmrc`, `.tool-versions` and `engines.node`.
- Nx says the workspace is out of sync: run `pnpm nx sync` and commit the tsconfig references.
- Storage conformance cannot connect: start the pinned local PostgreSQL fixture named `eventiva_test`. Missing PostgreSQL is a failure, not a reason to skip tests; root `check` remains usable without it. Never authorize a `better-sqlite3` build script when its bundled prebuild is unavailable.
- Stale `lang/en-GB.json`: rerun `formatjs extract` in `apps/client` (see docs/foundation.md).
- New dependency or version: only those approved in the EVE-244 matrix; ask the owner before adding any other.
- Generate the graph viewer with `sh tools/graphify/graphify update` before using Graph: open viewer. Ignored build output is excluded automatically; do not delete another task's output or commit the graph. See [migration](docs/graphify.md).
- Smartcloud administration or app-token failures: follow `docs/smartcloud-enrollment.md`; local setup cannot grant GitHub permissions. Never add secrets to tracked files.

The original setup instructions and private tests gitlink are preserved under `examples/eventiva-before-amp`. Its `.gitmodules` is historical; the current root `.gitmodules` disables automatic updates of that gitlink. No default command fetches it.
