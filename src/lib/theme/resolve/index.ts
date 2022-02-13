import { transparentizeWithFallback } from '/@/lib/basic/color'
import { resolveBasicTheme, ResolvedBasicTheme } from './basic'
import { Theme, CSSColorType, BrowserTheme } from '/@/types/theme'
import { ResolvedMarkdownTheme, resolveMarkdownTheme } from './markdown'

export type ResolvedTheme = {
  basic: ResolvedBasicTheme
  browser: BrowserTheme
  specific: SpecificTheme
  markdown: ResolvedMarkdownTheme
}

// TODO: 数を減らす
type SpecificTheme = {
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
  scrollbarThumb:
    original?.scrollbarThumb ??
    transparentizeWithFallback(basic.ui.secondary.fallback, 0.5),
  scrollbarThumbHover:
    original?.scrollbarThumb ??
    transparentizeWithFallback(basic.ui.secondary.fallback, 0.8),
  scrollbarTrack: original?.scrollbarTrack ?? 'transparent'
})

const resolveSpecificTheme = (basic: ResolvedBasicTheme): SpecificTheme => ({
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
    specific: resolveSpecificTheme(resolvedBasicTheme),
    markdown: resolveMarkdownTheme(original.markdown, resolvedBasicTheme)
  }
}
