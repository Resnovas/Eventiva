import { HttpRouter, HttpServerRequest, HttpServerResponse } from '@effect/platform';
import { Effect } from 'effect';
import { extractTenantContextFromRequest } from '../context/tenant.js';
import {
  CreateEventSchema,
  EventModel,
  UpdateEventSchema,
} from '../schemas/domain.js';
import { PaginationParamsSchema } from '../schemas/common.js';
import { NotFoundError, TenantMismatchError } from '../errors/api-errors.js';

// In-memory scaffold repository for Events
const eventsStore = new Map<string, EventModel>();

// Seed sample data for testing
const initialEvent: EventModel = {
  id: 'evt-001',
  title: 'Annual Eventiva Summit',
  description: 'Main flagship event for production planning',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 86400000).toISOString(),
  location: 'London Convention Center',
  status: 'published',
  tenantId: 'tenant-demo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
eventsStore.set(initialEvent.id, initialEvent);

export const eventRoutes = HttpRouter.empty.pipe(
  // GET /api/v1/events - List events (tenant-isolated)
  HttpRouter.get(
    '/api/v1/events',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const query = yield* HttpServerRequest.schemaSearchParams(PaginationParamsSchema);

      const page = query.page ?? 1;
      const limit = query.limit ?? 20;

      const tenantEvents = Array.from(eventsStore.values()).filter(
        (e) => e.tenantId === tenantCtx.tenantId
      );

      const total = tenantEvents.length;
      const start = (page - 1) * limit;
      const paginatedEvents = tenantEvents.slice(start, start + limit);

      return yield* HttpServerResponse.json({
        data: paginatedEvents,
        total,
        page,
        limit,
      });
    })
  ),

  // GET /api/v1/events/:id - Get event by ID (tenant-isolated)
  HttpRouter.get(
    '/api/v1/events/:id',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const routeCtx = yield* HttpRouter.RouteContext;
      const id = routeCtx.params['id'] ?? '';

      const event = eventsStore.get(id);
      if (!event) {
        return yield* Effect.fail(
          new NotFoundError({ resource: 'Event', id, message: `Event '${id}' not found` })
        );
      }

      if (event.tenantId !== tenantCtx.tenantId) {
        return yield* Effect.fail(
          new TenantMismatchError({
            message: `Access denied: Event belongs to another tenant`,
          })
        );
      }

      return yield* HttpServerResponse.json(event);
    })
  ),

  // POST /api/v1/events - Create event (tenant-isolated)
  HttpRouter.post(
    '/api/v1/events',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const body = yield* HttpServerRequest.schemaBodyJson(CreateEventSchema);

      const now = new Date().toISOString();
      const newEvent: EventModel = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: body.title,
        description: body.description,
        startDate: body.startDate,
        endDate: body.endDate,
        location: body.location,
        status: body.status ?? 'draft',
        tenantId: tenantCtx.tenantId,
        createdAt: now,
        updatedAt: now,
      };

      eventsStore.set(newEvent.id, newEvent);
      return yield* HttpServerResponse.json(newEvent, { status: 201 });
    })
  ),

  // PUT /api/v1/events/:id - Update event (tenant-isolated)
  HttpRouter.put(
    '/api/v1/events/:id',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const routeCtx = yield* HttpRouter.RouteContext;
      const id = routeCtx.params['id'] ?? '';
      const body = yield* HttpServerRequest.schemaBodyJson(UpdateEventSchema);

      const existing = eventsStore.get(id);
      if (!existing) {
        return yield* Effect.fail(
          new NotFoundError({ resource: 'Event', id, message: `Event '${id}' not found` })
        );
      }

      if (existing.tenantId !== tenantCtx.tenantId) {
        return yield* Effect.fail(
          new TenantMismatchError({
            message: `Access denied: Event belongs to another tenant`,
          })
        );
      }

      const updated: EventModel = {
        ...existing,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      eventsStore.set(id, updated);
      return yield* HttpServerResponse.json(updated);
    })
  ),

  // DELETE /api/v1/events/:id - Delete event (tenant-isolated)
  HttpRouter.del(
    '/api/v1/events/:id',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const routeCtx = yield* HttpRouter.RouteContext;
      const id = routeCtx.params['id'] ?? '';

      const existing = eventsStore.get(id);
      if (!existing) {
        return yield* Effect.fail(
          new NotFoundError({ resource: 'Event', id, message: `Event '${id}' not found` })
        );
      }

      if (existing.tenantId !== tenantCtx.tenantId) {
        return yield* Effect.fail(
          new TenantMismatchError({
            message: `Access denied: Event belongs to another tenant`,
          })
        );
      }

      eventsStore.delete(id);
      return yield* HttpServerResponse.json({ success: true, id });
    })
  )
);
