import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda'
import * as puppeteer from 'puppeteer'
import { Days, getQueryStringForRanking } from './helper'

const domain = 'https://newspicks.com/'

interface Article {
  title: string
  pickCount: number
  date: string
  url: string
}

export const getRanking: Handler = async (
  event: APIGatewayEvent,
  _: Context,
  cb: Callback
) => {
  const params = event.queryStringParameters
  const range = Days[params.range]
  let ranking: any
  if (range) {
    ranking = await scraping(Days[params.range])
  } else {
    console.log('error')
    ranking = []
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message:
        'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
      input: event,
      result: ranking
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

// FIXME:返り値の型
const scraping = async (period: Days): Promise<any> => {
  const headless = process.env.NODE_ENV === 'production'
  console.log(`headless is ${headless}`)
  const browser = await puppeteer.launch({ headless })
  const page = await browser.newPage()
  await page.goto(domain)

  const isLogined = await page.$('.self')
  if (!isLogined) {
    await login(page)
  }

  const queryString = getQueryStringForRanking(period)
  await page.goto(domain + queryString)
  await page.waitForSelector('.news-card-list')

  const ranking = await page.$$eval<Article[]>(
    '.news-card-list > .search-result-card',
    elements => {
      return elements.map(element => {
        const title = element.querySelector('.news-title').textContent
        const pickCount = element.querySelector('.value').textContent as number
        const date = element.querySelector('.published').textContent
        const url = element.querySelector('.news-card > a').href
        return {
          title,
          pickCount,
          date,
          url
        }
      })
    }
  )

  await browser.close()
  return ranking
  // TODO:エラー処理
}

if (process.argv.length) {
  scraping(Days[process.argv[2]])
    .then(ranking => {
      console.log(ranking)
    })
    .catch(error => console.log(error))
}
