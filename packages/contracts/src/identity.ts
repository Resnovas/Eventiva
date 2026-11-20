/**
 * @file packages/contracts/src/identity.ts
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

import { Context, type Effect, Schema } from 'effect';
import { define, Permission } from './action.ts';
import { CallerKind } from './caller.ts';
import { SessionId, SubjectId, type TenantId } from './ids.ts';
import { Receipt } from './receipt.ts';
import { EpochMillis, StorageFailure, Version } from './storage.ts';

const Name = Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(200));
export const RoleId = Schema.UUID.pipe(Schema.brand('RoleId'));
export const TeamId = Schema.UUID.pipe(Schema.brand('TeamId'));
/** Exact, case-sensitive issuer/subject pair. Never link accounts by email or display name. */
export const FederatedSubject = Schema.Struct({
    issuer: Schema.NonEmptyString.pipe(Schema.maxLength(2048)),
    subject: Schema.NonEmptyString.pipe(Schema.maxLength(512)),
});
export type FederatedSubject = typeof FederatedSubject.Type;
export const Principal = Schema.Struct({ id: SubjectId, kind: CallerKind, active: Schema.Boolean });
/** Resource identifiers are module-owned opaque strings. '*' explicitly means this tenant, never another DB. */
export const Grant = Schema.Struct({ permission: Permission, resources: Schema.Array(Schema.NonEmptyString) });
export const Role = Schema.Struct({ id: RoleId, name: Name, grants: Schema.Array(Grant) });
export const Membership = Schema.Struct({ id: SubjectId, active: Schema.Boolean, roles: Schema.Array(RoleId) });
export const Team = Schema.Struct({
    id: TeamId,
    name: Name,
    members: Schema.Array(SubjectId),
    roles: Schema.Array(RoleId),
});
/** One organization per routed tenant database. Its key is not a transport-selectable tenant ID. */
export const Organization = Schema.Struct({ id: Schema.Literal('organization'), name: Name });
export const Profile = Schema.Struct({ id: SubjectId, displayName: Name });
/** Delegation is an intersection with the human's LIVE grants, not a snapshot or role assertion. */
export const Delegation = Schema.Struct({
    human: SubjectId,
    session: SessionId,
    expiresAt: EpochMillis,
    grants: Schema.Array(Grant),
});
/** Trusted rolling-session settings; tenant overrides may shorten but never exceed the selected idle/absolute bounds. */
export const SessionRenewalSettings = Schema.Struct({
    idleMs: Schema.Number.pipe(Schema.int(), Schema.between(300_000, 3_600_000)),
    absoluteMs: Schema.Number.pipe(Schema.int(), Schema.between(300_000, 28_800_000)),
}).pipe(
    Schema.filter(
        /** An absolute deadline cannot make the configured idle window an impossible initial lifetime. */
        (value) => value.idleMs <= value.absoluteMs
    )
);
/** Server-recorded activity and original sign-in boundary; missing legacy metadata is never reconstructed from expiry. */
export const SessionActivity = Schema.Struct({
    issuedAt: EpochMillis,
    lastRealActivityAt: EpochMillis,
    absoluteExpiresAt: EpochMillis,
    idleMs: Schema.Number.pipe(Schema.int(), Schema.between(300_000, 3_600_000)),
    issuer: Schema.NonEmptyString.pipe(Schema.maxLength(2048)),
    clientId: Schema.NonEmptyString.pipe(Schema.maxLength(512)),
});
/** Live session authority; optional lifecycle metadata enables bounded renewal without silently upgrading legacy sessions. */
export const IdentitySession = Schema.Struct({
    id: SessionId,
    subject: SubjectId,
    expiresAt: EpochMillis,
    active: Schema.Boolean,
    delegation: Schema.NullOr(Delegation),
    activity: Schema.optional(SessionActivity),
}).pipe(
    Schema.filter(
        /** A renewed session carries one internally consistent expiry and an absolute anchor that activity cannot move. */
        (value) =>
            value.activity === undefined ||
            (value.delegation === null &&
                value.activity.issuedAt >= 0 &&
                value.activity.lastRealActivityAt >= value.activity.issuedAt &&
                value.activity.lastRealActivityAt < value.activity.absoluteExpiresAt &&
                value.activity.absoluteExpiresAt <= value.activity.issuedAt + 28_800_000 &&
                value.expiresAt ===
                    Math.min(
                        value.activity.lastRealActivityAt + value.activity.idleMs,
                        value.activity.absoluteExpiresAt
                    ))
    )
);
export const records = {
    principal: Principal,
    session: IdentitySession,
    organization: Organization,
    membership: Membership,
    team: Team,
    role: Role,
    profile: Profile,
};
export type IdentityKind = keyof typeof records;
export type IdentityRecords = { readonly [K in IdentityKind]: Schema.Schema.Type<(typeof records)[K]> };
/** A tenant identity record paired with the optimistic version required for a subsequent update. */
export interface StoredIdentity<K extends IdentityKind> {
    readonly version: number;
    readonly value: IdentityRecords[K];
}

/** Trusted backend persistence port. Not a transport API; provisioning must supply its own authorization. */
export class IdentityStore extends Context.Tag('@eventiva/contracts/IdentityStore')<
    IdentityStore,
    {
        /** Captured route identity; a store must never be reused under another CurrentTenant. */
        readonly tenant: TenantId;
        /** Serialize policy refresh with revocations; participates in the SAME Storage.commit transaction. */
        readonly lock: Effect.Effect<void, StorageFailure>;
        /** Read a typed identity by kind and key in the captured tenant; absence is not an authorization decision. */
        readonly get: <K extends IdentityKind>(
            kind: K,
            id: string
        ) => Effect.Effect<StoredIdentity<K> | undefined, StorageFailure>;
        /** expectedVersion=null creates only; all updates are optimistic, never unconditional upserts. */
        readonly put: <K extends IdentityKind>(
            kind: K,
            value: IdentityRecords[K],
            expectedVersion: number | null
        ) => Effect.Effect<void, StorageFailure>;
        /** Return teams containing this subject so policy can resolve current team-derived roles. */
        readonly teams: (subject: SubjectId) => Effect.Effect<ReadonlyArray<IdentityRecords['team']>, StorageFailure>;
        /** Bind an exact issuer/subject pair to an active principal; conflicting existing links must fail. */
        readonly link: (external: FederatedSubject, subject: SubjectId) => Effect.Effect<void, StorageFailure>;
        /** Resolve only the exact federated pair; missing links never fall back to email or display names. */
        readonly lookup: (external: FederatedSubject) => Effect.Effect<SubjectId | undefined, StorageFailure>;
        /** Read recent tenant action receipts with a validated limit of 1 through 100, never cross-tenant receipts. */
        readonly audit: (limit: number) => Effect.Effect<ReadonlyArray<Receipt>, StorageFailure>;
    }
>() {}

/** Safe public domain error; database details and personal data never cross action errors. */
export class IdentityFailure extends Schema.TaggedError<IdentityFailure>()('IdentityFailure', {
    reason: Schema.Literal('unavailable', 'missing-reference', 'not-found'),
}) {}

export const identityFlag = {
    key: 'identity.foundation-enabled',
    owner: 'identity',
    description: 'Enable tenant identity administration through the authorized ActionHost.',
    safeDefault: false,
};
const common = { version: 1, offline: 'online-only', sensitive: true, error: IdentityFailure } as const;
const write = { ...common, sideEffect: 'write', risk: 'permission', approval: 'always' } as const;
const expectedVersion = Schema.NullOr(Version);
/** Pair a record codec with its optimistic version while preserving its decoded and encoded value types. */
const stored = <A, I>(schema: Schema.Schema<A, I>) => Schema.Struct({ value: schema, version: Version });
export const organizationGet = define('identity.organization.get', {
    ...common,
    description: 'Read the current tenant organization.',
    input: Schema.Struct({}),
    output: Schema.NullOr(stored(Organization)),
    permission: 'identity.organization.read',
    sideEffect: 'read',
});
export const organizationSet = define('identity.organization.set', {
    ...write,
    description: 'Update the current organization.',
    input: Schema.Struct({ value: Organization, expectedVersion }),
    output: Schema.Null,
    permission: 'identity.organization.write',
});
export const membershipSet = define('identity.membership.set', {
    ...write,
    description: 'Grant or revoke tenant membership.',
    input: Schema.Struct({ value: Membership, expectedVersion }),
    output: Schema.Null,
    permission: 'identity.membership.write',
});
export const roleSet = define('identity.role.set', {
    ...write,
    description: 'Set a tenant role and its resource grants.',
    input: Schema.Struct({ value: Role, expectedVersion }),
    output: Schema.Null,
    permission: 'identity.role.write',
});
export const teamSet = define('identity.team.set', {
    ...write,
    description: 'Set a tenant team, members and roles.',
    input: Schema.Struct({ value: Team, expectedVersion }),
    output: Schema.Null,
    permission: 'identity.team.write',
});
export const profileGet = define('identity.profile.get', {
    ...common,
    description: 'Read a permitted user profile.',
    input: Schema.Struct({ subject: SubjectId }),
    output: Schema.NullOr(stored(Profile)),
    permission: 'identity.profile.read',
    sideEffect: 'read',
});
export const profileSet = define('identity.profile.set', {
    ...common,
    description: 'Update a permitted user profile.',
    input: Schema.Struct({ value: Profile, expectedVersion }),
    output: Schema.Null,
    permission: 'identity.profile.write',
    sideEffect: 'write',
});
export const membershipGet = define('identity.membership.get', {
    ...common,
    description: 'Read a permitted tenant membership.',
    input: Schema.Struct({ id: SubjectId }),
    output: Schema.NullOr(stored(Membership)),
    permission: 'identity.membership.read',
    sideEffect: 'read',
});
export const roleGet = define('identity.role.get', {
    ...common,
    description: 'Read a permitted tenant role.',
    input: Schema.Struct({ id: RoleId }),
    output: Schema.NullOr(stored(Role)),
    permission: 'identity.role.read',
    sideEffect: 'read',
});
export const teamGet = define('identity.team.get', {
    ...common,
    description: 'Read a permitted tenant team.',
    input: Schema.Struct({ id: TeamId }),
    output: Schema.NullOr(stored(Team)),
    permission: 'identity.team.read',
    sideEffect: 'read',
});
export const auditList = define('identity.audit.list', {
    ...common,
    description: 'Read bounded tenant action receipts.',
    input: Schema.Struct({ limit: Schema.Int.pipe(Schema.between(1, 100)) }),
    output: Schema.Array(Receipt),
    permission: 'identity.audit.read',
    sideEffect: 'read',
});
