import { ResolvedBasicTheme } from '/@/lib/theme/resolve/basic'
import {
  defaultDarkTheme,
  defaultLightTheme,
  ResolvedMarkdownTheme,
  resolveMarkdownTheme
} from '/@/lib/theme/resolve/markdown'
import {
  MarkdownDefaultTheme,
  ExtendedOptionalMarkdownTheme
} from '/@/lib/theme/schema'

const basic: ResolvedBasicTheme = {
  accent: {
    primary: {
      default: '#000000',
      background: '#000000',
      fallback: '#000000'
    },
    notification: {
      default: '#000001',
      background: '#000001'
    },
    online: {
      default: '#000002'
    },
    error: {
      default: '#000003'
    },
    focus: {
      default: '#000004'
    }
  },
  background: {
    primary: {
      default: '#000010',
      border: '#000010',
      fallback: '#000010'
    },
    secondary: {
      default: '#000011',
      border: '#000011',
      fallback: '#000011'
    },
    tertiary: {
      default: '#000012',
      border: '#000012'
    }
  },
  ui: {
    primary: {
      default: '#000020',
      background: '#000020',
      fallback: '#000020'
    },
    secondary: {
      default: '#000021',
      background: '#000021',
      fallback: '#000021'
    },
    tertiary: {
      default: '#000022'
    }
  },
  text: {
    primary: {
      default: '#000030'
    },
    secondary: {
      default: '#000031'
    }
  }
}

describe('resolveMarkdownTheme', () => {
  const tests: Array<{
    name: string
    input: MarkdownDefaultTheme | ExtendedOptionalMarkdownTheme | undefined
    expected: ResolvedMarkdownTheme
  }> = [
    {
      name: 'can resolve from undefined',
      input: undefined,
      expected: defaultDarkTheme
    },
    {
      name: 'can resolve from auto',
      input: 'auto',
      expected: defaultDarkTheme
    },
    {
      name: 'can resolve from light',
      input: 'light',
      expected: defaultLightTheme
    },
    {
      name: 'can resolve from dark',
      input: 'dark',
      expected: defaultDarkTheme
    },
    {
      name: 'can extend auto',
      input: {
        extends: 'auto'
      },
      expected: {
        codeHighlight: 'dark',
        linkText: '#2189ff',
        hrText: '#e1e4e8',
        h6Text: '#6a737d',
        quoteText: '#6a737d',
        quoteBar: '#dfe2e5',
        codeBackground: '#243342',
        codeFileNameBackground: 'rgba(0, 0, 0, 0.1)',
        tableTdBorder: '#191c1f',
        tableTrBorder: '#2d3239',
        tableTrBackground: '#243342',
        tableTrBackground2: '#1b2631',
        imgBackground: '#fff',
        markText: 'black',
        markBackground: 'yellow',
        spoilerBackground: 'black',
        spoilerShownBackground: 'rgba(0, 0, 0, 0.1)',
        embedLinkText: '#4899F9',
        embedLinkBackground: 'transparent',
        embedLinkHighlightText: '#4899F9',
        embedLinkHighlightBackground: '#FAFFAD'
      }
    },
    {
      name: 'can override normal value',
      input: {
        extends: 'light',
        linkText: 'yellow'
      },
      expected: {
        codeHighlight: 'light',
        linkText: 'yellow',
        hrText: '#e1e4e8',
        h6Text: '#6a737d',
        quoteText: '#6a737d',
        quoteBar: '#dfe2e5',
        codeBackground: '#f6f8fa',
        codeFileNameBackground: 'rgba(0, 0, 0, 0.1)',
        tableTdBorder: '#dfe2e5',
        tableTrBorder: '#c6cbd1',
        tableTrBackground: '#fff',
        tableTrBackground2: '#f6f8fa',
        imgBackground: '#fff',
        markText: 'black',
        markBackground: 'yellow',
        spoilerBackground: 'black',
        spoilerShownBackground: 'rgba(0, 0, 0, 0.1)',
        embedLinkText: '#005BAC',
        embedLinkBackground: 'transparent',
        embedLinkHighlightText: '#005BAC',
        embedLinkHighlightBackground: '#FAFFAD'
      }
    },
    {
      name: 'can override codeHighlight',
      input: {
        extends: 'light',
        codeHighlight: 'dark',
        linkText: 'yellow'
      },
      expected: {
        codeHighlight: 'dark',
        linkText: 'yellow',
        hrText: '#e1e4e8',
        h6Text: '#6a737d',
        quoteText: '#6a737d',
        quoteBar: '#dfe2e5',
        codeBackground: '#f6f8fa',
        codeFileNameBackground: 'rgba(0, 0, 0, 0.1)',
        tableTdBorder: '#dfe2e5',
        tableTrBorder: '#c6cbd1',
        tableTrBackground: '#fff',
        tableTrBackground2: '#f6f8fa',
        imgBackground: '#fff',
        markText: 'black',
        markBackground: 'yellow',
        spoilerBackground: 'black',
        spoilerShownBackground: 'rgba(0, 0, 0, 0.1)',
        embedLinkText: '#005BAC',
        embedLinkBackground: 'transparent',
        embedLinkHighlightText: '#005BAC',
        embedLinkHighlightBackground: '#FAFFAD'
      }
    }
  ]

  for (const t of tests) {
    test(t.name, () => {
      const actual = resolveMarkdownTheme(t.input, basic)
      expect(actual).toStrictEqual(t.expected)
    })
  }
})
