export enum Meta {
    "Change Date" = "AL_CHANGE_DATE",
    "Change Date/Time" = "AL_CHANGE_DATE_TIME",
    "Change OS/Browser" = "AL_META_CHANGE_BROWSER",
    "Change Type" = "AL_CHANGE_TYPE",
    "Meta Object Key" = "AL_META_OBJECT_KEY",
    "Meta Object" = "AL_META_OBJECT",
    "User" = "AL_USER"
}

export enum MetaProp {
    "Meta Object Prop" = "AL_META_PROP",
    "New Value" = "AL_NEW_VALUE",
    "Old Value" = "AL_OLD_VALUE"
}

export type AuditLog = Meta | MetaProp;
export default AuditLog