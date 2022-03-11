/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SIACheckController } from './../Controller';
import * as express from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "SIACheck": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "badge": {"dataType":"union","subSchemas":[{"ref":"SIABadge"},{"dataType":"enum","enums":[null]}]},
            "sia_id": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ACTIVE"]},{"dataType":"enum","enums":["REVOKED"]},{"dataType":"enum","enums":["SUSPENDED"]},{"dataType":"enum","enums":["NON_ACTIVE"]}],"required":true},
            "AuthUrl": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "pubUrl": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "error": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "transactions": {"dataType":"union","subSchemas":[{"ref":"Transaction"},{"dataType":"enum","enums":[null]}]},
            "transactionId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Account": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "username": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "accountType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["USER"]},{"dataType":"enum","enums":["BUSINESS"]},{"dataType":"enum","enums":["PROVIDER"]}],"required":true},
            "subsciption": {"dataType":"boolean","required":true},
            "employer": {"dataType":"array","array":{"dataType":"refObject","ref":"EmployersOnAccount"}},
            "employees": {"dataType":"array","array":{"dataType":"refObject","ref":"EmployersOnAccount"}},
            "accesses": {"dataType":"array","array":{"dataType":"refObject","ref":"SubuserOnAccount"}},
            "subusers": {"dataType":"array","array":{"dataType":"refObject","ref":"SubuserOnAccount"}},
            "accounts": {"dataType":"array","array":{"dataType":"refObject","ref":"ManagersOnAccount"}},
            "managers": {"dataType":"array","array":{"dataType":"refObject","ref":"ManagersOnAccount"}},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "lastLogin": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "applied": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "promoted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "retired": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "title": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["Miss"]},{"dataType":"enum","enums":["Ms"]},{"dataType":"enum","enums":["Mrs"]},{"dataType":"enum","enums":["Mr"]},{"dataType":"enum","enums":["Dr"]},{"dataType":"enum","enums":[null]}]},
            "firstname": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "midname": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "lastname": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "Salutation": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "dob": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "sex": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "label": {"dataType":"string","required":true},
            "password": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "resetPasswordToken": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "resetPasswordExpires": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "apiToken": {"dataType":"array","array":{"dataType":"refObject","ref":"Token"}},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "primaryAddress": {"dataType":"union","subSchemas":[{"ref":"Address"},{"dataType":"enum","enums":[null]}]},
            "addresses": {"dataType":"array","array":{"dataType":"refObject","ref":"Address"}},
            "contactOfAddress": {"dataType":"array","array":{"dataType":"refObject","ref":"ContactAtAddress"}},
            "application": {"dataType":"array","array":{"dataType":"refObject","ref":"Application"}},
            "emails": {"dataType":"array","array":{"dataType":"refObject","ref":"Email"}},
            "files": {"dataType":"array","array":{"dataType":"refObject","ref":"Files"}},
            "phones": {"dataType":"array","array":{"dataType":"refObject","ref":"Phone"}},
            "rtw": {"dataType":"array","array":{"dataType":"refObject","ref":"RTW"}},
            "sia": {"dataType":"array","array":{"dataType":"refObject","ref":"SIABadge"}},
            "Status": {"dataType":"array","array":{"dataType":"refObject","ref":"StatusOnAccount"}},
            "subscription": {"dataType":"array","array":{"dataType":"refObject","ref":"SubscriptionOnAccount"}},
            "transactions": {"dataType":"array","array":{"dataType":"refObject","ref":"Transaction"}},
            "_count": {"dataType":"union","subSchemas":[{"ref":"AccountCount"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmployersOnAccount": {
        "dataType": "refObject",
        "properties": {
            "accountId": {"dataType":"string","required":true},
            "employerId": {"dataType":"string","required":true},
            "account": {"ref":"Account"},
            "employer": {"ref":"Account"},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubuserOnAccount": {
        "dataType": "refObject",
        "properties": {
            "accountId": {"dataType":"string","required":true},
            "subuserId": {"dataType":"string","required":true},
            "account": {"ref":"Account"},
            "subuser": {"ref":"Account"},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManagersOnAccount": {
        "dataType": "refObject",
        "properties": {
            "accountId": {"dataType":"string","required":true},
            "managersId": {"dataType":"string","required":true},
            "account": {"ref":"Account"},
            "managers": {"ref":"Account"},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Token": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["API"]},{"dataType":"enum","enums":["PERSONAL"]},{"dataType":"enum","enums":["SYSTEM"]}],"required":true},
            "value": {"dataType":"string","required":true},
            "valid": {"dataType":"boolean","required":true},
            "expiry": {"dataType":"datetime","required":true},
            "account": {"ref":"Account"},
            "apiToken": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Address": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "account": {"ref":"Account"},
            "accountId": {"dataType":"string","required":true},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["PERSONAL"]},{"dataType":"enum","enums":["BUSINESS"]}],"required":true},
            "coords": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "street": {"dataType":"string","required":true},
            "city": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "state": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "country": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "zipcode": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "addressName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "name": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "parking": {"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}]},
            "contacts": {"dataType":"array","array":{"dataType":"refObject","ref":"ContactAtAddress"}},
            "website": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "hoursOfOperation": {"dataType":"union","subSchemas":[{"ref":"Prisma.JsonValue"},{"dataType":"enum","enums":[null]}]},
            "venueStyle": {"dataType":"array","array":{"dataType":"refObject","ref":"VenueStyle"}},
            "features": {"dataType":"string","required":true},
            "details": {"dataType":"union","subSchemas":[{"ref":"Prisma.JsonValue"},{"dataType":"enum","enums":[null]}]},
            "public": {"dataType":"boolean","required":true},
            "primaryAccount": {"dataType":"union","subSchemas":[{"ref":"Account"},{"dataType":"enum","enums":[null]}]},
            "primaryaccountId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "featuresOfBuisness": {"dataType":"array","array":{"dataType":"refObject","ref":"FeatureOfAddress"}},
            "phones": {"dataType":"array","array":{"dataType":"refObject","ref":"Phone"}},
            "rooms": {"dataType":"array","array":{"dataType":"refObject","ref":"Room"}},
            "_count": {"dataType":"union","subSchemas":[{"ref":"AddressCount"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContactAtAddress": {
        "dataType": "refObject",
        "properties": {
            "accountId": {"dataType":"string","required":true},
            "addressId": {"dataType":"string","required":true},
            "account": {"ref":"Account"},
            "address": {"ref":"Address"},
            "jobTitle": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "phone": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "email": {"dataType":"union","subSchemas":[{"ref":"Email"},{"dataType":"enum","enums":[null]}]},
            "emailId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Email": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "associatedContact": {"dataType":"array","array":{"dataType":"refObject","ref":"ContactAtAddress"}},
            "domain": {"dataType":"union","subSchemas":[{"ref":"Domain"},{"dataType":"enum","enums":[null]}]},
            "domainId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "email": {"dataType":"string","required":true},
            "account": {"dataType":"union","subSchemas":[{"ref":"Account"},{"dataType":"enum","enums":[null]}]},
            "accountId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "verified": {"dataType":"boolean","required":true},
            "public": {"dataType":"boolean","required":true},
            "primary": {"dataType":"boolean","required":true},
            "path": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "copy": {"dataType":"boolean","required":true},
            "notifyFrom": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "imap_authUser": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "imap_authPass": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "imap_accessToken": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "imap_authServer": {"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}]},
            "imap_host": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "imap_port": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "imap_secure": {"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}]},
            "imap_tslRejectUnauthorized": {"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}]},
            "imap_tslMinVersion": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "imap_resyncDelay": {"dataType":"double","required":true},
            "smtp_authUser": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "smtp_authPass": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "smtp_accessToken": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "smtp_authServer": {"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}]},
            "smtp_host": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "smtp_port": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "smtp_secure": {"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}]},
            "smtp_tslRejectUnauthorized": {"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}]},
            "smtp_tslMinVersion": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "oauth2_authorize": {"dataType":"boolean","required":true},
            "oauth2_provider": {"dataType":"string","required":true},
            "oauth2_authUser": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "oauth2_accessToken": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "oauth2_refreshToken": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "oauth2_expires": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "_count": {"dataType":"union","subSchemas":[{"ref":"EmailCount"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "JsonObject": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "JsonArray": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Prisma.JsonValue": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"},{"dataType":"boolean"},{"ref":"JsonObject"},{"ref":"JsonArray"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DomainCount": {
        "dataType": "refObject",
        "properties": {
            "linkedEmails": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Domain": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "domain": {"dataType":"string","required":true},
            "verified": {"dataType":"boolean","required":true},
            "dnsType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["TXT"]},{"dataType":"enum","enums":["CNAME"]}],"required":true},
            "linkedEmails": {"dataType":"array","array":{"dataType":"refObject","ref":"Email"}},
            "data": {"ref":"Prisma.JsonValue","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "_count": {"dataType":"union","subSchemas":[{"ref":"DomainCount"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmailCount": {
        "dataType": "refObject",
        "properties": {
            "associatedContact": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VenueStyleCount": {
        "dataType": "refObject",
        "properties": {
            "address": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VenueStyle": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "address": {"dataType":"array","array":{"dataType":"refObject","ref":"Address"}},
            "name": {"dataType":"string","required":true},
            "details": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "_count": {"dataType":"union","subSchemas":[{"ref":"VenueStyleCount"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Feature": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["STRING"]},{"dataType":"enum","enums":["BOOLEAN"]},{"dataType":"enum","enums":["NUMBER"]}],"required":true},
            "featureOfRoom": {"dataType":"array","array":{"dataType":"refObject","ref":"FeatureOfRoom"}},
            "featureOfAddress": {"dataType":"array","array":{"dataType":"refObject","ref":"FeatureOfAddress"}},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "_count": {"dataType":"union","subSchemas":[{"ref":"FeatureCount"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FeatureOfRoom": {
        "dataType": "refObject",
        "properties": {
            "roomId": {"dataType":"string","required":true},
            "featureId": {"dataType":"string","required":true},
            "feature": {"ref":"Feature"},
            "room": {"ref":"Room"},
            "data": {"dataType":"union","subSchemas":[{"ref":"Prisma.JsonValue"},{"dataType":"enum","enums":[null]}]},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ArrangementOfRoom": {
        "dataType": "refObject",
        "properties": {
            "roomId": {"dataType":"string","required":true},
            "arrangementId": {"dataType":"string","required":true},
            "arrangement": {"ref":"Arrangement"},
            "room": {"ref":"Room"},
            "capacity": {"dataType":"double","required":true},
            "details": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ArrangementCount": {
        "dataType": "refObject",
        "properties": {
            "room": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Arrangement": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "room": {"dataType":"array","array":{"dataType":"refObject","ref":"ArrangementOfRoom"}},
            "name": {"dataType":"string","required":true},
            "icon": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "details": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "_count": {"dataType":"union","subSchemas":[{"ref":"ArrangementCount"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Room": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "featuresOfRoom": {"dataType":"array","array":{"dataType":"refObject","ref":"FeatureOfRoom"}},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "address": {"ref":"Address"},
            "addressId": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "floor": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "building": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "accessibility": {"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}]},
            "checkin": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "checkout": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "length": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "width": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "height": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "arrangements": {"dataType":"array","array":{"dataType":"refObject","ref":"ArrangementOfRoom"}},
            "_count": {"dataType":"union","subSchemas":[{"ref":"RoomCount"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RoomCount": {
        "dataType": "refObject",
        "properties": {
            "featuresOfRoom": {"dataType":"double","required":true},
            "arrangements": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FeatureOfAddress": {
        "dataType": "refObject",
        "properties": {
            "addressId": {"dataType":"string","required":true},
            "featureId": {"dataType":"string","required":true},
            "feature": {"ref":"Feature"},
            "address": {"ref":"Address"},
            "data": {"dataType":"union","subSchemas":[{"ref":"Prisma.JsonValue"},{"dataType":"enum","enums":[null]}]},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FeatureCount": {
        "dataType": "refObject",
        "properties": {
            "featureOfRoom": {"dataType":"double","required":true},
            "featureOfAddress": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Phone": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "account": {"ref":"Account"},
            "accountId": {"dataType":"string","required":true},
            "address": {"ref":"Address"},
            "addressId": {"dataType":"string","required":true},
            "phone": {"dataType":"string","required":true},
            "public": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AddressCount": {
        "dataType": "refObject",
        "properties": {
            "contacts": {"dataType":"double","required":true},
            "venueStyle": {"dataType":"double","required":true},
            "featuresOfBuisness": {"dataType":"double","required":true},
            "phones": {"dataType":"double","required":true},
            "rooms": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Application": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "account": {"ref":"Account"},
            "accountId": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Files": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "rtw": {"dataType":"union","subSchemas":[{"ref":"RTW"},{"dataType":"enum","enums":[null]}]},
            "rtwId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "account": {"dataType":"array","array":{"dataType":"refObject","ref":"Account"}},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "_count": {"dataType":"union","subSchemas":[{"ref":"FilesCount"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RTWCount": {
        "dataType": "refObject",
        "properties": {
            "files": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RTW": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "files": {"dataType":"array","array":{"dataType":"refObject","ref":"Files"}},
            "name": {"dataType":"string","required":true},
            "active": {"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}]},
            "startDate": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "endDate": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "account": {"ref":"Account"},
            "accountId": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "_count": {"dataType":"union","subSchemas":[{"ref":"RTWCount"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FilesCount": {
        "dataType": "refObject",
        "properties": {
            "account": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SIABadge": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "licenseSector": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["CVIT"]},{"dataType":"enum","enums":["CP"]},{"dataType":"enum","enums":["DS"]},{"dataType":"enum","enums":["CCTV"]},{"dataType":"enum","enums":["SG"]},{"dataType":"enum","enums":["VI"]},{"dataType":"enum","enums":["KH"]},{"dataType":"enum","enums":["UNKNOWN"]}],"required":true},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["FRONTLINE"]},{"dataType":"enum","enums":["NON_FRONTLINE"]}],"required":true},
            "licenseExplanation": {"dataType":"string","required":true},
            "additionalTerms": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "active": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "expiry": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "siaChecks": {"dataType":"array","array":{"dataType":"refObject","ref":"SIACheck"}},
            "account": {"dataType":"union","subSchemas":[{"ref":"Account"},{"dataType":"enum","enums":[null]}]},
            "account_id": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "_count": {"dataType":"union","subSchemas":[{"ref":"SIABadgeCount"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StatusOnAccount": {
        "dataType": "refObject",
        "properties": {
            "statusId": {"dataType":"string","required":true},
            "accountId": {"dataType":"string","required":true},
            "status": {"ref":"Status"},
            "account": {"ref":"Account"},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StatusCount": {
        "dataType": "refObject",
        "properties": {
            "account": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Status": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "account": {"dataType":"array","array":{"dataType":"refObject","ref":"StatusOnAccount"}},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "_count": {"dataType":"union","subSchemas":[{"ref":"StatusCount"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubscriptionOnAccount": {
        "dataType": "refObject",
        "properties": {
            "subscriptionId": {"dataType":"string","required":true},
            "subscription": {"ref":"Subscription"},
            "account": {"ref":"Account"},
            "accountId": {"dataType":"string","required":true},
            "active": {"dataType":"boolean","required":true},
            "deactivated": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "activated": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "startedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubscriptionCount": {
        "dataType": "refObject",
        "properties": {
            "accounts": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Subscription": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "name": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "cost": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "details": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "accounts": {"dataType":"array","array":{"dataType":"refObject","ref":"SubscriptionOnAccount"}},
            "_count": {"dataType":"union","subSchemas":[{"ref":"SubscriptionCount"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TransactionCount": {
        "dataType": "refObject",
        "properties": {
            "SIACheck": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Transaction": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deleted": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "account": {"ref":"Account"},
            "accountId": {"dataType":"string","required":true},
            "SIACheck": {"dataType":"array","array":{"dataType":"refObject","ref":"SIACheck"}},
            "data": {"ref":"Prisma.JsonValue","required":true},
            "_count": {"dataType":"union","subSchemas":[{"ref":"TransactionCount"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AccountCount": {
        "dataType": "refObject",
        "properties": {
            "employer": {"dataType":"double","required":true},
            "employees": {"dataType":"double","required":true},
            "accesses": {"dataType":"double","required":true},
            "subusers": {"dataType":"double","required":true},
            "accounts": {"dataType":"double","required":true},
            "managers": {"dataType":"double","required":true},
            "apiToken": {"dataType":"double","required":true},
            "addresses": {"dataType":"double","required":true},
            "contactOfAddress": {"dataType":"double","required":true},
            "application": {"dataType":"double","required":true},
            "emails": {"dataType":"double","required":true},
            "files": {"dataType":"double","required":true},
            "phones": {"dataType":"double","required":true},
            "rtw": {"dataType":"double","required":true},
            "sia": {"dataType":"double","required":true},
            "Status": {"dataType":"double","required":true},
            "subscription": {"dataType":"double","required":true},
            "transactions": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SIABadgeCount": {
        "dataType": "refObject",
        "properties": {
            "siaChecks": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "License": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{"pattern":{"value":"10[0-9]\\{14\\}"}}},
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
        app.get('/sia/check/:id',

            function SIACheckController_checkLicense(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"ref":"License"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new SIACheckController();


              const promise = controller.checkLicense.apply(controller, validatedArgs as any);
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
