/**
 * @file tests/storage/src/approval.spec.ts
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
import { define } from '@eventiva/contracts/action';
import {
    ApprovalEvents,
    ApprovalFailure,
    ApprovalStore,
    cancelApprovalsPermission,
} from '@eventiva/contracts/approval';
import { Authorizer, Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Flags } from '@eventiva/contracts/flags';
import { IdentityStore, RoleId, TeamId } from '@eventiva/contracts/identity';
import { CurrentTenant, Storage } from '@eventiva/contracts/storage';
import { approvalStore } from '@eventiva/integrations.sql/approval';
import { identityStore } from '@eventiva/integrations.sql/identity';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { memory } from '@eventiva/integrations.sql/sqlite';
import { storage } from '@eventiva/integrations.sql/storage';
import { implement } from '@eventiva/runtime/action';
import {
    approvalServices,
    cancelApproval,
    issueApproval,
    lookupApproval,
    useApproval,
} from '@eventiva/runtime/approval';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { identitySecurity } from '@eventiva/runtime/identity';
import { Audit, AuditUnavailable, ExecutionPolicy, InputDigest } from '@eventiva/runtime/invocation';
import { durable } from '@eventiva/runtime/storage';
import { describe, expect, it } from '@effect/vitest';
import { ConfigProvider, Context, Deferred, Effect, Fiber, Layer, Ref, Schema, TestClock } from 'effect';

/** Stable synthetic IDs make tenant/principal/session substitutions independently observable. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const human = Schema.decodeUnknownSync(CallerIdentity)({
    subject: id(1),
    session: id(2),
    tenant: id(3),
    kind: 'human',
});
const other = Schema.decodeUnknownSync(CallerIdentity)({
    subject: id(4),
    session: id(5),
    tenant: id(3),
    kind: 'human',
});
const agent = Schema.decodeUnknownSync(CallerIdentity)({
    subject: id(6),
    session: id(7),
    tenant: id(3),
    kind: 'external-agent',
    onBehalfOf: human.subject,
});
const role = RoleId.make(id(8));
const settings = { sessionLifetimeMs: 7_200_000, lifetimeMs: 600_000 };
const input = { amount: '17', items: ['left', 'right'] };
const spec = define('fixture.approval.write', {
    version: 1,
    description: 'Synthetic fixed-target approval transaction.',
    input: Schema.Struct({ amount: Schema.NumberFromString, items: Schema.Array(Schema.String) }),
    output: Schema.Number,
    permission: 'fixture.approval.write',
    sideEffect: 'write',
    offline: 'online-only',
    approval: 'confirm',
});
const binding = implement(
    spec,
    /** The issuance/lookup fixture never needs to run this handler. */ (value) => Effect.succeed(value.amount)
);
const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
const target = new URL(local);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.pathname !== '/eventiva_test')
    throw new Error('Approval conformance requires disposable loopback eventiva_test');
/** Configure only an explicitly validated disposable PostgreSQL endpoint. */
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));
/** Own one fresh migrated database, with cleanup after all fixture clients close. */
const database = (dialect: Dialect) =>
    Effect.gen(
        /** Use distinct physical databases, not tenant predicates, to isolate concurrent scenarios. */
        function* () {
            // Register database cleanup before opening fixture connections so LIFO finalization closes clients first.
            let connection;
            if (dialect === 'postgres') {
                const admin = Context.get(yield* Layer.build(pg(local)), SqlClient.SqlClient);
                const name = `approval_${randomUUID().replaceAll('-', '')}`;
                yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                yield* Effect.addFinalizer(
                    /** Remove only this synthetic fixture database after its connections close. */ () =>
                        admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie)
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
/** Compose actual SQL identity/proof services; only fixed-target module authorization/policy is synthetic. */
const fixture = (dialect: Dialect) =>
    Effect.gen(
        /** Seed live human/agent authority and retain one tenant SQL client across every service. */
        function* () {
            // A single routed client is essential: separate clients would falsely exercise independent transactions.
            yield* TestClock.setTime(1_000_000);
            const sql = yield* database(dialect);
            const root = Layer.merge(
                Layer.succeed(SqlClient.SqlClient, sql),
                Layer.succeed(CurrentTenant, { id: human.tenant! })
            );
            const context = yield* Layer.build(
                Layer.mergeAll(approvalStore, identityStore, storage(dialect)).pipe(Layer.provideMerge(root))
            );
            const identities = Context.get(context, IdentityStore);
            yield* identities.put(
                'role',
                { id: role, name: 'Synthetic writer', grants: [{ permission: spec.permission, resources: ['*'] }] },
                null
            );
            for (const caller of [human, other, agent]) {
                yield* identities.put('principal', { id: caller.subject, active: true, kind: caller.kind }, null);
                yield* identities.put('membership', { id: caller.subject, active: true, roles: [role] }, null);
                yield* identities.put(
                    'session',
                    {
                        id: caller.session,
                        subject: caller.subject,
                        active: true,
                        expiresAt: 9_000_000,
                        delegation:
                            caller.kind === 'human'
                                ? null
                                : {
                                      human: human.subject,
                                      session: human.session,
                                      expiresAt: 8_000_000,
                                      grants: [{ permission: spec.permission, resources: ['*'] }],
                                  },
                    },
                    null
                );
            }
            const security = yield* Layer.build(identitySecurity.pipe(Layer.provide(Layer.succeedContext(context))));
            const auth = Context.get(security, Authorizer);
            const stepUp = yield* Ref.make(false);
            const services = Context.merge(context, security).pipe(
                Context.add(Authorizer, {
                    ...auth,
                    /** The synthetic action has exactly one fixed tenant-local target; permissions still resolve from live SQL. */ check: (
                        caller,
                        action
                    ) => auth.canInvoke(caller, action),
                }),
                Context.add(InputDigest, {
                    /** Hash canonical encoded bytes with the same maintained platform primitive as production. */ digest: (
                        text
                    ) =>
                        Effect.sync(
                            /** Evaluate the digest only when the capability runs. */ () =>
                                createHash('sha256').update(text).digest('hex')
                        ),
                }),
                Context.add(ExecutionPolicy, {
                    /** Derive the fixture amount bound from decoded input; step-up remains explicitly unavailable. */ inspect:
                        (_caller, _action, decoded) =>
                            Ref.get(stepUp).pipe(
                                Effect.map(
                                    /** Return fresh policy observations instead of trusting the approval request. */ (
                                        required
                                    ) => ({
                                        approval: 'confirm' as const,
                                        routinePreauthorized: false,
                                        stepUp: required,
                                        bounds: Schema.is(
                                            Schema.Struct({ amount: Schema.Number, items: Schema.Array(Schema.String) })
                                        )(decoded)
                                            ? { amount: decoded.amount }
                                            : {},
                                        dependenciesReady: true,
                                        capacityAvailable: true,
                                    })
                                )
                            ),
                }),
                Context.add(Flags, {
                    /** Enable only fixture module admission, not a remote rollout. */ evaluate: (flag) =>
                        Effect.succeed({ flag: flag.key, value: true, reason: 'STATIC', fallback: false }),
                })
            );
            /** Apply fixture services without capturing a transaction connection or overriding the executing fiber's SQL transaction. */
            const run = <A, E, R>(effect: Effect.Effect<A, E, R>, caller = human) =>
                effect.pipe(Effect.provide(services), Effect.provideService(Caller, caller));
            return { sql, identities, proofs: Context.get(context, ApprovalStore), services, stepUp, run };
        }
    );

for (const dialect of ['sqlite', 'postgres'] as const)
    describe(`approval provider ${dialect}`, /** Both real SQL dialects run the same public service contract. */ () => {
        it.scoped(
            'persists exact human consent, transformed canonical binding, live limits and actual-session-capped expiry',
            /** Same input/key succeeds; independent substitutions must refuse. */ () =>
                Effect.gen(
                    /** Assert stored evidence and public lookup results, not private helper call order. */
                    function* () {
                        // Shorten the actual session below the approved window to detect a policy-only expiry implementation.
                        const f = yield* fixture(dialect);
                        const session = (yield* f.identities.get('session', human.session))!;
                        yield* f.identities.put('session', { ...session.value, expiresAt: 1_120_000 }, session.version);
                        const record = yield* f.run(issueApproval(binding, input, human, 'job-1', settings));
                        expect(record.expiresAt).toBe(1_120_000);
                        expect(record.retention).toBe('six-months');
                        expect(record.binding.inputHash).toBe(
                            createHash('sha256').update('{"amount":"17","items":["left","right"]}').digest('hex')
                        );
                        expect((yield* f.run(lookupApproval(record.id, binding, input, 'job-1'))).limits).toEqual({
                            amount: 17,
                        });
                        expect(
                            yield* f.run(Effect.either(lookupApproval(record.id, binding, input, 'job-2')))
                        ).toMatchObject({ _tag: 'Left', left: { reason: 'binding' } });
                        expect(
                            yield* f.run(
                                Effect.either(
                                    lookupApproval(
                                        record.id,
                                        { ...binding, spec: { ...spec, version: 2 } },
                                        input,
                                        'job-1'
                                    )
                                )
                            )
                        ).toMatchObject({ _tag: 'Left', left: { reason: 'binding' } });
                        expect(
                            yield* f.run(
                                Effect.either(lookupApproval(record.id, binding, input, 'job-1')),
                                Schema.decodeUnknownSync(CallerIdentity)({ ...human, tenant: id(99) })
                            )
                        ).toMatchObject({ _tag: 'Left' });
                        expect(
                            yield* f.run(
                                Effect.either(lookupApproval(record.id, binding, { ...input, amount: '18' }, 'job-1'))
                            )
                        ).toMatchObject({ _tag: 'Left' });
                        expect(
                            yield* f.run(
                                Effect.either(
                                    lookupApproval(record.id, binding, { ...input, items: ['right', 'left'] }, 'job-1')
                                )
                            )
                        ).toMatchObject({ _tag: 'Left' });
                        expect(
                            yield* f.run(Effect.either(lookupApproval(record.id, binding, input, 'job-1')), other)
                        ).toMatchObject({ _tag: 'Left' });
                        yield* Ref.set(f.stepUp, true);
                        expect(
                            yield* f.run(Effect.either(lookupApproval(record.id, binding, input, 'job-1')))
                        ).toMatchObject({ _tag: 'Left', left: { reason: 'step-up' } });
                        yield* Ref.set(f.stepUp, false);
                        yield* TestClock.setTime(record.expiresAt);
                        expect(
                            yield* f.run(Effect.either(lookupApproval(record.id, binding, input, 'job-1')))
                        ).toMatchObject({ _tag: 'Left', left: { reason: 'expired' } });
                    }
                )
        );

        it.scoped(
            'allows own pending cancellation after target permission loss and scoped independent tenant cancellation only',
            /** Role display names and event-shaped scope are not trusted event authority. */ () =>
                Effect.gen(
                    /** Exercise independent grants, live team roles and denial of used or expired cancellation. */
                    function* () {
                        // Give the same actor misleading event and foreign-tenant grants before granting the exact permitted scope.
                        const f = yield* fixture(dialect);
                        const a = yield* f.run(issueApproval(binding, input, human, 'own', settings));
                        const b = yield* f.run(issueApproval(binding, input, human, 'other', settings));
                        expect(yield* f.run(Effect.either(cancelApproval(b.id)), other)).toMatchObject({
                            _tag: 'Left',
                        });
                        const cancelRole = RoleId.make(id(90));
                        yield* f.identities.put(
                            'role',
                            {
                                id: cancelRole,
                                name: 'Event lead',
                                grants: [
                                    { permission: cancelApprovalsPermission, resources: [`event:${human.tenant}`] },
                                ],
                            },
                            null
                        );
                        const team = {
                            id: TeamId.make(id(91)),
                            name: 'Independent cancel scope',
                            members: [other.subject],
                            roles: [cancelRole],
                        };
                        yield* f.identities.put('team', team, null);
                        expect(yield* f.run(Effect.either(cancelApproval(b.id)), other)).toMatchObject({
                            _tag: 'Left',
                        });
                        yield* f.identities.put(
                            'role',
                            {
                                id: cancelRole,
                                name: 'Independently granted',
                                grants: [{ permission: cancelApprovalsPermission, resources: [`tenant:${id(99)}`] }],
                            },
                            0
                        );
                        expect(yield* f.run(Effect.either(cancelApproval(b.id)), other)).toMatchObject({
                            _tag: 'Left',
                        });
                        yield* f.identities.put(
                            'role',
                            {
                                id: cancelRole,
                                name: 'Independently granted',
                                grants: [
                                    { permission: cancelApprovalsPermission, resources: [`tenant:${human.tenant}`] },
                                ],
                            },
                            1
                        );
                        expect((yield* f.run(cancelApproval(b.id), other)).revokedAt).toBe(1_000_000);
                        expect((yield* f.run(cancelApproval(b.id), other)).revision).toBe(1);
                        yield* f.identities.put('role', { id: role, name: 'Revoked writer', grants: [] }, 0);
                        expect(yield* f.run(Effect.either(lookupApproval(a.id, binding, input, 'own')))).toMatchObject({
                            _tag: 'Left',
                            left: { reason: 'denied' },
                        });
                        expect((yield* f.run(cancelApproval(a.id))).revokedAt).toBe(1_000_000);
                        expect(yield* f.run(Effect.either(lookupApproval(a.id, binding, input, 'own')))).toMatchObject({
                            _tag: 'Left',
                            left: { reason: 'revoked' },
                        });
                    }
                )
        );

        it.scoped(
            'refreshes live agent delegation and both actor/human sessions; agents never issue or cancel consent',
            /** Fresh evidence cannot preserve a revoked human session or narrowed delegation. */ () =>
                Effect.gen(
                    /** Keep one successful delegated control before independently withdrawing authority. */
                    function* () {
                        // Establish success first so denial cannot be explained by a permanently unusable agent fixture.
                        const f = yield* fixture(dialect);
                        const record = yield* f.run(issueApproval(binding, input, agent, 'agent', settings));
                        expect(
                            (yield* f.run(lookupApproval(record.id, binding, input, 'agent'), agent)).binding.principal
                        ).toBe(agent.subject);
                        expect(
                            yield* f.run(Effect.either(issueApproval(binding, input, agent, 'self', settings)), agent)
                        ).toMatchObject({ _tag: 'Left' });
                        expect(yield* f.run(Effect.either(cancelApproval(record.id)), agent)).toMatchObject({
                            _tag: 'Left',
                        });
                        yield* f.run(useApproval(record.id, binding, input, 'agent'), agent);
                        const [usedDecision] = yield* f.sql<{
                            body: string;
                        }>`SELECT body FROM approval_decision WHERE proof_id = ${record.id} AND revision = 1`;
                        expect(JSON.parse(usedDecision!.body)).toMatchObject({
                            kind: 'used',
                            actor: { subject: agent.subject, session: agent.session, kind: 'external-agent' },
                        });
                        expect((yield* f.proofs.get(record.id))?.approver.subject).toBe(human.subject);
                        const session = (yield* f.identities.get('session', agent.session))!;
                        yield* f.identities.put(
                            'session',
                            { ...session.value, delegation: { ...session.value.delegation!, grants: [] } },
                            session.version
                        );
                        expect(
                            yield* f.run(Effect.either(lookupApproval(record.id, binding, input, 'agent')), agent)
                        ).toMatchObject({ _tag: 'Left' });
                        yield* f.identities.put('session', session.value, session.version + 1);
                        const humanSession = (yield* f.identities.get('session', human.session))!;
                        yield* f.identities.put(
                            'session',
                            { ...humanSession.value, active: false },
                            humanSession.version
                        );
                        expect(
                            yield* f.run(Effect.either(lookupApproval(record.id, binding, input, 'agent')), agent)
                        ).toMatchObject({ _tag: 'Left' });
                    }
                )
        );

        it.scoped(
            'requires captured resource association and independent permission without disabling own cancellation',
            /** A misleading role name or request event cannot replace the feature-owned event/target authority source. */ () =>
                Effect.gen(
                    /** Persist server-derived scope and independently invalidate association availability, reassignment and permission. */
                    function* () {
                        // Keep the granting actor distinct from the consenting human so own-cancel cannot mask missing event checks.
                        const f = yield* fixture(dialect);
                        const event = yield* Ref.make('event-a');
                        const associationAvailable = yield* Ref.make(true);
                        const events: ApprovalEvents['Type'] = {
                            /** Return only the canonical target's authoritative event association, not arbitrary request fields. */
                            resolve: (target, wire) =>
                                Effect.gen(
                                    /** These checks make accidental forwarding of decoded input or another principal visible. */
                                    function* () {
                                        // The authority port receives registered wire data; accepting decoded values would hide a binding mismatch.
                                        if (
                                            target.principal !== human.subject ||
                                            JSON.stringify(wire) !== JSON.stringify(input)
                                        )
                                            return yield* new ApprovalFailure({ reason: 'binding' });
                                        return { event: yield* Ref.get(event), resource: 'registered-target-17' };
                                    }
                                ),
                            /** Unavailable or reassigned targets must deny even while the independent exact-resource grant exists. */
                            canCancel: (caller, _binding, scope) =>
                                Effect.gen(
                                    /** Check current association rather than accepting its preparation-time snapshot indefinitely. */
                                    function* () {
                                        if (
                                            caller.subject !== other.subject ||
                                            !(yield* Ref.get(associationAvailable)) ||
                                            scope.event !== (yield* Ref.get(event)) ||
                                            scope.resource !== 'registered-target-17'
                                        )
                                            return yield* new ApprovalFailure({ reason: 'denied' });
                                    }
                                ),
                        };
                        /** Supply feature authority for this routed operation only; omission below explicitly exercises fail-closed behavior. */
                        const run = <A, E, R>(effect: Effect.Effect<A, E, R>, caller = human) =>
                            f.run(effect.pipe(Effect.provideService(ApprovalEvents, events)), caller);
                        const record = yield* run(issueApproval(binding, input, human, 'event-key', settings));
                        expect(record.eventScope).toEqual({ event: 'event-a', resource: 'registered-target-17' });
                        const cancelRole = RoleId.make(id(95));
                        yield* f.identities.put(
                            'role',
                            {
                                id: cancelRole,
                                name: 'Event lead',
                                grants: [
                                    { permission: cancelApprovalsPermission, resources: ['registered-target-18'] },
                                ],
                            },
                            null
                        );
                        yield* f.identities.put(
                            'team',
                            {
                                id: TeamId.make(id(96)),
                                name: 'Event leads',
                                members: [other.subject],
                                roles: [cancelRole],
                            },
                            null
                        );
                        expect(yield* run(Effect.either(cancelApproval(record.id)), other)).toMatchObject({
                            _tag: 'Left',
                        });
                        yield* f.identities.put(
                            'role',
                            {
                                id: cancelRole,
                                name: 'Independent permission',
                                grants: [
                                    { permission: cancelApprovalsPermission, resources: ['registered-target-17'] },
                                ],
                            },
                            0
                        );
                        expect(yield* f.run(Effect.either(cancelApproval(record.id)), other)).toMatchObject({
                            _tag: 'Left',
                        });
                        yield* Ref.set(associationAvailable, false);
                        expect(yield* run(Effect.either(cancelApproval(record.id)), other)).toMatchObject({
                            _tag: 'Left',
                        });
                        yield* Ref.set(associationAvailable, true);
                        yield* Ref.set(event, 'event-b');
                        expect(yield* run(Effect.either(cancelApproval(record.id)), other)).toMatchObject({
                            _tag: 'Left',
                        });
                        expect(
                            yield* run(Effect.either(lookupApproval(record.id, binding, input, 'event-key')))
                        ).toMatchObject({ _tag: 'Left', left: { reason: 'binding' } });
                        yield* Ref.set(event, 'event-a');
                        expect((yield* run(cancelApproval(record.id), other)).revokedAt).toBe(1_000_000);
                        const own = yield* run(issueApproval(binding, input, human, 'own-event-key', settings));
                        expect((yield* f.run(cancelApproval(own.id))).revokedAt).toBe(1_000_000);
                        expect((yield* f.proofs.get(own.id))?.retainUntil).toBe(Date.parse('1970-07-01T00:16:40Z'));
                    }
                )
        );

        it.scoped(
            'rolls back proof issue/use/cancel when audit fails and rejects malformed or missing persisted evidence',
            /** Real SQL errors cannot become absent proof or acknowledged evidence. */ () =>
                Effect.gen(
                    /** Use duplicate decision identities to fail audit after the optimistic proof write, then inspect rollback. */
                    function* () {
                        // A conflicting immutable decision fails after proof UPDATE, distinguishing rollback from preflight rejection.
                        const f = yield* fixture(dialect);
                        const record = yield* f.run(issueApproval(binding, input, human, 'audit', settings));
                        yield* f.sql`INSERT INTO approval_decision (proof_id, revision, body) VALUES (${record.id}, 1, '{}')`;
                        expect(yield* f.run(Effect.either(cancelApproval(record.id)))).toMatchObject({
                            _tag: 'Left',
                            left: { reason: 'unavailable' },
                        });
                        expect((yield* f.proofs.get(record.id))?.revision).toBe(0);
                        expect(
                            yield* f.run(Effect.either(useApproval(record.id, binding, input, 'audit')))
                        ).toMatchObject({ _tag: 'Left' });
                        expect((yield* f.proofs.get(record.id))?.usedAt).toBeNull();
                        yield* f.sql`UPDATE approval_proof SET body = ${JSON.stringify({ ...record, stepUp: true })} WHERE id = ${record.id}`;
                        expect(yield* Effect.either(f.proofs.get(record.id))).toMatchObject({
                            _tag: 'Left',
                            left: { reason: 'invalid' },
                        });
                        expect(
                            yield* f.run(Effect.either(lookupApproval(id(98), binding, input, 'audit')))
                        ).toMatchObject({ _tag: 'Left', left: { reason: 'missing' } });
                        yield* f.sql`DROP TABLE approval_decision`;
                        expect(
                            yield* f.run(Effect.either(issueApproval(binding, input, human, 'failed-issue', settings)))
                        ).toMatchObject({ _tag: 'Left', left: { reason: 'unavailable' } });
                        const [row] = yield* f.sql<{
                            count: number | string;
                        }>`SELECT COUNT(*) AS count FROM approval_proof`;
                        expect(Number(row!.count)).toBe(1);
                    }
                )
        );

        it.scoped(
            'keeps use atomic with public host mutation and revalidates live proof on replay',
            /** Registered execution must consume proof automatically; the handler cannot stand in for host lifecycle wiring. */ () =>
                Effect.gen(
                    /** Keep exact domain/outbox/receipt counts while changing the live consenting session between replays. */
                    function* () {
                        // Keep the handler ignorant of the approval id so removing executor use breaks the stored-state assertions.
                        const f = yield* fixture(dialect);
                        const proof = yield* f.run(issueApproval(binding, input, human, 'host-key', settings));
                        const failAfterUse = yield* Ref.make(true);
                        const implementation = implement(
                            spec,
                            /** Stage a domain effect and success-use marker in the authoritative transaction. */ (
                                value
                            ) =>
                                Effect.gen(
                                    /** Neither mutation nor lifecycle evidence may survive a later host/audit refusal. */
                                    function* () {
                                        // Fail after domain/outbox writes; only the executor, never this handler, may mark consent used.
                                        yield* f.sql`INSERT INTO approval_host_effect (amount) VALUES (${value.amount})`;
                                        yield* Context.get(f.services, Storage).enqueue(id(50), {
                                            operation: 'fixture',
                                        });
                                        if (yield* Ref.get(failAfterUse))
                                            return yield* Effect.dieMessage(
                                                'Synthetic failure after staged SQL effects.'
                                            );
                                        return value.amount;
                                    }
                                ).pipe(Effect.orDie)
                        );
                        yield* f.sql`CREATE TABLE approval_host_effect (amount integer NOT NULL)`;
                        const approvals = approvalServices.pipe(Layer.provide(Layer.succeedContext(f.services)));
                        const host = Context.get(
                            yield* Layer.build(
                                ActionHostLive.pipe(
                                    Layer.provide(durable),
                                    Layer.provide(approvals),
                                    Layer.provide(Layer.succeedContext(f.services))
                                )
                            ),
                            ActionHost
                        );
                        yield* host.register({
                            manifest: {
                                format: 1,
                                id: 'fixture.approval',
                                version: '1.0.0',
                                description: 'SQL approval fixture.',
                                actions: [spec.name],
                                flags: [],
                            },
                            actions: [implementation],
                        });
                        const intent = { approvalId: proof.id, idempotencyKey: 'host-key' };
                        expect((yield* f.run(host.execute(spec.name, input, intent))).result._tag).toBe('Failure');
                        expect((yield* f.proofs.get(proof.id))?.usedAt).toBeNull();
                        const [rolledBack] = yield* f.sql<{
                            count: number | string;
                        }>`SELECT COUNT(*) AS count FROM approval_host_effect`;
                        const [outbox] = yield* f.sql<{
                            count: number | string;
                        }>`SELECT COUNT(*) AS count FROM command_outbox`;
                        expect([Number(rolledBack!.count), Number(outbox!.count)]).toEqual([0, 0]);
                        yield* Ref.set(failAfterUse, false);
                        // A use-decision collision occurs after the handler, so a wrong-client lifecycle adapter leaks the domain write.
                        yield* f.sql`INSERT INTO approval_decision (proof_id, revision, body) VALUES (${proof.id}, 1, '{}')`;
                        expect((yield* f.run(host.execute(spec.name, input, intent))).result._tag).toBe('Failure');
                        expect((yield* f.proofs.get(proof.id))?.usedAt).toBeNull();
                        const [stillRolledBack] = yield* f.sql<{
                            count: number | string;
                        }>`SELECT COUNT(*) AS count FROM approval_host_effect`;
                        expect(Number(stillRolledBack!.count)).toBe(0);
                        // The append-only collision cannot be removed; use fresh consent/key for the independent successful control.
                        const accepted = yield* f.run(issueApproval(binding, input, human, 'host-key', settings));
                        const acceptedIntent = { approvalId: accepted.id, idempotencyKey: 'host-key' };
                        expect((yield* f.run(host.execute(spec.name, input, acceptedIntent))).result._tag).toBe(
                            'Success'
                        );
                        expect((yield* f.proofs.get(accepted.id))?.usedAt).toBe(1_000_000);
                        expect((yield* f.proofs.get(accepted.id))?.retainUntil).toBe(
                            Date.parse('1970-07-01T00:16:40Z')
                        );
                        expect((yield* f.run(host.execute(spec.name, input, acceptedIntent))).replayed).toBe(true);
                        expect(yield* f.run(Effect.either(cancelApproval(accepted.id)))).toMatchObject({
                            _tag: 'Left',
                            left: { reason: 'conflict' },
                        });
                        const session = (yield* f.identities.get('session', human.session))!;
                        yield* f.identities.put('session', { ...session.value, active: false }, session.version);
                        expect((yield* f.run(host.execute(spec.name, input, acceptedIntent))).result._tag).toBe(
                            'Failure'
                        );
                        const [row] = yield* f.sql<{
                            count: number | string;
                            total: number | string;
                        }>`SELECT COUNT(*) AS count, SUM(amount) AS total FROM approval_host_effect`;
                        expect([Number(row!.count), Number(row!.total)]).toEqual([1, 17]);
                    }
                )
        );

        it.scoped(
            'rolls approved-read use and successful audit back together, without caching read output or renewing first use',
            /** A durable audit failure after handler and proof writes must leave consent pending in both real SQL dialects. */ () =>
                Effect.gen(
                    /** Distinguish mandatory accepting audit from best-effort read receipt delivery and business deduplication. */
                    function* () {
                        // Reuse the target's codec/permission but declare a read so Integrity cannot accidentally provide atomicity.
                        const f = yield* fixture(dialect);
                        const read = { ...spec, sideEffect: 'read' as const };
                        const readBinding = implement(
                            read,
                            /** Read output has no lifecycle side effect of its own. */ (value) =>
                                Effect.succeed(value.amount)
                        );
                        const proof = yield* f.run(issueApproval(readBinding, input, human, 'read-key', settings));
                        const failAudit = yield* Ref.make(true);
                        const durables = yield* Layer.build(
                            durable.pipe(Layer.provide(Layer.succeedContext(f.services)))
                        );
                        const originalAudit = Context.get(durables, Audit);
                        const services = Context.merge(f.services, durables).pipe(
                            Context.add(Audit, {
                                ...originalAudit,
                                /** Fail after the real successful receipt write, not on admission or a later denial receipt. */
                                record: (receipt, allowSpool) =>
                                    Effect.gen(
                                        /** This failure must unwind the same-client SQL transaction, including its already-written use decision. */
                                        function* () {
                                            // Fail after persistence so an implementation with an independent audit transaction cannot pass.
                                            const mode = yield* originalAudit.record(receipt, allowSpool);
                                            if (receipt.outcome === 'succeeded' && (yield* Ref.get(failAudit)))
                                                return yield* new AuditUnavailable({ action: receipt.action });
                                            return mode;
                                        }
                                    ),
                            })
                        );
                        const host = Context.get(
                            yield* Layer.build(
                                ActionHostLive.pipe(
                                    Layer.provide(
                                        approvalServices.pipe(Layer.provide(Layer.succeedContext(f.services)))
                                    ),
                                    Layer.provide(Layer.succeedContext(services))
                                )
                            ),
                            ActionHost
                        );
                        yield* host.register({
                            manifest: {
                                format: 1,
                                id: 'fixture.read',
                                version: '1.0.0',
                                description: 'Approved SQL read.',
                                actions: [read.name],
                                flags: [],
                            },
                            actions: [readBinding],
                        });
                        const intent = { approvalId: proof.id, idempotencyKey: 'read-key' };
                        expect((yield* f.run(host.execute(read.name, input, intent))).result._tag).toBe('Failure');
                        expect((yield* f.proofs.get(proof.id))?.usedAt).toBeNull();
                        const [failedReceipts] = yield* f.sql<{
                            count: number | string;
                        }>`SELECT COUNT(*) AS count FROM action_receipt WHERE receipt LIKE ${'%"outcome":"succeeded"%'}`;
                        expect(Number(failedReceipts!.count)).toBe(0);
                        yield* Ref.set(failAudit, false);
                        const accepted = yield* f.run(host.execute(read.name, input, intent));
                        expect(accepted.result._tag).toBe('Success');
                        expect(accepted.replayed).toBe(false);
                        expect((yield* f.proofs.get(proof.id))?.usedAt).toBe(1_000_000);
                        const firstDeadline = (yield* f.proofs.get(proof.id))?.retainUntil;
                        expect(firstDeadline).toBe(Date.parse('1970-07-01T00:16:40Z'));
                        yield* TestClock.adjust('1 second');
                        const repeated = yield* f.run(host.execute(read.name, input, intent));
                        expect(repeated.replayed).toBe(false);
                        expect(repeated.result._tag).toBe('Success');
                        expect((yield* f.proofs.get(proof.id))?.retainUntil).toBe(firstDeadline);
                        const [decisions] = yield* f.sql<{
                            count: number | string;
                        }>`SELECT COUNT(*) AS count FROM approval_decision WHERE proof_id = ${proof.id}`;
                        const [commits] = yield* f.sql<{
                            count: number | string;
                        }>`SELECT COUNT(*) AS count FROM action_commit`;
                        expect([Number(decisions!.count), Number(commits!.count)]).toEqual([2, 0]);
                    }
                )
        );

        it.scoped(
            'serializes admitted use before a competing cancellation without inventing immediate remote reversal',
            /** Deterministic independent fibers observe the committed lifecycle outcome. */ () =>
                Effect.gen(
                    /** The cancellation starts while the proof transaction owns the authority guard and finishes only after its commit. */
                    function* () {
                        // Hold a real SQL transaction, not a synthetic proof map, while the competing fiber attempts cancellation.
                        const f = yield* fixture(dialect);
                        const proof = yield* f.run(issueApproval(binding, input, human, 'race', settings));
                        const admitted = yield* Deferred.make<void>();
                        const release = yield* Deferred.make<void>();
                        const cancelling = yield* Deferred.make<void>();
                        const used = yield* f
                            .run(
                                f.proofs.transaction(
                                    Effect.gen(
                                        /** Hold the proof/identity guard across an intentional handler wait. */
                                        function* () {
                                            // The barrier represents staged local work; no external call is made under this lock.
                                            yield* lookupApproval(proof.id, binding, input, 'race');
                                            yield* Deferred.succeed(admitted, undefined);
                                            yield* Deferred.await(release);
                                            return yield* useApproval(proof.id, binding, input, 'race');
                                        }
                                    )
                                )
                            )
                            .pipe(Effect.fork);
                        yield* Deferred.await(admitted);
                        const cancellation = yield* Deferred.succeed(cancelling, undefined).pipe(
                            Effect.zipRight(f.run(Effect.either(cancelApproval(proof.id)))),
                            Effect.fork
                        );
                        yield* Deferred.await(cancelling);
                        yield* Effect.yieldNow();
                        expect(yield* Fiber.poll(cancellation)).toMatchObject({ _tag: 'None' });
                        yield* Deferred.succeed(release, undefined);
                        yield* Fiber.join(used);
                        expect(yield* Fiber.join(cancellation)).toMatchObject({
                            _tag: 'Left',
                            left: { reason: 'conflict' },
                        });
                        expect((yield* f.proofs.get(proof.id))?.usedAt).toBe(1_000_000);
                        const pending = yield* f.run(issueApproval(binding, input, human, 'cancel-first', settings));
                        yield* f.run(cancelApproval(pending.id));
                        expect(
                            yield* f.run(Effect.either(useApproval(pending.id, binding, input, 'cancel-first')))
                        ).toMatchObject({ _tag: 'Left', left: { reason: 'revoked' } });
                    }
                )
        );
    });
