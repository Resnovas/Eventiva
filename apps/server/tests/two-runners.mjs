/**
 * @file apps/server/tests/two-runners.mjs
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
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { Effect, Exit, Scope } from 'effect';
import { caller, id, prepare } from './sql-fixture.mjs';

// A real process/IPC harness, not actors or two layers in the parent VM.
// Intentionally not a passing CI placeholder: no bootstrap is a hard failure.
const bootstrap = fileURLToPath(new URL('./sql-fixture.mjs', import.meta.url));
await access(resolve(bootstrap));
const children = new Set();
const events = [];
let sequence = 0;
const scope = await Effect.runPromise(Scope.make());
const fixture = await Effect.runPromise(
    prepare.pipe(
        Effect.provideService(Scope.Scope, scope),
        Effect.onError(() => Scope.close(scope, Exit.void))
    )
);
const run = Effect.runPromise;

const launch = (port, edition = 'cloud') => {
    const child = fork(fileURLToPath(new URL('./runner-process.mjs', import.meta.url)), [resolve(bootstrap)], {
        env: {
            ...process.env,
            ...fixture.env,
            EVENTIVA_CLUSTER_PROFILE: JSON.stringify({
                edition,
                expectedRunners: edition === 'cloud' ? 2 : 1,
                shards: 24,
                port,
                assignmentRefreshMs: 250,
                healthCheckMs: 250,
                lockRefreshMs: 1000,
                lockExpiryMs: 4000,
                drainMs: 2000,
            }),
        },
        stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
    });
    children.add(child);
    child.on('message', (event) => {
        if (event?.barrier) events.push(event);
    });
    child.once('exit', () => children.delete(child));
    return new Promise((resolveReady, reject) => {
        const timer = setTimeout(() => {
            cleanup();
            reject(new Error('Runner startup timed out'));
        }, 30000);
        const cleanup = () => {
            clearTimeout(timer);
            child.off('message', message);
            child.off('exit', exit);
            child.off('error', error);
        };
        const message = (value) => {
            if (value?.ready) {
                cleanup();
                resolveReady(child);
            }
        };
        const exit = (code, signal) => {
            cleanup();
            reject(new Error(`Runner exited before ready: ${code}/${signal}`));
        };
        const error = (cause) => {
            cleanup();
            reject(cause);
        };
        child.on('message', message);
        child.once('exit', exit);
        child.once('error', error);
    });
};

const request = (child, command) =>
    new Promise((resolveReply, reject) => {
        const id = ++sequence;
        const cleanup = () => {
            clearTimeout(timer);
            child.off('message', message);
            child.off('exit', exit);
        };
        const timer = setTimeout(() => {
            cleanup();
            reject(new Error('Runner response timed out'));
        }, 90000);
        const message = (value) => {
            if (value?.id !== id) return;
            cleanup();
            if (value.error) reject(new Error(value.error));
            else resolveReply(value.value);
        };
        const exit = () => {
            cleanup();
            reject(new Error('Runner exited during request'));
        };
        child.on('message', message);
        child.once('exit', exit);
        child.send({ id, ...command }, (error) => {
            if (error) {
                cleanup();
                reject(error);
            }
        });
    });

const until = async (read, predicate) => {
    const deadline = Date.now() + 120000;
    while (Date.now() < deadline) {
        const value = await read();
        if (predicate(value)) return value;
        await delay(200);
    }
    throw new Error('Shard convergence deadline exceeded');
};
const stop = (child, signal) =>
    new Promise((resolveExit, reject) => {
        if (child.exitCode !== null || child.signalCode !== null) {
            resolveExit();
            return;
        }
        const timer = setTimeout(() => {
            child.off('exit', exit);
            reject(new Error(`${signal} exit timed out`));
        }, 30000);
        const exit = () => {
            clearTimeout(timer);
            children.delete(child);
            resolveExit();
        };
        child.once('exit', exit);
        child.kill(signal);
    });
const snapshots = (...runners) => Promise.all(runners.map((runner) => request(runner, { command: 'status' })));
const distributed = (states) =>
    states.every((s) => s.status === 'healthy' && s.healthyRunners === 2 && s.ownedShards.length > 0) &&
    states[0].ownedShards.every((id) => !states[1].ownedShards.includes(id)) &&
    states[0].ownedShards.length + states[1].ownedShards.length === 24;

try {
    const pending = launch(34561);
    await until(
        () => Promise.resolve(events),
        (values) => values.some((event) => event.barrier === 'registration')
    );
    assert.equal((await run(fixture.sql.c`SELECT * FROM cluster_runners`)).length, 0);
    assert.equal((await run(fixture.sql.c`SELECT * FROM cluster_locks`)).length, 0);
    await delay(350);
    assert.equal((await run(fixture.sql.c`SELECT * FROM cluster_runners`)).length, 0);
    await run(fixture.set('registration', false));
    let a = await pending;
    let b = await launch(34562);
    assert.notEqual(a.pid, b.pid);
    assert.notEqual(a.pid, process.pid);
    const distribution = await until(() => snapshots(a, b), distributed);
    console.log(JSON.stringify({ event: 'distribution', pids: [a.pid, b.pid], states: distribution }));
    console.log(JSON.stringify({ event: 'registration-barrier-passed' }));
    let record = 100;
    let lastWorkflow;
    const invocation = (n, tenant = 1) => ({
        caller: caller(tenant),
        entityKey: `order:${n}`,
        action: 'fixture.change',
        input: { id: id(n), value: n + 7 },
        intent: { idempotencyKey: `business:${n}` },
    });
    const verifyCommitted = async (request, cell = 'a') => {
        const sql = fixture.sql[cell];
        const recordId = request.input.id;
        const rows = await run(sql`SELECT state, version, payload FROM operational_record WHERE id = ${recordId}`);
        assert.equal(rows.length, 1);
        assert.equal(rows[0].state, 'confirmed');
        assert.equal(Number(rows[0].version), 1);
        assert.deepEqual(JSON.parse(rows[0].payload), { value: request.input.value });
        assert.equal((await run(sql`SELECT * FROM transition_history WHERE record_id = ${recordId}`)).length, 1);
        assert.equal((await run(sql`SELECT * FROM command_outbox WHERE id = ${recordId}`)).length, 1);
        const commits = (await run(sql`SELECT result FROM action_commit WHERE result IS NOT NULL`))
            .map(({ result }) => JSON.parse(result))
            .filter(({ output }) => output.value === request.input.value && output.tenant === request.caller.tenant);
        assert.equal(commits.length, 1);
        const receipt = commits[0].receipt;
        assert.equal(receipt.outcome, 'succeeded');
        assert.deepEqual(receipt.caller, request.caller);
        assert.equal(
            (await run(sql`SELECT * FROM action_receipt WHERE receipt::jsonb = ${JSON.stringify(receipt)}::jsonb`))
                .length,
            1
        );
    };
    const eventFor = (barrier, request, failure = () => undefined) =>
        until(
            () => {
                assert.ifError(failure());
                return Promise.resolve(events);
            },
            (values) => values.some((event) => event.barrier === barrier && event.recordId === request.input.id)
        ).then((values) => values.find((event) => event.barrier === barrier && event.recordId === request.input.id));
    for (const signal of ['SIGTERM', 'SIGKILL']) {
        const states = await snapshots(a, b);
        let input;
        for (let i = 0; i < 200; i++) {
            input = invocation(++record);
            const shard = await request(b, {
                command: 'shard',
                entityId: JSON.stringify([input.caller.tenant, input.entityKey]),
            });
            if (states[0].ownedShards.includes(shard)) break;
        }
        await run(fixture.set('before', true));
        const inFlight = request(b, { command: 'execute', request: input });
        // Attach immediately so a broken connection cannot become an unhandled rejection.
        let rejected;
        const observed = inFlight.then(
            (value) => ({ value }),
            (error) => {
                rejected = error;
                return { error };
            }
        );
        const before = await eventFor('before', input, () => rejected);
        assert.equal(before.pid, a.pid);
        assert.equal(
            (await run(fixture.sql.a`SELECT * FROM operational_record WHERE id = ${input.input.id}`)).length,
            0
        );
        const start = Date.now();
        await stop(a, signal);
        await run(fixture.set('before', false));
        const [state] = await until(
            () => snapshots(b),
            ([s]) => s.status === 'degraded' && s.healthyRunners === 1 && s.ownedShards.length === 24
        );
        console.log(JSON.stringify({ event: 'takeover', signal, elapsedMs: Date.now() - start, pid: b.pid, state }));
        const recovered = await observed;
        assert.ifError(recovered.error);
        assert.equal(recovered.value.replayed, false);
        assert.deepEqual(recovered.value.output, { value: input.input.value, tenant: id(1) });
        await verifyCommitted(input);
        a = await launch(34561);
        await until(() => snapshots(a, b), distributed);

        const workflowInput = invocation(++record);
        await run(fixture.set('after', true));
        const executionId = await request(b, { command: 'workflow', request: workflowInput });
        lastWorkflow = { executionId, request: workflowInput };
        const after = await eventFor('after', workflowInput);
        await verifyCommitted(workflowInput);
        const victim = after.pid === a.pid ? a : b;
        const survivor = victim === a ? b : a;
        const port = victim === a ? 34561 : 34562;
        await stop(victim, signal);
        await run(fixture.set('after', false));
        await until(
            () => snapshots(survivor),
            ([s]) => s.status === 'degraded' && s.healthyRunners === 1 && s.ownedShards.length === 24
        );
        const completed = await until(
            () => request(survivor, { command: 'poll', executionId }),
            (result) => result?._tag === 'Complete'
        );
        assert.equal(completed.exit._tag, 'Success');
        assert.deepEqual(completed.exit.value, { value: workflowInput.input.value, tenant: id(1) });
        await verifyCommitted(workflowInput);
        const replay = await request(survivor, { command: 'execute', request: workflowInput });
        assert.equal(replay.replayed, true);
        const replacement = await launch(port);
        if (victim === a) a = replacement;
        else b = replacement;
        await until(() => snapshots(a, b), distributed);
        console.log(JSON.stringify({ event: 'transaction-and-workflow-recovery-passed', signal, executionId }));
    }
    const security = invocation(++record);
    const states = await snapshots(a, b);
    const routed = [];
    for (const state of states) {
        for (let i = 0; i < 200; i++) {
            const candidate = { ...security, entityKey: `race:${state.ownedShards[0]}:${i}` };
            const shard = await request(b, {
                command: 'shard',
                entityId: JSON.stringify([candidate.caller.tenant, candidate.entityKey]),
            });
            if (state.ownedShards.includes(shard)) {
                routed.push(candidate);
                break;
            }
        }
    }
    assert.equal(routed.length, 2);
    // Different entity addresses on different processes cannot rely on a
    // serial mailbox to enforce the business idempotency key.
    const racing = await Promise.all([
        request(b, { command: 'execute', request: routed[0] }),
        request(a, { command: 'execute', request: routed[1] }),
    ]);
    assert.deepEqual(racing.map(({ replayed }) => replayed).sort(), [false, true]);
    assert.deepEqual(racing[0].output, racing[1].output);
    const first = racing[0];
    await assert.rejects(
        request(a, { command: 'execute', request: { ...security, input: { ...security.input, value: -1 } } })
    );
    await assert.rejects(
        request(a, { command: 'execute', request: { ...security, caller: { ...security.caller, tenant: id(2) } } })
    );
    await assert.rejects(request(a, { command: 'execute', request: { ...security, action: 'fixture.admin' } }));
    for (const [gate, closed, open] of [
        ['identity', false, true],
        ['permission', false, true],
        ['approval', true, false],
    ]) {
        await run(fixture.set(gate, closed));
        await assert.rejects(request(a, { command: 'execute', request: security }));
        await run(fixture.set(gate, open));
    }
    const other = { ...security, caller: caller(2) };
    const secondTenant = await request(a, { command: 'execute', request: other });
    assert.deepEqual(secondTenant.output, { value: security.input.value, tenant: id(2) });
    await verifyCommitted(security);
    await verifyCommitted(other, 'b');
    const unauditable = invocation(++record);
    await run(fixture.sql.a`ALTER TABLE action_receipt RENAME TO unavailable_receipt`);
    try {
        await assert.rejects(request(a, { command: 'execute', request: unauditable }));
    } finally {
        await run(fixture.sql.a`ALTER TABLE unavailable_receipt RENAME TO action_receipt`);
    }
    assert.equal(
        (await run(fixture.sql.a`SELECT * FROM operational_record WHERE id = ${unauditable.input.id}`)).length,
        0
    );
    console.log(JSON.stringify({ event: 'live-security-tenant-audit-and-replay-invariants-passed' }));

    await stop(a, 'SIGTERM');
    await stop(b, 'SIGTERM');
    const community = await launch(34561, 'community');
    const [single] = await until(
        () => snapshots(community),
        ([s]) => s.status === 'healthy' && s.healthyRunners === 1 && s.ownedShards.length === 24
    );
    const replay = await request(community, { command: 'execute', request: security });
    assert.equal(replay.replayed, true);
    assert.deepEqual(replay.output, first.output);
    await verifyCommitted(security);
    const persisted = await request(community, { command: 'poll', executionId: lastWorkflow.executionId });
    assert.equal(persisted._tag, 'Complete');
    assert.equal(persisted.exit._tag, 'Success');
    assert.deepEqual(persisted.exit.value, { value: lastWorkflow.request.input.value, tenant: id(1) });
    await verifyCommitted(lastWorkflow.request);
    console.log(
        JSON.stringify({
            event: 'single-host-community-and-total-process-restart-passed',
            pid: community.pid,
            state: single,
        })
    );
    console.log(JSON.stringify({ event: 'sql-cluster-conformance-passed' }));
} finally {
    await Promise.all([...children].map((child) => stop(child, 'SIGKILL')));
    await run(Scope.close(scope, Exit.void));
}
