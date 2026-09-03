import { Schema } from 'effect';

// ---------------------------------------------------------------------------
// Event Schemas
// ---------------------------------------------------------------------------
export const EventStatusSchema = Schema.Literal(
  'draft',
  'published',
  'in_progress',
  'completed',
  'cancelled'
);

export const EventSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  description: Schema.optional(Schema.String),
  startDate: Schema.String,
  endDate: Schema.String,
  location: Schema.optional(Schema.String),
  status: EventStatusSchema,
  tenantId: Schema.String,
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export type EventModel = Schema.Schema.Type<typeof EventSchema>;

export const CreateEventSchema = Schema.Struct({
  title: Schema.String.pipe(Schema.minLength(1)),
  description: Schema.optional(Schema.String),
  startDate: Schema.String.pipe(Schema.minLength(1)),
  endDate: Schema.String.pipe(Schema.minLength(1)),
  location: Schema.optional(Schema.String),
  status: Schema.optionalWith(EventStatusSchema, { default: () => 'draft' as const }),
});

export type CreateEvent = Schema.Schema.Type<typeof CreateEventSchema>;

export const UpdateEventSchema = Schema.partial(
  Schema.Struct({
    title: Schema.String.pipe(Schema.minLength(1)),
    description: Schema.String,
    startDate: Schema.String,
    endDate: Schema.String,
    location: Schema.String,
    status: EventStatusSchema,
  })
);

export type UpdateEvent = Schema.Schema.Type<typeof UpdateEventSchema>;

export const EventListResponseSchema = Schema.Struct({
  data: Schema.Array(EventSchema),
  total: Schema.Number,
  page: Schema.Number,
  limit: Schema.Number,
});

// ---------------------------------------------------------------------------
// Tenant Schemas
// ---------------------------------------------------------------------------
export const TenantStatusSchema = Schema.Literal('active', 'inactive', 'suspended');

export const TenantSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  slug: Schema.String,
  status: TenantStatusSchema,
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export type TenantModel = Schema.Schema.Type<typeof TenantSchema>;

export const CreateTenantSchema = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(1)),
  slug: Schema.String.pipe(Schema.minLength(1)),
  status: Schema.optionalWith(TenantStatusSchema, { default: () => 'active' as const }),
});

export type CreateTenant = Schema.Schema.Type<typeof CreateTenantSchema>;

export const UpdateTenantSchema = Schema.partial(
  Schema.Struct({
    name: Schema.String.pipe(Schema.minLength(1)),
    slug: Schema.String.pipe(Schema.minLength(1)),
    status: TenantStatusSchema,
  })
);

export type UpdateTenant = Schema.Schema.Type<typeof UpdateTenantSchema>;

export const TenantListResponseSchema = Schema.Struct({
  data: Schema.Array(TenantSchema),
  total: Schema.Number,
  page: Schema.Number,
  limit: Schema.Number,
});

// ---------------------------------------------------------------------------
// Staff Schemas
// ---------------------------------------------------------------------------
export const StaffRoleSchema = Schema.Literal(
  'admin',
  'manager',
  'coordinator',
  'crew',
  'viewer'
);

export const StaffSchema = Schema.Struct({
  id: Schema.String,
  email: Schema.String,
  name: Schema.String,
  role: StaffRoleSchema,
  tenantId: Schema.String,
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export type StaffModel = Schema.Schema.Type<typeof StaffSchema>;

export const CreateStaffSchema = Schema.Struct({
  email: Schema.String.pipe(Schema.minLength(3)),
  name: Schema.String.pipe(Schema.minLength(1)),
  role: Schema.optionalWith(StaffRoleSchema, { default: () => 'crew' as const }),
});

export type CreateStaff = Schema.Schema.Type<typeof CreateStaffSchema>;

export const UpdateStaffSchema = Schema.partial(
  Schema.Struct({
    email: Schema.String.pipe(Schema.minLength(3)),
    name: Schema.String.pipe(Schema.minLength(1)),
    role: StaffRoleSchema,
  })
);

export type UpdateStaff = Schema.Schema.Type<typeof UpdateStaffSchema>;

export const StaffListResponseSchema = Schema.Struct({
  data: Schema.Array(StaffSchema),
  total: Schema.Number,
  page: Schema.Number,
  limit: Schema.Number,
});

// ---------------------------------------------------------------------------
// Resource Schemas
// ---------------------------------------------------------------------------
export const ResourceCategorySchema = Schema.Literal(
  'audio',
  'lighting',
  'video',
  'staging',
  'catering',
  'transport',
  'other'
);

export const ResourceSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  category: ResourceCategorySchema,
  quantity: Schema.Number,
  status: Schema.Literal('available', 'in_use', 'maintenance', 'retired'),
  tenantId: Schema.String,
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export type ResourceModel = Schema.Schema.Type<typeof ResourceSchema>;

export const CreateResourceSchema = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(1)),
  category: ResourceCategorySchema,
  quantity: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
  status: Schema.optionalWith(
    Schema.Literal('available', 'in_use', 'maintenance', 'retired'),
    { default: () => 'available' as const }
  ),
});

export type CreateResource = Schema.Schema.Type<typeof CreateResourceSchema>;

export const UpdateResourceSchema = Schema.partial(
  Schema.Struct({
    name: Schema.String.pipe(Schema.minLength(1)),
    category: ResourceCategorySchema,
    quantity: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
    status: Schema.Literal('available', 'in_use', 'maintenance', 'retired'),
  })
);

export type UpdateResource = Schema.Schema.Type<typeof UpdateResourceSchema>;

export const ResourceListResponseSchema = Schema.Struct({
  data: Schema.Array(ResourceSchema),
  total: Schema.Number,
  page: Schema.Number,
  limit: Schema.Number,
});

// ---------------------------------------------------------------------------
// Booking Schemas
// ---------------------------------------------------------------------------
export const BookingStatusSchema = Schema.Literal(
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled'
);

export const BookingSchema = Schema.Struct({
  id: Schema.String,
  eventId: Schema.String,
  resourceId: Schema.String,
  quantity: Schema.Number,
  status: BookingStatusSchema,
  tenantId: Schema.String,
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export type BookingModel = Schema.Schema.Type<typeof BookingSchema>;

export const CreateBookingSchema = Schema.Struct({
  eventId: Schema.String.pipe(Schema.minLength(1)),
  resourceId: Schema.String.pipe(Schema.minLength(1)),
  quantity: Schema.Number.pipe(Schema.greaterThan(0)),
  status: Schema.optionalWith(BookingStatusSchema, { default: () => 'pending' as const }),
});

export type CreateBooking = Schema.Schema.Type<typeof CreateBookingSchema>;

export const UpdateBookingSchema = Schema.partial(
  Schema.Struct({
    eventId: Schema.String,
    resourceId: Schema.String,
    quantity: Schema.Number.pipe(Schema.greaterThan(0)),
    status: BookingStatusSchema,
  })
);

export type UpdateBooking = Schema.Schema.Type<typeof UpdateBookingSchema>;

export const BookingListResponseSchema = Schema.Struct({
  data: Schema.Array(BookingSchema),
  total: Schema.Number,
  page: Schema.Number,
  limit: Schema.Number,
});
