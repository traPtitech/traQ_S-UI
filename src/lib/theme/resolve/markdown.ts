import { isDarkColor } from '/@/lib/basic/color'
import { ResolvedBasicTheme } from './basic'
import {
  ExtendedOptionalMarkdownTheme,
  MarkdownDefaultTheme,
  MarkdownTheme
} from '/@/lib/theme/schema'

export type ResolvedMarkdownTheme = MarkdownTheme & {
  codeHighlight: 'light' | 'dark'
}

export const defaultLightTheme: Readonly<ResolvedMarkdownTheme> = {
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

export const defaultDarkTheme: Readonly<ResolvedMarkdownTheme> = {
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

const resolveMarkdownBaseTheme = (
  base: MarkdownDefaultTheme,
  basic: ResolvedBasicTheme
): 'light' | 'dark' => {
  switch (base) {
    case 'light':
    case 'dark':
      return base
    case 'auto':
      return isDarkColor(basic.background.primary.fallback) ? 'dark' : 'light'
    default: {
      const never: never = base
      throw new Error(`Invalid markdown base theme: ${never}`)
    }
  }
}

const resolveMarkdownBaseThemeValue = (
  base: MarkdownDefaultTheme,
  basic: ResolvedBasicTheme
): Readonly<ResolvedMarkdownTheme> => {
  const baseTheme = resolveMarkdownBaseTheme(base, basic)
  switch (baseTheme) {
    case 'light':
      return defaultLightTheme
    case 'dark':
      return defaultDarkTheme
    default: {
      const never: never = baseTheme
      throw new Error(`Invalid markdown base theme: ${never}`)
    }
  }
}

export const resolveMarkdownTheme = (
  original: MarkdownDefaultTheme | ExtendedOptionalMarkdownTheme = 'auto',
  basic: ResolvedBasicTheme
): ResolvedMarkdownTheme => {
  if (typeof original === 'string') {
    return resolveMarkdownBaseThemeValue(original, basic)
  }

  const base = resolveMarkdownBaseThemeValue(original.extends, basic)
  const codeHighlightWithoutAuto =
    original.codeHighlight === 'auto'
      ? base.codeHighlight
      : original.codeHighlight
  const originalWithoutExtend = {
    ...original,
    codeHighlight: codeHighlightWithoutAuto ?? base.codeHighlight,
    extends: undefined
  }
  delete originalWithoutExtend.extends

  return {
    ...base,
    ...originalWithoutExtend
  }
}
