/**
 * @file tests/runtime/src/execution-approval-commit.spec.ts
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
import { inspect } from 'node:util';
import { SqlClient } from '@effect/sql';
import { describe, expect, it } from '@effect/vitest';
import { define } from '@eventiva/contracts/action';
import { Authorizer, Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Flags } from '@eventiva/contracts/flags';
import { IdentityStore, RoleId } from '@eventiva/contracts/identity';
import { TenantId } from '@eventiva/contracts/ids';
import { Receipt } from '@eventiva/contracts/receipt';
import { declareResource, Resources } from '@eventiva/contracts/resource';
import { CurrentTenant, Storage } from '@eventiva/contracts/storage';
import { identityStore } from '@eventiva/integrations.sql/identity';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { migrateResources, resourceProvider } from '@eventiva/integrations.sql/resource';
import { memory } from '@eventiva/integrations.sql/sqlite';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { identitySecurity } from '@eventiva/runtime/identity';
import {
    Approvals,
    InputDigest,
    InvocationDenied,
    ExecutionPolicy,
    type InvokeOptions,
} from '@eventiva/runtime/invocation';
import { resourceRuntime } from '@eventiva/runtime/resource';
import { durable } from '@eventiva/runtime/storage';
import { ConfigProvider, Context, Deferred, Effect, Exit, Fiber, Layer, Ref, Schema, TestClock } from 'effect';

const caller = Schema.decodeUnknownSync(CallerIdentity)({
    subject: '019b0000-0000-7000-8000-000000000001',
    session: '019b0000-0000-7000-8000-000000000002',
    tenant: '019b0000-0000-7000-8000-000000000003',
    kind: 'human',
});
const tenantId = Schema.decodeUnknownSync(TenantId)(caller.tenant);
const recordId = '019b0000-0000-7000-8000-000000000004';
const guardId = '019b0000-0000-7000-8000-000000000005';
const canary = 'SYNTHETIC-PRIVATE-APPROVAL-COMMIT-CANARY';
const input = { payload: canary };
const action = define('fixture.commit', {
    version: 1,
    description: 'Stage synthetic guarded metadata without external effects.',
    permission: 'fixture.commit',
    sideEffect: 'write',
    sensitive: true,
    offline: 'online-only',
    input: Schema.Struct({ payload: Schema.String }),
    output: Schema.Struct({ payload: Schema.String }),
});
const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
/** Configure only the trusted disposable database selected by the fixture, not application configuration. */
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));

/** Compose actual SQL identity, Resources, paired Integrity/Audit and the public ActionHost around a synthetic mutation. */
const fixture = (dialect: Dialect, initiallyRequired: boolean, consumesPreconditions = false) =>
    Effect.gen(
        /** A barrier after real domain/guard writes isolates the post-handler gate from pre-handler authorization. */ function* () {
            yield* TestClock.setTime(1000);
            // PostgreSQL owns a unique disposable database; SQLite uses its real transactional engine, not an in-memory ledger mock.
            let target = local;
            if (dialect === 'postgres') {
                const url = new URL(local);
                if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.pathname !== '/eventiva_test')
                    return yield* new InvocationDenied({ action: action.name, reason: 'disposable-loopback-required' });
                const admin = Context.get(yield* Layer.build(pg(local)), SqlClient.SqlClient);
                const name = `approval_${randomUUID().replaceAll('-', '')}`;
                yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                yield* Effect.addFinalizer(
                    /** Drop only this uniquely owned database after the nested connection pool finalizes. */ () =>
                        admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie)
                );
                url.pathname = `/${name}`;
                target = url.toString();
            }
            const sql =
                dialect === 'postgres'
                    ? Context.get(yield* Layer.build(pg(target)), SqlClient.SqlClient)
                    : Context.get(yield* Layer.build(memory()), SqlClient.SqlClient);
            yield* migrate(
                dialect,
                yield* load(fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url)))
            ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            const tenant = Layer.succeed(CurrentTenant, { id: tenantId });
            const identity = identityStore.pipe(
                Layer.provideMerge(tenant),
                Layer.provide(Layer.succeed(SqlClient.SqlClient, sql))
            );
            const store = Context.get(yield* Layer.build(identity), IdentityStore);
            const role = RoleId.make('019b0000-0000-7000-8000-000000000006');
            yield* store.put(
                'role',
                {
                    id: role,
                    name: 'Synthetic commit writer',
                    grants: [{ permission: action.permission, resources: ['*'] }],
                },
                null
            );
            yield* store.put('principal', { id: caller.subject, kind: 'human', active: true }, null);
            yield* store.put('membership', { id: caller.subject, active: true, roles: [role] }, null);
            yield* store.put(
                'session',
                {
                    id: caller.session,
                    subject: caller.subject,
                    active: true,
                    expiresAt: 253402300799999,
                    delegation: null,
                },
                null
            );
            const security = identitySecurity.pipe(Layer.provideMerge(identity));
            const grants = Context.get(yield* Layer.build(security), Authorizer);
            const targetPolicy = Layer.succeed(Authorizer, {
                ...grants,
                /** The synthetic action has one fixed tenant-local target and only a wildcard fixture grant; refresh SQL authority each time. */
                check: (current, spec) => grants.canInvoke(current, spec),
            });
            const domain = yield* declareResource({
                id: 'fixture.domain',
                owner: 'fixture.core',
                moduleVersion: '1.0.0',
                fields: { payload: { type: 'text', optional: false } },
            });
            const guard = yield* declareResource({
                id: 'fixture.guard',
                owner: 'fixture.core',
                moduleVersion: '1.0.0',
                fields: { locked: { type: 'boolean', optional: false } },
            });
            const definitions = [domain, guard];
            yield* migrateResources(dialect, tenantId, definitions, {
                kind: 'additive',
                restartRequired: false,
                retainedGenerations: 0,
            }).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            const provider = yield* resourceProvider(
                dialect,
                tenantId,
                { key: { module: 'eventiva.sql', instance: 'primary' }, version: '1.0.0' },
                definitions
            ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            const resources = Context.get(
                yield* Layer.build(
                    resourceRuntime(
                        provider,
                        /** Trusted synthetic scope only; production Resources checks tenant/caller binding before this policy. */ () =>
                            Effect.void
                    )
                ),
                Resources
            );
            const required = yield* Ref.make(initiallyRequired);
            const approved = yield* Ref.make(true);
            const hold = yield* Ref.make(true);
            const entries = yield* Ref.make(0);
            const arrived = yield* Deferred.make<void>();
            const release = yield* Deferred.make<void>();
            const services = Layer.mergeAll(
                security,
                Layer.succeed(Flags, {
                    /** This unflagged core invariant introduces no capability flag or remote ingestion. */ evaluate: (
                        flag
                    ) => Effect.succeed({ flag: flag.key, value: flag.safeDefault, reason: 'TEST', fallback: true }),
                }),
                Layer.succeed(InputDigest, {
                    /** Hash the private canonical bytes; no raw input is placed into receipts. */ digest: (text) =>
                        Effect.sync(
                            /** Use the same cryptographic boundary as existing real-SQL host fixtures. */ () =>
                                createHash('sha256').update(text).digest('hex')
                        ),
                }),
                Layer.succeed(ExecutionPolicy, {
                    /** Approval may change while the handler holds a SQL transaction; prior inspection is not a capability. */
                    inspect: (current) =>
                        Effect.gen(
                            /** Derive consumed preconditions from actual SQL state, not call counts or an assumed execution phase. */ function* () {
                                // A successful handler changes this row; checking its old version again would reject legitimate work.
                                const row = consumesPreconditions ? yield* resources.get(domain, recordId) : undefined;
                                return {
                                    approval: (yield* Ref.get(required)) ? ('confirm' as const) : ('none' as const),
                                    routinePreauthorized: false,
                                    stepUp: false,
                                    bounds: {},
                                    currentVersion: row ? String(row.revision) : '0',
                                    currentState: row ? 'complete' : 'ready',
                                    dependenciesReady: !row,
                                    capacityAvailable: !row,
                                };
                            }
                        ).pipe(
                            Effect.provideService(CurrentTenant, { id: tenantId }),
                            Effect.provideService(Caller, current),
                            Effect.mapError(
                                /** Policy-store failure stays a bounded admission failure, never private SQL diagnostics. */ () =>
                                    new InvocationDenied({ action: action.name, reason: 'policy-unavailable' })
                            )
                        ),
                }),
                Layer.succeed(Approvals, {
                    /** Resolve a trusted human proof for the original exact canonical input, or a bounded revocation refusal. */ get: (
                        key
                    ) =>
                        Ref.get(approved).pipe(
                            Effect.flatMap(
                                /** A supplied reference is never authority when the trusted store has revoked its proof. */ (
                                    valid
                                ) =>
                                    key === 'human-proof' && valid
                                        ? Effect.succeed({
                                              principal: caller.subject,
                                              tenant: caller.tenant,
                                              action: action.name,
                                              version: 1,
                                              inputHash: createHash('sha256')
                                                  .update(JSON.stringify(input))
                                                  .digest('hex'),
                                              limits: {},
                                              approver: caller,
                                              issuedAt: 0,
                                              expiresAt: 10000,
                                              stepUp: false,
                                          })
                                        : Effect.fail(
                                              new InvocationDenied({ action: action.name, reason: 'approval-revoked' })
                                          )
                            )
                        ),
                    /** Preserve the same live synthetic revocation control at successful-use acceptance. */
                    use: (key) => Ref.get(approved).pipe(
                        Effect.flatMap(
                            /** A revoked fixture proof cannot acknowledge acceptance after the handler. */
                            (valid) => key === 'human-proof' && valid
                                ? Effect.void
                                : Effect.fail(new InvocationDenied({ action: action.name, reason: 'approval-revoked' }))
                        )
                    ),
                    /** This mutation-only proof fixture does not provide approved-read lifecycle support. */
                    transaction: () => Effect.fail(new InvocationDenied({ action: action.name, reason: 'read-approval-unavailable' })),
                })
            );
            const host = Context.get(
                yield* Layer.build(
                    ActionHostLive.pipe(
                        Layer.provide(Layer.merge(services, targetPolicy)),
                        Layer.provide(
                            durable.pipe(Layer.provide(tenant), Layer.provide(Layer.succeed(Storage, provider.storage)))
                        )
                    )
                ),
                ActionHost
            );
            yield* host.register({
                manifest: {
                    format: 1,
                    id: 'fixture.core',
                    version: '1.0.0',
                    description: 'Synthetic core transactional proof.',
                    actions: [action.name],
                    flags: [],
                },
                actions: [
                    implement(
                        action,
                        /** Stage guard and domain history before waiting; no extra gate inside this handler may mask missing core revalidation. */ (
                            value
                        ) =>
                            Effect.gen(
                                /** All writes join the exact Resources/Integrity owner; a final denial must undo both histories and dedup. */ function* () {
                                    yield* Ref.update(
                                        entries,
                                        /** Count handler entry independently from successful commits and replay receipts. */ (
                                            n
                                        ) => n + 1
                                    );
                                    yield* resources.create(guard, guardId, { locked: true });
                                    yield* resources.create(domain, recordId, value);
                                    // Hold after the real provider has written state/history, not before the mutation begins.
                                    if (yield* Ref.get(hold)) {
                                        yield* Deferred.succeed(arrived, undefined);
                                        yield* Deferred.await(release);
                                    }
                                    return value;
                                }
                            ).pipe(
                                Effect.orDie,
                                Effect.provideService(CurrentTenant, { id: tenantId }),
                                Effect.provideService(Caller, caller)
                            )
                    ),
                ],
            });
            /** Invoke only the common public host with captured trusted caller, never a handler or private execution helper. */
            const execute = (key: string, options: InvokeOptions = {}, value = input) =>
                host.execute(action.name, value, { idempotencyKey: key, ...options }).pipe(
                    Effect.provideService(Caller, caller),
                    Effect.tap(
                        /** Fail the one-use barrier promptly if setup/admission refuses before handler entry. */ (
                            result
                        ) =>
                            Exit.isFailure(result.result) ? Deferred.die(arrived, inspect(result.result)) : Effect.void
                    )
                );
            /** Observe durable domain/guard history and successful commits independently of invocation return values. */
            const state = Effect.gen(
                /** Failed-attempt audit is allowed; no successful mutation receipt or domain/guard evidence may survive denial. */ function* () {
                    // Query persisted evidence after the public invocation finishes, never the staged in-flight transaction.
                    const domainHistory = yield* resources.history(domain, recordId);
                    const guardHistory = yield* resources.history(guard, guardId);
                    const commits = yield* sql`SELECT result FROM action_commit WHERE result IS NOT NULL`;
                    const receipts = yield* Effect.forEach(
                        yield* sql<{ receipt: string }>`SELECT receipt FROM action_receipt`,
                        /** Validate durable audit structure rather than trusting untyped JSON parsing in the proof. */ (
                            row
                        ) => Schema.decodeUnknown(Schema.parseJson(Receipt))(row.receipt)
                    );
                    return {
                        domain: yield* resources.get(domain, recordId),
                        guard: yield* resources.get(guard, guardId),
                        domainHistory,
                        guardHistory,
                        commits,
                        successfulReceipts: receipts.filter(
                            /** Count success separately from the permitted durable denial receipt. */ (row) =>
                                row.outcome === 'succeeded'
                        ),
                    };
                }
            ).pipe(Effect.provideService(CurrentTenant, { id: tenantId }), Effect.provideService(Caller, caller));
            return { execute, state, required, approved, hold, entries, arrived, release };
        }
    );

for (const dialect of ['sqlite', 'postgres'] as const)
    describe(`${dialect} post-handler approval integrity`, /** Exercise both real SQL transaction engines through the same public host contract. */ () => {
        // Each case owns a database so prior proof or deduplication evidence cannot mask a missing gate.
        for (const change of ['raise', 'revoke'] as const)
            it.scoped(
                `rolls back staged domain/guard/success evidence when approval ${change}s during handler wait`,
                /** A pre-handler-only check wrongly succeeds and leaves both resource histories committed. */ () =>
                    Effect.gen(
                        /** Confirm refusal, sanitized evidence and deliberate same-intent recovery without automatic mutation retry. */ function* () {
                            // Start with authority that permits real writes, then revoke only while the transaction is held open.
                            const f = yield* fixture(dialect, change === 'revoke');
                            const options = change === 'revoke' ? { approvalId: 'human-proof' } : {};
                            const pending = yield* Effect.fork(f.execute('original', options));
                            yield* Deferred.await(f.arrived);
                            if (change === 'raise') yield* Ref.set(f.required, true);
                            else yield* Ref.set(f.approved, false);
                            yield* Deferred.succeed(f.release, undefined);
                            const denied = yield* Fiber.join(pending);
                            const persisted = yield* f.state;
                            expect({ result: denied.result, ...persisted }).toMatchObject({
                                result: { _tag: 'Failure' },
                                domain: undefined,
                                guard: undefined,
                                domainHistory: [],
                                guardHistory: [],
                                commits: [],
                                successfulReceipts: [],
                            });
                            expect(Exit.isFailure(denied.result) && denied.result.cause).toMatchObject({
                                _tag: 'Fail',
                                error: {
                                    _tag: 'InvocationDenied',
                                    action: action.name,
                                    reason: change === 'raise' ? 'approval-required' : 'approval-revoked',
                                },
                            });
                            expect(denied.receipt.outcome).toBe('denied');
                            expect(inspect(denied)).not.toContain(canary);
                            expect(yield* Ref.get(f.entries)).toBe(1);
                            yield* Ref.set(f.hold, false);
                            yield* Ref.set(f.approved, true);
                            const recovered = yield* f.execute('original', { approvalId: 'human-proof' });
                            expect(recovered.result).toEqual(Exit.succeed(input));
                            expect(recovered.replayed).toBe(false);
                            const saved = yield* f.state;
                            expect(saved.domainHistory).toHaveLength(1);
                            expect(saved.guardHistory).toHaveLength(1);
                            expect(saved.commits).toHaveLength(1);
                            expect(saved.successfulReceipts).toHaveLength(1);
                            const replay = yield* f.execute('original', { approvalId: 'human-proof' });
                            expect(replay.result).toEqual(Exit.succeed(input));
                            expect(replay.replayed).toBe(true);
                            expect(replay.receipt.id).not.toBe(recovered.receipt.id);
                            expect((yield* f.state).commits).toEqual(saved.commits);
                            expect(yield* Ref.get(f.entries)).toBe(2);
                        }
                    ),
                60000
            );

        for (const window of ['deadline', 'approval'] as const)
            it.scoped(
                `rolls back staged effects at the exclusive ${window} expiry during handler wait`,
                /** A proof or invocation valid on admission must remain valid when its SQL changes are about to commit. */ () =>
                    Effect.gen(
                        /** Advance only the deterministic trusted clock after the actual writes, not before handler admission. */ function* () {
                            const f = yield* fixture(dialect, true);
                            // Holding the handler after writes makes expiry a commit-boundary failure, not an admission refusal.
                            const pending = yield* Effect.fork(
                                f.execute('expiry', {
                                    approvalId: 'human-proof',
                                    ...(window === 'deadline' ? { deadline: 2000 } : {}),
                                })
                            );
                            yield* Deferred.await(f.arrived);
                            yield* TestClock.setTime(window === 'deadline' ? 2000 : 10000);
                            yield* Deferred.succeed(f.release, undefined);
                            const denied = yield* Fiber.join(pending);
                            expect(Exit.isFailure(denied.result) && denied.result.cause).toMatchObject({
                                _tag: 'Fail',
                                error: {
                                    _tag: 'InvocationDenied',
                                    reason: window === 'deadline' ? 'expired' : 'approval-expired',
                                },
                            });
                            expect(denied.receipt.outcome).toBe('denied');
                            expect(inspect(denied)).not.toContain(canary);
                            expect(yield* f.state).toEqual({
                                domain: undefined,
                                guard: undefined,
                                domainHistory: [],
                                guardHistory: [],
                                commits: [],
                                successfulReceipts: [],
                            });
                            expect(yield* Ref.get(f.entries)).toBe(1);
                        }
                    ),
                60000
            );

        it.scoped(
            'permits unchanged human approval and preserves original durable commit under replay and later revocation',
            /** Extra checks must not reject valid proofs, run mutations on replay or replace original success evidence. */ () =>
                Effect.gen(
                    /** Exercise an authorized proof across the same barrier and a denied replay after success. */ function* () {
                        const f = yield* fixture(dialect, true);
                        const options = { approvalId: 'human-proof' };
                        const pending = yield* Effect.fork(f.execute('stable', options));
                        yield* Deferred.await(f.arrived);
                        yield* Deferred.succeed(f.release, undefined);
                        const original = yield* Fiber.join(pending);
                        expect(original.result).toEqual(Exit.succeed(input));
                        expect(original.replayed).toBe(false);
                        const saved = yield* f.state;
                        expect(saved.domainHistory).toHaveLength(1);
                        expect(saved.guardHistory).toHaveLength(1);
                        expect(saved.commits).toHaveLength(1);
                        expect(saved.successfulReceipts).toHaveLength(1);
                        expect(saved.commits[0]).toMatchObject({
                            result: expect.stringContaining(original.receipt.id),
                        });
                        const replay = yield* f.execute('stable', options);
                        expect(replay.result).toEqual(Exit.succeed(input));
                        expect(replay.replayed).toBe(true);
                        expect(replay.receipt.id).not.toBe(original.receipt.id);
                        yield* Ref.set(f.approved, false);
                        const denied = yield* f.execute('stable', options);
                        expect(Exit.isFailure(denied.result)).toBe(true);
                        expect(denied.receipt.outcome).toBe('denied');
                        expect(inspect(denied)).not.toContain(canary);
                        yield* Ref.set(f.approved, true);
                        expect(Exit.isSuccess((yield* f.execute('stable', options)).result)).toBe(true);
                        // Denied/authorized replay may append invocation audit, never domain history or the original action commit.
                        const after = yield* f.state;
                        expect(after.domainHistory).toEqual(saved.domainHistory);
                        expect(after.guardHistory).toEqual(saved.guardHistory);
                        expect(after.commits).toEqual(saved.commits);
                        expect(yield* Ref.get(f.entries)).toBe(1);
                    }
                ),
            60000
        );

        it.scoped(
            'commits authorized self-mutation without reapplying consumed state/version/capacity preconditions',
            /** Commit-time freshness must not turn an expected successful state transition into an optimistic conflict. */ () =>
                Effect.gen(
                    /** Preserve full pre-mutation and replay checks while allowing the new transaction's own effects. */ function* () {
                        const f = yield* fixture(dialect, true, true);
                        const options = { approvalId: 'human-proof', expectedVersion: '0', expectedState: 'ready' };
                        const pending = yield* Effect.fork(f.execute('transition', options));
                        yield* Deferred.await(f.arrived);
                        yield* Deferred.succeed(f.release, undefined);
                        const committed = yield* Fiber.join(pending);
                        expect(committed.result).toEqual(Exit.succeed(input));
                        expect(committed.receipt.outcome).toBe('succeeded');
                        const saved = yield* f.state;
                        expect(saved.domainHistory).toHaveLength(1);
                        expect(saved.guardHistory).toHaveLength(1);
                        expect(saved.commits).toHaveLength(1);
                        // Replay keeps its existing admission semantics; the original optimistic state is no longer current.
                        const replay = yield* f.execute('transition', options);
                        expect(Exit.isFailure(replay.result) && replay.result.cause).toMatchObject({
                            _tag: 'Fail',
                            error: { _tag: 'InvocationDenied', reason: 'version-conflict' },
                        });
                        expect((yield* f.state).commits).toEqual(saved.commits);
                        expect(yield* Ref.get(f.entries)).toBe(1);
                    }
                ),
            60000
        );
    });
