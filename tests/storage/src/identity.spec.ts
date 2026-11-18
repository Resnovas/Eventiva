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

/** Produce stable fixture identities for tenant, session and principal boundary tests. */
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
/** Hash canonical fixture input exactly as approval binding expects. */
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
const target = new URL(local);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.pathname !== '/eventiva_test')
    throw new Error('Identity conformance requires disposable loopback eventiva_test');
/** Configure PostgreSQL only for an endpoint derived from the validated disposable target. */
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
/** Allocate a fresh migrated identity database with cleanup owned by the enclosing scope. */
const database = (dialect: Dialect) =>
    Effect.gen(
        /** Keep fixture state isolated across tests and across nested physical-database checks. */ function* () {
            // Unique PostgreSQL names and in-memory SQLite clients prevent identities leaking between cases.
            let connection;
            if (dialect === 'postgres') {
                const admin = Context.get(yield* Layer.build(pg(local)), SqlClient.SqlClient);
                const name = `identity_${randomUUID().replaceAll('-', '')}`;
                yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                yield* Effect.addFinalizer(
                    /** Drop only the fixture-owned database after its clients close. */ () =>
                        admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie)
                );
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
        }
    );
/** Seed administrator, restricted viewer and delegated-agent identities plus a durable ActionHost. */
const fixture = (dialect: Dialect) =>
    Effect.gen(
        /** Compose real SQL identity/security services with controllable approvals and enabled fixture flags. */ function* () {
            // Distinct role and delegation grants let public host calls test privilege intersection, not just store writes.
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
                    ].map(
                        /** Grant the administrator each tested permission across resource identifiers. */ (
                            permission
                        ) => ({ permission, resources: ['*'] })
                    ),
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
            /** Record a step-up proof bound to this caller, action, canonical input and fixed test-time window. */
            const approve = (action: string, input: JsonValue) =>
                Ref.update(
                    approvals,
                    /** Replace the fixture proof while retaining unrelated approval entries. */ (current) =>
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
                Layer.succeed(InputDigest, {
                    /** Match the approval's SHA-256 input binding. */ digest: (canonical) =>
                        Effect.sync(
                            /** Defer canonical hashing to execution of the digest port. */ () => digest(canonical)
                        )
                }),
                Layer.succeed(Approvals, {
                    /** Resolve only explicitly recorded fixture approval IDs; absence is denial. */
                    get: (key) =>
                        Ref.get(approvals).pipe(
                            Effect.flatMap(
                                /** Preserve a missing proof as an invocation denial rather than inventing approval. */ (
                                    entries
                                ) => {
                                    // An unknown proof id must not inherit another request's approval or a permissive fixture default.
                                    const approval = entries.get(key);
                                    return approval
                                        ? Effect.succeed(approval)
                                        : Effect.fail(
                                              new InvocationDenied({ action: '<approval>', reason: 'missing' })
                                          );
                                }
                            )
                        ),
                }),
                Layer.succeed(Flags, {
                    /** Enable identity behavior deterministically without using an external flag service. */
                    evaluate: (flag) =>
                        Effect.succeed({ flag: flag.key, value: true, fallback: false, reason: 'TEST' }),
                })
            );
            const host = ActionHostLive.pipe(
                Layer.provide(identitySecurity),
                Layer.provide(durable),
                Layer.provide(context),
                Layer.provide(platform)
            );
            return { sql, store, context, host, approve };
        }
    );

for (const dialect of ['postgres', 'sqlite'] as const)
    describe(`${dialect} identity foundation`, /** Register identity persistence and live security invariants for each SQL dialect. */ () => {
        // Shared scenarios require the same identity semantics; only the lock-observation race is PostgreSQL-specific.
        it.scoped(
            'stable issuer/subject links never silently relink, collide across issuers or authorize another database',
            /** Verify exact external-identity keys, physical tenant isolation and corrupt-row rejection. */ () =>
                Effect.gen(
                    /** Compare same-subject links across issuers before opening an independent tenant database. */ function* () {
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
                        const team = {
                            id: TeamId.make(id(51)),
                            name: 'Crew',
                            members: [caller.subject],
                            roles: [role]
                        };
                        yield* f.store.put('team', team, null);
                        yield* f.store.put(
                            'team',
                            { ...team, id: TeamId.make(id(52)), members: [viewer.subject] },
                            null
                        );
                        expect(yield* f.store.teams(caller.subject)).toEqual([team]);
                        expect(
                            yield* Effect.either(
                                f.store.link({ ...external, subject: 'missing' }, SubjectId.make(id(99)))
                            )
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
                            /** Fail if an unauthorized tenant request ever reaches database resolution. */ () =>
                                Effect.fail(new RoutingDenied({ reason: 'must-not-resolve' })),
                            /** Leave route policy permissive so authenticated tenant matching remains the tested boundary. */ () =>
                                Effect.void
                        );
                        expect(
                            yield* Effect.either(
                                TenantRouter.pipe(
                                    Effect.flatMap(
                                        /** Attempt a foreign tenant route with the unchanged caller identity. */ (r) =>
                                            r.run(TenantId.make(id(100)), Effect.void)
                                    ),
                                    Effect.provide(routed),
                                    Effect.provideService(Caller, caller)
                                )
                            )
                        ).toMatchObject({
                            left: { _tag: 'RoutingDenied', reason: 'authenticated tenant scope required' }
                        });
                        yield* f.sql`UPDATE identity_principal SET body = ${'{"invalid":true}'} WHERE id = ${caller.subject}`;
                        expect(yield* Effect.either(f.store.get('principal', caller.subject))).toMatchObject({
                            _tag: 'Left',
                        });
                        yield* f.sql`UPDATE identity_principal SET body = ${JSON.stringify({ id: viewer.subject, active: true, kind: 'human' })} WHERE id = ${caller.subject}`;
                        expect(yield* Effect.either(f.store.get('principal', caller.subject))).toMatchObject({
                            _tag: 'Left',
                        });
                        expect(yield* Effect.either(f.store.audit(101))).toMatchObject({ _tag: 'Left' });
                    }
                )
        );

        it.scoped(
            'ActionHost atomically persists identity and one receipt, rejects viewers and agents, and revalidates replays',
            /** Verify authorization, approval, idempotency and audit through public identity actions. */ () =>
                Effect.gen(
                    /** Supply a durable host while retaining direct SQL observations of committed evidence. */ function* () {
                        // Keep SQL observation outside host provision so adapter answers alone cannot prove durable receipts.
                        const f = yield* fixture(dialect);
                        yield* Effect.gen(
                            /** Exercise successful and denied actions with live role and membership changes. */ function* () {
                                // Public results and receipt rows must agree, including denials and reauthorized replays.
                                const host = yield* ActionHost;
                                yield* host.register(yield* identityModule.pipe(Effect.provide(f.context)));
                                let count = 0;
                                /** Execute as the supplied principal and count completed public invocations, including denials. */
                                const execute = (name: string, input: JsonValue, c = caller, options = {}) =>
                                    host.execute(name, input, options).pipe(
                                        Effect.tap(
                                            /** Track completed action receipts independently of their success or denial outcome. */ () =>
                                                Effect.sync(
                                                    /** Increment the expected durable receipt count after a host response. */ () => {
                                                        count++;
                                                    }
                                                )
                                        ),
                                        Effect.provideService(Caller, c)
                                    );
                                const org = { value: { id: 'organization', name: 'Tenant A' }, expectedVersion: null };
                                expect(
                                    (yield* execute('identity.organization.set', org, caller, {
                                        idempotencyKey: 'org'
                                    })).receipt.outcome
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
                                        (yield* execute('identity.profile.set', input, caller, {
                                            idempotencyKey: 'profile'
                                        })).result
                                    )
                                ).toBe(true);
                                for (const c of [viewer, agent])
                                    expect(
                                        (yield* execute('identity.profile.set', input, c, { idempotencyKey: 'forged' }))
                                            .receipt.outcome
                                    ).toBe('denied');
                                expect(
                                    (yield* execute('identity.profile.get', { subject: caller.subject }, viewer))
                                        .receipt.outcome
                                ).toBe('denied');
                                expect(
                                    (yield* execute('identity.audit.list', { limit: 100 }, viewer)).receipt.outcome
                                ).toBe('denied');
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
                                    (yield* execute('identity.profile.set', input, caller, {
                                        idempotencyKey: 'profile'
                                    })).receipt.outcome
                                ).toBe('denied');
                                const rows = yield* f.sql<{ receipt: string }>`SELECT receipt FROM action_receipt`;
                                expect(rows).toHaveLength(count);
                                expect(JSON.stringify(rows)).not.toContain('Secret Profile');
                                expect(JSON.stringify(rows)).not.toContain('Changed');
                                expect(yield* f.sql`SELECT * FROM action_commit WHERE result IS NOT NULL`).toHaveLength(
                                    2
                                );
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
                                            Effect.flatMap(
                                                /** Attempt audit access through a store bound to the wrong tenant. */ (
                                                    store
                                                ) => store.audit(100)
                                            ),
                                            Effect.provide(identityStore),
                                            Effect.provideService(SqlClient.SqlClient, f.sql),
                                            Effect.provideService(CurrentTenant, { id: TenantId.make(id(100)) })
                                        )
                                    )
                                ).toMatchObject({ left: { _tag: 'StorageFailure' } });
                                yield* f.store.put(
                                    'membership',
                                    { ...membership.value, active: false },
                                    membership.version
                                );
                                expect((yield* execute('identity.audit.list', { limit: 100 })).receipt.outcome).toBe(
                                    'denied'
                                );
                            }
                        ).pipe(Effect.provide(f.host));
                    }
                )
        );

        it.scoped(
            'identity diagnostics and public action failures never disclose stored invalid data',
            /** Verify corrupt identity data and storage outages stay sanitized through store and host boundaries. */ () =>
                Effect.gen(
                    /** Inject invalid stored payloads before checking direct and durable public failures. */ function* () {
                        // A stored sentinel must not escape via error fields, public results or retained receipts.
                        const f = yield* fixture(dialect);
                        const secret = 'synthetic-private-identity-sentinel';
                        yield* f.store.put('organization', { id: 'organization', name: 'Valid' }, null);
                        yield* f.sql`UPDATE identity_organization SET body = ${JSON.stringify({ id: 'organization', name: { secret } })}`;
                        const invalid = yield* Effect.flip(f.store.get('organization', 'organization'));
                        expect(invalid).toMatchObject({ operation: 'identity', reason: 'invalid-data' });
                        expect(invalid).not.toHaveProperty('cause');
                        expect(JSON.stringify(invalid)).not.toContain(secret);
                        yield* Effect.gen(
                            /** Execute the corrupt organization read through the real identity action host. */ function* () {
                                // The failure receipt is durable evidence, but it must not become a second copy of private input.
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
                            }
                        ).pipe(Effect.provide(f.host));
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
                    }
                )
        );

        it.scoped(
            'CAS conflicts and audit failures roll back identity changes; missing guard fails closed',
            /** Verify optimistic identity writes and durable receipts remain atomic under conflict and outage. */ () =>
                Effect.gen(
                    /** Race profile revisions and remove audit infrastructure after constructing a mutation. */ function* () {
                        const f = yield* fixture(dialect);
                        const s = Context.get(yield* Layer.build(f.context), Storage);
                        yield* f.store.put('profile', { id: caller.subject, displayName: 'Original' }, null);
                        const competing = yield* Effect.all(
                            [
                                f.store
                                    .put('profile', { id: caller.subject, displayName: 'Left' }, 0)
                                    .pipe(Effect.either),
                                f.store
                                    .put('profile', { id: caller.subject, displayName: 'Right' }, 0)
                                    .pipe(Effect.either),
                            ],
                            { concurrency: 'unbounded' }
                        );
                        expect(competing.filter(Either.isRight)).toHaveLength(1);
                        expect(competing.filter(Either.isLeft)).toHaveLength(1);
                        const profile = (yield* f.store.get('profile', caller.subject))!;
                        const failed = s.commit(
                            { key: 'rollback', inputHash: 'hash' },
                            Effect.gen(
                                /** Stage a profile change that must roll back if the enclosing receipt append fails. */ function* () {
                                    yield* f.store.put(
                                        'profile',
                                        { ...profile.value, displayName: 'Must rollback' },
                                        profile.version
                                    );
                                    return { output: null, receipt: { inputHash: 'hash' } };
                                }
                            )
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
                                f.store.put(
                                    'team',
                                    { id: TeamId.make(id(55)), name: 'No lock', members: [], roles: [] },
                                    null
                                )
                            )
                        ).toMatchObject({ _tag: 'Left' });
                    }
                )
        );

        if (dialect === 'postgres')
            it.scoped(
                'revocation committed while a writer waits for the identity guard prevents execution',
                /** Verify post-lock authorization observes a revocation committed ahead of a blocked action. */ () =>
                    Effect.gen(
                        /** Construct the real SQL host for an observed PostgreSQL lock-order race. */ function* () {
                            // Retain the fixture outside host execution to coordinate a second SQL writer against its real guard.
                            const f = yield* fixture(dialect);
                            yield* Effect.gen(
                                /** Hold the identity guard until the action writer is visibly blocked, then commit revocation. */ function* () {
                                    const host = yield* ActionHost;
                                    yield* host.register(yield* identityModule.pipe(Effect.provide(f.context)));
                                    const held = yield* Deferred.make<void>();
                                    const release = yield* Deferred.make<void>();
                                    const revoker = yield* Effect.fork(
                                        f.sql.withTransaction(
                                            Effect.gen(
                                                /** Serialize revocation ahead of the waiting action under the same identity guard. */ function* () {
                                                    // The barrier keeps authorization state unchanged until the contender has reached the guard.
                                                    yield* f.store.lock;
                                                    yield* Deferred.succeed(held, undefined);
                                                    yield* Deferred.await(release);
                                                    yield* f.store.put(
                                                        'membership',
                                                        { id: caller.subject, active: false, roles: [role] },
                                                        0
                                                    );
                                                }
                                            )
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
                                }
                            ).pipe(Effect.provide(f.host));
                        }
                    )
            );
    });
