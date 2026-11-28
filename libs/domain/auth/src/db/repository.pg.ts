import { Effect, Layer } from 'effect';
import { eq } from 'drizzle-orm';
import { typeId } from '@eventiva/core';
import { AuthRepository, AuthRepositoryError } from '../repository.js';
import type { RegisterInput, User } from '../schema.js';
import { users } from './schema.js';

function rowToUser(row: any): User {
    return {
        id: row.id,
        email: row.email,
        passwordHash: row.passwordHash,
        role: row.role as User['role'],
        isVerified: row.isVerified,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

export function makeDrizzleAuthRepository(db: any): AuthRepository {
    return {
        create: (input) =>
            Effect.gen(function* () {
                const now = new Date().toISOString();
                const id = typeId('user');
                const row = {
                    id,
                    email: input.email,
                    passwordHash: input.passwordHash,
                    role: input.role ?? 'staff',
                    isVerified: false,
                    createdAt: now,
                    updatedAt: now,
                };

                yield* Effect.tryPromise({
                    try: () => db.insert(users).values(row),
                    catch: (cause) => new AuthRepositoryError({ message: 'Failed to insert user', cause }),
                });

                return row as User;
            }),

        findByEmail: (email: string) =>
            Effect.gen(function* () {
                const rows = yield* Effect.tryPromise({
                    try: () => db.select().from(users).where(eq(users.email, email)),
                    catch: (cause) => new AuthRepositoryError({ message: `Failed to find user by email ${email}`, cause }),
                });

                if (rows.length === 0) {
                    return null;
                }
                return rowToUser(rows[0]);
            }),

        findById: (id: string) =>
            Effect.gen(function* () {
                const rows = yield* Effect.tryPromise({
                    try: () => db.select().from(users).where(eq(users.id, id)),
                    catch: (cause) => new AuthRepositoryError({ message: `Failed to find user ${id}`, cause }),
                });

                if (rows.length === 0) {
                    return null;
                }
                return rowToUser(rows[0]);
            }),

        updatePasswordHash: (id: string, passwordHash: string) =>
            Effect.gen(function* () {
                yield* Effect.tryPromise({
                    try: () =>
                        db
                            .update(users)
                            .set({ passwordHash, updatedAt: new Date().toISOString() })
                            .where(eq(users.id, id)),
                    catch: (cause) => new AuthRepositoryError({ message: `Failed to update password for user ${id}`, cause }),
                });
            }),

        verifyUser: (id: string) =>
            Effect.gen(function* () {
                yield* Effect.tryPromise({
                    try: () =>
                        db
                            .update(users)
                            .set({ isVerified: true, updatedAt: new Date().toISOString() })
                            .where(eq(users.id, id)),
                    catch: (cause) => new AuthRepositoryError({ message: `Failed to verify user ${id}`, cause }),
                });
            }),
    };
}

export function makeInMemoryAuthRepository(): AuthRepository {
    const store = new Map<string, User>();

    return {
        create: (input) =>
            Effect.gen(function* () {
                const now = new Date().toISOString();
                const id = typeId('user');
                const user: User = {
                    id,
                    email: input.email,
                    passwordHash: input.passwordHash,
                    role: input.role ?? 'staff',
                    isVerified: false,
                    createdAt: now,
                    updatedAt: now,
                };
                store.set(id, user);
                return user;
            }),

        findByEmail: (email: string) =>
            Effect.sync(() => {
                for (const user of store.values()) {
                    if (user.email === email) return user;
                }
                return null;
            }),

        findById: (id: string) => Effect.succeed(store.get(id) ?? null),

        updatePasswordHash: (id: string, passwordHash: string) =>
            Effect.sync(() => {
                const user = store.get(id);
                if (user) {
                    store.set(id, { ...user, passwordHash, updatedAt: new Date().toISOString() });
                }
            }),

        verifyUser: (id: string) =>
            Effect.sync(() => {
                const user = store.get(id);
                if (user) {
                    store.set(id, { ...user, isVerified: true, updatedAt: new Date().toISOString() });
                }
            }),
    };
}

export const AuthRepositoryInMemoryLive = Layer.succeed(AuthRepository, makeInMemoryAuthRepository());