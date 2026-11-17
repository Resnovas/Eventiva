<!-- linear:generated:start -->
# EVE-27: Port comments, mentions and review suggestions on any resource

[Live Linear source](https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:16.184Z. Generated source mirror; edit Linear and refresh, not this region.

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
| Blocks | [EVE-86](EVE-86.md), [EVE-150](EVE-150.md), [EVE-167](EVE-167.md), [EVE-200](EVE-200.md) |
| Related to | [EVE-14](EVE-14.md), [EVE-15](EVE-15.md), [EVE-17](EVE-17.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-185](EVE-185.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

People and agents comment on any record or document, mention others, and propose changes that a person accepts or rejects, so agent work can be reviewed before it lands.

## Upstream reference (pinned tag from <issue id="cc5eba91-a4f7-4542-b332-10d3e1d70ed8" label="EVE-15" href="https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol" />)

* `review/` (11 files): reviewable-resource registration (`ReviewableResourceRegistration`), threads, mentions, attachments, notifications, suggestions, thread delete, identity of the reviewer.
* `comments-review/` (stub).

## Eventiva form

* `review` extension: modules register reviewable resources; actions `comments.add`, `comments.resolve`, `comments.delete`, `suggestions.propose`, `suggestions.accept`, `suggestions.reject`.
* Suggestions are pending actions: accepting runs the original action with its stored input under the accepter's authority, so approval and audit come for free. This is also the approval path for agent runs that need human sign-off.
* Comments sync offline with the S4 engine; anchored comments on text and canvas use the document model's stable positions.
* Mentions trigger the notifications issue.

## Acceptance

An agent proposes a change to an event; a manager accepts it and the change is applied and audited as accepted-by-manager, proposed-by-agent; a viewer without edit rights can comment but cannot accept; an anchored comment survives concurrent text edits.

## Depends on

<issue id="07c58289-6f1c-488e-a130-5f718b473fce" label="EVE-14" href="https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory" />, <issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" />, notifications issue.

## Out of scope

Public comments from anonymous users.

## Linear comments (1)

### Comment 00af3850-a0e9-4d66-9f83-9b9deb860328

Author: GitHub. Created: 2026-10-31T21:59:05.569Z; updated: 2026-10-31T21:59:05.543Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/794). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
