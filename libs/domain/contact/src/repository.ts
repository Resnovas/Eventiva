import { Context, Data, Effect } from 'effect';
import type { CreateContactInput, UpdateContactInput, Contact, ContactFilterOptions } from './schema.js';

export class ContactNotFoundError extends Data.TaggedError('ContactNotFoundError')<{
  readonly id: string;
  readonly tenantId: string;
}> {}

export class ContactValidationError extends Data.TaggedError('ContactValidationError')<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class ContactRepositoryError extends Data.TaggedError('ContactRepositoryError')<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export interface ContactRepository {
  readonly create: (input: CreateContactInput) => Effect.Effect<Contact, ContactValidationError | ContactRepositoryError>;
  readonly findById: (tenantId: string, id: string) => Effect.Effect<Contact | null, ContactRepositoryError>;
  readonly findByTenant: (tenantId: string, filter?: ContactFilterOptions) => Effect.Effect<Contact[], ContactRepositoryError>;
  readonly update: (tenantId: string, id: string, input: UpdateContactInput) => Effect.Effect<Contact, ContactNotFoundError | ContactValidationError | ContactRepositoryError>;
  readonly delete: (tenantId: string, id: string) => Effect.Effect<void, ContactNotFoundError | ContactRepositoryError>;
}

export const ContactRepository = Context.GenericTag<ContactRepository>('@eventiva/domain-contact/ContactRepository');
