/**
 * @file tests/storage/src/hook.spec.ts
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
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { SqliteClient } from '@effect/sql-sqlite-node';
import { describe, expect, expectTypeOf, it } from '@effect/vitest';
import {
    HookChangeFeed,
    HookClaim,
    HookDeclaration,
    HookEvent,
    HookOutbox,
    HookOutboxFailure,
    HookObserverFailure,
    HookOperatorPolicy,
    HookOperatorDeny,
    HookDenied,
    HookRecovery,
    HookReleasePolicy,
    HookReleaseDeny,
} from '@eventiva/contracts/hook';
import { CurrentTenant, Storage } from '@eventiva/contracts/storage';
import { define } from '@eventiva/contracts/action';
import { Authorizer, Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import { SubjectId, TenantId } from '@eventiva/contracts/ids';
import { Flags } from '@eventiva/contracts/flags';
import { hookStorage } from '@eventiva/integrations.sql/hook';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { HookDispatcher, HookDispatcherLive, HookSink } from '@eventiva/runtime/hook';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, ActionHostLive, type InvocationError } from '@eventiva/runtime/host';
import {
    Approvals,
    ExecutionPolicy,
    IdentityResolver,
    InputDigest,
    InvocationDenied,
    type InvocationResult,
} from '@eventiva/runtime/invocation';
import { durable } from '@eventiva/runtime/storage';
import {
    ConfigProvider,
    Context,
    Deferred,
    Effect,
    Either,
    Exit,
    Fiber,
    Layer,
    Option,
    Ref,
    Schema,
    Scope,
    TestClock,
} from 'effect';

const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const tenant = TenantId.make(id(1));
const identity = { module: 'fixture', version: '1.0.0', generation: 1 };
const declaration = (name = 'fixture.observe', capacity = 4) =>
    Schema.decodeUnknownSync(HookDeclaration)({
        format: 1,
        pin: { tenant, owner: identity, hook: name, revision: 1 },
        delivery: 'post-commit',
        target: 'declarative',
        capability: { kind: 'observation' },
        observations: ['domain.change'],
        profiles: ['baseline', 'sensitive', 'restricted', 'vault'],
        maxAttempts: 3,
        retryDelayMs: 10,
        timeoutMs: 100,
        concurrency: 2,
        capacity,
    });
const event = (sequence = 1, resource = 'fixture.record') =>
    Schema.decodeUnknownSync(HookEvent)({
        format: 1,
        id: id(sequence + 10),
        tenant,
        commit: id(sequence + 20),
        resource,
        resourceId: id(5),
        purpose: 'fixture.notify',
        profile: 'baseline',
        operation: 'ordinary',
        sequence,
        projection: { kind: 'domain.change', identity, change: 'updated', revision: sequence },
    });
const required = (claim: HookClaim | undefined): Effect.Effect<HookClaim, HookOutboxFailure> =>
    claim === undefined ? Effect.fail(new HookOutboxFailure({ reason: 'unavailable' })) : Effect.succeed(claim);
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
// Match the other storage suites' disposable-fixture override, never the application's DATABASE_URL.
const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
const target = new URL(local);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.pathname !== '/eventiva_test')
    throw new Error('Hook conformance requires disposable loopback eventiva_test');
const fixture = (dialect: Dialect, beforeFeed = false) =>
    Effect.gen(function* () {
        yield* TestClock.setTime(1000);
        const directory = yield* Effect.acquireRelease(
            Effect.sync(() => mkdtempSync(join(tmpdir(), 'eventiva-hooks-'))),
            (path) => Effect.sync(() => rmSync(path, { recursive: true, force: true }))
        );
        let url = local;
        if (dialect === 'postgres') {
            const admin = Context.get(yield* Layer.build(pg(local)), SqlClient.SqlClient);
            const name = `hook_${randomUUID().replaceAll('-', '')}`;
            yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
            yield* Effect.addFinalizer(() => admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie));
            const database = new URL(local);
            database.pathname = `/${name}`;
            url = database.href;
        }
        const connect = () =>
            Layer.build(
                dialect === 'postgres' ? pg(url) : SqliteClient.layer({ filename: join(directory, 'outbox.sqlite') })
            );
        const sql = Context.get(yield* connect(), SqlClient.SqlClient);
        yield* migrate(
            dialect,
            (yield* load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url)))).filter(
                (entry) => !beforeFeed || entry.name < '0004.sql'
            )
        ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
        const services = (connection: SqlClient.SqlClient, owner = tenant) =>
            Layer.build(
                hookStorage(dialect).pipe(
                    Layer.provide(Layer.succeed(SqlClient.SqlClient, connection)),
                    Layer.provide(Layer.succeed(CurrentTenant, { id: owner }))
                )
            );
        const context = yield* services(sql);
        return {
            sql,
            connect,
            services,
            store: Context.get(context, Storage),
            outbox: Context.get(context, HookOutbox),
            feed: Context.get(context, HookChangeFeed),
            recovery: Context.get(context, HookRecovery),
        };
    });

// Trusted composition fixture, NOT a production principal registry or generic event-to-input mapper.
const additive = (f: Effect.Effect.Success<ReturnType<typeof fixture>>) =>
    Effect.gen(function* () {
        const principal = Schema.decodeUnknownSync(CallerIdentity)({
            subject: id(80),
            session: id(81),
            tenant,
            kind: 'service',
        });
        const boundPrincipal = yield* Ref.make(principal);
        const active = yield* Ref.make(true);
        const permission = yield* Ref.make(true);
        const inputPermission = yield* Ref.make(true);
        const capacityAvailable = yield* Ref.make(true);
        const approvalRequired = yield* Ref.make(false);
        const checks = yield* Ref.make({ identity: 0, permission: 0, input: 0, policy: 0, preparation: 0 });
        const results = yield* Ref.make<ReadonlyArray<InvocationResult<InvocationError>>>([]);
        const spec = define('fixture.annotate', {
            version: 1,
            description: 'Append an authorized metadata annotation in the fixture database.',
            input: Schema.Struct({ resourceId: Schema.UUID, revision: Schema.Int }),
            output: Schema.Struct({ accepted: Schema.Boolean }),
            permission: 'fixture.annotate',
            sideEffect: 'write',
            offline: 'online-only',
        });
        const d = Schema.decodeUnknownSync(HookDeclaration)({
            ...declaration('fixture.additive'),
            capability: { kind: 'additive', action: spec.name, version: spec.version },
        });
        yield* f.sql`CREATE TABLE hook_action_effect (resource_id text NOT NULL, revision integer NOT NULL)`;
        const flags = Layer.succeed(Flags, {
            evaluate: (flag) => Effect.succeed({ flag: flag.key, value: true, reason: 'TEST', fallback: false }),
        });
        const security = Layer.mergeAll(
            flags,
            Layer.succeed(InputDigest, {
                digest: (canonical) => Effect.sync(() => createHash('sha256').update(canonical).digest('hex')),
            }),
            Layer.succeed(IdentityResolver, {
                resolve: (presented) =>
                    Effect.gen(function* () {
                        yield* Ref.update(checks, (n) => ({ ...n, identity: n.identity + 1 }));
                        if (
                            !(yield* Ref.get(active)) ||
                            presented.subject !== principal.subject ||
                            presented.session !== principal.session ||
                            presented.kind !== 'service' ||
                            presented.tenant !== tenant
                        )
                            return yield* new InvocationDenied({ action: spec.name, reason: 'service-revoked' });
                        return principal;
                    }),
            }),
            Layer.succeed(Authorizer, {
                canInvoke: (caller, action) =>
                    Effect.gen(function* () {
                        yield* Ref.update(checks, (n) => ({ ...n, permission: n.permission + 1 }));
                        if (
                            !(yield* Ref.get(permission)) ||
                            caller.subject !== principal.subject ||
                            caller.tenant !== tenant ||
                            action.permission !== spec.permission
                        )
                            return yield* new Forbidden({ action: action.name, reason: 'service-permission' });
                    }),
                check: (_caller, action, input) =>
                    Effect.gen(function* () {
                        yield* Ref.update(checks, (n) => ({ ...n, input: n.input + 1 }));
                        if (
                            !(yield* Ref.get(inputPermission)) ||
                            typeof input !== 'object' ||
                            input === null ||
                            !('resourceId' in input) ||
                            input.resourceId !== id(5)
                        )
                            return yield* new Forbidden({ action: action.name, reason: 'resource-permission' });
                    }),
            }),
            Layer.succeed(ExecutionPolicy, {
                inspect: () =>
                    Effect.gen(function* () {
                        yield* Ref.update(checks, (n) => ({ ...n, policy: n.policy + 1 }));
                        return {
                            approval: (yield* Ref.get(approvalRequired)) ? ('always' as const) : ('none' as const),
                            routinePreauthorized: false,
                            stepUp: false,
                            bounds: {},
                            currentVersion: 'resource-v7',
                            dependenciesReady: true,
                            capacityAvailable: yield* Ref.get(capacityAvailable),
                        };
                    }),
            }),
            Layer.succeed(Approvals, {
                get: () => Effect.fail(new InvocationDenied({ action: spec.name, reason: 'approval-missing' })),
            })
        );
        const host = Context.get(
            yield* Layer.build(
                ActionHostLive.pipe(
                    Layer.provide(
                        Layer.mergeAll(
                            security,
                            durable.pipe(
                                Layer.provide(
                                    Layer.mergeAll(
                                        Layer.succeed(Storage, f.store),
                                        Layer.succeed(CurrentTenant, { id: tenant })
                                    )
                                )
                            )
                        )
                    )
                )
            ),
            ActionHost
        );
        const binding = implement(spec, (input) =>
            f.sql`
            INSERT INTO hook_action_effect (resource_id, revision) VALUES (${input.resourceId}, ${input.revision})
        `.pipe(Effect.orDie, Effect.as({ accepted: true }))
        );
        yield* host.register({
            manifest: {
                format: 1,
                id: 'fixture',
                version: '1.0.0',
                description: 'Trusted hook sink fixture.',
                actions: [spec.name],
                flags: [],
            },
            actions: [
                {
                    ...binding,
                    prepare: (input) =>
                        Ref.update(checks, (n) => ({ ...n, preparation: n.preparation + 1 })).pipe(
                            Effect.zipRight(binding.prepare(input))
                        ),
                },
            ],
        });
        const sink = HookSink.of({
            deliver: (requested, fact, key) =>
                Effect.gen(function* () {
                    const caller = yield* Ref.get(boundPrincipal);
                    const pin = requested.pin;
                    // Exact trusted subscription binding; a positive generation is not proof of provenance.
                    if (
                        pin.tenant !== d.pin.tenant ||
                        pin.hook !== d.pin.hook ||
                        pin.revision !== d.pin.revision ||
                        pin.owner.module !== d.pin.owner.module ||
                        pin.owner.version !== d.pin.owner.version ||
                        pin.owner.generation !== d.pin.owner.generation ||
                        caller.kind !== 'service' ||
                        caller.subject !== principal.subject ||
                        caller.session !== principal.session ||
                        caller.tenant !== pin.tenant ||
                        fact.tenant !== caller.tenant ||
                        requested.target !== 'declarative' ||
                        requested.capability.kind !== 'additive' ||
                        requested.capability.action !== spec.name ||
                        fact.resource !== 'fixture.record' ||
                        fact.purpose !== 'fixture.notify' ||
                        fact.operation !== 'ordinary' ||
                        fact.projection.kind !== 'domain.change' ||
                        fact.projection.identity.module !== identity.module ||
                        fact.projection.identity.version !== identity.version ||
                        fact.projection.identity.generation !== identity.generation
                    )
                        return yield* new HookObserverFailure();
                    const result = yield* host
                        .execute(
                            requested.capability.action,
                            {
                                resourceId: fact.resourceId,
                                revision: fact.projection.revision,
                            },
                            { idempotencyKey: key, expectedActionVersion: requested.capability.version }
                        )
                        .pipe(
                            Effect.provideService(Caller, caller),
                            Effect.mapError(() => new HookObserverFailure())
                        );
                    yield* Ref.update(results, (all) => [...all, result]);
                    if (Exit.isFailure(result.result)) return yield* new HookObserverFailure();
                }),
        });
        return {
            host,
            spec,
            d,
            principal,
            sink,
            flags,
            boundPrincipal,
            active,
            permission,
            inputPermission,
            capacityAvailable,
            approvalRequired,
            checks,
            results,
        };
    });

for (const dialect of ['sqlite', 'postgres'] as const)
    describe(`${dialect} durable hook outbox`, () => {
        it.scoped('authorizes minimized dead-letter inspection and fences idempotent operator redrive', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const d = declaration();
                const allowed = Layer.succeed(HookOperatorPolicy, { authorize: () => Effect.void });
                yield* f.store.transaction(f.outbox.stage(event(), [d]));
                const first = yield* required(yield* f.outbox.claim(d, 0));
                yield* f.outbox.settle(first, { state: 'dead-letter', reason: 'exhausted' });
                const policyCalls = yield* Ref.make(0);
                const guarded = Layer.succeed(HookOperatorPolicy, {
                    authorize: () => Ref.update(policyCalls, (n) => n + 1),
                });
                for (const operation of [
                    f.recovery.deadLetters(d, null, 1).pipe(Effect.asVoid),
                    f.recovery.replay(d, first.idempotencyKey, id(90)).pipe(Effect.asVoid),
                ])
                    expect(
                        yield* Effect.flip(f.store.transaction(operation).pipe(Effect.provide(guarded)))
                    ).toMatchObject({ reason: 'transaction-active' });
                expect(yield* Ref.get(policyCalls)).toBe(0);
                expect(
                    yield* Effect.flip(f.recovery.deadLetters(d, null, 5).pipe(Effect.provide(HookOperatorDeny)))
                ).toMatchObject({ _tag: 'HookDenied', reason: 'policy-denied' });
                expect(
                    yield* Effect.flip(
                        f.recovery.replay(d, first.idempotencyKey, id(90)).pipe(Effect.provide(HookOperatorDeny))
                    )
                ).toBeInstanceOf(HookDenied);
                expect(yield* f.recovery.deadLetters(d, null, 1).pipe(Effect.provide(allowed))).toEqual([
                    { idempotencyKey: first.idempotencyKey, eventId: event().id, attempt: 1, reason: 'exhausted' },
                ]);
                expect(yield* f.recovery.deadLetters(d, first.idempotencyKey, 1).pipe(Effect.provide(allowed))).toEqual(
                    []
                );
                for (const limit of [0, 101, 1.5])
                    expect(
                        yield* Effect.flip(f.recovery.deadLetters(d, null, limit).pipe(Effect.provide(allowed)))
                    ).toMatchObject({ reason: 'invalid' });
                expect(yield* f.recovery.replay(d, first.idempotencyKey, id(90)).pipe(Effect.provide(allowed))).toBe(
                    true
                );
                const next = yield* required(yield* f.outbox.claim(d, 0));
                expect(next.idempotencyKey).toBe(first.idempotencyKey);
                expect(next.event).toEqual(first.event);
                expect(next.attempt).toBe(1);
                expect(next.lease).not.toBe(first.lease);
                // A repeated operator request cannot reset the new worker, even before its acknowledgement.
                expect(yield* f.recovery.replay(d, first.idempotencyKey, id(90)).pipe(Effect.provide(allowed))).toBe(
                    false
                );
                expect((yield* Effect.flip(f.outbox.settle(first, { state: 'delivered' }))).reason).toBe('lease-lost');
                yield* f.outbox.settle(next, { state: 'delivered' });
                expect(
                    yield* Effect.flip(f.recovery.replay(d, first.idempotencyKey, id(91)).pipe(Effect.provide(allowed)))
                ).toMatchObject({ reason: 'conflict' });
                expect(yield* f.sql`SELECT request_id, attempt, reason FROM hook_redrive`).toEqual([
                    { request_id: id(90), attempt: 1, reason: 'exhausted' },
                ]);
                expect((yield* f.feed.read(0, 100)).events).toHaveLength(1);
            })
        );

        it.scoped('redrive obeys capacity, exact pins, live operator revocation and stream quiescence', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const d = declaration('fixture.observe', 1);
                const allowed = Layer.succeed(HookOperatorPolicy, { authorize: () => Effect.void });
                const replay = (key: string) => f.recovery.replay(d, key, id(90)).pipe(Effect.provide(allowed));
                yield* f.store.transaction(f.outbox.stage(event(), [d]));
                const dead = yield* required(yield* f.outbox.claim(d, 0));
                yield* f.outbox.settle(dead, { state: 'dead-letter', reason: 'denied' });
                yield* f.store.transaction(f.outbox.stage(event(2), [d]));
                expect((yield* Effect.flip(replay(dead.idempotencyKey))).reason).toBe('capacity');
                expect(yield* f.sql`SELECT * FROM hook_redrive`).toHaveLength(0);
                const later = yield* required(yield* f.outbox.claim(d, 0));
                expect((yield* Effect.flip(replay(dead.idempotencyKey))).reason).toBe('conflict');
                yield* f.outbox.settle(later, { state: 'delivered' });
                expect(
                    yield* Effect.flip(
                        f.recovery
                            .replay({ ...d, maxAttempts: 4 }, dead.idempotencyKey, id(90))
                            .pipe(Effect.provide(allowed))
                    )
                ).toMatchObject({ reason: 'conflict' });
                const foreign = yield* f.services(f.sql, TenantId.make(id(99)));
                expect(
                    yield* Effect.flip(
                        Context.get(foreign, HookRecovery)
                            .replay(d, dead.idempotencyKey, id(90))
                            .pipe(Effect.provide(allowed))
                    )
                ).toMatchObject({ reason: 'invalid' });
                expect(yield* replay(dead.idempotencyKey)).toBe(true);
                expect(
                    yield* Effect.flip(
                        f.recovery.replay(d, dead.idempotencyKey, id(90)).pipe(Effect.provide(HookOperatorDeny))
                    )
                ).toBeInstanceOf(HookDenied);
                expect(
                    yield* Effect.flip(f.recovery.replay(d, later.idempotencyKey, id(90)).pipe(Effect.provide(allowed)))
                ).toMatchObject({ reason: 'conflict' });
                const retried = yield* required(yield* f.outbox.claim(d, 0));
                expect(retried.idempotencyKey).toBe(dead.idempotencyKey);
                expect(yield* f.sql`SELECT * FROM hook_redrive`).toHaveLength(1);
                yield* f.outbox.settle(retried, { state: 'dead-letter', reason: 'denied' });
                yield* f.recovery.replay(d, retried.idempotencyKey, id(92)).pipe(Effect.provide(allowed));
                const accepted = yield* Ref.make(0);
                const context = yield* Layer.build(
                    HookDispatcherLive.pipe(
                        Layer.provide(Layer.succeed(HookOutbox, f.outbox)),
                        Layer.provide(HookReleaseDeny),
                        Layer.provide(Layer.succeed(HookSink, { deliver: () => Ref.update(accepted, (n) => n + 1) })),
                        Layer.provide(
                            Layer.succeed(Flags, {
                                evaluate: (flag) =>
                                    Effect.succeed({ flag: flag.key, value: true, reason: 'TEST', fallback: false }),
                            })
                        )
                    )
                );
                const handle = yield* Context.get(context, HookDispatcher).register(d);
                expect(yield* handle.dispatch).toBe('dead-letter');
                expect(yield* Ref.get(accepted)).toBe(0);
                expect(yield* f.recovery.deadLetters(d, null, 1).pipe(Effect.provide(allowed))).toEqual([
                    { idempotencyKey: dead.idempotencyKey, eventId: event().id, attempt: 1, reason: 'denied' },
                ]);
            })
        );

        it.scoped('upgrades without rewriting existing deliveries or inventing historical commit order', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect, true);
                expect(yield* Effect.flip(f.feed.read(0, 1))).toMatchObject({ reason: 'unavailable' });
                const pin = JSON.stringify([
                    tenant,
                    identity.module,
                    identity.version,
                    identity.generation,
                    'fixture.observe',
                    1,
                ]);
                // An existing 0003 producer stored only deliveries; it had no global event/cursor table.
                yield* f.sql`INSERT INTO hook_subscription (pin, tenant, declaration) VALUES (${pin}, ${tenant}, ${JSON.stringify(declaration())})`;
                yield* f.sql`INSERT INTO hook_delivery (idempotency_key, subscription, event_id, resource, sequence, event, state) VALUES (${id(80)}, ${pin}, ${event().id}, ${event().resource}, 1, ${JSON.stringify(event())}, 'pending')`;
                const apply = migrate(
                    dialect,
                    yield* load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url)))
                ).pipe(Effect.provideService(SqlClient.SqlClient, f.sql));
                yield* apply;
                yield* apply;
                // New binaries open their client AFTER migration; SQLite caches failed pre-DDL prepares.
                const upgraded = yield* f.services(Context.get(yield* f.connect(), SqlClient.SqlClient));
                const feed = Context.get(upgraded, HookChangeFeed);
                const outbox = Context.get(upgraded, HookOutbox);
                expect(yield* feed.read(0, 100)).toEqual({ cursor: 0, events: [] });
                const oldClaim = yield* required(yield* outbox.claim(declaration(), 0));
                expect(oldClaim.idempotencyKey).toBe(id(80));
                expect(oldClaim.event).toEqual(event());
                yield* outbox.settle(oldClaim, { state: 'delivered' });
                yield* Context.get(upgraded, Storage).transaction(outbox.stage(event(2), []));
                expect(yield* feed.read(0, 100)).toEqual({ cursor: 1, events: [{ cursor: 1, event: event(2) }] });
            })
        );

        it.scoped('pages committed facts once per tenant without requiring observers and resumes after reconnect', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const first = event(7);
                const second = event(2, 'fixture.other');
                expect(yield* f.feed.read(0, 1)).toEqual({ cursor: 0, events: [] });
                yield* f.store.transaction(f.outbox.stage(first, [declaration(), declaration('fixture.second')]));
                yield* f.store.transaction(f.outbox.stage(first, []));
                yield* f.store.transaction(f.outbox.stage(second, []));
                const foreignTenant = TenantId.make(id(90));
                const foreign = yield* f.services(f.sql, foreignTenant);
                const foreignEvent = { ...first, tenant: foreignTenant };
                yield* Context.get(foreign, Storage).transaction(
                    Context.get(foreign, HookOutbox).stage(foreignEvent, [])
                );
                expect(yield* Context.get(foreign, HookChangeFeed).read(0, 100)).toEqual({
                    cursor: 1,
                    events: [{ cursor: 1, event: foreignEvent }],
                });
                expect(yield* f.feed.read(0, 1)).toEqual({ cursor: 1, events: [{ cursor: 1, event: first }] });
                const connection = Context.get(yield* f.connect(), SqlClient.SqlClient);
                const resumed = Context.get(yield* f.services(connection), HookChangeFeed);
                expect(yield* resumed.read(1, 100)).toEqual({
                    cursor: 2,
                    events: [{ cursor: 2, event: second }],
                });
                expect(yield* resumed.read(2, 100)).toEqual({ cursor: 2, events: [] });
                // Delivery/acknowledgement is independent of feed retention and cursor order.
                yield* f.outbox.settle(yield* required(yield* f.outbox.claim(declaration(), 0)), {
                    state: 'delivered',
                });
                expect((yield* resumed.read(0, 100)).events.map(({ event }) => event.id)).toEqual([
                    first.id,
                    second.id,
                ]);
            })
        );

        it.scoped('rolls back feed admission with the origin and pins, rejects changed facts and invalid reads', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const d = declaration('fixture.limited', 1);
                yield* f.store.transaction(f.outbox.stage(event(), [d]));
                yield* f.store.transaction(f.outbox.stage(event(2), [d]).pipe(Effect.either));
                expect((yield* f.feed.read(0, 100)).events).toHaveLength(1);
                yield* f.store.transaction(
                    f.outbox.stage({ ...event(), purpose: 'fixture.changed' }, []).pipe(Effect.either)
                );
                expect((yield* f.feed.read(0, 100)).events[0]?.event).toEqual(event());
                yield* f.store
                    .transaction(f.outbox.stage(event(2), []).pipe(Effect.zipRight(Effect.fail('abort'))))
                    .pipe(Effect.either);
                expect(yield* f.feed.read(1, 100)).toEqual({ cursor: 1, events: [] });
                yield* f.store.transaction(f.outbox.stage(event(3), []));
                expect(yield* f.feed.read(1, 100)).toEqual({ cursor: 2, events: [{ cursor: 2, event: event(3) }] });
                for (const [after, limit] of [
                    [-1, 1],
                    [0.5, 1],
                    [Number.NaN, 1],
                    [0, 0],
                    [0, 101],
                    [0, 1.5],
                ])
                    expect(yield* Effect.flip(f.feed.read(after ?? 0, limit ?? 0))).toMatchObject({
                        reason: 'invalid',
                    });
                expect(yield* Effect.flip(f.store.transaction(f.feed.read(0, 1)))).toMatchObject({
                    reason: 'transaction-active',
                });
                yield* f.sql`UPDATE hook_event SET event = ${JSON.stringify({ ...event(), tenant: TenantId.make(id(90)) })} WHERE tenant = ${tenant} AND cursor = 1`;
                expect(yield* Effect.flip(f.feed.read(0, 100))).toMatchObject({ reason: 'invalid' });
                yield* f.sql`UPDATE hook_event SET event = ${JSON.stringify({ ...event(), id: id(99) })} WHERE tenant = ${tenant} AND cursor = 1`;
                expect(yield* Effect.flip(f.feed.read(0, 100))).toMatchObject({ reason: 'invalid' });
                yield* f.sql`UPDATE hook_event SET event = ${JSON.stringify({ ...event(), plaintext: 'NEVER-RELEASE' })} WHERE tenant = ${tenant} AND cursor = 1`;
                expect(yield* Effect.flip(f.feed.read(0, 100))).toMatchObject({ reason: 'invalid' });
            })
        );

        it.scoped('does not expose an uncommitted cursor or let a later writer overtake it', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const staged = yield* Deferred.make<void>();
                const release = yield* Deferred.make<void>();
                const first = yield* f.store
                    .transaction(
                        f.outbox
                            .stage(event(7), [])
                            .pipe(
                                Effect.zipRight(Deferred.succeed(staged, undefined)),
                                Effect.zipRight(Deferred.await(release))
                            )
                    )
                    .pipe(Effect.fork);
                yield* Deferred.await(staged);
                const readerSql = Context.get(yield* f.connect(), SqlClient.SqlClient);
                const reader = Context.get(yield* f.services(readerSql), HookChangeFeed);
                expect(yield* reader.read(0, 100)).toEqual({ cursor: 0, events: [] });
                // PostgreSQL uses an independent connection to exercise the database head lock.
                // SQLite's synchronous driver serializes writers on its captured client.
                const writer = dialect === 'postgres' ? yield* f.services(readerSql) : yield* f.services(f.sql);
                const started = yield* Deferred.make<void>();
                const second = yield* Deferred.succeed(started, undefined).pipe(
                    Effect.zipRight(
                        Context.get(writer, Storage).transaction(Context.get(writer, HookOutbox).stage(event(2), []))
                    ),
                    Effect.fork
                );
                yield* Deferred.await(started);
                yield* Effect.yieldNow();
                expect(Option.isNone(yield* Fiber.poll(second))).toBe(true);
                yield* Deferred.succeed(release, undefined);
                yield* Fiber.join(first);
                yield* Fiber.join(second);
                expect(yield* reader.read(0, 100)).toEqual({
                    cursor: 2,
                    events: [
                        { cursor: 1, event: event(7) },
                        { cursor: 2, event: event(2) },
                    ],
                });
            })
        );

        it.scoped(
            'pins the captured canonical action version before preparation, independent of resource version',
            () =>
                Effect.gen(function* () {
                    const f = yield* fixture(dialect);
                    const a = yield* additive(f);
                    const invoke = (expectedActionVersion: number) =>
                        a.host
                            .invoke(
                                a.spec.name,
                                { resourceId: id(5), revision: 1 },
                                { idempotencyKey: 'version-pin', expectedActionVersion, expectedVersion: 'resource-v7' }
                            )
                            .pipe(Effect.provideService(Caller, a.principal));
                    for (const version of [2, 0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])
                        expect(yield* Effect.flip(invoke(version))).toMatchObject({
                            _tag: 'Forbidden',
                            reason: 'action-version-conflict',
                        });
                    expect((yield* Ref.get(a.checks)).preparation).toBe(0);
                    expect(
                        yield* Effect.flip(
                            a.sink.deliver(
                                { ...a.d, capability: { kind: 'additive', action: a.spec.name, version: 2 } },
                                event(),
                                'wrong-sink-version'
                            )
                        )
                    ).toBeInstanceOf(HookObserverFailure);
                    expect((yield* Ref.get(a.checks)).preparation).toBe(0);
                    expect(yield* f.sql`SELECT * FROM hook_action_effect`).toHaveLength(0);
                    expect(yield* f.sql`SELECT * FROM action_commit`).toHaveLength(0);
                    yield* invoke(1);
                    expect(yield* f.sql`SELECT * FROM hook_action_effect`).toHaveLength(1);
                    expect(
                        yield* Effect.flip(
                            a.host
                                .invoke(
                                    a.spec.name,
                                    { resourceId: id(5), revision: 1 },
                                    {
                                        idempotencyKey: 'version-pin',
                                        expectedActionVersion: 1,
                                        expectedVersion: '1',
                                    }
                                )
                                .pipe(Effect.provideService(Caller, a.principal))
                        )
                    ).toMatchObject({ reason: 'version-conflict' });
                    // A cached success is not permission to execute a different registered version.
                    expect(yield* Effect.flip(invoke(2))).toMatchObject({ reason: 'action-version-conflict' });
                    expect(yield* f.sql`SELECT * FROM hook_action_effect`).toHaveLength(1);
                })
        );

        it.scoped('reclaims after canonical sink success before settlement without duplicating SQL effects', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const a = yield* additive(f);
                yield* f.store.commit(
                    { key: 'additive-origin', inputHash: 'origin' },
                    f.outbox.stage(event(), [a.d]).pipe(Effect.as({ output: null, receipt: { committed: true } }))
                );
                const worker = yield* Scope.make();
                const connection = Context.get(yield* f.connect().pipe(Scope.extend(worker)), SqlClient.SqlClient);
                const outbox = Context.get(yield* f.services(connection).pipe(Scope.extend(worker)), HookOutbox);
                const releases = yield* Ref.make(0);
                const dispatchWith = (queue: typeof HookOutbox.Service) =>
                    Effect.gen(function* () {
                        const dispatcher = Context.get(
                            yield* Layer.build(
                                HookDispatcherLive.pipe(
                                    Layer.provide(
                                        Layer.mergeAll(
                                            a.flags,
                                            Layer.succeed(HookOutbox, queue),
                                            Layer.succeed(HookSink, a.sink),
                                            Layer.succeed(HookReleasePolicy, {
                                                authorize: () => Ref.update(releases, (n) => n + 1),
                                            })
                                        )
                                    )
                                )
                            ),
                            HookDispatcher
                        );
                        return yield* dispatcher.register(a.d);
                    });
                const lost = yield* Ref.make<HookClaim | undefined>(undefined);
                const first = yield* dispatchWith({
                    ...outbox,
                    settle: (claim) =>
                        Ref.set(lost, claim).pipe(
                            Effect.zipRight(Effect.fail(new HookOutboxFailure({ reason: 'unavailable' })))
                        ),
                }).pipe(Scope.extend(worker));
                // Inject only acknowledgement loss: the real claim and canonical SQL commit both succeed.
                expect((yield* Effect.flip(first.dispatch)).reason).toBe('unavailable');
                const claim = yield* required(yield* Ref.get(lost));
                expect(yield* f.sql`SELECT * FROM hook_action_effect`).toEqual([{ resource_id: id(5), revision: 1 }]);
                yield* Scope.close(worker, Exit.void);
                yield* f.sql`UPDATE hook_delivery SET lease_until = 0 WHERE idempotency_key = ${claim.idempotencyKey}`;
                const handle = yield* dispatchWith(f.outbox);
                const before = yield* Ref.get(a.checks);
                expect(yield* handle.dispatch).toBe('delivered');
                const after = yield* Ref.get(a.checks);
                for (const key of ['identity', 'permission', 'input', 'policy'] as const)
                    expect(after[key]).toBeGreaterThan(before[key]);
                expect(yield* Ref.get(releases)).toBe(2);
                expect((yield* Ref.get(a.results)).map((result) => result.replayed)).toEqual([false, true]);
                expect((yield* Ref.get(a.results)).every((result) => result.audit === 'durable')).toBe(true);
                expect(yield* f.sql`SELECT * FROM hook_action_effect`).toHaveLength(1);
                expect(yield* f.sql`SELECT * FROM action_commit`).toHaveLength(2);
                expect(yield* f.sql`SELECT * FROM action_receipt`).toHaveLength(3);
                expect(yield* f.sql`SELECT state, attempt FROM hook_delivery`).toEqual([
                    { state: 'delivered', attempt: 2 },
                ]);
                expect((yield* Effect.flip(f.outbox.settle(claim, { state: 'delivered' }))).reason).toBe('lease-lost');
                expect(yield* handle.dispatch).toBe('empty');
                // Same durable key, changed mapped input cannot replay or apply a second effect.
                const changed = {
                    ...claim.event,
                    projection: {
                        kind: 'domain.change' as const,
                        identity,
                        change: 'updated' as const,
                        revision: 2,
                    },
                };
                expect(yield* Effect.flip(a.sink.deliver(a.d, changed, claim.idempotencyKey))).toBeInstanceOf(
                    HookObserverFailure
                );
                const last = (yield* Ref.get(a.results)).at(-1);
                expect(last?.result).toMatchObject({ _tag: 'Failure' });
                if (last !== undefined)
                    expect(yield* Effect.flip(last.result)).toMatchObject({ reason: 'input-changed' });
                expect(yield* f.sql`SELECT * FROM hook_action_effect`).toHaveLength(1);
                expect(yield* f.sql`SELECT * FROM action_commit`).toHaveLength(2);
            })
        );

        it.scoped('rejects tenant/principal/pin/provenance substitutions before canonical business effects', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const a = yield* additive(f);
                for (const caller of [
                    { ...a.principal, tenant: TenantId.make(id(90)) },
                    { ...a.principal, kind: 'human' as const },
                    { ...a.principal, subject: SubjectId.make(id(90)) },
                ]) {
                    yield* Ref.set(a.boundPrincipal, caller);
                    expect(yield* Effect.flip(a.sink.deliver(a.d, event(), 'substitution'))).toBeInstanceOf(
                        HookObserverFailure
                    );
                }
                yield* Ref.set(a.boundPrincipal, a.principal);
                for (const pin of [
                    { ...a.d.pin, tenant: TenantId.make(id(90)) },
                    { ...a.d.pin, hook: 'fixture.foreign' },
                    { ...a.d.pin, revision: 2 },
                    { ...a.d.pin, owner: { ...identity, module: 'foreign' } },
                    { ...a.d.pin, owner: { ...identity, version: '2.0.0' } },
                    { ...a.d.pin, owner: { ...identity, generation: 2 } },
                ])
                    expect(yield* Effect.flip(a.sink.deliver({ ...a.d, pin }, event(), 'substitution'))).toBeInstanceOf(
                        HookObserverFailure
                    );
                for (const fact of [
                    { ...event(), tenant: TenantId.make(id(90)) },
                    ...[
                        { ...identity, module: 'foreign' },
                        { ...identity, version: '2.0.0' },
                        { ...identity, generation: 2 },
                    ].map((producer) => ({
                        ...event(),
                        projection: {
                            kind: 'domain.change' as const,
                            identity: producer,
                            change: 'updated' as const,
                            revision: 1,
                        },
                    })),
                ])
                    expect(yield* Effect.flip(a.sink.deliver(a.d, fact, 'substitution'))).toBeInstanceOf(
                        HookObserverFailure
                    );
                expect(yield* Ref.get(a.results)).toHaveLength(0);
                expect((yield* Ref.get(a.checks)).preparation).toBe(0);
                expect(yield* f.sql`SELECT * FROM hook_action_effect`).toHaveLength(0);
                expect(yield* f.sql`SELECT * FROM action_commit`).toHaveLength(0);
            })
        );

        it.scoped(
            'rechecks revoked service identity, permissions, input policy and required human approval before replay',
            () =>
                Effect.gen(function* () {
                    const f = yield* fixture(dialect);
                    const a = yield* additive(f);
                    yield* a.sink.deliver(a.d, event(), 'accepted');
                    for (const [gate, value, reason] of [
                        [a.permission, false, 'service-permission'],
                        [a.inputPermission, false, 'resource-permission'],
                        [a.active, false, 'service-revoked'],
                        [a.capacityAvailable, false, 'capacity-conflict'],
                        [a.approvalRequired, true, 'approval-required'],
                    ] as const) {
                        yield* Ref.set(gate, value);
                        for (const key of ['accepted', 'new-denied-key']) {
                            expect(yield* Effect.flip(a.sink.deliver(a.d, event(), key))).toBeInstanceOf(
                                HookObserverFailure
                            );
                            const result = (yield* Ref.get(a.results)).at(-1);
                            expect(result?.receipt.outcome).toBe('denied');
                            if (result !== undefined)
                                expect(yield* Effect.flip(result.result)).toMatchObject({ reason });
                        }
                        yield* Ref.set(gate, !value);
                        expect(yield* f.sql`SELECT * FROM hook_action_effect`).toHaveLength(1);
                        expect(yield* f.sql`SELECT * FROM action_commit`).toHaveLength(1);
                    }
                    yield* a.sink.deliver(a.d, event(), 'accepted');
                    expect((yield* Ref.get(a.results)).at(-1)?.replayed).toBe(true);
                    expect(yield* f.sql`SELECT * FROM hook_action_effect`).toHaveLength(1);
                })
        );

        it.scoped('preserves paired inventory rollback, settlement and payment replay semantics', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                yield* f.store.ready;
                yield* f.store.stock(id(70), 7);
                expect(yield* f.store.available(id(70))).toBe(7);
                const handled = yield* f.store.transaction(
                    f.store
                        .reserve(id(71), id(70), 3, 2000)
                        .pipe(
                            Effect.zipRight(Effect.fail(new HookOutboxFailure({ reason: 'conflict' }))),
                            Effect.either
                        )
                );
                expect(Either.isLeft(handled)).toBe(true);
                expect(yield* f.store.available(id(70))).toBe(4);
                yield* f.store.settle(id(71), 'released');
                expect(yield* f.store.available(id(70))).toBe(7);
                const rolledBack = yield* f.store
                    .transaction(
                        f.store
                            .reserve(id(72), id(70), 2, 2000)
                            .pipe(Effect.zipRight(Effect.fail(new HookOutboxFailure({ reason: 'conflict' }))))
                    )
                    .pipe(Effect.either);
                expect(Either.isLeft(rolledBack)).toBe(true);
                expect(yield* f.store.available(id(70))).toBe(7);
                expect(yield* f.store.reconcile('payment-event', 'payment', 'GBP', '12345')).toBe('applied');
                expect(yield* f.store.reconcile('payment-event', 'payment', 'GBP', '12345')).toBe('replayed');
                expect(yield* Effect.flip(f.store.reconcile('payment-event', 'payment', 'GBP', '12346'))).toMatchObject(
                    { _tag: 'StorageConflict', reason: 'input-changed' }
                );
            })
        );

        it.scoped('commits domain data and staged facts atomically; replay never reruns the origin', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const d = declaration();
                expect((yield* Effect.flip(f.outbox.stage(event(), [d]))).reason).toBe('transaction-required');
                expect(yield* Effect.flip(f.sql.withTransaction(f.outbox.stage(event(), [d])))).toMatchObject({
                    reason: 'transaction-required',
                });
                const write = Effect.gen(function* () {
                    yield* f.store.create({
                        id: id(50),
                        state: 'committed',
                        version: 0,
                        payload: { safe: true },
                        leaseUntil: null,
                    });
                    yield* f.outbox.stage(event(), [d]);
                    return { output: null, receipt: { committed: true } };
                });
                const aborted = yield* f.store
                    .commit(
                        { key: 'aborted', inputHash: 'one' },
                        write.pipe(Effect.zipRight(Effect.fail(new HookOutboxFailure({ reason: 'conflict' }))))
                    )
                    .pipe(Effect.either);
                expect(Either.isLeft(aborted)).toBe(true);
                expect(yield* f.store.get(id(50))).toBeUndefined();
                expect(yield* f.outbox.claim(d, 1000)).toBeUndefined();
                expect((yield* f.store.commit({ key: 'one', inputHash: 'one' }, write)).replayed).toBe(false);
                expect((yield* f.store.commit({ key: 'one', inputHash: 'one' }, write)).replayed).toBe(true);
                expect(yield* f.store.get(id(50))).toMatchObject({ state: 'committed' });
                expect((yield* required(yield* f.outbox.claim(d, 1000))).event).toEqual(event());
                expect(yield* f.outbox.claim(d, 1000)).toBeUndefined();
            })
        );

        it.scoped('deduplicates, rejects changed content/policy and rolls back multi-pin capacity failure', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const limited = declaration('fixture.z', 1);
                const other = declaration('fixture.a');
                yield* f.store.transaction(f.outbox.stage(event(), [limited, limited]));
                yield* f.store.transaction(f.outbox.stage(event(), [limited]));
                expect(
                    yield* Effect.flip(
                        f.store.transaction(f.outbox.stage({ ...event(), purpose: 'fixture.changed' }, [limited]))
                    )
                ).toMatchObject({ reason: 'conflict' });
                expect(
                    yield* Effect.flip(f.store.transaction(f.outbox.stage(event(), [{ ...limited, capacity: 2 }])))
                ).toMatchObject({ reason: 'conflict' });
                // The first pin's insert must roll back even if the surrounding operation handles the failure.
                yield* f.store.transaction(f.outbox.stage(event(2), [other, limited]).pipe(Effect.either));
                expect(yield* f.outbox.claim(other, 1000)).toBeUndefined();
                const claim = yield* required(yield* f.outbox.claim(limited, 1000));
                yield* f.outbox.settle(claim, { state: 'delivered' });
                yield* f.store.transaction(f.outbox.stage(event(2), [limited]));
                const second = yield* required(yield* f.outbox.claim(limited, 1000));
                expect(second.event.sequence).toBe(2);
                yield* f.outbox.settle(second, { state: 'delivered' });
                expect(
                    yield* Effect.flip(f.store.transaction(f.outbox.stage({ ...event(), id: id(99) }, [limited])))
                ).toMatchObject({ reason: 'conflict' });
            })
        );

        it.scoped('serializes concurrent admission/claims without overbooking or duplicate leases', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const d = declaration('fixture.observe', 1);
                const admissions = yield* Effect.all(
                    [1, 2].map((n) => f.store.transaction(f.outbox.stage(event(n), [d])).pipe(Effect.either)),
                    { concurrency: 2 }
                );
                expect(admissions.filter(Either.isRight)).toHaveLength(1);
                expect(admissions.filter(Either.isLeft).map((result) => result.left._tag)).toEqual([
                    'HookOutboxFailure',
                ]);
                const claims = yield* Effect.all([f.outbox.claim(d, 1000), f.outbox.claim(d, 1000)], {
                    concurrency: 2,
                });
                expect(claims.filter((claim) => claim !== undefined)).toHaveLength(1);
            })
        );

        it.scoped('orders retrying streams while unrelated streams and observer pins make progress', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const d = declaration();
                const good = declaration('fixture.good');
                yield* f.store.transaction(
                    Effect.gen(function* () {
                        yield* f.outbox.stage(event(), [d, good]);
                        yield* f.outbox.stage(event(2), [d, good]);
                        yield* f.outbox.stage(event(3, 'fixture.other'), [d]);
                    })
                );
                const a = yield* required(yield* f.outbox.claim(d, 1000));
                const availableAt = yield* Effect.sync(() => Date.now() + 60_000);
                yield* f.outbox.settle(a, { state: 'retry', availableAt });
                yield* f.outbox.settle(a, { state: 'retry', availableAt });
                expect((yield* required(yield* f.outbox.claim(d, 999999))).event.sequence).toBe(3);
                expect((yield* required(yield* f.outbox.claim(good, 1000))).event.sequence).toBe(1);
                expect(yield* f.outbox.claim(d, 1000)).toBeUndefined();
                yield* f.sql`UPDATE hook_delivery SET due = 0 WHERE idempotency_key = ${a.idempotencyKey}`;
                const retry = yield* required(yield* f.outbox.claim(d, 0));
                expect(retry.event.sequence).toBe(1);
                expect(retry.idempotencyKey).toBe(a.idempotencyKey);
                expect(retry.lease).not.toBe(a.lease);
                expect((yield* Effect.flip(f.outbox.settle(a, { state: 'retry', availableAt }))).reason).toBe(
                    'lease-lost'
                );
                yield* f.outbox.settle(retry, { state: 'dead-letter', reason: 'exhausted' });
                yield* f.outbox.settle(retry, { state: 'dead-letter', reason: 'exhausted' });
                expect((yield* required(yield* f.outbox.claim(d, 1010))).event.sequence).toBe(2);
            })
        );

        it.scoped(
            'survives worker connection/scope loss; reclaims with a fresh fence and idempotent sink acceptance',
            () =>
                Effect.gen(function* () {
                    const f = yield* fixture(dialect);
                    const d = declaration();
                    yield* f.store.commit(
                        { key: 'origin', inputHash: 'one' },
                        f.outbox.stage(event(), [d]).pipe(Effect.as({ output: null, receipt: { ok: true } }))
                    );
                    yield* f.sql`CREATE TABLE hook_test_sink (id text PRIMARY KEY)`;
                    const worker = yield* Scope.make();
                    const connection = Context.get(yield* f.connect().pipe(Scope.extend(worker)), SqlClient.SqlClient);
                    const context = yield* f.services(connection).pipe(Scope.extend(worker));
                    const first = Context.get(context, HookOutbox);
                    const claim = yield* required(yield* first.claim(d, 1000));
                    // Durable side effect succeeds, but its acknowledgement is lost with this worker.
                    yield* connection`INSERT INTO hook_test_sink (id) VALUES (${claim.idempotencyKey}) ON CONFLICT (id) DO NOTHING`;
                    yield* Scope.close(worker, Exit.void);
                    expect(yield* f.outbox.claim(d, 1000)).toBeUndefined();
                    yield* f.sql`UPDATE hook_delivery SET lease_until = 0 WHERE idempotency_key = ${claim.idempotencyKey}`;
                    const reclaimed = yield* required(yield* f.outbox.claim(d, 0));
                    expect(reclaimed.idempotencyKey).toBe(claim.idempotencyKey);
                    expect(reclaimed.lease).not.toBe(claim.lease);
                    expect(reclaimed.attempt).toBe(2);
                    expect((yield* Effect.flip(f.outbox.settle(claim, { state: 'delivered' }))).reason).toBe(
                        'lease-lost'
                    );
                    yield* f.sql`INSERT INTO hook_test_sink (id) VALUES (${reclaimed.idempotencyKey}) ON CONFLICT (id) DO NOTHING`;
                    yield* f.outbox.settle(reclaimed, { state: 'delivered' });
                    yield* f.outbox.settle(reclaimed, { state: 'delivered' });
                    expect(yield* f.sql`SELECT id FROM hook_test_sink`).toHaveLength(1);
                    expect(yield* f.sql`SELECT key FROM action_commit WHERE key = 'origin'`).toHaveLength(1);
                })
        );

        it.scoped('uses post-lock expiry, rejects stale settlements and dead-letters exhausted abandoned work', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const d = { ...declaration(), maxAttempts: 1 };
                yield* f.store.transaction(f.outbox.stage(event(), [d]));
                const claim = yield* required(yield* f.outbox.claim(d, 1000));
                const locked = yield* Deferred.make<void>();
                const release = yield* Deferred.make<void>();
                const holder = yield* f.sql
                    .withTransaction(
                        Effect.gen(function* () {
                            yield* f.sql`UPDATE hook_subscription SET declaration = declaration`;
                            yield* Deferred.succeed(locked, undefined);
                            yield* Deferred.await(release);
                            yield* f.sql`UPDATE hook_delivery SET lease_until = 0`;
                        })
                    )
                    .pipe(Effect.fork);
                yield* Deferred.await(locked);
                const pending = yield* f.outbox.settle(claim, { state: 'delivered' }).pipe(Effect.either, Effect.fork);
                yield* Effect.yieldNow();
                yield* Deferred.succeed(release, undefined);
                yield* Fiber.join(holder);
                const result = yield* Fiber.join(pending);
                expect(Either.isLeft(result) && result.left.reason).toBe('lease-lost');
                expect(yield* f.outbox.claim(d, 2100)).toBeUndefined();
                expect(
                    (yield* Effect.flip(f.outbox.settle(claim, { state: 'dead-letter', reason: 'exhausted' }))).reason
                ).toBe('lease-lost');
                const states = yield* f.sql<{ state: string }>`SELECT state FROM hook_delivery`;
                expect(states.map((row) => row.state)).toEqual(['dead-letter']);
            })
        );

        it.scoped('binds tenant, exact pin and transaction provenance; corrupt payloads cannot escape decoding', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const otherDatabase = yield* fixture(dialect);
                const d = declaration();
                expect(
                    yield* Effect.flip(
                        f.store.transaction(otherDatabase.store.transaction(otherDatabase.outbox.stage(event(), [d])))
                    )
                ).toMatchObject({ _tag: 'StorageFailure', operation: 'hook-foreign-transaction' });
                expect(
                    yield* Effect.flip(
                        f.store.transaction(
                            otherDatabase.store.commit(
                                { key: 'foreign', inputHash: 'one' },
                                otherDatabase.outbox
                                    .stage(event(), [d])
                                    .pipe(Effect.as({ output: null, receipt: { ok: true } }))
                            )
                        )
                    )
                ).toMatchObject({ _tag: 'StorageFailure', operation: 'hook-foreign-transaction' });
                expect(yield* Effect.flip(f.store.transaction(otherDatabase.store.get(id(77))))).toMatchObject({
                    _tag: 'StorageFailure',
                    operation: 'hook-foreign-transaction',
                });
                expect(
                    yield* Effect.flip(f.sql.withTransaction(f.store.transaction(f.outbox.stage(event(), [d]))))
                ).toMatchObject({ _tag: 'StorageFailure', operation: 'hook-foreign-transaction' });
                expect(yield* otherDatabase.outbox.claim(d, 1000)).toBeUndefined();
                const otherTenant = TenantId.make(id(90));
                const context = yield* f.services(f.sql, otherTenant);
                const otherStore = Context.get(context, Storage);
                const other = Context.get(context, HookOutbox);
                const foreign = { ...d, pin: { ...d.pin, tenant: otherTenant } };
                const foreignEvent = { ...event(), tenant: otherTenant };
                expect(yield* Effect.flip(f.store.transaction(other.stage(foreignEvent, [foreign])))).toMatchObject({
                    reason: 'transaction-required',
                });
                expect(yield* Effect.flip(f.store.transaction(f.outbox.stage(foreignEvent, [foreign])))).toMatchObject({
                    reason: 'invalid',
                });
                yield* f.store.transaction(f.store.transaction(f.outbox.stage(event(), [d])));
                yield* otherStore.transaction(other.stage(foreignEvent, [foreign]));
                expect((yield* Effect.flip(other.claim(d, 1000))).reason).toBe('invalid');
                const newer = { ...d, pin: { ...d.pin, owner: { ...identity, generation: 2 } } };
                expect(yield* f.outbox.claim(newer, 1000)).toBeUndefined();
                const claim = yield* required(yield* other.claim(foreign, 1000));
                expect((yield* Effect.flip(f.outbox.settle(claim, { state: 'delivered' }))).reason).toBe('invalid');
                const corrupted = { ...event(), plaintext: 'NEVER-RELEASE' };
                yield* f.sql`UPDATE hook_delivery SET event = ${JSON.stringify(corrupted)} WHERE event_id = ${event().id} AND state = 'pending'`;
                expect((yield* Effect.flip(f.outbox.claim(d, 1000))).reason).toBe('invalid');
                yield* f.sql`UPDATE hook_delivery SET event = ${JSON.stringify({ ...event(), sequence: 2 })} WHERE event_id = ${event().id} AND state = 'pending'`;
                expect((yield* Effect.flip(f.outbox.claim(d, 1000))).reason).toBe('invalid');
                const malformed = { ...claim };
                Reflect.set(malformed, 'lease', null);
                expect((yield* Effect.flip(other.settle(malformed, { state: 'delivered' }))).reason).toBe('invalid');
            })
        );

        it.scoped(
            'dispatches only after commit; failed observers cannot undo domain data and missing release policy denies',
            () =>
                Effect.gen(function* () {
                    const f = yield* fixture(dialect);
                    const d = declaration();
                    const calls = yield* Ref.make(0);
                    const services = Layer.mergeAll(
                        Layer.succeed(HookOutbox, f.outbox),
                        HookReleaseDeny,
                        Layer.succeed(HookSink, { deliver: () => Ref.update(calls, (n) => n + 1) }),
                        Layer.succeed(Flags, {
                            evaluate: (flag) =>
                                Effect.succeed({ flag: flag.key, value: true, reason: 'TEST', fallback: false }),
                        })
                    );
                    const denied = Context.get(
                        yield* Layer.build(HookDispatcherLive.pipe(Layer.provide(services))),
                        HookDispatcher
                    );
                    const handle = yield* denied.register(d);
                    yield* f.store.transaction(
                        Effect.gen(function* () {
                            yield* f.store.create({
                                id: id(60),
                                state: 'committed',
                                version: 0,
                                payload: null,
                                leaseUntil: null,
                            });
                            yield* f.outbox.stage(event(), [d]);
                            expect((yield* Effect.flip(handle.dispatch)).reason).toBe('transaction-active');
                        })
                    );
                    expect(yield* handle.dispatch).toBe('dead-letter');
                    expect(yield* Ref.get(calls)).toBe(0);
                    yield* f.store.transaction(f.outbox.stage(event(2), [d]));
                    const failing = Context.get(
                        yield* Layer.build(
                            HookDispatcherLive.pipe(
                                Layer.provide(
                                    Layer.mergeAll(
                                        services,
                                        Layer.succeed(HookReleasePolicy, { authorize: () => Effect.void }),
                                        Layer.succeed(HookSink, {
                                            deliver: () =>
                                                Effect.gen(function* () {
                                                    expect(
                                                        Option.isNone(
                                                            yield* Effect.serviceOption(SqlClient.TransactionConnection)
                                                        )
                                                    ).toBe(true);
                                                    return yield* new HookObserverFailure();
                                                }),
                                        })
                                    )
                                )
                            )
                        ),
                        HookDispatcher
                    );
                    expect(yield* (yield* failing.register(d)).dispatch).toBe('retry');
                    expect(yield* f.store.get(id(60))).toMatchObject({ state: 'committed' });
                })
        );
    });

it('preserves precise outbox, error and dispatcher layer types', () => {
    expectTypeOf<Context.Tag.Service<typeof HookOutbox>['claim']>().returns.toEqualTypeOf<
        Effect.Effect<HookClaim | undefined, HookOutboxFailure>
    >();
    expectTypeOf<Layer.Layer.Success<typeof HookDispatcherLive>>().toEqualTypeOf<HookDispatcher>();
    expectTypeOf<Layer.Layer.Error<typeof HookDispatcherLive>>().toEqualTypeOf<never>();
    expectTypeOf<HookEvent>().toEqualTypeOf<typeof HookEvent.Type>();
    expectTypeOf<HookOutboxFailure['reason']>().toEqualTypeOf<
        | 'unavailable'
        | 'capacity'
        | 'conflict'
        | 'lease-lost'
        | 'invalid'
        | 'transaction-required'
        | 'transaction-active'
    >();
    expectTypeOf<Layer.Layer.Context<ReturnType<typeof hookStorage>>>().toEqualTypeOf<
        SqlClient.SqlClient | CurrentTenant
    >();
    expect(Schema.is(HookOutboxFailure)(new HookOutboxFailure({ reason: 'invalid' }))).toBe(true);
});
