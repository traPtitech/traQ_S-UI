import type { MaybePromise } from '/@/types/utility'

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
      const promise = cacheMap.get(key)!
      const res = await promise
      return [res, true]
    }

    const promise = func(...args)
    cacheMap.set(key, promise)
    try {
      const res = await promise
      return [res, false]
    } finally {
      // promiseがresolveまたはrejectしたときはpromiseをmapから取り出し済みなので消してよい
      // ここで消さないと取得し直しがされない
      cacheMap.delete(key)
    }
  }
}

type Task<T> = {
  promise: Promise<T>
  resolve: (val: T) => void
}

export const createMutex = () => {
  const queue: Task<void>[] = []

  const createTask = <T>(): Task<T> => {
    let resolve!: (v: MaybePromise<T>) => void
    const promise = new Promise<T>(res => {
      resolve = res
    })
    return { promise, resolve }
  }

  const lock = async () => {
    const last = queue.at(-1)
    queue.push(createTask())
    await last?.promise
  }

  const unlock = () => {
    if (!queue[0]) {
      throw new Error('mutex: tried to unlock unlocked mutex.')
    }
    queue[0].resolve()
    queue.shift()
  }

  return { lock, unlock }
}

/** 共有している処理は中止せず、この呼び出しで結果を待つことだけを中止する。 */
export const waitWithAbort = <T>(
  promise: Promise<T>,
  signal: AbortSignal
): Promise<T> =>
  new Promise((resolve, reject) => {
    const onAbort = () => reject(signal.reason)
    if (signal.aborted) onAbort()
    else signal.addEventListener('abort', onAbort, { once: true })
    promise.then(
      value => {
        signal.removeEventListener('abort', onAbort)
        if (signal.aborted) reject(signal.reason)
        else resolve(value)
      },
      error => {
        signal.removeEventListener('abort', onAbort)
        reject(signal.aborted ? signal.reason : error)
      }
    )
  })
