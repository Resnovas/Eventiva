/**
 * Project: @eventiva/axlr8
 * File: AuditBooking.ts
 * Path: \src\util\reports\AuditBooking.ts
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

export enum AuditDetails {
    "Audit Item Name" = "AUDIT_META_USER_NAME",
    "Audit Key" = "AUDIT_KEY",
    "Browser" = "AUDIT_BROWSER",
    "Change Date" = "AUDIT_CHANGE_DATE",
    "Change Type" = "AUDIT_CHANGE_TYPE",
    "Change User" = "AUDIT_USER",
    "Meta Object" = "AUDIT_META_OBJECT",
    "Meta Object Key" = "AUDIT_META_OBJECT_KEY",
    "Meta Object Prop" = "AUDIT_META_OBJECT_PROP",
    "New Value" = "AUDIT_NEW_VALUE",
    "Old Value" = "AUDIT_OLD_VALUE",
}

export enum BookingData { 
    "Booking Created Date" = "AUDIT_BOOKING_CREATED_DATE",
    "Booking ID" = "AUDIT_BOOKING_KEY",
    "Contact ID" = "AUDIT_BOOKING_CONT_KEY",
    "Full Name" = "AUDIT_BOOKING_FULLNAME",
    "Session ID" = "_BOOKING_SESSION_ID",
    "Shift Date" = "AUDIT_BOOKING_START_DATE"
}

export enum EventDetails {
    "Event ID" = "AUDIT_EVENT_ID",
    "Venue" = "AUDIT_EVENT_NAME"
}

export enum SessionDetails {
    "Sess ID" = "AUDIT_SESSION_ID",
    "Shift Name" = "AUDIT_BOOKING_SESSION_NAME"
}

export type AuditBooking = AuditDetails | BookingData | EventDetails | SessionDetails;

export default AuditBooking;