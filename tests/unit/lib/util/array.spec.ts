import {
  getMatchedWithPriority,
  pickSomeAroundIndex,
  isDefined
} from '/@/lib/util/array'

describe('getMatchedWithPriority', () => {
  it('can get fullMatched', () => {
    const expected = [{ value: 'aaaaa', priority: 0 }]
    const actual = getMatchedWithPriority(arr, 'aaaaa')
    expect(actual).toEqual(expected)
  })
  it('can get prefixMatched', () => {
    const expected = [{ value: 'aaaaa', priority: 1 }]
    const actual = getMatchedWithPriority(arr, 'aaaa')
    expect(actual).toEqual(expected)
  })

  it('can get matched (1)', () => {
    const expected = [{ value: 'AAAbd', priority: 2 }]
    const actual = getMatchedWithPriority(arr, 'abd')
    expect(actual).toEqual(expected)
  })
  it('can get matched (2)', () => {
    const expected = [
      { value: 'abcde', priority: 2 },
      { value: 'cde', priority: 2 },
      { value: 'cdecd', priority: 2 }
    ]
    const actual = getMatchedWithPriority(arr, 'de')
    expect(actual).toEqual(expected)
  })

  it('can get fullMatched and prefixMatched and matched', () => {
    const expected = [
      { value: 'aaaaa', priority: 1 },
      { value: 'AAAbd', priority: 1 },
      { value: 'baaa', priority: 2 },
      { value: 'aaa', priority: 0 }
    ]
    const actual = getMatchedWithPriority(arr, 'aaa')
    expect(actual).toEqual(expected)
  })
})

describe('pickSomeAroundIndex', () => {
  const arr1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  it('can pick', () => {
    expect(pickSomeAroundIndex(arr1, 3, 2)).toEqual([1, 2, 3, 4, 5])
  })
  it('can pick head', () => {
    expect(pickSomeAroundIndex(arr1, 0, 2)).toEqual([0, 1, 2, 3, 4])
  })
  it('can pick near head', () => {
    expect(pickSomeAroundIndex(arr1, 3, 3)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
  it('can pick tail', () => {
    expect(pickSomeAroundIndex(arr1, 9, 2)).toEqual([5, 6, 7, 8, 9])
  })
  it('can pick near tail', () => {
    expect(pickSomeAroundIndex(arr1, 6, 3)).toEqual([3, 4, 5, 6, 7, 8, 9])
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
  'AAAbd',
  'baaa',
  'bbbbb',
  'cde',
  'cdecd',
  'ddddd',
  'a',
  'AA',
  'aaa'
]
