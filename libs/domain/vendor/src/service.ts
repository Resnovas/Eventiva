import { Context, Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import {
    VendorNotFoundError,
    VendorRepository,
    VendorRepositoryError,
    VendorValidationError,
} from './repository.js';
import {
    AddReviewInput,
    CreateVendorInput,
    UpdateVendorInput,
    Vendor,
    VendorCategory,
    VendorFilterOptions,
} from './schema.js';

export class VendorService extends Context.Tag('@eventiva/domain-vendor/VendorService')<
    VendorService,
    {
        readonly createVendor: (
            input: CreateVendorInput
        ) => Effect.Effect<Vendor, VendorValidationError | VendorRepositoryError, VendorRepository>;
        readonly getVendor: (
            tenantId: string,
            id: string
        ) => Effect.Effect<Vendor, VendorNotFoundError | VendorRepositoryError, VendorRepository>;
        readonly listVendors: (
            tenantId: string,
            filter?: VendorFilterOptions
        ) => Effect.Effect<Vendor[], VendorRepositoryError, VendorRepository>;
        readonly getVendorsByCategory: (
            tenantId: string,
            category: VendorCategory
        ) => Effect.Effect<Vendor[], VendorRepositoryError, VendorRepository>;
        readonly updateVendor: (
            tenantId: string,
            id: string,
            input: UpdateVendorInput
        ) => Effect.Effect<Vendor, VendorNotFoundError | VendorValidationError | VendorRepositoryError, VendorRepository>;
        readonly deleteVendor: (
            tenantId: string,
            id: string
        ) => Effect.Effect<void, VendorNotFoundError | VendorRepositoryError, VendorRepository>;
        readonly addVendorReview: (
            tenantId: string,
            id: string,
            rating: number
        ) => Effect.Effect<Vendor, VendorNotFoundError | VendorValidationError | VendorRepositoryError, VendorRepository>;
    }
>() {}

export const makeVendorService = Effect.gen(function* () {
    const repo = yield* VendorRepository;

    return VendorService.of({
        createVendor: (input: CreateVendorInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(CreateVendorInput)(input).pipe(
                    Effect.mapError((err) => new VendorValidationError({ message: 'Validation failed for CreateVendorInput', cause: err }))
                );
                return yield* repo.create(validated);
            }),

        getVendor: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const vendor = yield* repo.findById(tenantId, id);
                if (!vendor) {
                    return yield* Effect.fail(new VendorNotFoundError({ id, tenantId }));
                }
                return vendor;
            }),

        listVendors: (tenantId: string, filter?: VendorFilterOptions) =>
            repo.findByTenant(tenantId, filter),

        getVendorsByCategory: (tenantId: string, category: VendorCategory) =>
            repo.findByCategory(tenantId, category),

        updateVendor: (tenantId: string, id: string, input: UpdateVendorInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(UpdateVendorInput)(input).pipe(
                    Effect.mapError((err) => new VendorValidationError({ message: 'Validation failed for UpdateVendorInput', cause: err }))
                );
                return yield* repo.update(tenantId, id, validated);
            }),

        deleteVendor: (tenantId: string, id: string) => repo.delete(tenantId, id),

        addVendorReview: (tenantId: string, id: string, rating: number) =>
            Effect.gen(function* () {
                yield* Schema.decodeUnknown(AddReviewInput)({ rating }).pipe(
                    Effect.mapError((err) => new VendorValidationError({ message: 'Validation failed for AddReviewInput', cause: err }))
                );
                return yield* repo.addReview(tenantId, id, rating);
            }),
    });
});

export const VendorServiceLive = Layer.effect(VendorService, makeVendorService);
