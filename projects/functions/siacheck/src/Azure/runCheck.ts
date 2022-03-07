/**
 * Project: @eventiva/siacheck
 * File: runCheck.ts
 * Path: \src\Azure\runCheck.ts
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
