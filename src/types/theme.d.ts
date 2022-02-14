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
  /**
   * @default 'auto' background.primaryの色の明るさで自動で`'light'`か`'dark'`になる
   */
  markdown?: MarkdownDefaultTheme
}

export type BasicTheme = {
  accent: {
    primary: MaybeCSSColorTypeSimple<{
      default: CSSColorType
      background: CSSImageType
      fallback: CSSColorTypeSimple
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
      fallback: CSSColorTypeSimple
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
      fallback: CSSColorTypeSimple
    }>
    secondary: MaybeCSSColorTypeSimple<{
      default: CSSColorType
      background: CSSImageType
      fallback: CSSColorTypeSimple
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

export type MarkdownDefaultTheme = 'auto' | 'light' | 'dark'
export type MarkdownTheme = {
  codeHighlight: MarkdownDefaultTheme
  linkText: CSSColorType
  hrText: CSSColorType
  h6Text: CSSColorType
  quoteText: CSSColorType
  quoteBar: CSSColorType
  codeBackground: CSSColorType
  codeFileNameBackground: CSSColorType
  tableTdBorder: CSSColorType
  tableTrBorder: CSSColorType
  tableTrBackground: CSSColorType
  tableTrBackground2: CSSColorType
  imgBackground: CSSColorType
  markText: CSSColorType
  markBackground: CSSColorType
  spoilerBackground: CSSColorType
  spoilerShownBackground: CSSColorType
  /** メンションやチャンネルリンク */
  embedLinkText: CSSColorType
  embedLinkBackground: CSSColorType
  /** 自分へのメンションや自分の所属しているグループへのメンション */
  embedLinkHighlightText: CSSColorType
  embedLinkHighlightBackground: CSSColorType
}

/**
 * インポート/エクスポートで利用するJsonの型
 */
export type ThemeJson = {
  version: 2
} & Theme

declare global {
  interface Window {
    defaultLightTheme: BasicTheme
    defaultDarkTheme: BasicTheme
  }
}
