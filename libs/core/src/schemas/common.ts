import { Schema } from "effect"
import * as Branded from "../types/branded.js"
import { EventStatus, VenueStatus, VendorCategory } from "../types/enums.js"

export const TenantId = Schema.UUID.pipe(
  Schema.fromBrand(Branded.TenantId)
)

export const EntityId = Schema.UUID.pipe(
  Schema.fromBrand(Branded.EntityId)
)

export const EmailAddress = Schema.String.pipe(
  Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: () => "Invalid email address" }),
  Schema.fromBrand(Branded.EmailAddress)
)

export const PhoneNumber = Schema.String.pipe(
  Schema.pattern(/^\+?[1-9]\d{1,14}$/, { message: () => "Invalid phone number" }),
  Schema.fromBrand(Branded.PhoneNumber)
)

export const CurrencyAmount = Schema.Number.pipe(
  Schema.nonNegative({ message: () => "Amount cannot be negative" }),
  Schema.fromBrand(Branded.CurrencyAmount)
)

export const DateTime = Schema.String.pipe(
  Schema.filter(
    (s) => !isNaN(Date.parse(s)) ? undefined : "Invalid datetime",
    { message: () => "Invalid datetime" }
  ),
  Schema.fromBrand(Branded.DateTime)
)

export const EventStatusSchema = Schema.Enums(EventStatus)
export const VenueStatusSchema = Schema.Enums(VenueStatus)
export const VendorCategorySchema = Schema.Enums(VendorCategory)
