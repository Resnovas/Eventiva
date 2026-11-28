/**
 * Database connection pooling via Effect SQL (@effect/sql-pg).
 * Provides a PgClient layer configured from environment variables.
 */
import * as Effect from 'effect/Effect';
import * as Redacted from 'effect/Redacted';
import { PgClient } from '@effect/sql-pg';

/**
 * Database connection configuration.
 */
export interface DatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username: string;
  readonly password: string;
  readonly max?: number;
  readonly ssl?: boolean;
}

/**
 * Build a DatabaseConfig from environment variables with sensible defaults.
 * Uses PGHOST/PGPORT/PGUSER/PGPASSWORD (Postgres-native) or DATABASE_* aliases.
 */
export function databaseConfigFromEnv(env: NodeJS.ProcessEnv = process.env): DatabaseConfig {
  const portRaw = env['PGPORT'] ?? env['DATABASE_PORT'] ?? '5432';
  return {
    host: env['PGHOST'] ?? env['DATABASE_HOST'] ?? 'localhost',
    port: parseInt(portRaw, 10),
    database: env['PGDATABASE'] ?? env['DATABASE_NAME'] ?? 'eventiva',
    username: env['PGUSER'] ?? env['DATABASE_USER'] ?? 'postgres',
    password: env['PGPASSWORD'] ?? env['DATABASE_PASSWORD'] ?? 'postgres',
    max: parseInt(env['DATABASE_POOL_MAX'] ?? '10', 10),
    ssl: env['DATABASE_SSL'] === 'true',
  };
}

/**
 * PgClient layer built from environment variables, with connection pooling.
 */
export function buildDatabaseLayer(config: DatabaseConfig = databaseConfigFromEnv()) {
  return PgClient.layer({
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
    password: Redacted.make(config.password),
    maxConnections: config.max ?? 10,
    ssl: config.ssl ?? false,
  });
}

/**
 * Default PgClient layer using environment variables.
 */
export const DatabaseLayer = buildDatabaseLayer();

/**
 * Database ping - verifies connectivity. Requires PgClient in context.
 */
export const ping: Effect.Effect<boolean, unknown, unknown> = Effect.gen(function* () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = yield* PgClient as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yield* (client as any)`SELECT 1`;
  return true;
});