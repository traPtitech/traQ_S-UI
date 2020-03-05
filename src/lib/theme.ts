import { ThemedProps, DefaultTheme } from 'vue-styled-components'

export type ThemeFunction = (props: ThemedProps<{}>) => string
type ThemeFunctions = {
  [K1 in keyof DefaultTheme]: {
    [K2 in keyof DefaultTheme[K1]]: ThemeFunction
  }
}

const theme: ThemeFunctions = {
  accent: {
    primary: p => p.theme.accent.primary,
    notification: p => p.theme.accent.notification,
    online: p => p.theme.accent.online
  },
  background: {
    primary: p => p.theme.background.primary,
    secondary: p => p.theme.background.secondary,
    tertiary: p => p.theme.background.tertiary
  },
  ui: {
    primary: p => p.theme.ui.primary,
    secondary: p => p.theme.ui.secondary,
    tertiary: p => p.theme.ui.tertiary
  },
  text: {
    primary: p => p.theme.text.primary,
    secondary: p => p.theme.text.secondary
  }
}

export default theme
