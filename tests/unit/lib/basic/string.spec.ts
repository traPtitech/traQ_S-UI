import {
  compareString,
  compareStringInsensitive,
  count,
  countLength,
  lastIndexOf,
  trimEnd
} from '/@/lib/basic/string'

describe('compareString', () => {
  it('can compare string', () => {
    expect(compareString('a', 'b')).toEqual(-1)
  })
  it('can compare string with undefined (1)', () => {
    expect(compareString(undefined, 'b')).toEqual(-1)
  })
  it('can compare string with undefined (2)', () => {
    expect(compareString('a')).toBe(1)
  })
  it('can compare string inverted', () => {
    expect(compareString('a', 'b', true)).toBe(1)
  })
  it('can compare same string', () => {
    expect(compareString('a', 'a')).toBe(0)
  })
  it('can compare case-sensitive string', () => {
    expect(compareString('a', 'A')).toBe(1)
  })
})

describe('compareStringInsensitive', () => {
  it('can compare string', () => {
    expect(compareStringInsensitive('a', 'b')).toEqual(-1)
  })
  it('can compare case-insensitive string', () => {
    expect(compareStringInsensitive('a', 'A')).toBe(0)
  })
})

describe('count', () => {
  it('can count ascii string', () => {
    expect(count('aaa', 'a')).toBe(3)
  })
  it('can count kanji string', () => {
    expect(count('漢字漢字', '漢')).toBe(2)
  })
  it('can count emoji', () => {
    expect(count('😀😀😀😀😀', '😀')).toBe(5)
  })
})

describe('countLength', () => {
  it('can count ascii string', () => {
    expect(countLength('aaa')).toBe(3)
  })
  it('can count kanji string', () => {
    expect(countLength('漢字漢字')).toBe(4)
  })
  it('can count emoji', () => {
    expect(countLength('😀😀😀😀😀')).toBe(5)
  })
})

describe('lastIndexOf', () => {
  it('can find without position', () => {
    expect(lastIndexOf('target', ['t', 'r'])).toBe(5)
  })
  it('can find with position', () => {
    expect(lastIndexOf('target', ['t', 'r'], 4)).toBe(2)
  })
})

describe('trimEnd', () => {
  it('should trim', () => {
    expect(trimEnd('abcd', 'cd')).toBe('ab')
  })
  it('should keep', () => {
    expect(trimEnd('abcd', 'ef')).toBe('abcd')
  })
})
