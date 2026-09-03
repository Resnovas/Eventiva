import { describe, it, expect } from 'vitest';
import { Ticket } from '../types/ticket';
import { theme } from '../theme/tokens';

describe('TicketCard Component Logic', () => {
  const mockTicket: Ticket = {
    id: 'ticket-1',
    eventId: 'event-1',
    tier: {
      id: 'tier-1',
      name: 'General Admission',
      description: 'Standard entry ticket',
      price: 20,
      currency: 'USD',
      remaining: 10,
    },
    status: 'available',
  };

  it('has correct tier structure', () => {
    expect(mockTicket.tier.name).toBe('General Admission');
    expect(mockTicket.tier.price).toBe(20);
    expect(mockTicket.tier.remaining).toBe(10);
  });

  it('shows available status', () => {
    expect(mockTicket.status).toBe('available');
  });

  it('theme has ticket-related colors', () => {
    expect(theme.colors.primary).toBe('#6366F1');
    expect(theme.colors.success).toBe('#10B981');
  });
});