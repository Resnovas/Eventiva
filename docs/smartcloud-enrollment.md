# Smartcloud enrollment (EVE-243)

## Scope and source

Eventiva extends `Resnovas/.github/smartcloud/house.yml@main` through `.github/smartcloud.yml`. On 2026-11-11 the enrollment was prepared against Eventiva main `5809bd2ec3c364eac89e4266bd8a476a6523192e`, after EVE-242, using house source `0af11afe1165c942622a311cf1f2ee1baba745ed` and Smartcloud source `61eedd655f31d7e1f511f85bbb6621ab6454d465`. Future synchronization follows the current house `main`, not those audit revisions.

The house preset supplies governance, policies, skills, prompts, MCP sources, dev surfaces, issue forms, Dependabot, review configuration, shared tools and ten workflows. Existing `house:local` sections remain repository-owned. Node is pinned to 24.22.2 for the house tools; pnpm remains 9.14.2, with no application dependencies added.

No Nx/Expo/React Native/Effect application foundation, application tests, coverage, deployment environment or release configuration is created here. That remains EVE-244. Release and nightly workflows skip without `release.config.json`. Generic Test actions remain unavailable rather than calling placeholder tests. Graphify, CodeQL and licence checking exclude `Examples/`; the archived private tests gitlink is not initialized.

## Dry-run effects

Before applying files locally, the supported CLI validated the canonical config, planned settings, ran a push-event dry run and rendered a preview. The initial preview contained 303 templates: 65 added or updated and 238 unchanged. The dry run recorded writes only; its `settings: passed` result is not evidence of successful administration.

The additions include the canonical `.github/smartcloud.yml`, ten house workflows, issue forms, `.github/CODEOWNERS`, `.github/FUNDING.yml`, Markdown conduct/contribution/cooperation/security/support policies, dev surfaces, shared tooling and the house `ai-docs` section. The existing policies, skills, prompts and MCP sources already matched the house. The adopted `.graphifyignore` keeps the archive exclusion active in its local section.

The only `LICENSE` change is `Copyright 2024 Eventiva` to `Copyright 2026 Jonathan Stevens trading as Resnovas`; the FCL-1.0-MIT terms are unchanged. Nine original governance files missing from EVE-242's archive are preserved byte-for-byte from the manual baseline `ae54174aa209be4c21f00226eebae8a01ed04df6`: conduct, governance, DCO, security, support and cooperation AsciiDoc files, CODEOWNERS, FUNDING.yml and LICENSE. No existing archive file is overwritten. AsciiDoc policy files now link to the canonical Markdown policies, without revoking earlier commitments. The obsolete root CODEOWNERS with non-GitHub role names and duplicate root FUNDING.yml are removed in favor of their canonical `.github/` files.

The licence-header checker preserves the existing third-party Nx `monitor-ci` scripts in `.cursor/skills/` and `.opencode/skills/` instead of relabelling them as Resnovas-authored source. Those exact imported paths and `Examples/` are listed in `tools/license/ignore`; current house and repository tooling remains checked.

## Direct-to-main delivery

The owner's existing exception in [AGENTS.md](../AGENTS.md#delivery-exception-ship-straight-to-main) governs coding-agent delivery, including where generic governance describes PR delivery. It is preserved outside the managed block. Agents use Jonathan's authorized author/sign-off identity, retain AI attribution and run the local gate before pushing to `main`.

The locked preset has `settings.ruleset.adminBypass: true`. Smartcloud renders this as `{"actor_id":5,"actor_type":"RepositoryRole","bypass_mode":"always"}`, so a repository administrator can push directly despite the PR, queue, signature and required-check rules. Do not change this to a PR-only bypass or remove it. A token without the necessary administrator permissions cannot use this exception. No local override of locked preset values is needed.

The preset still governs other contributors' PRs. Its standard house sync and Graphify bots may propose updates on their own branches; these proposals do not require coding agents to deliver through PRs. The sole-maintainer ruleset currently renders zero required approvals. A future second maintainer changes the generic PR gate, not the documented owner bypass.

## Settings plan and external blocker

**External settings were not changed manually during enrollment.** The available GitHub App user token reads repository metadata and lists rulesets, but administration reads return HTTP 403. Repository metadata reports the user's admin role; that does not prove the token has administration scope. Actions permissions, branch protection, CodeQL default setup, variables and secrets could not be inspected. The only listed pre-existing ruleset was disabled, named `Code Quality Copilot review for default branch` (ID 19400022); no existing ruleset is deleted by this plan.

The supported `plan settings` command proposed these ten operations, in order:

| Operation | Requested effect |
| --- | --- |
| Repository PATCH | Set `squash_merge_commit_message: COMMIT_MESSAGES` so attribution and sign-off survive squash merges. Other exposed merge settings already matched. |
| Repository GraphQL update | Enable Discussions and sponsorships. |
| PUT `/immutable-releases` | Enable release immutability. |
| PUT `/private-vulnerability-reporting` | Enable private vulnerability reporting. |
| PUT `/vulnerability-alerts` | Enable Dependabot alerts/dependency graph. |
| PUT `/automated-security-fixes` | Enable Dependabot security updates. |
| PATCH `/code-scanning/default-setup` | Set `state: not-configured` for the synced advanced CodeQL workflow. Failure is reported as a warning, not hidden. |
| Repository security PATCH | Enable secret scanning, push protection, Copilot secret detection and non-provider patterns. Unsupported options are reported as warnings. |
| Create/update ruleset by name | Apply `house: default branch` to the default branch with the rules below and the administrator `always` bypass. |
| PUT `/actions/permissions/workflow` | Set default workflow permissions to `read` and `can_approve_pull_request_reviews: true`. |

The ruleset blocks deletion and force pushes; requires linear history, signatures, PR conversation resolution, the squash merge queue and up-to-date `smartcloud` and `house check` statuses; gates CodeQL at errors/high-or-higher security alerts, code quality at errors and provider-pattern secret alerts; and requests Copilot review on drafts and pushes. The local enrollment adds `house check` to both `settings.ruleset.statusChecks.checks` and `required.expect`, so restricted PRs cannot pass without the real house gate. The queue uses `SQUASH`/`ALLGREEN`, a 60-minute response timeout, up to five entries and a five-minute minimum wait. PRs permit squash/rebase and dismiss stale reviews. No coverage gate or deployments are activated. Actions access-level changes do not apply to this public repository.

The dry run also proposed nine process labels: `needs-disclosure`, `needs-dco`, `needs-reproduction`, `needs-evidence`, `needs-tests`, `needs-human-explanation`, `needs-scope-approval`, `needs-refactor` and `house-sync`. It proposed the normal `house/sync` update PR and feature check runs, but created none. No collaborator, team, webhook, secret, variable, deployment environment or Pages change is configured.

## Owner completion steps

1. Verify that the Resnovas Bot GitHub App is installed on Eventiva with Administration, Contents, Pull requests, Checks and Issues write permissions, Workflows write permission and Commit statuses read permission. Its read-only house token needs Contents read on `Resnovas/.github`. Approve any additional permissions GitHub reports as necessary for the house settings.
2. Make the existing organization variable `RESNOVAS_BOT_APP_ID` and secret `RESNOVAS_BOT_PRIVATE_KEY` accessible to Eventiva. Do not put their values in the repository or a discussion. The workflow mints separate read-only house and target-repository tokens. Credential availability could not be verified from this orb.
3. After the enrollment commit is on `main`, inspect the automatic `smartcloud` push run. With a usable app token it applies the settings and syncs files. Without it settings and sync are skipped in restricted mode; a green local gate does not remove that blocker. If a fresh run is needed, explicitly authorize and run the workflow on `main` with the admin-capable app token. Inspect each setting result; do not accept skipped or warning-only operations as applied.
4. Read back the settings and active `house: default branch` ruleset. Verify the administrator `always` bypass, owner direct-main access, advanced CodeQL compatibility and Actions permissions. Re-run `plan settings` and `doctor` with the appropriate authorized token. Secret/variable visibility must be confirmed on the enrolled workflow, not the empty pre-enrollment workflow list.
5. Set the limit of five branch/tag updates per push manually; GitHub exposes no API for this house setting. No local script claims to apply it.
6. Record the workflow URL, every external setting changed and the read-back validation on EVE-243. Keep EVE-243 blocked until this succeeds; do not unblock EVE-244 merely because local rendering passed.

## Supported CLI and repeat synchronization

Published `@resnovas/smartcloud@2.0.0` was tested and is still broken: telemetry injection precedes its shebang. Both its executable and an explicit Node 24 invocation fail before command execution. Do not patch that installed binary or claim it is corrected. The documented build-from-checkout route works at the Smartcloud revision above:

```sh
# In a separate checkout of Resnovas/smartcloud, with Node 24+ and its pinned pnpm:
pnpm install --frozen-lockfile
pnpm nx run @resnovas/smartcloud:build
node apps/cli/dist/main.js --help
```

From that checkout, use an absolute Eventiva config path and a separate preview directory first:

```sh
node apps/cli/dist/main.js validate /path/to/Eventiva/.github/smartcloud.yml
node apps/cli/dist/main.js plan settings --repo Resnovas/Eventiva --config /path/to/Eventiva/.github/smartcloud.yml
node apps/cli/dist/main.js dry-run --repo Resnovas/Eventiva --event push --config /path/to/Eventiva/.github/smartcloud.yml
node apps/cli/dist/main.js sync --repo Resnovas/Eventiva --config /path/to/Eventiva/.github/smartcloud.yml --out /path/to/preview
```

`sync` renders files locally; it does not apply repository settings. It merges against the repository's remote default branch, not uncommitted local edits. Do not use it over a dirty worktree: preview and review first. It defaults to the preset's source/values and prints file statuses and local conflicts. The shared preset is locked; do not duplicate or override it locally. No exclusion is configured in Eventiva's sync.

The house source checkout also supports `node scripts/render.mjs --out /path/to/Eventiva --repository Resnovas/Eventiva --check`, which compares templates against local files without writing. This is the local idempotence check before the enrollment is pushed. To regenerate derived files inside Eventiva:

```sh
node tools/dev/surfaces.mjs sync
node tools/ai-docs/docgen.mjs
node --run setup
node --run check
```

The `house check` job runs `node --run check` on pushes, PRs, merge groups, scheduled and manual runs. Its token is read-only, checkout credentials are not persisted, and it installs no dependencies. Application builds/tests and coverage are absent, not passing. Gate output must be reported separately from the unresolved administration and runtime synchronization checks.
