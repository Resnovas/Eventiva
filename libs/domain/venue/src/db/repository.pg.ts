import { and, eq } from 'drizzle-orm';
import { Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import { typeId } from '@eventiva/core';
import { VenueNotFoundError, VenueRepository, VenueRepositoryError, VenueValidationError } from '../repository.js';
import { CreateVenueInput, UpdateVenueInput, Venue } from '../schema.js';
import { venues } from './schema.js';

export function makeDrizzleVenueRepository(db: any): VenueRepository {
    return {
        create: (input: CreateVenueInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(CreateVenueInput)(input).pipe(
                    Effect.mapError(
                        (err) => new VenueValidationError({ message: 'Invalid CreateVenueInput', cause: err })
                    )
                );
                const now = new Date().toISOString();
                const id = typeId('venue');
                const row = {
                    id,
                    tenantId: validated.tenantId,
                    name: validated.name,
                    description: validated.description ?? '',
                    address: validated.address,
                    capacity: validated.capacity,
                    amenities: validated.amenities ?? [],
                    status: validated.status ?? 'active',
                    pricing: validated.pricing,
                    contactId: validated.contactId,
                    createdAt: now,
                    updatedAt: now,
                };

                yield* Effect.tryPromise({
                    try: () => db.insert(venues).values(row),
                    catch: (cause) => new VenueRepositoryError({ message: 'Failed to insert venue into database', cause }),
                });

                return row as Venue;
            }),

        findById: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const rows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(venues)
                            .where(and(eq(venues.id, id), eq(venues.tenantId, tenantId))),
                    catch: (cause) => new VenueRepositoryError({ message: `Failed to find venue ${id}`, cause }),
                });

                if (rows.length === 0) {
                    return null;
                }
                return rows[0] as Venue;
            }),

        findByTenant: (tenantId: string) =>
            Effect.gen(function* () {
                const rows = yield* Effect.tryPromise({
                    try: () => db.select().from(venues).where(eq(venues.tenantId, tenantId)),
                    catch: (cause) => new VenueRepositoryError({ message: `Failed to list venues for tenant ${tenantId}`, cause }),
                });
                return rows as Venue[];
            }),

        update: (tenantId: string, id: string, input: UpdateVenueInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(UpdateVenueInput)(input).pipe(
                    Effect.mapError(
                        (err) => new VenueValidationError({ message: 'Invalid UpdateVenueInput', cause: err })
                    )
                );

                const existingRows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(venues)
                            .where(and(eq(venues.id, id), eq(venues.tenantId, tenantId))),
                    catch: (cause) => new VenueRepositoryError({ message: `Failed to find venue ${id}`, cause }),
                });

                if (existingRows.length === 0) {
                    return yield* Effect.fail(new VenueNotFoundError({ id, tenantId }));
                }

                const now = new Date().toISOString();
                const updatePayload: Record<string, unknown> = {
                    updatedAt: now,
                };
                if (validated.name !== undefined) updatePayload.name = validated.name;
                if (validated.description !== undefined) updatePayload.description = validated.description;
                if (validated.address !== undefined) updatePayload.address = validated.address;
                if (validated.capacity !== undefined) updatePayload.capacity = validated.capacity;
                if (validated.amenities !== undefined) updatePayload.amenities = validated.amenities;
                if (validated.status !== undefined) updatePayload.status = validated.status;
                if (validated.pricing !== undefined) updatePayload.pricing = validated.pricing;
                if (validated.contactId !== undefined) updatePayload.contactId = validated.contactId;

                const updatedRows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .update(venues)
                            .set(updatePayload)
                            .where(and(eq(venues.id, id), eq(venues.tenantId, tenantId)))
                            .returning(),
                    catch: (cause) => new VenueRepositoryError({ message: `Failed to update venue ${id}`, cause }),
                });

                return updatedRows[0] as Venue;
            }),

        delete: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const existingRows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(venues)
                            .where(and(eq(venues.id, id), eq(venues.tenantId, tenantId))),
                    catch: (cause) => new VenueRepositoryError({ message: `Failed to find venue ${id}`, cause }),
                });

                if (existingRows.length === 0) {
                    return yield* Effect.fail(new VenueNotFoundError({ id, tenantId }));
                }

                yield* Effect.tryPromise({
                    try: () => db.delete(venues).where(and(eq(venues.id, id), eq(venues.tenantId, tenantId))),
                    catch: (cause) => new VenueRepositoryError({ message: `Failed to delete venue ${id}`, cause }),
                });
            }),
    };
}

export function makeInMemoryVenueRepository(): VenueRepository {
    const store = new Map<string, Venue>();

    return {
        create: (input: CreateVenueInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(CreateVenueInput)(input).pipe(
                    Effect.mapError(
                        (err) => new VenueValidationError({ message: 'Invalid CreateVenueInput', cause: err })
                    )
                );
                const now = new Date().toISOString();
                const id = typeId('venue');
                const venue: Venue = {
                    id,
                    tenantId: validated.tenantId,
                    name: validated.name,
                    description: validated.description ?? '',
                    address: validated.address,
                    capacity: validated.capacity,
                    amenities: validated.amenities ?? [],
                    status: validated.status ?? 'active',
                    pricing: validated.pricing,
                    contactId: validated.contactId,
                    createdAt: now,
                    updatedAt: now,
                };
                store.set(`${validated.tenantId}:${id}`, venue);
                return venue;
            }),

        findById: (tenantId: string, id: string) =>
            Effect.succeed(store.get(`${tenantId}:${id}`) ?? null),

        findByTenant: (tenantId: string) =>
            Effect.sync(() =>
                Array.from(store.values()).filter((v) => v.tenantId === tenantId)
            ),

        update: (tenantId: string, id: string, input: UpdateVenueInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(UpdateVenueInput)(input).pipe(
                    Effect.mapError(
                        (err) => new VenueValidationError({ message: 'Invalid UpdateVenueInput', cause: err })
                    )
                );
                const key = `${tenantId}:${id}`;
                const existing = store.get(key);
                if (!existing) {
                    return yield* Effect.fail(new VenueNotFoundError({ id, tenantId }));
                }

                const updated: Venue = {
                    ...existing,
                    ...(validated.name !== undefined && { name: validated.name }),
                    ...(validated.description !== undefined && { description: validated.description }),
                    ...(validated.address !== undefined && { address: validated.address }),
                    ...(validated.capacity !== undefined && { capacity: validated.capacity }),
                    ...(validated.amenities !== undefined && { amenities: validated.amenities }),
                    ...(validated.status !== undefined && { status: validated.status }),
                    ...(validated.pricing !== undefined && { pricing: validated.pricing }),
                    ...(validated.contactId !== undefined && { contactId: validated.contactId }),
                    updatedAt: new Date().toISOString(),
                };
                store.set(key, updated);
                return updated;
            }),

        delete: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const key = `${tenantId}:${id}`;
                if (!store.has(key)) {
                    return yield* Effect.fail(new VenueNotFoundError({ id, tenantId }));
                }
                store.delete(key);
            }),
    };
}

export const VenueRepositoryInMemoryLive = Layer.succeed(
    VenueRepository,
    makeInMemoryVenueRepository()
);
