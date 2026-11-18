# Durable agent output

EVE-36 adds an internal, tenant-routed output log to the fixed `scripted-v1`
AgentRun. A reader resumes after its last consumed offset instead of depending
on volatile runner RPC chunks. This slice does not select a public transport,
model provider or production deployment. No paid model is used.

## Compose the log

1. Apply the forward-only paired `0010.sql` migration with the existing storage
   migrator, first on disposable storage. Do not change applied migrations.
2. Build `agentOutputLog(resolve)` from `@eventiva/integrations.sql/agent-output`.
   Its trusted resolver maps the routed tenant to an existing SQL client and
   fails for unknown tenants. It must not provision databases or accept a
   database selector from request input.
3. Supply that Layer as `AgentOutputLog` alongside `AgentRunAccess` and
   `AgentRunModel` when calling `registerAgentRuns` through
   `backend(profile, initialize, registerWorkflows)`. Missing ports fail closed.
4. Implement scripted model adapters with `emit(chunkIndex, text)`. Start at
   index 0, emit in order and await each Effect. Reuse the same index and exact
   text on every retry. Emit only text approved for that run's reader. Never
   forward raw prompts, credentials, provider diagnostics or hidden tool data.
5. Read with `readAgentOutput({ caller, runId, after, limit })` from
   `apps/server/src/agent-output.ts`. Supply current `IdentityResolver`,
   `AgentRunAccess`, trusted `TenantRouter` and `AgentOutputLog`. This is an
   internal authenticated composition seam, not an HTTP endpoint.

The complete SQL composition and scripted model are in
`apps/server/tests/sql-fixture.mjs`; the compiling persistence example is
`ai-docs/src/14_cluster/03_output.ts`. Run handles retain their existing
start/status/interrupt interface. Durable output is part of that mandatory
scripted execution contract, not a separately enabled application feature.
No new rollout/configuration switch or external flag is installed.

## Resume with an exclusive cursor

For the initial page use `after: -1`. Offset 0 is the first event. For example,
read `{ caller, runId, after: -1, limit: 2 }`, consume events 0 and 1, then
reconnect with `{ caller, runId, after: 1, limit: 2 }`. That page contains only
events strictly greater than 1. Poll this read every 200 ms while waiting for
new output. `pollAgentOutput` implements that cadence and waits for one
nonempty bounded page, reauthorizing every attempt; interrupt its Effect when
the reader disconnects or no longer needs output. An empty page is not a terminal run state; use the authorized run
status for completion. Recheck after completion to drain the last page.

Advance the cursor only after consuming an event. Persist the cursor together
with the reader's own reconstruction if it must survive a client crash.
Reusing an older cursor intentionally returns already-read events: this is
retry-stable storage and cursor reconstruction, not exactly-once network
delivery or exactly-once client side effects.

| Field / bound | Contract / default                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| caller        | Required current canonical identity; no default or session-UUID bearer substitute                     |
| runId         | Required UUIDv7; bound to accepted tenant/principal/session                                           |
| after         | Required safe integer from -1 through 9007199254740990; exclusive                                     |
| limit         | Required integer 1 through 100; no implicit unbounded read                                            |
| Text.text     | Explicitly emitted string, at most 4096 UTF-16 code units; empty string allowed                       |
| chunkIndex    | Nonnegative safe integer, fixed by the scripted producer before append; no automatic attempt identity |
| eventId       | Internal nonempty string at most 128 characters; `step:N:text:I` or `step:N:complete` for AgentRun    |
| offset        | Allocated safe integer 0 through 9007199254740990, scoped to tenant/run                               |
| polling       | Consumer cadence 200 ms; no timer, subscription or notification infrastructure is provisioned         |

The closed payload union admits `Text` and `StepCompleted` only. A completion
contains its 1-based `stepIndex`, never the step's input or JSON result.
Excess payload fields reject rather than silently persisting them. The log
cannot determine whether deliberately emitted text contains a secret; release
policy is the trusted producer's responsibility. Payloads are confidential
run data, never copied into error diagnostics or telemetry by these modules.

## Understand retries and the crash window

The SQL adapter serializes one allocator row per `(tenant, run)`, checks the
unique logical event identity before incrementing, then inserts the event and
counter in one transaction. Concurrent distinct events receive unique offsets.
Identical retry content returns the original committed event. Changed content
for the same identity fails with `AgentOutputFailure/conflict`; it does not
append a second chunk or replace the first. A failed insert rolls back allocation.

Output commits independently of the compute engine's Activity reply. Both SQL
append and read remove the inherited shared SQL transaction tag, so another
client's transaction cannot accidentally own output durability or visibility.
Do not invoke an independent append while holding a conflicting transaction
on the same SQLite file; it is intended for Activity output and runs after a
tool's business transaction has returned.

If the owner dies after output commit but before Activity reply, an unfinished
Activity can re-enter. Deterministic producer identities deduplicate its
re-emitted prefix. Completed Activities replay their engine result without
calling the producer or appending again. There is no shared engine/log
transaction, no engine fork and no external-model exactly-once claim.
Preexisting completed Activities are not backfilled by this migration.

Every page rechecks current identity, run access, accepted owner/session and
tenant routing before reading SQL. Completed output does not confer authority
after revocation. The persistence port itself is privileged and requires a
trusted `CurrentTenant`; it is not a public append API or a replacement for
run policy. Keep SQL in the integration package.

## Verify recovery locally

Start the approved bounded loopback PostgreSQL fixture from
[the storage guide](storage.md#run-conformance). Never point the harness at
production or shared customer data. Then run:

```sh
pnpm nx run @eventiva/server:cluster-conformance --skip-nx-cache
pnpm nx run @eventiva/storage-tests:test --skip-nx-cache
node --run check
node --run verify
node tools/documentation/planning.mjs --check --require-reviewed
```

The real two-process fixture waits until two chunks are committed and the
model Activity has no completed reply, then SIGKILLs the PID that emitted the
barrier. Without resubmission or restarting the victim, the survivor must
re-enter that Activity and reach the same barrier. Counts must be `[2,0,0]`
while offsets remain `[0,1]`. After release, reconnect from cursor 1 and page
in batches of two; independently assert exactly `[0,1,2,3,4,5,6]`, seven unique
logical events, exact payload order and counts `[2,1,1]`. The marker is
`agent-output-owner-kill-reconnect-passed`. Existing completed-step SIGKILL,
SIGTERM and total community restart controls also reconstruct all seven events.
The final suite marker remains `sql-cluster-conformance-passed`.

Storage tests exercise both dialects, concurrent duplicate/distinct appends,
same physical database tenant isolation, run isolation, changed-content
refusal, nonzero reconnect, page boundaries, rollback independence, corrupt
storage and safe outage errors. Server tests cover current policy/session,
routing refusal, invalid reads and explicit-only payload release.

If a retry conflicts, correct the producer's deterministic output contract;
do not change its event ID to hide the conflict. If reads fail, check mandatory
ports, live authority and migration availability. Do not log rejected payloads
or increase bounds/timeouts to conceal a failure. An empty result after an
exclusive cursor may simply mean no newer committed output exists.

This is bounded synthetic local/process proof. Public SSE/WebSocket/HTTP,
AI SDK UI, production model nondeterminism, retention/deletion, deployment,
distributed owner fencing, EVE-35 conversation orchestration and EVE-54
cancellation completion remain separate. EVE-248 stays deferred until January
2027; no budgets, paid gates or ingestion settings change.
