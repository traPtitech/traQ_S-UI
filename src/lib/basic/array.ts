/**
 * 一致するキーの一覧を返す
 * priorityが0のとき完全一致
 * 1のとき前方一致
 * 2のとき部分一致
 *
 * @param arr 検索対象のキーの配列
 * @param query lowercaseになっているクエリ
 * @param f キーから検索対象の文字列を取得する関数
 */
export const getMatchedWithPriority = <T>(
  arr: readonly T[],
  query: string,
  f: (v: T) => string[]
): { value: T; priority: number }[] => {
  const matchedValuesMap = new Map<T, { value: T; priority: number }>()

  for (const val of arr) {
    f(val)
      .map(v => v.toLowerCase())
      .forEach(valLower => {
        const p = matchedValuesMap.get(val)?.priority ?? 100
        if (valLower === query && p > 0) {
          matchedValuesMap.set(val, { value: val, priority: 0 })
        } else if (valLower.startsWith(query) && p > 1) {
          matchedValuesMap.set(val, { value: val, priority: 1 })
        } else if (valLower.includes(query) && p > 2) {
          matchedValuesMap.set(val, { value: val, priority: 2 })
        }
      })
  }

  return [...matchedValuesMap.values()]
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

export const unique = <T>(a: T[]) => [...new Set(a)]
