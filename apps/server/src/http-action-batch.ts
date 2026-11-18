/**
 * @file apps/server/src/http-action-batch.ts
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

import * as HttpApiEndpoint from '@effect/platform/HttpApiEndpoint';
import type * as HttpApiGroup from '@effect/platform/HttpApiGroup';
import * as HttpRouter from '@effect/platform/HttpRouter';
import * as HttpServerRequest from '@effect/platform/HttpServerRequest';
import * as HttpServerResponse from '@effect/platform/HttpServerResponse';
import * as OpenApi from '@effect/platform/OpenApi';
import type { CallerIdentity } from '@eventiva/contracts/caller';
import type { Flags, Flag } from '@eventiva/contracts/flags';
import type { ActionMetadata } from '@eventiva/contracts/inventory';
import { JsonValue } from '@eventiva/contracts/storage';
import { Data, Effect, Option, Schema } from 'effect';
import type { ClusterActions } from './cluster-actions.ts';

/** Default-off local batching; it never enables the parent transport or grants action authority. */
export const httpActionBatchFlag: Flag = {
    key: 'http.action-batch.enabled',
    description: 'Allow bounded sequential non-atomic local action batches.',
    owner: 'platform',
    safeDefault: false,
};

/** Closed transport failure shared by single and batch routes; internal diagnostics never cross HTTP. */
export class HttpActionFailure extends Data.TaggedError('HttpActionFailure')<{
    readonly status: 400 | 401 | 404 | 503;
    readonly code: 'invalid-request' | 'unauthenticated' | 'unavailable';
}> {}

const Call = Schema.Struct({
    action: Schema.String,
    // Generic transport decoding accepts JSON; the operation override below supplies the current domain alternatives without recursive-schema references.
    input: JsonValue.annotations({ jsonSchema: { anyOf: [{}] } }),
    idempotencyKey: Schema.String.pipe(Schema.pattern(/^[A-Za-z0-9._:-]{1,128}$/)),
});
const Envelope = Schema.Struct({ calls: Schema.Array(Call).pipe(Schema.minItems(1), Schema.maxItems(10)) });

/** Project only the current non-sensitive inventory into the optional batch operation, including exact domain schemas. */
const batchEndpoint = (visible: ReadonlyArray<ActionMetadata>, path: `/${string}`) =>
    HttpApiEndpoint.post('actionBatch', path)
        .setPayload(Envelope)
        .addSuccess(
            Schema.Struct({
                results: Schema.Array(
                    Schema.Struct({
                        output: JsonValue.annotations({ jsonSchema: { anyOf: [{}] } }),
                        receiptId: Schema.String,
                    })
                ),
            })
        )
        .annotate(
            OpenApi.Description,
            'Sequential, fail-fast, non-atomic. Preserve original keys and inputs after partial failure or timeout.'
        )
        .annotate(OpenApi.Override, {
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['calls'],
                            properties: {
                                calls: {
                                    type: 'array',
                                    minItems: 1,
                                    maxItems: 10,
                                    items:
                                        visible.length === 0
                                            ? { not: {} }
                                            : {
                                                  oneOf: visible.map(
                                                      /** Discriminated alternatives contain no unauthorized action name or schema. */ (
                                                          action
                                                      ) => ({
                                                          type: 'object',
                                                          additionalProperties: false,
                                                          required: ['action', 'input', 'idempotencyKey'],
                                                          properties: {
                                                              action: { type: 'string', enum: [action.id] },
                                                              input: action.providerSchemas.anthropic.input,
                                                              idempotencyKey: {
                                                                  type: 'string',
                                                                  pattern: '^[A-Za-z0-9._:-]{1,128}$',
                                                              },
                                                          },
                                                      })
                                                  ),
                                              },
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description:
                        'Ordered results; receipts identify individual attempts, not stable replay identities.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                additionalProperties: false,
                                required: ['results'],
                                properties: {
                                    results: {
                                        type: 'array',
                                        minItems: 1,
                                        maxItems: 10,
                                        items: {
                                            type: 'object',
                                            additionalProperties: false,
                                            required: ['output', 'receiptId'],
                                            properties: {
                                                output:
                                                    visible.length === 0
                                                        ? { not: {} }
                                                        : {
                                                              anyOf: visible.map(
                                                                  /** Advertise outputs only from the same admitted projection as requests. */ (
                                                                      action
                                                                  ) => action.providerSchemas.anthropic.output
                                                              ),
                                                          },
                                                receiptId: { type: 'string' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                400: { description: 'Invalid envelope; nothing dispatched.' },
                401: { description: 'Authentication required.' },
                404: { description: 'Unavailable action or transport; nothing dispatched during preflight.' },
                503: { description: 'Invocation refused or timeout. Earlier items may have committed.' },
            },
        });

/** Preflight the entire bounded envelope and visibility, then dispatch sequentially through the unchanged durable backend. */
const invokeBatch = (
    visible: ReadonlyArray<ActionMetadata>,
    caller: CallerIdentity,
    cluster: ClusterActions['Type'],
    flags: Flags['Type'],
    transportFlag: Flag
) =>
    Effect.gen(
        /** No caller authority, tenant routing or local executor is admitted through batch input. */ function* () {
            const request = yield* HttpServerRequest.HttpServerRequest;
            if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers['content-type'] ?? ''))
                return yield* new HttpActionFailure({ status: 400, code: 'invalid-request' });
            const body = yield* request.text.pipe(
                HttpServerRequest.withMaxBodySize(Option.some(65536)),
                Effect.flatMap(Schema.decode(Schema.parseJson(Envelope), { onExcessProperty: 'error' })),
                Effect.mapError(
                    /** Decoder errors can retain submitted input; expose a fixed error only. */ () =>
                        new HttpActionFailure({ status: 400, code: 'invalid-request' })
                )
            );
            // Reject a later invisible entry before committing a valid prefix. Domain/resource validation stays with the host.
            const names = new Set(
                visible.map(
                    /** Metadata is already caller-filtered and sensitive entries removed. */ (action) => action.id
                )
            );
            if (
                body.calls.some(
                    /** Visibility is checked for every item before the first invocation. */ (call) =>
                        !names.has(call.action)
                )
            )
                return yield* new HttpActionFailure({ status: 404, code: 'unavailable' });
            const results: Array<{ output: JsonValue; receiptId: string }> = [];
            for (const call of body.calls) {
                // Revoking the batch capability also stops a previously admitted suffix. Backend gates refresh action authority independently.
                if (
                    !(yield* flags.evaluate(httpActionBatchFlag)).value ||
                    !(yield* flags.evaluate(transportFlag)).value
                )
                    return yield* new HttpActionFailure({ status: 503, code: 'unavailable' });
                const result = yield* cluster
                    .execute({
                        caller,
                        entityKey: caller.subject,
                        action: call.action,
                        input: call.input,
                        intent: { idempotencyKey: call.idempotencyKey },
                    })
                    .pipe(
                        Effect.mapError(
                            /** First failure stops the suffix without hiding that the prefix may already be durable. */ () =>
                                new HttpActionFailure({ status: 503, code: 'unavailable' })
                        )
                    );
                results.push({ output: result.output, receiptId: result.receipt.id });
            }
            return yield* HttpServerResponse.json(
                { results },
                {
                    headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' },
                }
            ).pipe(Effect.orDie);
        }
    );

/** Add the optional route and matching metadata together, leaving the original projection unchanged when the flag is off. */
export const projectBatch = <Endpoint extends HttpApiEndpoint.HttpApiEndpoint.Any>(
    group: HttpApiGroup.HttpApiGroup<'actions', Endpoint, never>,
    routes: HttpRouter.HttpRouter<HttpActionFailure>,
    prefix: `/${string}`,
    visible: ReadonlyArray<ActionMetadata>,
    caller: CallerIdentity,
    cluster: ClusterActions['Type'],
    flags: Flags['Type'],
    transportFlag: Flag
) =>
    Effect.gen(
        /** Batch admission reuses the request's authenticated context without introducing another required service. */ function* () {
            if (!(yield* flags.evaluate(httpActionBatchFlag)).value) return { group, routes };
            // Keep private schemas out of both the dispatch name set and the generated alternatives.
            const publicActions = visible.filter(
                /** Apply the same sensitive exclusion as the single-action projection. */ (action) => !action.sensitive
            );
            return {
                group: group.add(batchEndpoint(publicActions, `${prefix}/actions:batch`)),
                // find-my-way-ts requires a double colon for a literal colon, otherwise this becomes a wildcard alias.
                routes: HttpRouter.post(
                    routes,
                    `${prefix}/actions::batch`,
                    invokeBatch(publicActions, caller, cluster, flags, transportFlag)
                ),
            };
        }
    );

/** Correct only the pinned OpenAPI renderer's literal-colon batch suffix on a fresh, request-local document. */
export const literalBatchPath = (document: OpenApi.OpenAPISpec, prefix: `/${string}`) => {
    // OpenApi.fromApi rewrites every colon as a parameter; it cannot represent this literal suffix directly.
    const projected = `${prefix}/actions{batch}`;
    if (document.paths[projected]) {
        document.paths[`${prefix}/actions:batch`] = document.paths[projected];
        delete document.paths[projected];
    }
    return document;
};
