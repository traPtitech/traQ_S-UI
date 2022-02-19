import { transparentizeWithFallback } from '/@/lib/basic/color'
import {
  OnlyDefault,
  passThroughOrResolve,
  resolveOnlyDefault,
  resolveWithFallback
} from './util'
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

const resolveBasicThemeAccent = (
  original: BasicTheme['accent']
): ResolvedBasicTheme['accent'] => {
  return {
    primary: resolveWithFallback(original.primary, (original, fallback) => ({
      default: original?.default ?? fallback,
      background: original?.background ?? fallback,
      inactive: transparentizeWithFallback(fallback, 0.5),
      fallback
    })),
    notification: passThroughOrResolve(original.notification, notification => ({
      default: notification,
      background: notification
    })),
    online: resolveOnlyDefault(original.online),
    error: resolveOnlyDefault(original.error),
    focus: resolveOnlyDefault(original.focus)
  }
}

const resolveBasicThemeBackground = (
  original: BasicTheme['background']
): ResolvedBasicTheme['background'] => ({
  primary: passThroughOrResolve(original.primary, primary => ({
    default: primary,
    border: primary,
    fallback: primary
  })),
  secondary: passThroughOrResolve(original.secondary, secondary => ({
    default: secondary,
    border: secondary,
    fallback: secondary
  })),
  tertiary: passThroughOrResolve(original.tertiary, tertiary => ({
    default: tertiary,
    border: tertiary
  }))
})

const resolveBasicThemeUi = (
  original: BasicTheme['ui']
): ResolvedBasicTheme['ui'] => ({
  primary: resolveWithFallback(original.primary, (original, fallback) => ({
    default: original?.default ?? fallback,
    background: original?.background ?? fallback,
    inactive: transparentizeWithFallback(fallback, 0.5),
    fallback
  })),
  secondary: resolveWithFallback(original.secondary, (original, fallback) => ({
    default: original?.default ?? fallback,
    background: original?.background ?? fallback,
    inactive: transparentizeWithFallback(fallback, 0.5),
    fallback
  })),
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
