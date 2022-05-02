import Common from "./common";

export enum MailedContact {
    "Email" = "MP_CONT_EMAIL"
}

export enum PreviewDetail {
    "Full Name" = "MP_FULL_NAME",
    "Opted Out" = "MP_PREVIEW_OPTED_OUT",
    "Preview Cont Key" = "MP_PREVIEW_CONT_KEY",
    "Preview Key" = "MP_PREVIEW_KEY"
}

export type MailingPreview = Common | MailedContact | PreviewDetail;
export default MailingPreview;