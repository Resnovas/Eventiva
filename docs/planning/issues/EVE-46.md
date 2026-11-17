<!-- linear:generated:start -->
# EVE-46: P1.7 Build the HTTP API, streaming and the typed client from the action inventory

[Live Linear source](https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-17T06:20:02.941Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Audit needed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-113](EVE-113.md), [EVE-126](EVE-126.md), [EVE-132](EVE-132.md), [EVE-140](EVE-140.md), [EVE-162](EVE-162.md), [EVE-174](EVE-174.md), [EVE-175](EVE-175.md), [EVE-205](EVE-205.md), [EVE-219](EVE-219.md), [EVE-221](EVE-221.md), [EVE-230](EVE-230.md) |
| Related to | [EVE-43](EVE-43.md), [EVE-61](EVE-61.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-64](EVE-64.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-68](EVE-68.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-137](EVE-137.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Every action is callable over HTTP with OpenAPI output, agent chat streams over the same server, and front ends get a typed client generated from the inventory.

## Context

* Phase-1 step 7 of the S2 capability map. Upstream reference at 6b5cf68: `server/` (action-routes, action-batch, short-lived tokens, agent chat SSE) and `agent-native/` (createAgentNativeClient). Decided D2: Eventiva owns the server on Effect HTTP.

## Scope

1. `@effect/platform` HttpApi built from the inventory: one route per action, batch route, OpenAPI document.
2. Auth: session for people, short-lived tokens and service principals for machines, all resolving to a principal for P1.4.
3. Streaming endpoint for agent turns using the AI SDK UI message stream format over Effect HttpServer.
4. Typed client (Effect RPC or HttpApi client) usable from React Native and web, with offline queueing left to S4's engine.

## Acceptance criteria

* Contract test: every inventory action has a route and appears in OpenAPI.
* A stream test receives text, tool call and tool result parts in order and can be cancelled mid-turn (fiber interruption).
* The client compiles in the React Native app package.

## Constraints

Effect-TS v3; no Nitro or h3; no new dependency without approval here; ship to main with check results.

## Done signal

Merged with the contract and stream tests green.

## Session identifier versus authentication proof — acceptance requirement (2026-11-17)

A `SessionId` UUID is a non-secret correlation identifier, never a credential or bearer capability. Knowing or supplying a session UUID must grant no access. Every externally reachable caller must prove possession of a separately protected credential (for example a verified short-lived token, signed service assertion or equivalent approved mechanism); trusted identity resolution then maps that proof to the subject and session before Eventiva authorization runs.

The fixed `shellCaller` / `ShellIdentity` UUID in `apps/server/src/access.ts` is permitted only inside the current non-networked registration diagnostic. Replace or isolate that exact-value resolver before any HTTP, RPC, agent or other untrusted transport can invoke it. Acceptance tests must prove that a copied/guessed SessionId without valid credential proof is denied, expired/revoked proof is denied, and authenticated identity still receives only Eventiva-owned tenant membership and action permissions. Session IDs may appear in source, traces or logs only under the normal correlation/redaction policy; credentials, tokens and proof material must never do so.

## Linear comments (1)

### Comment cededea5-a1b6-4596-8659-456d7a696c33

Author: GitHub. Created: 2026-10-31T22:31:34.242Z; updated: 2026-10-31T22:31:34.201Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/813). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
