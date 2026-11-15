/**
 * @file apps/server/tests/sql-fixture.mjs
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

import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { ShardGroup } from '@effect/cluster/ClusterSchema';
import * as Workflow from '@effect/workflow/Workflow';
import * as Activity from '@effect/workflow/Activity';
import { define } from '@eventiva/contracts/action';
import { Authorizer } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant, RoutingDenied, Storage } from '@eventiva/contracts/storage';
import { client } from '@eventiva/integrations.sql/postgres';
import { storage } from '@eventiva/integrations.sql/storage';
import { router } from '@eventiva/integrations.sql/router';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { implement } from '@eventiva/runtime/action';
import {
    Approvals,
    ExecutionPolicy,
    IdentityResolver,
    InputDigest,
    InvocationDenied,
} from '@eventiva/runtime/invocation';
import { ConfigProvider, Context, Effect, Layer, Schedule, Schema } from 'effect';
import { backend } from '../dist/backend.js';
import { ClusterActions, ClusterInvocation } from '../dist/cluster-actions.js';

export const id = (n) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
export const caller = (n = 1) => ({
    subject: SubjectId.make(id(10 + n)),
    session: SessionId.make(id(20 + n)),
    tenant: TenantId.make(id(n)),
    kind: 'human',
});
const pg = (url) =>
    client.pipe(
        Layer.provide(
            Layer.setConfigProvider(
                ConfigProvider.fromMap(
                    new Map([
                        ['DATABASE_URL', url],
                        ['DATABASE_POOL_SIZE', '8'],
                    ])
                )
            )
        )
    );
const connect = (url) => Layer.build(pg(url));
const sqlOf = (context) => Context.get(context, SqlClient.SqlClient);
const waitOpen = (sql, key) =>
    sql`SELECT enabled FROM fixture_control WHERE key = ${key}`.pipe(
        Effect.repeat({ schedule: Schedule.spaced('50 millis'), until: (rows) => rows[0]?.enabled === false }),
        Effect.asVoid
    );

// Disposable loopback only, independently checked in both parent and child.
const checked = (value, admin = false) => {
    const url = new URL(value);
    if (
        !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) ||
        (admin ? url.pathname !== '/eventiva_test' : !/^\/cluster_test_[a-f0-9]+_[cab]$/.test(url.pathname))
    )
        throw new Error('Cluster conformance requires disposable loopback fixture databases');
    return url;
};

export const prepare = Effect.gen(function* () {
    const url = checked(
        process.env.STORAGE_TEST_POSTGRES_URL ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test',
        true
    );
    const admin = sqlOf(yield* connect(url.toString()));
    const suffix = randomUUID().replaceAll('-', '');
    const env = {};
    const connections = {};
    for (const cell of ['c', 'a', 'b']) {
        const database = `cluster_test_${suffix}_${cell}`;
        yield* admin`CREATE DATABASE ${admin(database)} TEMPLATE template0`;
        yield* Effect.addFinalizer(() => admin`DROP DATABASE ${admin(database)} WITH (FORCE)`.pipe(Effect.orDie));
        const target = new URL(url);
        target.pathname = `/${database}`;
        env[`CLUSTER_TEST_${cell.toUpperCase()}_URL`] = target.toString();
        connections[cell] = sqlOf(yield* connect(target.toString()));
        if (cell !== 'c') {
            const files = yield* load(fileURLToPath(new URL('../../../storage/migrations/postgres', import.meta.url)));
            yield* migrate('postgres', files).pipe(Effect.provideService(SqlClient.SqlClient, connections[cell]));
        }
    }
    const sql = connections.c;
    yield* sql`CREATE TABLE fixture_control (key text PRIMARY KEY, enabled boolean NOT NULL)`;
    for (const [key, enabled] of [
        ['identity', true],
        ['permission', true],
        ['approval', false],
        ['before', false],
        ['after', false],
        ['registration', true],
    ])
        yield* sql`INSERT INTO fixture_control VALUES (${key}, ${enabled})`;
    return {
        env,
        sql: connections,
        set: (key, enabled) => sql`UPDATE fixture_control SET enabled = ${enabled} WHERE key = ${key}`,
    };
});

export const Recovery = Workflow.make({
    name: 'FixtureRecovery',
    payload: { request: ClusterInvocation },
    // Includes caller, input and intent. Never a bare business idempotency key.
    idempotencyKey: ({ request }) => JSON.stringify(request),
    success: Schema.Unknown,
}).annotate(ShardGroup, () => 'eventiva-actions');

export const commands = {
    workflow: (request) => Recovery.execute({ request }, { discard: true }),
    poll: (executionId) => Recovery.poll(executionId),
};

export const makeBackend = (profile) =>
    Layer.unwrapScoped(
        Effect.gen(function* () {
            const compute = yield* connect(checked(process.env.CLUSTER_TEST_C_URL).toString());
            const sql = sqlOf(compute);
            const stores = new Map();
            for (const [n, cell] of [
                [1, 'A'],
                [2, 'B'],
            ]) {
                const context = yield* connect(checked(process.env[`CLUSTER_TEST_${cell}_URL`]).toString());
                stores.set(
                    id(n),
                    Context.get(
                        yield* Layer.build(storage('postgres').pipe(Layer.provide(Layer.succeedContext(context)))),
                        Storage
                    )
                );
            }
            // Effect SQL shares a transaction context tag across clients. Control-plane
            // reads must not accidentally run on the current tenant transaction.
            const enabled = (key) =>
                sql`SELECT enabled FROM fixture_control WHERE key = ${key}`.pipe(
                    Effect.mapInputContext(Context.omit(SqlClient.TransactionConnection)),
                    Effect.map((rows) => rows[0]?.enabled === true)
                );
            const deny = (action, reason) => new InvocationDenied({ action, reason });
            const Security = Layer.mergeAll(
                FlagsSafeDefaults,
                Layer.succeed(InputDigest, {
                    digest: (value) => Effect.sync(() => createHash('sha256').update(value).digest('hex')),
                }),
                Layer.succeed(IdentityResolver, {
                    resolve: (presented) =>
                        Effect.gen(function* () {
                            const n = [1, 2].find(
                                (n) => presented.subject === id(10 + n) && presented.session === id(20 + n)
                            );
                            if (
                                !(yield* enabled('identity')) ||
                                n === undefined ||
                                presented.kind !== 'human' ||
                                presented.onBehalfOf !== undefined
                            )
                                return yield* deny('<identity>', 'unknown-session');
                            return caller(n);
                        }).pipe(Effect.mapError(() => deny('<identity>', 'unknown-session'))),
                }),
                Layer.succeed(Authorizer, {
                    canInvoke: (_caller, spec) =>
                        Effect.gen(function* () {
                            if (!(yield* enabled('permission')))
                                return yield* new Forbidden({ action: spec.name, reason: 'revoked' });
                        }).pipe(Effect.mapError(() => new Forbidden({ action: '<fixture>', reason: 'revoked' }))),
                    check: () => Effect.void,
                }),
                Layer.succeed(ExecutionPolicy, {
                    inspect: (_caller, spec) =>
                        Effect.gen(function* () {
                            const approval = yield* enabled('approval');
                            return {
                                approval: approval ? 'confirm' : 'none',
                                routinePreauthorized: true,
                                stepUp: false,
                                bounds: {},
                                dependenciesReady: true,
                                capacityAvailable: true,
                            };
                        }).pipe(Effect.mapError(() => deny(spec.name, 'policy-unavailable'))),
                }),
                Layer.succeed(Approvals, { get: () => Effect.fail(deny('<approval>', 'approval-unavailable')) }),
                router(
                    (tenant) =>
                        stores.has(tenant)
                            ? Effect.succeed(stores.get(tenant))
                            : Effect.fail(new RoutingDenied({ reason: 'unknown tenant' })),
                    () => Effect.void
                )
            );
            const initialize = (host) =>
                Effect.gen(function* () {
                    const store = yield* Storage;
                    const tenant = yield* CurrentTenant;
                    const spec = define('fixture.change', {
                        version: 1,
                        description: 'Synthetic transaction and process recovery probe.',
                        input: Schema.Struct({ id: Schema.UUID, value: Schema.Number }),
                        output: Schema.Struct({ value: Schema.Number, tenant: Schema.String }),
                        permission: 'fixture.change',
                        sideEffect: 'write',
                        offline: 'queued',
                    });
                    yield* host.register({
                        manifest: {
                            format: 1,
                            id: 'fixture',
                            version: '1.0.0',
                            description: 'Synthetic only.',
                            actions: [spec.name],
                            flags: [],
                        },
                        actions: [
                            implement(spec, ({ id: recordId, value }) =>
                                Effect.gen(function* () {
                                    yield* store.create({
                                        id: recordId,
                                        state: 'pending',
                                        version: 0,
                                        payload: { value },
                                        leaseUntil: null,
                                    });
                                    yield* store.compareAndSet(
                                        {
                                            id: recordId,
                                            expectedState: 'pending',
                                            expectedVersion: 0,
                                            clientMutationId: recordId,
                                            idempotencyKey: recordId,
                                            deadline: Date.now() + 120000,
                                        },
                                        'confirmed',
                                        { value },
                                        { pending: ['confirmed'] }
                                    );
                                    yield* store.enqueue(recordId, { value });
                                    if (yield* enabled('before')) {
                                        process.send?.({ barrier: 'before', pid: process.pid, recordId });
                                        yield* waitOpen(sql, 'before').pipe(
                                            Effect.mapInputContext(Context.omit(SqlClient.TransactionConnection))
                                        );
                                    }
                                    return { value, tenant: tenant.id };
                                }).pipe(Effect.orDie)
                            ),
                        ],
                    });
                });
            const registerWorkflows = Effect.gen(function* () {
                const actions = yield* ClusterActions;
                yield* Layer.build(
                    Recovery.toLayer(({ request }) =>
                        Activity.make({
                            name: 'commit-business-action',
                            success: Schema.Unknown,
                            execute: Effect.gen(function* () {
                                const result = yield* actions.execute(request).pipe(Effect.orDie);
                                if (yield* enabled('after').pipe(Effect.orDie)) {
                                    process.send?.({ barrier: 'after', pid: process.pid, recordId: request.input.id });
                                    yield* waitOpen(sql, 'after').pipe(Effect.orDie);
                                }
                                return result.output;
                            }),
                        })
                    )
                );
                process.send?.({ barrier: 'registration', pid: process.pid });
                yield* waitOpen(sql, 'registration');
            });
            return backend(profile, initialize, registerWorkflows).pipe(
                Layer.provide(Security),
                Layer.provide(Layer.succeedContext(compute))
            );
        })
    );
