/**
 * @file packages/contracts/src/crm-organisation.ts
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

import { Effect, Schema } from 'effect';
import { define } from './action.ts';
import { SubjectId } from './ids.ts';
import { declareResource } from './resource.ts';
import { UuidV7 } from './storage.ts';

const strict = { parseOptions: { onExcessProperty: 'error' } } as const;
const Name = Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(200));
const Revision = Schema.Number.pipe(Schema.int(), Schema.between(1, Number.MAX_SAFE_INTEGER));
const names = {
    displayName: Name,
    legalName: Name,
    tradingName: Schema.optionalWith(Name, { exact: true }),
};

/** Tenant-private organisation projection; one revision covers the atomic Party/Organisation pair. */
export const Organisation = Schema.Struct({
    id: UuidV7,
    revision: Revision,
    kind: Schema.Literal('organisation'),
    visibility: Schema.Literal('tenant'),
    ...names,
    createdBy: SubjectId,
    owner: SubjectId,
    archived: Schema.Boolean,
}).annotations(strict);
export type Organisation = typeof Organisation.Type;

/** Bounded public failure codes never include names, input, SQL diagnostics or parser context. */
export class OrganisationFailure extends Schema.TaggedError<OrganisationFailure>()('OrganisationFailure', {
    reason: Schema.Literal('not-found', 'conflict', 'denied', 'unavailable', 'invalid-value'),
}) {}

/** Optional CRM capability; enabling it never grants record or action authority. */
export const crmFlag = {
    key: 'crm.enabled',
    description: 'Enable tenant-private CRM organisation actions.',
    owner: 'crm',
    safeDefault: false,
};
const common = {
    version: 1,
    offline: 'online-only',
    sensitive: true,
    error: OrganisationFailure,
    flag: crmFlag.key,
} as const;
const write = { ...common, permission: 'crm.write', sideEffect: 'write' } as const;
const read = { ...common, permission: 'crm.read', sideEffect: 'read' } as const;
const expected = { id: UuidV7, expectedRevision: Revision };

export const organisationCreate = define('crm.organisation.create', {
    ...write,
    description: 'Create a distinct tenant-private organisation and Party with one stable UUIDv7.',
    input: Schema.Struct({
        id: UuidV7,
        ...names,
        visibility: Schema.optionalWith(Schema.Literal('tenant'), { exact: true }),
    }).annotations(strict),
    output: Organisation,
});
export const organisationUpdate = define('crm.organisation.update', {
    ...write,
    description: 'Replace organisation names at the expected revision; omitted trading name is retained.',
    input: Schema.Struct({ ...expected, ...names }).annotations(strict),
    output: Organisation,
});
export const organisationArchive = define('crm.organisation.archive', {
    ...write,
    description: 'Archive an active organisation without changing its stable Party identity.',
    input: Schema.Struct(expected).annotations(strict),
    output: Organisation,
});
export const organisationRestore = define('crm.organisation.restore', {
    ...write,
    description: 'Restore an archived organisation at its expected revision.',
    input: Schema.Struct(expected).annotations(strict),
    output: Organisation,
});
export const organisationGet = define('crm.organisation.get', {
    ...read,
    description: 'Read an organisation; archived records are absent unless explicitly included.',
    input: Schema.Struct({
        id: UuidV7,
        includeArchived: Schema.optionalWith(Schema.Boolean, { exact: true }),
    }).annotations(strict),
    output: Organisation,
});
export const organisationList = define('crm.organisation.list', {
    ...read,
    description:
        'List organisations in exclusive UUID order, default 50, maximum 100; archived records are excluded by default.',
    input: Schema.Struct({
        after: Schema.optionalWith(UuidV7, { exact: true }),
        limit: Schema.optionalWith(Schema.Number.pipe(Schema.int(), Schema.between(1, 100)), { exact: true }),
        includeArchived: Schema.optionalWith(Schema.Boolean, { exact: true }),
    }).annotations(strict),
    output: Schema.Struct({
        items: Schema.Array(Organisation),
        after: Schema.optionalWith(UuidV7, { exact: true }),
    }).annotations(strict),
});
export const organisationActions = [
    organisationCreate,
    organisationUpdate,
    organisationArchive,
    organisationRestore,
    organisationGet,
    organisationList,
];

// Deliberately conservative ASCII syntax, not ownership/deliverability checks or external normalization.
const WorkEmail = Schema.NonEmptyTrimmedString.pipe(
    Schema.maxLength(254),
    Schema.pattern(
        /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*(?:\.[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)+$/
    )
);
const WorkPhone = Schema.String.pipe(Schema.maxLength(16), Schema.pattern(/^\+[1-9][0-9]{6,14}$/));
const contactIdentity = {
    id: UuidV7,
    organisationId: UuidV7,
    revision: Revision,
    label: Schema.Literal('work'),
    primary: Schema.Boolean,
    removed: Schema.Boolean,
};
/** Sensitive current/tombstone projection; syntax never implies verification, and kind/parent/label cannot change. */
export const ContactPoint = Schema.Union(
    Schema.Struct({ ...contactIdentity, kind: Schema.Literal('email'), value: WorkEmail }).annotations(strict),
    Schema.Struct({ ...contactIdentity, kind: Schema.Literal('phone'), value: WorkPhone }).annotations(strict)
);
export type ContactPoint = typeof ContactPoint.Type;
const contactTarget = { id: UuidV7, organisationId: UuidV7 };
const contactExpected = { ...contactTarget, expectedRevision: Revision };
export const contactPointAdd = define('crm.contact-point.add', {
    ...write,
    description: 'Add a distinct unverified work contact to an active organisation; initially non-primary.',
    input: Schema.Union(
        Schema.Struct({
            ...contactTarget,
            kind: Schema.Literal('email'),
            label: Schema.Literal('work'),
            value: WorkEmail,
        }).annotations(strict),
        Schema.Struct({
            ...contactTarget,
            kind: Schema.Literal('phone'),
            label: Schema.Literal('work'),
            value: WorkPhone,
        }).annotations(strict)
    ),
    output: ContactPoint,
});
export const contactPointUpdate = define('crm.contact-point.update', {
    ...write,
    description: 'Replace only the contact value at its expected revision; stored kind determines syntax.',
    input: Schema.Struct({
        ...contactExpected,
        value: Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(254)),
    }).annotations(strict),
    output: ContactPoint,
});
export const contactPointRemove = define('crm.contact-point.remove', {
    ...write,
    description: 'Tombstone a work contact and clear its primary status without nominating a replacement.',
    input: Schema.Struct(contactExpected).annotations(strict),
    output: ContactPoint,
});
export const contactPointSetPrimary = define('crm.contact-point.set-primary', {
    ...write,
    description: 'Atomically select a live work contact as the only primary for its organisation and kind.',
    input: Schema.Struct(contactExpected).annotations(strict),
    output: ContactPoint,
});
export const contactPointGet = define('crm.contact-point.get', {
    ...read,
    description: 'Read a live work contact only through its accessible active organisation.',
    input: Schema.Struct(contactTarget).annotations(strict),
    output: ContactPoint,
});
export const contactPointList = define('crm.contact-point.list', {
    ...read,
    description: 'List live organisation work contacts in exclusive ID order, default 50, maximum 100.',
    input: Schema.Struct({
        organisationId: UuidV7,
        after: Schema.optionalWith(UuidV7, { exact: true }),
        limit: Schema.optionalWith(Schema.Number.pipe(Schema.int(), Schema.between(1, 100)), { exact: true }),
    }).annotations(strict),
    output: Schema.Struct({
        items: Schema.Array(ContactPoint),
        after: Schema.optionalWith(UuidV7, { exact: true }),
    }).annotations(strict),
});
export const contactPointActions = [
    contactPointAdd,
    contactPointUpdate,
    contactPointRemove,
    contactPointSetPrimary,
    contactPointGet,
    contactPointList,
];

/** Declare organisation pairs, work contacts and primary guards; application composition owns migration and provider admission. */
export const organisationResources = Effect.gen(
    /** Share stable record IDs between the supertype and subtype without copying tenant routing into domain rows. */ function* () {
        const party = yield* declareResource({
            id: 'crm.party',
            owner: 'app.crm',
            moduleVersion: '1.0.0',
            fields: {
                kind: { type: 'text', optional: false },
                displayName: { type: 'text', optional: false },
                visibility: { type: 'text', optional: false },
                // Canonical SubjectId permits RFC UUID versions beyond the resource UUIDv7 record-key codec.
                createdBy: { type: 'text', optional: false },
                owner: { type: 'text', optional: false },
                archived: { type: 'boolean', optional: false },
            },
        });
        const organisation = yield* declareResource({
            id: 'crm.organisation',
            owner: 'app.crm',
            moduleVersion: '1.0.0',
            fields: {
                legalName: { type: 'text', optional: false },
                tradingName: { type: 'text', optional: true },
            },
        });
        const contactPoint = yield* declareResource({
            id: 'crm.contact-point',
            owner: 'app.crm',
            moduleVersion: '1.0.0',
            fields: {
                organisationId: { type: 'uuid', optional: false },
                kind: { type: 'text', optional: false },
                label: { type: 'text', optional: false },
                value: { type: 'text', optional: false },
                primary: { type: 'boolean', optional: false },
                removed: { type: 'boolean', optional: false },
            },
        });
        // Separate resources let the organisation UUID serialize each kind without lossy UUID key derivation or parent writes.
        const emailPrimary = yield* declareResource({
            id: 'crm.email-primary-guard',
            owner: 'app.crm',
            moduleVersion: '1.0.0',
            fields: { marker: { type: 'boolean', optional: false } },
        });
        const phonePrimary = yield* declareResource({
            id: 'crm.phone-primary-guard',
            owner: 'app.crm',
            moduleVersion: '1.0.0',
            fields: { marker: { type: 'boolean', optional: false } },
        });
        return { party, organisation, contactPoint, emailPrimary, phonePrimary };
    }
);
