/**
 * @file tests/telemetry/src/correlation-export.spec.ts
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
import { describe, expect, it } from '@effect/vitest';
import { Flags, FlagsSafeDefaults, safeDefault } from '@eventiva/contracts/flags';
import { TenantId } from '@eventiva/contracts/ids';
import { TelemetrySink, TelemetrySinkFailure, type TelemetryRecord } from '@eventiva/contracts/observability';
import {
    CorrelationAuthority,
    CorrelationDeny,
    CorrelationIssuer,
    CorrelationProvider,
    TelemetryCorrelation,
    TelemetryExportAuthority,
    correlationEpochMs,
    type TelemetryExportBinding,
} from '@eventiva/contracts/telemetry-export';
import {
    fixtureCorrelationLayer,
    type FixtureCorrelationIdentity,
    type FixtureCorrelationKeys,
} from '@eventiva/integrations.telemetry.server/pseudonym';
import { otlpTelemetryLayer } from '@eventiva/integrations.telemetry.server/otlp';
import { correlationSession, governedCorrelationSinkLayer } from '@eventiva/runtime/telemetry-correlation';
import { telemetryLayer, TelemetryControl } from '@eventiva/runtime/telemetry';
import {
    Clock,
    Config,
    ConfigProvider,
    Deferred,
    Effect,
    Exit,
    Fiber,
    Layer,
    Option,
    Redacted,
    Ref,
    Schema,
    TestClock,
} from 'effect';

const hour = 3_600_000;
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
const identity: FixtureCorrelationIdentity = {
    namespace: Redacted.make('fixture.auth'),
    subject: Redacted.make('RAW-PERSON-A'),
    session: Redacted.make('RAW-SESSION-A'),
    expiresAt: 10 * hour,
};
const keys: FixtureCorrelationKeys = {
    /**
     * Published non-secret fixture bytes only; deliberate repetition across scopes tests HMAC domain separation.
     *
     * @param scope - Key scope the issuer asks for.
     * @returns An effect yielding 32 fixture bytes derived only from the scope epoch.
     */
    get: (scope) => Effect.succeed({ scope, material: Redacted.make(new Uint8Array(32).fill(scope.epoch + 1)) }),
};
const consent = Effect.succeed(10 * hour);
const fixture = fixtureCorrelationLayer(binding, identity, keys, consent);
const environment = ConfigProvider.fromMap(new Map([['NODE_ENV', 'test']]));
const enabled = Layer.succeed(Flags, {
    /**
     * Explicit test opt-in, independent of user consent and the ordinary export grant.
     *
     * @param flag - Flag definition the sink asks about.
     * @returns An effect yielding the safe-default evaluation with its value switched on.
     */
    evaluate: (flag) => Effect.succeed({ ...safeDefault(flag), value: true }),
});
const release = Layer.succeed(TelemetryExportAuthority, {
    /**
     * Model destination release only; this does not replace current user consent.
     *
     * @returns An effect that grants every release request.
     */
    authorize: () => Effect.void,
});
const record: TelemetryRecord = {
    version: 1,
    signal: 'log',
    timestamp: '1970-01-01T00:00:01.000Z',
    level: 'ERROR',
    code: 'request.failed',
    text: 'RAW-ERROR-CANARY',
    profile: 'baseline',
    traceId: '1234567890abcdef1234567890abcdef',
    spanId: '1234567890abcdef',
    parentSpanId: '',
    attributes: { identity: 'RAW-PERSON-A' },
    durationMs: 0,
    outcome: 'failed',
};
const catalog = { messages: { 'request.failed': 'Request failed.' } };

/** Read through the issuer port, never by calling private HMAC helpers. */
const issue = Effect.flatMap(
    CorrelationIssuer,
    /**
     * Each fixture issuance is an explicit request opt-in.
     *
     * @param issuer - Correlation issuer from the current context.
     * @returns An effect yielding a freshly issued request token.
     */
    (issuer) => issuer.issue(true)
);

/**
 * Collect the final minimized public channel after the same final release check a transport must perform.
 *
 * @param before - Work run before the dispatch check, used to delay or revoke; defaults to nothing.
 * @returns The captured writes and a provider layer that fills them.
 */
const collector = (before: Effect.Effect<void> = Effect.void) => {
    const writes: Array<{ readonly record: TelemetryRecord; readonly correlation: TelemetryCorrelation }> = [];
    const layer = Layer.succeed(CorrelationProvider, {
        /**
         * Simulate asynchronous preparation; only a fresh dispatch check permits the local write.
         *
         * @param _binding - Export scope of the write, unused by this provider.
         * @param projected - Minimized record being delivered.
         * @param correlation - Correlation pair attached to the record.
         * @param check - Final release check that must pass before the write is kept.
         * @returns An effect that runs the preparation and the check, then records the write.
         */
        write: (_binding, projected, correlation, check) =>
            before.pipe(
                Effect.zipRight(check),
                Effect.zipRight(
                    Effect.sync(
                        /** Keep no raw request capability or identities in the captured output. */ () => {
                            writes.push({ record: projected, correlation });
                        }
                    )
                )
            ),
    });
    return { writes, layer };
};

/**
 * Compose the ordinary minimizer with a request-scoped correlation lease and fixture-only output.
 *
 * @param token - Request correlation token the lease carries.
 * @param provider - Correlation provider that receives released records.
 * @param optIn - Whether the request opted in to correlation; defaults to true.
 * @param scope - Export binding of the sink; defaults to the fixture binding.
 * @param flags - Flags layer for the sink; defaults to everything enabled.
 * @returns A sink layer with the governed minimizer, release authority and flags provided.
 */
const sinkLayer = (
    token: TelemetryCorrelation,
    provider: Layer.Layer<CorrelationProvider, TelemetrySinkFailure>,
    optIn = true,
    scope = binding,
    flags = enabled
) =>
    governedCorrelationSinkLayer(scope, catalog, { optIn, correlation: token }).pipe(
        Layer.provide(provider),
        Layer.provide(release),
        Layer.provide(flags)
    );

describe('fixture-only pseudonymous correlation', /** Exercise public issuer, request lease and optional refresh contracts. */ () => {
    // The untouched adapter follows the same pair/lease matrix, ruling out an always-denied corruption control.
    for (const adapter of ['control', 'authority', 'provider'] as const) {
        for (const mutation of ['pair', 'lease'] as const) {
            it.effect(
                `preserves request correlation after retained ${adapter} ${mutation} mutation`,
                /**
                 * Previously released adapter views cannot relabel the next write or extend an hourly lease.
                 *
                 * @returns The scenario that corrupts retained adapter views and crosses the hourly boundary.
                 */
                () =>
                    Effect.gen(
                        /** Mutate retained references only after successful dispatch, then cross the exact UTC boundary. */ function* () {
                            // Keep expected scalars separate from adapter views so retained writes cannot rewrite the oracle.
                            const token: TelemetryCorrelation = {
                                version: 1,
                                session: 'a'.repeat(64),
                                person: 'b'.repeat(64),
                                epoch: 0,
                                expiresAt: hour,
                            };
                            const retained: TelemetryCorrelation[] = [];
                            const received: TelemetryCorrelation[] = [];
                            const scopes: TelemetryExportBinding[] = [];
                            yield* Effect.gen(
                                /** An unchanged control follows the same writes, flush and rotation as corrupting adapters. */ function* () {
                                    const sink = yield* TelemetrySink;
                                    // Advancing the epoch before release already fails closed; retain aliases only after success.
                                    yield* sink.write(record);
                                    if (mutation === 'pair')
                                        for (const view of retained)
                                            Object.assign(view, { session: 'c'.repeat(64), person: 'd'.repeat(64) });
                                    yield* sink.write(record);
                                    yield* sink.flush;
                                    expect(received).toEqual([token, token]);
                                    for (const scope of scopes) expect(scope).toEqual(binding);
                                    if (mutation === 'lease')
                                        for (const view of retained)
                                            Object.assign(view, { epoch: 1, expiresAt: 2 * hour });
                                    // A released view naming the next epoch must not extend the original request capability.
                                    yield* TestClock.adjust(hour);
                                    expect((yield* Effect.flip(sink.write(record))).reason).toBe('unavailable');
                                    expect((yield* Effect.flip(sink.flush)).reason).toBe('unavailable');
                                    expect(received).toEqual([token, token]);
                                }
                            ).pipe(
                                Effect.provide(
                                    sinkLayer(
                                        token,
                                        Layer.succeed(CorrelationProvider, {
                                            /**
                                             * Run the final release fence before retaining the provider's view.
                                             *
                                             * @param scope - Binding view passed to the provider.
                                             * @param _record - Minimized record, unused by this provider.
                                             * @param pair - Correlation pair passed to the provider.
                                             * @param check - Final release check that must pass first.
                                             * @returns An effect that runs the check and then snapshots the views.
                                             */
                                            write: (scope, _record, pair, check) =>
                                                check.pipe(
                                                    Effect.zipRight(
                                                        Effect.sync(
                                                            /** Snapshots assert visible delivery independently of later reference corruption. */ () => {
                                                                // Capture before retaining: later mutations must not relabel observed earlier delivery.
                                                                scopes.push({ ...scope });
                                                                received.push({ ...pair });
                                                                if (adapter === 'provider') retained.push(pair);
                                                            }
                                                        )
                                                    )
                                                ),
                                        })
                                    ).pipe(
                                        Layer.provide(
                                            Layer.succeed(CorrelationAuthority, {
                                                /**
                                                 * Permit release while retaining only this authority's disposable view.
                                                 *
                                                 * @param scope - Binding view passed to the authority.
                                                 * @param pair - Correlation pair passed to the authority.
                                                 * @returns An effect that snapshots the views, may corrupt them, and grants the request.
                                                 */
                                                authorize: (scope, pair) =>
                                                    Effect.sync(
                                                        /** Retain the token for later corruption and rewrite only this binding view now. */ () => {
                                                            // Alter scope immediately but retain pair aliases for a later operation, exercising both lifetimes.
                                                            scopes.push({ ...scope });
                                                            if (adapter === 'authority') {
                                                                retained.push(pair);
                                                                if (mutation === 'pair')
                                                                    Object.assign(scope, {
                                                                        purpose: 'changed',
                                                                        generation: 99,
                                                                    });
                                                            }
                                                        }
                                                    ),
                                            })
                                        )
                                    )
                                )
                            );
                        }
                    )
            );
        }
    }

    it.effect(
        'rechecks each independent live flag on writes and flush without losing the admitted pair',
        /**
         * Disabling either flag revokes an existing sink, while reenabling it cannot change its request token.
         *
         * @returns The scenario that turns each flag off and on again on a live sink.
         */
        () =>
            Effect.gen(
                /** Use a permissive authority so only the runtime flag fence can deny delivery. */ function* () {
                    // Each gate gets a fresh sink and mutable decision; revoking one must not rely on the other being off.
                    const token: TelemetryCorrelation = {
                        version: 1,
                        session: 'a'.repeat(64),
                        person: 'b'.repeat(64),
                        epoch: 0,
                        expiresAt: hour,
                    };
                    for (const key of ['telemetry.export.enabled', 'telemetry.correlation.pseudonymous.enabled']) {
                        const active = yield* Ref.make(true);
                        const output = collector();
                        const flags = Layer.succeed(Flags, {
                            /**
                             * All flags except the selected live gate remain explicitly enabled.
                             *
                             * @param flag - Flag definition the sink asks about.
                             * @returns An effect yielding the evaluation, which is off only for the selected gate while it is revoked.
                             */
                            evaluate: (flag) =>
                                Ref.get(active).pipe(
                                    Effect.map(
                                        /**
                                         * Read live state rather than caching acquisition-time permission.
                                         *
                                         * @param value - Current live state of the selected gate.
                                         * @returns The safe-default evaluation with the live value applied to the selected gate.
                                         */
                                        (value) => ({
                                            ...safeDefault(flag),
                                            value: flag.key !== key || value,
                                        })
                                    )
                                ),
                        });
                        yield* Effect.gen(
                            /** Both delivery paths must deny during revocation and recover only in the original epoch. */ function* () {
                                // Positive deliveries bracket revocation, distinguishing live reauthorization from a permanently closed handle.
                                const sink = yield* TelemetrySink;
                                yield* sink.write(record);
                                yield* Ref.set(active, false);
                                expect((yield* Effect.flip(sink.write(record))).reason).toBe('unavailable');
                                expect((yield* Effect.flip(sink.flush)).reason).toBe('unavailable');
                                yield* Ref.set(active, true);
                                yield* sink.write(record);
                                yield* sink.flush;
                                expect(output.writes).toEqual([
                                    {
                                        record: { ...record, text: 'Request failed.', attributes: {} },
                                        correlation: token,
                                    },
                                    {
                                        record: { ...record, text: 'Request failed.', attributes: {} },
                                        correlation: token,
                                    },
                                ]);
                            }
                        ).pipe(
                            Effect.provide(
                                sinkLayer(token, output.layer, true, binding, flags).pipe(
                                    Layer.provide(
                                        Layer.succeed(CorrelationAuthority, {
                                            /**
                                             * Isolate runtime gates from fixture identity and consent validation.
                                             *
                                             * @returns An effect that grants every release request.
                                             */
                                            authorize: () => Effect.void,
                                        })
                                    )
                                )
                            )
                        );
                    }
                }
            )
    );

    it.effect(
        'sends only the current pseudonymous pair over a real loopback OTLP socket and rejects late dispatch',
        /**
         * Use actual HTTP rather than a fetch mock to prove the serialized release boundary.
         *
         * @returns The scenario that exports through a real loopback HTTP collector and inspects the received bytes.
         */
        () =>
            Effect.scoped(
                Effect.gen(
                    /** Own the disposable loopback collector and inspect every byte received by it. */ function* () {
                        const writes: Array<{ readonly body: string; readonly headers: string }> = [];
                        const server = yield* Effect.acquireRelease(
                            Effect.promise(
                                /**
                                 * Bind only an ephemeral loopback port; no external destination is contacted.
                                 *
                                 * @returns A promise of the collector server once it is listening.
                                 */
                                () =>
                                    new Promise<ReturnType<typeof createServer>>(
                                        /**
                                         * Resolve only once the collector can accept a real socket.
                                         *
                                         * @param resolve - Settles the outer promise with the listening server.
                                         */
                                        (resolve) => {
                                            // Await listen completion so a refused socket cannot masquerade as export denial.
                                            const collector = createServer(
                                                /**
                                                 * Acknowledge only after retaining the complete synthetic request.
                                                 *
                                                 * @param request - Incoming collector request.
                                                 * @param response - Response used to acknowledge the request.
                                                 */
                                                (request, response) => {
                                                    // Accumulate the complete body; chunk-local assertions could miss split private values.
                                                    const chunks: Buffer[] = [];
                                                    request.on(
                                                        'data',
                                                        /**
                                                         * Fixture payloads are bounded by the production serializer.
                                                         *
                                                         * @param chunk - Part of the request body.
                                                         * @returns The new number of buffered chunks.
                                                         */
                                                        (chunk: Buffer) => chunks.push(chunk)
                                                    );
                                                    request.on(
                                                        'end',
                                                        /** Retain wire output, not serializer arguments. */ () => {
                                                            // Acknowledge after capture so successful delivery necessarily has observable wire evidence.
                                                            writes.push({
                                                                body: Buffer.concat(chunks).toString('utf8'),
                                                                headers: JSON.stringify(request.headers),
                                                            });
                                                            response.writeHead(200, {
                                                                'content-type': 'application/json',
                                                            });
                                                            response.end('{}');
                                                        }
                                                    );
                                                }
                                            );
                                            collector.listen(
                                                0,
                                                '127.0.0.1',
                                                /**
                                                 * Listening is the fixture's sole readiness signal.
                                                 *
                                                 * @returns Nothing; the promise is settled with the server.
                                                 */
                                                () => resolve(collector)
                                            );
                                        }
                                    )
                            ),
                            /**
                             * Release fixture sockets even when an assertion fails.
                             *
                             * @param server - Collector server acquired above.
                             * @returns An effect that completes once the server and its connections are closed.
                             */
                            (server) =>
                                Effect.promise(
                                    /** Close idle keep-alive sockets as part of fixture ownership. */ () =>
                                        new Promise<void>(
                                            /**
                                             * Await the Node server's completion callback.
                                             *
                                             * @param resolve - Settles the promise once the server has closed.
                                             */
                                            (resolve) => {
                                                // Force-close keep-alive sockets as well as the listener so fixture ownership cannot escape.
                                                server.close(
                                                    /**
                                                     * No request survives the scoped test.
                                                     *
                                                     * @returns Nothing; the close promise is settled.
                                                     */
                                                    () => resolve()
                                                );
                                                server.closeAllConnections();
                                            }
                                        )
                                )
                        );
                        const address = server.address();
                        if (address === null || typeof address === 'string')
                            return yield* Effect.die('fixture address');
                        const transport = otlpTelemetryLayer(
                            binding,
                            Config.succeed({
                                enabled: true,
                                endpoint: Redacted.make(`http://127.0.0.1:${address.port}/v1/traces`),
                                headers: Redacted.make('{}'),
                                timeoutMs: 1000,
                            })
                        ).pipe(Layer.provide(FetchHttpClient.layer));
                        const span = { ...record, signal: 'span' } as const;
                        for (let epoch = 0; epoch < 2; epoch++) {
                            const token = yield* issue;
                            const sink = sinkLayer(token, transport);
                            yield* Effect.gen(
                                /** Drive actual central instrumentation before examining bytes received on the socket. */ function* () {
                                    // A real failed span exercises error minimization before the transport sees the correlation pair.
                                    yield* Effect.fail('RAW-ERROR-CANARY').pipe(
                                        Effect.withSpan('request.failed'),
                                        Effect.ignore
                                    );
                                    yield* (yield* TelemetryControl).flush;
                                }
                            ).pipe(
                                Effect.provide(
                                    telemetryLayer(
                                        { ...catalog, attributes: {} },
                                        Config.succeed({ enabled: true, capacity: 8, timeoutMs: 1000 })
                                    ).pipe(Layer.provide(sink))
                                )
                            );
                            yield* Effect.gen(
                                /** Reject unsupported log export explicitly rather than falsely acknowledging it. */ function* () {
                                    const provider = yield* TelemetrySink;
                                    // An unsupported signal must fail without poisoning the provider's payload-free drain.
                                    expect(Exit.isFailure(yield* Effect.exit(provider.write(record)))).toBe(true);
                                    yield* provider.flush;
                                }
                            ).pipe(Effect.provide(sink));
                            const wire = yield* Schema.decode(
                                Schema.parseJson(
                                    Schema.Struct({
                                        resourceSpans: Schema.Array(
                                            Schema.Struct({
                                                scopeSpans: Schema.Array(
                                                    Schema.Struct({
                                                        spans: Schema.Array(
                                                            Schema.Struct({
                                                                attributes: Schema.Array(
                                                                    Schema.Struct({
                                                                        key: Schema.String,
                                                                        value: Schema.Struct({
                                                                            stringValue: Schema.String,
                                                                        }),
                                                                    })
                                                                ),
                                                                status: Schema.Struct({ code: Schema.Number }),
                                                            })
                                                        ),
                                                    })
                                                ),
                                            })
                                        ),
                                    })
                                )
                            )(writes[epoch]?.body ?? '{}');
                            const exported = wire.resourceSpans[0]?.scopeSpans[0]?.spans[0];
                            // Raw body inequality can also come from fresh trace IDs; compare each epoch's exact pair.
                            expect(exported?.attributes).toEqual([
                                { key: '$session_id', value: { stringValue: token.session } },
                                { key: 'posthog.distinct_id', value: { stringValue: token.person } },
                            ]);
                            expect(exported?.status.code).toBe(2);
                            expect(JSON.stringify(writes)).not.toMatch(
                                /RAW-|fixture.auth|11111111|99999999|example.logger|diagnostics|traceparent|tracestate|baggage|x-posthog/
                            );
                            yield* TestClock.adjust(hour);
                        }
                        expect(writes).toHaveLength(2);
                        expect(writes[0]?.body).not.toBe(writes[1]?.body);
                        yield* Effect.gen(
                            /** Expiry after transport preparation must prevent any new socket write. */ function* () {
                                // Delay at the final transport boundary, beyond issuance and initial authorization.
                                const provider = yield* CorrelationProvider;
                                const token = yield* issue;
                                const late = yield* Effect.exit(
                                    provider.write(binding, span, token, TestClock.adjust(hour))
                                );
                                expect(Exit.isFailure(late)).toBe(true);
                                const invalid = yield* Effect.exit(
                                    provider.write(binding, span, { ...token, person: 'RAW-PERSON-A' }, Effect.void)
                                );
                                expect(Exit.isFailure(invalid)).toBe(true);
                            }
                        ).pipe(Effect.provide(transport));
                        for (const header of [
                            'TraceParent',
                            'TraceState',
                            'Baggage',
                            'X-POSTHOG-SESSION-ID',
                            'X-POSTHOG-DISTINCT-ID',
                        ]) {
                            const denied = yield* Effect.void.pipe(
                                Effect.provide(
                                    otlpTelemetryLayer(
                                        binding,
                                        Config.succeed({
                                            enabled: true,
                                            endpoint: Redacted.make(`http://127.0.0.1:${address.port}/v1/traces`),
                                            headers: Redacted.make(JSON.stringify({ [header]: 'RAW-HEADER-CANARY' })),
                                            timeoutMs: 1000,
                                        })
                                    ).pipe(Layer.provide(FetchHttpClient.layer))
                                ),
                                Effect.exit
                            );
                            expect(Exit.isFailure(denied)).toBe(true);
                            expect(JSON.stringify(denied)).not.toContain('RAW-HEADER-CANARY');
                        }
                        expect(writes).toHaveLength(2);
                    }
                )
            ).pipe(Effect.provide(fixture), Effect.withConfigProvider(environment))
    );

    it.effect(
        'matches independent Python HMAC outputs and keeps raw fixture identity out of tokens',
        /**
         * Fixed expected values were calculated with Python hmac/hashlib, not the implementation formatter.
         *
         * @returns The scenario that issues a token and compares it with independently computed HMAC values.
         */
        () =>
            Effect.gen(
                /** Compare fixture issuance with an independently computed wire token. */ function* () {
                    // Fixed external HMAC vectors detect shared implementation mistakes that comparing two issued tokens would miss.
                    expect(correlationEpochMs).toBe(hour);
                    const token = yield* issue;
                    expect(token).toEqual({
                        version: 1,
                        epoch: 0,
                        expiresAt: hour,
                        person: 'fe7238dc532328749c034592a483858a0e7ce781c9bf8b86ad79e690733b1d96',
                        session: '2982952dd98e547f5216c8bd5c4d125bbb7b9d16b5d54067bc842f1312819338',
                    });
                    expect(JSON.stringify(token)).not.toMatch(/RAW-|fixture.auth|11111111/);
                }
            ).pipe(Effect.provide(fixture), Effect.withConfigProvider(environment))
    );

    it.effect(
        'separates scopes, subjects, sessions, framing and epochs while preserving same-person linkage',
        /**
         * Asymmetric fixture identities distinguish a session hash from a person hash and delimiter concatenation.
         *
         * @returns The scenario that changes one identity domain at a time and checks which linkage values change.
         */
        () =>
            Effect.gen(
                /** Domain changes must alter only their intended linkage dimensions. */ function* () {
                    // Same-person/new-session controls distinguish domain separation from simply randomizing every issuance.
                    const original = yield* issue.pipe(Effect.provide(fixture));
                    const same = yield* issue.pipe(
                        Effect.provide(fixtureCorrelationLayer(binding, identity, keys, consent))
                    );
                    expect(same).toEqual(original);
                    const otherSession = yield* issue.pipe(
                        Effect.provide(
                            fixtureCorrelationLayer(
                                binding,
                                { ...identity, session: Redacted.make('RAW-SESSION-B') },
                                keys,
                                consent
                            )
                        )
                    );
                    expect(otherSession.person).toBe(original.person);
                    expect(otherSession.session).not.toBe(original.session);
                    for (const scope of [
                        { ...binding, tenantId: Schema.decodeSync(TenantId)('22222222-2222-4222-8222-222222222222') },
                        { ...binding, purpose: 'other.diagnostics' },
                        { ...binding, destinationId: '88888888-8888-4888-8888-888888888888' },
                    ]) {
                        const token = yield* issue.pipe(
                            Effect.provide(fixtureCorrelationLayer(scope, identity, keys, consent))
                        );
                        expect(token.person).not.toBe(original.person);
                        expect(token.session).not.toBe(original.session);
                    }
                    const a = yield* issue.pipe(
                        Effect.provide(
                            fixtureCorrelationLayer(
                                binding,
                                { ...identity, namespace: Redacted.make('a|b'), subject: Redacted.make('c') },
                                keys,
                                consent
                            )
                        )
                    );
                    const b = yield* issue.pipe(
                        Effect.provide(
                            fixtureCorrelationLayer(
                                binding,
                                { ...identity, namespace: Redacted.make('a'), subject: Redacted.make('b|c') },
                                keys,
                                consent
                            )
                        )
                    );
                    expect(a.person).not.toBe(b.person);
                    yield* TestClock.adjust(hour);
                    const next = yield* issue.pipe(Effect.provide(fixture));
                    expect(next.epoch).toBe(1);
                    expect(next.person).not.toBe(original.person);
                    expect(next.session).not.toBe(original.session);
                }
            ).pipe(Effect.withConfigProvider(environment))
    );

    it.effect(
        'denies absent/production environment, protected profiles and every nonordinary operation',
        /**
         * A permissive consent fixture must never waive the hard host floor.
         *
         * @returns The scenario that issues under each missing environment and protection floor and expects denial.
         */
        () =>
            Effect.gen(
                /** Exercise the deployment floor independently of consent policy. */ function* () {
                    // Consent remains permissive in every case, so it cannot hide a missing environment or protection floor.
                    for (const env of [new Map<string, string>(), new Map([['NODE_ENV', 'production']])]) {
                        expect(
                            Exit.isFailure(
                                yield* issue.pipe(
                                    Effect.provide(fixture),
                                    Effect.withConfigProvider(ConfigProvider.fromMap(env)),
                                    Effect.exit
                                )
                            )
                        ).toBe(true);
                    }
                    for (const scope of [
                        { ...binding, profile: 'restricted' },
                        { ...binding, profile: 'vault' },
                        { ...binding, operation: 'protected' },
                        { ...binding, operation: 'financial' },
                        { ...binding, operation: 'emergency' },
                        { ...binding, operation: 'decrypting' },
                    ] satisfies ReadonlyArray<TelemetryExportBinding>) {
                        expect(
                            Exit.isFailure(
                                yield* issue.pipe(
                                    Effect.provide(fixtureCorrelationLayer(scope, identity, keys, consent)),
                                    Effect.withConfigProvider(environment),
                                    Effect.exit
                                )
                            )
                        ).toBe(true);
                    }
                }
            )
    );

    it.effect(
        'denies missing authority, opt-out, expired consent/session and revoked or invalid fixture keys',
        /**
         * Negative controls use valid pseudonym syntax so rejection cannot hide behind malformed inputs.
         *
         * @returns The scenario that issues under unavailable consent, expired identity and bad keys and expects denial.
         */
        () =>
            Effect.gen(
                /** Fail closed on unavailable fixture authority rather than selecting a fallback. */ function* () {
                    // Vary authority, lifetime and key validity separately; no substitute key or cached opt-in is acceptable.
                    expect(Exit.isFailure(yield* issue.pipe(Effect.provide(CorrelationDeny), Effect.exit))).toBe(true);
                    for (const layer of [
                        fixtureCorrelationLayer(binding, identity, keys, Effect.succeed(0)),
                        fixtureCorrelationLayer(binding, { ...identity, expiresAt: 1 }, keys, consent),
                        fixtureCorrelationLayer(
                            binding,
                            identity,
                            {
                                /**
                                 * No fallback on unavailable key.
                                 *
                                 * @returns An unavailable failure, used directly as a failing effect.
                                 */
                                get: () => new TelemetrySinkFailure({ reason: 'unavailable' }),
                            },
                            consent
                        ),
                        fixtureCorrelationLayer(
                            binding,
                            identity,
                            {
                                /**
                                 * Reject wrong-size material rather than stretching it.
                                 *
                                 * @param scope - Key scope the issuer asks for.
                                 * @returns An effect yielding 31 bytes of key material, one short of the required length.
                                 */
                                get: (scope) => Effect.succeed({ scope, material: Redacted.make(new Uint8Array(31)) }),
                            },
                            consent
                        ),
                    ]) {
                        yield* TestClock.adjust(1);
                        expect(Exit.isFailure(yield* issue.pipe(Effect.provide(layer), Effect.exit))).toBe(true);
                    }
                    const denied = yield* Effect.flatMap(
                        CorrelationIssuer,
                        /**
                         * A session's previous opt-in is not inherited by this request.
                         *
                         * @param issuer - Correlation issuer from the current context.
                         * @returns An effect that issues without opt-in.
                         */
                        (issuer) => issuer.issue(false)
                    ).pipe(Effect.provide(fixture), Effect.exit);
                    expect(Exit.isFailure(denied)).toBe(true);
                }
            ).pipe(Effect.withConfigProvider(environment))
    );

    it.effect(
        'binds tokens to the exact caller, session, binding and current consent',
        /**
         * Test substitution, replay and shortened consent through the authority's public interface.
         *
         * @returns The scenario that substitutes, replays and shortens consent against one live authority.
         */
        () =>
            Effect.gen(
                /** Current consent changes remain visible inside an already-issued request lease. */ function* () {
                    // Keep one authority scope alive so revocation cannot be explained by disposal or reacquisition.
                    const granted = yield* Ref.make(10 * hour);
                    const live = fixtureCorrelationLayer(binding, identity, keys, Ref.get(granted));
                    yield* Effect.gen(
                        /** Keep the authority alive while exercising replay and substitution. */ function* () {
                            const token = yield* issue;
                            const authority = yield* CorrelationAuthority;
                            yield* authority.authorize(binding, token);
                            for (const candidate of [
                                { ...binding, generation: 4 },
                                { ...binding, moduleId: 'other.module' },
                                { ...binding, moduleVersion: '2.0.0' },
                                { ...binding, purpose: 'other' },
                                { ...binding, profile: 'sensitive' },
                            ] satisfies ReadonlyArray<TelemetryExportBinding>) {
                                expect(
                                    Exit.isFailure(yield* authority.authorize(candidate, token).pipe(Effect.exit))
                                ).toBe(true);
                            }
                            // Person/session forgeries retain valid-length syntax, distinguishing binding checks from decoding.
                            for (const forged of [
                                { ...token, person: 'a'.repeat(64) },
                                { ...token, session: 'b'.repeat(64) },
                                { ...token, epoch: 1 },
                                { ...token, expiresAt: hour + 1 },
                            ]) {
                                expect(
                                    Exit.isFailure(yield* authority.authorize(binding, forged).pipe(Effect.exit))
                                ).toBe(true);
                            }
                            expect(
                                Exit.isFailure(
                                    yield* Effect.flatMap(
                                        CorrelationAuthority,
                                        /**
                                         * Keep the other principal's authority live so denial proves substitution, not scope closure.
                                         *
                                         * @param other - Correlation authority for a different principal.
                                         * @returns An effect that tries to authorize the first principal token there.
                                         */
                                        (other) => other.authorize(binding, token)
                                    ).pipe(
                                        Effect.provide(
                                            fixtureCorrelationLayer(
                                                binding,
                                                { ...identity, subject: Redacted.make('RAW-PERSON-B') },
                                                keys,
                                                consent
                                            )
                                        ),
                                        Effect.exit
                                    )
                                )
                            ).toBe(true);
                            yield* Ref.set(granted, 1);
                            expect(Exit.isFailure(yield* authority.authorize(binding, token).pipe(Effect.exit))).toBe(
                                true
                            );
                            yield* TestClock.adjust(hour);
                            expect(Exit.isFailure(yield* authority.authorize(binding, token).pipe(Effect.exit))).toBe(
                                true
                            );
                        }
                    ).pipe(Effect.provide(live));
                }
            ).pipe(Effect.withConfigProvider(environment))
    );

    it.effect(
        'rechecks consent and epoch after suspended key preparation',
        /**
         * Revoke or rotate during key access; an earlier grant or epoch cannot authorize completed derivation.
         *
         * @returns The scenario that revokes consent or rotates the epoch while key access is suspended.
         */
        () =>
            Effect.gen(
                /** Suspend preparation at a real Effect barrier before revoking its policy. */ function* () {
                    // Both races occur after key access starts, exposing stale admission state rather than ordinary initial denial.
                    for (const race of ['consent', 'epoch'] as const) {
                        const started = yield* Deferred.make<void>();
                        const resume = yield* Deferred.make<void>();
                        const grant = yield* Ref.make(10 * hour);
                        const delayed: FixtureCorrelationKeys = {
                            /**
                             * Model an asynchronous server-only key handle.
                             *
                             * @param scope - Key scope the issuer asks for.
                             * @returns An effect that signals entry, waits for the test, then yields the fixture key.
                             */
                            get: (scope) =>
                                Deferred.succeed(started, undefined).pipe(
                                    Effect.zipRight(Deferred.await(resume)),
                                    Effect.zipRight(keys.get(scope))
                                ),
                        };
                        const fiber = yield* issue.pipe(
                            Effect.provide(fixtureCorrelationLayer(binding, identity, delayed, Ref.get(grant))),
                            Effect.fork
                        );
                        yield* Deferred.await(started);
                        if (race === 'consent') yield* Ref.set(grant, 0);
                        else yield* TestClock.adjust(hour);
                        yield* Deferred.succeed(resume, undefined);
                        expect(Exit.isFailure(yield* Fiber.await(fiber))).toBe(true);
                    }
                }
            ).pipe(Effect.withConfigProvider(environment))
    );

    it.effect(
        'minimizes local log/error records and denies opt-out/default-off dispatch',
        /**
         * Generic record attributes remain stripped; only the separate pair channel can carry correlation.
         *
         * @returns The scenario that writes a record with private attributes and checks the delivered output.
         */
        () =>
            Effect.gen(
                /** Verify secret canaries in observable output, not private helper calls. */ function* () {
                    // A successful delivery anchors the opt-out controls; an always-denied sink would fail this case.
                    const token = yield* issue;
                    const output = collector();
                    const use = Effect.flatMap(
                        TelemetrySink,
                        /**
                         * A scoped caller cannot bypass the minimizer.
                         *
                         * @param sink - Telemetry sink from the current context.
                         * @returns An effect that writes the fixture record.
                         */
                        (sink) => sink.write(record)
                    );
                    yield* use.pipe(Effect.provide(sinkLayer(token, output.layer)));
                    expect(output.writes).toEqual([
                        { record: { ...record, text: 'Request failed.', attributes: {} }, correlation: token },
                    ]);
                    for (const layer of [
                        sinkLayer(token, output.layer, false),
                        sinkLayer(token, output.layer, true, binding, FlagsSafeDefaults),
                    ]) {
                        expect(Exit.isFailure(yield* use.pipe(Effect.provide(layer), Effect.exit))).toBe(true);
                    }
                    expect(output.writes).toHaveLength(1);
                    expect(JSON.stringify(output.writes)).not.toMatch(/RAW-/);
                }
            ).pipe(Effect.provide(fixture), Effect.withConfigProvider(environment))
    );

    it.effect(
        'drops revoked telemetry prepared before dispatch and never replays on flush',
        /**
         * The transport's final check detects changes after worker admission.
         *
         * @returns The scenario that revokes consent between worker authorization and transport dispatch.
         */
        () =>
            Effect.gen(
                /** Revoke between worker authorization and transport dispatch. */ function* () {
                    // Share mutable consent with the live issuer so dispatch sees a change without rebuilding request authority.
                    const grant = yield* Ref.make(10 * hour);
                    const live = fixtureCorrelationLayer(binding, identity, keys, Ref.get(grant));
                    yield* Effect.gen(
                        /** Hold a valid issuer while invalidating its current consent. */ function* () {
                            const token = yield* issue;
                            // The collector's pre-dispatch hook, not a pre-issuance denial, invalidates this otherwise valid token.
                            const output = collector(Ref.set(grant, 0));
                            yield* Effect.gen(
                                /** A barrier must not replay the denied write under a stale grant. */ function* () {
                                    const sink = yield* TelemetrySink;
                                    // Test drain on the same failed handle, ruling out deferred delivery under the earlier grant.
                                    expect(Exit.isFailure(yield* sink.write(record).pipe(Effect.exit))).toBe(true);
                                    expect(Exit.isFailure(yield* sink.flush.pipe(Effect.exit))).toBe(true);
                                }
                            ).pipe(Effect.provide(sinkLayer(token, output.layer)));
                            expect(output.writes).toEqual([]);
                        }
                    ).pipe(Effect.provide(live));
                }
            ).pipe(Effect.withConfigProvider(environment))
    );

    it.scoped(
        'automatically refreshes a long-running session across four UTC epochs without blocking actions',
        /**
         * Advancing Clock, not request reads, triggers issuance; each boundary resets linkage only.
         *
         * @returns The scenario that advances the clock across epochs and checks scheduled token renewal.
         */
        () =>
            Effect.gen(
                /** Advance background issuance alongside synthetic work, not an ActionHost integration or latency probe. */ function* () {
                    // Advance Clock before reading; reads alone must not be what drives scheduled epoch renewal.
                    const session = yield* correlationSession;
                    yield* TestClock.adjust(0);
                    const first = yield* session.current(true);
                    expect(Option.isSome(first)).toBe(true);
                    let previous = Option.getOrThrow(first);
                    for (let epoch = 1; epoch <= 4; epoch++) {
                        yield* TestClock.adjust(hour);
                        const token = Option.getOrThrow(yield* session.current(true));
                        expect(token.epoch).toBe(epoch);
                        expect(token.session).not.toBe(previous.session);
                        expect(token.person).not.toBe(previous.person);
                        expect(Option.isNone(yield* session.current(false))).toBe(true);
                        expect(yield* Effect.succeed(`action-${epoch}`)).toBe(`action-${epoch}`);
                        previous = token;
                    }
                }
            ).pipe(Effect.provide(fixture), Effect.withConfigProvider(environment))
    );

    it.scoped(
        'lets a request in flight finish across rotation without relabeling its old telemetry',
        /**
         * Synthetic work executes once; its old telemetry fails closed while the next request uses the new epoch.
         *
         * @returns The scenario that suspends business work over an epoch boundary and checks old and new telemetry.
         */
        () =>
            Effect.gen(
                /** Suspend synthetic business work over the exact UTC boundary; this does not invoke ActionHost. */ function* () {
                    // Capture the old pair before crossing expiry, then compare old-work omission with fresh-request delivery.
                    const session = yield* correlationSession;
                    yield* TestClock.adjust(hour - 1);
                    const old = Option.getOrThrow(yield* session.current(true));
                    const prepared = yield* Deferred.make<void>();
                    const continueRequest = yield* Deferred.make<void>();
                    const count = yield* Ref.make(0);
                    const output = collector();
                    const work = Effect.gen(
                        /** Complete one business action even when its optional old telemetry expires. */ function* () {
                            const sink = yield* TelemetrySink;
                            // Hold after handle capture; business completion must not inherit optional telemetry's expiry failure.
                            yield* Deferred.succeed(prepared, undefined);
                            yield* Deferred.await(continueRequest);
                            yield* Ref.update(
                                count,
                                /**
                                 * Business work is independent of optional telemetry.
                                 *
                                 * @param n - Synthetic business counter.
                                 * @returns The counter plus one.
                                 */
                                (n) => n + 1
                            );
                            yield* sink.write(record).pipe(Effect.ignore);
                            return 'accepted';
                        }
                    ).pipe(Effect.provide(sinkLayer(old, output.layer)));
                    const fiber = yield* Effect.fork(work);
                    yield* Deferred.await(prepared);
                    yield* TestClock.adjust(1);
                    yield* Deferred.succeed(continueRequest, undefined);
                    expect(yield* Fiber.join(fiber)).toBe('accepted');
                    expect(yield* Ref.get(count)).toBe(1);
                    expect(output.writes).toEqual([]);
                    const fresh = Option.getOrThrow(yield* session.current(true));
                    expect(fresh.epoch).toBe(1);
                    yield* Effect.flatMap(
                        TelemetrySink,
                        /**
                         * The next request uses only the new pair.
                         *
                         * @param sink - Telemetry sink from the current context.
                         * @returns An effect that writes the fixture record.
                         */
                        (sink) => sink.write(record)
                    ).pipe(Effect.provide(sinkLayer(fresh, output.layer)));
                    expect(output.writes[0]?.correlation).toEqual(fresh);
                }
            ).pipe(Effect.provide(fixture), Effect.withConfigProvider(environment))
    );

    it.scoped(
        'omits linkage during an issuer outage and recovers automatically without a business retry',
        /**
         * Renewal is bounded to one second; a stale token is never used during timeout/recovery.
         *
         * @returns The scenario that stalls renewal and checks the cache expires and later recovers.
         */
        () =>
            Effect.gen(
                /** Cache expiry is independent of a stalled issuer and successful user work. */ function* () {
                    // Stall renewal only after an initial token exists, exposing stale-cache reuse as well as recovery.
                    const down = yield* Ref.make(false);
                    const realIssuer = yield* CorrelationIssuer;
                    const session = yield* correlationSession.pipe(
                        Effect.provideService(CorrelationIssuer, {
                            /**
                             * Simulate a slow issuer only, not failing or retrying application requests.
                             *
                             * @param optIn - Whether the request opted in to correlation.
                             * @returns An effect that never completes while the issuer is down, otherwise the real issuance.
                             */
                            issue: (optIn) =>
                                Ref.get(down).pipe(
                                    Effect.flatMap(
                                        /**
                                         * A stalled optional issuer must not stall business reads.
                                         *
                                         * @param unavailable - Whether the issuer is currently down.
                                         * @returns A never-completing effect when down, otherwise the real issuance.
                                         */
                                        (unavailable) => (unavailable ? Effect.never : realIssuer.issue(optIn))
                                    )
                                ),
                        })
                    );
                    yield* TestClock.adjust(0);
                    expect(Option.isSome(yield* session.current(true))).toBe(true);
                    yield* Ref.set(down, true);
                    yield* TestClock.adjust(hour);
                    expect(Option.isNone(yield* session.current(true))).toBe(true);
                    expect(yield* Effect.succeed('business-success')).toBe('business-success');
                    yield* TestClock.adjust(1000);
                    yield* Ref.set(down, false);
                    yield* TestClock.adjust(1000);
                    expect(Option.getOrThrow(yield* session.current(true)).epoch).toBe(1);
                }
            ).pipe(Effect.provide(fixture), Effect.withConfigProvider(environment))
    );

    it.effect(
        'rejects forged schema fields and closed issuer/session handles',
        /**
         * Closing ownership revokes even retained references; token syntax is never authority.
         *
         * @returns The scenario that closes the owning scope and uses retained readers afterwards.
         */
        () =>
            Effect.gen(
                /** Scope disposal revokes retained readers without remote cleanup work. */ function* () {
                    // Clock stays fixed so retained-handle refusals prove ownership closure, not time expiry.
                    const token = yield* issue.pipe(Effect.provide(fixture));
                    expect(
                        Exit.isFailure(
                            yield* Schema.decodeUnknown(TelemetryCorrelation)({ ...token, rawId: 'RAW-PERSON-A' }).pipe(
                                Effect.exit
                            )
                        )
                    ).toBe(true);
                    const issuer = yield* CorrelationIssuer.pipe(Effect.provide(fixture));
                    expect(Exit.isFailure(yield* issuer.issue(true).pipe(Effect.exit))).toBe(true);
                    const session = yield* Effect.scoped(correlationSession.pipe(Effect.provide(fixture)));
                    expect(Option.isNone(yield* session.current(true))).toBe(true);
                    expect(yield* Clock.currentTimeMillis).toBe(0);
                }
            ).pipe(Effect.withConfigProvider(environment))
    );

    it.effect(
        'rejects malformed capabilities and denies keys from another scope or epoch',
        /**
         * Invalid runtime inputs are rejected without leaking their identity-bearing decoder details.
         *
         * @returns The scenario that passes invalid keys, bindings and request metadata and expects safe rejection.
         */
        () =>
            Effect.gen(
                /** Probe public boundaries with structurally typed but semantically invalid values. */ function* () {
                    // Correctly sized key bytes are insufficient when their scope or epoch metadata belongs elsewhere.
                    for (const layer of [
                        fixtureCorrelationLayer({ ...binding, generation: -1 }, identity, keys, consent),
                        fixtureCorrelationLayer(binding, { ...identity, subject: Redacted.make('') }, keys, consent),
                        fixtureCorrelationLayer(
                            binding,
                            identity,
                            {
                                /**
                                 * A key returned for a different epoch is not a fallback.
                                 *
                                 * @param scope - Key scope the issuer asks for.
                                 * @returns An effect yielding the key for the following epoch.
                                 */
                                get: (scope) => keys.get({ ...scope, epoch: scope.epoch + 1 }),
                            },
                            consent
                        ),
                        fixtureCorrelationLayer(
                            binding,
                            identity,
                            {
                                /**
                                 * Scope metadata must match even when key bytes have the right size.
                                 *
                                 * @param scope - Key scope the issuer asks for.
                                 * @returns An effect yielding a key derived for an unrelated purpose.
                                 */
                                get: (scope) => keys.get({ ...scope, purpose: 'unrelated' }),
                            },
                            consent
                        ),
                    ])
                        expect(Exit.isFailure(yield* issue.pipe(Effect.provide(layer), Effect.exit))).toBe(true);
                    yield* Effect.gen(
                        /** Keep valid policy ownership while rejecting malformed presentation. */ function* () {
                            // Acquire a real token first so later malformed inputs are not obscured by missing issuer authority.
                            const token = yield* issue;
                            const authority = yield* CorrelationAuthority;
                            expect(
                                Exit.isFailure(
                                    yield* authority.authorize({ ...binding, generation: -1 }, token).pipe(Effect.exit)
                                )
                            ).toBe(true);
                            expect(
                                Exit.isFailure(
                                    yield* authority
                                        .authorize(binding, { ...token, session: 'invalid' })
                                        .pipe(Effect.exit)
                                )
                            ).toBe(true);
                            const deny = yield* CorrelationAuthority.pipe(Effect.provide(CorrelationDeny));
                            expect(Exit.isFailure(yield* deny.authorize(binding, token).pipe(Effect.exit))).toBe(true);
                            const output = collector();
                            const use = Effect.flatMap(
                                TelemetrySink,
                                /**
                                 * No provider is consulted for invalid request metadata.
                                 *
                                 * @param sink - Telemetry sink from the current context.
                                 * @returns An effect that writes the fixture record.
                                 */
                                (sink) => sink.write(record)
                            );
                            for (const layer of [
                                sinkLayer({ ...token, session: 'raw' }, output.layer),
                                sinkLayer(token, output.layer, true, { ...binding, generation: -1 }),
                            ]) {
                                expect(Exit.isFailure(yield* use.pipe(Effect.provide(layer), Effect.exit))).toBe(true);
                            }
                            const flags = Layer.succeed(Flags, {
                                /**
                                 * Ordinary export stays enabled so this specifically tests the correlation flag.
                                 *
                                 * @param flag - Flag definition the sink asks about.
                                 * @returns An effect yielding the evaluation, off only for the correlation flag.
                                 */
                                evaluate: (flag) =>
                                    Effect.succeed({
                                        ...safeDefault(flag),
                                        value: flag.key === 'telemetry.export.enabled',
                                    }),
                            });
                            expect(
                                Exit.isFailure(
                                    yield* use.pipe(
                                        Effect.provide(sinkLayer(token, output.layer, true, binding, flags)),
                                        Effect.exit
                                    )
                                )
                            ).toBe(true);
                            expect(output.writes).toEqual([]);
                        }
                    ).pipe(Effect.provide(fixture));
                }
            ).pipe(Effect.withConfigProvider(environment))
    );

    it.scoped(
        'treats rejected issuance as optional linkage loss, including at initial session startup',
        /**
         * Failing issuer requests must not escape into the action path or keep an old token alive.
         *
         * @returns The scenario that fails issuance and checks that requests still succeed without a stale pair.
         */
        () =>
            Effect.gen(
                /** Background failures are contained and do not require a prompt or client retry. */ function* () {
                    // Observe both initial denial and a scheduled retry; neither may surface a failed request or stale pair.
                    const session = yield* correlationSession.pipe(Effect.provide(CorrelationDeny));
                    yield* TestClock.adjust(0);
                    expect(Option.isNone(yield* session.current(true))).toBe(true);
                    yield* TestClock.adjust(1000);
                    expect(Option.isNone(yield* session.current(true))).toBe(true);
                }
            )
    );

    it.effect(
        'keeps interleaved request spans and error logs isolated through the central telemetry worker',
        /**
         * Distinct request-scoped pipelines never lend one caller's pair to another's queued record.
         *
         * @returns The scenario that runs two overlapping requests and checks each output carries only its own pair.
         */
        () =>
            Effect.gen(
                /** Use real central logging/tracing rather than invoking transport helpers directly. */ function* () {
                    // Distinct subjects and sessions make any cross-request pair substitution observable after interleaving.
                    const outputs = [collector(), collector()];
                    const left = yield* issue.pipe(Effect.provide(fixture));
                    const second = fixtureCorrelationLayer(
                        binding,
                        {
                            ...identity,
                            subject: Redacted.make('RAW-PERSON-B'),
                            session: Redacted.make('RAW-SESSION-B'),
                        },
                        keys,
                        consent
                    );
                    const right = yield* issue.pipe(Effect.provide(second));
                    const leftReady = yield* Deferred.make<void>();
                    const rightReady = yield* Deferred.make<void>();
                    /**
                     * Retain an asymmetric request overlap while each worker observes only its own private lease.
                     *
                     * @param token - Correlation token for this request.
                     * @param output - Collector that receives this request output.
                     * @param mine - Signalled when this request has entered.
                     * @param theirs - Awaited until the other request has entered.
                     * @returns An effect that logs an error in a span, waits for the other request and flushes.
                     */
                    const request = (
                        token: TelemetryCorrelation,
                        output: ReturnType<typeof collector>,
                        mine: Deferred.Deferred<void>,
                        theirs: Deferred.Deferred<void>
                    ) =>
                        Effect.gen(
                            /** Log an error and close a child span before draining this request's worker. */ function* () {
                                // Closing the child before flush includes its span summary alongside the queued error log.
                                yield* Effect.gen(
                                    /** Interleave both request fibers before diagnostic collection. */ function* () {
                                        // Each request waits for the other to enter, ruling out a merely sequential isolation pass.
                                        yield* Deferred.succeed(mine, undefined);
                                        yield* Deferred.await(theirs);
                                        yield* Effect.logError('request.failed').pipe(
                                            Effect.annotateLogs('raw.error', 'RAW-ERROR-CANARY')
                                        );
                                    }
                                ).pipe(Effect.withSpan('request.failed'));
                                yield* (yield* TelemetryControl).flush;
                            }
                        ).pipe(
                            Effect.provide(
                                telemetryLayer(
                                    { ...catalog, attributes: {} },
                                    Config.succeed({ enabled: true, capacity: 8, timeoutMs: 1000 })
                                ).pipe(Layer.provide(sinkLayer(token, output.layer)))
                            )
                        );
                    const [a, b] = outputs;
                    if (!a || !b) return yield* Effect.die('invalid fixture');
                    yield* Effect.all(
                        [
                            request(left, a, leftReady, rightReady).pipe(Effect.provide(fixture)),
                            request(right, b, rightReady, leftReady).pipe(Effect.provide(second)),
                        ],
                        { concurrency: 'unbounded' }
                    );
                    for (const [output, token] of [
                        [a, left],
                        [b, right],
                    ] as const) {
                        expect(output.writes).toHaveLength(2);
                        expect(
                            output.writes
                                .map(
                                    /**
                                     * Observable signal coverage includes the failed/error log and its span.
                                     *
                                     * @param entry - One captured write.
                                     * @returns Whether the write is a log or a span.
                                     */
                                    (entry) => entry.record.signal
                                )
                                .sort()
                        ).toEqual(['log', 'span']);
                        expect(
                            output.writes.every(
                                /**
                                 * No request context crosses the private lease boundary.
                                 *
                                 * @param entry - One captured write.
                                 * @returns Whether the write carries this request pair.
                                 */
                                (entry) =>
                                    entry.correlation.person === token.person &&
                                    entry.correlation.session === token.session
                            )
                        ).toBe(true);
                        expect(JSON.stringify(output.writes)).not.toMatch(/RAW-/);
                    }
                }
            ).pipe(Effect.withConfigProvider(environment))
    );
});
