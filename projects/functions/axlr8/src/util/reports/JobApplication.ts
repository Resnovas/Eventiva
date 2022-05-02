export enum AdvertMedium {
    "Medium Id" = "JP_AM_ID",
    "Medium Name" = "JP_AM_SHORTNAME"
}

export enum ContactCoreData {
    "Contact Key" = "JP_CONTACT_KEY",
    "First Name" = "JP_CONTACT_FIRSTNAME",
    "Last Name" = "JP_CONTACT_LASTNAME"
}

export enum FileAttach {
    "File attach description" = "JP_FILE_ATTACH_DESC",
    "File attach type" = "JP_FILE_ATTACH_TYPE",
    "File attach URL" = "JP_FILE_ATTACH_URL"
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

export type JobApplication = AdvertMedium | ContactCoreData | FileAttach | JobFields | JobPost;
export default JobApplication;