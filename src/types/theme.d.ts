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

export type MaybeCSSColorTypeSimple<T> = CSSColorTypeSimple | T

/** traQ固有のテーマ定義 */
export type Theme = {
  basic: BasicTheme
  browser?: Partial<BrowserTheme>
}

export type BasicTheme = {
  accent: {
    primary: MaybeCSSColorTypeSimple<{
      default: CSSColorType
      background: CSSImageType
    }>
    notification: MaybeCSSColorTypeSimple<{
      default: CSSColorType
      background: CSSImageType
    }>
    online: CSSColorTypeSimple
    error: CSSColorTypeSimple
    focus: CSSColorTypeSimple
  }
  background: {
    primary: MaybeCSSColorTypeSimple<{
      default: CSSImageType
      border: CSSColorType
    }>
    secondary: MaybeCSSColorTypeSimple<{
      default: CSSImageType
      border: CSSColorType
      fallback: CSSColorTypeSimple
    }>
    tertiary: MaybeCSSColorTypeSimple<{
      default: CSSImageType
      border: CSSColorType
    }>
  }
  ui: {
    primary: MaybeCSSColorTypeSimple<{
      default: CSSColorType
      background: CSSImageType
    }>
    secondary: MaybeCSSColorTypeSimple<{
      default: CSSColorType
      background: CSSImageType
    }>
    tertiary: CSSColorTypeSimple
  }
  text: {
    primary: CSSColorTypeSimple
    secondary: CSSColorTypeSimple
  }
}

export type BrowserTheme = {
  /**
   * @default accent.primary
   * @see https://developer.mozilla.org/ja/docs/Web/HTML/Element/meta/name/theme-color
   */
  themeColor: CSSColorType

  scrollbarThumb: CSSColorType
  scrollbarThumbHover: CSSColorType
  scrollbarTrack: CSSColorType
}

declare global {
  interface Window {
    defaultLightTheme: Theme
    defaultDarkTheme: Theme
  }
}
