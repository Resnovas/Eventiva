/**
 * @file apps/server/tests/telemetry-correlation.spec.ts
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

import { createServer } from 'node:http';
import * as FetchHttpClient from '@effect/platform/FetchHttpClient';
import * as HttpClient from '@effect/platform/HttpClient';
import * as HttpServerRequest from '@effect/platform/HttpServerRequest';
import * as HttpServerResponse from '@effect/platform/HttpServerResponse';
import * as NodeHttpServer from '@effect/platform-node/NodeHttpServer';
import { describe, expect, it } from '@effect/vitest';
import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Flags, FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { TenantId } from '@eventiva/contracts/ids';
import { TelemetryRecord, TelemetrySink, TelemetrySinkFailure } from '@eventiva/contracts/observability';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { TelemetryControl, telemetryLayer, type TelemetryPolicy } from '@eventiva/runtime/telemetry';
import { ConfigProvider, Data, Deferred, Effect, Exit, Fiber, HashMap, Layer, Schema } from 'effect';
import { correlationFlag, withRequestCorrelation } from '../src/telemetry-correlation.ts';

const a = { 'posthog.distinct_id': 'synthetic-person-a', 'posthog.session_id': 'synthetic-session-101' };
const b = { 'posthog.distinct_id': 'synthetic-person-bb', 'posthog.session_id': 'synthetic-session-902' };
const boundary = 's'.repeat(96);
const policy: TelemetryPolicy = {
    messages: {
        'request.received': 'Synthetic request.',
        'request.failed': 'Request failed.',
        'request.nested': 'Nested work.',
        'request.child': 'Scoped child work.',
        'request.outside': 'Outside request.',
    },
    attributes: {
        'posthog.distinct_id': [a['posthog.distinct_id'], b['posthog.distinct_id'], boundary],
        'posthog.session_id': [a['posthog.session_id'], b['posthog.session_id'], boundary],
    },
};

/** Model a typed business error with a canary that must never reach telemetry or the HTTP response. */
class BusinessFailure extends Data.TaggedError('BusinessFailure')<{ readonly message: string }> {}

/** Construct SDK-shaped fixture headers, not an execution of either client SDK. */
const headers = (value = a) =>
    [
        ['X-POSTHOG-DISTINCT-ID', value['posthog.distinct_id']],
        ['X-POSTHOG-SESSION-ID', value['posthog.session_id']],
    ] as const;

const enabledFlags = Layer.succeed(Flags, {
    /** Enable only this checkpoint's declared flag; unrelated capabilities retain their safe defaults. */
    evaluate: (flag) =>
        Effect.succeed({
            flag: flag.key,
            value: flag.key === correlationFlag.key || flag.safeDefault,
            reason: 'STATIC',
            fallback: false,
        }),
});

/** Observe annotation presence independently of minimized sink output, without serializing opaque values. */
const probe = Effect.gen(
    /** Inspect both inherited annotation maps because a disabled sink could hide an unsafe wrapper. */
    function* () {
        const logs = yield* Effect.logAnnotations;
        const spans = yield* Effect.spanAnnotations;
        return ['posthog.distinct_id', 'posthog.session_id'].map(
            /** Preserve separate log/span presence bits for each correlation dimension. */
            (key) => [HashMap.has(logs, key), HashMap.has(spans, key)]
        );
    }
);

/** Assert absence on all exported attributes, not just on a selected log. */
const clean = (records: ReadonlyArray<TelemetryRecord>) => {
    for (const record of records) expect(record.attributes).toEqual({});
};

/**
 * Install the real minimizing central worker with a fixture-owned neutral sink.
 * The body can explicitly flush/observe failures; scope release remains bounded by existing runtime policy.
 */
const fixture = <A, E, R>(
    /** Run public-boundary assertions within this central installation's lifetime. */
    body: (records: TelemetryRecord[]) => Effect.Effect<A, E, R>,
    options: { readonly enabled?: string; readonly flag?: 'absent' | 'false'; readonly sink?: 'reject' | 'outage' } = {}
) => {
    const records: TelemetryRecord[] = [];
    const sink = Layer.succeed(TelemetrySink, {
        /** Reject cooperatively or collect only already minimized records; never create a parallel raw sink. */
        write: (record) =>
            options.sink === 'outage'
                ? Effect.never
                : options.sink === 'reject'
                  ? Effect.fail(new TelemetrySinkFailure({ reason: 'write' }))
                  : Effect.sync(
                        /** Retain the bounded test record for public behavior assertions. */
                        () => {
                            records.push(record);
                        }
                    ),
        flush: Effect.void,
    });
    const flags =
        options.flag === 'absent'
            ? FlagsSafeDefaults
            : options.flag === 'false'
              ? Layer.succeed(Flags, {
                    /** Explicit remote false must be as safe as a missing flag. */
                    evaluate: (flag) =>
                        Effect.succeed({ flag: flag.key, value: false, reason: 'STATIC', fallback: false }),
                })
              : enabledFlags;
    // The wrapper and pipeline read the same injected ConfigProvider, not independent environment switches.
    return body(records).pipe(
        Effect.provide(Layer.merge(telemetryLayer(policy).pipe(Layer.provide(sink)), flags)),
        Effect.withConfigProvider(
            ConfigProvider.fromMap(
                new Map([
                    ['telemetry.enabled', options.enabled ?? 'true'],
                    ['telemetry.timeoutMs', '25'],
                ])
            )
        ),
        Effect.scoped
    );
};

/** Acquire a real ephemeral IPv4 loopback listener and return a FetchHttpClient request sender. */
const listener = <E, R>(
    app: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R | HttpServerRequest.HttpServerRequest>
) =>
    Effect.gen(
        /** Keep listener/client acquisition scoped; no socket or endpoint escapes this test fixture. */
        function* () {
            // Both the listener and captured client belong to the caller's fixture scope.
            const server = yield* NodeHttpServer.make(createServer, { host: '127.0.0.1', port: 0 });
            yield* server.serve(app);
            expect(server.address._tag).toBe('TcpAddress');
            const port = server.address._tag === 'TcpAddress' ? server.address.port : 0;
            const client = yield* HttpClient.HttpClient;
            return /** Send only to the acquired loopback socket; disable client spans so assertions concern server work. */ (
                path: string,
                values: ReadonlyArray<readonly [string, string]> = []
            ) =>
                client.post(`http://127.0.0.1:${port}${path}`, { headers: values }).pipe(
                    Effect.flatMap(
                        /** Consume the response before the fixture closes its listener. */
                        (response) =>
                            Effect.map(
                                response.text,
                                /** Preserve both status and sanitized payload as observable business evidence. */
                                (text) => ({ status: response.status, text })
                            )
                    ),
                    Effect.withTracerEnabled(false)
                );
        }
    );

/** Emit nested/scoped-child signals and retain the original typed business failure. */
const work = (fail: boolean) =>
    Effect.gen(
        /** Join the finite child before failure so its log has an unambiguous nested-span parent. */
        function* () {
            // Joining finite work proves inheritance without certifying detached background activity.
            const child = yield* Effect.logInfo('request.child').pipe(Effect.forkScoped);
            yield* Fiber.join(child);
            if (fail) return yield* new BusinessFailure({ message: 'ERROR_MESSAGE_CANARY' });
            return 'safe-success';
        }
    ).pipe(Effect.withSpan('request.nested'));

/** Register the six packet acceptance groups without production ingress or SDK installation. */
const correlationAcceptance = () => {
    it.live(
        '1. real HTTP carries asymmetric pairs through nested spans, children and fixed errors',
        /** Check real request outcomes, failed-span status and exact parentage through the central sink. */
        () =>
            fixture(
                /** Route two SDK-shaped requests through the public wrapper without changing their business mapping. */
                (records) =>
                    Effect.gen(
                        /** Catch business failure outside the wrapper so its span observes failure, not a sanitized success. */
                        function* () {
                            // Keep HTTP response sanitization outside the observed business failure.
                            const app = Effect.gen(
                                /** Treat correlation headers as hints only; the route independently chooses business behavior. */
                                function* () {
                                    // Read only transport headers here; no caller or tenant is derived from them.
                                    const request = yield* HttpServerRequest.HttpServerRequest;
                                    return yield* withRequestCorrelation(
                                        Object.entries(request.headers),
                                        policy,
                                        work(request.url === '/failure')
                                    ).pipe(
                                        Effect.map(
                                            /** Keep success text independent of correlation input. */
                                            (text) => HttpServerResponse.text(text)
                                        ),
                                        Effect.catchTag(
                                            'BusinessFailure',
                                            /** Never expose the failure's message in the business response. */
                                            () =>
                                                Effect.succeed(HttpServerResponse.text('safe-failure', { status: 409 }))
                                        )
                                    );
                                }
                            );
                            const send = yield* listener(app);
                            expect(yield* send('/success')).toEqual({ status: 200, text: 'safe-success' });
                            expect(
                                yield* send('/failure', [
                                    ['x-PoStHoG-Distinct-ID', a['posthog.distinct_id']],
                                    ['X-posthog-session-id', a['posthog.session_id']],
                                ])
                            ).toEqual({ status: 409, text: 'safe-failure' });
                            expect(yield* send('/failure', headers(b))).toEqual({ status: 409, text: 'safe-failure' });
                            yield* (yield* TelemetryControl).flush;
                            for (const [value, outcome] of [
                                [a, 'failed'],
                                [b, 'failed'],
                            ] as const) {
                                const own = records.filter(
                                    /** Partition by one asymmetric dimension, then verify the complete pair on every record. */
                                    (record) =>
                                        record.attributes['posthog.distinct_id'] === value['posthog.distinct_id']
                                );
                                const root = own.find(
                                    /** Select the wrapper's request span, not the platform's outer HTTP span. */
                                    (record) => record.signal === 'span' && record.code === 'request.received'
                                );
                                const nested = own.find(
                                    /** Select the business span to independently verify its parent id. */
                                    (record) => record.signal === 'span' && record.code === 'request.nested'
                                );
                                expect(root).toBeDefined();
                                expect(nested).toBeDefined();
                                expect(root?.outcome).toBe(outcome);
                                expect(nested?.outcome).toBe(outcome);
                                expect(nested?.parentSpanId).toBe(root?.spanId);
                                expect(root?.traceId).toMatch(/^[a-f0-9]{32}$/);
                                expect(root?.parentSpanId).toMatch(/^[a-f0-9]{16}$/);
                                expect(own).toHaveLength(4);
                                for (const record of own) {
                                    expect(record.attributes).toEqual(value);
                                    expect(record.traceId).toBe(root?.traceId);
                                    if (record.code === 'request.child') expect(record.spanId).toBe(nested?.spanId);
                                    if (record.code === 'request.failed') {
                                        expect(record.level).toBe('ERROR');
                                        expect(record.spanId).toBe(root?.spanId);
                                    }
                                }
                            }
                            expect(JSON.stringify(records)).not.toContain('ERROR_MESSAGE_CANARY');
                        }
                    ).pipe(Effect.provide(FetchHttpClient.layer))
            )
    );

    it.live(
        '2. barrier-interleaved HTTP requests isolate pairs and restore caller context on all exits',
        /** Overlap real requests deterministically, then test typed failure/interruption and scoped child cleanup. */
        () =>
            fixture(
                /** Reuse the same central installation across requests and outside logs to detect leaked FiberRefs. */
                (records) =>
                    Effect.gen(
                        /** Barriers force both request scopes to be live before either emits business telemetry. */
                        function* () {
                            // Crossed barriers prove overlap without depending on wall-clock scheduling.
                            const enteredA = yield* Deferred.make<void>();
                            const enteredB = yield* Deferred.make<void>();
                            const app = Effect.gen(
                                /** Choose barriers from a fixture route, never from correlation-derived identity. */
                                function* () {
                                    // The headerless control must not wait on either completed request barrier.
                                    const request = yield* HttpServerRequest.HttpServerRequest;
                                    const inner =
                                        request.url === '/a'
                                            ? Deferred.succeed(enteredA, undefined).pipe(
                                                  Effect.zipRight(Deferred.await(enteredB))
                                              )
                                            : request.url === '/b'
                                              ? Deferred.succeed(enteredB, undefined).pipe(
                                                    Effect.zipRight(Deferred.await(enteredA))
                                                )
                                              : Effect.void;
                                    yield* withRequestCorrelation(
                                        Object.entries(request.headers),
                                        policy,
                                        inner.pipe(Effect.zipRight(work(false)))
                                    );
                                    return HttpServerResponse.text('safe-success');
                                }
                            );
                            const send = yield* listener(app);
                            const left = yield* send('/a', headers(a)).pipe(Effect.fork);
                            const right = yield* send('/b', headers(b)).pipe(Effect.fork);
                            expect(yield* Fiber.join(left)).toEqual({ status: 200, text: 'safe-success' });
                            expect(yield* Fiber.join(right)).toEqual({ status: 200, text: 'safe-success' });
                            yield* (yield* TelemetryControl).flush;
                            expect(
                                records.filter(
                                    /** Count both completed request spans so dropping one request cannot pass isolation. */
                                    (record) => record.code === 'request.received'
                                )
                            ).toHaveLength(2);
                            for (const record of records) {
                                if (record.attributes['posthog.distinct_id'] !== undefined)
                                    expect(record.attributes).toEqual(
                                        record.attributes['posthog.distinct_id'] === a['posthog.distinct_id'] ? a : b
                                    );
                            }
                            records.length = 0;
                            yield* send('/headerless');
                            yield* Effect.logInfo('request.outside');
                            for (const mode of ['success', 'failure', 'interrupt'] as const) {
                                const stopped = yield* Deferred.make<void>();
                                const started = yield* Deferred.make<void>();
                                const childStarted = yield* Deferred.make<void>();
                                const inner = Effect.gen(
                                    /** A never-ending scoped child must be interrupted before the wrapper returns on any exit. */
                                    function* () {
                                        // Install the interruption observer before allowing the request to finish.
                                        yield* Deferred.succeed(childStarted, undefined).pipe(
                                            Effect.zipRight(Effect.never),
                                            Effect.onInterrupt(
                                                /** Signal cleanup without relying on a scheduler delay. */
                                                () => Deferred.succeed(stopped, undefined)
                                            ),
                                            Effect.forkScoped
                                        );
                                        yield* Deferred.await(childStarted);
                                        yield* Deferred.succeed(started, undefined);
                                        if (mode === 'interrupt') return yield* Effect.never;
                                        if (mode === 'failure')
                                            return yield* new BusinessFailure({ message: 'FAIL_CANARY' });
                                        return 'ok';
                                    }
                                );
                                if (mode === 'interrupt') {
                                    const fiber = yield* withRequestCorrelation(headers(a), policy, inner).pipe(
                                        Effect.fork
                                    );
                                    yield* Deferred.await(started);
                                    expect(Exit.isInterrupted(yield* Fiber.interrupt(fiber))).toBe(true);
                                } else {
                                    const result = yield* Effect.exit(
                                        withRequestCorrelation(headers(a), policy, inner)
                                    );
                                    expect(Exit.isSuccess(result)).toBe(mode === 'success');
                                }
                                expect(yield* Deferred.isDone(stopped)).toBe(true);
                                expect(yield* probe).toEqual([
                                    [false, false],
                                    [false, false],
                                ]);
                                yield* Effect.logInfo('request.outside');
                            }
                            yield* (yield* TelemetryControl).flush;
                            clean(
                                records.filter(
                                    /** Outside and following headerless-request signals must not inherit any preceding pair. */
                                    (record) =>
                                        record.code === 'request.outside' ||
                                        record.code === 'request.child' ||
                                        record.code === 'request.nested'
                                )
                            );
                        }
                    ).pipe(Effect.provide(FetchHttpClient.layer))
            )
    );

    it.live(
        '3. schema admits only complete, unique, bounded and statically allowlisted pairs',
        /** Raw boundary tests cover bytes that HTTP libraries correctly refuse to put on the wire. */
        () =>
            fixture(
                /** Invalid input must remain all-or-nothing and preserve the same business value. */
                (records) =>
                    Effect.gen(
                        /** Include asymmetric negative controls for each dimension and exact length boundaries. */
                        function* () {
                            const [distinctHeader, sessionHeader] = headers();
                            const invalid: ReadonlyArray<ReadonlyArray<readonly [string, string]>> = [
                                [],
                                [distinctHeader],
                                [sessionHeader],
                                [['x-posthog-distinct-id', ''], sessionHeader],
                                [distinctHeader, ['x-posthog-session-id', '']],
                                [...headers(), ['x-POSTHOG-distinct-ID', a['posthog.distinct_id']]],
                                [...headers(), ['X-Posthog-Session-Id', a['posthog.session_id']]],
                                [
                                    [
                                        'x-posthog-distinct-id',
                                        `${a['posthog.distinct_id']}, ${b['posthog.distinct_id']}`,
                                    ],
                                    sessionHeader,
                                ],
                                [
                                    distinctHeader,
                                    ['x-posthog-session-id', `${a['posthog.session_id']},${a['posthog.session_id']}`],
                                ],
                                [['x-posthog-distinct-id', 'CONTROL\r\nCANARY'], sessionHeader],
                                [distinctHeader, ['x-posthog-session-id', 'CONTROL\u0000CANARY']],
                                [['x-posthog-distinct-id', `${boundary}x`], sessionHeader],
                                [distinctHeader, ['x-posthog-session-id', `${boundary}x`]],
                                [['x-posthog-distinct-id', 'person@example.invalid'], sessionHeader],
                                [distinctHeader, ['x-posthog-session-id', 'bad/session']],
                                [['x-posthog-distinct-id', 'UNALLOWLISTED_CANARY'], sessionHeader],
                                [distinctHeader, ['x-posthog-session-id', 'OTHER_CANARY']],
                                [['x-posthog-distinct-id', ' padded '], sessionHeader],
                            ];
                            for (const input of invalid) {
                                expect(yield* withRequestCorrelation(input, policy, probe)).toEqual([
                                    [false, false],
                                    [false, false],
                                ]);
                                expect(yield* withRequestCorrelation(input, policy, work(false))).toBe('safe-success');
                            }
                            yield* (yield* TelemetryControl).flush;
                            clean(records);
                            expect(JSON.stringify(records)).not.toMatch(
                                /CANARY|ParseError|CONTROL|example.invalid|bad\/session/
                            );
                            records.length = 0;
                            for (const value of [
                                a,
                                { 'posthog.distinct_id': boundary, 'posthog.session_id': boundary },
                            ]) {
                                const mixed = headers(value).map(
                                    /** Exercise case-insensitive names without weakening case-sensitive exact token admission. */
                                    ([key, value]) => [key.toLowerCase().replace('posthog', 'PoStHoG'), value] as const
                                );
                                expect(yield* withRequestCorrelation(mixed, policy, probe)).toEqual([
                                    [true, true],
                                    [true, true],
                                ]);
                                yield* (yield* TelemetryControl).flush;
                                expect(records.pop()?.attributes).toEqual(value);
                            }
                            // Even valid syntax cannot create a new dimension or a missing policy allowlist.
                            for (const attributes of [
                                {},
                                { 'posthog.distinct_id': [a['posthog.distinct_id']] },
                                { 'posthog.session_id': [a['posthog.session_id']] },
                            ]) {
                                expect(
                                    yield* withRequestCorrelation(headers(), { ...policy, attributes }, probe)
                                ).toEqual([
                                    [false, false],
                                    [false, false],
                                ]);
                            }
                        }
                    )
            )
    );

    it.live(
        '4. absent/false flags and telemetry opt-out install no identifiers',
        /** Probe annotation maps independently so a silent pipeline is not mistaken for a safe wrapper. */
        () =>
            Effect.gen(
                /** Test both flag fallback and explicit false separately from the global telemetry opt-out. */
                function* () {
                    // Missing output is not sufficient: the in-request probe detects unsafe annotation installation.
                    expect(correlationFlag.safeDefault).toBe(false);
                    for (const options of [{ flag: 'absent' }, { flag: 'false' }, { enabled: 'false' }] as const) {
                        yield* fixture(
                            /** Inspect in-request annotations and central records from the same invocation. */
                            (records) =>
                                Effect.gen(
                                    /** Flush the existing worker rather than assuming emission is synchronous. */
                                    function* () {
                                        expect(yield* withRequestCorrelation(headers(), policy, probe)).toEqual([
                                            [false, false],
                                            [false, false],
                                        ]);
                                        yield* (yield* TelemetryControl).flush;
                                        if ('enabled' in options) expect(records).toEqual([]);
                                        else {
                                            expect(records).toHaveLength(1);
                                            clean(records);
                                        }
                                    }
                                ),
                            options
                        );
                    }
                    // A bad wrapper Config fails closed even independently of a successfully installed pipeline.
                    expect(
                        yield* withRequestCorrelation(headers(), policy, probe).pipe(
                            Effect.provide(enabledFlags),
                            Effect.withConfigProvider(
                                ConfigProvider.fromMap(new Map([['telemetry.enabled', 'INVALID_CONFIG_CANARY']]))
                            )
                        )
                    ).toEqual([
                        [false, false],
                        [false, false],
                    ]);
                }
            )
    );

    it.live(
        '5. protected/invalid profiles minimize and hints cannot select caller or tenant',
        /** Preserve actual injected identity services and remove body/credential/error canaries from central output. */
        () =>
            fixture(
                /** Check all profiles against the same request boundary and minimizer. */
                (records) =>
                    Effect.gen(
                        /** Decode only fixture identities; no header is ever input to these authoritative services. */
                        function* () {
                            // Fix trusted identity independently of all incoming correlation/tenant/profile hints.
                            const tenant = Schema.decodeSync(TenantId)('22222222-2222-4222-8222-222222222222');
                            const identity = Schema.decodeSync(CallerIdentity)({
                                subject: '11111111-1111-4111-8111-111111111111',
                                kind: 'human',
                                tenant: '22222222-2222-4222-8222-222222222222',
                                session: '33333333-3333-4333-8333-333333333333',
                            });
                            for (const profile of [
                                'baseline',
                                'sensitive',
                                'restricted',
                                'vault',
                                'INVALID_PROFILE_CANARY',
                            ]) {
                                const annotations = { 'eventiva.profile': profile };
                                const input = [
                                    ...headers(),
                                    ['authorization', 'Bearer CREDENTIAL_CANARY'],
                                    ['eventiva.profile', 'baseline'],
                                    ['x-tenant-id', 'ATTACKER_TENANT_CANARY'],
                                ] as const;
                                const inner = Effect.gen(
                                    /** Assert trusted context stays authoritative while deliberately logging hostile payloads. */
                                    function* () {
                                        // Canary payloads test the real minimizer, not a fixture that drops them upstream.
                                        expect(yield* Caller).toEqual(identity);
                                        expect(yield* CurrentTenant).toEqual({ id: tenant });
                                        yield* Effect.logInfo('BODY_CANARY', { password: 'CREDENTIAL_CANARY' });
                                        return yield* work(true);
                                    }
                                );
                                const result = yield* Effect.exit(
                                    withRequestCorrelation(input, policy, inner).pipe(
                                        Effect.annotateLogs(annotations),
                                        Effect.annotateSpans(annotations),
                                        Effect.provideService(Caller, identity),
                                        Effect.provideService(CurrentTenant, { id: tenant })
                                    )
                                );
                                expect(Exit.isFailure(result)).toBe(true);
                                yield* (yield* TelemetryControl).flush;
                                expect(records.length).toBeGreaterThanOrEqual(5);
                                for (const record of records) {
                                    expect(record.profile).toBe(
                                        profile === 'INVALID_PROFILE_CANARY' ? 'vault' : profile
                                    );
                                    expect(record.attributes).toEqual(
                                        profile === 'baseline' || profile === 'sensitive' ? a : {}
                                    );
                                }
                                expect(JSON.stringify(records)).not.toMatch(/CANARY|Bearer|11111111|22222222|33333333/);
                                records.length = 0;
                            }
                        }
                    )
            )
    );

    it.live(
        '6. rejected or unavailable sinks cannot become a business transaction prerequisite',
        /** Existing bounded worker/flush owns loss; the wrapper introduces no exporter, retry or queue. */
        () =>
            Effect.gen(
                /** Exercise immediate rejection and cooperative nonresponse, including scope shutdown. */
                function* () {
                    // Reacquire the whole pipeline for each fault so a prior closed worker cannot mask loss.
                    for (const sink of ['reject', 'outage'] as const) {
                        yield* fixture(
                            /** Business success and failure remain unchanged even when all attempted telemetry is lost. */
                            (records) =>
                                Effect.gen(
                                    /** Check failure counters and typed flush failure, not a fabricated delivery acknowledgement. */
                                    function* () {
                                        // Business effects finish before the explicit delivery barrier reports loss.
                                        expect(yield* withRequestCorrelation(headers(), policy, work(false))).toBe(
                                            'safe-success'
                                        );
                                        expect(
                                            Exit.isFailure(
                                                yield* Effect.exit(
                                                    withRequestCorrelation(headers(), policy, work(true))
                                                )
                                            )
                                        ).toBe(true);
                                        const control = yield* TelemetryControl;
                                        expect(Exit.isFailure(yield* Effect.exit(control.flush))).toBe(true);
                                        const health = yield* control.health;
                                        expect(health.accepted).toBe(7);
                                        expect(records).toEqual([]);
                                        if (sink === 'reject') {
                                            expect(health.completed).toBe(7);
                                            expect(health.failed).toBe(7);
                                        }
                                    }
                                ),
                            { sink }
                        );
                    }
                }
            )
    );
};

describe('EVE-60 synthetic local-only correlation', correlationAcceptance);
