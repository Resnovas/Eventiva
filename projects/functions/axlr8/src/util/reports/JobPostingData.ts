export enum AdvertMedium {
    "Days before filled" = "JP_JP_PUBLISHED_NUMBER_DAYS",
    "First Published" = "JP_AM_FIRST_PUBLISHED",
    "Last Edited" = "JP_AM_LAST_EDITED",
    "Medium Id" = "JP_AM_ID",
    "Medium Name" = "JP_AM_SHORTNAME",
    "Open" = "JP_JP_MEDIUM_PUBLISHED",
    "Vacancy Open" = "JP_JP_DAYS_SINCE_PUBLISHED"
}


export enum JobFields {
    "Field Current Value" = "JP_FV_VALUE",
    "Field Form Id" = "JP_FM_FORMID",
    "Field Name" = "JP_FM_NAME",
    "Field Required" = "JP_FM_REQUIRED",
    "Field will publish" = "JP_FV_WILLPUBLISH"
}

export enum JobPost {
    "Job Post Id" = "JP_JP_ID",
    "Job Post Name" = "JP_JP_NAME",
    "Job Post Reference" = "JP_JP_POSTREF",
    "Job Post Status" = "JP_JP_POSTSTATUS"
}

export enum JobPostData {
    "Applicant Expectations" = "JP_JP_JOB_APPLICANT_EXPECTATIONS",
    "Applicant Instructions" = "JP_JP_JOB_APPLICANT_INSTRUCTIONS",
    "Application Deadline" = "JP_JP_APPLICATION_DEADLINE",
    "Application Form URL" = "JP_JP_JOB_APP_FORM_URL",
    "Call This Number" = "JP_JP_JOB_CALL_NUMBER",
    "County" = "JP_JP_JOB_COUNTY",
    "CV Required" = "JP_JP_JOB_CV_REQUIRED",
    "Department" = "JP_JP_JOB_DEPARTMENT",
    "Email us here" = "JP_JP_JOB_EMAIL_US_HERE",
    "Finance Sign Date" = "JP_JP_JOB_FIN_SIGN_DATE",
    "Finance Signature" = "JP_JP_JOB_FIN_SIG",
    "Hiring Criteria" = "JP_JP_JOB_HIRING",
    "Hours per week" = "JP_JP_JOB_HOURS",
    "HR Sign Date" = "JP_JP_JOB_HR_SIGN_DATE",
    "HR Signature" = "JP_JP_JOB_HR_SIG",
    "Job Description" = "JP_JP_JOB_DESCRIPTION",
    "Job Details URL" = "JP_JP_JOB_DETAILS_URL",
    "Job Title" = "JP_JP_JOB_TITLE",
    "Key Skills" = "JP_JP_JOB_KEY_SKILLS",
    "Link to website" = "JP_JP_JOB_WEBSITE_LINK",
    "Location" = "JP_JP_JOB_LOCATION",
    "Objective of the role" = "JP_JP_JOB_ROLE_OBJECTIVES",
    "Postal Applications" = "JP_JP_JOB_POSTAL_APPLICATIONS",
    "Postal District" = "JP_JP_JOB_POST_DISTICT",
    "Postcode" = "JP_JP_JOB_POST_CODE",
    "Region" = "JP_JP_JOB_REGION",
    "Reports To" = "JP_JP_JOB_REPORTS_TO",
    "Salery" = "JP_JP_JOB_SALARY",
    "Year/Month/Week/Day/Hour" = "JP_JP_JOB_UNIT"
}

export enum JobPostSummaryData {
    "Number of applicants" = "JP_JP_NUMBER_APPLIED"
}

export type JobPostingData = AdvertMedium | JobFields | JobPost | JobPostData | JobPostSummaryData;
export default JobPostingData;