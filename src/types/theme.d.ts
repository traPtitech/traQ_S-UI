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

declare global {
  interface Window {
    defaultLightTheme: Theme
    defaultDarkTheme: Theme
  }
}
