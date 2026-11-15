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
import type { Field } from './field.ts';
import type { ModuleId } from './manifest.ts';

/**
 * Resources: the records a module owns, declared as data. A resource is a
 * name, an owning module, a version and its fields; it holds no table, no
 * column type and no tenant id, because each tenant has its own database.
 * Other modules add fields to it with `@eventiva/schema/compose`.
 */

/** A field name: lower camel case, such as `startsAt`. */
export const FieldName = Schema.String.pipe(Schema.pattern(/^[a-z][a-zA-Z0-9]*$/));
export type FieldName = typeof FieldName.Type;

/** How the resource's records are kept consistent across devices (2026-11-11 offline-first data classes). */
export type Consistency = 'record' | 'invariant' | 'append-only';

/** Tenant data, or the narrow cross-tenant control plane (database-per-tenant decision). */
export type Plane = 'tenant' | 'control';

/** The fields of a resource, by field name. */
export type Fields = Readonly<Record<string, Field>>;

/** A resource declaration. */
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

/** Declares a resource. Pure: names and profiles are checked when the schema is composed. */
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

/** The decoded record of a resource's own fields. */
export type Row<R extends Resource> = Schema.Struct.Type<{
    readonly [K in keyof R['fields']]: R['fields'][K]['schema'];
}>;

/** The schema of one record: every field, required, with its own value schema. */
export const row = <R extends Resource>(
    resource: R
): Schema.Struct<{ readonly [K in keyof R['fields']]: R['fields'][K]['schema'] }> =>
    Schema.Struct(
        Object.fromEntries(Object.entries(resource.fields).map(([name, field]) => [name, field.schema])) as {
            readonly [K in keyof R['fields']]: R['fields'][K]['schema'];
        }
    );
