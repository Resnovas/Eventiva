/**
 * @file apps/server/tests/approval-consent.spec.ts
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
import { define, type ActionSpec } from '@eventiva/contracts/action';
import { ApprovalPreparation } from '@eventiva/contracts/approval';
import { Authorizer, Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Flags } from '@eventiva/contracts/flags';
import { IdentityStore, RoleId } from '@eventiva/contracts/identity';
import { CurrentTenant, JsonValue, RoutingDenied, Storage, UuidV7 } from '@eventiva/contracts/storage';
import { identityStore } from '@eventiva/integrations.sql/identity';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { sqlRouter, TenantSqlRouter } from '@eventiva/integrations.sql/router';
import { memory } from '@eventiva/integrations.sql/sqlite';
import { implement } from '@eventiva/runtime/action';
import { ActionHost } from '@eventiva/runtime/host';
import { identitySecurity } from '@eventiva/runtime/identity';
import { InputDigest } from '@eventiva/runtime/invocation';
import { Clock, ConfigProvider, Context, Effect, Layer, Ref, Schedule, Schema } from 'effect';
import { backend } from '../src/backend.ts';
import { ClusterActions } from '../src/cluster-actions.ts';
import { DeploymentProfile } from '../src/cluster-profile.ts';
import { ClusterStatus } from '../src/cluster.ts';
import { cancelConsent, completeConsent, openOidcSessionWithPolicy, prepareConsent } from '../src/approval-consent.ts';
import { identitySessionPolicy } from '../src/identity-session-policy.ts';

/** Stable independent IDs make wrong-tenant identity, receipt and operational writes visible. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const human = Schema.decodeUnknownSync(CallerIdentity)({
    subject: id(1),
    session: id(2),
    tenant: id(3),
    kind: 'human',
});
const foreign = Schema.decodeUnknownSync(CallerIdentity)({ ...human, tenant: id(4) });
const agent = Schema.decodeUnknownSync(CallerIdentity)({
    ...human,
    subject: id(5),
    session: id(6),
    kind: 'external-agent',
    onBehalfOf: human.subject,
});
const target = define('fixture.consent.write', {
    version: 2,
    description: 'Write an exact registered synthetic tenant-local target.',
    input: Schema.Struct({ id: UuidV7, amount: Schema.NumberFromString }),
    output: Schema.Number,
    permission: 'fixture.consent.write',
    sideEffect: 'write',
    offline: 'online-only',
    approval: 'confirm',
});
const reviewed = Schema.Struct({ review: ApprovalPreparation, expiresAt: Schema.Number });
const issued = Schema.Struct({ id: UuidV7, expiresAt: Schema.Number });
const decisions = Schema.Array(Schema.Struct({ body: Schema.parseJson(Schema.Struct({ kind: Schema.String })) }));

/** Own three real isolated databases and one actual Cluster backend; no in-memory identity or approval adapter participates. */
const fixture = (dialect: Dialect) =>
    Effect.gen(
        /** Resolve tenant clients explicitly while leaving an unrelated compute client in bootstrap context as a negative control. */
        function* () {
            // Equal target/principal IDs in different physical databases make a wrong-client selection observable instead of harmless.
            const endpoint = new URL(
                process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test'
            );
            expect(['127.0.0.1', 'localhost', '[::1]']).toContain(endpoint.hostname);
            expect(endpoint.pathname).toBe('/eventiva_test');
            /** Use one explicit fixture URL without mutating process configuration. */
            const pg = (url: string) =>
                client.pipe(
                    Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]]))))
                );
            const admin = Context.get(yield* Layer.build(pg(endpoint.toString())), SqlClient.SqlClient);
            const clients: Array<SqlClient.SqlClient> = [];
            for (const cell of ['c', 'a', 'b']) {
                // Compute remains PostgreSQL even when each tenant owns a distinct SQLite engine and connection.
                const engine = cell === 'c' ? 'postgres' : dialect;
                let sql: SqlClient.SqlClient;
                if (engine === 'sqlite') sql = Context.get(yield* Layer.build(memory()), SqlClient.SqlClient);
                else {
                    const name = `consent_${randomUUID().replaceAll('-', '')}_${cell}`;
                    yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                    yield* Effect.addFinalizer(
                        /** Close only this fixture's owned sessions before removing its database. */
                        () =>
                            admin`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ${name} AND usename = current_user AND pid <> pg_backend_pid()`.pipe(
                                Effect.zipRight(admin`DROP DATABASE ${admin(name)}`),
                                Effect.orDie
                            )
                    );
                    const url = new URL(endpoint);
                    url.pathname = `/${name}`;
                    sql = Context.get(yield* Layer.build(pg(url.toString())), SqlClient.SqlClient);
                }
                yield* migrate(
                    engine,
                    yield* load(fileURLToPath(new URL(`../../../storage/migrations/${engine}`, import.meta.url)))
                ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
                clients.push(sql);
            }
            const [compute, a, b] = clients;
            if (compute === undefined || a === undefined || b === undefined)
                return yield* Effect.dieMessage('Missing fixture database.');
            const now = yield* Clock.currentTimeMillis;
            const stores: Array<IdentityStore['Type']> = [];
            for (const [caller, sql] of [
                [human, a],
                [foreign, b],
            ] as const) {
                const identities = Context.get(
                    yield* Layer.build(
                        identityStore.pipe(
                            Layer.provide(
                                Layer.merge(
                                    Layer.succeed(SqlClient.SqlClient, sql),
                                    Layer.succeed(CurrentTenant, { id: caller.tenant! })
                                )
                            )
                        )
                    ),
                    IdentityStore
                );
                const role = RoleId.make(id(7));
                yield* identities.put(
                    'role',
                    {
                        id: role,
                        name: 'Fixed fixture target writer',
                        grants: [{ permission: target.permission, resources: ['*'] }],
                    },
                    null
                );
                for (const subject of [caller, { ...agent, tenant: caller.tenant }]) {
                    yield* identities.put('principal', { id: subject.subject, kind: subject.kind, active: true }, null);
                    yield* identities.put('membership', { id: subject.subject, roles: [role], active: true }, null);
                    yield* identities.put(
                        'session',
                        {
                            id: subject.session,
                            subject: subject.subject,
                            active: true,
                            expiresAt: now + (caller.tenant === human.tenant ? 420_000 : 1_200_000),
                            delegation:
                                subject.kind === 'human'
                                    ? null
                                    : {
                                          human: caller.subject,
                                          session: caller.session,
                                          expiresAt: now + 400_000,
                                          grants: [{ permission: target.permission, resources: ['*'] }],
                                      },
                        },
                        null
                    );
                }
                stores.push(identities);
            }
            const enabled = yield* Ref.make(true);
            const policies = yield* Ref.make<Record<string, JsonValue | undefined>>({
                [human.tenant!]: { tenant: human.tenant!, sessionLifetimeMs: 900_000, approvalWindowMs: 600_000 },
                [foreign.tenant!]: { tenant: foreign.tenant!, sessionLifetimeMs: 1_800_000, approvalWindowMs: 300_000 },
            });
            const policy = Layer.unwrapEffect(
                Effect.gen(
                    /** A trusted route selects policy; request input cannot supply tenant/window settings. */
                    function* () {
                        // Capture the route identity once but reread its policy on each operation so live tightening is effective.
                        const route = yield* CurrentTenant;
                        return identitySessionPolicy(
                            Ref.get(policies).pipe(
                                Effect.map(
                                    /** Keep policy values live without retaining a route environment or any invocation Caller. */
                                    (values) => values[route.id]
                                )
                            )
                        );
                    }
                )
            );
            const routing = sqlRouter(
                dialect,
                /** Deliberately distinct physical clients defeat accidental ambient compute fallback. */
                (tenant) =>
                    tenant === human.tenant
                        ? Effect.succeed(a)
                        : tenant === foreign.tenant
                          ? Effect.succeed(b)
                          : Effect.fail(new RoutingDenied({ reason: 'unknown tenant' })),
                /** Route admission itself is fixed for this isolated control-plane fixture, not a production resolver. */
                () => Effect.void
            );
            const security = Layer.effect(
                Authorizer,
                Effect.map(
                    Authorizer,
                    /** This fixture has one fixed decoded resource, while all permissions/session/delegation remain live SQL authority. */
                    (base) => ({
                        ...base,
                        /** Grant checks remain actual SQL; a target typo or removed role still denies. */
                        check: (caller: CallerIdentity, spec: ActionSpec) => base.canInvoke(caller, spec),
                    })
                )
            ).pipe(Layer.provideMerge(identitySecurity));
            const profile = yield* Schema.decode(DeploymentProfile)({
                edition: 'community',
                port: 34565,
                shards: 24,
                assignmentRefreshMs: 50,
            });
            /** Capture the router-provided storage for the actual handler, not an ambient compute store. */
            const initialize = (host: ActionHost['Type']) =>
                Effect.gen(
                    /** The target mutates operational state and outbox only when the registered executor accepts it. */
                    function* () {
                        // Capturing only this routed Storage pairs actual handler writes with the host's Integrity transaction.
                        const storage = yield* Storage;
                        yield* host.register({
                            manifest: {
                                format: 1,
                                id: 'fixture',
                                version: '1.0.0',
                                description: 'Consent qualification target.',
                                actions: [target.name],
                                flags: [],
                            },
                            actions: [
                                implement(
                                    target,
                                    /** A duplicate non-replayed execution fails create-only, so final assertions cannot hide extra work. */
                                    (value) =>
                                        storage
                                            .create({
                                                id: value.id,
                                                version: 0,
                                                state: 'pending',
                                                payload: value.amount,
                                                leaseUntil: null,
                                            })
                                            .pipe(
                                                Effect.zipRight(storage.enqueue(value.id, { amount: value.amount })),
                                                Effect.as(value.amount),
                                                Effect.orDie
                                            )
                                ),
                            ],
                        });
                    }
                );
            const shared = Layer.merge(
                Layer.succeed(InputDigest, {
                    /** Hash registered canonical bytes with the maintained SHA-256 primitive, never a transport-supplied digest. */
                    digest: (text) =>
                        Effect.sync(
                            /** Delay hashing until the current canonical input has been prepared. */
                            () => createHash('sha256').update(text).digest('hex')
                        ),
                }),
                Layer.succeed(Flags, {
                    /** Only the local consent gate varies; no remote flag or ingestion is activated. */
                    evaluate: (flag) =>
                        Ref.get(enabled).pipe(
                            Effect.map(
                                /** Preserve exact flag metadata while changing just the fixture value. */
                                (value) => ({ flag: flag.key, value, reason: 'STATIC' as const, fallback: false })
                            )
                        ),
                })
            );
            const context = yield* Layer.build(
                backend(profile, initialize, Effect.void, security, policy).pipe(
                    Layer.provide(routing),
                    Layer.provide(shared),
                    Layer.provide(Layer.succeed(SqlClient.SqlClient, compute))
                )
            );
            yield* Context.get(context, ClusterStatus).snapshot.pipe(
                Effect.repeat({
                    schedule: Schedule.spaced('25 millis'),
                    /** Wait for actual Cluster ownership instead of invoking a hidden local executor. */
                    until: (value) => value.status === 'healthy',
                }),
                Effect.timeout('10 seconds')
            );
            const actions = Context.get(context, ClusterActions);
            /** Invoke the actual Cluster transport and leave all failures as observable Either values where a test expects denial. */
            const invoke = <Wire>(action: string, input: Wire, key: string, caller = human, approvalId?: string) =>
                Schema.decodeUnknown(JsonValue)(input).pipe(
                    Effect.flatMap(
                        /** Validate actual JSON wire data, including objects whose TypeScript optional fields are broader than JSON. */
                        (wire) =>
                            actions.execute({
                                action,
                                input: wire,
                                caller,
                                entityKey: 'consent-qualification',
                                intent: { idempotencyKey: key, ...(approvalId === undefined ? {} : { approvalId }) },
                            })
                    )
                );
            return { invoke, compute, a, b, stores, policies, enabled, now, routing, policy, shared };
        }
    );

for (const dialect of ['sqlite', 'postgres'] as const)
    describe(`registered approval SQL composition on ${dialect}`, /** Real compute and two-tenant databases qualify the accepting server path. */ () => {
        it.scopedLive(
            'reviews without executing, issues once, enforces exact intent and routes successful use/replay with no compute writes',
            /** Asymmetric tenants/session windows catch policy-only deadlines and accidental shared client/context capture. */
            () =>
                Effect.gen(
                    /** Exercise the public registered operations before inspecting independently persisted SQL outcomes. */
                    function* () {
                        // A shorter actual session and different second-tenant window distinguish every competing expiry/client interpretation.
                        const f = yield* fixture(dialect);
                        const input = { id: id(20), amount: '17' };
                        const request = {
                            action: target.name,
                            version: 2,
                            input,
                            principal: human,
                            writeKey: 'target-19',
                        };
                        const preview = yield* Schema.decodeUnknown(reviewed)(
                            (yield* f.invoke(prepareConsent.name, request, 'prepare-1')).output
                        );
                        expect(preview.expiresAt).toBe(f.now + 420_000);
                        expect(preview.review.binding.inputHash).toBe(
                            createHash('sha256')
                                .update(`{"amount":"17","id":"${id(20)}"}`)
                                .digest('hex')
                        );
                        expect(yield* f.a`SELECT * FROM approval_proof`).toHaveLength(0);
                        expect(yield* f.a`SELECT * FROM operational_record`).toHaveLength(0);
                        for (const [index, changed] of [
                            { ...request, input: { ...input, amount: '18' } },
                            { ...request, writeKey: 'target-20' },
                            { ...request, version: 3 },
                            { ...request, principal: foreign },
                        ].entries())
                            expect(
                                yield* Effect.either(
                                    f.invoke(completeConsent.name, { ...changed, ...preview }, `denied-${index}`)
                                )
                            ).toMatchObject({ _tag: 'Left' });
                        expect(
                            yield* Effect.either(
                                f.invoke(completeConsent.name, { ...request, ...preview }, 'agent-self', agent)
                            )
                        ).toMatchObject({ _tag: 'Left' });
                        const complete = { ...request, ...preview };
                        const proof = yield* Schema.decodeUnknown(issued)(
                            (yield* f.invoke(completeConsent.name, complete, 'confirm-1')).output
                        );
                        expect((yield* f.invoke(completeConsent.name, complete, 'confirm-1')).replayed).toBe(true);
                        expect(yield* f.a`SELECT * FROM approval_proof`).toHaveLength(1);
                        expect(yield* f.a`SELECT * FROM operational_record`).toHaveLength(0);
                        expect(
                            yield* Effect.either(f.invoke(target.name, input, 'wrong-key', human, proof.id))
                        ).toMatchObject({ _tag: 'Left' });
                        expect((yield* f.invoke(target.name, input, request.writeKey, human, proof.id)).output).toBe(
                            17
                        );
                        expect((yield* f.invoke(target.name, input, request.writeKey, human, proof.id)).replayed).toBe(
                            true
                        );
                        expect(yield* f.a`SELECT * FROM operational_record`).toHaveLength(1);
                        expect(yield* f.a`SELECT * FROM command_outbox`).toHaveLength(1);
                        expect(
                            (yield* Schema.decodeUnknown(decisions)(
                                yield* f.a`SELECT body FROM approval_decision`
                            )).filter(
                                /** Count persisted first-use decisions without relying on a dialect-specific JSON operator. */
                                (row) => row.body.kind === 'used'
                            )
                        ).toHaveLength(1);
                        expect(
                            yield* Effect.either(f.invoke(cancelConsent.name, { id: proof.id }, 'cancel-used'))
                        ).toMatchObject({ _tag: 'Left' });
                        const foreignRequest = { ...request, principal: foreign };
                        const before = yield* Clock.currentTimeMillis;
                        const foreignPreview = yield* Schema.decodeUnknown(reviewed)(
                            (yield* f.invoke(prepareConsent.name, foreignRequest, 'prepare-2', foreign)).output
                        );
                        expect(foreignPreview.expiresAt).toBeGreaterThanOrEqual(before + 300_000);
                        expect(foreignPreview.expiresAt).toBeLessThanOrEqual(
                            (yield* Clock.currentTimeMillis) + 300_000
                        );
                        const foreignProof = yield* Schema.decodeUnknown(issued)(
                            (yield* f.invoke(
                                completeConsent.name,
                                { ...foreignRequest, ...foreignPreview },
                                'confirm-2',
                                foreign
                            )).output
                        );
                        expect(
                            yield* Effect.either(f.invoke(target.name, input, request.writeKey, foreign, proof.id))
                        ).toMatchObject({ _tag: 'Left' });
                        expect(
                            (yield* f.invoke(target.name, input, request.writeKey, foreign, foreignProof.id)).output
                        ).toBe(17);
                        expect(yield* f.b`SELECT * FROM operational_record`).toHaveLength(1);
                        expect(yield* f.compute`SELECT * FROM approval_proof`).toHaveLength(0);
                        expect(yield* f.compute`SELECT * FROM operational_record`).toHaveLength(0);
                        expect(yield* f.compute`SELECT * FROM action_receipt`).toHaveLength(0);
                        const store = f.stores[0]!;
                        const session = (yield* store.get('session', human.session))!;
                        yield* store.put('session', { ...session.value, active: false }, session.version);
                        expect(
                            yield* Effect.either(f.invoke(target.name, input, request.writeKey, human, proof.id))
                        ).toMatchObject({ _tag: 'Left' });
                        expect(yield* f.a`SELECT * FROM operational_record`).toHaveLength(1);
                    }
                ),
            60000
        );
        it.scopedLive(
            'denies missing/live-changed policy and disabled registration while preserving own-pending cancellation without policy',
            /** Missing policy must block new grants but not turn own cancellation into an administrative permission. */
            () =>
                Effect.gen(
                    /** Independently inspect decision lifecycle after refusal rather than relying on error text alone. */
                    function* () {
                        // Loss of configuration must never turn into accepting defaults or prevent revoking existing own consent.
                        const f = yield* fixture(dialect);
                        const routed = Context.get(yield* Layer.build(f.routing), TenantSqlRouter);
                        const owner = f.stores[0]!;
                        yield* owner.link(
                            { issuer: 'https://fixture.invalid', subject: 'linked-human' },
                            human.subject
                        );
                        const loginBefore = yield* Clock.currentTimeMillis;
                        const newSession = Schema.decodeUnknownSync(CallerIdentity)({
                            ...human,
                            session: id(50),
                        }).session;
                        const opened = yield* routed
                            .run(
                                human.tenant!,
                                Effect.gen(
                                    /** Keep actual session issuance and its required receipt on the selected tenant connection. */
                                    function* () {
                                        // Obtain SQL inside routing so the audit and session cannot accidentally commit to different clients.
                                        const sql = yield* SqlClient.SqlClient;
                                        const storage = yield* Storage;
                                        return yield* sql.withTransaction(
                                            Effect.gen(
                                                /** This synthetic login completion has already verified its claims; it activates no real issuer or login route. */
                                                function* () {
                                                    // A failure after opening the session would unwind issuance and receipt together.
                                                    const session = yield* openOidcSessionWithPolicy({
                                                        issuer: 'https://fixture.invalid',
                                                        subject: 'linked-human',
                                                        audiences: ['fixture'],
                                                        scopes: [],
                                                        session: newSession,
                                                        clientId: 'fixture',
                                                        expiresAt: f.now + 60_000,
                                                        notBefore: f.now - 1,
                                                    });
                                                    yield* storage.audit(id(51), {
                                                        id: id(51),
                                                        caller: {
                                                            subject: human.subject,
                                                            kind: 'human',
                                                            tenant: human.tenant!,
                                                            session,
                                                        },
                                                        action: 'identity.session.open',
                                                        version: 1,
                                                        inputHash: 'synthetic-login',
                                                        outcome: 'succeeded',
                                                        startedAt: loginBefore,
                                                        durationMs: 0,
                                                    });
                                                    return session;
                                                }
                                            )
                                        );
                                    }
                                ).pipe(Effect.provide(f.policy))
                            )
                            .pipe(Effect.provideService(Caller, human));
                        expect(opened).toBe(newSession);
                        const sessionExpiry = (yield* owner.get('session', newSession))!.value.expiresAt;
                        expect(sessionExpiry).toBeGreaterThanOrEqual(loginBefore + 900_000);
                        expect(sessionExpiry).toBeLessThanOrEqual((yield* Clock.currentTimeMillis) + 900_000);
                        expect(yield* f.a`SELECT * FROM action_receipt WHERE id = ${id(51)}`).toHaveLength(1);
                        expect(yield* f.compute`SELECT * FROM action_receipt`).toHaveLength(0);
                        const request = {
                            action: target.name,
                            version: 2,
                            input: { id: id(21), amount: '23' },
                            principal: human,
                            writeKey: 'target-pending',
                        };
                        const preview = yield* Schema.decodeUnknown(reviewed)(
                            (yield* f.invoke(prepareConsent.name, request, 'prepare-pending')).output
                        );
                        yield* Ref.set(f.enabled, false);
                        expect(
                            yield* Effect.either(f.invoke(completeConsent.name, { ...request, ...preview }, 'disabled'))
                        ).toMatchObject({ _tag: 'Left' });
                        yield* Ref.set(f.enabled, true);
                        yield* Ref.update(
                            f.policies,
                            /** Tighten the live window below the reviewed actual-session cap. */
                            (values) => ({
                                ...values,
                                [human.tenant!]: {
                                    tenant: human.tenant!,
                                    sessionLifetimeMs: 900_000,
                                    approvalWindowMs: 300_000,
                                },
                            })
                        );
                        expect(
                            yield* Effect.either(
                                f.invoke(completeConsent.name, { ...request, ...preview }, 'changed-policy')
                            )
                        ).toMatchObject({ _tag: 'Left' });
                        const fresh = yield* Schema.decodeUnknown(reviewed)(
                            (yield* f.invoke(prepareConsent.name, request, 'prepare-fresh')).output
                        );
                        const proof = yield* Schema.decodeUnknown(issued)(
                            (yield* f.invoke(completeConsent.name, { ...request, ...fresh }, 'confirm-fresh')).output
                        );
                        yield* Ref.update(
                            f.policies,
                            /** Remove only the trusted source; request-carried values cannot replace it. */
                            (values) => ({ ...values, [human.tenant!]: undefined })
                        );
                        expect(
                            yield* Effect.either(f.invoke(prepareConsent.name, request, 'missing-policy'))
                        ).toMatchObject({ _tag: 'Left' });
                        expect(
                            yield* Effect.either(
                                f.invoke(completeConsent.name, { ...request, ...fresh }, 'missing-policy-confirm')
                            )
                        ).toMatchObject({ _tag: 'Left' });
                        expect(
                            (yield* f.invoke(cancelConsent.name, { id: proof.id }, 'cancel-own')).output
                        ).toMatchObject({
                            id: proof.id,
                        });
                        expect((yield* f.invoke(cancelConsent.name, { id: proof.id }, 'cancel-own')).replayed).toBe(
                            true
                        );
                        expect(
                            (yield* Schema.decodeUnknown(decisions)(
                                yield* f.a`SELECT body FROM approval_decision`
                            )).filter(
                                /** Read the actual immutable decision on either engine rather than infer cancellation from its response. */
                                (row) => row.body.kind === 'cancelled'
                            )
                        ).toHaveLength(1);
                        expect(yield* f.a`SELECT * FROM operational_record`).toHaveLength(0);
                        expect(
                            yield* Effect.either(
                                routed.run(human.tenant!, Effect.void).pipe(Effect.provideService(Caller, foreign))
                            )
                        ).toMatchObject({ _tag: 'Left' });
                        expect(
                            yield* Effect.either(
                                routed
                                    .run(human.tenant!, routed.run(foreign.tenant!, Effect.void))
                                    .pipe(Effect.provideService(Caller, human))
                            )
                        ).toMatchObject({ _tag: 'Left' });
                        const login = routed.run(
                            human.tenant!,
                            openOidcSessionWithPolicy({
                                issuer: 'https://fixture.invalid',
                                subject: 'linked-human',
                                audiences: ['fixture'],
                                scopes: [],
                                session: human.session,
                                clientId: 'fixture',
                                expiresAt: f.now + 60_000,
                                notBefore: f.now - 1,
                            }).pipe(Effect.provide(f.policy))
                        );
                        expect(yield* Effect.either(login.pipe(Effect.provideService(Caller, human)))).toMatchObject({
                            _tag: 'Left',
                            left: { _tag: 'SessionPolicyFailure' },
                        });
                    }
                ),
            60000
        );
    });
