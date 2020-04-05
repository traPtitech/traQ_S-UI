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
    if (acc.hasOwnProperty(ck)) {
      acc[ck].push(cur)
      return acc
    }
    return Object.assign(acc, { [ck]: [cur] })
  }, {} as Record<string, T[]>)
