/**
 * Project: @eventiva/siacheck
 * File: Controller.ts
 * Path: \src\Controller.ts
 * Created Date: Saturday, February 26th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Fri Mar 11 2022
 * Modified By: Jonathan Stevens
 * Current Version: 2.0.0
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

import { LicenseSector, LicenseType, SIACheck } from '@eventiva/internals';
import { Controller, Example, Get, Path, Route } from 'tsoa';
import { runCheck as google } from './Google/runCheck';
import { runCheck as azure } from './Azure/runCheck';
import { runCheck as express } from './Express/runCheck';
import { runCheck as aws } from './AWS/runCheck';
import { ErrorMessages, ErrorType, ServerError } from './util/errors';

/**
 * The license number issued by the SIA.
 * @pattern 10[0-9]\{14\}
 * @format License
 * @example 1030123456789012
 */
export type License = number;

/**
 * The controller used to create routes.
 * This is used by TSOA to create ./util/routes.ts
 * @Route("sia")
 * @author Jonathan Stevens
 * @since 2.0.0
 * @version 1.0.0
 * @public
 */
@Route('sia')
export class SIACheckController extends Controller {
  /**
   * Run a check on a specified license number for an officer.
   * Specify the license number in the query.
   * @param id - The license number to check.
   */
  @Example<SIACheck>({
    id: 'ae4b40c0-c167-49ec-b2b7-0d9ea4cdemo1',
    status: 'ACTIVE',
    AuthUrl:
      "https://storage.googleapis.com/sia-check-bucket/1030123456789012.png?GoogleAccessId=phrasal-door-332522%40appspot.gserviceaccount.com&Expires=1677245786&Signature=jk%2BZ8IJhKMJdeHRenvr1VM66bfv18cTwd%2FvFu%2Bhaxv4ziM%2F12knx6XlvXWAjycYyQFha%2BI6oV6eJ0aVCOsyzATEDFiitvvCHH%2BNODVJKh5q2La37JCYziJTuaNk6dQR4RMmocXJnf5FAMj%2BYeArgIXVrvj3rsMW%2FRdJvYglDkEu1pr7H9wyQxu%2FkJhTpjitaE2v%2FYc5E%2Futc%2Founsdwf707tptN8gEZ9Ejxvw4UfYqQHJCnQyPM0heK9LMoTIJz2meb1Xr33aGMPdv6AGN%2BxRHl6G3OiERFCOwqI9VauYid4xXhQk0fUhEW875j8bQnmZNetr1pWRAt%2FZfpuBGdpOQ%3D%3D'",
    pubUrl: 'https://storage.googleapis.com/sia-check/1030123456789012.png',
    createdAt: new Date(),
    updatedAt: new Date(),
    badge: {
      id: 1030123456789012,
      licenseSector: LicenseSector.SG,
      type: LicenseType.FRONTLINE,
      licenseExplanation:
        'The individual is licensed to undertake designated licensable activity.',
      additionalTerms: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiry: new Date(),
      account: {
        id: 'ae4b40c0-c167-49ec-b2b7-0d9ea4cdemo',
        accountType: 'USER',
        subsciption: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        firstname: 'John',
        lastname: 'Doe',
        label: 'demo',
      },
    },
  })
  @Get('check/{id}')
  public async checkLicense(@Path() id: License): Promise<SIACheck> {
    if (!/10[0-9]{14}/.test(id.toString()))
      throw new ServerError(422, ErrorMessages[422]!, {
        id: {
          type: ErrorType.VALIDATION,
          message:
            'Invalid license number format. Please follow the SIA specification',
          format: '10[0-9]{14}',
        },
      });

    switch (process.env.DEPTYPE) {
      case 'AWS':
        return await aws(id);
      case 'Azure':
        return await azure(id);
      case 'Google':
        return await google(id);
      default:
        return await express(id);
    }
  }
}
