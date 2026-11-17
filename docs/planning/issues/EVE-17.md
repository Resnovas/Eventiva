<!-- linear:generated:start -->
# EVE-17: S4: Choose the offline sync engine for record edits and live text and canvas editing

[Live Linear source](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:54:48.748Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Done (completed) |
| Priority | 0: No priority |
| Labels | Code, Decision: Confirmed, Discussion |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-51](EVE-51.md), [EVE-64](EVE-64.md), [EVE-106](EVE-106.md), [EVE-120](EVE-120.md), [EVE-128](EVE-128.md), [EVE-138](EVE-138.md), [EVE-145](EVE-145.md), [EVE-148](EVE-148.md), [EVE-154](EVE-154.md), [EVE-172](EVE-172.md), [EVE-176](EVE-176.md), [EVE-179](EVE-179.md), [EVE-192](EVE-192.md) |
| Related to | [EVE-25](EVE-25.md), [EVE-26](EVE-26.md), [EVE-27](EVE-27.md), [EVE-33](EVE-33.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-62](EVE-62.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-103](EVE-103.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-125](EVE-125.md), [EVE-240](EVE-240.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Pick the sync machinery that gives offline-first record and field editing plus live text and canvas co-editing together, on SQLite on the device and Postgres/Neon on the server, for human and agent edits alike.

## Context

* Spec: <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> Offline-first collaborative foundation (both editing models, designed and validated together from the start).
* Database pair: Postgres/Neon via Drizzle, SQLite local. House data reference: `.agents/skills/coding-preferences/references/data.md`.
* Upstream Agent-Native uses Yjs for collaboration (`packages/core/src/collab/`) and has no SQLite adapter.
* Convex was considered by Jonathan but not evaluated; include it.

## Work

1. Paper evaluation from current docs and source. Candidates at minimum: PowerSync, ElectricSQL, Zero (Rocicorp), Triplit, Replicache, Convex, LiveStore, Jazz, and Yjs or Automerge for documents. Score each against: SQLite on iOS, Android and web; Postgres/Neon as source of truth; authorization at sync time and revocation on reconnect; durable offline queue surviving restart; conflict rules for records; document CRDT support or clean pairing with Yjs; schema evolution for old clients; self-hostable and licence; Effect integration effort; Expo support.
2. Shortlist two. Build a throwaway prototype (`spike/eve-s4-sync`, never merged) with the top choice: two clients edit the same record field and the same text document, one offline, then reconnect; a third client loses permission while offline and its writes are rejected at sync.
3. Write the proposed conflict policy per data kind (record fields, lists, documents, canvas objects).

## Acceptance

A scored table with sources, the prototype's command output, and convergence shown for both models.

## Out of scope

Production schema, real Eventiva entities.

## Done signal

Comment with the table, prototype results and one action decision: adopt engine X (plus Yjs if paired), or the runner-up with the reason.

## Escalation

Any candidate that requires a paid hosted service with no self-host path is flagged, not silently chosen. New dependencies go to <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> for approval.

## Linear comments (10)

### Comment 769b419d-d7af-4fe9-9e2f-fd97acfe686e

Author: GitHub. Created: 2026-10-31T21:48:59.404Z; updated: 2026-10-31T21:48:59.383Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/784). All replies are displayed in both locations.


### Comment 917d072f-8a9b-4004-a74d-401433e614b9

Author: jonathan@resnovas.com. Created: 2026-10-31T22:03:07.504Z; updated: 2026-10-31T22:03:07.469Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and) (comment ID above). Parent: None. Resolved: Not recorded.

## S4 findings: offline sync engine

**Proposed decision:** adopt **PowerSync** (self-hosted Open Edition, Postgres bucket storage) for records and fields, paired with **Yjs** for text and canvas documents. Yjs updates travel as rows through the same PowerSync pipe. Every write goes through an Eventiva Effect action on the server, which handles permission checks, per-field merges and audit. Runner-up: **Electric with TanStack DB**, if the FSL licence turns out to be unacceptable. New dependencies needing approval under EVE-13: `@powersync/node`, `@powersync/web`, `@powersync/react-native` (all Apache-2.0), the `journeyapps/powersync-service` image (FSL-1.1-ALv2) and `yjs` (MIT).

Tags: Observed = run in the spike; Docs = from current vendor docs; Inferred = my reading, not verified.

### Scored table

Scores are 0 to 2 per criterion. **Gate** marks a hard requirement from EVE-13 that a candidate fails outright.

| Criterion | PowerSync + Yjs | Electric + TanStack DB + Yjs | Zero | Convex | LiveStore | Jazz | Triplit | Replicache |
|---|---|---|---|---|---|---|---|---|
| SQLite on iOS, Android, web | 2 (Docs: RN/Expo, wa-sqlite web, Node) | 1 (client store is TanStack DB collections; SQLite persistence is not Electric's) | 1 (KV store over expo-sqlite / IndexedDB, not queryable SQL) | 0 | 2 | 1 | 1 | 1 |
| Postgres/Neon is source of truth | 2 (Observed) | 2 | 2 | **Gate** (own store; Postgres only as its storage) | **Gate** (event log is the truth) | **Gate** (own SQLite sync server) | **Gate** | 1 (bring your own backend) |
| Auth at sync, revocation on reconnect | 2 (Observed) | 1 (auth proxy plus shape `where`; revocation needs a re-shape) | 2 | 2 | 1 | 1 | 1 | 1 |
| Durable offline queue survives restart | 2 (Observed: `ps_crud` survived process exit) | 1 (TanStack DB offline transactions, separate) | **Gate** (Docs: "Zero does not support offline writes") | **Gate** | 2 | 2 | 2 | 2 |
| Record conflict rules under our control | 2 (Observed: our action decides, PATCH carries only changed columns) | 2 | 2 | 1 | 1 | 1 | 1 | 2 |
| Document CRDT or clean Yjs pairing | 2 (Observed text and canvas; vendor demo exists) | 2 (y-electric provider) | 1 | 1 | 1 | 2 (native CRDT) | 1 | 1 |
| Schema evolution for old clients | 1 (Inferred: client schema is views over JSON rows, so additive changes are safe; renames need dual-write) | 1 | 2 | 2 | 2 | 1 | 1 | 1 |
| Self-host and licence | 1 (service FSL-1.1-ALv2, which becomes Apache after 2 years and bars a competing hosted sync product; SDKs Apache-2.0) | 2 (Apache-2.0) | 2 (Apache-2.0) | 1 (FSL) | 2 | 2 (MIT) | 0 (acquired by Supabase 2025-10-08, future unclear) | 0 (maintenance mode, superseded by Zero) |
| Effect integration effort | 2 (connector is 2 methods; wrap with `Effect.tryPromise`) | 1 | 1 | 0 (its own server runtime) | 1 | 1 | 1 | 1 |
| Expo support | 2 (dev build; not Expo Go) | 1 | 2 | 1 | 2 | 2 | 1 | 1 |
| **Total / gates** | **18, no gate failed** | **14, no gate failed** | 17, **fails offline writes** | fails 2 gates | fails PG gate | fails PG gate | fails PG gate | deprecated |

Yjs is preferred over Automerge (both MIT) because upstream Agent-Native already uses Yjs (`packages/core/src/collab/`), so the ported collab module stays close to upstream.

No candidate requires a paid hosted service: Convex, PowerSync and Jazz all have self-host paths.

### Prototype

Code and logs: project files `eve-s4-sync/`. The spike used PowerSync service 1.27.2 in Docker, Postgres 16 with logical replication, three `@powersync/node` 1.2.0 clients (alice, bob, carol), each on its own SQLite file, and Yjs 13.6.33. The "server action" checks project membership per operation and applies field-level updates.

`node spike.mjs` (exit 0):

```
--- Scenario 1: bob goes offline; alice and bob edit the same field and the same text
[server] alice PATCH records/r1 -> applied
server while bob offline: {"title":"Title by alice (online)","status":"open"}
bob local while offline: {"title":"Title by bob (offline)","status":"confirmed"} | text: "[Bob offline] Run sheet: doors 19:00."
--- Scenario 2: carol goes offline, loses membership, keeps editing
[admin] removed carol from project p1 while she is offline
--- Reconnect bob and carol
[server] bob PATCH records/r1 -> applied
[server] carol PATCH records/r1 -> REJECTED (forbidden)
[server] carol PUT doc_updates/... -> REJECTED (forbidden)
RESULT server record: {"title":"Title by bob (offline)","status":"confirmed","updated_by":"bob"}
RESULT alice record : {"title":"Title by bob (offline)","status":"confirmed","updated_by":"bob"}
RESULT bob record   : {"title":"Title by bob (offline)","status":"confirmed","updated_by":"bob"}
RESULT carol record : null (rows remaining for carol: 0 )
RESULT alice text   : "[Bob offline] Run sheet: doors 19:00. Alice: add pyro check."
RESULT bob text     : "[Bob offline] Run sheet: doors 19:00. Alice: add pyro check."
RESULT alice canvas : {"truss-1":{"x":120,"y":0,"colour":"red"}}
RESULT bob canvas   : {"truss-1":{"x":120,"y":0,"colour":"red"}}
CHECKS {"fieldsConverged":true,"textConverged":true,"bothTextEditsKept":true,"canvasConverged":true,"revokedWritesRejected":true,"revokedDataRemovedFromDevice":true}
```

`node restart.mjs edit` then `node restart.mjs resume` (exit 0). Bob edits `status` offline and the process exits; alice changes `title`; a fresh bob process reconnects:

```
bob queued offline, ps_crud rows: 1 [{"op":"PATCH","id":"r1","type":"records","data":{"status":"on-hold"}}]
bob pending after restart: true ps_crud rows: 1
RESULT server: {"title":"Title by alice while bob was closed","status":"on-hold","updated_by":"bob"}
CHECKS {"queueSurvivedRestart":true,"bothFieldEditsKept":true}
```

Both models converged. The same field resolves to the last write to arrive; different fields both survive; text and canvas merge with no loss. Writes by a revoked user are rejected at sync and the data disappears from their device. A server-side write (standing in for an agent action) reached every client through replication.

### Gotchas observed

1. Two PowerSync databases in one process with the same `dbFilename` deadlock on `connect()`. Each needs a unique filename.
2. The connector must `complete()` a transaction even when the server rejects it, otherwise it retries forever. Rejected operations must be logged and shown to the user, never dropped silently.
3. Yjs emits one update per transaction (the seed alone produced 5 rows). Production needs client-side debouncing and server-side compaction into snapshot rows.
4. When revocation removes rows, the app must also drop its in-memory `Y.Doc`. Carol's local SQLite was cleaned, but her in-memory doc still held text.
5. The message "Could not apply checkpoint due to local data" is normal while uploads are pending.

### Proposed conflict policy per data kind

| Data kind | Policy |
|---|---|
| Record fields (default) | Per-field merge decided by the server action: PATCH carries only changed fields, and the last write to arrive wins. |
| Guarded fields (status transitions, money, assignments, dispatch state) | The action checks a precondition (expected version or state-machine transition). A conflict is rejected and shown to the user to resolve; never silent last-write-wins. |
| Quantities (stock, capacity, tickets) | Append-only movement rows (deltas), never overwrites. Totals are derived on the server. |
| Lists and ordering | Membership as rows with client-generated ids; order by fractional index per item; delete wins over a concurrent edit. |
| Documents (rich text) | Yjs `Y.Text` / `Y.XmlFragment`; updates are append-only rows, compacted on the server. Always merges. |
| Canvas objects | Yjs `Y.Map` per object, merged per property; z-order by fractional index; delete wins. |
| Live ops (dispatch, show control, hardware) | Online-only actions. An offline client may queue a *request* with a TTL, re-validated on reconnect, never auto-applied after the window closes. |

### Not done in this spike

- No React Native, Expo or web client was run (Node client only). Mobile and web support is from docs.
- Neon itself was not used (local Postgres 16). Neon logical replication is documented by both vendors but untested here.
- The spike is plain JS. Production wraps the connector and actions in Effect.
- The spike was not pushed to `spike/eve-s4-sync`, because this session's git identity is an AI tool and AI-03 forbids committing as Jonathan without his setup. The code is in project files instead.


### Comment 75c3959f-05b5-4422-967c-57b909ebd769

Author: jonathan@resnovas.com. Created: 2026-10-31T22:04:01.678Z; updated: 2026-10-31T22:04:01.645Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and) (comment ID above). Parent: 917d072f-8a9b-4004-a74d-401433e614b9. Resolved: Not recorded.

Correction to the last bullet: Eventiva's AGENTS.md exception (058251e) now covers agent sign-off. This session's tooling still blocked committing as Jonathan, so the spike was not pushed to any branch. The code and logs remain in project files under `eve-s4-sync/`.


### Comment 913385af-5c66-483f-b954-6431d4e45c97

Author: jonathan@resnovas.com. Created: 2026-10-31T23:03:52.654Z; updated: 2026-10-31T23:03:52.616Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and) (comment ID above). Parent: None. Resolved: Not recorded.

## S4 round two: web and Expo clients

Jonathan asked for web and Expo clients to be tested before adopting PowerSync.

**Result:** the web SDK and the Expo app's web target both pass every check in a real browser. The native Android build could not be compiled in this environment, because its network policy blocks Google's Android Maven host (`dl.google.com`). Nothing native was run.

### What ran

The setup is the same as in the first round: PowerSync service 1.27.2 (self-hosted), Postgres 16, and a backend acting as the Eventiva action server, which checks membership on every write. There were three Chromium 153 browser profiles (alice, bob and carol), each a full browser with its own storage.

Offline means the browser's network was cut; the SDK's disconnect was never called. Restart means bob's browser was closed completely and then cold-started with no network at all. The app shell, workers and wasm loaded from a service worker cache.

| Client | Stack | Result |
|---|---|---|
| Web | Vite app, `@powersync/web` 2.5.0 (wa-sqlite), Yjs 13.6 | 7 of 7 checks pass |
| Expo web | Expo SDK 58, React Native 0.88, react-native-web, `@powersync/web` 2.5.0 on web | 7 of 7 checks pass |
| Expo native (Android) | Same Expo app, `@powersync/react-native` 2.3.3 with op-sqlite 18.2.5 | **Not built**: Gradle cannot fetch the Android Gradle Plugin (`com.android.tools.build:gradle:9.2.1`) because `dl.google.com` returns 403 from the sandbox proxy |

The Expo app uses one code path on every platform. Only `src/db.native.js` (op-sqlite) and `src/db.web.js` (wa-sqlite with workers from `public/@powersync`) differ.

Output of `BASE=http://127.0.0.1:3001 node browser-test.mjs` against the Expo web export, with network-error console lines removed:

```
browser 153.0.8010.12 | UA Chrome/153.0.8010.12
initial record in all 3 browsers: {"title":"Initial title","status":"open","updated_by":"seed"}
--- bob and carol lose network (browser offline, no SDK disconnect call)
bob offline: pending ops 3 | local {"title":"Title by bob (offline)","status":"confirmed","updated_by":"seed"}
--- admin removes carol from the project while she is offline
--- bob closes the browser entirely while still offline, then relaunches with no network
bob after browser restart: pending ops 3 -> 3 | local {"title":"Title by bob (offline)","status":"confirmed","updated_by":"seed"} | text "[Bob offline] Run sheet: doors 19:00."
--- network restored for bob and carol
RESULT server record : {"title":"Title by bob (offline)","status":"confirmed","updated_by":"bob"}
RESULT alice record  : {"title":"Title by bob (offline)","status":"confirmed","updated_by":"bob"}
RESULT bob record    : {"title":"Title by bob (offline)","status":"confirmed","updated_by":"bob"}
RESULT carol record  : null | carol rejected: ["forbidden","forbidden"]
RESULT alice text    : "[Bob offline] Run sheet: doors 19:00. Alice: add pyro check."
RESULT bob text      : "[Bob offline] Run sheet: doors 19:00. Alice: add pyro check."
RESULT alice canvas  : {"truss-1":{"x":120,"colour":"red"}}
RESULT bob canvas    : {"truss-1":{"x":120,"colour":"red"}}
CHECKS {"fieldsConverged":true,"textConverged":true,"canvasConverged":true,"queueSurvivedBrowserRestart":true,"coldStartedFullyOffline":true,"revokedWritesRejected":true,"revokedDataRemovedFromBrowser":true}
```

The plain web client (`web-run-chromium.log`) produced the same CHECKS line.

### New findings

1. A fully offline cold start on web needs an app-shell service worker. Without one, `init()` hangs because the SQLite worker and wasm cannot be fetched. This is the app's job, not PowerSync's; the spike's service worker is in `web/server.mjs`.
2. On Expo web, Metro cannot bundle the PowerSync workers. Run `npx @powersync/web copy-assets` and point `database.worker` and `sync.worker` at `/@powersync/worker.js`. Vendor docs call React Native web support beta.
3. `@powersync/react-native` 2.x bundles the op-sqlite adapter directly and needs `@op-engineering/op-sqlite` 17 or 18. The old `@powersync/op-sqlite` package (peer op-sqlite 13 to 15) conflicts with it, so do not install both.
4. Expo prebuild for SDK 58 expects NDK 27.1. The build image had 28.2, which works once `android.ndkVersion` is set.

### Still unproven

- Native iOS and Android at runtime. This sandbox has no KVM (no emulator) and no access to Google's Android Maven, so the APK could not even be compiled.
- Safari and WebKit: only Chromium is installed here, and Safari's storage rules are the main web risk.
- Neon.

The spike code is in project files: `eve-s4-sync/web`, `eve-s4-sync/expo`, and `eve-s4-sync/local-stack`, a `docker compose` stack for testing the native app on an emulator.


### Comment ee70430e-1988-4078-ad77-b0745c6026be

Author: jonathan@resnovas.com. Created: 2026-10-31T23:04:04.041Z; updated: 2026-10-31T23:04:04.022Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and) (comment ID above). Parent: 913385af-5c66-483f-b954-6431d4e45c97. Resolved: Not recorded.

Correction to finding 4: setting `android.ndkVersion=28.2.13676358` was not verified, because the build stopped earlier, at dependency resolution. Treat it as untested.


### Comment e8304233-6dec-4e8d-8b78-98980b15501f

Author: jonathan@resnovas.com. Created: 2026-10-31T23:35:00.684Z; updated: 2026-10-31T23:35:00.667Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and) (comment ID above). Parent: None. Resolved: Not recorded.

## S4 round 3: Expo Android release APK builds

Result: `./gradlew assembleRelease` succeeded for the Expo spike app (PowerSync React Native + op-sqlite + Yjs). This proves the native build only. There is no KVM in the cloud environment, so the APK has not been run on an emulator or a device.

**APK:** `eve-s4-sync/expo/eve-s4-spike-release.apk`, 42,422,442 bytes (40.5 MiB), sha256 `cc94414a2bf9c452417f642ac311f32e207a62317a9a305dc1cdebbac54d7779`. It is signed with the debug key (the Expo template default). ABIs are arm64-v8a and x86_64. The JS bundle is 1.99 MB, with 759 modules.

`aapt2 dump badging`:
```
package: name='dev.eventiva.s4spike' versionCode='1' versionName='1.0.0' compileSdkVersion='37'
minSdkVersion:'24'
targetSdkVersion:'36'
uses-permission: name='android.permission.INTERNET'
```
The native libraries include `libpowersync.so` (417 KB arm64), `libop-sqlite.so` (1.6 MB arm64) and `libhermesvm.so`.

**Toolchain:** Expo SDK 58.0.22, React Native 0.88.1, Gradle 9.4.1, NDK 28.2.13676358, build-tools 37.0.0 and JDK 17. The build ran in the `mirror.gcr.io/reactnativecommunity/react-native-android:latest` image.

**Commands** (the full script is in `eve-s4-sync/expo/android-build/build.sh`):
```
npm install                                   # needed react-dom pinned to 19.3.0 to match react 19.3.0
npx @powersync/web copy-assets
EXPO_OFFLINE=1 CI=1 npx expo prebuild --platform android --no-install
# gradle.properties: reactNativeArchitectures=arm64-v8a,x86_64 and android.ndkVersion=28.2.13676358
# AndroidManifest: android:usesCleartextTraffic="true"
docker run --rm --network host ... -w /app/android mirror.gcr.io/reactnativecommunity/react-native-android:latest \
  ./gradlew --no-daemon --init-script /init-mirror.gradle assembleRelease
```

**Tail of the build log:**
```
BUILD SUCCESSFUL in 9m 13s
387 actionable tasks: 302 executed, 85 up-to-date
real	9m14.176s
```

**Problems found, and what fixed them:**
1. Attempt 1 failed because Maven Central returned 429. The Gradle Plugin Portal redirects to Maven Central, so rewriting the `mavenCentral()` URL was not enough. The init script `android-build/init-mirror.gradle` puts `maven-central.storage-download.googleapis.com` first in pluginManagement and in every project's repositories, and it also rewrites `repo.maven.apache.org`. Google Maven (dl.google.com) now works.
2. Attempt 2 failed in `:app:createBundleReleaseJsAndAssets`. Metro could not resolve `isomorphic-webcrypto/src/react-native`, which **lib0 (a Yjs dependency) imports on React Native** but does not declare. This is a real gotcha for production: Yjs on React Native needs a webcrypto provider. For the spike, `metro.config.js` maps that import to `src/webcrypto-shim.js`. The shim uses `globalThis.crypto` when it exists and otherwise falls back to Math.random, which is acceptable for the spike only. **Proposed for production:** map the import to a module backed by `expo-crypto` (an Expo first-party package) so Yjs client ids come from a secure random source. That is a new dependency and needs approval when the real client is built.

**Not tested:** the Android runtime (no emulator), and sync against the local stack from a device. The next step is to install the APK on a real device on the same network as `local-stack`. The `usesCleartextTraffic` setting is there so the app can reach the plain-HTTP dev backend.

Logs for all three attempts are in `eve-s4-sync/expo/android-build/`. This is a throwaway spike and is not committed to the repository.


### Comment b56424d9-88a1-4b02-88e6-48653c5bc150

Author: jonathan@resnovas.com. Created: 2026-11-09T21:57:45.809Z; updated: 2026-11-09T21:57:45.787Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and) (comment ID above). Parent: None. Resolved: Not recorded.

## Native device test: PowerSync + Yjs on a real Android phone (2026-11-09)
Run on Jonathan's home network. The local stack (Postgres 16, PowerSync service 1.27.2 and the Node spike backend, via docker compose) ran on a MacBook. The release APK (sha256 cc94414a…d7779, matching the build) ran on an Android phone (powersync-react-native, RN 0.88, Android 37) as bob, and the Expo web build ran in Chrome 157 on the laptop as alice.
Result: 6 of 6 runbook checks pass on native, which closes the gap left by the web-only cloud run.
- Live sync: pass. Title edits went both ways within seconds, and the server applied 2 edits from each device.
- Offline edits queue: pass. In airplane mode the phone showed its own title, text and shape edits immediately, with pending 4.
- Concurrent edits: pass. The laptop made its own edits while the phone was offline.
- Queue survives restart: pass. After force-closing and reopening the app, still offline, the edits and pending count were still there (reported by Jonathan).
- Convergence: pass. On reconnect pending dropped to 0. Both devices showed the same title (bob's, the last to reach the server, matching Postgres), both text additions "[bob 21:41:34] [alice 21:41:58]", and the same shape x of 163.
- Revocation: pass. Bob was removed while offline with a queued title edit. On reconnect the server logged 3 REJECTED (forbidden), the phone showed rejected 3 and record null, and the server title was unchanged. Text and canvas stayed on screen until the app restarted; after restarting online they were empty, so the local copy was wiped.
Notes for the decision:
- Concurrent canvas moves converged to alice's x even though bob's update reached the server later. That is CRDT merge order, not last-writer-wins, and should be stated in the canvas conflict rules.
- After revocation, in-memory Yjs docs stay visible until they are reloaded. The production client should tear down open docs when a bucket is removed.
- The 42 MB APK had to be split into 8 MiB parts to pass the project-file tool's 16 MB response limit.
- iOS is still untested; that needs a Mac with Xcode.


### Comment 986fe67b-7198-4c7d-9184-232c3f4216f0

Author: jonathan@resnovas.com. Created: 2026-11-09T22:04:28.180Z; updated: 2026-11-09T22:04:28.145Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and) (comment ID above). Parent: None. Resolved: Not recorded.

## Decision (2026-11-09): adopt PowerSync with Yjs

Jonathan approved the proposal on 2026-11-09. Eventiva's offline sync engine is:

* **PowerSync**, self-hosted Open Edition with Postgres bucket storage, for records and fields. The service is FSL-1.1-ALv2; the client SDKs are Apache-2.0.
* **Yjs** for text and canvas documents. Yjs updates travel as rows through the same PowerSync pipe.
* Every write goes through an Eventiva Effect action on the server, which does the permission check, the per-field merge and the audit record.

Runner-up, kept only as a fallback if the FSL licence becomes unacceptable: Electric with TanStack DB.

**Evidence:** Node clients (first findings comment), web and Expo web 7 of 7 (round two), and a real Android phone 6 of 6 against the local stack (2026-11-09 comment).

**Rules added to the spec** (EVE-13 offline section and EVE-51):

1. Concurrent canvas edits resolve by Yjs CRDT merge order, not last-writer-wins. The Android test showed two concurrent moves of the same shape converge to the same value on every device, but not necessarily to the edit that reached the server last. Any screen or doc that describes canvas conflicts must say this.
2. When the client loses a sync bucket (access removed), it tears down every open Yjs document from that bucket at once: destroy the in-memory `Y.Doc`, close its editors and drop presence. Waiting for a reload is not enough, because the Android test showed revoked text and canvas staying on screen until restart.

**Still open:** native iOS has not run (needs a Mac with Xcode). Tracked as its own follow-up issue, which does not block the decision. Safari/WebKit and Neon logical replication are also untested and are part of that follow-up's scope note. The `expo-crypto` webcrypto provider for Yjs on React Native still needs dependency approval when EVE-51 is built.


### Comment 94eceb77-6ac3-41ed-8ec8-61b08ffc35c2

Author: jonathan@resnovas.com. Created: 2026-11-15T01:45:08.870Z; updated: 2026-11-15T01:45:08.860Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and) (comment ID above). Parent: None. Resolved: Not recorded.

## Approved foundation policy reference

Jonathan approved A2–A4 and S2–S4 on 2026-11-15. Approval cannot be self-issued or weakened; guarded offline/scheduled work uses explicit state/version/idempotency/deadline and online revalidation; protected audit fails closed; scarce resources use ledgers/reservations/CAS; device records use typed raw tables/migrations; migrations are forward-only expand/contract; canonical IDs/time/decimals follow S4. See [EVE-40](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema), [EVE-42](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) and the [decision sheet](https://ampcode.com/artifacts/eventiva-architecture-decisions-3169b540-652d-4795-ae9c-7ad78a534f17). No dependencies or implementation are approved by this cross-reference.


### Comment 1c92bc96-9aa9-4d16-af7a-6ef7216c52a7

Author: jonathan@resnovas.com. Created: 2026-11-15T03:47:29.639Z; updated: 2026-11-15T03:47:29.606Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and) (comment ID above). Parent: None. Resolved: Not recorded.

## BINDING Neon CDC / PowerSync cost and compatibility gate — 2026-11-15

Fresh official Neon guidance confirms logical replication is enabled per project, permanently changes `wal_level` to `logical`, cannot be reverted, and restarts every compute. A connected subscriber prevents scale-to-zero and can create continuous compute cost. Inactive slots are removed after about 40 hours without acknowledged `flush_lsn`; branch restore removes slots. Neon supports at most 10 WAL senders and 10 replication slots by default.

For Eventiva/PowerSync, CDC must use a direct Neon endpoint without the `-pooler` suffix and a correctly privileged dedicated replication role; persistent replication is incompatible with PgBouncer pooling. Runtime Effect SQL queries must test pooled and direct paths separately. Do not enable replication or run tests on the existing historical PG16 Frankfurt project.

Plan the first London PG17 synthetic test project with replication disabled. Any later PowerSync/CDC integration trial requires separate owner approval, synthetic-only data, direct endpoint, measured active time, slot lag/retention and cost evidence before broad enablement. This is especially material for the project-per-tenant production model. A Neon branch remains a test-isolation mechanism, not equivalent production tenant isolation.

Official sources refreshed 2026-11-15:
- https://neon.com/docs/guides/logical-replication-guide (updated 2026-10-21)
- https://neon.com/docs/guides/logical-replication-neon (updated 2026-10-09)

Do not silently discard the approved PowerSync design if economics or scaling fail. Return an evidence-backed architecture proposal for owner decision.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
