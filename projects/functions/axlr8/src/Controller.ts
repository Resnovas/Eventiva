/**
 * Project: @eventiva/axlr8
 * File: Controller.ts
 * Path: \src\Controller.ts
 * Created Date: Monday, March 7th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Wed Mar 09 2022
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
import { Controller, Body, Route, Path, Header, Query, Post, Example, TsoaResponse, Res, Response} from 'tsoa';
import { reportResult, rptFilters, SendAPI } from './util/helpers';
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

    @Response<reportResult>(422, "Unprocessable Entity", {
        "result": true,
        "success": false,
        "error": "Filter with tag: OSCE_APPLIED_DATE could not be found",
        "debug": {
            "rptId": 179,
            "rptFilters": [
            {
                "filter": "OSCE_APPLIED_DATE",
                "operator": "=",
                "values": "31/12/2020"
            }
            ]
        }
    })
    @Example<reportResult>({
  "result": true,
  "success": [
    {
      "Account Number": " ",
      "Client:": "Example",
      "Venue:": "Example",
      "Session ID": "0000000",
      "Sess Id": "00000000",
      "Customer ID": "null",
      "No. Required": "1",
      "Number still required": "1",
      "No. DNS": "0",
      "Shift Date": "27/07/9202 09:00",
      "Start Date/Time": "null",
      "End Date/Time": "null",
      "Booking Id": "null",
      "Booking Status": "No Booking",
      "No. Confirmed": "null",
      "Staff Member Confirmed": 0,
      "Attendee Status": "No Booking",
      "Declined Status": "Not Set",
      "DNS": 0,
      "DNS Reason": "null",
      "Hour Rate": "null",
      "Shift Rate": "null",
      "Staff Rate": "null",
      "Staff Shift Rate": "null",
      "Client Hourly Rate": "null",
      "Full Name": "null",
      "NI number": "null",
      "Email": "null",
      "Operations Manager": "null",
      "Strikes": "0"
    },
  ],
  "error": null,
  "debug": {
    "rptId": 1000,
    "rptFilters": [
      {
        "filter": "ES_SESSION_NUMBER_STAFF_STILL_REQUIRED",
        "operator": ">",
        "values": "0"
      },
      {
        "filter": "ES_SESSION_START_DATE",
        "operator": ">",
        "values": "09/03/2022"
      }
    ]
  }
})
    @Post('report/{rptId}')
    public async getData(
        @Path() rptId: number,
        @Query() url: string,
        @Header() api_user: string,
        @Header() api_user_pw: string,
        @Body() rptFilters: rptFilters[],
        @Res() notFoundResponse: TsoaResponse<422, reportResult>
    ): Promise<reportResult> {
        const result = await this.sendAPI.callAPI(
            url,
            {
                rptId,
                rptFilters: rptFilters
            },
            api_user,
            api_user_pw
        )

        if (result.success == false) 
            return notFoundResponse(422, result)
        else return result
    }
}

