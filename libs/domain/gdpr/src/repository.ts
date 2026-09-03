import { Context, Data, Effect } from 'effect';
import type { CreateGDPRRequestInput, GDPRRequest } from './schema.js';

export class GDPRRequestNotFoundError extends Data.TaggedError('GDPRRequestNotFoundError')<{
    readonly id: string;
    readonly tenantId: string;
}> {}

export class GDPRValidationError extends Data.TaggedError('GDPRValidationError')<{
    readonly message: string;
    readonly cause?: unknown;
}> {}

export class GDPRRepositoryError extends Data.TaggedError('GDPRRepositoryError')<{
    readonly message: string;
    readonly cause?: unknown;
}> {}

export interface GDPRRepository {
    readonly createRequest: (input: CreateGDPRRequestInput) => Effect.Effect<GDPRRequest, GDPRValidationError | GDPRRepositoryError>;
    readonly findById: (tenantId: string, id: string) => Effect.Effect<GDPRRequest | null, GDPRRepositoryError>;
    readonly findByTenant: (tenantId: string) => Effect.Effect<GDPRRequest[], GDPRRepositoryError>;
    readonly updateStatus: (
        tenantId: string,
        id: string,
        status: GDPRRequest['status'],
        completedAt?: string
    ) => Effect.Effect<GDPRRequest, GDPRRequestNotFoundError | GDPRValidationError | GDPRRepositoryError>;
}

export const GDPRRepository = Context.GenericTag<GDPRRepository>('@eventiva/domain-gdpr/GDPRRepository');
