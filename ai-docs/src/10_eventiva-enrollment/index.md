## Eventiva enrollment and reset boundary

The production package tree is empty after EVE-242. EVE-243 enrolls the house preset through `.github/smartcloud.yml`; EVE-244 alone owns the replacement Nx/PNPM/Expo/React Native/Effect application and fresh tests. No application test, coverage, deployment or release target is supplied by enrollment. Generic house Test actions are unavailable until EVE-244; never add a passing placeholder.

Run `pnpm install --frozen-lockfile`, `node --run setup` and `node --run check` with Node from `.node-version` and pnpm from `package.json`. Check validates agent-file drift, local commit-hook installation, licence headers outside `Examples/` and generated `LLMS.md`. CI's `house check` job runs the same gate without a commit hook. Regenerate agent mirrors with `node tools/dev/surfaces.mjs sync` and this document with `node tools/ai-docs/docgen.mjs`.

Read `docs/smartcloud-enrollment.md` for sources, the pre-apply dry-run effects, supported CLI route, idempotence checks and the external administration blocker. Published Smartcloud 2.0.0 is not usable; the documented source build at `61eedd655f31d7e1f511f85bbb6621ab6454d465` starts and runs validate, plan, dry-run and local sync. CLI sync merges against remote default-branch files, not a dirty local tree. Preview first.

Preserve all `house:local` content. Coding agents deliver straight to `main` under the owner's existing exception in `AGENTS.md`, including where synced governance describes the generic PR path. The house ruleset retains an administrator `always` bypass (repository role 5). Standard house sync/Graphify bot PRs are not coding-agent delivery. A token's admin user role is not proof of administration scope; HTTP 403 or restricted-mode skips leave enrollment incomplete.

Canonical governance is Markdown, with AsciiDoc compatibility links. Canonical owners/funding live in `.github/`. `Examples/` is historical reference only, excluded from workspace discovery, Graphify, CodeQL and licence checking. Never initialize its private tests gitlink during setup, run its old active checks or treat it as an implementation baseline.

No runtime behavior or feature flag is introduced: this is repository governance and CI configuration, not an application or library API. There are no TypeScript API examples to compile until EVE-244 establishes the application toolchain.
