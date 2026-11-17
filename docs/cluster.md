# Cluster execution foundation (EVE-252)

## Delivery boundary

Phase B composes EVE-42's landed SQL storage with the common Node runner and persisted workflow engine. The PostgreSQL conformance target runs independent OS processes, checks actual shard ownership and recovery after both SIGTERM and externally forced SIGKILL, and checks committed business evidence. It provisions no managed service. The archived EVE-18 spike is not integrated.

The `main` executable remains an inventory/parity diagnostic, reports `unavailable`, and exits. An authenticated application composes `backend` from `apps/server/src/backend.ts` with its trusted identity, authorization, policy, approval, flag, tenant-router and SQL layers. No default public authentication provider or privileged shell-to-business fallback is added. Passing local recovery tests is not production readiness or managed-pooler certification.

## One execution path

Community defaults to one cluster-capable runner on one host. Self-hosted operators may increase the count. Cloud defaults to two independent runner processes, with disjoint acquired shard ownership. Two processes on one physical host are not host-level redundancy. Production requires independently failure-isolated hosts, shared reachable coordination storage and verified capacity and recovery before being called ready.

Both editions use `backend` and its `clusterRunner` in `apps/server/src/cluster.ts`, the same `EventivaAction` entity, serial mailbox handling and `ActionHost.execute`. No profile selects local/noop storage. The deployment schema, not a rollout flag, selects topology; the binding core security architecture cannot be disabled by a feature flag. Existing module/action feature gates remain enforced by ActionHost.

`ClusterActions.execute` refreshes trusted identity before sending. The receiving runner refreshes it again, validates the tenant-namespaced entity address, then invokes ActionHost. ActionHost rechecks live authorization, resource permissions, flags, approvals, timing, state/version, capacity, audit and A1 integrity. Transport identity claims and approval identifiers are not authority. Runner transport is internal-only: the default listener binds loopback. Do not expose these raw sockets publicly or treat them as authenticated HTTP/API ingress.

Persisted invocation inputs and successful outputs use the existing `JsonValue` wire contract. For example, `{ "value": 7 }` is accepted; functions, bigint, symbols and undefined properties are rejected instead of reaching persistence with an erased schema. This wire constraint does not serialize or widen callable kernel provider services.

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

## Bounded AgentRun checkpoint (EVE-34 / EVE-54)

An agent run is a Workflow, not a long entity RPC. `apps/server/src/agent-run.ts` registers `EventivaAgentRun-v1` on the existing SQL-backed ClusterWorkflowEngine and a separate `EventivaAgentRunControl-v1` entity per `[tenant, runId]`. Its Start handler persists acceptance and submits with `discard: true`; Status polls and Interrupt signals the Workflow. None waits for the run lifetime. Register both through `registerAgentRuns` inside the existing `registerWorkflows` callback, before readiness opens. Obtain the internal client with `yield* agentRuns` from the backend's Sharding context. Do not expose that client or raw execution ids as public ingress.

Supply `AgentRunModel` and `AgentRunAccess` explicitly as well as the existing IdentityResolver, TenantRouter and ClusterActions. Missing model/access adapters fail registration with `AgentRunDenied: unavailable`; there is no model SDK, default provider or permissive policy. AgentRunAccess must enforce current run/resource permissions and model approval, deadlines and state; the model adapter remains responsible for its live provider boundary. It receives the reference, operation (`start`, `status`, `interrupt` or `step`) and, for steps, the 1-based index. Both orchestration and Activity entry recheck live identity/access; tool calls additionally enter ClusterActions -> ActionHost -> routed tenant Storage and all existing action gates. No cached output grants authority to a new request.

Use a fresh UUIDv7 `runId`, reserved as the accepted run's operational record id in its tenant database. Acceptance stores the complete caller, `scripted-v1` definition and ordered steps in existing Storage with state `agent-run.accepted-v1`. Unique insertion plus canonical input comparison binds that id before submitting the Workflow. Repeating identical input returns the same execution id; changed input gives a typed conflict, including after total runner restart. After an acceptance-before-submission crash, retry identical Start. Cross-principal access is denied; another tenant's same id cannot select the original tenant's storage. This checkpoint binds the original session as part of caller identity; session migration is not implemented.

Each step selects either literal JSON or the previous step's JSON output. The first step cannot select Previous. A Model step invokes exactly one injected model call; an Action step invokes one ClusterActions action. The following complete input illustrates the wire contract (trusted composition supplies the adapters separately):

```json
{
    "caller": {
        "subject": "019b0000-0000-7000-8000-000000000011",
        "session": "019b0000-0000-7000-8000-000000000021",
        "tenant": "019b0000-0000-7000-8000-000000000001",
        "kind": "human"
    },
    "runId": "019b0000-0000-7000-8000-000000002001",
    "definition": "scripted-v1",
    "steps": [
        {
            "_tag": "Model",
            "input": { "_tag": "Literal", "value": { "id": "019b0000-0000-7000-8000-000000003001", "seed": 11 } }
        },
        { "_tag": "Action", "action": "fixture.change", "entityKey": "order:example", "input": { "_tag": "Previous" } },
        { "_tag": "Model", "input": { "_tag": "Previous" } }
    ]
}
```

The synthetic fixture's model returns `{ id, value }` for the registered `fixture.change` action; a real adapter must return the registered action's validated input. All wire inputs/results are JSON, not functions or provider objects. Action steps require `action` and `entityKey`; optional `approvalId`, `deadline`, `expectedState` and `expectedVersion` default to absent and pass unchanged to ActionHost. They cannot supply their own business idempotency key. No retry count, topology, provider, module pin or rollout switch is part of this input. Only `definition: scripted-v1` is supported. Status returns `pending`, `succeeded` with JSON output, or `failed` without confidential failure detail. Interrupt acknowledges submission of the engine's persisted internal signal, not cancellation completion. In the pinned engine a busy run may continue until a suspension boundary; the fixture checks signal submission while blocked, not immediate cancellation. The full EVE-54 cancellation lifecycle and EVE-35 latency guarantee remain separate.

Step numbering is **1-based** and immutable. Activity names are `step:1:Model`, `step:2:Action`, etc. Keep those names stable across runner placement and retries: the engine persists each Activity reply under its execution/name/attempt. Separately pass the literal business/provider key `runId:stepIndex`, scoped by tenant. Never put the PID or retry attempt into it; intentional later calls allocate new indices. Upstream Activity.idempotencyKey hashes execution/name and is not this literal key. Do not use either business key as a control RPC primary key: each new control invocation must reauthorize and compare input rather than read a cached transport response.

### Execution-count proof and limits

Run the same uncached cluster-conformance and server:test targets described above. `agent-run.spec.ts` covers the typed protocol and mandatory services with explicitly volatile fixtures; `two-runners.mjs` supplies the independent-process SQL proof using the real AgentRun source. No extra fixture provisioning or dependency approval is introduced; the existing image exception, expiry, resource caps, synthetic loopback-only URL checks and unconditional teardown remain required.

The named scenario is `agent-run resumes after SIGKILL between completed steps 2 and 3 without re-executing completed Activities`. A three-step Model/Action/Model run computes seed 11 -> value 34 -> answer 172. The fixture appends every raw executor entry before business deduplication to a separate coordination table with tenant/run/step, sequence, PID and business key. It pauses in the injected next-step access check after Activity 2 has returned to orchestration, inspects its successful persisted SQL reply, and asserts counts `[1,1,0]`. It externally kills the checkpoint owner, requires the survivor to reach that boundary automatically without Start/resume/victim restart, releases it, and asserts `[1,1,1]`, ordered output equal to the no-fault control, a different final-step PID and one complete domain/history/outbox/dedup/success-receipt set for the writing step. It repeats for SIGTERM and resumes an in-flight run after all processes restart into Community mode. Counts and duplicate-start identity also persist.

Negative cases cover changed input, forged/foreign tenant access, invalid steps/definitions, missing execution ports, and identity/permission revocation or newly required approval between steps. Revoked callers cannot read cached output, repeat Start or interrupt; the next protected effect fails with no additional business write. The existing commit-before-Activity-reply crash scenario remains separate: an unfinished Activity may execute again while A1 commits its business mutation once. Append-only counters deliberately do not deduplicate, so restarting completed calls would fail the assertions even if A1 hid duplicate writes.

This is the fixed-definition prerequisite portion of [EVE-34](https://linear.app/resnovas/issue/EVE-34), not full [EVE-54](https://linear.app/resnovas/issue/EVE-54) or [EVE-47](https://linear.app/resnovas/issue/EVE-47) acceptance. Module-bound production definitions are rejected, not silently resolved to latest. Persisted module/provider/schema resolution and distributed fencing, real EVE-52 agent turns, public ingress, streaming, schedule/reaping and cross-transport cancellation remain unimplemented here. There is no second run engine. Completed-Activity recovery does not prove exactly-once external model spending, email or physical output, nor a production failover SLA.

## Troubleshooting

- `unavailable` in server smoke is intentional for the inventory diagnostic. Compose the backend with trusted adapters to run business requests; do not replace them with memory services.
- A cloud snapshot with one live runner is degraded even on a single host. Start the missing independent process; do not lower the cloud minimum to hide failure.
- No local shards while peers respond can indicate assignment convergence or unsafe topology mismatch. Inspect every runner's profile and acquired shards.
- Startup DDL permission failure is a bootstrap/runtime-role gate, not a reason to grant administrator privileges to a runner.
- A process exiting before ready or a convergence deadline fails the harness. Inspect sanitized child logs and the isolated SQL database; do not count it as recovery evidence.
- `AgentRunDenied: unavailable` at registration means a required execution port is absent; inject reviewed adapters rather than adding a permissive fallback. A conflict means the run id is already bound; retry identical input or allocate a fresh id for intentional new work. A denied Status/Interrupt requires fresh authorization, not a raw Workflow.poll bypass.
