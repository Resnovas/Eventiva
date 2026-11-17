# Resource transaction process recovery

Use `tests/storage/fixtures/resource-process.mjs` for the distinct-process resource transaction evidence supporting EVE-258/EVE-261 gate C. It exercises emitted public `resourceProvider`, `resourceRuntime`, `Resources` and durable `Integrity` services against file-backed SQLite or an approved disposable loopback PostgreSQL database. It adds no application activation or behavior change.

An IPC barrier is a message followed by an indefinitely suspended Effect. The coordinator waits for that message, inspects database state and sends SIGKILL. A worker cannot acknowledge the operation or run transaction cleanup before it is killed. The coordinator checks the operating system's exit event for `code: null` and `signal: 'SIGKILL'`, and records distinct worker PIDs.

## Run the proof

1. Complete the repository's [machine setup](../AGENT-SETUP.md). Use the pinned dependencies already approved for this workspace.
2. Build the real public package exports. The Node subprocess deliberately does not inherit Vitest's source resolution condition or use aliases:

    ```sh
    pnpm nx run-many -t build --projects=@eventiva/contracts,@eventiva/runtime,@eventiva/integrations.sql --parallel=1
    ```

3. Run the SQLite proof and its summary assertions:

    ```sh
    node tests/storage/fixtures/resource-process.mjs proof sqlite
    pnpm exec vitest run --config tests/storage/vitest.config.mts tests/storage/src/resource-process.spec.ts --testNamePattern '^sqlite resource process recovery' --coverage.enabled=false
    ```

4. For PostgreSQL, first obtain approval for the existing disposable local fixture procedure in [Storage conformance](storage.md#run-conformance). Supply `STORAGE_TEST_POSTGRES_URL` through that approved fixture, never in committed files or command output. Then run:

    ```sh
    node tests/storage/fixtures/resource-process.mjs proof postgres
    pnpm exec vitest run --config tests/storage/vitest.config.mts tests/storage/src/resource-process.spec.ts --coverage.enabled=false
    ```

The second Vitest command runs both dialects. Focused commands disable aggregate coverage because one process fixture does not cover the entire SQL integration; the normal full verification retains its configured coverage thresholds. A filtered SQLite pass is not PostgreSQL evidence. The fixture does not start services or retrieve credentials.

## Observe the boundaries

Before launching workers, the coordinator applies the existing numbered Storage migrations and calls `migrateResources` normally to completion. It retains the applied resource schema for comparison throughout the proof. Resource migration admission owns its transaction and rejects ambient transactions. **This is not migration-crash evidence.**

Each worker opens a new connection, constructs `resourceProvider` on that exact client and builds `resourceRuntime` with a synthetic policy checking the fixture caller and operation. It supplies the provider's exact `storage` to `durable` and the matching `Caller`/`CurrentTenant` to resource operations. No independently constructed Storage or raw SQL transaction opens the outer boundary.

The action uses `Resources.transaction` as the outer boundary. Inside it, `Integrity.commit` calls `Resources.create` and `provider.storage.enqueue`. The local outbox entry is synthetic command metadata, not a lifecycle producer or an external delivery.

The coordinator proves these scenarios in order:

1. **Before the outer commit:** a worker finishes its nested resource and Integrity calls, then pauses inside the still-open resource transaction. Its own public reads and SQL observations see one record, revision, outbox entry, completed idempotency row and receipt. The coordinator's separate client sees none. After SIGKILL, all five sets remain empty. A replacement process reopens through the public resource services and sees no record or history. The already-applied schema remains unchanged.
2. **After the outer commit, before acknowledgement:** the replacement runs the same request, commits successfully and pauses outside `Resources.transaction`. The coordinator reads exactly one row in each of the five sets and checks the full record, outbox command, receipt and stored result. It verifies no request acknowledgement was sent, kills the worker and checks the rows remain unchanged.
3. **Exact-key replay after reopen:** a third process reopens the same database, reads the retained record/history and submits the same Integrity request. It receives the exact stored output and receipt with `replayed: true`. The execute effect would die if invoked, and its execution count is zero. Every persisted row remains byte-for-byte unchanged. Attempts to update or delete the revision, receipt and completed commit fail; the retained rows and schema remain unchanged afterward.

All three worker PIDs differ from each other and from the coordinator. The summary includes their actual SIGKILL exits, rollback/replay results, one retained row in each set and explicit scope limits. Disposable databases/files are removed only by coordinator cleanup after the assertions; worker finalizers do not implement crash rollback.

## Inputs, defaults and failures

The command requires `proof` and one dialect, `sqlite` or `postgres`; neither has a default. The SQLite fixture creates a fresh disk file under `.amp/in/orb-backup/` and removes its temporary directory on coordinator exit. PostgreSQL uses `STORAGE_TEST_POSTGRES_URL`, defaulting to `postgres://postgres@127.0.0.1:5432/eventiva_test`, only as the disposable administration target. It refuses non-loopback hosts and any other administration database, creates a random `resource_process_<hex>` database and drops that database during coordinator cleanup. The PostgreSQL connection pool size is 2. Resource declaration, caller, request, receipt and outbox values are fixed synthetic inputs; there are no runtime flags or new dependencies.

An IPC wait fails after 15 seconds; waiting for SIGKILL exit fails after 10 seconds. The spec bounds the coordinator subprocess to 60 seconds and the test to 65 seconds. Missing emitted exports require rebuilding the packages, not adding aliases. Authentication or connection errors require restoring the approved disposable fixture, not changing host guards or skipping the PostgreSQL case. An unexpected worker exit, an acknowledgement before the crash barrier, a missing provisional row or any changed retained row fails the proof. After an abruptly terminated coordinator, inspect only its disposable `resource_process_<hex>` database or scratch directory under the approved fixture cleanup procedure; do not remove arbitrary databases.

## Evidence limits

This proves local resource transaction rollback and durable exact-key replay across actual process loss/reopen for the tested database. It does not prove migration interruption safety, power-loss recovery, storage-device persistence settings, replica failover, concurrent action races, native/device storage, producer semantics, remote delivery or general exactly-once execution. The outbox is not dispatched. Synthetic policy is not a production authorization implementation. Trigger-enforced immutability is not cryptographic evidence and does not resist a database owner disabling those protections.
