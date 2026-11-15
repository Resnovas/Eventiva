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
import { Option, Pipeable, Schema } from 'effect';

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

/** One field of a resource, typed by the schema of its value. */
export interface Field<S extends Schema.Schema.AnyNoContext = Schema.Schema.AnyNoContext> extends Pipeable.Pipeable {
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

const field = <S extends Schema.Schema.AnyNoContext>(logical: Logical, schema: S, target?: string): Field<S> => ({
    _tag: 'Field',
    logical,
    schema,
    nullable: false,
    security: 'baseline',
    conflict: 'field-lww',
    label: Option.none(),
    target: Option.fromNullable(target),
    pipe() {
        // Effect's Pipeable helper takes the call's arguments object.
        // eslint-disable-next-line prefer-rest-params
        return Pipeable.pipeArguments(this, arguments);
    },
});

/** A UUID key. */
export const id = (): Field<typeof Schema.UUID> => field('id', Schema.UUID);

/** Text, optionally bounded. */
export const text = (options: { readonly maxLength?: number } = {}): Field<Schema.Schema<string>> =>
    field(
        'text',
        options.maxLength === undefined ? Schema.String : Schema.String.pipe(Schema.maxLength(options.maxLength))
    );

/** A safe integer. */
export const integer = (): Field<typeof Schema.Int> => field('integer', Schema.Int);

/**
 * An exact decimal, carried as a string at every portable boundary so no
 * platform rounds it: at most `precision` digits, `scale` of them after the point.
 */
export const decimal = (options: {
    readonly precision: number;
    readonly scale: number;
}): Field<Schema.Schema<string>> => {
    const whole = options.precision - options.scale;
    const fraction = options.scale > 0 ? `(\\.\\d{1,${options.scale}})?` : '';
    return field('decimal', Schema.String.pipe(Schema.pattern(new RegExp(`^-?\\d{1,${whole}}${fraction}$`))));
};

export const boolean = (): Field<typeof Schema.Boolean> => field('boolean', Schema.Boolean);

/** An instant, encoded as an ISO 8601 string. */
export const timestamp = (): Field<typeof Schema.Date> => field('timestamp', Schema.Date);

/** A JSON document validated by its own schema. */
export const json = <S extends Schema.Schema.AnyNoContext>(schema: S): Field<S> => field('json', schema);

/** The id of a record in another resource, named by its resource name. */
export const reference = (resource: string): Field<typeof Schema.UUID> => field('reference', Schema.UUID, resource);

/** Allows the field to be empty. */
export const nullable = <S extends Schema.Schema.AnyNoContext>(
    self: Field<S>
): Field<Schema.Schema<Schema.Schema.Type<S> | null, Schema.Schema.Encoded<S> | null>> => ({
    ...self,
    schema: Schema.NullOr<Schema.Schema<Schema.Schema.Type<S>, Schema.Schema.Encoded<S>>>(self.schema),
    nullable: true,
});

/** Sets the field's security profile. */
export const classify =
    (security: SecurityProfile) =>
    <S extends Schema.Schema.AnyNoContext>(self: Field<S>): Field<S> => ({ ...self, security });

/** Sets the field's offline conflict rule. */
export const conflict =
    (rule: Conflict) =>
    <S extends Schema.Schema.AnyNoContext>(self: Field<S>): Field<S> => ({ ...self, conflict: rule });

/** Sets the field's label. */
export const label =
    (key: MessageKey) =>
    <S extends Schema.Schema.AnyNoContext>(self: Field<S>): Field<S> => ({ ...self, label: Option.some(key) });
