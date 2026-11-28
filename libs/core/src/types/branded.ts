/**
 * Branded types for domain safety.
 * Every domain value gets a branded type to prevent accidental mixing.
 */
import * as Schema from 'effect/Schema';

// ─── Re-export existing branded types from tenant.ts ───
export { TenantId, EntityId, TypeIdString, IsoDateTime } from './tenant.js';

// ─── Email ───
export const EmailAddress = Schema.String.pipe(
  Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: () => 'Invalid email address' }),
  Schema.brand('EmailAddress'),
);
export type EmailAddress = Schema.Schema.Type<typeof EmailAddress>;

// ─── Phone ───
export const PhoneNumber = Schema.String.pipe(
  Schema.pattern(/^\+?[1-9]\d{6,14}$/, { message: () => 'Invalid phone number (E.164)' }),
  Schema.brand('PhoneNumber'),
);
export type PhoneNumber = Schema.Schema.Type<typeof PhoneNumber>;

// ─── Money ───
export const CurrencyAmount = Schema.Number.pipe(
  Schema.nonNegative({ message: () => 'Amount cannot be negative' }),
  Schema.brand('CurrencyAmount'),
);
export type CurrencyAmount = Schema.Schema.Type<typeof CurrencyAmount>;

export const CurrencyCode = Schema.String.pipe(
  Schema.pattern(/^[A-Z]{3}$/, { message: () => 'Invalid ISO 4217 currency code' }),
  Schema.brand('CurrencyCode'),
);
export type CurrencyCode = Schema.Schema.Type<typeof CurrencyCode>;

// ─── DateTime ───
export const DateTime = Schema.String.pipe(
  Schema.pattern(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/,
    { message: () => 'Invalid ISO 8601 datetime' },
  ),
  Schema.brand('DateTime'),
);
export type DateTime = Schema.Schema.Type<typeof DateTime>;
