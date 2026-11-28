import { Vendor, VendorCategory } from '../types/vendor';

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vd-1',
    name: 'Savory Delights Catering',
    category: 'catering',
    description: 'Award-winning corporate and event catering with locally-sourced seasonal menus.',
    contactName: 'Chef Marcus Webb',
    contactEmail: 'marcus@savorydelights.co.uk',
    contactPhone: '+44 20 7123 4567',
    address: '15 Food Market Lane, London SE1 9AA',
    website: 'https://savorydelights.co.uk',
    rating: 4.9,
    reviewCount: 127,
    status: 'active',
    tags: ['Corporate', 'Weddings', 'Dietary Requirements', 'Canapés'],
  },
  {
    id: 'vd-2',
    name: 'ProSound AV Solutions',
    category: 'audio-visual',
    description: 'Full-service AV production for conferences, hybrid events, and live streaming.',
    contactName: 'Sarah Chen',
    contactEmail: 'sarah@prosoundav.co.uk',
    contactPhone: '+44 161 888 3344',
    address: '22 Media Park, Manchester M15 6FH',
    website: 'https://prosoundav.co.uk',
    rating: 4.8,
    reviewCount: 89,
    status: 'active',
    tags: ['Live Streaming', 'Video Conferencing', 'LED Walls', 'Recording'],
  },
  {
    id: 'vd-3',
    name: 'Lens & Light Photography',
    category: 'photography',
    description: 'Professional event photography and videography with same-day delivery options.',
    contactName: 'James Thornton',
    contactEmail: 'james@lenslight.co.uk',
    contactPhone: '+44 131 229 7788',
    address: '8 Creative Quarter, Edinburgh EH3 9BP',
    website: 'https://lenslight.co.uk',
    rating: 4.7,
    reviewCount: 64,
    status: 'active',
    tags: ['Corporate Headshots', 'Event Coverage', 'Drone Footage', 'Photo Booth'],
  },
  {
    id: 'vd-4',
    name: 'Bloom & Vine Florals',
    category: 'florist',
    description: 'Bespoke floral design for corporate events, galas, and product launches.',
    contactName: 'Isabel Moreno',
    contactEmail: 'isabel@bloomvine.co.uk',
    contactPhone: '+44 121 444 5566',
    address: '34 Jewellery Quarter, Birmingham B3 1UP',
    website: 'https://bloomvine.co.uk',
    rating: 4.9,
    reviewCount: 112,
    status: 'active',
    tags: ['Large Scale', 'Sustainable', 'Seasonal', 'Installation'],
  },
  {
    id: 'vd-5',
    name: 'Executive Chauffeur Services',
    category: 'transport',
    description: 'Premium chauffeur fleet for VIP transfers, airport runs, and event shuttles.',
    contactName: 'David Okonkwo',
    contactEmail: 'david@execcars.co.uk',
    contactPhone: '+44 117 333 2211',
    address: '5 Harbourside, Bristol BS1 4TP',
    website: 'https://execcars.co.uk',
    rating: 4.6,
    reviewCount: 78,
    status: 'active',
    tags: ['EV Fleet', 'VIP', 'Airport Transfers', 'Group Shuttles'],
  },
  {
    id: 'vd-6',
    name: 'StageRight Entertainment',
    category: 'entertainment',
    description: 'Live bands, DJs, and specialty acts for corporate events and private functions.',
    contactName: 'Rita Singh',
    contactEmail: 'rita@stageright.co.uk',
    contactPhone: '+44 20 7777 8899',
    address: '12 Entertainment Row, London WC2H 9JQ',
    website: 'https://stageright.co.uk',
    rating: 4.8,
    reviewCount: 95,
    status: 'active',
    tags: ['Bands', 'DJs', 'Circus Acts', 'Interactive'],
  },
  {
    id: 'vd-7',
    name: 'Elegant Events Decor',
    category: 'decoration',
    description: 'Full event styling, theming, and decor rental with in-house fabrication.',
    contactName: 'Pierre Dubois',
    contactEmail: 'pierre@elegantdecor.co.uk',
    contactPhone: '+44 161 999 0011',
    address: '40 Design District, Manchester M4 1LX',
    website: 'https://elegantdecor.co.uk',
    rating: 4.7,
    reviewCount: 56,
    status: 'pending',
    tags: ['Theming', 'Fabrication', 'Lighting Design', 'Props'],
  },
  {
    id: 'vd-8',
    name: 'SecureGuard Event Security',
    category: 'security',
    description: 'SIA-licensed security personnel for crowd management, VIP protection, and asset security.',
    contactName: 'Commander Alan Price',
    contactEmail: 'alan@secureguard.co.uk',
    contactPhone: '+44 131 666 7788',
    address: '3 Security House, Edinburgh EH12 5DT',
    website: 'https://secureguard.co.uk',
    rating: 4.5,
    reviewCount: 43,
    status: 'active',
    tags: ['Crowd Control', 'VIP Protection', 'Asset Security', 'Risk Assessment'],
  },
];

class VendorsApiService {
  private vendors: Vendor[] = [...INITIAL_VENDORS];

  async getVendors(): Promise<Vendor[]> {
    return Promise.resolve([...this.vendors]);
  }

  async getVendorById(id: string): Promise<Vendor | null> {
    const found = this.vendors.find((v) => v.id === id);
    return Promise.resolve(found ? { ...found } : null);
  }

  async createVendor(vendorData: Omit<Vendor, 'id'>): Promise<Vendor> {
    const newVendor: Vendor = { ...vendorData, id: `vd-${Date.now()}` };
    this.vendors.push(newVendor);
    return Promise.resolve(newVendor);
  }

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor> {
    const index = this.vendors.findIndex((v) => v.id === id);
    if (index === -1) throw new Error(`Vendor with id ${id} not found`);
    this.vendors[index] = { ...this.vendors[index], ...updates };
    return Promise.resolve(this.vendors[index]);
  }

  async getVendorsByCategory(category: VendorCategory): Promise<Vendor[]> {
    return Promise.resolve(this.vendors.filter((v) => v.category === category));
  }

  async searchVendors(query: string): Promise<Vendor[]> {
    const q = query.toLowerCase();
    return Promise.resolve(
      this.vendors.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    );
  }
}

export const vendorsApi = new VendorsApiService();