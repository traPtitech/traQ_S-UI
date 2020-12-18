/**
 * オブジェクトの配列から特定のキーを用いたMapを生成する
 * @param array 対象オブジェクトの配列
 * @param key Mapのキーにしたいオブジェクトのキー
 */
export const arrayToMap = <T, K extends keyof T>(
  array: readonly T[],
  key: K
) => {
  const map = new Map<T[K], T>()
  array.forEach(cur => {
    map.set(cur[key], cur)
  })
  return map
}
