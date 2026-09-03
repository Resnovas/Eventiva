import { index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { CurrencyAmount, EventStatus, EventType } from '../schema.js';

export const events = pgTable(
    'events',
    {
        id: text('id').primaryKey(),
        tenantId: text('tenant_id').notNull(),
        name: text('name').notNull(),
        description: text('description').notNull().default(''),
        eventType: text('event_type').$type<EventType>().notNull(),
        status: text('status').$type<EventStatus>().notNull().default('planned'),
        venueId: text('venue_id'),
        startDate: timestamp('start_date', { mode: 'string' }).notNull(),
        endDate: timestamp('end_date', { mode: 'string' }).notNull(),
        expectedAttendees: integer('expected_attendees'),
        budget: jsonb('budget').$type<CurrencyAmount>(),
        ownerId: text('owner_id').notNull(),
        tags: jsonb('tags').$type<string[]>().notNull().default('[]'),
        createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
    },
    (table) => [
        index('events_tenant_id_idx').on(table.tenantId),
        index('events_status_idx').on(table.status),
        index('events_venue_id_idx').on(table.venueId),
        index('events_owner_id_idx').on(table.ownerId),
    ]
);

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
