/**
 * https://developer.mozilla.org/ja/docs/Web/CSS/color_value
 *
 * keyword(transparent,currentcolor,システム色含む)は使えない
 * 透明度指定もできない
 */
export type CSSColorTypeSimple = string
/**
 * https://developer.mozilla.org/ja/docs/Web/CSS/color_value
 *
 * こっちは透明度指定やkeywordの利用ができる
 */
export type CSSColorType = string
/**
 * https://developer.mozilla.org/ja/docs/Web/CSS/image
 *
 * CSSColorTypeでは使えなかったkeywordも使える
 */
export type CSSImageType = string

/** traQ固有のテーマ定義 */
export interface Theme {
  accent: {
    primary: CSSColorTypeSimple
    notification: CSSColorTypeSimple
    online: CSSColorTypeSimple
    error: CSSColorTypeSimple
    focus: CSSColorTypeSimple
  }
  background: {
    primary: CSSColorTypeSimple
    secondary: CSSColorTypeSimple
    tertiary: CSSColorTypeSimple
  }
  ui: {
    primary: CSSColorTypeSimple
    secondary: CSSColorTypeSimple
    tertiary: CSSColorTypeSimple
  }
  text: {
    primary: CSSColorTypeSimple
    secondary: CSSColorTypeSimple
  }
}

declare global {
  interface Window {
    defaultLightTheme: Theme
    defaultDarkTheme: Theme
  }
}
