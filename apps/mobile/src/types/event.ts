export type EventStatus = 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface ScheduleItem {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  speaker?: string;
  location?: string;
  orderIndex: number;
  category?: 'keynote' | 'workshop' | 'break' | 'networking' | 'panel';
  isDraggable?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  company: string;
  avatarUrl?: string;
  tags: string[];
  notes?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  location: string;
  status: EventStatus;
  capacity: number;
  registeredCount: number;
  imageUri?: string;
  contacts?: Contact[];
  schedule?: ScheduleItem[];
}

export type ViewMode = 'month' | 'week' | 'day';

export interface CalendarExportResult {
  success: boolean;
  calendarId?: string;
  nativeEventId?: string;
  error?: string;
}
