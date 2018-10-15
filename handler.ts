import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda'
import * as puppeteer from 'puppeteer'

export const getRanking: Handler = (
  event: APIGatewayEvent,
  context: Context,
  cb: Callback
) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message:
        'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
      input: event
    })
  }

  cb(null, response)
}

const crawl = async () => {
  // FIXME:テスト用
  const headless = !!process.env.NODE_ENV
  const browser = await puppeteer.launch({ headless })
  const page = await browser.newPage()
  await page.goto('https://newspicks.com/')
  const isLogined = await page.$('.self')
  if (!isLogined) {
    const loginButtonSelector = '.register-or-login-items > .login'
    await page.waitForSelector(loginButtonSelector)
    await page.click(loginButtonSelector)
    const nameSelector = '[name=username]'
    const passSelector = '[name=password]'
    const buttonSelector = '.login-btn'
    await page.type(nameSelector, process.env.USER_NAME)
    await page.type(passSelector, process.env.PASSWORD)
    await page.click(buttonSelector)
    await page.waitForNavigation()
  }
  // TODO:Moment.js
  await browser.close()
}

crawl()
