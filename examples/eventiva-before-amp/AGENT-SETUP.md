# AGENT-SETUP

Machine-only. People: `README.adoc`, `AGENTS.md`.

## Needs

- Node `.node-version` (22.23.4), pnpm `packageManager` (9.14.2).
- Nx workspace. No services for default work; PostgreSQL, Kafka, Compose, Kubernetes only on request.
- Private `tests` submodule: opt-in, test work only, needs authorised access.

## Env

- None required for setup, lint, typecheck or unit tests.
- App settings: names and notes in `.env.example`; copy to `.env`, never commit values.

## Network

- `registry.npmjs.org` for `pnpm install`.
- `nodejs.org` only when `.agents/setup` installs Node.

## Setup

- `scripts/agent-setup`. Idempotent. Steps: frozen `pnpm install`, `node --run setup` (agent files, commit hook), Nx discovery, `node tools/dev/surfaces.mjs check`.
- Amp orbs: `.agents/setup` provisions toolchain and dependencies; `.agents/resume` checks readiness.
- Success: last line `agent-setup: ok`.

## Run

| Job                   | Cmd                                                         |
| --------------------- | ----------------------------------------------------------- |
| lint and format check | `pnpm check`                                                |
| test                  | `pnpm test`                                                 |
| one project target    | `NX_DAEMON=false pnpm exec nx run <project>:<target>`       |
| database-free demo    | `pnpm platform:run:local-fiber`                             |
| agent files           | `node tools/dev/surfaces.mjs sync` after editing `.agents/` |

## Verify

- `NX_DAEMON=false pnpm exec nx show projects` lists projects.
- `node tools/dev/surfaces.mjs check` exits 0.

## Runner notes

- `pnpm dev` is a Kubernetes workflow, not a standalone dev server.
- Run servers as supervised services (`amp orb service start`), never background shells.

## Breaks

| Break                                                   | Cause              | Fix                                |
| ------------------------------------------------------- | ------------------ | ---------------------------------- |
| `The house commit hook is not installed`                | fresh clone        | `node --run setup`                 |
| `Agent commands, skills or MCP configs are out of date` | `.agents/` edited  | `node tools/dev/surfaces.mjs sync` |
| `Orb toolchain/dependencies are missing`                | stale orb snapshot | `.agents/setup`                    |
