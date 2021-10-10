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
