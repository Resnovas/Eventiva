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

import { compose, contribute } from '@eventiva/schema/compose';
import * as Field from '@eventiva/schema/field';
import { ModuleManifest } from '@eventiva/schema/manifest';
import * as Resource from '@eventiva/schema/resource';
import { describe, expect, it } from '@effect/vitest';
import { Either, Option, Schema } from 'effect';

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

const names = (composed: Either.Either<{ readonly resources: ReadonlyArray<Resource.Resource | object> }, unknown>) =>
    Either.map(composed, ({ resources }) =>
        resources.map((resource) =>
            'fields' in resource && Array.isArray(resource.fields)
                ? resource.fields.map(
                      (field: { readonly module: string; readonly name: string }) => `${field.module}:${field.name}`
                  )
                : []
        )
    );

describe('fields', () => {
    const row = Resource.row(Event);

    it('round-trip a record whose wire form differs from its decoded form', () => {
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

    it('bound text and exact decimals at their limits', () => {
        const price = Schema.is(Event.fields.price.schema);
        expect(price('999.99')).toBe(true);
        expect(price('1000.5')).toBe(false);
        expect(price('1.234')).toBe(false);
        expect(price('1.')).toBe(false);
        expect(Schema.is(Field.decimal({ precision: 3, scale: 0 }).schema)('1.0')).toBe(false);
        expect(Schema.is(Event.fields.title.schema)('12345')).toBe(true);
        expect(Schema.is(Event.fields.title.schema)('123456')).toBe(false);
    });

    it('carry their metadata', () => {
        expect(Event.fields.title.label).toEqual(Option.some('events.event.title'));
        expect(Event.fields.seats.conflict).toBe('server-authoritative');
        expect(Event.fields.notes.nullable).toBe(true);
        expect(Event.fields.id.security).toBe('baseline');
        expect(Field.reference('venues.venue').target).toEqual(Option.some('venues.venue'));
        expect(Event.security).toBe('baseline');
    });
});

describe('compose', () => {
    const tickets = contribute(Event, 'tickets', { ticketLimit: Field.integer() });
    const venueLink = contribute('events.event', 'venues', { venue: Field.reference('venues.venue') });

    it('gives the same result whatever order modules arrive in', () => {
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

    it('reports the same duplicate field in every order', () => {
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

    it('lets a contribution raise a profile but never lower it below the resource', () => {
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

    it('refuses unknown targets, duplicate resources and names that are not canonical', () => {
        const left = (result: Either.Either<unknown, { readonly _tag: string }>) =>
            Either.getLeft(result).pipe(Option.map((error) => error._tag));
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

describe('manifest resources', () => {
    it('are optional and must be canonical resource names', () => {
        const manifest = { format: 1, id: 'events', version: '1.0.0', description: 'Events.', actions: [], flags: [] };
        const decode = Schema.decodeUnknownEither(ModuleManifest);
        expect(decode(manifest)._tag).toBe('Right');
        expect(decode({ ...manifest, resources: ['events.event'] })._tag).toBe('Right');
        expect(decode({ ...manifest, resources: ['event'] })._tag).toBe('Left');
    });
});
