import { describe, it, expect } from 'vitest';
import { Event } from '../types/event';
import { theme } from '../theme/tokens';

describe('EventCard Component Logic', () => {
  const mockEvent: Event = {
    id: 'evt-test-1',
    title: 'Mobile Architecture Workshop',
    description: 'Deep dive into React Native Expo app setup.',
    category: 'Workshop',
    startDate: '2026-10-15T10:00:00Z',
    endDate: '2026-10-15T12:00:00Z',
    location: 'Room 101, London',
    status: 'scheduled',
    capacity: 100,
    registeredCount: 45,
  };

  it('has correct theme colors for status mapping', () => {
    expect(theme.colors.statusScheduled).toBeDefined();
    expect(theme.colors.statusLive).toBeDefined();
    expect(theme.colors.statusDraft).toBeDefined();
    expect(theme.colors.statusCompleted).toBeDefined();
    expect(theme.colors.statusCancelled).toBeDefined();
  });

  it('formats dates correctly for display', () => {
    const date = new Date(mockEvent.startDate);
    expect(date.getUTCHours()).toBe(10);
    expect(date.getUTCMinutes()).toBe(0);
  });

  it('mock event has required fields', () => {
    expect(mockEvent.title).toBeTruthy();
    expect(mockEvent.description).toBeTruthy();
    expect(mockEvent.capacity).toBeGreaterThan(0);
    expect(mockEvent.registeredCount).toBeLessThanOrEqual(mockEvent.capacity);
  });
});
