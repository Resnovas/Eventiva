import * as Schema from 'effect/Schema';
import { typeIdSchema } from '@eventiva/core';

export const ContactType = Schema.Literal('lead', 'attendee', 'vendor', 'stakeholder', 'team_member');
export type ContactType = Schema.Schema.Type<typeof ContactType>;

export const ContactStatus = Schema.Literal('new', 'contacted', 'qualified', 'converted', 'lost');
export type ContactStatus = Schema.Schema.Type<typeof ContactStatus>;

export const Contact = Schema.Struct({
  id: typeIdSchema('contact'),
  tenantId: typeIdSchema('tenant'),
  firstName: Schema.String.pipe(Schema.nonEmptyString({ message: () => 'First name required' })),
  lastName: Schema.String.pipe(Schema.nonEmptyString({ message: () => 'Last name required' })),
  email: Schema.String.pipe(Schema.email()),
  phone: Schema.Optional(Schema.String),
  company: Schema.Optional(Schema.String),
  role: Schema.Optional(Schema.String),
  type: ContactType,
  status: ContactStatus,
  tags: Schema.Array(Schema.String),
  notes: Schema.Optional(Schema.String),
  linkedVendorId: Schema.Optional(typeIdSchema('vendor')),
  linkedVenueId: Schema.Optional(typeIdSchema('venue')),
  createdAt: Schema.String,
  updatedAt: Schema.String,
});
export type Contact = Schema.Schema.Type<typeof Contact>;

export const CreateContactInput = Schema.Struct({
  tenantId: typeIdSchema('tenant'),
  firstName: Schema.String.pipe(Schema.nonEmptyString({ message: () => 'First name required' })),
  lastName: Schema.String.pipe(Schema.nonEmptyString({ message: () => 'Last name required' })),
  email: Schema.String.pipe(Schema.email()),
  phone: Schema.Optional(Schema.String),
  company: Schema.Optional(Schema.String),
  role: Schema.Optional(Schema.String),
  type: ContactType,
  status: Schema.OptionalWith(ContactStatus, { default: () => 'new' }),
  tags: Schema.OptionalWith(Schema.Array(Schema.String), { default: () => [] }),
  notes: Schema.Optional(Schema.String),
  linkedVendorId: Schema.Optional(typeIdSchema('vendor')),
  linkedVenueId: Schema.Optional(typeIdSchema('venue')),
});
export type CreateContactInput = Schema.Schema.Type<typeof CreateContactInput>;

export const UpdateContactInput = Schema.Struct({
  firstName: Schema.Optional(Schema.String.pipe(Schema.nonEmptyString({ message: () => 'First name cannot be empty' }))),
  lastName: Schema.Optional(Schema.String.pipe(Schema.nonEmptyString({ message: () => 'Last name cannot be empty' }))),
  email: Schema.Optional(Schema.String.pipe(Schema.email())),
  phone: Schema.Optional(Schema.String),
  company: Schema.Optional(Schema.String),
  role: Schema.Optional(Schema.String),
  type: Schema.Optional(ContactType),
  status: Schema.Optional(ContactStatus),
  tags: Schema.Optional(Schema.Array(Schema.String)),
  notes: Schema.Optional(Schema.String),
  linkedVendorId: Schema.Optional(typeIdSchema('vendor')),
  linkedVenueId: Schema.Optional(typeIdSchema('venue')),
});
export type UpdateContactInput = Schema.Schema.Type<typeof UpdateContactInput>;

export const ContactFilterOptions = Schema.Struct({
  type: Schema.Optional(ContactType),
  status: Schema.Optional(ContactStatus),
  searchQuery: Schema.Optional(Schema.String),
});
export type ContactFilterOptions = Schema.Schema.Type<typeof ContactFilterOptions>;
