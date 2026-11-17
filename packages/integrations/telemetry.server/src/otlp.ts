/**
 * @file packages/integrations/telemetry.server/src/otlp.ts
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

import * as OtlpSerialization from '@effect/opentelemetry/OtlpSerialization';
import * as FetchHttpClient from '@effect/platform/FetchHttpClient';
import * as HttpClient from '@effect/platform/HttpClient';
import * as HttpClientRequest from '@effect/platform/HttpClientRequest';
import { TelemetryRecord, TelemetrySinkFailure } from '@eventiva/contracts/observability';
import { TelemetryExportBinding, TelemetryExportProvider } from '@eventiva/contracts/telemetry-export';
import { Cause, Config, Effect, Layer, Option, Redacted, Schema, Stream } from 'effect';

/** Trusted composition settings; credentials and destination stay redacted, never record-selected. */
export interface OtlpOptions {
    readonly enabled: boolean;
    readonly endpoint: Redacted.Redacted<string>;
    /** JSON object of HTTP header names and values, decoded only when explicitly enabled. */
    readonly headers: Redacted.Redacted<string>;
    readonly timeoutMs: number;
}

/** Optional OTLP/HTTP JSON trace export is off by default; enabling alone grants no remote-release authority. */
export const otlpConfig: Config.Config<OtlpOptions> = Config.all({
    enabled: Config.boolean('enabled').pipe(Config.withDefault(false)),
    endpoint: Config.redacted('endpoint').pipe(Config.withDefault(Redacted.make('http://127.0.0.1:4318/v1/traces'))),
    headers: Config.redacted('headers').pipe(Config.withDefault(Redacted.make('{}'))),
    timeoutMs: Config.integer('timeoutMs').pipe(Config.withDefault(1000)),
}).pipe(Config.nested('otlp'), Config.nested('telemetry'));

/** Only bounded printable headers can reach the trusted collector; transport/framing headers are reserved. */
const HeaderValues = Schema.Record({
    key: Schema.String.pipe(Schema.pattern(/^[A-Za-z][A-Za-z0-9-]{0,63}$/)),
    value: Schema.String.pipe(Schema.maxLength(2048), Schema.pattern(/^[\x20-\x7e]*$/)),
}).pipe(
    Schema.filter(
        /** Reject ambiguous casing and transport overrides before creating an HTTP request. */ (headers) => {
            const names = Object.keys(headers).map(
                /** HTTP names are case-insensitive, including reserved framing headers. */ (name) => name.toLowerCase()
            );
            return (
                names.length <= 16 &&
                new Set(names).size === names.length &&
                !names.some(
                    /** Authentication is configurable, but routing/framing and trace propagation are not. */ (name) =>
                        [
                            'host',
                            'content-length',
                            'content-type',
                            'connection',
                            'transfer-encoding',
                            'traceparent',
                            'tracestate',
                        ].includes(name)
                )
            );
        }
    )
);

/** A collector can reject spans even with HTTP 200; never interpret that response as successful delivery. */
const ExportResponse = Schema.parseJson(
    Schema.Struct({
        partialSuccess: Schema.optional(
            Schema.Struct({
                rejectedSpans: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
                errorMessage: Schema.optional(Schema.String),
            })
        ),
    })
);

/**
 * Export authorized spans below governedTelemetrySinkLayer, never directly from features.
 * Uses Effect's OTLP serializer without its batching/retry exporter: a retained batch
 * could outlive a grant, and swallowed HTTP failures cannot acknowledge delivery.
 * Supply an un-retried HttpClient (normally FetchHttpClient.layer); no network is acquired here.
 */
export const otlpTelemetryLayer = (
    binding: TelemetryExportBinding,
    configuration: Config.Config<OtlpOptions> = otlpConfig
): Layer.Layer<TelemetryExportProvider, TelemetrySinkFailure, HttpClient.HttpClient> =>
    Layer.scoped(
        TelemetryExportProvider,
        Effect.gen(
            /** Capture a single trusted binding and retain no record queue or retry state. */ function* () {
                const settings = yield* configuration.pipe(
                    Effect.mapError(
                        /** Config diagnostics may contain header values, so discard their complete cause. */ () =>
                            new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                if (!settings.enabled)
                    return TelemetryExportProvider.of({
                        /** Disabled export deliberately performs no validation, serialization or network work. */
                        write: () => Effect.void,
                        /** A disabled exporter has no retained payloads to drain. */
                        flush: () => Effect.void,
                    });
                // Decode host settings only after opt-in; no process environment/resource attributes are copied.
                const trusted = yield* Schema.decode(TelemetryExportBinding)(binding).pipe(
                    Effect.mapError(
                        /** Rejected provenance must not appear in configuration diagnostics. */ () =>
                            new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                const endpoint = yield* Effect.try({
                    /** Parse the trusted endpoint without retaining malformed URLs in failures. */
                    // effect-boundary: URL parsing can throw; keep destination values within this adapter.
                    try: () => new URL(Redacted.value(settings.endpoint)),
                    /** Never expose destination credentials or malformed URL text. */
                    catch: () => new TelemetrySinkFailure({ reason: 'configuration' }),
                });
                if (
                    trusted.operation !== 'ordinary' ||
                    trusted.profile === 'restricted' ||
                    trusted.profile === 'vault' ||
                    (endpoint.protocol !== 'https:' &&
                        !(
                            endpoint.protocol === 'http:' &&
                            ['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname)
                        )) ||
                    endpoint.username !== '' ||
                    endpoint.password !== '' ||
                    endpoint.search !== '' ||
                    endpoint.hash !== '' ||
                    !Number.isInteger(settings.timeoutMs) ||
                    settings.timeoutMs < 1 ||
                    settings.timeoutMs > 10000
                )
                    return yield* new TelemetrySinkFailure({ reason: 'configuration' });
                const headers = yield* Schema.decode(Schema.parseJson(HeaderValues))(
                    Redacted.value(settings.headers)
                ).pipe(
                    Effect.mapError(
                        /** Parsing errors can include credentials; report only the closed safe reason. */ () =>
                            new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                const client = HttpClient.filterStatusOk(yield* HttpClient.HttpClient);
                const serialization = yield* OtlpSerialization.OtlpSerialization;
                const mutex = yield* Effect.makeSemaphore(1);
                let closed = false;
                yield* Effect.addFinalizer(
                    /** Revoke retained handles before waiting for the bounded in-flight request to finish. */ () =>
                        Effect.sync(
                            /** Scope closure cannot trigger a payload replay or a network flush. */ () => {
                                closed = true;
                            }
                        ).pipe(Effect.zipRight(mutex.withPermits(1)(Effect.void)))
                );
                /** Match all authority-bearing fields on every provider call, including a payload-free flush. */
                const check = (candidate: TelemetryExportBinding) =>
                    Effect.gen(
                        /** Reject cross-tenant, stale-generation and protected reuse before serialization. */ function* () {
                            const decoded = yield* Schema.decode(TelemetryExportBinding)(candidate).pipe(
                                Effect.mapError(
                                    /** Invalid binding details cannot escape through a provider handle. */ () =>
                                        new TelemetrySinkFailure({ reason: 'unavailable' })
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
                    /** Send one minimized span once; logs are outside this trace-only adapter's contract. */
                    write: (candidate, input) =>
                        mutex
                            .withPermitsIfAvailable(1)(
                                Effect.gen(
                                    /** Preserve original correlation/timing while dropping text, arbitrary attributes and identity. */ function* () {
                                        yield* check(candidate);
                                        const record = yield* Schema.decode(TelemetryRecord)(input, {
                                            onExcessProperty: 'error',
                                        }).pipe(
                                            Effect.mapError(
                                                /** Never retain the rejected diagnostic payload. */ () =>
                                                    new TelemetrySinkFailure({ reason: 'invalid-record' })
                                            )
                                        );
                                        if (record.profile !== trusted.profile)
                                            return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                        if (record.signal !== 'span') return;
                                        const endMs = Date.parse(record.timestamp);
                                        if (
                                            !Number.isSafeInteger(endMs) ||
                                            endMs < 0 ||
                                            new Date(endMs).toISOString() !== record.timestamp ||
                                            !/[1-9a-f]/.test(record.traceId) ||
                                            !/[1-9a-f]/.test(record.spanId) ||
                                            (record.parentSpanId !== '' && !/[1-9a-f]/.test(record.parentSpanId))
                                        )
                                            return yield* new TelemetrySinkFailure({ reason: 'invalid-record' });
                                        const end = BigInt(endMs) * 1000000n;
                                        const duration =
                                            BigInt(Math.trunc(record.durationMs)) * 1000000n +
                                            BigInt(Math.round((record.durationMs % 1) * 1000000));
                                        if (duration > end || end > 18446744073709551615n)
                                            return yield* new TelemetrySinkFailure({ reason: 'invalid-record' });
                                        const body = serialization.traces({
                                            resourceSpans: [
                                                {
                                                    resource: {
                                                        attributes: [
                                                            { key: 'service.name', value: { stringValue: 'eventiva' } },
                                                        ],
                                                    },
                                                    scopeSpans: [
                                                        {
                                                            scope: { name: '@eventiva/integrations.telemetry.server' },
                                                            spans: [
                                                                {
                                                                    traceId: record.traceId,
                                                                    spanId: record.spanId,
                                                                    ...(record.parentSpanId === ''
                                                                        ? {}
                                                                        : { parentSpanId: record.parentSpanId }),
                                                                    name: record.code,
                                                                    kind: 1,
                                                                    startTimeUnixNano: String(end - duration),
                                                                    endTimeUnixNano: String(end),
                                                                    attributes: [],
                                                                    events: [],
                                                                    links: [],
                                                                    status: {
                                                                        code:
                                                                            record.outcome === 'failed'
                                                                                ? 2
                                                                                : record.outcome === 'succeeded'
                                                                                  ? 1
                                                                                  : 0,
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        });
                                        // Disable HTTP instrumentation and redirects so endpoint/header secrets never become spans or move hosts.
                                        const request = HttpClientRequest.post(endpoint, { headers }).pipe(
                                            HttpClientRequest.setBody(body)
                                        );
                                        yield* client.execute(request).pipe(
                                            Effect.flatMap(
                                                /** Validate the bounded collector acknowledgement, including OTLP partial failures. */ (
                                                    response
                                                ) => {
                                                    // Fetch response.text ignores Platform's MaxBodySize; cap streamed bytes before decoding.
                                                    let received = 0;
                                                    return response.stream.pipe(
                                                        Stream.mapEffect(
                                                            /** Reject oversized acknowledgements without retaining the collector's error body. */ (
                                                                chunk
                                                            ) => {
                                                                received += chunk.byteLength;
                                                                return received > 16384
                                                                    ? Effect.fail(
                                                                          new TelemetrySinkFailure({ reason: 'write' })
                                                                      )
                                                                    : Effect.succeed(chunk);
                                                            }
                                                        ),
                                                        Stream.decodeText(),
                                                        Stream.runFold(
                                                            '',
                                                            /** Join only the already bounded UTF-8 acknowledgement. */ (
                                                                text,
                                                                chunk
                                                            ) => text + chunk
                                                        )
                                                    );
                                                }
                                            ),
                                            Effect.flatMap(
                                                /** Empty acknowledgements carry no rejection; nonempty responses must be valid OTLP JSON. */ (
                                                    text
                                                ) => Schema.decode(ExportResponse)(text === '' ? '{}' : text)
                                            ),
                                            Effect.flatMap(
                                                /** Fail closed on rejected spans or collector warnings without retaining their text. */ (
                                                    response
                                                ) =>
                                                    Number(response.partialSuccess?.rejectedSpans ?? 0) !== 0 ||
                                                    (response.partialSuccess?.errorMessage ?? '') !== ''
                                                        ? Effect.fail(new TelemetrySinkFailure({ reason: 'write' }))
                                                        : Effect.void
                                            ),
                                            Effect.provideService(FetchHttpClient.RequestInit, { redirect: 'manual' }),
                                            Effect.withTracerEnabled(false),
                                            Effect.timeoutFail({
                                                duration: settings.timeoutMs,
                                                /** Timeout acknowledgement is bounded and never includes endpoint or request headers. */
                                                onTimeout: () => new TelemetrySinkFailure({ reason: 'timeout' }),
                                            }),
                                            Effect.catchAllCause(
                                                /** Strip HTTP/schema diagnostics but preserve caller cancellation and its ownership semantics. */ (
                                                    cause
                                                ) =>
                                                    Cause.isInterruptedOnly(cause)
                                                        ? Effect.failCause(Cause.stripFailures(cause))
                                                        : Effect.fail(new TelemetrySinkFailure({ reason: 'write' }))
                                            )
                                        );
                                    }
                                )
                            )
                            .pipe(
                                Effect.flatMap(
                                    Option.match({
                                        /** Refuse contention rather than retaining a span whose release grant can expire. */
                                        onNone: () => Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' })),
                                        /** Completion means the single request was acknowledged, not durable ingestion. */
                                        onSome: () => Effect.void,
                                    })
                                )
                            ),
                    /** A flush is only a current-binding barrier; no retry queue exists to release later. */
                    flush: (candidate) => mutex.withPermits(1)(check(candidate)),
                });
            }
        )
    ).pipe(Layer.provide(OtlpSerialization.layerJson));
