import { and, eq } from 'drizzle-orm';
import { Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import { typeId } from '@eventiva/core';
import { ScheduleNotFoundError, ScheduleRepository, ScheduleRepositoryError, ScheduleValidationError } from '../repository.js';
import { CreateScheduleInput, UpdateScheduleInput, Schedule } from '../schema.js';
import { schedules } from './schema.js';

export function makeDrizzleScheduleRepository(db: Record<string, unknown>): ScheduleRepository {
    return {
        create: (input: CreateScheduleInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(CreateScheduleInput)(input).pipe(
                    Effect.mapError(
                        (err) => new ScheduleValidationError({ message: 'Invalid CreateScheduleInput', cause: err })
                    )
                );
                const now = new Date().toISOString();
                const id = typeId('schedule');
                const row = {
                    id,
                    tenantId: validated.tenantId,
                    eventId: validated.eventId,
                    name: validated.name,
                    description: validated.description,
                    status: validated.status ?? 'draft',
                    entries: validated.entries ?? [],
                    rooms: validated.rooms ?? [],
                    createdAt: now,
                    updatedAt: now,
                };

                yield* Effect.tryPromise({
                    try: () => db.insert(schedules).values(row),
                    catch: (cause) => new ScheduleRepositoryError({ message: 'Failed to insert schedule into database', cause }),
                });

                return row as Schedule;
            }),

        findById: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const rows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(schedules)
                            .where(and(eq(schedules.id, id), eq(schedules.tenantId, tenantId))),
                    catch: (cause) => new ScheduleRepositoryError({ message: `Failed to find schedule ${id}`, cause }),
                });

                if (rows.length === 0) {
                    return null;
                }
                return rows[0] as Schedule;
            }),

        findByEvent: (tenantId: string, eventId: string) =>
            Effect.gen(function* () {
                const rows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(schedules)
                            .where(and(eq(schedules.tenantId, tenantId), eq(schedules.eventId, eventId))),
                    catch: (cause) => new ScheduleRepositoryError({ message: `Failed to list schedules for event ${eventId}`, cause }),
                });
                return rows as Schedule[];
            }),

        findByTenant: (tenantId: string) =>
            Effect.gen(function* () {
                const rows = yield* Effect.tryPromise({
                    try: () => db.select().from(schedules).where(eq(schedules.tenantId, tenantId)),
                    catch: (cause) => new ScheduleRepositoryError({ message: `Failed to list schedules for tenant ${tenantId}`, cause }),
                });
                return rows as Schedule[];
            }),

        update: (tenantId: string, id: string, input: UpdateScheduleInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(UpdateScheduleInput)(input).pipe(
                    Effect.mapError(
                        (err) => new ScheduleValidationError({ message: 'Invalid UpdateScheduleInput', cause: err })
                    )
                );

                const existingRows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(schedules)
                            .where(and(eq(schedules.id, id), eq(schedules.tenantId, tenantId))),
                    catch: (cause) => new ScheduleRepositoryError({ message: `Failed to find schedule ${id}`, cause }),
                });

                if (existingRows.length === 0) {
                    return yield* Effect.fail(new ScheduleNotFoundError({ id, tenantId }));
                }

                const now = new Date().toISOString();
                const updatePayload: Record<string, unknown> = {
                    updatedAt: now,
                };
                if (validated.name !== undefined) updatePayload.name = validated.name;
                if (validated.description !== undefined) updatePayload.description = validated.description;
                if (validated.status !== undefined) updatePayload.status = validated.status;
                if (validated.entries !== undefined) updatePayload.entries = validated.entries;
                if (validated.rooms !== undefined) updatePayload.rooms = validated.rooms;

                const updatedRows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .update(schedules)
                            .set(updatePayload)
                            .where(and(eq(schedules.id, id), eq(schedules.tenantId, tenantId)))
                            .returning(),
                    catch: (cause) => new ScheduleRepositoryError({ message: `Failed to update schedule ${id}`, cause }),
                });

                return updatedRows[0] as Schedule;
            }),

        delete: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const existingRows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(schedules)
                            .where(and(eq(schedules.id, id), eq(schedules.tenantId, tenantId))),
                    catch: (cause) => new ScheduleRepositoryError({ message: `Failed to find schedule ${id}`, cause }),
                });

                if (existingRows.length === 0) {
                    return yield* Effect.fail(new ScheduleNotFoundError({ id, tenantId }));
                }

                yield* Effect.tryPromise({
                    try: () => db.delete(schedules).where(and(eq(schedules.id, id), eq(schedules.tenantId, tenantId))),
                    catch: (cause) => new ScheduleRepositoryError({ message: `Failed to delete schedule ${id}`, cause }),
                });
            }),
    };
}

export function makeInMemoryScheduleRepository(): ScheduleRepository {
    const store = new Map<string, Schedule>();

    return {
        create: (input: CreateScheduleInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(CreateScheduleInput)(input).pipe(
                    Effect.mapError(
                        (err) => new ScheduleValidationError({ message: 'Invalid CreateScheduleInput', cause: err })
                    )
                );
                const now = new Date().toISOString();
                const id = typeId('schedule');
                const schedule: Schedule = {
                    id,
                    tenantId: validated.tenantId,
                    eventId: validated.eventId,
                    name: validated.name,
                    description: validated.description,
                    status: validated.status ?? 'draft',
                    entries: validated.entries ?? [],
                    rooms: validated.rooms ?? [],
                    createdAt: now,
                    updatedAt: now,
                };
                store.set(`${validated.tenantId}:${id}`, schedule);
                return schedule;
            }),

        findById: (tenantId: string, id: string) =>
            Effect.succeed(store.get(`${tenantId}:${id}`) ?? null),

        findByEvent: (tenantId: string, eventId: string) =>
            Effect.sync(() =>
                Array.from(store.values()).filter((s) => s.tenantId === tenantId && s.eventId === eventId)
            ),

        findByTenant: (tenantId: string) =>
            Effect.sync(() =>
                Array.from(store.values()).filter((s) => s.tenantId === tenantId)
            ),

        update: (tenantId: string, id: string, input: UpdateScheduleInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(UpdateScheduleInput)(input).pipe(
                    Effect.mapError(
                        (err) => new ScheduleValidationError({ message: 'Invalid UpdateScheduleInput', cause: err })
                    )
                );
                const key = `${tenantId}:${id}`;
                const existing = store.get(key);
                if (!existing) {
                    return yield* Effect.fail(new ScheduleNotFoundError({ id, tenantId }));
                }

                const updated: Schedule = {
                    ...existing,
                    ...(validated.name !== undefined && { name: validated.name }),
                    ...(validated.description !== undefined && { description: validated.description }),
                    ...(validated.status !== undefined && { status: validated.status }),
                    ...(validated.entries !== undefined && { entries: validated.entries }),
                    ...(validated.rooms !== undefined && { rooms: validated.rooms }),
                    updatedAt: new Date().toISOString(),
                };
                store.set(key, updated);
                return updated;
            }),

        delete: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const key = `${tenantId}:${id}`;
                if (!store.has(key)) {
                    return yield* Effect.fail(new ScheduleNotFoundError({ id, tenantId }));
                }
                store.delete(key);
            }),
    };
}

export const ScheduleRepositoryInMemoryLive = Layer.succeed(
    ScheduleRepository,
    makeInMemoryScheduleRepository()
);
