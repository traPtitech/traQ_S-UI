import { compareString, compareStringInsensitive } from '/@/lib/basic/string'

describe('compareString', () => {
  it('can compare string', () => {
    expect(compareString('a', 'b')).toEqual(-1)
  })
  it('can compare string with undefined (1)', () => {
    expect(compareString(undefined, 'b')).toEqual(-1)
  })
  it('can compare string with undefined (2)', () => {
    expect(compareString('a')).toEqual(1)
  })
  it('can compare string inverted', () => {
    expect(compareString('a', 'b', true)).toEqual(1)
  })
  it('can compare same string', () => {
    expect(compareString('a', 'a')).toEqual(0)
  })
  it('can compare case-sensitive string', () => {
    expect(compareString('a', 'A')).toEqual(1)
  })
})

describe('compareStringInsensitive', () => {
  it('can compare string', () => {
    expect(compareStringInsensitive('a', 'b')).toEqual(-1)
  })
  it('can compare case-insensitive string', () => {
    expect(compareStringInsensitive('a', 'A')).toEqual(0)
  })
})
