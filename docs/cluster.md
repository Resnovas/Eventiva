# Cluster execution foundation (EVE-252)

## Delivery boundary

Phase B composes EVE-42's landed SQL storage with the common Node runner and persisted workflow engine. The PostgreSQL conformance target runs independent OS processes, checks actual shard ownership and recovery after both SIGTERM and externally forced SIGKILL, and checks committed business evidence. It provisions no managed service. The archived EVE-18 spike is not integrated.

The `main` executable remains an inventory/parity diagnostic, reports `unavailable`, and exits. An authenticated application composes `backend` from `apps/server/src/backend.ts` with its trusted identity, authorization, policy, approval, flag, tenant-router and SQL layers. No default public authentication provider or privileged shell-to-business fallback is added. Passing local recovery tests is not production readiness or managed-pooler certification.

## One execution path

Community defaults to one cluster-capable runner on one host. Self-hosted operators may increase the count. Cloud defaults to two independent runner processes, with disjoint acquired shard ownership. Two processes on one physical host are not host-level redundancy. Production requires independently failure-isolated hosts, shared reachable coordination storage and verified capacity and recovery before being called ready.

Both editions use `backend` and its `clusterRunner` in `apps/server/src/cluster.ts`, the same `EventivaAction` entity, serial mailbox handling and `ActionHost.execute`. No profile selects local/noop storage. The deployment schema, not a rollout flag, selects topology; the binding core security architecture cannot be disabled by a feature flag. Existing module/action feature gates remain enforced by ActionHost.

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

## Compose the backend

1. Decode the deployment profile before opening sockets. Build the application security services and trusted `TenantRouter`. Do not construct routes from unverified transport headers.
2. Supply the compute database's `SqlClient` to `backend(profile, initialize, registerWorkflows)`. Every runner in this deployment uses that same coordination database and registers the same entity/workflow definitions. The database is independent of tenant database routing.
3. In `initialize(host)`, register application modules. This callback runs inside each authenticated tenant route. Capture that route's `Storage` in module handlers, or provide it through the module's layer. The backend constructs `durable` there before building ActionHost, so Integrity, audit and handler writes use the same Storage transaction. The initial implementation scopes a host per invocation rather than caching tenant-bound services across requests. Keep module acquisition reversible and scoped; it is not a once-per-process startup hook.
4. Register workflows in the optional `registerWorkflows` Effect (default `Effect.void`). It runs once per process, before runner membership and assignment reads are admitted. Register workflows with the `eventiva-actions` shard group. The backend provides `WorkflowEngine`, Sharding and MessageStorage from the same transport. Workflow activities that mutate business state invoke `ClusterActions`, not a privileged direct handler.
5. Build the layer inside an Effect scope. Use `ClusterActions.execute` for ingress and collect `ClusterStatus.snapshot` on every runner. Keep the scope alive with the application's server lifetime; scope closure drains the runner. `backend` does not export ActionHost or ClusterActionExecutor to consumers.

Use `apps/server/tests/backend.spec.ts` as a compiling, typed composition example. The complete two-tenant SQL/bootstrap example is `apps/server/tests/sql-fixture.mjs`; its identities and policy switches are synthetic fixtures, not production security adapters. No environment variable can replace those required security services or turn Cluster off.

### SQL boundaries and remaining production gates

Use the existing EVE-42 exports, not a new workflow persistence abstraction:

- `client` from `@eventiva/integrations.sql/postgres` supplies Effect `SqlClient` and `PgClient`. Share a single client instance for a tenant's `storage('postgres')`, handler writes and Integrity. The coordination database may use a different client. Never create a separate handler client behind Integrity or detach transaction work.
- Inside authenticated `TenantRouter.run`, compose `durable` from `@eventiva/runtime/storage` against the same `Storage` and `CurrentTenant` supplied to handlers. `Storage.commit` owns atomic domain state, dedup output/receipt, history and outbox. CAS, leases and deadlines use its existing v1 operations.
- EVE-42 migration locking uses transaction-scoped `pg_advisory_xact_lock`; runtime dedup uses row/transaction locks. These are distinct from Cluster ownership locks.
- This composition sets `shardLockDisableAdvisory: true`, selecting upstream SQL lease rows rather than session advisory locks. This does not establish transaction-pooler compatibility: Cluster 0.60.5 still reserves a PostgreSQL client connection. Verify every query/transaction and any session behavior through the actual approved adapter/pooler before claiming support. The default upstream advisory-lock path needs a session-affine connection; its locks do not simply expire after 35 seconds.
- Upstream SQL layers perform DDL at acquisition, including legacy-table cleanup. Resolve migration/bootstrap ownership and least-privilege runtime access before production activation. A table prefix is not sufficient isolation for the default advisory lock namespace. Use an isolated coordination database for each deployment.
- Upstream transport acquisition starts background membership loops. The composition gates both runner registration and assignment reads until the action entity and workflow registrations finish. The SQL harness holds registration open and observes zero membership and zero acquired lock rows before release. A responding socket alone is still not application readiness. Module activation failures on an invocation fail closed, not through an unprotected local path.
- `ClusterWorkflowEngine.layer` requires both Sharding and MessageStorage and is supplied by the common runner. The fixture kills workflows after the business commit but before the Activity reply, then checks automatic persisted recovery on the survivor without calling resume or resubmitting the workflow. Business idempotency, not an exactly-once transport claim, prevents duplicate mutation.
- Effect SQL 0.52.2 shares `SqlClient.TransactionConnection` across client instances. A query on client B inside client A's transaction uses A's connection unless the effect explicitly removes that tag. The backend clears inherited request/storage/transaction scopes before tenant routing and never captures a bootstrap caller as a live caller. Independently routed SQL control-plane identity/policy queries must similarly omit that ambient transaction tag. Keep it intact for tenant handlers, domain policy reads, Integrity and nested Storage operations. The SQL fixture explicitly separates its control-plane reads; two client objects alone are not isolation.

No SQLite-only Cluster support, managed database compatibility or safe managed direct route is claimed. No managed database, paid resource or CDC setting is provisioned by this change. Tests use generated local credentials and disposable databases only.

## Run validation

Follow the disposable PostgreSQL fixture instructions in `docs/storage.md` and its bounded image-risk exception. Export `STORAGE_TEST_POSTGRES_URL` from secure local configuration. The tests accept only a loopback host and an administrative fixture database named `eventiva_test`; they create and clean up randomly named databases. Do not point them at Neon, production or user data. Ports 34561, 34562 and 34563 must be free.

Run `pnpm nx run @eventiva/server:cluster-conformance` to build and run the process harness. Run `pnpm nx run @eventiva/server:test` for that harness plus policy/protocol, health and typed SQL backend tests. Neither target caches database evidence. `node --run verify` includes them through the server test target; existing CI uses its bounded PostgreSQL fixture, with no new job, image, dependency or paid service. Existing editor Test actions reach these same targets.

The harness forks `runner-process.mjs` with the reviewed SQL fixture. Each child composes the real backend, a shared compute database and two independently migrated tenant databases. It verifies distinct OS PIDs and disjoint ownership of all 24 shards. For each signal it pauses an actual A1 transaction after domain/history/outbox writes but before commit, observes no externally visible record, kills the owner, and requires the original persisted invocation to finish on the survivor. It separately pauses a workflow Activity after business commit but before its reply, kills that workflow owner, observes degraded count 1 with all shards acquired, and polls automatic completion. SQL assertions require exactly one domain record/version, history entry, outbox intent, completed dedup result and successful receipt per logical operation.

Security probes reject changed-input retries, forged tenant claims, unknown actions, revoked identity/permission, newly required but missing approval and unavailable audit storage. The same record and business key can commit independently in two authorized tenant databases. A final full runner restart selects the community profile, acquires all shards on one process, and reads persisted workflow completion and business replay. Output ends with `sql-cluster-conformance-passed`; a missing fixture or failed assertion fails the target, never skips it.

This proves process failure and SQL-backed recovery on one local host, not host/network partitions, restricted-role DML/RLS, autosuspend, managed-pooler behavior, CDC, cross-project isolation, an external outbox dispatcher, autoscaling or an operational SLA. The fixture stages outbox intents; it does not execute external effects. PostgreSQL driver query-concurrency deprecation warnings remain visible and are not a clean-security claim.

## Troubleshooting

- `unavailable` in server smoke is intentional for the inventory diagnostic. Compose the backend with trusted adapters to run business requests; do not replace them with memory services.
- A cloud snapshot with one live runner is degraded even on a single host. Start the missing independent process; do not lower the cloud minimum to hide failure.
- No local shards while peers respond can indicate assignment convergence or unsafe topology mismatch. Inspect every runner's profile and acquired shards.
- Startup DDL permission failure is a bootstrap/runtime-role gate, not a reason to grant administrator privileges to a runner.
- A process exiting before ready or a convergence deadline fails the harness. Inspect sanitized child logs and the isolated SQL database; do not count it as recovery evidence.
