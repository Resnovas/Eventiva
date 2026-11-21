# No inline comments: the comment ratchet

Since 2026-11-21 ([ADR-0001](../../../docs/adr/0001-no-inline-comments-and-ratchet.md)) first-party JavaScript and TypeScript carries no inline (`//`) or block (`/* */`) comments. `eventiva/no-inline-comments` in `eslint.config.mjs` reports them, and `node tools/comments/ratchet.mjs --base HEAD` (part of `node --run check`) holds each legacy file to its count in `tools/comments/ratchet.json`. Counts may only fall.

Kept: licence headers, attached JSDoc (`/** ... */`), `// effect-boundary: <reason>` markers, `// @ts-expect-error` in tests, shebangs and files synced from `Resnovas/.github`.

Instead of a comment: delete a tautology or stale note, fix the hack an excuse describes (file an issue and add a lint rule with `correction-to-lint`), move a decision into `docs/adr/`, or document the callable contract in its JSDoc.

To pay down the ratchet, run `/delete-comment` on a directory. After classifying and recording, `node tools/comments/ratchet.mjs --strip <paths>` deletes the remaining comments and `--update` tightens the ledger in the same commit.

```ts
/** Return the tenant's open invoices; never includes drafts. */
export const openInvoices = (invoices: ReadonlyArray<{ readonly status: string }>) =>
    invoices.filter((invoice) => invoice.status === 'open');
```
