export enum Meta {
    "Meta Object" = "RB_RUN_META_OBJECT",
    "Run Date" = "RB_RUN_RUN_DATE",
    "Run Time" = "RB_RUN_RUN_TIME",
    "User" = "RB_RUN_USER"
}

export enum MetaProp {
    "Meta Prop Audit Key" = "RB_RUN_MAP_AUDIT_KEY",
    "Prop" = "RB_RUN_META_PROP",
    "Value" = "RB_RUN_NEW_VALUE",
    "Value as Number" = "RB_RUN_NEW_VALUE_AS_NUMBER"
}

export enum Employee { 
    "Employee" = "RB_RUN_EMPLOYEE",
    "Report ID" = "RB_RUN_RPT_CONFIG_ID",
    "Report Name" = "RB_RUN_REPORT_NAME"
}

export enum System {
    "Audit Key" = "RB_RUN_AUDIT_KEY"
}

export type RBRunAnalysis = Meta | MetaProp | Employee | System;