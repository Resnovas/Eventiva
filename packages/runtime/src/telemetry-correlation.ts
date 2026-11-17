/**
 * @file packages/runtime/src/telemetry-correlation.ts
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

import { Flags, type Flag } from '@eventiva/contracts/flags';
import { TelemetrySink, TelemetrySinkFailure } from '@eventiva/contracts/observability';
import {
    CorrelationAuthority,
    CorrelationIssuer,
    CorrelationProvider,
    TelemetryCorrelation,
    TelemetryExportAuthority,
    TelemetryExportProvider,
    correlationEpochMs,
    TelemetryExportBinding,
    type TelemetryExportOperation,
    type TelemetryExportPolicy,
} from '@eventiva/contracts/telemetry-export';
import { Cause, Clock, Effect, Layer, Option, Ref, Schema } from 'effect';
import { governedTelemetrySinkLayer, telemetryExportFlag } from './telemetry-export.ts';

/** Separate default-off gate; neither this nor export opt-in represents user consent. */
export const pseudonymousCorrelationFlag: Flag = {
    key: 'telemetry.correlation.pseudonymous.enabled',
    owner: 'platform',
    description: 'Allow governed pseudonymous correlation with current per-request consent.',
    safeDefault: false,
};

/** Validate strict token syntax and the current hourly lease without accepting future or expired tokens. */
const currentToken = (input: TelemetryCorrelation) =>
    Effect.gen(
        /** Trust Clock rather than request timestamps when checking release lifetime. */ function* () {
            // Detach the envelope so a caller cannot mutate a validated pair during asynchronous release checks.
            const token = yield* Schema.decode(TelemetryCorrelation)(input).pipe(
                Effect.mapError(
                    /** Decoder causes can retain input; expose only the bounded reason. */ () =>
                        new TelemetrySinkFailure({ reason: 'unavailable' })
                )
            );
            const now = yield* Clock.currentTimeMillis;
            if (
                token.epoch !== Math.floor(now / correlationEpochMs) ||
                token.expiresAt <= now ||
                token.expiresAt > (token.epoch + 1) * correlationEpochMs
            )
                return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
            return token;
        }
    );

/**
 * Portable scoped refresh model for a trusted issuer. Acquisition and business reads never wait for issuance.
 * A missing/late token omits optional linkage; it never retries or cancels a user action. No SDK headers/storage.
 */
export const correlationSession = Effect.gen(
    /** Own the refresh fiber and cache in the client's session scope, never in a detached daemon. */ function* () {
        // Keep issuance off the business path; a cache miss is optional telemetry loss, not a request dependency.
        const issuer = yield* CorrelationIssuer;
        const cache = yield* Ref.make(Option.none<TelemetryCorrelation>());
        let closed = false;
        yield* Effect.addFinalizer(
            /** Retained readers must not expose a token after logout/session disposal. */ () =>
                Effect.sync(
                    /** Scope disposal revokes cached linkage without contacting the issuer. */ () => {
                        closed = true;
                    }
                )
        );
        const refresh = issuer.issue(true).pipe(
            Effect.flatMap(currentToken),
            Effect.timeoutOption(1000),
            Effect.catchAllCause(
                /** Issuer failures/defects are telemetry loss; preserve session-scope interruption ownership. */ (
                    cause
                ) =>
                    Cause.isInterruptedOnly(cause)
                        ? Effect.failCause(Cause.stripFailures(cause))
                        : Effect.succeed(Option.none<TelemetryCorrelation>())
            ),
            Effect.flatMap(
                /** Replace rather than alias epochs; a failed refresh cannot extend an old token. */ (token) =>
                    Ref.set(cache, token)
            )
        );
        yield* Effect.gen(
            /** Retry only optional issuance, with a bounded delay; never replay a business request. */ function* () {
                while (true) {
                    yield* refresh;
                    const token = yield* Ref.get(cache);
                    const now = yield* Clock.currentTimeMillis;
                    // Expiry can pass before this clock read; a positive sleep floor prevents a hot renewal loop.
                    const delay = Option.isSome(token) ? Math.max(1, token.value.expiresAt - now) : 1000;
                    yield* Effect.sleep(delay);
                }
            }
        ).pipe(Effect.forkScoped);
        return {
            /** Snapshot optional pseudonyms for this request only; expiry/failure is silent omission, not blocking IO. */
            current: (optIn: boolean) =>
                Effect.gen(
                    /** A late background refresh must not authorize an expired in-flight request. */ function* () {
                        if (closed || optIn !== true) return Option.none<TelemetryCorrelation>();
                        const token = yield* Ref.get(cache);
                        if (Option.isNone(token)) return token;
                        return yield* currentToken(token.value).pipe(Effect.option);
                    }
                ),
        };
    }
);

/**
 * Capture one trusted request's opt-in/token outside the identity-free telemetry queue.
 * Reuse the existing catalog/minimizer and general release checks; a correlated provider is mandatory.
 */
export const governedCorrelationSinkLayer = (
    binding: TelemetryExportBinding,
    policy: TelemetryExportPolicy,
    request: { readonly optIn: boolean; readonly correlation: TelemetryCorrelation }
): Layer.Layer<
    TelemetrySink,
    TelemetrySinkFailure,
    Flags | TelemetryExportAuthority | CorrelationAuthority | CorrelationProvider
> =>
    governedTelemetrySinkLayer(binding, policy).pipe(
        Layer.provide(
            Layer.scoped(
                TelemetryExportProvider,
                Effect.gen(
                    /** Detach request metadata once; caller mutation cannot swap an in-flight principal. */ function* () {
                        const trustedBinding = yield* Schema.decode(TelemetryExportBinding)(binding).pipe(
                            Effect.mapError(
                                /** Do not retain invalid provenance in a request capability. */ () =>
                                    new TelemetrySinkFailure({ reason: 'configuration' })
                            )
                        );
                        // Rotation may authorize later requests, never relabel this request's queued records with a fresh pair.
                        const token = yield* currentToken(request.correlation);
                        const optIn = request.optIn === true;
                        const authority = yield* CorrelationAuthority;
                        const general = yield* TelemetryExportAuthority;
                        const provider = yield* CorrelationProvider;
                        const flags = yield* Flags;
                        let closed = false;
                        yield* Effect.addFinalizer(
                            /** Revoke even provider-held dispatch callbacks when the request scope closes. */ () =>
                                Effect.sync(
                                    /** Do not drain or replay optional correlation at disposal. */ () => {
                                        closed = true;
                                    }
                                )
                        );
                        /** Reauthorize at delivery and again through the transport's final dispatch callback. */
                        const release = (operation: TelemetryExportOperation) =>
                            Effect.gen(
                                /** Recheck after asynchronous policy work so expiry/revocation cannot borrow an earlier result. */ function* () {
                                    // This static floor also applies when injected live policy is overly permissive.
                                    if (
                                        closed ||
                                        !optIn ||
                                        trustedBinding.operation !== 'ordinary' ||
                                        trustedBinding.profile === 'restricted' ||
                                        trustedBinding.profile === 'vault'
                                    )
                                        return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                    yield* currentToken(token);
                                    for (const flag of [pseudonymousCorrelationFlag, telemetryExportFlag]) {
                                        if (!(yield* flags.evaluate(flag)).value)
                                            return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                    }
                                    // All lease/binding fields are scalar; disposable views keep adapter writes out of later fences.
                                    yield* general.authorize({ ...trustedBinding }, operation);
                                    yield* authority.authorize({ ...trustedBinding }, { ...token });
                                    yield* currentToken(token);
                                    if (closed) return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                }
                            );
                        return TelemetryExportProvider.of({
                            /** Identity-free projected records receive only this request's validated pair at dispatch. */
                            write: (trusted, record) =>
                                release(record.signal).pipe(
                                    Effect.zipRight(
                                        provider.write(trusted, record, { ...token }, release(record.signal))
                                    )
                                ),
                            /** No provider backlog exists; a flush is only a fresh authority check. */
                            flush: () => release('flush'),
                        });
                    }
                )
            )
        )
    );
