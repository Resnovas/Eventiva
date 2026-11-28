export type VendorCategory =
  | 'catering'
  | 'audio-visual'
  | 'photography'
  | 'florist'
  | 'transport'
  | 'entertainment'
  | 'decoration'
  | 'security'
  | 'other';

export type VendorStatus = 'active' | 'inactive' | 'pending';

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  website?: string;
  rating: number;
  reviewCount: number;
  status: VendorStatus;
  tags: string[];
}
