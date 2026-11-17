/**
 * @file tests/storage/fixtures/hook-producer-process.mjs
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
import { SqlClient } from '@effect/sql';
import { SqliteClient } from '@effect/sql-sqlite-node';
import { HookChangeFeed, HookProducer, HookProducerPolicy } from '@eventiva/contracts/hook';
import { TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { hookStorage } from '@eventiva/integrations.sql/hook';
import { hookProducer } from '@eventiva/integrations.sql/hook-producer';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { ConfigProvider, Context, Deferred, Effect, Exit, Layer, Scope } from 'effect';

// Trusted synthetic mutation owner and authoritative status source, NOT automatic
// Kernel production, a production release policy, or arbitrary exactly-once effects.
const tenant = TenantId.make('019b0000-0000-7000-8000-000000000001');
const request = '019b0000-0000-7000-8000-000000000002';
const intent = { kind: 'module.lifecycle', module: 'fixture', operation: 'install' };
const pg = (url) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
const checked = (value, admin = false) => {
    const url = new URL(value);
    assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname));
    assert.ok(admin ? url.pathname === '/eventiva_test' : /^\/producer_process_[a-f0-9]+$/.test(url.pathname));
    return url;
};
const [role, dialect, target] = process.argv.slice(2);
assert.ok(['sqlite', 'postgres'].includes(dialect));
const scope = await Effect.runPromise(Scope.make());
const run = (effect) => Effect.runPromise(effect.pipe(Scope.extend(scope)));
const connect = (database) =>
    Layer.build(dialect === 'sqlite' ? SqliteClient.layer({ filename: database }) : pg(checked(database).href));
const provide = (layer, sql) =>
    Layer.build(
        layer.pipe(
            Layer.provide(Layer.succeed(SqlClient.SqlClient, sql)),
            Layer.provide(Layer.succeed(CurrentTenant, { id: tenant }))
        )
    );

if (role !== 'proof') {
    const sql = Context.get(await run(connect(target)), SqlClient.SqlClient);
    const producer = Context.get(await run(provide(hookProducer(dialect, 'fixture.runtime'), sql)), HookProducer);
    const policy = HookProducerPolicy.of({
        bind: () =>
            Effect.succeed({
                purpose: 'fixture.lifecycle',
                profile: 'restricted',
                operation: 'protected',
                projection: {
                    kind: 'module.lifecycle',
                    operation: 'install',
                    identity: { module: 'fixture', version: '2.0.0', generation: 7 },
                    from: 'validated',
                    to: 'installed',
                },
            }),
        authorize: () => Effect.void,
        reconcile: (attempt) =>
            sql`SELECT request FROM producer_callback WHERE request = ${attempt.id}`.pipe(
                Effect.map((rows) => (rows.length === 1 ? 'committed' : 'unresolved'))
            ),
    });
    const task = Effect.gen(function* () {
        const begun = yield* producer.begin(request, intent);
        if (role === 'callback') {
            assert.equal(begun.fresh, true);
            yield* sql`INSERT INTO producer_callback (request) VALUES (${request})`;
            // Callback committed, but producer confirmation has not even started.
        } else {
            assert.equal(begun.fresh, false);
            assert.equal(begun.attempt.incarnation === producer.runtime.incarnation, false);
            if (role === 'reconcile') {
                assert.equal(begun.status, 'unresolved');
                assert.equal((yield* Effect.either(producer.confirm(request)))._tag, 'Left');
            } else assert.equal(begun.status, 'committed');
            assert.equal(yield* producer.reconcile(request), 'committed');
        }
        process.send({ role, incarnation: producer.runtime.incarnation, original: begun.attempt.incarnation });
        yield* Deferred.await(yield* Deferred.make());
    }).pipe(Effect.provideService(HookProducerPolicy, policy));
    await run(task);
} else {
    const children = [];
    const stop = (child) =>
        new Promise((resolve) => {
            if (child.exitCode !== null || child.signalCode !== null) return resolve();
            child.once('exit', resolve);
            child.kill('SIGKILL');
        });
    const launch = (phase, database) =>
        new Promise((resolve, reject) => {
            const child = fork(fileURLToPath(import.meta.url), [phase, dialect, database], {
                stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
            });
            children.push(child);
            let stderr = '';
            child.stderr.on('data', (chunk) => {
                stderr += chunk;
            });
            const timer = setTimeout(() => reject(new Error(`Producer worker ${phase} timed out`)), 15000);
            child.once('error', (error) => {
                clearTimeout(timer);
                reject(error);
            });
            child.once('exit', (code, signal) => {
                clearTimeout(timer);
                reject(new Error(`Producer worker exited before barrier: ${code}/${signal}: ${stderr}`));
            });
            child.once('message', (message) => {
                clearTimeout(timer);
                resolve({ child, message });
            });
        });
    try {
        const directory = await run(
            Effect.acquireRelease(
                Effect.sync(() => mkdtempSync(join(tmpdir(), 'producer-process-'))),
                (path) => Effect.sync(() => rmSync(path, { recursive: true, force: true }))
            )
        );
        let database = join(directory, 'producer.sqlite');
        if (dialect === 'postgres') {
            const url = checked(
                process.env.STORAGE_TEST_POSTGRES_URL ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test',
                true
            );
            const admin = Context.get(await run(Layer.build(pg(url.href))), SqlClient.SqlClient);
            const name = `producer_process_${randomUUID().replaceAll('-', '')}`;
            await run(admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`);
            await run(Effect.addFinalizer(() => admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie)));
            url.pathname = `/${name}`;
            database = url.href;
        }
        const sql = Context.get(await run(connect(database)), SqlClient.SqlClient);
        await run(
            migrate(
                dialect,
                await run(load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url))))
            ).pipe(Effect.provideService(SqlClient.SqlClient, sql))
        );
        await run(sql`CREATE TABLE producer_callback (request text PRIMARY KEY)`);
        const feed = Context.get(await run(provide(hookStorage(dialect), sql)), HookChangeFeed);
        const first = await launch('callback', database);
        assert.equal((await run(feed.read(0, 10))).events.length, 0);
        const [unresolved] = await run(
            sql`SELECT state FROM hook_producer_attempt WHERE tenant = ${tenant} AND request = ${request}`
        );
        assert.equal(unresolved.state, 'unresolved');
        await stop(first.child);
        const second = await launch('reconcile', database);
        const committed = await run(feed.read(0, 10));
        assert.equal(committed.cursor, 1);
        assert.equal(committed.events.length, 1);
        assert.equal(committed.events[0].event.resourceId, first.message.incarnation);
        assert.equal(committed.events[0].event.id, request);
        assert.equal(committed.events[0].event.profile, 'restricted');
        assert.equal(committed.events[0].event.operation, 'protected');
        await stop(second.child); // Durable confirmation committed; acknowledgement deliberately lost.
        const third = await launch('retry', database);
        assert.deepEqual(await run(feed.read(0, 10)), committed);
        assert.equal((await run(sql`SELECT request FROM producer_callback`)).length, 1);
        assert.equal((await run(sql`SELECT incarnation FROM hook_runtime WHERE tenant = ${tenant}`)).length, 3);
        assert.equal(
            new Set([first.message.incarnation, second.message.incarnation, third.message.incarnation]).size,
            3
        );
        assert.equal(second.message.original, first.message.incarnation);
        assert.equal(third.message.original, first.message.incarnation);
        assert.equal(new Set(children.map((child) => child.pid)).size, 3);
        console.log(
            JSON.stringify({
                event: 'hook-producer-process-passed',
                dialect,
                processes: 3,
                distinctIncarnations: 3,
                unresolvedBeforeReconcile: true,
                callbackExecutions: 1,
                committedFacts: committed.events.length,
                confirmationAcknowledgementLost: true,
                automaticKernelProduction: false,
                productionRelease: false,
            })
        );
    } finally {
        await Promise.all(children.map(stop));
        await run(Scope.close(scope, Exit.void));
    }
}
