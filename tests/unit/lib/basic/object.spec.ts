import { entries, overwrite, setByTuple } from '/@/lib/basic/object'

describe('entries', () => {
  it('should work', () => {
    const expected = [
      ['a', 0],
      ['b', 1]
    ]
    const actual = entries({ a: 0, b: 1 })
    expect(actual).toEqual(expected)
  })
})

describe('setByTuple', () => {
  it('should work', () => {
    const expected = { a: 1, b: 1 }
    const actual = { a: 0, b: 1 }
    setByTuple(actual, ['a', 1])
    expect(actual).toEqual(expected)
  })
})

describe('overwrite', () => {
  it('should work with one property', () => {
    const expected = { a: 1, b: 1 }
    const actual = { a: 0, b: 1 }
    overwrite(actual, { a: 1 })
    expect(actual).toEqual(expected)
  })
  it('should work with two property', () => {
    const expected = { a: 1, b: 2 }
    const actual = { a: 0, b: 1 }
    overwrite(actual, { a: 1, b: 2 })
    expect(actual).toEqual(expected)
  })
})
