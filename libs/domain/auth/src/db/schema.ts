import { pgTable, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable(
  'users',
  {
    id: varchar('id').primaryKey().$defaultFn(() => createId()),
    email: varchar('email').notNull().unique(),
    passwordHash: varchar('password_hash').notNull(),
    role: varchar('role', { enum: ['owner', 'manager', 'staff', 'viewer'] })
      .notNull()
      .default('staff'),
    isVerified: boolean('is_verified').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_users_email').on(table.email),
    index('idx_users_role').on(table.role),
  ]
);
