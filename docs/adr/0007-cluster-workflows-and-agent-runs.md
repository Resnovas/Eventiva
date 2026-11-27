# ADR-0007: Cluster Sharding, Workflows, Agent Runs, and Module-Run Fencing

- Status: Accepted
- Date: 2026-11-21
- Owners: Platform & Distributed Runtime

## Context

Eventiva runs long-lived AI agent workflows and cluster RPCs on `@effect/cluster` backed by transaction-pooled PostgreSQL (`Neon` / `pgBouncer`). Long-lived handlers, multi-runner sharding, persisted workflow state, and tenant-scoped module runs must preserve strict tenant and principal isolation, avoid PostgreSQL session advisory-lock hazards, and prevent split-brain execution across restarts and hot updates.

## Decision

1. **Effect context isolation on long-lived layers and handlers**:
   - Long-lived layers, handlers, and workflow registrations explicitly pick or omit Effect services so request-scoped `Caller`, `CurrentTenant`, `Scope`, and `SqlClient.TransactionConnection` never leak across invocations (`apps/server/src/agent-run.ts`, `apps/server/src/approval-consent.ts`, `apps/server/src/backend.ts`).
2. **Tenant routing from freshly resolved identity and RPC reauthentication**:
   - Tenant database routing is derived exclusively from freshly resolved caller identity, never from request parameters, run references, compute entity keys, or inherited connections (`apps/server/src/agent-run.ts`, `apps/server/src/backend.ts`, `apps/server/src/http-actions.ts`).
   - Persisted Cluster RPCs treat serialized caller identity as an untrusted claim, re-resolving it on the explicitly routed tenant SQL client and preserving uniform denial codes when tenant routing is absent (`apps/server/src/backend.ts`).
3. **SQL lease-row shard locks and runner readiness**:
   - Cluster shard ownership uses SQL lease rows with `shardLockDisableAdvisory` enabled because PostgreSQL session advisory locks are incompatible with transaction-pooled connections (`apps/server/src/cluster-profile.ts`).
   - Exported configuration and boundary loaders strip raw input values, decoder messages, and underlying causes into closed typed errors rather than relying on callers to redact `Cause` or `Exit`.
   - `ClusterStatus` considers a runner healthy only when shared SQL `RunnerStorage` reports it healthy AND a bounded live RPC `RunnerHealth` ping succeeds (`apps/server/src/cluster.ts`).
   - Because `Sharding` starts background membership and shard-acquisition loops during layer acquisition, `clusterRunner` gates `RunnerStorage.register` and `getRunners` behind a `Deferred` barrier until all action and workflow handlers finish registering (`apps/server/src/cluster.ts`).
4. **Agent run acceptance, isolation, live authorization, and minimized output**:
   - Agent run acceptance binds the unique logical run ID and exact module snapshot in one tenant SQL transaction before `Workflow.execute` so crashes can retry identically while preventing input mutation (`apps/server/src/agent-run.ts`).
   - Within a tenant, agent runs and cached outputs are scoped strictly to the exact canonical principal that submitted the run.
   - Access policy is checked live on every control request, step boundary (including replay), and streamed output page or poll iteration, never bypassed by workflow completion (`apps/server/src/agent-run.ts`, `apps/server/src/agent-output.ts`).
   - `Status` and `Interrupt` reconstruct Workflow execution IDs solely from persisted tenant-accepted run definitions rather than trusting bearer-supplied execution IDs.
   - The agent output stream persists only explicitly emitted model text and minimal `StepCompleted` metadata, never implicitly copying tool inputs or outputs.
5. **Module-run exact artifact verification and epoch fencing**:
   - Run artifact resolution validates materialized `ServerModule` manifests against every pinned module ID/version and verifies unique provider instance bindings, failing closed with `RunRecoveryRequired` on any mismatch (`apps/server/src/module-run.ts`).
   - Module-bound runs verify exact retained artifacts before advancing tenant-local ownership epochs, bind one fence token per workflow attempt, and never let a transported fence token grant authority or select executables (`apps/server/src/agent-run.ts`, `apps/server/src/backend.ts`, `apps/server/src/cluster-actions.ts`).
6. **Cooperative workflow interrupts and two-tier cluster verification**:
   - In `@effect/cluster` 0.60.5, workflow interrupt signals are cooperative and observed on suspension or failure rather than preemptively aborting an already-executing `Activity` (`apps/server/tests/two-runners.mjs`).
   - Cluster verification splits strictly between volatile in-memory unit fixtures (dispatch and protocol policy only) and real multi-process OS/IPC PostgreSQL harnesses (ownership, failover, and crash recovery) that fail hard if bootstrap dependencies are absent (`apps/server/tests/cluster.spec.ts`, `apps/server/tests/two-runners.mjs`).

## Consequences

- Transaction-pooled PostgreSQL deployments never stall on pinned session advisory locks.
- Stale serialized identities, bearer execution IDs, or transported fence tokens cannot bypass live authorization or cross tenant/principal boundaries.

## References

- `apps/server/src/agent-run.ts`
- `apps/server/src/agent-output.ts`
- `apps/server/src/backend.ts`
- `apps/server/src/cluster.ts`
- `apps/server/src/cluster-actions.ts`
- `apps/server/src/cluster-profile.ts`
- `apps/server/src/module-run.ts`
- `apps/server/tests/cluster.spec.ts`
- `apps/server/tests/two-runners.mjs`
