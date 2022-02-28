export type Theme = import('/@/lib/theme/schema').Theme

declare global {
  interface Window {
    defaultLightTheme: Theme
    defaultDarkTheme: Theme
  }
}
