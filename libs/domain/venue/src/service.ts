import { Context, Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import { VenueNotFoundError, VenueRepository, VenueRepositoryError, VenueValidationError } from './repository.js';
import { CreateVenueInput, UpdateVenueInput, Venue } from './schema.js';

export class VenueService extends Context.Tag('@eventiva/domain-venue/VenueService')<
    VenueService,
    {
        readonly createVenue: (
            input: CreateVenueInput
        ) => Effect.Effect<Venue, VenueValidationError | VenueRepositoryError, VenueRepository>;
        readonly getVenue: (
            tenantId: string,
            id: string
        ) => Effect.Effect<Venue, VenueNotFoundError | VenueRepositoryError, VenueRepository>;
        readonly listVenues: (
            tenantId: string
        ) => Effect.Effect<Venue[], VenueRepositoryError, VenueRepository>;
        readonly updateVenue: (
            tenantId: string,
            id: string,
            input: UpdateVenueInput
        ) => Effect.Effect<Venue, VenueNotFoundError | VenueValidationError | VenueRepositoryError, VenueRepository>;
        readonly deleteVenue: (
            tenantId: string,
            id: string
        ) => Effect.Effect<void, VenueNotFoundError | VenueRepositoryError, VenueRepository>;
    }
>() {}

export const makeVenueService = Effect.gen(function* () {
    const repo = yield* VenueRepository;

    return VenueService.of({
        createVenue: (input: CreateVenueInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(CreateVenueInput)(input).pipe(
                    Effect.mapError((err) => new VenueValidationError({ message: 'Validation failed for CreateVenueInput', cause: err }))
                );
                return yield* repo.create(validated);
            }),

        getVenue: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const venue = yield* repo.findById(tenantId, id);
                if (!venue) {
                    return yield* Effect.fail(new VenueNotFoundError({ id, tenantId }));
                }
                return venue;
            }),

        listVenues: (tenantId: string) => repo.findByTenant(tenantId),

        updateVenue: (tenantId: string, id: string, input: UpdateVenueInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(UpdateVenueInput)(input).pipe(
                    Effect.mapError((err) => new VenueValidationError({ message: 'Validation failed for UpdateVenueInput', cause: err }))
                );
                return yield* repo.update(tenantId, id, validated);
            }),

        deleteVenue: (tenantId: string, id: string) => repo.delete(tenantId, id),
    });
});

export const VenueServiceLive = Layer.effect(VenueService, makeVenueService);
