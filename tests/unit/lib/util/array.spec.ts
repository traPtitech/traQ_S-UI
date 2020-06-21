import { getFullMatchedAndMatched, isDefined } from '@/lib/util/array'

describe('getFullMatchedAndMatched', () => {
  it('can get fullMatched', () => {
    const expected = { fullMatched: ['aaaaa'], matched: [] }
    const actual = getFullMatchedAndMatched(arr, 'aaaaa')
    expect(actual).toEqual(expected)
  })

  it('can get matched (1)', () => {
    const expected = { fullMatched: [], matched: ['ddddd'] }
    const actual = getFullMatchedAndMatched(arr, 'dd')
    expect(actual).toEqual(expected)
  })
  it('can get matched (2)', () => {
    const expected = { fullMatched: [], matched: ['abcde', 'cde', 'cdecd'] }
    const actual = getFullMatchedAndMatched(arr, 'cd')
    expect(actual).toEqual(expected)
  })

  it('can get fullMatched and matched', () => {
    const expected = { fullMatched: ['aaa'], matched: ['aaaaa', 'AAAAb'] }
    const actual = getFullMatchedAndMatched(arr, 'aaa')
    expect(actual).toEqual(expected)
  })
})

describe('isDefined', () => {
  it('can check undefined', () => {
    expect(isDefined(undefined)).toEqual(false)
  })
  it('can check null', () => {
    expect(isDefined(null)).toEqual(true)
  })
  it('can check object', () => {
    expect(isDefined({})).toEqual(true)
  })
  it('can check empty string', () => {
    expect(isDefined('')).toEqual(true)
  })
  it('can check string', () => {
    expect(isDefined('str')).toEqual(true)
  })
})

const arr = [
  'aaaaa',
  'abcde',
  'AAAAb',
  'bbbbb',
  'cde',
  'cdecd',
  'ddddd',
  'a',
  'AA',
  'aaa'
]
