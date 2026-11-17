<!-- linear:generated:start -->
# EVE-22: Correct boundary docs to match lint, use colon tags, and fix the house reference

[Live Linear source](https://linear.app/resnovas/issue/EVE-22/correct-boundary-docs-to-match-lint-use-colon-tags-and-fix-the-house) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:06.246Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Code, Decision: Audit needed, Delivery: Implementation pending, Refactor |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-42](EVE-42.md), [EVE-112](EVE-112.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

The written module-boundary rules match what `eslint.config.mjs` enforces, everywhere, with colon-separated tags.

## Context

* Decisions on <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> (2026-10-31): lint is the source of truth; colons; correct the house; same-type dependencies allowed.
* Eventiva `docs/learnings/module-boundaries.md` says extensions cannot import `type:database` at runtime, but lint allows it (`type:extension` may depend on `type:core`, `type:shared`, `type:extension`, `type:database`). The doc's tag list omits `type:shared`.
* Resnovas/.github `templates/.agents/skills/coding-preferences/references/architecture.md` spells tags `type_core` etc.; it is synced to every repository, so change the template and render (`npm run render`, `npm test`, `npm run check` in Resnovas/.github).
* `docs/REPO_STRUCTURE.md` has stale layout and Zephyr guidance; the house UI reference says no Zephyr.

## Work

1. In Eventiva: rewrite the type rules table, examples and invalid list in `module-boundaries.md` to match lint exactly; add `type:shared`; note that schema helpers are why extensions may import database packages and that <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> D6 will narrow this.
2. Remove Zephyr and stale layout from `docs/REPO_STRUCTURE.md`, matching the current `packages/` tree.
3. In Resnovas/.github: change underscores to colons in the architecture reference template, render, test, check.
4. Add an Nx cycle check to the gate if one is not present (`nx graph` based or `import/no-cycle`), and report whether any cycle exists today; file an issue only if one does.

## Acceptance

A reviewer can read the doc and predict every lint result; `rg "type_core|layer_backend" ` returns nothing in both repositories after render.

## Done signal

Both changes landed per each repository's delivery rule; comment with commands and output.

## Linear comments (1)

### Comment 7ae4bfd8-d5b9-49c5-9ad3-44ecd879f0cb

Author: GitHub. Created: 2026-10-31T21:49:36.871Z; updated: 2026-10-31T21:49:36.833Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-22/correct-boundary-docs-to-match-lint-use-colon-tags-and-fix-the-house) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/789). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
