/**
 * @file tests/resources/src/invoice-draft.spec.ts
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
import { Authorizer, Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { organisationResources, organisationCreate, organisationGet } from '@eventiva/contracts/crm-organisation';
import { Forbidden } from '@eventiva/contracts/errors';
import { Flags, safeDefault } from '@eventiva/contracts/flags';
import { IdentityStore, RoleId } from '@eventiva/contracts/identity';
import { TenantId } from '@eventiva/contracts/ids';
import {
    InvoiceDraft,
    invoiceDraftActions,
    invoiceDraft,
    invoiceGet,
    type InvoiceRevision,
} from '@eventiva/contracts/invoice';
import { TelemetrySink, type TelemetryRecord } from '@eventiva/contracts/observability';
import { ResourceFailure, Resources } from '@eventiva/contracts/resource';
import { CurrentTenant, Storage } from '@eventiva/contracts/storage';
import { identityStore } from '@eventiva/integrations.sql/identity';
import { client } from '@eventiva/integrations.sql/postgres';
import { localFile } from '@eventiva/integrations.sql/sqlite';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { migrateResources, resourceProvider } from '@eventiva/integrations.sql/resource';
import { crmOrganisationModule } from '@eventiva/runtime/crm-organisation';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { identitySecurity } from '@eventiva/runtime/identity';
import { invoiceDraftModule, invoiceDraftResources } from '@eventiva/runtime/invoice-draft';
import { InputDigest, Approvals, InvocationDenied } from '@eventiva/runtime/invocation';
import { resourceRuntime } from '@eventiva/runtime/resource';
import { durable } from '@eventiva/runtime/storage';
import { TelemetryControl, telemetryLayer } from '@eventiva/runtime/telemetry';
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

/** Stable fixture keys make exclusive ordering and same-ID tenant isolation independently observable. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const tenant = TenantId.make(id(900));
const caller = {
    ...Schema.decodeUnknownSync(CallerIdentity)({ tenant, subject: id(901), session: id(902), kind: 'human' }),
    tenant,
};
const role = RoleId.make(id(903));
const canary = 'SYNTHETIC-INVOICE-PRIVATE-CANARY';
const large = '9007199254740993';
/** Exact expectations are hand-calculated, not obtained from production helpers or Number arithmetic. */
const snapshot = (n = 10, revision = 1): InvoiceRevision => ({
    invoice: id(n),
    revision,
    supplier: id(1),
    customer: id(2),
    currency: 'GBP',
    lines: [
        { description: canary, quantity: 3, unitNetMinor: large, taxMinor: '7' },
        { description: 'Other synthetic line', quantity: 2, unitNetMinor: '11', taxMinor: '5' },
    ],
    totalMinor: '27021597764223013',
    commissionMinor: '9007199254740994',
});

/** Construct a valid canonical document at an independently measured UTF-8 byte boundary, including multibyte and escaped text. */
const sizedSnapshot = (bytes: number, n: number): InvoiceRevision => {
    // Null characters expand to six JSON bytes, while the visible non-ASCII prefix prevents a UTF-16 length check passing accidentally.
    const lines = Array.from(
        { length: 1000 },
        /** Start at known one-minor-unit lines without consulting runtime limits. */ () => ({
            description: '\u754c',
            quantity: 1,
            unitNetMinor: '1',
            taxMinor: '0',
        })
    );
    const value = { ...snapshot(n), lines, totalMinor: '1000', commissionMinor: '0' };
    let remaining = bytes - Buffer.byteLength(JSON.stringify({ format: 1, snapshot: value }), 'utf8');
    for (const line of lines) {
        const count = Math.min(199, Math.floor(remaining / 6));
        line.description += '\0'.repeat(count);
        remaining -= count * 6;
    }
    const last = lines.at(-1);
    if (last) last.description += 'x'.repeat(remaining);
    return value;
};
/** Bind only trusted fixture tenant context; no action body may select the Resource provider. */
const scoped = <A, E, R>(effect: Effect.Effect<A, E, R>, who = caller) =>
    effect.pipe(Effect.provideService(Caller, who), Effect.provideService(CurrentTenant, { id: who.tenant }));
/** Configure a fresh pool through the existing approved integration boundary. */
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
/** Own one disposable database across nested client/host scopes to make persistence survive a genuine reopen. */
const database = (dialect: Dialect) =>
    Effect.gen(
        /** Cleanup outlives every nested client; no production database or caller-supplied arbitrary path is accepted. */ function* () {
            // The PostgreSQL test role is a non-superuser with CREATEDB for isolated local fixtures only.
            if (dialect === 'postgres') {
                const url = new URL(
                    process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test'
                );
                if (url.hostname !== '127.0.0.1' || url.pathname !== '/eventiva_test')
                    return yield* Effect.dieMessage('Disposable loopback fixture required');
                const sql = Context.get(yield* Layer.build(pg(url.toString())), SqlClient.SqlClient);
                const name = `draft_${randomUUID().replaceAll('-', '')}`;
                yield* sql`CREATE DATABASE ${sql(name)} TEMPLATE template0`;
                yield* Effect.addFinalizer(
                    /** Drop only the owned fixture after its clients close. */ () =>
                        sql`DROP DATABASE ${sql(name)}`.pipe(Effect.orDie)
                );
                url.pathname = '/' + name;
                return pg(url.toString());
            }
            const directory = fileURLToPath(new URL('../../../.amp/in/orb-backup/invoice-tests/', import.meta.url));
            yield* Effect.tryPromise(
                /** Keep disposable SQLite state beneath backed-up scratch only. */ () =>
                    mkdir(directory, { recursive: true })
            );
            const path = directory + randomUUID() + '.sqlite';
            yield* Effect.addFinalizer(
                /** Remove only this generated fixture file. */ () =>
                    Effect.tryPromise(/** No other database is touched. */ () => rm(path, { force: true })).pipe(
                        Effect.orDie
                    )
            );
            return localFile(Redacted.make(path));
        }
    );

/** Compose real SQL identity, Resources and durable host on one exact Storage transaction owner. */
const fixture = <E>(dialect: Dialect, connection: Layer.Layer<SqlClient.SqlClient, E>, who = caller, seed = true) =>
    Effect.gen(
        /** Every fixture override is test-local; no provider, money or production service is installed. */ function* () {
            // Reconstruct the complete service tree on every reopen instead of retaining domain caches.
            const sql = Context.get(yield* Layer.build(connection), SqlClient.SqlClient);
            yield* migrate(
                dialect,
                yield* load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url)))
            ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            const route = Layer.succeed(CurrentTenant, { id: who.tenant });
            const base = Layer.merge(
                route,
                identityStore.pipe(Layer.provide(route), Layer.provide(Layer.succeed(SqlClient.SqlClient, sql)))
            );
            const store = Context.get(yield* Layer.build(base), IdentityStore);
            if (seed) {
                yield* store.put(
                    'role',
                    {
                        id: role,
                        name: 'Synthetic invoice preparer',
                        grants: [
                            { permission: 'crm.read', resources: ['*'] },
                            { permission: 'crm.write', resources: ['*'] },
                            { permission: 'accounting.read', resources: ['*'] },
                            { permission: 'accounting.invoice.write', resources: ['*'] },
                        ],
                    },
                    null
                );
                yield* store.put('principal', { id: who.subject, kind: 'human', active: true }, null);
                yield* store.put('membership', { id: who.subject, active: true, roles: [role] }, null);
                yield* store.put(
                    'session',
                    {
                        id: who.session,
                        subject: who.subject,
                        active: true,
                        expiresAt: 253402300799999,
                        delegation: null,
                    },
                    null
                );
            }
            const security = yield* Layer.build(identitySecurity.pipe(Layer.provide(base)));
            const policy = Context.get(security, Authorizer);
            const enabled = yield* Ref.make<boolean | null>(true);
            const allowed = yield* Ref.make(true);
            const resourceAllowed = yield* Ref.make<'all' | 'no-party' | 'none'>('all');
            const mutate = yield* Ref.make(false);
            const mode = yield* Ref.make<'none' | 'fail' | 'hold' | 'flag' | 'permission'>('none');
            const entered = yield* Deferred.make<void>();
            const release = yield* Deferred.make<void>();
            const beforeWrite = yield* Ref.make<Effect.Effect<void>>(Effect.void);
            const drafts = yield* invoiceDraftResources;
            const organisations = yield* organisationResources;
            const declarations = [drafts, organisations.party, organisations.organisation];
            yield* migrateResources(dialect, who.tenant, declarations, {
                kind: 'additive',
                restartRequired: false,
                retainedGenerations: 0,
            }).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            const provider = yield* resourceProvider(
                dialect,
                who.tenant,
                { key: { module: 'invoice.sql', instance: 'primary' }, version: '1.0.0' },
                declarations
            ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            const api = Context.get(
                yield* Layer.build(
                    resourceRuntime(
                        {
                            ...provider,
                            driver: {
                                ...provider.driver,
                                /** Faults happen after an actual domain SQL write/history append, never as vacuous preflight failures. */
                                write: (resource, key, revision, value) =>
                                    Effect.gen(
                                        /** Preserve the real transaction owner while injecting bounded, externally controlled failures. */ function* () {
                                            // Control state intentionally lives outside SQL rollback so revocation remains visible.
                                            if (resource.id === drafts.id) yield* yield* Ref.get(beforeWrite);
                                            const result = yield* provider.driver.write(resource, key, revision, value);
                                            if (resource.id === drafts.id) {
                                                const fault = yield* Ref.get(mode);
                                                if (fault === 'fail')
                                                    return yield* new ResourceFailure({
                                                        reason: 'storage',
                                                        detail: canary,
                                                    });
                                                if (fault === 'flag') yield* Ref.set(enabled, false);
                                                if (fault === 'permission') yield* Ref.set(allowed, false);
                                                if (fault === 'hold') {
                                                    yield* Deferred.succeed(entered, undefined);
                                                    yield* Deferred.await(release);
                                                }
                                            }
                                            return result;
                                        }
                                    ),
                            },
                        },
                        /** Refresh resource permission independently of action grants on every access. */ (
                            c,
                            resource,
                            operation
                        ) =>
                            Effect.gen(
                                /** CRM reference denial must not become fabricated absence or permissive invoice access. */ function* () {
                                    // The same fixture policy applies to history and transactions, not just current rows.
                                    const access = yield* Ref.get(resourceAllowed);
                                    if (access === 'none' || (access === 'no-party' && resource.startsWith('crm.')))
                                        return yield* new ResourceFailure({ reason: 'denied', detail: canary });
                                    yield* policy
                                        .canInvoke(
                                            c,
                                            resource.startsWith('crm.')
                                                ? operation === 'write'
                                                    ? organisationCreate
                                                    : organisationGet
                                                : operation === 'write'
                                                  ? invoiceDraft
                                                  : invoiceGet
                                        )
                                        .pipe(
                                            Effect.mapError(
                                                /** Never expose policy internals through resource failures. */ () =>
                                                    new ResourceFailure({
                                                        reason: 'denied',
                                                        detail: 'Fixture access denied',
                                                    })
                                            )
                                        );
                                }
                            )
                    )
                ),
                Resources
            );
            const platform = Layer.mergeAll(
                Layer.succeed(Flags, {
                    /** Null verifies the declared false fallback rather than an activated external flag. */ evaluate: (
                        flag
                    ) =>
                        Ref.get(enabled).pipe(
                            Effect.map(
                                /** CRM setup is independently enabled in this synthetic fixture only. */ (value) => ({
                                    ...safeDefault(flag),
                                    value: flag.key === 'crm.enabled' ? true : (value ?? flag.safeDefault),
                                    fallback: value === null,
                                })
                            )
                        ),
                }),
                Layer.succeed(InputDigest, {
                    /** Keep original invoice amounts and descriptions out of receipt digests. */ digest: (text) =>
                        Effect.sync(
                            /** Hash canonical text without retaining its private original. */ () =>
                                createHash('sha256').update(text).digest('hex')
                        ),
                }),
                Layer.succeed(Approvals, {
                    /** Draft preparation has no approval; no future issue/payment authority is supplied. */ get: () =>
                        Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'missing' })),
                }),
                Layer.succeed(Authorizer, {
                    /** Support revocation exactly after tentative SQL persistence. */ canInvoke: (c, spec) =>
                        Ref.get(allowed).pipe(
                            Effect.flatMap(
                                /** A revoked action is not reusable admission. */ (ok) =>
                                    ok
                                        ? policy.canInvoke(c, spec)
                                        : Effect.fail(new Forbidden({ action: spec.name, reason: 'permission' }))
                            )
                        ),
                    /** A hostile observer may mutate only disposable views, never persisted snapshots or caller authority. */ check: (
                        c,
                        spec,
                        target
                    ) =>
                        Effect.gen(
                            /** Mutate nested observer references to detect shallow cloning. */ function* () {
                                // Grant first; corruption then tries to redirect the accepted handler without authority to do so.
                                yield* policy.canInvoke(c, spec);
                                if (yield* Ref.get(mutate)) {
                                    if (
                                        typeof target === 'object' &&
                                        target !== null &&
                                        'snapshot' in target &&
                                        typeof target.snapshot === 'object' &&
                                        target.snapshot !== null
                                    ) {
                                        Reflect.set(target.snapshot, 'supplier', id(999));
                                        Reflect.set(target.snapshot, 'commissionMinor', '0');
                                        if ('lines' in target.snapshot && Array.isArray(target.snapshot.lines))
                                            Reflect.set(target.snapshot.lines[0], 'description', 'Corrupted observer');
                                    }
                                }
                            }
                        ),
                })
            );
            const services = Layer.mergeAll(
                Layer.succeedContext(security),
                platform,
                durable.pipe(Layer.provide(Layer.succeed(Storage, provider.storage)), Layer.provide(route))
            );
            const context = yield* Layer.build(services);
            const host = Context.get(yield* Layer.build(ActionHostLive.pipe(Layer.provide(services))), ActionHost);
            yield* host.register(
                yield* crmOrganisationModule.pipe(
                    Effect.provide(context),
                    Effect.provideService(Resources, api),
                    Effect.provideService(CurrentTenant, { id: who.tenant })
                )
            );
            yield* host.register(
                yield* invoiceDraftModule.pipe(
                    Effect.provide(context),
                    Effect.provideService(Resources, api),
                    Effect.provideService(CurrentTenant, { id: who.tenant })
                )
            );
            /** All requests cross the real public host and durable replay boundary. */
            const invoke = (operation: string, input: unknown, key = randomUUID()) =>
                scoped(host.invoke(`accounting.invoice.${operation}`, input, { idempotencyKey: key }), who);
            /** Create synthetic paired organisations through their public actions, never feature-local fabrication. */
            const parents = Effect.gen(
                /** Distinct asymmetric parties prove supplier/customer references are not swapped or defaulted. */ function* () {
                    // No real source data, seller rights, legal snapshot or connected merchant is asserted.
                    for (const n of [1, 2, 3])
                        yield* scoped(
                            host.invoke(
                                organisationCreate.name,
                                { id: id(n), displayName: `Synthetic ${n}`, legalName: `Synthetic ${n} Ltd` },
                                { idempotencyKey: randomUUID() }
                            ),
                            who
                        );
                }
            );
            return {
                sql,
                host,
                api,
                store,
                enabled,
                allowed,
                resourceAllowed,
                mutate,
                mode,
                entered,
                release,
                beforeWrite,
                drafts,
                organisations,
                invoke,
                parents,
            };
        }
    );

for (const dialect of ['sqlite', 'postgres'] as const)
    describe(`${dialect} canonical invoice drafts`, /** Apply the same public contract to both real persistence adapters, without a feature-specific database. */ () => {
        it.scoped(
            'enforces actual 1MiB UTF-8 snapshots, strict stored codec and no truncation',
            /** Test exact acceptance and the first refused byte using independently encoded valid canonical documents. */ () =>
                Effect.gen(
                    /** A rejected replacement leaves its original financial content, revision and history intact. */ function* () {
                        // UTF-16 counts would accept the over-limit multibyte/escaped document; Buffer measures actual wire bytes independently.
                        const f = yield* fixture(dialect, yield* database(dialect));
                        yield* f.parents;
                        const exact = sizedSnapshot(1048576, 10);
                        const over = sizedSnapshot(1048577, 11);
                        expect(Buffer.byteLength(JSON.stringify({ format: 1, snapshot: exact }), 'utf8')).toBe(1048576);
                        expect(Buffer.byteLength(JSON.stringify({ format: 1, snapshot: over }), 'utf8')).toBe(1048577);
                        expect(JSON.stringify(over).length).toBeLessThan(1048576);
                        expect(yield* f.invoke('draft', { snapshot: exact })).toHaveProperty('snapshot', exact);
                        expect(yield* Effect.either(f.invoke('draft', { snapshot: over }))).toMatchObject({
                            left: { error: { reason: 'limit' } },
                        });
                        expect(yield* scoped(f.api.get(f.drafts, id(11)))).toBeUndefined();
                        expect(
                            yield* Effect.either(
                                f.invoke('update', {
                                    expectedRevision: 1,
                                    snapshot: { ...sizedSnapshot(1048577, 10), revision: 2 },
                                })
                            )
                        ).toMatchObject({ left: { error: { reason: 'limit' } } });
                        expect(yield* Effect.either(f.invoke('draft', { snapshot: exact }))).toMatchObject({
                            left: { error: { reason: 'conflict' } },
                        });
                        expect(yield* f.invoke('get', { id: id(10) })).toHaveProperty('snapshot', exact);
                        expect(yield* scoped(f.api.history(f.drafts, id(10)))).toHaveLength(1);
                        for (const [index, text] of [
                            '{invalid',
                            JSON.stringify({ format: 2, snapshot: snapshot(20) }),
                            JSON.stringify({ format: 1, snapshot: { ...snapshot(20), revision: 9 } }),
                            JSON.stringify({ format: 1, snapshot: { ...snapshot(20), invoice: id(999) } }),
                            JSON.stringify({ format: 1, snapshot: snapshot(20), issued: true }),
                            '\u754c'.repeat(349526),
                        ].entries()) {
                            yield* scoped(
                                f.api.create(f.drafts, id(20 + index), {
                                    snapshot: text,
                                    state: 'draft',
                                    owner: caller.subject,
                                    createdBy: caller.subject,
                                })
                            );
                            expect((yield* Effect.either(f.invoke('get', { id: id(20 + index) })))._tag).toBe('Left');
                        }
                        expect((yield* Effect.either(f.invoke('list', { after: id(19) })))._tag).toBe('Left');
                    }
                ),
            60000
        );

        it.scoped(
            'actual action/resource spans, logs, receipts and typed errors exclude private monetary canaries',
            /** Exercise real minimizing telemetry rather than asserting an empty exporter contains no secrets. */ () =>
                Effect.gen(
                    /** Keep amounts/party contents confined to authorized output and persisted snapshots. */ function* () {
                        // The external observer receives only minimized records; input and storage errors deliberately contain canaries.
                        const f = yield* fixture(dialect, yield* database(dialect));
                        yield* f.parents;
                        const records = yield* Ref.make<ReadonlyArray<TelemetryRecord>>([]);
                        const logs: string[] = [];
                        const telemetry = telemetryLayer(
                            { messages: {}, attributes: {} },
                            Config.succeed({ enabled: true, capacity: 1024, timeoutMs: 1000 })
                        ).pipe(
                            Layer.provide(
                                Layer.succeed(TelemetrySink, {
                                    /** Capture exactly what the real minimizing sink receives. */ write: (entry) =>
                                        Ref.update(
                                            records,
                                            /** Retain local test evidence only. */ (all) => [...all, entry]
                                        ),
                                    flush: Effect.void,
                                })
                            )
                        );
                        const logger = Logger.make(
                            /** Retain diagnostics locally to check raw error and input leakage. */ (event) => {
                                // Structured causes matter: string-message-only checks can miss private parser diagnostics.
                                logs.push(
                                    inspect({
                                        message: event.message,
                                        cause: event.cause,
                                        annotations: event.annotations,
                                    })
                                );
                            }
                        );
                        yield* Effect.gen(
                            /** Include success, decode refusal and actual post-write failure in one observed scope. */ function* () {
                                // A real success guarantees emitted action/resource spans even if failures exit early.
                                yield* f.invoke('draft', { snapshot: snapshot() });
                                for (const value of [
                                    { ...snapshot(11), totalMinor: canary },
                                    { ...snapshot(11), issued: canary },
                                ])
                                    expect(
                                        inspect(yield* Effect.either(f.invoke('draft', { snapshot: value })))
                                    ).not.toContain(canary);
                                yield* Ref.set(f.mode, 'fail');
                                expect(
                                    inspect(yield* Effect.either(f.invoke('draft', { snapshot: snapshot(11) })))
                                ).not.toContain(canary);
                                yield* (yield* TelemetryControl).flush;
                            }
                        ).pipe(Effect.provide(Layer.merge(telemetry, Logger.replace(Logger.defaultLogger, logger))));
                        const emitted = yield* Ref.get(records);
                        expect(
                            emitted.some(
                                /** Make redaction evidence nonvacuous by requiring actual spans. */ (record) =>
                                    record.signal === 'span'
                            )
                        ).toBe(true);
                        const observed =
                            JSON.stringify(emitted) +
                            logs.join('\n') +
                            JSON.stringify(yield* f.sql`SELECT receipt FROM action_receipt`);
                        for (const secret of [
                            canary,
                            large,
                            '27021597764223013',
                            '9007199254740994',
                            'Synthetic 1 Ltd',
                        ])
                            expect(observed).not.toContain(secret);
                    }
                ),
            60000
        );

        it.scoped(
            'persists exact snapshots, original receipts/history, exclusive pages and genuine client reopen',
            /** Close all original clients/services before recovering the same database and replay key. */ () =>
                Effect.gen(
                    /** Independent expected strings detect financial rounding and silent snapshot replacement. */ function* () {
                        // The connection Layer is built in separate scopes, so process-local feature state cannot satisfy reads.
                        const db = yield* database(dialect);
                        const key = randomUUID();
                        let original: unknown;
                        let storedReceipt: unknown;
                        yield* Effect.scoped(
                            Effect.gen(
                                /** Deliberately insert unsorted IDs and revise only one draft. */ function* () {
                                    // Paging cannot accidentally pass by using insertion order or mutable request arrays.
                                    const f = yield* fixture(dialect, db);
                                    yield* f.parents;
                                    original = yield* f.invoke('draft', { snapshot: snapshot() }, key);
                                    expect(original).toEqual({
                                        id: id(10),
                                        revision: 1,
                                        state: 'draft',
                                        createdBy: caller.subject,
                                        owner: caller.subject,
                                        snapshot: snapshot(),
                                    });
                                    storedReceipt =
                                        (yield* f.sql`SELECT result FROM action_commit WHERE key LIKE ${'%' + key + '%'}`)[0]?.[
                                            'result'
                                        ];
                                    expect(storedReceipt).toBeDefined();
                                    expect(yield* f.invoke('draft', { snapshot: snapshot() }, key)).toEqual(original);
                                    expect(
                                        (yield* Effect.either(
                                            f.invoke(
                                                'draft',
                                                { snapshot: { ...snapshot(), commissionMinor: '9' } },
                                                key
                                            )
                                        ))._tag
                                    ).toBe('Left');
                                    for (const n of [12, 11]) yield* f.invoke('draft', { snapshot: snapshot(n) });
                                    expect(yield* f.invoke('list', { limit: 2 })).toMatchObject({
                                        items: [{ id: id(10) }, { id: id(11) }],
                                        after: id(11),
                                    });
                                    expect(yield* f.invoke('list', { after: id(11), limit: 2 })).toMatchObject({
                                        items: [{ id: id(12) }],
                                        after: id(12),
                                    });
                                    expect(yield* f.invoke('list', { after: id(12) })).toEqual({ items: [] });
                                    yield* f.invoke('update', {
                                        expectedRevision: 1,
                                        snapshot: { ...snapshot(10, 2), commissionMinor: '9' },
                                    });
                                    const history = yield* scoped(f.api.history(f.drafts, id(10)));
                                    expect(
                                        history.map(
                                            /** Compare immutable canonical contents, not just count. */ (r) =>
                                                JSON.parse(String(r.value['snapshot']))
                                        )
                                    ).toEqual([
                                        { format: 1, snapshot: snapshot() },
                                        { format: 1, snapshot: { ...snapshot(10, 2), commissionMinor: '9' } },
                                    ]);
                                    expect(
                                        history.map(
                                            /** Canonical and resource revisions must advance together. */ (r) =>
                                                r.revision
                                        )
                                    ).toEqual([1, 2]);
                                }
                            )
                        );
                        yield* Effect.scoped(
                            Effect.gen(
                                /** Recreate identity policy, host and Resource driver after every original client closes. */ function* () {
                                    // Replay returns the original revision even when current state has advanced.
                                    const f = yield* fixture(dialect, db, caller, false);
                                    expect(yield* f.invoke('get', { id: id(10) })).toMatchObject({
                                        revision: 2,
                                        snapshot: { ...snapshot(10, 2), commissionMinor: '9' },
                                    });
                                    expect(yield* f.invoke('draft', { snapshot: snapshot() }, key)).toEqual(original);
                                    expect(
                                        (yield* f.sql`SELECT result FROM action_commit WHERE key LIKE ${'%' + key + '%'}`)[0]?.[
                                            'result'
                                        ]
                                    ).toEqual(storedReceipt);
                                    expect(yield* scoped(f.api.history(f.drafts, id(10)))).toHaveLength(2);
                                    expect(yield* f.sql`SELECT * FROM command_outbox`).toHaveLength(0);
                                    expect(yield* f.sql`SELECT * FROM payment_ledger`).toHaveLength(0);
                                }
                            )
                        );
                    }
                ),
            60000
        );

        it.scoped(
            'CAS races, post-write failures, interruption and revocation roll back history and success commits',
            /** Inject only after actual SQL writes, then inspect rows, history and durable successful commits. */ () =>
                Effect.gen(
                    /** No retry hides infrastructure errors, and only one same-revision replacement may win. */ function* () {
                        // Shared-owner concurrency is meaningful on both adapters; independent SQLite pools may busy-refuse.
                        const f = yield* fixture(dialect, yield* database(dialect));
                        yield* f.parents;
                        const before = (yield* f.sql`SELECT * FROM action_commit`).length;
                        for (const mode of ['fail', 'flag', 'permission'] as const) {
                            yield* Ref.set(f.mode, mode);
                            expect((yield* Effect.either(f.invoke('draft', { snapshot: snapshot() })))._tag).toBe(
                                'Left'
                            );
                            yield* Ref.set(f.enabled, true);
                            yield* Ref.set(f.allowed, true);
                            expect(yield* scoped(f.api.get(f.drafts, id(10)))).toBeUndefined();
                            expect(yield* scoped(f.api.history(f.drafts, id(10)))).toHaveLength(0);
                            expect(yield* f.sql`SELECT * FROM action_commit`).toHaveLength(before);
                        }
                        yield* Ref.set(f.mode, 'hold');
                        const pending = yield* f.invoke('draft', { snapshot: snapshot() }).pipe(Effect.fork);
                        yield* Deferred.await(f.entered);
                        yield* Fiber.interrupt(pending);
                        expect(yield* scoped(f.api.get(f.drafts, id(10)))).toBeUndefined();
                        expect(yield* scoped(f.api.history(f.drafts, id(10)))).toHaveLength(0);
                        expect(yield* f.sql`SELECT * FROM action_commit`).toHaveLength(before);
                        yield* Ref.set(f.mode, 'none');
                        yield* f.invoke('draft', { snapshot: snapshot() });
                        const results = yield* Effect.all(
                            [
                                f
                                    .invoke('update', {
                                        expectedRevision: 1,
                                        snapshot: { ...snapshot(10, 2), commissionMinor: '13' },
                                    })
                                    .pipe(Effect.either),
                                f
                                    .invoke('update', {
                                        expectedRevision: 1,
                                        snapshot: { ...snapshot(10, 2), commissionMinor: '17' },
                                    })
                                    .pipe(Effect.either),
                            ],
                            { concurrency: 'unbounded' }
                        );
                        expect(results.filter(Either.isRight)).toHaveLength(1);
                        expect(results.filter(Either.isLeft)).toHaveLength(1);
                        const current = yield* Schema.decodeUnknown(InvoiceDraft)(
                            yield* f.invoke('get', { id: id(10) })
                        );
                        expect(['13', '17']).toContain(current.snapshot.commissionMinor);
                        expect(current.revision).toBe(2);
                        expect(current.snapshot.revision).toBe(2);
                        expect(yield* scoped(f.api.history(f.drafts, id(10)))).toHaveLength(2);
                        expect(yield* f.sql`SELECT * FROM action_commit`).toHaveLength(before + 2);
                    }
                ),
            60000
        );

        it.scoped(
            'refuses foreign, missing, archived, denied or malformed references and financial state without writes',
            /** Same tenant-private IDs must resolve only on the captured route and remain stable across updates. */ () =>
                Effect.gen(
                    /** Keep all failed snapshots absent, including valid canonical documents with invalid durable identities. */ function* () {
                        // A successful original establishes the exact prior value that failures must preserve.
                        const db = yield* database(dialect);
                        const f = yield* fixture(dialect, db);
                        yield* f.parents;
                        yield* f.invoke('draft', { snapshot: snapshot() });
                        for (const patch of [
                            { supplier: id(999) },
                            { customer: id(999) },
                            { invoice: '00000000-0000-4000-8000-000000000001' },
                            { revision: 2 },
                            { totalMinor: '1' },
                            { commissionMinor: '999999999999999999999999999999' },
                            { state: 'issued' },
                            { supplier: id(900) },
                        ])
                            expect(
                                (yield* Effect.either(f.invoke('draft', { snapshot: { ...snapshot(11), ...patch } })))
                                    ._tag
                            ).toBe('Left');
                        for (const patch of [{ supplier: id(3) }, { customer: id(3) }, { revision: 3 }])
                            expect(
                                (yield* Effect.either(
                                    f.invoke('update', {
                                        expectedRevision: 1,
                                        snapshot: { ...snapshot(10, 2), ...patch },
                                    })
                                ))._tag
                            ).toBe('Left');
                        yield* Ref.set(f.resourceAllowed, 'no-party');
                        expect((yield* Effect.either(f.invoke('draft', { snapshot: snapshot(11) })))._tag).toBe('Left');
                        yield* Ref.set(f.resourceAllowed, 'all');
                        yield* scoped(
                            f.host.invoke(
                                'crm.organisation.archive',
                                { id: id(2), expectedRevision: 1 },
                                { idempotencyKey: randomUUID() }
                            )
                        );
                        expect((yield* Effect.either(f.invoke('draft', { snapshot: snapshot(11) })))._tag).toBe('Left');
                        expect(
                            (yield* Effect.either(
                                f.invoke('update', { expectedRevision: 1, snapshot: snapshot(10, 2) })
                            ))._tag
                        ).toBe('Left');
                        expect(yield* f.invoke('get', { id: id(10) })).toHaveProperty('revision', 1);
                        expect(yield* scoped(f.api.history(f.drafts, id(10)))).toHaveLength(1);
                        expect(yield* scoped(f.api.get(f.drafts, id(11)))).toBeUndefined();
                        const other = { ...caller, tenant: TenantId.make(id(990)) };
                        expect(
                            (yield* Effect.either(scoped(f.host.invoke(invoiceGet.name, { id: id(10) }), other)))._tag
                        ).toBe('Left');
                        // The storage contract binds each database to one tenant; use its separately routed database for the allowed control.
                        const foreign = yield* fixture(dialect, yield* database(dialect), other);
                        expect((yield* Effect.either(foreign.invoke('get', { id: id(10) })))._tag).toBe('Left');
                        expect((yield* Effect.either(foreign.invoke('draft', { snapshot: snapshot() })))._tag).toBe(
                            'Left'
                        );
                        yield* foreign.parents;
                        expect(yield* foreign.invoke('draft', { snapshot: snapshot() })).toHaveProperty('revision', 1);
                        expect(yield* foreign.invoke('list', {})).toMatchObject({ items: [{ id: id(10) }] });
                    }
                ),
            60000
        );

        it.scoped(
            'retained policy/request mutation cannot rewrite parties, exact amounts or creator authority',
            /** Mutate nested observer copies while the host and local bridge both authorize the same invocation. */ () =>
                Effect.gen(
                    /** Accepted financial content must match the detached original, never hostile observer edits. */ function* () {
                        // Real SQL identity resolves the canonical caller independently of the mutable policy observations.
                        const f = yield* fixture(dialect, yield* database(dialect));
                        yield* f.parents;
                        yield* Ref.set(f.mutate, true);
                        const request = { snapshot: snapshot() };
                        const captured = yield* Deferred.make<void>();
                        const proceed = yield* Deferred.make<void>();
                        yield* Ref.set(
                            f.beforeWrite,
                            Deferred.succeed(captured, undefined).pipe(Effect.zipRight(Deferred.await(proceed)))
                        );
                        const pending = yield* f.invoke('draft', request).pipe(Effect.fork);
                        yield* Deferred.await(captured);
                        // Mutate the retained request before actual persistence, not merely after success has returned.
                        Reflect.set(request.snapshot, 'lines', []);
                        Reflect.set(request.snapshot, 'supplier', id(999));
                        Reflect.set(request.snapshot, 'commissionMinor', '0');
                        yield* Deferred.succeed(proceed, undefined);
                        const result = yield* Fiber.join(pending);
                        expect(result).toMatchObject({
                            owner: caller.subject,
                            createdBy: caller.subject,
                            snapshot: snapshot(),
                        });
                        expect(yield* f.invoke('get', { id: id(10) })).toEqual(result);
                        expect(yield* scoped(f.api.history(f.drafts, id(10)))).toHaveLength(1);
                    }
                ),
            60000
        );

        it.scoped(
            'live identity, action/resource policy, safe-default flag and replay admission remain enforced',
            /** A stored successful result is not permission to reuse a revoked session or financial capability. */ () =>
                Effect.gen(
                    /** Revoke each independent security dimension on an already-used host, without reconstructing its services. */ function* () {
                        // Restore between controls so each negative has its own allowed positive baseline.
                        const f = yield* fixture(dialect, yield* database(dialect));
                        yield* f.parents;
                        const key = randomUUID();
                        const input = { snapshot: snapshot() };
                        yield* f.invoke('draft', input, key);
                        for (const enabled of [null, false]) {
                            yield* Ref.set(f.enabled, enabled);
                            expect((yield* Effect.either(f.invoke('draft', input, key)))._tag).toBe('Left');
                            expect((yield* Effect.either(f.invoke('get', { id: id(10) })))._tag).toBe('Left');
                        }
                        yield* Ref.set(f.enabled, true);
                        const membership = yield* f.store.get('membership', caller.subject);
                        if (!membership) return yield* Effect.dieMessage('Missing fixture membership');
                        yield* f.store.put('membership', { ...membership.value, active: false }, membership.version);
                        expect((yield* Effect.either(f.invoke('draft', input, key)))._tag).toBe('Left');
                        yield* f.store.put('membership', membership.value, membership.version + 1);
                        const session = yield* f.store.get('session', caller.session);
                        if (!session) return yield* Effect.dieMessage('Missing fixture session');
                        yield* f.store.put('session', { ...session.value, active: false }, session.version);
                        expect((yield* Effect.either(f.invoke('get', { id: id(10) })))._tag).toBe('Left');
                        yield* f.store.put('session', session.value, session.version + 1);
                        yield* Ref.set(f.allowed, false);
                        expect((yield* Effect.either(f.invoke('draft', input, key)))._tag).toBe('Left');
                        yield* Ref.set(f.allowed, true);
                        yield* Ref.set(f.resourceAllowed, 'none');
                        expect((yield* Effect.either(f.invoke('get', { id: id(10) })))._tag).toBe('Left');
                        expect((yield* Effect.either(f.invoke('list', {})))._tag).toBe('Left');
                        // Shared replay currently bypasses handler Resource rechecks: do not label this a global replay fix.
                        yield* Ref.set(f.resourceAllowed, 'all');
                        expect(yield* f.invoke('draft', input, key)).toHaveProperty('revision', 1);
                        expect(yield* scoped(f.api.history(f.drafts, id(10)))).toHaveLength(1);
                        expect(
                            (yield* Effect.either(
                                scoped(
                                    f.host.invoke(
                                        invoiceDraft.name,
                                        { snapshot: snapshot(11) },
                                        { idempotencyKey: randomUUID(), mode: 'offline-intent' }
                                    )
                                )
                            ))._tag
                        ).toBe('Left');
                        expect(
                            (yield* f.host.actions).filter(
                                /** Only the four preparation specs may be installed. */ (name) =>
                                    name.startsWith('accounting.')
                            )
                        ).toEqual(
                            invoiceDraftActions
                                .map(
                                    /** Compare canonical names without adding issue or provider actions. */ (a) =>
                                        a.name
                                )
                                .sort()
                        );
                    }
                ),
            60000
        );
    });

it.scoped(
    'independent PostgreSQL pools race the same canonical/resource revision with exactly one committed successor',
    /** Overlap independent public-host attempts without bypassing the tenant's existing identity guard. */ () =>
        Effect.gen(
            /** A fresh third host observes only the winner and two immutable history entries. */ function* () {
                // Live identity checks serialize on identity_guard inside the owned SQL transaction; a post-preflight barrier would deadlock.
                const db = yield* database('postgres');
                const first = yield* fixture('postgres', db);
                yield* first.parents;
                yield* first.invoke('draft', { snapshot: snapshot() });
                const second = yield* fixture('postgres', db, caller, false);
                const results = yield* Effect.all(
                    [
                        first
                            .invoke('update', {
                                expectedRevision: 1,
                                snapshot: { ...snapshot(10, 2), commissionMinor: '19' },
                            })
                            .pipe(Effect.either),
                        second
                            .invoke('update', {
                                expectedRevision: 1,
                                snapshot: { ...snapshot(10, 2), commissionMinor: '23' },
                            })
                            .pipe(Effect.either),
                    ],
                    { concurrency: 'unbounded' }
                );
                expect(results.filter(Either.isRight)).toHaveLength(1);
                expect(results.filter(Either.isLeft)).toHaveLength(1);
                const fresh = yield* fixture('postgres', db, caller, false);
                const current = yield* Schema.decodeUnknown(InvoiceDraft)(yield* fresh.invoke('get', { id: id(10) }));
                expect(current.revision).toBe(2);
                expect(current.snapshot.revision).toBe(2);
                expect(['19', '23']).toContain(current.snapshot.commissionMinor);
                expect(yield* scoped(fresh.api.history(fresh.drafts, id(10)))).toHaveLength(2);
                expect(
                    yield* fresh.sql`SELECT * FROM action_commit WHERE key LIKE ${'%accounting.invoice.update%'}`
                ).toHaveLength(1);
            }
        ),
    60000
);
