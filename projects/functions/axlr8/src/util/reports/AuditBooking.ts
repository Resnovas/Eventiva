export enum AuditDetails {
    "Audit Item Name" = "AUDIT_META_USER_NAME",
    "Audit Key" = "AUDIT_KEY",
    "Browser" = "AUDIT_BROWSER",
    "Change Date" = "AUDIT_CHANGE_DATE",
    "Change Type" = "AUDIT_CHANGE_TYPE",
    "Change User" = "AUDIT_USER",
    "Meta Object" = "AUDIT_META_OBJECT",
    "Meta Object Key" = "AUDIT_META_OBJECT_KEY",
    "Meta Object Prop" = "AUDIT_META_OBJECT_PROP",
    "New Value" = "AUDIT_NEW_VALUE",
    "Old Value" = "AUDIT_OLD_VALUE",
}

export enum BookingData { 
    "Booking Created Date" = "AUDIT_BOOKING_CREATED_DATE",
    "Booking ID" = "AUDIT_BOOKING_KEY",
    "Contact ID" = "AUDIT_BOOKING_CONT_KEY",
    "Full Name" = "AUDIT_BOOKING_FULLNAME",
    "Session ID" = "_BOOKING_SESSION_ID",
    "Shift Date" = "AUDIT_BOOKING_START_DATE"
}

export enum EventDetails {
    "Event ID" = "AUDIT_EVENT_ID",
    "Venue" = "AUDIT_EVENT_NAME"
}

export enum SessionDetails {
    "Sess ID" = "AUDIT_SESSION_ID",
    "Shift Name" = "AUDIT_BOOKING_SESSION_NAME"
}

export type AuditBooking = AuditDetails | BookingData | EventDetails | SessionDetails;

export default AuditBooking;