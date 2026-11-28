/**
 * @file apps/server/tests/module-run-fixture.mjs
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
import { define } from '@eventiva/contracts/action';
import { AgentOutputLog } from '@eventiva/contracts/agent-output';
import { Authorizer, Caller } from '@eventiva/contracts/caller';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { CurrentRunFence, CurrentTenant, Storage } from '@eventiva/contracts/storage';
import { agentOutputLog } from '@eventiva/integrations.sql/agent-output';
import { client } from '@eventiva/integrations.sql/postgres';
import { sqlRouter } from '@eventiva/integrations.sql/router';
import { load } from '@eventiva/integrations.sql/migrations';
import { storage } from '@eventiva/integrations.sql/storage';
import { implement } from '@eventiva/runtime/action';
import {
    Approvals,
    canonicalJson,
    ExecutionPolicy,
    IdentityResolver,
    InputDigest,
    InvocationDenied,
} from '@eventiva/runtime/invocation';
import { ConfigProvider, Context, Effect, Layer, Schedule, Schema } from 'effect';
import { backend } from '../dist/backend.js';
import { AgentRunAccess, AgentRunDenied, AgentRunModel, agentRuns, registerAgentRuns } from '../dist/agent-run.js';
import { ModuleRunCatalog } from '../dist/module-run.js';
import { ClusterActions } from '../dist/cluster-actions.js';
import { caller, id, prepare as prepareBase } from './sql-fixture.mjs';

export { caller, id };
// Reuse only the published fixture's database allocator, never the EVE-291 checkpoint or its harness.
export const prepare = prepareBase.pipe(
    Effect.tap(
        (fixture) =>
            fixture.sql
                .c`CREATE TABLE module_entry (pid integer NOT NULL, version text NOT NULL, value integer NOT NULL)`
    )
);

const pg = (url) => {
    const checked = new URL(url);
    if (
        !['127.0.0.1', 'localhost', '[::1]'].includes(checked.hostname) ||
        !/^\/cluster_test_[a-f0-9]+_[cab]$/.test(checked.pathname)
    )
        throw new Error('Disposable fixture database required');
    return client.pipe(
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
};
const ProcessFixture = Context.GenericTag('@eventiva/test/ModuleRunProcess');
export const commands = {
    start: (input) => Effect.flatMap(agentRuns, (runs) => runs.start(input)),
    poll: (input) => Effect.flatMap(agentRuns, (runs) => runs.status(input)),
    // Explicit SQL authority transfer is exercised independently of Cluster membership changes.
    claim: (input) =>
        Effect.flatMap(ProcessFixture, (fixture) =>
            fixture.store.claimRun(caller().tenant, input.runId, input.epoch, input.owner)
        ),
    stale: (input) => Effect.flatMap(ProcessFixture, (fixture) => fixture.actions.execute(input)),
    output: (input) =>
        Effect.flatMap(ProcessFixture, (fixture) =>
            fixture.output
                .append(input.event)
                .pipe(
                    Effect.provideService(CurrentRunFence, input.fence),
                    Effect.provideService(Caller, caller()),
                    Effect.provideService(fixture.tenantTag, { id: caller().tenant })
                )
        ),
};

export const makeBackend = (profile, preboundSocket) =>
    Layer.unwrapScoped(
        Effect.gen(function* () {
            const compute = Context.get(yield* Layer.build(pg(process.env.CLUSTER_TEST_C_URL)), SqlClient.SqlClient);
            const tenantSql = Context.get(yield* Layer.build(pg(process.env.CLUSTER_TEST_A_URL)), SqlClient.SqlClient);
            const store = Context.get(
                yield* Layer.build(
                    storage('postgres').pipe(Layer.provide(Layer.succeed(SqlClient.SqlClient, tenantSql)))
                ),
                Storage
            );
            const migrations = yield* load(
                fileURLToPath(new URL('../../../storage/migrations/postgres', import.meta.url))
            );
            const schema = migrations.map(({ name, checksum }) => ({ name, checksum }));
            const enabled = (key) =>
                compute`SELECT enabled FROM fixture_control WHERE key = ${key}`.pipe(
                    Effect.mapInputContext(Context.omit(SqlClient.TransactionConnection)),
                    Effect.map((rows) => rows[0]?.enabled)
                );
            const spec = define('fixture.pinned', {
                version: 1,
                description: 'Execute the exact retained synthetic module and provider.',
                input: Schema.Struct({ id: Schema.String, value: Schema.Number }),
                output: Schema.Struct({ id: Schema.String, value: Schema.Number }),
                permission: 'fixture.pinned',
                sideEffect: 'write',
                offline: 'online-only',
            });
            // The actual captured configuration changes the executable result. A catalog label alone cannot pass this proof.
            const artifact = (version, factor, increment) => ({
                snapshot: {
                    composition: {
                        modules: [{ id: 'fixture', version }],
                        bindings: [
                            {
                                consumer: 'fixture',
                                requirement: 'arithmetic',
                                provider: 'fixture',
                                instance: 'primary',
                            },
                        ],
                    },
                    providers: [
                        {
                            module: 'fixture',
                            instance: 'primary',
                            configuration: `synthetic-factor:${factor}:${increment}`,
                        },
                    ],
                    schema,
                    origin: { incarnation: 'admission-origin', generation: 7 },
                },
                modules: Effect.gen(function* () {
                    const routed = yield* Storage;
                    return [
                        {
                            manifest: {
                                format: 1,
                                id: 'fixture',
                                version,
                                description: 'Synthetic retained executable.',
                                actions: [spec.name],
                                flags: [],
                            },
                            actions: [
                                implement(spec, (input) =>
                                    Effect.gen(function* () {
                                        yield* compute`INSERT INTO module_entry VALUES (${process.pid}, ${version}, ${input.value})`.pipe(
                                            Effect.mapInputContext(Context.omit(SqlClient.TransactionConnection))
                                        );
                                        const value = input.value * factor + increment;
                                        yield* routed.create({
                                            id: input.id,
                                            state: 'pending',
                                            version: 0,
                                            leaseUntil: null,
                                            payload: { value, version },
                                        });
                                        yield* routed.compareAndSet(
                                            {
                                                id: input.id,
                                                expectedState: 'pending',
                                                expectedVersion: 0,
                                                clientMutationId: input.id,
                                                idempotencyKey: input.id,
                                                deadline: Date.now() + 120000,
                                            },
                                            'complete',
                                            { value, version },
                                            { pending: ['complete'] }
                                        );
                                        yield* routed.enqueue(input.id, { value, version });
                                        return { id: id(Number.parseInt(input.id.slice(-12), 16) + 1), value };
                                    }).pipe(Effect.orDie)
                                ),
                            ],
                        },
                    ];
                }),
            });
            const old = artifact('1.0.0', 3, 1);
            const newer = artifact('2.0.0', 7, 2);
            const artifacts = process.env.MODULE_RUN_MISSING === 'true' ? [newer] : [old, newer];
            if (process.env.MODULE_RUN_PROVIDER_MISMATCH === 'true')
                old.snapshot.providers[0].configuration = 'wrong-config';
            if (process.env.MODULE_RUN_SCHEMA_MISMATCH === 'true') old.snapshot.schema = [];
            const catalog = {
                incarnation: `process:${process.pid}:${randomUUID()}`,
                current: process.env.MODULE_RUN_NEW_DEFAULT === 'true' ? newer.snapshot : old.snapshot,
                artifacts,
            };
            const output = agentOutputLog(() => Effect.succeed(tenantSql));
            const security = Layer.mergeAll(
                FlagsSafeDefaults,
                output,
                Layer.succeed(ModuleRunCatalog, catalog),
                Layer.succeed(IdentityResolver, {
                    resolve: (presented) =>
                        Effect.gen(function* () {
                            if (
                                !(yield* enabled('identity')) ||
                                (yield* canonicalJson(presented)) !== (yield* canonicalJson(caller()))
                            )
                                return yield* new InvocationDenied({ action: '<identity>', reason: 'denied' });
                            return caller();
                        }).pipe(
                            Effect.mapError(() => new InvocationDenied({ action: '<identity>', reason: 'denied' }))
                        ),
                }),
                Layer.succeed(Authorizer, { canInvoke: () => Effect.void, check: () => Effect.void }),
                Layer.succeed(InputDigest, {
                    digest: (text) => Effect.sync(() => createHash('sha256').update(text).digest('hex')),
                }),
                Layer.succeed(ExecutionPolicy, {
                    inspect: () =>
                        Effect.succeed({
                            approval: 'none',
                            routinePreauthorized: true,
                            stepUp: false,
                            bounds: {},
                            dependenciesReady: true,
                            capacityAvailable: true,
                        }),
                }),
                Layer.succeed(Approvals, {
                    get: () => Effect.fail(new InvocationDenied({ action: spec.name, reason: 'no-proof' })),
                }),
                Layer.succeed(AgentRunModel, { call: () => Effect.fail(new AgentRunDenied({ reason: 'invalid' })) }),
                Layer.succeed(AgentRunAccess, {
                    check: (reference, operation, step) =>
                        Effect.gen(function* () {
                            if (!(yield* enabled('permission'))) return yield* new AgentRunDenied({ reason: 'denied' });
                            const [gate] =
                                yield* compute`SELECT enabled FROM fixture_run_gate WHERE run_id = ${reference.runId} AND step = ${step ?? 0}`;
                            if (operation === 'step' && gate?.enabled) {
                                process.send?.({ barrier: 'module-between', pid: process.pid, runId: reference.runId });
                                yield* compute`SELECT enabled FROM fixture_run_gate WHERE run_id = ${reference.runId}`.pipe(
                                    Effect.repeat({
                                        schedule: Schedule.spaced('30 millis'),
                                        until: (rows) => !rows[0]?.enabled,
                                    })
                                );
                            }
                        }).pipe(Effect.mapError(() => new AgentRunDenied({ reason: 'denied' }))),
                }),
                sqlRouter(
                    'postgres',
                    (tenant) =>
                        tenant === caller().tenant
                            ? Effect.succeed(tenantSql)
                            : Effect.fail(new AgentRunDenied({ reason: 'denied' })),
                    () => Effect.void
                )
            );
            const context = yield* Layer.build(
                backend(
                    profile,
                    () => Effect.fail(new Error('Module runs must never initialize the default executable')),
                    registerAgentRuns.pipe(Effect.provide(security)),
                    security,
                    undefined,
                    preboundSocket
                ).pipe(Layer.provideMerge(security), Layer.provide(Layer.succeed(SqlClient.SqlClient, compute)))
            );
            return Layer.succeedContext(
                context.pipe(
                    Context.add(ProcessFixture, {
                        store,
                        actions: Context.get(context, ClusterActions),
                        output: Context.get(yield* Layer.build(output), AgentOutputLog),
                        tenantTag: CurrentTenant,
                    })
                )
            );
        })
    );
