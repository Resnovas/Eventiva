import * as Schema from 'effect/Schema';
import { typeIdSchema } from '@eventiva/core';

export const ScheduleStatus = Schema.Literal('draft', 'published', 'archived');
export type ScheduleStatus = Schema.Schema.Type<typeof ScheduleStatus>;

export const ScheduleEntryType = Schema.Literal(
    'keynote',
    'workshop',
    'panel',
    'talk',
    'break',
    'registration',
    'networking',
    'other'
);
export type ScheduleEntryType = Schema.Schema.Type<typeof ScheduleEntryType>;

export const ScheduleEntry = Schema.Struct({
    id: typeIdSchema('schedule_entry'),
    title: Schema.String.pipe(Schema.nonEmptyString()),
    description: Schema.optional(Schema.String),
    entryType: ScheduleEntryType,
    startTime: Schema.String,
    endTime: Schema.String,
    roomId: Schema.optional(typeIdSchema('room')),
    vendorId: Schema.optional(typeIdSchema('vendor')),
    speakerIds: Schema.Array(typeIdSchema('contact')),
    notes: Schema.optional(Schema.String),
});
export type ScheduleEntry = Schema.Schema.Type<typeof ScheduleEntry>;

export const Room = Schema.Struct({
    id: typeIdSchema('room'),
    name: Schema.String.pipe(Schema.nonEmptyString()),
    capacity: Schema.Number.pipe(Schema.int(), Schema.positive()),
    location: Schema.optional(Schema.String),
});
export type Room = Schema.Schema.Type<typeof Room>;

export const Schedule = Schema.Struct({
    id: typeIdSchema('schedule'),
    tenantId: typeIdSchema('tenant'),
    eventId: typeIdSchema('event'),
    name: Schema.String.pipe(Schema.nonEmptyString()),
    description: Schema.optional(Schema.String),
    status: ScheduleStatus,
    entries: Schema.Array(ScheduleEntry),
    rooms: Schema.Array(Room),
    createdAt: Schema.String,
    updatedAt: Schema.String,
});
export type Schedule = Schema.Schema.Type<typeof Schedule>;

export const CreateScheduleInput = Schema.Struct({
    tenantId: typeIdSchema('tenant'),
    eventId: typeIdSchema('event'),
    name: Schema.String.pipe(Schema.nonEmptyString()),
    description: Schema.optional(Schema.String),
    status: Schema.optionalWith(ScheduleStatus, { default: () => 'draft' }),
    entries: Schema.optionalWith(Schema.Array(ScheduleEntry), { default: () => [] }),
    rooms: Schema.optionalWith(Schema.Array(Room), { default: () => [] }),
});
export type CreateScheduleInput = Schema.Schema.Type<typeof CreateScheduleInput>;

export const UpdateScheduleInput = Schema.Struct({
    name: Schema.optional(Schema.String.pipe(Schema.nonEmptyString())),
    description: Schema.optional(Schema.String),
    status: Schema.optional(ScheduleStatus),
    entries: Schema.optional(Schema.Array(ScheduleEntry)),
    rooms: Schema.optional(Schema.Array(Room)),
});
export type UpdateScheduleInput = Schema.Schema.Type<typeof UpdateScheduleInput>;

export const CreateScheduleEntryInput = Schema.Struct({
    title: Schema.String.pipe(Schema.nonEmptyString()),
    description: Schema.optional(Schema.String),
    entryType: ScheduleEntryType,
    startTime: Schema.String,
    endTime: Schema.String,
    roomId: Schema.optional(typeIdSchema('room')),
    vendorId: Schema.optional(typeIdSchema('vendor')),
    speakerIds: Schema.optionalWith(Schema.Array(typeIdSchema('contact')), { default: () => [] }),
    notes: Schema.optional(Schema.String),
});
export type CreateScheduleEntryInput = Schema.Schema.Type<typeof CreateScheduleEntryInput>;
