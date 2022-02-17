import { z } from 'zod'
import { parseColor } from '/@/lib/basic/color'

/**
 * https://developer.mozilla.org/ja/docs/Web/CSS/color_value
 *
 * keyword(transparent,currentcolor,システム色含む)は使えない
 * 透明度指定もできない
 */
export type CSSColorTypeSimple = string
const CSSColorTypeSimpleSchema = z
  .string()
  .refine(value => parseColor(value) !== null, {
    message: 'Invalid CSSColorTypeSimple'
  })
/**
 * https://developer.mozilla.org/ja/docs/Web/CSS/color_value
 *
 * こっちは透明度指定やkeywordの利用ができる
 */
export type CSSColorType = string
const CSSColorTypeSchema = z.string()
/**
 * https://developer.mozilla.org/ja/docs/Web/CSS/image
 *
 * CSSColorTypeでは使えなかったkeywordも使える
 */
export type CSSImageType = string
const CSSImageTypeSchema = z.string()

const maybeCSSColorTypeSimple = <T extends z.ZodTypeAny>(t: T) =>
  z.union([CSSColorTypeSimpleSchema, t])

export type BasicTheme = z.infer<typeof basicThemeSchema>
const basicThemeSchema = z.object({
  accent: z.object({
    primary: maybeCSSColorTypeSimple(
      z.object({
        default: CSSColorTypeSchema,
        background: CSSImageTypeSchema,
        fallback: CSSColorTypeSimpleSchema
      })
    ),
    notification: maybeCSSColorTypeSimple(
      z.object({
        default: CSSColorTypeSchema,
        background: CSSImageTypeSchema
      })
    ),
    online: CSSColorTypeSimpleSchema,
    error: CSSColorTypeSimpleSchema,
    focus: CSSColorTypeSimpleSchema
  }),
  background: z.object({
    primary: maybeCSSColorTypeSimple(
      z.object({
        default: CSSImageTypeSchema,
        border: CSSColorTypeSchema,
        fallback: CSSColorTypeSimpleSchema
      })
    ),
    secondary: maybeCSSColorTypeSimple(
      z.object({
        default: CSSImageTypeSchema,
        border: CSSColorTypeSchema,
        fallback: CSSColorTypeSimpleSchema
      })
    ),
    tertiary: maybeCSSColorTypeSimple(
      z.object({
        default: CSSImageTypeSchema,
        border: CSSColorTypeSchema
      })
    )
  }),
  ui: z.object({
    primary: maybeCSSColorTypeSimple(
      z.object({
        default: CSSColorTypeSchema,
        background: CSSImageTypeSchema,
        fallback: CSSColorTypeSimpleSchema
      })
    ),
    secondary: maybeCSSColorTypeSimple(
      z.object({
        default: CSSColorTypeSchema,
        background: CSSImageTypeSchema,
        fallback: CSSColorTypeSimpleSchema
      })
    ),
    tertiary: CSSColorTypeSimpleSchema
  }),
  text: z.object({
    primary: CSSColorTypeSimpleSchema,
    secondary: CSSColorTypeSimpleSchema
  })
})

export type BrowserTheme = z.infer<typeof browserThemeSchema>
const browserThemeSchema = z.object({
  /**
   * @default accent.primary
   * @see https://developer.mozilla.org/ja/docs/Web/HTML/Element/meta/name/theme-color
   */
  themeColor: CSSColorTypeSchema,

  scrollbarThumb: CSSColorTypeSchema,
  scrollbarThumbHover: CSSColorTypeSchema,
  scrollbarTrack: CSSColorTypeSchema
})

/**
 * @default 'auto' background.primaryの色の明るさで自動で`'light'`か`'dark'`になる
 */
export type MarkdownDefaultTheme = z.infer<typeof markdownDefaultThemeSchema>
const markdownDefaultThemeSchema = z.enum(['auto', 'light', 'dark'])

export type MarkdownTheme = z.infer<typeof markdownTheme>
const markdownTheme = z.object({
  codeHighlight: markdownDefaultThemeSchema,
  linkText: CSSColorTypeSchema,
  hrText: CSSColorTypeSchema,
  h6Text: CSSColorTypeSchema,
  quoteText: CSSColorTypeSchema,
  quoteBar: CSSColorTypeSchema,
  codeBackground: CSSColorTypeSchema,
  codeFileNameBackground: CSSColorTypeSchema,
  tableTdBorder: CSSColorTypeSchema,
  tableTrBorder: CSSColorTypeSchema,
  tableTrBackground: CSSColorTypeSchema,
  tableTrBackground2: CSSColorTypeSchema,
  imgBackground: CSSColorTypeSchema,
  markText: CSSColorTypeSchema,
  markBackground: CSSColorTypeSchema,
  spoilerBackground: CSSColorTypeSchema,
  spoilerShownBackground: CSSColorTypeSchema,
  /** メンションやチャンネルリンク */
  embedLinkText: CSSColorTypeSchema,
  embedLinkBackground: CSSColorTypeSchema,
  /** 自分へのメンションや自分の所属しているグループへのメンション */
  embedLinkHighlightText: CSSColorTypeSchema,
  embedLinkHighlightBackground: CSSColorTypeSchema
})

/** traQ固有のテーマ定義 */
export type Theme = z.infer<typeof themeSchema>
const themeSchema = z.object({
  basic: basicThemeSchema,
  browser: browserThemeSchema.partial().optional(),
  markdown: markdownDefaultThemeSchema.optional()
})

/**
 * インポート/エクスポートで利用するJsonの型
 */
export type ThemeJson = z.infer<typeof themeJsonSchema>
export const themeJsonSchema = z
  .object({
    version: z.literal(2)
  })
  .merge(themeSchema)
  .strict()
