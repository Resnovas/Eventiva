/**
 * @file packages/schema/src/field.ts
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

import type { MessageKey } from '@eventiva/contracts/i18n';
import type { SecurityProfile } from '@eventiva/contracts/security';
import { Option, Pipeable, Schema, type SchemaAST } from 'effect';

/**
 * Database-neutral fields. A field names a logical kind, the Effect Schema of
 * its value, a security profile and an offline conflict rule; it never names a
 * column type or a driver. Storage adapters compile fields into tables and
 * fail at startup on a kind they cannot store.
 */

/** The logical kinds adapters know how to store. */
export type Logical = 'id' | 'text' | 'integer' | 'decimal' | 'boolean' | 'timestamp' | 'json' | 'reference';

/** How concurrent offline edits to one field resolve (2026-11-11 offline-first decision). */
export type Conflict = 'field-lww' | 'server-authoritative' | 'append-only';

/** The schema-independent view needed by composition and storage adapters. */
export interface Field<S extends { readonly ast: SchemaAST.AST } = { readonly ast: SchemaAST.AST }>
    extends Pipeable.Pipeable {
    readonly _tag: 'Field';
    readonly logical: Logical;
    readonly schema: S;
    readonly nullable: boolean;
    readonly security: SecurityProfile;
    readonly conflict: Conflict;
    /** The label a screen shows, as a message key. */
    readonly label: Option.Option<MessageKey>;
    /** The resource a `reference` field points to. */
    readonly target: Option.Option<string>;
}

/** A concrete field is also its value schema, without copying schema-class constructors. */
export type ValueField<S extends Schema.Schema<S['Type'], S['Encoded']>> = Field<S> &
    Schema.Schema<S['Type'], S['Encoded']>;

/** Build a schema-compatible field with baseline/LWW defaults while retaining the original schema and optional reference target. */
const field = <S extends Schema.Schema<S['Type'], S['Encoded']>>(
    logical: Logical,
    schema: S,
    target?: string
): ValueField<S> => ({
    ...Schema.make<S['Type'], S['Encoded']>(schema.ast),
    ast: schema.ast,
    /** Return the annotated value schema, not another field declaration; do not mutate the source schema or its constructors. */
    annotations: (annotations) => schema.annotations(annotations),
    pipe: Pipeable.Prototype.pipe,
    _tag: 'Field',
    logical,
    schema,
    nullable: false,
    security: 'baseline',
    conflict: 'field-lww',
    label: Option.none(),
    target: Option.fromNullable(target),
});

/** A UUID key. */
export const id = (): ValueField<typeof Schema.UUID> => field('id', Schema.UUID);

/** Text, optionally bounded. */
export const text = (options: { readonly maxLength?: number } = {}): ValueField<Schema.Schema<string>> =>
    field(
        'text',
        options.maxLength === undefined ? Schema.String : Schema.String.pipe(Schema.maxLength(options.maxLength))
    );

/** A safe integer. */
export const integer = (): ValueField<typeof Schema.Int> => field('integer', Schema.Int);

/**
 * An exact decimal, carried as a string at every portable boundary so no
 * platform rounds it: up to `precision - scale` whole digits and an optional fraction of up to `scale` digits.
 * Supply integer precision greater than scale, with nonnegative scale; option validation is not performed here.
 */
export const decimal = (options: {
    readonly precision: number;
    readonly scale: number;
}): ValueField<Schema.Schema<string>> => {
    // Bound lexical digits without converting through Number; omitting the fractional arm forbids fractions at scale zero.
    const whole = options.precision - options.scale;
    const fraction = options.scale > 0 ? `(\\.\\d{1,${options.scale}})?` : '';
    return field('decimal', Schema.String.pipe(Schema.pattern(new RegExp(`^-?\\d{1,${whole}}${fraction}$`))));
};

/** A boolean value schema with baseline security and field-LWW conflict metadata, not a truthy-value coercion. */
export const boolean = (): ValueField<typeof Schema.Boolean> => field('boolean', Schema.Boolean);

/** An instant, encoded as an ISO 8601 string. */
export const timestamp = (): ValueField<typeof Schema.Date> => field('timestamp', Schema.Date);

/** A JSON document validated by its own schema. */
export const json = <S extends Schema.Schema<S['Type'], S['Encoded']>>(schema: S): ValueField<S> =>
    field('json', schema);

/** The id of a record in another resource, named by its resource name. */
export const reference = (resource: string): ValueField<typeof Schema.UUID> =>
    field('reference', Schema.UUID, resource);

/** Allows the field to be empty. */
export const nullable = <A, I>(self: Field<Schema.Schema<A, I>>): ValueField<Schema.Schema<A | null, I | null>> => ({
    ...self,
    ...field(self.logical, Schema.NullOr(self.schema)),
    security: self.security,
    conflict: self.conflict,
    label: self.label,
    target: self.target,
    nullable: true,
});

/** Sets the field's security profile. */
export const classify =
    (security: SecurityProfile) =>
    /** Copy classification metadata without mutating the field; composition checks the owning resource's protection floor. */
    <F extends Field>(self: F): Omit<F, 'security'> & { readonly security: SecurityProfile } => ({ ...self, security });

/** Sets the field's offline conflict rule. */
export const conflict =
    (rule: Conflict) =>
    /** Copy the declared offline conflict rule without implementing conflict resolution or changing the value schema. */
    <F extends Field>(self: F): Omit<F, 'conflict'> & { readonly conflict: Conflict } => ({ ...self, conflict: rule });

/** Sets the field's label. */
export const label =
    (key: MessageKey) =>
    /** Attach an untranslated message key on a copied field; display-time locale resolution remains with the consumer. */
    <F extends Field>(self: F): Omit<F, 'label'> & { readonly label: Option.Option<MessageKey> } => ({
        ...self,
        label: Option.some(key),
    });
