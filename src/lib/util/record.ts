/**
 * オブジェクトの配列から特定のキーを用いたRecordを生成する
 * @param array 対象オブジェクトの配列
 * @param key Recordのキーにしたいオブジェクトのキー
 */
export const reduceToRecord = <T>(array: T[], key: keyof T) =>
  array.reduce((acc, cur) => {
    const ck = cur[key]
    if (typeof ck !== 'string') return acc
    return Object.assign(acc, { [ck]: cur })
  }, {} as Record<string, T>)

/**
 * オブジェクトの配列から重複を許す特定のキーを用いたRecordを生成する
 * @param array 対象オブジェクトの配列
 * @param key Recordのキーにしたいオブジェクトのキー
 */
export const reduceToRecordOfArray = <T>(array: T[], key: keyof T) =>
  array.reduce((acc, cur) => {
    const ck = cur[key]
    if (typeof ck !== 'string') return acc
    // eslint-disable-next-line no-prototype-builtins
    if (acc.hasOwnProperty(ck)) {
      acc[ck].push(cur)
      return acc
    }
    return Object.assign(acc, { [ck]: [cur] })
  }, {} as Record<string, T[]>)

export const formatSnakeKeysToCamelShallow = (obj: {}) => {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k.replace(/(_[a-zA-Z])/g, (_, char: string) => char.toUpperCase()),
      v
    ])
  )
}
