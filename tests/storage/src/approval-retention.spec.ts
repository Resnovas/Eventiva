/**
 * @file tests/storage/src/approval-retention.spec.ts
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
import { define } from '@eventiva/contracts/action';
import { ApprovalRecord, ApprovalRetention, ApprovalStore, approvalRetentionEnd } from '@eventiva/contracts/approval';
import { ApprovalRetentionMaintenance } from '@eventiva/contracts/approval-retention';
import { Authorizer, Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { IdentityStore, RoleId } from '@eventiva/contracts/identity';
import { TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { approvalStore } from '@eventiva/integrations.sql/approval';
import { approvalRetentionMaintenance } from '@eventiva/integrations.sql/approval-retention';
import { identityStore } from '@eventiva/integrations.sql/identity';
import { type Dialect, load, migrate } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { memory } from '@eventiva/integrations.sql/sqlite';
import { implement } from '@eventiva/runtime/action';
import { cancelApproval, useApproval } from '@eventiva/runtime/approval';
import { identitySecurity } from '@eventiva/runtime/identity';
import { ExecutionPolicy, InputDigest } from '@eventiva/runtime/invocation';
import { describe, expect, it } from '@effect/vitest';
import { ConfigProvider, Context, Deferred, Effect, Fiber, Layer, Schema, TestClock } from 'effect';

/** Stable IDs distinguish tenant, proof and cursor substitutions without relying on random ordering. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const tenant = TenantId.make(id(1));
const foreign = TenantId.make(id(2));
const human = Schema.decodeUnknownSync(CallerIdentity)({ subject: id(3), session: id(4), tenant, kind: 'human' });
const start = Date.UTC(2024, 0, 1);
const spec = define('fixture.retention.write', {
    version: 1,
    description: 'Fixed synthetic target for public use/replay ordering.',
    input: Schema.Struct({}),
    output: Schema.Void,
    permission: 'fixture.retention.write',
    sideEffect: 'write',
    offline: 'online-only',
    approval: 'confirm',
});
const binding = implement(
    spec,
    /** Maintenance must never invoke this business handler. */ () => Effect.die('handler invoked')
);
const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
const target = new URL(local);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.pathname !== '/eventiva_test')
    throw new Error('Retention conformance requires disposable loopback eventiva_test');
/** Supply credentials only through the existing disposable fixture environment. */
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
/** Create and finalize an actual isolated migrated database in each dialect. */
const database = (dialect: Dialect) =>
    Effect.gen(
        /** Register cleanup before connecting, so scoped clients close before database disposal. */
        function* () {
            // Each scenario owns its physical database; no tenant predicate substitutes for isolation.
            let connection;
            if (dialect === 'postgres') {
                const admin = Context.get(yield* Layer.build(pg(local)), SqlClient.SqlClient);
                const name = `retention_${randomUUID().replaceAll('-', '')}`;
                yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                yield* Effect.addFinalizer(
                    /** Drop only this test's uniquely named disposable database. */
                    () => admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie)
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
/** Compose real SQL maintenance/proof/identity; only the fixed action target and digest policy are synthetic. */
const fixture = (dialect: Dialect) =>
    Effect.gen(
        /** Keep the actual producer, lifecycle API and maintenance on the same physically routed SQL client. */
        function* () {
            // Live SQL authority, not a permissive identity stub, must authorize lifecycle operations in the race controls.
            yield* TestClock.setTime(start);
            const sql = yield* database(dialect);
            const root = Layer.merge(
                Layer.succeed(SqlClient.SqlClient, sql),
                Layer.succeed(CurrentTenant, { id: tenant })
            );
            const context = yield* Layer.build(
                Layer.mergeAll(approvalStore, approvalRetentionMaintenance, identityStore).pipe(
                    Layer.provideMerge(root)
                )
            );
            const identities = Context.get(context, IdentityStore);
            const role = RoleId.make(id(5));
            yield* identities.put(
                'role',
                { id: role, name: 'Synthetic target', grants: [{ permission: spec.permission, resources: ['*'] }] },
                null
            );
            yield* identities.put('principal', { id: human.subject, kind: 'human', active: true }, null);
            yield* identities.put('membership', { id: human.subject, active: true, roles: [role] }, null);
            yield* identities.put(
                'session',
                {
                    id: human.session,
                    subject: human.subject,
                    active: true,
                    expiresAt: Date.UTC(2030, 0, 1),
                    delegation: null,
                },
                null
            );
            const security = yield* Layer.build(identitySecurity.pipe(Layer.provide(Layer.succeedContext(context))));
            const auth = Context.get(security, Authorizer);
            const services = Context.merge(context, security).pipe(
                Context.add(Authorizer, {
                    ...auth,
                    /** The fixture action has one fixed target; preserve live SQL permission checks. */
                    check: (caller, action) => auth.canInvoke(caller, action),
                }),
                Context.add(InputDigest, {
                    /** A fixed synthetic canonical digest avoids adding a hashing dependency to retention tests. */
                    digest: () => Effect.succeed('fixed-target-digest'),
                }),
                Context.add(ExecutionPolicy, {
                    /** Retention cannot manufacture an approval requirement or an inferred step-up claim. */
                    inspect: () =>
                        Effect.succeed({
                            approval: 'confirm' as const,
                            routinePreauthorized: false,
                            stepUp: false,
                            bounds: {},
                            dependenciesReady: true,
                            capacityAvailable: true,
                        }),
                })
            );
            return {
                sql,
                store: Context.get(context, ApprovalStore),
                maintenance: Context.get(context, ApprovalRetentionMaintenance),
                /** Supply routed real services while leaving the public lifecycle operation unchanged. */
                run: <A, E, R>(effect: Effect.Effect<A, E, R>) =>
                    effect.pipe(Effect.provide(services), Effect.provideService(Caller, human)),
            };
        }
    );
/** Build a minimal valid consent record; default values here are explicit synthetic fixture choices, not production policy. */
const record = (n: number, expiresAt = start + 600_000, retention: ApprovalRetention = 90): ApprovalRecord =>
    Schema.decodeUnknownSync(ApprovalRecord)({
        schemaVersion: 1,
        id: id(n),
        revision: 0,
        binding: {
            tenant,
            principal: human.subject,
            action: spec.name,
            version: 1,
            inputHash: 'fixed-target-digest',
            writeKey: `key-${n}`,
        },
        approver: human,
        issuedAt: start,
        expiresAt,
        limits: {},
        stepUp: false,
        retention,
        retainUntil: approvalRetentionEnd(expiresAt, retention),
        usedAt: null,
        revokedAt: null,
    });

for (const dialect of ['sqlite', 'postgres'] as const) {
    describe(`trusted approval retention ${dialect}`, /** Exercise real triggers and transactions rather than an in-memory proof map. */ () => {
        // Run the same contract on both engines so dialect differences cannot silently weaken evidence protection.
        it.scoped(
            'drains bounded pages without starving later elapsed proofs and preserves unrelated durable evidence',
            /** Cursor progress includes retained proofs. */ () =>
                Effect.gen(
                    /** Assert public counts and independently selected durable SQL facts. */ function* () {
                        // Put an unelapsed proof before elapsed ones to expose cursor starvation.
                        const f = yield* fixture(dialect);
                        const first = record(10, start + 1000, 'two-years');
                        const a = record(11);
                        const b = record(12);
                        for (const proof of [first, a, b]) yield* f.store.save(proof, human, 'issued');
                        yield* f.sql`INSERT INTO action_commit (key, input_hash, result) VALUES (${a.binding.writeKey}, 'hash', 'result')`;
                        yield* f.sql`INSERT INTO action_receipt (id, receipt) VALUES (${a.id}, 'evidence')`;
                        yield* f.sql`INSERT INTO command_outbox (id, command) VALUES (${a.id}, 'pending')`;
                        yield* f.sql`INSERT INTO operational_record (id, state, version, payload) VALUES (${id(80)}, 'open', 0, '{}')`;
                        yield* f.sql`INSERT INTO transition_history (command_id, record_id, previous_state, next_state, version, occurred_at) VALUES (${id(81)}, ${id(80)}, 'new', 'open', 0, ${dialect === 'postgres' ? new Date(start).toISOString() : start})`;
                        yield* TestClock.setTime(a.retainUntil);
                        expect(yield* f.maintenance.run({ tenant, limit: 1 })).toEqual({
                            scanned: 1,
                            deletedDecisions: 0,
                            deletedProofs: 0,
                            next: first.id,
                        });
                        expect(yield* f.maintenance.run({ tenant, limit: 1, after: first.id })).toEqual({
                            scanned: 1,
                            deletedDecisions: 1,
                            deletedProofs: 1,
                            next: a.id,
                        });
                        expect(yield* f.maintenance.run({ tenant, limit: 1, after: a.id })).toEqual({
                            scanned: 1,
                            deletedDecisions: 1,
                            deletedProofs: 1,
                        });
                        expect(yield* f.maintenance.run({ tenant, limit: 100 })).toEqual({
                            scanned: 1,
                            deletedDecisions: 0,
                            deletedProofs: 0,
                        });
                        for (const table of [
                            'action_commit',
                            'action_receipt',
                            'command_outbox',
                            'operational_record',
                            'transition_history',
                        ])
                            expect(yield* f.sql`SELECT * FROM ${f.sql(table)}`).toHaveLength(1);
                        expect(yield* f.sql`SELECT * FROM approval_retention_permit`).toEqual([]);
                    }
                )
        );

        for (const [retention, expiry, deadline] of [
            [90, '2024-01-02T12:13:14.015Z', '2024-04-01T12:13:14.015Z'],
            ['six-months', '2024-08-31T12:13:14.015Z', '2025-02-28T12:13:14.015Z'],
            ['six-months', '2027-08-31T12:13:14.015Z', '2028-02-29T12:13:14.015Z'],
            ['two-years', '2024-02-29T12:13:14.015Z', '2026-02-28T12:13:14.015Z'],
            ['two-years', '2027-03-01T12:13:14.015Z', '2029-03-01T12:13:14.015Z'],
            [730, '2027-03-01T12:13:14.015Z', '2029-02-28T12:13:14.015Z'],
        ] as const) {
            it.scoped(
                `enforces ${retention} at ${expiry}, not one millisecond before`,
                /** Independent calendar expectations distinguish rounded durations and overflowed month arithmetic. */ () =>
                    Effect.gen(
                        /** Execute the cleanup boundary against actual persisted proof and decision evidence. */ function* () {
                            // Expected UTC deadlines are literal independent values, not derived from the function under test.
                            const f = yield* fixture(dialect);
                            const proof = record(20, Date.parse(expiry), retention);
                            expect(proof.retainUntil).toBe(Date.parse(deadline));
                            yield* f.store.save(proof, human, 'issued');
                            yield* TestClock.setTime(Date.parse(deadline) - 1);
                            expect(yield* f.maintenance.run({ tenant, limit: 1 })).toEqual({
                                scanned: 1,
                                deletedDecisions: 0,
                                deletedProofs: 0,
                            });
                            yield* TestClock.setTime(Date.parse(deadline));
                            expect(yield* f.maintenance.run({ tenant, limit: 1 })).toEqual({
                                scanned: 1,
                                deletedDecisions: 1,
                                deletedProofs: 1,
                            });
                            expect(yield* f.store.get(proof.id)).toBeUndefined();
                        }
                    )
            );
        }

        it.scoped(
            'uses first terminal time, never replay time, and retains proof until its later expiry',
            /** A deliberately long synthetic expiry separates the two deletion conditions. */ () =>
                Effect.gen(
                    /** Invoke real public use/replay/cancel with live SQL identity and producer CAS. */ function* () {
                        // Separate the terminal retention deadline from operational expiry; ordinary short sessions hide this branch.
                        const f = yield* fixture(dialect);
                        const longExpiry = start + 100 * 86_400_000;
                        const a = record(30, longExpiry);
                        const b = record(31, longExpiry);
                        for (const proof of [a, b]) yield* f.store.save(proof, human, 'issued');
                        yield* TestClock.setTime(start + 1000);
                        const used = yield* f.run(useApproval(a.id, binding, {}, a.binding.writeKey));
                        const cancelled = yield* f.run(cancelApproval(b.id));
                        expect(used.retainUntil).toBe(start + 1000 + 90 * 86_400_000);
                        expect(cancelled.retainUntil).toBe(used.retainUntil);
                        yield* TestClock.setTime(start + 2000);
                        expect(yield* f.run(useApproval(a.id, binding, {}, a.binding.writeKey))).toEqual(used);
                        expect(yield* f.run(cancelApproval(b.id))).toEqual(cancelled);
                        yield* TestClock.setTime(used.retainUntil);
                        expect(yield* f.maintenance.run({ tenant, limit: 2 })).toEqual({
                            scanned: 2,
                            deletedDecisions: 4,
                            deletedProofs: 0,
                        });
                        expect(yield* f.store.get(a.id)).toEqual(used);
                        expect(yield* f.store.get(b.id)).toEqual(cancelled);
                        expect(yield* f.run(useApproval(a.id, binding, {}, a.binding.writeKey))).toEqual(used);
                        expect(yield* f.sql`SELECT * FROM approval_decision`).toEqual([]);
                        const [row] = yield* f.sql<{
                            body: string;
                        }>`SELECT body FROM approval_proof WHERE id = ${a.id}`;
                        if (!row) return yield* Effect.die('retained proof absent');
                        yield* f.sql`INSERT INTO approval_retention_permit (proof_id, revision, body, cutoff) VALUES (${a.id}, 1, ${row.body}, ${used.retainUntil})`;
                        expect(
                            yield* Effect.either(f.sql`DELETE FROM approval_proof WHERE id = ${a.id}`)
                        ).toMatchObject({ _tag: 'Left' });
                        yield* f.sql`DELETE FROM approval_retention_permit WHERE proof_id = ${a.id}`;
                        yield* TestClock.setTime(longExpiry);
                        expect(yield* f.maintenance.run({ tenant, limit: 2 })).toEqual({
                            scanned: 2,
                            deletedDecisions: 0,
                            deletedProofs: 2,
                        });
                    }
                )
        );

        it.scoped(
            'preserves immutable updates and premature/unpermitted deletes, including exact-proof permit binding',
            /** Database protection survives maintenance and raw SQL attempts. */ () =>
                Effect.gen(
                    /** A permit for one revision/body cannot delete another proof or bypass both temporal limits. */ function* () {
                        // Probe database enforcement directly, including capabilities that the public maintenance API never exposes.
                        const f = yield* fixture(dialect);
                        const proof = record(40);
                        yield* f.store.save(proof, human, 'issued');
                        const other = record(41, proof.expiresAt, 'two-years');
                        yield* f.store.save(other, human, 'issued');
                        expect(
                            yield* Effect.either(
                                f.sql`UPDATE approval_decision SET body = body WHERE proof_id = ${proof.id}`
                            )
                        ).toMatchObject({ _tag: 'Left' });
                        expect(
                            yield* Effect.either(f.sql`DELETE FROM approval_decision WHERE proof_id = ${proof.id}`)
                        ).toMatchObject({ _tag: 'Left' });
                        expect(
                            yield* Effect.either(f.sql`DELETE FROM approval_proof WHERE id = ${proof.id}`)
                        ).toMatchObject({ _tag: 'Left' });
                        const [row] = yield* f.sql<{
                            body: string;
                        }>`SELECT body FROM approval_proof WHERE id = ${proof.id}`;
                        expect(row).toBeDefined();
                        if (!row) return yield* Effect.die('fixture proof absent');
                        yield* f.sql`INSERT INTO approval_retention_permit (proof_id, revision, body, cutoff) VALUES (${proof.id}, 0, ${row.body}, ${proof.retainUntil - 1})`;
                        expect(
                            yield* Effect.either(f.sql`DELETE FROM approval_decision WHERE proof_id = ${other.id}`)
                        ).toMatchObject({ _tag: 'Left' });
                        expect(
                            yield* Effect.either(f.sql`DELETE FROM approval_decision WHERE proof_id = ${proof.id}`)
                        ).toMatchObject({ _tag: 'Left' });
                        yield* f.sql`UPDATE approval_retention_permit SET cutoff = ${proof.retainUntil}, revision = 1 WHERE proof_id = ${proof.id}`;
                        expect(
                            yield* Effect.either(f.sql`DELETE FROM approval_decision WHERE proof_id = ${proof.id}`)
                        ).toMatchObject({ _tag: 'Left' });
                        yield* f.sql`UPDATE approval_retention_permit SET revision = 0, body = '{}' WHERE proof_id = ${proof.id}`;
                        expect(
                            yield* Effect.either(f.sql`DELETE FROM approval_decision WHERE proof_id = ${proof.id}`)
                        ).toMatchObject({ _tag: 'Left' });
                        yield* f.sql`DELETE FROM approval_retention_permit WHERE proof_id = ${proof.id}`;
                        yield* TestClock.setTime(proof.retainUntil);
                        expect(yield* f.maintenance.run({ tenant, limit: 1 })).toMatchObject({ deletedProofs: 1 });
                    }
                )
        );

        it.scoped(
            'denies foreign tenants and invalid bounds without touching physically separate tenant evidence',
            /** Possession of an ID/cursor never selects another database. */ () =>
                Effect.gen(
                    /** Use two real physical stores and make route/body mismatches visible as typed failures. */ function* () {
                        // Route identity is checked before SQL; copied foreign-tenant bodies remain corruption, never eligible evidence.
                        const f = yield* fixture(dialect);
                        const other = yield* fixture(dialect);
                        const proof = record(50);
                        yield* other.store.save(proof, human, 'issued');
                        for (const limit of [0, 101, NaN, 1.5])
                            expect(yield* Effect.either(f.maintenance.run({ tenant, limit }))).toMatchObject({
                                _tag: 'Left',
                                left: { reason: 'invalid' },
                            });
                        expect(yield* Effect.either(f.maintenance.run({ tenant: foreign, limit: 1 }))).toMatchObject({
                            _tag: 'Left',
                            left: { reason: 'denied' },
                        });
                        expect(yield* f.maintenance.run({ tenant, limit: 1 })).toEqual({
                            scanned: 0,
                            deletedDecisions: 0,
                            deletedProofs: 0,
                        });
                        expect(yield* other.store.get(proof.id)).toEqual(proof);
                        yield* f.sql`INSERT INTO approval_proof (id, revision, body) VALUES (${proof.id}, 0, ${JSON.stringify({ ...proof, binding: { ...proof.binding, tenant: foreign }, approver: { ...human, tenant: foreign } })})`;
                        expect(yield* Effect.either(f.maintenance.run({ tenant, limit: 1 }))).toMatchObject({
                            _tag: 'Left',
                            left: { reason: 'invalid' },
                        });
                    }
                )
        );

        it.scoped(
            'rolls a failed page back, sanitizes corruption and permits an explicit successful retry',
            /** Do not acknowledge deletions from a rolled-back transaction. */ () =>
                Effect.gen(
                    /** A valid earlier row must survive corruption discovered later in the same page. */ function* () {
                        // A parser failure after an earlier deletion must roll the entire page and all permits back.
                        const f = yield* fixture(dialect);
                        const a = record(60);
                        const b = record(61);
                        yield* f.store.save(a, human, 'issued');
                        yield* f.sql`INSERT INTO approval_proof (id, revision, body) VALUES (${b.id}, 0, 'private-canary malformed')`;
                        yield* TestClock.setTime(a.retainUntil);
                        const error = yield* Effect.flip(f.maintenance.run({ tenant, limit: 2 }));
                        expect(error.reason).toBe('invalid');
                        expect(JSON.stringify(error)).not.toContain('canary');
                        expect(yield* f.store.get(a.id)).toEqual(a);
                        expect(yield* f.sql`SELECT * FROM approval_decision`).toHaveLength(1);
                        expect(yield* f.sql`SELECT * FROM approval_retention_permit`).toEqual([]);
                        yield* f.sql`UPDATE approval_proof SET body = ${JSON.stringify(b)} WHERE id = ${b.id}`;
                        yield* f.sql`INSERT INTO approval_decision (proof_id, revision, body) VALUES (${b.id}, 0, ${JSON.stringify({ kind: 'issued', actor: human, issuedAt: b.issuedAt, usedAt: null, revokedAt: null, retainUntil: b.retainUntil })})`;
                        expect(yield* f.maintenance.run({ tenant, limit: 2 })).toEqual({
                            scanned: 2,
                            deletedDecisions: 2,
                            deletedProofs: 2,
                        });
                        yield* f.sql`DELETE FROM identity_guard WHERE id = 1`;
                        expect(yield* Effect.either(f.maintenance.run({ tenant, limit: 1 }))).toMatchObject({
                            _tag: 'Left',
                            left: { reason: 'unavailable' },
                        });
                    }
                )
        );

        it.scoped(
            'surfaces unavailable SQL as a sanitized failure and retries after the fixture is restored',
            /** A late SQL deletion failure is not a successful or partially committed sweep. */ () =>
                Effect.gen(
                    /** Add a fixture-only rejection alongside unchanged production triggers, then remove only that rejection. */ function* () {
                        // Force failure after decision deletion, so rollback must restore history as well as remove the permit.
                        const f = yield* fixture(dialect);
                        const proof = record(65);
                        yield* f.store.save(proof, human, 'issued');
                        yield* TestClock.setTime(proof.retainUntil);
                        if (dialect === 'postgres')
                            yield* f.sql`CREATE TRIGGER retention_fixture_failure BEFORE DELETE ON approval_proof FOR EACH ROW EXECUTE FUNCTION reject_evidence_change()`;
                        else
                            yield* f.sql`CREATE TRIGGER retention_fixture_failure BEFORE DELETE ON approval_proof BEGIN SELECT RAISE(ABORT, 'private_canary'); END`;
                        const error = yield* Effect.flip(f.maintenance.run({ tenant, limit: 1 }));
                        expect(error.reason).toBe('unavailable');
                        expect(JSON.stringify(error)).not.toContain('canary');
                        expect(yield* f.store.get(proof.id)).toEqual(proof);
                        expect(yield* f.sql`SELECT * FROM approval_decision`).toHaveLength(1);
                        expect(yield* f.sql`SELECT * FROM approval_retention_permit`).toEqual([]);
                        if (dialect === 'postgres')
                            yield* f.sql`DROP TRIGGER retention_fixture_failure ON approval_proof`;
                        else yield* f.sql`DROP TRIGGER retention_fixture_failure`;
                        expect(yield* f.maintenance.run({ tenant, limit: 1 })).toEqual({
                            scanned: 1,
                            deletedDecisions: 1,
                            deletedProofs: 1,
                        });
                    }
                )
        );

        for (const corruption of [
            'decision-json',
            'decision-deadline',
            'decision-revision',
            'excess-history',
            'missing-history',
            'proof-revision',
        ] as const) {
            it.scoped(
                `denies ${corruption} without discarding evidence`,
                /** Corrupt persisted state is not evidence that retention was satisfied. */ () =>
                    Effect.gen(
                        /** Exercise malformed audit, producer lifecycle bounds and metadata through the actual maintenance capability. */ function* () {
                            // Insert malformed fixture evidence directly because the trusted producer correctly refuses these states.
                            const f = yield* fixture(dialect);
                            const proof = record(66);
                            yield* f.sql`INSERT INTO approval_proof (id, revision, body) VALUES (${proof.id}, ${corruption === 'proof-revision' ? 1 : 0}, ${JSON.stringify(proof)})`;
                            if (corruption !== 'missing-history') {
                                const body =
                                    corruption === 'decision-json'
                                        ? 'private-canary malformed'
                                        : JSON.stringify({
                                              kind: 'issued',
                                              actor: human,
                                              issuedAt: proof.issuedAt,
                                              usedAt: null,
                                              revokedAt: null,
                                              retainUntil:
                                                  proof.retainUntil + (corruption === 'decision-deadline' ? 1 : 0),
                                          });
                                // SQLite admits text in a composite integer key; PostgreSQL instead enforces the integer representation.
                                const decisionRevision =
                                    corruption === 'decision-revision' ? (dialect === 'sqlite' ? ' ' : -1) : 0;
                                yield* f.sql`INSERT INTO approval_decision (proof_id, revision, body) VALUES (${proof.id}, ${decisionRevision}, ${body})`;
                                if (corruption === 'excess-history')
                                    for (const revision of [1, 2])
                                        yield* f.sql`INSERT INTO approval_decision (proof_id, revision, body) VALUES (${proof.id}, ${revision}, ${body})`;
                            }
                            yield* TestClock.setTime(proof.retainUntil);
                            const error = yield* Effect.flip(f.maintenance.run({ tenant, limit: 1 }));
                            expect(error.reason).toBe('invalid');
                            expect(JSON.stringify(error)).not.toContain('canary');
                            expect(yield* f.sql`SELECT id FROM approval_proof`).toEqual([{ id: proof.id }]);
                            expect(yield* f.sql`SELECT * FROM approval_retention_permit`).toEqual([]);
                        }
                    )
            );
        }

        for (const operation of ['use', 'cancel'] as const) {
            it.scoped(
                `serializes maintenance against actual ${operation} without renewing terminal evidence`,
                /** A held producer transaction and explicit barriers establish the race order. */ () =>
                    Effect.gen(
                        /** Exercise both lifecycle-first and maintenance-first orders under the same identity guard. */ function* () {
                            // Barriers retain the producer guard across maintenance contention; replay after cleanup must remain a no-op.
                            const f = yield* fixture(dialect);
                            const proof = record(70, start + 100 * 86_400_000);
                            yield* f.store.save(proof, human, 'issued');
                            const held = yield* Deferred.make<void>();
                            const release = yield* Deferred.make<void>();
                            const producer = yield* f
                                .run(
                                    f.store.transaction(
                                        Effect.gen(
                                            /** Hold the guard until maintenance has been forked. */ function* () {
                                                // Do not release the transaction before the competing maintenance fiber exists.
                                                const result =
                                                    operation === 'use'
                                                        ? yield* useApproval(
                                                              proof.id,
                                                              binding,
                                                              {},
                                                              proof.binding.writeKey
                                                          )
                                                        : yield* cancelApproval(proof.id);
                                                yield* Deferred.succeed(held, undefined);
                                                yield* Deferred.await(release);
                                                return result;
                                            }
                                        )
                                    )
                                )
                                .pipe(Effect.fork);
                            yield* Deferred.await(held);
                            const entered = yield* Deferred.make<void>();
                            const maintenance = yield* Deferred.succeed(entered, undefined).pipe(
                                Effect.zipRight(f.maintenance.run({ tenant, limit: 1 })),
                                Effect.fork
                            );
                            yield* Deferred.await(entered);
                            yield* Effect.yieldNow();
                            expect(yield* Fiber.poll(maintenance)).toMatchObject({ _tag: 'None' });
                            // Advancing while contended distinguishes a clock sampled before the guard from the required fresh operation time.
                            yield* TestClock.setTime(start + 90 * 86_400_000);
                            yield* Deferred.succeed(release, undefined);
                            const terminal = yield* Fiber.join(producer);
                            expect(yield* Fiber.join(maintenance)).toMatchObject({
                                deletedDecisions: 2,
                                deletedProofs: 0,
                            });
                            yield* TestClock.setTime(terminal.retainUntil);
                            expect(yield* f.maintenance.run({ tenant, limit: 1 })).toMatchObject({
                                deletedDecisions: 0,
                                deletedProofs: 0,
                            });
                            const replay =
                                operation === 'use'
                                    ? yield* f.run(useApproval(proof.id, binding, {}, proof.binding.writeKey))
                                    : yield* f.run(cancelApproval(proof.id));
                            expect(replay).toEqual(terminal);
                            expect(yield* f.sql`SELECT * FROM approval_decision`).toEqual([]);
                            yield* TestClock.setTime(proof.expiresAt);
                            expect(yield* f.maintenance.run({ tenant, limit: 1 })).toMatchObject({ deletedProofs: 1 });
                            const missing =
                                operation === 'use'
                                    ? yield* f.run(
                                          Effect.either(useApproval(proof.id, binding, {}, proof.binding.writeKey))
                                      )
                                    : yield* f.run(Effect.either(cancelApproval(proof.id)));
                            expect(missing).toMatchObject({ _tag: 'Left', left: { reason: 'missing' } });
                        }
                    )
            );

            it.scoped(
                `orders committed cleanup before competing ${operation} and denies missing proof`,
                /** Maintenance-first ordering must not resurrect deleted evidence. */ () =>
                    Effect.gen(
                        /** Hold the real cleanup transaction while a public lifecycle request waits for its identity guard. */ function* () {
                            // A queued lifecycle operation must observe the committed deletion, not an earlier proof snapshot.
                            const f = yield* fixture(dialect);
                            const proof = record(71);
                            yield* f.store.save(proof, human, 'issued');
                            yield* TestClock.setTime(proof.retainUntil);
                            const held = yield* Deferred.make<void>();
                            const release = yield* Deferred.make<void>();
                            const cleanup = yield* f.store
                                .transaction(
                                    Effect.gen(
                                        /** Retain the transaction after the public cleanup operation, before commit. */ function* () {
                                            // The outer transaction is the documented nested SQL lifecycle boundary, not a second proof implementation.
                                            const result = yield* f.maintenance.run({ tenant, limit: 1 });
                                            yield* Deferred.succeed(held, undefined);
                                            yield* Deferred.await(release);
                                            return result;
                                        }
                                    )
                                )
                                .pipe(Effect.fork);
                            yield* Deferred.await(held);
                            const entered = yield* Deferred.make<void>();
                            const lifecycle =
                                operation === 'use'
                                    ? f.run(useApproval(proof.id, binding, {}, proof.binding.writeKey))
                                    : f.run(cancelApproval(proof.id));
                            const competing = yield* Deferred.succeed(entered, undefined).pipe(
                                Effect.zipRight(Effect.either(lifecycle)),
                                Effect.fork
                            );
                            yield* Deferred.await(entered);
                            yield* Effect.yieldNow();
                            expect(yield* Fiber.poll(competing)).toMatchObject({ _tag: 'None' });
                            yield* Deferred.succeed(release, undefined);
                            expect(yield* Fiber.join(cleanup)).toMatchObject({ deletedProofs: 1 });
                            expect(yield* Fiber.join(competing)).toMatchObject({
                                _tag: 'Left',
                                left: { reason: 'missing' },
                            });
                            expect(yield* f.sql`SELECT * FROM approval_decision`).toEqual([]);
                            expect(yield* f.sql`SELECT * FROM approval_retention_permit`).toEqual([]);
                        }
                    )
            );
        }
    });
}

it('accepts only the approved retention range without rounding calendar policies', /** Boundary values are policy, not a cleanup-specific replacement. */ () => {
    // Adjacent out-of-range and fractional values distinguish the approved integer day bounds from coercion.
    expect(
        [89, 731, 90.5, Infinity].map(
            /** Apply the public shared schema to distinguishing invalid durations. */ (value) =>
                Schema.is(ApprovalRetention)(value)
        )
    ).toEqual([false, false, false, false]);
    expect(Schema.is(ApprovalRetention)(90)).toBe(true);
    expect(Schema.is(ApprovalRetention)(730)).toBe(true);
});
