/**
 * @file tests/storage/src/retained-record-validation.spec.ts
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
import { Storage, type GuardedCommand } from '@eventiva/contracts/storage';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { memory } from '@eventiva/integrations.sql/sqlite';
import { storage } from '@eventiva/integrations.sql/storage';
import { describe, expect, it } from '@effect/vitest';
import { Cause, ConfigProvider, Context, Effect, Exit, Layer, TestClock } from 'effect';

const now = 1794700000123;
const machine = { pending: ['done'] };
/** Keep synthetic record and mutation identities disjoint without a database UUID extension. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
/** Construct a current, unexpired public command; each control changes only its relevant guard. */
const command = (n: number, overrides: Partial<GuardedCommand> = {}): GuardedCommand => ({
    id: id(n),
    expectedState: 'pending',
    expectedVersion: 0,
    idempotencyKey: `retained-${n}`,
    clientMutationId: id(n + 1000),
    deadline: now + 60000,
    ...overrides,
});
/** Retain distinguishable payload bytes so a rejected transition cannot silently replace them. */
const initial = (n: number, leaseUntil: number | null = now + 30000) => ({
    id: id(n),
    state: 'pending',
    version: 0,
    payload: { original: 'retained-payload-canary' },
    leaseUntil,
});

const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
const target = new URL(local);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.pathname !== '/eventiva_test')
    throw new Error('Retained-record tests require a disposable loopback eventiva_test database');
/** Supply the approved PostgreSQL driver with a fixture-only endpoint. */
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
/** Use actual migrations and scoped driver connections, never a mocked transaction or decoder. */
const withStore = <A, E, R>(dialect: Dialect, effect: Effect.Effect<A, E, R | Storage | SqlClient.SqlClient>) =>
    Effect.scoped(
        Effect.gen(
            /** Isolate each case in memory or a unique PostgreSQL database, closing clients before plain DROP. */ function* () {
                // Only this test's synthetic database is created/deleted; production constraints stay installed.
                yield* TestClock.setTime(now);
                let connection;
                if (dialect === 'postgres') {
                    const admin = Context.get(yield* Layer.build(pg(local)), SqlClient.SqlClient);
                    const database = `test_${randomUUID().replaceAll('-', '')}`;
                    yield* admin`CREATE DATABASE ${admin(database)} TEMPLATE template0`;
                    yield* Effect.addFinalizer(
                        /** The scoped client closes first, so cleanup needs no FORCE or extra termination privilege. */ () =>
                            admin`DROP DATABASE ${admin(database)}`.pipe(Effect.orDie)
                    );
                    const url = new URL(local);
                    url.pathname = `/${database}`;
                    connection = yield* Layer.build(pg(url.toString()));
                } else connection = yield* Layer.build(memory());
                const sql = Context.get(connection, SqlClient.SqlClient);
                const migrations = yield* load(
                    fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url))
                );
                yield* migrate(dialect, migrations).pipe(Effect.provideService(SqlClient.SqlClient, sql));
                return yield* effect.pipe(
                    Effect.provide(storage(dialect)),
                    Effect.provideService(SqlClient.SqlClient, sql)
                );
            }
        )
    );

/** Assert the public failure shape and both common diagnostic serializations without leaking stored canaries. */
const invalid = <A, E>(exit: Exit.Exit<A, E>) => {
    expect(exit).toMatchObject({
        _tag: 'Failure',
        cause: { error: { _tag: 'StorageFailure', reason: 'invalid-data' } },
    });
    // Check the rendered Cause as well as JSON: stack/diagnostic formatting is a separate disclosure surface.
    if (Exit.isFailure(exit)) {
        for (const text of [JSON.stringify(exit), Cause.pretty(exit.cause)]) {
            expect(text).not.toContain('retained-lease-canary');
            expect(text).not.toContain('retained-payload-canary');
        }
    }
};

for (const dialect of ['sqlite', 'postgres'] as const)
    describe(`${dialect} retained operational record validation`, /** Run public storage contracts on both real SQL drivers. */ () => {
        it.effect(
            'cannot erase invalid stored payload during a transition',
            /** Corrupt fixture SQL only, then inspect exact durable state after denial. */ () =>
                withStore(
                    dialect,
                    Effect.gen(
                        /** The replacement is valid JSON, so only decoding the original row can catch the corruption. */ function* () {
                            const s = yield* Storage;
                            const sql = yield* SqlClient.SqlClient;
                            yield* s.create(initial(1));
                            // Corrupt after public creation so input validation cannot stand in for retained-row validation.
                            yield* sql`UPDATE operational_record SET payload = ${'{retained-payload-canary'} WHERE id = ${id(1)}`;
                            const before = yield* sql`SELECT * FROM operational_record`;
                            invalid(yield* Effect.exit(s.get(id(1))));
                            const result = yield* Effect.exit(
                                s.compareAndSet(command(1), 'done', { replacement: true }, machine)
                            );
                            expect(yield* sql`SELECT * FROM operational_record`).toEqual(before);
                            expect(yield* sql`SELECT * FROM transition_history`).toEqual([]);
                            invalid(result);
                        }
                    )
                )
        );

        it.effect(
            'preserves valid representations and deadline, expiry and optimistic conflict precedence',
            /** Exercise exact boundaries with an unmoving test clock. */ () =>
                withStore(
                    dialect,
                    Effect.gen(
                        /** Missing and stale requests retain bounded conflicts rather than exposing decoder or existence details. */ function* () {
                            const s = yield* Storage;
                            const sql = yield* SqlClient.SqlClient;
                            for (const [n, lease] of [
                                [10, null],
                                [11, now + 1],
                                [12, now],
                                [13, now + 30000],
                            ] as const)
                                yield* s.create(initial(n, lease));
                            const raw = yield* sql<{
                                version: string | number;
                                lease_until: Date | number | null;
                            }>`SELECT version, lease_until FROM operational_record WHERE id = ${id(11)}`;
                            expect(raw[0]?.version).toBe(dialect === 'postgres' ? '0' : 0);
                            expect(raw[0]?.lease_until).toEqual(dialect === 'postgres' ? new Date(now + 1) : now + 1);
                            // One millisecond in the future must succeed while equality below must expire, without advancing time.
                            for (const n of [10, 11]) {
                                const result = yield* s.compareAndSet(command(n), 'done', { replacement: n }, machine);
                                expect(result).toEqual({
                                    id: id(n),
                                    state: 'done',
                                    version: 1,
                                    payload: { replacement: n },
                                    leaseUntil: null,
                                });
                            }
                            for (const [request, reason] of [
                                [command(12, { expectedVersion: 9 }), 'expired'],
                                [command(13, { expectedVersion: 1 }), 'stale'],
                                [command(13, { expectedState: 'other' }), 'stale'],
                                [command(13, { deadline: now }), 'expired'],
                                [command(99), 'stale'],
                                [command(99, { deadline: now }), 'expired'],
                            ] as const) {
                                expect(
                                    yield* Effect.either(s.compareAndSet(request, 'done', null, machine))
                                ).toMatchObject({ left: { _tag: 'StorageConflict', reason } });
                            }
                            expect(yield* s.get(id(12))).toEqual(initial(12, now));
                            expect(yield* s.get(id(13))).toEqual(initial(13));
                            expect(yield* sql`SELECT * FROM transition_history`).toHaveLength(2);
                        }
                    )
                )
        );
    });

it.effect(
    'sqlite rejects malformed retained lease without erasing row or appending history',
    /** Reproduce SQLite affinity accepting text in the integer lease column. */ () =>
        withStore(
            'sqlite',
            Effect.gen(
                /** Raw fixture corruption is readable by SQL but must never become a successful public transition. */ function* () {
                    const s = yield* Storage;
                    const sql = yield* SqlClient.SqlClient;
                    yield* s.create(initial(20));
                    // SQLite's real affinity permits this fixture corruption; no driver/schema mock can prove the same failure.
                    yield* sql`UPDATE operational_record SET lease_until = ${'retained-lease-canary'} WHERE id = ${id(20)}`;
                    const before = yield* sql`SELECT * FROM operational_record`;
                    invalid(yield* Effect.exit(s.get(id(20))));
                    for (const overrides of [{ expectedVersion: 1 }, { expectedState: 'other' }])
                        expect(
                            yield* Effect.either(s.compareAndSet(command(20, overrides), 'done', null, machine))
                        ).toMatchObject({ left: { _tag: 'StorageConflict', reason: 'stale' } });
                    const result = yield* Effect.exit(
                        s.compareAndSet(command(20), 'done', { replacement: true }, machine)
                    );
                    expect(yield* sql`SELECT * FROM operational_record`).toEqual(before);
                    expect(yield* sql`SELECT * FROM transition_history`).toEqual([]);
                    invalid(result);
                }
            )
        )
);

it.effect(
    'postgres rejects impossible lease text and out-of-range version at the database boundary',
    /** Do not disable PostgreSQL types or CHECK constraints to mimic SQLite corruption. */ () =>
        withStore(
            'postgres',
            Effect.gen(
                /** PostgreSQL rejects each isolated SQL statement and leaves a valid public transition available. */ function* () {
                    const s = yield* Storage;
                    const sql = yield* SqlClient.SqlClient;
                    yield* s.create(initial(30));
                    const before = yield* sql`SELECT * FROM operational_record`;
                    // Exact SQLSTATEs distinguish installed type/CHECK enforcement from an unrelated connection or syntax failure.
                    expect(
                        yield* Effect.either(
                            sql`UPDATE operational_record SET lease_until = ${'retained-lease-canary'} WHERE id = ${id(30)}`
                        )
                    ).toMatchObject({ left: { _tag: 'SqlError', cause: { code: '22007' } } });
                    expect(
                        yield* Effect.either(
                            sql`UPDATE operational_record SET version = 9007199254740992 WHERE id = ${id(30)}`
                        )
                    ).toMatchObject({ left: { _tag: 'SqlError', cause: { code: '23514' } } });
                    expect(yield* sql`SELECT * FROM operational_record`).toEqual(before);
                    expect(yield* sql`SELECT * FROM transition_history`).toEqual([]);
                    expect(yield* s.compareAndSet(command(30), 'done', null, machine)).toMatchObject({
                        state: 'done',
                        version: 1,
                    });
                }
            )
        )
);
