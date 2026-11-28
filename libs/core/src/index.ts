/**
 * Database entity types.
 */
export * from './types/tenant.js';
export * from './types/entity.js';
export * from './types/branded.js';
export * from './types/enums.js';

/**
 * Database schema.
 */
export { createTenantTable, baseColumns, baseIndexes } from './db/schema.js';

/**
 * Database connection pool.
 */
export { DatabaseLayer, buildDatabaseLayer, ping, databaseConfigFromEnv } from './db/pool.js';
export type { DatabaseConfig } from './db/pool.js';

/**
 * Common value-object / entity schemas.
 */
export {
  EmailAddress as CommonEmailAddress,
  PhoneNumber as CommonPhoneNumber,
  CurrencyAmount as CommonCurrencyAmount,
  DateTime as CommonDateTime,
  EventStatusSchema as CommonEventStatusSchema,
  VenueStatusSchema as CommonVenueStatusSchema,
  VendorCategorySchema as CommonVendorCategorySchema,
  ContactInfo,
  Address,
  Money,
  DateRange,
  BaseEntityRecord,
} from './schemas/common.js';