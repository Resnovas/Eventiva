import { Context, Effect, Layer } from 'effect';
import { HttpServerRequest } from '@effect/platform';
import { TenantHeaderMissingError } from '../errors/api-errors.js';

export interface TenantContextShape {
  readonly tenantId: string;
  readonly userId?: string;
  readonly roles?: readonly string[];
}

export class TenantContext extends Context.Tag('TenantContext')<
  TenantContext,
  TenantContextShape
>() {}

export const extractTenantContextFromRequest = Effect.gen(function* () {
  const req = yield* HttpServerRequest.HttpServerRequest;
  const tenantIdHeader = req.headers['x-tenant-id'];

  if (!tenantIdHeader || typeof tenantIdHeader !== 'string' || tenantIdHeader.trim() === '') {
    return yield* Effect.fail(
      new TenantHeaderMissingError({
        message: 'Missing or empty x-tenant-id header. Tenant context is required.',
      })
    );
  }

  const userIdHeader = req.headers['x-user-id'];
  const rolesHeader = req.headers['x-user-roles'];

  const tenantId = tenantIdHeader.trim();
  const userId = typeof userIdHeader === 'string' ? userIdHeader.trim() : undefined;
  const roles = typeof rolesHeader === 'string' ? rolesHeader.split(',').map((r) => r.trim()) : undefined;

  const tenantContext: TenantContextShape = {
    tenantId,
    userId,
    roles,
  };

  return tenantContext;
});

export const makeTenantContextLayer = (tenantId: string, userId?: string, roles?: readonly string[]) =>
  Layer.succeed(TenantContext, { tenantId, userId, roles });
