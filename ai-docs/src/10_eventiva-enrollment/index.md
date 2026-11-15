## Eventiva enrollment and reset boundary

EVE-243 enrolls the house preset through `.github/smartcloud.yml`. Enrollment supplies no application test, coverage, deployment or release target; the EVE-244 foundation (section 11) supplies the application and its tests. Never add a passing placeholder.

Run `pnpm install --frozen-lockfile`, `node --run setup` and `node --run check` with Node from `.node-version` and pnpm from `package.json`. Check validates toolchain pins, agent-file drift, local commit-hook installation, licence headers outside `Examples/` and generated `LLMS.md`. CI's `house check` job runs the same gate without a commit hook. Regenerate agent mirrors with `node tools/dev/surfaces.mjs sync` and this document with `node tools/ai-docs/docgen.mjs`.

Read `docs/smartcloud-enrollment.md` for sources, the pre-apply dry-run effects, supported CLI route, idempotence checks and the external administration blocker. Published Smartcloud 2.0.0 is not usable; the documented source build at `61eedd655f31d7e1f511f85bbb6621ab6454d465` starts and runs validate, plan, dry-run and local sync. CLI sync merges against remote default-branch files, not a dirty local tree. Preview first.

Eventiva extends `Resnovas/.github/smartcloud/house-base.yml@main`, not `house.yml`, under a temporary owner-approved exception (EVE-243, revisit in EVE-248). The base preset leaves out the two ruleset gates that spend AI credits, Code Quality and Copilot review. Keep `sync.values.HOUSE_PRESET: house-base.yml` and `settings.ruleset.copilotReview: false` after the `house:local` line until EVE-248 removes them. Never set `codeQuality` or turn Copilot review on without the owner's budget approval. Do not re-add the `Examples/cluster-docker` gitlink, which broke every checkout.

Preserve all `house:local` content. Coding agents deliver straight to `main` under the owner's existing exception in `AGENTS.md`, including where synced governance describes the generic PR path. The house ruleset retains an administrator `always` bypass (repository role 5). Standard house sync/Graphify bot PRs are not coding-agent delivery. A token's admin user role is not proof of administration scope; HTTP 403 or restricted-mode skips leave enrollment incomplete.

Canonical governance is Markdown; obsolete root AsciiDoc compatibility links have been removed. Canonical owners/funding live in `.github/`. `Examples/` is historical reference only, excluded from workspace discovery, Graphify, CodeQL and licence checking. Never initialize its private tests gitlink during setup, run its old active checks or treat it as an implementation baseline.

Enrollment introduces no runtime behavior or feature flag: it is repository governance and CI configuration. Application APIs and examples are in section 11.
