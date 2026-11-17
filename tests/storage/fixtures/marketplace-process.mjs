/**
 * @file tests/storage/fixtures/marketplace-process.mjs
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
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { SqliteClient } from '@effect/sql-sqlite-node';
import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Flags } from '@eventiva/contracts/flags';
import {
    MarketplaceAdministration,
    MarketplaceOperatorPolicy,
    MarketplaceOutbox,
} from '@eventiva/contracts/marketplace-durable';
import {
    MarketplaceAuthority,
    MarketplaceStore,
    ParticipantGrant,
    SnapshotReference,
} from '@eventiva/contracts/marketplace';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { marketplace } from '@eventiva/integrations.sql/marketplace';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { IdentityResolver } from '@eventiva/runtime/invocation';
import { stageExchange } from '@eventiva/runtime/marketplace';
import { Cause, ConfigProvider, Context, Deferred, Effect, Exit, FiberSet, Layer, Schema, Scope } from 'effect';

// Synthetic live policy only. This fixture neither releases payloads nor invokes a remote sink.
const namespace = Number(process.argv[5] ?? 0);
const id = (n) => `019b0000-0000-7000-8000-${(namespace + n).toString(16).padStart(12, '0')}`;
const caller = Schema.decodeUnknownSync(CallerIdentity)({
    subject: id(1),
    session: id(2),
    tenant: id(3),
    kind: 'human',
});
const snapshot = Schema.decodeUnknownSync(SnapshotReference)({
    id: id(4),
    scope: {
        exchange: id(5),
        ownerTenant: caller.tenant,
        recipientTenant: id(6),
        resource: id(7),
        purpose: 'quote-review',
    },
    sourceRecord: id(8),
    sourceVersion: 3,
    classification: 'restricted',
});
const provision = {
    request: id(9),
    snapshot,
    grant: Schema.decodeUnknownSync(ParticipantGrant)({
        id: id(10),
        scope: snapshot.scope,
        participantTenant: caller.tenant,
        subject: caller.subject,
        action: 'stage',
        expiresAt: 4102444800000,
        revoked: false,
    }),
};
const command = {
    command: id(11),
    snapshot: snapshot.id,
    scope: snapshot.scope,
    grant: provision.grant.id,
    expectedVersion: 3,
};
const claimRequest = { command: command.command, leaseMs: 2000, maxAttempts: 3 };
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
    assert.ok(admin ? url.pathname === '/eventiva_test' : /^\/marketplace_process_[a-f0-9]+$/.test(url.pathname));
    return url;
};
const scope = await Effect.runPromise(Scope.make());
const run = (effect) => Effect.runPromise(effect.pipe(Scope.extend(scope)));
const connect = (dialect, target) =>
    Layer.build(dialect === 'sqlite' ? SqliteClient.layer({ filename: target }) : pg(checked(target).href));
const services = (dialect, sql) =>
    Layer.build(marketplace(dialect).pipe(Layer.provide(Layer.succeed(SqlClient.SqlClient, sql))));
const authorized = (context) =>
    context.pipe(
        Context.add(Caller, caller),
        Context.add(CurrentTenant, { id: snapshot.scope.ownerTenant }),
        Context.add(Flags, {
            evaluate: (flag) => Effect.succeed({ flag: flag.key, value: true, fallback: false, reason: 'TEST' }),
        }),
        Context.add(IdentityResolver, { resolve: (presented) => Effect.succeed(presented) }),
        Context.add(MarketplaceOperatorPolicy, { authorize: () => Effect.void }),
        Context.add(MarketplaceAuthority, { authorize: () => Effect.void })
    );
const [role, dialect, target] = process.argv.slice(2);
assert.ok(['sqlite', 'postgres'].includes(dialect));

if (role === 'worker') {
    const sql = Context.get(await run(connect(dialect, target)), SqlClient.SqlClient);
    const context = authorized(await run(services(dialect, sql)));
    const store = Context.get(context, MarketplaceStore);
    const outbox = Context.get(context, MarketplaceOutbox);
    const admin = Context.get(context, MarketplaceAdministration);
    const tasks = await run(FiberSet.make());
    const runFork = await run(FiberSet.runtime(tasks)());
    const barrier = (name, value) =>
        Effect.gen(function* () {
            process.send({ barrier: name, value });
            yield* Deferred.await(yield* Deferred.make());
        });
    process.on('message', (message) => {
        let operation;
        if (message.command === 'stage') {
            const wrapped = MarketplaceStore.of({
                transaction: (use) =>
                    store.transaction((tx) =>
                        use({
                            ...tx,
                            enqueue: (intent) =>
                                tx.enqueue(intent).pipe(Effect.zipRight(barrier('before-commit', undefined))),
                        })
                    ),
            });
            operation = stageExchange(command).pipe(
                Effect.provide(
                    message.phase === 'before' ? context.pipe(Context.add(MarketplaceStore, wrapped)) : context
                ),
                Effect.tap((value) => (message.phase === 'after' ? barrier('after-commit', value) : Effect.void))
            );
        } else if (message.command === 'claim') {
            operation = outbox.claim({ ...claimRequest, leaseMs: message.leaseMs ?? claimRequest.leaseMs }).pipe(
                Effect.provide(context),
                Effect.tap((value) => (message.pause ? barrier('claimed', value) : Effect.void)),
                Effect.catchAll((error) => Effect.succeed(error.reason))
            );
        } else if (message.command === 'settle') {
            operation = outbox.settle(message.input).pipe(
                Effect.provide(context),
                Effect.as('settled'),
                Effect.tap((value) => (message.pause ? barrier('settled', value) : Effect.void)),
                Effect.catchAll((error) => Effect.succeed(error.reason))
            );
        } else if (message.command === 'revoke') {
            operation = admin
                .revoke({ request: id(12), grant: provision.grant.id, scope: snapshot.scope })
                .pipe(Effect.provide(context), Effect.as('revoked'));
        } else if (message.command === 'provision') {
            operation = admin.provision(provision).pipe(Effect.provide(context), Effect.as('provisioned'));
        } else if (message.command === 'inspect') {
            // Raw reads are fixture evidence only, never a participant-facing access path.
            operation = Effect.gen(function* () {
                const rows = {};
                for (const table of [
                    'marketplace_snapshot',
                    'marketplace_grant',
                    'marketplace_request',
                    'marketplace_intent',
                    'marketplace_delivery',
                    'marketplace_audit',
                    'marketplace_settlement',
                ])
                    rows[table] = yield* sql`SELECT * FROM ${sql(table)} ORDER BY 1`;
                return rows;
            });
        } else operation = Effect.die('Unknown marketplace proof command');
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
    process.send({ ready: true });
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
                if (error) reject(error);
                else resolve(value);
            };
            const check = () => {
                const message = messages.find((entry) => entry.child === child && predicate(entry.value));
                if (message) finish(undefined, message.value);
            };
            const exited = (code, signal) => finish(new Error(`Worker exited at IPC barrier: ${code}/${signal}`));
            const timer = setTimeout(() => finish(new Error('Marketplace IPC deadline exceeded')), 15000);
            child.once('exit', exited);
            listeners.add(check);
            check();
        });
    const workerPids = new Set();
    const launch = async (database, namespace = 0) => {
        const child = fork(fileURLToPath(import.meta.url), ['worker', dialect, database, String(namespace)], {
            stdio: ['ignore', 'ignore', 'inherit', 'ipc'],
        });
        assert.notEqual(child.pid, process.pid);
        assert.equal(workerPids.has(child.pid), false);
        workerPids.add(child.pid);
        children.add(child);
        child.on('message', (value) => {
            messages.push({ child, value });
            for (const check of [...listeners]) check();
        });
        await waitFor(child, (value) => value.ready);
        return child;
    };
    const request = (child, payload) => {
        const id = ++sequence;
        const response = waitFor(child, (value) => value.id === id).then((reply) => {
            assert.equal(reply.error, undefined, reply.error);
            return reply.value;
        });
        child.send({ id, ...payload });
        return response;
    };
    const stop = (child) =>
        new Promise((resolve, reject) => {
            if (child.exitCode !== null || child.signalCode !== null) {
                children.delete(child);
                return resolve();
            }
            const timer = setTimeout(() => reject(new Error('SIGKILL deadline exceeded')), 10000);
            child.once('exit', (_code, signal) => {
                clearTimeout(timer);
                children.delete(child);
                assert.equal(signal, 'SIGKILL');
                resolve();
            });
            child.kill('SIGKILL');
        });
    try {
        const root = fileURLToPath(new URL('../../../.amp/in/orb-backup/', import.meta.url));
        mkdirSync(root, { recursive: true });
        const directory = mkdtempSync(join(root, 'marketplace-process-'));
        await run(Effect.addFinalizer(() => Effect.sync(() => rmSync(directory, { recursive: true, force: true }))));
        let database = join(directory, 'marketplace.sqlite');
        if (dialect === 'postgres') {
            const adminUrl = checked(
                process.env.STORAGE_TEST_POSTGRES_URL ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test',
                true
            );
            const admin = Context.get(await run(Layer.build(pg(adminUrl.href))), SqlClient.SqlClient);
            const name = `marketplace_process_${randomUUID().replaceAll('-', '')}`;
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
        const sql = Context.get(await run(connect(dialect, database)), SqlClient.SqlClient);
        await run(
            load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url))).pipe(
                Effect.flatMap((files) => migrate(dialect, files)),
                Effect.provideService(SqlClient.SqlClient, sql)
            )
        );
        const context = authorized(await run(services(dialect, sql)));
        await run(Context.get(context, MarketplaceAdministration).provision(provision).pipe(Effect.provide(context)));
        const a = await launch(database);
        const before = request(a, { command: 'stage', phase: 'before' }).catch((error) => error.message);
        await waitFor(a, (value) => value.barrier === 'before-commit');
        await stop(a);
        assert.match(await before, /SIGKILL/);
        for (const table of ['marketplace_intent', 'marketplace_delivery'])
            assert.equal((await run(sql`SELECT * FROM ${sql(table)}`)).length, 0);
        assert.equal((await run(sql`SELECT * FROM marketplace_audit`)).length, 1);
        const b = await launch(database);
        const after = request(b, { command: 'stage', phase: 'after' }).catch((error) => error.message);
        await waitFor(b, (value) => value.barrier === 'after-commit');
        await stop(b);
        assert.match(await after, /SIGKILL/);
        assert.equal((await run(sql`SELECT * FROM marketplace_intent`)).length, 1);
        assert.equal((await run(sql`SELECT * FROM marketplace_delivery`)).length, 1);
        const c = await launch(database);
        const d = await launch(database);
        assert.deepEqual(await request(c, { command: 'stage' }), {
            command: command.command,
            grant: command.grant,
            tenant: caller.tenant,
            subject: caller.subject,
            onBehalfOf: null,
            snapshot,
            state: 'pending',
        });
        assert.equal((await run(sql`SELECT * FROM marketplace_audit`)).length, 2);
        const claimed = request(c, { command: 'claim', pause: true }).catch((error) => error.message);
        const first = (await waitFor(c, (value) => value.barrier === 'claimed')).value;
        assert.equal(first.attempt, 1);
        assert.equal(await request(d, { command: 'claim' }), undefined);
        // Only database time expires the explicitly bounded lease; no test rewrites its deadline.
        const expire = async (key = command.command) => {
            const deadline = Date.now() + 10000;
            while (Date.now() < deadline) {
                const [row] = await run(
                    dialect === 'postgres'
                        ? sql`SELECT lease_until, CAST(EXTRACT(EPOCH FROM clock_timestamp()) * 1000 AS bigint) AS now FROM marketplace_delivery WHERE command = ${key}`
                        : sql`SELECT lease_until, CAST((julianday('now') - 2440587.5) * 86400000 AS integer) AS now FROM marketplace_delivery WHERE command = ${key}`
                );
                if (Number(row.now) >= Number(row.lease_until)) return;
                await delay(10);
            }
            assert.fail('Database lease did not expire');
        };
        await stop(c);
        assert.match(await claimed, /SIGKILL/);
        await expire();
        const second = await request(d, { command: 'claim' });
        assert.equal(second.command, first.command);
        assert.notEqual(second.lease, first.lease);
        assert.equal(second.attempt, 2);
        assert.equal(
            await request(d, { command: 'settle', input: { claim: first, outcome: { state: 'recorded' } } }),
            'conflict'
        );
        const settlement = { claim: second, outcome: { state: 'recorded' } };
        const settled = request(d, { command: 'settle', input: settlement, pause: true }).catch(
            (error) => error.message
        );
        await waitFor(d, (value) => value.barrier === 'settled');
        await stop(d);
        assert.match(await settled, /SIGKILL/);
        const e = await launch(database);
        assert.equal(await request(e, { command: 'settle', input: settlement }), 'settled');
        assert.equal(
            await request(e, {
                command: 'settle',
                input: { ...settlement, outcome: { state: 'retry', availableAt: 0 } },
            }),
            'conflict'
        );
        assert.equal(await request(e, { command: 'claim' }), undefined);
        assert.equal((await run(sql`SELECT * FROM marketplace_settlement`)).length, 1);
        assert.equal((await run(sql`SELECT * FROM marketplace_audit`)).length, 5);
        assert.deepEqual(
            (await run(sql`SELECT state, attempt FROM marketplace_delivery`)).map((row) => ({
                state: row.state,
                attempt: Number(row.attempt),
            })),
            [{ state: 'recorded', attempt: 2 }]
        );
        assert.equal(await request(e, { command: 'revoke' }), 'revoked');
        await stop(e);
        const f = await launch(database);
        assert.equal(await request(f, { command: 'settle', input: settlement }), 'denied');
        assert.equal((await run(sql`SELECT * FROM marketplace_settlement`)).length, 1);
        assert.equal((await run(sql`SELECT * FROM marketplace_intent`)).length, 1);
        assert.equal((await run(sql`SELECT * FROM marketplace_audit`)).length, 6);
        await stop(f);

        // Separate grants/commands retain the original six-worker report and expose collateral denial.
        for (const [base, phase] of [
            [100, 'pending'],
            [200, 'expired-running'],
            [300, 'live-running'],
        ]) {
            const key = id(base + 11);
            const staged = await launch(database, base);
            assert.equal(await request(staged, { command: 'provision' }), 'provisioned');
            assert.equal((await request(staged, { command: 'stage' })).command, key);
            const before = await request(staged, { command: 'inspect' });
            const delivery = before.marketplace_delivery.find((row) => row.command === key);
            assert.equal(delivery.state, 'pending');
            assert.equal(Number(delivery.attempt), 0);
            let oldClaim;
            if (phase !== 'pending') {
                const claimed = request(staged, {
                    command: 'claim',
                    pause: true,
                    leaseMs: phase === 'live-running' ? 30000 : 2000,
                }).catch((error) => error.message);
                oldClaim = (await waitFor(staged, (value) => value.barrier === 'claimed')).value;
                assert.equal(oldClaim.command, key);
                assert.equal(oldClaim.attempt, 1);
                await stop(staged);
                assert.match(await claimed, /SIGKILL/);
            } else await stop(staged);

            // Revocation is committed by a different process/connection from the killed owner.
            const revoker = await launch(database, base);
            const prior = await request(revoker, { command: 'inspect' });
            assert.equal(
                prior.marketplace_delivery.find((row) => row.command === key).state,
                phase === 'pending' ? 'pending' : 'running'
            );
            for (const table of [
                'marketplace_snapshot',
                'marketplace_grant',
                'marketplace_request',
                'marketplace_intent',
                'marketplace_settlement',
            ])
                assert.deepEqual(prior[table], before[table]);
            assert.equal(await request(revoker, { command: 'revoke' }), 'revoked');
            const revoked = await request(revoker, { command: 'inspect' });
            assert.deepEqual(revoked.marketplace_intent, prior.marketplace_intent);
            assert.deepEqual(revoked.marketplace_delivery, prior.marketplace_delivery);
            assert.deepEqual(revoked.marketplace_settlement, prior.marketplace_settlement);
            assert.deepEqual(
                revoked.marketplace_grant,
                prior.marketplace_grant.map((row) => (row.id === id(base + 10) ? { ...row, revoked: 1 } : row))
            );
            const addedAudit = revoked.marketplace_audit.filter(
                (row) => !prior.marketplace_audit.some((old) => old.id === row.id)
            );
            assert.equal(addedAudit.length, 1);
            assert.equal(JSON.parse(addedAudit[0].body).operation, 'revoke');
            await stop(revoker);

            const restarted = await launch(database, base);
            assert.deepEqual(await request(restarted, { command: 'inspect' }), revoked);
            if (phase === 'expired-running') {
                await expire(key);
                // Fence validation precedes live authorization once the actual database lease expires.
                assert.equal(
                    await request(restarted, {
                        command: 'settle',
                        input: { claim: oldClaim, outcome: { state: 'recorded' } },
                    }),
                    'conflict'
                );
                assert.deepEqual(await request(restarted, { command: 'inspect' }), revoked);
            }
            if (phase === 'live-running') {
                // A still-live fence reaches authorization and is denied, rather than timing out.
                assert.equal(
                    await request(restarted, {
                        command: 'settle',
                        input: { claim: oldClaim, outcome: { state: 'recorded' } },
                    }),
                    'denied'
                );
            } else assert.equal(await request(restarted, { command: 'claim' }), 'denied');
            const blocked = await request(restarted, { command: 'inspect' });
            assert.deepEqual(
                blocked.marketplace_delivery,
                revoked.marketplace_delivery.map((row) =>
                    row.command === key ? { ...row, state: 'blocked', lease: null, lease_until: null } : row
                )
            );
            for (const table of [
                'marketplace_snapshot',
                'marketplace_grant',
                'marketplace_request',
                'marketplace_intent',
                'marketplace_settlement',
            ])
                assert.deepEqual(blocked[table], revoked[table]);
            const transition = blocked.marketplace_audit.filter(
                (row) => !revoked.marketplace_audit.some((old) => old.id === row.id)
            );
            assert.equal(transition.length, 1);
            assert.equal(JSON.parse(transition[0].body).operation, 'blocked');
            assert.equal(JSON.parse(transition[0].body).reference, key);
            assert.deepEqual(
                blocked.marketplace_audit.filter((row) => row.id !== transition[0].id),
                revoked.marketplace_audit
            );
            await stop(restarted);

            const retained = await launch(database, base);
            assert.deepEqual(await request(retained, { command: 'inspect' }), blocked);
            for (let repeat = 0; repeat < 2; repeat++) {
                assert.equal(await request(retained, { command: 'claim' }), 'denied');
                assert.equal(await request(retained, { command: 'revoke' }), 'revoked');
                if (oldClaim)
                    assert.equal(
                        await request(retained, {
                            command: 'settle',
                            input: { claim: oldClaim, outcome: { state: 'recorded' } },
                        }),
                        'conflict'
                    );
                assert.deepEqual(await request(retained, { command: 'inspect' }), blocked);
            }
            await stop(retained);
        }
        const control = await launch(database, 400);
        const beforeControl = await request(control, { command: 'inspect' });
        assert.equal(await request(control, { command: 'provision' }), 'provisioned');
        assert.equal((await request(control, { command: 'stage' })).command, id(411));
        const allowed = await request(control, { command: 'claim' });
        assert.equal(allowed.command, id(411));
        assert.equal(allowed.attempt, 1);
        assert.equal(
            await request(control, {
                command: 'settle',
                input: { claim: allowed, outcome: { state: 'recorded' } },
            }),
            'settled'
        );
        const accepted = await request(control, { command: 'inspect' });
        // Successful unrelated work cannot rewrite any revoked or previously accepted evidence.
        for (const [table, rows] of Object.entries(beforeControl)) {
            const key =
                table === 'marketplace_delivery' ? 'command' : table === 'marketplace_settlement' ? 'lease' : 'id';
            for (const row of rows)
                assert.deepEqual(
                    accepted[table].find((value) => value[key] === row[key]),
                    row
                );
        }
        assert.equal(accepted.marketplace_delivery.find((row) => row.command === id(411)).state, 'recorded');
        assert.deepEqual(
            accepted.marketplace_settlement.map((row) => row.command).sort(),
            [command.command, id(411)].sort()
        );
        await stop(control);
        const reopened = await launch(database, 400);
        assert.deepEqual(await request(reopened, { command: 'inspect' }), accepted);
        await stop(reopened);
        console.log(
            JSON.stringify({
                event: 'marketplace-process-recovery-passed',
                dialect,
                pids: [a.pid, b.pid, c.pid, d.pid, e.pid, f.pid],
                beforeCommitRolledBack: true,
                stageAcknowledgementLost: true,
                settlementAcknowledgementLost: true,
                staleFenceRejected: true,
                revocationSurvived: true,
                intents: 1,
                settlements: 1,
                localOnly: true,
            })
        );
    } finally {
        await Promise.all([...children].map(stop));
        await run(Scope.close(scope, Exit.void));
    }
}
