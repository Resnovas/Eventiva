/**
 * @file tests/resources/src/crm-organisation.spec.ts
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
    Config,
    ConfigProvider,
    Context,
    Deferred,
    Effect,
    Either,
    Fiber,
    Layer,
    Logger,
    Redacted,
    Ref,
    Schema,
} from 'effect';
import { Authorizer, Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import { Flags } from '@eventiva/contracts/flags';
import { IdentityStore, RoleId } from '@eventiva/contracts/identity';
import { TenantId } from '@eventiva/contracts/ids';
import { TelemetrySink, type TelemetryRecord } from '@eventiva/contracts/observability';
import {
    organisationActions,
    organisationCreate,
    organisationGet,
    organisationResources,
    contactPointActions,
    ContactPoint,
    contactPointList,
} from '@eventiva/contracts/crm-organisation';
import { ResourceFailure, Resources, type ResourceScope } from '@eventiva/contracts/resource';
import { CurrentTenant, Storage } from '@eventiva/contracts/storage';
import { identityStore } from '@eventiva/integrations.sql/identity';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { resourceProvider, migrateResources } from '@eventiva/integrations.sql/resource';
import { localFile } from '@eventiva/integrations.sql/sqlite';
import { crmOrganisationModule } from '@eventiva/runtime/crm-organisation';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { identitySecurity } from '@eventiva/runtime/identity';
import { Approvals, InputDigest, InvocationDenied } from '@eventiva/runtime/invocation';
import { resourceRuntime } from '@eventiva/runtime/resource';
import { durable } from '@eventiva/runtime/storage';
import { TelemetryControl, telemetryLayer } from '@eventiva/runtime/telemetry';

/** Stable UUIDv7 fixtures make independently expected ID ordering visible in paging assertions. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const tenant = TenantId.make(id(900));
// Canonical subjects may be UUIDv4 even though CRM record keys must be UUIDv7.
const caller = Schema.decodeUnknownSync(CallerIdentity)({
    tenant,
    subject: '00000000-0000-4000-8000-000000000901',
    session: id(902),
    kind: 'human',
});
const role = RoleId.make(id(903));
const privateName = 'SYNTHETIC-CRM-PRIVATE-SENTINEL';
const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
/** Configure only a validated disposable PostgreSQL target. */
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
/** Allocate a persistent disposable database so a later scope really reconnects with fresh SQL clients and services. */
const database = (dialect: Dialect) =>
    Effect.gen(
        /** Own physical database cleanup outside the individual connection scopes. */ function* () {
            // Keep physical cleanup outside connection scopes so reconnect tests cannot accidentally allocate a new database.
            if (dialect === 'postgres') {
                const url = new URL(local);
                if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.pathname !== '/eventiva_test')
                    return yield* new ResourceFailure({
                        reason: 'denied',
                        detail: 'Disposable loopback database required',
                    });
                const admin = Context.get(yield* Layer.build(pg(local)), SqlClient.SqlClient);
                const name = `crm_${randomUUID().replaceAll('-', '')}`;
                yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                yield* Effect.addFinalizer(
                    /** Drop only this test's database after nested connection scopes close. */ () =>
                        admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie)
                );
                url.pathname = `/${name}`;
                return pg(url.toString());
            }
            const dir = fileURLToPath(new URL('../../../.amp/in/orb-backup/crm/', import.meta.url));
            yield* Effect.tryPromise(
                /** Allocate only the owned fixture directory; no repository or production records are touched. */ () =>
                    mkdir(dir, { recursive: true })
            );
            const path = `${dir}${randomUUID()}.db`;
            yield* Effect.addFinalizer(
                /** Remove the owned SQLite database once all client scopes are closed. */ () =>
                    Effect.tryPromise(
                        /** Delete only the fixture-owned file, never a caller-supplied path. */ () =>
                            rm(path, { force: true })
                    ).pipe(Effect.orDie)
            );
            return localFile(Redacted.make(path));
        }
    );
/** Build real SQL storage, canonical identity and a tenant-wide CRM test policy; never expose a permissive production provider. */
const fixture = <E>(
    dialect: Dialect,
    connection: Layer.Layer<SqlClient.SqlClient, E>,
    currentTenant = tenant,
    seed = true
) =>
    Effect.gen(
        /** Compose all transactional participants on the same SQL client and live identity store. */ function* () {
            const sql = Context.get(yield* Layer.build(connection), SqlClient.SqlClient);
            yield* migrate(
                dialect,
                yield* load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url)))
            ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            const scope = Layer.succeed(CurrentTenant, { id: currentTenant });
            const base = Layer.mergeAll(
                scope,
                identityStore.pipe(Layer.provide(scope), Layer.provide(Layer.succeed(SqlClient.SqlClient, sql)))
            );
            const context = yield* Layer.build(base);
            const store = Context.get(context, IdentityStore);
            if (seed) {
                yield* store.put(
                    'role',
                    {
                        id: role,
                        name: 'Synthetic CRM editor',
                        grants: [
                            { permission: 'crm.read', resources: ['*'] },
                            { permission: 'crm.write', resources: ['*'] },
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
            const security = yield* Layer.build(identitySecurity.pipe(Layer.provide(base)));
            const policy = Context.get(security, Authorizer);
            const enabled = yield* Ref.make<boolean | undefined>(true);
            const failSecond = yield* Ref.make(false);
            const failContact = yield* Ref.make<string | undefined>(undefined);
            const interruptContact = yield* Ref.make<string | undefined>(undefined);
            const resourceDenied = yield* Ref.make(false);
            const targetDenied = yield* Ref.make(false);
            const guardPause = yield* Ref.make<Effect.Effect<void> | undefined>(undefined);
            const definitions = yield* organisationResources;
            const declarations = Object.values(definitions);
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
                            /** Inject failure after the real subtype write to prove both real SQL rows and history roll back. */
                            write: (resource, key, revision, value) =>
                                provider.driver.write(resource, key, revision, value).pipe(
                                    Effect.tap(
                                        /** Interrupt only after real row/history persistence, proving rollback rather than early refusal. */ () =>
                                            Ref.get(interruptContact).pipe(
                                                Effect.flatMap(
                                                    /** A different record cannot trigger this synthetic cancellation. */ (
                                                        interruptedId
                                                    ) =>
                                                        resource.id === definitions.contactPoint.id &&
                                                        key === interruptedId
                                                            ? Effect.interrupt
                                                            : Effect.void
                                                )
                                            )
                                    ),
                                    Effect.tap(
                                        /** Pause after actual guard acquisition to test authority changes during transaction waits. */ () =>
                                            resource.id === definitions.emailPrimary.id ||
                                            resource.id === definitions.phonePrimary.id
                                                ? Ref.get(guardPause).pipe(
                                                      Effect.flatMap(
                                                          /** An unset barrier must not alter ordinary persistence or concurrency. */ (
                                                              pause
                                                          ) => pause ?? Effect.void
                                                      )
                                                  )
                                                : Effect.void
                                    ),
                                    Effect.flatMap(
                                        /** A fixed private sentinel mimics vendor diagnostics; it must not escape the feature failure. */ (
                                            saved
                                        ) =>
                                            Ref.get(failSecond).pipe(
                                                Effect.flatMap(
                                                    /** Fail only after the second half has persisted tentatively, not before the transaction does work. */ (
                                                        fail
                                                    ) =>
                                                        fail && resource.id === definitions.organisation.id
                                                            ? Effect.fail(
                                                                  new ResourceFailure({
                                                                      reason: 'storage',
                                                                      detail: privateName,
                                                                  })
                                                              )
                                                            : Ref.get(failContact).pipe(
                                                                  Effect.flatMap(
                                                                      /** Fail after a real contact write, including the tentative previous-primary clear in the same transaction. */ (
                                                                          failedId
                                                                      ) =>
                                                                          resource.id === definitions.contactPoint.id &&
                                                                          key === failedId
                                                                              ? Effect.fail(
                                                                                    new ResourceFailure({
                                                                                        reason: 'storage',
                                                                                        detail: 'contact-canary@example.test',
                                                                                    })
                                                                                )
                                                                              : Effect.succeed(saved)
                                                                  )
                                                              )
                                                )
                                            )
                                    )
                                ),
                        },
                    },
                    /** Tenant-wide fixture grants match the bounded tenant-only visibility contract; refresh live SQL identity each time. */ (
                        c,
                        _resource,
                        operation
                    ) =>
                        Ref.get(resourceDenied).pipe(
                            Effect.flatMap(
                                /** Deny resource access independently of action permission so domain operations cannot skip record policy. */ (
                                    denied
                                ) =>
                                    denied
                                        ? Effect.fail(
                                              new ResourceFailure({
                                                  reason: 'denied',
                                                  detail: 'CRM fixture policy denied',
                                              })
                                          )
                                        : policy
                                              .canInvoke(
                                                  c,
                                                  operation === 'write' ? organisationCreate : organisationGet
                                              )
                                              .pipe(
                                                  Effect.mapError(
                                                      /** Keep authorization diagnostics bounded at the Resources boundary. */ () =>
                                                          new ResourceFailure({
                                                              reason: 'denied',
                                                              detail: 'CRM fixture policy denied',
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
                    /** Permit live flag revocation without changing its production safe default. */ evaluate: (flag) =>
                        Ref.get(enabled).pipe(
                            Effect.map(
                                /** Return only the finite flag evaluation envelope. */ (value) => ({
                                    flag: flag.key,
                                    value: value ?? flag.safeDefault,
                                    reason: value === undefined ? 'SAFE_DEFAULT' : 'TEST',
                                    fallback: value === undefined,
                                })
                            )
                        ),
                }),
                Layer.succeed(InputDigest, {
                    /** Hash synthetic inputs for the real durable invocation replay boundary. */ digest: (text) =>
                        Effect.sync(
                            /** Avoid retaining the original private input in audit diagnostics. */ () =>
                                createHash('sha256').update(text).digest('hex')
                        ),
                }),
                Layer.succeed(Approvals, {
                    /** CRM human routine actions need no approval; a requested unknown proof still fails closed. */ get: () =>
                        Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'missing' })),
                    /** This fixture supplies no accepting proof-use capability. */ use: () =>
                        Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'missing' })),
                    /** No approved-read transaction may run through an always-denying provider. */ transaction: () =>
                        Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'missing' })),
                }),
                Layer.succeed(Authorizer, {
                    canInvoke: policy.canInvoke,
                    /** This fixture provisions only tenant-wide grants; target authorization is the same live tenant grant check. */ check: (
                        c,
                        spec
                    ) =>
                        Ref.get(targetDenied).pipe(
                            Effect.flatMap(
                                /** Domain target policy remains live on durable replay, independently of resource read/write policy. */ (
                                    denied
                                ) =>
                                    denied
                                        ? Effect.fail(
                                              new Forbidden({ action: spec.name, reason: 'CRM fixture target denied' })
                                          )
                                        : policy.canInvoke(c, spec)
                            )
                        ),
                })
            );
            const module = yield* crmOrganisationModule.pipe(
                Effect.provideService(Resources, api),
                Effect.provideService(CurrentTenant, { id: currentTenant }),
                Effect.provide(Layer.merge(Layer.succeedContext(security), platform))
            );
            const host = Context.get(
                yield* Layer.build(
                    ActionHostLive.pipe(
                        Layer.provide(Layer.merge(Layer.succeedContext(security), platform)),
                        // Durable action commits and Resources must share the provider's exact private transaction owner.
                        Layer.provide(durable.pipe(Layer.provide(Layer.succeed(Storage, provider.storage)))),
                        Layer.provide(base)
                    )
                ),
                ActionHost
            );
            yield* host.register(module);
            /** Invoke only through public host gates with fresh tenant identity and a distinct durable retry key. */
            const invoke = (
                operation: string,
                input: import('@eventiva/contracts/storage').JsonValue,
                presented = { ...caller, tenant: currentTenant }
            ) =>
                host
                    .invoke(`crm.organisation.${operation}`, input, { idempotencyKey: randomUUID() })
                    .pipe(Effect.provideService(Caller, presented));
            /** Preserve an explicit retry key so tests can distinguish fresh execution from authorized durable recovery. */
            const contact = (
                operation: string,
                input: import('@eventiva/contracts/storage').JsonValue,
                key: string = randomUUID(),
                presented = { ...caller, tenant: currentTenant }
            ) =>
                host
                    .invoke(`crm.contact-point.${operation}`, input, { idempotencyKey: key })
                    .pipe(Effect.provideService(Caller, presented));
            /** Expose resource history through its authorized public port, never through feature-level raw SQL. */
            const scoped = <A, E, R>(effect: Effect.Effect<A, E, R | ResourceScope>) =>
                effect.pipe(
                    Effect.provideService(Caller, { ...caller, tenant: currentTenant }),
                    Effect.provideService(CurrentTenant, { id: currentTenant })
                );
            return {
                host,
                invoke,
                contact,
                scoped,
                api,
                store,
                enabled,
                failSecond,
                failContact,
                interruptContact,
                resourceDenied,
                targetDenied,
                definitions,
                sql,
                guardPause,
            };
        }
    );

for (const dialect of ['sqlite', 'postgres'] as const)
    describe(`${dialect} CRM organisation public actions`, /** Apply identical domain scenarios to both real SQL dialects. */ () => {
        it.scoped(
            'persists paired identities, pages, archives/restores and reconnects',
            /** Close all first-session services before re-reading the same physical database through a new host. */ () =>
                Effect.gen(
                    /** Assert public results and immutable paired history independently of feature helper implementation. */ function* () {
                        // Reuse physical storage, not service layers: otherwise a retained feature cache could satisfy reconnect.
                        const connection = yield* database(dialect);
                        yield* Effect.scoped(
                            Effect.gen(
                                /** Create in deliberately unsorted order so query order cannot accidentally match insertion order. */ function* () {
                                    // Duplicate names and unordered IDs distinguish identity and ordering bugs from successful insertion.
                                    const f = yield* fixture(dialect, connection);
                                    expect(yield* f.host.actions).toEqual(
                                        [...organisationActions, ...contactPointActions]
                                            .map(
                                                /** Compare host registration with canonical action declarations. */ (
                                                    spec
                                                ) => spec.name
                                            )
                                            .sort()
                                    );
                                    for (const n of [3, 1, 2]) {
                                        expect(
                                            yield* f.invoke('create', {
                                                id: id(n),
                                                displayName: privateName,
                                                legalName: 'Synthetic Ltd',
                                                tradingName: 'Synthetic Trading',
                                            })
                                        ).toMatchObject({
                                            id: id(n),
                                            revision: 1,
                                            owner: caller.subject,
                                            createdBy: caller.subject,
                                            archived: false,
                                            visibility: 'tenant',
                                            kind: 'organisation',
                                        });
                                    }
                                    expect(yield* f.invoke('list', { limit: 2 })).toMatchObject({
                                        items: [{ id: id(1) }, { id: id(2) }],
                                        after: id(2),
                                    });
                                    expect(yield* f.invoke('list', { limit: 2, after: id(2) })).toMatchObject({
                                        items: [{ id: id(3) }],
                                        after: id(3),
                                    });
                                    expect(yield* f.invoke('list', { after: id(3) })).toEqual({ items: [] });
                                    expect(
                                        yield* f.invoke('update', {
                                            id: id(1),
                                            expectedRevision: 1,
                                            displayName: 'Renamed synthetic',
                                            legalName: 'Renamed Ltd',
                                        })
                                    ).toMatchObject({
                                        id: id(1),
                                        revision: 2,
                                        tradingName: 'Synthetic Trading',
                                        owner: caller.subject,
                                    });
                                    expect(
                                        yield* f.invoke('archive', { id: id(2), expectedRevision: 1 })
                                    ).toMatchObject({ revision: 2, archived: true });
                                    expect(yield* Effect.either(f.invoke('get', { id: id(2) }))).toMatchObject({
                                        left: { _tag: 'ActionFailed', error: { reason: 'not-found' } },
                                    });
                                    expect(yield* f.invoke('get', { id: id(2), includeArchived: true })).toMatchObject({
                                        id: id(2),
                                        archived: true,
                                    });
                                    expect(yield* f.invoke('list', { limit: 2 })).toMatchObject({
                                        items: [{ id: id(1) }, { id: id(3) }],
                                    });
                                    expect(yield* f.invoke('list', { limit: 2, includeArchived: true })).toMatchObject({
                                        items: [{ id: id(1) }, { id: id(2) }],
                                    });
                                    expect(
                                        yield* f.invoke('restore', { id: id(2), expectedRevision: 2 })
                                    ).toMatchObject({ id: id(2), revision: 3, archived: false });
                                    for (const resource of [f.definitions.party, f.definitions.organisation]) {
                                        const history = yield* f.scoped(f.api.history(resource, id(2)));
                                        expect(
                                            history.map(
                                                /** Compare retained writing revisions rather than only the latest row. */ (
                                                    record
                                                ) => record.revision
                                            )
                                        ).toEqual([1, 2, 3]);
                                    }
                                }
                            )
                        );
                        yield* Effect.scoped(
                            Effect.gen(
                                /** Fresh SQL clients, resource providers, identity resolver and action host must recover persisted rows, not a Ref cache. */ function* () {
                                    // The original scope is closed; all feature and host state must now come from persisted rows.
                                    const f = yield* fixture(dialect, connection, tenant, false);
                                    expect(yield* f.invoke('get', { id: id(1) })).toMatchObject({
                                        id: id(1),
                                        revision: 2,
                                        displayName: 'Renamed synthetic',
                                    });
                                    expect(yield* f.invoke('get', { id: id(2) })).toMatchObject({
                                        revision: 3,
                                        archived: false,
                                    });
                                }
                            )
                        );
                    }
                ),
            60000
        );
        it.scoped(
            'rolls back paired creates/updates and permits exactly one revision-race winner',
            /** Fault after the real second write, then race distinct retry keys against the same expected revision. */ () =>
                Effect.gen(
                    /** Observe domain rows and histories after failures, not just successful error classification. */ function* () {
                        // Fail after actual subtype persistence so absent rows and histories prove transaction rollback, not early rejection.
                        const f = yield* fixture(dialect, yield* database(dialect));
                        const input = { id: id(1), displayName: privateName, legalName: 'Synthetic Ltd' };
                        yield* Ref.set(f.failSecond, true);
                        expect(yield* Effect.either(f.invoke('create', input))).toMatchObject({
                            left: { error: { reason: 'unavailable' } },
                        });
                        expect(yield* f.scoped(f.api.get(f.definitions.party, id(1)))).toBeUndefined();
                        expect(yield* f.scoped(f.api.get(f.definitions.organisation, id(1)))).toBeUndefined();
                        for (const resource of [f.definitions.party, f.definitions.organisation]) {
                            expect(yield* f.scoped(f.api.history(resource, id(1)))).toEqual([]);
                        }
                        yield* Ref.set(f.failSecond, false);
                        yield* f.invoke('create', input);
                        yield* Ref.set(f.failSecond, true);
                        expect(
                            yield* Effect.either(
                                f.invoke('update', { ...input, expectedRevision: 1, displayName: 'Must roll back' })
                            )
                        ).toMatchObject({ left: { error: { reason: 'unavailable' } } });
                        expect(yield* f.invoke('get', { id: id(1) })).toMatchObject({
                            revision: 1,
                            displayName: privateName,
                        });
                        yield* Ref.set(f.failSecond, false);
                        const results = yield* Effect.all(
                            [
                                f
                                    .invoke('update', { ...input, expectedRevision: 1, displayName: 'Winner A' })
                                    .pipe(Effect.either),
                                f
                                    .invoke('update', { ...input, expectedRevision: 1, displayName: 'Winner B' })
                                    .pipe(Effect.either),
                            ],
                            { concurrency: 'unbounded' }
                        );
                        expect(results.filter(Either.isRight)).toHaveLength(1);
                        expect(results.filter(Either.isLeft)).toMatchObject([
                            { left: { error: { reason: 'conflict' } } },
                        ]);
                        const p = yield* f.scoped(f.api.get(f.definitions.party, id(1)));
                        const o = yield* f.scoped(f.api.get(f.definitions.organisation, id(1)));
                        expect(p?.revision).toBe(2);
                        expect(o?.revision).toBe(2);
                        for (const resource of [f.definitions.party, f.definitions.organisation])
                            expect(yield* f.scoped(f.api.history(resource, id(1)))).toHaveLength(2);
                        expect(
                            yield* Effect.either(f.invoke('restore', { id: id(1), expectedRevision: 2 }))
                        ).toMatchObject({ left: { error: { reason: 'conflict' } } });
                    }
                ),
            60000
        );
        it.scoped(
            'rejects forged/excess input and live flag, permission and identity revocation without leaking private values',
            /** Exercise public host refusals, not only schema decoders or resource mocks. */ () =>
                Effect.gen(
                    /** Collect actual logger messages and public error diagnostics while deliberately exercising failures. */ function* () {
                        // Exercise the real minimizer with canaries; an empty exporter alone would make a leakage assertion vacuous.
                        const f = yield* fixture(dialect, yield* database(dialect));
                        const logs: Array<string> = [];
                        const records = yield* Ref.make<ReadonlyArray<TelemetryRecord>>([]);
                        const telemetry = telemetryLayer(
                            {
                                messages: {
                                    'crm.fixture': 'CRM fixture.',
                                    'action.crm.contact-point.add': 'Add work contact.',
                                    'action.crm.contact-point.get': 'Read work contact.',
                                    'resource.update': 'Update authorized resource.',
                                },
                                attributes: {},
                            },
                            Config.succeed({ enabled: true, capacity: 1024, timeoutMs: 1000 })
                        ).pipe(
                            Layer.provide(
                                Layer.succeed(TelemetrySink, {
                                    /** Capture the actual minimizing tracer output, not an assumed logging contract. */
                                    write: (entry) =>
                                        Ref.update(
                                            records,
                                            /** Preserve every emitted record for a nonvacuous private-value check. */ (
                                                all
                                            ) => [...all, entry]
                                        ),
                                    flush: Effect.void,
                                })
                            )
                        );
                        const logger = Logger.make(
                            /** Retain diagnostics locally solely to assert the synthetic sentinel never reaches logs. */ (
                                event
                            ) => {
                                logs.push(
                                    inspect({
                                        message: event.message,
                                        annotations: event.annotations,
                                        cause: event.cause,
                                    })
                                );
                            }
                        );
                        yield* Effect.gen(
                            /** Keep all synthetic names inside input and authorized action results, never diagnostics. */ function* () {
                                // Revoke within one live host session so rebuilding services cannot hide stale authorization caches.
                                const input = { id: id(1), displayName: privateName, legalName: privateName };
                                for (const extra of [
                                    { owner: id(77) },
                                    { tenant: id(77) },
                                    { visibility: 'private' },
                                    { visibility: 'team' },
                                    { email: privateName },
                                    { phone: privateName },
                                    { taxNumber: privateName },
                                    { bankAccount: privateName },
                                    { contactPoints: [] },
                                    { arbitrary: {} },
                                ]) {
                                    const failed = yield* Effect.either(f.invoke('create', { ...input, ...extra }));
                                    expect(failed).toMatchObject({ left: { _tag: 'InvalidInput' } });
                                    expect(inspect(failed)).not.toContain(privateName);
                                }
                                expect(yield* f.scoped(f.api.get(f.definitions.party, id(1)))).toBeUndefined();
                                expect(
                                    yield* Effect.either(
                                        f.invoke('create', input, { ...caller, tenant, onBehalfOf: caller.subject })
                                    )
                                ).toMatchObject({ _tag: 'Left' });
                                expect(yield* f.scoped(f.api.get(f.definitions.party, id(1)))).toBeUndefined();
                                for (const limit of [0, 101, 1.5])
                                    expect(yield* Effect.either(f.invoke('list', { limit }))).toMatchObject({
                                        left: { _tag: 'InvalidInput' },
                                    });
                                for (const limit of [1, 100])
                                    expect(yield* f.invoke('list', { limit })).toEqual({ items: [] });
                                yield* Ref.set(f.enabled, undefined);
                                expect(yield* Effect.either(f.invoke('create', input))).toMatchObject({ _tag: 'Left' });
                                expect(yield* f.scoped(f.api.get(f.definitions.party, id(1)))).toBeUndefined();
                                yield* Ref.set(f.enabled, true);
                                yield* f.invoke('create', input);
                                const contactCanaries = ['Contact.Canary+731@example.test', '+447700900731'];
                                for (const [index, value] of contactCanaries.entries()) {
                                    const cp = {
                                        organisationId: id(1),
                                        id: id(40 + index),
                                        kind: index === 0 ? 'email' : 'phone',
                                        label: 'work',
                                        value,
                                    };
                                    expect(yield* f.contact('add', cp)).toMatchObject({ value, revision: 1 });
                                    yield* f.contact('get', { organisationId: id(1), id: cp.id });
                                    yield* Ref.set(f.failContact, cp.id);
                                    const error = yield* Effect.either(
                                        f.contact('update', {
                                            organisationId: id(1),
                                            id: cp.id,
                                            expectedRevision: 1,
                                            value,
                                        })
                                    );
                                    expect(error).toMatchObject({ left: { error: { reason: 'unavailable' } } });
                                    expect(inspect(error)).not.toContain(value);
                                    expect(inspect(error)).not.toContain('contact-canary@example.test');
                                    yield* Ref.set(f.failContact, undefined);
                                }
                                for (const extra of [
                                    { tenant: id(7) },
                                    { owner: id(7) },
                                    { verified: true },
                                    { primary: true },
                                    { label: 'personal' },
                                ]) {
                                    const error = yield* Effect.either(
                                        f.contact('add', {
                                            organisationId: id(1),
                                            id: id(42),
                                            kind: 'email',
                                            label: 'work',
                                            value: contactCanaries[0]!,
                                            ...extra,
                                        })
                                    );
                                    expect(error).toMatchObject({ left: { _tag: 'InvalidInput' } });
                                    expect(inspect(error)).not.toContain(contactCanaries[0]);
                                }
                                // A fixed safe positive control proves the logger capture is connected without logging contact payloads.
                                yield* Effect.logInfo('crm.fixture');
                                yield* Ref.set(f.failSecond, true);
                                const fault = yield* Effect.either(
                                    f.invoke('update', { ...input, expectedRevision: 1 })
                                );
                                expect(fault).toMatchObject({ left: { error: { reason: 'unavailable' } } });
                                expect(inspect(fault)).not.toContain(privateName);
                                yield* Ref.set(f.failSecond, false);
                                yield* Ref.set(f.enabled, false);
                                expect(yield* Effect.either(f.invoke('get', { id: id(1) }))).toMatchObject({
                                    _tag: 'Left',
                                });
                                yield* Ref.set(f.enabled, true);
                                yield* f.store.put(
                                    'role',
                                    {
                                        id: role,
                                        name: 'Revoked writer',
                                        grants: [{ permission: 'crm.read', resources: ['*'] }],
                                    },
                                    0
                                );
                                expect(
                                    yield* Effect.either(f.invoke('archive', { id: id(1), expectedRevision: 1 }))
                                ).toMatchObject({ left: { _tag: 'Forbidden' } });
                                expect(yield* f.invoke('get', { id: id(1) })).toMatchObject({
                                    revision: 1,
                                    archived: false,
                                });
                                yield* f.store.put(
                                    'membership',
                                    { id: caller.subject, active: false, roles: [role] },
                                    0
                                );
                                const revoked = yield* Effect.either(f.invoke('get', { id: id(1) }));
                                expect(revoked).toMatchObject({ _tag: 'Left' });
                                expect(inspect(revoked)).not.toContain(privateName);
                                yield* (yield* TelemetryControl).flush;
                            }
                        ).pipe(Effect.provide(Layer.merge(telemetry, Logger.replace(Logger.defaultLogger, logger))));
                        expect(logs.join('\n')).not.toContain(privateName);
                        expect(logs.join('\n')).toContain('crm.fixture');
                        const emitted = yield* Ref.get(records);
                        expect(
                            emitted.some(
                                /** Require real action/resource spans so redaction cannot pass with a disabled tracer. */ (
                                    record
                                ) => record.signal === 'span'
                            )
                        ).toBe(true);
                        for (const code of [
                            'action.crm.contact-point.add',
                            'action.crm.contact-point.get',
                            'resource.update',
                        ])
                            expect(
                                emitted.some(
                                    /** Require spans from the exercised contact operations and real resource writes, not only unrelated organisation activity. */ (
                                        entry
                                    ) => entry.signal === 'span' && entry.code === code
                                )
                            ).toBe(true);
                        expect(JSON.stringify(emitted)).not.toContain(privateName);
                        expect(JSON.stringify(emitted)).not.toContain(caller.subject);
                        for (const value of [
                            'Contact.Canary+731@example.test',
                            '+447700900731',
                            'contact-canary@example.test',
                        ]) {
                            expect(logs.join('\n')).not.toContain(value);
                            expect(JSON.stringify(emitted)).not.toContain(value);
                        }
                    }
                ),
            60000
        );
        it.scoped(
            'isolates same record IDs in separate tenant databases',
            /** Reuse names and IDs across independently routed physical storage to expose accidental global caches. */ () =>
                Effect.gen(
                    /** Reject a foreign caller against the original host and prove the second host sees only its own records. */ function* () {
                        // Reuse the exact ID across tenants to expose accidental global identity caching without guessing a foreign key.
                        const a = yield* fixture(dialect, yield* database(dialect));
                        const bTenant = TenantId.make(id(910));
                        const b = yield* fixture(dialect, yield* database(dialect), bTenant);
                        yield* a.invoke('create', { id: id(1), displayName: 'Tenant A', legalName: 'A Ltd' });
                        expect(yield* Effect.either(b.invoke('get', { id: id(1) }))).toMatchObject({
                            left: { error: { reason: 'not-found' } },
                        });
                        expect(yield* b.invoke('list', {})).toEqual({ items: [] });
                        expect(
                            yield* Effect.either(
                                b.invoke('update', {
                                    id: id(1),
                                    expectedRevision: 1,
                                    displayName: 'Attack',
                                    legalName: 'Attack',
                                })
                            )
                        ).toMatchObject({ left: { error: { reason: 'not-found' } } });
                        expect(
                            yield* Effect.either(a.invoke('get', { id: id(1) }, { ...caller, tenant: bTenant }))
                        ).toMatchObject({ _tag: 'Left' });
                        yield* b.invoke('create', { id: id(1), displayName: 'Tenant B', legalName: 'B Ltd' });
                        expect(yield* a.invoke('get', { id: id(1) })).toMatchObject({ displayName: 'Tenant A' });
                        expect(yield* b.invoke('get', { id: id(1) })).toMatchObject({ displayName: 'Tenant B' });
                    }
                ),
            60000
        );
        it.scoped(
            'persists distinct work contacts, tombstone history, original-key replay and unchanged parent revisions across reopen',
            /** Reconnect with new clients and the same physical database; discard one committed reply to exercise explicit recovery. */ () =>
                Effect.gen(
                    /** Preserve expected outputs and durable evidence independently of current contact state. */ function* () {
                        // Separate connection scopes prevent retained host/service instances from masquerading as persisted recovery.
                        const connection = yield* database(dialect);
                        const add = {
                            organisationId: id(1),
                            id: id(11),
                            label: 'work',
                            kind: 'email',
                            value: 'Sales.Team+CRM@Example.test',
                        };
                        let original: import('@eventiva/contracts/storage').JsonValue = null;
                        let durableResult: ReadonlyArray<{
                            readonly key: string;
                            readonly input_hash: string;
                            readonly result: string | null;
                        }> = [];
                        yield* Effect.scoped(
                            Effect.gen(
                                /** Distinct contact IDs preserve duplicate values and do not advance either organisation row. */ function* () {
                                    const f = yield* fixture(dialect, connection);
                                    for (const n of [1, 2])
                                        yield* f.invoke('create', {
                                            id: id(n),
                                            displayName: `Org ${n}`,
                                            legalName: `Org ${n} Ltd`,
                                        });
                                    original = yield* f.contact('add', add, 'contact-original-add');
                                    expect(original).toEqual({
                                        id: id(11),
                                        organisationId: id(1),
                                        revision: 1,
                                        label: 'work',
                                        kind: 'email',
                                        value: add.value,
                                        primary: false,
                                        removed: false,
                                    });
                                    durableResult = yield* f.sql<{
                                        readonly key: string;
                                        readonly input_hash: string;
                                        readonly result: string | null;
                                    }>`SELECT * FROM action_commit ORDER BY key`;
                                    expect(yield* f.contact('add', add, 'contact-original-add')).toEqual(original);
                                    expect(yield* f.sql`SELECT * FROM action_commit ORDER BY key`).toEqual(
                                        durableResult
                                    );
                                    expect(
                                        yield* Effect.either(
                                            f.contact(
                                                'add',
                                                { ...add, value: 'changed@example.test' },
                                                'contact-original-add'
                                            )
                                        )
                                    ).toMatchObject({ _tag: 'Left' });
                                    yield* f.contact('add', { ...add, id: id(12) });
                                    yield* f.contact('add', {
                                        ...add,
                                        id: id(13),
                                        kind: 'phone',
                                        value: '+442079460123',
                                    });
                                    yield* f.contact('add', {
                                        ...add,
                                        id: id(14),
                                        organisationId: id(2),
                                        value: 'other@example.test',
                                    });
                                    expect(
                                        yield* f.contact('update', {
                                            organisationId: id(1),
                                            id: id(11),
                                            expectedRevision: 1,
                                            value: 'new@example.test',
                                        })
                                    ).toMatchObject({ revision: 2, value: 'new@example.test', primary: false });
                                    expect(
                                        yield* Effect.either(
                                            f.contact('update', {
                                                organisationId: id(1),
                                                id: id(11),
                                                expectedRevision: 1,
                                                value: 'stale@example.test',
                                            })
                                        )
                                    ).toMatchObject({ left: { error: { reason: 'conflict' } } });
                                    expect(
                                        yield* Effect.either(
                                            f.contact('update', {
                                                organisationId: id(1),
                                                id: id(13),
                                                expectedRevision: 1,
                                                value: 'not-a-phone@example.test',
                                            })
                                        )
                                    ).toMatchObject({ left: { error: { reason: 'invalid-value' } } });
                                    yield* f.contact('set-primary', {
                                        organisationId: id(1),
                                        id: id(11),
                                        expectedRevision: 2,
                                    });
                                    expect(
                                        yield* f.contact('set-primary', {
                                            organisationId: id(1),
                                            id: id(13),
                                            expectedRevision: 1,
                                        })
                                    ).toMatchObject({ revision: 2, primary: true, kind: 'phone' });
                                    expect(
                                        yield* f.contact('remove', {
                                            organisationId: id(1),
                                            id: id(11),
                                            expectedRevision: 3,
                                        })
                                    ).toMatchObject({ revision: 4, primary: false, removed: true });
                                    expect(
                                        yield* Effect.either(f.contact('get', { organisationId: id(1), id: id(11) }))
                                    ).toMatchObject({ left: { error: { reason: 'not-found' } } });
                                    expect(yield* f.contact('list', { organisationId: id(1), limit: 1 })).toMatchObject(
                                        { items: [{ id: id(12), value: add.value }], after: id(12) }
                                    );
                                    expect(
                                        yield* f.contact('list', { organisationId: id(1), after: id(12) })
                                    ).toMatchObject({ items: [{ id: id(13) }], after: id(13) });
                                    expect(yield* f.contact('list', { organisationId: id(1), after: id(13) })).toEqual({
                                        items: [],
                                    });
                                    const history = yield* f.scoped(f.api.history(f.definitions.contactPoint, id(11)));
                                    expect(
                                        history.map(
                                            /** Assert every retained revision rather than inferring history from current output. */ (
                                                row
                                            ) => [
                                                row.revision,
                                                row.value['value'],
                                                row.value['primary'],
                                                row.value['removed'],
                                            ]
                                        )
                                    ).toEqual([
                                        [1, add.value, false, false],
                                        [2, 'new@example.test', false, false],
                                        [3, 'new@example.test', true, false],
                                        [4, 'new@example.test', false, true],
                                    ]);
                                    for (const resource of [f.definitions.party, f.definitions.organisation])
                                        expect(yield* f.scoped(f.api.history(resource, id(1)))).toHaveLength(1);
                                    expect(yield* f.invoke('get', { id: id(1) })).toMatchObject({
                                        revision: 1,
                                        displayName: 'Org 1',
                                        legalName: 'Org 1 Ltd',
                                    });
                                    yield* f.invoke('archive', { id: id(1), expectedRevision: 1 });
                                    for (const [op, input] of [
                                        ['get', { id: id(12), organisationId: id(1) }],
                                        ['list', { organisationId: id(1) }],
                                        ['add', { ...add, id: id(15) }],
                                        [
                                            'update',
                                            {
                                                id: id(12),
                                                organisationId: id(1),
                                                expectedRevision: 1,
                                                value: 'hidden@example.test',
                                            },
                                        ],
                                        ['remove', { id: id(12), organisationId: id(1), expectedRevision: 1 }],
                                        ['set-primary', { id: id(12), organisationId: id(1), expectedRevision: 1 }],
                                    ] as const)
                                        expect(yield* Effect.either(f.contact(op, input))).toMatchObject({
                                            left: { error: { reason: 'not-found' } },
                                        });
                                    // Archive is domain state, not authorization revocation: existing authorized replay retains its original output.
                                    expect(yield* f.contact('add', add, 'contact-original-add')).toEqual(original);
                                    yield* f.invoke('restore', { id: id(1), expectedRevision: 2 });
                                    const lostReply = yield* Effect.either(
                                        f
                                            .contact(
                                                'update',
                                                {
                                                    organisationId: id(1),
                                                    id: id(12),
                                                    expectedRevision: 1,
                                                    value: 'recovered@example.test',
                                                },
                                                'contact-lost-reply'
                                            )
                                            .pipe(Effect.zipRight(Effect.fail('synthetic transport reply loss')))
                                    );
                                    expect(lostReply).toMatchObject({ _tag: 'Left' });
                                    durableResult = yield* f.sql<{
                                        readonly key: string;
                                        readonly input_hash: string;
                                        readonly result: string | null;
                                    }>`SELECT * FROM action_commit ORDER BY key`;
                                }
                            )
                        );
                        yield* Effect.scoped(
                            Effect.gen(
                                /** A fresh host must recover original commits and current contacts from SQL, never a process cache. */ function* () {
                                    // Replay must keep the stored commit evidence even though fresh invocation receipts may differ.
                                    const f = yield* fixture(dialect, connection, tenant, false);
                                    expect(yield* f.contact('add', add, 'contact-original-add')).toEqual(original);
                                    expect(
                                        yield* f.contact(
                                            'update',
                                            {
                                                organisationId: id(1),
                                                id: id(12),
                                                expectedRevision: 1,
                                                value: 'recovered@example.test',
                                            },
                                            'contact-lost-reply'
                                        )
                                    ).toMatchObject({ revision: 2, value: 'recovered@example.test' });
                                    expect(yield* f.sql`SELECT * FROM action_commit ORDER BY key`).toEqual(
                                        durableResult
                                    );
                                    expect(
                                        yield* f.contact('get', { organisationId: id(1), id: id(12) })
                                    ).toMatchObject({ revision: 2, value: 'recovered@example.test' });
                                    expect(
                                        yield* f.scoped(f.api.history(f.definitions.contactPoint, id(12)))
                                    ).toHaveLength(2);
                                    expect(
                                        yield* f.contact('get', { organisationId: id(1), id: id(13) })
                                    ).toMatchObject({ primary: true, kind: 'phone' });
                                    expect(yield* f.invoke('get', { id: id(1) })).toMatchObject({
                                        revision: 3,
                                        archived: false,
                                    });
                                }
                            )
                        );
                    }
                ),
            60000
        );
        it.scoped(
            'serializes complete multipage primary groups and rolls back real partial switches and creates',
            /** Put the previous primary beyond the first 100-row storage page, then race separate host/provider connections. */ () =>
                Effect.gen(
                    /** Asymmetric IDs expose first-page scans, while persisted history/commits distinguish rollback from a safe-looking error. */ function* () {
                        const connection = yield* database(dialect);
                        const f = yield* fixture(dialect, connection);
                        yield* f.invoke('create', { id: id(1), displayName: 'Primary test', legalName: 'Primary Ltd' });
                        for (let n = 1104; n >= 1000; n--)
                            yield* f.contact('add', {
                                id: id(n),
                                organisationId: id(1),
                                kind: 'email',
                                label: 'work',
                                value: `synthetic-${n}@example.test`,
                            });
                        yield* f.contact('add', {
                            id: id(1200),
                            organisationId: id(1),
                            kind: 'phone',
                            label: 'work',
                            value: '+33123456789',
                        });
                        expect(yield* f.contact('list', { organisationId: id(1), limit: 100 })).toMatchObject({
                            after: id(1099),
                        });
                        expect(
                            yield* f.contact('list', { organisationId: id(1), after: id(1099), limit: 100 })
                        ).toMatchObject({
                            items: [
                                { id: id(1100) },
                                { id: id(1101) },
                                { id: id(1102) },
                                { id: id(1103) },
                                { id: id(1104) },
                                { id: id(1200) },
                            ],
                        });
                        yield* f.invoke('create', { id: id(2), displayName: 'Sparse list', legalName: 'Sparse Ltd' });
                        // Seed a complete tombstone page through Resources so an empty filtered page cannot masquerade as exhaustion.
                        for (let n = 2000; n < 2100; n++)
                            yield* f.scoped(
                                f.api.create(f.definitions.contactPoint, id(n), {
                                    organisationId: id(2),
                                    kind: 'email',
                                    label: 'work',
                                    value: 'removed@example.test',
                                    primary: false,
                                    removed: true,
                                })
                            );
                        yield* f.contact('add', {
                            id: id(2100),
                            organisationId: id(2),
                            kind: 'email',
                            label: 'work',
                            value: 'last@example.test',
                        });
                        expect(yield* f.contact('list', { organisationId: id(2), limit: 1 })).toMatchObject({
                            items: [{ id: id(2100), value: 'last@example.test' }],
                            after: id(2100),
                        });
                        expect(yield* f.contact('list', { organisationId: id(2), after: id(2100), limit: 1 })).toEqual({
                            items: [],
                        });
                        yield* f.contact('set-primary', { organisationId: id(1), id: id(1104), expectedRevision: 1 });
                        const before = yield* f.sql`SELECT * FROM action_commit ORDER BY key`;
                        const oldHistory = yield* f.scoped(f.api.history(f.definitions.contactPoint, id(1104)));
                        yield* Ref.set(f.failContact, id(1000));
                        expect(
                            yield* Effect.either(
                                f.contact(
                                    'set-primary',
                                    { organisationId: id(1), id: id(1000), expectedRevision: 1 },
                                    'primary-retry'
                                )
                            )
                        ).toMatchObject({ left: { error: { reason: 'unavailable' } } });
                        expect(yield* f.contact('get', { organisationId: id(1), id: id(1104) })).toMatchObject({
                            primary: true,
                            revision: 2,
                        });
                        expect(yield* f.scoped(f.api.history(f.definitions.contactPoint, id(1104)))).toEqual(
                            oldHistory
                        );
                        expect(yield* f.scoped(f.api.history(f.definitions.contactPoint, id(1000)))).toHaveLength(1);
                        expect(yield* f.sql`SELECT * FROM action_commit ORDER BY key`).toEqual(before);
                        const failedAdd = {
                            organisationId: id(1),
                            id: id(1300),
                            kind: 'email',
                            label: 'work',
                            value: 'failed@example.test',
                        };
                        yield* Ref.set(f.failContact, id(1300));
                        expect(yield* Effect.either(f.contact('add', failedAdd, 'add-retry'))).toMatchObject({
                            left: { error: { reason: 'unavailable' } },
                        });
                        expect(yield* f.scoped(f.api.get(f.definitions.contactPoint, id(1300)))).toBeUndefined();
                        expect(yield* f.scoped(f.api.history(f.definitions.contactPoint, id(1300)))).toEqual([]);
                        yield* Ref.set(f.failContact, undefined);
                        yield* f.contact('add', failedAdd, 'add-retry');
                        expect(
                            yield* f.contact(
                                'set-primary',
                                { organisationId: id(1), id: id(1000), expectedRevision: 1 },
                                'primary-retry'
                            )
                        ).toMatchObject({ primary: true, revision: 2 });
                        expect(yield* f.contact('get', { organisationId: id(1), id: id(1104) })).toMatchObject({
                            primary: false,
                            revision: 3,
                        });
                        yield* f.contact('set-primary', { organisationId: id(1), id: id(1200), expectedRevision: 1 });
                        // Two independent SQL providers share persisted guard state, not a feature-local semaphore.
                        const other = yield* fixture(dialect, connection, tenant, false);
                        const race = yield* Effect.all(
                            [
                                f
                                    .contact('set-primary', {
                                        organisationId: id(1),
                                        id: id(1001),
                                        expectedRevision: 1,
                                    })
                                    .pipe(Effect.either),
                                other
                                    .contact('set-primary', {
                                        organisationId: id(1),
                                        id: id(1001),
                                        expectedRevision: 1,
                                    })
                                    .pipe(Effect.either),
                            ],
                            { concurrency: 'unbounded' }
                        );
                        expect(race.filter(Either.isRight)).toHaveLength(1);
                        expect(race.filter(Either.isLeft)).toHaveLength(1);
                        const selections = yield* Effect.all(
                            [
                                f
                                    .contact('set-primary', {
                                        organisationId: id(1),
                                        id: id(1002),
                                        expectedRevision: 1,
                                    })
                                    .pipe(Effect.either),
                                other
                                    .contact('set-primary', {
                                        organisationId: id(1),
                                        id: id(1003),
                                        expectedRevision: 1,
                                    })
                                    .pipe(Effect.either),
                            ],
                            { concurrency: 'unbounded' }
                        );
                        expect(selections.filter(Either.isRight).length).toBeGreaterThanOrEqual(1);
                        const all: Array<ContactPoint> = [];
                        let after: string | undefined;
                        while (true) {
                            const page = yield* Schema.decodeUnknown(contactPointList.output)(
                                yield* f.contact('list', {
                                    organisationId: id(1),
                                    limit: 37,
                                    ...(after === undefined ? {} : { after }),
                                })
                            );
                            all.push(...page.items);
                            if (page.items.length === 0) break;
                            after = page.after;
                        }
                        expect(all).toHaveLength(107);
                        expect(
                            new Set(all.map(/** Detect duplicated or skipped cursor boundaries. */ (cp) => cp.id)).size
                        ).toBe(107);
                        const primaries = all.filter(
                            /** Same-kind racing updates must leave a single live primary. */ (cp) =>
                                cp.primary && cp.kind === 'email'
                        );
                        expect(primaries).toHaveLength(1);
                        expect(
                            all.filter(
                                /** Phone primary is independent of email selections. */ (cp) =>
                                    cp.primary && cp.kind === 'phone'
                            )
                        ).toMatchObject([{ id: id(1200), revision: 2 }]);
                        const selected = primaries[0]!;
                        yield* f.contact('remove', {
                            organisationId: id(1),
                            id: selected.id,
                            expectedRevision: selected.revision,
                        });
                        for (const cp of all.filter(
                            /** Check all previously observed email IDs, including the removed primary. */ (cp) =>
                                cp.kind === 'email'
                        )) {
                            const row = yield* f.scoped(f.api.get(f.definitions.contactPoint, cp.id));
                            expect(row?.value.primary).toBe(false);
                        }
                        expect(
                            yield* Effect.either(
                                f.contact('set-primary', {
                                    organisationId: id(1),
                                    id: selected.id,
                                    expectedRevision: selected.revision + 1,
                                })
                            )
                        ).toMatchObject({ left: { error: { reason: 'not-found' } } });
                        expect(yield* f.invoke('get', { id: id(1) })).toMatchObject({
                            revision: 1,
                            displayName: 'Primary test',
                        });
                    }
                ),
            120000
        );
        it.scoped(
            'refuses foreign parents, forged contact authority and live replay revocation; rolls back interruption and post-guard flag loss',
            /** Use the same host for revocation/replay and a separate routed tenant for identical record IDs. */ () =>
                Effect.gen(
                    /** Current authority and persisted state, not submitted identity or cached admission, control fresh contacts. */ function* () {
                        // Reuse the original key throughout revocations so a stored success cannot bypass fresh host authorization.
                        const f = yield* fixture(dialect, yield* database(dialect));
                        const bTenant = TenantId.make(id(910));
                        const b = yield* fixture(dialect, yield* database(dialect), bTenant);
                        for (const [current, name] of [
                            [f, 'A'],
                            [b, 'B'],
                        ] as const)
                            yield* current.invoke('create', { id: id(1), displayName: name, legalName: `${name} Ltd` });
                        yield* f.invoke('create', { id: id(2), displayName: 'Other', legalName: 'Other Ltd' });
                        const add = {
                            organisationId: id(1),
                            id: id(11),
                            kind: 'email',
                            label: 'work',
                            value: 'isolated-a@example.test',
                        };
                        const output = yield* f.contact('add', add, 'revoke-replay');
                        expect(
                            yield* Effect.either(b.contact('get', { organisationId: id(1), id: id(11) }))
                        ).toMatchObject({ left: { error: { reason: 'not-found' } } });
                        expect(yield* b.contact('list', { organisationId: id(1) })).toEqual({ items: [] });
                        yield* b.contact('add', { ...add, value: 'isolated-b@example.test' }, 'revoke-replay');
                        expect(yield* b.contact('get', { organisationId: id(1), id: id(11) })).toMatchObject({
                            value: 'isolated-b@example.test',
                        });
                        expect(yield* f.contact('get', { organisationId: id(1), id: id(11) })).toMatchObject({
                            value: add.value,
                        });
                        expect(
                            yield* Effect.either(
                                f.contact('get', { organisationId: id(1), id: id(11) }, 'foreign-caller', {
                                    ...caller,
                                    tenant: bTenant,
                                })
                            )
                        ).toMatchObject({ _tag: 'Left' });
                        yield* f.scoped(
                            f.api.create(f.definitions.party, id(3), {
                                kind: 'person',
                                displayName: 'Synthetic person',
                                visibility: 'tenant',
                                createdBy: caller.subject,
                                owner: caller.subject,
                                archived: false,
                            })
                        );
                        for (const organisationId of [id(3), id(999)])
                            expect(
                                yield* Effect.either(f.contact('add', { ...add, id: id(12), organisationId }))
                            ).toMatchObject({ _tag: 'Left' });
                        for (const op of ['get', 'update', 'remove', 'set-primary'])
                            expect(
                                yield* Effect.either(
                                    f.contact(op, {
                                        organisationId: id(2),
                                        id: id(11),
                                        ...(op === 'get' ? {} : { expectedRevision: 1 }),
                                        ...(op === 'update' ? { value: 'attack@example.test' } : {}),
                                    })
                                )
                            ).toMatchObject({ left: { error: { reason: 'not-found' } } });
                        for (const extra of [
                            { tenant: id(7) },
                            { owner: id(7) },
                            { createdBy: id(7) },
                            { verified: true },
                            { primary: true },
                            { label: 'personal' },
                            { visibility: 'team' },
                            { visibility: 'private' },
                            { userId: caller.subject },
                        ])
                            expect(
                                yield* Effect.either(f.contact('add', { ...add, id: id(12), ...extra }))
                            ).toMatchObject({ left: { _tag: 'InvalidInput' } });
                        yield* Ref.set(f.resourceDenied, true);
                        expect(
                            yield* Effect.either(f.contact('get', { organisationId: id(1), id: id(11) }))
                        ).toMatchObject({ left: { error: { reason: 'denied' } } });
                        expect(yield* Effect.either(f.contact('add', { ...add, id: id(12) }))).toMatchObject({
                            left: { error: { reason: 'denied' } },
                        });
                        yield* Ref.set(f.resourceDenied, false);
                        const interruptInput = { ...add, id: id(12) };
                        const commits = yield* f.sql`SELECT * FROM action_commit ORDER BY key`;
                        yield* Ref.set(f.interruptContact, id(12));
                        const cancelled = yield* Effect.fork(f.contact('add', interruptInput, 'interrupted-add'));
                        expect((yield* Fiber.await(cancelled))._tag).toBe('Failure');
                        yield* Ref.set(f.interruptContact, undefined);
                        expect(yield* f.scoped(f.api.get(f.definitions.contactPoint, id(12)))).toBeUndefined();
                        expect(yield* f.scoped(f.api.history(f.definitions.contactPoint, id(12)))).toEqual([]);
                        expect(yield* f.sql`SELECT * FROM action_commit ORDER BY key`).toEqual(commits);
                        yield* f.contact('add', interruptInput, 'interrupted-add');
                        const entered = yield* Deferred.make<void>();
                        const release = yield* Deferred.make<void>();
                        yield* Ref.set(
                            f.guardPause,
                            Deferred.succeed(entered, undefined).pipe(Effect.zipRight(Deferred.await(release)))
                        );
                        const waiting = yield* Effect.forkScoped(
                            f
                                .contact('update', {
                                    organisationId: id(1),
                                    id: id(11),
                                    expectedRevision: 1,
                                    value: 'must-not-commit@example.test',
                                })
                                .pipe(Effect.either)
                        );
                        yield* Deferred.await(entered);
                        yield* Ref.set(f.enabled, false);
                        yield* Deferred.succeed(release, undefined);
                        expect(yield* Fiber.join(waiting)).toMatchObject({ left: { error: { reason: 'denied' } } });
                        yield* Ref.set(f.guardPause, undefined);
                        for (const value of [false, undefined]) {
                            yield* Ref.set(f.enabled, value);
                            expect(yield* Effect.either(f.contact('add', add, 'revoke-replay'))).toMatchObject({
                                _tag: 'Left',
                            });
                        }
                        yield* Ref.set(f.enabled, true);
                        expect(yield* f.contact('get', { organisationId: id(1), id: id(11) })).toEqual(output);
                        yield* Ref.set(f.targetDenied, true);
                        expect(yield* Effect.either(f.contact('add', add, 'revoke-replay'))).toMatchObject({
                            left: { _tag: 'Forbidden' },
                        });
                        yield* Ref.set(f.targetDenied, false);
                        yield* f.store.put(
                            'role',
                            { id: role, name: 'Reader only', grants: [{ permission: 'crm.read', resources: ['*'] }] },
                            0
                        );
                        expect(yield* Effect.either(f.contact('add', add, 'revoke-replay'))).toMatchObject({
                            left: { _tag: 'Forbidden' },
                        });
                        expect(yield* f.contact('get', { organisationId: id(1), id: id(11) })).toEqual(output);
                        yield* f.store.put(
                            'role',
                            {
                                id: role,
                                name: 'Editor restored',
                                grants: [
                                    { permission: 'crm.read', resources: ['*'] },
                                    { permission: 'crm.write', resources: ['*'] },
                                ],
                            },
                            1
                        );
                        yield* f.store.put('membership', { id: caller.subject, active: false, roles: [role] }, 0);
                        expect(yield* Effect.either(f.contact('add', add, 'revoke-replay'))).toMatchObject({
                            _tag: 'Left',
                        });
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
                        expect(yield* Effect.either(f.contact('add', add, 'revoke-replay'))).toMatchObject({
                            _tag: 'Left',
                        });
                    }
                ),
            60000
        );
    });
