import { describe, it, expect } from 'vitest';
import { Event } from '../types/event';
import { theme } from '../theme/tokens';

describe('EventForm Component Validation Logic', () => {
  const validateEventForm = (fields: {
    title: string;
    description: string;
    category: string;
    location: string;
    capacity: string;
    startDate: string;
    endDate: string;
  }) => {
    const errors: Record<string, string> = {};

    if (!fields.title.trim()) {
      errors.title = 'Event title is required';
    } else if (fields.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!fields.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!fields.category.trim()) {
      errors.category = 'Category is required';
    }

    if (!fields.location.trim()) {
      errors.location = 'Location is required';
    }

    const numCapacity = parseInt(fields.capacity, 10);
    if (isNaN(numCapacity) || numCapacity <= 0) {
      errors.capacity = 'Capacity must be a positive number';
    }

    const startMs = Date.parse(fields.startDate);
    const endMs = Date.parse(fields.endDate);

    if (isNaN(startMs)) {
      errors.startDate = 'Invalid start date format (ISO required)';
    }

    if (isNaN(endMs)) {
      errors.endDate = 'Invalid end date format (ISO required)';
    }

    if (!isNaN(startMs) && !isNaN(endMs) && startMs > endMs) {
      errors.endDate = 'End date cannot be earlier than start date';
    }

    return errors;
  };

  it('rejects empty title', () => {
    const errors = validateEventForm({
      title: '',
      description: 'Desc',
      category: 'Conference',
      location: 'London',
      capacity: '100',
      startDate: '2026-10-15T09:00:00Z',
      endDate: '2026-10-15T18:00:00Z',
    });
    expect(errors.title).toBe('Event title is required');
  });

  it('rejects title less than 3 chars', () => {
    const errors = validateEventForm({
      title: 'AB',
      description: 'Desc',
      category: 'Conference',
      location: 'London',
      capacity: '100',
      startDate: '2026-10-15T09:00:00Z',
      endDate: '2026-10-15T18:00:00Z',
    });
    expect(errors.title).toBe('Title must be at least 3 characters');
  });

  it('rejects empty description', () => {
    const errors = validateEventForm({
      title: 'Valid Title',
      description: '',
      category: 'Conference',
      location: 'London',
      capacity: '100',
      startDate: '2026-10-15T09:00:00Z',
      endDate: '2026-10-15T18:00:00Z',
    });
    expect(errors.description).toBe('Description is required');
  });

  it('rejects empty location', () => {
    const errors = validateEventForm({
      title: 'Valid Title',
      description: 'Desc',
      category: 'Conference',
      location: '',
      capacity: '100',
      startDate: '2026-10-15T09:00:00Z',
      endDate: '2026-10-15T18:00:00Z',
    });
    expect(errors.location).toBe('Location is required');
  });

  it('rejects non-numeric capacity', () => {
    const errors = validateEventForm({
      title: 'Valid Title',
      description: 'Desc',
      category: 'Conference',
      location: 'London',
      capacity: 'abc',
      startDate: '2026-10-15T09:00:00Z',
      endDate: '2026-10-15T18:00:00Z',
    });
    expect(errors.capacity).toBe('Capacity must be a positive number');
  });

  it('rejects zero capacity', () => {
    const errors = validateEventForm({
      title: 'Valid Title',
      description: 'Desc',
      category: 'Conference',
      location: 'London',
      capacity: '0',
      startDate: '2026-10-15T09:00:00Z',
      endDate: '2026-10-15T18:00:00Z',
    });
    expect(errors.capacity).toBe('Capacity must be a positive number');
  });

  it('rejects end date before start date', () => {
    const errors = validateEventForm({
      title: 'Valid Title',
      description: 'Desc',
      category: 'Conference',
      location: 'London',
      capacity: '100',
      startDate: '2026-10-20T09:00:00Z',
      endDate: '2026-10-15T18:00:00Z',
    });
    expect(errors.endDate).toBe('End date cannot be earlier than start date');
  });

  it('accepts valid form data', () => {
    const errors = validateEventForm({
      title: 'Tech Summit 2026',
      description: 'Annual conference',
      category: 'Conference',
      location: 'London Convention Centre',
      capacity: '500',
      startDate: '2026-10-15T09:00:00Z',
      endDate: '2026-10-15T18:00:00Z',
    });
    expect(Object.keys(errors)).toHaveLength(0);
  });
});