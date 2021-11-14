import * as puppeteer from 'puppeteer'
async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  await page.goto('https://services.sia.homeoffice.gov.uk/PublicRegister/')
  await page.screenshot({ path: 'example.png' })

  await browser.close()
}

main()