import { resolveBasicTheme, ResolvedBasicTheme } from './basic'
import { Theme, CSSColorType, BrowserTheme } from '/@/types/theme'

export type ResolvedTheme = {
  basic: ResolvedBasicTheme
  browser: BrowserTheme
  specific: SpecificTheme
}

// TODO: 数を減らす
type SpecificTheme = {
  channelHashOpened: CSSColorType
  channelUnreadBadgeText: CSSColorType
  messageHoverBackground: CSSColorType
}

const resolveBrowserTheme = (
  original: Partial<BrowserTheme> | undefined,
  basic: ResolvedBasicTheme
): BrowserTheme => ({
  themeColor: original?.themeColor ?? basic.accent.primary.default,
  scrollbarThumb: original?.scrollbarThumb ?? basic.ui.secondary.default, // TODO: fallback transparentize 0.5
  scrollbarThumbHover: original?.scrollbarThumb ?? basic.ui.secondary.default, // TODO: fallback transparentize 0.8
  scrollbarTrack: original?.scrollbarTrack ?? 'transparent'
})

const resolveSpecificTheme = (basic: ResolvedBasicTheme): SpecificTheme => ({
  channelHashOpened: basic.background.secondary.border,
  channelUnreadBadgeText: basic.background.secondary.border,
  messageHoverBackground: basic.background.secondary.border // TODO: transparentize 0.5
})

export const resolveTheme = (original: Theme): ResolvedTheme => {
  const resolvedBasicTheme = resolveBasicTheme(original.basic)
  return {
    basic: resolvedBasicTheme,
    browser: resolveBrowserTheme(original.browser, resolvedBasicTheme),
    specific: resolveSpecificTheme(resolvedBasicTheme)
  }
}
