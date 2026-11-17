/**
 * @file packages/integrations/sql/src/trust.ts
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

import { randomUUID } from 'node:crypto';
import { SqlClient } from '@effect/sql';
import { TrustFailure, TrustPolicy, TrustReplay, TrustRequest } from '@eventiva/contracts/trust';
import { Cause, Effect, Layer, Option, Schema } from 'effect';

/** Standalone durable nonce consumption. Intentionally not wired into application composition. */
export const trustReplay = Layer.effect(
    TrustReplay,
    Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        const failure = (reason: 'invalid' | 'unavailable' | 'replay') => new TrustFailure({ gate: 'replay', reason });
        return TrustReplay.of({
            consume: (request, policy) =>
                Effect.gen(function* () {
                    // Nested SQL transactions are savepoints, not this port's durable commit.
                    // Reject ambient transactions even when they belong to another client.
                    if (Option.isSome(yield* Effect.serviceOption(SqlClient.TransactionConnection)))
                        return yield* failure('unavailable');
                    const checked = yield* Schema.decode(TrustRequest)(request, { onExcessProperty: 'error' }).pipe(
                        Effect.mapError(() => failure('invalid'))
                    );
                    const trusted = yield* Schema.decode(TrustPolicy)(policy, { onExcessProperty: 'error' }).pipe(
                        Effect.mapError(() => failure('invalid'))
                    );
                    const body = yield* Schema.encode(Schema.parseJson(TrustRequest))(checked).pipe(
                        Effect.mapError(() => failure('invalid'))
                    );
                    const audit = yield* Effect.try({
                        // effect-boundary: Node generates an opaque audit UUID, never key material
                        try: () => randomUUID(),
                        catch: () => failure('unavailable'),
                    });
                    return yield* sql.withTransaction(
                        Effect.gen(function* () {
                            // UUID spelling must not allow a second claim through letter casing.
                            const nonce = checked.nonce.toLowerCase();
                            const rows =
                                yield* sql`INSERT INTO trust_replay (nonce, request, consumed_at, audit) VALUES (${nonce}, ${body}, ${trusted.now}, ${audit}) ON CONFLICT (nonce) DO NOTHING RETURNING nonce`;
                            if (rows.length !== 1) return yield* failure('replay');
                            return audit;
                        })
                    );
                }).pipe(
                    Effect.catchAllCause((cause) => {
                        // Cancellation is control flow, never an unavailable receipt decision.
                        if (Cause.isInterrupted(cause)) return Effect.interrupt;
                        const error = Cause.failureOption(cause);
                        return Effect.fail(
                            Option.isSome(error) && error.value instanceof TrustFailure
                                ? error.value
                                : failure('unavailable')
                        );
                    })
                ),
        });
    })
);
