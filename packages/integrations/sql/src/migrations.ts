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

export type Dialect = 'postgres' | 'sqlite';
/** A named SQL file with the SHA-256 of its exact bytes; migration execution rejects changed applied entries. */
export interface Migration {
    readonly name: string;
    readonly sql: string;
    readonly checksum: string;
}

/** Exact bytes, not normalized SQL. Files are reviewed by tools/storage/guard.mjs before execution. */
export const load = (directory: string) =>
    Effect.try({
        /** Read SQL files in lexical order; filesystem failures become a closed storage failure. */
        // effect-boundary: local migration files and SHA-256 are Node integration IO
        try: () =>
            readdirSync(directory)
                .filter(
                    /** Ignore non-SQL entries without interpreting their contents as migrations. */ (name) =>
                        name.endsWith('.sql')
                )
                .sort()
                .map(
                    /** Preserve file text and its raw-byte checksum without rewriting SQL or line endings. */ (
                        name
                    ) => {
                        // Hash the bytes that were read, not a normalized SQL representation.
                        const bytes = readFileSync(join(directory, name));
                        return {
                            name,
                            sql: bytes.toString('utf8'),
                            checksum: createHash('sha256').update(bytes).digest('hex'),
                        };
                    }
                ),
        /** Omit filesystem paths and underlying exception contents from the loading failure. */
        catch: () => new StorageFailure({ operation: 'load-migrations', reason: 'filesystem' }),
    });

/** Serializes migrations and verifies the entire applied prefix. No down, reset or schema-push API. */
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
                            /** Use declared names to check the complete ordered migration sequence. */ (m) => m.name
                        );
                        if (
                            new Set(names).size !== names.length ||
                            names.some(
                                /** Require four-digit SQL names in strictly increasing order, with no duplicate or backward entry. */ (
                                    name,
                                    i
                                ) => {
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
            /** Preserve migration-validation failures but replace database diagnostics with a closed reason. */ () =>
                Effect.fail(new StorageFailure({ operation: 'migrate', reason: 'database' }))
        )
    );
