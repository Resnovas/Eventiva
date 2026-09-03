import { HttpRouter, HttpServerRequest, HttpServerResponse } from '@effect/platform';
import { Effect } from 'effect';
import { GDPRService } from '@eventiva/domain-gdpr';
import * as Schema from 'effect/Schema';
import { typeIdSchema } from '@eventiva/core';
import { NotFoundError } from '../errors/api-errors.js';

export const CreateErasureRequestSchema = Schema.Struct({
    subjectId: typeIdSchema('contact'),
    hardDelete: Schema.boolean,
});

export const gdprRoutes = HttpRouter.empty.pipe(
    // POST /api/v1/gdpr/:tenantId/export
    HttpRouter.post(
        '/api/v1/gdpr/:tenantId/export',
        Effect.gen(function* () {
            const routeCtx = yield* HttpRouter.RouteContext;
            const tenantId = routeCtx.params['tenantId'] ?? '';

            const gdprService = yield* GDPRService;
            const data = yield* gdprService.exportTenantData(tenantId);

            return yield* HttpServerResponse.json(data);
        })
    ),

    // POST /api/v1/gdpr/:tenantId/erase
    HttpRouter.post(
        '/api/v1/gdpr/:tenantId/erase',
        Effect.gen(function* () {
            const routeCtx = yield* HttpRouter.RouteContext;
            const tenantId = routeCtx.params['tenantId'] ?? '';
            const body = yield* HttpServerRequest.schemaBodyJson(CreateErasureRequestSchema);

            const gdprService = yield* GDPRService;
            const data = yield* gdprService.eraseTenantSubjectData(tenantId, body.subjectId, body.hardDelete);

            return yield* HttpServerResponse.json(data);
        })
    )
);
