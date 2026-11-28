import { describe, it, expect } from 'vitest';
import { NativeCalendarIntegration } from '../services/calendarIntegration.js';
import { Event } from '../types/event.js';

describe('NativeCalendarIntegration Service', () => {
  it('handles iOS permission and export', async () => {
    const iosCalendar = new NativeCalendarIntegration('ios');
    const perm = await iosCalendar.requestPermissions();
    expect(perm.granted).toBe(true);
    expect(perm.platform).toBe('ios');

    const sampleEvent: Event = {
      id: 'evt-ios-1',
      title: 'iOS Event',
      description: 'Test event for iOS calendar sync',
      category: 'Conference',
      startDate: '2026-10-15T09:00:00Z',
      endDate: '2026-10-15T18:00:00Z',
      location: 'London',
      status: 'scheduled',
      capacity: 100,
      registeredCount: 10,
    };

    const res = await iosCalendar.exportEventToNativeCalendar(sampleEvent);
    expect(res.success).toBe(true);
    expect(res.nativeEventId).toContain('EKEvent-evt-ios-1');
  });

  it('handles Android permission and export', async () => {
    const androidCalendar = new NativeCalendarIntegration('android');
    const perm = await androidCalendar.requestPermissions();
    expect(perm.granted).toBe(true);
    expect(perm.platform).toBe('android');

    const sampleEvent: Event = {
      id: 'evt-android-1',
      title: 'Android Event',
      description: 'Test event for Android calendar sync',
      category: 'Conference',
      startDate: '2026-10-15T09:00:00Z',
      endDate: '2026-10-15T18:00:00Z',
      location: 'London',
      status: 'scheduled',
      capacity: 100,
      registeredCount: 10,
    };

    const res = await androidCalendar.exportEventToNativeCalendar(sampleEvent);
    expect(res.success).toBe(true);
    expect(res.nativeEventId).toContain('AndroidCal-evt-android-1');
  });

  it('rejects invalid event data missing title or startDate', async () => {
    const calendar = new NativeCalendarIntegration('ios');
    const invalidEvent = {
      id: 'evt-invalid',
      description: 'No title',
    } as Event;

    const res = await calendar.exportEventToNativeCalendar(invalidEvent);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
