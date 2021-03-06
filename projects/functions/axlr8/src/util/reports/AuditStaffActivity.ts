import Common from './common'

export enum StaffDetails {
    "Applied Date" = "ASA_APPLIED_DATE",
    "Cont DOB" = "ASA_CONT_DOB",
    "Cont Key" = "ASA_CONTACT_ID",
    "Contact Features" = "ASA_CONT_FEATURES",
    "Email" = "ASA_CONT_EMAIL",
    "First Name" = "ASA_CONT_1STNAME",
    "Last Name" = "ASA_CONT_LASTNAME",
    "Full Name" = "ASA_FULL_NAME",
    "Gender" = "ASA_FULL_NAME",
    "Job Title" = "ASA_CONT_JOB_TITLE",
    "Last, FirstName" = "ASA_FULL_NAME_LAST_FIRST",
    "Middle Name" = "ASA_CONT_MIDDLENAME",
    "Mobile" = "ASA_CONTACT_MOBILE",
    "Private Notes" = "ASA_CONT_PRIVATE_NOTES",
    "Salutation" = "ASA_CONT_SALUTATION"
}

export enum StaffStatus {
    "Contact Status" = "ES_CONTACT_STATUS",
    "Job App. Status" = "ASA_JOB_APP_STATUS"
}

export enum StaffAddress {
    "Country" = "ASA_SITE_LOC_3",
    "County" = "ASA_SITE_COUNTY",
    "Post Code" = "ASA_SITE_POSTCODE",
    "Site Building 1" = "ASA_SITE_BUILD_1",
    "Site Building 2" = "ASA_SITE_BUILD_2",
    "Site ID" = "ASA_SITE_ID",
    "Site Summary" = "ASA_SITE_SUMM",
    "Site Street 1" = "ASA_SITE_THORO_1",
    "Telephone" = "ASA_SITE_TELE",
    "Town" = "ASA_SITE_LOC_1",
    "Website" = "ASA_SITE_LOC_2"
}

export enum StaffAvailability {
    "Availability Description" = "ASA_AVAIL_EXTENDED_DESC",
    "Calander Date" = "ASA_AVAIL_CALANDER_DATE",
    "Has Set Availability" = "ASA_AVAIL_BOOL"
}

export enum StaffEmployeeData {
    "Account Number" = "ASA_EMP_BANK_ACC_NO",
    "Active" = "ASA_EMP_ACTIVE",
    "Address Changed Date" = "ASA_EMP_ADDRESS_LAST_CHANGED",
    "Date Promoted" = "ASA_PROMOTE_DATE",
    "Date retired" = "ASA_EMP_RETIRED_DATE",
    "Email Last Changed" = "ASA_EMAIL_LAST_CHANGED",
    "Employee Description Last changed" = "ASA_EMAIL_LAST_CHANGED",
    "NI" = "ASA_EMP_NI",
    "Passport Country" = "ASA_EMP_PASSPORT_COUNTRY",
    "Passport Expiry" = "ASA_EMP_PASSPORT_EXPIRY",
    "Passport Number" = "ASA_EMP_PASSPORT_NUMBER",
    "Payroll Number" = "ASA_EMP_PAYROLL_NO",
    "Roll/Ref No" = "ASA_EMP_ROLL_REF_NO",
    "Sort Code" = "ASA_EMP_BANK_SORT",
    "Staff Details" = "ASA_EMP_DESC"
}

export enum StaffOrganisationData {
    "Account Number" = "ASA_ORG_ALPHA",
    "Org Acc Manager" = "ASA_ORG_ACC_MGR",
    "Org Key" = "ASA_ORG_ID",
    "Org Name" = "ASA_ORG_ID",
    "Org Source" = "ASA_ORG_SOURCE",
    "Org Type" = "ASA_ORG_TYPE"
}

export enum LoginSummary {
    "Number Logins" = "ASA_NO_LOGINS"
}

export enum BookingSummary {
    "Confirmed Bookings" = "ASA_SESSIONS_WORKED",
    "First Confirmed Booking" = "ASA_FIRST_BOOKING",
    "Hours Worked" = "ASA_TOTAL_HOURS_WORKED",
    "Is Booked" = "ASA_BOOKING_BOOKED",
    "Pay To Date" = "ASA_TOTAL_PAY",
}

export type AuditStaffActivity = BookingSummary | LoginSummary | StaffAddress | StaffAvailability | StaffEmployeeData | StaffOrganisationData | StaffStatus | StaffDetails | Common

export default AuditStaffActivity