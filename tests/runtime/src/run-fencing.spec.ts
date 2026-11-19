/**
 * @file tests/runtime/src/run-fencing.spec.ts
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
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { describe, expect, it } from '@effect/vitest';
import { define } from '@eventiva/contracts/action';
import { AgentOutputLog } from '@eventiva/contracts/agent-output';
import { Authorizer, Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { TenantId } from '@eventiva/contracts/ids';
import type { RunSnapshot } from '@eventiva/contracts/module-manifest';
import { CurrentRunFence, CurrentTenant, Storage, type RunFence } from '@eventiva/contracts/storage';
import { agentOutputLog } from '@eventiva/integrations.sql/agent-output';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { localFile } from '@eventiva/integrations.sql/sqlite';
import { storage } from '@eventiva/integrations.sql/storage';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import {
    Approvals,
    ExecutionPolicy,
    IdentityResolver,
    InputDigest,
    InvocationDenied,
} from '@eventiva/runtime/invocation';
import { durable } from '@eventiva/runtime/storage';
import {
    ConfigProvider,
    Context,
    Deferred,
    Effect,
    Either,
    Exit,
    Fiber,
    Layer,
    Option,
    Redacted,
    Ref,
    Schema,
} from 'effect';

/** Stable synthetic identities make tenant and business-key assertions independent of fixture ordering. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const caller = Schema.decodeUnknownSync(CallerIdentity)({
    subject: id(1),
    session: id(2),
    tenant: id(3),
    kind: 'human',
});
const tenant = TenantId.make(id(3));
const other = TenantId.make(id(4));
const runId = id(5);
const action = define('fixture.fenced', {
    version: 1,
    description: 'Synthetic fenced transaction.',
    permission: 'fixture.fenced',
    sideEffect: 'write',
    offline: 'online-only',
    input: Schema.Struct({ id: Schema.String, value: Schema.Number }),
    output: Schema.Number,
});
const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
/** Configure a trusted fixture connection, never a caller-selected database. */
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));

/** Open independent clients on one disposable real database and return public persistence/host seams. */
const fixture = (dialect: Dialect) =>
    Effect.gen(
        /** Release pools before deleting the uniquely owned database or SQLite file. */ function* () {
            let connection: ReturnType<typeof pg> | ReturnType<typeof localFile>;
            if (dialect === 'postgres') {
                const url = new URL(local);
                if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.pathname !== '/eventiva_test')
                    return yield* new InvocationDenied({ action: action.name, reason: 'fixture-only' });
                const admin = Context.get(yield* Layer.build(pg(local)), SqlClient.SqlClient);
                const name = `fencing_${randomUUID().replaceAll('-', '')}`;
                yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                yield* Effect.addFinalizer(
                    /** Only this fixture database may be dropped after its clients close. */ () =>
                        admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie)
                );
                url.pathname = `/${name}`;
                connection = pg(url.toString());
            } else {
                const directory = yield* Effect.acquireRelease(
                    Effect.sync(
                        /** Keep disposable files under the orb backup tree, not shared temporary storage. */ () => {
                            // Each independent SQLite connection must address this same uniquely owned file.
                            mkdirSync('.amp/in/orb-backup', { recursive: true });
                            return mkdtempSync('.amp/in/orb-backup/fencing-');
                        }
                    ),
                    /** Close all clients before removing this test-owned file tree. */ (path) =>
                        Effect.sync(
                            /** Remove no state outside the uniquely allocated directory. */ () =>
                                rmSync(path, { recursive: true, force: true })
                        )
                );
                connection = localFile(Redacted.make(join(directory, 'run.sqlite')));
            }
            const a = Context.get(yield* Layer.build(connection), SqlClient.SqlClient);
            const b = Context.get(yield* Layer.build(Layer.fresh(connection)), SqlClient.SqlClient);
            const migrations = yield* load(
                fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url))
            );
            yield* migrate(dialect, migrations).pipe(Effect.provideService(SqlClient.SqlClient, a));
            const snapshot: RunSnapshot = {
                composition: { modules: [{ id: 'fixture', version: '1.0.0' }], bindings: [] },
                providers: [],
                schema: migrations.map(
                    /** Record actual immutable migration bytes, not a fixture-invented compatible version. */ ({
                        name,
                        checksum,
                    }) => ({ name, checksum })
                ),
                origin: { incarnation: 'origin-a', generation: 7 },
            };
            /** Construct a new public Storage service on each independent SQL client. */
            const open = (sql: SqlClient.SqlClient) =>
                Layer.build(storage(dialect).pipe(Layer.provide(Layer.succeed(SqlClient.SqlClient, sql)))).pipe(
                    Effect.map(
                        /** Expose the actual integration, not a simulated transaction. */ (context) =>
                            Context.get(context, Storage)
                    )
                );
            const first = yield* open(a);
            const second = yield* open(b);
            const fail = yield* Ref.make(false);
            const revoked = yield* Ref.make(false);
            const entered = yield* Deferred.make<void>();
            const release = yield* Deferred.make<void>();
            const hold = yield* Ref.make(false);
            /** Compose real A1 storage around a synthetic handler with observable domain/history/outbox effects. */
            const host = (store: Storage['Type']) =>
                Effect.gen(
                    /** Host and durable owner close over exactly the same Storage service. */ function* () {
                        // Independent owners share the physical database, not host services or transaction context.
                        const services = Layer.mergeAll(
                            FlagsSafeDefaults,
                            Layer.succeed(Storage, store),
                            Layer.succeed(CurrentTenant, { id: tenant }),
                            Layer.succeed(IdentityResolver, {
                                /** Refresh authority on admission and after the handler. */ resolve: () =>
                                    Ref.get(revoked).pipe(
                                        Effect.flatMap(
                                            /** Revoked authority must deny even an otherwise current ownership epoch. */ (
                                                value
                                            ) =>
                                                value
                                                    ? Effect.fail(
                                                          new InvocationDenied({
                                                              action: action.name,
                                                              reason: 'revoked',
                                                          })
                                                      )
                                                    : Effect.succeed(caller)
                                        )
                                    ),
                            }),
                            Layer.succeed(Authorizer, {
                                /** Synthetic grants are deliberately separate from epoch authority. */ canInvoke: () =>
                                    Effect.void,
                                /** No hidden resource grant is inferred by the fence. */ check: () => Effect.void,
                            }),
                            Layer.succeed(ExecutionPolicy, {
                                /** State/version/capacity are consumed by the handler; commit must not repeat these preconditions. */ inspect:
                                    () =>
                                        Effect.succeed({
                                            approval: 'none' as const,
                                            routinePreauthorized: true,
                                            stepUp: false,
                                            bounds: {},
                                            dependenciesReady: true,
                                            capacityAvailable: true,
                                        }),
                            }),
                            Layer.succeed(Approvals, {
                                /** Unused approval references never grant permission. */ get: () =>
                                    Effect.fail(new InvocationDenied({ action: action.name, reason: 'missing-proof' })),
                            }),
                            Layer.succeed(InputDigest, {
                                /** Hash canonical private input with the approved local fixture boundary. */ digest: (
                                    text
                                ) =>
                                    Effect.sync(
                                        /** Persist only its digest in evidence. */ () =>
                                            createHash('sha256').update(text).digest('hex')
                                    ),
                            })
                        );
                        const context = yield* Layer.build(
                            ActionHostLive.pipe(Layer.provide(durable), Layer.provide(services))
                        );
                        const host = Context.get(context, ActionHost);
                        yield* host.register({
                            manifest: {
                                format: 1,
                                id: 'fixture',
                                version: '1.0.0',
                                description: 'Synthetic only.',
                                actions: [action.name],
                                flags: [],
                            },
                            actions: [
                                implement(
                                    action,
                                    /** Mutate only the tenant-bound public storage port so A1 owns every successful write. */ ({
                                        id: recordId,
                                        value,
                                    }) =>
                                        Effect.gen(
                                            /** All successful evidence must roll back together when either ownership or execution fails. */ function* () {
                                                // Fail only after domain/history/outbox work, making partial rollback visible to the independent observer.
                                                yield* store.create({
                                                    id: recordId,
                                                    state: 'pending',
                                                    version: 0,
                                                    payload: value,
                                                    leaseUntil: null,
                                                });
                                                yield* store.compareAndSet(
                                                    {
                                                        id: recordId,
                                                        expectedState: 'pending',
                                                        expectedVersion: 0,
                                                        clientMutationId: recordId,
                                                        idempotencyKey: recordId,
                                                        deadline: Date.now() + 120000,
                                                    },
                                                    'complete',
                                                    value,
                                                    { pending: ['complete'] }
                                                );
                                                yield* store.enqueue(recordId, { value });
                                                if (yield* Ref.get(hold)) {
                                                    yield* Deferred.succeed(entered, undefined);
                                                    yield* Deferred.await(release);
                                                }
                                                if (yield* Ref.get(fail))
                                                    return yield* new InvocationDenied({
                                                        action: action.name,
                                                        reason: 'injected-rollback',
                                                    });
                                                return value * 3 + 1;
                                            }
                                        ).pipe(Effect.orDie)
                                ),
                            ],
                        });
                        return host;
                    }
                );
            const oldHost = yield* host(first);
            const newHost = yield* host(second);
            /** Enter the public ActionHost with a trusted attempt context, never a caller-supplied intent field. */
            const invoke = (host: ActionHost['Type'], fence: RunFence, key: string, record = id(10), value = 13) =>
                host
                    .execute(action.name, { id: record, value }, { idempotencyKey: key })
                    .pipe(Effect.provideService(Caller, caller), Effect.provideService(CurrentRunFence, fence));
            const output = Context.get(
                yield* Layer.build(
                    agentOutputLog(
                        /** Resolve only the already authenticated fixture tenant. */ () => Effect.succeed(b)
                    )
                ),
                AgentOutputLog
            );
            /** Count committed success evidence independently of runtime return values; denied receipts are not successful evidence. */
            const evidence = Effect.gen(
                /** Inspect actual rows on the independent client. */ function* () {
                    const records = yield* b`SELECT * FROM operational_record`;
                    const history = yield* b`SELECT * FROM transition_history`;
                    const outbox = yield* b`SELECT * FROM command_outbox`;
                    const commits = yield* b`SELECT * FROM action_commit WHERE result IS NOT NULL`;
                    const receipts = yield* b<{ receipt: string }>`SELECT receipt FROM action_receipt`;
                    return [
                        records.length,
                        history.length,
                        outbox.length,
                        commits.length,
                        receipts.filter(
                            /** Failure audit is allowed but may never masquerade as committed success. */ (row) =>
                                JSON.parse(row.receipt).outcome === 'succeeded'
                        ).length,
                    ];
                }
            );
            return {
                a,
                b,
                first,
                second,
                snapshot,
                fail,
                revoked,
                hold,
                entered,
                release,
                oldHost,
                newHost,
                invoke,
                output,
                evidence,
            };
        }
    );

describe('tenant-local authoritative run fences', /** Test both real engines; missing PostgreSQL must fail, never skip. */ () => {
    // Run the same observable contract against actual drivers, not an in-memory transaction simulation.
    for (const dialect of ['sqlite', 'postgres'] as const) {
        it.scopedLive(
            `rejects stale writes/replay/output and preserves atomic rollback on ${dialect}`,
            /** Exercise observable public host and persistence contracts with independent owners. */ () =>
                Effect.gen(
                    /** Ownership transfer is committed before the surviving old owner is released to invoke. */ function* () {
                        // Use exactly the original input for stale replay, otherwise input-conflict could conceal a missing epoch check.
                        const f = yield* fixture(dialect);
                        yield* f.first.acceptRun(tenant, runId, { definition: 'old' }, f.snapshot);
                        const old = yield* f.first.claimRun(tenant, runId, 0, 'old-incarnation');
                        const first = yield* f.invoke(f.oldHost, old, 'stable');
                        expect(yield* first.result).toBe(40);
                        const original = yield* f.b`SELECT result FROM action_commit`;
                        expect(yield* f.evidence).toEqual([1, 1, 1, 1, 1]);
                        const current = yield* f.second.claimRun(tenant, runId, 1, 'new-incarnation');
                        const [committed] = yield* f.b<{
                            key: string;
                            input_hash: string;
                        }>`SELECT key, input_hash FROM action_commit`;
                        expect(
                            Either.isLeft(
                                yield* Effect.either(
                                    f.first.commit(
                                        { key: committed!.key, inputHash: committed!.input_hash, fence: old },
                                        Effect.die('Replay must not execute')
                                    )
                                )
                            )
                        ).toBe(true);
                        for (const key of ['stable', 'stale-new']) {
                            const denied = yield* f.invoke(f.oldHost, old, key, key === 'stable' ? id(10) : id(11));
                            expect(Either.isLeft(yield* Effect.either(denied.result))).toBe(true);
                        }
                        expect(yield* f.evidence).toEqual([1, 1, 1, 1, 1]);
                        const replay = yield* f.invoke(f.newHost, current, 'stable');
                        expect(yield* replay.result).toBe(40);
                        expect(replay.replayed).toBe(true);
                        expect(yield* f.b`SELECT result FROM action_commit`).toEqual(original);
                        const conflict = yield* f.invoke(f.newHost, current, 'stable', id(10), 17);
                        expect(Either.isLeft(yield* Effect.either(conflict.result))).toBe(true);
                        yield* Ref.set(f.fail, true);
                        const rollback = yield* f.invoke(f.newHost, current, 'rollback', id(12));
                        expect(Exit.isFailure(yield* Effect.exit(rollback.result))).toBe(true);
                        expect(yield* f.evidence).toEqual([1, 1, 1, 1, 2]);
                        yield* Ref.set(f.fail, false);
                        const success = yield* f.invoke(f.newHost, current, 'rollback', id(12), 19);
                        expect(yield* success.result).toBe(58);
                        expect(yield* f.evidence).toEqual([2, 2, 2, 2, 3]);
                        const event = {
                            runId,
                            eventId: 'step:1:complete',
                            payload: { _tag: 'StepCompleted' as const, stepIndex: 1 },
                        };
                        expect(
                            Either.isLeft(
                                yield* Effect.either(
                                    f.output.append(event).pipe(Effect.provideService(CurrentTenant, { id: tenant }))
                                )
                            )
                        ).toBe(true);
                        expect(
                            Either.isLeft(
                                yield* Effect.either(
                                    f.output
                                        .append(event)
                                        .pipe(
                                            Effect.provideService(CurrentTenant, { id: tenant }),
                                            Effect.provideService(CurrentRunFence, old)
                                        )
                                )
                            )
                        ).toBe(true);
                        yield* f.output
                            .append(event)
                            .pipe(
                                Effect.provideService(CurrentTenant, { id: tenant }),
                                Effect.provideService(CurrentRunFence, current)
                            );
                        expect(
                            Either.isLeft(
                                yield* Effect.either(
                                    f.output
                                        .append(event)
                                        .pipe(
                                            Effect.provideService(CurrentTenant, { id: tenant }),
                                            Effect.provideService(CurrentRunFence, old)
                                        )
                                )
                            )
                        ).toBe(true);
                        expect(
                            yield* f.output
                                .read({ runId, after: -1, limit: 10 })
                                .pipe(Effect.provideService(CurrentTenant, { id: tenant }))
                        ).toHaveLength(1);
                        yield* f.first.acceptRun(other, runId, { definition: 'other' }, f.snapshot);
                        const foreign = yield* f.first.claimRun(other, runId, 0, 'new-incarnation');
                        const tenantDenied = yield* f.invoke(f.newHost, foreign, 'tenant', id(13));
                        expect(Either.isLeft(yield* Effect.either(tenantDenied.result))).toBe(true);
                        expect((yield* f.first.getRun(tenant, runId))?.epoch).toBe(2);
                        expect((yield* f.first.getRun(other, runId))?.epoch).toBe(1);
                        yield* Ref.set(f.revoked, true);
                        const denied = yield* f.invoke(f.newHost, current, 'stable');
                        expect(Either.isLeft(yield* Effect.either(denied.result))).toBe(true);
                        expect(yield* f.evidence).toEqual([2, 2, 2, 2, 3]);
                    }
                ),
            60000
        );
        it.scopedLive(
            `orders transactions before takeover and preserves immutable acceptance on ${dialect}`,
            /** Distinguish a committed takeover from merely attempting to acquire its lock. */ () =>
                Effect.gen(
                    /** The owner transaction starts first and holds the fence until all business evidence commits. */ function* () {
                        const f = yield* fixture(dialect);
                        yield* f.first.acceptRun(tenant, runId, { exact: 31 }, f.snapshot);
                        const old = yield* f.first.claimRun(tenant, runId, 0, 'first');
                        yield* Ref.set(f.hold, true);
                        const pending = yield* Effect.fork(f.invoke(f.oldHost, old, 'before-transfer'));
                        yield* Deferred.await(f.entered);
                        if (dialect === 'postgres') {
                            const transfer = yield* Effect.fork(f.second.claimRun(tenant, runId, 1, 'second'));
                            yield* Effect.sleep('30 millis');
                            expect(Option.isNone(yield* Fiber.poll(transfer))).toBe(true);
                            yield* Deferred.succeed(f.release, undefined);
                            const result = yield* Fiber.join(pending);
                            expect(yield* result.result).toBe(40);
                            expect((yield* Fiber.join(transfer)).epoch).toBe(2);
                        } else {
                            // The synchronous SQLite driver refuses a competing BEGIN IMMEDIATE; failure is not a takeover.
                            const transfer = yield* Effect.either(f.second.claimRun(tenant, runId, 1, 'second'));
                            expect(Either.isLeft(transfer)).toBe(true);
                            yield* Deferred.succeed(f.release, undefined);
                            const result = yield* Fiber.join(pending);
                            expect(yield* result.result).toBe(40);
                            expect((yield* f.second.claimRun(tenant, runId, 1, 'second')).epoch).toBe(2);
                        }
                        expect(yield* f.evidence).toEqual([1, 1, 1, 1, 1]);
                        expect(
                            Either.isLeft(
                                yield* Effect.either(f.second.acceptRun(tenant, runId, { exact: 32 }, f.snapshot))
                            )
                        ).toBe(true);
                        expect((yield* f.second.getRun(tenant, runId))?.input).toEqual({ exact: 31 });
                        expect(
                            Either.isLeft(
                                yield* Effect.either(
                                    f.second.acceptRun(tenant, id(8), null, { ...f.snapshot, schema: [] })
                                )
                            )
                        ).toBe(true);
                        expect(yield* f.second.getRun(tenant, id(8))).toBeUndefined();
                        // Derive synthetic incompatible history after the real head so adding a valid migration cannot collide here.
                        const [latest] = yield* f.b<{
                            name: string;
                        }>`SELECT name FROM storage_migration ORDER BY name DESC LIMIT 1`;
                        const future = `${String(Number(latest?.name.slice(0, -4) ?? '0') + 1).padStart(4, '0')}.sql`;
                        yield* f.b`INSERT INTO storage_migration (name, checksum) VALUES (${future}, ${'a'.repeat(64)})`;
                        expect(
                            Either.isLeft(
                                yield* Effect.either(f.second.claimRun(tenant, runId, 2, 'incompatible-schema'))
                            )
                        ).toBe(true);
                        expect((yield* f.second.getRun(tenant, runId))?.epoch).toBe(2);
                        expect(
                            Either.isLeft(
                                yield* Effect.either(f.first.fence({ ...old, epoch: 2, owner: 'second' }, Effect.void))
                            )
                        ).toBe(true);
                    }
                ),
            60000
        );
    }
});
