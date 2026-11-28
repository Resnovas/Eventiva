/**
 * Domain enums for Eventiva.
 * Every enum maps to a string literal union for JSON safety.
 */
import * as Schema from 'effect/Schema';

// ─── Event lifecycle ───
export const EventStatus = {
  Draft: 'draft',
  Published: 'published',
  Cancelled: 'cancelled',
  Completed: 'completed',
} as const;
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];
export const EventStatusSchema = Schema.Enums(EventStatus);

// ─── Venue availability ───
export const VenueStatus = {
  Available: 'available',
  Booked: 'booked',
  Maintenance: 'maintenance',
  Inactive: 'inactive',
} as const;
export type VenueStatus = (typeof VenueStatus)[keyof typeof VenueStatus];
export const VenueStatusSchema = Schema.Enums(VenueStatus);

// ─── Vendor classification ───
export const VendorCategory = {
  Catering: 'catering',
  Equipment: 'equipment',
  Security: 'security',
  Entertainment: 'entertainment',
  Staffing: 'staffing',
  Logistics: 'logistics',
  AV: 'av',
  Other: 'other',
} as const;
export type VendorCategory = (typeof VendorCategory)[keyof typeof VendorCategory];
export const VendorCategorySchema = Schema.Enums(VendorCategory);
