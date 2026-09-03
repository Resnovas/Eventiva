import { and, eq } from 'drizzle-orm';
import { Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import { typeId } from '@eventiva/core';
import { GDPRRequestNotFoundError, GDPRRepository, GDPRRepositoryError, GDPRValidationError } from '../repository.js';
import { CreateGDPRRequestInput, GDPRRequest } from '../schema.js';
import { gdprRequests } from './schema.js';

export function makeDrizzleGDPRRepository(db: any): GDPRRepository {
    return {
        createRequest: (input: CreateGDPRRequestInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(CreateGDPRRequestInput)(input).pipe(
                    Effect.mapError(
                        (err) => new GDPRValidationError({ message: 'Invalid CreateGDPRRequestInput', cause: err })
                    )
                );
                const now = new Date().toISOString();
                const id = typeId('gdpr_request');
                const row = {
                    id,
                    tenantId: validated.tenantId,
                    subjectId: validated.subjectId,
                    type: validated.type,
                    status: 'pending' as const,
                    details: validated.details ?? {},
                    requestedAt: now,
                    completedAt: undefined,
                };

                yield* Effect.tryPromise({
                    try: () => db.insert(gdprRequests).values(row),
                    catch: (cause) => new GDPRRepositoryError({ message: 'Failed to insert GDPR request into database', cause }),
                });

                return row as GDPRRequest;
            }),

        findById: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const rows = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(gdprRequests)
                            .where(and(eq(gdprRequests.id, id), eq(gdprRequests.tenantId, tenantId))),
                    catch: (cause) => new GDPRRepositoryError({ message: `Failed to find GDPR request ${id}`, cause }),
                });

                if (rows.length === 0) {
                    return null;
                }
                return rows[0] as GDPRRequest;
            }),

        findByTenant: (tenantId: string) =>
            Effect.gen(function* () {
                const rows = yield* Effect.tryPromise({
                    try: () => db.select().from(gdprRequests).where(eq(gdprRequests.tenantId, tenantId)),
                    catch: (cause) => new GDPRRepositoryError({ message: `Failed to list GDPR requests for tenant ${tenantId}`, cause }),
                });
                return rows as GDPRRequest[];
            }),

        updateStatus: (tenantId: string, id: string, status: GDPRRequest['status'], completedAt?: string) =>
            Effect.gen(function* () {
                yield* Effect.tryPromise({
                    try: () =>
                        db
                            .update(gdprRequests)
                            .set({ status, completedAt })
                            .where(and(eq(gdprRequests.id, id), eq(gdprRequests.tenantId, tenantId))),
                    catch: (cause) => new GDPRRepositoryError({ message: `Failed to update GDPR request ${id}`, cause }),
                });

                const updated = yield* Effect.tryPromise({
                    try: () =>
                        db
                            .select()
                            .from(gdprRequests)
                            .where(and(eq(gdprRequests.id, id), eq(gdprRequests.tenantId, tenantId))),
                    catch: (cause) => new GDPRRepositoryError({ message: `Failed to find GDPR request ${id}`, cause }),
                });

                if (updated.length === 0) {
                    return yield* Effect.fail(new GDPRRequestNotFoundError({ id, tenantId }));
                }

                return updated[0] as GDPRRequest;
            }),
    };
}
