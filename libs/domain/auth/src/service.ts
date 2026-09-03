import { Effect, Schema } from 'effect';
import * as bcrypt from 'bcrypt';
import * as jose from 'jose';
import { Config } from 'effect';
import type { LoginInput, RegisterInput, User } from '../schema.js';
import { AuthService, makeAuthService } from '../service.js';

// JWT Service
export class JwtService extends Effect.Service<JwtService>()({
  effect: Effect.gen(function* () {
    const jwtSecret = yield* Config secretString 'JWT_SECRET';
    const jwtExpiry = yield* Config config 'JWT_EXPIRY' as any;
    const refreshSecret = yield* Config secretString 'JWT_REFRESH_SECRET';

    return {
      signAccessToken: (userId: string, role: string) =>
        Effect.gen(function* () {
          const secret = new TextEncoder().encode(jwtSecret);
          return yield* Effect.tryPromise({
            try: () =>
              new jose.SignJWT({ userId, role, type: 'access' })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('15m')
                .sign(secret),
            catch: (e) => new Error(`JWT signing failed: ${e}`),
          });
        }),

      verifyAccessToken: (token: string) =>
        Effect.gen(function* () {
          const secret = new TextEncoder().encode(jwtSecret);
          return yield* Effect.tryPromise({
            try: () => jose.jwtVerify(token, secret),
            catch: (e) => new Error(`JWT verification failed: ${e}`),
          });
        }),

      signRefreshToken: (userId: string) =>
        Effect.gen(function* () {
          const secret = new TextEncoder().encode(refreshSecret);
          return yield* Effect.tryPromise({
            try: () =>
              new jose.SignJWT({ userId, type: 'refresh' })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('7d')
                .sign(secret),
            catch: (e) => new Error(`Refresh token signing failed: ${e}`),
          });
        }),

      verifyRefreshToken: (token: string) =>
        Effect.gen(function* () {
          const secret = new TextEncoder().encode(refreshSecret);
          return yield* Effect.tryPromise({
            try: () => jose.jwtVerify(token, secret),
            catch: (e) => new Error(`Refresh token verification failed: ${e}`),
          });
        }),
    };
  }),
}) {}

// Auth token service
export interface AuthTokenService {
  readonly register: (input: RegisterInput) => Effect.Effect<{ user: User; accessToken: string; refreshToken: string }>;
  readonly login: (input: LoginInput) => Effect.Effect<{ user: User; accessToken: string; refreshToken: string }>;
  readonly refresh: (refreshToken: string) => Effect.Effect<{ accessToken: string; refreshToken: string }>;
}

export const AuthTokenService = Effect.Service<AuthTokenService>()({
  effect: Effect.gen(function* () {
    const authService = yield* AuthService;
    const jwtService = yield* JwtService;
    const bcryptService = yield* BcryptService;

    return {
      register: (input: RegisterInput) =>
        Effect.gen(function* () {
          const user = yield* authService.register(input);
          const hashedPassword = yield* bcryptService.hash(input.password);
          yield* authService.updatePassword(user.id, hashedPassword);
          const accessToken = yield* jwtService.signAccessToken(user.id, user.role);
          const refreshToken = yield* jwtService.signRefreshToken(user.id);
          return { user, accessToken, refreshToken };
        }),

      login: (input: LoginInput) =>
        Effect.gen(function* () {
          const user = yield* authService.login(input);
          const isValid = yield* bcryptService.compare(input.password, user.passwordHash);
          if (!isValid) {
            return yield* Effect.fail(new Error('Invalid credentials'));
          }
          const accessToken = yield* jwtService.signAccessToken(user.id, user.role);
          const refreshToken = yield* jwtService.signRefreshToken(user.id);
          return { user, accessToken, refreshToken };
        }),

      refresh: (refreshToken: string) =>
        Effect.gen(function* () {
          const payload = yield* jwtService.verifyRefreshToken(refreshToken);
          const userId = payload.payload.userId as string;
          const accessToken = yield* jwtService.signAccessToken(userId, payload.payload.role as string);
          const newRefreshToken = yield* jwtService.signRefreshToken(userId);
          return { accessToken, refreshToken: newRefreshToken };
        }),
    };
  }),
});

export class BcryptService extends Effect.Service<BcryptService>()({
  effect: Effect.gen(function* () {
    return {
      hash: (password: string) =>
        Effect.tryPromise({
          try: () => bcrypt.hash(password, 10),
          catch: (e) => new Error(`Bcrypt hash failed: ${e}`),
        }),
      compare: (password: string, hash: string) =>
        Effect.tryPromise({
          try: () => bcrypt.compare(password, hash),
          catch: (e) => new Error(`Bcrypt compare failed: ${e}`),
        }),
    };
  }),
}) {}

// RBAC middleware
export class RbacMiddleware {
  static requireRole(roles: string[]) {
    return (_req: any, _res: any, next: any) => {
      // This is a placeholder - actual RBAC will be implemented in API layer
      next();
    };
  }

  static async authorize(userId: string, targetResource: string, action: string) {
    // RBAC logic
    const allowedRoles = await getRolesForAction(action, targetResource);
    return allowedRoles;
  }
}

async function getRolesForAction(action: string, resource: string): Promise<string[]> {
  // Default RBAC rules
  const rules: Record<string, Record<string, string[]>> = {
    owner: { read: ['owner', 'manager', 'staff', 'viewer'], write: ['owner', 'manager', 'staff'] },
    manager: { read: ['owner', 'manager', 'staff'], write: ['owner', 'manager'] },
    staff: { read: ['owner', 'manager', 'staff'], write: ['owner', 'manager'] },
    viewer: { read: ['owner', 'manager', 'staff', 'viewer'], write: [] },
  };
  return rules[resource]?.[action] || [];
}
