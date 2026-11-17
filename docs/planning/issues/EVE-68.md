<!-- linear:generated:start -->
# EVE-68: F4.1 Build people, organisations and contact points as CRM actions

[Live Linear source](https://linear.app/resnovas/issue/EVE-68/f41-build-people-organisations-and-contact-points-as-crm-actions) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:34.047Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Outstanding, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-65](EVE-65.md) |
| Children | None recorded |
| Blocked by | [EVE-23](EVE-23.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md) |
| Blocks | [EVE-91](EVE-91.md), [EVE-95](EVE-95.md), [EVE-99](EVE-99.md), [EVE-102](EVE-102.md), [EVE-105](EVE-105.md) |
| Related to | [EVE-46](EVE-46.md), [EVE-48](EVE-48.md), [EVE-50](EVE-50.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

People and organisations can be created, edited, archived, found and opened by a person or the agent through one set of actions, on web and Android, online and offline.

## Context

* Parent <issue id="ad791a38-f528-4aec-9433-c36977bbe8e2" label="EVE-65" href="https://linear.app/resnovas/issue/EVE-65/f4-contacts-and-crm-people-organisations-relationships-and-history" /> sections 4 (actions), 5 (Party, Person, Organisation, ContactPoint, Affiliation) and 9 (permissions). Decision D1 (Person separate from User) is assumed; if Jonathan picks B, merge Person into the identity profile from <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" /> instead.
* Historical intent only: `Examples/packages-old/extensions/contact` (one `contact` table with firstname, lastname, date of birth, email, phone, used as the `created_by` table). Do not copy it: contact is no longer the creator table, `created_by` points to the member identity (<issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />), and the env-var seed config is replaced by a dev fixture.
* New extension package `extensions/crm` (Nx tags `type:extension`, `scope:crm`), tables through the shared schema helpers from <issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />.

## Scope

1. Tables `party`, `person`, `organisation`, `contact_point`, `affiliation` on Postgres and SQLite (<issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" />), tenant guarded, with typeids `party`, `cp`, `aff`.
2. Actions: `crm.person.*`, `crm.organisation.*` (create, update, archive, restore, get, list), `crm.contactPoint.add` / `update` / `remove` / `setPrimary`, `crm.affiliation.add` / `end`, with change records and undo.
3. Field sensitivity: date of birth and personal contact points (label `personal`) are marked sensitive in the schema; read projections mask them without `crm:sensitive`.
4. Record visibility (`tenant`, `team`, `private`) enforced in the authorization policy for every CRM action.
5. Screens: Contacts list, Person detail (overview tab only), Organisation detail, each with its screen-context projection and every control bound (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />). `nav.crm.*` actions.
6. Feature flag `crm`, default off.

## Acceptance criteria

* `@effect/vitest` tests: create, update, archive, restore and undo for each entity; cross-tenant read denied; private record hidden from a non-owner member; masked date of birth for a member without `crm:sensitive`, visible with it.
* Same create through UI, HTTP (<issue id="0ab161c4-ed9c-4581-86fe-91fa1f4216aa" label="EVE-46" href="https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action" />) and MCP (<issue id="37c126a9-64e0-4235-88f0-494533c8e3a2" label="EVE-48" href="https://linear.app/resnovas/issue/EVE-48/p19-build-inbound-mcp-from-the-action-inventory" />) gives identical rows and audit entries.
* The agent, on the Person detail screen, answers "what is this person's work email" from the projection and adds a phone number by action.
* Parity gate and unbound-control check pass; `node --run check` green.

## Constraints

Effect-TS v3 house rules (Schema input, `Data.TaggedError`, services as `Context.Tag`); no zod; no `any`; WCAG 2.2 AA; customer copy whitelabel and ASCII; no new dependency without Jonathan approving it here; ship to main per the AGENTS.md delivery exception with `node --run check` results pasted here.

## Done signal

Merged to main with the test matrix green, the three screens working on web and Android (device check recorded), and a comment listing the actions added.

## Blockers

<issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />, <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" />, <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />, <issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />; <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" /> for the screens (actions can land first).

## Linear comments (1)

### Comment 523582cc-4811-4f72-95a0-454fde731feb

Author: GitHub. Created: 2026-11-01T13:06:16.488Z; updated: 2026-11-01T13:06:16.466Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-68/f41-build-people-organisations-and-contact-points-as-crm-actions) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/835). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
