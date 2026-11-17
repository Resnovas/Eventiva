/**
 * @file packages/integrations/sql/src/sqlite.ts
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

import { SqliteClient } from '@effect/sql-sqlite-node';
import { SqlClient } from '@effect/sql';
import { Effect, Layer } from 'effect';

/** Node conformance only. Uses the package's bundled prebuild, never a build-script allowance. */
export const memory = () =>
    Layer.effectDiscard(
        Effect.gen(
            /** Enable referential integrity on the in-memory conformance connection before exposing it. */ function* () {
                const sql = yield* SqlClient.SqlClient;
                yield* sql`PRAGMA foreign_keys = ON`;
            }
        )
    ).pipe(Layer.provideMerge(SqliteClient.layer({ filename: ':memory:' })));
