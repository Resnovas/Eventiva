export type TicketStatus = 'available' | 'sold' | 'used' | 'cancelled';

export interface TicketTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  remaining: number;
}

export interface Ticket {
  id: string;
  eventId: string;
  tier: TicketTier;
  status: TicketStatus;
  holderName?: string;
  purchasedAt?: string;
}

export type PaymentMethod = 'cash' | 'card';
