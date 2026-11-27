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

/**
 * Standalone durable nonce consumption. Intentionally not wired into application composition.
 *
 * @since 0.0.1
 * @example
 * const program = Effect.provide(verifyWebhook, trustReplay);
 */
export const trustReplay = Layer.effect(
    TrustReplay,
    Effect.gen(
        /** Capture the replay database; callers still supply already-verified request and trusted policy metadata. */ function* () {
            const sql = yield* SqlClient.SqlClient;
            /**
             * Restrict replay-store failures to bounded reasons without leaking request or SQL content.
             *
             * @param reason - The bounded replay failure reason to report.
             * @returns A TrustFailure for the `replay` gate carrying only that reason.
             */
            const failure = (reason: 'invalid' | 'unavailable' | 'replay') =>
                new TrustFailure({ gate: 'replay', reason });
            return TrustReplay.of({
                /**
                 * Durably consume the case-normalized nonce once; this adapter does not perform the upstream verifier gates.
                 *
                 * @param request - The already-verified trust request whose nonce is consumed; excess properties are refused.
                 * @param policy - The trusted policy metadata supplying the consumption time; excess properties are refused.
                 * @returns The opaque audit reference recorded with the consumed nonce.
                 * @fails {TrustFailure} With `invalid` for malformed input, `replay` when the nonce was already consumed, or `unavailable` inside an ambient transaction or on any infrastructure failure.
                 */
                consume: (request, policy) =>
                    Effect.gen(
                        /** Validate metadata and commit nonce consumption independently of any caller transaction. */ function* () {
                            // Nested SQL transactions are savepoints, not this port's durable commit.
                            // Reject ambient transactions even when they belong to another client.
                            if (Option.isSome(yield* Effect.serviceOption(SqlClient.TransactionConnection)))
                                return yield* failure('unavailable');
                            const checked = yield* Schema.decode(TrustRequest)(request, {
                                onExcessProperty: 'error',
                            }).pipe(
                                Effect.mapError(
                                    /**
                                     * Hide request-validation diagnostics from the trust boundary.
                                     *
                                     * @returns A TrustFailure with the `invalid` reason.
                                     */
                                    () => failure('invalid')
                                )
                            );
                            const trusted = yield* Schema.decode(TrustPolicy)(policy, {
                                onExcessProperty: 'error',
                            }).pipe(
                                Effect.mapError(
                                    /**
                                     * Reject malformed policy without disclosing its fields.
                                     *
                                     * @returns A TrustFailure with the `invalid` reason.
                                     */
                                    () => failure('invalid')
                                )
                            );
                            const body = yield* Schema.encode(Schema.parseJson(TrustRequest))(checked).pipe(
                                Effect.mapError(
                                    /**
                                     * Refuse an unencodable retained request with a bounded failure.
                                     *
                                     * @returns A TrustFailure with the `invalid` reason.
                                     */
                                    () => failure('invalid')
                                )
                            );
                            const audit = yield* Effect.try({
                                /**
                                 * Generate an opaque evidence reference, not proof of verification or key release.
                                 *
                                 * @returns A random UUID used as the audit reference.
                                 */
                                // effect-boundary: Node generates an opaque audit UUID, never key material
                                try: () => randomUUID(),
                                /**
                                 * Fail closed when the local audit reference cannot be generated.
                                 *
                                 * @returns A TrustFailure with the `unavailable` reason.
                                 */
                                catch: () => failure('unavailable'),
                            });
                            return yield* sql.withTransaction(
                                Effect.gen(
                                    /** Let the nonce uniqueness constraint choose the sole consumer before returning its audit reference. */ function* () {
                                        // UUID spelling must not allow a second claim through letter casing.
                                        const nonce = checked.nonce.toLowerCase();
                                        const rows =
                                            yield* sql`INSERT INTO trust_replay (nonce, request, consumed_at, audit) VALUES (${nonce}, ${body}, ${trusted.now}, ${audit}) ON CONFLICT (nonce) DO NOTHING RETURNING nonce`;
                                        if (rows.length !== 1) return yield* failure('replay');
                                        return audit;
                                    }
                                )
                            );
                        }
                    ).pipe(
                        Effect.catchAllCause(
                            /**
                             * Preserve interruption and typed trust failures while sanitizing unknown infrastructure causes.
                             *
                             * @param cause - The full failure cause of the consumption attempt.
                             * @returns An interruption, the original TrustFailure, or a TrustFailure with the `unavailable` reason.
                             */
                            (cause) => {
                                // Cancellation is control flow, never an unavailable receipt decision.
                                if (Cause.isInterrupted(cause)) return Effect.interrupt;
                                const error = Cause.failureOption(cause);
                                return Effect.fail(
                                    Option.isSome(error) && error.value instanceof TrustFailure
                                        ? error.value
                                        : failure('unavailable')
                                );
                            }
                        )
                    ),
            });
        }
    )
);
