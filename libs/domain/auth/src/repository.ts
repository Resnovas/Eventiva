import { Context, Data, Effect } from 'effect';
import type { RegisterInput, User } from './schema.js';

export class AuthRepositoryError extends Data.TaggedError('AuthRepositoryError')<{
    readonly message: string;
    readonly cause?: unknown;
}> {}

export interface AuthRepository {
    readonly create: (input: RegisterInput & { passwordHash: string }) => Effect.Effect<User, AuthRepositoryError>;
    readonly findByEmail: (email: string) => Effect.Effect<User | null, AuthRepositoryError>;
    readonly findById: (id: string) => Effect.Effect<User | null, AuthRepositoryError>;
    readonly updatePasswordHash: (id: string, passwordHash: string) => Effect.Effect<void, AuthRepositoryError>;
    readonly verifyUser: (id: string) => Effect.Effect<void, AuthRepositoryError>;
}

export const AuthRepository = Context.GenericTag<AuthRepository>('@eventiva/domain-auth/AuthRepository');