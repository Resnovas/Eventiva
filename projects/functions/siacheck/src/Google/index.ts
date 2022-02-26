/**
 * File: index.ts
 * Project: @eventiva/siacheck
 * Created Date: Wednesday, February 23rd 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Fri Feb 25 2022
 * Modified By: Jonathan Stevens
 * -----
 * Copyright (c) 2022 Resnovas
 * -----
 * LICENSE: GNU General Public License v3.0 or later
 *
 * This program has been provided under confidence of the author and is licensed
 * under the terms of the GNU General Public License v3.0 or later as published as
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License v3.0 or later for more details.
 *
 * You should have received a copy of the GNU General Public License v3.0 or later
 * along with this program. If not, see http://www.gnu.org/licenses/gpl-3.0-standalone.html
 * -----
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

import 'reflect-metadata';

import { app } from '../util/app';
import { Express } from 'express';

/**============================================
 **               Google Handler
 *=============================================**/
/**
 * An entry point for Google Cloud Functions.
 * Google supports Express.js and Node.js so this basically just wraps the Express.js entry point.
 * @see ../Util/app.ts for the Express.js entry point details.
 * @public
 */

export const handler: Express = app;
