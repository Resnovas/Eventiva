# Cluster execution foundation (EVE-252)

## Delivery boundary

Phase A supplies validated deployment profiles, the common SQL-backed Node runner composition, persisted action dispatch, live health observations and an independent-process ownership harness. It does not activate an executable business backend yet. The server command validates configuration and module inventory, reports `unavailable` with zero healthy runners, and exits. It never falls back to direct local action execution.

EVE-42's SQL adapter must land before Phase B can supply the production composition and execute the PostgreSQL 17 harness. Unit tests use explicitly volatile test services only to check dispatch policy and protocol behavior. They do not prove independent-runner ownership, SQL durability, crash recovery or production readiness. The archived EVE-18 spike is not integrated.

## One execution path

Community defaults to one cluster-capable runner on one host. Self-hosted operators may increase the count. Cloud defaults to two independent runner processes, with disjoint acquired shard ownership. Two processes on one physical host are not host-level redundancy. Production requires independently failure-isolated hosts, shared reachable coordination storage and verified capacity and recovery before being called ready.

Both editions use `clusterRunner` in `apps/server/src/cluster.ts`, the same `EventivaAction` entity, serial mailbox handling and `ActionHost.execute`. No profile selects local/noop storage. The deployment schema, not a rollout flag, selects topology; the binding core security architecture cannot be disabled by a feature flag. Existing module/action feature gates remain enforced by ActionHost.

`ClusterActions.execute` refreshes trusted identity before sending. The receiving runner refreshes it again, validates the tenant-namespaced entity address, then invokes ActionHost. ActionHost rechecks live authorization, resource permissions, flags, approvals, timing, state/version, capacity, audit and A1 integrity. Transport identity claims and approval identifiers are not authority. Runner transport is internal-only: the default listener binds loopback. Do not expose these raw sockets publicly or treat them as authenticated HTTP/API ingress.

The compute identity is the JSON tuple `[tenant-or-null, entityKey]`. It is not a tenant database route. Resolve the tenant database only through authenticated `CurrentTenant` and `TenantRouter`. Entity keys must identify the domain aggregate whose operations need ordering; a caller-selected key is not proof of ownership. Domain/resource authorization remains mandatory.

All Execute RPCs explicitly annotate `ClusterSchema.Persisted = true`; upstream's default is false. Each new client invocation receives a fresh upstream transport request id. Do not add a transport primary key derived from the business idempotency key: cached transport replies could hide changed input or bypass replay authorization. New invocations with the same business key still enter ActionHost and its A1 deduplication transaction. Retransmission of an existing in-flight RPC is not a new authenticated invocation. Never expose internal cached replies as a public result lookup. At-least-once execution is not exactly-once business mutation.

## Configure topology

Set `EVENTIVA_CLUSTER_PROFILE` to a JSON object. It contains no database credentials. Unknown options, invalid values, insufficient shards and unsafe lease ratios fail validation. All runners sharing coordination storage must use the same shard count and available group list. Change those settings only with a separately verified migration/drain plan, not a rolling mixed configuration.

Community defaults:

```json
{ "edition": "community" }
```

One of two cloud processes on a single host:

```json
{
    "edition": "cloud",
    "expectedRunners": 2,
    "host": "127.0.0.1",
    "listenHost": "127.0.0.1",
    "port": 34431,
    "shards": 300
}
```

Use a distinct port, for example 34432, for the second process. Across hosts, set `host` to the peer-reachable internal address and `listenHost` to the appropriate private interface. Increasing `expectedRunners` changes the health expectation; it does not spawn processes, provision machines or autoscale anything.

| Option                | Default                                  | Meaning                                            |
| --------------------- | ---------------------------------------- | -------------------------------------------------- |
| `edition`             | Required; loader defaults to `community` | `community` or `cloud`                             |
| `expectedRunners`     | Community 1; cloud 2                     | Positive count; cloud minimum 2                    |
| `host`                | `127.0.0.1`                              | Advertised internal peer address                   |
| `listenHost`          | `127.0.0.1`                              | Internal socket bind address                       |
| `port`                | 34431                                    | Integer 1 to 65535; unique per process on a host   |
| `shards`              | 300                                      | Integer 1 to 10000, at least expected runner count |
| `weight`              | 1                                        | Positive integer relative shard allocation weight  |
| `mailboxCapacity`     | 4096                                     | Positive bounded entity mailbox capacity           |
| `lockRefreshMs`       | 10000                                    | Positive lease refresh interval                    |
| `lockExpiryMs`        | 35000                                    | Must exceed three refresh intervals                |
| `assignmentRefreshMs` | 3000                                     | Positive membership/assignment refresh interval    |
| `healthCheckMs`       | 5000                                     | Positive upstream health-check interval            |
| `drainMs`             | 15000                                    | Positive entity termination timeout                |
| `messagePollMs`       | 1000                                     | Positive persisted-message polling interval        |
| `replyPollMs`         | 200                                      | Positive persisted-reply polling interval          |
| `storage`             | `sql`                                    | Only accepted storage mode                         |

The composition uses the full validated ShardingConfig, not upstream environment overrides. Upstream remaining defaults include 100ms send retries and one-minute entity idle/registration timeouts. `RunnerHealth.layerPing` can take multiple timed attempts; `healthCheckMs` is not a hard failover SLA. Relative shard weight and bounded mailboxes provide basic placement/backpressure, not load-based autoscaling or measured free capacity.

## Observe health

`ClusterStatus.snapshot` reports expected, registered and live-responding runner counts, this process's actually acquired shard ids, active entity count, mailbox capacity and shard weight. It ignores registered processes without the action shard group. `healthy` requires the expected live count and at least one locally owned shard; `degraded` means this requirement is not achieved; `draining` reports shutdown; storage observation failure reports `unavailable`, not an empty healthy cluster. These are point-in-time observations, not quorum or availability guarantees. Collect a snapshot from every process to establish distribution and check disjoint ownership.

Spans are `cluster.action.send`, `cluster.action.receive`, `cluster.status` plus existing ActionHost spans. Do not log inputs, sessions, credentials or approval tokens. No ingestion provider or paid telemetry resource is created here.

## Storage integration gate (Phase B)

Use the existing EVE-42 exports, not a new workflow persistence abstraction:

- `client` from `@eventiva/integrations.sql/postgres` supplies Effect `SqlClient` and `PgClient`. Share one layer instance with upstream Cluster SQL layers and `storage('postgres')`. Do not create a separate handler client or detach transaction work.
- Inside authenticated `TenantRouter.run`, compose `durable` from `@eventiva/runtime/storage` against the same `Storage` and `CurrentTenant` supplied to handlers. `Storage.commit` owns atomic domain state, dedup output/receipt, history and outbox. CAS, leases and deadlines use its existing v1 operations.
- EVE-42 migration locking uses transaction-scoped `pg_advisory_xact_lock`; runtime dedup uses row/transaction locks. These are distinct from Cluster ownership locks.
- This composition sets `shardLockDisableAdvisory: true`, selecting upstream SQL lease rows rather than session advisory locks. This does not establish transaction-pooler compatibility: Cluster 0.60.5 still reserves a PostgreSQL client connection. Verify every query/transaction and any session behavior through the actual approved adapter/pooler before claiming support. The default upstream advisory-lock path needs a session-affine connection; its locks do not simply expire after 35 seconds.
- Upstream SQL layers perform DDL at acquisition, including legacy-table cleanup. Resolve migration/bootstrap ownership and least-privilege runtime access before production activation. A table prefix is not sufficient isolation for the default advisory lock namespace. Use an isolated coordination database for each deployment.
- The common composition includes the entity registration, but upstream transport acquisition and entity registration are separate steps. Prove a startup/readiness barrier before admitting traffic or claiming that an empty runner can never temporarily acquire shards. Peer membership and ping responses alone do not certify hosted entity registrations.
- `ClusterWorkflowEngine.layer` requires both Sharding and MessageStorage. Integrate its persisted workflow activities only after the SQL boundary lands, with domain side effects still using existing Storage integrity. Do not claim workflow recovery from installed packages.

No SQLite-only Cluster support, managed database compatibility or safe direct route is claimed. No new database, paid resource, CDC setting or secret is provisioned by this change.

## Run validation

Run `pnpm nx run @eventiva/server:test` for policy/protocol and health-observation tests, `pnpm nx run @eventiva/server:typecheck`, then `node --run verify` for the repository gate. Server build and smoke remain registration diagnostics until Phase B.

The independent-process harness is `apps/server/tests/two-runners.mjs`. It forks `runner-process.mjs` twice, verifies distinct OS PIDs and disjoint nonempty ownership covering all 24 shards, sends SIGTERM then an external SIGKILL, and requires the survivor to acquire all shards while reporting degraded count 1. It measures takeover time, checks rebalance after restart and bounds waits. It never represents TestRunner actors as processes.

After EVE-42 lands, supply a locally reviewed bootstrap ES module exporting `Dependencies`: a Layer providing the real Effect SQL client, registered ActionHost and trusted IdentityResolver. The harness itself always constructs the common SQL-backed clusterRunner. Use an isolated disposable local PostgreSQL 17 database, not a shared or managed database. The bootstrap remains a Phase B deliverable; no executable SQL bootstrap exists in Phase A.

Run `node apps/server/tests/two-runners.mjs /absolute/path/to/verified-bootstrap.mjs` after building the server and dependencies. Without the bootstrap this command fails rather than skips or reports success. Ports 34561 and 34562 must be free. Output includes PIDs, observed shard ids, live runner counts and signal takeover durations. Its final record explicitly says `persistedBusinessRecovery: NOT_TESTED`.

Phase B must extend that real-stack run with interrupted persisted work, ordered recovery, duplicate/changed-input keys, revoked permissions/approvals, cross-tenant attempts and database assertions showing one committed mutation/history/outbox/receipt result under failover. Only then can recovery acceptance be reported. Add the database-backed harness to CI after its adapter/bootstrap gate is resolved; Phase A does not install a placeholder passing CI job.

## Troubleshooting

- `unavailable` in server smoke is intentional until SQL and durable action adapters are composed. Do not replace them with memory services.
- A cloud snapshot with one live runner is degraded even on a single host. Start the missing independent process; do not lower the cloud minimum to hide failure.
- No local shards while peers respond can indicate assignment convergence or unsafe topology mismatch. Inspect every runner's profile and acquired shards.
- Startup DDL permission failure is a bootstrap/runtime-role gate, not a reason to grant administrator privileges to a runner.
- A process exiting before ready or a convergence deadline fails the harness. Inspect sanitized child logs and the isolated SQL database; do not count it as recovery evidence.
