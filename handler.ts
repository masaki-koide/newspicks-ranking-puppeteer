import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda'
import * as moment from 'moment'
import * as puppeteer from 'puppeteer'
import { Days, getDateQueryParams } from './helper'

const host = 'https://newspicks.com/'

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

const login = async (page: puppeteer.Page) => {
  const loginModalButton = '.register-or-login-items > .login'
  await page.waitForSelector(loginModalButton)
  await page.click(loginModalButton)

  const nameInput = '[name=username]'
  const passInput = '[name=password]'
  const loginButton = '.login-btn'
  await page.waitForSelector(nameInput, { visible: true })
  await page.waitForSelector(passInput, { visible: true })
  await page.waitForSelector(loginButton)
  await page.type(nameInput, process.env.USER_NAME)
  await page.type(passInput, process.env.PASSWORD)
  await page.click(loginButton)

  await page.waitForNavigation()
}

const crawl = async () => {
  // FIXME:テスト用
  const headless = !!process.env.NODE_ENV
  const browser = await puppeteer.launch({ headless })
  const page = await browser.newPage()
  await page.goto(host)
  const isLogined = await page.$('.self')
  if (!isLogined) {
    await login(page)
  }
  // TODO:periodのパラメータを受け取る
  const { to, from } = getDateQueryParams(Days.day)
  const queryParams = {
    sort: 'picks',
    q: '',
    to,
    from
  }
  const query = Object.keys(queryParams)
    .map(key => `${key}=${queryParams[key]}`)
    .join('&')
  await page.goto(host + 'search?' + query)
  await page.waitForSelector('.news-card-list')
  const infos = await page.$$eval(
    '.news-card-list > .search-result-card',
    elements => {
      return elements.map(element => {
        const title = element.querySelector('.news-title').textContent
        const pickCount = element.querySelector('.value').textContent
        const date = element.querySelector('.published').textContent
        const url = element.querySelector('.news-card > a').href
        return {
          title,
          pickCount,
          date,
          url
        }
      })
    },
    host
  )
  console.log(infos)
  await browser.close()
}

crawl()
