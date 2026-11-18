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
import { performance } from 'node:perf_hooks';
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
    let lastAgent;
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
        const commits = (await run(sql`SELECT key, result FROM action_commit WHERE result IS NOT NULL`))
            .filter(({ key }) => JSON.parse(JSON.parse(key).at(-1)).at(-1) === request.intent.idempotencyKey)
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
    const agentInput = (n, tenant = 1) => ({
        caller: caller(tenant),
        runId: id(n + 10000),
        definition: 'scripted-v1',
        steps: [
            { _tag: 'Model', input: { _tag: 'Literal', value: { id: id(n), seed: 11 } } },
            { _tag: 'Action', action: 'fixture.change', entityKey: `agent:${n}`, input: { _tag: 'Previous' } },
            { _tag: 'Model', input: { _tag: 'Previous' } },
        ],
    });
    const agentEvent = (input, pid) =>
        until(
            () => Promise.resolve(events),
            (values) =>
                values.some(
                    (event) =>
                        event.barrier === 'agent-between' &&
                        event.runId === input.runId &&
                        (pid === undefined || event.pid === pid)
                )
        ).then((values) =>
            values.find(
                (event) =>
                    event.barrier === 'agent-between' &&
                    event.runId === input.runId &&
                    (pid === undefined || event.pid === pid)
            )
        );
    const gateAgent = (input, step = 3) =>
        run(fixture.sql.c`INSERT INTO fixture_run_gate VALUES (${input.runId}, ${step}, true)`);
    const releaseAgent = (input) =>
        run(fixture.sql.c`UPDATE fixture_run_gate SET enabled = false WHERE run_id = ${input.runId}`);
    const agentEntries = (input) =>
        run(
            fixture.sql
                .c`SELECT step, pid, business_key FROM fixture_agent_entry WHERE tenant = ${input.caller.tenant} AND run_id = ${input.runId} ORDER BY sequence`
        );
    const counts = (entries) => [1, 2, 3].map((step) => entries.filter((entry) => entry.step === step).length);
    const page = (runner, input, after = -1, limit = 2) =>
        request(runner, {
            command: 'agentOutput',
            request: { caller: input.caller, runId: input.runId, after, limit },
        });
    const expectedOutput = [
        { _tag: 'Text', text: 'scripted:1:0' },
        { _tag: 'Text', text: 'scripted:1:1' },
        { _tag: 'StepCompleted', stepIndex: 1 },
        { _tag: 'StepCompleted', stepIndex: 2 },
        { _tag: 'Text', text: 'scripted:3:0' },
        { _tag: 'Text', text: 'scripted:3:1' },
        { _tag: 'StepCompleted', stepIndex: 3 },
    ];
    const reconstruct = async (runner, input, consumed = []) => {
        const result = [...consumed];
        for (;;) {
            const events = await page(runner, input, result.at(-1)?.offset ?? -1);
            assert.ok(events.length <= 2);
            if (events.length === 0) break;
            result.push(...events);
        }
        assert.deepEqual(
            result.map(({ offset }) => offset),
            [0, 1, 2, 3, 4, 5, 6]
        );
        assert.equal(new Set(result.map(({ eventId }) => eventId)).size, 7);
        assert.deepEqual(
            result.map(({ payload }) => payload),
            expectedOutput
        );
        for (const event of result) {
            assert.equal(event.runId, input.runId);
            assert.equal(event.tenant, input.caller.tenant);
        }
        assert.ok(!JSON.stringify(result).includes('raw-prompt-canary'));
        return result;
    };
    const assertAgent = async (runner, input, expected = [1, 1, 1]) => {
        const result = await until(
            () => request(runner, { command: 'agentStatus', request: input }),
            (value) => value.state !== 'pending'
        );
        assert.deepEqual(result, { state: 'succeeded', output: { answer: 172, tenant: input.caller.tenant } });
        const entries = await agentEntries(input);
        assert.deepEqual(counts(entries), expected);
        assert.deepEqual(
            entries.map(({ step }) => step),
            expected.flatMap((count, index) => Array(count).fill(index + 1))
        );
        for (const entry of entries) assert.equal(entry.business_key, `${input.runId}:${entry.step}`);
        await verifyCommitted({
            caller: input.caller,
            input: { id: input.steps[0].input.value.id, value: 34 },
            intent: { idempotencyKey: `${input.runId}:2` },
        });
        await reconstruct(runner, input);
        return result;
    };
    const checkpoint = async (input, executionId) => {
        const event = await agentEvent(input);
        assert.deepEqual(counts(await agentEntries(input)), [1, 1, 0]);
        // Inspect the actual SQL-backed Activity reply, not just business dedup or an IPC log.
        const replies = await run(
            fixture.sql
                .c`SELECT r.payload FROM cluster_messages m JOIN cluster_replies r ON r.id = m.last_reply_id WHERE m.entity_type = 'Workflow/EventivaAgentRun-v1' AND m.entity_id = ${executionId} AND m.tag = 'activity' AND m.payload::jsonb ->> 'name' = 'step:2:Action'`
        );
        assert.equal(replies.length, 1);
        assert.equal(JSON.parse(replies[0].payload)._tag, 'Success');
        assert.equal(JSON.parse(replies[0].payload).value._tag, 'Complete');
        assert.equal(JSON.parse(replies[0].payload).value.exit._tag, 'Success');
        return event;
    };
    const control = agentInput(++record);
    const controlId = await request(b, { command: 'agentStart', request: control });
    const noFault = await assertAgent(b, control);
    assert.equal(await request(a, { command: 'agentStart', request: control }), controlId);
    assert.deepEqual(counts(await agentEntries(control)), [1, 1, 1]);
    await assert.rejects(
        request(a, {
            command: 'agentStart',
            request: {
                ...control,
                steps: [{ _tag: 'Model', input: { _tag: 'Literal', value: -1 } }],
            },
        }),
        /conflict/
    );
    await assert.rejects(
        request(a, { command: 'agentStatus', request: { ...control, caller: { ...caller(), tenant: id(2) } } }),
        /denied/
    );
    await assert.rejects(request(a, { command: 'agentStatus', request: { ...control, caller: caller(2) } }), /missing/);
    await assert.rejects(
        request(a, {
            command: 'agentStart',
            request: { ...agentInput(++record), steps: [{ _tag: 'Model', input: { _tag: 'Previous' } }] },
        }),
        /invalid/
    );
    await assert.rejects(
        request(a, { command: 'agentStart', request: { ...agentInput(++record), definition: 'module-latest' } })
    );
    await assert.rejects(
        request(a, {
            command: 'agentStart',
            request: { ...agentInput(++record), steps: [{ _tag: 'Action', action: '', input: {} }] },
        })
    );
    // Kill the actual model Activity owner after two committed chunks, before its durable Activity reply.
    const midOutput = agentInput(++record);
    midOutput.steps[0].input.value.prompt = 'raw-prompt-canary';
    await run(fixture.sql.c`INSERT INTO fixture_output_gate VALUES (${midOutput.runId}, true)`);
    const midExecution = await request(b, { command: 'agentStart', request: midOutput });
    const outputBarrier = async (pid) =>
        (
            await until(
                () => Promise.resolve(events),
                (values) =>
                    values.some(
                        (event) =>
                            event.barrier === 'agent-output-persisted' &&
                            event.runId === midOutput.runId &&
                            (pid === undefined || event.pid === pid)
                    )
            )
        ).find(
            (event) =>
                event.barrier === 'agent-output-persisted' &&
                event.runId === midOutput.runId &&
                (pid === undefined || event.pid === pid)
        );
    const outputPersisted = await outputBarrier();
    const prefix = await page(b, midOutput);
    assert.deepEqual(
        prefix.map(({ offset }) => offset),
        [0, 1]
    );
    assert.deepEqual(
        prefix.map(({ payload }) => payload),
        expectedOutput.slice(0, 2)
    );
    const unfinished = await run(fixture.sql
        .c`SELECT r.payload FROM cluster_messages m JOIN cluster_replies r ON r.id = m.last_reply_id
        WHERE m.entity_type = 'Workflow/EventivaAgentRun-v1' AND m.entity_id = ${midExecution} AND m.tag = 'activity' AND m.payload::jsonb ->> 'name' = 'step:1:Model'`);
    assert.equal(
        unfinished.some((row) => JSON.parse(row.payload).value?._tag === 'Complete'),
        false
    );
    const victim = outputPersisted.pid === a.pid ? a : b;
    const survivor = victim === a ? b : a;
    const replacementPort = victim === a ? 34561 : 34562;
    assert.equal(victim.pid, outputPersisted.pid);
    await stop(victim, 'SIGKILL');
    await until(
        () => snapshots(survivor),
        ([state]) => state.healthyRunners === 1 && state.ownedShards.length === 24
    );
    await outputBarrier(survivor.pid);
    assert.deepEqual(counts(await agentEntries(midOutput)), [2, 0, 0]);
    assert.deepEqual(await page(survivor, midOutput), prefix);
    assert.deepEqual(await page(survivor, midOutput, 1), []);
    const waitingOutput = request(survivor, {
        command: 'agentOutputPoll',
        request: {
            caller: midOutput.caller,
            runId: midOutput.runId,
            after: 1,
            limit: 2,
        },
    });
    await run(fixture.sql.c`UPDATE fixture_output_gate SET enabled = false WHERE run_id = ${midOutput.runId}`);
    await assertAgent(survivor, midOutput, [2, 1, 1]);
    await reconstruct(survivor, midOutput, [...prefix, ...(await waitingOutput)]);
    console.log(
        JSON.stringify({
            event: 'agent-output-owner-kill-reconnect-passed',
            signal: 'SIGKILL',
            owner: outputPersisted.pid,
            survivor: survivor.pid,
            cursor: 1,
            offsets: [0, 1, 2, 3, 4, 5, 6],
            counts: [2, 1, 1],
            activityReplyBeforeKill: false,
        })
    );
    const outputReplacement = await launch(replacementPort);
    if (victim === a) a = outputReplacement;
    else b = outputReplacement;
    await until(() => snapshots(a, b), distributed);
    await assert.rejects(page(a, { ...control, caller: { ...caller(), tenant: id(2) } }), /denied/);
    await assert.rejects(page(a, { ...control, caller: caller(2) }), /missing/);
    for (const signal of ['SIGKILL', 'SIGTERM']) {
        const input = agentInput(++record);
        await gateAgent(input);
        const executionId = await request(b, { command: 'agentStart', request: input });
        const between = await checkpoint(input, executionId);
        // The handler remains responsive while its Workflow is busy at the checkpoint.
        assert.deepEqual(await request(b, { command: 'agentStatus', request: input }), { state: 'pending' });
        const victim = between.pid === a.pid ? a : b;
        const survivor = victim === a ? b : a;
        const port = victim === a ? 34561 : 34562;
        assert.equal(victim.pid, between.pid);
        await stop(victim, signal);
        await until(
            () => snapshots(survivor),
            ([s]) => s.status === 'degraded' && s.healthyRunners === 1 && s.ownedShards.length === 24
        );
        // No Start, resume or victim restart: the recovered orchestration must reach the barrier itself.
        await agentEvent(input, survivor.pid);
        assert.deepEqual(counts(await agentEntries(input)), [1, 1, 0]);
        await releaseAgent(input);
        assert.deepEqual(await assertAgent(survivor, input), noFault);
        const entries = await agentEntries(input);
        assert.equal(entries[2].pid, survivor.pid);
        assert.notEqual(entries[2].pid, between.pid);
        lastAgent = input;
        console.log(
            JSON.stringify({
                event:
                    'agent-run resumes after ' +
                    signal +
                    ' between completed steps 2 and 3 without re-executing completed Activities',
                executionId,
                before: [1, 1, 0],
                after: counts(entries),
                owner: between.pid,
                survivor: survivor.pid,
                entries,
            })
        );
        const replacement = await launch(port);
        if (victim === a) a = replacement;
        else b = replacement;
        await until(() => snapshots(a, b), distributed);
    }
    for (const [gate, closed, open] of [
        ['identity', false, true],
        ['permission', false, true],
        ['approval', true, false],
    ]) {
        const input = agentInput(++record);
        await gateAgent(input, 2);
        await request(b, { command: 'agentStart', request: input });
        await agentEvent(input);
        assert.deepEqual(counts(await agentEntries(input)), [1, 0, 0]);
        await run(fixture.set(gate, closed));
        for (const command of ['agentStatus', 'agentStart', 'agentInterrupt'])
            await assert.rejects(request(a, { command, request: control }), /denied/);
        await assert.rejects(page(a, control), /denied/);
        await releaseAgent(input);
        // Durable failed Workflow result is internal evidence while control access is revoked.
        await until(
            () =>
                run(
                    fixture.sql
                        .c`SELECT r.payload FROM cluster_messages m JOIN cluster_replies r ON r.id = m.last_reply_id WHERE m.entity_type = 'Workflow/EventivaAgentRun-v1' AND m.tag = 'run' AND m.payload::jsonb -> 'accepted' ->> 'runId' = ${input.runId}`
                ),
            (rows) => rows.some((row) => JSON.parse(row.payload).value?._tag === 'Complete')
        );
        await run(fixture.set(gate, open));
        assert.deepEqual(await request(a, { command: 'agentStatus', request: input }), { state: 'failed' });
        assert.deepEqual(counts(await agentEntries(input)), [1, 0, 0]);
        assert.equal(
            (await run(fixture.sql.a`SELECT * FROM operational_record WHERE id = ${input.steps[0].input.value.id}`))
                .length,
            0
        );
    }
    const interrupted = agentInput(++record);
    const independent = agentInput(++record);
    assert.deepEqual(independent.caller, interrupted.caller);
    assert.notEqual(independent.runId, interrupted.runId);
    await gateAgent(interrupted, 2);
    await gateAgent(independent, 2);
    const interruptedId = await request(b, { command: 'agentStart', request: interrupted });
    const independentId = await request(a, { command: 'agentStart', request: independent });
    await agentEvent(interrupted);
    await agentEvent(independent);
    const interruptSignals = () =>
        run(
            fixture.sql
                .c`SELECT entity_id, payload FROM cluster_messages WHERE entity_type = 'Workflow/EventivaAgentRun-v1' AND entity_id IN (${interruptedId}, ${independentId}) AND tag = 'deferred' AND payload::jsonb ->> 'name' = 'Workflow/InterruptSignal'`
        );
    // Warm routing and establish healthy membership before timing, never retry a slow measurement.
    assert.ok(distributed(await snapshots(a, b)));
    for (const input of [interrupted, independent]) {
        assert.deepEqual(await request(a, { command: 'agentStatus', request: input }), { state: 'pending' });
        await assert.rejects(
            request(b, {
                command: 'agentInterrupt',
                request: { ...input, caller: { ...input.caller, tenant: id(2) } },
            }),
            /denied/
        );
    }
    assert.deepEqual(await interruptSignals(), []);
    const started = performance.now();
    let deadline;
    let interruptAcknowledgementMs;
    try {
        // Bound the real authorized IPC -> RPC -> persisted signal -> reply, not a local mock.
        await Promise.race([
            request(a, { command: 'agentInterrupt', request: interrupted }),
            new Promise((_, reject) => {
                deadline = setTimeout(() => reject(new Error('Busy Interrupt acknowledgement exceeded 1000 ms')), 1000);
            }),
        ]);
        interruptAcknowledgementMs = performance.now() - started;
        assert.ok(interruptAcknowledgementMs < 1000, `Busy Interrupt acknowledged in ${interruptAcknowledgementMs} ms`);
    } finally {
        clearTimeout(deadline);
    }
    // Acknowledgement means signal submission persisted for this exact run, not completed cancellation.
    const signals = await interruptSignals();
    assert.equal(signals.length, 1);
    assert.equal(signals[0].entity_id, interruptedId);
    for (const input of [interrupted, independent]) {
        assert.deepEqual(counts(await agentEntries(input)), [1, 0, 0]);
        assert.deepEqual(await request(b, { command: 'agentStatus', request: input }), { state: 'pending' });
    }
    console.log(
        JSON.stringify({
            event: 'agent-run-busy-control-responsive',
            interruptAcknowledgementMs,
            boundMs: 1000,
            signalExecutionId: interruptedId,
            independentExecutionId: independentId,
            beforeRelease: [1, 0, 0],
            acknowledgement: 'persisted-signal-submission-not-cancellation-completion',
        })
    );
    // The other run in the identical session remains usable and commits its business effect once.
    await releaseAgent(independent);
    await assertAgent(a, independent);
    // Cluster 0.60.5 reads the signal on suspension/failure, not by cancelling busy work.
    await releaseAgent(interrupted);
    assert.deepEqual(await assertAgent(b, interrupted), noFault);
    assert.deepEqual(await request(b, { command: 'agentStatus', request: independent }), noFault);
    assert.deepEqual(counts(await agentEntries(independent)), [1, 1, 1]);
    console.log(
        JSON.stringify({
            event: 'agent-run-busy-control-release-passed',
            state: 'succeeded',
            output: 172,
            signalledCounts: counts(await agentEntries(interrupted)),
            independentCounts: counts(await agentEntries(independent)),
        })
    );
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

    // An in-flight checkpoint, not only an already-completed run, survives a full edition restart.
    const restartingAgent = agentInput(++record);
    await gateAgent(restartingAgent);
    const restartingId = await request(b, { command: 'agentStart', request: restartingAgent });
    await checkpoint(restartingAgent, restartingId);
    await stop(a, 'SIGTERM');
    await stop(b, 'SIGTERM');
    const community = await launch(34561, 'community');
    const [single] = await until(
        () => snapshots(community),
        ([s]) => s.status === 'healthy' && s.healthyRunners === 1 && s.ownedShards.length === 24
    );
    await agentEvent(restartingAgent, community.pid);
    assert.deepEqual(counts(await agentEntries(restartingAgent)), [1, 1, 0]);
    await releaseAgent(restartingAgent);
    await assertAgent(community, restartingAgent);
    await assertAgent(community, lastAgent);
    assert.equal(await request(community, { command: 'agentStart', request: control }), controlId);
    await assert.rejects(
        request(community, {
            command: 'agentStart',
            request: { ...control, steps: [{ _tag: 'Model', input: { _tag: 'Literal', value: 99 } }] },
        }),
        /conflict/
    );
    await assertAgent(community, control);
    console.log(
        JSON.stringify({ event: 'agent-run-negative-controls-and-community-restart-passed', counts: [1, 1, 1] })
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
