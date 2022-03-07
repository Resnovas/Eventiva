/**
 * Project: @eventiva/siacheck
 * File: testlicense.ts
 * Path: \src\testlicense.ts
 * Created Date: Saturday, February 26th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Sat Feb 26 2022
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

import chromium from 'chrome-aws-lambda';
import {
  LicenseSector,
  LicenseType,
  SIABadge,
  SIACheck,
  Account,
  BadgeStatus,
} from '@eventiva/databaseclasses';
import {
  ErrorCode,
  ErrorMessages,
  ErrorType,
  ServerError,
} from './util/errors';

/**
 * Tests a license using the SIA database and puppeteer.
 * @description Checks the license number against the SIA database and returns the result
 * @param license - License number to check
 * @since 1.0.0
 * @version 2.0.0
 * @public
 */
export async function testLicense(
  license: number
): Promise<{ siacheck: SIACheck; picture: Buffer | void | String }> {
  // Create the puppeteer browser
  let browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  // Create the return object
  let siacheck = new SIACheck();

  // Create the page
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://services.sia.homeoffice.gov.uk/PublicRegister/');

  // Type the license number into the search box
  await page.type('#LicenseNo', license.toString());
  const result = await page.$$('.btn_search');
  const submit = result[1];

  // if the submit button exists
  if (submit) {
    // Click the submit button
    await submit.click();
    return await page
      // Wait for the page to load
      .waitForSelector('.panel-body', { timeout: 2500 })
      .then(async () => {
        // Get the license details
        const h5 = await page.$$('.panel-body .ax_h5'),
          h4 = await page.$$('.panel-body .ax_h4'),
          active = await page.$$('.panel-body .italic_13'),
          sinceDate = await page.$$('.as-on-date');
        const ls = await h4[2]?.getInnerText(),
          bt = await h4[1]?.getInnerText(),
          exp = await (await active[0]?.getInnerText())?.split('-');
        const picture = await page.screenshot({
          clip: { x: 65, y: 1041, width: 1150, height: 340 },
        });

        // Create a new Account and SIABadge for returning
        const account = new Account(),
          badge = new SIABadge();

        // Fill in the account details
        account.firstname = await h5[0]?.getInnerText();
        account.lastname = await h5[1]?.getInnerText();

        // Fill in the badge details
        badge.id = license;
        badge.licenseSector =
          ls == 'Door Supervisor'
            ? LicenseSector.DS
            : ls == 'Close Protection'
            ? LicenseSector.CP
            : ls == 'Public Space Surveillance (CCTV)'
            ? LicenseSector.CCTV
            : ls == 'Security Guarding'
            ? LicenseSector.SG
            : ls == 'Key Holding'
            ? LicenseSector.KH
            : ls == 'Cash and Valuables in Transit'
            ? LicenseSector.CVIT
            : ls == 'Vehicle Immobilisation'
            ? LicenseSector.VI
            : LicenseSector.UNKNOWN;
        badge.type =
          bt == 'Front Line'
            ? LicenseType.FRONTLINE
            : LicenseType.NON_FRONTLINE;
        badge.expiry = new Date((await h4[3]?.getInnerText()) as string);
        badge.active = new Date(
          (await (await sinceDate[0]?.getInnerText())?.slice(7, -1)) as string
        );
        badge.licenseExplanation = exp?.[1]?.trim() as string;

        // Fill in the check details
        siacheck.status =
          exp?.[0]?.trim() == 'Active'
            ? BadgeStatus.ACTIVE
            : exp?.[0]?.trim() == 'Suspended'
            ? BadgeStatus.SUSPENDED
            : exp?.[0]?.trim() == 'Revoked'
            ? BadgeStatus.REVOKED
            : BadgeStatus.NON_ACTIVE;
        siacheck.createdAt = new Date();

        // Return the SIABadge and Picture and close the browser
        await browser.close();
        return { siacheck, picture };
      })
      // If the page doesn't load, return an error
      .catch(async () => {
        // Take a picture of the page
        const picture = await page.screenshot({
          clip: { x: 0, y: 0, width: 1280, height: 800 },
        });

        // Create a new error
        siacheck.error =
          'The license seems to be invalid as search failed. Please check this license number is correct: ' +
          license;
        siacheck.status = BadgeStatus.NON_ACTIVE;

        // Return the error and close the browser
        await browser.close();
        return { siacheck, picture };
      });
  }

  // If the submit button doesn't exist, throw an error
  throw new ServerError(
    ErrorCode['No Content'],
    ErrorMessages[ErrorCode['No Content']]!,
    {
      id: {
        type: ErrorType.SIA_CONTENT,
        message:
          'We cannot complete this request due to changes on the SIA website',
      },
    }
  );
}
