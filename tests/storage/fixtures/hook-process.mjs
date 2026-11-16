/**
 * @file tests/storage/fixtures/hook-process.mjs
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
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { SqliteClient } from '@effect/sql-sqlite-node';
import { Flags } from '@eventiva/contracts/flags';
import {
    HookDeclaration,
    HookEvent,
    HookOperatorPolicy,
    HookOutbox,
    HookRecovery,
    HookReleasePolicy,
} from '@eventiva/contracts/hook';
import { TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant, Storage } from '@eventiva/contracts/storage';
import { hookStorage } from '@eventiva/integrations.sql/hook';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { HookDispatcher, HookDispatcherLive, HookSink } from '@eventiva/runtime/hook';
import { Cause, ConfigProvider, Context, Deferred, Effect, Exit, FiberSet, Layer, Schema, Scope } from 'effect';

// Reviewed synthetic SQL sink only. This is not a production accepting sink,
// principal registry, or substitute for canonical ActionHost authorization.
// Its deduplication is not a general exactly-once delivery guarantee.
const id = (n) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const tenant = TenantId.make(id(1));
const identity = { module: 'fixture', version: '1.0.0', generation: 1 };
const declaration = Schema.decodeUnknownSync(HookDeclaration)({
    format: 1,
    pin: { tenant, owner: identity, hook: 'fixture.process', revision: 1 },
    delivery: 'post-commit',
    target: 'declarative',
    capability: { kind: 'observation' },
    observations: ['domain.change'],
    profiles: ['baseline'],
    maxAttempts: 4,
    retryDelayMs: 10,
    timeoutMs: 1000,
    concurrency: 1,
    capacity: 1,
});
const event = Schema.decodeUnknownSync(HookEvent)({
    format: 1,
    id: id(11),
    tenant,
    commit: id(21),
    resource: 'fixture.record',
    resourceId: id(5),
    purpose: 'fixture.notify',
    profile: 'baseline',
    operation: 'ordinary',
    sequence: 1,
    projection: { kind: 'domain.change', identity, change: 'updated', revision: 1 },
});
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
    assert.ok(admin ? url.pathname === '/eventiva_test' : /^\/hook_process_[a-f0-9]+$/.test(url.pathname));
    return url;
};
const connect = (dialect, target) =>
    Layer.build(dialect === 'sqlite' ? SqliteClient.layer({ filename: target }) : pg(checked(target).href));
const services = (dialect, sql) =>
    Layer.build(
        hookStorage(dialect).pipe(
            Layer.provide(Layer.succeed(SqlClient.SqlClient, sql)),
            Layer.provide(Layer.succeed(CurrentTenant, { id: tenant }))
        )
    );
const scope = await Effect.runPromise(Scope.make());
const run = (effect) => Effect.runPromise(effect.pipe(Scope.extend(scope)));
const [role, dialect, target] = process.argv.slice(2);
assert.ok(['sqlite', 'postgres'].includes(dialect));

if (role === 'worker') {
    const sql = Context.get(await run(connect(dialect, target)), SqlClient.SqlClient);
    const context = await run(services(dialect, sql));
    const outbox = Context.get(context, HookOutbox);
    const recovery = Context.get(context, HookRecovery);
    const tasks = await run(FiberSet.make());
    const runFork = await run(FiberSet.runtime(tasks)());
    const barrier = (name, value) =>
        Effect.gen(function* () {
            process.send({ barrier: name, value, pid: process.pid });
            // Only SIGKILL releases these barriers. No delivery/ack can run ahead
            // of the parent proving durable state at the named crash boundary.
            yield* Deferred.await(yield* Deferred.make());
        });
    const dispatch = (phase) =>
        Effect.gen(function* () {
            const dispatcher = Context.get(
                yield* Layer.build(
                    HookDispatcherLive.pipe(
                        Layer.provide(
                            Layer.mergeAll(
                                Layer.succeed(HookOutbox, {
                                    ...outbox,
                                    claim: (d, now) =>
                                        outbox.claim(d, now).pipe(
                                            Effect.tap((claim) =>
                                                claim === undefined
                                                    ? Effect.void
                                                    : phase === 'claim'
                                                      ? barrier('claimed', claim)
                                                      : Effect.sync(() =>
                                                            process.send({
                                                                barrier: 'reclaimed',
                                                                value: claim,
                                                                pid: process.pid,
                                                            })
                                                        )
                                            )
                                        ),
                                    // Pause after the sink returns, outside its timeout, but
                                    // before the real public settlement can acknowledge it.
                                    settle: (claim, settlement) =>
                                        phase === 'sink' && settlement.state === 'delivered'
                                            ? barrier('accepted', { key: claim.idempotencyKey })
                                            : outbox.settle(claim, settlement),
                                }),
                                Layer.succeed(Flags, {
                                    evaluate: (flag) =>
                                        Effect.succeed({
                                            flag: flag.key,
                                            value: true,
                                            reason: 'TEST',
                                            fallback: false,
                                        }),
                                }),
                                Layer.succeed(HookReleasePolicy, { authorize: () => Effect.void }),
                                Layer.succeed(HookSink, {
                                    deliver: (_d, fact, key) =>
                                        Effect.gen(function* () {
                                            yield* sql
                                                .withTransaction(
                                                    Effect.gen(function* () {
                                                        yield* sql`INSERT INTO hook_process_attempt (key) VALUES (${key})`;
                                                        yield* sql`INSERT INTO hook_process_sink (key, event_id) VALUES (${key}, ${fact.id}) ON CONFLICT (key) DO NOTHING`;
                                                    })
                                                )
                                                .pipe(Effect.orDie);
                                        }),
                                })
                            )
                        )
                    )
                ),
                HookDispatcher
            );
            return yield* (yield* dispatcher.register(declaration)).dispatch;
        }).pipe(Effect.scoped);
    process.on('message', (message) => {
        const operation =
            message.command === 'dispatch'
                ? dispatch(message.phase)
                : message.command === 'claim'
                  ? outbox.claim(declaration, 0)
                  : message.command === 'replay'
                    ? recovery.replay(message.declaration ?? declaration, message.key, message.requestId).pipe(
                          Effect.provideService(HookOperatorPolicy, {
                              // Synthetic trusted operator authority, not a production principal registry.
                              authorize: (pin, operation) =>
                                  Effect.sync(() => {
                                      assert.deepEqual(pin, declaration.pin);
                                      assert.equal(operation, 'replay');
                                  }),
                          }),
                          // Public replay has returned only after its transaction committed.
                          // Hold the IPC acknowledgement until the coordinator kills this worker.
                          Effect.tap((accepted) =>
                              message.phase === 'commit' ? barrier('replayed', { accepted }) : Effect.void
                          ),
                          Effect.catchAll((error) => Effect.succeed(error.reason))
                      )
                    : message.command === 'settle'
                      ? outbox
                            .settle(message.claim, message.settlement ?? { state: 'delivered' })
                            .pipe(Effect.match({ onFailure: (error) => error.reason, onSuccess: () => 'settled' }))
                      : Effect.die('Unknown process proof command');
        runFork(
            operation.pipe(
                Effect.matchCause({
                    onFailure: (cause) => process.send({ id: message.id, error: Cause.pretty(cause) }),
                    onSuccess: (value) => process.send({ id: message.id, value }),
                })
            )
        );
    });
    // A failed/timed-out coordinator must not leave fixture workers behind.
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
                child.off('exit', exit);
                child.off('error', fail);
                if (error) reject(error);
                else resolve(value);
            };
            const check = () => {
                const found = messages.find((entry) => entry.child === child && predicate(entry.value));
                if (found) finish(undefined, found.value);
            };
            const exit = (code, signal) => finish(new Error(`Worker exited at IPC barrier: ${code}/${signal}`));
            const fail = (error) => finish(error);
            const timer = setTimeout(() => finish(new Error('Process proof IPC deadline exceeded')), 15000);
            child.once('exit', exit);
            child.once('error', fail);
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
        await waitFor(child, (value) => value.ready);
        return child;
    };
    const request = (child, command) => {
        const id = ++sequence;
        const response = waitFor(child, (value) => value.id === id).then((reply) => {
            assert.equal(reply.error, undefined, reply.error);
            return reply.value;
        });
        child.send({ id, ...command });
        return response;
    };
    const stop = (child) =>
        new Promise((resolve, reject) => {
            if (child.exitCode !== null || child.signalCode !== null) return resolve();
            const timer = setTimeout(() => reject(new Error('SIGKILL exit deadline exceeded')), 10000);
            child.once('exit', (_code, signal) => {
                clearTimeout(timer);
                children.delete(child);
                assert.equal(signal, 'SIGKILL');
                resolve();
            });
            child.kill('SIGKILL');
        });
    try {
        const directory = mkdtempSync(join(tmpdir(), 'eventiva-hook-process-'));
        await run(Effect.addFinalizer(() => Effect.sync(() => rmSync(directory, { recursive: true, force: true }))));
        let database = join(directory, 'outbox.sqlite');
        if (dialect === 'postgres') {
            const adminUrl = checked(
                process.env.STORAGE_TEST_POSTGRES_URL ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test',
                true
            );
            const admin = Context.get(await run(Layer.build(pg(adminUrl.href))), SqlClient.SqlClient);
            const name = `hook_process_${randomUUID().replaceAll('-', '')}`;
            await run(admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`);
            await run(Effect.addFinalizer(() => admin`DROP DATABASE ${admin(name)} WITH (FORCE)`.pipe(Effect.orDie)));
            adminUrl.pathname = `/${name}`;
            database = adminUrl.href;
        }
        const sql = Context.get(await run(connect(dialect, database)), SqlClient.SqlClient);
        await run(
            load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url))).pipe(
                Effect.flatMap((files) => migrate(dialect, files)),
                Effect.provideService(SqlClient.SqlClient, sql)
            )
        );
        const context = await run(services(dialect, sql));
        const store = Context.get(context, Storage);
        const outbox = Context.get(context, HookOutbox);
        await run(sql`CREATE TABLE hook_process_origin (id text PRIMARY KEY)`);
        await run(sql`CREATE TABLE hook_process_sink (key text PRIMARY KEY, event_id text NOT NULL)`);
        await run(sql`CREATE TABLE hook_process_attempt (key text NOT NULL)`);
        const origin = store.commit(
            { key: 'process-origin', inputHash: 'one' },
            Effect.gen(function* () {
                yield* sql`INSERT INTO hook_process_origin (id) VALUES ('one')`;
                yield* outbox.stage(event, [declaration]);
                return { output: null, receipt: { committed: true } };
            })
        );
        assert.equal((await run(origin)).replayed, false);
        const [a, b] = await Promise.all([launch(database), launch(database)]);
        assert.notEqual(a.pid, b.pid);
        assert.notEqual(a.pid, process.pid);
        assert.notEqual(b.pid, process.pid);
        const racing = [a, b].map((child) =>
            request(child, { command: 'dispatch', phase: 'claim' }).then(
                (value) => ({ value }),
                (error) => ({ error })
            )
        );
        const first = await Promise.race(
            [a, b].map((child) =>
                waitFor(child, (value) => value.barrier === 'claimed').then((message) => ({ child, message }))
            )
        );
        const winner = first.child;
        const survivor = winner === a ? b : a;
        const claim1 = first.message.value;
        assert.equal((await racing[winner === a ? 1 : 0]).value, 'empty');
        assert.equal(claim1.attempt, 1);
        assert.equal((await run(sql`SELECT * FROM hook_process_sink`)).length, 0);
        const running = await run(sql`SELECT state, lease, attempt FROM hook_delivery`);
        assert.deepEqual(
            running.map((row) => ({ ...row, attempt: Number(row.attempt) })),
            [{ state: 'running', lease: claim1.lease, attempt: 1 }]
        );
        await stop(winner);
        // Wait on the database's own clock, never update lease/due state. A
        // forged future caller timestamp also must not steal a current lease.
        assert.equal(await run(outbox.claim(declaration, Number.MAX_SAFE_INTEGER)), undefined);
        const expire = async () => {
            const deadline = Date.now() + 10000;
            while (Date.now() < deadline) {
                const [row] = await run(
                    dialect === 'postgres'
                        ? sql`SELECT lease_until, CAST(EXTRACT(EPOCH FROM clock_timestamp()) * 1000 AS bigint) AS now FROM hook_delivery`
                        : sql`SELECT lease_until, CAST((julianday('now') - 2440587.5) * 86400000 AS integer) AS now FROM hook_delivery`
                );
                if (Number(row.now) >= Number(row.lease_until)) return;
                await delay(20);
            }
            assert.fail('Real database lease expiry deadline exceeded');
        };
        await expire();
        assert.equal(await request(survivor, { command: 'settle', claim: claim1 }), 'lease-lost');
        const secondDispatch = request(survivor, { command: 'dispatch', phase: 'sink' }).catch((error) => ({ error }));
        const claim2 = (await waitFor(survivor, (value) => value.barrier === 'reclaimed')).value;
        await waitFor(survivor, (value) => value.barrier === 'accepted');
        assert.equal(claim2.idempotencyKey, claim1.idempotencyKey);
        assert.notEqual(claim2.lease, claim1.lease);
        assert.equal(claim2.attempt, 2);
        assert.deepEqual(await run(sql`SELECT key, event_id FROM hook_process_sink`), [
            { key: claim1.idempotencyKey, event_id: event.id },
        ]);
        assert.equal((await run(sql`SELECT state FROM hook_delivery`))[0].state, 'running');
        assert.equal((await run(outbox.settle(claim1, { state: 'delivered' }).pipe(Effect.flip))).reason, 'lease-lost');
        await stop(survivor);
        await secondDispatch;
        await expire();
        const replacement = await launch(database);
        assert.notEqual(replacement.pid, survivor.pid);
        assert.equal(await request(replacement, { command: 'settle', claim: claim2 }), 'lease-lost');
        assert.equal(await request(replacement, { command: 'dispatch', phase: 'finish' }), 'delivered');
        const claim3 = (await waitFor(replacement, (value) => value.barrier === 'reclaimed')).value;
        assert.equal(claim3.idempotencyKey, claim1.idempotencyKey);
        assert.equal(claim3.attempt, 3);
        assert.notEqual(claim3.lease, claim2.lease);
        for (const claim of [claim1, claim2])
            assert.equal(await request(replacement, { command: 'settle', claim }), 'lease-lost');
        assert.equal(await request(replacement, { command: 'dispatch', phase: 'finish' }), 'empty');
        assert.equal((await run(sql`SELECT * FROM hook_process_sink`)).length, 1);
        assert.deepEqual(
            (await run(sql`SELECT key FROM hook_process_attempt`)).map((row) => row.key),
            [claim1.idempotencyKey, claim1.idempotencyKey]
        );
        assert.equal((await run(origin)).replayed, true);
        assert.equal((await run(sql`SELECT * FROM hook_process_origin`)).length, 1);
        assert.equal((await run(sql`SELECT * FROM action_commit WHERE key = 'process-origin'`)).length, 1);
        assert.deepEqual(
            (await run(sql`SELECT state, attempt FROM hook_delivery`)).map((row) => ({
                state: row.state,
                attempt: Number(row.attempt),
            })),
            [{ state: 'delivered', attempt: 3 }]
        );

        // Exhaust a second staged event through public claims/settlements only.
        // No lease, attempt, due time or terminal state is rewritten by the proof.
        const replayEvent = { ...event, id: id(12), commit: id(22), sequence: 2 };
        await run(store.transaction(outbox.stage(replayEvent, [declaration])));
        let terminalClaim;
        for (let attempt = 1; attempt <= declaration.maxAttempts; attempt++) {
            terminalClaim = await request(replacement, { command: 'claim' });
            assert.ok(terminalClaim);
            assert.equal(terminalClaim.attempt, attempt);
            assert.equal(terminalClaim.event.id, replayEvent.id);
            assert.equal(
                await request(replacement, {
                    command: 'settle',
                    claim: terminalClaim,
                    settlement:
                        attempt === declaration.maxAttempts
                            ? { state: 'dead-letter', reason: 'exhausted' }
                            : { state: 'retry', availableAt: 0 },
                }),
                'settled'
            );
        }
        const delivery = () =>
            run(sql`SELECT * FROM hook_delivery WHERE idempotency_key = ${terminalClaim.idempotencyKey}`);
        const history = () => run(sql`SELECT * FROM hook_redrive`);
        assert.equal((await delivery())[0].state, 'dead-letter');
        assert.deepEqual(await history(), []);
        const operator = await launch(database);
        assert.notEqual(operator.pid, replacement.pid);
        const replayRequest = { command: 'replay', key: terminalClaim.idempotencyKey, requestId: id(90) };
        const lostAcknowledgement = request(operator, { ...replayRequest, phase: 'commit' }).catch((error) => ({
            error,
        }));
        const replayMessageId = sequence;
        assert.deepEqual((await waitFor(operator, (value) => value.barrier === 'replayed')).value, {
            accepted: true,
        });
        const [pending] = await delivery();
        assert.equal(pending.state, 'pending');
        assert.equal(Number(pending.attempt), 0);
        assert.equal(pending.lease, null);
        const committedHistory = await history();
        assert.equal(committedHistory.length, 1);
        assert.equal(committedHistory[0].request_id, replayRequest.requestId);
        assert.equal(committedHistory[0].idempotency_key, terminalClaim.idempotencyKey);
        assert.equal(Number(committedHistory[0].attempt), declaration.maxAttempts);
        assert.equal(committedHistory[0].reason, 'exhausted');
        assert.equal(
            messages.some((entry) => entry.child === operator && entry.value.id === replayMessageId),
            false
        );
        await stop(operator);
        assert.match((await lostAcknowledgement).error.message, /Worker exited at IPC barrier: null\/SIGKILL/);
        assert.equal(
            messages.some((entry) => entry.child === operator && entry.value.id === replayMessageId),
            false
        );

        const operatorReplacement = await launch(database);
        assert.notEqual(operatorReplacement.pid, operator.pid);
        assert.notEqual(operatorReplacement.pid, replacement.pid);
        const freshFirst = await request(replacement, { command: 'claim' });
        assert.equal(freshFirst.idempotencyKey, terminalClaim.idempotencyKey);
        assert.deepEqual(freshFirst.event, terminalClaim.event);
        assert.equal(freshFirst.attempt, 1);
        assert.notEqual(freshFirst.lease, terminalClaim.lease);
        assert.equal(
            await request(replacement, {
                command: 'settle',
                claim: freshFirst,
                settlement: { state: 'retry', availableAt: 0 },
            }),
            'settled'
        );
        const fresh = await request(replacement, { command: 'claim' });
        assert.equal(fresh.attempt, 2);
        assert.notEqual(fresh.lease, freshFirst.lease);
        const runningReplay = await delivery();
        assert.equal(runningReplay[0].state, 'running');
        assert.equal(runningReplay[0].lease, fresh.lease);
        assert.equal(Number(runningReplay[0].attempt), 2);
        const retryAccepted = await request(operatorReplacement, replayRequest);
        assert.equal(retryAccepted, false);
        // Same UUID with changed delivery or declaration must conflict, not alias the accepted request.
        assert.equal(await request(operatorReplacement, { ...replayRequest, key: claim1.idempotencyKey }), 'conflict');
        assert.equal(
            await request(operatorReplacement, {
                ...replayRequest,
                declaration: { ...declaration, maxAttempts: declaration.maxAttempts + 1 },
            }),
            'conflict'
        );
        assert.equal(await request(operatorReplacement, { ...replayRequest, requestId: id(91) }), 'conflict');
        for (const claim of [terminalClaim, freshFirst])
            assert.equal(await request(operatorReplacement, { command: 'settle', claim }), 'lease-lost');
        // Byte-for-byte row equality includes the live lease deadline and remaining attempt budget.
        assert.deepEqual(await delivery(), runningReplay);
        assert.deepEqual(await history(), committedHistory);
        assert.equal(await request(replacement, { command: 'settle', claim: fresh }), 'settled');
        assert.equal(await request(operatorReplacement, replayRequest), false);
        assert.equal((await delivery())[0].state, 'delivered');
        assert.deepEqual(await history(), committedHistory);
        // This direct outbox/recovery scenario never calls the synthetic accepting sink.
        assert.equal((await run(sql`SELECT * FROM hook_process_sink`)).length, 1);
        assert.equal((await run(sql`SELECT * FROM hook_process_attempt`)).length, 2);
        console.log(
            JSON.stringify({
                event: 'hook-process-recovery-passed',
                dialect,
                pids: [a.pid, b.pid, replacement.pid],
                attempts: 3,
                applied: 1,
                originRuns: 1,
                operatorReplay: {
                    pids: [operator.pid, operatorReplacement.pid],
                    acknowledgementLost: true,
                    retryAccepted,
                    historyRecords: committedHistory.length,
                    terminalAttempts: terminalClaim.attempt,
                    preservedAttempt: fresh.attempt,
                },
            })
        );
    } finally {
        await Promise.all([...children].map(stop));
        await run(Scope.close(scope, Exit.void));
    }
}
