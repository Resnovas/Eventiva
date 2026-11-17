/**
 * @file tests/storage/src/marketplace.spec.ts
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

import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { SqlError } from '@effect/sql/SqlError';
import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Flags } from '@eventiva/contracts/flags';
import { TenantId } from '@eventiva/contracts/ids';
import {
    MarketplaceAdministration,
    MarketplaceOperatorPolicy,
    MarketplaceOperatorPolicyDeny,
    MarketplaceOutbox,
} from '@eventiva/contracts/marketplace-durable';
import {
    ExchangeIntent,
    MarketplaceAuthority,
    MarketplaceFailure,
    MarketplaceStore,
    type MarketplaceTransaction,
    ParticipantGrant,
    SnapshotReference,
} from '@eventiva/contracts/marketplace';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { marketplace } from '@eventiva/integrations.sql/marketplace';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { memory } from '@eventiva/integrations.sql/sqlite';
import { IdentityResolver, InvocationDenied } from '@eventiva/runtime/invocation';
import { privateExchangeUnavailable, stageExchange } from '@eventiva/runtime/marketplace';
import { describe, expect, it } from '@effect/vitest';
import { ConfigProvider, Context, Deferred, Effect, Either, Exit, Fiber, Layer, Schema } from 'effect';

const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const caller = Schema.decodeUnknownSync(CallerIdentity)({
    subject: id(1),
    session: id(2),
    tenant: id(3),
    kind: 'human',
});
const snapshot = Schema.decodeUnknownSync(SnapshotReference)({
    id: id(4),
    scope: {
        exchange: id(5),
        ownerTenant: caller.tenant,
        recipientTenant: id(6),
        resource: id(7),
        purpose: 'quote-review',
    },
    sourceRecord: id(8),
    sourceVersion: 3,
    classification: 'restricted',
});
const provision = {
    request: id(9),
    snapshot,
    grant: Schema.decodeUnknownSync(ParticipantGrant)({
        id: id(10),
        scope: snapshot.scope,
        participantTenant: caller.tenant,
        subject: caller.subject,
        action: 'stage',
        expiresAt: 4102444800000,
        revoked: false,
    }),
};
const command = {
    command: id(11),
    snapshot: snapshot.id,
    scope: snapshot.scope,
    grant: provision.grant.id,
    expectedVersion: 3,
};
const claimRequest = { command: command.command, leaseMs: 60000, maxAttempts: 2 };
const denied = () => new MarketplaceFailure({ reason: 'denied' });
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
const database = (dialect: Dialect) =>
    Effect.gen(function* () {
        let context;
        if (dialect === 'postgres') {
            const target = new URL(
                process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test'
            );
            if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.pathname !== '/eventiva_test')
                return yield* Effect.die('Marketplace tests require authorized disposable loopback eventiva_test');
            const admin = Context.get(yield* Layer.build(pg(target.href)), SqlClient.SqlClient);
            const name = `marketplace_${randomUUID().replaceAll('-', '')}`;
            yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
            yield* Effect.addFinalizer(() => admin`DROP DATABASE ${admin(name)} WITH (FORCE)`.pipe(Effect.orDie));
            target.pathname = `/${name}`;
            context = yield* Layer.build(pg(target.href));
        } else context = yield* Layer.build(memory());
        const sql = Context.get(context, SqlClient.SqlClient);
        yield* load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url))).pipe(
            Effect.flatMap((files) => migrate(dialect, files)),
            Effect.provideService(SqlClient.SqlClient, sql)
        );
        return sql;
    });
const fixture = (dialect: Dialect) =>
    Effect.gen(function* () {
        const sql = yield* database(dialect);
        expect(yield* sql`SELECT id FROM marketplace_guard`).toHaveLength(1);
        const services = yield* Layer.build(
            marketplace(dialect).pipe(Layer.provide(Layer.succeed(SqlClient.SqlClient, sql)))
        );
        const state = { identity: true, policy: true, metadata: true };
        const context = services.pipe(
            Context.add(Caller, caller),
            Context.add(CurrentTenant, { id: snapshot.scope.ownerTenant }),
            Context.add(Flags, {
                evaluate: (flag) => Effect.succeed({ flag: flag.key, value: true, fallback: false, reason: 'TEST' }),
            }),
            Context.add(IdentityResolver, {
                resolve: (presented) =>
                    state.identity
                        ? Effect.succeed(presented)
                        : Effect.fail(new InvocationDenied({ action: 'marketplace', reason: 'identity' })),
            }),
            Context.add(MarketplaceOperatorPolicy, {
                authorize: () => (state.policy && state.identity ? Effect.void : Effect.fail(denied())),
            }),
            Context.add(MarketplaceAuthority, {
                authorize: () => (state.metadata ? Effect.void : Effect.fail(denied())),
            })
        );
        const admin = Context.get(context, MarketplaceAdministration);
        const store = Context.get(context, MarketplaceStore);
        const outbox = Context.get(context, MarketplaceOutbox);
        yield* admin.provision(provision).pipe(Effect.provide(context));
        const stage = stageExchange(command).pipe(Effect.provide(context));
        const claim = outbox.claim(claimRequest).pipe(Effect.provide(context));
        const audit = admin.audit({ scope: snapshot.scope, limit: 100 }).pipe(Effect.provide(context));
        const revoke = admin
            .revoke({ request: id(12), scope: snapshot.scope, grant: provision.grant.id })
            .pipe(Effect.provide(context));
        return { sql, services, context, state, admin, store, outbox, stage, claim, audit, revoke };
    });

for (const dialect of ['sqlite', 'postgres'] as const)
    describe(`${dialect} durable marketplace`, () => {
        it.scoped('serializes competing command retries into one intent, delivery and audit', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                const results = yield* Effect.all([f.stage, f.stage], { concurrency: 'unbounded' });
                expect(results[0]).toEqual(results[1]);
                for (const table of ['marketplace_intent', 'marketplace_delivery'])
                    expect(yield* f.sql`SELECT * FROM ${f.sql(table)}`).toHaveLength(1);
                expect((yield* f.audit).map((event) => event.operation).sort()).toEqual(['provision', 'stage']);
                expect(
                    yield* Effect.flip(
                        stageExchange({ ...command, expectedVersion: 4 }).pipe(Effect.provide(f.context))
                    )
                ).toMatchObject({ reason: 'conflict' });
                expect(yield* Effect.flip(privateExchangeUnavailable)).toMatchObject({ reason: 'trust-unapproved' });
                // Command and administration IDs have independent namespaces, even when correlated.
                yield* stageExchange({ ...command, command: provision.request }).pipe(Effect.provide(f.context));
                expect(yield* f.sql`SELECT * FROM marketplace_intent`).toHaveLength(2);
            })
        );

        it.scoped('reauthorizes identical stage/provision/revoke retries and protects classified audit metadata', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                yield* f.stage;
                const outsider = { ...caller, tenant: TenantId.make(id(90)) };
                const foreign = f.context.pipe(
                    Context.add(Caller, outsider),
                    Context.add(CurrentTenant, { id: outsider.tenant })
                );
                for (const operation of [
                    f.admin.audit({ scope: snapshot.scope, limit: 100 }).pipe(Effect.asVoid),
                    f.admin.provision(provision),
                    f.admin.revoke({ request: id(13), grant: provision.grant.id, scope: snapshot.scope }),
                    f.outbox.claim(claimRequest).pipe(Effect.asVoid),
                ])
                    expect(yield* Effect.flip(operation.pipe(Effect.provide(foreign)))).toMatchObject({
                        reason: 'denied',
                    });
                expect(
                    yield* Effect.flip(
                        f.admin
                            .provision({ ...provision, snapshot: { ...snapshot, sourceVersion: 9 } })
                            .pipe(Effect.provide(f.context))
                    )
                ).toMatchObject({ reason: 'conflict' });
                f.state.policy = false;
                expect(yield* Effect.flip(f.admin.provision(provision).pipe(Effect.provide(f.context)))).toMatchObject({
                    reason: 'denied',
                });
                f.state.policy = true;
                yield* f.revoke;
                yield* f.revoke;
                expect(yield* Effect.flip(f.stage)).toMatchObject({ reason: 'denied' });
                f.state.policy = false;
                expect(yield* Effect.flip(f.revoke)).toMatchObject({ reason: 'denied' });
                f.state.policy = true;
                yield* f.admin.provision(provision).pipe(Effect.provide(f.context));
                expect(yield* Effect.flip(f.stage)).toMatchObject({ reason: 'denied' });
                expect((yield* f.audit).filter((event) => event.operation === 'revoke')).toHaveLength(1);
            })
        );

        it.scoped(
            'does not accept absent authority, extra input properties or changed immutable snapshot bindings',
            () =>
                Effect.gen(function* () {
                    const f = yield* fixture(dialect);
                    expect(
                        yield* Effect.flip(
                            f.admin
                                .provision({
                                    ...provision,
                                    request: id(20),
                                    grant: { ...provision.grant, id: id(21) },
                                    snapshot: { ...snapshot, sourceRecord: id(22) },
                                })
                                .pipe(Effect.provide(f.context))
                        )
                    ).toMatchObject({ reason: 'conflict' });
                    const excess = { ...provision, request: id(20), privatePayload: 'synthetic-secret' };
                    expect(
                        JSON.stringify(yield* Effect.flip(f.admin.provision(excess).pipe(Effect.provide(f.context))))
                    ).not.toContain('synthetic-secret');
                    expect(
                        yield* Effect.flip(
                            f.admin.audit({ scope: snapshot.scope, limit: 0 }).pipe(Effect.provide(f.context))
                        )
                    ).toMatchObject({ reason: 'invalid' });
                    const deny = Context.get(
                        yield* Layer.build(MarketplaceOperatorPolicyDeny),
                        MarketplaceOperatorPolicy
                    );
                    expect(
                        yield* Effect.flip(
                            f.admin
                                .provision(provision)
                                .pipe(Effect.provide(f.context.pipe(Context.add(MarketplaceOperatorPolicy, deny))))
                        )
                    ).toMatchObject({ reason: 'denied' });
                })
        );

        it.scoped('rolls back intent/outbox when audit append fails, then retries cleanly', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                // Inject a primary-key audit conflict after intent and delivery inserts, without dropping audit protection.
                yield* f.sql`INSERT INTO marketplace_audit (id, scope_key, body) VALUES (${`intent:${command.command}`}, 'synthetic', '{}')`;
                expect(yield* Effect.flip(f.stage)).toMatchObject({ reason: 'unavailable' });
                for (const table of ['marketplace_intent', 'marketplace_delivery'])
                    expect(yield* f.sql`SELECT * FROM ${f.sql(table)}`).toHaveLength(0);
                const next = { ...command, command: id(30) };
                yield* stageExchange(next).pipe(Effect.provide(f.context));
                expect(yield* f.sql`SELECT * FROM marketplace_intent`).toHaveLength(1);
            })
        );

        it.scoped('rolls back revocation and provisioning when audit append fails', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                yield* f.sql`INSERT INTO marketplace_audit (id, scope_key, body) VALUES (${`request:${id(12)}`}, 'synthetic', '{}')`;
                expect(yield* Effect.flip(f.revoke)).toMatchObject({ reason: 'unavailable' });
                yield* f.stage;
                const next = {
                    request: id(40),
                    snapshot: { ...snapshot, id: id(41) },
                    grant: { ...provision.grant, id: id(42) },
                };
                yield* f.sql`INSERT INTO marketplace_audit (id, scope_key, body) VALUES (${`request:${next.request}`}, 'synthetic', '{}')`;
                expect(yield* Effect.flip(f.admin.provision(next).pipe(Effect.provide(f.context)))).toMatchObject({
                    reason: 'unavailable',
                });
                expect(yield* f.sql`SELECT id FROM marketplace_grant WHERE id = ${next.grant.id}`).toHaveLength(0);
                expect(yield* f.sql`SELECT id FROM marketplace_snapshot WHERE id = ${next.snapshot.id}`).toHaveLength(
                    0
                );
            })
        );

        it.scoped(
            'preserves callback failures, defects and interruption; rejects escaped and foreign transaction capabilities',
            () =>
                Effect.gen(function* () {
                    const f = yield* fixture(dialect);
                    const intent: ExchangeIntent = {
                        command: command.command,
                        grant: command.grant,
                        tenant: snapshot.scope.ownerTenant,
                        subject: caller.subject,
                        onBehalfOf: null,
                        snapshot,
                        state: 'pending',
                    };
                    const custom = new SqlError({ message: 'callback-error-not-database-failure' });
                    expect(
                        yield* Effect.flip(
                            f.store.transaction((tx) =>
                                tx.insertIntent(intent).pipe(Effect.zipRight(Effect.fail(custom)))
                            )
                        )
                    ).toMatchObject({ _tag: 'SqlError', message: custom.message });
                    expect(
                        Exit.isFailure(
                            yield* Effect.exit(
                                f.store.transaction((tx) =>
                                    tx.insertIntent(intent).pipe(Effect.zipRight(Effect.die('synthetic-defect')))
                                )
                            )
                        )
                    ).toBe(true);
                    const entered = yield* Deferred.make<void>();
                    const fiber = yield* Effect.fork(
                        f.store.transaction((tx) =>
                            tx
                                .insertIntent(intent)
                                .pipe(
                                    Effect.zipRight(Deferred.succeed(entered, undefined)),
                                    Effect.zipRight(Effect.never)
                                )
                        )
                    );
                    yield* Deferred.await(entered);
                    yield* Fiber.interrupt(fiber);
                    expect(yield* f.sql`SELECT * FROM marketplace_intent`).toHaveLength(0);
                    const escaped: MarketplaceTransaction = yield* f.store.transaction((tx) => Effect.succeed(tx));
                    expect(yield* Effect.flip(escaped.snapshot(snapshot.id))).toMatchObject({ reason: 'unavailable' });
                    expect(yield* Effect.flip(f.store.transaction(() => escaped.snapshot(snapshot.id)))).toMatchObject({
                        reason: 'unavailable',
                    });
                    expect(
                        yield* Effect.flip(f.sql.withTransaction(f.store.transaction(() => Effect.void)))
                    ).toMatchObject({ reason: 'unavailable' });
                    // A callback cannot acknowledge an intent without its matching local outbox item.
                    expect(yield* Effect.flip(f.store.transaction((tx) => tx.insertIntent(intent)))).toMatchObject({
                        reason: 'unavailable',
                    });
                    expect(yield* f.sql`SELECT * FROM marketplace_intent`).toHaveLength(0);
                })
        );

        it.scoped('persists the full safe integer retry-budget contract without narrowing it', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                yield* f.stage;
                const request = { ...claimRequest, maxAttempts: Number.MAX_SAFE_INTEGER };
                const claim = yield* f.outbox.claim(request).pipe(Effect.provide(f.context));
                expect(claim).toMatchObject({ command: command.command, attempt: 1 });
                expect(yield* f.outbox.claim(request).pipe(Effect.provide(f.context))).toBeUndefined();
                expect(
                    yield* Effect.flip(
                        f.outbox
                            .claim({ ...request, maxAttempts: Number.MAX_SAFE_INTEGER - 1 })
                            .pipe(Effect.provide(f.context))
                    )
                ).toMatchObject({ reason: 'conflict' });
            })
        );

        it.scoped('serializes claims, pins retry budget and rejects stale/forged fences', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                yield* f.stage;
                const claims = yield* Effect.all([f.claim, f.claim], { concurrency: 'unbounded' });
                const claim = claims.find((value) => value !== undefined);
                if (claim === undefined) return yield* Effect.die('Expected one claimed intent');
                expect(claims.filter((value) => value !== undefined)).toHaveLength(1);
                expect(claim.attempt).toBe(1);
                expect(
                    yield* Effect.flip(
                        f.outbox.claim({ ...claimRequest, maxAttempts: 9 }).pipe(Effect.provide(f.context))
                    )
                ).toMatchObject({ reason: 'conflict' });
                expect(
                    yield* Effect.flip(
                        f.outbox
                            .settle({ claim: { ...claim, lease: id(70) }, outcome: { state: 'recorded' } })
                            .pipe(Effect.provide(f.context))
                    )
                ).toMatchObject({ reason: 'conflict' });
                yield* f.outbox
                    .settle({ claim, outcome: { state: 'retry', availableAt: 0 } })
                    .pipe(Effect.provide(f.context));
                yield* f.outbox
                    .settle({ claim, outcome: { state: 'retry', availableAt: 0 } })
                    .pipe(Effect.provide(f.context));
                expect(
                    yield* Effect.flip(
                        f.outbox
                            .settle({ claim, outcome: { state: 'retry', availableAt: 1 } })
                            .pipe(Effect.provide(f.context))
                    )
                ).toMatchObject({ reason: 'conflict' });
                const next = yield* f.claim;
                if (next === undefined) return yield* Effect.die('Expected retry claim');
                expect(next.command).toBe(claim.command);
                expect(next.lease).not.toBe(claim.lease);
                expect(next.attempt).toBe(2);
                expect(
                    yield* Effect.flip(
                        f.outbox.settle({ claim, outcome: { state: 'recorded' } }).pipe(Effect.provide(f.context))
                    )
                ).toMatchObject({ reason: 'conflict' });
                yield* f.outbox
                    .settle({ claim: next, outcome: { state: 'retry', availableAt: 0 } })
                    .pipe(Effect.provide(f.context));
                expect(yield* f.claim).toBeUndefined();
                expect(
                    (yield* f.sql`SELECT state, attempt FROM marketplace_delivery`).map((row) => ({
                        state: row['state'],
                        attempt: Number(row['attempt']),
                    }))
                ).toEqual([{ state: 'exhausted', attempt: 2 }]);
            })
        );

        it.scoped('refuses a settlement whose lease expires during live authorization', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                yield* f.stage;
                const claim = yield* f.outbox.claim({ ...claimRequest, leaseMs: 1000 }).pipe(Effect.provide(f.context));
                if (claim === undefined) return yield* Effect.die('Expected a current claim');
                let checked = false;
                const delayed = f.context.pipe(
                    Context.add(MarketplaceAuthority, {
                        authorize: () =>
                            Effect.promise(
                                () =>
                                    new Promise<void>((resolve) => {
                                        checked = true;
                                        setTimeout(resolve, 1200);
                                    })
                            ),
                    })
                );
                expect(
                    yield* Effect.flip(
                        f.outbox.settle({ claim, outcome: { state: 'recorded' } }).pipe(Effect.provide(delayed))
                    )
                ).toMatchObject({ reason: 'conflict' });
                expect(checked).toBe(true);
                expect(yield* f.sql`SELECT state FROM marketplace_delivery`).toEqual([{ state: 'running' }]);
                expect(yield* f.sql`SELECT lease FROM marketplace_settlement`).toEqual([]);
            })
        );

        it.scoped('rechecks grants/metadata on claim and settlement and persists blocked evidence', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                yield* f.stage;
                const claim = yield* f.claim;
                if (claim === undefined) return yield* Effect.die('Expected claim before revocation');
                yield* f.revoke;
                expect(
                    yield* Effect.flip(
                        f.outbox.settle({ claim, outcome: { state: 'recorded' } }).pipe(Effect.provide(f.context))
                    )
                ).toMatchObject({ reason: 'denied' });
                expect(yield* f.sql`SELECT state FROM marketplace_delivery`).toEqual([{ state: 'blocked' }]);
                expect((yield* f.audit).filter((event) => event.operation === 'blocked')).toHaveLength(1);
                const second = { ...provision, request: id(80), grant: { ...provision.grant, id: id(81) } };
                yield* f.admin.provision(second).pipe(Effect.provide(f.context));
                const secondCommand = { ...command, command: id(82), grant: second.grant.id };
                yield* stageExchange(secondCommand).pipe(Effect.provide(f.context));
                f.state.metadata = false;
                expect(
                    yield* Effect.flip(
                        f.outbox
                            .claim({ ...claimRequest, command: secondCommand.command })
                            .pipe(Effect.provide(f.context))
                    )
                ).toMatchObject({ reason: 'denied' });
                expect(
                    yield* f.sql`SELECT state FROM marketplace_delivery WHERE command = ${secondCommand.command}`
                ).toEqual([{ state: 'blocked' }]);
                expect(
                    yield* Effect.flip(
                        f.outbox
                            .claim({ ...claimRequest, command: secondCommand.command })
                            .pipe(Effect.provide(f.context))
                    )
                ).toMatchObject({ reason: 'denied' });
            })
        );

        it.scoped('rolls back claim and settlement state when their audit append fails', () =>
            Effect.gen(function* () {
                for (const phase of ['claim', 'settle'] as const) {
                    const f = yield* fixture(dialect);
                    yield* f.stage;
                    const claim = phase === 'settle' ? yield* f.claim : undefined;
                    const before = yield* f.sql`SELECT state, attempt, lease, lease_until FROM marketplace_delivery`;
                    yield* f.sql`DROP TABLE marketplace_audit`;
                    const operation =
                        claim === undefined
                            ? f.claim.pipe(Effect.asVoid)
                            : f.outbox
                                  .settle({ claim, outcome: { state: 'recorded' } })
                                  .pipe(Effect.provide(f.context));
                    expect(yield* Effect.flip(operation)).toMatchObject({ reason: 'unavailable' });
                    expect(yield* f.sql`SELECT state, attempt, lease, lease_until FROM marketplace_delivery`).toEqual(
                        before
                    );
                    expect(yield* f.sql`SELECT * FROM marketplace_settlement`).toHaveLength(0);
                }
            })
        );

        it.scoped('honors explicit retry deadlines and reauthorizes exact completed settlement replay', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                yield* f.stage;
                const claim = yield* f.claim;
                if (claim === undefined) return yield* Effect.die('Expected initial claim');
                const settlement = { claim, outcome: { state: 'recorded' as const } };
                yield* f.outbox.settle(settlement).pipe(Effect.provide(f.context));
                yield* f.outbox.settle(settlement).pipe(Effect.provide(f.context));
                expect(yield* f.claim).toBeUndefined();
                f.state.identity = false;
                expect(yield* Effect.flip(f.outbox.settle(settlement).pipe(Effect.provide(f.context)))).toMatchObject({
                    reason: 'denied',
                });
                f.state.identity = true;
                yield* f.revoke;
                expect(yield* Effect.flip(f.outbox.settle(settlement).pipe(Effect.provide(f.context)))).toMatchObject({
                    reason: 'denied',
                });
                expect(yield* f.sql`SELECT state FROM marketplace_delivery`).toEqual([{ state: 'recorded' }]);
                const second = { ...provision, request: id(83), grant: { ...provision.grant, id: id(84) } };
                yield* f.admin.provision(second).pipe(Effect.provide(f.context));
                const secondCommand = { ...command, command: id(85), grant: second.grant.id };
                yield* stageExchange(secondCommand).pipe(Effect.provide(f.context));
                const request = { ...claimRequest, command: secondCommand.command };
                const next = yield* f.outbox.claim(request).pipe(Effect.provide(f.context));
                if (next === undefined) return yield* Effect.die('Expected second command claim');
                yield* f.outbox
                    .settle({ claim: next, outcome: { state: 'retry', availableAt: 4102444800000 } })
                    .pipe(Effect.provide(f.context));
                expect(yield* f.outbox.claim(request).pipe(Effect.provide(f.context))).toBeUndefined();
                expect(
                    yield* Effect.flip(f.outbox.claim({ ...request, leaseMs: 0 }).pipe(Effect.provide(f.context)))
                ).toMatchObject({ reason: 'invalid' });
            })
        );

        it.scoped('sanitizes live operator and metadata policy defects without changing durable state', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                yield* f.stage;
                const defective = f.context.pipe(
                    Context.add(MarketplaceOperatorPolicy, {
                        authorize: () => Effect.die('PRIVATE-OPERATOR-CANARY'),
                    })
                );
                const metadata = f.context.pipe(
                    Context.add(MarketplaceAuthority, {
                        authorize: () => Effect.die('PRIVATE-AUTHORITY-CANARY'),
                    })
                );
                for (const operation of [
                    f.admin.audit({ scope: snapshot.scope, limit: 10 }).pipe(Effect.asVoid, Effect.provide(defective)),
                    f.outbox.claim(claimRequest).pipe(Effect.asVoid, Effect.provide(defective)),
                    f.outbox.claim(claimRequest).pipe(Effect.asVoid, Effect.provide(metadata)),
                ]) {
                    const result = yield* Effect.exit(operation);
                    expect(result).toEqual(Exit.fail(new MarketplaceFailure({ reason: 'unavailable' })));
                    expect(JSON.stringify(result)).not.toContain('CANARY');
                }
                expect(yield* f.sql`SELECT state FROM marketplace_delivery`).toEqual([{ state: 'pending' }]);
                expect(yield* f.claim).toBeDefined();
            })
        );

        it.scoped('fails closed on missing guard and SQL faults without exposing stored metadata', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                yield* f.sql`DELETE FROM marketplace_guard`;
                expect(yield* Effect.flip(f.stage)).toMatchObject({ reason: 'unavailable' });
                expect(yield* Effect.flip(f.audit)).toMatchObject({ reason: 'unavailable' });
                expect(yield* Effect.flip(f.claim)).toMatchObject({ reason: 'unavailable' });
                expect(yield* f.sql`SELECT * FROM marketplace_intent`).toHaveLength(0);
            })
        );

        it.scoped('rejects invalid grant boundaries, classified reference corruption and unavailable policy', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                for (const grant of [
                    { ...provision.grant, scope: { ...snapshot.scope, purpose: 'other-purpose' } },
                    { ...provision.grant, participantTenant: TenantId.make(id(90)) },
                    { ...provision.grant, revoked: true },
                    { ...provision.grant, expiresAt: 0 },
                ])
                    expect(
                        yield* Effect.flip(
                            f.admin.provision({ ...provision, request: id(92), grant }).pipe(Effect.provide(f.context))
                        )
                    ).toMatchObject({ reason: 'invalid' });
                expect(
                    yield* Effect.flip(
                        f.admin.provision({ ...provision, request: id(92) }).pipe(Effect.provide(f.context))
                    )
                ).toMatchObject({ reason: 'conflict' });
                expect(
                    yield* Effect.flip(
                        f.admin
                            .revoke({ request: id(92), scope: snapshot.scope, grant: id(99) })
                            .pipe(Effect.provide(f.context))
                    )
                ).toMatchObject({ reason: 'denied' });
                expect(
                    yield* Effect.flip(
                        f.outbox.claim({ ...claimRequest, command: id(99) }).pipe(Effect.provide(f.context))
                    )
                ).toMatchObject({ reason: 'denied' });
                yield* f.stage;
                const alternate = f.context.pipe(
                    Context.add(Caller, Schema.decodeUnknownSync(CallerIdentity)({ ...caller, subject: id(95) }))
                );
                expect(yield* Effect.flip(f.outbox.claim(claimRequest).pipe(Effect.provide(alternate)))).toMatchObject({
                    reason: 'denied',
                });
                const unavailable = f.context.pipe(
                    Context.add(MarketplaceAuthority, {
                        authorize: () => Effect.fail(new MarketplaceFailure({ reason: 'unavailable' })),
                    })
                );
                expect(
                    yield* Effect.flip(f.outbox.claim(claimRequest).pipe(Effect.provide(unavailable)))
                ).toMatchObject({ reason: 'unavailable' });
                expect(
                    (yield* f.sql`SELECT state, attempt FROM marketplace_delivery`).map((row) => ({
                        state: row['state'],
                        attempt: Number(row['attempt']),
                    }))
                ).toEqual([{ state: 'pending', attempt: 0 }]);
                const claim = yield* f.claim;
                if (claim === undefined) return yield* Effect.die('Expected claim after policy restored');
                expect(
                    yield* Effect.flip(
                        f.outbox.settle({ claim, outcome: { state: 'recorded' } }).pipe(Effect.provide(unavailable))
                    )
                ).toMatchObject({ reason: 'unavailable' });
                expect(yield* f.sql`SELECT state FROM marketplace_delivery`).toEqual([{ state: 'running' }]);
                yield* f.sql`INSERT INTO marketplace_snapshot (id, body) VALUES (${id(93)}, '{}')`;
                const invalid = yield* Effect.flip(f.store.transaction((tx) => tx.snapshot(id(93))));
                expect(invalid).toMatchObject({ reason: 'invalid' });
                expect(JSON.stringify(invalid)).not.toContain(snapshot.sourceRecord);
                const body = yield* Schema.encode(Schema.parseJson(SnapshotReference))(snapshot);
                yield* f.sql`INSERT INTO marketplace_snapshot (id, body) VALUES (${id(94)}, ${body})`;
                expect(yield* Effect.flip(f.store.transaction((tx) => tx.snapshot(id(94))))).toMatchObject({
                    reason: 'invalid',
                });
                const intent = yield* f.stage;
                expect(yield* Effect.flip(f.store.transaction((tx) => tx.insertIntent(intent)))).toMatchObject({
                    reason: 'unavailable',
                });
                yield* f.sql`ALTER TABLE marketplace_snapshot RENAME TO marketplace_snapshot_offline`;
                expect(yield* Effect.flip(f.store.transaction((tx) => tx.snapshot(snapshot.id)))).toMatchObject({
                    reason: 'unavailable',
                });
            })
        );

        it.scoped('database constraints preserve snapshot, intent, grant and audit evidence', () =>
            Effect.gen(function* () {
                const f = yield* fixture(dialect);
                yield* f.stage;
                yield* f.revoke;
                for (const effect of [
                    f.sql`UPDATE marketplace_grant SET revoked = 0`,
                    f.sql`UPDATE marketplace_grant SET body = '{}'`,
                    f.sql`UPDATE marketplace_snapshot SET body = '{}'`,
                    f.sql`UPDATE marketplace_intent SET body = '{}'`,
                    f.sql`UPDATE marketplace_request SET body = '{}'`,
                    f.sql`UPDATE marketplace_audit SET body = '{}'`,
                    f.sql`DELETE FROM marketplace_audit`,
                    f.sql`DELETE FROM marketplace_grant`,
                ])
                    expect(Either.isLeft(yield* Effect.either(effect))).toBe(true);
                expect((yield* f.audit).map((event) => event.operation).sort()).toEqual([
                    'provision',
                    'revoke',
                    'stage',
                ]);
            })
        );

        if (dialect === 'postgres')
            it.scoped('a stager waiting behind authorized revocation observes the committed denial', () =>
                Effect.gen(function* () {
                    const f = yield* fixture(dialect);
                    const held = yield* Deferred.make<void>();
                    const release = yield* Deferred.make<void>();
                    const context = f.context.pipe(
                        Context.add(MarketplaceOperatorPolicy, {
                            authorize: () =>
                                Deferred.succeed(held, undefined).pipe(Effect.zipRight(Deferred.await(release))),
                        })
                    );
                    const revoker = yield* Effect.fork(
                        f.admin
                            .revoke({ request: id(91), scope: snapshot.scope, grant: provision.grant.id })
                            .pipe(Effect.provide(context))
                    );
                    yield* Deferred.await(held);
                    const writer = yield* Effect.fork(f.stage.pipe(Effect.either));
                    let waiting = false;
                    for (let attempt = 0; attempt < 200; attempt++) {
                        const rows =
                            yield* f.sql`SELECT pid FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock' AND query LIKE 'UPDATE marketplace_guard SET version%'`;
                        if (rows.length > 0) {
                            waiting = true;
                            break;
                        }
                        yield* Effect.yieldNow();
                    }
                    yield* Deferred.succeed(release, undefined);
                    yield* Fiber.join(revoker);
                    expect(waiting).toBe(true);
                    expect(yield* Fiber.join(writer)).toMatchObject({ left: { reason: 'denied' } });
                    expect(yield* f.sql`SELECT * FROM marketplace_intent`).toHaveLength(0);
                })
            );
    });
