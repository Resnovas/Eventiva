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
import { randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { SqliteClient } from '@effect/sql-sqlite-node';
import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { declareResource, Resources } from '@eventiva/contracts/resource';
import { CurrentTenant, Storage } from '@eventiva/contracts/storage';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { migrateResources, resourceProvider } from '@eventiva/integrations.sql/resource';
import { Integrity } from '@eventiva/runtime/invocation';
import { resourceRuntime } from '@eventiva/runtime/resource';
import { durable } from '@eventiva/runtime/storage';
import { Cause, ConfigProvider, Context, Deferred, Effect, Exit, FiberSet, Layer, Schema, Scope } from 'effect';

// Trusted local transaction proof only. No producer, external effect, migration
// crash, native/device durability or general exactly-once guarantee is exercised.
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
const services = (sql) =>
    Effect.gen(function* () {
        const provider = yield* resourceProvider(dialect, caller.tenant, identity, [definition]).pipe(
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

if (role === 'worker') {
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
    assert.equal(role, 'proof');
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
        const child = fork(fileURLToPath(import.meta.url), ['worker', dialect, database], {
            execArgv: [],
            stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
        });
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
            await run(Effect.addFinalizer(() => admin`DROP DATABASE ${admin(name)} WITH (FORCE)`.pipe(Effect.orDie)));
            adminUrl.pathname = `/${name}`;
            database = adminUrl.href;
        }
        const sql = Context.get(await run(connect(database)), SqlClient.SqlClient);
        // Migrations run normally and finish BEFORE any crash scenario. The
        // resource migration gate owns its transaction and forbids ambient ones.
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
        assert.equal(Exit.isFailure(await run(Effect.exit(sql`UPDATE resource_revision SET payload = '{}'`))), true);
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
