export enum LinkedAsset {
    "Asset Key" = "PR_LA_KEY",
    "Batch no" = "PR_LA_BATCH_NO",
    "Comments" = "PR_LA_COMMENTS",
    "Condition" = "PR_LA_CONDITION_TEXT",
    "Current Value" = "PR_LA_CURRENT_VALUE",
    "Description" = "PR_LA_DESC",
    "Internal no" = "PR_LA_MODEL_NUMBER",
    "Number of Assets" = "PR_NUMBER_ASSETS",
    "Purchase cost" = "PR_LA_PURCHASE_COST",
    "Quantity" = "PR_LA_ASSET_QTY",
    "Ref" = "PR_LA_ASSET_REF",
    "Serial No" = "PR_LA_TARCK_NO",
    "Status" = "PR_LA_STATUS_TEXT",
    "Status Date" = "PR_LA_STATUS_DATE",
    "Track_war_date" = "PR_LA_WARRENTY_DATE",
}

export enum LinkedAssetLocation {
    "Checked In" = "PR_LA_LOC_IN_TIME_STAMP",
    "Checked Out" = "PR_LA_LOC_OUT_TIME_STAMP",
    "Current" = "PR_LA_LOC_CURRENT",
    "Location" = "PR_LA_LOC_FULL_LOCATION",
    "Location Note" = "PR_LA_LOC_COMMENT",
    "Location Type" = "PR_LA_LOC_FULL_LOCATION_META",
}

export enum Price {
    "+/- %" = "PR_MOV_PER",
    "Base Currency Price" = "PR_PRICE_SOURCE_PRICE_BASE_CUR",
    "Direct Price" = "PR_PRICE_DIRECT_COST_1",
    "Duty" = "PR_PRICE_DUTY",
    "EUR" = "PR_EUR_PRICE",
    "Landed Cost 1" = "PR_PRICE_LAND_COST_1",
    "Landed Cost 2" = "PR_PRICE_LAND_COST_2",
    "Our Price" = "PR_OUR_PRICE",
    "Overhead 1" = "PR_PRICE_OVERHEAD_1",
    "Overhead 2" = "PR_PRICE_OVERHEAD_2",
    "Price Last Changed" = "PR_MOV_DATE",
    "Prime Cost" = "PR_PRICE_LANDED_COST",
    "Quantity" = "PR_PRICE_QTY",
    "Retail Price" = "PR_RETAIL_PRICE",
    "Source Buy Price" = "PR_PRICE_SOURCE_PRICE",
    "Source Currency Price" = "PR_PRICE_SOURCE_CUR",
    "Start Date" = "PR_PRICE_START_DATE",
    "Uplift 1" = "PR_PRICE_UPLIFT_1",
    "Uplift 2" = "PR_PRICE_UPLIFT_2",
    "Uplift 3" = "PR_PRICE_UPLIFT_3",
    "Uplift 4" = "PR_PRICE_UPLIFT_4",
    "USD" = "PR_USD_PRICE"
}

export enum Product {
    "Available Date" = "PR_AVAIL_DATE",
    "Date Updated" = "PR_UPDATE_DATE",
    "Description" = "PR_PROD_DESC",
    "Intl Code 1" = "PR_INTL_CODE1",
    "Intl Code 2" = "PR_INTL_CODE2",
    "Intl Code 3" = "PR_INTL_CODE3",
    "Origin" = "PR_COUNTRY_OF_ORIGIN",
    "Primary Image" = "PR_PRIMARY_IMAGE",
    "Prod Key" = "PR_ID",
    "Product Code" = "PR_KEY",
    "Product Type" = "PR_TYPE_DESC",
    "Raw Materials" = "PR_MAT_DESC",
    "Retired" = "PR_RETIRED",
    "Status" = "PR_STATUS_TEXT"
}

export enum SupplierInfo {
    "Pallet Lot Size" = "PR_QS_PALLET_LOT_SIZE",
    "Re-packing Charge - 1kg" = "PR_RE_PACK_CHARGE_1KG",
    "RE-Packing Charge - 5kg" = "PR_RE_PACK_CHARGE_5KG",
    "Standard Packing Size" = "PR_QS_STD_PACK_SIZE",
    "Supplier Code" = "PR_ORG_ALPHA"
}

export enum VAT {
    "VAT Code" = "PR_VAT_CODE",
    "VAT Description" = "PR_VAT_DESC",
    "VAT Rate" = "PR_VAT_RATE"
}

export type Products = Product | LinkedAsset | LinkedAssetLocation | Price | SupplierInfo | VAT;
export default Products;
