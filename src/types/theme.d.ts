export type { Theme } from '/@/lib/theme/schema'

declare global {
  interface Window {
    defaultLightTheme: Theme
    defaultDarkTheme: Theme
  }
}
