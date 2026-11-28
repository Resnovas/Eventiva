import { Event, ScheduleItem } from '../types/event';

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-1',
    title: 'Eventiva Tech Summit 2026',
    description: 'Annual technology conference focused on full-stack event infrastructure and real-time collaboration.',
    category: 'Conference',
    startDate: '2026-10-15T09:00:00Z',
    endDate: '2026-10-15T18:00:00Z',
    location: 'London Convention Centre, UK',
    status: 'scheduled',
    capacity: 500,
    registeredCount: 342,
    contacts: [
      {
        id: 'cnt-1',
        name: 'Jordan Smith',
        email: 'jordan@eventiva.co.uk',
        phone: '+44 7700 900077',
        role: 'Lead Event Manager',
        company: 'Eventiva Ltd',
        tags: ['Organizer', 'VIP'],
      },
    ],
    schedule: [
      {
        id: 'sch-1',
        eventId: 'evt-1',
        title: 'Opening Keynote: Next-Gen Event Tech',
        description: 'Keynote speech introducing real-time cluster coordination.',
        startTime: '2026-10-15T09:30:00Z',
        endTime: '2026-10-15T10:30:00Z',
        speaker: 'Alex Rivera',
        location: 'Main Auditorium',
        orderIndex: 0,
        category: 'keynote',
        isDraggable: true,
      },
      {
        id: 'sch-2',
        eventId: 'evt-1',
        title: 'Workshop: React Native & Expo Mobile Optimization',
        description: 'Hands-on session on mobile component architecture.',
        startTime: '2026-10-15T11:00:00Z',
        endTime: '2026-10-15T12:30:00Z',
        speaker: 'Pixel',
        location: 'Workshop Room B',
        orderIndex: 1,
        category: 'workshop',
        isDraggable: true,
      },
      {
        id: 'sch-3',
        eventId: 'evt-1',
        title: 'Networking Lunch',
        description: 'Catered lunch & partner exhibition.',
        startTime: '2026-10-15T12:30:00Z',
        endTime: '2026-10-15T13:30:00Z',
        location: 'Exhibition Hall',
        orderIndex: 2,
        category: 'networking',
        isDraggable: true,
      },
    ],
  },
  {
    id: 'evt-2',
    title: 'Gala Dinner & Awards Night',
    description: 'Celebrating top event planners and suppliers across Europe.',
    category: 'Gala',
    startDate: '2026-11-20T19:00:00Z',
    endDate: '2026-11-20T23:00:00Z',
    location: 'The Grand Ballroom, London',
    status: 'draft',
    capacity: 250,
    registeredCount: 180,
    schedule: [
      {
        id: 'sch-4',
        eventId: 'evt-2',
        title: 'Welcome Drinks & Red Carpet',
        startTime: '2026-11-20T19:00:00Z',
        endTime: '2026-11-20T20:00:00Z',
        orderIndex: 0,
        category: 'networking',
        isDraggable: true,
      },
    ],
  },
];

class EventsApiService {
  private events: Event[] = [...INITIAL_EVENTS];

  async getEvents(): Promise<Event[]> {
    return new Promise((resolve) => resolve([...this.events]));
  }

  async getEventById(id: string): Promise<Event | null> {
    const found = this.events.find((e) => e.id === id);
    return Promise.resolve(found ? { ...found } : null);
  }

  async createEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
    const newEvent: Event = {
      ...eventData,
      id: `evt-${Date.now()}`,
      registeredCount: eventData.registeredCount || 0,
      schedule: eventData.schedule || [],
      contacts: eventData.contacts || [],
    };
    this.events.push(newEvent);
    return Promise.resolve(newEvent);
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Event with id ${id} not found`);
    }
    const updated = { ...this.events[index], ...updates };
    this.events[index] = updated;
    return Promise.resolve(updated);
  }

  async reorderSchedule(eventId: string, newSchedule: ScheduleItem[]): Promise<ScheduleItem[]> {
    const eventIndex = this.events.findIndex((e) => e.id === eventId);
    if (eventIndex !== -1) {
      const reindexed = newSchedule.map((item, idx) => ({
        ...item,
        orderIndex: idx,
      }));
      this.events[eventIndex].schedule = reindexed;
      return Promise.resolve(reindexed);
    }
    return Promise.resolve(newSchedule);
  }
}

export const eventsApi = new EventsApiService();
