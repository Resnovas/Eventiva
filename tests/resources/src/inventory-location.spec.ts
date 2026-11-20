/**
 * @file tests/resources/src/inventory-location.spec.ts
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
import { mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { inspect } from 'node:util';
import { SqlClient } from '@effect/sql';
import { describe, expect, it } from '@effect/vitest';
import {
    Cause,
    ConfigProvider,
    Context,
    Deferred,
    Effect,
    Either,
    Exit,
    Fiber,
    Layer,
    Redacted,
    Ref,
    Schema,
} from 'effect';
import { Authorizer, Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Flags } from '@eventiva/contracts/flags';
import { IdentityStore, RoleId } from '@eventiva/contracts/identity';
import { TenantId } from '@eventiva/contracts/ids';
import {
    locationActions,
    locationCreate,
    locationGet,
    locationResources,
} from '@eventiva/contracts/inventory-location';
import { ResourceFailure, Resources, type ResourceScope } from '@eventiva/contracts/resource';
import { CurrentTenant, Storage, type JsonValue } from '@eventiva/contracts/storage';
import { identityStore } from '@eventiva/integrations.sql/identity';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { resourceProvider, migrateResources } from '@eventiva/integrations.sql/resource';
import { localFile } from '@eventiva/integrations.sql/sqlite';
import { inventoryLocationModule } from '@eventiva/runtime/inventory-location';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { identitySecurity } from '@eventiva/runtime/identity';
import { Approvals, InputDigest, InvocationDenied } from '@eventiva/runtime/invocation';
import { resourceRuntime } from '@eventiva/runtime/resource';
import { durable } from '@eventiva/runtime/storage';

/** Stable UUID ordering differs from deliberately shuffled creation order. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const tenant = TenantId.make(id(900));
const caller = Schema.decodeUnknownSync(CallerIdentity)({ tenant, subject: id(901), session: id(902), kind: 'human' });
const role = RoleId.make(id(903));
const canary = 'SYNTHETIC-LOCATION-PRIVATE-SENTINEL';
const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
/** Keep SQL clients independent even when their immutable layer descriptions target the same database. */
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
/** Own one disposable physical database outside the independently scoped connection lifetimes. */
const database = (dialect: Dialect) =>
    Effect.gen(
        /** Validate the loopback fixture before creating any isolated synthetic database. */ function* () {
            // Reopen uses the same physical target while allocating entirely new clients, provider and host services.
            if (dialect === 'postgres') {
                const url = new URL(local);
                if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.pathname !== '/eventiva_test')
                    return yield* new ResourceFailure({
                        reason: 'denied',
                        detail: 'Disposable loopback database required',
                    });
                const admin = Context.get(yield* Layer.build(pg(local)), SqlClient.SqlClient);
                const name = `location_${randomUUID().replaceAll('-', '')}`;
                yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                yield* Effect.addFinalizer(
                    /** Drop only the owned database after nested clients close. */ () =>
                        admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie)
                );
                url.pathname = `/${name}`;
                return pg(url.toString());
            }
            const dir = fileURLToPath(new URL('../../../.amp/in/orb-backup/location/', import.meta.url));
            yield* Effect.tryPromise(
                /** Allocate only a private fixture directory. */ () => mkdir(dir, { recursive: true })
            );
            const path = `${dir}${randomUUID()}.db`;
            yield* Effect.addFinalizer(
                /** Remove only this owned synthetic database file. */ () =>
                    Effect.tryPromise(/** Never remove a caller-supplied path. */ () => rm(path, { force: true })).pipe(
                        Effect.orDie
                    )
            );
            return localFile(Redacted.make(path));
        }
    );
type Point = 'none' | 'read-guard' | 'guard' | 'before' | 'after';
/** Compose actual SQL identity/resources/durable host with explicit fixture-only failure barriers at real write boundaries. */
const fixture = <E>(
    dialect: Dialect,
    connection: Layer.Layer<SqlClient.SqlClient, E>,
    currentTenant = tenant,
    seed = true,
    isolateGraph = false
) =>
    Effect.gen(
        /** Every participant in a fixture shares its exact SQL owner; separate fixtures never share an in-memory graph mutex. */ function* () {
            // Migration/provider construction is outside all ambient transactions, matching production admission rules.
            const sql = Context.get(yield* Layer.build(connection), SqlClient.SqlClient);
            yield* migrate(
                dialect,
                yield* load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url)))
            ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            const scope = Layer.succeed(CurrentTenant, { id: currentTenant });
            const base = Layer.merge(
                scope,
                identityStore.pipe(Layer.provide(scope), Layer.provide(Layer.succeed(SqlClient.SqlClient, sql)))
            );
            const store = Context.get(yield* Layer.build(base), IdentityStore);
            if (seed) {
                yield* store.put(
                    'role',
                    {
                        id: role,
                        name: 'Synthetic location editor',
                        grants: [
                            { permission: 'inventory.location.write', resources: ['*'] },
                            { permission: 'inventory.location.read', resources: ['*'] },
                        ],
                    },
                    null
                );
                yield* store.put('principal', { id: caller.subject, kind: 'human', active: true }, null);
                yield* store.put('membership', { id: caller.subject, active: true, roles: [role] }, null);
                yield* store.put(
                    'session',
                    {
                        id: caller.session,
                        subject: caller.subject,
                        active: true,
                        expiresAt: 253402300799999,
                        delegation: null,
                    },
                    null
                );
            }
            // Graph-only races remove the unrelated identity mutex, not SQL identity/policy checks. Otherwise identity_guard
            // serializes before location.guard and a broken graph lock would falsely pass; ordinary host tests keep it intact.
            const security = yield* Layer.build(
                identitySecurity.pipe(
                    Layer.provide(
                        Layer.merge(
                            base,
                            Layer.succeed(IdentityStore, isolateGraph ? { ...store, lock: Effect.void } : store)
                        )
                    )
                )
            );
            const policy = Context.get(security, Authorizer);
            const enabled = yield* Ref.make<boolean | undefined>(true);
            const denied = yield* Ref.make(false);
            const pause = yield* Ref.make<Point>('none');
            const fault = yield* Ref.make<Point>('none');
            const arrived = yield* Deferred.make<void>();
            const release = yield* Deferred.make<void>();
            /** Pause/fail after actual SQL work when requested; tests can revoke authority while the real guard remains held. */
            const step = (point: Point) =>
                Effect.gen(
                    /** Completion barriers distinguish a write fault from an early preflight rejection. */ function* () {
                        // Pauses retain the current transaction/lock until explicit interruption or release.
                        if ((yield* Ref.get(pause)) === point) {
                            yield* Deferred.succeed(arrived, undefined);
                            yield* Deferred.await(release);
                        }
                        if ((yield* Ref.get(fault)) === point)
                            return yield* new ResourceFailure({ reason: 'storage', detail: canary });
                    }
                );
            const definitions = yield* locationResources;
            const declarations = [definitions.locations, definitions.guard];
            yield* migrateResources(dialect, currentTenant, declarations, {
                kind: 'additive',
                restartRequired: false,
                retainedGenerations: 0,
            }).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            const provider = yield* resourceProvider(
                dialect,
                currentTenant,
                { key: { module: 'eventiva.sql', instance: 'primary' }, version: '1.0.0' },
                declarations
            ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            const resources = yield* Layer.build(
                resourceRuntime(
                    {
                        ...provider,
                        driver: {
                            ...provider.driver,
                            /** Synchronize guard observations across independent PostgreSQL clients, not through feature state. */
                            get: (resource, key) =>
                                provider.driver
                                    .get(resource, key)
                                    .pipe(
                                        Effect.tap(
                                            /** Retain the original observed revision while the competing transaction starts. */ () =>
                                                resource === definitions.guard.id ? step('read-guard') : Effect.void
                                        )
                                    ),
                            /** Interpose solely at actual driver write boundaries, preserving real transactional persistence. */
                            write: (resource, key, revision, value) =>
                                Effect.gen(
                                    /** Signal each tested boundary before/after actual SQL, never replace storage with a mock. */ function* () {
                                        // The after fault proves rollback of persisted rows/history rather than a handler short-circuit.
                                        if (resource.id === definitions.locations.id) yield* step('before');
                                        const saved = yield* provider.driver.write(resource, key, revision, value);
                                        yield* step(resource.id === definitions.guard.id ? 'guard' : 'after');
                                        return saved;
                                    }
                                ),
                        },
                    },
                    /** Independently deny Resources even when the action permission is still granted. */ (
                        c,
                        _resource,
                        operation
                    ) =>
                        Ref.get(denied).pipe(
                            Effect.flatMap(
                                /** A live resource decision is separate from admission-time action authority. */ (
                                    deny
                                ) =>
                                    deny
                                        ? Effect.fail(new ResourceFailure({ reason: 'denied', detail: canary }))
                                        : policy
                                              .canInvoke(c, operation === 'write' ? locationCreate : locationGet)
                                              .pipe(
                                                  Effect.mapError(
                                                      /** Do not surface SQL identity diagnostics. */ () =>
                                                          new ResourceFailure({
                                                              reason: 'denied',
                                                              detail: 'Location fixture denied',
                                                          })
                                                  )
                                              )
                            )
                        )
                )
            );
            const api = Context.get(resources, Resources);
            const platform = Layer.mergeAll(
                Layer.succeed(Flags, {
                    /** Resolve a mutable fixture flag with the real production safe default preserved. */ evaluate: (
                        flag
                    ) =>
                        Ref.get(enabled).pipe(
                            Effect.map(
                                /** Missing flag evaluates to safeDefault, never implicit true. */ (value) => ({
                                    flag: flag.key,
                                    value: value ?? flag.safeDefault,
                                    reason: value === undefined ? 'SAFE_DEFAULT' : 'TEST',
                                    fallback: value === undefined,
                                })
                            )
                        ),
                }),
                Layer.succeed(InputDigest, {
                    /** Hash private inputs without retaining raw metadata in receipts. */ digest: (text) =>
                        Effect.sync(
                            /** Keep the digest deterministic for exact original-key replay checks. */ () =>
                                createHash('sha256').update(text).digest('hex')
                        ),
                }),
                Layer.succeed(Approvals, {
                    /** Unknown approval proofs fail closed; routine human metadata writes need none. */ get: () =>
                        Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'missing' })),
                    /** Missing proof cannot acknowledge successful approval use. */ use: () =>
                        Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'missing' })),
                    /** Keep protected read callbacks outside this denying fixture capability. */ transaction: () =>
                        Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'missing' })),
                }),
                Layer.succeed(Authorizer, {
                    canInvoke: policy.canInvoke,
                    /** Fixture provisions tenant-wide target grants only, checked live on every invocation. */ check: (
                        c,
                        spec
                    ) => policy.canInvoke(c, spec),
                })
            );
            const services = Layer.merge(Layer.succeedContext(security), platform);
            const module = yield* inventoryLocationModule.pipe(
                Effect.provide(services),
                Effect.provideService(Resources, api),
                Effect.provideService(CurrentTenant, { id: currentTenant })
            );
            const host = Context.get(
                yield* Layer.build(
                    ActionHostLive.pipe(
                        Layer.provide(services),
                        Layer.provide(durable.pipe(Layer.provide(Layer.succeed(Storage, provider.storage)))),
                        Layer.provide(base)
                    )
                ),
                ActionHost
            );
            yield* host.register(module);
            /** All feature scenarios invoke the common host, including its real SQL idempotency/identity boundary. */
            const invoke = (
                operation: string,
                input: JsonValue,
                key = randomUUID(),
                presented = { ...caller, tenant: currentTenant }
            ) =>
                host
                    .invoke(`inventory.location.${operation}`, input, { idempotencyKey: key })
                    .pipe(Effect.provideService(Caller, presented));
            /** Inspect retained resource state/history through its authorized public API. */
            const scoped = <A, E, R>(effect: Effect.Effect<A, E, R | ResourceScope>) =>
                effect.pipe(
                    Effect.provideService(Caller, { ...caller, tenant: currentTenant }),
                    Effect.provideService(CurrentTenant, { id: currentTenant })
                );
            return {
                sql,
                host,
                invoke,
                scoped,
                api,
                store,
                enabled,
                denied,
                pause,
                fault,
                arrived,
                release,
                definitions,
            };
        }
    );

for (const dialect of ['sqlite', 'postgres'] as const)
    describe(`${dialect} physical locations`, /** Run the same observable contract against both real SQL dialects. */ () => {
        it.scoped(
            'persists immutable kind/history, reopens, pages/root-filters and replays original committed evidence',
            /** Fresh scopes rule out a feature cache satisfying persistence or replay. */ () =>
                Effect.gen(
                    /** Deliberately unsorted IDs and duplicate names distinguish UUID order and identity from insertion/name order. */ function* () {
                        // Keep the physical connection description, but close all original service/client scopes before reopen.
                        const connection = yield* database(dialect);
                        const key = randomUUID();
                        const create = { id: id(30), kind: 'warehouse', name: canary };
                        let original: unknown;
                        yield* Effect.scoped(
                            Effect.gen(
                                /** Exercise exact typed public metadata and retained SQL action commit. */ function* () {
                                    // A repeated original key must not add a second node, revision or original success receipt.
                                    const f = yield* fixture(dialect, connection);
                                    expect(yield* f.host.actions).toEqual(
                                        locationActions
                                            .map(
                                                /** Compare the complete registered metadata surface. */ (spec) =>
                                                    spec.name
                                            )
                                            .sort()
                                    );
                                    expect(yield* f.invoke('create', create, key)).toEqual({
                                        ...create,
                                        revision: 1,
                                        parent: null,
                                    });
                                    original = yield* f.sql`SELECT key, result FROM action_commit`;
                                    expect(yield* f.invoke('create', create, key)).toMatchObject({
                                        id: id(30),
                                        revision: 1,
                                    });
                                    expect(yield* f.sql`SELECT key, result FROM action_commit`).toEqual(original);
                                    expect(
                                        yield* Effect.either(f.invoke('create', { ...create, name: 'Changed' }, key))
                                    ).toMatchObject({ _tag: 'Left' });
                                    expect(yield* Effect.either(f.invoke('create', create))).toMatchObject({
                                        left: { error: { reason: 'conflict' } },
                                    });
                                    yield* f.invoke('create', {
                                        id: id(10),
                                        kind: 'zone',
                                        name: canary,
                                        parent: id(30),
                                    });
                                    yield* f.invoke('create', { id: id(20), kind: 'bin', name: 'Bin', parent: id(10) });
                                    yield* f.invoke('create', {
                                        id: id(5),
                                        kind: 'bin',
                                        name: 'Root bin',
                                        parent: null,
                                    });
                                    expect(yield* f.invoke('list', { limit: 2 })).toMatchObject({
                                        items: [{ id: id(5) }, { id: id(10) }],
                                        next: id(10),
                                    });
                                    expect(yield* f.invoke('list', { limit: 2, after: id(10) })).toMatchObject({
                                        items: [{ id: id(20) }, { id: id(30) }],
                                        next: id(30),
                                    });
                                    expect(yield* f.invoke('list', { after: id(30) })).toEqual({
                                        items: [],
                                        next: null,
                                    });
                                    expect(yield* f.invoke('list', { parent: null, limit: 1 })).toMatchObject({
                                        items: [{ id: id(5), parent: null }],
                                        next: id(5),
                                    });
                                    expect(yield* f.invoke('list', { parent: null, after: id(5) })).toMatchObject({
                                        items: [{ id: id(30) }],
                                        next: null,
                                    });
                                    expect(yield* f.invoke('list', { parent: id(30) })).toMatchObject({
                                        items: [{ id: id(10) }],
                                        next: null,
                                    });
                                    expect(
                                        yield* f.invoke('update', {
                                            id: id(10),
                                            expectedRevision: 1,
                                            name: 'Renamed zone',
                                        })
                                    ).toMatchObject({ revision: 2, parent: id(30), kind: 'zone' });
                                    expect(
                                        yield* f.invoke('update', { id: id(10), expectedRevision: 2, parent: null })
                                    ).toMatchObject({ revision: 3, parent: null, name: 'Renamed zone' });
                                    // No invented taxonomy: a warehouse may be under a bin if the graph remains acyclic.
                                    expect(
                                        yield* f.invoke('update', { id: id(30), expectedRevision: 1, parent: id(5) })
                                    ).toMatchObject({ revision: 2, parent: id(5), kind: 'warehouse' });
                                    const history = yield* f.scoped(f.api.history(f.definitions.locations, id(10)));
                                    expect(
                                        history.map(
                                            /** Preserve original parent/name values rather than backfilling old revisions. */ (
                                                row
                                            ) => [row.revision, row.value['parent'], row.value['name']]
                                        )
                                    ).toEqual([
                                        [1, id(30), canary],
                                        [2, id(30), 'Renamed zone'],
                                        [3, '', 'Renamed zone'],
                                    ]);
                                    expect(
                                        yield* f.sql`SELECT DISTINCT resource FROM resource_record ORDER BY resource`
                                    ).toEqual([
                                        { resource: 'inventory.location' },
                                        { resource: 'inventory.location-guard' },
                                    ]);
                                    expect(inspect(yield* f.sql`SELECT receipt FROM action_receipt`)).not.toContain(
                                        canary
                                    );
                                }
                            )
                        );
                        yield* Effect.scoped(
                            Effect.gen(
                                /** Reconstruct identity/provider/host on a genuinely reopened persistent database. */ function* () {
                                    const f = yield* fixture(dialect, connection, tenant, false);
                                    // Replaying creation returns its original revision, not the subsequently renamed/reparented current state.
                                    expect(yield* f.invoke('create', create, key)).toMatchObject({
                                        revision: 1,
                                        parent: null,
                                    });
                                    expect(yield* f.invoke('get', { id: id(30) })).toMatchObject({
                                        revision: 2,
                                        parent: id(5),
                                    });
                                    expect(yield* f.invoke('get', { id: id(10) })).toMatchObject({
                                        revision: 3,
                                        parent: null,
                                        name: 'Renamed zone',
                                    });
                                    expect(
                                        yield* f.scoped(f.api.history(f.definitions.locations, id(30)))
                                    ).toHaveLength(2);
                                }
                            )
                        );
                    }
                ),
            60000
        );

        it.scoped(
            'refuses self/indirect/missing/corrupt ancestry and checks past a full page',
            /** A late ancestor cycle must fail even beyond the default and maximum query page lengths. */ () =>
                Effect.gen(
                    /** Seed a long valid chain through the authorized resource fixture to bound setup cost without mocking traversal. */ function* () {
                        // Each mutation must walk exact parent records, not truncate a query at 50 or 100 rows.
                        const f = yield* fixture(dialect, yield* database(dialect));
                        expect(yield* Effect.either(f.invoke('get', { id: id(5000) }))).toMatchObject({
                            left: { error: { reason: 'not-found' } },
                        });
                        yield* f.invoke('create', { id: id(1), name: 'Root', kind: 'warehouse' });
                        for (let n = 2; n <= 105; n++)
                            yield* f.scoped(
                                f.api.create(f.definitions.locations, id(n), {
                                    kind: 'bin',
                                    name: canary,
                                    parent: id(n - 1),
                                })
                            );
                        for (const parent of [id(1), id(2), id(105)]) {
                            const result = yield* Effect.either(
                                f.invoke('update', { id: id(1), expectedRevision: 1, parent })
                            );
                            expect(result).toMatchObject({ left: { error: { reason: 'cycle' } } });
                            expect(inspect(result)).not.toContain(canary);
                        }
                        expect(
                            yield* Effect.either(
                                f.invoke('create', { id: id(200), name: 'Missing', kind: 'zone', parent: id(500) })
                            )
                        ).toMatchObject({ left: { error: { reason: 'invalid-parent' } } });
                        expect(
                            yield* Effect.either(f.invoke('update', { id: id(1), expectedRevision: 2, name: 'Stale' }))
                        ).toMatchObject({ left: { error: { reason: 'conflict' } } });
                        for (const corrupt of ['not-a-uuid', id(500), id(105)]) {
                            const row = yield* f.scoped(f.api.get(f.definitions.locations, id(105)));
                            yield* f.scoped(
                                f.api.update(f.definitions.locations, id(105), row?.revision ?? 0, { parent: corrupt })
                            );
                            expect(
                                yield* Effect.either(
                                    f.invoke('create', {
                                        id: id(200),
                                        name: 'Refuse corrupt',
                                        kind: 'zone',
                                        parent: id(105),
                                    })
                                )
                            ).toMatchObject({ _tag: 'Left' });
                        }
                        expect(yield* f.scoped(f.api.history(f.definitions.locations, id(1)))).toHaveLength(1);
                        expect(yield* f.scoped(f.api.history(f.definitions.locations, id(200)))).toEqual([]);
                        // Restore the deliberately corrupted leaf, then prove both sides of the maximum complete ancestry bound.
                        const leaf = yield* f.scoped(f.api.get(f.definitions.locations, id(105)));
                        yield* f.scoped(
                            f.api.update(f.definitions.locations, id(105), leaf?.revision ?? 0, { parent: id(104) })
                        );
                        yield* f.scoped(
                            f.api.transaction(
                                Effect.gen(
                                    /** Batch synthetic setup with the same current rows, schema pins and immutable revisions as individual creates. */ function* () {
                                        // Setup is not evidence of feature authorization; the following create actions are the public boundary proof.
                                        const rows = Array.from(
                                            { length: 920 },
                                            /** Preserve the existing hexadecimal UUIDs and encoded field order exactly. */ (
                                                _,
                                                offset
                                            ) => ({
                                                resource: f.definitions.locations.id,
                                                id: id(offset + 106),
                                                revision: 1,
                                                schema_version: f.definitions.locations.version,
                                                payload: JSON.stringify({
                                                    kind: 'zone',
                                                    name: 'Ancestor',
                                                    parent: id(offset + 105),
                                                }),
                                            })
                                        );
                                        yield* f.sql`INSERT INTO resource_record ${f.sql.insert(rows)}`;
                                        yield* f.sql`INSERT INTO resource_revision ${f.sql.insert(rows)}`;
                                    }
                                )
                            )
                        );
                        expect(
                            yield* f.invoke('create', {
                                id: id(2000),
                                name: 'Boundary accepted',
                                kind: 'bin',
                                parent: id(1024),
                            })
                        ).toMatchObject({ revision: 1, parent: id(1024) });
                        expect(
                            yield* Effect.either(
                                f.invoke('create', { id: id(2001), name: 'Over bound', kind: 'bin', parent: id(1025) })
                            )
                        ).toMatchObject({ left: { error: { reason: 'invalid-parent' } } });
                        expect(yield* f.scoped(f.api.history(f.definitions.locations, id(2001)))).toEqual([]);
                    }
                ),
            60000
        );

        it.scoped(
            'rolls back guard and tentative writes on failure/interruption and recovers only through original keys',
            /** Controlled write barriers prove no leaked locks, half history or success commits. */ () =>
                Effect.gen(
                    /** Probe after guard acquisition and both sides of the actual location driver write. */ function* () {
                        // Fresh fixtures give each interruption barrier a single owner; no gate from a previous trial can release it.
                        const connection = yield* database(dialect);
                        for (const point of ['guard', 'before', 'after'] as const) {
                            const f = yield* fixture(dialect, connection, tenant, point === 'guard');
                            const key = randomUUID();
                            const input = {
                                id: id(point === 'guard' ? 1 : point === 'before' ? 2 : 3),
                                kind: 'bin',
                                name: canary,
                            };
                            const guardBefore = yield* f.scoped(f.api.history(f.definitions.guard, id(1)));
                            yield* Ref.set(f.fault, point);
                            const failed = yield* Effect.either(f.invoke('create', input, key));
                            expect(failed).toMatchObject({ left: { error: { reason: 'unavailable' } } });
                            expect(inspect(failed)).not.toContain(canary);
                            yield* Ref.set(f.fault, 'none');
                            yield* Ref.set(f.pause, point);
                            const pending = yield* Effect.fork(f.invoke('create', input, key));
                            yield* Deferred.await(f.arrived);
                            const stopped = yield* Fiber.interrupt(pending);
                            expect(Exit.isFailure(stopped) && Cause.isInterrupted(stopped.cause)).toBe(true);
                            yield* Ref.set(f.pause, 'none');
                            expect(yield* f.scoped(f.api.get(f.definitions.locations, input.id))).toBeUndefined();
                            expect(yield* f.scoped(f.api.history(f.definitions.locations, input.id))).toEqual([]);
                            expect(yield* f.scoped(f.api.history(f.definitions.guard, id(1)))).toEqual(guardBefore);
                            expect(yield* f.sql`SELECT key FROM action_commit WHERE key LIKE ${`%${key}%`}`).toEqual(
                                []
                            );
                            yield* f.invoke('create', input, key);
                            yield* f.invoke('create', input, key);
                            expect(yield* f.scoped(f.api.history(f.definitions.locations, input.id))).toHaveLength(1);
                        }
                    }
                ),
            60000
        );

        it.scoped(
            'rechecks flags/resources after guard acquisition without blocking a foreign tenant',
            /** Revocation while the SQL guard is held must roll it back and preserve cross-tenant progress. */ () =>
                Effect.gen(
                    /** Pause only the owning tenant transaction, with ordinary SQL identity locking intact. */ function* () {
                        // A process-global lock would incorrectly stall the other tenant's host while this guard is held.
                        for (const revoke of ['flag', 'resource'] as const) {
                            const f = yield* fixture(dialect, yield* database(dialect));
                            const b = yield* fixture(dialect, yield* database(dialect), TenantId.make(id(910)));
                            yield* Ref.set(f.pause, 'guard');
                            const key = randomUUID();
                            const input = { id: id(1), name: canary, kind: 'zone' };
                            const pending = yield* Effect.fork(f.invoke('create', input, key).pipe(Effect.either));
                            yield* Deferred.await(f.arrived);
                            yield* b.invoke('create', { ...input, name: 'Independent tenant' });
                            if (revoke === 'flag') yield* Ref.set(f.enabled, false);
                            else yield* Ref.set(f.denied, true);
                            yield* Deferred.succeed(f.release, undefined);
                            expect(yield* Fiber.join(pending)).toMatchObject({ _tag: 'Left' });
                            yield* Ref.set(f.denied, false);
                            yield* Ref.set(f.enabled, true);
                            yield* Ref.set(f.pause, 'none');
                            expect(yield* f.scoped(f.api.history(f.definitions.guard, id(1)))).toEqual([]);
                            expect(yield* f.scoped(f.api.history(f.definitions.locations, id(1)))).toEqual([]);
                            expect(yield* f.sql`SELECT key FROM action_commit`).toEqual([]);
                            yield* f.invoke('create', input, key);
                            expect(yield* f.scoped(f.api.history(f.definitions.locations, id(1)))).toHaveLength(1);
                        }
                    }
                ),
            60000
        );

        it.scoped(
            'denies fresh policy/identity/flag/resource changes, excess fields and foreign parent routing',
            /** A retained host and original retry key grant no lasting authority. */ () =>
                Effect.gen(
                    /** Mutate live SQL identity and resource policy without rebuilding the action host. */ function* () {
                        // Reuse identical record IDs across distinct physical tenant routes to detect accidental global graph/caller state.
                        const f = yield* fixture(dialect, yield* database(dialect));
                        const bTenant = TenantId.make(id(910));
                        const b = yield* fixture(dialect, yield* database(dialect), bTenant);
                        const input = { id: id(1), name: canary, kind: 'bin' };
                        const key = randomUUID();
                        for (const extra of [{ tenant }, { quantity: 0 }, { archived: false }, { kind: 'vehicle' }])
                            expect(yield* Effect.either(f.invoke('create', { ...input, ...extra }))).toMatchObject({
                                left: { _tag: 'InvalidInput' },
                            });
                        yield* Ref.set(f.enabled, undefined);
                        expect(yield* Effect.either(f.invoke('create', input, key))).toMatchObject({ _tag: 'Left' });
                        yield* Ref.set(f.enabled, true);
                        yield* f.invoke('create', input, key);
                        expect(
                            yield* Effect.either(b.invoke('create', { ...input, id: id(2), parent: id(1) }))
                        ).toMatchObject({ left: { error: { reason: 'invalid-parent' } } });
                        yield* b.invoke('create', { ...input, name: 'Tenant B' });
                        expect(yield* b.invoke('get', { id: id(1) })).toMatchObject({ name: 'Tenant B' });
                        expect(yield* f.invoke('get', { id: id(1) })).toMatchObject({ name: canary });
                        expect(
                            yield* Effect.either(
                                f.invoke('get', { id: id(1) }, randomUUID(), { ...caller, tenant: bTenant })
                            )
                        ).toMatchObject({ _tag: 'Left' });
                        yield* Ref.set(f.denied, true);
                        expect(yield* Effect.either(f.invoke('get', { id: id(1) }))).toMatchObject({
                            left: { error: { reason: 'unavailable' } },
                        });
                        yield* Ref.set(f.denied, false);
                        yield* Ref.set(f.enabled, false);
                        expect(yield* Effect.either(f.invoke('create', input, key))).toMatchObject({ _tag: 'Left' });
                        yield* Ref.set(f.enabled, true);
                        yield* f.store.put(
                            'role',
                            {
                                id: role,
                                name: 'Revoked writer',
                                grants: [{ permission: 'inventory.location.read', resources: ['*'] }],
                            },
                            0
                        );
                        expect(yield* Effect.either(f.invoke('create', input, key))).toMatchObject({
                            left: { _tag: 'Forbidden' },
                        });
                        yield* f.store.put('membership', { id: caller.subject, active: false, roles: [role] }, 0);
                        expect(yield* Effect.either(f.invoke('get', { id: id(1) }))).toMatchObject({ _tag: 'Left' });
                        yield* f.store.put('membership', { id: caller.subject, active: true, roles: [role] }, 1);
                        yield* f.store.put(
                            'session',
                            {
                                id: caller.session,
                                subject: caller.subject,
                                active: false,
                                expiresAt: 253402300799999,
                                delegation: null,
                            },
                            0
                        );
                        expect(yield* Effect.either(f.invoke('get', { id: id(1) }))).toMatchObject({ _tag: 'Left' });
                    }
                ),
            60000
        );
    });

it.scoped(
    'serializes independent PostgreSQL reverse and disjoint longer cycles, including concurrent guard initialization',
    /** Both clients observe the same pre-lock revision so a per-target-CAS-only implementation would admit a cycle. */ () =>
        Effect.gen(
            /** Interleave real transactions across independently constructed client pools and transaction owners. */ function* () {
                // No shared module, resource provider, mutex or SQL client exists between these fixtures.
                const connection = yield* database('postgres');
                const a = yield* fixture('postgres', connection, tenant, true, true);
                const b = yield* fixture('postgres', connection, tenant, false, true);
                expect(a.sql).not.toBe(b.sql);
                expect(yield* a.sql`SELECT pg_backend_pid() AS pid`).not.toEqual(
                    yield* b.sql`SELECT pg_backend_pid() AS pid`
                );
                for (const f of [a, b]) yield* Ref.set(f.pause, 'read-guard');
                const first = yield* Effect.fork(
                    a.invoke('create', { id: id(1), name: 'A', kind: 'warehouse' }).pipe(Effect.either)
                );
                const second = yield* Effect.fork(
                    b.invoke('create', { id: id(2), name: 'B', kind: 'bin' }).pipe(Effect.either)
                );
                yield* Deferred.await(a.arrived);
                yield* Deferred.await(b.arrived);
                yield* Deferred.succeed(a.release, undefined);
                yield* Deferred.succeed(b.release, undefined);
                expect(yield* Fiber.join(first)).toMatchObject({ _tag: 'Right' });
                expect(yield* Fiber.join(second)).toMatchObject({ _tag: 'Right' });
                for (const n of [3, 4]) yield* a.invoke('create', { id: id(n), name: `Node ${n}`, kind: 'zone' });
                for (const longer of [false, true]) {
                    const x = yield* fixture('postgres', connection, tenant, false, true);
                    const y = yield* fixture('postgres', connection, tenant, false, true);
                    // Reset a clean disjoint chain for the longer A->B->C->D->A counterexample.
                    if (longer) {
                        for (const n of [1, 2]) {
                            const current = yield* x.scoped(x.api.get(x.definitions.locations, id(n)));
                            yield* x.invoke('update', {
                                id: id(n),
                                expectedRevision: current?.revision ?? 0,
                                parent: null,
                            });
                        }
                        const reset = yield* x.scoped(x.api.get(x.definitions.locations, id(1)));
                        yield* x.invoke('update', { id: id(1), expectedRevision: reset?.revision ?? 0, parent: id(2) });
                        yield* x.invoke('update', { id: id(3), expectedRevision: 1, parent: id(4) });
                    }
                    const targetA = longer ? 2 : 1;
                    const targetB = longer ? 4 : 2;
                    const rowA = yield* x.scoped(x.api.get(x.definitions.locations, id(targetA)));
                    const rowB = yield* y.scoped(y.api.get(y.definitions.locations, id(targetB)));
                    for (const f of [x, y]) yield* Ref.set(f.pause, 'read-guard');
                    const left = yield* Effect.fork(
                        x
                            .invoke('update', {
                                id: id(targetA),
                                expectedRevision: rowA?.revision ?? 0,
                                parent: id(longer ? 3 : 2),
                            })
                            .pipe(Effect.either)
                    );
                    const right = yield* Effect.fork(
                        y
                            .invoke('update', { id: id(targetB), expectedRevision: rowB?.revision ?? 0, parent: id(1) })
                            .pipe(Effect.either)
                    );
                    yield* Deferred.await(x.arrived);
                    yield* Deferred.await(y.arrived);
                    yield* Deferred.succeed(x.release, undefined);
                    yield* Deferred.succeed(y.release, undefined);
                    const results = [yield* Fiber.join(left), yield* Fiber.join(right)];
                    expect(results.filter(Either.isRight)).toHaveLength(1);
                    expect(results.filter(Either.isLeft)).toMatchObject([{ left: { error: { reason: 'cycle' } } }]);
                }
            }
        ),
    60000
);
