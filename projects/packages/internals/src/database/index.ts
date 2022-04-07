/**
 * Project: @eventiva/internals
 * File: index.ts
 * Path: \src\database\index.ts
 * Created Date: Tuesday, March 29th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Thu Apr 07 2022
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

import { Prisma, PrismaClient } from '@prisma/client';
import * as database from './generated';

export class Database {
    public db: PrismaClient;
    static database = database;

    constructor() {
        this.db = new PrismaClient();
        this.db.$use(async (params, next) => this.softDelete(params, next));
    }


    softDelete(params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) {
        if (params.action == 'findUnique') {
            
            params.action = 'findFirst';
            if (!params.args.where.deleted && !params.args.where.deletedDate) params.args.where['deletedDate'] = null;
        
        } else if (params.action == 'findMany') {
            
            if (params.args.where != undefined) {
                if (!params.args.where.deleted && !params.args.where.deletedDate) params.args.where['deletedDate'] = null;
            } else {
                params.args['where'] = { deletedDate: null };
            }
        
        } else if (params.action == 'update') {
            
            params.action = 'updateMany';
            if (!params.args.where.deleted && !params.args.where.deletedDate) params.args.where['deletedDate'] = null;
        
        } else if (params.action == 'updateMany') {
            
            if (params.args.where != undefined) {
                if (!params.args.where.deleted && !params.args.where.deletedDate) params.args.where['deletedDate'] = null;
            } else {
                params.args['where'] = { deletedDate: null };
            }

        } else if (params.action == 'delete') {

            params.action = 'update';
            params.args['data'] = { deletedDate: new Date(), deleted: true };

        } else if (params.action == 'deleteMany') {

            params.action = 'updateMany';
            if (params.args.data != undefined) {
                params.args.data['deletedDate'] = new Date();
                params.args.data['deleted'] = true;
            } else {
                params.args['data'] = { deletedDate: new Date(), deleted: true };
            }

        } else if (params.action == "findFirst" || params.action == "count" || params.action == "aggregate") {
            
            if (!params.args.where.deleted && !params.args.where.deletedDate) params.args.where['deleted'] = null;

        }
        return next(params);
    }
}


