import * as moment from 'moment'

export enum Days {
  day = 1,
  week = 7,
  month = 31,
  'half-year' = 183,
  year = 365
}

export interface DateQueryParams {
  to: string
  from: string
}

export const getDateQueryParams = (period: Days): DateQueryParams => {
  const dateFormat = 'YYYYMMDDHH'
  return {
    to: moment().format(dateFormat),
    from: moment()
      .subtract(period, 'days')
      .format(dateFormat)
  }
}
