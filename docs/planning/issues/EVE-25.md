<!-- linear:generated:start -->
# EVE-25: Port files, private attachments, artifacts and document import

[Live Linear source](https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:10.734Z. Generated source mirror; edit Linear and refresh, not this region.

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
| Blocks | [EVE-70](EVE-70.md), [EVE-75](EVE-75.md), [EVE-88](EVE-88.md), [EVE-92](EVE-92.md), [EVE-99](EVE-99.md), [EVE-116](EVE-116.md), [EVE-117](EVE-117.md), [EVE-118](EVE-118.md), [EVE-121](EVE-121.md), [EVE-126](EVE-126.md), [EVE-127](EVE-127.md), [EVE-135](EVE-135.md), [EVE-146](EVE-146.md), [EVE-150](EVE-150.md), [EVE-151](EVE-151.md), [EVE-154](EVE-154.md), [EVE-156](EVE-156.md), [EVE-159](EVE-159.md), [EVE-167](EVE-167.md), [EVE-173](EVE-173.md), [EVE-193](EVE-193.md), [EVE-195](EVE-195.md), [EVE-199](EVE-199.md), [EVE-201](EVE-201.md), [EVE-203](EVE-203.md), [EVE-210](EVE-210.md), [EVE-214](EVE-214.md) |
| Related to | [EVE-14](EVE-14.md), [EVE-15](EVE-15.md), [EVE-17](EVE-17.md), [EVE-61](EVE-61.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-76](EVE-76.md), [EVE-77](EVE-77.md), [EVE-80](EVE-80.md), [EVE-81](EVE-81.md), [EVE-94](EVE-94.md), [EVE-105](EVE-105.md), [EVE-106](EVE-106.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-110](EVE-110.md), [EVE-111](EVE-111.md), [EVE-119](EVE-119.md), [EVE-133](EVE-133.md), [EVE-147](EVE-147.md), [EVE-175](EVE-175.md), [EVE-179](EVE-179.md), [EVE-208](EVE-208.md), [EVE-217](EVE-217.md), [EVE-224](EVE-224.md), [EVE-225](EVE-225.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Users and agents upload, store, attach and import files (images, PDFs, Office, Notion, Figma), with private files encrypted and every access checked, and agent-produced outputs kept as first-class artifacts.

## Upstream reference (pinned tag from <issue id="cc5eba91-a4f7-4542-b332-10d3e1d70ed8" label="EVE-15" href="https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol" />)

* `file-upload/` (18 files): upload registry, S3 client, attachment bytes and text extraction, inline image downscaling, size limits, owned attachments.
* `private-blob/` (8 files): encrypted private blobs (`blob-crypto.ts`), attachment references, S3 private storage.
* `artifacts/detect.ts`: detects agent outputs that should become artifacts.
* `ingestion/` (13 files): import from docx, pptx, spreadsheets, Office, Notion, Figma (nodes to HTML), media; orchestration and selection.

## Eventiva form

* `files` extension: actions `files.upload.begin`, `files.upload.complete`, `files.get`, `files.delete`, `files.attach`, `files.detach`; every read is an authorized action, never a public URL by default (short-lived signed URLs only).
* `BlobStore` neutral service; S3-compatible Layer (works with R2, S3, MinIO) in an integration package; envelope encryption for private blobs with keys from the secret store.
* Offline: files queued locally (SQLite metadata plus local file cache) and uploaded on reconnect; same queue as S4 sync.
* `ingestion` as separate integration packages per source (office, notion, figma), each turning a source into text plus structure the agent can read.
* Artifacts: agent outputs saved as versioned files linked to the run and the record they belong to.

## Acceptance

Upload offline on mobile, reconnect, file appears for another user with permission and is refused for one without; a private blob is unreadable in storage without the key; a docx imports to readable text the agent can quote; deleting the record removes or orphans attachments per a written rule.

## Depends on

<issue id="07c58289-6f1c-488e-a130-5f718b473fce" label="EVE-14" href="https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory" />, <issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" /> (sync queue).

## Out of scope

Video transcoding; a public CDN.

## Linear comments (1)

### Comment 09e1a2c5-acfb-4d6d-84f6-b440a13bb5d9

Author: GitHub. Created: 2026-10-31T21:59:02.470Z; updated: 2026-10-31T21:59:02.451Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/792). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
