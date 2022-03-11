/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SIACheckController } from './../Controller';
import * as express from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "postDataString": {
        "dataType": "refObject",
        "properties": {
            "rptId": {"dataType":"double","required":true},
            "rptFilters": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"values":{"dataType":"string","required":true},"operator":{"dataType":"string","required":true},"filter":{"dataType":"string","required":true}}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "reportResult": {
        "dataType": "refObject",
        "properties": {
            "result": {"dataType":"boolean","required":true},
            "success": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"}]}}},{"dataType":"enum","enums":[false]}],"required":true},
            "error": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":[null]},{"dataType":"string"}],"required":true},
            "debug": {"ref":"postDataString","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "report200": {
        "dataType": "refEnum",
        "enums": ["OSCE_APPLIED_DATE","OSCE_CONT_DOB","OSCE_CONT_EMAIL","OSCE_CONTACT_ID","OSCE_CONTACT_ID","OSCE_PROMOTE_DATE","OSCE_EMP_RETIRED_DATE","OSCE_CONT_1STNAME","OSCE_CONT_LASTNAME","OSCE_FULL_NAME","OSCE_CONT_SEX","OSCE_VETTING_INTERVIEWED_BY","ES_JOB_APP_STATUS","OSCE_JAS_LAST_CHANGE","OSCE_CONTACT_MOBILE","OSCE_EMP_NI","OSCE_ORG_SOURCE","OSCE_ORG_TYPE","ES_EMP_PAYROLL_NO","OSCE_SITE_POSTCODE","SECT_QUAL_NAME","SECT_QUAL_PASS_DATE","SECT_QUAL_TO","OSCE_MOST_RECENT_BOOKING_DATE","OSCE_EMP_PROMOTED_BY","OSCE_EMP_APPLICANT_MANAGER","SECT_QUAL_CERTIFICATE","OSCE_EMP_ACTIVE","OSCE_JP_JAS_HISTORY_JPJ_DATE_CHANGED","OSCE_JP_JAS_HISTORY_JPJ_CHANGEUSER","OSCE_JP_JAS_HISTORY_JPJ_ID","OSCE_JP_JAS_HISTORY_JPJ_CES_STATUS"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "report208": {
        "dataType": "refEnum",
        "enums": ["OSC_ORG_ALPHA","OSC_ORG_ACC_MGR","OSC_ORG_NAME","LU_LKH_ORG_410","LU_LKH_SITE_411"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "report222": {
        "dataType": "refEnum",
        "enums": ["OSC_ORG_ALPHA","ES_ORG_ALPHA","ES_EVENT_NAME_SELECT","ES_EVENT_NAME_SELECT","ES_ID","ES_SITE_CUSTOMER_ID","ES_SESSION_NUMBER_REQ","ES_SESSION_NUMBER_STAFF_STILL_REQUIRED","ES_NUMBER_DNS","ES_SESSION_START_DATE","ES_ROLE_START_TIME","ES_ROLE_END_TIME","ES_BOOKING_KEY","EMP_BOOKING_STATUS","ES_NO_CONFIRMED","ES_BOOKING_WORKED_STATUS","EMP_BOOKING_AVAILABILITY_STATUS","EMP_DECLINED_STATUS","ES_DID_NOT_SHOW","ES_BOOKING_DNS_REASON","ES_SESSION_BOOKING_HOUR_RATE","ES_SESSION_BOOKING_DAY_RATE","ES_RATE","ES_DAY_RATE","ES_SESSION_ROLE_RATE","ES_CONTACT_FULLNAME","LU_LKH_CONTACTS_45","ES_CONTACT_EMAIL","ES_EMP_APPLICANT_MANAGER","ES_CONT_STRIKES"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "stelify": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"report200"},{"ref":"report208"},{"ref":"report222"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuditDetails": {
        "dataType": "refEnum",
        "enums": ["AUDIT_META_USER_NAME","AUDIT_KEY","AUDIT_BROWSER","AUDIT_CHANGE_DATE","AUDIT_CHANGE_TYPE","AUDIT_USER","AUDIT_META_OBJECT","AUDIT_META_OBJECT_KEY","AUDIT_META_OBJECT_PROP","AUDIT_NEW_VALUE","AUDIT_OLD_VALUE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BookingData": {
        "dataType": "refEnum",
        "enums": ["AUDIT_BOOKING_CREATED_DATE","AUDIT_BOOKING_KEY","AUDIT_BOOKING_CONT_KEY","AUDIT_BOOKING_FULLNAME","_BOOKING_SESSION_ID","AUDIT_BOOKING_START_DATE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EventDetails": {
        "dataType": "refEnum",
        "enums": ["AUDIT_EVENT_ID","AUDIT_EVENT_NAME"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SessionDetails": {
        "dataType": "refEnum",
        "enums": ["AUDIT_SESSION_ID","AUDIT_BOOKING_SESSION_NAME"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuditBooking": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"AuditDetails"},{"ref":"BookingData"},{"ref":"EventDetails"},{"ref":"SessionDetails"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Meta": {
        "dataType": "refEnum",
        "enums": ["AL_CHANGE_DATE","AL_CHANGE_DATE_TIME","AL_META_CHANGE_BROWSER","AL_CHANGE_TYPE","AL_META_OBJECT_KEY","AL_META_OBJECT","AL_USER"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MetaProp": {
        "dataType": "refEnum",
        "enums": ["AL_META_PROP","AL_NEW_VALUE","AL_OLD_VALUE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuditLog": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"Meta"},{"ref":"MetaProp"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BookingSummary": {
        "dataType": "refEnum",
        "enums": ["ASA_SESSIONS_WORKED","ASA_FIRST_BOOKING","ASA_TOTAL_HOURS_WORKED","ASA_BOOKING_BOOKED","ASA_TOTAL_PAY"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginSummary": {
        "dataType": "refEnum",
        "enums": ["ASA_NO_LOGINS"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StaffAddress": {
        "dataType": "refEnum",
        "enums": ["ASA_SITE_LOC_3","ASA_SITE_COUNTY","ASA_SITE_POSTCODE","ASA_SITE_BUILD_1","ASA_SITE_BUILD_2","ASA_SITE_ID","ASA_SITE_SUMM","ASA_SITE_THORO_1","ASA_SITE_TELE","ASA_SITE_LOC_1","ASA_SITE_LOC_2"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StaffAvailability": {
        "dataType": "refEnum",
        "enums": ["ASA_AVAIL_EXTENDED_DESC","ASA_AVAIL_CALANDER_DATE","ASA_AVAIL_BOOL"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StaffEmployeeData": {
        "dataType": "refEnum",
        "enums": ["ASA_EMP_BANK_ACC_NO","ASA_EMP_ACTIVE","ASA_EMP_ADDRESS_LAST_CHANGED","ASA_PROMOTE_DATE","ASA_EMP_RETIRED_DATE","ASA_EMAIL_LAST_CHANGED","ASA_EMAIL_LAST_CHANGED","ASA_EMP_NI","ASA_EMP_PASSPORT_COUNTRY","ASA_EMP_PASSPORT_EXPIRY","ASA_EMP_PASSPORT_NUMBER","ASA_EMP_PAYROLL_NO","ASA_EMP_ROLL_REF_NO","ASA_EMP_BANK_SORT","ASA_EMP_DESC"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StaffOrganisationData": {
        "dataType": "refEnum",
        "enums": ["ASA_ORG_ALPHA","ASA_ORG_ACC_MGR","ASA_ORG_ID","ASA_ORG_ID","ASA_ORG_SOURCE","ASA_ORG_TYPE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StaffStatus": {
        "dataType": "refEnum",
        "enums": ["ES_CONTACT_STATUS","ASA_JOB_APP_STATUS"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StaffDetails": {
        "dataType": "refEnum",
        "enums": ["ASA_APPLIED_DATE","ASA_CONT_DOB","ASA_CONTACT_ID","ASA_CONT_FEATURES","ASA_CONT_EMAIL","ASA_CONT_1STNAME","ASA_CONT_LASTNAME","ASA_FULL_NAME","ASA_FULL_NAME","ASA_CONT_JOB_TITLE","ASA_FULL_NAME_LAST_FIRST","ASA_CONT_MIDDLENAME","ASA_CONTACT_MOBILE","ASA_CONT_PRIVATE_NOTES","ASA_CONT_SALUTATION"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Lookups": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["AdminContactProfiles"]},{"dataType":"enum","enums":["ContactProfiles"]},{"dataType":"enum","enums":["OrganisationLookups"]},{"dataType":"enum","enums":["SiteInformation"]}],"required":true},
            "value": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Common": {
        "dataType": "refAlias",
        "type": {"ref":"Lookups","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuditStaffActivity": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"BookingSummary"},{"ref":"LoginSummary"},{"ref":"StaffAddress"},{"ref":"StaffAvailability"},{"ref":"StaffEmployeeData"},{"ref":"StaffOrganisationData"},{"ref":"StaffStatus"},{"ref":"StaffDetails"},{"ref":"Common"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CallBacks": {
        "dataType": "refEnum",
        "enums": ["OSC_CALL_LINK","OSC_CALL_CALLBACK_NO","OSC_CALL_OPEN","OSC_CALL_REASON","OSC_CALL_TIME","OSC_CALL_SETUP_BY","OSC_CALL_FOR_USER","OSC_CALL_CLOSED","OSC_CALL_PRIORTY","OSC_CALL_RESULT","OSC_CALL_RESULT_DESC","OSC_CALL_TYPE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContactDetails": {
        "dataType": "refEnum",
        "enums": ["OSC_APPLIED_DATE","OSC_ORG_LOAD_DATA","OSC_CONT_DOB","OSC_CONTACT_ID","OSC_CONT_TELEPHONE","OSC_CONT_FEATURES","OSC_CONT_EMAIL","OSC_CONT_1STNAME","OSC_FULL_NAME","OSC_CONT_LASTNAME","OSC_FULL_NAME_LAST_FIRST","OSC_CONT_MIDDLENAME","OSC_CONTACT_MOBILE","OSC_CONT_PRIVATE_NOTES","OSC_CONT_SALUTATION"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContactNotes": {
        "dataType": "refEnum",
        "enums": ["OSC_CONTACT_NOTE1","OSC_CONTACT_NOTE_DATE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContactStatus": {
        "dataType": "refEnum",
        "enums": ["ES_CONTACT_STATUS"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Files": {
        "dataType": "refEnum",
        "enums": ["OSC_FA_DATE_ADDED","OSC_FA_ATTACH_DESC","OSC_FA_URL","OSC_FA_ATTACH_NAME","OSC_FA_FILE_OBSOLETE","OSC_FACT_CUST_TYPE","OSC_FA_NUMBER_OF_FILES"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TalentDate": {
        "dataType": "refEnum",
        "enums": ["OSC_TH_TALENT_VALUE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompaniesSitesContracts": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"CallBacks"},{"ref":"ContactDetails"},{"ref":"ContactNotes"},{"ref":"ContactStatus"},{"ref":"Files"},{"ref":"TalentDate"},{"ref":"Common"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EventAddress": {
        "dataType": "refEnum",
        "enums": ["ES_EVENT_ADDRESS","ES_EVENT_VENUE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Client": {
        "dataType": "refEnum",
        "enums": ["ES_CLIENT_ACCOUNT_MANAGER","ES_ORG_ALPHA","ES_ORG_TYPE","ES_EVENT_ORG"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ThirdPartyContact": {
        "dataType": "refEnum",
        "enums": ["ES_EV3P_CONTACT_FULLNAME"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EventCustomFields": {
        "dataType": "refEnum",
        "enums": ["ES_EVENT_CUSTOM_FIELD_2","ES_EVENT_CUSTOM_FIELD_3","ES_EVENT_CUSTOM_FIELD_4","ES_EVENT_CUSTOM_FIELD_5","ES_EVENT_CUSTOM_FIELD_1"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EventInvoice": {
        "dataType": "refEnum",
        "enums": ["ES_EVENT_INVOICE_AMOUNT","ES_EVENT_INVOICE_DATE","ES_EVENT_INVOICE_NO","ES_EVENT_INVOICE_PAID","ES_EVENT_INVOICE_PAID_AMOUNT","ES_EVENT_INVOICE_PAID_DATE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EventSessionBooking": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"EventDetails"},{"ref":"EventAddress"},{"ref":"Client"},{"ref":"ThirdPartyContact"},{"ref":"EventCustomFields"},{"ref":"EventInvoice"},{"ref":"SessionDetails"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "QuestionnaireDetails": {
        "dataType": "refEnum",
        "enums": ["QS_CONT_QS_NAME","QS_CONT_QS_ID","QS_CONT_QS_LINK","QS_CONT_RESPONSE_DATE","QS_CONT_QS_STATUS_ID","QS_CONT_WEIGTHING","QS_CONT_QS_STATUS","QS_RESPONSE_ATTEMPTS","QS_ATTEMPTS_REMAINING","QS_RESPONSE_LOCKED","QS_MAX_ATTEMPTS","QS_UNLOCK_RESET_LINK","QS_CONT_META_OBJECT_TYPE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "QuestionnaireStatus": {
        "dataType": "refEnum",
        "enums": ["QS_CONT_NO_SUBMITTED_BY_QS","QS_CONT_RESULTS_BY_QUESTIONARE_COMPLETED"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "QuestionnaireProfiles": {
        "dataType": "refEnum",
        "enums": ["QS_CONT_META_OBJECT_TYPE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "QuestionnaireResponse": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"QuestionnaireDetails"},{"ref":"QuestionnaireStatus"},{"ref":"QuestionnaireProfiles"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "filter": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"stelify"},{"ref":"AuditBooking"},{"ref":"AuditLog"},{"ref":"AuditStaffActivity"},{"ref":"CompaniesSitesContracts"},{"ref":"EventSessionBooking"},{"ref":"QuestionnaireResponse"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "rptFilters": {
        "dataType": "refObject",
        "properties": {
            "filter": {"ref":"filter","required":true},
            "operator": {"dataType":"string","required":true},
            "values": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: express.Router) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
        app.post('/axlr8/report/:rptId',

            function SIACheckController_getData(request: any, response: any, next: any) {
            const args = {
                    rptId: {"in":"path","name":"rptId","required":true,"dataType":"double"},
                    url: {"in":"query","name":"url","required":true,"dataType":"string"},
                    api_user: {"in":"header","name":"api_user","required":true,"dataType":"string"},
                    api_user_pw: {"in":"header","name":"api_user_pw","required":true,"dataType":"string"},
                    rptFilters: {"in":"body","name":"rptFilters","required":true,"dataType":"array","array":{"dataType":"refObject","ref":"rptFilters"}},
                    notFoundResponse: {"in":"res","name":"422","required":true,"ref":"reportResult"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new SIACheckController();


              const promise = controller.getData.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, successStatus: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode = successStatus;
                let headers;
                if (isController(controllerObj)) {
                    headers = controllerObj.getHeaders();
                    statusCode = controllerObj.getStatus() || statusCode;
                }

                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                returnHandler(response, statusCode, data, headers)
            })
            .catch((error: any) => next(error));
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function returnHandler(response: any, statusCode?: number, data?: any, headers: any = {}) {
        if (response.headersSent) {
            return;
        }
        Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
        });
        if (data && typeof data.pipe === 'function' && data.readable && typeof data._read === 'function') {
            data.pipe(response);
        } else if (data !== null && data !== undefined) {
            response.status(statusCode || 200).json(data);
        } else {
            response.status(statusCode || 204).end();
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function responder(response: any): TsoaResponse<HttpStatusCodeLiteral, unknown>  {
        return function(status, data, headers) {
            returnHandler(response, status, data, headers);
        };
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function getValidatedArgs(args: any, request: any, response: any): any[] {
        const fieldErrors: FieldErrors  = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'formData':
                    if (args[key].dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.file, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else if (args[key].dataType === 'array' && args[key].array.dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.files, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else {
                        return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    }
                case 'res':
                    return responder(response);
            }
        });

        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
