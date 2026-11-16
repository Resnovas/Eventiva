/**
 * @file tests/resources/src/resource.spec.ts
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

import { randomUUID, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { inspect } from 'node:util';
import { SqlClient } from '@effect/sql';
import { describe, expect, it } from '@effect/vitest';
import { Cause, ConfigProvider, Context, Effect, Either, Exit, FiberRef, Layer, Schema } from 'effect';
import { Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { HookDeclaration, HookEvent, HookOutboxFailure } from '@eventiva/contracts/hook';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant, Storage, TenantRouter } from '@eventiva/contracts/storage';
import {
    canonicalDefinition,
    contributeFields,
    declareResource,
    decodeResource,
    ResourceDefinition,
    ResourceFailure,
    ResourceProviderIdentity,
    Resources,
    validateDefinition,
    type Field,
    type ResourceProvider,
    type ResourceScope,
} from '@eventiva/contracts/resource';
import { client } from '@eventiva/integrations.sql/postgres';
import { memory } from '@eventiva/integrations.sql/sqlite';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { router } from '@eventiva/integrations.sql/router';
import {
    migrateResources,
    planResourceMigrations,
    resourceProvider,
    resourceHookProvider,
} from '@eventiva/integrations.sql/resource';
import { resourceRuntime } from '@eventiva/runtime/resource';
import { durable } from '@eventiva/runtime/storage';
import { Integrity } from '@eventiva/runtime/invocation';
import { KernelAuthority, KernelError } from '@eventiva/contracts/module-policy';
import type { KernelManifest } from '@eventiva/contracts/module-manifest';
import { Kernel, KernelEnvironment, KernelLive, KernelModule, kernelProvider } from '@eventiva/runtime/kernel-runtime';

class ResourceCapability {
    readonly resources: typeof Resources.Service;
    constructor(resources: typeof Resources.Service) {
        this.resources = resources;
    }
}
const ResourceCapabilitySchema = Schema.instanceOf(ResourceCapability);

const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const tenant = Schema.decodeUnknownSync(TenantId)(id(900));
const otherTenant = Schema.decodeUnknownSync(TenantId)(id(901));
const caller: CallerIdentity = {
    subject: Schema.decodeUnknownSync(SubjectId)(id(902)),
    kind: 'human',
    tenant,
    session: Schema.decodeUnknownSync(SessionId)(id(903)),
};
const identity = { key: { module: 'eventiva.sql', instance: 'primary' }, version: '1.0.0' };
const policy = { kind: 'additive', restartRequired: false, retainedGenerations: 0 } as const;
const base = () =>
    declareResource({
        id: 'crm.contact',
        owner: 'app.crm',
        moduleVersion: '1.0.0',
        fields: {
            name: { type: 'text', optional: false },
            seats: { type: 'integer', optional: false },
            active: { type: 'boolean', optional: false },
            amount: { type: 'decimal', optional: false },
            occurred: { type: 'timestamp', optional: true },
            external: { type: 'uuid', optional: true },
        },
    });
const extra = {
    owner: 'app.marketing',
    moduleVersion: '2.3.4',
    fields: { campaign: { type: 'text', optional: true } },
} as const;
const data = {
    name: "O'Reilly %_",
    seats: 7,
    active: true,
    amount: '9007199254740993.1200',
    occurred: 1794700000123,
    external: id(7),
};
const auth = <A, E, R>(effect: Effect.Effect<A, E, R | ResourceScope>) =>
    effect.pipe(Effect.provideService(Caller, caller), Effect.provideService(CurrentTenant, { id: tenant }));
const denied = (detail: string) => new ResourceFailure({ reason: 'denied', detail });
const bind = (provider: ResourceProvider) =>
    Layer.build(resourceRuntime(provider, () => Effect.void)).pipe(
        Effect.map((context) => Context.get(context, Resources))
    );
// Remove live services inside the effect, retaining its requirements for type-safe outer provision.
const absent = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    effect.pipe(Effect.locally(FiberRef.currentContext, Context.empty()));

const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
const withDatabase = <A, E, R>(dialect: Dialect, effect: Effect.Effect<A, E, R | SqlClient.SqlClient>) =>
    Effect.scoped(
        Effect.gen(function* () {
            let connection: Context.Context<SqlClient.SqlClient>;
            if (dialect === 'postgres') {
                const target = new URL(local);
                if (
                    !['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) ||
                    target.pathname !== '/eventiva_test'
                )
                    return yield* denied('Resource conformance requires disposable loopback eventiva_test');
                const adminContext = yield* Layer.build(pg(local));
                const admin = Context.get(adminContext, SqlClient.SqlClient);
                const database = `resource_${randomUUID().replaceAll('-', '')}`;
                yield* admin`CREATE DATABASE ${admin(database)} TEMPLATE template0`;
                yield* Effect.addFinalizer(() => admin`DROP DATABASE ${admin(database)}`.pipe(Effect.orDie));
                target.pathname = '/' + database;
                connection = yield* Layer.build(pg(target.toString()));
            } else connection = yield* Layer.build(memory());
            const sql = Context.get(connection, SqlClient.SqlClient);
            const migrations = yield* load(
                fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url))
            );
            yield* migrate(dialect, migrations).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            return yield* effect.pipe(Effect.provideService(SqlClient.SqlClient, sql));
        })
    );

describe('portable resource declarations', () => {
    it.effect('strict schemas reject unpinned versions, unknown keys, invalid owners and lossy values', () =>
        Effect.gen(function* () {
            const resource = yield* base();
            for (const bad of [
                { ...resource, moduleVersion: '^1.0.0' },
                { ...resource, sql: 'DROP TABLE' },
                { ...resource, fields: {} },
                { ...resource, owners: {} },
                { ...resource, fields: { ...resource.fields, prototype: { type: 'text', optional: true } } },
            ] as const)
                expect(yield* Effect.either(validateDefinition(bad))).toMatchObject({ _tag: 'Left' });
            for (const bad of [
                { ...data, sql: 'unsafe' },
                { ...data, seats: 1.5 },
                { ...data, seats: Number.MAX_SAFE_INTEGER + 1 },
                { ...data, amount: 1.23 },
                { ...data, amount: 'NaN' },
                { ...data, active: 1 },
                { ...data, external: 'not-uuid' },
                { ...data, occurred: Number.POSITIVE_INFINITY },
                { ...data, occurred: undefined },
            ])
                expect(yield* Effect.either(decodeResource(resource, bad))).toMatchObject({
                    left: { reason: 'invalid-value' },
                });
            expect(yield* decodeResource(resource, data)).toEqual(data);
            expect(yield* decodeResource(resource, { ...data, seats: Number.MIN_SAFE_INTEGER })).toHaveProperty(
                'seats',
                Number.MIN_SAFE_INTEGER
            );
            expect(
                yield* Effect.either(Schema.decodeUnknown(ResourceDefinition)({ ...resource, hidden: true }))
            ).toMatchObject({ _tag: 'Left' });
            expect(
                yield* Effect.either(Schema.decodeUnknown(ResourceDefinition)({ ...resource, version: 2147483648 }))
            ).toMatchObject({ _tag: 'Left' });
            expect(
                yield* Effect.either(
                    Schema.decodeUnknown(ResourceProviderIdentity)({
                        ...identity,
                        key: { module: 'sql', instance: '../secret' },
                    })
                )
            ).toMatchObject({ _tag: 'Left' });
            const secret = 'resource-secret-canary';
            const rejected = yield* Effect.exit(decodeResource(resource, { ...data, seats: secret }));
            expect(Exit.isFailure(rejected)).toBe(true);
            if (Exit.isFailure(rejected)) {
                for (const text of [
                    JSON.stringify(rejected),
                    inspect(rejected, { depth: 10 }),
                    Cause.pretty(rejected.cause),
                ])
                    expect(text).not.toContain(secret);
            }
        })
    );
    it.effect('separate module contributions preserve typing and reject collisions or required additions', () =>
        Effect.gen(function* () {
            const resource = yield* base();
            const extended = yield* contributeFields(resource, extra);
            const extendedAgain = yield* contributeFields(extended, {
                owner: 'app.notes',
                moduleVersion: '1.1.0',
                fields: { notes: { type: 'text', optional: true } },
            });
            expect(extendedAgain.version).toBe(3);
            expect(extended.owners['campaign']).toEqual({ module: 'app.marketing', version: '2.3.4' });
            expect(yield* decodeResource(extended, { ...data, campaign: 'spring' })).toHaveProperty(
                'campaign',
                'spring'
            );
            expect(
                yield* Effect.either(
                    contributeFields(resource, { ...extra, fields: { name: { type: 'text', optional: true } } })
                )
            ).toMatchObject({ left: { reason: 'unsafe-migration' } });
            expect(
                yield* Effect.either(
                    contributeFields(resource, { ...extra, fields: { required: { type: 'text', optional: false } } })
                )
            ).toMatchObject({ left: { reason: 'unsafe-migration' } });
            expect(yield* Effect.either(contributeFields(resource, { ...extra, fields: {} }))).toMatchObject({
                left: { reason: 'unsafe-migration' },
            });
        })
    );
    it.effect('typed codecs detach declarations and reject malformed full and partial records without coercion', () =>
        Effect.gen(function* () {
            const field: { type: Field['type']; optional: boolean } = { type: 'text', optional: false };
            const resource = yield* declareResource({
                id: 'test.codec',
                owner: 'test',
                moduleVersion: '1.0.0',
                fields: { label: field },
            });
            const contribution: { type: Field['type']; optional: boolean } = { type: 'text', optional: true };
            const extended = yield* contributeFields(resource, {
                owner: 'notes',
                moduleVersion: '1.0.0',
                fields: { note: contribution },
            });
            field.type = 'integer';
            contribution.optional = false;
            expect(resource.fields.label).toEqual({ type: 'text', optional: false });
            expect(extended.fields.label).toEqual({ type: 'text', optional: false });
            expect(extended.fields.note).toEqual({ type: 'text', optional: true });
            expect(yield* decodeResource(extended, { label: 'kept' })).toEqual({ label: 'kept' });
            expect(yield* decodeResource(extended, { note: 'patch' }, true)).toEqual({ note: 'patch' });
            for (const invalid of [{}, { label: 3 }, { label: 'x', extra: true }, { label: null }, { label: ['x'] }])
                expect(yield* Effect.either(decodeResource(extended, invalid))).toMatchObject({
                    left: { reason: 'invalid-value' },
                });
            for (const invalid of [{ note: undefined }, { note: 5 }, { extra: 'hidden' }, { note: { nested: true } }])
                expect(yield* Effect.either(decodeResource(extended, invalid, true))).toMatchObject({
                    left: { reason: 'invalid-value' },
                });
        })
    );
    it.effect('restart, retained generation and unsafe plans return before requiring any SQL service', () =>
        Effect.gen(function* () {
            const resource = yield* base();
            const extended = yield* contributeFields(resource, extra);
            const plan = yield* planResourceMigrations([resource, extended], policy);
            expect(plan).toMatchObject({
                status: 'ready',
                migrations: [
                    { from: 0, to: 1 },
                    { from: 1, to: 2, dependencies: ['crm.contact.v1'], compatibleFrom: 1, compatibleThrough: 2 },
                ],
            });
            if (plan.status === 'ready')
                expect(plan.migrations[1]?.checksum).toBe(
                    createHash('sha256').update(canonicalDefinition(extended)).digest('hex')
                );
            for (const [request, reason] of [
                [{ ...policy, kind: 'staged' }, 'migration'],
                [{ ...policy, restartRequired: true }, 'declared'],
                [{ ...policy, retainedGenerations: 1 }, 'active-generations'],
            ] as const) {
                // Providing an empty Context proves no client is read, not only that no statement is written.
                const result = yield* absent(migrateResources('sqlite', tenant, [resource], request)).pipe(
                    Effect.provide(memory())
                );
                expect(result).toEqual({ status: 'restart-required', reason });
            }
            for (const bad of [
                { ...extended, fields: { ...extended.fields, name: { type: 'integer', optional: false } } },
                {
                    ...extended,
                    fields: { campaign: extended.fields.campaign },
                    owners: { campaign: { module: extra.owner, version: extra.moduleVersion } },
                },
                { ...extended, owner: 'app.other' },
                { ...extended, version: 4 },
                { ...extended, fields: { ...extended.fields, campaign: { type: 'text', optional: false } } },
            ] satisfies ReadonlyArray<ResourceDefinition>)
                expect(yield* planResourceMigrations([resource, bad], policy)).toEqual({
                    status: 'restart-required',
                    reason: 'migration',
                });
            expect(yield* Effect.either(planResourceMigrations([extended], policy))).toMatchObject({
                left: { reason: 'unsafe-migration' },
            });
        })
    );
});

for (const dialect of ['postgres', 'sqlite'] as const)
    describe(`${dialect} central resource conformance`, () => {
        it.effect('shares one trusted resource and hook owner for atomic commit, rollback and replay', () =>
            withDatabase(
                dialect,
                auth(
                    Effect.gen(function* () {
                        const resource = yield* base();
                        yield* migrateResources(dialect, tenant, [resource], policy);
                        const provider = yield* resourceHookProvider(dialect, tenant, identity, [resource]);
                        const api = yield* bind(provider);
                        const observation = yield* Schema.decodeUnknown(HookEvent)({
                            format: 1,
                            id: id(60),
                            tenant,
                            commit: id(61),
                            resource: resource.id,
                            resourceId: id(62),
                            purpose: 'crm.notify',
                            profile: 'baseline',
                            operation: 'ordinary',
                            sequence: 1,
                            projection: {
                                kind: 'domain.change',
                                identity: { module: 'app.crm', version: '1.0.0', generation: 1 },
                                change: 'created',
                                revision: 1,
                            },
                        });
                        const observer = yield* Schema.decodeUnknown(HookDeclaration)({
                            format: 1,
                            pin: {
                                tenant,
                                owner: { module: 'app.notify', version: '1.0.0', generation: 1 },
                                hook: 'crm.notify',
                                revision: 1,
                            },
                            delivery: 'post-commit',
                            target: 'declarative',
                            capability: { kind: 'observation' },
                            observations: ['domain.change'],
                            profiles: ['baseline'],
                            maxAttempts: 2,
                            retryDelayMs: 10,
                            timeoutMs: 100,
                            concurrency: 1,
                            capacity: 2,
                        });
                        const write = Effect.gen(function* () {
                            const record = yield* api.create(resource, observation.resourceId, data);
                            yield* provider.outbox.stage(observation, [observer]);
                            return { output: record.value, receipt: { committed: true } };
                        });
                        const aborted = yield* provider.storage
                            .commit(
                                { key: 'aborted', inputHash: 'one' },
                                write.pipe(Effect.zipRight(Effect.fail(new HookOutboxFailure({ reason: 'conflict' }))))
                            )
                            .pipe(Effect.either);
                        expect(Either.isLeft(aborted)).toBe(true);
                        expect(yield* api.get(resource, observation.resourceId)).toBeUndefined();
                        expect(yield* api.history(resource, observation.resourceId)).toEqual([]);
                        expect(yield* provider.outbox.claim(observer, 0)).toBeUndefined();
                        expect(yield* provider.feed.read(0, 100)).toEqual({ cursor: 0, events: [] });
                        const request = { key: 'created', inputHash: 'one' };
                        expect((yield* provider.storage.commit(request, write)).replayed).toBe(false);
                        expect((yield* provider.storage.commit(request, write)).replayed).toBe(true);
                        expect(yield* api.history(resource, observation.resourceId)).toHaveLength(1);
                        expect(yield* provider.feed.read(0, 100)).toEqual({
                            cursor: 1,
                            events: [{ cursor: 1, event: observation }],
                        });
                        expect(
                            yield* provider.storage
                                .commit({ ...request, inputHash: 'changed' }, write)
                                .pipe(Effect.flip)
                        ).toMatchObject({ reason: 'input-changed' });
                        const claim = yield* provider.outbox.claim(observer, 0);
                        expect(claim?.event).toEqual(observation);
                        if (claim === undefined) return yield* new HookOutboxFailure({ reason: 'unavailable' });
                        yield* provider.outbox.settle(claim, { state: 'delivered' });
                        expect(yield* provider.outbox.claim(observer, 0)).toBeUndefined();

                        // A separately constructed root is foreign even on the exact same SqlClient.
                        const other = yield* resourceHookProvider(dialect, tenant, identity, [resource]);
                        const otherApi = yield* bind(other);
                        expect(
                            yield* provider.storage
                                .transaction(other.storage.transaction(Effect.void))
                                .pipe(Effect.flip)
                        ).toMatchObject({ operation: 'resource-provider-boundary' });
                        expect(
                            yield* provider.storage
                                .transaction(otherApi.get(resource, observation.resourceId))
                                .pipe(Effect.flip)
                        ).toMatchObject({ reason: 'denied' });
                        expect(
                            yield* provider.storage
                                .transaction(other.outbox.stage(observation, [observer]))
                                .pipe(Effect.flip)
                        ).toMatchObject({ reason: 'transaction-required' });
                        const sql = yield* SqlClient.SqlClient;
                        expect(
                            yield* sql.withTransaction(provider.storage.transaction(Effect.void)).pipe(Effect.flip)
                        ).toMatchObject({ operation: 'resource-provider-boundary' });
                        expect(
                            yield* resourceHookProvider(dialect, otherTenant, identity, [resource]).pipe(Effect.flip)
                        ).toMatchObject({ reason: 'denied' });
                    })
                )
            )
        );

        it.effect('composes callable SQL resources through the kernel without losing tenant checks', () =>
            withDatabase(
                dialect,
                auth(
                    Effect.gen(function* () {
                        const resource = yield* base();
                        yield* migrateResources(dialect, tenant, [resource], policy);
                        const provider = yield* resourceProvider(dialect, tenant, identity, [resource]);
                        const api = yield* bind(provider);
                        yield* api.create(resource, id(71), data);
                        const handle = yield* kernelProvider(ResourceCapabilitySchema, new ResourceCapability(api));
                        const storageManifest: KernelManifest = {
                            id: 'eventiva.sql',
                            version: '1.0.0',
                            trust: 'first-party',
                            isolation: 'in-process',
                            dependencies: [],
                            requires: [],
                            migrations: [],
                            restartRequired: false,
                            provides: [{ name: 'primary', capability: 'resources', version: '1.0.0' }],
                        };
                        const consumerManifest: KernelManifest = {
                            ...storageManifest,
                            id: 'app.crm',
                            provides: [],
                            dependencies: [{ id: 'eventiva.sql', version: '1.0.0' }],
                            requires: [{ name: 'records', capability: 'resources', version: '1.0.0' }],
                        };
                        const lifecycle = {
                            install: Effect.void,
                            activate: Effect.void,
                            ready: Effect.void,
                            deactivate: Effect.void,
                        };
                        const kernel = yield* Kernel;
                        const receipt = yield* kernel.compose(
                            {
                                modules: [storageManifest, consumerManifest].map(({ id, version }) => ({
                                    id,
                                    version,
                                })),
                                bindings: [
                                    {
                                        consumer: 'app.crm',
                                        requirement: 'records',
                                        provider: 'eventiva.sql',
                                        instance: 'primary',
                                    },
                                ],
                            },
                            [
                                {
                                    manifest: storageManifest,
                                    validate: Effect.void,
                                    layer: Layer.succeed(KernelModule, {
                                        ...lifecycle,
                                        providers: new Map([['primary', handle]]),
                                    }),
                                },
                                {
                                    manifest: consumerManifest,
                                    validate: Effect.void,
                                    layer: Layer.effect(
                                        KernelModule,
                                        Effect.gen(function* () {
                                            const environment = yield* KernelEnvironment;
                                            const capability = yield* environment.resolve(
                                                'records',
                                                ResourceCapabilitySchema
                                            );
                                            return KernelModule.of({
                                                ...lifecycle,
                                                providers: new Map(),
                                                ready: auth(capability.resources.get(resource, id(71))).pipe(
                                                    Effect.tap((row) =>
                                                        Effect.sync(() => expect(row?.value.amount).toBe(data.amount))
                                                    ),
                                                    Effect.asVoid,
                                                    Effect.mapError(
                                                        () =>
                                                            new KernelError({
                                                                module: 'app.crm',
                                                                reason: 'module-failed',
                                                            })
                                                    )
                                                ),
                                            });
                                        })
                                    ),
                                },
                            ]
                        );
                        expect(receipt.emitted).toBe(true);
                        expect((yield* kernel.snapshot).map(({ state }) => state)).toEqual(['ready', 'ready']);
                        expect(
                            yield* Effect.either(
                                api
                                    .get(resource, id(71))
                                    .pipe(Effect.provideService(Caller, { ...caller, tenant: otherTenant }))
                            )
                        ).toMatchObject({ left: { reason: 'denied' } });
                    }).pipe(
                        Effect.provide(
                            KernelLive('integration').pipe(
                                Layer.provide(
                                    Layer.succeed(KernelAuthority, {
                                        admit: () => Effect.void,
                                        authorize: () => Effect.void,
                                    })
                                )
                            )
                        )
                    )
                )
            )
        );

        it.effect(
            'runs unchanged typed CRUD, exact values, equality queries, pagination and concurrent revision checks',
            () =>
                withDatabase(
                    dialect,
                    auth(
                        Effect.gen(function* () {
                            const resource = yield* base();
                            yield* migrateResources(dialect, tenant, [resource], policy);
                            const provider = yield* resourceProvider(dialect, tenant, identity, [resource]);
                            const api = yield* bind(provider);
                            expect(yield* api.get(resource, id(1))).toBeUndefined();
                            expect(yield* api.create(resource, id(2), data)).toEqual({
                                id: id(2),
                                revision: 1,
                                schemaVersion: 1,
                                value: data,
                            });
                            yield* api.create(resource, id(1), { ...data, seats: -3, active: false });
                            expect(yield* Effect.either(api.create(resource, id(2), data))).toMatchObject({
                                left: { reason: 'conflict' },
                            });
                            for (const where of [
                                { field: 'name', equals: data.name },
                                { field: 'seats', equals: 7 },
                                { field: 'active', equals: true },
                                { field: 'amount', equals: data.amount },
                                { field: 'occurred', equals: data.occurred },
                                { field: 'external', equals: data.external },
                            ] as const) {
                                const { field } = where;
                                const rows = yield* api.query(resource, { where, limit: 100 });
                                expect(rows.map((row) => row.id)).toEqual(
                                    field === 'name' ||
                                        field === 'amount' ||
                                        field === 'occurred' ||
                                        field === 'external'
                                        ? [id(1), id(2)]
                                        : [id(2)]
                                );
                            }
                            expect(
                                (yield* api.query(resource, {
                                    where: { field: 'active', equals: false },
                                    limit: 1,
                                })).map((row) => row.id)
                            ).toEqual([id(1)]);
                            expect(
                                (yield* api.query(resource, { after: id(1), limit: 1 })).map((row) => row.id)
                            ).toEqual([id(2)]);
                            expect(
                                yield* api.query(resource, {
                                    where: { field: 'name', equals: "' OR 1=1 --" },
                                    limit: 100,
                                })
                            ).toEqual([]);
                            const results = yield* Effect.all(
                                [
                                    api.update(resource, id(2), 1, { seats: 8 }),
                                    api.update(resource, id(2), 1, { seats: 9 }),
                                ].map(Effect.either),
                                { concurrency: 'unbounded' }
                            );
                            expect(results.filter(Either.isRight)).toHaveLength(1);
                            expect(results.filter(Either.isLeft)).toHaveLength(1);
                            const current = yield* api.get(resource, id(2));
                            expect(current?.revision).toBe(2);
                            expect([8, 9]).toContain(current?.value.seats);
                            expect(current?.value.amount).toBe(data.amount);
                            expect(yield* api.history(resource, id(2))).toHaveLength(2);
                            expect(yield* Effect.either(api.update(resource, id(99), 1, { seats: 4 }))).toMatchObject({
                                left: { reason: 'conflict' },
                            });
                        })
                    )
                ),
            20000
        );

        it.effect(
            'additive migration preserves old payload/history, fences stale writers, and deactivation never drops data',
            () =>
                withDatabase(
                    dialect,
                    auth(
                        Effect.gen(function* () {
                            const resource = yield* base();
                            const extended = yield* contributeFields(resource, extra);
                            yield* migrateResources(dialect, tenant, [resource], policy);
                            const oldProvider = yield* resourceProvider(dialect, tenant, identity, [resource]);
                            const oldApi = yield* bind(oldProvider);
                            yield* oldApi.create(resource, id(1), data);
                            const applied = yield* migrateResources(dialect, tenant, [resource, extended], policy);
                            expect(applied).toMatchObject({
                                status: 'applied',
                                migrations: [{ from: 1, to: 2, kind: 'additive' }],
                            });
                            expect(yield* migrateResources(dialect, tenant, [resource, extended], policy)).toEqual({
                                status: 'applied',
                                migrations: [],
                            });
                            expect(
                                yield* Effect.either(oldApi.update(resource, id(1), 1, { name: 'stale' }))
                            ).toMatchObject({ left: { reason: 'schema-mismatch' } });
                            expect(
                                yield* Effect.either(resourceProvider(dialect, tenant, identity, [resource]))
                            ).toMatchObject({ left: { reason: 'schema-mismatch' } });
                            const provider = yield* resourceProvider(
                                dialect,
                                tenant,
                                { ...identity, key: { module: 'eventiva.sql', instance: 'replacement' } },
                                [extended]
                            );
                            const api = yield* bind(provider);
                            expect(yield* api.get(extended, id(1))).toEqual({
                                id: id(1),
                                revision: 1,
                                schemaVersion: 1,
                                value: data,
                            });
                            const updated = yield* api.update(extended, id(1), 1, { campaign: 'spring' });
                            expect(updated.value.name).toBe(data.name);
                            const historical = yield* api.history(extended, id(1));
                            expect(historical).toEqual([
                                { id: id(1), revision: 1, schemaVersion: 1, value: data },
                                updated,
                            ]);
                            // Removing the active registration closes its layer only; reopening must see retained schema and records.
                            const inactive = yield* resourceProvider(dialect, tenant, identity, []);
                            const empty = yield* bind(inactive);
                            expect(yield* Effect.either(empty.get(extended, id(1)))).toMatchObject({
                                left: { reason: 'schema-mismatch' },
                            });
                            const reactivated = yield* bind(provider);
                            expect(yield* reactivated.get(extended, id(1))).toEqual(updated);
                            expect(
                                yield* Effect.either(migrateResources(dialect, tenant, [resource], policy))
                            ).toMatchObject({ left: { reason: 'unsafe-migration' } });
                            const edited = {
                                ...resource,
                                fields: { ...resource.fields, name: { type: 'boolean', optional: false } },
                            } as const;
                            expect(
                                yield* Effect.either(migrateResources(dialect, tenant, [edited], policy))
                            ).toMatchObject({ left: { reason: 'unsafe-migration' } });
                            const sql = yield* SqlClient.SqlClient;
                            expect(
                                yield* Effect.either(sql`UPDATE resource_revision SET payload = '{}'`)
                            ).toMatchObject({ _tag: 'Left' });
                            expect(yield* Effect.either(sql`DELETE FROM resource_schema`)).toMatchObject({
                                _tag: 'Left',
                            });
                            expect(yield* reactivated.history(extended, id(1))).toEqual(historical);
                        })
                    )
                ),
            20000
        );

        it.effect(
            'resource operations share EVE-42 durable transactions and rollback history/outbox together',
            () =>
                withDatabase(
                    dialect,
                    auth(
                        Effect.gen(function* () {
                            const resource = yield* base();
                            yield* migrateResources(dialect, tenant, [resource], policy);
                            const provider = yield* resourceProvider(dialect, tenant, identity, [resource]);
                            const api = yield* bind(provider);
                            const failed = yield* Effect.either(
                                api.transaction(
                                    Effect.gen(function* () {
                                        yield* api.create(resource, id(1), data);
                                        yield* provider.storage.enqueue('rolled-back', { value: 'hidden' });
                                        return yield* Effect.fail('rollback');
                                    })
                                )
                            );
                            expect(failed).toEqual(Either.left('rollback'));
                            expect(yield* api.get(resource, id(1))).toBeUndefined();
                            expect(yield* api.history(resource, id(1))).toEqual([]);
                            const sql = yield* SqlClient.SqlClient;
                            expect(yield* sql`SELECT id FROM command_outbox`).toEqual([]);
                            const execute = Effect.gen(function* () {
                                const integrity = yield* Integrity;
                                const receipt = {
                                    id: 'resource-commit',
                                    caller,
                                    action: 'resource.write',
                                    version: 1,
                                    inputHash: 'hash',
                                    outcome: 'succeeded',
                                    startedAt: 1,
                                    durationMs: 1,
                                } as const;
                                const request = {
                                    key: 'resource-commit',
                                    inputHash: 'hash',
                                    caller,
                                    action: 'resource.write',
                                    version: 1,
                                };
                                const work = auth(
                                    Effect.gen(function* () {
                                        yield* api.create(resource, id(1), data);
                                        return { output: { id: id(1) }, receipt };
                                    })
                                );
                                expect((yield* integrity.commit(request, work)).replayed).toBe(false);
                                expect((yield* integrity.commit(request, work)).replayed).toBe(true);
                            }).pipe(Effect.provide(durable), Effect.provideService(Storage, provider.storage));
                            yield* execute;
                            expect(yield* api.history(resource, id(1))).toHaveLength(1);
                            expect(yield* sql`SELECT id FROM action_receipt`).toHaveLength(1);
                        })
                    )
                ),
            20000
        );

        it.effect(
            'enforces live caller/tenant authorization, dedicated DB binding and TenantRouter composition',
            () =>
                withDatabase(
                    dialect,
                    Effect.gen(function* () {
                        const resource = yield* base();
                        yield* migrateResources(dialect, tenant, [resource], policy);
                        const provider = yield* resourceProvider(dialect, tenant, identity, [resource]);
                        let allowed = true;
                        const layer = resourceRuntime(provider, () =>
                            allowed ? Effect.void : Effect.fail(denied('revoked'))
                        );
                        const context = yield* Layer.build(layer);
                        const api = Context.get(context, Resources);
                        expect(yield* Effect.either(auth(absent(api.get(resource, id(1)))))).toMatchObject({
                            left: { reason: 'denied' },
                        });
                        yield* auth(api.create(resource, id(1), data));
                        expect(yield* auth(api.get(resource, id(1)))).toHaveProperty('value.name', data.name);
                        allowed = false;
                        expect(yield* Effect.either(auth(api.get(resource, id(1))))).toMatchObject({
                            left: { reason: 'denied' },
                        });
                        allowed = true;
                        expect(
                            yield* Effect.either(
                                api
                                    .get(resource, id(1))
                                    .pipe(
                                        Effect.provideService(Caller, { ...caller, tenant: otherTenant }),
                                        Effect.provideService(CurrentTenant, { id: tenant })
                                    )
                            )
                        ).toMatchObject({ left: { reason: 'denied' } });
                        expect(
                            yield* Effect.either(
                                api
                                    .get(resource, id(1))
                                    .pipe(
                                        Effect.provideService(Caller, caller),
                                        Effect.provideService(CurrentTenant, { id: otherTenant })
                                    )
                            )
                        ).toMatchObject({ left: { reason: 'denied' } });
                        const sql = yield* SqlClient.SqlClient;
                        expect(
                            yield* Effect.either(sql`UPDATE resource_tenant SET tenant = ${otherTenant}`)
                        ).toMatchObject({ _tag: 'Left' });
                        expect(
                            yield* Effect.either(migrateResources(dialect, otherTenant, [resource], policy))
                        ).toMatchObject({ left: { reason: 'denied' } });
                        expect(
                            yield* Effect.either(resourceProvider(dialect, otherTenant, identity, [resource]))
                        ).toMatchObject({ left: { reason: 'denied' } });
                        const routed = Effect.gen(function* () {
                            const routing = yield* TenantRouter;
                            return yield* routing.run(tenant, api.get(resource, id(1)));
                        }).pipe(
                            Effect.provide(
                                router(
                                    () => Effect.succeed(provider.storage),
                                    () => Effect.void
                                )
                            ),
                            Effect.provideService(Caller, caller)
                        );
                        expect(yield* routed).toHaveProperty('value.name', data.name);
                    })
                ),
            20000
        );

        it.effect(
            'rejects untyped invalid requests and reports backend loss without partial writes or silent empty data',
            () =>
                withDatabase(
                    dialect,
                    auth(
                        Effect.gen(function* () {
                            const resource = yield* base();
                            yield* migrateResources(dialect, tenant, [resource], policy);
                            const provider = yield* resourceProvider(dialect, tenant, identity, [resource]);
                            const api = yield* bind(provider);
                            expect(yield* Effect.either(api.query(resource, { limit: 0 }))).toMatchObject({
                                left: { reason: 'invalid-value' },
                            });
                            const dynamic: ResourceDefinition = resource;
                            expect(
                                yield* Effect.either(
                                    api.query(dynamic, { where: { field: 'notAField', equals: true }, limit: 1 })
                                )
                            ).toMatchObject({ left: { reason: 'invalid-value' } });
                            expect(yield* Effect.either(api.get(resource, 'bad-id'))).toMatchObject({
                                left: { reason: 'invalid-value' },
                            });
                            expect(
                                yield* Effect.either(
                                    Layer.build(
                                        resourceRuntime(
                                            { ...provider, definitions: [resource, resource] },
                                            () => Effect.void
                                        )
                                    )
                                )
                            ).toMatchObject({ left: { reason: 'invalid-definition' } });
                            const sql = yield* SqlClient.SqlClient;
                            yield* api.create(resource, id(88), data);
                            yield* sql`UPDATE resource_record SET revision = -1 WHERE id = ${id(88)}`;
                            expect(yield* Effect.either(api.get(resource, id(88)))).toMatchObject({
                                left: { reason: 'storage' },
                            });
                            yield* sql`UPDATE resource_record SET revision = 1 WHERE id = ${id(88)}`;
                            expect(yield* api.get(resource, id(88))).toHaveProperty('value.name', data.name);
                            yield* sql`DROP TABLE resource_revision`;
                            expect(yield* Effect.either(api.create(resource, id(1), data))).toMatchObject({
                                left: { reason: 'storage' },
                            });
                            expect(yield* api.get(resource, id(1))).toBeUndefined();
                            expect(yield* Effect.either(api.history(resource, id(1)))).toMatchObject({
                                left: { reason: 'storage' },
                            });
                            yield* sql`DROP TABLE resource_record`;
                            expect(yield* Effect.either(api.get(resource, id(1)))).toMatchObject({
                                left: { reason: 'storage' },
                            });
                            expect(yield* Effect.either(api.query(resource, { limit: 1 }))).toMatchObject({
                                left: { reason: 'storage' },
                            });
                        })
                    )
                ),
            20000
        );

        it.effect(
            'swaps named providers without feature changes and rejects cross-database transaction inheritance',
            () =>
                withDatabase(
                    dialect,
                    auth(
                        Effect.gen(function* () {
                            const resource = yield* base();
                            yield* migrateResources(dialect, tenant, [resource], policy);
                            const first = yield* resourceProvider(dialect, tenant, identity, [resource]);
                            const firstApi = yield* bind(first);
                            yield* firstApi.create(resource, id(1), { ...data, name: 'First tenant' });
                            yield* withDatabase(
                                dialect,
                                Effect.gen(function* () {
                                    yield* migrateResources(dialect, otherTenant, [resource], policy);
                                    const second = yield* resourceProvider(
                                        dialect,
                                        otherTenant,
                                        { key: { module: 'other.sql', instance: 'primary' }, version: '1.0.0' },
                                        [resource]
                                    );
                                    const secondApi = yield* bind(second);
                                    const asOther = <A, E, R>(effect: Effect.Effect<A, E, R | ResourceScope>) =>
                                        effect.pipe(
                                            Effect.provideService(Caller, { ...caller, tenant: otherTenant }),
                                            Effect.provideService(CurrentTenant, { id: otherTenant })
                                        );
                                    yield* asOther(
                                        secondApi.create(resource, id(1), { ...data, name: 'Second tenant' })
                                    );
                                    // Exactly the same feature program runs under both provider Layers, despite the ambient second client.
                                    const feature = Effect.gen(function* () {
                                        const api = yield* Resources;
                                        return (yield* api.get(resource, id(1)))?.value.name;
                                    });
                                    expect(
                                        yield* auth(
                                            feature.pipe(Effect.provide(resourceRuntime(first, () => Effect.void)))
                                        )
                                    ).toBe('First tenant');
                                    expect(
                                        yield* asOther(
                                            feature.pipe(Effect.provide(resourceRuntime(second, () => Effect.void)))
                                        )
                                    ).toBe('Second tenant');
                                    const inherited = yield* Effect.either(
                                        firstApi.transaction(asOther(secondApi.get(resource, id(1))))
                                    );
                                    expect(inherited).toMatchObject({ left: { reason: 'denied' } });
                                    const foreignReads = [
                                        secondApi.query(resource, { limit: 1 }).pipe(Effect.asVoid),
                                        secondApi.history(resource, id(1)).pipe(Effect.asVoid),
                                    ];
                                    for (const read of foreignReads)
                                        expect(yield* Effect.either(firstApi.transaction(asOther(read)))).toMatchObject(
                                            { left: { reason: 'denied' } }
                                        );
                                    const command = {
                                        id: id(1),
                                        expectedVersion: 1,
                                        expectedState: 'pending',
                                        idempotencyKey: 'foreign',
                                        clientMutationId: id(9),
                                        deadline: 1794700000123,
                                    };
                                    const foreignStorage = [
                                        second.storage.ready,
                                        second.storage.transaction(Effect.void),
                                        second.storage.commit(
                                            { key: 'foreign', inputHash: 'hash' },
                                            Effect.succeed({ output: null, receipt: null })
                                        ),
                                        second.storage.create({
                                            id: id(3),
                                            state: 'pending',
                                            version: 1,
                                            payload: null,
                                            leaseUntil: null,
                                        }),
                                        second.storage.get(id(3)),
                                        second.storage.compareAndSet(command, 'next', null, { pending: ['next'] }),
                                        second.storage.stock(id(3), 10),
                                        second.storage.available(id(3)),
                                        second.storage.reserve(id(4), id(3), 1, 1794700000123),
                                        second.storage.settle(id(4), 'released'),
                                        second.storage.expire,
                                        second.storage.reconcile('foreign', 'payment', 'USD', '100'),
                                        second.storage.enqueue('foreign', null),
                                        second.storage.audit('foreign', null),
                                    ].map((operation) => operation.pipe(Effect.asVoid));
                                    for (const operation of foreignStorage) {
                                        const rejected = yield* Effect.either(first.storage.transaction(operation));
                                        expect(rejected).toMatchObject({
                                            left: { _tag: 'StorageFailure', operation: 'resource-provider-boundary' },
                                        });
                                        if (Either.isLeft(rejected)) expect(rejected.left).not.toHaveProperty('cause');
                                    }
                                    expect(
                                        yield* Effect.either(
                                            firstApi.transaction(asOther(secondApi.create(resource, id(2), data)))
                                        )
                                    ).toMatchObject({ left: { reason: 'storage' } });
                                    const raw = yield* SqlClient.SqlClient;
                                    expect(
                                        yield* Effect.either(
                                            raw.withTransaction(asOther(secondApi.get(resource, id(1))))
                                        )
                                    ).toMatchObject({ left: { reason: 'denied' } });
                                    expect(
                                        yield* Effect.either(
                                            raw.withTransaction(
                                                migrateResources(dialect, otherTenant, [resource], policy)
                                            )
                                        )
                                    ).toMatchObject({ left: { reason: 'denied' } });
                                    expect(
                                        yield* Effect.either(
                                            raw.withTransaction(
                                                resourceProvider(dialect, otherTenant, identity, [resource])
                                            )
                                        )
                                    ).toMatchObject({ left: { reason: 'denied' } });
                                    expect(yield* asOther(secondApi.get(resource, id(1)))).toHaveProperty(
                                        'value.name',
                                        'Second tenant'
                                    );
                                    expect(yield* asOther(secondApi.get(resource, id(2)))).toBeUndefined();
                                    expect(yield* raw`SELECT id FROM command_outbox`).toEqual([]);
                                    expect(yield* raw`SELECT id FROM operational_record`).toEqual([]);
                                })
                            );
                        })
                    )
                ),
            20000
        );
    });
