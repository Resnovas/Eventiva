<!-- linear:generated:start -->
# EVE-26: Port search and embeddings across every resource

[Live Linear source](https://linear.app/resnovas/issue/EVE-26/port-search-and-embeddings-across-every-resource) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:13.246Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Code, Decision: Audit needed, Delivery: Implementation pending, Enhancement |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-79](EVE-79.md), [EVE-202](EVE-202.md) |
| Related to | [EVE-14](EVE-14.md), [EVE-15](EVE-15.md), [EVE-17](EVE-17.md), [EVE-20](EVE-20.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-64](EVE-64.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-69](EVE-69.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-102](EVE-102.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Users and agents search everything they are allowed to see (events, people, stock, files, comments) by keyword and by meaning, with results filtered by permission.

## Upstream reference (pinned tag from <issue id="cc5eba91-a4f7-4542-b332-10d3e1d70ed8" label="EVE-15" href="https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol" />)

* `search/` (7 files): index registry, indexer, tokenizer, query parser, vector tables per namespace and embedding size.
* `embeddings/index.ts`: picks the embedding provider family per organisation and handles unreadable credentials.
* `embedding` package and `search-utils/`.

## Eventiva form

* `search` extension: modules register searchable resources with a Schema-described projection; actions `search.query` (keyword plus semantic, filters, pagination) and `search.reindex` (admin).
* Postgres full-text plus `pgvector` on the server; on device, SQLite FTS5 for offline keyword search over synced data. Semantic search is online-only and says so offline.
* Embedding provider is a neutral service; provider Layers via AI SDK; organisation chooses; no silent fallback to Eventiva-paid embeddings (<issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> subscriptions rules).
* Permission filtering happens in the query, never after fetching.

## Acceptance

A user and an agent get identical results for the same query; a record the user cannot read never appears, including in counts; offline keyword search works on mobile; reindex after a schema change completes without downtime.

## Depends on

<issue id="07c58289-6f1c-488e-a130-5f718b473fce" label="EVE-14" href="https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory" />, <issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" />, <issue id="a904aa60-b3c7-4bfa-8d2d-995d1e679389" label="EVE-20" href="https://linear.app/resnovas/issue/EVE-20/s7-find-which-ai-providers-allow-users-to-bring-their-own-subscription" /> (provider rules).

## Out of scope

External web search.

## Linear comments (1)

### Comment b21eb388-c1a5-4a21-9487-e0733d784a67

Author: GitHub. Created: 2026-10-31T21:59:04.089Z; updated: 2026-10-31T21:59:04.060Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-26/port-search-and-embeddings-across-every-resource) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/793). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
