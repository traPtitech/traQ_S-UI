type Entries<T> = Array<
  Exclude<
    {
      [K in keyof T]: [K, T[K]]
    }[keyof T],
    undefined
  >
>

export const entries = <T>(o: T) => Object.entries(o) as Entries<T>
export const setByTuple = <T, K extends keyof T>(s: T, [k, v]: [K, T[K]]) => {
  s[k] = v
}
export const overwrite = <T>(target: T, data: Partial<T>) => {
  entries(data).forEach(tuple => {
    setByTuple(target, tuple)
  })
}
