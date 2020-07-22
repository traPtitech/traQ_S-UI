/**
 * 完全一致するキーの一覧と一致するキーの一覧を返す
 *
 * @param arr 検索対象のキーの配列
 * @param query lowercaseになっているクエリ
 */
export const getFullMatchedAndMatched = (
  arr: readonly string[],
  query: string
) => {
  const fullMatched: string[] = []
  const matched: string[] = []

  for (const val of arr) {
    const valLower = val.toLowerCase()
    if (valLower === query) {
      fullMatched.push(val)
    } else if (valLower.includes(query)) {
      matched.push(val)
    }
  }

  return { fullMatched, matched }
}

/**
 * 配列から指定したindexを含む周辺の複数個を取得する
 * countが2なら5つ取得
 *
 * @param arr 取得元の配列
 * @param index 取得するindex
 * @param count 前後の個数
 */
export const pickSomeAroundIndex = <T>(
  arr: readonly T[],
  index: number,
  count: number
): T[] => {
  const first = index - count
  const last = index + count

  if (first < 0) {
    return arr.slice(0, count * 2 + 1)
  }
  if (arr.length <= last) {
    return arr.slice(-(count * 2 + 1))
  }

  return arr.slice(first, last + 1)
}

export const isDefined = <T>(o: T): o is Exclude<T, undefined> => {
  return o !== undefined
}
