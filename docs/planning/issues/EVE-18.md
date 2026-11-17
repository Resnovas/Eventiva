<!-- linear:generated:start -->
# EVE-18: S5: Verify sharding across two independent runners with drain and runner-loss recovery

[Live Linear source](https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:54.063Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Done (completed) |
| Priority | 0: No priority |
| Labels | Code, Discussion |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-54](EVE-54.md) |
| Related to | [EVE-33](EVE-33.md), [EVE-34](EVE-34.md), [EVE-35](EVE-35.md), [EVE-36](EVE-36.md), [EVE-37](EVE-37.md), [EVE-38](EVE-38.md), [EVE-39](EVE-39.md), [EVE-71](EVE-71.md), [EVE-87](EVE-87.md), [EVE-89](EVE-89.md), [EVE-90](EVE-90.md), [EVE-114](EVE-114.md), [EVE-142](EVE-142.md), [EVE-145](EVE-145.md), [EVE-191](EVE-191.md), [EVE-252](EVE-252.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Establish what the existing Effect Cluster setup already proves about sharding, and close the gap to the <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> bar: two independent runner processes, shard ownership, graceful drain and recovery after runner loss, with stated delivery guarantees.

## Context

* Spec: <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> Server-side sharding and load distribution; D3 says sharding takes priority over agent convenience.
* Repo: `packages/core/src/platform/` (cluster platform, colocated stack, supervised launch), `packages/cluster-tooling`, `packages/cluster-compose/docker-compose.postgresql.yaml`, root scripts `cluster:compose:*`, `platform:run:local-fiber`, `local-ci:cluster`. `@effect/cluster` 0.56.
* AGENT-SETUP.md: no shared databases or clusters during default setup; provision Postgres locally for this task only.

## Work

1. Read the platform and tooling code and list what exists: runner count, shard manager, storage, message persistence, entity definitions.
2. Run the existing compose demo (`pnpm cluster:compose:up`, then the verify script). Record output.
3. If it is single-runner, start two runner processes against one local Postgres and a demo entity. Show: entities spread across both runners; stop one gracefully and watch shards move; kill one with SIGKILL and watch recovery; send messages during each and record what was delivered, duplicated or lost.
4. State the guarantees observed (at-least-once, ordering per entity, idempotency needs). Do not claim exactly-once.
5. Note any spot where an agent run (long-lived, streaming) would be hurt by shard moves, and file each as its own Linear issue under <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" />.

## Acceptance

Commands and logs for each scenario, a guarantees table, and the list of gaps against <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" />.

## Out of scope

Kubernetes, production deployment, physical database partitioning.

## Done signal

Comment with results and one action decision: the existing platform is the base (with the listed gaps as tasks), or a named restructure.

## Escalation

If the cluster cannot run two runners without a code change, record the change needed and stop before making it on main.

## Linear comments (3)

### Comment 5423a15b-b6d9-46a9-b549-57e12165db74

Author: GitHub. Created: 2026-10-31T21:49:00.942Z; updated: 2026-10-31T21:49:00.911Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/785). All replies are displayed in both locations.


### Comment 7dec5531-bc1d-40c7-89bd-cbeac373bd4d

Author: jonathan@resnovas.com. Created: 2026-10-31T22:30:24.491Z; updated: 2026-10-31T22:30:24.435Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and) (comment ID above). Parent: None. Resolved: Not recorded.

## S5 results (2026-10-31, run by Claude for Jonathan)

**Answer:** the existing platform is the base. Two independent runners work with no code change; the gaps below are filed as tasks.

### What exists (Observed)

* @effect/cluster 0.56.4 via `NodeClusterSocket.layer({ storage: "sql" })` (`packages/core/src/cluster/sql-socket-layers.ts`). There is no shard manager in this version: runners register in `cluster_runners` and own shards through Postgres advisory locks on a dedicated connection (`SqlRunnerStorage`). Messages and replies persist in `cluster_messages` / `cluster_replies` (`SqlMessageStorage`).
* Entities: `DemoEntity` (`Shoot` is not persisted; `ShootWithDelay`, `ShootAt` persisted) and singleton `CronShip`, hosted by `RunnerExtension` when `CLUSTER_APP_MODE` is `primary` or `runner`.
* Shard count is 2 (`SHARDS_PER_GROUP=2`) in compose, local stack and FPK.
* The compose `shard-manager` service is really an extra runner with no entities (see EVE-37).

### Commands

Environment: local Postgres 16 (initdb, port 5433), Node 22.23.4. Docker was available but the compose demo needs `cluster-tooling:build-local-images` plus Redpanda, so step 2 was done by running the same entrypoint directly:

```
CLUSTER_APP_MODE=primary PORT=34431 pnpm exec tsx --tsconfig packages/platforms/postgresql/tsconfig.run.json packages/platforms/postgresql/src/platform.ts
CLUSTER_APP_MODE=primary PORT=34432 (same)
CLUSTER_APP_MODE=slow-shooter PORT=34439 (same)
```

Both runners registered (`cluster_runners`: 127.0.0.1:34431 and :34432, healthy) and each logged 30 `DemoEntity` handler lines. Needed `PGPORT`/`PGHOST` as well as `DB_*`, otherwise schema bootstrap dials Postgres on the cluster `PORT` (EVE-38).

Then a probe (one Effect file, same `makeClusterSqlRunnerLayer` / `makeClusterSqlClientLayer` wiring): runners A and B, a client sending to 40 entities every 200ms for 250 rounds (10,000 persisted + 10,000 volatile messages), 4 persisted 25s jobs standing in for agent runs, 30 shards. Every send and every handler run is a row in Postgres, so the numbers are counted, not read from logs. B is signalled at +15s.

### Results

| Scenario | Placement | Persisted lost | Persisted duplicated | Order per entity | Volatile lost | Shard move time | 25s job |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Steady state | A 19 entities / 11 shards, B 21 / 13 | 0 | 0 | kept | 0 | - | ran once |
| SIGTERM B, restart after 20s | A took all 40, B took 21 back ~3s after restart | 0 | 0 | kept | 332 | when in-flight handlers end, max 15s (`entityTerminationTimeout`) | finished on B if under 15s left; otherwise interrupted and re-run from the start on A |
| SIGKILL B, restart after 20s | A never took B's shards; B reclaimed them | 0 | 12 | kept | 1,751 | ~22s outage for B's entities | re-run from the start |
| SIGKILL B, no restart | A took all 40 | 0 | 0 | kept | 4,238 | 36.2s (= 35s `shardLockExpiration`) | re-run from the start on A |
| Runner with no entities (compose `shard-manager`) | 21 of 40 entities on it | 21 entities fail every message: `Entity type 'Probe' not registered` | - | - | - | - | - |

### Guarantees observed

* **Persisted RPC with a primary key:** at-least-once execution, one reply per request, per-entity order kept, no loss across drain or kill. Duplicates happen on SIGKILL (12 in 10,000), so handlers must be idempotent. Not exactly-once.
* **Volatile RPC:** at-most-once. Dropped whenever the shard is moving.
* **Entity mailbox:** serial. A long handler blocks every other message to that entity (worst entity: 73s with no deliveries).
* **Graceful drain:** works. Shards hand over once in-flight work finishes or 15s passes.
* **Runner loss:** detection is lock expiry, 35s by default; a restart at the same address inside that window takes its shards straight back.

### Gaps against EVE-13, filed as tasks

Agent-run issues (D3: fix how agent runs are modelled, not sharding):
* EVE-34 Agent runs restart from scratch when their shard moves (use `@effect/workflow` with activities)
* EVE-35 Keep a long agent run from blocking its entity's other messages
* EVE-36 Stream agent output from a durable log, not volatile RPCs

Platform:
* EVE-37 Remove the shard-manager process that owns shards with no entities
* EVE-38 Cut runner-loss failover from 36s and expose the cluster settings in config (also fixes `SHARDS_PER_GROUP=2`, the `PORT` fallback in `pgClientConfigFromEnv`, and `makeClusterSqlRunnerLayer` claiming to provide `SqlClient` when it does not)
* EVE-39 Make every entity action idempotent and persisted by default

### Evidence and code

Probe, harness, SQL and per-scenario logs are in the project files under `eve-18/` (README explains how to reproduce). Not pushed to GitHub: the clone's git identity is an AI tool, and the house rules forbid committing as an AI (AI-03), so the spike stays as files. Nothing touched main.

Tools not available: Graphify setup was not run (the per-clone `graphify setup` step); Context7 was not used, and @effect/cluster behaviour was read from the vendored source in `node_modules` instead.


### Comment 276de2c3-5be0-467f-910c-7ba5bfff2b2b

Author: jonathan@resnovas.com. Created: 2026-10-31T22:55:44.972Z; updated: 2026-10-31T22:55:44.929Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and) (comment ID above). Parent: None. Resolved: Not recorded.

## Decision and commit (2026-10-31)

Decided by Jonathan: keep the existing Effect Cluster platform as the sharding base, then fix the platform gaps first (EVE-37, EVE-38, EVE-39) and the agent-run tasks after (EVE-34, EVE-35, EVE-36).

Pushed to main (Eventiva ship-to-main exception):
* 7f823c1 `test(cluster): add the two-runner sharding probe and keep Effect Cluster`: `packages/platforms/postgresql/sharding-probe/` (probe.ts, scenario.sh, analyse.sql), `docs/parts/local-dev/cluster-sharding-probe.md` (decision, how to run, options, results, common problems), `docs/learnings/cluster-sharding.md`, and the index rows that link them.
* ae54174 `chore(graphify): refresh the code graph`: the first committed `graphify-out/graph.json`.

Checks run before the push:
* `node --run check`: lint passed for all 17 projects; `eventiva:format-check` fails, but it already fails on main (367 files before this change). The new files pass `prettier --check`.
* `nx run platforms-postgresql:lint`: passed.
* Commit hook: passed on both commits.
* Re-ran `scenario.sh killnorestart kill` from the committed location: 12,000 persisted messages, 0 lost, 0 duplicated, order kept; 5,323 volatile messages lost; failover 26.2s. Together with the earlier 36.2s run, failover is 26s to 36s depending on when the dead runner last refreshed its locks.
* Fixed on the way: the old harness let both runners race on the probe's own `CREATE TABLE IF NOT EXISTS`, and one runner crashed. The script now creates the probe tables first and waits for each runner to listen. Three simultaneous starts with the cluster's own migrations showed no race.

There is no `ai-docs/src` or docgen tool in this repository yet, so the agent-facing note went into `docs/learnings/` and `LLMS.md` was not regenerated.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
