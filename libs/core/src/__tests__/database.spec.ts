/**
 * Test coverage for database foundation.
 * - base schema definitions
 * - Effect Schema entity types
 * - connection pool configuration
 * - migration setup
 */
import { describe, it, expect } from 'vitest';
import * as Schema from 'effect/Schema';
import { createTenantTable, baseColumns, baseIndexes } from '../db/schema.js';
import { TenantId, TypeIdString, IsoDateTime, BaseEntitySchema } from '../types/tenant.js';
import { databaseConfigFromEnv, buildDatabaseLayer } from '../db/pool.js';

describe('database schema foundation', () => {
  it('defines base columns with tenant isolation', () => {
    expect(baseColumns.id).toBeDefined();
    expect(baseColumns.tenantId).toBeDefined();
    expect(baseColumns.createdAt).toBeDefined();
    expect(baseColumns.updatedAt).toBeDefined();
    expect(baseColumns.deletedAt).toBeDefined();
  });

  it('builds standard indexes with a table', () => {
    const t = createTenantTable('test_entities', { name: {} });
    const indexes = baseIndexes('test_entities', t);
    expect(indexes).toHaveLength(4);
  });

  it('creates a tenant-isolated table definition', () => {
    const table = createTenantTable('test_entities', {
      name: 'name',
    });
    expect(table).toBeDefined();
    // Drizzle exposes the physical table name via the symbol's toString
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(String((table as any)[Symbol.for('drizzle:Name')])).toBe('test_entities');
  });

  it('validates TenantId branded type', () => {
    const ok = Schema.decodeUnknownSync(TenantId)('tenant_abc123');
    expect(ok).toBe('tenant_abc123');

    expect(() => Schema.decodeUnknownSync(TenantId)(123)).toThrow();
  });

  it('validates TypeIdString format', () => {
    const valid = 'vendor_0123456789abcdef0123456789';
    expect(Schema.decodeUnknownSync(TypeIdString)(valid)).toBe(valid);

    expect(() => Schema.decodeUnknownSync(TypeIdString)('not-a-typeid')).toThrow();
  });

  it('validates IsoDateTime format', () => {
    const valid = '2025-01-01T00:00:00.000Z';
    expect(Schema.decodeUnknownSync(IsoDateTime)(valid)).toBe(valid);

    expect(() => Schema.decodeUnknownSync(IsoDateTime)('2025-01-01')).toThrow();
  });

  it('roundtrips BaseEntitySchema encode/decode', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entity: any = {
      id: 'vendor_0123456789abcdef0123456789',
      tenantId: 'tenant_abc12345678901234567890123',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    const decoded = Schema.decodeUnknownSync(BaseEntitySchema)(entity);
    expect(decoded).toEqual(entity);

    const encoded = Schema.encodeSync(BaseEntitySchema)(entity);
    expect(encoded).toEqual(entity);
  });
});

describe('database connection config', () => {
  it('builds config from env with defaults', () => {
    const config = databaseConfigFromEnv({});
    expect(config.host).toBe('localhost');
    expect(config.port).toBe(5432);
    expect(config.database).toBe('eventiva');
    expect(config.username).toBe('postgres');
    expect(config.password).toBe('postgres');
    expect(config.max).toBe(10);
    expect(config.ssl).toBe(false);
  });

  it('reads env-customized config', () => {
    const config = databaseConfigFromEnv({
      DATABASE_HOST: 'db.example.com',
      DATABASE_PORT: '5433',
      DATABASE_NAME: 'eventiva_prod',
      DATABASE_USER: 'app',
      DATABASE_PASSWORD: 'secret',
      DATABASE_POOL_MAX: '25',
      DATABASE_SSL: 'true',
    });
    expect(config.host).toBe('db.example.com');
    expect(config.port).toBe(5433);
    expect(config.database).toBe('eventiva_prod');
    expect(config.username).toBe('app');
    expect(config.password).toBe('secret');
    expect(config.max).toBe(25);
    expect(config.ssl).toBe(true);
  });

  it('prefers PG* env vars when DATABASE_* absent', () => {
    const config = databaseConfigFromEnv({
      PGHOST: 'pg-host',
      PGPORT: '5434',
    });
    expect(config.host).toBe('pg-host');
    expect(config.port).toBe(5434);
  });

  it('builds a valid PgClient layer', () => {
    const layer = buildDatabaseLayer(databaseConfigFromEnv({}));
    expect(layer).toBeDefined();
  });
});