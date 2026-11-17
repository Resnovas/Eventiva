/**
 * @file tests/storage/src/hook-producer.spec.ts
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
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { SqliteClient } from '@effect/sql-sqlite-node';
import { describe, expect, it } from '@effect/vitest';
import {
    HookChangeFeed,
    HookDenied,
    HookProducer,
    HookProducerBinding,
    HookProducerDeny,
    HookProducerPolicy,
    type HookOutboxFailure,
    type HookProducerStatus,
    type HookProducerTarget,
} from '@eventiva/contracts/hook';
import { TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { hookStorage } from '@eventiva/integrations.sql/hook';
import { hookProducer } from '@eventiva/integrations.sql/hook-producer';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { ConfigProvider, Context, Deferred, Effect, Exit, Fiber, Layer, Ref, Schema, Scope } from 'effect';

/** Derive stable request UUIDs so duplicate and cross-tenant cases share deliberate identities. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const tenant = TenantId.make(id(1));
const logical = 'fixture.producer';
const identity = { module: 'fixture', version: '1.2.3', generation: 7 };
const lifecycle: HookProducerTarget = { kind: 'module.lifecycle', module: 'fixture', operation: 'activate' };
/** Select the ready generation independently of the producer's restart incarnation. */
const ready = (generation = 1): HookProducerTarget => ({ kind: 'platform.ready', generation });
/** Bind a synthetic authoritative classification and projection to the exact requested target. */
const binding = (incarnation: string, target: HookProducerTarget): HookProducerBinding => ({
    purpose: 'fixture.lifecycle',
    profile: 'restricted',
    operation: 'protected',
    projection:
        target.kind === 'platform.ready'
            ? { kind: 'platform.ready', runtimeId: incarnation, generation: target.generation }
            : {
                  kind: 'module.lifecycle',
                  operation: target.operation,
                  identity: { ...identity },
                  from: 'installed',
                  to: 'active',
              },
});
/** Configure a disposable PostgreSQL connection without reading application credentials. */
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
// Disposable test endpoint only; never use the application's DATABASE_URL.
const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
const endpoint = new URL(local);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname) || endpoint.pathname !== '/eventiva_test')
    throw new Error('Producer conformance requires disposable loopback eventiva_test');

/** Build isolated journal storage and a controllable synthetic mutation-owner policy, not production provenance. */
const fixture = (dialect: Dialect) =>
    Effect.gen(
        /** Allocate scoped storage and expose policy controls for restart and revocation scenarios. */ function* () {
            const directory = yield* Effect.acquireRelease(
                Effect.sync(
                    /** Keep SQLite state disposable while allowing multiple connections during a test. */ () => {
                        const root = join(process.cwd(), '.amp/in/orb-backup');
                        mkdirSync(root, { recursive: true });
                        return mkdtempSync(join(root, 'hook-producer-'));
                    }
                ),
                /** Remove only this fixture's allocated directory when its scope closes. */
                (path) =>
                    Effect.sync(
                        /** Delete fixture files after their clients have been finalized. */ () =>
                            rmSync(path, { recursive: true, force: true })
                    )
            );
            let url = local;
            if (dialect === 'postgres') {
                const admin = Context.get(yield* Layer.build(pg(local)), SqlClient.SqlClient);
                const name = `producer_${randomUUID().replaceAll('-', '')}`;
                yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                yield* Effect.addFinalizer(
                    /** Drop the uniquely named test database after its clients close. */ () =>
                        admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie)
                );
                const database = new URL(local);
                database.pathname = `/${name}`;
                url = database.href;
            }
            /** Open an independent client against the same fixture state to model competing processes. */
            const connect = () =>
                Layer.build(
                    dialect === 'postgres'
                        ? pg(url)
                        : SqliteClient.layer({ filename: join(directory, 'producer.sqlite') })
                ).pipe(
                    Effect.map(
                        /** Extract the scoped SQL client without rebuilding its layer. */ (context) =>
                            Context.get(context, SqlClient.SqlClient)
                    )
                );
            const sql = yield* connect();
            yield* migrate(
                dialect,
                yield* load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url)))
            ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            /** Acquire a fresh producer incarnation with an explicit tenant and logical-runtime boundary. */
            const build = (connection = sql, owner = tenant, runtime = logical) =>
                Layer.build(
                    hookProducer(dialect, runtime).pipe(
                        Layer.provide(Layer.succeed(SqlClient.SqlClient, connection)),
                        Layer.provide(Layer.succeed(CurrentTenant, { id: owner }))
                    )
                ).pipe(
                    Effect.map(
                        /** Return the producer whose incarnation was just persisted. */ (context) =>
                            Context.get(context, HookProducer)
                    )
                );
            const feed = Context.get(
                yield* Layer.build(
                    hookStorage(dialect).pipe(
                        Layer.provide(Layer.succeed(SqlClient.SqlClient, sql)),
                        Layer.provide(Layer.succeed(CurrentTenant, { id: tenant }))
                    )
                ),
                HookChangeFeed
            );
            const allowed = yield* Ref.make(true);
            const verdict = yield* Ref.make<HookProducerStatus>('unresolved');
            const override = yield* Ref.make<HookProducerBinding | undefined>(undefined);
            const binds = yield* Ref.make(0);
            const boundTenants = yield* Ref.make<ReadonlyArray<TenantId>>([]);
            const reconciliations = yield* Ref.make(0);
            const policy = HookProducerPolicy.of({
                /** Record captured tenant attribution and return the policy snapshot for a fresh attempt. */
                bind: (capturedTenant, _runtime, incarnation, target) =>
                    Effect.gen(
                        /** Apply live denial before supplying either the normal or deliberately altered binding. */ function* () {
                            yield* Ref.update(
                                binds,
                                /** Count binding decisions to detect accidental rebinding on replay. */ (n) => n + 1
                            );
                            yield* Ref.update(
                                boundTenants,
                                /** Retain tenant attribution for isolation assertions. */ (tenants) => [
                                    ...tenants,
                                    capturedTenant,
                                ]
                            );
                            if (!(yield* Ref.get(allowed))) return yield* new HookDenied({ reason: 'policy-denied' });
                            return (yield* Ref.get(override)) ?? binding(incarnation, target);
                        }
                    ),
                /** Recheck current permission even when an attempt already exists or is terminal. */
                authorize: () =>
                    Effect.gen(
                        /** Model revocation independently of the persisted policy snapshot. */ function* () {
                            if (!(yield* Ref.get(allowed))) return yield* new HookDenied({ reason: 'policy-denied' });
                        }
                    ),
                /** Supply an owner-controlled status without invoking the original mutation again. */
                reconcile: () =>
                    Ref.update(
                        reconciliations,
                        /** Count authoritative lookups to detect terminal replay. */ (n) => n + 1
                    ).pipe(Effect.zipRight(Ref.get(verdict))),
            });
            /** Run a journal operation under this fixture's synthetic owner authority. */
            const run = <A, E>(effect: Effect.Effect<A, E, HookProducerPolicy>) =>
                effect.pipe(Effect.provideService(HookProducerPolicy, policy));
            return {
                sql,
                connect,
                build,
                feed,
                policy,
                run,
                allowed,
                verdict,
                override,
                binds,
                boundTenants,
                reconciliations,
                producer: yield* build(),
            };
        }
    );

for (const dialect of ['sqlite', 'postgres'] as const)
    describe(`producer journal prerequisite ${dialect}`, /** Register the same journal invariants for both SQL dialects. */ () => {
        it.scoped(
            'persists a fresh incarnation on every build and grants callback eligibility only once',
            /** Exercise restart identity and one-time callback eligibility. */ () =>
                Effect.gen(
                    /** Compare persisted attempts across independently scoped producer acquisitions. */ function* () {
                        const f = yield* fixture(dialect);
                        const owner = yield* Effect.acquireRelease(
                            Scope.make(),
                            /** Close the first owner to model process disposal before restart. */ (scope) =>
                                Scope.close(scope, Exit.void)
                        );
                        const connection = yield* f.connect().pipe(Scope.extend(owner));
                        const first = yield* f.build(connection).pipe(Scope.extend(owner));
                        const started = yield* f.run(first.begin(id(10), lifecycle));
                        expect(started).toMatchObject({ fresh: true, status: 'unresolved' });
                        expect(started.attempt).toEqual({
                            id: id(10),
                            tenant,
                            runtime: logical,
                            incarnation: first.runtime.incarnation,
                            target: lifecycle,
                            binding: binding(first.runtime.incarnation, lifecycle),
                        });
                        expect(yield* f.run(first.begin(id(10), lifecycle))).toEqual({ ...started, fresh: false });
                        expect(yield* f.feed.read(0, 100)).toEqual({ cursor: 0, events: [] });
                        yield* Scope.close(owner, Exit.void);
                        const restarted = yield* f.build(yield* f.connect());
                        const rebuilt = yield* f.build(f.sql);
                        expect(
                            new Set(
                                [f.producer, first, restarted, rebuilt].map(
                                    /** Compare persisted incarnation IDs rather than object identity. */ (p) =>
                                        p.runtime.incarnation
                                )
                            ).size
                        ).toBe(4);
                        for (const producer of [restarted, rebuilt]) {
                            expect(producer.runtime.logical).toBe(logical);
                            expect(Schema.is(Schema.UUID)(producer.runtime.incarnation)).toBe(true);
                            expect(yield* f.run(producer.begin(id(10), lifecycle))).toEqual({
                                ...started,
                                fresh: false,
                            });
                            expect(yield* f.run(producer.inspect(id(10)))).toEqual({
                                attempt: started.attempt,
                                status: 'unresolved',
                            });
                            expect(yield* Effect.flip(f.run(producer.confirm(id(10))))).toMatchObject({
                                reason: 'conflict',
                            });
                        }
                        expect(yield* Ref.get(f.binds)).toBe(1);
                        expect(yield* Ref.get(f.boundTenants)).toEqual([tenant]);
                        expect(
                            yield* f.sql`SELECT incarnation FROM hook_runtime WHERE tenant = ${tenant}`
                        ).toHaveLength(4);
                        expect(yield* f.sql`SELECT state FROM hook_producer_attempt`).toEqual([
                            { state: 'unresolved' },
                        ]);
                        expect(yield* f.feed.read(0, 100)).toEqual({ cursor: 0, events: [] });
                        // Racing one retained UUID must not grant two callers permission to execute the mutation.
                        const raced = yield* f.run(
                            Effect.all([rebuilt.begin(id(11), lifecycle), rebuilt.begin(id(11), lifecycle)], {
                                concurrency: 'unbounded',
                            })
                        );
                        expect(
                            raced
                                .map(/** Count which contender won callback eligibility. */ (attempt) => attempt.fresh)
                                .sort()
                        ).toEqual([false, true]);
                        expect(
                            yield* f.sql`SELECT request FROM hook_producer_attempt WHERE request = ${id(11)}`
                        ).toHaveLength(1);
                    }
                )
        );

        it.scoped(
            'reconciles only authoritative status after restart; terminal replay never reclassifies or republishes',
            /** Exercise status reconciliation without replaying a mutation after restart. */ () =>
                Effect.gen(
                    /** Verify terminal facts cannot change when the synthetic authority later changes its answer. */ function* () {
                        const f = yield* fixture(dialect);
                        for (const request of [id(10), id(11), id(12)])
                            yield* f.run(f.producer.begin(request, lifecycle));
                        const restarted = yield* f.build(yield* f.connect());
                        expect(yield* f.run(restarted.reconcile(id(10)))).toBe('unresolved');
                        expect(yield* f.feed.read(0, 100)).toEqual({ cursor: 0, events: [] });
                        yield* Ref.set(f.verdict, 'committed');
                        expect(yield* f.run(restarted.reconcile(id(10)))).toBe('committed');
                        yield* Ref.set(f.verdict, 'abandoned');
                        expect(yield* f.run(restarted.reconcile(id(11)))).toBe('abandoned');
                        expect(yield* f.run(restarted.reconcile(id(10)))).toBe('committed');
                        yield* Ref.set(f.verdict, 'committed');
                        expect(yield* f.run(restarted.reconcile(id(11)))).toBe('abandoned');
                        expect(yield* Effect.flip(f.run(f.producer.confirm(id(11))))).toMatchObject({
                            reason: 'conflict',
                        });
                        expect(yield* f.run(f.producer.confirm(id(10)))).toBe('committed');
                        expect(yield* f.run(f.producer.confirm(id(10)))).toBe('committed');
                        expect(yield* Ref.get(f.reconciliations)).toBe(3);
                        const feed = yield* f.feed.read(0, 100);
                        expect(feed.cursor).toBe(1);
                        expect(feed.events).toHaveLength(1);
                        expect(feed.events[0]?.event.id).toBe(id(10));
                        expect((yield* f.run(restarted.begin(id(11), lifecycle))).fresh).toBe(false);
                        expect((yield* f.run(restarted.inspect(id(12)))).status).toBe('unresolved');
                        expect(yield* f.sql`SELECT * FROM hook_delivery`).toHaveLength(0);
                    }
                )
        );

        it.scoped(
            'stages the exact immutable policy binding, not a later classification or caller substitution',
            /** Exercise immutable classification and tenant/runtime isolation. */ () =>
                Effect.gen(
                    /** Change live policy after begin and verify the original binding remains the published fact. */ function* () {
                        const f = yield* fixture(dialect);
                        const started = yield* f.run(f.producer.begin(id(10), lifecycle));
                        yield* Ref.set(f.override, {
                            purpose: 'fixture.changed',
                            profile: 'baseline',
                            operation: 'ordinary',
                            projection: {
                                kind: 'module.lifecycle',
                                operation: 'activate',
                                identity: { module: 'foreign', version: '9.8.7', generation: 99 },
                                from: 'inactive',
                                to: 'ready',
                            },
                        });
                        expect(yield* f.run(f.producer.begin(id(10), lifecycle))).toEqual({ ...started, fresh: false });
                        expect(
                            yield* Effect.flip(f.run(f.producer.begin(id(10), { ...lifecycle, operation: 'ready' })))
                        ).toMatchObject({ reason: 'conflict' });
                        expect(yield* f.run(f.producer.confirm(id(10)))).toBe('committed');
                        expect((yield* f.feed.read(0, 100)).events).toEqual([
                            {
                                cursor: 1,
                                event: {
                                    format: 1,
                                    id: id(10),
                                    commit: id(10),
                                    tenant,
                                    resource: 'kernel.lifecycle',
                                    resourceId: f.producer.runtime.incarnation,
                                    purpose: 'fixture.lifecycle',
                                    profile: 'restricted',
                                    operation: 'protected',
                                    sequence: 1,
                                    projection: started.attempt.binding.projection,
                                },
                            },
                        ]);
                        const foreign = yield* f.build(f.sql, TenantId.make(id(90)));
                        expect(yield* Effect.flip(f.run(foreign.inspect(id(10))))).toMatchObject({
                            reason: 'policy-denied',
                        });
                        const otherLogical = yield* f.build(f.sql, tenant, 'fixture.other');
                        expect(yield* Effect.flip(f.run(otherLogical.inspect(id(10))))).toMatchObject({
                            reason: 'policy-denied',
                        });
                        yield* Ref.set(f.override, undefined);
                        const foreignAttempt = yield* f.run(foreign.begin(id(10), lifecycle));
                        expect(foreignAttempt.fresh).toBe(true);
                        expect(foreignAttempt.attempt.tenant).toBe(TenantId.make(id(90)));
                        expect(yield* Ref.get(f.boundTenants)).toEqual([tenant, TenantId.make(id(90))]);
                        expect((yield* f.feed.read(0, 100)).events).toHaveLength(1);
                    }
                )
        );

        it.scoped(
            'allows only one ready fact per incarnation/generation but a fresh incarnation can become ready',
            /** Exercise ready-fact uniqueness separately from restart identity. */ () =>
                Effect.gen(
                    /** Compare duplicate requests, new generations and new incarnations against the feed. */ function* () {
                        const f = yield* fixture(dialect);
                        for (const request of [id(10), id(11)]) yield* f.run(f.producer.begin(request, ready()));
                        yield* f.run(f.producer.confirm(id(10)));
                        yield* f.run(f.producer.confirm(id(10)));
                        expect(yield* Effect.flip(f.run(f.producer.confirm(id(11))))).toMatchObject({
                            reason: 'conflict',
                        });
                        expect((yield* f.run(f.producer.inspect(id(11)))).status).toBe('unresolved');
                        yield* f.run(f.producer.begin(id(12), ready(2)));
                        yield* f.run(f.producer.confirm(id(12)));
                        const restarted = yield* f.build(yield* f.connect());
                        yield* f.run(restarted.begin(id(13), ready()));
                        yield* f.run(restarted.confirm(id(13)));
                        const events = (yield* f.feed.read(0, 100)).events.map(
                            /** Inspect facts independently of their feed cursors. */ ({ event }) => event
                        );
                        expect(
                            events.map(
                                /** Check contiguous publication order after duplicate confirmation. */ (event) =>
                                    event.sequence
                            )
                        ).toEqual([1, 2, 3]);
                        expect(
                            events.map(
                                /** Compare the incarnation/generation identity preserved in each ready fact. */ (
                                    event
                                ) => event.projection
                            )
                        ).toEqual([
                            { kind: 'platform.ready', runtimeId: f.producer.runtime.incarnation, generation: 1 },
                            { kind: 'platform.ready', runtimeId: f.producer.runtime.incarnation, generation: 2 },
                            { kind: 'platform.ready', runtimeId: restarted.runtime.incarnation, generation: 1 },
                        ]);
                        yield* Ref.set(f.verdict, 'committed');
                        expect(yield* Effect.flip(f.run(restarted.reconcile(id(11))))).toMatchObject({
                            reason: 'conflict',
                        });
                        expect((yield* f.feed.read(0, 100)).events).toHaveLength(3);
                    }
                )
        );

        it.scoped(
            'rolls back staged feed, cursor and status when the final status write fails, then retries atomically',
            /** Exercise all-or-nothing publication when the final journal update fails. */ () =>
                Effect.gen(
                    /** Inject a database failure at the final status write, then retry after removing it. */ function* () {
                        const f = yield* fixture(dialect);
                        yield* f.run(f.producer.begin(id(10), lifecycle));
                        // Fail after publication staging to prove status, feed and cursor share one transaction.
                        if (dialect === 'sqlite')
                            yield* f.sql`CREATE TRIGGER producer_fail BEFORE UPDATE OF state ON hook_producer_attempt WHEN NEW.state = 'committed' BEGIN SELECT RAISE(ABORT, 'synthetic producer failure'); END`;
                        else {
                            yield* f.sql`CREATE FUNCTION producer_fail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic producer failure'; END $$`;
                            yield* f.sql`CREATE TRIGGER producer_fail BEFORE UPDATE OF state ON hook_producer_attempt FOR EACH ROW WHEN (NEW.state = 'committed') EXECUTE FUNCTION producer_fail()`;
                        }
                        for (const operation of [f.producer.confirm(id(10)), f.producer.reconcile(id(10))]) {
                            yield* Ref.set(f.verdict, 'committed');
                            expect(yield* Effect.flip(f.run(operation))).toMatchObject({ reason: 'unavailable' });
                            expect((yield* f.run(f.producer.inspect(id(10)))).status).toBe('unresolved');
                            expect(yield* f.feed.read(0, 100)).toEqual({ cursor: 0, events: [] });
                            expect(yield* f.sql`SELECT * FROM hook_event`).toHaveLength(0);
                            expect(yield* f.sql`SELECT sequence FROM hook_producer_head`).toEqual([
                                { sequence: dialect === 'postgres' ? '0' : 0 },
                            ]);
                        }
                        if (dialect === 'sqlite') yield* f.sql`DROP TRIGGER producer_fail`;
                        else yield* f.sql`DROP TRIGGER producer_fail ON hook_producer_attempt`;
                        expect(yield* f.run(f.producer.reconcile(id(10)))).toBe('committed');
                        expect(yield* f.run(f.producer.confirm(id(10)))).toBe('committed');
                        const feed = yield* f.feed.read(0, 100);
                        expect(feed.cursor).toBe(1);
                        expect(
                            feed.events.map(
                                /** Compare cursor and producer sequence to detect partial rollback gaps. */ ({
                                    cursor,
                                    event,
                                }) => [cursor, event.id, event.sequence]
                            )
                        ).toEqual([[1, id(10), 1]]);
                    }
                )
        );

        it.scoped(
            'rechecks current authority for duplicate, inspection, confirmation and terminal reconciliation',
            /** Exercise live revocation for both unresolved and terminal attempts. */ () =>
                Effect.gen(
                    /** Revoke authority around confirmation to prove replay never bypasses permission checks. */ function* () {
                        const f = yield* fixture(dialect);
                        yield* f.run(f.producer.begin(id(10), lifecycle));
                        yield* Ref.set(f.allowed, false);
                        for (const operation of [
                            f.producer.begin(id(11), lifecycle),
                            f.producer.begin(id(10), lifecycle),
                            f.producer.inspect(id(10)),
                            f.producer.inspect(id(99)),
                            f.producer.confirm(id(10)),
                            f.producer.confirm(id(99)),
                            f.producer.reconcile(id(10)),
                            f.producer.reconcile(id(99)),
                        ])
                            expect(
                                yield* Effect.flip(
                                    f.run<Effect.Effect.Success<typeof operation>, HookDenied | HookOutboxFailure>(
                                        operation
                                    )
                                )
                            ).toMatchObject({
                                _tag: 'HookDenied',
                                reason: 'policy-denied',
                            });
                        expect(yield* f.feed.read(0, 100)).toEqual({ cursor: 0, events: [] });
                        expect(yield* f.sql`SELECT state FROM hook_producer_attempt`).toEqual([
                            { state: 'unresolved' },
                        ]);
                        yield* Ref.set(f.allowed, true);
                        yield* f.run(f.producer.confirm(id(10)));
                        yield* Ref.set(f.allowed, false);
                        for (const operation of [
                            f.producer.begin(id(10), lifecycle),
                            f.producer.confirm(id(10)),
                            f.producer.reconcile(id(10)),
                        ])
                            expect(
                                yield* Effect.flip(
                                    f.run<Effect.Effect.Success<typeof operation>, HookDenied | HookOutboxFailure>(
                                        operation
                                    )
                                )
                            ).toMatchObject({
                                reason: 'policy-denied',
                            });
                        expect(yield* Ref.get(f.reconciliations)).toBe(0);
                        expect((yield* f.feed.read(0, 100)).events).toHaveLength(1);
                        expect(
                            yield* Effect.flip(
                                f.producer.begin(id(12), lifecycle).pipe(Effect.provide(HookProducerDeny))
                            )
                        ).toMatchObject({ reason: 'policy-denied' });
                    }
                )
        );

        it.scoped(
            'rejects malformed requests, targets and bindings before journaling or publishing',
            /** Exercise validation and independent transaction requirements. */ () =>
                Effect.gen(
                    /** Submit malformed and forged inputs and verify none become durable intent or feed facts. */ function* () {
                        const f = yield* fixture(dialect);
                        for (const request of ['', 'not-a-uuid']) {
                            for (const operation of [
                                f.producer.begin(request, lifecycle),
                                f.producer.inspect(request),
                                f.producer.confirm(request),
                                f.producer.reconcile(request),
                            ])
                                expect(
                                    yield* Effect.flip(
                                        f.run<Effect.Effect.Success<typeof operation>, HookDenied | HookOutboxFailure>(
                                            operation
                                        )
                                    )
                                ).toMatchObject({
                                    reason: 'invalid',
                                });
                        }
                        for (const target of [
                            { ...ready(), generation: 0 },
                            { ...ready(), generation: 1.5 },
                            { ...lifecycle, module: 'INVALID' },
                            { ...lifecycle, purpose: 'caller.classification' },
                        ])
                            expect(yield* Effect.flip(f.run(f.producer.begin(id(10), target)))).toMatchObject({
                                reason: 'invalid',
                            });
                        for (const altered of [
                            { ...binding(f.producer.runtime.incarnation, lifecycle), purpose: 'INVALID' },
                            { ...binding(f.producer.runtime.incarnation, lifecycle), extra: 'not-metadata' },
                            {
                                ...binding(f.producer.runtime.incarnation, ready()),
                                projection: { kind: 'platform.ready' as const, runtimeId: id(90), generation: 1 },
                            },
                            binding(f.producer.runtime.incarnation, ready(2)),
                            binding(f.producer.runtime.incarnation, lifecycle),
                        ]) {
                            yield* Ref.set(f.override, altered);
                            expect(yield* Effect.flip(f.run(f.producer.begin(id(10), ready())))).toMatchObject({
                                reason: 'invalid',
                            });
                        }
                        const invalidVersion = binding(f.producer.runtime.incarnation, lifecycle);
                        if (invalidVersion.projection.kind === 'module.lifecycle') {
                            Reflect.set(invalidVersion.projection.identity, 'version', 'latest');
                            yield* Ref.set(f.override, invalidVersion);
                            expect(yield* Effect.flip(f.run(f.producer.begin(id(10), lifecycle)))).toMatchObject({
                                reason: 'invalid',
                            });
                        }
                        for (const projection of [
                            {
                                kind: 'module.lifecycle' as const,
                                operation: 'ready' as const,
                                identity,
                                from: 'installed' as const,
                                to: 'active' as const,
                            },
                            {
                                kind: 'module.lifecycle' as const,
                                operation: 'activate' as const,
                                identity: { ...identity, module: 'foreign' },
                                from: 'installed' as const,
                                to: 'active' as const,
                            },
                            {
                                kind: 'module.lifecycle' as const,
                                operation: 'activate' as const,
                                identity,
                                from: 'active' as const,
                                to: 'active' as const,
                            },
                        ]) {
                            yield* Ref.set(f.override, {
                                purpose: 'fixture.lifecycle',
                                profile: 'restricted',
                                operation: 'protected',
                                projection,
                            });
                            expect(yield* Effect.flip(f.run(f.producer.begin(id(10), lifecycle)))).toMatchObject({
                                reason: 'invalid',
                            });
                        }
                        expect(yield* Effect.flip(f.run(f.producer.inspect(id(99))))).toMatchObject({
                            reason: 'policy-denied',
                        });
                        expect(yield* Effect.flip(f.build(f.sql, tenant, 'INVALID'))).toMatchObject({
                            reason: 'invalid',
                        });
                        // Even an owned outer SQL transaction must not swallow the journal's independent intent commit.
                        for (const operation of [
                            f.producer.begin(id(20), lifecycle),
                            f.producer.inspect(id(20)),
                            f.producer.confirm(id(20)),
                            f.producer.reconcile(id(20)),
                        ])
                            expect(
                                yield* Effect.flip(
                                    f.run(
                                        f.sql.withTransaction<
                                            HookProducerPolicy,
                                            HookDenied | HookOutboxFailure,
                                            Effect.Effect.Success<typeof operation>
                                        >(operation)
                                    )
                                )
                            ).toMatchObject({ reason: 'transaction-active' });
                        expect(yield* Effect.flip(f.sql.withTransaction(f.build()))).toMatchObject({
                            reason: 'transaction-active',
                        });
                        const defect = yield* Effect.flip(
                            f.producer.begin(id(21), lifecycle).pipe(
                                Effect.provideService(HookProducerPolicy, {
                                    ...f.policy,
                                    /** Simulate a policy defect whose private cause must not escape the boundary. */
                                    bind: () => Effect.die('private-producer-policy-canary'),
                                })
                            )
                        );
                        expect(defect).toMatchObject({ _tag: 'HookOutboxFailure', reason: 'unavailable' });
                        expect(JSON.stringify(defect)).not.toContain('private-producer-policy-canary');
                        expect(yield* f.sql`SELECT * FROM hook_producer_attempt`).toHaveLength(0);
                        expect(yield* f.feed.read(0, 100)).toEqual({ cursor: 0, events: [] });
                    }
                )
        );

        it.scoped(
            'deduplicates matching and fences contradictory stale reconciliation on separate clients',
            /** Exercise terminal compare-and-set fencing across clients. */ () =>
                Effect.gen(
                    /** Pause a reconciliation while another client commits the same retained request. */ function* () {
                        const f = yield* fixture(dialect);
                        const second = yield* f.build(yield* f.connect());
                        for (const [request, verdict] of [
                            [id(10), 'committed'],
                            [id(11), 'abandoned'],
                        ] as const) {
                            yield* f.run(f.producer.begin(request, lifecycle));
                            const entered = yield* Deferred.make<void>();
                            const release = yield* Deferred.make<void>();
                            const stale = yield* second.reconcile(request).pipe(
                                Effect.provideService(HookProducerPolicy, {
                                    ...f.policy,
                                    /** Hold an owner verdict until a competing confirmation has committed. */
                                    reconcile: () =>
                                        Deferred.succeed(entered, undefined).pipe(
                                            Effect.zipRight(Deferred.await(release)),
                                            Effect.as(verdict)
                                        ),
                                }),
                                Effect.either,
                                Effect.fork
                            );
                            yield* Deferred.await(entered);
                            // Both authorities have read unresolved; the stale result cannot overwrite this commit.
                            yield* f.run(f.producer.confirm(request));
                            yield* Deferred.succeed(release, undefined);
                            expect(yield* Fiber.join(stale)).toMatchObject(
                                verdict === 'committed'
                                    ? { _tag: 'Right', right: 'committed' }
                                    : { _tag: 'Left', left: { reason: 'conflict' } }
                            );
                            expect((yield* f.run(second.inspect(request))).status).toBe('committed');
                        }
                        expect(
                            (yield* f.feed.read(0, 100)).events.map(
                                /** Detect duplicate publication from stale matching verdicts. */ ({ event }) =>
                                    event.id
                            )
                        ).toEqual([id(10), id(11)]);
                    }
                )
        );
    });
