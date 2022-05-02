import Common from "./common";

export enum ContactData {
    "Cont Key" = "QS_LINKS_CONTACT_ID",
    "Email" = "QS_LINKS_CONTACT_EMAIL",
    "First Name" = "QS_LINKS_CONTACT_FIRSTNAME",
    "Full Name" = "QS_LINKS_CONTACT_FULLNAME",
    "Last Name" = "QS_LINKS_CONTACT_LASTNAME"
}

export enum EventDetails {
    "Event ID" = "QS_LINKS_EVENT_ID",
    "Venue" = "QS_LINKS_EVENT_VENUE",
}

export enum ReportDetails {
    "Group Name" = "QS_LINKS_ATTACH_GROUP"
}

export enum ReportStatus {
    "Approved" = "QS_LINK_APPROVED",
    "Questionnnaire ID" = "QS_LINKS_QS_ID",
    "Score" = "QS_LINKS_WEIGTHING",
    "Status" = "QS_LINKS_STATUS"
}

export enum SessionDetails {
    "Postcode" = "QS_LINKS_SESSION_POSTCODE",
    "Questionnaire" = "QS_LINKS_LINK",
    "Questionnaire (read only)" = "QS_LINKS_LINK_LOCKED",
    "Sess ID" = "QS_LINKS_RPT_ID",
    "Shift Date" = "QS_LINKS_SESSION_START_DATE",
    "Shift Name" = "QS_LINKS_SESSION_START_DATE"
}

export enum SystemDetails {
    "Default Tile" = "QS_LINK_QS_DEFAULT_TITLE",
    "Dynamic Label" = "QS_LINKS_DYNAMIC_LABEL",
    "Dynamic Link Meta Disstinct ID" = "QS_LINKS_QS_META_DISTINCT_ID",
    "Status Meta Object Type" = "QS_LINKS_STATUS_META_OBJECT_TYPE"
}

export type QuestionnaireSessionLinks = Common | ContactData | EventDetails | ReportDetails | ReportStatus | SessionDetails | SystemDetails;
export default QuestionnaireSessionLinks;