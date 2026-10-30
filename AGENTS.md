<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, use the `nx-workspace` skill when available. If it is not registered with your agent, read `.cursor/skills/nx-workspace/SKILL.md` and follow it directly.
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- Use the Nx MCP server when available; it is not preconfigured in Amp orbs. Otherwise use `pnpm exec nx show projects` and `pnpm exec nx show project <name> --json`.
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - check `nx_docs` when available, otherwise the command's `--help` or official Nx documentation.

## Scaffolding & Generators

- For Nx scaffolding tasks (creating apps, libs, or Nx project structure), use the `nx-generate` skill FIRST. If it is not registered, read `.cursor/skills/nx-generate/SKILL.md`. Machine provisioning with `.agents/setup` is not Nx scaffolding.

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# Amp orbs

- `.agents/setup` installs Node from `.node-version`, pnpm from `package.json`, system prerequisites, and frozen workspace dependencies. Amp snapshots this environment; do not reinstall dependencies on every task or wake.
- `.agents/resume` only checks readiness. After changing dependency manifests or the lockfile, run `.agents/setup` explicitly. It never initializes the private `tests` submodule, accesses shared databases, or deploys a cluster.
- Use `NX_DAEMON=false pnpm exec nx ...` in orbs so commands do not depend on a background Nx daemon surviving pause/resume.
- Run services with `amp orb service start <name> --command '<command>'` (add `--portal` for a web UI), not background shells. Do not put servers in setup or resume.
- `pnpm dev` is a Kubernetes workflow, not a standalone dev server. The database-free demo is `pnpm platform:run:local-fiber`; PostgreSQL, Kafka, Compose, and Kubernetes workflows need explicit task-specific provisioning. Setup does not provision these services.
- No `.devcontainer` configuration is currently tracked. Use `.agents/setup` in orbs rather than following obsolete devcontainer instructions.
- Follow the current transition policy in `docs/learnings/tdd-and-test-creation.md`: implementers may run and update tests. The private tests submodule is opt-in for test work; do not populate it during default setup or remove an existing checkout. Never delete tests to silence failures.
