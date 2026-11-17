<!-- linear:generated:start -->
# EVE-63: F6 Warehousing and inventory: equipment, stock, availability, purchasing and maintenance

[Live Linear source](https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:43.352Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | None recorded |
| Children | [EVE-81](EVE-81.md), [EVE-103](EVE-103.md), [EVE-118](EVE-118.md), [EVE-123](EVE-123.md), [EVE-149](EVE-149.md), [EVE-150](EVE-150.md), [EVE-151](EVE-151.md), [EVE-187](EVE-187.md), [EVE-188](EVE-188.md), [EVE-189](EVE-189.md), [EVE-190](EVE-190.md), [EVE-198](EVE-198.md) |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-26](EVE-26.md), [EVE-27](EVE-27.md), [EVE-33](EVE-33.md), [EVE-39](EVE-39.md), [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-45](EVE-45.md), [EVE-46](EVE-46.md), [EVE-48](EVE-48.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-66](EVE-66.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-90](EVE-90.md), [EVE-107](EVE-107.md), [EVE-124](EVE-124.md), [EVE-125](EVE-125.md), [EVE-127](EVE-127.md), [EVE-143](EVE-143.md), [EVE-170](EVE-170.md), [EVE-172](EVE-172.md), [EVE-214](EVE-214.md), [EVE-225](EVE-225.md), [EVE-229](EVE-229.md), [EVE-247](EVE-247.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Approved (2026-11-08, Jonathan approved D1 to D6 as recommended). Planning only; no implementation until Jonathan asks. Follows the [Feature set spec template](<https://linear.app/resnovas/document/feature-set-spec-template-and-list-26b9f78cf17a>). F1 entities (Event, Phase, run of show, itinerary, venue or site) are referenced by name and owned by F1.

## 1. Goal

A production company always knows what equipment and stock it owns, where every item is, whether it is free for an event, what it needs to buy or hire in, and whether it is safe to use, and the agent can do all of that through the same actions as the crew.

## 2. Users and jobs

| User | Jobs |
| -- | -- |
| Warehouse manager | Keep the catalogue and locations, approve adjustments, plan prep, resolve discrepancies, run stock counts |
| Warehouse crew | Prep, pick, scan out, scan in, report damage, move items between bins, often offline |
| Production manager or organiser (F1) | Put equipment on an event, see shortages, approve sub-hire and purchases |
| Event crew (F2 rostered) | Receive kit on site, check what is on the truck, report missing or damaged items |
| Technician or inspector | Run inspections (electrical, lifting), log repairs, release or quarantine assets |
| Purchaser | Raise purchase requests and orders, chase suppliers, receive goods |
| Finance (F11) | Asset register value, depreciation, purchase accruals, write-offs |
| Supplier (external) | View and confirm a purchase order or sub-hire sent to them |
| Agent | Everything above within the delegated user's permissions; proactive shortage, maintenance and reorder alerts |

## 3. Market check

From public product pages and listings (Current RMS, Flex Rental Solutions, Rentman, plus Odoo Inventory as the ERP reference), not hands-on trials. Names stay out of customer-facing copy.

* Rental and production tools (Current RMS, Flex, Rentman) all model products with serialised and bulk stock, kits and containers, availability over date ranges against jobs, barcode check-out and check-in on a mobile app, sub-rental (rent in) from other companies, and repair and inspection tracking. Rentman and Current RMS sell crew scheduling and warehouse in one product; Flex is strongest on warehouse workflow and container nesting.
* Odoo Inventory models stock as double-entry moves between locations (including virtual locations for suppliers, customers, scrap and adjustments), with routes, reorder rules and purchase integration. It is the clearest reference for a ledger that accounting can trust.
* Where Eventiva matches: serialised, bulk and consumable tracking; kits and nested containers; availability calendar; scan out and in; sub-hire; inspections; purchasing with reorder points.
* Where Eventiva differs: (1) one append-only stock ledger shared by people and agents, which merges offline without conflicts; (2) equipment comes from the F1 production plan, so a lighting or rigging plan produces the pick list; (3) warehouse, vehicles (F7), site maps (F10) and accounting (F11) are one platform rather than integrations; (4) every operation is an agent action, so "what am I short for Saturday and hire it in" is one request with approval.
* Gaps we do not chase in phase 1: marketplace for renting spare stock to other companies (F5 later), EDI or punchout with suppliers, RFID portals.

## 4. Capabilities as actions

Every operation is one inventory action (<issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />): Effect Schema input and output, typed errors, one permission, approval policy, side-effect class. Permission names use `inventory:` and `purchasing:` scopes.

| Action | Input | Output | Permission | Approval | Class |
| -- | -- | -- | -- | -- | -- |
| `inventory.product.create` / `update` / `archive` | product fields | Product | `inventory:catalogue:write` | none | write |
| `inventory.product.list` / `get` | filters, id | Product\[\] / Product | `inventory:catalogue:read` | none | read |
| `inventory.kit.define` | kit product, components (product, qty, optional) | Kit | `inventory:catalogue:write` | none | write |
| `inventory.asset.register` | product, serial, tag code, cost, in-service date | Asset | `inventory:asset:write` | none | write |
| `inventory.asset.get` / `history` | asset id or tag code | Asset / movement timeline | `inventory:asset:read` | none | read |
| `inventory.asset.retire` | asset, reason (sold, scrapped, lost) | Asset | `inventory:asset:retire` | confirm | write |
| `inventory.container.pack` / `unpack` | container asset, contents | Container | `inventory:stock:move` | none | write |
| `inventory.location.create` / `update` / `archive` | parent, type, name | Location | `inventory:location:write` | none | write |
| `inventory.stock.move` | product or asset, qty, from, to, reason, refs | Movement | `inventory:stock:move` | none | write |
| `inventory.stock.adjust` | product, location, qty delta, reason | Movement | `inventory:stock:adjust` | confirm above threshold | write |
| `inventory.stock.levels` | product, location, as-of | levels | `inventory:stock:read` | none | read |
| `inventory.availability.query` | products, window, warehouse | available qty per day | `inventory:availability:read` | none | read |
| `inventory.reservation.create` / `update` / `cancel` | F1 Event, Phase, lines, window | Reservation | `inventory:reservation:write` | none | write |
| `inventory.reservation.fromPlan` | F1 Event | draft Reservation | `inventory:reservation:write` | none | write |
| `inventory.reservation.commit` | reservation id | movements to the `customer` location (sale) or `event-site` (hire out) | `inventory:reservation:commit` | none | write |
| `inventory.reservation.release` | reservation id, reason (expired, cancelled, refunded with restock) | Reservation (released), reverse movements on restock | `inventory:reservation:write` | none | write |
| `inventory.shortage.list` | event or window | shortages with options | `inventory:availability:read` | none | read |
| `inventory.prep.createPickList` / `assign` | reservation, crew | PickList | `inventory:prep:write` | none | write |
| `inventory.prep.scanOut` / `scanIn` | pick list, tag code or product qty, device | Movement + line state | `inventory:prep:scan` | none | write |
| `inventory.prep.complete` | pick list | PickList with variances | `inventory:prep:write` | confirm if variances | write |
| `inventory.discrepancy.raise` / `resolve` | type, refs, resolution | Discrepancy | `inventory:discrepancy:write` | resolve as lost: confirm | write |
| `inventory.asset.quarantine` / `release` | asset, reason | Asset | `inventory:maintenance:write` | release: confirm | write |
| `inventory.maintenance.schedule` / `log` | asset, type, due, result, certificate | MaintenanceJob | `inventory:maintenance:write` | none | write |
| `inventory.inspection.record` | asset, inspection type, pass or fail, evidence | Inspection | `inventory:inspection:record` | none | write |
| `inventory.count.start` / `record` / `finalise` | location, lines | StockCount + adjustments | `inventory:count:write` | finalise: confirm | write |
| `purchasing.supplierProduct.upsert` | F4 Organisation, product, sku, price, lead time | SupplierProduct | `purchasing:supplier:write` | none | write |
| `purchasing.request.create` / `approve` / `reject` | lines, reason, event ref | PurchaseRequest | `purchasing:request:write` / `approve` | approve: confirm | write |
| `purchasing.order.create` / `update` | supplier, lines, delivery | PurchaseOrder (draft) | `purchasing:order:write` | none | write |
| `purchasing.order.send` | order, channel | PurchaseOrder (sent) | `purchasing:order:send` | always | external |
| `purchasing.order.cancel` | order, reason | PurchaseOrder | `purchasing:order:send` | always if sent | external |
| `purchasing.receipt.record` | order, lines received, location | GoodsReceipt + movements | `purchasing:receive` | none | write |
| `purchasing.reorder.evaluate` | warehouse | suggested requests | `purchasing:request:write` | none | read |
| `inventory.subhire.create` / `send` / `return` | supplier, lines, window, event | SubHire | `inventory:subhire:write` / `send` | send: always | external |
| `inventory.valuation.report` | as-of, method | valuation lines | `inventory:valuation:read` | none | read |
| `inventory.valuation.exportToAccounts` | period | export batch for F11 | `inventory:valuation:export` | confirm | write |
| `inventory.label.print` | assets or locations, template, printer | print job | `inventory:label:print` | none | external |

## 5. Data model

All tables carry `org_id` (tenant guard, <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" />) and audit columns; ids are client-generated (UUIDv7) so offline writes are idempotent (<issue id="1b79a257-9ea0-40b5-a8f7-23e1c09221be" label="EVE-39" href="https://linear.app/resnovas/issue/EVE-39/make-every-entity-action-idempotent-and-persisted-by-default" />).

| Entity | Key fields | Relations | Offline sync | Conflict rule |
| -- | -- | -- | -- | -- |
| Product | name, sku, category, tracking (`serialised`, `bulk`, `consumable`), unit, weight, dimensions, power draw, replacement value, required inspection types | Kit components, SupplierProduct, images (<issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" />) | Synced read to all warehouse devices; edits online or offline | Last writer wins per field, audit keeps both |
| Kit | kit product, component lines (product, qty, optional) | Product | Synced | Replace whole component list; later write wins, with a conflict note |
| Asset | product, serial, tag code (barcode or QR), cost, purchase ref, in-service date, condition, quarantine flag, retired | Product, Location (derived), Movement | Synced for assets on the device's scopes | Per field last writer wins; quarantine set wins over release until an explicit online release |
| Location | type (`warehouse`, `zone`, `bin`, `vehicle`, `event-site`, `supplier`, `repair`, `virtual`), parent, refs to F7 Vehicle or F1 Event | Tree | Synced | Last writer wins per field |
| StockMovement | product, asset (optional), qty, from, to, reason, refs (Event, Reservation, PickList, PO, SubHire, Count), actor (person or agent), device, occurred_at | append-only | Insert only, synced everywhere it is scoped | No conflicts: inserts commute; duplicates rejected by id |
| StockLevel | product, location, qty | derived from movements | Projection, rebuilt locally | Never written directly; negative levels raise a Discrepancy |
| Reservation | F1 Event, Phase, window (out date, return due), lines (product qty or asset), status (`hold`, `confirmed`, `picking`, `out`, `returned`, `cancelled`), source (`manual`, `plan`, `sales`) | PickList | Synced to event crew and warehouse | Server re-checks availability on sync; an overbooked line becomes `conflict` and raises a shortage, never silently dropped |
| PickList | reservation, assigned people (F2), lines with expected and scanned counts, status | Movements | Synced to assigned devices | Scans are movements, so they merge; line counts are derived |
| Discrepancy | type (`missing`, `extra`, `damaged`, `wrong-item`, `double-checkout`, `negative-stock`), refs, notes (Yjs text, <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />), photos, resolution | Asset, Movement | Synced | Notes merge as text; resolution is last writer wins with audit |
| MaintenanceJob, Inspection | asset, type, due date, result, certificate file, inspector, next due | Asset | Synced | Append-only results; due date last writer wins |
| SupplierProduct | F4 Organisation, product, supplier sku, price, currency, lead time | Product | Synced read | Last writer wins |
| PurchaseRequest, PurchaseOrder, GoodsReceipt | lines, status, totals, refs to Event | Supplier, Movements, F11 bill | Drafts editable offline; approve, send and cancel need connectivity | Per line last writer wins on drafts; status changes are server-ordered |
| SubHire | supplier, lines, window, event, PO ref, return state | Movements (into `supplier` location) | As PurchaseOrder | As PurchaseOrder |
| StockCount | location, expected snapshot, counted lines, adjustments | Movements | Synced to counting devices | Counts are per device then summed; finalise is online only |

Documents embedded in records: discrepancy and repair notes are Yjs text on the record (<issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />), permissioned and versioned with the record. Warehouse floor plans are F10 site maps, not F6.

Sync scopes: a warehouse device gets its warehouse's catalogue, locations, levels and open pick lists; an event crew device gets only its event's reservation, pick lists and those assets; costs and supplier prices sync only to purchaser and finance roles.

## 6. Screens

All from Rambo-UI; every control binds to the action named; each screen publishes its projection (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />).

| Screen | Components | Projection | Controls and actions |
| -- | -- | -- | -- |
| Catalogue | DataTable, Filters, Search | visible products, filters, selection | New (`product.create`), Archive (`product.archive`) |
| Product detail | Form, Tabs, Gallery | product, levels per location, kit components | Save (`product.update`), Define kit (`kit.define`), Register asset (`asset.register`) |
| Asset detail | Card, Timeline, Badge | asset, location, condition, inspections due, history | Quarantine, Release, Retire, Print label |
| Locations | Tree, DataTable | tree, selected location, levels | New, Move stock (`stock.move`), Adjust (`stock.adjust`) |
| Availability calendar | Timeline grid | products, window, availability per day, conflicts | Create hold (`reservation.create`), Open shortage |
| Event equipment (tab on the F1 Event) | DataTable, Badge | reservation lines, status, shortages | From plan (`reservation.fromPlan`), Confirm, Sub-hire, Request purchase |
| Prep and pick (scanner mode) | ScannerView, List, Counter | pick list, expected vs scanned, last scan, focus line | Scan (`prep.scanOut`), Manual qty, Report damage, Complete |
| Check-in | ScannerView, List | pick list, returned vs out, missing | Scan (`prep.scanIn`), Mark missing (`discrepancy.raise`) |
| Discrepancies | Inbox list, Detail | open items, selection | Resolve, Assign, Comment (<issue id="b7f17f15-c893-46e9-9b3b-2aefae473802" label="EVE-27" href="https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource" />) |
| Maintenance | Calendar, DataTable, Form | due and overdue jobs, selected asset | Schedule, Log result, Record inspection, Upload certificate |
| Suppliers and purchase orders | DataTable, Form | orders, status, selection | New request, Approve, Create order, Send, Receive |
| Goods receipt | ScannerView, Form | order lines, received qty | Receive (`receipt.record`), Register assets on receipt |
| Sub-hire | DataTable, Form | sub-hires, window, return state | Create, Send, Return |
| Stock count | ScannerView, List | location, expected, counted | Start, Record, Finalise |
| Valuation | Report table, Chart | totals by category and method | Export to accounts |

ScannerView is a new Rambo-UI component (camera barcode and QR plus hardware scanner keyboard input). Camera access needs a dependency approved on F6.5.

## 7. Agent behaviour

Asked: "What am I short for the festival on Saturday?", "Put the lighting plan on the event and hire in what we are missing", "Where is case 0412?", "Which hoists are due for inspection this month?", "Reorder haze fluid".

Proactive, as suggestions in the agent inbox (never silent writes):

* Shortage found when a reservation, plan change or returned-damaged item leaves an event short; offers sub-hire, purchase, substitute product, or moving stock from another warehouse.
* Inspection or service coming due on an asset reserved for an upcoming event; offers to schedule it before the out date.
* Consumable below its reorder point; drafts a purchase request.
* After check-in, items still out past the return date; drafts discrepancies and a message to the crew lead.

Approval: the agent may create holds, draft pick lists, draft requests and orders, and record scans when the user drives it. It needs confirm for adjustments above the threshold, finalising counts, retiring assets and releasing quarantine; it always needs approval to send an order or sub-hire to a supplier or cancel a sent one. The agent can never release a failed safety inspection; only a person with `inventory:inspection:release` can.

## 8. Integrations

Each behind a neutral Effect port in its own integration package; no vendor chosen yet.

* Scanner port: camera barcode and QR (new dependency, approval on F6.5); hardware scanners in keyboard mode need no dependency; RFID is a later adapter.
* Label printer port: PDF labels first (no vendor); networked label printer adapter later.
* Supplier delivery port: send purchase orders and sub-hires by email through [EVE-24](<https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email>) with a PDF; supplier portal link for confirm. EDI and punchout out of scope.
* Accounting (agreed with F11, <issue id="158ba369-976e-47ea-9f86-a8df608cb4d0" label="EVE-69" href="https://linear.app/resnovas/issue/EVE-69/f11-accounting-ledgers-invoices-bills-event-budgets-and-tax" />): each goods receipt emits `inventory:goods_received` on the change feed at the time (PO id, PO line ids, quantities, unit cost in integer minor units, currency, F1 Event id, supplier F4 Contact id) for three-way matching; `inventory.valuation.exportToAccounts` emits `inventory:valuation_exported` per period for depreciation, average-cost movements, asset additions and retirements, and write-offs. F6 stores F11 tax code ids, never its own rates.
* Production plans (agreed with F1, <issue id="fbcff205-decd-464a-b8ab-a1278e71fbe4" label="EVE-73" href="https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show" />): `inventory.reservation.fromPlan` reads F1 `EquipmentRequirement` rows (event_id, phase_id, department_id, catalogue_ref = F6 Product id, quantity, needed_from, needed_to), handed over by F1's `requirement.sendToWarehouse`. Event-site locations reference an F1 `Event` or `Space`.
* Tax and currency: from F11 settings.

Sales contract with F9 (agreed with the F9 thread, 2026-11-01): F9 registers line kind `stock` and calls `inventory.reservation.create` on add to cart (returns reservation id and expiry, keyed by an F6 Product and a Location such as a warehouse or an event booth), `commit` when the order is paid, and `release` on cart expiry, cancel or refund with restock. Holds from carts carry an expiry and source `sales`. Offline point of sale cannot reserve live: the device writes commutative sale movements, and an oversell shows as negative stock and a `negative-stock` Discrepancy on sync rather than rejecting the sale. An F9 sellable product links to an F6 Product by id and never redefines it.

## 9. Permissions and roles

| Role | Can |
| -- | -- |
| Warehouse manager | All `inventory:*`, approve purchase requests up to a limit |
| Warehouse crew | Read catalogue and levels, `stock:move`, `prep:scan`, `discrepancy:write`, `inspection:record` if qualified (F13 qualification) |
| Production manager | Read availability, write reservations for their events, request purchases and sub-hire |
| Event crew | Read their event's pick lists and assets, scan in and out on them, raise discrepancies |
| Technician | `maintenance:write`, `inspection:record`, `inspection:release` when qualified |
| Purchaser | `purchasing:*` |
| Finance | Read costs and valuation, export, approve requests above the limit |
| Supplier (external) | Read and confirm only the orders and sub-hires sent to them, through a scoped link |
| Agent | The delegated user's permissions only, plus the approval rules in section 7 |

Costs, supplier prices and valuation are masked in screen projections for roles without `inventory:valuation:read`.

## 10. Telemetry and flags

* Flag: `f6-inventory` (default off) gates the set; per-slice flags `f6-purchasing`, `f6-subhire`, `f6-maintenance`, `f6-valuation`.
* Events: `inventory_reservation_created`, `inventory_shortage_detected`, `inventory_scan_recorded` (with offline true or false), `inventory_pick_completed` (variance count), `inventory_discrepancy_raised`, `inventory_inspection_recorded`, `purchasing_order_sent`, `inventory_agent_suggestion_accepted`.
* Spans on every action (<issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" />); scan latency and offline queue depth as metrics.
* Success metric: share of events whose kit goes out and returns with zero unresolved discrepancies after 7 days; target 95 percent. Guard metric: median scan-to-confirm under 300 ms on device.

## 11. Compliance

Rules are configuration per jurisdiction; the UK is the first set and is verified against current guidance before F6.7 is built.

* Lifting equipment (rigging, hoists, truss accessories): thorough examination intervals and records under LOLER 1998 (6 months for equipment lifting people and for accessories, 12 months otherwise), and use of work equipment under PUWER 1998. A failed or overdue examination blocks check-out.
* Portable electrical equipment: in-service inspection and testing records (IET Code of Practice); failed test quarantines the asset.
* Hazardous consumables (haze and smoke fluids, pyrotechnics): storage limits and safety data sheets; pyrotechnic storage licensing is flagged as out of scope for phase 1 and blocks marking pyro as stock until reviewed.
* Purchase and asset records kept 6 years for tax (HMRC); VAT handled by F11.
* Personal data: custody records name people (who scanned what); retained under the org's retention policy, exportable and erasable per GDPR without breaking the ledger (actor pseudonymised on erasure).
* Disposal of electrical equipment recorded for WEEE.

## 12. Acceptance

* A product with serialised, bulk and consumable variants can be catalogued, received on a purchase order, reserved on an F1 Event, picked, scanned out offline on two devices, scanned in, and the levels match on every device after reconnect.
* Two devices scanning the same serialised asset out offline produce one `double-checkout` discrepancy after sync, and no lost movement.
* An overbooked reservation made offline is flagged as a shortage on sync with sub-hire and purchase options.
* An asset with an overdue lifting examination cannot be scanned out; the agent cannot override it.
* The agent completes "short for Saturday, hire it in" end to end through actions, stopping for approval before sending the sub-hire.
* Every control on every F6 screen is bound to an action (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" /> check passes) and every action passes the <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" /> parity target.
* Valuation export for a period balances against the movement ledger.

## 13. Out of scope

Selling or renting equipment to customers (quotes and prices are F9, invoices are F11; F6 supplies availability and reservations), vehicle maintenance (F7), warehouse floor plans (F10), the general ledger (F11), RFID portals, EDI and punchout, marketplace hire to other companies (F5 later), manufacturing or bills of materials beyond kits, multi-currency landed cost.

## 14. Dependencies

* Phase 1: <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" /> actions, <issue id="9d08c369-bac9-4eb7-b8a7-329b5ec9bff0" label="EVE-41" href="https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials" /> settings (thresholds, jurisdictions), <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> storage and tenant guards, <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" /> identity and audit, <issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" /> telemetry, <issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" /> change feed (shortage triggers), <issue id="0ab161c4-ed9c-4581-86fe-91fa1f4216aa" label="EVE-46" href="https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action" /> HTTP, <issue id="37c126a9-64e0-4235-88f0-494533c8e3a2" label="EVE-48" href="https://linear.app/resnovas/issue/EVE-48/p19-build-inbound-mcp-from-the-action-inventory" /> MCP, <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" /> screen awareness, <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" /> sync, <issue id="3deaef52-8db8-490c-8143-b293ab5656a8" label="EVE-52" href="https://linear.app/resnovas/issue/EVE-52/p18a-build-the-agent-turn-loop-with-actions-as-tools" /> and <issue id="a626308a-598f-41ba-accd-4004cbbd9932" label="EVE-54" href="https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow" /> agent loop and durable runs.
* Port later: <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> notifications and email (supplier orders), <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" /> files (photos, certificates), <issue id="2cd1c920-450c-487e-b4c8-e860a382a6b0" label="EVE-26" href="https://linear.app/resnovas/issue/EVE-26/port-search-and-embeddings-across-every-resource" /> search, <issue id="b7f17f15-c893-46e9-9b3b-2aefae473802" label="EVE-27" href="https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource" /> comments, <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" /> scheduling (time windows), <issue id="1b79a257-9ea0-40b5-a8f7-23e1c09221be" label="EVE-39" href="https://linear.app/resnovas/issue/EVE-39/make-every-entity-action-idempotent-and-persisted-by-default" /> idempotent actions.
* Feature sets: F1 Event and Phase (reservations attach to them; production plans feed `fromPlan`), F2 rostered people (pick list assignees), F4 Organisations (suppliers), F7 Vehicles (vehicle locations), F9 sales (customer rental orders create reservations), F10 site maps (place assets on site), F11 accounting (valuation, bills), F13 qualifications (who can inspect).

## 15. Decisions for Jonathan

Decided 2026-11-08: Jonathan approved all six as recommended (option a for each).

| \# | Decision | Options | Recommended |
| -- | -- | -- | -- |
| D1 | Stock model | (a) append-only movement ledger with derived levels; (b) editable quantity fields | (a): merges offline with no conflicts and gives accounting an audit trail |
| D2 | Who owns renting equipment to customers | (a) F9 quotes and prices, F11 invoices, F6 owns availability and reservations; (b) F6 owns rental quotes too | (a): one sales path for tickets, products and hire (agreed with F9, <issue id="7d939472-20ba-4512-b231-c0f04c05574c" label="EVE-107" href="https://linear.app/resnovas/issue/EVE-107/f9-online-and-in-person-sales-storefront-point-of-sale-orders-payments" /> F9.14) |
| D3 | Scanning in phase 1 | (a) camera barcode and QR plus hardware scanners in keyboard mode, RFID later; (b) include RFID now | (a): no hardware vendor needed to start |
| D4 | Offline check-out of a serialised item already out | (a) accept and raise a discrepancy on sync; (b) block offline check-out of serialised items | (a): crews in basements and venues keep working; the ledger keeps both scans |
| D5 | Purchasing scope | (a) F6 owns requests, orders, receiving and reorder points; supplier bills go to F11; (b) purchasing moves wholly to F11 | (a): receiving is a warehouse job |
| D6 | Valuation | (a) cost per serialised asset with straight-line depreciation, average cost for bulk and consumables, exported to F11; (b) FIFO for everything | (a): matches how rental fleets are valued |

## 16. Child issues

In build order:

 1. <issue id="eaa9fbf7-7a3c-4c1c-9470-a76edd5316ff" label="EVE-81" href="https://linear.app/resnovas/issue/EVE-81/f61-build-the-equipment-catalogue-products-tracking-modes-and-kits" /> F6.1 Equipment catalogue: products, tracking modes and kits
 2. <issue id="606e799c-90cf-4e59-a1b8-77e6f0dad633" label="EVE-103" href="https://linear.app/resnovas/issue/EVE-103/f62-build-locations-and-the-append-only-stock-movement-ledger" /> F6.2 Locations and the append-only stock movement ledger
 3. <issue id="cb4c273f-1a14-4e3d-a8de-fb3cf1afa4d7" label="EVE-118" href="https://linear.app/resnovas/issue/EVE-118/f63-build-the-serialised-asset-register-containers-and-labels" /> F6.3 Serialised asset register, containers and labels
 4. <issue id="676ab6ef-a290-4e84-a999-c4b8975eeb89" label="EVE-123" href="https://linear.app/resnovas/issue/EVE-123/f64-build-availability-and-reservations-against-events-carts-and" /> F6.4 Availability and reservations against events, carts and production plans
 5. <issue id="1796f4cf-9de8-49b9-962f-825f58d9adc7" label="EVE-149" href="https://linear.app/resnovas/issue/EVE-149/f65-build-prep-pick-lists-and-offline-scan-out-and-scan-in" /> F6.5 Prep, pick lists and offline scan out and scan in
 6. <issue id="439edb35-70a7-4cfc-8ef2-d1999be94377" label="EVE-150" href="https://linear.app/resnovas/issue/EVE-150/f66-build-discrepancies-damage-reports-and-asset-quarantine" /> F6.6 Discrepancies, damage reports and asset quarantine
 7. <issue id="a30ae0e7-1f07-450d-be07-f6951c016315" label="EVE-151" href="https://linear.app/resnovas/issue/EVE-151/f67-build-maintenance-repairs-and-safety-inspections-for-lifting-and" /> F6.7 Maintenance, repairs and safety inspections
 8. <issue id="1399347c-26db-4939-8de9-b75f95a6c6bf" label="EVE-187" href="https://linear.app/resnovas/issue/EVE-187/f68-build-purchasing-supplier-products-requests-orders-receiving-and" /> F6.8 Purchasing: supplier products, requests, orders, receiving and reorder points
 9. <issue id="68cc7f08-be03-4b3b-8533-13124aafab5a" label="EVE-188" href="https://linear.app/resnovas/issue/EVE-188/f69-build-sub-hire-renting-in-equipment-from-other-suppliers-for-an" /> F6.9 Sub-hire
10. <issue id="e7a50ec7-4e4c-4031-ad8e-988787e6717a" label="EVE-189" href="https://linear.app/resnovas/issue/EVE-189/f610-build-stock-counts-and-cycle-counts-with-offline-counting" /> F6.10 Stock counts and cycle counts
11. <issue id="34869faa-3669-491c-b2a0-f104a1be1812" label="EVE-190" href="https://linear.app/resnovas/issue/EVE-190/f611-build-stock-valuation-asset-depreciation-and-the-per-period" /> F6.11 Valuation, depreciation and export to accounting
12. <issue id="12170955-2a99-42eb-b6a5-e460ad492a78" label="EVE-198" href="https://linear.app/resnovas/issue/EVE-198/f612-build-the-inventory-agent-behaviours-shortages-inspections-due" /> F6.12 Inventory agent behaviours

New dependencies to approve when their slice starts: a barcode and PDF label library (F6.3) and camera barcode reading on Expo (F6.5).

### Planning coordination D6-7 - product/spec evidence and supplier-driven catalogue import (2026-11-13)

Keep tenant-owned inventory Product, Asset, Kit and stock ledger separate from a potentially shared manufacturer/model specification reference and supplier listing projections. A supplier can select a known model for a quotation or upload a new one and supporting datasheet; use structured category-specific fields (intended use, dimensions/weight, compatibility, interfaces, power/RF, kit contents), units, document provenance, revision and verification state. Detect duplicates before creating a new reference; incomplete/unverified data remains clearly indicated. Do not automatically promote a supplier statement or extracted document to a verified reference. Historical quotes point at the evidence version originally evaluated.

F6 reservations/holds/hire-out, dispatch, returns and maintenance determine actual supplier stock state; F5 receives only permission-controlled, as-of availability/capacity projections for specific date/quantity requests. Avoid exposing other customers' jobs, serials, private counts or valuation across tenant boundaries. Procurement comparison owns context-specific equivalence results, not F6 master identity. Include explicit technical/availability freshness and test matching plus no cross-tenant leakage. See <issue id="f08bafe4-f32d-4906-9e87-5d69df56d6a0" label="EVE-124" href="https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the" /> D5-14. Planning only.

## Planning decision D6-8 - private-first supplier inventory capture and independent directory disclosure (2026-11-13; coordinates F5 D5-15)

### Confirmed scope

Encourage suppliers to manage detailed, accurate structured stock and product specs within their **own** Eventiva tenant (including movements, hired-out/reserved units, returns and maintenance), even when they choose not to show this information to buyers. Separate F6's private authoritative data from F5's revocable, policy-generated public/customer projections. D5-16/D6-9 supersede the earlier matching restriction: directory recommendation matching is default-enabled under transparent supplier-facing terms with an explicit opt-out, but storing data does not permit unrestricted cross-tenant disclosure, unrelated processing or shared-model training.

### Policy

* F5 inventory display preference has three supplier-configurable levels: detailed inventory/product + permitted stock availability; date-based availability only without counts; private/no buyer-facing inventory information. Support organisation default with category/product overrides and permission-controlled changes. Do not equate 'detailed' with disclosing serials, client identities, warehouse bins, valuation, cost/margin or other tenant-private operational fields.
* Track a **default-enabled, explicit supplier opt-out** for eligible directory matching, with clear onboarding notice, controlled purpose and audit. A hidden-stock supplier may be included in generic recommendations but private equipment/quantity/date reasoning must not leak via search/re-ranking/agent APIs. Confirm lawful basis and terms before enabling for existing tenants. Its own tenant agent still uses its private stock within its roles.
* Provide low-friction data capture: import/select manufacturer/model references, validate specifications, enter owned quantities and movements, reconcile duplicates and accept updates with provenance. Offline stock workflows remain supported. Missing inventory is not automatically a negative business signal.
* Public/read projections must be derived through tenant- and action-scoped permissions, include data freshness, and avoid using an unapproved or stale signal to promise a hire. Publishing, changing permissions and revoking sharing are auditable; invalidate active search/index/cache projections on revocation. Historical contractual snapshots persist under separate lawful/approved access.
* Product reference contributions must not expose a supplier's private SKU, usage, stock count, prices or customer projects. Technical product specs and supplier private inventory remain separate records. Do not use private data for general-purpose AI training by default; any such purpose requires a separate explicit authorisation and policy.

### Validation

* A supplier manages 50 microphones, 10 reserved and 15 out on hire internally. Under 'dates only' an organiser sees permitted date availability but not private counts or hire movements; under 'private' the supplier may still receive a generic public-category/area recommendation using protected internal eligibility signals, but no counts, dates, stock-specific rationale or reconstructable ranking data is exposed.
* Product-specific sharing overrides the tenant default without changing underlying stock ledger or related bookings. Unauthorised API, MCP, external agent and search routes cannot bypass disclosure.
* Visibility reduction halts public stock disclosures without automatically switching off default recommendation matching. Explicit **matching opt-out** halts cross-tenant stock-derived candidate ranking and invalidates relevant caches within a defined bound; ordinary public directory search, private stock operations and private agents remain available.

### Open decision

**Resolved by D5-16 and D6-9:** inventory-backed matching is default-on with clear supplier notice and explicit opt-out; even for hidden inventory, buyer-facing content may use only independently public general supplier attributes. Exposure/inference protection and applicable lawful basis remain implementation checks, not permission to reveal private stock. F6 stays authoritative for stock; F5 owns directory presentation. Planning only.

## Planning decision D6-9 - default-on internal supplier matching, explicit opt-out, independent stock visibility (2026-11-13)

### Goal / supersession

The supplier may maintain full F6 stock records and configure what buyers see, while F5 can use eligible supplier stock and availability internally for recommendations **by default**, until the supplier explicitly opts out. This supersedes D6-8's proposed opt-in gate. A 'hidden inventory' display level suppresses detailed buyer-facing disclosures, **not** internal matching. Do not treat this as permission to train shared models or disclose information from other clients.

### Permission and information-flow contract

* Make directory matching participation a supplier-level default-enabled setting with clear onboarding/import notice and one-action opt-out. Supplier agreement and lawful basis must be checked, particularly before any rollout to existing tenants. Use a tenant-aware server action to evaluate eligibility, not expose raw private F6 inventory to a consuming organiser tenant or its AI agent.
* Publishable field projection remains detailed, date-only or hidden, independently configurable by supplier and optionally category/product. The policy evaluation supplies F5 a **non-disclosing recommendation eligibility result** and only the explicitly publishable evidence permitted by the chosen visibility setting.
* If visibility is hidden, candidate inclusion is allowed, but public justification can rely only on independently public supplier listing facts (category, geography/service area etc.). Never reveal a hidden model, count, date, stock status, estimated capability, booking clash or 'technically meets your specific item' claim. Guard against repeated-query and ranking inference; if unsafe, use only ordinary publicly grounded eligibility for that query.
* An opt-out removes private-stock signals from F5 cross-tenant candidate generation/ranking and derived caches, without deleting inventory records or removing ordinary public supplier listings. Existing authorised quotes/commitments retain legitimate historic snapshots. All actions, agents, APIs and integrations enforce the same view.
* Internal agents may continue using the supplier's own data within its tenant under normal permissions. No default shared-model training from privately managed inventory; a separate governance decision is needed for that.

### Validation

A supplier whose inventory indicates availability but whose public setting is hidden may be shown as a general service-area supplier, not as 'stock confirmed'. Switching to dates-only shows only permitted time windows, detailed shows only approved stock fields, and opting out ends inventory-derived cross-tenant matching even if the public supplier listing remains searchable. Synthetic repeated-query tests must fail to recover hidden quantities/date coverage. All paths (UI, API, MCP, external agent) agree. Planning only.

## Linear comments (1)

### Comment 5ef53096-fee6-44c5-a41d-7cb19bbeb076

Author: GitHub. Created: 2026-11-01T13:05:50.435Z; updated: 2026-11-01T13:05:50.407Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/830). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
