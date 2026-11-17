# TypeScript documentation standard

Document the contract, purpose and important constraints of every editable Eventiva TypeScript function, method, class and interface with attached JSDoc (`/** ... */`). Include private code, callbacks, function expressions, arrows, overloads, constructors/accessors and callable type signatures. A name or parameter list is not a description. Explain what callers can rely on: ownership, validation, failures, authorization, lifetimes or deliberate absence of side effects, as applicable. Do not claim a guarantee that the implementation does not provide.

Inside bodies, explain meaningful phases, invariants, security boundaries and non-obvious decisions. Comments explain why the implementation takes a step, not that an assignment assigns or a return returns. A pure expression or trivial straight-line body does not need invented internal narration. It still needs a useful contract. No code is grandfathered by its age or by being a test.

## Run the standalone checker

Use the already pinned workspace TypeScript installation; no new dependency is required:

```sh
node --test tools/documentation/check.test.mjs
node tools/documentation/check.mjs
node tools/documentation/check.mjs --json > .amp/in/orb-backup/documentation-findings.json
```

Both strict checker formats return exit 1 when there are findings, including review candidates. `--json` changes output only; it is not a successful audit mode. Default output is one `file:line rule kind name` per finding followed by the checked-file count. JSON includes `checked` and `findings`; each finding carries an exact token-based `id`, `file`, `line`, `kind`, `name` and `rule`. There is no auto-fix, ignore-comment or warning-only option. Save temporary reports under `.amp/in/orb-backup/` in an orb, never as undocumented source exemptions.

Jonathan approved an exact reviewed documentation-debt ratchet on 2026-11-17. Its implementation is `tools/documentation/ratchet.mjs`; the full debt ledger is `tools/documentation/debt.json`. Run `node --run documentation` for all documentation fixtures, offline mirror/planning freshness and the ratchet; root `check` includes the same gate without replacing existing checks or thresholds. `pnpm nx run @eventiva/eventiva:documentation` invokes it uncached because Git history and working-tree state are inputs. The strict scanner still reports all debt; a passing ratchet is **not global documentation compliance**. This is tooling governance, not runtime behavior, so it adds no application feature flag.

Install the approved lockfile before running the gate: `pnpm install --frozen-lockfile --ignore-scripts` is sufficient for documentation/house checks, which import the pinned TypeScript AST package but build no application and need no services. Both CI jobs fetch full history and supply the trusted event base. A dependency-free checkout cannot run the AST checker; missing TypeScript is a setup failure, not permission to skip it. Normal application verification keeps its existing installation and build steps.

## Enforce the ratchet

```sh
node --test tools/documentation/check.test.mjs tools/documentation/ratchet.test.mjs
node tools/documentation/ratchet.mjs --base HEAD
node tools/documentation/ratchet.mjs --base HEAD --update-ledger
```

The comparison base must be explicit: `--base HEAD` for local uncommitted work, or `DOCUMENTATION_BASE` set to a full trusted commit SHA from the CI event. The trusted environment input takes precedence over the local flag. A branch name, abbreviated SHA, missing commit or non-ancestor fails; fetch required history rather than falling back. Root invokes the same local command while CI injects its trusted pull-request base, merge-group base or push-before SHA. A manual event without an earlier trusted base fails closed; it cannot certify new-code compliance by comparing the candidate to itself. No moving integration SHA is hard-coded into scripts. A post-commit local HEAD comparison cannot prove pre-commit changes; CI must use its earlier trusted base.

The candidate ledger must exactly retain remaining accepted identities. It can only remove identities from the trusted ledger, never add/mutate/duplicate entries or increase the count. New/changed undocumented callable tokens cannot reuse an old identity; added lines cannot borrow an identical old callback's debt. Every touched file with blocking attachment/prose debt must strictly reduce its scoped blocking count. Entries for resolved/deleted findings must be pruned. The explicit `--update-ledger` operation only prunes and rerenders the bounded per-file table in [the backlog](planning/documentation-backlog.md); new blocking findings fail before any write. Initial bootstrap was checked against the original source commit and excluded all in-flight producer/exporter additions. Once a trusted ledger exists, deletion/reset or rewritten provenance fails.

The ledger records mechanical missing attachments and a distinct heuristic review queue. Rationale candidates are review-only: the current classifier falsely flags some adequate adjacent invariant contracts, simple reauthorization/barrier bodies and nested cleanup ownership explanations. The coordinator explicitly held automatic rationale-gate activation pending a generally applicable tested refinement. The ratchet neither fails new source merely for these candidates nor adds them to accepted debt. Review meaningful phases/invariants/security decisions semantically and record evidence on the owning issue; this does not waive rationale or approve filler. Existing rationale queue identities remain visible and prune-only, not confirmed violations. Attachment absence and the calibrated placeholder/name-only prose rule remain blocking in the root gate. Complete D01-D06, calibrate rationale independently, then switch to the strict repository-wide scanner at zero. Never use per-file suppressions or accept new blocking debt for urgency.

## Mechanical checks versus review candidates

| Rule                        | What it establishes                                                                                                                                                                                                                                                                               | What it does not establish                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `missing-jsdoc`             | A covered AST declaration has no immediately attached non-file JSDoc. Class/enclosing/sibling docs do not cover a nested callable.                                                                                                                                                                | Whether missing documentation describes a complex operation; even a pure callback has a contract under the owner's rule.                                       |
| `review-jsdoc`              | Attached prose is name-only/repetitive, tag-only or contains a placeholder. The calibrated check accepts short prose: two distinct words including one non-name/non-generic word. Modifier tags such as `@internal` may introduce useful prose; parameter tags alone do not replace the contract. | Semantic usefulness, truth, complete constraints or accurate error/security promises. A long wrong comment can pass; review it, do not pad it.                 |
| `review-internal-rationale` | A block body has control flow, or multiple statements with multiple calls, but no qualifying own-body non-JSDoc rationale. A single return guard is explicitly not flagged. Nested functions' comments, comment-looking strings and obvious two-word syntax narration do not count.               | That every branch needs narration, or that one comment covers every meaningful phase. Review false positives and missing security/phase explanations manually. |
| `parse-error`               | TypeScript could not parse the source; the file is not silently skipped.                                                                                                                                                                                                                          | Compiler/type correctness, which remains the existing typecheck's responsibility.                                                                              |

The owner approved the ratchet policy, not a claim that a heuristic proves semantic quality. Calibration fixtures distinguish callbacks that need contracts from pure expressions/trivial bodies that need no internal narration, accept concise accurate prose and required vendor-boundary markers, and reject placeholders/name-only repetition. Do not count heuristic candidates as confirmed owner-policy violations or add filler to satisfy a word count. If useful prose or a trivial guard is flagged, propose a narrowly tested general checker improvement instead of a suppression. Neither TypeScript's AST nor a maintained JSDoc plugin can prove that prose is true or explains every meaningful security decision; human review remains required. The standalone repository checker reuses the already pinned TypeScript AST rather than adding a second parser/plugin dependency; ESLint's existing rules remain unchanged.

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

For a body that validates then authorizes, an internal explanation such as `// Authorize only the decoded tenant reference so encoded aliases cannot bypass scope checks.` explains the security boundary. `// Set value` does not. Trivial `return 1`, object-literal expression bodies and `const value = 1; return value` are explicitly tested not to require internal comments. The classifier cannot identify every meaningful phase and intentionally does not manufacture rationale for those cases.

## Maintain the rule

Keep positive and negative fixtures for each covered syntax, attachment boundary, heuristic, ratchet invariant and exclusion. Before changing a classifier, run the full inventory and review representative production/test/callback results. Keep presence findings separate from quality/rationale candidates and machine-check the per-file backlog against the exact ledger. Migrate one owned module at a time, read the code first, and run its lint/type/tests. Never mass-generate placeholder comments or modify another active lane's source to reduce the inventory. Track D01-D07 on EVE-13/EVE-261 until the owner assigns separate issues or approves another arrangement.
