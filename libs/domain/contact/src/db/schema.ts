import { doublePrecision, index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { ContactStatus, ContactType } from '../schema.js';

export const contacts = pgTable(
  'contacts',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    company: text('company'),
    role: text('role'),
    type: text('type').$type<ContactType>().notNull(),
    status: text('status').$type<ContactStatus>().notNull().default('new'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    notes: text('notes'),
    linkedVendorId: text('linked_vendor_id'),
    linkedVenueId: text('linked_venue_id'),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    index('contacts_tenant_id_idx').on(table.tenantId),
    index('contacts_type_idx').on(table.type),
    index('contacts_status_idx').on(table.status),
    index('contacts_email_idx').on(table.email),
    index('contacts_tenant_type_idx').on(table.tenantId, table.type),
    index('contacts_tenant_status_idx').on(table.tenantId, table.status),
    index('contacts_linked_vendor_id_idx').on(table.linkedVendorId),
    index('contacts_linked_venue_id_idx').on(table.linkedVenueId),
  ]
);

export type ContactRow = typeof contacts.$inferSelect;
export type NewContactRow = typeof contacts.$inferInsert;
