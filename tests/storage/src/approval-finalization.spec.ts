/**
 * @file tests/storage/src/approval-finalization.spec.ts
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
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqlClient, type SqlConnection } from '@effect/sql';
import { SqlError } from '@effect/sql/SqlError';
import { ApprovalRecord, ApprovalStore, approvalRetentionEnd } from '@eventiva/contracts/approval';
import { ApprovalRetentionMaintenance } from '@eventiva/contracts/approval-retention';
import { CallerIdentity } from '@eventiva/contracts/caller';
import { TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { approvalStore } from '@eventiva/integrations.sql/approval';
import { approvalRetentionMaintenance } from '@eventiva/integrations.sql/approval-retention';
import { type Dialect, load, migrate } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { localFile } from '@eventiva/integrations.sql/sqlite';
import { describe, expect, it } from '@effect/vitest';
import { Cause, ConfigProvider, Context, Effect, Exit, Layer, Redacted, Schema, TestClock } from 'effect';

/** Ordered UUIDs make the original cursor and successful lookahead observably distinct. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const tenant = TenantId.make(id(1));
const human = Schema.decodeUnknownSync(CallerIdentity)({ subject: id(2), session: id(3), tenant, kind: 'human' });
const start = Date.UTC(2024, 0, 1);
const sqlCanary = 'private-finalization-sql';
const connectionCanary = 'postgres://private-connection-canary@invalid/private';
const proofCanary = 'private-proof-canary';
const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
const target = new URL(local);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.pathname !== '/eventiva_test')
    throw new Error('Finalization qualification requires disposable loopback eventiva_test');

/** Limit each client to one physical connection so fixture cleanup reaches its unresolved transaction. */
const pg = (url: string) =>
    client.pipe(
        Layer.provide(
            Layer.setConfigProvider(
                ConfigProvider.fromMap(
                    new Map([
                        ['DATABASE_URL', url],
                        ['DATABASE_POOL_SIZE', '1'],
                    ])
                )
            )
        )
    );

/** Open two independent physical clients to an isolated, actually migrated database. */
const database = (dialect: Dialect) =>
    Effect.gen(
        /** Close both clients before deleting this scenario's physical database. */ function* () {
            // Register database disposal before clients, so connections close first even after a failed assertion.
            let layer;
            if (dialect === 'postgres') {
                const admin = Context.get(yield* Layer.build(pg(local)), SqlClient.SqlClient);
                const name = `finalization_${randomUUID().replaceAll('-', '')}`;
                yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                yield* Effect.addFinalizer(
                    /** Drop only this uniquely owned disposable database after client scopes close. */
                    () => admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie)
                );
                const url = new URL(local);
                url.pathname = `/${name}`;
                layer = pg(url.toString());
            } else {
                const directory = yield* Effect.sync(
                    /** Give the observer a separate file-backed SQLite connection, never the writer's transaction view. */
                    () => mkdtempSync(join(tmpdir(), 'approval-finalization-'))
                );
                yield* Effect.addFinalizer(
                    /** Dispose only this test's ephemeral SQLite files. */
                    () =>
                        Effect.sync(
                            /** Remove only fixture files after both handles close. */ () =>
                                rmSync(directory, { recursive: true, force: true })
                        )
                );
                layer = localFile(Redacted.make(join(directory, 'tenant.sqlite')));
            }
            const sql = Context.get(yield* Layer.build(layer), SqlClient.SqlClient);
            // A fresh layer identity prevents Layer memoization from returning the writer as its own observer.
            const observer = Context.get(yield* Layer.build(Layer.fresh(layer)), SqlClient.SqlClient);
            yield* migrate(
                dialect,
                yield* load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url)))
            ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            return { sql, observer };
        }
    );

/** Build real producer/maintenance services; no transaction, statement or persistence implementation is replaced. */
const fixture = (dialect: Dialect) =>
    Effect.gen(
        /** Route the public services to the writer, never the observer. */ function* () {
            // Both services capture the writer; independent reads never inherit its transaction context.
            const { sql, observer } = yield* database(dialect);
            const context = yield* Layer.build(
                Layer.merge(approvalStore, approvalRetentionMaintenance).pipe(
                    Layer.provide(Layer.succeed(SqlClient.SqlClient, sql)),
                    Layer.provide(Layer.succeed(CurrentTenant, { id: tenant }))
                )
            );
            return {
                sql,
                observer,
                store: Context.get(context, ApprovalStore),
                maintenance: Context.get(context, ApprovalRetentionMaintenance),
            };
        }
    );

/** Produce valid synthetic approval state with an independently distinguishable private binding. */
const record = (n: number): ApprovalRecord =>
    Schema.decodeUnknownSync(ApprovalRecord)({
        schemaVersion: 1,
        id: id(n),
        revision: 0,
        binding: {
            tenant,
            principal: human.subject,
            action: 'fixture.finalization.write',
            version: 1,
            inputHash: proofCanary,
            writeKey: `write-${n}`,
        },
        approver: human,
        issuedAt: start,
        expiresAt: start + 1000,
        limits: {},
        stepUp: false,
        retention: 90,
        retainUntil: approvalRetentionEnd(start + 1000, 90),
        usedAt: null,
        revokedAt: null,
    });

type Fault = 'commit-before' | 'commit-ack' | 'rollback-before' | 'defect' | 'interrupt' | 'mixed' | 'none';

/** Patch only the actual driver's finalization method; BEGIN, body statements and installed transaction owner stay real. */
const finalizationFault = (sql: SqlClient.SqlClient, fault: Fault) =>
    Effect.gen(
        /** Preserve the installed transaction implementation and restore the driver descriptor on every exit. */ function* () {
            // Pg constructs a ConnectionImpl for each reservation; its per-client prototype is the shared driver seam.
            const connection = yield* Effect.scoped(sql.reserve);
            const owner: SqlConnection.Connection = Object.hasOwn(connection, 'executeUnprepared')
                ? connection
                : Object.getPrototypeOf(connection);
            const descriptor = Object.getOwnPropertyDescriptor(owner, 'executeUnprepared');
            if (!descriptor) return yield* Effect.die('Installed driver finalization seam absent');
            const execute = owner.executeUnprepared;
            let armed = true;
            let observed = 0;
            yield* Effect.addFinalizer(
                /** Restore exactly the original driver descriptor, including after a red assertion. */
                () =>
                    Effect.sync(
                        /** Restore receiver behavior and descriptor attributes without replacing the client. */ () =>
                            Object.defineProperty(owner, 'executeUnprepared', descriptor)
                    )
            );
            Object.defineProperty(owner, 'executeUnprepared', {
                ...descriptor,
                /** Inject one fault at the real connection boundary, preserving receiver and real COMMIT when selected. */
                value: function (
                    this: SqlConnection.Connection,
                    statement: string,
                    params: ReadonlyArray<unknown>,
                    transform: Parameters<SqlConnection.Connection['executeUnprepared']>[2]
                ) {
                    // Fail once so explicit fixture recovery and retry cannot be mistaken for automatic service retry.
                    const command = fault === 'rollback-before' ? 'ROLLBACK' : 'COMMIT';
                    if (!armed || statement !== command) return execute.call(this, statement, params, transform);
                    armed = false;
                    observed++;
                    if (fault === 'none') return execute.call(this, statement, params, transform);
                    if (fault === 'defect') return Effect.die('unrelated-defect');
                    if (fault === 'interrupt') return Effect.interrupt;
                    const error = Effect.fail(
                        new SqlError({
                            message: sqlCanary,
                            cause: { connection: connectionCanary, proof: proofCanary },
                        })
                    );
                    if (fault === 'mixed')
                        return Effect.failCause(
                            Cause.sequential(
                                Cause.parallel(
                                    Cause.die(new SqlError({ message: sqlCanary, cause: connectionCanary })),
                                    Cause.die('unrelated-defect')
                                ),
                                Cause.fail(new SqlError({ cause: proofCanary }))
                            )
                        );
                    return fault === 'commit-ack'
                        ? execute.call(this, statement, params, transform).pipe(Effect.zipRight(error))
                        : error;
                },
            });
            return {
                /** Disarm fault before fixture cleanup or an explicitly requested retry. */
                disarm: () => {
                    armed = false;
                },
                /** Assert that a test actually reached the selected finalization seam. */
                observed: () => observed,
            };
        }
    );

/** Read only independently committed facts, not a transaction-local successful return value. */
const snapshot = (sql: SqlClient.SqlClient) =>
    Effect.gen(
        /** Compare full evidence bytes, permits and unrelated durable tables through the observer. */ function* () {
            const proofs = yield* sql`SELECT id, revision, body FROM approval_proof ORDER BY id`;
            const decisions = yield* sql`SELECT * FROM approval_decision ORDER BY proof_id, revision`;
            const permits = yield* sql`SELECT * FROM approval_retention_permit`;
            const commits = yield* sql`SELECT * FROM action_commit`;
            const receipts = yield* sql`SELECT * FROM action_receipt`;
            const outbox = yield* sql`SELECT * FROM command_outbox`;
            const records = yield* sql`SELECT * FROM operational_record`;
            const history = yield* sql`SELECT * FROM transition_history`;
            return { proofs, decisions, permits, commits, receipts, outbox, records, history };
        }
    );

for (const dialect of ['sqlite', 'postgres'] as const) {
    describe(`approval finalization ${dialect}`, /** Exercise both installed drivers with the same observable contract. */ () => {
        // The same page and independent snapshots distinguish acknowledgement loss from pre-commit rejection.
        for (const fault of ['commit-before', 'commit-ack', 'rollback-before', 'none'] as const) {
            it.scoped(
                fault,
                /** A failed acknowledgement never grants cursor progress or deletion counts. */ () =>
                    Effect.gen(
                        /** Observe state before asserting privacy so red evidence also qualifies the real commit outcome. */ function* () {
                            // Lookahead forces a next cursor on ordinary success, exposing accidental success after finalization faults.
                            const f = yield* fixture(dialect);
                            const a = record(10);
                            const b = record(11);
                            yield* TestClock.setTime(start);
                            yield* f.store.save(a, human, 'issued');
                            yield* f.store.save(b, human, 'issued');
                            yield* f.sql`INSERT INTO action_commit (key, input_hash, result) VALUES (${a.binding.writeKey}, 'hash', 'result')`;
                            yield* f.sql`INSERT INTO action_receipt (id, receipt) VALUES (${a.id}, 'receipt')`;
                            yield* f.sql`INSERT INTO command_outbox (id, command) VALUES (${a.id}, 'outbox')`;
                            yield* f.sql`INSERT INTO operational_record (id, state, version, payload) VALUES (${id(80)}, 'open', 0, '{}')`;
                            yield* f.sql`INSERT INTO transition_history (command_id, record_id, previous_state, next_state, version, occurred_at) VALUES (${id(81)}, ${id(80)}, 'new', 'open', 0, ${dialect === 'postgres' ? new Date(start).toISOString() : start})`;
                            if (fault === 'rollback-before')
                                yield* f.sql`UPDATE approval_proof SET body = ${proofCanary} WHERE id = ${b.id}`;
                            const before = yield* snapshot(f.observer);
                            yield* TestClock.setTime(a.retainUntil);
                            const injection = yield* finalizationFault(f.sql, fault);
                            const request = { tenant, limit: fault === 'rollback-before' ? 2 : 1, after: id(9) };
                            const exit = yield* Effect.exit(f.maintenance.run(request));
                            expect(injection.observed()).toBe(1);
                            injection.disarm();
                            const after = yield* snapshot(f.observer);
                            // The lost-ack case really commits; rejection/failed rollback leave the prior committed snapshot visible.
                            if (fault === 'commit-ack' || fault === 'none') {
                                expect(after).toEqual({
                                    ...before,
                                    proofs: before.proofs.slice(1),
                                    decisions: before.decisions.slice(1),
                                });
                            } else expect(after).toEqual(before);
                            expect(after.permits).toEqual([]);
                            // Faults before finalization leave a transaction open in these drivers. Settle only in the test, never in the service.
                            if (fault === 'commit-before' || fault === 'rollback-before') {
                                yield* Effect.scoped(
                                    Effect.flatMap(
                                        f.sql.reserve,
                                        /** Explicit fixture recovery does not imply production recovery. */ (conn) =>
                                            conn.executeUnprepared('ROLLBACK', [], undefined)
                                    )
                                );
                                expect(yield* snapshot(f.observer)).toEqual(before);
                            }
                            if (fault === 'rollback-before')
                                yield* f.sql`UPDATE approval_proof SET body = ${JSON.stringify(b)} WHERE id = ${b.id}`;
                            if (fault === 'none') {
                                expect(exit).toMatchObject({
                                    _tag: 'Success',
                                    value: { scanned: 1, deletedDecisions: 1, deletedProofs: 1, next: a.id },
                                });
                            } else {
                                expect(Exit.isFailure(exit)).toBe(true);
                                const serialized = JSON.stringify(exit);
                                const pretty = Exit.isFailure(exit) ? Cause.pretty(exit.cause) : '';
                                for (const canary of [sqlCanary, connectionCanary, proofCanary]) {
                                    expect(serialized).not.toContain(canary);
                                    expect(pretty).not.toContain(canary);
                                }
                                expect(exit).toMatchObject({
                                    _tag: 'Failure',
                                    cause: {
                                        _tag: 'Fail',
                                        error: { _tag: 'ApprovalRetentionFailure', reason: 'unavailable' },
                                    },
                                });
                                expect(serialized).not.toContain('deletedProofs');
                                expect(serialized).not.toContain('next');
                            }
                            const retry = yield* f.maintenance.run(request);
                            expect(retry).toEqual(
                                fault === 'rollback-before'
                                    ? { scanned: 2, deletedDecisions: 2, deletedProofs: 2 }
                                    : fault === 'commit-before'
                                      ? { scanned: 1, deletedDecisions: 1, deletedProofs: 1, next: a.id }
                                      : { scanned: 1, deletedDecisions: 1, deletedProofs: 1 }
                            );
                            const final = yield* snapshot(f.observer);
                            expect(final).toEqual({
                                ...before,
                                proofs: fault === 'commit-before' ? before.proofs.slice(1) : [],
                                decisions: fault === 'commit-before' ? before.decisions.slice(1) : [],
                            });
                        }
                    )
            );
        }

        it.scoped(
            'ordinary typed rollback remains invalid and restores earlier deletion',
            /** Preserve typed body failure precedence when rollback succeeds. */ () =>
                Effect.gen(
                    /** Malformation after the first deletion must preserve the original committed page. */ function* () {
                        // A late typed error distinguishes rollback from rejection before any destructive work.
                        const f = yield* fixture(dialect);
                        const a = record(10);
                        yield* f.store.save(a, human, 'issued');
                        yield* f.sql`INSERT INTO approval_proof (id, revision, body) VALUES (${id(11)}, 0, ${proofCanary})`;
                        const before = yield* snapshot(f.observer);
                        yield* TestClock.setTime(a.retainUntil);
                        const exit = yield* Effect.exit(f.maintenance.run({ tenant, limit: 2, after: id(9) }));
                        expect(exit).toMatchObject({
                            _tag: 'Failure',
                            cause: { _tag: 'Fail', error: { reason: 'invalid' } },
                        });
                        expect(JSON.stringify(exit)).not.toContain(proofCanary);
                        expect(yield* snapshot(f.observer)).toEqual(before);
                    }
                )
        );

        for (const fault of ['defect', 'interrupt', 'mixed'] as const)
            it.scoped(
                `preserves unrelated ${fault}`,
                /** SQL-only normalization must not swallow arbitrary defects or interruption. */ () =>
                    Effect.gen(
                        /** Normalize SQL errors only; preserve the defect/interruption channels in both dialects. */ function* () {
                            // No business rows are needed: finalizing an empty real transaction reaches the same driver seam.
                            const f = yield* fixture(dialect);
                            const injection = yield* finalizationFault(f.sql, fault);
                            const exit = yield* Effect.exit(f.maintenance.run({ tenant, limit: 1 }));
                            injection.disarm();
                            yield* Effect.scoped(
                                Effect.flatMap(
                                    f.sql.reserve,
                                    /** Close only the intentionally unresolved fixture transaction. */ (conn) =>
                                        conn.executeUnprepared('ROLLBACK', [], undefined)
                                )
                            );
                            expect(injection.observed()).toBe(1);
                            expect(Exit.isFailure(exit)).toBe(true);
                            if (Exit.isFailure(exit)) {
                                if (fault === 'defect' || fault === 'mixed')
                                    expect(Array.from(Cause.defects(exit.cause))).toEqual(['unrelated-defect']);
                                else expect(Cause.isInterruptedOnly(exit.cause)).toBe(true);
                                if (fault === 'mixed') {
                                    expect(Array.from(Cause.failures(exit.cause))).toMatchObject([
                                        { _tag: 'ApprovalRetentionFailure', reason: 'unavailable' },
                                        { _tag: 'ApprovalRetentionFailure', reason: 'unavailable' },
                                    ]);
                                    for (const canary of [sqlCanary, connectionCanary, proofCanary]) {
                                        expect(JSON.stringify(exit)).not.toContain(canary);
                                        expect(Cause.pretty(exit.cause)).not.toContain(canary);
                                    }
                                }
                            }
                        }
                    )
            );
    });
}
