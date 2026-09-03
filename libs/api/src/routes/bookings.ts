import { HttpRouter, HttpServerRequest, HttpServerResponse } from '@effect/platform';
import { Effect } from 'effect';
import { extractTenantContextFromRequest } from '../context/tenant.js';
import {
  BookingModel,
  CreateBookingSchema,
  UpdateBookingSchema,
} from '../schemas/domain.js';
import { PaginationParamsSchema } from '../schemas/common.js';
import { NotFoundError, TenantMismatchError } from '../errors/api-errors.js';

const bookingStore = new Map<string, BookingModel>();

const initialBooking: BookingModel = {
  id: 'bkg-001',
  eventId: 'evt-001',
  resourceId: 'res-001',
  quantity: 2,
  status: 'confirmed',
  tenantId: 'tenant-demo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
bookingStore.set(initialBooking.id, initialBooking);

export const bookingRoutes = HttpRouter.empty.pipe(
  // GET /api/v1/bookings
  HttpRouter.get(
    '/api/v1/bookings',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const query = yield* HttpServerRequest.schemaSearchParams(PaginationParamsSchema);

      const page = query.page ?? 1;
      const limit = query.limit ?? 20;

      const tenantBookings = Array.from(bookingStore.values()).filter(
        (b) => b.tenantId === tenantCtx.tenantId
      );

      const total = tenantBookings.length;
      const start = (page - 1) * limit;
      const paginated = tenantBookings.slice(start, start + limit);

      return yield* HttpServerResponse.json({
        data: paginated,
        total,
        page,
        limit,
      });
    })
  ),

  // GET /api/v1/bookings/:id
  HttpRouter.get(
    '/api/v1/bookings/:id',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const routeCtx = yield* HttpRouter.RouteContext;
      const id = routeCtx.params['id'] ?? '';

      const booking = bookingStore.get(id);
      if (!booking) {
        return yield* Effect.fail(
          new NotFoundError({ resource: 'Booking', id, message: `Booking '${id}' not found` })
        );
      }

      if (booking.tenantId !== tenantCtx.tenantId) {
        return yield* Effect.fail(
          new TenantMismatchError({
            message: `Access denied: Booking belongs to another tenant`,
          })
        );
      }

      return yield* HttpServerResponse.json(booking);
    })
  ),

  // POST /api/v1/bookings
  HttpRouter.post(
    '/api/v1/bookings',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const body = yield* HttpServerRequest.schemaBodyJson(CreateBookingSchema);

      const now = new Date().toISOString();
      const newBooking: BookingModel = {
        id: `bkg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        eventId: body.eventId,
        resourceId: body.resourceId,
        quantity: body.quantity,
        status: body.status ?? 'pending',
        tenantId: tenantCtx.tenantId,
        createdAt: now,
        updatedAt: now,
      };

      bookingStore.set(newBooking.id, newBooking);
      return yield* HttpServerResponse.json(newBooking, { status: 201 });
    })
  ),

  // PUT /api/v1/bookings/:id
  HttpRouter.put(
    '/api/v1/bookings/:id',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const routeCtx = yield* HttpRouter.RouteContext;
      const id = routeCtx.params['id'] ?? '';
      const body = yield* HttpServerRequest.schemaBodyJson(UpdateBookingSchema);

      const existing = bookingStore.get(id);
      if (!existing) {
        return yield* Effect.fail(
          new NotFoundError({ resource: 'Booking', id, message: `Booking '${id}' not found` })
        );
      }

      if (existing.tenantId !== tenantCtx.tenantId) {
        return yield* Effect.fail(
          new TenantMismatchError({
            message: `Access denied: Booking belongs to another tenant`,
          })
        );
      }

      const updated: BookingModel = {
        ...existing,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      bookingStore.set(id, updated);
      return yield* HttpServerResponse.json(updated);
    })
  ),

  // DELETE /api/v1/bookings/:id
  HttpRouter.del(
    '/api/v1/bookings/:id',
    Effect.gen(function* () {
      const tenantCtx = yield* extractTenantContextFromRequest;
      const routeCtx = yield* HttpRouter.RouteContext;
      const id = routeCtx.params['id'] ?? '';

      const existing = bookingStore.get(id);
      if (!existing) {
        return yield* Effect.fail(
          new NotFoundError({ resource: 'Booking', id, message: `Booking '${id}' not found` })
        );
      }

      if (existing.tenantId !== tenantCtx.tenantId) {
        return yield* Effect.fail(
          new TenantMismatchError({
            message: `Access denied: Booking belongs to another tenant`,
          })
        );
      }

      bookingStore.delete(id);
      return yield* HttpServerResponse.json({ success: true, id });
    })
  )
);
