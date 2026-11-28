/**
 * Shared base schema definitions for Eventiva database.
 * Provides tenant isolation (column-level) and common entity column types.
 */
import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Standard column definitions applied to all tenant-scoped tables.
 * Tenant isolation is column-level: every row carries tenant_id.
 *
 * Domain tables should spread these and add domain-specific columns,
 * following the pattern in libs/domain/{vendor,venue}/src/db/schema.ts.
 */
export const baseColumns = {
  /** TypeID primary key (e.g. "vendor_abc123") */
  id: text('id').primaryKey(),
  /** Tenant isolation - column-level multi-tenancy */
  tenantId: text('tenant_id').notNull(),
  /** Created timestamp (ISO string) */
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  /** Updated timestamp (ISO string) */
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date().toISOString()),
  /** Soft delete timestamp */
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
};

/**
 * Standard indexes for a tenant-scoped table.
 *
 * Drizzle require the index to reference columns on the table instance, so
 * this helper accepts a table and returns the standard index builders.
 * Call it in the extraConfig callback of pgTable:
 *
 *   pgTable('my_table', { ...baseColumns, name: text('name') },
 *     (t) => [...baseIndexes('my_table', t), index('my_table_name_idx').on(t.name)])
 */
export function baseIndexes(
  tableName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
) {
  return [
    index(`${tableName}_tenant_id_idx`).on(t.tenantId),
    index(`${tableName}_created_at_idx`).on(t.createdAt),
    index(`${tableName}_updated_at_idx`).on(t.updatedAt),
    index(`${tableName}_deleted_at_idx`).on(t.deletedAt),
  ];
}

/**
 * Convenience builder: create a tenant-isolated table with standard columns/indexes.
 *
 * @example
 * const vendors = createTenantTable('vendors', {
 *   name: text('name').notNull(),
 * });
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTenantTable<Name extends string, T extends Record<string, any>>(
  name: Name,
  columns: T,
  extraConfig?: (t: any) => any[]
) {
  return pgTable(
    name,
    { ...baseColumns, ...columns },
    (t) => [...baseIndexes(name, t), ...(extraConfig ? extraConfig(t) : [])]
  );
}

/**
 * Drizzle Effect Schema helpers (to make domain entity schemas from Drizzle tables).
 */
export { createInsertSchema, createSelectSchema } from 'drizzle-orm/effect-schema';

/**
 * Re-export commonly used Drizzle types.
 */
export type { PgTable, PgColumn } from 'drizzle-orm/pg-core';