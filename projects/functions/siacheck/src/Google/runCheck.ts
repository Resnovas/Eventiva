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

import { createBucket } from './createBucket';
import { testLicense } from '../testlicense';
import { uploadFile } from './uploadImage';

import { SIACheck } from '@eventiva/databaseclasses';

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
