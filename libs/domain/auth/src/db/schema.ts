import { text, timestamp, boolean, pgTable } from 'drizzle-orm/pg-core';

export const users = pgTable(
    'users',
    {
        id: text('id').primaryKey(),
        email: text('email').notNull().unique(),
        passwordHash: text('password_hash').notNull(),
        role: text('role').notNull().default('staff'),
        isVerified: boolean('is_verified').notNull().default(false),
        createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
    }
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;