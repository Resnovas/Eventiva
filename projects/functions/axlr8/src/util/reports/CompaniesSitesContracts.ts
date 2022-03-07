/**
 * Project: @eventiva/axlr8
 * File: CompaniesSitesContracts.ts
 * Path: \src\util\reports\CompaniesSitesContracts.ts
 * Created Date: Thursday, March 3rd 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Fri Mar 04 2022
 * Modified By: Jonathan Stevens
 * Current Version: 1.0.0
 * -----
 * Copyright (c) 2022 Resnovas - All Rights Reserved
 * -----
 * LICENSE: GNU General Public License v3.0 or later (GPL-3.0+)
 * 
 * This program has been provided under confidence of the copyright holder and is 
 * licensed for copying, distribution and modification under the terms of
 * the GNU General Public License v3.0 or later (GPL-3.0+) published as the License,
 * or (at your option) any later version of this license.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License v3.0 or later for more details.
 * 
 * You should have received a copy of the GNU General Public License v3.0 or later
 * along with this program. If not, please write to: jonathan@resnovas.com ,
 * or see http://www.gnu.org/licenses/gpl-3.0-standalone.html
 * 
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE - PLEASE SEE THE LICENSE FILE FOR DETAILS
 * -----
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

import Common from "./common";


export enum CallBacks {
    "Call" = "OSC_CALL_LINK",
    "Call ID" = "OSC_CALL_CALLBACK_NO",
    "Call Open" = "OSC_CALL_OPEN",
    "Call Reason" = "OSC_CALL_REASON",
    "Call Time" = "OSC_CALL_TIME",
    "Created By" = "OSC_CALL_SETUP_BY",
    "Created For" = "OSC_CALL_FOR_USER",
    "Date Updated" = "OSC_CALL_CLOSED",
    "Priority" = "OSC_CALL_PRIORTY",
    "Result of Call" = "OSC_CALL_RESULT",
    "Result Text" = "OSC_CALL_RESULT_DESC",
    "Type" = "OSC_CALL_TYPE"
}

export enum ContactDetails {
    "Applied Date" = "OSC_APPLIED_DATE",
    "Company Created" = "OSC_ORG_LOAD_DATA",
    "Cont DOB" = "OSC_CONT_DOB",
    "Cont Key" = "OSC_CONTACT_ID",
    "Cont Telephone" = "OSC_CONT_TELEPHONE",
    "Contact Features" = "OSC_CONT_FEATURES",
    "Email" = "OSC_CONT_EMAIL",
    "First Name" = "OSC_CONT_1STNAME",
    "Full Name" = "OSC_FULL_NAME",
    "Last Name" = "OSC_CONT_LASTNAME",
    "Last, FirstName" = "OSC_FULL_NAME_LAST_FIRST",
    "Middle Name" = "OSC_CONT_MIDDLENAME",
    "Mobile" = "OSC_CONTACT_MOBILE",
    "Private Notes" = "OSC_CONT_PRIVATE_NOTES",
    "Salutation" = "OSC_CONT_SALUTATION"
}

export enum ContactNotes {
    "Note" = "OSC_CONTACT_NOTE1",
    "Note Date" = "OSC_CONTACT_NOTE_DATE"
}

export enum ContactStatus {
    "Contact Status" = "ES_CONTACT_STATUS"
}

export enum Files {
    "Date Added" = "OSC_FA_DATE_ADDED",
    "File Description" = "OSC_FA_ATTACH_DESC",
    "File Link" = "OSC_FA_URL",
    "File Name" = "OSC_FA_ATTACH_NAME",
    "File Obsolete" = "OSC_FA_FILE_OBSOLETE",
    "File Type" = "OSC_FACT_CUST_TYPE",
    "Number of Files" = "OSC_FA_NUMBER_OF_FILES"
}

export enum TalentDate {
    "Talent Category" = "OSC_TH_TALENT_VALUE"
}

export type CompaniesSitesContracts = CallBacks | ContactDetails | ContactNotes | ContactStatus | Files | TalentDate | Common;
export default CompaniesSitesContracts;