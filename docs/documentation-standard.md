# TypeScript documentation standard

## Canonical house tooling checkpoint - 2026-11-17

The 13 synced TypeScript tools under `tools/ci/`, `tools/dev/`,
`tools/release/` and `tools/typecheck/` take their JSDoc from the canonical
`Resnovas/.github/templates/tools/` sources. Jonathan accepted
[house PR 48](https://github.com/Resnovas/.github/pull/48) at 14:35:04Z as
[house commit 30c7ff08](https://github.com/Resnovas/.github/commit/30c7ff08dd05dc492feb26fc42da9f2e8903bbda).
The Eventiva sync compares against immutable pre-packet main
`416ef0aa7a4035b35f77bdf3eb4e1430b22b00f2`; the 13 rendered copies match
accepted canonical source and preserve executable ASTs apart from redundant
parentheses. No release script or application behavior is changed.

The review distinguishes advisory coverage from enforced thresholds, validates
configuration before release work, and documents actual command failures and
workflow outputs. Stable release dry runs still build configured bundles and
strip source maps without uploading them; release previews instead may write
synthetic local Git state and workflow summary/output files. Neither is an
unqualified read-only operation. Table-cell escaping covers pipes and LF/CRLF,
not arbitrary Markdown; truncation appends its notice outside the retained-text
limit; nightly versions handle both the first stable release and next patch.

Exact prune-only remediation removes 87 accepted identities: 72 missing
contracts and 15 rationale candidates. Five adequate review-only candidates
remain: the renderer's breaking-marker replacement, two workflow output
appenders, squash-message assembly and bounded-note truncation. Their attached
contracts explain these small operations; no filler or classifier exception is
added. The original base took global debt from 3,049 to 2,962 identities.
Rebase onto `970e44851983a15ef8f2130c930ffafc15b0c129` uses its published
trusted-fingerprint reconciliation and preserves both independent batches:
this packet now takes 338 to 251 identities. All 72 remaining missing contracts
are resolved, while 330 live rationale review candidates remain globally.
No supplied candidate IDs are adopted and no ledger JSON is manually merged.
This is not strict-zero semantic acceptance.
See the [timeline](planning/timeline.md#house-tooling-jsdoc-sync---2026-11-17)
and [backlog](planning/documentation-backlog.md) for bounded delivery evidence.

Document the contract, purpose and important constraints of every editable Eventiva TypeScript function, method, class and interface with attached JSDoc (`/** ... */`). Include private code, callbacks, function expressions, arrows, overloads, constructors/accessors and callable type signatures. A name or parameter list is not a description. Explain what callers can rely on: ownership, validation, failures, authorization, lifetimes or deliberate absence of side effects, as applicable. Do not claim a guarantee that the implementation does not provide.

As of 2026-11-21 ([ADR-0001](adr/0001-no-inline-comments-and-ratchet.md)), non-JSDoc inline (`//`) and block (`/* */`) comments are banned under a monotonic ratchet (`tools/comments/ratchet.json`, enforced by `eventiva/no-inline-comments` and `tools/comments/ratchet.mjs`) and `review-internal-rationale` is retired from `tools/documentation/check.mjs`. Document callable contracts in attached JSDoc (`/** ... */`), record cross-cutting architectural decisions in `docs/adr/`, fix hacky implementations rather than excusing them, and use `/delete-comment` to process legacy comments. FCL-1.0-MIT license headers, attached JSDoc contracts (including `@agent-optimization`), `// effect-boundary:` markers, test-only `// @ts-expect-error` assertions and house-synced files remain exempt. No code is grandfathered by its age or by being a test.

## JSDoc tags and the lint rule set

Since 2026-11-21, `eslint.config.mjs` holds editable production TypeScript to a JSDoc tag contract with `eslint-plugin-jsdoc` 65.4.6. The target is every JavaScript and TypeScript file in `packages`, `apps`, `tests`, `tools`, `scripts` and `storage`, except files synced from `Resnovas/.github`, which are fixed there. It is switched on one package or tool at a time through `jsdocAdoptedFiles`, without baselines or suppressions: when a group's findings reach zero, add its glob to the list in the same commit. The standalone checker below still runs on every file.

Three details:

- JavaScript files may keep JSDoc types (`@param {string} file - ...`), because they have no other type information. TypeScript files may not.
- A review marker may follow the description on the same line (`/** Retain the diagnostics. @agent-optimization reviewed=...; result=...; evidence=... */`), because `tools/function-telemetry` reads it there.
- When a callback that needs `@param` follows another argument, as in `it('name', fn)` or `page.on('error', fn)`, Prettier keeps its JSDoc on the call's line and the stars cannot align. Name the callback in a `const`, document the `const`, and pass the name.

Every callable and exported type needs a description written as a full sentence. Then add:

| Tag | When | Notes |
| --- | --- | --- |
| `@param name - text` | Every parameter | One spelling only: `@arg`, `@argument` and `@return` are rejected. |
| `@returns text` | Every function that returns a value | For an Effect, describe the success value and that it never fails, or name the failures with `@fails`. |
| `@fails {ErrorTag} text` | Each typed failure in an Effect's error channel | Replaces `@throws`. |
| `@since version` | Every export | The package version the export first shipped in. Replaces `@version`, which goes stale. |
| `@example` | Every export and public exported method | A short, real call. |
| `@access permission` | Code guarded by a resource or action permission | The dotted, lower-case permission a caller must hold, as the `Permission` schema in `packages/contracts/src/action.ts` defines it, for example `@access inventory.catalogue.write`. Never a role or a TypeScript visibility. |
| `@yields text` | Real generator APIs | Not on callbacks passed to `Effect.gen`: the outer function's `@returns` and `@fails` document the Effect. |
| `@default`, `@deprecated`, `@fires`, `@implements`, `@inheritdoc`, `@see`, `@this`, `@class`, `@constructs` | When they apply | `@emits` is rewritten to `@fires`. |

Never use `@throws` or `@exception` (Effect code does not throw), `@author` (git records it), `@license` (the file header holds it) or `@version` (use `@since`). The rule's message names the replacement. Tests in `tests/boundaries/src/boundaries.spec.ts` prove each ban and a passing control.

A full example is `make` in `packages/integrations/formatjs/src/i18n.ts`.

## Run the standalone checker

Use the already pinned workspace TypeScript installation; no new dependency is required:

```sh
node --test tools/documentation/check.test.mjs
node tools/documentation/check.mjs
node tools/documentation/check.mjs --json > .amp/in/orb-backup/documentation-findings.json
```

Both strict checker formats return exit 1 when there are findings, including review candidates. `--json` changes output only; it is not a successful audit mode. Default output is one `file:line rule kind name` per finding followed by the checked-file count. JSON includes `checked` and `findings`; each finding carries an exact token-based `id`, `file`, `line`, `kind`, `name` and `rule`. There is no auto-fix, ignore-comment or warning-only option. Save temporary reports under `.amp/in/orb-backup/` in an orb, never as undocumented source exemptions.

Jonathan approved an exact reviewed documentation-debt ratchet on 2026-11-17. Its implementation is `tools/documentation/ratchet.mjs`; the full debt ledger is `tools/documentation/debt.json`. Run `node --run documentation` for all documentation fixtures, offline mirror/planning freshness, the ratchet and finally the strict repository-wide scanner; root `check` includes the same gate without replacing existing checks or thresholds. `pnpm nx run @eventiva/eventiva:documentation` invokes it uncached because Git history and working-tree state are inputs. The empty ledger preserves provenance and tamper checks, not permission to accept findings: the final scanner ignores the ledger and fails on every finding, including rationale candidates in never-ledgered source. A passing mechanical scan does not prove semantic usefulness. This is tooling governance, not runtime behavior, so it adds no application feature flag.

Install the approved lockfile before running the gate: `pnpm install --frozen-lockfile --ignore-scripts` is sufficient for documentation/house checks, which import the pinned TypeScript AST package but build no application and need no services. Both CI jobs fetch full history and supply the trusted event base. A dependency-free checkout cannot run the AST checker; missing TypeScript is a setup failure, not permission to skip it. Normal application verification keeps its existing installation and build steps.

## Enforce the ratchet

```sh
node --test tools/documentation/check.test.mjs tools/documentation/ratchet.test.mjs
node tools/documentation/ratchet.mjs --base HEAD
node tools/documentation/ratchet.mjs --base HEAD --update-ledger
```

The comparison base must be explicit: `--base HEAD` for local uncommitted work, or `DOCUMENTATION_BASE` set to a full trusted commit SHA from the CI event. The trusted environment input takes precedence over the local flag. A branch name, abbreviated SHA, missing commit or non-ancestor fails; fetch required history rather than falling back. Root invokes the same local command while CI injects its trusted pull-request base, merge-group base or push-before SHA. A manual event without an earlier trusted base fails closed; it cannot certify new-code compliance by comparing the candidate to itself. No moving integration SHA is hard-coded into scripts. A post-commit local HEAD comparison cannot prove pre-commit changes; CI must use its earlier trusted base.

The candidate ledger must exactly retain remaining accepted identities. It can only remove identities from the trusted ledger, never add/mutate/duplicate entries or increase the count. New/changed undocumented callable tokens cannot reuse an old identity; added lines cannot borrow an identical old callback's debt. Every touched file with blocking attachment/prose debt must strictly reduce its scoped blocking count. Entries for resolved/deleted findings must be pruned. The explicit `--update-ledger` operation only prunes and rerenders the bounded per-file table in [the backlog](planning/documentation-backlog.md); new blocking findings fail before any write. Initial bootstrap was checked against the original source commit and excluded all in-flight producer/exporter additions. Once a trusted ledger exists, deletion/reset or rewritten provenance fails.

### Parser-context fingerprint reconciliation

Finding fingerprints use TypeScript parser terminals, excluding JSDoc and EOF. A context-free token scanner can misread an interpolated template tail, regular expression or JSX and include later comments in a token. That made some documentation-only edits rename retained findings. The parser correction changes hashing, not attachment/prose/rationale classification, coverage or exclusions. Literal text and executable changes still change identities.

The ratchet reconciles legacy fingerprints only by inspecting identical trusted historical source bytes in both modes. It verifies the same finding count, order, file, line, kind, name and rule before deriving a private one-to-one map. Candidate source, nearby lines, names alone and candidate-provided maps cannot establish correspondence. The internal `internalLegacyFingerprint` option defaults to false and exists only for this trusted-history bridge; it is not a CLI exemption or alternate gate. Unknown identities remain subject to the existing stale/addition checks. Duplicate mappings, metadata reassignment and provenance resets fail closed.

Use the same explicit trusted base and `--update-ledger` command shown above. The operation normalizes proven same-finding representations before pruning resolved entries and rendering the inventory; it never increases accepted count or accepts a new finding. Review canonicalization separately from documentation removals. At the first reconciliation base `b5837844e68a28e5031f76d60006b1d4728f20ba`, 395 of 1,894 accepted IDs change representation with zero unmatched entries and no count change. Documentation in the accompanying nineteen-file packet then removes 1,556 entries; 75 remapped identities remain among the 338 retained entries. No heuristic finding is cleared merely by changing its fingerprint. Regression fixtures cover template-comment shifts, changed literal/executable content, contextual regex/JSX, duplicates on added lines, forged debt and provenance/deletion attacks.

The migration ratchet still distinguishes mechanical attachment/prose debt from heuristic rationale candidates; it never adds candidates to accepted debt. The separate strict scanner now blocks all findings after complete semantic remediation reached zero on 2026-11-18. Historical review-only dispositions below are evidence, not current exemptions. Review meaningful phases/invariants/security decisions semantically and record evidence on the owning issue; scanner success does not waive rationale or approve filler. Never use per-file suppressions or accept new blocking debt for urgency. Genuine false positives require generally applicable positive/negative fixtures and a classifier correction, not source exceptions.

## Mechanical checks versus review candidates

| Rule                        | What it establishes                                                                                                                                                                                                                                                                                                            | What it does not establish                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `missing-jsdoc`             | A covered AST declaration has no immediately attached non-file JSDoc. Class/enclosing/sibling docs do not cover a nested callable.                                                                                                                                                                                             | Whether missing documentation describes a complex operation; even a pure callback has a contract under the owner's rule.                                       |
| `review-jsdoc`              | Attached prose is name-only/repetitive, tag-only or contains a placeholder. The calibrated check accepts short prose: two distinct words including one non-name/non-generic word. Modifier tags such as `@internal` may introduce useful prose; parameter tags alone do not replace the contract.                              | Semantic usefulness, truth, complete constraints or accurate error/security promises. A long wrong comment can pass; review it, do not pad it.                 |
| `review-internal-rationale` | A block body has control flow, or multiple statements with multiple calls, but no qualifying own-body rationale. Standalone internal JSDoc can explain a phase; attached callable contracts cannot. Value-only selectors and single return guards are not flagged. Nested comments, strings and syntax narration do not count. | That every branch needs narration, or that one comment covers every meaningful phase. Review false positives and missing security/phase explanations manually. |
| `parse-error`               | TypeScript could not parse the source; the file is not silently skipped.                                                                                                                                                                                                                                                       | Compiler/type correctness, which remains the existing typecheck's responsibility.                                                                              |

The owner approved the ratchet policy, not a claim that a heuristic proves semantic quality. Calibration fixtures distinguish callbacks that need contracts from pure expressions/trivial bodies that need no internal narration, accept concise accurate prose and required vendor-boundary markers, and reject placeholders/name-only repetition. Do not count heuristic candidates as confirmed owner-policy violations or add filler to satisfy a word count. If useful prose or a trivial guard is flagged, propose a narrowly tested general checker improvement instead of a suppression. Neither TypeScript's AST nor a maintained JSDoc plugin can prove that prose is true or explains every meaningful security decision; human review remains required. The standalone repository checker reuses the already pinned TypeScript AST rather than adding a second parser/plugin dependency; ESLint's existing rules remain unchanged.

### Bounded test-scaffolding calibration

Test suite bodies that only register scenarios have no separate implementation phase to narrate. The checker recognizes direct named runtime imports from `vitest` or `@effect/vitest`, resolving lexical symbols rather than identifier spelling. It accepts plain `describe`/`it`/`test` registration and the existing Effect `it.effect`, `it.scoped`, `it.live` and `it.scopedLive` forms with value-only titles/optional timeout arguments and inline callbacks. Local constant value declarations are allowed; discovery calls, loops, evaluated metadata and arbitrary setup remain review candidates. Each nested callback still receives its own contract and rationale checks, whether invoked during suite registration or deferred until test execution.

Similarly, bodies consisting only of supported built-in assertions on value-only expressions or type assertions need no invented phase comment. This is a syntax classification, not a proof of runtime purity. Unknown/computed matchers, spread arguments, evaluated inputs and unsupported chains remain candidates. Shadowed, type-only and namespace bindings are not treated as supported imports. Any direct binding escape, re-export, write or unsupported use disables calibration for that binding throughout the source, including alias-based extension and `Object.assign` mutation. Unknown dependencies and external setup are not proven safe by this local classifier. No path exclusion, comment suppression, CLI switch or new accepted debt is introduced.

Run `node --test tools/documentation/check.test.mjs tools/documentation/ratchet.test.mjs` for the bounded positive/negative fixtures. Then compare complete findings against the same frozen TypeScript source, review every removed candidate and prune only matching existing identities with the trusted-base command above. Classifier corrections are recorded separately from documentation improvements. A passing calibrated scan is not evidence that all meaningful rationale has been semantically reviewed.

## Coverage and exclusions

The checker enumerates tracked and untracked nonignored Git paths ending in `.ts`, `.tsx`, `.mts` or `.cts`. It includes apps, packages, integrations, tests/fixtures, configs, scripts/tools, agent examples and handwritten `.d.ts` declarations. Missing indexed paths are skipped only when actually deleted. Other read errors fail. Class expressions, object methods, property arrows, generator callbacks and interface call/construct/method signatures are covered, not just exported declarations. JSDoc on a single variable/property/type alias can document its direct callable initializer/type; callbacks nested in another call need their own adjacent JSDoc. A multi-binding statement does not lend one contract to all bindings. The required `// effect-boundary:` marker may appear between a contract and its directly attached callable; it neither suppresses documentation nor borrows another declaration's prose.

Narrow exclusions are structural, not author-selectable comment markers:

- Immutable historical `examples/**` (and its pre-rename `Examples/**` spelling) and vendored `externals/**` trees.
- Generated `graphify-out/**`, `.claude/{skills,commands}/**`, `.cursor/commands/**` and orb-private `.amp/**` data.
- Reproducible directory components: `node_modules`, `dist`, `out-tsc`, `coverage`, `test-output`, `test-results`, `playwright-report`, `.nx` and `.expo`.
- Syntax without a standalone callable declaration, such as the function shape inferred by a mapped type or an imported vendor type, has no local AST node to annotate. Document its owning type/API. Explicit function types and signatures do have nodes and are checked; there is no blanket declaration-file exemption.

These exclusions neither permit hiding production code in generated directories nor remove any existing lint/type/boundary checks. Ordinary `.js`/`.mjs` tooling is outside this TypeScript-only rule and keeps its existing gates.

## Examples and non-examples

This pure formatter documents a constraint rather than narrating the expression. No internal comment is needed:

```ts
/** Normalize a validated action identifier for model-provider tool discovery; authorization remains with invocation. */
const wireName = (name: string): string => name.replaceAll('.', '_');
```

Inline callbacks can carry JSDoc without replacing them with named one-use helpers:

```ts
const ids = records.map(
    /** Project only public identifiers; retain the caller's already-authorized record ordering. */
    (record) => record.id
);
```

`const ids = records.map(record => record.id)` lacks the callback contract. `/** Map records. */` can pass a shallow prose heuristic but adds little useful information: review must still reject syntax narration. Conversely, `/** Normalize locale tags. */` is concise and accepted; the gate does not require five-word padding. The declaration name and context determine whether its description is useful.

For a body that validates then authorizes, an internal explanation such as `// Authorize only the decoded tenant reference so encoded aliases cannot bypass scope checks.` explains the security boundary. `// Set value` does not. Trivial `return 1`, object-literal expression bodies and `const value = 1; return value` are explicitly tested not to require internal comments. Branches selecting only existing values also need no invented execution-phase narration. Calls, callbacks, constructors, assignments and destructuring defaults/computed keys that execute work remain review candidates; this is syntax classification, not a proof of purity. The classifier cannot identify every meaningful phase and intentionally does not manufacture rationale for those cases.

### Historical reviewed calibration boundaries - 2026-11-17

Three delivered-source cases were read alongside the checker output and remain
adequately explained semantic-review candidates, not confirmed documentation
violations:

- `packages/runtime/src/identity.ts`, `target`: the adjacent contract explains
  the closed resource-grammar/schema dispatch and explicit-policy fallback.
  Exempting arbitrary predicate calls would also hide authorization/delegation
  phases in the enclosing identity implementation.
- `packages/runtime/src/telemetry-export.ts`, `flush`: the contract explains
  reauthorization of the payload-free barrier. Exempting any two-call generator
  would also hide distinct validation and security-release phases.
- `packages/integrations/posthog-server/src/telemetry.ts`, SDK `try` callback:
  the contract and nested cleanup explain ownership until SDK settlement after
  interruption. Promoting every nested comment would incorrectly cover separate
  unexplained outer work.

No file/name allowlist, blanket nested-comment acceptance or suppression clears
these cases. The bounded selector/standalone-JSDoc refinement keeps negative
execution, binding-default, outer-phase and security-phase fixtures. A broader
safe classifier for these three shapes remains unresolved; strict repo-wide
rationale activation stayed held at that historical checkpoint. Subsequent
semantic packets added useful own-body explanations without broadening the
classifier, and the complete queue reached zero before strict activation.

### Strict activation checkpoint - 2026-11-18

Jonathan merged [canonical house PR49](https://github.com/Resnovas/.github/pull/49)
at 12:07:32Z, commit `6018bb91eeb739a9d0df8b3a7b93f850661e76a9`.
Its normal downstream render resolves the last five accepted tool candidates.
Review of newer main resolves another 115 never-ledgered candidates through
documentation, not classifier changes. The [thirteenth checkpoint](planning/documentation-backlog.md#thirteenth-semantic-checkpoint-and-strict-activation---2026-11-18)
records the immutable base, token proof, exact zero inventory and executed gates.
The root documentation command ends with `node tools/documentation/check.mjs`;
regression fixtures prove accepted and never-ledgered rationale both fail that
strict CLI, while an actual meaningful body comment clears the fixture.

## Maintain the rule

Keep positive and negative fixtures for each covered syntax, attachment boundary, heuristic, ratchet invariant and exclusion. Before changing a classifier, run the full inventory and review representative production/test/callback results. Keep presence findings separate from quality/rationale candidates and machine-check the per-file backlog against the exact ledger. Migrate one owned module at a time, read the code first, and run its lint/type/tests. Never mass-generate placeholder comments or modify another active lane's source to reduce the inventory. Track D01-D07 on EVE-13/EVE-261 until the owner assigns separate issues or approves another arrangement.
