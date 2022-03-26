import { isDarkColor, transparentizeWithFallback } from '/@/lib/basic/color'
import { resolveBasicTheme, ResolvedBasicTheme } from './basic'
import {
  Theme,
  CSSColorType,
  BrowserTheme,
  SpecificTheme
} from '/@/lib/theme/schema'
import { ResolvedMarkdownTheme, resolveMarkdownTheme } from './markdown'

export type ResolvedTheme = {
  basic: ResolvedBasicTheme
  browser: BrowserTheme
  specific: ResolvedSpecificTheme
  markdown: ResolvedMarkdownTheme
}

type ResolvedSpecificTheme = SpecificTheme & {
  channelHashOpened: CSSColorType
  channelUnreadBadgeText: CSSColorType
  messageHoverBackground: CSSColorType
  stampIncludeMeBackground: CSSColorType
  stampCountText: CSSColorType
  stampPickerOpenerBorder: CSSColorType
  loadingSpinnerGapUiSecondary: CSSColorType
  sliderBackground: CSSColorType
}

const resolveBrowserTheme = (
  original: Partial<BrowserTheme> | undefined,
  basic: ResolvedBasicTheme
): BrowserTheme => ({
  themeColor: original?.themeColor ?? basic.accent.primary.default,
  colorScheme:
    original?.colorScheme ??
    (isDarkColor(basic.background.primary.fallback) ? 'dark' : 'light'),

  selectionText: original?.selectionText ?? basic.background.primary.border,
  selectionBackground:
    original?.selectionBackground ??
    transparentizeWithFallback(basic.accent.primary.fallback, 0.5),
  caret: original?.caret,

  scrollbarThumb:
    original?.scrollbarThumb ??
    transparentizeWithFallback(basic.ui.secondary.fallback, 0.5),
  scrollbarThumbHover:
    original?.scrollbarThumbHover ??
    transparentizeWithFallback(basic.ui.secondary.fallback, 0.8),
  scrollbarTrack: original?.scrollbarTrack ?? 'transparent'
})

const resolveSpecificTheme = (
  original: Partial<SpecificTheme> | undefined,
  basic: ResolvedBasicTheme
): ResolvedSpecificTheme => ({
  waveformColor: original?.waveformColor ?? basic.accent.primary.default,
  waveformGradation:
    original?.waveformGradation ??
    'repeating-linear-gradient(90deg, #ccc, #333, #ccc 25%)',
  navigationBarDesktopBackground:
    original?.navigationBarDesktopBackground ??
    basic.background.secondary.default,
  navigationBarMobileBackground:
    original?.navigationBarMobileBackground ??
    basic.background.tertiary.default,
  mainViewBackground:
    original?.mainViewBackground ?? basic.background.primary.default,
  sideBarBackground:
    original?.sideBarBackground ?? basic.background.secondary.default,

  stampEdgeEnable: original?.stampEdgeEnable ?? false,

  channelHashOpened: basic.background.secondary.border,
  channelUnreadBadgeText: basic.background.secondary.border,
  messageHoverBackground: transparentizeWithFallback(
    basic.background.secondary.fallback,
    0.5
  ),
  stampIncludeMeBackground: transparentizeWithFallback(
    basic.accent.primary.fallback,
    0.3
  ),
  stampCountText: transparentizeWithFallback(basic.ui.primary.fallback, 0.6),
  stampPickerOpenerBorder: transparentizeWithFallback(
    basic.ui.primary.fallback,
    0.6
  ),
  loadingSpinnerGapUiSecondary: transparentizeWithFallback(
    basic.ui.secondary.fallback,
    0.5
  ),
  sliderBackground: transparentizeWithFallback(basic.ui.secondary.fallback, 0.5)
})

export const resolveTheme = (original: Theme): ResolvedTheme => {
  const resolvedBasicTheme = resolveBasicTheme(original.basic)
  return {
    basic: resolvedBasicTheme,
    browser: resolveBrowserTheme(original.browser, resolvedBasicTheme),
    specific: resolveSpecificTheme(original.specific, resolvedBasicTheme),
    markdown: resolveMarkdownTheme(original.markdown, resolvedBasicTheme)
  }
}
