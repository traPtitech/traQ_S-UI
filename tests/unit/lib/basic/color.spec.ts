import type { Color } from '/@/lib/basic/color'
import {
  isDarkColor,
  parseColor,
  stringifyColor,
  transparentize,
  transparentizeWithFallback
} from '/@/lib/basic/color'

describe('parseColor', () => {
  const tests: ReadonlyArray<{
    name: string
    input: string
    expected: Color | null
  }> = [
    {
      name: 'can parse 3 length hex notation',
      input: '#034',
      expected: {
        type: 'rgb',
        r: 0,
        g: 51,
        b: 68,
        a: 1
      }
    },
    {
      name: 'can parse 4 length hex notation',
      input: '#0343',
      expected: {
        type: 'rgb',
        r: 0,
        g: 51,
        b: 68,
        a: 0.2
      }
    },
    {
      name: 'can parse 6 length hex notation',
      input: '#034034',
      expected: {
        type: 'rgb',
        r: 3,
        g: 64,
        b: 52,
        a: 1
      }
    },
    {
      name: 'can parse 8 length hex notation',
      input: '#03403466',
      expected: {
        type: 'rgb',
        r: 3,
        g: 64,
        b: 52,
        a: 0.4
      }
    },
    {
      name: 'can parse lower case hex notation',
      input: '#abcdef',
      expected: {
        type: 'rgb',
        r: 171,
        g: 205,
        b: 239,
        a: 1
      }
    },
    {
      name: 'can parse upper case hex notation',
      input: '#ABCDEF',
      expected: {
        type: 'rgb',
        r: 171,
        g: 205,
        b: 239,
        a: 1
      }
    },
    {
      name: 'can parse mixed case hex notation',
      input: '#aBcDeF',
      expected: {
        type: 'rgb',
        r: 171,
        g: 205,
        b: 239,
        a: 1
      }
    },
    {
      name: 'can fail with invalid value 3/4 length hex notation',
      input: '#034X',
      expected: null
    },
    {
      name: 'can fail with invalid value 6/8 length hex notation (1)',
      input: '#034034XX',
      expected: null
    },
    {
      name: 'can fail with invalid value 6/8 length hex notation (2)',
      input: '#0000Xa',
      expected: null
    },
    {
      name: 'can fail with invalid length hex notation',
      input: '#03400',
      expected: null
    },

    {
      name: 'can parse rgb function',
      input: 'rgb(0, 51, 68, 0.2)',
      expected: {
        type: 'rgb',
        r: 0,
        g: 51,
        b: 68,
        a: 0.2
      }
    },
    {
      name: 'can parse rgb function with omitted 0',
      input: 'rgb(0, 51, 68, .2)',
      expected: {
        type: 'rgb',
        r: 0,
        g: 51,
        b: 68,
        a: 0.2
      }
    },
    {
      name: 'can fail rgb function with invalid number',
      input: 'rgb(0, x, 68, .2)',
      expected: null
    },
    {
      name: 'can parse rgba function',
      input: 'rgba(0, 51, 68, 0.2)',
      expected: {
        type: 'rgb',
        r: 0,
        g: 51,
        b: 68,
        a: 0.2
      }
    },
    {
      name: 'can parse rgb function without alpha (1)',
      input: 'rgb(0, 51, 68)',
      expected: {
        type: 'rgb',
        r: 0,
        g: 51,
        b: 68,
        a: 1
      }
    },
    {
      name: 'can parse rgb function without alpha (2)',
      input: 'rgb(0 51 68)',
      expected: {
        type: 'rgb',
        r: 0,
        g: 51,
        b: 68,
        a: 1
      }
    },
    {
      name: 'can parse rgb function with /',
      input: 'rgb(0 51 68 / 0.2)',
      expected: {
        type: 'rgb',
        r: 0,
        g: 51,
        b: 68,
        a: 0.2
      }
    },
    {
      name: 'can parse rgb function with percent alpha',
      input: 'rgb(0 51 68 / 20%)',
      expected: {
        type: 'rgb',
        r: 0,
        g: 51,
        b: 68,
        a: 0.2
      }
    },
    {
      name: 'can fail rgb function with invalid /',
      input: 'rgb(0 51 68 / 0.2 / 0.4)',
      expected: null
    },
    {
      name: 'can fail rgb function with invalid values',
      input: 'rgb(0 51 68 36)',
      expected: null
    },

    {
      name: 'can parse hsl function',
      input: 'hsl(195, 100%, 13%, 0.2)',
      expected: {
        type: 'hsl',
        h: 195,
        s: 1,
        l: 0.13,
        a: 0.2
      }
    },
    {
      name: 'can parse hsla function',
      input: 'hsla(195, 100%, 13%, 0.2)',
      expected: {
        type: 'hsl',
        h: 195,
        s: 1,
        l: 0.13,
        a: 0.2
      }
    },
    {
      name: 'can parse hsl function with deg',
      input: 'hsl(195deg, 100%, 13%, 0.2)',
      expected: {
        type: 'hsl',
        h: 195,
        s: 1,
        l: 0.13,
        a: 0.2
      }
    },
    {
      name: 'can parse hsl function with /',
      input: 'hsl(195deg 100% 13% / 0.2)',
      expected: {
        type: 'hsl',
        h: 195,
        s: 1,
        l: 0.13,
        a: 0.2
      }
    },
    {
      name: 'can fail hsl function with invalid value',
      input: 'hsl(195deg, 100, 13%, 0.2)',
      expected: null
    },
    {
      name: 'can fail hsl function with invalid /',
      input: 'hsl(195deg 100% 13% / 0.2 / 0.4)',
      expected: null
    },
    {
      name: 'can fail hsl function with invalid values',
      input: 'hsl(195deg, 100, 13%, 13%, 0.2)',
      expected: null
    },

    {
      name: 'can fail invalid function (1)',
      input: 'rgbb(0 51 68)',
      expected: null
    },
    {
      name: 'can fail invalid function (2)',
      input: 'hslb(0 51 68)',
      expected: null
    },
    {
      name: 'can fail invalid string',
      input: 'abc',
      expected: null
    }
  ]

  for (const t of tests) {
    it(t.name, () => {
      const actual = parseColor(t.input)
      expect(actual).toStrictEqual(t.expected)
    })
  }
})

describe('stringifyColor', () => {
  it('can stringify rgb color', () => {
    const input = {
      type: 'rgb',
      r: 0,
      g: 51,
      b: 68,
      a: 0.2
    } as const
    expect(stringifyColor(input)).toBe('rgba(0, 51, 68, 0.2)')
  })
  it('can stringify hsl color', () => {
    const input = {
      type: 'hsl',
      h: 195,
      s: 1,
      l: 0.13,
      a: 0.2
    } as const
    expect(stringifyColor(input)).toBe('hsla(195, 100%, 13%, 0.2)')
  })
})

describe('transparentize', () => {
  it('can transparentize color without alpha', () => {
    const actual = transparentize('rgb(0, 0, 0)', 0.5)
    const expected = 'rgba(0, 0, 0, 0.5)'
    expect(actual).toBe(expected)
  })
  it('can transparentize color with alpha', () => {
    const actual = transparentize('rgb(0, 0, 0, 0.5)', 0.5)
    const expected = 'rgba(0, 0, 0, 0.25)'
    expect(actual).toBe(expected)
  })
})

describe('transparentizeWithFallback', () => {
  it('can fallback', () => {
    const actual = transparentizeWithFallback('invalid', 0.5)
    const expected = 'invalid'
    expect(actual).toBe(expected)
  })
})

describe('isDarkColor', () => {
  it('can detect rgb', () => {
    const actual = isDarkColor('rgb(0,0,0)')
    expect(actual).toBe(true)
  })
  it('can detect hsl', () => {
    const actual = isDarkColor('hsl(0,0%,0%)')
    expect(actual).toBe(true)
  })
})
