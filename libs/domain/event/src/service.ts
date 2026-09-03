import { Context, Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import {
    EventDateConflictError,
    EventInvalidStatusTransitionError,
    EventNotFoundError,
    EventRepository,
    EventRepositoryError,
    EventValidationError,
} from './repository.js';
import { CreateEventInput, Event, EventStatus, UpdateEventInput } from './schema.js';

const ALLOWED_STATUS_TRANSITIONS: Record<EventStatus, readonly EventStatus[]> = {
    planned: ['confirmed', 'cancelled', 'planned'],
    confirmed: ['in_progress', 'cancelled', 'planned', 'confirmed'],
    in_progress: ['completed', 'cancelled', 'in_progress'],
    completed: ['completed'],
    cancelled: ['planned', 'cancelled'],
};

export class EventService extends Context.Tag('@eventiva/domain-event/EventService')<
    EventService,
    {
        readonly createEvent: (
            input: CreateEventInput
        ) => Effect.Effect<
            Event,
            EventValidationError | EventDateConflictError | EventRepositoryError,
            EventRepository
        >;
        readonly getEvent: (
            tenantId: string,
            id: string
        ) => Effect.Effect<Event, EventNotFoundError | EventRepositoryError, EventRepository>;
        readonly listEvents: (
            tenantId: string
        ) => Effect.Effect<Event[], EventRepositoryError, EventRepository>;
        readonly listEventsByVenue: (
            tenantId: string,
            venueId: string
        ) => Effect.Effect<Event[], EventRepositoryError, EventRepository>;
        readonly updateEvent: (
            tenantId: string,
            id: string,
            input: UpdateEventInput
        ) => Effect.Effect<
            Event,
            | EventNotFoundError
            | EventValidationError
            | EventDateConflictError
            | EventInvalidStatusTransitionError
            | EventRepositoryError,
            EventRepository
        >;
        readonly deleteEvent: (
            tenantId: string,
            id: string
        ) => Effect.Effect<void, EventNotFoundError | EventRepositoryError, EventRepository>;
    }
>() {}

export const makeEventService = Effect.gen(function* () {
    const repo = yield* EventRepository;

    const checkDateValidity = (startDate: string, endDate: string) =>
        Effect.gen(function* () {
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime();
            if (Number.isNaN(start) || Number.isNaN(end)) {
                return yield* Effect.fail(
                    new EventValidationError({ message: 'Invalid date format for startDate or endDate' })
                );
            }
            if (start >= end) {
                return yield* Effect.fail(
                    new EventValidationError({ message: 'startDate must be before endDate' })
                );
            }
        });

    const checkVenueConflict = (
        tenantId: string,
        venueId: string | null | undefined,
        startDate: string,
        endDate: string,
        excludeEventId?: string
    ) =>
        Effect.gen(function* () {
            if (!venueId) return;

            const existingEvents = yield* repo.findByVenue(tenantId, venueId);
            const startA = new Date(startDate).getTime();
            const endA = new Date(endDate).getTime();

            for (const existing of existingEvents) {
                if (excludeEventId && existing.id === excludeEventId) {
                    continue;
                }
                if (existing.status === 'cancelled') {
                    continue;
                }

                const startB = new Date(existing.startDate).getTime();
                const endB = new Date(existing.endDate).getTime();

                if (startA < endB && endA > startB) {
                    return yield* Effect.fail(
                        new EventDateConflictError({
                            venueId,
                            startDate,
                            endDate,
                            conflictingEventId: existing.id,
                        })
                    );
                }
            }
        });

    const checkStatusTransition = (currentStatus: EventStatus, newStatus: EventStatus) =>
        Effect.gen(function* () {
            if (currentStatus === newStatus) return;
            const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
            if (!allowed.includes(newStatus)) {
                return yield* Effect.fail(
                    new EventInvalidStatusTransitionError({
                        currentStatus,
                        newStatus,
                    })
                );
            }
        });

    return EventService.of({
        createEvent: (input: CreateEventInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(CreateEventInput)(input).pipe(
                    Effect.mapError(
                        (err) => new EventValidationError({ message: 'Validation failed for CreateEventInput', cause: err })
                    )
                );

                yield* checkDateValidity(validated.startDate, validated.endDate);
                yield* checkVenueConflict(
                    validated.tenantId,
                    validated.venueId,
                    validated.startDate,
                    validated.endDate
                );

                return yield* repo.create(validated);
            }),

        getEvent: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const event = yield* repo.findById(tenantId, id);
                if (!event) {
                    return yield* Effect.fail(new EventNotFoundError({ id, tenantId }));
                }
                return event;
            }),

        listEvents: (tenantId: string) => repo.findByTenant(tenantId),

        listEventsByVenue: (tenantId: string, venueId: string) => repo.findByVenue(tenantId, venueId),

        updateEvent: (tenantId: string, id: string, input: UpdateEventInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(UpdateEventInput)(input).pipe(
                    Effect.mapError(
                        (err) => new EventValidationError({ message: 'Validation failed for UpdateEventInput', cause: err })
                    )
                );

                const existing = yield* repo.findById(tenantId, id);
                if (!existing) {
                    return yield* Effect.fail(new EventNotFoundError({ id, tenantId }));
                }

                const targetStartDate = validated.startDate ?? existing.startDate;
                const targetEndDate = validated.endDate ?? existing.endDate;
                const targetVenueId = validated.venueId !== undefined ? validated.venueId : existing.venueId;

                yield* checkDateValidity(targetStartDate, targetEndDate);

                if (validated.status !== undefined) {
                    yield* checkStatusTransition(existing.status, validated.status);
                }

                yield* checkVenueConflict(
                    tenantId,
                    targetVenueId,
                    targetStartDate,
                    targetEndDate,
                    id
                );

                return yield* repo.update(tenantId, id, validated);
            }),

        deleteEvent: (tenantId: string, id: string) => repo.delete(tenantId, id),
    });
});

export const EventServiceLive = Layer.effect(EventService, makeEventService);
