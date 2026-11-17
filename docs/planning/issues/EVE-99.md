<!-- linear:generated:start -->
# EVE-99: F4.4 Find and merge duplicate contacts, and import and export them

[Live Linear source](https://linear.app/resnovas/issue/EVE-99/f44-find-and-merge-duplicate-contacts-and-import-and-export-them) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:07.141Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Outstanding, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-65](EVE-65.md) |
| Children | None recorded |
| Blocked by | [EVE-25](EVE-25.md), [EVE-54](EVE-54.md), [EVE-68](EVE-68.md) |
| Blocks | [EVE-105](EVE-105.md), [EVE-144](EVE-144.md) |
| Related to | [EVE-41](EVE-41.md), [EVE-69](EVE-69.md), [EVE-73](EVE-73.md), [EVE-80](EVE-80.md), [EVE-98](EVE-98.md), [EVE-126](EVE-126.md), [EVE-166](EVE-166.md), [EVE-167](EVE-167.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

A tenant can bring its existing contacts in from a file without creating duplicates, merge the duplicates that do exist safely, and take its data out again.

## Context

* Parent <issue id="ad791a38-f528-4aec-9433-c36977bbe8e2" label="EVE-65" href="https://linear.app/resnovas/issue/EVE-65/f4-contacts-and-crm-people-organisations-relationships-and-history" /> sections 4 (duplicate, merge, import, export actions), 7 and decision D5 (suggest, merge on confirm, unmerge; recommended).
* Files come through <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" />; long imports run as durable jobs (<issue id="a626308a-598f-41ba-accd-4004cbbd9932" label="EVE-54" href="https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow" />).
* Merge must rewrite references owned by other sets (EventRole, Task (F3), orders, invoices), so it uses a `PartyReferenceOwner` contract each set registers.

## Scope

1. Duplicate scoring: exact email or phone (normalised E.164), then name similarity plus shared organisation or domain. Pure function, unit tested; thresholds in tenant settings (<issue id="9d08c369-bac9-4eb7-b8a7-329b5ec9bff0" label="EVE-41" href="https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials" />), defaults suggest at 0.8.
2. Actions `crm.duplicate.find`, `crm.duplicate.dismiss`, `crm.party.merge` (confirm), `crm.party.unmerge` (within 30 days), `crm.import.start`, `crm.import.preview`, `crm.import.commit` (confirm), `crm.export.run` (confirm).
3. Merge record with field choices and reference rewrites; unmerge replays it in reverse. Merged parties keep `merged_into` so old links resolve.
4. Import formats: CSV with column mapping and vCard 3 and 4, written in-house (no library without approval here). Preview shows creates, updates and duplicate candidates before commit.
5. Export: CSV and vCard, filtered, as a file in <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" />, logged in audit.
6. Screens: Duplicates review, Import wizard; merge and export are online only and disabled offline with the reason.

## Acceptance criteria

* Tests: merge moves every registered reference and unmerge restores it; merging across tenants is impossible; an import of 1,000 rows with 50 known duplicates creates 950 and suggests 50; an import interrupted mid-job resumes without double creates.
* The agent proposes duplicates after an import and merges a pair only after the user confirms.
* `node --run check` green.

## Constraints

Effect-TS v3; merge and import run on the server only; no new dependency without approval here; ship to main with check results.

## Done signal

Merged with tests green, the `PartyReferenceOwner` contract documented for other sets, and the 1,000 row import evidence pasted here.

## Blockers

<issue id="d71c315c-52d0-4e04-b37a-88b4e1db7827" label="EVE-68" href="https://linear.app/resnovas/issue/EVE-68/f41-build-people-organisations-and-contact-points-as-crm-actions" /> (F4.1), <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" />, <issue id="a626308a-598f-41ba-accd-4004cbbd9932" label="EVE-54" href="https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow" />.

## Linear comments (1)

### Comment 2695482f-bc82-4e49-973c-1b34b081af86

Author: GitHub. Created: 2026-11-01T13:07:19.260Z; updated: 2026-11-01T13:07:19.228Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-99/f44-find-and-merge-duplicate-contacts-and-import-and-export-them) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/866). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
