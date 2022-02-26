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

import { createBucket } from '../Google/createBucket';
import { testLicense } from '../testlicense';
import { uploadFile } from '../Google/uploadImage';

export async function runCheck(license: number) {
  let bucket = await createBucket(),
    res = await testLicense(license),
    result = res.siacheck,
    picture = res.picture;
  if (!result) {
    throw new Error('License check result error');
  }
  if (picture === void 0 || typeof picture == 'string') {
    throw new Error('No picture Captured');
  }
  result = await uploadFile(bucket, license, result, picture as Buffer);

  // if (result.status !== "ACTIVE") result.lastValid = bucket.file(req.query.license + '.png')?.publicUrl();
  return result;
}
