import * as Schema from 'effect/Schema';
import { typeIdSchema } from '@eventiva/core';

export const EventType = Schema.Literal('festival', 'conference', 'exhibition', 'corporate', 'wedding', 'private', 'other');
export type EventType = Schema.Schema.Type<typeof EventType>;

export const EventStatus = Schema.Literal('planned', 'confirmed', 'in_progress', 'completed', 'cancelled');
export type EventStatus = Schema.Schema.Type<typeof EventStatus>;

export const CurrencyAmount = Schema.Struct({
    amount: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
    currency: Schema.String.pipe(Schema.nonEmptyString()),
});
export type CurrencyAmount = Schema.Schema.Type<typeof CurrencyAmount>;

export const Event = Schema.Struct({
    id: typeIdSchema('event'),
    tenantId: typeIdSchema('tenant'),
    name: Schema.String.pipe(Schema.nonEmptyString()),
    description: Schema.String,
    eventType: EventType,
    status: EventStatus,
    venueId: Schema.optional(typeIdSchema('venue')),
    startDate: Schema.String,
    endDate: Schema.String,
    expectedAttendees: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(0))),
    budget: Schema.optional(CurrencyAmount),
    ownerId: typeIdSchema('contact'),
    tags: Schema.Array(Schema.String),
    createdAt: Schema.String,
    updatedAt: Schema.String,
});
export type Event = Schema.Schema.Type<typeof Event>;

export const CreateEventInput = Schema.Struct({
    tenantId: typeIdSchema('tenant'),
    name: Schema.String.pipe(Schema.nonEmptyString()),
    description: Schema.optionalWith(Schema.String, { default: () => '' }),
    eventType: EventType,
    status: Schema.optionalWith(EventStatus, { default: () => 'planned' }),
    venueId: Schema.optional(typeIdSchema('venue')),
    startDate: Schema.String,
    endDate: Schema.String,
    expectedAttendees: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(0))),
    budget: Schema.optional(CurrencyAmount),
    ownerId: typeIdSchema('contact'),
    tags: Schema.optionalWith(Schema.Array(Schema.String), { default: () => [] }),
});
export type CreateEventInput = Schema.Schema.Type<typeof CreateEventInput>;

export const UpdateEventInput = Schema.Struct({
    name: Schema.optional(Schema.String.pipe(Schema.nonEmptyString())),
    description: Schema.optional(Schema.String),
    eventType: Schema.optional(EventType),
    status: Schema.optional(EventStatus),
    venueId: Schema.optional(typeIdSchema('venue')),
    startDate: Schema.optional(Schema.String),
    endDate: Schema.optional(Schema.String),
    expectedAttendees: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(0))),
    budget: Schema.optional(CurrencyAmount),
    ownerId: Schema.optional(typeIdSchema('contact')),
    tags: Schema.optional(Schema.Array(Schema.String)),
});
export type UpdateEventInput = Schema.Schema.Type<typeof UpdateEventInput>;