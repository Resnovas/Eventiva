import { HttpRouter, HttpServerRequest, HttpServerResponse } from '@effect/platform';
import { Effect, Schema } from 'effect';
import { AuthService, RegisterInput, LoginInput } from '@eventiva/domain-auth';

export const authRoutes = HttpRouter.empty.pipe(
  HttpRouter.post('/api/v1/auth/register', Effect.gen(function* () {
    const body = yield* HttpServerRequest.schemaBodyJson(RegisterInput);
    const service = yield* AuthService;
    const result = yield* service.register(body);
    return yield* HttpServerResponse.json(result);
  })),
  HttpRouter.post('/api/v1/auth/login', Effect.gen(function* () {
    const body = yield* HttpServerRequest.schemaBodyJson(LoginInput);
    const service = yield* AuthService;
    const result = yield* service.login(body);
    return yield* HttpServerResponse.json(result);
  })),
  HttpRouter.post('/api/v1/auth/refresh', Effect.gen(function* () {
    const body = yield* HttpServerRequest.schemaBodyJson(
      Schema.Struct({ refreshToken: Schema.String })
    );
    const service = yield* AuthService;
    const tokens = yield* service.refresh(body.refreshToken);
    return yield* HttpServerResponse.json(tokens);
  }))
);
