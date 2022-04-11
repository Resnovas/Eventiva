/**
 * Project: @eventiva/internals
 * File: index.ts
 * Path: \src\index.ts
 * Created Date: Wednesday, March 2nd 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Mon Apr 11 2022
 * Modified By: Jonathan Stevens
 * Current Version: 0.0.5
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

import 'reflect-metadata'
import { PrismaClient } from '@prisma/client';
import { Database } from './database';
import { Authentication } from './Authentication';
import {ConstructData, Localizer, Logger, i18} from '@resnovas/utilities'
export * from './database/generated';

export class Internals {
  // Initialise database access
  private d = new Database()
  // Initialise the prisma client
  public db: PrismaClient = this.d.db
  // Initialise the logging class
  public logging: Logger = new Logger()
  // Initialise the Localisation class
  public i18n: Localizer = this.logging.i18
  // Initialise the authentication class
  public auth: Authentication = new Authentication(this.d)
  

  // Initialise the logging systems and I18n for the end user
  constructor(options?: { i18?: i18, logger: ConstructData }) {
    if (options) {
      this.logging.init(options)
    } else {
      options = { logger: { console: { enabled: true }, developer: "Resnovas" } }
    }
  }
}

export default new Internals();