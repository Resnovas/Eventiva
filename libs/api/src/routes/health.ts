import { HttpRouter, HttpServerResponse } from '@effect/platform';
import { Effect } from 'effect';

const startTime = Date.now();

export const healthCheckHandler = Effect.gen(function* () {
  const uptime = (Date.now() - startTime) / 1000;
  return yield* HttpServerResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.0.1',
    uptime,
  });
});

export const healthRoutes = HttpRouter.empty.pipe(
  HttpRouter.get('/health', healthCheckHandler),
  HttpRouter.get('/api/v1/health', healthCheckHandler)
);
