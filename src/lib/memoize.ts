export const memoizeWithPurge = <Args extends unknown[], Return>(
  fn: (...args: Args) => Return
): { memoized: (...args: Args) => Return; purge: () => void } => {
  const cache = new Map<string, Return>()

  const memoized = (...args: Args) => {
    const key = JSON.stringify(args)
    const result = cache.get(key) ?? fn(...args)
    if (!cache.has(key)) cache.set(key, result)
    return result
  }

  const purge = (): void => {
    cache.clear()
  }

  return {
    memoized,
    purge
  }
}
