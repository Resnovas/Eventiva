<!-- linear:generated:start -->
# EVE-78: F5.3 Build business verification, publishing and content moderation

[Live Linear source](https://linear.app/resnovas/issue/EVE-78/f53-build-business-verification-publishing-and-content-moderation) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:26.220Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Code, Decision: Confirmed, Delivery: Implementation pending, Feature |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-66](EVE-66.md) |
| Children | None recorded |
| Blocked by | [EVE-24](EVE-24.md), [EVE-43](EVE-43.md), [EVE-75](EVE-75.md) |
| Blocks | [EVE-113](EVE-113.md), [EVE-163](EVE-163.md), [EVE-236](EVE-236.md) |
| Related to | [EVE-13](EVE-13.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Proposed (2026-11-01), part of <issue id="b22fbb0d-100b-47a3-8c32-eeacadc4c9fe" label="EVE-66" href="https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings" /> (F5 Directory and marketplace).

## Goal

Only verified traders publish to the directory, anyone can report unlawful or misleading content, and every moderation decision is recorded with a statement of reasons.

## Context

* <issue id="b22fbb0d-100b-47a3-8c32-eeacadc4c9fe" label="EVE-66" href="https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings" /> section 11: trader traceability and notice and action (EU DSA, UK Online Safety Act where applicable), DMCC fake review rules.
* Verification is manual in v1 behind a `TraderVerifier` port so a registry lookup service can be added later without domain changes (<issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> no vendor coupling).
* Professionals are individuals: publishing their profile needs explicit consent (UK GDPR).

## Scope

1. VerificationCase entity and actions `directory.verification.request` (trader name, registered address, registration number, VAT number optional, contact, evidence files) and `directory.verification.decide` (platform:moderate).
2. `directory.listing.publish` and `.unpublish`: publish requires an approved verification for the tenant and, for professionals, a recorded consent; approval policy confirm.
3. ModerationCase entity and actions `directory.content.report` (signed-in, or anonymous through a `HumanCheck` port) and `directory.moderation.decide` with outcomes keep, edit request, remove, suspend listing, plus a mandatory statement of reasons sent to the affected tenant.
4. An appeal: the affected tenant can contest once; a second moderator decides.
5. Moderation queue screen (platform role) with projection and bound controls.
6. Notifications through <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> to the reporter and the affected tenant.
7. A platform role `moderator` in <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" /> that can read reported content only, never other private threads.

## Acceptance criteria

* A listing without approved verification cannot be published (typed error), and the agent gets the same error.
* A report creates a case, a decision sends the statement of reasons, and an appeal is decided by a different moderator (test enforces this).
* A moderator cannot read an unreported enquiry thread (negative test).
* Audit rows for every decision.

## Constraints

Effect-TS v3; manual verification only, no verification vendor without Jonathan approving it here; whitelabel copy; flag `directory-marketplace`; ships to main with `node --run check` results pasted here.

## Done signal

Merged with the tests green and the moderation policy text (people docs) committed.

## Blockers

F5.1, <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" /> (roles and approvals), <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> (notifications; in-app only until it lands).

## Linear comments (1)

### Comment de464248-94d2-45d4-b16f-d540eae56d2d

Author: GitHub. Created: 2026-11-01T13:06:56.872Z; updated: 2026-11-01T13:06:56.833Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-78/f53-build-business-verification-publishing-and-content-moderation) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/845). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
