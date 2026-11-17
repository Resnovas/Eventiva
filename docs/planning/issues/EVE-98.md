<!-- linear:generated:start -->
# EVE-98: F13.1 Build worker records, engagements and organisation structure

[Live Linear source](https://linear.app/resnovas/issue/EVE-98/f131-build-worker-records-engagements-and-organisation-structure) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:08.991Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | [EVE-80](EVE-80.md) |
| Children | None recorded |
| Blocked by | [EVE-23](EVE-23.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md) |
| Blocks | [EVE-116](EVE-116.md), [EVE-121](EVE-121.md), [EVE-153](EVE-153.md), [EVE-154](EVE-154.md), [EVE-156](EVE-156.md), [EVE-179](EVE-179.md), [EVE-239](EVE-239.md) |
| Related to | [EVE-65](EVE-65.md), [EVE-99](EVE-99.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Every employee, freelancer, volunteer and agency crew member in a tenant has one Worker record with versioned engagement terms, a department, a position and a manager, created and changed through actions that people and the agent share.

## Context

* Parent: <issue id="253839bc-c987-416b-92ea-206c9e9e8d2e" label="EVE-80" href="https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave" />, sections 4 (Workers and organisation), 5 and 9. Status Proposed until Jonathan approves decisions 1 and 2 on <issue id="253839bc-c987-416b-92ea-206c9e9e8d2e" label="EVE-80" href="https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave" />.
* A Worker is the HR view of an F4 Person within one tenant; F4 owns name and contact details and is not redefined here. Agency crew link to an F4 Organisation through supplierOrgId.
* Storage and tenant guards from <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" />; schema helpers from the shared schema package (<issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />); actions from <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />; authorization and audit from <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />.

## Scope

1. `hr` extension package with Drizzle tables for Worker, Engagement (append-only versions with effectiveFrom), Department, Position, ReportingLine (effective-dated), all tenant-scoped.
2. Actions: `hr.workers.create`, `.update`, `.get`, `.list`, `.archive`; `hr.engagements.create`, `.update`, `.end`; `hr.departments.*`; `hr.positions.*`; `hr.reportingLines.set`; `hr.orgChart.get`, with the inputs, outputs, permissions and approvals in [EVE-80](<https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave>) section 4.
3. Worker status machine (candidate, onboarding, active, suspended, left) as an [EVE-42](<https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state>) state machine; only actions change status.
4. Reporting line cycle detection rejects a change with a typed `ReportingCycle` error.
5. Permission grants hr:workers:*, hr:engagements:*, hr:org:\* registered with [EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>), and the default role mapping in [EVE-80](<https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave>) section 9.
6. Offline sync rules from [EVE-80](<https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave>) section 5 for these entities (field-level last writer wins on profile fields, server-authoritative status, versioned engagements).
7. CSV import and export of workers through an `HrImport` port (no vendor).
8. Worker references the F4 Person by party id (<issue id="ad791a38-f528-4aec-9433-c36977bbe8e2" label="EVE-65" href="https://linear.app/resnovas/issue/EVE-65/f4-contacts-and-crm-people-organisations-relationships-and-history" />) and holds employment data only; F13 registers as a PartyReferenceOwner (<issue id="7692d04c-3444-4989-b2aa-b73a1a69ab02" label="EVE-99" href="https://linear.app/resnovas/issue/EVE-99/f44-find-and-merge-duplicate-contacts-and-import-and-export-them" />) so a Person merge rewrites Worker references, with a test that merges two Persons and keeps one Worker per tenant.

## Acceptance criteria

* Create an employee, a freelancer and a volunteer from existing F4 Persons; each has one Worker per tenant; a second tenant cannot read them (negative test).
* Two offline edits to an engagement produce two versions; the later effectiveFrom wins and both are kept and flagged.
* Making A report to B and B report to A fails with `ReportingCycle`.
* `hr.engagements.end` does not run until a second HR admin approves.
* Every action is in the inventory, passes the <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" /> parity target and writes one audit row.

## Constraints

Effect-TS v3 house rules (Schema input, `Data.TaggedError`, services as `Context.Tag`, `@effect/vitest`); no zod; no new dependency without Jonathan approving it on this issue; behind the `hr-module` flag defaulting off; ship to main per the AGENTS.md delivery exception with `node --run check` results pasted here.

## Done signal

Extension merged to main, tests green, and a comment here listing the actions and tables.

## Blockers

<issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />, <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />, <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" />, <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />; F4 Person and Organisation entities.

## Linear comments (1)

### Comment 5958a40c-8f1a-47e5-8a68-68f1d3c6de92

Author: GitHub. Created: 2026-11-01T13:07:19.046Z; updated: 2026-11-01T13:07:19.016Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-98/f131-build-worker-records-engagements-and-organisation-structure) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/865). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
