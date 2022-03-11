/**
 * Project: @eventiva/siacheck
 * File: runCheck.ts
 * Path: \src\Google\runCheck.ts
 * Created Date: Saturday, February 26th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Thu Mar 10 2022
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

import { createBucket } from './createBucket';
import { testLicense } from '../testlicense';
import { uploadFile } from './uploadImage';
import { SIACheck } from '@eventiva/internals';

/**
 * Is the Google Specific Method of running this code.
 * It will create a bucket, test the license, and upload the image.
 * Utilises the GCP for all components.
 * @since 2.0.0
 * @version 1.0.0
 * @public
 * @param license - The license number to check.
 */
export async function runCheck(license: number): Promise<SIACheck> {
  /**
   * Create a bucket for storing data.
   */
  let bucket = await createBucket();
  /**
   * Test the license, and get the returned result.
   */
  let res = await testLicense(license);
  /**
   * The SIACheck returned by res
   */
  let result = res.siacheck;
  /**
   * The picture returned by res
   */
  let picture = res.picture;

  /**
   * Check the result is defined
   */
  if (!result) {
    throw new Error('License check result error');
  }

  /**
   * Check the picture is defined and not string or void
   */
  if (picture === void 0 || typeof picture == 'string') {
    throw new Error('No picture Captured');
  }

  /**
   * Upload the picture to the bucket and return the result of the upload combined with SIACheck
   */
  result = await uploadFile(bucket, license, result, picture as Buffer);

  // if (result.status !== "ACTIVE") result.lastValid = bucket.file(req.query.license + '.png')?.publicUrl();
  return result;
}
