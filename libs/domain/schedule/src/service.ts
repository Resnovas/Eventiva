import { Context, Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import { ScheduleNotFoundError, ScheduleRepository, ScheduleRepositoryError, ScheduleValidationError } from './repository.js';
import { CreateScheduleInput, UpdateScheduleInput, Schedule } from './schema.js';

export class ScheduleService extends Context.Tag('@eventiva/domain-schedule/ScheduleService')<
    ScheduleService,
    {
        readonly createSchedule: (
            input: CreateScheduleInput
        ) => Effect.Effect<Schedule, ScheduleValidationError | ScheduleRepositoryError, ScheduleRepository>;
        readonly getSchedule: (
            tenantId: string,
            id: string
        ) => Effect.Effect<Schedule, ScheduleNotFoundError | ScheduleRepositoryError, ScheduleRepository>;
        readonly listSchedulesByEvent: (
            tenantId: string,
            eventId: string
        ) => Effect.Effect<Schedule[], ScheduleRepositoryError, ScheduleRepository>;
        readonly listSchedules: (
            tenantId: string
        ) => Effect.Effect<Schedule[], ScheduleRepositoryError, ScheduleRepository>;
        readonly updateSchedule: (
            tenantId: string,
            id: string,
            input: UpdateScheduleInput
        ) => Effect.Effect<Schedule, ScheduleNotFoundError | ScheduleValidationError | ScheduleRepositoryError, ScheduleRepository>;
        readonly deleteSchedule: (
            tenantId: string,
            id: string
        ) => Effect.Effect<void, ScheduleNotFoundError | ScheduleRepositoryError, ScheduleRepository>;
    }
>() {}

export const makeScheduleService = Effect.gen(function* () {
    const repo = yield* ScheduleRepository;

    return ScheduleService.of({
        createSchedule: (input: CreateScheduleInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(CreateScheduleInput)(input).pipe(
                    Effect.mapError((err) => new ScheduleValidationError({ message: 'Validation failed for CreateScheduleInput', cause: err }))
                );
                return yield* repo.create(validated);
            }),

        getSchedule: (tenantId: string, id: string) =>
            Effect.gen(function* () {
                const schedule = yield* repo.findById(tenantId, id);
                if (!schedule) {
                    return yield* Effect.fail(new ScheduleNotFoundError({ id, tenantId }));
                }
                return schedule;
            }),

        listSchedulesByEvent: (tenantId: string, eventId: string) => repo.findByEvent(tenantId, eventId),

        listSchedules: (tenantId: string) => repo.findByTenant(tenantId),

        updateSchedule: (tenantId: string, id: string, input: UpdateScheduleInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(UpdateScheduleInput)(input).pipe(
                    Effect.mapError((err) => new ScheduleValidationError({ message: 'Validation failed for UpdateScheduleInput', cause: err }))
                );
                return yield* repo.update(tenantId, id, validated);
            }),

        deleteSchedule: (tenantId: string, id: string) => repo.delete(tenantId, id),
    });
});

export const ScheduleServiceLive = Layer.effect(ScheduleService, makeScheduleService);
