/**
 * @file tests/resources/src/types.ts
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

import type { Cause, Effect } from 'effect';
import {
    declareResource,
    decodeResource,
    Field,
    ResourceFailure,
    type Resource,
    type Resources,
    type ResourceRecord,
    type ResourceScope,
    type ResourceValue,
    type ResourceQuery,
} from '@eventiva/contracts/resource';

const _contacts = declareResource({
    id: 'crm.contacts',
    owner: 'app.crm',
    moduleVersion: '1.0.0',
    fields: {
        name: { type: 'text', optional: false },
        seats: { type: 'integer', optional: false },
        active: { type: 'boolean', optional: true },
    },
});
type Contact = Effect.Effect.Success<typeof _contacts>;

/** Positive call-site evidence. Compiler-diagnostic negatives live in tools/resources/types.test.mjs, without suppressions. */
export const typeProof = (api: Resources['Type'], resource: Contact) => {
    const create = api.create(resource, 'id', { name: 'One', seats: 3 });
    const query = api.query(resource, { where: { field: 'seats', equals: 4 }, limit: 2 });
    const full = decodeResource(resource, { name: 'One', seats: 3 });
    const patch = decodeResource(resource, { seats: 4 }, true);
    return { create, query, full, patch };
};
type Assert<T extends true> = T;
type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Proof = ReturnType<typeof typeProof>;
export type PortableResource = Assert<Contact extends Resource ? true : false>;
export type RequiredFields = Assert<{ name: string } extends ResourceValue<Contact['fields']> ? false : true>;
export type CorrelatedQuery = Assert<
    { where: { field: 'seats'; equals: string }; limit: number } extends ResourceQuery<Contact['fields']> ? false : true
>;
export type NoSqlEscape = Assert<'sql' extends keyof Resources['Type'] ? false : true>;
export type FieldAlgebra = Assert<
    Equal<Field['type'], 'text' | 'integer' | 'boolean' | 'decimal' | 'uuid' | 'timestamp'>
>;
export type FullRecord = Assert<
    Equal<
        Effect.Effect.Success<Proof['full']>,
        { readonly name: string; readonly seats: number; readonly active?: boolean }
    >
>;
export type PartialRecord = Assert<
    Equal<
        Effect.Effect.Success<Proof['patch']>,
        { readonly name?: string; readonly seats?: number; readonly active?: boolean }
    >
>;
export type QueryResult = Assert<
    Equal<Effect.Effect.Success<Proof['query']>, ReadonlyArray<ResourceRecord<Contact['fields']>>>
>;
export type QueryError = Assert<Equal<Effect.Effect.Error<Proof['query']>, ResourceFailure>>;
export type QueryEnvironment = Assert<Equal<Effect.Effect.Context<Proof['query']>, ResourceScope>>;
export type DecodeEnvironment = Assert<Equal<Effect.Effect.Context<Proof['full']>, never>>;
export type ErrorTag = Assert<Equal<ResourceFailure['_tag'], 'ResourceFailure'>>;
export type ErrorYieldability = Assert<ResourceFailure extends Cause.YieldableError ? true : false>;
export type ErrorConstructorReason = Assert<
    Equal<
        ConstructorParameters<typeof ResourceFailure>[0]['reason'],
        | 'invalid-definition'
        | 'invalid-value'
        | 'unsafe-migration'
        | 'schema-mismatch'
        | 'denied'
        | 'conflict'
        | 'storage'
    >
>;
