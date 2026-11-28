import * as Schema from 'effect/Schema';
import { typeIdSchema } from '@eventiva/core';

export const UserRole = Schema.Literal('owner', 'manager', 'staff', 'viewer');
export type UserRole = Schema.Schema.Type<typeof UserRole>;

export const User = Schema.Struct({
    id: typeIdSchema('user'),
    email: Schema.String.pipe(Schema.nonEmptyString()),
    passwordHash: Schema.String.pipe(Schema.nonEmptyString()),
    role: UserRole,
    isVerified: Schema.Boolean,
    createdAt: Schema.String,
    updatedAt: Schema.String,
});
export type User = Schema.Schema.Type<typeof User>;

export const PublicUser = Schema.Struct({
    id: Schema.String,
    email: Schema.String,
    role: UserRole,
    isVerified: Schema.Boolean,
    createdAt: Schema.String,
    updatedAt: Schema.String,
});
export type PublicUser = Schema.Schema.Type<typeof PublicUser>;

export const RegisterInput = Schema.Struct({
    email: Schema.String.pipe(Schema.nonEmptyString()),
    password: Schema.String.pipe(Schema.minLength(8)),
    role: Schema.optionalWith(UserRole, { default: () => 'staff' as const }),
});
export type RegisterInput = Schema.Schema.Type<typeof RegisterInput>;

export const LoginInput = Schema.Struct({
    email: Schema.String.pipe(Schema.nonEmptyString()),
    password: Schema.String.pipe(Schema.nonEmptyString()),
});
export type LoginInput = Schema.Schema.Type<typeof LoginInput>;

export const AuthTokens = Schema.Struct({
    accessToken: Schema.String,
    refreshToken: Schema.String,
});
export type AuthTokens = Schema.Schema.Type<typeof AuthTokens>;

export const AuthResult = Schema.Struct({
    user: PublicUser,
    tokens: AuthTokens,
});
export type AuthResult = Schema.Schema.Type<typeof AuthResult>;
