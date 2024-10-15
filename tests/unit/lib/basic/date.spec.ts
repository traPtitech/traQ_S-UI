import {
  getTimeString,
  getDayString,
  getFullDayString,
  getFullDayWithTimeString,
  getISOFullDayString,
  getDateRepresentationWithoutSameDate,
  getDisplayDate,
  compareDate,
  compareDateString,
  getCreatedDate,
  getCurrentTimeString
} from '/@/lib/basic/date'

const defaultDate1 = new Date('1985-12-04T15:21:34')
const defaultDate2 = new Date('2001-04-04T05:20:34')

describe('getTimeString', () => {
  it('can get time (1)', () => {
    expect(getTimeString(defaultDate1)).toBe('15:21')
  })
  it('can get time (2)', () => {
    expect(getTimeString(defaultDate2)).toBe('05:20')
  })
})

describe('getDayString', () => {
  it('can get day (1)', () => {
    expect(getDayString(defaultDate1)).toBe('12/04')
  })
  it('can get day (2)', () => {
    expect(getDayString(defaultDate2)).toBe('04/04')
  })
})

describe('getFullDayString', () => {
  it('can get full day (1)', () => {
    expect(getFullDayString(defaultDate1)).toBe('1985/12/04')
  })
  it('can get full day (2)', () => {
    expect(getFullDayString(defaultDate2)).toBe('2001/04/04')
  })
})

describe('getFullDayWithTimeString', () => {
  it('can get full day with time (1)', () => {
    expect(getFullDayWithTimeString(defaultDate1)).toBe('1985/12/04 15:21')
  })
  it('can get full day with time (2)', () => {
    expect(getFullDayWithTimeString(defaultDate2)).toBe('2001/04/04 05:20')
  })
})

describe('getISOFullDayString', () => {
  it('can get iso full day (1)', () => {
    expect(getISOFullDayString(defaultDate1)).toBe('1985-12-04')
  })
  it('can get iso full day (2)', () => {
    expect(getISOFullDayString(defaultDate2)).toBe('2001-04-04')
  })
})

describe('getCurrentTimeString', () => {
  it('should work', () => {
    vi.useFakeTimers()
    vi.setSystemTime('2022/05/30 12:34:56')
    expect(getCurrentTimeString()).toBe('12:34')
    vi.useRealTimers()
  })
})

describe('getDateRepresentationWithoutSameDate', () => {
  const date = new Date(defaultDate1.getTime())

  it('can get time string', () => {
    const date2 = new Date(defaultDate1.getTime())
    date2.setMinutes(date2.getMinutes() + 2)
    expect(getDateRepresentationWithoutSameDate(date2, date)).toBe('15:23')
  })
  it('can get date with time string', () => {
    const date2 = new Date(defaultDate1.getTime())
    date2.setDate(date2.getDate() + 2)
    expect(getDateRepresentationWithoutSameDate(date2, date)).toBe(
      '12/06 15:21'
    )
  })
  it('can get date with time string and year', () => {
    const date2 = new Date(defaultDate1.getTime())
    date2.setFullYear(date2.getFullYear() + 2)
    expect(getDateRepresentationWithoutSameDate(date2, date)).toBe(
      '1987/12/04 15:21'
    )
  })
})

describe('getDisplayDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  const createdDateISO = '2010-04-01T12:34:56'
  const updatedDateISO = '2010-05-02T14:28:57'

  it('should say 今日 when updated today', () => {
    vi.setSystemTime('2010-05-02T15:00:00')
    expect(getDisplayDate(createdDateISO, updatedDateISO)).toBe('今日 14:28')
  })
  it('should say 昨日 when updated yesterday', () => {
    vi.setSystemTime('2010-05-03T15:00:00')
    expect(getDisplayDate(createdDateISO, updatedDateISO)).toBe('昨日 14:28')
  })
  it('should get MM/DD when updated in the same year', () => {
    vi.setSystemTime('2010-07-07T15:00:00')
    expect(getDisplayDate(createdDateISO, updatedDateISO)).toBe('05/02 14:28')
  })
  it('should get YYYY/MM/DD when updated before last year', () => {
    vi.setSystemTime('2015-10-10T15:00:00')
    expect(getDisplayDate(createdDateISO, updatedDateISO)).toBe(
      '2010/05/02 14:28'
    )
  })
})

describe('getCreatedDate', () => {
  const today = new Date()
  today.setHours(1)
  today.setMinutes(23)

  it('can get', () => {
    expect(getCreatedDate(today.toISOString())).toBe('01:23')
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
    ).toBe(1)
  })
  it('can compare same time', () => {
    expect(
      compareDate(
        new Date(2020, 1, 1, 0, 0, 0, 0),
        new Date(2020, 1, 1, 0, 0, 0, 0)
      )
    ).toBe(0)
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
    ).toBe(1)
  })
  it('can compare same time', () => {
    expect(
      compareDateString(
        '2021-02-19T17:09:24.53365Z',
        '2021-02-19T17:09:24.53365Z'
      )
    ).toBe(0)
  })
})
