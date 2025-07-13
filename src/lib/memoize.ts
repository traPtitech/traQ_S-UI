// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 汎用的に全ての関数を許容する
export const memoizeWithPurge = <T extends (...args: any[]) => any>(
  fn: T
): { memoized: T; purge: () => void } => {
  const cache = new Map<string, ReturnType<T>>()

  const memoized = ((...args: unknown[]) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T

  const purge = (): void => {
    cache.clear()
  }

  return {
    memoized,
    purge
  }
}
