/**
 * @file packages/integrations/http-client/src/action.ts
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

import * as HttpApi from '@effect/platform/HttpApi';
import * as HttpApiClient from '@effect/platform/HttpApiClient';
import * as HttpApiEndpoint from '@effect/platform/HttpApiEndpoint';
import * as HttpApiGroup from '@effect/platform/HttpApiGroup';
import * as HttpApiSchema from '@effect/platform/HttpApiSchema';
import * as HttpClient from '@effect/platform/HttpClient';
import * as HttpClientRequest from '@effect/platform/HttpClientRequest';
import { ActionName, type ActionSpec, type Input, type Output } from '@eventiva/contracts/action';
import { TenantId } from '@eventiva/contracts/ids';
import { type Cause, Context, Data, Effect, Redacted, Schema } from 'effect';

/** Closed public diagnostic fields; deliberately omit request, body, token and vendor cause. */
interface HttpActionClientFailureFields {
    readonly reason:
        'invalid-request' | 'credential-unavailable' | 'unauthenticated' | 'unavailable' | 'codec' | 'transport';
}
/** Retain the exact yieldable error constructor without leaking the vendor's open generic into native declarations. */
const HttpActionClientFailureBase: new (
    args: HttpActionClientFailureFields
) => Cause.YieldableError & HttpActionClientFailureFields & { readonly _tag: 'HttpActionClientFailure' } =
    Data.TaggedError('HttpActionClientFailure');
/** Closed public failure; deliberately retains no credential, input, response body or vendor cause. */
export class HttpActionClientFailure extends HttpActionClientFailureBase {}

/** Resolve current protected bearer proof per invocation; implementations must not cache authorization decisions. */
export class HttpActionCredentials extends Context.Tag('@eventiva/http-client/Credentials')<
    HttpActionCredentials,
    { readonly proof: Effect.Effect<Redacted.Redacted<string>, HttpActionClientFailure> }
>() {}

/** Explicit trusted origin/tenant and required replay key; never infer authority or mint a key from request contents. */
export interface HttpActionTarget {
    readonly baseUrl: string;
    readonly tenant: TenantId;
    readonly idempotencyKey: string;
}

const Origin = Schema.URL.pipe(
    Schema.filter(
        /** Only an origin is accepted; forbid embedded credentials, token queries and insecure non-loopback transport. */
        (url) =>
            (url.protocol === 'https:' ||
                (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) &&
            url.username === '' &&
            url.password === '' &&
            url.search === '' &&
            url.hash === '' &&
            url.pathname === '/'
    )
);
const Key = Schema.String.pipe(Schema.pattern(/^[A-Za-z0-9._:-]{1,128}$/));

/**
 * Invoke one canonical specification with domain input, returning decoded domain output and the invocation receipt ID.
 * Uses HttpApi codecs from the exact specification ASTs, not discovery DTOs. The server remains live authority.
 * One attempt only: interruption/transport loss may leave a durable mutation committed. Recovery is caller-directed
 * with the SAME key and input; the invocation receipt may change while the stored commit receipt remains stable.
 */
export const invokeHttpAction = <S extends ActionSpec>(
    spec: S,
    input: NoInfer<Input<S>>,
    target: HttpActionTarget
): Effect.Effect<
    { readonly output: Output<S>; readonly receiptId: string },
    HttpActionClientFailure,
    HttpActionCredentials | HttpClient.HttpClient
> =>
    Effect.gen(
        /** Validate routing before retrieving proof, then leave canonical domain encoding/decoding to HttpApi. */
        function* () {
            const route = yield* Schema.decodeUnknown(
                Schema.Struct({
                    origin: Origin,
                    tenant: TenantId,
                    name: ActionName,
                    idempotencyKey: Key,
                })
            )({
                origin: target.baseUrl,
                tenant: target.tenant,
                name: spec.name,
                idempotencyKey: target.idempotencyKey,
            }).pipe(
                Effect.mapError(
                    /** Routing parser diagnostics may contain credential-shaped URLs. */ () =>
                        new HttpActionClientFailure({ reason: 'invalid-request' })
                )
            );
            const credentials = yield* HttpActionCredentials;
            const proof = yield* credentials.proof.pipe(
                Effect.mapError(
                    /** Never propagate credential-store diagnostics or stale authorization decisions. */ () =>
                        new HttpActionClientFailure({ reason: 'credential-unavailable' })
                )
            );
            // ActionSchema deliberately exposes only the AST and preserves the exact schema type parameters.
            const inputCodec = Schema.make<Input<S>, Schema.Schema.Encoded<S['input']>>(spec.input.ast);
            const outputCodec = Schema.make<Output<S>, Schema.Schema.Encoded<S['output']>>(spec.output.ast);
            const api = HttpApi.make('eventiva-action-client').add(
                HttpApiGroup.make('actions').add(
                    HttpApiEndpoint.post('invoke', `/tenants/${route.tenant}/actions/${route.name}`)
                        .setPayload(Schema.Struct({ input: inputCodec, idempotencyKey: Key }))
                        .addSuccess(
                            Schema.Struct({
                                output: outputCodec,
                                receiptId: Schema.String.pipe(Schema.minLength(1)),
                            }).annotations({ parseOptions: { onExcessProperty: 'error' } })
                        )
                        .addError(
                            Schema.Struct({ error: Schema.Literal('invalid-request') }).annotations({
                                ...HttpApiSchema.annotations({ status: 400 }),
                                parseOptions: { onExcessProperty: 'error' },
                            })
                        )
                        .addError(
                            Schema.Struct({ error: Schema.Literal('unauthenticated') }).annotations({
                                ...HttpApiSchema.annotations({ status: 401 }),
                                parseOptions: { onExcessProperty: 'error' },
                            })
                        )
                        .addError(
                            Schema.Struct({ error: Schema.Literal('unavailable') }).annotations({
                                ...HttpApiSchema.annotations({ status: 404 }),
                                parseOptions: { onExcessProperty: 'error' },
                            })
                        )
                        .addError(
                            Schema.Struct({ error: Schema.Literal('unavailable') }).annotations({
                                ...HttpApiSchema.annotations({ status: 503 }),
                                parseOptions: { onExcessProperty: 'error' },
                            })
                        )
                )
            );
            const http = yield* HttpClient.HttpClient;
            const invoke = yield* HttpApiClient.endpoint(api, {
                group: 'actions',
                endpoint: 'invoke',
                baseUrl: route.origin.origin,
                httpClient: http.pipe(
                    HttpClient.mapRequest(
                        /** Keep proof out of URLs and request bodies. */ (request) =>
                            HttpClientRequest.bearerToken(request, proof)
                    ),
                    HttpClient.withTracerDisabledWhen(
                        /** Raw tenant/action URLs must not bypass the governed telemetry correlation pipeline. */ () =>
                            true
                    ),
                    HttpClient.withTracerPropagation(false)
                ),
            });
            // Do not wrap this in retry: a failed response is not evidence that a mutation did not commit.
            return yield* invoke({ payload: { input, idempotencyKey: route.idempotencyKey } }).pipe(
                Effect.mapError(
                    /** Replace codec and transport errors rather than retaining their potentially sensitive causes. */ (
                        error
                    ) =>
                        new HttpActionClientFailure({
                            reason:
                                'error' in error ? error.error : error._tag === 'ParseError' ? 'codec' : 'transport',
                        })
                )
            );
        }
    ).pipe(
        Effect.scoped,
        Effect.catchAllDefect(
            /** Defective credential/codec/vendor adapters still cannot disclose secret diagnostics; interruption is untouched. */ () =>
                Effect.fail(new HttpActionClientFailure({ reason: 'transport' }))
        )
    );
