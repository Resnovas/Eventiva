/**
 * @file tests/runtime/src/inventory-kit.spec.ts
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
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { expect, it } from '@effect/vitest';
import { Authorizer, Caller } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import { Flags, safeDefault } from '@eventiva/contracts/flags';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import { DefineKit, GetKit, Kit } from '@eventiva/contracts/inventory-kit';
import { ArchiveProduct, CreateProduct, GetProduct, productActions } from '@eventiva/contracts/inventory-product';
import { ResourceFailure, Resources, type ResourceProvider } from '@eventiva/contracts/resource';
import { CurrentTenant, Storage } from '@eventiva/contracts/storage';
import { client } from '@eventiva/integrations.sql/postgres';
import { localFile } from '@eventiva/integrations.sql/sqlite';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { migrateResources, resourceProvider } from '@eventiva/integrations.sql/resource';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { kitModule, kitResources } from '@eventiva/runtime/inventory-kit';
import { productModule, productResources } from '@eventiva/runtime/inventory-product';
import { InputDigest, IdentityResolver } from '@eventiva/runtime/invocation';
import { resourceRuntime } from '@eventiva/runtime/resource';
import { durable } from '@eventiva/runtime/storage';
import { makeTestOnlyHarness } from '@eventiva/runtime/testing';
import { ConfigProvider, Context, Deferred, Effect, Either, Fiber, Layer, Redacted, Ref } from 'effect';

/** Stable synthetic identities leave no dependence on real tenants, suppliers or equipment. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const caller = {
    subject: SubjectId.make(id(1)),
    tenant: TenantId.make(id(2)),
    session: SessionId.make(id(3)),
    kind: 'human' as const,
};
/** Distinct ordered quantities make swapped, flattened and silently defaulted components observable. */
const edge = (n: number, quantity = 3, optional = false) => ({ product: id(n), quantity, optional });
/** Fixture-only scope never allows an action input to choose its own tenant. */
const scoped = <A, E, R>(effect: Effect.Effect<A, E, R>, who = caller) =>
    effect.pipe(Effect.provideService(Caller, who), Effect.provideService(CurrentTenant, { id: who.tenant }));

/** Create only disposable loopback databases, or retained SQLite files beneath private scratch. */
const database = (dialect: Dialect) =>
    Effect.gen(
        /** Retain a factory so a newly acquired client cannot pass persistence checks using an old in-memory connection. */ function* () {
            // Fail before CREATE DATABASE if fixture configuration points at a non-loopback or unexpected administrative database.
            /** Use the existing approved SQL configuration boundary. */
            const pg = (url: string) =>
                client.pipe(
                    Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]]))))
                );
            /** Acquire an independent scoped connection against this fixture only. */
            type Open = () => ReturnType<typeof pg> | ReturnType<typeof localFile>;
            let open: Open;
            if (dialect === 'postgres') {
                const url = new URL(
                    process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test'
                );
                if (url.hostname !== '127.0.0.1' || url.pathname !== '/eventiva_test')
                    return yield* Effect.dieMessage('Disposable loopback fixture required');
                const admin = Context.get(yield* Layer.build(pg(url.toString())), SqlClient.SqlClient);
                const name = `kit_${randomUUID().replaceAll('-', '')}`;
                yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                yield* Effect.addFinalizer(
                    /** Clients close first under reverse-order scope finalization. */ () =>
                        admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie)
                );
                url.pathname = '/' + name;
                open = /** Reconnect to the same retained SQL state, not a fresh database. */ () => pg(url.toString());
            } else {
                const directory = fileURLToPath(new URL('../../../.amp/in/orb-backup/kit-tests/', import.meta.url));
                mkdirSync(directory, { recursive: true });
                const filename = `${directory}${randomUUID()}.sqlite`;
                open =
                    /** Separate SQLite clients may busy-refuse; the runtime must never blindly retry that error. */ () =>
                        localFile(Redacted.make(filename));
            }
            const sql = Context.get(yield* Layer.build(open()), SqlClient.SqlClient);
            yield* migrate(
                dialect,
                yield* load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url)))
            ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            return { sql, open };
        }
    );

/** Build real provider/host fixtures with explicit fault controls, while all storage and rollback stay in SQL. */
const setup = (dialect: Dialect) =>
    Effect.gen(
        /** The kit and product modules share one durable owner; controls remain outside SQL so rollback cannot undo revocation. */ function* () {
            // A fresh tenant fixture isolates the 1000-node boundary from ordinary behavior and race tests.
            const db = yield* database(dialect);
            const kits = yield* kitResources;
            const products = yield* productResources;
            const declarations = [products.products, products.guard, kits.definitions, kits.guard];
            const enabled = yield* Ref.make<boolean | null>(true);
            const permitted = yield* Ref.make(true);
            const resourceAllowed = yield* Ref.make(true);
            const validIdentity = yield* Ref.make(true);
            const mutate = yield* Ref.make(false);
            const retained: Array<unknown> = [];
            const fault = yield* Ref.make<
                'none' | 'rollback' | 'flag' | 'permission' | 'resource' | 'identity' | 'conflict' | 'storage'
            >('none');
            const racing = yield* Ref.make(false);
            const arrivals = yield* Ref.make(0);
            const barrier = yield* Deferred.make<void>();
            const hold = yield* Ref.make(false);
            const heldAttempts = yield* Ref.make(0);
            const acquired = yield* Deferred.make<void>();
            const attempted = yield* Deferred.make<void>();
            const release = yield* Deferred.make<void>();
            const authority = Layer.succeed(Authorizer, {
                /** Consult revocable grants every time, including after a database lock wait. */
                canInvoke: (_who, action) =>
                    Ref.get(permitted).pipe(
                        Effect.flatMap(
                            /** Do not derive authority from a supplied Product ID. */ (value) =>
                                value
                                    ? Effect.void
                                    : Effect.fail(new Forbidden({ action: action.name, reason: 'permission' }))
                        )
                    ),
                /** Deliberately corrupt only observer copies, never the request's original composition. */
                check: (_who, _action, target) =>
                    Effect.gen(
                        /** Nested mutation distinguishes real detachment from a shallow top-level clone. */ function* () {
                            // Schema-free introspection keeps this hostile observer independent of the handler's component type.
                            retained.push(target);
                            if (
                                (yield* Ref.get(mutate)) &&
                                typeof target === 'object' &&
                                target !== null &&
                                'components' in target &&
                                Array.isArray(target.components) &&
                                target.components[0]
                            )
                                Reflect.set(target.components[0], 'quantity', 999);
                        }
                    ),
            });
            const flags = Layer.succeed(Flags, {
                /** Null proves safe-default refusal without changing any remotely configured flag. */
                evaluate: (flag) =>
                    Ref.get(enabled).pipe(
                        Effect.map(
                            /** Preserve declaration metadata while explicitly enabling only this fixture. */ (
                                value
                            ) => (value === null ? safeDefault(flag) : { ...safeDefault(flag), value, fallback: false })
                        )
                    ),
            });
            /** Independent hosts may share a SQL connection or use a different pool to force a real lock race. */
            const hostFor = (sql: typeof SqlClient.SqlClient.Service, who = caller) =>
                Effect.gen(
                    /** Migrate declared Resources only; there is no kit-specific physical SQL schema or runtime writer. */ function* () {
                        // SQL's tenant binding remains in force, including when test grants are permissive.
                        yield* migrateResources(dialect, who.tenant, declarations, {
                            kind: 'additive',
                            restartRequired: false,
                            retainedGenerations: 0,
                        }).pipe(Effect.provideService(SqlClient.SqlClient, sql));
                        const base = yield* resourceProvider(
                            dialect,
                            who.tenant,
                            { key: { module: 'inventory.sql', instance: 'primary' }, version: '1.0.0' },
                            declarations
                        ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
                        const provider: ResourceProvider = {
                            ...base,
                            driver: {
                                ...base.driver,
                                /** Force initial graph-guard absence to be observed from both independent PostgreSQL transactions. */
                                get: (resource, key) =>
                                    base.driver.get(resource, key).pipe(
                                        Effect.tap(
                                            /** SQLite single-owner transactions serialize before this point and cannot use a two-reader barrier. */ () =>
                                                Effect.gen(
                                                    /** This is deterministic race coordination, not a sleep-based probabilistic test. */ function* () {
                                                        // Both would accept the cycle if validation were just unguarded in-memory preflight.
                                                        if (
                                                            dialect !== 'postgres' ||
                                                            resource !== kits.guard.id ||
                                                            !(yield* Ref.get(racing))
                                                        )
                                                            return;
                                                        const n = yield* Ref.updateAndGet(
                                                            arrivals,
                                                            /** Count only the two first guard reads; a real CAS loser may retry later. */ (
                                                                value
                                                            ) => value + 1
                                                        );
                                                        if (n === 2) yield* Deferred.succeed(barrier, undefined);
                                                        if (n <= 2) yield* Deferred.await(barrier);
                                                    }
                                                )
                                        )
                                    ),
                                /** Inject after actual writes so failure assertions exercise real transaction rollback and history. */
                                write: (resource, key, revision, value) =>
                                    Effect.gen(
                                        /** The second writer signals before SQL; the first can retain its real lock until revocation is applied. */ function* () {
                                            // A synthetic outage must not replace the real write whose atomic rollback is being tested.
                                            const mode = yield* Ref.get(fault);
                                            if (resource.id === kits.guard.id) {
                                                if (yield* Ref.get(hold)) {
                                                    const n = yield* Ref.updateAndGet(
                                                        heldAttempts,
                                                        /** Signal the actual waiter, not the already-held first writer. */ (
                                                            value
                                                        ) => value + 1
                                                    );
                                                    if (n === 2) yield* Deferred.succeed(attempted, undefined);
                                                }
                                                if (mode === 'conflict' || mode === 'storage')
                                                    return yield* Effect.fail(
                                                        new ResourceFailure({
                                                            reason: mode,
                                                            detail: 'Synthetic guard failure',
                                                        })
                                                    );
                                            }
                                            const row = yield* base.driver.write(resource, key, revision, value);
                                            if (resource.id === kits.guard.id) {
                                                if (yield* Ref.get(hold)) {
                                                    yield* Deferred.succeed(acquired, undefined);
                                                    yield* Deferred.await(release);
                                                }
                                                if (mode === 'flag') yield* Ref.set(enabled, false);
                                                if (mode === 'permission') yield* Ref.set(permitted, false);
                                                if (mode === 'resource') yield* Ref.set(resourceAllowed, false);
                                                if (mode === 'identity') yield* Ref.set(validIdentity, false);
                                            }
                                            if (resource.id === kits.definitions.id && mode === 'rollback')
                                                return yield* Effect.fail(
                                                    new ResourceFailure({
                                                        reason: 'storage',
                                                        detail: 'Synthetic post-write failure: private SQL must not escape',
                                                    })
                                                );
                                            return row;
                                        }
                                    ),
                            },
                        };
                        const resources = Context.get(
                            yield* Layer.build(
                                resourceRuntime(
                                    provider,
                                    /** Leave tenant enforcement intact while independently revoking Resource access. */ () =>
                                        Ref.get(resourceAllowed).pipe(
                                            Effect.flatMap(
                                                /** Policy denial is not absence and must not admit a partial graph. */ (
                                                    value
                                                ) =>
                                                    value
                                                        ? Effect.void
                                                        : Effect.fail(
                                                              new ResourceFailure({
                                                                  reason: 'denied',
                                                                  detail: 'Synthetic policy revocation',
                                                              })
                                                          )
                                            )
                                        )
                                )
                            ),
                            Resources
                        );
                        const fixture = yield* makeTestOnlyHarness(who);
                        const persistence = durable.pipe(
                            Layer.provide(Layer.succeed(Storage, provider.storage)),
                            Layer.provide(Layer.succeed(CurrentTenant, { id: who.tenant }))
                        );
                        const services = Layer.mergeAll(
                            fixture.TestOnly,
                            persistence,
                            flags,
                            authority,
                            Layer.succeed(IdentityResolver, {
                                /** A changed session cannot reuse authority captured before guard acquisition. */ resolve:
                                    (presented) =>
                                        Ref.get(validIdentity).pipe(
                                            Effect.map(
                                                /** Return only fixture identities, never credentials. */ (valid) =>
                                                    valid
                                                        ? presented
                                                        : { ...presented, session: SessionId.make(id(999)) }
                                            )
                                        ),
                            }),
                            Layer.succeed(InputDigest, {
                                /** Keep private component IDs out of durable digest fields. */ digest: (value) =>
                                    Effect.sync(
                                        /** One-way real digest replaces the harness's intentionally readable test digest. */ () =>
                                            createHash('sha256').update(value).digest('hex')
                                    ),
                            })
                        );
                        const context = yield* Layer.build(services);
                        const host = Context.get(
                            yield* Layer.build(ActionHostLive.pipe(Layer.provide(services))),
                            ActionHost
                        );
                        yield* host.register(
                            yield* productModule.pipe(
                                Effect.provide(context),
                                Effect.provideService(Resources, resources),
                                Effect.provideService(CurrentTenant, { id: who.tenant })
                            )
                        );
                        yield* host.register(
                            yield* kitModule.pipe(
                                Effect.provide(context),
                                Effect.provideService(Resources, resources),
                                Effect.provideService(CurrentTenant, { id: who.tenant })
                            )
                        );
                        return { host, resources };
                    }
                );
            const first = yield* hostFor(db.sql);
            let key = 100000;
            /** Every ordinary attempt has a new key; replay tests explicitly retain their original key and content. */
            const invoke = (action: string, input: unknown, host = first.host, who = caller, replay = id(key++)) =>
                host.invoke(action, input, { idempotencyKey: replay }).pipe(Effect.provideService(Caller, who));
            /** Fixture creation uses the public Product action rather than allowing kit code to become a product writer. */
            const product = (n: number, unit = 'each', host = first.host, who = caller) =>
                invoke(
                    CreateProduct.name,
                    {
                        id: id(n),
                        product: {
                            name: `Synthetic product ${n}`,
                            sku: `KIT-${n}`,
                            category: 'kits',
                            tracking: 'bulk',
                            unit,
                        },
                    },
                    host,
                    who
                );
            /** Observe definitions through their public action; never call private handlers for business assertions. */
            const get = (n: number, host = first.host, who = caller) => invoke(GetKit.name, { id: id(n) }, host, who);
            /** Replace the entire ordered list at its composition revision, independently of product revisions. */
            const define = (n: number, revision: number, components: Kit['components'], host = first.host) =>
                invoke(DefineKit.name, { id: id(n), revision, components }, host);
            return {
                ...db,
                ...first,
                kits,
                products,
                hostFor,
                invoke,
                product,
                get,
                define,
                enabled,
                permitted,
                resourceAllowed,
                validIdentity,
                mutate,
                retained,
                fault,
                racing,
                hold,
                acquired,
                attempted,
                release,
            };
        }
    );

for (const dialect of ['sqlite', 'postgres'] as const) {
    it.scopedLive(
        `kit composition, revisions, replay, isolation and rollback: ${dialect}`,
        /** Exercise real host admission, Integrity/Audit and Resource transactions on both retained dialects. */ () =>
            Effect.gen(
                /** Exact asymmetric lists reject flattening, defaulting and accidental product revision coupling. */ function* () {
                    // Setup is intentionally shared within this scenario so live revocation cannot hide behind a host rebuild.
                    const f = yield* setup(dialect);
                    expect(yield* f.host.actions).toEqual(
                        [
                            ...productActions.map(
                                /** Compare the preexisting product inventory without replacing it. */ (action) =>
                                    action.name
                            ),
                            'inventory.kit.define',
                            'inventory.kit.get',
                        ].sort()
                    );
                    yield* Ref.set(f.enabled, null);
                    expect(yield* Effect.flip(f.get(10))).toMatchObject({ _tag: 'Unavailable' });
                    yield* Ref.set(f.enabled, true);
                    for (const n of [10, 11, 12, 13, 14]) yield* f.product(n);
                    const before = yield* f.invoke(GetProduct.name, { id: id(10) });
                    const productGuardBefore = yield* scoped(f.resources.query(f.products.guard, { limit: 1 }));
                    const leaf = { id: id(12), revision: 0, components: [] };
                    const original = yield* f.invoke(DefineKit.name, leaf, f.host, caller, id(9000));
                    expect(original).toEqual({ ...leaf, revision: 1 });
                    expect(yield* f.invoke(DefineKit.name, leaf, f.host, caller, id(9000))).toEqual(original);
                    const changed = yield* Effect.flip(
                        f.invoke(DefineKit.name, { ...leaf, components: [edge(13)] }, f.host, caller, id(9000))
                    );
                    expect(changed._tag).toBe('InvocationDenied');
                    expect(yield* scoped(f.resources.history(f.kits.definitions, id(12)))).toHaveLength(1);
                    expect(yield* f.define(11, 0, [edge(12, 7, true), edge(13, 2)])).toEqual({
                        id: id(11),
                        revision: 1,
                        components: [edge(12, 7, true), edge(13, 2)],
                    });
                    yield* Ref.set(f.mutate, true);
                    expect(yield* f.define(10, 0, [edge(11, 5), edge(14, 1000000, true)])).toEqual({
                        id: id(10),
                        revision: 1,
                        components: [edge(11, 5), edge(14, 1000000, true)],
                    });
                    yield* Ref.set(f.mutate, false);
                    expect(yield* f.get(10)).toEqual({
                        id: id(10),
                        revision: 1,
                        components: [edge(11, 5), edge(14, 1000000, true)],
                    });
                    for (const [target, revision, list, tag] of [
                        [10, 0, [], 'RevisionConflict'],
                        [14, 0, [edge(14)], 'KitCycle'],
                        [12, 1, [edge(10)], 'KitCycle'],
                        [12, 1, [edge(10, 9, true)], 'KitCycle'],
                        [10, 1, [edge(12), edge(12, 8, true)], 'DuplicateComponent'],
                        [10, 1, [edge(9999)], 'ProductNotFound'],
                        [9999, 0, [], 'ProductNotFound'],
                    ] as const)
                        expect(yield* Effect.flip(f.define(target, revision, list))).toMatchObject({
                            error: { _tag: tag },
                        });
                    expect(yield* f.get(12)).toEqual(original);
                    expect(yield* f.invoke(GetProduct.name, { id: id(10) })).toEqual(before);
                    expect(yield* scoped(f.resources.query(f.products.guard, { limit: 1 }))).toEqual(
                        productGuardBefore
                    );
                    expect(yield* scoped(f.resources.history(f.products.products, id(10)))).toHaveLength(1);
                    const guard = yield* scoped(f.resources.query(f.kits.guard, { limit: 1 }));
                    yield* Ref.set(f.fault, 'rollback');
                    expect(yield* Effect.flip(f.define(10, 1, [edge(13, 4)]))).toEqual(
                        expect.objectContaining({ error: { _tag: 'KitUnavailable' } })
                    );
                    yield* Ref.set(f.fault, 'none');
                    expect(yield* scoped(f.resources.query(f.kits.guard, { limit: 1 }))).toEqual(guard);
                    expect(yield* scoped(f.resources.history(f.kits.definitions, id(10)))).toHaveLength(1);
                    expect(yield* f.define(10, 1, [edge(13, 4, true)])).toEqual({
                        id: id(10),
                        revision: 2,
                        components: [edge(13, 4, true)],
                    });
                    expect(yield* Effect.flip(f.define(10, 1, []))).toMatchObject({
                        error: { _tag: 'RevisionConflict' },
                    });
                    yield* f.invoke(ArchiveProduct.name, { id: id(13), revision: 1 });
                    expect(yield* f.get(10)).toEqual({ id: id(10), revision: 2, components: [edge(13, 4, true)] });
                    expect(yield* Effect.flip(f.define(10, 2, [edge(13)]))).toMatchObject({
                        error: { _tag: 'ProductArchived' },
                    });
                    expect(yield* Effect.flip(f.define(14, 0, [edge(11)]))).toMatchObject({
                        error: { _tag: 'ProductArchived' },
                    });
                    expect(yield* Effect.flip(f.define(13, 0, []))).toMatchObject({
                        error: { _tag: 'ProductArchived' },
                    });
                    yield* f.product(15, 'metres');
                    expect(yield* Effect.flip(f.define(15, 0, []))).toMatchObject({
                        error: { _tag: 'UnsupportedKitUnit' },
                    });
                    for (const mode of ['flag', 'permission', 'resource', 'identity', 'conflict', 'storage'] as const) {
                        yield* Ref.set(f.fault, mode);
                        const denied = yield* Effect.flip(f.define(14, 0, []));
                        expect(denied).toMatchObject({ error: { _tag: 'KitUnavailable' } });
                        expect(JSON.stringify(denied)).not.toContain('Synthetic');
                        yield* Ref.set(f.fault, 'none');
                        yield* Ref.set(f.enabled, true);
                        yield* Ref.set(f.permitted, true);
                        yield* Ref.set(f.resourceAllowed, true);
                        yield* Ref.set(f.validIdentity, true);
                        expect(yield* Effect.flip(f.get(14))).toMatchObject({ error: { _tag: 'KitNotFound' } });
                    }
                    const reopened = yield* f.hostFor(Context.get(yield* Layer.build(f.open()), SqlClient.SqlClient));
                    expect(yield* f.get(10, reopened.host)).toEqual({
                        id: id(10),
                        revision: 2,
                        components: [edge(13, 4, true)],
                    });
                    const otherDb = yield* database(dialect);
                    const other = { ...caller, tenant: TenantId.make(id(500)) };
                    const foreign = yield* f.hostFor(otherDb.sql, other);
                    expect(yield* Effect.flip(f.get(10, foreign.host, other))).toMatchObject({
                        error: { _tag: 'KitNotFound' },
                    });
                    expect(
                        yield* Effect.flip(
                            f.invoke(DefineKit.name, { id: id(10), revision: 0, components: [] }, foreign.host, other)
                        )
                    ).toMatchObject({ error: { _tag: 'ProductNotFound' } });
                    yield* f.product(10, 'each', foreign.host, other);
                    expect(
                        yield* Effect.flip(
                            f.invoke(
                                DefineKit.name,
                                { id: id(10), revision: 0, components: [edge(11)] },
                                foreign.host,
                                other
                            )
                        )
                    ).toMatchObject({ error: { _tag: 'ProductNotFound' } });
                    expect(
                        yield* f.invoke(
                            DefineKit.name,
                            { id: id(10), revision: 0, components: [] },
                            foreign.host,
                            other
                        )
                    ).toEqual({ id: id(10), revision: 1, components: [] });
                    expect((yield* Effect.either(f.get(10, f.host, other)))._tag).toBe('Left');
                    const receipts = yield* f.sql`SELECT receipt FROM action_receipt`;
                    expect(receipts.length).toBeGreaterThan(0);
                    expect(JSON.stringify(receipts)).not.toContain('Synthetic product');
                    yield* Ref.set(f.hold, true);
                    const suspended = yield* Effect.fork(f.define(14, 0, [edge(12, 17, true)]));
                    yield* Deferred.await(f.acquired);
                    // Corrupt targets retained by earlier authorization after the handler has captured its own request.
                    for (const target of f.retained)
                        if (
                            typeof target === 'object' &&
                            target !== null &&
                            'components' in target &&
                            Array.isArray(target.components) &&
                            target.components[0]
                        )
                            Reflect.set(target.components[0], 'quantity', 888);
                    yield* Ref.set(f.hold, false);
                    yield* Deferred.succeed(f.release, undefined);
                    expect(yield* Fiber.join(suspended)).toEqual({
                        id: id(14),
                        revision: 1,
                        components: [edge(12, 17, true)],
                    });
                }
            ),
        60000
    );

    it.scopedLive(
        `opposite kit edges cannot both commit: ${dialect}`,
        /** Real PostgreSQL uses two pools and a forced initialization race; synchronous SQLite shares its serialized connection. */ () =>
            Effect.gen(
                /** A fresh observer must see a DAG even when two hosts both preflight against an empty composition graph. */ function* () {
                    // First guard initialization is the hardest race: no preexisting row can act as an accidental lock.
                    const f = yield* setup(dialect);
                    yield* f.product(20);
                    yield* f.product(21);
                    const other = yield* f.hostFor(
                        dialect === 'postgres' ? Context.get(yield* Layer.build(f.open()), SqlClient.SqlClient) : f.sql
                    );
                    yield* Ref.set(f.racing, true);
                    const results = yield* Effect.all(
                        [
                            Effect.either(f.define(20, 0, [edge(21)])),
                            Effect.either(f.define(21, 0, [edge(20, 7, true)], other.host)),
                        ],
                        { concurrency: 2 }
                    );
                    expect(results.filter(Either.isRight)).toHaveLength(1);
                    expect(results.filter(Either.isLeft)).toMatchObject([{ left: { error: { _tag: 'KitCycle' } } }]);
                    const fresh = yield* f.hostFor(Context.get(yield* Layer.build(f.open()), SqlClient.SqlClient));
                    const a = yield* Effect.either(f.get(20, fresh.host));
                    const b = yield* Effect.either(f.get(21, fresh.host));
                    expect([a, b].filter(Either.isRight)).toHaveLength(1);
                    if (Either.isRight(a)) expect(a.right).toEqual({ id: id(20), revision: 1, components: [edge(21)] });
                    else
                        expect(b).toMatchObject({
                            right: { id: id(21), revision: 1, components: [edge(20, 7, true)] },
                        });
                }
            ),
        60000
    );

    it.scopedLive(
        `bounded complete kit graph validation: ${dialect}`,
        /** Seed existing valid metadata through Resources only, then enforce both boundary sides through the public host. */ () =>
            Effect.gen(
                /** A long graph and a wide leaf set distinguish complete checking from first-page/depth truncation. */ function* () {
                    // Bulk setup is not a business writer: no kit implementation receives direct product mutation capability.
                    const f = yield* setup(dialect);
                    yield* scoped(
                        f.resources.transaction(
                            Effect.gen(
                                /** Avoid quadratic public graph validation while arranging a large retained fixture. */ function* () {
                                    // 1000 products, 999 chain definitions; the final leaf is a valid counted product with no composition yet.
                                    for (let n = 0; n < 1000; n++) {
                                        const key = id(10000 + n);
                                        yield* f.resources.create(f.products.products, key, {
                                            name: 'Synthetic boundary product',
                                            sku: key,
                                            skuKey: key,
                                            category: 'kits',
                                            tracking: 'bulk',
                                            unit: 'each',
                                            archived: false,
                                        });
                                        if (n < 999)
                                            yield* f.resources.create(f.kits.definitions, key, {
                                                components: JSON.stringify([edge(10001 + n, 1, n % 2 === 0)]),
                                            });
                                    }
                                }
                            )
                        )
                    );
                    expect(yield* f.define(10000, 1, [edge(10001, 1, true)])).toMatchObject({ revision: 2 });
                    expect(yield* Effect.flip(f.define(10999, 0, [edge(10000)]))).toMatchObject({
                        error: { _tag: 'KitCycle' },
                    });
                    yield* f.product(11000);
                    expect(yield* Effect.flip(f.define(10000, 2, [edge(10001, 1, true), edge(11000)]))).toMatchObject({
                        error: { _tag: 'KitLimit' },
                    });
                    expect(yield* Effect.flip(f.get(10999))).toMatchObject({ error: { _tag: 'KitNotFound' } });
                    expect(yield* f.define(10999, 0, [])).toEqual({ id: id(10999), revision: 1, components: [] });
                    expect(yield* Effect.flip(f.define(11000, 0, []))).toMatchObject({ error: { _tag: 'KitLimit' } });
                    expect(yield* f.get(10000)).toMatchObject({ revision: 2, components: [edge(10001, 1, true)] });
                    const hundred = Array.from(
                        { length: 100 },
                        /** Existing unique products make the container ceiling independent of duplicate rejection. */ (
                            _,
                            n
                        ) => edge(10001 + n, n + 1, n % 2 === 0)
                    );
                    expect(yield* f.define(10000, 2, hundred)).toEqual({
                        id: id(10000),
                        revision: 3,
                        components: hundred,
                    });
                    expect((yield* Effect.flip(f.define(10000, 3, [...hundred, edge(10101)])))._tag).toBe(
                        'InvalidInput'
                    );
                    expect(yield* f.get(10000)).toMatchObject({ revision: 3, components: hundred });
                    let revision = 3;
                    for (const invalid of [
                        '{',
                        ' '.repeat(16384) + '[]',
                        JSON.stringify([{ ...edge(10001), quantity: 0 }]),
                    ]) {
                        yield* scoped(
                            f.resources.update(f.kits.definitions, id(10000), revision++, { components: invalid })
                        );
                        expect(yield* Effect.flip(f.get(10000))).toMatchObject({ error: { _tag: 'KitUnavailable' } });
                    }
                }
            ),
        120000
    );
}

it.scopedLive(
    'revocation while a PostgreSQL graph writer waits on an independent connection',
    /** Hold an actual SQL guard lock, revoke after the second attempt starts, then release it. */ () =>
        Effect.gen(
            /** Both the holder and waiter must refuse rather than reuse their earlier granted admission. */ function* () {
                // A busy simulation alone would not prove that permission is rechecked after a real PostgreSQL lock wait.
                const f = yield* setup('postgres');
                yield* f.product(30);
                yield* f.product(31);
                yield* f.define(30, 0, []);
                const other = yield* f.hostFor(Context.get(yield* Layer.build(f.open()), SqlClient.SqlClient));
                yield* Ref.set(f.hold, true);
                const holder = yield* Effect.fork(Effect.either(f.define(30, 1, [edge(31)])));
                yield* Deferred.await(f.acquired);
                // The holder's signal is already filled; a fresh probe below observes the waiter reaching its own SQL write.
                const writer = yield* Effect.fork(Effect.either(f.define(31, 0, [edge(30)], other.host)));
                yield* Deferred.await(f.attempted);
                let waiting = false;
                for (let attempt = 0; attempt < 100; attempt++) {
                    const locks =
                        yield* f.sql`SELECT pid FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock'`;
                    if (locks.length > 0) {
                        waiting = true;
                        break;
                    }
                    yield* Effect.sleep('10 millis');
                }
                expect(waiting).toBe(true);
                yield* Ref.set(f.permitted, false);
                yield* Deferred.succeed(f.release, undefined);
                expect(yield* Fiber.join(holder)).toMatchObject({ left: { error: { _tag: 'KitUnavailable' } } });
                expect((yield* Fiber.join(writer))._tag).toBe('Left');
                yield* Ref.set(f.permitted, true);
                yield* Ref.set(f.hold, false);
                expect(yield* f.get(30)).toEqual({ id: id(30), revision: 1, components: [] });
                expect(yield* Effect.flip(f.get(31))).toMatchObject({ error: { _tag: 'KitNotFound' } });
            }
        ),
    60000
);
