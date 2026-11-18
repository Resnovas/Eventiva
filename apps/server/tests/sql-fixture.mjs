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
import { AgentOutputFailure } from '@eventiva/contracts/agent-output';
import { Authorizer } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant, RoutingDenied, Storage } from '@eventiva/contracts/storage';
import { client } from '@eventiva/integrations.sql/postgres';
import { storage } from '@eventiva/integrations.sql/storage';
import { agentOutputLog } from '@eventiva/integrations.sql/agent-output';
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
import {
    AgentRunAccess,
    AgentRunDenied,
    AgentRunInput,
    AgentRunModel,
    AgentRunReference,
    agentRuns,
    registerAgentRuns,
} from '../dist/agent-run.js';
import { pollAgentOutput, readAgentOutput } from '../dist/agent-output.js';

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
        // FORCE also checks roleless autovacuum workers; signal only sessions owned by this fixture role.
        yield* Effect.addFinalizer(() =>
            admin`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ${database} AND usename = current_user AND pid <> pg_backend_pid()`.pipe(
                Effect.zipRight(admin`DROP DATABASE ${admin(database)}`),
                Effect.orDie
            )
        );
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
    // Append every executor entry independently of the tenant business transaction.
    // No unique business key or ON CONFLICT can conceal repeated Activity execution.
    yield* sql`CREATE TABLE fixture_agent_entry (sequence bigserial PRIMARY KEY, tenant text NOT NULL, run_id text NOT NULL, step integer NOT NULL, pid integer NOT NULL, business_key text NOT NULL)`;
    yield* sql`CREATE TABLE fixture_run_gate (run_id text PRIMARY KEY, step integer NOT NULL, enabled boolean NOT NULL)`;
    yield* sql`CREATE TABLE fixture_output_gate (run_id text PRIMARY KEY, enabled boolean NOT NULL)`;
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

// Preserve only the typed failure category over fixture IPC, not inputs or cached output.
const agentFailure = (error) =>
    new Error(error._tag === 'AgentRunDenied' ? `AgentRunDenied:${error.reason}` : error._tag);

export const commands = {
    workflow: (request) => Recovery.execute({ request }, { discard: true }),
    poll: (executionId) => Recovery.poll(executionId),
    agentOutput: (request) => readAgentOutput(request).pipe(Effect.mapError(agentFailure)),
    agentOutputPoll: (request) => pollAgentOutput(request).pipe(Effect.mapError(agentFailure)),
    agentStart: (request) =>
        Schema.decodeUnknown(AgentRunInput)(request).pipe(
            Effect.flatMap((input) => Effect.flatMap(agentRuns, (runs) => runs.start(input))),
            Effect.mapError(agentFailure)
        ),
    agentStatus: (request) =>
        Schema.decodeUnknown(AgentRunReference)(request).pipe(
            Effect.flatMap((reference) => Effect.flatMap(agentRuns, (runs) => runs.status(reference))),
            Effect.mapError(agentFailure)
        ),
    agentInterrupt: (request) =>
        Schema.decodeUnknown(AgentRunReference)(request).pipe(
            Effect.flatMap((reference) => Effect.flatMap(agentRuns, (runs) => runs.interrupt(reference))),
            Effect.mapError(agentFailure)
        ),
};

export const makeBackend = (profile) =>
    Layer.unwrapScoped(
        Effect.gen(function* () {
            const compute = yield* connect(checked(process.env.CLUSTER_TEST_C_URL).toString());
            const sql = sqlOf(compute);
            const stores = new Map();
            const outputClients = new Map();
            for (const [n, cell] of [
                [1, 'A'],
                [2, 'B'],
            ]) {
                const context = yield* connect(checked(process.env[`CLUSTER_TEST_${cell}_URL`]).toString());
                outputClients.set(id(n), sqlOf(context));
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
                agentOutputLog((tenant) =>
                    outputClients.has(tenant)
                        ? Effect.succeed(outputClients.get(tenant))
                        : Effect.fail(new AgentOutputFailure({ reason: 'unavailable' }))
                ),
                Layer.succeed(AgentRunAccess, {
                    check: (reference, operation, step) =>
                        Effect.gen(function* () {
                            const gates =
                                yield* sql`SELECT step, enabled FROM fixture_run_gate WHERE run_id = ${reference.runId}`;
                            if (operation === 'step' && gates[0]?.enabled && gates[0].step === step) {
                                process.send?.({
                                    barrier: 'agent-between',
                                    pid: process.pid,
                                    runId: reference.runId,
                                    step,
                                });
                                yield* sql`SELECT enabled FROM fixture_run_gate WHERE run_id = ${reference.runId}`.pipe(
                                    Effect.repeat({
                                        schedule: Schedule.spaced('50 millis'),
                                        until: (rows) => rows[0]?.enabled === false,
                                    })
                                );
                            }
                            if (!(yield* enabled('permission')) || (yield* enabled('approval')))
                                return yield* new AgentRunDenied({ reason: 'denied' });
                        }).pipe(Effect.mapError(() => new AgentRunDenied({ reason: 'denied' }))),
                }),
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
                const entered = (tenant, runId, step, key) =>
                    sql`INSERT INTO fixture_agent_entry (tenant, run_id, step, pid, business_key) VALUES (${tenant}, ${runId}, ${step}, ${process.pid}, ${key})`.pipe(
                        Effect.orDie
                    );
                yield* registerAgentRuns.pipe(
                    Effect.provide(Security),
                    Effect.provideService(AgentRunModel, {
                        call: ({ caller, runId, stepIndex, idempotencyKey, input, emit }) =>
                            Effect.gen(function* () {
                                yield* entered(caller.tenant, runId, stepIndex, idempotencyKey);
                                for (const index of [0, 1]) yield* emit(index, `scripted:${stepIndex}:${index}`);
                                // Emit has committed, but this model Activity has not returned or journaled its reply.
                                const [gate] =
                                    yield* sql`SELECT enabled FROM fixture_output_gate WHERE run_id = ${runId}`;
                                if (stepIndex === 1 && gate?.enabled) {
                                    process.send?.({ barrier: 'agent-output-persisted', pid: process.pid, runId });
                                    yield* sql`SELECT enabled FROM fixture_output_gate WHERE run_id = ${runId}`.pipe(
                                        Effect.repeat({
                                            schedule: Schedule.spaced('50 millis'),
                                            until: (rows) => rows[0]?.enabled === false,
                                        })
                                    );
                                }
                                if (stepIndex === 1) return { id: input.id, value: input.seed * 3 + 1 };
                                if (stepIndex === 3 && input.tenant === caller.tenant)
                                    return { answer: input.value * 5 + 2, tenant: input.tenant };
                                return yield* new AgentRunDenied({ reason: 'invalid' });
                            }),
                    }),
                    Effect.provideService(ClusterActions, {
                        execute: (request) =>
                            Effect.gen(function* () {
                                const [runId, index] = request.intent.idempotencyKey.split(':');
                                yield* entered(
                                    request.caller.tenant,
                                    runId,
                                    Number(index),
                                    request.intent.idempotencyKey
                                );
                                return yield* actions.execute(request);
                            }),
                    })
                );
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
                Layer.provideMerge(Security),
                Layer.provide(Layer.succeedContext(compute))
            );
        })
    );
