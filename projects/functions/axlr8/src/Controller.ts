/**
 * Project: @eventiva/axlr8
 * File: Controller.ts
 * Path: \src\Controller.ts
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
import { Controller, Body, Route, Path, Header } from 'tsoa';
import { rptFilters, SendAPI } from './util/helpers';

/**
 * The controller used to create routes.
 * This is used by TSOA to create ./util/routes.ts
 * @Route("axlr8")
 * @author Jonathan Stevens
 * @since 1.0.0
 * @version 1.0.0
 * @public
 */
@Route('axlr8')
export class SIACheckController extends Controller {
    sendAPI = new SendAPI();
    public async getData(
        @Path() url: string,
        @Path() rptId: number,
        @Header() api_user: string,
        @Header() api_user_pw: string,
        @Body() rptFilters: rptFilters
    ) {
        this.sendAPI.callAPI(
            url,
            {
                rptId,
                rptFilters
            },
            api_user,
            api_user_pw
        );
    }
}

