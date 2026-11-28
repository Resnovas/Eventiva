import { Venue } from '../types/venue';

export const INITIAL_VENUES: Venue[] = [
  {
    id: 'vn-1',
    name: 'Grand Ballroom London',
    address: '100 Pall Mall',
    city: 'London',
    capacity: 500,
    description: 'Historic venue with crystal chandeliers and marble floors, perfect for gala dinners and corporate events.',
    amenities: ['WiFi', 'AV Equipment', 'Catering Kitchen', 'Stage', 'Parking', 'Wheelchair Accessible'],
    contactEmail: 'events@grandballroom.co.uk',
    contactPhone: '+44 20 7930 1234',
    status: 'available',
    hourlyRate: 850,
    currency: 'GBP',
  },
  {
    id: 'vn-2',
    name: 'Tech Hub Manchester',
    address: '50 Deansgate',
    city: 'Manchester',
    capacity: 300,
    description: 'Modern conference center with cutting-edge AV and flexible room configurations.',
    amenities: ['High-speed WiFi', 'Video Conferencing', 'Modular Seating', 'Recording Studio', 'Breakout Rooms', 'Catering'],
    contactEmail: 'bookings@techhubmcr.co.uk',
    contactPhone: '+44 161 228 5678',
    status: 'available',
    hourlyRate: 420,
    currency: 'GBP',
  },
  {
    id: 'vn-3',
    name: 'Riverside Events Edinburgh',
    address: '12 Riverside Drive',
    city: 'Edinburgh',
    capacity: 200,
    description: 'Scenic riverside venue with panoramic views of the castle, ideal for intimate gatherings.',
    amenities: ['Castle Views', 'Outdoor Terrace', 'In-house Catering', 'Sound System', 'Lighting', 'Disabled Access'],
    contactEmail: 'info@riversidevents.scot',
    contactPhone: '+44 131 555 0199',
    status: 'reserved',
    hourlyRate: 380,
    currency: 'GBP',
  },
  {
    id: 'vn-4',
    name: 'Birmingham ICC',
    address: 'Broad Street',
    city: 'Birmingham',
    capacity: 1000,
    description: 'International Convention Centre with multiple halls, exhibition space, and full production capabilities.',
    amenities: ['Multiple Halls', 'Exhibition Space', 'Rigging Points', 'Simultaneous Translation', 'Hybrid Event Ready', 'On-site Parking'],
    contactEmail: 'sales@icc.co.uk',
    contactPhone: '+44 121 222 5000',
    status: 'available',
    hourlyRate: 1200,
    currency: 'GBP',
  },
  {
    id: 'vn-5',
    name: 'The Glasshouse Bristol',
    address: '2 Canon Road',
    city: 'Bristol',
    capacity: 150,
    description: 'Contemporary glass-walled venue with harbourside location, perfect for creative and tech events.',
    amenities: ['Harbour Views', 'Natural Light', 'Green Room', 'Streaming Ready', 'Sustainable Catering', 'Bike Storage'],
    contactEmail: 'hello@glasshousebristol.co.uk',
    contactPhone: '+44 117 900 1122',
    status: 'available',
    hourlyRate: 290,
    currency: 'GBP',
  },
];

class VenuesApiService {
  private venues: Venue[] = [...INITIAL_VENUES];

  async getVenues(): Promise<Venue[]> {
    return Promise.resolve([...this.venues]);
  }

  async getVenueById(id: string): Promise<Venue | null> {
    const found = this.venues.find((v) => v.id === id);
    return Promise.resolve(found ? { ...found } : null);
  }

  async createVenue(venueData: Omit<Venue, 'id'>): Promise<Venue> {
    const newVenue: Venue = { ...venueData, id: `vn-${Date.now()}` };
    this.venues.push(newVenue);
    return Promise.resolve(newVenue);
  }

  async updateVenue(id: string, updates: Partial<Venue>): Promise<Venue> {
    const index = this.venues.findIndex((v) => v.id === id);
    if (index === -1) throw new Error(`Venue with id ${id} not found`);
    this.venues[index] = { ...this.venues[index], ...updates };
    return Promise.resolve(this.venues[index]);
  }

  async searchVenues(query: string): Promise<Venue[]> {
    const q = query.toLowerCase();
    return Promise.resolve(
      this.venues.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q)
      )
    );
  }
}

export const venuesApi = new VenuesApiService();