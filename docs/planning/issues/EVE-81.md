<!-- linear:generated:start -->
# EVE-81: F6.1 Build the equipment catalogue: products, tracking modes and kits

[Live Linear source](https://linear.app/resnovas/issue/EVE-81/f61-build-the-equipment-catalogue-products-tracking-modes-and-kits) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:22.323Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-63](EVE-63.md) |
| Children | [EVE-247](EVE-247.md) |
| Blocked by | [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-50](EVE-50.md) |
| Blocks | [EVE-103](EVE-103.md) |
| Related to | [EVE-25](EVE-25.md), [EVE-66](EVE-66.md), [EVE-71](EVE-71.md), [EVE-119](EVE-119.md), [EVE-124](EVE-124.md), [EVE-143](EVE-143.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Warehouse managers and the agent can catalogue every kind of equipment and stock the company holds, with how it is tracked and what it is made of.

## Context

* Parent <issue id="928dc098-5cc9-4586-88bb-50abbe03071a" label="EVE-63" href="https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing" /> sections 4 to 6 (Product, Kit). Proposed until Jonathan approves the F6 decisions.
* Tracking modes: `serialised` (each unit is an Asset, F6.3), `bulk` (counted quantity, such as cables), `consumable` (used up, such as tape or haze fluid).
* Images use <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" /> when it exists; until then the product has no image field.

## Scope

1. Tables `inventory_product` and `inventory_kit_component` (Drizzle, Postgres and SQLite, `org_id` guard from <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" />). Fields per <issue id="928dc098-5cc9-4586-88bb-50abbe03071a" label="EVE-63" href="https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing" /> section 5: name, sku (unique per org), category, tracking, unit, weight, dimensions, power draw, replacement value, required inspection types (list of codes, used by F6.7).
2. Actions `inventory.product.create`, `update`, `archive`, `list`, `get` and `inventory.kit.define` (<issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" /> contract): Effect Schema input and output, typed errors (`DuplicateSku`, `KitCycle`, `ProductArchived`), permission `inventory:catalogue:read` or `write`.
3. Kits: a kit is a product whose components are other products with quantities and an optional flag; nested kits allowed, cycles rejected.
4. Screens Catalogue and Product detail from Rambo-UI, each declaring its <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" /> projection (visible products, filters, selection; product with components) and binding every control to its action.
5. Offline: product and kit rows sync to warehouse devices; per-field last writer wins with audit, kit components replaced as a whole.

## Acceptance criteria

* Creating a product with a duplicate sku in the same org fails with `DuplicateSku`; the same sku in another org succeeds (tenant test).
* A kit that contains itself, directly or through another kit, fails with `KitCycle`.
* The agent lists products by category and creates a kit by request through the same actions, verified by an `@effect/vitest` test calling the inventory.
* Two offline edits to different fields of one product both survive after sync; the same field resolves to the later write and the audit log holds both.
* <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" /> unbound-control check passes for both screens.

## Constraints

Effect-TS v3 house rules; no zod; Rambo-UI with WCAG 2.2 AA; behind flag `f6-inventory` (default off); no new dependency without Jonathan approving it on this issue; people and agent docs updated; ships to main per the AGENTS.md delivery exception with `node --run check` results pasted here.

## Done signal

Merged to main, tests green, and a comment here listing the actions and screens shipped.

## Planning decision D6-7 - supplier-backed product specifications and catalogue evidence for equivalence (2026-11-13; coordinates D5-14)

### Goal

Use F6 inventory/catalogue data as the authoritative **technical evidence source** for comparing products proposed in F5 supplier quotes, and as the basis for supplier capacity and hiring availability checks. Suppliers can choose a known product or add one, so catalogue coverage grows as the directory and quote system are used.

### Model / data ownership

* Maintain distinct identities and provenance for **reference product/model** (manufacturer, model, variant, specification, dimensions/weight/power/operating limits and evidence), **tenant/supplier-owned catalogue entry** (supplier SKU, stock item, substitutions, price notes, claims), **physical or bulk stock quantities/locations/condition**, **reservations/hire-out and returns**, **supplier quotation version/line**, and **F1 requirement ID/version**. Do not conflate product specifications with stock or assume that a supplier catalogue entry proves ownership or availability.
* Preserve the existing F6 tenant-scoped inventory Product, Kit, Asset, ledger and availability boundaries. A shared manufacturer/model reference layer may help deduplicate equivalent products, but must not expose private supplier inventory/valuation or overwrite tenant-owned stock records. Reference identity can be linked by model/variant IDs with provenance and confidence; similar names are not enough to merge products.
* Structured, category-specific technical fields with typed units and semantics, rather than only a free-text description: manufacturer/model/variant, product category and intended applications, key performance/compatibility characteristics, dimensions/weight/footprint, electrical/power/RF where applicable, interfaces, accessories, kit/bundle composition and safety/compliance/inspection attributes. Record which fields are hard requirements per use case instead of enforcing one generic checklist across all equipment classes.
* Each spec claim must record origin (manufacturer datasheet/manual, supplier-submitted document, supplier assertion, organiser correction), time/version, original source link/file, units and evidence/verification status. A manufacturer's marketed use case may suggest a functional match, not certify technical suitability for a particular event.

### Supplier-driven catalogue enrichment

* A supplier responding to an enquiry or creating a quotation can **search/select an existing product/model** and link its own inventory Product/SKU, or **create/import a new model** with fields/specification/datasheets, images, supporting documents and a proposed matching category. Offer bulk import where useful, with field mapping and validation.
* Identify likely duplicate manufacturer/model variants and prompt match-versus-create review; never silently merge mismatched models or let untrusted uploaded documents become accepted facts. Extracted/spec-reconciled fields remain proposals until verified or accepted by an authorised catalogue workflow. Preserve original uploaded evidence and correction history. Avoid requiring a complete enriched catalogue as a precondition to quote submission: allow 'specifications incomplete - review needed' so sourcing continues.
* Propose a controlled correction process for supplier and other authorised users to contribute to a shared reference record; supplier updates to their own stock and pricing stay private by default. Existing quote/sent requirement snapshots remain immutable when the catalogue changes; flag affected evaluations for re-check instead of silently changing historic outcomes.

### Rental and availability linkage

* Supplier F6 manages stock via existing serialized/bulk/consumable inventory, kits, reservations/holds, dispatched hire-outs, returns, maintenance/quarantine and condition status. Availability is **date/time window + required quantity + location/transport/setup constraints + commitment state + condition**; available stock is calculated from relevant quantities minus confirmed commitments, not a static catalogue boolean.
* Enable suppliers to publish **permission-controlled, freshness-labelled availability projections** to F5 (e.g. offers category/product, can potentially fulfil quantity/window, availability unknown/tentative/available/unavailable). The supplier chooses what is shareable; raw serial numbers, warehouse locations, other clients' events, margins, private supplier data and exact unapproved counts are not leaked.
* F5 discovery and recommendation uses candidate product/kit suitability against F1 exact/functional criteria, then supplier-declared capability and permitted availability signal for event window. Explain technical fit, covered quantities, travel/service area, gaps, substitutions and what is unverified. No automated award or assumption that a search result guarantees stock. Before commitment, require a fresh authorised availability/hold or supplier confirmation; recheck if timestamps go stale or stock changes.
* Hire-out, reserve, release, collect/return and maintenance updates flow through F6 shared agent-native actions and update eligible supplier-side availability projections, which F5 can re-rank on the next evaluation. No external commitments or supplier messages without already agreed approval gates.

### Validation

* Supplier selects a shared reference microphone model from catalogue, links its SKU/stock, and quotes it against an F1 functional microphone requirement; comparison shows model specs and cited evidence, an outcome-based fit status, and availability freshness for the event dates.
* A second supplier uploads an unknown model/datasheet: import proposes mapped fields and detects potential duplicate; quote is preserved and marked pending verification until accepted evidence. One supplier's stock figures, exact location and margins are hidden from competing tenants.
* Two manufacturers' products meet verified functional criteria for a speaking microphone and can be compared; an incompatible connector or missing required wireless capability prevents 'verified equivalent'. A rider-exact model substitution still requires an organiser waiver (D5-13).
* One supplier has ten units but eight are reserved for overlapping dates: a request for five must not be confidently shown as available; stock returned/asset quarantined changes derived signals after proper F6 state transitions. Expired or stale projections become unknown/confirmation required, not automatically green.
* A reference spec is corrected after Round 1: historical quote remains unchanged, new evaluation references the updated evidence version and prompts review. No double-counting bundled kits.

### Out of scope / open decisions

Planning only; do not expose all tenants' stock globally, assert real-time certainty from cached records, or auto-award/requote. To decide: tenant opt-in defaults and exactly what the directory may reveal about stock quantity versus only capacity/availability summaries; curator/verification responsibilities and how to maintain manufacturer reference data. F6 remains owner of actual stock, F5 of discovery/comparison. Linked <issue id="eaa9fbf7-7a3c-4c1c-9470-a76edd5316ff" label="EVE-81" href="https://linear.app/resnovas/issue/EVE-81/f61-build-the-equipment-catalogue-products-tracking-modes-and-kits" />, <issue id="928dc098-5cc9-4586-88bb-50abbe03071a" label="EVE-63" href="https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing" />, <issue id="b22fbb0d-100b-47a3-8c32-eeacadc4c9fe" label="EVE-66" href="https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings" />, <issue id="f08bafe4-f32d-4906-9e87-5d69df56d6a0" label="EVE-124" href="https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the" /> and <issue id="03bd23d1-9da5-4272-8f2e-0b0bf4f7f846" label="EVE-119" href="https://linear.app/resnovas/issue/EVE-119/f57-build-cross-tenant-enquiries-rfps-and-private-message-threads" />.

### Planning coordination D6-8 - rich private catalogue, restricted publication (2026-11-13)

Suppliers may enrich their own product catalogue with model identifiers, structured specifications, datasheets, quantities and kit/availability data regardless of their directory visibility setting. Distinguish permitted shared manufacturer/model specifications from tenant-private inventory/SKUs and commercial information. Exposing a product reference for contextual equivalence must not publish the owning supplier's private quantities or data lineage without authorisation. Capture provenance and verification status and do not use a supplier's uploaded data to train a shared AI model by default. Directory settings detailed/dates-only/private and default-enabled, expressly opt-out-able cross-tenant recommendation processing (D5-16/D6-9 supersession) are coordinated in <issue id="b22fbb0d-100b-47a3-8c32-eeacadc4c9fe" label="EVE-66" href="https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings" /> D5-15 and <issue id="928dc098-5cc9-4586-88bb-50abbe03071a" label="EVE-63" href="https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing" /> D6-8; 'private-but-matchable' is approved by default subject to truthful generic copy, supplier notice and an explicit opt-out. No raw supplier stock disclosure or shared model training is authorised. Planning only.

### Planning coordination D6-9 - catalogue use for default-on recommendations (2026-11-13)

Catalogue and inventory may be used in Eventiva's scoped cross-tenant supplier-matching process by default, subject to transparent supplier notice/terms and a straightforward explicit opt-out (<issue id="b22fbb0d-100b-47a3-8c32-eeacadc4c9fe" label="EVE-66" href="https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings" /> D5-16, <issue id="928dc098-5cc9-4586-88bb-50abbe03071a" label="EVE-63" href="https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing" /> D6-9). This does not publish supplier-private SKU/quantities/stock, and it does not authorise shared model training or additional unrelated purposes. A hidden inventory visibility preference affects buyer-facing information only, while a matching opt-out independently excludes private stock from ranking and candidate generation. Only published general listing attributes may explain a generic hidden-inventory supplier recommendation; do not expose manufacturer/model association without publication permission. Planning only.

## Linear comments (1)

### Comment bc2cc00e-c651-460a-adfc-513b451e38dd

Author: GitHub. Created: 2026-11-01T13:07:03.550Z; updated: 2026-11-01T13:07:03.517Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-81/f61-build-the-equipment-catalogue-products-tracking-modes-and-kits) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/848). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.

### Bounded backend and compiler checkpoint - 2026-11-18

The rank-1 implementation packet revision 2 and [dispatch/guard/compiler relays](https://ampcode.com/threads/T-01a1edbf-8aca-7321-bd1e-e052e15ff66d) convey Jonathan's building approval through the [coordinating thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a). Exact owner-selection timestamps were not supplied. [Live checkpoint](https://linear.app/resnovas/issue/EVE-81#comment-49ac5017) separately records local execution, limitations and pending delivery; the frozen capture above is unchanged and EVE-81 remains Backlog.

The separately bounded compiler amendment recognizes only the pinned UUID's redundant case-insensitive regex flag and the exact lowercase v7 subset. Runtime validation, generic regex refusal, conservative provider restrictions, root tool-input object requirement and nullable/general-union failures remain intact. Existing people/agent documentation and focused regression fixtures explain the distinction between structural outputs and tool input. This is not complete product inventory parity: Google pattern/string-length restrictions, nullable cursors and composed-bound conflicts still fail discovery closed. No shared Resources/SQL amendment, production activation or issue completion is established. Product persistence/authorization work continues separately; kits, screens, sync and import commit remain outside this increment. EVE-248 remains deferred.

The [private-backend checkpoint](https://linear.app/resnovas/issue/EVE-81#comment-4a79c911) records 50 focused contract/compiler/inventory tests and three real two-dialect public-host tests. The [product guide](../../inventory-products.md) owns exact selected bounds, five action contracts, default-off dotted gate, exclusive guard/product mutation ownership, per-tenant serialization and independent SQLite-client limitation. Actual post-write rollback, bounded known-conflict retries, live revocation, SKU rename/archive, tenant/cursor isolation, one-way audit digests and reopened persistence are exercised. Both dialects first reproduced an observer rewriting the persisted SKU; fresh decoded targets resolve that defect.

The [final combined verification and delivery record](https://linear.app/resnovas/issue/EVE-81#comment-2762bf3c-a128-4e09-b89d-5f150ea017b9) records signed revisions and remote CI separately from local success. After rebasing onto the strict-zero documentation checkpoint, `node --run verify` passes root checks, lint/typecheck/test/build/parity for 32 projects, source/declaration boundaries and three smoke projects using disposable loopback PostgreSQL plus real SQLite. The strict scanner reports 245 editable TypeScript files with zero findings and no suppressions or debt changes; strict reviewed-source planning reports 258 issues, 692 edges and no unresolved/stale outputs. LLMS, planning and clean-source Graphify are regenerated. This completes the bounded backend implementation, not provider parity or broader EVE-81 acceptance; the module is uninstalled/default-off and EVE-248 remains deferred.

2026-11-18 revision-7 continuation: the [metadata import checkpoint](https://linear.app/resnovas/issue/EVE-81#comment-37fdf03f-f4b4-4c89-a9a3-4c59c9c23f7c) adds synthetic durable stage/get/cancel and one-row confirmation through the unchanged product action, not direct product storage. Complete reviewed mappings, evidence-bound SKU, stable UUIDs/keys and expected revisions refuse accidental upsert. Product, row/plan and durable receipts share one provider's SQL/savepoints; two-dialect public-host tests cover rollback, fiber interruption, discarded reply/reopen and identical replay with refreshed source/rights/session/flag/permission. Quantities remain not-applied/stock-pending, both capabilities stay default-off and real rights/whole-plan undo/independent SQLite multiprocess acceptance are not claimed. See the [catalogue guide](../../catalogue.md#synthetic-durable-metadata-import---2026-11-18) for the exact contract. Full combined gates and delivery remain separate evidence; the historical capture is preserved and broader EVE-81 acceptance remains open.
