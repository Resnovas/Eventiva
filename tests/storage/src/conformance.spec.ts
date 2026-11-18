/**
 * @file tests/storage/src/conformance.spec.ts
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
import { Conflict, Storage, StorageFailure, type GuardedCommand } from '@eventiva/contracts/storage';
import { Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { CurrentTenant, RoutingDenied, TenantRouter } from '@eventiva/contracts/storage';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { memory } from '@eventiva/integrations.sql/sqlite';
import { storage } from '@eventiva/integrations.sql/storage';
import { router } from '@eventiva/integrations.sql/router';
import { uuidV7 } from '@eventiva/integrations.sql/values';
import { durable } from '@eventiva/runtime/storage';
import { Audit, Integrity } from '@eventiva/runtime/invocation';
import type { Receipt } from '@eventiva/contracts/receipt';
import { describe, expect, expectTypeOf, it } from '@effect/vitest';
import { ConfigProvider, Context, Deferred, Effect, Either, Exit, Fiber, Layer, Schema, TestClock } from 'effect';

/** Produce stable UUIDv7-shaped fixture identifiers without a database extension. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const instant = 1794700000123;
/** Seed an unversioned pending record with a decimal too precise for a JavaScript number. */
const record = (n: number) => ({
    id: id(n),
    state: 'pending',
    version: 0,
    payload: { decimal: '9007199254740993.1200' },
    leaseUntil: null,
});
/** Build a live pending-state CAS request, allowing each negative test to alter one guard. */
const command = (n: number, overrides: Partial<GuardedCommand> = {}): GuardedCommand => ({
    id: id(n),
    expectedVersion: 0,
    expectedState: 'pending',
    idempotencyKey: 'command',
    clientMutationId: id(n + 1000),
    deadline: Date.now() + 60000,
    ...overrides,
});

const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
// This destructive fixture harness must never run against Neon or real data.
const target = new URL(local);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.pathname !== '/eventiva_test')
    throw new Error('Conformance requires a disposable loopback eventiva_test database');
/** Configure a PostgreSQL layer for a previously validated disposable endpoint. */
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
/** Supply fresh migrated storage and SQL services, releasing all resources with the test scope. */
const withStore = <A, E, R>(dialect: Dialect, effect: Effect.Effect<A, E, R | Storage | SqlClient.SqlClient>) =>
    Effect.scoped(
        Effect.gen(
            /** Allocate an isolated backend and align the test clock with wall-clock fixture deadlines. */ function* () {
                // PostgreSQL databases are unique per invocation; SQLite uses a scoped in-memory database.
                yield* TestClock.setTime(Date.now());
                let connection;
                if (dialect === 'postgres') {
                    const adminContext = yield* Layer.build(pg(local));
                    const admin = Context.get(adminContext, SqlClient.SqlClient);
                    const database = `test_${randomUUID().replaceAll('-', '')}`;
                    yield* admin`CREATE DATABASE ${admin(database)} TEMPLATE template0`;
                    yield* Effect.addFinalizer(
                        /** Remove only this fixture database once its scoped connections have closed. */ () =>
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

for (const dialect of ['postgres', 'sqlite'] as const)
    describe(`${dialect} portable storage conformance`, /** Register the same transaction, codec and routing contracts for both SQL dialects. */ () => {
        // Identical public scenarios run per dialect; backend-specific lock mechanics cannot substitute for portable outcomes.
        it.effect(
            'runtime Integrity and Audit use the handler transaction and fail closed without durable evidence',
            /** Verify runtime integrity composes business mutations and durable audit atomically. */ () =>
                withStore(
                    dialect,
                    Effect.gen(
                        /** Exercise duplicate admission and audit loss through the runtime's public ports. */ function* () {
                            // Retained SQL evidence, not just returned receipts, establishes the transaction boundary.
                            const s = yield* Storage;
                            const sql = yield* SqlClient.SqlClient;
                            const caller: CallerIdentity = {
                                subject: Schema.decodeUnknownSync(SubjectId)(id(800)),
                                kind: 'human',
                                tenant: Schema.decodeUnknownSync(TenantId)(id(801)),
                                session: Schema.decodeUnknownSync(SessionId)(id(802)),
                            };
                            const receipt: Receipt = {
                                id: 'success',
                                caller,
                                action: 'test.write',
                                version: 1,
                                inputHash: 'hash',
                                outcome: 'succeeded',
                                startedAt: instant,
                                durationMs: 1,
                            };
                            yield* Effect.gen(
                                /** Use durable runtime services under the authenticated tenant scope. */ function* () {
                                    // An identical concurrent retry must reuse the first commit rather than rerun its handler.
                                    const integrity = yield* Integrity;
                                    const audit = yield* Audit;
                                    yield* audit.ready('test.write');
                                    const request = {
                                        key: 'one',
                                        inputHash: 'hash',
                                        caller,
                                        action: 'test.write',
                                        version: 1
                                    };
                                    const execute = Effect.gen(
                                        /** Stage a domain transition and external-work intent with the handler receipt. */ function* () {
                                            // These writes must share the integrity commit so audit failure cannot leave business effects.
                                            yield* s.create(record(800));
                                            yield* s.compareAndSet(command(800), 'confirmed', null, {
                                                pending: ['confirmed']
                                            });
                                            yield* s.enqueue('runtime-outbox', { amount: '999' });
                                            return { output: { id: id(800) }, receipt };
                                        }
                                    );
                                    const results = yield* Effect.all(
                                        [integrity.commit(request, execute), integrity.commit(request, execute)],
                                        { concurrency: 'unbounded' }
                                    );
                                    expect(
                                        results
                                            .map(
                                                /** Expose whether each racing request performed work or reused its peer's commit. */ (
                                                    r
                                                ) => r.replayed
                                            )
                                            .sort()
                                    ).toEqual([false, true]);
                                    expect(results[0]?.receipt).toEqual(receipt);
                                    expect(results[1]?.receipt).toEqual(receipt);
                                    for (const table of [
                                        'transition_history',
                                        'command_outbox',
                                        'action_receipt',
                                        'action_commit',
                                    ])
                                        expect(yield* sql`SELECT * FROM ${sql(table)}`).toHaveLength(1);
                                    expect(
                                        yield* Effect.either(
                                            integrity.commit({ ...request, inputHash: 'changed' }, execute)
                                        )
                                    ).toMatchObject({ left: { _tag: 'InvocationDenied', reason: 'input-changed' } });
                                    expect(yield* audit.record({ ...receipt, id: 'replay-audit' }, true)).toBe(
                                        'durable'
                                    );
                                    yield* sql`DROP TABLE action_receipt`;
                                    expect(yield* Effect.either(audit.ready('test.write'))).toMatchObject({
                                        left: { _tag: 'AuditUnavailable' },
                                    });
                                    expect(yield* Effect.either(audit.record(receipt, true))).toMatchObject({
                                        left: { _tag: 'AuditUnavailable' },
                                    });
                                    expect(
                                        yield* Effect.either(
                                            integrity.commit(
                                                { ...request, key: 'no-audit' },
                                                Effect.gen(
                                                    /** Attempt a business write whose required receipt table is unavailable. */ function* () {
                                                        // A successful domain write before receipt failure makes rollback observable, not vacuous.
                                                        yield* s.create(record(803));
                                                        return { output: null, receipt };
                                                    }
                                                )
                                            )
                                        )
                                    ).toMatchObject({ left: { _tag: 'AuditUnavailable' } });
                                    expect(yield* s.get(id(803))).toBeUndefined();
                                    expect(
                                        yield* Effect.either(
                                            integrity.commit(
                                                {
                                                    ...request,
                                                    caller: {
                                                        ...caller,
                                                        tenant: Schema.decodeUnknownSync(TenantId)(id(804))
                                                    },
                                                },
                                                execute
                                            )
                                        )
                                    ).toMatchObject({ left: { reason: 'tenant-scope-mismatch' } });
                                }
                            ).pipe(
                                Effect.provide(durable),
                                Effect.provideService(CurrentTenant, { id: caller.tenant! })
                            );
                        }
                    )
                )
        );
        it.effect(
            'round-trips UUIDv7, exact decimal JSON, timestamptz/epoch milliseconds and safe integer boundaries',
            /** Verify portable storage codecs preserve exact supported values and reject unsafe quantities. */ () =>
                withStore(
                    dialect,
                    Effect.gen(
                        /** Compare persisted values at timestamp and integer boundaries across dialects. */ function* () {
                            // Money remains decimal text and epochs remain exact milliseconds rather than lossy driver values.
                            const s = yield* Storage;
                            expect(s.capabilities.device).toBe(false);
                            const value = { ...record(1), leaseUntil: instant };
                            yield* s.create(value);
                            expect(yield* s.get(id(1))).toEqual(value);
                            expect(yield* s.get(id(99))).toBeUndefined();
                            for (const [index, millis] of [-62135596800000, 253402300799999, 1711846800123].entries()) {
                                const boundary = { ...record(900 + index), leaseUntil: millis };
                                yield* s.create(boundary);
                                expect(yield* s.get(boundary.id)).toEqual(boundary);
                            }
                            expect(yield* Effect.either(s.create(value))).toMatchObject({
                                left: { reason: 'duplicate' }
                            });
                            yield* s.stock(id(2), Number.MAX_SAFE_INTEGER);
                            expect(yield* s.available(id(2))).toBe(Number.MAX_SAFE_INTEGER);
                            expect(yield* Effect.either(s.stock(id(3), Number.MAX_SAFE_INTEGER + 1))).toMatchObject({
                                left: { _tag: 'StorageFailure' },
                            });
                            expect(yield* Effect.either(s.available(id(90)))).toMatchObject({
                                left: { operation: 'missing-stock' },
                            });
                        }
                    )
                )
        );
        it.effect(
            'CAS rejects stale state/version, illegal transitions, deadlines and expired leases without history',
            /** Verify guarded state transitions reject invalid guards and arbitrate concurrent writers. */ () =>
                withStore(
                    dialect,
                    Effect.gen(
                        /** Vary each CAS guard before racing equivalent version-zero transitions. */ function* () {
                            // Only one contender may advance a record; invalid requests must not consume its version.
                            const s = yield* Storage;
                            yield* s.create(record(10));
                            const machine = { pending: ['confirmed'], confirmed: [] };
                            for (const [cmd, state, reason] of [
                                [command(10, { expectedVersion: 1 }), 'confirmed', 'stale'],
                                [command(10, { expectedState: 'other' }), 'confirmed', 'stale'],
                                [command(10), 'illegal', 'illegal-transition'],
                                [command(10, { deadline: 0 }), 'confirmed', 'expired'],
                            ] as const)
                                expect(yield* Effect.either(s.compareAndSet(cmd, state, null, machine))).toMatchObject({
                                    left: { reason },
                                });
                            const results = yield* Effect.all(
                                [
                                    s.compareAndSet(command(10), 'confirmed', { done: true }, machine),
                                    s.compareAndSet(
                                        command(10, { clientMutationId: id(2010) }),
                                        'confirmed',
                                        null,
                                        machine
                                    ),
                                ].map(Effect.either),
                                { concurrency: 'unbounded' }
                            );
                            expect(results.filter(Either.isRight)).toHaveLength(1);
                            expect(yield* s.get(id(10))).toMatchObject({ state: 'confirmed', version: 1 });
                            yield* s.create({ ...record(11), leaseUntil: instant });
                            expect(
                                yield* Effect.either(s.compareAndSet(command(11), 'confirmed', null, machine))
                            ).toMatchObject({ left: { reason: 'expired' } });
                        }
                    )
                )
        );
        it.effect(
            'concurrent asymmetric reservations never oversell, releases and expiry credit exactly once',
            /** Verify reservation accounting conserves stock across contention and terminal transitions. */ () =>
                withStore(
                    dialect,
                    Effect.gen(
                        /** Race unequal demand, then distinguish confirmed consumption from released or expired holds. */ function* () {
                            // Count accepted quantities, not just winners: asymmetric requests expose stock overbooking.
                            const s = yield* Storage;
                            yield* s.stock(id(20), 7);
                            const attempts = yield* Effect.all(
                                [4, 3, 2, 5].map(
                                    /** Give each competing quantity a distinct reservation identity and live deadline. */ (
                                        quantity,
                                        i
                                    ) => Effect.either(s.reserve(id(21 + i), id(20), quantity, Date.now() + 60000))
                                ),
                                { concurrency: 'unbounded' }
                            );
                            const consumed = attempts.reduce(
                                /** Sum only admitted demand using the quantity paired with each attempt. */ (
                                    total,
                                    result,
                                    i
                                ) => total + (Either.isRight(result) ? [4, 3, 2, 5][i]! : 0),
                                0
                            );
                            expect(consumed).toBeLessThanOrEqual(7);
                            expect(yield* s.available(id(20))).toBe(7 - consumed);
                            yield* s.stock(id(30), 9);
                            yield* s.reserve(id(31), id(30), 3, Date.now() + 60000);
                            yield* s.settle(id(31), 'released');
                            expect(yield* s.available(id(30))).toBe(9);
                            expect(yield* Effect.either(s.settle(id(31), 'released'))).toMatchObject({
                                left: { reason: 'stale' },
                            });
                            yield* s.reserve(id(32), id(30), 4, Date.now() + 60000);
                            yield* s.settle(id(32), 'confirmed');
                            expect(yield* s.available(id(30))).toBe(5);
                            expect(yield* Effect.either(s.reserve(id(33), id(30), 1, 0))).toMatchObject({
                                left: { reason: 'expired' },
                            });
                            yield* s.reserve(id(34), id(30), 2, Date.now() + 1000);
                            yield* TestClock.adjust('2 seconds');
                            expect(yield* Effect.either(s.settle(id(34), 'confirmed'))).toMatchObject({
                                left: { reason: 'expired' },
                            });
                            yield* s.expire;
                            yield* s.expire;
                            expect(yield* s.available(id(30))).toBe(5);
                        }
                    )
                )
        );
        it.effect(
            'deadline is checked after a contended write lock, not before waiting',
            /** Verify lock waiting cannot extend a guarded command's deadline. */ () =>
                withStore(
                    dialect,
                    Effect.gen(
                        /** Hold the record lock while test time passes beyond the waiting command's deadline. */ function* () {
                            // The barrier ensures expiry happens during contention rather than before the command starts.
                            const s = yield* Storage;
                            const sql = yield* SqlClient.SqlClient;
                            yield* s.create(record(400));
                            const locked = yield* Deferred.make<void>();
                            const release = yield* Deferred.make<void>();
                            const holder = yield* Effect.fork(
                                s.transaction(
                                    Effect.gen(
                                        /** Own the write lock until the test explicitly releases the blocked contender. */ function* () {
                                            // A no-op update acquires the real database lock without advancing domain state.
                                            yield* sql`UPDATE operational_record SET state = state WHERE id = ${id(400)}`;
                                            yield* Deferred.succeed(locked, undefined);
                                            yield* Deferred.await(release);
                                        }
                                    )
                                )
                            );
                            yield* Deferred.await(locked);
                            const pending = yield* Effect.fork(
                                Effect.either(
                                    s.compareAndSet(command(400, { deadline: Date.now() + 1000 }), 'confirmed', null, {
                                        pending: ['confirmed'],
                                    })
                                )
                            );
                            yield* TestClock.adjust('2 seconds');
                            yield* Deferred.succeed(release, undefined);
                            yield* Fiber.join(holder);
                            expect(yield* Fiber.join(pending)).toMatchObject({ left: { reason: 'expired' } });
                            expect(yield* s.get(id(400))).toMatchObject({ state: 'pending', version: 0 });
                            expect(yield* sql`SELECT * FROM transition_history`).toHaveLength(0);
                        }
                    )
                )
        );
        it.effect(
            'interruption of a running handler rolls back and releases its duplicate-key lock',
            /** Verify interrupted admission leaves neither domain data nor an unusable deduplication key. */ () =>
                withStore(
                    dialect,
                    Effect.gen(
                        /** Interrupt after a tentative write and retry the exact same integrity key. */ function* () {
                            // Waiting for the handler barrier prevents cancellation before the rollback path is entered.
                            const s = yield* Storage;
                            const ready = yield* Deferred.make<void>();
                            const fiber = yield* Effect.fork(
                                s.commit(
                                    { key: 'cancel', inputHash: 'h' },
                                    Effect.gen(
                                        /** Leave a tentative record behind a barrier until interrupted by the test. */ function* () {
                                            // The never-ending handler keeps the enclosing commit open for cancellation.
                                            yield* s.create(record(44));
                                            yield* Deferred.succeed(ready, undefined);
                                            return yield* Effect.never;
                                        }
                                    )
                                )
                            );
                            yield* Deferred.await(ready);
                            yield* Fiber.interrupt(fiber);
                            expect(yield* s.get(id(44))).toBeUndefined();
                            expect(
                                (yield* s.commit(
                                    { key: 'cancel', inputHash: 'h' },
                                    Effect.succeed({ output: null, receipt: null })
                                )).replayed
                            ).toBe(false);
                        }
                    )
                )
        );
        it.effect(
            'same-key commits serialize, return the committed receipt and reject changed hashes',
            /** Verify storage commit deduplication serializes work and binds replay to the original input hash. */ () =>
                withStore(
                    dialect,
                    Effect.gen(
                        /** Race the same key and compare receipts before attempting a changed-input retry. */ function* () {
                            // Duplicate execution would collide on both the record and outbox identities.
                            const s = yield* Storage;
                            const execute = Effect.gen(
                                /** Couple the created record, queued command and receipt in one commit. */ function* () {
                                    // Fixed record/outbox keys make duplicate handler execution fail instead of hiding behind equivalent outputs.
                                    yield* s.create(record(40));
                                    yield* s.enqueue('send-40', { type: 'external-payment', amount: '1000' });
                                    return {
                                        output: { id: id(40) },
                                        receipt: { id: 'receipt-40', outcome: 'succeeded' }
                                    };
                                }
                            );
                            const results = yield* Effect.all(
                                [
                                    s.commit({ key: 'a1', inputHash: 'hash' }, execute),
                                    s.commit({ key: 'a1', inputHash: 'hash' }, execute),
                                ],
                                { concurrency: 'unbounded' }
                            );
                            expect(
                                results
                                    .map(
                                        /** Distinguish the single executing request from its committed replay. */ (
                                            r
                                        ) => r.replayed
                                    )
                                    .sort()
                            ).toEqual([false, true]);
                            expect(results[0]?.receipt).toEqual(results[1]?.receipt);
                            expect(
                                yield* Effect.either(s.commit({ key: 'a1', inputHash: 'changed' }, execute))
                            ).toMatchObject({
                                left: { reason: 'input-changed' },
                            });
                        }
                    )
                )
        );
        for (const failure of ['failure', 'defect', 'interruption'] as const)
            it.effect(
                `A1 ${failure} rolls back domain, dedup, history, receipt and outbox`,
                /** Verify every unsuccessful Effect exit rolls back all transaction evidence. */ () =>
                    withStore(
                        dialect,
                        Effect.gen(
                            /** Exercise the selected failure channel and prove the same key remains admissible. */ function* () {
                                // Inspect every participant table so a partial rollback cannot masquerade as handler failure.
                                const s = yield* Storage;
                                const sql = yield* SqlClient.SqlClient;
                                const stop =
                                    failure === 'failure'
                                        ? Effect.fail(new Conflict({ id: 'test', reason: 'stale' }))
                                        : failure === 'defect'
                                          ? Effect.die('test')
                                          : Effect.interrupt;
                                const exit = yield* Effect.exit(
                                    s.commit(
                                        { key: 'rollback', inputHash: 'h' },
                                        Effect.gen(
                                            /** Populate domain, history, outbox and audit before the selected unsuccessful exit. */ function* () {
                                                // The injected stop comes after all writes, maximizing observable rollback coverage.
                                                yield* s.create(record(50));
                                                yield* s.compareAndSet(command(50), 'confirmed', null, {
                                                    pending: ['confirmed']
                                                });
                                                yield* s.enqueue('send-50', { amount: '1' });
                                                yield* s.audit('receipt-50', { outcome: 'succeeded' });
                                                return yield* stop;
                                            }
                                        )
                                    )
                                );
                                expect(Exit.isFailure(exit)).toBe(true);
                                for (const table of [
                                    'operational_record',
                                    'transition_history',
                                    'command_outbox',
                                    'action_receipt',
                                    'action_commit',
                                ])
                                    expect(yield* sql`SELECT * FROM ${sql(table)}`).toHaveLength(0);
                                expect(
                                    (yield* s.commit(
                                        { key: 'rollback', inputHash: 'h' },
                                        Effect.succeed({ output: null, receipt: null })
                                    )).replayed
                                ).toBe(false);
                            }
                        )
                    )
            );
        it.effect(
            'idempotent reconciliation keeps exact money and immutable audit/ledger evidence',
            /** Verify payment replay is exact and committed ledger and receipt evidence cannot be rewritten. */ () =>
                withStore(
                    dialect,
                    Effect.gen(
                        /** Race an oversized exact payment amount and attempt direct evidence mutation. */ function* () {
                            // Values above numeric precision must survive as text, with changed-amount retries rejected.
                            const s = yield* Storage;
                            const sql = yield* SqlClient.SqlClient;
                            const results = yield* Effect.all(
                                [
                                    s.reconcile('evt', 'payment', 'GBP', '90071992547409931234'),
                                    s.reconcile('evt', 'payment', 'GBP', '90071992547409931234'),
                                ],
                                { concurrency: 'unbounded' }
                            );
                            expect(results.sort()).toEqual(['applied', 'replayed']);
                            expect(yield* Effect.either(s.reconcile('evt', 'payment', 'GBP', '1'))).toMatchObject({
                                left: { reason: 'input-changed' },
                            });
                            expect(yield* sql`SELECT minor_units FROM payment_ledger`).toEqual([
                                { minor_units: '90071992547409931234' },
                            ]);
                            expect(
                                Exit.isFailure(yield* Effect.exit(sql`UPDATE payment_ledger SET minor_units = '0'`))
                            ).toBe(true);
                            yield* s.audit('audit', { outcome: 'denied' });
                            yield* s.audit('audit', { outcome: 'denied' });
                            expect(yield* Effect.either(s.audit('audit', null))).toMatchObject({
                                left: { operation: 'receipt-id-reused' },
                            });
                            expect(Exit.isFailure(yield* Effect.exit(sql`DELETE FROM action_receipt`))).toBe(true);
                        }
                    )
                )
        );
        it.effect(
            'migrations replay safely and reject changed/deleted applied checksums',
            /** Verify migration history is immutable, transactional and compatible with older nullable-column writers. */ () =>
                withStore(
                    dialect,
                    Effect.gen(
                        /** Replay the migration set, reject history tampering and recover from failed expansion. */ function* () {
                            const entries = yield* load(
                                fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url))
                            );
                            yield* Effect.all([migrate(dialect, entries), migrate(dialect, entries)], {
                                concurrency: 'unbounded',
                            });
                            expect(yield* Effect.either(migrate(dialect, []))).toMatchObject({
                                left: { operation: 'applied-migration-changed' },
                            });
                            expect(
                                yield* Effect.either(
                                    migrate(
                                        dialect,
                                        entries.map(
                                            /** Corrupt only the claimed checksum to test applied-history integrity. */ (
                                                e
                                            ) => ({ ...e, checksum: 'changed' })
                                        )
                                    )
                                )
                            ).toMatchObject({ left: { operation: 'applied-migration-changed' } });
                            const sql = yield* SqlClient.SqlClient;
                            const bad =
                                'CREATE TABLE bad_expansion (value text);\n-- statement-breakpoint\nINVALID SQL';
                            const last = entries.at(-1);
                            expect(last).toBeDefined();
                            if (!last) return yield* Effect.dieMessage('Expected checked-in migrations');
                            const nextName = `${(Number(last.name.slice(0, 4)) + 1).toString().padStart(4, '0')}.sql`;
                            expect(
                                yield* Effect.either(
                                    migrate(dialect, [
                                        ...entries,
                                        {
                                            name: nextName,
                                            sql: bad,
                                            checksum: createHash('sha256').update(bad).digest('hex'),
                                        },
                                    ])
                                )
                            ).toMatchObject({ left: { operation: 'migrate' } });
                            expect(Exit.isFailure(yield* Effect.exit(sql`SELECT * FROM bad_expansion`))).toBe(true);
                            const expansion = 'CREATE TABLE expansion (id text PRIMARY KEY, optional_value text);';
                            expect(
                                yield* Effect.either(
                                    migrate(dialect, [
                                        ...entries,
                                        { name: nextName, sql: expansion, checksum: 'wrong' }
                                    ])
                                )
                            ).toMatchObject({ left: { operation: 'migration-checksum' } });
                            yield* migrate(dialect, [
                                ...entries,
                                {
                                    name: nextName,
                                    sql: expansion,
                                    checksum: createHash('sha256').update(expansion).digest('hex'),
                                },
                            ]);
                            // An old client can still omit the new nullable column.
                            yield* sql`INSERT INTO expansion (id) VALUES ('old-client')`;
                            expect(yield* sql`SELECT * FROM expansion`).toEqual([
                                { id: 'old-client', optional_value: null }
                            ]);
                            expect(
                                Exit.isFailure(
                                    yield* Effect.exit(sql`UPDATE storage_migration SET checksum = 'changed'`)
                                )
                            ).toBe(true);
                            expect(
                                yield* Effect.either(
                                    migrate(dialect, [...entries, { name: '0000.sql', sql: '', checksum: '' }])
                                )
                            ).toMatchObject({ _tag: 'Left' });
                        }
                    )
                )
        );
        it.effect(
            'storage diagnostics never carry rejected input, SQL parameters or filesystem paths',
            /** Verify failures expose bounded storage metadata rather than rejected payload or infrastructure detail. */ () =>
                withStore(
                    dialect,
                    Effect.gen(
                        /** Send the same private sentinel through codec, SQL and filesystem failures. */ function* () {
                            // Multiple renderings catch both enumerable error fields and textual diagnostic leakage.
                            const s = yield* Storage;
                            const secret = 'synthetic-private-storage-sentinel';
                            const invalid = yield* Effect.flip(s.create({ ...record(66), id: secret }));
                            expect(invalid).toMatchObject({ operation: 'codec', reason: 'invalid-data' });
                            yield* s.enqueue(secret, secret);
                            const duplicate = yield* Effect.flip(s.enqueue(secret, secret));
                            expect(duplicate).toMatchObject({ operation: 'sql', reason: 'database' });
                            const missing = yield* Effect.flip(load(`/missing/${secret}`));
                            expect(missing).toMatchObject({ operation: 'load-migrations', reason: 'filesystem' });
                            for (const failure of [invalid, duplicate, missing]) {
                                expect(failure).not.toHaveProperty('cause');
                                expect(JSON.stringify(failure)).not.toContain(secret);
                                expect(String(failure)).not.toContain(secret);
                            }
                        }
                    )
                )
        );
        it.effect(
            'fails closed when durable audit, outbox or storage are unavailable',
            /** Verify unavailable durable participants cannot be reported as empty data or successful commits. */ () =>
                withStore(
                    dialect,
                    Effect.gen(
                        /** Remove disposable backing tables and verify bounded failures plus domain rollback. */ function* () {
                            // Removing audit after startup tests transactional fail-closed behavior, not only readiness.
                            const s = yield* Storage;
                            const sql = yield* SqlClient.SqlClient;
                            yield* s.enqueue('one', null);
                            expect(yield* Effect.either(s.enqueue('one', null))).toMatchObject({
                                left: { _tag: 'StorageFailure' },
                            });
                            yield* sql`DROP TABLE action_receipt`;
                            expect(yield* Effect.either(s.audit('missing', null))).toMatchObject({
                                left: { _tag: 'StorageFailure' },
                            });
                            expect(
                                yield* Effect.either(
                                    s.commit(
                                        { key: 'no-audit', inputHash: 'h' },
                                        Effect.gen(
                                            /** Attempt a domain insert that must roll back when receipt persistence fails. */ function* () {
                                                // Insert before the unavailable evidence boundary so the later absence proves transaction rollback.
                                                yield* s.create(record(65));
                                                return { output: null, receipt: null };
                                            }
                                        )
                                    )
                                )
                            ).toMatchObject({ left: { _tag: 'StorageFailure' } });
                            expect(yield* s.get(id(65))).toBeUndefined();
                            yield* sql`DROP TABLE transition_history`;
                            yield* sql`DROP TABLE operational_record`;
                            expect(yield* Effect.either(s.get(id(65)))).toMatchObject({
                                left: { _tag: 'StorageFailure' }
                            });
                            yield* sql`DROP TABLE reservation`;
                            expect(yield* Effect.either(s.expire)).toMatchObject({ left: { _tag: 'StorageFailure' } });
                        }
                    )
                )
        );
        it.effect(
            'routes only authenticated tenant scopes and isolates two operational databases',
            /** Verify routing authenticates before resolution and preserves physical tenant isolation. */ () =>
                withStore(
                    dialect,
                    Effect.gen(
                        /** Seed the first database before constructing a second isolated routing target. */ function* () {
                            // Retain the first capability: the nested store reuses its ID with different data to expose ambient-store reads.
                            const a = yield* Storage;
                            yield* a.create(record(70));
                            return yield* withStore(
                                dialect,
                                Effect.gen(
                                    /** Reuse a record ID across databases while testing live route revocation and nested scope denial. */ function* () {
                                        // Resolver counts distinguish denial before database selection from denial after exposure.
                                        const b = yield* Storage;
                                        expect(yield* b.get(id(70))).toBeUndefined();
                                        yield* b.create({ ...record(70), payload: 'tenant-b' });
                                        const ta = Schema.decodeUnknownSync(TenantId)(id(701));
                                        const tb = Schema.decodeUnknownSync(TenantId)(id(702));
                                        let allowed = true;
                                        let resolutions = 0;
                                        const layer = router(
                                            /** Select a fixture database while recording whether resolution was reached. */ (
                                                tenant
                                            ) =>
                                                Effect.sync(
                                                    /** Count authorized resolver entry before selecting the corresponding fixture store. */ () => {
                                                        resolutions++;
                                                        return tenant === ta ? a : b;
                                                    }
                                                ),
                                            /** Consult mutable permission state on every routing attempt. */ () =>
                                                (allowed
                                                    ? Effect.void
                                                    : Effect.fail(new RoutingDenied({ reason: 'revoked' })))
                                        );
                                        const who: CallerIdentity = {
                                            subject: Schema.decodeUnknownSync(SubjectId)(id(703)),
                                            kind: 'human',
                                            tenant: ta,
                                            session: Schema.decodeUnknownSync(SessionId)(id(704)),
                                        };
                                        const operation = Effect.gen(
                                            /** Resolve the authenticated first tenant and read only through its supplied storage. */ function* () {
                                                // Acquiring Storage inside the routed effect prevents the test from bypassing tenant selection.
                                                const r = yield* TenantRouter;
                                                return yield* r.run(
                                                    ta,
                                                    Effect.flatMap(
                                                        Storage,
                                                        /** Read from the router-selected store rather than an ambient SQL client. */ (
                                                            s
                                                        ) => s.get(id(70))
                                                    )
                                                );
                                            }
                                        );
                                        expect(
                                            yield* Effect.either(operation.pipe(Effect.provide(layer)))
                                        ).toMatchObject({
                                            left: { _tag: 'RoutingDenied' },
                                        });
                                        expect(resolutions).toBe(0);
                                        expect(
                                            yield* operation.pipe(
                                                Effect.provide(layer),
                                                Effect.provideService(Caller, who)
                                            )
                                        ).toMatchObject({ payload: record(70).payload });
                                        allowed = false;
                                        expect(
                                            yield* Effect.either(
                                                operation.pipe(
                                                    Effect.provide(layer),
                                                    Effect.provideService(Caller, who)
                                                )
                                            )
                                        ).toMatchObject({ left: { reason: 'revoked' } });
                                        allowed = true;
                                        expect(
                                            yield* Effect.either(
                                                operation.pipe(
                                                    Effect.provide(layer),
                                                    Effect.provideService(Caller, who),
                                                    Effect.provideService(CurrentTenant, { id: tb })
                                                )
                                            )
                                        ).toMatchObject({ left: { _tag: 'RoutingDenied' } });
                                    }
                                )
                            );
                        }
                    )
                )
        );
    });

it('keeps storage error constructor fields exact and preserves tagged error behavior', /** Verify exact constructor contracts and tagged errors without raw cause exposure. */ () => {
    // Compile-time exactness and runtime serialization are separate protections against accidental raw-driver disclosure.
    expectTypeOf<ConstructorParameters<typeof StorageFailure>[0]>().toEqualTypeOf<
        Pick<StorageFailure, 'operation' | 'reason'>
    >();
    expectTypeOf<ConstructorParameters<typeof Conflict>[0]>().toEqualTypeOf<Pick<Conflict, 'id' | 'reason'>>();
    expectTypeOf<ConstructorParameters<typeof RoutingDenied>[0]>().toEqualTypeOf<Pick<RoutingDenied, 'reason'>>();
    expectTypeOf<{ reason: 'database' }>().not.toExtend<ConstructorParameters<typeof StorageFailure>[0]>();
    expectTypeOf<{ id: string }>().not.toExtend<ConstructorParameters<typeof Conflict>[0]>();
    expectTypeOf<{ operation: string }>().not.toExtend<ConstructorParameters<typeof RoutingDenied>[0]>();
    expectTypeOf<{ operation: string; reason: 'raw-driver-error' }>().not.toExtend<
        ConstructorParameters<typeof StorageFailure>[0]
    >();
    for (const [error, tag] of [
        [new StorageFailure({ operation: 'codec', reason: 'invalid-data' }), 'StorageFailure'],
        [new Conflict({ id: id(1), reason: 'stale' }), 'StorageConflict'],
        [new RoutingDenied({ reason: 'authenticated tenant scope required' }), 'RoutingDenied'],
    ] as const) {
        expect(error).toBeInstanceOf(Error);
        expect(error._tag).toBe(tag);
        expect(error).not.toHaveProperty('cause');
    }
    expect(new StorageFailure({ operation: 'missing-stock' })).not.toHaveProperty('reason');
});

it.effect(
    'UUIDv7 generation is unique and ordered across milliseconds without database extensions',
    /** Verify local UUID generation remains unique within a millisecond and ordered across time. */ () =>
        Effect.gen(
            /** Compare a same-time UUID batch with a later UUID under the deterministic test clock. */ function* () {
                // Same-millisecond uniqueness is distinct from cross-millisecond ordering; both are required here.
                yield* TestClock.setTime(1000000);
                const first = yield* Effect.all(
                    Array.from(
                        { length: 100 },
                        /** Request a fresh UUID effect for each member of the same-time batch. */ () => uuidV7
                    )
                );
                expect(new Set(first).size).toBe(100);
                yield* TestClock.adjust(1);
                const later = yield* uuidV7;
                expect(
                    first.every(
                        /** Require every earlier-time UUID to sort before the later-time UUID. */ (value) =>
                            value < later
                    )
                ).toBe(true);
                expect(yield* Effect.either(load('/nonexistent-eve42-migrations'))).toMatchObject({
                    left: { operation: 'load-migrations' },
                });
            }
        )
);
