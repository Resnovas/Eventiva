/**
 * A cloud function that checks if a license is valid against the SIA database.
 *
 * @packageDocumentation
 */

import chromium from 'chrome-aws-lambda';
import { Request, Response } from 'express';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import Jimp from 'jimp';

/**
 * Tests a license using the SIA database and puppeteer.
 * @swagger
 * @param license - License number to check
 * @remarks -- This function is not intended to be called directly by end user.
 * @description Checks the license number against the SIA database and returns the result
 * @alpha
 */
export async function testLicense(license: string) {
  let browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  let returned:
    | {
        found: 'Valid' | 'Invalid';
        firstname?: string;
        lastname?: string;
        license?: string;
        role?: string;
        sector?: string;
        expiry?: string;
        active?: string;
        activeDesc?: string;
        activeDate?: number;
        sinceDate?: string;
        picture?: Buffer | void | string;
        pictureAUTHURL?: string;
        lastValid?: string;
        error?: string;
      }
    | undefined;

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://services.sia.homeoffice.gov.uk/PublicRegister/');
  await page.type('#LicenseNo', license);
  const result = await page.$$('.btn_search');
  const submit = result[1];
  if (submit) {
    await submit.click();
    return await page
      .waitForSelector('.panel-body', { timeout: 5000 })
      .then(async () => {
        const h5 = await page.$$('.panel-body .ax_h5');
        const h4 = await page.$$('.panel-body .ax_h4');
        const active = await page.$$('.panel-body .italic_13');
        const activeDesc = await page.$$('.panel-body .normal_13');
        const sinceDate = await page.$$('.as-on-date');
        const picture = await page.screenshot({
          clip: { x: 65, y: 1041, width: 1150, height: 340 },
        });

        returned = {
          found: license == (await h4[0]?.getInnerText()) ? 'Valid' : 'Invalid',
          firstname: await h5[0]?.getInnerText(),
          lastname: await h5[1]?.getInnerText(),
          license: await h4[0]?.getInnerText(),
          role: await h4[1]?.getInnerText(),
          sector: await h4[2]?.getInnerText(),
          expiry: await h4[3]?.getInnerText(),
          active: await (await active[0]?.getInnerText())
            ?.split('-')[0]
            ?.trim(),
          activeDesc: await activeDesc[0]?.getInnerText(),
          activeDate: Date.now(),
          sinceDate: await (await sinceDate[0]?.getInnerText())?.slice(7, -1),
          picture,
          pictureAUTHURL: undefined,
        };
        await browser.close();
        return returned;
      })
      .catch(async () => {
        const picture = await page.screenshot({
          clip: { x: 0, y: 0, width: 1280, height: 800 },
        });

        returned = {
          error:
            'The license seems to be invalid as search failed. Please check this license number is correct: ' +
            license,
          found: 'Invalid',
          picture: picture,
        };
        await browser.close();
        return returned;
      });
  }
  return null;
}

/**
 * Initialises the server.
 * @param req - The request object.
 * @typedef Request.query
 * @property license - This is the license you want to test
 * @param res - The response object.
 * @public
 */

export const google = async (req: Request, res: Response) => {
  if (!req.query.license || typeof req.query.license !== 'string')
    return res
      .send(
        'No license number provided - please provide a single license number within the query. E.g. ?license=0000000000000000'
      )
      .end();

  const storage = await new Storage({
    keyFile: path.join(process.cwd(), './.service.json'),
    projectId: 'phrasal-door-332522',
  });
  let bucket = await storage.bucket('sia-check-bucket');
  if (!bucket) {
    res.status(501).send('Bucket not found').end();
    return;
  }

  const result = await testLicense(req.query.license);
  if (!result) {
    res.status(502).send('License check result error').end();
    return;
  }

  if (result.picture === void 0 || typeof result.picture == 'string') {
    res.send(result).status(200).end();
    return;
  }

  let screenshot = bucket.file(
    req.query.license + (result?.found == 'Invalid' ? '-invalid' : '') + '.png'
  );

  let logoName = './prosec.png';
  const logoMargin = 2;
  let [image, logo] = await Promise.all([
    new Jimp(result.picture, (err, image) => {
      if (err) throw err;
      return image;
    }),
    Jimp.read(logoName),
  ]);
  logo.resize(image.bitmap.width / 10, Jimp.AUTO);
  const xMargin = (image.bitmap.width * logoMargin) / 100;
  const yMargin = (image.bitmap.width * logoMargin) / 100;
  const X = image.bitmap.width - logo.bitmap.width - xMargin;
  const Y = image.bitmap.height - logo.bitmap.height - yMargin;
  image = image.composite(logo, X, Y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 1,
    opacityDest: 1,
  });
  const today = new Date(result.activeDate || Date.now()),
    string = `Validated: ${today.toString().split('+')[0]}`;
  const font = await Jimp.loadFont(Jimp.FONT_SANS_10_BLACK);
  image.print(font, X - 90, Y - logo.bitmap.height - 5, string);

  await screenshot
    .save(await image.getBufferAsync(Jimp.MIME_PNG), {
      contentType: 'image/png',
    })
    .catch(() => {
      res.status(500).send('Error saving screenshot').end();
      return;
    });

  // screenshot = bucket.file(req.query.license + '.png')
  await screenshot.makePublic();
  result.picture = screenshot.publicUrl();
  result.pictureAUTHURL = (
    await screenshot.getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365,
    })
  )[0];
  if (result.found == 'Invalid')
    result.lastValid = bucket.file(req.query.license + '.png')?.publicUrl();
  res.send(result).status(200).end();
  return;
};
