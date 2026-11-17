<!-- linear:generated:start -->
# EVE-38: Cut runner-loss failover from 36s and expose the cluster settings in config

[Live Linear source](https://linear.app/resnovas/issue/EVE-38/cut-runner-loss-failover-from-36s-and-expose-the-cluster-settings-in) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:42.001Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Code, Decision: Audit needed, Delivery: Implementation pending, Enhancement |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-114](EVE-114.md) |
| Related to | [EVE-18](EVE-18.md), [EVE-76](EVE-76.md), [EVE-252](EVE-252.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Runner loss is detected and its shards reassigned within a stated target (proposed: 10s), set through the platform's configuration schema, with sensible shard counts.

## Context

* Found in <issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" />. Evidence: `/mnt/project-files/eve-18/killnorestart/`.
* SIGKILL of a runner: its shards were reassigned 36.2s later (kill 22:22:03.1, first delivery on the survivor 22:22:39.4), which is the 35s `shardLockExpiration` default. With a fast restart (20s) the killed runner reclaimed its own shards and the survivor never took them.
* SIGTERM: shards moved as soon as in-flight handlers finished or `entityTerminationTimeout` (15s) passed.
* `SHARDS_PER_GROUP` defaults to 2 in compose, `local-colocated-cluster-stack.ts` and FPK: at most two runners can ever hold shards. The library default is 300.
* `ShardingConfig` reads constant-case env vars (`HOST`, `PORT`, ...). `packages/databases/pg/src/pg-client-layer.ts` falls back to `PORT` and `HOST` for Postgres, so a runner without `PGPORT` tries to reach Postgres on its own cluster port (seen in <issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" />: ECONNREFUSED 127.0.0.1:34431).

## Work

1. Add a `cluster` section to the platform configuration schema (Effect `Config`, not ad hoc `process.env`): `shardsPerGroup` (default 300), `shardLockRefreshInterval` (default 3s), `shardLockExpiration` (default 10s), `entityTerminationTimeout` (default 15s), `runnerHealthCheckInterval`. Feed it into `NodeClusterSocket.layer({ shardingConfig })`.
2. Remove the `PORT` and `HOST` fallbacks from `pgClientConfigFromEnv`; Postgres reads `DB_*` only, matching `postgresClusterSqlLayer`.
3. Fix `makeClusterSqlRunnerLayer` and `makeClusterSqlClientLayer` in `packages/core/src/cluster/sql-socket-layers.ts`: their types claim to output `SqlClient` but they use `Layer.provide`, so callers fail at runtime with `Service not found: @effect/sql/SqlClient`. Use `Layer.provideMerge` and drop the casts.
4. Re-run the <issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" /> `killnorestart` scenario and record the new failover time.

## Acceptance

Failover at or under the configured `shardLockExpiration` plus 3s, measured with the <issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" /> harness; docs list every option with its default.

## Done signal

Comment with before and after timings.

## Linear comments (1)

### Comment 448e8772-2c90-4189-85f8-df46d15ddba3

Author: GitHub. Created: 2026-10-31T22:29:53.995Z; updated: 2026-10-31T22:29:53.965Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-38/cut-runner-loss-failover-from-36s-and-expose-the-cluster-settings-in) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/805). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
