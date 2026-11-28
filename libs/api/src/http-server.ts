import {
  HttpRouter,
  HttpServer,
} from '@effect/platform';
import { NodeHttpServer } from '@effect/platform-node';
import { Effect, Layer } from 'effect';
import { createServer } from 'node:http';

import { corsMiddleware, securityHeadersMiddleware } from './middleware/cors-security.js';
import { errorHandlingMiddleware } from './middleware/error-handler.js';
import { healthRoutes } from './routes/health.js';
import { openApiRoutes } from './openapi.js';
import { eventRoutes } from './routes/events.js';
import { tenantRoutes } from './routes/tenants.js';
import { staffRoutes } from './routes/staff.js';
import { resourceRoutes } from './routes/resources.js';
import { bookingRoutes } from './routes/bookings.js';

// Assemble complete API router with all domain routes and documentation
export const apiRouter = HttpRouter.empty.pipe(
  HttpRouter.concat(healthRoutes),
  HttpRouter.concat(openApiRoutes),
  HttpRouter.concat(eventRoutes),
  HttpRouter.concat(tenantRoutes),
  HttpRouter.concat(staffRoutes),
  HttpRouter.concat(resourceRoutes),
  HttpRouter.concat(bookingRoutes)
);

// Compose router with middleware pipeline: CORS -> Security Headers -> Error Handling
export const apiApp = apiRouter.pipe(
  HttpRouter.use(errorHandlingMiddleware),
  HttpRouter.use(securityHeadersMiddleware),
  HttpRouter.use(corsMiddleware)
);

// HttpApp ready for web handler or server execution
export const httpApp = HttpRouter.toHttpApp(apiApp);

export interface ApiServerOptions {
  readonly port?: number;
  readonly host?: string;
}

/**
 * Creates the Effect NodeHttpServer Layer for the API server.
 */
export const makeNodeServerLayer = (options: ApiServerOptions = {}) => {
  const port = options.port ?? Number(process.env['PORT'] ?? '3000');
  const host = options.host ?? process.env['HOST'] ?? '0.0.0.0';

  return NodeHttpServer.layer(() => createServer(), {
    port,
    host,
  });
};

/**
 * Live Layer that serves the API HTTP Server using Effect Platform.
 */
export const ApiServerLive = (options: ApiServerOptions = {}) =>
  HttpServer.serve(apiApp).pipe(
    Layer.provide(makeNodeServerLayer(options))
  );

/**
 * Starts the API server with Effect runtime.
 */
export const startApiServer = (options: ApiServerOptions = {}): Promise<void> => {
  const serverLayer = ApiServerLive(options);

  const program = Layer.launch(serverLayer);

  return Effect.runPromise(program as Effect.Effect<never, ServeError, never>).then(() => {
    console.log('[Eventiva API] Server started');
  });
};

