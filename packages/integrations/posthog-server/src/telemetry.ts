/**
 * @file packages/integrations/posthog-server/src/telemetry.ts
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

import { TelemetryRecord, TelemetrySinkFailure } from '@eventiva/contracts/observability';
import { TelemetryExportBinding, TelemetryExportProvider } from '@eventiva/contracts/telemetry-export';
import { Effect, Layer, Option, Redacted, Schema } from 'effect';
import { PostHog } from 'posthog-node';
import type { PostHogOptions } from './flags.ts';

/**
 * Opt-in correlated diagnostic events, not native Logs, OTLP, audit or ingestion
 * activation. This private client never handles flags, persons, exceptions or AI.
 * Compose only below governedTelemetrySinkLayer, never give it to feature code.
 */
export const postHogTelemetryLayer = (
    settings: PostHogOptions,
    binding: TelemetryExportBinding
): Layer.Layer<TelemetryExportProvider, TelemetrySinkFailure> =>
    Layer.scoped(
        TelemetryExportProvider,
        Effect.gen(
            /** Capture one reviewed destination and own its private no-backlog SDK client. */ function* () {
                // Static classification and destination are host inputs, never selected by a diagnostic record.
                const trusted = yield* Schema.decode(TelemetryExportBinding)(binding).pipe(
                    Effect.mapError(
                        /** Discard rejected provenance and schema diagnostics. */ () =>
                            new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                if (
                    trusted.operation !== 'ordinary' ||
                    trusted.profile === 'restricted' ||
                    trusted.profile === 'vault' ||
                    !/^https:\/\/[a-zA-Z0-9.-]+(?::\d+)?\/?$/.test(settings.host) ||
                    Redacted.value(settings.apiKey).length === 0
                )
                    return yield* new TelemetrySinkFailure({ reason: 'configuration' });
                const mutex = yield* Effect.makeSemaphore(1);
                let closed = false;
                let failed = false;
                let sending = false;
                let requestSignal: AbortSignal | undefined;
                const client = yield* Effect.try({
                    /** Acquire a private SDK instance with no automatic event capture or retry. */
                    // effect-boundary: construct only the already approved PostHog SDK, with all automatic capture off.
                    try: () =>
                        new PostHog(Redacted.value(settings.apiKey), {
                            host: settings.host,
                            disableGeoip: true,
                            sendFeatureFlagEvent: false,
                            enableLocalEvaluation: false,
                            enableExceptionAutocapture: false,
                            privacyMode: true,
                            flushInterval: 0,
                            maxQueueSize: 1,
                            fetchRetryCount: 0,
                            requestTimeout: 1000,
                            /** Forward only the owning capture's cancellable request, never an ambient network signal. */
                            // effect-boundary: the private SDK transport inherits Effect interruption as well as its own deadline.
                            fetch: (url, options) =>
                                fetch(url, {
                                    ...options,
                                    // An interrupted capture can finish SDK preparation later. It must retain its aborted signal.
                                    signal: AbortSignal.any([
                                        requestSignal ?? AbortSignal.abort(),
                                        options.signal ?? AbortSignal.timeout(1000),
                                    ]),
                                }),
                        }),
                    /** Keep SDK construction errors free of credential and vendor details. */
                    catch: () => new TelemetrySinkFailure({ reason: 'configuration' }),
                });
                // sendImmediate reports HTTP/network failures through this event, not a rejected capture promise.
                const removeErrorListener = client.on(
                    'error',
                    /** Remember failure without retaining vendor error objects. */ () => {
                        failed = true;
                    }
                );
                yield* Effect.addFinalizer(
                    /** Close the private client under the same admission lock used by writes. */ () =>
                        mutex.withPermits(1)(
                            Effect.gen(
                                /** Bound resource cleanup without releasing records from an expired grant. */ function* () {
                                    closed = true;
                                    // No queued capture exists to release during shutdown. Still bound the SDK's resource cleanup.
                                    yield* Effect.tryPromise({
                                        /** Release SDK timers/resources; immediate capture retains no payload queue. */
                                        // effect-boundary: the SDK owns timers/resources and exposes promise-based shutdown.
                                        try: () => client.shutdown(1000),
                                        /** Do not propagate SDK resource errors or configuration through disposal. */
                                        catch: () => new TelemetrySinkFailure({ reason: 'flush' }),
                                    }).pipe(Effect.orDie, Effect.ensuring(Effect.sync(removeErrorListener)));
                                }
                            )
                        )
                );
                /** An adapter instance cannot be reused by another tenant, purpose or module generation. */
                const check = (candidate: TelemetryExportBinding) =>
                    Effect.gen(
                        /** Match every authority-bearing field before admitting a provider operation. */ function* () {
                            // A shared provider handle never grants another tenant or generation access to this destination.
                            const decoded = yield* Schema.decode(TelemetryExportBinding)(candidate).pipe(
                                Effect.mapError(
                                    /** Invalid binding diagnostics cannot disclose rejected identifiers. */ () =>
                                        new TelemetrySinkFailure({ reason: 'configuration' })
                                )
                            );
                            if (
                                closed ||
                                trusted.tenantId !== decoded.tenantId ||
                                trusted.moduleId !== decoded.moduleId ||
                                trusted.moduleVersion !== decoded.moduleVersion ||
                                trusted.generation !== decoded.generation ||
                                trusted.profile !== decoded.profile ||
                                trusted.operation !== decoded.operation ||
                                trusted.purpose !== decoded.purpose ||
                                trusted.destinationId !== decoded.destinationId
                            )
                                return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                        }
                    );
                return TelemetryExportProvider.of({
                    /** Send one exact-binding diagnostic immediately, rejecting contention instead of queueing it. */
                    write: (candidate, input) =>
                        mutex
                            .withPermitsIfAvailable(1)(
                                Effect.gen(
                                    /** Preserve cancellable transport ownership through late SDK preparation. */ function* () {
                                        yield* check(candidate);
                                        if (sending) return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                        const record = yield* Schema.decode(TelemetryRecord)(input, {
                                            onExcessProperty: 'error',
                                        }).pipe(
                                            Effect.mapError(
                                                /** Do not retain invalid diagnostic records in typed failures. */ () =>
                                                    new TelemetrySinkFailure({ reason: 'invalid-record' })
                                            )
                                        );
                                        if (record.profile !== trusted.profile)
                                            return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                        failed = false;
                                        yield* Effect.tryPromise({
                                            /** Bind this capture to its interruption signal until the SDK promise settles. */
                                            // effect-boundary: immediate SDK delivery has no offline queue or automatic retry.
                                            try: (signal) => {
                                                requestSignal = signal;
                                                sending = true;
                                                return client
                                                    .captureImmediate({
                                                        distinctId: trusted.destinationId,
                                                        event: `eventiva.telemetry.${record.signal}`,
                                                        timestamp: new Date(record.timestamp),
                                                        disableGeoip: true,
                                                        sendFeatureFlags: false,
                                                        properties: {
                                                            $process_person_profile: false,
                                                            code: record.code,
                                                            level: record.level,
                                                            profile: trusted.profile,
                                                            trace_id: record.traceId,
                                                            span_id: record.spanId,
                                                            parent_span_id: record.parentSpanId,
                                                            duration_ms: record.durationMs,
                                                            outcome: record.outcome,
                                                        },
                                                    })
                                                    .finally(
                                                        /** Release transport ownership only after SDK preparation and sending settle. */ () => {
                                                            // Retain ownership until the SDK settles, even if Effect interruption returned first.
                                                            requestSignal = undefined;
                                                            sending = false;
                                                        }
                                                    );
                                            },
                                            /** Convert rejected transport promises without retaining vendor causes. */
                                            catch: () => new TelemetrySinkFailure({ reason: 'write' }),
                                        });
                                        if (failed) return yield* new TelemetrySinkFailure({ reason: 'write' });
                                    }
                                )
                            )
                            .pipe(
                                Effect.flatMap(
                                    Option.match({
                                        /** Refuse busy admission rather than storing an already-authorized payload. */
                                        onNone: () => Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' })),
                                        /** Preserve successful immediate delivery without a replay queue. */
                                        onSome: () => Effect.void,
                                    })
                                )
                            ),
                    /** Wait behind immediate writes, validating the binding without an SDK payload flush. */
                    flush: (candidate) => mutex.withPermits(1)(check(candidate)),
                });
            }
        )
    );
