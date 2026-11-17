<!-- linear:generated:start -->
# EVE-24: Port notifications, messaging channels and transactional email

[Live Linear source](https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:09.237Z. Generated source mirror; edit Linear and refresh, not this region.

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
| Blocks | [EVE-78](EVE-78.md), [EVE-89](EVE-89.md), [EVE-92](EVE-92.md), [EVE-105](EVE-105.md), [EVE-109](EVE-109.md), [EVE-117](EVE-117.md), [EVE-119](EVE-119.md), [EVE-121](EVE-121.md), [EVE-126](EVE-126.md), [EVE-131](EVE-131.md), [EVE-135](EVE-135.md), [EVE-136](EVE-136.md), [EVE-153](EVE-153.md), [EVE-169](EVE-169.md), [EVE-171](EVE-171.md), [EVE-175](EVE-175.md), [EVE-177](EVE-177.md), [EVE-179](EVE-179.md), [EVE-187](EVE-187.md), [EVE-194](EVE-194.md), [EVE-200](EVE-200.md), [EVE-214](EVE-214.md), [EVE-222](EVE-222.md), [EVE-225](EVE-225.md), [EVE-236](EVE-236.md), [EVE-239](EVE-239.md) |
| Related to | [EVE-14](EVE-14.md), [EVE-15](EVE-15.md), [EVE-61](EVE-61.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-138](EVE-138.md), [EVE-139](EVE-139.md), [EVE-141](EVE-141.md), [EVE-191](EVE-191.md), [EVE-196](EVE-196.md), [EVE-198](EVE-198.md), [EVE-219](EVE-219.md), [EVE-220](EVE-220.md), [EVE-235](EVE-235.md), [EVE-237](EVE-237.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Users and agents can reach people through in-app notifications, email and chat platforms (Slack, Microsoft Teams, Discord, Telegram, WhatsApp), and people can talk to the Eventiva agent from those channels, all through the same actions and permissions as the app.

## Upstream reference (pinned tag from <issue id="cc5eba91-a4f7-4542-b332-10d3e1d70ed8" label="EVE-15" href="https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol" />)

* `packages/core/src/notifications/` (7 files): notification store, registry of channels, routes; built-in in-app and email channels; `registerNotificationChannel()` for more.
* `packages/core/src/integrations/` (52 files, 28k lines): chat-platform adapters `adapters/{slack,microsoft-teams,discord,telegram,whatsapp,email,google-docs}.ts`, channel settings, awaiting-input store (agent pauses for a reply), proactive delivery, A2A continuations.
* `packages/core/src/email-catalog/` (9 files): registry of system email templates, authorization for sending, body redaction in logs, provider metrics.

## Eventiva form

* `notifications` extension: actions `notifications.send`, `notifications.list`, `notifications.markRead`, `notifications.preferences.update`; channel is an Effect service with one Layer per channel.
* `integrations.messaging-<platform>` packages, one per platform, each behind a neutral `MessagingChannel` service (send, receive webhook, verify signature). Inbound messages become agent runs under the linked user's identity and scopes; unlinked senders get nothing.
* `email` service with templates in Effect Schema, provider Layer swappable (no vendor in domain), bodies redacted in telemetry.
* Prefer the house Chat SDK where it covers a platform (house `ai.md`), wrapped at one Effect boundary.

## Work

1. Read the three upstream modules; list every action and setting they expose.
2. Build notifications plus the in-app and email channels first; then Slack and Microsoft Teams; then the rest in one issue each if large.
3. Webhook signature checks and replay protection for every inbound channel.
4. Screen: notification centre and channel settings built from Rambo-UI, with projections.

## Acceptance

An agent and a user each send the same notification through the same action; a Slack message to the bot starts an agent run as the linked user and is refused for an unlinked user; an email send is logged with the body redacted; flag off disables the feature.

## Depends on

<issue id="07c58289-6f1c-488e-a130-5f718b473fce" label="EVE-14" href="https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory" /> (action contract), credentials and identity from phase 1.

## Out of scope

SMS and voice calls; marketing email.

## Linear comments (1)

### Comment 993e20c3-d44e-41d5-b43a-8e2b938da8e2

Author: GitHub. Created: 2026-10-31T21:59:01.214Z; updated: 2026-10-31T21:59:01.183Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/791). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
