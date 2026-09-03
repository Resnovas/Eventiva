import { describe, expect, it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import { typeId } from '@eventiva/core';
import {
    CreateVendorInput,
    UpdateVendorInput,
    Vendor,
    VendorCategory,
    VendorStatus,
} from '../schema.js';
import {
    VendorNotFoundError,
    VendorRepository,
    VendorValidationError,
} from '../repository.js';
import {
    makeDrizzleVendorRepository,
    makeInMemoryVendorRepository,
    VendorRepositoryInMemoryLive,
} from '../db/repository.pg.js';
import { makeVendorService, VendorService, VendorServiceLive } from '../service.js';

describe('Vendor Domain', () => {
    const sampleTenantId = typeId('tenant');
    const sampleContactId = typeId('contact');

    const validCreateInput: CreateVendorInput = {
        tenantId: sampleTenantId,
        name: 'Gourmet Catering Co.',
        category: 'catering',
        description: 'Premium event catering and beverage services.',
        contactId: sampleContactId,
        services: ['Buffet', 'Plated Dinner', 'Cocktail Bar'],
        pricingModel: 'per-event',
        rating: 4.5,
        reviews: 10,
        portfolio: ['https://example.com/catering1.jpg'],
        status: 'active',
    };

    describe('Schema Validation', () => {
        it.effect('validates a correct CreateVendorInput', () =>
            Effect.gen(function* () {
                const decoded = yield* Schema.decodeUnknown(CreateVendorInput)(validCreateInput);
                expect(decoded.name).toBe('Gourmet Catering Co.');
                expect(decoded.category).toBe('catering');
                expect(decoded.pricingModel).toBe('per-event');
            })
        );

        it.effect('fails validation for empty vendor name', () =>
            Effect.gen(function* () {
                const invalid = { ...validCreateInput, name: '' };
                const result = yield* Effect.exit(Schema.decodeUnknown(CreateVendorInput)(invalid));
                expect(result._tag).toBe('Failure');
            })
        );

        it.effect('fails validation for invalid category', () =>
            Effect.gen(function* () {
                const invalid = { ...validCreateInput, category: 'invalid_category' };
                const result = yield* Effect.exit(Schema.decodeUnknown(CreateVendorInput)(invalid));
                expect(result._tag).toBe('Failure');
            })
        );

        it.effect('fails validation for rating outside 0-5', () =>
            Effect.gen(function* () {
                const invalid = { ...validCreateInput, rating: 6 };
                const result = yield* Effect.exit(Schema.decodeUnknown(CreateVendorInput)(invalid));
                expect(result._tag).toBe('Failure');
            })
        );

        it.effect('fails validation for negative review count', () =>
            Effect.gen(function* () {
                const invalid = { ...validCreateInput, reviews: -1 };
                const result = yield* Effect.exit(Schema.decodeUnknown(CreateVendorInput)(invalid));
                expect(result._tag).toBe('Failure');
            })
        );

        it.effect('fails validation for invalid tenantId prefix', () =>
            Effect.gen(function* () {
                const invalid = { ...validCreateInput, tenantId: 'user_1234' };
                const result = yield* Effect.exit(Schema.decodeUnknown(CreateVendorInput)(invalid));
                expect(result._tag).toBe('Failure');
            })
        );
    });

    describe('VendorRepository (In-Memory)', () => {
        it.effect('creates and retrieves a vendor', () =>
            Effect.gen(function* () {
                const repo = yield* VendorRepository;
                const created = yield* repo.create(validCreateInput);

                expect(created.id).toMatch(/^vendor_/);
                expect(created.name).toBe(validCreateInput.name);
                expect(created.category).toBe('catering');

                const found = yield* repo.findById(sampleTenantId, created.id);
                expect(found).not.toBeNull();
                expect(found?.id).toBe(created.id);
            }).pipe(Effect.provide(VendorRepositoryInMemoryLive))
        );

        it.effect('filters vendors by category efficiently', () =>
            Effect.gen(function* () {
                const repo = yield* VendorRepository;
                yield* repo.clear();

                yield* repo.create({
                    ...validCreateInput,
                    name: 'Catering A',
                    category: 'catering',
                });
                yield* repo.create({
                    ...validCreateInput,
                    name: 'AV Sound Systems',
                    category: 'audio_visual',
                });
                yield* repo.create({
                    ...validCreateInput,
                    name: 'Catering B',
                    category: 'catering',
                });

                const cateringVendors = yield* repo.findByCategory(sampleTenantId, 'catering');
                expect(cateringVendors.length).toBe(2);
                expect(cateringVendors.every((v) => v.category === 'catering')).toBe(true);

                const avVendors = yield* repo.findByCategory(sampleTenantId, 'audio_visual');
                expect(avVendors.length).toBe(1);
                expect(avVendors[0].name).toBe('AV Sound Systems');
            }).pipe(Effect.provide(VendorRepositoryInMemoryLive))
        );

        it.effect('filters vendors by search query and minRating', () =>
            Effect.gen(function* () {
                const repo = yield* VendorRepository;
                yield* repo.clear();

                yield* repo.create({
                    ...validCreateInput,
                    name: 'Elite Stage Lighting',
                    description: 'High-end stage production',
                    rating: 4.8,
                });
                yield* repo.create({
                    ...validCreateInput,
                    name: 'Budget Sound',
                    description: 'Affordable sound setups',
                    rating: 3.2,
                });

                const searchResults = yield* repo.findByTenant(sampleTenantId, { searchQuery: 'stage' });
                expect(searchResults.length).toBe(1);
                expect(searchResults[0].name).toBe('Elite Stage Lighting');

                const highRated = yield* repo.findByTenant(sampleTenantId, { minRating: 4.0 });
                expect(highRated.length).toBe(1);
                expect(highRated[0].name).toBe('Elite Stage Lighting');
            }).pipe(Effect.provide(VendorRepositoryInMemoryLive))
        );

        it.effect('updates vendor information', () =>
            Effect.gen(function* () {
                const repo = yield* VendorRepository;
                const created = yield* repo.create(validCreateInput);

                const updated = yield* repo.update(sampleTenantId, created.id, {
                    name: 'Gourmet Master Catering',
                    status: 'active',
                });

                expect(updated.name).toBe('Gourmet Master Catering');
                expect(updated.services).toEqual(validCreateInput.services);
            }).pipe(Effect.provide(VendorRepositoryInMemoryLive))
        );

        it.effect('aggregates ratings correctly when reviews are added', () =>
            Effect.gen(function* () {
                const repo = yield* VendorRepository;
                const created = yield* repo.create({
                    ...validCreateInput,
                    rating: 0,
                    reviews: 0,
                });

                // First review: 5 stars
                const r1 = yield* repo.addReview(sampleTenantId, created.id, 5);
                expect(r1.reviews).toBe(1);
                expect(r1.rating).toBe(5);

                // Second review: 3 stars -> (5 + 3) / 2 = 4
                const r2 = yield* repo.addReview(sampleTenantId, created.id, 3);
                expect(r2.reviews).toBe(2);
                expect(r2.rating).toBe(4);

                // Third review: 1 star -> (8 + 1) / 3 = 3
                const r3 = yield* repo.addReview(sampleTenantId, created.id, 1);
                expect(r3.reviews).toBe(3);
                expect(r3.rating).toBe(3);
            }).pipe(Effect.provide(VendorRepositoryInMemoryLive))
        );

        it.effect('isolates data between tenants', () =>
            Effect.gen(function* () {
                const repo = yield* VendorRepository;
                const created = yield* repo.create(validCreateInput);

                const tenantB = typeId('tenant');
                const getExit = yield* Effect.exit(repo.findById(tenantB, created.id));
                expect(getExit._tag).toBe('Success');
                if (getExit._tag === 'Success') {
                    expect(getExit.value).toBeNull();
                }

                const updateExit = yield* Effect.exit(
                    repo.update(tenantB, created.id, { name: 'Hacked Vendor' })
                );
                expect(updateExit._tag).toBe('Failure');

                const deleteExit = yield* Effect.exit(repo.delete(tenantB, created.id));
                expect(deleteExit._tag).toBe('Failure');
            }).pipe(Effect.provide(VendorRepositoryInMemoryLive))
        );
    });

    describe('VendorService', () => {
        const testEnv = Layer.provideMerge(VendorServiceLive, VendorRepositoryInMemoryLive);

        it.effect('creates and gets a vendor via VendorService', () =>
            Effect.gen(function* () {
                const service = yield* VendorService;
                const vendor = yield* service.createVendor(validCreateInput);

                expect(vendor.name).toBe(validCreateInput.name);

                const fetched = yield* service.getVendor(sampleTenantId, vendor.id);
                expect(fetched.id).toBe(vendor.id);
            }).pipe(Effect.provide(testEnv))
        );

        it.effect('adds reviews and aggregates rating via VendorService', () =>
            Effect.gen(function* () {
                const service = yield* VendorService;
                const created = yield* service.createVendor({
                    ...validCreateInput,
                    rating: 4.0,
                    reviews: 1,
                });

                // Add 5-star review: (4.0 * 1 + 5) / 2 = 4.5
                const reviewed = yield* service.addVendorReview(sampleTenantId, created.id, 5);
                expect(reviewed.reviews).toBe(2);
                expect(reviewed.rating).toBe(4.5);
            }).pipe(Effect.provide(testEnv))
        );

        it.effect('handles vendor not found gracefully', () =>
            Effect.gen(function* () {
                const service = yield* VendorService;
                const fakeId = typeId('vendor');

                const result = yield* Effect.exit(service.getVendor(sampleTenantId, fakeId));
                expect(result._tag).toBe('Failure');
                if (result._tag === 'Failure' && result.cause._tag === 'Fail') {
                    expect(result.cause.error).toBeInstanceOf(VendorNotFoundError);
                }
            }).pipe(Effect.provide(testEnv))
        );
    });

    describe('makeDrizzleVendorRepository (Drizzle / Postgres Mock)', () => {
        it.effect('supports Drizzle queries for CRUD and category filtering', () =>
            Effect.gen(function* () {
                const dbRows = new Map<string, any>();

                const mockDb = {
                    insert: (_table: any) => ({
                        values: (row: any) => {
                            dbRows.set(row.id, row);
                            return Promise.resolve();
                        },
                    }),
                    select: () => ({
                        from: (_table: any) => ({
                            where: (condition: any) => {
                                const results = Array.from(dbRows.values());
                                return Promise.resolve(results);
                            },
                        }),
                    }),
                    update: (_table: any) => ({
                        set: (payload: any) => ({
                            where: (_condition: any) => ({
                                returning: () => {
                                    const id = Array.from(dbRows.keys())[0];
                                    const existing = dbRows.get(id);
                                    const updated = { ...existing, ...payload };
                                    dbRows.set(id, updated);
                                    return Promise.resolve([updated]);
                                },
                            }),
                        }),
                    }),
                    delete: (_table: any) => ({
                        where: (_condition: any) => {
                            dbRows.clear();
                            return Promise.resolve();
                        },
                    }),
                };

                const pgRepo = makeDrizzleVendorRepository(mockDb);

                const created = yield* pgRepo.create(validCreateInput);
                expect(created.id).toMatch(/^vendor_/);
                expect(dbRows.has(created.id)).toBe(true);

                const found = yield* pgRepo.findById(sampleTenantId, created.id);
                expect(found).not.toBeNull();
                expect(found?.name).toBe('Gourmet Catering Co.');

                const list = yield* pgRepo.findByTenant(sampleTenantId);
                expect(list.length).toBe(1);

                const updated = yield* pgRepo.update(sampleTenantId, created.id, { name: 'Renamed Vendor' });
                expect(updated.name).toBe('Renamed Vendor');

                const reviewed = yield* pgRepo.addReview(sampleTenantId, created.id, 5);
                expect(reviewed.reviews).toBe(11);

                yield* pgRepo.delete(sampleTenantId, created.id);
                expect(dbRows.size).toBe(0);
            })
        );
    });
});
