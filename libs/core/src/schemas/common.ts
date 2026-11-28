/**
 * Common domain schemas for Eventiva.
 * Composes branded types into reusable entity/value-object schemas.
 */
import * as Schema from 'effect/Schema';
import * as Branded from '../types/branded.js';
import { EventStatus, VenueStatus, VendorCategory } from '../types/enums.js';

// ─── Value object schemas (re-export branded schemas from types/branded.ts) ───

export const EmailAddress = Branded.EmailAddress;
export const PhoneNumber = Branded.PhoneNumber;
export const CurrencyAmount = Branded.CurrencyAmount;
export const DateTime = Branded.DateTime;

export const EventStatusSchema = Schema.Enums(EventStatus);
export const VenueStatusSchema = Schema.Enums(VenueStatus);
export const VendorCategorySchema = Schema.Enums(VendorCategory);

// ─── Composite entity / value-object schemas ───

export const ContactInfo = Schema.Struct({
  name: Schema.String,
  email: EmailAddress,
  phone: Schema.optional(PhoneNumber),
});

export const Address = Schema.Struct({
  line1: Schema.String,
  line2: Schema.optional(Schema.String),
  city: Schema.String,
  postalCode: Schema.String,
  country: Schema.String,
});

export const Money = Schema.Struct({
  amount: CurrencyAmount,
  currency: Schema.String.pipe(
    Schema.pattern(/^[A-Z]{3}$/, { message: () => 'Invalid ISO 4217 currency code' })
  ),
});

export const DateRange = Schema.Struct({
  start: DateTime,
  end: DateTime,
});

export const BaseEntityRecord = Schema.Struct({
  id: Schema.String,
  tenantId: Schema.String,
  createdAt: Schema.String,
  updatedAt: Schema.String,
  deletedAt: Schema.optional(Schema.String),
});