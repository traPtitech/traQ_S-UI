// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Invocable = (...args: any[]) => any

export type MaybePromise<T> = T | Promise<T> | PromiseLike<T>

export type MaybeArray<T> = T | T[]
