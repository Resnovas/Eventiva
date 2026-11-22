/**
 * @file packages/integrations/sql/src/telemetry-consent.ts
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

import { SqlClient } from '@effect/sql';
import { TelemetrySinkFailure } from '@eventiva/contracts/observability';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { CorrelationIdentity, TelemetryConsent, TelemetryExportBinding } from '@eventiva/contracts/telemetry-export';
import { Effect, Layer, Redacted, Schema } from 'effect';

const Deadline = Schema.Number.pipe(Schema.int(), Schema.between(0, Number.MAX_SAFE_INTEGER));
const Revision = Schema.Number.pipe(Schema.int(), Schema.between(0, Number.MAX_SAFE_INTEGER - 1));
const Stored = Schema.Struct({ expiresAt: Deadline, version: Revision });

/**
 * Persistent exact-scope consent on the already routed tenant database; never auto-grants or provisions a user.
 *
 * @since 0.0.1
 * @example
 * const program = Effect.provide(exportTelemetry, telemetryConsentStore);
 */
export const telemetryConsentStore = Layer.effect(
    TelemetryConsent,
    Effect.gen(
        /** Capture only the routed client; every operation validates the complete caller binding before SQL. */ function* () {
            const tenant = yield* CurrentTenant;
            const sql = yield* SqlClient.SqlClient;
            /**
             * Discard schema/driver details, which may contain identity or query parameters.
             *
             * @returns The bounded `unavailable` telemetry sink failure.
             */
            const failure = () => new TelemetrySinkFailure({ reason: 'unavailable' });
            /**
             * Decode internal typed inputs too, preventing invalid values reaching persistent authority.
             *
             * @template A - The decoded value.
             * @template I - The encoded input accepted by the schema.
             * @param schema - The schema the input must satisfy exactly, with no excess properties.
             * @param input - The value to decode.
             * @returns The decoded value.
             * @fails {TelemetrySinkFailure} With `unavailable` when the input does not decode.
             */
            const decode = <A, I>(schema: Schema.Schema<A, I>, input: NoInfer<I>) =>
                Schema.decode(schema)(input, { onExcessProperty: 'error' }).pipe(Effect.mapError(failure));
            /**
             * Frame exact case-sensitive identity/session and all release fields; renewal deadlines are not identity.
             *
             * @param binding - The export binding whose tenant must match the routed tenant.
             * @param identity - The correlation identity whose namespace, subject and session join the key.
             * @returns The JSON array key for the exact consent scope.
             * @fails {TelemetrySinkFailure} With `unavailable` for an invalid input or a binding for another tenant.
             */
            const key = (binding: TelemetryExportBinding, identity: CorrelationIdentity) =>
                Effect.gen(
                    /** Keep one tenant database from authorizing a binding routed to a different tenant. */ function* () {
                        const scope = yield* decode(TelemetryExportBinding, binding);
                        const principal = yield* decode(Schema.typeSchema(CorrelationIdentity), identity);
                        if (scope.tenantId !== tenant.id) return yield* failure();
                        // Array framing avoids delimiter ambiguities and intentionally excludes mutable expiry.
                        return JSON.stringify([
                            scope.tenantId,
                            scope.destinationId,
                            scope.purpose,
                            scope.moduleId,
                            scope.moduleVersion,
                            scope.generation,
                            scope.profile,
                            scope.operation,
                            Redacted.value(principal.namespace),
                            Redacted.value(principal.subject),
                            Redacted.value(principal.session),
                        ]);
                    }
                );
            return TelemetryConsent.of({
                /**
                 * Read fresh committed state on every authorization; no accepting cache or missing-row fallback.
                 *
                 * @param binding - The export binding being authorized.
                 * @param identity - The correlation identity being authorized.
                 * @returns The stored expiry and version, or undefined when no consent exists for the exact scope.
                 * @fails {TelemetrySinkFailure} With `unavailable` for invalid input, stored data or a database error.
                 */
                get: (binding, identity) =>
                    Effect.gen(
                        /** Return validated scalar state only, never stored subject material or SQL diagnostics. */ function* () {
                            // A missing exact scope remains absent consent; it must not inherit a different principal's grant.
                            const scope = yield* key(binding, identity);
                            const [row] = yield* sql<{ expires_at: number | string; version: number | string }>`
                                SELECT expires_at, version FROM telemetry_consent WHERE scope = ${scope}`;
                            return row
                                ? yield* decode(Stored, {
                                      expiresAt: Number(row.expires_at),
                                      version: Number(row.version),
                                  })
                                : undefined;
                        }
                    ).pipe(Effect.catchTag('SqlError', failure)),
                /**
                 * Compare-and-set a trusted consent decision; stale writers cannot resurrect a later revocation.
                 *
                 * @param binding - The export binding the decision applies to.
                 * @param identity - The correlation identity the decision applies to.
                 * @param expiresAt - The new consent deadline, a non-negative safe integer timestamp.
                 * @param expectedVersion - The revision the writer last saw, or null to insert the first row.
                 * @returns An effect that completes once exactly one row was inserted or updated.
                 * @fails {TelemetrySinkFailure} With `unavailable` when the row exists, the revision is stale, or SQL fails.
                 */
                put: (binding, identity, expiresAt, expectedVersion) =>
                    Effect.gen(
                        /** A retained revoked row preserves its revision across process restarts and concurrent clients. */ function* () {
                            // Conflict-free insertion or an exact revision update is required; a stale grant must not replace revocation.
                            const scope = yield* key(binding, identity);
                            const deadline = yield* decode(Deadline, expiresAt);
                            const expected = yield* decode(Schema.NullOr(Revision), expectedVersion);
                            const rows =
                                expected === null
                                    ? yield* sql`INSERT INTO telemetry_consent (scope, expires_at, version)
                                    VALUES (${scope}, ${deadline}, 0) ON CONFLICT (scope) DO NOTHING RETURNING version`
                                    : yield* sql`UPDATE telemetry_consent SET expires_at = ${deadline}, version = version + 1
                                    WHERE scope = ${scope} AND version = ${expected} RETURNING version`;
                            if (rows.length !== 1) return yield* failure();
                        }
                    ).pipe(Effect.catchTag('SqlError', failure)),
            });
        }
    )
);
