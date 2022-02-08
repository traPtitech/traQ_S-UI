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
    primary: {
      default: CSSImageType
      border: CSSColorType
    }
    secondary: {
      default: CSSImageType
      border: CSSColorType
      transparent5: CSSColorType
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
    }
    secondary: {
      default: CSSColorType
      background: CSSImageType
    }
    tertiary: OnlyDefault<CSSColorType>
  }
  text: {
    primary: OnlyDefault<CSSColorType>
    secondary: OnlyDefault<CSSColorType>
  }
  specific: {
    channelHashOpened: CSSColorType
    channelUnreadBadgeText: CSSColorType
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

const resolveFromFallback = <T>(
  original: CSSColorTypeSimple | { fallback: CSSColorTypeSimple },
  f: (fallback: string) => T
): T => {
  const fallback = typeof original === 'string' ? original : original.fallback
  return f(fallback)
}

const getFallback = (
  original: CSSColorTypeSimple | { fallback: CSSColorTypeSimple }
) => {
  if (typeof original === 'string') {
    return original
  }
  return original.fallback
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
  primary: passThroughOrResolve(original.primary, primary => ({
    default: primary,
    border: primary
  })),
  secondary: resolveFromFallback(original.secondary, secondary => ({
    default: secondary,
    border: secondary,
    transparent5: secondary // TODO
  })),
  tertiary: passThroughOrResolve(original.tertiary, tertiary => ({
    default: tertiary,
    border: tertiary
  }))
})

const resolveThemeUi = (original: Theme['ui']): ResolvedTheme['ui'] => ({
  primary: passThroughOrResolve(original.primary, primary => ({
    default: primary,
    background: primary
  })),
  secondary: passThroughOrResolve(original.secondary, secondary => ({
    default: secondary,
    background: secondary
  })),
  tertiary: resolveOnlyDefault(original.tertiary)
})

const resolveThemeText = (original: Theme['text']): ResolvedTheme['text'] => ({
  primary: resolveOnlyDefault(original.primary),
  secondary: resolveOnlyDefault(original.secondary)
})

const resolveThemeSpecific = (original: Theme): ResolvedTheme['specific'] => ({
  channelHashOpened: getFallback(original.background.secondary),
  channelUnreadBadgeText: getFallback(original.background.secondary)
})

export const resolveTheme = (original: Theme): ResolvedTheme => {
  return {
    accent: resolveThemeAccent(original.accent),
    background: resolveThemeBackground(original.background),
    ui: resolveThemeUi(original.ui),
    text: resolveThemeText(original.text),
    specific: resolveThemeSpecific(original)
  }
}
