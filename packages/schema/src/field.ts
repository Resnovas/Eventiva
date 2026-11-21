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

/**
 * The logical kinds adapters know how to store; an adapter fails at startup on a kind it cannot store.
 *
 * @since 0.0.1
 * @example
 * const kind: Logical = 'timestamp';
 */
export type Logical = 'id' | 'text' | 'integer' | 'decimal' | 'boolean' | 'timestamp' | 'json' | 'reference';

/**
 * How concurrent offline edits to one field resolve (2026-11-11 offline-first decision).
 *
 * @since 0.0.1
 * @example
 * const rule: Conflict = 'server-authoritative';
 */
export type Conflict = 'field-lww' | 'server-authoritative' | 'append-only';

/**
 * The schema-independent view needed by composition and storage adapters.
 *
 * @since 0.0.1
 * @template S - The value schema, reduced to its AST so composition never depends on a concrete schema class.
 * @example
 * const fields: Readonly<Record<string, Field>> = { id: Field.id(), title: Field.text() };
 */
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

/**
 * A concrete field is also its value schema, without copying schema-class constructors.
 *
 * @since 0.0.1
 * @template S - The Effect Schema that decodes and encodes the field's value.
 * @example
 * const title: ValueField<Schema.Schema<string>> = Field.text({ maxLength: 120 });
 */
export type ValueField<S extends Schema.Schema<S['Type'], S['Encoded']>> = Field<S> &
    Schema.Schema<S['Type'], S['Encoded']>;

/**
 * Build a schema-compatible field with baseline/LWW defaults while retaining the original schema and optional reference target.
 *
 * @template S - The Effect Schema of the field's value.
 * @param logical - The storage kind adapters compile the field into.
 * @param schema - The value schema the field decodes and encodes with.
 * @param target - The resource name a `reference` field points to; omitted for every other kind.
 * @returns A non-nullable, baseline-profile, field-LWW field that is also usable as its value schema.
 */
const field = <S extends Schema.Schema<S['Type'], S['Encoded']>>(
    logical: Logical,
    schema: S,
    target?: string
): ValueField<S> => ({
    ...Schema.make<S['Type'], S['Encoded']>(schema.ast),
    ast: schema.ast,
    /**
     * Return the annotated value schema, not another field declaration; do not mutate the source schema or its constructors.
     *
     * @param annotations - The Effect Schema annotations to apply to the source schema.
     * @returns The source schema with the annotations applied, without field metadata.
     */
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

/**
 * A UUID key field.
 *
 * @since 0.0.1
 * @returns An `id` field whose value schema accepts only UUID strings.
 * @example
 * const fields = { id: Field.id() };
 */
export const id = (): ValueField<typeof Schema.UUID> => field('id', Schema.UUID);

/**
 * A text field, optionally bounded in length.
 *
 * @since 0.0.1
 * @param options - Optional bounds on the text value.
 * @param options.maxLength - The longest string the field accepts; unbounded when omitted.
 * @returns A `text` field whose value schema accepts strings within the bound.
 * @example
 * const title = Field.text({ maxLength: 120 });
 */
export const text = (options: { readonly maxLength?: number } = {}): ValueField<Schema.Schema<string>> =>
    field(
        'text',
        options.maxLength === undefined ? Schema.String : Schema.String.pipe(Schema.maxLength(options.maxLength))
    );

/**
 * A whole-number field.
 *
 * @since 0.0.1
 * @returns An `integer` field whose value schema accepts only integers.
 * @example
 * const seats = Field.integer().pipe(Field.conflict('server-authoritative'));
 */
export const integer = (): ValueField<typeof Schema.Int> => field('integer', Schema.Int);

/**
 * An exact decimal, carried as a string at every portable boundary so no
 * platform rounds it: up to `precision - scale` whole digits and an optional fraction of up to `scale` digits.
 * Supply integer precision greater than scale, with nonnegative scale; option validation is not performed here.
 *
 * @since 0.0.1
 * @param options - The digit limits of the decimal value.
 * @param options.precision - The total number of significant digits, whole and fractional together.
 * @param options.scale - The largest number of digits allowed after the decimal point.
 * @returns A `decimal` field whose value schema accepts decimal strings within the digit limits.
 * @example
 * const price = Field.decimal({ precision: 10, scale: 2 });
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

/**
 * A boolean value schema with baseline security and field-LWW conflict metadata, not a truthy-value coercion.
 *
 * @since 0.0.1
 * @returns A `boolean` field whose value schema accepts only `true` and `false`.
 * @example
 * const published = Field.boolean();
 */
export const boolean = (): ValueField<typeof Schema.Boolean> => field('boolean', Schema.Boolean);

/**
 * An instant, encoded as an ISO 8601 string.
 *
 * @since 0.0.1
 * @returns A `timestamp` field that decodes ISO 8601 strings into `Date` values.
 * @example
 * const startsAt = Field.timestamp();
 */
export const timestamp = (): ValueField<typeof Schema.Date> => field('timestamp', Schema.Date);

/**
 * A JSON document validated by its own schema.
 *
 * @since 0.0.1
 * @template S - The Effect Schema of the document.
 * @param schema - The schema every stored document must satisfy.
 * @returns A `json` field that decodes and encodes with the given schema.
 * @example
 * const meta = Field.json(Schema.Struct({ tags: Schema.Array(Schema.String) }));
 */
export const json = <S extends Schema.Schema<S['Type'], S['Encoded']>>(schema: S): ValueField<S> =>
    field('json', schema);

/**
 * The id of a record in another resource, named by its resource name.
 *
 * @since 0.0.1
 * @param resource - The resource name of the target, such as `venues.venue`; composition rejects an undeclared target.
 * @returns A `reference` field whose value schema accepts UUIDs and whose target names the resource.
 * @example
 * const venue = Field.reference('venues.venue');
 */
export const reference = (resource: string): ValueField<typeof Schema.UUID> =>
    field('reference', Schema.UUID, resource);

/**
 * Allows the field to be empty, keeping its kind, profile, conflict rule, label and target.
 *
 * @since 0.0.1
 * @template A - The decoded value type of the source field.
 * @template I - The encoded value type of the source field.
 * @param self - The field to widen; it is copied, not changed.
 * @returns A nullable copy whose value schema also accepts `null`.
 * @example
 * const notes = Field.nullable(Field.text());
 */
export const nullable = <A, I>(self: Field<Schema.Schema<A, I>>): ValueField<Schema.Schema<A | null, I | null>> => ({
    ...self,
    ...field(self.logical, Schema.NullOr(self.schema)),
    security: self.security,
    conflict: self.conflict,
    label: self.label,
    target: self.target,
    nullable: true,
});

/**
 * Sets the field's security profile, for use in a field's `pipe`.
 *
 * @since 0.0.1
 * @param security - The profile the field's value is stored under.
 * @returns A function that copies a field with the given profile.
 * @example
 * const email = Field.text().pipe(Field.classify('restricted'));
 */
export const classify =
    (security: SecurityProfile) =>
    /**
     * Copy classification metadata without mutating the field; composition checks the owning resource's protection floor.
     *
     * @template F - The field type, preserved apart from its profile.
     * @param self - The field to copy.
     * @returns A copy of the field carrying the new profile.
     */
    <F extends Field>(self: F): Omit<F, 'security'> & { readonly security: SecurityProfile } => ({ ...self, security });

/**
 * Sets the field's offline conflict rule, for use in a field's `pipe`.
 *
 * @since 0.0.1
 * @param rule - The rule that resolves concurrent offline edits to the field.
 * @returns A function that copies a field with the given rule.
 * @example
 * const seats = Field.integer().pipe(Field.conflict('server-authoritative'));
 */
export const conflict =
    (rule: Conflict) =>
    /**
     * Copy the declared offline conflict rule without implementing conflict resolution or changing the value schema.
     *
     * @template F - The field type, preserved apart from its conflict rule.
     * @param self - The field to copy.
     * @returns A copy of the field carrying the new rule.
     */
    <F extends Field>(self: F): Omit<F, 'conflict'> & { readonly conflict: Conflict } => ({ ...self, conflict: rule });

/**
 * Sets the label a screen shows for the field, for use in a field's `pipe`.
 *
 * @since 0.0.1
 * @param key - The message key of the label, translated by the consumer at display time.
 * @returns A function that copies a field with the given label.
 * @example
 * const title = Field.text().pipe(Field.label('events.event.title'));
 */
export const label =
    (key: MessageKey) =>
    /**
     * Attach an untranslated message key on a copied field; display-time locale resolution remains with the consumer.
     *
     * @template F - The field type, preserved apart from its label.
     * @param self - The field to copy.
     * @returns A copy of the field carrying the label key.
     */
    <F extends Field>(self: F): Omit<F, 'label'> & { readonly label: Option.Option<MessageKey> } => ({
        ...self,
        label: Option.some(key),
    });
