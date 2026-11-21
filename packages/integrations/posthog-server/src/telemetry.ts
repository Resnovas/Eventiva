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
 *
 * The binding's static classification and destination are host inputs, never chosen by a diagnostic record. Only
 * ordinary operations on profiles other than restricted and vault, an HTTPS host and a non-empty key are accepted.
 * Each write is sent immediately with no queue, retry or backlog; a busy client refuses rather than queues.
 *
 * @since 0.0.1
 * @param settings - The redacted PostHog key and host.
 * @param binding - The reviewed export binding: tenant, module, generation, profile, purpose and destination.
 * @returns A scoped layer providing one `TelemetryExportProvider` locked to that binding.
 * @fails {TelemetrySinkFailure} With reason `configuration` when the binding, host or key is not accepted.
 * @example
 * const exporter = postHogTelemetryLayer({ apiKey: Redacted.make(key), host: 'https://eu.i.posthog.com' }, binding);
 */
export const postHogTelemetryLayer = (
    settings: PostHogOptions,
    binding: TelemetryExportBinding
): Layer.Layer<TelemetryExportProvider, TelemetrySinkFailure> =>
    Layer.scoped(
        TelemetryExportProvider,
        Effect.gen(
            /** Capture one reviewed destination and own its private no-backlog SDK client. */ function* () {
                const trusted = yield* Schema.decode(TelemetryExportBinding)(binding).pipe(
                    Effect.mapError(
                        /**
                         * Discard rejected provenance and schema diagnostics.
                         *
                         * @returns The bounded configuration failure.
                         */
                        () => new TelemetrySinkFailure({ reason: 'configuration' })
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
                    /**
                     * Acquire a private SDK instance with no automatic event capture or retry.
                     *
                     * @returns The private PostHog client.
                     */
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
                            /**
                             * Forward only the owning capture's cancellable request, never an ambient network signal. An
                             * interrupted capture can finish SDK preparation later, so it keeps its aborted signal.
                             *
                             * @param url - The PostHog endpoint the SDK is calling.
                             * @param options - The SDK's request options.
                             * @returns The response promise, cancelled with the capture or after one second.
                             */
                            // effect-boundary: the private SDK transport inherits Effect interruption as well as its own deadline.
                            fetch: (url, options) =>
                                fetch(url, {
                                    ...options,
                                    signal: AbortSignal.any([
                                        requestSignal ?? AbortSignal.abort(),
                                        options.signal ?? AbortSignal.timeout(1000),
                                    ]),
                                }),
                        }),
                    /**
                     * Keep SDK construction errors free of credential and vendor details.
                     *
                     * @returns The bounded configuration failure.
                     */
                    catch: () => new TelemetrySinkFailure({ reason: 'configuration' }),
                });
                const removeErrorListener = client.on(
                    'error',
                    /** Remember failure without retaining vendor error objects; immediate capture reports HTTP and network failures through this event, not a rejected promise. */ () => {
                        failed = true;
                    }
                );
                yield* Effect.addFinalizer(
                    /**
                     * Close the private client under the same admission lock used by writes.
                     *
                     * @returns An Effect that marks the provider closed and shuts the client down within one second.
                     */
                    () =>
                        mutex.withPermits(1)(
                            Effect.gen(
                                /** Bound resource cleanup without releasing records from an expired grant; no queued capture exists to release. */ function* () {
                                    closed = true;
                                    yield* Effect.tryPromise({
                                        /**
                                         * Release SDK timers/resources; immediate capture retains no payload queue.
                                         *
                                         * @returns The SDK's shutdown promise, bounded to one second.
                                         */
                                        // effect-boundary: the SDK owns timers/resources and exposes promise-based shutdown.
                                        try: () => client.shutdown(1000),
                                        /**
                                         * Do not propagate SDK resource errors or configuration through disposal.
                                         *
                                         * @returns The bounded flush failure.
                                         */
                                        catch: () => new TelemetrySinkFailure({ reason: 'flush' }),
                                    }).pipe(Effect.orDie, Effect.ensuring(Effect.sync(removeErrorListener)));
                                }
                            )
                        )
                );
                /**
                 * An adapter instance cannot be reused by another tenant, purpose or module generation: a shared
                 * provider handle never grants another tenant or generation access to this destination.
                 *
                 * @param candidate - The binding the caller presents for this operation.
                 * @returns An Effect that succeeds only when every authority-bearing field matches the trusted binding.
                 */
                const check = (candidate: TelemetryExportBinding) =>
                    Effect.gen(
                        /** Match every authority-bearing field before admitting a provider operation. */ function* () {
                            const decoded = yield* Schema.decode(TelemetryExportBinding)(candidate).pipe(
                                Effect.mapError(
                                    /**
                                     * Invalid binding diagnostics cannot disclose rejected identifiers.
                                     *
                                     * @returns The bounded configuration failure.
                                     */
                                    () => new TelemetrySinkFailure({ reason: 'configuration' })
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
                    /**
                     * Send one exact-binding diagnostic immediately, rejecting contention instead of queueing it.
                     *
                     * @param candidate - The binding the caller presents; it must match the trusted binding exactly.
                     * @param input - The diagnostic record, decoded strictly before sending.
                     * @returns An Effect that sends the record once.
                     */
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
                                                /**
                                                 * Do not retain invalid diagnostic records in typed failures.
                                                 *
                                                 * @returns The bounded invalid-record failure.
                                                 */
                                                () => new TelemetrySinkFailure({ reason: 'invalid-record' })
                                            )
                                        );
                                        if (record.profile !== trusted.profile)
                                            return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                        failed = false;
                                        yield* Effect.tryPromise({
                                            /**
                                             * Bind this capture to its interruption signal until the SDK promise settles, so
                                             * cancellation stays with this request rather than a later call on the retained client.
                                             *
                                             * @param signal - Effect's interruption signal for this write.
                                             * @returns The SDK's promise for the immediate capture.
                                             */
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
                                                        /** Release transport ownership only after SDK preparation and sending settle, even if Effect interruption returned first. */ () => {
                                                            requestSignal = undefined;
                                                            sending = false;
                                                        }
                                                    );
                                            },
                                            /**
                                             * Convert rejected transport promises without retaining vendor causes.
                                             *
                                             * @returns The bounded write failure.
                                             */
                                            catch: () => new TelemetrySinkFailure({ reason: 'write' }),
                                        });
                                        if (failed) return yield* new TelemetrySinkFailure({ reason: 'write' });
                                    }
                                )
                            )
                            .pipe(
                                Effect.flatMap(
                                    Option.match({
                                        /**
                                         * Refuse busy admission rather than storing an already-authorized payload.
                                         *
                                         * @returns A failed Effect with reason `unavailable`.
                                         */
                                        onNone: () => Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' })),
                                        /**
                                         * Preserve successful immediate delivery without a replay queue.
                                         *
                                         * @returns An Effect that succeeds with nothing.
                                         */
                                        onSome: () => Effect.void,
                                    })
                                )
                            ),
                    /**
                     * Wait behind immediate writes, validating the binding without an SDK payload flush.
                     *
                     * @param candidate - The binding the caller presents.
                     * @returns An Effect that succeeds once in-flight writes finish and the binding matches.
                     */
                    flush: (candidate) => mutex.withPermits(1)(check(candidate)),
                });
            }
        )
    );
