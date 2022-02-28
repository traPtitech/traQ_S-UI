import { z } from 'zod'
import { parseColor } from '/@/lib/basic/color'

/**
 * それぞれの型や色の説明などはdocs/theme.mdを参照すること
 */

export type CSSColorTypeSimple = string
const CSSColorTypeSimpleSchema = z
  .string()
  .refine(value => parseColor(value) !== null, {
    message: 'Invalid CSSColorTypeSimple'
  })

export type CSSColorType = string
const CSSColorTypeSchema = z.string()

export type CSSImageType = string
const CSSImageTypeSchema = z.string()

const maybeCSSColorTypeSimple = <T extends z.ZodTypeAny>(t: T) =>
  z.union([CSSColorTypeSimpleSchema, t])

/**
 * 破壊的変更を防ぐために
 * - fallbackを常に定義すること
 * - fallback以外はoptionalにすること
 */
export type BasicTheme = z.infer<typeof basicThemeSchema>
const basicThemeSchema = z.object({
  accent: z.object({
    primary: maybeCSSColorTypeSimple(
      z.object({
        default: CSSColorTypeSchema.optional(),
        background: CSSImageTypeSchema.optional(),
        inactive: CSSColorTypeSchema.optional(),
        fallback: CSSColorTypeSimpleSchema
      })
    ),
    notification: maybeCSSColorTypeSimple(
      z.object({
        default: CSSColorTypeSchema.optional(),
        background: CSSImageTypeSchema.optional(),
        fallback: CSSColorTypeSchema
      })
    ),
    online: CSSColorTypeSimpleSchema,
    error: CSSColorTypeSimpleSchema,
    focus: CSSColorTypeSimpleSchema
  }),
  background: z.object({
    primary: maybeCSSColorTypeSimple(
      z.object({
        default: CSSImageTypeSchema.optional(),
        border: CSSColorTypeSchema.optional(),
        fallback: CSSColorTypeSimpleSchema
      })
    ),
    secondary: maybeCSSColorTypeSimple(
      z.object({
        default: CSSImageTypeSchema.optional(),
        border: CSSColorTypeSchema.optional(),
        fallback: CSSColorTypeSimpleSchema
      })
    ),
    tertiary: maybeCSSColorTypeSimple(
      z.object({
        default: CSSImageTypeSchema.optional(),
        border: CSSColorTypeSchema.optional(),
        fallback: CSSColorTypeSimpleSchema
      })
    )
  }),
  ui: z.object({
    primary: maybeCSSColorTypeSimple(
      z.object({
        default: CSSColorTypeSchema.optional(),
        background: CSSImageTypeSchema.optional(),
        inactive: CSSColorTypeSchema.optional(),
        fallback: CSSColorTypeSimpleSchema
      })
    ),
    secondary: maybeCSSColorTypeSimple(
      z.object({
        default: CSSColorTypeSchema.optional(),
        background: CSSImageTypeSchema.optional(),
        inactive: CSSColorTypeSchema.optional(),
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

export type SpecificTheme = z.infer<typeof specificThemeSchema>
const specificThemeSchema = z.object({
  waveformColor: CSSColorTypeSchema,
  waveformGradation: CSSImageTypeSchema,

  navigationBarDesktopBackground: CSSImageTypeSchema,
  navigationBarMobileBackground: CSSImageTypeSchema,
  mainViewBackground: CSSImageTypeSchema,
  sideBarBackground: CSSImageTypeSchema
})

export type BrowserTheme = z.infer<typeof browserThemeSchema>
const browserThemeSchema = z.object({
  themeColor: CSSColorTypeSchema,
  colorScheme: z.string(),

  selectionText: CSSColorTypeSimpleSchema,
  selectionBackground: CSSColorTypeSchema,
  caret: CSSColorTypeSchema.optional(),

  scrollbarThumb: CSSColorTypeSchema,
  scrollbarThumbHover: CSSColorTypeSchema,
  scrollbarTrack: CSSColorTypeSchema
})

export type MarkdownDefaultTheme = z.infer<typeof markdownDefaultThemeSchema>
const markdownDefaultThemeSchema = z.enum(['auto', 'light', 'dark'])

export type MarkdownTheme = z.infer<typeof markdownThemeSchema>
const markdownThemeSchema = z.object({
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
  embedLinkText: CSSColorTypeSchema,
  embedLinkBackground: CSSColorTypeSchema,
  embedLinkHighlightText: CSSColorTypeSchema,
  embedLinkHighlightBackground: CSSColorTypeSchema
})

export type ExtendedOptionalMarkdownTheme = z.infer<
  typeof extendedOptionalMarkdownThemeSchema
>
const extendedOptionalMarkdownThemeSchema = z
  .object({
    extends: markdownDefaultThemeSchema
  })
  .merge(markdownThemeSchema.partial())

export type Theme = z.infer<typeof themeSchema>
export const themeSchema = z.object({
  version: z.literal(2),
  basic: basicThemeSchema,
  specific: specificThemeSchema.partial().optional(),
  browser: browserThemeSchema.partial().optional(),
  markdown: z
    .union([markdownDefaultThemeSchema, extendedOptionalMarkdownThemeSchema])
    .optional()
})
