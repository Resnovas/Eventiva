/**
 * @file tests/runtime/src/identity.spec.ts
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
import { Authorizer, Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Flags, FlagsSafeDefaults } from '@eventiva/contracts/flags';
import {
    IdentityStore,
    type IdentityKind,
    type IdentityRecords,
    type StoredIdentity,
    records,
    RoleId,
    TeamId,
    profileGet,
    profileSet,
    identityFlag,
} from '@eventiva/contracts/identity';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant, StorageFailure } from '@eventiva/contracts/storage';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import {
    authenticateToken,
    identityModule,
    identitySecurity,
    StandardsTokenVerifier,
    type VerifiedTokenClaims,
} from '@eventiva/runtime/identity';
import { canonicalJson, IdentityResolver, InputDigest, InvocationDenied } from '@eventiva/runtime/invocation';
import { makeTestOnlyHarness } from '@eventiva/runtime/testing';
import { expect, it } from '@effect/vitest';
import { Effect, Either, Exit, Layer, Redacted, Ref, Schema, TestClock } from 'effect';

const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const tenant = TenantId.make(id(1));
const person = (n: number, kind: CallerIdentity['kind'] = 'human'): CallerIdentity => ({
    subject: SubjectId.make(id(n)),
    session: SessionId.make(id(n + 100)),
    kind,
    tenant,
});
const admin = person(2);
const viewer = person(3);
const delegated: CallerIdentity = { ...person(4, 'external-agent'), onBehalfOf: viewer.subject };
const service = person(5, 'service');
const adminRole = RoleId.make(id(200));
const viewerRole = RoleId.make(id(201));
const teamId = TeamId.make(id(300));
const permissions = [
    'organization.read',
    'organization.write',
    'membership.read',
    'membership.write',
    'role.read',
    'role.write',
    'team.read',
    'team.write',
    'profile.read',
    'profile.write',
    'audit.read',
].map((p) => `identity.${p}`);
const grants = permissions.map((permission) => ({ permission, resources: ['*'] }));
const flagsOn = Layer.succeed(Flags, {
    evaluate: (flag) => Effect.succeed({ flag: flag.key, value: true, fallback: false, reason: 'TEST' }),
});
const digest = (canonical: string) => createHash('sha256').update(canonical).digest('hex');

/** Deliberately volatile unit fixture, not a production store or durability proof. */
const fixture = Effect.gen(function* () {
    yield* TestClock.setTime(1000);
    const data = new Map<string, { version: number; value: unknown }>();
    const links = new Map<string, SubjectId>();
    const unavailable = () => new StorageFailure({ operation: 'test-unavailable' });
    const store = IdentityStore.of({
        tenant,
        lock: Effect.void,
        get: <K extends IdentityKind>(kind: K, key: string) =>
            Effect.sync(() => data.get(`${kind}:${key}`) as StoredIdentity<K> | undefined),
        put: (kind, value, expectedVersion) =>
            Effect.gen(function* () {
                const key = `${kind}:${value.id}`;
                const previous = data.get(key);
                if (
                    (expectedVersion === null && previous !== undefined) ||
                    (expectedVersion !== null && previous?.version !== expectedVersion)
                )
                    return yield* unavailable();
                data.set(key, { value, version: expectedVersion === null ? 0 : expectedVersion + 1 });
            }),
        teams: (subject) =>
            Effect.succeed(
                [...data.entries()]
                    .filter(([key]) => key.startsWith('team:'))
                    .map(([, row]) => Schema.decodeUnknownSync(records.team)(row.value))
                    .filter((team) => team.members.includes(subject))
            ),
        link: (external, subject) =>
            Effect.sync(() => {
                links.set(JSON.stringify(external), subject);
            }),
        lookup: (external) => Effect.sync(() => links.get(JSON.stringify(external))),
        audit: () => Effect.succeed([]),
    });
    const seed = <K extends IdentityKind>(kind: K, value: IdentityRecords[K]) => store.put(kind, value, null);
    const replace = <K extends IdentityKind>(kind: K, value: IdentityRecords[K]) =>
        Effect.gen(function* () {
            const previous = yield* store.get(kind, value.id);
            yield* store.put(kind, value, previous?.version ?? null);
        });
    yield* seed('role', { id: adminRole, name: 'Administrator', grants });
    yield* seed('role', {
        id: viewerRole,
        name: 'Viewer',
        grants: [{ permission: 'identity.profile.read', resources: [viewer.subject] }],
    });
    for (const caller of [admin, viewer, delegated, service]) {
        yield* seed('principal', { id: caller.subject, kind: caller.kind, active: true });
        yield* seed('membership', {
            id: caller.subject,
            active: true,
            roles: [caller === viewer ? viewerRole : adminRole],
        });
        yield* seed('session', {
            id: caller.session,
            subject: caller.subject,
            active: true,
            expiresAt: 10000,
            delegation:
                caller === delegated
                    ? { human: viewer.subject, session: viewer.session, expiresAt: 9000, grants }
                    : null,
        });
    }
    yield* store.link({ issuer: 'https://issuer.test/realm', subject: 'external-user' }, viewer.subject);
    const harness = yield* makeTestOnlyHarness(admin);
    const context = Layer.mergeAll(Layer.succeed(IdentityStore, store), Layer.succeed(CurrentTenant, { id: tenant }));
    const security = identitySecurity.pipe(Layer.provide(context));
    const platform = Layer.merge(
        harness.TestOnly,
        Layer.succeed(InputDigest, { digest: (canonical) => Effect.sync(() => digest(canonical)) })
    );
    const host = ActionHostLive.pipe(Layer.provide(flagsOn), Layer.provide(security), Layer.provide(platform));
    const run = <A, E, R>(
        effect: Effect.Effect<A, E, R | IdentityStore | CurrentTenant | IdentityResolver | Authorizer>
    ) => effect.pipe(Effect.provide(Layer.merge(security, context)));
    const approve = (name: string, input: unknown, caller = admin): Effect.Effect<void> =>
        Ref.update(harness.approvals, (entries) =>
            new Map(entries).set('approval', {
                principal: caller.subject,
                tenant,
                action: name,
                version: 1,
                inputHash: digest(Either.getOrThrow(canonicalJson(input))),
                limits: {},
                approver: { ...admin, subject: SubjectId.make(id(6)) },
                issuedAt: 1000,
                expiresAt: 8000,
                stepUp: true,
            })
        );
    return { store, data, replace, seed, harness, context, security, host, run, approve };
});

it.scoped('identity actions share authorization, explicit approval, idempotency and one receipt per call', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        yield* Effect.gen(function* () {
            const host = yield* ActionHost;
            yield* host.register(yield* identityModule.pipe(Effect.provide(f.context)));
            let calls = 0;
            const execute = (name: string, input: unknown, approved = false, caller = admin) =>
                host
                    .execute(name, input, {
                        idempotencyKey: `call-${calls++}`,
                        ...(approved ? { approvalId: 'approval' } : {}),
                    })
                    .pipe(Effect.provideService(Caller, caller));
            expect(Exit.isSuccess((yield* execute('identity.organization.get', {})).result)).toBe(true);
            const org = { value: { id: 'organization', name: 'Organization A' }, expectedVersion: null };
            expect((yield* execute('identity.organization.set', org)).receipt.outcome).toBe('denied');
            expect(yield* f.store.get('organization', 'organization')).toBeUndefined();
            yield* f.approve('identity.organization.set', org);
            expect(Exit.isSuccess((yield* execute('identity.organization.set', org, true)).result)).toBe(true);
            expect((yield* f.store.get('organization', 'organization'))?.value.name).toBe('Organization A');
            const writes = [
                ['identity.role.set', { value: { id: id(202), name: 'Limited', grants: [] }, expectedVersion: null }],
                [
                    'identity.team.set',
                    {
                        value: { id: teamId, name: 'Crew', members: [viewer.subject], roles: [viewerRole] },
                        expectedVersion: null,
                    },
                ],
                [
                    'identity.membership.set',
                    { value: { id: viewer.subject, active: true, roles: [viewerRole] }, expectedVersion: 0 },
                ],
            ] as const;
            for (const [name, input] of writes) {
                yield* f.approve(name, input);
                expect(Exit.isSuccess((yield* execute(name, input, true)).result)).toBe(true);
            }
            for (const [name, input] of [
                ['identity.organization.get', {}],
                ['identity.role.get', { id: id(202) }],
                ['identity.team.get', { id: teamId }],
                ['identity.membership.get', { id: viewer.subject }],
            ] as const)
                expect(Exit.isSuccess((yield* execute(name, input)).result)).toBe(true);
            const profile = { value: { id: admin.subject, displayName: 'Private Name' }, expectedVersion: null };
            expect(Exit.isSuccess((yield* execute('identity.profile.set', profile)).result)).toBe(true);
            expect((yield* execute('identity.profile.get', { subject: admin.subject })).result).toMatchObject({
                value: { value: profile.value, version: 0 },
            });
            expect((yield* execute('identity.profile.set', profile)).receipt.outcome).toBe('failed');
            expect(
                (yield* execute('identity.profile.get', { subject: admin.subject }, false, viewer)).receipt.outcome
            ).toBe('denied');
            expect((yield* execute('identity.audit.list', { limit: 10 }, false, viewer)).receipt.outcome).toBe(
                'denied'
            );
            expect(Exit.isSuccess((yield* execute('identity.audit.list', { limit: 10 })).result)).toBe(true);
            const missing = { value: { id: id(90), active: true, roles: [] }, expectedVersion: null };
            yield* f.approve('identity.membership.set', missing);
            expect((yield* execute('identity.membership.set', missing, true)).result).toMatchObject({
                cause: { error: { error: { reason: 'missing-reference' } } },
            });
            // Even a fully authorized agent cannot write before a bound human confirmation.
            yield* f.replace('membership', { id: viewer.subject, active: true, roles: [adminRole] });
            const delegatedProfile = {
                value: { id: viewer.subject, displayName: 'Confirmed Profile' },
                expectedVersion: null,
            };
            expect((yield* execute('identity.profile.set', delegatedProfile, false, delegated)).receipt.outcome).toBe(
                'denied'
            );
            expect(yield* f.store.get('profile', viewer.subject)).toBeUndefined();
            yield* f.approve('identity.profile.set', delegatedProfile, delegated);
            expect(
                Exit.isSuccess((yield* execute('identity.profile.set', delegatedProfile, true, delegated)).result)
            ).toBe(true);
            const receipts = (yield* Ref.get(f.harness.state)).receipts;
            expect(receipts).toHaveLength(calls);
            expect(JSON.stringify(receipts)).not.toContain('Private Name');
        }).pipe(Effect.provide(f.host));
    })
);

it.scoped('identity is off by default and rejects unrecognized resource policies', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        expect(identityFlag.safeDefault).toBe(false);
        yield* Effect.gen(function* () {
            const host = yield* ActionHost;
            yield* host.register(yield* identityModule.pipe(Effect.provide(f.context)));
            expect(
                (yield* host
                    .execute('identity.profile.get', { subject: admin.subject })
                    .pipe(Effect.provideService(Caller, admin))).receipt.outcome
            ).toBe('denied');
        }).pipe(
            Effect.provide(
                ActionHostLive.pipe(
                    Layer.provide(FlagsSafeDefaults),
                    Layer.provide(f.security),
                    Layer.provide(f.harness.TestOnly)
                )
            )
        );
        const auth = yield* Authorizer.pipe(Effect.provide(f.security));
        expect(
            yield* Effect.either(auth.check(admin, { ...profileGet, name: 'foreign.read' }, { subject: admin.subject }))
        ).toMatchObject({
            left: { reason: 'resource-policy-required' },
        });
    })
);

it.scoped('agents intersect own, human and delegation resource grants; live revocation and expiry win', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        const auth = yield* Authorizer.pipe(Effect.provide(f.security));
        expect(yield* Effect.either(auth.check(delegated, profileGet, { subject: viewer.subject }))).toEqual(
            Either.right(undefined)
        );
        expect(
            yield* Effect.either(
                auth.check(delegated, profileSet, {
                    value: { id: viewer.subject, displayName: 'X' },
                    expectedVersion: null,
                })
            )
        ).toMatchObject({ _tag: 'Left' });
        expect(yield* Effect.either(auth.check(delegated, profileGet, { subject: admin.subject }))).toMatchObject({
            _tag: 'Left',
        });
        const session = (yield* f.store.get('session', delegated.session))!.value;
        yield* f.replace('session', { ...session, delegation: { ...session.delegation!, grants: [] } });
        expect(yield* Effect.either(auth.canInvoke(delegated, profileGet))).toMatchObject({ _tag: 'Left' });
        yield* f.replace('session', session);
        yield* f.replace('role', { id: viewerRole, name: 'Revoked', grants: [] });
        expect(yield* Effect.either(auth.canInvoke(delegated, profileGet))).toMatchObject({ _tag: 'Left' });
        yield* f.replace('membership', { id: viewer.subject, active: false, roles: [viewerRole] });
        expect(yield* Effect.either(auth.canInvoke(delegated, profileGet))).toMatchObject({ _tag: 'Left' });
    })
);

it.scoped('tenant, kind, subject, session, delegation and human-session forgeries fail closed', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        const resolver = yield* IdentityResolver.pipe(Effect.provide(f.security));
        for (const forged of [
            { ...viewer, tenant: TenantId.make(id(99)) },
            { ...viewer, tenant: undefined },
            { ...viewer, kind: 'service' as const },
            { ...viewer, session: admin.session },
            { ...viewer, session: SessionId.make(id(99)) },
            { ...viewer, onBehalfOf: admin.subject },
            { ...delegated, onBehalfOf: undefined },
            { ...delegated, onBehalfOf: admin.subject },
        ])
            expect(yield* Effect.either(resolver.resolve(forged))).toMatchObject({
                left: { _tag: 'InvocationDenied' },
            });
        for (const effect of [Layer.build(identitySecurity).pipe(Effect.asVoid), identityModule.pipe(Effect.asVoid)])
            expect(
                yield* Effect.either(
                    effect.pipe(
                        Effect.provideService(IdentityStore, f.store),
                        Effect.provideService(CurrentTenant, { id: TenantId.make(id(99)) })
                    )
                )
            ).toMatchObject({ left: { _tag: 'InvocationDenied' } });
        expect(yield* resolver.resolve(service)).toEqual(service);
        const session = (yield* f.store.get('session', delegated.session))!.value;
        for (const change of [
            { ...session, active: false },
            { ...session, expiresAt: 1000 },
            { ...session, delegation: null },
            { ...session, delegation: { ...session.delegation!, human: delegated.subject } },
            { ...session, delegation: { ...session.delegation!, expiresAt: 1000 } },
            { ...session, delegation: { ...session.delegation!, expiresAt: 10001 } },
            { ...session, delegation: { ...session.delegation!, session: admin.session } },
        ]) {
            yield* f.replace('session', change);
            expect(yield* Effect.either(resolver.resolve(delegated))).toMatchObject({ _tag: 'Left' });
        }
        yield* f.replace('session', session);
        const human = (yield* f.store.get('session', viewer.session))!.value;
        yield* f.replace('session', { ...human, active: false });
        expect(yield* Effect.either(resolver.resolve(delegated))).toMatchObject({ _tag: 'Left' });
        yield* f.replace('principal', { id: admin.subject, kind: 'human', active: false });
        expect(yield* Effect.either(resolver.resolve(admin))).toMatchObject({ _tag: 'Left' });
        expect(
            yield* Effect.either(
                IdentityResolver.pipe(
                    Effect.flatMap((r) => r.resolve(viewer)),
                    Effect.provide(identitySecurity),
                    Effect.provideService(IdentityStore, {
                        ...f.store,
                        lock: Effect.fail(new StorageFailure({ operation: 'offline' })),
                    }),
                    Effect.provideService(CurrentTenant, { id: tenant })
                )
            )
        ).toMatchObject({ _tag: 'Left' });
    })
);

it.scoped('teams grant only to active members and revocation takes effect without a new session', () =>
    Effect.gen(function* () {
        const f = yield* fixture;
        const auth = yield* Authorizer.pipe(Effect.provide(f.security));
        yield* f.seed('team', { id: teamId, name: 'Writers', members: [viewer.subject], roles: [adminRole] });
        expect(yield* Effect.either(auth.canInvoke(viewer, profileSet))).toEqual(Either.right(undefined));
        yield* f.replace('team', { id: teamId, name: 'Writers', members: [], roles: [adminRole] });
        expect(yield* Effect.either(auth.canInvoke(viewer, profileSet))).toMatchObject({ _tag: 'Left' });
        yield* f.replace('membership', { id: viewer.subject, active: false, roles: [adminRole] });
        expect(yield* Effect.either(auth.canInvoke(viewer, profileSet))).toMatchObject({ _tag: 'Left' });
    })
);

it.scoped(
    'standards verifier seam rejects issuer/audience/scope/time/mapping failures without trusting claims as roles',
    () =>
        Effect.gen(function* () {
            const f = yield* fixture;
            const claims: typeof VerifiedTokenClaims.Type = {
                issuer: 'https://issuer.test/realm',
                subject: 'external-user',
                audiences: ['eventiva-api'],
                scopes: ['eventiva.invoke'],
                session: viewer.session,
                expiresAt: 10000,
                notBefore: 500,
            };
            const policy = { issuer: claims.issuer, audience: 'eventiva-api', scopes: ['eventiva.invoke'] };
            const authenticate = <Claims extends typeof VerifiedTokenClaims.Encoded>(
                value: Claims,
                expected = policy
            ) =>
                f
                    .run(authenticateToken(Redacted.make('TEST-NOT-A-TOKEN'), expected))
                    .pipe(Effect.provideService(StandardsTokenVerifier, { verify: () => Effect.succeed(value) }));
            expect(yield* authenticate(claims)).toEqual(viewer);
            expect(yield* authenticate({ ...claims, notBefore: -1 })).toEqual(viewer);
            expect(
                yield* Effect.either(
                    authenticateToken(Redacted.make('TEST-NOT-A-TOKEN'), policy).pipe(
                        Effect.provide(f.security),
                        Effect.provideService(IdentityStore, { ...f.store, tenant: TenantId.make(id(99)) }),
                        Effect.provideService(CurrentTenant, { id: tenant }),
                        Effect.provideService(StandardsTokenVerifier, { verify: () => Effect.succeed(claims) })
                    )
                )
            ).toMatchObject({ left: { _tag: 'InvocationDenied' } });
            for (const invalid of [
                { ...claims, issuer: '' },
                { ...claims, issuer: 'https://attacker.test' },
                { ...claims, issuer: `${claims.issuer}/` },
                { ...claims, audiences: ['other-api'] },
                { ...claims, audiences: ['', 'eventiva-api'] },
                { ...claims, scopes: [] },
                { ...claims, scopes: ['', 'eventiva.invoke'] },
                { ...claims, expiresAt: Number.NaN },
                { ...claims, notBefore: -62135596800001 },
                { ...claims, expiresAt: 1000 },
                { ...claims, expiresAt: 9999 },
                { ...claims, notBefore: 1001 },
                { ...claims, notBefore: 10000, expiresAt: 10000 },
                { ...claims, subject: '' },
                { ...claims, subject: 'unlinked' },
                { ...claims, session: admin.session },
                { ...claims, session: id(888) },
                { ...claims, session: 'bad-session' },
            ])
                expect(yield* Effect.either(authenticate(invalid))).toMatchObject({
                    left: { _tag: 'InvocationDenied' },
                });
            for (const badPolicy of [
                { ...policy, issuer: '' },
                { ...policy, audience: '' },
                { ...policy, scopes: [] },
                { ...policy, scopes: [''] },
            ])
                expect(yield* Effect.either(authenticate(claims, badPolicy))).toMatchObject({ _tag: 'Left' });
            expect(
                yield* Effect.either(
                    f.run(authenticateToken(Redacted.make('forged'), policy)).pipe(
                        Effect.provideService(StandardsTokenVerifier, {
                            verify: () =>
                                Effect.fail(new InvocationDenied({ action: '<token>', reason: 'bad-signature' })),
                        })
                    )
                )
            ).toMatchObject({ _tag: 'Left' });
            const auth = yield* Authorizer.pipe(Effect.provide(f.security));
            expect(
                yield* Effect.either(auth.canInvoke(yield* authenticate({ ...claims, roles: ['admin'] }), profileSet))
            ).toMatchObject({ _tag: 'Left' });
        })
);
