/**
 * @file tests/telemetry/src/otlp.spec.ts
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

import * as FetchHttpClient from '@effect/platform/FetchHttpClient';
import { describe, expect, it } from '@effect/vitest';
import { Flags, FlagsSafeDefaults, safeDefault } from '@eventiva/contracts/flags';
import { TenantId } from '@eventiva/contracts/ids';
import { TelemetrySink, type TelemetryRecord } from '@eventiva/contracts/observability';
import {
    TelemetryExportAuthority,
    TelemetryExportDeny,
    TelemetryExportProvider,
    type TelemetryExportBinding,
} from '@eventiva/contracts/telemetry-export';
import { otlpConfig, otlpTelemetryLayer, type OtlpOptions } from '@eventiva/integrations.telemetry.server/otlp';
import { governedTelemetrySinkLayer } from '@eventiva/runtime/telemetry-export';
import { telemetryLayer } from '@eventiva/runtime/telemetry';
import { Cause, Config, ConfigProvider, Effect, Exit, Fiber, Layer, Redacted, Schema, Scope, TestClock } from 'effect';
import { vi } from 'vitest';

const binding: TelemetryExportBinding = {
    tenantId: Schema.decodeSync(TenantId)('11111111-1111-4111-8111-111111111111'),
    moduleId: 'example.logger',
    moduleVersion: '1.0.0',
    generation: 3,
    profile: 'baseline',
    operation: 'ordinary',
    purpose: 'diagnostics',
    destinationId: '99999999-9999-4999-8999-999999999999',
};
const settings: OtlpOptions = {
    enabled: true,
    endpoint: Redacted.make('https://collector.invalid/custom/traces'),
    headers: Redacted.make('{"Authorization":"Bearer FIXTURE_SECRET"}'),
    timeoutMs: 100,
};
const record: TelemetryRecord = {
    version: 1,
    signal: 'span',
    timestamp: '1970-01-01T00:00:01.250Z',
    level: 'INFO',
    code: 'sample.completed',
    text: 'PRIVATE_TEXT_CANARY',
    profile: 'baseline',
    traceId: '1234567890abcdef1234567890abcdef',
    spanId: '1234567890abcdef',
    parentSpanId: 'fedcba0987654321',
    attributes: { secret: 'PRIVATE_ATTRIBUTE_CANARY' },
    durationMs: 47.125,
    outcome: 'failed',
};
const enabled = Layer.succeed(Flags, {
    /** Enable export without changing other flag defaults. */ evaluate: (flag) =>
        Effect.succeed({ ...safeDefault(flag), value: true }),
});
const allow = Layer.succeed(TelemetryExportAuthority, {
    /** Model a currently authorized fixture destination, never a production policy. */ authorize: () => Effect.void,
});
const catalog = { messages: { 'sample.completed': 'Completed.', 'sample.root': 'Root.' } };

/** Capture serialized HTTP requests through the real FetchHttpClient without permitting network access. */
const transport = (status = 200, response = '{}') => {
    const requests: Array<{
        readonly url: string;
        readonly body: string;
        readonly headers: Headers;
        readonly redirect: string | undefined;
    }> = [];
    const fetch = vi.fn<typeof globalThis.fetch>(
        /** Retain only synthetic fixture requests and return a deterministic collector acknowledgement. */ async (
            url,
            options
        ) => {
            requests.push({
                url: String(url),
                body: await new Response(options?.body).text(),
                headers: new Headers(options?.headers),
                redirect: options?.redirect,
            });
            return new Response(response, { status });
        }
    );
    const layer = FetchHttpClient.layer.pipe(Layer.provide(Layer.succeed(FetchHttpClient.Fetch, fetch)));
    return { requests, fetch, layer };
};

/** Decode the actual OTLP/HTTP JSON envelope, not arguments passed to a serializer mock. */
const Wire = Schema.parseJson(
    Schema.Struct({
        resourceSpans: Schema.Array(
            Schema.Struct({
                resource: Schema.Struct({
                    attributes: Schema.Array(
                        Schema.Struct({ key: Schema.String, value: Schema.Struct({ stringValue: Schema.String }) })
                    ),
                }),
                scopeSpans: Schema.Array(
                    Schema.Struct({
                        spans: Schema.Array(
                            Schema.Struct({
                                traceId: Schema.String,
                                spanId: Schema.String,
                                parentSpanId: Schema.optional(Schema.String),
                                name: Schema.String,
                                kind: Schema.Number,
                                startTimeUnixNano: Schema.String,
                                endTimeUnixNano: Schema.String,
                                status: Schema.Struct({ code: Schema.Number }),
                                attributes: Schema.Tuple(),
                                events: Schema.Tuple(),
                                links: Schema.Tuple(),
                            })
                        ),
                    })
                ),
            })
        ),
    })
);

describe('optional OTLP span export', /** Exercise wire compatibility, safe defaults and the existing release gates. */ () => {
    it.effect(
        'exports one correlated failed span with exact nanosecond timing and redacted configurable headers',
        /** Inspect an asymmetric span so timestamp, parent, duration and status regressions cannot hide. */ () =>
            Effect.gen(
                /** Write through the real provider and assert only the approved minimal fields cross HTTP. */ function* () {
                    // A valid acknowledgement exactly at the byte ceiling must still succeed.
                    const http = transport(200, '{}' + ' '.repeat(16382));
                    yield* Effect.gen(
                        /** Flush/shutdown must not resend an already acknowledged span or export log records. */ function* () {
                            const provider = yield* TelemetryExportProvider;
                            yield* provider.write(binding, record);
                            yield* provider.write(binding, { ...record, signal: 'log' });
                            yield* provider.flush(binding);
                        }
                    ).pipe(
                        Effect.provide(otlpTelemetryLayer(binding).pipe(Layer.provide(http.layer))),
                        Effect.withConfigProvider(
                            ConfigProvider.fromMap(
                                new Map([
                                    ['telemetry.otlp.enabled', 'true'],
                                    ['telemetry.otlp.endpoint', Redacted.value(settings.endpoint)],
                                    ['telemetry.otlp.headers', Redacted.value(settings.headers)],
                                    ['telemetry.otlp.timeoutMs', '100'],
                                ])
                            )
                        )
                    );
                    expect(http.requests).toHaveLength(1);
                    const request = http.requests[0];
                    expect(request?.url).toBe('https://collector.invalid/custom/traces');
                    expect(request?.headers.get('authorization')).toBe('Bearer FIXTURE_SECRET');
                    expect(request?.headers.get('content-type')).toBe('application/json');
                    expect(request?.headers.get('traceparent')).toBeNull();
                    expect(request?.redirect).toBe('manual');
                    const wire = yield* Schema.decode(Wire)(request?.body ?? '');
                    expect(wire.resourceSpans[0]?.resource.attributes).toEqual([
                        { key: 'service.name', value: { stringValue: 'eventiva' } },
                    ]);
                    expect(wire.resourceSpans[0]?.scopeSpans[0]?.spans).toEqual([
                        {
                            traceId: record.traceId,
                            spanId: record.spanId,
                            parentSpanId: record.parentSpanId,
                            name: 'sample.completed',
                            kind: 1,
                            startTimeUnixNano: '1202875000',
                            endTimeUnixNano: '1250000000',
                            attributes: [],
                            events: [],
                            links: [],
                            status: { code: 2 },
                        },
                    ]);
                    expect(request?.body).not.toMatch(
                        /PRIVATE|FIXTURE_SECRET|11111111|99999999|example.logger|diagnostics/
                    );
                    expect(JSON.stringify(settings)).not.toContain('FIXTURE_SECRET');
                }
            )
    );

    it.effect(
        'exports actual Effect spans through runtime and the governed sink, not a synthetic tracer replacement',
        /** Prove nested instrumentation reaches the in-memory OTLP collector through current package subpaths. */ () =>
            Effect.gen(
                /** Check parent correlation and success without relying on random ID values. */ function* () {
                    const http = transport();
                    const sink = governedTelemetrySinkLayer(binding, catalog).pipe(
                        Layer.provide(otlpTelemetryLayer(binding, Config.succeed(settings))),
                        Layer.provide(enabled),
                        Layer.provide(allow),
                        Layer.provide(http.layer)
                    );
                    yield* Effect.void.pipe(
                        Effect.withSpan('sample.completed'),
                        Effect.withSpan('sample.root'),
                        Effect.provide(telemetryLayer({ ...catalog, attributes: {} }).pipe(Layer.provide(sink)))
                    );
                    expect(http.requests).toHaveLength(2);
                    const records = yield* Effect.forEach(
                        http.requests,
                        /** Validate collector envelopes before extracting the only span in each request. */ (
                            request
                        ) => Schema.decode(Wire)(request.body)
                    );
                    const child = records[0]?.resourceSpans[0]?.scopeSpans[0]?.spans[0];
                    const parent = records[1]?.resourceSpans[0]?.scopeSpans[0]?.spans[0];
                    expect(child?.name).toBe('sample.completed');
                    expect(parent?.name).toBe('sample.root');
                    expect(parent?.traceId).toMatch(/^[a-f0-9]{32}$/);
                    expect(child?.traceId).toBe(parent?.traceId);
                    expect(child?.parentSpanId).toBe(parent?.spanId);
                    expect(parent?.parentSpanId).toBeUndefined();
                    expect(child?.status.code).toBe(1);
                }
            )
    );

    it.effect(
        'defaults off, and separate flag, authority and local telemetry opt-outs prevent every request',
        /** Test each disabled gate with all other prerequisites enabled. */ () =>
            Effect.gen(
                /** A default or denial must not create requests during writes, flush or disposal. */ function* () {
                    const http = transport();
                    yield* Effect.gen(
                        /** Default Config requires no secret/header/destination settings. */ function* () {
                            const provider = yield* TelemetryExportProvider;
                            yield* provider.write(binding, record);
                            yield* provider.flush(binding);
                        }
                    ).pipe(
                        Effect.provide(otlpTelemetryLayer(binding).pipe(Layer.provide(http.layer))),
                        Effect.withConfigProvider(ConfigProvider.fromMap(new Map()))
                    );
                    const config = yield* otlpConfig.pipe(Effect.withConfigProvider(ConfigProvider.fromMap(new Map())));
                    expect(config.enabled).toBe(false);
                    expect(Redacted.value(config.endpoint)).toBe('http://127.0.0.1:4318/v1/traces');
                    for (const gates of [
                        Layer.merge(FlagsSafeDefaults, allow),
                        Layer.merge(enabled, TelemetryExportDeny),
                    ]) {
                        yield* Effect.gen(
                            /** Both write and flush must fail under an independently denied release gate. */ function* () {
                                const sink = yield* TelemetrySink;
                                expect(Exit.isFailure(yield* Effect.exit(sink.write(record)))).toBe(true);
                                expect(Exit.isFailure(yield* Effect.exit(sink.flush))).toBe(true);
                            }
                        ).pipe(
                            Effect.provide(
                                governedTelemetrySinkLayer(binding, catalog).pipe(
                                    Layer.provide(otlpTelemetryLayer(binding, Config.succeed(settings))),
                                    Layer.provide(gates),
                                    Layer.provide(http.layer)
                                )
                            )
                        );
                    }
                    const remote = governedTelemetrySinkLayer(binding, catalog).pipe(
                        Layer.provide(enabled),
                        Layer.provide(allow),
                        Layer.provide(otlpTelemetryLayer(binding, Config.succeed(settings))),
                        Layer.provide(http.layer)
                    );
                    yield* Effect.void.pipe(
                        Effect.withSpan('sample.completed'),
                        Effect.provide(
                            telemetryLayer(
                                { ...catalog, attributes: {} },
                                Config.succeed({ enabled: false, capacity: 1, timeoutMs: 100 })
                            ).pipe(Layer.provide(remote))
                        )
                    );
                    expect(http.requests).toEqual([]);
                }
            )
    );

    it.effect(
        'reports HTTP, partial, malformed and transport failures safely, without retry on flush or shutdown',
        /** Failed delivery must differ from acknowledgement even when HTTP status is 200. */ () =>
            Effect.gen(
                /** Verify each failure creates exactly one attempt and retains no collector error or credential. */ function* () {
                    for (const [status, body] of [
                        [503, 'PRIVATE_ERROR'],
                        [200, '{"partialSuccess":{"rejectedSpans":"1","errorMessage":"PRIVATE_ERROR"}}'],
                        [200, '{"partialSuccess":{"rejectedSpans":"0","errorMessage":"PRIVATE_WARNING"}}'],
                        [200, 'not-json'],
                        [200, '{}' + ' '.repeat(16383)],
                        // This fits the character count but exceeds 16,384 UTF-8 bytes, exposing text-length bounds.
                        [200, '{"ignored":"' + '\u00e9'.repeat(8192) + '"}'],
                        [302, '{}'],
                    ] as const) {
                        const http = transport(status, body);
                        yield* Effect.gen(
                            /** Inspect the bounded typed failure before any later barrier is allowed. */ function* () {
                                const provider = yield* TelemetryExportProvider;
                                const result = yield* Effect.exit(provider.write(binding, record));
                                expect(Exit.isFailure(result)).toBe(true);
                                expect(JSON.stringify(result)).not.toMatch(/PRIVATE|FIXTURE_SECRET|collector.invalid/);
                                yield* provider.flush(binding);
                            }
                        ).pipe(
                            Effect.provide(
                                otlpTelemetryLayer(binding, Config.succeed(settings)).pipe(Layer.provide(http.layer))
                            )
                        );
                        expect(http.requests).toHaveLength(1);
                    }
                    const http = transport();
                    http.fetch.mockRejectedValue(new Error('PRIVATE_TRANSPORT_CANARY'));
                    const result = yield* Effect.gen(
                        /** Model a rejected socket without leaving the process or relying on network availability. */ function* () {
                            return yield* (yield* TelemetryExportProvider).write(binding, record);
                        }
                    ).pipe(
                        Effect.provide(
                            otlpTelemetryLayer(binding, Config.succeed(settings)).pipe(Layer.provide(http.layer))
                        ),
                        Effect.exit
                    );
                    expect(Exit.isFailure(result)).toBe(true);
                    expect(JSON.stringify(result)).not.toMatch(/PRIVATE|FIXTURE_SECRET|collector.invalid/);
                    expect(http.fetch).toHaveBeenCalledTimes(1);
                }
            )
    );

    it.effect(
        'rejects unsafe configuration, protected/cross-binding use and malformed span identities before HTTP',
        /** Exercise rejected settings and records at the actual provider boundary. */ () =>
            Effect.gen(
                /** Verify validation never releases a partial request or exposes rejected configuration. */ function* () {
                    const http = transport();
                    for (const invalid of [
                        { ...settings, endpoint: Redacted.make('http://collector.invalid/v1/traces') },
                        { ...settings, endpoint: Redacted.make('https://user:PRIVATE@collector.invalid/v1/traces') },
                        { ...settings, headers: Redacted.make('{"Authorization":"PRIVATE\\r\\nforged"}') },
                        { ...settings, headers: Redacted.make('{"Host":"PRIVATE"}') },
                        { ...settings, headers: Redacted.make('PRIVATE_INVALID_JSON') },
                        { ...settings, timeoutMs: 0 },
                    ]) {
                        const result = yield* Effect.void.pipe(
                            Effect.provide(
                                otlpTelemetryLayer(binding, Config.succeed(invalid)).pipe(Layer.provide(http.layer))
                            ),
                            Effect.exit
                        );
                        expect(Exit.isFailure(result)).toBe(true);
                        expect(JSON.stringify(result)).not.toMatch(/PRIVATE|Authorization|collector.invalid/);
                    }
                    for (const profile of ['restricted', 'vault'] as const) {
                        expect(
                            Exit.isFailure(
                                yield* Effect.void.pipe(
                                    Effect.provide(
                                        otlpTelemetryLayer({ ...binding, profile }, Config.succeed(settings)).pipe(
                                            Layer.provide(http.layer)
                                        )
                                    ),
                                    Effect.exit
                                )
                            )
                        ).toBe(true);
                    }
                    yield* Effect.gen(
                        /** Check tenant/generation and wire validity before admitting a send. */ function* () {
                            const provider = yield* TelemetryExportProvider;
                            expect(
                                Exit.isFailure(
                                    yield* Effect.exit(provider.write({ ...binding, generation: 4 }, record))
                                )
                            ).toBe(true);
                            for (const invalid of [
                                { ...record, traceId: '' },
                                { ...record, spanId: '0'.repeat(16) },
                                { ...record, timestamp: '2026-99-01T00:00:00.000Z' },
                                { ...record, durationMs: 1251 },
                            ]) {
                                expect(Exit.isFailure(yield* Effect.exit(provider.write(binding, invalid)))).toBe(true);
                            }
                        }
                    ).pipe(
                        Effect.provide(
                            otlpTelemetryLayer(binding, Config.succeed(settings)).pipe(Layer.provide(http.layer))
                        )
                    );
                    expect(http.requests).toEqual([]);
                }
            )
    );

    it.effect(
        'bounds a stalled request, aborts its transport and refuses retained handles after scope closure',
        /** Prove no asynchronous request survives ownership or gets replayed later. */ () =>
            Effect.gen(
                /** Use the Effect test clock to release a timeout without wall-clock sleeps. */ function* () {
                    const http = transport();
                    let aborted = false;
                    http.fetch.mockImplementation(
                        /** Keep a fake collector pending until Effect cancels its HTTP request. */ (_url, options) =>
                            new Promise(
                                /** Observe only abort state, never retain request credentials in a failure. */ (
                                    _resolve,
                                    reject
                                ) => {
                                    options?.signal?.addEventListener(
                                        'abort',
                                        /** Model cancellable network IO at the Fetch boundary. */ () => {
                                            aborted = true;
                                            reject(new Error('PRIVATE_ABORT'));
                                        }
                                    );
                                }
                            )
                    );
                    const scope = yield* Scope.make();
                    const services = yield* Layer.buildWithScope(
                        otlpTelemetryLayer(binding, Config.succeed({ ...settings, timeoutMs: 1 })).pipe(
                            Layer.provide(http.layer)
                        ),
                        scope
                    );
                    const provider = yield* TelemetryExportProvider.pipe(Effect.provide(services));
                    const fiber = yield* provider.write(binding, record).pipe(Effect.fork);
                    // TestClock waits for the child to suspend before advancing its request deadline.
                    yield* TestClock.adjust('1 millis');
                    const result = yield* Fiber.await(fiber);
                    expect(Exit.isFailure(result)).toBe(true);
                    expect(aborted).toBe(true);
                    aborted = false;
                    const cancelled = yield* provider.write(binding, record).pipe(Effect.fork);
                    yield* TestClock.adjust('0 millis');
                    // A second caller must not queue a payload behind the in-flight request's grant.
                    expect(Exit.isFailure(yield* Effect.exit(provider.write(binding, record)))).toBe(true);
                    const interrupted = yield* Fiber.interrupt(cancelled);
                    expect(Exit.isFailure(interrupted) && Cause.isInterruptedOnly(interrupted.cause)).toBe(true);
                    expect(aborted).toBe(true);
                    yield* Scope.close(scope, Exit.void);
                    expect(Exit.isFailure(yield* Effect.exit(provider.write(binding, record)))).toBe(true);
                    expect(Exit.isFailure(yield* Effect.exit(provider.flush(binding)))).toBe(true);
                    expect(http.fetch).toHaveBeenCalledTimes(2);
                }
            )
    );
});
