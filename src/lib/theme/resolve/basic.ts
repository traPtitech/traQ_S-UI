import { transparentizeWithFallback } from '/@/lib/basic/color'
import { OnlyDefault, resolveOnlyDefault, resolveWithFallback } from './util'
import {
  BasicTheme,
  CSSColorType,
  CSSColorTypeSimple,
  CSSImageType
} from '/@/lib/theme/schema'

export type ResolvedBasicTheme = {
  accent: {
    primary: {
      default: CSSColorType
      background: CSSImageType
      inactive: CSSColorType
      fallback: CSSColorTypeSimple
    }
    notification: {
      default: CSSColorType
      background: CSSImageType
      fallback: CSSColorTypeSimple
    }
    online: OnlyDefault<CSSColorType>
    error: OnlyDefault<CSSColorType>
    focus: OnlyDefault<CSSColorType>
  }
  background: {
    primary: {
      default: CSSImageType
      border: CSSColorType
      fallback: CSSColorTypeSimple
    }
    secondary: {
      default: CSSImageType
      border: CSSColorType
      fallback: CSSColorTypeSimple
    }
    tertiary: {
      default: CSSImageType
      border: CSSColorType
      fallback: CSSColorTypeSimple
    }
  }
  ui: {
    primary: {
      default: CSSColorType
      background: CSSImageType
      inactive: CSSColorType
      fallback: CSSColorTypeSimple
    }
    secondary: {
      default: CSSColorType
      background: CSSImageType
      inactive: CSSColorType
      fallback: CSSColorTypeSimple
    }
    tertiary: OnlyDefault<CSSColorType>
  }
  text: {
    primary: OnlyDefault<CSSColorType>
    secondary: OnlyDefault<CSSColorType>
  }
}

const resolveWithFallbackForDefaultBorder = <
  T extends { default?: CSSImageType; border?: CSSColorType } | undefined
>(
  original: T,
  fallback: CSSColorTypeSimple
) => ({
  default: original?.default ?? fallback,
  border: original?.border ?? fallback,
  fallback
})

const resolveWithFallbackForDefaultBackgroundInactive = <
  T extends
    | {
        default?: CSSColorType
        background?: CSSImageType
        inactive?: CSSColorType
      }
    | undefined
>(
  original: T,
  fallback: CSSColorTypeSimple
) => ({
  default: original?.default ?? fallback,
  background: original?.background ?? fallback,
  inactive: original?.inactive ?? transparentizeWithFallback(fallback, 0.5),
  fallback
})

const resolveBasicThemeAccent = (
  original: BasicTheme['accent']
): ResolvedBasicTheme['accent'] => {
  return {
    primary: resolveWithFallback(
      original.primary,
      resolveWithFallbackForDefaultBackgroundInactive
    ),
    notification: resolveWithFallback(
      original.notification,
      (original, fallback) => ({
        default: original?.default ?? fallback,
        background: original?.background ?? fallback,
        fallback
      })
    ),
    online: resolveOnlyDefault(original.online),
    error: resolveOnlyDefault(original.error),
    focus: resolveOnlyDefault(original.focus)
  }
}

const resolveBasicThemeBackground = (
  original: BasicTheme['background']
): ResolvedBasicTheme['background'] => ({
  primary: resolveWithFallback(
    original.primary,
    resolveWithFallbackForDefaultBorder
  ),
  secondary: resolveWithFallback(
    original.secondary,
    resolveWithFallbackForDefaultBorder
  ),
  tertiary: resolveWithFallback(
    original.tertiary,
    resolveWithFallbackForDefaultBorder
  )
})

const resolveBasicThemeUi = (
  original: BasicTheme['ui']
): ResolvedBasicTheme['ui'] => ({
  primary: resolveWithFallback(
    original.primary,
    resolveWithFallbackForDefaultBackgroundInactive
  ),
  secondary: resolveWithFallback(
    original.secondary,
    resolveWithFallbackForDefaultBackgroundInactive
  ),
  tertiary: resolveOnlyDefault(original.tertiary)
})

const resolveBasicThemeText = (
  original: BasicTheme['text']
): ResolvedBasicTheme['text'] => ({
  primary: resolveOnlyDefault(original.primary),
  secondary: resolveOnlyDefault(original.secondary)
})

export const resolveBasicTheme = (
  original: BasicTheme
): ResolvedBasicTheme => ({
  accent: resolveBasicThemeAccent(original.accent),
  background: resolveBasicThemeBackground(original.background),
  ui: resolveBasicThemeUi(original.ui),
  text: resolveBasicThemeText(original.text)
})
