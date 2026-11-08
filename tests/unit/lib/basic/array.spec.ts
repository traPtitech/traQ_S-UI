import {
  getMatchedWithPriority,
  isDefined,
  lowerBound,
  pickSomeAroundIndex
} from '/@/lib/basic/array'

describe('lowerBound', () => {
  it.each([
    { values: [], target: 3, expected: 0 },
    { values: [1, 3, 3, 5], target: 0, expected: 0 },
    { values: [1, 3, 3, 5], target: 1, expected: 0 },
    { values: [1, 3, 3, 5], target: 3, expected: 1 },
    { values: [1, 3, 3, 5], target: 4, expected: 3 },
    { values: [1, 3, 3, 5], target: 5, expected: 3 },
    { values: [1, 3, 3, 5], target: 6, expected: 4 }
  ])(
    'returns index $expected for target $target in $values',
    ({ values, target, expected }) => {
      expect(lowerBound(values, value => value - target)).toBe(expected)
    }
  )

  it('supports readonly object arrays and projected boundaries', () => {
    const rows = [
      { start: 0, size: 12 },
      { start: 12, size: 24 },
      { start: 36, size: 36 }
    ] as const

    expect(lowerBound(rows, row => row.start + row.size - 20)).toBe(1)
    expect(lowerBound(rows, row => row.start - 20)).toBe(2)
  })

  it('supports nonnumeric comparison keys', () => {
    const values = ['alice', 'bob', 'bob', 'charlie'] as const

    expect(lowerBound(values, value => value.localeCompare('bob'))).toBe(1)
  })

  it('finds a boundary with logarithmic comparisons', () => {
    const values = Array.from({ length: 1024 }, (_, index) => index * 2)
    const compare = vi.fn((value: number) => value - 1023)

    expect(lowerBound(values, compare)).toBe(512)
    expect(compare.mock.calls.length).toBeLessThanOrEqual(11)
  })
})

describe('getMatchedWithPriority', () => {
  it('can get fullMatched', () => {
    const expected = [{ value: 'aaaaa', priority: 0 }]
    const actual = getMatchedWithPriority(arr, 'aaaaa', v => [v])
    expect(actual).toStrictEqual(expected)
  })
  it('can get prefixMatched', () => {
    const expected = [{ value: 'aaaaa', priority: 1 }]
    const actual = getMatchedWithPriority(arr, 'aaaa', v => [v])
    expect(actual).toStrictEqual(expected)
  })

  it('can get matched (1)', () => {
    const expected = [{ value: 'AAAbd', priority: 2 }]
    const actual = getMatchedWithPriority(arr, 'abd', v => [v])
    expect(actual).toStrictEqual(expected)
  })
  it('can get matched (2)', () => {
    const expected = [
      { value: 'abcde', priority: 2 },
      { value: 'cde', priority: 2 },
      { value: 'cdecd', priority: 2 }
    ]
    const actual = getMatchedWithPriority(arr, 'de', v => [v])
    expect(actual).toStrictEqual(expected)
  })

  it('can get fullMatched and prefixMatched and matched', () => {
    const expected = [
      { value: 'aaaaa', priority: 1 },
      { value: 'AAAbd', priority: 1 },
      { value: 'baaa', priority: 2 },
      { value: 'aaa', priority: 0 }
    ]
    const actual = getMatchedWithPriority(arr, 'aaa', v => [v])
    expect(actual).toStrictEqual(expected)
  })

  it('can use key', () => {
    const input = [{ name: 'abc' }, { name: 'def' }]
    const expected = [{ value: { name: 'abc' }, priority: 2 }]
    const actual = getMatchedWithPriority(input, 'bc', v => [v.name])
    expect(actual).toStrictEqual(expected)
  })
})

describe('pickSomeAroundIndex', () => {
  const arr1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  it('can pick', () => {
    expect(pickSomeAroundIndex(arr1, 3, 2)).toStrictEqual([1, 2, 3, 4, 5])
  })
  it('can pick head', () => {
    expect(pickSomeAroundIndex(arr1, 0, 2)).toStrictEqual([0, 1, 2, 3, 4])
  })
  it('can pick near head', () => {
    expect(pickSomeAroundIndex(arr1, 3, 3)).toStrictEqual([0, 1, 2, 3, 4, 5, 6])
  })
  it('can pick tail', () => {
    expect(pickSomeAroundIndex(arr1, 9, 2)).toStrictEqual([5, 6, 7, 8, 9])
  })
  it('can pick near tail', () => {
    expect(pickSomeAroundIndex(arr1, 6, 3)).toStrictEqual([3, 4, 5, 6, 7, 8, 9])
  })
})

describe('isDefined', () => {
  it('can check undefined', () => {
    expect(isDefined(undefined)).toBe(false)
  })
  it('can check null', () => {
    expect(isDefined(null)).toBe(true)
  })
  it('can check object', () => {
    expect(isDefined({})).toBe(true)
  })
  it('can check empty string', () => {
    expect(isDefined('')).toBe(true)
  })
  it('can check string', () => {
    expect(isDefined('str')).toBe(true)
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
