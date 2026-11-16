/**
 * @file packages/runtime/src/identity.ts
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

import type { ActionSpec } from '@eventiva/contracts/action';
import { Authorizer, CallerIdentity } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import {
    IdentityStore,
    IdentityFailure,
    type IdentityKind,
    type IdentityRecords,
    Grant,
    identityFlag,
    organizationGet,
    organizationSet,
    membershipSet,
    roleSet,
    teamSet,
    profileGet,
    profileSet,
    auditList,
    membershipGet,
    roleGet,
    teamGet,
} from '@eventiva/contracts/identity';
import { SessionId, type SubjectId } from '@eventiva/contracts/ids';
import { CurrentTenant, EpochMillis } from '@eventiva/contracts/storage';
import { Clock, Context, Effect, Layer, Redacted, Schema } from 'effect';
import { implement } from './action.ts';
import type { ServerModule } from './host.ts';
import { ExecutionPolicy, IdentityResolver, InvocationDenied } from './invocation.ts';

const agent = (kind: CallerIdentity['kind']) => kind === 'first-party-agent' || kind === 'external-agent';
const denied = () => new InvocationDenied({ action: '<identity>', reason: 'identity-denied' });
const permits = (grants: ReadonlyArray<typeof Grant.Type>, permission: string, resource?: string) =>
    grants.some(
        (grant) =>
            grant.permission === permission &&
            grant.resources.length > 0 &&
            (resource === undefined || grant.resources.includes('*') || grant.resources.includes(resource))
    );

/** Only this module's resource grammar is known here. Other modules need their own explicit target policy. */
const target = <Input>(spec: ActionSpec, input: Input): string | undefined => {
    if (spec.name === organizationGet.name || spec.name === organizationSet.name) return 'organization';
    if (spec.name === auditList.name) return 'audit';
    if (spec.name === profileGet.name && Schema.is(profileGet.input)(input)) return input.subject;
    if (spec.name === profileSet.name && Schema.is(profileSet.input)(input)) return input.value.id;
    if (spec.name === membershipSet.name && Schema.is(membershipSet.input)(input)) return input.value.id;
    if (spec.name === roleSet.name && Schema.is(roleSet.input)(input)) return input.value.id;
    if (spec.name === teamSet.name && Schema.is(teamSet.input)(input)) return input.value.id;
    if (spec.name === membershipGet.name && Schema.is(membershipGet.input)(input)) return input.id;
    if (spec.name === roleGet.name && Schema.is(roleGet.input)(input)) return input.id;
    if (spec.name === teamGet.name && Schema.is(teamGet.input)(input)) return input.id;
    return undefined;
};

/** Build inside a routed tenant. No presented principal, role, membership or delegation claim is authoritative. */
export const identitySecurity = Layer.unwrapEffect(
    Effect.gen(function* () {
        const store = yield* IdentityStore;
        const tenant = yield* CurrentTenant;
        if (store.tenant !== tenant.id) return yield* denied();
        const active = (subject: SubjectId) =>
            Effect.gen(function* () {
                const principal = yield* store.get('principal', subject);
                const membership = yield* store.get('membership', subject);
                if (!principal?.value.active || !membership?.value.active) return yield* denied();
                return { principal: principal.value, membership: membership.value };
            });
        const refresh = (presented: CallerIdentity) =>
            Effect.gen(function* () {
                const caller = yield* Schema.decodeUnknown(CallerIdentity)(presented, {
                    onExcessProperty: 'error',
                }).pipe(Effect.mapError(denied));
                if (caller.tenant !== tenant.id) return yield* denied();
                yield* store.lock;
                const now = yield* Clock.currentTimeMillis;
                const session = (yield* store.get('session', caller.session))?.value;
                const { principal } = yield* active(caller.subject);
                if (
                    !session?.active ||
                    session.subject !== caller.subject ||
                    session.expiresAt <= now ||
                    principal.kind !== caller.kind
                )
                    return yield* denied();
                const delegation = session.delegation;
                if (agent(caller.kind)) {
                    if (
                        delegation === null ||
                        delegation.human === caller.subject ||
                        delegation.human !== caller.onBehalfOf ||
                        delegation.expiresAt <= now ||
                        delegation.expiresAt > session.expiresAt
                    )
                        return yield* denied();
                    const human = yield* active(delegation.human);
                    const humanSession = (yield* store.get('session', delegation.session))?.value;
                    if (
                        human.principal.kind !== 'human' ||
                        !humanSession?.active ||
                        humanSession.subject !== delegation.human ||
                        humanSession.expiresAt <= now ||
                        humanSession.delegation !== null
                    )
                        return yield* denied();
                } else if (delegation !== null || caller.onBehalfOf !== undefined) return yield* denied();
                return { caller, delegation };
            }).pipe(Effect.catchTag('StorageFailure', () => Effect.fail(denied())));
        const grantsFor = (subject: SubjectId) =>
            Effect.gen(function* () {
                const { membership } = yield* active(subject);
                const teams = yield* store.teams(subject);
                const roles = [...new Set([...membership.roles, ...teams.flatMap((team) => team.roles)])];
                const entries = yield* Effect.forEach(roles, (id) => store.get('role', id));
                return entries.flatMap((entry) => entry?.value.grants ?? []);
            });
        const authorize = (caller: CallerIdentity, spec: ActionSpec, resource?: string) =>
            Effect.gen(function* () {
                const live = yield* refresh(caller);
                const own = yield* grantsFor(caller.subject);
                if (!permits(own, spec.permission, resource)) return yield* denied();
                if (live.delegation !== null) {
                    const human = yield* grantsFor(live.delegation.human);
                    if (
                        !permits(human, spec.permission, resource) ||
                        !permits(live.delegation.grants, spec.permission, resource)
                    )
                        return yield* denied();
                }
            }).pipe(Effect.mapError(() => new Forbidden({ action: spec.name, reason: 'identity-policy-denied' })));
        return Layer.mergeAll(
            Layer.succeed(IdentityResolver, {
                resolve: (caller) => refresh(caller).pipe(Effect.map((live) => live.caller)),
            }),
            Layer.succeed(Authorizer, {
                canInvoke: (caller, spec) => authorize(caller, spec),
                check: (caller, spec, input) => {
                    const resource = target(spec, input);
                    return resource === undefined
                        ? Effect.fail(new Forbidden({ action: spec.name, reason: 'resource-policy-required' }))
                        : authorize(caller, spec, resource);
                },
            }),
            Layer.succeed(ExecutionPolicy, {
                inspect: (_caller, spec) =>
                    Effect.succeed({
                        approval: spec.approval,
                        routinePreauthorized: false,
                        stepUp: spec.risk === 'permission',
                        bounds: {},
                        dependenciesReady: true,
                        capacityAvailable: true,
                    }),
            })
        );
    })
);

/** Backend verification boundary. MUST validate signature, algorithm, key provenance and token type before returning.
 * No production implementation is supplied. Decoding a JWT is NOT verification.
 */
export class StandardsTokenVerifier extends Context.Tag('@eventiva/runtime/StandardsTokenVerifier')<
    StandardsTokenVerifier,
    {
        readonly verify: (
            token: Redacted.Redacted<string>
        ) => Effect.Effect<typeof VerifiedTokenClaims.Encoded, InvocationDenied>;
    }
>() {}
export const VerifiedTokenClaims = Schema.Struct({
    issuer: Schema.NonEmptyString,
    subject: Schema.NonEmptyString,
    audiences: Schema.Array(Schema.NonEmptyString),
    scopes: Schema.Array(Schema.NonEmptyString),
    session: SessionId,
    expiresAt: EpochMillis,
    notBefore: EpochMillis,
});

/** Policy values come from trusted server configuration, never from a token or tenant header. No routing authority. */
export const authenticateToken = (
    token: Redacted.Redacted<string>,
    expected: {
        readonly issuer: string;
        readonly audience: string;
        readonly scopes: ReadonlyArray<string>;
    }
) =>
    Effect.gen(function* () {
        const verifier = yield* StandardsTokenVerifier;
        const store = yield* IdentityStore;
        const tenant = yield* CurrentTenant;
        const resolver = yield* IdentityResolver;
        if (store.tenant !== tenant.id) return yield* denied();
        const claims = yield* verifier
            .verify(token)
            .pipe(Effect.flatMap(Schema.decode(VerifiedTokenClaims)), Effect.mapError(denied));
        const now = yield* Clock.currentTimeMillis;
        if (
            !expected.issuer ||
            !expected.audience ||
            expected.scopes.length === 0 ||
            claims.issuer !== expected.issuer ||
            !claims.audiences.includes(expected.audience) ||
            expected.scopes.some((scope) => !scope || !claims.scopes.includes(scope)) ||
            claims.expiresAt <= now ||
            claims.notBefore > now ||
            claims.notBefore >= claims.expiresAt
        )
            return yield* denied();
        const subject = yield* store.lookup({ issuer: claims.issuer, subject: claims.subject });
        if (subject === undefined) return yield* denied();
        const principal = (yield* store.get('principal', subject))?.value;
        const session = (yield* store.get('session', claims.session))?.value;
        if (principal === undefined || session === undefined || session.expiresAt > claims.expiresAt)
            return yield* denied();
        return yield* resolver.resolve({
            subject,
            session: claims.session,
            tenant: tenant.id,
            kind: principal.kind,
            ...(session.delegation === null ? {} : { onBehalfOf: session.delegation.human }),
        });
    }).pipe(Effect.catchTag('StorageFailure', () => Effect.fail(denied())));

/** Registered once per routed tenant host. Store and durable Integrity must capture the same SQL client. */
export const identityModule = Effect.gen(function* () {
    const store = yield* IdentityStore;
    const tenant = yield* CurrentTenant;
    if (store.tenant !== tenant.id) return yield* denied();
    const safe = <A, E>(effect: Effect.Effect<A, E>) =>
        effect.pipe(Effect.mapError(() => new IdentityFailure({ reason: 'unavailable' })));
    const requireRecord = (kind: IdentityKind, id: string) =>
        Effect.gen(function* () {
            if ((yield* safe(store.get(kind, id))) === undefined)
                return yield* new IdentityFailure({ reason: 'missing-reference' });
        });
    const put = <K extends IdentityKind>(kind: K, value: IdentityRecords[K], version: number | null) =>
        safe(store.put(kind, value, version)).pipe(Effect.as(null));
    return {
        manifest: {
            format: 1,
            id: 'identity',
            version: '1.0.0',
            description: 'Tenant identity foundation.',
            flag: identityFlag.key,
            flags: [identityFlag],
            actions: [
                organizationGet,
                organizationSet,
                membershipSet,
                roleSet,
                teamSet,
                profileGet,
                profileSet,
                auditList,
                membershipGet,
                roleGet,
                teamGet,
            ].map((spec) => spec.name),
        },
        actions: [
            implement(organizationGet, () =>
                safe(store.get('organization', 'organization')).pipe(Effect.map((entry) => entry ?? null))
            ),
            implement(organizationSet, ({ value, expectedVersion }) => put('organization', value, expectedVersion)),
            implement(membershipSet, ({ value, expectedVersion }) =>
                Effect.gen(function* () {
                    yield* requireRecord('principal', value.id);
                    for (const role of value.roles) yield* requireRecord('role', role);
                    return yield* put('membership', value, expectedVersion);
                })
            ),
            implement(roleSet, ({ value, expectedVersion }) => put('role', value, expectedVersion)),
            implement(teamSet, ({ value, expectedVersion }) =>
                Effect.gen(function* () {
                    for (const member of value.members) yield* requireRecord('membership', member);
                    for (const role of value.roles) yield* requireRecord('role', role);
                    return yield* put('team', value, expectedVersion);
                })
            ),
            implement(profileGet, ({ subject }) =>
                safe(store.get('profile', subject)).pipe(Effect.map((entry) => entry ?? null))
            ),
            implement(profileSet, ({ value, expectedVersion }) =>
                Effect.gen(function* () {
                    yield* requireRecord('membership', value.id);
                    return yield* put('profile', value, expectedVersion);
                })
            ),
            implement(auditList, ({ limit }) => safe(store.audit(limit))),
            implement(membershipGet, ({ id }) =>
                safe(store.get('membership', id)).pipe(Effect.map((entry) => entry ?? null))
            ),
            implement(roleGet, ({ id }) => safe(store.get('role', id)).pipe(Effect.map((entry) => entry ?? null))),
            implement(teamGet, ({ id }) => safe(store.get('team', id)).pipe(Effect.map((entry) => entry ?? null))),
        ],
    } satisfies ServerModule;
});
