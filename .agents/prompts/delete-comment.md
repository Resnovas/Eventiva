---
label: Delete comments
description: Audit and remove inline/block comments, file issues for excuses, migrate decisions to ADRs, and tighten the comment ratchet
argument-hint: "[file or directory glob, or blank to inspect ratchet inventory]"
---

Load and follow `.agents/skills/delete-comment/SKILL.md` and `.agents/skills/delete-comment/references/classification.md`.

Target scope: `$ARGUMENTS` (if blank, run `node tools/comments/ratchet.mjs --inventory` and process remaining ratcheted comments).

For every non-exempt inline or block comment in scope:
1. Classify as Tautology, Stale, Excuse or Decision Record.
2. Delete Tautology and Stale comments.
3. For Excuse comments, delete the comment, file an issue to fix the hacky implementation, and apply the `correction-to-lint` skill so the hack is caught going forward.
4. For Decision Record comments, move the rationale into a numbered ADR under `docs/adr/` (indexed in `docs/adr/README.md`), then delete the comment.
5. Run `node tools/comments/ratchet.mjs --update` and verify `node tools/comments/ratchet.mjs --base HEAD`, `node --test tools/comments/ratchet.test.mjs`, `node --run documentation` and affected lint/test targets.
6. Report category counts, lines shed, issues filed, lint rules added, ADRs updated and remaining ratchet total.
