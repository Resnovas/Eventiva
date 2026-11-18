/**
 * @file tests/runtime/src/inventory-product.spec.ts
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
import { ActionInventory } from '@eventiva/contracts/inventory';
import {
    ArchiveProduct,
    CreateProduct,
    GetProduct,
    inventoryFlag,
    ListProducts,
    Product,
    productActions,
    UpdateProduct,
} from '@eventiva/contracts/inventory-product';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { productModule, productResources } from '@eventiva/runtime/inventory-product';
import { resourceRuntime } from '@eventiva/runtime/resource';
import { durable } from '@eventiva/runtime/storage';
import { InputDigest } from '@eventiva/runtime/invocation';
import { ResourceFailure, Resources, type ResourceProvider } from '@eventiva/contracts/resource';
import { CurrentTenant, Storage } from '@eventiva/contracts/storage';
import { client } from '@eventiva/integrations.sql/postgres';
import { localFile } from '@eventiva/integrations.sql/sqlite';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { migrateResources, resourceProvider } from '@eventiva/integrations.sql/resource';
import { makeTestOnlyHarness } from '@eventiva/runtime/testing';
import { ConfigProvider, Context, Deferred, Effect, Either, Layer, Redacted, Ref, Schema } from 'effect';

/** Distinct private fixture identities carry no real equipment, caller or supplier data. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const caller = {
    subject: SubjectId.make(id(1)),
    tenant: TenantId.make(id(2)),
    session: SessionId.make(id(3)),
    kind: 'human' as const,
};
const product: Product = {
    id: id(4),
    revision: 1,
    name: 'Synthetic private lead',
    sku: 'PRIVATE-1',
    category: 'cables',
    tracking: 'bulk',
    unit: 'each',
    archived: false,
};

it.scoped(
    'product dispatch rechecks live policy while incompatible provider discovery fails closed',
    /** This isolated host fixture proves the new specifications' policy metadata, not stock or persistence. */ () =>
        Effect.gen(
            /** Vary independent policy controls against the same registered inventory and wire entry point. */ function* () {
                // Rebuilding the host after each revocation would hide cached-authority defects.
                const fixture = yield* makeTestOnlyHarness(caller);
                const enabled = yield* Ref.make<boolean | null>(null);
                const permissions = yield* Ref.make<ReadonlySet<string>>(new Set(['inventory.catalogue.read']));
                const targetAllowed = yield* Ref.make(true);
                const flags = Layer.succeed(Flags, {
                    /** Missing remote configuration falls back to the declaration; tests may explicitly enable without changing it. */
                    evaluate: (flag) =>
                        Ref.get(enabled).pipe(
                            Effect.map(
                                /** Preserve a meaningful distinction between missing flag configuration and explicit test enablement. */
                                (value) =>
                                    value === null
                                        ? safeDefault(flag)
                                        : { flag: flag.key, value, reason: 'TEST', fallback: false }
                            )
                        ),
                });
                const authority = Layer.succeed(Authorizer, {
                    /** Check canonical permission at every discovery or dispatch, never a permission copied from caller input. */
                    canInvoke: (_caller, action) =>
                        Ref.get(permissions).pipe(
                            Effect.flatMap(
                                /** Lack of write permission must refuse before wire input validation can disclose product data. */
                                (grants) =>
                                    grants.has(action.permission)
                                        ? Effect.void
                                        : Effect.fail(new Forbidden({ action: action.name, reason: 'permission' }))
                            )
                        ),
                    /** Target policy is independent of permission and remains live within an existing authenticated session. */
                    check: (_caller, action) =>
                        Ref.get(targetAllowed).pipe(
                            Effect.flatMap(
                                /** A revoked target cannot be read just because coarse permission and feature gates remain on. */
                                (allowed) =>
                                    allowed
                                        ? Effect.void
                                        : Effect.fail(new Forbidden({ action: action.name, reason: 'target' }))
                            )
                        ),
                });
                yield* Effect.gen(
                    /** Synthetic handlers isolate authorization; real tenant-storage cases are a separate acceptance layer. */ function* () {
                        // Missing flag configuration is the first refusal control, before any explicit test enablement.
                        const host = yield* ActionHost;
                        const inventory = yield* ActionInventory;
                        const module = {
                            manifest: {
                                format: 1,
                                id: 'inventory',
                                version: '1.0.0',
                                description: 'Private product authorization fixture.',
                                flags: [inventoryFlag],
                                actions: productActions.map(
                                    /** Advertise exactly the portable specification names. */ (action) => action.name
                                ),
                            },
                            actions: [
                                implement(
                                    CreateProduct,
                                    /** Fixture only; this does not persist a product. */ () => Effect.succeed(product)
                                ),
                                implement(
                                    UpdateProduct,
                                    /** Fixture only; this does not alter a product revision. */ () =>
                                        Effect.succeed(product)
                                ),
                                implement(
                                    ArchiveProduct,
                                    /** Fixture only; this does not archive a stored row. */ () =>
                                        Effect.succeed({ ...product, archived: true })
                                ),
                                implement(
                                    GetProduct,
                                    /** Positive read control distinguishes a working host from unconditional refusal. */ () =>
                                        Effect.succeed(product)
                                ),
                                implement(
                                    ListProducts,
                                    /** Positive list control supplies only this private synthetic record. */ () =>
                                        Effect.succeed({ products: [product], next: null })
                                ),
                            ],
                        };
                        yield* host.register(module);
                        expect(yield* inventory.list(caller)).toEqual([]);
                        expect((yield* Effect.flip(host.invoke(GetProduct.name, { id: product.id })))._tag).toBe(
                            'Unavailable'
                        );
                        yield* Ref.set(enabled, true);
                        expect((yield* Effect.flip(inventory.list(caller)))._tag).toBe('UnsupportedSchema');
                        expect(yield* host.invoke(GetProduct.name, { id: product.id })).toEqual(product);
                        for (const action of [CreateProduct, UpdateProduct, ArchiveProduct]) {
                            expect(
                                (yield* Effect.flip(host.invoke(action.name, { private: 'invalid-wire' })))._tag
                            ).toBe('Forbidden');
                        }
                        yield* Ref.set(targetAllowed, false);
                        expect((yield* Effect.flip(host.invoke(GetProduct.name, { id: product.id })))._tag).toBe(
                            'Forbidden'
                        );
                        yield* Ref.set(targetAllowed, true);
                        yield* Ref.set(permissions, new Set(['inventory.catalogue.read', 'inventory.catalogue.write']));
                        expect(yield* host.actions).toEqual(
                            productActions
                                .map(/** Sort expected IDs independently from inventory. */ (action) => action.name)
                                .sort()
                        );
                        expect((yield* Effect.flip(inventory.list(caller)))._tag).toBe('UnsupportedSchema');
                        yield* Ref.set(enabled, false);
                        expect(yield* inventory.list(caller)).toEqual([]);
                        expect((yield* Effect.flip(host.invoke(GetProduct.name, { id: product.id })))._tag).toBe(
                            'Unavailable'
                        );
                    }
                ).pipe(
                    Effect.provide(
                        ActionHostLive.pipe(
                            Layer.provide(flags),
                            Layer.provide(authority),
                            Layer.provide(fixture.TestOnly)
                        )
                    ),
                    Effect.provideService(Caller, caller)
                );
            }
        )
);

/** Bind only disposable loopback PostgreSQL or isolated file-backed SQLite; never accept a production test target. */
const database = (dialect: Dialect) =>
    Effect.gen(
        /** Keep a fresh database for each tenant; SQL's persisted tenant binding is intentionally one tenant per database. */ function* () {
            // Database creation/drop is allowed only for a disposable loopback fixture, never a configured external service.
            /** Read the same existing configuration boundary as storage conformance tests. */
            const pg = (url: string) =>
                client.pipe(
                    Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]]))))
                );
            /** Retain a connection factory, never a globally shared client or production URL. */
            let open: /** Acquire a fresh scoped connection to this exact disposable database. */ () =>
                ReturnType<typeof pg> | ReturnType<typeof localFile>;
            if (dialect === 'postgres') {
                const url = new URL(
                    process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test'
                );
                if (url.hostname !== '127.0.0.1' || url.pathname !== '/eventiva_test')
                    return yield* Effect.dieMessage('Disposable loopback fixture required');
                const admin = Context.get(yield* Layer.build(pg(url.toString())), SqlClient.SqlClient);
                const name = `product_${randomUUID().replaceAll('-', '')}`;
                yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                yield* Effect.addFinalizer(
                    /** Drop only the database created by this fixture, after scoped clients close. */ () =>
                        admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie)
                );
                url.pathname = '/' + name;
                open = /** Each reopen obtains a new independent pool against the same retained fixture. */ () =>
                    pg(url.toString());
            } else {
                const folder = fileURLToPath(new URL('../../../.amp/in/orb-backup/product-tests/', import.meta.url));
                mkdirSync(folder, { recursive: true });
                const filename = `${folder}${randomUUID()}.sqlite`;
                open = /** A reopened client cannot recover state from an in-memory test map. */ () =>
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

for (const dialect of ['sqlite', 'postgres'] as const) {
    it.scopedLive(
        `private product actions persist atomically with tenant isolation and current policy: ${dialect}`,
        /** Exercise actual common-host invocation over real providers, never handlers invoked directly. */ () =>
            Effect.gen(
                /** Keep failures observable through the public wire result while inspecting retained resource state for atomicity. */ function* () {
                    // Fault controls live outside SQL rollback so a revoked grant stays revoked when an attempt retries.
                    const db = yield* database(dialect);
                    const declarations = yield* productResources;
                    const definitions = [declarations.products, declarations.guard];
                    const enabled = yield* Ref.make(true);
                    const permitted = yield* Ref.make(true);
                    const rollback = yield* Ref.make(false);
                    const waiting = yield* Ref.make(0);
                    const guardWrites = yield* Ref.make(0);
                    const fault = yield* Ref.make<
                        | 'none'
                        | 'conflict'
                        | 'storage'
                        | 'revoke-on-conflict'
                        | 'flag-after-guard'
                        | 'permission-after-guard'
                    >('none');
                    const barrier = yield* Deferred.make<void>();
                    const flags = Layer.succeed(Flags, {
                        /** Live fixture control is not a production enablement. */
                        evaluate: (flag) =>
                            Ref.get(enabled).pipe(
                                Effect.map(
                                    /** Retain exact flag metadata. */ (value) => ({
                                        ...safeDefault(flag),
                                        value,
                                        fallback: false,
                                    })
                                )
                            ),
                    });
                    const authority = Layer.succeed(Authorizer, {
                        /** Consult the current synthetic grant rather than a session snapshot. */
                        canInvoke: (_who, action) =>
                            Ref.get(permitted).pipe(
                                Effect.flatMap(
                                    /** Revoke coarse permission without replacing the host/session. */ (value) =>
                                        value
                                            ? Effect.void
                                            : Effect.fail(new Forbidden({ action: action.name, reason: 'permission' }))
                                )
                            ),
                        /** A policy observer must not be able to rewrite the handler's private input by retaining its target. */
                        check: (_who, _action, target) =>
                            Effect.sync(
                                /** Simulate a mutating adapter only for an independently asserted canary. */ () => {
                                    // This catches nested handler aliases even if the common host isolates its earlier policy checks.
                                    if (Schema.is(CreateProduct.input)(target) && target.product.sku === 'ISOLATED')
                                        Reflect.set(target.product, 'sku', 'MUTATED');
                                }
                            ),
                    });
                    /** Build independently registered hosts on one routed provider; PostgreSQL connections may race, SQLite's one client serializes. */
                    const hostFor = (sql: typeof SqlClient.SqlClient.Service, who = caller, inject = false) =>
                        Effect.gen(
                            /** Install the exact same product definitions in each synthetic tenant's private database. */ function* () {
                                // Independent hosts share durable state, not an in-memory product map or runtime lock.
                                yield* migrateResources(dialect, who.tenant, definitions, {
                                    kind: 'additive',
                                    restartRequired: false,
                                    retainedGenerations: 0,
                                }).pipe(Effect.provideService(SqlClient.SqlClient, sql));
                                const base = yield* resourceProvider(
                                    dialect,
                                    who.tenant,
                                    { key: { module: 'inventory.sql', instance: 'primary' }, version: '1.0.0' },
                                    definitions
                                ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
                                const provider: ResourceProvider = {
                                    ...base,
                                    driver: {
                                        ...base.driver,
                                        /** Preserve real database reads while coordinating first initialization only. */
                                        get: (resource: string, key: string) =>
                                            base.driver.get(resource, key).pipe(
                                                Effect.tap(
                                                    /** Force two first-guard reads to see absence before either PostgreSQL transaction initializes it. */ () =>
                                                        Effect.gen(
                                                            /** SQLite BEGIN IMMEDIATE precludes this barrier and already serializes the two fibers. */ function* () {
                                                                // Coordinate absent reads explicitly; a timer-dependent race could miss unsafe initialization.
                                                                if (
                                                                    !inject ||
                                                                    dialect !== 'postgres' ||
                                                                    resource !== declarations.guard.id
                                                                )
                                                                    return;
                                                                const n = yield* Ref.updateAndGet(
                                                                    waiting,
                                                                    /** Count guard reads across both independently registered hosts. */ (
                                                                        value
                                                                    ) => value + 1
                                                                );
                                                                if (n === 2)
                                                                    yield* Deferred.succeed(barrier, undefined);
                                                                if (n <= 2) yield* Deferred.await(barrier);
                                                            }
                                                        )
                                                )
                                            ),
                                        /** Write real retained state before optional synthetic post-write failure. */
                                        write: (resource, key, revision, value) =>
                                            Effect.gen(
                                                /** Inject only at the provider port; all successful writes and transaction rollback remain real SQL. */ function* () {
                                                    // Retry faults precede CAS; rollback faults follow actual product/history writes.
                                                    const mode = yield* Ref.get(fault);
                                                    if (resource.id === declarations.guard.id) {
                                                        yield* Ref.update(
                                                            guardWrites,
                                                            /** Count the observable retry budget, not implementation helper calls. */ (
                                                                n
                                                            ) => n + 1
                                                        );
                                                        if (mode === 'revoke-on-conflict')
                                                            yield* Ref.set(permitted, false);
                                                        if (
                                                            mode === 'conflict' ||
                                                            mode === 'revoke-on-conflict' ||
                                                            mode === 'storage'
                                                        )
                                                            return yield* Effect.fail(
                                                                new ResourceFailure({
                                                                    reason: mode === 'storage' ? 'storage' : 'conflict',
                                                                    detail: 'Synthetic guard failure',
                                                                })
                                                            );
                                                    }
                                                    const written = yield* base.driver.write(
                                                        resource,
                                                        key,
                                                        revision,
                                                        value
                                                    );
                                                    if (resource.id === declarations.guard.id) {
                                                        if (mode === 'flag-after-guard') yield* Ref.set(enabled, false);
                                                        if (mode === 'permission-after-guard')
                                                            yield* Ref.set(permitted, false);
                                                    }
                                                    if (
                                                        resource.id === declarations.products.id &&
                                                        (yield* Ref.get(rollback))
                                                    )
                                                        return yield* Effect.fail(
                                                            new ResourceFailure({
                                                                reason: 'storage',
                                                                detail: 'Synthetic post-write outage',
                                                            })
                                                        );
                                                    return written;
                                                }
                                            ),
                                    },
                                };
                                const resources = Context.get(
                                    yield* Layer.build(
                                        resourceRuntime(
                                            provider,
                                            /** Fixture policy leaves built-in tenant checks intact. */ () =>
                                                Effect.void
                                        )
                                    ),
                                    Resources
                                );
                                const fixture = yield* makeTestOnlyHarness(who);
                                const persistence = durable.pipe(
                                    Layer.provide(Layer.succeed(Storage, provider.storage)),
                                    Layer.provide(Layer.succeed(CurrentTenant, { id: who.tenant }))
                                );
                                const digest = Layer.succeed(InputDigest, {
                                    /** Unlike the test harness's readable digest, durable receipts must not retain raw private input. */
                                    digest: (canonical) =>
                                        Effect.sync(
                                            /** Use a deterministic one-way digest for this real-persistence fixture. */ () =>
                                                createHash('sha256').update(canonical).digest('hex')
                                        ),
                                });
                                const services = Layer.mergeAll(
                                    fixture.TestOnly,
                                    persistence,
                                    flags,
                                    authority,
                                    digest
                                );
                                const context = yield* Layer.build(services);
                                const module = yield* productModule.pipe(
                                    Effect.provide(context),
                                    Effect.provideService(Resources, resources),
                                    Effect.provideService(CurrentTenant, { id: who.tenant })
                                );
                                const host = Context.get(
                                    yield* Layer.build(ActionHostLive.pipe(Layer.provide(services))),
                                    ActionHost
                                );
                                yield* host.register(module);
                                return { host, resources };
                            }
                        );
                    const first = yield* hostFor(db.sql, caller, true);
                    const second = yield* hostFor(db.sql, caller, true);
                    let key = 100;
                    /** Mutations use unique idempotency keys so application conflicts cannot be concealed by receipt replay. */
                    const invoke = (host: typeof ActionHost.Service, action: string, input: unknown, who = caller) =>
                        host
                            .invoke(action, input, { idempotencyKey: id(key++) })
                            .pipe(Effect.provideService(Caller, who));
                    const fields = {
                        name: 'Synthetic product',
                        sku: 'AV-1',
                        category: 'cables',
                        tracking: 'bulk',
                        unit: 'each',
                    };
                    const raced = yield* Effect.all(
                        [
                            Effect.either(invoke(first.host, CreateProduct.name, { id: id(20), product: fields })),
                            Effect.either(
                                invoke(second.host, CreateProduct.name, {
                                    id: id(21),
                                    product: { ...fields, sku: 'av-1' },
                                })
                            ),
                        ],
                        { concurrency: 2 }
                    );
                    const successes = raced.filter(Either.isRight);
                    expect(successes).toHaveLength(1);
                    expect(yield* Ref.get(guardWrites)).toBe(dialect === 'postgres' ? 3 : 2);
                    expect(
                        raced
                            .filter(Either.isLeft)
                            .map(
                                /** Public failures expose no competing private SKU or identity. */ (result) =>
                                    result.left
                            )
                    ).toMatchObject([{ _tag: 'ActionFailed', error: { _tag: 'DuplicateSku' } }]);
                    const winner = yield* Schema.decodeUnknown(Product)(successes[0]?.right);
                    expect(winner.revision).toBe(1);
                    const renamed = yield* invoke(first.host, UpdateProduct.name, {
                        id: winner.id,
                        revision: 1,
                        product: { ...fields, sku: 'NEW-2' },
                    });
                    expect(renamed).toMatchObject({ revision: 2, sku: 'NEW-2' });
                    expect(
                        yield* invoke(first.host, CreateProduct.name, { id: id(22), product: fields })
                    ).toMatchObject({ revision: 1, sku: 'AV-1' });
                    expect(
                        yield* Effect.flip(
                            invoke(first.host, UpdateProduct.name, {
                                id: id(22),
                                revision: 1,
                                product: { ...fields, sku: 'new-2' },
                            })
                        )
                    ).toMatchObject({ _tag: 'ActionFailed', error: { _tag: 'DuplicateSku' } });
                    expect(yield* invoke(first.host, GetProduct.name, { id: id(22) })).toMatchObject({
                        revision: 1,
                        sku: 'AV-1',
                    });
                    expect(
                        yield* Effect.flip(
                            invoke(first.host, UpdateProduct.name, { id: winner.id, revision: 1, product: fields })
                        )
                    ).toMatchObject({ error: { _tag: 'RevisionConflict' } });
                    expect(
                        yield* invoke(first.host, ArchiveProduct.name, { id: winner.id, revision: 2 })
                    ).toMatchObject({ revision: 3, archived: true });
                    expect(
                        yield* Effect.flip(
                            invoke(first.host, CreateProduct.name, { id: id(23), product: { ...fields, sku: 'new-2' } })
                        )
                    ).toMatchObject({ error: { _tag: 'DuplicateSku' } });
                    expect(
                        yield* Effect.flip(
                            invoke(first.host, UpdateProduct.name, { id: winner.id, revision: 3, product: fields })
                        )
                    ).toMatchObject({ error: { _tag: 'ProductArchived' } });
                    expect(
                        yield* invoke(first.host, ListProducts.name, { limit: 100, includeArchived: false })
                    ).toMatchObject({ products: [{ id: id(22) }], next: null });
                    expect(yield* invoke(first.host, ListProducts.name, { limit: 1, includeArchived: false })).toEqual({
                        products: [],
                        next: winner.id,
                    });
                    expect(
                        yield* invoke(first.host, ListProducts.name, {
                            limit: 1,
                            includeArchived: false,
                            after: winner.id,
                            category: 'cables',
                        })
                    ).toMatchObject({ products: [{ id: id(22) }], next: id(22) });
                    expect(
                        yield* invoke(first.host, ListProducts.name, {
                            limit: 1,
                            includeArchived: false,
                            after: id(22),
                            category: 'cables',
                        })
                    ).toEqual({ products: [], next: null });
                    expect(
                        yield* invoke(first.host, ListProducts.name, {
                            limit: 100,
                            includeArchived: true,
                            category: 'missing',
                        })
                    ).toEqual({ products: [], next: null });
                    /** Supply trusted fixture scope for retained-state assertions, not product requests. */
                    const scope = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
                        effect.pipe(
                            Effect.provideService(Caller, caller),
                            Effect.provideService(CurrentTenant, { id: caller.tenant })
                        );
                    const guardBefore = yield* scope(first.resources.query(declarations.guard, { limit: 1 }));
                    yield* Ref.set(rollback, true);
                    expect(
                        yield* Effect.flip(
                            invoke(first.host, CreateProduct.name, {
                                id: id(24),
                                product: { ...fields, sku: 'ROLLBACK' },
                            })
                        )
                    ).toMatchObject({ error: { _tag: 'ProductUnavailable' } });
                    yield* Ref.set(rollback, false);
                    expect(yield* scope(first.resources.query(declarations.guard, { limit: 1 }))).toEqual(guardBefore);
                    expect(yield* Effect.flip(invoke(first.host, GetProduct.name, { id: id(24) }))).toMatchObject({
                        error: { _tag: 'ProductNotFound' },
                    });
                    let failedId = 30;
                    for (const [mode, attempts] of [
                        ['conflict', 4],
                        ['storage', 1],
                        ['revoke-on-conflict', 1],
                        ['flag-after-guard', 1],
                        ['permission-after-guard', 1],
                    ] as const) {
                        const candidate = id(failedId++);
                        const before = yield* Ref.get(guardWrites);
                        yield* Ref.set(fault, mode);
                        expect(
                            yield* Effect.flip(
                                invoke(first.host, CreateProduct.name, {
                                    id: candidate,
                                    product: { ...fields, sku: `FAIL-${mode}` },
                                })
                            )
                        ).toMatchObject({ error: { _tag: 'ProductUnavailable' } });
                        expect((yield* Ref.get(guardWrites)) - before).toBe(attempts);
                        yield* Ref.set(fault, 'none');
                        yield* Ref.set(enabled, true);
                        yield* Ref.set(permitted, true);
                        expect(yield* scope(first.resources.query(declarations.guard, { limit: 1 }))).toEqual(
                            guardBefore
                        );
                        expect(
                            yield* Effect.flip(invoke(first.host, GetProduct.name, { id: candidate }))
                        ).toMatchObject({ error: { _tag: 'ProductNotFound' } });
                    }
                    expect(
                        yield* invoke(first.host, CreateProduct.name, {
                            id: id(40),
                            product: { ...fields, sku: 'ISOLATED' },
                        })
                    ).toMatchObject({ sku: 'ISOLATED' });
                    yield* Ref.set(enabled, false);
                    expect(yield* Effect.flip(invoke(first.host, GetProduct.name, { id: winner.id }))).toMatchObject({
                        _tag: 'Unavailable',
                    });
                    yield* Ref.set(enabled, true);
                    yield* Ref.set(permitted, false);
                    expect(yield* Effect.flip(invoke(first.host, GetProduct.name, { id: winner.id }))).toMatchObject({
                        _tag: 'Forbidden',
                    });
                    yield* Ref.set(permitted, true);
                    const reopened = yield* hostFor(Context.get(yield* Layer.build(db.open()), SqlClient.SqlClient));
                    expect(yield* invoke(reopened.host, GetProduct.name, { id: winner.id })).toMatchObject({
                        revision: 3,
                        archived: true,
                        sku: 'NEW-2',
                    });
                    const otherDb = yield* database(dialect);
                    const other = { ...caller, tenant: TenantId.make(id(99)) };
                    const otherHost = yield* hostFor(otherDb.sql, other);
                    expect(
                        yield* Effect.flip(invoke(otherHost.host, GetProduct.name, { id: winner.id }, other))
                    ).toMatchObject({ error: { _tag: 'ProductNotFound' } });
                    expect(
                        yield* invoke(otherHost.host, ListProducts.name, { limit: 100, includeArchived: true }, other)
                    ).toEqual({ products: [], next: null });
                    expect(
                        yield* Effect.flip(
                            invoke(
                                otherHost.host,
                                UpdateProduct.name,
                                {
                                    id: id(22),
                                    revision: 1,
                                    product: fields,
                                },
                                other
                            )
                        )
                    ).toMatchObject({ error: { _tag: 'ProductNotFound' } });
                    expect(
                        yield* invoke(
                            otherHost.host,
                            CreateProduct.name,
                            {
                                id: id(22),
                                product: { ...fields, name: 'Other tenant product' },
                            },
                            other
                        )
                    ).toMatchObject({ sku: 'AV-1', revision: 1, name: 'Other tenant product' });
                    expect(yield* invoke(first.host, GetProduct.name, { id: id(22) })).toMatchObject({
                        name: 'Synthetic product',
                        revision: 1,
                    });
                    expect(
                        (yield* Effect.either(invoke(first.host, GetProduct.name, { id: winner.id }, other)))._tag
                    ).toBe('Left');
                    const receipts = yield* db.sql`SELECT receipt FROM action_receipt`;
                    expect(receipts.length).toBeGreaterThan(0);
                    const auditText = JSON.stringify(receipts);
                    for (const privateValue of ['Synthetic product', 'ISOLATED', 'NEW-2', 'AV-1'])
                        expect(auditText).not.toContain(privateValue);
                }
            ),
        60000
    );
}
