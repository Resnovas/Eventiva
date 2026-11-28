/**
 * Tenant isolation types.
 * Column-level multi-tenancy: every table has tenant_id.
 */
import * as Schema from 'effect/Schema';

/**
 * Tenant ID branded type.
 * Ensures type safety for tenant-scoped operations.
 */
export const TenantId = Schema.String.pipe(
  Schema.brand('TenantId')
);
export type TenantId = Schema.Schema.Type<typeof TenantId>;

/**
 * Entity ID branded type.
 * Ensures type safety for entity primary keys.
 */
export const EntityId = Schema.String.pipe(
  Schema.brand('EntityId')
);
export type EntityId = Schema.Schema.Type<typeof EntityId>;

/**
 * TypeID validator - validates TypeID format (prefix_encoded).
 * Format: /^[a-z0-9]+_[a-z0-9]{26}$/
 */
export const TypeIdString = Schema.String.pipe(
  Schema.pattern(/^[a-z0-9]+_[a-z0-9]{26}$/),
  Schema.brand('TypeIdString')
);
export type TypeIdString = Schema.Schema.Type<typeof TypeIdString>;

/**
 * ISO timestamp string validator.
 */
export const IsoDateTime = Schema.String.pipe(
  Schema.pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/),
  Schema.brand('IsoDateTime')
);
export type IsoDateTime = Schema.Schema.Type<typeof IsoDateTime>;

/**
 * Base database entity Effect Schema.
 * All domain entities should extend or use this as the base shape.
 */
export const BaseEntitySchema = Schema.Struct({
  id: TypeIdString,
  tenantId: TenantId,
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
  deletedAt: Schema.optionalWith(IsoDateTime, { as: 'Option' }),
});
export type BaseEntitySchema = Schema.Schema.Type<typeof BaseEntitySchema>;