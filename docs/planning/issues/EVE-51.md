<!-- linear:generated:start -->
# EVE-51: P1.12 Build collaboration: Yjs for text and canvas with record sync and authorization at sync

[Live Linear source](https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:48.829Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Outstanding, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | [EVE-17](EVE-17.md) |
| Blocks | [EVE-64](EVE-64.md), [EVE-95](EVE-95.md), [EVE-103](EVE-103.md), [EVE-109](EVE-109.md), [EVE-121](EVE-121.md), [EVE-122](EVE-122.md), [EVE-125](EVE-125.md), [EVE-133](EVE-133.md), [EVE-134](EVE-134.md), [EVE-135](EVE-135.md), [EVE-138](EVE-138.md), [EVE-147](EVE-147.md), [EVE-152](EVE-152.md), [EVE-166](EVE-166.md), [EVE-167](EVE-167.md), [EVE-169](EVE-169.md), [EVE-173](EVE-173.md), [EVE-176](EVE-176.md), [EVE-192](EVE-192.md), [EVE-201](EVE-201.md), [EVE-204](EVE-204.md), [EVE-211](EVE-211.md), [EVE-239](EVE-239.md) |
| Related to | [EVE-42](EVE-42.md), [EVE-61](EVE-61.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-75](EVE-75.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-91](EVE-91.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-112](EVE-112.md), [EVE-146](EVE-146.md), [EVE-150](EVE-150.md), [EVE-170](EVE-170.md), [EVE-202](EVE-202.md), [EVE-214](EVE-214.md), [EVE-217](EVE-217.md), [EVE-240](EVE-240.md), [EVE-244](EVE-244.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

People and agents edit the same records and the same text or canvas together, offline or online, with permissions enforced on what syncs.

## Context

* Phase-1 step 12 of the S2 capability map. Upstream reference at 6b5cf68: `collab/` (Yjs, y-protocols, diff-match-patch; Wrap). D1: both editing models, designed together.
* <issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" /> (S4, Done 2026-11-09) chose PowerSync (self-hosted Open Edition, Postgres bucket storage) for records and Yjs for text and canvas, with Yjs updates sent as rows through PowerSync. This issue implements that choice. Spike code and gotchas: <issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" /> comments and project files `eve-s4-sync/`.

## Scope

1. A Yjs document service behind one Effect boundary: load, apply update, presence, undo, persisted per resource.
2. Record sync on the engine S4 picks, on SQLite on device and Postgres on server.
3. Authorization at sync: a user or agent only receives and can only push what P1.4 allows; revocation removes data from the device.
4. Agent edits go through the same path as a person's edits, attributed in the audit log.

## Conflict rules

From the <issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" /> conflict policy, which this issue implements as written:

| Data kind | Rule |
| -- | -- |
| Record fields (default) | Per-field merge in the server action: PATCH carries only changed fields, and the last write to arrive wins. |
| Guarded fields (status transitions, money, assignments, dispatch state) | The action checks a precondition (expected version or state-machine transition). A conflict is rejected and shown to the user; never silent last-write-wins. |
| Quantities (stock, capacity, tickets) | Append-only delta rows; totals derived on the server. |
| Lists and ordering | Membership rows with client-generated ids; fractional index per item; delete wins over a concurrent edit. |
| Documents (rich text) | Yjs `Y.Text` / `Y.XmlFragment`; append-only update rows, compacted on the server. Always merges. |
| Canvas objects | Yjs `Y.Map` per object, merged per property; z-order by fractional index; delete wins. **Concurrent edits to the same property resolve by Yjs CRDT merge order, not last-writer-wins**: every device converges to the same value, which is not necessarily the edit that reached the server last (seen on the Android device test). UI copy and docs must not promise "last edit wins" for canvas. |
| Live ops (dispatch, show control, hardware) | Online-only actions. An offline client may queue a request with a TTL, re-validated on reconnect, never auto-applied after the window closes. |

## Revocation teardown

When PowerSync removes a sync bucket from a client (access revoked or scope narrowed), the client tears down every open Yjs document from that bucket immediately: destroy the in-memory `Y.Doc`, unmount or close its editors, drop presence and discard undo history. It must not wait for a reload or restart. The Android device test showed revoked text and canvas staying on screen until the app restarted, so this is a required behaviour, not an optimisation.

## Known gotchas from S4

* Each PowerSync database in one process needs a unique `dbFilename`.
* The connector must `complete()` a rejected transaction and surface the rejection to the user; never drop it silently.
* Debounce Yjs updates on the client and compact them into snapshot rows on the server.
* lib0 (Yjs) imports a webcrypto provider on React Native. Production maps it to an `expo-crypto` backed module, which needs dependency approval here.
* A fully offline cold start on web needs an app-shell service worker.

## Acceptance criteria

* Two clients and the agent edit one document and one record concurrently, one client offline, and all converge after reconnect.
* Revoking access removes the record from the revoked device on next sync, and any open text or canvas document from the removed bucket disappears from screen without a restart.
* Two clients moving the same canvas object concurrently converge to the same value on every device.

## Constraints

Effect-TS v3; no new dependency without approval here; ship to main with check results.

## Done signal

Merged with the convergence and revocation tests green.

## Linear comments (4)

### Comment 0867ee4f-7ea4-43ad-ba76-3d3663bd4e92

Author: GitHub. Created: 2026-10-31T22:31:41.473Z; updated: 2026-10-31T22:31:41.448Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/818). All replies are displayed in both locations.


### Comment 6326f24f-c1ea-4835-a39e-96ceeaf2b1cc

Author: jonathan@resnovas.com. Created: 2026-11-15T03:47:31.237Z; updated: 2026-11-15T03:47:31.209Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and) (comment ID above). Parent: None. Resolved: Not recorded.

## BINDING Neon CDC / PowerSync cost and compatibility gate — 2026-11-15

Fresh official Neon guidance confirms logical replication is enabled per project, permanently changes `wal_level` to `logical`, cannot be reverted, and restarts every compute. A connected subscriber prevents scale-to-zero and can create continuous compute cost. Inactive slots are removed after about 40 hours without acknowledged `flush_lsn`; branch restore removes slots. Neon supports at most 10 WAL senders and 10 replication slots by default.

For Eventiva/PowerSync, CDC must use a direct Neon endpoint without the `-pooler` suffix and a correctly privileged dedicated replication role; persistent replication is incompatible with PgBouncer pooling. Runtime Effect SQL queries must test pooled and direct paths separately. Do not enable replication or run tests on the existing historical PG16 Frankfurt project.

Plan the first London PG17 synthetic test project with replication disabled. Any later PowerSync/CDC integration trial requires separate owner approval, synthetic-only data, direct endpoint, measured active time, slot lag/retention and cost evidence before broad enablement. This is especially material for the project-per-tenant production model. A Neon branch remains a test-isolation mechanism, not equivalent production tenant isolation.

Official sources refreshed 2026-11-15:
- https://neon.com/docs/guides/logical-replication-guide (updated 2026-10-21)
- https://neon.com/docs/guides/logical-replication-neon (updated 2026-10-09)

Do not silently discard the approved PowerSync design if economics or scaling fail. Return an evidence-backed architecture proposal for owner decision.


### Comment 0fb5beb4-3d90-4a1b-a5b7-761193106735

Author: jonathan@resnovas.com. Created: 2026-11-15T03:58:42.859Z; updated: 2026-11-15T03:58:42.836Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and) (comment ID above). Parent: None. Resolved: Not recorded.

## AUTHORIZED Neon development database — created 2026-11-15

A clean synthetic-only Neon project is available for EVE-42 production-compatibility testing:

- Project: **Eventiva Development - UK PG17**
- Project ID: `icy-band-49524350`
- Main branch ID: `br-dawn-resonance-zadcbu0j`
- Database: `eventiva_dev`
- PostgreSQL 17.12, verified by live read-only SQL
- AWS London `aws-eu-west-2`
- Free plan; no paid-tier change

Quotas: active time 36,000s (10h), compute 9,000s (2.5 CUh), written data 100 MiB, transfer 1 GiB, logical size 100 MiB. Compute is fixed at 0.25 CU and restore retention is 6h. The account rejected a custom suspend interval with HTTP 412 and reports `suspend_timeout_seconds=0`; do not assume scale-to-zero. Verify behavior, avoid idle compute and monitor quota.

Logical replication is disabled. Do not enable CDC without separate owner approval. Use synthetic data only and isolated branches when needed. Never expose privileged connection strings or passwords; use the approved Neon connector or secret manager and least privilege. Run SSL, pooled/direct connection, migration, transaction, tenant-routing and exact-value conformance against this project and compare with local PostgreSQL 17 CI.

The legacy Frankfurt PG16 project `cool-unit-72575963` remains untouched and must not be deleted, reset or tested without a separate request. This authorization provisions no application infrastructure and permits no additional project, paid resource or plan change.


### Comment a1d0023c-fff0-45ca-8253-882fe9c2f4d7

Author: jonathan@resnovas.com. Created: 2026-11-15T10:48:24.873Z; updated: 2026-11-15T10:48:24.847Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and) (comment ID above). Parent: None. Resolved: Not recorded.

## Neon inventory correction — legacy project removed

Supersedes the earlier instruction to preserve the Frankfurt PG16 project: current verified inventory reports legacy project `cool-unit-72575963` has been deleted. Do not rely on it or attempt to recreate it. The authorized synthetic London PG17 project `icy-band-49524350` remains the only Eventiva Neon test target. Logical replication stays disabled and separately gated.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
