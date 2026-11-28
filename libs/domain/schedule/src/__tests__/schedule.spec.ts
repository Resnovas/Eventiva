import { describe, expect, it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import { typeId } from '@eventiva/core';
import {
    CreateScheduleInput,
    Room,
    Schedule,
    ScheduleEntry,
    UpdateScheduleInput,
} from '../schema.js';
import {
    ScheduleRepository,
} from '../repository.js';
import {
    makeInMemoryScheduleRepository,
} from '../db/repository.pg.js';
import { makeScheduleService } from '../service.js';

const sampleTenantId = typeId('tenant');
const sampleEventId = typeId('event');

const validRoom: Room = {
    id: typeId('room'),
    name: 'Main Hall',
    capacity: 500,
    location: 'Floor 1',
};

const validScheduleEntry: ScheduleEntry = {
    id: typeId('schedule_entry'),
    title: 'Opening Keynote',
    description: 'Welcome and opening remarks',
    entryType: 'keynote',
    startTime: '2026-09-10T09:00:00Z',
    endTime: '2026-09-10T10:00:00Z',
    roomId: typeId('room'),
    speakerIds: [typeId('contact')],
};

const validCreateInput: CreateScheduleInput = {
    tenantId: sampleTenantId,
    eventId: sampleEventId,
    name: 'Tech Conference 2026 Schedule',
    description: 'Full schedule for the conference',
    status: 'draft',
    entries: [validScheduleEntry],
    rooms: [validRoom],
};

describe('Schedule Domain', () => {
    describe('Schema Validation', () => {
        it.effect('validates correct Schedule structure', () =>
            Effect.gen(function* () {
                const now = new Date().toISOString();
                const validSchedule: Schedule = {
                    id: typeId('schedule'),
                    tenantId: sampleTenantId,
                    eventId: sampleEventId,
                    name: 'Conference Schedule',
                    status: 'draft',
                    entries: [validScheduleEntry],
                    rooms: [validRoom],
                    createdAt: now,
                    updatedAt: now,
                };

                const result = yield* Schema.decodeUnknown(Schedule)(validSchedule);
                expect(result.name).toBe('Conference Schedule');
                expect(result.entries).toHaveLength(1);
                expect(result.rooms).toHaveLength(1);
            })
        );

        it.effect('validates CreateScheduleInput', () =>
            Effect.gen(function* () {
                const result = yield* Schema.decodeUnknown(CreateScheduleInput)(validCreateInput);
                expect(result.tenantId).toBe(sampleTenantId);
                expect(result.eventId).toBe(sampleEventId);
            })
        );

        it.effect('fails validation for empty name', () =>
            Effect.gen(function* () {
                const invalidInput = { ...validCreateInput, name: '' };
                const result = yield* Effect.exit(Schema.decodeUnknown(CreateScheduleInput)(invalidInput));
                expect(result._tag).toBe('Failure');
            })
        );

        it.effect('fails validation for invalid typeId prefix on entry', () =>
            Effect.gen(function* () {
                const badEntry = { ...validScheduleEntry, id: 'wrong-prefix' };
                const invalidInput = { ...validCreateInput, entries: [badEntry] };
                const result = yield* Effect.exit(Schema.decodeUnknown(CreateScheduleInput)(invalidInput));
                expect(result._tag).toBe('Failure');
            })
        );

        it.effect('fails validation for invalid room capacity', () =>
            Effect.gen(function* () {
                const invalidRoom = { ...validRoom, capacity: -1 };
                const invalidInput = { ...validCreateInput, rooms: [invalidRoom] };
                const result = yield* Effect.exit(Schema.decodeUnknown(CreateScheduleInput)(invalidInput));
                expect(result._tag).toBe('Failure');
            })
        );
    });

    describe('In-Memory Repository', () => {
        it.effect('creates a schedule', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                const created = yield* repo.create(validCreateInput);
                expect(created.id).toBeDefined();
                expect(created.id).toMatch(/^schedule_/);
                expect(created.name).toBe(validCreateInput.name);
                expect(created.tenantId).toBe(sampleTenantId);
            })
        );

        it.effect('finds schedule by ID', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                const created = yield* repo.create(validCreateInput);
                const found = yield* repo.findById(sampleTenantId, created.id);
                expect(found).not.toBeNull();
                expect(found?.name).toBe(validCreateInput.name);
            })
        );

        it.effect('returns null for non-existent schedule', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                const found = yield* repo.findById(sampleTenantId, typeId('schedule'));
                expect(found).toBeNull();
            })
        );

        it.effect('finds schedules by event', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                yield* repo.create(validCreateInput);
                const found = yield* repo.findByEvent(sampleTenantId, sampleEventId);
                expect(found).toHaveLength(1);
            })
        );

        it.effect('lists schedules by tenant', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                yield* repo.create(validCreateInput);
                const found = yield* repo.findByTenant(sampleTenantId);
                expect(found.length).toBeGreaterThan(0);
            })
        );

        it.effect('updates a schedule', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                const created = yield* repo.create(validCreateInput);
                const updateInput: UpdateScheduleInput = { name: 'Updated Schedule Name' };
                const updated = yield* repo.update(sampleTenantId, created.id, updateInput);
                expect(updated.name).toBe('Updated Schedule Name');
            })
        );

        it.effect('deletes a schedule', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                const created = yield* repo.create(validCreateInput);
                yield* repo.delete(sampleTenantId, created.id);
                const found = yield* repo.findById(sampleTenantId, created.id);
                expect(found).toBeNull();
            })
        );
    });

    describe('Service Layer', () => {
        it.effect('creates schedule through service', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                const service = yield* makeScheduleService.pipe(Effect.provide(Layer.succeed(ScheduleRepository, repo)));
                const created = yield* service.createSchedule(validCreateInput);
                expect(created.id).toMatch(/^schedule_/);
                expect(created.name).toBe(validCreateInput.name);
            })
        );

        it.effect('retrieves schedule through service', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                const service = yield* makeScheduleService.pipe(Effect.provide(Layer.succeed(ScheduleRepository, repo)));
                const created = yield* service.createSchedule(validCreateInput);
                const retrieved = yield* service.getSchedule(sampleTenantId, created.id);
                expect(retrieved.id).toBe(created.id);
            })
        );

        it.effect('lists schedules by event through service', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                const service = yield* makeScheduleService.pipe(Effect.provide(Layer.succeed(ScheduleRepository, repo)));
                yield* service.createSchedule(validCreateInput);
                const listed = yield* service.listSchedulesByEvent(sampleTenantId, sampleEventId);
                expect(listed.length).toBeGreaterThan(0);
            })
        );

        it.effect('updates schedule through service', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                const service = yield* makeScheduleService.pipe(Effect.provide(Layer.succeed(ScheduleRepository, repo)));
                const created = yield* service.createSchedule(validCreateInput);
                const updated = yield* service.updateSchedule(sampleTenantId, created.id, { status: 'published' });
                expect(updated.status).toBe('published');
            })
        );

        it.effect('fails to get non-existent schedule', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                const service = yield* makeScheduleService.pipe(Effect.provide(Layer.succeed(ScheduleRepository, repo)));
                const result = yield* Effect.exit(service.getSchedule(sampleTenantId, typeId('schedule')));
                expect(result._tag).toBe('Failure');
            })
        );
    });

    describe('Tenant Isolation', () => {
        it.effect('enforces tenant isolation', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                const created = yield* repo.create(validCreateInput);

                const otherTenantId = typeId('tenant');
                const found = yield* repo.findById(otherTenantId, created.id);
                expect(found).toBeNull();
            })
        );

        it.effect('prevents cross-tenant updates', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                const created = yield* repo.create(validCreateInput);

                const otherTenantId = typeId('tenant');
                const result = yield* Effect.exit(
                    repo.update(otherTenantId, created.id, { name: 'Hacked' })
                );
                expect(result._tag).toBe('Failure');
            })
        );
    });

    describe('Validation Through Repository', () => {
        it.effect('fails createSchedule on invalid input schema', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                const service = yield* makeScheduleService.pipe(Effect.provide(Layer.succeed(ScheduleRepository, repo)));

                const exit = yield* Effect.exit(service.createSchedule({ ...validCreateInput, name: '' }));
                expect(exit._tag).toBe('Failure');
            })
        );

        it.effect('fails updateSchedule on invalid update input schema', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                const service = yield* makeScheduleService.pipe(Effect.provide(Layer.succeed(ScheduleRepository, repo)));
                const created = yield* service.createSchedule(validCreateInput);

                const exit = yield* Effect.exit(service.updateSchedule(sampleTenantId, created.id, { name: '' }));
                expect(exit._tag).toBe('Failure');
            })
        );

        it.effect('fails delete on non-existent schedule', () =>
            Effect.gen(function* () {
                const repo = makeInMemoryScheduleRepository();
                const service = yield* makeScheduleService.pipe(Effect.provide(Layer.succeed(ScheduleRepository, repo)));

                const exit = yield* Effect.exit(service.deleteSchedule(sampleTenantId, typeId('schedule')));
                expect(exit._tag).toBe('Failure');
            })
        );
    });
});
