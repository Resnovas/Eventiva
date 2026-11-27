# ADR-0001: Ban Inline and Block Comments with a Monotonic Ratchet

- Status: Accepted
- Date: 2026-11-21
- Owners: Platform & Tooling

## Context

An audit of the 352 editable first-party JavaScript and TypeScript files found 2,225 non-JSDoc inline (`//`) and block (`/* */`) comments in 261 files. Deleting all of them would remove about 2,230 of the 82,757 lines in those files (2.7%). Most fell into three harmful categories:

- **Tautology**: restating adjacent code or adding section headers, which creates visual noise and decays when code evolves.
- **Stale**: citing retired tickets, old branch checkpoints, or superseded implementation details (for example, pre-`d3723b42` caller-bridging constraints or removed bundler packages).
- **Excuse**: rationalizing workarounds, empty `catch {}` blocks, prototype mutations, unsafe type casts, or unfixed security gaps instead of fixing the underlying defect or filing an issue.

Meanwhile, genuine architectural decisions were buried inside inline comments across dozens of files rather than recorded in a discoverable, reviewable architecture log. In addition, the `review-internal-rationale` check in `tools/documentation/check.mjs` previously required inline rationale comments inside complex function bodies, directly conflicting with an inline-comment ban.

## Decision

1. **Ban non-JSDoc inline (`//`) and block (`/* */`) comments** across all editable first-party JavaScript and TypeScript files via ESLint rule `eventiva/no-inline-comments` (`tools/comments/no-inline-comments.mjs`) and the standalone ratchet gate (`tools/comments/ratchet.mjs`, run by `node --run check`). The gate reads comments from the parsed TypeScript tree, so regular expressions and template text never count, and its per-file counts match ESLint's.
2. **Retain exact, narrow exemptions** enforced in `tools/comments/policy.mjs`:
   - FCL-1.0-MIT license headers (`DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.`, enforced by `tools/license/check-headers.mjs`).
   - Attached JSDoc contract blocks (`/** ... */`, enforced by `tools/documentation/check.mjs`).
   - `@agent-optimization` JSDoc review tags (EVE-44).
   - Required `// effect-boundary: <reason>` markers (enforced by `tools/dev/commit-check.mjs`).
   - `// @ts-expect-error` assertions in test files (`*.spec.*`, `*.test.*`, `*.conformance.*`, `tests/**`) only.
   - House-synced files carrying `Synced from Resnovas/.github`, which are maintained upstream in `Resnovas/.github`.
   - Historical/vendored/generated directories already outside repository lint scope (`examples/**`, `externals/**`, `graphify-out/**`, `.opencode/**`, `.claude/**`, `.cursor/**`, `tests/boundaries/fixtures/**`, build and test output directories).
3. **Use a monotonic per-file ratchet** (`tools/comments/ratchet.json`):
   - Files may never exceed their recorded budget or add newly budgeted entries.
   - Removing comments requires tightening `tools/comments/ratchet.json` (`node tools/comments/ratchet.mjs --update`).
   - `node tools/comments/ratchet.mjs --base HEAD` fails if any budget increases, any new file enters the ratchet, or any file drops below its budget without tightening the ratchet file.
   - The first ledger, after the tooling batch, holds 2,153 comments across 238 files.
4. **Retire `review-internal-rationale`** in `tools/documentation/check.mjs` while keeping `missing-jsdoc`, `review-jsdoc`, and `parse-error` strictly enforced on attached JSDoc contracts.
5. **Preserve durable decisions in `docs/adr/`** and provide the repeatable `/delete-comment` workflow (`.agents/skills/delete-comment/SKILL.md` and `.agents/prompts/delete-comment.md`) so future comment cleanup follows the same classification, ADR promotion, issue filing, and ratchet tightening process.

## Consequences

- Inline comments cannot silently hide workarounds, stale claims, or empty catch blocks.
- Function and type contracts live in attached JSDoc; cross-cutting architectural rationale lives in numbered ADRs under `docs/adr/`.
- Existing or in-flight branches that temporarily carry legacy inline comments can only ratchet strictly downward toward zero.
- The ratchet counts comments per file, so swapping one comment for another inside a budgeted file passes until that file is cleaned.
- Any `/** ... */` block is exempt, attached or not. Reviewers still reject a JSDoc block used as an inline note.

## References

- `tools/comments/policy.mjs`
- `tools/comments/no-inline-comments.mjs`
- `tools/comments/ratchet.mjs`
- `tools/comments/ratchet.json`
- `tools/documentation/check.mjs`
- `eslint.config.mjs`
- `.agents/skills/delete-comment/SKILL.md`
