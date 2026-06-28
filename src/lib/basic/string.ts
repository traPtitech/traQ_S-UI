/** 文字列を比較する
 *
 *  `undefined`を渡した場合は空文字列として扱う
 */
export const compareString = (
  str1?: string,
  str2?: string,
  inverse = false
) => {
  const _str1 = str1 ?? ''
  const _str2 = str2 ?? ''
  const _inv = inverse ? -1 : 1
  return _str1 < _str2 ? -_inv : _str1 > _str2 ? _inv : 0
}

export const compareStringInsensitive = (
  str1?: string,
  str2?: string,
  inverse?: boolean
) => compareString(str1?.toLowerCase(), str2?.toLowerCase(), inverse)

/**
 * 文字列に特定の文字が含まれている数をカウントする
 */
export const count = (str: string, char: string) =>
  [...str].reduce((acc, c) => (c === char ? acc + 1 : acc), 0)

/**
 * CodePointの数をカウントする
 */
export const countLength = (text: string) => Array.from(text).length

/**
 * `position`から前方向に検索を始め、`searchStrings`のいずれかが最後に現れたインデックスを返す
 */
export const lastIndexOf = (
  target: string,
  searchStrings: readonly [string, ...string[]],
  position?: number
) =>
  Math.max(
    ...searchStrings.map(searchString =>
      target.lastIndexOf(searchString, position)
    )
  )

/**
 * strからendを取り除いた文字列を返す
 * endがstrの最後に存在しなかった場合は何もしない
 */
export const trimEnd = (str: string, end: string) => {
  if (str.endsWith(end)) {
    return str.slice(0, -end.length)
  }
  return str
}

const INVISIBLE_CHARACTERS = {
  basic: [
    0x000b, // VERTICAL_TABULATION
    0x200b, // ZERO_WIDTH_SPACE
    0x2028, // LINE_SEPARATOR
    0x2029, // PARAGRAPH_SEPARATOR
    0x2061, // FUNCTION_APPLICATION
    0x2062, // INVISIBLE_TIMES
    0x2063, // INVISIBLE_SEPARATOR
    0xfeff // ZERO_WIDTH_NO_BREAK_SPACE
  ],
  joiner: [
    0x034f, // COMBINING_GRAPHEME_JOINER
    0x200c, // ZERO_WIDTH_NON_JOINER
    0x200d // ZERO_WIDTH_JOINER
  ],
  directional: [
    0x200e, // LEFT_TO_RIGHT_MARK
    0x200f, // RIGHT_TO_LEFT_MARK
    0x202a, // LEFT_TO_RIGHT_EMBEDDING
    0x202b, // RIGHT_TO_LEFT_EMBEDDING
    0x202c, // POP_DIRECTIONAL_FORMATTING
    0x202d, // LEFT_TO_RIGHT_OVERRIDE
    0x202e // RIGHT_TO_LEFT_OVERRIDE
  ]
} as const

export const makeInvisibleCharactersRemover = (
  options: Partial<Record<keyof typeof INVISIBLE_CHARACTERS, boolean>> = {}
) => {
  type Keys = keyof typeof INVISIBLE_CHARACTERS
  const defaultOptions = { basic: true }

  const targets = Object.entries({ ...defaultOptions, ...options })
    .filter(([_, value]) => value)
    .map(([key]) => INVISIBLE_CHARACTERS[key as Keys])
    .flat() as number[]

  return (text: string) =>
    [...text]
      .filter(c => !targets.includes(c.codePointAt(0) as number))
      .join('')
}
