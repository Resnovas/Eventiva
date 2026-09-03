// Auth domain repository - PostgreSQL
import { eq } from 'drizzle-orm';
import { Context, Effect, Layer, Schema } from 'effect';
import { AuthRepository, AuthRepositoryError, InvalidCredentialsError, UserNotFoundError } from '../repository.js';
import { users } from './schema.js';
import type { LoginInput, RegisterInput, User } from '../schema.js';

// PostgreSQL driver must be provided via DatabasesPgTag
import type { DatabasesPg } from '@eventiva/databases.pg';

export const makeAuthRepository = Effect.gen(function* () {
  const db = yield* DatabasesPgTag;

  return AuthRepository.of({
    create: (input: RegisterInput) =>
      Effect.gen(function* () {
        const { email, password, role } = input;
        const now = new Date().toISOString();
        const result = yield* Effect.tryPromise({
          try: () => db.insert(users).values({ email, passwordHash: '', role, isVerified: false, createdAt: now, updatedAt: now }).returning(),
          catch: (e) => new AuthRepositoryError({ message: 'Failed to create user', cause: e }),
        });

        if (result.length === 0) {
          return yield* Effect.fail(new AuthRepositoryError({ message: 'No user returned' }));
        }

        return Schema.decodeUnknownSync(User)({
          id: result[0].id,
          email: result[0].email,
          passwordHash: '',
          role: result[0].role as User['role'],
          isVerified: result[0].isVerified,
          createdAt: result[0].createdAt.toISOString(),
          updatedAt: result[0].updatedAt.toISOString(),
        });
      }),

    findByEmail: (email: string) =>
      Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () => db.select().from(users).where(eq(users.email, email)).limit(1),
          catch: (e) => new AuthRepositoryError({ message: 'Failed to find user', cause: e }),
        });

        if (result.length === 0) {
          return null;
        }

        const user = result[0];
        return Schema.decodeUnknownSync(User)({
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role as User['role'],
          isVerified: user.isVerified,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        });
      }),

    findById: (id: string) =>
      Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () => db.select().from(users).where(eq(users.id, id)).limit(1),
          catch: (e) => new AuthRepositoryError({ message: 'Failed to find user', cause: e }),
        });

        if (result.length === 0) {
          return null;
        }

        const user = result[0];
        return Schema.decodeUnknownSync(User)({
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role as User['role'],
          isVerified: user.isVerified,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        });
      }),

    updatePasswordHash: (id: string, passwordHash: string) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () => db.update(users).set({ passwordHash }).where(eq(users.id, id)),
          catch: (e) => new AuthRepositoryError({ message: 'Failed to update password', cause: e }),
        });
      }),
  });
}).pipe(Effect.provide(Layer.effect(DatabasesPgTag, Effect.succeed({} as any)))); // Will be provided properly

export const AuthRepositoryPg = Layer.effect(AuthRepository, makeAuthRepository);
