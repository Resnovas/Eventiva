import { HttpRouter, HttpServerRequest, HttpServerResponse } from '@effect/platform';
import { Effect } from 'effect';
import {
  CreateTenantSchema,
  TenantModel,
  UpdateTenantSchema,
} from '../schemas/domain.js';
import { PaginationParamsSchema } from '../schemas/common.js';
import { NotFoundError } from '../errors/api-errors.js';

const tenantsStore = new Map<string, TenantModel>();

const initialTenant: TenantModel = {
  id: 'tenant-demo',
  name: 'Demo Production Corp',
  slug: 'demo-corp',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
tenantsStore.set(initialTenant.id, initialTenant);

export const tenantRoutes = HttpRouter.empty.pipe(
  // GET /api/v1/tenants
  HttpRouter.get(
    '/api/v1/tenants',
    Effect.gen(function* () {
      const query = yield* HttpServerRequest.schemaSearchParams(PaginationParamsSchema);
      const page = query.page ?? 1;
      const limit = query.limit ?? 20;

      const allTenants = Array.from(tenantsStore.values());
      const total = allTenants.length;
      const start = (page - 1) * limit;
      const paginated = allTenants.slice(start, start + limit);

      return yield* HttpServerResponse.json({
        data: paginated,
        total,
        page,
        limit,
      });
    })
  ),

  // GET /api/v1/tenants/:id
  HttpRouter.get(
    '/api/v1/tenants/:id',
    Effect.gen(function* () {
      const routeCtx = yield* HttpRouter.RouteContext;
      const id = routeCtx.params['id'] ?? '';

      const tenant = tenantsStore.get(id);
      if (!tenant) {
        return yield* Effect.fail(
          new NotFoundError({ resource: 'Tenant', id, message: `Tenant '${id}' not found` })
        );
      }

      return yield* HttpServerResponse.json(tenant);
    })
  ),

  // POST /api/v1/tenants
  HttpRouter.post(
    '/api/v1/tenants',
    Effect.gen(function* () {
      const body = yield* HttpServerRequest.schemaBodyJson(CreateTenantSchema);

      const now = new Date().toISOString();
      const newTenant: TenantModel = {
        id: `tenant-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: body.name,
        slug: body.slug,
        status: body.status ?? 'active',
        createdAt: now,
        updatedAt: now,
      };

      tenantsStore.set(newTenant.id, newTenant);
      return yield* HttpServerResponse.json(newTenant, { status: 201 });
    })
  ),

  // PUT /api/v1/tenants/:id
  HttpRouter.put(
    '/api/v1/tenants/:id',
    Effect.gen(function* () {
      const routeCtx = yield* HttpRouter.RouteContext;
      const id = routeCtx.params['id'] ?? '';
      const body = yield* HttpServerRequest.schemaBodyJson(UpdateTenantSchema);

      const existing = tenantsStore.get(id);
      if (!existing) {
        return yield* Effect.fail(
          new NotFoundError({ resource: 'Tenant', id, message: `Tenant '${id}' not found` })
        );
      }

      const updated: TenantModel = {
        ...existing,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      tenantsStore.set(id, updated);
      return yield* HttpServerResponse.json(updated);
    })
  )
);
