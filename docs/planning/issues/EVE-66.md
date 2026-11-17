<!-- linear:generated:start -->
# EVE-66: F5 Directory and marketplace: vendor, venue and professional listings, search, enquiries, quotes and reviews

[Live Linear source](https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:36.322Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending, Feature, Product |
| Project | Eventiva product features |
| Archived | No |
| Parent | None recorded |
| Children | [EVE-75](EVE-75.md), [EVE-77](EVE-77.md), [EVE-78](EVE-78.md), [EVE-79](EVE-79.md), [EVE-113](EVE-113.md), [EVE-115](EVE-115.md), [EVE-119](EVE-119.md), [EVE-124](EVE-124.md), [EVE-161](EVE-161.md), [EVE-163](EVE-163.md), [EVE-164](EVE-164.md), [EVE-165](EVE-165.md), [EVE-236](EVE-236.md), [EVE-237](EVE-237.md), [EVE-250](EVE-250.md) |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-13](EVE-13.md), [EVE-17](EVE-17.md), [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-26](EVE-26.md), [EVE-27](EVE-27.md), [EVE-28](EVE-28.md), [EVE-29](EVE-29.md), [EVE-33](EVE-33.md), [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-45](EVE-45.md), [EVE-46](EVE-46.md), [EVE-48](EVE-48.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-52](EVE-52.md), [EVE-56](EVE-56.md), [EVE-63](EVE-63.md), [EVE-65](EVE-65.md), [EVE-69](EVE-69.md), [EVE-73](EVE-73.md), [EVE-81](EVE-81.md), [EVE-107](EVE-107.md), [EVE-126](EVE-126.md), [EVE-137](EVE-137.md), [EVE-158](EVE-158.md), [EVE-166](EVE-166.md), [EVE-174](EVE-174.md), [EVE-215](EVE-215.md), [EVE-223](EVE-223.md), [EVE-229](EVE-229.md), [EVE-247](EVE-247.md), [EVE-251](EVE-251.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Proposed (2026-11-01). Planning only, no implementation until Jonathan asks. Template: [Feature set spec template and list](<https://linear.app/resnovas/document/feature-set-spec-template-and-list-26b9f78cf17a>). Decisions D5-1 to D5-6 recorded 2026-11-08 (section 15).

## 1. Goal

An organiser finds, compares and engages vendors, venues and freelance professionals inside the same app they plan the event in, and a vendor wins work from a listing they manage in the same app they run their business in.

## 2. Users and jobs

| User | Jobs |
| -- | -- |
| Organiser (planner, producer) | Search by category, location, date, capacity and budget; shortlist; send one enquiry (RFP) to several suppliers; compare quotes side by side; accept one and have it land on the F1 Event; review afterwards |
| Vendor or venue (a business with its own Eventiva tenant) | Publish and maintain a listing (venue rooms, services, packages, media, service area); answer enquiries; send and revise quotes; respond to reviews; see listing performance |
| Professional (freelancer: rigger, LD, sound engineer, stage manager) | Publish a personal profile with skills, qualifications, day rates and availability; receive enquiries and booking offers |
| Attendee or public visitor | Browse the public directory anonymously (read only) |
| Finance | Sees accepted quotes become purchase commitments for F11 |
| Platform moderator (Eventiva staff role) | Verify businesses, handle reports, remove unlawful content, manage the category taxonomy |
| Agent (first-party or external, acting for one of the above) | Everything that person can do, through the same actions, with approvals on anything that contacts another business |

## 3. Market check

Checked 2026-11-01 from public product pages; names stay out of customer-facing copy.

| Tool | What it does | Where Eventiva matches or differs |
| -- | -- | -- |
| Cvent Supplier Network | Venue sourcing for meeting planners: venue profiles with meeting space and room data, one RFP sent to many venues, proposal comparison, venues pay for advertising placement; free for planners | Match: multi-recipient RFP and side-by-side quote comparison, structured space data. Differ: covers vendors and freelancers, not just venues and hotels; the accepted quote lands directly on the event plan, budget and schedule in the same app instead of a separate tool |
| Tagvenue and Peerspace | Consumer and SMB venue marketplaces: rich listings, instant or request booking, platform payments, booking fees or commission, reviews only after a booking | Match: rich listings, verified reviews tied to a completed engagement. Match: commission taken from the platform payment (D5-6). Differ: the vendor is merchant of record on its own connected account; bookings run through Eventiva's own quote, F9 and F11 flows |
| The Knot / WeddingWire | Vendor storefronts, lead messaging, paid visibility tiers, reviews with vendor replies | Match: storefront, messaging thread per lead, vendor replies to reviews. Differ: vendors are full Eventiva tenants, so their listing is fed by their real inventory (F6), rosters (F2) and availability (<issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" />) rather than a static page |

What nobody does that Eventiva can: the agent sources suppliers from the live event plan (dates, site map capacities, budget lines) and the vendor's agent drafts the quote from the vendor's real stock and crew availability, both through the same audited actions.

Sources: [Cvent Supplier Network](<https://cvent.com/event-marketing-management/cvent-supplier-network>), [Cvent venue advertising](<https://www.cvent.com/uk/supplier-venue/advertising>), [Tagvenue: how booking stays free](<https://www.tagvenue.com/blog/how-tagvenue-keeps-booking-free-for-users/>), [Peerspace vs Tagvenue](<https://www.peerspace.com/resources/peerspace-vs-tagvenue/>), [The Knot for vendors](<https://www.theknot.com/content/the-knot-for-wedding-vendors>), [The Knot Worldwide 2025 vendor products](<https://secure.businesswire.com/news/home/20250724019488/en/The-Knot-Worldwide-Announces-New-Products-to-Help-Wedding-Professionals-Get-Discovered-and-Connect-with-More-Couples>).

## 4. Capabilities as actions

Every operation is one inventory action (<issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />): Effect Schema input and output, typed errors, permission, approval policy and side-effect class. Namespace `directory.`. Permissions in section 9.

| Action | Input | Output | Permission | Approval | Class |
| -- | -- | -- | -- | -- | -- |
| directory.listing.create | kind (vendor, venue, professional), name, categories | Listing (draft) | listing:write | none | write |
| directory.listing.update | listingId, patch of profile fields | Listing | listing:write | none | write |
| directory.listing.publish | listingId | Listing (published), receipt | listing:publish | confirm | external |
| directory.listing.unpublish | listingId, reason | Listing | listing:publish | confirm | external |
| directory.listing.archive | listingId | Listing | listing:publish | confirm | write |
| directory.venueRoom.upsert | listingId, VenueRoom (name, area, capacities by layout, rig points, power, access) | VenueRoom | listing:write | none | write |
| directory.venueRoom.remove | venueRoomId | void | listing:write | confirm | write |
| directory.offering.upsert | listingId, Offering (name, description, price from, unit, inclusions) | Offering | listing:write | none | write |
| directory.offering.remove | offeringId | void | listing:write | confirm | write |
| directory.media.attach / detach | listingId, fileId ([EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>)), caption, alt text | MediaItem | listing:write | none | write |
| directory.serviceArea.set | listingId, areas (point plus radius or region codes) | ServiceArea | listing:write | none | write |
| directory.verification.request | listingId, trader details | VerificationCase | listing:publish | none | external |
| directory.verification.decide | caseId, outcome, note | VerificationCase | platform:moderate | none | write |
| [directory.search](<http://directory.search>) | query, kind, categories, location, radius, date range, capacity, budget, sort, cursor | Page of ListingSummary plus ranking explanation | public (anonymous allowed) | none | read |
| directory.listing.get | listingId or slug | Listing (public projection) | public | none | read |
| directory.availability.check | listingId, date range, venueRoomId optional | AvailabilitySignal (available, tentative, unavailable, unknown) | public | none | read |
| directory.shortlist.create / rename / delete | eventId optional (F1 Event), name | Shortlist | shortlist:write | none | write |
| directory.shortlist.add / remove | shortlistId, listingId, note | Shortlist | shortlist:write | none | write |
| directory.enquiry.draft | eventId optional, recipients (listingIds), brief (dates, headcount, budget, requirements, attachments) | Enquiry (draft) | enquiry:write | none | write |
| directory.enquiry.send | enquiryId | Enquiry (sent), one EnquiryRecipient per listing | enquiry:send | confirm (always when more than 5 recipients) | external |
| directory.enquiry.withdraw | enquiryId, reason | Enquiry | enquiry:send | confirm | external |
| directory.enquiry.message | enquiryRecipientId, body, attachments | Message | enquiry:respond (either side) | none for humans, confirm for agents | external |
| directory.enquiry.decline | enquiryRecipientId, reason | EnquiryRecipient | enquiry:respond (vendor side) | none | external |
| directory.quote.create / revise | enquiryRecipientId, line items, validity date, terms | Quote (draft, version n) | quote:write | none | write |
| directory.quote.send | quoteId | Quote (sent) | quote:send | confirm | external |
| [directory.quote.compare](<http://directory.quote.compare>) | enquiryId | QuoteComparison (rows per recipient, normalised totals) | enquiry:read | none | read |
| directory.quote.accept | quoteId | Quote (accepted), EngagementHandoff | quote:accept | always | external |
| directory.quote.decline | quoteId, reason | Quote | quote:accept | none | external |
| directory.review.request | engagementId | ReviewInvitation | enquiry:send | none | external |
| directory.review.submit | invitationId, ratings, body | Review (pending moderation) | review:write (invitation holder only) | confirm | external |
| directory.review.respond | reviewId, body | ReviewResponse | listing:publish | confirm | external |
| [directory.content.report](<http://directory.content.report>) | targetRef (listing, review, message), reason, detail | ModerationCase | any signed-in user; anonymous with captcha | none | external |
| directory.moderation.decide | caseId, outcome (keep, edit, remove, suspend), statement of reasons | ModerationCase | platform:moderate | none | write |
| directory.category.manage | taxonomy patch | Taxonomy version | platform:taxonomy | confirm | write |
| directory.insights.get | listingId, period | ListingInsights (views, saves, enquiries, response time, win rate) | listing:read | none | read |
| directory.navigate.\* | screen and record ids | Navigation result | screen permission | none | read |

Added 2026-11-08 for seeded listings (F5.13) and commission (F5.14):

| Action | Input | Output | Permission | Approval | Class |
| -- | -- | -- | -- | -- | -- |
| directory.seed.create / update | business facts (name, kind vendor or venue, categories, address, website, public phone and email) | Listing (unclaimed) | platform:seed, or organiser enquiry:write (goes to moderation) | none | write |
| directory.seed.removalRequest | listingId, reason, contact | ModerationCase | public with HumanCheck | none | external |
| directory.claim.request | listingId, evidence | ClaimCase | signed-in tenant owner | confirm | external |
| directory.claim.verifyDomain | claimCaseId, email on the listing's domain | ClaimCase | claimant | none | external |
| directory.claim.decide | claimCaseId, outcome, statement of reasons | ClaimCase, ownership transfer | platform:moderate | none | write |
| directory.claim.dispute | listingId or claimCaseId, evidence | ClaimCase (disputed) | signed-in tenant owner | confirm | external |
| directory.commission.acceptTerms | planVersion | CommissionTermsAcceptance | listing:publish | confirm | write |
| directory.commission.statement | period | CommissionStatement | listing:read (vendor only) | none | read |
| directory.commission.adjust | chargeId, new base, reason | CommissionAdjustment (pending) | listing:publish; approved by platform:commission | confirm | write |
| [directory.payment.pay](<http://directory.payment.pay>) | paymentRequestId | F9 checkout session, then Payment | quote:accept (organiser) | always | external |
| directory.payment.markSettledOffPlatform | paymentRequestId, reason | PaymentRequest (settled off platform) | quote:send (vendor), organiser confirmation | confirm | write |
| directory.commission.plan.set | CommissionPlan | CommissionPlan version | platform:commission | always | write |

## 5. Data model

F5 owns these entities. F1 Event and F4 Organisation and Contact are referenced by id, not redefined. Shared columns from <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> (tenantId, created, updated, version, deleted).

* **Listing**: tenantId (publisher), kind, slug, name, summary, description (rich text), categories, status (draft, pending verification, published, unpublished, suspended, archived), verification badge, contact channel settings, response-time stat, rating summary, organisationRef (the publisher's own F4 Organisation Party id, per [EVE-65](<https://linear.app/resnovas/issue/EVE-65/f4-contacts-and-crm-people-organisations-relationships-and-history>); legal name, address and contact details are read from it, not copied). One tenant may publish several listings (a company and its venues).
* **VenueRoom** (venue only; named so it does not clash with the per-event F1 Space): listingId, name, area, ceiling height, capacities per layout (standing, theatre, banquet, cabaret, classroom), rigging points and load, power supply, load-in access, step-free access and accessible facilities, floor plan file. Links to an F10 site map when the venue maintains one. F1 references F5 by id only ([EVE-73](<https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show>) section 5): Event.venue_ref is a Listing id of kind venue, and an F1 Space may carry an optional venue_room_ref to a VenueRoom; referenced VenueRooms are archived, never deleted.
* **Offering**: listingId, name, description, unit (per event, per day, per hour, per head, per item), price from, currency, inclusions. Professionals use offerings for day rates.
* **ProfessionalProfile** (kind professional): skills, qualifications (references F13 qualification records when the professional is staff of a tenant; self-declared otherwise, marked as such), languages, travel radius.
* **MediaItem**: listingId, fileId ([EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>)), alt text (required), order.
* **ServiceArea**: listingId, geometry (point plus radius, or region code list).
* **Category**: platform-owned taxonomy, versioned, localised labels ([EVE-28](<https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent>)).
* **VerificationCase**: listingId, trader name, registered address, registration number, VAT number, contact, evidence files, outcome, reviewer, decided at.
* **Shortlist** and **ShortlistItem**: organiser tenant, optional F1 Event id, listing ids, notes.
* **Enquiry**: organiser tenant, optional F1 Event id, brief fields, attachments, status (draft, sent, closed, withdrawn).
* **EnquiryRecipient**: the cross-tenant record. enquiryId, listingId, organiserTenantId, vendorTenantId, status (new, viewed, responded, declined, quoted, won, lost, expired), message thread, crmEnquiryRef. On send, F5 calls crm.enquiry.capture ([EVE-137](<https://linear.app/resnovas/issue/EVE-137/f46-capture-enquiries-and-track-opportunities-through-a-pipeline-into>)) in the vendor tenant so the enquiry lands in the vendor's CRM pipeline; F5 keeps the cross-tenant thread and quotes, F4 keeps the lead.
* **Message**: enquiryRecipientId, author principal (person or agent for person), body, attachments, read receipts.
* **Quote** and **QuoteLine**: enquiryRecipientId, version, lines (offeringId optional, description, quantity, unit price, tax rate code), totals, validity date, terms, status (draft, sent, accepted, declined, expired, superseded).
* **EngagementHandoff**: produced on acceptance. Creates in the organiser tenant: an F4 Organisation and Contact link for the supplier (found or created), a booking hold through [EVE-33](<https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters>) primitives on the F1 Event dates, and a commitment record F11 reads. In the vendor tenant the enquiry already exists as an F4 lead (see EnquiryRecipient); acceptance calls crm.enquiry.resolve (<issue id="aa5aaa4a-23e6-4982-bde3-b771cf4bf000" label="EVE-137" href="https://linear.app/resnovas/issue/EVE-137/f46-capture-enquiries-and-track-opportunities-through-a-pipeline-into" />) with won, and the other recipients' leads are resolved lost with a reason. Both CRM calls run as the F5 directory system principal, scoped in each vendor tenant to crm.enquiry.capture and crm.enquiry.resolve only, and audited with the F5 thread id. F5 owns only the handoff record and its status; the targets are owned by their sets.
* **ReviewInvitation**, **Review**, **ReviewResponse**: review tied to exactly one EngagementHandoff (verified by construction), ratings per dimension, body, moderation status, published at.
* **ModerationCase**: target ref, reporter, reason, outcome, statement of reasons, appeal state.
* **Seeded listing fields** on Listing: ownership (claimed, unclaimed), seededBy, seedSource, lastCheckedAt. Unclaimed listings sit in a platform directory scope, hold public business facts only (vendor and venue kinds; professionals are never seeded), and take no offerings, prices, reviews or availability. Claiming moves the same Listing id to the claimant tenant, so F1 references survive.
* **ClaimCase**: listingId, claimant tenant, evidence (domain email or documents), outcome, statement of reasons, dispute state. Plus a do-not-seed list and an invitation suppression list.
* **CommissionPlan** (platform scope, versioned: rate in basis points, minimum, cap, categories, effective from), **CommissionTermsAcceptance** (vendor tenant, plan version, accepted by, at), **PaymentRequest** (quote id, schedule line, amount, due date, status due, paid, overdue, refunded, cancelled, settled off platform), **CommissionCharge** (payment id, base excluding VAT, rate, amount, plan version, status collected, refunded, adjusted), **CommissionAdjustment**. Commission records are vendor and platform scope only; organisers never read them.

Tenant scope. Listings, venue rooms, offerings and media are tenant-owned and publicly readable only through the public projection when published. EnquiryRecipient, Message, Quote and EngagementHandoff are two-party records: the row stores both tenant ids, and the authorization rule ([EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>)) is "principal belongs to one of the two tenants and holds the enquiry or quote permission there". This is the first cross-tenant record type in Eventiva and needs a test matrix of its own. Reviews are public once published. Moderation cases are platform scope.

Offline sync ([EVE-17](<https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and>), [EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>)). Synced to device: own listings and children (vendor), own shortlists, own enquiries, threads and quotes (both sides), last search result pages cached read only. Not synced: the public index. Conflict rules: listing scalar fields last-writer-wins per field with version check; listing description is a Yjs text document embedded in the record ([EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>)) so two staff can edit it together; VenueRoom capacities and Offering prices last-writer-wins per field; quote lines are edited by one side only and a sent quote is immutable (revise makes a new version), so no merge; messages are append-only; status transitions are server-validated state machines ([EVE-42](<https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state>)), so an offline transition that is no longer valid is rejected on sync and surfaced to the user. Sending an enquiry, message or quote while offline queues the action and it is executed and authorized on reconnect; the UI shows it as queued, never as sent.

## 6. Screens

All components from Rambo-UI. Each screen declares an Effect Schema screen-context projection (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />) and every control binds to an action.

| Screen | Key components | Projection | Controls and actions |
| -- | -- | -- | -- |
| Directory search | search field, filter panel, result list and map toggle, result card | query, filters, visible result ids with rank and reason, selected result | search, filter change ([directory.search](<http://directory.search>)), save to shortlist (directory.shortlist.add), open (directory.navigate.listing) |
| Listing detail (public) | gallery, venue room table, offering list, availability strip, review list, contact button | listing id, visible sections, selected venue room, availability range shown | check availability, add to shortlist, start enquiry (directory.enquiry.draft), report ([directory.content.report](<http://directory.content.report>)) |
| Shortlist | table with compare columns, notes | shortlist id, item ids, selected items | remove, note, enquire selected (directory.enquiry.draft) |
| Enquiry composer | brief form prefilled from the F1 Event, recipient chips | draft fields, recipients, validation errors | save draft, send (directory.enquiry.send) |
| Enquiry inbox (vendor) | list with status filters, thread view | visible enquiry recipient ids, selected thread, unread count | open, message, decline, create quote |
| Quote editor (vendor) | line item table from offerings, totals, validity | quote id, version, lines, totals | add line, revise, send (directory.quote.send) |
| Quote comparison (organiser) | comparison grid, per-recipient thread | enquiry id, rows and normalised totals | accept (directory.quote.accept), decline, message |
| Listing editor (vendor) | form sections, venue room editor, offering editor, media manager, preview | listing id, section, dirty fields, publish blockers | update, upsert venue room or offering, attach media, request verification, publish |
| Reviews (vendor) | review list, response box | visible review ids | respond, report |
| Listing insights (vendor) | KPI tiles, trend charts | period, metric values | change period (directory.insights.get) |
| Moderation queue (platform) | case list, case detail | case ids, selected case | decide, view target |

Public web section: the search and listing detail screens also render server side on the directory web section (own subdomain per <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" />) for anonymous users and search engines, from the same projections and actions.

## 7. Agent behaviour

When asked:

* Organiser: "find three lighting suppliers within 50 miles of the venue for the festival dates under budget line X" runs `directory.search` with filters read from the F1 Event and its unfilled EquipmentRequirement items, the F10 site map and the F11 budget, explains the ranking, and offers a shortlist.
* Organiser: drafts the enquiry brief from the event and attaches the relevant run of show; compares quotes and explains differences in inclusions, not only price.
* Vendor: drafts a quote from offerings, F6 stock availability and F2 crew availability for the requested dates; drafts listing copy and alt text from uploaded photos for the user to approve.

Proactive (behind the flag, opt-in per user):

* Nudge an organiser when a quote is about to expire or a supplier has replied.
* Nudge a vendor when an enquiry has waited longer than their usual response time.
* After an event closes, propose review invitations for every engagement.

Approvals: anything that reaches another business or the public is confirm or always (publish, send enquiry, message as an agent, send quote, accept quote, submit or respond to review). The agent never accepts a quote without explicit approval (always). Bulk enquiry to more than 5 recipients always asks.

Safety: listing text, reviews, messages and quote terms written by another tenant are untrusted data in the agent's context and are marked as such in the projection; instructions inside them are never followed. The agent must not write or solicit reviews (fake review rules, section 11).

## 8. Integrations

Each behind a neutral port in its own integration package; no vendor chosen here, each needs approval on its child issue.

* Geocoding and maps tiles: `Geocoder` port (address to point, region lookup) and map rendering via the F10 map stack. Search by radius works from stored points without a live call.
* Search index: Postgres full text and vector search through the <issue id="2cd1c920-450c-487e-b4c8-e860a382a6b0" label="EVE-26" href="https://linear.app/resnovas/issue/EVE-26/port-search-and-embeddings-across-every-resource" /> search port; geo filtering in Postgres (decision D5-4).
* Business verification: manual moderator review in v1 behind a `TraderVerifier` port, so a registry lookup service can be added later.
* Bot protection on anonymous enquiries and reports: `HumanCheck` port.
* Email and push for new enquiries, replies and quotes: <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> notifications.
* Payments between organiser and vendor (D5-6 b): the organiser pays the vendor's connected account through F9 checkout and the PaymentGateway port (<issue id="382cab34-de6b-4524-8a47-241353c76b2b" label="EVE-174" href="https://linear.app/resnovas/issue/EVE-174/f93-build-the-payment-gateway-port-and-online-card-payments" />), with Eventiva's commission taken as the platform fee through F9 split payments (<issue id="05f45c5a-d89d-44e3-b726-e3a04db95a21" label="EVE-223" href="https://linear.app/resnovas/issue/EVE-223/f912-build-vendor-sales-at-events-with-split-payments" />); refunds and disputes through F9.8 (<issue id="cc848306-1827-4682-a18a-e5c255970dd3" label="EVE-215" href="https://linear.app/resnovas/issue/EVE-215/f98-build-refunds-cancellations-exchanges-and-disputes" />). Eventiva holds no balance. A monthly commission statement and VAT invoice goes to each vendor from the operator tenant (F11, <issue id="2ef1ed05-1c6a-4b1b-9b1c-04331398cac8" label="EVE-126" href="https://linear.app/resnovas/issue/EVE-126/f114-build-sales-invoices-credit-notes-and-receivables" />).
* Claim invitations and domain-email claim checks: <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> email, with a suppression list.

## 9. Permissions and roles

Permissions: listing:read, listing:write, listing:publish, shortlist:write, enquiry:read, enquiry:write, enquiry:send, enquiry:respond, quote:write, quote:send, quote:accept, review:write, platform:moderate, platform:taxonomy.

| Role | Grants |
| -- | -- |
| Anonymous visitor | public search and listing read; report with human check |
| Organiser tenant member (planner) | shortlist:write, enquiry:read, enquiry:write, enquiry:send, enquiry:respond |
| Organiser tenant approver (budget holder) | above plus quote:accept |
| Vendor tenant member (sales) | listing:read, listing:write, enquiry:read, enquiry:respond, quote:write, quote:send |
| Vendor tenant owner or marketing | above plus listing:publish |
| Professional (single-person tenant) | all vendor permissions on their own listing |
| Review invitation holder | review:write for that one engagement |
| Platform moderator | platform:moderate; no access to private threads except content reported to them |

Added 2026-11-08: platform:seed (Eventiva staff who add unclaimed listings), platform:commission (Eventiva finance: plans, adjustments, write-offs; separate from moderation). Organisers may seed a business for their own use; it goes public only after moderation.

Cross-tenant rule: a vendor sees only enquiries addressed to their listing; recipients of one enquiry never see each other's identity, messages or quotes. Agents get at most the permissions of the person they act for (<issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />).

## 10. Telemetry and flags

Flag: `directory-marketplace` (default off), with sub-flags `directory-public-web`, `directory-reviews`, `directory-agent-sourcing`, `directory-seeded-listings`, `directory-commission`, `directory-payments`. Extra events: directory_listing_seeded, directory_listing_claimed, directory_claim_disputed, directory_payment_requested, directory_payment_paid, directory_payment_refunded, directory_commission_collected, directory_payment_settled_off_platform (amount buckets only). Sub-flag `directory-payments` covers quote payments. Seeding metric: share of unclaimed listings claimed within 90 days.

Events (PostHog, via <issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" /> tracking port, pseudonymous ids, no message bodies): directory_search_performed (filters used, result count), directory_listing_viewed, directory_shortlist_item_added, directory_enquiry_sent (recipient count), directory_enquiry_responded (response time bucket), directory_quote_sent, directory_quote_accepted, directory_review_submitted, directory_listing_published, directory_content_reported. Group analytics by tenant.

Success metric: share of sent enquiries that reach an accepted quote within 30 days. Guardrails: median vendor first-response time, report rate per 1,000 listing views.

## 11. Compliance

* UK DMCC Act 2024 and CMA fake reviews guidance; EU Omnibus Directive (2019/2161): reviews only from verified engagements, disclosure of how reviews are collected and checked, no review incentives, no suppression of negative reviews.
* EU Digital Services Act and UK Online Safety Act where applicable: notice and action for illegal content, statement of reasons for moderation decisions, trader traceability (verified trader details before a business can publish to consumers).
* EU Platform-to-Business Regulation (2019/1150): publish the main ranking parameters (including that unclaimed listings rank below claimed ones at equal relevance, and that commission never affects ranking), disclose that paid placement does not exist in v1, and give commission terms in plain language with 15 days notice before any change.
* UK GDPR and EU GDPR: professionals are individuals, so their public profile is published only with explicit consent, can be unpublished and erased; enquiry messages are personal data with retention rules; data subject export covers threads.
* Accessibility: public pages meet WCAG 2.2 AA; venue access information is structured fields, not free text.
* Consumer law: quote terms carry the vendor's identity and cancellation terms; Eventiva is not a party to the contract and says so.
* Seeded listings: business facts only, from the business's own public material entered by a person; no scraping or third-party directory imports (terms and database right); a clear unclaimed label (CMA guidance on misleading information); removal on request within 30 days; claim invitations to business addresses carry an unsubscribe and honour a suppression list (PECR).
* Payments and commission: payments run on a regulated provider's connected accounts with the vendor as merchant of record, so funds never sit in an Eventiva balance; check the chosen provider's terms on <issue id="382cab34-de6b-4524-8a47-241353c76b2b" label="EVE-174" href="https://linear.app/resnovas/issue/EVE-174/f93-build-the-payment-gateway-port-and-online-card-payments" /> to confirm Eventiva needs no payment institution or safeguarding authorisation (Payment Services Regulations 2017) before the flag is turned on. The provider runs vendor identity checks at onboarding. VAT on the commission goes on a monthly invoice from F11. Consumer organisers get the vendor's cancellation and refund terms before paying.

## 12. Acceptance

* A vendor publishes a verified listing with venue rooms, offerings and media; an anonymous visitor finds it on the public web by category and radius.
* An organiser sends one enquiry to three listings from an F1 Event, each vendor sees only its own thread, two quote, the organiser compares and accepts one, and the handoff creates the F4 link, the [EVE-33](<https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters>) hold and the F11 commitment.
* The same flow runs end to end through the agent with approvals shown on screen and through MCP, with identical audit rows.
* A review can only be submitted from an engagement; a vendor can respond; a reported review goes to moderation with a statement of reasons.
* Cross-tenant negative tests: recipient A cannot read recipient B's thread or quote; a vendor cannot read the organiser's other enquiries; an agent for a planner without quote:accept cannot accept.
* Offline: an enquiry sent offline shows as queued and is sent on reconnect; a quote accepted after it expired while offline is rejected on sync with a clear message.
* An unclaimed listing is claimed by domain email, keeps its id, and an F1 Event that referenced it still resolves; a dispute can reverse the transfer.
* An organiser pays the deposit and balance of an accepted quote in Eventiva; each payment lands with the vendor less commission, a partial refund reverses commission in proportion, and organisers cannot see commission.

## 13. Out of scope

Escrow or Eventiva-held balances; payment plans beyond deposit and balance; paid placement and advertising; instant booking without a quote; contract e-signature (port later if needed); ticket resale; hotel room blocks; external marketplace syndication; automated background checks on professionals.

## 14. Dependencies

* Phase 1: <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" /> actions, <issue id="9d08c369-bac9-4eb7-b8a7-329b5ec9bff0" label="EVE-41" href="https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials" /> config, <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> storage and state machines, <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" /> identity, approvals and audit (cross-tenant rule), <issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" /> telemetry, <issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" /> change feed (vendor inbox and nudges), <issue id="0ab161c4-ed9c-4581-86fe-91fa1f4216aa" label="EVE-46" href="https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action" /> HTTP API (public web), <issue id="37c126a9-64e0-4235-88f0-494533c8e3a2" label="EVE-48" href="https://linear.app/resnovas/issue/EVE-48/p19-build-inbound-mcp-from-the-action-inventory" /> MCP, <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" /> screen awareness, <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" /> collaboration (description text), <issue id="3deaef52-8db8-490c-8143-b293ab5656a8" label="EVE-52" href="https://linear.app/resnovas/issue/EVE-52/p18a-build-the-agent-turn-loop-with-actions-as-tools" /> to <issue id="e00f04b6-a68b-41ed-8aa3-263fb8721b32" label="EVE-56" href="https://linear.app/resnovas/issue/EVE-56/p18e-build-the-agent-harness-outbound-acp-agent-memory-and-context" /> agent.
* Port later: <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> notifications, <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" /> files and media, <issue id="2cd1c920-450c-487e-b4c8-e860a382a6b0" label="EVE-26" href="https://linear.app/resnovas/issue/EVE-26/port-search-and-embeddings-across-every-resource" /> search, <issue id="b7f17f15-c893-46e9-9b3b-2aefae473802" label="EVE-27" href="https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource" /> comments, <issue id="338aae77-d10e-4f8a-9189-fe3655bd3572" label="EVE-28" href="https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent" /> localisation, <issue id="bef04957-8bec-479e-85ee-5880dfc9fc8c" label="EVE-29" href="https://linear.app/resnovas/issue/EVE-29/port-agent-evaluations-linked-to-posthog-datasets" /> agent evaluations, <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" /> scheduling and bookings.
* Feature sets: F1 Event (enquiry context and handoff target), F2 rosters (vendor crew availability), F4 Organisation and Contact (handoff), F6 inventory (quote drafting), F10 site maps (venue spaces), F11 commitments and commission invoices (<issue id="2ef1ed05-1c6a-4b1b-9b1c-04331398cac8" label="EVE-126" href="https://linear.app/resnovas/issue/EVE-126/f114-build-sales-invoices-credit-notes-and-receivables" />, <issue id="2dd28829-f5f7-4a45-bbf6-42592282e675" label="EVE-158" href="https://linear.app/resnovas/issue/EVE-158/f117-build-vat-codes-vat-returns-and-mtd-submission" />), F9 payment gateway port (<issue id="382cab34-de6b-4524-8a47-241353c76b2b" label="EVE-174" href="https://linear.app/resnovas/issue/EVE-174/f93-build-the-payment-gateway-port-and-online-card-payments" />), F13 qualifications, F14 website builder (vendor sites can embed their listing).

## 15. Decisions for Jonathan

Decided by Jonathan on 2026-11-08 (decision card: approve the defaults but allow seeded listings), plus his request to add commission:

* **D5-1 Who can appear in the directory: (b) chosen.** Tenant-owned listings plus unclaimed listings seeded by Eventiva or organisers, which owners claim later. Built in F5.13.
* **D5-2 Commercial model: commission added.** Free listings and enquiries; Eventiva charges commission on quotes accepted through the directory. Commission is deducted at source from organiser payments through F9 split payments (<issue id="05f45c5a-d89d-44e3-b726-e3a04db95a21" label="EVE-223" href="https://linear.app/resnovas/issue/EVE-223/f912-build-vendor-sales-at-events-with-split-payments" />); the vendor stays merchant of record and Eventiva holds no client money. Built in F5.14; billing model decided in D5-6 (b).
* **D5-3 Reviews: (a) verified only.**
* **D5-4 Geo search: (a) PostGIS on Neon, approved** as a new dependency for F5.4.
* **D5-5 Public web: (a) public, indexable directory subdomain.**
* **D5-6 Commission billing: (b) deduct at source, chosen 2026-11-08.** Organisers pay vendors for accepted quotes through Eventiva using F9 connected accounts and split payments (<issue id="05f45c5a-d89d-44e3-b726-e3a04db95a21" label="EVE-223" href="https://linear.app/resnovas/issue/EVE-223/f912-build-vendor-sales-at-events-with-split-payments" />); commission is taken as the platform fee; monthly VAT invoices for commission go to vendors. F5.14 waits for F9.3, F9.8 and F9.12. Commission rate: set in the CommissionPlan record before the flag is turned on; tests use 5 percent.

## 16. Child issues

Build order:

 1. <issue id="2d6f6f8d-4f15-4279-80cd-42db7339e8a0" label="EVE-75" href="https://linear.app/resnovas/issue/EVE-75/f51-build-the-listing-model-category-taxonomy-and-listing-actions" /> F5.1 Listing model, taxonomy and listing actions
 2. <issue id="5a6ad5e0-15b4-4dd5-ae48-5d5da0888027" label="EVE-77" href="https://linear.app/resnovas/issue/EVE-77/f52-build-the-listing-editor-screens-for-vendors-venues-and" /> F5.2 Listing editor screens
 3. <issue id="5bef8075-fb79-412e-aa4d-2a8f94ec0a5e" label="EVE-78" href="https://linear.app/resnovas/issue/EVE-78/f53-build-business-verification-publishing-and-content-moderation" /> F5.3 Business verification and moderation
 4. <issue id="02ee999d-064e-4b9d-9069-97118cd22549" label="EVE-79" href="https://linear.app/resnovas/issue/EVE-79/f54-build-directory-search-filters-geo-radius-and-transparent-ranking" /> F5.4 Directory search and ranking
 5. <issue id="999c2e83-1cb9-43be-8b2d-355339e1f0f1" label="EVE-113" href="https://linear.app/resnovas/issue/EVE-113/f55-build-the-public-directory-web-section-for-anonymous-visitors-and" /> F5.5 Public directory web section
 6. <issue id="5670f73d-f7a6-4fb6-8847-5f8d9a97811b" label="EVE-115" href="https://linear.app/resnovas/issue/EVE-115/f56-build-shortlists-of-suppliers-per-event" /> F5.6 Shortlists
 7. <issue id="03bd23d1-9da5-4272-8f2e-0b0bf4f7f846" label="EVE-119" href="https://linear.app/resnovas/issue/EVE-119/f57-build-cross-tenant-enquiries-rfps-and-private-message-threads" /> F5.7 Cross-tenant enquiries and message threads
 8. <issue id="f08bafe4-f32d-4906-9e87-5d69df56d6a0" label="EVE-124" href="https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the" /> F5.8 Quotes, comparison and acceptance handoff
 9. <issue id="28d37ea3-104d-4ac2-9aa6-88096835e45f" label="EVE-161" href="https://linear.app/resnovas/issue/EVE-161/f59-build-availability-signals-on-listings-from-the-vendors-own" /> F5.9 Availability signals on listings
10. <issue id="db6a25de-5a38-45d7-b1e6-fcfcce40c028" label="EVE-163" href="https://linear.app/resnovas/issue/EVE-163/f510-build-verified-reviews-vendor-responses-and-review-moderation" /> F5.10 Verified reviews and responses
11. <issue id="6b9fb04e-4228-4879-81c7-50cbc184a580" label="EVE-164" href="https://linear.app/resnovas/issue/EVE-164/f511-build-listing-insights-for-vendors" /> F5.11 Listing insights for vendors
12. <issue id="d4cc9e14-e41b-494a-a236-d205dd9c47b1" label="EVE-165" href="https://linear.app/resnovas/issue/EVE-165/f512-build-agent-sourcing-for-organisers-and-quote-drafting-for" /> F5.12 Agent sourcing and quoting behaviours
13. <issue id="0c66a703-79d5-407a-a0c0-69ab5efdc31b" label="EVE-236" href="https://linear.app/resnovas/issue/EVE-236/f513-build-seeded-listings-claiming-claim-disputes-and-removal" /> F5.13 Seeded listings, claiming, claim disputes and removal requests (build after F5.7)
14. <issue id="7dba7530-e7b6-4259-be26-9924f9ebddcb" label="EVE-237" href="https://linear.app/resnovas/issue/EVE-237/f514-build-marketplace-commission-on-accepted-quotes" /> F5.14 Quote payments with commission deducted at source (build after F5.8, F9.3, F9.8 and F9.12)

## Planning decision D5-14 - inventory-informed supplier recommendations and technical suitability (2026-11-13)

### Goal

Recommend suppliers for an event by comparing F1 exact/functional equipment needs against F6 product specification evidence, suppliers' actual declared/managed stock and permitted availability for the required event window. This extends D5-13 and coordinates F6 D6-7; do not treat a product match as proof of availability or a hire commitment.

### Discovery and ranking

* Directory supplier listings can surface **permission-controlled** F6-backed equipment/service capabilities; supplier may list individual products, kits or broader categories. For tenant that also uses F6, capture reserved, out-on-hire, returned, damaged/quarantined stock and upcoming reservations to derive potential fulfilment capacity without exposing confidential operations to other tenants.
* Match requirement ID/version and technical acceptance criteria to candidate reference product/model specifications with verifiable provenance; then consider date range, quantities, available accessories/complete kits, compatible stock, transport/service region, lead times, suitable crew or services where relevant and quote invitation preferences. Show 'technically matched', 'availability reported', 'availability unknown', and 'supplier confirmed' as **independent states**.
* Recommend/rank with concise grounded reasons and unknowns (e.g. 'can meet handheld-mic functional criteria; stock sufficient as of \[timestamp\]; supplier confirmation required'). Missing inventory data must not be ranked as proven unavailable or silently excluded by default; suppliers may still be approached with unknown stock. Never imply live availability if there is only an old snapshot or supplier assertion.
* Separate public listing fields from organiser-visible approved projections and supplier-private stock data. Supplier controls sharing policy; no raw serial numbers, customer event names, private locations, exact margins, valuation or non-public counts leak. Maintain tenant isolation across UI, agents, APIs and searches.
* For enquiry and quote entry, supplier can pick an existing model linked to their tenant F6 SKU/kit or upload a product record/datasheet that enters controlled import/dedup/spec verification (<issue id="eaa9fbf7-7a3c-4c1c-9470-a76edd5316ff" label="EVE-81" href="https://linear.app/resnovas/issue/EVE-81/f61-build-the-equipment-catalogue-products-tracking-modes-and-kits" />). A supplier does not need to publish all warehouse information to respond.
* Recommendation and quote-line evaluation refresh when requirements, model specifications, disclosed stock signals or availability windows change. Changes update internal views, but no re-quote messages, holds, commitments or outbound requests without D5-11/D5-12 manual authorisation.

### Validation

* Requirement for 5 microphones on a date returns a possible supplier with technically matching units but only 2 remaining after prior reservations, visibly marked 'quantity short'; another with 5 available but out-of-date data is 'needs confirmation'. A supplier without shared stock data remains discoverable as 'availability unknown'.
* Organiser sees permitted aggregate suitability/capacity, not supplier's physical asset serial numbers or other client contracts. External agents get identical scoped projections.
* Supplier imports a newly quoted microphone and its specifications are linked to a controlled catalogue record without overwriting a previously sent quote or declaring its unverified specifications 'certified'.

### Boundaries

F1 owns event requirements, F6 owns product/spec sources, supplier stock and reservations, F5 owns search, eligibility, quote matching and explanation. No claim of universally real-time stock, no auto-award and no user-facing false certainty. See <issue id="eaa9fbf7-7a3c-4c1c-9470-a76edd5316ff" label="EVE-81" href="https://linear.app/resnovas/issue/EVE-81/f61-build-the-equipment-catalogue-products-tracking-modes-and-kits" />, <issue id="928dc098-5cc9-4586-88bb-50abbe03071a" label="EVE-63" href="https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing" />, <issue id="f08bafe4-f32d-4906-9e87-5d69df56d6a0" label="EVE-124" href="https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the" /> and <issue id="03bd23d1-9da5-4272-8f2e-0b0bf4f7f846" label="EVE-119" href="https://linear.app/resnovas/issue/EVE-119/f57-build-cross-tenant-enquiries-rfps-and-private-message-threads" />. Planning only.

## Decision D5-15 - supplier-controlled inventory visibility, private data retention and recommendation permission (2026-11-13)

### Confirmed product direction

The supplier should be able to maintain as complete an inventory and structured product specification as useful in Eventiva, **independently of what it publishes to organisers or public directory visitors**. The user endorsed a supplier-configurable disclosure spectrum from detailed inventory through availability dates only to nothing visible. More complete, accurate inventory data should improve permitted matching and AI assistance, without overriding privacy or claiming that all private data can be used across tenants.

### Supplier-facing sharing choices (per supplier default, with category/product overrides)

* **Detailed / full product-and-availability disclosure:** publish chosen product/model/kit details, eligible counts or capacity and availability windows, subject to explicit field-by-field permissions. 'Full' refers to what the supplier selects for public/customer disclosure, never unrestricted warehouse/customer/finance records.
* **Availability dates only:** advertise relevant products or categories and a date/window availability indicator, with no exact stock counts, serial numbers, warehouse locations, client bookings, supplier costs or other private details.
* **Private / show nothing:** do not expose inventory lists, dates, capacity, availability indicators or inventory-derived rankings to prospective buyers through public/organiser-facing directory projections. The supplier's F6 inventory continues to work internally. A direct quote/enquiry may still include whatever information the supplier explicitly chooses to submit.
* Suppliers not using Eventiva inventory remain discoverable on their normal listing terms; availability is unknown until confirmed. Changes to visibility are permission-controlled and versioned/audited; revocation invalidates exposed search caches and unauthorised client or external-agent projections as promptly as technically feasible.

### Important separate control: private recommendation processing

* **Capture/storage**, **buyer-facing disclosure**, and **permission for cross-tenant private matching/recommendation** are three separate decisions. A supplier can retain detailed private data for its own stock management and own AI recommendations regardless of how public its directory listing is. Ingestion into Eventiva does **not** grant the platform or another tenant blanket access to that information.
* SUPERSEDED by D5-16: cross-tenant recommendation matching is enabled by default for suppliers managing inventory in Eventiva, with clear notice, an accessible explicit opt-out and policy-scoped internal processing. Public presentation still obeys the supplier's visibility choice; no hidden stock, inventory counts, date inference or claims of confirmed availability may leak via ranking details, explanations, API or agent tools. The option to appear in a generic area/category recommendation does not by itself disclose inventory.
* A supplier opting out of inventory-backed matching can still receive direct manual enquiries, appear through ordinary non-stock directory search, and use rich private AI recommendations within its own tenant. Suppressing stock-derived recommendations must not be misrepresented as removing the supplier from the directory.

### Recommendation correctness, trust and AI use

* Recommendations for organisers weigh F1 need, F6 evidence of suitability, requested dates, disclosed/permitted quantity coverage, kit completeness, freshness and supplier fit, with accurate unknown/tentative/confirmed distinctions. Internal access to private inventory does not make a prospective buyer entitled to see it; no silent data exfiltration via model prompts, logs, analytics or agent tools.
* More records alone do not guarantee higher AI quality. Track provenance, verification, updates, stale inventory, conflicting claims and coverage, and make explainable recommendations from authorised current evidence. Distinguish use of private data to compute a permitted recommendation from **training/fine-tuning a shared model**. Model training on supplier-private data is **not authorised by this decision**; it would need a separate explicit consent, purpose/retention policy and technical controls.
* Apply supplier/tenant data isolation to all humans and agents through shared Agent-Native action/permission pathways. Supplier matching preference is default-enabled only with transparent notice and a usable, revocable, auditable opt-out; review retention and any aggregation or sharing of derived data. Avoid recommender ranking leakage and model memorisation of confidential stock or clients.

### Acceptance examples

* A supplier manages 50 microphones and all hire-outs in F6. With 'dates only', a buyer sees only the permitted microphone listing and date signal, not quantity, reservations, other customers, serials or value; with 'private', none of those inventory details or derived signals appears.
* The supplier switches to detailed disclosure for one product, while keeping the remainder dates-only/private. The directory honours supplier and product exceptions; changing the choice cannot grant unrelated staff or external agents additional permissions.
* When the supplier hides all inventory but has not opted out of matching, it can appear in ordinary generic recommendations based on eligible internal signals, without exposing a named product, quantity, date, implicit availability guarantee or hidden-stock-specific explanation. Its own agent can still draft quotes from private stock. Opting out removes inventory-derived ranking signals but not ordinary listing discovery.
* When sharing is withdrawn, new searches no longer expose the revoked information, cached results are invalidated within a documented bounded window, and historical quote snapshots remain auditable where legally/contractually required without being republished.

### Remaining policy question and boundaries

**Resolved by D5-16**: matching is default-on with supplier notice and explicit opt-out; inventory visibility remains a separate control over disclosure. Private inventory can inform a generic supplier recommendation but must not be exposed, even indirectly, as product-level or availability claims. Planning only; no implementation or permissions have been changed.

## Decision D5-16 - inventory-informed recommendations enabled by default with explicit supplier opt-out and visibility-specific copy (2026-11-13)

### Goal and confirmed change to D5-15

Supplier participation in **internal inventory-informed recommendation matching is default-on**, not a separately required opt-in, when suppliers manage eligible stock/catalogue data through Eventiva under transparent product terms. A supplier may **explicitly opt out at any time**. Inventory publication remains independently controlled (detailed / availability dates only / hidden). The main user-facing difference across those three levels is **the claims and evidence the directory is permitted to disclose**, rather than disabling the common matching engine. This supersedes D5-15's earlier assumption that a hidden-inventory supplier needed a separate positive matching opt-in.

### Independent choices and defaults

* **Matching for directory recommendations:** enabled by default for eligible Eventiva-managed inventory, with a conspicuous explanation at supplier onboarding and inventory import, a simple 'Use my inventory to improve matching' on/off control, documented scope, audit, revocation and non-retroactive handling of existing tenants where notice/terms are inadequate. The choice is an opt-out, not a consent checkbox disguised as one; verify the applicable lawful basis, provider contracts and privacy duties before activating cross-tenant processing. If such a basis is absent, do not silently rely on implied authorisation.
* **Buyer-facing stock visibility:** independent preference detailed / availability windows only / hidden, with product/category overrides. This determines the claims the directory and agents can make. It does not automatically disable internal matching. Stock data remains tenant-owned for inventory operations under all settings.
* **Explicit out of matching:** removes supplier-private stock quantities, technical inventory composition and availability-derived signals from cross-tenant recommendation/ranking/indexes for that supplier, including derived caches and agent projections. It does NOT remove the supplier's public directory profile, ordinary non-inventory category/location recommendations, manually invited enquiries, or its own internal inventory and private AI features.
* A participating supplier can change either setting at any time, subject to rights/contractual retention and precise cache invalidation. Show separately what the platform uses internally versus what buyers are shown. Avoid manipulative UI: no penalty claims for opting out.

### Presentation policy / permitted explanation

| Supplier publication selection | Eligible internal use (if matching remains on) | Permitted organiser-facing recommendation |
| -- | -- | -- |
| Detailed | Technical specs, kit/quantity coverage and availability signals | Specific relevant products and permitted quantity/availability information, with evidence freshness and 'supplier confirmation required' where applicable. Only disclosed attributes are shown. |
| Dates only | Same eligible matching signals internally | Relevant product/category and allowed availability time windows, without counts, reservations, client detail, exact stock or private specs. Do not imply guaranteed booking. |
| Hidden / no inventory shown | Same eligible matching signals internally | Only a generic reason justified by **publicly disclosed** attributes, e.g. 'Supplier serving this area' or 'Works in live-event audio' if that service area/category is public. Do not mention matched equipment, stock existence, exact capacity, available dates, likelihood inferred from hidden stock, or state that the supplier meets a specific private inventory requirement. Clear route to send enquiry or seek confirmation. |

A hidden supplier may be selected in a general recommendation list using private eligibility signals, but such inclusion/ranking can itself leak information under repeated narrow searches. Prevent stock-oracle behaviour: do not provide per-product hidden-stock search, inventories/availability filters, public scores, itemised reason codes, dynamic positions or yes/no responses that allow third parties to reconstruct undisclosed information. Constrain private stock to coarse server-side candidate generation, add consistency/aggregation safeguards, minimise sensitivity and verify inference-resistance; if credible protection is impossible in a narrow query, fall back to ordinary publicly grounded recommendations, not pretend the stock has been verified publicly.

### Recommendation wording and truthfulness

* Model output must be grounded in the **allowed disclosure projection**, not raw supplier inventory. Keep an internal evidence/rationale record within authorised platform scope for auditing and matching quality; apply the exact same redaction rules to web, mobile, MCP, API, webhooks and external agents. Never pass raw stock into prompts or logs exposed to a buyer just because it informed candidate selection.
* Prefer measured wording. A supplier with hidden stock can be described as 'a supplier operating in the area' only when location/service-area listing data supports that. 'Good supplier' requires independently available reputation/relevance evidence; it is not a hidden-stock verification claim. Do not fabricate quality endorsements.
* With published dates or counts, use freshness-label, confirmed versus tentative statuses, and separately authorised confirmations before booking. No accidental promises from a private stock projection.
* Product reference metadata may be shared separately if genuinely non-confidential and verified; never conflate a model spec with permission to expose which supplier has that model.
* No model training/fine-tuning, cross-customer sale of data or reuse of private content for unrelated purposes is granted by default matching.

### Acceptance examples

* Supplier A owns/reserves 40 microphones, hides all inventory but leaves default matching enabled. An organiser sees Supplier A as a general local event supplier with a public-category/area explanation, **not** '40 microphones', 'available Thursday' or 'matches your 5-mic list'; its hidden stock is not directly searchable or reconstructable via repeated queries.
* Supplier B reveals dates only. Organiser can see permitted availability windows for the advertised category, but no units/stock counts. A fully disclosed supplier can show individually permitted models and availability evidence.
* Supplier C opts out: it still appears in ordinary supplier-directory discovery and can be approached manually, but stock-derived recommendations cease; cached derived results are invalidated. A first-party or external agent cannot recover hidden data through tools or prompts.
* Supplier visibility changes from detailed to hidden: buyers and their agents immediately receive only generic, publicly defensible copy; old public projections expire/invalidate within a documented bound. Historic explicitly sent quotes remain in authorised commercial records.

### Boundaries

This is a **product-design decision**, not a legal determination that merely storing private supplier records grants unrestricted cross-tenant reuse. Review supplier agreements, notice and applicability before enabling new processing for existing tenants. Technical processing permissions and public disclosure permissions stay separate; F6 holds canonical stock, F5 controls ranking and text. D5-11 manual outbound supplier contact and D5-13/D5-14 technical matching standards remain. Planning only; no settings or real data were changed.

## Linear comments (1)

### Comment 56f1d1b1-51bd-4a64-a961-d91a307280a6

Author: GitHub. Created: 2026-11-01T13:05:55.908Z; updated: 2026-11-01T13:05:55.887Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/833). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
