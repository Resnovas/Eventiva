import { Context, Data, Effect } from 'effect';
import type {
    CreateVendorInput,
    UpdateVendorInput,
    Vendor,
    VendorCategory,
    VendorFilterOptions,
} from './schema.js';

export class VendorNotFoundError extends Data.TaggedError('VendorNotFoundError')<{
    readonly id: string;
    readonly tenantId: string;
}> {}

export class VendorValidationError extends Data.TaggedError('VendorValidationError')<{
    readonly message: string;
    readonly cause?: unknown;
}> {}

export class VendorRepositoryError extends Data.TaggedError('VendorRepositoryError')<{
    readonly message: string;
    readonly cause?: unknown;
}> {}

export interface VendorRepository {
    readonly create: (
        input: CreateVendorInput
    ) => Effect.Effect<Vendor, VendorValidationError | VendorRepositoryError>;
    readonly findById: (
        tenantId: string,
        id: string
    ) => Effect.Effect<Vendor | null, VendorRepositoryError>;
    readonly findByTenant: (
        tenantId: string,
        filter?: VendorFilterOptions
    ) => Effect.Effect<Vendor[], VendorRepositoryError>;
    readonly findByCategory: (
        tenantId: string,
        category: VendorCategory
    ) => Effect.Effect<Vendor[], VendorRepositoryError>;
    readonly update: (
        tenantId: string,
        id: string,
        input: UpdateVendorInput
    ) => Effect.Effect<Vendor, VendorNotFoundError | VendorValidationError | VendorRepositoryError>;
    readonly delete: (
        tenantId: string,
        id: string
    ) => Effect.Effect<void, VendorNotFoundError | VendorRepositoryError>;
    readonly addReview: (
        tenantId: string,
        id: string,
        rating: number
    ) => Effect.Effect<Vendor, VendorNotFoundError | VendorValidationError | VendorRepositoryError>;
    readonly clear: () => Effect.Effect<void>;
}

export const VendorRepository = Context.GenericTag<VendorRepository>(
    '@eventiva/domain-vendor/VendorRepository'
);
