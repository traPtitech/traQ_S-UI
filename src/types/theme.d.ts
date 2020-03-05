import 'vue-styled-components'

declare module 'vue-styled-components' {
  // traQ固有のテーマ定義
  interface DefaultTheme {
    accent: {
      primary: string
      notification: string
      online: string
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
}
