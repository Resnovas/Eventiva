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
import {
    Cause,
    Config,
    ConfigProvider,
    Context,
    Deferred,
    Effect,
    Either,
    Exit,
    Fiber,
    FiberRef,
    Layer,
    Ref,
    Schema,
} from 'effect';
import { Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { HookDeclaration, HookEvent, HookOutboxFailure } from '@eventiva/contracts/hook';
import { TelemetryRecord, TelemetrySink, TelemetrySinkFailure } from '@eventiva/contracts/observability';
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
import { TelemetryControl, telemetryLayer } from '@eventiva/runtime/telemetry';
import { durable } from '@eventiva/runtime/storage';
import { Integrity } from '@eventiva/runtime/invocation';
import { KernelAuthority, KernelError } from '@eventiva/contracts/module-policy';
import type { KernelManifest } from '@eventiva/contracts/module-manifest';
import { Kernel, KernelEnvironment, KernelLive, KernelModule, kernelProvider } from '@eventiva/runtime/kernel-runtime';

/** Carry a callable resource service through schema-checked kernel capability composition. */
class ResourceCapability {
    readonly resources: typeof Resources.Service;
    /**
     * Preserve the supplied service instance so tenant authorization stays inside its public operations.
     *
     * @param resources - The resource service whose own operations enforce caller and tenant scope.
     */
    constructor(resources: typeof Resources.Service) {
        this.resources = resources;
    }
}
const ResourceCapabilitySchema = Schema.instanceOf(ResourceCapability);

/**
 * Produce stable UUIDv7-shaped references for records, tenants and callers.
 *
 * @param n - A small fixture number that becomes the UUID suffix.
 * @returns A UUIDv7-shaped string unique to that number.
 */
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
/**
 * Declare the initial contact schema with every supported portable scalar family.
 *
 * @returns An Effect that validates and yields the base contact definition.
 */
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
/**
 * Supply matching caller and current-tenant services without changing the resource provider's fixed binding.
 *
 * @template A - The program's success type.
 * @template E - The program's error type.
 * @template R - The program's remaining requirements.
 * @param effect - The resource program that needs caller and tenant scope.
 * @returns The same program with the fixture caller and tenant provided.
 */
const auth = <A, E, R>(effect: Effect.Effect<A, E, R | ResourceScope>) =>
    effect.pipe(Effect.provideService(Caller, caller), Effect.provideService(CurrentTenant, { id: tenant }));
/**
 * Construct a controlled policy denial with a sentinel-safe fixture detail.
 *
 * @param detail - A fixture-safe explanation carried by the failure.
 * @returns A denied ResourceFailure with that detail.
 */
const denied = (detail: string) => new ResourceFailure({ reason: 'denied', detail });
/**
 * Bind a named provider with permissive fixture policy; caller and tenant checks remain enforced by runtime.
 *
 * @param provider - The named SQL resource provider to bind.
 * @returns A scoped Effect yielding the bound resource service.
 */
const bind = (provider: ResourceProvider) =>
    Layer.build(
        resourceRuntime(
            provider,
            /**
             * Permit resource policy so built-in scope and schema checks remain independently testable.
             *
             * @returns An Effect that always permits the request.
             */
            () => Effect.void
        )
    ).pipe(
        Effect.map(
            /**
             * Extract the callable resource port from this provider's scoped layer.
             *
             * @param context - The context built from the resource runtime layer.
             * @returns The Resources service from that context.
             */
            (context) => Context.get(context, Resources)
        )
    );
// Remove live services inside the effect, retaining its requirements for type-safe outer provision.
/**
 * Deliberately erase execution context to prove early-return and missing-scope behavior without a type escape.
 *
 * @template A - The program's success type.
 * @template E - The program's error type.
 * @template R - The program's remaining requirements.
 * @param effect - The program whose ambient services are removed.
 * @returns The same program run with an empty context.
 */
const absent = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    effect.pipe(Effect.locally(FiberRef.currentContext, Context.empty()));

const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
/**
 * Configure a scoped PostgreSQL connection for a validated disposable fixture URL.
 *
 * @param url - A disposable PostgreSQL connection string.
 * @returns A layer providing a PostgreSQL SQL client for that URL.
 */
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
/**
 * Migrate fresh base storage and provide its SQL client for the lifetime of one isolated resource test.
 *
 * @template A - The program's success type.
 * @template E - The program's error type.
 * @template R - The program's remaining requirements.
 * @param dialect - The SQL backend to allocate and migrate.
 * @param effect - The test program that needs the migrated SQL client.
 * @returns A scoped Effect yielding the test program's result.
 */
const withDatabase = <A, E, R>(dialect: Dialect, effect: Effect.Effect<A, E, R | SqlClient.SqlClient>) =>
    Effect.scoped(
        Effect.gen(
            /** Refuse non-disposable PostgreSQL targets before allocating or later dropping a fixture database. */ function* () {
                // All deliberate corruption and DDL below is confined to a new database or scoped in-memory SQLite client.
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
                    yield* Effect.addFinalizer(
                        /**
                         * Drop only this fixture's database after its scoped clients close.
                         *
                         * @returns An Effect that drops the fixture database and dies on failure.
                         */
                        () => admin`DROP DATABASE ${admin(database)}`.pipe(Effect.orDie)
                    );
                    target.pathname = '/' + database;
                    connection = yield* Layer.build(pg(target.toString()));
                } else connection = yield* Layer.build(memory());
                const sql = Context.get(connection, SqlClient.SqlClient);
                const migrations = yield* load(
                    fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url))
                );
                yield* migrate(dialect, migrations).pipe(Effect.provideService(SqlClient.SqlClient, sql));
                return yield* effect.pipe(Effect.provideService(SqlClient.SqlClient, sql));
            }
        )
    );

describe('resource runtime catalogue isolation', /** Register public adapter-isolation regressions without changing the driver contract. */ () => {
    // Each adapter gets its own database so the untouched control cannot conceal catalogue corruption.
    for (const mutation of ['control', 'query', 'write'] as const) {
        it.effect(
            `preserves admitted declarations after ${mutation} driver access`,
            /**
             * Compare legitimate writes with an undeclared widening after the selected driver callback runs.
             *
             * @returns The Effect that runs these assertions.
             */
            () =>
                withDatabase(
                    'sqlite',
                    auth(
                        Effect.gen(
                            /** Let an adapter alter its declaration argument, then inspect public outcomes and actual persistence. */ function* () {
                                const resource = yield* declareResource({
                                    id: 'probe.record',
                                    owner: 'app.probe',
                                    moduleVersion: '1.0.0',
                                    fields: { title: { type: 'text', optional: false } },
                                });
                                const widened = yield* validateDefinition({
                                    ...resource,
                                    fields: {
                                        title: { type: 'text', optional: true },
                                        secret: { type: 'text', optional: true },
                                    },
                                    owners: {
                                        ...resource.owners,
                                        secret: { module: 'app.probe', version: '1.0.0' },
                                    },
                                });
                                yield* migrateResources('sqlite', tenant, [resource], policy);
                                const provider = yield* resourceProvider('sqlite', tenant, identity, [resource]);
                                /**
                                 * Simulate an in-process adapter rewriting nested fields and ownership without a type escape.
                                 *
                                 * @param definition - The declaration object handed to the adapter, mutated in place.
                                 */
                                const widen = (definition: ResourceDefinition) => {
                                    // A matching owner keeps this a valid but unadmitted declaration, not malformed input.
                                    Object.defineProperty(definition.fields['title'], 'optional', { value: true });
                                    Object.defineProperty(definition.fields, 'secret', {
                                        value: { type: 'text', optional: true },
                                        enumerable: true,
                                        configurable: true,
                                    });
                                    Object.defineProperty(definition.owners, 'secret', {
                                        value: { module: 'app.probe', version: '1.0.0' },
                                        enumerable: true,
                                        configurable: true,
                                    });
                                };
                                const api = yield* bind({
                                    ...provider,
                                    driver: {
                                        ...provider.driver,
                                        /**
                                         * Mutate only the adapter argument; use the known physical declaration for SQL access.
                                         *
                                         * @param definition - The declaration the runtime passes to the adapter.
                                         * @param query - The portable query to run against the real table.
                                         * @returns The real driver's query results after the optional mutation.
                                         */
                                        query: (definition, query) =>
                                            Effect.sync(
                                                /** Model a query adapter retaining and modifying the supplied schema. */ () => {
                                                    // Restrict corruption to this port so the unchanged write path remains a control.
                                                    if (mutation === 'query') widen(definition);
                                                }
                                            ).pipe(Effect.andThen(provider.driver.query(resource, query))),
                                        /**
                                         * Persist through the real transaction while testing runtime admission independently of SQL schema checks.
                                         *
                                         * @param definition - The declaration the runtime passes to the adapter.
                                         * @param recordId - The record being written.
                                         * @param revision - The revision the write produces.
                                         * @param value - The decoded payload to persist.
                                         * @returns The real driver's stored record after the optional mutation.
                                         */
                                        write: (definition, recordId, revision, value) =>
                                            Effect.sync(
                                                /** Model a write adapter rewriting the supplied definition before returning. */ () => {
                                                    // The real driver below still uses the original physical declaration, isolating runtime admission.
                                                    if (mutation === 'write') widen(definition);
                                                }
                                            ).pipe(
                                                Effect.andThen(
                                                    provider.driver.write(resource, recordId, revision, value)
                                                )
                                            ),
                                    },
                                });
                                // Prime query and write independently before attempting either declaration again.
                                if (mutation === 'write') yield* api.create(resource, id(1), { title: 'seed' });
                                else yield* api.query(resource, { limit: 10 });
                                const legitimate = yield* Effect.either(api.create(resource, id(2), { title: 'kept' }));
                                const updated = yield* Effect.either(
                                    api.update(resource, id(2), 1, { title: 'updated' })
                                );
                                const smuggled = yield* Effect.either(
                                    api.create(widened, id(3), { secret: 'smuggled' })
                                );
                                const stored = yield* provider.driver.get(resource.id, id(3));
                                const history = yield* provider.driver.history(resource.id, id(3));
                                expect.soft(legitimate).toMatchObject({
                                    _tag: 'Right',
                                    right: { revision: 1, value: { title: 'kept' } },
                                });
                                expect.soft(updated).toMatchObject({
                                    _tag: 'Right',
                                    right: { revision: 2, value: { title: 'updated' } },
                                });
                                expect.soft(smuggled).toMatchObject({ left: { reason: 'schema-mismatch' } });
                                expect.soft(stored).toBeUndefined();
                                expect.soft(history).toEqual([]);
                            }
                        )
                    )
                )
        );
    }
    it.effect(
        'decodes current driver values but preserves historical payloads',
        /**
         * Keep output validation and transaction rollback distinct from undecoded historical revisions.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            withDatabase(
                'sqlite',
                auth(
                    Effect.gen(
                        /** Return a historical-only shape from current operations and verify rejection without rewriting history. */ function* () {
                            const resource = yield* base();
                            yield* migrateResources('sqlite', tenant, [resource], policy);
                            const provider = yield* resourceProvider('sqlite', tenant, identity, [resource]);
                            const historical = {
                                id: id(1),
                                revision: 1,
                                schemaVersion: 1,
                                value: { legacy: 'retained' },
                            };
                            const api = yield* bind({
                                ...provider,
                                driver: {
                                    ...provider.driver,
                                    /**
                                     * Expose a shape invalid under the active declaration at the current-read boundary.
                                     *
                                     * @returns An Effect yielding a record that does not match the active schema.
                                     */
                                    get: () => Effect.succeed(historical),
                                    /**
                                     * Query results must pass the same active-schema decoder as individual reads.
                                     *
                                     * @returns An Effect yielding a list containing that mismatched record.
                                     */
                                    query: () => Effect.succeed([historical]),
                                    /**
                                     * Make a real tentative write before returning an invalid current value.
                                     *
                                     * @param definition - The declaration the runtime passes to the adapter.
                                     * @param recordId - The record being written.
                                     * @param revision - The revision the write produces.
                                     * @param value - The decoded payload to persist.
                                     * @returns An Effect that writes for real and then yields the mismatched record.
                                     */
                                    write: (definition, recordId, revision, value) =>
                                        provider.driver
                                            .write(definition, recordId, revision, value)
                                            .pipe(Effect.as(historical)),
                                    /**
                                     * Retained history deliberately need not conform to today's required fields.
                                     *
                                     * @returns An Effect yielding the retained historical revision.
                                     */
                                    history: () => Effect.succeed([historical]),
                                },
                            });
                            // Current-value validation must fail the transaction, not silently retain the tentative write.
                            expect(yield* Effect.either(api.get(resource, id(1)))).toMatchObject({
                                left: { reason: 'invalid-value' },
                            });
                            expect(yield* Effect.either(api.query(resource, { limit: 10 }))).toMatchObject({
                                left: { reason: 'invalid-value' },
                            });
                            expect(yield* Effect.either(api.create(resource, id(1), data))).toMatchObject({
                                left: { reason: 'invalid-value' },
                            });
                            expect(yield* provider.driver.get(resource.id, id(1))).toBeUndefined();
                            expect(yield* provider.driver.history(resource.id, id(1))).toEqual([]);
                            expect(yield* api.history(resource, id(1))).toEqual([historical]);
                        }
                    )
                )
            )
    );
});

describe('portable resource declarations', /** Register database-free declaration, codec and migration-planning contracts. */ () => {
    it.effect(
        'strict schemas reject unpinned versions, unknown keys, invalid owners and lossy values',
        /**
         * Verify resource boundaries reject unknown metadata and coercion-prone scalar values without disclosure.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Probe malformed declarations and values, then inspect all supported error renderings. */ function* () {
                    // Exact decimal text and safe integer epochs must not be normalized through lossy numeric coercion.
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
                        yield* Effect.either(
                            Schema.decodeUnknown(ResourceDefinition)({ ...resource, version: 2147483648 })
                        )
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
                }
            )
    );
    it.effect(
        'separate module contributions preserve typing and reject collisions or required additions',
        /**
         * Verify independently owned optional fields compose without replacing existing contracts.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Compose successive owners while rejecting collisions and non-additive required fields. */ function* () {
                    // A contributed field must preserve compatibility for records written before that owner was installed.
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
                            contributeFields(resource, {
                                ...extra,
                                fields: { required: { type: 'text', optional: false } },
                            })
                        )
                    ).toMatchObject({ left: { reason: 'unsafe-migration' } });
                    expect(yield* Effect.either(contributeFields(resource, { ...extra, fields: {} }))).toMatchObject({
                        left: { reason: 'unsafe-migration' },
                    });
                }
            )
    );
    it.effect(
        'typed codecs detach declarations and reject malformed full and partial records without coercion',
        /**
         * Verify declarations detach caller-owned field objects and codecs distinguish full records from patches.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Mutate original field descriptors after declaration before testing exact codec behavior. */ function* () {
                    // Caller mutation must not retroactively change the schema or contribution optionality.
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
                    for (const invalid of [
                        {},
                        { label: 3 },
                        { label: 'x', extra: true },
                        { label: null },
                        { label: ['x'] },
                    ])
                        expect(yield* Effect.either(decodeResource(extended, invalid))).toMatchObject({
                            left: { reason: 'invalid-value' },
                        });
                    for (const invalid of [
                        { note: undefined },
                        { note: 5 },
                        { extra: 'hidden' },
                        { note: { nested: true } },
                    ])
                        expect(yield* Effect.either(decodeResource(extended, invalid, true))).toMatchObject({
                            left: { reason: 'invalid-value' },
                        });
                }
            )
    );
    it.effect(
        'restart, retained generation and unsafe plans return before requiring any SQL service',
        /**
         * Verify unsafe or restart-only plans stop before acquiring a database capability.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Compare contiguous additive plans with staged, retained-generation and unsafe changes. */ function* () {
                    const resource = yield* base();
                    const extended = yield* contributeFields(resource, extra);
                    const plan = yield* planResourceMigrations([resource, extended], policy);
                    expect(plan).toMatchObject({
                        status: 'ready',
                        migrations: [
                            { from: 0, to: 1 },
                            {
                                from: 1,
                                to: 2,
                                dependencies: ['crm.contact.v1'],
                                compatibleFrom: 1,
                                compatibleThrough: 2,
                            },
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
                }
            )
    );
});

for (const dialect of ['postgres', 'sqlite'] as const)
    describe(`${dialect} central resource conformance`, /** Register resource persistence, migration and trusted-transaction contracts for each dialect. */ () => {
        it.effect(
            'shares one trusted resource and hook owner for atomic commit, rollback and replay',
            /**
             * Verify resources and hook facts commit together only under their shared private transaction owner.
             *
             * @returns The Effect that runs these assertions.
             */
            () =>
                withDatabase(
                    dialect,
                    auth(
                        Effect.gen(
                            /** Compare rollback, exact replay and foreign-root rejection on the resource/hook composition. */ function* () {
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
                                const write = Effect.gen(
                                    /** Couple a contact revision and its observed hook fact under one storage commit. */ function* () {
                                        // Neither the resource record nor the feed may survive if any participant fails before commit.
                                        const record = yield* api.create(resource, observation.resourceId, data);
                                        yield* provider.outbox.stage(observation, [observer]);
                                        return { output: record.value, receipt: { committed: true } };
                                    }
                                );
                                const aborted = yield* provider.storage
                                    .commit(
                                        { key: 'aborted', inputHash: 'one' },
                                        write.pipe(
                                            Effect.zipRight(Effect.fail(new HookOutboxFailure({ reason: 'conflict' })))
                                        )
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
                                    yield* sql
                                        .withTransaction(provider.storage.transaction(Effect.void))
                                        .pipe(Effect.flip)
                                ).toMatchObject({ operation: 'resource-provider-boundary' });
                                expect(
                                    yield* resourceHookProvider(dialect, otherTenant, identity, [resource]).pipe(
                                        Effect.flip
                                    )
                                ).toMatchObject({ reason: 'denied' });
                            }
                        )
                    )
                )
        );

        it.effect(
            'composes callable SQL resources through the kernel without losing tenant checks',
            /**
             * Verify kernel capability composition preserves callable resource services and tenant enforcement.
             *
             * @returns The Effect that runs these assertions.
             */
            () =>
                withDatabase(
                    dialect,
                    auth(
                        Effect.gen(
                            /** Bind a provider capability into a dependent module and run its real ready-time read. */ function* () {
                                // A schema-checked capability carries behavior, not authorization to substitute a foreign tenant caller.
                                const resource = yield* base();
                                yield* migrateResources(dialect, tenant, [resource], policy);
                                const provider = yield* resourceProvider(dialect, tenant, identity, [resource]);
                                const api = yield* bind(provider);
                                yield* api.create(resource, id(71), data);
                                const handle = yield* kernelProvider(
                                    ResourceCapabilitySchema,
                                    new ResourceCapability(api)
                                );
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
                                        modules: [storageManifest, consumerManifest].map(
                                            /**
                                             * Pin each composition entry to the exact supplied module version.
                                             *
                                             * @param manifest - One module manifest being composed.
                                             * @returns The manifest's ID and pinned version.
                                             */
                                            (manifest) => ({
                                                id: manifest.id,
                                                version: manifest.version,
                                            })
                                        ),
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
                                                Effect.gen(
                                                    /** Resolve the consumer's declared resource requirement from its kernel environment. */ function* () {
                                                        // Resolve the capability during acquisition, but defer the authorized read to module readiness.
                                                        const environment = yield* KernelEnvironment;
                                                        const capability = yield* environment.resolve(
                                                            'records',
                                                            ResourceCapabilitySchema
                                                        );
                                                        return KernelModule.of({
                                                            ...lifecycle,
                                                            providers: new Map(),
                                                            ready: auth(
                                                                capability.resources.get(resource, id(71))
                                                            ).pipe(
                                                                Effect.tap(
                                                                    /**
                                                                     * Verify a resolved capability preserves the exact decimal payload.
                                                                     *
                                                                     * @param row - The record read at module readiness, if present.
                                                                     * @returns An Effect that checks the decimal amount.
                                                                     */
                                                                    (row) =>
                                                                        Effect.sync(
                                                                            /**
                                                                             * Observe the ready-time read without mutating its returned record.
                                                                             *
                                                                             * @returns Nothing useful; the assertion is the point.
                                                                             */
                                                                            () =>
                                                                                expect(row?.value.amount).toBe(
                                                                                    data.amount
                                                                                )
                                                                        )
                                                                ),
                                                                Effect.asVoid,
                                                                Effect.mapError(
                                                                    /**
                                                                     * Translate resource failure into the consumer module's declared lifecycle error channel.
                                                                     *
                                                                     * @returns The consumer module's lifecycle failure.
                                                                     */
                                                                    () =>
                                                                        new KernelError({
                                                                            module: 'app.crm',
                                                                            reason: 'module-failed',
                                                                        })
                                                                )
                                                            ),
                                                        });
                                                    }
                                                )
                                            ),
                                        },
                                    ]
                                );
                                expect(receipt.emitted).toBe(true);
                                expect(
                                    (yield* kernel.snapshot).map(
                                        /**
                                         * Compare readiness of provider and dependent consumer independent of other snapshot fields.
                                         *
                                         * @param module - One module entry in the kernel snapshot.
                                         * @returns The module's lifecycle state.
                                         */
                                        (module) => module.state
                                    )
                                ).toEqual(['ready', 'ready']);
                                expect(
                                    yield* Effect.either(
                                        api
                                            .get(resource, id(71))
                                            .pipe(Effect.provideService(Caller, { ...caller, tenant: otherTenant }))
                                    )
                                ).toMatchObject({ left: { reason: 'denied' } });
                            }
                        ).pipe(
                            Effect.provide(
                                KernelLive('integration').pipe(
                                    Layer.provide(
                                        Layer.succeed(KernelAuthority, {
                                            /**
                                             * Permit fixture manifests so resource capability wiring is the tested admission path.
                                             *
                                             * @returns An Effect that always permits the request.
                                             */
                                            admit: () => Effect.void,
                                            /**
                                             * Permit lifecycle operations without bypassing the resource service's own tenant checks.
                                             *
                                             * @returns An Effect that always permits the request.
                                             */
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
            /**
             * Verify portable resource CRUD, parameterized equality and revision arbitration on the real backend.
             *
             * @returns The Effect that runs these assertions.
             */
            () =>
                withDatabase(
                    dialect,
                    auth(
                        Effect.gen(
                            /** Compare scalar queries and ordered pages before racing same-revision updates. */ function* () {
                                // Metacharacters are values, not SQL; exact decimal text must survive both filtering and patch merge.
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
                                    expect(
                                        rows.map(
                                            /**
                                             * Preserve backend result ordering while comparing only record identity.
                                             *
                                             * @param row - One matching record.
                                             * @returns The record's ID.
                                             */
                                            (row) => row.id
                                        )
                                    ).toEqual(
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
                                    })).map(
                                        /**
                                         * Compare the single false-valued match without exposing unrelated payload fields.
                                         *
                                         * @param row - The record with a false active flag.
                                         * @returns The record's ID.
                                         */
                                        (row) => row.id
                                    )
                                ).toEqual([id(1)]);
                                expect(
                                    (yield* api.query(resource, { after: id(1), limit: 1 })).map(
                                        /**
                                         * Preserve cursor order when identifying the next record.
                                         *
                                         * @param row - The record after the cursor.
                                         * @returns The record's ID.
                                         */
                                        (row) => row.id
                                    )
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
                                expect(
                                    yield* Effect.either(api.update(resource, id(99), 1, { seats: 4 }))
                                ).toMatchObject({
                                    left: { reason: 'conflict' },
                                });
                            }
                        )
                    )
                ),
            20000
        );

        it.effect(
            'additive migration preserves old payload/history, fences stale writers, and deactivation never drops data',
            /**
             * Verify forward-only schema activation preserves old records and fences stale provider instances.
             *
             * @returns The Effect that runs these assertions.
             */
            () =>
                withDatabase(
                    dialect,
                    auth(
                        Effect.gen(
                            /** Migrate a populated schema, reopen under the active definition and test immutable evidence. */ function* () {
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
                            }
                        )
                    )
                ),
            20000
        );

        it.effect(
            'rolls back a failed multi-version migration and retries each pending version exactly once',
            /**
             * Verify a failed later schema step rolls back the entire migration batch without invalidating old writers.
             *
             * @returns The Effect that runs these assertions.
             */
            () =>
                withDatabase(
                    dialect,
                    auth(
                        Effect.gen(
                            /** Fail version three after version two is staged, then retry the exact pending history. */ function* () {
                                const resource = yield* base();
                                const extended = yield* contributeFields(resource, extra);
                                const latest = yield* contributeFields(extended, {
                                    owner: 'app.support',
                                    moduleVersion: '1.0.0',
                                    fields: { note: { type: 'text', optional: true } },
                                });
                                yield* migrateResources(dialect, tenant, [resource], policy);
                                const oldApi = yield* bind(
                                    yield* resourceProvider(dialect, tenant, identity, [resource])
                                );
                                const original = yield* oldApi.create(resource, id(1), data);
                                const originalHistory = yield* oldApi.history(resource, id(1));
                                expect(originalHistory).toEqual([original]);
                                const sql = yield* SqlClient.SqlClient;
                                const schemaRows = sql<{
                                    resource: string;
                                    version: number;
                                    definition: string;
                                    checksum: string;
                                }>`SELECT resource, version, definition, checksum FROM resource_schema ORDER BY resource, version`;
                                const before = yield* schemaRows;
                                expect(before).toHaveLength(1);

                                // Fail only when v3 observes v2 already written in this migration attempt.
                                // The database is disposable; no production failpoint or immutability bypass is needed.
                                if (dialect === 'postgres') {
                                    yield* sql.unsafe(
                                        `CREATE FUNCTION fixture_reject_resource_v3() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.resource = 'crm.contact' AND NEW.version = 3 AND EXISTS (SELECT 1 FROM resource_schema WHERE resource = NEW.resource AND version = 2) THEN RAISE EXCEPTION 'fixture rejects v3 after v2'; END IF; RETURN NEW; END $$`
                                    );
                                    yield* sql.unsafe(
                                        `CREATE TRIGGER fixture_reject_resource_v3 BEFORE INSERT ON resource_schema FOR EACH ROW EXECUTE FUNCTION fixture_reject_resource_v3()`
                                    );
                                } else
                                    yield* sql.unsafe(
                                        `CREATE TRIGGER fixture_reject_resource_v3 BEFORE INSERT ON resource_schema WHEN NEW.resource = 'crm.contact' AND NEW.version = 3 AND EXISTS (SELECT 1 FROM resource_schema WHERE resource = NEW.resource AND version = 2) BEGIN SELECT RAISE(ABORT, 'fixture rejects v3 after v2'); END`
                                    );

                                const failed = yield* Effect.either(
                                    migrateResources(dialect, tenant, [resource, extended, latest], policy)
                                );
                                expect(failed).toMatchObject({
                                    _tag: 'Left',
                                    left: { _tag: 'ResourceFailure', reason: 'storage' },
                                });
                                if (Either.isLeft(failed)) expect(failed.left).toBeInstanceOf(ResourceFailure);
                                expect(yield* schemaRows).toEqual(before);
                                expect(yield* oldApi.get(resource, id(1))).toEqual(original);
                                expect(yield* oldApi.history(resource, id(1))).toEqual(originalHistory);
                                const usable = yield* oldApi.update(resource, id(1), 1, {
                                    name: 'usable after rollback',
                                });
                                const retainedHistory = [original, usable];
                                expect(yield* oldApi.history(resource, id(1))).toEqual(retainedHistory);

                                if (dialect === 'postgres') {
                                    yield* sql.unsafe(`DROP TRIGGER fixture_reject_resource_v3 ON resource_schema`);
                                    yield* sql.unsafe(`DROP FUNCTION fixture_reject_resource_v3()`);
                                } else yield* sql.unsafe(`DROP TRIGGER fixture_reject_resource_v3`);

                                const expectedChecksums = [resource, extended, latest].map(
                                    /**
                                     * Derive expected retained checksums from canonical definitions rather than migration results.
                                     *
                                     * @param definition - One resource definition version.
                                     * @returns The expected retained schema row for that version.
                                     */
                                    (definition) => ({
                                        resource: definition.id,
                                        version: definition.version,
                                        checksum: createHash('sha256')
                                            .update(canonicalDefinition(definition))
                                            .digest('hex'),
                                    })
                                );
                                const retried = yield* migrateResources(
                                    dialect,
                                    tenant,
                                    [resource, extended, latest],
                                    policy
                                );
                                expect(retried).toMatchObject({
                                    status: 'applied',
                                    migrations: expectedChecksums.slice(1).map(
                                        /**
                                         * Expect only pending adjacent-version steps; the original version must not be reapplied.
                                         *
                                         * @param expected - One expected schema row carrying its version and checksum.
                                         * @returns The migration step that should lead to that version.
                                         */
                                        (expected) => ({
                                            from: expected.version - 1,
                                            to: expected.version,
                                            checksum: expected.checksum,
                                        })
                                    ),
                                });
                                const after = yield* schemaRows;
                                expect(after.slice(0, 1)).toEqual(before);
                                expect(
                                    after.map(
                                        /**
                                         * Compare retained identity, version and checksum independently of serialized definition layout.
                                         *
                                         * @param row - One stored schema row read back after the retry.
                                         * @returns Only the identity, version and checksum fields of that row.
                                         */
                                        (row) => ({
                                            resource: row.resource,
                                            version: row.version,
                                            checksum: row.checksum,
                                        })
                                    )
                                ).toEqual(expectedChecksums);
                                expect(
                                    yield* migrateResources(dialect, tenant, [resource, extended, latest], policy)
                                ).toEqual({
                                    status: 'applied',
                                    migrations: [],
                                });
                                expect(yield* schemaRows).toEqual(after);
                                const currentApi = yield* bind(
                                    yield* resourceProvider(dialect, tenant, identity, [latest])
                                );
                                expect(yield* currentApi.get(latest, id(1))).toEqual(usable);
                                expect(yield* currentApi.history(latest, id(1))).toEqual(retainedHistory);
                                expect(
                                    yield* Effect.either(oldApi.update(resource, id(1), 2, { name: 'stale' }))
                                ).toMatchObject({ left: { reason: 'schema-mismatch' } });
                                const updated = yield* currentApi.update(latest, id(1), 2, {
                                    campaign: 'retained',
                                    note: 'new field',
                                });
                                expect(updated).toEqual({
                                    id: id(1),
                                    revision: 3,
                                    schemaVersion: 3,
                                    value: { ...usable.value, campaign: 'retained', note: 'new field' },
                                });
                                expect(yield* currentApi.history(latest, id(1))).toEqual([...retainedHistory, updated]);
                            }
                        )
                    )
                ),
            20000
        );

        it.effect(
            'real resource spans preserve correlation, redaction, failures and transaction atomicity',
            /**
             * Verify real resource spans describe outcomes without leaking values or changing transaction durability.
             *
             * @returns The Effect that runs these assertions.
             */
            () =>
                withDatabase(
                    dialect,
                    auth(
                        Effect.gen(
                            /** Observe success, denial, rollback, cancellation and exporter loss through the real resource API. */ function* () {
                                const resource = yield* base();
                                yield* migrateResources(dialect, tenant, [resource], policy);
                                const provider = yield* resourceProvider(dialect, tenant, identity, [resource]);
                                const api = yield* bind(provider);
                                const rejected = yield* Layer.build(
                                    resourceRuntime(
                                        provider,
                                        /**
                                         * Inject a private denial detail that must never appear in telemetry.
                                         *
                                         * @returns An Effect that fails with a private denial detail.
                                         */
                                        () => Effect.fail(denied('DENIAL_CANARY'))
                                    )
                                );
                                const deniedApi = Context.get(rejected, Resources);
                                const records = yield* Ref.make<ReadonlyArray<TelemetryRecord>>([]);
                                const messages = {
                                    'resource.fixture': 'Resource consumer.',
                                    'resource.get': 'Read resource.',
                                    'resource.query': 'Query resources.',
                                    'resource.create': 'Create resource.',
                                    'resource.update': 'Update resource.',
                                    'resource.history': 'Read resource history.',
                                    'resource.transaction': 'Resource transaction.',
                                };
                                const telemetry = telemetryLayer({ messages, attributes: {} }).pipe(
                                    Layer.provide(
                                        Layer.succeed(TelemetrySink, {
                                            /**
                                             * Retain emitted records in order for trace and redaction inspection.
                                             *
                                             * @param entry - One emitted telemetry record.
                                             * @returns An Effect that appends the record to the capture list.
                                             */
                                            write: (entry) =>
                                                Ref.update(
                                                    records,
                                                    /**
                                                     * Append without altering previously captured telemetry evidence.
                                                     *
                                                     * @param all - The records captured so far.
                                                     * @returns A new list with the record appended.
                                                     */
                                                    (all) => [...all, entry]
                                                ),
                                            flush: Effect.void,
                                        })
                                    )
                                );
                                yield* Effect.gen(
                                    /** Place all exercised resource outcomes under a single parent trace. */ function* () {
                                        // Failed and interrupted transactions must emit failure outcomes without retaining their tentative writes.
                                        yield* api.transaction(
                                            Effect.gen(
                                                /** Exercise every resource operation inside the committed transaction span. */ function* () {
                                                    // Reads inside the transaction must observe its own create/update and matching revision history.
                                                    yield* api.create(resource, id(1), {
                                                        ...data,
                                                        name: 'VALUE_CANARY',
                                                    });
                                                    yield* api.update(resource, id(1), 1, { seats: 9 });
                                                    expect((yield* api.get(resource, id(1)))?.value.seats).toBe(9);
                                                    expect(yield* api.query(resource, { limit: 10 })).toHaveLength(1);
                                                    expect(yield* api.history(resource, id(1))).toHaveLength(2);
                                                }
                                            )
                                        );
                                        expect(yield* Effect.either(deniedApi.get(resource, id(1)))).toMatchObject({
                                            _tag: 'Left',
                                            left: { reason: 'denied' },
                                        });
                                        expect(
                                            yield* Effect.either(api.get(resource, 'INVALID_ID_CANARY'))
                                        ).toMatchObject({
                                            _tag: 'Left',
                                        });
                                        expect(
                                            yield* Effect.either(api.update(resource, id(1), 1, { seats: 5 }))
                                        ).toMatchObject({
                                            _tag: 'Left',
                                            left: { reason: 'conflict' },
                                        });
                                        expect(
                                            yield* Effect.either(
                                                api.transaction(
                                                    Effect.gen(
                                                        /** Stage a record and private outbox intent before deliberately failing the transaction. */ function* () {
                                                            // Domain state, history and outbox must roll back together despite spans already being recorded.
                                                            yield* api.create(resource, id(2), data);
                                                            yield* provider.storage.enqueue('ROLLBACK_CANARY', {
                                                                secret: 'OUTBOX_CANARY',
                                                            });
                                                            return yield* Effect.fail('ROLLBACK_CANARY');
                                                        }
                                                    )
                                                )
                                            )
                                        ).toEqual(Either.left('ROLLBACK_CANARY'));
                                        const started = yield* Deferred.make<void>();
                                        const pending = yield* Effect.fork(
                                            api.transaction(
                                                Effect.gen(
                                                    /** Hold a tentative record until the parent interrupts this transaction. */ function* () {
                                                        // Publish the barrier only after insertion so cancellation proves rollback of real work.
                                                        yield* api.create(resource, id(3), data);
                                                        yield* Deferred.succeed(started, undefined);
                                                        return yield* Effect.never;
                                                    }
                                                )
                                            )
                                        );
                                        yield* Deferred.await(started);
                                        expect(Exit.isInterrupted(yield* Fiber.interrupt(pending))).toBe(true);
                                    }
                                ).pipe(
                                    Effect.withSpan('resource.fixture', { captureStackTrace: false }),
                                    Effect.provide(telemetry)
                                );

                                const spans = (yield* Ref.get(records)).filter(
                                    /**
                                     * Exclude non-span signals from trace-parent assertions.
                                     *
                                     * @param entry - One captured telemetry record.
                                     * @returns Whether the record is a span.
                                     */
                                    (entry) => entry.signal === 'span'
                                );
                                const root = spans.find(
                                    /**
                                     * Locate the consumer root independently of asynchronous export order.
                                     *
                                     * @param entry - One captured span.
                                     * @returns Whether the span is the consumer root.
                                     */
                                    (entry) => entry.code === 'resource.fixture'
                                );
                                expect(root).toBeDefined();
                                expect(
                                    new Set(
                                        spans.map(
                                            /**
                                             * Compare trace correlation across successful and failed resource operations.
                                             *
                                             * @param entry - One captured span.
                                             * @returns The span's trace ID.
                                             */
                                            (entry) => entry.traceId
                                        )
                                    ).size
                                ).toBe(1);
                                const transactions = spans.filter(
                                    /**
                                     * Isolate transaction boundaries from their individual resource operations.
                                     *
                                     * @param entry - One captured span.
                                     * @returns Whether the span is a resource transaction.
                                     */
                                    (entry) => entry.code === 'resource.transaction'
                                );
                                expect(
                                    transactions
                                        .map(
                                            /**
                                             * Compare terminal transaction outcomes without relying on export ordering.
                                             *
                                             * @param entry - One transaction span.
                                             * @returns The span's outcome.
                                             */
                                            (entry) => entry.outcome
                                        )
                                        .sort()
                                ).toEqual(['failed', 'failed', 'succeeded']);
                                const committed = transactions.find(
                                    /**
                                     * Identify the sole committed transaction for descendant correlation checks.
                                     *
                                     * @param entry - One transaction span.
                                     * @returns Whether the transaction succeeded.
                                     */
                                    (entry) => entry.outcome === 'succeeded'
                                );
                                expect(committed?.parentSpanId).toBe(root?.spanId);
                                expect(
                                    spans
                                        .filter(
                                            /**
                                             * Include only resource operations descended from the successful transaction, even through intermediate spans.
                                             *
                                             * @param entry - One captured span.
                                             * @returns Whether the span is a resource operation under the committed transaction.
                                             */
                                            (entry) => {
                                                // Walk parent links instead of assuming operation spans are direct transaction children.
                                                if (
                                                    !entry.code.startsWith('resource.') ||
                                                    entry.code === 'resource.transaction'
                                                )
                                                    return false;
                                                let parent = spans.find(
                                                    /**
                                                     * Resolve this operation's immediate exported parent by span identity.
                                                     *
                                                     * @param candidate - One captured span.
                                                     * @returns Whether the candidate is the operation's parent.
                                                     */
                                                    (candidate) => candidate.spanId === entry.parentSpanId
                                                );
                                                while (parent) {
                                                    if (parent.spanId === committed?.spanId) return true;
                                                    parent = spans.find(
                                                        /**
                                                         * Advance one ancestor while preserving the original committed-transaction target.
                                                         *
                                                         * @param candidate - One captured span.
                                                         * @returns Whether the candidate is the current ancestor's parent.
                                                         */
                                                        (candidate) => candidate.spanId === parent?.parentSpanId
                                                    );
                                                }
                                                return false;
                                            }
                                        )
                                        .map(
                                            /**
                                             * Compare the operation vocabulary under the successful transaction.
                                             *
                                             * @param entry - One operation span under the committed transaction.
                                             * @returns The span's operation code.
                                             */
                                            (entry) => entry.code
                                        )
                                        .sort()
                                ).toEqual([
                                    'resource.create',
                                    'resource.get',
                                    'resource.history',
                                    'resource.query',
                                    'resource.update',
                                ]);
                                expect(
                                    spans
                                        .filter(
                                            /**
                                             * Select reads including policy and validation failures.
                                             *
                                             * @param entry - One captured span.
                                             * @returns Whether the span is a resource read.
                                             */
                                            (entry) => entry.code === 'resource.get'
                                        )
                                        .map(
                                            /**
                                             * Compare read outcomes independently of capture order.
                                             *
                                             * @param entry - One read span.
                                             * @returns The span's outcome.
                                             */
                                            (entry) => entry.outcome
                                        )
                                        .sort()
                                ).toEqual(['failed', 'failed', 'succeeded']);
                                expect(
                                    spans
                                        .filter(
                                            /**
                                             * Select successful and stale-revision resource updates.
                                             *
                                             * @param entry - One captured span.
                                             * @returns Whether the span is a resource update.
                                             */
                                            (entry) => entry.code === 'resource.update'
                                        )
                                        .map(
                                            /**
                                             * Compare update outcomes without retaining payload details.
                                             *
                                             * @param entry - One update span.
                                             * @returns The span's outcome.
                                             */
                                            (entry) => entry.outcome
                                        )
                                        .sort()
                                ).toEqual(['failed', 'succeeded']);
                                expect(
                                    spans.filter(
                                        /**
                                         * Count creates from committed, failed and interrupted transactions alike.
                                         *
                                         * @param entry - One captured span.
                                         * @returns Whether the span is a resource create.
                                         */
                                        (entry) => entry.code === 'resource.create'
                                    )
                                ).toHaveLength(3);
                                for (const entry of spans) expect(entry.attributes).toEqual({});
                                const serialized = JSON.stringify(spans);
                                for (const secret of [
                                    'CANARY',
                                    resource.id,
                                    id(1),
                                    id(2),
                                    id(3),
                                    tenant,
                                    caller.subject,
                                    caller.session,
                                ])
                                    expect(serialized).not.toContain(secret);
                                expect((yield* api.get(resource, id(1)))?.revision).toBe(2);
                                expect(yield* api.history(resource, id(1))).toHaveLength(2);
                                for (const missing of [id(2), id(3)]) {
                                    expect(yield* api.get(resource, missing)).toBeUndefined();
                                    expect(yield* api.history(resource, missing)).toEqual([]);
                                }
                                const sql = yield* SqlClient.SqlClient;
                                expect(yield* sql`SELECT id FROM command_outbox`).toEqual([]);

                                // The existing exporter boundary must not turn a committed write into failure.
                                const unavailable = telemetryLayer({ messages, attributes: {} }).pipe(
                                    Layer.provide(
                                        Layer.succeed(TelemetrySink, {
                                            /**
                                             * Model an unavailable exporter without failing the business operation directly.
                                             *
                                             * @returns An Effect that fails with an unavailable sink.
                                             */
                                            write: () =>
                                                Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' })),
                                            flush: Effect.void,
                                        })
                                    )
                                );
                                yield* Effect.gen(
                                    /** Verify exporter health reports failure while the resource create still commits. */ function* () {
                                        // Flush exposes the queued sink failure; it cannot retroactively undo the successful create.
                                        expect((yield* api.create(resource, id(4), data)).revision).toBe(1);
                                        expect(
                                            Exit.isFailure(yield* Effect.exit((yield* TelemetryControl).flush))
                                        ).toBe(true);
                                        expect((yield* (yield* TelemetryControl).health).failed).toBeGreaterThan(0);
                                    }
                                ).pipe(Effect.provide(unavailable));
                                expect(yield* api.history(resource, id(4))).toHaveLength(1);
                                yield* Ref.set(records, []);
                                const disabled = telemetryLayer(
                                    { messages, attributes: {} },
                                    Config.succeed({ enabled: false, capacity: 256, timeoutMs: 1000 })
                                ).pipe(
                                    Layer.provide(
                                        Layer.succeed(TelemetrySink, {
                                            /**
                                             * Capture any unexpected emission while telemetry is explicitly disabled.
                                             *
                                             * @param entry - One telemetry record that should never arrive.
                                             * @returns An Effect that appends the record to the capture list.
                                             */
                                            write: (entry) =>
                                                Ref.update(
                                                    records,
                                                    /**
                                                     * Preserve all unexpected records so disabled-mode leakage cannot be hidden.
                                                     *
                                                     * @param all - The records captured so far.
                                                     * @returns A new list with the record appended.
                                                     */
                                                    (all) => [...all, entry]
                                                ),
                                            flush: Effect.void,
                                        })
                                    )
                                );
                                yield* api.create(resource, id(5), data).pipe(Effect.provide(disabled));
                                expect(yield* api.history(resource, id(5))).toHaveLength(1);
                                expect(yield* Ref.get(records)).toEqual([]);
                            }
                        )
                    )
                ),
            20000
        );

        it.effect(
            'resource operations share EVE-42 durable transactions and rollback history/outbox together',
            /**
             * Verify resource mutations share durable Integrity admission and atomically roll back revision/outbox evidence.
             *
             * @returns The Effect that runs these assertions.
             */
            () =>
                withDatabase(
                    dialect,
                    auth(
                        Effect.gen(
                            /** Compare explicit resource rollback with exact replay through the durable runtime. */ function* () {
                                // A resource API transaction and an Integrity commit must use the same provider-owned storage boundary.
                                const resource = yield* base();
                                yield* migrateResources(dialect, tenant, [resource], policy);
                                const provider = yield* resourceProvider(dialect, tenant, identity, [resource]);
                                const api = yield* bind(provider);
                                const failed = yield* Effect.either(
                                    api.transaction(
                                        Effect.gen(
                                            /** Fail after staging both a record revision and queued work in one resource transaction. */ function* () {
                                                // A missing current record alone is insufficient: history and outbox must also be empty.
                                                yield* api.create(resource, id(1), data);
                                                yield* provider.storage.enqueue('rolled-back', { value: 'hidden' });
                                                return yield* Effect.fail('rollback');
                                            }
                                        )
                                    )
                                );
                                expect(failed).toEqual(Either.left('rollback'));
                                expect(yield* api.get(resource, id(1))).toBeUndefined();
                                expect(yield* api.history(resource, id(1))).toEqual([]);
                                const sql = yield* SqlClient.SqlClient;
                                expect(yield* sql`SELECT id FROM command_outbox`).toEqual([]);
                                const execute = Effect.gen(
                                    /** Run identical admitted resource work twice and require committed replay on the second call. */ function* () {
                                        // A replay must return the retained receipt without creating a second revision.
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
                                            Effect.gen(
                                                /** Return the resource create output and its matching durable action receipt. */ function* () {
                                                    // Returning after the mutation lets the enclosing integrity commit own both business data and evidence.
                                                    yield* api.create(resource, id(1), data);
                                                    return { output: { id: id(1) }, receipt };
                                                }
                                            )
                                        );
                                        expect((yield* integrity.commit(request, work)).replayed).toBe(false);
                                        expect((yield* integrity.commit(request, work)).replayed).toBe(true);
                                    }
                                ).pipe(Effect.provide(durable), Effect.provideService(Storage, provider.storage));
                                yield* execute;
                                expect(yield* api.history(resource, id(1))).toHaveLength(1);
                                expect(yield* sql`SELECT id FROM action_receipt`).toHaveLength(1);
                            }
                        )
                    )
                ),
            20000
        );

        it.effect(
            'enforces live caller/tenant authorization, dedicated DB binding and TenantRouter composition',
            /**
             * Verify named providers reject absent or mismatched caller scopes and immutable tenant rebinding.
             *
             * @returns The Effect that runs these assertions.
             */
            () =>
                withDatabase(
                    dialect,
                    Effect.gen(
                        /** Toggle live policy and scope identities before routing through the same fixed provider. */ function* () {
                            // Caller, CurrentTenant and the persisted database binding must agree independently of policy permission.
                            const resource = yield* base();
                            yield* migrateResources(dialect, tenant, [resource], policy);
                            const provider = yield* resourceProvider(dialect, tenant, identity, [resource]);
                            let allowed = true;
                            const layer = resourceRuntime(
                                provider,
                                /**
                                 * Consult current permission for each call, not a construction-time authorization snapshot.
                                 *
                                 * @returns An Effect that permits while allowed and fails as denied once revoked.
                                 */
                                () => (allowed ? Effect.void : Effect.fail(denied('revoked')))
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
                            const routed = Effect.gen(
                                /** Run an authorized resource read under the router-provided tenant scope. */ function* () {
                                    // A permissive routing policy still needs the caller's tenant to match this bound resource provider.
                                    const routing = yield* TenantRouter;
                                    return yield* routing.run(tenant, api.get(resource, id(1)));
                                }
                            ).pipe(
                                Effect.provide(
                                    router(
                                        /**
                                         * Resolve the already-bound fixture storage after routing authorization.
                                         *
                                         * @returns An Effect yielding the fixture storage.
                                         */
                                        () => Effect.succeed(provider.storage),
                                        /**
                                         * Permit routing policy while retaining caller/tenant matching in the router.
                                         *
                                         * @returns An Effect that always permits the request.
                                         */
                                        () => Effect.void
                                    )
                                ),
                                Effect.provideService(Caller, caller)
                            );
                            expect(yield* routed).toHaveProperty('value.name', data.name);
                        }
                    )
                ),
            20000
        );

        it.effect(
            'rejects untyped invalid requests and reports backend loss without partial writes or silent empty data',
            /**
             * Verify dynamic inputs and corrupt or missing tables fail explicitly without partial resource writes.
             *
             * @returns The Effect that runs these assertions.
             */
            () =>
                withDatabase(
                    dialect,
                    auth(
                        Effect.gen(
                            /** Probe invalid queries, provider definitions and retained revisions before removing participant tables. */ function* () {
                                // Failure to append history must roll back creation; unavailable reads must not be coerced to absence.
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
                                                /**
                                                 * Permit policy so duplicate provider definitions fail at their own validation boundary.
                                                 *
                                                 * @returns An Effect that always permits the request.
                                                 */
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
                            }
                        )
                    )
                ),
            20000
        );

        it.effect(
            'swaps named providers without feature changes and rejects cross-database transaction inheritance',
            /**
             * Verify provider substitution preserves feature code without inheriting foreign transaction authority.
             *
             * @returns The Effect that runs these assertions.
             */
            () =>
                withDatabase(
                    dialect,
                    auth(
                        Effect.gen(
                            /** Seed a first provider before running identical feature work under a second physical database. */ function* () {
                                // Retain the first provider so same-id rows in the second database expose accidental ambient-client reuse.
                                const resource = yield* base();
                                yield* migrateResources(dialect, tenant, [resource], policy);
                                const first = yield* resourceProvider(dialect, tenant, identity, [resource]);
                                const firstApi = yield* bind(first);
                                yield* firstApi.create(resource, id(1), { ...data, name: 'First tenant' });
                                yield* withDatabase(
                                    dialect,
                                    Effect.gen(
                                        /** Compare fixed-provider reads with every foreign ambient-transaction entry point. */ function* () {
                                            yield* migrateResources(dialect, otherTenant, [resource], policy);
                                            const second = yield* resourceProvider(
                                                dialect,
                                                otherTenant,
                                                { key: { module: 'other.sql', instance: 'primary' }, version: '1.0.0' },
                                                [resource]
                                            );
                                            const secondApi = yield* bind(second);
                                            /**
                                             * Supply the second tenant's matching caller and scope without altering either provider binding.
                                             *
                                             * @template A - The program's success type.
                                             * @template E - The program's error type.
                                             * @template R - The program's remaining requirements.
                                             * @param effect - The resource program that needs the second tenant's scope.
                                             * @returns The same program with the second tenant's caller and scope provided.
                                             */
                                            const asOther = <A, E, R>(effect: Effect.Effect<A, E, R | ResourceScope>) =>
                                                effect.pipe(
                                                    Effect.provideService(Caller, { ...caller, tenant: otherTenant }),
                                                    Effect.provideService(CurrentTenant, { id: otherTenant })
                                                );
                                            yield* asOther(
                                                secondApi.create(resource, id(1), { ...data, name: 'Second tenant' })
                                            );
                                            // Exactly the same feature program runs under both provider Layers, despite the ambient second client.
                                            const feature = Effect.gen(
                                                /** Read a name solely through the supplied resource port, without importing SQL capabilities. */ function* () {
                                                    // Acquiring the port per execution exposes accidental reuse of the other provider's tenant binding.
                                                    const api = yield* Resources;
                                                    return (yield* api.get(resource, id(1)))?.value.name;
                                                }
                                            );
                                            expect(
                                                yield* auth(
                                                    feature.pipe(
                                                        Effect.provide(
                                                            resourceRuntime(
                                                                first,
                                                                /**
                                                                 * Permit first-provider policy while retaining its tenant and transaction checks.
                                                                 *
                                                                 * @returns An Effect that always permits the request.
                                                                 */
                                                                () => Effect.void
                                                            )
                                                        )
                                                    )
                                                )
                                            ).toBe('First tenant');
                                            expect(
                                                yield* asOther(
                                                    feature.pipe(
                                                        Effect.provide(
                                                            resourceRuntime(
                                                                second,
                                                                /**
                                                                 * Permit second-provider policy without authorizing cross-root transaction inheritance.
                                                                 *
                                                                 * @returns An Effect that always permits the request.
                                                                 */
                                                                () => Effect.void
                                                            )
                                                        )
                                                    )
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
                                                expect(
                                                    yield* Effect.either(firstApi.transaction(asOther(read)))
                                                ).toMatchObject({ left: { reason: 'denied' } });
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
                                                second.storage.compareAndSet(command, 'next', null, {
                                                    pending: ['next'],
                                                }),
                                                second.storage.stock(id(3), 10),
                                                second.storage.available(id(3)),
                                                second.storage.reserve(id(4), id(3), 1, 1794700000123),
                                                second.storage.settle(id(4), 'released'),
                                                second.storage.expire,
                                                second.storage.reconcile('foreign', 'payment', 'USD', '100'),
                                                second.storage.enqueue('foreign', null),
                                                second.storage.audit('foreign', null),
                                            ].map(
                                                /**
                                                 * Discard heterogeneous success values while preserving each operation's boundary failure.
                                                 *
                                                 * @param operation - One foreign storage operation.
                                                 * @returns The operation with its success value discarded.
                                                 */
                                                (operation) => operation.pipe(Effect.asVoid)
                                            );
                                            for (const operation of foreignStorage) {
                                                const rejected = yield* Effect.either(
                                                    first.storage.transaction(operation)
                                                );
                                                expect(rejected).toMatchObject({
                                                    left: {
                                                        _tag: 'StorageFailure',
                                                        operation: 'resource-provider-boundary',
                                                    },
                                                });
                                                if (Either.isLeft(rejected))
                                                    expect(rejected.left).not.toHaveProperty('cause');
                                            }
                                            expect(
                                                yield* Effect.either(
                                                    firstApi.transaction(
                                                        asOther(secondApi.create(resource, id(2), data))
                                                    )
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
                                        }
                                    )
                                );
                            }
                        )
                    )
                ),
            20000
        );
    });
