import { Context, Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import { GDPRRequestNotFoundError, GDPRRepository, GDPRRepositoryError, GDPRValidationError } from './repository.js';
import { CreateGDPRRequestInput, GDPRRequest } from './schema.js';

export class GDPRService extends Context.Tag('@eventiva/domain-gdpr/GDPRService')<
    GDPRService,
    {
        readonly createRequest: (
            input: CreateGDPRRequestInput
        ) => Effect.Effect<GDPRRequest, GDPRValidationError | GDPRRepositoryError, GDPRRepository>;
        readonly getRequest: (
            tenantId: string,
            id: string
        ) => Effect.Effect<GDPRRequest, GDPRRequestNotFoundError | GDPRRepositoryError, GDPRRepository>;
        readonly listRequests: (
            tenantId: string
        ) => Effect.Effect<GDPRRequest[], GDPRRepositoryError, GDPRRepository>;
        readonly exportTenantData: (
            tenantId: string
        ) => Effect.Effect<Record<string, unknown>, GDPRRepositoryError>;
        readonly eraseTenantSubjectData: (
            tenantId: string,
            subjectId: string,
            hardDelete: boolean
        ) => Effect.Effect<{ erased: boolean; count: number }, GDPRRepositoryError>;
    }
>() {}

export const makeGDPRService = Effect.gen(function* () {
    const repo = yield* GDPRRepository;

    return GDPRService.of({
        createRequest: (input: CreateGDPRRequestInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(CreateGDPRRequestInput)(input).pipe(
                    Effect.mapError((err) => new GDPRValidationError({ message: 'Validation failed for CreateGDPRRequestInput', cause: err }))
                );
                return yield* repo.createRequest(validated);
            }),

        getRequest: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const req = yield* repo.findById(tenantId, id);
                if (!req) {
                    return yield* Effect.fail(new GDPRRequestNotFoundError({ id, tenantId }));
                }
                return req;
            }),

        listRequests: (tenantId: string) => repo.findByTenant(tenantId),

        exportTenantData: (tenantId: string) =>
            Effect.gen(function* () {
                // Mock export of all data associated with tenant
                return {
                    tenantId,
                    exportedAt: new Date().toISOString(),
                    contacts: [],
                    venues: [],
                    vendors: [],
                    bookings: [],
                    auditLogs: [],
                };
            }),

        eraseTenantSubjectData: (tenantId: string, subjectId: string, _hardDelete: boolean) =>
            Effect.gen(function* () {
                // Mock erasure operation removing PII for subject
                return { erased: true, count: 1 };
            }),
    });
});

export const GDPRServiceLive = Layer.effect(GDPRService, makeGDPRService);
