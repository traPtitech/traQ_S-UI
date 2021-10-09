import {
  getTimeString,
  getDayString,
  getFullDayString,
  getFullDayWithTimeString,
  getDateRepresentationWithoutSameDate,
  getDisplayDate,
  compareDate,
  compareDateString,
  getCreatedDate
} from '/@/lib/basic/date'

const defaultDate1 = new Date('1985-12-04T15:21:34')
const defaultDate2 = new Date('2001-04-04T05:20:34')

describe('getTimeString', () => {
  it('can get time (1)', () => {
    expect(getTimeString(defaultDate1)).toEqual('15:21')
  })
  it('can get time (2)', () => {
    expect(getTimeString(defaultDate2)).toEqual('05:20')
  })
})

describe('getDayString', () => {
  it('can get day (1)', () => {
    expect(getDayString(defaultDate1)).toEqual('12/04')
  })
  it('can get day (2)', () => {
    expect(getDayString(defaultDate2)).toEqual('04/04')
  })
})

describe('getFullDayString', () => {
  it('can get full day (1)', () => {
    expect(getFullDayString(defaultDate1)).toEqual('1985/12/04')
  })
  it('can get full day (2)', () => {
    expect(getFullDayString(defaultDate2)).toEqual('2001/04/04')
  })
})

describe('getFullDayWithTimeString', () => {
  it('can get full day with time (1)', () => {
    expect(getFullDayWithTimeString(defaultDate1)).toEqual('1985/12/04 15:21')
  })
  it('can get full day with time (2)', () => {
    expect(getFullDayWithTimeString(defaultDate2)).toEqual('2001/04/04 05:20')
  })
})

describe('getDateRepresentationWithoutSameDate', () => {
  const date = new Date(defaultDate1.getTime())

  it('can get time string', () => {
    const date2 = new Date(defaultDate1.getTime())
    date2.setMinutes(date2.getMinutes() + 2)
    expect(getDateRepresentationWithoutSameDate(date2, date)).toEqual('15:23')
  })
  it('can get date with time string', () => {
    const date2 = new Date(defaultDate1.getTime())
    date2.setDate(date2.getDate() + 2)
    expect(getDateRepresentationWithoutSameDate(date2, date)).toEqual(
      '12/06 15:21'
    )
  })
  it('can get date with time string', () => {
    const date2 = new Date(defaultDate1.getTime())
    date2.setFullYear(date2.getFullYear() + 2)
    expect(getDateRepresentationWithoutSameDate(date2, date)).toEqual(
      '1987/12/04 15:21'
    )
  })
})

describe('getDisplayDate', () => {
  const dateISO = '2001-04-04T05:20:34'

  it('should get time string when not modified', () => {
    expect(getDisplayDate(dateISO, dateISO)).toEqual('05:20')
  })
  it('should get time string when same date', () => {
    const dateISO2 = '2001-04-04T08:25:34'
    expect(getDisplayDate(dateISO, dateISO2)).toEqual('08:25')
  })
  it('should get date string when not same date', () => {
    const dateISO2 = '2001-06-04T08:25:34'
    expect(getDisplayDate(dateISO, dateISO2)).toEqual('06/04 08:25')
  })
})

describe('getCreatedDate', () => {
  const today = new Date()
  today.setHours(1)
  today.setMinutes(23)

  it('can get', () => {
    expect(getCreatedDate(today.toISOString())).toEqual('01:23')
  })
})

describe('compareDate', () => {
  it('can compare time', () => {
    expect(
      compareDate(
        new Date(2020, 1, 1, 0, 0, 0, 0),
        new Date(2020, 2, 1, 0, 0, 0, 0)
      )
    ).toEqual(-1)
  })
  it('can compare time (inversed)', () => {
    expect(
      compareDate(
        new Date(2020, 1, 1, 0, 0, 0, 0),
        new Date(2020, 2, 1, 0, 0, 0, 0),
        true
      )
    ).toEqual(1)
  })
  it('can compare same time', () => {
    expect(
      compareDate(
        new Date(2020, 1, 1, 0, 0, 0, 0),
        new Date(2020, 1, 1, 0, 0, 0, 0)
      )
    ).toEqual(0)
  })
})

describe('compareDateString', () => {
  it('can compare time', () => {
    expect(
      compareDateString(
        '2021-02-19T17:09:24.53365Z',
        '2021-02-20T12:16:03.559831Z'
      )
    ).toEqual(-1)
  })
  it('can compare time (inversed)', () => {
    expect(
      compareDateString(
        '2021-02-19T17:09:24.53365Z',
        '2021-02-20T12:16:03.559831Z',
        true
      )
    ).toEqual(1)
  })
  it('can compare same time', () => {
    expect(
      compareDateString(
        '2021-02-19T17:09:24.53365Z',
        '2021-02-19T17:09:24.53365Z'
      )
    ).toEqual(0)
  })
})
