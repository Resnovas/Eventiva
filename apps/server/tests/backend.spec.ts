/**
 * @file apps/server/tests/backend.spec.ts
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

import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { describe, expect, it } from '@effect/vitest';
import { define } from '@eventiva/contracts/action';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant, RoutingDenied, Storage } from '@eventiva/contracts/storage';
import { client } from '@eventiva/integrations.sql/postgres';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { router } from '@eventiva/integrations.sql/router';
import { storage } from '@eventiva/integrations.sql/storage';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, InvalidModule } from '@eventiva/runtime/host';
import { makeTestOnlyHarness } from '@eventiva/runtime/testing';
import { ConfigProvider, Context, Effect, Layer, Ref, Schedule, Schema } from 'effect';
import { backend } from '../src/backend.ts';
import { ClusterActions } from '../src/cluster-actions.ts';
import { DeploymentProfile } from '../src/cluster-profile.ts';
import { ClusterStatus } from '../src/cluster.ts';

const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const caller = {
    subject: SubjectId.make(id(1)),
    session: SessionId.make(id(2)),
    tenant: TenantId.make(id(3)),
    kind: 'human' as const,
};

describe('SQL backend composition', () => {
    it.scopedLive(
        'routes the same handler Storage and durable Integrity through the cluster, never a local executor',
        () =>
            Effect.gen(function* () {
                const target = new URL(
                    process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test'
                );
                expect(['127.0.0.1', 'localhost', '[::1]']).toContain(target.hostname);
                expect(target.pathname).toBe('/eventiva_test');
                const pg = (url: string) =>
                    client.pipe(
                        Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]]))))
                    );
                const admin = Context.get(yield* Layer.build(pg(target.toString())), SqlClient.SqlClient);
                const database = `cluster_test_${randomUUID().replaceAll('-', '')}_a`;
                yield* admin`CREATE DATABASE ${admin(database)} TEMPLATE template0`;
                yield* Effect.addFinalizer(() =>
                    admin`DROP DATABASE ${admin(database)} WITH (FORCE)`.pipe(Effect.orDie)
                );
                target.pathname = `/${database}`;
                const connection = yield* Layer.build(pg(target.toString()));
                const sql = Context.get(connection, SqlClient.SqlClient);
                yield* migrate(
                    'postgres',
                    yield* load(fileURLToPath(new URL('../../../storage/migrations/postgres', import.meta.url)))
                ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
                const store = Context.get(
                    yield* Layer.build(storage('postgres').pipe(Layer.provide(Layer.succeedContext(connection)))),
                    Storage
                );
                const h = yield* makeTestOnlyHarness(caller);
                const failInitialization = yield* Ref.make(false);
                const profile = yield* Schema.decodeUnknown(DeploymentProfile)({
                    edition: 'community',
                    port: 34563,
                    shards: 24,
                    assignmentRefreshMs: 50,
                });
                const initialize = (host: ActionHost['Type']) =>
                    Effect.gen(function* () {
                        if (yield* Ref.get(failInitialization))
                            return yield* new InvalidModule({ module: 'fixture', reason: 'unavailable' });
                        const current = yield* CurrentTenant;
                        expect(current.id).toBe(caller.tenant);
                        const s = yield* Storage;
                        const action = define('fixture.change', {
                            version: 1,
                            description: 'Real SQL composition.',
                            input: Schema.Number,
                            output: Schema.Number,
                            permission: 'fixture.change',
                            sideEffect: 'write',
                            offline: 'queued',
                        });
                        yield* host.register({
                            manifest: {
                                format: 1,
                                id: 'fixture',
                                version: '1.0.0',
                                description: 'Fixture.',
                                actions: [action.name],
                                flags: [],
                            },
                            actions: [
                                implement(action, (value) =>
                                    s
                                        .create({
                                            id: id(4),
                                            state: 'pending',
                                            version: 0,
                                            payload: value,
                                            leaseUntil: null,
                                        })
                                        .pipe(Effect.as(value), Effect.orDie)
                                ),
                            ],
                        });
                    });
                const context = yield* Layer.build(
                    backend(profile, initialize).pipe(
                        Layer.provide(
                            router(
                                (tenant) =>
                                    tenant === caller.tenant
                                        ? Effect.succeed(store)
                                        : Effect.fail(new RoutingDenied({ reason: 'unknown tenant' })),
                                () => Effect.void
                            )
                        ),
                        Layer.provide(h.TestOnly),
                        Layer.provide(FlagsSafeDefaults),
                        // A process bootstrap scope must never override the live
                        // request's authenticated tenant or transaction binding.
                        Layer.provide(Layer.succeed(CurrentTenant, { id: TenantId.make(id(99)) })),
                        Layer.provide(Layer.succeedContext(connection))
                    )
                );
                expect(Context.getOption(context, ActionHost)._tag).toBe('None');
                const status = Context.get(context, ClusterStatus);
                yield* status.snapshot.pipe(
                    Effect.repeat({ schedule: Schedule.spaced('25 millis'), until: (s) => s.status === 'healthy' }),
                    Effect.timeout('10 seconds')
                );
                expect((yield* status.snapshot).ownedShards).toHaveLength(24);
                const actions = Context.get(context, ClusterActions);
                const request = {
                    caller,
                    entityKey: 'one',
                    action: 'fixture.change',
                    input: 37,
                    intent: { idempotencyKey: 'one' },
                };
                expect((yield* actions.execute(request)).output).toBe(37);
                expect((yield* actions.execute(request)).replayed).toBe(true);
                expect(yield* sql`SELECT * FROM operational_record`).toHaveLength(1);
                expect(yield* sql`SELECT * FROM action_commit WHERE result IS NOT NULL`).toHaveLength(1);
                yield* Ref.set(failInitialization, true);
                expect(yield* Effect.either(actions.execute(request))).toMatchObject({
                    _tag: 'Left',
                    left: { reason: 'audit-unavailable' },
                });
                yield* Ref.set(failInitialization, false);
                yield* Ref.set(h.identity, { ...caller, tenant: undefined });
                expect(
                    yield* Effect.either(actions.execute({ ...request, caller: { ...caller, tenant: undefined } }))
                ).toMatchObject({ _tag: 'Left', left: { reason: 'audit-unavailable' } });
            }),
        30000
    );
});
