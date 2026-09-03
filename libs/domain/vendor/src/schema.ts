import * as Schema from 'effect/Schema';
import { typeIdSchema } from '@eventiva/core';

export const VendorCategory = Schema.Literal(
    'venue',
    'catering',
    'audio_visual',
    'photography',
    'decor',
    'entertainment',
    'transportation',
    'printing',
    'other'
);
export type VendorCategory = Schema.Schema.Type<typeof VendorCategory>;

export const PricingModel = Schema.Literal('hourly', 'daily', 'per-event', 'custom');
export type PricingModel = Schema.Schema.Type<typeof PricingModel>;

export const VendorStatus = Schema.Literal('active', 'inactive', 'pending', 'archived');
export type VendorStatus = Schema.Schema.Type<typeof VendorStatus>;

export const Vendor = Schema.Struct({
    id: typeIdSchema('vendor'),
    tenantId: typeIdSchema('tenant'),
    name: Schema.String.pipe(
        Schema.nonEmptyString({ message: () => 'Vendor name is required' })
    ),
    category: VendorCategory,
    description: Schema.String,
    contactId: typeIdSchema('contact'),
    services: Schema.Array(Schema.String),
    pricingModel: PricingModel,
    rating: Schema.Number.pipe(
        Schema.between(0, 5, { message: () => 'Rating must be between 0 and 5' })
    ),
    reviews: Schema.Number.pipe(
        Schema.int({ message: () => 'Reviews count must be an integer' }),
        Schema.greaterThanOrEqualTo(0, { message: () => 'Reviews count must be non-negative' })
    ),
    portfolio: Schema.Array(Schema.String),
    status: VendorStatus,
    createdAt: Schema.String,
    updatedAt: Schema.String,
});
export type Vendor = Schema.Schema.Type<typeof Vendor>;

export const CreateVendorInput = Schema.Struct({
    tenantId: typeIdSchema('tenant'),
    name: Schema.String.pipe(
        Schema.nonEmptyString({ message: () => 'Vendor name is required' })
    ),
    category: VendorCategory,
    description: Schema.optionalWith(Schema.String, { default: () => '' }),
    contactId: typeIdSchema('contact'),
    services: Schema.optionalWith(Schema.Array(Schema.String), { default: () => [] }),
    pricingModel: Schema.optionalWith(PricingModel, { default: () => 'custom' }),
    rating: Schema.optionalWith(
        Schema.Number.pipe(
            Schema.between(0, 5, { message: () => 'Rating must be between 0 and 5' })
        ),
        { default: () => 0 }
    ),
    reviews: Schema.optionalWith(
        Schema.Number.pipe(
            Schema.int({ message: () => 'Reviews count must be an integer' }),
            Schema.greaterThanOrEqualTo(0, { message: () => 'Reviews count must be non-negative' })
        ),
        { default: () => 0 }
    ),
    portfolio: Schema.optionalWith(Schema.Array(Schema.String), { default: () => [] }),
    status: Schema.optionalWith(VendorStatus, { default: () => 'active' }),
});
export type CreateVendorInput = Schema.Schema.Type<typeof CreateVendorInput>;

export const UpdateVendorInput = Schema.Struct({
    name: Schema.optional(Schema.String.pipe(Schema.nonEmptyString({ message: () => 'Vendor name cannot be empty' }))),
    category: Schema.optional(VendorCategory),
    description: Schema.optional(Schema.String),
    contactId: Schema.optional(typeIdSchema('contact')),
    services: Schema.optional(Schema.Array(Schema.String)),
    pricingModel: Schema.optional(PricingModel),
    rating: Schema.optional(
        Schema.Number.pipe(
            Schema.between(0, 5, { message: () => 'Rating must be between 0 and 5' })
        )
    ),
    reviews: Schema.optional(
        Schema.Number.pipe(
            Schema.int({ message: () => 'Reviews count must be an integer' }),
            Schema.greaterThanOrEqualTo(0, { message: () => 'Reviews count must be non-negative' })
        )
    ),
    portfolio: Schema.optional(Schema.Array(Schema.String)),
    status: Schema.optional(VendorStatus),
});
export type UpdateVendorInput = Schema.Schema.Type<typeof UpdateVendorInput>;

export const AddReviewInput = Schema.Struct({
    rating: Schema.Number.pipe(
        Schema.between(1, 5, { message: () => 'Rating score must be between 1 and 5' })
    ),
});
export type AddReviewInput = Schema.Schema.Type<typeof AddReviewInput>;

export const VendorFilterOptions = Schema.Struct({
    category: Schema.optional(VendorCategory),
    status: Schema.optional(VendorStatus),
    minRating: Schema.optional(Schema.Number),
    searchQuery: Schema.optional(Schema.String),
});
export type VendorFilterOptions = Schema.Schema.Type<typeof VendorFilterOptions>;
