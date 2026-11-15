/**
 * @file packages/integrations/sql/src/values.ts
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

import { randomBytes } from 'node:crypto';
import { UuidV7, StorageFailure } from '@eventiva/contracts/storage';
import { Clock, Effect, Schema } from 'effect';

/** Application-generated UUIDv7: PostgreSQL 17 needs no extension or PG18-only function. */
export const uuidV7 = Effect.gen(function* () {
    const now = yield* Clock.currentTimeMillis;
    const bytes = yield* Effect.try({
        // effect-boundary: cryptographically secure randomness is a Node capability
        try: () => randomBytes(16),
        catch: (cause) => new StorageFailure({ operation: 'uuid-randomness', cause }),
    });
    bytes.writeUIntBE(now, 0, 6);
    bytes[6] = (bytes[6]! & 15) | 112;
    bytes[8] = (bytes[8]! & 63) | 128;
    const hex = bytes.toString('hex');
    return yield* Schema.decodeUnknown(UuidV7)(
        `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
    ).pipe(Effect.mapError((cause) => new StorageFailure({ operation: 'uuid-v7', cause })));
});
