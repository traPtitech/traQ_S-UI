import {
  Theme,
  CSSColorType,
  CSSColorTypeSimple,
  CSSImageType
} from '/@/types/theme'

type OnlyDefault<T> = {
  default: T
}

export type ResolvedTheme = {
  accent: {
    primary: {
      default: CSSColorType
      background: CSSImageType
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
    primary: OnlyDefault<CSSColorType>
    secondary: OnlyDefault<CSSColorType>
    tertiary: OnlyDefault<CSSColorType>
  }
  ui: {
    primary: OnlyDefault<CSSColorType>
    secondary: OnlyDefault<CSSColorType>
    tertiary: OnlyDefault<CSSColorType>
  }
  text: {
    primary: OnlyDefault<CSSColorType>
    secondary: OnlyDefault<CSSColorType>
  }
}

const resolveOnlyDefault = (
  original: CSSColorTypeSimple
): OnlyDefault<CSSColorType> => ({ default: original })

const passThroughOrResolve = <T>(
  original: T | string,
  f: (original: string) => T
): T => {
  if (typeof original === 'string') {
    return f(original)
  }
  return original
}

const resolveThemeAccent = (
  original: Theme['accent']
): ResolvedTheme['accent'] => {
  return {
    primary: passThroughOrResolve(original.primary, primary => ({
      default: primary,
      background: primary
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

const resolveThemeBackground = (
  original: Theme['background']
): ResolvedTheme['background'] => ({
  primary: resolveOnlyDefault(original.primary),
  secondary: resolveOnlyDefault(original.secondary),
  tertiary: resolveOnlyDefault(original.tertiary)
})

const resolveThemeUi = (original: Theme['ui']): ResolvedTheme['ui'] => ({
  primary: resolveOnlyDefault(original.primary),
  secondary: resolveOnlyDefault(original.secondary),
  tertiary: resolveOnlyDefault(original.tertiary)
})

const resolveThemeText = (original: Theme['text']): ResolvedTheme['text'] => ({
  primary: resolveOnlyDefault(original.primary),
  secondary: resolveOnlyDefault(original.secondary)
})

export const resolveTheme = (original: Theme): ResolvedTheme => {
  return {
    accent: resolveThemeAccent(original.accent),
    background: resolveThemeBackground(original.background),
    ui: resolveThemeUi(original.ui),
    text: resolveThemeText(original.text)
  }
}
