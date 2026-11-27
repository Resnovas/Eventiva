/**
 * @file apps/server/tests/session-renewal.spec.ts
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
import { describe, expect, it } from '@effect/vitest';
import { Flags } from '@eventiva/contracts/flags';
import { IdentitySession, IdentityStore, type IdentityRecords } from '@eventiva/contracts/identity';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant, type JsonValue, Storage, StorageFailure } from '@eventiva/contracts/storage';
import { closeOidcSession } from '@eventiva/integrations.oidc/session';
import { type OidcAccessClaims, type OidcVerifier, OidcTokenRejected } from '@eventiva/integrations.oidc/token';
import { identityStore } from '@eventiva/integrations.sql/identity';
import { type Dialect, load, migrate } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { memory } from '@eventiva/integrations.sql/sqlite';
import { storage } from '@eventiva/integrations.sql/storage';
import { identitySecurity } from '@eventiva/runtime/identity';
import { InputDigest } from '@eventiva/runtime/invocation';
import { ConfigProvider, Context, Deferred, Effect, Fiber, Layer, Redacted, Ref, Schema, TestClock } from 'effect';
import { openOidcSessionWithPolicy } from '../src/approval-consent.ts';
import { IdentitySessionPolicy, identitySessionPolicy } from '../src/identity-session-policy.ts';
import { InteractiveIngress, SessionRenewal, sessionRenewal } from '../src/session-renewal.ts';

const tenant = TenantId.make('019b0000-0000-7000-8000-000000000901');
const subject = SubjectId.make('019b0000-0000-7000-8000-000000000902');
const session = SessionId.make('019b0000-0000-7000-8000-000000000903');
const issuer = 'https://renewal.fixture.invalid';
const start = 1_000_000;
const initial = { tenant, sessionLifetimeMs: 3_600_000, approvalWindowMs: 300_000 };
const registrations: ReadonlyArray<typeof InteractiveIngress.Type> = [
    { route: '/interactive/save', clientId: 'web', surface: 'web', activity: 'human-mutation' },
    { route: '/interactive/view', clientId: 'web', surface: 'web', activity: 'interactive-read' },
    { route: '/interactive/navigate', clientId: 'native', surface: 'native', activity: 'navigation' },
];
const bearer = Redacted.make('synthetic-boundary-token-never-persist');

/** Own one physical engine with production migrations, IdentityStore, Storage and identity resolution; only OIDC verification is controlled. */
const fixture = (dialect: Dialect) =>
    Effect.gen(
        /** Keep PostgreSQL non-superuser/SCRAM setup in the existing immutable fixture helper and close owned databases on exit. */
        function* () {
            let sql: SqlClient.SqlClient;
            if (dialect === 'sqlite') sql = Context.get(yield* Layer.build(memory()), SqlClient.SqlClient);
            else {
                const url = new URL(
                    process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test'
                );
                expect(['127.0.0.1', 'localhost', '[::1]']).toContain(url.hostname);
                expect(url.pathname).toBe('/eventiva_test');
                /** Build the existing client without mutating process configuration or logging its credentials. */
                const pg = (endpoint: URL) =>
                    client.pipe(
                        Layer.provide(
                            Layer.setConfigProvider(
                                ConfigProvider.fromMap(new Map([['DATABASE_URL', endpoint.toString()]]))
                            )
                        )
                    );
                const admin = Context.get(yield* Layer.build(pg(url)), SqlClient.SqlClient);
                const name = `renewal_${randomUUID().replaceAll('-', '')}`;
                yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                yield* Effect.addFinalizer(
                    /** Terminate only this fixture's owned connections and remove its disposable database. */
                    () =>
                        admin`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ${name} AND usename = current_user AND pid <> pg_backend_pid()`.pipe(
                            Effect.zipRight(admin`DROP DATABASE ${admin(name)}`),
                            Effect.orDie
                        )
                );
                url.pathname = `/${name}`;
                sql = Context.get(yield* Layer.build(pg(url)), SqlClient.SqlClient);
            }
            yield* migrate(
                dialect,
                yield* load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url)))
            ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            yield* TestClock.setTime(start);
            const enabled = yield* Ref.make(true);
            const policySource = yield* Ref.make<JsonValue | undefined>(initial);
            const claims = yield* Ref.make<OidcAccessClaims>({
                issuer,
                subject: 'external-human',
                session,
                clientId: 'web',
                audiences: ['api'],
                scopes: ['invoke'],
                notBefore: 0,
                expiresAt: start + 100_000_000,
            });
            const rejectToken = yield* Ref.make(false);
            const verifier: OidcVerifier = {
                issuer,
                /** Control already-normalized verified claims; cryptographic JWT validation has its own real OIDC suite. */
                verify: () =>
                    Ref.get(rejectToken).pipe(
                        Effect.flatMap(
                            /** An invalid bearer cannot become trusted activity even when route/client strings match. */
                            (reject) =>
                                reject ? Effect.fail(new OidcTokenRejected({ reason: 'invalid' })) : Ref.get(claims)
                        )
                    ),
            };
            const base = Layer.mergeAll(
                Layer.succeed(SqlClient.SqlClient, sql),
                Layer.succeed(CurrentTenant, { id: tenant }),
                Layer.succeed(Flags, {
                    /** Answer the optional renewal flag from live test state, preserving its actual safe default otherwise. */
                    evaluate: (flag) =>
                        Ref.get(enabled).pipe(
                            Effect.map(
                                /** Keep the result shape identical to the production flag port. */
                                (value) => ({ flag: flag.key, value, fallback: false, reason: 'FIXTURE' })
                            )
                        ),
                }),
                Layer.succeed(InputDigest, {
                    /** Use actual SHA-256, independently assert that raw bearer/subject data never reaches receipts. */
                    digest: (value) =>
                        Effect.sync(
                            /** Hash only the provided canonical bytes. */ () =>
                                createHash('sha256').update(value).digest('hex')
                        ),
                })
            );
            const persisted = Layer.mergeAll(
                identityStore,
                storage(dialect),
                identitySessionPolicy(Ref.get(policySource))
            ).pipe(Layer.provideMerge(base));
            const context = yield* Layer.build(identitySecurity.pipe(Layer.provideMerge(persisted)));
            const store = Context.get(context, IdentityStore);
            const db = Context.get(context, Storage);
            const policy = Context.get(context, IdentitySessionPolicy);
            yield* store.put('principal', { id: subject, kind: 'human', active: true }, null);
            yield* store.put('membership', { id: subject, roles: [], active: true }, null);
            yield* store.link({ issuer, subject: 'external-human' }, subject);
            yield* db.transaction(openOidcSessionWithPolicy(yield* Ref.get(claims)).pipe(Effect.provide(context)));
            /** Construct the real capability under controlled boundary variants without replacing storage semantics. */
            const build = (ids = store, database = db, entries = registrations, routeTenant = tenant) =>
                Layer.build(
                    sessionRenewal(verifier, entries).pipe(
                        Layer.provide(
                            Layer.succeedContext(
                                context.pipe(
                                    Context.add(IdentityStore, ids),
                                    Context.add(Storage, database),
                                    Context.add(CurrentTenant, { id: routeTenant })
                                )
                            )
                        )
                    )
                ).pipe(
                    Effect.map(
                        /** Extract the public capability without exposing private implementation helpers. */ (value) =>
                            Context.get(value, SessionRenewal)
                    )
                );
            const service = yield* build();
            /** Read the actual persisted session and fail the test explicitly if issuance did not occur. */
            const read = store.get('session', session).pipe(
                Effect.map(
                    /** Retain optimistic versions so denied attempts cannot conceal a write. */
                    (value) => {
                        // Missing issuance is a broken fixture, never an optional result that a later assertion may skip.
                        expect(value).toBeDefined();
                        return value!;
                    }
                )
            );
            return {
                sql,
                store,
                db,
                policy,
                policySource,
                claims,
                enabled,
                rejectToken,
                context,
                build,
                service,
                read,
            };
        }
    );

describe('trusted real-activity session renewal', /** Exercise the same public capability against both production SQL dialects. */ () => {
    // SQL serialization and rollback differ between engines; neither dialect may substitute for the other's acceptance.
    for (const dialect of ['sqlite', 'postgres'] as const) {
        it.scoped(
            `${dialect}: slides only real activity, never the original absolute anchor, and caps consent`,
            /** Exact independent deadlines distinguish rolling idle, absolute cap and token lifetime. */ () =>
                Effect.gen(
                    /** Persist repeated half-hour human activity until the eight-hour boundary without advancing the sign-in anchor. */
                    function* () {
                        // Reusing one persisted session makes an accidental absolute-anchor reset observable after repeated activity.
                        const f = yield* fixture(dialect);
                        expect((yield* f.read).value).toMatchObject({
                            expiresAt: 4_600_000,
                            activity: { issuedAt: start, absoluteExpiresAt: 29_800_000 },
                        });
                        for (let halfHour = 1; halfHour <= 15; halfHour++) {
                            yield* TestClock.setTime(start + halfHour * 1_800_000);
                            expect(yield* f.service.renew('/interactive/save', bearer)).toEqual({
                                expiresAt: Math.min(start + (halfHour + 2) * 1_800_000, 29_800_000),
                            });
                        }
                        const last = yield* f.read;
                        expect(last.value.activity?.issuedAt).toBe(start);
                        expect(last.value.activity?.absoluteExpiresAt).toBe(29_800_000);
                        yield* TestClock.setTime(29_799_999);
                        expect(yield* f.service.renew('/interactive/view', bearer)).toEqual({ expiresAt: 29_800_000 });
                        expect(yield* f.policy.approvalExpiresAt({ tenant, expiresAt: 29_800_000 })).toBe(29_800_000);
                        yield* TestClock.setTime(29_800_000);
                        expect(yield* Effect.flip(f.service.renew('/interactive/save', bearer))).toMatchObject({
                            reason: 'denied',
                        });
                        const receipts = yield* f.store.audit(100);
                        expect(receipts).toHaveLength(16);
                        expect(
                            new Set(
                                receipts.map(
                                    /** Audit identities must not deduplicate separate accepted activity. */ (
                                        receipt
                                    ) => receipt.id
                                )
                            ).size
                        ).toBe(16);
                        const wire = JSON.stringify(receipts);
                        expect(wire).not.toContain(Redacted.value(bearer));
                        expect(wire).not.toContain('external-human');
                    }
                ),
            60_000
        );

        it.scoped(
            `${dialect}: excludes CLI/background/token refresh and supports native activity on the same session`,
            /** A shared first-party token is not proof of activity and a CLI client cannot borrow a web route. */ () =>
                Effect.gen(
                    /** Compare actual versions around each denied or idempotent operation, then accept the registered native route. */
                    function* () {
                        // Refreshing the same provider session must be idempotent, not another human-activity signal.
                        const f = yield* fixture(dialect);
                        yield* TestClock.setTime(start + 900_000);
                        const before = yield* f.read;
                        for (const route of [
                            '/poll',
                            '/prefetch',
                            '/background-sync',
                            '/token-refresh',
                            '/cli/interactive',
                            '/interactive/save/other',
                        ])
                            expect(yield* Effect.flip(f.service.renew(route, bearer))).toMatchObject({
                                reason: 'denied',
                            });
                        yield* f.db.transaction(
                            openOidcSessionWithPolicy(yield* Ref.get(f.claims)).pipe(Effect.provide(f.context))
                        );
                        expect(yield* f.read).toEqual(before);
                        yield* Ref.update(
                            f.claims,
                            /** A CLI token cannot claim web/native classification. */ (value) => ({
                                ...value,
                                clientId: 'cli',
                            })
                        );
                        expect(yield* Effect.flip(f.service.renew('/interactive/view', bearer))).toMatchObject({
                            reason: 'denied',
                        });
                        yield* Ref.update(
                            f.claims,
                            /** The native app may supply real activity for this same canonical sign-in session. */ (
                                value
                            ) => ({ ...value, clientId: 'native' })
                        );
                        expect(yield* f.service.renew('/interactive/navigate', bearer)).toEqual({
                            expiresAt: 5_500_000,
                        });
                        expect((yield* f.read).value.activity?.issuedAt).toBe(start);
                    }
                ),
            60_000
        );

        it.scoped(
            `${dialect}: denies exact idle expiry, revocation, legacy metadata and live membership/agent loss`,
            /** No expired, revoked or non-human authority can be resurrected by presenting a live bearer. */ () =>
                Effect.gen(
                    /** Restore fixture state only between independent denial controls; never weaken the accepting path. */
                    function* () {
                        // Keep expired-session and identity-loss controls independent so an earlier denial cannot mask a later missing check.
                        const f = yield* fixture(dialect);
                        const original = (yield* f.read).value;
                        yield* TestClock.setTime(4_600_000);
                        expect(yield* Effect.flip(f.service.renew('/interactive/save', bearer))).toMatchObject({
                            reason: 'denied',
                        });
                        yield* TestClock.setTime(start + 1);
                        for (const change of ['revoke', 'legacy', 'membership', 'agent'] as const) {
                            if (change === 'revoke') yield* closeOidcSession(session).pipe(Effect.provide(f.context));
                            if (change === 'legacy') {
                                const { activity: _, ...legacy } = original;
                                yield* f.store.put('session', legacy, (yield* f.read).version);
                            }
                            if (change === 'membership')
                                yield* f.store.put('membership', { id: subject, roles: [], active: false }, 0);
                            if (change === 'agent')
                                yield* f.store.put(
                                    'principal',
                                    { id: subject, kind: 'first-party-agent', active: true },
                                    0
                                );
                            const before = yield* f.read;
                            expect(yield* Effect.flip(f.service.renew('/interactive/save', bearer))).toMatchObject({
                                reason: 'denied',
                            });
                            expect(yield* f.read).toEqual(before);
                            yield* f.store.put('session', original, before.version);
                            if (change === 'membership')
                                yield* f.store.put('membership', { id: subject, roles: [], active: true }, 1);
                        }
                        expect(yield* f.store.audit(100)).toEqual([]);
                    }
                ),
            60_000
        );

        it.scoped(
            `${dialect}: rereads tightened policy, default-off flag and verified identity; bad settings cannot relax bounds`,
            /** Independent negative values expose ignored policy, missing admission checks and closed-error leakage. */ () =>
                Effect.gen(
                    /** Denial must leave SQL row and audit unchanged even when the token is otherwise valid. */
                    function* () {
                        // The same built capability must observe live policy/flag changes without a layer rebuild.
                        const f = yield* fixture(dialect);
                        const before = yield* f.read;
                        yield* TestClock.setTime(start + 400_000);
                        for (const settings of [
                            undefined,
                            { ...initial, sessionLifetimeMs: 3_600_001 },
                            { ...initial, sessionLifetimeMs: 300_000 },
                            { ...initial, tenant: '019b0000-0000-7000-8000-000000000999' },
                        ]) {
                            yield* Ref.set(f.policySource, settings);
                            expect(yield* Effect.either(f.service.renew('/interactive/save', bearer))).toMatchObject({
                                _tag: 'Left',
                            });
                        }
                        yield* Ref.set(f.policySource, initial);
                        yield* Ref.set(f.enabled, false);
                        expect(yield* Effect.flip(f.service.renew('/interactive/save', bearer))).toMatchObject({
                            reason: 'denied',
                        });
                        yield* Ref.set(f.enabled, true);
                        yield* Ref.set(f.rejectToken, true);
                        expect(yield* Effect.flip(f.service.renew('/interactive/save', bearer))).toMatchObject({
                            reason: 'denied',
                        });
                        yield* Ref.set(f.rejectToken, false);
                        const original = yield* Ref.get(f.claims);
                        for (const claims of [
                            { ...original, issuer: 'https://foreign.invalid' },
                            { ...original, subject: 'unlinked' },
                            { ...original, expiresAt: start + 400_000 },
                            { ...original, notBefore: start + 400_001 },
                        ]) {
                            yield* Ref.set(f.claims, claims);
                            expect(yield* Effect.flip(f.service.renew('/interactive/save', bearer))).toMatchObject({
                                reason: 'denied',
                            });
                        }
                        expect(yield* f.read).toEqual(before);
                        expect(yield* f.store.audit(100)).toEqual([]);
                        expect(
                            yield* Effect.flip(
                                f.build(
                                    f.store,
                                    f.db,
                                    registrations,
                                    TenantId.make('019b0000-0000-7000-8000-000000000999')
                                )
                            )
                        ).toMatchObject({ reason: 'denied' });
                    }
                ),
            60_000
        );

        it.scoped(
            `${dialect}: rolls back renewal on audit failure and permits explicit retry without moving sign-in`,
            /** Real SQL transaction rollback, not a mock identity snapshot, must undo the already-issued CAS. */ () =>
                Effect.gen(
                    /** Fail only the audit boundary while retaining the production transaction implementation. */
                    function* () {
                        // The failure happens after the real CAS, so unchanged version proves SQL rollback rather than early rejection.
                        const f = yield* fixture(dialect);
                        yield* TestClock.setTime(start + 300_000);
                        const before = yield* f.read;
                        const failing = yield* f.build(f.store, {
                            ...f.db,
                            /** Model loss of the required persistence sink after the real session write. */
                            audit: () => Effect.fail(new StorageFailure({ operation: 'audit', reason: 'database' })),
                        });
                        expect(yield* Effect.flip(failing.renew('/interactive/save', bearer))).toMatchObject({
                            reason: 'unavailable',
                        });
                        expect(yield* f.read).toEqual(before);
                        expect(yield* f.store.audit(100)).toEqual([]);
                        expect(yield* f.service.renew('/interactive/save', bearer)).toEqual({ expiresAt: 4_900_000 });
                        expect((yield* f.read).value.activity?.issuedAt).toBe(start);
                        expect(yield* f.store.audit(100)).toHaveLength(1);
                    }
                ),
            60_000
        );

        it.scoped(
            `${dialect}: samples time after contended guard acquisition and cannot resurrect an expired session`,
            /** Both contenders use the same real SQL guard/transaction; a pre-lock clock sample would wrongly accept. */ () =>
                Effect.gen(
                    /** Hold a transaction open, start renewal, cross the idle boundary, then release the lock. */
                    function* () {
                        // Explicit latches prove the competing operation reached the guard before the clock crosses expiry.
                        const f = yield* fixture(dialect);
                        const held = yield* Deferred.make<void>();
                        const release = yield* Deferred.make<void>();
                        const entered = yield* Deferred.make<void>();
                        const holder = yield* Effect.fork(
                            f.db.transaction(
                                f.store.lock.pipe(
                                    Effect.zipRight(Deferred.succeed(held, undefined)),
                                    Effect.zipRight(Deferred.await(release))
                                )
                            )
                        );
                        yield* Deferred.await(held);
                        const service = yield* f.build(f.store, {
                            ...f.db,
                            /** SQLite queues at connection acquisition, before the first statement; latch before that queue. */
                            transaction: (effect) =>
                                Deferred.succeed(entered, undefined).pipe(Effect.zipRight(f.db.transaction(effect))),
                        });
                        yield* TestClock.setTime(4_599_999);
                        const renewal = yield* Effect.fork(Effect.either(service.renew('/interactive/save', bearer)));
                        yield* Deferred.await(entered);
                        expect(yield* Fiber.poll(renewal)).toMatchObject({ _tag: 'None' });
                        yield* TestClock.setTime(4_600_000);
                        yield* Deferred.succeed(release, undefined);
                        yield* Fiber.join(holder);
                        expect(yield* Fiber.join(renewal)).toMatchObject({ _tag: 'Left', left: { reason: 'denied' } });
                        expect((yield* f.read).value.expiresAt).toBe(4_600_000);
                        expect(yield* f.store.audit(100)).toEqual([]);
                    }
                ),
            60_000
        );
    }
    it('validates lifecycle consistency and rejects noninteractive registration categories', /** Portable codecs reject contradictory records without needing a database to repair them. */ () => {
        // Move one invariant at a time so a mismatched expiry cannot hide a missing absolute-anchor check.
        for (const activity of ['polling', 'prefetch', 'background-sync', 'token-refresh', 'agent', 'cli'])
            expect(Schema.is(InteractiveIngress)({ ...registrations[0], activity })).toBe(false);
        expect(Schema.is(InteractiveIngress)({ ...registrations[0], surface: 'cli' })).toBe(false);
        const valid: IdentityRecords['session'] = {
            id: session,
            subject,
            active: true,
            delegation: null,
            expiresAt: 4_600_000,
            activity: {
                issuedAt: start,
                lastRealActivityAt: start,
                absoluteExpiresAt: 29_800_000,
                idleMs: 3_600_000,
                issuer,
                clientId: 'web',
            },
        };
        expect(Schema.is(IdentitySession)(valid)).toBe(true);
        for (const value of [
            { ...valid, expiresAt: 4_600_001 },
            { ...valid, activity: { ...valid.activity, absoluteExpiresAt: 29_800_001 } },
            { ...valid, activity: { ...valid.activity, lastRealActivityAt: start - 1 } },
        ])
            expect(Schema.is(IdentitySession)(value)).toBe(false);
    });
});
