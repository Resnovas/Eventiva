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
/** Record type produced by the contact fixture declaration, used as the typed resource in every proof. */
type Contact = Effect.Effect.Success<typeof _contacts>;

/**
 * Positive call-site evidence. Compiler-diagnostic negatives live in tools/resources/types.test.mjs, without suppressions.
 *
 * @param api - Resource service whose create and query signatures are exercised.
 * @param resource - Contact declaration that fixes the field types the calls must accept.
 * @returns The unrun create, query, full-decode and patch-decode effects, so their types can be asserted.
 * @since 0.0.1
 * @example
 * const { query } = typeProof(api, contacts);
 */
export const typeProof = (api: Resources['Type'], resource: Contact) => {
    // The partial patch intentionally omits required name; full decoding and patch decoding have different contracts.
    const create = api.create(resource, 'id', { name: 'One', seats: 3 });
    const query = api.query(resource, { where: { field: 'seats', equals: 4 }, limit: 2 });
    const full = decodeResource(resource, { name: 'One', seats: 3 });
    const patch = decodeResource(resource, { seats: 4 }, true);
    return { create, query, full, patch };
};
/**
 * Compile only when the asserted condition resolves to true.
 *
 * @template T - Condition that must be the literal type true.
 */
type Assert<T extends true> = T;
/**
 * Resolve to true only when both types are mutually assignable, without distributing over unions.
 *
 * @template A - First type under comparison.
 * @template B - Second type under comparison.
 */
type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
/** Effect types returned by the call-site proof, indexed by operation. */
type Proof = ReturnType<typeof typeProof>;
/**
 * A declared contact resource stays assignable to the portable resource contract.
 *
 * @since 0.0.1
 * @example
 * const proof: PortableResource = true;
 */
export type PortableResource = Assert<Contact extends Resource ? true : false>;
/**
 * A value missing the required seats field is rejected as a full resource value.
 *
 * @since 0.0.1
 * @example
 * const proof: RequiredFields = true;
 */
export type RequiredFields = Assert<{ name: string } extends ResourceValue<Contact['fields']> ? false : true>;
/**
 * A query filter value must match the type of the field it names.
 *
 * @since 0.0.1
 * @example
 * const proof: CorrelatedQuery = true;
 */
export type CorrelatedQuery = Assert<
    { where: { field: 'seats'; equals: string }; limit: number } extends ResourceQuery<Contact['fields']> ? false : true
>;
/**
 * The resource service exposes no raw SQL member that would bypass the contract.
 *
 * @since 0.0.1
 * @example
 * const proof: NoSqlEscape = true;
 */
export type NoSqlEscape = Assert<'sql' extends keyof Resources['Type'] ? false : true>;
/**
 * Field types are exactly the six supported portable column kinds.
 *
 * @since 0.0.1
 * @example
 * const proof: FieldAlgebra = true;
 */
export type FieldAlgebra = Assert<
    Equal<Field['type'], 'text' | 'integer' | 'boolean' | 'decimal' | 'uuid' | 'timestamp'>
>;
/**
 * Full decoding yields every required field and keeps optional fields optional.
 *
 * @since 0.0.1
 * @example
 * const proof: FullRecord = true;
 */
export type FullRecord = Assert<
    Equal<
        Effect.Effect.Success<Proof['full']>,
        { readonly name: string; readonly seats: number; readonly active?: boolean }
    >
>;
/**
 * Patch decoding yields a record where every field is optional.
 *
 * @since 0.0.1
 * @example
 * const proof: PartialRecord = true;
 */
export type PartialRecord = Assert<
    Equal<
        Effect.Effect.Success<Proof['patch']>,
        { readonly name?: string; readonly seats?: number; readonly active?: boolean }
    >
>;
/**
 * A query succeeds with a read-only list of typed records for the resource fields.
 *
 * @since 0.0.1
 * @example
 * const proof: QueryResult = true;
 */
export type QueryResult = Assert<
    Equal<Effect.Effect.Success<Proof['query']>, ReadonlyArray<ResourceRecord<Contact['fields']>>>
>;
/**
 * A query fails only with the typed resource failure.
 *
 * @since 0.0.1
 * @example
 * const proof: QueryError = true;
 */
export type QueryError = Assert<Equal<Effect.Effect.Error<Proof['query']>, ResourceFailure>>;
/**
 * A query requires only the resource scope from its environment.
 *
 * @since 0.0.1
 * @example
 * const proof: QueryEnvironment = true;
 */
export type QueryEnvironment = Assert<Equal<Effect.Effect.Context<Proof['query']>, ResourceScope>>;
/**
 * Decoding a value needs no services from the environment.
 *
 * @since 0.0.1
 * @example
 * const proof: DecodeEnvironment = true;
 */
export type DecodeEnvironment = Assert<Equal<Effect.Effect.Context<Proof['full']>, never>>;
/**
 * The resource failure is tagged so callers can catch it by tag.
 *
 * @since 0.0.1
 * @example
 * const proof: ErrorTag = true;
 */
export type ErrorTag = Assert<Equal<ResourceFailure['_tag'], 'ResourceFailure'>>;
/**
 * The resource failure can be yielded directly inside an Effect generator.
 *
 * @since 0.0.1
 * @example
 * const proof: ErrorYieldability = true;
 */
export type ErrorYieldability = Assert<ResourceFailure extends Cause.YieldableError ? true : false>;
/**
 * The resource failure accepts exactly the documented set of failure reasons.
 *
 * @since 0.0.1
 * @example
 * const proof: ErrorConstructorReason = true;
 */
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
