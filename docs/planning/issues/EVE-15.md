<!-- linear:generated:start -->
# EVE-15: S2: Build the upstream Agent-Native capability map and protocol conformance matrix

[Live Linear source](https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:55.691Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Done (completed) |
| Priority | 0: No priority |
| Labels | Discussion, Product |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-26](EVE-26.md), [EVE-27](EVE-27.md), [EVE-28](EVE-28.md), [EVE-29](EVE-29.md), [EVE-30](EVE-30.md), [EVE-31](EVE-31.md), [EVE-32](EVE-32.md), [EVE-33](EVE-33.md), [EVE-76](EVE-76.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Produce the parity list for Eventiva's Effect-native agent framework: every upstream Agent-Native module and every connection method, with a verdict and evidence.

## Context

* Spec: <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> framework direction, Connections and execution methods, Screen awareness.
* First pass already exists in the planning doc section 7 ([https://claude.ai/artifact/QYamSdBsxTZSUKeDAUqMRb](<https://claude.ai/artifact/QYamSdBsxTZSUKeDAUqMRb>)); it was built from names and line counts only.
* Upstream: [https://github.com/BuilderIO/agent-native](<https://github.com/BuilderIO/agent-native>), pin to the newest release tag on the day you start and record it (first pass used commit a0356c6, `@agent-native/core` 0.222.2). MIT.

## Work

1. Clone upstream at the pinned tag. For each directory in `packages/core/src` and each package in `packages/`, read its entry points and exports, and record: purpose (one line), non-test lines, upstream dependencies, and a verdict: Build in Effect, Wrap, Later, or Not needed, with a one-line reason tied to an <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> decision.
2. Mark every module that takes part in screen awareness or UI-to-agent registration (application state, browser context, action UI, navigation, WebMCP). These are Build by default.
3. Conformance matrix for ACP, HTTP API, MCP, A2A, webhooks, CLI, WebMCP, schedules and events, streaming, cancellation and resumption. For each: inbound supported (yes/no + file), outbound supported (yes/no + file), the upstream test that proves it, and what Eventiva must add. ACP inbound and outbound are both required.
4. Order phase-1 rows into a dependency sequence.

## Acceptance

* Every upstream module and package appears exactly once (script the listing and include the count).
* Every Build row names the <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> requirement it satisfies.
* Every conformance cell cites a file path or says "not found" with the search used.

## Out of scope

Writing framework code. Upstream app templates.

## Done signal

Publish the map as a Linear document attached to this issue, replace section 7 of the planning doc with a link to it, and comment a short summary plus one action decision for Jonathan: approve the phase-1 list as-is, or the specific rows you would change.

## Escalation

If a required interface has no upstream implementation and no viable standard SDK, record it as a gap on <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> rather than inventing scope.

## Linear comments (3)

### Comment 38c440fa-a705-4e23-aa33-dc39d4984e91

Author: GitHub. Created: 2026-10-31T21:48:56.551Z; updated: 2026-10-31T21:48:56.526Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/782). All replies are displayed in both locations.


### Comment 5ce9da61-4401-40bd-a013-ee9e1f9f30e6

Author: jonathan@resnovas.com. Created: 2026-10-31T22:01:36.046Z; updated: 2026-10-31T22:01:36.017Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol) (comment ID above). Parent: None. Resolved: Not recorded.

S2 done. The map is attached to this issue as a Linear document: [S2: Agent-Native capability map and protocol conformance matrix](https://linear.app/resnovas/document/s2-agent-native-capability-map-and-protocol-conformance-matrix-9a000bdd8953). Section 7 of the planning doc now links to it.

**Pin:** tag `@agent-native/core@0.222.2`, commit `6b5cf68` (2026-10-29), the newest core tag on 2026-10-31.

**Coverage:** scripted listing, 126 rows (102 core directories, 1 core root-files row for the action contract, 23 packages), each exactly once. Build 46 (30 P1, 16 P2), Wrap 2, Later 38, Not needed 40. 9 screen-awareness rows, all Build or Later only where they sit outside the app.

**Main findings**

* ACP is outbound only upstream (`agent/harness/acp-adapter.ts`). Inbound is new scope, and the standard `@agentclientprotocol/sdk` 2.2.0 exports both `agent()` and `client()` on stdio, so both directions use one SDK. Upstream still uses the deprecated `@zed-industries/agent-client-protocol`.
* MCP inbound and outbound, the HTTP API, CLI, WebMCP, schedules and events are all present with tests. A2A is v0.3 with no push notifications or `tasks/resubscribe`. Outbound webhooks are unsigned. MCP has no cancellation handling.
* Upstream depends on Sentry, LaunchDarkly and Builder transcription. These are marked Not needed under D4.

**Decision for Jonathan:** approve the phase-1 list as written. That is 29 Build rows and 2 Wrap rows in the 12-step order in the document, plus a new ACP inbound module at step 10. I would not change any rows. The one item that could shift the order is the Effect version check, which I have recorded on EVE-13 for S1.

Generator scripts and the rendered markdown: project files `eve-15/` (scan.sh, v.mjs, gen.mjs, doc.md).


### Comment 2fc6a52d-5aa6-42cb-8e66-6b26c3db86e4

Author: jonathan@resnovas.com. Created: 2026-11-01T12:44:07.553Z; updated: 2026-11-01T12:44:07.533Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol) (comment ID above). Parent: None. Resolved: Not recorded.

Decision (Jonathan, 2026-11-01): the phase-1 list is approved. One change to the order: screen awareness moves ahead of MCP and ACP inbound. The new order is step 9 screen awareness, step 10 MCP inbound, step 11 ACP inbound and step 12 collaboration. Steps 1 to 8 stay as they were. The map document has been updated to match.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
