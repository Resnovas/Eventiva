/**
 * @file packages/schema/src/resource.ts
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

import type { SecurityProfile } from '@eventiva/contracts/security';
import { Schema } from 'effect';
import type { Field, ValueField } from './field.ts';
import type { ModuleId } from './manifest.ts';

/**
 * Resources: the records a module owns, declared as data. A resource is a
 * name, an owning module, a version and its fields; it holds no table, no
 * column type and no tenant id, because each tenant has its own database.
 * Other modules add fields to it with `@eventiva/schema/compose`.
 */

/**
 * A field name: lower camel case, such as `startsAt`.
 *
 * @since 0.0.1
 * @example
 * const valid = Schema.is(FieldName)('startsAt');
 */
export const FieldName = Schema.String.pipe(Schema.pattern(/^[a-z][a-zA-Z0-9]*$/));
/**
 * A string already checked against the lower-camel-case field-name pattern.
 *
 * @since 0.0.1
 * @example
 * const name: FieldName = 'startsAt';
 */
export type FieldName = typeof FieldName.Type;

/**
 * How the resource's records are kept consistent across devices (2026-11-11 offline-first data classes).
 *
 * @since 0.0.1
 * @example
 * const consistency: Consistency = 'append-only';
 */
export type Consistency = 'record' | 'invariant' | 'append-only';

/**
 * Tenant data, or the narrow cross-tenant control plane (database-per-tenant decision).
 *
 * @since 0.0.1
 * @example
 * const plane: Plane = 'tenant';
 */
export type Plane = 'tenant' | 'control';

/**
 * The fields of a resource, by field name.
 *
 * @since 0.0.1
 * @example
 * const fields: Fields = { id: Field.id(), title: Field.text({ maxLength: 120 }) };
 */
export type Fields = Readonly<Record<string, Field>>;

/**
 * A record a module owns, declared as data: its name, owner, stored-shape version, plane, consistency, protection floor and fields.
 *
 * @since 0.0.1
 * @template Name - The literal resource name, such as `events.event`.
 * @template F - The resource's own fields, by field name.
 * @example
 * const event: Resource<'events.event'> = Resource.make('events.event', options);
 */
export interface Resource<Name extends string = string, F extends Fields = Fields> {
    readonly _tag: 'Resource';
    readonly name: Name;
    readonly module: ModuleId;
    /** Bumped on every change to the stored shape. */
    readonly version: number;
    readonly plane: Plane;
    readonly consistency: Consistency;
    /** The weakest profile any field of the resource, its own or contributed, may have. */
    readonly security: SecurityProfile;
    readonly fields: F;
}

/**
 * Declares a resource. Pure: names and profiles are checked when the schema is composed.
 *
 * @since 0.0.1
 * @template Name - The literal resource name.
 * @template F - The resource's own fields.
 * @param name - The resource name, the owning module followed by the record, such as `events.event`.
 * @param options - The rest of the declaration.
 * @param options.module - The id of the module that owns the resource.
 * @param options.version - The stored-shape version, bumped on every change to it.
 * @param options.plane - Whether records live in tenant data or the control plane.
 * @param options.consistency - How records are kept consistent across devices.
 * @param options.security - The weakest profile any field may have; `baseline` when omitted.
 * @param options.fields - The resource's own fields, by field name.
 * @returns The resource declaration, unchecked until it is composed.
 * @example
 * const Event = Resource.make('events.event', { module: 'events', version: 1, plane: 'tenant', consistency: 'record', fields: { id: Field.id() } });
 */
export const make = <const Name extends string, const F extends Fields>(
    name: Name,
    options: {
        readonly module: ModuleId;
        readonly version: number;
        readonly plane: Plane;
        readonly consistency: Consistency;
        readonly security?: SecurityProfile;
        readonly fields: F;
    }
): Resource<Name, F> => ({
    _tag: 'Resource',
    name,
    module: options.module,
    version: options.version,
    plane: options.plane,
    consistency: options.consistency,
    security: options.security ?? 'baseline',
    fields: options.fields,
});

/**
 * The decoded record of a resource's own fields.
 *
 * @since 0.0.1
 * @template R - The resource whose fields shape the record.
 * @example
 * const event: Row<typeof Event> = Schema.decodeUnknownSync(Resource.row(Event))(input);
 */
export type Row<R extends Resource> = {
    readonly [K in keyof R['fields']]: Schema.Schema.Type<R['fields'][K]['schema']>;
};

/**
 * Constrain every field to a concrete value schema so the fields can form an Effect `Struct`.
 *
 * @template F - The resource's fields.
 */
type SchemaFields<F extends Fields> = {
    readonly [K in keyof F]: ValueField<
        Schema.Schema<Schema.Schema.Type<F[K]['schema']>, Schema.Schema.Encoded<F[K]['schema']>>
    >;
};

/**
 * The schema of one record: every field, required, with its own value schema.
 *
 * @since 0.0.1
 * @template F - The resource's own fields.
 * @param resource - The resource whose own fields form the record; contributed fields are not included.
 * @returns A struct schema that decodes and encodes one record of the resource.
 * @example
 * const event = Schema.decodeUnknownSync(Resource.row(Event))(input);
 */
export const row = <F extends Fields & SchemaFields<F>>(resource: Resource<string, F>): Schema.Struct<F> =>
    Schema.Struct(resource.fields);
