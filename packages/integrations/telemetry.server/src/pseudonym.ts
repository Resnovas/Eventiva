/**
 * @file packages/integrations/telemetry.server/src/pseudonym.ts
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

import { createHmac } from 'node:crypto';
import { TelemetrySinkFailure } from '@eventiva/contracts/observability';
import {
    CorrelationAuthority,
    CorrelationIssuer,
    TelemetryCorrelation,
    TelemetryExportBinding,
    correlationEpochMs,
} from '@eventiva/contracts/telemetry-export';
import { Clock, Config, Effect, Layer, Redacted, Schema } from 'effect';

/** Raw fixture identity stays redacted and server-local; this is not an authentication/issuer endpoint. */
export const FixtureCorrelationIdentity = Schema.Struct({
    namespace: Schema.Redacted(Schema.NonEmptyString),
    subject: Schema.Redacted(Schema.NonEmptyString),
    session: Schema.Redacted(Schema.NonEmptyString),
    expiresAt: Schema.Number.pipe(Schema.int(), Schema.between(1, Number.MAX_SAFE_INTEGER)),
}).annotations({ parseOptions: { onExcessProperty: 'error' } });
export type FixtureCorrelationIdentity = typeof FixtureCorrelationIdentity.Type;

/** Exact injected non-production key scope; no environment or universal-key fallback is permitted. */
export interface FixtureCorrelationKeyScope {
    readonly environment: 'test' | 'development';
    readonly tenantId: TelemetryExportBinding['tenantId'];
    readonly destinationId: string;
    readonly purpose: string;
    readonly epoch: number;
}

/** Fixture-only injection: a new dedicated 256-bit key per exact scope/epoch, never a deployment key. */
export interface FixtureCorrelationKeys {
    /** Return the active exact-scope fixture key, denying missing/revoked/future epochs without fallback. */
    readonly get: (scope: FixtureCorrelationKeyScope) => Effect.Effect<
        {
            readonly scope: FixtureCorrelationKeyScope;
            readonly material: Redacted.Redacted<Uint8Array>;
        },
        TelemetrySinkFailure
    >;
}

/**
 * Local proof only. Deny by default unless NODE_ENV explicitly selects test/development.
 * Consent is a fresh fixture policy read returning its expiry, not a client-carried assertion.
 * Production has no accepting key, identity, issuer, consent-store or network composition.
 */
export const fixtureCorrelationLayer = (
    binding: TelemetryExportBinding,
    identity: FixtureCorrelationIdentity,
    keys: FixtureCorrelationKeys,
    consent: Effect.Effect<number, TelemetrySinkFailure>
): Layer.Layer<CorrelationIssuer | CorrelationAuthority, TelemetrySinkFailure> =>
    Layer.unwrapScoped(
        Effect.gen(
            /** Keep raw identities and key access within this scoped server integration. */ function* () {
                // An omitted environment must never turn fixture cryptography into an accepting production issuer.
                const environment = yield* Config.string('NODE_ENV').pipe(
                    Config.withDefault('production'),
                    Effect.mapError(
                        /** Configuration diagnostics are not safe identity diagnostics. */ () =>
                            new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                if (environment !== 'test' && environment !== 'development')
                    return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                const trusted = yield* Schema.decode(TelemetryExportBinding)(binding).pipe(
                    Effect.mapError(
                        /** Never expose rejected binding fields through schema diagnostics. */ () =>
                            new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                const principal = yield* Schema.decode(Schema.typeSchema(FixtureCorrelationIdentity))(identity).pipe(
                    Effect.mapError(
                        /** Raw fixture identity never appears in the public failure channel. */ () =>
                            new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                let closed = false;
                yield* Effect.addFinalizer(
                    /** Invalidate retained issuer/authority handles after trusted session disposal. */ () =>
                        Effect.sync(
                            /** Scope closure cannot mint, replay or prolong linkage. */ () => {
                                closed = true;
                            }
                        )
                );
                /** Obtain a fresh consent deadline; policy must include exact destination/purpose release and live protection. */
                const authorize = Effect.gen(
                    /** The immutable host floor cannot be waived by a permissive fixture policy. */ function* () {
                        if (
                            closed ||
                            trusted.operation !== 'ordinary' ||
                            trusted.profile === 'restricted' ||
                            trusted.profile === 'vault'
                        )
                            return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                        const expiry = yield* consent;
                        const now = yield* Clock.currentTimeMillis;
                        if (closed || !Number.isSafeInteger(expiry) || expiry <= now || principal.expiresAt <= now)
                            return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                        return Math.min(expiry, principal.expiresAt);
                    }
                );
                /** Derive with current exact-scope keys and recheck policy after asynchronous key preparation. */
                const issue = (optIn: boolean) =>
                    Effect.gen(
                        /** A token is not authority; every issuance and presentation reruns live fixture consent. */ function* () {
                            if (optIn !== true) return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                            yield* authorize;
                            const epoch = Math.floor((yield* Clock.currentTimeMillis) / correlationEpochMs);
                            const key = yield* keys.get({
                                environment,
                                tenantId: trusted.tenantId,
                                destinationId: trusted.destinationId,
                                purpose: trusted.purpose,
                                epoch,
                            });
                            // Key access may suspend across revocation or rotation; an earlier consent result is insufficient.
                            const expiresAt = Math.min(yield* authorize, (epoch + 1) * correlationEpochMs);
                            if (
                                Math.floor((yield* Clock.currentTimeMillis) / correlationEpochMs) !== epoch ||
                                key.scope.epoch !== epoch ||
                                key.scope.environment !== environment ||
                                key.scope.tenantId !== trusted.tenantId ||
                                key.scope.destinationId !== trusted.destinationId ||
                                key.scope.purpose !== trusted.purpose ||
                                Redacted.value(key.material).byteLength !== 32
                            )
                                return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                            return yield* Effect.try({
                                /** Canonical JSON arrays frame opaque UTF-8 strings without delimiter collisions or normalization. */
                                // effect-boundary: Node HMAC can throw; raw preimages and owned key copies never leave this integration.
                                try: () => {
                                    const ownedKey = Uint8Array.from(Redacted.value(key.material));
                                    const scope = [
                                        'eventiva.correlation.v1',
                                        environment,
                                        trusted.tenantId,
                                        trusted.destinationId,
                                        trusted.purpose,
                                        epoch,
                                    ];
                                    /** Separate session/person domains; raw identifiers are neither returned nor logged. */
                                    const hash = (kind: 'person' | 'session') =>
                                        createHmac('sha256', ownedKey)
                                            .update(
                                                JSON.stringify([
                                                    ...scope,
                                                    kind,
                                                    Redacted.value(principal.namespace),
                                                    Redacted.value(principal.subject),
                                                    ...(kind === 'session' ? [Redacted.value(principal.session)] : []),
                                                ]),
                                                'utf8'
                                            )
                                            .digest('hex');
                                    // effect-boundary: Release our HMAC key copy even when the Node crypto primitive throws.
                                    try {
                                        return {
                                            version: 1,
                                            person: hash('person'),
                                            session: hash('session'),
                                            epoch,
                                            expiresAt,
                                        } satisfies TelemetryCorrelation;
                                    } finally {
                                        // Clear only our copy, never the injected owner's buffer; JS strings/crypto copies cannot be proven zeroized.
                                        ownedKey.fill(0);
                                    }
                                },
                                /** Discard crypto/key details instead of retaining a vendor cause. */
                                catch: () => new TelemetrySinkFailure({ reason: 'unavailable' }),
                            });
                        }
                    );
                return Layer.merge(
                    Layer.succeed(CorrelationIssuer, { issue }),
                    Layer.succeed(CorrelationAuthority, {
                        /** Recompute from this scope's trusted fixture identity; possession never authorizes another caller. */
                        authorize: (candidate, input) =>
                            Effect.gen(
                                /** Validate every binding field and token before any provider can serialize correlation. */ function* () {
                                    const decoded = yield* Schema.decode(TelemetryExportBinding)(candidate).pipe(
                                        Effect.mapError(
                                            /** Caller-selected provenance cannot enter public errors. */ () =>
                                                new TelemetrySinkFailure({ reason: 'unavailable' })
                                        )
                                    );
                                    if (
                                        decoded.tenantId !== trusted.tenantId ||
                                        decoded.destinationId !== trusted.destinationId ||
                                        decoded.purpose !== trusted.purpose ||
                                        decoded.moduleId !== trusted.moduleId ||
                                        decoded.moduleVersion !== trusted.moduleVersion ||
                                        decoded.generation !== trusted.generation ||
                                        decoded.profile !== trusted.profile ||
                                        decoded.operation !== trusted.operation
                                    )
                                        return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                    const token = yield* Schema.decode(TelemetryCorrelation)(input).pipe(
                                        Effect.mapError(
                                            /** No input or schema cause crosses the failure boundary. */ () =>
                                                new TelemetrySinkFailure({ reason: 'unavailable' })
                                        )
                                    );
                                    // Re-derivation binds possession to this trusted principal without a stored reverse-ID map.
                                    const current = yield* issue(true);
                                    const now = yield* Clock.currentTimeMillis;
                                    if (
                                        token.person !== current.person ||
                                        token.session !== current.session ||
                                        token.epoch !== current.epoch ||
                                        token.expiresAt <= now ||
                                        token.expiresAt > current.expiresAt
                                    )
                                        return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                }
                            ),
                    })
                );
            }
        )
    );
