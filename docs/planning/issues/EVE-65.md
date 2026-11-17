<!-- linear:generated:start -->
# EVE-65: F4 Contacts and CRM: people, organisations, relationships and history

[Live Linear source](https://linear.app/resnovas/issue/EVE-65/f4-contacts-and-crm-people-organisations-relationships-and-history) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:44.637Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Outstanding, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | None recorded |
| Children | [EVE-68](EVE-68.md), [EVE-91](EVE-91.md), [EVE-95](EVE-95.md), [EVE-99](EVE-99.md), [EVE-102](EVE-102.md), [EVE-105](EVE-105.md), [EVE-137](EVE-137.md), [EVE-139](EVE-139.md), [EVE-141](EVE-141.md), [EVE-144](EVE-144.md) |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-13](EVE-13.md), [EVE-17](EVE-17.md), [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-26](EVE-26.md), [EVE-27](EVE-27.md), [EVE-28](EVE-28.md), [EVE-30](EVE-30.md), [EVE-31](EVE-31.md), [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-45](EVE-45.md), [EVE-46](EVE-46.md), [EVE-48](EVE-48.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-66](EVE-66.md), [EVE-69](EVE-69.md), [EVE-73](EVE-73.md), [EVE-80](EVE-80.md), [EVE-98](EVE-98.md), [EVE-107](EVE-107.md), [EVE-126](EVE-126.md), [EVE-127](EVE-127.md), [EVE-222](EVE-222.md), [EVE-225](EVE-225.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Proposed (2026-11-01). Follows the [feature set spec template](<https://linear.app/resnovas/document/feature-set-spec-template-and-list-26b9f78cf17a>). Planning only: no code, no new dependency and no vendor sign-up until Jonathan approves the decisions in section 15.

## 1. Goal

Every person and organisation an event business deals with (clients, vendors, venues, artists, crew, attendees, suppliers) lives once in Eventiva, with their relationships, their role on each event and their full history, so a person or the agent can answer "who is this, what have we done with them and what is next" from one record.

## 2. Users and jobs

| User | Jobs |
| -- | -- |
| Organiser or account manager | Capture an enquiry, track it to a booked event, see a client's history, plan follow-ups, find the right venue contact |
| Production manager | Find the vendor, venue and artist contacts attached to an event and their roles; share a contact sheet with crew |
| Crew member | See the contacts on today's event (venue manager, site security) on mobile, offline |
| Vendor or client (external) | Keep their own details and preferences current; see the events they are on |
| Attendee (external) | Manage their consent and contact preferences; request a copy or deletion of their data |
| Finance | Use the organisation record as the billing party (F11) without retyping details |
| Admin | Control who sees which contacts, run imports, merges and privacy requests |
| Agent | Log interactions, dedupe, summarise a relationship, draft follow-ups, move an opportunity, all through the same actions and approvals as a person |

## 3. Market check

Checked 2026-11-01 from public product pages and docs; names stay out of customer-facing copy.

* **Generic CRM (HubSpot style):** standard objects (contacts, companies, deals) plus custom objects, joined by typed associations with labels; a timeline of activities per record; pipelines with stages; consent and GDPR tooling (lawful basis, delete). Eventiva matches the object and association model and the per-record timeline. Differs: associations reach event records (F1) natively, and custom objects come from F14 rather than a CRM-only builder.
* **Modern relationship CRM (Attio style):** flexible records and lists, automatic enrichment of people and companies from email domains, mailbox and calendar sync that builds the relationship graph and "last interaction" automatically, and a strong API that agents drive. Eventiva matches mailbox-derived history and lists, and is agent-first by architecture rather than through an API add-on. Differs: no third-party enrichment by default (privacy and cost; decision D4).
* **Event and venue sales tools (Tripleseat style):** lead capture forms, leads converted to bookings with proposals, contracts and payments, accounts and contacts tied to each event, and reporting on lead sources and conversion. Eventiva matches enquiry to event conversion and per-event contact roles. Differs: proposals, contracts and payments live in F9 and F11, not in the CRM, and crew and vendor contacts share the same model as clients.

Gap none of them close and Eventiva targets: one identity per human across sales, production, crew, ticketing and HR, usable offline on a phone at the venue.

## 4. Capabilities as actions

Every operation is an inventory action (<issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />): Effect Schema input and output, typed errors, one authorization check, a receipt, audit, and a change record with undo where it mutates. Names use `crm.<entity>.<verb>`. Permissions: `crm:read`, `crm:write`, `crm:admin`, `crm:sensitive` (sensitive fields), `crm:privacy` (privacy requests). Approval: none unless stated.

| Action | Input | Output | Permission | Approval | Offline |
| -- | -- | -- | -- | -- | -- |
| `crm.person.create` / `update` / `archive` / `restore` | person fields, contact points | Person | crm:write | none | yes |
| `crm.person.get` / `list` / `search` | id or filter, page | Person or page | crm:read | none | yes (local data) |
| `crm.organisation.create` / `update` / `archive` / `restore` / `get` / `list` | org fields | Organisation | crm:write or read | none | yes |
| `crm.affiliation.add` / `end` | person, org, title, dates | Affiliation | crm:write | none | yes |
| `crm.relationship.add` / `remove` | from, to, type | Relationship | crm:write | none | yes |
| `crm.eventRole.assign` / `unassign` | Event (F1) id, party, role | EventRole | crm:write plus event write | none | yes |
| `crm.interaction.log` / `update` / `delete` | party, kind, time, summary, links | Interaction | crm:write | none | yes |
| `crm.note.create` / `update` | party, document | Note (Yjs doc) | crm:write | none | yes |
| `crm.timeline.get` | party, filter, page | timeline entries | crm:read | none | yes (synced part) |
| `crm.tag.apply` / `remove`, `crm.list.create` / `update` / `addMembers` / `removeMembers` | tags, list def | Tag or List | crm:write | none | yes |
| `crm.smartList.evaluate` | saved filter | members page | crm:read | none | yes (local data) |
| `crm.duplicate.find` | party or all | candidate pairs with score | crm:read | none | yes |
| `crm.party.merge` / `unmerge` | survivor, merged ids, field choices | merged Party, merge record | crm:admin | confirm | no |
| `crm.import.start` / `crm.import.commit` | file ref ([EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>)), mapping | import report | crm:admin | confirm on commit | no |
| `crm.export.run` | filter, format | file ref | crm:admin | confirm | no |
| `crm.enquiry.capture` / `resolve` | form payload, source; or outcome won or lost | Enquiry | public form token, crm:write, or the F5 directory system principal for that tenant (audited) | none | yes (internal) |
| `crm.opportunity.create` / `update` / `moveStage` / `markWon` / `markLost` | opportunity fields, stage | Opportunity | crm:write | none | yes |
| `crm.opportunity.convertToEvent` | opportunity id, event template | Event (F1) id | crm:write plus event create | confirm | no |
| `crm.pipeline.define` / `update` | stages | Pipeline | crm:admin | none | no |
| `crm.mailbox.connect` / `disconnect` / `sync` | provider, scopes | MailboxConnection | own user | confirm on connect | no |
| `crm.consent.record` / `withdraw` / `get` | party, purpose, channel, basis, source | ConsentRecord | crm:write; party self | none | yes (queued) |
| `crm.privacy.requestExport` / `requestErasure` / `fulfil` | party, request | PrivacyRequest | crm:privacy; party self | always on fulfil erasure | no |
| `crm.followUp.schedule` | party, due, note | Task (F3) id | crm:write plus task write | none | yes |
| `crm.portal.invite` / `revoke` | party, scope | external principal ([EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>)) | crm:admin | confirm | no |
| `crm.relationship.summarise` | party | summary text and sources | crm:read | none | no (needs model) |

Navigation actions (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />): `nav.crm.open`, `nav.crm.person.open`, `nav.crm.organisation.open`, `nav.crm.pipeline.open`.

## 5. Data model

All tables are tenant scoped (<issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> tenant guard) and carry the standard created and updated columns. IDs are typeids.

* **Party**: the supertype for Person and Organisation, so every relation, tag, timeline entry and event role points to one `party_id`. Fields: kind, display name, owner (member), visibility (`tenant`, `team`, `private`), archived at, merged into.
* **Person**: given name, family name, preferred name, pronouns (optional, free text), date of birth (sensitive), language, time zone, photo ([EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>) file), optional `user_id` link to an identity ([EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>)). A Person is not a login; a User is not a Person (decision D1).
* **Organisation**: legal name, trading name, kind (client, vendor, venue, agency, supplier, other; multi-select), registration and tax numbers (finance reads these in F11), website, domain list.
* **ContactPoint**: party, kind (email, phone, address, social, website), value, label, primary flag, verified at. Addresses use a structured schema with country, localised by [EVE-28](<https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent>).
* **Affiliation**: person, organisation, title, department, start, end, primary flag.
* **Relationship**: from party, to party, type (reports to, assistant of, agent for, partner of, refers, other with label).
* **EventRole**: Event (F1), party, role (booker, venue contact, vendor, artist, artist management, promoter, sponsor, security, other), notes, on-site flag. The primary client is F1's `Event.client_ref` (a Party id), shown first in the event contacts tab and not duplicated as an EventRole. F1's TeamMember (`contact_ref` to a Person) is the internal event team and Rider performer `contact_ref` the artist; F4 keeps those Party ids stable (merge rewrites them through the reference owner contract). EventRole covers the other external business contacts. Crew shifts stay in F2.
* **Interaction**: party links (many), kind (call, meeting, email, message, visit, note), direction, occurred at, duration, summary, source (manual, mailbox, agent, system), external message id, links to Event (F1), Opportunity, Task (F3).
* **Note**: a Yjs document embedded in a Party record ([EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>)), with its own version history.
* **Tag**, **List** (static members) and **SmartList** (saved filter, evaluated on read). Named SmartList, not Segment, because Segment is an F1 run of show entity.
* **Enquiry**: source, raw payload, matched party, status (new, qualified, discarded, converted, won, lost), external ref (for example the F5 directory thread id).
* **Pipeline** and **Stage**; **Opportunity**: party, organisation, title, stage, value and currency, expected date, probability, owner, lost reason, converted Event (F1) id.
* **MailboxConnection**: member, provider, scopes, credential ref ([EVE-41](<https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials>), never in the record), sync cursor, status.
* **ConsentRecord**: party, purpose (marketing email, SMS, photos, data sharing with vendors), channel, lawful basis, state, source, captured at, evidence. Append only.
* **PrivacyRequest**: party, kind (export, erasure, rectification), status, due at, fulfilled by, result file.
* **MergeRecord**: survivor, merged ids, field choices, reference rewrites, undo payload.

Timeline is a projection, not a table: it reads Interactions, Notes, ConsentRecords, Opportunities, EventRoles and domain events from other sets on the change feed (<issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" />) that name a party (an order in F9, a ticket in F8, an invoice in F11).

**Offline and conflicts (**<issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" />**,** <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />**):**

| Data | Syncs offline | Conflict rule |
| -- | -- | -- |
| Person and Organisation scalar fields | yes, per field | last writer wins per field, with both values kept in the change record so undo can restore either |
| ContactPoints, Affiliations, Relationships, EventRoles | yes, per row | row level add wins; concurrent edits of one row resolve per field as above |
| Tags and List members | yes | set merge, add wins, remove of an unseen add does not remove it |
| Notes | yes | Yjs merge |
| Interactions | yes, append mostly | per field last writer wins; delete wins over edit |
| Opportunity stage | yes | server orders stage moves by server receive time; a move to won or lost from a stale stage is rejected and returned to the user |
| ConsentRecord | queued only | append only; the latest captured at wins; withdrawal received offline is applied the moment it syncs and before any send |
| Merge, import, export, privacy fulfilment, mailbox sync, convert to event | no | online only; shown disabled offline with the reason |
| Sensitive fields | synced only to devices of members with `crm:sensitive` |  |

Local sync scope per device: contacts linked to the member's events in the next 30 days plus their owned and recently opened records, so a crew phone has the venue contacts without holding the whole CRM.

## 6. Screens

UI comes from Rambo-UI (no components exist yet at b47a58c; the components named below are the list F4 needs from it). Every control binds to an action; every screen declares a screen-context projection (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />).

| Screen | Rambo-UI components | Projection | Controls and actions |
| -- | -- | -- | -- |
| Contacts list | DataTable, FilterBar, SearchField, Tabs (people, organisations), BulkActionBar | visible rows (id, name, kind, tags, owner), filter, selection | new (`crm.person.create`), search (`crm.person.search`), tag (`crm.tag.apply`), add to list, archive, export, open (`nav.crm.person.open`) |
| Person detail | Header with Avatar, Card, FieldList, Timeline, Tabs (overview, events, opportunities, consent), RichTextEditor | person fields minus masked ones, active tab, timeline page | edit field (`crm.person.update`), add contact point, add affiliation, log interaction, add note, schedule follow-up, merge, invite to portal |
| Organisation detail | as Person plus PeopleList | org fields, people list, events | same pattern with organisation actions |
| Event contacts tab (inside F1 event) | RoleList, PartyPicker | event id, roles and parties | assign and unassign role, call, email, open party |
| Pipeline board | KanbanBoard, Card, StageColumn, SummaryBar | pipeline, stage counts and values, visible cards | create, move stage, mark won or lost, convert to event |
| Enquiry inbox | List, Detail pane, MatchSuggestion | enquiries, suggested matches | qualify, match to party, discard, convert to opportunity |
| Duplicates review | ComparePane, FieldChooser | candidate pair, chosen fields | merge (confirm), dismiss |
| Import wizard | FileDrop, ColumnMapper, Preview, ProgressBar | mapping, preview counts, errors | start, map, commit (confirm) |
| Consent and privacy (admin) | DataTable, Badge, Dialog | requests, due dates | record consent, fulfil request (approval) |
| Portal profile (external) | Form, ConsentToggles | own record only | update own details, change consent, request export or erasure |
| Mobile event contact sheet | List, CallButton, OfflineBadge | today's event roles | call, message, open on map (F10) |

## 7. Agent behaviour

* **When asked:** find people and organisations, summarise a relationship with cited sources, log a call from dictation (<issue id="7bd596ca-10db-4e11-bced-7aa22fc64269" label="EVE-31" href="https://linear.app/resnovas/issue/EVE-31/port-voice-input-and-transcription-for-the-agent" />), draft a follow-up email (sent through <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> only with the user's confirm), build a list from a description, move an opportunity, attach the right contacts to an event.
* **Proactive (suggest, never act silently):** propose duplicates after an import or a create; suggest a follow-up Task (F3) when an opportunity has had no interaction for a configurable number of days (default 14); flag an event in the next 7 days with no venue contact; flag a privacy request approaching its due date.
* **Approvals:** merge, import commit, export, convert to event and portal invite need confirm; erasure fulfilment always needs a human approval, even when the agent prepared it; any send to an external person needs confirm.
* **Limits:** the agent only reads fields the user it acts for can read; sensitive fields are masked in its context unless the user has `crm:sensitive` and the action needs them. No agent SQL; only actions.

## 8. Integrations

Each behind a neutral Effect port in its own integration package; switching vendor changes composition only.

| Port | Purpose | Candidate adapters (need approval on the child issue) |
| -- | -- | -- |
| `MailboxSync` | read message headers and bodies for linked parties, send through the user's mailbox | Google (Gmail API), Microsoft (Graph); IMAP later |
| `CalendarSync` | meetings with known parties become Interactions | Google Calendar, Microsoft Graph |
| `ContactExchange` | import and export | CSV and vCard in-house (no vendor) |
| `AddressLookup` | address autocomplete and validation | none in phase 1; reuse the F10 maps vendor if chosen there |
| `Enrichment` | company and person data from a domain | none (decision D4) |
| Messaging and email send | follow-ups and consent confirmations | <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> port |

## 9. Permissions and roles

* Tenant roles map to permissions: Viewer (`crm:read`), Member (`crm:read`, `crm:write`), CRM admin (adds `crm:admin`, `crm:privacy`), Owner (all). `crm:sensitive` is granted separately.
* Record visibility: `tenant` (default), `team`, `private` (owner and admins). Visibility is enforced in the authorization service (<issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />) and at sync (<issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />), not only in the UI.
* Event scoped access: a member who can read an Event (F1) can read the business contact details of parties with an EventRole on it (name, role, work phone and email), even without `crm:read`, so crew get the venue contacts. Personal contact points stay hidden.
* External principals (<issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />): a portal user is linked to one Person and can read and edit only that Person, its consent, and the names of events they hold a role on. A vendor organisation admin can manage the people affiliated with their organisation.
* Agents act with the permissions of the user they act for, never more.

## 10. Telemetry and flags

* Feature flags (PostHog, safe in-code default off): `crm` for the set, plus `crm-pipeline`, `crm-mailbox-sync`, `crm-portal`, one per slice that adds user-visible behaviour.
* Events (no personal data in properties; party ids are pseudonymous): `crm_party_created` (kind, source), `crm_party_merged` (count, source), `crm_interaction_logged` (kind, source), `crm_opportunity_stage_changed` (from, to), `crm_opportunity_converted`, `crm_import_committed` (rows, errors), `crm_privacy_request_fulfilled` (kind, days taken), `crm_agent_suggestion_accepted` (suggestion kind).
* Spans on every action come from <issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" />; mailbox sync jobs add `crm.mailbox.sync` spans with counts only.
* Success metrics: share of upcoming events with a client and a venue contact attached (target 90 percent); duplicate rate after import (under 2 percent); median days from enquiry to converted event; privacy requests fulfilled inside the legal deadline (100 percent).

## 11. Compliance

* UK GDPR and EU GDPR: lawful basis recorded per purpose; data subject rights (access, rectification, erasure, portability, objection) fulfilled within one month; records of processing; data minimisation (date of birth optional and sensitive); retention policy per tenant (default: archived parties purged after 7 years for finance links, 2 years otherwise, configurable).
* PECR (UK) and the ePrivacy rules: marketing email and SMS need recorded consent or soft opt-in; every marketing send checks ConsentRecord at send time. CAN-SPAM and CCPA/CPRA honoured where the tenant operates in the US (opt-out, do-not-sell flag).
* Special category data (health, for example access needs or dietary needs) is out of F4 (section 13); it belongs to the set that needs it, with explicit consent.
* Erasure keeps finance and legal records required by law (F11 invoices) by replacing the party with a tombstone that holds only what the law requires.
* Mailbox sync: users connect their own mailbox with least scopes; message bodies are stored only for messages with a known party; the provider's terms for API use are recorded on the child issue.
* Telemetry and logs never carry names, emails, phones or note text (<issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" /> redaction).

## 12. Acceptance

* Every action in section 4 is in the inventory, passes the parity gate (<issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />) and is callable from UI, HTTP, MCP and the agent with identical results and permissions.
* A person created offline on Android and edited on web while offline converges after reconnect under the rules in section 5, with undo available for both edits.
* A crew member with no `crm:read` sees the venue contact for their event, offline, and cannot see that contact's personal phone.
* Merging two people moves every reference (event roles, interactions, opportunities, tasks, orders, invoices) to the survivor, and unmerge restores them.
* A consent withdrawal recorded on the portal blocks a marketing send queued before it.
* An erasure request removes personal data everywhere except legally retained finance records, and the audit log shows who approved it.
* The agent answers "who is the venue contact for Saturday and when did we last speak" from the screen projection and the timeline, citing sources.
* A deliberately unbound control on any F4 screen fails the <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" /> check.

## 13. Out of scope

* Marketing campaigns, newsletters and automation journeys (a later set; F4 only records consent and lists).
* Quotes, proposals, contracts and payments (F9, F11).
* Crew employment records, qualifications and payroll identity (F13 Worker, F12); they reference the Person.
* Public directory listings and reviews (F5); they reference the Organisation.
* Third-party enrichment, social scraping and lead databases.
* Special category data.
* A telephony dialler or call recording.
* Custom fields and custom objects (F14 provides them for every set; F4 ships the fixed schema above).

## 14. Dependencies

* **Phase 1:** [EVE-40](<https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema>) actions; [EVE-41](<https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials>) secrets and credentials (mailbox tokens); [EVE-42](<https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state>) storage and tenant guards; [EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>) identity, authorization, approvals, audit and external principals; [EVE-44](<https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor>) telemetry; [EVE-45](<https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change>) change feed (timeline); [EVE-46](<https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action>) HTTP API; [EVE-48](<https://linear.app/resnovas/issue/EVE-48/p19-build-inbound-mcp-from-the-action-inventory>) MCP; [EVE-50](<https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen>) screen awareness; [EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>) record sync and Yjs notes; [EVE-52](<https://linear.app/resnovas/issue/EVE-52/p18a-build-the-agent-turn-loop-with-actions-as-tools>) agent loop; [EVE-54](<https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow>) durable runs (mailbox sync, import, erasure jobs). Sync engine choice [EVE-17](<https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and>).
* **Port later:** [EVE-24](<https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email>) notifications and email; [EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>) files and import; [EVE-26](<https://linear.app/resnovas/issue/EVE-26/port-search-and-embeddings-across-every-resource>) search; [EVE-27](<https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource>) comments and mentions; [EVE-28](<https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent>) localisation of names and addresses; [EVE-30](<https://linear.app/resnovas/issue/EVE-30/port-data-widgets-saved-dashboards-and-brand-kits>) dashboards; [EVE-31](<https://linear.app/resnovas/issue/EVE-31/port-voice-input-and-transcription-for-the-agent>) voice capture.
* **Other sets:** F1 (names fixed in [EVE-73](<https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show>) section 5: Event with `client_ref`, TeamMember `contact_ref`, Rider performer `contact_ref`; EventRole and convert to event build on them); F2 rosters (crew link by Person); F3 Task (follow-ups); F5 directory (Organisation); F8 and F9 (attendees and buyers become Persons); F10 maps (address on map); F11 (billing party is an Organisation or Person); F13 (<issue id="253839bc-c987-416b-92ea-206c9e9e8d2e" label="EVE-80" href="https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave" />: Worker references Person by party id, agency crew via Worker.supplierOrgId to an Organisation, special category data in F13 SensitiveProfile; F13 registers as a reference owner in <issue id="7cc5c061-dd2d-4963-8e03-f0175a4f12b9" label="EVE-98" href="https://linear.app/resnovas/issue/EVE-98/f131-build-worker-records-engagements-and-organisation-structure" />); F5 (<issue id="b22fbb0d-100b-47a3-8c32-eeacadc4c9fe" label="EVE-66" href="https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings" />: Listing.organisationRef, crmEnquiryRef via crm.enquiry.capture and resolve); F14 (custom fields).

## 15. Decisions for Jonathan

* **D1 Person and user.** A. Person (CRM record) and User (login, <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />) are separate, with an optional link; every human Eventiva knows about is one Person, and other sets reference Person. B. One table for both. **Recommended: A**, because most contacts never log in and the old `contact` extension, which made contact the creator table, mixed the two.
* **D2 Sales pipeline home.** A. Enquiries and opportunities live in F4 and convert into an Event (F1). B. Leave pipeline to F9. **Recommended: A**, as in event sales tools, where the lead belongs with the contact.
* **D3 Mailbox and calendar sync.** A. Build the ports and Google and Microsoft adapters in F4.7, each dependency approved on that issue. B. Manual logging plus a per-tenant forwarding address only. C. Defer sync entirely. **Recommended: A**, because automatic history is the main thing modern CRMs do better than manual entry; B ships first inside F4.7 as the no-vendor fallback.
* **D4 Enrichment.** A. No third-party enrichment; the agent can look up a public website on request with the user's approval. B. A paid enrichment vendor. **Recommended: A** (privacy, cost, no vendor sign-up).
* **D5 Duplicates.** A. Always suggest, merge on confirm, with unmerge. B. Auto-merge exact email matches. **Recommended: A**; auto-merge loses data silently when two people share an inbox.

## 16. Child issues (build order)

 1. <issue id="d71c315c-52d0-4e04-b37a-88b4e1db7827" label="EVE-68" href="https://linear.app/resnovas/issue/EVE-68/f41-build-people-organisations-and-contact-points-as-crm-actions" /> F4.1 People, organisations and contact points
 2. <issue id="2e57e1c4-1d58-43b1-bc1e-be0c74986f29" label="EVE-91" href="https://linear.app/resnovas/issue/EVE-91/f42-link-contacts-to-events-with-roles-and-to-each-other-with" /> F4.2 Event roles and relationships
 3. <issue id="c3695c62-5106-4bd6-8ce1-c7dff1d14427" label="EVE-95" href="https://linear.app/resnovas/issue/EVE-95/f43-build-the-activity-timeline-interactions-notes-and-history-from" /> F4.3 Activity timeline, interactions and notes
 4. <issue id="7692d04c-3444-4989-b2aa-b73a1a69ab02" label="EVE-99" href="https://linear.app/resnovas/issue/EVE-99/f44-find-and-merge-duplicate-contacts-and-import-and-export-them" /> F4.4 Duplicates, merge, import and export
 5. <issue id="4b6f8805-b1b2-40f7-99e9-089c9adb8002" label="EVE-105" href="https://linear.app/resnovas/issue/EVE-105/f48-record-consent-and-fulfil-privacy-requests-for-contacts" /> F4.8 Consent and privacy requests (built fifth: F4.5, F4.7 and F4.9 need its consent check)
 6. <issue id="5049ee23-9ed6-4a9d-a129-c881611a5f90" label="EVE-102" href="https://linear.app/resnovas/issue/EVE-102/f45-organise-contacts-with-tags-lists-and-smart-lists" /> F4.5 Tags, lists and smart lists
 7. <issue id="aa5aaa4a-23e6-4982-bde3-b771cf4bf000" label="EVE-137" href="https://linear.app/resnovas/issue/EVE-137/f46-capture-enquiries-and-track-opportunities-through-a-pipeline-into" /> F4.6 Enquiries, pipeline and convert to event
 8. <issue id="1389fdd4-c847-469a-96c4-b469e8fda737" label="EVE-139" href="https://linear.app/resnovas/issue/EVE-139/f47-sync-mailbox-and-calendar-history-into-the-contact-timeline" /> F4.7 Mailbox and calendar sync
 9. <issue id="72403895-aec7-4187-943d-ad7df0566e6d" label="EVE-141" href="https://linear.app/resnovas/issue/EVE-141/f49-let-external-contacts-manage-their-own-details-and-consent-in-a" /> F4.9 External contact portal
10. <issue id="18171bfa-18f0-4fe1-89ff-499f1fb5d4be" label="EVE-144" href="https://linear.app/resnovas/issue/EVE-144/f410-give-the-agent-crm-skills-summaries-follow-up-suggestions-and" /> F4.10 Agent CRM skills and suggestions

## Linear comments (1)

### Comment 2a3a4f19-c2a5-4913-83a0-94a957e2e5fd

Author: GitHub. Created: 2026-11-01T13:05:54.805Z; updated: 2026-11-01T13:05:54.756Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-65/f4-contacts-and-crm-people-organisations-relationships-and-history) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/832). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
