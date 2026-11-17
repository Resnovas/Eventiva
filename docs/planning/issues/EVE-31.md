<!-- linear:generated:start -->
# EVE-31: Port voice input and transcription for the agent

[Live Linear source](https://linear.app/resnovas/issue/EVE-31/port-voice-input-and-transcription-for-the-agent) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:31.258Z. Generated source mirror; edit Linear and refresh, not this region.

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
| Blocks | None recorded |
| Related to | [EVE-14](EVE-14.md), [EVE-15](EVE-15.md), [EVE-20](EVE-20.md), [EVE-65](EVE-65.md), [EVE-95](EVE-95.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Crew and staff can talk to Eventiva hands-free (on site, in a vehicle) and have speech turned into text and agent actions, with event-specific vocabulary recognised.

## Upstream reference (pinned tag from <issue id="cc5eba91-a4f7-4542-b332-10d3e1d70ed8" label="EVE-15" href="https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol" />)

* `voice/` (4 files): voice context packs (custom terms and replacements), cleanup prompt.
* `transcription/builder-transcription.ts`: transcription through Builder's hosted service (not reusable; vendor-specific).

## Eventiva form

* `voice` extension: action `voice.transcribe` and a push-to-talk control in Rambo-UI; transcription provider is a neutral service with AI SDK transcription Layers; on-device speech recognition where the platform offers it, so short commands work offline.
* Context packs built from the current event (artist names, venues, kit names) to improve recognition.
* Transcripts follow the same consent, retention and redaction rules as other telemetry; audio is not stored unless the user opts in.

## Acceptance

A spoken "assign van 3 to the load-in crew" produces the same action as tapping it, with confirmation; offline short commands work on device; audio is not retained by default.

## Depends on

<issue id="07c58289-6f1c-488e-a130-5f718b473fce" label="EVE-14" href="https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory" />, <issue id="a904aa60-b3c7-4bfa-8d2d-995d1e679389" label="EVE-20" href="https://linear.app/resnovas/issue/EVE-20/s7-find-which-ai-providers-allow-users-to-bring-their-own-subscription" /> (providers), agent loop.

## Out of scope

Phone-call agents; live radio integration (belongs to live-ops scope).

## Linear comments (1)

### Comment f4673424-4a3e-46f7-8144-f161521a3f16

Author: GitHub. Created: 2026-10-31T21:59:13.853Z; updated: 2026-10-31T21:59:13.060Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-31/port-voice-input-and-transcription-for-the-agent) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/798). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
