import { compareDate, compareDateString } from '@/lib/util/date'

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
