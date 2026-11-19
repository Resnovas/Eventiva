/**
 * @file apps/server/tests/module-run-handover.mjs
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
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { Effect, Exit, Scope } from 'effect';
import { caller, id, prepare } from './module-run-fixture.mjs';

const run = Effect.runPromise;
const scope = await run(Scope.make());
const fixture = await run(
    prepare.pipe(
        Effect.provideService(Scope.Scope, scope),
        Effect.onError(() => Scope.close(scope, Exit.void))
    )
);
const children = new Set();
const events = [];
let sequence = 0;
const until = async (read, predicate) => {
    const deadline = Date.now() + 90000;
    while (Date.now() < deadline) {
        const value = await read();
        if (predicate(value)) return value;
        await delay(100);
    }
    throw new Error('Module run convergence timed out');
};
const launch = async (port, options = {}) => {
    const child = fork(fileURLToPath(new URL('./module-run-process.mjs', import.meta.url)), [], {
        env: {
            ...process.env,
            ...fixture.env,
            ...options,
            EVENTIVA_CLUSTER_PROFILE: JSON.stringify({
                edition: 'community',
                expectedRunners: 1,
                shards: 24,
                port,
                assignmentRefreshMs: 250,
                healthCheckMs: 250,
                lockRefreshMs: 500,
                lockExpiryMs: 2500,
                drainMs: 1000,
            }),
        },
        stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
    });
    children.add(child);
    child.on('message', (event) => events.push({ pid: child.pid, ...event }));
    child.once('exit', () => children.delete(child));
    await until(
        () => Promise.resolve(events),
        (all) => all.some((event) => event.pid === child.pid && event.ready)
    );
    return child;
};
const request = (child, command, input) =>
    new Promise((resolve, reject) => {
        const key = ++sequence;
        const cleanup = () => {
            clearTimeout(timer);
            child.off('message', message);
            child.off('exit', exit);
        };
        const message = (value) => {
            if (value.id !== key) return;
            cleanup();
            if (value.error) reject(new Error(value.error));
            else resolve(value.value);
        };
        const exit = () => {
            cleanup();
            reject(new Error('Module runner exited during request'));
        };
        const timer = setTimeout(() => {
            cleanup();
            reject(new Error('Module runner response timed out'));
        }, 90000);
        child.on('message', message);
        child.once('exit', exit);
        child.send({ id: key, command, request: input });
    });
const stop = (child) =>
    new Promise((resolve) => {
        child.once('exit', resolve);
        child.kill('SIGKILL');
    });
const input = (n) => ({
    caller: caller(),
    runId: id(n),
    definition: 'module-v1',
    steps: [
        {
            _tag: 'Action',
            action: 'fixture.pinned',
            entityKey: `module:${n}:1`,
            input: { _tag: 'Literal', value: { id: id(n + 1), value: 13 } },
        },
        { _tag: 'Action', action: 'fixture.pinned', entityKey: `module:${n}:2`, input: { _tag: 'Previous' } },
    ],
});
const owner = async (runId) =>
    (await run(fixture.sql.a`SELECT owner, epoch FROM module_run_owner WHERE run_id = ${runId}`))[0];
const gate = (runId, enabled) =>
    run(
        fixture.sql
            .c`INSERT INTO fixture_run_gate VALUES (${runId}, 2, ${enabled}) ON CONFLICT (run_id) DO UPDATE SET enabled = ${enabled}`
    );

try {
    let a = await launch(34671);
    const accepted = input(9100);
    await gate(accepted.runId, true);
    await request(a, 'start', accepted);
    await until(
        () => Promise.resolve(events),
        (all) => all.some((event) => event.barrier === 'module-between' && event.runId === accepted.runId)
    );
    const firstOwner = await owner(accepted.runId);
    assert.equal(Number(firstOwner.epoch), 1);
    const snapshot = (
        await run(fixture.sql.a`SELECT snapshot FROM module_run_snapshot WHERE run_id = ${accepted.runId}`)
    )[0].snapshot;
    assert.equal((await run(fixture.sql.a`SELECT * FROM action_commit WHERE result IS NOT NULL`)).length, 1);
    const originalPid = a.pid;
    await stop(a);
    // A completely separate process has a newer default but retains the old executable and provider configuration.
    const b = await launch(34672, { MODULE_RUN_NEW_DEFAULT: 'true' });
    await until(
        () => owner(accepted.runId),
        (row) => Number(row?.epoch) > 1
    );
    await gate(accepted.runId, false);
    const reference = { caller: caller(), runId: accepted.runId };
    const result = await until(
        () => request(b, 'poll', reference),
        (value) => value.state !== 'pending'
    );
    assert.deepEqual(result, { state: 'succeeded', output: { id: id(9103), value: 121 } });
    assert.equal(
        (await run(fixture.sql.a`SELECT snapshot FROM module_run_snapshot WHERE run_id = ${accepted.runId}`))[0]
            .snapshot,
        snapshot
    );
    const entries = await run(fixture.sql.c`SELECT * FROM module_entry ORDER BY value`);
    assert.deepEqual(
        entries.map((entry) => [entry.pid, entry.version, entry.value]),
        [
            [originalPid, '1.0.0', 13],
            [b.pid, '1.0.0', 40],
        ]
    );
    assert.equal((await run(fixture.sql.a`SELECT * FROM transition_history`)).length, 2);
    assert.equal((await run(fixture.sql.a`SELECT * FROM command_outbox`)).length, 2);
    assert.equal((await run(fixture.sql.a`SELECT * FROM action_commit WHERE result IS NOT NULL`)).length, 2);
    assert.equal((await run(fixture.sql.a`SELECT * FROM agent_output_event`)).length, 2);
    await request(b, 'start', accepted);
    await assert.rejects(
        request(b, 'start', {
            ...accepted,
            steps: [{ ...accepted.steps[0], input: { _tag: 'Literal', value: { id: id(9101), value: 17 } } }],
        })
    );
    assert.equal((await run(fixture.sql.c`SELECT * FROM module_entry`)).length, 2);
    console.log(
        JSON.stringify({
            event: 'exact-old-artifact-recovered-under-new-default',
            pids: [originalPid, b.pid],
            output: result.output,
            epoch: Number((await owner(accepted.runId)).epoch),
        })
    );

    // Both processes remain alive for explicit tenant transfer; no membership-change fence is presumed.
    a = await launch(34671, { MODULE_RUN_NEW_DEFAULT: 'true' });
    const retained = await owner(accepted.runId);
    const oldFence = {
        tenant: caller().tenant,
        runId: accepted.runId,
        owner: retained.owner,
        epoch: Number(retained.epoch),
    };
    const current = await request(a, 'claim', {
        runId: accepted.runId,
        epoch: oldFence.epoch,
        owner: `explicit:${a.pid}`,
    });
    const invocation = {
        caller: caller(),
        entityKey: accepted.steps[0].entityKey,
        action: 'fixture.pinned',
        input: accepted.steps[0].input.value,
        intent: { idempotencyKey: `${accepted.runId}:1` },
        fence: current,
    };
    assert.equal((await request(a, 'stale', invocation)).output.value, 40);
    // Prime the persisted transport reply, then transfer again. An identical transport request must now fail too.
    const latest = await request(b, 'claim', {
        runId: accepted.runId,
        epoch: current.epoch,
        owner: `explicit:${b.pid}`,
    });
    await assert.rejects(request(a, 'stale', invocation), /stale-attempt/);
    await assert.rejects(
        request(a, 'stale', { ...invocation, entityKey: 'fresh-mailbox', fence: oldFence }),
        /stale-attempt/
    );
    await assert.rejects(
        request(a, 'output', {
            event: { runId: accepted.runId, eventId: 'stale-output', payload: { _tag: 'StepCompleted', stepIndex: 3 } },
            fence: current,
        })
    );
    assert.equal((await request(b, 'stale', { ...invocation, fence: latest })).output.value, 40);
    assert.equal((await run(fixture.sql.a`SELECT * FROM action_commit WHERE result IS NOT NULL`)).length, 2);
    assert.equal((await run(fixture.sql.c`SELECT * FROM module_entry`)).length, 2);
    console.log(
        JSON.stringify({
            event: 'live-independent-old-owner-and-cached-transport-fenced',
            pids: [a.pid, b.pid],
            epoch: latest.epoch,
        })
    );
    await Promise.all([...children].map(stop));
    for (const [index, missing] of [
        'MODULE_RUN_MISSING',
        'MODULE_RUN_PROVIDER_MISMATCH',
        'MODULE_RUN_SCHEMA_MISMATCH',
    ].entries()) {
        const before = await launch(34671);
        const candidate = input(9200 + index * 100);
        await gate(candidate.runId, true);
        await request(before, 'start', candidate);
        await until(
            () => Promise.resolve(events),
            (all) => all.some((event) => event.barrier === 'module-between' && event.runId === candidate.runId)
        );
        const rawCount = (await run(fixture.sql.c`SELECT * FROM module_entry`)).length;
        const pinned = (
            await run(fixture.sql.a`SELECT snapshot FROM module_run_snapshot WHERE run_id = ${candidate.runId}`)
        )[0].snapshot;
        await stop(before);
        const after = await launch(34672, { MODULE_RUN_NEW_DEFAULT: 'true', [missing]: 'true' });
        const refused = await until(
            () => request(after, 'poll', { caller: caller(), runId: candidate.runId }),
            (value) => value.state !== 'pending'
        );
        assert.deepEqual(refused, { state: 'failed' });
        await assert.rejects(request(after, 'start', candidate), /recovery-required/);
        assert.equal(Number((await owner(candidate.runId)).epoch), 1);
        assert.equal((await run(fixture.sql.c`SELECT * FROM module_entry`)).length, rawCount);
        assert.equal(
            (await run(fixture.sql.a`SELECT snapshot FROM module_run_snapshot WHERE run_id = ${candidate.runId}`))[0]
                .snapshot,
            pinned
        );
        console.log(
            JSON.stringify({
                event: 'restart-recovery-required-no-repin',
                reason: missing,
                pids: [before.pid, after.pid],
                epoch: 1,
            })
        );
        await stop(after);
    }
    console.log(JSON.stringify({ event: 'module-run-conformance-passed' }));
} finally {
    await Promise.all([...children].map(stop));
    await run(Scope.close(scope, Exit.void));
}
