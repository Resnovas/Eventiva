import Common from "./common";

export enum EventDetails {
    "Account Manager" = "ES_SUMM_EVENT_OWNER_EMP",
    "Event Code" = "ES_SUMM_EVENT_CODE",
    "Event Date" = "ES_SUMM_EVENT_DATE",
    "Event ID" = "ES_SUMM_EVENT_ID",
    "Line of Business" = "EMP_SUMM_LOB",
    "Select Venue" = "ES_EVENT_VENUE",
    "Uniform" = "ES_SUMM_EVENT_TYPE",
    "Venue Name" = "ES_SUMM_EVENT_VENUE_ORG",
    "Venue" = "ES_SUMM_EVENT_NAME"
}

export enum Client {
    "Account Manager" = "ES_SUMM_CLIENT_ACCOUNT_MANAGER",
    "Account Number" = "ES_SUMM_ORG_ALPHA",
    "Client Type" = "ES_SUMM_ORG_TYPE",
    "Client" = "ES_SUMM_EVENT_ORG"
}

export enum SessionDetails {
    "Booking" = "ES_SUMM_BOOKED_ON",
    "Custom Field 1" = "ES_SUMM_SESSION_CUSTOM_FIELD_1",
    "Custom Field 2" = "ES_SUMM_SESSION_CUSTOM_FIELD_2",
    "Custom Field 3" = "ES_SUMM_SESSION_CUSTOM_FIELD_3",
    "Custom Field 4" = "ES_SUMM_SESSION_CUSTOM_FIELD_4",
    "Custom Field 5" = "ES_SUMM_SESSION_CUSTOM_FIELD_5",
    "Customer Id" = "ES_SUMM_SITE_CUSTOMER_ID",
    "Hours" = "ES_SUMM_DURATION",
    "No. Confirmed" = "ES_SUMM_NO_CONFIRMED",
    "No. Prov List" = "ES_SUMM_PROV_COUNT",
    "No. Required" = "ES_SUMM_SESSION_NUMBER_REQ",
    "No. Waiting" = "ES_SUMM_WAIT_COUNT",
    "Number still required" = "ES_SUMM_SESSION_NUMBER_STAFF_STILL_REQUIRED",
    "Sess Id" = "ES_SUMM_ID",
    "Session Id" = "ES_SUMM_SESSION_ID",
    "Session Objectives" = "ES_SUMM_OBJECTIVES",
    "Session Period" = "ES_SESSION_PERIOD",
    "Session Postcode" = "ES_SUMM_SESSION_POSTCODE_ONLY",
    "Session Type" = "ES_SUMM_SESSION_TYPE",
    "Shift Address" = "ES_SUMM_SESSION_ADDRESS",
    "Shift Date" = "ES_SUMM_SESSION_START_DATE",
    "Shift Name" = "ES_SUMM_SESSION",
    "Shift Status" = "ES_SUMM_SESSION",
    "Synopsis" = "ES_SUMM_SYNOPSIS",
    "Venue" = "ES_SUMM_SESS_VENUE"
}

export enum RoleDetails {
    "Available role" = "ES_SUMM_AVAIL_ROLE",
    "Client Hourly Rate" = "ES_SUMM_SESSION_ROLE_RATE",
    "Roles Assigned" = "ES_SUMM_ROLE_ASSIGNED",
    "Roles Confirmed" = "ES_SUMM_ROLE_CONFIRMED",
    "Role day rate" = "ES_SUMM_SESSION_ROLE_DAY_RATE",
    "Role end time" = "ES_SUMM_SESSION_ROLE_END_TIME",
    "Role not filled" = "ES_SUMM_ROLE_NOT_FILLED",
    "Role Req" = "ES_SUMM_ROLE_REQUIRED",
    "Role Start Time" = "ES_SUMM_SESSION_ROLE_START_TIME",
    "Staff Rate" = "ES_SUMM_RATE",
    "Staff Shift Rate" = "ES_SUMM_DAY_RATE"
}

export enum SupportItem {
    "3rd Party Ref" = "SUP_3RD_PARTY_REF",
    "Catgory" = "SUP_PRODUCT",
    "Date Closed" = "SUP_DATE_CLOSED",
    "Date Due" = "SUP_DATE_DUE",
    "Date Raised" = "SUP_DATE_RAISED",
    "Invoice No" = "SUP_INVOICE_NO",
    "Notes" = "SUP_NOTES",
    "On Time" = "SUP_ON_TIME",
    "Open" = "SUP_OPEN",
    "Owner Key" = "SUP_OWNER_KEY",
    "Passed Date" = "SUP_PASSED_DATE",
    "PO" = "SUP_PO",
    "Price" = "SUP_SUPPORT_PRICE",
    "Priority" = "SUP_PRIORITY",
    "Resolution" = "SUP_RESOLUTION",
    "Status" = "SUP_REVIEW_STATUS",
    "Sup Description" = "SUP_DESC",
    "Support Key" = "SUP_KEY",
    "Support Owner" = "SUP_OWNER",
    "Taken by emp key" = "SUP_TAKEN_BY_KEY",
    "Time Due" = "SUP_TIME_DUE",
    "Type" = "ES_SUMM_TYPE_DESC"
}

export type EventSessionSummary = Common | EventDetails | Client | SessionDetails | RoleDetails | SupportItem;
export default EventSessionSummary;
