/**
 * Project: @eventiva/siacheck
 * File: uploadImage.ts
 * Path: \src\Google\uploadImage.ts
 * Created Date: Saturday, February 26th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Tue Mar 22 2022
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

import { Bucket } from '@google-cloud/storage';
import Jimp from 'jimp';
import { SIACheck } from '@eventiva/internals';
import {
  ErrorCode,
  ErrorMessages,
  ErrorType,
  ServerError,
} from '../util/errors';

export async function uploadFile(
  bucket: Bucket,
  license: number,
  result: SIACheck,
  picture: Buffer
) {
  /**
   * Create the file in the bucket
   */
  let screenshot = bucket.file(license + '.png');

  /**
   * Get the logo image
   */
  let logoName = './prosec.png';
  const logoMargin = 2;

  /**
   * Create Jimp objects
   */
  let [image, logo] = await Promise.all([
    new Jimp(picture, (err, image) => {
      if (err) throw err;
      return image;
    }),
    Jimp.read(logoName),
  ]);

  /**
   * Resize the logo
   */
  logo.resize(image.bitmap.width / 10, Jimp.AUTO);

  /**
   * Set the margins based on the image size
   */
  const xMargin = (image.bitmap.width * logoMargin) / 100;
  const yMargin = (image.bitmap.width * logoMargin) / 100;
  const X = image.bitmap.width - logo.bitmap.width - xMargin;
  const Y = image.bitmap.height - logo.bitmap.height - yMargin;

  /**
   * Add the logo to the image
   */
  image = image.composite(logo, X, Y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 1,
    opacityDest: 1,
  });

  /**
   * Get the text to add to the image and set the font
   */
  const string = `Validated: ${result.createdAt.toString().split('+')[0]}`,
    font = await Jimp.loadFont(Jimp.FONT_SANS_10_BLACK);

  /**
   * Print the text to the image
   */
  image.print(font, X - 90, Y - logo.bitmap.height - 5, string);
  const buffer = await image.getBufferAsync(Jimp.MIME_PNG).catch(e => {
      throw new ServerError(
        ErrorCode['Service Unavailable'],
        ErrorMessages[ErrorCode['Service Unavailable']]!,
        {
          id: {
            type: ErrorType.PICTURE_SAVE,
            message:
              'We hae encountered an issue while attempting to save your image new',
            e,
          },
        }
      );
    })
  /**
   * Save the image to the bucket
   */
  await screenshot
    .save(buffer, {
      contentType: 'image/png',
    })
    .catch((e) => {
      console.log(e)
      // throw new ServerError(
      //   ErrorCode['Service Unavailable'],
      //   ErrorMessages[ErrorCode['Service Unavailable']]!,
      //   {
      //     id: {
      //       type: ErrorType.PICTURE_SAVE,
      //       message:
      //         'We hae encountered an issue while attempting to save your image',
      //       e,
      //     },
      //   }
      // );
    });

  /**
   * Make the image public
   */
  await screenshot.makePublic();
  result.pubUrl = screenshot.publicUrl();
  result.AuthUrl = (
    await screenshot.getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365,
    }).catch(() => { return undefined})
  )?.[0]
  return result;
}
