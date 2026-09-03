import * as Schema from 'effect/Schema';
import { typeIdSchema } from '@eventiva/core';

export const TicketStatus = Schema.Literal('draft', 'available', 'sold', 'used', 'cancelled');
export type TicketStatus = Schema.Schema.Type<typeof TicketStatus>;

export const TicketTier = Schema.Struct({
  id: typeIdSchema('ticketTier'),
  name: Schema.String.pipe(Schema.nonEmptyString()),
  price: Schema.Struct({
    amount: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
    currency: Schema.String.pipe(Schema.nonEmptyString()),
  }),
  quantity: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
});
export type TicketTier = Schema.Schema.Type<typeof TicketTier>;

export const Ticket = Schema.Struct({
  id: typeIdSchema('ticket'),
  eventId: typeIdSchema('event'),
  tierId: typeIdSchema('ticketTier'),
  status: TicketStatus,
  holderId: Schema.optional(typeIdSchema('contact')),
  purchasedAt: Schema.optional(Schema.String),
});
export type Ticket = Schema.Schema.Type<typeof Ticket>;

export const CreateTicketInput = Schema.Struct({
  eventId: typeIdSchema('event'),
  tierId: typeIdSchema('ticketTier'),
});
export type CreateTicketInput = Schema.Schema.Type<typeof CreateTicketInput>;

export const UpdateTicketInput = Schema.Struct({
  status: Schema.optional(TicketStatus),
  holderId: Schema.optional(typeIdSchema('contact')),
});
export type UpdateTicketInput = Schema.Schema.Type<typeof UpdateTicketInput>;
