# Comment classification and action guide

## Exempt comments (do not delete)

The following are enforced by repository gates or compiler semantics and are automatically excluded by `tools/comments/policy.mjs` and `eventiva/no-inline-comments`:

- FCL-1.0-MIT file headers containing `DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.`
- Attached JSDoc blocks (`/** ... */`), including `@agent-optimization` evidence lines
- Vendor Promise boundary markers (`// effect-boundary: <reason>`)
- Compiler negative type assertions (`// @ts-expect-error ...`) inside test files only
- Shebang lines (`#!/usr/bin/env node`)
- Files beginning with `Synced from Resnovas/.github` (owned by `Resnovas/.github`)

## The four categories

### 1. Tautology

**Definition:** Repeats what the code, type signature or adjacent JSDoc already says, narrates obvious control flow, or explains a self-evident test step.

**Action:** Delete the comment and remove any resulting redundant blank lines.

### 2. Stale

**Definition:** References removed functions, old behavior, superseded migration phases, wrong file paths, or assumptions the surrounding code no longer holds.

**Action:** Verify against the current code that the note is outdated, then delete the comment.

### 3. Excuse

**Definition:** Rationalizes a hacky implementation, workaround, hardcoded bypass, partial migration, monkey-patch, swallowed error, or suppressed check that could be copied elsewhere.

**Action:**
1. Delete the comment.
2. File an issue (Linear via the MCP gateway when available, or GitHub on `Resnovas/Eventiva` via `gh issue create`) stating the observed hack, why it is risky, exact `file:line` references, and the target fix direction.
3. Apply `correction-to-lint`:
   - Worked examples in `eslint.config.mjs`: `noEmptyCatchRestriction` (an empty `catch {}` excused by a comment) and `noPositionalUnionMemberIndexRestriction` (`Schema.Union(...).members[0]` excused by a comment).
   - If the hack has a narrow AST pattern (e.g., prototype mutation, `console.error(JSON.stringify(...))` in test fixtures, unguarded raw bypass), add a scoped ESLint rule in `eslint.config.mjs` with an error message describing the concrete fix, plus positive/negative tests in `tests/boundaries/src/boundaries.spec.ts`.
   - If the hack is behavioral and static analysis cannot decide it reliably, add an executable regression test or document why static enforcement is deferred until the issue lands.

### 4. Decision Record

**Definition:** Captures a non-obvious architectural, security, protocol, concurrency, driver or platform constraint that cannot be inferred from reading the code alone and would cause bugs if reverted.

**Action:**
1. Check `docs/adr/README.md` to see if an ADR for that topic already exists.
2. Create `docs/adr/NNNN-short-kebab-title.md` (next sequential 4-digit number) or append the new facet to an existing ADR, using this structure:
   - `# NNNN: Title`
   - `Date: YYYY-MM-DD`
   - `Status: Accepted`
   - `## Context`
   - `## Decision`
   - `## Consequences`
   - `## Code references` (exact repository-relative file paths and symbols)
3. Update `docs/adr/README.md` with the new entry.
4. Delete the inline/block comment from source.

## Commands

```sh
node tools/comments/ratchet.mjs --inventory
node tools/comments/ratchet.mjs --inventory --json
node tools/comments/ratchet.mjs --strip <paths>
node tools/comments/ratchet.mjs --update
node tools/comments/ratchet.mjs --base HEAD
node --test tools/comments/ratchet.test.mjs
```
