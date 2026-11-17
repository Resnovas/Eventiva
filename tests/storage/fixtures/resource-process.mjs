/**
 * @file tests/storage/fixtures/resource-process.mjs
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { SqliteClient } from '@effect/sql-sqlite-node';
import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { canonicalDefinition, contributeFields, declareResource, Resources } from '@eventiva/contracts/resource';
import { CurrentTenant, Storage } from '@eventiva/contracts/storage';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { migrateResources, planResourceMigrations, resourceProvider } from '@eventiva/integrations.sql/resource';
import { Integrity } from '@eventiva/runtime/invocation';
import { resourceRuntime } from '@eventiva/runtime/resource';
import { durable } from '@eventiva/runtime/storage';
import { Cause, ConfigProvider, Context, Deferred, Effect, Exit, FiberSet, Layer, Schema, Scope } from 'effect';

// The default proof covers record transactions only. The separate migration-proof
// mode exercises declaration migration process loss, never power/device failure.
const id = (n) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const caller = Schema.decodeUnknownSync(CallerIdentity)({
    subject: id(1),
    session: id(2),
    tenant: id(3),
    kind: 'human',
});
const identity = { key: { module: 'eventiva.sql', instance: 'process' }, version: '1.0.0' };
const policy = { kind: 'additive', restartRequired: false, retainedGenerations: 0 };
const definition = await Effect.runPromise(
    declareResource({
        id: 'fixture.process',
        owner: 'fixture',
        moduleVersion: '1.0.0',
        fields: { name: { type: 'text', optional: false }, seats: { type: 'integer', optional: false } },
    })
);
const record = { id: id(4), revision: 1, schemaVersion: 1, value: { name: 'synthetic-resource', seats: 7 } };
const request = {
    key: 'resource-process-commit',
    inputHash: 'synthetic-input',
    caller,
    action: 'resource.write',
    version: 1,
};
const receipt = {
    id: 'resource-process-receipt',
    caller,
    action: request.action,
    version: request.version,
    inputHash: request.inputHash,
    outcome: 'succeeded',
    startedAt: 1,
    durationMs: 1,
};
const outbox = { id: 'resource-process-command', command: { record: record.id, revision: record.revision } };
const commitKey = JSON.stringify([caller.tenant, caller.subject, null, request.action, request.version, request.key]);
const auth = (effect) =>
    effect.pipe(Effect.provideService(Caller, caller), Effect.provideService(CurrentTenant, { id: caller.tenant }));
const pg = (url) =>
    client.pipe(
        Layer.provide(
            Layer.setConfigProvider(
                ConfigProvider.fromMap(
                    new Map([
                        ['DATABASE_URL', url],
                        ['DATABASE_POOL_SIZE', '2'],
                    ])
                )
            )
        )
    );
const checked = (value, admin = false) => {
    const url = new URL(value);
    assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname));
    assert.ok(admin ? url.pathname === '/eventiva_test' : /^\/resource_process_[a-f0-9]+$/.test(url.pathname));
    return url;
};
const scope = await Effect.runPromise(Scope.make());
const run = (effect) => Effect.runPromise(effect.pipe(Scope.extend(scope)));
const [role, dialect, target] = process.argv.slice(2);
assert.ok(['sqlite', 'postgres'].includes(dialect));
const connect = (database) =>
    Layer.build(dialect === 'sqlite' ? SqliteClient.layer({ filename: database }) : pg(checked(database).href));
const services = (sql, active = definition) =>
    Effect.gen(function* () {
        const provider = yield* resourceProvider(dialect, caller.tenant, identity, [active]).pipe(
            Effect.provideService(SqlClient.SqlClient, sql)
        );
        const context = yield* Layer.build(
            Layer.mergeAll(
                resourceRuntime(provider, (presented, resource, operation) =>
                    Effect.sync(() => {
                        assert.deepEqual(presented, caller);
                        assert.ok([definition.id, '*'].includes(resource));
                        assert.ok(['read', 'write', 'history', 'transaction'].includes(operation));
                    })
                ),
                durable.pipe(
                    Layer.provide(Layer.succeed(Storage, provider.storage)),
                    Layer.provide(Layer.succeed(CurrentTenant, { id: caller.tenant }))
                )
            )
        );
        return { provider, api: Context.get(context, Resources), integrity: Context.get(context, Integrity) };
    });
const snapshot = (sql) =>
    Effect.gen(function* () {
        return {
            records:
                yield* sql`SELECT resource, id, revision, schema_version, payload FROM resource_record ORDER BY resource, id`,
            revisions:
                yield* sql`SELECT resource, id, revision, schema_version, payload FROM resource_revision ORDER BY resource, id, revision`,
            outbox: yield* sql`SELECT id, command FROM command_outbox ORDER BY id`,
            commits: yield* sql`SELECT key, input_hash, result FROM action_commit ORDER BY key`,
            receipts: yield* sql`SELECT id, receipt FROM action_receipt ORDER BY id`,
        };
    });
const empty = { records: [], revisions: [], outbox: [], commits: [], receipts: [] };

/** Assemble complete additive history without changing the original transaction fixture. */
const migrationHistory = () =>
    Effect.gen(function* () {
        const v2 = yield* contributeFields(definition, {
            owner: 'fixture.extra',
            moduleVersion: '1.0.0',
            fields: { campaign: { type: 'text', optional: true } },
        });
        const v3 = yield* contributeFields(v2, {
            owner: 'fixture.notes',
            moduleVersion: '1.0.0',
            fields: { note: { type: 'text', optional: true } },
        });
        return [definition, v2, v3];
    });
/** Retain exact declaration bytes/checksums alongside all record and revision rows. */
const migrationSnapshot = (sql) =>
    Effect.gen(function* () {
        return {
            schema: yield* sql`SELECT resource, version, definition, checksum FROM resource_schema ORDER BY resource, version`,
            state: yield* snapshot(sql),
        };
    });

if (role === 'migration-worker') {
    const sql = Context.get(await run(connect(target)), SqlClient.SqlClient);
    const history = await run(migrationHistory());
    const tasks = await run(FiberSet.make());
    const runFork = await run(FiberSet.runtime(tasks)());
    /** Suspend without finalization until the coordinator kills this process. */
    const barrier = (name, value) =>
        Effect.gen(function* () {
            process.send({ barrier: name, value, pid: process.pid });
            yield* Deferred.await(yield* Deferred.make());
        });
    /** Delegate the real public migration transaction, adding only fixture-local IPC barriers. */
    const execute = (message) =>
        Effect.gen(function* () {
            if (message.command === 'observe') {
                const active = message.current ? history[2] : definition;
                const { api } = yield* services(sql, active);
                return yield* auth(
                    Effect.gen(function* () {
                        return {
                            record: yield* api.get(active, record.id),
                            history: yield* api.history(active, record.id),
                            retained: yield* migrationSnapshot(sql),
                        };
                    })
                );
            }
            // No alternate migration implementation: intercept only the boundary
            // that the real migrator owns, preserving its actual SQL connection.
            const observed = new Proxy(sql, {
                get(target, key) {
                    if (key !== 'withTransaction') return Reflect.get(target, key);
                    return (effect) =>
                        sql.withTransaction(
                            effect.pipe(
                                Effect.tap((result) =>
                                    message.phase === 'before'
                                        ? migrationSnapshot(sql).pipe(
                                              Effect.flatMap((retained) =>
                                                  barrier('before-migration-commit', { result, retained })
                                              )
                                          )
                                        : Effect.void
                                )
                            )
                        );
                },
            });
            const result = yield* migrateResources(dialect, caller.tenant, history, policy).pipe(
                Effect.provideService(SqlClient.SqlClient, observed)
            );
            if (message.phase === 'after') yield* barrier('after-migration-commit', result);
            return result;
        });
    process.on('message', (message) => {
        runFork(
            execute(message).pipe(
                Effect.matchCause({
                    onFailure: (cause) => process.send({ id: message.id, error: Cause.pretty(cause) }),
                    onSuccess: (value) => process.send({ id: message.id, value }),
                })
            )
        );
    });
    process.once('disconnect', () => process.kill(process.pid, 'SIGKILL'));
    process.send({ ready: true, pid: process.pid });
} else if (role === 'worker') {
    const sql = Context.get(await run(connect(target)), SqlClient.SqlClient);
    const { provider, api, integrity } = await run(services(sql));
    const tasks = await run(FiberSet.make());
    const runFork = await run(FiberSet.runtime(tasks)());
    const barrier = (name, value) =>
        Effect.gen(function* () {
            process.send({ barrier: name, value, pid: process.pid });
            // No cancellation/finalizer releases this boundary: the parent SIGKILLs us.
            yield* Deferred.await(yield* Deferred.make());
        });
    const observe = auth(
        Effect.gen(function* () {
            return {
                record: (yield* api.get(definition, record.id)) ?? null,
                history: yield* api.history(definition, record.id),
                state: yield* snapshot(sql),
            };
        })
    );
    const execute = (phase) => {
        let workRuns = 0;
        const work = Effect.gen(function* () {
            workRuns++;
            if (phase === 'replay') return yield* Effect.die('Exact-key replay must not execute resource work');
            const created = yield* api.create(definition, record.id, record.value);
            yield* provider.storage.enqueue(outbox.id, outbox.command);
            return { output: created, receipt };
        });
        return auth(
            api
                .transaction(
                    Effect.gen(function* () {
                        const committed = yield* integrity.commit(request, work);
                        const value = { committed, workRuns };
                        // Integrity and create have returned from their nested calls,
                        // but this OUTER resource transaction still has not committed.
                        if (phase === 'before')
                            yield* barrier('before-outer-commit', { ...value, observed: yield* observe });
                        return value;
                    })
                )
                .pipe(Effect.tap((value) => (phase === 'after' ? barrier('after-outer-commit', value) : Effect.void)))
        );
    };
    process.on('message', (message) => {
        const operation = message.command === 'observe' ? observe : execute(message.phase);
        runFork(
            operation.pipe(
                Effect.matchCause({
                    onFailure: (cause) => process.send({ id: message.id, error: Cause.pretty(cause) }),
                    onSuccess: (value) => process.send({ id: message.id, value }),
                })
            )
        );
    });
    process.once('disconnect', () => process.kill(process.pid, 'SIGKILL'));
    process.send({ ready: true, pid: process.pid });
} else {
    assert.ok(['proof', 'migration-proof'].includes(role));
    const children = new Set();
    const messages = [];
    const listeners = new Set();
    let sequence = 0;
    const waitFor = (child, predicate) =>
        new Promise((resolve, reject) => {
            const finish = (error, value) => {
                clearTimeout(timer);
                listeners.delete(check);
                child.off('exit', exited);
                child.off('error', failed);
                if (error) reject(error);
                else resolve(value);
            };
            const check = () => {
                const found = messages.find((entry) => entry.child === child && predicate(entry.value));
                if (found) finish(undefined, found.value);
            };
            const exited = (code, signal) =>
                finish(new Error(`Resource worker exited at IPC barrier: ${code}/${signal}`));
            const failed = (error) => finish(error);
            const timer = setTimeout(() => finish(new Error('Resource IPC deadline exceeded')), 15000);
            child.once('exit', exited);
            child.once('error', failed);
            listeners.add(check);
            check();
        });
    const launch = async (database) => {
        const child = fork(
            fileURLToPath(import.meta.url),
            [role === 'migration-proof' ? 'migration-worker' : 'worker', dialect, database],
            {
                execArgv: [],
                stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
            }
        );
        children.add(child);
        child.on('message', (value) => {
            messages.push({ child, value });
            for (const check of [...listeners]) check();
        });
        const ready = await waitFor(child, (value) => value.ready);
        assert.equal(ready.pid, child.pid);
        assert.notEqual(child.pid, process.pid);
        return child;
    };
    const requestWorker = (child, command) => {
        const id = ++sequence;
        const response = waitFor(child, (value) => value.id === id).then((reply) => {
            assert.equal(reply.error, undefined, reply.error);
            return reply.value;
        });
        child.send({ id, ...command });
        return { id, response };
    };
    const kill = (child) =>
        new Promise((resolve, reject) => {
            if (child.exitCode !== null || child.signalCode !== null) {
                children.delete(child);
                return reject(new Error('Resource worker exited before the requested SIGKILL'));
            }
            const timer = setTimeout(() => reject(new Error('Resource SIGKILL deadline exceeded')), 10000);
            child.once('exit', (code, signal) => {
                clearTimeout(timer);
                children.delete(child);
                if (code !== null || signal !== 'SIGKILL')
                    return reject(new Error(`Unexpected resource exit: ${code}/${signal}`));
                resolve({ pid: child.pid, code, signal });
            });
            child.kill('SIGKILL');
        });
    const unacknowledged = (child, messageId) =>
        assert.equal(
            messages.some((entry) => entry.child === child && entry.value.id === messageId),
            false
        );
    try {
        const root = fileURLToPath(new URL('../../../.amp/in/orb-backup/', import.meta.url));
        mkdirSync(root, { recursive: true });
        const directory = mkdtempSync(join(root, 'resource-process-'));
        await run(Effect.addFinalizer(() => Effect.sync(() => rmSync(directory, { recursive: true, force: true }))));
        let database = join(directory, 'resource.sqlite');
        if (dialect === 'postgres') {
            const adminUrl = checked(
                process.env.STORAGE_TEST_POSTGRES_URL ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test',
                true
            );
            const admin = Context.get(await run(Layer.build(pg(adminUrl.href))), SqlClient.SqlClient);
            const name = `resource_process_${randomUUID().replaceAll('-', '')}`;
            await run(admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`);
            // FORCE also checks roleless autovacuum workers; signal only sessions owned by this fixture role.
            await run(
                Effect.addFinalizer(() =>
                    admin`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ${name} AND usename = current_user AND pid <> pg_backend_pid()`.pipe(
                        Effect.zipRight(admin`DROP DATABASE ${admin(name)}`),
                        Effect.orDie
                    )
                )
            );
            adminUrl.pathname = `/${name}`;
            database = adminUrl.href;
        }
        const sql = Context.get(await run(connect(database)), SqlClient.SqlClient);
        // Storage infrastructure and v1 finish before either proof. Only the
        // migration-proof mode evolves the resource declaration in crash workers.
        await run(
            load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url))).pipe(
                Effect.flatMap((files) => migrate(dialect, files)),
                Effect.provideService(SqlClient.SqlClient, sql)
            )
        );
        const migrated = await run(
            migrateResources(dialect, caller.tenant, [definition], policy).pipe(
                Effect.provideService(SqlClient.SqlClient, sql)
            )
        );
        assert.equal(migrated.status, 'applied');
        assert.equal(migrated.migrations.length, 1);
        const schema = await run(sql`SELECT * FROM resource_schema`);
        assert.equal(schema.length, 1);
        assert.deepEqual(await run(snapshot(sql)), empty);

        if (role === 'migration-proof') {
            const history = await run(migrationHistory());
            const { api: old } = await run(services(sql));
            const seed = await run(
                auth(
                    Effect.gen(function* () {
                        const first = yield* old.create(definition, record.id, { name: 'north', seats: 17 });
                        const second = yield* old.update(definition, first.id, 1, { seats: -9 });
                        const third = yield* old.update(definition, first.id, 2, { name: 'revised-north' });
                        yield* old.create(definition, id(19), { name: 'south', seats: 43 });
                        return {
                            record: third,
                            history: [first, second, third],
                            retained: yield* migrationSnapshot(sql),
                        };
                    })
                )
            );
            const expected = {
                status: 'applied',
                migrations: history.slice(1).map((entry) => ({
                    id: `${entry.id}.v${entry.version}`,
                    checksum: createHash('sha256').update(canonicalDefinition(entry)).digest('hex'),
                    resource: entry.id,
                    from: entry.version - 1,
                    to: entry.version,
                    dependencies: [`${entry.id}.v${entry.version - 1}`],
                    kind: 'additive',
                    online: true,
                    compatibleFrom: 1,
                    compatibleThrough: entry.version,
                })),
            };
            const before = await launch(database);
            assert.deepEqual(await requestWorker(before, { command: 'observe' }).response, seed);
            const first = requestWorker(before, { command: 'migrate', phase: 'before' });
            const interrupted = first.response.catch((error) => error.message);
            const tentative = (await waitFor(before, (value) => value.barrier === 'before-migration-commit')).value;
            assert.deepEqual(tentative.result, expected);
            assert.deepEqual(tentative.retained.state, seed.retained.state);
            assert.deepEqual(tentative.retained.schema.slice(0, 1), seed.retained.schema);
            assert.deepEqual(
                tentative.retained.schema.slice(1).map((row) => ({ ...row, definition: JSON.parse(row.definition) })),
                [
                    ...history.slice(1).map((entry, index) => ({
                        resource: entry.id,
                        version: entry.version,
                        definition: entry,
                        checksum: expected.migrations[index].checksum,
                    })),
                ]
            );
            // The independent connection cannot see either provisional version.
            assert.deepEqual(await run(migrationSnapshot(sql)), seed.retained);
            unacknowledged(before, first.id);
            const beforeExit = await kill(before);
            assert.match(await interrupted, /null\/SIGKILL/);
            unacknowledged(before, first.id);
            assert.deepEqual(await run(migrationSnapshot(sql)), seed.retained);

            const committed = await launch(database);
            assert.deepEqual(await requestWorker(committed, { command: 'observe' }).response, seed);
            // A real old-provider write proves rollback left v1 usable, not merely readable.
            const usable = await run(auth(old.update(definition, record.id, 3, { seats: 28 })));
            assert.deepEqual(usable, { ...seed.record, revision: 4, value: { name: 'revised-north', seats: 28 } });
            const baseline = await run(migrationSnapshot(sql));
            const second = requestWorker(committed, { command: 'migrate', phase: 'after' });
            const lost = second.response.catch((error) => error.message);
            assert.deepEqual(
                (await waitFor(committed, (value) => value.barrier === 'after-migration-commit')).value,
                expected
            );
            unacknowledged(committed, second.id);
            const retained = await run(migrationSnapshot(sql));
            assert.deepEqual(retained.schema, tentative.retained.schema);
            assert.deepEqual(retained.state, baseline.state);
            const committedExit = await kill(committed);
            assert.match(await lost, /null\/SIGKILL/);
            unacknowledged(committed, second.id);
            assert.deepEqual(await run(migrationSnapshot(sql)), retained);

            const replay = await launch(database);
            assert.deepEqual(await requestWorker(replay, { command: 'observe', current: true }).response, {
                record: usable,
                history: [...seed.history, usable],
                retained,
            });
            for (let repeat = 0; repeat < 2; repeat++) {
                assert.deepEqual(await requestWorker(replay, { command: 'migrate' }).response, {
                    status: 'applied',
                    migrations: [],
                });
                assert.deepEqual(await run(migrationSnapshot(sql)), retained);
            }
            // Keep evolution valid so refusal must come from the applied-prefix
            // check, not preflight rejecting an invalid declaration sequence.
            const changed = history.map((entry) => ({ ...entry, moduleVersion: '9.0.0' }));
            assert.equal((await run(planResourceMigrations(changed, policy))).status, 'ready');
            const refused = await run(
                Effect.either(
                    migrateResources(dialect, caller.tenant, changed, policy).pipe(
                        Effect.provideService(SqlClient.SqlClient, sql)
                    )
                )
            );
            assert.equal(refused._tag, 'Left');
            assert.equal(refused.left.reason, 'unsafe-migration');
            const stale = await run(
                auth(Effect.either(old.update(definition, record.id, 4, { name: 'must-not-write' })))
            );
            assert.equal(stale._tag, 'Left');
            assert.equal(stale.left.reason, 'schema-mismatch');
            assert.deepEqual(await run(migrationSnapshot(sql)), retained);
            const { api: current } = await run(services(sql, history[2]));
            const updated = await run(
                auth(current.update(history[2], record.id, 4, { campaign: 'recovered', note: 'current' }))
            );
            assert.deepEqual(updated, {
                id: record.id,
                revision: 5,
                schemaVersion: 3,
                value: { ...usable.value, campaign: 'recovered', note: 'current' },
            });
            assert.deepEqual(await run(auth(current.history(history[2], record.id))), [
                ...seed.history,
                usable,
                updated,
            ]);
            const final = await run(migrationSnapshot(sql));
            assert.deepEqual(final.schema, retained.schema);
            assert.deepEqual(
                final.state.revisions.filter((row) => Number(row.schema_version) === 1),
                retained.state.revisions
            );
            assert.deepEqual(
                final.state.records.find((row) => row.id === id(19)),
                retained.state.records.find((row) => row.id === id(19))
            );
            const replayExit = await kill(replay);
            const pids = [before.pid, committed.pid, replay.pid];
            assert.equal(new Set([process.pid, ...pids]).size, 4);
            console.log(
                JSON.stringify({
                    event: 'resource-migration-process-recovery-passed',
                    dialect,
                    coordinatorPid: process.pid,
                    pids,
                    exits: [beforeExit, committedExit, replayExit],
                    precommitRollback: true,
                    acknowledgementLost: true,
                    repeatHistoryIdempotent: true,
                    changedPrefixRejected: true,
                    staleWriterRejected: true,
                    currentWriterAccepted: true,
                    preservedRecords: 2,
                    preservedRevisions: 5,
                    scope: 'local declaration migration process-loss proof only',
                    powerLoss: false,
                    distributedFencing: false,
                })
            );
        } else {
            const before = await launch(database);
            const first = requestWorker(before, { command: 'execute', phase: 'before' });
            const interrupted = first.response.catch((error) => error.message);
            const tentative = (await waitFor(before, (value) => value.barrier === 'before-outer-commit')).value;
            assert.equal(tentative.committed.replayed, false);
            assert.equal(tentative.workRuns, 1);
            assert.deepEqual(tentative.observed.record, record);
            assert.deepEqual(tentative.observed.history, [record]);
            for (const rows of Object.values(tentative.observed.state)) assert.equal(rows.length, 1);
            unacknowledged(before, first.id);
            // A second client cannot see the in-flight resource, revision, outbox or evidence.
            assert.deepEqual(await run(snapshot(sql)), empty);
            const beforeExit = await kill(before);
            assert.match(await interrupted, /Resource worker exited at IPC barrier: null\/SIGKILL/);
            unacknowledged(before, first.id);
            assert.deepEqual(await run(snapshot(sql)), empty);
            assert.deepEqual(await run(sql`SELECT * FROM resource_schema`), schema);

            const committed = await launch(database);
            assert.notEqual(committed.pid, before.pid);
            assert.deepEqual(await requestWorker(committed, { command: 'observe' }).response, {
                record: null,
                history: [],
                state: empty,
            });
            const second = requestWorker(committed, { command: 'execute', phase: 'after' });
            const lost = second.response.catch((error) => error.message);
            const accepted = (await waitFor(committed, (value) => value.barrier === 'after-outer-commit')).value;
            assert.deepEqual(accepted, { committed: { output: record, receipt, replayed: false }, workRuns: 1 });
            unacknowledged(committed, second.id);
            const retained = await run(snapshot(sql));
            for (const rows of Object.values(retained)) assert.equal(rows.length, 1);
            assert.equal(retained.records[0].resource, definition.id);
            assert.equal(retained.records[0].id, record.id);
            assert.equal(Number(retained.records[0].revision), 1);
            assert.deepEqual(retained.revisions, retained.records);
            assert.deepEqual(JSON.parse(retained.records[0].payload), record.value);
            assert.deepEqual(
                retained.outbox.map((row) => ({ id: row.id, command: JSON.parse(row.command) })),
                [outbox]
            );
            assert.equal(retained.commits[0].key, commitKey);
            assert.equal(retained.commits[0].input_hash, request.inputHash);
            assert.deepEqual(JSON.parse(retained.commits[0].result), { output: record, receipt });
            assert.equal(retained.receipts[0].id, commitKey);
            assert.deepEqual(JSON.parse(retained.receipts[0].receipt), receipt);
            const committedExit = await kill(committed);
            assert.match(await lost, /Resource worker exited at IPC barrier: null\/SIGKILL/);
            unacknowledged(committed, second.id);
            assert.deepEqual(await run(snapshot(sql)), retained);

            const replay = await launch(database);
            assert.notEqual(replay.pid, before.pid);
            assert.notEqual(replay.pid, committed.pid);
            assert.deepEqual(await requestWorker(replay, { command: 'observe' }).response, {
                record,
                history: [record],
                state: retained,
            });
            const replayed = await requestWorker(replay, { command: 'execute', phase: 'replay' }).response;
            assert.deepEqual(replayed, { committed: { output: record, receipt, replayed: true }, workRuns: 0 });
            assert.deepEqual(await run(snapshot(sql)), retained);
            // Prove the retained revision/receipt/completed commit cannot be edited
            // or deleted, in addition to byte-for-byte equality across exact-key replay.
            for (const table of ['resource_revision', 'action_receipt', 'action_commit']) {
                assert.equal(Exit.isFailure(await run(Effect.exit(sql`DELETE FROM ${sql(table)}`))), true);
            }
            assert.equal(
                Exit.isFailure(await run(Effect.exit(sql`UPDATE resource_revision SET payload = '{}'`))),
                true
            );
            assert.equal(Exit.isFailure(await run(Effect.exit(sql`UPDATE action_receipt SET receipt = '{}'`))), true);
            assert.equal(Exit.isFailure(await run(Effect.exit(sql`UPDATE action_commit SET result = '{}'`))), true);
            assert.deepEqual(await run(snapshot(sql)), retained);
            assert.deepEqual(await run(sql`SELECT * FROM resource_schema`), schema);
            const replayExit = await kill(replay);
            console.log(
                JSON.stringify({
                    event: 'resource-process-recovery-passed',
                    dialect,
                    scope: 'local resource transaction process-loss proof only',
                    coordinatorPid: process.pid,
                    pids: [before.pid, committed.pid, replay.pid],
                    exits: [beforeExit, committedExit, replayExit],
                    beforeOuterCommit: { tentativeSets: 5, rolledBack: true, reopenedEmpty: true },
                    afterOuterCommit: {
                        acknowledgementLost: true,
                        replayed: replayed.committed.replayed,
                        replayWorkRuns: replayed.workRuns,
                    },
                    retained: {
                        records: retained.records.length,
                        revisions: retained.revisions.length,
                        outbox: retained.outbox.length,
                        commits: retained.commits.length,
                        receipts: retained.receipts.length,
                    },
                    immutableEvidence: true,
                    migrationCrashProof: false,
                    externalEffects: false,
                    generalExactlyOnce: false,
                })
            );
        }
    } finally {
        try {
            await Promise.all(
                [...children].filter((child) => child.exitCode === null && child.signalCode === null).map(kill)
            );
        } finally {
            await run(Scope.close(scope, Exit.void));
        }
    }
}
