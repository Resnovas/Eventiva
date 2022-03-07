/**
 * Project: @eventiva/axlr8
 * File: index.ts
 * Path: \src\util\reports\index.ts
 * Created Date: Friday, March 4th 2022
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



import AuditBooking from './AuditBooking';
import AuditLog from './AuditLog';
import AuditStaffActivity from './AuditStaffActivity';
import CompaniesSitesContracts from './CompaniesSitesContracts';
import EventSessionBooking from './EventSessionBooking';
import QuestionaireResponse from './QuestionnaireResponses';
import Stelify from './stelify'

export type filter = Stelify | AuditBooking | AuditLog | AuditStaffActivity | CompaniesSitesContracts | EventSessionBooking | QuestionaireResponse;
