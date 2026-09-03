import { Schema } from 'effect';

export const TenantIdSchema = Schema.String.pipe(
  Schema.minLength(1),
  Schema.annotations({
    identifier: 'TenantId',
    description: 'Unique identifier for the tenant context',
  })
);

export const PaginationParamsSchema = Schema.Struct({
  page: Schema.optionalWith(Schema.NumberFromString, { default: () => 1 }),
  limit: Schema.optionalWith(Schema.NumberFromString, { default: () => 20 }),
});

export type PaginationParams = Schema.Schema.Type<typeof PaginationParamsSchema>;

export const HealthCheckSchema = Schema.Struct({
  status: Schema.Literal('ok', 'degraded'),
  timestamp: Schema.String,
  version: Schema.String,
  uptime: Schema.Number,
});

export type HealthCheck = Schema.Schema.Type<typeof HealthCheckSchema>;

export const ApiErrorDetailSchema = Schema.Struct({
  code: Schema.String,
  message: Schema.String,
  details: Schema.optional(Schema.Unknown),
});

export const ApiErrorResponseSchema = Schema.Struct({
  error: ApiErrorDetailSchema,
});

export type ApiErrorResponse = Schema.Schema.Type<typeof ApiErrorResponseSchema>;
