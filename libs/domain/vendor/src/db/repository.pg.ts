import { and, eq, gte, ilike, or } from 'drizzle-orm';
import { Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import { typeId } from '@eventiva/core';
import {
    VendorNotFoundError,
    VendorRepository,
    VendorRepositoryError,
    VendorValidationError,
} from '../repository.js';
import {
    AddReviewInput,
    CreateVendorInput,
    UpdateVendorInput,
    Vendor,
    VendorCategory,
    VendorFilterOptions,
} from '../schema.js';
import { vendors } from './schema.js';

export function makeDrizzleVendorRepository(db: any): VendorRepository {
    return {
        create: (input: CreateVendorInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(CreateVendorInput)(input).pipe(
                    Effect.mapError(
                        (err) => new VendorValidationError({ message: 'Invalid CreateVendorInput', cause: err })
                    )
                );
                const now = new Date().toISOString();
                const id = typeId('vendor');
                const row = {
                    id,
                    tenantId: validated.tenantId,
                    name: validated.name,
                    category: validated.category,
                    description: validated.description ?? '',
                    contactId: validated.contactId,
                    services: validated.services ?? [],
                    pricingModel: validated.pricingModel ?? 'custom',
                    rating: validated.rating ?? 0,
                    reviews: validated.reviews ?? 0,
                    portfolio: validated.portfolio ?? [],
                    status: validated.status ?? 'active',
                    createdAt: now,
                    updatedAt: now,
                };

                yield* Effect.tryPromise({
                    try: () => db.insert(vendors).values(row),
                    catch: (cause) => new VendorRepositoryError({ message: 'Failed to insert vendor into database', cause }),
                });

                return row as Vendor;
            }),

        findById: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const rows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(vendors)
                            .where(and(eq(vendors.id, id), eq(vendors.tenantId, tenantId))),
                    catch: (cause) => new VendorRepositoryError({ message: `Failed to find vendor ${id}`, cause }),
                });

                if (rows.length === 0) {
                    return null;
                }
                return rows[0] as Vendor;
            }),

        findByTenant: (tenantId: string, filter?: VendorFilterOptions) =>
            Effect.gen(function* () {
                const conditions = [eq(vendors.tenantId, tenantId)];

                if (filter?.category) {
                    conditions.push(eq(vendors.category, filter.category));
                }
                if (filter?.status) {
                    conditions.push(eq(vendors.status, filter.status));
                }
                if (filter?.minRating !== undefined) {
                    conditions.push(gte(vendors.rating, filter.minRating));
                }
                if (filter?.searchQuery) {
                    const searchPattern = `%${filter.searchQuery}%`;
                    conditions.push(
                        or(ilike(vendors.name, searchPattern), ilike(vendors.description, searchPattern))!
                    );
                }

                const rows = yield* Effect.tryPromise({
                    try: () => db.select().from(vendors).where(and(...conditions)),
                    catch: (cause) =>
                        new VendorRepositoryError({ message: `Failed to list vendors for tenant ${tenantId}`, cause }),
                });
                return rows as Vendor[];
            }),

        findByCategory: (tenantId: string, category: VendorCategory) =>
            Effect.gen(function* () {
                const rows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(vendors)
                            .where(and(eq(vendors.tenantId, tenantId), eq(vendors.category, category))),
                    catch: (cause) =>
                        new VendorRepositoryError({
                            message: `Failed to list vendors in category ${category} for tenant ${tenantId}`,
                            cause,
                        }),
                });
                return rows as Vendor[];
            }),

        update: (tenantId: string, id: string, input: UpdateVendorInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(UpdateVendorInput)(input).pipe(
                    Effect.mapError(
                        (err) => new VendorValidationError({ message: 'Invalid UpdateVendorInput', cause: err })
                    )
                );

                const existingRows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(vendors)
                            .where(and(eq(vendors.id, id), eq(vendors.tenantId, tenantId))),
                    catch: (cause) => new VendorRepositoryError({ message: `Failed to find vendor ${id}`, cause }),
                });

                if (existingRows.length === 0) {
                    return yield* Effect.fail(new VendorNotFoundError({ id, tenantId }));
                }

                const now = new Date().toISOString();
                const updatePayload: Record<string, unknown> = {
                    updatedAt: now,
                };
                if (validated.name !== undefined) updatePayload.name = validated.name;
                if (validated.category !== undefined) updatePayload.category = validated.category;
                if (validated.description !== undefined) updatePayload.description = validated.description;
                if (validated.contactId !== undefined) updatePayload.contactId = validated.contactId;
                if (validated.services !== undefined) updatePayload.services = validated.services;
                if (validated.pricingModel !== undefined) updatePayload.pricingModel = validated.pricingModel;
                if (validated.rating !== undefined) updatePayload.rating = validated.rating;
                if (validated.reviews !== undefined) updatePayload.reviews = validated.reviews;
                if (validated.portfolio !== undefined) updatePayload.portfolio = validated.portfolio;
                if (validated.status !== undefined) updatePayload.status = validated.status;

                const updatedRows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .update(vendors)
                            .set(updatePayload)
                            .where(and(eq(vendors.id, id), eq(vendors.tenantId, tenantId)))
                            .returning(),
                    catch: (cause) => new VendorRepositoryError({ message: `Failed to update vendor ${id}`, cause }),
                });

                return updatedRows[0] as Vendor;
            }),

        delete: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const existingRows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(vendors)
                            .where(and(eq(vendors.id, id), eq(vendors.tenantId, tenantId))),
                    catch: (cause) => new VendorRepositoryError({ message: `Failed to find vendor ${id}`, cause }),
                });

                if (existingRows.length === 0) {
                    return yield* Effect.fail(new VendorNotFoundError({ id, tenantId }));
                }

                yield* Effect.tryPromise({
                    try: () => db.delete(vendors).where(and(eq(vendors.id, id), eq(vendors.tenantId, tenantId))),
                    catch: (cause) => new VendorRepositoryError({ message: `Failed to delete vendor ${id}`, cause }),
                });
            }),

        addReview: (tenantId: string, id: string, newRating: number) =>
            Effect.gen(function* () {
                yield* Schema.decodeUnknown(AddReviewInput)({ rating: newRating }).pipe(
                    Effect.mapError(
                        (err) => new VendorValidationError({ message: 'Invalid review rating score', cause: err })
                    )
                );

                const existingRows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(vendors)
                            .where(and(eq(vendors.id, id), eq(vendors.tenantId, tenantId))),
                    catch: (cause) => new VendorRepositoryError({ message: `Failed to find vendor ${id}`, cause }),
                });

                if ((existingRows as any[]).length === 0) {
                    return yield* Effect.fail(new VendorNotFoundError({ id, tenantId }));
                }

                const existing = (existingRows as any[])[0] as Vendor;
                const updatedReviews = existing.reviews + 1;
                const updatedRating = Number(
                    (((existing.rating * existing.reviews) + newRating) / updatedReviews).toFixed(2)
                );
                const now = new Date().toISOString();

                const updatedRows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .update(vendors)
                            .set({
                                rating: updatedRating,
                                reviews: updatedReviews,
                                updatedAt: now,
                            })
                            .where(and(eq(vendors.id, id), eq(vendors.tenantId, tenantId)))
                            .returning(),
                    catch: (cause) =>
                        new VendorRepositoryError({ message: `Failed to add review for vendor ${id}`, cause }),
                });

                return updatedRows[0] as Vendor;
            }),
    };
}

export function makeInMemoryVendorRepository(): VendorRepository {
    const store = new Map<string, Vendor>();

    return {
        create: (input: CreateVendorInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(CreateVendorInput)(input).pipe(
                    Effect.mapError(
                        (err) => new VendorValidationError({ message: 'Invalid CreateVendorInput', cause: err })
                    )
                );
                const now = new Date().toISOString();
                const id = typeId('vendor');
                const vendor: Vendor = {
                    id,
                    tenantId: validated.tenantId,
                    name: validated.name,
                    category: validated.category,
                    description: validated.description ?? '',
                    contactId: validated.contactId,
                    services: validated.services ?? [],
                    pricingModel: validated.pricingModel ?? 'custom',
                    rating: validated.rating ?? 0,
                    reviews: validated.reviews ?? 0,
                    portfolio: validated.portfolio ?? [],
                    status: validated.status ?? 'active',
                    createdAt: now,
                    updatedAt: now,
                };
                store.set(`${validated.tenantId}:${id}`, vendor);
                return vendor;
            }),

        findById: (tenantId: string, id: string) =>
            Effect.succeed(store.get(`${tenantId}:${id}`) ?? null),

        findByTenant: (tenantId: string, filter?: VendorFilterOptions) =>
            Effect.sync(() => {
                let items = Array.from(store.values()).filter((v) => v.tenantId === tenantId);
                if (filter?.category) {
                    items = items.filter((v) => v.category === filter.category);
                }
                if (filter?.status) {
                    items = items.filter((v) => v.status === filter.status);
                }
                if (filter?.minRating !== undefined) {
                    items = items.filter((v) => v.rating >= filter.minRating!);
                }
                if (filter?.searchQuery) {
                    const q = filter.searchQuery.toLowerCase();
                    items = items.filter(
                        (v) => v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q)
                    );
                }
                return items;
            }),

        findByCategory: (tenantId: string, category: VendorCategory) =>
            Effect.sync(() =>
                Array.from(store.values()).filter(
                    (v) => v.tenantId === tenantId && v.category === category
                )
            ),

        update: (tenantId: string, id: string, input: UpdateVendorInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(UpdateVendorInput)(input).pipe(
                    Effect.mapError(
                        (err) => new VendorValidationError({ message: 'Invalid UpdateVendorInput', cause: err })
                    )
                );
                const key = `${tenantId}:${id}`;
                const existing = store.get(key);
                if (!existing) {
                    return yield* Effect.fail(new VendorNotFoundError({ id, tenantId }));
                }

                const updated: Vendor = {
                    ...existing,
                    ...(validated.name !== undefined && { name: validated.name }),
                    ...(validated.category !== undefined && { category: validated.category }),
                    ...(validated.description !== undefined && { description: validated.description }),
                    ...(validated.contactId !== undefined && { contactId: validated.contactId }),
                    ...(validated.services !== undefined && { services: validated.services }),
                    ...(validated.pricingModel !== undefined && { pricingModel: validated.pricingModel }),
                    ...(validated.rating !== undefined && { rating: validated.rating }),
                    ...(validated.reviews !== undefined && { reviews: validated.reviews }),
                    ...(validated.portfolio !== undefined && { portfolio: validated.portfolio }),
                    ...(validated.status !== undefined && { status: validated.status }),
                    updatedAt: new Date().toISOString(),
                };
                store.set(key, updated);
                return updated;
            }),

        delete: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const key = `${tenantId}:${id}`;
                if (!store.has(key)) {
                    return yield* Effect.fail(new VendorNotFoundError({ id, tenantId }));
                }
                store.delete(key);
            }),

        clear: () => Effect.sync(() => store.clear()),



        addReview: (tenantId: string, id: string, newRating: number) =>
            Effect.gen(function* () {
                yield* Schema.decodeUnknown(AddReviewInput)({ rating: newRating }).pipe(
                    Effect.mapError(
                        (err) => new VendorValidationError({ message: 'Invalid review rating score', cause: err })
                    )
                );
                const key = `${tenantId}:${id}`;
                const existing = store.get(key);
                if (!existing) {
                    return yield* Effect.fail(new VendorNotFoundError({ id, tenantId }));
                }

                const updatedReviews = existing.reviews + 1;
                const updatedRating = Number(
                    (((existing.rating * existing.reviews) + newRating) / updatedReviews).toFixed(2)
                );
                const updated: Vendor = {
                    ...existing,
                    rating: updatedRating,
                    reviews: updatedReviews,
                    updatedAt: new Date().toISOString(),
                };
                store.set(key, updated);
                return updated;
            }),
    };
}

export const VendorRepositoryInMemoryLive = Layer.succeed(
    VendorRepository,
    makeInMemoryVendorRepository()
);
