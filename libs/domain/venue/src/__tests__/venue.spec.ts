import { describe, expect, it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import { typeId } from '@eventiva/core';
import {
    Address,
    CreateVenueInput,
    CurrencyAmount,
    UpdateVenueInput,
    Venue,
    VenueStatus,
} from '../schema.js';
import {
    VenueNotFoundError,
    VenueRepository,
    VenueRepositoryError,
    VenueValidationError,
} from '../repository.js';
import {
    makeDrizzleVenueRepository,
    makeInMemoryVenueRepository,
    VenueRepositoryInMemoryLive,
} from '../db/repository.pg.ts';
import { makeVenueService, VenueService, VenueServiceLive } from '../service.js';

const sampleTenantId = typeId('tenant');
const sampleContactId = typeId('contact');

const validAddress = {
    street: '123 Event St',
    city: 'London',
    state: 'Greater London',
    postalCode: 'EC1A 1BB',
    country: 'United Kingdom',
    coordinates: { lat: 51.5074, lng: -0.1278 },
};

const validPricing = {
    amount: 1500,
    currency: 'GBP',
};

const validCreateInput = {
    tenantId: sampleTenantId,
    name: 'Grand Event Hall',
    description: 'A spacious venue for large corporate events.',
    address: validAddress,
    capacity: 500,
    amenities: ['wifi', 'parking', 'catering', 'av_system'],
    status: 'active' as const,
    pricing: validPricing,
    contactId: sampleContactId,
};

describe('Venue Schema Validation', () => {
    it.effect('validates valid CreateVenueInput', () =>
        Effect.gen(function* () {
            const decoded = yield* Schema.decodeUnknown(CreateVenueInput)(validCreateInput);
            expect(decoded.name).toBe('Grand Event Hall');
            expect(decoded.capacity).toBe(500);
            expect(decoded.pricing.amount).toBe(1500);
        })
    );

    it.effect('fails validation for invalid fields', () =>
        Effect.gen(function* () {
            // Capacity validation error
            const invalidCapacity = yield* Effect.exit(
                Schema.decodeUnknown(CreateVenueInput)({ ...validCreateInput, capacity: -10 })
            );
            expect(invalidCapacity._tag).toBe('Failure');

            // Pricing amount error
            const invalidPricingAmount = yield* Effect.exit(
                Schema.decodeUnknown(CreateVenueInput)({
                    ...validCreateInput,
                    pricing: { amount: -50, currency: 'GBP' },
                })
            );
            expect(invalidPricingAmount._tag).toBe('Failure');

            // Empty currency error
            const invalidCurrency = yield* Effect.exit(
                Schema.decodeUnknown(CreateVenueInput)({
                    ...validCreateInput,
                    pricing: { amount: 100, currency: '' },
                })
            );
            expect(invalidCurrency._tag).toBe('Failure');

            // Invalid latitude error
            const invalidLat = yield* Effect.exit(
                Schema.decodeUnknown(CreateVenueInput)({
                    ...validCreateInput,
                    address: { ...validAddress, coordinates: { lat: 100, lng: -0.1278 } },
                })
            );
            expect(invalidLat._tag).toBe('Failure');

            // Invalid longitude error
            const invalidLng = yield* Effect.exit(
                Schema.decodeUnknown(CreateVenueInput)({
                    ...validCreateInput,
                    address: { ...validAddress, coordinates: { lat: 50, lng: 200 } },
                })
            );
            expect(invalidLng._tag).toBe('Failure');

            // Empty street error
            const invalidStreet = yield* Effect.exit(
                Schema.decodeUnknown(CreateVenueInput)({
                    ...validCreateInput,
                    address: { ...validAddress, street: '' },
                })
            );
            expect(invalidStreet._tag).toBe('Failure');

            // Empty city error
            const invalidCity = yield* Effect.exit(
                Schema.decodeUnknown(CreateVenueInput)({
                    ...validCreateInput,
                    address: { ...validAddress, city: '' },
                })
            );
            expect(invalidCity._tag).toBe('Failure');

            // Empty country error
            const invalidCountry = yield* Effect.exit(
                Schema.decodeUnknown(CreateVenueInput)({
                    ...validCreateInput,
                    address: { ...validAddress, country: '' },
                })
            );
            expect(invalidCountry._tag).toBe('Failure');

            // Empty venue name error
            const invalidName = yield* Effect.exit(
                Schema.decodeUnknown(CreateVenueInput)({ ...validCreateInput, name: '' })
            );
            expect(invalidName._tag).toBe('Failure');

            // Empty update name error
            const invalidUpdateName = yield* Effect.exit(
                Schema.decodeUnknown(UpdateVenueInput)({ name: '' })
            );
            expect(invalidUpdateName._tag).toBe('Failure');
        })
    );

    it.effect('fails validation for invalid tenantId prefix', () =>
        Effect.gen(function* () {
            const invalidInput = { ...validCreateInput, tenantId: 'user_01h2xcejqtf2nbrexx3vqjhp41' };
            const result = yield* Effect.exit(Schema.decodeUnknown(CreateVenueInput)(invalidInput));
            expect(result._tag).toBe('Failure');
        })
    );
});

describe('Venue CRUD & Tenant Isolation (VenueService)', () => {
    const testLayer = Layer.provide(VenueServiceLive, VenueRepositoryInMemoryLive);

    it.effect('creates and retrieves a venue', () =>
        Effect.gen(function* () {
            const service = yield* VenueService;
            const created = yield* service.createVenue(validCreateInput);

            expect(created.id).toMatch(/^venue_/);
            expect(created.name).toBe('Grand Event Hall');
            expect(created.tenantId).toBe(sampleTenantId);
            expect(created.createdAt).toBeDefined();

            const fetched = yield* service.getVenue(sampleTenantId, created.id);
            expect(fetched).toEqual(created);
        }).pipe(Effect.provide(testLayer))
    );

    it.effect('lists venues scoped by tenant', () =>
        Effect.gen(function* () {
            const service = yield* VenueService;
            const tenantA = typeId('tenant');
            const tenantB = typeId('tenant');

            yield* service.createVenue({ ...validCreateInput, tenantId: tenantA, name: 'Venue A1' });
            yield* service.createVenue({ ...validCreateInput, tenantId: tenantA, name: 'Venue A2' });
            yield* service.createVenue({ ...validCreateInput, tenantId: tenantB, name: 'Venue B1' });

            const listA = yield* service.listVenues(tenantA);
            const listB = yield* service.listVenues(tenantB);

            expect(listA.length).toBe(2);
            expect(listB.length).toBe(1);
            expect(listA.every((v) => v.tenantId === tenantA)).toBe(true);
            expect(listB.every((v) => v.tenantId === tenantB)).toBe(true);
        }).pipe(Effect.provide(testLayer))
    );

    it.effect('enforces tenant isolation on get, update, and delete', () =>
        Effect.gen(function* () {
            const service = yield* VenueService;
            const tenantA = typeId('tenant');
            const tenantB = typeId('tenant');

            const venueA = yield* service.createVenue({ ...validCreateInput, tenantId: tenantA, name: 'Tenant A Venue' });

            // Tenant B attempting to access Tenant A's venue fails with VenueNotFoundError
            const getExit = yield* Effect.exit(service.getVenue(tenantB, venueA.id));
            expect(getExit._tag).toBe('Failure');

            // Tenant B attempting to update Tenant A's venue fails with VenueNotFoundError
            const updateExit = yield* Effect.exit(
                service.updateVenue(tenantB, venueA.id, { name: 'Hacked Name' })
            );
            expect(updateExit._tag).toBe('Failure');

            // Tenant B attempting to delete Tenant A's venue fails with VenueNotFoundError
            const deleteExit = yield* Effect.exit(service.deleteVenue(tenantB, venueA.id));
            expect(deleteExit._tag).toBe('Failure');

            // Tenant A can still fetch it untouched
            const fetched = yield* service.getVenue(tenantA, venueA.id);
            expect(fetched.name).toBe('Tenant A Venue');
        }).pipe(Effect.provide(testLayer))
    );

    it.effect('updates all fields of a venue', () =>
        Effect.gen(function* () {
            const service = yield* VenueService;
            const created = yield* service.createVenue(validCreateInput);
            const newContactId = typeId('contact');

            const updated = yield* service.updateVenue(sampleTenantId, created.id, {
                name: 'Updated Event Center',
                description: 'New Description',
                address: { ...validAddress, city: 'Manchester' },
                capacity: 1000,
                amenities: ['wifi', 'parking'],
                status: 'maintenance',
                pricing: { amount: 2500, currency: 'GBP' },
                contactId: newContactId,
            });

            expect(updated.name).toBe('Updated Event Center');
            expect(updated.description).toBe('New Description');
            expect(updated.address.city).toBe('Manchester');
            expect(updated.capacity).toBe(1000);
            expect(updated.amenities).toEqual(['wifi', 'parking']);
            expect(updated.status).toBe('maintenance');
            expect(updated.pricing.amount).toBe(2500);
            expect(updated.contactId).toBe(newContactId);
        }).pipe(Effect.provide(testLayer))
    );

    it.effect('deletes a venue', () =>
        Effect.gen(function* () {
            const service = yield* VenueService;
            const created = yield* service.createVenue(validCreateInput);

            yield* service.deleteVenue(sampleTenantId, created.id);

            const getExit = yield* Effect.exit(service.getVenue(sampleTenantId, created.id));
            expect(getExit._tag).toBe('Failure');

            const deleteNotExist = yield* Effect.exit(service.deleteVenue(sampleTenantId, created.id));
            expect(deleteNotExist._tag).toBe('Failure');
        }).pipe(Effect.provide(testLayer))
    );

    it.effect('fails createVenue on invalid input schema', () =>
        Effect.gen(function* () {
            const service = yield* VenueService;
            const invalidInput = { ...validCreateInput, name: '' };
            const exit = yield* Effect.exit(service.createVenue(invalidInput as any));
            expect(exit._tag).toBe('Failure');
        }).pipe(Effect.provide(testLayer))
    );

    it.effect('fails updateVenue on invalid update input schema', () =>
        Effect.gen(function* () {
            const service = yield* VenueService;
            const created = yield* service.createVenue(validCreateInput);
            const exit = yield* Effect.exit(service.updateVenue(sampleTenantId, created.id, { name: '' }));
            expect(exit._tag).toBe('Failure');
        }).pipe(Effect.provide(testLayer))
    );
});

describe('PostgreSQL Drizzle Venue Repository Unit Tests', () => {
    it.effect('executes full CRUD against Drizzle ORM mock', () =>
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

            const pgRepo = makeDrizzleVenueRepository(mockDb);

            const created = yield* pgRepo.create(validCreateInput);
            expect(created.id).toMatch(/^venue_/);
            expect(dbRows.has(created.id)).toBe(true);

            const found = yield* pgRepo.findById(sampleTenantId, created.id);
            expect(found).not.toBeNull();
            expect(found?.name).toBe('Grand Event Hall');

            const list = yield* pgRepo.findByTenant(sampleTenantId);
            expect(list.length).toBe(1);

            const newContactId = typeId('contact');
            const updated = yield* pgRepo.update(sampleTenantId, created.id, {
                name: 'Renamed Venue',
                description: 'Updated description',
                address: validAddress,
                capacity: 600,
                amenities: ['wifi'],
                status: 'draft',
                pricing: { amount: 2000, currency: 'USD' },
                contactId: newContactId,
            });
            expect(updated.name).toBe('Renamed Venue');

            yield* pgRepo.delete(sampleTenantId, created.id);
            expect(dbRows.size).toBe(0);
        })
    );

    it.effect('handles errors in Drizzle operations gracefully', () =>
        Effect.gen(function* () {
            const failingDb = {
                insert: () => ({ values: () => Promise.reject(new Error('Insert error')) }),
                select: () => ({ from: () => ({ where: () => Promise.reject(new Error('Select error')) }) }),
                update: () => ({ set: () => ({ where: () => ({ returning: () => Promise.reject(new Error('Update error')) }) }) }),
                delete: () => ({ where: () => Promise.reject(new Error('Delete error')) }),
            };

            const pgRepo = makeDrizzleVenueRepository(failingDb);

            const createExit = yield* Effect.exit(pgRepo.create(validCreateInput));
            expect(createExit._tag).toBe('Failure');

            const findExit = yield* Effect.exit(pgRepo.findById(sampleTenantId, 'venue_123'));
            expect(findExit._tag).toBe('Failure');

            const listExit = yield* Effect.exit(pgRepo.findByTenant(sampleTenantId));
            expect(listExit._tag).toBe('Failure');

            const updateExit = yield* Effect.exit(pgRepo.update(sampleTenantId, 'venue_123', { name: 'New' }));
            expect(updateExit._tag).toBe('Failure');

            const deleteExit = yield* Effect.exit(pgRepo.delete(sampleTenantId, 'venue_123'));
            expect(deleteExit._tag).toBe('Failure');
        })
    );

    it.effect('handles update and delete for nonexistent venue in Drizzle repository', () =>
        Effect.gen(function* () {
            const emptyDb = {
                select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
            };

            const pgRepo = makeDrizzleVenueRepository(emptyDb);

            const updateExit = yield* Effect.exit(pgRepo.update(sampleTenantId, 'venue_nonexistent', { name: 'New' }));
            expect(updateExit._tag).toBe('Failure');

            const deleteExit = yield* Effect.exit(pgRepo.delete(sampleTenantId, 'venue_nonexistent'));
            expect(deleteExit._tag).toBe('Failure');
        })
    );

    it.effect('handles invalid input schema in Drizzle repository', () =>
        Effect.gen(function* () {
            const dummyDb = {};
            const pgRepo = makeDrizzleVenueRepository(dummyDb);

            const createExit = yield* Effect.exit(pgRepo.create({ ...validCreateInput, capacity: -10 }));
            expect(createExit._tag).toBe('Failure');

            const updateExit = yield* Effect.exit(pgRepo.update(sampleTenantId, 'venue_123', { capacity: -10 }));
            expect(updateExit._tag).toBe('Failure');
        })
    );
});
