import { HttpMiddleware, HttpServerResponse } from '@effect/platform';
import { Cause, Effect } from 'effect';
import {
  TenantHeaderMissingError,
  TenantMismatchError,
  ApiValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from '../errors/api-errors.js';

export const errorHandlingMiddleware = HttpMiddleware.make((app) =>
  Effect.catchAllCause(app, (cause) => {
    const failureOrOption = Cause.failureOrCause(cause);

    if (failureOrOption._tag === 'Left') {
      const error = failureOrOption.left;

      if (error instanceof TenantHeaderMissingError) {
        return HttpServerResponse.json(
          {
            error: {
              code: 'TENANT_HEADER_MISSING',
              message: error.message,
            },
          },
          { status: 401 }
        );
      }

      if (error instanceof TenantMismatchError) {
        return HttpServerResponse.json(
          {
            error: {
              code: 'TENANT_MISMATCH',
              message: error.message,
            },
          },
          { status: 403 }
        );
      }

      if (error instanceof ApiValidationError) {
        return HttpServerResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: error.message,
              details: error.details,
            },
          },
          { status: 400 }
        );
      }

      if (error instanceof NotFoundError) {
        return HttpServerResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: error.message,
              resource: error.resource,
              id: error.id,
            },
          },
          { status: 404 }
        );
      }

      if (error instanceof UnauthorizedError) {
        return HttpServerResponse.json(
          {
            error: {
              code: 'UNAUTHORIZED',
              message: error.message,
            },
          },
          { status: 401 }
        );
      }

      if (error instanceof ForbiddenError) {
        return HttpServerResponse.json(
          {
            error: {
              code: 'FORBIDDEN',
              message: error.message,
            },
          },
          { status: 403 }
        );
      }
    }

    // Effect ParseError / Schema validation failure
    const prettyCause = Cause.pretty(cause);
    if (prettyCause.includes('ParseError') || prettyCause.includes('Schema')) {
      return HttpServerResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: prettyCause,
          },
        },
        { status: 400 }
      );
    }

    return HttpServerResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected server error occurred',
          details: process.env['NODE_ENV'] === 'development' ? prettyCause : undefined,
        },
      },
      { status: 500 }
    );
  })
);
