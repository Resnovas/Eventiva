/**
 * Base entity types for Eventiva domain entities.
 * Defines the shape that all domain entities must follow.
 */
import type { TenantId, TypeIdString, IsoDateTime } from './tenant.js';

/**
 * Base entity interface that all domain entities extend.
 */
export interface BaseEntity {
  readonly id: TypeIdString;
  readonly tenantId: TenantId;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
  readonly deletedAt?: IsoDateTime;
}

/**
 * Entity creation input (excludes auto-generated fields).
 */
export type CreateEntityInput<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

/**
 * Entity update input (all fields optional).
 */
export type UpdateEntityInput<T extends BaseEntity> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Entity filter options for list queries.
 */
export interface EntityFilterOptions {
  /** Filter by status if entity has one */
  readonly status?: string;
  /** Filter by search query (name, description) */
  readonly searchQuery?: string;
  /** Limit results */
  readonly limit?: number;
  /** Offset for pagination */
  readonly offset?: number;
}