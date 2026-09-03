import * as Schema from 'effect/Schema';
import { typeIdSchema } from '@eventiva/core';

export const VenueStatus = Schema.Literal('active', 'inactive', 'maintenance', 'draft');
export type VenueStatus = Schema.Schema.Type<typeof VenueStatus>;

export const Coordinates = Schema.Struct({
    lat: Schema.Number.pipe(Schema.between(-90, 90)),
    lng: Schema.Number.pipe(Schema.between(-180, 180)),
});
export type Coordinates = Schema.Schema.Type<typeof Coordinates>;

export const Address = Schema.Struct({
    street: Schema.String.pipe(Schema.nonEmptyString()),
    city: Schema.String.pipe(Schema.nonEmptyString()),
    state: Schema.String,
    postalCode: Schema.String,
    country: Schema.String.pipe(Schema.nonEmptyString()),
    coordinates: Schema.optional(Coordinates),
});
export type Address = Schema.Schema.Type<typeof Address>;

export const CurrencyAmount = Schema.Struct({
    amount: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
    currency: Schema.String.pipe(Schema.nonEmptyString()),
});
export type CurrencyAmount = Schema.Schema.Type<typeof CurrencyAmount>;

export const Venue = Schema.Struct({
    id: typeIdSchema('venue'),
    tenantId: typeIdSchema('tenant'),
    name: Schema.String.pipe(Schema.nonEmptyString()),
    description: Schema.String,
    address: Address,
    capacity: Schema.Number.pipe(Schema.int(), Schema.positive()),
    amenities: Schema.Array(Schema.String),
    status: VenueStatus,
    pricing: CurrencyAmount,
    contactId: typeIdSchema('contact'),
    createdAt: Schema.String,
    updatedAt: Schema.String,
});
export type Venue = Schema.Schema.Type<typeof Venue>;

export const CreateVenueInput = Schema.Struct({
    tenantId: typeIdSchema('tenant'),
    name: Schema.String.pipe(Schema.nonEmptyString()),
    description: Schema.optionalWith(Schema.String, { default: () => '' }),
    address: Address,
    capacity: Schema.Number.pipe(Schema.int(), Schema.positive()),
    amenities: Schema.optionalWith(Schema.Array(Schema.String), { default: () => [] }),
    status: Schema.optionalWith(VenueStatus, { default: () => 'active' }),
    pricing: CurrencyAmount,
    contactId: typeIdSchema('contact'),
});
export type CreateVenueInput = Schema.Schema.Type<typeof CreateVenueInput>;

export const UpdateVenueInput = Schema.Struct({
    name: Schema.optional(Schema.String.pipe(Schema.nonEmptyString())),
    description: Schema.optional(Schema.String),
    address: Schema.optional(Address),
    capacity: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
    amenities: Schema.optional(Schema.Array(Schema.String)),
    status: Schema.optional(VenueStatus),
    pricing: Schema.optional(CurrencyAmount),
    contactId: Schema.optional(typeIdSchema('contact')),
});
export type UpdateVenueInput = Schema.Schema.Type<typeof UpdateVenueInput>;
