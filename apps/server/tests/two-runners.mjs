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

// A real process/IPC harness, not actors or two layers in the parent VM.
// Intentionally not a passing CI placeholder: no bootstrap is a hard failure.
const bootstrap = process.argv[2];
if (!bootstrap) throw new Error('Phase B blocked: provide the verified SQL/action bootstrap module path.');
await access(resolve(bootstrap));
const children = new Set();
let sequence = 0;

const launch = (port) => {
    const child = fork(fileURLToPath(new URL('./runner-process.mjs', import.meta.url)), [resolve(bootstrap)], {
        env: {
            ...process.env,
            EVENTIVA_CLUSTER_PROFILE: JSON.stringify({
                edition: 'cloud',
                expectedRunners: 2,
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
    let a = await launch(34561);
    const b = await launch(34562);
    assert.notEqual(a.pid, b.pid);
    assert.notEqual(a.pid, process.pid);
    const distribution = await until(() => snapshots(a, b), distributed);
    console.log(JSON.stringify({ event: 'distribution', pids: [a.pid, b.pid], states: distribution }));
    for (const signal of ['SIGTERM', 'SIGKILL']) {
        const start = Date.now();
        await stop(a, signal);
        const [state] = await until(
            () => snapshots(b),
            ([s]) => s.status === 'degraded' && s.healthyRunners === 1 && s.ownedShards.length === 24
        );
        console.log(JSON.stringify({ event: 'takeover', signal, elapsedMs: Date.now() - start, pid: b.pid, state }));
        if (signal === 'SIGTERM') {
            a = await launch(34561);
            await until(() => snapshots(a, b), distributed);
        }
    }
    console.log(JSON.stringify({ event: 'ownership-probe-passed', persistedBusinessRecovery: 'NOT_TESTED' }));
} finally {
    await Promise.all([...children].map((child) => stop(child, 'SIGKILL')));
}
