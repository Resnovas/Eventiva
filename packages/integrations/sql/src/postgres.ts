/**
 * @file packages/integrations/sql/src/postgres.ts
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

import { PgClient } from '@effect/sql-pg';
import { Config } from 'effect';

/** TCP PostgreSQL, including Neon. Credentials stay redacted; TLS follows the approved connection URL. */
export const client = PgClient.layerConfig({
    url: Config.redacted('DATABASE_URL'),
    maxConnections: Config.integer('DATABASE_POOL_SIZE').pipe(Config.withDefault(4)),
    minConnections: Config.succeed(0),
    connectTimeout: Config.succeed('15 seconds'),
    idleTimeout: Config.succeed('10 seconds'),
    applicationName: Config.succeed('eventiva-storage'),
});
