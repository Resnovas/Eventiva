<!-- linear:generated:start -->
# EVE-28: Port localization for people and for the agent

[Live Linear source](https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-17T01:11:16.567Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | In Progress (started) |
| Priority | 0: No priority |
| Labels | Code, Decision: Audit needed, Delivery: Implementation pending, Enhancement |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-175](EVE-175.md), [EVE-228](EVE-228.md) |
| Related to | [EVE-15](EVE-15.md), [EVE-23](EVE-23.md), [EVE-61](EVE-61.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-75](EVE-75.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-107](EVE-107.md), [EVE-111](EVE-111.md), [EVE-135](EVE-135.md), [EVE-182](EVE-182.md), [EVE-244](EVE-244.md), [EVE-245](EVE-245.md), [EVE-253](EVE-253.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Every string a person sees, and every message the agent uses about the platform, is translatable, with per-user locale, time zone and formats.

## Upstream reference (pinned tag from <issue id="cc5eba91-a4f7-4542-b332-10d3e1d70ed8" label="EVE-15" href="https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol" />)

* `localization/` (19 files): message catalogs per area (core, agent resources, automation outcomes, consent banner, billing notices and more), default messages, actions to change locale. Upstream uses i18next and react-i18next.

## Eventiva form

* `i18n` contracts in core-contracts (message keys as Schema, ICU message format); runtime wraps one i18n library behind a neutral service (choose and record; i18next is upstream's choice and works on React Native).
* Actions `locale.set`, `locale.get`; locale and time zone live in user settings and in the screen-context projection so the agent answers in the user's language and formats.
* Rambo-UI components take message keys, never raw strings; a lint rule flags hard-coded user-facing strings.
* Bundles load per module and work offline.

## Terminology and module-pack requirements

Localization and domain terminology are separate layers. A tenant profile maps stable canonical concepts to event, community-role-play or other vocabulary without changing action, entity, permission, telemetry or API identifiers. Agents receive canonical meaning plus rendered terminology. Every module includes namespaced default messages, locale bundles and the terminology concepts it introduces in its validated manifest; catalogues are dynamically loadable, cacheable offline and removed cleanly on module deactivation. The same validation applies to first-party, tenant-private and community modules.

## Acceptance

Switch a user to a second locale and every screen and agent reply follows; dates and currency follow locale; a missing key fails CI; offline locale switch works.

## Depends on

<issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" /> (core contracts), Rambo-UI base components.

## Out of scope

Translating content users type (event descriptions).

## Linear comments (5)

### Comment 4d6e5cca-92ca-4398-a6ae-5da38bde06b6

Author: GitHub. Created: 2026-10-31T21:59:06.927Z; updated: 2026-10-31T21:59:06.902Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/795). All replies are displayed in both locations.


### Comment 0e12aa2d-1d85-42a7-940a-31a3e4835b4c

Author: jonathan@resnovas.com. Created: 2026-11-11T19:14:01.565Z; updated: 2026-11-11T19:14:01.411Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent) (comment ID above). Parent: None. Resolved: Not recorded.

Selectable terminology/phraseology decision confirmed by Jonathan:

Separate four independent layers:
1. Locale/language: en-GB canonical fallback, en-US and future languages; spelling, grammar, date/number/time formats.
2. Domain vocabulary: events, security, gaming/MDT, emergency operations and tenant-specific terminology overlays.
3. Operational/communication profile: UK JESIP/plain-language, agency-specific UK profiles, US public-safety/incident-command profiles where lawfully sourced, ICAO phraseology where lawfully sourced, and event-adapted derivatives.
4. Organisation overrides: versioned tenant terms/codes mapped to canonical Eventiva concepts.

User choice and shared safety:
- Users may select their preferred display locale and terminology profile. Stable canonical concept/action/status IDs remain stored and transmitted so analytics, permissions, agents and integrations do not depend on wording.
- UI can show preferred label plus canonical code/plain-language explanation on demand. Search accepts synonyms across installed profiles.
- Shared operational channels, voice/radio procedure, training exercises and safety-critical workflows also declare a channel/incident profile. Participants see a clear warning/dual label when their personal profile differs; spoken/read-back phraseology follows the shared channel profile to prevent dangerous mismatches.
- Persist the source and target profile/version with messages/forms/training/completion evidence so historical meaning remains reconstructable after updates.
- Agents receive canonical concepts plus active user and operational profiles and must reply in the selected terms without changing underlying action semantics.

Profile governance:
- Every profile records authority/source, jurisdiction, version/effective date, licence/reuse basis, intended context and mapping confidence.
- Do not copy or claim conformance to proprietary/restricted ICAO, emergency-service or industry material without the required permission. Prefer authoritative public definitions and separately licensed packs where necessary.
- “Event-adapted” profiles are labelled adaptations, not official emergency/aviation standards or endorsements.
- Profile tests verify round-trip mapping, ambiguity, plural/grammar/accessibility, agent interpretation and cross-profile handover.
- Training content can render for each profile while assessment evidence records the exact terminology/standard version taught.

Apply this to EVE-13 canonical taxonomy, EVE-28 localisation, EVE-71 MDT/live operations, EVE-245 training and EVE-244 foundational manifest/profile contracts.


### Comment 1c4b2cd5-0fc0-481d-9a08-02ebf0fa272c

Author: jonathan@resnovas.com. Created: 2026-11-11T19:15:09.373Z; updated: 2026-11-11T19:15:09.339Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent) (comment ID above). Parent: None. Resolved: Not recorded.

Correction from Jonathan: operational/domain terminology and phraseology are selected by the tenant administrator and apply consistently across the tenant, not chosen independently by each end user.

- Tenant policy selects the active domain vocabulary and operational/communication profile, with optional event/channel-specific profile only where explicitly governed for interoperability.
- End users cannot independently switch MDT/status/radio/operational terminology, because inconsistent wording within one tenant could create confusion and unsafe handovers.
- Personal preference remains available only for language/locale and accessibility presentation where it does not alter canonical operational meaning; tenant policy may also fix locale for regulated/shared forms.
- Admin changes require preview, mapping/ambiguity checks, training/content impact analysis, versioned activation and audit. Historical records retain the profile/version under which they were created.
- Cross-tenant or multi-agency collaboration displays canonical/plain-language equivalents and source profile labels without changing either tenant’s configured vocabulary.
- Agents use the tenant/event/channel profile consistently for every participant.

This supersedes the user-selectable terminology wording in the immediately preceding comment on each issue.


### Comment 931bd346-e006-4128-b036-837bca64d7e6

Author: Amp. Created: 2026-11-17T00:52:07.104Z; updated: 2026-11-17T00:52:07.092Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent) (comment ID above). Parent: None. Resolved: Not recorded.

Amp agent implementation checkpoint, 2026-11-17. The live issue and Jonathan's correction 1c4b2cd5-0fc0-481d-9a08-02ebf0fa272c were re-read. Reserved a bounded metadata-only slice in the existing i18n contract: governed pack provenance and immutable profile/version references, preserving the basic overlay API. No activation, personal terminology selection, settings, external vocabulary content, official conformance or licence proof will be inferred. Linked-thread/open-PR audit found no active duplicate implementation. The issue is now In Progress because implementation has started; decision and delivery labels remain unchanged and full acceptance remains open. Central integration/verification/direct-main delivery stays in https://ampcode.com/threads/T-66e90dd6-0f21-4bf7-809b-fb3bb8b9eb9c . No push yet.


### Comment b4739712-8bb6-484f-a3b4-3497c64a4ddd

Author: Amp. Created: 2026-11-17T01:11:54.026Z; updated: 2026-11-17T01:11:54.016Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent) (comment ID above). Parent: None. Resolved: Not recorded.

Agent delivery evidence, 2026-11-17 01:12 UTC. 3bb0e940 preserves basic overlays and adds governed pack provenance plus exact readonly profile/version references. Targeted contracts15/15 and FormatJS4/4 pass. Tenant-admin selection per owner correction remains distinct from locale. Metadata validation is not activation, licensing/authority proof or persisted selection.

Delivered directly to main under the owner's standing authorization. Exact independently confirmed remote head: https://github.com/Resnovas/Eventiva/commit/7aeaa8dcb1cab1b63a6bab5421fe7e3ef56ebbc0 . All five signatures read G. Central combined command (approved disposable loopback PostgreSQL17.12 fixture): bash .amp/in/orb-backup/run-storage.sh bash -c 'pnpm exec vitest run --config tests/storage/vitest.config.mts && node --run verify' exited0: storage155/155, unchanged coverage96.45% lines/92.85% branches/93.15% functions;85 Nx lint/typecheck/test/build/parity tasks and smoke passed. Exact committed clean clone node --run check and clean-source sh tools/graphify/graphify check passed. A working-tree root rerun correctly reported next-lane LLMS drift; it was not suppressed or included in the pushed snapshot. Exact-head CI subscription is active, remote CI pending. No production migration/deployment, component/dependency adoption or external release occurred.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
