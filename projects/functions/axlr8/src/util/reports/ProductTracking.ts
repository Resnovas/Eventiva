export enum Asset {
    "Allocated to Employee" = "AT_EMP_OWNER_DESC",
    "Asset id" = "AT_KEY",
    "Asset Owner Contact Key" = "AT_EMP_CONT_FKEY",
    "Batch no" = "AT_BATCH_NO",
    "Can be booked" = "AT_AVAILABLE_FOR_BOOKING",
    "Comments" = "AT_COMMENTS",
    "Company Owner" = "AT_FROM_ORG_NAME",
    "Confition" = "AT_CONDITION_TEXT",
    "Contact Status" = "AT_EMP_OWNER_CONTACT_STATUS",
    "Current Value" = "AT_CURRENT_VALUE",
    "Description" = "AT_DESC",
    "Image" = "AT_PRIMARY_IMAGE_THUMB",
    "Internal No" = "AT_MODEL_NUMBER",
    "Job App Status" = "AT_EMP_OWNER_JOB_APP_STATUS",
    "Maintenance Organisation" = "AT_MAINT_ORG_NAME",
    "Manufacturer" = "AT_MANUFACTURE_ORG_NAME",
    "Primary Image Full size" = "AT_PRIMARY_IMAGE",
    "Purchase Cost" = "AT_PURCHASE_COST",
    "Quantity" = "AT_ASSET_QTY",
    "Ref" = "AT_ASSET_REF",
    "Serial No" = "AT_TARCK_NO",
    "Set By" = "AT_EMP_DESC",
    "Status" = "AT_STATUS_TEXT",
    "Status Date" = "AT_STATUS_DATE",
    "Track_war_date" = "AT_WARRENTY_DATE",
    "Type" = "AT_TYPE_TEXT"
}

export enum JobBookingAvailablility {
    "Available for booking" = "AT_BOOKING_JOB_AVAILABLE",
    "Description" = "AT_BOOKING_SHORTDESC",
    "Job No" = "AB_SUPPORT_DATE_DUE",
    "Total Booked on that job" = "AT_LSA_TOTAL_CLASHES",
    "Total Qty Available for job" = "AT_BOOKING_JOB_TOTAL_AVAILABLE"
}

export enum JobBookingDetails {
    "Booking Key" = "AB_JOB_BOOKING_KEY",
    "Booking Status" = "AT_BOOKING_STATUS_TEXT",
    "Existing Booking Key" = "AT_BOOKING_KEY_TO_EDIT"
}

export enum Location {
    "Checked In" = "AT_LOC_IN_TIME_STAMP",
    "Checked Out" = "AT_LOC_OUT_TIME_STAMP",
    "Current" = "AT_LOC_CURRENT",
    "Loc Note" = "AT_LOC_COMMENT",
    "Location" = "AT_LOC_FULL_LOCATION",
    "Location Type" = "AT_LOC_FULL_LOCATION_META"
}

export enum Product {
    "Product" = "AT_PROD_DESC",
    "Product Link" = "AT_PROD_ID",
    "Product Type" = "AT_PRODUCT_TYPE_DESC"
}

export enum SalesOrder {
    "Order Date" = "AT_SO_ORDER_DATE",
    "Sales Order" = "AT_SO_ORDER_NO",
    "Sales Order Contact" = "AT_SO_CONT_KEY",
    "Sale Order Contact Name" = "AT_SO_CONT_FULL_NAME"
}

export enum System {
    "Maintenance Company" = "AT_MAINT_ORG_KEY",
    "Manufacturer key" = "AT_MANUFACTURE_ORG_KEY",
}

export enum Test {
    "Next Test Due" = "AT_NEXT_TEST_DUE",
    "Test Closed" = "AT_TEST_CLOSED",
    "Test Code" = "AT_TEST_CODE",
    "Test Comments" = "AT_TEST_COMMENTS",
    "Test Due" = "AT_TEST_DUE",
    "Test Id" = "AT_TEST_ID",
    "Test Ref" = "AT_TEST_REF",
    "Test Status" = "AT_TEST_STATUS",
    "Test Status Date" = "AT_TEST_STATUS_DATE"
}

export enum SessionAvailability {
    "Event Id" = "AT_BOOKING_EVENT_ID",
    "Venue" = "AT_BOOKING_EVENT_NAME_SELECT"
}

export type ProductTracking = Asset | JobBookingAvailablility | JobBookingDetails | Location | Product | SalesOrder | System | Test | SessionAvailability;
export default ProductTracking;