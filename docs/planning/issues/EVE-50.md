<!-- linear:generated:start -->
# EVE-50: P1.11 Build screen awareness: app state, navigation and the screen registry on React Native

[Live Linear source](https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-17T01:21:12.190Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | In Progress (started) |
| Priority | 0: No priority |
| Labels | Code, Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | [EVE-16](EVE-16.md) |
| Blocks | [EVE-77](EVE-77.md), [EVE-81](EVE-81.md), [EVE-86](EVE-86.md), [EVE-94](EVE-94.md), [EVE-101](EVE-101.md), [EVE-104](EVE-104.md), [EVE-106](EVE-106.md), [EVE-112](EVE-112.md), [EVE-115](EVE-115.md), [EVE-116](EVE-116.md), [EVE-122](EVE-122.md), [EVE-125](EVE-125.md), [EVE-134](EVE-134.md), [EVE-138](EVE-138.md), [EVE-147](EVE-147.md), [EVE-148](EVE-148.md), [EVE-162](EVE-162.md), [EVE-166](EVE-166.md), [EVE-168](EVE-168.md), [EVE-169](EVE-169.md), [EVE-175](EVE-175.md), [EVE-176](EVE-176.md), [EVE-178](EVE-178.md), [EVE-182](EVE-182.md), [EVE-186](EVE-186.md), [EVE-201](EVE-201.md), [EVE-211](EVE-211.md), [EVE-217](EVE-217.md), [EVE-224](EVE-224.md), [EVE-260](EVE-260.md) |
| Related to | [EVE-32](EVE-32.md), [EVE-44](EVE-44.md), [EVE-61](EVE-61.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-68](EVE-68.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-82](EVE-82.md), [EVE-87](EVE-87.md), [EVE-91](EVE-91.md), [EVE-96](EVE-96.md), [EVE-103](EVE-103.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-113](EVE-113.md), [EVE-118](EVE-118.md), [EVE-123](EVE-123.md), [EVE-128](EVE-128.md), [EVE-149](EVE-149.md), [EVE-150](EVE-150.md), [EVE-151](EVE-151.md), [EVE-170](EVE-170.md), [EVE-187](EVE-187.md), [EVE-188](EVE-188.md), [EVE-189](EVE-189.md), [EVE-190](EVE-190.md), [EVE-191](EVE-191.md), [EVE-235](EVE-235.md), [EVE-253](EVE-253.md), [EVE-255](EVE-255.md), [EVE-259](EVE-259.md), [EVE-261](EVE-261.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

The agent knows what is on the user's screen and can do anything the user can do there, because every screen and interactive element is registered against an action.

## Context

* Phase-1 step 11 of the S2 capability map; the <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> screen awareness requirement. Upstream reference at 6b5cf68: `application-state/`, `navigation/`, `command-navigation/`, `browser-context/`, `client/` (hooks, navigation, host bridge, WebMCP).
* Decided 2026-10-31: one React Native runtime that also renders on the web through react-native-web. Upstream's DOM client is rewritten from its behaviour, not ported. Rambo-UI provides neutral hooks that Eventiva binds (D8).
* Navigation and the command menu move here from <issue id="62f3bba8-9275-4ff1-98bf-62b95f432b37" label="EVE-32" href="https://linear.app/resnovas/issue/EVE-32/port-settings-profiles-navigation-command-menu-and-onboarding" />.

## Scope

1. Screen context: each screen declares an Effect Schema projection of what it shows (records, selection, filters), published to application state the agent reads.
2. Interaction registry: every button, menu item and form submit binds to an action id; an unbound interactive element fails a lint or test.
3. Navigation as actions (go to screen, open record), shared by the command menu and the agent.
4. On web only, the same registry is exposed through WebMCP.

## Acceptance criteria

* On web and Android: the agent answers "what am I looking at" from the projection, and performs a visible button's action by its id with the same result as the tap.
* The unbound-element check fails on a fixture.

## Constraints

Effect-TS v3 for anything with IO; WCAG 2.2 AA for UI; depends on <issue id="a7a66a5c-e747-4245-bc84-3232ef65a16c" label="EVE-16" href="https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web" /> for the Expo stack; no new dependency without approval here; ship to main with check results.

## Done signal

Merged with the web and Android checks recorded.

## Declarative substrate split (2026-11-15)

Canonical spec [https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c](<https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c>). <issue id="71b3a3b5-09a5-45f1-9c59-512c9368036e" label="EVE-259" href="https://linear.app/resnovas/issue/EVE-259/implement-the-initial-declarative-ui-module-registry-over-approved" /> owns only initial constrained declarative module schema/registry/renderer. This issue retains general screen awareness, app state/navigation, WebMCP and actual native evidence; reuse <issue id="71b3a3b5-09a5-45f1-9c59-512c9368036e" label="EVE-259" href="https://linear.app/resnovas/issue/EVE-259/implement-the-initial-declarative-ui-module-registry-over-approved" />, do not build a second registry. Every interactive element maps to an existing authorized action and emits viewer-filtered declared projection with canonical concepts plus rendered terminology. Unknown/unbound actions and protected-node modification are negative fixtures. Activation/update/disposal follows kernel Scope/generation/lease policy; offline/stale/denied states cannot expose hidden data. Existing <issue id="a7a66a5c-e747-4245-bc84-3232ef65a16c" label="EVE-16" href="https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web" /> relation is retained for its native/executable support matrix; it is not a reason to postpone portable data-only schema work or claim executable federation accepted. <issue id="71b3a3b5-09a5-45f1-9c59-512c9368036e" label="EVE-259" href="https://linear.app/resnovas/issue/EVE-259/implement-the-initial-declarative-ui-module-registry-over-approved" /> can checkpoint without that spike, but this issue's web/Android proof is still mandatory. No raw UI/plugin code execution or Eventiva-private component library. AI-authored planning addition.

## Declarative extension-screen telemetry integration (2026-11-15)

Coordinate with <issue id="71b3a3b5-09a5-45f1-9c59-512c9368036e" label="EVE-259" href="https://linear.app/resnovas/issue/EVE-259/implement-the-initial-declarative-ui-module-registry-over-approved" /> and <issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" />: signed/validated UI module registration contributes routes, slots, approved controls and permission-masked screen-context projections atomically during module activation, and disposes them during removal. Each component uses a canonical ActionHost action ID with no UI-only bypass; agent sees only viewer-authorized state. Instrument mount, navigation, action execution and UI errors with OTel correlation across execution/step/hook async side effects, stripped of sensitive screen values by default. Confirm stale/disabled UI projections disappear and permissions are rechecked after revocation. Native test proof per target; a web harness is not native certification.

## Linear comments (2)

### Comment 6c9d3d4d-6bec-4ecd-87f3-508f0fb0fb05

Author: GitHub. Created: 2026-10-31T22:31:39.556Z; updated: 2026-10-31T22:31:39.523Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/817). All replies are displayed in both locations.


### Comment 849453b3-7d47-4784-900f-f43bab4d6851

Author: Amp. Created: 2026-11-17T01:21:49.943Z; updated: 2026-11-17T01:21:49.930Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen) (comment ID above). Parent: None. Resolved: Not recorded.

Agent delivery checkpoint, 2026-11-17 01:22 London. Direct-main push independently confirmed at https://github.com/Resnovas/Eventiva/commit/b751f10cbf0c492560eba143c62e827283219b0c . Signed commits: a7abd828e885cc10312a4f4ca7420202230d76ba real hook-worker spans; d127d85a3566936b139383003e249c9465cdfa3d portable scoped lazy screen context; b751f10cbf0c492560eba143c62e827283219b0c clean-source graph. Central bash .amp/in/orb-backup/run-storage.sh node --run verify exited 0: all 85 Nx tasks and smoke pass. Root node --run check, graph check, canonical UI suite 52/52 (99.5% lines), real-worker/telemetry suite 61/61, canonical test and agent-doc typechecks pass. Workspace graph156 files/534 source edges/28 packages, zero violations/cycles. All three signatures G; remote CI pending with exact-head subscription. Only existing internal workspace example linkage added; frozen install validates unchanged external pins and supply-chain policy. No app activation, native execution, persisted trace handoff, production auth adapter or new external dependency. EVE-261/50/44 acceptance remains open. Next audited implementation-only work: actual Resources operation spans and distinct-process resource transaction/replay proof; no producer semantics or component adoption.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
