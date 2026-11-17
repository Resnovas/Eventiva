<!-- linear:generated:start -->
# EVE-30: Port data widgets, saved dashboards and brand kits

[Live Linear source](https://linear.app/resnovas/issue/EVE-30/port-data-widgets-saved-dashboards-and-brand-kits) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:20.690Z. Generated source mirror; edit Linear and refresh, not this region.

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
| Blocks | [EVE-101](EVE-101.md), [EVE-159](EVE-159.md), [EVE-164](EVE-164.md), [EVE-195](EVE-195.md), [EVE-196](EVE-196.md), [EVE-222](EVE-222.md), [EVE-227](EVE-227.md), [EVE-234](EVE-234.md) |
| Related to | [EVE-14](EVE-14.md), [EVE-15](EVE-15.md), [EVE-65](EVE-65.md), [EVE-69](EVE-69.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-168](EVE-168.md), [EVE-219](EVE-219.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

The agent and the user can show data as tables, charts and insight cards inline in chat or on screens, save them to dashboards, and style output with each organisation's brand.

## Upstream reference (pinned tag from <issue id="cc5eba91-a4f7-4542-b332-10d3e1d70ed8" label="EVE-15" href="https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol" />)

* `data-widgets/index.ts`: widget kinds `data-table`, `data-chart`, `data-insights` with typed columns, rows, truncation.
* `action-ui.ts` renderers (`core.data-table`, `core.data-chart`, `core.data-insights`, `core.record-change`).
* `dashboard-storage/` (4 files): saved dashboards with panel sources.
* `brand-kit/` (5 files): brand tokens, brand signals, Figma import.

## Eventiva form

* Widget kinds as Effect Schema in core-contracts; Rambo-UI renders them on web, iOS, Android; an action result may carry a widget so the agent can show what it found.
* `dashboards` extension: actions `dashboards.create`, `dashboards.addPanel`, `dashboards.update`, `dashboards.share`; a panel stores the query action and its input, never a data snapshot, so it re-runs under the viewer's permissions.
* `brand-kit` extension: organisation design tokens (colours, type, logo) feeding Rambo-UI theming and generated documents.

## Acceptance

Ask the agent for ticket sales by day and get a chart; save it to a dashboard; a colleague with less access sees only their permitted data in the same panel; switching brand kit restyles the dashboard.

## Depends on

<issue id="07c58289-6f1c-488e-a130-5f718b473fce" label="EVE-14" href="https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory" />, Rambo-UI base components.

## Out of scope

The visual website builder (separate product scope).

## Linear comments (1)

### Comment e2c1b2b6-0e9a-4a56-bd09-bf2fbb87cbc5

Author: GitHub. Created: 2026-10-31T21:59:11.308Z; updated: 2026-10-31T21:59:11.272Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-30/port-data-widgets-saved-dashboards-and-brand-kits) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/797). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
