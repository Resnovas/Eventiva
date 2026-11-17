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

/** Identify principal kinds that must carry a live independent human delegation. */
const agent = (kind: CallerIdentity['kind']) => kind === 'first-party-agent' || kind === 'external-agent';
/** Reject identity checks with a fixed diagnostic that reveals no session, membership or grant details. */
const denied = () => new InvocationDenied({ action: '<identity>', reason: 'identity-denied' });
/** Require a matching permission with nonempty resource scope; discovery omits only the concrete target comparison. */
const permits = (grants: ReadonlyArray<typeof Grant.Type>, permission: string, resource?: string) =>
    grants.some(
        /** Match explicit target or wildcard authority without treating an empty grant scope as permission. */
        (grant) =>
            grant.permission === permission &&
            grant.resources.length > 0 &&
            (resource === undefined || grant.resources.includes('*') || grant.resources.includes(resource))
    );

/** Only this module's resource grammar is known here. Other modules need their own explicit target policy. */
const target = <Input>(spec: ActionSpec, input: Input): string | undefined => {
    // Action names select the grammar, but only a matching schema permits reading a caller-supplied target field.
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
    Effect.gen(
        /** Bind identity refresh, discovery and target policy to one tenant-routed trusted identity store. */ function* () {
            // Store routing is established at composition, never inferred from a presented token or tenant claim.
            const store = yield* IdentityStore;
            const tenant = yield* CurrentTenant;
            if (store.tenant !== tenant.id) return yield* denied();
            /** Require both a live principal and live tenant membership before deriving authority for a subject. */
            const active = (subject: SubjectId) =>
                Effect.gen(
                    /** Reject a deactivated principal or tenant membership even if the other record remains active. */ function* () {
                        // Principal activation alone cannot confer membership in this routed organization.
                        const principal = yield* store.get('principal', subject);
                        const membership = yield* store.get('membership', subject);
                        if (!principal?.value.active || !membership?.value.active) return yield* denied();
                        return { principal: principal.value, membership: membership.value };
                    }
                );
            /** Rebuild usable authority from live session/principal/membership and human-delegation records, not presented claims. */
            const refresh = (presented: CallerIdentity) =>
                Effect.gen(
                    /** Lock trusted identity state before checking session lifetime and independently active delegating human authority. */ function* () {
                        const caller = yield* Schema.decodeUnknown(CallerIdentity)(presented, {
                            onExcessProperty: 'error',
                        }).pipe(Effect.mapError(denied));
                        if (caller.tenant !== tenant.id) return yield* denied();
                        // Keep authority observations under the store lock so revocation cannot be bypassed by mixing record versions.
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
                    }
                ).pipe(
                    Effect.catchTag(
                        'StorageFailure',
                        /** Loss of authoritative identity storage is denial, not permission to trust stale presented claims. */ () =>
                            Effect.fail(denied())
                    )
                );
            /** Derive current grants from active membership and its live teams, deduplicating role lookups. */
            const grantsFor = (subject: SubjectId) =>
                Effect.gen(
                    /** Resolve the union of membership/team roles from trusted storage rather than request-carried roles. */ function* () {
                        // Resolve role definitions live: retaining a role id must not preserve permissions removed from that role.
                        const { membership } = yield* active(subject);
                        const teams = yield* store.teams(subject);
                        const roles = [
                            ...new Set([
                                ...membership.roles,
                                ...teams.flatMap(
                                    /** Include team-assigned role references in the same live authority set. */ (
                                        team
                                    ) => team.roles
                                )
                            ])
                        ];
                        const entries = yield* Effect.forEach(
                            roles,
                            /** Read each distinct role from the routed authoritative store. */ (id) =>
                                store.get('role', id)
                        );
                        return entries.flatMap(
                            /** Missing role definitions confer no grants rather than retaining a stale permission snapshot. */ (
                                entry
                            ) => entry?.value.grants ?? []
                        );
                    }
                );
            /** Require the principal's grants and, for delegation, both human and delegation grant scopes to permit the operation. */
            const authorize = (caller: CallerIdentity, spec: ActionSpec, resource?: string) =>
                Effect.gen(
                    /** Revalidate session authority before intersecting current principal, human and delegated grants. */ function* () {
                        // Delegation narrows authority; it cannot union the agent's grants with otherwise unavailable human permissions.
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
                    }
                ).pipe(
                    Effect.mapError(
                        /** Publish only a bounded action denial, never which private identity record or grant failed. */ () =>
                            new Forbidden({ action: spec.name, reason: 'identity-policy-denied' })
                    )
                );
            return Layer.mergeAll(
                Layer.succeed(IdentityResolver, {
                    /** Refresh authority without granting discovery or decoded-target permission. */
                    resolve: (caller) =>
                        refresh(caller).pipe(
                            Effect.map(
                                /** Return the validated caller, keeping trusted delegation evidence inside policy evaluation. */ (
                                    live
                                ) => live.caller
                            )
                        ),
                }),
                Layer.succeed(Authorizer, {
                    /** Check discovery-level permission before input decoding, without claiming authorization for a concrete target. */
                    canInvoke: (caller, spec) => authorize(caller, spec),
                    /** Require this module's explicit decoded-target grammar; unknown module actions need a separate target policy. */
                    check: (caller, spec, input) => {
                        // Discovery permission is insufficient when no module-owned resource target can be established.
                        const resource = target(spec, input);
                        return resource === undefined
                            ? Effect.fail(new Forbidden({ action: spec.name, reason: 'resource-policy-required' }))
                            : authorize(caller, spec, resource);
                    },
                }),
                Layer.succeed(ExecutionPolicy, {
                    /** Apply identity actions' declared approval floor and permission-risk step-up; no resource capacity/state model is supplied here. */
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
        }
    )
);

/** Backend verification boundary. MUST validate signature, algorithm, key provenance and token type before returning.
 * No production implementation is supplied. Decoding a JWT is NOT verification.
 */
export class StandardsTokenVerifier extends Context.Tag('@eventiva/runtime/StandardsTokenVerifier')<
    StandardsTokenVerifier,
    {
        /** Verify token cryptography/provenance/type and return claims for subsequent trusted issuer/audience/session binding. */
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
    Effect.gen(
        /** Bind verified external token claims to configured issuer/audience/scopes and live tenant identity records. */ function* () {
            // Verification establishes token provenance, not tenant routing or current session/delegation authority.
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
                expected.scopes.some(
                    /** Require every nonempty server-configured scope in the verified token. */ (scope) =>
                        !scope || !claims.scopes.includes(scope)
                ) ||
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
        }
    ).pipe(
        Effect.catchTag(
            'StorageFailure',
            /** Fail authentication closed when federation/session lookup loses its trusted store. */ () =>
                Effect.fail(denied())
        )
    );

/** Registered once per routed tenant host. Store and durable Integrity must capture the same SQL client. */
export const identityModule = Effect.gen(
    /** Assemble tenant-bound identity actions whose mutations join the host's durable transaction owner. */ function* () {
        const store = yield* IdentityStore;
        const tenant = yield* CurrentTenant;
        if (store.tenant !== tenant.id) return yield* denied();
        // Handlers close over the routed store, but ActionHost still owns invocation authorization and atomic mutation execution.
        /** Sanitize store/domain failures into the identity module's declared bounded action error. */
        const safe = <A, E>(effect: Effect.Effect<A, E>) =>
            effect.pipe(
                Effect.mapError(
                    /** Hide store internals and record details from the action's wire error. */ () =>
                        new IdentityFailure({ reason: 'unavailable' })
                )
            );
        /** Require referenced identity records before writing an association; absence is distinct from store unavailability. */
        const requireRecord = (kind: IdentityKind, id: string) =>
            Effect.gen(
                /** Reject associations to missing principals, memberships or roles using the declared reference failure. */ function* () {
                    if ((yield* safe(store.get(kind, id))) === undefined)
                        return yield* new IdentityFailure({ reason: 'missing-reference' });
                }
            );
        /** Persist one typed identity record with its optimistic precondition and return the action's null success payload. */
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
                ].map(
                    /** Advertise exactly the canonical names implemented by this tenant module. */ (spec) => spec.name
                ),
            },
            actions: [
                implement(
                    organizationGet,
                    /** Read this tenant's singleton organization with explicit null absence. */ () =>
                        safe(store.get('organization', 'organization')).pipe(
                            Effect.map(
                                /** Preserve the portable nullable result instead of serializing undefined. */ (
                                    entry
                                ) => entry ?? null
                            )
                        )
                ),
                implement(
                    organizationSet,
                    /** Apply the organization's optimistic version precondition through the captured store. */ ({
                        value,
                        expectedVersion
                    }) => put('organization', value, expectedVersion)
                ),
                implement(
                    membershipSet,
                    /** Require principal and role references before replacing a membership at its expected version. */ ({
                        value,
                        expectedVersion
                    }) =>
                        Effect.gen(
                            /** Keep membership reference checks and the write within the host-provided mutation transaction. */ function* () {
                                // Membership must not create implicit principals or roles merely by naming them.
                                yield* requireRecord('principal', value.id);
                                for (const role of value.roles) yield* requireRecord('role', role);
                                return yield* put('membership', value, expectedVersion);
                            }
                        )
                ),
                implement(
                    roleSet,
                    /** Replace a role's grants only at the supplied optimistic version. */ ({
                        value,
                        expectedVersion
                    }) => put('role', value, expectedVersion)
                ),
                implement(
                    teamSet,
                    /** Require all membership and role references before updating a team's assignments. */ ({
                        value,
                        expectedVersion
                    }) =>
                        Effect.gen(
                            /** Validate team associations before the version-checked write in the host's mutation transaction. */ function* () {
                                // A team cannot bootstrap authority by referencing identities or roles absent from the tenant store.
                                for (const member of value.members) yield* requireRecord('membership', member);
                                for (const role of value.roles) yield* requireRecord('role', role);
                                return yield* put('team', value, expectedVersion);
                            }
                        )
                ),
                implement(
                    profileGet,
                    /** Read the authorized subject's profile without manufacturing a default profile. */ ({
                        subject
                    }) =>
                        safe(store.get('profile', subject)).pipe(
                            Effect.map(
                                /** Represent a missing profile with the declared null result. */ (entry) =>
                                    entry ?? null
                            )
                        )
                ),
                implement(
                    profileSet,
                    /** Require tenant membership before writing a profile at its expected version. */ ({
                        value,
                        expectedVersion
                    }) =>
                        Effect.gen(
                            /** Check profile ownership has a membership record before storing the public profile value. */ function* () {
                                // A profile cannot introduce a new tenant principal through an otherwise authorized profile write.
                                yield* requireRecord('membership', value.id);
                                return yield* put('profile', value, expectedVersion);
                            }
                        )
                ),
                implement(
                    auditList,
                    /** Read the requested bounded identity receipt history through the tenant store. */ ({ limit }) =>
                        safe(store.audit(limit))
                ),
                implement(
                    membershipGet,
                    /** Read the authorized membership id with portable null absence. */ ({ id }) =>
                        safe(store.get('membership', id)).pipe(
                            Effect.map(
                                /** Preserve optional stored membership as the action's nullable result. */ (entry) =>
                                    entry ?? null
                            )
                        )
                ),
                implement(
                    roleGet,
                    /** Read the authorized role definition, not a cached grant expansion. */ ({ id }) =>
                        safe(store.get('role', id)).pipe(
                            Effect.map(
                                /** Return null for an absent role without inventing permissions. */ (entry) =>
                                    entry ?? null
                            )
                        )
                ),
                implement(
                    teamGet,
                    /** Read the authorized team's stored assignments with explicit absence. */ ({ id }) =>
                        safe(store.get('team', id)).pipe(
                            Effect.map(
                                /** Return the portable nullable team result without creating a team. */ (entry) =>
                                    entry ?? null
                            )
                        )
                ),
            ],
        } satisfies ServerModule;
    }
);
