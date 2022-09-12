type Entries<T> = Array<
  Exclude<
    {
      [K in keyof T]: [K, T[K]]
    }[keyof T],
    undefined
  >
>

export const entries = <T extends object>(o: T) =>
  Object.entries(o) as Entries<T>
export const setByTuple = <T, K extends keyof T>(s: T, [k, v]: [K, T[K]]) => {
  s[k] = v
}
export const overwrite = <T>(target: T, data: Partial<T>) => {
  entries(data).forEach(tuple => {
    setByTuple(target, tuple)
  })
}

export const hasKey = <K extends string>(
  obj: object,
  key: K
): obj is { [k in K]: unknown } => key in obj

export const isObjectAndHasKey = <K extends string>(
  obj: unknown,
  key: K
): obj is { [k in K]: unknown } =>
  typeof obj === 'object' && obj !== null && hasKey(obj, key)
