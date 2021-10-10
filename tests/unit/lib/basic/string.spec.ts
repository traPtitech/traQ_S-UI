import {
  compareString,
  compareStringInsensitive,
  count,
  countLength,
  lastIndexOf
} from '/@/lib/basic/string'

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

describe('count', () => {
  it('can count ascii string', () => {
    expect(count('aaa', 'a')).toEqual(3)
  })
  it('can count kanji string', () => {
    expect(count('漢字漢字', '漢')).toEqual(2)
  })
  it('can count emoji', () => {
    expect(count('😀😀😀😀😀', '😀')).toEqual(5)
  })
})

describe('countLength', () => {
  it('can count ascii string', () => {
    expect(countLength('aaa')).toEqual(3)
  })
  it('can count kanji string', () => {
    expect(countLength('漢字漢字')).toEqual(4)
  })
  it('can count emoji', () => {
    expect(countLength('😀😀😀😀😀')).toEqual(5)
  })
})

describe('lastIndexOf', () => {
  it('can find without position', () => {
    expect(lastIndexOf('target', ['t', 'r'])).toEqual(5)
  })
  it('can find with position', () => {
    expect(lastIndexOf('target', ['t', 'r'], 4)).toEqual(2)
  })
})
