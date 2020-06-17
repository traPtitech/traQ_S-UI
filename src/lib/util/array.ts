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

export const isDefined = <T>(o: T | undefined): o is T => {
  return o !== undefined
}
