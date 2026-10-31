# Cluster sharding probe and decision

## Decision

Eventiva keeps the existing Effect Cluster platform (`@effect/cluster` 0.56.4 with SQL runner and message storage) as the base for server-side sharding and load distribution. Decided by Jonathan on 2026-10-31 after the two-runner probe in Linear EVE-18; parent spec EVE-13.

The gaps the probe found are tracked as tasks:

| Issue  | Gap                                                                                                                          |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| EVE-37 | The `shard-manager` process owns shards but hosts no entities, so messages to its shards fail                                |
| EVE-38 | Runner-loss failover takes 36s; cluster settings, shard count and the Postgres `PORT` fallback need the configuration schema |
| EVE-39 | Entity actions must be persisted and idempotent by default                                                                   |
| EVE-34 | Agent runs restart from scratch when their shard moves                                                                       |
| EVE-35 | A long agent run blocks its entity's other messages                                                                          |
| EVE-36 | Agent output must stream from a durable log, not volatile RPCs                                                               |

## What the probe is

`packages/platforms/postgresql/sharding-probe/` runs two cluster runners and a client against one Postgres, then stops or kills one runner while messages are flowing. It uses the same layers the platform uses: `makeClusterSqlRunnerLayer`, `makeClusterSqlClientLayer` and `postgresClusterSqlLayer` from `@eventiva/core`.

The client records every send in `eve18_sent` and the entity records every handler run in `eve18_received`, so loss, duplication and ordering are counted in SQL rather than read from logs.

The `Probe` entity has three RPCs:

| RPC        | Persisted                     | Purpose                                                                |
| ---------- | ----------------------------- | ---------------------------------------------------------------------- |
| `Deliver`  | yes, primary key `entity:seq` | The normal case for an action                                          |
| `Volatile` | no                            | Matches `DemoEntity.Shoot`; shows what happens to unpersisted messages |
| `Long`     | yes                           | Sleeps for `PROBE_LONG_SECONDS`; stands in for an agent run            |

## Run it

1. Start a Postgres you can wipe. The script drops and recreates its `public` schema.
2. From the repository root, install dependencies with `pnpm install --frozen-lockfile`.
3. Export the connection settings:

    ```sh
    export DB_HOST=127.0.0.1 DB_PORT=5432 DB_USER=postgres DB_PASSWORD=postgres DB_DATABASE=sharding_probe
    ```

4. Run a scenario:

    ```sh
    sh packages/platforms/postgresql/sharding-probe/scenario.sh drain term
    RESTART_AFTER=100 sh packages/platforms/postgresql/sharding-probe/scenario.sh failover kill
    ```

5. Read `tmp/sharding-probe/<name>/analysis.txt`.

The script starts runner A on port 34431 and runner B on port 34432, starts the client, signals runner B 15 seconds later, and restarts B after `RESTART_AFTER` seconds.

### Options

| Variable             | Default              | Meaning                                               |
| -------------------- | -------------------- | ----------------------------------------------------- |
| `SHARDS_PER_GROUP`   | `30`                 | Shards per group; must match on every runner          |
| `RESTART_AFTER`      | `20`                 | Seconds between signalling runner B and restarting it |
| `PROBE_LONG_SECONDS` | `25`                 | Length of each `Long` job; `0` disables them          |
| `PROBE_ENTITIES`     | `40`                 | Number of entities the client sends to                |
| `PROBE_ROUNDS`       | `300`                | Messages per entity per kind                          |
| `PROBE_INTERVAL_MS`  | `200`                | Delay between rounds                                  |
| `PROBE_OUT`          | `tmp/sharding-probe` | Where results are written                             |

## Results on 2026-10-31

These runs used Postgres 16, Node 22.23.4 and 30 shards, with 250 rounds (10,000 persisted and 10,000 volatile messages) per run. A repeat of the last row from the committed script (300 rounds) gave 0 persisted lost, 0 duplicated, order kept, and failover in 26.2s.

| Scenario                                        | Persisted lost                                                                 | Persisted duplicated | Order per entity | Volatile lost | Shard move                                                    | 25s job                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------ | -------------------- | ---------------- | ------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Before any signal                               | 0                                                                              | 0                    | kept             | 0             | -                                                             | ran once                                                                                    |
| SIGTERM B, restart after 20s                    | 0                                                                              | 0                    | kept             | 332           | once in-flight handlers end, at most 15s                      | finished on B when under 15s remained, otherwise interrupted and re-run from the start on A |
| SIGKILL B, restart after 20s                    | 0                                                                              | 12                   | kept             | 1,751         | B reclaimed its own shards; about 22s outage for its entities | re-run from the start                                                                       |
| SIGKILL B, no restart                           | 0                                                                              | 0                    | kept             | 4,238         | 36.2s, the 35s `shardLockExpiration` default                  | re-run from the start on A                                                                  |
| Runner with no entities next to one real runner | 21 of 40 entities fail every message with `Entity type 'Probe' not registered` | -                    | -                | -             | -                                                             | -                                                                                           |

### Guarantees

- Persisted RPCs with a primary key are delivered at least once, with one reply per request and order kept per entity. A runner kill can run a handler twice, so handlers must be idempotent. This is not exactly-once.
- Volatile RPCs are at-most-once and are dropped while their shard moves.
- An entity handles one message at a time. A long handler delays every other message to that entity.
- Runner loss is detected by shard lock expiry, which is 35s by default. Failover measured 26s to 36s, depending on when the dead runner last refreshed its locks (every 10s). A runner that restarts at the same address within that window takes its shards straight back.

## Common problems

| Symptom                                                        | Cause                                                                    | Fix                                                                                                   |
| -------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `connect ECONNREFUSED 127.0.0.1:34431` during schema bootstrap | `pgClientConfigFromEnv` falls back to `PORT`, which is the runner port   | Set `PGPORT` and `PGHOST`; the script does this for you (EVE-38 removes the fallback)                 |
| `Service not found: @effect/sql/SqlClient`                     | `makeClusterSqlRunnerLayer` does not output `SqlClient` despite its type | Also provide `postgresClusterSqlLayer` with `Layer.provideMerge`, as the probe does (fixed by EVE-38) |
| `Entity type '...' not registered`                             | A runner without that entity owns the shard                              | Run only processes that host the entities (EVE-37)                                                    |
