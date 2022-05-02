import Common from "./common";

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

export enum RoleDetails {
    "Client Hourly Rate" = "ES_SESSION_ROLE_RATE",
    "Daily Profit" = "ES_ROLE_DAY_PROFIT",
    "Daily Profit Percent" = "ES_ROLE_DAY_PROFIT_PERCENTAGE",
    "Role" = "ES_ROLE",
    "Role day rate" = "ES_SESSION_ROLE_DAY_RATE",
    "Role end time" = "ES_SESSION_ROLE_END_TIME",
    "Role start time" = "ES_SESSION_ROLE_START_TIME",
    "Role unpaid minutes" = "ES_SESSION_ROLE_UNPAID_MINUTES",
    "Staff rate" = "ES_RATE",
    "Staff shift rate" = "ES_DAY_RATE"
}


export enum SessionPreferences {
    "Session has check in-out" = "ES_SESSIONGEOPREFS_CICO",
    "Session has Geo-Tracking" = "Session Preferences"
}

export enum PayrollSubmission {
    "Approved by" = "ES_OAYROLL_APPROVED_EMP",
    "Approved Date" = "ES_PAYROLL_APPROVED_DATE",
    "Payroll Submission" = "ES_PAYROLL_SUBMIT_STATUS",
    "Submitted by" = "ES_OAYROLL_SUBMIT_EMP",
    "Submitted Date" = "ES_PAYROLL_SUBMITED_DATE",
}

export enum BookingDetails {
    "Adjustments" = "ES_SESSION_BOOKING_FINES",
    "Age at Session Start" = "ES_AGE_AT_SESSION_START",
    "Attendee Status" = "EMP_BOOKING_AVAILABILITY_STATUS",
    "Booking End Time" = "ES_BOOKING_END_TIME_ONLY",
    "Booking Key" = "ES_BOOKING_KEY",
    "Booking Last Change" = "ES_BOOKING_LAST_CHANGED",
    "Booking Start Time" = "ES_BOOKING_START_TIME_ONLY",
    "Booking Status" = "EMP_BOOKING_STATUS",
    "Booking Status Employee" = "ES_BOOKING_STATUS_EMPLOYEE",
    "Booking Type" = "ES_SESSION_BOOKING_TYPE",
    "Break time" = "ES_SESSION_BOOKING_BREAKTIME",
    "Declined Status" = "EMP_DECLINED_STATUS",
    "DNS" = "ES_DID_NOT_SHOW",
    "DNS Reason" = "ES_BOOKING_DNS_REASON",
    "Expenses" = "ES_SESSION_BOOKING_EXPENSES",
    "Expenses Memo" = "ES_SESSION_BOOKING_EXPENSES_MEMO",
    "Fines Memo" = "ES_SESSION_BOOKING_FINES_MEMO",
    "Hour Rate" = "ES_SESSION_BOOKING_HOUR_RATE",
    "Marked as Paid" = "ES_MARKED_AS_PAID",
    "No. Confirmed" = "ES_NO_CONFIRMED",
    "No. of Bookings" = "ES_BOOKED_ON",
    "Ok to Pay" = "ES_OK_TO_PAY",
    "Pay" = "ES_SESSION_BOOKING_PAY",
    "Payroll Export ID" = "ES_BOOKING_PAYROLL_EXPORT_ID",
    "Role Assigned" = "ES_BOOKING_HAS_ROLE",
    "Shift Hours" = "ES_HOURS_WORKED",
    "Shift Rate" = "ES_SESSION_BOOKING_DAY_RATE",
    "Timesheet - Adjusted time" = "ES_BOOKING_ADJUSTED_TIME",
    "Timesheet - Adjustment description" = "ES_BOOKING_EDITED_TEXT",
    "Timesheet Completed" = "ES_BOOKING_USER_HAS_EDITED_TEXT",
    "Total Pay" = "ES_SESSION_BOOKING_TOTAL_PAY"
}

export enum RateLogData {
    "Area Manager" = "ES_RATES_LOG_DATA_CHANGE_USER",
    "Change Date" = "ES_RATES_LOG_DATA_CHANGE_DATE",
    "One off Rate after" = "ES_RATES_LOG_DATA_RATE_AFTER",
    "One off Rate before" = "ES_RATES_LOG_DATA_RATE_BEFORE",
    "One off Rate request" = "ES_RATES_LOG_DATA_RATE_REQUESTED",
    "Ops Director" = "ES_RATES_LOG_DATA_CHANGE_USER_MANAGER",
    "Ops Director Reviewed" = "ES_RATES_LOG_APPROVAL_STATUS",
    "Rate change status" = "ES_RATES_LOG_DATA_BOOKING_RATE_CHANGE_STATUS",
    "Rates Log Id" = "ES_RATES_LOG_ID",
    "Review" = "ES_RATES_LOG_REVIEW_DATA",
    "Review Date" = "ES_RATES_LOG_APPROVAL_DATE",
    "Updated Venue Rate" = "ES_RATES_LOG_UPDATED_WORK_RATE",
    "Venue rate after" = "ES_RATES_LOG_DATA_WORK_AFTER",
    "Venue rate before" = "ES_RATES_LOG_DATA_WORK_BEFORE",
    "Venue rate change status" = "ES_RATES_LOG_DATA_WORK_RATE_CHANGE_STATUS",
    "Venue rate Requested" = "ES_RATES_LOG_DATA_WORK_REQUESTED"
}

export enum StaffMember {
    "Active" = "ES_EMP_ACTIVE",
    "Age" = "ES_AGE_NOW",
    "Bank Account Number" = "ES_EMP_BANK_ACC_NO",
    "Date Promoted" = "ES_PROMOTE_DATE",
    "DOB" = "ES_CONT_DOB",
    "Email" = "ES_CONTACT_EMAIL",
    "First Name" = "ES_CONTACT_FIRSTNAME",
    "Last Name" = "ES_CONTACT_LASTNAME",
    "Mobile" = "ES_CONTACT_MOBILE",
    "Operations Manager" = "ES_EMP_APPLICANT_MANAGER",
    "Passport Country" = "ES_EMP_PASSPORT_COUNTRY",
    "Passport Expiry" = "ES_EMP_PASSPORT_EXPIRY",
    "Passport Number" = "ES_EMP_PASSPORT_NUMBER",
    "Salutation" = "ES_CONT_SALUTATION",
    "Self Employed" = "ES_SELF_EMPLOYED",
    "Staff Distance from site (km)" = "ES_STAFF_DISTANCE_FROM_SESSION_KM",
    "Staff Distance from site (miles)" = "ES_STAFF_DISTANCE_FROM_SESSION_MI",
    "Staff is beta tester" = "STAFF_BETA_TESTER",
    "Staff Photo" = "ES_STAFF_PHOTO_THUMBNAIL",
    "Strikes" = "ES_CONT_STRIKES",
    "Telephone" = "ES_CONTACT_TELEPHONE",
    "Visa Expiry" = "ES_EMP_VISA_EXPIARY",
    "Visa type" = "ES_EMP_VISA_TYPE"
}

export enum StaffAddress {
    "Country" = "ES_SITE_LOC_3",
    "County" = "ES_SITE_COUNTY",
    "Post Code" = "ES_SITE_POSTCODE",
    "Site Building 1" = "ES_SITE_BUILD_1",
    "Site Building 2" = "ES_SITE_BUILD_2",
    "Site Id" = "ES_SITE_ID",
    "Street 1" = "ES_SITE_THORO_1",
    "Town" = "ES_SITE_LOC_1",
    "Website" = "ES_SITE_LOC_2"
}

export enum StaffQualifications {
    "Certificates" = "SECT_QUAL_CERTIFICATE",
    "Collage / University" = "SECT_QUAL_COLLEGE",
    "Exzam Link" = "SECT_QUAL_EXAM_BOARD_LINK",
    "Examination Board" = "SECT_QUAL_EXAM_BOARD",
    "Expiry Date" = "SECT_QUAL_TO",
    "Module" = "SECT_QUAL_MODULE_NAME",
    "Passed Date" = "SECT_QUAL_PASS_DATE",
    "Qualification" = "SECT_QUAL_NAME",
    "Qualification description" = "SECT_QUAL_DESC",
    "Qualification document" = "OSCE_QUAL_DOCUMENT",
    "Qualification Exists" = "SECT_QUAL_EXISTS",
    "Start Date" = "SECT_QUAL_FROM",
    "Status" = "SECT_QUAL_STATUS"
}

export enum StaffPayroll {
    "Payroll create date" = "ES_EMP_PAYROLL_CREATED",
    "Payroll Number" = "ES_EMP_PAYROLL_NO"
}

export enum StaffStatus {
    "Contact Status" = "ES_CONTACT_STATUS",
    "Job App. Status" = "ES_JOB_APP_STATUS",
}


export enum OtherContacts {
    "Address" = "SECT_OTHERCONTACS_ADDRESS",
    "Name" = "SECT_OTHERCONTACS_NAME",
    "Relationship" = "SECT_OTHERCONTACS_RELATIONSHIP",
    "Telephone" = "SECT_OTHERCONTACS_PHONE"
}

export enum StaffFiles {
    "Date Added" = "ES_STAFF_FA_DATE_ADDED",
    "File Description" = "ES_STAFF_FA_ATTACH_DESC",
    "File Link" = "ES_STAFF_FA_URL",
    "File Name" = "ES_STAFF_FA_ATTACH_NAME",
    "File Obsolete" = "ES_STAFF_FA_FILE_OBSOLETE",
    "File Type" = "ES_STAFF_FACT_CUST_TYPE",
    "Number of Files" = "ES_STAFF_FA_NUMBER_OF_FILES"
}

export enum StaffNotifications {
    "Can Notify" = "NOTIFICATION_HAS_NOTIFICATION",
    "Created" = "NOTIFICATION_CREATED",
    "Delievered" = "NOTIFICATION_DELIVERED",
    "Message" = "NOTIFICATION_MESSAGE",
    "Message Id" = "NOTIFICATION_ID",
    "Notification Date" = "NOTIFICATION_DATE",
    "Registration Id" = "NOTIFICATION_REGISTRATION",
    "Status" = "NOTIFICATION_STATUS",
    "Title" = "NOTIFICATION_TITLE"
}

export enum StaffAsset {
    "Asset id" = "SA_ASSET_KEY",
    "Batch No" = "SA_BATCH_NO",
    "Comments" = "SA_COMMENTS",
    "Current Value" = "SA_CURRENT_VALUE",
    "Description" = "SA_DESC",
    "Internal No" = "SA_MODEL_NUMBER",
    "Purchase Cost" = "SA_PURCHASE_COST",
    "Quantity" = "SA_ASSET_QTY",
    "Ref" = "SA_ASSET_REF",
    "Serial no" = "SA_TARCK_NO",
    "Status Date" = "SA_STATUS_DATE",
    "Warranty Date" = "SA_WARRENTY_DATE"
}

export enum BookingSummary {
    "Confirmed Bookings" = "ES_SESSIONS_WORKED",
    "First Confirmed Booking" = "ES_FIRST_BOOKING",
    "Hours Worked" = "ES_TOTAL_HOURS_WORKED",
    "Last Booking" = "ES_LAST_BOOKING"
}

export enum CheckInOut {
    "Check In (Dialog)" = "ES_CHECK_IN_MANUAL_DIALOG",
    "Check in" = "ES_CHECK_IN_MANUAL",
    "Check in Changed" = "ES_CHECK_IN_CHANGED_DATE",
    "Check in due (-1)" = "ES_CHECK_IN_TIME_DUE_MINUS_1",
    "Check in due" = "ES_CHECK_IN_TIME_DUE",
    "Check in Employee" = "ES_CHECK_IN_EMPLOYEE",
    "Check in Image" = "ES_CHECK_IN_IMAGE_PATH",
    "Check in Image Link" = "ES_CHECK_IN_IMAGE",
    "Check in Location Data Supplied" = "ES_CHECK_IN_LOCATION_SUPPLIED",
    "Check in record" = "ES_CHECK_IN_ID",
    "Check In time" = "ES_CHECKED_IN_DATE",
    "Check in time diff" = "ES_CHECK_IN_TIME_DIFF",
    "Check out (Dialog)" = "ES_CHECK_OUT_MANUAL_DIALOG",
    "Check out" = "ES_CHECK_OUT_MANUAL",
    "Check out Changed" = "ES_CHECK_OUT_CHANGED_DATE",
    "Check Out Employee" = "ES_CHECK_OUT_EMPLOYEE",
    "Check out Image" = "ES_CHECK_OUT_IMAGE_PATH",
    "Check out Image Link" = "ES_CHECK_OUT_IMAGE",
    "Check out Location Data Supplied" = "ES_CHECK_OUT_LOCATION_SUPPLIED",
    "Check out record" = "ES_CHECK_OUT_ID",
    "Check out time" = "ES_CHECKED_OUT_DATE",
    "Check out time diff" = "ES_CHECK_OUT_TIME_DIFF",
    "Checked in" = "ES_CHECKED_IN",
    "Checked Out" = "ES_CHECKED_OUT",
    "Distance" = "ES_CHECK_IN_GEO_DIFF",
    "Distance (CO)" = "ES_CHECK_OUT_GEO_DIFF",
    "Fail Distance" = "ES_FAIL_CICO_DISTANCE",
    "Fail Id" = "ES_FAIL_CICO_ID",
    "Fail Time" = "ES_FAIL_CICO_DATE",
    "Fail Type" = "ES_FAIL_CICO_FAIL_TYPE",
    "First Updated by" = "ES_FIRST_CHECK_IN_UER",
    "Pic Distance (CO)" = "ES_CHECK_OUT_GEO_PICTURE_DIFF",
    "Pic Distance" = "ES_CHECK_IN_GEO_PICTURE_DIFF"
}

export enum CheckInOutGeo {
    "Link to Geo Tracking for this session" = "ES_GPS_REPORT"
}

export enum SessionSales {
    "Client Gross" = "ES_SESSION_CLIENT_GROSS_AMOUNT",
    "Client Net" = "ES_SESSION_CLIENT_AMOUNT",
    "Client VAT" = "ES_SESSION_CLIENT_VAT_AMOUNT",
    "Costs Nominal" = "ES_SESSION_CLIENT_COSTS_NOMINAL_CODE",
    "Costs Nominal Desc" = "ES_SESSION_CLIENT_COSTS_NOMINAL_DESC",
    "Paid Hours" = "ES_SESSION_CLIENT_PAID_HOURS",
    "Sale Nominal" = "ES_SESSION_CLIENT_SALES_NOMINAL_CODE",
    "Sales Nominal Desc" = "ES_SESSION_CLIENT_SALES_NOMINAL_DESC",
    "Sales Vat code" = "ES_SESSION_CLIENT_VAT_CODE",
    "Sales Vat Desc" = "ES_SESSION_CLIENT_VAT_DESC",
    "Unpaid Hours" = "ES_SESSION_CLIENT_UNPAID_HOURS",
    "Unpaid Hours Applied" = "ES_SESSION_CLIENT_UNPAID_HOURS_APPLIED"
}

export enum InvoiceData {
    "Account Ref" = "ES_INVOICE_REF",
    "Company" = "ES_INVOICE_DEL_COMPANY",
    "Created By" = "ES_INVOICE_CREATED_BY",
    "Created Date" = "ES_INVOICE_CREATE_DATE",
    "Invoice Id" = "ES_INVOICE_ID",
    "Invoice Ref" = "ES_INVOICE_REFERANCE",
    "Invoice Ref or Un Invoiced" = "ES_INVOICE_REFERANCE_WITH_UNINVOICED_SESSION",
    "Label" = "ES_INVOICE_LABEL",
    "Name" = "ES_INVOICE_NAME",
    "Notes" = "ES_INVOICE_NOTES",
    "PO Number" = "ES_INVOICE_PO",
    "Preview" = "ES_INVOICE_PREVIEW",
    "Session Invoiced" = "ES_SESSION_BEEN_INVOICED",
    "Total" = "ES_INVOICE_TOTAL",
    "Total + Vat" = "ES_INVOICE_TOTAL_INCL_VAT",
    "Vat" = "ES_INVOICE_VAT_AMOUNT"
}

export enum InvoiceItems {
    "Gross" = "ES_INVOICE_ITEM_VAT_TOTAL",
    "Invoice Line ID" = "ES_INVOICE_ITEM_ID",
    "Label" = "ES_INVOICE_ITEM_LABEL",
    "Net" = "ES_INVOICE_ITEM_NET",
    "Qty" = "ES_INVOICE_ITEM_QTY",
    "Total Gross" = "ES_INVOICE_ITEM_QTY_GROSS",
    "Total Net" = "ES_INVOICE_ITEM_QTY_NET",
    "Vat %" = "ES_INVOICE_ITEM_VAT_AMOUNT",
    "Vat Code" = "ES_INVOICE_ITEM_VAT_AMOUNT"
}

export enum InvoiceClientAddress {
    "Address 1" = "ES_INVOICE_ADDRESS_1",
    "Address 2" = "ES_INVOICE_ADDRESS_2",
    "Address 3" = "ES_INVOICE_ADDRESS_3",
    "Address 4" = "ES_INVOICE_ADDRESS_4",
    "Company" = "ES_INVOICE_COMPANY",
    "Email" = "ES_INVOICE_EMAIL",
    "Postcode" = "ES_INVOICE_POST_CODE",
    "Telephone" = "ES_INVOICE_TELEPHONE"
}

export enum PrintFields {
    "Sign In" = "ES_SIGN_IN_HERE",
    "Sign Out" = "ES_SIGN_OUT_HERE",
    "Time In" = "ES_ACTUAL_TIME_IN",
    "Time Out" = "ES_ACTUAL_TIME_OUT",
}

export enum QuestionnaireDetails {
    "Approved" = "SESSQS_RESULTS_EVE_APPROVED",
    "Approved date" = "SESSQS_RESULTS_EVE_APPROVED_DATE",
    "QS ID" = "SESSQS_CONT_QS_ID",
    "QS Name" = "SESSQS_CONT_QS_NAME",
    "Questionnaire Context" = "SESSQS_CONT_META_OBJECT_TYPE",
    "Questionnaire Link" = "SESSQS_CONT_QS_LINK",
    "Response Date" = "SESSQS_CONT_RESPONSE_CREATED",
    "Score" = "SESSQS_RESULTS_EVE_WEIGTHING",
    "Status" = "SESSQS_RESULTS_EVE_STATUS"
}

export enum QuestionnaireResults {
    "Group Name" = "SESSQS_RPT_ATTACH_GROUP",
    "Image Results (Submitted)" = "SESSQS_RPT_IMAGE_RESULTS_COMPLETED_ONLY",
    "No. Part Completed" = "SESSQS_RPT_NUMBER_PART_COMPLETE",
    "No. Submitted" = "SESSQS_RPT_NUMBER_COMPLETE",
    "Results by Event (Part Completed and Submitted)" = "SESSQS_RPT_REPORT_RESULTS_ALL",
    "Results by Event (Part Completed)" = "SESSQS_RPT_REPORT_RESULTS_PART_COMPLETE",
    "Results by Event (Submitted)" = "SESSQS_RPT_REPORT_RESULTS_COMPLETED_ONLY",
    "Results by Questionnaire (Submitted)" = "SESSQS_RPT_REPORT_RESULTS_COMPLETED_ONLY_NOT_LIMITED_PER_EVENT"
}

export enum SystemDataQuestionnaires {
    "Attach Type" = "SESSQS_RPT_ATTACH_TYPE",
    "Default Title" = "SESSQS_CONT_QS_DEFAULT_TITLE",
    "Meta Object Id" = "SESSQS_CONT_META_OBJECT_ID",
    "Questionnaire Id" = "SESSQS_RESULTS_EVE_QS_ID",
    "Questionnaire Status meta distinct id" = "SESSQS_CONT_META_DISTINCT_ID",
    "System generate QS key" = "SESSQS_CONT_DEFAULT_QS_USER_KEY"
}

export enum XSystem {
    "3rd Party Cont Key" = "ES_EV3P_CONTACT_ID",
    "Contact Id" = "ES_CONTACT_ID",
    "Events organisation id" = "ES_EVENT_ORG_ID",
    "Sessions id Cont Key" = "ES_SESSION_ID_CONT_KEY",
    "Session Parent Key" = "ES_SESSION_PARENT_EVENT_KEY",
    "The Questionnaire status user id" = "ES_QS_USER_ID",
    "User Id for a resport" = "ES_SESSION_REPORT_USER_ID"
}

export type EventSessionBooking = Common | EventDetails | EventAddress | Client | ThirdPartyContact | EventCustomFields | EventInvoice | SessionDetails | RoleDetails | SessionPreferences | PayrollSubmission | BookingDetails | RateLogData | StaffMember | StaffAddress | StaffQualifications | StaffPayroll | StaffStatus | OtherContacts | StaffFiles | StaffNotifications | StaffAsset | BookingSummary | CheckInOut | CheckInOutGeo | SessionSales | InvoiceData | InvoiceClientAddress | PrintFields | QuestionnaireDetails | QuestionnaireResults | SystemDataQuestionnaires | XSystem;
export default EventSessionBooking