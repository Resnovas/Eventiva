<!-- linear:generated:start -->
# EVE-79: F5.4 Build directory search, filters, geo radius and transparent ranking

[Live Linear source](https://linear.app/resnovas/issue/EVE-79/f54-build-directory-search-filters-geo-radius-and-transparent-ranking) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:25.369Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Code, Decision: Confirmed, Delivery: Implementation pending, Feature |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-66](EVE-66.md) |
| Children | None recorded |
| Blocked by | [EVE-26](EVE-26.md), [EVE-45](EVE-45.md), [EVE-75](EVE-75.md) |
| Blocks | [EVE-113](EVE-113.md), [EVE-115](EVE-115.md), [EVE-164](EVE-164.md), [EVE-165](EVE-165.md) |
| Related to | None recorded |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Proposed (2026-11-01), part of <issue id="b22fbb0d-100b-47a3-8c32-eeacadc4c9fe" label="EVE-66" href="https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings" /> (F5 Directory and marketplace).

## Goal

Organisers and anonymous visitors find the right supplier by text, category, location, date, capacity and budget, and can see why results are ranked as they are.

## Context

* <issue id="b22fbb0d-100b-47a3-8c32-eeacadc4c9fe" label="EVE-66" href="https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings" /> sections 4 (`directory.search`, `directory.listing.get`), 8 and 11 (P2B ranking transparency).
* Text and semantic search come from the <issue id="2cd1c920-450c-487e-b4c8-e860a382a6b0" label="EVE-26" href="https://linear.app/resnovas/issue/EVE-26/port-search-and-embeddings-across-every-resource" /> search port (Postgres full text plus vectors).
* Decision D5-4 default: PostGIS on Neon for radius and polygon service areas. PostGIS on Neon was approved by Jonathan on 2026-11-08 (decision card on <issue id="b22fbb0d-100b-47a3-8c32-eeacadc4c9fe" label="EVE-66" href="https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings" />, D5-4 a), so it may be enabled for this issue.

## Scope

1. A search read model fed from the change feed (<issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" />) with published `ListingPublic` rows only.
2. `directory.search` input: query text, kind, categories, location (point or place resolved by a `Geocoder` port), radius, date range, capacity per layout, budget ceiling, sort (relevance, distance, rating, response time), cursor. Output: ListingSummary page plus a ranking explanation per result (matched terms, distance, rating, response time weight).
3. Ranking formula documented and published as the "main ranking parameters" page; no paid boosts, commission never used as a ranking input (F5.14), and an unclaimed listing ranks below a claimed one at equal relevance (F5.13); all three are stated on the page.
4. Service area matching: a listing appears when the search point lies inside its service area, or within radius of its point.
5. Search screen per <issue id="b22fbb0d-100b-47a3-8c32-eeacadc4c9fe" label="EVE-66" href="https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings" /> section 6 with list and map toggle, projection with result ids, ranks and reasons.
6. Offline: last result pages cached read-only with a "results from <time>" banner; search itself requires connectivity and says so.
7. Anonymous access with rate limiting.

## Acceptance criteria

* Fixture of 200 listings: category, radius, capacity and budget filters each have a test; results outside a service area never appear.
* The ranking explanation matches the documented formula in a property test.
* p95 under 300 ms for the fixture on the CI database (recorded).
* The agent answers "why is this first" from the projection.

## Constraints

Effect-TS v3; PostGIS approved; no geocoding vendor until Jonathan approves on this issue; flag `directory-marketplace`; ships to main with `node --run check` results pasted here.

## Done signal

Merged with tests and the performance number recorded here, and the ranking page committed to the people docs.

## Blockers

F5.1, <issue id="2cd1c920-450c-487e-b4c8-e860a382a6b0" label="EVE-26" href="https://linear.app/resnovas/issue/EVE-26/port-search-and-embeddings-across-every-resource" /> (search port), <issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" /> (change feed), decision D5-4.

## Linear comments (1)

### Comment 67f09eb9-3fc1-44b6-84e2-14b47269d2bc

Author: GitHub. Created: 2026-11-01T13:06:58.851Z; updated: 2026-11-01T13:06:58.813Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-79/f54-build-directory-search-filters-geo-radius-and-transparent-ranking) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/846). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
