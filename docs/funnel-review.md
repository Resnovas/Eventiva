# Eventiva funnel review

Eventiva's first local funnel slice passed full verification and all 20 affected-feature proofs, then shipped to main as [source 9e379bf6](https://github.com/Resnovas/Eventiva/commit/9e379bf6a5c6629752d14e822dd673ae51894c81) and [graph/evidence 5ca8059d](https://github.com/Resnovas/Eventiva/commit/5ca8059d15d582bdc0165b975db52fa0a17eeb86). It adds corrective React/timer rules, explicit application bootstrap, static-first verification, a Markdown interface-family registry, serialized evidence collection, staged-tree pre-commit and isolated PR fixtures. Existing AST documentation, coverage and trusted-event gates remain. Shared JSDoc enforcement is not adopted: its approved plugin is blocked by the seven-day dependency cooldown. Jonathan must retain his global guidance until downstream enforcement is verified.

Reviewed 2026-11-19 against `e0efc5e49392a5d1a629ed321c76131b93d271ad`; implementation checkpoint updated 2026-11-20. Owner: [EVE-299](https://linear.app/resnovas/issue/EVE-299), independently verified [GitHub #1092](https://github.com/Resnovas/Eventiva/issues/1092), [implementation thread](https://ampcode.com/threads/T-b650d323-f82a-46fb-bedc-70c527baa29f). Requested through [Puck](https://ampcode.com/threads/T-01a1f613-a4ae-7780-b85a-74cc4a1c1727). Related house issue [RES-66](https://linear.app/resnovas/issue/RES-66) replaces SMC-174; shared tooling [RES-67](https://linear.app/resnovas/issue/RES-67) replaces SMC-175. This Markdown is canonical; its artifact is a review surface. Approval below is scoped implementation authority, not production release authorization.

## Classification and scope

- **A: code example.** Put the pattern in real owned source or a compiling example, then reference it instead of explaining it repeatedly.
- **B: static check.** Encode decidable syntax, type, dependency or file invariants with a diagnostic that tells the author how to correct the problem.
- **C: verification.** Test behavior through a public interface and record the reached interface, assertions and evidence.
- **D: retained guidance.** Keep authority, preferences, unavailable-tool behavior and decisions that code cannot infer. This does not mean copying every retained preference into root AGENTS.
- **E: remove duplicate.** Remove redundant instructional copies only after the canonical source or enforcing gate exists. Preserve legal policy, vendor source, immutable history and useful people documentation.

A rule can split across destinations. For example, typed errors have a source pattern (A), type checking (B), failure-path tests (C), and a dependency choice (D). A diagnostic cannot prove the truth of a comment, a human approval, or a UI's usability.

The inventory used tracked paths and an independent filesystem search excluding installed dependencies, Git data, build outputs and private orb data. It found 14 named AGENTS/CLAUDE/contributing/style documents: three active root documents, one historical contribution document, and ten vendor documents listed below. Additional reviewed standards are the complete coding-preferences index and its 16 reference files, handover/changelog, documentation-writing, no-long-dash, whitelabel, frontend-design, feature-flag and GAN authoring guidance; the house ai-docs summary; the local documentation standard, foundation guide, package guide, planning authority and lifecycle instructions. Generated coding-preferences copies were compared with `diff -rq` and matched. Other skill procedures and product specifications are not silently claimed to be a line-by-line policy audit.

## Baseline evidence changes the migration plan

1. `eslint.config.mjs` already has Nx intersecting type/layer/capability restrictions, explicit-any rejection, Zod restriction, Node restrictions for portable code, wildcard-export restriction, React hook correctness and FormatJS checks. `tests/boundaries/src/boundaries.spec.ts` exercises prohibited and allowed edges, manifests, browser bundles and Hermes compilation. Extend these rather than introducing another boundary configuration.
2. `tsconfig.base.json` enables strictness, checked indexing, exact optionals and the Effect language service. `tools/resources/boundaries.mjs` adds source/declaration and erased-contract checks. `tools/documentation/check.mjs` plus its ratchet already enforce attached contracts and rationale candidates; mechanical success is not semantic review.
3. The only `useEffect` found in active `apps`/`packages` TypeScript is `apps/client/src/App.tsx`. It starts the module-owned flag runtime after React commits. It is not evidence of duplicated menu state. A blanket ban needs a lifecycle replacement, not a move to `useLayoutEffect`, an alias, a class lifecycle or a timer merely to evade the rule.
4. No `setTimeout` occurrence was found in that active TypeScript search. Direct and `globalThis` zero-delay calls nevertheless pass the current lint configuration. There is no existing timer violation to repair in that searched scope.
5. `package.json` runs `check` (including documentation) before the Nx static/behavior gate. CI runs documentation before lint. `.agents/prompts/verify.md` and the house surface label describe `check` as everything CI runs, but application lint/types/tests/build/smoke are separate. This wording can cause agents to report incomplete verification.
6. `tools/dev/surfaces.mjs` installs only the house `commit-msg` hook. It checks the message and selected staged text; it is not a pre-commit lint/type/feature runner. It respects a pre-existing foreign hook. Preserve that protection.
7. `.github/workflows/ci.yml` sets `TRUSTED_FIXTURE` true only for main pushes and merge groups, then executes `test "$TRUSTED_FIXTURE" = true`. Pull requests cannot reach the subsequent complete Nx verification through that job. That is an explicit trust boundary, not a permission to change the expression to true or to skip the required job.
8. `apps/client-e2e/playwright.config.mts` already runs the exported client in Chromium, with a trace retained on failure. `shell.spec.ts` proves the heading, ICU plural, default-off banner and absence of browser errors. It does not attach success screenshots, a bounded video or structured console evidence. Android smoke checks export/Hermes bytecode, not native interaction; iOS has no proof in this smoke path.
9. Most root agent guidance is house-managed: lines 1-230 of a 266-line file. `CLAUDE.md` is already an eight-line import shim. Full slimming cannot be achieved by editing only the local tail, and a downstream rewrite would be overwritten by sync.

Executed investigation: `NX_DAEMON=false pnpm nx show projects` completed successfully, then ESLint's existing `lintText` API was exercised at `apps/client/src/funnel-probe.ts` without writing a production file. A named `useEffect` import had zero errors. Direct `setTimeout(done, 0)`, `globalThis.setTimeout(done, 0)`, a nonzero timer control and a pure typed function each had zero errors. An initial empty-callback probe hit `no-empty-function`; the corrected callback-parameter probes isolate timer policy. These are baseline observations, not tests of a new rule. No application suite or native-device verification was run for this read-only audit.

## Root guidance rule disposition

The source locators below refer to headings or numbered clauses in `AGENTS.md`; repeated instructions share one destination instead of acquiring new implementations.

| Source rule | Destination | Migration / retained boundary |
| --- | --- | --- |
| Mission: correct software and durable knowledge | E, D | Remove slogans; retain accountable ownership and where canonical knowledge lives. |
| Law: policy, DCO, governance precedence | D | Keep a short link and repository-specific exceptions; do not delete legal obligations as slop. |
| Session 1: read policy before commit | D | Human authority remains; hook validates only observable trailer/format facts. |
| Session 2: setup missing tools/hooks | C | Setup readiness check and idempotence fixtures; keep one setup command pointer. |
| Session 3: Graphify setup/query first | D, C | Keep discovery routing; automate graph freshness separately. A query does not prove understanding. |
| Session 4: recall/file memories | D | Conditional tool-use instruction, including unavailable access; never fabricate a memory read. |
| Session 5: current API lookup | D, A | Keep source/Context7 routing; compile actual examples instead of embedding copied API tutorials. |
| Session 6: Effect preference read | D, E | Retain library choice once; replace repeated implementation recipes with checked examples. |
| Commit 1: accountable author/sign-off | D, B | Retain human authorization; existing hook checks identity consistency, not consent. |
| Commit 2: AI credit | B, D | Existing trailer checks plus honest tool/model provenance; human cannot be inferred from code. |
| Commit 3: Effect IO/errors/services/input/config | A, B, C | Use owned Effect modules; replace lexical added-line approximation with tested syntax/origin checks; verify failure, cancellation and resource release. |
| Commit 4: conventional subject and logical change | B, D | Format is checked; logical cohesion/R&D truth stays review judgment. |
| Commit 5: ASCII punctuation | B, E | Existing added-text/message scan; preserve authorized source mirrors and Unicode data. Remove repeated manual scan prose when command covers it. |
| Commit 6: people + agent docs, LLMS regeneration | C, A | Existing generated-drift/compiled examples; registry checks guide/proof links. Semantic documentation completeness still needs review. |
| Commit 7: tests and coverage | C, D | Existing thresholds; regression must distinguish correct behavior. No test weakening remains a governance prohibition. |
| Commit 8: graph refresh | C | Existing graph tool; preserve clean-source generation and separate provenance. |
| Commit 9: templates, not rendered copies | D, C | Canonical ownership plus existing drift gate. House migration must precede sync; no local bypass. |
| Commit 10: local gate | C, E | One ordered gate and hook; remove duplicated command lists. `check` is not full `verify`. |
| Commit 11: secrets/dependencies | D, B, C | Keep approval requirement; secret scanning/canary tests support it, not automatic permission to add providers. |
| PR 1: one PR per batch | D, E | Generic house rule conflicts with Eventiva's explicit direct-main exception; render the correct workflow rather than both. |
| PR 2: drafts/disclosure/human review | B, D | Format automation plus human review authority; Eventiva's local delivery exception must remain visible. |
| PR 3: never land; PR 4: do not impersonate reviewers | D | Delivery authority is repository-specific; non-impersonation cannot be replaced by syntax checks. |
| Missing tools: local fallback/access requests/report | D | Keep concise routing and truthful unavailable state; do not create parallel credential paths. |
| Task conflicts: reuse mechanisms, no forbidden work, explicit override | D, A | Existing implementation is the example; rule changes need the accountable owner's explicit decision. |
| House standards table | E | Use a concise capability index; do not repeat each skill's rules in root guidance. |
| Worktrees: isolate, explicit base, preserve dirty work/GitButler | D, C | Setup checks can inspect branch/worktree; consent and preservation remain instructions. |
| Workspace setup/editor/Orca instructions | C, E | Keep machine setup and generated surfaces in their existing homes; one link in root guidance. |
| MCP server table and credentials | D, E | Keep source config/routing pointer; credentials stay external. Remove duplicated host configuration prose. |
| Source availability / subtree preferences | D, A | Keep approval/size/license decision; compiled examples can demonstrate approved APIs. |
| Graphify extraction, exclusions and memory split | C, D, E | Freshness is executable; memory scope/privacy is retained. Remove repeated setup and graph commands. |
| External tools / office conversion | D | Conditional procedures, not application lint. Report missing tools and conversion failures honestly. |
| Issue ownership, packet, labels, handoff | D, C | Validate references/state transitions when APIs are available; mapping correctness needs independent read-back. |
| Workspace defaults | D, E | Retain only unresolved preferences and exceptions; manifests/configs already encode chosen stack. |
| Optional plugins/Orca | D | Conditional capability pointer, no autonomous installation. |
| Final message evidence | C, D | Runner emits exact facts; agent states limitations, decisions and missing access. |
| Local foundation: historical snapshots excluded | B, C, D | Existing boundary tests/workspace exclusions; retain archive status and never rewrite history. |
| Local dependency/version matrix and deferred tooling | D, B | Keep approval authority; toolchain/lockfile checks detect pin drift. General house preferences do not approve packages. |
| Local subpaths/sideEffects/acyclic tags | B, C, E | Already enforced by lint, graph and boundary/hygiene tests; replace duplicate prescriptions with links. |
| Local gate/setup/private test submodule | C, D | Existing setup/smoke; preserve authorization and unavailable-private-suite distinction. |
| Local house enrollment/release hold | D | Retain current authority/deferred release; do not silently activate release tools. |
| Local direct-main/sign-off exception | D, B | Keep owner identity and scope; trailer/ref checks support but do not grant publication authority. |
| Local dual tracker mapping and timeline | D, C | Keep source-of-authority distinction; validate refs/links, independently verify both trackers. |
| Local JSDoc/contracts/rationale | B, A, C | Existing AST scanner/fixtures and reviewed examples; remove repetitions, not semantic review or exclusions. |
| Local documentation ratchet and zero ledger | C, E | Preserve tamper checks and strict zero. Replace historical procedure detail with the owning guide. |
| Local reserved coordinator paths | D | Coordinate real simultaneous writers; reconcile the later task-owned shipping instruction instead of silently retaining contradictory owners. |
| Local full Linear source review/digests | C, D | Existing offline/live checks distinguish freshness from semantics; unread sources remain unread. |
| Local planning Markdown/Mermaid/SVG generation | C, E | Existing generation/fixtures; retain Markdown as authority and source/proposal/approval distinctions. |

## Contribution and style rule disposition

`CONTRIBUTING.md` is generated from the house. Its people-facing guidance is not automatically disposable when removed from agent context.

| Source section / rule | Destination | Migration / retained boundary |
| --- | --- | --- |
| Welcome, repeated respect/quality slogans, beginner tutorial | E | Remove from always-loaded agent instructions; optional human onboarding can remain. |
| Support routing; duplicate search | D, C | Keep support/security routes; issue tooling can record searches, not prove complete duplicate discovery. |
| Security report questions and private reporting | D | Preserve private disclosure; never post exploit details publicly to satisfy a registry. |
| DCO author matching, every commit, AI parts, license | B, D | Hook checks trailers; legal certification/attribution remains human authority. |
| Rebase/force-push sign-off repair recipe | D | Do not turn into autonomous published-history rewriting. |
| AI level/credit/draft/own-voice | B, D, E | Reuse canonical policy and Eventiva exception, remove repeated lists. |
| Cross-platform support | C | Registry needs platform-specific proof; web/Hermes build cannot mark native verified. |
| Own branch / branch prefixes / semver | D, B | Branch syntax is checkable if adopted; version/release authority is not inferred. |
| Inclusive contribution behavior | D | Human conduct, not lint. |
| Bug report exact SHA, environment, steps, logs/media | C | Evidence manifest supplies facts; reproduction still must run and have expected results. |
| Feature request problem/proposal; documentation quote/source | D, C | Structured issue fields and source links; usefulness stays review judgment. |
| Performance repeated measurements and environment | C | Benchmark spec, before/after data, limitations; no fixed performance policy invented. |
| PR titles / conventional types / trailers | B | Existing house check; no second regex in Eventiva. |
| One logical change / imperative / concise descriptions | D, B, E | Format can be checked; cohesion is review. Remove repetitive prose. |
| PR evidence / no decorative checklists / emoji/dashes | C, B, D | Generated execution facts plus existing text checks; no claim that word count proves quality. |
| Drafts and human approvals / merge queue | D | Reconcile house workflow with direct-main exception upstream. |
| Never delete/skip/weaken tests to pass | D, C | Negative fixtures and gate config drift help; semantic weakening cannot be fully linted. |
| Coverage at least 90% | C | Existing Vitest thresholds include lines, branches, statements and functions. |
| Regression fails before and passes after | C | Record original reproduction and controls, not only new green tests. |
| CI retry/flaky reports, local once | C | Verify actual runner configuration; prose alone does not establish retries are configured. |
| Approved dependencies only | D, B | Approval remains human; compare manifest/lock changes to recorded scope. |
| Domain-neutral core and vendor integrations | A, B | Existing Eventiva tags and modules govern; generic feature-to-integration sentence must not override stricter local boundaries. |
| Comments explain why | A, B, D | Existing scanner plus honest example and semantic review. No filler generation. |
| Local lint/type/tests before review | C | Ordered static-first command plus behavioral checks and recorded outcome. |
| Graph setup/update/non-blocking stale graph | C, D | Reuse current graph policy; do not make it blocking incidentally. |
| Minor contribution sign-off | B, D | No size exception; existing legal policy stays. |
| Review bot catalog / advice / humans answer | D, E | Keep current tools in config and concise authority rule; do not make AI reviews the gate. |
| `CLAUDE.md` imports AGENTS | D | Already minimal; no independent policy copy. |
| `docs/documentation-standard.md`: every callable, useful prose, own-body rationale | B, A, D | Preserve existing AST checks, calibrated fixtures and narrow exclusions; review truth manually. |
| Documentation standard: trusted ancestor, prune-only ledger, strict zero | C | Existing tamper/identity/negative fixtures; no new debt or suppression. |
| Documentation standard: history and examples | A, E | Keep provenance in its document; trim historical implementation narrative from agent entry points only. |
| Documentation-writing: novice-followable, imperative, defined jargon, factual | A, C, D | Walk a guide and compare outcomes; human readability is not reducible to lint. |
| Documentation-writing: avoid chrome vs feature reachability | D, C | Use stable route, role/name/action identifiers and task steps, not pixel positions. |
| Documentation-writing: AsciiDoc/subagent preference | E, D | Markdown and this task's no-delegation requirement govern here; flag upstream stale preference. |
| No em/en dashes and preservation exclusions | B | Reuse existing added-text scan; do not reject legitimate multilingual/customer data. |
| Whitelabel terms except required integrations | A, C, D | Review rendered customer copy; a universal trademark ban would reject legitimate integration setup. |
| Frontend composition/brand/type/background/hero/card/clutter/color rules | A, C, D | Existing design components and visual review; aesthetic intent is not a reliable AST predicate. |
| Frontend motion, desktop/mobile, accessibility | C, D | Reduced-motion, keyboard/contrast and viewport checks; do not add decorative motion merely for a count. |
| Frontend modern React patterns and preserve existing design | A, D | Correct patterns must match actual lifecycle and compiler configuration; no hook substitution to evade policy. |
| GAN guidelines: name, colors, user flows, edges, interactions | C, D | Translate observable flows/edge cases into specs; design direction remains a decision. |
| GAN ambition/12-16 features | E | Task-specific generator guidance, not a reason to expand this migration or every feature. |

## Coding preferences rule disposition

Paths below are relative to `.agents/skills/coding-preferences/`. The generated `.claude/skills` mirror has the same disposition and must be regenerated, not independently edited. The complete `references/` set was read.

| Source / rule | Destination | Migration / retained boundary |
| --- | --- | --- |
| Index: no API tutorials in skill | A, D | Real compiling examples plus current API/source lookup. |
| Index: no any; never delete tests | B, C, D | Existing static/coverage gates; keep the governance prohibition. |
| Index: thin file map, companion references | D, E | Keep routing once; no copied rules in each companion. |
| Index maintenance, handover, rolling changelog | D, E | Occasional skill-maintenance guidance; historical changelog is not current policy. |
| `language.md`: TS extensions, strictness, no any, precise guards | B, A | Existing compiler/lint; tooling exemption remains explicit. |
| `language.md`: PNPM, workspace protocol | B, C, D | Toolchain/manifest checks; preserve permitted `node --run` rather than literal command bans. |
| `effect.md`: Effect v3 and exceptions | D, A, B | Keep selected library and tooling/pure-function boundary; examples and AST/type checks implement mechanics. |
| `effect.md`: typed errors, Context/Layer, raw vendor Promise boundary | A, B, C | Origin-aware syntax checks and public failure/cleanup tests; comments alone cannot grant a vendor exemption. |
| `effect.md`: stable/main sources and docgen dependencies | D | Preferences are not approval to install new tools or switch versions. |
| `effect.md`: patched tsc, suggestions, editors, Dev Tools opt-in | B, C, D | Existing compiler/config readiness; external connection stays explicit and non-production. |
| `effect.md`: scoped diagnostics instead of blanket disable | B, D | Existing gates can reject suppression; exceptional approval remains explicit. |
| `effect.md`: most capable library wrapped in Effect | D, A | Capability/approval decision, demonstrated integration pattern. |
| `effect.md`: runMain, functions over methods | A, C, D | Entry-point cleanup tests; do not lint required class/service contracts away. |
| `effect.md`: Schema/roundtrip | A, B, C | Use real schemas, encoded-type checks and roundtrip/error cases. |
| `effect.md`: Platform/Cluster precedence | D, A | Preserve approved Eventiva composition; do not replace working infrastructure by global preference. |
| `effect.md`: Config/redacted secrets | A, B, C | Configuration boundary example and canary tests; no logging of raw failures. |
| `effect.md`: batching/caching with freshness exceptions | A, C, D | Behavior tests must preserve fresh authorization; no blanket cache rule. |
| `effect.md`: @effect/vitest, placement, resolution | B, C, A | Existing test projects and helpers; keep necessary non-Effect integration boundaries. |
| `architecture.md`: required/intersecting Nx tags, external imports/cycles | B, C | Existing configuration and boundary suite; add tag-shape checks only if coverage is missing. |
| `architecture.md`: exact Eventiva table | E | Link/generate from config instead of independently maintaining another table. |
| `architecture.md`: new package procedure and Nx hierarchy | C, D | Setup/config tests and one documented command path. |
| `architecture.md`: shared agent/UI operations/data/state | A, C | Existing action path and parity tests; verify each actual interface, not only operation existence. |
| `architecture.md`: local-first | C, D | Reconnection/permissions/sync proofs where implemented; do not pretend online-only slices support offline. |
| `integrations.md`: generic core + features, no cross-wiring | A, B | Existing ports and tag constraints; domain ownership still needs design judgment. |
| `integrations.md`: config secrets, no blocking IO | A, B, C | Scoped vendor boundary, async resource/failure tests and latency probes where relevant. |
| `ui.md`: component-first/independent versions | A, D | Existing approved UI registry; no unapproved federation rollout. |
| `ui.md`: Expo/self-hosted federation/cached bundles | D, C | Preserve selected and deferred scope; device/offline tests precede claims. |
| `ui.md`: i18n | B, C, A | Existing FormatJS lint/catalogue and shell plural proof. |
| `data.md`: Drizzle/Neon/Effect | D | General vendor preference cannot replace Eventiva's approved SQL architecture or provision services. |
| `licensing.md`: license and canonical header | D, B | Keep license choice/compatibility authority; existing header checker generates exact text. |
| `vendoring.md`: subtree, source availability, size/upstream exceptions | D, C | Provenance/update verification; preserve archived gitlink. |
| `vendoring.md`: pattern files kept current | A, C | Compile real pattern examples; remove dead duplicate walkthroughs. |
| `ci.md`: Nx/caching/affected/self-healing | C, D | Existing targets, deterministic hashes and failures; Nx Cloud remains locally unapproved. |
| `ci.md`: Trunk/quarantine/test preservation | D, C | Do not introduce a service or quarantine/skip gate without approval. |
| `ci.md`: smartcloud/release/Nx release | B, C, D | Reuse house policy; Eventiva release activation remains held. |
| `ci.md`: AI bots advisory | D | Keep one authority statement; deterministic gates do not prove semantic completeness. |
| `auth.md`: enterprise checklist and provider selection | D, C | Capability acceptance matrix and security tests; do not add a new auth vendor. |
| `auth.md`: integration ownership/source/telemetry | A, B, C | Existing ports and boundary checks; telemetry remains consent/scope limited. |
| `accounting.md`: local/online role split and vendor starters | D | Material product/data decisions remain with owner. |
| `accounting.md`: currencies/precision/IDs/history/migration parity | C, B, A | Schema and provider compatibility tests when implemented; no fictional completeness. |
| `telemetry.md`: one project per product and required products | D, C | Provisioning/data disclosure require approval; capability matrix can show gaps. |
| `telemetry.md`: safe defaults/new behavior flag | A, B, C | Existing flag contracts and runtime checks; test disabled/enabled/unavailable cases. |
| `telemetry.md`: opt-out/redaction/privacy/offline exclusions | C, D | Canary/egress tests plus explicit policy; no automatic ingestion. |
| Feature-flag standard: provider/interface/runtime SDK selection | D, A | Existing approved adapters take precedence over generic installer instructions. |
| Feature-flag standard: default helper/identity/group | A, C | Test single fallback owner, isolation and failure; do not identify real people in test evidence. |
| Feature-flag standard: names/owner/removal criteria | B, C, D | Preserve Eventiva's dotted names; reconcile upstream kebab-case preference instead of renaming public keys. |
| Feature-flag standard: archive after rollout, exclusions | D, C | Production flag deletion/rollout is separately authorized; tests verify removed branch semantics. |
| `ai.md`: AI SDK/Effect AI and tool selection | D, A | Dependency/architecture choices, not authorization to add every listed SDK. |
| `ai.md`: remote prompts/flags/traces; sensitive data | D, C | Controlled evals/egress tests after approval; no hosted model call in verification by default. |
| `vercel.md`: deployment/platform portability | D, B | Deployment remains separate; vendor imports stay behind integrations. |
| `vercel.md`: local agent plugin, not CI/headless | D | Do not install during this task. |
| `vercel.md`: Connect/eve/Sandbox/BotID/Workflow/Chat | D, C | Capability preferences and sandbox isolation tests, not a mandate to replace Eventiva Cluster. |
| `docs.md`: people + agent docs, compiled examples/LLMS | A, C | Existing docgen/drift gate; generate indexes from canonical Markdown. |
| `docs.md`: emitted callable contracts | B, C, D | Existing JSDoc gate plus declaration checks; semantic truth still reviewed. |
| `docs.md`: MDX/Mintlify/Docs7/creator agent | E, D | This task explicitly selects Markdown; shared preference needs upstream reconciliation. |
| `docs.md`: Graphify local graph/cloud memory | C, D | Keep privacy and availability distinctions; existing graph tool, no alternate memory store. |
| `agent-git.md`: shared operations/worktrees/source | A, C, D, E | Reuse action/parity and worktree procedures; remove repetitions. |
| `agent-git.md`: attribution/house source/batched PRs | B, D | Keep authority and direct-main exception; canonical templates own common changes. |
| `agent-git.md`: product Linear team/org placement | D | Organizational authority, not source lint. |
| `ai-docs/src/05_house-standards/index.md` | E, A, C, D | Generated summary repeats the rules above; keep compiling examples and short canonical links. It still calls skills PostHog skills and `check`/header commands generically; fix at house source. |

## Vendor and historical documents remain scoped to their owners

These files were read to distinguish their rules from active Eventiva policy. Do not remove or enforce their rules globally just because the inventory finds them.

| Path | Rule classification and disposition |
| --- | --- |
| `examples/eventiva-before-amp/CONTRIBUTING.adoc` | D: historical provenance only. Its CLA/private-test/setup/deployment/branch/review instructions are retired context, not current commands. E: eliminate active pointers that present it as current, not the historical file itself. |
| `externals/upstream/effect-main/.agents/AGENTS.md` | C upstream: targeted runtime/type/JSDoc validation and no watch-mode full suite. D upstream: layout, tsrs choice, scratchpad, generator ownership. A: nearby source patterns. No Eventiva enforcement of TS7/tsrs commands. |
| `externals/upstream/effect-stable/AGENTS.md` | C upstream: lint/tests/check/build/docgen. A upstream: it.effect/assert and existing examples. D upstream: PNPM, generated barrels, changesets, scratchpad, v4 path. E upstream candidate: repeated test-pattern guidance. Its reduce-comments rule does not override Eventiva JSDoc. |
| `externals/upstream/expo-cli/packages/@expo/cli/CLAUDE.md` | A/C upstream: POSIX Metro paths, Windows environment spelling, platform filters and tests. D upstream: layout, event-logging transition and release procedure. Do not run its publish command. |
| `externals/upstream/expo/packages/expo/CONTRIBUTING.md` | C upstream: Jest/lint/tsc/native integration. D upstream: watcher workflow and test scope. Its no-100%-coverage preference does not lower Eventiva thresholds. |
| `externals/upstream/nx/packages/devkit/CLAUDE.md` | B/C upstream: public versus internal imports, compatible APIs/version checks. D upstream: +/-1 public compatibility, lockstep private consumers and small public surface. Eventiva consumes approved APIs, not this publication policy. |
| `externals/upstream/nx/packages/nx/src/native/CLAUDE.md` | C upstream: Rust build/test/format, JS bridge integration and performance measurement. A/D upstream: panic/error handling, native ownership. No native rewrite in Eventiva. |
| `externals/upstream/react/packages/react-devtools/CONTRIBUTING.md` | C upstream: built React, shell/extension/unit-test paths. D upstream: upstream Yarn/dependency setup and issue agreement. No Eventiva Yarn migration. |
| `externals/upstream/vitest/packages/ui/CONTRIBUTING.md` | C upstream: matched UI/API ports and browser preview. D upstream: dev-only plugin/state setup. No new Eventiva development service. |
| `externals/upstream/typescript-eslint/packages/eslint-plugin/docs/rules/brace-style.md` | D upstream reference: deprecated rule migration notice, not a requirement to install stylistic dependencies. |
| `externals/upstream/typescript-eslint/packages/eslint-plugin/docs/rules/member-delimiter-style.md` | D upstream reference: same deprecated-rule notice. Keep vendored provenance. |

## Migration checkpoint and remaining contract

### Independently implemented and tested locally

- `eslint.config.mjs` adds `eventiva/no-zero-delay-ui-timer` in the existing frontend scope only. The exact corrective message is: `Do not defer UI state with a zero-delay timer. Keep state in one owner and update it from the event; use scoped Effect scheduling for genuine timed work.` Direct and global-member calls, computed literal properties, optional calls, omitted delay and signed zero are covered. This is lexical analysis, not alias tracking or dynamic delay evaluation. Local shadows, real delays, spreads and backend code remain controls.
- The public timer regression failed against the baseline with an empty diagnostic list. The boundary suite now includes the no-exception active-source `useEffect` restriction, preserving wildcard-export and Nx boundaries. Named/aliased, namespace/default, CommonJS and dynamic React imports cannot evade the rule. Its corrective message says to initialize services in bootstrap before rendering product content and derive render state or update its owner from events. Vendored/generated/history sources remain outside active lint ownership.
- `apps/client/index.ts` registers a minimal root synchronously before starting scoped flag acquisition. The renderer subscribes to bootstrap's immutable loading/ready/failed snapshot. Only ready mounts product hooks; failure exposes a bounded localized alert. Two lifecycle tests exercise registration while acquisition is pending, ready publication, unsubscribe, exactly-once release and partial-acquisition failure cleanup. Metro disposal requests fiber interruption; it does not claim synchronous completion before replacement.
- `node --run verify:static` builds declared prerequisites, runs Nx lint/typecheck, and runs source plus emitted-declaration audits before documentation. The integrated run reports 15 builds, 83 successful lint/typecheck/prerequisite tasks, 293 source files/1435 edges/34 packages, 100 declaration files/502 edges and zero violations or cycles. Full `verify` keeps every previous gate in the new order; application CI invokes static checks before documentation.
- [The registry](verification/registry.md) maps 30 implemented interface families and all 150 active application/package TypeScript files. The runner computes changed paths and reverse-import consumers independently, executes uncached commands with a sanitized environment and retains logs, actual assertion outcomes and hashed files. A full commit/tree, dirty-tree digest, registry digest and inventory digest bind each run. Empty/malformed/skipped proof and mutation during collection fail. This is source-file coverage, not exhaustive discovery of runtime actions.
- Setup installs a pre-commit hook that rejects unstaged/untracked divergence and index mutation, runs static analysis before full verification and refuses foreign-hook overwrite while preserving commit-msg. Seven runner/hook fixtures pass. CI retains the trusted-event fixture and adds the separately approved bounded synthetic PR fixture after [the trust review](verification/registry.md#pr-fixture-trust-review). Affected evidence uploads retain seven days under the existing artifact audience; no shared data or secrets are supplied.
- The local AGENTS tail replaces copied mechanics and contradictory coordinator ownership with canonical guide links and the source/check/regression promotion loop. People and agent guides describe commands and limitations. The managed house body is unchanged; full reduction requires canonical house acceptance/sync.
- `node --run check` exits 0, including 104 documentation fixtures and 298 editable TypeScript files with zero findings. The integrated full test/build/parity targets and all three smoke projects pass. Ready/loading/failed synthetic web screenshots were inspected at 2x; status/alert text and readiness-gated product content are correct with no browser errors. These are not native-device tests.
- The subsequent affected collection selected 20 interface families through the changed shared test configuration. Nineteen passed; backend-surfaces failed with raw executor counts `[3, 0, 0]` instead of `[2, 0, 0]` in `apps/server/tests/two-runners.mjs:420`. The manifest at `test-output/verification/fd55ac6f-a644-4c99-b101-0fa231fecc75/manifest.json` retains that failure; collection ran from 01:10:08Z to 01:31:41Z on 2026-11-20. Pre-commit correctly refused the commit. The registry now serializes server prerequisites as full verify does; concurrency was observed but is not yet a proven root cause. No assertion or test was weakened. The CI verification budget is 90 minutes because full acceptance plus uncached proof took approximately 49 minutes locally, beyond the previous 20-minute budget.
- The corrected `pnpm nx test @eventiva/server --skip-nx-cache --parallel=1` command passes with disposable PostgreSQL: server tests and all 13 prerequisites succeed in 2m54s, including the unchanged cluster replay assertion. This targeted rerun supports matching the established serialized gate; it does not prove that concurrent execution caused the earlier extra entry. The original failed manifest is not relabeled, and complete evidence collection on the final tree still needs a fresh run.
- The runner now makes serialization an explicit execution contract, not a retry tactic: one feature at a time, `NX_PARALLEL=1`, rejected conflicting Nx parallel overrides and recorded execution policy. Eight runner/hook tests pass, including a real Nx dependency graph whose prerequisites acquire an exclusive synthetic resource and assert nonoverlapping lifetimes. The same fixture with `--parallel=2` fails with `EEXIST`. Both server harnesses allocate randomized independent SQL databases and use distinct ports; shared SQL state is not established. Resource/lease contention remains a hypothesis, not a proven explanation of the earlier extra executor entry. No backend assertion changed.
- Final serialized pre-commit verification passed on integrated main `80bc555a`: static checks, root check, 140 resource/type/runner fixtures, test/build/parity for 32 projects plus prerequisites and smoke for all three projects. The uncached affected collection ran 02:05:05Z-02:28:34Z on November 20 and passed all 20 entries, including the original backend assertion. Manifest `test-output/verification/968c0b77-2807-49d9-a31f-837d914eeb41/manifest.json` binds the pre-commit HEAD and dirty-tree digest, not a falsely clean committed revision. Commit `9e379bf6` has a verified Git signature, the authorized author/sign-off and both task references. Hosted CI and shared adoption are separate gates.

These are local checks, not hosted CI or whole-workflow acceptance. No new dependency, shared house edit, production change or external telemetry was introduced. `eslint-plugin-jsdoc` and `jsdoc/informative-docs` are absent; the shared pod was informed, and Eventiva's AST ratchet/strict-zero gate is preserved.

### Reuse existing static checks and test their corrective messages

The static-first command above implements the independent part of this contract. Do not count build-dependent type targets as dependency-free lint. Keep the full existing `verify` gate in addition to this earlier feedback.

Extend the actual ESLint configuration and boundary tests. Test a violation, a valid alternative, alias/namespace/member forms and scope exclusions; assertions must require the intended rule and corrective message, not any error. Do not duplicate rule configuration inside tests. Candidate diagnostics:

- Zero-delay UI scheduling: `Do not defer UI state with a zero-delay timer. Keep the state in one owner and update it from the event; use the scoped Effect scheduler for genuine timed work.` This is a class-level correction, not a false assertion that every timer comes from a duplicated menu.
- React lifecycle import, only after the replacement is selected: `Initialize app-owned services in the client bootstrap. Derive render state from props or a subscribed store; do not use useEffect to copy state.` Scope and exception policy must be explicit before enforcement.
- Existing module boundaries: retain the actual Nx diagnostic and link to the owning contracts/composition example; do not invent a permissive replacement hierarchy.
- Effect boundary: `Move vendor IO into its integration service and wrap it with Effect.tryPromise/try; return typed failures and release resources through scope.` Syntax checks cannot determine all IO semantically.

### Keep the registry in Markdown and evidence separate

Proposed home: `docs/verification/` with stable feature IDs and one Markdown entry per feature. Each entry declares owning tracker pair, implementation status, interface, exact route/action/CLI invocation, prerequisites/flags, synthetic inputs, steps, observable assertions, negative controls, proof command/test selector, evidence type and unsupported targets. Generated JSON may be a parser output, never a competing authored registry.

Registry coverage must derive from actual application entry points/action inventory. Every discovered interface is mapped or explicitly unimplemented/blocked with a reason. Unknown feature IDs, missing selectors and empty test selection fail; a suite-level pass cannot silently certify every feature. Existing action inventory is not duplicated as another manually maintained operation list.

Proposed runner: a repository-local Node orchestration tool using existing Nx and Playwright targets, no dependency, daemon, hosted model or new service. Record source SHA, dirty-tree fingerprint, registry/spec digest, command/arguments, target/interface, start/end, exit status, assertion outcome and evidence paths. Distinguish pass, fail, blocked and not implemented. Do not convert unavailable PostgreSQL/device credentials or missing media into pass. Disable result caching for proof collection while allowing unchanged build prerequisites to cache.

Use isolated synthetic data. Store local evidence in ignored per-run directories; publish only reviewed, secret-free evidence. In CI, upload separate run artifacts with an explicitly selected retention period. Never dump environment variables, auth headers, real sessions or raw customer payloads. Each UI scenario gets a screenshot and, for interaction, an inspected recording of at most 60 seconds; a timeout is a failure, not a silently truncated success. Capture console/page errors and assert their absence. Nonvisual features use exact public-path outputs and state assertions; diagrams explain but do not prove execution.

### Preserve hook and PR trust boundaries

The pre-commit hook must run against the staged snapshot, or reject staged/working-tree divergence; checking only the working tree can certify code different from the commit. Preserve/chains existing user hooks and the separate house commit-msg hook. It must propagate static/verification failures, avoid recursive commits and fail visibly when required fixtures are unavailable. Hook installation belongs in idempotent setup, not an untracked manual action.

PR CI now calls the same static/behavior commands and uploads affected evidence even when collection fails. The newly authorized candidate fixture is separate from the retained trusted-event setup. Candidate code still controls its runner and network; this is synthetic test isolation, not adversarial attestation. No `pull_request_target` candidate checkout or shared secrets are used. Hosted execution remains a separate pending check.

### Slim guidance only after proof exists

The local tail can keep archive boundaries, approved dependency/architecture constraints, delivery/sign-off authority, tracker mapping and production holds. Replace repeated mechanics with links to static/verification commands and canonical guides. The house-managed body, contribution summary, prompts and generator require a house change and normal sync. No local override may mask the still-active upstream text.

Proposed self-improvement instruction: `When correcting a recurring mistake, fix the owned source example, add a static rule or public-path regression with a corrective failure, prove the old case fails and the corrected case passes, then remove duplicated instructions. Keep a guidance rule only when it requires authority or judgment that the checks cannot establish. Do not add exceptions or weaken existing gates to make the promotion pass.`

## Owner decisions and remaining adoption boundaries

Jonathan's decisions were relayed through the requesting Puck thread on 2026-11-19/20; exact owner-selection times are unavailable. The latest shell decision supersedes the earlier before-registration proposal: register the minimal shell synchronously, then acquire flags before product rendering, without `useEffect`. Synthetic isolated PR PostgreSQL fixtures are approved alongside trusted-event tests after trust review. CI evidence is affected-only, retained seven days and uses the existing artifact audience. These decisions unblock the coupled implementation, not production activation.

House [PR #56](https://github.com/Resnovas/.github/pull/56) is merged at [6cabf3a](https://github.com/Resnovas/.github/commit/6cabf3afd23652fe1816c81bc1041ab2bf4b000f), and Puck requested adoption on 2026-11-20. The accepted contract includes 20 JSDoc rules, source-absence checks, fenced verification metadata, independently derived interface inventory, explicit pass/fail/blocked/unimplemented status, byte-validated evidence, document budgets, readiness protection and build-info verification. The local table/manifest does not claim those APIs or exhaustive action discovery. Existing AST strict-zero and full behavior gates must remain.

Executing the exact merged `tools/verification/docs-budget.mjs` against Eventiva fails before classification with `spawnSync git ENOBUFS`: the complete Git path inventory is 3,303,046 bytes. Separately, the contract excludes generated mirrors but the implementation counts all docs Markdown except archives. A read-only large-buffer inventory finds 42 over-budget files, 31 containing canonical generated planning/Linear regions; authored regions in mixed documents must still be checked. Both canonical defects were reported to the shared pod without modifying house sources or adding exclusions. Other over-budget authored documents, including this review, remain Eventiva remediation, not exemption requests.

The shared pod published candidate fixes in [draft PR #60](https://github.com/Resnovas/.github/pull/60), head [bedb6ab](https://github.com/Resnovas/.github/commit/bedb6abe4770137f9247b2e1d842620368dc3835). Independent GitHub inspection confirms OPEN/draft with no merge commit. Running that exact candidate checker read-only against Eventiva gets past inventory and generated regions, then correctly reports 13 remaining over-budget authored/managed documents. It is not adopted. Jonathan's acceptance/merge and normal sync remain prerequisites; the separate licence inventory fallback bug is not fixed by this candidate. The shared pod also reports a readiness-guard token denial; its already-draft passing rerun is not proof that restoration authentication works.

The shared contract specifies `eslint-plugin-jsdoc@65.5.0`; Eventiva has not installed it or enabled the shared rules in this first slice. Jonathan approved that exact development dependency, retaining current ESLint/parser versions, through Puck on November 20. The [Linear resumption](https://linear.app/resnovas/issue/EVE-299#comment-1fedc63b-0569-45cb-a08e-3899147d4985) was independently read on [GitHub](https://github.com/Resnovas/Eventiva/issues/1092#issuecomment-7027709956). No other dependency is approved. Enable shared JSDoc package-by-package with each passing remediation commit, then globally, without baselines or suppressions. Ship independent full-gate-passing slices directly to main; house PR60 no longer holds that delivery. Do not remove global JSDoc guidance on the basis of approval alone. Full adoption, source remediation, managed guidance synchronization and independently validated CI publication remain pending. Build-info tooling does not authorize deployment or invent a live endpoint.

An isolated installation probe failed `ERR_PNPM_NO_MATURE_MATCHING_VERSION`: version 65.5.0 was published 2026-11-19T07:22:18.811Z, within `minimumReleaseAge: 10080`. An exact-version cooldown exception or waiting until November 26 requires the owner's decision; dependency approval alone did not change that policy. The [Linear prerequisite](https://linear.app/resnovas/issue/EVE-299#comment-56a2f790-605b-440a-a83c-c1ad84eb2e9a) is independently [mirrored on GitHub](https://github.com/Resnovas/Eventiva/issues/1092#issuecomment-7027919574). No exclusion or installation in the active workspace was made.

## Shared house candidates

1. A small generated AGENTS entry point containing authority/preferences/tool routing, with application mechanics in checked tools and examples.
2. Remove duplicate/conflicting workflow recipes from AGENTS, CONTRIBUTING, the house ai-docs summary and Verify/editor surfaces; distinguish house `check` from product `verify`.
3. A composable, non-destructive pre-commit installer with staged-snapshot correctness, preserving commit-msg and foreign hooks.
4. Corrective AST rules and negative/positive fixtures for Effect/vendor boundaries, hook policies and scheduling anti-patterns; keep framework policy configurable per accepted repository contract.
5. Markdown verification schema/parser, inventory-coverage check and evidence manifest convention with explicit blocked/unimplemented status.
6. Common evidence capture/upload safety: synthetic fixtures, redaction, <=60-second videos, exact revision/spec digest and retention/audience configuration.
7. A static-first CI template and a separately reviewed untrusted-PR fixture policy, never secret-bearing candidate execution.
8. Reconcile stale preferences: Markdown versus MDX/AsciiDoc; dotted Eventiva flags versus generic kebab-case; local SQL/Cluster and no-cloud exceptions versus generic vendor recommendations; task-owned delivery versus stale coordinator reservations.
9. Promotion regression fixtures that catch removing a rule, widening an exclusion, certifying an empty run or weakening a test to clear the funnel.
10. Add informative JSDoc enforcement and source-inspection absence-assertion rules alongside, not instead of, Eventiva's AST zero gate. Test public behavior when removing code; a source-text absence assertion is not proof of the replacement path.
11. Fix the house license scanner's Git-buffer overflow fallback: a large tracked file list can fall through to filesystem traversal and inspect ignored scratch fixtures. Preserve exclusions and fail/report the original inventory error instead of pretending the walk is equivalent.
12. Fix the merged document-budget inventory overflow and reconcile generated-region handling with its contract. Keep authored content checked; generated mirrors must not require manual edits or blanket path exclusions.
13. Reject hard-coded listener ports in test fixtures with a corrective instruction to bind port zero and read the assigned address. Cover literal listen arguments and fixture URLs, while distinguishing intentionally invalid schema inputs from actual listeners. Preserve socket ownership through acquisition instead of closing a temporary reservation before rebinding. Eventiva's validated Cluster profile currently rejects zero and couples listen/advertised ports; review the transport seam before its complete fixture migration. This rule is requested, not implemented by the bounded collision repair.
14. Clear Git-local repository environment for verification children launched by an installed hook, preserving it for the hook's own index checks. Exercise real linked-worktree commits with nested histories, not only direct invocation in ordinary clones; retain positive committed-tree and mutation-rejection proof.

## Delivery state

The bounded local migration is published in signed source `9e379bf6` and graph/evidence `5ca8059d` after full local gates and all 20 affected proofs passed. Clean-source Graphify generation succeeds with 22,316 nodes and 32,983 edges; its existing partial-extraction warning for the approval specification is retained, not treated as semantic coverage. Exact-head [hosted application CI](https://github.com/Resnovas/Eventiva/actions/runs/44663334032) subsequently failed the backend proof; its main static/test/build/parity checks and smoke passed. The original failed manifest and backup stashes remain preserved. Shared adoption, exhaustive runtime-interface coverage and managed-guidance reduction remain open. This first slice adds no dependency or production setting and changes no shared house source or access control. Graphify Cloud and the gateway were not connected; local Graphify/source, Linear MCP and authenticated GitHub supplied the available evidence. No memory write or unavailable gateway lookup is claimed.

The [EVE-261 timing owner](https://ampcode.com/threads/T-01a1f129-c14c-7069-b343-1563380b020c) is cleared to verify parallelism of two for the preceding static, test/build/parity and smoke stages, preserving order and adding the Android-to-web ordering edge. Their serial settings were inherited, not a correctness requirement established by this migration. Feature evidence retains its independently tested serial contract. The registry now distinguishes these scopes; no root changes are made in this documentation follow-up. The timing owner's measurements require fresh integrated acceptance and are not substituted for this slice's serial evidence.

### Hosted fixture collision and bounded repair

The retained hosted manifest `73233be2-4abf-4536-b4bc-a60785f4b4d0` reports four backend test failures and 19 other passing interface families. Its command log identifies `EADDRINUSE` at `127.0.0.1:34565`: `approval-consent.spec.ts` and `http-client.spec.ts` both own that listener, and Vitest file concurrency is independent of Nx task serialization. This is not the earlier replay-count failure. The [Linear diagnosis](https://linear.app/resnovas/issue/EVE-299#comment-6f7eefb4-6c7d-4399-a797-5d5c1c986372) is independently [mirrored on GitHub](https://github.com/Resnovas/Eventiva/issues/1092#issuecomment-7029279944).

With disposable PostgreSQL, `pnpm exec vitest run --config apps/server/vitest.config.mts apps/server/tests/approval-consent.spec.ts apps/server/tests/http-client.spec.ts --maxWorkers=2 --coverage.enabled=false` reproduces four failures and three passes on unchanged source. Isolating consent on 34566 produces seven passes with the same command; static-first verification also passes with zero boundary findings. The registry retains this explicit concurrent public-path proof as `backend-fixture-isolation`, alongside the full coverage gate. No assertion, retry or scheduling limit changes. Full final-tree gates, graph and publication remain pending for this repair. The owner-requested broader port-zero correction-to-lint migration is a separate next step, not silently claimed complete by selecting another fixed port.

The bounded listener repair subsequently passed the full installed pre-commit gate and both affected proofs, then shipped as [f802d14b](https://github.com/Resnovas/Eventiva/commit/f802d14bfe27666072bdc8c417d47f0ff6d1e729). Manifest `4df3b1ea-cf9a-4ee9-8ec5-ca046aba91d8` retains the local results; hosted acceptance and graph refresh remain separate. The [publication and hook diagnosis](https://linear.app/resnovas/issue/EVE-299#comment-a424f63f-1772-4f5f-8752-6a5f1cf6208c) is independently [mirrored](https://github.com/Resnovas/Eventiva/issues/1092#issuecomment-7029751709). The earlier documentation-only revision's hosted CI passed, but did not select the failed backend proof.

### Installed-hook repository isolation

EVE-261 reported nested documentation-history fixtures corrupting the outer staged index before failing to find the hook runner. A real linked-worktree reproduction confirms the cause: inherited Git-local environment overrides nested commands' working directory. The same ordinary-clone control succeeds. The amendment clears Git's own `rev-parse --local-env-vars` list only from verification children; snapshots retain the original environment. The installed-hook regression commits independent histories in both stages, checks the exact outer committed tree and primary HEAD, and still rejects a command that mutates the outer index. It fails against the old runner; all nine runner fixtures and the static gate pass after the change. Full gates and publication of this separate priority fix are pending. No hook bypass, missing-file success, root scheduling change or new dependency is introduced.
