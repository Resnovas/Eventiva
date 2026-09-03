import { HttpRouter, HttpServerResponse } from '@effect/platform';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Eventiva Platform HTTP API',
    version: '1.0.0',
    description:
      'Core HTTP API foundation for Eventiva event planning and production logistics platform.',
    contact: {
      name: 'Eventiva Engineering',
      email: 'support@eventiva.co.uk',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      TenantIdHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'x-tenant-id',
        description: 'Tenant isolation context header (required for tenant-scoped endpoints)',
      },
    },
    schemas: {
      HealthCheck: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ok', 'degraded'] },
          timestamp: { type: 'string', format: 'date-time' },
          version: { type: 'string' },
          uptime: { type: 'number' },
        },
        required: ['status', 'timestamp', 'version', 'uptime'],
      },
      ApiError: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'object', nullable: true },
            },
            required: ['code', 'message'],
          },
        },
        required: ['error'],
      },
      Event: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          location: { type: 'string', nullable: true },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'in_progress', 'completed', 'cancelled'],
          },
          tenantId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'title', 'startDate', 'endDate', 'status', 'tenantId', 'createdAt', 'updatedAt'],
      },
      CreateEvent: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          location: { type: 'string' },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'in_progress', 'completed', 'cancelled'],
            default: 'draft',
          },
        },
        required: ['title', 'startDate', 'endDate'],
      },
      Tenant: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'slug', 'status', 'createdAt', 'updatedAt'],
      },
      Staff: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'manager', 'coordinator', 'crew', 'viewer'] },
          tenantId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'email', 'name', 'role', 'tenantId', 'createdAt', 'updatedAt'],
      },
      Resource: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          category: {
            type: 'string',
            enum: ['audio', 'lighting', 'video', 'staging', 'catering', 'transport', 'other'],
          },
          quantity: { type: 'integer' },
          status: { type: 'string', enum: ['available', 'in_use', 'maintenance', 'retired'] },
          tenantId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'category', 'quantity', 'status', 'tenantId', 'createdAt', 'updatedAt'],
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          eventId: { type: 'string' },
          resourceId: { type: 'string' },
          quantity: { type: 'integer' },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
          },
          tenantId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'eventId', 'resourceId', 'quantity', 'status', 'tenantId', 'createdAt', 'updatedAt'],
      },
    },
  },
  security: [{ TenantIdHeader: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'API Health Check',
        responses: {
          '200': {
            description: 'API operational status',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthCheck' } } },
          },
        },
      },
    },
    '/api/v1/events': {
      get: {
        summary: 'List events for tenant',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': { description: 'Paginated events list' },
          '401': { description: 'Missing x-tenant-id header' },
        },
      },
      post: {
        summary: 'Create new event for tenant',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateEvent' } } },
        },
        responses: {
          '201': { description: 'Created event' },
          '400': { description: 'Invalid input' },
          '401': { description: 'Missing x-tenant-id header' },
        },
      },
    },
    '/api/v1/tenants': {
      get: { summary: 'List all tenants' },
      post: { summary: 'Register new tenant' },
    },
    '/api/v1/staff': {
      get: { summary: 'List staff members for tenant' },
      post: { summary: 'Create staff member' },
    },
    '/api/v1/resources': {
      get: { summary: 'List resources for tenant' },
      post: { summary: 'Create resource' },
    },
    '/api/v1/bookings': {
      get: { summary: 'List bookings for tenant' },
      post: { summary: 'Create booking' },
    },
  },
};

export const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Eventiva API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/api/docs/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis]
      });
    };
  </script>
</body>
</html>`;

export const openApiRoutes = HttpRouter.empty.pipe(
  HttpRouter.get(
    '/api/docs/openapi.json',
    HttpServerResponse.json(openApiSpec)
  ),
  HttpRouter.get(
    '/api/docs',
    HttpServerResponse.html(swaggerHtml)
  )
);
