/**
 * @file packages/integrations/sql/src/migrations.ts
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SqlClient } from '@effect/sql';
import { StorageFailure } from '@eventiva/contracts/storage';
import { Effect } from 'effect';

/**
 * The SQL engines this adapter supports; the dialect selects the lock strategy and migration directory.
 *
 * @since 0.0.1
 * @example
 * const dialect: Dialect = 'postgres';
 */
export type Dialect = 'postgres' | 'sqlite';
/**
 * A named SQL file with the SHA-256 of its exact bytes; migration execution rejects changed applied entries.
 *
 * @since 0.0.1
 * @example
 * const entry: Migration = { name: '0001.sql', sql: 'CREATE TABLE t (id text)', checksum };
 */
export interface Migration {
    readonly name: string;
    readonly sql: string;
    readonly checksum: string;
}

/**
 * Exact bytes, not normalized SQL. Files are reviewed by tools/storage/guard.mjs before execution.
 *
 * @param directory - The directory whose `.sql` files are loaded in lexical order; other entries are ignored.
 * @returns Each SQL file's name, UTF-8 text and SHA-256 checksum of its raw bytes.
 * @fails {StorageFailure} With `filesystem` when the directory or a file cannot be read; no path or exception detail is kept.
 * @since 0.0.1
 * @example
 * const migrations = yield* load('storage/migrations/postgres');
 */
export const load = (directory: string) =>
    Effect.try({
        /**
         * Read SQL files in lexical order; filesystem failures become a closed storage failure.
         *
         * @returns The loaded migrations in lexical file-name order.
         */
        // effect-boundary: local migration files and SHA-256 are Node integration IO
        try: () =>
            readdirSync(directory)
                .filter(
                    /**
                     * Ignore non-SQL entries without interpreting their contents as migrations.
                     *
                     * @param name - The directory entry name.
                     * @returns Whether the entry is a `.sql` file.
                     */
                    (name) => name.endsWith('.sql')
                )
                .sort()
                .map(
                    /**
                     * Preserve file text and its raw-byte checksum without rewriting SQL or line endings.
                     *
                     * @param name - The SQL file name inside the directory.
                     * @returns The migration entry built from the file's exact bytes.
                     */
                    (name) => {
                        // Hash the bytes that were read, not a normalized SQL representation.
                        const bytes = readFileSync(join(directory, name));
                        return {
                            name,
                            sql: bytes.toString('utf8'),
                            checksum: createHash('sha256').update(bytes).digest('hex'),
                        };
                    }
                ),
        /**
         * Omit filesystem paths and underlying exception contents from the loading failure.
         *
         * @returns A StorageFailure with the `filesystem` reason.
         */
        catch: () => new StorageFailure({ operation: 'load-migrations', reason: 'filesystem' }),
    });

/**
 * Serializes migrations and verifies the entire applied prefix. No down, reset or schema-push API.
 *
 * Runs in one transaction; on PostgreSQL an advisory transaction lock serializes concurrent runners.
 * Nothing new executes unless every applied entry still matches by name, order and checksum.
 *
 * @param dialect - The SQL engine, which decides whether the PostgreSQL advisory lock is taken.
 * @param migrations - The complete ordered history, named `NNNN.sql` in strictly increasing order.
 * @returns An effect that completes once every pending migration has been applied and recorded.
 * @fails {StorageFailure} With operation `applied-migration-changed`, `migration-order` or `migration-checksum` when the history is invalid, or reason `database` when SQL fails.
 * @since 0.0.1
 * @example
 * yield* migrate('postgres', yield* load('storage/migrations/postgres'));
 */
export const migrate = (dialect: Dialect, migrations: ReadonlyArray<Migration>) =>
    Effect.gen(
        /** Acquire the configured SQL client and apply the forward-only history in one transaction. */ function* () {
            // The caller supplies the database capability; this function neither provisions it nor chooses a tenant.
            const sql = yield* SqlClient.SqlClient;
            yield* sql.withTransaction(
                Effect.gen(
                    /** Lock the migration history, verify its immutable prefix and execute only the validated suffix. */ function* () {
                        if (dialect === 'postgres') yield* sql`SELECT pg_advisory_xact_lock(4217001)`;
                        yield* sql`CREATE TABLE IF NOT EXISTS storage_migration (name text PRIMARY KEY, checksum text NOT NULL)`;
                        const applied = yield* sql<{
                            name: string;
                            checksum: string;
                        }>`SELECT name, checksum FROM storage_migration ORDER BY name`;
                        // Compare every applied entry before executing new SQL; omission and reordering also change history.
                        for (const [index, entry] of applied.entries()) {
                            const candidate = migrations[index];
                            if (candidate?.name !== entry.name || candidate.checksum !== entry.checksum) {
                                return yield* new StorageFailure({ operation: 'applied-migration-changed' });
                            }
                        }
                        const names = migrations.map(
                            /**
                             * Use declared names to check the complete ordered migration sequence.
                             *
                             * @param m - A supplied migration entry.
                             * @returns The entry's declared file name.
                             */
                            (m) => m.name
                        );
                        if (
                            new Set(names).size !== names.length ||
                            names.some(
                                /**
                                 * Require four-digit SQL names in strictly increasing order, with no duplicate or backward entry.
                                 *
                                 * @param name - The migration file name being checked.
                                 * @param i - Its position in the supplied sequence.
                                 * @returns Whether the name is malformed or not after its predecessor.
                                 */
                                (name, i) => {
                                    const previous = names[i - 1];
                                    return !/^\d{4}\.sql$/.test(name) || (previous !== undefined && name <= previous);
                                }
                            )
                        ) {
                            return yield* new StorageFailure({ operation: 'migration-order' });
                        }
                        for (const entry of migrations.slice(applied.length)) {
                            if (createHash('sha256').update(entry.sql).digest('hex') !== entry.checksum)
                                return yield* new StorageFailure({ operation: 'migration-checksum' });
                            // Explicit boundaries, not a SQL parser: trigger bodies may contain semicolons.
                            for (const statement of entry.sql.split(/^-- statement-breakpoint\s*$/m)) {
                                if (statement.trim()) yield* sql.unsafe(statement).withoutTransform;
                            }
                            yield* sql`INSERT INTO storage_migration (name, checksum) VALUES (${entry.name}, ${entry.checksum})`;
                        }
                    }
                )
            );
        }
    ).pipe(
        Effect.catchTag(
            'SqlError',
            /**
             * Preserve migration-validation failures but replace database diagnostics with a closed reason.
             *
             * @returns A failure with the `database` reason.
             */
            () => Effect.fail(new StorageFailure({ operation: 'migrate', reason: 'database' }))
        )
    );
