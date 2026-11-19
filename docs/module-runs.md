# Exact module runs and owner fencing

Module runs retain the exact code and configuration selected when work is accepted. Restarting with a newer default does not upgrade unfinished work. An owner epoch is a monotonically increasing attempt number in the tenant database, not permission to act for a user. This bounded EVE-276 / [#1064](https://github.com/Resnovas/Eventiva/issues/1064) Option A increment uses the existing workflow engine and authorized ActionHost. It does not add a distribution service or activate a production integration.

## Compose a trusted module run

1. Apply the approved forward-only migrations through the existing SQL migrator. Both PostgreSQL and SQLite add `0011.sql`; never change migrations 0001 through 0010. Use disposable local databases for conformance, not production migration commands.
2. Provide the existing backend identity, authorization, approval, policy, digest, flags, tenant routing and output services. Continue binding each host, Integrity and handler to the same routed Storage. Keep independent control-plane SQL outside ambient tenant transactions.
3. Supply the internal `ModuleRunCatalog` service from `apps/server/src/module-run.ts`. Set `incarnation` to a fresh unique process identity. Supply `current` for new acceptance and `artifacts` containing every still-recoverable exact selection. There is no default catalog and no automatic download or fallback. These are trusted composition fields, not request options.
4. Materialize each artifact's modules inside the authenticated route using its `Storage`. Its actual module manifests must match all recorded exact versions. Retain the exact provider configuration behind its immutable, non-secret reference. Never put credentials, executable code, services or mutable aliases such as latest in a snapshot.
5. Register `registerAgentRuns` through the existing backend workflow registration callback. Obtain `agentRuns` only from that backend's internal service context. Do not expose raw internal Cluster requests as public ingress.

`apps/server/tests/module-run-fixture.mjs` is a complete disposable SQL composition. `apps/server/tests/module-run.spec.ts` supplies typechecked catalog examples. Normal scripted runs do not require a catalog.

## Submit an action-only run

Use a fresh UUIDv7 `runId`, the authenticated caller and `definition: "module-v1"`. This complete synthetic request executes two already registered actions; the second consumes the first result:

```json
{
    "caller": {
        "subject": "019b0000-0000-7000-8000-00000000000b",
        "session": "019b0000-0000-7000-8000-000000000015",
        "tenant": "019b0000-0000-7000-8000-000000000001",
        "kind": "human"
    },
    "runId": "019b0000-0000-7000-8000-00000000238c",
    "definition": "module-v1",
    "steps": [
        {
            "_tag": "Action",
            "action": "fixture.pinned",
            "entityKey": "example:1",
            "input": {
                "_tag": "Literal",
                "value": { "id": "019b0000-0000-7000-8000-00000000238d", "value": 13 }
            }
        },
        {
            "_tag": "Action",
            "action": "fixture.pinned",
            "entityKey": "example:2",
            "input": { "_tag": "Previous" }
        }
    ]
}
```

Caller, runId, definition and a nonempty steps array are required. Each Action requires action, entityKey and input. The first input must be Literal. Optional approvalId, deadline, expectedState and expectedVersion default to absent and pass to the ordinary action gate. `runId:stepIndex` is the stable business retry key, with one-based step indices; it does not contain the process or epoch. Identical Start repairs an acceptance-before-submission crash without replacing input. Changed input conflicts. Status and Interrupt still reauthorize the exact accepted caller/session. Model steps in module-v1 fail recovery-required: this increment does not claim pinned model-adapter recovery. Existing scripted-v1 remains available under its existing contract.

## Recorded identity and commit ordering

The snapshot records composition.modules (exact numeric x.y.z versions), composition.bindings (consumer, requirement, provider, instance), providers (module, instance, immutable configuration reference), schema (the complete ordered migration name/checksum list), and origin (incarnation and positive generation). All are required; none is inferred from a restart default. Origin records admission provenance, not a requirement to revive a dead process. The owner row starts at epoch 0 with no owner; a claimed attempt has a positive safe-integer epoch. Expected-epoch compare-and-increment refuses races and overflow. Snapshot UPDATE/DELETE is rejected by database triggers.

The tenant epoch-transfer commit is takeover's linearization point: transactions already holding the run row may complete first. A stale attempt ordered afterward fails before business dedup replay as well as before new domain writes. Domain mutations, history, outbox, business dedup and original success receipt share A1's transaction and roll back together. A current-owner business replay preserves the original commit and creates the ordinary fresh invocation audit, checked in its own fenced transaction. Stale denial never rewrites original successful evidence.

Output checkpoints have independent transactions. They check the current fence before deduplication/allocation and reject a missing token for an existing module run. They do not reuse ambient business SQL context. Cluster sender checks bracket transport dispatch, while the receiver reconstructs the stored tenant/caller/action association and exact artifacts. No tenant database lock is held across a network call. The serialized fence is a trusted internal attempt binding, never bearer authority or a caller-selected executable identity.

Epoch checks do not replace fresh authority, approval or deadline checks. Authorized self-mutating actions do not reapply consumed state/version/capacity admission preconditions after their handler. SQL rollback cannot undo network calls, provider operations or other external effects. Use transactional outbox intents and independently idempotent external adapters. Tenant output commits and the compute workflow journal do not share a distributed transaction; a crash may retry an unfinished Activity without repeating its committed business mutation or output identity.

## Verify on disposable local SQL

Export `STORAGE_TEST_POSTGRES_URL` using the existing secure fixture setup, pointing only to loopback `/eventiva_test`. Reuse the approved pinned image, capacity, expiry and teardown controls from the repository SQL fixture. No additional dependency or service is required.

```sh copy Copy Verification Commands
pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/run-fencing.spec.ts --coverage false
pnpm exec vitest run --config apps/server/vitest.config.mts apps/server/tests/module-run.spec.ts --coverage false
pnpm nx run @eventiva/server:module-run-conformance --skip-nx-cache
node --run verify
```

The first two commands intentionally select focused behavior tests without claiming aggregate coverage. Full verification retains the repository coverage thresholds and existing suites. The uncached module-run-conformance target builds and forks independent Node processes. It kills the actual original runner between completed actions and observes automatic recovery with a newer default: old arithmetic produces 13 -> 40 -> 121. Append-only raw-entry rows distinguish actual executable versions and PIDs from business dedup. It then checks live independent old-owner rejection after explicit transfer and missing/provider/schema mismatch restarts without repinning. Success marker: `module-run-conformance-passed`. Both SQL dialects separately cover stale exact-input replay, new writes, pre-transfer ordering, rollback, current ownership, changed input, tenant controls and independent output.

## Handle refusals

- For recovery-required, restore the exact retained executable, configuration and schema artifacts. Never resolve latest or edit the accepted snapshot. A failed workflow is not automatically reset by restoring a catalog; operator recovery policy remains separate.
- For stale-attempt, stop that attempt. Do not refresh its token and continue. Only orchestration may acquire a new attempt through a committed expected-epoch transfer.
- For input conflict, use the originally accepted input or submit a genuinely new run identity. Do not change a business retry key to conceal an unfinished run.
- For SQLite writer contention, release the earlier transaction and retry takeover as a new acquisition. A failed competing BEGIN is not a committed transfer.
- For a schema change, do not assume backward compatibility. This increment requires exact recorded migration history and fails closed on additions or checksum changes. It supplies no down-migration, multiversion schema host or data reset.

These tests do not certify immediate membership-change fencing, production proof stores, public ingress, partitions, provider exactly-once effects, terminal cancellation, a failover SLA or whole EVE-276/core acceptance. Existing default-off feature policy, budgets and EVE-248's January 2027 boundary remain unchanged.
