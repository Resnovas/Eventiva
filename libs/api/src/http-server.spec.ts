import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Effect, Layer } from 'effect';
import { createServer, Server as NodeServer } from 'node:http';
import { HttpServer } from '@effect/platform';
import { NodeHttpServer } from '@effect/platform-node';
import { apiApp } from './http-server.js';

describe('Eventiva API Layer Integration Tests', () => {
  let baseUrl: string;
  let stopServer: () => Promise<void>;

  beforeAll(async () => {
    const ServerLive = NodeHttpServer.layer(() => createServer(), { port: 0, host: '127.0.0.1' });
    let localPort = 0;

    const program = Effect.gen(function* () {
      const server = yield* HttpServer.HttpServer;
      if (server.address._tag === 'TcpAddress') {
        localPort = server.address.port;
      }
      yield* Effect.never;
    }).pipe(
      Effect.provide(HttpServer.serve(apiApp)),
      Effect.provide(ServerLive)
    );

    const fiber = Effect.runFork(program);

    // Wait until port is assigned
    while (localPort === 0) {
      await new Promise((r) => setTimeout(r, 20));
    }

    baseUrl = `http://127.0.0.1:${localPort}`;

    stopServer = async () => {
      await Effect.runPromise(fiber.interruptAsFork(fiber.id()));
    };
  });

  afterAll(async () => {
    if (stopServer) {
      await stopServer();
    }
  });

  describe('1. Health Check Endpoint', () => {
    it('returns status ok on GET /health', async () => {
      const res = await fetch(`${baseUrl}/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('ok');
      expect(data.version).toBe('0.0.1');
      expect(typeof data.timestamp).toBe('string');
      expect(typeof data.uptime).toBe('number');
    });

    it('returns status ok on GET /api/v1/health', async () => {
      const res = await fetch(`${baseUrl}/api/v1/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('ok');
    });
  });

  describe('2. Security & CORS Headers', () => {
    it('sets CORS and security headers on responses', async () => {
      const res = await fetch(`${baseUrl}/health`);
      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('x-frame-options')).toBe('DENY');
      expect(res.headers.get('access-control-allow-origin')).toBe('*');
    });
  });

  describe('3. Tenant Isolation & Extraction', () => {
    it('rejects tenant-scoped endpoints if x-tenant-id header is missing', async () => {
      const res = await fetch(`${baseUrl}/api/v1/events`);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error.code).toBe('TENANT_HEADER_MISSING');
    });

    it('rejects access to resource belonging to a different tenant (403 TENANT_MISMATCH)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/events/evt-001`, {
        headers: { 'x-tenant-id': 'other-tenant-999' },
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error.code).toBe('TENANT_MISMATCH');
    });

    it('returns tenant-isolated records when valid x-tenant-id is supplied', async () => {
      const res = await fetch(`${baseUrl}/api/v1/events`, {
        headers: { 'x-tenant-id': 'tenant-demo' },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data[0].tenantId).toBe('tenant-demo');
    });
  });

  describe('4. Request Validation', () => {
    it('rejects invalid request body with 400 Bad Request on event creation', async () => {
      const res = await fetch(`${baseUrl}/api/v1/events`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-tenant-id': 'tenant-demo',
        },
        body: JSON.stringify({
          // Title missing (required)
          startDate: '2026-09-01T10:00:00Z',
          endDate: '2026-09-01T18:00:00Z',
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('5. Domain CRUD Routes', () => {
    describe('Events CRUD', () => {
      let createdEventId: string;

      it('scaffolds POST /api/v1/events (create)', async () => {
        const res = await fetch(`${baseUrl}/api/v1/events`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-tenant-id': 'tenant-demo',
          },
          body: JSON.stringify({
            title: 'Glastonbury Stage Tech 2026',
            description: 'Main stage audio & lighting setup',
            startDate: '2026-06-24T08:00:00Z',
            endDate: '2026-06-28T23:00:00Z',
            location: 'Worthy Farm, Pilton',
          }),
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.title).toBe('Glastonbury Stage Tech 2026');
        expect(data.tenantId).toBe('tenant-demo');
        createdEventId = data.id;
      });

      it('scaffolds GET /api/v1/events/:id (read)', async () => {
        const res = await fetch(`${baseUrl}/api/v1/events/${createdEventId}`, {
          headers: { 'x-tenant-id': 'tenant-demo' },
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe(createdEventId);
      });

      it('scaffolds PUT /api/v1/events/:id (update)', async () => {
        const res = await fetch(`${baseUrl}/api/v1/events/${createdEventId}`, {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
            'x-tenant-id': 'tenant-demo',
          },
          body: JSON.stringify({
            title: 'Glastonbury Main Stage 2026 (Updated)',
            status: 'published',
          }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.title).toBe('Glastonbury Main Stage 2026 (Updated)');
        expect(data.status).toBe('published');
      });

      it('scaffolds DELETE /api/v1/events/:id (delete)', async () => {
        const res = await fetch(`${baseUrl}/api/v1/events/${createdEventId}`, {
          method: 'DELETE',
          headers: { 'x-tenant-id': 'tenant-demo' },
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);

        const verifyRes = await fetch(`${baseUrl}/api/v1/events/${createdEventId}`, {
          headers: { 'x-tenant-id': 'tenant-demo' },
        });
        expect(verifyRes.status).toBe(404);
      });
    });

    describe('Tenants CRUD', () => {
      it('scaffolds GET /api/v1/tenants & POST /api/v1/tenants', async () => {
        const listRes = await fetch(`${baseUrl}/api/v1/tenants`);
        expect(listRes.status).toBe(200);
        const listData = await listRes.json();
        expect(listData.total).toBeGreaterThan(0);

        const createRes = await fetch(`${baseUrl}/api/v1/tenants`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name: 'Festival Operations Ltd',
            slug: 'fest-ops',
          }),
        });
        expect(createRes.status).toBe(201);
        const newTenant = await createRes.json();
        expect(newTenant.name).toBe('Festival Operations Ltd');
      });
    });

    describe('Staff CRUD', () => {
      it('scaffolds POST & GET /api/v1/staff', async () => {
        const createRes = await fetch(`${baseUrl}/api/v1/staff`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-tenant-id': 'tenant-demo',
          },
          body: JSON.stringify({
            name: 'Alex Turner',
            email: 'alex@eventiva.co.uk',
            role: 'manager',
          }),
        });
        expect(createRes.status).toBe(201);
        const staff = await createRes.json();
        expect(staff.email).toBe('alex@eventiva.co.uk');

        const listRes = await fetch(`${baseUrl}/api/v1/staff`, {
          headers: { 'x-tenant-id': 'tenant-demo' },
        });
        expect(listRes.status).toBe(200);
        const listData = await listRes.json();
        expect(listData.total).toBeGreaterThanOrEqual(2);
      });
    });

    describe('Resources CRUD', () => {
      it('scaffolds POST & GET /api/v1/resources', async () => {
        const createRes = await fetch(`${baseUrl}/api/v1/resources`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-tenant-id': 'tenant-demo',
          },
          body: JSON.stringify({
            name: '4K Projection Rig',
            category: 'video',
            quantity: 2,
          }),
        });
        expect(createRes.status).toBe(201);
        const resObj = await createRes.json();
        expect(resObj.name).toBe('4K Projection Rig');

        const listRes = await fetch(`${baseUrl}/api/v1/resources`, {
          headers: { 'x-tenant-id': 'tenant-demo' },
        });
        expect(listRes.status).toBe(200);
      });
    });

    describe('Bookings CRUD', () => {
      it('scaffolds POST & GET /api/v1/bookings', async () => {
        const createRes = await fetch(`${baseUrl}/api/v1/bookings`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-tenant-id': 'tenant-demo',
          },
          body: JSON.stringify({
            eventId: 'evt-001',
            resourceId: 'res-001',
            quantity: 1,
          }),
        });
        expect(createRes.status).toBe(201);
        const booking = await createRes.json();
        expect(booking.quantity).toBe(1);

        const listRes = await fetch(`${baseUrl}/api/v1/bookings`, {
          headers: { 'x-tenant-id': 'tenant-demo' },
        });
        expect(listRes.status).toBe(200);
      });
    });
  });

  describe('6. OpenAPI / Swagger Documentation', () => {
    it('serves OpenAPI 3.0 spec JSON at GET /api/docs/openapi.json', async () => {
      const res = await fetch(`${baseUrl}/api/docs/openapi.json`);
      expect(res.status).toBe(200);
      const spec = await res.json();
      expect(spec.openapi).toBe('3.0.3');
      expect(spec.info.title).toContain('Eventiva');
      expect(spec.paths['/health']).toBeDefined();
      expect(spec.paths['/api/v1/events']).toBeDefined();
    });

    it('serves Swagger UI HTML page at GET /api/docs', async () => {
      const res = await fetch(`${baseUrl}/api/docs`);
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('swagger-ui');
    });
  });
});
