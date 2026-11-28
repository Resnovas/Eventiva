<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

## Agent Git worktrees

Use a dedicated Git worktree and task branch for agent repository changes. Reuse an existing task worktree supplied by the host; do not create nested worktrees. Independent writers need separate worktrees and branches. Read-only reviews and non-repository tasks do not need a new checkout.

- Use the host's worktree mechanism when available: T3 worktree mode and worktree isolation for delegates; Orca worktree creation for Orca-managed work; Claude Code worktree isolation; native Git worktrees for Codex, OpenCode, Copilot, Cursor, Antigravity and other hosts without a managed mechanism.
- Inspect the repository root, current branch, status and worktree list before editing. Create new task branches from the intended base, never from the GitButler integration branch. Do not switch or reset the user's primary checkout.
- Use ordinary Git for status, diffs, staging, commits and pushes. Stage only task-owned changes, sign off commits, preserve repository signing requirements, and use explicit PR head and base branches. For dependent branches, explicitly select the parent branch as the PR base.
- GitButler is Jonathan's personal tool. Do not install, initialize or use `but` for routine agent work, alter GitButler metadata, or modify his applied branches. GitButler-specific skills are opt-in only when he explicitly requests GitButler assistance.
- Preserve existing dirty work and other agents' branches. Never force-remove a dirty worktree or rewrite shared history without authorization. Remove an owned worktree only after its work is committed and safely retained.
