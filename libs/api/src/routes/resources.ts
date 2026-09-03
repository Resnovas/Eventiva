import { HttpRouter, HttpServerRequest, HttpServerResponse } from '@effect/platform';
import { Effect } from 'effect';
import { extractTenantContextFromRequest } from '../context/tenant.js';
import {
  CreateResourceSchema,
  ResourceModel,
  UpdateResourceSchema,
} from '../schemas/domain.js';
import { PaginationParamsSchema } from '../schemas/common.js';
import { NotFoundError, TenantMismatchError } from '../errors/api-errors.js';

const resourceStore = new Map<string, ResourceModel>();

const initialResource: ResourceModel = {
  id: 'res-001',
  name: 'Line Array PA Rig',
  category: 'audio',
  quantity: 4,
  status: 'available',
  tenantId: 'tenant-demo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
resourceStore.set(initialResource.id, initialResource);

export const resourceRoutes = HttpRouter.empty.pipe(
  // GET /api/v1/resources
  HttpRouter.get(
    '/api/v1/resources',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const query = yield* HttpServerRequest.schemaSearchParams(PaginationParamsSchema);

      const page = query.page ?? 1;
      const limit = query.limit ?? 20;

      const tenantResources = Array.from(resourceStore.values()).filter(
        (r) => r.tenantId === tenantCtx.tenantId
      );

      const total = tenantResources.length;
      const start = (page - 1) * limit;
      const paginated = tenantResources.slice(start, start + limit);

      return yield* HttpServerResponse.json({
        data: paginated,
        total,
        page,
        limit,
      });
    })
  ),

  // GET /api/v1/resources/:id
  HttpRouter.get(
    '/api/v1/resources/:id',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const routeCtx = yield* HttpRouter.RouteContext;
      const id = routeCtx.params['id'] ?? '';

      const resource = resourceStore.get(id);
      if (!resource) {
        return yield* Effect.fail(
          new NotFoundError({ resource: 'Resource', id, message: `Resource '${id}' not found` })
        );
      }

      if (resource.tenantId !== tenantCtx.tenantId) {
        return yield* Effect.fail(
          new TenantMismatchError({
            message: `Access denied: Resource belongs to another tenant`,
          })
        );
      }

      return yield* HttpServerResponse.json(resource);
    })
  ),

  // POST /api/v1/resources
  HttpRouter.post(
    '/api/v1/resources',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const body = yield* HttpServerRequest.schemaBodyJson(CreateResourceSchema);

      const now = new Date().toISOString();
      const newResource: ResourceModel = {
        id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: body.name,
        category: body.category,
        quantity: body.quantity,
        status: body.status ?? 'available',
        tenantId: tenantCtx.tenantId,
        createdAt: now,
        updatedAt: now,
      };

      resourceStore.set(newResource.id, newResource);
      return yield* HttpServerResponse.json(newResource, { status: 201 });
    })
  ),

  // PUT /api/v1/resources/:id
  HttpRouter.put(
    '/api/v1/resources/:id',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const routeCtx = yield* HttpRouter.RouteContext;
      const id = routeCtx.params['id'] ?? '';
      const body = yield* HttpServerRequest.schemaBodyJson(UpdateResourceSchema);

      const existing = resourceStore.get(id);
      if (!existing) {
        return yield* Effect.fail(
          new NotFoundError({ resource: 'Resource', id, message: `Resource '${id}' not found` })
        );
      }

      if (existing.tenantId !== tenantCtx.tenantId) {
        return yield* Effect.fail(
          new TenantMismatchError({
            message: `Access denied: Resource belongs to another tenant`,
          })
        );
      }

      const updated: ResourceModel = {
        ...existing,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      resourceStore.set(id, updated);
      return yield* HttpServerResponse.json(updated);
    })
  ),

  // DELETE /api/v1/resources/:id
  HttpRouter.del(
    '/api/v1/resources/:id',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const routeCtx = yield* HttpRouter.RouteContext;
      const id = routeCtx.params['id'] ?? '';

      const existing = resourceStore.get(id);
      if (!existing) {
        return yield* Effect.fail(
          new NotFoundError({ resource: 'Resource', id, message: `Resource '${id}' not found` })
        );
      }

      if (existing.tenantId !== tenantCtx.tenantId) {
        return yield* Effect.fail(
          new TenantMismatchError({
            message: `Access denied: Resource belongs to another tenant`,
          })
        );
      }

      resourceStore.delete(id);
      return yield* HttpServerResponse.json({ success: true, id });
    })
  )
);
