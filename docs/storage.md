# SQL storage increment (EVE-42)

This increment supplies provider-neutral storage contracts and PostgreSQL/Node SQLite implementations. It does not complete EVE-42's deferred Drizzle or device-sync scope and does not activate storage in the server. The server remains fail-closed until a separate durable-wiring integration.

## Boundaries

- S1: authenticate first, then call `TenantRouter.run`. The injected resolver selects one tenant database; it cannot accept a client-supplied URL. The authorization callback must check and audit current control-plane access on every scope. Pools must be keyed by project/database/role, bounded and disposed when evicted. No routine cross-tenant operational queries or tenant IDs in tenant primary keys.
- S2: stock changes append quantity evidence. Pending reservations expire, release exactly once, and never confirm after expiry. State changes compare expected state and version under a lock, then append history. Payment reconciliation records exact minor-unit strings once per provider event; sending payments remains online-only and outside SQL transactions.
- S3: `@eventiva/schema/storage` distinguishes typed raw canonical columns from JSON projections; `GuardedCommand` requires expected state/version, idempotency key, client mutation UUIDv7 and deadline. Pending is not confirmed. A rejected server command is a visible typed conflict, not an offline allocation. Device tables, PowerSync and device migrations are deferred; Node SQLite is not device SQLite.
- S4: apply numbered forward SQL migrations per dialect. Verify exact bytes against the protected applied ledger before running; never use schema push or down migrations. Expand first, backfill separately, retain the old-client compatibility window, then approve a later annotated contraction only after restore testing.

Portable subpaths are `@eventiva/contracts/storage`, `@eventiva/contracts/machine`, and `@eventiva/schema/storage`. Driver subpaths live under `@eventiva/integrations.sql/{postgres,sqlite,storage,router,migrations,values}`. `@eventiva/runtime/storage` connects the portable Storage service to EVE-40's Integrity and Audit, without importing a driver.

## Use a tenant-scoped client

Install the pinned workspace dependencies with `pnpm install --frozen-lockfile`. Do not authorize any additional native build script. The approved SQLite package bundles a prebuild; stop on platforms where it cannot execute without an allowance.

Build a PostgreSQL client from a securely injected `DATABASE_URL`, or use `memory()` from the SQLite subpath for Node conformance. Provide that client to `storage('postgres')` or `storage('sqlite')`. Build `durable` inside the authenticated tenant scope, using the same Storage service that the action handler uses. See the compiling example in `ai-docs/src/13_storage/01_transaction.ts`.

PostgreSQL configuration:

| Setting              | Default            | Treatment                                                                                      |
| -------------------- | ------------------ | ---------------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | Required           | Redacted secret; use verified TLS for remote endpoints. Never log it.                          |
| `DATABASE_POOL_SIZE` | 4                  | Bound per-client maximum; the trusted pool owner must also bound the number of tenant clients. |
| Minimum connections  | 0                  | Do not retain warm connections unnecessarily.                                                  |
| Connect timeout      | 15 seconds         | Acquisition fails rather than waiting indefinitely.                                            |
| Idle timeout         | 10 seconds         | Release idle application connections. This is not proof of provider autosuspend.               |
| Application name     | `eventiva-storage` | Non-secret connection label.                                                                   |

The PostgreSQL adapter accepts the connection URL's TLS policy. For Neon use `sslmode=verify-full`; do not use `no-verify`, `rejectUnauthorized=false`, or assume `sslmode=require` verifies the hostname. Use separate direct migration and pooled runtime routes and credentials. See [Neon compatibility](neon-storage.md).

## Atomic actions and exact values

Use `Integrity.commit` through the runtime for mutations. It scopes keys by tenant, principal/delegation, action and version, serializes duplicates, rejects changed input hashes, and stores the successful receipt in the same transaction as domain state, history, outbox and deduplication. Nested Storage operations use the same Effect SQL connection. Failure, defect or interruption rolls everything back. Runtime live authorization and deadline checks still run after lock waits and before returning a replay. Never call a provider inside this transaction: enqueue an outbox command instead.

The durable Audit adapter does not implement a spool: even when spooling is permitted, it either persists to SQL or fails closed. `ready` checks availability before protected execution; a later write failure still fails the commit atomically. Runtime handlers must not capture a different tenant Storage/client or launch detached fibers.

### Persistence seam v1

The v1 consumer contract is the existing `Storage`, `CurrentTenant` and `TenantRouter` services from `@eventiva/contracts/storage`, together with the machine contracts from `@eventiva/contracts/machine`. There is no separate runner/workflow persistence service. `Storage.commit({ key, inputHash }, execute)` accepts an Effect returning `{ output: JsonValue, receipt: JsonValue }` and returns those values plus `replayed: boolean`. A repeated key with the same hash returns the stored result; a different hash fails with `Conflict`. The runtime `durable` layer adds caller/action/version key scoping and Receipt validation, so action hosts use `Integrity.commit` rather than inventing their own key scheme.

Use `compareAndSet(command, next, payload, machine, leaseUntil?)` for operational version/state transitions and leases. Its `GuardedCommand` carries the expected version/state and deadline; the implementation rechecks the existing lease after acquiring the row lock and appends transition history atomically. `enqueue(id, command)` stages outbox intent inside the same transaction. These methods do not claim a transport message, dispatch a provider request, or implement cluster shard ownership. Those lifecycles belong to their consumers.

The existing `client` layer from `@eventiva/integrations.sql/postgres` supplies both upstream `SqlClient.SqlClient` from `@effect/sql` and `PgClient.PgClient`. Retain one layer instance per authorized database/role and share it with `storage('postgres')` and any trusted upstream SQL services; no new client export or portable SQL escape hatch is needed. The tenant router injects the resolved Storage and CurrentTenant, not a raw SQL client. Keep cluster transport databases and tenant operational databases explicitly routed; sharing a layer is appropriate only when they intentionally target the same database and role.

Inside `TenantRouter.run`, build `durable` from `@eventiva/runtime/storage` against that scope's Storage and CurrentTenant. Provide its Integrity/Audit services to ActionHost while retaining the same Storage in handler context. `Storage.commit` runs the execute effect under the captured client's `withTransaction`; nested calls on that Storage join the current fiber's transaction. There is no second transaction-bound Storage to obtain. Do not replace Storage/client inside the callback or detach handler work. Independent transport transactions are not automatically part of the business action transaction.

Storage uses row/transaction locks at runtime and `pg_advisory_xact_lock` for migrations. It requires neither session advisory locks nor `LISTEN`. A transaction pool retains one backend for each transaction but may switch backends between transactions; do not depend on session locks, session settings, temporary tables or notifications persisting across transactions. An upstream runner's lease-row ownership option does not establish that all its other SQL operations are pool-compatible: verify its polling, connection and transaction behavior independently. Use the separate direct migration route and least-privilege runtime route described below. Installed cluster packages alone do not establish sharding or recovery.

Quantities and versions are safe integers, not unrestricted int64 JavaScript numbers. Money and arbitrary exact decimals are strings, preserving scale. PostgreSQL `bigint` outside the safe integer range stays a string in raw driver results; do not coerce it. JSON numbers are finite, but use strings where exact integer precision is required. Instants are integer epoch milliseconds from year 1 through 9999: PostgreSQL stores `timestamptz`, SQLite stores integer milliseconds. Microsecond fidelity is not promised. UUIDv7 is generated in the application; PG17 needs no extension or PG18-only function. Storage JSON payloads here are platform envelopes/projections, not a replacement for typed raw domain/device columns.

## Migrations and protection

`load(directory)` reads exact SQL bytes and SHA-256 checksums. `migrate(dialect, entries)` locks the migration transaction, validates the applied prefix, executes new files in order, then inserts their checksums. PostgreSQL uses a transaction advisory lock; SQLite uses the driver's immediate transaction. SQLite SQL uses explicit `-- statement-breakpoint` lines, preserving semicolons inside triggers.

Run `node --run check`. Its dependency-free policy wrapper derives applied hashes from Git HEAD locally, and CI's trusted base commit, then invokes the existing `tools/storage/guard.mjs`. Changing both candidate SQL and a candidate checksum file does not bypass the baseline. Deployment must additionally supply the protected database ledger to `guard.mjs --applied`; a Git baseline is not a replacement for deployed-state verification. Export one JSON object with `postgres/<name>.sql` or `sqlite/<name>.sql` keys and exact SHA-256 values, not a candidate-edited file.

Keep the migration role separate from the runtime role. The runtime must not own tables, inherit owner/superuser privileges, disable triggers, truncate/drop tables, or modify `storage_migration`. Grant only the SELECT/INSERT/UPDATE privileges required by Storage, with INSERT-only evidence tables and limited `action_commit.result` updates. Append-only triggers reject evidence updates/deletes and completed dedup changes; they cannot defend against the owner, TRUNCATE, or a role with DDL rights. SQLite's file owner is the trust boundary; never expose its raw client to untrusted consumers. Do not share privileged migration credentials with actions.

Restore into a new isolated database, verify data, checksums and old-client reads, then switch the authorized route under a reviewed recovery plan. Do not reset a tenant database in place. Branch restore can discard replication slots on Neon; SQL recovery does not establish CDC recovery. The local recovery rehearsal uses the pinned PG17 `pg_dump`/`pg_restore`; remote restore operations require separate approval.

## Run conformance

The owner accepted the exact Bookworm image below on 2026-11-15 only for isolated disposable synthetic local/CI tests. The exception expires at 2026-11-22 UTC or earlier on a relevant exploit, changed input, available fix or rebuild. The recorded amd64 Trivy scan remains **4 critical, 140 high, 231 medium, 190 low and 11 unknown** findings, not a passing security scan. No CVE is suppressed; production use, Trixie adoption and a broader waiver are not authorized. Stop use at expiry or an earlier trigger and obtain a new reviewed decision.

Use only reviewed synthetic fixtures in a disposable job/container: no real data, cloud credentials, XML parsing, extension loading or arbitrary external SQL. Publish only loopback, use a dedicated bridge network, generate per-run test credentials, bound CPU/memory/process/time, and tear down the container and data. Limit container egress where the runner supports it. Never use host networking, privileged mode, the Docker socket inside the container or unrelated host mounts. CI enforces the date and permits this fixture only for main pushes or the reviewed merge queue; PR/dispatch runs fail closed rather than skipping conformance. A later image decision must restore any additional event coverage.

With a working Docker daemon, run the following in one Bash shell before the expiry. This creates a non-superuser fixture login with CREATEDB solely to create and remove isolated test databases. That harness privilege and ownership of its synthetic objects are not the runtime least-privilege policy. The bootstrap superuser is not passed to the application suite.

```sh
test "$(date -u +%F)" \< 2026-11-22 || exit 1
POSTGRES_PASSWORD=$(openssl rand -hex 32)
STORAGE_FIXTURE_PASSWORD=$(openssl rand -hex 32)
export POSTGRES_PASSWORD STORAGE_FIXTURE_PASSWORD
docker network create eventiva-storage-test
docker run --detach --rm --name eventiva-storage-test \
    --network eventiva-storage-test --publish 127.0.0.1:5432:5432 \
    --cpus 2 --memory 1g --pids-limit 256 --security-opt no-new-privileges \
    --tmpfs /var/lib/postgresql/data:rw,size=256m \
    --env POSTGRES_DB=eventiva_test --env POSTGRES_PASSWORD \
    --env 'POSTGRES_INITDB_ARGS=--auth-local=scram-sha-256 --auth-host=scram-sha-256' \
    docker.io/library/postgres:17.12-bookworm@sha256:40865bc877a289da75963d97d72b59633f639fc5af7a4e856bfa3714cae5b536
export PGPASSWORD="$POSTGRES_PASSWORD"
for _ in {1..30}; do
    if docker exec --env PGPASSWORD eventiva-storage-test \
        psql -h 127.0.0.1 -U postgres -d eventiva_test -c 'SELECT 1' >/dev/null 2>&1; then break; fi
    sleep 1
done
docker exec -i --env PGPASSWORD --env STORAGE_FIXTURE_PASSWORD eventiva-storage-test \
    psql -h 127.0.0.1 -U postgres -d eventiva_test -v ON_ERROR_STOP=1 <<'SQL'
\getenv fixture_password STORAGE_FIXTURE_PASSWORD
CREATE ROLE eventiva_fixture LOGIN CREATEDB NOSUPERUSER NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD :'fixture_password';
ALTER DATABASE eventiva_test OWNER TO eventiva_fixture;
SQL
export STORAGE_TEST_POSTGRES_URL="postgres://eventiva_fixture:$STORAGE_FIXTURE_PASSWORD@127.0.0.1:5432/eventiva_test"
unset PGPASSWORD POSTGRES_PASSWORD STORAGE_FIXTURE_PASSWORD
```

Initialization must complete and the authenticated bootstrap query must pass; do not substitute a socket-only readiness check or enable trust authentication. Repository setup/resume does not install Docker or provision the fixture. In an Amp orb, supervise the Docker daemon through Amp's service mechanism. Run the suite within a 20-minute limit, then always remove the fixture, including on failure:

```sh
pnpm nx run @eventiva/storage-tests:test --skip-nx-cache
pnpm nx run @eventiva/storage-tests:typecheck
timeout 20m node --run verify
# Also run this teardown if a check above fails.
docker stop eventiva-storage-test
docker network rm eventiva-storage-test
unset STORAGE_TEST_POSTGRES_URL
```

The same suite runs against that PostgreSQL database and fresh in-memory Node SQLite. It creates unique PostgreSQL fixture databases and removes them after scoped clients close. It deliberately rejects remote URLs and any admin database other than `eventiva_test`. Always set `STORAGE_TEST_POSTGRES_URL` to the generated disposable loopback fixture URL. The legacy passwordless default (`postgres://postgres@127.0.0.1:5432/eventiva_test`) is not an instruction to enable trust. Never point this destructive harness at Neon or real data. Provider tests require a separate approved synthetic target and secret path.

The package suite feeds Nx verify and CI verify; the required `application check` continues to aggregate verify and smoke. Root `check` never loads drivers or connects to a database. No provider infrastructure, telemetry ingestion, Nx Cloud, EAS or paid service is enabled.

Common failures: a refused migration checksum means stop and investigate deployed history; do not edit its ledger. A stale/illegal/expired command is a user-visible conflict, not grounds for an unconditional write. Audit failure is fail-closed, not permission to drop evidence. A missing native prebuild is a platform blocker, not permission to relax pnpm policy. A missing local database fails conformance rather than skipping PostgreSQL.
