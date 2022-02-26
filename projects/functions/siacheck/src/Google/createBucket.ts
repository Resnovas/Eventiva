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
