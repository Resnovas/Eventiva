<!-- linear:generated:start -->
# EVE-77: F5.2 Build the listing editor screens for vendors, venues and professionals

[Live Linear source](https://linear.app/resnovas/issue/EVE-77/f52-build-the-listing-editor-screens-for-vendors-venues-and) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:27.315Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Code, Decision: Confirmed, Delivery: Implementation pending, Feature |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-66](EVE-66.md) |
| Children | None recorded |
| Blocked by | [EVE-16](EVE-16.md), [EVE-50](EVE-50.md), [EVE-75](EVE-75.md) |
| Blocks | None recorded |
| Related to | [EVE-25](EVE-25.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Proposed (2026-11-01), part of <issue id="b22fbb0d-100b-47a3-8c32-eeacadc4c9fe" label="EVE-66" href="https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings" /> (F5 Directory and marketplace).

## Goal

A vendor builds and previews their listing on phone, desktop or web, and the agent sees and can operate every part of the editor.

## Context

* <issue id="b22fbb0d-100b-47a3-8c32-eeacadc4c9fe" label="EVE-66" href="https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings" /> section 6 (Listing editor row) lists the screen, components, projection and controls.
* Actions come from F5.1. Screen awareness rules from <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />: every control binds to an action id, every screen declares a projection.
* UI comes from Rambo-UI (D8); no local component library.

## Scope

1. Listing editor screen with sections: profile, venue rooms (venue), offerings, professional profile (professional), media manager, service area, preview.
2. Venue room editor with a capacity-per-layout grid, rigging and power fields, accessibility checklist and floor plan upload.
3. Offering editor with unit and price from, inclusions list.
4. Media manager: upload via [EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>), reorder, required alt text with an inline error.
5. Service area: point plus radius input with a map preview (map rendering from the F10 stack; if F10 is not built, a plain address and radius form ships first).
6. Preview that renders the `ListingPublic` projection exactly as F5.5 will.
7. Publish blockers panel listing what stops publishing (missing verification, missing alt text, no category), each item a navigation action.
8. Screen-context projection: listing id, active section, dirty fields, publish blockers, selected venue room or offering.
9. Offline: edits work offline and show a pending-sync badge.

## Acceptance criteria

* Every interactive element is bound; the unbound-element check from [EVE-50](<https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen>) passes, and a fixture with an unbound button fails.
* The agent answers "what is missing before I can publish" from the projection and fixes a missing alt text by calling `directory.media.attach` with the same result as the UI.
* WCAG 2.2 AA: axe or Lighthouse run on the web build recorded here; keyboard-only completion of the venue room editor.
* Verified on web and Android (record commands and device).

## Constraints

Effect-TS v3 for anything with IO; Rambo-UI components only; whitelabel ASCII copy; flag `directory-marketplace`; no new dependency without Jonathan approving it on this issue; ships to main with `node --run check` results pasted here.

## Done signal

Merged with web and Android checks recorded and an accessibility report attached.

## Blockers

F5.1, <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" /> (screen awareness), <issue id="a7a66a5c-e747-4245-bc84-3232ef65a16c" label="EVE-16" href="https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web" /> (Expo stack).

## Linear comments (1)

### Comment 88fb6a29-7abf-41f9-bcde-358b5a409a2e

Author: GitHub. Created: 2026-11-01T13:06:55.134Z; updated: 2026-11-01T13:06:55.099Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-77/f52-build-the-listing-editor-screens-for-vendors-venues-and) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/844). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
