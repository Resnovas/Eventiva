import { Event, ScheduleItem, CalendarExportResult } from '../types/event';

export interface CalendarService {
  requestPermissions(): Promise<{ granted: boolean; platform: string }>;
  exportEventToNativeCalendar(event: Event): Promise<CalendarExportResult>;
  syncScheduleToNativeCalendar(event: Event, schedule: ScheduleItem[]): Promise<{
    syncedCount: number;
    errors: string[];
  }>;
}

export class NativeCalendarIntegration implements CalendarService {
  private platformOS: 'ios' | 'android' | 'web' | 'other';

  constructor(platformOS?: 'ios' | 'android' | 'web' | 'other') {
    this.platformOS = platformOS || 'ios'; // Default or guarded
  }

  async requestPermissions(): Promise<{ granted: boolean; platform: string }> {
    if (this.platformOS === 'ios') {
      // iOS EventKit permission request mock bridge
      return { granted: true, platform: 'ios' };
    } else if (this.platformOS === 'android') {
      // Android Calendar Contract permission request mock bridge
      return { granted: true, platform: 'android' };
    }
    return { granted: true, platform: this.platformOS };
  }

  async exportEventToNativeCalendar(event: Event): Promise<CalendarExportResult> {
    const perm = await this.requestPermissions();
    if (!perm.granted) {
      return {
        success: false,
        error: 'Calendar permission denied by user',
      };
    }

    if (!event.title || !event.startDate) {
      return {
        success: false,
        error: 'Invalid event data: title and startDate are required',
      };
    }

    // Platform-specific ID prefix
    const prefix = this.platformOS === 'ios' ? 'EKEvent' : 'AndroidCal';
    const nativeEventId = `${prefix}-${event.id}-${Date.now()}`;

    return {
      success: true,
      calendarId: 'primary-default-calendar',
      nativeEventId,
    };
  }

  async syncScheduleToNativeCalendar(
    event: Event,
    schedule: ScheduleItem[]
  ): Promise<{ syncedCount: number; errors: string[] }> {
    const perm = await this.requestPermissions();
    if (!perm.granted) {
      return { syncedCount: 0, errors: ['Permission denied'] };
    }

    const errors: string[] = [];
    let syncedCount = 0;

    for (const item of schedule) {
      try {
        if (!item.title || !item.startTime || !item.endTime) {
          errors.push(`Invalid schedule item: ${item.id}`);
          continue;
        }
        syncedCount++;
      } catch (err: any) {
        errors.push(err?.message || `Failed to sync schedule item ${item.id}`);
      }
    }

    return { syncedCount, errors };
  }
}

export const calendarService = new NativeCalendarIntegration();
