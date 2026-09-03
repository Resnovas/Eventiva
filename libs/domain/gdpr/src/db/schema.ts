import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { GDPRRecordType, GDPRActionStatus } from '../schema.js';

export const gdprRequests = pgTable(
    'gdpr_requests',
    {
        id: text('id').primaryKey(),
        tenantId: text('tenant_id').notNull(),
        subjectId: text('subject_id').notNull(),
        type: text('type').$type<GDPRRecordType>().notNull(),
        status: text('status').$type<GDPRActionStatus>().notNull().default('pending'),
        details: jsonb('details').notNull().default({}),
        requestedAt: timestamp('requested_at', { mode: 'string' }).notNull().defaultNow(),
        completedAt: timestamp('completed_at', { mode: 'string' }),
    },
    (table) => [
        index('gdpr_requests_tenant_idx').on(table.tenantId),
        index('gdpr_requests_subject_idx').on(table.subjectId),
        index('gdpr_requests_status_idx').on(table.status),
    ]
);

export type GDPRRequestRow = typeof gdprRequests.$inferSelect;
export type NewGDPRRequestRow = typeof gdprRequests.$inferInsert;
