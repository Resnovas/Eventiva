/**
 * @file tests/runtime/src/approval.spec.ts
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

import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { ApprovalBinding, ApprovalSettings, ApprovalStore } from '@eventiva/contracts/approval';
import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { IdentityStore, profileSet, RoleId } from '@eventiva/contracts/identity';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { approvalStore } from '@eventiva/integrations.sql/approval';
import { identityStore } from '@eventiva/integrations.sql/identity';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { memory } from '@eventiva/integrations.sql/sqlite';
import { implement } from '@eventiva/runtime/action';
import {
    approvalRetentionEnd,
    cancelApproval,
    issueApproval,
    lookupApproval,
    useApproval,
} from '@eventiva/runtime/approval';
import { identitySecurity } from '@eventiva/runtime/identity';
import { ExecutionPolicy, InputDigest } from '@eventiva/runtime/invocation';
import { describe, expect, it } from '@effect/vitest';
import { Context, Effect, Layer, Ref, Schema, TestClock } from 'effect';

describe('trusted approval policy contract', /** Check public policy and calendar behavior independently of SQL persistence. */ () => {
    it('requires explicit session policy and enforces both lifetime boundaries', /** Five minutes is a minimum window, not an invented session cap. */ () => {
        const decode = Schema.decodeUnknownEither(ApprovalSettings);
        // Asymmetric session/lifetime values distinguish real policy validation from a fixed one-hour assumption.
        expect(decode({ sessionLifetimeMs: 7_200_000, lifetimeMs: 300_000 })).toMatchObject({
            _tag: 'Right',
            right: { retention: 'six-months' },
        });
        expect(decode({ sessionLifetimeMs: 7_200_000, lifetimeMs: 7_200_000, retention: 90 })._tag).toBe('Right');
        expect(decode({ sessionLifetimeMs: 7_200_000, lifetimeMs: 299_999 })._tag).toBe('Left');
        expect(decode({ sessionLifetimeMs: 7_200_000, lifetimeMs: 7_200_001 })._tag).toBe('Left');
        expect(decode({ lifetimeMs: 300_000 })._tag).toBe('Left');
        expect(decode({ sessionLifetimeMs: 7_200_000, lifetimeMs: 300_000, retention: 89 })._tag).toBe('Left');
        expect(decode({ sessionLifetimeMs: 7_200_000, lifetimeMs: 300_000, retention: 731 })._tag).toBe('Left');
        expect(decode({ sessionLifetimeMs: 7_200_000, lifetimeMs: 300_000, retention: 'two-years' })._tag).toBe(
            'Right'
        );
    });

    it('retains six calendar months with clamped leap-day boundaries', /** Expected dates are calendar facts, not derived from the implementation. */ () => {
        // Month-end and leap-day inputs distinguish calendar retention from a superficially similar fixed-day duration.
        expect(approvalRetentionEnd(Date.parse('2027-08-31T12:34:56Z'), 'six-months')).toBe(
            Date.parse('2028-02-29T12:34:56Z')
        );
        expect(approvalRetentionEnd(Date.parse('2026-08-31T12:34:56Z'), 'six-months')).toBe(
            Date.parse('2027-02-28T12:34:56Z')
        );
        expect(approvalRetentionEnd(Date.parse('2028-02-29T12:34:56Z'), 'two-years')).toBe(
            Date.parse('2030-02-28T12:34:56Z')
        );
        expect(approvalRetentionEnd(Date.parse('2027-01-01T00:00:00Z'), 90)).toBe(Date.parse('2027-04-01T00:00:00Z'));
    });

    it('requires a nonblank bounded write identity as well as canonical input digest', /** Opaque proof references do not make the key optional. */ () => {
        const binding = {
            tenant: '019b0000-0000-7000-8000-000000000001',
            principal: '019b0000-0000-7000-8000-000000000002',
            action: 'fixture.write',
            version: 1,
            inputHash: 'digest',
            writeKey: 'job-17',
        };
        const decode = Schema.decodeUnknownEither(ApprovalBinding);
        // Invalid wire types must fail rather than be coerced into new approval identities.
        expect(decode(binding)._tag).toBe('Right');
        expect(decode({ ...binding, writeKey: ' ' })._tag).toBe('Left');
        expect(decode({ ...binding, writeKey: 'x'.repeat(513) })._tag).toBe('Left');
        expect(decode({ ...binding, writeKey: 17 })._tag).toBe('Left');
        expect(decode({ ...binding, version: 0 })._tag).toBe('Left');
    });

    it.scoped(
        'enforces lifecycle and live policy against real profile target authority and SQLite evidence',
        /** Exercise runtime policy branches without substituting a proof map or permissive target authorizer. */ () =>
            Effect.gen(
                /** Keep canonical preparation and policy freshness visible through the public runtime operations. */
                function* () {
                    // Use the existing profile action grammar so target authorization itself is real, not an invented provider contract.
                    yield* TestClock.setTime(1_000_000);
                    const human = Schema.decodeUnknownSync(CallerIdentity)({
                        subject: '019b0000-0000-7000-8000-000000000001',
                        session: '019b0000-0000-7000-8000-000000000002',
                        tenant: '019b0000-0000-7000-8000-000000000003',
                        kind: 'human',
                    });
                    const routed = yield* Layer.build(
                        Layer.merge(memory(), Layer.succeed(CurrentTenant, { id: human.tenant! }))
                    );
                    yield* migrate(
                        'sqlite',
                        yield* load(fileURLToPath(new URL('../../../storage/migrations/sqlite', import.meta.url)))
                    ).pipe(Effect.provide(routed));
                    const stores = yield* Layer.build(
                        Layer.merge(approvalStore, identityStore).pipe(Layer.provideMerge(Layer.succeedContext(routed)))
                    );
                    const identities = Context.get(stores, IdentityStore);
                    const role = RoleId.make('019b0000-0000-7000-8000-000000000004');
                    yield* identities.put('principal', { id: human.subject, kind: 'human', active: true }, null);
                    yield* identities.put(
                        'session',
                        {
                            id: human.session,
                            subject: human.subject,
                            active: true,
                            expiresAt: 4_000_000,
                            delegation: null,
                        },
                        null
                    );
                    yield* identities.put('membership', { id: human.subject, active: true, roles: [role] }, null);
                    yield* identities.put(
                        'role',
                        {
                            id: role,
                            name: 'Profile owner',
                            grants: [{ permission: profileSet.permission, resources: [human.subject] }],
                        },
                        null
                    );
                    const security = yield* Layer.build(
                        identitySecurity.pipe(Layer.provide(Layer.succeedContext(stores)))
                    );
                    const bound = yield* Ref.make(1);
                    const stepUp = yield* Ref.make(false);
                    const services = Context.merge(stores, security).pipe(
                        Context.add(Caller, human),
                        Context.add(InputDigest, {
                            /** Bind canonical encoded input using the actual platform digest primitive. */ digest: (
                                text
                            ) =>
                                Effect.sync(
                                    /** Defer hashing until the operation executes. */ () =>
                                        createHash('sha256').update(text).digest('hex')
                                ),
                        }),
                        Context.add(ExecutionPolicy, {
                            /** Mutable fixture policy permits independent increases in live required limits. */ inspect:
                                () =>
                                    Effect.gen(
                                        /** Read each current server-side requirement instead of retaining initial consent policy. */ function* () {
                                            return {
                                                approval: 'confirm' as const,
                                                routinePreauthorized: false,
                                                stepUp: yield* Ref.get(stepUp),
                                                bounds: { records: yield* Ref.get(bound) },
                                                dependenciesReady: true,
                                                capacityAvailable: true,
                                            };
                                        }
                                    ),
                        })
                    );
                    /** Provide the live routed services while preserving transaction-local SQL fiber state. */
                    const run = <A, E, R>(operation: Effect.Effect<A, E, R>) => Effect.provide(operation, services);
                    const action = implement(
                        profileSet,
                        /** Preparation must never invoke this fixture handler to create consent. */ () =>
                            Effect.dieMessage('Consent preparation executed the handler.')
                    );
                    const input = { value: { id: human.subject, displayName: 'Approved name' }, expectedVersion: null };
                    const settings = { sessionLifetimeMs: 7_200_000, lifetimeMs: 600_000 };
                    const first = yield* run(issueApproval(action, input, human, 'first-key', settings));
                    expect((yield* run(lookupApproval(first.id, action, input, 'first-key'))).limits).toEqual({
                        records: 1,
                    });
                    // Increasing current limits must deny unchanged input; matching its hash alone cannot authorize a larger effect.
                    yield* Ref.set(bound, 2);
                    expect(
                        yield* run(Effect.either(lookupApproval(first.id, action, input, 'first-key')))
                    ).toMatchObject({ _tag: 'Left', left: { reason: 'binding' } });
                    yield* Ref.set(bound, 1);
                    yield* Ref.set(stepUp, true);
                    expect(
                        yield* run(Effect.either(issueApproval(action, input, human, 'stronger', settings)))
                    ).toMatchObject({ _tag: 'Left', left: { reason: 'step-up' } });
                    yield* Ref.set(stepUp, false);
                    expect((yield* run(cancelApproval(first.id))).revokedAt).toBe(1_000_000);
                    expect((yield* run(cancelApproval(first.id))).revision).toBe(1);
                    expect(
                        yield* run(Effect.either(lookupApproval(first.id, action, input, 'first-key')))
                    ).toMatchObject({ _tag: 'Left', left: { reason: 'revoked' } });
                    const used = yield* run(issueApproval(action, input, human, 'used-key', settings));
                    expect((yield* run(useApproval(used.id, action, input, 'used-key'))).usedAt).toBe(1_000_000);
                    expect((yield* run(useApproval(used.id, action, input, 'used-key'))).revision).toBe(1);
                    expect(yield* run(Effect.either(cancelApproval(used.id)))).toMatchObject({
                        _tag: 'Left',
                        left: { reason: 'conflict' },
                    });
                    // Consent ownership and the executing agent are different audit facts; neither may impersonate the other.
                    const agent = Schema.decodeUnknownSync(CallerIdentity)({
                        ...human,
                        subject: '019b0000-0000-7000-8000-000000000005',
                        session: '019b0000-0000-7000-8000-000000000006',
                        kind: 'external-agent',
                        onBehalfOf: human.subject,
                    });
                    yield* identities.put('principal', { id: agent.subject, kind: agent.kind, active: true }, null);
                    yield* identities.put('membership', { id: agent.subject, active: true, roles: [role] }, null);
                    yield* identities.put(
                        'session',
                        {
                            id: agent.session,
                            subject: agent.subject,
                            active: true,
                            expiresAt: 4_000_000,
                            delegation: {
                                human: human.subject,
                                session: human.session,
                                expiresAt: 3_000_000,
                                grants: [{ permission: profileSet.permission, resources: [human.subject] }],
                            },
                        },
                        null
                    );
                    const delegated = yield* run(issueApproval(action, input, agent, 'agent-key', settings));
                    yield* run(
                        useApproval(delegated.id, action, input, 'agent-key').pipe(Effect.provideService(Caller, agent))
                    );
                    const sql = Context.get(routed, SqlClient.SqlClient);
                    const [decision] = yield* sql<{
                        body: string;
                    }>`SELECT body FROM approval_decision WHERE proof_id = ${delegated.id} AND revision = 1`;
                    expect(JSON.parse(decision!.body)).toMatchObject({
                        kind: 'used',
                        actor: { subject: agent.subject, session: agent.session, kind: 'external-agent' },
                    });
                    expect((yield* Context.get(stores, ApprovalStore).get(delegated.id))?.approver.subject).toBe(
                        human.subject
                    );
                    yield* identities.put('role', { id: role, name: 'Revoked profile owner', grants: [] }, 0);
                    expect(yield* run(Effect.either(lookupApproval(used.id, action, input, 'used-key')))).toMatchObject(
                        { _tag: 'Left', left: { reason: 'denied' } }
                    );
                    expect((yield* Context.get(stores, ApprovalStore).get(used.id))?.usedAt).toBe(1_000_000);
                    yield* TestClock.setTime(used.expiresAt);
                    expect(yield* run(Effect.either(lookupApproval(used.id, action, input, 'used-key')))).toMatchObject(
                        { _tag: 'Left', left: { reason: 'expired' } }
                    );
                    expect(yield* run(Effect.either(cancelApproval(used.id)))).toMatchObject({ _tag: 'Left' });
                }
            )
    );
});
