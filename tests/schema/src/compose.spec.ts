/**
 * @file tests/schema/src/compose.spec.ts
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
import {
    compose,
    contribute,
    DuplicateResource,
    DuplicateField,
    UnknownTarget,
    WeakerClassification,
    InvalidName,
} from '@eventiva/schema/compose';
import * as Field from '@eventiva/schema/field';
import { ModuleManifest } from '@eventiva/schema/manifest';
import * as Resource from '@eventiva/schema/resource';
import { describe, expect, expectTypeOf, it } from '@effect/vitest';
import { Effect, Either, Option, Schema } from 'effect';

const Event = Resource.make('events.event', {
    module: 'events',
    version: 1,
    plane: 'tenant',
    consistency: 'record',
    fields: {
        id: Field.id(),
        title: Field.text({ maxLength: 5 }).pipe(Field.label('events.event.title')),
        startsAt: Field.timestamp(),
        price: Field.decimal({ precision: 5, scale: 2 }),
        seats: Field.integer().pipe(Field.conflict('server-authoritative')),
        published: Field.boolean(),
        notes: Field.nullable(Field.text()),
        meta: Field.json(Schema.Struct({ tags: Schema.Array(Schema.String) })),
    },
});

const Venue = Resource.make('venues.venue', {
    module: 'venues',
    version: 1,
    plane: 'tenant',
    consistency: 'record',
    security: 'restricted',
    fields: { id: Field.id().pipe(Field.classify('restricted')) },
});

/** Project successful composition into ordered owner-qualified field names while preserving composition failures. */
const names = (composed: Either.Either<{ readonly resources: ReadonlyArray<Resource.Resource | object> }, unknown>) =>
    Either.map(
        composed,
        /** Preserve resource order when reducing a successful composition to its field ownership evidence. */ ({
            resources
        }) =>
            resources.map(
                /** Extract composed array-form fields; uncomposed or opaque resources contribute no names. */ (
                    resource
                ) =>
                    'fields' in resource && Array.isArray(resource.fields)
                        ? resource.fields.map(
                              /** Qualify each field with its owning module so contributed fields remain distinguishable. */
                              (field: { readonly module: string; readonly name: string }) =>
                                  `${field.module}:${field.name}`
                          )
                        : []
            )
    );

describe('fields', /** Cover field type inference, metadata immutability and wire transformations on a concrete event row. */ () => {
    const row = Resource.row(Event);

    it('retains each decoded and encoded field type without a mapped assertion', /** Pin row inference for dates, nullable values and nested JSON without widening concrete schema fields. */ () => {
        expectTypeOf<Schema.Schema.Type<typeof row>>().toEqualTypeOf<Resource.Row<typeof Event>>();
        expectTypeOf<Schema.Schema.Type<typeof row>['startsAt']>().toEqualTypeOf<Date>();
        expectTypeOf<Schema.Schema.Encoded<typeof row>['startsAt']>().toEqualTypeOf<string>();
        expectTypeOf<Schema.Schema.Type<typeof row>['notes']>().toEqualTypeOf<string | null>();
        expectTypeOf<Schema.Schema.Type<typeof row>['seats']>().toEqualTypeOf<number>();
        expectTypeOf<Schema.Schema.Type<typeof row>['meta']>().toEqualTypeOf<{ readonly tags: readonly string[] }>();
        expectTypeOf(Event.fields.meta.schema.fields.tags).toEqualTypeOf<Schema.Array$<typeof Schema.String>>();
    });

    it('uses concrete field schemas directly without mutating their source schema', /** Verify field decoration preserves source identity and transformations without modifying the source schema. */ () => {
        // The wrapper must retain date codecs while keeping field-specific metadata off the caller's source schema.
        const source = Schema.Struct({ at: Schema.Date });
        const value = Field.json(source).pipe(Field.classify('vault'), Field.label('events.event.meta'));
        const at = new Date('2026-11-15T02:40:00.125Z');
        expect(value.schema).toBe(source);
        expect('_tag' in source).toBe(false);
        expect(Schema.decodeUnknownSync(value)({ at: at.toISOString() })).toEqual({ at });
        expect(Schema.encodeSync(value)({ at })).toEqual({ at: at.toISOString() });
        expect(Schema.is(value.annotations({ title: 'Metadata' }))({ at })).toBe(true);
        expect(value.pipe()).toBe(value);
    });

    it('keeps nullable metadata and transformations without changing the original field', /** Verify nullable decoration retains reference metadata and date transformations without mutating the original field. */ () => {
        // Nullability is additive: it must not erase ownership-related metadata or weaken non-null value validation.
        const original = Field.reference('venues.venue').pipe(
            Field.classify('restricted'),
            Field.conflict('server-authoritative'),
            Field.label('events.event.venue')
        );
        const nullable = original.pipe(Field.nullable);
        expect(nullable).toMatchObject({
            security: 'restricted',
            conflict: 'server-authoritative',
            label: Option.some('events.event.venue'),
            target: Option.some('venues.venue'),
            nullable: true,
        });
        expect(Schema.decodeUnknownSync(nullable)(null)).toBeNull();
        expect(Schema.decodeUnknownEither(nullable)('not-a-uuid')._tag).toBe('Left');
        expect(original.nullable).toBe(false);
        const optionalTime = Field.timestamp().pipe(Field.nullable);
        expect(Schema.decodeUnknownSync(optionalTime)('2026-11-15T02:40:00.125Z')).toBeInstanceOf(Date);
        expect(Schema.encodeSync(optionalTime)(null)).toBeNull();
    });

    it('round-trip a record whose wire form differs from its decoded form', /** Verify row decoding transforms timestamps to Date while encoding restores exact millisecond wire precision. */ () => {
        // Boundary values and empty fields ensure the round trip preserves falsy data, not just populated records.
        const wire = {
            id: '0193a4f0-0000-7000-8000-000000000001',
            title: '',
            startsAt: '2026-11-15T02:40:00.125Z',
            price: '-999.99',
            seats: 0,
            published: false,
            notes: null,
            meta: { tags: [] },
        };
        const decoded = Schema.decodeUnknownSync(row)(wire);
        expect(decoded.startsAt).toBeInstanceOf(Date);
        expect(decoded.startsAt.getUTCMilliseconds()).toBe(125);
        expect(Schema.encodeSync(row)(decoded)).toEqual(wire);
    });

    it('bound text and exact decimals at their limits', /** Verify decimal precision and scale independently of text maximum-length boundaries. */ () => {
        // Keep decimals as strings: numeric coercion would erase the trailing separator and scale being validated.
        const price = Schema.is(Event.fields.price.schema);
        expect(price('999.99')).toBe(true);
        expect(price('1000.5')).toBe(false);
        expect(price('1.234')).toBe(false);
        expect(price('1.')).toBe(false);
        expect(Schema.is(Field.decimal({ precision: 3, scale: 0 }).schema)('1.0')).toBe(false);
        expect(Schema.is(Event.fields.title.schema)('12345')).toBe(true);
        expect(Schema.is(Event.fields.title.schema)('123456')).toBe(false);
    });

    it('carry their metadata', /** Verify labels, conflicts, nullability, reference targets and baseline classification remain visible. */ () => {
        expect(Event.fields.title.label).toEqual(Option.some('events.event.title'));
        expect(Event.fields.seats.conflict).toBe('server-authoritative');
        expect(Event.fields.notes.nullable).toBe(true);
        expect(Event.fields.id.security).toBe('baseline');
        expect(Field.reference('venues.venue').target).toEqual(Option.some('venues.venue'));
        expect(Event.security).toBe('baseline');
    });
});

describe('compose', /** Cover deterministic resource merging, contribution ownership and classification floors. */ () => {
    // Exercise object and canonical-name targets so contribution coverage does not depend solely on resource identity.
    const tickets = contribute(Event, 'tickets', { ticketLimit: Field.integer() });
    const venueLink = contribute('events.event', 'venues', { venue: Field.reference('venues.venue') });

    it('exposes concrete required constructor fields for every composition error', /** Pin typed error constructor payloads so diagnostic context cannot disappear through type erasure. */ () => {
        expectTypeOf<ConstructorParameters<typeof DuplicateResource>>().toEqualTypeOf<
            [fields: { readonly resource: string; readonly modules: ReadonlyArray<string> }]
        >();
        expectTypeOf<ConstructorParameters<typeof DuplicateField>>().toEqualTypeOf<
            [fields: { readonly resource: string; readonly field: string; readonly modules: ReadonlyArray<string> }]
        >();
        expectTypeOf<ConstructorParameters<typeof UnknownTarget>>().toEqualTypeOf<
            [fields: { readonly resource: string; readonly module: string; readonly target: string }]
        >();
        expectTypeOf<ConstructorParameters<typeof WeakerClassification>>().toEqualTypeOf<
            [
                fields: {
                    readonly resource: string;
                    readonly field: string;
                    readonly module: string;
                    readonly profile: SecurityProfile;
                    readonly floor: SecurityProfile;
                },
            ]
        >();
        expectTypeOf<ConstructorParameters<typeof InvalidName>>().toEqualTypeOf<
            [fields: { readonly module: string; readonly name: string }]
        >();
    });

    it.effect(
        'keeps composition errors tagged, field-bearing and yieldable',
        /** Exercise each composition error as both a diagnostic object and an Effect failure. */ () =>
            Effect.gen(
                /** Verify errors retain tags and enumerable diagnostic fields when yielded into the typed failure channel. */ function* () {
                    // Constructor typing alone does not prove runtime Error identity, diagnostic payloads or Effect yieldability.
                    const errors = [
                        new DuplicateResource({ resource: 'events.event', modules: ['events', 'other'] }),
                        new DuplicateField({ resource: 'events.event', field: 'title', modules: ['events', 'other'] }),
                        new UnknownTarget({ resource: 'events.event', module: 'events', target: 'venues.venue' }),
                        new WeakerClassification({
                            resource: 'events.event',
                            field: 'title',
                            module: 'events',
                            profile: 'baseline',
                            floor: 'restricted',
                        }),
                        new InvalidName({ module: 'events', name: 'Event' }),
                    ];
                    expect(
                        errors.map(
                            /** Expose discriminants in fixture order to pin the closed error vocabulary. */ (error) =>
                                error._tag
                        )
                    ).toEqual([
                        'DuplicateResource',
                        'DuplicateField',
                        'UnknownTarget',
                        'WeakerClassification',
                        'InvalidName',
                    ]);
                    for (const error of errors) {
                        expect(error).toBeInstanceOf(Error);
                        expect(
                            yield* Effect.either(
                                Effect.gen(
                                    /** Yield the error itself to prove tagged errors enter the typed failure channel unchanged. */ function* () {
                                        return yield* error;
                                    }
                                )
                            )
                        ).toEqual(Either.left(error));
                    }
                    expect(
                        errors.map(
                            /** Inspect enumerable diagnostic payloads independently of Error prototype properties. */ (
                                error
                            ) => ({ ...error })
                        )
                    ).toMatchObject([
                        { resource: 'events.event', modules: ['events', 'other'] },
                        { resource: 'events.event', field: 'title', modules: ['events', 'other'] },
                        { resource: 'events.event', module: 'events', target: 'venues.venue' },
                        {
                            resource: 'events.event',
                            field: 'title',
                            module: 'events',
                            profile: 'baseline',
                            floor: 'restricted',
                        },
                        { module: 'events', name: 'Event' },
                    ]);
                }
            )
    );

    it('gives the same result whatever order modules arrive in', /** Verify resource and contribution permutations produce identical canonically ordered owned fields. */ () => {
        // Reversing both inputs proves ordering is composition policy rather than incidental caller order.
        const a = compose([Event, Venue], [tickets, venueLink]);
        const b = compose([Venue, Event], [venueLink, tickets]);
        expect(a).toEqual(b);
        expect(names(a)).toEqual(
            Either.right([
                [
                    'events:id',
                    'events:meta',
                    'events:notes',
                    'events:price',
                    'events:published',
                    'events:seats',
                    'events:startsAt',
                    'tickets:ticketLimit',
                    'events:title',
                    'venues:venue',
                ],
                ['venues:id'],
            ])
        );
    });

    it('reports the same duplicate field in every order', /** Verify duplicate diagnostics sort contribution owners and also detect collisions with base resource fields. */ () => {
        // Deterministic diagnostics matter for both contribution/contribution and contribution/base collisions.
        const again = contribute(Event, 'badges', { ticketLimit: Field.text() });
        const one = compose([Event], [tickets, again]);
        const two = compose([Event], [again, tickets]);
        expect(one).toEqual(two);
        expect(Either.getLeft(one)).toEqual(
            Option.some(
                expect.objectContaining({
                    _tag: 'DuplicateField',
                    resource: 'events.event',
                    field: 'ticketLimit',
                    modules: ['badges', 'tickets'],
                })
            )
        );
        const own = compose([Event], [contribute(Event, 'tickets', { title: Field.text() })]);
        expect(Either.getLeft(own)).toEqual(Option.some(expect.objectContaining({ modules: ['events', 'tickets'] })));
    });

    it('lets a contribution raise a profile but never lower it below the resource', /** Verify contribution security honors the resource floor while allowing stronger field classification. */ () => {
        // The stronger control distinguishes a floor constraint from a blanket ban on classified contributions.
        const weaker = compose([Venue], [contribute(Venue, 'crm', { notes: Field.text() })]);
        expect(Either.getLeft(weaker)).toEqual(
            Option.some(
                expect.objectContaining({
                    _tag: 'WeakerClassification',
                    field: 'notes',
                    profile: 'baseline',
                    floor: 'restricted',
                })
            )
        );
        const stronger = compose(
            [Venue],
            [contribute(Venue, 'crm', { notes: Field.text().pipe(Field.classify('vault')) })]
        );
        expect(Either.isRight(stronger)).toBe(true);
    });

    it('refuses unknown targets, duplicate resources and names that are not canonical', /** Verify missing targets and malformed or duplicate identities yield stable typed composition errors. */ () => {
        /** Select the failure tag without turning successful composition into an error. */
        const left = (result: Either.Either<unknown, { readonly _tag: string }>) =>
            Either.getLeft(result).pipe(
                Option.map(
                    /** Reduce diagnostic details to the discriminant asserted by this failure matrix. */ (error) =>
                        error._tag
                )
            );
        // Missing referenced resources and missing contribution targets are distinct routes to UnknownTarget.
        expect(left(compose([Event], [venueLink]))).toEqual(Option.some('UnknownTarget'));
        expect(left(compose([], [tickets]))).toEqual(Option.some('UnknownTarget'));
        expect(left(compose([Event, Resource.make('events.event', { ...Event, module: 'other' })], []))).toEqual(
            Option.some('DuplicateResource')
        );
        expect(left(compose([Resource.make('Event', { ...Event })], []))).toEqual(Option.some('InvalidName'));
        expect(left(compose([Event], [contribute(Event, 'tickets', { 'ticket-limit': Field.integer() })]))).toEqual(
            Option.some('InvalidName')
        );
        expect(
            Either.getLeft(compose([Event, Resource.make('events.event', { ...Event, module: 'other' })], []))
        ).toEqual(Option.some(expect.objectContaining({ modules: ['events', 'other'] })));
    });
});

describe('manifest resources', /** Cover optional resource declarations on module manifest wire data. */ () => {
    it('are optional and must be canonical resource names', /** Verify omitted resources remain compatible while supplied entries require qualified canonical names. */ () => {
        const manifest = { format: 1, id: 'events', version: '1.0.0', description: 'Events.', actions: [], flags: [] };
        const decode = Schema.decodeUnknownEither(ModuleManifest);
        expect(decode(manifest)._tag).toBe('Right');
        expect(decode({ ...manifest, resources: ['events.event'] })._tag).toBe('Right');
        expect(decode({ ...manifest, resources: ['event'] })._tag).toBe('Left');
    });
});
