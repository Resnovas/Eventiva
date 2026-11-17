/**
 * @file tests/storage/fixtures/trust-process.mjs
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
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { SqlClient } from '@effect/sql';
import { SqliteClient } from '@effect/sql-sqlite-node';
import { TrustReplay, TrustRequest } from '@eventiva/contracts/trust';
import { trustReplay } from '@eventiva/integrations.sql/trust';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { ConfigProvider, Context, Deferred, Effect, Layer, Schema, Scope } from 'effect';

const [role, dialect, target, phase] = process.argv.slice(2);
assert.ok(['sqlite', 'postgres'].includes(dialect));
const id = (n) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const request = Schema.decodeUnknownSync(TrustRequest)({
    scope: {
        tenant: id(1),
        subject: id(2),
        audience: 'fixture.broker',
        resource: 'fixture.record',
        resourceId: id(3),
        purpose: 'fixture.metadata',
        profile: 'baseline',
        operation: 'metadata',
    },
    nonce: id(4),
    keys: {
        root: id(5),
        signingAuthority: id(6),
        encryptionAuthority: id(7),
        kek: id(8),
        kekVersion: 1,
        dek: id(9),
        dekVersion: 1,
    },
});
const policy = {
    now: 1000,
    freshAfter: { identity: 900, resource: 900, workload: 900, broker: 900 },
    minimumAssurance: 'A1',
};
const pg = (url) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
const checked = (value, admin = false) => {
    const url = new URL(value);
    assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname));
    assert.ok(admin ? url.pathname === '/eventiva_test' : /^\/trust_process_[a-f0-9]+$/.test(url.pathname));
    return url;
};
const connect = (database) =>
    Layer.build(dialect === 'sqlite' ? SqliteClient.layer({ filename: database }) : pg(checked(database).href));
const scope = await Effect.runPromise(Scope.make());
const run = (effect) => Effect.runPromise(effect.pipe(Scope.extend(scope)));
const replay = (sql) =>
    run(Layer.build(trustReplay.pipe(Layer.provide(Layer.succeed(SqlClient.SqlClient, sql))))).then((context) =>
        Context.get(context, TrustReplay)
    );

if (role === 'worker') {
    const sql = Context.get(await run(connect(target)), SqlClient.SqlClient);
    const barrier = (boundary, value) =>
        Effect.gen(function* () {
            process.send({ boundary, value });
            yield* Deferred.await(yield* Deferred.make());
        });
    // Intercept only the transaction boundary in this fixture, not nonce semantics.
    const port = await replay(
        phase === 'before'
            ? new Proxy(sql, {
                  get: (target, property, receiver) =>
                      property === 'withTransaction'
                          ? (effect) =>
                                sql.withTransaction(effect.pipe(Effect.tap((audit) => barrier('before', audit))))
                          : Reflect.get(target, property, receiver),
              })
            : sql
    );
    process.once('disconnect', () => process.kill(process.pid, 'SIGKILL'));
    const result = await run(
        port.consume(request, policy).pipe(
            Effect.tap((audit) => (phase === 'after' ? barrier('after', audit) : Effect.void)),
            Effect.match({ onSuccess: (audit) => ({ audit }), onFailure: (error) => ({ reason: error.reason }) })
        )
    );
    process.send({ boundary: 'result', value: result }, () => process.disconnect());
    await Effect.runPromise(Scope.close(scope, { _tag: 'Success', value: undefined }));
} else {
    assert.equal(role, 'proof');
    const children = new Set();
    const launch = (database, boundary) => {
        const child = fork(fileURLToPath(import.meta.url), ['worker', dialect, database, boundary], {
            execArgv: [],
            stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
        });
        children.add(child);
        const message = new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Trust proof IPC deadline exceeded')), 15000);
            child.once('message', (value) => {
                clearTimeout(timer);
                resolve(value);
            });
            child.once('error', (error) => {
                clearTimeout(timer);
                reject(error);
            });
            child.once('exit', (code, signal) => {
                clearTimeout(timer);
                reject(new Error(`Trust worker exited ${code}/${signal}`));
            });
        });
        return { child, message };
    };
    const kill = async (child) => {
        if (child.exitCode !== null || child.signalCode !== null) return;
        const exited = once(child, 'exit');
        child.kill('SIGKILL');
        const [, signal] = await exited;
        assert.equal(signal, 'SIGKILL');
        children.delete(child);
    };
    let directory;
    try {
        directory = mkdtempSync(join(tmpdir(), 'eventiva-trust-process-'));
        let database = join(directory, 'trust.sqlite');
        if (dialect === 'postgres') {
            const url = checked(
                process.env.STORAGE_TEST_POSTGRES_URL ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test',
                true
            );
            const admin = Context.get(await run(Layer.build(pg(url.href))), SqlClient.SqlClient);
            const name = `trust_process_${randomUUID().replaceAll('-', '')}`;
            await run(admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`);
            await run(Effect.addFinalizer(() => admin`DROP DATABASE ${admin(name)} WITH (FORCE)`.pipe(Effect.orDie)));
            url.pathname = `/${name}`;
            database = url.href;
        }
        const sql = Context.get(await run(connect(database)), SqlClient.SqlClient);
        await run(
            load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url))).pipe(
                Effect.flatMap((files) => migrate(dialect, files)),
                Effect.provideService(SqlClient.SqlClient, sql)
            )
        );
        const first = launch(database, 'before');
        assert.equal((await first.message).boundary, 'before');
        await kill(first.child);
        assert.equal((await run(sql`SELECT nonce FROM trust_replay`)).length, 0);
        const committed = launch(database, 'after');
        const receipt = await committed.message;
        assert.equal(receipt.boundary, 'after');
        const [row] = await run(sql`SELECT nonce, request, consumed_at, audit FROM trust_replay`);
        assert.equal(row.audit, receipt.value);
        assert.deepEqual(JSON.parse(row.request), request);
        assert.equal(Number(row.consumed_at), policy.now);
        await kill(committed.child);
        const retry = launch(database, 'retry');
        const retried = await retry.message;
        assert.deepEqual(retried, { boundary: 'result', value: { reason: 'replay' } });
        await kill(retry.child);
        assert.deepEqual(await run(sql`SELECT nonce, request, consumed_at, audit FROM trust_replay`), [row]);
        console.log(
            JSON.stringify({
                event: 'trust-process-recovery-passed',
                dialect,
                beforeCommitRolledBack: true,
                lostAcknowledgementReplayed: false,
                retained: 1,
                release: 'not-implemented',
            })
        );
    } finally {
        for (const child of children) await kill(child);
        await Effect.runPromise(Scope.close(scope, { _tag: 'Success', value: undefined }));
        if (directory) rmSync(directory, { recursive: true, force: true });
    }
}
