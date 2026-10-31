# Cluster sharding (decided 2026-10-31, EVE-18)

- **Base:** keep `@effect/cluster` 0.56.4 with `NodeClusterSocket.layer({ storage: "sql" })`. There is no shard manager in this version: runners register in `cluster_runners` and own shards through Postgres advisory locks (`SqlRunnerStorage`).
- **Persisted RPCs** (the default via `annotateRpcs(ClusterSchema.Persisted, true)`, plus a `PrimaryKey` on the payload): at-least-once, one reply per request, per-entity order kept. A runner kill can replay a handler, so make handlers idempotent (EVE-39).
- **Volatile RPCs** (`Persisted=false`): at-most-once, dropped while a shard moves. Never use them for anything that must arrive, including streamed agent output (EVE-36).
- **Mailboxes are serial.** Keep handlers short; never await a whole agent run inside a handler (EVE-35). Model agent runs as `@effect/workflow` workflows with activities (EVE-34).
- **Drain:** SIGTERM hands shards over once in-flight handlers finish, at most `entityTerminationTimeout` (15s).
- **Runner loss:** detected by lock expiry, `shardLockExpiration` 35s by default; measured failover 26s to 36s (EVE-38).
- **Every runner must host every entity type in its shard group.** A runner without the entity fails messages with `Entity type '...' not registered` (EVE-37).
- Reproduce with `packages/platforms/postgresql/sharding-probe/`; procedure and full results in [`../parts/local-dev/cluster-sharding-probe.md`](../parts/local-dev/cluster-sharding-probe.md).
