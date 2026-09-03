import { doublePrecision, index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { PricingModel, VendorCategory, VendorStatus } from '../schema.js';

export const vendors = pgTable(
    'vendors',
    {
        id: text('id').primaryKey(),
        tenantId: text('tenant_id').notNull(),
        name: text('name').notNull(),
        category: text('category').$type<VendorCategory>().notNull(),
        description: text('description').notNull().default(''),
        contactId: text('contact_id').notNull(),
        services: jsonb('services').$type<string[]>().notNull(),
        pricingModel: text('pricing_model').$type<PricingModel>().notNull().default('custom'),
        rating: doublePrecision('rating').notNull().default(0),
        reviews: integer('reviews').notNull().default(0),
        portfolio: jsonb('portfolio').$type<string[]>().notNull(),
        status: text('status').$type<VendorStatus>().notNull().default('active'),
        createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
    },
    (table) => [
        index('vendors_tenant_id_idx').on(table.tenantId),
        index('vendors_category_idx').on(table.category),
        index('vendors_tenant_category_idx').on(table.tenantId, table.category),
        index('vendors_status_idx').on(table.status),
        index('vendors_contact_id_idx').on(table.contactId),
        index('vendors_rating_idx').on(table.rating),
    ]
);

export type VendorRow = typeof vendors.$inferSelect;
export type NewVendorRow = typeof vendors.$inferInsert;
