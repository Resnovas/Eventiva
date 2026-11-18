/**
 * @file tests/integrations/http-client/src/action.spec.ts
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
import * as HttpClientError from '@effect/platform/HttpClientError';
import * as HttpClientResponse from '@effect/platform/HttpClientResponse';
import { describe, expect, it } from '@effect/vitest';
import { define } from '@eventiva/contracts/action';
import { TenantId } from '@eventiva/contracts/ids';
import {
    HttpActionClientFailure,
    HttpActionCredentials,
    invokeHttpAction,
    invokeHttpActionBatch,
} from '@eventiva/integrations.http-client/action';
import { Deferred, Effect, Either, Exit, Fiber, Logger, Redacted, Ref, Schema } from 'effect';

const tenant = TenantId.make('019b0000-0000-7000-8000-000000000501');
const spec = define('fixture.typed', {
    version: 1,
    description: 'Portable codecs only; transformations are not advertised by the current server compiler.',
    input: Schema.Struct({ units: Schema.NumberFromString, adjustment: Schema.Number }),
    output: Schema.Struct({ total: Schema.NumberFromString }),
    permission: 'fixture.invoke',
    sideEffect: 'write',
    offline: 'online-only',
});
const target = { baseUrl: 'http://127.0.0.1:12345', tenant, idempotencyKey: 'chosen-by-caller:7' };
const proof = { proof: Effect.succeed(Redacted.make('PROOF_CANARY')) };
const label = define('fixture.label', {
    version: 1,
    description: 'Distinct positional codec for heterogeneous batch proof.',
    input: Schema.Struct({ label: Schema.String }),
    output: Schema.Struct({ accepted: Schema.BooleanFromString }),
    permission: 'fixture.invoke',
    sideEffect: 'write',
    offline: 'online-only',
});
const batchSpecs = [spec, label] as const;
const batchCalls = [
    { input: { units: 7, adjustment: -2 }, idempotencyKey: 'original:seven' },
    { input: { label: 'asymmetric' }, idempotencyKey: 'original:label' },
] as const;
const batchWire = [
    { output: { total: '35' }, receiptId: 'first' },
    { output: { accepted: 'true' }, receiptId: 'second' },
];

describe('portable canonical HTTP action client', /** Codec tests deliberately do not claim transformed server inventory support. */ () => {
    // Run identical socket-cancellation controls for single and batch APIs so their shared transport cannot hide a regression.
    it.effect(
        'sends one literal batch POST with original keys and heterogeneous positional codecs plus fresh proof',
        /** Distinct schemas prevent reordered outputs or identity encoding from passing by accident. */ () =>
            Effect.gen(
                /** Observe actual serialized bytes and credential reads for two explicit caller attempts. */ function* () {
                    // This transport recorder is synthetic only; production transport must never retain proof or payloads.
                    let attempts = 0;
                    let proofs = 0;
                    const http = HttpClient.make(
                        /** Inspect the single request that contains both typed actions. */ (request) => {
                            // One send must carry both original keys; accepting one request per action would break ambiguous-prefix recovery.
                            attempts++;
                            expect(request.url).toBe(`${target.baseUrl}/tenants/${tenant}/actions:batch`);
                            expect(request.method).toBe('POST');
                            expect(request.headers.authorization).toBe(`Bearer proof-${attempts}`);
                            expect(request.headers).not.toHaveProperty('traceparent');
                            expect(request.body._tag).toBe('Uint8Array');
                            if (request.body._tag === 'Uint8Array')
                                expect(JSON.parse(Buffer.from(request.body.body).toString())).toEqual({
                                    calls: [
                                        {
                                            action: spec.name,
                                            input: { units: '7', adjustment: -2 },
                                            idempotencyKey: 'original:seven',
                                        },
                                        {
                                            action: label.name,
                                            input: { label: 'asymmetric' },
                                            idempotencyKey: 'original:label',
                                        },
                                    ],
                                });
                            return Effect.succeed(
                                HttpClientResponse.fromWeb(request, Response.json({ results: batchWire }))
                            );
                        }
                    );
                    for (let invocation = 0; invocation < 2; invocation++) {
                        expect(
                            yield* invokeHttpActionBatch(batchSpecs, batchCalls, target).pipe(
                                Effect.provideService(HttpClient.HttpClient, http),
                                Effect.provideService(HttpActionCredentials, {
                                    proof: Effect.sync(
                                        /** Proof is obtained anew for each explicit request, never per item or cached. */ () =>
                                            Redacted.make(`proof-${++proofs}`)
                                    ),
                                })
                            )
                        ).toEqual([
                            { output: { total: 35 }, receiptId: 'first' },
                            { output: { accepted: true }, receiptId: 'second' },
                        ]);
                    }
                    expect(attempts).toBe(2);
                    expect(proofs).toBe(2);
                }
            )
    );

    it.effect(
        'admits 1/10 calls but refuses all local count/key/codec/UTF-8 size defects before proof or sending',
        /** Exact multibyte boundaries distinguish byte bounds from UTF-16 length and all-item preflight from prefix sends. */ () =>
            Effect.gen(
                /** Generate independently sized literal JSON, then observe no IO or proof reads on rejected inputs. */ function* () {
                    // The fixed literal JSON overhead is measured independently of the adapter's encoder.
                    let attempts = 0;
                    let proofs = 0;
                    const http = HttpClient.make(
                        /** Return one output for each sent call, keeping count controls valid. */ (request) => {
                            // Derive response cardinality from bytes received so 1/10-call positive controls test real envelopes.
                            attempts++;
                            if (request.body._tag !== 'Uint8Array') return Effect.dieMessage('expected JSON');
                            const body: { calls: unknown[] } = JSON.parse(Buffer.from(request.body.body).toString());
                            return Effect.succeed(
                                HttpClientResponse.fromWeb(
                                    request,
                                    Response.json({
                                        results: body.calls.map(
                                            /** Every control uses the label schema, so count alone varies here. */ () => ({
                                                output: { accepted: 'true' },
                                                receiptId: 'ok',
                                            })
                                        ),
                                    })
                                )
                            );
                        }
                    );
                    /** Apply identical isolated services to each public batch call. */
                    const run = <A, E>(effect: Effect.Effect<A, E, HttpClient.HttpClient | HttpActionCredentials>) =>
                        effect.pipe(
                            Effect.provideService(HttpClient.HttpClient, http),
                            Effect.provideService(HttpActionCredentials, {
                                proof: Effect.sync(
                                    /** Detect even credential reads on a locally invalid request. */ () => {
                                        proofs++;
                                        return Redacted.make('proof');
                                    }
                                ),
                            }),
                            Effect.either
                        );
                    for (const count of [0, 1, 10, 11]) {
                        const result = yield* run(
                            invokeHttpActionBatch(
                                Array.from(
                                    { length: count },
                                    /** Use repeated canonical specs without generating keys in the client. */ () =>
                                        label
                                ),
                                Array.from(
                                    { length: count },
                                    /** Every item explicitly supplies its original key. */ (_, index) => ({
                                        input: { label: 'x' },
                                        idempotencyKey: `key:${index}`,
                                    })
                                ),
                                target
                            )
                        );
                        expect(Either.isRight(result)).toBe(count === 1 || count === 10);
                    }
                    expect(attempts).toBe(2);
                    expect(proofs).toBe(2);
                    const overhead = Buffer.byteLength(
                        JSON.stringify({
                            calls: [{ action: label.name, input: { label: '' }, idempotencyKey: 'size' }],
                        })
                    );
                    for (const excess of [0, 1]) {
                        const text = '\u00e9'.repeat(30000) + 'x'.repeat(65536 - overhead - 60000 + excess);
                        const result = yield* run(
                            invokeHttpActionBatch([label], [{ input: { label: text }, idempotencyKey: 'size' }], target)
                        );
                        expect(Either.isRight(result)).toBe(excess === 0);
                    }
                    for (const key of ['', 'x'.repeat(129), 'bad/key']) {
                        expect(
                            Either.isLeft(
                                yield* run(
                                    invokeHttpActionBatch(
                                        batchSpecs,
                                        [batchCalls[0], { ...batchCalls[1], idempotencyKey: key }],
                                        target
                                    )
                                )
                            )
                        ).toBe(true);
                    }
                    const numeric = define('fixture.numeric', {
                        version: 1,
                        description: 'Finite domain input negative control.',
                        output: label.output,
                        permission: 'fixture.invoke',
                        sideEffect: 'write',
                        offline: 'online-only',
                        input: Schema.Struct({ amount: Schema.Finite }),
                    });
                    expect(
                        Either.isLeft(
                            yield* run(
                                invokeHttpActionBatch(
                                    [label, numeric],
                                    [batchCalls[1], { input: { amount: NaN }, idempotencyKey: 'bad-input' }],
                                    target
                                )
                            )
                        )
                    ).toBe(true);
                    // JSON silently omits undefined; canonical encoding must not turn it into a missing input field.
                    expect(
                        yield* run(
                            invokeHttpActionBatch(
                                [{ ...label, input: Schema.Undefined }],
                                [{ input: undefined, idempotencyKey: 'undefined-input' }],
                                target
                            )
                        )
                    ).toEqual(Either.left(new HttpActionClientFailure({ reason: 'codec' })));
                    expect(
                        Either.isLeft(
                            yield* run(invokeHttpActionBatch([label] as readonly (typeof label)[], [], target))
                        )
                    ).toBe(true);
                    expect(
                        Either.isLeft(
                            yield* run(
                                invokeHttpActionBatch([{ ...label, name: 'invalid/name' }], [batchCalls[1]], target)
                            )
                        )
                    ).toBe(true);
                    for (const baseUrl of [
                        'invalid',
                        'http://example.test',
                        'https://PROOF_CANARY@example.test',
                        'https://example.test/path',
                    ])
                        expect(
                            Either.isLeft(
                                yield* run(invokeHttpActionBatch(batchSpecs, batchCalls, { ...target, baseUrl }))
                            )
                        ).toBe(true);
                    expect(attempts).toBe(3);
                    expect(proofs).toBe(3);
                }
            )
    );

    it.effect(
        'detaches the validated request and positional schemas before protected proof suspends',
        /** A caller retaining mutable arrays or nested objects must not rewrite accepted identity or content. */ () =>
            Effect.gen(
                /** Suspend exactly at the credential boundary, mutate caller references, then inspect sent bytes. */ function* () {
                    // No immutable type assertion is relied on for runtime ownership; callers can retain mutable aliases.
                    const entered = yield* Deferred.make<void>();
                    const release = yield* Deferred.make<void>();
                    const specs = [label];
                    const retained = { input: { label: 'original' }, idempotencyKey: 'original-key' };
                    const calls = [retained];
                    const http = HttpClient.make(
                        /** Check the detached snapshot rather than merely checking the return value. */ (request) => {
                            // Read after the credential barrier: observing original bytes distinguishes detachment from readonly typing.
                            expect(request.body._tag).toBe('Uint8Array');
                            if (request.body._tag === 'Uint8Array')
                                expect(JSON.parse(Buffer.from(request.body.body).toString())).toEqual({
                                    calls: [
                                        {
                                            action: label.name,
                                            input: { label: 'original' },
                                            idempotencyKey: 'original-key',
                                        },
                                    ],
                                });
                            return Effect.succeed(
                                HttpClientResponse.fromWeb(request, Response.json({ results: [batchWire[1]] }))
                            );
                        }
                    );
                    const fiber = yield* invokeHttpActionBatch(specs, calls, target).pipe(
                        Effect.provideService(HttpClient.HttpClient, http),
                        Effect.provideService(HttpActionCredentials, {
                            proof: Deferred.succeed(entered, undefined).pipe(
                                Effect.zipRight(Deferred.await(release)),
                                Effect.as(Redacted.make('proof'))
                            ),
                        }),
                        Effect.fork
                    );
                    yield* Deferred.await(entered);
                    retained.input.label = 'changed';
                    retained.idempotencyKey = 'changed-key';
                    calls.push({ input: { label: 'extra' }, idempotencyKey: 'extra' });
                    specs.length = 0;
                    yield* Deferred.succeed(release, undefined);
                    expect(yield* Fiber.join(fiber)).toEqual([{ output: { accepted: true }, receiptId: 'second' }]);
                }
            )
    );

    it.effect(
        'rejects incomplete, reordered, extra-field and malformed batch responses with no partial result or retry',
        /** Every response failure may follow committed server work; only fixed safe diagnostics are returned. */ () =>
            Effect.gen(
                /** Distinct output codecs detect reordered values; envelope controls cover both count boundaries. */ function* () {
                    // These canaries must not survive as causes, bodies or logs on the closed public error.
                    for (const [status, body] of [
                        [200, JSON.stringify({ results: [] })],
                        [200, JSON.stringify({ results: [batchWire[0]] })],
                        [200, JSON.stringify({ results: [...batchWire, batchWire[0]] })],
                        [200, JSON.stringify({ results: [...batchWire].reverse() })],
                        [
                            200,
                            JSON.stringify({ results: [{ ...batchWire[0], secret: 'RAW_BODY_CANARY' }, batchWire[1]] }),
                        ],
                        [200, JSON.stringify({ results: batchWire, secret: 'RAW_BODY_CANARY' })],
                        [
                            200,
                            JSON.stringify({
                                results: [
                                    { output: { total: '7', secret: 'RAW_BODY_CANARY' }, receiptId: 'ok' },
                                    batchWire[1],
                                ],
                            }),
                        ],
                        [200, JSON.stringify({ results: [{ output: { total: '7' }, receiptId: '' }, batchWire[1]] })],
                        [200, '{"results":['],
                        [200, '{"results":[{"output":{"total":"RAW_BODY_CANARY"},"receiptId":"one"}]}'],
                        [400, '{"error":"invalid-request"}'],
                        [401, '{"error":"unauthenticated"}'],
                        [404, '{"error":"unavailable"}'],
                        [503, '{"error":"unavailable"}'],
                        [503, '{"error":"unavailable","details":"RAW_BODY_CANARY"}'],
                        [500, 'RAW_BODY_CANARY'],
                        [0, 'RAW_BODY_CANARY'],
                    ] as const) {
                        let attempts = 0;
                        const http = HttpClient.make(
                            /** Record actual sends even when the network result is ambiguous. */ (request) => {
                                // A connection failure is not a rejection-before-commit and must never trigger an internal retry.
                                attempts++;
                                return status === 0
                                    ? Effect.fail(
                                          new HttpClientError.RequestError({
                                              request,
                                              reason: 'Transport',
                                              cause: body,
                                          })
                                      )
                                    : Effect.succeed(
                                          HttpClientResponse.fromWeb(
                                              request,
                                              new Response(body, {
                                                  status,
                                                  headers: { 'content-type': 'application/json' },
                                              })
                                          )
                                      );
                            }
                        );
                        const failure = yield* invokeHttpActionBatch(batchSpecs, batchCalls, target).pipe(
                            Effect.provideService(HttpClient.HttpClient, http),
                            Effect.provideService(HttpActionCredentials, proof),
                            Effect.flip
                        );
                        expect(failure).toBeInstanceOf(HttpActionClientFailure);
                        expect(Object.keys(failure).sort()).toEqual(['_tag', 'reason']);
                        expect(JSON.stringify(failure)).not.toMatch(/RAW_BODY_CANARY|PROOF_CANARY/);
                        expect(attempts).toBe(1);
                    }
                    for (const unavailable of [
                        Effect.fail(new HttpActionClientFailure({ reason: 'unavailable' })),
                        Effect.dieMessage('PROOF_CANARY'),
                    ]) {
                        const failure = yield* invokeHttpActionBatch(batchSpecs, batchCalls, target).pipe(
                            Effect.provideService(HttpActionCredentials, { proof: unavailable }),
                            Effect.provide(FetchHttpClient.layer),
                            Effect.flip
                        );
                        expect(JSON.stringify(failure)).not.toContain('PROOF_CANARY');
                    }
                }
            )
    );

    it.effect(
        'encodes domain input and decodes asymmetric wire output, fetching protected proof afresh',
        /** Independent literal wire assertions catch an identity-codec implementation. */ () =>
            Effect.gen(
                /** A recording transport isolates codec correctness from the separately exercised real HTTP/SQL host. */ function* () {
                    // Literal wire expectations distinguish encoding from merely passing domain values through unchanged.
                    const calls: unknown[] = [];
                    const proofs = yield* Ref.make(0);
                    const http = HttpClient.make(
                        /** Observe only synthetic request bytes inside this test; never install such a recorder in the adapter. */ (
                            request
                        ) => {
                            // Inspect the serialized body before constructing a response, so a wrong encoder cannot hide behind decoding.
                            expect(request.body._tag).toBe('Uint8Array');
                            if (request.body._tag === 'Uint8Array')
                                calls.push(JSON.parse(Buffer.from(request.body.body).toString()));
                            expect(request.url).toBe(`${target.baseUrl}/tenants/${tenant}/actions/fixture.typed`);
                            expect(request.method).toBe('POST');
                            expect(request.headers.authorization).toBe(`Bearer PROOF_CANARY_${calls.length}`);
                            expect(request.headers).not.toHaveProperty('traceparent');
                            return Effect.succeed(
                                HttpClientResponse.fromWeb(
                                    request,
                                    Response.json({ output: { total: '35' }, receiptId: `invocation-${calls.length}` })
                                )
                            );
                        }
                    );
                    const credentials = {
                        proof: Ref.updateAndGet(
                            proofs,
                            /** Detect accidental credential caching across invocations. */ (count) => count + 1
                        ).pipe(
                            Effect.map(
                                /** Only the header adapter may unwrap this synthetic proof. */ (count) =>
                                    Redacted.make(`PROOF_CANARY_${count}`)
                            )
                        ),
                    };
                    for (let invocation = 1; invocation <= 2; invocation++) {
                        expect(
                            yield* invokeHttpAction(spec, { units: 7, adjustment: -2 }, target).pipe(
                                Effect.provideService(HttpClient.HttpClient, http),
                                Effect.provideService(HttpActionCredentials, credentials)
                            )
                        ).toEqual({ output: { total: 35 }, receiptId: `invocation-${invocation}` });
                    }
                    expect(calls).toEqual([
                        { input: { units: '7', adjustment: -2 }, idempotencyKey: 'chosen-by-caller:7' },
                        { input: { units: '7', adjustment: -2 }, idempotencyKey: 'chosen-by-caller:7' },
                    ]);
                }
            )
    );

    it.effect(
        'fails closed with sanitized typed errors and never retries a mutation',
        /** Malformed successes, error envelopes and transport faults must not masquerade as domain output. */ () =>
            Effect.gen(
                /** Exercise both sides of each codec boundary, including a successful status carrying an invalid body. */ function* () {
                    // Adversarial bodies carry a canary to detect accidental retention in structured failures or logs.
                    const logs: string[] = [];
                    const logger = Logger.make(
                        /** Capture only this test's logs to reject secret/raw-body diagnostics. */ (options) =>
                            logs.push(JSON.stringify(options))
                    );
                    for (const [status, body] of [
                        [200, '{"output":{"total":"RAW_BODY_CANARY"},"receiptId":"one"}'],
                        [200, '{"output":{"total":"35"}}'],
                        [200, '{"output":{"total":"35"},"receiptId":""}'],
                        [200, '{"output":{"total":"35"},"receiptId":"one","secret":"RAW_BODY_CANARY"}'],
                        [200, 'RAW_BODY_CANARY'],
                        [200, '{"error":"unavailable"}'],
                        [400, '{"error":"invalid-request"}'],
                        [401, '{"error":"unauthenticated"}'],
                        [404, '{"error":"unavailable"}'],
                        [503, '{"error":"unavailable"}'],
                        [401, '{"error":"RAW_BODY_CANARY"}'],
                        [503, '{"error":"unavailable","details":"RAW_BODY_CANARY"}'],
                        [500, 'RAW_BODY_CANARY'],
                        [0, 'transport'],
                    ] as const) {
                        let attempts = 0;
                        const http = HttpClient.make(
                            /** Even a network error may occur after a committed mutation; count actual sends. */ (
                                request
                            ) => {
                                // The zero-status branch represents an ambiguous network loss, not a safe-to-retry rejection.
                                attempts++;
                                return status === 0
                                    ? Effect.fail(
                                          new HttpClientError.RequestError({
                                              request,
                                              reason: 'Transport',
                                              cause: 'RAW_BODY_CANARY',
                                          })
                                      )
                                    : Effect.succeed(
                                          HttpClientResponse.fromWeb(
                                              request,
                                              new Response(body, {
                                                  status,
                                                  headers: { 'content-type': 'application/json' },
                                              })
                                          )
                                      );
                            }
                        );
                        const result = yield* invokeHttpAction(spec, { units: 7, adjustment: -2 }, target).pipe(
                            Effect.provideService(HttpClient.HttpClient, http),
                            Effect.provideService(HttpActionCredentials, proof),
                            Effect.provide(Logger.replace(Logger.defaultLogger, logger)),
                            Effect.either
                        );
                        expect(attempts).toBe(1);
                        expect(Either.isLeft(result)).toBe(true);
                        if (Either.isLeft(result)) {
                            expect(result.left).toBeInstanceOf(HttpActionClientFailure);
                            expect(Object.keys(result.left).sort()).toEqual(['_tag', 'reason']);
                            expect(`${result.left}${JSON.stringify(result.left)}`).not.toMatch(
                                /PROOF_CANARY|RAW_BODY_CANARY/
                            );
                            if (status === 400) expect(result.left.reason).toBe('invalid-request');
                            if (status === 401 && body === '{"error":"unauthenticated"}')
                                expect(result.left.reason).toBe('unauthenticated');
                            if (status === 404 || (status === 503 && body === '{"error":"unavailable"}'))
                                expect(result.left.reason).toBe('unavailable');
                        }
                    }
                    expect(logs.join('')).not.toMatch(/PROOF_CANARY|RAW_BODY_CANARY/);
                }
            )
    );

    it.effect(
        'refuses bad routing/keys before IO and contains credential-store defects',
        /** Invalid configuration must not send proof or retain its diagnostic URL. */ () =>
            Effect.gen(
                /** Invalid targets exercise URL parse failure, insecure destinations and all excluded URL components. */ function* () {
                    // A proof-bearing URL is invalid even on HTTPS; validation must happen before the first send.
                    let attempts = 0;
                    const http = HttpClient.make(
                        /** No invalid request is permitted to reach the transport. */ () => {
                            attempts++;
                            return Effect.dieMessage('UNEXPECTED_IO');
                        }
                    );
                    for (const baseUrl of [
                        'invalid',
                        'http://example.test',
                        'https://PROOF_CANARY@example.test',
                        'https://example.test/path',
                        'https://example.test?proof=PROOF_CANARY',
                        'https://example.test#PROOF_CANARY',
                    ]) {
                        const result = yield* invokeHttpAction(
                            spec,
                            { units: 7, adjustment: -2 },
                            { ...target, baseUrl }
                        ).pipe(
                            Effect.provideService(HttpClient.HttpClient, http),
                            Effect.provideService(HttpActionCredentials, proof),
                            Effect.flip
                        );
                        expect(result.reason).toBe('invalid-request');
                        expect(JSON.stringify(result)).not.toContain('PROOF_CANARY');
                    }
                    for (const idempotencyKey of ['', 'a'.repeat(129), 'invalid/key']) {
                        expect(
                            (yield* invokeHttpAction(
                                spec,
                                { units: 7, adjustment: -2 },
                                { ...target, idempotencyKey }
                            ).pipe(
                                Effect.provideService(HttpClient.HttpClient, http),
                                Effect.provideService(HttpActionCredentials, proof),
                                Effect.flip
                            )).reason
                        ).toBe('invalid-request');
                    }
                    for (const unavailable of [
                        Effect.fail(new HttpActionClientFailure({ reason: 'unavailable' })),
                        Effect.dieMessage('PROOF_CANARY'),
                    ]) {
                        const result = yield* invokeHttpAction(spec, { units: 7, adjustment: -2 }, target).pipe(
                            Effect.provideService(HttpClient.HttpClient, http),
                            Effect.provideService(HttpActionCredentials, { proof: unavailable }),
                            Effect.flip
                        );
                        expect(result).toBeInstanceOf(HttpActionClientFailure);
                        expect(JSON.stringify(result)).not.toContain('PROOF_CANARY');
                    }
                    expect(attempts).toBe(0);
                }
            )
    );

    for (const batch of [false, true])
        it.scopedLive(
            `interrupts real Fetch ${batch ? 'batch' : 'single'} IO without retrying or reporting mutation rollback`,
            /** A held loopback response makes cancellation observable at the actual socket, not a mock effect. */ () =>
                Effect.gen(
                    /** Wait for the complete POST to arrive, then interrupt while the server deliberately withholds its response. */ function* () {
                        // Separate arrival and disconnect barriers prevent an early cancellation from producing a false positive.
                        const received = yield* Deferred.make<void>();
                        const disconnected = yield* Deferred.make<void>();
                        let attempts = 0;
                        const server = createServer(
                            /** A complete accepted request can outlive its client; cancellation is not rollback. */ (
                                request,
                                response
                            ) => {
                                // Consume the request fully, but deliberately never send headers or a response body.
                                attempts++;
                                request.resume();
                                request.once(
                                    'end',
                                    /** Signal that bytes reached the server before cancellation. */ () =>
                                        Effect.runSync(Deferred.succeed(received, undefined))
                                );
                                response.once(
                                    'close',
                                    /** An aborted fetch must close the outstanding response stream. */ () =>
                                        Effect.runSync(Deferred.succeed(disconnected, undefined))
                                );
                            }
                        );
                        yield* Effect.acquireRelease(
                            Effect.tryPromise(
                                /** Bind a disposable loopback-only listener with an ephemeral port. */ () =>
                                    new Promise<void>(
                                        /** Resolve only once the listener is accepting connections. */ (resolve) =>
                                            server.listen(0, '127.0.0.1', resolve)
                                    )
                            ),
                            /** Close even a failed test's held response and listener. */ () =>
                                Effect.sync(
                                    /** No public listener or persistent service survives this fixture. */ () => {
                                        // close() alone would retain the intentionally held connection after an assertion failure.
                                        server.closeAllConnections();
                                        server.close();
                                    }
                                )
                        );
                        const address = server.address();
                        if (!address || typeof address === 'string')
                            return yield* Effect.dieMessage('missing loopback address');
                        const destination = { ...target, baseUrl: `http://127.0.0.1:${address.port}` };
                        const fiber = yield* (
                            batch
                                ? invokeHttpActionBatch(batchSpecs, batchCalls, destination).pipe(Effect.asVoid)
                                : invokeHttpAction(spec, { units: 7, adjustment: -2 }, destination).pipe(Effect.asVoid)
                        ).pipe(
                            Effect.provide(FetchHttpClient.layer),
                            Effect.provideService(HttpActionCredentials, proof),
                            Effect.fork
                        );
                        yield* Deferred.await(received).pipe(Effect.timeout('3 seconds'));
                        expect(Exit.isInterrupted(yield* Fiber.interrupt(fiber))).toBe(true);
                        yield* Deferred.await(disconnected).pipe(Effect.timeout('3 seconds'));
                        expect(attempts).toBe(1);
                    }
                ),
            10000
        );
});
