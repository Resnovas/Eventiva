/**
 * Project: @eventiva/axlr8
 * File: stelify.ts
 * Path: \src\util\reports\stelify.ts
 * Created Date: Monday, March 7th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Mon Mar 07 2022
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



enum report200 {
	'Applied Date' = 'OSCE_APPLIED_DATE',
	'Cont DOB' = 'OSCE_CONT_DOB',
	'Cont Email' = 'OSCE_CONT_EMAIL',
	'Cont Key' = 'OSCE_CONTACT_ID',
	'Date Last Logged in' = 'OSCE_CONTACT_ID',
	'Date Promoted' = 'OSCE_PROMOTE_DATE',
	'Date Retired' = 'OSCE_EMP_RETIRED_DATE',
	'First Name' = 'OSCE_CONT_1STNAME',
	'Last Name' = 'OSCE_CONT_LASTNAME',
	'Full Name' = 'OSCE_FULL_NAME',
	'Gender' = 'OSCE_CONT_SEX',
	'Interviewed by' = 'OSCE_VETTING_INTERVIEWED_BY',
	'Job App. Status' = 'ES_JOB_APP_STATUS',
	'Job App. Last Changed' = 'OSCE_JAS_LAST_CHANGE',
	'Mobile' = 'OSCE_CONTACT_MOBILE',
	'NI' = 'OSCE_EMP_NI',
	'Org Source' = 'OSCE_ORG_SOURCE',
	'Org Type' = 'OSCE_ORG_TYPE',
	'Payroll Number' = 'ES_EMP_PAYROLL_NO',
	'Postcode' = 'OSCE_SITE_POSTCODE',
	'Qualification' = 'SECT_QUAL_NAME',
	'Passed Date' = 'SECT_QUAL_PASS_DATE',
	'Expiry Date' = 'SECT_QUAL_TO',
	'Recent Booking' = 'OSCE_MOST_RECENT_BOOKING_DATE',
	'Who Promoted' = 'OSCE_EMP_PROMOTED_BY',
	'Operations Manager' = 'OSCE_EMP_APPLICANT_MANAGER',
	'Certificates' = 'SECT_QUAL_CERTIFICATE',
	'Active' = 'OSCE_EMP_ACTIVE',
	'JPJ Date Changed' = 'OSCE_JP_JAS_HISTORY_JPJ_DATE_CHANGED',
	'JPJ Change User' = 'OSCE_JP_JAS_HISTORY_JPJ_CHANGEUSER',
	'JPJ ID' = 'OSCE_JP_JAS_HISTORY_JPJ_ID',
	'JPJ JAS Status' = 'OSCE_JP_JAS_HISTORY_JPJ_CES_STATUS'
}
enum report208 {
	'Account No' = 'OSC_ORG_ALPHA',
	'Manager' = 'OSC_ORG_ACC_MGR',
	'Name' = 'OSC_ORG_NAME',
	'Tempaid Client Ref' = 'LU_LKH_ORG_410',
	'Tempaid Client Ref (Account Number)' = 'LU_LKH_SITE_411'
}

enum report222 {
	'Account No' = 'OSC_ORG_ALPHA',
	'Client' = 'ES_ORG_ALPHA',
	'Venue' = 'ES_EVENT_NAME_SELECT',
	'Session ID' = 'ES_EVENT_NAME_SELECT',
	'Sess ID' = 'ES_ID',
	'Customer ID' = 'ES_SITE_CUSTOMER_ID',
	'No. requested' = 'ES_SESSION_NUMBER_REQ',
	'Number Still Required' = 'ES_SESSION_NUMBER_STAFF_STILL_REQUIRED',
	'No. DNS' = 'ES_NUMBER_DNS',
	'Shift Date' = 'ES_SESSION_START_DATE',
	'Start Date/Time' = 'ES_ROLE_START_TIME',
	'End Date/Time' = 'ES_ROLE_END_TIME',
	'Booking Id' = 'ES_BOOKING_KEY',
	'Booking Status' = 'EMP_BOOKING_STATUS',
	'No. Confirmed' = 'ES_NO_CONFIRMED',
	'Staff Member Confirmed' = 'ES_BOOKING_WORKED_STATUS',
	'Attendee Status' = 'EMP_BOOKING_AVAILABILITY_STATUS',
	'Declined Status' = 'EMP_DECLINED_STATUS',
	'DNS' = 'ES_DID_NOT_SHOW',
	'DNS Reason' = 'ES_BOOKING_DNS_REASON',
	'Hour Rate' = 'ES_SESSION_BOOKING_HOUR_RATE',
	'Shift Rate' = 'ES_SESSION_BOOKING_DAY_RATE',
	'Staff Rate' = 'ES_RATE',
	'Staff Shift Rate' = 'ES_DAY_RATE',
	'Client Hourly Rate' = 'ES_SESSION_ROLE_RATE',
	'Full Name' = 'ES_CONTACT_FULLNAME',
	'NI Number' = 'LU_LKH_CONTACTS_45',
	'Email' = 'ES_CONTACT_EMAIL',
	'Operations Manager' = 'ES_EMP_APPLICANT_MANAGER',
	'Number of Strikes' = 'ES_CONT_STRIKES'
}

export type stelify = report200 | report208 | report222
export default stelify