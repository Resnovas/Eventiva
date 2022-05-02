export enum EventDetails {
    "Client" = "SESS_RPT_EVENT_ORG",
    "Event Date" = "SESS_RPT_EVENT_DATE",
    "Event ID" = "SESS_RPT_EVENT_ID",
    "Event Organisation id" = "SESS_RPT_EVENT_ORG_ID",
    "Uniform" = "SESS_RPT_EVENT_TYPE",
    "Venue" = "SESS_RPT_EVENT_NAME"
}

export enum ReportDetails {
    "Group Name" = "SESS_RPT_ATTACH_GROUP",
    "Questionnaire" = "SESS_RPT__QS_NAME"
}

export enum ReportStatus {
    "Image Results (Approved)" = "SESS_RPT_IMAGE_RESULTS_APPROVED_ONLY",
    "Image Results (Submitted)" = "SESS_RPT_IMAGE_RESULTS_COMPLETED_ONLY",
    "No. Approved" = "SESS_RPT_NUMBER_APPROVED",
    "No. Part Completed" = "SESS_RPT_NUMBER_PART_COMPLETE",
    "No. Submitted" = "SESS_RPT_NUMBER_COMPLETE",
    "Results by Event (Approved)" = "SESS_RPT_REPORT_RESULTS_APPROVED_ONLY",
    "Results by Events (Part Completed)" = "SESS_RPT_REPORT_RESULTS_PART_COMPLETE",
    "Results by Events (Submitted)" = "SESS_RPT_REPORT_RESULTS_COMPLETED_ONLY",
    "Results by Questionnaire (Approved)" = "SESS_RPT_REPORT_RESULTS_COMPLETED_ONLY_NOT_LIMITED_PER_EVENT",
}

export enum SessionDetails {
    "Sess Id" = "SESS_RPT_ID",
    "Shift Date" = "SESS_RPT_SESSION_START_DATE",
    "Shift Name" = "SESS_RPT_SESSION"
}

export enum SystemFields {
    "Attach Type" = "SESS_RPT_ATTACH_TYPE",
    "Questionnaire ID" = "SESS_RPT_QS_ID"
}

export type SessionQuestionnairesResult = EventDetails | ReportDetails | ReportStatus | SessionDetails | SystemFields;
export default SessionQuestionnairesResult;
