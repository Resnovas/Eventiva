import { and, eq, ilike, or } from 'drizzle-orm';
import { Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import { typeId } from '@eventiva/core';
import { ContactNotFoundError, ContactRepository, ContactRepositoryError, ContactValidationError } from '../repository.js';
import { Contact, ContactFilterOptions, CreateContactInput, UpdateContactInput } from '../schema.js';
import { contacts } from './schema.js';

type DrizzleDatabase = {
  insert: (table: typeof contacts) => { values: (row: NewContactValues) => Promise<unknown> };
  select: () => { from: (table: typeof contacts) => { where: (condition: unknown) => Promise<unknown[]> } };
  update: (table: typeof contacts) => { set: (values: Partial<NewContactValues>) => { where: (condition: unknown) => { returning: () => Promise<unknown[]> } } };
  delete: (table: typeof contacts) => { where: (condition: unknown) => Promise<unknown> };
};
type NewContactValues = Contact;

const validate = <A>(schema: Schema.Schema<A>, input: unknown, message: string) =>
  Schema.decodeUnknown(schema)(input).pipe(Effect.mapError((cause) => new ContactValidationError({ message, cause })));

export function makeDrizzleContactRepository(db: DrizzleDatabase): ContactRepository {
  return {
    create: (input) => Effect.gen(function* () {
      const value = yield* validate(CreateContactInput, input, 'Invalid CreateContactInput');
      const now = new Date().toISOString();
      const row = { ...value, id: typeId('contact'), createdAt: now, updatedAt: now } as Contact;
      try { yield* Effect.promise(() => db.insert(contacts).values(row)); } catch (cause) { return yield* Effect.fail(new ContactRepositoryError({ message: 'Failed to insert contact', cause })); }
      return row;
    }),
    findById: (tenantId, id) => Effect.tryPromise({ try: async () => {
      const rows = await db.select().from(contacts).where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)));
      return (rows[0] as Contact | undefined) ?? null;
    }, catch: (cause) => new ContactRepositoryError({ message: `Failed to find contact ${id}`, cause }) }),
    findByTenant: (tenantId, filter) => Effect.tryPromise({ try: async () => {
      const conditions = [eq(contacts.tenantId, tenantId)];
      if (filter?.type) conditions.push(eq(contacts.type, filter.type));
      if (filter?.status) conditions.push(eq(contacts.status, filter.status));
      if (filter?.searchQuery) { const q = `%${filter.searchQuery}%`; conditions.push(or(ilike(contacts.firstName, q), ilike(contacts.lastName, q), ilike(contacts.email, q), ilike(contacts.company, q))!); }
      return await db.select().from(contacts).where(and(...conditions)) as Contact[];
    }, catch: (cause) => new ContactRepositoryError({ message: `Failed to list contacts for tenant ${tenantId}`, cause }) }),
    update: (tenantId, id, input) => Effect.gen(function* () {
      const value = yield* validate(UpdateContactInput, input, 'Invalid UpdateContactInput');
      const existing = yield* Effect.tryPromise({ try: async () => (await db.select().from(contacts).where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId))))[0] as Contact | undefined, catch: (cause) => new ContactRepositoryError({ message: `Failed to find contact ${id}`, cause }) });
      if (!existing) return yield* Effect.fail(new ContactNotFoundError({ id, tenantId }));
      const row = { ...existing, ...value, updatedAt: new Date().toISOString() };
      const rows = yield* Effect.tryPromise({ try: () => db.update(contacts).set(row).where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId))).returning(), catch: (cause) => new ContactRepositoryError({ message: `Failed to update contact ${id}`, cause }) });
      return rows[0] as Contact;
    }),
    delete: (tenantId, id) => Effect.gen(function* () {
      const existing = yield* Effect.tryPromise({ try: async () => (await db.select().from(contacts).where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId))))[0], catch: (cause) => new ContactRepositoryError({ message: `Failed to find contact ${id}`, cause }) });
      if (!existing) return yield* Effect.fail(new ContactNotFoundError({ id, tenantId }));
      yield* Effect.tryPromise({ try: () => db.delete(contacts).where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId))), catch: (cause) => new ContactRepositoryError({ message: `Failed to delete contact ${id}`, cause }) });
    }),
  };
}

export const ContactRepositoryLive = (db: DrizzleDatabase) => Layer.succeed(ContactRepository, makeDrizzleContactRepository(db));
