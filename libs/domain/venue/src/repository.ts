import { Context, Data, Effect } from 'effect';
import type { CreateVenueInput, UpdateVenueInput, Venue } from './schema.js';

export class VenueNotFoundError extends Data.TaggedError('VenueNotFoundError')<{
    readonly id: string;
    readonly tenantId: string;
}> {}

export class VenueValidationError extends Data.TaggedError('VenueValidationError')<{
    readonly message: string;
    readonly cause?: unknown;
}> {}

export class VenueRepositoryError extends Data.TaggedError('VenueRepositoryError')<{
    readonly message: string;
    readonly cause?: unknown;
}> {}

export interface VenueRepository {
    readonly create: (input: CreateVenueInput) => Effect.Effect<Venue, VenueValidationError | VenueRepositoryError>;
    readonly findById: (tenantId: string, id: string) => Effect.Effect<Venue | null, VenueRepositoryError>;
    readonly findByTenant: (tenantId: string) => Effect.Effect<Venue[], VenueRepositoryError>;
    readonly update: (
        tenantId: string,
        id: string,
        input: UpdateVenueInput
    ) => Effect.Effect<Venue, VenueNotFoundError | VenueValidationError | VenueRepositoryError>;
    readonly delete: (tenantId: string, id: string) => Effect.Effect<void, VenueNotFoundError | VenueRepositoryError>;
}

export const VenueRepository = Context.GenericTag<VenueRepository>('@eventiva/domain-venue/VenueRepository');
