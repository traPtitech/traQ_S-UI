/**
 * 取得中の処理があればその処理を行わずに実行中の処理が完了した結果を受け取る
 *
 * argsをJSON.stringifyした結果が一致していたら同じ結果を利用する
 *
 * 作られた関数は元の結果と共に、ほかの取得の結果を利用したかどうかが帰ってくる
 */
export const createSingleflight = <T extends unknown[], S>(
  func: (...args: T) => Promise<S>
): ((...args: T) => Promise<[S, boolean]>) => {
  // キーはargsをJSON.stringifyしたもの
  const cacheMap = new Map<string, Promise<S>>()

  return async (...args) => {
    const key = JSON.stringify(args)
    if (cacheMap.has(key)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const res = await cacheMap.get(key)!
      return [res, true]
    }

    const promise = func(...args)
    cacheMap.set(key, promise)
    const res = await promise
    return [res, false]
  }
}
