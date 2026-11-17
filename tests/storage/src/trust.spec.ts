/**
 * @file tests/storage/src/trust.spec.ts
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
import { TenantId } from '@eventiva/contracts/ids';
import {
    BrokerGate,
    IdentityGate,
    ResourceGate,
    TrustFailure,
    TrustPolicy,
    TrustReplay,
    TrustRequest,
    WorkloadGate,
    type TrustEvidence,
    type TrustVerifier,
} from '@eventiva/contracts/trust';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { memory } from '@eventiva/integrations.sql/sqlite';
import { trustReplay } from '@eventiva/integrations.sql/trust';
import { trustPreflight } from '@eventiva/runtime/trust';
import { describe, expect, it } from '@effect/vitest';
import { ConfigProvider, Context, Effect, Either, Layer, Schema } from 'effect';

const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const request = Schema.decodeUnknownSync(TrustRequest)({
    scope: {
        tenant: id(1),
        subject: id(2),
        audience: 'trust.test',
        resource: 'record',
        resourceId: id(3),
        purpose: 'read',
        profile: 'restricted',
        operation: 'metadata',
    },
    nonce: id(100),
    keys: {
        root: id(4),
        signingAuthority: id(5),
        encryptionAuthority: id(6),
        kek: id(7),
        kekVersion: 1,
        dek: id(8),
        dekVersion: 1,
    },
});
const policy = Schema.decodeUnknownSync(TrustPolicy)({
    now: 1234,
    freshAfter: { identity: 0, resource: 0, workload: 0, broker: 0 },
    minimumAssurance: 'A2',
});
const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
const target = new URL(local);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.pathname !== '/eventiva_test')
    throw new Error('Trust replay conformance requires disposable loopback eventiva_test');
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
const replayFor = (sql: SqlClient.SqlClient) =>
    Layer.build(trustReplay.pipe(Layer.provide(Layer.succeed(SqlClient.SqlClient, sql)))).pipe(
        Effect.map((context) => Context.get(context, TrustReplay))
    );
const fixture = (dialect: Dialect) =>
    Effect.gen(function* () {
        let connection;
        if (dialect === 'postgres') {
            const admin = Context.get(yield* Layer.build(pg(local)), SqlClient.SqlClient);
            const name = `trust_${randomUUID().replaceAll('-', '')}`;
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
        return { sql, replay: yield* replayFor(sql) };
    });
const safe = (failure: TrustFailure, reason: TrustFailure['reason']) => {
    expect(failure).toEqual(new TrustFailure({ gate: 'replay', reason }));
    expect(failure).not.toHaveProperty('cause');
    expect(JSON.stringify(failure)).not.toContain('synthetic-private');
};

for (const dialect of ['postgres', 'sqlite'] as const)
    describe(`${dialect} standalone trust replay`, () => {
        it.scoped(
            'composes four synthetic live gates with durable replay while every success still denies release',
            () =>
                Effect.gen(function* () {
                    const { sql, replay } = yield* fixture(dialect);
                    let revoked = false;
                    const verifier = (gate: TrustEvidence['gate'], reference: string): TrustVerifier => ({
                        verify: (bound, trusted) =>
                            Effect.suspend(() =>
                                revoked
                                    ? Effect.fail(new TrustFailure({ gate, reason: 'revoked' }))
                                    : Effect.succeed({
                                          gate,
                                          request: bound,
                                          reference,
                                          issuedAt: trusted.now,
                                          expiresAt: trusted.now + 1,
                                          revocationCheckedAt: trusted.now,
                                          assurance: 'A2',
                                      })
                            ),
                    });
                    // Synthetic ports test orchestration, not actual authority or provider independence.
                    const gates = Layer.mergeAll(
                        Layer.succeed(IdentityGate, verifier('identity', id(201))),
                        Layer.succeed(ResourceGate, verifier('resource', id(202))),
                        Layer.succeed(WorkloadGate, verifier('workload', id(203))),
                        Layer.succeed(BrokerGate, verifier('broker', id(204))),
                        Layer.succeed(TrustReplay, replay)
                    );
                    const preflight = (input: TrustRequest) =>
                        trustPreflight(input, policy).pipe(Effect.provide(gates));
                    const accepted = yield* preflight(request);
                    expect(accepted).toMatchObject({ decision: 'metadata-preflight-only', release: 'denied' });
                    expect(accepted.audit.replay).toBe(
                        (yield* sql<{ audit: string }>`SELECT audit FROM trust_replay`)[0]?.audit
                    );
                    safe(yield* Effect.flip(preflight(request)), 'replay');
                    revoked = true;
                    expect(yield* Effect.flip(preflight(request))).toEqual(
                        new TrustFailure({ gate: 'identity', reason: 'revoked' })
                    );
                    expect(yield* Effect.flip(preflight({ ...request, nonce: id(205) }))).toEqual(
                        new TrustFailure({ gate: 'identity', reason: 'revoked' })
                    );
                    expect(yield* sql`SELECT nonce FROM trust_replay`).toHaveLength(1);
                })
        );

        it.scoped(
            'persists exact metadata and explicit time, survives layer reconstruction, and rejects all nonce rebinding',
            () =>
                Effect.gen(function* () {
                    const { sql, replay } = yield* fixture(dialect);
                    const audit = yield* replay.consume(request, policy);
                    expect(Schema.is(Schema.UUID)(audit)).toBe(true);
                    const [row] = yield* sql<{
                        nonce: string;
                        request: string;
                        consumed_at: number | string;
                        audit: string;
                    }>`SELECT * FROM trust_replay`;
                    expect(row).toBeDefined();
                    if (!row) return;
                    expect(JSON.parse(row.request)).toEqual(request);
                    expect(Number(row.consumed_at)).toBe(policy.now);
                    expect(row.audit).toBe(audit);
                    const rebuilt = yield* replayFor(sql);
                    for (const changed of [
                        request,
                        { ...request, scope: { ...request.scope, purpose: 'changed' } },
                        { ...request, scope: { ...request.scope, tenant: TenantId.make(id(9)) } },
                        { ...request, keys: { ...request.keys, dekVersion: 2 } },
                        { ...request, nonce: request.nonce.toUpperCase() },
                    ])
                        safe(yield* Effect.flip(rebuilt.consume(changed, policy)), 'replay');
                    const another = yield* rebuilt.consume({ ...request, nonce: id(101) }, policy);
                    expect(another).not.toBe(audit);
                    expect(yield* sql`SELECT * FROM trust_replay`).toHaveLength(2);
                })
        );

        it.scoped('concurrent public claims have exactly one winner and all losers are safe replay failures', () =>
            Effect.gen(function* () {
                const { sql, replay } = yield* fixture(dialect);
                const other = yield* replayFor(sql);
                const results = yield* Effect.all(
                    Array.from({ length: 12 }, (_, index) =>
                        (index % 2 === 0 ? replay : other).consume(request, policy).pipe(Effect.either)
                    ),
                    { concurrency: 'unbounded' }
                );
                expect(results.filter(Either.isRight)).toHaveLength(1);
                const failures = results.filter(Either.isLeft);
                expect(failures).toHaveLength(11);
                for (const failed of failures) safe(failed.left, 'replay');
                expect(yield* sql`SELECT * FROM trust_replay`).toHaveLength(1);
            })
        );

        it.scoped('rejects same-client and foreign ambient transactions before acknowledging or inserting', () =>
            Effect.gen(function* () {
                const { sql, replay } = yield* fixture(dialect);
                const foreign = Context.get(yield* Layer.build(memory()), SqlClient.SqlClient);
                for (const owner of [sql, foreign]) {
                    let acknowledged = false;
                    const result = yield* Effect.either(
                        owner.withTransaction(
                            replay.consume(request, policy).pipe(
                                Effect.tap(() =>
                                    Effect.sync(() => {
                                        acknowledged = true;
                                    })
                                )
                            )
                        )
                    );
                    expect(Either.isLeft(result)).toBe(true);
                    if (Either.isLeft(result)) {
                        expect(result.left).toBeInstanceOf(TrustFailure);
                        if (result.left instanceof TrustFailure) safe(result.left, 'unavailable');
                    }
                    expect(acknowledged).toBe(false);
                    expect(yield* sql`SELECT * FROM trust_replay`).toHaveLength(0);
                }
                yield* replay.consume(request, policy);
            })
        );

        it.scoped(
            'strictly rejects malformed request and policy without leaking their payload or consuming a nonce',
            () =>
                Effect.gen(function* () {
                    const { sql, replay } = yield* fixture(dialect);
                    const secret = 'synthetic-private-trust-sentinel';
                    const extraRequest = { ...request, secret };
                    const extraScope = { ...request, scope: { ...request.scope, secret } };
                    const extraKeys = { ...request, keys: { ...request.keys, secret } };
                    const extraPolicy = { ...policy, secret };
                    const extraTime = { ...policy, freshAfter: { ...policy.freshAfter, secret } };
                    for (const invalid of [
                        extraRequest,
                        extraScope,
                        extraKeys,
                        { ...request, nonce: secret },
                        { ...request, keys: { ...request.keys, dekVersion: 0 } },
                        { ...request, keys: { ...request.keys, encryptionAuthority: request.keys.signingAuthority } },
                    ])
                        safe(yield* Effect.flip(replay.consume(invalid, policy)), 'invalid');
                    for (const invalid of [extraPolicy, extraTime, { ...policy, now: -1 }, { ...policy, now: NaN }])
                        safe(yield* Effect.flip(replay.consume(request, invalid)), 'invalid');
                    expect(yield* sql`SELECT * FROM trust_replay`).toHaveLength(0);
                    yield* replay.consume(request, policy);
                })
        );

        it.scoped('database write failures roll back without a success receipt and outages stay sanitized', () =>
            Effect.gen(function* () {
                const { sql, replay } = yield* fixture(dialect);
                if (dialect === 'postgres') {
                    yield* sql`CREATE FUNCTION reject_trust() RETURNS trigger LANGUAGE plpgsql AS 'BEGIN RAISE EXCEPTION ''synthetic-private-database''; END;'`;
                    yield* sql`CREATE CONSTRAINT TRIGGER reject_trust AFTER INSERT ON trust_replay DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION reject_trust()`;
                } else
                    yield* sql`CREATE TRIGGER reject_trust AFTER INSERT ON trust_replay BEGIN SELECT RAISE(ABORT, 'synthetic-private-database'); END`;
                safe(yield* Effect.flip(replay.consume(request, policy)), 'unavailable');
                expect(yield* sql`SELECT * FROM trust_replay`).toHaveLength(0);
                if (dialect === 'postgres') yield* sql`DROP TRIGGER reject_trust ON trust_replay`;
                else yield* sql`DROP TRIGGER reject_trust`;
                yield* replay.consume(request, policy);
                yield* sql`DROP TABLE trust_replay`;
                safe(yield* Effect.flip(replay.consume({ ...request, nonce: id(102) }, policy)), 'unavailable');
            })
        );
    });
