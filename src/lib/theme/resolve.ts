import { Theme, CSSColorType, CSSColorTypeSimple } from '/@/types/theme'

type OnlyDefault<T> = {
  default: T
}

export type ResolvedTheme = {
  accent: {
    primary: OnlyDefault<CSSColorType>
    notification: OnlyDefault<CSSColorType>
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

const resolveThemeAccent = (
  original: Theme['accent']
): ResolvedTheme['accent'] => ({
  primary: resolveOnlyDefault(original.primary),
  notification: resolveOnlyDefault(original.notification),
  online: resolveOnlyDefault(original.online),
  error: resolveOnlyDefault(original.error),
  focus: resolveOnlyDefault(original.focus)
})

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
