/**
 * Project: @eventiva/axlr8
 * File: AuditLog.ts
 * Path: \src\util\reports\AuditLog.ts
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