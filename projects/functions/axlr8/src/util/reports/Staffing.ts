import Common from "./common";

export enum ContactData {
    "Applied Date" = "OSCE_APPLIED_DATE",
    "Cont DOB" = "OSCE_CONT_DOB",
    "Cont Email" = "OSCE_CONT_EMAIL",
    "Cont Key" = "OSCE_CONTACT_ID",
    "Cont Username" = "OSCE_CONT_USERNAME",
    "Contact Features" = "OSCE_CONT_FEATURES",
    "First Name" = "OSCE_CONT_1STNAME",
    "Full Name" = "OSCE_FULL_NAME",
    "Gender" = "OSCE_CONT_SEX",
    "Has Been Booked" = "OSCE_HAS_BEEN_BOOKED",
    "Job Title" = "OSCE_CONT_JOB_TITLE",
    "Last Name" = "OSCE_CONT_LASTNAME",
    "Middle Name" = "OSCE_CONT_MIDDLENAME",
    "Mobile" = "OSCE_CONTACT_MOBILE",
    "Payroll Created" = "ES_EMP_PAYROLL_CREATED",
    "Payroll Number" = "ES_EMP_PAYROLL_NO",
    "Private Notes" = "OSCE_CONT_PRIVATE_NOTES",
    "Recent Booking" = "OSCE_MOST_RECENT_BOOKING_DATE",
    "Salutation" = "OSCE_CONT_SALUTATION",
    "Talent Features" = "OSCE_CONT_TALENT_FEATURES",
    "Username is email" = "OSCE_USERNAME_IS_EMAIL"
}

export enum Address {
    "Country" = "OSCE_SITE_LOC_3",
    "County" = "OSCE_SITE_COUNTY",
    "Postcode" = "OSCE_SITE_POSTCODE",
    "Site Building 2" = "OSCE_SITE_BUILD_2",
    "Site Id" = "OSCE_SITE_ID",
    "Site Telephone" = "OSCE_SITE_TELE",
    "Street 1" = "OSCE_SITE_THORO_1",
    "Town" = "OSCE_SITE_LOC_1",
    "Website" = "OSCE_SITE_LOC_2"
}

export enum ContactNotes {
    "Note" = "OSCE_CONTACT_NOTE1",
    "Note By" = "OSCE_CONTACT_NOTE_SOURCE",
    "Note Date" = "OSCE_CONTACT_NOTE_DATE"
}


export enum ContactFiles {
    "Date Added" = "OSCE_FA_DATE_ADDED",
    "File Description" = "OSCE_FA_ATTACH_DESC",
    "File  Link" = "OSCE_FA_URL",
    "File Name" = "OSCE_FA_ATTACH_NAME",
    "File Obsolete" = "OSCE_FA_FILE_OBSOLETE",
    "File Type" = "OSCE_FACT_CUST_TYPE",
    "Number of files" = "OSCE_FA_NUMBER_OF_FILES"
}

export enum Organisation {
    "Account Manager" = "OSCE_ORG_ACC_MGR",
    "Org Key" = "OSCE_ORG_ID",
    "Org Name" = "OSCE_ORG_NAME",
    "Org Source" = "OSCE_ORG_SOURCE",
    "Org Type" = "OSCE_ORG_TYPE"
}

export enum ContactJASChanges {
    "Audit Key" = "OSCE_JP_JAS_HISTORY_JPJ_MOK",
    "JPJ Changes User" = "OSCE_JP_JAS_HISTORY_JPJ_CHANGEUSER",
    "JPJ Date Changed" = "OSCE_JP_JAS_HISTORY_JPJ_DATE_CHANGED",
    "JPJ ID" = "OSCE_JP_JAS_HISTORY_JPJ_ID",
    "JPJ JAS Status" = "OSCE_JP_JAS_HISTORY_JPJ_CES_STATUS"
}

export enum ContactStatus {
    "Cont Status Last Changed" = "OSCE_CONTSTATUS_LAST_CHANGE",
    "Cont Status Last Changed by" = "OSCE_CONTSTATUS_LAST_CHANGED_EMPATTENDING_EMP_1",
    "Contact Status" = "ES_CONTACT_STATUS",
    "Job App. Last Changed" = "OSCE_JAS_LAST_CHANGE",
    "Job App. Status" = "ES_JOB_APP_STATUS",
    "Job App. Status Last changed by" = "OSCE_JAS_LAST_CHANGED_EMPATTENDING_EMP_1"
}

export enum EmployeeData {
    "Account Name" = "OSCE_EMP_BANK_ACC_NAME",
    "Account Number" = "OSCE_EMP_BANK_ACC_NO",
    "Active" = "OSCE_EMP_ACTIVE",
    "Asset Allocation" = "OSCE_UPDATE_ASSET_ALLOCATION",
    "Bank Name" = "OSCE_EMP_BANK_NAME",
    "Company Name" = "OSCE_EMP_COMPANY_NAME",
    "Company Reg" = "OSCE_EMP_COMPANY_REG",
    "Date Last Logged In" = "OSCE_LOGIN_DATE",
    "Date Promoted" = "OSCE_PROMOTE_DATE",
    "Date Retired" = "OSCE_EMP_RETIRED_DATE",
    "Days Since promotion" = "OSCE_PROMOTE_DATE_DAYS",
    "Email" = "OSCE_EMP_EMAIL",
    "Employee Id" = "OSCE_EMP_ID",
    "Full Name" = "OSCE_EMP_DESC",
    "Is Staff Member" = "OSCE_IS_STAFF",
    "Mobile" = "OSCE_EMP_TELE",
    "NI" = "OSCE_EMP_NI",
    "Operations Manager" = "OSCE_EMP_APPLICANT_MANAGER",
    "Passport Country" = "OSCE_EMP_PASSPORT_COUNTRY",
    "Passport Number" = "OSCE_EMP_PASSPORT_NUMBER",
    "Pay Slip Id" = "OSCE_EMP_PAY_LOGIN_ID",
    "Pay Slip Pin" = "OCSE_PAY_LOGIN_PIN",
    "Print Id Card" = "OSCE_PRINT_ID_CARD",
    "Reactivated" = "OSCE_REACTIVATED_DATE",
    "Role" = "OSCE_EMP_GROUP",
    "Roll / Ref No" = "OSCE_EMP_ROLL_REF_NO",
    "Self Employed" = "OSCE_SELF_EMPLOYED",
    "Sort Code" = "OSCE_EMP_BANK_SORT",
    "Staff Hour Rate" = "OSCE_EMP_STAFF_HOUR_RATE",
    "Staff Photo" = "OSCE_STAFF_PHOTO_THMBNAIL",
    "Staff Points" = "OSCE_EMP_REWARD_POINTS",
    "Staff Shift Rate" = "OSCE_EMP_STAFF_DAY_RATE",
    "Town Of Birth" = "OSCE_EMP_TOWN_OF_BIRTH",
    "Vat No" = "OSCE_EMP_VAT_NO",
    "Visa Expiry" = "OSCE_EMP_VISA_EXPIARY",
    "Visa type" = "OSCE_EMP_VISA_TYPE",
    "Who Promoted" = "OSCE_EMP_PROMOTED_BY"
}

export enum EmploymentHistory {
    "Address" = "EH_ADDRESS",
    "Business Nature" = "EH_BUSINESS_NATURE",
    "Company Name" = "EH_COMPANY",
    "Contact id" = "EH_CONTACT_ID",
    "Contact Name" = "EH_NAME",
    "Details" = "EH_DETAILS",
    "From" = "EH_FROM_DATE",
    "Id" = "EH_ID",
    "Position" = "EH_POSITION",
    "Post Code" = "EH_POST_CODE",
    "Telephone" = "EH_TELEPHONE",
    "To" = "EH_TO_DATE"
}


export enum References {
    "Address" = "CONTREF_ADDRESS",
    "Contact Id" = "CONTREF_CONT_ID",
    "Email" = "CONTREF_EMAIL",
    "Id" = "CONTREF_ID",
    "Known For" = "CONTREF_KNOWN_FOR",
    "Post Code" = "CONTREF_POSTCODE",
    "Relationship" = "CONTREF_RELATIONSHIP",
    "Telephone" = "CONTREF_TELEPHONE"
}


export enum Education {
    "Certifiates" = "CONT_EDU_CERTIFICATES",
    "Contact Id" = "CONT_EDU_CONT_ID",
    "End Date" = "CONT_EDU_END_DATE",
    "Id" = "CONT_EDU_ID",
    "Marks" = "CONT_EDU_MARKS",
    "Qualification" = "CONT_EDU_QUAL_DETAILS",
    "Start Date" = "CONT_EDU_START_DATE",
    "University" = "CONT_EDU_UNIVERSITY"
}

export enum AddressHistory {
    "Building" = "ADD_HIST_BUILDING",
    "Contact Id" = "ADD_HIST_CONTACT_ID",
    "County" = "ADD_HIST_COUNTY",
    "From" = "ADD_HIST_FROM",
    "Id" = "ADD_HIST_ID",
    "Post Code" = "ADD_HIST_POSTCODE",
    "Street 1" = "ADD_HIST_STREET_1",
    "Street 2" = "ADD_HIST_STREET_2",
    "To" = "ADD_HIST_TO",
    "Town" = "ADD_HIST_TOWN"
}

export enum Qualifications {
    "Certificates" = "SECT_QUAL_CERTIFICATE",
    "Collage / University" = "SECT_QUAL_COLLEGE",
    "Exam Link" = "SECT_QUAL_EXAM_BOARD_LINK",
    "Examination Board" = "SECT_QUAL_EXAM_BOARD",
    "Expiry Date" = "SECT_QUAL_TO",
    "Module" = "SECT_QUAL_MODULE_NAME",
    "Passed Date" = "SECT_QUAL_PASS_DATE",
    "Qualification" = "SECT_QUAL_NAME",
    "Qualification Description" = "SECT_QUAL_DESC",
    "Qualification Document" = "OSCE_QUAL_DOCUMENT",
    "Qualification Exists" = "SECT_QUAL_EXISTS",
    "Start Date" = "SECT_QUAL_FROM",
    "Status" = "SECT_QUAL_STATUS"
}

export enum OtherContacts {
    "Address" = "SECT_OTHERCONTACS_ADDRESS",
    "Name" = "SECT_OTHERCONTACS_NAME",
    "Relationship" = "SECT_OTHERCONTACS_RELATIONSHIP",
    "Telephone" = "SECT_OTHERCONTACS_PHONE"
}

export enum BookingAggregateDate {
    "First Confirmed Booking" = "OSCE_FIRST_BOOKING",
    "Hours Worked" = "OSCE_FIRST_BOOKING",
    "Last Confirmed Booking" = "OSCE_LAST_BOOKING",
    "No. Sessions Worked" = "OSCE_SESSIONS_WORKED"
}

export enum StaffAsset {
    "Asset Id" = "SA_ASSET_KEY",
    "Batch No" = "SA_BATCH_NO",
    "Comments" = "SA_COMMENTS",
    "Current Value" = "SA_CURRENT_VALUE",
    "Description" = "SA_DESC",
    "Internal No" = "SA_MODEL_NUMBER",
    "Purchase Cost" = "SA_PURCHASE_COST",
    "Quantity" = "SA_ASSET_QTY",
    "Ref" = "SA_ASSET_REF",
    "Serial No" = "SA_TARCK_NO",
    "Status Date" = "SA_STATUS_DATE",
    "Warranty Date" = "SA_WARRENTY_DATE"
}

export enum VettingDetails {
    "1st Approval" = "OSCE_VETTING_FIRST_APPROVAL",
    "Add history conf" = "OSCE_VETTING_5_YEAR_ADDRESS_HISTORY_CONFIMRED",
    "Emp History Conf" = "OSCE_VETTING_5_YEAR_HISTORY_CONFIMRED",
    "Interview Started" = "OSCE_VETTING_ID",
    "Interviewed by" = "OSCE_VETTING_INTERVIEWED_BY",
    "Not approved" = "OSCE_VETTING_NOT_APPROVED",
    "Proof of Address attached" = "OSCE_VETTING_PROOF_OF_ADDRESS",
    "Proof of ID" = "OSCE_VETTING_ID_CONFIRMED",
    "Qual Conf" = "OSCE_VETTING_QUAL_CONFIRMED",
    "Ref conf" = "OSCE_VETTING_REFERENCES_CONFIMRED",
    "Vetting Activity Exists" = "OSCE_VETTING_ACTIVITY_EXISTS",
    "Vetting Complete" = "OSCE_VETTING_SECOUND_APPROVAL"
}

export enum ApplicationForm {
    "Complete" = "AFB_COMPLETED",
    "Form Name" = "AFB_AFM_NAME",
    "Form Tag" = "AFB_AFM_TAG",
    "Form Title" = "AFB_AFF_TITLE",
    "Last Saved" = "AFB_CONTACT_PROGRESS_LAST_UPDATED",
    "Next Page" = "AFB_NEXT_PAGE"
}

export enum Notification {
    "Can Notify" = "NOTIFICATION_HAS_NOTIFICATION",
    "Created" = "NOTIFICATION_CREATED",
    "Delivered" = "NOTIFICATION_DELIVERED",
    "Message" = "NOTIFICATION_MESSAGE",
    "Message Id" = "NOTIFICATION_ID",
    "Notification Date" = "NOTIFICATION_DATE",
    "Registration Id" = "NOTIFICATION_REGISTRATION",
    "Status" = "NOTIFICATION_STATUS",
    "Title" = "NOTIFICATION_TITLE"
}

export type Staffing = Common | Address | Education | AddressHistory | Qualifications | OtherContacts | BookingAggregateDate | StaffAsset | VettingDetails | ApplicationForm | Notification;
export default Staffing;