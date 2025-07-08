/**
 * オブジェクトの配列から特定のキーを用いたRecordを生成する
 * @param array 対象オブジェクトの配列
 * @param key Recordのキーにしたいオブジェクトのキー
 */
export const reduceToRecord = <T>(array: readonly T[], key: keyof T) =>
  array.reduce(
    (acc, cur) => {
      const ck = cur[key]
      if (typeof ck !== 'string') return acc
      return Object.assign(acc, { [ck]: cur })
    },
    {} as Record<string, T>
  )

/**
 * オブジェクトの配列から重複を許す特定のキーを用いたRecordを生成する
 * @param array 対象オブジェクトの配列
 * @param key Recordのキーにしたいオブジェクトのキー
 */
export const reduceToRecordOfArray = <T>(array: readonly T[], key: keyof T) =>
  array.reduce(
    (acc, cur) => {
      const ck = cur[key]
      if (typeof ck !== 'string') return acc
      if (Object.prototype.hasOwnProperty.call(acc, ck)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        acc[ck]!.push(cur)
        return acc
      }
      return Object.assign(acc, { [ck]: [cur] })
    },
    {} as Record<string, T[]>
  )

export const formatSnakeKeysToCamelShallow = (
  obj: Record<string, unknown>
): unknown => {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k.replace(/_([a-zA-Z])/g, (_, char: string) => char.toUpperCase()),
      v
    ])
  )
}
