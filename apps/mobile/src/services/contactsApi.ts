import { Contact } from '../types/event';

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'cnt-1',
    name: 'Jordan Smith',
    email: 'jordan@eventiva.co.uk',
    phone: '+44 7700 900077',
    role: 'Lead Event Manager',
    company: 'Eventiva Ltd',
    tags: ['Organizer', 'VIP'],
    notes: 'Primary contact for Tech Summit 2026.',
  },
  {
    id: 'cnt-2',
    name: 'Cortex (Founding Engineer)',
    email: 'cortex@eventiva.co.uk',
    phone: '+44 7700 900088',
    role: 'Tech Lead',
    company: 'Eventiva Systems',
    tags: ['Engineering', 'Speaker'],
    notes: 'Manages core architecture.',
  },
  {
    id: 'cnt-3',
    name: 'Eleanor Vance',
    email: 'eleanor@grandballroom.co.uk',
    phone: '+44 7700 900099',
    role: 'Venue Coordinator',
    company: 'Grand Ballroom London',
    tags: ['Venue', 'Supplier'],
    notes: 'Handles catering and venue setup.',
  },
];

class ContactsApiService {
  private contacts: Contact[] = [...INITIAL_CONTACTS];

  async getContacts(): Promise<Contact[]> {
    return Promise.resolve([...this.contacts]);
  }

  async getContactById(id: string): Promise<Contact | null> {
    const found = this.contacts.find((c) => c.id === id);
    return Promise.resolve(found ? { ...found } : null);
  }

  async createContact(contactData: Omit<Contact, 'id'>): Promise<Contact> {
    const newContact: Contact = {
      ...contactData,
      id: `cnt-${Date.now()}`,
    };
    this.contacts.push(newContact);
    return Promise.resolve(newContact);
  }
}

export const contactsApi = new ContactsApiService();
