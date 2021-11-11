/** traQ固有のテーマ定義 */
export interface Theme {
  accent: {
    primary: string
    notification: string
    online: string
    error: string
    focus: string
  }
  background: {
    primary: string
    secondary: string
    tertiary: string
  }
  ui: {
    primary: string
    secondary: string
    tertiary: string
  }
  text: {
    primary: string
    secondary: string
  }
}

export interface ThemeVariables {
  '--theme-accent-primary': string
  '--theme-accent-notification': string
  '--theme-accent-online': string
  '--theme-accent-error': string
  '--theme-accent-focus': string
  '--theme-background-primary': string
  '--theme-background-secondary': string
  '--theme-background-tertiary': string
  '--theme-ui-primary': string
  '--theme-ui-secondary': string
  '--theme-ui-tertiary': string
  '--theme-text-primary': string
  '--theme-text-secondary': string
}

export interface TransparentThemeVariables {
  '--theme-accent-primary--03': string
  '--theme-ui-primary--06': string
}

export interface CSSCommonVariables {
  '--common-text-white-primary': string
  '--common-text-white-secondary': string
  '--common-text-black': string
  '--common-ui-qall': string
  '--common-ui-muted': string
  '--common-ui-pin': string
  '--common-background-overlay': string
  '--common-background-black': string
  '--common-background-pin': string
  '--common-drop-shadow-default': string
}

declare global {
  interface Window {
    defaultLightTheme: Theme
    defaultDarkTheme: Theme
  }
}
