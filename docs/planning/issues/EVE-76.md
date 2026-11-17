<!-- linear:generated:start -->
# EVE-76: F8 Ticketing: ticket types, capacity, issuance, admissions and scanning

[Live Linear source](https://linear.app/resnovas/issue/EVE-76/f8-ticketing-ticket-types-capacity-issuance-admissions-and-scanning) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:28.556Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | None recorded |
| Children | [EVE-112](EVE-112.md), [EVE-114](EVE-114.md), [EVE-117](EVE-117.md), [EVE-122](EVE-122.md), [EVE-162](EVE-162.md), [EVE-192](EVE-192.md), [EVE-193](EVE-193.md), [EVE-194](EVE-194.md), [EVE-195](EVE-195.md), [EVE-209](EVE-209.md), [EVE-211](EVE-211.md), [EVE-212](EVE-212.md) |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-13](EVE-13.md), [EVE-15](EVE-15.md), [EVE-17](EVE-17.md), [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-26](EVE-26.md), [EVE-27](EVE-27.md), [EVE-28](EVE-28.md), [EVE-30](EVE-30.md), [EVE-38](EVE-38.md), [EVE-39](EVE-39.md), [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-45](EVE-45.md), [EVE-46](EVE-46.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-73](EVE-73.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Approved (2026-11-08, Jonathan, decision card): D1, D2, D4 and D5 as recommended; D3 changed to (b), a seat map editor inside F8 now. Planning only; no implementation until Jonathan asks. Follows the [Feature set spec template](<https://linear.app/resnovas/document/feature-set-spec-template-and-list-26b9f78cf17a>). F1 entities from <issue id="fbcff205-decd-464a-b8ab-a1278e71fbe4" label="EVE-73" href="https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show" /> (Event, Phase, Space, Segment) are referenced by id, not redefined; Venue is F5's record. A ticket admits to an Event, optionally narrowed to a Phase (for example day 2), a Space (zone) or a Segment with audience public (for example a workshop slot); this issue calls that the admission scope. F9 line-provider contract agreed with the F9 thread: kind ticket maps reserve to ticketing.hold.create, commit to ticketing.ticket.issueForOrder and release to ticketing.hold.release (unpaid) or ticketing.ticket.void (paid); offline box office uses a pre-allocated per-device quota from a capacity pool.

## 1. Goal

An organiser can sell, issue and admit tickets for any F1 Event (optionally narrowed by admission scope) from one app, and the gate keeps admitting people safely when the network drops, with no oversell and no double entry.

## 2. Users and jobs

| User | Jobs |
| -- | -- |
| Organiser / ticketing manager | Design ticket types and prices, set capacity and sales windows, release holds, open and close sales, watch sales, run the waiting list, void or reissue tickets |
| Box office staff | Sell and print or send tickets in person, look up and reissue tickets, change holder names, sell from an offline quota when the network is down |
| Gate staff (crew) | Scan tickets at an entry point, see a clear admit or reject result, handle re-entry, admit manually by lookup, keep scanning offline |
| Attendee / ticket holder | Find tickets, show the code, fill in attendee details, transfer to a friend, join a waiting list, return a ticket for resale |
| Buyer | Buy several tickets, name each holder, see order status (order itself is F9) |
| Finance | Read sales and admission totals per event, reconcile with F9 orders and F11 ledgers |
| Vendor / promoter (later) | Sell an allocation through their own link or access code |
| Agent | Every job above under the delegating user's permissions: draft a ticket structure from the event brief, watch sell-through and capacity, chase incomplete attendee details, answer holder questions, prepare the gate briefing |

## 3. Market check

Checked 2026-11-01 (names stay out of customer copy):

* **pretix** (open source): check-in lists limited to products; its scanner app has an "asynchronous" mode that keeps a local copy of attendee data and scans without internet, syncing in the background; badge printing after a scan; a ticket vending kiosk app. ([check-in features](<https://pretix.eu/about/en/features/checkin>))
* **DICE**: app-only tickets to fight touting, a waiting list that resells returned tickets at face value, tight limits on transfer and resale. ([summary](<https://www.tickettailor.com/blog/dice-reviews-summary-pros-cons>))
* **Ticket Tailor**: low flat fees, seating charts with seat choice, a waitlist after sell-out, free check-in app with camera or external scanner, organiser connects their own payment provider (Stripe, Square, PayPal). ([how it works](<https://tickettailor.com/how-it-works>))
* **Eventbrite** (from memory, not re-checked): discovery marketplace plus self-serve ticketing; marketplace reach is its edge.

Where Eventiva matches: ticket types with capacity pools, waitlist, organiser-owned payments (through F9), offline scanning with background sync (pretix model), badges.
Where Eventiva differs: tickets are part of the same Event record that production, crew, fleet and site maps use, so the gate briefing, crew roster and capacity on the site map come from one source; the agent can do every ticketing job through the same actions; one app serves organiser, gate crew and attendee by role (no separate scanner app); tickets are signed so a device can verify a ticket it has never synced (stronger than list-only offline mode); face-value official resale through the waiting list is built in. Discovery marketplace reach is F5's job, not F8's.

## 4. Capabilities as actions

All actions follow [EVE-40](<https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema>) (Effect Schema input and output, typed errors, one permission, approval policy, side-effect class, receipts). Scope is the org ([EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>)); every input carries the F1 Event (optionally narrowed by admission scope) id it acts on. Approval: none / confirm (agent must ask the user) / always (agent needs explicit approval every time).

| Action | Input | Output | Permission | Agent approval |
| -- | -- | -- | -- | -- |
| ticketing.ticketType.create | event or admission scopes, name, price tiers (amount, currency, valid from/to), pool id, per-order min/max, visibility (public, hidden, access-code), attendee questions, transferable flag, re-entry rule | TicketType | ticketing:manage | none (draft) |
| ticketing.ticketType.update | id, patch | TicketType | ticketing:manage | confirm if on sale |
| ticketing.ticketType.publish / unpublish | id | TicketType | ticketing:manage | confirm |
| ticketing.ticketType.archive | id | TicketType | ticketing:manage | confirm |
| ticketing.pool.create / update | admission scope, name, capacity, optional parent pool | CapacityPool | ticketing:manage | confirm if lowering capacity |
| ticketing.pool.availability | pool or ticket type id | available, held, sold, admitted | ticketing:read or public for published types | none |
| ticketing.salesWindow.set | ticket type id, opens at, closes at, on-sale queue on/off | TicketType | ticketing:manage | confirm |
| ticketing.accessCode.create / revoke | event id, code, unlocks ticket type ids, max uses, expiry | AccessCode | ticketing:manage | none / confirm |
| ticketing.hold.create | lines (ticket type id, qty), purpose (checkout, manual, offline-quota), ttl | Hold with expiry | ticketing:sell or public checkout | none |
| ticketing.hold.release / extend | hold id | Hold | ticketing:sell (own) or ticketing:manage | none |
| ticketing.ticket.issueForOrder | F9 order id, lines with hold ids, holder details | Ticket\[\] | system (F9 order-paid event) or ticketing:sell | not agent-callable directly |
| ticketing.ticket.issueComp | ticket type id, qty, holder details, reason | Ticket\[\] | ticketing:manage | always |
| ticketing.ticket.get / list / search | ids or filters | Ticket(s), masked by role | ticketing:read, holder for own | none |
| ticketing.ticket.updateHolder | ticket id, name, email, answers | Ticket | holder (if allowed) or ticketing:sell | confirm |
| ticketing.ticket.void | ticket id, reason (refund, fraud, reissue, cancel) | Ticket | ticketing:manage or system (F9 refund) | always |
| ticketing.ticket.reissue | ticket id | new Ticket, old voided | ticketing:sell | confirm |
| ticketing.ticket.deliver | ticket ids, channel (email, in-app, pdf, wallet) | delivery receipts | ticketing:sell or holder for own | confirm for bulk |
| ticketing.transfer.offer / accept / cancel | ticket id, recipient email | Transfer | holder | confirm |
| ticketing.waitlist.join / leave | ticket type id or admission scope, qty, contact | WaitlistEntry | public or holder | none |
| ticketing.waitlist.offer | entry ids or next N | offers with hold and expiry | ticketing:manage | confirm |
| ticketing.resale.list / withdraw | ticket id | ResaleListing (face value) | holder | confirm |
| ticketing.checkInList.create / update | admission scope, name, ticket type ids, gates, time window, re-entry rule | CheckInList | ticketing:manage | confirm |
| ticketing.scan.submit | device id, list id, code payload, scanned at, offline flag | ScanResult (admitted, rejected with reason, warning) | ticketing:scan | not agent-callable (device only) |
| ticketing.checkIn.manual | ticket id, list id, reason | ScanResult | ticketing:scan | always |
| ticketing.checkIn.undo | scan id, reason | ScanResult | ticketing:manage | always |
| ticketing.device.register / revoke | name, gate, list ids, offline quota | ScannerDevice with device key | ticketing:manage | confirm / none |
| ticketing.device.snapshot | device id | signed validity snapshot for offline use | ticketing:scan (registered device) | not agent-callable |
| ticketing.boxOffice.allocateOfflineQuota | device id, ticket type id, qty | Hold (purpose offline-quota) | ticketing:manage | confirm |
| ticketing.report.sales / admissions | event or admission scope, range, grouping | report rows | ticketing:read or finance:read | none |
| ticketing.export.attendees | admission scope, fields | file reference ([EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>)) | ticketing:manage | confirm (personal data) |
| ticketing.gateBriefing.generate | admission scope | document: lists, gates, expected arrivals, rules | ticketing:read | none |
| ticketing.seatPlan.create / update / generateRows / assignZone / setSeatState / publish / duplicate (F8.11) | space id, plan patch ops, row spec, zone to ticket type, seat state | SeatPlan (Yjs document, versioned) | ticketing:manage | confirm for publish and for killing seats on sale |

Navigation to every ticketing screen is an action too (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />).

## 5. Data model

Tenant scope: org. Every row carries org id and the F1 Event id; admission scope (phase id, space id or public segment id) where capacity applies.

* **CapacityPool**: admission scope, name, capacity, parent pool (for nested limits, e.g. venue total over standing and seated). Counters (held, sold, admitted) are owned by a cluster entity per pool, not by rows edited by clients.
* **TicketType**: event id, admission scopes, pool id, name, description (rich text document, Yjs, embedded per [EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>)), price tiers, currency, sales window, visibility, per-order limits, attendee questions (schema), transferable, resale allowed, re-entry rule, status (draft, on sale, paused, sold out, closed, archived).
* **AccessCode**: code hash, unlocks ticket types, max uses, used count, expiry.
* **Hold**: lines, purpose, owner (checkout session, user, device), expires at, status (active, converted, released, expired).
* **Ticket**: ticket type id, admission scope, F9 order id and line id (null for comps), holder name and email, answers, status (valid, void, transferred-out), secret (random 128-bit), signed payload version, issued at, seat ref (F8.11 SeatPlan seat).
* **SeatPlan** (F8.11): F1 Space ref, sections, rows, seats, tables, general-admission areas, price zones; a collaborative Yjs document per <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />, versioned, locked to a published version while on sale.
* **Transfer**, **WaitlistEntry**, **ResaleListing**: as named in section 4.
* **CheckInList**: admission scope, ticket types, gates (F1 Space or F5 Venue refs), time window, re-entry rule (single, unlimited, n times, with exit scan).
* **Scan**: append-only admission ledger: ticket id or raw payload, list id, device id, gate, scanned at (device clock and server receive time), result, reason, offline flag, user.
* **ScannerDevice**: name, user, gate, list ids, public key, offline quota hold id, last sync, revoked at.

Offline and conflict rules per field:

| Data | Offline on device | Conflict rule |
| -- | -- | -- |
| TicketType and pool settings | read-only copy | server wins; edited only online |
| Pool counters | never edited offline | owned by the pool entity; offline sales only consume a pre-allocated device quota hold, so they cannot oversell |
| Ticket validity snapshot (id, type, status, holder name, secret hash) | read-only, signed, refreshed on sync | server wins; void on server beats an offline admit, which is then flagged for review, not silently reverted |
| Scan ledger | append-only, queued | union of all scans (no edits); for single-entry lists the earliest server-ordered admit is the valid one, later admits of the same ticket become duplicate-entry alerts |
| Holder name and answers | editable at box office offline | last writer wins per field with audit; holder's own edits rank equal |
| TicketType description | Yjs document | merges per <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" /> |

## 6. Screens

All components from Rambo-UI (names are the expected component kinds; Rambo-UI has none yet). Every control binds to the action shown; every screen declares a screen-context projection (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />) filtered by role.

| Screen | Components | Projection | Actions behind controls |
| -- | -- | -- | -- |
| Event tickets (tab on the F1 Event) | data table, form sheet, status badge, price input | event id, ticket types with status, price, pool availability, selection | ticketType.*, pool.*, salesWindow.set, navigation |
| Capacity board | stacked bar, tree of pools | pools with held/sold/admitted, selected pool | pool.update, hold.release |
| Ticket type editor | form, rich text, question builder | the type being edited, dirty fields, validation errors | ticketType.create/update/publish |
| Attendee list | data table with filters, search, row sheet | filters, visible rows (masked), selected ticket | [ticket.search/updateHolder/void/reissue/deliver](<http://ticket.search/updateHolder/void/reissue/deliver>), export.attendees |
| Ticket detail | card, timeline (scans, transfers) | ticket, status, history | ticket.\*, checkIn.manual/undo |
| Check-in setup | list, gate picker (F1 Space or F5 Venue), rule picker | lists, gates, devices | checkInList.\*, device.register/revoke |
| Scanner | camera scanner, large result banner, counter, offline indicator | list, last result, admitted count, sync state (no attendee data beyond name and type) | scan.submit, checkIn.manual |
| Box office | product grid, cart (F9), holder form, print button | admission scope, available types, offline quota left | hold.create, F9 checkout, ticket.deliver |
| Waiting list | data table, offer button | entries, positions, offers outstanding | waitlist.offer |
| Sales dashboard | charts ([EVE-30](<https://linear.app/resnovas/issue/EVE-30/port-data-widgets-saved-dashboards-and-brand-kits>) widgets) | totals, sell-through, pace vs target | report.sales/admissions |
| My tickets (attendee, same app) | ticket cards with code, transfer and resale buttons | own tickets only | ticket.get, transfer.*, resale.*, waitlist.\* |
| Public ticket picker (on F14 sites) | ticket list, quantity steppers | published types and availability | pool.availability, hold.create then F9 checkout |

## 7. Agent behaviour

When asked: build a ticket structure from the event brief (drafts only), change prices or windows (confirm), produce sales and admission reports, find and fix a holder's ticket, prepare the gate briefing, offer waiting list places (confirm).
Proactively (as suggestions in the agent thread, never acting alone): capacity at 80 and 95 percent, sell-through pace behind target, expiring holds blocking sales, attendee details missing within 48h of doors, duplicate-entry alerts after offline sync, devices not synced for over 10 minutes during doors.
Always needs approval: comps, voids, check-in undo, manual admits, bulk delivery or messages, lowering capacity, exports of personal data. Never: scanning on behalf of a device, issuing tickets for an unpaid order, raising capacity above the F1 Space or F5 Venue safe capacity.

## 8. Integrations

Each behind a neutral Effect port in an integration package (<issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> rule 4); none is chosen here.

* **Payments, orders, refunds**: F9's ports, not F8's. F8 only reacts to F9 order events.
* **Delivery**: email and push through <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" />.
* **PDF tickets and badges**: <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" /> files; rendering library needs approval.
* **Wallet passes** (Apple Wallet, Google Wallet): WalletPass port; needs vendor accounts and approval (slice F8.10).
* **Barcode/QR rendering and decoding**: library choice needs approval; camera through Expo on native, web camera on web.
* **Hardware**: USB/Bluetooth scanners in keyboard mode (no SDK); receipt and ticket printers through the OS print path first; native printer SDKs only on approval.
* **Outbound webhooks**: ticket issued, voided, scanned, through the platform webhook surface (<issue id="cc5eba91-a4f7-4542-b332-10d3e1d70ed8" label="EVE-15" href="https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol" /> matrix).

## 9. Permissions and roles

Permissions: ticketing:read, ticketing:manage, ticketing:sell, ticketing:scan, finance:read, plus holder rights on own tickets. Default roles: Organiser owner (all), Ticketing manager (manage, sell, scan, read), Box office (sell, scan, read), Gate staff (scan only; sees holder name and ticket type, never email, answers or order), Finance (finance:read, ticketing:read), Attendee (own tickets, transfers, waiting list), Public (published types and availability only). Agents act as the delegating user and inherit exactly that role (<issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />). Revoking a device or a role stops scans at the next request and invalidates the device key; an offline device keeps working until its snapshot expires (default 24h, set per list).

## 10. Telemetry and flags

Flag `ticketing` (default off) with sub-flags `ticketing-offline-scan`, `ticketing-waitlist-resale`, `ticketing-box-office`, `ticketing-wallet`, `ticketing-seating` (all default off). PostHog events (no personal data, ids pseudonymous): ticket_type_published, hold_created, hold_expired, ticket_issued, ticket_voided, ticket_transferred, waitlist_joined, waitlist_offer_accepted, scan_result (result, offline, latency bucket), offline_sync_completed (queued count, duplicates), device_registered. Spans on every action (<issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" />); metrics: scan latency, pool contention, hold expiry rate.
Success metrics: zero oversold pools; scan-to-result p95 under 300 ms offline and 800 ms online; duplicate admits under 0.1 percent of scans after offline sync; organiser can go from event to tickets on sale in under 10 minutes.

## 11. Compliance

Verify with legal before launch; this list is a starting point.

* **All-in pricing**: UK DMCC Act 2024 (drip pricing) and US FTC rule on unfair or deceptive fees (live-event tickets): the first price shown includes mandatory fees. F8 shows prices from F9's price breakdown.
* **Secondary ticketing**: UK Consumer Rights Act 2015 s.90 to 95 information duties apply to resale; F8 only offers face-value official resale; track proposed UK resale price caps.
* **Cancellation rights**: EU and UK distance-selling cooling-off exemption for date-specific leisure services; refund policy is the organiser's, enforced through F9.
* **Personal data**: UK GDPR and GDPR: data minimisation at the gate, retention limit for attendee data after the event (default 12 months, configurable), export and deletion through [EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>), consent for marketing separate from ticket delivery.
* **Payments**: PCI DSS stays out of F8 (no card data); F9 owns it.
* **Accessibility**: companion and accessible tickets as ticket types with questions; screens meet WCAG 2.2 AA; scanner result banner readable in sunlight and by colour-blind staff (shape and text, not colour alone).
* **Safety**: capacity cannot exceed the F1 Space or F5 Venue safe capacity; admitted count per gate available for safety officers.

## 12. Acceptance

* Two buyers racing for the last ticket: one succeeds, one gets a sold-out error; 10,000 concurrent holds against a 1,000-capacity pool never sell more than 1,000 (load test).
* A ticket bought through F9 is issued, delivered and admitted at a scanner; a refund in F9 voids it and the next scan rejects it.
* Two devices scan offline for 30 minutes, one admits a ticket the other also admits; after sync, one admit stands, the other is a duplicate-entry alert, and both devices show it.
* A device that has never synced a ticket verifies its signature and admits it offline; a forged code is rejected.
* Box office sells offline from a quota and cannot exceed it; sales reconcile with F9 on reconnect.
* The agent drafts ticket types for a sample event, asks before publishing, and cannot void or comp without approval; every screen's projection lets it see what the user sees.
* Gate staff cannot see holder email or order details through any surface (UI, HTTP, MCP, agent).
* Parity check (<issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />) passes for all ticketing actions and UI bindings (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />).

## 13. Out of scope

Checkout, payments, discount codes, refunds and tax (F9). Accounting entries (F11). Discovery marketplace listing (F5). Event sites and page design (F14; F8 provides the ticket picker). Dynamic or demand pricing, auctions, memberships and season tickets, distribution to third-party sales channels, open resale at buyer-set prices, RFID or NFC wristbands and turnstile integration (candidates for a later slice once hardware is chosen), and identity verification at the gate.

## 14. Dependencies

* Phase 1: [EVE-40](<https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema>) actions, [EVE-41](<https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials>) secrets (signing keys), [EVE-42](<https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state>) storage, [EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>) identity and access, [EVE-44](<https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor>) telemetry, [EVE-45](<https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change>) change feed, [EVE-46](<https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action>) HTTP API, [EVE-50](<https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen>) screen awareness, [EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>) sync and collaboration, [EVE-52](<https://linear.app/resnovas/issue/EVE-52/p18a-build-the-agent-turn-loop-with-actions-as-tools>) and [EVE-54](<https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow>) agent and durable runs. Spike [EVE-17](<https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and>) (sync engine) decides the offline transport. [EVE-39](<https://linear.app/resnovas/issue/EVE-39/make-every-entity-action-idempotent-and-persisted-by-default>) (idempotent entity actions) and [EVE-38](<https://linear.app/resnovas/issue/EVE-38/cut-runner-loss-failover-from-36s-and-expose-the-cluster-settings-in>) (failover) matter for the pool entity.
* Port-later: [EVE-24](<https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email>) notifications and email, [EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>) files, [EVE-26](<https://linear.app/resnovas/issue/EVE-26/port-search-and-embeddings-across-every-resource>) search, [EVE-28](<https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent>) localization, [EVE-30](<https://linear.app/resnovas/issue/EVE-30/port-data-widgets-saved-dashboards-and-brand-kits>) dashboards, [EVE-27](<https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource>) comments (on ticket types).
* Feature sets: F1 <issue id="fbcff205-decd-464a-b8ab-a1278e71fbe4" label="EVE-73" href="https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show" /> (Event, Phase, Space, Segment, TeamMember for gate crew), F5 (Venue), F9 (orders, payments, refunds, box office checkout), F2 (gate staff rosters), F4 (holders as contacts), F10 (gate positions; optional backdrop for the F8 seat map editor), F11 (revenue), F14 (public ticket picker).

## 15. Decisions for Jonathan

* **D1 Boundary with F9**: (a) F8 owns ticket types, capacity, holds, tickets and admission; F9 owns checkout, orders, payments and refunds. (b) F8 has its own ticket checkout. **Recommend (a)**: one checkout for tickets, merchandise and services.
* **D2 Offline scanning**: (a) signed tickets plus a synced validity snapshot and an append-only scan ledger. (b) synced list only (pretix style). (c) online only. **Recommend (a)**: works for tickets issued after the last sync and resists forgery.
* **D3 Reserved seating**: (a) general admission and capacity zones first, seats later on F10 site maps. (b) build a seat map editor inside F8 now. (c) no seating. **Decided (b)** on 2026-11-08: F8.11 builds an F8 seat map editor now; it may show an F10 site map as a backdrop but does not wait for F10.
* **D4 Resale and transfer**: (a) organiser-controlled transfers plus face-value resale through the waiting list. (b) transfers only. (c) open resale at any price. **Recommend (a)**: protects fans and stays inside UK resale rules.
* **D5 Ticket delivery**: (a) in-app and email QR plus PDF first, wallet passes as a later slice. (b) wallet passes from the start. **Recommend (a)**: no vendor accounts needed to start.

## 16. Child issues (build order)

 1. F8.1 <issue id="befba1e2-7fb2-4ab8-a9fa-a0efcf2ebfae" label="EVE-112" href="https://linear.app/resnovas/issue/EVE-112/f81-build-the-ticket-catalogue-ticket-types-capacity-pools-sales" /> Ticket catalogue: ticket types, capacity pools, sales windows, access codes
 2. F8.2 <issue id="eed7c2f7-0dc7-43cb-8b86-6324a06e36d5" label="EVE-114" href="https://linear.app/resnovas/issue/EVE-114/f82-build-the-capacity-engine-oversell-proof-holds-on-a-cluster-entity" /> Capacity engine: oversell-proof holds on a cluster entity per pool, F9 line provider, on-sale queue
 3. F8.3 <issue id="55f17a19-e0f5-4a67-b779-0d118ecd75da" label="EVE-117" href="https://linear.app/resnovas/issue/EVE-117/f83-build-ticket-issuance-and-delivery-signed-tickets-from-paid-orders" /> Issuance and delivery: signed tickets from paid orders, comps, voids, reissue
 4. F8.4 <issue id="b11d671d-2a5f-4e92-a9a4-da4d61c3d64d" label="EVE-122" href="https://linear.app/resnovas/issue/EVE-122/f84-build-the-attendee-view-my-tickets-holder-details-and-transfers-in" /> Attendee view: my tickets, holder details, transfers
 5. F8.5 <issue id="57212326-6c0e-4711-a80a-d34efa6ffd87" label="EVE-162" href="https://linear.app/resnovas/issue/EVE-162/f85-build-check-in-lists-and-online-scanning-in-the-app" /> Check-in lists and online scanning
 6. F8.6 <issue id="257d6693-f9de-4779-a911-c07895c8f06e" label="EVE-192" href="https://linear.app/resnovas/issue/EVE-192/f86-build-offline-scanning-validity-snapshots-local-scan-ledger-sync" /> Offline scanning: snapshots, local ledger, sync, duplicate alerts
 7. F8.7 <issue id="2a381308-d018-4984-a018-c3a7453e3e4b" label="EVE-193" href="https://linear.app/resnovas/issue/EVE-193/f87-build-the-box-office-in-person-ticket-sales-reprints-and-offline" /> Box office: in-person sales, reprints, offline quota sales
 8. F8.8 <issue id="6618b76f-19ed-47a6-8dd9-cf73789d5d85" label="EVE-194" href="https://linear.app/resnovas/issue/EVE-194/f88-build-the-waiting-list-and-face-value-resale" /> Waiting list and face-value resale
 9. F8.9 <issue id="325c1b43-063c-49a1-a818-f8be8db0cd91" label="EVE-195" href="https://linear.app/resnovas/issue/EVE-195/f89-build-ticketing-reports-the-sales-dashboard-and-attendee-exports" /> Reports, sales dashboard, attendee exports, retention
10. F8.10 <issue id="a3ce723f-5587-4670-909a-5e1a335c8e8a" label="EVE-209" href="https://linear.app/resnovas/issue/EVE-209/f810-add-wallet-passes-for-tickets-behind-a-neutral-port" /> Wallet passes behind a neutral port (needs vendor approval)
11. F8.11 <issue id="3682ce53-f6e7-41d9-a911-2fb44d73f7c6" label="EVE-211" href="https://linear.app/resnovas/issue/EVE-211/f811-add-reserved-seating-on-f10-site-maps" /> Seat map editor and reserved seating in F8 (D3 b)
12. F8.12 <issue id="96e3bf8c-3a1b-4b1e-920e-4a6d89e14752" label="EVE-212" href="https://linear.app/resnovas/issue/EVE-212/f812-build-ticketing-agent-behaviour-watchers-gate-briefing-and" /> Agent behaviour: watchers, gate briefing, approval tests

F8.1 to F8.6 are the minimum to run a ticketed event end to end with offline doors; F8.7 to F8.12 can follow in any order once their blockers clear.

## Linear comments (1)

### Comment 85b8b5fe-aaac-4c1d-8897-82b72d5d8be5

Author: GitHub. Created: 2026-11-01T13:06:54.089Z; updated: 2026-11-01T13:06:54.044Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-76/f8-ticketing-ticket-types-capacity-issuance-admissions-and-scanning) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/843). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
