export type BasicTheme = import('/@/lib/theme/schema').BasicTheme

declare global {
  interface Window {
    defaultLightTheme: BasicTheme
    defaultDarkTheme: BasicTheme
  }
}
