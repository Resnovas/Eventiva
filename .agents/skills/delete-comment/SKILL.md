---
name: delete-comment
description: "Audit inline and block code comments against Eventiva's no-inline-comments policy, classify each as Tautology, Stale, Excuse or Decision Record, delete them, file issues plus correction-to-lint rules for Excuses, move Decision Records into docs/adr/, and tighten tools/comments/ratchet.json. Use when running /delete-comment, paying down the comment ratchet, reviewing a PR that adds inline comments, or removing stale/excuse comments."
---

# Delete comment

Audit and remove non-JSDoc inline (`//`) and block (`/* */`) comments while preserving real engineering knowledge in ADRs and preventing hacky workarounds from silently propagating.

## Gotchas that bite first

- **Never delete exempt comments.** Keep FCL-1.0-MIT license headers (`DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.`), attached JSDoc contracts (`/** ... */`, enforced by `tools/documentation/check.mjs`), `@agent-optimization` JSDoc tags, `// effect-boundary: <reason>` markers (enforced by `tools/dev/commit-check.mjs`), `// @ts-expect-error` assertions in test files, and house-synced files (`Synced from Resnovas/.github`).
- **Never delete an Excuse silently.** An Excuse comment hides a hacky implementation. Deleting it without filing an issue and promoting a narrow `$correction-to-lint` check turns a visible hack into an invisible one.
- **Never discard a Decision Record.** Move genuine non-obvious design, concurrency, protocol or security decisions into a numbered ADR under `docs/adr/` and index it in `docs/adr/README.md` before removing the comment.
- **Always tighten the ratchet.** After deleting comments, run `node tools/comments/ratchet.mjs --update` so `tools/comments/ratchet.json` locks in the lower count permanently.

## Workflow

1. **Inventory target comments.** Run `node tools/comments/ratchet.mjs --inventory` (or `--inventory --json`) to list remaining banned comments, or inspect the files named in the request.
2. **Classify every comment** using `references/classification.md` into exactly one bucket:
   - **Tautology** - delete.
   - **Stale** - delete.
   - **Excuse** - delete, file an issue describing the hack and desired fix, and run `$correction-to-lint` to add a narrow static check or regression test preventing the underlying hack from recurring.
   - **Decision Record** - write or update a numbered ADR under `docs/adr/` (and index it in `docs/adr/README.md`), then delete the comment.
3. **Strip what is left.** Once every Excuse has an issue and every Decision Record is in an ADR or attached JSDoc, run `node tools/comments/ratchet.mjs --strip <paths>` to delete the remaining comments in those paths. It keeps exempt comments, drops lines left blank and leaves code untouched. Review the diff.
4. **Tighten the ratchet.** Run `node tools/comments/ratchet.mjs --update` and verify with `node tools/comments/ratchet.mjs --base HEAD`.
5. **Verify all gates.** Run `node --run check` and `pnpm nx affected -t lint typecheck test` (or the full lint/test suite for touched projects). Scan changed files for em/en dashes (ASCII hyphen-minus only).
6. **Report.** Summarize counts by category, lines shed, issues filed, lint rules added, ADRs created/updated, and remaining ratchet count.

## Files

| File | Read it when |
| --- | --- |
| `references/classification.md` | Deciding edge cases between Tautology, Stale, Excuse and Decision Record, or formatting a new ADR or Excuse issue. |

## Companions

- `correction-to-lint` - promotes each Excuse's underlying hack into a narrow ESLint rule or executable regression check.
- `writing-specifications` - structures actionable issue packets for Excuse follow-ups.
- `no-em-or-en-dashes` - keeps all edited docs, ADRs and rules ASCII-only.

## Maintenance

Keep this body thin. Put new classification edge cases or ADR templates in `references/classification.md`. After editing `.agents/skills/delete-comment/` or `.agents/prompts/delete-comment.md`, run `node tools/dev/surfaces.mjs sync` so `.claude/` and `.cursor/` mirrors stay in sync.
