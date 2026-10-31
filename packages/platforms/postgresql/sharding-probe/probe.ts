/**
 * Two-runner sharding probe (EVE-18). Docs: docs/parts/local-dev/cluster-sharding-probe.md.
 *
 * One file, two modes, wired through the same core layers the platform uses
 * (`makeClusterSqlRunnerLayer`, `makeClusterSqlClientLayer`, `postgresClusterSqlLayer`).
 *
 * PROBE_MODE=runner  hosts the Probe entity and records every delivery in eve18_received.
 * PROBE_MODE=client  sends sequenced messages to PROBE_ENTITIES entities and records each send in eve18_sent.
 */
import { NodeRuntime } from '@effect/platform-node';
import { ClusterSchema, Entity } from '@effect/cluster';
import { Rpc } from '@effect/rpc';
import * as SqlClient from '@effect/sql/SqlClient';
import { makeClusterSqlClientLayer, makeClusterSqlRunnerLayer, postgresClusterSqlLayer } from '@eventiva/core';
import { Config, Duration, Effect, Layer, PrimaryKey, Schema } from 'effect';

class Delivery
    extends Schema.Class<Delivery>('Delivery')({
        key: Schema.String,
        seq: Schema.Int,
    })
    implements PrimaryKey.PrimaryKey
{
    [PrimaryKey.symbol]() {
        return `${this.key}:${this.seq}`;
    }
}

class LongJob
    extends Schema.Class<LongJob>('LongJob')({
        key: Schema.String,
        seconds: Schema.Int,
    })
    implements PrimaryKey.PrimaryKey
{
    [PrimaryKey.symbol]() {
        return `${this.key}:long`;
    }
}

const Probe = Entity.make('Probe', [
    Rpc.make('Deliver', { payload: Delivery, success: Schema.String }),
    Rpc.make('Volatile', { payload: Delivery, success: Schema.String }).annotate(ClusterSchema.Persisted, false),
    Rpc.make('Long', { payload: LongJob, success: Schema.String }),
]).annotateRpcs(ClusterSchema.Persisted, true);

const ensureTables = Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    yield* sql`create table if not exists eve18_received (entity text, seq int, kind text, runner text, shard text, at timestamptz default clock_timestamp())`;
    yield* sql`create table if not exists eve18_sent (entity text, seq int, kind text, outcome text, at timestamptz default clock_timestamp())`;
});

const runnerName = Config.string('PORT').pipe(Config.map((p) => `runner-${p}`));

const ProbeLive = Probe.toLayer(
    Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        const runner = yield* Effect.orDie(runnerName);
        const address = yield* Entity.CurrentAddress;
        const record = (seq: number, kind: string) =>
            sql`insert into eve18_received (entity, seq, kind, runner, shard) values (${address.entityId}, ${seq}, ${kind}, ${runner}, ${String(address.shardId)})`;
        yield* Effect.logInfo('entity activated', { entity: address.entityId, shard: String(address.shardId), runner });
        yield* Effect.addFinalizer(() => Effect.logInfo('entity passivated', { entity: address.entityId, runner }));
        return {
            Deliver: (envelope) => record(envelope.payload.seq, 'persisted').pipe(Effect.as(runner), Effect.orDie),
            Volatile: (envelope) => record(envelope.payload.seq, 'volatile').pipe(Effect.as(runner), Effect.orDie),
            Long: (envelope) =>
                Effect.gen(function* () {
                    yield* record(0, 'long-start');
                    yield* Effect.sleep(Duration.seconds(envelope.payload.seconds));
                    yield* record(1, 'long-done');
                    return runner;
                }).pipe(
                    Effect.onInterrupt(() => record(-1, 'long-interrupted').pipe(Effect.ignore)),
                    Effect.orDie
                ),
        };
    })
);

const runnerMain = Layer.launch(
    ProbeLive.pipe(
        Layer.provideMerge(Layer.effectDiscard(ensureTables)),
        Layer.provideMerge(makeClusterSqlRunnerLayer(postgresClusterSqlLayer)),
        // makeClusterSqlRunnerLayer claims to output SqlClient but uses Layer.provide, so it does not.
        Layer.provideMerge(postgresClusterSqlLayer)
    )
);

const clientProgram = Effect.gen(function* () {
    yield* ensureTables;
    const sql = yield* SqlClient.SqlClient;
    const entities = yield* Config.integer('PROBE_ENTITIES').pipe(Config.withDefault(40));
    const rounds = yield* Config.integer('PROBE_ROUNDS').pipe(Config.withDefault(300));
    const intervalMs = yield* Config.integer('PROBE_INTERVAL_MS').pipe(Config.withDefault(200));
    const longSeconds = yield* Config.integer('PROBE_LONG_SECONDS').pipe(Config.withDefault(0));
    const makeClient = yield* Probe.client;
    const ids = Array.from({ length: entities }, (_, i) => `e-${String(i).padStart(3, '0')}`);

    const note = (entity: string, seq: number, kind: string, outcome: string) =>
        sql`insert into eve18_sent (entity, seq, kind, outcome) values (${entity}, ${seq}, ${kind}, ${outcome})`.pipe(
            Effect.orDie
        );

    if (longSeconds > 0) {
        yield* Effect.forEach(
            ids.slice(0, 4),
            (id) =>
                makeClient(id)
                    .Long(new LongJob({ key: id, seconds: longSeconds }))
                    .pipe(
                        Effect.flatMap((r) => note(id, 0, 'long', `ok:${r}`)),
                        Effect.catchAllCause((c) => note(id, 0, 'long', `fail:${String(c).slice(0, 120)}`)),
                        Effect.forkDaemon
                    ),
            { discard: true }
        );
    }

    for (let seq = 1; seq <= rounds; seq++) {
        yield* Effect.forEach(
            ids,
            (id) => {
                const c = makeClient(id);
                const d = new Delivery({ key: id, seq });
                const persisted = c.Deliver(d).pipe(
                    Effect.timeout(Duration.seconds(90)),
                    Effect.flatMap((r) => note(id, seq, 'persisted', `ok:${r}`)),
                    Effect.catchAllCause((cause) => note(id, seq, 'persisted', `fail:${String(cause).slice(0, 120)}`))
                );
                const volatile = c.Volatile(d).pipe(
                    Effect.timeout(Duration.seconds(10)),
                    Effect.flatMap((r) => note(id, seq, 'volatile', `ok:${r}`)),
                    Effect.catchAllCause((cause) => note(id, seq, 'volatile', `fail:${String(cause).slice(0, 120)}`))
                );
                return Effect.all([persisted, volatile], { concurrency: 2, discard: true }).pipe(Effect.forkDaemon);
            },
            { discard: true }
        );
        if (seq % 25 === 0) yield* Effect.logInfo('client progress', { seq });
        yield* Effect.sleep(Duration.millis(intervalMs));
    }
    yield* Effect.logInfo('client finished sending; waiting for outstanding replies');
    yield* Effect.sleep(Duration.seconds(95));
}).pipe(
    Effect.provide(makeClusterSqlClientLayer(postgresClusterSqlLayer).pipe(Layer.provideMerge(postgresClusterSqlLayer)))
);

const main = Effect.gen(function* () {
    const mode = yield* Config.literal('runner', 'client')('PROBE_MODE');
    if (mode === 'runner') {
        yield* runnerMain;
    } else {
        yield* clientProgram;
    }
});

NodeRuntime.runMain(main as Effect.Effect<void, unknown, never>);
