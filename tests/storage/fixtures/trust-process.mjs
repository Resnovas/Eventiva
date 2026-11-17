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
import { TrustFailure, TrustReplay, TrustRequest } from '@eventiva/contracts/trust';
import { trustReplay } from '@eventiva/integrations.sql/trust';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { ConfigProvider, Context, Deferred, Effect, Layer, Schema, Scope } from 'effect';

const [role, dialect, target, phase, nonce] = process.argv.slice(2);
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
    const disconnected = () => process.kill(process.pid, 'SIGKILL');
    process.once('disconnect', disconnected);
    const input = nonce ? Schema.decodeUnknownSync(TrustRequest)({ ...request, nonce }) : request;
    if (phase === 'race') {
        // Establish each independent connection before the parent releases all contenders.
        await run(sql`SELECT 1`);
        const released = once(process, 'message');
        process.send({ boundary: 'ready', value: process.pid });
        assert.deepEqual(await released, [{ boundary: 'go' }, undefined]);
    }
    const result = await run(
        port.consume(input, policy).pipe(
            Effect.tap((audit) => (phase === 'after' ? barrier('after', audit) : Effect.void)),
            Effect.match({
                onSuccess: (audit) => ({ audit }),
                onFailure: (error) => {
                    assert.ok(error instanceof TrustFailure);
                    assert.equal(error.gate, 'replay');
                    assert.ok(['replay', 'unavailable'].includes(error.reason));
                    assert.deepEqual(Object.keys(error).sort(), ['_tag', 'gate', 'reason']);
                    return { reason: error.reason };
                },
            })
        )
    );
    await Effect.runPromise(Scope.close(scope, { _tag: 'Success', value: undefined }));
    process.off('disconnect', disconnected);
    process.send({ boundary: 'result', value: result }, () => process.disconnect());
} else {
    assert.equal(role, 'proof');
    const children = new Set();
    const nextMessage = (child) =>
        new Promise((resolve, reject) => {
            const cleanup = () => {
                clearTimeout(timer);
                child.off('message', received);
                child.off('error', failed);
                child.off('exit', exited);
            };
            const received = (value) => {
                cleanup();
                resolve(value);
            };
            const failed = (error) => {
                cleanup();
                reject(error);
            };
            const exited = (code, signal) => failed(new Error(`Trust worker exited ${code}/${signal}`));
            const timer = setTimeout(() => failed(new Error('Trust proof IPC deadline exceeded')), 15000);
            child.once('message', received);
            child.once('error', failed);
            child.once('exit', exited);
        });
    const launch = (database, boundary, nonce) => {
        const child = fork(
            fileURLToPath(import.meta.url),
            ['worker', dialect, database, boundary, ...(nonce ? [nonce] : [])],
            {
                execArgv: [],
                stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
            }
        );
        children.add(child);
        const exited = new Promise((resolve) => {
            child.once('exit', (code, signal) => {
                children.delete(child);
                resolve({ code, signal });
            });
        });
        return { child, message: nextMessage(child), exited };
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
            // FORCE also checks roleless autovacuum workers; signal only sessions owned by this fixture role.
            await run(
                Effect.addFinalizer(() =>
                    admin`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ${name} AND usename = current_user AND pid <> pg_backend_pid()`.pipe(
                        Effect.zipRight(admin`DROP DATABASE ${admin(name)}`),
                        Effect.orDie
                    )
                )
            );
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

        // Keep race nonces separate from the original crash scenario and its stdout contract.
        const retained = [row];
        const pids = new Set([process.pid, first.child.pid, committed.child.pid, retry.child.pid]);
        for (const mixedCase of [false, true]) {
            const lower = id(mixedCase ? 0xabcdee : 0xabcdef);
            const spellings = [
                lower,
                lower,
                mixedCase ? lower.toUpperCase() : lower,
                mixedCase ? lower.toUpperCase() : lower,
            ];
            const contenders = spellings.map((spelling) => launch(database, 'race', spelling));
            const ready = await Promise.all(contenders.map((worker) => worker.message));
            for (const [index, worker] of contenders.entries()) {
                assert.deepEqual(ready[index], { boundary: 'ready', value: worker.child.pid });
                assert.ok(!pids.has(worker.child.pid));
                pids.add(worker.child.pid);
            }
            assert.deepEqual(
                await run(sql`SELECT nonce, request, consumed_at, audit FROM trust_replay ORDER BY nonce`),
                retained
            );
            // Install every result listener before releasing any worker. Never retry contenders.
            const results = contenders.map((worker) => nextMessage(worker.child));
            for (const worker of contenders) worker.child.send({ boundary: 'go' });
            const messages = await Promise.all(results);
            const winners = [];
            for (const [index, message] of messages.entries()) {
                assert.equal(message.boundary, 'result');
                if (Object.hasOwn(message.value, 'audit')) {
                    assert.deepEqual(Object.keys(message.value), ['audit']);
                    assert.match(message.value.audit, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
                    winners.push(index);
                } else {
                    assert.ok(['replay', 'unavailable'].includes(message.value.reason));
                    assert.deepEqual(message.value, { reason: message.value.reason });
                }
            }
            assert.equal(winners.length, 1);
            assert.deepEqual(
                await Promise.all(contenders.map((worker) => worker.exited)),
                contenders.map(() => ({ code: 0, signal: null }))
            );
            const [winner] = await run(
                sql`SELECT nonce, request, consumed_at, audit FROM trust_replay WHERE nonce = ${lower}`
            );
            assert.ok(winner);
            assert.equal(winner.nonce, lower);
            assert.deepEqual(JSON.parse(winner.request), { ...request, nonce: spellings[winners[0]] });
            assert.equal(Number(winner.consumed_at), policy.now);
            assert.equal(winner.audit, messages[winners[0]].value.audit);
            assert.ok(retained.every((prior) => prior.audit !== winner.audit));
            retained.push(winner);
            retained.sort((a, b) => a.nonce.localeCompare(b.nonce));
            // All racing clients have closed. Each spelling must now deterministically refuse.
            for (const spelling of [lower, lower.toUpperCase()]) {
                const reopened = launch(database, 'retry', spelling);
                assert.ok(!pids.has(reopened.child.pid));
                pids.add(reopened.child.pid);
                assert.deepEqual(await reopened.message, { boundary: 'result', value: { reason: 'replay' } });
                assert.deepEqual(await reopened.exited, { code: 0, signal: null });
            }
            assert.deepEqual(
                await run(sql`SELECT nonce, request, consumed_at, audit FROM trust_replay ORDER BY nonce`),
                retained
            );
        }
        const controlNonce = id(0xabcdf0);
        const control = launch(database, 'retry', controlNonce);
        assert.ok(!pids.has(control.child.pid));
        const allowed = await control.message;
        assert.equal(allowed.boundary, 'result');
        assert.deepEqual(Object.keys(allowed.value), ['audit']);
        assert.deepEqual(await control.exited, { code: 0, signal: null });
        const [controlRow] = await run(
            sql`SELECT nonce, request, consumed_at, audit FROM trust_replay WHERE nonce = ${controlNonce}`
        );
        assert.ok(controlRow);
        assert.equal(controlRow.nonce, controlNonce);
        assert.deepEqual(JSON.parse(controlRow.request), { ...request, nonce: controlNonce });
        assert.equal(Number(controlRow.consumed_at), policy.now);
        assert.equal(controlRow.audit, allowed.value.audit);
        assert.ok(retained.every((prior) => prior.audit !== controlRow.audit));
        retained.push(controlRow);
        retained.sort((a, b) => a.nonce.localeCompare(b.nonce));
        assert.deepEqual(
            await run(sql`SELECT nonce, request, consumed_at, audit FROM trust_replay ORDER BY nonce`),
            retained
        );
        // Keep new evidence off stdout: the existing wrapper parses its exact recovery JSON.
        console.error(
            JSON.stringify({
                event: 'trust-process-races-passed',
                dialect,
                races: 2,
                contendersPerRace: 4,
                winners: 2,
                losers: 6,
                reopenedReplays: 4,
                distinctControl: true,
                retained: retained.length,
            })
        );
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
