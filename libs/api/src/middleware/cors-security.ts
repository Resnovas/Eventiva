import { HttpMiddleware, HttpServerResponse } from '@effect/platform';
import { Effect } from 'effect';

export const corsMiddleware = HttpMiddleware.cors({
  allowedOrigins: ['*'],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-tenant-id',
    'x-user-id',
    'x-user-roles',
    'Accept',
  ],
  exposedHeaders: ['x-request-id', 'x-tenant-id'],
  credentials: true,
});

export const securityHeadersMiddleware = HttpMiddleware.make((app) =>
  Effect.gen(function* () {
    const response = yield* app;
    return response.pipe(
      HttpServerResponse.setHeader('X-Content-Type-Options', 'nosniff'),
      HttpServerResponse.setHeader('X-Frame-Options', 'DENY'),
      HttpServerResponse.setHeader('X-XSS-Protection', '1; mode=block'),
      HttpServerResponse.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'),
      HttpServerResponse.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    );
  })
);
