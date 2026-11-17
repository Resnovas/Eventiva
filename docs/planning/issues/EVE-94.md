<!-- linear:generated:start -->
# EVE-94: F7.1 Build the vehicle register: vehicles, types and documents

[Live Linear source](https://linear.app/resnovas/issue/EVE-94/f71-build-the-vehicle-register-vehicles-types-and-documents) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:57:38.166Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Audit needed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-71](EVE-71.md) |
| Children | None recorded |
| Blocked by | [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-50](EVE-50.md) |
| Blocks | None recorded |
| Related to | [EVE-25](EVE-25.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

A fleet manager, or the agent on their behalf, can register every owned, hired or lent vehicle with its type and legal documents, and see at a glance which vehicles are on road and which documents expire soon.

## Context

* Parent: [EVE-71](<https://linear.app/resnovas/issue/EVE-71>) sections 4 (fleet.vehicle.*, fleet.vehicleType.define, fleet.document.*), 5 (Vehicle, VehicleType, VehicleDocument) and 6 (Fleet list, Vehicle detail, Fleet settings).
* Owner organisation of a hired vehicle is an F4 Organisation, referenced by id.
* Documents are files from [EVE-25](<https://linear.app/resnovas/issue/EVE-25>); until it lands, store a file reference field and leave upload behind the same port.

## Scope

1. Fleet extension package with Effect Schema for Vehicle, VehicleType, VehicleDocument (Drizzle tables via the shared schema package, tenant-scoped).
2. Actions: `fleet.vehicle.create`, `update`, `archive`, `get`, `list` (filters: type, road status, base, ownership), `fleet.vehicleType.define`, `fleet.document.attach`, `fleet.document.expire`. Typed errors: DuplicateRegistration, VehicleNotFound, DocumentOverlap.
3. Document versions: attaching a new insurance document closes the previous one; nothing is overwritten.
4. Derived fields: `documentsExpiringWithin(days)` projection used by the list and by F7.12.
5. Screens: Fleet list, Vehicle detail (documents tab), Fleet settings (vehicle types), each with its screen-context projection and every control bound to an action.
6. Offline: vehicles and types readable offline; vehicle edits sync with per-field last writer wins.

## Acceptance criteria

* Create, update, archive and list work from UI, HTTP, MCP and the agent; parity check passes.
* Registering the same registration twice in one tenant returns DuplicateRegistration; the same registration in another tenant succeeds.
* A second insurance document closes the first; history shows both.
* A user of tenant A cannot read tenant B vehicles through any surface (negative test).
* The agent reads the Vehicle detail projection and reports the same expiry dates the screen shows.
* Offline edit of a vehicle name on two devices converges to the later write.

## Constraints

Effect-TS v3 house rules; no zod; Rambo-UI components; behind `eventiva-fleet`, default off; no new dependency without Jonathan approving it on this issue; tests with `@effect/vitest`; people and agent docs; graph refreshed; ships to main per the AGENTS.md delivery exception with `node --run check` results pasted here; whitelabel ASCII copy.

## Done signal

Merged to main behind the flag, tests green, a comment here listing the actions and a screenshot of the Fleet list.

## Blockers

[EVE-40](<https://linear.app/resnovas/issue/EVE-40>), [EVE-42](<https://linear.app/resnovas/issue/EVE-42>), [EVE-43](<https://linear.app/resnovas/issue/EVE-43>), [EVE-50](<https://linear.app/resnovas/issue/EVE-50>); soft: [EVE-25](<https://linear.app/resnovas/issue/EVE-25>) for uploads.

## Linear comments (1)

### Comment 0e7d02d1-0cd6-4b4f-8c04-2dbf1af62ec8

Author: GitHub. Created: 2026-11-01T13:07:16.374Z; updated: 2026-11-01T13:07:16.352Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-94/f71-build-the-vehicle-register-vehicles-types-and-documents) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/861). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
