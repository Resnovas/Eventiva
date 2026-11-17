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
    /** Published non-secret fixture bytes only; deliberate repetition across scopes tests HMAC domain separation. */
    get: (scope) => Effect.succeed({ scope, material: Redacted.make(new Uint8Array(32).fill(scope.epoch + 1)) }),
};
const consent = Effect.succeed(10 * hour);
const fixture = fixtureCorrelationLayer(binding, identity, keys, consent);
const environment = ConfigProvider.fromMap(new Map([['NODE_ENV', 'test']]));
const enabled = Layer.succeed(Flags, {
    /** Explicit test opt-in, independent of user consent and the ordinary export grant. */
    evaluate: (flag) => Effect.succeed({ ...safeDefault(flag), value: true }),
});
const release = Layer.succeed(TelemetryExportAuthority, {
    /** Model destination release only; this does not replace current user consent. */
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
    /** Each fixture issuance is an explicit request opt-in. */ (issuer) => issuer.issue(true)
);

/** Collect the final minimized public channel after the same final release check a transport must perform. */
const collector = (before: Effect.Effect<void> = Effect.void) => {
    const writes: Array<{ readonly record: TelemetryRecord; readonly correlation: TelemetryCorrelation }> = [];
    const layer = Layer.succeed(CorrelationProvider, {
        /** Simulate asynchronous preparation; only a fresh dispatch check permits the local write. */
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

/** Compose the ordinary minimizer with a request-scoped correlation lease and fixture-only output. */
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
    it.effect(
        'sends only the current pseudonymous pair over a real loopback OTLP socket and rejects late dispatch',
        /** Use actual HTTP rather than a fetch mock to prove the serialized release boundary. */ () =>
            Effect.scoped(
                Effect.gen(
                    /** Own the disposable loopback collector and inspect every byte received by it. */ function* () {
                        const writes: Array<{ readonly body: string; readonly headers: string }> = [];
                        const server = yield* Effect.acquireRelease(
                            Effect.promise(
                                /** Bind only an ephemeral loopback port; no external destination is contacted. */ () =>
                                    new Promise<ReturnType<typeof createServer>>(
                                        /** Resolve only once the collector can accept a real socket. */ (resolve) => {
                                            const collector = createServer(
                                                /** Acknowledge only after retaining the complete synthetic request. */ (
                                                    request,
                                                    response
                                                ) => {
                                                    const chunks: Buffer[] = [];
                                                    request.on(
                                                        'data',
                                                        /** Fixture payloads are bounded by the production serializer. */ (
                                                            chunk: Buffer
                                                        ) => chunks.push(chunk)
                                                    );
                                                    request.on(
                                                        'end',
                                                        /** Retain wire output, not serializer arguments. */ () => {
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
                                                /** Listening is the fixture's sole readiness signal. */ () =>
                                                    resolve(collector)
                                            );
                                        }
                                    )
                            ),
                            /** Release fixture sockets even when an assertion fails. */ (server) =>
                                Effect.promise(
                                    /** Close idle keep-alive sockets as part of fixture ownership. */ () =>
                                        new Promise<void>(
                                            /** Await the Node server's completion callback. */ (resolve) => {
                                                server.close(
                                                    /** No request survives the scoped test. */ () => resolve()
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
        /** Fixed expected values were calculated with Python hmac/hashlib, not the implementation formatter. */ () =>
            Effect.gen(
                /** Compare fixture issuance with an independently computed wire token. */ function* () {
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
        /** Asymmetric fixture identities distinguish a session hash from a person hash and delimiter concatenation. */ () =>
            Effect.gen(
                /** Domain changes must alter only their intended linkage dimensions. */ function* () {
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
        /** A permissive consent fixture must never waive the hard host floor. */ () =>
            Effect.gen(
                /** Exercise the deployment floor independently of consent policy. */ function* () {
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
        /** Negative controls use valid pseudonym syntax so rejection cannot hide behind malformed inputs. */ () =>
            Effect.gen(
                /** Fail closed on unavailable fixture authority rather than selecting a fallback. */ function* () {
                    expect(Exit.isFailure(yield* issue.pipe(Effect.provide(CorrelationDeny), Effect.exit))).toBe(true);
                    for (const layer of [
                        fixtureCorrelationLayer(binding, identity, keys, Effect.succeed(0)),
                        fixtureCorrelationLayer(binding, { ...identity, expiresAt: 1 }, keys, consent),
                        fixtureCorrelationLayer(
                            binding,
                            identity,
                            {
                                /** No fallback on unavailable key. */
                                get: () => new TelemetrySinkFailure({ reason: 'unavailable' }),
                            },
                            consent
                        ),
                        fixtureCorrelationLayer(
                            binding,
                            identity,
                            {
                                /** Reject wrong-size material rather than stretching it. */
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
                        /** A session's previous opt-in is not inherited by this request. */ (issuer) =>
                            issuer.issue(false)
                    ).pipe(Effect.provide(fixture), Effect.exit);
                    expect(Exit.isFailure(denied)).toBe(true);
                }
            ).pipe(Effect.withConfigProvider(environment))
    );

    it.effect(
        'binds tokens to the exact caller, session, binding and current consent',
        /** Test substitution, replay and shortened consent through the authority's public interface. */ () =>
            Effect.gen(
                /** Current consent changes remain visible inside an already-issued request lease. */ function* () {
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
                                        /** Keep the other principal's authority live so denial proves substitution, not scope closure. */ (
                                            other
                                        ) => other.authorize(binding, token)
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
        /** Revoke or rotate during key access; an earlier grant or epoch cannot authorize completed derivation. */ () =>
            Effect.gen(
                /** Suspend preparation at a real Effect barrier before revoking its policy. */ function* () {
                    for (const race of ['consent', 'epoch'] as const) {
                        const started = yield* Deferred.make<void>();
                        const resume = yield* Deferred.make<void>();
                        const grant = yield* Ref.make(10 * hour);
                        const delayed: FixtureCorrelationKeys = {
                            /** Model an asynchronous server-only key handle. */
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
        /** Generic record attributes remain stripped; only the separate pair channel can carry correlation. */ () =>
            Effect.gen(
                /** Verify secret canaries in observable output, not private helper calls. */ function* () {
                    const token = yield* issue;
                    const output = collector();
                    const use = Effect.flatMap(
                        TelemetrySink,
                        /** A scoped caller cannot bypass the minimizer. */ (sink) => sink.write(record)
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
        /** The transport's final check detects changes after worker admission. */ () =>
            Effect.gen(
                /** Revoke between worker authorization and transport dispatch. */ function* () {
                    const grant = yield* Ref.make(10 * hour);
                    const live = fixtureCorrelationLayer(binding, identity, keys, Ref.get(grant));
                    yield* Effect.gen(
                        /** Hold a valid issuer while invalidating its current consent. */ function* () {
                            const token = yield* issue;
                            const output = collector(Ref.set(grant, 0));
                            yield* Effect.gen(
                                /** A barrier must not replay the denied write under a stale grant. */ function* () {
                                    const sink = yield* TelemetrySink;
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
        /** Advancing Clock, not request reads, triggers issuance; each boundary resets linkage only. */ () =>
            Effect.gen(
                /** Background issuance must advance without any request-triggered refresh. */ function* () {
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
        /** A user action executes exactly once; its old dispatch fails closed while the next request uses the new epoch. */ () =>
            Effect.gen(
                /** Model an admitted business request suspended over the exact UTC boundary. */ function* () {
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
                            yield* Deferred.succeed(prepared, undefined);
                            yield* Deferred.await(continueRequest);
                            yield* Ref.update(
                                count,
                                /** Business work is independent of optional telemetry. */ (n) => n + 1
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
                        /** The next request uses only the new pair. */ (sink) => sink.write(record)
                    ).pipe(Effect.provide(sinkLayer(fresh, output.layer)));
                    expect(output.writes[0]?.correlation).toEqual(fresh);
                }
            ).pipe(Effect.provide(fixture), Effect.withConfigProvider(environment))
    );

    it.scoped(
        'omits linkage during an issuer outage and recovers automatically without a business retry',
        /** Renewal is bounded to one second; a stale token is never used during timeout/recovery. */ () =>
            Effect.gen(
                /** Cache expiry is independent of a stalled issuer and successful user work. */ function* () {
                    const down = yield* Ref.make(false);
                    const realIssuer = yield* CorrelationIssuer;
                    const session = yield* correlationSession.pipe(
                        Effect.provideService(CorrelationIssuer, {
                            /** Simulate a slow issuer only, not failing or retrying application requests. */
                            issue: (optIn) =>
                                Ref.get(down).pipe(
                                    Effect.flatMap(
                                        /** A stalled optional issuer must not stall business reads. */ (
                                            unavailable
                                        ) => (unavailable ? Effect.never : realIssuer.issue(optIn))
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
        /** Closing ownership revokes even retained references; token syntax is never authority. */ () =>
            Effect.gen(
                /** Scope disposal revokes retained readers without remote cleanup work. */ function* () {
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
        /** Invalid runtime inputs are rejected without leaking their identity-bearing decoder details. */ () =>
            Effect.gen(
                /** Probe public boundaries with structurally typed but semantically invalid values. */ function* () {
                    for (const layer of [
                        fixtureCorrelationLayer({ ...binding, generation: -1 }, identity, keys, consent),
                        fixtureCorrelationLayer(binding, { ...identity, subject: Redacted.make('') }, keys, consent),
                        fixtureCorrelationLayer(
                            binding,
                            identity,
                            {
                                /** A key returned for a different epoch is not a fallback. */
                                get: (scope) => keys.get({ ...scope, epoch: scope.epoch + 1 }),
                            },
                            consent
                        ),
                        fixtureCorrelationLayer(
                            binding,
                            identity,
                            {
                                /** Scope metadata must match even when key bytes have the right size. */
                                get: (scope) => keys.get({ ...scope, purpose: 'unrelated' }),
                            },
                            consent
                        ),
                    ])
                        expect(Exit.isFailure(yield* issue.pipe(Effect.provide(layer), Effect.exit))).toBe(true);
                    yield* Effect.gen(
                        /** Keep valid policy ownership while rejecting malformed presentation. */ function* () {
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
                                /** No provider is consulted for invalid request metadata. */ (sink) =>
                                    sink.write(record)
                            );
                            for (const layer of [
                                sinkLayer({ ...token, session: 'raw' }, output.layer),
                                sinkLayer(token, output.layer, true, { ...binding, generation: -1 }),
                            ]) {
                                expect(Exit.isFailure(yield* use.pipe(Effect.provide(layer), Effect.exit))).toBe(true);
                            }
                            const flags = Layer.succeed(Flags, {
                                /** Ordinary export stays enabled so this specifically tests the correlation flag. */
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
        /** Failing issuer requests must not escape into the action path or keep an old token alive. */ () =>
            Effect.gen(
                /** Background failures are contained and do not require a prompt or client retry. */ function* () {
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
        /** Distinct request-scoped pipelines never lend one caller's pair to another's queued record. */ () =>
            Effect.gen(
                /** Use real central logging/tracing rather than invoking transport helpers directly. */ function* () {
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
                    /** Retain an asymmetric request overlap while each worker observes only its own private lease. */
                    const request = (
                        token: TelemetryCorrelation,
                        output: ReturnType<typeof collector>,
                        mine: Deferred.Deferred<void>,
                        theirs: Deferred.Deferred<void>
                    ) =>
                        Effect.gen(
                            /** Log an error and close a child span before draining this request's worker. */ function* () {
                                yield* Effect.gen(
                                    /** Interleave both request fibers before diagnostic collection. */ function* () {
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
                                    /** Observable signal coverage includes the failed/error log and its span. */ (
                                        entry
                                    ) => entry.record.signal
                                )
                                .sort()
                        ).toEqual(['log', 'span']);
                        expect(
                            output.writes.every(
                                /** No request context crosses the private lease boundary. */ (entry) =>
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
