<!-- linear:generated:start -->
# EVE-75: F5.1 Build the listing model, category taxonomy and listing actions

[Live Linear source](https://linear.app/resnovas/issue/EVE-75/f51-build-the-listing-model-category-taxonomy-and-listing-actions) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:30.143Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Code, Decision: Confirmed, Delivery: Implementation pending, Feature |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-66](EVE-66.md) |
| Children | None recorded |
| Blocked by | [EVE-25](EVE-25.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md) |
| Blocks | [EVE-77](EVE-77.md), [EVE-78](EVE-78.md), [EVE-79](EVE-79.md), [EVE-119](EVE-119.md), [EVE-161](EVE-161.md) |
| Related to | [EVE-28](EVE-28.md), [EVE-51](EVE-51.md), [EVE-73](EVE-73.md), [EVE-236](EVE-236.md), [EVE-250](EVE-250.md), [EVE-251](EVE-251.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Proposed (2026-11-01), part of <issue id="b22fbb0d-100b-47a3-8c32-eeacadc4c9fe" label="EVE-66" href="https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings" /> (F5 Directory and marketplace).

## Goal

A vendor, venue or professional tenant can create and maintain a structured listing (profile, spaces, offerings, media, service area) through actions that people and agents call the same way.

## Context

* [EVE-66](<https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings>) sections 4, 5 and 9 define the actions, entities and permissions; this issue builds the listing half of them.
* Storage, state machines and tenant guards come from [EVE-42](<https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state>); actions from [EVE-40](<https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema>); permissions and audit from [EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>); files from [EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>).
* Decision D5-1 (b), chosen 2026-11-08: listings are tenant-owned, and unclaimed seeded listings also exist. This issue adds the ownership (claimed, unclaimed), seededBy, seedSource and lastCheckedAt columns and the platform directory scope so F5.13 (<issue id="0c66a703-79d5-407a-a0c0-69ab5efdc31b" label="EVE-236" href="https://linear.app/resnovas/issue/EVE-236/f513-build-seeded-listings-claiming-claim-disputes-and-removal" />) can build seeding and claiming on top; Listing ids must never change on an ownership transfer.
* F1 (<issue id="fbcff205-decd-464a-b8ab-a1278e71fbe4" label="EVE-73" href="https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show" /> section 5) points at F5 by id: Event.venue_ref is a Listing id of kind venue, and F1 Space carries an optional venue_room_ref to a VenueRoom. Keep both ids stable; never delete a referenced VenueRoom, archive it.

## Scope

1. A `directory` extension package with Drizzle tables for Listing, VenueRoom (named so it does not clash with the per-event F1 Space), Offering, ProfessionalProfile, MediaItem, ServiceArea and Category (versioned taxonomy with localised labels per [EVE-28](<https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent>) conventions), on Postgres and SQLite.
2. Listing status state machine: draft, pending verification, published, unpublished, suspended, archived. Only F5.3 moves a listing to published or suspended; this issue exposes the transitions as typed errors when blocked.
3. Actions: `directory.listing.create`, `.update`, `.archive`, `directory.venueRoom.upsert`, `.remove`, `directory.offering.upsert`, `.remove`, `directory.media.attach`, `.detach`, `directory.serviceArea.set`, `directory.category.manage`, with permissions listing:write and platform:taxonomy, approvals as in [EVE-66](<https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings>) section 4.
4. Validation in Effect Schema: alt text required on media; capacities are non-negative integers per layout; price from with ISO 4217 currency; venue-only fields rejected on other kinds; accessible-facility fields are enumerations.
5. A public projection schema (`ListingPublic`) that strips private fields (internal notes, contact settings) for use by F5.4 and F5.5.
6. Offline: listings and children sync to the publisher's devices; per-field last-writer-wins with version check; the description field is a Yjs text document embedded in the record via [EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>).
7. A seed taxonomy covering production disciplines (lighting, rigging, sound, staging, video and screens, power, staffing, catering, venues by type, transport, security, medical).

## Acceptance criteria

* `@effect/vitest` tests for every action: happy path, permission denied, invalid input, wrong kind fields rejected, tenant isolation (tenant B cannot update tenant A's listing).
* Each action has one audit row per call and appears in the action inventory parity check.
* Two devices edit the same listing offline (one the name, one the description) and converge after reconnect with both edits kept.
* The public projection never contains a field marked private (schema test).

## Constraints

Effect-TS v3 house rules; no zod; flag `directory-marketplace` default off; no new dependency without Jonathan approving it on this issue; ships to main per the AGENTS.md delivery exception with `node --run check` results pasted here; people docs and ai-docs updated in the same commit.

## Done signal

Merged to main with tests green, and a comment here listing the actions and tables.

## Blockers

<issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />, <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" />, <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />, <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" /> (media), <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" /> for the shared description text (the rest can ship before it).

## Linear comments (1)

### Comment 139d943c-3d43-424b-8f69-b10e122d22f8

Author: GitHub. Created: 2026-11-01T13:06:53.361Z; updated: 2026-11-01T13:06:53.312Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-75/f51-build-the-listing-model-category-taxonomy-and-listing-actions) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/842). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
