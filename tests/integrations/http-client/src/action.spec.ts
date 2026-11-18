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

describe('portable canonical HTTP action client', /** Codec tests deliberately do not claim transformed server inventory support. */ () => {
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

    it.scopedLive(
        'interrupts real Fetch IO without retrying or reporting mutation rollback',
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
                    const fiber = yield* invokeHttpAction(
                        spec,
                        { units: 7, adjustment: -2 },
                        { ...target, baseUrl: `http://127.0.0.1:${address.port}` }
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
