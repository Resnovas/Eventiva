import { and, eq } from 'drizzle-orm';
import { Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import { typeId } from '@eventiva/core';
import { EventNotFoundError, EventRepository, EventRepositoryError, EventValidationError } from '../repository.js';
import { CreateEventInput, UpdateEventInput, Event } from '../schema.js';
import { events } from './schema.js';

export function makeDrizzleEventRepository(db: any): EventRepository {
    return {
        create: (input: CreateEventInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(CreateEventInput)(input).pipe(
                    Effect.mapError(
                        (err) => new EventValidationError({ message: 'Invalid CreateEventInput', cause: err })
                    )
                );
                const now = new Date().toISOString();
                const id = typeId('event');
                const row = {
                    id,
                    tenantId: validated.tenantId,
                    name: validated.name,
                    description: validated.description ?? '',
                    eventType: validated.eventType,
                    status: validated.status ?? 'planned',
                    venueId: validated.venueId ?? null,
                    startDate: validated.startDate,
                    endDate: validated.endDate,
                    expectedAttendees: validated.expectedAttendees ?? null,
                    budget: validated.budget ?? null,
                    ownerId: validated.ownerId,
                    tags: validated.tags ?? [],
                    createdAt: now,
                    updatedAt: now,
                };

                yield* Effect.tryPromise({
                    try: () => db.insert(events).values(row),
                    catch: (cause) => new EventRepositoryError({ message: 'Failed to insert event into database', cause }),
                });

                return row as unknown as Event;
            }),

        findById: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const rows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(events)
                            .where(and(eq(events.id, id), eq(events.tenantId, tenantId))),
                    catch: (cause) => new EventRepositoryError({ message: `Failed to find event ${id}`, cause }),
                });

                if (rows.length === 0) {
                    return null;
                }
                return rows[0] as unknown as Event;
            }),

        findByTenant: (tenantId: string) =>
            Effect.gen(function* () {
                const rows = yield* Effect.tryPromise({
                    try: () => db.select().from(events).where(eq(events.tenantId, tenantId)),
                    catch: (cause) => new EventRepositoryError({ message: `Failed to list events for tenant ${tenantId}`, cause }),
                });
                return rows as unknown as Event[];
            }),

        findByVenue: (tenantId: string, venueId: string) =>
            Effect.gen(function* () {
                const rows = yield* Effect.tryPromise({
                    try: () => db.select().from(events).where(and(eq(events.tenantId, tenantId), eq(events.venueId, venueId))),
                    catch: (cause) => new EventRepositoryError({ message: `Failed to list events for venue ${venueId}`, cause }),
                });
                return rows as unknown as Event[];
            }),

        update: (tenantId: string, id: string, input: UpdateEventInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(UpdateEventInput)(input).pipe(
                    Effect.mapError(
                        (err) => new EventValidationError({ message: 'Invalid UpdateEventInput', cause: err })
                    )
                );

                const existingRows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(events)
                            .where(and(eq(events.id, id), eq(events.tenantId, tenantId))),
                    catch: (cause) => new EventRepositoryError({ message: `Failed to find event ${id}`, cause }),
                });

                if (existingRows.length === 0) {
                    return yield* Effect.fail(new EventNotFoundError({ id, tenantId }));
                }

                const now = new Date().toISOString();
                const updatePayload: Record<string, unknown> = {
                    updatedAt: now,
                };
                if (validated.name !== undefined) updatePayload.name = validated.name;
                if (validated.description !== undefined) updatePayload.description = validated.description;
                if (validated.eventType !== undefined) updatePayload.eventType = validated.eventType;
                if (validated.status !== undefined) updatePayload.status = validated.status;
                if (validated.venueId !== undefined) updatePayload.venueId = validated.venueId;
                if (validated.startDate !== undefined) updatePayload.startDate = validated.startDate;
                if (validated.endDate !== undefined) updatePayload.endDate = validated.endDate;
                if (validated.expectedAttendees !== undefined) updatePayload.expectedAttendees = validated.expectedAttendees;
                if (validated.budget !== undefined) updatePayload.budget = validated.budget;
                if (validated.ownerId !== undefined) updatePayload.ownerId = validated.ownerId;
                if (validated.tags !== undefined) updatePayload.tags = validated.tags;

                const updatedRows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .update(events)
                            .set(updatePayload)
                            .where(and(eq(events.id, id), eq(events.tenantId, tenantId)))
                            .returning(),
                    catch: (cause) => new EventRepositoryError({ message: `Failed to update event ${id}`, cause }),
                });

                return updatedRows[0] as unknown as Event;
            }),

        delete: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const existingRows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(events)
                            .where(and(eq(events.id, id), eq(events.tenantId, tenantId))),
                    catch: (cause) => new EventRepositoryError({ message: `Failed to find event ${id}`, cause }),
                });

                if (existingRows.length === 0) {
                    return yield* Effect.fail(new EventNotFoundError({ id, tenantId }));
                }

                yield* Effect.tryPromise({
                    try: () => db.delete(events).where(and(eq(events.id, id), eq(events.tenantId, tenantId))),
                    catch: (cause) => new EventRepositoryError({ message: `Failed to delete event ${id}`, cause }),
                });
            }),
    };
}

export function makeInMemoryEventRepository(): EventRepository {
    const store = new Map<string, Event>();

    return {
        create: (input: CreateEventInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(CreateEventInput)(input).pipe(
                    Effect.mapError(
                        (err) => new EventValidationError({ message: 'Invalid CreateEventInput', cause: err })
                    )
                );
                const now = new Date().toISOString();
                const id = typeId('event');
                const event: Event = {
                    id: id as any,
                    tenantId: validated.tenantId,
                    name: validated.name,
                    description: validated.description ?? '',
                    eventType: validated.eventType,
                    status: validated.status ?? 'planned',
                    venueId: validated.venueId,
                    startDate: validated.startDate,
                    endDate: validated.endDate,
                    expectedAttendees: validated.expectedAttendees,
                    budget: validated.budget,
                    ownerId: validated.ownerId,
                    tags: validated.tags ?? [],
                    createdAt: now,
                    updatedAt: now,
                };
                store.set(`${validated.tenantId}:${id}`, event);
                return event;
            }),

        findById: (tenantId: string, id: string) =>
            Effect.succeed(store.get(`${tenantId}:${id}`) ?? null),

        findByTenant: (tenantId: string) =>
            Effect.sync(() =>
                Array.from(store.values()).filter((v) => v.tenantId === tenantId)
            ),

        findByVenue: (tenantId: string, venueId: string) =>
            Effect.sync(() =>
                Array.from(store.values()).filter((v) => v.tenantId === tenantId && v.venueId === venueId)
            ),

        update: (tenantId: string, id: string, input: UpdateEventInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(UpdateEventInput)(input).pipe(
                    Effect.mapError(
                        (err) => new EventValidationError({ message: 'Invalid UpdateEventInput', cause: err })
                    )
                );
                const key = `${tenantId}:${id}`;
                const existing = store.get(key);
                if (!existing) {
                    return yield* Effect.fail(new EventNotFoundError({ id, tenantId }));
                }

                const updated: Event = {
                    ...existing,
                    ...(validated.name !== undefined && { name: validated.name }),
                    ...(validated.description !== undefined && { description: validated.description }),
                    ...(validated.eventType !== undefined && { eventType: validated.eventType }),
                    ...(validated.status !== undefined && { status: validated.status }),
                    ...(validated.venueId !== undefined && { venueId: validated.venueId }),
                    ...(validated.startDate !== undefined && { startDate: validated.startDate }),
                    ...(validated.endDate !== undefined && { endDate: validated.endDate }),
                    ...(validated.expectedAttendees !== undefined && { expectedAttendees: validated.expectedAttendees }),
                    ...(validated.budget !== undefined && { budget: validated.budget }),
                    ...(validated.ownerId !== undefined && { ownerId: validated.ownerId }),
                    ...(validated.tags !== undefined && { tags: validated.tags }),
                    updatedAt: new Date().toISOString(),
                };
                store.set(key, updated);
                return updated;
            }),

        delete: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const key = `${tenantId}:${id}`;
                if (!store.has(key)) {
                    return yield* Effect.fail(new EventNotFoundError({ id, tenantId }));
                }
                store.delete(key);
            }),
    };
}

export const EventRepositoryInMemoryLive = Layer.succeed(
    EventRepository,
    makeInMemoryEventRepository()
);
