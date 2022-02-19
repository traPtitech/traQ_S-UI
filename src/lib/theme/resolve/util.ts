import { CSSColorType, CSSColorTypeSimple } from '/@/lib/theme/schema'

export type OnlyDefault<T> = {
  default: T
}

export const resolveOnlyDefault = (
  original: CSSColorTypeSimple
): OnlyDefault<CSSColorType> => ({ default: original })

export const passThroughOrResolve = <T>(
  original: T | string,
  f: (original: string) => T
): T => {
  if (typeof original === 'string') {
    return f(original)
  }
  return original
}

export const resolveWithFallback = <
  T extends { fallback: CSSColorTypeSimple },
  S
>(
  original: T | CSSColorTypeSimple,
  f: (originalObj: T | undefined, fallback: string) => S
) => {
  if (typeof original === 'string') {
    return f(undefined, original)
  }
  return f(original, original.fallback)
}
