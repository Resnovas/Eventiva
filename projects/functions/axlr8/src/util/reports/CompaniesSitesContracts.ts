import Common from "./common";


export enum CallBacks {
    "Call" = "OSC_CALL_LINK",
    "Call ID" = "OSC_CALL_CALLBACK_NO",
    "Call Open" = "OSC_CALL_OPEN",
    "Call Reason" = "OSC_CALL_REASON",
    "Call Time" = "OSC_CALL_TIME",
    "Created By" = "OSC_CALL_SETUP_BY",
    "Created For" = "OSC_CALL_FOR_USER",
    "Date Updated" = "OSC_CALL_CLOSED",
    "Priority" = "OSC_CALL_PRIORTY",
    "Result of Call" = "OSC_CALL_RESULT",
    "Result Text" = "OSC_CALL_RESULT_DESC",
    "Type" = "OSC_CALL_TYPE"
}

export enum ContactDetails {
    "Applied Date" = "OSC_APPLIED_DATE",
    "Company Created" = "OSC_ORG_LOAD_DATA",
    "Cont DOB" = "OSC_CONT_DOB",
    "Cont Key" = "OSC_CONTACT_ID",
    "Cont Telephone" = "OSC_CONT_TELEPHONE",
    "Contact Features" = "OSC_CONT_FEATURES",
    "Email" = "OSC_CONT_EMAIL",
    "First Name" = "OSC_CONT_1STNAME",
    "Full Name" = "OSC_FULL_NAME",
    "Last Name" = "OSC_CONT_LASTNAME",
    "Last, FirstName" = "OSC_FULL_NAME_LAST_FIRST",
    "Middle Name" = "OSC_CONT_MIDDLENAME",
    "Mobile" = "OSC_CONTACT_MOBILE",
    "Private Notes" = "OSC_CONT_PRIVATE_NOTES",
    "Salutation" = "OSC_CONT_SALUTATION"
}

export enum ContactNotes {
    "Note" = "OSC_CONTACT_NOTE1",
    "Note Date" = "OSC_CONTACT_NOTE_DATE"
}

export enum ContactStatus {
    "Contact Status" = "ES_CONTACT_STATUS"
}

export enum Files {
    "Date Added" = "OSC_FA_DATE_ADDED",
    "File Description" = "OSC_FA_ATTACH_DESC",
    "File Link" = "OSC_FA_URL",
    "File Name" = "OSC_FA_ATTACH_NAME",
    "File Obsolete" = "OSC_FA_FILE_OBSOLETE",
    "File Type" = "OSC_FACT_CUST_TYPE",
    "Number of Files" = "OSC_FA_NUMBER_OF_FILES"
}

export enum TalentDate {
    "Talent Category" = "OSC_TH_TALENT_VALUE"
}

export type CompaniesSitesContracts = CallBacks | ContactDetails | ContactNotes | ContactStatus | Files | TalentDate | Common;
export default CompaniesSitesContracts;