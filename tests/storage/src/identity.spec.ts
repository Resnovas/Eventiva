/**
 * @file tests/storage/src/identity.spec.ts
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
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Flags } from '@eventiva/contracts/flags';
import { IdentityStore, RoleId, TeamId } from '@eventiva/contracts/identity';
import { SubjectId, TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant, RoutingDenied, Storage, TenantRouter, type JsonValue } from '@eventiva/contracts/storage';
import { identityStore } from '@eventiva/integrations.sql/identity';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { router } from '@eventiva/integrations.sql/router';
import { memory } from '@eventiva/integrations.sql/sqlite';
import { storage } from '@eventiva/integrations.sql/storage';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { identityModule, identitySecurity } from '@eventiva/runtime/identity';
import { Approvals, canonicalJson, InputDigest, InvocationDenied, type Approval } from '@eventiva/runtime/invocation';
import { durable } from '@eventiva/runtime/storage';
import { describe, expect, it } from '@effect/vitest';
import { ConfigProvider, Context, Deferred, Effect, Either, Exit, Fiber, Layer, Ref, Schema, TestClock } from 'effect';

const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const caller = Schema.decodeUnknownSync(CallerIdentity)({
    subject: id(1),
    session: id(2),
    tenant: id(3),
    kind: 'human',
});
const viewer = Schema.decodeUnknownSync(CallerIdentity)({
    subject: id(4),
    session: id(5),
    tenant: id(3),
    kind: 'human',
});
const agent = Schema.decodeUnknownSync(CallerIdentity)({
    subject: id(6),
    session: id(7),
    tenant: id(3),
    kind: 'first-party-agent',
    onBehalfOf: viewer.subject,
});
const role = RoleId.make(id(8));
const viewerRole = RoleId.make(id(9));
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
const target = new URL(local);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.pathname !== '/eventiva_test')
    throw new Error('Identity conformance requires disposable loopback eventiva_test');
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
const database = (dialect: Dialect) =>
    Effect.gen(function* () {
        let connection;
        if (dialect === 'postgres') {
            const admin = Context.get(yield* Layer.build(pg(local)), SqlClient.SqlClient);
            const name = `identity_${randomUUID().replaceAll('-', '')}`;
            yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
            yield* Effect.addFinalizer(() => admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie));
            const url = new URL(local);
            url.pathname = `/${name}`;
            connection = yield* Layer.build(pg(url.toString()));
        } else connection = yield* Layer.build(memory());
        const sql = Context.get(connection, SqlClient.SqlClient);
        yield* migrate(
            dialect,
            yield* load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url)))
        ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
        return sql;
    });
const fixture = (dialect: Dialect) =>
    Effect.gen(function* () {
        yield* TestClock.setTime(1000);
        const sql = yield* database(dialect);
        const tenant = Layer.succeed(CurrentTenant, { id: caller.tenant! });
        const sqlLayer = Layer.succeed(SqlClient.SqlClient, sql);
        const context = Layer.mergeAll(
            tenant,
            identityStore.pipe(Layer.provide(tenant), Layer.provide(sqlLayer)),
            storage(dialect).pipe(Layer.provide(sqlLayer))
        );
        const store = Context.get(yield* Layer.build(context), IdentityStore);
        yield* store.put(
            'role',
            {
                id: role,
                name: 'Admin',
                grants: [
                    'identity.organization.read',
                    'identity.organization.write',
                    'identity.profile.read',
                    'identity.profile.write',
                    'identity.membership.write',
                    'identity.audit.read',
                ].map((permission) => ({ permission, resources: ['*'] })),
            },
            null
        );
        yield* store.put(
            'role',
            {
                id: viewerRole,
                name: 'Viewer',
                grants: [{ permission: 'identity.profile.read', resources: [viewer.subject] }],
            },
            null
        );
        for (const c of [caller, viewer, agent]) {
            yield* store.put('principal', { id: c.subject, kind: c.kind, active: true }, null);
            yield* store.put(
                'membership',
                { id: c.subject, active: true, roles: [c === viewer ? viewerRole : role] },
                null
            );
            yield* store.put(
                'session',
                {
                    id: c.session,
                    subject: c.subject,
                    active: true,
                    expiresAt: 10000,
                    delegation:
                        c === agent
                            ? {
                                  human: viewer.subject,
                                  session: viewer.session,
                                  expiresAt: 9000,
                                  grants: [{ permission: 'identity.profile.write', resources: ['*'] }],
                              }
                            : null,
                },
                null
            );
        }
        const approvals = yield* Ref.make<ReadonlyMap<string, Approval>>(new Map());
        const approve = (action: string, input: JsonValue) =>
            Ref.update(approvals, (current) =>
                new Map(current).set('proof', {
                    principal: caller.subject,
                    tenant: caller.tenant,
                    action,
                    version: 1,
                    inputHash: digest(Either.getOrThrow(canonicalJson(input))),
                    limits: {},
                    approver: { ...caller, subject: SubjectId.make(id(10)) },
                    issuedAt: 1000,
                    expiresAt: 9000,
                    stepUp: true,
                })
            );
        const platform = Layer.mergeAll(
            Layer.succeed(InputDigest, { digest: (canonical) => Effect.sync(() => digest(canonical)) }),
            Layer.succeed(Approvals, {
                get: (key) =>
                    Ref.get(approvals).pipe(
                        Effect.flatMap((entries) => {
                            const approval = entries.get(key);
                            return approval
                                ? Effect.succeed(approval)
                                : Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'missing' }));
                        })
                    ),
            }),
            Layer.succeed(Flags, {
                evaluate: (flag) => Effect.succeed({ flag: flag.key, value: true, fallback: false, reason: 'TEST' }),
            })
        );
        const host = ActionHostLive.pipe(
            Layer.provide(identitySecurity),
            Layer.provide(durable),
            Layer.provide(context),
            Layer.provide(platform)
        );
        return { sql, store, context, host, approve };
    });

for (const dialect of ['postgres', 'sqlite'] as const)
    describe(`${dialect} identity foundation`, () => {
        it.scoped(
            'stable issuer/subject links never silently relink, collide across issuers or authorize another database',
            () =>
                Effect.gen(function* () {
                    const f = yield* fixture(dialect);
                    const external = { issuer: 'https://enterprise-a.test', subject: 'same-subject' };
                    yield* f.store.link(external, caller.subject);
                    yield* f.store.link(external, caller.subject);
                    expect(yield* f.store.lookup(external)).toBe(caller.subject);
                    expect(yield* Effect.either(f.store.link(external, viewer.subject))).toMatchObject({
                        _tag: 'Left',
                    });
                    yield* f.store.link({ ...external, issuer: 'https://enterprise-b.test' }, viewer.subject);
                    expect(yield* f.store.lookup({ ...external, issuer: 'https://enterprise-b.test' })).toBe(
                        viewer.subject
                    );
                    expect(
                        yield* f.store.lookup({ ...external, issuer: 'https://enterprise-a.test/' })
                    ).toBeUndefined();
                    const team = { id: TeamId.make(id(51)), name: 'Crew', members: [caller.subject], roles: [role] };
                    yield* f.store.put('team', team, null);
                    yield* f.store.put('team', { ...team, id: TeamId.make(id(52)), members: [viewer.subject] }, null);
                    expect(yield* f.store.teams(caller.subject)).toEqual([team]);
                    expect(
                        yield* Effect.either(f.store.link({ ...external, subject: 'missing' }, SubjectId.make(id(99))))
                    ).toMatchObject({ _tag: 'Left' });
                    // A separate physical DB knows nothing about the same external key or canonical subject.
                    const sqlB = yield* database(dialect);
                    const storeB = Context.get(
                        yield* Layer.build(
                            identityStore.pipe(
                                Layer.provide(Layer.succeed(SqlClient.SqlClient, sqlB)),
                                Layer.provide(Layer.succeed(CurrentTenant, { id: TenantId.make(id(100)) }))
                            )
                        ),
                        IdentityStore
                    );
                    expect(yield* storeB.lookup(external)).toBeUndefined();
                    expect(yield* storeB.get('principal', caller.subject)).toBeUndefined();
                    const routed = router(
                        () => Effect.fail(new RoutingDenied({ reason: 'must-not-resolve' })),
                        () => Effect.void
                    );
                    expect(
                        yield* Effect.either(
                            TenantRouter.pipe(
                                Effect.flatMap((r) => r.run(TenantId.make(id(100)), Effect.void)),
                                Effect.provide(routed),
                                Effect.provideService(Caller, caller)
                            )
                        )
                    ).toMatchObject({ left: { _tag: 'RoutingDenied', reason: 'authenticated tenant scope required' } });
                    yield* f.sql`UPDATE identity_principal SET body = ${'{"invalid":true}'} WHERE id = ${caller.subject}`;
                    expect(yield* Effect.either(f.store.get('principal', caller.subject))).toMatchObject({
                        _tag: 'Left',
                    });
                    yield* f.sql`UPDATE identity_principal SET body = ${JSON.stringify({ id: viewer.subject, active: true, kind: 'human' })} WHERE id = ${caller.subject}`;
                    expect(yield* Effect.either(f.store.get('principal', caller.subject))).toMatchObject({
                        _tag: 'Left',
                    });
                    expect(yield* Effect.either(f.store.audit(101))).toMatchObject({ _tag: 'Left' });
                })
        );

        it.scoped(
            'ActionHost atomically persists identity and one receipt, rejects viewers and agents, and revalidates replays',
            () =>
                Effect.gen(function* () {
                    const f = yield* fixture(dialect);
                    yield* Effect.gen(function* () {
                        const host = yield* ActionHost;
                        yield* host.register(yield* identityModule.pipe(Effect.provide(f.context)));
                        let count = 0;
                        const execute = (name: string, input: JsonValue, c = caller, options = {}) =>
                            host.execute(name, input, options).pipe(
                                Effect.tap(() =>
                                    Effect.sync(() => {
                                        count++;
                                    })
                                ),
                                Effect.provideService(Caller, c)
                            );
                        const org = { value: { id: 'organization', name: 'Tenant A' }, expectedVersion: null };
                        expect(
                            (yield* execute('identity.organization.set', org, caller, { idempotencyKey: 'org' }))
                                .receipt.outcome
                        ).toBe('denied');
                        expect(yield* f.store.get('organization', 'organization')).toBeUndefined();
                        yield* f.approve('identity.organization.set', org);
                        expect(
                            Exit.isSuccess(
                                (yield* execute('identity.organization.set', org, caller, {
                                    idempotencyKey: 'org',
                                    approvalId: 'proof',
                                })).result
                            )
                        ).toBe(true);
                        expect(
                            (yield* execute('identity.organization.set', org, caller, {
                                idempotencyKey: 'org',
                                approvalId: 'proof',
                            })).replayed
                        ).toBe(true);
                        expect((yield* f.store.get('organization', 'organization'))?.version).toBe(0);
                        const input = {
                            value: { id: caller.subject, displayName: 'Secret Profile' },
                            expectedVersion: null,
                        };
                        expect(
                            Exit.isSuccess(
                                (yield* execute('identity.profile.set', input, caller, { idempotencyKey: 'profile' }))
                                    .result
                            )
                        ).toBe(true);
                        for (const c of [viewer, agent])
                            expect(
                                (yield* execute('identity.profile.set', input, c, { idempotencyKey: 'forged' })).receipt
                                    .outcome
                            ).toBe('denied');
                        expect(
                            (yield* execute('identity.profile.get', { subject: caller.subject }, viewer)).receipt
                                .outcome
                        ).toBe('denied');
                        expect((yield* execute('identity.audit.list', { limit: 100 }, viewer)).receipt.outcome).toBe(
                            'denied'
                        );
                        expect(
                            (yield* execute('identity.profile.get', { subject: caller.subject })).result
                        ).toMatchObject({ value: { value: input.value, version: 0 } });
                        expect(
                            (yield* execute(
                                'identity.profile.set',
                                { ...input, value: { ...input.value, displayName: 'Changed' } },
                                caller,
                                { idempotencyKey: 'profile' }
                            )).receipt.outcome
                        ).toBe('denied');
                        yield* f.store.put('role', { id: role, name: 'Revoked', grants: [] }, 0);
                        expect(
                            (yield* execute('identity.profile.set', input, caller, { idempotencyKey: 'profile' }))
                                .receipt.outcome
                        ).toBe('denied');
                        const rows = yield* f.sql<{ receipt: string }>`SELECT receipt FROM action_receipt`;
                        expect(rows).toHaveLength(count);
                        expect(JSON.stringify(rows)).not.toContain('Secret Profile');
                        expect(JSON.stringify(rows)).not.toContain('Changed');
                        expect(yield* f.sql`SELECT * FROM action_commit WHERE result IS NOT NULL`).toHaveLength(2);
                        const membership = (yield* f.store.get('membership', caller.subject))!;
                        yield* f.store.put(
                            'role',
                            {
                                id: role,
                                name: 'Admin again',
                                grants: [{ permission: 'identity.audit.read', resources: ['audit'] }],
                            },
                            1
                        );
                        const audit = yield* execute('identity.audit.list', { limit: 100 });
                        expect(Exit.isSuccess(audit.result)).toBe(true);
                        if (Exit.isSuccess(audit.result)) expect(audit.result.value).toHaveLength(count - 1);
                        expect(
                            yield* Effect.either(
                                IdentityStore.pipe(
                                    Effect.flatMap((store) => store.audit(100)),
                                    Effect.provide(identityStore),
                                    Effect.provideService(SqlClient.SqlClient, f.sql),
                                    Effect.provideService(CurrentTenant, { id: TenantId.make(id(100)) })
                                )
                            )
                        ).toMatchObject({ left: { _tag: 'StorageFailure' } });
                        yield* f.store.put('membership', { ...membership.value, active: false }, membership.version);
                        expect((yield* execute('identity.audit.list', { limit: 100 })).receipt.outcome).toBe('denied');
                    }).pipe(Effect.provide(f.host));
                })
        );

        it.scoped('identity diagnostics and public action failures never disclose stored invalid data', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const secret = 'synthetic-private-identity-sentinel';
                yield* f.store.put('organization', { id: 'organization', name: 'Valid' }, null);
                yield* f.sql`UPDATE identity_organization SET body = ${JSON.stringify({ id: 'organization', name: { secret } })}`;
                const invalid = yield* Effect.flip(f.store.get('organization', 'organization'));
                expect(invalid).toMatchObject({ operation: 'identity', reason: 'invalid-data' });
                expect(invalid).not.toHaveProperty('cause');
                expect(JSON.stringify(invalid)).not.toContain(secret);
                yield* Effect.gen(function* () {
                    const host = yield* ActionHost;
                    yield* host.register(yield* identityModule.pipe(Effect.provide(f.context)));
                    const result = yield* host
                        .execute('identity.organization.get', {})
                        .pipe(Effect.provideService(Caller, caller));
                    expect(Exit.isFailure(result.result)).toBe(true);
                    expect(JSON.stringify(result)).not.toContain(secret);
                    const receipts = yield* f.sql<{ receipt: string }>`SELECT receipt FROM action_receipt`;
                    expect(receipts).toHaveLength(1);
                    expect(JSON.stringify(receipts)).not.toContain(secret);
                }).pipe(Effect.provide(f.host));
                yield* f.sql`DROP TABLE identity_organization`;
                const unavailable = yield* Effect.flip(f.store.get('organization', secret));
                expect(unavailable).toMatchObject({ operation: 'identity', reason: 'database' });
                expect(unavailable).not.toHaveProperty('cause');
                expect(JSON.stringify(unavailable)).not.toContain(secret);
                yield* f.sql`DELETE FROM identity_guard`;
                expect(yield* Effect.flip(f.store.lock)).toMatchObject({
                    operation: 'identity',
                    reason: 'identity-guard-missing',
                });
            })
        );

        it.scoped('CAS conflicts and audit failures roll back identity changes; missing guard fails closed', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const s = Context.get(yield* Layer.build(f.context), Storage);
                yield* f.store.put('profile', { id: caller.subject, displayName: 'Original' }, null);
                const competing = yield* Effect.all(
                    [
                        f.store.put('profile', { id: caller.subject, displayName: 'Left' }, 0).pipe(Effect.either),
                        f.store.put('profile', { id: caller.subject, displayName: 'Right' }, 0).pipe(Effect.either),
                    ],
                    { concurrency: 'unbounded' }
                );
                expect(competing.filter(Either.isRight)).toHaveLength(1);
                expect(competing.filter(Either.isLeft)).toHaveLength(1);
                const profile = (yield* f.store.get('profile', caller.subject))!;
                const failed = s.commit(
                    { key: 'rollback', inputHash: 'hash' },
                    Effect.gen(function* () {
                        yield* f.store.put(
                            'profile',
                            { ...profile.value, displayName: 'Must rollback' },
                            profile.version
                        );
                        return { output: null, receipt: { inputHash: 'hash' } };
                    })
                );
                // Make the append fail after the mutation, not just the readiness preflight.
                yield* f.sql`DROP TABLE action_receipt`;
                expect(yield* Effect.either(failed)).toMatchObject({ _tag: 'Left' });
                expect(yield* f.store.get('profile', caller.subject)).toEqual(profile);
                expect(yield* f.sql`SELECT * FROM action_commit`).toHaveLength(0);
                expect(yield* Effect.either(f.store.audit(1))).toMatchObject({ _tag: 'Left' });
                // Storage outages remain typed failures, never empty identities, links or grants.
                yield* f.sql`DROP TABLE identity_organization`;
                yield* f.sql`DROP TABLE identity_team`;
                yield* f.sql`DROP TABLE identity_federation`;
                for (const operation of [
                    f.store.get('organization', 'organization').pipe(Effect.asVoid),
                    f.store.put('organization', { id: 'organization', name: 'Unavailable' }, null),
                    f.store.teams(caller.subject).pipe(Effect.asVoid),
                    f.store.lookup({ issuer: 'https://issuer.test', subject: 'external' }).pipe(Effect.asVoid),
                    f.store.link({ issuer: 'https://issuer.test', subject: 'external' }, caller.subject),
                ])
                    expect(yield* Effect.either(operation)).toMatchObject({ left: { _tag: 'StorageFailure' } });
                yield* f.sql`DELETE FROM identity_guard`;
                expect(yield* Effect.either(f.store.lock)).toMatchObject({ _tag: 'Left' });
                expect(
                    yield* Effect.either(
                        f.store.put('team', { id: TeamId.make(id(55)), name: 'No lock', members: [], roles: [] }, null)
                    )
                ).toMatchObject({ _tag: 'Left' });
            })
        );

        if (dialect === 'postgres')
            it.scoped('revocation committed while a writer waits for the identity guard prevents execution', () =>
                Effect.gen(function* () {
                    const f = yield* fixture(dialect);
                    yield* Effect.gen(function* () {
                        const host = yield* ActionHost;
                        yield* host.register(yield* identityModule.pipe(Effect.provide(f.context)));
                        const held = yield* Deferred.make<void>();
                        const release = yield* Deferred.make<void>();
                        const revoker = yield* Effect.fork(
                            f.sql.withTransaction(
                                Effect.gen(function* () {
                                    yield* f.store.lock;
                                    yield* Deferred.succeed(held, undefined);
                                    yield* Deferred.await(release);
                                    yield* f.store.put(
                                        'membership',
                                        { id: caller.subject, active: false, roles: [role] },
                                        0
                                    );
                                })
                            )
                        );
                        yield* Deferred.await(held);
                        const writer = yield* Effect.fork(
                            host
                                .execute(
                                    'identity.profile.set',
                                    {
                                        value: { id: caller.subject, displayName: 'Denied after wait' },
                                        expectedVersion: null,
                                    },
                                    { idempotencyKey: 'waiting' }
                                )
                                .pipe(Effect.provideService(Caller, caller))
                        );
                        // Observe the database lock wait, not merely a fork that might start after revocation.
                        let waiting = false;
                        for (let attempt = 0; attempt < 200; attempt++) {
                            const rows =
                                yield* f.sql`SELECT pid FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock' AND query LIKE 'UPDATE identity_guard SET version%'`;
                            if (rows.length > 0) {
                                waiting = true;
                                break;
                            }
                            yield* Effect.yieldNow();
                        }
                        expect(waiting).toBe(true);
                        yield* Deferred.succeed(release, undefined);
                        yield* Fiber.join(revoker);
                        expect((yield* Fiber.join(writer)).receipt.outcome).toBe('denied');
                        expect(yield* f.store.get('profile', caller.subject)).toBeUndefined();
                    }).pipe(Effect.provide(f.host));
                })
            );
    });
