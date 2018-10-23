import * as moment from 'moment'
import * as querystring from 'querystring'

export enum Days {
  day = 1,
  week = 7,
  month = 31,
  'half-year' = 183,
  year = 365
}

interface DateQueryParams {
  to: string
  from: string
}

export type QueryParams = DateQueryParams & { sort: string; q: string }

const getDateQueryParams = (period: Days): DateQueryParams => {
  const dateFormat = 'YYYYMMDDHH'
  return {
    to: moment().format(dateFormat),
    from: moment()
      .subtract(period, 'days')
      .format(dateFormat)
  }
}

const getQueryParamsForRanking = (period: Days): QueryParams => {
  const dateQueryParams = getDateQueryParams(period)
  const sort = 'picks'
  const q = ''
  return {
    ...dateQueryParams,
    sort,
    q
  }
}

export const getQueryStringForRanking = (period: Days): string => {
  const queryParams = getQueryParamsForRanking(period)
  const qs = querystring.stringify(queryParams)
  return 'search?' + qs
}
