import { Data } from 'effect';

export class TenantHeaderMissingError extends Data.TaggedError('TenantHeaderMissingError')<{
  readonly message: string;
}> {}

export class TenantMismatchError extends Data.TaggedError('TenantMismatchError')<{
  readonly message: string;
}> {}

export class ApiValidationError extends Data.TaggedError('ApiValidationError')<{
  readonly message: string;
  readonly details?: unknown;
}> {}

export class NotFoundError extends Data.TaggedError('NotFoundError')<{
  readonly resource: string;
  readonly id?: string;
  readonly message: string;
}> {}

export class UnauthorizedError extends Data.TaggedError('UnauthorizedError')<{
  readonly message: string;
}> {}

export class ForbiddenError extends Data.TaggedError('ForbiddenError')<{
  readonly message: string;
}> {}

export type ApiError =
  | TenantHeaderMissingError
  | TenantMismatchError
  | ApiValidationError
  | NotFoundError
  | UnauthorizedError
  | ForbiddenError;
