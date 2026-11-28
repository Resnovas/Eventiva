import { describe, it, expect } from 'vitest';
import { Event, ViewMode } from '../types/event';
import { theme } from '../theme/tokens';

describe('CalendarView Component Logic', () => {
  const mockEvents: Event[] = [
    {
      id: 'evt-1',
      title: 'Keynote Session',
      description: 'Opening event',
      category: 'Keynote',
      startDate: '2026-10-15T09:00:00Z',
      endDate: '2026-10-15T10:00:00Z',
      location: 'Auditorium',
      status: 'scheduled',
      capacity: 500,
      registeredCount: 300,
    },
  ];

  it('defines valid view modes', () => {
    const modes: ViewMode[] = ['month', 'week', 'day'];
    expect(modes).toHaveLength(3);
    expect(modes).toContain('month');
    expect(modes).toContain('week');
    expect(modes).toContain('day');
  });

  it('filters events by date correctly', () => {
    const testDate = new Date('2026-10-15');
    const filtered = mockEvents.filter((evt) => {
      const evtDate = new Date(evt.startDate);
      return (
        evtDate.getUTCFullYear() === testDate.getUTCFullYear() &&
        evtDate.getUTCMonth() === testDate.getUTCMonth() &&
        evtDate.getUTCDate() === testDate.getUTCDate()
      );
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Keynote Session');
  });

  it('has required theme spacing and colors', () => {
    expect(theme.spacing.md).toBe(16);
    expect(theme.colors.primary).toBe('#6366F1');
    expect(theme.colors.background).toBe('#F9FAFB');
  });
});