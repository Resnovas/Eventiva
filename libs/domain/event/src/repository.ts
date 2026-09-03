import { Context, Data, Effect } from 'effect';
import type { CreateEventInput, UpdateEventInput, Event, EventStatus } from './schema.js';

export class EventNotFoundError extends Data.TaggedError('EventNotFoundError')<{
    readonly id: string;
    readonly tenantId: string;
}> {}

export class EventValidationError extends Data.TaggedError('EventValidationError')<{
    readonly message: string;
    readonly cause?: unknown;
}> {}

export class EventRepositoryError extends Data.TaggedError('EventRepositoryError')<{
    readonly message: string;
    readonly cause?: unknown;
}> {}

export class EventDateConflictError extends Data.TaggedError('EventDateConflictError')<{
    readonly venueId: string;
    readonly startDate: string;
    readonly endDate: string;
    readonly conflictingEventId: string;
}> {}

export class EventInvalidStatusTransitionError extends Data.TaggedError('EventInvalidStatusTransitionError')<{
    readonly currentStatus: EventStatus;
    readonly newStatus: EventStatus;
}> {}

export interface EventRepository {
    readonly create: (input: CreateEventInput) => Effect.Effect<Event, EventValidationError | EventRepositoryError>;
    readonly findById: (tenantId: string, id: string) => Effect.Effect<Event | null, EventRepositoryError>;
    readonly findByTenant: (tenantId: string) => Effect.Effect<Event[], EventRepositoryError>;
    readonly findByVenue: (tenantId: string, venueId: string) => Effect.Effect<Event[], EventRepositoryError>;
    readonly update: (
        tenantId: string,
        id: string,
        input: UpdateEventInput
    ) => Effect.Effect<Event, EventNotFoundError | EventValidationError | EventRepositoryError>;
    readonly delete: (tenantId: string, id: string) => Effect.Effect<void, EventNotFoundError | EventRepositoryError>;
}

export const EventRepository = Context.GenericTag<EventRepository>('@eventiva/domain-event/EventRepository');
