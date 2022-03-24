/**
 * Project: @eventiva/internals
 * File: index.ts
 * Path: \src\index.ts
 * Created Date: Wednesday, March 2nd 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Wed Mar 23 2022
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
import * as database from './database';
export * from './database';

export class Internals {
  static db: PrismaClient;
  static database = database;

  constructor() {
    Internals.db = new PrismaClient();
    Internals.db.$use(async (params: any, next: any) => this.softDelete(params, next));
  }


  softDelete(params: any, next: any) {
  if (params.action == 'findUnique') {
    // Change to findFirst - you cannot filter
    // by anything except ID / unique with findUnique
    params.action = 'findFirst';
    // Add 'deleted' filter
    // ID filter maintained
    params.args.where['deleted'] = null;
  }
  if (params.action == 'findMany') {
    // Find many queries
    if (params.args.where != undefined) {
      if (params.args.where.deleted == undefined) {
        // Exclude deleted records if they have not been explicitly requested
        params.args.where['deleted'] = null;
      }
    } else {
      params.args['where'] = { deleted: null };
    }
  }
  if (params.action == 'update') {
    // Change to updateMany - you cannot filter
    // by anything except ID / unique with findUnique
    params.action = 'updateMany';
    // Add 'deleted' filter
    // ID filter maintained
    params.args.where['deleted'] = null;
  }
  if (params.action == 'updateMany') {
    if (params.args.where != undefined) {
      params.args.where['deleted'] = null;
    } else {
      params.args['where'] = { deleted: null };
    }
  }
  if (params.action == 'delete') {
    // Delete queries
    // Change action to an update
    params.action = 'update';
    params.args['data'] = { deleted: new Date() };
  }
  if (params.action == 'deleteMany') {
    // Delete many queries
    params.action = 'updateMany';
    if (params.args.data != undefined) {
      params.args.data['deleted'] = new Date();
    } else {
      params.args['data'] = { deleted: new Date() };
    }
  }
  return next(params);
}
}

export default Internals;
