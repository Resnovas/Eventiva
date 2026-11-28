import { Context, Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import { hash, compare } from 'bcrypt';
import { SignJWT, jwtVerify } from 'jose';
import { AuthRepository, AuthRepositoryError } from './repository.js';
import { RegisterInput, LoginInput, AuthResult, AuthTokens, PublicUser, UserRole, User } from './schema.js';

const BCRYPT_ROUNDS = 12;

export class AuthService extends Context.Tag('@eventiva/domain-auth/AuthService')<
    AuthService,
    {
        readonly register: (input: RegisterInput) => Effect.Effect<AuthResult, AuthRepositoryError, AuthRepository>;
        readonly login: (input: LoginInput) => Effect.Effect<AuthResult, AuthRepositoryError, AuthRepository>;
        readonly refreshTokens: (refreshToken: string) => Effect.Effect<AuthTokens, AuthRepositoryError, AuthRepository>;
        readonly getPublicUser: (user: User) => PublicUser;
    }
>() {}

function toPublicUser(user: User): PublicUser {
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

function getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET ?? 'dev-jwt-secret-do-not-use-in-production';
    return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
    const secret = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-do-not-use-in-production';
    return new TextEncoder().encode(secret);
}

function issueTokens(user: User): Effect.Effect<AuthTokens, never> {
    return Effect.gen(function* () {
        const accessToken = yield* Effect.tryPromise({
            try: () =>
                new SignJWT({ sub: user.id, role: user.role })
                    .setProtectedHeader({ alg: 'HS256' })
                    .setIssuedAt()
                    .setExpirationTime('15m')
                    .sign(getJwtSecret()),
            catch: (cause) => new AuthRepositoryError({ message: 'Failed to sign access token', cause }),
        });

        const refreshToken = yield* Effect.tryPromise({
            try: () =>
                new SignJWT({ sub: user.id, type: 'refresh' })
                    .setProtectedHeader({ alg: 'HS256' })
                    .setIssuedAt()
                    .setExpirationTime('30d')
                    .sign(getRefreshSecret()),
            catch: (cause) => new AuthRepositoryError({ message: 'Failed to sign refresh token', cause }),
        });

        return { accessToken, refreshToken };
    });
}

export const makeAuthService = Effect.gen(function* () {
    const repo = yield* AuthRepository;

    return AuthService.of({
        register: (input: RegisterInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(RegisterInput)(input).pipe(
                    Effect.mapError(
                        (err) => new AuthRepositoryError({ message: 'Invalid RegisterInput', cause: err })
                    )
                );

                const passwordHash = yield* Effect.tryPromise({
                    try: () => hash(validated.password, BCRYPT_ROUNDS),
                    catch: (cause) => new AuthRepositoryError({ message: 'Password hashing failed', cause }),
                });

                const user = yield* repo.create({
                    email: validated.email,
                    passwordHash,
                    role: validated.role ?? 'staff',
                });

                const tokens = yield* issueTokens(user);

                return { user: toPublicUser(user), tokens };
            }),

        login: (input: LoginInput) =>
            Effect.gen(function* () {
                const validated = yield* Schema.decodeUnknown(LoginInput)(input).pipe(
                    Effect.mapError(
                        (err) => new AuthRepositoryError({ message: 'Invalid LoginInput', cause: err })
                    )
                );

                const user = yield* repo.findByEmail(validated.email);
                if (!user) {
                    return yield* Effect.fail(
                        new AuthRepositoryError({ message: 'Invalid email or password' })
                    );
                }

                const valid = yield* Effect.tryPromise({
                    try: () => compare(validated.password, user.passwordHash),
                    catch: (cause) => new AuthRepositoryError({ message: 'Password comparison failed', cause }),
                });

                if (!valid) {
                    return yield* Effect.fail(
                        new AuthRepositoryError({ message: 'Invalid email or password' })
                    );
                }

                const tokens = yield* issueTokens(user);

                return { user: toPublicUser(user), tokens };
            }),

        refreshTokens: (refreshToken: string) =>
            Effect.gen(function* () {
                const payload = yield* Effect.tryPromise({
                    try: () => jwtVerify(refreshToken, getRefreshSecret(), { algorithms: ['HS256'] }),
                    catch: (cause) => new AuthRepositoryError({ message: 'Invalid refresh token', cause }),
                });

                const userId = payload.payload.sub as string;
                if (!userId) {
                    return yield* Effect.fail(
                        new AuthRepositoryError({ message: 'Refresh token missing subject' })
                    );
                }

                const user = yield* repo.findById(userId);
                if (!user) {
                    return yield* Effect.fail(
                        new AuthRepositoryError({ message: 'User not found' })
                    );
                }

                return yield* issueTokens(user);
            }),

        getPublicUser: toPublicUser,
    });
});

export const AuthServiceLive = Layer.effect(AuthService, makeAuthService);

// RBAC helpers
const ROLE_HIERARCHY: Record<UserRole, number> = {
    owner: 4,
    manager: 3,
    staff: 2,
    viewer: 1,
};

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function requireRole(userRole: UserRole, requiredRole: UserRole): Effect.Effect<void, AuthRepositoryError> {
    if (hasPermission(userRole, requiredRole)) {
        return Effect.void;
    }
    return Effect.fail(
        new AuthRepositoryError({
            message: `Role '${userRole}' does not have permission. Required: '${requiredRole}' or higher`,
        })
    );
}