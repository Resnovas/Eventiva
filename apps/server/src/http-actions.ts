/**
 * @file apps/server/src/http-actions.ts
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
import * as HttpApiEndpoint from '@effect/platform/HttpApiEndpoint';
import * as HttpApiGroup from '@effect/platform/HttpApiGroup';
import * as HttpRouter from '@effect/platform/HttpRouter';
import * as HttpServerRequest from '@effect/platform/HttpServerRequest';
import * as HttpServerResponse from '@effect/platform/HttpServerResponse';
import * as OpenApi from '@effect/platform/OpenApi';
import type { CallerIdentity } from '@eventiva/contracts/caller';
import { Flags, type Flag } from '@eventiva/contracts/flags';
import { ActionInventory, type ActionMetadata } from '@eventiva/contracts/inventory';
import { CurrentTenant, JsonValue } from '@eventiva/contracts/storage';
import { authenticateTokenSession, type TokenPolicy } from '@eventiva/runtime/identity';
import { Effect, Option, Redacted, Schema } from 'effect';
import { ClusterActions } from './cluster-actions.ts';
import { HttpActionFailure, literalBatchPath, projectBatch } from './http-action-batch.ts';

/** Default-off transport capability, independently rechecked from each action's own live flags. */
export const httpActionsFlag: Flag = {
    key: 'http.actions.enabled',
    description: 'Allow authenticated local action HTTP and caller-filtered OpenAPI.',
    owner: 'platform',
    safeDefault: false,
};

const Envelope = Schema.Struct({
    input: JsonValue,
    idempotencyKey: Schema.String.pipe(Schema.pattern(/^[A-Za-z0-9._:-]{1,128}$/)),
});

/** Serialize public wire JSON and prevent authenticated metadata/results being cached across callers. */
const response = (value: JsonValue, status = 200) =>
    HttpServerResponse.json(value, {
        status,
        headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' },
    }).pipe(Effect.orDie);

/** Produce an HttpApi endpoint using the host's portable schemas, not a second action schema registry. */
const endpoint = (action: ActionMetadata, path: `/${string}`) =>
    HttpApiEndpoint.post(action.id, path)
        .setPayload(
            Schema.Struct({
                input: JsonValue.annotations({ jsonSchema: action.providerSchemas.anthropic.input }),
                idempotencyKey: Envelope.fields.idempotencyKey,
            })
        )
        .addSuccess(
            Schema.Struct({
                output: JsonValue.annotations({ jsonSchema: action.providerSchemas.anthropic.output }),
                receiptId: Schema.String,
            })
        )
        .annotate(OpenApi.Description, action.description)
        .annotate(OpenApi.Override, {
            security: [{ bearerAuth: [] }],
            'x-action-version': action.version,
            'x-action-permission': action.permission,
            'x-action-approval': action.approval,
            'x-action-risk': action.risk,
            responses: {
                200: {
                    description: 'Authorized durable action result.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    output: action.providerSchemas.anthropic.output,
                                    receiptId: { type: 'string' },
                                },
                                required: ['output', 'receiptId'],
                                additionalProperties: false,
                            },
                        },
                    },
                },
                400: { description: 'Invalid request.' },
                401: { description: 'Authentication required.' },
                404: { description: 'Unavailable action or transport.' },
                503: { description: 'Backend unavailable or invocation refused.' },
            },
        });

/** Decode one bounded envelope, then delegate all business validation, authorization and replay to ClusterActions. */
const invoke = (action: ActionMetadata, caller: CallerIdentity, cluster: ClusterActions['Type']) =>
    Effect.gen(
        /** No submitted caller, tenant, policy, grants or compute entity key is admitted at this boundary. */ function* () {
            const request = yield* HttpServerRequest.HttpServerRequest;
            if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers['content-type'] ?? ''))
                return yield* new HttpActionFailure({ status: 400, code: 'invalid-request' });
            const body = yield* request.text.pipe(
                HttpServerRequest.withMaxBodySize(Option.some(65536)),
                Effect.flatMap(Schema.decode(Schema.parseJson(Envelope), { onExcessProperty: 'error' })),
                Effect.mapError(
                    /** Parser details can contain raw input; expose only this fixed rejection. */ () =>
                        new HttpActionFailure({ status: 400, code: 'invalid-request' })
                )
            );
            // Canonical identity selects compute ordering; the backend independently selects and reauthorizes tenant storage.
            const result = yield* cluster
                .execute({
                    caller,
                    entityKey: caller.subject,
                    action: action.id,
                    input: body.input,
                    intent: { idempotencyKey: body.idempotencyKey },
                })
                .pipe(
                    Effect.mapError(
                        /** Never disclose action errors, stored input, audit records or backend routing diagnostics. */ () =>
                            new HttpActionFailure({ status: 503, code: 'unavailable' })
                    )
                );
            return yield* response({ output: result.output, receiptId: result.receipt.id });
        }
    );

/**
 * Local transport for a composition-root-selected tenant and exact trusted token policy.
 * Every request reauthenticates against live identity, then derives routes and OpenAPI from the same filtered inventory.
 * Sensitive actions are excluded from BOTH surfaces. No shell resolver, local executor, credential issuance or caching.
 */
export const httpActions = (policy: TokenPolicy) =>
    Effect.gen(
        /** Authenticate before discovery and build only the caller's current non-sensitive route projection. */ function* () {
            const request = yield* HttpServerRequest.HttpServerRequest;
            const authorization = request.headers.authorization;
            if (!authorization || authorization.length > 8192 || !/^Bearer [A-Za-z0-9._~-]+$/i.test(authorization))
                return yield* new HttpActionFailure({ status: 401, code: 'unauthenticated' });
            const { caller } = yield* authenticateTokenSession(Redacted.make(authorization.slice(7)), policy).pipe(
                Effect.mapError(
                    /** Token verification and SQL identity refusal are deliberately indistinguishable. */ () =>
                        new HttpActionFailure({ status: 401, code: 'unauthenticated' })
                )
            );
            const flags = yield* Flags;
            if (!(yield* flags.evaluate(httpActionsFlag)).value)
                return yield* new HttpActionFailure({ status: 404, code: 'unavailable' });
            const tenant = yield* CurrentTenant;
            const prefix = `/tenants/${tenant.id}` as const;
            if (request.url.includes('?') || request.url.length > 512)
                return yield* new HttpActionFailure({ status: 400, code: 'invalid-request' });
            const inventory = yield* ActionInventory;
            const visible = yield* inventory
                .list(caller)
                .pipe(
                    Effect.mapError(
                        /** A lost critical discovery dependency fails closed, never to a static fallback inventory. */ () =>
                            new HttpActionFailure({ status: 503, code: 'unavailable' })
                    )
                );
            const cluster = yield* ClusterActions;
            let group: HttpApiGroup.HttpApiGroup<'actions', ReturnType<typeof endpoint>, never> = HttpApiGroup.make(
                'actions'
            );
            let routes: HttpRouter.HttpRouter<HttpActionFailure> = HttpRouter.empty;
            for (const action of visible) {
                // A private action must not be discoverable via an undocumented HTTP endpoint either.
                if (action.sensitive) continue;
                const path = `${prefix}/actions/${action.id}` as const;
                group = group.add(endpoint(action, path));
                routes = HttpRouter.post(routes, path, invoke(action, caller, cluster));
            }
            const projection = yield* projectBatch(
                group,
                routes,
                prefix,
                visible,
                caller,
                cluster,
                flags,
                httpActionsFlag
            );
            const api = HttpApi.make('eventiva-local')
                .add(projection.group)
                .annotate(OpenApi.Title, 'Eventiva local actions')
                .annotate(OpenApi.Version, '1')
                .annotate(OpenApi.Override, {
                    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
                });
            const document = literalBatchPath(OpenApi.fromApi(api), prefix);
            // The document is private and refreshed like invocation, not a startup snapshot that survives revocation.
            return yield* HttpRouter.get(
                projection.routes,
                `${prefix}/openapi.json`,
                HttpServerResponse.json(document, {
                    headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' },
                })
            ).pipe(
                Effect.catchTag(
                    'RouteNotFound',
                    /** Unknown, foreign-tenant, disabled and hidden routes share one fixed response. */ () =>
                        Effect.fail(new HttpActionFailure({ status: 404, code: 'unavailable' }))
                )
            );
        }
    ).pipe(
        Effect.timeout('10 seconds'),
        Effect.catchTag(
            'HttpActionFailure',
            /** Public status and code are closed server-owned values, never error messages. */ (error) =>
                response({ error: error.code }, error.status)
        ),
        Effect.catchAllCause(
            /** Conceal defects, encoding failures and timeouts without logging credentials or submitted input. */ () =>
                response({ error: 'unavailable' }, 503)
        )
    );
