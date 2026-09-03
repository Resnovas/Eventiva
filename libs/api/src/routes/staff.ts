import { HttpRouter, HttpServerRequest, HttpServerResponse } from '@effect/platform';
import { Effect } from 'effect';
import { extractTenantContextFromRequest } from '../context/tenant.js';
import {
  CreateStaffSchema,
  StaffModel,
  UpdateStaffSchema,
} from '../schemas/domain.js';
import { PaginationParamsSchema } from '../schemas/common.js';
import { NotFoundError, TenantMismatchError } from '../errors/api-errors.js';

const staffStore = new Map<string, StaffModel>();

const initialStaff: StaffModel = {
  id: 'stf-001',
  email: 'admin@eventiva.co.uk',
  name: 'Lead Technical Director',
  role: 'admin',
  tenantId: 'tenant-demo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
staffStore.set(initialStaff.id, initialStaff);

export const staffRoutes = HttpRouter.empty.pipe(
  // GET /api/v1/staff - List staff (tenant-isolated)
  HttpRouter.get(
    '/api/v1/staff',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const query = yield* HttpServerRequest.schemaSearchParams(PaginationParamsSchema);

      const page = query.page ?? 1;
      const limit = query.limit ?? 20;

      const tenantStaff = Array.from(staffStore.values()).filter(
        (s) => s.tenantId === tenantCtx.tenantId
      );

      const total = tenantStaff.length;
      const start = (page - 1) * limit;
      const paginated = tenantStaff.slice(start, start + limit);

      return yield* HttpServerResponse.json({
        data: paginated,
        total,
        page,
        limit,
      });
    })
  ),

  // GET /api/v1/staff/:id
  HttpRouter.get(
    '/api/v1/staff/:id',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const routeCtx = yield* HttpRouter.RouteContext;
      const id = routeCtx.params['id'] ?? '';

      const staff = staffStore.get(id);
      if (!staff) {
        return yield* Effect.fail(
          new NotFoundError({ resource: 'Staff', id, message: `Staff member '${id}' not found` })
        );
      }

      if (staff.tenantId !== tenantCtx.tenantId) {
        return yield* Effect.fail(
          new TenantMismatchError({
            message: `Access denied: Staff member belongs to another tenant`,
          })
        );
      }

      return yield* HttpServerResponse.json(staff);
    })
  ),

  // POST /api/v1/staff
  HttpRouter.post(
    '/api/v1/staff',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const body = yield* HttpServerRequest.schemaBodyJson(CreateStaffSchema);

      const now = new Date().toISOString();
      const newStaff: StaffModel = {
        id: `stf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        email: body.email,
        name: body.name,
        role: body.role ?? 'crew',
        tenantId: tenantCtx.tenantId,
        createdAt: now,
        updatedAt: now,
      };

      staffStore.set(newStaff.id, newStaff);
      return yield* HttpServerResponse.json(newStaff, { status: 201 });
    })
  ),

  // PUT /api/v1/staff/:id
  HttpRouter.put(
    '/api/v1/staff/:id',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const routeCtx = yield* HttpRouter.RouteContext;
      const id = routeCtx.params['id'] ?? '';
      const body = yield* HttpServerRequest.schemaBodyJson(UpdateStaffSchema);

      const existing = staffStore.get(id);
      if (!existing) {
        return yield* Effect.fail(
          new NotFoundError({ resource: 'Staff', id, message: `Staff member '${id}' not found` })
        );
      }

      if (existing.tenantId !== tenantCtx.tenantId) {
        return yield* Effect.fail(
          new TenantMismatchError({
            message: `Access denied: Staff member belongs to another tenant`,
          })
        );
      }

      const updated: StaffModel = {
        ...existing,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      staffStore.set(id, updated);
      return yield* HttpServerResponse.json(updated);
    })
  ),

  // DELETE /api/v1/staff/:id
  HttpRouter.del(
    '/api/v1/staff/:id',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const routeCtx = yield* HttpRouter.RouteContext;
      const id = routeCtx.params['id'] ?? '';

      const existing = staffStore.get(id);
      if (!existing) {
        return yield* Effect.fail(
          new NotFoundError({ resource: 'Staff', id, message: `Staff member '${id}' not found` })
        );
      }

      if (existing.tenantId !== tenantCtx.tenantId) {
        return yield* Effect.fail(
          new TenantMismatchError({
            message: `Access denied: Staff member belongs to another tenant`,
          })
        );
      }

      staffStore.delete(id);
      return yield* HttpServerResponse.json({ success: true, id });
    })
  )
);
