# カスタムテーマ機能

[設定例などはこちらを参照](https://github.com/traPtitech/traQ_S-UI/wiki/%E3%82%AB%E3%82%B9%E3%82%BF%E3%83%A0%E3%83%86%E3%83%BC%E3%83%9E)

## 基本型

### `CSSColorTypeSimple`

- [CSS の`<color>`](https://developer.mozilla.org/ja/docs/Web/CSS/color_value)のうち、RGB 色と HSL 色の 16 進表記と関数表記のみ利用可能である。
- キーワード(色キーワードのみならず`transparent`、`currentcolor`、システム色含む)は利用できない。

### `CSSColorType`

- [CSS の`<color>`](https://developer.mozilla.org/ja/docs/Web/CSS/color_value)。
- `CSSColorTypeSimple`と異なり制約がないため、`currentColor`などが利用できる。

### `CSSImageType`

- [CSS の`<image>`](https://developer.mozilla.org/ja/docs/Web/CSS/image)。
- `linear-gradient`なども利用可能である。

### `CSSImageColorType`

CSS の`<image>`または`<color>`。

## 形式

```ts
type Theme = {
  /** 現在は2固定 */
  version: 2
  basic: BasicTheme
  specific?: Partial<SpecificTheme>
  browser?: Partial<BrowserTheme>
  markdown?: MarkdownDefaultTheme | ExtendedOptionalMarkdownTheme
}
```

### BasicTheme

- 基本となるパレット。
- 省略したプロパティは fallback プロパティから算出される。

```ts
type BasicTheme = {
  accent: {
    primary:
      | CSSColorTypeSimple
      | {
          default?: CSSColorType
          background?: CSSImageColorType
          /** hoverしていない状態など */
          inactive?: CSSColorType
          fallback: CSSColorTypeSimple
        }
    notification:
      | CSSColorTypeSimple
      | {
          default?: CSSColorType
          background?: CSSImageColorType
          fallback: CSSColorTypeSimple
        }
    online: CSSColorTypeSimple
    error: CSSColorTypeSimple
    focus: CSSColorTypeSimple
  }
  background: {
    primary:
      | CSSColorTypeSimple
      | {
          default?: CSSImageColorType
          border?: CSSColorType
          fallback: CSSColorTypeSimple
        }
    secondary:
      | CSSColorTypeSimple
      | {
          default?: CSSImageColorType
          border?: CSSColorType
          fallback: CSSColorTypeSimple
        }
    tertiary:
      | CSSColorTypeSimple
      | {
          default?: CSSImageColorType
          border?: CSSColorType
          fallback: CSSColorTypeSimple
        }
  }
  ui: {
    primary:
      | CSSColorTypeSimple
      | {
          default?: CSSColorType
          background?: CSSImageColorType
          /** hoverしていない状態など */
          inactive?: CSSColorType
          fallback: CSSColorTypeSimple
        }
    secondary:
      | CSSColorTypeSimple
      | {
          default?: CSSColorType
          background?: CSSImageColorType
          /** hoverしていない状態など */
          inactive?: CSSColorType
          fallback: CSSColorTypeSimple
        }
    tertiary: CSSColorTypeSimple
  }
  text: {
    primary: CSSColorTypeSimple
    secondary: CSSColorTypeSimple
  }
}
```

### SpecificTheme

- 特定の部分を上書きする場合に利用する。
- 指定しなかった場合は BasicTheme から算出される。

```ts
type SpecificTheme = {
  /** 波形表示の色 */
  waveformColor: CSSColorType
  /** 波形表示のグラデーション */
  waveformGradation: CSSImageType

  /**
   * ナビゲーションバー(左の部分)のデスクトップでの背景色
   *
   * `background`プロパティの記法が利用可能
   */
  navigationBarDesktopBackground: string
  /**
   * ナビゲーションバー(左の部分)のモバイルでの背景色
   *
   * `background`プロパティの記法が利用可能
   */
  navigationBarMobileBackground: string
  /**
   * メインビュー(真ん中の部分)の背景色
   *
   * `background`プロパティの記法が利用可能
   */
  mainViewBackground: string
  /**
   * サイドバー(右の部分)の背景色
   *
   * `background`プロパティの記法が利用可能
   */
  sideBarBackground: string

  /**
   * スタンプに縁をつけるか
   * @default false
   */
  stampEdgeEnable: boolean
}
```

### BrowserTheme

- ブラウザの機能の色を変更する際に利用する。
- 指定しなかった場合は BasicTheme から算出される。または、ブラウザのデフォルトに従う。

```ts
type BrowserTheme = {
  /**
   * @default accent.primary
   * @see https://developer.mozilla.org/ja/docs/Web/HTML/Element/meta/name/theme-color
   */
  themeColor: CSSColorType
  /**
   * @default undefined background.primaryの色の明るさで自動で`'light dark'`か`'dark light'`になる
   * @see https://developer.mozilla.org/ja/docs/Web/CSS/color-scheme
   */
  colorScheme: string

  /** 選択状態になっている部分の文字色 */
  selectionText: CSSColorTypeSimple
  /** 選択状態になっている部分の背景色 */
  selectionBackground: CSSColorType
  /** キャレットの色 */
  caret?: CSSColorType

  /** スクロールバーのサムの色 */
  scrollbarThumb: CSSColorType
  /** スクロールバーのサムのホバー状態の色 */
  scrollbarThumbHover: CSSColorType
  /** スクロールバーのトラックの色 */
  scrollbarTrack: CSSColorType
}
```

### MarkdownTheme

- メッセージなどで利用されるマークダウンのテーマに利用する。
- 指定しなかった場合は、用意されているライトテーマかダークテーマが利用される。

```ts
/**
 * @default 'auto' background.primaryの色の明るさで自動で`'light'`か`'dark'`になる
 */
type MarkdownDefaultTheme = 'auto' | 'light' | 'dark'

type ExtendedOptionalMarkdownTheme = {
  /**
   * 元にするテーマ
   *
   * MarkdownThemeで省略した場合にこのテーマの色が利用される
   **/
  extends: MarkdownDefaultTheme
} & Partial<MarkdownTheme>

type MarkdownTheme = {
  /** コードブロックでのシンタックスハイライト */
  codeHighlight: MarkdownDefaultTheme
  linkText: CSSColorType
  hrText: CSSColorType
  h6Text: CSSColorType
  quoteText: CSSColorType
  quoteBar: CSSColorType
  /** コードブロックの背景色 */
  codeBackground: CSSColorType
  /** コードブロックの右上のファイル名などの表示の背景 */
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
```

## 算出処理について

カスタムテーマから欠落している色などを算出したあとのものを`ResolvedTheme`と命名している。

算出処理の流れは以下のとおりである。

1. カスタムテーマのバリデーションを行う
   - `/@/lib/theme/schema.ts`の`themeSchema`を用いて`themeSchema.safeParse`により
2. カスタムテーマがストアにセットされる
3. カスタムテーマから算出処理が行われる (getter なのでセットされれば計算される)
   - `/@/lib/theme/resolve/index.ts`の`resolveTheme`により

## マイグレーションについて

- 現在のカスタムテーマはバージョン 2 である。
- バージョン 1 から自動でマイグレーションを行うようになっている。
- 実装は`/@/store/app/themeSettings.ts`の`useIndexedDbValue`の`migrations`を参照。
