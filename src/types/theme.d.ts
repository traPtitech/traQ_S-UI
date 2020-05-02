/** traQ固有のテーマ定義 */
export interface Theme {
  accent: {
    primary: string
    notification: string
    online: string
    error: string
  }
  background: {
    primary: string
    secondary: string
    tertiary: string
    secondarySub: string
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
  '--theme-background-primary': string
  '--theme-background-secondary': string
  '--theme-background-tertiary': string
  '--theme-background-secondarySub': string
  '--theme-ui-primary': string
  '--theme-ui-secondary': string
  '--theme-ui-tertiary': string
  '--theme-text-primary': string
  '--theme-text-secondary': string
}
