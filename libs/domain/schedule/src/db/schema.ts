import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { Room, ScheduleEntry, ScheduleStatus } from '../schema.js';

export const schedules = pgTable(
    'schedules',
    {
        id: text('id').primaryKey(),
        tenantId: text('tenant_id').notNull(),
        eventId: text('event_id').notNull(),
        name: text('name').notNull(),
        description: text('description'),
        status: text('status').$type<ScheduleStatus>().notNull().default('draft'),
        entries: jsonb('entries').$type<ScheduleEntry[]>().notNull().default('[]'),
        rooms: jsonb('rooms').$type<Room[]>().notNull().default('[]'),
        createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
    },
    (table) => [
        index('schedules_tenant_id_idx').on(table.tenantId),
        index('schedules_event_id_idx').on(table.eventId),
        index('schedules_status_idx').on(table.status),
        index('schedules_tenant_event_idx').on(table.tenantId, table.eventId),
    ]
);

export type ScheduleRow = typeof schedules.$inferSelect;
export type NewScheduleRow = typeof schedules.$inferInsert;
