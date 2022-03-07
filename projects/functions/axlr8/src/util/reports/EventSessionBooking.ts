export enum EventDetails {
    "Account Manager" = "ES_EVENT_OWNER_EMP_SELECT",
    "Attending Employee 1" = "ES_ATTENDING_EMP_1",
    "Date Created" = "ES_EVENT_CREATED",
    "Event Code" = "ES_EVENT_CODE",
    "Event Date" = "ES_EVENT_DATE",
    "Event ID" = "ES_EVENT_ID",
    "Event PO" = "ES_EVENT_PO",
    "Line of Business" = "EMP_LOB",
    "Uniform" = "ES_EVENT_TYPE",
    "Venue Date Created" = "ES_EVENT_VENUE_ORG_CREATED",
    "Venue Name" = "ES_EVENT_VENUE_ORG",
    "Venue" = "ES_EVENT_NAME",    
}


export enum EventAddress {
    "Event Site Address" = "ES_EVENT_ADDRESS",
    "Select Venue" = "ES_EVENT_VENUE"
}

export enum Client {
    "Account Manager" = "ES_CLIENT_ACCOUNT_MANAGER",
    "Account Number" = "ES_ORG_ALPHA",
    "Client Type" = "ES_ORG_TYPE",
    "Client" = "ES_EVENT_ORG"
}

export enum ThirdPartyContact {
    "Client Contact" = "ES_EV3P_CONTACT_FULLNAME"
}

export enum EventCustomFields {
    "Custom Field 2" = "ES_EVENT_CUSTOM_FIELD_2",
    "Custom Field 3" = "ES_EVENT_CUSTOM_FIELD_3",
    "Custom Field 4" = "ES_EVENT_CUSTOM_FIELD_4",
    "Custom Field 5" = "ES_EVENT_CUSTOM_FIELD_5",
    "Uniform" = "ES_EVENT_CUSTOM_FIELD_1"
}

export enum EventInvoice {
    "Invoice Amount" = "ES_EVENT_INVOICE_AMOUNT",
    "Invoice Date" = "ES_EVENT_INVOICE_DATE",
    "Invoice No" = "ES_EVENT_INVOICE_NO",
    "Invoice Paid" = "ES_EVENT_INVOICE_PAID",
    "Paid Ammount" = "ES_EVENT_INVOICE_PAID_AMOUNT",
    "Paid Date" = "ES_EVENT_INVOICE_PAID_DATE",
}

export enum SessionDetails {
    "Customer ID" = "ES_SITE_CUSTOMER_ID",
    "DNS%" = "ES_DNS_%",
    "Duration" = "ES_SUMM_DURATION",
    "End Date/Time" = "ES_ROLE_END_TIME",
    "End time" = "ES_ROLE_END_TIME_ONLY",
    "No of Sessions" = "ES_CONT_NUMBER_SESSIONS",
    "No. DNS" = "ES_NUMBER_DNS",
    "No. Required" = "ES_SESSION_NUMBER_REQ",
    "Number still required" = "ES_SESSION_NUMBER_STAFF_STILL_REQUIRED",
    "Sess Id" = "ES_ID",
    "Session Day" = "ES_SESSION_START_DAY",
    "Session End Date" = "ES_SESSION_END_DATE_ONLY",
    "Session End Date/Time" = "ES_SESSION_END_DATE_TIME",
    "Session End Time" = "ES_SESSION_END_TIME_ONLY",
    "Session has a venue site" = "ES_SESSION_HAS_CONNECTED_VENUE_SITE",
    "Session has Valid Lat/Long Data" = "ES_SESSION_VALID_CICO",
    "Session ID" = "ES_SESSION_ID",
    "Session Period" = "ES_SESSION_PERIOD",
    "Session Postcode" = "ES_SESSION_POSTCODE",
    "Session Site" = "ES_VENUE_SITE_KEY",
    "Session Site Address" = "ES_SESSION_SITE_ADDRESS_ONE_LINE",
    "Session Staff Search" = "ES_SESSION_STAFF_SEARCH_LINK",
    "Session Start Date (Date Only)" = "ES_SESSION_START_DATE_ONLY",
    "Session Start Time" = "ES_SESSION_START_TIME_ONLY",
    "Session Type" = "ES_SESSION_TYPE",
    "Session Week" = "ES_SESSION_WEEK",
    "Shift Address" = "ES_SESSION_ADDRESS_ONLY",
    "Shift Address 2" = "ES_SESSION_ADDRESS",
    "Shift Date" = "ES_SESSION_START_DATE",
    "Shift Name" = "ES_SESSION",
    "Session Status" = "ES_SESSION_STATUS",
    "Start Date/Time" = "ES_ROLE_START_TIME",
    "Start Time" = "ES_ROLE_START_TIME_ONLY",
    "Venue" = "ES_SESSION_VENUE"
}

export type EventSessionBooking = EventDetails

export default EventSessionBooking