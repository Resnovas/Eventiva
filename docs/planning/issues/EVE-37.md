<!-- linear:generated:start -->
# EVE-37: Remove the shard-manager process that owns shards with no entities

[Live Linear source](https://linear.app/resnovas/issue/EVE-37/remove-the-shard-manager-process-that-owns-shards-with-no-entities) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:40.592Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Code, Decision: Audit needed, Delivery: Implementation pending, Fix |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-18](EVE-18.md), [EVE-252](EVE-252.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

The compose and Kubernetes demo stacks run only processes that host the entities they own shards for.

## Context

* Found in <issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" />. Evidence: `/mnt/project-files/eve-18/emptyrunner/`.
* @effect/cluster 0.56.4 has no shard manager; shard ownership is advisory locks in Postgres (`SqlRunnerStorage`). `packages/platforms/postgresql/src/shardManager.ts` launches `NodeClusterSocket.layer({ storage: "sql" })` with no entities, so it registers as a full runner and takes its share of shards.
* Reproduced with one entity runner plus `shardManager.ts`, 30 shards, 40 entities: 21 of 40 entities failed every message with `Entity type 'Probe' not registered`.
* `packages/cluster-compose/docker-compose.postgresql.yaml` runs a `shard-manager` service and `SHARDS_PER_GROUP=2`, so the demo loses roughly half its traffic once the shard-manager holds a shard.

## Work

1. Delete `packages/platforms/postgresql/src/shardManager.ts` and the MySQL equivalent if present; remove the `shard-manager` service and `depends_on` entries from the compose file and the Kubernetes manifests rendered by `platforms-postgresql:cluster:render`.
2. Replace it with a second `battleships` runner (`CLUSTER_APP_MODE=runner`) so the demo shows two runners.
3. Update `packages/cluster-tooling/cli/verify-cluster-demo-logs.ts` to assert both runners logged `Boom!` and no `not registered` errors.
4. Update people docs (`docs/parts/local-dev/three-tier-platform-runtime.md`) and agent docs.

## Acceptance

`pnpm cluster:compose:up` then `pnpm cluster:compose:verify-demo-logs` passes and shows two runners.

## Done signal

Comment with the verify output.

## Linear comments (1)

### Comment 54482088-de5c-47fe-9393-61102b8d2a18

Author: GitHub. Created: 2026-10-31T22:29:52.572Z; updated: 2026-10-31T22:29:52.550Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-37/remove-the-shard-manager-process-that-owns-shards-with-no-entities) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/804). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
