<!-- linear:generated:start -->
# EVE-32: Port settings, profiles, navigation, command menu and onboarding

[Live Linear source](https://linear.app/resnovas/issue/EVE-32/port-settings-profiles-navigation-command-menu-and-onboarding) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:33.594Z. Generated source mirror; edit Linear and refresh, not this region.

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
| Blocks | [EVE-148](EVE-148.md), [EVE-168](EVE-168.md), [EVE-182](EVE-182.md) |
| Related to | [EVE-14](EVE-14.md), [EVE-15](EVE-15.md), [EVE-23](EVE-23.md), [EVE-50](EVE-50.md), [EVE-80](EVE-80.md), [EVE-111](EVE-111.md), [EVE-133](EVE-133.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Users and organisations configure Eventiva, move around it and get started, with the agent able to read and change every setting the user can and navigate anywhere the user can.

## Upstream reference (pinned tag from <issue id="cc5eba91-a4f7-4542-b332-10d3e1d70ed8" label="EVE-15" href="https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol" />)

* `settings/` (6 files): user and org settings stores and handlers.
* `user-profile/` (4 files): profile actions and store.
* `navigation/` (2 files): settings routes and `describeSettingsViewForAgent`, so the agent knows the settings page it is on.
* `command-navigation/` (2 files): command-menu navigation actions.
* `onboarding/` (11 files): app profile, default first-run steps, step registry and status.

## Eventiva form

* Navigation and command menu are part of screen awareness, so build them with phase 1: `navigation.open` (any route the user may see) and a command menu listing every inventory action available on the current screen.
* `settings` extension: settings declared per module in Effect Schema with defaults and scope (user, team, organisation); actions `settings.get`, `settings.update`; settings screens generated from the Schema in Rambo-UI so new modules get a settings screen and agent access automatically. This is also the base for in-app customization.
* `profile` actions for name, avatar, locale, time zone, notification preferences.
* `onboarding` extension: modules register steps; progress is per user and organisation; the agent can walk a user through steps by running the same actions.

## Acceptance

The agent changes a setting the user can change and is refused one they cannot; a new module's Schema produces its settings screen with no extra UI code; the command menu lists exactly the actions the user may run on that screen.

## Depends on

<issue id="07c58289-6f1c-488e-a130-5f718b473fce" label="EVE-14" href="https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory" />, <issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />, Rambo-UI base components.

## Out of scope

Billing settings.

## Linear comments (1)

### Comment afa83e9d-2570-4800-a5c5-0f5317856f4b

Author: GitHub. Created: 2026-10-31T21:59:14.586Z; updated: 2026-10-31T21:59:14.540Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-32/port-settings-profiles-navigation-command-menu-and-onboarding) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/799). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
