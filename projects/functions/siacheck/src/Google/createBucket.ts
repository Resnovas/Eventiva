/**
 * Project: @eventiva/siacheck
 * File: createBucket.ts
 * Path: \src\Google\createBucket.ts
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

import { Bucket, Storage } from '@google-cloud/storage';
import path from 'path';
import {
  ErrorCode,
  ErrorMessages,
  ErrorType,
  ServerError,
} from '../util/errors';

/**
 * Creates a bucket on Google Cloud Storage for storing SIA images.
 */
export async function createBucket(): Promise<Bucket> {
  /**
   * Get the storage client.
   */
  const storage = await new Storage({
    keyFile: path.join(process.cwd(), './.service.json'),
    projectId: 'phrasal-door-332522',
  });

  /**
   * Create/Get the bucket.
   */
  let bucket = await storage.bucket('sia-check-bucket');

  /**
   * If the bucket doesn't exist, throw an error
   */
  if (!bucket) {
    throw new ServerError(
      ErrorCode['Insufficient Storage'],
      ErrorMessages[ErrorCode['Insufficient Storage']]!,
      {
        id: {
          type: ErrorType.STORAGE_EXIST,
          message:
            'The storage specified does not exist. Please contact your administrator',
        },
      }
    );
  }
  return bucket;
}
