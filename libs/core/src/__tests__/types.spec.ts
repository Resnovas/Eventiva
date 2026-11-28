/**
 * Test coverage for branded types, enums, and schema validators.
 * Verifies encode/decode roundtrip, validation, and edge cases.
 */
import { describe, it, expect } from 'vitest';
import * as Schema from 'effect/Schema';
import * as Either from 'effect/Either';
import {
  EmailAddress,
  PhoneNumber,
  CurrencyAmount,
  CurrencyCode,
  DateTime,
} from '../types/branded.js';
import {
  EventStatus,
  VenueStatus,
  VendorCategory,
  EventStatusSchema,
  VenueStatusSchema,
  VendorCategorySchema,
} from '../types/enums.js';
import {
  ContactInfo,
  Address,
  Money,
  DateRange,
  BaseEntityRecord,
} from '../schemas/common.js';

// ─── Helpers ───
function decodeOk<A, I>(schema: Schema.Schema<A, I>, input: unknown): A {
  const result = Schema.decodeUnknownEither(schema)(input);
  if (Either.isLeft(result)) {
    throw new Error(`Expected decode to succeed: ${JSON.stringify(result.left)}`);
  }
  return result.right;
}
function decodeFail<I>(schema: Schema.Schema<any, I>, input: unknown): void {
  const result = Schema.decodeUnknownEither(schema)(input);
  expect(Either.isLeft(result)).toBe(true);
}

function roundtrip<A>(schema: Schema.Schema<A, any>, value: A): void {
  const encoded = Schema.encodeEither(schema)(value);
  expect(Either.isRight(encoded)).toBe(true);
  if (Either.isRight(encoded)) {
    const decoded = Schema.decodeUnknownEither(schema)(encoded.right);
    expect(Either.isRight(decoded)).toBe(true);
    if (Either.isRight(decoded)) {
      expect(decoded.right).toEqual(value);
    }
  }
}

// ─── Branded Types ───
describe('branded types', () => {
  describe('EmailAddress', () => {
    it('decodes valid email', () => {
      const email = decodeOk(EmailAddress, 'user@example.com');
      expect(email).toBe('user@example.com');
    });

    it('rejects missing @', () => {
      decodeFail(EmailAddress, 'userexample.com');
    });

    it('rejects missing domain', () => {
      decodeFail(EmailAddress, 'user@');
    });

    it('rejects empty string', () => {
      decodeFail(EmailAddress, '');
    });

    it('rejects string with spaces', () => {
      decodeFail(EmailAddress, 'user @example.com');
    });

    it('passes encode/decode roundtrip', () => {
      roundtrip(EmailAddress, 'user@example.com' as EmailAddress);
    });
  });

  describe('PhoneNumber', () => {
    it('decodes valid E.164 phone', () => {
      const phone = decodeOk(PhoneNumber, '+447911123456');
      expect(phone).toBe('+447911123456');
    });

    it('rejects letters', () => {
      decodeFail(PhoneNumber, 'not-a-phone');
    });

    it('rejects short number', () => {
      decodeFail(PhoneNumber, '+12');
    });

    it('rejects leading zero', () => {
      decodeFail(PhoneNumber, '+0447911123456');
    });

    it('passes encode/decode roundtrip', () => {
      roundtrip(PhoneNumber, '+447911123456' as PhoneNumber);
    });
  });

  describe('CurrencyAmount', () => {
    it('decodes positive amount', () => {
      const amount = decodeOk(CurrencyAmount, 100);
      expect(amount).toBe(100);
    });

    it('decodes zero', () => {
      const amount = decodeOk(CurrencyAmount, 0);
      expect(amount).toBe(0);
    });

    it('rejects negative amount', () => {
      decodeFail(CurrencyAmount, -1);
    });

    it('rejects string', () => {
      decodeFail(CurrencyAmount, '100');
    });

    it('passes encode/decode roundtrip', () => {
      roundtrip(CurrencyAmount, 42.5 as CurrencyAmount);
    });
  });

  describe('CurrencyCode', () => {
    it('decodes valid ISO 4217 code', () => {
      const code = decodeOk(CurrencyCode, 'GBP');
      expect(code).toBe('GBP');
    });

    it('rejects lowercase', () => {
      decodeFail(CurrencyCode, 'gbp');
    });

    it('rejects 2-letter code', () => {
      decodeFail(CurrencyCode, 'GB');
    });

    it('rejects 4-letter code', () => {
      decodeFail(CurrencyCode, 'GBPP');
    });

    it('passes encode/decode roundtrip', () => {
      roundtrip(CurrencyCode, 'USD' as CurrencyCode);
    });
  });

  describe('DateTime', () => {
    it('decodes valid ISO 8601', () => {
      const dt = decodeOk(DateTime, '2024-06-15T14:30:00Z');
      expect(dt).toBe('2024-06-15T14:30:00Z');
    });

    it('decodes with milliseconds', () => {
      const dt = decodeOk(DateTime, '2024-06-15T14:30:00.123Z');
      expect(dt).toBe('2024-06-15T14:30:00.123Z');
    });

    it('rejects date-only', () => {
      decodeFail(DateTime, '2024-06-15');
    });

    it('rejects local time', () => {
      decodeFail(DateTime, '2024-06-15T14:30:00');
    });

    it('rejects non-ISO format', () => {
      decodeFail(DateTime, 'June 15, 2024');
    });

    it('passes encode/decode roundtrip', () => {
      roundtrip(DateTime, '2024-06-15T14:30:00Z' as DateTime);
    });
  });
});

// ─── Enums ───
describe('enums', () => {
  describe('EventStatus', () => {
    it('has all values', () => {
      expect(EventStatus.Draft).toBe('draft');
      expect(EventStatus.Published).toBe('published');
      expect(EventStatus.Cancelled).toBe('cancelled');
      expect(EventStatus.Completed).toBe('completed');
    });

    it('schema decodes valid status', () => {
      const status = decodeOk(EventStatusSchema, 'draft');
      expect(status).toBe('draft');
    });

    it('schema rejects invalid status', () => {
      decodeFail(EventStatusSchema, 'unknown');
    });
  });

  describe('VenueStatus', () => {
    it('has all values', () => {
      expect(VenueStatus.Available).toBe('available');
      expect(VenueStatus.Booked).toBe('booked');
      expect(VenueStatus.Maintenance).toBe('maintenance');
      expect(VenueStatus.Inactive).toBe('inactive');
    });

    it('schema decodes valid status', () => {
      const status = decodeOk(VenueStatusSchema, 'available');
      expect(status).toBe('available');
    });

    it('schema rejects invalid status', () => {
      decodeFail(VenueStatusSchema, 'unknown');
    });
  });

  describe('VendorCategory', () => {
    it('has all values', () => {
      expect(VendorCategory.Catering).toBe('catering');
      expect(VendorCategory.Equipment).toBe('equipment');
      expect(VendorCategory.Security).toBe('security');
      expect(VendorCategory.Entertainment).toBe('entertainment');
      expect(VendorCategory.Staffing).toBe('staffing');
      expect(VendorCategory.Logistics).toBe('logistics');
      expect(VendorCategory.AV).toBe('av');
      expect(VendorCategory.Other).toBe('other');
    });

    it('schema decodes valid category', () => {
      const cat = decodeOk(VendorCategorySchema, 'catering');
      expect(cat).toBe('catering');
    });

    it('schema rejects invalid category', () => {
      decodeFail(VendorCategorySchema, 'unknown');
    });
  });
});

// ─── Composite schemas ───
describe('composite schemas', () => {
  describe('ContactInfo', () => {
    it('decodes valid contact', () => {
      const contact = decodeOk(ContactInfo, {
        email: 'test@example.com',
        phone: '+447911123456',
        name: 'Jane Smith',
      });
      expect(contact.name).toBe('Jane Smith');
    });

    it('decodes without optional phone', () => {
      const contact = decodeOk(ContactInfo, {
        email: 'test@example.com',
        name: 'Jane Smith',
      });
      expect(contact.phone).toBeUndefined();
    });
  });

  describe('Address', () => {
    it('decodes valid address', () => {
      const addr = decodeOk(Address, {
        line1: '123 Main St',
        city: 'London',
        postalCode: 'SW1A 1AA',
        country: 'GB',
      });
      expect(addr.city).toBe('London');
    });
  });

  describe('Money', () => {
    it('decodes valid money', () => {
      const money = decodeOk(Money, { amount: 100, currency: 'GBP' });
      expect(money.amount).toBe(100);
      expect(money.currency).toBe('GBP');
    });
  });

  describe('DateRange', () => {
    it('decodes valid range', () => {
      const range = decodeOk(DateRange, {
        start: '2024-06-15T09:00:00Z',
        end: '2024-06-17T18:00:00Z',
      });
      expect(range.start).toBe('2024-06-15T09:00:00Z');
    });
  });

  describe('BaseEntityRecord', () => {
    it('decodes valid entity record', () => {
      const record = decodeOk(BaseEntityRecord, {
        id: 'contact_01h2xcejqtf2nbrexx3vqjhp41',
        tenantId: 'tenant_abc',
        createdAt: '2024-06-15T14:30:00Z',
        updatedAt: '2024-06-15T14:30:00Z',
      });
      expect(record.id).toBe('contact_01h2xcejqtf2nbrexx3vqjhp41');
    });
  });
});
