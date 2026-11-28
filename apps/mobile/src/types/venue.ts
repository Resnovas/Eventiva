export type VenueStatus = 'available' | 'reserved' | 'maintenance';

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  description: string;
  amenities: string[];
  contactEmail: string;
  contactPhone: string;
  imageUrl?: string;
  status: VenueStatus;
  hourlyRate?: number;
  currency: string;
}
