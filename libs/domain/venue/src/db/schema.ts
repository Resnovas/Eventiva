import { index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { Address, CurrencyAmount, VenueStatus } from '../schema.js';

export const venues = pgTable(
    'venues',
    {
        id: text('id').primaryKey(),
        tenantId: text('tenant_id').notNull(),
        name: text('name').notNull(),
        description: text('description').notNull().default(''),
        address: jsonb('address').$type<Address>().notNull(),
        capacity: integer('capacity').notNull(),
        amenities: jsonb('amenities').$type<string[]>().notNull(),
        status: text('status').$type<VenueStatus>().notNull().default('active'),
        pricing: jsonb('pricing').$type<CurrencyAmount>().notNull(),
        contactId: text('contact_id').notNull(),
        createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
    },
    (table) => [
        index('venues_tenant_id_idx').on(table.tenantId),
        index('venues_status_idx').on(table.status),
        index('venues_contact_id_idx').on(table.contactId),
    ]
);

export type VenueRow = typeof venues.$inferSelect;
export type NewVenueRow = typeof venues.$inferInsert;
