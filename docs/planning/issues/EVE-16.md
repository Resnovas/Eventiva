<!-- linear:generated:start -->
# EVE-16: S3: Prove runtime loading and switching of a remote module on Expo web and Android

[Live Linear source](https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:29:03.882Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | In Progress (started) |
| Priority | 0: No priority |
| Labels | Code, Decision: Outstanding, Delivery: Implementation pending, Discussion |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-50](EVE-50.md), [EVE-77](EVE-77.md), [EVE-86](EVE-86.md), [EVE-120](EVE-120.md), [EVE-134](EVE-134.md), [EVE-149](EVE-149.md), [EVE-182](EVE-182.md), [EVE-204](EVE-204.md), [EVE-213](EVE-213.md) |
| Related to | [EVE-43](EVE-43.md), [EVE-62](EVE-62.md), [EVE-67](EVE-67.md), [EVE-73](EVE-73.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-172](EVE-172.md), [EVE-259](EVE-259.md), [EVE-260](EVE-260.md), [EVE-261](EVE-261.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Find out whether Expo, Re.Pack Module Federation v2 (native) and Module Federation v2 (web) can load, switch and dispose a remote UI module at runtime, and what that costs (dev builds, Expo SDK version, rebuild triggers).

## Context

* Spec: <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> sections React Native and Expo, Client-side dynamic module loading, Hot reloading.
* House UI reference: `.agents/skills/coding-preferences/references/ui.md` (self-hosted MF 2.0 on web, Re.Pack MF v2 on native, no Zephyr).
* Repo at 322ab45 declares `expo ~54.0.0` with `react-native 0.84.1`, and `@module-federation/enhanced ^0.21.2`. Expo 54 is documented for React Native 0.81, so check that pair first.
* Upstream Agent-Native's mobile app targets Expo SDK 57 (reference only).

## Work

1. Throwaway spike branch `spike/eve-s3-federation`, never merged. Pick the newest Expo SDK that Re.Pack's current release supports; record both versions and the source for that claim.
2. Host app plus one remote `Greeting` component, published as v1 and v2, on web (MF 2.0) and Android (Re.Pack).
3. In the running app, switch v1 to v2 without rebuilding the host; show state either handed over or deliberately remounted; dispose v1 (no listeners left); reject an incompatible v3 (wrong contract version) and fall back to the bundled copy; work offline from the cached or bundled copy.
4. Record which changes need a host rebuild (native module, shared dependency major) and whether a development build is required instead of Expo Go.
5. iOS: run it if a Mac is available; otherwise list the iOS check as outstanding.

## Acceptance

Commands and output for each target, a short screen recording or screenshots for the switch, and a support matrix (target by: state-preserving refresh, remote switch without rebuild, needs restart, needs native rebuild, unsupported).

## Out of scope

Real Eventiva screens, Rambo-UI components, agent registration of modules.

## Done signal

Comment on this issue with the matrix, versions and one action decision for Jonathan: adopt this stack and versions, or the named fallback (for example web-only federation first).

## Escalation

If Re.Pack cannot run inside Expo at all, stop and report the exact error and the nearest workable alternative.

## Initial module class and production gate (2026-11-15)

Canonical spec [https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c](<https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c>). Owner's initial third-party UI lane is DECLARATIVE DATA ONLY over installed approved Rambo-UI/Expo components (<issue id="71b3a3b5-09a5-45f1-9c59-512c9368036e" label="EVE-259" href="https://linear.app/resnovas/issue/EVE-259/implement-the-initial-declarative-ui-module-registry-over-approved" />). It does not require arbitrary executable RN download/federation. Preserve this spike's distinct trusted executable loading/OTA/shared-runtime/native/rebuild support matrix; web evidence is not native execution proof, native bundling is not device runtime proof. Existing approved production dependency matrix remains unchanged. Manifest trust/isolation assertions are not sandboxing; unsupported executable isolation fails closed. No new framework version/package/digest, provisioning or main push is authorized by this clarification. Record native/OTA/desktop gaps explicitly; do not hold portable declarative schema/registry design hostage to executable support. AI-authored planning addition.

## Linear comments (5)

### Comment be3b1189-4d29-40c9-b79f-6ba351c57545

Author: GitHub. Created: 2026-10-31T21:48:58.325Z; updated: 2026-10-31T21:48:58.275Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/783). All replies are displayed in both locations.


### Comment 5636ac4b-3418-4f95-a607-fe81a4472516

Author: jonathan@resnovas.com. Created: 2026-10-31T22:04:24.377Z; updated: 2026-10-31T22:04:24.295Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web) (comment ID above). Parent: None. Resolved: Not recorded.

## S3 spike result (agent run, 2026-10-31)

**Short answer:** runtime switching works on web today. On Android the Re.Pack bundles build on Expo SDK 56, but nothing has run on a device yet. Expo Go is out; a development build is required.

### Versions and sources

| Piece | Version tested | Source for the claim |
| --- | --- | --- |
| Re.Pack | 5.4.2 (latest, published 2026-10-22) | npm registry |
| Expo SDK | 56.0.24, which bundles RN 0.85.3 and React 19.2.3 | `expo/bundledNativeModules.json` |
| Module Federation | web: @module-federation/enhanced 2.9.2 on Rspack 2.3.0, and 0.22.0 on Rspack 1.7.12. Android: both pairs bundle | spike runs |

* **Why SDK 56:** it is the newest SDK that anyone upstream has run with Re.Pack. callstack/repack PR #1425 ("feat(expo): add first-class Re.Pack integration") targets SDK 56 with prebuild/CNG. That PR is still under review. The Re.Pack docs (re-pack.dev/docs/guides/expo-modules) cover only Expo Modules in a prebuild app and name no SDK version. Issue #1396 says Expo Go is not supported. SDK 57 (RN 0.86.3) and SDK 58 (RN 0.88.1) have no upstream evidence.
* **Repo mismatch:** `expo ~54.0.0` paired with `react-native 0.84.1` is invalid, because SDK 54 bundles RN 0.81.5. Fix this whichever way we decide.

### Support matrix

| Target | State-preserving refresh | Remote switch without host rebuild | Needs restart | Needs native rebuild | Status |
| --- | --- | --- | --- | --- | --- |
| Web, MF 2.0 | Yes. Host-held state handed to v2 (count 2 carried over), or deliberately remounted (count 0) | Yes. v2 and v3 were built while the host was running | No | No | **Proven** in headless Chromium |
| Android, Re.Pack MF v2 | Same React pattern; not run | Bundles built for host, v1, v2 and v3 (0 errors) | Not measured | Yes, for any native module or for a major bump of a shared react/react-native | **Bundles only**, not run on a device |
| iOS | n/a | n/a | n/a | n/a | **Outstanding** (no Mac) |
| Expo Go | n/a | n/a | n/a | n/a | **Unsupported**; use a dev build |

### What was proven on web

From `web/demo-output.txt`:

* **Switch:** v1 to v2 to v1 using `registerRemotes([{name, entry}], {force: true})` and `loadRemote`, with no host rebuild.
* **Dispose:** the listener count stayed at 1 across switches, so v1's listener was removed when v2 mounted. There were no page errors.
* **Contract check:** v3 declares contract 2.0.0 and was rejected. The host fell back to its bundled copy. A missing v9 also fell back.
* **Offline:** after going offline and reloading, the host and v2 loaded from the service-worker cache. A version that was never fetched falls back to the bundled copy.

### What needs a host rebuild

* A remote that adds a native module. Remotes cannot ship native code, which PR #1425 also confirms.
* A major-version change to a shared singleton (react, react-native).
* A change to the host's contract major.

A JS-only change to a remote needs no host rebuild.

### Android bundling workarounds

Each of these is needed on Re.Pack 5.4.2 with RN 0.85:

* Pin @babel/core 7. Babel 8 breaks `@react-native/babel-plugin-codegen`.
* Add @swc/helpers.
* Run react-native sources through `@react-native/babel-preset`. RN 0.85 uses Flow `component` syntax that Re.Pack's SWC/flow-remove-types path cannot parse.
* Turn off Re.Pack's codegen rule so codegen does not run twice.
* Set `getResolveOptions({ enablePackageExports: true })` so `@module-federation/enhanced/runtime` resolves.

### Not done, and why

* **Android device run:** the sandbox has no KVM and cannot reach dl.google.com, so there was no emulator, SDK or Gradle.
* **iOS:** no Mac was available.
* **Throwaway branch:** not pushed. The configured git identity is an AI, and the house rules need the accountable human as author. The spike sources, logs, screenshots and recording are kept in the project files under `eve-16-spike/`.

### New dependencies to approve (AI-12)

**Bumps:**

* expo ~54.0.0 to 56.0.24
* react-native 0.84.1 to 0.85.3
* react and react-dom pinned to 19.2.3
* @module-federation/enhanced ^0.21.2 to 2.9.2
* @rspack/core and @rspack/cli 1.6.8 to 2.3.0

**New:**

* @callstack/repack 5.4.2
* @callstack/repack-plugin-expo-modules 5.4.2
* @react-native-community/cli 20.2.0
* @react-native/babel-preset 0.85.3
* @babel/core 7.29.x
* babel-loader 9 (already a Re.Pack dependency)
* react-native-web 0.21.2

### Action decision for Jonathan

**Adopt Re.Pack 5.4.2 + Expo SDK 56 (RN 0.85.3) + Rspack 2.3 + MF 2.9.2 on a dev build, and ship web federation first.** Native federation stays behind a flag until one Android device run passes. The fallback is web-only federation, with native modules compiled into the app binary until Re.Pack's Expo integration (#1425) lands.


### Comment 487268e7-d3f6-478c-8077-865d709f6c23

Author: jonathan@resnovas.com. Created: 2026-10-31T22:36:34.263Z; updated: 2026-10-31T22:36:34.238Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web) (comment ID above). Parent: None. Resolved: Not recorded.

Decision (Jonathan, 2026-10-31, decision card): **adopt fully now**. The stack is Expo SDK 56 (RN 0.85.3), Re.Pack 5.4.2, Rspack 2.3, Module Federation 2.9.2, on a development build. Native federation goes on immediately on web and native alike, with no feature flag gate.

He chose this knowing that Android and iOS have only been bundled, not run on a device. The first device run is now a known risk to close during implementation, not a gate.


### Comment c46f162f-26c9-485a-bbd1-44a6eaab3cd2

Author: jonathan@resnovas.com. Created: 2026-11-15T17:42:56.296Z; updated: 2026-11-15T17:42:56.196Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web) (comment ID above). Parent: None. Resolved: Not recorded.

## Owner-authorized disposable compatibility spike — 2026-11-15

Jonathan approved **running the EVE-16 Expo / Re.Pack / Module Federation compatibility spike**. GPT/Codex orb: https://ampcode.com/threads/T-6bf61d85-1883-4885-ba00-ba989fe59850 . Scope is limited to disposable isolated test code and the exact dependency versions necessary **inside the spike only**. Validate real host/remote v1→v2 live switch and disposal, incompatible v3 and fallback, offline cache/bundle, web/Android launch/rebuild and Expo Go vs dev-build requirements; iOS only if suitable executor available. Publish evidence, version/security/compatibility support matrix and recommendation. This is **not approval to introduce dependencies into Eventiva main, modify production app, push/merge experimental branch, provision paid services, or start EVE-50 implementation**. Preserve signed/checked repo main and existing security gates. Claim only tests actually run.


### Comment ef4f9650-9e28-4c17-b651-2c685da833fe

Author: jonathan@resnovas.com. Created: 2026-11-15T18:00:52.799Z; updated: 2026-11-15T18:00:52.722Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web) (comment ID above). Parent: None. Resolved: Not recorded.

Amp disposable-spike report, 2026-11-15. Recommend the fallback: web-only federation first; retain bundled native modules. No production dependency approval.

Pins: Expo 58.0.23 / RN 0.88.1 / React 19.3.0, Re.Pack 5.4.3, MF enhanced 2.9.3, Rspack 2.3.1. Latest Expo/Rspack patches failed the unchanged 7-day age gate. Historical Expo54/RN0.84.1 was invalid (SDK54 targets RN0.81); current production Expo56/RN0.85 is untouched.

| Target | Runtime state / switch | Restart / rebuild | Result |
|---|---|---|---|
| Web Chromium | v1 to v2 handoff, deliberate reset, 20-switch disposal, v3 rejection, cached/bundled offline paths executed | No switch restart; unchanged host hash | Pass |
| Android manual ExpoModulesPlugin | Host/v1/v2/v3 JS compile; no runtime | Custom host/native rebuild triggers documented only | Unexecuted: no device/emulator/SDK/KVM |
| Android Expo alpha 0.0.1 | Prebuild/doctor pass; bundle fails REACT_NATIVE_RESOLUTION_FAILED on old assets-registry lookup | Expo Go/dev-client launcher/Expo OTA unsupported | Blocked |
| iOS | Unexecuted | Not established | Mac unavailable |

Frozen install/typecheck pass; browser probe: 12 passing result records including 4 zero-violation axe states; root check: 55 passed. Audit: 0 critical/high, 2 moderate, 1 low; no overrides. No paid API/hosting/provisioning; future operating costs unpriced.

Durable report with official citations, exact logs, captures and downloadable source/lock: https://ampcode.com/artifacts/eve-16-federation-evidence-b38f475c-6ef9-4efe-9765-58a3d38503f5

EVE-16 remains incomplete: native runtime acceptance is missing. EVE-50 is not ready against that dependency and was not implemented. Uncommitted spike/eve-s3-federation only; main/EVE-43 untouched; no push/PR/merge/rebase.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
