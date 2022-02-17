import { isDarkColor } from '/@/lib/basic/color'
import { ResolvedBasicTheme } from './basic'
import { MarkdownDefaultTheme, MarkdownTheme } from '/@/lib/theme/schema'

export type ResolvedMarkdownTheme = MarkdownTheme & {
  codeHighlight: 'light' | 'dark'
}

const defaultLightTheme: ResolvedMarkdownTheme = {
  codeHighlight: 'light',
  linkText: '#0366d6',
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

const defaultDarkTheme: ResolvedMarkdownTheme = {
  codeHighlight: 'dark',
  linkText: '#0366d6',
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
  embedLinkText: '#005BAC',
  embedLinkBackground: 'transparent',
  embedLinkHighlightText: '#005BAC',
  embedLinkHighlightBackground: '#FAFFAD'
}

const resolveMarkdownBaseTheme = (
  original: MarkdownDefaultTheme | undefined,
  basic: ResolvedBasicTheme
): 'light' | 'dark' => {
  if (original === 'light' || original === 'dark') return original
  return isDarkColor(basic.background.primary.fallback) ? 'dark' : 'light'
}

export const resolveMarkdownTheme = (
  original: MarkdownDefaultTheme | undefined,
  basic: ResolvedBasicTheme
): ResolvedMarkdownTheme => {
  const base = resolveMarkdownBaseTheme(original, basic)
  switch (base) {
    case 'light':
      return defaultLightTheme
    case 'dark':
      return defaultDarkTheme
    default: {
      const never: never = base
      throw new Error(`Invalid markdown base theme: ${never}`)
    }
  }
}
