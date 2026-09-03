// Auth domain schema
import * as Schema from 'effect/Schema';
import { typeIdSchema } from '@eventiva/core';

export const Role = Schema.Union(
  Schema.Literal('owner'),
  Schema.Literal('manager'),
  Schema.Literal('staff'),
  Schema.Literal('viewer')
);
export type Role = Schema.Schema.Type<typeof Role>;

export const User = Schema.Struct({
  id: typeIdSchema('user'),
  email: Schema.String.pipe(Schema.nonEmptyString(), Schema.email()),
  passwordHash: Schema.String,
  role: Role,
  isVerified: Schema.Boolean,
  createdAt: Schema.String,
  updatedAt: Schema.String,
});
export type User = Schema.Schema.Type<typeof User>;

export const RegisterInput = Schema.Struct({
  email: Schema.String.pipe(Schema.nonEmptyString(), Schema.email()),
  password: Schema.String.pipe(Schema.nonEmptyString()),
  role: Schema.optionalWith(Role, { default: () => 'staff' as const }),
});
export type RegisterInput = Schema.Schema.Type<typeof RegisterInput>;

export const LoginInput = Schema.Struct({
  email: Schema.String.pipe(Schema.nonEmptyString(), Schema.email()),
  password: Schema.String.pipe(Schema.nonEmptyString()),
});
export type LoginInput = Schema.Schema.Type<typeof LoginInput>;
