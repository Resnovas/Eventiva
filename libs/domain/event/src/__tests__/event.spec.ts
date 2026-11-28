import { describe, expect, it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import { typeId } from '@eventiva/core';
import { CreateEventInput, Event, EventStatus, UpdateEventInput } from '../schema.js';
import { EventDateConflictError, EventInvalidStatusTransitionError, EventNotFoundError, EventRepository } from '../repository.js';
import { makeDrizzleEventRepository, makeInMemoryEventRepository } from '../db/repository.pg.ts';
import { EventService, EventServiceLive } from '../service.js';

const sampleTenantId = typeId('tenant');
const sampleOwnerId = typeId('contact');
const sampleVenueId = typeId('venue');

const validCreateInput: CreateEventInput = {
    tenantId: sampleTenantId,
    name: 'Summer Festival 2026',
    description: 'Annual music & arts festival',
    eventType: 'festival',
    status: 'planned',
    venueId: sampleVenueId,
    startDate: '2026-07-10T10:00:00Z',
    endDate: '2026-07-12T22:00:00Z',
    expectedAttendees: 5000,
    budget: { amount: 150000, currency: 'USD' },
    ownerId: sampleOwnerId,
    tags: ['outdoor', 'music'],
};

describe('Event Schema Validation', () => {
    it.effect('validates correct CreateEventInput and decodes', () =>
        Effect.gen(function* () {
            const decoded = yield* Schema.decodeUnknown(CreateEventInput)(validCreateInput);
            expect(decoded.name).toBe('Summer Festival 2026');
            expect(decoded.eventType).toBe('festival');
            expect(decoded.status).toBe('planned');
            expect(decoded.venueId).toBe(sampleVenueId);
        })
    );

    it.effect('fails validation for invalid fields', () =>
        Effect.gen(function* () {
            const invalidDates = yield* Effect.exit(
                Schema.decodeUnknown(CreateEventInput)({
                    ...validCreateInput,
                    startDate: 'not-a-date',
                })
            );
            expect(invalidDates._tag).toBe('Failure');

            const invalidTenantId = yield* Effect.exit(
                Schema.decodeUnknown(CreateEventInput)({
                    ...validCreateInput,
                    tenantId: 'invalid_tenant',
                })
            );
            expect(invalidTenantId._tag).toBe('Failure');

            const negativeAttendees = yield* Effect.exit(
                Schema.decodeUnknown(CreateEventInput)({
                    ...validCreateInput,
                    expectedAttendees: -10,
                })
            );
            expect(negativeAttendees._tag).toBe('Failure');
        })
    );
});

describe('EventRepository (InMemory)', () => {
    it.effect('creates and finds event', () =>
        Effect.gen(function* () {
            const repo = makeInMemoryEventRepository();
            const created = yield* repo.create(validCreateInput);
            expect(created.name).toBe(validCreateInput.name);

            const found = yield* repo.findById(sampleTenantId, created.id);
            expect(found).not.toBeNull();
            expect(found?.id).toBe(created.id);

            const list = yield* repo.findByTenant(sampleTenantId);
            expect(list.length).toBe(1);

            const byVenue = yield* repo.findByVenue(sampleTenantId, sampleVenueId);
            expect(byVenue.length).toBe(1);
        })
    );

    it.effect('updates and deletes event', () =>
        Effect.gen(function* () {
            const repo = makeInMemoryEventRepository();
            const created = yield* repo.create(validCreateInput);
            const updated = yield* repo.update(sampleTenantId, created.id, { name: 'Updated Festival Name' });
            expect(updated.name).toBe('Updated Festival Name');

            yield* repo.delete(sampleTenantId, created.id);
            const found = yield* repo.findById(sampleTenantId, created.id);
            expect(found).toBeNull();
        })
    );

    it.effect('returns EventNotFoundError when deleting/updating non-existent', () =>
        Effect.gen(function* () {
            const repo = makeInMemoryEventRepository();
            const updateExit = yield* Effect.exit(repo.update(sampleTenantId, 'event_nonexistent', { name: 'New' }));
            expect(updateExit._tag).toBe('Failure');

            const deleteExit = yield* Effect.exit(repo.delete(sampleTenantId, 'event_nonexistent'));
            expect(deleteExit._tag).toBe('Failure');
        })
    );
});

describe('EventService Business Logic', () => {
    it.effect('fails createEvent if startDate >= endDate', () => {
        const repo = makeInMemoryEventRepository();
        const layer = Layer.provide(EventServiceLive, Layer.succeed(EventRepository, repo));
        return Effect.gen(function* () {
            const service = yield* EventService;
            const exit = yield* Effect.exit(
                service.createEvent({
                    ...validCreateInput,
                    startDate: '2026-07-12T22:00:00Z',
                    endDate: '2026-07-10T10:00:00Z',
                })
            );
            expect(exit._tag).toBe('Failure');
        }).pipe(Effect.provide(layer));
    });

    it.effect('detects date conflict for same venue', () => {
        const repo = makeInMemoryEventRepository();
        const layer = Layer.provide(EventServiceLive, Layer.succeed(EventRepository, repo));
        return Effect.gen(function* () {
            const service = yield* EventService;
            yield* service.createEvent(validCreateInput);

            // Overlapping event for same venue on same dates
            const conflictingInput: CreateEventInput = {
                ...validCreateInput,
                name: 'Conflicting Tech Conference',
                startDate: '2026-07-11T10:00:00Z',
                endDate: '2026-07-13T10:00:00Z',
            };

            const exit = yield* Effect.exit(service.createEvent(conflictingInput));
            expect(exit._tag).toBe('Failure');
        }).pipe(Effect.provide(layer));
    });

    it.effect('allows non-overlapping event for same venue', () => {
        const repo = makeInMemoryEventRepository();
        const layer = Layer.provide(EventServiceLive, Layer.succeed(EventRepository, repo));
        return Effect.gen(function* () {
            const service = yield* EventService;
            const nonOverlapping: CreateEventInput = {
                ...validCreateInput,
                name: 'Next Month Expo',
                startDate: '2026-08-01T10:00:00Z',
                endDate: '2026-08-05T10:00:00Z',
            };

            const created = yield* service.createEvent(nonOverlapping);
            expect(created.name).toBe('Next Month Expo');
        }).pipe(Effect.provide(layer));
    });

    it.effect('enforces status lifecycle transitions', () => {
        const repo = makeInMemoryEventRepository();
        const layer = Layer.provide(EventServiceLive, Layer.succeed(EventRepository, repo));
        return Effect.gen(function* () {
            const service = yield* EventService;
            const event = yield* service.createEvent(validCreateInput);
            expect(event.status).toBe('planned');

            // Transition planned -> confirmed (valid)
            const confirmed = yield* service.updateEvent(sampleTenantId, event.id, { status: 'confirmed' });
            expect(confirmed.status).toBe('confirmed');

            // Transition confirmed -> in_progress (valid)
            const inProgress = yield* service.updateEvent(sampleTenantId, event.id, { status: 'in_progress' });
            expect(inProgress.status).toBe('in_progress');

            // Transition in_progress -> completed (valid)
            const completed = yield* service.updateEvent(sampleTenantId, event.id, { status: 'completed' });
            expect(completed.status).toBe('completed');

            // Transition completed -> in_progress (invalid — completed is terminal)
            const invalidExit = yield* Effect.exit(
                service.updateEvent(sampleTenantId, event.id, { status: 'in_progress' })
            );
            expect(invalidExit._tag).toBe('Failure');
        }).pipe(Effect.provide(layer));
    });

    it.effect('getEvent returns EventNotFoundError for non-existent', () => {
        const repo = makeInMemoryEventRepository();
        const layer = Layer.provide(EventServiceLive, Layer.succeed(EventRepository, repo));
        return Effect.gen(function* () {
            const service = yield* EventService;
            const exit = yield* Effect.exit(service.getEvent(sampleTenantId, 'event_nonexistent'));
            expect(exit._tag).toBe('Failure');
        }).pipe(Effect.provide(layer));
    });
});

describe('makeDrizzleEventRepository Error Handling', () => {
    it.effect('handles db errors gracefully', () =>
        Effect.gen(function* () {
            const failingDb = {
                insert: () => ({ values: () => Promise.reject(new Error('Insert error')) }),
                select: () => ({ from: () => ({ where: () => Promise.reject(new Error('Select error')) }) }),
                update: () => ({ set: () => ({ where: () => ({ returning: () => Promise.reject(new Error('Update error')) }) }) }),
                delete: () => ({ where: () => Promise.reject(new Error('Delete error')) }),
            };
            const pgRepo = makeDrizzleEventRepository(failingDb);

            const createExit = yield* Effect.exit(pgRepo.create(validCreateInput));
            expect(createExit._tag).toBe('Failure');

            const findExit = yield* Effect.exit(pgRepo.findById(sampleTenantId, 'event_123'));
            expect(findExit._tag).toBe('Failure');

            const listExit = yield* Effect.exit(pgRepo.findByTenant(sampleTenantId));
            expect(listExit._tag).toBe('Failure');
        })
    );
});