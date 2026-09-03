// Auth repository
import { Context, Data, Effect } from 'effect';
import type { LoginInput, RegisterInput, Role, User } from './schema.js';

export class AuthRepositoryError extends Data.TaggedError('AuthRepositoryError')<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class UserNotFoundError extends Data.TaggedError('UserNotFoundError')<{
  readonly id: string;
  readonly email: string;
}> {}

export class InvalidCredentialsError extends Data.TaggedError('InvalidCredentialsError')<{}> {}

export interface AuthRepository {
  readonly create: (input: RegisterInput) => Effect.Effect<User, AuthRepositoryError>;
  readonly findByEmail: (email: string) => Effect.Effect<User | null, AuthRepositoryError>;
  readonly findById: (id: string) => Effect.Effect<User | null, AuthRepositoryError>;
  readonly updatePasswordHash: (id: string, passwordHash: string) => Effect.Effect<void, AuthRepositoryError>;
}

export const AuthRepository = Context.GenericTag<AuthRepository>('@eventiva/domain-auth/AuthRepository');
