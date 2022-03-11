export * from './common'

export enum QuestionnaireDetails {
    "QS Name" = "QS_CONT_QS_NAME",
    "Questionnaire ID" = "QS_CONT_QS_ID",
    "Questionnaire Link" = "QS_CONT_QS_LINK",
    "Response Date" = "QS_CONT_RESPONSE_DATE",
    "Response ID" = "QS_CONT_QS_STATUS_ID",
    "Score" = "QS_CONT_WEIGTHING",
    "Status" = "QS_CONT_QS_STATUS",
    "Attempts" = "QS_RESPONSE_ATTEMPTS",
    "Attempts Remaining" = "QS_ATTEMPTS_REMAINING",
    "Locked" = "QS_RESPONSE_LOCKED",
    "Max Attempts" = "QS_MAX_ATTEMPTS",
    "Unlock/Reset" = "QS_UNLOCK_RESET_LINK",
    "Questionnaire Context" = "QS_CONT_META_OBJECT_TYPE"
}

export enum QuestionnaireStatus {
    "No. Submitted by Questionnaire" = "QS_CONT_NO_SUBMITTED_BY_QS",
    "Results by Questionnaire (Submitted)" = "QS_CONT_RESULTS_BY_QUESTIONARE_COMPLETED"
}

export enum ContactData {
    "Cont DOB" = "QS_CONT_DOB",
    "Cont Telephone" = "QS_CONT_TELEPHONE",
    "Contact Features" = "QS_CONT_FEATURES",
    "Email" = "QS_CONT_EMAIL",
    "First Name" = "QS_CONT_1STNAME",
    "Full Name" = "QS_CONT_FULLNAME",
    "Gender" = "OQS_CONT_SEX",
    "Job  Title" = "QS_CONT_JOB_TITLE",
    "Last Name" = "QS_CONT_LASTNAME",
    "Last FirstName" = "QS_CONT_FULL_NAME_LAST_FIRST",
    "Middle Name" = "QS_CONT_MIDDLENAME",
    "Mobile" = "QS_CONT_MOBILE",
    "Private Notes" = "QS_CONT_PRIVATE_NOTES",
    "Salutation" = "QS_CONT_SALUTATION"
}

export enum QuestionnaireProfiles {
    "OrganisationName" = "QS_CONT_META_OBJECT_TYPE"
}

export enum SiteData {
    "Country" = "QS_CONT_SITE_LOC_3",
    "County" = "QS_CONT_SITE_COUNTY",
    "Postcode" = "QS_CONT_SITE_POSTCODE",
    "Site Building 1" = "QS_CONT_SITE_BUILD_1",
    "Site Building 2" = "QS_CONT_SITE_BUILD_2",
    "Site Id" = "QS_CONT_SITE_ID",
    "Site Summary" = "QS_CONT_SITE_SUMM",
    "Site Telephone" = "QS_CONT_SITE_TELE",
    "Street 1" = "QS_CONT_SITE_THORO_1",
    "Street 2" = "QS_CONT_SITE_THORO_2",
    "Town" = "QS_CONT_SITE_LOC_1",
    "Website" = "QS_CONT_SITE_LOC_2"
}

export type QuestionnaireResponse = QuestionnaireDetails | QuestionnaireStatus | QuestionnaireProfiles;
export default QuestionnaireResponse;