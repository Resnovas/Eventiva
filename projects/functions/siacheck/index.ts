import chromium from 'chrome-aws-lambda';
import express, { Express } from 'express';

const app = express();
app.get('/', (req, res) => {
  typeof req.query.license == 'string'
    ? testLicense(req.query.license).then((r) => res.send(r))
    : res.send('Please provide a license number');
});

async function testLicense(license: string) {
  let browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://services.sia.homeoffice.gov.uk/PublicRegister/');
  await page.type('#LicenseNo', license);
  const result = await page.$$('.btn_search');
  const submit = result[1];
  if (submit) {
    await submit.click();
    await page.waitForSelector('.panel-body').catch((r) => {
      throw new Error(
        'The license seems to be invalid as search failed. Please manually check this license: ' +
          license +
          '\n\n Error thrown:' +
          r
      );
    });
    const picture = await page.screenshot({
      path: `${license}-licensecheck.png`,
      clip: { x: 65, y: 1041, width: 1150, height: 340 },
    });
    const h5 = await page.$$('.panel-body .ax_h5');
    const h4 = await page.$$('.panel-body .ax_h4');
    const active = await page.$$('.panel-body .italic_13');
    const activeDesc = await page.$$('.panel-body .normal_13');
    const returned = {
      result: {
        found: license == (await h4[0]?.getInnerText()) ? 'Found' : 'Invalid',
        firstname: await h5[0]?.getInnerText(),
        lastname: await h5[1]?.getInnerText(),
        license: await h4[0]?.getInnerText(),
        role: await h4[1]?.getInnerText(),
        sector: await h4[2]?.getInnerText(),
        expiry: await h4[3]?.getInnerText(),
        active: await (await active[0]?.getInnerText())?.split('-')[0]?.trim(),
        activeDesc: await activeDesc[0]?.getInnerText(),
        activeDate: Date.now(),
        picture: picture,
      },
    };
    await browser.close();
    return returned;
  }

  return null;
}

export const handler: Express = app;
