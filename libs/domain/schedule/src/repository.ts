import { Context, Data, Effect } from 'effect';
import type { CreateScheduleInput, UpdateScheduleInput, Schedule } from './schema.js';

export class ScheduleNotFoundError extends Data.TaggedError('ScheduleNotFoundError')<{
    readonly id: string;
    readonly tenantId: string;
}> {}

export class ScheduleValidationError extends Data.TaggedError('ScheduleValidationError')<{
    readonly message: string;
    readonly cause?: unknown;
}> {}

export class ScheduleRepositoryError extends Data.TaggedError('ScheduleRepositoryError')<{
    readonly message: string;
    readonly cause?: unknown;
}> {}

export interface ScheduleRepository {
    readonly create: (input: CreateScheduleInput) => Effect.Effect<Schedule, ScheduleValidationError | ScheduleRepositoryError>;
    readonly findById: (tenantId: string, id: string) => Effect.Effect<Schedule | null, ScheduleRepositoryError>;
    readonly findByEvent: (tenantId: string, eventId: string) => Effect.Effect<Schedule[], ScheduleRepositoryError>;
    readonly findByTenant: (tenantId: string) => Effect.Effect<Schedule[], ScheduleRepositoryError>;
    readonly update: (
        tenantId: string,
        id: string,
        input: UpdateScheduleInput
    ) => Effect.Effect<Schedule, ScheduleNotFoundError | ScheduleValidationError | ScheduleRepositoryError>;
    readonly delete: (tenantId: string, id: string) => Effect.Effect<void, ScheduleNotFoundError | ScheduleRepositoryError>;
}

export const ScheduleRepository = Context.GenericTag<ScheduleRepository>('@eventiva/domain-schedule/ScheduleRepository');
