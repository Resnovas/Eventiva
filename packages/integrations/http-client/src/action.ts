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
import * as HttpBody from '@effect/platform/HttpBody';
import * as HttpClient from '@effect/platform/HttpClient';
import * as HttpClientRequest from '@effect/platform/HttpClientRequest';
import { ActionName, type ActionSpec, type Input, type Output } from '@eventiva/contracts/action';
import { TenantId } from '@eventiva/contracts/ids';
import { JsonValue } from '@eventiva/contracts/storage';
import { type Cause, Context, Data, Effect, Redacted, Schema, Stream } from 'effect';

/** Closed public diagnostic fields; deliberately omit request, body, token and vendor cause. */
interface HttpActionClientFailureFields {
    readonly reason:
        | 'invalid-request'
        | 'credential-unavailable'
        | 'unauthenticated'
        | 'unavailable'
        | 'codec'
        | 'transport'
        | 'response-limit';
}
/** Retain the exact yieldable error constructor without leaking the vendor's open generic into native declarations. */
const HttpActionClientFailureBase: new (
    args: HttpActionClientFailureFields
) => Cause.YieldableError & HttpActionClientFailureFields & { readonly _tag: 'HttpActionClientFailure' } =
    Data.TaggedError('HttpActionClientFailure');
/**
 * Closed public failure; deliberately retains no credential, input, response body or vendor cause.
 *
 * @since 0.0.1
 * @example
 * const failure = new HttpActionClientFailure({ reason: 'unauthenticated' });
 */
export class HttpActionClientFailure extends HttpActionClientFailureBase {}

/**
 * Resolve current protected bearer proof per invocation; implementations must not cache authorization decisions.
 *
 * @since 0.0.1
 * @example
 * const credentials = Layer.succeed(HttpActionCredentials, { proof: Effect.succeed(Redacted.make(token)) });
 */
export class HttpActionCredentials extends Context.Tag('@eventiva/http-client/Credentials')<
    HttpActionCredentials,
    { readonly proof: Effect.Effect<Redacted.Redacted<string>, HttpActionClientFailure> }
>() {}

/**
 * Explicit trusted origin/tenant and required replay key; never infer authority or mint a key from request contents.
 *
 * @since 0.0.1
 * @example
 * const target: HttpActionTarget = { baseUrl: 'https://api.example.test/', tenant, idempotencyKey: 'order:42' };
 */
export interface HttpActionTarget {
    readonly baseUrl: string;
    readonly tenant: TenantId;
    readonly idempotencyKey: string;
}

const Origin = Schema.URL.pipe(
    Schema.filter(
        /**
         * Only an origin is accepted; forbid embedded credentials, token queries and insecure non-loopback transport.
         *
         * @param url - The parsed base URL.
         * @returns Whether it is a bare HTTPS origin, or a bare HTTP loopback origin.
         */
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
 * Matching domain inputs and original caller keys, preserving each canonical specification's tuple position.
 *
 * @since 0.0.1
 * @template S - The ordered action specifications.
 * @example
 * const calls: HttpActionBatchCalls<readonly [typeof draft]> = [{ input, idempotencyKey: 'draft:1' }];
 */
export type HttpActionBatchCalls<S extends readonly ActionSpec[]> = {
    readonly [K in keyof S]: { readonly input: Input<S[K]>; readonly idempotencyKey: string };
};

/**
 * Complete ordered domain results only; a failed request exposes neither a prefix nor an inferred failed index.
 *
 * @since 0.0.1
 * @template S - The ordered action specifications.
 * @example
 * const [first]: HttpActionBatchResults<readonly [typeof draft]> = yield* invokeHttpActionBatch([draft], calls, target);
 */
export type HttpActionBatchResults<S extends readonly ActionSpec[]> = {
    readonly [K in keyof S]: { readonly output: Output<S[K]>; readonly receiptId: string };
};

const JsonObject = Schema.Record({ key: Schema.String, value: JsonValue });
const DiscoveryEnvelope = Schema.Struct(
    {
        openapi: Schema.Literal('3.1.0'),
        info: Schema.Struct({ title: Schema.String, version: Schema.String }, { key: Schema.String, value: JsonValue }),
        paths: JsonObject,
        components: Schema.Struct(
            { schemas: Schema.optional(JsonObject), securitySchemes: JsonObject },
            { key: Schema.String, value: JsonValue }
        ),
    },
    { key: Schema.String, value: JsonValue }
);
// Validate without reconstructing records: assignment-based decoding can change a JSON member named __proto__.
const DiscoveryDocument = Schema.declare(Schema.is(DiscoveryEnvelope));

/**
 * Private historical JSON snapshot, not executable schemas, a complete OpenAPI validator or invocation authority.
 *
 * @since 0.0.1
 * @example
 * const document: HttpActionOpenApiDocument = yield* discoverHttpActions(target);
 */
export type HttpActionOpenApiDocument = typeof DiscoveryDocument.Type;

/**
 * Reject deep/container-heavy JSON before recursive decoding; quoted schema patterns do not count as structure.
 *
 * @param text - The response body.
 * @returns Whether it nests at most 64 containers and has at most 100,000 unquoted container and separator tokens.
 */
const discoveryStructureFits = (text: string): boolean => {
    // Scan only unquoted punctuation: parser stack depth and work must be bounded without changing schema data.
    let depth = 0;
    let tokens = 0;
    let quoted = false;
    let escaped = false;
    for (const character of text) {
        if (quoted) {
            if (escaped) escaped = false;
            else if (character === '\\') escaped = true;
            else if (character === '"') quoted = false;
            continue;
        }
        if (character === '"') quoted = true;
        else if (character === '{' || character === '[') {
            depth++;
            tokens++;
        } else if (character === '}' || character === ']') depth--;
        else if (character === ',' || character === ':') tokens++;
        if (depth > 64 || tokens > 100000) return false;
    }
    return true;
};

/** Acquire current protected proof and disable raw tenant tracing for exactly one explicit client operation. */
const protectedHttpClient = Effect.gen(
    /** Admission belongs to each caller; this shared boundary supplies neither cached authority nor retry policy. */ function* () {
        // Proof is read anew after local admission, never retained in public results, diagnostics or destinations.
        const credentials = yield* HttpActionCredentials;
        const proof = yield* credentials.proof.pipe(
            Effect.mapError(
                /**
                 * Never retain protected-store diagnostics in public failures.
                 *
                 * @returns The bounded `credential-unavailable` failure.
                 */
                () => new HttpActionClientFailure({ reason: 'credential-unavailable' })
            )
        );
        const http = yield* HttpClient.HttpClient;
        return http.pipe(
            HttpClient.mapRequest(
                /**
                 * Proof belongs only in the protected header, never a URL or body.
                 *
                 * @param request - The outgoing request.
                 * @returns The request with the bearer proof in its authorization header.
                 */
                (request) => HttpClientRequest.bearerToken(request, proof)
            ),
            HttpClient.withTracerDisabledWhen(
                /**
                 * Raw tenant URLs must not bypass governed telemetry correlation.
                 *
                 * @returns Always true, so tracing is disabled for every request.
                 */
                () => true
            ),
            HttpClient.withTracerPropagation(false)
        );
    }
);

/**
 * Fetch one current-proof tenant OpenAPI 3.1.0 snapshot, reading at most 1 MiB of actual UTF-8 body.
 * Bounds of 64 nested containers and 100000 unquoted container/separator tokens precede JSON parsing.
 * Preserve JSON schema/reference/extension values, but never fetch references, follow document servers,
 * compile schemas, cache authority or retry. Callers own this private historical result and explicit refresh.
 *
 * @since 0.0.1
 * @param target - The trusted origin and tenant.
 * @returns An Effect yielding the tenant's OpenAPI snapshot.
 * @fails {HttpActionClientFailure} With a closed reason; no body, URL or credential is retained.
 * @example
 * const document = yield* discoverHttpActions({ baseUrl: 'https://api.example.test/', tenant });
 */
export const discoverHttpActions = (
    target: Omit<HttpActionTarget, 'idempotencyKey'>
): Effect.Effect<HttpActionOpenApiDocument, HttpActionClientFailure, HttpActionCredentials | HttpClient.HttpClient> =>
    Effect.gen(
        /** Bound and detach untrusted bytes before decoding a deliberately narrow structural envelope. */ function* () {
            const route = yield* Schema.decodeUnknown(Schema.Struct({ origin: Origin, tenant: TenantId }))({
                origin: target.baseUrl,
                tenant: target.tenant,
            }).pipe(
                Effect.mapError(
                    /**
                     * Routing diagnostics can contain credential-shaped URLs.
                     *
                     * @returns The bounded `invalid-request` failure.
                     */
                    () => new HttpActionClientFailure({ reason: 'invalid-request' })
                )
            );
            const http = yield* protectedHttpClient;
            const response = yield* http.get(`${route.origin.origin}/tenants/${route.tenant}/openapi.json`).pipe(
                Effect.mapError(
                    /**
                     * A vendor failure must not retain the protected request or remote URL.
                     *
                     * @returns The bounded `transport` failure.
                     */
                    () => new HttpActionClientFailure({ reason: 'transport' })
                )
            );
            // Fixed-capacity intake ignores Content-Length; an over-limit chunk is refused before copying or reading more.
            const body = yield* response.stream.pipe(
                Stream.runFoldEffect(
                    { bytes: new Uint8Array(1048576), length: 0 },
                    /**
                     * Accumulate only admitted bytes, with linear copying and scoped stream cancellation on failure.
                     *
                     * @param state - The fixed buffer and the bytes admitted so far.
                     * @param chunk - The next body chunk.
                     * @returns An Effect yielding the updated buffer, or failing with `response-limit`.
                     */
                    (state, chunk) =>
                        Effect.gen(
                            /** The remaining-capacity comparison also avoids arithmetic overflow on hostile chunks. */ function* () {
                                // Do not append an excess chunk: downstream parsing must never see a truncated document as complete.
                                if (chunk.byteLength > state.bytes.length - state.length)
                                    return yield* new HttpActionClientFailure({ reason: 'response-limit' });
                                state.bytes.set(chunk, state.length);
                                state.length += chunk.byteLength;
                                return state;
                            }
                        )
                ),
                Effect.mapError(
                    /**
                     * Preserve only the fixed local limit reason, never stream/vendor diagnostics.
                     *
                     * @param error - The stream or limit failure.
                     * @returns The limit failure unchanged, or a bounded `transport` failure.
                     */
                    (error) =>
                        error instanceof HttpActionClientFailure
                            ? error
                            : new HttpActionClientFailure({ reason: 'transport' })
                )
            );
            const text = yield* Stream.make(body.bytes.subarray(0, body.length)).pipe(
                Stream.decodeText(),
                Stream.mkString
            );
            // Portable platform decoding can replace/truncate invalid UTF-8; round-trip equality refuses either change.
            const encoded = HttpBody.text(text).body;
            if (
                encoded.length !== body.length ||
                encoded.some(
                    /**
                     * Reference/schema strings must not change through lossy byte decoding.
                     *
                     * @param byte - One re-encoded byte.
                     * @param index - Its position in the body.
                     * @returns Whether it differs from the received byte.
                     */
                    (byte, index) => byte !== body.bytes[index]
                )
            )
                return yield* new HttpActionClientFailure({ reason: 'codec' });
            if (!discoveryStructureFits(text)) return yield* new HttpActionClientFailure({ reason: 'response-limit' });
            if (response.status !== 200) {
                // Error bodies receive the same byte/structure bounds and must match the server's closed status contract.
                const reason =
                    response.status === 400
                        ? 'invalid-request'
                        : response.status === 401
                          ? 'unauthenticated'
                          : response.status === 404 || response.status === 503
                            ? 'unavailable'
                            : undefined;
                if (reason === undefined) return yield* new HttpActionClientFailure({ reason: 'transport' });
                const error = yield* Schema.decodeUnknown(
                    Schema.parseJson(Schema.Struct({ error: Schema.Literal(reason) })),
                    { onExcessProperty: 'error' }
                )(text).pipe(
                    Effect.mapError(
                        /**
                         * A malformed refusal cannot disclose response data through parser diagnostics.
                         *
                         * @returns The bounded `codec` failure.
                         */
                        () => new HttpActionClientFailure({ reason: 'codec' })
                    )
                );
                return yield* new HttpActionClientFailure({ reason: error.error });
            }
            // Rest-record schemas retain every JSON keyword/reference/extension without asserting full OpenAPI semantics.
            return yield* Schema.decodeUnknown(Schema.parseJson(DiscoveryDocument))(text).pipe(
                Effect.mapError(
                    /**
                     * Invalid envelope/schema JSON must never retain the private document in a public error.
                     *
                     * @returns The bounded `codec` failure.
                     */
                    () => new HttpActionClientFailure({ reason: 'codec' })
                )
            );
        }
    ).pipe(
        Effect.scoped,
        Effect.catchAllDefect(
            /**
             * Contain defective credential/transport adapters without converting interruption into a value.
             *
             * @returns A failed Effect with the `transport` reason.
             */
            () => Effect.fail(new HttpActionClientFailure({ reason: 'transport' }))
        )
    );

/**
 * Prepare strict mutation codecs for one transport attempt without caching authority.
 *
 * @template A - The decoded request payload type.
 * @template I - The encoded request payload type.
 * @template B - The decoded success type.
 * @template J - The encoded success type.
 * @param origin - The trusted origin.
 * @param path - The tenant action path.
 * @param payload - The request payload schema.
 * @param success - The success response schema.
 * @returns An Effect yielding a one-attempt endpoint client with the server's closed error statuses.
 */
const requestAction = <A, I, B, J>(
    origin: string,
    path: `/${string}`,
    payload: Schema.Schema<A, I>,
    success: Schema.Schema<B, J>
) =>
    Effect.gen(
        /** Proof is acquired only after the caller has completed its local admission checks. */ function* () {
            const http = yield* protectedHttpClient;
            const api = HttpApi.make('eventiva-action-client').add(
                HttpApiGroup.make('actions').add(
                    HttpApiEndpoint.post('invoke', path)
                        .setPayload(payload)
                        .addSuccess(success.annotations({ parseOptions: { onExcessProperty: 'error' } }))
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
            // Keep retries out of the shared transport: a lost response can follow a committed mutation.
            return yield* HttpApiClient.endpoint(api, {
                group: 'actions',
                endpoint: 'invoke',
                baseUrl: origin,
                httpClient: http,
            });
        }
    );

/**
 * Send exactly one sequential, non-atomic batch of 1..10 canonical calls, with a 65536-byte UTF-8 JSON ceiling.
 * All keys/encodings/size are checked and detached before current proof is read. Failure or cancellation can
 * follow durable commits; explicitly recover with unchanged original keys/inputs, never an automatic retry.
 *
 * @since 0.0.1
 * @template S - The ordered action specifications.
 * @param specs - The canonical specifications, one per call position.
 * @param calls - The domain input and original idempotency key for each position.
 * @param target - The trusted origin and tenant.
 * @returns An Effect yielding every position's decoded output and receipt.
 * @fails {HttpActionClientFailure} With a closed reason; a failure can follow durable commits.
 * @example
 * const [first, second] = yield* invokeHttpActionBatch([draft, submit], calls, target);
 */
export const invokeHttpActionBatch = <const S extends readonly ActionSpec[]>(
    specs: S,
    calls: NoInfer<HttpActionBatchCalls<S>>,
    target: Omit<HttpActionTarget, 'idempotencyKey'>
): Effect.Effect<HttpActionBatchResults<S>, HttpActionClientFailure, HttpActionCredentials | HttpClient.HttpClient> =>
    Effect.gen(
        /** Capture all schemas and request identity before yielding to an external credential store. */ function* () {
            const route = yield* Schema.decodeUnknown(Schema.Struct({ origin: Origin, tenant: TenantId }))({
                origin: target.baseUrl,
                tenant: target.tenant,
            }).pipe(
                Effect.mapError(
                    /**
                     * Invalid URLs may contain proof-shaped text.
                     *
                     * @returns The bounded `invalid-request` failure.
                     */
                    () => new HttpActionClientFailure({ reason: 'invalid-request' })
                )
            );
            if (specs.length < 1 || specs.length > 10 || calls.length !== specs.length)
                return yield* new HttpActionClientFailure({ reason: 'invalid-request' });
            const names = yield* Schema.decodeUnknown(Schema.Array(ActionName))(
                specs.map(
                    /**
                     * Canonical names are captured, not inferred from inputs.
                     *
                     * @param spec - One action specification.
                     * @returns Its canonical name.
                     */
                    (spec) => spec.name
                )
            ).pipe(
                Effect.mapError(
                    /**
                     * Refuse malformed untrusted definitions without disclosing their contents.
                     *
                     * @returns The bounded `invalid-request` failure.
                     */
                    () => new HttpActionClientFailure({ reason: 'invalid-request' })
                )
            );
            yield* Schema.decodeUnknown(Schema.Array(Key))(
                calls.map(
                    /**
                     * Reject even a later bad key before any request can leave.
                     *
                     * @param call - One batch call.
                     * @returns Its idempotency key.
                     */
                    (call) => call.idempotencyKey
                )
            ).pipe(
                Effect.mapError(
                    /**
                     * Key rejection is a local configuration failure, not a server response.
                     *
                     * @returns The bounded `invalid-request` failure.
                     */
                    () => new HttpActionClientFailure({ reason: 'invalid-request' })
                )
            );
            const payload = Schema.Struct({
                calls: Schema.Tuple(
                    ...specs.map(
                        /**
                         * Each position has its own domain-to-wire codec; repeated specs remain valid.
                         *
                         * @param spec - The specification at this position.
                         * @returns The call codec for that position.
                         */
                        (spec) =>
                            Schema.Struct({
                                action: ActionName,
                                input: Schema.make<Input<S[number]>, Schema.Schema.Encoded<S[number]['input']>>(
                                    spec.input.ast
                                ),
                                idempotencyKey: Key,
                            })
                    )
                ),
            });
            const body = yield* Schema.encodeUnknown(Schema.parseJson(payload))({
                calls: calls.map(
                    /**
                     * Strip caller containers before serialization; the JSON round trip detaches nested input values.
                     *
                     * @param call - One batch call.
                     * @param index - Its position.
                     * @returns The wire call with its captured canonical name.
                     */
                    (call, index) => ({ action: names[index], input: call.input, idempotencyKey: call.idempotencyKey })
                ),
            }).pipe(
                Effect.mapError(
                    /**
                     * Codec diagnostics may include domain input; expose only the fixed reason.
                     *
                     * @returns The bounded `codec` failure.
                     */
                    () => new HttpActionClientFailure({ reason: 'codec' })
                )
            );
            if (HttpBody.text(body).contentLength > 65536)
                return yield* new HttpActionClientFailure({ reason: 'invalid-request' });
            const wirePayload = Schema.Struct({
                calls: Schema.Array(
                    Schema.Struct({
                        action: ActionName,
                        input: JsonValue,
                        idempotencyKey: Key,
                    })
                ),
            });
            const snapshot = yield* Schema.decodeUnknown(Schema.parseJson(wirePayload))(body).pipe(
                Effect.mapError(
                    /**
                     * Encoding must produce actual JSON values, not silently omit undefined canonical input.
                     *
                     * @returns The bounded `codec` failure.
                     */
                    () => new HttpActionClientFailure({ reason: 'codec' })
                )
            );
            // Runtime Tuple construction enforces exact length and positional codecs; the mapped type restores those same associations.
            const results = Schema.Tuple(
                ...specs.map(
                    /**
                     * Capture output ASTs now, so a retained spec array cannot change decoding during proof acquisition.
                     *
                     * @param spec - The specification at this position.
                     * @returns The result codec for that position.
                     */
                    (spec) =>
                        Schema.Struct({
                            output: Schema.make<Output<S[number]>, Schema.Schema.Encoded<S[number]['output']>>(
                                spec.output.ast
                            ),
                            receiptId: Schema.NonEmptyString,
                        })
                )
            );
            const invoke = yield* requestAction(
                route.origin.origin,
                `/tenants/${route.tenant}/actions:batch`,
                wirePayload,
                Schema.Struct({
                    results: Schema.make<
                        HttpActionBatchResults<S>,
                        {
                            readonly [K in keyof S]: {
                                readonly output: Schema.Schema.Encoded<S[K]['output']>;
                                readonly receiptId: string;
                            };
                        }
                    >(results.ast),
                })
            );
            // A failed response can follow commits; neither this request nor individual items are automatically retried.
            const response = yield* invoke({ payload: snapshot }).pipe(
                Effect.mapError(
                    /**
                     * Preserve only fixed error reasons, never response/input/proof diagnostics.
                     *
                     * @param error - The endpoint's declared error, parse error or transport error.
                     * @returns The bounded failure with the server's reason, `codec` or `transport`.
                     */
                    (error) =>
                        new HttpActionClientFailure({
                            reason:
                                'error' in error ? error.error : error._tag === 'ParseError' ? 'codec' : 'transport',
                        })
                )
            );
            return response.results;
        }
    ).pipe(
        Effect.scoped,
        Effect.catchAllDefect(
            /**
             * Preserve interruption while containing defective codecs, credentials and transports.
             *
             * @returns A failed Effect with the `transport` reason.
             */
            () => Effect.fail(new HttpActionClientFailure({ reason: 'transport' }))
        )
    );

/**
 * Invoke one canonical specification with domain input, returning decoded domain output and the invocation receipt ID.
 * Uses HttpApi codecs from the exact specification ASTs, not discovery DTOs. The server remains live authority.
 * One attempt only: interruption/transport loss may leave a durable mutation committed. Recovery is caller-directed
 * with the SAME key and input; the invocation receipt may change while the stored commit receipt remains stable.
 *
 * @since 0.0.1
 * @template S - The action specification.
 * @param spec - The canonical action specification.
 * @param input - The domain input.
 * @param target - The trusted origin, tenant and idempotency key.
 * @returns An Effect yielding the decoded output and the invocation receipt.
 * @fails {HttpActionClientFailure} With a closed reason; a failure can follow a durable commit.
 * @example
 * const { output, receiptId } = yield* invokeHttpAction(draft, input, target);
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
                    /**
                     * Routing parser diagnostics may contain credential-shaped URLs.
                     *
                     * @returns The bounded `invalid-request` failure.
                     */
                    () => new HttpActionClientFailure({ reason: 'invalid-request' })
                )
            );
            // ActionSchema deliberately exposes only the AST and preserves the exact schema type parameters.
            const inputCodec = Schema.make<Input<S>, Schema.Schema.Encoded<S['input']>>(spec.input.ast);
            const outputCodec = Schema.make<Output<S>, Schema.Schema.Encoded<S['output']>>(spec.output.ast);
            const invoke = yield* requestAction(
                route.origin.origin,
                `/tenants/${route.tenant}/actions/${route.name}`,
                Schema.Struct({ input: inputCodec, idempotencyKey: Key }),
                Schema.Struct({ output: outputCodec, receiptId: Schema.NonEmptyString })
            );
            return yield* invoke({ payload: { input, idempotencyKey: route.idempotencyKey } }).pipe(
                Effect.mapError(
                    /**
                     * A transport loss may follow a commit; sanitize diagnostics without retrying.
                     *
                     * @param error - The endpoint's declared error, parse error or transport error.
                     * @returns The bounded failure with the server's reason, `codec` or `transport`.
                     */
                    (error) =>
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
            /**
             * Defective credential/codec/vendor adapters still cannot disclose secret diagnostics; interruption is untouched.
             *
             * @returns A failed Effect with the `transport` reason.
             */
            () => Effect.fail(new HttpActionClientFailure({ reason: 'transport' }))
        )
    );
